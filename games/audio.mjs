const THEMES = {
  duck: {
    step: .48, type: 'triangle',
    melody: [72, 76, 79, null, 76, 74, 72, null, 74, 77, 81, null, 79, 77, 74, null,
      76, 79, 84, 79, 77, 76, 74, null, 77, 76, 74, 71, 72, null, 79, null],
    bass: [48, 53, 57, 55]
  },
  puzzle: {
    step: .7, type: 'sine',
    melody: [76, null, 79, 83, null, 79, 76, null, 74, null, 78, 81, null, 78, 74, null,
      72, null, 76, 79, null, 76, 72, null, 74, 78, null, 81, 78, null, 74, null],
    bass: [52, 50, 48, 50]
  },
  sky: {
    step: .42, type: 'triangle',
    melody: [79, 83, null, 86, 83, 81, 79, null, 76, 79, null, 83, 81, 79, 76, null,
      77, 81, null, 84, 81, 79, 77, null, 74, 78, 81, null, 78, 74, 79, null],
    bass: [55, 52, 53, 50]
  },
  orchard: {
    step: .36, type: 'triangle',
    melody: [72, 74, 76, 79, null, 76, 79, 81, 79, null, 76, 74, 72, null, 74, 76,
      77, 76, 74, 72, null, 74, 76, 79, 76, 74, 72, null, 67, null, 72, null],
    bass: [48, 53, 55, 48]
  },
  sunset: {
    step: .44, type: 'sine',
    melody: [77, null, 81, 84, null, 81, 79, 77, 76, null, 79, 82, null, 79, 77, 76,
      74, null, 77, 81, null, 79, 77, 74, 72, 74, 76, null, 77, null, null, null],
    bass: [53, 48, 46, 48]
  },
  night: {
    step: .5, type: 'sine',
    melody: [69, null, 72, 76, null, 74, 72, null, 71, null, 74, 77, null, 76, 74, null,
      72, null, 76, 79, null, 77, 76, 74, 72, 71, 69, null, 64, null, 69, null],
    bass: [45, 50, 52, 45]
  }
};

const frequency = (note) => 440 * 2 ** ((note - 69) / 12);

export class GameAudio {
  constructor({ theme, enabled = true, onError, onEnabledChange = () => {} }) {
    if (!THEMES[theme]) throw new RangeError(`Unknown audio theme: ${theme}`);
    this.theme = THEMES[theme];
    this.enabled = enabled;
    this.onError = onError;
    this.onEnabledChange = onEnabledChange;
    this.visible = true;
    this.musicPlaying = false;
    this.context = null;
    this.master = null;
    this.pending = null;
    this.timer = null;
    this.voices = new Set();
    this.beat = 0;
    this.nextNote = 0;
  }

  activate() {
    if (!this.enabled || !this.visible) return Promise.resolve();
    if (this.pending) return this.pending;
    this.pending = this.resumeAudio().finally(() => { this.pending = null; });
    return this.pending;
  }

  async resumeAudio() {
    try {
      if (!this.context) {
        const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext;
        if (!AudioContext) throw new Error('Web Audio is not supported.');
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = .65;
        this.master.connect(this.context.destination);
        this.context.onstatechange = () => this.syncMusic();
      }
      if (this.context.state !== 'running') {
        await this.context.resume();
      }
      if (this.context.state !== 'running') throw new Error('Audio playback was not allowed.');
      this.syncMusic();
    } catch (error) {
      this.fail(error);
    }
  }

  fail(error) {
    this.setEnabled(false);
    this.onError('Không thể phát âm thanh. Kiểm tra quyền âm thanh của trình duyệt; bạn vẫn có thể chơi không tiếng.', error);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.updateOutput();
    this.onEnabledChange(enabled);
  }

  setVisible(visible) {
    this.visible = visible;
    this.updateOutput();
  }

  updateOutput() {
    const audible = this.enabled && this.visible;
    if (this.master) this.master.gain.setTargetAtTime(audible ? .65 : 0, this.context.currentTime, .005);
    if (!audible) this.stopVoices();
    this.syncMusic();
  }

  setTheme(theme) {
    if (!THEMES[theme]) throw new RangeError(`Unknown audio theme: ${theme}`);
    if (this.theme === THEMES[theme]) return;
    this.theme = THEMES[theme];
    this.beat = 0;
    this.stopVoices('music');
  }

  setMusicPlaying(playing) {
    this.musicPlaying = playing;
    this.syncMusic();
  }

  syncMusic() {
    if (!this.musicPlaying || !this.enabled || !this.visible || this.context?.state !== 'running') {
      if (this.timer !== null) clearInterval(this.timer);
      this.timer = null;
      this.stopVoices('music');
      return;
    }
    if (this.timer !== null) return;
    this.nextNote = this.context.currentTime + .04;
    this.scheduleMusic();
    this.timer = setInterval(() => this.scheduleMusic(), 100);
  }

  scheduleMusic() {
    // Keep only a short look-ahead so pausing or muting never leaves a queued bar.
    const now = this.context.currentTime;
    if (this.nextNote < now) this.nextNote = now + .04;
    while (this.nextNote < now + .3) {
      const index = this.beat % this.theme.melody.length;
      const note = this.theme.melody[index];
      const delay = this.nextNote - now;
      if (note !== null) {
        this.tone(frequency(note), this.theme.step * 1.4, { type: this.theme.type, volume: .035, delay, kind: 'music' });
      }
      if (index % 8 === 0) {
        this.tone(frequency(this.theme.bass[index / 8]), this.theme.step * 6, { volume: .025, delay, kind: 'music' });
      }
      this.beat++;
      this.nextNote += this.theme.step;
    }
  }

  tone(freq, duration = .12, { type = 'sine', volume = .1, to, delay = 0, kind = 'effect', filter } = {}) {
    if (!this.enabled || !this.visible || this.context?.state !== 'running') return;
    const context = this.context;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    if (to) oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(.02, duration / 4));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    const nodes = [oscillator, gain];
    if (filter) {
      const band = context.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = filter.frequency;
      band.Q.value = filter.q;
      oscillator.connect(band).connect(gain);
      nodes.push(band);
    } else oscillator.connect(gain);
    gain.connect(this.master);
    const voice = { oscillator, gain, nodes, kind };
    this.voices.add(voice);
    oscillator.onended = () => {
      nodes.forEach((node) => node.disconnect());
      this.voices.delete(voice);
    };
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }

  stopVoices(kind) {
    if (!this.context) return;
    const now = this.context.currentTime;
    for (const voice of this.voices) {
      if (kind && voice.kind !== kind) continue;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0, now, .005);
      voice.oscillator.stop(now + .02);
    }
  }

  chime(notes = [659, 784, 1047], spacing = .1) {
    notes.forEach((freq, index) => this.tone(freq, .2, { type: 'triangle', volume: .1, delay: index * spacing }));
  }

  quack() {
    const pitch = 220 + Math.random() * 45;
    const count = Math.random() < .3 ? 3 : 2;
    for (let index = 0; index < count; index++) {
      this.tone(pitch - index * 12, .18 + Math.random() * .05, {
        type: 'sawtooth', to: 135 + Math.random() * 20, volume: .13, delay: index * .27,
        filter: { frequency: 1050 + Math.random() * 180, q: 2.5 }
      });
    }
  }
}

export function createGameAudio({ button, i18n, onEnabledChange = () => {}, ...options }) {
  const syncButton = (enabled) => {
    const label = enabled ? 'Tắt âm thanh' : 'Bật âm thanh';
    button.setAttribute('aria-pressed', String(enabled));
    if (i18n) {
      i18n.attr(button, 'aria-label', label);
      i18n.attr(button, 'title', label);
    } else {
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    button.querySelector('use').setAttribute('href', enabled ? '#icon-sound' : '#icon-muted');
  };
  const audio = new GameAudio({
    ...options,
    onEnabledChange: (enabled) => { syncButton(enabled); onEnabledChange(enabled); }
  });
  syncButton(audio.enabled);
  audio.setVisible(!document.hidden);
  const unlock = (event) => {
    if (event.target.closest?.('#sound-toggle')) return;
    if (event.type === 'keydown' && (event.repeat || event.ctrlKey || event.metaKey || event.altKey)) return;
    void audio.activate();
  };
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
  button.addEventListener('click', () => {
    audio.setEnabled(!audio.enabled);
    if (audio.enabled) void audio.activate();
  });
  document.addEventListener('visibilitychange', () => audio.setVisible(!document.hidden));
  window.addEventListener('pagehide', () => audio.setVisible(false));
  window.addEventListener('pageshow', () => audio.setVisible(!document.hidden));
  return audio;
}
