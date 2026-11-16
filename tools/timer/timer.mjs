const MAX_SECONDS = 100 * 60 * 60 - 1;

function validateDuration(seconds, language = 'vi') {
  if (!Number.isSafeInteger(seconds) || seconds < 1 || seconds > MAX_SECONDS) {
    throw new RangeError(language === 'en' ? 'Duration must be between 1 second and 99 hours, 59 minutes, 59 seconds.' : 'Thời gian phải từ 1 giây đến 99 giờ 59 phút 59 giây.');
  }
  return seconds;
}

export function readDuration({ hours, minutes, seconds }, language = 'vi') {
  const en = language === 'en';
  const parts = [[hours, en ? 'Hours' : 'Giờ', 99], [minutes, en ? 'Minutes' : 'Phút', 59], [seconds, en ? 'Seconds' : 'Giây', 59]];
  const values = parts.map(([raw, label, maximum]) => {
    const text = String(raw).trim();
    const value = Number(text);
    if (!/^\d*$/.test(text) || !Number.isSafeInteger(value) || value > maximum) {
      throw new RangeError(en ? `${label} must be a whole number from 0 to ${maximum}.` : `${label} phải là số nguyên từ 0 đến ${maximum}.`);
    }
    return value;
  });
  return validateDuration(values[0] * 3600 + values[1] * 60 + values[2], language);
}

export function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError('Thời gian hiển thị không hợp lệ.');
  }
  const total = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const seconds = total % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return `${hours ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(seconds)}`;
}

export function createCountdown(seconds, now = Date.now) {
  let durationMs = validateDuration(seconds) * 1000;
  let remainingMs = durationMs;
  let deadline = null;
  let state = 'idle';

  function snapshot() {
    if (state === 'running') {
      // Derive from the deadline so throttled background updates do not lose time.
      remainingMs = Math.max(0, deadline - now());
      if (remainingMs === 0) {
        state = 'finished';
        deadline = null;
      }
    }
    return { durationMs, remainingMs, state };
  }

  return {
    snapshot,
    start() {
      snapshot();
      if (state !== 'running') {
        if (state === 'finished') remainingMs = durationMs;
        deadline = now() + remainingMs;
        state = 'running';
      }
      return snapshot();
    },
    pause() {
      snapshot();
      if (state === 'running') {
        deadline = null;
        state = 'paused';
      }
      return snapshot();
    },
    reset(nextSeconds = durationMs / 1000) {
      const nextDurationMs = validateDuration(nextSeconds) * 1000;
      durationMs = nextDurationMs;
      remainingMs = durationMs;
      deadline = null;
      state = 'idle';
      return snapshot();
    }
  };
}
