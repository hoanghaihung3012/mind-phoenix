import {
  SAFARI_THEMES,
  createMemoryBoard,
  isMatch,
} from './safari.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

const UI_TEXT = {
  vi: {
    back: 'Trò chơi',
    score: 'Điểm',
    level: 'Vòng',
    streak: 'Chuỗi',
    time: 'Thời gian',
    matched: 'Đã ghép',
    roundWin: 'Xuất Sắc! Ghép Đôi Thành Công!',
    nextRound: 'Vòng tiếp theo ➜',
    victory: '🏆 Vua Trí Nhớ Safari!',
    victoryDesc: 'Bạn đã hoàn thành xuất sắc tất cả các thử thách lật thẻ ghép đôi từ vựng!',
    replay: 'Chơi Lại',
    gameOver: 'Hết Giờ!',
    gameDesc: 'Hãy cố gắng nhớ vị trí các cặp thẻ để hoàn thành nhanh hơn nhé!',
  },
  en: {
    back: 'Games',
    score: 'Score',
    level: 'Round',
    streak: 'Streak',
    time: 'Time',
    matched: 'Matched',
    roundWin: 'Awesome! All Pairs Matched!',
    nextRound: 'Next Round ➜',
    victory: '🏆 Safari Memory Champion!',
    victoryDesc: 'You matched all English word and picture cards perfectly!',
    replay: 'Play Again',
    gameOver: "Time's Up!",
    gameDesc: 'Keep training your visual memory to match faster next time!',
  },
};

class MemorySafariGame {
  constructor() {
    this.currentThemeIndex = 0;
    this.board = [];
    this.flippedCards = [];
    this.matchedPairIds = new Set();
    this.lockBoard = false;

    this.score = 0;
    this.streak = 0;
    this.timeRemaining = 60;
    this.timerId = null;
    this.highScore = parseInt(localStorage.getItem('mind_phoenix_memory_high') || '0', 10);
    this.lang = 'vi';

    this.initDOM();
    this.initAudio();
    this.initI18n();
    this.startRound(0);
  }

  initDOM() {
    this.dom = {
      scoreVal: document.getElementById('score-val'),
      levelVal: document.getElementById('level-val'),
      streakVal: document.getElementById('streak-val'),
      timeVal: document.getElementById('time-val'),
      themeTitle: document.getElementById('theme-title'),
      matchedCount: document.getElementById('matched-count'),
      grid: document.getElementById('memory-grid'),
      soundBtn: document.getElementById('sound-toggle'),
      modal: document.getElementById('modal-overlay'),
      modalIcon: document.getElementById('modal-icon'),
      modalTitle: document.getElementById('modal-title'),
      modalDesc: document.getElementById('modal-desc'),
      modalScore: document.getElementById('modal-score'),
      modalBtn: document.getElementById('modal-btn'),
    };
  }

  initAudio() {
    try {
      this.audio = createGameAudio({
        button: this.dom.soundBtn,
        theme: 'orchard',
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

    const theme = SAFARI_THEMES[this.currentThemeIndex];
    if (theme) {
      this.dom.themeTitle.textContent = theme.title[this.lang] || theme.title.vi;
    }
  }

  startRound(idx) {
    if (idx >= SAFARI_THEMES.length) {
      this.showFinalVictory();
      return;
    }

    this.currentThemeIndex = idx;
    const theme = SAFARI_THEMES[idx];
    this.board = createMemoryBoard(theme);
    this.flippedCards = [];
    this.matchedPairIds = new Set();
    this.lockBoard = false;
    this.timeRemaining = 60;

    this.dom.levelVal.textContent = `${idx + 1}/${SAFARI_THEMES.length}`;
    this.updateStatsDOM();
    this.updateTexts();
    this.renderBoard();
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
    this.dom.matchedCount.textContent = `${this.matchedPairIds.size}/6`;
  }

  renderBoard() {
    this.dom.grid.innerHTML = '';
    this.board.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.dataset.id = card.cardId;

      const back = document.createElement('div');
      back.className = 'card-face card-back';
      back.textContent = '❓';

      const front = document.createElement('div');
      front.className = `card-face card-front is-${card.type}`;
      front.textContent = card.content;

      el.appendChild(back);
      el.appendChild(front);

      el.addEventListener('click', () => this.handleCardClick(card, el));
      this.dom.grid.appendChild(el);
    });
  }

  handleCardClick(card, el) {
    if (this.lockBoard) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');
    this.audio?.tone(480, 0.08, { type: 'sine', volume: 0.1 });
    this.flippedCards.push({ card, el });

    if (this.flippedCards.length === 2) {
      this.checkPair();
    }
  }

  checkPair() {
    this.lockBoard = true;
    const [c1, c2] = this.flippedCards;
    const match = isMatch(c1.card, c2.card);

    if (match) {
      this.streak++;
      const earned = 60 + this.streak * 15;
      this.score += earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mind_phoenix_memory_high', String(this.highScore));
      }

      this.matchedPairIds.add(c1.card.pairId);
      this.updateStatsDOM();
      this.audio?.chime([659, 880, 1047], 0.08);

      c1.el.classList.add('matched');
      c2.el.classList.add('matched');
      this.flippedCards = [];
      this.lockBoard = false;

      if (this.matchedPairIds.size === 6) {
        clearInterval(this.timerId);
        const t = UI_TEXT[this.lang] || UI_TEXT.vi;
        setTimeout(() => {
          this.showModal({
            icon: '🎉',
            title: t.roundWin,
            desc: `Điểm hiện tại: ${this.score}`,
            scoreText: `Chuỗi: x${this.streak}`,
            btnText: t.nextRound,
            onConfirm: () => {
              this.dom.modal.classList.remove('active');
              this.startRound(this.currentThemeIndex + 1);
            },
          });
        }, 400);
      }
    } else {
      this.streak = 0;
      this.updateStatsDOM();
      this.audio?.tone(200, 0.15, { type: 'triangle', volume: 0.1 });

      setTimeout(() => {
        c1.el.classList.remove('flipped');
        c2.el.classList.remove('flipped');
        this.flippedCards = [];
        this.lockBoard = false;
      }, 750);
    }
  }

  handleTimeout() {
    this.streak = 0;
    this.audio?.tone(140, 0.3, { type: 'sawtooth', volume: 0.15 });
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      icon: '⏰',
      title: t.gameOver,
      desc: t.gameDesc,
      scoreText: `${t.score}: ${this.score}`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.startRound(this.currentThemeIndex);
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
      desc: t.victoryDesc,
      scoreText: `Kỷ lục: ${this.highScore} · Điểm: ${this.score}`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.score = 0;
        this.streak = 0;
        this.startRound(0);
      },
    });
  }

  showModal({ icon, title, desc, scoreText, btnText, onConfirm }) {
    this.dom.modalIcon.textContent = icon;
    this.dom.modalTitle.textContent = title;
    this.dom.modalDesc.textContent = desc;
    this.dom.modalScore.textContent = scoreText;
    this.dom.modalBtn.textContent = btnText;
    this.dom.modalBtn.onclick = onConfirm;
    this.dom.modal.classList.add('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.memorySafariGame = new MemorySafariGame();
});
