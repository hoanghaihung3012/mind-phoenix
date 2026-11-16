import { GameAudio } from '../../games/audio.mjs';
import { createCountdown, formatDuration, readDuration } from './timer.mjs';
import { initLanguage } from '../i18n.mjs';

const i18n = initLanguage();
const t = i18n.t;
const $ = (id) => document.getElementById(id);
const countdown = createCountdown(300);
const presets = [...document.querySelectorAll('[data-seconds]')];
const pageTitle = () => t('Timer đếm ngược — Mind Phoenix Tools', 'Countdown Timer — Mind Phoenix Tools');
let ticker = null;
let renderedState = null;

const alarm = new GameAudio({
  theme: 'puzzle',
  onEnabledChange: (enabled) => { $('sound-toggle').checked = enabled; },
  onError: (_message, error) => {
    console.error('Timer alarm could not play.', error);
    renderSoundError();
    $('sound-error').hidden = false;
  }
});

const labels = () => ({
  idle: { badge: t('Sẵn sàng', 'Ready'), button: t('Bắt đầu', 'Start'), status: t('Sẵn sàng rồi. Bắt đầu khi bạn muốn nhé!', 'All set. Start whenever you are ready!') },
  running: { badge: t('Đang đếm', 'Running'), button: t('Tạm dừng', 'Pause'), status: t('Cứ thong thả, tập trung vào việc của bạn.', 'Take your time and focus on what matters.') },
  paused: { badge: t('Tạm dừng', 'Paused'), button: t('Tiếp tục', 'Resume'), status: t('Nghỉ một nhịp. Tiếp tục khi bạn sẵn sàng.', 'Take a breath. Resume when you are ready.') },
  finished: { badge: t('Hết giờ!', "Time's up!"), button: t('Bắt đầu lại', 'Restart'), status: t('Hết giờ rồi! Dành một chút thời gian nghỉ nhé.', "Time's up! Take a little break.") }
});

function renderSoundError() {
  $('sound-error').textContent = t('Không thể phát âm báo. Hãy kiểm tra quyền âm thanh của trình duyệt rồi bật lại âm báo; đồng hồ vẫn hoạt động không tiếng.', 'The alarm could not play. Check browser audio permissions and enable the alarm again; the timer still works silently.');
}

function customDuration() {
  return readDuration({ hours: $('hours').value, minutes: $('minutes').value, seconds: $('seconds').value }, i18n.language);
}

function render() {
  const { durationMs, remainingMs, state } = countdown.snapshot();
  const display = formatDuration(remainingMs);
  const hasHours = display.split(':').length === 3;
  $('clock').textContent = display;
  $('clock').classList.toggle('has-hours', hasHours);
  $('clock-units').textContent = hasHours ? t('giờ : phút : giây', 'hours : minutes : seconds') : t('phút : giây', 'minutes : seconds');
  $('selected-duration').textContent = `${t('Đã đặt', 'Set to')} ${formatDuration(durationMs)}`;
  $('timer-panel').dataset.state = state;
  const label = labels()[state];
  $('state-label').textContent = label.badge;
  $('toggle-timer').textContent = label.button;
  for (const button of presets) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.seconds) * 1000 === durationMs));
  }
  document.title = state === 'idle' ? pageTitle()
    : `${state === 'finished' ? label.badge : `${state === 'paused' ? `${label.badge} · ` : ''}${display}`} — ${pageTitle()}`;

  if ($('timer-status').textContent !== label.status) $('timer-status').textContent = label.status;
  if (state !== renderedState) {
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
    selectDuration(customDuration());
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

i18n.onChange(() => {
  render();
  if (!$('sound-error').hidden) renderSoundError();
  if (!$('duration-error').hidden) {
    try {
      customDuration();
      $('duration-error').hidden = true;
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      $('duration-error').textContent = error.message;
    }
  }
});
render();
