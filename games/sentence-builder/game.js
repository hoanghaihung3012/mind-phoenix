import {
  SENTENCE_DECK,
  createSentenceTokens,
  checkSentence,
  shuffle,
} from './builder.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

const UI_TEXT = {
  vi: {
    back: 'Trò chơi',
    score: 'Điểm',
    level: 'Câu số',
    streak: 'Chuỗi',
    time: 'Thời gian',
    undo: 'Xóa lùi',
    reset: 'Đặt lại',
    launch: '🚀 Phóng Tên Lửa (Kiểm Tra)',
    correct: 'Chính Xác! Phóng Thành Công!',
    next: 'Khám phá tiếp ➜',
    victory: '🌟 Phi Hành Gia Ngữ Pháp!',
    victoryDesc: 'Bạn đã hoàn thành xuất sắc tất cả các thử thách ghép câu tiếng Anh!',
    replay: 'Chơi Lại',
    gameOver: 'Hết Giờ!',
    gameDesc: 'Hãy sắp xếp lại để phóng tên lửa bay xa hơn nhé!',
  },
  en: {
    back: 'Games',
    score: 'Score',
    level: 'Sentence',
    streak: 'Streak',
    time: 'Time',
    undo: 'Undo',
    reset: 'Reset',
    launch: '🚀 Launch Rocket (Check)',
    correct: 'Correct! Perfect Launch!',
    next: 'Next Orbit ➜',
    victory: '🌟 Master of Grammar!',
    victoryDesc: 'You mastered all English sentence structure challenges!',
    replay: 'Play Again',
    gameOver: "Time's Up!",
    gameDesc: 'Keep trying to launch your grammar rocket to space!',
  },
};

class SentenceBuilderGame {
  constructor() {
    this.deck = [];
    this.currentIndex = 0;
    this.currentItem = null;

    this.allTokens = [];
    this.selectedTokens = [];
    this.availableTokens = [];

    this.score = 0;
    this.streak = 0;
    this.timeRemaining = 45;
    this.timerId = null;
    this.highScore = parseInt(localStorage.getItem('mind_phoenix_sentence_high') || '0', 10);
    this.lang = 'vi';

    this.initDOM();
    this.initAudio();
    this.initI18n();
    this.bindEvents();
    this.startGame();
  }

  initDOM() {
    this.dom = {
      scoreVal: document.getElementById('score-val'),
      levelVal: document.getElementById('level-val'),
      streakVal: document.getElementById('streak-val'),
      timeVal: document.getElementById('time-val'),
      missionTranslation: document.getElementById('mission-translation'),
      missionHint: document.getElementById('mission-hint'),
      track: document.getElementById('launch-track'),
      pool: document.getElementById('pool-container'),
      undoBtn: document.getElementById('btn-undo'),
      resetBtn: document.getElementById('btn-reset'),
      launchBtn: document.getElementById('btn-launch'),
      soundBtn: document.getElementById('sound-toggle'),
      modal: document.getElementById('modal-overlay'),
      modalIcon: document.getElementById('modal-icon'),
      modalTitle: document.getElementById('modal-title'),
      modalSentence: document.getElementById('modal-sentence'),
      modalTranslation: document.getElementById('modal-translation'),
      modalScore: document.getElementById('modal-score'),
      modalBtn: document.getElementById('modal-btn'),
    };
  }

  initAudio() {
    try {
      this.audio = createGameAudio({
        button: this.dom.soundBtn,
        theme: 'sky',
      });
    } catch {
      this.audio = null;
    }
  }

  initI18n() {
    try {
      this.i18n = initGameLanguage();
      this.i18n.onChange(() => {
        this.lang = this.i18n.lang || 'vi';
        this.updateTexts();
      });
      this.lang = this.i18n.lang || 'vi';
    } catch {
      this.lang = 'vi';
    }
    this.updateTexts();
  }

  updateTexts() {
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (t[k]) el.textContent = t[k];
    });

    if (this.currentItem) {
      this.dom.missionTranslation.textContent = this.currentItem.translation;
      this.dom.missionHint.textContent = `💡 ${this.currentItem.hint}`;
    }
  }

  startGame() {
    this.deck = shuffle(SENTENCE_DECK);
    this.currentIndex = 0;
    this.loadSentence();
  }

  loadSentence() {
    if (this.currentIndex >= this.deck.length) {
      this.showFinalVictory();
      return;
    }

    this.currentItem = this.deck[this.currentIndex];
    this.timeRemaining = 45;

    this.allTokens = createSentenceTokens(this.currentItem);
    this.availableTokens = [...this.allTokens];
    this.selectedTokens = [];

    this.dom.levelVal.textContent = `${this.currentIndex + 1}/${this.deck.length}`;
    this.updateStatsDOM();
    this.updateTexts();
    this.renderTrack();
    this.renderPool();
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timerId);
    this.dom.timeVal.textContent = `${this.timeRemaining}s`;

    this.timerId = setInterval(() => {
      this.timeRemaining--;
      this.dom.timeVal.textContent = `${this.timeRemaining}s`;

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerId);
        this.handleTimeout();
      }
    }, 1000);
  }

  updateStatsDOM() {
    this.dom.scoreVal.textContent = this.score;
    this.dom.streakVal.textContent = this.streak > 0 ? `🔥 ${this.streak}` : '0';
  }

  selectToken(token) {
    const idx = this.availableTokens.findIndex(t => t.id === token.id);
    if (idx === -1) return;

    this.availableTokens.splice(idx, 1);
    this.selectedTokens.push(token);
    this.audio?.tone(450 + this.selectedTokens.length * 30, 0.08, { type: 'sine', volume: 0.1 });

    this.renderTrack();
    this.renderPool();
  }

  unselectToken(token) {
    const idx = this.selectedTokens.findIndex(t => t.id === token.id);
    if (idx === -1) return;

    this.selectedTokens.splice(idx, 1);
    this.availableTokens.push(token);
    this.audio?.tone(380, 0.08, { type: 'sine', volume: 0.1 });

    this.renderTrack();
    this.renderPool();
  }

  undo() {
    if (this.selectedTokens.length === 0) return;
    const last = this.selectedTokens.pop();
    this.availableTokens.push(last);
    this.audio?.tone(360, 0.08, { type: 'sine', volume: 0.1 });
    this.renderTrack();
    this.renderPool();
  }

  reset() {
    if (this.selectedTokens.length === 0) return;
    this.availableTokens = [...this.allTokens];
    this.selectedTokens = [];
    this.audio?.tone(340, 0.08, { type: 'sine', volume: 0.1 });
    this.renderTrack();
    this.renderPool();
  }

  checkAnswer() {
    if (this.selectedTokens.length === 0) return;

    const isCorrect = checkSentence(this.selectedTokens, this.currentItem.sentence);

    if (isCorrect) {
      clearInterval(this.timerId);
      this.streak++;
      const earned = Math.max(40, 120 + Math.floor(this.timeRemaining * 3) + this.streak * 20);
      this.score += earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mind_phoenix_sentence_high', String(this.highScore));
      }

      this.audio?.chime([440, 554, 659, 880], 0.1);
      this.updateStatsDOM();

      const t = UI_TEXT[this.lang] || UI_TEXT.vi;
      setTimeout(() => {
        this.showModal({
          icon: '🚀',
          title: t.correct,
          sentence: this.currentItem.sentence,
          translation: this.currentItem.translation,
          scoreText: `+${earned} ${t.score} (Chuỗi x${this.streak})`,
          btnText: t.next,
          onConfirm: () => {
            this.dom.modal.classList.remove('active');
            this.currentIndex++;
            this.loadSentence();
          },
        });
      }, 350);
    } else {
      this.audio?.tone(150, 0.25, { type: 'sawtooth', volume: 0.12 });
      this.dom.track.classList.add('error-shake');
      setTimeout(() => this.dom.track.classList.remove('error-shake'), 450);
    }
  }

  handleTimeout() {
    this.streak = 0;
    this.audio?.tone(140, 0.3, { type: 'sawtooth', volume: 0.15 });
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      icon: '⏰',
      title: t.gameOver,
      sentence: this.currentItem.sentence,
      translation: this.currentItem.translation,
      scoreText: `${t.score}: ${this.score}`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.loadSentence();
      },
    });
  }

  showFinalVictory() {
    clearInterval(this.timerId);
    this.audio?.chime([523, 659, 784, 987, 1047, 1318], 0.12);
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      icon: '🌌',
      title: t.victory,
      sentence: `Tổng điểm: ${this.score}`,
      translation: t.victoryDesc,
      scoreText: `Kỷ lục: ${this.highScore}`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.score = 0;
        this.streak = 0;
        this.startGame();
      },
    });
  }

  showModal({ icon, title, sentence, translation, scoreText, btnText, onConfirm }) {
    this.dom.modalIcon.textContent = icon;
    this.dom.modalTitle.textContent = title;
    this.dom.modalSentence.textContent = sentence;
    this.dom.modalTranslation.textContent = translation;
    this.dom.modalScore.textContent = scoreText;
    this.dom.modalBtn.textContent = btnText;
    this.dom.modalBtn.onclick = onConfirm;
    this.dom.modal.classList.add('active');
  }

  renderTrack() {
    this.dom.track.innerHTML = '';
    this.selectedTokens.forEach((token) => {
      const btn = document.createElement('button');
      btn.className = 'word-pill in-track';
      btn.textContent = token.text;
      btn.title = 'Bấm để gỡ ra';
      btn.addEventListener('click', () => this.unselectToken(token));
      this.dom.track.appendChild(btn);
    });

    this.dom.undoBtn.disabled = this.selectedTokens.length === 0;
    this.dom.resetBtn.disabled = this.selectedTokens.length === 0;
    this.dom.launchBtn.disabled = this.selectedTokens.length === 0;
  }

  renderPool() {
    this.dom.pool.innerHTML = '';
    this.availableTokens.forEach((token) => {
      const btn = document.createElement('button');
      btn.className = 'word-pill';
      btn.textContent = token.text;
      btn.addEventListener('click', () => this.selectToken(token));
      this.dom.pool.appendChild(btn);
    });
  }

  bindEvents() {
    this.dom.undoBtn.addEventListener('click', () => this.undo());
    this.dom.resetBtn.addEventListener('click', () => this.reset());
    this.dom.launchBtn.addEventListener('click', () => this.checkAnswer());

    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        this.undo();
      } else if (e.key === 'Enter') {
        if (this.dom.modal.classList.contains('active')) {
          this.dom.modalBtn.click();
        } else {
          this.checkAnswer();
        }
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.sentenceBuilderGame = new SentenceBuilderGame();
});
