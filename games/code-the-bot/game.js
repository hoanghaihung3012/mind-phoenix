import {
  LEVELS,
  DIRECTIONS,
  DIR_VECTORS,
  getLevel,
  simulate,
  expandCommands,
} from './bot.mjs';
import { createGameAudio } from '../../shared/core/audio.mjs';
import { english, initGameLanguage } from '../i18n.mjs';

const i18n = initGameLanguage();
const text = i18n.text;
const $ = (id) => document.getElementById(id);

// Canvas & Context
const canvas = $('game-canvas');
const ctx = canvas.getContext('2d');

// Elements
const levelBadge = $('level-badge');
const levelTitle = $('level-title');
const levelHint = $('level-hint');
const starsDisplay = $('stars-display');
const statusBar = $('status-bar');
const paletteContainer = $('palette-buttons');
const programQueue = $('program-queue');
const blockCounter = $('block-counter');
const runBtn = $('run-btn');
const stepBtn = $('step-btn');
const resetBtn = $('reset-btn');
const clearBtn = $('clear-btn');
const prevLevelBtn = $('prev-level');
const nextLevelBtn = $('next-level');
const winDialog = $('win-dialog');
const winDesc = $('win-desc');
const winStars = $('win-stars');
const replayBtn = $('replay-btn');
const nextLvlBtn = $('next-lvl-btn');
const soundBtn = $('sound-toggle');

// Audio Engine
const audio = createGameAudio({
  theme: 'duck',
  button: soundBtn,
  i18n,
});

// Mascot image
const cmdImg = new Image();
cmdImg.src = '../../assets/mascots/minddev-cmd-happy.webp';

// State
let currentLevelId = 1;
let currentLevel = getLevel(1);
let program = []; // [{ id, type, body? }]
let isRunning = false;
let executionTimer = null;
let simulationResult = null;
let currentStep = 0;
let botVisual = { x: 1, y: 1, dir: DIRECTIONS.RIGHT, scale: 1, jumping: false };
let collectedStars = new Set();

function init() {
  loadLevel(1);
  setupEvents();
  renderGrid();
}

function loadLevel(id) {
  currentLevelId = Math.max(1, Math.min(LEVELS.length, id));
  currentLevel = getLevel(currentLevelId);
  program = [];
  resetExecution();

  // Update UI
  levelBadge.textContent = currentLevel.id;
  levelTitle.textContent = i18n.t(currentLevel.title.vi, currentLevel.title.en);
  levelHint.textContent = i18n.t(currentLevel.hint.vi, currentLevel.hint.en);

  prevLevelBtn.disabled = currentLevelId <= 1;
  nextLevelBtn.disabled = currentLevelId >= LEVELS.length;

  updatePalette();
  updateProgramUI();
  updateStarsRating(0);

  // Resize canvas for level dimensions
  resizeCanvas();
  renderGrid();
}

function resizeCanvas() {
  const cellSize = Math.min(68, Math.floor(440 / Math.max(currentLevel.width, currentLevel.height)));
  canvas.width = currentLevel.width * cellSize;
  canvas.height = currentLevel.height * cellSize;
}

function resetExecution() {
  if (executionTimer) clearInterval(executionTimer);
  isRunning = false;
  currentStep = 0;
  simulationResult = null;
  botVisual = {
    x: currentLevel.start.x,
    y: currentLevel.start.y,
    dir: currentLevel.start.dir,
    scale: 1,
    jumping: false,
  };
  collectedStars.clear();
  runBtn.disabled = false;
  stepBtn.disabled = false;
  statusBar.className = 'status-bar';
  statusBar.textContent = i18n.t('Sẵn sàng lập trình', 'Ready to code');
  clearHighlight();
  renderGrid();
}

function updatePalette() {
  const available = currentLevel.availableCommands || ['forward', 'turn-left', 'turn-right'];
  const buttons = paletteContainer.querySelectorAll('.cmd-btn');
  buttons.forEach((btn) => {
    const cmd = btn.dataset.cmd;
    if (available.includes(cmd)) {
      btn.style.display = 'inline-flex';
    } else {
      btn.style.display = 'none';
    }
  });
}

function addCommand(type) {
  if (isRunning) return;
  if (type.startsWith('repeat-')) {
    program.push({
      type,
      body: ['forward'],
    });
  } else {
    program.push(type);
  }
  audio.tone(440, 0.05, { type: 'sine', volume: 0.08 });
  updateProgramUI();
}

function removeCommand(index) {
  if (isRunning) return;
  program.splice(index, 1);
  audio.tone(330, 0.05, { type: 'sine', volume: 0.08 });
  updateProgramUI();
}

function updateProgramUI() {
  programQueue.innerHTML = '';
  program.forEach((cmd, idx) => {
    const item = document.createElement('div');
    item.className = 'block-item';
    item.dataset.index = idx;

    const label = document.createElement('div');
    label.className = 'block-label';

    let title = '';
    let icon = '';

    if (typeof cmd === 'string') {
      if (cmd === 'forward') {
        icon = '⬆️';
        title = i18n.t('Tiến 1 ô', 'Move Forward');
      } else if (cmd === 'turn-left') {
        icon = '↺';
        title = i18n.t('Rẽ trái 90°', 'Turn Left');
      } else if (cmd === 'turn-right') {
        icon = '↻';
        title = i18n.t('Rẽ phải 90°', 'Turn Right');
      } else if (cmd === 'jump') {
        icon = '🦘';
        title = i18n.t('Nhảy vượt ô', 'Jump Over');
      }
    } else if (cmd && typeof cmd === 'object') {
      icon = '🔁';
      title = i18n.t(`Lặp lại (${cmd.type.replace('repeat-', '')}x Tiến)`, `Repeat (${cmd.type.replace('repeat-', '')}x Forward)`);
    }

    label.innerHTML = `<span>${icon}</span> <span>${idx + 1}. ${title}</span>`;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-block-btn';
    delBtn.innerHTML = '✕';
    delBtn.title = i18n.t('Xóa lệnh này', 'Delete command');
    delBtn.onclick = (e) => {
      e.stopPropagation();
      removeCommand(idx);
    };

    item.appendChild(label);
    item.appendChild(delBtn);
    programQueue.appendChild(item);
  });

  const count = program.length;
  blockCounter.textContent = i18n.t(`${count} khối lệnh`, `${count} blocks`);
}

function highlightCommand(originalIndex) {
  clearHighlight();
  if (originalIndex !== null && originalIndex !== undefined) {
    const el = programQueue.children[originalIndex];
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function clearHighlight() {
  const items = programQueue.querySelectorAll('.block-item');
  items.forEach((it) => it.classList.remove('active'));
}

function startExecution() {
  if (isRunning) return;
  if (!program.length) {
    statusBar.className = 'status-bar fail';
    statusBar.textContent = i18n.t('Hãy thêm ít nhất một lệnh!', 'Add at least one command!');
    return;
  }

  resetExecution();
  simulationResult = simulate(currentLevel, program);
  isRunning = true;
  runBtn.disabled = true;
  stepBtn.disabled = true;

  audio.activate();

  let stepIdx = 0;
  executionTimer = setInterval(() => {
    stepIdx++;
    if (stepIdx < simulationResult.steps.length) {
      applyStep(simulationResult.steps[stepIdx]);
    } else {
      clearInterval(executionTimer);
      finishExecution();
    }
  }, 380);
}

function stepExecution() {
  if (isRunning) return;
  if (!simulationResult) {
    simulationResult = simulate(currentLevel, program);
    currentStep = 0;
  }

  audio.activate();
  currentStep++;
  if (currentStep < simulationResult.steps.length) {
    applyStep(simulationResult.steps[currentStep]);
  } else {
    finishExecution();
  }
}

function applyStep(step) {
  botVisual.x = step.x;
  botVisual.y = step.y;
  botVisual.dir = step.dir;

  // Sound effect
  if (step.action === 'turn-left' || step.action === 'turn-right') {
    audio.tone(520, 0.04, { type: 'triangle', volume: 0.08 });
  } else if (step.action === 'jump') {
    audio.tone(350, 0.12, { type: 'sine', to: 650, volume: 0.1 });
  } else if (step.action === 'teleport') {
    audio.tone(700, 0.18, { type: 'triangle', to: 1100, volume: 0.12 });
  } else if (step.action === 'goal') {
    audio.chime([523, 659, 784, 1046], 0.08);
  } else if (step.action === 'bump' || step.action === 'bug' || step.action === 'fail') {
    audio.tone(180, 0.2, { type: 'sawtooth', to: 80, volume: 0.15 });
  } else {
    // Normal forward
    audio.tone(440, 0.04, { type: 'sine', volume: 0.06 });
  }

  // Star pickup
  const starIdx = currentLevel.stars.findIndex((s) => s.x === step.x && s.y === step.y);
  if (starIdx !== -1 && !collectedStars.has(starIdx)) {
    collectedStars.add(starIdx);
    audio.tone(880, 0.1, { type: 'sine', volume: 0.12 });
  }

  // Highlight original command block
  if (step.commandId !== null) {
    const rawRoot = String(step.commandId).split('.')[0].split('[')[0];
    highlightCommand(parseInt(rawRoot, 10));
  }

  renderGrid();
}

function finishExecution() {
  isRunning = false;
  runBtn.disabled = false;
  stepBtn.disabled = false;

  const res = simulationResult;
  if (res.success) {
    statusBar.className = 'status-bar success';
    statusBar.textContent = i18n.t(
      `Thành công! Đã nhặt ${res.starsEarned}/${res.totalStars} sao!`,
      `Success! Collected ${res.starsEarned}/${res.totalStars} stars!`
    );
    updateStarsRating(res.starsEarned);
    showWinDialog(res);
  } else {
    statusBar.className = 'status-bar fail';
    statusBar.textContent = i18n.t(res.message, res.message);
  }
}

function updateStarsRating(earned) {
  const stars = starsDisplay.children;
  for (let i = 0; i < 3; i++) {
    if (i < earned) {
      stars[i].classList.add('filled');
    } else {
      stars[i].classList.remove('filled');
    }
  }
}

function showWinDialog(res) {
  const starText = '★'.repeat(res.starsEarned) + '☆'.repeat(Math.max(0, 3 - res.starsEarned));
  winStars.textContent = starText;
  winDesc.textContent = i18n.t(
    `Cmd đã được sạc đầy năng lượng với ${res.commandsUsed} khối lệnh!`,
    `Cmd is powered up using ${res.commandsUsed} blocks!`
  );
  winDialog.showModal();
}

/* CANVAS RENDERING */
function renderGrid() {
  const cellSize = canvas.width / currentLevel.width;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Grid Tiles
  for (let r = 0; r < currentLevel.height; r++) {
    for (let c = 0; c < currentLevel.width; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      ctx.fillStyle = (r + c) % 2 === 0 ? '#1e293b' : '#172554';
      ctx.fillRect(x, y, cellSize, cellSize);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  // 2. Draw Walls
  (currentLevel.walls || []).forEach((w) => {
    const x = w.x * cellSize;
    const y = w.y * cellSize;
    ctx.fillStyle = w.jumpable ? '#64748b' : '#475569';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, cellSize - 8, cellSize - 8, 8);
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (w.jumpable) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${Math.floor(cellSize * 0.3)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦘', x + cellSize / 2, y + cellSize / 2);
    }
  });

  // 3. Draw Teleports
  (currentLevel.teleports || []).forEach((tp) => {
    drawPortal(tp.from.x * cellSize + cellSize / 2, tp.from.y * cellSize + cellSize / 2, cellSize * 0.35, '#38bdf8');
    drawPortal(tp.to.x * cellSize + cellSize / 2, tp.to.y * cellSize + cellSize / 2, cellSize * 0.35, '#c084fc');
  });

  // 4. Draw Stars
  currentLevel.stars.forEach((s, idx) => {
    if (!collectedStars.has(idx)) {
      drawStar(s.x * cellSize + cellSize / 2, s.y * cellSize + cellSize / 2, cellSize * 0.28, '#f59e0b');
    }
  });

  // 5. Draw Bugs
  (currentLevel.bugs || []).forEach((b) => {
    drawBug(b.x * cellSize + cellSize / 2, b.y * cellSize + cellSize / 2, cellSize * 0.32);
  });

  // 6. Draw Goal Socket
  drawGoalSocket(
    currentLevel.goal.x * cellSize + cellSize / 2,
    currentLevel.goal.y * cellSize + cellSize / 2,
    cellSize * 0.38
  );

  // 7. Draw Cmd Bot
  drawBot(
    botVisual.x * cellSize + cellSize / 2,
    botVisual.y * cellSize + cellSize / 2,
    cellSize * 0.42,
    botVisual.dir
  );
}

function drawPortal(cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

function drawStar(cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  const spikes = 5;
  const step = Math.PI / spikes;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;

  ctx.moveTo(cx, cy - r);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * r;
    y = cy + Math.sin(rot) * r;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * (r * 0.45);
    y = cy + Math.sin(rot) * (r * 0.45);
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - r);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();
}

function drawBug(cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Bug spots
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.2, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.3, cy - r * 0.2, r * 0.2, 0, Math.PI * 2);
  ctx.arc(cx, cy + r * 0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.4, cy - r * 0.6);
  ctx.lineTo(cx - r * 0.8, cy - r * 1.1);
  ctx.moveTo(cx + r * 0.4, cy - r * 0.6);
  ctx.lineTo(cx + r * 0.8, cy - r * 1.1);
  ctx.stroke();
  ctx.restore();
}

function drawGoalSocket(cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#34d399';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(cx - r, cy - r, r * 2, r * 2, 8);
  ctx.fill();

  // Plug holes
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(cx - r * 0.4, cy - r * 0.35, r * 0.25, r * 0.7);
  ctx.fillRect(cx + r * 0.15, cy - r * 0.35, r * 0.25, r * 0.7);
  ctx.restore();
}

function drawBot(cx, cy, r, dir) {
  ctx.save();
  ctx.translate(cx, cy);

  // Rotation: UP = -90deg, RIGHT = 0, DOWN = 90deg, LEFT = 180deg
  const angles = [ -Math.PI / 2, 0, Math.PI / 2, Math.PI ];
  ctx.rotate(angles[dir]);

  if (cmdImg.complete && cmdImg.naturalWidth !== 0) {
    ctx.drawImage(cmdImg, -r, -r, r * 2, r * 2);
  } else {
    // Fallback vector robot
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.roundRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6, 6);
    ctx.fill();

    // Eye pointer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.3, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(r * 0.35, 0, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Direction pointer arrow
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(r * 0.9, 0);
  ctx.lineTo(r * 0.5, -r * 0.3);
  ctx.lineTo(r * 0.5, r * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function setupEvents() {
  paletteContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.cmd-btn');
    if (btn) addCommand(btn.dataset.cmd);
  });

  runBtn.addEventListener('click', startExecution);
  stepBtn.addEventListener('click', stepExecution);
  resetBtn.addEventListener('click', resetExecution);
  clearBtn.addEventListener('click', () => {
    if (isRunning) return;
    program = [];
    resetExecution();
    updateProgramUI();
  });

  prevLevelBtn.addEventListener('click', () => {
    if (currentLevelId > 1) loadLevel(currentLevelId - 1);
  });

  nextLevelBtn.addEventListener('click', () => {
    if (currentLevelId < LEVELS.length) loadLevel(currentLevelId + 1);
  });

  replayBtn.addEventListener('click', () => {
    winDialog.close();
    resetExecution();
  });

  nextLvlBtn.addEventListener('click', () => {
    winDialog.close();
    if (currentLevelId < LEVELS.length) {
      loadLevel(currentLevelId + 1);
    }
  });

  i18n.onChange(() => {
    levelTitle.textContent = i18n.t(currentLevel.title.vi, currentLevel.title.en);
    levelHint.textContent = i18n.t(currentLevel.hint.vi, currentLevel.hint.en);
    updateProgramUI();
  });
}

cmdImg.onload = () => renderGrid();
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') init();
