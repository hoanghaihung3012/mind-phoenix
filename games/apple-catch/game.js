import {
  BASKET_RIM, BASKET_W, GROUND_Y, ITEMS, LEVELS, MOVE_SPEED, VIEW_HEIGHT,
  addScore, applyPoints, createQuestionDeck, isCaught, levelResult, mulberry32, normalizeName, parseLeaderboard, spawnItem,
} from './apple.mjs';
import { createGameAudio } from '../audio.mjs';
import { english, initGameLanguage } from '../i18n.mjs';

const i18n = initGameLanguage();
const text = i18n.text;
const ASSET = '../../assets/mascots/';
const CHARACTERS = [
  { id: 'phoenix', name: 'Phượng Hoàng', src: `${ASSET}mind-phoenix-mascot.png` },
  { id: 'lambda', name: 'Lambda', src: `${ASSET}mindastro-lambda-happy.webp`, wow: `${ASSET}mindastro-lambda-wow.webp` },
  { id: 'flask', name: 'Flask', src: `${ASSET}mindchemistry-flask-happy.webp`, wow: `${ASSET}mindchemistry-flask-wow.webp` },
  { id: 'cmd', name: 'Cmd', src: `${ASSET}minddev-cmd-happy.webp`, wow: `${ASSET}minddev-cmd-wow.webp` },
  { id: 'sigma', name: 'Sigma', src: `${ASSET}mindmath-sigma-happy.webp`, wow: `${ASSET}mindmath-sigma-wow.webp` },
];
const STORAGE = { board: 'mp-apple-catch-leaderboard', name: 'mp-apple-catch-name', character: 'mp-apple-catch-character', sound: 'mp-apple-catch-sound' };
const STEP = 1 / 120;
const MIN_VIEW_WIDTH = 640;
const RIM_Y = GROUND_Y - BASKET_RIM;
const OUTLINE = '#3d2614';
const COLORS = {
  apple: '#e63b2e', greenApple: '#8fd14f', pear: '#d4d84a', orange: '#ff9a1f', banana: '#ffd93b', grapes: '#8a4fc7',
  strawberry: '#ef3b4f', cherry: '#c8102e', watermelon: '#ff5a6a', goldenApple: '#ffd23f', worm: '#7bc043', question: '#9b7bff',
};

const $ = (id) => document.getElementById(id);
const canvas = $('orchard');
const ctx = canvas.getContext('2d');
const stage = $('stage');
const ui = {
  level: $('hud-level'), score: $('hud-score'), goal: $('hud-goal'), target: $('hud-target'), goalBar: $('hud-goal-bar'), time: $('hud-time'), toast: $('toast'),
  start: $('start-screen'), question: $('question-screen'), pause: $('pause-screen'), levelUp: $('level-screen'), over: $('over-screen'),
  pauseToggle: $('pause-toggle'), soundToggle: $('sound-toggle'), name: $('player-name'), grid: $('character-grid'),
  topic: $('question-topic'), difficulty: $('question-level'), stakes: $('question-stakes'), seconds: $('question-seconds'), bar: $('question-bar'),
  prompt: $('question-text'), answers: $('answers'), feedback: $('question-feedback'),
};

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode: keep playing without saving */ } },
};

const images = new Map();
for (const character of CHARACTERS) {
  for (const src of [character.src, character.wow].filter(Boolean)) {
    const image = new Image();
    image.src = src;
    images.set(src, image);
  }
}

let mode = 'menu';
let characterId = CHARACTERS.some((c) => c.id === store.get(STORAGE.character)) ? store.get(STORAGE.character) : 'phoenix';
let board = parseLeaderboard(store.get(STORAGE.board));
let view = { w: MIN_VIEW_WIDTH, scale: 1, offsetY: 0, dpr: 1, cssW: 0, cssH: 0 };
let levelIndex = 0;
let run = { banked: 0, levelScore: 0, fruit: 0, levelFruit: 0, correct: 0, timeLeft: LEVELS[0].time, spawnIn: 1, cleared: false };
let items = [];
let pile = [];
let deck = createQuestionDeck();
let question = null;
let banner = null;
let shake = 0;
let flash = null;
let toastTimer = 0;
let lastFrame = performance.now();
let accumulator = 0;
let clock = 0;
let dragging = false;
const effects = { particles: [], floaters: [], splats: [], confetti: [] };
const player = { x: MIN_VIEW_WIDTH / 2, vx: 0, facing: 1, mood: 0, bounce: 0 };
const input = { left: false, right: false, pointerX: null };

/* ---------- Sound ---------- */
const audio = createGameAudio({
  theme: LEVELS[0].music, button: ui.soundToggle, i18n, enabled: store.get(STORAGE.sound) !== 'off',
  onEnabledChange: (enabled) => store.set(STORAGE.sound, enabled ? 'on' : 'off'),
  onError: (message, error) => { console.error(message, error); toast(message, 'bad', 6000); },
});
const tone = (...args) => audio.tone(...args);
const arpeggio = (notes, gap, options = {}) => notes.forEach((f, i) => tone(f, options.duration ?? 0.14, { type: 'triangle', volume: 0.09, ...options, delay: i * gap }));
const sfx = {
  catch: (points) => { const base = 520 + points * 14; tone(base, 0.07, { type: 'square', volume: 0.05, to: base * 1.5 }); tone(base * 1.5, 0.1, { type: 'triangle', volume: 0.07, delay: 0.05 }); },
  golden: () => arpeggio([784, 988, 1175, 1568, 1976], 0.06, { type: 'square', volume: 0.05 }),
  worm: () => { tone(260, 0.28, { type: 'sawtooth', volume: 0.09, to: 80, filter: { frequency: 600, q: 3 } }); tone(140, 0.18, { type: 'square', volume: 0.05, delay: 0.12, to: 70 }); },
  splat: () => tone(170, 0.08, { type: 'sine', volume: 0.035, to: 70 }),
  bubble: () => arpeggio([523, 659, 784, 1047], 0.07),
  correct: () => arpeggio([659, 784, 1047, 1319], 0.07),
  wrong: () => tone(300, 0.4, { type: 'sawtooth', volume: 0.07, to: 110 }),
  tick: () => tone(1200, 0.04, { type: 'square', volume: 0.03 }),
  whoosh: () => { tone(180, 0.45, { type: 'sine', volume: 0.08, to: 900 }); tone(90, 0.5, { type: 'triangle', volume: 0.1, to: 45, delay: 0.3 }); },
  levelUp: () => arpeggio([523, 659, 784, 1047, 784, 1047, 1319], 0.1, { duration: 0.2 }),
  win: () => { arpeggio([523, 659, 784, 1047, 1319, 1568], 0.1, { duration: 0.22 }); arpeggio([262, 330, 392, 523], 0.15, { duration: 0.4, type: 'sine', volume: 0.07 }); },
  over: () => arpeggio([523, 440, 349, 262], 0.16, { duration: 0.22 }),
};

/* ---------- Scenery ---------- */
const sceneRng = mulberry32(2026);
const rand = (min, max) => min + (max - min) * sceneRng();
const scenery = {
  clouds: Array.from({ length: 6 }, (_, i) => ({ x: i / 6 + rand(0, 0.1), y: rand(40, 170), s: rand(0.7, 1.25), speed: rand(4, 10) })),
  trees: [0.06, 0.24, 0.47, 0.7, 0.92].map((x, i) => ({ x, s: rand(0.8, 1.15), apples: Array.from({ length: 7 }, () => ({ a: rand(0, Math.PI * 2), d: rand(0.2, 0.85) })), back: i % 2 === 1 })),
  flowers: Array.from({ length: 22 }, () => ({ x: rand(0, 1), y: rand(GROUND_Y + 2, VIEW_HEIGHT - 6), c: ['#ff7aa8', '#ffd84d', '#ffffff', '#b98cff'][Math.floor(rand(0, 4))] })),
  wheat: Array.from({ length: 70 }, (_, i) => ({ x: i / 70 + rand(0, 0.012), h: rand(26, 46), phase: rand(0, 6) })),
  birds: Array.from({ length: 5 }, () => ({ x: rand(0, 1), y: rand(60, 200), speed: rand(20, 40), phase: rand(0, 6) })),
  stars: Array.from({ length: 80 }, () => ({ x: rand(0, 1), y: rand(-200, 330), r: rand(0.6, 1.8), phase: rand(0, 6) })),
  pines: Array.from({ length: 12 }, (_, i) => ({ x: i / 11 + rand(-0.03, 0.03), s: rand(0.75, 1.3), far: i % 2 === 0 })),
  fireflies: Array.from({ length: 20 }, () => ({ x: rand(0, 1), y: rand(250, 490), phase: rand(0, 6), speed: rand(0.4, 1) })),
};

/* ---------- Setup UI ---------- */
function renderCharacters() {
  ui.grid.replaceChildren(...CHARACTERS.map((character) => {
    const label = document.createElement('label');
    label.className = 'character';
    const radio = Object.assign(document.createElement('input'), { type: 'radio', name: 'character', value: character.id, checked: character.id === characterId });
    i18n.attr(radio, 'aria-label', character.name);
    radio.addEventListener('change', () => { characterId = character.id; store.set(STORAGE.character, characterId); });
    const img = Object.assign(document.createElement('img'), { src: character.src, alt: '', width: 80, height: 80 });
    const name = Object.assign(document.createElement('span'), { textContent: character.name });
    text(name, character.name);
    label.append(radio, img, name);
    return label;
  }));
}

function renderBoard(list, highlight) {
  if (!board.length) {
    const empty = Object.assign(document.createElement('li'), { className: 'empty' });
    text(empty, 'Chưa có ai. Hãy là người đầu tiên!');
    list.replaceChildren(empty);
    return;
  }
  list.replaceChildren(...board.map((entry) => {
    const item = document.createElement('li');
    if (entry === highlight) item.className = 'mine';
    const character = CHARACTERS.find((c) => c.id === entry.character) ?? CHARACTERS[0];
    const img = Object.assign(document.createElement('img'), { src: character.src, alt: character.name, title: character.name });
    i18n.attr(img, 'alt', character.name);
    i18n.attr(img, 'title', character.name);
    const who = Object.assign(document.createElement('span'), { className: 'who', textContent: entry.name });
    const score = Object.assign(document.createElement('strong'), { textContent: entry.score.toLocaleString('vi-VN') });
    text(score, entry.score.toLocaleString('vi-VN'), entry.score.toLocaleString('en-US'));
    item.append(img, who, score);
    return item;
  }));
}

function showScreen(screen) {
  for (const el of [ui.start, ui.question, ui.pause, ui.levelUp, ui.over]) el.hidden = el !== screen;
}

const score = () => run.banked + (run.cleared ? 0 : run.levelScore);

const shown = {};
function setText(el, key, value) {
  if (shown[key] === value) return;
  shown[key] = value;
  text(el, value);
}

function updateHud() {
  const level = LEVELS[levelIndex];
  setText(ui.level, 'level', `${level.id}/${LEVELS.length}`);
  const points = score();
  if (shown.score !== points) {
    shown.score = points;
    text(ui.score, points.toLocaleString('vi-VN'), points.toLocaleString('en-US'));
  }
  setText(ui.goal, 'goal', String(run.levelScore));
  setText(ui.target, 'target', `/${level.target}`);
  ui.goalBar.style.transform = `scaleX(${Math.min(1, run.levelScore / level.target)})`;
  ui.goal.closest('.hud-pill').classList.toggle('done', run.levelScore >= level.target);
  const seconds = Math.ceil(run.timeLeft);
  setText(ui.time, 'time', String(seconds));
  ui.time.closest('.hud-pill').classList.toggle('urgent', mode === 'playing' && seconds <= 10);
}

function bump(el) {
  const pill = el.closest('.hud-pill');
  pill.classList.remove('bump');
  void pill.offsetWidth;
  pill.classList.add('bump');
}

function toast(message, tone = '', ms = 1800, en = english(message)) {
  text(ui.toast, message, en);
  ui.toast.className = `toast ${tone}`;
  ui.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast.hidden = true; }, ms);
}

/* ---------- Game flow ---------- */
function startGame(event) {
  event?.preventDefault();
  void audio.activate();
  store.set(STORAGE.name, ui.name.value.trim());
  run = { banked: 0, levelScore: 0, fruit: 0, levelFruit: 0, correct: 0, timeLeft: LEVELS[0].time, spawnIn: 1, cleared: false };
  deck = createQuestionDeck();
  startLevel(0);
  document.activeElement?.blur();
}

function startLevel(index) {
  levelIndex = index;
  const level = LEVELS[index];
  Object.assign(run, { levelScore: 0, levelFruit: 0, timeLeft: level.time, spawnIn: 1.4, cleared: false });
  items = [];
  pile = [];
  effects.splats = [];
  question = null;
  Object.assign(player, { x: view.w / 2, vx: 0, mood: 0, bounce: 0 });
  input.pointerX = null;
  audio.setTheme(level.music);
  setMode('playing');
  showScreen(null);
  banner = { title: `MÀN ${level.id}`, sub: level.name, t: 0 };
  shake = 0.4;
  flash = { color: '255, 255, 255', t: 0.45 };
  sfx.whoosh();
  for (let i = 0; i < 60; i += 1) effects.particles.push(sparkle(view.w / 2, 210, ['#ffd23f', '#ff7aa8', '#ffffff', '#7bd389'][i % 4], 1.6));
  toast(`Cần ${level.target} điểm trong ${level.time} giây!`, '', 2600, `Score ${level.target} points in ${level.time} seconds!`);
  updateHud();
  lastFrame = performance.now();
}

function setMode(next) {
  mode = next;
  audio.setMusicPlaying(next === 'playing' || next === 'question');
  if (next === 'paused' || next === 'menu') audio.stopVoices();
  document.body.classList.toggle('playing', next === 'playing' || next === 'question');
  ui.pauseToggle.disabled = !(next === 'playing' || next === 'paused');
  const paused = next === 'paused';
  i18n.attr(ui.pauseToggle, 'aria-label', paused ? 'Chơi tiếp' : 'Tạm dừng');
  i18n.attr(ui.pauseToggle, 'title', paused ? 'Chơi tiếp (P)' : 'Tạm dừng (P)', paused ? 'Resume (P)' : 'Pause (P)');
  ui.pauseToggle.querySelector('use').setAttribute('href', paused ? '#icon-play' : '#icon-pause');
  if (next !== 'playing') { input.left = input.right = false; dragging = false; }
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

function levelCleared() {
  const level = LEVELS[levelIndex];
  run.banked += run.levelScore;
  run.cleared = true;
  for (const item of items) effects.particles.push(puff(item.x, item.y, '#ffffff'));
  items = [];
  confetti(110);
  updateHud();
  if (levelIndex === LEVELS.length - 1) { gameOver('won'); return; }
  setMode('level');
  sfx.levelUp();
  const next = LEVELS[levelIndex + 1];
  text($('level-eyebrow'), `Qua màn ${level.id}!`, `Level ${level.id} cleared!`);
  text($('level-title'), ['Tuyệt vời!', 'Xuất sắc!'][levelIndex] ?? 'Giỏi quá!', ['Wonderful!', 'Excellent!'][levelIndex] ?? 'Great job!');
  text($('level-next'), `Tiếp theo: Màn ${next.id} · ${next.name} — cần ${next.target} điểm, trái rơi nhanh hơn và nhiều sâu hơn!`, `Up next: Level ${next.id} · ${english(next.name)} — score ${next.target} points with faster fruit and more worms!`);
  text($('level-score'), run.levelScore.toLocaleString('vi-VN'), run.levelScore.toLocaleString('en-US'));
  $('level-fruit').textContent = run.levelFruit;
  text($('level-total'), run.banked.toLocaleString('vi-VN'), run.banked.toLocaleString('en-US'));
  setTimeout(() => { if (mode === 'level') { showScreen(ui.levelUp); $('next-button').focus(); } }, 900);
}

function gameOver(reason) {
  setMode('over');
  if (reason === 'won') sfx.win(); else sfx.over();
  const final = score();
  const result = addScore(board, { name: normalizeName(store.get(STORAGE.name) || i18n.t('Bạn nhỏ', 'Little explorer')), score: final, character: characterId, date: Date.now() });
  board = result.board;
  store.set(STORAGE.board, JSON.stringify(board));
  const character = CHARACTERS.find((c) => c.id === characterId);
  $('over-avatar').src = character.wow ?? character.src;
  text($('over-eyebrow'), { won: 'Hoàn thành cả 3 màn!', timeout: `Hết giờ ở màn ${LEVELS[levelIndex].id}!`, quit: 'Bạn đã dừng lượt chơi' }[reason], { won: 'All 3 levels complete!', timeout: `Time is up on level ${LEVELS[levelIndex].id}!`, quit: 'You ended the game' }[reason]);
  text($('over-title'), reason === 'won' ? 'Chiến thắng!' : 'Kết thúc');
  text($('final-score'), final.toLocaleString('vi-VN'), final.toLocaleString('en-US'));
  $('final-level').textContent = reason === 'won' ? `${LEVELS.length} ✓` : LEVELS[levelIndex].id;
  $('final-fruit').textContent = run.fruit;
  $('final-correct').textContent = run.correct;
  text($('rank-note'), result.rank === 1 ? '🏆 Kỷ lục mới! Bạn đứng hạng 1!' : result.rank ? `🎉 Bạn lọt vào bảng xếp hạng: hạng ${result.rank}` : 'Cố lên! Lần sau sẽ lọt vào top 10.', result.rank === 1 ? '🏆 New record! You are number 1!' : result.rank ? `🎉 You made the leaderboard: rank ${result.rank}` : 'Keep going! Aim for the top 10 next time.');
  renderBoard($('board-over'), board[result.rank - 1]);
  renderBoard($('board-start'));
  setTimeout(() => { if (mode === 'over') { showScreen(ui.over); $('again-button').focus(); } }, reason === 'won' ? 1400 : 700);
}

/* ---------- Questions ---------- */
function openQuestion() {
  question = { ...deck.next(), answered: false };
  question.left = question.time;
  question.lastTick = question.time;
  setMode('question');
  sfx.bubble();
  text(ui.topic, question.topic);
  text(ui.difficulty, question.label);
  ui.difficulty.className = `difficulty${question.level === 'hard' ? ' hard' : ''}`;
  text(ui.stakes, `Đúng +${question.reward} điểm · Sai −${question.penalty} điểm`, `Correct +${question.reward} points · Wrong −${question.penalty} points`);
  text(ui.prompt, question.prompt);
  text(ui.feedback, '');
  ui.feedback.className = 'question-feedback';
  ui.answers.replaceChildren(...question.choices.map((text, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    const key = Object.assign(document.createElement('kbd'), { textContent: index + 1 });
    const label = document.createTextNode('');
    i18n.text(label, text);
    button.append(key, label);
    button.addEventListener('click', () => answer(index));
    return button;
  }));
  updateQuestionTimer();
  showScreen(ui.question);
}

function updateQuestionTimer() {
  const left = Math.max(0, question.left);
  ui.seconds.textContent = Math.ceil(left);
  ui.bar.style.transform = `scaleX(${left / question.time})`;
  const urgent = left <= 3;
  ui.seconds.parentElement.classList.toggle('urgent', urgent);
  ui.bar.parentElement.classList.toggle('urgent', urgent);
  if (urgent && Math.ceil(left) < question.lastTick) { question.lastTick = Math.ceil(left); sfx.tick(); }
}

function answer(index) {
  if (!question || question.answered) return;
  question.answered = true;
  const correct = index === question.correctIndex;
  [...ui.answers.children].forEach((button, i) => {
    button.disabled = true;
    if (i === question.correctIndex) button.classList.add('correct');
    else if (i === index) button.classList.add('wrong');
    else button.classList.add('dim');
  });
  const right = question.choices[question.correctIndex];
  if (correct) {
    addPoints(question.reward, player.x, '#7c5ce0', RIM_Y - 90);
    run.correct += 1;
    player.mood = 1;
    text(ui.feedback, `Chính xác! +${question.reward} điểm`, `Correct! +${question.reward} points`);
    ui.feedback.className = 'question-feedback good';
    sfx.correct();
    for (let i = 0; i < 36; i += 1) effects.particles.push(sparkle(player.x, RIM_Y - 40, i % 2 ? '#ffc94a' : '#b79cff'));
  } else {
    addPoints(-question.penalty, player.x, '#d9413a', RIM_Y - 90);
    text(ui.feedback, `${index < 0 ? 'Hết giờ!' : 'Chưa đúng!'} Đáp án đúng: ${right} (−${question.penalty} điểm)`, `${index < 0 ? "Time's up!" : 'Not quite!'} Correct answer: ${english(right)} (−${question.penalty} points)`);
    ui.feedback.className = 'question-feedback bad';
    sfx.wrong();
  }
  updateHud();
  setTimeout(() => closeQuestion(correct), correct ? 900 : 1900);
}

function closeQuestion(correct) {
  question = null;
  showScreen(null);
  setMode('playing');
  lastFrame = performance.now();
  toast(correct ? 'Giỏi quá! Hứng tiếp nào!' : 'Không sao, cố lên nhé!', correct ? 'good' : 'bad');
}

/* ---------- Simulation ---------- */
function addPoints(delta, x, color, y = RIM_Y - 30) {
  run.levelScore = applyPoints(run.levelScore, delta);
  effects.floaters.push({ x, y, text: delta > 0 ? `+${delta}` : `−${-delta}`, color, t: 0, size: Math.abs(delta) >= 40 ? 34 : 25 });
  bump(ui.score);
}

function catchItem(item) {
  player.bounce = 1;
  if (item.kind === 'question') {
    for (let i = 0; i < 26; i += 1) effects.particles.push(sparkle(item.x, RIM_Y, i % 2 ? '#b79cff' : '#ffffff'));
    openQuestion();
    return;
  }
  if (item.kind === 'worm') {
    addPoints(ITEMS.worm.points, item.x, '#d9413a');
    player.mood = 0.9;
    shake = 0.45;
    flash = { color: '226, 87, 76', t: 0.45 };
    sfx.worm();
    for (let i = 0; i < 16; i += 1) effects.particles.push(sparkle(item.x, RIM_Y, i % 2 ? '#7bc043' : '#3f7a22'));
    return;
  }
  const { points } = ITEMS[item.kind];
  addPoints(points, item.x, item.kind === 'goldenApple' ? '#e39a22' : '#2d9b64');
  run.fruit += 1;
  run.levelFruit += 1;
  pile.push(item.kind);
  if (pile.length > 6) pile.shift();
  if (item.kind === 'goldenApple') {
    sfx.golden();
    player.mood = 0.8;
    flash = { color: '255, 214, 80', t: 0.35 };
    for (let i = 0; i < 40; i += 1) effects.particles.push(sparkle(item.x, RIM_Y, i % 3 ? '#ffd23f' : '#ffffff', 1.3));
  } else {
    sfx.catch(points);
    for (let i = 0; i < 10; i += 1) effects.particles.push(sparkle(item.x, RIM_Y, i % 2 ? COLORS[item.kind] : '#ffffff'));
  }
}

function land(item) {
  if (item.kind === 'question') {
    for (let i = 0; i < 12; i += 1) effects.particles.push(sparkle(item.x, GROUND_Y - 6, '#cbb8ff', 0.6));
    return;
  }
  if (item.kind === 'worm') {
    for (let i = 0; i < 5; i += 1) effects.particles.push(puff(item.x, GROUND_Y - 4, '#c9b18a'));
    return;
  }
  sfx.splat();
  effects.splats.push({ x: item.x, color: COLORS[item.kind], t: 0, w: 12 + Math.random() * 10 });
  for (let i = 0; i < 6; i += 1) effects.particles.push(puff(item.x, GROUND_Y - 4, COLORS[item.kind]));
}

function step(h) {
  const level = LEVELS[levelIndex];
  run.timeLeft = Math.max(0, run.timeLeft - h);

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let target = 0;
  if (dir) { target = dir * MOVE_SPEED; input.pointerX = null; }
  else if (input.pointerX != null) target = Math.max(-MOVE_SPEED * 1.5, Math.min(MOVE_SPEED * 1.5, (input.pointerX - player.x) * 10));
  player.vx += (target - player.vx) * Math.min(1, h * 14);
  if (Math.abs(player.vx) > 30) player.facing = Math.sign(player.vx);
  const edge = BASKET_W / 2 + 6;
  player.x = Math.max(edge, Math.min(view.w - edge, player.x + player.vx * h));
  player.mood = Math.max(0, player.mood - h);
  player.bounce *= 1 - Math.min(1, h * 8);

  run.spawnIn -= h;
  if (run.spawnIn <= 0) {
    const item = spawnItem(level, view.w);
    item.baseX = item.x;
    item.y = item.prevY = -view.offsetY - 40;
    item.t = 0;
    items.push(item);
    run.spawnIn = level.spawnEvery * (0.6 + Math.random() * 0.8);
  }

  for (const item of items) {
    item.t += h;
    item.prevY = item.y;
    item.y += item.vy * h;
    item.angle += item.spin * h;
    item.x = Math.max(24, Math.min(view.w - 24, item.baseX + Math.sin(item.t * 2.4 + item.phase) * item.sway));
    if (isCaught(item, player.x, RIM_Y)) {
      item.done = true;
      catchItem(item);
      if (mode !== 'playing') break;
    } else if (item.y > GROUND_Y - 6) {
      item.done = true;
      land(item);
    }
  }
  items = items.filter((item) => !item.done);
  if (mode !== 'playing') return;

  const result = levelResult(run.levelScore, run.timeLeft, level);
  if (result === 'cleared') levelCleared();
  else if (result === 'failed') gameOver('timeout');
}

function updateEffects(dt) {
  for (const p of effects.particles) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; }
  effects.particles = effects.particles.filter((p) => p.t < p.life);
  for (const c of effects.confetti) { c.t += dt; c.vy = Math.min(c.vy + 260 * dt, 220); c.x += (c.vx + Math.sin(c.t * 4 + c.phase) * 40) * dt; c.y += c.vy * dt; c.r += c.vr * dt; }
  effects.confetti = effects.confetti.filter((c) => c.t < 4);
  for (const f of effects.floaters) f.t += dt;
  effects.floaters = effects.floaters.filter((f) => f.t < 1.1);
  for (const s of effects.splats) s.t += dt;
  effects.splats = effects.splats.filter((s) => s.t < 2.5);
  if (banner) { banner.t += dt; if (banner.t > 2.4) banner = null; }
  shake = Math.max(0, shake - dt);
  if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; }
}

function puff(x, y, color) {
  return { x, y, vx: (Math.random() - 0.5) * 120, vy: -20 - Math.random() * 60, g: 40, r: 3 + Math.random() * 5, life: 0.5 + Math.random() * 0.3, t: 0, color, kind: 'puff' };
}
function sparkle(x, y, color, power = 1) {
  const angle = Math.random() * Math.PI * 2;
  const speed = (90 + Math.random() * 220) * power;
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60, g: 320, r: 2 + Math.random() * 3, life: 0.6 + Math.random() * 0.5, t: 0, color, kind: 'spark' };
}
function confetti(count) {
  const palette = ['#ff6b6b', '#ffd23f', '#7bd389', '#6ec3ff', '#b98cff', '#ff9ad5'];
  for (let i = 0; i < count; i += 1) {
    effects.confetti.push({ x: Math.random() * view.w, y: -view.offsetY - Math.random() * 200, vx: (Math.random() - 0.5) * 60, vy: 60 + Math.random() * 80, r: Math.random() * 6, vr: (Math.random() - 0.5) * 10, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, color: palette[i % palette.length], phase: Math.random() * 6, t: 0 });
  }
}

/* ---------- Rendering: scenes ---------- */
function resize() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.min(rect.height / VIEW_HEIGHT, rect.width / MIN_VIEW_WIDTH);
  // Extra height goes above the play area so the ground always sits on the bottom edge.
  view = { cssW: rect.width, cssH: rect.height, dpr, scale, w: rect.width / scale, offsetY: Math.max(0, rect.height / scale - VIEW_HEIGHT) };
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  if (mode === 'menu') player.x = view.w / 2;
  player.x = Math.max(BASKET_W / 2 + 6, Math.min(view.w - BASKET_W / 2 - 6, player.x));
}

const top = () => -view.offsetY;

function skyGradient(stops) {
  const gradient = ctx.createLinearGradient(0, top(), 0, GROUND_Y);
  stops.forEach(([at, color]) => gradient.addColorStop(at, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top(), view.w, VIEW_HEIGHT - top());
}

function hills(baseY, amplitude, waves, phase, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, VIEW_HEIGHT);
  for (let x = 0; x <= view.w + 20; x += 20) ctx.lineTo(x, baseY - Math.sin(x / view.w * Math.PI * waves + phase) * amplitude);
  ctx.lineTo(view.w, VIEW_HEIGHT);
  ctx.fill();
}

function puffyCloud(x, y, s) {
  ctx.beginPath();
  for (const [dx, dy, r] of [[-38, 4, 22], [-14, -10, 28], [16, -6, 25], [40, 6, 18]]) { ctx.moveTo(x + (dx + r) * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); }
  ctx.roundRect(x - 56 * s, y, 112 * s, 24 * s, 12 * s);
  ctx.fill();
}

function drawMorning(time) {
  skyGradient([[0, '#5cb8f2'], [0.6, '#aee0fb'], [1, '#e6f8ff']]);
  const sunX = 90;
  const sunY = 80;
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.rotate(time * 0.15);
  ctx.fillStyle = 'rgba(255, 236, 140, .45)';
  for (let i = 0; i < 12; i += 1) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(-8, 44); ctx.lineTo(8, 44); ctx.lineTo(0, 78); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = '#ffe36e';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, .92)';
  for (const c of scenery.clouds) {
    const span = view.w + 300;
    const x = ((c.x * span + time * c.speed) % span) - 150;
    puffyCloud(x, c.y, c.s);
  }
  hills(400, 30, 2, 0.6, '#a9dd8d');
  hills(440, 22, 3, 2, '#86cc6b');
  for (const tree of scenery.trees) drawAppleTree(tree.x * view.w, GROUND_Y - 4, tree.s * (tree.back ? 0.8 : 1), tree, time);
  drawGrass('#6fbf57', '#4e9c3a');
  for (const f of scenery.flowers) {
    ctx.fillStyle = f.c;
    for (let i = 0; i < 5; i += 1) { const a = i * Math.PI * 0.4; ctx.beginPath(); ctx.arc(f.x * view.w + Math.cos(a) * 3, f.y + Math.sin(a) * 3, 2.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffb02e';
    ctx.beginPath();
    ctx.arc(f.x * view.w, f.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAppleTree(x, groundY, s, tree, time) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(s, s);
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath();
  ctx.moveTo(-10, 0); ctx.lineTo(-7, -120); ctx.lineTo(7, -120); ctx.lineTo(10, 0);
  ctx.fill();
  const sway = Math.sin(time * 0.8 + x) * 2;
  ctx.fillStyle = tree.back ? '#5eae4c' : '#4f9e3f';
  ctx.beginPath();
  for (const [dx, dy, r] of [[-38, -140, 40], [0, -175, 48], [38, -140, 40], [-18, -118, 34], [20, -115, 34]]) { ctx.moveTo(dx + sway + r, dy); ctx.arc(dx + sway, dy, r, 0, Math.PI * 2); }
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, .12)';
  ctx.beginPath();
  ctx.arc(-10 + sway, -185, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e63b2e';
  for (const apple of tree.apples) {
    ctx.beginPath();
    ctx.arc(Math.cos(apple.a) * 60 * apple.d + sway, -150 + Math.sin(apple.a) * 38 * apple.d, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGrass(fill, blade) {
  ctx.fillStyle = fill;
  ctx.fillRect(0, GROUND_Y - 6, view.w, VIEW_HEIGHT - GROUND_Y + 6);
  ctx.strokeStyle = blade;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = 4; x < view.w; x += 9) { ctx.moveTo(x, GROUND_Y - 4); ctx.lineTo(x + 3, GROUND_Y - 12 - (x * 7 % 6)); }
  ctx.stroke();
}

function drawSunset(time) {
  skyGradient([[0, '#5b3a7a'], [0.35, '#e0607e'], [0.7, '#ff9a5a'], [1, '#ffd38a']]);
  const sunX = view.w * 0.32;
  const glow = ctx.createRadialGradient(sunX, 360, 20, sunX, 360, 260);
  glow.addColorStop(0, 'rgba(255, 230, 150, .9)');
  glow.addColorStop(1, 'rgba(255, 180, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 260, 100, 520, 400);
  ctx.fillStyle = '#ffdf7a';
  ctx.beginPath();
  ctx.arc(sunX, 360, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9b5a86';
  ctx.beginPath();
  ctx.moveTo(0, 430);
  [[0.1, 330], [0.22, 380], [0.38, 300], [0.55, 390], [0.7, 320], [0.86, 370], [1, 310]].forEach(([fx, y]) => ctx.lineTo(fx * view.w, y));
  ctx.lineTo(view.w, 430);
  ctx.fill();
  hills(430, 14, 2, 1, '#c98a4b');
  drawBarn(view.w * 0.8, GROUND_Y - 14);
  ctx.strokeStyle = '#6b3f22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 462); ctx.lineTo(view.w, 462);
  ctx.moveTo(0, 478); ctx.lineTo(view.w, 478);
  for (let x = 20; x < view.w; x += 60) { ctx.moveTo(x, 450); ctx.lineTo(x, GROUND_Y - 4); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60, 20, 40, .7)';
  ctx.lineWidth = 2;
  for (const bird of scenery.birds) {
    const span = view.w + 200;
    const x = ((bird.x * span + time * bird.speed) % span) - 100;
    const flap = Math.sin(time * 6 + bird.phase) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 9, bird.y - flap);
    ctx.quadraticCurveTo(x - 4, bird.y - 4, x, bird.y);
    ctx.quadraticCurveTo(x + 4, bird.y - 4, x + 9, bird.y - flap);
    ctx.stroke();
  }
  ctx.fillStyle = '#e2a94a';
  ctx.fillRect(0, GROUND_Y - 6, view.w, VIEW_HEIGHT - GROUND_Y + 6);
  ctx.strokeStyle = '#c08427';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const w of scenery.wheat) {
    const x = w.x * view.w;
    const lean = Math.sin(time * 1.6 + w.phase) * 4;
    ctx.moveTo(x, VIEW_HEIGHT);
    ctx.quadraticCurveTo(x, GROUND_Y - w.h / 2, x + lean, GROUND_Y - w.h * 0.6);
  }
  ctx.stroke();
  ctx.fillStyle = '#f3c55c';
  for (const w of scenery.wheat) {
    const lean = Math.sin(time * 1.6 + w.phase) * 4;
    ctx.beginPath();
    ctx.ellipse(w.x * view.w + lean, GROUND_Y - w.h * 0.6 - 6, 3, 8, lean * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBarn(x, groundY) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.fillStyle = '#c9c1b4';
  ctx.fillRect(70, -150, 36, 150);
  ctx.beginPath();
  ctx.arc(88, -150, 18, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#b73a32';
  ctx.beginPath();
  ctx.moveTo(-70, 0); ctx.lineTo(-70, -80); ctx.lineTo(-40, -120); ctx.lineTo(40, -120); ctx.lineTo(70, -80); ctx.lineTo(70, 0);
  ctx.fill();
  ctx.strokeStyle = '#fff4e6';
  ctx.lineWidth = 4;
  ctx.strokeRect(-24, -60, 48, 60);
  ctx.beginPath();
  ctx.moveTo(-24, -60); ctx.lineTo(24, 0); ctx.moveTo(24, -60); ctx.lineTo(-24, 0);
  ctx.stroke();
  ctx.fillStyle = '#fff4e6';
  ctx.fillRect(-12, -102, 24, 18);
  ctx.restore();
}

function drawNight(time) {
  skyGradient([[0, '#0a1233'], [0.6, '#1d3168'], [1, '#2f4f80']]);
  for (const star of scenery.stars) {
    ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(time * 1.5 + star.phase));
    ctx.fillStyle = '#fffbe0';
    ctx.beginPath();
    ctx.arc(star.x * view.w, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const moonX = view.w * 0.8;
  const glow = ctx.createRadialGradient(moonX, 95, 20, moonX, 95, 170);
  glow.addColorStop(0, 'rgba(255, 250, 210, .55)');
  glow.addColorStop(1, 'rgba(255, 250, 210, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(moonX - 170, -75, 340, 340);
  ctx.fillStyle = '#fff7cf';
  ctx.beginPath();
  ctx.arc(moonX, 95, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(210, 196, 150, .55)';
  for (const [dx, dy, r] of [[-14, -10, 9], [12, 8, 7], [-4, 18, 5], [16, -16, 4]]) { ctx.beginPath(); ctx.arc(moonX + dx, 95 + dy, r, 0, Math.PI * 2); ctx.fill(); }
  hills(420, 24, 2.5, 0.3, '#1b3352');
  for (const pine of scenery.pines) drawPine(pine.x * view.w, GROUND_Y, pine.s * (pine.far ? 0.8 : 1.05), pine.far ? '#16304a' : '#0d2232');
  ctx.fillStyle = '#183a2e';
  ctx.fillRect(0, GROUND_Y - 6, view.w, VIEW_HEIGHT - GROUND_Y + 6);
  ctx.strokeStyle = '#10291f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 4; x < view.w; x += 9) { ctx.moveTo(x, GROUND_Y - 4); ctx.lineTo(x + 3, GROUND_Y - 12 - (x * 7 % 6)); }
  ctx.stroke();
  for (const fly of scenery.fireflies) {
    const x = fly.x * view.w + Math.sin(time * fly.speed + fly.phase) * 40;
    const y = fly.y + Math.cos(time * fly.speed * 1.3 + fly.phase) * 20;
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(time * 2 + fly.phase));
    const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
    g.addColorStop(0, `rgba(230, 255, 140, ${alpha})`);
    g.addColorStop(1, 'rgba(230, 255, 140, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 12, y - 12, 24, 24);
  }
}

function drawPine(x, groundY, s, color) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.fillRect(-6, -30, 12, 30);
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-48 + i * 9, -24 - i * 42);
    ctx.lineTo(0, -92 - i * 42);
    ctx.lineTo(48 - i * 9, -24 - i * 42);
    ctx.fill();
  }
  ctx.restore();
}

/* ---------- Rendering: items ---------- */
function shine(x, y, rx, ry) {
  ctx.fillStyle = 'rgba(255, 255, 255, .55)';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function leaf(x, y, rotation, size = 1) {
  ctx.fillStyle = '#5fb544';
  ctx.beginPath();
  ctx.ellipse(x, y, 7 * size, 3.4 * size, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function appleShape(light, dark) {
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.bezierCurveTo(6, -18, 20, -14, 18, 1);
  ctx.bezierCurveTo(17, 13, 8, 19, 0, 15);
  ctx.bezierCurveTo(-8, 19, -17, 13, -18, 1);
  ctx.bezierCurveTo(-20, -14, -6, -18, 0, -11);
  ctx.closePath();
  const g = ctx.createRadialGradient(-6, -6, 2, 0, 0, 22);
  g.addColorStop(0, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.quadraticCurveTo(1, -18, 4, -22);
  ctx.stroke();
  leaf(9, -18, -0.5);
  shine(-8, -3, 3, 5);
}

function drawItemShape(kind, time, id = 0) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  switch (kind) {
    case 'apple': appleShape('#ff7a6b', '#c4241b'); break;
    case 'greenApple': appleShape('#c9f08a', '#5fa52e'); break;
    case 'goldenApple': {
      const pulse = 1 + Math.sin(time * 8) * 0.1;
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 34 * pulse);
      g.addColorStop(0, 'rgba(255, 230, 110, .9)');
      g.addColorStop(1, 'rgba(255, 230, 110, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-36, -36, 72, 72);
      appleShape('#fff3a8', '#e0a20f');
      ctx.fillStyle = '#ffffff';
      const tw = Math.abs(Math.sin(time * 6)) * 6 + 2;
      ctx.beginPath();
      ctx.moveTo(14, -18 - tw); ctx.lineTo(16, -18); ctx.lineTo(14, -18 + tw); ctx.lineTo(12, -18); ctx.closePath();
      ctx.moveTo(14 - tw, -18); ctx.lineTo(14, -16); ctx.lineTo(14 + tw, -18); ctx.lineTo(14, -20); ctx.closePath();
      ctx.fill();
      break;
    }
    case 'pear': {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.bezierCurveTo(7, -18, 8, -8, 10, -2);
      ctx.bezierCurveTo(19, 6, 15, 19, 0, 19);
      ctx.bezierCurveTo(-15, 19, -19, 6, -10, -2);
      ctx.bezierCurveTo(-8, -8, -7, -18, 0, -18);
      const g = ctx.createRadialGradient(-5, 2, 2, 0, 4, 22);
      g.addColorStop(0, '#f2f7a0');
      g.addColorStop(1, '#a7b62c');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(2, -25); ctx.stroke();
      leaf(8, -22, -0.4, 0.9);
      shine(-6, 4, 3, 5);
      break;
    }
    case 'orange': {
      const g = ctx.createRadialGradient(-5, -5, 2, 0, 0, 20);
      g.addColorStop(0, '#ffc266');
      g.addColorStop(1, '#f07b0c');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(180, 80, 0, .35)';
      for (const [dx, dy] of [[5, 4], [-4, 7], [8, -4], [-8, -2], [1, -8]]) { ctx.beginPath(); ctx.arc(dx, dy, 1, 0, Math.PI * 2); ctx.fill(); }
      leaf(5, -17, -0.3, 0.9);
      shine(-6, -5, 3, 4);
      break;
    }
    case 'banana': {
      ctx.beginPath();
      ctx.arc(0, -16, 28, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.arc(0, -22, 26, 0.75 * Math.PI, 0.25 * Math.PI, true);
      ctx.closePath();
      ctx.fillStyle = '#ffd93b';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#6b4a1d';
      ctx.beginPath(); ctx.arc(22, 0, 2.6, 0, Math.PI * 2); ctx.arc(-22, 0, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200, 150, 20, .7)';
      ctx.beginPath(); ctx.arc(0, -18, 26, 0.3 * Math.PI, 0.7 * Math.PI); ctx.stroke();
      break;
    }
    case 'grapes': {
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(1, -22); ctx.stroke();
      leaf(8, -19, -0.4, 0.9);
      for (const [dx, dy] of [[-11, -8], [0, -9], [11, -8], [-6, 1], [6, 1], [0, 10]]) {
        const g = ctx.createRadialGradient(dx - 2, dy - 2, 1, dx, dy, 7);
        g.addColorStop(0, '#c99bf2');
        g.addColorStop(1, '#6a2fae');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(dx, dy, 6.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      break;
    }
    case 'strawberry': {
      ctx.beginPath();
      ctx.moveTo(0, 19);
      ctx.bezierCurveTo(-12, 12, -18, -2, -14, -10);
      ctx.bezierCurveTo(-10, -16, 10, -16, 14, -10);
      ctx.bezierCurveTo(18, -2, 12, 12, 0, 19);
      ctx.fillStyle = '#ef3b4f';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffe48a';
      for (const [dx, dy] of [[-7, -5], [0, -6], [7, -5], [-4, 2], [4, 2], [0, 9]]) { ctx.beginPath(); ctx.ellipse(dx, dy, 1.2, 1.8, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#4fa63a';
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) { const a = Math.PI + i * Math.PI / 4; ctx.moveTo(0, -13); ctx.lineTo(Math.cos(a) * 11, -13 + Math.sin(a) * 6); ctx.lineTo(Math.cos(a + 0.4) * 5, -13 + Math.sin(a + 0.4) * 3); }
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'cherry': {
      ctx.strokeStyle = '#4c7a2a';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-8, 4); ctx.quadraticCurveTo(-4, -12, 2, -20); ctx.moveTo(8, 6); ctx.quadraticCurveTo(6, -10, 2, -20); ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      leaf(8, -19, -0.6, 0.9);
      for (const [dx, dy] of [[-8, 9], [8, 11]]) {
        const g = ctx.createRadialGradient(dx - 3, dy - 3, 1, dx, dy, 10);
        g.addColorStop(0, '#ff6b7c');
        g.addColorStop(1, '#a50b22');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(dx, dy, 8.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        shine(dx - 3, dy - 3, 1.6, 2.6);
      }
      break;
    }
    case 'watermelon': {
      ctx.beginPath(); ctx.arc(0, -6, 21, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = '#3f9b3a'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -6, 17, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = '#f4ffe8'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -6, 15, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = '#ff5a6a'; ctx.fill();
      ctx.fillStyle = '#2b1a12';
      for (const [dx, dy] of [[-8, -1], [0, 3], [8, -1]]) { ctx.beginPath(); ctx.ellipse(dx, dy, 1.4, 2.4, 0, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'worm': drawWorm(time, id); break;
    case 'question': drawBubble(time, id); break;
    default: break;
  }
}

function drawWorm(time, id) {
  const wiggle = time * 10 + id;
  const ring = (time * 1.2 + id * 0.13) % 1;
  ctx.strokeStyle = `rgba(226, 70, 60, ${0.75 * (1 - ring)})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.arc(0, 0, 24 + ring * 10, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const x = -18 + i * 8.5;
    const y = Math.sin(wiggle + i * 0.9) * 3.5;
    const r = i === 4 ? 8.5 : 6.5;
    ctx.fillStyle = i % 2 ? '#8fd14f' : '#7bc043';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  const hy = Math.sin(wiggle + 3.6) * 3.5;
  ctx.beginPath(); ctx.moveTo(15, hy - 7); ctx.lineTo(12, hy - 15); ctx.moveTo(19, hy - 7); ctx.lineTo(22, hy - 15); ctx.stroke();
  ctx.fillStyle = '#e2463c';
  ctx.beginPath(); ctx.arc(12, hy - 15, 2, 0, Math.PI * 2); ctx.arc(22, hy - 15, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(14.5, hy - 2, 3, 0, Math.PI * 2); ctx.arc(20.5, hy - 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath(); ctx.arc(15.3, hy - 1.5, 1.4, 0, Math.PI * 2); ctx.arc(21.3, hy - 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12, hy - 6.5); ctx.lineTo(16.5, hy - 5); ctx.moveTo(23, hy - 6.5); ctx.lineTo(19, hy - 5); ctx.stroke();
  ctx.beginPath(); ctx.arc(18, hy + 4, 2.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
}

function drawBubble(time, id) {
  const pulse = (time * 0.9 + id * 0.1) % 1;
  ctx.strokeStyle = `rgba(170, 140, 255, ${1 - pulse})`;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 24 + pulse * 18, 0, Math.PI * 2); ctx.stroke();
  const g = ctx.createRadialGradient(-6, -8, 3, 0, 0, 24);
  g.addColorStop(0, '#c7b4ff');
  g.addColorStop(1, '#6a46d8');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#3c2591';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  shine(-8, -9, 4, 6);
  ctx.fillStyle = 'white';
  ctx.font = '800 28px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 2);
  ctx.textBaseline = 'alphabetic';
}

function drawItemShadows() {
  for (const item of items) {
    const near = Math.max(0, Math.min(1, (item.y + 40) / (GROUND_Y + 40)));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.08 + near * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(item.x, GROUND_Y + 2, 6 + near * 12, 2 + near * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawItems(time) {
  for (const item of items) {
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.kind === 'worm') ctx.rotate(Math.sin(time * 3 + item.id) * 0.25);
    else if (item.kind !== 'question') ctx.rotate(item.angle * 0.35);
    ctx.scale(1.3, 1.3);
    drawItemShape(item.kind, time, item.id);
    ctx.restore();
  }
}

/* ---------- Rendering: player ---------- */
function drawBasket(rimY) {
  const w = BASKET_W;
  const h = 34;
  const half = w / 2;
  pile.forEach((kind, i) => {
    ctx.save();
    ctx.translate((i - (pile.length - 1) / 2) * 13, rimY - 3 - (i % 2) * 5);
    ctx.scale(0.6, 0.6);
    drawItemShape(kind, clock);
    ctx.restore();
  });

  const bowl = () => {
    ctx.beginPath();
    ctx.moveTo(-half, rimY);
    ctx.lineTo(half, rimY);
    ctx.bezierCurveTo(half - 1, rimY + h * 0.75, half - 16, rimY + h, 0, rimY + h);
    ctx.bezierCurveTo(-half + 16, rimY + h, -half + 1, rimY + h * 0.75, -half, rimY);
    ctx.closePath();
  };
  bowl();
  const g = ctx.createLinearGradient(0, rimY, 0, rimY + h);
  g.addColorStop(0, '#d99a52');
  g.addColorStop(1, '#9c5f27');
  ctx.fillStyle = g;
  ctx.fill();

  // Soft woven pattern: staggered rounded strands
  ctx.save();
  ctx.clip();
  ctx.lineWidth = 1.2;
  for (let y = rimY + 5, row = 0; y < rimY + h; y += 8.5, row += 1) {
    for (let x = -half - 14 + (row % 2) * 8; x < half + 14; x += 16) {
      const strand = ctx.createLinearGradient(0, y, 0, y + 7);
      strand.addColorStop(0, '#f2c788');
      strand.addColorStop(1, '#c98a45');
      ctx.fillStyle = strand;
      ctx.strokeStyle = 'rgba(112, 62, 22, .45)';
      ctx.beginPath();
      ctx.roundRect(x, y, 14, 7, 3.5);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(255, 255, 255, .16)';
  ctx.beginPath();
  ctx.ellipse(-half * 0.45, rimY + h * 0.35, 9, 13, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  bowl();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Gingham cloth liner peeking over the front with a scalloped edge
  const clothW = w - 10;
  const bumps = 7;
  const bw = clothW / bumps;
  ctx.beginPath();
  ctx.moveTo(-clothW / 2, rimY + 2);
  for (let i = 0; i < bumps; i += 1) {
    const x0 = -clothW / 2 + i * bw;
    ctx.quadraticCurveTo(x0 + bw / 2, rimY + 22, x0 + bw, rimY + 3);
  }
  ctx.closePath();
  ctx.fillStyle = '#e8524f';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, .55)';
  for (let x = -clothW / 2; x < clothW / 2; x += 8) ctx.fillRect(x, rimY, 4, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, .35)';
  ctx.fillRect(-clothW / 2, rimY + 8, clothW, 3);
  ctx.restore();
  ctx.strokeStyle = '#a3302e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Braided rim
  ctx.fillStyle = '#8a5221';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-half - 5, rimY - 5, w + 10, 10, 5);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = 'rgba(92, 50, 16, .8)';
  for (let x = -half - 1, i = 0; x <= half + 1; x += 8, i += 1) {
    ctx.fillStyle = i % 2 ? '#e3a95f' : '#cf904a';
    ctx.beginPath();
    ctx.ellipse(x, rimY, 5.5, 3.6, i % 2 ? 0.55 : -0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Little mitten hands
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#fff3e2';
    ctx.beginPath();
    ctx.ellipse(side * (half + 1), rimY + 3, 8, 9, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 160, 150, .5)';
    ctx.beginPath();
    ctx.ellipse(side * (half + 2), rimY + 6, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(time) {
  const character = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0];
  const image = images.get(player.mood > 0 && character.wow ? character.wow : character.src);
  const moving = Math.abs(player.vx) > 40;
  const bob = moving ? Math.abs(Math.sin(time * 14)) * 4 : Math.sin(time * 2.5) * 1.2;
  const tilt = player.vx / MOVE_SPEED * 0.09;
  const dip = player.bounce * 7;

  if (LEVELS[levelIndex].scene === 'night') {
    const glow = ctx.createRadialGradient(player.x, RIM_Y - 20, 10, player.x, RIM_Y - 20, 170);
    glow.addColorStop(0, 'rgba(255, 224, 150, .32)');
    glow.addColorStop(1, 'rgba(255, 224, 150, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(player.x - 170, RIM_Y - 190, 340, 340);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, .2)';
  ctx.beginPath();
  ctx.ellipse(player.x, GROUND_Y + 3, 48, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(player.x, GROUND_Y - bob);
  ctx.rotate(tilt);
  const height = 138;
  const ratio = image?.naturalWidth ? image.naturalWidth / image.naturalHeight : 0.85;
  const width = Math.min(150, height * ratio);
  ctx.save();
  ctx.scale(player.facing * (1 + dip * 0.01), 1 - dip * 0.012);
  if (image?.complete && image.naturalWidth) ctx.drawImage(image, -width / 2, -height, width, height);
  else { ctx.fillStyle = '#ef6a6a'; ctx.beginPath(); ctx.roundRect(-24, -90, 48, 90, 16); ctx.fill(); }
  ctx.restore();
  drawBasket(-BASKET_RIM + dip + bob);
  ctx.restore();
}

/* ---------- Rendering: effects ---------- */
function drawEffects() {
  for (const s of effects.splats) {
    ctx.globalAlpha = Math.max(0, 0.75 * (1 - s.t / 2.5));
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.ellipse(s.x, GROUND_Y + 1, s.w, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const p of effects.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.kind === 'puff' ? p.r * (1 + p.t) : p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of effects.confetti) {
    ctx.globalAlpha = Math.min(1, (4 - c.t) / 0.6);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  for (const f of effects.floaters) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    ctx.font = `800 ${f.size * (1 + Math.max(0, 0.25 - f.t))}px "Baloo 2", sans-serif`;
    const y = f.y - f.t * 70;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.strokeText(f.text, f.x, y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, y);
  }
  ctx.globalAlpha = 1;
}

function drawBanner(time) {
  if (!banner) return;
  const { t } = banner;
  const appear = Math.min(1, t / 0.35);
  const back = 1 + 2.2 * (appear - 1) ** 3 + 1.2 * (appear - 1) ** 2;
  const alpha = t > 1.8 ? Math.max(0, 1 - (t - 1.8) / 0.6) : 1;
  const cx = view.w / 2;
  const cy = 200;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.save();
  ctx.rotate(time * 0.6);
  ctx.fillStyle = 'rgba(255, 240, 170, .35)';
  for (let i = 0; i < 16; i += 1) {
    ctx.rotate(Math.PI / 8);
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(0, 260 * appear); ctx.fill();
  }
  ctx.restore();
  ctx.scale(back * (t < 0.35 ? 1.6 - 0.6 * appear : 1), back * (t < 0.35 ? 1.6 - 0.6 * appear : 1));
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.font = '800 76px "Baloo 2", sans-serif';
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#3d2614';
  const title = i18n.t(banner.title, `LEVEL ${LEVELS[levelIndex].id}`);
  const subtitle = i18n.t(banner.sub, english(banner.sub));
  ctx.strokeText(title, 0, 10);
  const g = ctx.createLinearGradient(0, -40, 0, 20);
  g.addColorStop(0, '#fff3a8');
  g.addColorStop(1, '#ff8a3d');
  ctx.fillStyle = g;
  ctx.fillText(title, 0, 10);
  ctx.font = '800 26px "Baloo 2", sans-serif';
  ctx.lineWidth = 7;
  ctx.strokeText(subtitle, 0, 52);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(subtitle, 0, 52);
  ctx.restore();
}

function render(time) {
  ctx.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, 0, view.offsetY * view.dpr * view.scale);
  const scene = LEVELS[levelIndex].scene;
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * 16 * shake, (Math.random() - 0.5) * 16 * shake);
  if (scene === 'morning') drawMorning(time);
  else if (scene === 'sunset') drawSunset(time);
  else drawNight(time);
  drawItemShadows();
  drawPlayer(time);
  drawItems(time);
  drawEffects();
  ctx.restore();
  drawBanner(time);
  if (flash) {
    ctx.fillStyle = `rgba(${flash.color}, ${flash.t * 0.55})`;
    ctx.fillRect(0, top(), view.w, view.cssH / view.scale);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  clock += dt;
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
  if (mode !== 'paused') updateEffects(dt);
  render(clock);
  requestAnimationFrame(frame);
}

/* ---------- Input ---------- */
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };

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
  input[action] = true;
});

window.addEventListener('keyup', (event) => {
  if (mode === 'question' && (event.code === 'Space' || event.key === 'Enter')) event.preventDefault();
  const action = KEYS[event.code];
  if (action) input[action] = false;
});

const toWorldX = (clientX) => (clientX - canvas.getBoundingClientRect().left) / view.scale;
canvas.addEventListener('pointerdown', (event) => {
  if (mode !== 'playing') return;
  dragging = true;
  canvas.setPointerCapture?.(event.pointerId);
  input.pointerX = toWorldX(event.clientX);
});
canvas.addEventListener('pointermove', (event) => {
  if (mode === 'playing' && (dragging || event.pointerType === 'mouse')) input.pointerX = toWorldX(event.clientX);
});
for (const type of ['pointerup', 'pointercancel']) {
  canvas.addEventListener(type, (event) => {
    dragging = false;
    if (event.pointerType !== 'mouse') input.pointerX = null;
  });
}

window.addEventListener('blur', () => { input.left = input.right = false; pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else lastFrame = performance.now(); });

for (const button of document.querySelectorAll('.touch-button')) {
  const control = button.dataset.control;
  const press = (event) => {
    event.preventDefault();
    if (mode !== 'playing') return;
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('active');
    input[control] = true;
  };
  const release = () => { button.classList.remove('active'); input[control] = false; };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
}

ui.pauseToggle.addEventListener('click', () => (mode === 'paused' ? resume() : pause()));
$('resume-button').addEventListener('click', resume);
$('quit-button').addEventListener('click', () => { if (mode === 'paused') gameOver('quit'); });
$('next-button').addEventListener('click', () => { if (mode === 'level') { void audio.activate(); startLevel(levelIndex + 1); } });
$('start-form').addEventListener('submit', startGame);
$('again-button').addEventListener('click', () => startGame());
$('menu-button').addEventListener('click', () => {
  setMode('menu');
  levelIndex = 0;
  items = [];
  pile = [];
  renderCharacters();
  showScreen(ui.start);
  ui.grid.querySelector('input:checked')?.focus();
});

new ResizeObserver(resize).observe(stage);
ui.name.value = store.get(STORAGE.name) ?? '';
renderCharacters();
renderBoard($('board-start'));
resize();
updateHud();
requestAnimationFrame(frame);
