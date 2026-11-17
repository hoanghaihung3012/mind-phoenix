import {
  BALL_RADIUS, HEIGHT, MAX_SPEED, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_Y, WIDTH,
  advance, ballSpeed, createGame, finishQuestion, launch, movePaddle,
} from './breakout.mjs';
import { QUESTION_TIME, addScore, createQuestionDeck, normalizeName, parseLeaderboard } from '../../shared/core/game-utils.mjs';
import { createGameAudio } from '../../shared/core/audio.mjs';
import { english, initGameLanguage } from '../i18n.mjs';

const i18n = initGameLanguage();
const $ = (id) => document.getElementById(id);
const canvas = $('breakout');
const ctx = canvas.getContext('2d');
const ASSET = '../../assets/mascots/';
const characters = [
  { id: 'phoenix', name: 'Phượng Hoàng', file: 'mind-phoenix-mascot.png' },
  { id: 'lambda', name: 'Lambda', file: 'mindastro-lambda-happy.webp' },
  { id: 'flask', name: 'Flask', file: 'mindchemistry-flask-happy.webp' },
  { id: 'cmd', name: 'Cmd', file: 'minddev-cmd-happy.webp' },
  { id: 'sigma', name: 'Sigma', file: 'mindmath-sigma-happy.webp' },
];
function storage(action, key, value) {
  try {
    if (action === 'get') return localStorage.getItem(`mp-breakout-${key}`);
    localStorage.setItem(`mp-breakout-${key}`, value);
  } catch (error) {
    console.warn('Breakout could not access local storage.', error);
    $('storage-notice').hidden = false;
    i18n.text($('storage-notice'), 'Không thể lưu trên thiết bị này. Bạn vẫn có thể chơi; tên và điểm chỉ giữ trong lượt mở trang này.', 'Device storage is unavailable. You can still play; names and scores will only last for this page session.');
  }
  return null;
}

for (const character of characters) {
  character.image = new Image();
  character.image.src = ASSET + character.file;
  character.image.addEventListener('error', () => {
    console.error(`Breakout could not load mascot: ${character.file}`);
    toast('Không tải được hình mascot. Hãy tải lại trang.', 'Could not load a mascot image. Please reload the page.');
  });
}
let selected = characters.find((c) => c.id === storage('get', 'character')) ?? characters[0];
let board = parseLeaderboard(storage('get', 'leaderboard'));
let mode = 'menu';
let game = createGame('');
let deck = createQuestionDeck();
let question = null;
let pausedFrom = null;
let particles = [];
let floaters = [];
let trail = [];
let impact = 0;
let clock = 0;
let lastFrame = performance.now();
let toastTimer;
const held = new Set();
const touchDirections = new Map();
const colors = ['#d98178', '#dca870', '#dbbf71', '#8ebca0', '#6fa9b7', '#a28bbf'];
let shownSpeed = -1;
let shownLives = null;

const audio = createGameAudio({
  theme: 'sky', button: $('sound-toggle'), i18n,
  enabled: storage('get', 'sound') !== 'off',
  onEnabledChange: (enabled) => storage('set', 'sound', enabled ? 'on' : 'off'),
  onError: (message, error) => { console.error(message, error); toast(message, english(message)); },
});

function toast(vi, en) {
  i18n.text($('toast'), vi, en);
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
}

function renderBoard() {
  const entries = board.map((entry) => {
    const li = document.createElement('li');
    const who = document.createElement('span');
    who.textContent = entry.name;
    const points = document.createElement('strong');
    points.textContent = entry.score.toLocaleString(i18n.locale);
    li.append(who, points);
    return li;
  });
  if (!entries.length) {
    const li = document.createElement('li');
    i18n.text(li, 'Chưa có ai. Hãy là người đầu tiên!');
    entries.push(li);
  }
  $('board').replaceChildren(...entries);
}

$('character-grid').replaceChildren(...characters.map((character) => {
  const label = document.createElement('label');
  label.className = 'character';
  const input = Object.assign(document.createElement('input'), {
    type: 'radio', name: 'character', value: character.id, checked: selected === character,
  });
  i18n.attr(input, 'aria-label', character.name);
  input.addEventListener('change', () => { selected = character; storage('set', 'character', character.id); });
  const image = Object.assign(document.createElement('img'), { src: ASSET + character.file, alt: '', width: 60, height: 60 });
  const name = document.createElement('span');
  i18n.text(name, character.name);
  label.append(input, image, name);
  return label;
}));
$('player-name').value = storage('get', 'name') ?? '';
renderBoard();

function clearInput() {
  held.clear();
  touchDirections.clear();
}

function setMode(next) {
  mode = next;
  clearInput();
  if (next === 'menu' || next === 'over') {
    clearTimeout(toastTimer);
    $('toast').hidden = true;
  }
  for (const id of ['start', 'question', 'pause', 'over']) {
    const screenMode = id === 'start' ? 'menu' : id;
    $(`${id}-screen`).hidden = next !== screenMode;
  }
  $('pause-toggle').disabled = !['playing', 'question', 'pause'].includes(next);
  i18n.attr($('pause-toggle'), 'aria-label', next === 'pause' ? 'Chơi tiếp' : 'Tạm dừng');
  $('pause-toggle').setAttribute('aria-pressed', String(next === 'pause'));
  audio.setMusicPlaying(next === 'playing' || next === 'question');
  lastFrame = performance.now();
  updateHud();
}

function updateHud() {
  const score = game.score.toLocaleString(i18n.locale);
  const wave = String(game.wave).padStart(2, '0');
  if ($('hud-score').textContent !== score) $('hud-score').textContent = score;
  if ($('hud-wave').textContent !== wave) $('hud-wave').textContent = wave;
  const speed = Math.round(ballSpeed(game.elapsed, game.hits));
  if (speed !== shownSpeed) {
    $('hud-speed').replaceChildren(document.createTextNode(`${speed} `), Object.assign(document.createElement('small'), { textContent: `/ ${MAX_SPEED}` }));
    shownSpeed = speed;
  }
  if (game.lives !== shownLives) {
    $('hud-lives').textContent = game.lives === Infinity ? '♥ ∞' : '♥ '.repeat(game.lives).trim() || '—';
    i18n.attr($('hud-lives'), 'aria-label', game.lives === Infinity ? 'Mạng vô hạn' : `Còn ${game.lives} mạng`, game.lives === Infinity ? 'Unlimited lives' : `${game.lives} lives left`);
    shownLives = game.lives;
  }
  $('ready-hint').hidden = mode !== 'playing' || game.status !== 'ready';
  $('launch-button').disabled = mode !== 'playing' || game.status !== 'ready';
}

function newGame() {
  const rawName = $('player-name').value;
  game = createGame(rawName);
  storage('set', 'name', normalizeName(rawName));
  deck = createQuestionDeck();
  question = null;
  particles = [];
  floaters = [];
  trail = [];
  $('toast').hidden = true;
  clearTimeout(toastTimer);
  setMode('playing');
  canvas.focus({ preventScroll: true });
}

function endGame() {
  question = null;
  setMode('over');
  audio.tone(300, .5, { type: 'triangle', to: 110 });
  $('over-avatar').src = ASSET + selected.file;
  i18n.text($('over-reason'), game.lives <= 0 ? 'Hết mạng rồi!' : 'Lượt chơi đã kết thúc');
  $('final-score').textContent = game.score.toLocaleString(i18n.locale);
  i18n.text($('final-stats'), `Bảng ${game.wave} · ${game.broken} gạch · ${game.correct} câu đúng`, `Wave ${game.wave} · ${game.broken} bricks · ${game.correct} correct answers`);
  const result = addScore(board, { name: normalizeName($('player-name').value || i18n.t('Bạn nhỏ', 'Little explorer')), score: game.score, character: selected.id });
  board = result.board;
  storage('set', 'leaderboard', JSON.stringify(board));
  i18n.text($('rank-note'), result.rank ? `Bạn đứng hạng ${result.rank}!` : 'Cố lên! Lần sau sẽ lọt vào top 10.', result.rank ? `You ranked #${result.rank}!` : 'Keep going! Aim for the top 10 next time.');
  renderBoard();
  $('again-button').focus({ preventScroll: true });
}

function openQuestion() {
  question = { ...deck.next(), left: QUESTION_TIME, answered: false };
  i18n.text($('question-topic'), question.topic);
  i18n.text($('question-text'), question.prompt);
  i18n.text($('question-feedback'), '');
  $('continue-button').hidden = true;
  $('answers').replaceChildren(...question.choices.map((choice, index) => {
    const button = Object.assign(document.createElement('button'), { type: 'button', className: 'answer' });
    const key = Object.assign(document.createElement('kbd'), { textContent: index + 1 });
    const label = document.createTextNode('');
    i18n.text(label, choice);
    button.append(key, label);
    button.addEventListener('click', () => answer(index));
    return button;
  }));
  setMode('question');
  updateQuestionTimer();
  audio.tone(784, .2, { type: 'triangle', to: 1047 });
  $('answers').firstElementChild.focus({ preventScroll: true });
}

function updateQuestionTimer() {
  $('question-seconds').textContent = Math.ceil(Math.max(0, question.left));
  $('question-bar').style.transform = `scaleX(${Math.max(0, question.left) / QUESTION_TIME})`;
}

function answer(index) {
  if (mode !== 'question' || !question || question.answered) return;
  question.answered = true;
  question.correct = index === question.correctIndex;
  question.beforeWave = game.wave;
  const change = finishQuestion(game, question.correct, question.left);
  [...$('answers').children].forEach((button, i) => {
    button.disabled = true;
    if (i === question.correctIndex) button.classList.add('correct');
    else if (i === index) button.classList.add('wrong');
  });
  const right = question.choices[question.correctIndex];
  if (question.correct) {
    i18n.text($('question-feedback'), `Chính xác! +${change} điểm`, `Correct! +${change} points`);
    audio.tone(880, .25, { type: 'triangle', to: 1320 });
  } else {
    i18n.text($('question-feedback'), `${index < 0 ? 'Hết giờ!' : 'Chưa đúng!'} ${change} điểm. Đáp án đúng: ${right}`, `${index < 0 ? "Time's up!" : 'Not quite!'} ${change} points. Correct answer: ${english(right)}`);
    audio.tone(280, .25, { type: 'triangle', to: 140 });
  }
  $('continue-button').hidden = false;
  $('continue-button').focus({ preventScroll: true });
  updateHud();
}

function closeQuestion() {
  if (!question?.answered) return;
  const newWave = game.wave > question.beforeWave;
  question = null;
  trail = [];
  setMode('playing');
  if (newWave) waveToast();
  canvas.focus({ preventScroll: true });
}

function togglePause() {
  if (mode === 'pause') {
    setMode(pausedFrom);
    if (mode === 'question') {
      (question.answered ? $('continue-button') : $('answers').firstElementChild).focus({ preventScroll: true });
    } else canvas.focus({ preventScroll: true });
  } else if (mode === 'playing' || mode === 'question') {
    pausedFrom = mode;
    setMode('pause');
    $('resume-button').focus({ preventScroll: true });
  }
}

function waveToast() {
  toast(`Tuyệt vời! Bảng ${game.wave} — phóng bóng để chơi tiếp!`, `Great job! Wave ${game.wave} — launch to continue!`);
}

function burst(x, y, color, count = 14) {
  for (let i = 0; i < count; i += 1) particles.push({
    x, y, vx: (Math.random() - .5) * 230, vy: -40 - Math.random() * 170,
    life: .5 + Math.random() * .4, color, size: 3 + Math.random() * 5,
  });
}

function update(dt) {
  if (mode === 'question' && !question.answered) {
    question.left = Math.max(0, question.left - dt);
    updateQuestionTimer();
    if (!question.left) answer(-1);
  }
  if (mode !== 'playing') return;
  const direction = Number(held.has('arrowright') || held.has('d') || [...touchDirections.values()].includes(1))
    - Number(held.has('arrowleft') || held.has('a') || [...touchDirections.values()].includes(-1));
  const events = advance(game, dt, direction);
  for (const event of events) {
    if (event.type === 'brick') {
      const { brick, points } = event;
      const color = brick.kind === 'bonus' ? '#f5cb70' : brick.kind === 'question' ? '#c5a6ed' : colors[brick.row];
      burst(brick.x + brick.w / 2, brick.y + brick.h / 2, color);
      floaters.push({ x: brick.x + brick.w / 2, y: brick.y, text: `+${points}`, life: 1, color });
      impact = .12;
      audio.tone(brick.kind === 'bonus' ? 1047 : 540 + brick.row * 70, .1, { type: 'triangle', volume: .06 });
    } else if (event.type === 'paddle' || event.type === 'bounce') {
      audio.tone(event.type === 'paddle' ? 380 : 240, .06, { type: 'sine', volume: .04 });
      if (event.type === 'paddle') burst(event.x, event.y, '#a7e3cb', 6);
    } else if (event.type === 'miss') {
      trail = [];
      impact = .25;
      audio.tone(500, .4, { type: 'triangle', to: 100 });
      if (game.status !== 'over') toast(game.lives === Infinity ? 'Mạng vô hạn — phóng bóng tiếp nào!' : `Rơi bóng! Còn ${game.lives} mạng.`, game.lives === Infinity ? 'Unlimited lives — launch again!' : `Ball lost! ${game.lives} lives left.`);
    } else if (event.type === 'wave') { trail = []; waveToast(); }
  }
  if (game.status === 'question') openQuestion();
  else if (game.status === 'over') endGame();
  if (game.status === 'playing') {
    trail.push({ x: game.ball.x, y: game.ball.y });
    if (trail.length > 10) trail.shift();
  }
  for (const p of particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; }
  particles = particles.filter((p) => p.life > 0);
  for (const f of floaters) { f.life -= dt; f.y -= dt * 30; }
  floaters = floaters.filter((f) => f.life > 0);
  impact = Math.max(0, impact - dt);
  updateHud();
}

function rounded(x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#142d3a'); sky.addColorStop(1, '#20454a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#ffffff10';
  for (let x = 24; x < WIDTH; x += 32) for (let y = 24; y < HEIGHT; y += 32) ctx.fillRect(x, y, 2, 2);
  ctx.strokeStyle = '#83b4ac22'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, 590); ctx.lineTo(WIDTH - 24, 590); ctx.stroke();
  ctx.fillStyle = '#8cbbb1'; ctx.font = '800 10px Nunito, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('M I N D   P H O E N I X   /   B R E A K O U T', WIDTH / 2, 32);
  ctx.save();
  if (impact > 0) ctx.translate(Math.sin(clock * 80) * impact * 9, Math.cos(clock * 90) * impact * 6);
  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    const color = brick.kind === 'bonus' ? '#e5b657' : brick.kind === 'question' ? '#a58acb' : colors[brick.row];
    rounded(brick.x, brick.y + 4, brick.w, brick.h, 6, '#051a2580');
    rounded(brick.x, brick.y, brick.w, brick.h, 6, color);
    rounded(brick.x + 5, brick.y + 3, brick.w - 10, 3, 1, '#ffffff40');
    ctx.fillStyle = '#fff9e8';
    ctx.font = '900 19px Nunito, sans-serif'; ctx.textAlign = 'center';
    if (brick.kind !== 'normal') ctx.fillText(brick.kind === 'bonus' ? '★' : '?', brick.x + brick.w / 2, brick.y + 21);
  }
  const px = game.paddleX;
  const bob = game.status === 'ready' ? Math.sin(clock * 3) * 2 : 0;
  ctx.fillStyle = '#051f2850';
  ctx.beginPath(); ctx.ellipse(px, 588, 47, 7, 0, 0, Math.PI * 2); ctx.fill();
  if (selected.image.complete && selected.image.naturalWidth) ctx.drawImage(selected.image, px - 42, PADDLE_Y + 2 + bob, 84, 66);
  // Arms wrap over the paddle so the mascot visibly holds it.
  rounded(px - 41, PADDLE_Y - 1 + bob, 13, 30, 7, '#ecb970');
  rounded(px + 28, PADDLE_Y - 1 + bob, 13, 30, 7, '#ecb970');
  rounded(px - PADDLE_WIDTH / 2 - 2, PADDLE_Y - 2, PADDLE_WIDTH + 4, PADDLE_HEIGHT + 5, 10, '#0f2630');
  rounded(px - PADDLE_WIDTH / 2, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT, 8, '#72bda5');
  rounded(px - PADDLE_WIDTH / 2 + 8, PADDLE_Y + 3, PADDLE_WIDTH - 16, 4, 2, '#c6ead1');
  rounded(px - 40, PADDLE_Y + 7, 15, 11, 5, '#f4cd8a');
  rounded(px + 25, PADDLE_Y + 7, 15, 11, 5, '#f4cd8a');
  for (let i = 0; i < trail.length; i += 1) {
    ctx.fillStyle = `rgba(255,224,153,${i / trail.length * .22})`;
    ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, BALL_RADIUS * i / trail.length, 0, Math.PI * 2); ctx.fill();
  }
  if (game.status !== 'over') {
    ctx.shadowColor = '#ffe1a0'; ctx.shadowBlur = 17;
    ctx.fillStyle = '#fff6db';
    ctx.beginPath(); ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(game.ball.x - 2, game.ball.y - 3, 3, 0, Math.PI * 2); ctx.fill();
  }
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    rounded(p.x, p.y, p.size, p.size, 2, p.color);
  }
  for (const f of floaters) {
    ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = f.color;
    ctx.font = '900 20px Nunito, sans-serif'; ctx.fillText(f.text, f.x, f.y);
  }
  ctx.restore();
}

function pointPaddle(event) {
  const rect = canvas.getBoundingClientRect();
  movePaddle(game, (event.clientX - rect.left) / rect.width * WIDTH);
}
canvas.addEventListener('pointermove', (event) => {
  if (mode === 'playing' && (event.pointerType === 'mouse' || event.buttons)) pointPaddle(event);
});
canvas.addEventListener('pointerdown', (event) => {
  if (mode !== 'playing') return;
  event.preventDefault();
  canvas.focus({ preventScroll: true });
  canvas.setPointerCapture(event.pointerId);
  pointPaddle(event);
  launch(game);
});
$('launch-button').addEventListener('click', () => { if (mode === 'playing') launch(game); });
for (const button of document.querySelectorAll('[data-direction]')) {
  button.addEventListener('pointerdown', (event) => {
    if (mode !== 'playing') return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    touchDirections.set(event.pointerId, Number(button.dataset.direction));
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, (event) => touchDirections.delete(event.pointerId));
}
document.addEventListener('keydown', (event) => {
  if (event.target.closest('input') || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if ((key === 'p' || key === 'escape') && !event.repeat) { event.preventDefault(); togglePause(); return; }
  if (mode === 'question' && /^[1-4]$/.test(key) && !event.repeat) { event.preventDefault(); answer(Number(key) - 1); return; }
  if (mode !== 'playing') return;
  if (['arrowleft', 'arrowright', 'a', 'd'].includes(key)) { event.preventDefault(); held.add(key); }
  if (event.code === 'Space' && !event.repeat && !event.target.closest('button, a')) { event.preventDefault(); launch(game); }
});
document.addEventListener('keyup', (event) => held.delete(event.key.toLowerCase()));
function autoPause() { clearInput(); if (mode === 'playing' || mode === 'question') togglePause(); }
window.addEventListener('blur', autoPause);
document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
$('start-form').addEventListener('submit', (event) => { event.preventDefault(); newGame(); });
$('again-button').addEventListener('click', newGame);
$('menu-button').addEventListener('click', () => { setMode('menu'); $('player-name').focus({ preventScroll: true }); });
$('pause-toggle').addEventListener('click', togglePause);
$('resume-button').addEventListener('click', togglePause);
$('quit-button').addEventListener('click', endGame);
$('continue-button').addEventListener('click', closeQuestion);
i18n.onChange(() => { updateHud(); renderBoard(); });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
function frame(now) {
  const dt = Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  if (mode === 'playing') clock += dt;
  update(dt);
  if (reduceMotion.matches) { impact = 0; particles = []; trail = []; }
  draw();
  requestAnimationFrame(frame);
}
setMode('menu');
requestAnimationFrame(frame);
