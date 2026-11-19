/**
 * Học Viện Phú Thọ - Minigame Vườn Hoa (Flower Garden Picking Minigame)
 * Trò chơi Hái Hoa Muôn Sắc rèn luyện sự nhanh tay, tinh mắt và tình yêu thiên nhiên:
 * - Các luống hoa đâm chồi, hé nụ và bung nở rực rỡ sắc màu (Hồng, Hướng Dương, Tulip, Cúc, Oải Hương, Bách Hợp).
 * - Người chơi chạm/click vào những đóa hoa nở rộ để hái vào giỏ mây.
 * - Hiệu ứng cánh hoa bay lấp lánh (petal burst particles), chuỗi combo điểm số và tiếng chuông reo vui tai.
 * - 3 Chế độ chơi:
 *   1. 'timed': Thử thách 60 giây (hái hoa tính điểm & chuỗi combo)
 *   2. 'bouquet': Nhiệm vụ Bác Làm Vườn (Hái đúng loại hoa để kết bó hoa ngày hội)
 *   3. 'free': Hái hoa tự do thư giãn ngắm cảnh
 */

export class FlowerGardenMinigame {
  constructor(options = {}) {
    this.canvas = options.canvas || null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.sound = options.sound || null;
    this.onClose = options.onClose || (() => {});
    this.onReward = options.onReward || (() => {});

    this.width = 760;
    this.height = 440;

    // Modes: 'timed', 'bouquet', 'free'
    this.mode = 'timed';
    this.timeLimit = 60;
    this.timeRemaining = 60;
    this.roundComplete = false;

    // Stats
    this.score = 0;
    this.pickedCount = 0;
    this.streak = 0;
    this.bestStreak = 0;

    // Bouquet mission target (cho chế độ 'bouquet')
    this.bouquetTargets = {
      rose: 3,
      sunflower: 2,
      tulip: 2,
      daisy: 3
    };
    this.bouquetCollected = {
      rose: 0,
      sunflower: 0,
      tulip: 0,
      daisy: 0,
      lavender: 0,
      golden: 0
    };

    // Định nghĩa các loài hoa
    this.flowerTypes = [
      { id: 'rose', name: 'Hoa Hồng Đỏ', icon: '🌹', color: '#e11d48', petalColor: '#f43f5e', centerColor: '#881337', score: 20, weight: 26 },
      { id: 'sunflower', name: 'Hướng Dương', icon: '🌻', color: '#eab308', petalColor: '#facc15', centerColor: '#713f12', score: 25, weight: 24 },
      { id: 'tulip', name: 'Hoa Tulip', icon: '🌷', color: '#ec4899', petalColor: '#f472b6', centerColor: '#831843', score: 25, weight: 22 },
      { id: 'daisy', name: 'Cúc Họa Mi', icon: '🌼', color: '#ffffff', petalColor: '#f8fafc', centerColor: '#f59e0b', score: 15, weight: 28 },
      { id: 'lavender', name: 'Oải Hương Tím', icon: '💜', color: '#8b5cf6', petalColor: '#a78bfa', centerColor: '#4c1d95', score: 30, weight: 16 },
      { id: 'golden', name: 'Bách Hợp Hoàng Kim', icon: '⭐', color: '#f59e0b', petalColor: '#fbbf24', centerColor: '#ffffff', score: 60, weight: 6, isRare: true }
    ];

    // Vị trí 8 luống hoa trong vườn (Plots)
    this.plots = [
      { id: 0, x: 140, y: 160, flower: null, nextSpawnTime: 0.2 },
      { id: 1, x: 300, y: 140, flower: null, nextSpawnTime: 0.8 },
      { id: 2, x: 460, y: 140, flower: null, nextSpawnTime: 0.5 },
      { id: 3, x: 620, y: 160, flower: null, nextSpawnTime: 1.1 },
      { id: 4, x: 130, y: 265, flower: null, nextSpawnTime: 0.4 },
      { id: 5, x: 290, y: 255, flower: null, nextSpawnTime: 1.0 },
      { id: 6, x: 470, y: 255, flower: null, nextSpawnTime: 0.7 },
      { id: 7, x: 630, y: 265, flower: null, nextSpawnTime: 0.3 }
    ];

    // Giỏ hoa mây ở đáy màn hình
    this.basket = {
      x: 380,
      y: 395,
      w: 190,
      h: 65,
      bounce: 0,
      flowersInBasket: []
    };

    // Sinh vật bay trong vườn (Bướm may mắn & Chú ong)
    this.specialVisitors = [];
    this.visitorTimer = 4.0;

    // Hạt hiệu ứng
    this.particles = [];
    this.floatingTexts = [];
    this.flyingFlowers = [];

    // Loop
    this.animId = null;
    this.lastTime = performance.now();

    this.setupEvents();
  }

  setupEvents() {
    if (!this.canvas) return;

    this.clickHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      this.handleGardenClick(clickX, clickY);
    };

    this.canvas.addEventListener('pointerdown', this.clickHandler);
  }

  start() {
    this.reset();
    this.lastTime = performance.now();
    if (this.animId) cancelAnimationFrame(this.animId);

    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.update(dt);
      this.render();
      if (!this.roundComplete || this.mode === 'free') {
        this.animId = requestAnimationFrame(loop);
      }
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.pickedCount = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.timeRemaining = this.timeLimit;
    this.roundComplete = false;
    this.particles = [];
    this.floatingTexts = [];
    this.flyingFlowers = [];
    this.specialVisitors = [];
    this.basket.flowersInBasket = [];

    this.bouquetCollected = {
      rose: 0,
      sunflower: 0,
      tulip: 0,
      daisy: 0,
      lavender: 0,
      golden: 0
    };

    // Xóa sạch hoa cũ & khởi tạo lại các luống
    for (let i = 0; i < this.plots.length; i++) {
      const p = this.plots[i];
      p.flower = null;
      p.nextSpawnTime = 0.2 + (i * 0.35);
    }

    this.updateScoreboardUI();

    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const overlay = document.getElementById('flowerResultOverlay');
      if (overlay) overlay.classList.add('hidden');
    }
  }

  spawnFlower(plot) {
    // Chọn loại hoa theo trọng số
    const totalWeight = this.flowerTypes.reduce((acc, f) => acc + f.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosenType = this.flowerTypes[0];

    for (const type of this.flowerTypes) {
      if (rand < type.weight) {
        chosenType = type;
        break;
      }
      rand -= type.weight;
    }

    plot.flower = {
      type: chosenType,
      state: 'sprouting', // 'sprouting' -> 'bloomed' -> 'wilting'
      growth: 0,          // 0 -> 1.0
      bloomTimer: 0,
      maxBloomTime: chosenType.isRare ? 4.2 : (5.5 + Math.random() * 2.5),
      sway: Math.random() * Math.PI * 2,
      scale: 0.2
    };
  }

  handleGardenClick(x, y) {
    if (this.roundComplete && this.mode !== 'free') return;

    // 1. Kiểm tra click vào sinh vật bay (Bướm may mắn hoặc Ong)
    for (let i = this.specialVisitors.length - 1; i >= 0; i--) {
      const v = this.specialVisitors[i];
      const dist = Math.hypot(x - v.x, y - v.y);
      if (dist < v.r + 15) {
        if (v.type === 'butterfly') {
          // Bắt được bướm may mắn! Thưởng +5s hoặc điểm thưởng
          this.score += 50;
          this.streak++;
          if (this.streak > this.bestStreak) this.bestStreak = this.streak;
          if (this.mode === 'timed') this.timeRemaining = Math.min(this.timeLimit, this.timeRemaining + 5);

          this.addFloatingText(`+50 ⭐ Bướm May Mắn (+5s)!`, v.x, v.y - 15, '#f59e0b');
          this.burstPetals(v.x, v.y, '#f59e0b', '#fbbf24', 20);
          this.playChimeSound(660);

          this.specialVisitors.splice(i, 1);
          this.updateScoreboardUI();
          return;
        } else if (v.type === 'bee') {
          // Lỡ chạm phải chú ong!
          if (this.mode === 'timed') this.timeRemaining = Math.max(0, this.timeRemaining - 3);
          this.streak = 0;
          this.addFloatingText(`-3s ⚠️ Cẩn thận chú ong!`, v.x, v.y - 15, '#ef4444');
          this.playBuzzSound();
          v.vx *= 2.5; // Ong bay vụt đi
          return;
        }
      }
    }

    // 2. Kiểm tra click vào các luống hoa
    let pickedAny = false;
    for (const plot of this.plots) {
      if (!plot.flower) continue;

      const fx = plot.x;
      const fy = plot.y - 20;
      const hitRadius = 38 * plot.flower.scale;
      const dist = Math.hypot(x - fx, y - fy);

      if (dist <= hitRadius && plot.flower.growth >= 0.65) {
        // Hái hoa thành công!
        pickedAny = true;
        const fl = plot.flower;
        this.pickFlower(plot, fl);
        break;
      }
    }

    if (!pickedAny) {
      // Chạm trượt vào bãi cỏ
      this.createGrassPuff(x, y);
    }
  }

  pickFlower(plot, flower) {
    const type = flower.type;
    this.pickedCount++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;

    // Tính điểm thưởng theo chuỗi streak
    const multiplier = this.streak >= 8 ? 3 : (this.streak >= 4 ? 2 : 1);
    const earnedScore = type.score * multiplier;
    this.score += earnedScore;

    // Cập nhật bó hoa
    if (this.bouquetCollected[type.id] !== undefined) {
      this.bouquetCollected[type.id]++;
    }

    // Hiệu ứng cánh hoa tung bay (Petal burst)
    this.burstPetals(plot.x, plot.y - 22, type.color, type.petalColor, type.isRare ? 28 : 16);

    // Hiệu ứng chữ điểm bay lên
    const streakBonus = multiplier > 1 ? ` (x${multiplier})` : '';
    const rareBonus = type.isRare ? ' 🌟 HOÀN KIM!' : '';
    this.addFloatingText(`+${earnedScore} ⭐ ${type.name}${streakBonus}${rareBonus}`, plot.x, plot.y - 45, type.isRare ? '#eab308' : '#15803d');

    // Hoa bay lượn hình parabol vào giỏ mây
    this.flyingFlowers.push({
      startX: plot.x,
      startY: plot.y - 20,
      targetX: this.basket.x + (Math.random() - 0.5) * (this.basket.w * 0.7),
      targetY: this.basket.y - 12 + (Math.random() - 0.5) * 16,
      progress: 0,
      peakY: Math.min(plot.y - 70, 180),
      type: type,
      rot: (Math.random() - 0.5) * 4,
      scale: 1.0
    });

    // Phát âm thanh hái hoa vui tươi
    const chimeFreq = 440 + Math.min(this.streak * 35, 400);
    this.playChimeSound(chimeFreq);

    // Xóa hoa khỏi luống và hẹn giờ mọc hoa mới
    plot.flower = null;
    plot.nextSpawnTime = 1.2 + Math.random() * 2.0;

    this.updateScoreboardUI();

    // Kiểm tra hoàn thành chế độ 'bouquet' (Bó hoa nhiệm vụ)
    if (this.mode === 'bouquet') {
      const isComplete = Object.keys(this.bouquetTargets).every(
        (key) => (this.bouquetCollected[key] || 0) >= this.bouquetTargets[key]
      );
      if (isComplete) {
        this.triggerBouquetWin();
      }
    }
  }

  update(dt) {
    if (this.roundComplete && this.mode !== 'free') return;

    // 1. Bộ đếm thời gian chế độ 60s
    if (this.mode === 'timed') {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.triggerTimeOut();
        return;
      }
    }

    // 2. Cập nhật các luống hoa (Plots)
    for (const plot of this.plots) {
      if (!plot.flower) {
        plot.nextSpawnTime -= dt;
        if (plot.nextSpawnTime <= 0) {
          this.spawnFlower(plot);
        }
      } else {
        const fl = plot.flower;
        fl.sway += dt * 3.5;

        if (fl.state === 'sprouting') {
          fl.growth += dt * 1.6;
          fl.scale = Math.min(1.0, 0.2 + fl.growth * 0.8);
          if (fl.growth >= 1.0) {
            fl.growth = 1.0;
            fl.state = 'bloomed';
          }
        } else if (fl.state === 'bloomed') {
          fl.bloomTimer += dt;
          if (fl.bloomTimer >= fl.maxBloomTime) {
            fl.state = 'wilting';
          }
        } else if (fl.state === 'wilting') {
          fl.scale -= dt * 1.4;
          if (fl.scale <= 0.1) {
            // Hoa tàn do người chơi không hái kịp
            plot.flower = null;
            plot.nextSpawnTime = 1.0 + Math.random() * 2.0;
          }
        }
      }
    }

    // 3. Cập nhật hoa đang bay vào giỏ
    for (let i = this.flyingFlowers.length - 1; i >= 0; i--) {
      const ff = this.flyingFlowers[i];
      ff.progress += dt * 2.2; // Tốc độ bay vào giỏ

      if (ff.progress >= 1.0) {
        // Rơi trúng giỏ
        this.basket.bounce = 12;
        this.basket.flowersInBasket.push({
          x: ff.targetX,
          y: ff.targetY,
          type: ff.type,
          rot: ff.rot
        });
        if (this.basket.flowersInBasket.length > 28) {
          this.basket.flowersInBasket.shift();
        }
        this.burstPetals(ff.targetX, ff.targetY, ff.type.color, '#ffffff', 6);
        this.flyingFlowers.splice(i, 1);
      }
    }

    // Giỏ mây nhún nảy (wobble bounce)
    if (this.basket.bounce > 0) {
      this.basket.bounce -= dt * 30;
      if (this.basket.bounce < 0) this.basket.bounce = 0;
    }

    // 4. Sinh vật bay ghé thăm (Bướm may mắn & Ong)
    this.visitorTimer -= dt;
    if (this.visitorTimer <= 0 && this.specialVisitors.length < 2) {
      this.visitorTimer = 4.5 + Math.random() * 5.0;
      const isBee = Math.random() < 0.35;
      const fromLeft = Math.random() < 0.5;
      this.specialVisitors.push({
        type: isBee ? 'bee' : 'butterfly',
        x: fromLeft ? -30 : this.width + 30,
        y: 110 + Math.random() * 160,
        vx: fromLeft ? (80 + Math.random() * 40) : -(80 + Math.random() * 40),
        vy: (Math.random() - 0.5) * 35,
        r: isBee ? 14 : 18,
        wingPhase: 0,
        animSpeed: isBee ? 28 : 16
      });
    }

    for (let i = this.specialVisitors.length - 1; i >= 0; i--) {
      const v = this.specialVisitors[i];
      v.x += v.vx * dt;
      v.y += v.vy * dt;
      v.wingPhase += v.animSpeed * dt;

      if ((v.vx > 0 && v.x > this.width + 60) || (v.vx < 0 && v.x < -60)) {
        this.specialVisitors.splice(i, 1);
      }
    }

    // 5. Cập nhật hạt cánh hoa
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.rot += p.vRot * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Cập nhật chữ điểm bay
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 45;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    this.updateScoreboardUI();
  }

  burstPetals(x, y, primaryColor, secondaryColor, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 70 + Math.random() * 120;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 120,
        color: Math.random() < 0.6 ? primaryColor : secondaryColor,
        size: 5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.2
      });
    }
  }

  createGrassPuff(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 35,
        vy: Math.sin(angle) * 35 - 10,
        gravity: 60,
        color: '#4ade80',
        size: 3 + Math.random() * 2.5,
        rot: 0,
        vRot: 0,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  addFloatingText(text, x, y, color = '#15803d') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      life: 1.2,
      maxLife: 1.2
    });
  }

  playChimeSound(freq = 520) {
    if (this.sound && this.sound.playCoin) {
      this.sound.playCoin();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch (_) {}
  }

  playBuzzSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  }

  triggerTimeOut() {
    this.roundComplete = true;
    this.showResultOverlay('Hết Giờ Hái Hoa!', `Bạn đã hái được ${this.pickedCount} đóa hoa muôn sắc tuyệt đẹp!`);
  }

  triggerBouquetWin() {
    this.roundComplete = true;
    this.score += 150; // Thưởng hoàn thành bó hoa
    this.showResultOverlay('💐 Bó Hoa Đã Hoàn Thành!', 'Bác Làm Vườn gửi lời khen ngợi tới bàn tay khéo léo của bạn!');
  }

  showResultOverlay(title, desc) {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const overlay = document.getElementById('flowerResultOverlay');
    if (!overlay) return;

    const titleEl = document.getElementById('flowerResultTitle');
    const scoreEl = document.getElementById('flowerResultScore');
    const descEl = document.getElementById('flowerResultDesc');

    // Thưởng Xu và Điểm học viện
    const earnedCoins = Math.min(60, 15 + Math.floor(this.score / 25));
    const earnedStars = Math.min(50, 10 + Math.floor(this.score / 35));

    if (titleEl) titleEl.textContent = title;
    if (scoreEl) scoreEl.innerHTML = `${this.score} Điểm <span style="font-size:18px; color:#15803d;">(${this.pickedCount} Đóa hoa • +${earnedCoins} 🪙 • +${earnedStars} ⭐)</span>`;
    if (descEl) descEl.textContent = desc;

    overlay.classList.remove('hidden');

    // Callback trao thưởng cho player trong game.js
    if (typeof this.onReward === 'function') {
      this.onReward(earnedCoins, earnedStars);
    }
  }

  updateScoreboardUI() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const scoreEl = document.getElementById('flowerScore');
    if (scoreEl) scoreEl.textContent = this.score;

    const countEl = document.getElementById('flowerCount');
    if (countEl) countEl.textContent = this.pickedCount;

    const streakEl = document.getElementById('flowerStreak');
    if (streakEl) streakEl.textContent = `x${this.streak}`;

    const timerEl = document.getElementById('flowerTimer');
    if (timerEl) {
      if (this.mode === 'timed') {
        timerEl.textContent = `${Math.ceil(this.timeRemaining)}s ⏱️`;
        timerEl.style.color = this.timeRemaining <= 10 ? '#dc2626' : '#15803d';
      } else if (this.mode === 'bouquet') {
        const r = this.bouquetCollected;
        const t = this.bouquetTargets;
        timerEl.textContent = `🌹${r.rose}/${t.rose} 🌻${r.sunflower}/${t.sunflower} 🌷${r.tulip}/${t.tulip} 🌼${r.daisy}/${t.daisy}`;
        timerEl.style.color = '#7c3aed';
      } else {
        timerEl.textContent = 'Tự do ♾️';
        timerEl.style.color = '#0284c7';
      }
    }
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Nền khu vườn thơ mộng (Trời xanh mây trắng + Thảm cỏ hoa)
    this.renderGardenBackground(ctx);

    // 2. Vẽ các luống hoa và hoa nở
    for (const plot of this.plots) {
      this.renderPlot(ctx, plot);
    }

    // 3. Hoa đang bay vào giỏ
    for (const ff of this.flyingFlowers) {
      this.renderFlyingFlower(ctx, ff);
    }

    // 4. Giỏ hoa mây ở đáy màn hình
    this.renderBasket(ctx);

    // 5. Sinh vật bay ghé thăm (Bướm may mắn & Ong)
    for (const v of this.specialVisitors) {
      this.renderVisitor(ctx, v);
    }

    // 6. Hiệu ứng hạt cánh hoa
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Chữ điểm bay
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = 'bold 15px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  renderGardenBackground(ctx) {
    // Bầu trời trên cao
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
    skyGrad.addColorStop(0, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, 140);

    // Mây trắng trôi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.drawCloud(ctx, 120, 45, 38);
    this.drawCloud(ctx, 430, 35, 46);
    this.drawCloud(ctx, 670, 55, 32);

    // Hàng rào gỗ trắng sân trường
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    for (let x = 10; x < this.width; x += 36) {
      ctx.fillRect(x, 75, 22, 55);
      ctx.strokeRect(x, 75, 22, 55);
      // Đỉnh nhọn hàng rào
      ctx.beginPath();
      ctx.moveTo(x, 75);
      ctx.lineTo(x + 11, 62);
      ctx.lineTo(x + 22, 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Thanh ngang hàng rào
    ctx.fillRect(0, 95, this.width, 10);
    ctx.strokeRect(0, 95, this.width, 10);

    // Thảm cỏ vườn hoa xanh mướt
    const grassGrad = ctx.createLinearGradient(0, 125, 0, this.height);
    grassGrad.addColorStop(0, '#86efac');
    grassGrad.addColorStop(0.3, '#4ade80');
    grassGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 125, this.width, this.height - 125);

    // Lối đi rải sỏi mềm mại trong vườn
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(380, 240, 340, 110, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.ellipse(380, 240, 320, 95, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCloud(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.6, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + r * 1.3, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPlot(ctx, plot) {
    // 1. Luống đất màu nâu tơi xốp
    ctx.save();
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(plot.x, plot.y, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(plot.x, plot.y - 2, 36, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Hoa mọc từ luống
    if (!plot.flower) {
      // Mầm cây nhỏ nhú lên
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(plot.x, plot.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const fl = plot.flower;
    const type = fl.type;
    const swayX = Math.sin(fl.sway) * 4;

    ctx.save();
    ctx.translate(plot.x + swayX, plot.y - 6);
    ctx.scale(fl.scale, fl.scale);

    // Thân cành hoa xanh
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(swayX * 0.5, -14, 0, -28);
    ctx.stroke();

    // Lá xanh hai bên cành
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(-8, -14, 8, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -18, 8, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Đóa hoa bung nở
    ctx.translate(0, -28);

    // Hiệu ứng hào quang lấp lánh cho hoa hiếm (Golden Lily)
    if (type.isRare) {
      const sparkleA = Math.sin(performance.now() / 150) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(254, 240, 138, ${sparkleA * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
    }

    // Các cánh hoa tròn xòe đều
    const petalCount = type.id === 'sunflower' ? 12 : (type.id === 'daisy' ? 10 : 6);
    const petalLen = type.id === 'sunflower' ? 22 : 18;
    const petalWid = type.id === 'sunflower' ? 6 : 9;

    ctx.fillStyle = type.petalColor;
    ctx.strokeStyle = type.color;
    ctx.lineWidth = 1.5;

    for (let i = 0; i < petalCount; i++) {
      const a = (Math.PI * 2 * i) / petalCount;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -petalLen * 0.75, petalWid, petalLen * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Nhụy hoa ở giữa
    ctx.fillStyle = type.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, petalLen * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Hạt nhụy nhỏ
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderFlyingFlower(ctx, ff) {
    const t = ff.progress;
    // Đường cong Bezier parabol
    const curX = ff.startX + (ff.targetX - ff.startX) * t;
    const curY = (1 - t) * (1 - t) * ff.startY + 2 * (1 - t) * t * ff.peakY + t * t * ff.targetY;

    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(ff.rot * t * 3);
    ctx.scale(0.85, 0.85);

    // Cánh hoa đang bay
    ctx.fillStyle = ff.type.petalColor;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ff.type.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderBasket(ctx) {
    const bx = this.basket.x;
    const by = this.basket.y - this.basket.bounce;
    const bw = this.basket.w;
    const bh = this.basket.h;

    ctx.save();

    // 1. Bóng giỏ mây
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(bx, this.basket.y + bh * 0.45, bw * 0.55, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Hoa trong giỏ (xếp đầy ắp tỏa sắc)
    for (const f of this.basket.flowersInBasket) {
      ctx.save();
      ctx.translate(f.x, f.y - this.basket.bounce);
      ctx.rotate(f.rot);
      ctx.fillStyle = f.type.petalColor;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = f.type.centerColor;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Quai giỏ mây
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(bx, by - bh * 0.35, bw * 0.38, Math.PI, 0);
    ctx.stroke();

    // 4. Thân giỏ mây đan nan tre
    const basketGrad = ctx.createLinearGradient(0, by - bh * 0.5, 0, by + bh * 0.5);
    basketGrad.addColorStop(0, '#d97706');
    basketGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = basketGrad;
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, by - bh * 0.4, bw, bh * 0.85, 16);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Họa tiết đan nan giỏ mây
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    for (let x = bx - bw / 2 + 15; x < bx + bw / 2 - 10; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, by - bh * 0.35);
      ctx.lineTo(x + 8, by + bh * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 8, by - bh * 0.35);
      ctx.lineTo(x, by + bh * 0.4);
      ctx.stroke();
    }

    // Nơ ruy băng đỏ thắm trước giỏ
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.ellipse(bx - 12, by - 6, 12, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(bx + 12, by - 6, 12, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.arc(bx, by - 6, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderVisitor(ctx, v) {
    ctx.save();
    ctx.translate(v.x, v.y);

    if (v.type === 'butterfly') {
      // Bướm thần tiên vàng óng
      const wingW = Math.max(0.15, Math.abs(Math.cos(v.wingPhase))) * v.r;
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      // Cánh trái
      ctx.beginPath();
      ctx.ellipse(-wingW, -2, wingW, v.r * 0.75, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cánh phải
      ctx.beginPath();
      ctx.ellipse(wingW, -2, wingW, v.r * 0.75, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Thân
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.5, v.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Chú ong mật sọc vàng đen
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, 0, v.r, v.r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sọc đen
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-2, -v.r * 0.6, 4, v.r * 1.2);
      ctx.fillRect(4, -v.r * 0.55, 3.5, v.r * 1.1);

      // Cánh ong mỏng rung nhanh
      const wingH = Math.sin(v.wingPhase) * (v.r * 0.7);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-2, -v.r * 0.6 - wingH, 5, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
