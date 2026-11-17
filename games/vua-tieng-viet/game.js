import {
  WORD_BANK,
  LEVELS,
  createScrambleTokens,
  checkAnswer,
  getNextHintToken,
  calculateQuestionScore,
  getQuestionsForLevel,
  normalizeVietnamese,
} from './vua.mjs';
import { createGameAudio } from '../audio.mjs';
import { initGameLanguage } from '../i18n.mjs';

// Localized strings
const UI_TEXT = {
  vi: {
    back: 'Trang chủ',
    title: 'Vua Tiếng Việt',
    score: 'Điểm',
    level: 'Ải',
    streak: 'Chuỗi',
    time: 'Thời gian',
    clueDefault: '💡 Sắp xếp các chữ/tiếng bên dưới thành từ hoặc thành ngữ có nghĩa.',
    trayPlaceholder: 'Bấm vào các ô chữ bên dưới để xếp vào khay...',
    trayLabel: 'Khay ghép từ của bạn:',
    undoBtn: 'Xóa lùi',
    resetBtn: 'Đặt lại',
    hintBtn: 'Gợi ý (-30đ)',
    submitBtn: 'Kiểm tra',
    shuffleBtn: 'Xáo lại',
    correctTitle: 'Chính Xác! Xuất Sắc!',
    nextBtn: 'Câu tiếp theo ➜',
    victoryTitle: '👑 VINH DANH VUA TIẾNG VIỆT!',
    victoryDesc: 'Bạn đã xuất sắc vượt qua toàn bộ các ải và chứng tỏ tài năng tiếng Việt phi phàm!',
    replayBtn: 'Chơi Lại',
    gameOverTitle: 'Hết Giờ Rồi!',
    gameOverDesc: 'Hãy thử lại để chinh phục danh hiệu Vua Tiếng Việt nhé!',
  },
  en: {
    back: 'Home',
    title: 'Word Master',
    score: 'Score',
    level: 'Level',
    streak: 'Streak',
    time: 'Time',
    clueDefault: '💡 Arrange the tiles below into a meaningful Vietnamese word or idiom.',
    trayPlaceholder: 'Click tiles below to place into your tray...',
    trayLabel: 'Your answer tray:',
    undoBtn: 'Undo',
    resetBtn: 'Reset',
    hintBtn: 'Hint (-30pts)',
    submitBtn: 'Check',
    shuffleBtn: 'Shuffle',
    correctTitle: 'Correct! Brilliant!',
    nextBtn: 'Next Puzzle ➜',
    victoryTitle: '👑 CROWNED WORD MASTER!',
    victoryDesc: 'You conquered all levels and mastered Vietnamese language wisdom!',
    replayBtn: 'Play Again',
    gameOverTitle: "Time's Up!",
    gameOverDesc: 'Try again to conquer the title of Vietnamese Word Master!',
  },
};

class VuaTiengVietGame {
  constructor() {
    this.currentLevelIndex = 0;
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.currentQuestion = null;

    this.allTokens = [];
    this.selectedTokens = [];
    this.availableTokens = [];

    this.score = 0;
    this.streak = 0;
    this.hintsUsed = 0;
    this.timeRemaining = 45;
    this.timerId = null;
    this.highScore = parseInt(localStorage.getItem('mind_phoenix_vua_highscore') || '0', 10);

    this.lang = 'vi';
    this.initDOM();
    this.initAudio();
    this.initI18n();
    this.bindEvents();
    this.startLevel(0);
  }

  initDOM() {
    this.dom = {
      scoreVal: document.getElementById('score-val'),
      levelVal: document.getElementById('level-val'),
      streakVal: document.getElementById('streak-val'),
      timeVal: document.getElementById('time-val'),
      categoryBadge: document.getElementById('category-badge'),
      levelTitle: document.getElementById('level-title'),
      clueText: document.getElementById('clue-text'),
      tray: document.getElementById('tray-container'),
      pool: document.getElementById('pool-container'),
      undoBtn: document.getElementById('btn-undo'),
      resetBtn: document.getElementById('btn-reset'),
      hintBtn: document.getElementById('btn-hint'),
      submitBtn: document.getElementById('btn-submit'),
      soundBtn: document.getElementById('sound-toggle'),
      langBtn: document.getElementById('lang-toggle'),
      // Modal
      modal: document.getElementById('modal-overlay'),
      modalTitle: document.getElementById('modal-title'),
      modalWord: document.getElementById('modal-word'),
      modalMeaning: document.getElementById('modal-meaning'),
      modalScore: document.getElementById('modal-score'),
      modalNextBtn: document.getElementById('modal-btn-next'),
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
        this.lang = this.i18n.lang;
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
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    if (this.currentQuestion) {
      this.dom.clueText.textContent = this.currentQuestion.meaning[this.lang] || this.currentQuestion.meaning.vi;
      const currentLvl = LEVELS[this.currentLevelIndex];
      this.dom.levelTitle.textContent = currentLvl?.title[this.lang] || currentLvl?.title.vi;
    }
  }

  playPop() {
    this.audio?.tone(400 + Math.random() * 200, 0.08, { type: 'sine', volume: 0.1 });
  }

  playChime() {
    this.audio?.chime([523, 659, 784, 1047], 0.09);
  }

  playBuzz() {
    this.audio?.tone(150, 0.25, { type: 'sawtooth', volume: 0.12 });
  }

  playVictory() {
    this.audio?.chime([523, 659, 784, 987, 1047, 1318], 0.12);
  }

  startLevel(lvlIndex) {
    this.currentLevelIndex = lvlIndex;
    const levelDef = LEVELS[lvlIndex];
    if (!levelDef) {
      this.showFinalVictory();
      return;
    }

    this.currentQuestions = getQuestionsForLevel(levelDef, WORD_BANK);
    this.currentQuestionIndex = 0;
    this.loadQuestion();
  }

  loadQuestion() {
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      // Completed level
      if (this.currentLevelIndex + 1 < LEVELS.length) {
        this.startLevel(this.currentLevelIndex + 1);
      } else {
        this.showFinalVictory();
      }
      return;
    }

    this.currentQuestion = this.currentQuestions[this.currentQuestionIndex];
    this.hintsUsed = 0;
    this.timeRemaining = LEVELS[this.currentLevelIndex].timePerWord || 40;

    // Tokens
    this.allTokens = createScrambleTokens(this.currentQuestion);
    this.availableTokens = [...this.allTokens];
    this.selectedTokens = [];

    this.updateStatsDOM();
    this.renderTray();
    this.renderPool();
    this.startTimer();
    this.updateTexts();
  }

  startTimer() {
    clearInterval(this.timerId);
    this.dom.timeVal.textContent = `${this.timeRemaining}s`;

    this.timerId = setInterval(() => {
      this.timeRemaining--;
      this.dom.timeVal.textContent = `${this.timeRemaining}s`;

      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        this.audio?.tone(300, 0.05, { type: 'sine', volume: 0.06 });
      }

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerId);
        this.handleTimeout();
      }
    }, 1000);
  }

  handleTimeout() {
    this.playBuzz();
    this.streak = 0;
    this.dom.streakVal.textContent = '0';
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      crown: '⏰',
      title: t.gameOverTitle,
      word: this.currentQuestion.word,
      meaning: this.currentQuestion.meaning[this.lang] || this.currentQuestion.meaning.vi,
      scoreText: `+0 ${t.score}`,
      buttonText: t.replayBtn,
      onNext: () => {
        this.dom.modal.classList.remove('active');
        this.startLevel(this.currentLevelIndex);
      },
    });
  }

  selectToken(token) {
    if (!token) return;
    const idx = this.availableTokens.findIndex(t => t.id === token.id);
    if (idx === -1) return;

    this.availableTokens.splice(idx, 1);
    this.selectedTokens.push(token);
    this.playPop();

    this.renderTray();
    this.renderPool();

    // Auto check if tray has all tokens
    if (this.availableTokens.length === 0) {
      this.checkCurrentAnswer();
    }
  }

  unselectToken(token) {
    if (!token) return;
    const idx = this.selectedTokens.findIndex(t => t.id === token.id);
    if (idx === -1) return;

    this.selectedTokens.splice(idx, 1);
    this.availableTokens.push(token);
    this.playPop();

    this.renderTray();
    this.renderPool();
  }

  undo() {
    if (this.selectedTokens.length === 0) return;
    const last = this.selectedTokens.pop();
    this.availableTokens.push(last);
    this.playPop();
    this.renderTray();
    this.renderPool();
  }

  resetTray() {
    if (this.selectedTokens.length === 0) return;
    this.availableTokens = [...this.allTokens];
    this.selectedTokens = [];
    this.playPop();
    this.renderTray();
    this.renderPool();
  }

  shufflePool() {
    if (this.availableTokens.length <= 1) return;
    for (let i = this.availableTokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableTokens[i], this.availableTokens[j]] = [this.availableTokens[j], this.availableTokens[i]];
    }
    this.playPop();
    this.renderPool();
  }

  giveHint() {
    const nextToken = getNextHintToken(this.availableTokens, this.selectedTokens, this.currentQuestion);
    if (!nextToken) {
      // If user has placed wrong tokens, reset tray first then place hint
      this.resetTray();
      const firstToken = getNextHintToken(this.availableTokens, [], this.currentQuestion);
      if (firstToken) {
        this.hintsUsed++;
        this.selectToken(firstToken);
      }
      return;
    }

    this.hintsUsed++;
    this.selectToken(nextToken);
  }

  checkCurrentAnswer() {
    const isCorrect = checkAnswer(this.selectedTokens, this.currentQuestion);

    if (isCorrect) {
      clearInterval(this.timerId);
      this.streak++;
      const earned = calculateQuestionScore({
        timeRemaining: this.timeRemaining,
        hintsUsed: this.hintsUsed,
        streak: this.streak,
        difficulty: this.currentQuestion.difficulty,
      });

      this.score += earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('mind_phoenix_vua_highscore', String(this.highScore));
      }

      this.playChime();
      this.updateStatsDOM();

      const t = UI_TEXT[this.lang] || UI_TEXT.vi;
      this.showModal({
        crown: '🎉',
        title: t.correctTitle,
        word: this.currentQuestion.word,
        meaning: this.currentQuestion.meaning[this.lang] || this.currentQuestion.meaning.vi,
        scoreText: `+${earned} ${t.score} (Chuỗi x${this.streak})`,
        buttonText: t.nextBtn,
        onNext: () => {
          this.dom.modal.classList.remove('active');
          this.currentQuestionIndex++;
          this.loadQuestion();
        },
      });
    } else {
      this.playBuzz();
      this.dom.tray.classList.add('error-shake');
      setTimeout(() => this.dom.tray.classList.remove('error-shake'), 450);
    }
  }

  showFinalVictory() {
    clearInterval(this.timerId);
    this.playVictory();
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    this.showModal({
      crown: '👑',
      title: t.victoryTitle,
      word: `${t.score}: ${this.score}`,
      meaning: t.victoryDesc,
      scoreText: `Kỷ Lục: ${this.highScore}`,
      buttonText: t.replayBtn,
      onNext: () => {
        this.dom.modal.classList.remove('active');
        this.score = 0;
        this.streak = 0;
        this.startLevel(0);
      },
    });
  }

  showModal({ crown, title, word, meaning, scoreText, buttonText, onNext }) {
    this.dom.modal.querySelector('.modal-crown').textContent = crown;
    this.dom.modalTitle.textContent = title;
    this.dom.modalWord.textContent = word;
    this.dom.modalMeaning.textContent = meaning;
    this.dom.modalScore.textContent = scoreText;
    this.dom.modalNextBtn.textContent = buttonText;

    this.dom.modalNextBtn.onclick = onNext;
    this.dom.modal.classList.add('active');
  }

  updateStatsDOM() {
    this.dom.scoreVal.textContent = this.score;
    this.dom.levelVal.textContent = `${this.currentLevelIndex + 1}/${LEVELS.length}`;
    this.dom.streakVal.textContent = this.streak > 0 ? `🔥 ${this.streak}` : '0';
    this.dom.categoryBadge.textContent = this.currentQuestion?.category || 'Tiếng Việt';
  }

  renderTray() {
    this.dom.tray.innerHTML = '';
    const t = UI_TEXT[this.lang] || UI_TEXT.vi;

    if (this.selectedTokens.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'tray-placeholder';
      placeholder.textContent = t.trayPlaceholder;
      this.dom.tray.appendChild(placeholder);
      this.dom.tray.classList.remove('filled');
      return;
    }

    this.dom.tray.classList.add('filled');
    const isLetterType = this.currentQuestion?.type === 'letters';

    this.selectedTokens.forEach((token) => {
      const btn = document.createElement('button');
      btn.className = `tile-token selected-in-tray ${isLetterType ? 'is-letter' : 'is-word'}`;
      btn.textContent = token.text;
      btn.title = 'Bấm để trả về';
      btn.addEventListener('click', () => this.unselectToken(token));
      this.dom.tray.appendChild(btn);
    });
  }

  renderPool() {
    this.dom.pool.innerHTML = '';
    const isLetterType = this.currentQuestion?.type === 'letters';

    this.availableTokens.forEach((token) => {
      const btn = document.createElement('button');
      btn.className = `tile-token ${isLetterType ? 'is-letter' : 'is-word'}`;
      btn.textContent = token.text;
      btn.addEventListener('click', () => this.selectToken(token));
      this.dom.pool.appendChild(btn);
    });

    this.dom.undoBtn.disabled = this.selectedTokens.length === 0;
    this.dom.resetBtn.disabled = this.selectedTokens.length === 0;
  }

  bindEvents() {
    this.dom.undoBtn.addEventListener('click', () => this.undo());
    this.dom.resetBtn.addEventListener('click', () => this.resetTray());
    this.dom.hintBtn.addEventListener('click', () => this.giveHint());
    this.dom.submitBtn.addEventListener('click', () => this.checkCurrentAnswer());

    const shuffleBtn = document.getElementById('btn-shuffle');
    if (shuffleBtn) shuffleBtn.addEventListener('click', () => this.shufflePool());

    // Keyboard support for desktop
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        this.undo();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.dom.modal.classList.contains('active')) {
          this.dom.modalNextBtn.click();
        } else {
          this.checkCurrentAnswer();
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Try to match typed letter
        const char = e.key.toUpperCase();
        const found = this.availableTokens.find(t => t.text.toUpperCase() === char);
        if (found) {
          this.selectToken(found);
        }
      }
    });
  }
}

// Launch game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.vuaGame = new VuaTiengVietGame();
});
