import { GameAudio } from '../../games/audio.mjs';
import { createCountdown, formatDuration, readDuration } from './timer.mjs';

const $ = (id) => document.getElementById(id);
const countdown = createCountdown(300);
const presets = [...document.querySelectorAll('[data-seconds]')];
const pageTitle = document.title;
let ticker = null;
let renderedState = null;

const alarm = new GameAudio({
  theme: 'puzzle',
  onEnabledChange: (enabled) => { $('sound-toggle').checked = enabled; },
  onError: (_message, error) => {
    console.error('Timer alarm could not play.', error);
    $('sound-error').textContent = 'Không thể phát âm báo. Hãy kiểm tra quyền âm thanh của trình duyệt rồi bật lại âm báo; đồng hồ vẫn hoạt động không tiếng.';
    $('sound-error').hidden = false;
  }
});

const labels = {
  idle: { badge: 'Sẵn sàng', button: 'Bắt đầu', status: 'Sẵn sàng rồi. Bắt đầu khi bạn muốn nhé!' },
  running: { badge: 'Đang đếm', button: 'Tạm dừng', status: 'Cứ thong thả, tập trung vào việc của bạn.' },
  paused: { badge: 'Tạm dừng', button: 'Tiếp tục', status: 'Nghỉ một nhịp. Tiếp tục khi bạn sẵn sàng.' },
  finished: { badge: 'Hết giờ!', button: 'Bắt đầu lại', status: 'Hết giờ rồi! Dành một chút thời gian nghỉ nhé.' }
};

function render() {
  const { durationMs, remainingMs, state } = countdown.snapshot();
  const display = formatDuration(remainingMs);
  const hasHours = display.split(':').length === 3;
  $('clock').textContent = display;
  $('clock').classList.toggle('has-hours', hasHours);
  $('clock-units').textContent = hasHours ? 'giờ : phút : giây' : 'phút : giây';
  $('selected-duration').textContent = `Đã đặt ${formatDuration(durationMs)}`;
  $('timer-panel').dataset.state = state;
  $('state-label').textContent = labels[state].badge;
  $('toggle-timer').textContent = labels[state].button;
  for (const button of presets) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.seconds) * 1000 === durationMs));
  }
  document.title = state === 'idle' ? pageTitle
    : `${state === 'finished' ? 'Hết giờ!' : `${state === 'paused' ? 'Tạm dừng · ' : ''}${display}`} — ${pageTitle}`;

  if (state !== renderedState) {
    $('timer-status').textContent = labels[state].status;
    if (state === 'finished' && renderedState === 'running') {
      void alarm.activate().then(() => {
        if (countdown.snapshot().state === 'finished') alarm.chime();
      });
    }
    renderedState = state;
  }
  if (state === 'running' && ticker === null) ticker = setInterval(render, 200);
  if (state !== 'running' && ticker !== null) {
    clearInterval(ticker);
    ticker = null;
  }
}

function selectDuration(seconds) {
  countdown.reset(seconds);
  alarm.stopVoices();
  $('hours').value = String(Math.floor(seconds / 3600));
  $('minutes').value = String(Math.floor(seconds % 3600 / 60));
  $('seconds').value = String(seconds % 60);
  $('duration-error').textContent = '';
  $('duration-error').hidden = true;
  render();
}

$('toggle-timer').addEventListener('click', () => {
  if (renderedState === 'running') {
    countdown.pause();
  } else {
    alarm.stopVoices();
    void alarm.activate();
    countdown.start();
  }
  render();
});

$('reset-timer').addEventListener('click', () => selectDuration(countdown.snapshot().durationMs / 1000));
for (const button of presets) {
  button.addEventListener('click', () => selectDuration(Number(button.dataset.seconds)));
}

$('duration-form').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    selectDuration(readDuration({ hours: $('hours').value, minutes: $('minutes').value, seconds: $('seconds').value }));
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    $('duration-error').textContent = error.message;
    $('duration-error').hidden = false;
    $('duration-error').focus();
  }
});

$('sound-toggle').addEventListener('change', () => {
  $('sound-error').hidden = true;
  alarm.setEnabled($('sound-toggle').checked);
  if (alarm.enabled) void alarm.activate();
});

document.addEventListener('visibilitychange', render);
window.addEventListener('pageshow', render);
window.addEventListener('pagehide', () => {
  clearInterval(ticker);
  ticker = null;
  alarm.stopVoices();
});

render();
