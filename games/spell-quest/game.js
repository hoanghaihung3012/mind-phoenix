import {
  SPELL_WORDS,
  createLetterTiles,
  checkSpelling,
  getNextTileHint,
  shuffle,
} from './quest.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

const UI_TEXT = {
  vi: {
    back: 'Trò chơi',
    score: 'Điểm',
    level: 'Từ số',
    streak: 'Chuỗi',
    time: 'Thời gian',
    undo: 'Xóa lùi',
    reset: 'Đặt lại',
    hint: 'Gợi ý (-20đ)',
    correct: 'Chính Xác! Tuyệt Vời!',
    next: 'Từ tiếp theo ➜',
    victory: '🏆 Vua Đánh Vần Tiếng Anh!',
    victoryDesc: 'Bạn đã hoàn thành xuất sắc toàn bộ thử thách đánh vần từ vựng!',
    replay: 'Chơi Lại',
    gameOver: 'Hết Giờ!',
    gameDesc: 'Cố lên nào, hãy thử lại để rèn luyện trí nhớ từ vựng nhé!',
  },
  en: {
    back: 'Games',
    score: 'Score',
    level: 'Word',
    streak: 'Streak',
    time: 'Time',
    undo: 'Undo',
    reset: 'Reset',
    hint: 'Hint (-20pts)',
    correct: 'Correct! Brilliant!',
    next: 'Next Word ➜',
    victory: '🏆 Master of English Spelling!',
    victoryDesc: 'You conquered all English spelling vocabulary challenges!',
    replay: 'Play Again',
    gameOver: "Time's Up!",
    gameDesc: 'Keep practicing to master your English spelling reflexes!',
  },
};

class SpellQuestGame {
  constructor() {
    this.wordsQueue = [];
    this.currentIndex = 0;
    this.currentWord = null;

    this.allTiles = [];
    this.selectedTiles = [];
    this.availableTiles = [];

    this.score = 0;
    this.streak = 0;
    this.hintsUsed = 0;
    this.timeRemaining = 40;
    this.timerId = null;
    this.highScore = parseInt(localStorage.getItem('mind_phoenix_spellquest_high') || '0', 10);
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
      clueIcon: document.getElementById('clue-icon'),
      clueHint: document.getElementById('clue-hint'),
      tray: document.getElementById('tray-box'),
      pool: document.getElementById('pool-box'),
      undoBtn: document.getElementById('btn-undo'),
      resetBtn: document.getElementById('btn-reset'),
      hintBtn: document.getElementById('btn-hint'),
      soundBtn: document.getElementById('sound-toggle'),
      modal: document.getElementById('modal-overlay'),
      modalIcon: document.getElementById('modal-icon'),
      modalTitle: document.getElementById('modal-title'),
      modalWord: document.getElementById('modal-word'),
      modalMeaning: document.getElementById('modal-meaning'),
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

    if (this.currentWord) {
      this.dom.clueHint.textContent = this.currentWord.hint[this.lang] || this.currentWord.hint.vi;
    }
  }

  startGame() {
    this.wordsQueue = shuffle(SPELL_WORDS);
    this.currentIndex = 0;
    this.loadWord();
  }

  loadWord() {
    if (this.currentIndex >= this.wordsQueue.length) {
      this.showFinalVictory();
      return;
    }

    this.currentWord = this.wordsQueue[this.currentIndex];
    this.hintsUsed = 0;
    this.timeRemaining = 40;

    this.allTiles = createLetterTiles(this.currentWord.word);
    this.availableTiles = [...this.allTiles];
    this.selectedTiles = [];

    this.dom.clueIcon.textContent = this.currentWord.icon;
    this.dom.levelVal.textContent = `${this.currentIndex + 1}/${this.wordsQueue.length}`;
    this.updateStatsDOM();
    this.updateTexts();
    this.renderTray();
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

  selectTile(tile) {
    const idx = this.availableTiles.findIndex(t => t.id === tile.id);
    if (idx === -1) return;

    this.availableTiles.splice(idx, 1);
    this.selectedTiles.push(tile);
    this.audio?.tone(520 + this.selectedTiles.length * 40, 0.08, { type: 'sine', volume: 0.1 });

    this.renderTray();
    this.renderPool();

    if (this.availableTiles.length === 0) {
      this.checkAnswer();
    }
  }

  unselectTile(tile) {
    const idx = this.selectedTiles.findIndex(t => t.id === tile.id);
    if (idx === -1) return;

    this.selectedTiles.splice(idx, 1);
    this.availableTiles.push(tile);
    this.audio?.tone(420, 0.08, { type: 'sine', volume: 0.1 });

    this.renderTray();
    this.renderPool();
  }

  undo() {
    if (this.selectedTiles.length === 0) return;
    const last = this.selectedTiles.pop();
    this.availableTiles.push(last);
    this.audio?.tone(400, 0.08, { type: 'sine', volume: 0.1 });
    this.renderTray();
    this.renderPool();
  }

  reset() {
    if (this.selectedTiles.length === 0) return;
    this.availableTiles = [...this.allTiles];
    this.selectedTiles = [];
    this.audio?.tone(380, 0.08, { type: 'sine', volume: 0.1 });
    this.renderTray();
    this.renderPool();
  }

  giveHint() {
    const nextTile = getNextTileHint(this.availableTiles, this.selectedTiles, this.currentWord.word);
    if (!nextTile) {
      this.reset();
      const first = getNextTileHint(this.availableTiles, [], this.currentWord.word);
      if (first) {
        this.hintsUsed++;
        this.selectTile(first);
      }
      return;
    }
    this.hintsUsed++;
    this.selectTile(nextTile);
  }

  checkAnswer() {
    const isCorrect = checkSpelling(this.selectedTiles, this.currentWord.word);

    if (isCorrect) {
      clearInterval(this.timerId);
      this.streak++;
      const earned = Math.max(30, 100 + Math.floor(this.timeRemaining * 3) + this.streak * 15 - this.hintsUsed * 20);
      this.score += earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mind_phoenix_spellquest_high', String(this.highScore));
      }

      this.audio?.chime([523, 659, 784, 1047], 0.1);
      this.updateStatsDOM();

      const t = UI_TEXT[this.lang] || UI_TEXT.vi;
      setTimeout(() => {
        this.showModal({
          icon: '✨',
          title: t.correct,
          word: this.currentWord.word,
          meaning: this.currentWord.hint[this.lang] || this.currentWord.hint.vi,
          scoreText: `+${earned} ${t.score} (Chuỗi x${this.streak})`,
          btnText: t.next,
          onConfirm: () => {
            this.dom.modal.classList.remove('active');
            this.currentIndex++;
            this.loadWord();
          },
        });
      }, 350);
    } else {
      this.audio?.tone(150, 0.25, { type: 'sawtooth', volume: 0.12 });
      this.dom.tray.classList.add('error-shake');
      setTimeout(() => this.dom.tray.classList.remove('error-shake'), 450);
    }
  }

  handleTimeout() {
    this.streak = 0;
    this.audio?.tone(140, 0.3, { type: 'sawtooth', volume: 0.15 });
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      icon: '⏰',
      title: t.gameOver,
      word: this.currentWord.word,
      meaning: this.currentWord.hint[this.lang] || this.currentWord.hint.vi,
      scoreText: `${t.score}: ${this.score}`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.loadWord();
      },
    });
  }

  showFinalVictory() {
    clearInterval(this.timerId);
    this.audio?.chime([523, 659, 784, 987, 1047, 1318], 0.12);
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      icon: '🏆',
      title: t.victory,
      word: `Điểm: ${this.score}`,
      meaning: t.victoryDesc,
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

  showModal({ icon, title, word, meaning, scoreText, btnText, onConfirm }) {
    this.dom.modalIcon.textContent = icon;
    this.dom.modalTitle.textContent = title;
    this.dom.modalWord.textContent = word;
    this.dom.modalMeaning.textContent = meaning;
    this.dom.modalScore.textContent = scoreText;
    this.dom.modalBtn.textContent = btnText;
    this.dom.modalBtn.onclick = onConfirm;
    this.dom.modal.classList.add('active');
  }

  renderTray() {
    this.dom.tray.innerHTML = '';
    this.selectedTiles.forEach((tile) => {
      const btn = document.createElement('button');
      btn.className = 'letter-tile selected';
      btn.textContent = tile.char;
      btn.addEventListener('click', () => this.unselectTile(tile));
      this.dom.tray.appendChild(btn);
    });

    this.dom.undoBtn.disabled = this.selectedTiles.length === 0;
    this.dom.resetBtn.disabled = this.selectedTiles.length === 0;
  }

  renderPool() {
    this.dom.pool.innerHTML = '';
    this.availableTiles.forEach((tile) => {
      const btn = document.createElement('button');
      btn.className = 'letter-tile';
      btn.textContent = tile.char;
      btn.addEventListener('click', () => this.selectTile(tile));
      this.dom.pool.appendChild(btn);
    });
  }

  bindEvents() {
    this.dom.undoBtn.addEventListener('click', () => this.undo());
    this.dom.resetBtn.addEventListener('click', () => this.reset());
    this.dom.hintBtn.addEventListener('click', () => this.giveHint());

    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        this.undo();
      } else if (e.key === 'Enter') {
        if (this.dom.modal.classList.contains('active')) {
          this.dom.modalBtn.click();
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const char = e.key.toUpperCase();
        const found = this.availableTiles.find(t => t.char === char);
        if (found) this.selectTile(found);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.spellQuestGame = new SpellQuestGame();
});
