import {
  GRAVITY, JUMP_VELOCITY, LEVEL_DISTANCE, LEVELS, LevelGenerator, PIXELS_PER_METER, PLATFORM_LIFE, QUESTION_TIME, RUN_SPEED, START_LIVES, STAR_POINTS, VIEW_HEIGHT,
  addScore, createQuestionDeck, distancePoints, levelProgress, mulberry32, normalizeName, parseLeaderboard, platformState, questionScoreChange, startingLives,
} from './sky.mjs';
import { createGameAudio } from '../audio.mjs';

const ASSET = '../../assets/mascots/';
const CHARACTERS = [
  { id: 'phoenix', name: 'Phượng Hoàng', src: `${ASSET}mind-phoenix-mascot.png` },
  { id: 'lambda', name: 'Lambda', src: `${ASSET}mindastro-lambda-happy.webp`, air: `${ASSET}mindastro-lambda-wow.webp` },
  { id: 'flask', name: 'Flask', src: `${ASSET}mindchemistry-flask-happy.webp`, air: `${ASSET}mindchemistry-flask-wow.webp` },
  { id: 'cmd', name: 'Cmd', src: `${ASSET}minddev-cmd-happy.webp`, air: `${ASSET}minddev-cmd-wow.webp` },
  { id: 'sigma', name: 'Sigma', src: `${ASSET}mindmath-sigma-happy.webp`, air: `${ASSET}mindmath-sigma-wow.webp` },
];
const STORAGE = { board: 'mp-sky-jump-leaderboard', name: 'mp-sky-jump-name', character: 'mp-sky-jump-character', sound: 'mp-sky-jump-sound' };
const STEP = 1 / 120;
const PLAYER_W = 40;
const PLAYER_H = 54;
const START_X = 80;
const MIN_VIEW_WIDTH = 640;
const WEATHER = {
  sunny: { sky: ['#5bb6f2', '#a9defc', '#e9f7ff'], cloud: '255, 255, 255', sea: '255, 255, 255', platform: ['#fff6d6', '#f2c46b'], outline: '#b9822f' },
  rainy: { sky: ['#4b6385', '#91aec9', '#dbe8f2'], cloud: '203, 217, 230', sea: '227, 237, 245', platform: ['#e7effa', '#90afce'], outline: '#456784' },
  snowy: { sky: ['#829fc7', '#c6dced', '#f4fbff'], cloud: '244, 250, 255', sea: '242, 250, 255', platform: ['#ffffff', '#b6d9ef'], outline: '#5987ac' },
};

const $ = (id) => document.getElementById(id);
const canvas = $('sky');
const ctx = canvas.getContext('2d');
const stage = $('stage');
const ui = {
  score: $('hud-score'), stars: $('hud-stars'), lives: $('hud-lives'), toast: $('toast'),
  start: $('start-screen'), question: $('question-screen'), pause: $('pause-screen'), over: $('over-screen'),
  pauseToggle: $('pause-toggle'), soundToggle: $('sound-toggle'), name: $('player-name'), grid: $('character-grid'),
  topic: $('question-topic'), seconds: $('question-seconds'), bar: $('question-bar'), prompt: $('question-text'), answers: $('answers'), feedback: $('question-feedback'),
  level: $('level-hud'), levelLabel: $('level-label'), levelDistance: $('level-distance'), levelProgress: $('level-progress'), levelBar: $('level-bar'), levelSteps: $('level-steps'),
};

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode: keep playing without saving */ } },
};

const images = new Map();
for (const character of CHARACTERS) {
  for (const src of [character.src, character.air].filter(Boolean)) {
    const image = new Image();
    image.src = src;
    images.set(src, image);
  }
}

let mode = 'menu';
let characterId = CHARACTERS.some((c) => c.id === store.get(STORAGE.character)) ? store.get(STORAGE.character) : 'phoenix';
let board = parseLeaderboard(store.get(STORAGE.board));
let view = { w: MIN_VIEW_WIDTH, scale: 1, offsetY: 0, dpr: 1, cssW: 0, cssH: 0 };
let world;
let generator;
let player;
let camera;
let run = { lives: START_LIVES, stars: 0, bonus: 0, correct: 0, maxX: START_X, time: 0, level: 0 };
let deck = createQuestionDeck();
let question = null;
let shake = 0;
let flash = null;
let toastTimer = 0;
let lastFrame = performance.now();
let accumulator = 0;
let clock = 0;
const input = { left: false, right: false, jumpHeld: false, jumpQueued: false };

/* ---------- Sound ---------- */
const audio = createGameAudio({
  theme: 'sky', button: ui.soundToggle, enabled: store.get(STORAGE.sound) !== 'off',
  onEnabledChange: (enabled) => store.set(STORAGE.sound, enabled ? 'on' : 'off'),
  onError: (message, error) => { console.error(message, error); toast(message, 'bad', 6000); }
});
const tone = (...args) => audio.tone(...args);
const sfx = {
  jump: () => tone(420, 0.16, { type: 'triangle', to: 760, volume: 0.09 }),
  star: () => { tone(988, 0.08, { type: 'square', volume: 0.05 }); tone(1319, 0.14, { type: 'square', volume: 0.05, delay: 0.07 }); },
  crack: () => tone(180, 0.07, { type: 'sawtooth', volume: 0.04, to: 90 }),
  break: () => tone(220, 0.3, { type: 'sawtooth', volume: 0.06, to: 50 }),
  question: () => [523, 659, 784].forEach((f, i) => tone(f, 0.12, { type: 'triangle', delay: i * 0.08 })),
  correct: () => [659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, { type: 'triangle', delay: i * 0.07 })),
  wrong: () => tone(300, 0.4, { type: 'sawtooth', volume: 0.07, to: 110 }),
  fall: () => tone(700, 0.6, { type: 'sine', volume: 0.1, to: 120 }),
  tick: () => tone(1200, 0.04, { type: 'square', volume: 0.03 }),
  over: () => [523, 440, 349, 262].forEach((f, i) => tone(f, 0.22, { type: 'triangle', delay: i * 0.16 })),
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, { type: 'triangle', delay: i * 0.12 })),
};

/* ---------- Scenery ---------- */
const sceneryRng = mulberry32(2026);
const cloudLayers = [
  { factor: 0.08, span: 2200, alpha: 0.55, clouds: makeClouds(7, 2200, [60, 260], [0.7, 1.3]) },
  { factor: 0.2, span: 2600, alpha: 0.75, clouds: makeClouds(8, 2600, [120, 360], [0.8, 1.5]) },
  { factor: 0.45, span: 3000, alpha: 0.9, clouds: makeClouds(6, 3000, [60, 420], [1, 1.8]) },
];
const seaPuffs = Array.from({ length: 26 }, (_, i) => ({ x: i * 70 + sceneryRng() * 30, r: 34 + sceneryRng() * 24, y: sceneryRng() * 12 }));
const birds = Array.from({ length: 4 }, () => ({ x: sceneryRng() * 2000, y: 70 + sceneryRng() * 140, speed: 20 + sceneryRng() * 25, phase: sceneryRng() * 6 }));
const weatherParticles = Array.from({ length: 90 }, () => ({ x: sceneryRng(), y: sceneryRng(), speed: 0.7 + sceneryRng() * 0.6, size: 1.5 + sceneryRng() * 2.5, phase: sceneryRng() * Math.PI * 2 }));

function makeClouds(count, span, [minY, maxY], [minS, maxS]) {
  return Array.from({ length: count }, (_, i) => {
    const puffs = Array.from({ length: 4 + Math.floor(sceneryRng() * 3) }, (_, j, list) => ({
      dx: (j - 2.5) * 26 + sceneryRng() * 10, dy: -Math.sin((j + 0.5) / 6 * Math.PI) * 22 - sceneryRng() * 10, r: 24 + sceneryRng() * 18,
    }));
    return { x: (i / count) * span + sceneryRng() * 120, y: minY + sceneryRng() * (maxY - minY), s: minS + sceneryRng() * (maxS - minS), puffs };
  });
}

/* ---------- Setup UI ---------- */
function renderCharacters() {
  ui.grid.replaceChildren(...CHARACTERS.map((character) => {
    const label = document.createElement('label');
    label.className = 'character';
    const radio = Object.assign(document.createElement('input'), { type: 'radio', name: 'character', value: character.id, checked: character.id === characterId });
    radio.addEventListener('change', () => { characterId = character.id; store.set(STORAGE.character, characterId); });
    const img = Object.assign(document.createElement('img'), { src: character.src, alt: '', width: 80, height: 80 });
    const name = Object.assign(document.createElement('span'), { textContent: character.name });
    label.append(radio, img, name);
    return label;
  }));
}

function renderBoard(list, highlight) {
  if (!board.length) {
    list.replaceChildren(Object.assign(document.createElement('li'), { className: 'empty', textContent: 'Chưa có ai. Hãy là người đầu tiên!' }));
    return;
  }
  list.replaceChildren(...board.map((entry) => {
    const item = document.createElement('li');
    if (entry === highlight) item.className = 'mine';
    const character = CHARACTERS.find((c) => c.id === entry.character) ?? CHARACTERS[0];
    const img = Object.assign(document.createElement('img'), { src: character.src, alt: character.name, title: character.name });
    const who = Object.assign(document.createElement('span'), { className: 'who', textContent: entry.name });
    const score = Object.assign(document.createElement('strong'), { textContent: entry.score.toLocaleString('vi-VN') });
    item.append(img, who, score);
    return item;
  }));
}

function showScreen(screen) {
  for (const el of [ui.start, ui.question, ui.pause, ui.over]) el.hidden = el !== screen;
}

function updateLives() {
  const unlimited = run.lives === Infinity;
  ui.lives.replaceChildren(...Array.from({ length: unlimited ? 1 : START_LIVES }, (_, i) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `icon${i < run.lives ? '' : ' lost'}`);
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#icon-heart');
    svg.append(use);
    return svg;
  }));
  if (unlimited) ui.lives.append(Object.assign(document.createElement('strong'), { textContent: '∞', ariaHidden: 'true' }));
  ui.lives.setAttribute('aria-label', unlimited ? 'Mạng vô hạn' : `Còn ${run.lives} mạng`);
}

function score() {
  return distancePoints(run.maxX, START_X) + run.stars * STAR_POINTS + run.bonus;
}

let shownScore = -1;
let shownLevel = -1;
let shownDistance = -1;
let shownComplete = false;
function updateHud() {
  const current = score();
  if (current !== shownScore) { ui.score.textContent = current.toLocaleString('vi-VN'); shownScore = current; }
  if (ui.stars.textContent !== String(run.stars)) ui.stars.textContent = run.stars;
  updateLevelHud();
}

function updateLevelHud() {
  const progress = levelProgress(run.maxX, START_X);
  const distance = Math.floor(progress.distance);
  if (shownLevel === progress.index && shownDistance === distance && shownComplete === progress.complete) return;
  shownLevel = progress.index;
  shownDistance = distance;
  shownComplete = progress.complete;
  const level = LEVELS[progress.index];
  ui.level.dataset.weather = level.id;
  ui.levelLabel.textContent = `Màn ${progress.index + 1}/${LEVELS.length} · ${level.name}`;
  ui.levelDistance.textContent = `${distance} / ${LEVEL_DISTANCE} m`;
  ui.levelProgress.setAttribute('aria-valuenow', distance);
  ui.levelProgress.setAttribute('aria-valuetext', `${distance} trên ${LEVEL_DISTANCE} mét${progress.complete ? ', hoàn thành cả 3 màn' : ''}`);
  ui.levelBar.style.transform = `scaleX(${distance / LEVEL_DISTANCE})`;
  [...ui.levelSteps.children].forEach((step, index) => {
    const current = index === progress.index && !progress.complete;
    step.classList.toggle('current', current);
    step.classList.toggle('completed', index < progress.index || progress.complete);
    step.setAttribute('aria-current', current ? 'step' : 'false');
  });
  canvas.setAttribute('aria-label', `Màn ${progress.index + 1}: ${level.name}. Nhảy qua ô mây, nhặt sao và trả lời câu hỏi. Đi đủ ${LEVEL_DISTANCE} mét để qua màn.`);
}

function bump(el) {
  const pill = el.closest('.hud-pill');
  pill.classList.remove('bump');
  void pill.offsetWidth;
  pill.classList.add('bump');
}

function toast(text, tone = '', ms = 1800) {
  ui.toast.textContent = text;
  ui.toast.className = `toast ${tone}`;
  ui.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast.hidden = true; }, ms);
}

/* ---------- Game flow ---------- */
function newGame() {
  world = { platforms: [], stars: [], questions: [], pieces: [], particles: [], floaters: [] };
  generator = new LevelGenerator();
  generator.start(world, -40, 400, 460);
  player = { x: START_X, y: 400, vx: 0, vy: 0, onGround: true, coyote: 0, buffer: 0, facing: 1, dropping: false, squash: 0, invulnerable: 0, ground: null };
  camera = { x: 0 };
  run = { lives: startingLives(ui.name.value), stars: 0, bonus: 0, correct: 0, maxX: START_X, time: 0, level: 0 };
  deck = createQuestionDeck();
  question = null;
  shake = 0;
  flash = null;
  shownScore = -1;
  shownLevel = -1;
  shownDistance = -1;
  shownComplete = false;
  generator.generateUntil(world, camera.x + view.w + 800);
  updateLives();
  updateHud();
}

function startGame(event) {
  event?.preventDefault();
  void audio.activate();
  store.set(STORAGE.name, ui.name.value.trim());
  newGame();
  setMode('playing');
  showScreen(null);
  toast(`Màn 1: Nắng — đi đủ ${LEVEL_DISTANCE} m!${run.lives === Infinity ? ' Mạng vô hạn đã bật.' : ''}`, '', 3000);
  tone(523, 0.1, { type: 'triangle' });
  document.activeElement?.blur();
}

function setMode(next) {
  mode = next;
  audio.setMusicPlaying(next === 'playing' || next === 'question');
  if (next === 'paused' || next === 'menu') audio.stopVoices();
  document.body.classList.toggle('playing', next === 'playing' || next === 'question');
  ui.pauseToggle.disabled = !(next === 'playing' || next === 'paused');
  const paused = next === 'paused';
  ui.pauseToggle.setAttribute('aria-label', paused ? 'Chơi tiếp' : 'Tạm dừng');
  ui.pauseToggle.querySelector('use').setAttribute('href', paused ? '#icon-play' : '#icon-pause');
  if (next !== 'playing') { input.left = input.right = input.jumpHeld = input.jumpQueued = false; }
}

function pause() {
  if (mode !== 'playing') return;
  setMode('paused');
  showScreen(ui.pause);
  $('resume-button').focus();
}

function resume() {
  if (mode !== 'paused') return;
  void audio.activate();
  setMode('playing');
  showScreen(null);
  lastFrame = performance.now();
}

function loseLife() {
  run.lives -= 1;
  updateLives();
  bump(ui.lives);
  shake = 0.5;
  flash = { color: '226, 87, 76', t: 0.5 };
  sfx.fall();
  if (run.lives <= 0) { gameOver(); return; }
  toast(run.lives === Infinity ? 'Ối, rơi mất rồi! Mạng vô hạn — bay tiếp nào!' : `Ối, rơi mất rồi! Còn ${run.lives} mạng`, 'bad');
  respawn();
}

function respawn() {
  const x = camera.x + view.w * 0.3 - 110;
  world.platforms = world.platforms.filter((p) => p.x + p.w < x - 20);
  world.stars = world.stars.filter((s) => s.x < x - 20);
  world.questions = world.questions.filter((q) => q.x < x - 20);
  const rescue = generator.start(world, x, 380, 220, 'rescue');
  generator.generateUntil(world, camera.x + view.w + 800);
  for (let i = 0; i < 14; i += 1) world.particles.push(puff(rescue.x + Math.random() * rescue.w, rescue.y + 8, '#ffffff'));
  Object.assign(player, { x: rescue.x + 60, y: rescue.y - 140, vx: 0, vy: 0, dropping: false, onGround: false, invulnerable: 1.4, ground: null });
}

function gameOver(won = false) {
  if (mode === 'over') return;
  setMode('over');
  if (won) {
    sfx.win();
    flash = { color: '255, 246, 200', t: 0.8 };
    for (let i = 0; i < 70; i += 1) world.particles.push(sparkle(player.x + (Math.random() - 0.5) * view.w * 0.7, 100 + Math.random() * 220, i % 2 ? '#ffc94a' : '#b79cff'));
  } else sfx.over();
  ui.over.classList.toggle('victory', won);
  $('over-eyebrow').textContent = won ? 'Hoàn thành cả 3 màn!' : run.lives <= 0 ? 'Hết mạng rồi!' : 'Lượt chơi đã kết thúc';
  $('over-title').textContent = won ? 'Chiến thắng!' : 'Kết thúc';
  $('result-message').textContent = won ? 'Bạn đã chinh phục 3/3 màn: Nắng, Mưa và Tuyết!' : `Đã hoàn thành ${run.level}/${LEVELS.length} màn. Chơi lại để chinh phục cả 3 nhé!`;
  const final = score();
  const result = addScore(board, { name: normalizeName(store.get(STORAGE.name)), score: final, character: characterId, date: Date.now() });
  board = result.board;
  store.set(STORAGE.board, JSON.stringify(board));
  const character = CHARACTERS.find((c) => c.id === characterId);
  $('over-avatar').src = won ? character.src : character.air ?? character.src;
  $('final-score').textContent = final.toLocaleString('vi-VN');
  $('final-distance').textContent = `${Math.floor(levelProgress(run.maxX, START_X).totalDistance)} m`;
  $('final-stars').textContent = run.stars;
  $('final-correct').textContent = run.correct;
  $('rank-note').textContent = result.rank === 1 ? '🏆 Kỷ lục mới! Bạn đứng hạng 1!' : result.rank ? `🎉 Bạn lọt vào bảng xếp hạng: hạng ${result.rank}` : 'Cố lên! Lần sau sẽ lọt vào top 10.';
  renderBoard($('board-over'), board[result.rank - 1]);
  renderBoard($('board-start'));
  const finishedRun = run;
  setTimeout(() => { if (mode === 'over' && run === finishedRun) { showScreen(ui.over); $('again-button').focus(); } }, won ? 350 : 700);
}

/* ---------- Questions ---------- */
function openQuestion(box) {
  box.used = true;
  question = { ...deck.next(), left: QUESTION_TIME, answered: false, lastTick: QUESTION_TIME };
  player.vx = 0;
  setMode('question');
  sfx.question();
  ui.topic.textContent = question.topic;
  ui.prompt.textContent = question.prompt;
  ui.feedback.textContent = '';
  ui.feedback.className = 'question-feedback';
  ui.answers.replaceChildren(...question.choices.map((text, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    const key = Object.assign(document.createElement('kbd'), { textContent: index + 1 });
    button.append(key, document.createTextNode(text));
    button.addEventListener('click', () => answer(index));
    return button;
  }));
  updateQuestionTimer();
  showScreen(ui.question);
  for (let i = 0; i < 20; i += 1) world.particles.push(sparkle(box.x, box.y, '#b79cff'));
}

function updateQuestionTimer() {
  const left = Math.max(0, question.left);
  ui.seconds.textContent = Math.ceil(left);
  ui.bar.style.transform = `scaleX(${left / QUESTION_TIME})`;
  const urgent = left <= 3;
  ui.seconds.parentElement.classList.toggle('urgent', urgent);
  ui.bar.parentElement.classList.toggle('urgent', urgent);
  if (urgent && Math.ceil(left) < question.lastTick) { question.lastTick = Math.ceil(left); sfx.tick(); }
}

function answer(index) {
  if (mode !== 'question' || !question || question.answered) return;
  question.answered = true;
  const correct = index === question.correctIndex;
  const buttons = [...ui.answers.children];
  buttons.forEach((button, i) => {
    button.disabled = true;
    if (i === question.correctIndex) button.classList.add('correct');
    else if (i === index) button.classList.add('wrong');
    else button.classList.add('dim');
  });
  const right = question.choices[question.correctIndex];
  const change = questionScoreChange(correct, question.left, score());
  run.bonus += change;
  if (correct) {
    run.correct += 1;
    ui.feedback.textContent = `Chính xác! +${change} điểm`;
    ui.feedback.className = 'question-feedback good';
    sfx.correct();
    world.floaters.push({ x: player.x, y: player.y - 80, text: `+${change}`, color: '#7c5ce0', t: 0, size: 30 });
    for (let i = 0; i < 30; i += 1) world.particles.push(sparkle(player.x, player.y - 30, i % 2 ? '#ffc94a' : '#b79cff'));
  } else {
    const loss = change < 0 ? `${change} điểm` : 'Điểm đã ở 0';
    ui.feedback.textContent = `${index < 0 ? 'Hết giờ!' : 'Chưa đúng!'} ${loss}. Đáp án đúng: ${right}`;
    ui.feedback.className = 'question-feedback bad';
    sfx.wrong();
    world.floaters.push({ x: player.x, y: player.y - 80, text: `${change}`, color: '#e2574c', t: 0, size: 28 });
  }
  if (change) bump(ui.score);
  updateHud();
  const answeredQuestion = question;
  setTimeout(() => { if (mode === 'question' && question === answeredQuestion) closeQuestion(correct); }, correct ? 900 : 1700);
}

function closeQuestion(correct) {
  question = null;
  showScreen(null);
  setMode('playing');
  lastFrame = performance.now();
  toast(correct ? 'Giỏi quá! Bay tiếp nào!' : 'Chỉ trừ điểm thôi — bay tiếp nhé!', correct ? 'good' : 'bad');
}

/* ---------- Simulation ---------- */
function breakPlatform(platform) {
  if (platform.broken) return;
  platform.broken = true;
  sfx.break();
  const pieces = Math.max(3, Math.round(platform.w / 26));
  for (let i = 0; i < pieces; i += 1) {
    const w = platform.w / pieces;
    world.pieces.push({ x: platform.x + i * w, y: platform.y, w, h: platform.h, vx: (Math.random() - 0.5) * 140, vy: -60 - Math.random() * 120, r: 0, vr: (Math.random() - 0.5) * 5, t: 0 });
  }
  for (let i = 0; i < 12; i += 1) world.particles.push(puff(platform.x + Math.random() * platform.w, platform.y + 12, '#ffffff'));
  if (player.ground === platform) { player.ground = null; player.onGround = false; }
}

function step(h) {
  run.time += h;
  const dir = player.dropping ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir) player.facing = dir;
  const target = dir * RUN_SPEED;
  player.vx += (target - player.vx) * Math.min(1, h * (player.onGround ? 16 : 9));

  if (input.jumpQueued) { player.buffer = 0.14; input.jumpQueued = false; }
  player.buffer -= h;
  player.coyote = player.onGround ? 0.1 : player.coyote - h;
  if (player.buffer > 0 && player.coyote > 0 && !player.dropping) {
    player.vy = -JUMP_VELOCITY;
    player.onGround = false;
    player.ground = null;
    player.coyote = 0;
    player.buffer = 0;
    player.squash = -0.25;
    sfx.jump();
    for (let i = 0; i < 6; i += 1) world.particles.push(puff(player.x, player.y, '#ffffff'));
  }
  if (!input.jumpHeld && player.vy < -380 && !player.dropping) player.vy = -380;

  player.vy = Math.min(player.vy + GRAVITY * h, 1500);
  const prevY = player.y;
  let nextY = player.y + player.vy * h;
  player.x = Math.max(camera.x + PLAYER_W / 2, player.x + player.vx * h);

  const wasGrounded = player.onGround;
  player.onGround = false;
  player.ground = null;
  if (!player.dropping && player.vy >= 0) {
    for (const p of world.platforms) {
      if (p.broken || player.x + PLAYER_W * 0.4 < p.x || player.x - PLAYER_W * 0.4 > p.x + p.w) continue;
      if (prevY <= p.y + 1 && nextY >= p.y) {
        nextY = p.y;
        player.vy = 0;
        player.onGround = true;
        player.ground = p;
        if (p.touchedAt == null) p.touchedAt = run.time;
        if (!wasGrounded) {
          player.squash = 0.22;
          for (let i = 0; i < 5; i += 1) world.particles.push(puff(player.x + (Math.random() - 0.5) * 30, p.y, '#ffffff'));
        }
        break;
      }
    }
  }
  player.y = nextY;
  player.squash *= 1 - Math.min(1, h * 10);
  player.invulnerable = Math.max(0, player.invulnerable - h);
  if (player.y <= VIEW_HEIGHT + 140) run.maxX = Math.max(run.maxX, player.x);

  for (const p of world.platforms) {
    if (p.touchedAt == null || p.broken) continue;
    const state = platformState(run.time - p.touchedAt);
    if (state.broken) breakPlatform(p);
    else if (state.stage !== (p.stage ?? 0)) { p.stage = state.stage; sfx.crack(); }
  }

  const cx = player.x;
  const cy = player.y - PLAYER_H / 2;
  for (const star of world.stars) {
    if (star.taken || Math.abs(star.x - cx) > 34 || Math.abs(star.y - cy) > 40) continue;
    star.taken = true;
    run.stars += 1;
    bump(ui.stars);
    sfx.star();
    world.floaters.push({ x: star.x, y: star.y - 10, text: `+${STAR_POINTS}`, color: '#e39a22', t: 0, size: 22 });
    for (let i = 0; i < 10; i += 1) world.particles.push(sparkle(star.x, star.y, '#ffd94a'));
  }

  if (player.y > VIEW_HEIGHT + 140) { loseLife(); return; }
  const progress = levelProgress(run.maxX, START_X);
  if (progress.complete) {
    run.maxX = START_X + progress.totalDistance * PIXELS_PER_METER;
    updateHud();
    gameOver(true);
    return;
  }
  if (progress.index !== run.level) {
    run.level = progress.index;
    sfx.correct();
    flash = { color: '255, 255, 255', t: 0.5 };
    toast(`Qua màn ${run.level}! Màn ${run.level + 1}: ${LEVELS[run.level].name} — thêm ${LEVEL_DISTANCE} m nữa!`, 'good', 3000);
  }

  if (!player.dropping) {
    for (const box of world.questions) {
      if (box.used || Math.abs(box.x - cx) > 22 + PLAYER_W / 2 || Math.abs(box.y - cy) > 22 + PLAYER_H / 2) continue;
      openQuestion(box);
      return;
    }
  }

  const targetCamera = player.x - view.w * 0.36;
  if (targetCamera > camera.x) camera.x += (targetCamera - camera.x) * Math.min(1, h * 6);

  generator.generateUntil(world, camera.x + view.w + 800);
  const left = camera.x - 300;
  world.platforms = world.platforms.filter((p) => !p.broken && p.x + p.w > left);
  world.stars = world.stars.filter((s) => !s.taken && s.x > left);
  world.questions = world.questions.filter((q) => !q.used && q.x > left);
}

function updateEffects(dt) {
  for (const piece of world.pieces) { piece.t += dt; piece.vy += GRAVITY * 0.6 * dt; piece.x += piece.vx * dt; piece.y += piece.vy * dt; piece.r += piece.vr * dt; }
  world.pieces = world.pieces.filter((piece) => piece.t < 1.6);
  for (const particle of world.particles) { particle.t += dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += particle.g * dt; }
  world.particles = world.particles.filter((particle) => particle.t < particle.life);
  for (const floater of world.floaters) floater.t += dt;
  world.floaters = world.floaters.filter((floater) => floater.t < 1.1);
  shake = Math.max(0, shake - dt);
  if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; }
}

function puff(x, y, color) {
  return { x, y, vx: (Math.random() - 0.5) * 120, vy: -20 - Math.random() * 60, g: 40, r: 4 + Math.random() * 6, life: 0.5 + Math.random() * 0.3, t: 0, color, kind: 'puff' };
}
function sparkle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 90 + Math.random() * 220;
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, g: 300, r: 2 + Math.random() * 3, life: 0.6 + Math.random() * 0.4, t: 0, color, kind: 'spark' };
}

/* ---------- Rendering ---------- */
function resize() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.min(rect.height / VIEW_HEIGHT, rect.width / MIN_VIEW_WIDTH);
  view = { cssW: rect.width, cssH: rect.height, dpr, scale, w: rect.width / scale, offsetY: Math.max(0, (rect.height - VIEW_HEIGHT * scale) * 0.4) / scale };
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCloud(x, y, s, puffs) {
  ctx.beginPath();
  for (const p of puffs) { ctx.moveTo(x + p.dx * s + p.r * s, y + p.dy * s); ctx.arc(x + p.dx * s, y + p.dy * s, p.r * s, 0, Math.PI * 2); }
  ctx.roundRect(x - 80 * s, y - 14 * s, 160 * s, 30 * s, 15 * s);
  ctx.fill();
}

function drawBackground(time) {
  const weather = WEATHER[LEVELS[run.level].id];
  const top = -view.offsetY;
  const bottom = view.cssH / view.scale - view.offsetY;
  const sky = ctx.createLinearGradient(0, top, 0, bottom);
  sky.addColorStop(0, weather.sky[0]);
  sky.addColorStop(0.55, weather.sky[1]);
  sky.addColorStop(1, weather.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, top, view.w, bottom - top);

  if (run.level === 0) {
    const sunX = view.w - 120;
    const glow = ctx.createRadialGradient(sunX, 90, 10, sunX, 90, 150);
    glow.addColorStop(0, 'rgba(255, 246, 200, .95)');
    glow.addColorStop(0.3, 'rgba(255, 236, 160, .45)');
    glow.addColorStop(1, 'rgba(255, 236, 160, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sunX - 150, -60, 300, 300);
    ctx.fillStyle = '#fff3b8';
    ctx.beginPath();
    ctx.arc(sunX, 90, 38, 0, Math.PI * 2);
    ctx.fill();
  }

  const camX = camera?.x ?? time * 40;
  for (const layer of cloudLayers) {
    ctx.fillStyle = `rgba(${weather.cloud}, ${layer.alpha})`;
    for (const cloud of layer.clouds) {
      let x = (cloud.x - camX * layer.factor - time * 6 * layer.factor) % layer.span;
      if (x < -200) x += layer.span;
      for (let rx = x; rx < view.w + 200; rx += layer.span) drawCloud(rx, cloud.y, cloud.s, cloud.puffs);
    }
  }

  ctx.strokeStyle = 'rgba(35, 64, 90, .45)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const bird of birds) {
    let x = (bird.x + time * bird.speed - camX * 0.15) % (view.w + 400);
    if (x < 0) x += view.w + 400;
    x -= 200;
    const flap = Math.sin(time * 7 + bird.phase) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 9, bird.y - flap);
    ctx.quadraticCurveTo(x - 4, bird.y - 4, x, bird.y);
    ctx.quadraticCurveTo(x + 4, bird.y - 4, x + 9, bird.y - flap);
    ctx.stroke();
  }
}

function drawCloudSea(time) {
  const weather = WEATHER[LEVELS[run.level].id];
  const camX = camera?.x ?? time * 40;
  const bottom = view.cssH / view.scale - view.offsetY;
  const base = VIEW_HEIGHT + 38;
  ctx.fillStyle = `rgba(${weather.sea}, .92)`;
  ctx.fillRect(0, base + 20, view.w, bottom - base);
  const span = seaPuffs.length * 70;
  for (const p of seaPuffs) {
    let x = (p.x - camX * 0.9 + time * 8) % span;
    if (x < -100) x += span;
    for (let rx = x; rx < view.w + 100; rx += span) {
      ctx.beginPath();
      ctx.arc(rx, base + p.y + Math.sin(time + p.x) * 3, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawWeather(time) {
  if (run.level === 0) return;
  const rainy = LEVELS[run.level].id === 'rainy';
  const top = -view.offsetY;
  const height = view.cssH / view.scale + 40;
  const span = view.w + 60;
  ctx.save();
  ctx.strokeStyle = 'rgba(218, 237, 255, .65)';
  ctx.fillStyle = 'rgba(255, 255, 255, .9)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const particle of weatherParticles) {
    const drift = time * (rainy ? -90 : 16) * particle.speed;
    const x = ((particle.x * span + drift) % span + span) % span - 30 + (rainy ? 0 : Math.sin(time + particle.phase) * 18);
    const y = top + (particle.y * height + time * (rainy ? 460 : 40) * particle.speed) % height - 20;
    if (rainy) {
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 18);
    } else {
      ctx.moveTo(x + particle.size, y);
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
    }
  }
  if (rainy) ctx.stroke(); else ctx.fill();
  ctx.restore();
}

function crackLines(p) {
  if (p.cracks) return p.cracks;
  const rng = mulberry32(p.id * 7919);
  p.cracks = Array.from({ length: 4 }, (_, i) => {
    const start = { x: p.w * (0.15 + 0.7 * rng()), y: 2 + rng() * 6 };
    const points = [start];
    const segments = 3 + Math.floor(rng() * 2);
    for (let s = 1; s <= segments; s += 1) points.push({ x: start.x + (rng() - 0.5) * 34 * s / segments * 2, y: start.y + (p.h - 4) * s / segments });
    return { points, stage: i < 1 ? 1 : i < 3 ? 2 : 3 };
  });
  return p.cracks;
}

function drawPlatform(p, time) {
  const age = p.touchedAt == null ? null : run.time - p.touchedAt;
  const state = platformState(age);
  ctx.save();
  if (state.shaking) ctx.translate(Math.sin(time * 70) * 2.2, Math.cos(time * 55) * 1.2);
  ctx.translate(p.x, p.y);

  ctx.fillStyle = 'rgba(255, 255, 255, .95)';
  ctx.beginPath();
  for (let x = 14; x < p.w; x += 26) { ctx.moveTo(x + 16, p.h + 4); ctx.arc(x, p.h + 4, 16, 0, Math.PI * 2); }
  ctx.fill();

  const special = p.kind === 'branch';
  const weather = WEATHER[LEVELS[run.level].id];
  const body = ctx.createLinearGradient(0, 0, 0, p.h);
  body.addColorStop(0, special ? '#e8f4ff' : weather.platform[0]);
  body.addColorStop(1, special ? '#a8cdf0' : weather.platform[1]);
  ctx.fillStyle = body;
  ctx.strokeStyle = special ? '#4f86b8' : weather.outline;
  ctx.lineWidth = 2.5;
  roundRect(0, 0, p.w, p.h, 9);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = special ? 'rgba(79, 134, 184, .35)' : 'rgba(185, 130, 47, .35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 34; x < p.w - 10; x += 34) { ctx.moveTo(x, 4); ctx.lineTo(x, p.h - 4); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, .7)';
  roundRect(6, 3, p.w - 12, 5, 3);
  ctx.fill();

  if (age != null) {
    const heat = Math.min(1, age / PLATFORM_LIFE);
    ctx.fillStyle = `rgba(226, 87, 76, ${heat * 0.35})`;
    roundRect(0, 0, p.w, p.h, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(70, 40, 20, .85)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    for (const crack of crackLines(p)) {
      if (crack.stage > state.stage) continue;
      ctx.beginPath();
      crack.points.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawStar(x, y, r, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawStars(time) {
  for (const star of world.stars) {
    if (star.taken) continue;
    const bob = Math.sin(time * 3 + star.id) * 4;
    const glow = ctx.createRadialGradient(star.x, star.y + bob, 2, star.x, star.y + bob, 26);
    glow.addColorStop(0, 'rgba(255, 230, 120, .7)');
    glow.addColorStop(1, 'rgba(255, 230, 120, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(star.x - 26, star.y + bob - 26, 52, 52);
    ctx.fillStyle = '#ffd23f';
    ctx.strokeStyle = '#c98a10';
    ctx.lineWidth = 2;
    drawStar(star.x, star.y + bob, 14 + Math.sin(time * 5 + star.id) * 1.5, Math.sin(time * 2 + star.id) * 0.3);
  }
}

function drawQuestions(time) {
  for (const box of world.questions) {
    if (box.used) continue;
    const bob = Math.sin(time * 2.6 + box.id) * 4;
    const pulse = (time * 0.9 + box.id * 0.1) % 1;
    ctx.strokeStyle = `rgba(160, 130, 255, ${1 - pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(box.x, box.y + bob, 26 + pulse * 22, 0, Math.PI * 2);
    ctx.stroke();
    const gradient = ctx.createLinearGradient(0, box.y - 22, 0, box.y + 22);
    gradient.addColorStop(0, '#a58bff');
    gradient.addColorStop(1, '#6a46d8');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#3c2591';
    ctx.lineWidth = 2.5;
    roundRect(box.x - 22, box.y - 22 + bob, 44, 44, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = '800 30px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', box.x, box.y + bob + 2);
    ctx.textBaseline = 'alphabetic';
  }
}

function drawPlayer(time) {
  const character = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const airborne = !player.onGround;
  const image = images.get(airborne && character.air ? character.air : character.src);
  if (player.invulnerable > 0 && Math.floor(time * 12) % 2) return;
  const height = 66;
  const ratio = image?.naturalWidth ? image.naturalWidth / image.naturalHeight : 0.85;
  const width = Math.min(96, height * ratio);
  const stretch = player.onGround ? player.squash : Math.max(-0.18, Math.min(0.12, player.vy / 6000)) + player.squash;
  const sx = 1 + stretch;
  const sy = 1 - stretch;
  const runBob = player.onGround && Math.abs(player.vx) > 40 ? Math.abs(Math.sin(time * 16)) * 3 : 0;
  const tilt = player.dropping ? Math.sin(time * 14) * 0.5 : player.onGround ? player.vx / RUN_SPEED * 0.08 : player.facing * 0.1;

  ctx.save();
  ctx.translate(player.x, player.y - runBob);
  ctx.rotate(tilt);
  ctx.scale(player.facing * sx, sy);
  if (image?.complete && image.naturalWidth) ctx.drawImage(image, -width / 2, -height, width, height);
  else { ctx.fillStyle = '#ef6a6a'; roundRect(-PLAYER_W / 2, -PLAYER_H, PLAYER_W, PLAYER_H, 14); ctx.fill(); }
  ctx.restore();
}

function drawEffects() {
  for (const piece of world.pieces) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - piece.t / 1.6);
    ctx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2);
    ctx.rotate(piece.r);
    ctx.fillStyle = '#f2c46b';
    ctx.strokeStyle = '#b9822f';
    ctx.lineWidth = 2;
    roundRect(-piece.w / 2, -piece.h / 2, piece.w - 2, piece.h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  for (const particle of world.particles) {
    ctx.globalAlpha = Math.max(0, 1 - particle.t / particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.kind === 'puff' ? particle.r * (1 + particle.t) : particle.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  for (const floater of world.floaters) {
    ctx.globalAlpha = Math.max(0, 1 - floater.t / 1.1);
    ctx.font = `800 ${floater.size}px "Baloo 2", sans-serif`;
    const y = floater.y - floater.t * 60;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeText(floater.text, floater.x, y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x, y);
  }
  ctx.globalAlpha = 1;
}

function render(time) {
  ctx.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, 0, view.offsetY * view.dpr * view.scale);
  drawBackground(time);
  if (world) {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 14 * shake, (Math.random() - 0.5) * 14 * shake);
    ctx.translate(-camera.x, 0);
    for (const p of world.platforms) if (!p.broken && p.x + p.w > camera.x - 40 && p.x < camera.x + view.w + 40) drawPlatform(p, time);
    drawStars(time);
    drawQuestions(time);
    if (mode !== 'over' || player.y < VIEW_HEIGHT + 140) drawPlayer(time);
    drawEffects();
    ctx.restore();
  }
  drawCloudSea(time);
  drawWeather(time);
  if (flash) {
    ctx.fillStyle = `rgba(${flash.color}, ${flash.t * 0.5})`;
    ctx.fillRect(0, -view.offsetY, view.w, view.cssH / view.scale);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (mode !== 'paused') clock += dt;
  if (mode === 'playing') {
    accumulator += dt;
    while (accumulator >= STEP && mode === 'playing') { step(STEP); accumulator -= STEP; }
    updateHud();
  } else {
    accumulator = 0;
  }
  if (mode === 'question' && question && !question.answered) {
    question.left -= dt;
    updateQuestionTimer();
    if (question.left <= 0) answer(-1);
  }
  if (world && mode !== 'paused') updateEffects(dt);
  render(clock);
  requestAnimationFrame(frame);
}

/* ---------- Input ---------- */
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };

window.addEventListener('keydown', (event) => {
  if (mode === 'question') {
    // Only digits or clicks may answer; Space/Enter must never activate an answer button.
    const n = Number(event.key);
    if (n >= 1 && n <= 4) { event.preventDefault(); if (!event.repeat) answer(n - 1); }
    else if (event.code === 'Space' || event.key === 'Enter') event.preventDefault();
    return;
  }
  if (event.code === 'KeyP' || event.code === 'Escape') {
    if (mode === 'playing') { event.preventDefault(); pause(); } else if (mode === 'paused') { event.preventDefault(); resume(); }
    return;
  }
  if (mode !== 'playing') return;
  const action = KEYS[event.code];
  if (!action) return;
  event.preventDefault();
  if (action === 'jump') {
    if (!event.repeat) input.jumpQueued = true;
    input.jumpHeld = true;
  } else input[action] = true;
});

window.addEventListener('keyup', (event) => {
  if (mode === 'question' && (event.code === 'Space' || event.key === 'Enter')) event.preventDefault();
  const action = KEYS[event.code];
  if (action === 'jump') input.jumpHeld = false;
  else if (action) input[action] = false;
});

window.addEventListener('blur', () => { input.left = input.right = input.jumpHeld = false; pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else lastFrame = performance.now(); });

for (const button of document.querySelectorAll('.touch-button')) {
  const control = button.dataset.control;
  const press = (event) => {
    event.preventDefault();
    if (mode !== 'playing') return;
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('active');
    if (control === 'jump') { input.jumpQueued = true; input.jumpHeld = true; } else input[control] = true;
  };
  const release = () => {
    button.classList.remove('active');
    if (control === 'jump') input.jumpHeld = false; else input[control] = false;
  };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
}

ui.pauseToggle.addEventListener('click', () => (mode === 'paused' ? resume() : pause()));
$('resume-button').addEventListener('click', resume);
$('quit-button').addEventListener('click', () => { if (mode === 'paused') gameOver(); });
$('start-form').addEventListener('submit', startGame);
$('again-button').addEventListener('click', () => startGame());
$('menu-button').addEventListener('click', () => {
  setMode('menu');
  renderCharacters();
  showScreen(ui.start);
  ui.grid.querySelector('input:checked')?.focus();
});

new ResizeObserver(resize).observe(stage);
ui.name.value = store.get(STORAGE.name) ?? '';
renderCharacters();
renderBoard($('board-start'));
updateLives();
updateHud();
resize();
requestAnimationFrame(frame);
