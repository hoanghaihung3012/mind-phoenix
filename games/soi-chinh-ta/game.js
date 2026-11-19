import {
  SPELLING_BANK,
  getQuestionOptions,
  evaluateAnswer,
  shuffle,
} from './chinh-ta.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

const UI_TEXT = {
  vi: {
    back: 'Trò chơi',
    score: 'Điểm',
    level: 'Câu số',
    streak: 'Chuỗi',
    time: 'Thời gian',
    correct: 'Chính Xác! Soi Lỗi Chuẩn!',
    wrong: 'Tiếc Quá! Chưa Chính Xác!',
    next: 'Câu tiếp theo ➜',
    victory: '🏆 Bậc Thầy Chính Tả Tiếng Việt!',
    victoryDesc: 'Bạn đã xuất sắc vượt qua toàn bộ các thử thách phân biệt chính tả!',
    replay: 'Chơi Lại',
    gameOver: 'Hết Giờ!',
    gameDesc: 'Hãy thử lại để rèn luyện viết đúng chính tả tiếng Việt nhé!',
  },
  en: {
    back: 'Games',
    score: 'Score',
    level: 'Question',
    streak: 'Streak',
    time: 'Time',
    correct: 'Correct! Spot on!',
    wrong: 'Oops! Incorrect spelling!',
    next: 'Next Question ➜',
    victory: '🏆 Vietnamese Orthography Master!',
    victoryDesc: 'You conquered all Vietnamese spelling rules and nuances!',
    replay: 'Play Again',
    gameOver: "Time's Up!",
    gameDesc: 'Keep training to master proper Vietnamese spelling rules!',
  },
};

class SoiChinhTaGame {
  constructor() {
    this.deck = [];
    this.currentIndex = 0;
    this.currentItem = null;

    this.score = 0;
    this.streak = 0;
    this.timeRemaining = 25;
    this.timerId = null;
    this.highScore = parseInt(localStorage.getItem('mind_phoenix_chinhta_high') || '0', 10);
    this.lang = 'vi';

    this.initDOM();
    this.initAudio();
    this.initI18n();
    this.startGame();
  }

  initDOM() {
    this.dom = {
      scoreVal: document.getElementById('score-val'),
      levelVal: document.getElementById('level-val'),
      streakVal: document.getElementById('streak-val'),
      timeVal: document.getElementById('time-val'),
      rulePill: document.getElementById('rule-pill'),
      sentencePrompt: document.getElementById('sentence-prompt'),
      optionsBox: document.getElementById('options-container'),
      soundBtn: document.getElementById('sound-toggle'),
      modal: document.getElementById('modal-overlay'),
      modalIcon: document.getElementById('modal-icon'),
      modalTitle: document.getElementById('modal-title'),
      modalExplanation: document.getElementById('modal-explanation'),
      modalScore: document.getElementById('modal-score'),
      modalBtn: document.getElementById('modal-btn'),
    };
  }

  initAudio() {
    try {
      this.audio = createGameAudio({
        button: this.dom.soundBtn,
        theme: 'puzzle',
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
  }

  startGame() {
    this.deck = shuffle(SPELLING_BANK);
    this.currentIndex = 0;
    this.loadQuestion();
  }

  loadQuestion() {
    if (this.currentIndex >= this.deck.length) {
      this.showFinalVictory();
      return;
    }

    this.currentItem = this.deck[this.currentIndex];
    this.timeRemaining = 25;

    this.dom.rulePill.textContent = `Quy tắc: ${this.currentItem.rule}`;
    this.dom.sentencePrompt.textContent = this.currentItem.sentence;
    this.dom.levelVal.textContent = `${this.currentIndex + 1}/${this.deck.length}`;

    this.updateStatsDOM();
    this.renderOptions();
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

  renderOptions() {
    this.dom.optionsBox.innerHTML = '';
    const options = getQuestionOptions(this.currentItem);

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => this.handlePick(opt, btn));
      this.dom.optionsBox.appendChild(btn);
    });
  }

  handlePick(opt, btn) {
    clearInterval(this.timerId);

    const result = evaluateAnswer({
      isCorrect: opt.isCorrect,
      timeRemaining: this.timeRemaining,
      streak: this.streak,
    });

    if (opt.isCorrect) {
      this.streak++;
      this.score += result.earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mind_phoenix_chinhta_high', String(this.highScore));
        try { window.MindPhoenixAnalytics?.trackScore('soi-chinh-ta', 'Soi Lỗi Chính Tả', this.score); } catch {}
      }

      this.updateStatsDOM();
      this.audio?.chime([523, 659, 784, 1047], 0.09);
      btn.classList.add('is-correct-pick');

      const t = UI_TEXT[this.lang] || UI_TEXT.vi;
      setTimeout(() => {
        this.showModal({
          icon: '🎉',
          title: t.correct,
          explanation: this.currentItem.explanation,
          scoreText: `+${result.earned} ${t.score} (Chuỗi x${this.streak})`,
          btnText: t.next,
          onConfirm: () => {
            this.dom.modal.classList.remove('active');
            this.currentIndex++;
            this.loadQuestion();
          },
        });
      }, 350);
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score + result.earned);
      this.updateStatsDOM();
      this.audio?.tone(150, 0.25, { type: 'sawtooth', volume: 0.12 });
      btn.classList.add('is-wrong-pick');

      const t = UI_TEXT[this.lang] || UI_TEXT.vi;
      setTimeout(() => {
        this.showModal({
          icon: '💡',
          title: t.wrong,
          explanation: this.currentItem.explanation,
          scoreText: `${result.earned} ${t.score}`,
          btnText: t.next,
          onConfirm: () => {
            this.dom.modal.classList.remove('active');
            this.currentIndex++;
            this.loadQuestion();
          },
        });
      }, 450);
    }
  }

  handleTimeout() {
    this.streak = 0;
    this.audio?.tone(140, 0.3, { type: 'sawtooth', volume: 0.15 });
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      icon: '⏰',
      title: t.gameOver,
      explanation: this.currentItem.explanation,
      scoreText: `Đáp án đúng là: "${this.currentItem.correct}"`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.loadQuestion();
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
      explanation: t.victoryDesc,
      scoreText: `Tổng điểm: ${this.score} · Kỷ lục: ${this.highScore}`,
      btnText: t.replay,
      onConfirm: () => {
        this.dom.modal.classList.remove('active');
        this.score = 0;
        this.streak = 0;
        this.startGame();
      },
    });
  }

  showModal({ icon, title, explanation, scoreText, btnText, onConfirm }) {
    this.dom.modalIcon.textContent = icon;
    this.dom.modalTitle.textContent = title;
    this.dom.modalExplanation.textContent = explanation;
    this.dom.modalScore.textContent = scoreText;
    this.dom.modalBtn.textContent = btnText;
    this.dom.modalBtn.onclick = onConfirm;
    this.dom.modal.classList.add('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.soiChinhTaGame = new SoiChinhTaGame();
});
