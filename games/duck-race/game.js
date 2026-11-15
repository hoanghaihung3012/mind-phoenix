import { MAX_NAME_LENGTH, MAX_PARTICIPANTS, createRace, parseNames, progressAt, readNamesFile, remainingNames, selectRacers, shuffle, validateSetup } from './race.mjs';
import { createGameAudio } from '../audio.mjs';

const get = (id) => document.getElementById(id);
const namesInput = get('participants');
const countInput = get('winner-count');
const panel = get('race-panel');
const canvas = get('race-canvas');
const context = canvas.getContext('2d');
const background = document.createElement('canvas');
const backgroundContext = background.getContext('2d');
const resultsDialog = get('results-dialog');
const fileInput = get('import-file');
const actionButtons = [get('start-race'), get('track-start')];
const resetButtons = [get('reset-race'), get('track-reset')];
const colors = ['#ffd575', '#ef97a9', '#9acbea', '#b9a0dc', '#95d2b5', '#f6b68a', '#f4e79c', '#a8c8d6'];
const storageKey = 'mp-duck-race-settings-v1';
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let phase = 'idle';
let racers = [];
let preview = [];
let selected = [];
let raceSettings = null;
let lastResult = null;
let elapsed = 0;
let startedAt = 0;
let countdownEndsAt = 0;
let countdownDigit = 0;
let finishedAt = 0;
let lastHudUpdate = 0;
let width = 0;
let height = 0;
let trackBottom = 0;
let importing = false;
let storageAvailable = true;
let nextQuackAt = 0;
const audio = createGameAudio({ theme: 'duck', button: get('sound-toggle'), onError: reportError });

function readSetup() {
  return {
    names: parseNames(namesInput.value),
    duration: Number(document.querySelector('input[name="duration"]:checked')?.value),
    mode: document.querySelector('input[name="pick-mode"]:checked')?.value,
    count: Number(countInput.value),
    remove: get('remove-picked').checked
  };
}

function showNotice(message) {
  get('game-notice').textContent = message;
  get('game-notice').hidden = false;
}

function setExpanded(expanded) {
  panel.classList.toggle('is-expanded', expanded);
  document.body.classList.toggle('race-expanded', expanded);
  document.querySelector('.sidebar').inert = expanded;
  const button = get('expand-toggle');
  const label = expanded ? 'Thu nhỏ đường đua' : 'Phóng to đường đua';
  button.setAttribute('aria-pressed', String(expanded));
  button.setAttribute('aria-label', label);
  button.title = label;
  button.focus();
}

function reportError(message, error) {
  console.error(message, error);
  showNotice(message);
}

function persistSetup() {
  if (!storageAvailable) return;
  const settings = readSetup();
  try {
    localStorage.setItem(storageKey, JSON.stringify({ text: namesInput.value, duration: settings.duration, mode: settings.mode, count: countInput.value, remove: settings.remove }));
  } catch (error) {
    storageAvailable = false;
    reportError('Không thể lưu cài đặt trên trình duyệt này. Bạn vẫn có thể chơi, nhưng danh sách sẽ không được giữ khi tải lại.', error);
  }
}

function restoreSetup() {
  let saved;
  try {
    saved = localStorage.getItem(storageKey);
  } catch (error) {
    storageAvailable = false;
    reportError('Không thể đọc cài đặt đã lưu. Đang dùng danh sách mẫu; cài đặt sẽ không được lưu trên trình duyệt này.', error);
    return;
  }
  if (saved === null) return;
  try {
    const value = JSON.parse(saved);
    if (!value || typeof value.text !== 'string' || ![15, 30, 60].includes(value.duration) ||
        !['first', 'last'].includes(value.mode) || !(typeof value.count === 'string' || Number.isFinite(value.count)) ||
        typeof value.remove !== 'boolean') {
      throw new TypeError('Cài đặt đua vịt đã lưu không hợp lệ.');
    }
    namesInput.value = value.text;
    countInput.value = value.count;
    document.querySelector(`input[name="duration"][value="${value.duration}"]`).checked = true;
    document.querySelector(`input[name="pick-mode"][value="${value.mode}"]`).checked = true;
    get('remove-picked').checked = value.remove;
  } catch (error) {
    reportError('Cài đặt đã lưu không hợp lệ. Đang dùng danh sách mẫu; chỉnh sửa danh sách để lưu lại.', error);
  }
}

function isActive() {
  return ['countdown', 'running', 'paused'].includes(phase);
}

function updateControls() {
  const settings = readSetup();
  const error = validateSetup(settings.names, settings);
  const locked = isActive() || importing;
  const invalidNames = settings.names.length > MAX_PARTICIPANTS || settings.names.some((name) => [...name].length > MAX_NAME_LENGTH);
  get('participants-fieldset').disabled = locked;
  get('settings-fieldset').disabled = locked;
  get('participant-count').textContent = `${settings.names.length} / ${MAX_PARTICIPANTS}`;
  get('participant-count').classList.toggle('invalid', invalidNames);
  namesInput.setAttribute('aria-invalid', String(invalidNames));
  countInput.max = Math.max(1, settings.names.length);
  countInput.setAttribute('aria-invalid', String(!Number.isInteger(settings.count) || settings.count < 1 || settings.count > settings.names.length));
  get('setup-error').textContent = error;
  get('setup-error').hidden = !error;
  get('shuffle-names').disabled = locked || invalidNames || settings.names.length < 2;
  get('clear-names').disabled = locked || !namesInput.value.trim();
  get('fewer-winners').disabled = locked || !Number.isInteger(settings.count) || settings.count <= 1;
  get('more-winners').disabled = locked || !Number.isInteger(settings.count) || settings.count >= settings.names.length;
  const label = phase === 'running' ? 'Tạm dừng' : phase === 'paused' ? 'Tiếp tục' :
    phase === 'countdown' ? 'Chuẩn bị…' : phase === 'finished' && raceSettings?.remove ? 'Đua lượt tiếp' :
    phase === 'finished' ? 'Đua lại' : 'Bắt đầu đua';
  actionButtons.forEach((button) => {
    button.querySelector('span').textContent = importing ? 'Đang đọc file…' : label;
    button.querySelector('use').setAttribute('href', phase === 'running' ? '#icon-pause' : '#icon-play');
    button.disabled = !context || !backgroundContext || importing || phase === 'countdown' || (!isActive() && Boolean(error));
  });
  resetButtons.forEach((button) => { button.disabled = importing || phase === 'idle'; });
  get('status-dot').className = `status-dot ${phase}`;
  get('race-again').disabled = Boolean(error) || importing;
}

function resetRace({ save = false } = {}) {
  phase = 'idle';
  audio.setMusicPlaying(false);
  elapsed = 0;
  racers = [];
  selected = [];
  raceSettings = null;
  get('countdown').hidden = true;
  if (resultsDialog.open) resultsDialog.close();
  const settings = readSetup();
  const validNames = settings.names.length <= MAX_PARTICIPANTS && settings.names.every((name) => [...name].length <= MAX_NAME_LENGTH);
  preview = validNames ? settings.names.map((name, id) => ({ name, id })) : [];
  get('leader-caption').textContent = 'Cùng cổ vũ nào';
  get('leader-name').textContent = settings.mode === 'last' ? 'Ai sẽ về đích cuối cùng?' : 'Ai sẽ về đích đầu tiên?';
  get('race-status').textContent = !settings.names.length ? 'Thêm tên để những chú vịt vào đường đua.' :
    !validNames ? 'Chỉnh danh sách để chuẩn bị cuộc đua.' : `${settings.names.length} chú vịt đã sẵn sàng xuất phát!`;
  get('race-timer').textContent = '0.00';
  get('timer-total').textContent = `/ ${settings.duration} giây`;
  updateControls();
  if (save) persistSetup();
}

function beginRace() {
  const settings = readSetup();
  const error = validateSetup(settings.names, settings);
  if (error || importing) {
    updateControls();
    return;
  }
  try {
    racers = createRace(settings.names, settings.duration);
  } catch (error) {
    reportError('Không thể tạo cuộc đua ngẫu nhiên. Hãy dùng trình duyệt có hỗ trợ Web Crypto.', error);
    return;
  }
  raceSettings = settings;
  selected = [];
  elapsed = 0;
  phase = 'countdown';
  void audio.activate();
  audio.setMusicPlaying(true);
  nextQuackAt = 2500 + Math.random() * 3500;
  countdownDigit = 0;
  countdownEndsAt = performance.now() + 3000;
  get('game-notice').hidden = true;
  get('countdown').hidden = false;
  get('countdown-number').textContent = '3';
  get('race-status').textContent = 'Vào vị trí! Cuộc đua sắp bắt đầu.';
  get('leader-caption').textContent = 'Sẵn sàng xuất phát';
  get('leader-name').textContent = `${racers.length} chú vịt cùng tranh tài`;
  get('race-timer').textContent = '0.00';
  get('timer-total').textContent = `/ ${settings.duration} giây`;
  updateControls();
  persistSetup();
  if (matchMedia('(max-width: 840px)').matches) {
    panel.scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth', block: 'start' });
  }
}

function pauseRace() {
  if (phase !== 'running') return;
  elapsed = Math.min(raceSettings.duration * 1000, performance.now() - startedAt);
  if (elapsed >= raceSettings.duration * 1000) {
    finishRace(performance.now());
    return;
  }
  phase = 'paused';
  audio.setMusicPlaying(false);
  audio.tone(330, .1, { volume: .06 });
  get('race-timer').textContent = (elapsed / 1000).toFixed(2);
  get('race-status').textContent = 'Cuộc đua đang tạm dừng.';
  updateControls();
}

function actOnRace() {
  if (phase === 'running') pauseRace();
  else if (phase === 'paused') {
    startedAt = performance.now() - elapsed;
    phase = 'running';
    void audio.activate();
    audio.setMusicPlaying(true);
    audio.tone(660, .1, { volume: .06 });
    get('game-notice').hidden = true;
    get('race-status').textContent = `${racers.length} chú vịt đang tăng tốc. Cùng cổ vũ nào!`;
    updateControls();
  } else if (phase !== 'countdown') beginRace();
}

function finishRace(now) {
  phase = 'finished';
  audio.setMusicPlaying(false);
  elapsed = raceSettings.duration * 1000;
  finishedAt = now;
  selected = selectRacers(racers, raceSettings.mode, raceSettings.count);
  const remaining = raceSettings.remove ? remainingNames(raceSettings.names, selected) : raceSettings.names;
  if (raceSettings.remove) {
    namesInput.value = remaining.join('\n');
    persistSetup();
  }
  lastResult = { racers, selected, settings: raceSettings, remaining };
  get('race-timer').textContent = raceSettings.duration.toFixed(2);
  get('race-status').textContent = `Đã về đích! Đã chọn ${selected.length} người ${raceSettings.mode === 'first' ? 'về đầu' : 'về cuối'}.`;
  get('leader-caption').textContent = 'Về đích đầu tiên';
  get('leader-name').textContent = racers.find((racer) => racer.rank === 1).name;
  updateControls();
  renderResults();
  resultsDialog.showModal();
  audio.chime([660, 830, 990], .16);
}

function renderResults() {
  get('results-title').textContent = raceSettings.mode === 'first' ? 'Chúc mừng!' : 'Đã tìm thấy!';
  get('results-subtitle').textContent = `${selected.length} người ${raceSettings.mode === 'first' ? 'về đầu' : 'về cuối'} trong cuộc đua ${racers.length} chú vịt`;
  get('selected-list').replaceChildren();
  selected.forEach((racer, index) => {
    const item = document.createElement('li');
    item.style.setProperty('--duck-color', colors[racer.id % colors.length]);
    item.innerHTML = '<svg class="winner-duck" aria-hidden="true"><use href="#icon-duck"/></svg><div class="winner-info"><strong></strong><span></span></div><span class="winner-index"></span>';
    item.querySelector('strong').textContent = racer.name;
    item.querySelector('.winner-info span').textContent = `Hạng ${racer.rank} / ${racers.length} · ${(racer.finishAt / 1000).toFixed(2)} giây`;
    item.querySelector('.winner-index').textContent = index + 1;
    get('selected-list').append(item);
  });
  const pickedIds = new Set(selected.map((racer) => racer.id));
  get('ranking-list').replaceChildren();
  [...racers].sort((a, b) => a.rank - b.rank).forEach((racer) => {
    const item = document.createElement('li');
    item.classList.toggle('picked', pickedIds.has(racer.id));
    [String(racer.rank).padStart(2, '0'), racer.name, `${(racer.finishAt / 1000).toFixed(2)} s`].forEach((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      item.append(span);
    });
    get('ranking-list').append(item);
  });
  get('removal-note').textContent = raceSettings.remove ?
    `Đã loại ${selected.length} người được chọn. Còn ${lastResult.remaining.length} tên trong danh sách.` :
    'Danh sách được giữ nguyên cho lượt đua tiếp theo.';
  if (get('race-again').disabled) get('removal-note').textContent += ' Đóng kết quả để thêm tên hoặc giảm số người chọn.';
  get('race-again').querySelector('span').textContent = raceSettings.remove ? 'Đua lượt tiếp' : 'Đua lại';
  get('result-feedback').textContent = '';
  get('copy-fallback').hidden = true;
  resultsDialog.querySelector('details').open = false;
}

async function importNames() {
  const file = fileInput.files[0];
  if (!file || isActive() || importing) return;
  const feedback = get('import-feedback');
  feedback.hidden = false;
  feedback.classList.remove('error');
  feedback.textContent = 'Đang đọc file trên thiết bị…';
  importing = true;
  get('import-names').querySelector('span').textContent = 'Đang đọc file…';
  updateControls();
  let importedNames;
  try {
    importedNames = await readNamesFile(file);
  } catch (error) {
    console.error('Không thể nhập danh sách đua vịt.', error);
    feedback.classList.add('error');
    feedback.textContent = `${error.message} Danh sách hiện tại được giữ nguyên.`;
  } finally {
    importing = false;
    fileInput.value = '';
    get('import-names').querySelector('span').textContent = 'Thêm lớp 4/6';
  }
  if (importedNames) {
    namesInput.value = importedNames.join('\n');
    resetRace({ save: true });
    feedback.textContent = `Đã nhập ${importedNames.length} tên từ ${file.name}.`;
  }
  updateControls();
}

function rounded(ctx, x, y, w, h, radius, fill, stroke = null, lineWidth = 1.5) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function star(ctx, x, y, radius, fill, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let index = 0; index < 10; index++) {
    const angle = rotation + index * Math.PI / 5;
    const r = index % 2 ? radius * .43 : radius;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function fittedText(ctx, text, x, y, maxWidth, fontSize, color, weight = 800) {
  let size = fontSize;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  do {
    ctx.font = `${weight} ${size}px "Nunito", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size--;
  } while (size > 6);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
}

function drawCloud(ctx, x, y, size) {
  ctx.fillStyle = '#fffdf0dc';
  ctx.beginPath();
  ctx.ellipse(x, y + size * .22, size, size * .34, 0, 0, Math.PI * 2);
  ctx.ellipse(x - size * .35, y, size * .4, size * .45, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * .2, y - size * .08, size * .5, size * .55, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx, x, base, size) {
  ctx.fillStyle = '#a17657';
  ctx.strokeStyle = '#536d59';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * .1, base);
  ctx.lineTo(x - size * .055, base - size * 1.15);
  ctx.lineTo(x + size * .1, base - size * 1.15);
  ctx.lineTo(x + size * .14, base);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  [[-.4, -.92, .6, '#7eb99c'], [.35, -1.04, .67, '#95c5a0'], [0, -1.5, .62, '#b1d19f']].forEach(([dx, dy, r, color]) => {
    ctx.beginPath();
    ctx.arc(x + dx * size, base + dy * size, size * r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  });
}

function startingLine(w) {
  return Math.max(w * .14, Math.min(88, w * .28));
}

function drawSchool(ctx, w, h) {
  const schoolWidth = Math.min(w * .76, 1060);
  const schoolHeight = Math.min(h * .18, 190);
  const x = (w - schoolWidth) / 2;
  const base = h * .385;
  const y = base - schoolHeight;
  rounded(ctx, x, y, schoolWidth, schoolHeight, 4, '#f3d59b', '#8b8164');
  rounded(ctx, x, y + schoolHeight * .50, schoolWidth, 5, 0, '#dfb678');
  ctx.fillStyle = '#d77460';
  ctx.strokeStyle = '#925851';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 3);
  ctx.lineTo(x + schoolWidth * .05, y - schoolHeight * .21);
  ctx.lineTo(x + schoolWidth * .95, y - schoolHeight * .21);
  ctx.lineTo(x + schoolWidth + 14, y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#b85950';
  for (let tile = 0; tile < 26; tile++) {
    const tileX = x + schoolWidth * tile / 25;
    ctx.beginPath();
    ctx.moveTo(tileX, y + 2);
    ctx.lineTo(x + schoolWidth * .05 + schoolWidth * .9 * tile / 25, y - schoolHeight * .20);
    ctx.stroke();
  }
  const windowWidth = schoolWidth * .043;
  const windowHeight = schoolHeight * .24;
  for (let index = 0; index < 12; index++) {
    const wx = x + schoolWidth * (.035 + index * .08);
    const wy = y + schoolHeight * .12;
    rounded(ctx, wx, wy, windowWidth, windowHeight, 2, '#87b9bd', '#8a8b6d', 1);
    ctx.strokeStyle = '#f8e7b9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx + windowWidth / 2, wy);
    ctx.lineTo(wx + windowWidth / 2, wy + windowHeight);
    ctx.moveTo(wx, wy + windowHeight / 2);
    ctx.lineTo(wx + windowWidth, wy + windowHeight / 2);
    ctx.stroke();
  }
  const entryWidth = schoolWidth * .22;
  rounded(ctx, w / 2 - entryWidth / 2, y + schoolHeight * .40, entryWidth, schoolHeight * .60, 3, '#fae7b9', '#ad976d');
  rounded(ctx, w / 2 - schoolWidth * .045, base - schoolHeight * .25, schoolWidth * .09, schoolHeight * .25, [4, 4, 0, 0], '#699298', '#627a76');
  const signWidth = Math.min(schoolWidth * .79, 660);
  const signHeight = Math.max(19, Math.min(35, schoolHeight * .25));
  const signY = base - schoolHeight * .36;
  rounded(ctx, w / 2 - signWidth / 2, signY, signWidth, signHeight, 4, '#fdf6d8', '#c28b60', 1.5);
  fittedText(ctx, 'TRƯỜNG TIỂU HỌC PHÚ THỌ', w / 2, signY + signHeight / 2 + 1, signWidth - 16, Math.min(21, signHeight * .52), '#9e5146', 900);
  const flagX = x + schoolWidth * .91;
  const flagTop = y - schoolHeight * .43;
  ctx.strokeStyle = '#5b7374';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(flagX, base);
  ctx.lineTo(flagX, flagTop);
  ctx.stroke();
  const flagWidth = Math.max(24, Math.min(49, w * .044));
  rounded(ctx, flagX + 1, flagTop + 2, flagWidth, flagWidth * .66, 1, '#d95c57');
  star(ctx, flagX + flagWidth * .52, flagTop + flagWidth * .33 + 2, flagWidth * .16, '#ffe087');
  rounded(ctx, x - 7, base, schoolWidth + 14, Math.max(4, h * .008), 1, '#dfc49a');
}

function drawScenery(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * .44);
  sky.addColorStop(0, '#cfe9ee');
  sky.addColorStop(1, '#f1eed2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffe29d';
  ctx.beginPath();
  ctx.arc(w * .76, h * .13, Math.min(45, h * .053), 0, Math.PI * 2);
  ctx.fill();
  drawCloud(ctx, w * .16, h * .17, Math.min(52, w * .07));
  drawCloud(ctx, w * .66, h * .085, Math.min(48, w * .065));
  drawCloud(ctx, w * .94, h * .22, Math.min(45, w * .06));
  ctx.fillStyle = '#c7d9aa';
  ctx.beginPath();
  ctx.moveTo(0, h * .32);
  ctx.bezierCurveTo(w * .2, h * .24, w * .34, h * .39, w * .55, h * .30);
  ctx.bezierCurveTo(w * .73, h * .23, w * .82, h * .27, w, h * .32);
  ctx.lineTo(w, h * .45);
  ctx.lineTo(0, h * .45);
  ctx.fill();
  ctx.fillStyle = '#e6d3a3';
  ctx.fillRect(0, h * .36, w, h * .14);
  ctx.strokeStyle = '#d1bd94';
  ctx.lineWidth = 1;
  [h * .394, h * .423].forEach((y) => {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  });
  drawSchool(ctx, w, h);
  drawTree(ctx, w * .065, h * .405, Math.min(h * .064, w * .058));
  drawTree(ctx, w * .955, h * .402, Math.min(h * .069, w * .059));
  ctx.strokeStyle = '#83947c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * .115);
  ctx.quadraticCurveTo(w * .5, h * .18, w, h * .105);
  ctx.stroke();
  for (let index = 1; index < 18; index++) {
    const x = w * index / 18;
    const t = index / 18;
    const y = (1 - t) ** 2 * h * .115 + 2 * (1 - t) * t * h * .18 + t ** 2 * h * .105;
    ctx.beginPath();
    ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 14); ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.stroke();
  }
  const waterTop = h * .445;
  const waterBottom = h * .915;
  const water = ctx.createLinearGradient(0, waterTop, 0, waterBottom);
  water.addColorStop(0, '#85cdc7');
  water.addColorStop(1, '#5ab6b3');
  ctx.fillStyle = water;
  ctx.fillRect(0, waterTop, w, waterBottom - waterTop);
  ctx.fillStyle = '#f8e6b7';
  ctx.fillRect(0, waterTop - 5, w, 5);
  ctx.fillStyle = '#82b695';
  ctx.fillRect(0, waterBottom, w, h - waterBottom);
  ctx.strokeStyle = '#c5ebe280';
  ctx.lineWidth = 1.5;
  for (let index = 0; index < 75; index++) {
    const x = (index * 137.7 % w);
    const y = waterTop + 10 + (index * 53.9 % Math.max(1, waterBottom - waterTop - 20));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 + index % 17, y); ctx.stroke();
  }
  const finishX = w * .87;
  const flagY = waterTop - Math.min(44, h * .05);
  ctx.strokeStyle = '#355562';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(finishX, flagY); ctx.lineTo(finishX, waterTop + 3); ctx.stroke();
  const flagSize = Math.max(5, Math.min(9, w * .012));
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#fff9e7' : '#355562';
      ctx.fillRect(finishX + col * flagSize, flagY + row * flagSize, flagSize, flagSize);
    }
  }
  ctx.setLineDash([6, 7]);
  ctx.strokeStyle = '#e7faf2';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(finishX, waterTop + 3); ctx.lineTo(finishX, waterBottom - 5); ctx.stroke();
  ctx.strokeStyle = '#d6efe5a0';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(startingLine(w), waterTop + 3); ctx.lineTo(startingLine(w), waterBottom - 5); ctx.stroke();
  ctx.setLineDash([]);
  fittedText(ctx, 'ĐÍCH', finishX, waterBottom + 16, 60, 12, '#244c4b', 900);
  for (let index = 0; index < 13; index++) {
    const x = w * (index + .4) / 13;
    ctx.strokeStyle = '#5c9a78';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x - 8, h - 18, x - 12, h - 28); ctx.stroke();
    if (index % 2) star(ctx, x - 12, h - 30, 4, '#f9dfa0');
  }
}

function drawDuck(ctx, x, y, size, color, id, highlighted, moving) {
  ctx.save();
  ctx.translate(x, y);
  if (highlighted) {
    ctx.beginPath();
    ctx.ellipse(0, size * .06, size * .81, size * .6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff0a765';
    ctx.fill();
  }
  ctx.lineWidth = Math.max(1, size * .042);
  ctx.strokeStyle = '#3d5862';
  ctx.fillStyle = '#e1f5ed8c';
  ctx.beginPath();
  ctx.ellipse(-size * .09, size * .39, size * .67, size * .1, 0, 0, Math.PI * 2);
  ctx.fill();
  if (moving) {
    ctx.strokeStyle = '#ddf5eb99';
    ctx.beginPath();
    ctx.moveTo(-size * .7, size * .23); ctx.lineTo(-size * 1.12, size * .23);
    ctx.moveTo(-size * .85, size * .36); ctx.lineTo(-size * 1.36, size * .36);
    ctx.stroke();
    ctx.strokeStyle = '#3d5862';
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * .35, size * .21);
  ctx.lineTo(-size * .67, -size * .02);
  ctx.quadraticCurveTo(-size * .67, size * .37, -size * .27, size * .36);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-size * .03, size * .12, size * .51, size * .29, -.08, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * .35, -size * .15, size * .245, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f3a54c';
  ctx.beginPath();
  ctx.moveTo(size * .54, -size * .17);
  ctx.lineTo(size * .79, -size * .08);
  ctx.quadraticCurveTo(size * .67, size * .03, size * .52, -size * .01);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff42';
  ctx.beginPath();
  ctx.ellipse(-size * .05, size * .13, size * .27, size * .13, -.12, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2c4350';
  ctx.beginPath(); ctx.arc(size * .42, -size * .20, Math.max(1, size * .035), 0, Math.PI * 2); ctx.fill();
  if (id % 3 === 0) {
    rounded(ctx, size * .15, -size * .43, size * .36, size * .12, size * .025, '#fff7dd', '#3d5862', Math.max(.7, size * .028));
    rounded(ctx, size * .12, -size * .34, size * .44, size * .05, 1, '#6c9fbd');
  } else if (id % 3 === 1) {
    ctx.fillStyle = '#d66a83';
    ctx.beginPath();
    ctx.moveTo(size * .18, -size * .37); ctx.lineTo(size * .05, -size * .51); ctx.lineTo(size * .04, -size * .33);
    ctx.moveTo(size * .18, -size * .37); ctx.lineTo(size * .3, -size * .49); ctx.lineTo(size * .3, -size * .3);
    ctx.fill();
  }
  if (highlighted) star(ctx, size * .1, -size * .67, size * .14, '#ffe074');
  ctx.restore();
}

function resizeScene() {
  if (!context || !backgroundContext) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  width = rect.width;
  height = rect.height;
  const footerTop = document.querySelector('.race-footer').getBoundingClientRect().top - rect.top;
  trackBottom = Math.max(height * .55, Math.min(height * .89, footerTop - 12));
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = background.width = Math.round(width * ratio);
  canvas.height = background.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  backgroundContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawScenery(backgroundContext, width, height);
  drawFrame(performance.now());
}

function drawFrame(now) {
  if (!context || !backgroundContext || !width || !height) return;
  context.clearRect(0, 0, width, height);
  context.drawImage(background, 0, 0, width, height);
  const entries = racers.length ? racers : preview;
  if (!entries.length) return;
  const top = height * .465;
  const bottom = trackBottom;
  const rows = entries.length <= 14 ? entries.length : Math.min(18, Math.max(1, Math.floor((bottom - top) / 27)));
  const rowHeight = (bottom - top) / rows;
  const sideLabels = rowHeight < 42;
  const size = Math.min(38, rowHeight * (sideLabels ? .82 : .60), width * .085) * (entries.length > rows * 3 ? .8 : 1);
  const startX = startingLine(width);
  const finishX = width * .87;
  const selectedIds = new Set(selected.map((racer) => racer.id));
  const visualTime = phase === 'idle' ? now : elapsed;
  const positions = entries.map((racer) => {
    const progress = racers.length ? progressAt(racer, elapsed) : 0;
    const offset = (Math.floor(racer.id / rows) % 5) * size * .22;
    return {
      racer, progress,
      x: startX + (finishX - startX) * progress - size * .79 - offset * (1 - progress),
      y: top + rowHeight * ((racer.id % rows) + .60) +
        (motionQuery.matches ? 0 : Math.sin(visualTime * .005 + racer.id * 1.7) * Math.min(1.4, rowHeight * .03))
    };
  });
  const leaders = [...positions].sort((a, b) => b.progress - a.progress || (a.racer.rank ?? a.racer.id) - (b.racer.rank ?? b.racer.id));
  if (phase === 'running' && now - lastHudUpdate > 90) {
    get('race-timer').textContent = (elapsed / 1000).toFixed(2);
    get('leader-caption').textContent = 'Đang dẫn đầu';
    get('leader-name').textContent = leaders[0].racer.name;
    lastHudUpdate = now;
  }
  positions.forEach(({ racer, x, y }) => {
    drawDuck(context, x, y, size, colors[racer.id % colors.length], racer.id, selectedIds.has(racer.id), phase === 'running' && !motionQuery.matches);
  });
  const labeled = entries.length <= 24 ? positions : leaders.slice(0, 5);
  labeled.forEach(({ racer, x, y }) => {
    const fontSize = Math.max(8, Math.min(12, rowHeight * .31));
    context.font = `800 ${fontSize}px "Nunito", sans-serif`;
    const maxWidth = sideLabels ? Math.min(145, Math.max(30, x - size * .67 - 8)) : Math.min(145, width * .4);
    const characters = [...racer.name];
    let text = racer.name;
    while (context.measureText(text).width > maxWidth - 12 && characters.length > 1) {
      characters.pop();
      text = `${characters.join('')}…`;
    }
    const labelWidth = Math.min(maxWidth, context.measureText(text).width + 12);
    const labelHeight = fontSize + 6;
    const labelX = Math.max(4, Math.min(width - labelWidth - 4, sideLabels ? x - size * .67 - labelWidth - 4 : x - labelWidth / 2 + size * .12));
    const labelY = sideLabels ? y - labelHeight / 2 : y - size * .46 - labelHeight - 2;
    rounded(context, labelX, labelY, labelWidth, labelHeight, 5, selectedIds.has(racer.id) ? '#fff0b9' : '#fffaf0ee', '#47746b66', .7);
    fittedText(context, text, labelX + labelWidth / 2, labelY + labelHeight / 2, labelWidth - 8, fontSize, '#2c5155');
  });
  if (phase === 'finished' && !motionQuery.matches && now - finishedAt < 2800) {
    const time = (now - finishedAt) / 1000;
    for (let index = 0; index < 32; index++) {
      const x = width * .5 + Math.sin(index * 2.4) * width * .48 * Math.min(1, time + .1);
      const y = height * .35 - (index % 7 + 3) * time * 22 + time ** 2 * 67;
      context.save();
      context.translate(x, y); context.rotate(time * (index % 5 + 1));
      context.fillStyle = colors[index % colors.length]; context.fillRect(-3, -2, 6, 4);
      context.restore();
    }
  }
}

function animate(now) {
  if (phase === 'countdown') {
    const remaining = countdownEndsAt - now;
    if (remaining <= 0) {
      phase = 'running';
      startedAt = countdownEndsAt;
      get('countdown').hidden = true;
      get('race-status').textContent = `${racers.length} chú vịt đang tăng tốc. Cùng cổ vũ nào!`;
      updateControls();
      audio.tone(880, .22);
    } else {
      const digit = Math.ceil(remaining / 1000);
      if (digit !== countdownDigit) {
        countdownDigit = digit;
        get('countdown-number').textContent = digit;
        audio.tone(440);
      }
    }
  }
  if (phase === 'running') {
    elapsed = Math.min(raceSettings.duration * 1000, Math.max(0, now - startedAt));
    if (elapsed >= raceSettings.duration * 1000) finishRace(now);
    else if (elapsed >= nextQuackAt) {
      audio.quack();
      nextQuackAt = elapsed + 4000 + Math.random() * 4000;
    }
  }
  drawFrame(now);
  requestAnimationFrame(animate);
}

namesInput.addEventListener('input', () => {
  get('import-feedback').hidden = true;
  resetRace({ save: true });
});
get('settings-fieldset').addEventListener('input', () => resetRace({ save: true }));
get('setup-form').addEventListener('submit', (event) => { event.preventDefault(); actOnRace(); });
actionButtons.forEach((button) => button.addEventListener('click', actOnRace));
resetButtons.forEach((button) => button.addEventListener('click', () => resetRace()));
get('fewer-winners').addEventListener('click', () => { countInput.value = Number(countInput.value) - 1; resetRace({ save: true }); });
get('more-winners').addEventListener('click', () => { countInput.value = Number(countInput.value) + 1; resetRace({ save: true }); });
get('clear-names').addEventListener('click', () => {
  namesInput.value = '';
  get('import-feedback').hidden = true;
  resetRace({ save: true });
  namesInput.focus();
});
get('shuffle-names').addEventListener('click', () => {
  try {
    namesInput.value = shuffle(parseNames(namesInput.value)).join('\n');
    resetRace({ save: true });
  } catch (error) {
    reportError('Không thể trộn danh sách. Hãy dùng trình duyệt có hỗ trợ Web Crypto.', error);
  }
});
get('import-names').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', importNames);
get('open-numbers').addEventListener('click', () => {
  get('numbers-error').hidden = true;
  get('numbers-dialog').showModal();
});
get('numbers-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const from = Number(get('number-from').value);
  const to = Number(get('number-to').value);
  const error = !Number.isSafeInteger(from) || !Number.isSafeInteger(to) || from < 1 || to > 99999 || to < from ?
    'Nhập hai số nguyên từ 1 đến 99999, số cuối không nhỏ hơn số đầu.' :
    to - from + 1 > MAX_PARTICIPANTS ? 'Dãy số chỉ được có tối đa 200 người chơi.' : '';
  get('numbers-error').textContent = error;
  get('numbers-error').hidden = !error;
  if (error) return;
  namesInput.value = Array.from({ length: to - from + 1 }, (_, index) => String(from + index)).join('\n');
  get('import-feedback').hidden = true;
  resetRace({ save: true });
  get('numbers-dialog').close();
});
get('open-help').addEventListener('click', () => {
  if (phase === 'running') pauseRace();
  else if (phase === 'countdown') resetRace();
  get('help-dialog').showModal();
});
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
get('race-again').addEventListener('click', () => { resultsDialog.close(); beginRace(); });
get('copy-results').addEventListener('click', async () => {
  if (!lastResult) return;
  const text = `Đua vịt — Trường Tiểu học Phú Thọ\n${lastResult.settings.mode === 'first' ? 'Người về đầu' : 'Người về cuối'}:\n` +
    lastResult.selected.map((racer, index) => `${index + 1}. ${racer.name} (hạng ${racer.rank}/${lastResult.racers.length})`).join('\n');
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API không khả dụng.');
    await navigator.clipboard.writeText(text);
    get('result-feedback').textContent = 'Đã sao chép kết quả!';
  } catch (error) {
    console.error('Không thể sao chép kết quả tự động.', error);
    get('copy-fallback').value = text;
    get('copy-fallback').hidden = false;
    get('copy-fallback').focus();
    get('copy-fallback').select();
    get('result-feedback').textContent = 'Không thể sao chép tự động. Nội dung đã được chọn; nhấn Ctrl+C hoặc Cmd+C để sao chép.';
  }
});
get('expand-toggle').addEventListener('click', () => setExpanded(!panel.classList.contains('is-expanded')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && panel.classList.contains('is-expanded') && !document.querySelector('dialog[open]')) {
    setExpanded(false);
    event.preventDefault();
  }
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  if (phase === 'running') {
    pauseRace();
    showNotice('Cuộc đua đã tạm dừng khi bạn chuyển tab. Nhấn “Tiếp tục” để đua tiếp.');
  } else if (phase === 'countdown') {
    resetRace();
    showNotice('Đã hủy đếm ngược khi bạn chuyển tab. Nhấn “Bắt đầu đua” khi sẵn sàng.');
  }
});

restoreSetup();
resetRace();
if (!context || !backgroundContext) {
  showNotice('Trình duyệt không hỗ trợ Canvas. Hãy mở game bằng trình duyệt hiện đại để hiển thị đường đua.');
} else {
  const sceneObserver = new ResizeObserver(resizeScene);
  sceneObserver.observe(panel);
  sceneObserver.observe(document.querySelector('.race-footer'));
  window.addEventListener('resize', resizeScene);
  document.fonts.ready.then(resizeScene);
  resizeScene();
  requestAnimationFrame(animate);
}
