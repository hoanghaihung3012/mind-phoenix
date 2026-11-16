import { DIFFICULTIES, PASS_COUNT, QUESTIONS_PER_ROUND, ROUNDS, advanceRound, createQuestion, createRun, recordAnswer, retryRound } from './challenge.mjs';
import { createGameAudio } from '../audio.mjs';

const $ = (id) => document.getElementById(id);
const screens = ['menu', 'play', 'round-end', 'complete'];
let run;
let question;
let selectedStars = [];
let mode = 'menu';
let remaining = 0;
let deadline = 0;
let frame = null;
let lastPrompt = '';

const audio = createGameAudio({
  theme: 'sky', button: $('sound-toggle'),
  onError: (message, error) => {
    console.error(message, error);
    $('audio-error').textContent = message;
    $('audio-error').hidden = false;
  },
});

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function show(screen) {
  for (const id of screens) $(id).hidden = id !== screen;
}

function stopClock() {
  cancelAnimationFrame(frame);
  frame = null;
}

function drawClock() {
  $('seconds').textContent = Math.ceil(remaining);
  $('time-fill').style.transform = `scaleX(${remaining / DIFFICULTIES[run.difficulty].seconds})`;
  $('seconds').closest('.clock').classList.toggle('urgent', remaining <= 5);
}

function tick() {
  if (mode !== 'answering') return;
  remaining = Math.max(0, (deadline - performance.now()) / 1000);
  drawClock();
  if (remaining === 0) finishAnswer(false, true);
  else frame = requestAnimationFrame(tick);
}

function updateStats() {
  $('question-count').textContent = `Câu ${Math.min(run.answered + 1, QUESTIONS_PER_ROUND)}/${QUESTIONS_PER_ROUND}`;
  $('correct-count').textContent = `${run.correct}/${QUESTIONS_PER_ROUND}`;
  $('score').textContent = (run.score + run.roundScore).toLocaleString('vi-VN');
}

function start() {
  const difficulty = new FormData($('start-form')).get('difficulty');
  run = createRun(difficulty);
  void audio.activate();
  startRound();
}

function startRound() {
  show('play');
  const round = ROUNDS[run.round];
  $('route').replaceChildren(...ROUNDS.map((item, index) => {
    const node = element('span', index < run.round ? 'done' : index === run.round ? 'active' : '', `${index < run.round ? '✓' : index + 1} · ${item.name}`);
    if (index === run.round) node.setAttribute('aria-current', 'step');
    return node;
  }));
  $('round-label').textContent = `VÒNG ${run.round + 1} / ${ROUNDS.length} · CHẾ ĐỘ ${DIFFICULTIES[run.difficulty].name.toLocaleUpperCase('vi-VN')}`;
  $('round-title').textContent = round.name;
  $('instruction').textContent = round.hint;
  audio.setTheme(round.theme);
  nextQuestion();
}

function nextQuestion() {
  stopClock();
  const round = ROUNDS[run.round];
  for (let attempt = 0; attempt < 12; attempt++) {
    question = createQuestion(round.id, run.difficulty);
    if (question.prompt !== lastPrompt || round.id === 'stars') break;
  }
  lastPrompt = question.prompt;
  selectedStars = [];
  $('prompt').textContent = question.prompt;
  $('feedback').textContent = '';
  $('feedback').className = '';
  $('next-question').hidden = true;
  $('pause').disabled = false;
  $('arena').className = `arena ${round.id}`;
  $('arena').replaceChildren();
  renderGame(round.id);
  updateStats();
  remaining = DIFFICULTIES[run.difficulty].seconds;
  deadline = performance.now() + remaining * 1000;
  mode = 'answering';
  audio.setMusicPlaying(true);
  drawClock();
  tick();
  $('round-title').focus({ preventScroll: true });
}

function answerButton(value, index, className, handler) {
  const button = element('button', className, String(value));
  button.type = 'button';
  button.setAttribute('aria-label', `${value}, phím ${index + 1}`);
  button.dataset.choice = index;
  button.addEventListener('click', () => handler(button));
  return button;
}

function renderGame(id) {
  const arena = $('arena');
  if (id === 'bubbles') {
    question.choices.forEach((value, index) => {
      const button = answerButton(value, index, 'bubble', (target) => {
        if (mode !== 'answering') return;
        const stage = arena.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - stage.left - stage.width / 2;
        const dy = rect.top + rect.height / 2 - stage.bottom + 35;
        const shot = element('span', 'shot');
        Object.assign(shot.style, { left: '50%', bottom: '35px', width: `${Math.hypot(dx, dy)}px`, transform: `rotate(${Math.atan2(dy, dx)}rad)` });
        arena.append(shot);
        target.classList.add('selected');
        finishAnswer(value === question.answer);
      });
      button.append(element('small', 'choice-key', index + 1));
      arena.append(button);
    });
    const cannon = element('div', 'cannon');
    cannon.setAttribute('aria-hidden', 'true');
    arena.append(cannon);
    $('keyboard-note').textContent = 'Chạm / nhấp bong bóng hoặc bấm phím 1–4 để bắn · P để tạm dừng';
  } else if (id === 'bridge') {
    const scene = element('div', 'bridge-scene');
    scene.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) scene.append(element('span', `plank${i < run.correct ? ' built' : ''}`, i < run.correct ? '✓' : '?'));
    const mascot = element('img', 'bridge-mascot');
    mascot.src = '../../assets/mascots/mindmath-sigma-happy.webp';
    mascot.alt = '';
    scene.style.setProperty('--crossed', `${run.correct * 16}%`);
    scene.append(mascot);
    const form = element('form', 'bridge-form');
    const label = element('label', '', 'Tấm ván còn thiếu mang số mấy?');
    label.htmlFor = 'bridge-answer';
    const input = element('input');
    Object.assign(input, { id: 'bridge-answer', type: 'text', inputMode: 'numeric', pattern: '[0-9]{1,3}', maxLength: 3, required: true, autocomplete: 'off' });
    const button = element('button', 'primary', 'Xây cầu →');
    button.type = 'submit';
    form.append(label, input, button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (mode !== 'answering') return;
      const correct = Number(input.value) === question.answer;
      if (correct && performance.now() < deadline) {
        scene.children[run.correct].classList.add('built');
        scene.children[run.correct].textContent = input.value;
        scene.style.setProperty('--crossed', `${(run.correct + 1) * 16}%`);
      }
      finishAnswer(correct);
    });
    arena.append(scene, form);
    $('keyboard-note').textContent = 'Nhập đáp án rồi bấm Enter hoặc nút Xây cầu · P để tạm dừng';
  } else if (id === 'stars') {
    question.choices.forEach((value, index) => {
      arena.append(answerButton(value, index, 'star', (button) => {
        if (mode !== 'answering' || button.disabled) return;
        if (performance.now() >= deadline) { finishAnswer(false, true); return; }
        if (value !== question.answer[selectedStars.length]) { finishAnswer(false); return; }
        selectedStars.push(value);
        button.disabled = true;
        button.classList.add('picked');
        $('star-order').textContent = selectedStars.join(' < ');
        if (selectedStars.length === question.answer.length) finishAnswer(true);
        else audio.tone(550 + selectedStars.length * 120, .12);
      }));
    });
    const order = element('p', 'star-order', 'Bắt đầu từ số bé nhất…');
    order.id = 'star-order';
    order.setAttribute('aria-live', 'polite');
    arena.append(order);
    $('keyboard-note').textContent = 'Chọn đủ 4 sao theo thứ tự tăng dần để được 1 câu đúng · Phím 1–4 theo vị trí từ trái sang phải, trên xuống dưới';
  } else {
    [true, false].forEach((value, index) => {
      const button = answerButton(value ? '✓ Đúng' : '✕ Sai', index, 'verdict', () => finishAnswer(value === question.answer));
      button.append(element('small', '', `Phím ${index + 1}`));
      arena.append(button);
    });
    $('keyboard-note').textContent = 'Phím 1: Đúng · Phím 2: Sai · Hoặc chạm / nhấp đáp án · P để tạm dừng';
  }
}

function finishAnswer(correct, timedOut = false) {
  if (mode !== 'answering') return;
  remaining = Math.max(0, (deadline - performance.now()) / 1000);
  timedOut ||= remaining === 0;
  correct &&= !timedOut;
  stopClock();
  mode = 'feedback';
  run = recordAnswer(run, correct, remaining);
  for (const control of $('arena').querySelectorAll('button, input')) control.disabled = true;
  $('pause').disabled = true;
  drawClock();
  updateStats();
  $('question-count').textContent = `Đã trả lời ${run.answered}/${QUESTIONS_PER_ROUND}`;
  $('feedback').className = correct ? 'good' : 'bad';
  $('feedback').textContent = `${correct ? 'Chính xác! ' : timedOut ? 'Hết giờ! ' : 'Chưa đúng rồi. '}${question.solution}`;
  if (correct) audio.chime([659, 784, 1047], .07);
  else audio.tone(220, .2, { to: 110, volume: .06 });
  $('next-question').textContent = run.status === 'playing' ? 'Câu tiếp theo →' : 'Xem kết quả →';
  $('next-question').hidden = false;
  $('next-question').focus({ preventScroll: true });
}

function stat(value, label) {
  const node = element('div');
  node.append(element('strong', '', value), element('span', '', label));
  return node;
}

function showRoundResult() {
  mode = 'result';
  audio.setMusicPlaying(false);
  const passed = run.status === 'passed';
  show('round-end');
  $('result-icon').textContent = passed ? '✦' : '↻';
  $('result-label').textContent = `VÒNG ${run.round + 1} · ${ROUNDS[run.round].name}`;
  $('result-title').textContent = passed ? 'Vượt thử thách rồi!' : 'Thử lại, bạn làm được!';
  $('result-copy').textContent = passed
    ? run.round === ROUNDS.length - 1 ? 'Cả bốn thử thách đã hoàn thành. Cùng xem thành tích nào!' : `Tiếp theo: ${ROUNDS[run.round + 1].name}. Một cách chơi hoàn toàn mới đang chờ bạn!`
    : `Cần đúng ${PASS_COUNT}/${QUESTIONS_PER_ROUND} câu để qua vòng. Chơi lại vòng này với câu hỏi mới; điểm các vòng đã qua vẫn được giữ.`;
  $('result-stats').replaceChildren(stat(`${run.correct}/${QUESTIONS_PER_ROUND}`, 'Câu đúng'), stat(run.roundScore.toLocaleString('vi-VN'), passed ? 'Điểm vòng này' : 'Điểm chưa được cộng'), stat(run.score.toLocaleString('vi-VN'), 'Điểm đã tích lũy'));
  $('continue').textContent = passed ? run.round === ROUNDS.length - 1 ? 'Nhận thành tích ✦' : 'Vòng tiếp theo →' : 'Thử lại vòng này ↻';
  $('result-title').focus({ preventScroll: true });
}

function complete() {
  mode = 'complete';
  show('complete');
  const totalCorrect = run.results.reduce((sum, result) => sum + result.correct, 0);
  $('final-copy').textContent = `Bạn đã chinh phục 4 mini game ở chế độ ${DIFFICULTIES[run.difficulty].name.toLocaleLowerCase('vi-VN')}. Sigma tự hào về bạn!`;
  $('final-stats').replaceChildren(stat(run.score.toLocaleString('vi-VN'), 'Tổng điểm'), stat(`${totalCorrect}/${ROUNDS.length * QUESTIONS_PER_ROUND}`, 'Câu đúng các vòng đã qua'));
  $('recap').replaceChildren(...run.results.map((result, index) => {
    const item = element('li');
    item.append(element('span', '', `${index + 1}. ${ROUNDS[index].name}`), element('strong', '', `${result.correct}/5 · ${result.score} điểm`));
    return item;
  }));
  audio.chime([523, 659, 784, 1047, 1319], .12);
  $('complete-title').focus({ preventScroll: true });
}

function pause() {
  if (mode !== 'answering') return;
  remaining = Math.max(0, (deadline - performance.now()) / 1000);
  if (remaining === 0) { finishAnswer(false, true); return; }
  stopClock();
  mode = 'paused';
  audio.setMusicPlaying(false);
  $('pause-dialog').showModal();
  $('resume').focus();
}

function resume() {
  if (mode !== 'paused' || document.hidden) return;
  $('pause-dialog').close();
  mode = 'answering';
  deadline = performance.now() + remaining * 1000;
  void audio.activate();
  audio.setMusicPlaying(true);
  tick();
}

$('round-list').replaceChildren(...ROUNDS.map((round, index) => {
  const item = element('li');
  const copy = element('div');
  copy.append(element('h3', '', `${index + 1}. ${round.name}`), element('p', '', round.hint));
  item.append(element('span', 'round-icon', round.icon), copy);
  return item;
}));
$('start-form').addEventListener('submit', (event) => { event.preventDefault(); start(); });
$('next-question').addEventListener('click', () => {
  if (mode !== 'feedback') return;
  if (run.status === 'playing') nextQuestion();
  else showRoundResult();
});
$('continue').addEventListener('click', () => {
  if (mode !== 'result') return;
  run = run.status === 'passed' ? advanceRound(run) : retryRound(run);
  if (run.status === 'complete') complete();
  else startRound();
});
$('again').addEventListener('click', start);
$('pause').addEventListener('click', pause);
$('resume').addEventListener('click', resume);
$('pause-dialog').addEventListener('cancel', (event) => { event.preventDefault(); resume(); });
for (const button of document.querySelectorAll('[data-menu]')) button.addEventListener('click', () => {
  stopClock();
  mode = 'menu';
  $('pause-dialog').close();
  audio.setMusicPlaying(false);
  show('menu');
  $('start-form').querySelector('button').focus();
});
document.addEventListener('visibilitychange', () => {
  audio.setVisible(!document.hidden);
  if (document.hidden) pause();
});
document.addEventListener('keydown', (event) => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || $('play').hidden) return;
  if (event.key.toLowerCase() === 'p' || event.key === 'Escape') {
    if (mode === 'answering') { event.preventDefault(); pause(); }
    else if (mode === 'paused') { event.preventDefault(); resume(); }
    return;
  }
  if (mode !== 'answering' || event.target instanceof HTMLInputElement) return;
  if (/^[1-4]$/.test(event.key)) {
    event.preventDefault();
    $('arena').querySelector(`[data-choice="${Number(event.key) - 1}"]`)?.click();
  }
});
