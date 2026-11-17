/**
 * Học Viện Phú Thọ (Phu Tho Academy) - Canvas Rendering & World Controller
 * Handles camera, procedural graphics, player animation, pathfinding, and interactive HUD.
 */

import {
  MAP_CONFIG,
  POI_LOCATIONS,
  DEFAULT_NPCS,
  CUSTOMIZATION_OPTIONS,
  createDefaultPlayer,
  checkProximityPOI,
  isSpecialZoneUnlocked,
  SoundController,
  AcademyNetworkManager,
  clamp
} from './academy.mjs';
import { MINIGAME_DATA } from './minigames.mjs';

class AcademyGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundController();

    // Load saved or default player
    const saved = this.loadLocalPlayer();
    this.player = createDefaultPlayer(saved);

    // Camera
    this.camera = {
      x: this.player.x - window.innerWidth / 2,
      y: this.player.y - window.innerHeight / 2,
      targetX: this.player.x - window.innerWidth / 2,
      targetY: this.player.y - window.innerHeight / 2,
    };

    // World & NPCs
    this.npcs = DEFAULT_NPCS.map(n => ({
      ...n,
      currentMessage: null,
      messageTimeout: null,
      bobOffset: Math.random() * Math.PI * 2
    }));

    // Other online players
    this.remotePlayers = new Map();

    // Chat and speech bubbles
    this.speechBubbles = new Map(); // id -> { text, expireAt }

    // Particles & effects
    this.clickRipples = [];
    this.particles = [];

    // Controls
    this.keys = {};
    this.mouse = { down: false, worldX: 0, worldY: 0 };
    this.activePOI = null;

    // Network
    this.net = new AcademyNetworkManager(
      this.player,
      (remoteMap) => {
        // Merge updates
        for (const [id, data] of remoteMap.entries()) {
          this.remotePlayers.set(id, data);
        }
      },
      (chatMsg) => {
        this.addChatMessage(chatMsg.name, chatMsg.school, chatMsg.text);
        this.showSpeechBubble(chatMsg.id, chatMsg.text);
        this.sound.playChat();
      },
      (interaction) => {
        this.handleRemoteInteraction(interaction);
      }
    );

    // Initialize UI and loop
    this.setupViewport();
    this.setupInputs();
    this.setupUI();
    this.setupNPCBehavior();

    // Connect to WebSocket / Peer channel
    this.net.connect();

    // Start loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLocalPlayer() {
    try {
      const raw = localStorage.getItem('phutho_academy_player');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {};
  }

  savePlayerState() {
    try {
      localStorage.setItem('phutho_academy_player', JSON.stringify({
        id: this.player.id,
        name: this.player.name,
        school: this.player.school,
        skin: this.player.skin,
        hair: this.player.hair,
        hairColor: this.player.hairColor,
        outfit: this.player.outfit,
        accessory: this.player.accessory,
        points: this.player.points,
        clearedGames: this.player.clearedGames,
        specialUnlocked: this.player.specialUnlocked,
      }));
    } catch (_) {}
  }

  setupViewport() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setupInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'e' || e.key === 'E') {
        this.triggerPOIInteraction();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mouse / Tap to move
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickWorldX = e.clientX - rect.left + this.camera.x;
      const clickWorldY = e.clientY - rect.top + this.camera.y;

      // Check if clicked on a player or NPC
      const targetEntity = this.findEntityAt(clickWorldX, clickWorldY);
      if (targetEntity) {
        this.openPlayerProfile(targetEntity);
        return;
      }

      this.player.targetX = clamp(clickWorldX, 60, MAP_CONFIG.width - 60);
      this.player.targetY = clamp(clickWorldY, 60, MAP_CONFIG.height - 60);
      this.addRipple(clickWorldX, clickWorldY);
      this.sound.playClick();
    });

    // Touch support (tap to move)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const clickWorldX = touch.clientX - rect.left + this.camera.x;
        const clickWorldY = touch.clientY - rect.top + this.camera.y;

        const targetEntity = this.findEntityAt(clickWorldX, clickWorldY);
        if (targetEntity) {
          this.openPlayerProfile(targetEntity);
          return;
        }

        this.player.targetX = clamp(clickWorldX, 60, MAP_CONFIG.width - 60);
        this.player.targetY = clamp(clickWorldY, 60, MAP_CONFIG.height - 60);
        this.addRipple(clickWorldX, clickWorldY);
        this.sound.playClick();
      }
    }, { passive: true });
  }

  setupNPCBehavior() {
    // NPCs periodically say helpful friendly things
    setInterval(() => {
      const npc = this.npcs[Math.floor(Math.random() * this.npcs.length)];
      if (npc && npc.messages && npc.messages.length > 0) {
        const msg = npc.messages[Math.floor(Math.random() * npc.messages.length)];
        this.showSpeechBubble(npc.id, msg, 7000);
      }
    }, 8000);
  }

  setupUI() {
    // HUD Player Card & points
    this.updateHUD();

    // Sound toggle
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.sound.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 Đã tắt âm' : '🔊 Âm thanh';
      });
    }

    // Customization Modal
    const customizeBtn = document.getElementById('customizeBtn');
    const customModal = document.getElementById('customizeModal');
    const closeCustomBtn = document.getElementById('closeCustomModal');
    const saveCustomBtn = document.getElementById('saveCustomBtn');

    if (customizeBtn && customModal) {
      customizeBtn.addEventListener('click', () => {
        this.populateCustomizationForm();
        customModal.classList.remove('hidden');
      });
    }
    if (closeCustomBtn && customModal) {
      closeCustomBtn.addEventListener('click', () => customModal.classList.add('hidden'));
    }
    if (saveCustomBtn && customModal) {
      saveCustomBtn.addEventListener('click', () => {
        this.applyCustomizationForm();
        customModal.classList.add('hidden');
        this.savePlayerState();
        this.updateHUD();
        this.net.send({
          type: 'customization',
          name: this.player.name,
          school: this.player.school,
          skin: this.player.skin,
          hair: this.player.hair,
          hairColor: this.player.hairColor,
          outfit: this.player.outfit,
          accessory: this.player.accessory
        });
        this.sound.playSuccess();
      });
    }

    // Chat form
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          this.net.broadcastChat(text);
          this.addChatMessage(this.player.name, this.player.school, text, true);
          this.showSpeechBubble(this.player.id, text);
          this.sound.playChat();
          chatInput.value = '';
        }
      });
    }

    // Quick emoji bar
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji') || btn.textContent;
        this.net.broadcastChat(emoji);
        this.addChatMessage(this.player.name, this.player.school, emoji, true);
        this.showSpeechBubble(this.player.id, emoji);
        this.sound.playChat();
      });
    });

    // Minimap toggle
    const mapBtn = document.getElementById('mapBtn');
    const directoryModal = document.getElementById('directoryModal');
    const closeDirBtn = document.getElementById('closeDirBtn');
    if (mapBtn && directoryModal) {
      mapBtn.addEventListener('click', () => directoryModal.classList.remove('hidden'));
    }
    if (closeDirBtn && directoryModal) {
      closeDirBtn.addEventListener('click', () => directoryModal.classList.add('hidden'));
    }

    // Leaderboard button
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const closeLbBtn = document.getElementById('closeLbBtn');
    if (leaderboardBtn && leaderboardModal) {
      leaderboardBtn.addEventListener('click', () => {
        this.renderLeaderboard();
        leaderboardModal.classList.remove('hidden');
      });
    }
    if (closeLbBtn && leaderboardModal) {
      closeLbBtn.addEventListener('click', () => leaderboardModal.classList.add('hidden'));
    }

    // Action button for mobile/touch
    const actionBtn = document.getElementById('actionBtn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => this.triggerPOIInteraction());
    }
  }

  updateHUD() {
    const nameEl = document.getElementById('hudPlayerName');
    const schoolEl = document.getElementById('hudPlayerSchool');
    const pointsEl = document.getElementById('hudPoints');
    const badgeEl = document.getElementById('hudBadge');

    if (nameEl) nameEl.textContent = this.player.name;
    if (schoolEl) schoolEl.textContent = this.player.school;
    if (pointsEl) pointsEl.textContent = `${this.player.points} ⭐`;
    if (badgeEl) {
      const unlocked = isSpecialZoneUnlocked(this.player);
      badgeEl.textContent = unlocked ? '👑 Học Giả Tinh Hoa' : '🌱 Học Sinh Năng Động';
      badgeEl.className = unlocked ? 'badge elite' : 'badge active';
    }
  }

  populateCustomizationForm() {
    const nameInput = document.getElementById('customName');
    const schoolSelect = document.getElementById('customSchool');
    if (nameInput) nameInput.value = this.player.name;
    if (schoolSelect) schoolSelect.value = this.player.school;

    // Radios
    ['skin', 'hair', 'hairColor', 'outfit', 'accessory'].forEach(prop => {
      const current = this.player[prop];
      const radio = document.querySelector(`input[name="custom_${prop}"][value="${current}"]`);
      if (radio) radio.checked = true;
    });
  }

  applyCustomizationForm() {
    const nameInput = document.getElementById('customName');
    const schoolSelect = document.getElementById('customSchool');
    if (nameInput && nameInput.value.trim()) this.player.name = nameInput.value.trim().slice(0, 24);
    if (schoolSelect) this.player.school = schoolSelect.value;

    ['skin', 'hair', 'hairColor', 'outfit', 'accessory'].forEach(prop => {
      const checked = document.querySelector(`input[name="custom_${prop}"]:checked`);
      if (checked) this.player[prop] = checked.value;
    });
  }

  addChatMessage(name, school, text, isSelf = false) {
    const box = document.getElementById('chatMessages');
    if (!box) return;

    const row = document.createElement('div');
    row.className = `chat-msg ${isSelf ? 'self' : ''}`;
    row.innerHTML = `<span class="tag">[${this.escapeHtml(school)}]</span> <strong>${this.escapeHtml(name)}:</strong> ${this.escapeHtml(text)}`;
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;

    // Limit chat log
    while (box.children.length > 50) {
      box.removeChild(box.firstChild);
    }
  }

  showSpeechBubble(entityId, text, duration = 6000) {
    this.speechBubbles.set(entityId, {
      text,
      expireAt: performance.now() + duration
    });
  }

  addRipple(x, y) {
    this.clickRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 36,
      alpha: 1
    });
  }

  findEntityAt(worldX, worldY) {
    // Check NPCs
    for (const npc of this.npcs) {
      if (Math.hypot(worldX - npc.x, worldY - npc.y) < 32) {
        return { type: 'npc', data: npc };
      }
    }
    // Check remote players
    for (const [_, p] of this.remotePlayers.entries()) {
      if (Math.hypot(worldX - p.x, worldY - p.y) < 32) {
        return { type: 'remote_player', data: p };
      }
    }
    return null;
  }

  openPlayerProfile(entity) {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    const { data } = entity;

    document.getElementById('profileName').textContent = data.name;
    document.getElementById('profileSchool').textContent = data.school;
    document.getElementById('profilePoints').textContent = `${data.points || 0} ⭐ Sao Danh Dự`;

    // Action buttons
    const emoteWave = document.getElementById('emoteWave');
    const emoteHeart = document.getElementById('emoteHeart');
    const emoteClap = document.getElementById('emoteClap');

    const sendEmote = (emote, label) => {
      this.net.broadcastInteraction(data.id, emote);
      this.showSpeechBubble(this.player.id, `${label} ${data.name}!`);
      this.addChatMessage(this.player.name, this.player.school, `${label} gửi tới ${data.name}!`, true);
      this.sound.playSuccess();
      modal.classList.add('hidden');
    };

    if (emoteWave) emoteWave.onclick = () => sendEmote('wave', '👋 Vẫy tay chào');
    if (emoteHeart) emoteHeart.onclick = () => sendEmote('heart', '❤️ Thả tim');
    if (emoteClap) emoteClap.onclick = () => sendEmote('clap', '👏 Vỗ tay khen ngợi');

    const closeBtn = document.getElementById('closeProfileBtn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

    modal.classList.remove('hidden');
  }

  handleRemoteInteraction(interaction) {
    if (interaction.targetId === this.player.id) {
      const emojis = { wave: '👋', heart: '❤️', clap: '👏' };
      const icon = emojis[interaction.action] || '✨';
      this.showSpeechBubble(this.player.id, `${icon} Cảm ơn bạn ${interaction.fromName}!`);
      this.addChatMessage(interaction.fromName, 'Bạn', `${icon} đã tương tác với bạn!`);
      this.sound.playSuccess();
    }
  }

  triggerPOIInteraction() {
    if (!this.activePOI) return;
    const poi = this.activePOI;

    if (poi.category === 'game') {
      this.openMinigame(poi.gameType, poi);
    } else if (poi.category === 'special_zone') {
      const unlocked = isSpecialZoneUnlocked(this.player);
      if (unlocked) {
        this.openMinigame('olympiad', poi);
      } else {
        this.showSpecialLockedModal(poi);
      }
    } else if (poi.category === 'landmark' || poi.category === 'welcome' || poi.category === 'social') {
      this.showSpeechBubble(this.player.id, `Đang ở ${poi.name}: ${poi.desc}`, 5000);
      this.sound.playClick();
    }
  }

  showSpecialLockedModal(poi) {
    const modal = document.getElementById('specialLockModal');
    if (!modal) return;
    const reqText = document.getElementById('lockReqText');
    const curStars = this.player.points || 0;
    const completedCount = Object.keys(this.player.clearedGames || {}).length;

    if (reqText) {
      reqText.innerHTML = `
        <div style="margin: 12px 0; text-align: left; background: #fffbeb; padding: 12px; border-radius: 12px; border: 1px solid #fde68a;">
          <p><strong>Cổng Tháp Học Giả Tinh Hoa đang phong ấn phép thuật! 🔒</strong></p>
          <p>Để mở khóa, bạn cần đạt 1 trong 2 điều kiện:</p>
          <ul>
            <li>⭐ Đạt tối thiểu <strong>50 Sao Danh Dự</strong> (Hiện có: <strong>${curStars}/50</strong>)</li>
            <li>🎯 Hoặc hoàn thành thử thách ở <strong>3 trạm khác nhau</strong> (Hiện đạt: <strong>${completedCount}/3</strong>)</li>
          </ul>
          <p><em>Hãy dạo quanh các tòa nhà A, B, Thư viện, Sân bóng để thử sức nhé!</em></p>
        </div>
      `;
    }

    const closeBtn = document.getElementById('closeLockBtn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    modal.classList.remove('hidden');
    this.sound.playClick();
  }

  openMinigame(gameType, poi) {
    const gameDef = MINIGAME_DATA[gameType];
    if (!gameDef) return;

    const modal = document.getElementById('minigameModal');
    if (!modal) return;

    document.getElementById('minigameTitle').textContent = gameDef.title;
    document.getElementById('minigameInstructions').textContent = gameDef.instructions;

    const container = document.getElementById('minigameContainer');
    container.innerHTML = '';

    // Play 3 random questions
    let currentIdx = 0;
    let score = 0;
    const questions = [...gameDef.questions].sort(() => 0.5 - Math.random()).slice(0, 3);

    const renderQuestion = () => {
      container.innerHTML = '';
      if (currentIdx >= questions.length) {
        // Complete!
        const earned = poi.rewardPoints || 20;
        this.player.points += earned;
        this.player.clearedGames[gameType] = true;
        if (isSpecialZoneUnlocked(this.player)) {
          this.player.specialUnlocked = true;
        }
        this.savePlayerState();
        this.updateHUD();
        this.net.broadcastScore(earned, this.player.specialUnlocked);
        this.sound.playSuccess();

        container.innerHTML = `
          <div class="game-result">
            <div style="font-size: 48px; margin-bottom: 8px;">🎉🏆🌟</div>
            <h3>Xuất sắc hoàn thành thử thách!</h3>
            <p>Bạn đã trả lời đúng <strong>${score}/${questions.length}</strong> câu hỏi!</p>
            <div class="reward-box">+${earned} ⭐ Sao Danh Dự</div>
            ${gameType === 'olympiad' ? '<p class="elite-banner">👑 Chúc mừng bạn đã chinh phục Đỉnh Cao Tinh Hoa Phú Thọ!</p>' : ''}
            <button id="finishGameBtn" class="btn primary-btn" style="margin-top: 16px;">Nhận Thưởng & Trở Về Sân Trường</button>
          </div>
        `;

        document.getElementById('finishGameBtn').onclick = () => {
          modal.classList.add('hidden');
        };
        return;
      }

      const q = questions[currentIdx];
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-block';
      qDiv.innerHTML = `
        <div class="q-progress">Câu hỏi ${currentIdx + 1} / ${questions.length}</div>
        <div class="q-title">${this.escapeHtml(q.question)}</div>
        <div class="q-options">
          ${q.options.map((opt, i) => `
            <button class="opt-btn" data-index="${i}">${String.fromCharCode(65 + i)}. ${this.escapeHtml(opt)}</button>
          `).join('')}
        </div>
        <div id="qFeedback" class="q-feedback hidden"></div>
      `;

      container.appendChild(qDiv);

      const optBtns = qDiv.querySelectorAll('.opt-btn');
      optBtns.forEach(btn => {
        btn.onclick = () => {
          optBtns.forEach(b => b.disabled = true);
          const chosen = Number(btn.getAttribute('data-index'));
          const feedback = document.getElementById('qFeedback');
          feedback.classList.remove('hidden');

          if (chosen === q.answer) {
            score++;
            btn.classList.add('correct');
            feedback.innerHTML = `<span style="color:#059669; font-weight: bold;">✔ Chính xác!</span> ${this.escapeHtml(q.explanation)}`;
            this.sound.playSuccess();
          } else {
            btn.classList.add('wrong');
            optBtns[q.answer].classList.add('correct');
            feedback.innerHTML = `<span style="color:#dc2626; font-weight: bold;">✘ Chưa đúng!</span> ${this.escapeHtml(q.explanation)}`;
            this.sound.playClick();
          }

          setTimeout(() => {
            currentIdx++;
            renderQuestion();
          }, 1800);
        };
      });
    };

    renderQuestion();

    const closeBtn = document.getElementById('closeMinigameBtn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

    modal.classList.remove('hidden');
    this.sound.playClick();
  }

  renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;

    // Combine local player, remote players, and NPCs for full bustling competition
    const all = [
      { name: this.player.name, school: this.player.school, points: this.player.points, isSelf: true },
      ...Array.from(this.remotePlayers.values()).map(p => ({
        name: p.name,
        school: p.school,
        points: p.points || 0,
        isSelf: false
      })),
      { name: 'Nguyễn Minh Anh', school: 'TH Phú Thọ', points: 180, isSelf: false },
      { name: 'Trần Gia Bảo', school: 'TH Chu Văn An', points: 155, isSelf: false },
      { name: 'Lê Hoàng Nam', school: 'TH Phú Thọ', points: 140, isSelf: false },
      { name: 'Phạm Quỳnh Chi', school: 'TH Kim Đồng', points: 125, isSelf: false },
      { name: 'Vũ Đăng Khoa', school: 'TH Lê Quý Đôn', points: 110, isSelf: false },
    ];

    all.sort((a, b) => b.points - a.points);

    list.innerHTML = all.map((item, idx) => `
      <div class="lb-row ${item.isSelf ? 'lb-self' : ''}">
        <div class="lb-rank">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</div>
        <div class="lb-info">
          <div class="lb-name">${this.escapeHtml(item.name)} ${item.isSelf ? '<em>(Bạn)</em>' : ''}</div>
          <div class="lb-school">${this.escapeHtml(item.school)}</div>
        </div>
        <div class="lb-points">${item.points} ⭐</div>
      </div>
    `).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // GAME LOOP
  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Player Movement via Keys
    let moveX = 0;
    let moveY = 0;
    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      this.player.x += moveX * this.player.speed * dt;
      this.player.y += moveY * this.player.speed * dt;
      this.player.targetX = this.player.x;
      this.player.targetY = this.player.y;
      this.player.moving = true;

      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.player.direction = moveX > 0 ? 'right' : 'left';
      } else {
        this.player.direction = moveY > 0 ? 'down' : 'up';
      }
    } else {
      // Mouse Click-to-move
      const dx = this.player.targetX - this.player.x;
      const dy = this.player.targetY - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const step = Math.min(dist, this.player.speed * dt);
        this.player.x += (dx / dist) * step;
        this.player.y += (dy / dist) * step;
        this.player.moving = true;

        if (Math.abs(dx) > Math.abs(dy)) {
          this.player.direction = dx > 0 ? 'right' : 'left';
        } else {
          this.player.direction = dy > 0 ? 'down' : 'up';
        }
      } else {
        this.player.moving = false;
      }
    }

    // Boundaries
    this.player.x = clamp(this.player.x, 60, MAP_CONFIG.width - 60);
    this.player.y = clamp(this.player.y, 60, MAP_CONFIG.height - 60);

    // Anim frame
    if (this.player.moving) {
      this.player.animFrame += dt * 8;
    } else {
      this.player.animFrame = 0;
    }

    // Broadcast position to peers
    if (this.player.moving) {
      this.net.broadcastMove(this.player.x, this.player.y, this.player.direction, 'walk');
    }

    // Check POI Proximity
    const prox = checkProximityPOI(this.player.x, this.player.y);
    const promptEl = document.getElementById('interactionPrompt');
    const actionBtn = document.getElementById('actionBtn');

    if (prox) {
      this.activePOI = prox.poi;
      if (promptEl) {
        promptEl.classList.remove('hidden');
        promptEl.innerHTML = `Nhấn <strong>[E]</strong> hoặc chạm để vào: <strong>${prox.poi.name}</strong>`;
      }
      if (actionBtn) {
        actionBtn.classList.remove('hidden');
        actionBtn.textContent = `Vào ${prox.poi.icon}`;
      }
    } else {
      this.activePOI = null;
      if (promptEl) promptEl.classList.add('hidden');
      if (actionBtn) actionBtn.classList.add('hidden');
    }

    // Camera follow (lerp)
    const targetCamX = this.player.x - this.canvas.width / 2;
    const targetCamY = this.player.y - this.canvas.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;
    this.camera.x = clamp(this.camera.x, 0, Math.max(0, MAP_CONFIG.width - this.canvas.width));
    this.camera.y = clamp(this.camera.y, 0, Math.max(0, MAP_CONFIG.height - this.canvas.height));

    // Update ripples
    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const r = this.clickRipples[i];
      r.radius += dt * 50;
      r.alpha = 1 - (r.radius / r.maxRadius);
      if (r.alpha <= 0) {
        this.clickRipples.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Draw Campus Background (Grass, Paths, Campus Buildings)
    this.renderCampus(ctx);

    // 2. Click Ripples
    this.renderRipples(ctx);

    // 3. Draw Entities (Sorted by Y for depth layering)
    const renderList = [
      { type: 'local', y: this.player.y, entity: this.player },
      ...this.npcs.map(n => ({ type: 'npc', y: n.y, entity: n })),
      ...Array.from(this.remotePlayers.values()).map(p => ({ type: 'remote', y: p.y, entity: p })),
    ];
    renderList.sort((a, b) => a.y - b.y);

    for (const item of renderList) {
      if (item.type === 'local') {
        this.renderCharacter(ctx, this.player, true);
      } else if (item.type === 'npc') {
        this.renderCharacter(ctx, item.entity, false, true);
      } else if (item.type === 'remote') {
        this.renderCharacter(ctx, item.entity, false, false);
      }
    }

    // 4. Speech Bubbles
    this.renderSpeechBubbles(ctx);

    ctx.restore();
  }

  renderCampus(ctx) {
    // Lush green ground
    ctx.fillStyle = '#bbf7d0';
    ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);

    // Subtle checkered lawn stripes
    ctx.fillStyle = '#a7f3d0';
    for (let y = 0; y < MAP_CONFIG.height; y += 120) {
      ctx.fillRect(0, y, MAP_CONFIG.width, 60);
    }

    // Broad Brick Walking Pavements
    ctx.fillStyle = '#fef3c7'; // warm stone
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;

    // Main Avenue (from Gate to Fountain and Flagpole)
    ctx.fillRect(1220, 300, 160, 1500);
    ctx.strokeRect(1220, 300, 160, 1500);

    // Horizontal Pathway connecting Wings
    ctx.fillRect(500, 810, 1600, 120);
    ctx.strokeRect(500, 810, 1600, 120);

    // Path to Sports Court & Tech Lab
    ctx.fillRect(500, 1340, 1600, 100);
    ctx.strokeRect(500, 1340, 1600, 100);

    // Draw POIs
    for (const poi of POI_LOCATIONS) {
      this.renderPOI(ctx, poi);
    }
  }

  renderPOI(ctx, poi) {
    ctx.save();
    ctx.translate(poi.x, poi.y);

    if (poi.id === 'gate') {
      // Cổng trường Tiểu Học Phú Thọ
      ctx.fillStyle = '#dc2626'; // Đỏ tươi
      ctx.fillRect(-140, -40, 280, 24);
      // Hai cột trụ cổng
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-150, -40, 30, 80);
      ctx.fillRect(120, -40, 30, 80);

      // Bảng tên trường
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TRƯỜNG TIỂU HỌC PHÚ THỌ', 0, -22);

      // Cờ Việt Nam nhỏ ở hai trụ
      this.drawMiniFlag(ctx, -135, -55);
      this.drawMiniFlag(ctx, 135, -55);
    } else if (poi.id === 'flagpole') {
      // Cột cờ Lễ Đài
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Cột cờ kim loại
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -90);
      ctx.stroke();

      // Lá cờ đỏ sao vàng tung bay
      const wave = Math.sin(performance.now() / 250) * 4;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.lineTo(44, -85 + wave);
      ctx.lineTo(44, -60 + wave);
      ctx.lineTo(0, -65);
      ctx.closePath();
      ctx.fill();

      // Ngôi sao vàng
      ctx.fillStyle = '#facc15';
      ctx.font = '16px sans-serif';
      ctx.fillText('★', 18, -70 + wave);
    } else if (poi.id === 'fountain') {
      // Đài phun nước hòa bình
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Bọt nước phun
      const wave = Math.sin(performance.now() / 200) * 8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -10 + wave, 12, 0, Math.PI * 2);
      ctx.fill();

      // Bồ câu biểu tượng
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕊️', 0, 5);
    } else if (poi.id === 'building_a') {
      // Tòa Nhà Toán Học (Wing A)
      this.drawBuilding(ctx, -140, -90, 280, 180, '#38bdf8', '#0284c7', 'TÒA A - TOÁN HỌC 🧮');
    } else if (poi.id === 'library') {
      // Thư Viện Tri Thức (Nhà B)
      this.drawBuilding(ctx, -140, -90, 280, 180, '#fbbf24', '#d97706', 'THƯ VIỆN TRI THỨC 📚');
    } else if (poi.id === 'tech_lab') {
      // Phòng Tin Học
      this.drawBuilding(ctx, -130, -80, 260, 160, '#34d399', '#059669', 'PHÒNG TIN HỌC 💻');
    } else if (poi.id === 'sports_field') {
      // Sân Bóng Mini
      ctx.fillStyle = '#22c55e'; // cỏ sân bóng
      ctx.fillRect(-160, -90, 320, 180);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(-160, -90, 320, 180);

      // Đường giữa sân và vòng tròn giao bóng
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.lineTo(0, 90);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();

      // Khung thành 2 bên
      ctx.strokeRect(-160, -35, 30, 70);
      ctx.strokeRect(130, -35, 30, 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SÂN BÓNG ĐÁ PHÚ THỌ ⚽', 0, -65);
    } else if (poi.id === 'eco_garden') {
      // Vườn sinh thái
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Cây táo & cá koi
      ctx.font = '28px sans-serif';
      ctx.fillText('🌳', -35, -20);
      ctx.fillText('🍎', -25, -30);
      ctx.fillText('🍎', -50, -10);
      ctx.fillText('🌳', 35, -20);
      ctx.fillText('🍎', 45, -30);

      // Hồ cá nhỏ
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, 35, 45, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.fillText('🐟', -10, 42);
      ctx.fillText('🐠', 12, 38);

      ctx.fillStyle = '#14532d';
      ctx.font = 'bold 14px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VƯỜN SINH THÁI 🍎', 0, -60);
    } else if (poi.id === 'special_zone') {
      // KHU VỰC ĐẶC BIỆT: THÁP HỌC GIẢ TINH HOA
      const unlocked = isSpecialZoneUnlocked(this.player);
      const pulse = Math.sin(performance.now() / 300) * 6;

      // Aura lộng lẫy
      const grad = ctx.createRadialGradient(0, 0, 30, 0, 0, 130 + pulse);
      grad.addColorStop(0, unlocked ? 'rgba(250, 204, 21, 0.6)' : 'rgba(148, 163, 184, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 130 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Cổng vòm vàng ánh kim
      ctx.strokeStyle = unlocked ? '#eab308' : '#64748b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, -20, 85, Math.PI, 0, false);
      ctx.stroke();

      // Tòa tháp vàng
      this.drawBuilding(ctx, -100, -110, 200, 150, unlocked ? '#fef08a' : '#cbd5e1', unlocked ? '#ca8a04' : '#475569', unlocked ? 'THÁP TINH HOA 👑' : 'KHU KHÓA 🔒');

      // Floating badge
      ctx.fillStyle = unlocked ? '#ca8a04' : '#475569';
      ctx.font = 'bold 15px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(unlocked ? '✨ MỞ KHÓA TINH HOA ✨' : '🔒 CẦN 50 SAO ĐỂ MỞ', 0, 70);
    }

    // Active POI indicator ring
    if (this.activePOI && this.activePOI.id === poi.id) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, poi.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  drawBuilding(ctx, x, y, w, h, roofColor, wallColor, label) {
    // Mái ngói
    ctx.fillStyle = roofColor;
    ctx.fillRect(x, y, w, 35);
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, 35);

    // Tường nhà
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 10, y + 35, w - 20, h - 35);
    ctx.strokeRect(x + 10, y + 35, w - 20, h - 35);

    // Cửa chính
    ctx.fillStyle = wallColor;
    ctx.fillRect(x + w / 2 - 25, y + h - 45, 50, 45);

    // Cửa sổ
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x + 25, y + 55, 35, 30);
    ctx.fillRect(x + w - 60, y + 55, 35, 30);

    // Bảng tên tòa nhà
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + 24);
  }

  drawMiniFlag(ctx, x, y) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 2, y, 4, 30);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 2, y, 22, 14);
    ctx.fillStyle = '#facc15';
    ctx.font = '10px sans-serif';
    ctx.fillText('★', x + 9, y + 11);
  }

  renderRipples(ctx) {
    for (const r of this.clickRipples) {
      ctx.save();
      ctx.strokeStyle = `rgba(245, 158, 11, ${r.alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  renderCharacter(ctx, char, isLocal = false, isNpc = false) {
    ctx.save();
    ctx.translate(char.x, char.y);

    const bob = char.moving ? Math.sin(char.animFrame) * 3 : (isNpc ? Math.sin(performance.now() / 400 + (char.bobOffset || 0)) * 2 : 0);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body / Outfit
    const skinColor = this.getSkinColor(char.skin);
    const outfitDef = CUSTOMIZATION_OPTIONS.outfits.find(o => o.id === char.outfit) || CUSTOMIZATION_OPTIONS.outfits[0];

    // Legs / Shoes
    const legOffset = char.moving ? Math.cos(char.animFrame) * 4 : 0;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 10 + legOffset, 6, 8);
    ctx.fillRect(2, 10 - legOffset, 6, 8);

    // Torso / Shirt
    ctx.fillStyle = outfitDef.primary;
    ctx.fillRect(-12, -10 + bob, 24, 22);

    // Collar / Scarf (Khăn quàng đỏ của học sinh Phú Thọ)
    if (outfitDef.scarf) {
      ctx.fillStyle = outfitDef.scarf;
      ctx.beginPath();
      ctx.moveTo(-10, -8 + bob);
      ctx.lineTo(0, 4 + bob);
      ctx.lineTo(10, -8 + bob);
      ctx.closePath();
      ctx.fill();
    } else if (outfitDef.emblem === 'star') {
      ctx.fillStyle = '#facc15';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, 4 + bob);
    }

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -22 + bob, 14, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    this.renderHair(ctx, char.hair, char.hairColor, bob);

    // Eyes
    ctx.fillStyle = '#1f2937';
    if (char.direction === 'up') {
      // Facing away, don't show face
    } else if (char.direction === 'left') {
      ctx.beginPath();
      ctx.arc(-6, -23 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (char.direction === 'right') {
      ctx.beginPath();
      ctx.arc(6, -23 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Facing down
      ctx.beginPath();
      ctx.arc(-4, -22 + bob, 2, 0, Math.PI * 2);
      ctx.arc(4, -22 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -17 + bob, 3, 0, Math.PI);
      ctx.stroke();
    }

    // Accessory (Glasses / Cap / Star pin)
    if (char.accessory === 'glasses') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -25 + bob, 6, 6);
      ctx.strokeRect(2, -25 + bob, 6, 6);
      ctx.beginPath();
      ctx.moveTo(-2, -22 + bob);
      ctx.lineTo(2, -22 + bob);
      ctx.stroke();
    } else if (char.accessory === 'star_pin') {
      ctx.fillStyle = '#facc15';
      ctx.font = '11px sans-serif';
      ctx.fillText('⭐', 7, -5 + bob);
    } else if (char.accessory === 'headband') {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -26 + bob, 13, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.stroke();
    }

    // Nametag & School Pill above head
    ctx.font = 'bold 11px "Nunito", sans-serif';
    ctx.textAlign = 'center';

    const tagText = `[${char.school}] ${char.name}`;
    const tagWidth = ctx.measureText(tagText).width + 12;

    ctx.fillStyle = isLocal ? 'rgba(30, 58, 138, 0.85)' : 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(-tagWidth / 2, -48 + bob, tagWidth, 17, 8);
    ctx.fill();

    ctx.fillStyle = isLocal ? '#fef08a' : '#ffffff';
    ctx.fillText(tagText, 0, -35 + bob);

    ctx.restore();
  }

  getSkinColor(skinId) {
    const s = CUSTOMIZATION_OPTIONS.skins.find(item => item.id === skinId);
    return s ? s.color : '#ffdfbf';
  }

  renderHair(ctx, hairId, hairColor, bob) {
    ctx.fillStyle = hairColor || '#1f1f1f';

    if (hairId === 'short' || !hairId) {
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 15, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (hairId === 'bob') {
      ctx.beginPath();
      ctx.arc(0, -23 + bob, 16, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.fillRect(-16, -23 + bob, 6, 12);
      ctx.fillRect(10, -23 + bob, 6, 12);
    } else if (hairId === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 15, Math.PI, Math.PI * 2);
      ctx.fill();
      // Đuôi ngựa vắt sang một bên
      ctx.beginPath();
      ctx.ellipse(-12, -30 + bob, 6, 12, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairId === 'curly') {
      for (let angle = 0; angle < Math.PI; angle += 0.5) {
        const hx = Math.cos(angle + Math.PI) * 15;
        const hy = Math.sin(angle + Math.PI) * 15 - 22 + bob;
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (hairId === 'spiky') {
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 14, Math.PI, Math.PI * 2);
      ctx.fill();
      // Spikes
      ctx.beginPath();
      ctx.moveTo(-10, -32 + bob);
      ctx.lineTo(-5, -40 + bob);
      ctx.lineTo(0, -32 + bob);
      ctx.lineTo(5, -42 + bob);
      ctx.lineTo(10, -32 + bob);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderSpeechBubbles(ctx) {
    const now = performance.now();

    for (const [entityId, bubble] of this.speechBubbles.entries()) {
      if (now > bubble.expireAt) {
        this.speechBubbles.delete(entityId);
        continue;
      }

      // Find position of entity
      let target = null;
      if (entityId === this.player.id) {
        target = this.player;
      } else {
        const npc = this.npcs.find(n => n.id === entityId);
        if (npc) target = npc;
        else target = this.remotePlayers.get(entityId);
      }

      if (!target) continue;

      ctx.save();
      ctx.translate(target.x, target.y - 58);

      ctx.font = 'bold 12px "Nunito", sans-serif';
      const text = bubble.text;
      const metrics = ctx.measureText(text);
      const bubbleWidth = Math.min(240, metrics.width + 20);
      const bubbleHeight = 28;

      // Bubble background
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth, bubbleHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(4, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(text, 0, -10, bubbleWidth - 10);

      ctx.restore();
    }
  }
}

// Start on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.academyGame = new AcademyGame();
});
