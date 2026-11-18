/**
 * Học Viện Phú Thọ (Phu Tho Academy) - Canvas Rendering & World Controller
 * Bối cảnh trường học hoành tráng, nhân vật chibi xịn xò, thú cưng theo sau,
 * hệ thống cửa hàng, bảng nhiệm vụ và đại hội tri thức.
 */

import {
  MAP_CONFIG,
  POI_LOCATIONS,
  DEFAULT_NPCS,
  CUSTOMIZATION_OPTIONS,
  PET_CONFIGS,
  DAILY_MISSIONS,
  createDefaultPlayer,
  checkProximityPOI,
  isSpecialZoneUnlocked,
  calculateLevel,
  SoundController,
  AcademyNetworkManager,
  clamp
} from './academy.mjs';
import { MINIGAME_DATA } from './minigames.mjs';
import {
  buildAllTextures,
  TEXTURES,
  PLATE_INFO,
  drawCharacter,
  drawPet,
  SKIN_STYLES,
  TEACHER_STYLE,
  CanvasGraphics,
} from './art/index.js';
import {
  BUILDINGS,
  TREES,
  BENCHES,
  FLOWER_BEDS,
  FLAGPOLE,
  BOARD,
  GATE,
  WORLD,
  BOUNDS,
  OBSTACLES,
} from './data/mapLayout.js';

class AcademyGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundController();

    // Generate high-resolution procedural textures from phutho art
    buildAllTextures();

    const saved = this.loadLocalPlayer();
    this.player = createDefaultPlayer(saved);

    // Follower Pet position
    this.playerPetPos = { x: this.player.x - 40, y: this.player.y, animFrame: 0 };

    // Camera
    this.camera = {
      x: this.player.x - window.innerWidth / 2,
      y: this.player.y - window.innerHeight / 2,
    };

    // NPCs
    this.npcs = DEFAULT_NPCS.map(n => ({
      ...n,
      petPos: { x: n.x - 35, y: n.y, animFrame: 0 },
      bobOffset: Math.random() * Math.PI * 2
    }));

    // Other online players
    this.remotePlayers = new Map();

    // Chat and speech bubbles
    this.speechBubbles = new Map();

    // Particles & ripples
    this.clickRipples = [];
    this.particles = [];

    // Controls
    this.keys = {};
    this.activePOI = null;

    // Network
    this.net = new AcademyNetworkManager(
      this.player,
      (remoteMap) => {
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

    this.setupViewport();
    this.setupInputs();
    this.setupUI();
    this.setupNPCBehavior();

    this.net.connect();

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
        character: this.player.character,
        skin: this.player.skin,
        hair: this.player.hair,
        hairColor: this.player.hairColor,
        outfit: this.player.outfit,
        bagColor: this.player.bagColor,
        accessory: this.player.accessory,
        pet: this.player.pet,
        coins: this.player.coins,
        xp: this.player.xp,
        level: this.player.level,
        points: this.player.points,
        clearedGames: this.player.clearedGames,
        specialUnlocked: this.player.specialUnlocked,
        ownedSkins: this.player.ownedSkins,
        ownedPets: this.player.ownedPets
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
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'e' || e.key === 'E') {
        this.triggerPOIInteraction();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickWorldX = e.clientX - rect.left + this.camera.x;
      const clickWorldY = e.clientY - rect.top + this.camera.y;

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
    setInterval(() => {
      const npc = this.npcs[Math.floor(Math.random() * this.npcs.length)];
      if (npc && npc.messages && npc.messages.length > 0) {
        const msg = npc.messages[Math.floor(Math.random() * npc.messages.length)];
        this.showSpeechBubble(npc.id, msg, 7000);
      }
    }, 7500);
  }

  setupUI() {
    this.updateHUD();

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
          character: this.player.character,
          skin: this.player.skin,
          hair: this.player.hair,
          hairColor: this.player.hairColor,
          outfit: this.player.outfit,
          bagColor: this.player.bagColor,
          accessory: this.player.accessory,
          pet: this.player.pet
        });
        this.sound.playSuccess();
      });
    }

    // Shop Modal
    const shopBtn = document.getElementById('shopBtn');
    const shopModal = document.getElementById('shopModal');
    const closeShopBtn = document.getElementById('closeShopModal');
    if (shopBtn && shopModal) {
      shopBtn.addEventListener('click', () => {
        this.renderShop();
        shopModal.classList.remove('hidden');
      });
    }
    if (closeShopBtn && shopModal) {
      closeShopBtn.addEventListener('click', () => shopModal.classList.add('hidden'));
    }

    // Pet Sanctuary Modal
    const petBtn = document.getElementById('petBtn');
    const petModal = document.getElementById('petModal');
    const closePetBtn = document.getElementById('closePetModal');
    if (petBtn && petModal) {
      petBtn.addEventListener('click', () => {
        this.renderPets();
        petModal.classList.remove('hidden');
      });
    }
    if (closePetBtn && petModal) {
      closePetBtn.addEventListener('click', () => petModal.classList.add('hidden'));
    }

    // Mission Board Modal
    const missionBtn = document.getElementById('missionBtn');
    const missionModal = document.getElementById('missionModal');
    const closeMissionBtn = document.getElementById('closeMissionModal');
    if (missionBtn && missionModal) {
      missionBtn.addEventListener('click', () => {
        this.renderMissions();
        missionModal.classList.remove('hidden');
      });
    }
    if (closeMissionBtn && missionModal) {
      closeMissionBtn.addEventListener('click', () => missionModal.classList.add('hidden'));
    }

    // Map Directory Modal
    const mapBtn = document.getElementById('mapBtn');
    const directoryModal = document.getElementById('directoryModal');
    const closeDirBtn = document.getElementById('closeDirBtn');
    if (mapBtn && directoryModal) {
      mapBtn.addEventListener('click', () => directoryModal.classList.remove('hidden'));
    }
    if (closeDirBtn && directoryModal) {
      closeDirBtn.addEventListener('click', () => directoryModal.classList.add('hidden'));
    }

    // Leaderboard Modal
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

    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji') || btn.textContent;
        this.net.broadcastChat(emoji);
        this.addChatMessage(this.player.name, this.player.school, emoji, true);
        this.showSpeechBubble(this.player.id, emoji);
        this.sound.playChat();
      });
    });

    const actionBtn = document.getElementById('actionBtn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => this.triggerPOIInteraction());
    }
  }

  updateHUD() {
    const nameEl = document.getElementById('hudPlayerName');
    const schoolEl = document.getElementById('hudPlayerSchool');
    const pointsEl = document.getElementById('hudPoints');
    const coinsEl = document.getElementById('hudCoins');
    const levelEl = document.getElementById('hudLevel');
    const badgeEl = document.getElementById('hudBadge');
    const petBadge = document.getElementById('hudPetBadge');

    const { level, currentLevelXP, maxLevelXP } = calculateLevel(this.player.xp || 0);
    this.player.level = level;

    if (nameEl) nameEl.textContent = this.player.name;
    if (schoolEl) schoolEl.textContent = this.player.school;
    if (pointsEl) pointsEl.textContent = `${this.player.points || 0} ⭐`;
    if (coinsEl) coinsEl.textContent = `${this.player.coins || 0} 🪙`;
    if (levelEl) levelEl.textContent = `Cấp ${level} (${currentLevelXP}/${maxLevelXP} XP)`;

    if (badgeEl) {
      const unlocked = isSpecialZoneUnlocked(this.player);
      badgeEl.textContent = unlocked ? '👑 Thủ Lĩnh Học Viện' : '🌱 Học Sinh Năng Động';
      badgeEl.className = unlocked ? 'badge elite' : 'badge active';
    }

    if (petBadge) {
      const petDef = PET_CONFIGS.find(p => p.id === this.player.pet);
      petBadge.textContent = petDef ? `${petDef.icon} ${petDef.name}` : 'Không có pet';
    }
  }

  populateCustomizationForm() {
    const nameInput = document.getElementById('customName');
    const schoolSelect = document.getElementById('customSchool');
    if (nameInput) nameInput.value = this.player.name;
    if (schoolSelect) schoolSelect.value = this.player.school;

    ['character', 'skin', 'hair', 'hairColor', 'outfit', 'bagColor', 'accessory', 'pet'].forEach(prop => {
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

    ['character', 'skin', 'hair', 'hairColor', 'outfit', 'bagColor', 'accessory', 'pet'].forEach(prop => {
      const checked = document.querySelector(`input[name="custom_${prop}"]:checked`);
      if (checked) this.player[prop] = checked.value;
    });
  }

  renderShop() {
    const container = document.getElementById('shopItemsContainer');
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 800; font-size: 15px; color: #d97706;">
        Ví của bạn: <strong>${this.player.coins || 0} 🪙 Xu</strong>
      </div>
      <div class="choice-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
        ${CUSTOMIZATION_OPTIONS.outfits.map(o => {
          const owned = this.player.ownedSkins?.includes(o.id) || o.price === 0;
          const equipped = this.player.outfit === o.id;
          return `
            <div class="shop-card ${equipped ? 'equipped' : ''}" style="padding: 12px; border: 2px solid ${equipped ? '#0284c7' : '#e2e8f0'}; border-radius: 14px; background: #fff;">
              <div style="font-weight: 800; font-size: 14px;">${o.label}</div>
              <div style="font-size: 12px; color: #64748b; margin: 4px 0;">${o.unlockRequirement || (o.price === 0 ? 'Miễn phí' : `${o.price} 🪙 Xu`)}</div>
              ${equipped ? '<span style="color:#0284c7; font-weight:800; font-size:12px;">Đang mặc</span>' :
                owned ? `<button class="btn secondary-btn equip-outfit-btn" data-id="${o.id}" style="padding:6px 12px; font-size:12px;">Mặc vào</button>` :
                `<button class="btn primary-btn buy-outfit-btn" data-id="${o.id}" data-price="${o.price}" style="padding:6px 12px; font-size:12px;">Mua ngay</button>`}
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.equip-outfit-btn').forEach(btn => {
      btn.onclick = () => {
        this.player.outfit = btn.getAttribute('data-id');
        this.savePlayerState();
        this.updateHUD();
        this.renderShop();
        this.sound.playClick();
      };
    });

    container.querySelectorAll('.buy-outfit-btn').forEach(btn => {
      btn.onclick = () => {
        const price = Number(btn.getAttribute('data-price'));
        const id = btn.getAttribute('data-id');
        if ((this.player.coins || 0) >= price) {
          this.player.coins -= price;
          this.player.ownedSkins = this.player.ownedSkins || ['default-student'];
          this.player.ownedSkins.push(id);
          this.player.outfit = id;
          this.savePlayerState();
          this.updateHUD();
          this.renderShop();
          this.sound.playSuccess();
        } else {
          alert('Bạn chưa đủ Xu! Hãy làm thêm bài đố ở các trạm để tích lũy Xu nhé!');
        }
      };
    });
  }

  renderPets() {
    const container = document.getElementById('petListContainer');
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 800; font-size: 15px; color: #d97706;">
        Ví của bạn: <strong>${this.player.coins || 0} 🪙 Xu</strong>
      </div>
      <div class="choice-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
        ${PET_CONFIGS.map(p => {
          const owned = this.player.ownedPets?.includes(p.id) || p.price === 0;
          const equipped = this.player.pet === p.id;
          return `
            <div class="shop-card ${equipped ? 'equipped' : ''}" style="padding: 12px; border: 2px solid ${equipped ? '#16a34a' : '#e2e8f0'}; border-radius: 14px; background: #fff; text-align: center;">
              <div style="font-size: 36px;">${p.icon}</div>
              <div style="font-weight: 800; font-size: 15px; margin-top: 4px;">${p.name}</div>
              <div style="font-size: 12px; color: #64748b; margin: 4px 0;">${p.desc}</div>
              <div style="font-weight: 700; font-size: 13px; color: #b45309; margin-bottom: 8px;">${p.price === 0 ? 'Miễn phí' : `${p.price} 🪙`}</div>
              ${equipped ? '<span style="color:#16a34a; font-weight:800; font-size:12px;">Đang dẫn theo</span>' :
                owned ? `<button class="btn secondary-btn equip-pet-btn" data-id="${p.id}" style="padding:6px 12px; font-size:12px;">Chọn bạn này</button>` :
                `<button class="btn primary-btn buy-pet-btn" data-id="${p.id}" data-price="${p.price}" style="padding:6px 12px; font-size:12px;">Nhận nuôi</button>`}
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.equip-pet-btn').forEach(btn => {
      btn.onclick = () => {
        this.player.pet = btn.getAttribute('data-id');
        this.savePlayerState();
        this.updateHUD();
        this.renderPets();
        this.sound.playClick();
      };
    });

    container.querySelectorAll('.buy-pet-btn').forEach(btn => {
      btn.onclick = () => {
        const price = Number(btn.getAttribute('data-price'));
        const id = btn.getAttribute('data-id');
        if ((this.player.coins || 0) >= price) {
          this.player.coins -= price;
          this.player.ownedPets = this.player.ownedPets || ['duck'];
          this.player.ownedPets.push(id);
          this.player.pet = id;
          this.savePlayerState();
          this.updateHUD();
          this.renderPets();
          this.sound.playSuccess();
        } else {
          alert('Bạn chưa đủ Xu để nhận nuôi thú cưng này! Hãy vượt qua các trạm đố để nhận thêm Xu nhé!');
        }
      };
    });
  }

  renderMissions() {
    const list = document.getElementById('missionList');
    if (!list) return;

    list.innerHTML = DAILY_MISSIONS.map(m => `
      <div style="padding: 12px; background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 800; font-size: 14px; color: #1e293b;">${m.text}</div>
          <div style="font-size: 12px; color: #b45309; margin-top: 2px;">Phần thưởng: +${m.rewardCoins} 🪙 Xu · +${m.rewardXP} XP</div>
        </div>
        <div style="font-weight: 800; font-size: 13px; color: #0284c7;">
          ${this.player.clearedGames[m.category] ? '✔ Đã xong' : 'Chưa xong'}
        </div>
      </div>
    `).join('');
  }

  addChatMessage(name, school, text, isSelf = false) {
    const box = document.getElementById('chatMessages');
    if (!box) return;

    const row = document.createElement('div');
    row.className = `chat-msg ${isSelf ? 'self' : ''}`;
    row.innerHTML = `<span class="tag">[${this.escapeHtml(school)}]</span> <strong>${this.escapeHtml(name)}:</strong> ${this.escapeHtml(text)}`;
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;

    while (box.children.length > 50) {
      box.removeChild(box.firstChild);
    }
  }

  showSpeechBubble(entityId, text, duration = 6500) {
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
    for (const npc of this.npcs) {
      if (Math.hypot(worldX - npc.x, worldY - npc.y) < 36) {
        return { type: 'npc', data: npc };
      }
    }
    for (const [_, p] of this.remotePlayers.entries()) {
      if (Math.hypot(worldX - p.x, worldY - p.y) < 36) {
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
    document.getElementById('profilePoints').textContent = `${data.points || 0} ⭐ Sao · Cấp ${data.level || 1}`;

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
        this.openMinigame('grand', poi);
      } else {
        this.showSpecialLockedModal(poi);
      }
    } else if (poi.category === 'panel') {
      if (poi.panelType === 'shop') {
        this.renderShop();
        document.getElementById('shopModal').classList.remove('hidden');
      } else if (poi.panelType === 'pets') {
        this.renderPets();
        document.getElementById('petModal').classList.remove('hidden');
      } else if (poi.panelType === 'missions') {
        this.renderMissions();
        document.getElementById('missionModal').classList.remove('hidden');
      }
    } else if (poi.category === 'landmark' || poi.category === 'welcome' || poi.category === 'social' || poi.category === 'sports') {
      this.showSpeechBubble(this.player.id, `Đang ở ${poi.name}: ${poi.desc}`, 5000);
      this.sound.playClick();
    }
  }

  showSpecialLockedModal(poi) {
    const modal = document.getElementById('specialLockModal');
    if (!modal) return;
    const reqText = document.getElementById('lockReqText');
    const curStars = this.player.points || 0;
    const curLevel = this.player.level || 1;
    const completedCount = Object.keys(this.player.clearedGames || {}).length;

    if (reqText) {
      reqText.innerHTML = `
        <div style="margin: 12px 0; text-align: left; background: #fffbeb; padding: 14px; border-radius: 14px; border: 1.5px solid #fde68a;">
          <h4 style="color:#b45309; margin-bottom: 8px;">Cổng Đại Hội Tri Thức đang phát sáng phong ấn! 🔒</h4>
          <p>Tòa nhà Tân Cổ Điển này chỉ đón chào những học giả nhí xuất sắc nhất. Hãy đạt 1 trong 3 điều kiện sau để mở cổng:</p>
          <ul style="margin: 8px 0 8px 20px; line-height: 1.6;">
            <li>⭐ Đạt tối thiểu <strong>60 Sao Danh Dự</strong> (Hiện có: <strong>${curStars}/60</strong>)</li>
            <li>🎓 Đạt <strong>Cấp độ 3</strong> (Hiện tại: <strong>Cấp ${curLevel}/3</strong>)</li>
            <li>🎯 Hoàn thành thử thách ở <strong>3 trạm học tập</strong> (Hiện đạt: <strong>${completedCount}/3</strong>)</li>
          </ul>
          <p><em>Hãy ghé qua Thư viện từ vựng, Khu chính tả và Vườn toán học để tích lũy thêm XP và Sao nhé!</em></p>
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

    let currentIdx = 0;
    let score = 0;
    const questions = [...gameDef.questions].sort(() => 0.5 - Math.random()).slice(0, 3);

    const renderQuestion = () => {
      container.innerHTML = '';
      if (currentIdx >= questions.length) {
        // Hoàn thành vòng chơi!
        const earnedCoins = poi.rewardCoins || 25;
        const earnedXP = poi.rewardXP || 30;
        const earnedStars = gameType === 'grand' ? 50 : 20;

        this.player.coins = (this.player.coins || 0) + earnedCoins;
        this.player.xp = (this.player.xp || 0) + earnedXP;
        this.player.points = (this.player.points || 0) + earnedStars;
        this.player.clearedGames[gameType] = true;

        const { level } = calculateLevel(this.player.xp);
        this.player.level = level;

        if (isSpecialZoneUnlocked(this.player)) {
          this.player.specialUnlocked = true;
          if (!this.player.ownedSkins.includes('leader')) {
            this.player.ownedSkins.push('leader');
          }
        }

        this.savePlayerState();
        this.updateHUD();
        this.net.broadcastScore(this.player.points, this.player.xp, this.player.level, this.player.specialUnlocked);
        this.sound.playSuccess();

        container.innerHTML = `
          <div class="game-result">
            <div style="font-size: 52px; margin-bottom: 8px;">🎉🏆🌟</div>
            <h3>Xuất sắc vượt qua thử thách!</h3>
            <p>Bạn đã trả lời đúng <strong>${score}/${questions.length}</strong> câu hỏi!</p>
            <div style="display:flex; justify-content:center; gap:12px; margin: 14px 0;">
              <div class="reward-box">+${earnedStars} ⭐ Sao</div>
              <div class="reward-box" style="background:#fef9c3; border-color:#eab308; color:#854d0e;">+${earnedCoins} 🪙 Xu</div>
              <div class="reward-box" style="background:#eff6ff; border-color:#3b82f6; color:#1d4ed8;">+${earnedXP} XP</div>
            </div>
            ${gameType === 'grand' ? '<p class="elite-banner" style="font-size:16px;">👑 BẠN ĐÃ ĐOẠT DANH HIỆU THỦ LĨNH HỌC VIỆN PHÚ THỌ!<br>Mở khóa Áo Choàng Đỏ Hoàng Gia tại Cửa hàng!</p>' : ''}
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
            this.sound.playCoin();
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

    const all = [
      { name: this.player.name, school: this.player.school, points: this.player.points, coins: this.player.coins, isSelf: true },
      ...Array.from(this.remotePlayers.values()).map(p => ({
        name: p.name,
        school: p.school,
        points: p.points || 0,
        coins: p.coins || 0,
        isSelf: false
      })),
      { name: 'Nguyễn Minh Anh', school: 'TH Phú Thọ', points: 220, coins: 340, isSelf: false },
      { name: 'Trần Gia Bảo', school: 'TH Chu Văn An', points: 195, coins: 280, isSelf: false },
      { name: 'Lê Hoàng Nam', school: 'TH Phú Thọ', points: 170, coins: 230, isSelf: false },
      { name: 'Phạm Quỳnh Chi', school: 'TH Kim Đồng', points: 155, coins: 190, isSelf: false },
      { name: 'Vũ Đăng Khoa', school: 'TH Lê Quý Đôn', points: 130, coins: 150, isSelf: false },
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

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
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

    const minX = MAP_CONFIG.bounds ? MAP_CONFIG.bounds.x : 60;
    const maxX = MAP_CONFIG.bounds ? MAP_CONFIG.bounds.x + MAP_CONFIG.bounds.w : MAP_CONFIG.width - 60;
    const minY = MAP_CONFIG.bounds ? MAP_CONFIG.bounds.y : 160;
    const maxY = MAP_CONFIG.bounds ? MAP_CONFIG.bounds.y + MAP_CONFIG.bounds.h : MAP_CONFIG.height - 80;

    this.player.x = clamp(this.player.x, minX, maxX);
    this.player.y = clamp(this.player.y, minY, maxY);

    if (this.player.moving) {
      this.player.animFrame += dt * 9;
      this.net.broadcastMove(this.player.x, this.player.y, this.player.direction, 'walk');
    } else {
      this.player.animFrame = 0;
    }

    // Follower Pet physics (leash follow with elastic delay)
    if (this.player.pet && this.player.pet !== 'none') {
      const targetPetX = this.player.direction === 'left' ? this.player.x + 36 : this.player.x - 36;
      const targetPetY = this.player.y + 6;
      const pdx = targetPetX - this.playerPetPos.x;
      const pdy = targetPetY - this.playerPetPos.y;
      const pdist = Math.hypot(pdx, pdy);

      if (pdist > 8) {
        this.playerPetPos.x += pdx * Math.min(1, dt * 7);
        this.playerPetPos.y += pdy * Math.min(1, dt * 7);
        this.playerPetPos.animFrame += dt * 10;
      } else {
        this.playerPetPos.animFrame = 0;
      }
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

    // Camera follow (smooth lerp)
    const targetCamX = this.player.x - this.canvas.width / 2;
    const targetCamY = this.player.y - this.canvas.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;
    this.camera.x = clamp(this.camera.x, 0, Math.max(0, MAP_CONFIG.width - this.canvas.width));
    this.camera.y = clamp(this.camera.y, 0, Math.max(0, MAP_CONFIG.height - this.canvas.height));

    // Ripples
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

    // 1. School campus background (paths, cobblestones, flagpole plaza, lotus pond)
    if (TEXTURES['map-bg']) {
      ctx.drawImage(TEXTURES['map-bg'], 0, 0);
    } else {
      ctx.fillStyle = '#9ae6b4';
      ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
    }

    // 2. Click ripples on the ground
    this.renderRipples(ctx);

    // 3. Depth-sorted world scene (all buildings, props, students, pets sorted by Y depth)
    const renderList = [];

    // Buildings
    for (const b of BUILDINGS) {
      renderList.push({
        y: b.baseY,
        draw: (c) => {
          const img = TEXTURES[b.texture];
          if (img) c.drawImage(img, b.cx - b.w / 2, b.baseY - b.h);
          const plate = PLATE_INFO[b.texture];
          if (plate) {
            c.save();
            c.font = b.zone === 'grand' ? 'bold 18px "Baloo 2", "Nunito", sans-serif' : 'bold 14px "Baloo 2", "Nunito", sans-serif';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillStyle = '#1558b0';
            const poi = POI_LOCATIONS.find(p => p.id === b.zone);
            const label = b.zone === 'grand' ? 'TRƯỜNG TIỂU HỌC PHÚ THỌ' : (poi?.name || b.zone).toUpperCase();
            c.fillText(label, b.cx - b.w / 2 + plate.x, b.baseY - b.h + plate.y);
            c.restore();
          }
          if (b.zone === 'grand') {
            const unlocked = isSpecialZoneUnlocked(this.player);
            if (!unlocked) {
              const pulse = Math.sin(performance.now() / 320) * 4;
              c.save();
              c.font = '28px sans-serif';
              c.textAlign = 'center';
              c.fillText('🔒', b.cx, b.baseY - 70 + pulse);
              c.fillStyle = '#dc2626';
              c.font = 'bold 12px "Nunito", sans-serif';
              c.fillText('Cần Cấp 3 hoặc 60 ⭐', b.cx, b.baseY - 45 + pulse);
              c.restore();
            }
          }
        }
      });
    }

    // Trees
    for (const t of TREES) {
      renderList.push({
        y: t.y,
        draw: (c) => {
          const img = TEXTURES['prop-tree-' + t.v];
          if (img) c.drawImage(img, t.x - img.width / 2, t.y - img.height * 0.97);
        }
      });
    }

    // Benches
    for (const b of BENCHES) {
      renderList.push({
        y: b.y,
        draw: (c) => {
          const img = TEXTURES['prop-bench'];
          if (img) c.drawImage(img, b.x - img.width / 2, b.y - img.height * 0.95);
        }
      });
    }

    // Flower beds
    for (const f of FLOWER_BEDS) {
      renderList.push({
        y: f.y,
        draw: (c) => {
          const img = TEXTURES['prop-bed-' + f.w];
          if (img) c.drawImage(img, f.x - img.width / 2, f.y - img.height);
        }
      });
    }

    // Flagpole
    renderList.push({
      y: FLAGPOLE.y + 3,
      draw: (c) => {
        const img = TEXTURES['prop-flag'];
        if (img) c.drawImage(img, FLAGPOLE.x - 56, FLAGPOLE.y + 3 - img.height * 0.97);
      }
    });

    // Board
    renderList.push({
      y: BOARD.baseY,
      draw: (c) => {
        const img = TEXTURES['prop-board'];
        if (img) c.drawImage(img, BOARD.x - BOARD.w / 2, BOARD.baseY - img.height * 0.94);
        c.save();
        c.fillStyle = '#fff9e6';
        c.strokeStyle = '#1f2a44';
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(BOARD.x - 65, BOARD.baseY - BOARD.h - 14, 130, 24, 12);
        c.fill();
        c.stroke();
        c.font = 'bold 12px "Nunito", sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillStyle = '#1f2a44';
        c.fillText('BẢNG NHIỆM VỤ', BOARD.x, BOARD.baseY - BOARD.h - 2);
        c.restore();
      }
    });

    // Gate
    renderList.push({
      y: GATE.y,
      draw: (c) => {
        const img = TEXTURES['prop-gate'];
        if (img) c.drawImage(img, GATE.x - 165, GATE.y - 140);
        const gp = PLATE_INFO['prop-gate'];
        if (gp) {
          c.save();
          c.font = 'bold 16px "Baloo 2", "Nunito", sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillStyle = '#1558b0';
          c.fillText('TRƯỜNG TIỂU HỌC PHÚ THỌ', GATE.x - 165 + gp.x, GATE.y - 140 + gp.y);
          c.restore();
        }
      }
    });

    // Local player
    renderList.push({
      y: this.player.y,
      draw: (c) => {
        this.renderCharacterChibi(c, this.player, true);
      }
    });
    if (this.player.pet && this.player.pet !== 'none') {
      renderList.push({
        y: this.playerPetPos.y,
        draw: (c) => {
          this.renderPet(c, this.playerPetPos.x, this.playerPetPos.y, this.player.pet, this.playerPetPos.animFrame);
        }
      });
    }

    // NPCs
    for (const npc of this.npcs) {
      renderList.push({
        y: npc.y,
        draw: (c) => {
          this.renderCharacterChibi(c, npc, false, true);
        }
      });
      if (npc.pet && npc.pet !== 'none') {
        renderList.push({
          y: npc.petPos.y,
          draw: (c) => {
            this.renderPet(c, npc.petPos.x, npc.petPos.y, npc.pet, npc.petPos.animFrame);
          }
        });
      }
    }

    // Remote players
    for (const [_, rp] of this.remotePlayers.entries()) {
      renderList.push({
        y: rp.y,
        draw: (c) => {
          this.renderCharacterChibi(c, rp, false, false);
        }
      });
    }

    // Sort all by depth y
    renderList.sort((a, b) => a.y - b.y);

    for (const item of renderList) {
      item.draw(ctx);
    }

    // 4. Floating POI Interaction Prompts
    if (this.activePOI) {
      const poi = this.activePOI;
      const floatY = Math.sin(performance.now() / 260) * 6;
      ctx.save();
      ctx.translate(poi.x, poi.y - 60 + floatY);
      ctx.fillStyle = 'rgba(2, 132, 199, 0.92)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-100, -18, 200, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(poi.icon + ' ' + poi.name, 0, 0);
      ctx.restore();
    }

    // 5. Speech bubbles
    this.renderSpeechBubbles(ctx);

    ctx.restore();
  }

  renderRipples(ctx) {
    for (const r of this.clickRipples) {
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, ' + r.alpha + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  renderCharacterChibi(ctx, char, isLocal = false, isNpc = false) {
    ctx.save();
    ctx.translate(char.x, char.y);

    const isGirl = char.character === 'girl';
    const isMoving = Boolean(char.moving);
    const pose = char.cheering ? 'cheer' : (isMoving ? 'walk' : 'idle');
    const dir = char.direction || 'down';
    const side = dir === 'left' || dir === 'right';

    if (dir === 'left') {
      ctx.scale(-1, 1);
    }

    const phase = char.animFrame || (performance.now() * 0.0125);
    const t = performance.now() / 1000;

    const hairStyle = typeof char.hairStyle === 'number' ? char.hairStyle : (isGirl ? 2 : 0);
    const hairColor = typeof char.hairColor === 'number' ? char.hairColor : 0;
    const bagColor = char.bagColor || 'red';
    const shoeColor = char.shoeColor || 'white';
    const skinId = char.skinId || char.outfit || 'default-student';
    const style = SKIN_STYLES[skinId] || SKIN_STYLES['default-student'] || { shirt: '#8fd3ff', bottom: '#2f4b9b', accessory: 'none' };

    const g = new CanvasGraphics(ctx);
    drawCharacter(g, {
      avatar: {
        character: isGirl ? 'girl' : 'boy',
        hairStyle,
        hairColor,
        bagColor,
        shoeColor,
      },
      style,
      dir: side ? 'side' : dir,
      pose,
      phase,
      t,
    });

    ctx.restore();

    // Render name badge above head
    this.renderPlayerBadge(ctx, char, isLocal, isNpc);
  }

  renderPlayerBadge(ctx, char, isLocal = false, isNpc = false) {
    ctx.save();
    ctx.translate(char.x, char.y - 105);

    ctx.font = 'bold 12px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tagText = isNpc ? char.name : '[' + char.school + '] ' + char.name;
    const tagWidth = ctx.measureText(tagText).width + 16;

    ctx.fillStyle = isLocal ? 'rgba(2, 132, 199, 0.9)' : (isNpc ? 'rgba(22, 101, 52, 0.85)' : 'rgba(15, 23, 42, 0.8)');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-tagWidth / 2, -10, tagWidth, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLocal ? '#fef08a' : '#ffffff';
    ctx.fillText(tagText, 0, 0);

    ctx.restore();
  }

  renderPet(ctx, x, y, petId, animFrame = 0) {
    if (!petId || petId === 'none') return;
    const kind = (petId === 'cat' ? 'dog' : petId);
    ctx.save();
    ctx.translate(x, y);

    // Subtle shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hopping bounce
    const hop = Math.abs(Math.sin(animFrame * 2)) * 4;
    ctx.translate(0, -hop);

    const g = new CanvasGraphics(ctx);
    drawPet(g, kind);

    ctx.restore();
  }

  getSkinColor(skinId) {
    const s = CUSTOMIZATION_OPTIONS.skins.find(item => item.id === skinId);
    return s ? s.color : '#ffd9b8';
  }

  renderSpeechBubbles(ctx) {
    const now = performance.now();

    for (const [entityId, bubble] of this.speechBubbles.entries()) {
      if (now > bubble.expireAt) {
        this.speechBubbles.delete(entityId);
        continue;
      }

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
      ctx.translate(target.x, target.y - 82);

      ctx.font = 'bold 13px "Nunito", sans-serif';
      const text = bubble.text;
      const metrics = ctx.measureText(text);
      const bubbleWidth = Math.min(260, metrics.width + 24);
      const bubbleHeight = 32;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-bubbleWidth / 2, -bubbleHeight, bubbleWidth, bubbleHeight, 10);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(5, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(text, 0, -11, bubbleWidth - 12);

      ctx.restore();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.academyGame = new AcademyGame();
});
