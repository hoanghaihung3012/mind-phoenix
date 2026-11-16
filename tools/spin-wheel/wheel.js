import { parseNames, readNamesFile, remainingNames, shuffle } from '../../games/duck-race/race.mjs';
import { class46Names } from '../../games/class-4-6.mjs';
import { GameAudio } from '../../games/audio.mjs';
import { createSpin, numberRange, validateNames } from './wheel.mjs';

const get = (id) => document.getElementById(id);
const namesInput = get('participants');
const canvas = get('wheel');
const context = canvas.getContext('2d');
const results = get('results-dialog');
const storageKey = 'mp-spin-wheel-settings-v1';
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const colors = ['#ffd982', '#f3a69e', '#add7d9', '#c4b5df', '#b8d7a3', '#f7be8e'];
let spinning = false;
let importing = false;
let storageAvailable = true;
let rotation = 0;
let frame = 0;
let lastWinner = null;
const audio = new GameAudio({
  theme: 'duck',
  onError: reportError,
  onEnabledChange: (enabled) => { get('sound-toggle').checked = enabled; }
});

function reportError(message, error) {
  console.error(message, error);
  get('notice').textContent = message;
  get('notice').hidden = false;
}

function save() {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      text: namesInput.value,
      duration: Number(get('duration').value),
      remove: get('remove-picked').checked,
      sound: get('sound-toggle').checked
    }));
  } catch (error) {
    storageAvailable = false;
    reportError('Không thể lưu cài đặt. Bạn vẫn có thể quay, nhưng dữ liệu sẽ không được giữ khi tải lại.', error);
  }
}

function restore() {
  namesInput.value = class46Names.join('\n');
  let saved;
  try {
    saved = localStorage.getItem(storageKey);
  } catch (error) {
    storageAvailable = false;
    reportError('Không thể đọc bộ nhớ trình duyệt. Đang dùng danh sách lớp 4/6 và không lưu cài đặt.', error);
    return;
  }
  if (saved === null) return;
  try {
    const value = JSON.parse(saved);
    if (!value || typeof value.text !== 'string' || ![5, 10, 15].includes(value.duration) ||
        typeof value.remove !== 'boolean' || typeof value.sound !== 'boolean') {
      throw new TypeError('Cài đặt vòng quay không hợp lệ.');
    }
    namesInput.value = value.text;
    get('duration').value = String(value.duration);
    get('remove-picked').checked = value.remove;
    audio.setEnabled(value.sound);
  } catch (error) {
    reportError('Cài đặt đã lưu bị lỗi. Đang dùng danh sách lớp 4/6; chỉnh danh sách để lưu lại.', error);
  }
}

function draw(names) {
  if (!context) return;
  context.clearRect(0, 0, 1000, 1000);
  const labels = names.length ? names : ['Thêm tên để bắt đầu'];
  const slice = Math.PI * 2 / labels.length;
  labels.forEach((name, index) => {
    const start = -Math.PI / 2 + index * slice;
    context.beginPath();
    context.moveTo(500, 500);
    context.arc(500, 500, 499, start, start + slice);
    context.closePath();
    context.fillStyle = colors[index % colors.length];
    context.fill();
    context.strokeStyle = '#fff9e6';
    context.lineWidth = 2;
    context.stroke();
    context.save();
    context.translate(500, 500);
    context.rotate(start + slice / 2);
    context.fillStyle = '#293d39';
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.font = `800 ${labels.length > 48 ? 16 : Math.min(34, 900 / labels.length)}px Nunito, sans-serif`;
    const label = labels.length > 48 ? String(index + 1) : `${index + 1}. ${name}`;
    const chars = [...label];
    while (chars.length > 1 && context.measureText(chars.join('')).width > 320) chars.pop();
    context.fillText(chars.length < [...label].length ? `${chars.join('')}…` : label, 462, 0);
    context.restore();
  });
}

function render() {
  const names = parseNames(namesInput.value);
  const error = validateNames(names);
  get('participant-count').textContent = `${names.length} / 200`;
  get('setup-error').textContent = error;
  get('setup-error').hidden = !error;
  namesInput.setAttribute('aria-invalid', String(Boolean(error)));
  get('setup-fields').disabled = spinning || importing;
  get('spin').disabled = !context || spinning || importing || Boolean(error);
  get('spin').textContent = spinning ? 'Đang quay…' : importing ? 'Đang đọc file…' : 'Quay may mắn!';
  get('cancel-spin').hidden = !spinning;
  get('spin-again').disabled = !context || Boolean(error);
  if (!spinning) {
    draw(error ? [] : names);
    canvas.style.transform = 'rotate(0deg)';
    rotation = 0;
    const roster = get('roster-list');
    roster.replaceChildren();
    if (!error) names.forEach((name) => {
      const item = document.createElement('li');
      item.textContent = name;
      roster.append(item);
    });
    get('spin-status').textContent = lastWinner ? `Lượt vừa rồi: ${lastWinner.name}. Còn ${names.length} dòng trên vòng quay.` :
      error ? 'Thêm hoặc chỉnh danh sách để bắt đầu nhé.' : `${names.length} ô màu đã sẵn sàng. Ai sẽ là người may mắn?`;
  }
}

function replaceNames(names) {
  namesInput.value = names.join('\n');
  lastWinner = null;
  get('import-feedback').textContent = '';
  render();
  save();
}

function finishSpin(spin, names, remove) {
  spinning = false;
  audio.setMusicPlaying(false);
  lastWinner = spin.winner;
  get('winner-name').textContent = spin.winner.name;
  get('winner-line').textContent = `Dòng số ${spin.winner.id + 1} trong ${names.length} dòng`;
  get('removal-note').textContent = remove ? 'Đã loại đúng dòng này khỏi lượt tiếp theo.' : 'Tên vẫn được giữ cho lượt quay tiếp theo.';
  if (remove) namesInput.value = remainingNames(names, [spin.winner]).join('\n');
  get('setup-fields').disabled = false;
  get('spin').disabled = Boolean(validateNames(parseNames(namesInput.value)));
  get('spin').textContent = 'Quay may mắn!';
  get('cancel-spin').hidden = true;
  get('spin-again').disabled = get('spin').disabled;
  get('spin-status').textContent = `Chúc mừng ${spin.winner.name}!`;
  save();
  results.showModal();
}

function startSpin() {
  if (spinning || importing) return;
  const names = parseNames(namesInput.value);
  const error = validateNames(names);
  if (error || !context) {
    render();
    return;
  }
  const duration = Number(get('duration').value) * 1000;
  if (![5000, 10000, 15000].includes(duration)) {
    reportError('Chọn thời gian quay 5, 10 hoặc 15 giây.', new RangeError('Invalid spin duration'));
    return;
  }
  // Rebuild after a completed removal so painted slices match the next draw.
  render();
  let spin;
  try {
    spin = createSpin(names, rotation);
  } catch (error) {
    reportError('Không thể chọn ngẫu nhiên. Hãy dùng trình duyệt hỗ trợ Web Crypto.', error);
    return;
  }
  const remove = get('remove-picked').checked;
  const initial = rotation;
  const started = performance.now();
  spinning = true;
  render();
  get('spin-status').textContent = 'Vòng quay đang chọn ngôi sao tiếp theo…';
  void audio.activate();
  audio.setMusicPlaying(true);
  save();
  const animate = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    rotation = initial + (spin.rotation - initial) * (1 - (1 - progress) ** 4);
    if (!motion.matches) canvas.style.transform = `rotate(${rotation}deg)`;
    if (progress < 1) {
      frame = requestAnimationFrame(animate);
    } else {
      rotation = spin.rotation % 360;
      canvas.style.transform = `rotate(${rotation}deg)`;
      finishSpin(spin, names, remove);
    }
  };
  frame = requestAnimationFrame(animate);
}

get('setup-form').addEventListener('submit', (event) => event.preventDefault());
namesInput.addEventListener('input', () => { lastWinner = null; render(); save(); });
get('duration').addEventListener('change', save);
get('remove-picked').addEventListener('change', save);
get('sound-toggle').addEventListener('change', () => {
  audio.setEnabled(get('sound-toggle').checked);
  if (audio.enabled) void audio.activate();
  save();
});
get('spin').addEventListener('click', startSpin);
get('spin-again').addEventListener('click', () => { results.close(); startSpin(); });
get('cancel-spin').addEventListener('click', () => {
  cancelAnimationFrame(frame);
  spinning = false;
  audio.setMusicPlaying(false);
  render();
  get('spin-status').textContent = 'Đã hủy lượt quay. Không có tên nào bị loại.';
});
get('clear-names').addEventListener('click', () => replaceNames([]));
get('add-class-4-6').addEventListener('click', () => replaceNames(class46Names));
get('shuffle-names').addEventListener('click', () => {
  const names = parseNames(namesInput.value);
  if (validateNames(names)) { render(); return; }
  try {
    replaceNames(shuffle(names));
  } catch (error) {
    reportError('Không thể trộn danh sách. Hãy dùng trình duyệt hỗ trợ Web Crypto.', error);
  }
});
get('open-numbers').addEventListener('click', () => {
  get('numbers-error').hidden = true;
  get('numbers-dialog').showModal();
});
get('numbers-form').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const names = numberRange(Number(get('number-from').value), Number(get('number-to').value));
    replaceNames(names);
    get('numbers-dialog').close();
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    get('numbers-error').textContent = error.message;
    get('numbers-error').hidden = false;
  }
});
get('import-names').addEventListener('click', () => get('import-file').click());
get('import-file').addEventListener('change', async () => {
  const file = get('import-file').files[0];
  if (!file || spinning || importing) return;
  importing = true;
  render();
  try {
    const names = await readNamesFile(file);
    replaceNames(names);
    get('import-feedback').textContent = `Đã nhập ${names.length} dòng từ ${file.name}.`;
  } catch (error) {
    reportError(`Không thể nhập danh sách. ${error.message}`, error);
  } finally {
    importing = false;
    get('import-file').value = '';
    render();
  }
});
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
results.addEventListener('close', render);
document.addEventListener('visibilitychange', () => audio.setVisible(!document.hidden));
window.addEventListener('pagehide', () => audio.setVisible(false));
window.addEventListener('pageshow', () => audio.setVisible(!document.hidden));
restore();
render();
if (!context) reportError('Trình duyệt không hỗ trợ Canvas. Hãy mở bằng trình duyệt mới hơn để quay.', new Error('Canvas 2D unavailable'));
document.fonts.ready.then(() => { if (!spinning && !results.open) render(); });
