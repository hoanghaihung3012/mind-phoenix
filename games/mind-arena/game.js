import { auth } from '../../shared/auth/auth.mjs';
import {
  SUBJECTS,
  LESSONS,
  ARENA_LEVELS,
  calculatePlayerLevel,
  TOWER_FLOORS,
  DUEL_RIVALS,
  calculateQuestionScore,
  calculateDuelResult,
  getUserArenaProfile,
  saveUserArenaProfile,
  getNationalLeaderboard,
  shuffleArray,
} from './arena.mjs';

const API_BASE_URL = (typeof window !== 'undefined' && window.MINDPHOENIX_API_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5005/api'
    : 'https://api-production-c2686e59.up.railway.app/api'
);

// --- SOUND SYNTHESIZER ---
class ArenaAudio {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  ensureContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  playCorrect() {
    this.playTone(523.25, 'triangle', 0.12, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.18), 100); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.2), 200); // G5
  }

  playWrong() {
    this.playTone(220, 'sawtooth', 0.25, 0.12);
    setTimeout(() => this.playTone(196, 'sawtooth', 0.35, 0.12), 150);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => setTimeout(() => this.playTone(f, 'sine', 0.25, 0.18), i * 140));
  }

  playDefeat() {
    const notes = [392, 349.23, 329.63, 261.63];
    notes.forEach((f, i) => setTimeout(() => this.playTone(f, 'sawtooth', 0.3, 0.12), i * 160));
  }

  playTick() {
    this.playTone(800, 'sine', 0.04, 0.03);
  }
}

const audio = new ArenaAudio();

// --- STATE VARIABLES ---
let currentLang = 'vi';
let currentUser = null;
let currentProfile = null;

// Game mode: 'tower' | 'duel'
let activeMode = null;

// Tower Climb State
let towerSelectedSubject = 'all';
let currentFloorIndex = 0;
let towerScoreAccumulator = 0;

// Duel State
let activeRival = null;
let duelUserScore = 0;
let duelRivalScore = 0;
let duelRoundIndex = 0;
const DUEL_TOTAL_ROUNDS = 5;

// Shared Question State
let roundQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let timerInterval = null;
let timeRemaining = 0;
let currentStreak = 0;
let maxStreak = 0;
let isAnswered = false;

// Realtime Presence & Challenge
let activeRivalTab = 'human'; // 'human' | 'bot'
let onlineHumanPlayers = [];
let pendingIncomingChallenge = null;
let heartbeatInterval = null;

// DOM Screens
const screenAuthRequired = document.getElementById('screen-auth-required');
const screenHub = document.getElementById('screen-hub');
const screenRivalSelect = document.getElementById('screen-rival-select');
const screenBattle = document.getElementById('screen-battle');
const screenFloorClear = document.getElementById('screen-floor-clear');
const screenFinalResult = document.getElementById('screen-final-result');
const screenLeaderboard = document.getElementById('screen-leaderboard');

// Modals
const challengeModalBackdrop = document.getElementById('challenge-modal-backdrop');
const roomModalBackdrop = document.getElementById('room-modal-backdrop');

function t(vi, en) {
  return currentLang === 'en' ? en : vi;
}

// --- INIT APP ---
function init() {
  currentLang = document.documentElement.lang === 'en' || localStorage.getItem('language') === 'en' ? 'en' : 'vi';

  // Auth UI in header
  auth.initUI('nav-auth-container');

  // Check login state
  checkAuthAndRender();

  // Listen to auth changes
  window.addEventListener('mindphoenix-auth-change', () => {
    checkAuthAndRender();
  });

  // Sound toggle button
  const btnSound = document.getElementById('btn-sound');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      btnSound.innerHTML = audio.enabled ? '🔊 <span>Âm thanh</span>' : '🔇 <span>Tắt âm</span>';
    });
  }

  // Setup Global Navigation Listeners
  setupEventListeners();

  // Start Presence Heartbeat Loop (every 5 seconds)
  startHeartbeatLoop();
}

function checkAuthAndRender() {
  if (auth.isLoggedIn()) {
    currentUser = auth.user;
    currentProfile = getUserArenaProfile(currentUser.email || currentUser.id, currentUser.name);

    if (typeof currentUser.arenaXp === 'number') {
      currentProfile.xp = Math.max(currentProfile.xp || 0, currentUser.arenaXp);
    }
    if (typeof currentUser.duelWins === 'number') {
      currentProfile.duelWins = Math.max(currentProfile.duelWins || 0, currentUser.duelWins);
    }
    if (typeof currentUser.duelLosses === 'number') {
      currentProfile.duelLosses = Math.max(currentProfile.duelLosses || 0, currentUser.duelLosses);
    }
    saveUserArenaProfile(currentProfile);

    showScreen(screenHub);
    renderProfileCard();
    renderModeCards();
    sendHeartbeat();
  } else {
    currentUser = null;
    currentProfile = null;
    showScreen(screenAuthRequired);
  }
}

// --- HEARTBEAT & REALTIME CHALLENGES ---
function startHeartbeatLoop() {
  clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (auth.isLoggedIn() && currentUser && currentProfile) {
      sendHeartbeat();
    }
  }, 5000);
}

async function sendHeartbeat() {
  if (!currentUser || !currentProfile) return;
  try {
    const res = await fetch(`${API_BASE_URL}/arena/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id || currentUser.email,
        name: currentProfile.name,
        school: 'Mind Phoenix Member',
        avatar: (currentProfile.name || 'U').charAt(0).toUpperCase(),
        level: calculatePlayerLevel(currentProfile.xp).level,
        xp: currentProfile.xp,
        status: activeMode ? 'in_match' : 'idle',
      }),
    });

    const json = await res.json();
    if (json.success && json.data) {
      onlineHumanPlayers = json.data.players || [];
      const humanCountEl = document.getElementById('human-online-count');
      if (humanCountEl) humanCountEl.textContent = onlineHumanPlayers.length;

      // If user is currently browsing rival selection screen on human tab, re-render
      if (!screenRivalSelect.hidden && activeRivalTab === 'human') {
        renderRivalList();
      }

      // Check incoming challenge
      if (json.data.challenges && json.data.challenges.length > 0) {
        showIncomingChallengeModal(json.data.challenges[0]);
      }

      // Check if challenge sent by user was accepted
      if (json.data.acceptedInvite) {
        handleAcceptedInvite(json.data.acceptedInvite);
      }
    }
  } catch {
    // Offline or server unreachable
  }
}

function showIncomingChallengeModal(challenge) {
  if (pendingIncomingChallenge?.id === challenge.id) return;
  pendingIncomingChallenge = challenge;
  audio.playVictory();

  const textEl = document.getElementById('ch-modal-text');
  const avatarEl = document.getElementById('ch-modal-avatar');
  if (textEl) {
    textEl.innerHTML = `Đấu sĩ <strong>${challenge.fromUser.name}</strong> (Cấp ${challenge.fromUser.level}) đang gửi lời mời thách đấu đối kháng 1v1 đến bạn!`;
  }
  if (avatarEl) avatarEl.textContent = challenge.fromUser.avatar || '👑';

  if (challengeModalBackdrop) challengeModalBackdrop.hidden = false;

  document.getElementById('btn-accept-challenge').onclick = async () => {
    challengeModalBackdrop.hidden = true;
    try {
      await fetch(`${API_BASE_URL}/arena/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, accept: true }),
      });
    } catch {}

    // Start 1v1 Match with the real human challenger
    startDuelMatch({
      id: challenge.fromUser.id,
      name: challenge.fromUser.name,
      school: 'Người chơi online',
      avatar: challenge.fromUser.avatar || '👑',
      level: challenge.fromUser.level,
      winRate: '75%',
      botAccuracy: 0.8,
      isBot: false,
    });
  };

  document.getElementById('btn-decline-challenge').onclick = async () => {
    challengeModalBackdrop.hidden = true;
    try {
      await fetch(`${API_BASE_URL}/arena/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, accept: false }),
      });
    } catch {}
    pendingIncomingChallenge = null;
  };
}

function handleAcceptedInvite(acceptedInvite) {
  alert(`Đấu sĩ đã chấp nhận lời mời thách đấu! Chuẩn bị bước vào trận đấu...`);
  startDuelMatch({
    id: acceptedInvite.toUserId,
    name: 'Đối Thủ Thách Đấu',
    school: 'Người chơi online',
    avatar: '👑',
    level: 3,
    winRate: '70%',
    botAccuracy: 0.8,
    isBot: false,
  });
}

// --- FIGHTER PROFILE CARD ---
function renderProfileCard() {
  if (!currentProfile) return;
  const levelInfo = calculatePlayerLevel(currentProfile.xp);

  const initial = (currentProfile.name || 'U').charAt(0).toUpperCase();
  document.getElementById('profile-avatar-initial').textContent = initial;
  document.getElementById('profile-user-name').textContent = currentProfile.name;
  document.getElementById('profile-level-badge').innerHTML = `
    <span>${levelInfo.badge}</span>
    <span>Cấp ${levelInfo.level} · ${t(levelInfo.titleVi, levelInfo.titleEn)}</span>
  `;

  document.getElementById('profile-xp-text').textContent = `${levelInfo.currentXp} / ${levelInfo.nextLevelXp} XP`;
  document.getElementById('profile-xp-percent').textContent = `${levelInfo.progressPercent}%`;
  document.getElementById('profile-xp-fill').style.width = `${levelInfo.progressPercent}%`;
}

function renderModeCards() {
  document.getElementById('btn-start-tower').onclick = () => startTowerMode('all');
  document.getElementById('btn-start-duel').onclick = () => showRivalSelectScreen();
  document.getElementById('btn-view-leaderboard').onclick = () => showLeaderboardScreen();
}

// --- MODE 1: LEO THÁP TRÍ TUỆ (TOWER CLIMB) ---
function startTowerMode(subjectId = 'all') {
  audio.ensureContext();
  activeMode = 'tower';
  towerSelectedSubject = subjectId;
  currentFloorIndex = 0;
  towerScoreAccumulator = 0;
  currentStreak = 0;
  maxStreak = 0;

  loadTowerFloor(currentFloorIndex);
}

function loadTowerFloor(floorIndex) {
  currentFloorIndex = floorIndex;
  const floorConfig = TOWER_FLOORS[floorIndex];
  showScreen(screenBattle);

  renderTowerMap();

  document.getElementById('versus-hud').hidden = true;
  document.getElementById('tower-hud').hidden = false;

  document.getElementById('hud-floor-title').textContent = `${floorConfig.icon} ${t(floorConfig.titleVi, floorConfig.titleEn)}`;
  document.getElementById('hud-tower-score').textContent = towerScoreAccumulator;

  roundQuestions = getQuestionsForFloor(floorIndex, towerSelectedSubject);
  currentQuestionIndex = 0;
  loadQuestion(currentQuestionIndex);
}

function renderTowerMap() {
  const container = document.getElementById('tower-map-container');
  if (!container) return;

  container.innerHTML = TOWER_FLOORS.map((f, idx) => {
    let statusClass = '';
    if (idx < currentFloorIndex) statusClass = 'cleared';
    else if (idx === currentFloorIndex) statusClass = 'active';

    return `
      <div class="floor-step ${statusClass}">
        <span>${idx < currentFloorIndex ? '✓' : f.icon}</span>
        <div>Tầng ${f.floor}</div>
      </div>
    `;
  }).join('');
}

function getQuestionsForFloor(floorIdx, subjectId) {
  let pool = [];
  const relevantLessons = subjectId === 'all'
    ? LESSONS
    : LESSONS.filter((l) => l.subjectId === subjectId);

  relevantLessons.forEach((l) => {
    const stage = Math.min(2, Math.floor(floorIdx / 2));
    const matching = l.questions.filter((q) => q.stage === stage);
    pool.push(...matching);
  });

  return shuffleArray(pool).slice(0, 4);
}

// --- MODE 2: ĐẤU ĐỐI KHÁNG 1v1 (PVP DUEL) ---
function showRivalSelectScreen() {
  showScreen(screenRivalSelect);
  sendHeartbeat();

  // Setup tab switcher
  const tabHuman = document.getElementById('tab-rivals-human');
  const tabBot = document.getElementById('tab-rivals-bot');

  tabHuman.onclick = () => {
    activeRivalTab = 'human';
    tabHuman.classList.add('active');
    tabBot.classList.remove('active');
    renderRivalList();
  };

  tabBot.onclick = () => {
    activeRivalTab = 'bot';
    tabBot.classList.add('active');
    tabHuman.classList.remove('active');
    renderRivalList();
  };

  // Auto match button
  document.getElementById('btn-auto-match').onclick = () => {
    if (onlineHumanPlayers.length > 0) {
      const luckyPlayer = onlineHumanPlayers[Math.floor(Math.random() * onlineHumanPlayers.length)];
      sendChallengeInvite(luckyPlayer);
    } else {
      const randomBot = DUEL_RIVALS[Math.floor(Math.random() * DUEL_RIVALS.length)];
      startDuelMatch(randomBot);
    }
  };

  // Create Room button
  document.getElementById('btn-create-room').onclick = openCreateRoomModal;

  renderRivalList();
}

function renderRivalList() {
  const container = document.getElementById('rivals-grid');
  if (!container) return;

  if (activeRivalTab === 'human') {
    // --- HUMAN PLAYERS LIST ---
    if (onlineHumanPlayers.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 24px; background: #fff; border-radius: 20px; border: 2px dashed #cbd5e1;">
          <div style="font-size: 44px; margin-bottom: 10px;">👥</div>
          <h3 style="font: 800 20px 'Baloo 2', sans-serif; color: #0f172a; margin-bottom: 6px;">Chưa có người chơi thật nào khác online lúc này</h3>
          <p style="font-size: 14.5px; color: #64748b; margin-bottom: 20px;">Bạn có thể tạo liên kết phòng để mời bạn bè qua Zalo/Facebook, hoặc chuyển sang tab <strong>🤖 Đối Thủ BOT</strong> để so tài ngay lập tức!</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" id="btn-empty-create" type="button" style="background: #2563eb;">
              <span>🔗 Mời Bạn Bè Bằng Link</span>
            </button>
            <button class="btn-secondary" id="btn-switch-bot" type="button">
              <span>🤖 Chuyển Sang Đấu Với Bot</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-empty-create')?.addEventListener('click', openCreateRoomModal);
      document.getElementById('btn-switch-bot')?.addEventListener('click', () => {
        document.getElementById('tab-rivals-bot').click();
      });
      return;
    }

    container.innerHTML = onlineHumanPlayers.map((player) => `
      <div class="rival-card" style="border-color: #86efac; background: linear-gradient(135deg, #ffffff, #f0fdf4);">
        <div class="rival-left">
          <div class="rival-avatar" style="background: #dcfce7; border-color: #86efac;">${player.avatar || '👑'}</div>
          <div class="rival-meta">
            <div style="display: flex; align-items: center; gap: 6px;">
              <h4>${player.name}</h4>
              <span class="badge-human"><span class="badge-pulse-dot"></span> NGƯỜI THẬT</span>
            </div>
            <span class="rival-school">${player.school}</span>
            <span class="rival-stats" style="color: #15803d;">Cấp ${player.level} · ${player.xp} XP</span>
          </div>
        </div>
        <button class="btn-challenge" data-human-id="${player.id}" style="background: #16a34a;">
          <span>Mời Thách Đấu ⚔️</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('[data-human-id]').forEach((btn) => {
      btn.onclick = () => {
        const player = onlineHumanPlayers.find((p) => p.id === btn.dataset.humanId);
        if (player) sendChallengeInvite(player);
      };
    });

  } else {
    // --- BOT RIVALS LIST ---
    container.innerHTML = DUEL_RIVALS.map((rival) => `
      <div class="rival-card">
        <div class="rival-left">
          <div class="rival-avatar">${rival.avatar}</div>
          <div class="rival-meta">
            <div style="display: flex; align-items: center; gap: 6px;">
              <h4>${rival.name}</h4>
              <span class="badge-bot">🤖 BOT</span>
            </div>
            <span class="rival-school">${rival.school}</span>
            <span class="rival-stats">Cấp ${rival.level} · Thắng: ${rival.winRate}</span>
          </div>
        </div>
        <button class="btn-challenge" data-bot-id="${rival.id}">
          <span>Đấu Với Bot ⚔️</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('[data-bot-id]').forEach((btn) => {
      btn.onclick = () => {
        const rival = DUEL_RIVALS.find((r) => r.id === btn.dataset.botId) || DUEL_RIVALS[0];
        startDuelMatch(rival);
      };
    });
  }
}

async function sendChallengeInvite(targetPlayer) {
  try {
    const res = await fetch(`${API_BASE_URL}/arena/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUser: {
          id: currentUser.id || currentUser.email,
          name: currentProfile.name,
          avatar: (currentProfile.name || 'U').charAt(0).toUpperCase(),
          level: calculatePlayerLevel(currentProfile.xp).level,
        },
        toUserId: targetPlayer.id,
      }),
    });
    const json = await res.json();
    if (json.success) {
      alert(`Đã gửi lời mời thách đấu tới ${targetPlayer.name}! Đang chờ phản hồi...`);
    }
  } catch {
    alert('Không thể kết nối máy chủ gửi lời mời thách đấu.');
  }
}

async function openCreateRoomModal() {
  const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;

  const inputEl = document.getElementById('room-invite-link-input');
  if (inputEl) inputEl.value = inviteUrl;
  if (roomModalBackdrop) roomModalBackdrop.hidden = false;

  document.getElementById('btn-copy-room-link').onclick = () => {
    navigator.clipboard.writeText(inviteUrl);
    alert('Đã sao chép liên kết phòng vào bộ nhớ tạm! Hãy gửi link này cho bạn bè.');
  };

  document.getElementById('btn-close-room-modal').onclick = () => {
    if (roomModalBackdrop) roomModalBackdrop.hidden = true;
  };
}

function startDuelMatch(rival) {
  audio.ensureContext();
  activeMode = 'duel';
  activeRival = rival;
  duelUserScore = 0;
  duelRivalScore = 0;
  duelRoundIndex = 0;
  currentStreak = 0;
  maxStreak = 0;

  let allQ = [];
  LESSONS.forEach((l) => allQ.push(...l.questions));
  roundQuestions = shuffleArray(allQ).slice(0, DUEL_TOTAL_ROUNDS);

  showScreen(screenBattle);
  document.getElementById('tower-map-container').innerHTML = '';
  document.getElementById('tower-hud').hidden = true;
  document.getElementById('versus-hud').hidden = false;

  // Versus Header with explicit BOT or REAL HUMAN badge
  document.getElementById('duel-user-name').innerHTML = `
    <span>${currentProfile.name}</span>
    <span class="badge-human" style="font-size: 10px; margin-left: 4px;"><span class="badge-pulse-dot"></span> BẠN</span>
  `;

  const rivalBadgeHtml = rival.isBot
    ? `<span class="badge-bot" style="font-size: 10px; margin-left: 4px;">🤖 BOT</span>`
    : `<span class="badge-human" style="font-size: 10px; margin-left: 4px;"><span class="badge-pulse-dot"></span> NGƯỜI THẬT</span>`;

  document.getElementById('duel-rival-name').innerHTML = `
    <span>${rival.name}</span>
    ${rivalBadgeHtml}
  `;
  document.getElementById('duel-rival-avatar').textContent = rival.avatar || '🦁';
  updateVersusScores();

  currentQuestionIndex = 0;
  loadQuestion(currentQuestionIndex);
}

function updateVersusScores() {
  document.getElementById('duel-user-score').textContent = `${duelUserScore}đ`;
  document.getElementById('duel-rival-score').textContent = `${duelRivalScore}đ`;
}

// --- QUESTION RUNNER (BOTH MODES) ---
function loadQuestion(qIndex) {
  currentQuestionIndex = qIndex;
  currentQuestion = roundQuestions[qIndex];
  isAnswered = false;

  const totalTime = activeMode === 'tower' ? TOWER_FLOORS[currentFloorIndex].timePerQ : 20;
  timeRemaining = totalTime;

  document.getElementById('hud-question-number').textContent = `${qIndex + 1}/${roundQuestions.length}`;
  updateStreakBadge();

  const feedbackBox = document.getElementById('feedback-box');
  const btnNext = document.getElementById('btn-next-question');
  feedbackBox.hidden = true;
  btnNext.hidden = true;

  document.getElementById('question-prompt').textContent = t(currentQuestion.prompt, currentQuestion.promptEn);

  const optionsGrid = document.getElementById('options-grid');
  const keys = ['A', 'B', 'C', 'D'];
  optionsGrid.innerHTML = currentQuestion.options.map((opt, idx) => `
    <button class="option-btn" data-index="${idx}">
      <span class="option-key">${keys[idx]}</span>
      <span class="option-text">${opt}</span>
    </button>
  `).join('');

  optionsGrid.querySelectorAll('.option-btn').forEach((btn) => {
    btn.onclick = () => {
      if (!isAnswered) handleAnswer(parseInt(btn.dataset.index, 10));
    };
  });

  startTimer(totalTime);
}

function startTimer(totalTime) {
  clearInterval(timerInterval);
  updateTimerUI(totalTime, totalTime);

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI(timeRemaining, totalTime);

    if (timeRemaining <= 3 && timeRemaining > 0) audio.playTick();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerUI(remaining, totalTime) {
  document.getElementById('hud-timer-sec').textContent = `${remaining}s`;
  const fill = document.getElementById('time-gauge-fill');
  const pct = Math.max(0, (remaining / totalTime) * 100);
  fill.style.width = `${pct}%`;
  fill.className = 'time-gauge-fill' + (pct < 30 ? ' danger' : pct < 60 ? ' warning' : '');
}

function handleAnswer(selectedIndex) {
  if (isAnswered) return;
  isAnswered = true;
  clearInterval(timerInterval);

  const isCorrect = selectedIndex === currentQuestion.correctIndex;
  const scoreResult = calculateQuestionScore({
    stageIndex: activeMode === 'tower' ? Math.min(2, currentFloorIndex) : 1,
    timeRemaining,
    isCorrect,
    currentStreak,
  });

  currentStreak = scoreResult.newStreak;
  if (currentStreak > maxStreak) maxStreak = currentStreak;

  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuestion.correctIndex) btn.classList.add('correct');
    else if (idx === selectedIndex && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) audio.playCorrect();
  else audio.playWrong();

  if (activeMode === 'tower') {
    towerScoreAccumulator += scoreResult.pointsAwarded;
    document.getElementById('hud-tower-score').textContent = towerScoreAccumulator;
  } else if (activeMode === 'duel') {
    duelUserScore += scoreResult.pointsAwarded;

    const rivalCorrect = Math.random() < (activeRival.botAccuracy || 0.75);
    if (rivalCorrect) {
      const rivalTimeRem = Math.floor(Math.random() * 10) + 5;
      const rivalResult = calculateQuestionScore({ stageIndex: 1, timeRemaining: rivalTimeRem, isCorrect: true, currentStreak: 1 });
      duelRivalScore += rivalResult.pointsAwarded;
    }
    updateVersusScores();
  }

  const feedbackBox = document.getElementById('feedback-box');
  const feedbackHeadline = document.getElementById('feedback-headline');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const btnNext = document.getElementById('btn-next-question');

  feedbackBox.hidden = false;
  feedbackBox.className = 'feedback-box ' + (isCorrect ? 'correct' : 'wrong');
  feedbackHeadline.className = 'feedback-headline ' + (isCorrect ? 'correct' : 'wrong');

  if (isCorrect) {
    const streakMsg = currentStreak >= 2 ? ` 🔥 COMBO x${scoreResult.streakMultiplier}!` : '';
    feedbackHeadline.innerHTML = `<span>✓ Chính xác!</span> <span>+${scoreResult.pointsAwarded}đ${streakMsg}</span>`;
  } else {
    feedbackHeadline.innerHTML = `<span>✕ Chưa chính xác!</span> <span>(Đáp án đúng là ${['A', 'B', 'C', 'D'][currentQuestion.correctIndex]})</span>`;
  }

  feedbackExplanation.textContent = currentQuestion.explanation;
  updateStreakBadge();

  btnNext.hidden = false;
  btnNext.focus();
}

function handleTimeout() {
  if (isAnswered) return;
  isAnswered = true;
  currentStreak = 0;
  audio.playWrong();

  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuestion.correctIndex) btn.classList.add('correct');
  });

  const feedbackBox = document.getElementById('feedback-box');
  const feedbackHeadline = document.getElementById('feedback-headline');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const btnNext = document.getElementById('btn-next-question');

  feedbackBox.hidden = false;
  feedbackBox.className = 'feedback-box wrong';
  feedbackHeadline.className = 'feedback-headline wrong';
  feedbackHeadline.innerHTML = `<span>⏰ Hết thời gian!</span> <span>(Đáp án đúng là ${['A', 'B', 'C', 'D'][currentQuestion.correctIndex]})</span>`;
  feedbackExplanation.textContent = currentQuestion.explanation;

  if (activeMode === 'duel') {
    if (Math.random() < (activeRival.botAccuracy || 0.75)) {
      duelRivalScore += 25;
      updateVersusScores();
    }
  }

  updateStreakBadge();
  btnNext.hidden = false;
  btnNext.focus();
}

document.getElementById('btn-next-question').onclick = () => {
  if (currentQuestionIndex + 1 < roundQuestions.length) {
    loadQuestion(currentQuestionIndex + 1);
  } else {
    if (activeMode === 'tower') {
      if (currentFloorIndex < TOWER_FLOORS.length - 1) {
        showFloorClearScreen();
      } else {
        finishTowerMode();
      }
    } else if (activeMode === 'duel') {
      finishDuelMode();
    }
  }
};

function updateStreakBadge() {
  const badge = document.getElementById('hud-streak-badge');
  if (!badge) return;
  if (currentStreak >= 2) {
    badge.hidden = false;
    badge.textContent = `🔥 COMBO ${currentStreak}`;
  } else {
    badge.hidden = true;
  }
}

// --- TOWER TRANSITION & FINISH ---
function showFloorClearScreen() {
  audio.playVictory();
  showScreen(screenFloorClear);

  const floor = TOWER_FLOORS[currentFloorIndex];
  document.getElementById('floor-clear-title').textContent = `Chinh Phục ${t(floor.titleVi, floor.titleEn)}!`;
  document.getElementById('floor-clear-score').textContent = `+${towerScoreAccumulator}`;
  document.getElementById('floor-clear-next-floor').textContent = `Tầng ${floor.floor + 1}`;

  document.getElementById('btn-next-floor').onclick = () => {
    loadTowerFloor(currentFloorIndex + 1);
  };
}

async function finishTowerMode() {
  audio.playVictory();
  currentProfile.xp += towerScoreAccumulator;
  currentProfile.towerFloorsCleared += 5;
  saveUserArenaProfile(currentProfile);

  // Persist score and level progressively into database
  if (auth.isLoggedIn()) {
    auth.recordArenaScore(towerScoreAccumulator, { won: true, lost: false }).then((updated) => {
      if (updated) {
        currentProfile.xp = updated.arenaXp;
        saveUserArenaProfile(currentProfile);
      }
    });
  }

  showFinalResultScreen({
    mode: 'tower',
    titleVi: 'ĐỈNH THÁP PHƯỢNG HOÀNG',
    titleEn: 'PHOENIX APEX CONQUERED',
    subtitleVi: `Bạn đã xuất sắc chinh phục toàn bộ 5 tầng tháp trí tuệ! Đã tích lũy +${towerScoreAccumulator} XP vào cấp độ Đấu Sĩ.`,
    subtitleEn: `You conquered all 5 floors! +${towerScoreAccumulator} XP added to your Fighter Level.`,
    scoreValue: towerScoreAccumulator,
    scoreLabel: 'XP Tích Lũy',
    icon: '🏰',
  });
}

// --- DUEL FINISH (THẮNG ĐƯỢC ĐIỂM, THUA KO ĐƯỢC GÌ) ---
async function finishDuelMode() {
  const duelResult = calculateDuelResult({
    userScore: duelUserScore,
    rivalScore: duelRivalScore,
    victoryBonus: 100,
  });

  const won = duelResult.isWinner;
  const lost = !duelResult.isWinner && !duelResult.isDraw;

  if (won) {
    audio.playVictory();
    currentProfile.duelWins++;
    currentProfile.xp += duelResult.pointsAwarded;
  } else if (duelResult.isDraw) {
    audio.playDefeat();
    currentProfile.duelDraws++;
  } else {
    audio.playDefeat();
    currentProfile.duelLosses++;
  }

  saveUserArenaProfile(currentProfile);

  // Persist score and duel wins/losses progressively into database
  if (auth.isLoggedIn()) {
    auth.recordArenaScore(duelResult.pointsAwarded, { won, lost }).then((updated) => {
      if (updated) {
        currentProfile.xp = updated.arenaXp;
        currentProfile.duelWins = updated.duelWins;
        currentProfile.duelLosses = updated.duelLosses;
        saveUserArenaProfile(currentProfile);
      }
    });
  }

  showFinalResultScreen({
    mode: 'duel',
    titleVi: duelResult.isWinner ? 'CHIẾN THẮNG TUYỆT ĐỐI! 🏆' : 'KẾT THÚC TRẬN ĐẤU',
    titleEn: duelResult.isWinner ? 'EPIC VICTORY! 🏆' : 'MATCH CONCLUDED',
    subtitleVi: duelResult.messageVi,
    subtitleEn: duelResult.messageEn,
    scoreValue: duelResult.pointsAwarded,
    scoreLabel: 'XP Nhận Được',
    icon: duelResult.isWinner ? '👑' : '💔',
    detailHtml: `
      <div style="font-size:16px; font-weight:800; color:#1e1b4b; margin-top:8px;">
        Tỉ số: Bạn ${duelUserScore}đ — ${activeRival.name} ${duelRivalScore}đ (${activeRival.isBot ? '🤖 BOT' : '🟢 Người Thật'})
      </div>
    `,
  });
}

// --- FINAL RESULTS MODAL / SCREEN ---
function showFinalResultScreen({ titleVi, titleEn, subtitleVi, subtitleEn, scoreValue, scoreLabel, icon, detailHtml = '' }) {
  showScreen(screenFinalResult);

  document.getElementById('final-icon').textContent = icon;
  document.getElementById('final-title').textContent = t(titleVi, titleEn);
  document.getElementById('final-subtitle').textContent = t(subtitleVi, subtitleEn);

  document.getElementById('final-stat-score').textContent = `+${scoreValue}`;
  document.getElementById('final-stat-label').textContent = scoreLabel;

  const levelInfo = calculatePlayerLevel(currentProfile.xp);
  document.getElementById('final-stat-level').textContent = `Cấp ${levelInfo.level}`;
  document.getElementById('final-stat-total-xp').textContent = `${currentProfile.xp} XP`;

  const detailBox = document.getElementById('final-match-detail');
  if (detailBox) detailBox.innerHTML = detailHtml;
}

// --- LEADERBOARD SCREEN WITH BOT & HUMAN LABELS ---
async function showLeaderboardScreen() {
  showScreen(screenLeaderboard);
  // Show local/default leaderboard immediately
  const localBoard = getNationalLeaderboard(currentProfile);
  renderLeaderboardItems(localBoard);

  // Fetch live database leaderboard
  try {
    const res = await fetch(`${API_BASE_URL}/arena/leaderboard?limit=20`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      // Base contestants from national leaderboard
      const baseBots = getNationalLeaderboard(null).filter((c) => c.isBot);

      // Real human users with points from database
      const dbUsers = json.data
        .filter((u) => (u.xp || 0) > 0 || (u.duelWins || 0) > 0)
        .map((u) => ({
          name: u.name,
          school: u.school || 'Mind Phoenix Member',
          avatar: u.avatar || '👑',
          level: u.level || 1,
          xp: u.xp || 0,
          wins: u.duelWins || 0,
          isUser: currentUser && (u.id === currentUser.id || u.name === currentUser.name),
          isBot: false,
        }));

      // Combine real players + national bot contestants
      const combined = [...baseBots];
      dbUsers.forEach((user) => {
        const existingIdx = combined.findIndex((c) => c.name === user.name);
        if (existingIdx >= 0) {
          combined[existingIdx] = user;
        } else {
          combined.push(user);
        }
      });

      if (currentUser && currentProfile && !combined.some((c) => c.isUser)) {
        const userLevel = calculatePlayerLevel(currentProfile.xp).level;
        combined.push({
          name: currentProfile.name,
          school: currentProfile.school || 'Mind Phoenix Member',
          avatar: currentProfile.avatar || '👑',
          level: userLevel,
          xp: currentProfile.xp || 0,
          wins: currentProfile.duelWins || 0,
          isUser: true,
          isBot: false,
        });
      }

      combined.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const ranked = combined.map((item, idx) => ({ rank: idx + 1, ...item }));
      renderLeaderboardItems(ranked);
    }
  } catch (err) {
    console.warn('Could not load online leaderboard, fallback to local:', err);
  }
}

function renderLeaderboardItems(board) {
  const listEl = document.getElementById('national-leaderboard-list');
  if (!listEl) return;

  listEl.innerHTML = board.map((item) => {
    let typeBadgeHtml = '';
    if (item.isUser) {
      typeBadgeHtml = `<span class="badge-human" style="font-size: 10px; margin-left: 6px;"><span class="badge-pulse-dot"></span> BẠN</span>`;
    } else if (item.isBot) {
      typeBadgeHtml = `<span class="badge-bot" style="font-size: 10px; margin-left: 6px;">🤖 BOT</span>`;
    } else {
      typeBadgeHtml = `<span class="badge-human" style="font-size: 10px; margin-left: 6px;"><span class="badge-pulse-dot"></span> NGƯỜI THẬT</span>`;
    }

    return `
      <li class="leaderboard-item ${item.isUser ? 'is-user' : ''}">
        <div class="item-left">
          <span class="rank-badge rank-${item.rank}">${item.rank}</span>
          <span style="font-size: 24px;">${item.avatar}</span>
          <div>
            <div style="display: flex; align-items: center;">
              <span>${item.name}</span>
              ${typeBadgeHtml}
            </div>
            <span class="item-school">${item.school} · Cấp ${item.level}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font: 800 16px 'Baloo 2', monospace; color: #ea580c;">${item.xp} XP</span>
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">${item.wins} trận thắng</div>
        </div>
      </li>
    `;
  }).join('');
}

// --- EVENT LISTENERS & NAVIGATION ---
function setupEventListeners() {
  const btnAuthOpen = document.getElementById('btn-open-auth-modal');
  if (btnAuthOpen) {
    btnAuthOpen.onclick = () => auth.openModal('login');
  }

  document.querySelectorAll('[data-action="hub"]').forEach((btn) => {
    btn.onclick = () => {
      clearInterval(timerInterval);
      showScreen(screenHub);
      renderProfileCard();
    };
  });

  window.addEventListener('keydown', (e) => {
    if (!screenBattle || screenBattle.hidden) {
      if (e.key === 'Enter') {
        if (!screenFloorClear.hidden) document.getElementById('btn-next-floor').click();
      }
      return;
    }

    if (!isAnswered) {
      if (['1', 'a', 'A'].includes(e.key)) handleAnswer(0);
      else if (['2', 'b', 'B'].includes(e.key)) handleAnswer(1);
      else if (['3', 'c', 'C'].includes(e.key)) handleAnswer(2);
      else if (['4', 'd', 'D'].includes(e.key)) handleAnswer(3);
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('btn-next-question').click();
      }
    }
  });
}

function showScreen(target) {
  [
    screenAuthRequired,
    screenHub,
    screenRivalSelect,
    screenBattle,
    screenFloorClear,
    screenFinalResult,
    screenLeaderboard,
  ].forEach((s) => {
    if (s) s.hidden = s !== target;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
