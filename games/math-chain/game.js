import {
  createBoard,
  isAdjacent,
  isValidChain,
  calculateChainSum,
  evaluateChain,
  collapseBoard,
  hasPossibleMove,
  LEVELS,
  GRID_COLS,
  GRID_ROWS,
} from './chain.mjs';
import { createGameAudio } from '../../shared/core/audio.mjs';
import { english, initGameLanguage } from '../i18n.mjs';

const i18n = initGameLanguage();
const text = i18n.text;
const $ = (id) => document.getElementById(id);

// Canvas
const canvas = $('chain-canvas');
const ctx = canvas.getContext('2d');

// HUD Elements
const targetValueEl = $('target-value');
const scoreValueEl = $('score-value');
const timeValueEl = $('time-value');
const levelValueEl = $('level-value');
const sumIndicator = $('sum-indicator');
const shuffleBtn = $('shuffle-btn');
const restartBtn = $('restart-btn');
const soundBtn = $('sound-toggle');

// Modals
const winDialog = $('win-dialog');
const gameoverDialog = $('gameover-dialog');
const winMessage = $('win-message');
const modalReplayBtn = $('modal-replay-btn');
const modalNextBtn = $('modal-next-btn');
const modalTryAgainBtn = $('modal-tryagain-btn');

// Audio Engine
const audio = createGameAudio({
  theme: 'duck',
  button: soundBtn,
  i18n,
});

// Game State
let currentLevelId = 1;
let currentLevel = LEVELS[0];
let board = [];
let score = 0;
let currentTarget = 10;
let timeLeft = 90;
let timerInterval = null;
let isGameOver = false;

// Interaction State
let isDragging = false;
let activeChain = []; // [{ r, c }]
let particles = [];
let floatingTexts = [];

function init() {
  loadLevel(1);
  setupEvents();
  requestAnimationFrame(gameLoop);
}

function loadLevel(lvlId) {
  currentLevelId = Math.max(1, Math.min(LEVELS.length, lvlId));
  currentLevel = LEVELS[currentLevelId - 1];
  currentTarget = currentLevel.target;
  score = 0;
  timeLeft = currentLevel.timeLimit;
  isGameOver = false;
  activeChain = [];
  particles = [];
  floatingTexts = [];

  board = createBoard(GRID_COLS, GRID_ROWS);
  ensureMoveExists();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(onTick, 1000);

  updateHUD();
}

function onTick() {
  if (isGameOver) return;
  timeLeft--;
  timeValueEl.textContent = `${timeLeft}s`;

  if (timeLeft <= 10) {
    timeValueEl.style.color = '#ef4444';
  } else {
    timeValueEl.style.color = 'inherit';
  }

  if (timeLeft <= 0) {
    gameOver();
  }
}

function ensureMoveExists() {
  let attempts = 0;
  while (!hasPossibleMove(board, currentTarget) && attempts < 10) {
    board = createBoard(GRID_COLS, GRID_ROWS);
    attempts++;
  }
}

function updateHUD() {
  targetValueEl.textContent = currentTarget;
  scoreValueEl.textContent = `${score} / ${currentLevel.goalScore}`;
  timeValueEl.textContent = `${timeLeft}s`;
  levelValueEl.textContent = `${currentLevelId}/${LEVELS.length}`;
  updateSumIndicator();
}

function updateSumIndicator() {
  if (!activeChain.length) {
    sumIndicator.className = 'sum-indicator';
    sumIndicator.textContent = i18n.t(
      `Nối các số đạt tổng ${currentTarget}!`,
      `Chain numbers to reach ${currentTarget}!`
    );
    return;
  }

  const values = activeChain.map((p) => board[p.r][p.c].value);
  const sum = calculateChainSum(activeChain, board);
  const formula = values.join(' + ') + ` = ${sum}`;

  if (sum === currentTarget) {
    sumIndicator.className = 'sum-indicator match';
    sumIndicator.textContent = `${formula} 💥 (Thả tay để nổ!)`;
  } else if (sum > currentTarget) {
    sumIndicator.className = 'sum-indicator overflow';
    sumIndicator.textContent = `${formula} (Quá số ${currentTarget} rồi!)`;
  } else {
    sumIndicator.className = 'sum-indicator';
    sumIndicator.textContent = `${formula} (Cần thêm ${currentTarget - sum})`;
  }
}

function getCellCoordinates(r, c) {
  const cellSize = canvas.width / GRID_COLS;
  return {
    x: c * cellSize + cellSize / 2,
    y: r * cellSize + cellSize / 2,
    radius: cellSize * 0.4,
    size: cellSize,
  };
}

function getCellAtPoint(x, y) {
  const cellSize = canvas.width / GRID_COLS;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);
  if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
    return { r, c };
  }
  return null;
}

function onPointerDown(e) {
  if (isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const cell = getCellAtPoint(x, y);
  if (cell) {
    isDragging = true;
    activeChain = [cell];
    audio.activate();
    playNote(1);
    updateSumIndicator();
  }
}

function onPointerMove(e) {
  if (!isDragging || isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const cell = getCellAtPoint(x, y);
  if (!cell) return;

  const last = activeChain[activeChain.length - 1];
  if (!last) return;

  // Backtracking support: If sliding back to the second to last cell
  if (activeChain.length > 1) {
    const secondLast = activeChain[activeChain.length - 2];
    if (secondLast.r === cell.r && secondLast.c === cell.c) {
      activeChain.pop();
      playNote(activeChain.length);
      updateSumIndicator();
      return;
    }
  }

  // Check if cell is already in chain
  const alreadyInChain = activeChain.some((p) => p.r === cell.r && p.c === cell.c);
  if (!alreadyInChain && isAdjacent(last, cell)) {
    activeChain.push(cell);
    playNote(activeChain.length);
    updateSumIndicator();
  }
}

function onPointerUp() {
  if (!isDragging) return;
  isDragging = false;

  if (activeChain.length >= 2) {
    const res = evaluateChain(activeChain, board, currentTarget);
    if (res.match) {
      handleMatch(res);
    } else {
      // Failed chain audio
      audio.tone(220, 0.15, { type: 'sawtooth', to: 150, volume: 0.08 });
    }
  }

  activeChain = [];
  updateSumIndicator();
}

function playNote(step) {
  // Pitch goes up with chain length
  const freqs = [330, 392, 440, 523, 587, 659, 784, 880, 988];
  const freq = freqs[Math.min(freqs.length - 1, step - 1)];
  audio.tone(freq, 0.08, { type: 'sine', volume: 0.1 });
}

function handleMatch(res) {
  score += res.points;

  // Particle bursts & sound
  const chainCoords = activeChain.map((p) => getCellCoordinates(p.r, p.c));
  chainCoords.forEach((pt) => {
    spawnBurst(pt.x, pt.y, '#f59e0b');
  });

  const lastPt = chainCoords[chainCoords.length - 1];
  spawnFloatingText(lastPt.x, lastPt.y, `+${res.points}`);

  if (res.hasBomb) {
    audio.tone(150, 0.35, { type: 'square', to: 50, volume: 0.25 });
  } else {
    audio.chime([523, 659, 784, 1046], 0.06);
  }

  // Collapse grid
  const collapseRes = collapseBoard(board, activeChain);
  board = collapseRes.board;

  // Dynamic target update if applicable
  if (currentLevel.targetType === 'dynamic' && Array.isArray(currentLevel.targetsPool)) {
    const pool = currentLevel.targetsPool.filter((t) => t !== currentTarget);
    currentTarget = pool[Math.floor(Math.random() * pool.length)];
  }

  ensureMoveExists();
  updateHUD();

  // Check victory
  if (score >= currentLevel.goalScore) {
    levelWin();
  }
}

function spawnBurst(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      radius: 3 + Math.random() * 3,
      alpha: 1,
    });
  }
}

function spawnFloatingText(x, y, str) {
  floatingTexts.push({
    x,
    y,
    text: str,
    alpha: 1,
    vy: -1.5,
  });
}

function levelWin() {
  isGameOver = true;
  clearInterval(timerInterval);
  audio.chime([523, 659, 784, 1046, 1318], 0.08);

  winMessage.textContent = i18n.t(
    `Xuất sắc! Bạn đã đạt ${score} điểm và vượt qua Màn ${currentLevelId}!`,
    `Awesome! You scored ${score} points and passed Level ${currentLevelId}!`
  );
  winDialog.showModal();
}

function gameOver() {
  isGameOver = true;
  clearInterval(timerInterval);
  audio.tone(200, 0.4, { type: 'sawtooth', to: 80, volume: 0.15 });
  gameoverDialog.showModal();
}

/* RENDERING */
function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Connecting Line for Active Chain
  if (activeChain.length >= 2) {
    ctx.save();
    ctx.beginPath();
    activeChain.forEach((p, idx) => {
      const pt = getCellCoordinates(p.r, p.c);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();
  }

  // 2. Draw Bubbles
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const bubble = board[r][c];
      if (!bubble) continue;

      const pt = getCellCoordinates(r, c);
      const isSelected = activeChain.some((p) => p.r === r && p.c === c);

      ctx.save();
      ctx.translate(pt.x, pt.y);

      if (isSelected) {
        ctx.scale(1.15, 1.15);
      }

      // Outer glow / circle
      ctx.beginPath();
      ctx.arc(0, 0, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.shadowColor = isSelected ? '#ffffff' : bubble.color;
      ctx.shadowBlur = isSelected ? 16 : 6;
      ctx.fill();

      // Top highlight bubble gloss
      ctx.beginPath();
      ctx.arc(-pt.radius * 0.25, -pt.radius * 0.25, pt.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      // Number text
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(pt.radius * 1.05)}px 'Baloo 2', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(bubble.value, 0, 2);

      // Bomb badge if applicable
      if (bubble.isBomb) {
        ctx.font = '14px sans-serif';
        ctx.fillText('💣', pt.radius * 0.5, -pt.radius * 0.5);
      }

      ctx.restore();
    }
  }

  // 3. Draw Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.025;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
    ctx.restore();
  }

  // 4. Draw Floating Texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 0.02;

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.font = "800 24px 'Baloo 2', sans-serif";
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.globalAlpha = ft.alpha;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function setupEvents() {
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  shuffleBtn.addEventListener('click', () => {
    if (isGameOver) return;
    board = createBoard(GRID_COLS, GRID_ROWS);
    ensureMoveExists();
    audio.tone(450, 0.1, { type: 'triangle', volume: 0.1 });
  });

  restartBtn.addEventListener('click', () => {
    loadLevel(currentLevelId);
  });

  modalReplayBtn.addEventListener('click', () => {
    winDialog.close();
    loadLevel(currentLevelId);
  });

  modalNextBtn.addEventListener('click', () => {
    winDialog.close();
    if (currentLevelId < LEVELS.length) {
      loadLevel(currentLevelId + 1);
    } else {
      loadLevel(1);
    }
  });

  modalTryAgainBtn.addEventListener('click', () => {
    gameoverDialog.close();
    loadLevel(currentLevelId);
  });

  i18n.onChange(() => {
    updateHUD();
    updateSumIndicator();
  });
}

document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') init();
