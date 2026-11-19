import {
  THEMES,
  generateRoundBalloons,
  calculatePopScore,
  isRoundCleared,
} from './pop.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

const UI_TEXT = {
  vi: {
    back: 'Trò chơi',
    score: 'Điểm',
    level: 'Vòng',
    streak: 'Chuỗi',
    time: 'Thời gian',
    remaining: 'Còn lại',
    roundWin: 'Xuất Sắc! Hoàn Thành Vòng!',
    nextRound: 'Vòng tiếp theo ➜',
    finalWin: '🎉 Chúc Mừng! Nhà Thám Hiểm Từ Vựng!',
    finalDesc: 'Bạn đã hoàn thành xuất sắc toàn bộ các chủ đề từ vựng tiếng Anh!',
    replay: 'Chơi Lại',
    gameOver: 'Hết Giờ!',
    gameDesc: 'Đừng nản lòng, hãy thử lại để bắn trúng thật nhiều từ vựng nhé!',
  },
  en: {
    back: 'Games',
    score: 'Score',
    level: 'Round',
    streak: 'Streak',
    time: 'Time',
    remaining: 'Remaining',
    roundWin: 'Awesome! Round Cleared!',
    nextRound: 'Next Round ➜',
    finalWin: '🎉 Congratulations! Word Explorer!',
    finalDesc: 'You conquered all English vocabulary challenge themes!',
    replay: 'Play Again',
    gameOver: "Time's Up!",
    gameDesc: 'Keep trying to pop all target English words!',
  },
};

class WordPopGame {
  constructor() {
    this.currentThemeIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.highScore = parseInt(localStorage.getItem('mind_phoenix_wordpop_high') || '0', 10);
    this.timeRemaining = 45;
    this.timerId = null;
    this.balloons = [];
    this.remainingCorrect = 0;
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
      targetIcon: document.getElementById('target-icon'),
      targetTitle: document.getElementById('target-title'),
      targetPrompt: document.getElementById('target-prompt'),
      remainingCount: document.getElementById('remaining-count'),
      playfield: document.getElementById('playfield'),
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

    const theme = THEMES[this.currentThemeIndex];
    if (theme) {
      this.dom.targetTitle.textContent = theme.title[this.lang] || theme.title.vi;
      this.dom.targetPrompt.textContent = theme.target[this.lang] || theme.target.vi;
    }
  }

  startRound(idx) {
    if (idx >= THEMES.length) {
      this.showFinalVictory();
      return;
    }

    this.currentThemeIndex = idx;
    const theme = THEMES[idx];
    this.timeRemaining = 45;
    this.balloons = generateRoundBalloons(theme, 12);
    this.remainingCorrect = this.balloons.filter(b => b.isCorrect).length;

    this.dom.targetIcon.textContent = theme.icon;
    this.dom.levelVal.textContent = `${idx + 1}/${THEMES.length}`;
    this.updateStatsDOM();
    this.updateTexts();
    this.renderBalloons();
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
    this.dom.remainingCount.textContent = this.remainingCorrect;
  }

  renderBalloons() {
    this.dom.playfield.innerHTML = '';

    this.balloons.forEach((b) => {
      const el = document.createElement('button');
      el.className = 'balloon';
      el.textContent = b.word;
      el.style.backgroundColor = b.color;
      el.style.animationDelay = `${(Math.random() * 2).toFixed(2)}s`;

      el.addEventListener('click', () => this.handleBalloonClick(b, el));
      this.dom.playfield.appendChild(el);
    });
  }

  handleBalloonClick(item, el) {
    if (el.classList.contains('popped')) return;

    if (item.isCorrect) {
      this.streak++;
      const { earned } = calculatePopScore({ isCorrect: true, streak: this.streak });
      this.score += earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mind_phoenix_wordpop_high', String(this.highScore));
        try { window.MindPhoenixAnalytics?.trackScore('word-pop', 'Word Pop', this.score); } catch {}
      }

      this.remainingCorrect--;
      this.updateStatsDOM();
      this.audio?.tone(600 + Math.random() * 200, 0.08, { type: 'sine', volume: 0.12 });

      el.classList.add('popped');

      if (isRoundCleared(this.remainingCorrect)) {
        clearInterval(this.timerId);
        this.audio?.chime([523, 659, 784, 1047], 0.1);
        const t = UI_TEXT[this.lang] || UI_TEXT.vi;
        setTimeout(() => {
          this.showModal({
            icon: '🎈',
            title: t.roundWin,
            desc: `Điểm hiện tại: ${this.score}`,
            scoreText: `Chuỗi: x${this.streak}`,
            btnText: t.nextRound,
            onConfirm: () => {
              this.dom.modal.classList.remove('active');
              this.startRound(this.currentThemeIndex + 1);
            },
          });
        }, 350);
      }
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 25);
      this.updateStatsDOM();
      this.audio?.tone(160, 0.2, { type: 'sawtooth', volume: 0.1 });
      el.classList.add('wrong-shake');
      setTimeout(() => el.classList.remove('wrong-shake'), 450);
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
      title: t.finalWin,
      desc: t.finalDesc,
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
  window.wordPopGame = new WordPopGame();
});
