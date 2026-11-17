/**
 * Nối Từ Siêu Tốc — Game Controller
 * Pure Vanilla JavaScript (ES Module)
 */

import {
  WORD_PAIRS,
  getHeadSyllable,
  getTailSyllable,
  generateStepOptions,
  isValidChainStep,
} from './noi-tu.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

const UI_TEXT = {
  vi: {
    back: 'Trò chơi',
    score: 'Điểm',
    chainLen: 'Độ dài xích',
    streak: 'Chuỗi chuẩn',
    time: 'Thời gian',
    promptHead: 'Nối tiếp với tiếng:',
    chainHistoryTitle: 'Sợi xích từ ngữ đang nối:',
    replay: 'Chơi Lại',
    gameOver: 'Hết Giờ!',
    gameOverDesc: 'Bạn đã nối được một chuỗi xích từ rất đáng khen!',
    victory: '🏆 Vua Nối Từ Tiếng Việt!',
    victoryDesc: 'Xuất sắc! Bạn đã nối thành công 15 từ liên tiếp mà không hề đứt đoạn!',
  },
  en: {
    back: 'Games',
    score: 'Score',
    chainLen: 'Chain Length',
    streak: 'Streak',
    time: 'Time',
    promptHead: 'Continue with syllable:',
    chainHistoryTitle: 'Current Word Chain:',
    replay: 'Play Again',
    gameOver: "Time's Up!",
    gameOverDesc: 'Great effort! You built an impressive Vietnamese word chain!',
    victory: '🏆 Word Chain Master!',
    victoryDesc: 'Incredible! You formed 15 chained words in a row without breaking!',
  },
};

// Starter words pool
const STARTER_WORDS = [
  'HOA MAI',
  'HỌC TẬP',
  'MẶT TRỜI',
  'TƯƠNG LAI',
  'ĐOÀN KẾT',
  'BÌNH MINH',
  'YÊU THƯƠNG',
  'THÀNH CÔNG',
];

class NoiTuGame {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.chain = [];
    this.currentWord = '';
    this.timeRemaining = 15;
    this.timerId = null;
    this.isBusy = false;
    this.lang = 'vi';

    this.initDOM();
    this.initAudio();
    this.initI18n();
    this.startGame();
  }

  initDOM() {
    this.dom = {
      scoreVal: document.getElementById('score-val'),
      chainLenVal: document.getElementById('chain-len-val'),
      streakVal: document.getElementById('streak-val'),
      timeVal: document.getElementById('time-val'),
      spotlightSyllable: document.getElementById('spotlight-syllable'),
      chainScroll: document.getElementById('chain-scroll'),
      optionsGrid: document.getElementById('options-grid'),
      soundBtn: document.getElementById('sound-toggle'),
      modal: document.getElementById('modal-overlay'),
      modalIcon: document.getElementById('modal-icon'),
      modalTitle: document.getElementById('modal-title'),
      modalDesc: document.getElementById('modal-desc'),
      modalScore: document.getElementById('modal-score'),
      modalBtn: document.getElementById('modal-btn'),
    };

    if (this.dom.modalBtn) {
      this.dom.modalBtn.addEventListener('click', () => {
        this.dom.modal.classList.remove('active');
        this.startGame();
      });
    }
  }

  initAudio() {
    try {
      this.audio = createGameAudio({
        button: this.dom.soundBtn,
        theme: 'arcade',
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
    this.score = 0;
    this.streak = 0;
    this.isBusy = false;
    clearInterval(this.timerId);

    // Pick random starter word
    const starter = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    this.chain = [starter];
    this.currentWord = starter;

    this.updateHUD();
    this.renderChainHistory();
    this.nextStep();
  }

  updateHUD() {
    if (this.dom.scoreVal) this.dom.scoreVal.textContent = this.score;
    if (this.dom.chainLenVal) this.dom.chainLenVal.textContent = this.chain.length;
    if (this.dom.streakVal) this.dom.streakVal.textContent = this.streak;
    if (this.dom.timeVal) this.dom.timeVal.textContent = `${this.timeRemaining}s`;
  }

  renderChainHistory() {
    if (!this.dom.chainScroll) return;
    this.dom.chainScroll.innerHTML = '';

    this.chain.forEach((word, idx) => {
      const isLast = idx === this.chain.length - 1;
      const span = document.createElement('span');
      span.className = `chain-item ${isLast ? 'active-current' : ''}`;
      span.textContent = word;
      this.dom.chainScroll.appendChild(span);

      if (!isLast) {
        const arrow = document.createElement('span');
        arrow.className = 'chain-arrow';
        arrow.textContent = '➜';
        this.dom.chainScroll.appendChild(arrow);
      }
    });

    // Auto-scroll to end of chain
    this.dom.chainScroll.scrollTo({
      left: this.dom.chainScroll.scrollWidth,
      behavior: 'smooth',
    });
  }

  nextStep() {
    if (this.chain.length >= 15) {
      this.showVictory();
      return;
    }

    const tail = getTailSyllable(this.currentWord);
    if (this.dom.spotlightSyllable) {
      this.dom.spotlightSyllable.textContent = tail;
    }

    const options = generateStepOptions(this.currentWord, WORD_PAIRS);
    if (!options || options.length === 0) {
      // If reached dead-end in dictionary, finish victory round
      this.showVictory();
      return;
    }

    this.renderOptions(options);
    this.timeRemaining = 15;
    this.startTimer();
  }

  renderOptions(options) {
    if (!this.dom.optionsGrid) return;
    this.dom.optionsGrid.innerHTML = '';

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.textContent = opt.text;

      btn.addEventListener('click', () => {
        if (this.isBusy) return;
        this.handleChoice(btn, opt);
      });

      this.dom.optionsGrid.appendChild(btn);
    });
  }

  handleChoice(btn, option) {
    this.isBusy = true;
    clearInterval(this.timerId);

    if (option.isCorrect) {
      btn.classList.add('is-correct-pick');
      if (this.audio) this.audio.play('correct');

      this.streak += 1;
      const points = 100 + this.streak * 20 + this.timeRemaining * 10;
      this.score += points;

      this.currentWord = option.text;
      this.chain.push(this.currentWord);

      this.updateHUD();
      this.renderChainHistory();

      setTimeout(() => {
        this.isBusy = false;
        this.nextStep();
      }, 700);
    } else {
      btn.classList.add('is-wrong-pick');
      if (this.audio) this.audio.play('incorrect');

      this.streak = 0;
      this.updateHUD();

      // Penalize time
      this.timeRemaining = Math.max(1, this.timeRemaining - 5);
      if (this.dom.timeVal) this.dom.timeVal.textContent = `${this.timeRemaining}s`;

      setTimeout(() => {
        btn.classList.remove('is-wrong-pick');
        this.isBusy = false;
        this.startTimer();
      }, 500);
    }
  }

  startTimer() {
    clearInterval(this.timerId);
    if (this.dom.timeVal) this.dom.timeVal.textContent = `${this.timeRemaining}s`;

    this.timerId = setInterval(() => {
      this.timeRemaining -= 1;
      if (this.dom.timeVal) this.dom.timeVal.textContent = `${this.timeRemaining}s`;

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerId);
        this.handleTimeout();
      }
    }, 1000);
  }

  handleTimeout() {
    this.isBusy = true;
    if (this.audio) this.audio.play('incorrect');

    const t = UI_TEXT[this.lang] || UI_TEXT.vi;
    this.dom.modalIcon.textContent = '⏰';
    this.dom.modalTitle.textContent = t.gameOver;
    this.dom.modalDesc.textContent = t.gameOverDesc;
    this.dom.modalScore.textContent = `${this.score} ${t.score} · ${this.chain.length} từ`;
    this.dom.modalBtn.textContent = t.replay;

    this.dom.modal.classList.add('active');
  }

  showVictory() {
    clearInterval(this.timerId);
    if (this.audio) this.audio.play('complete');

    const t = UI_TEXT[this.lang] || UI_TEXT.vi;
    this.dom.modalIcon.textContent = '🏆';
    this.dom.modalTitle.textContent = t.victory;
    this.dom.modalDesc.textContent = t.victoryDesc;
    this.dom.modalScore.textContent = `${this.score} ${t.score} · Hoàn thành ${this.chain.length} từ`;
    this.dom.modalBtn.textContent = t.replay;

    this.dom.modal.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NoiTuGame();
});
