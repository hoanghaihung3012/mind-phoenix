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

// DOM Screens
const screenAuthRequired = document.getElementById('screen-auth-required');
const screenHub = document.getElementById('screen-hub');
const screenRivalSelect = document.getElementById('screen-rival-select');
const screenBattle = document.getElementById('screen-battle');
const screenFloorClear = document.getElementById('screen-floor-clear');
const screenFinalResult = document.getElementById('screen-final-result');
const screenLeaderboard = document.getElementById('screen-leaderboard');

// Helpers for Language
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
  window.addEventListener('mindphoenix-auth-change', (e) => {
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
}

function checkAuthAndRender() {
  if (auth.isLoggedIn()) {
    currentUser = auth.user;
    currentProfile = getUserArenaProfile(currentUser.email || currentUser.id, currentUser.name);
    showScreen(screenHub);
    renderProfileCard();
    renderModeCards();
  } else {
    currentUser = null;
    currentProfile = null;
    showScreen(screenAuthRequired);
  }
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
  // Setup button handlers in Hub
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

  // Tower Map Visuals
  renderTowerMap();

  // Hide duel versus HUD, show tower HUD
  document.getElementById('versus-hud').hidden = true;
  document.getElementById('tower-hud').hidden = false;

  document.getElementById('hud-floor-title').textContent = `${floorConfig.icon} ${t(floorConfig.titleVi, floorConfig.titleEn)}`;
  document.getElementById('hud-tower-score').textContent = towerScoreAccumulator;

  // Gather questions for floor
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
  // Pull from available LESSONS matching subject
  let pool = [];
  const relevantLessons = subjectId === 'all'
    ? LESSONS
    : LESSONS.filter((l) => l.subjectId === subjectId);

  relevantLessons.forEach((l) => {
    // Map floor (0..4) to stage (0..2)
    const stage = Math.min(2, Math.floor(floorIdx / 2));
    const matching = l.questions.filter((q) => q.stage === stage);
    pool.push(...matching);
  });

  return shuffleArray(pool).slice(0, 4); // 4 questions per floor
}

// --- MODE 2: ĐẤU ĐỐI KHÁNG 1v1 (PVP DUEL) ---
function showRivalSelectScreen() {
  showScreen(screenRivalSelect);
  const container = document.getElementById('rivals-grid');
  if (!container) return;

  container.innerHTML = DUEL_RIVALS.map((rival) => `
    <div class="rival-card">
      <div class="rival-left">
        <div class="rival-avatar">${rival.avatar}</div>
        <div class="rival-meta">
          <h4>${rival.name}</h4>
          <span class="rival-school">${rival.school}</span>
          <span class="rival-stats">Cấp ${rival.level} · Thắng: ${rival.winRate}</span>
        </div>
      </div>
      <button class="btn-challenge" data-rival-id="${rival.id}">
        <span>Thách Đấu ⚔️</span>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-challenge').forEach((btn) => {
    btn.onclick = () => {
      const rival = DUEL_RIVALS.find((r) => r.id === btn.dataset.rivalId) || DUEL_RIVALS[0];
      startDuelMatch(rival);
    };
  });

  document.getElementById('btn-auto-match').onclick = () => {
    const randomRival = DUEL_RIVALS[Math.floor(Math.random() * DUEL_RIVALS.length)];
    startDuelMatch(randomRival);
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

  // Prepare questions for 5 duel rounds
  let allQ = [];
  LESSONS.forEach((l) => allQ.push(...l.questions));
  roundQuestions = shuffleArray(allQ).slice(0, DUEL_TOTAL_ROUNDS);

  showScreen(screenBattle);
  document.getElementById('tower-map-container').innerHTML = '';
  document.getElementById('tower-hud').hidden = true;
  document.getElementById('versus-hud').hidden = false;

  // Setup Versus Header
  document.getElementById('duel-user-name').textContent = currentProfile.name;
  document.getElementById('duel-rival-name').textContent = rival.name;
  document.getElementById('duel-rival-avatar').textContent = rival.avatar;
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

  // Update HUD
  document.getElementById('hud-question-number').textContent = `${qIndex + 1}/${roundQuestions.length}`;
  updateStreakBadge();

  // Reset Feedback & Next Button
  const feedbackBox = document.getElementById('feedback-box');
  const btnNext = document.getElementById('btn-next-question');
  feedbackBox.hidden = true;
  btnNext.hidden = true;

  // Render Prompt
  document.getElementById('question-prompt').textContent = t(currentQuestion.prompt, currentQuestion.promptEn);

  // Render Options
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

  // Highlight choices
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuestion.correctIndex) btn.classList.add('correct');
    else if (idx === selectedIndex && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) audio.playCorrect();
  else audio.playWrong();

  // Mode Specific scoring
  if (activeMode === 'tower') {
    towerScoreAccumulator += scoreResult.pointsAwarded;
    document.getElementById('hud-tower-score').textContent = towerScoreAccumulator;
  } else if (activeMode === 'duel') {
    duelUserScore += scoreResult.pointsAwarded;

    // Simulate Rival response based on botAccuracy
    const rivalCorrect = Math.random() < activeRival.botAccuracy;
    if (rivalCorrect) {
      const rivalTimeRem = Math.floor(Math.random() * 10) + 5;
      const rivalResult = calculateQuestionScore({ stageIndex: 1, timeRemaining: rivalTimeRem, isCorrect: true, currentStreak: 1 });
      duelRivalScore += rivalResult.pointsAwarded;
    }
    updateVersusScores();
  }

  // Show Feedback
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
    // Rival might still get points
    if (Math.random() < activeRival.botAccuracy) {
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
    // Round / Floor Completed
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

function finishTowerMode() {
  audio.playVictory();

  // Accumulate XP into user's profile and save
  currentProfile.xp += towerScoreAccumulator;
  currentProfile.towerFloorsCleared += 5;
  saveUserArenaProfile(currentProfile);

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
function finishDuelMode() {
  const duelResult = calculateDuelResult({
    userScore: duelUserScore,
    rivalScore: duelRivalScore,
    victoryBonus: 100,
  });

  if (duelResult.isWinner) {
    audio.playVictory();
    currentProfile.duelWins++;
    currentProfile.xp += duelResult.pointsAwarded; // Win gets points + bonus
  } else if (duelResult.isDraw) {
    audio.playDefeat();
    currentProfile.duelDraws++;
    // Draw: 0 points
  } else {
    audio.playDefeat();
    currentProfile.duelLosses++;
    // Thua: KO ĐƯỢC GÌ (0 points)
  }

  saveUserArenaProfile(currentProfile);

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
        Tỉ số: Bạn ${duelUserScore}đ — ${activeRival.name} ${duelRivalScore}đ
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

// --- LEADERBOARD SCREEN ---
function showLeaderboardScreen() {
  showScreen(screenLeaderboard);
  const board = getNationalLeaderboard(currentProfile);
  const listEl = document.getElementById('national-leaderboard-list');

  listEl.innerHTML = board.map((item) => `
    <li class="leaderboard-item ${item.isUser ? 'is-user' : ''}">
      <div class="item-left">
        <span class="rank-badge rank-${item.rank}">${item.rank}</span>
        <span style="font-size: 24px;">${item.avatar}</span>
        <div>
          <div>${item.name} ${item.isUser ? '<strong>(Bạn)</strong>' : ''}</div>
          <span class="item-school">${item.school} · Cấp ${item.level}</span>
        </div>
      </div>
      <div style="text-align: right;">
        <span style="font: 800 16px 'Baloo 2', monospace; color: #ea580c;">${item.xp} XP</span>
        <div style="font-size: 11px; color: #64748b; font-weight: 700;">${item.wins} trận thắng</div>
      </div>
    </li>
  `).join('');
}

// --- EVENT LISTENERS & NAVIGATION ---
function setupEventListeners() {
  // Auth login trigger
  const btnAuthOpen = document.getElementById('btn-open-auth-modal');
  if (btnAuthOpen) {
    btnAuthOpen.onclick = () => auth.openModal('login');
  }

  // Back to Hub
  document.querySelectorAll('[data-action="hub"]').forEach((btn) => {
    btn.onclick = () => {
      clearInterval(timerInterval);
      showScreen(screenHub);
      renderProfileCard();
    };
  });

  // Keyboard navigation (1, 2, 3, 4, Enter)
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
