/**
 * Học Viện Phú Thọ - Minigame Hồ Cá (Fishing Minigame)
 * Lấy cảm hứng từ lối chơi kinh điển "Đào Vàng" (Gold Miner):
 * - Móc câu con lắc lắc qua lắc lại đều đặn.
 * - Nhấn thả móc câu xuống hồ để gắp cá, tôm, cua...
 * - Kéo lên với tốc độ phụ thuộc vào cân nặng của từng loài (cá nhỏ kéo nhanh, cá to kéo nặng!).
 * - ĐẶC BIỆT: Chơi vui giải trí thư giãn thuần túy, KHÔNG tính điểm level hay áp lực cấp độ!
 */

export class FishingMinigame {
  constructor(options = {}) {
    this.canvas = options.canvas || null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.sound = options.sound || null;
    this.onClose = options.onClose || (() => {});

    // Kích thước canvas tiêu chuẩn
    this.width = 760;
    this.height = 440;

    // Chế độ chơi: 'free' (Tự do thư giãn) hoặc 'timed' (Thử thách 60s)
    this.mode = 'free';
    this.timeLimit = 60;
    this.timeRemaining = 60;
    this.roundComplete = false;

    // Điểm số & Thống kê
    this.score = 0;
    this.caughtCount = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.bestCatch = null;

    // Tọa độ bến câu / cần câu
    this.origin = { x: 380, y: 55 };

    // Thông số móc câu (Con lắc lò xo / Đào vàng)
    this.hook = {
      angle: 0,              // Góc hiện tại (radian)
      minAngle: -1.22,       // ~ -70 độ
      maxAngle: 1.22,        // ~ +70 độ
      angleSpeed: 1.65,      // Tốc độ lắc qua lắc lại (rad/s)
      angleDir: 1,           // Chiều lắc (1: sang phải, -1: sang trái)
      state: 'swinging',     // 'swinging' | 'shooting' | 'reeling'
      restLength: 42,        // Độ dài dây khi ở trạng thái chờ
      length: 42,            // Độ dài dây câu hiện tại
      maxLength: 410,        // Giới hạn chiều dài tối đa
      shootSpeed: 390,       // Tốc độ phóng móc câu xuống đáy (px/s)
      baseReelSpeed: 420,    // Tốc độ kéo dây lên khi không có cá (px/s)
      hookRadius: 10,        // Bán kính đầu móc câu
      hookedItem: null,      // Sinh vật đang bị móc
      clawOpen: 0            // Độ mở ngàm móc câu (animation)
    };

    // Danh sách sinh vật bơi trong hồ
    this.creatures = [];
    this.maxCreatures = 11;
    this.spawnTimer = 0;

    // Hiệu ứng hạt (bong bóng nước, confetti, tia nước)
    this.particles = [];
    this.floatingTexts = [];
    this.bubbles = [];

    // Môi trường nước & Rong rêu
    this.waterTime = 0;
    this.seaweeds = this.generateSeaweeds();

    // Vòng lặp animation
    this.animId = null;
    this.lastTime = performance.now();

    // Khởi tạo đàn cá ban đầu
    this.populatePond();

    // Khởi tạo bong bóng ngẫu nhiên nổi trong hồ
    this.initBubbles();

    // Gán sự kiện điều khiển
    this.setupEvents();
  }

  generateSeaweeds() {
    const plants = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      plants.push({
        x: 40 + (i * (this.width - 80)) / (count - 1) + (Math.random() - 0.5) * 24,
        baseY: 432,
        height: 60 + Math.random() * 55,
        segments: 4 + Math.floor(Math.random() * 3),
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 1.2 + Math.random() * 1.0,
        color: i % 2 === 0 ? '#15803d' : '#166534'
      });
    }
    return plants;
  }

  initBubbles() {
    this.bubbles = [];
    for (let i = 0; i < 22; i++) {
      this.bubbles.push({
        x: Math.random() * this.width,
        y: 80 + Math.random() * (this.height - 100),
        r: 1.5 + Math.random() * 3.5,
        speed: 18 + Math.random() * 30,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.45
      });
    }
  }

  /**
   * Tạo danh mục mẫu sinh vật dưới hồ phong phú theo yêu cầu:
   * Có cá to, cá nhỏ, tôm, cua, rùa, sò ngọc trai...
   */
  getCreatureTypes() {
    return [
      {
        type: 'fish_small',
        name: 'Cá Bống Tung Tăng',
        category: 'fish',
        w: 28,
        h: 16,
        r: 13,
        weight: 0.8,
        score: 15,
        speed: 85,
        minY: 100,
        maxY: 280,
        color: '#06b6d4',
        accentColor: '#38bdf8',
        icon: '🐟'
      },
      {
        type: 'fish_clown',
        name: 'Cá Hề Nhí Nhảnh',
        category: 'fish',
        w: 32,
        h: 19,
        r: 15,
        weight: 1.0,
        score: 20,
        speed: 75,
        minY: 120,
        maxY: 300,
        color: '#ea580c',
        accentColor: '#ffffff',
        icon: '🐠'
      },
      {
        type: 'shrimp_small',
        name: 'Tôm Riu Tí Hon',
        category: 'shrimp',
        w: 32,
        h: 16,
        r: 14,
        weight: 0.9,
        score: 25,
        speed: 65,
        minY: 180,
        maxY: 350,
        color: '#f472b6',
        accentColor: '#fb7185',
        icon: '🦐'
      },
      {
        type: 'crab_small',
        name: 'Cua Đồng Tinh Nghịch',
        category: 'crab',
        w: 36,
        h: 24,
        r: 16,
        weight: 1.8,
        score: 30,
        speed: 48,
        minY: 395,
        maxY: 418, // Bò ở đáy hồ
        color: '#ca8a04',
        accentColor: '#eab308',
        icon: '🦀'
      },
      {
        type: 'fish_medium',
        name: 'Cá Chép Đỏ May Mắn',
        category: 'fish',
        w: 48,
        h: 26,
        r: 22,
        weight: 2.2,
        score: 35,
        speed: 58,
        minY: 130,
        maxY: 320,
        color: '#dc2626',
        accentColor: '#fef08a',
        icon: '🎏'
      },
      {
        type: 'shrimp_giant',
        name: 'Tôm Càng Xanh Bự',
        category: 'shrimp',
        w: 52,
        h: 24,
        r: 24,
        weight: 2.6,
        score: 45,
        speed: 52,
        minY: 220,
        maxY: 380,
        color: '#0284c7',
        accentColor: '#38bdf8',
        icon: '🦐'
      },
      {
        type: 'turtle',
        name: 'Rùa Nhí Thảnh Thơi',
        category: 'turtle',
        w: 44,
        h: 28,
        r: 22,
        weight: 3.0,
        score: 50,
        speed: 36,
        minY: 150,
        maxY: 310,
        color: '#16a34a',
        accentColor: '#86efac',
        icon: '🐢'
      },
      {
        type: 'pearl_clam',
        name: 'Vỏ Sò Ngọc Trai',
        category: 'clam',
        w: 36,
        h: 26,
        r: 18,
        weight: 2.2,
        score: 55,
        speed: 0, // Nằm yên dưới đáy
        minY: 405,
        maxY: 418,
        color: '#e0e7ff',
        accentColor: '#fef08a',
        icon: '🦪'
      },
      {
        type: 'crab_big',
        name: 'Cua Biển Khổng Lồ',
        category: 'crab',
        w: 56,
        h: 34,
        r: 26,
        weight: 3.8,
        score: 60,
        speed: 38,
        minY: 395,
        maxY: 418,
        color: '#b91c1c',
        accentColor: '#fca5a5',
        icon: '🦀'
      },
      {
        type: 'fish_big',
        name: 'Cá Chép Vàng Đại Phú Thọ',
        category: 'fish',
        w: 76,
        h: 42,
        r: 34,
        weight: 4.6, // Nặng, kéo chậm nhưng điểm cực cao!
        score: 75,
        speed: 42,
        minY: 160,
        maxY: 340,
        color: '#eab308',
        accentColor: '#fef08a',
        icon: '✨🐟'
      },
      {
        type: 'chest',
        name: 'Rương Kho Báu Đáy Hồ',
        category: 'chest',
        w: 44,
        h: 32,
        r: 22,
        weight: 5.2, // Rất nặng!
        score: 90,
        speed: 0,
        minY: 405,
        maxY: 415,
        color: '#78350f',
        accentColor: '#facc15',
        icon: '👑'
      }
    ];
  }

  createCreature(template, overrideX = null, overrideDir = null) {
    const dir = overrideDir !== null ? overrideDir : (Math.random() < 0.5 ? 1 : -1);
    const x = overrideX !== null
      ? overrideX
      : (dir === 1 ? -template.w - Math.random() * 40 : this.width + template.w + Math.random() * 40);
    const y = template.minY + Math.random() * (template.maxY - template.minY);

    return {
      ...template,
      id: `c_${Math.random().toString(36).slice(2, 8)}`,
      x,
      y,
      baseY: y,
      dir,
      hooked: false,
      tailAnim: Math.random() * Math.PI * 2,
      wobblePhase: Math.random() * Math.PI * 2,
      openAnim: 0 // Cho sò ngọc trai
    };
  }

  populatePond() {
    this.creatures = [];
    const types = this.getCreatureTypes();

    // Rải đều các sinh vật trong hồ lúc đầu game
    types.forEach((type, idx) => {
      // Đặt vị trí x ngẫu nhiên trong màn hình
      const x = 50 + Math.random() * (this.width - 100);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const c = this.createCreature(type, x, dir);
      this.creatures.push(c);
    });
  }

  setupEvents() {
    if (!this.canvas) return;

    const handleDropHook = () => {
      this.dropHook();
    };

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleDropHook();
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleDropHook();
    }, { passive: false });

    if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowDown') {
          // Chỉ nhận phím khi modal hồ cá đang mở
          const modal = document.getElementById('fishingModal');
          if (modal && !modal.classList.contains('hidden')) {
            e.preventDefault();
            this.dropHook();
          }
        }
      });
    }
  }

  /**
   * Thả móc câu xuống hồ (hành động chính của người chơi)
   */
  dropHook() {
    if (this.roundComplete) return;

    if (this.hook.state === 'swinging') {
      this.hook.state = 'shooting';
      this.hook.clawOpen = 1;

      if (this.sound && typeof this.sound.playCast === 'function') {
        this.sound.playCast();
      } else if (this.sound && typeof this.sound.playKick === 'function') {
        this.sound.playKick();
      }
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    this.resetGame();
  }

  resetGame() {
    this.score = 0;
    this.caughtCount = 0;
    this.streak = 0;
    this.bestCatch = null;
    this.timeRemaining = this.timeLimit;
    this.roundComplete = false;

    this.hook.state = 'swinging';
    this.hook.length = this.hook.restLength;
    this.hook.hookedItem = null;
    this.hook.clawOpen = 0;

    this.particles = [];
    this.floatingTexts = [];
    this.populatePond();
    this.updateUI();

    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const resOverlay = document.getElementById('fishingResultOverlay');
      if (resOverlay) resOverlay.classList.add('hidden');
    }
  }

  start() {
    this.lastTime = performance.now();
    this.updateUI();
    if (!this.animId) {
      this.animId = requestAnimationFrame(() => this.loop());
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  loop() {
    const now = performance.now();
    const dt = Math.min(0.08, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    this.waterTime += dt;

    // 1. Cập nhật thời gian nếu ở chế độ thi đấu 60s
    if (this.mode === 'timed' && !this.roundComplete) {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
      if (this.timeRemaining <= 0) {
        this.finishRound();
      }
    }

    // 2. Cập nhật móc câu (Hook logic - Con lắc & Thu phóng)
    this.updateHook(dt);

    // 3. Cập nhật sinh vật (bơi qua lại, ngọ nguậy đuôi)
    this.updateCreatures(dt);

    // 4. Sinh thêm sinh vật định kỳ nếu hồ thưa cá
    this.spawnTimer += dt;
    if (this.spawnTimer > 2.5 && this.creatures.length < this.maxCreatures) {
      this.spawnTimer = 0;
      this.spawnRandomCreature();
    }

    // 5. Cập nhật bong bóng nước
    this.updateBubbles(dt);

    // 6. Cập nhật hiệu ứng hạt & chữ nổi
    this.updateParticles(dt);
  }

  updateHook(dt) {
    const h = this.hook;

    if (h.state === 'swinging') {
      // Con lắc lắc qua lắc lại đều đặn
      h.angle += h.angleDir * h.angleSpeed * dt;
      if (h.angle >= h.maxAngle) {
        h.angle = h.maxAngle;
        h.angleDir = -1;
      } else if (h.angle <= h.minAngle) {
        h.angle = h.minAngle;
        h.angleDir = 1;
      }
      h.length = h.restLength;
      h.clawOpen = Math.max(0, h.clawOpen - dt * 3);
    } else if (h.state === 'shooting') {
      // Phóng móc câu ra xa dọc theo góc đã ngắm
      h.length += h.shootSpeed * dt;

      const tipX = this.origin.x + Math.sin(h.angle) * h.length;
      const tipY = this.origin.y + Math.cos(h.angle) * h.length;

      // Kiểm tra va chạm với các sinh vật
      for (const c of this.creatures) {
        if (c.hooked) continue;
        const dist = Math.hypot(tipX - c.x, tipY - c.y);
        if (dist <= c.r + h.hookRadius) {
          // Bắt trúng sinh vật!
          h.hookedItem = c;
          c.hooked = true;
          h.state = 'reeling';
          h.clawOpen = 0; // Kẹp chặt lại

          // Âm thanh đớp mồi / cắn câu
          if (this.sound && typeof this.sound.playCatch === 'function') {
            this.sound.playCatch();
          } else if (this.sound && typeof this.sound.playSplash === 'function') {
            this.sound.playSplash();
          } else if (this.sound && typeof this.sound.playClick === 'function') {
            this.sound.playClick();
          }

          // Nổ bọt nước sinh động
          this.spawnWaterSplash(tipX, tipY);
          break;
        }
      }

      // Kiểm tra chạm bờ hồ hoặc chạm đáy
      if (
        tipX <= 18 ||
        tipX >= this.width - 18 ||
        tipY >= this.height - 16 ||
        h.length >= h.maxLength
      ) {
        // Chạm đáy/bờ mà không trúng gì -> Tự động kéo dây về
        h.state = 'reeling';
        this.spawnWaterSplash(tipX, tipY, 8);
      }
    } else if (h.state === 'reeling') {
      // Tốc độ kéo dây phụ thuộc vào khối lượng sinh vật (Cơ chế Đào Vàng chân thực!)
      const weight = h.hookedItem ? h.hookedItem.weight : 1;
      const currentReelSpeed = h.baseReelSpeed / weight;

      h.length -= currentReelSpeed * dt;

      const tipX = this.origin.x + Math.sin(h.angle) * h.length;
      const tipY = this.origin.y + Math.cos(h.angle) * h.length;

      // Sinh vật bám theo đầu móc câu
      if (h.hookedItem) {
        h.hookedItem.x = tipX;
        h.hookedItem.y = tipY + 10;
        h.hookedItem.tailAnim += dt * 18; // Vùng vẫy khi bị kéo lên
      }

      // Khi dây câu đã thu về tới thuyền / bến câu
      if (h.length <= h.restLength) {
        h.length = h.restLength;
        h.state = 'swinging';

        if (h.hookedItem) {
          this.handleCatchSuccess(h.hookedItem);
          h.hookedItem = null;
        } else {
          // Kéo hụt
          this.streak = 0;
          this.updateUI();
        }
      }
    }
  }

  handleCatchSuccess(item) {
    this.score += item.score;
    this.caughtCount++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;

    if (!this.bestCatch || item.score > this.bestCatch.score) {
      this.bestCatch = item;
    }

    // Hiệu ứng ăn mừng
    const text = `+${item.score}⭐ ${item.name}!`;
    this.floatingTexts.push({
      text,
      color: item.score >= 50 ? '#f59e0b' : '#10b981',
      x: this.origin.x,
      y: this.origin.y + 40,
      alpha: 1,
      scale: item.score >= 50 ? 1.4 : 1.1
    });

    // Bắn pháo hoa ăn mừng
    this.spawnConfetti(this.origin.x, this.origin.y + 20);

    // Âm thanh lĩnh thưởng
    if (this.sound && typeof this.sound.playCoin === 'function') {
      this.sound.playCoin();
    } else if (this.sound && typeof this.sound.playSuccess === 'function') {
      this.sound.playSuccess();
    }

    // Xóa sinh vật khỏi mảng
    this.creatures = this.creatures.filter((c) => c.id !== item.id);

    this.updateUI();
  }

  updateCreatures(dt) {
    for (const c of this.creatures) {
      if (c.hooked) continue;

      // Bơi theo phương ngang
      if (c.speed > 0) {
        c.x += c.dir * c.speed * dt;
        c.tailAnim += dt * (c.speed * 0.12);

        // Nhấp nhô sóng nước nhẹ
        c.wobblePhase += dt * 2;
        c.y = c.baseY + Math.sin(c.wobblePhase) * 4;

        // Đổi hướng khi chạm mép hồ
        if (c.dir === 1 && c.x > this.width - 25) {
          c.dir = -1;
        } else if (c.dir === -1 && c.x < 25) {
          c.dir = 1;
        }
      } else {
        // Sinh vật đứng yên (Sò ngọc trai hé mở thỉnh thoảng)
        if (c.type === 'pearl_clam') {
          c.openAnim = Math.sin(this.waterTime * 1.5);
        }
      }
    }
  }

  spawnRandomCreature() {
    const types = this.getCreatureTypes();
    const template = types[Math.floor(Math.random() * types.length)];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const startX = dir === 1 ? -template.w - 15 : this.width + template.w + 15;
    const newCreature = this.createCreature(template, startX, dir);
    this.creatures.push(newCreature);
  }

  updateBubbles(dt) {
    for (const b of this.bubbles) {
      b.y -= b.speed * dt;
      b.wobble += dt * 3;
      b.x += Math.sin(b.wobble) * 0.4;

      if (b.y < 70) {
        b.y = this.height - 10 - Math.random() * 20;
        b.x = Math.random() * this.width;
      }
    }
  }

  spawnWaterSplash(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        r: 2 + Math.random() * 4,
        color: '#67e8f9',
        alpha: 0.9,
        life: 0.6 + Math.random() * 0.4
      });
    }
  }

  spawnConfetti(x, y) {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'];
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.3;
      const speed = 70 + Math.random() * 190;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        r: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0.8 + Math.random() * 0.5
      });
    }
  }

  updateParticles(dt) {
    // Hạt
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // Trọng lực nhẹ
      p.life -= dt * 1.4;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Chữ nổi
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 35 * dt;
      ft.alpha -= dt * 0.75;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  finishRound() {
    this.roundComplete = true;
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;

    const overlay = document.getElementById('fishingResultOverlay');
    const resultTitle = document.getElementById('fishingResultTitle');
    const resultScore = document.getElementById('fishingResultScore');
    const resultDesc = document.getElementById('fishingResultDesc');

    if (overlay && resultScore) {
      resultScore.textContent = `${this.score} Điểm (${this.caughtCount} Con)`;

      let title = 'Tay Câu Thân Thiện! 🎣';
      let desc = 'Một buổi câu cá thư giãn thật thú vị tại Hồ Sen Phú Thọ!';
      if (this.score >= 350) {
        title = 'Cần Thủ Huyền Thoại Phú Thọ! 🏆👑';
        desc = 'Kỹ năng ngắm góc và câu chuẩn xác như chuyên gia săn thủy quái!';
      } else if (this.score >= 200) {
        title = 'Vua Câu Cá Nhí Xuất Sắc! 🥇🌟';
        desc = 'Mắt tinh tay nhanh, câu được toàn cá bự và rương kho báu quý giá!';
      } else if (this.score >= 100) {
        title = 'Cần Thủ Đắc Lực! 🐟✨';
        desc = 'Giỏ cá đầy ắp tôm cua bơi lội tung tăng!';
      }

      if (resultTitle) resultTitle.textContent = title;
      if (resultDesc) resultDesc.textContent = desc;

      overlay.classList.remove('hidden');
    }
  }

  updateUI() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;

    const scoreEl = document.getElementById('fishingScore');
    const countEl = document.getElementById('fishingCount');
    const timeEl = document.getElementById('fishingTimer');
    const streakEl = document.getElementById('fishingStreak');

    if (scoreEl) scoreEl.textContent = this.score;
    if (countEl) countEl.textContent = this.caughtCount;
    if (streakEl) streakEl.textContent = this.streak;
    if (timeEl) {
      timeEl.textContent = this.mode === 'timed' ? `${Math.ceil(this.timeRemaining)}s` : 'Tự do ♾️';
    }
  }

  /* =========================================================================
     CANVAS RENDERING METHODS
     ========================================================================= */

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Nền hồ nước (Gradient sâu lắng trong vắt)
    this.drawWaterBackground(ctx);

    // 2. Tia sáng mặt trời rọi xuống hồ
    this.drawSunRays(ctx);

    // 3. Đáy hồ (cát vàng, đá cuội & rong rêu dập dờn)
    this.drawLakeBed(ctx);

    // 4. Bong bóng nước nổi lên
    this.drawBubbles(ctx);

    // 5. Đàn cá, tôm, cua bơi lội
    this.drawCreatures(ctx);

    // 6. Dây câu & Móc câu (Con lắc lò xo)
    this.drawHook(ctx);

    // 7. Bến gỗ câu cá trên mặt nước (Cầu tàu & Cần thủ)
    this.drawDock(ctx);

    // 8. Hạt hiệu ứng & Chữ điểm bay
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawWaterBackground(ctx) {
    // Gradient nước hồ: từ xanh ngọc bề mặt tới xanh thẳm ở đáy
    const grad = ctx.createLinearGradient(0, 60, 0, this.height);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.35, '#0369a1');
    grad.addColorStop(0.75, '#075985');
    grad.addColorStop(1, '#0c4a6e');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 60, this.width, this.height - 60);

    // Mặt nước gợn sóng nhấp nhô
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 62);
    for (let x = 0; x <= this.width; x += 30) {
      const y = 62 + Math.sin((x * 0.05) + this.waterTime * 2.5) * 3;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, 70);
    ctx.lineTo(0, 70);
    ctx.closePath();
    ctx.fill();
  }

  drawSunRays(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < 5; i++) {
      const x1 = 120 + i * 130 + Math.sin(this.waterTime * 0.8 + i) * 20;
      const x2 = x1 - 80;
      ctx.beginPath();
      ctx.moveTo(x1, 60);
      ctx.lineTo(x1 + 45, 60);
      ctx.lineTo(x2 + 90, this.height);
      ctx.lineTo(x2, this.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawLakeBed(ctx) {
    // Đáy cát
    ctx.save();
    const bedGrad = ctx.createLinearGradient(0, 390, 0, this.height);
    bedGrad.addColorStop(0, '#d97706');
    bedGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = bedGrad;

    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, 420);
    ctx.bezierCurveTo(150, 410, 300, 425, 450, 412);
    ctx.bezierCurveTo(600, 400, 700, 422, this.width, 418);
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // Sỏi đá cuội đáy hồ
    const stones = [
      { x: 80, y: 426, r: 8, c: '#92400e' },
      { x: 190, y: 430, r: 12, c: '#78350f' },
      { x: 310, y: 428, r: 10, c: '#b45309' },
      { x: 470, y: 429, r: 14, c: '#78350f' },
      { x: 620, y: 425, r: 9, c: '#92400e' },
      { x: 710, y: 431, r: 11, c: '#b45309' }
    ];
    for (const s of stones) {
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r * 1.3, s.r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rong rêu dập dờn trong dòng nước
    for (const p of this.seaweeds) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.baseY);

      let prevX = p.x;
      let prevY = p.baseY;
      const segH = p.height / p.segments;

      for (let s = 1; s <= p.segments; s++) {
        const sway = Math.sin(this.waterTime * p.swaySpeed + p.phase + s * 0.6) * (s * 4);
        const curX = p.x + sway;
        const curY = p.baseY - s * segH;
        ctx.quadraticCurveTo(prevX, prevY, curX, curY);
        prevX = curX;
        prevY = curY;
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBubbles(ctx) {
    ctx.save();
    for (const b of this.bubbles) {
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Đốm sáng trên bóng bóng
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 1.5})`;
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCreatures(ctx) {
    for (const c of this.creatures) {
      ctx.save();
      ctx.translate(c.x, c.y);

      // Nếu đang bị kéo lên thì xoay thẳng góc móc câu
      if (c.hooked) {
        ctx.rotate(this.hook.angle + Math.sin(c.tailAnim) * 0.15);
      } else {
        // Lật mặt theo hướng bơi (1: sang phải, -1: sang trái)
        ctx.scale(c.dir, 1);
      }

      switch (c.category) {
        case 'fish':
          this.renderFish(ctx, c);
          break;
        case 'shrimp':
          this.renderShrimp(ctx, c);
          break;
        case 'crab':
          this.renderCrab(ctx, c);
          break;
        case 'turtle':
          this.renderTurtle(ctx, c);
          break;
        case 'clam':
          this.renderClam(ctx, c);
          break;
        case 'chest':
          this.renderChest(ctx, c);
          break;
        default:
          this.renderFish(ctx, c);
      }
      ctx.restore();
    }
  }

  /* --- CÁC HÀM VẼ TỪNG LOÀI SINH VẬT CHI TIẾT --- */

  renderFish(ctx, c) {
    const isBig = c.type === 'fish_big';
    const isClown = c.type === 'fish_clown';
    const wag = Math.sin(c.tailAnim) * 5;

    // Đuôi cá (vẫy nhẹ)
    ctx.fillStyle = c.accentColor;
    ctx.beginPath();
    ctx.moveTo(-c.w * 0.35, 0);
    ctx.lineTo(-c.w * 0.75, -c.h * 0.45 + wag);
    ctx.lineTo(-c.w * 0.55, 0);
    ctx.lineTo(-c.w * 0.75, c.h * 0.45 + wag);
    ctx.closePath();
    ctx.fill();

    // Vây lưng
    ctx.fillStyle = c.accentColor;
    ctx.beginPath();
    ctx.ellipse(-c.w * 0.1, -c.h * 0.45, c.w * 0.22, c.h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thân cá
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, c.w * 0.5, c.h * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Họa tiết riêng
    if (isClown) {
      // Sọc trắng cá hề
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-c.w * 0.1, -c.h * 0.45, c.w * 0.14, c.h * 0.9);
      ctx.fillRect(c.w * 0.15, -c.h * 0.35, c.w * 0.1, c.h * 0.7);
    } else if (isBig) {
      // Vảy vàng lấp lánh cho cá chép vàng đại
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI);
      ctx.arc(-14, 2, 7, 0, Math.PI);
      ctx.stroke();
    }

    // Mắt cá to tròn ngộ nghĩnh
    const eyeX = c.w * 0.25;
    const eyeY = -c.h * 0.12;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, isBig ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(eyeX + (c.hooked ? 0 : 1.2), eyeY, isBig ? 3.2 : 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Đốm sáng trong mắt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + 0.8, eyeY - 1, isBig ? 1.5 : 1, 0, Math.PI * 2);
    ctx.fill();

    // Vây ngực vẫy
    ctx.fillStyle = c.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, c.h * 0.15, c.w * 0.18, c.h * 0.15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  renderShrimp(ctx, c) {
    const isGiant = c.type === 'shrimp_giant';
    const kick = Math.sin(c.tailAnim) * 3;

    // Râu tôm dài
    ctx.strokeStyle = c.accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c.w * 0.35, -c.h * 0.2);
    ctx.quadraticCurveTo(c.w * 0.65, -c.h * 0.7, c.w * 0.9, -c.h * 0.5);
    ctx.moveTo(c.w * 0.35, -c.h * 0.1);
    ctx.quadraticCurveTo(c.w * 0.7, -c.h * 0.4, c.w * 0.95, -c.h * 0.2);
    ctx.stroke();

    // Càng tôm (đặc biệt tôm càng xanh có càng dài ngộ nghĩnh)
    if (isGiant) {
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.w * 0.3, c.h * 0.1);
      ctx.lineTo(c.w * 0.65, c.h * 0.4);
      ctx.lineTo(c.w * 0.85, c.h * 0.25);
      ctx.stroke();
    }

    // Các đốt thân tôm cong cong
    ctx.fillStyle = c.color;
    for (let i = 0; i < 4; i++) {
      const segX = (i - 1.5) * (c.w * 0.2);
      const segY = Math.pow(i - 1.5, 2) * 1.5 + (i === 3 ? kick : 0);
      ctx.beginPath();
      ctx.ellipse(segX, segY, c.w * 0.16, c.h * 0.35, (i - 1.5) * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Đuôi tôm xòe
    ctx.fillStyle = c.accentColor;
    ctx.beginPath();
    ctx.moveTo(-c.w * 0.45, kick);
    ctx.lineTo(-c.w * 0.75, -c.h * 0.3 + kick);
    ctx.lineTo(-c.w * 0.75, c.h * 0.3 + kick);
    ctx.closePath();
    ctx.fill();

    // Mắt tôm lồi đen bóng
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(c.w * 0.32, -c.h * 0.22, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  renderCrab(ctx, c) {
    const isBig = c.type === 'crab_big';
    const pinch = Math.sin(c.tailAnim * 1.5) * 4;

    // 6 chân nhỏ bò lăng xăng
    ctx.strokeStyle = c.color;
    ctx.lineWidth = isBig ? 3.5 : 2.5;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const legX = (i - 1) * 11;
        const legY = 4;
        const legWag = Math.sin(c.tailAnim * 2 + i * 2) * 4;
        ctx.beginPath();
        ctx.moveTo(legX, legY);
        ctx.lineTo(legX + side * 14, legY + 8 + legWag);
        ctx.lineTo(legX + side * 20, legY + 16);
        ctx.stroke();
      }
    }

    // Hai càng to bự nhấp nháy kẹp kẹp
    for (const side of [-1, 1]) {
      ctx.fillStyle = c.accentColor;
      ctx.beginPath();
      const armBaseX = side * (c.w * 0.35);
      const clawX = side * (c.w * 0.65);
      const clawY = -c.h * 0.35;

      ctx.ellipse(clawX, clawY, isBig ? 13 : 9, isBig ? 9 : 6, side * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Đầu kẹp càng
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + side * (isBig ? 12 : 8), clawY - (isBig ? 8 : 5) - pinch);
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + side * (isBig ? 12 : 8), clawY + (isBig ? 6 : 4) + pinch);
      ctx.stroke();
    }

    // Mai cua tròn
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, c.w * 0.44, c.h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hai mắt có cuống nhô cao
    for (const ex of [-c.w * 0.16, c.w * 0.16]) {
      ctx.fillStyle = c.color;
      ctx.fillRect(ex - 2, -c.h * 0.55, 4, c.h * 0.2);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, -c.h * 0.55, isBig ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ex, -c.h * 0.55, isBig ? 2.8 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderTurtle(ctx, c) {
    const paddle = Math.sin(c.tailAnim) * 4;

    // Bốn chân bơi chèo
    ctx.fillStyle = '#15803d';
    // Chân trước
    ctx.beginPath();
    ctx.ellipse(c.w * 0.25, -c.h * 0.4 + paddle, 10, 5, -0.6, 0, Math.PI * 2);
    ctx.ellipse(c.w * 0.25, c.h * 0.4 - paddle, 10, 5, 0.6, 0, Math.PI * 2);
    // Chân sau
    ctx.ellipse(-c.w * 0.28, -c.h * 0.35 - paddle, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(-c.w * 0.28, c.h * 0.35 + paddle, 8, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Đầu rùa ngó nghiêng
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(c.w * 0.45, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mắt rùa
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(c.w * 0.48, -2.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mai rùa hình vòm màu xanh sọc vàng
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, c.w * 0.38, c.h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vân mai lục giác
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  renderClam(ctx, c) {
    // Vỏ sò mở ra hé lộ ngọc trai lấp lánh
    const openH = Math.max(0, c.openAnim * 8);

    // Vỏ dưới
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 4, c.w * 0.45, c.h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Viên ngọc trai sáng lấp lánh
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 2 - openH * 0.3, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 2 - openH * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Vỏ trên hé mở
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(0, -2 - openH, c.w * 0.45, c.h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  renderChest(ctx, c) {
    // Hòm kho báu gỗ viền vàng
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-c.w * 0.45, -c.h * 0.4, c.w * 0.9, c.h * 0.8);

    // Nắp vòm
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(0, -c.h * 0.4, c.w * 0.45, Math.PI, 0);
    ctx.fill();

    // Đai vàng kim loại
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-c.w * 0.45, -c.h * 0.05, c.w * 0.9, 5);
    ctx.fillRect(-c.w * 0.28, -c.h * 0.7, 5, c.h * 1.1);
    ctx.fillRect(c.w * 0.22, -c.h * 0.7, 5, c.h * 1.1);

    // Ổ khóa vàng
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(-1, 2, 2, 4);
  }

  /* --- MÓC CÂU, CẦU TÀU & GIAO DIỆN MẶT NƯỚC --- */

  drawHook(ctx) {
    const h = this.hook;
    const tipX = this.origin.x + Math.sin(h.angle) * h.length;
    const tipY = this.origin.y + Math.cos(h.angle) * h.length;

    // 1. Dây cước câu cá (Line)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.origin.x, this.origin.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // 2. Đầu móc câu kim loại vàng (Claw / Hook)
    ctx.translate(tipX, tipY);
    ctx.rotate(h.angle);

    // Chốt nối dây
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Hai ngạnh móc câu (Claw jaws)
    const openAngle = 0.35 + h.clawOpen * 0.35;
    ctx.strokeStyle = '#fef08a';
    ctx.fillStyle = '#ca8a04';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const jx = side * (8 + h.clawOpen * 6);
      const jy = 10;
      const tipJx = side * (14 + h.clawOpen * 8);
      const tipJy = 18;
      ctx.quadraticCurveTo(jx, jy, tipJx, tipJy);
      // Mũi móc nhọn quay ngược lên
      ctx.lineTo(tipJx - side * 4, tipJy - 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDock(ctx) {
    ctx.save();
    // Bến thuyền / Cầu gỗ ở mép trên
    const dockW = 190;
    const dockH = 50;
    const dockX = this.origin.x - dockW / 2;
    const dockY = 10;

    // Bóng đổ trên mặt nước
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(dockX - 6, dockY + dockH, dockW + 12, 12);

    // Ván gỗ màu nâu ấm
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(dockX, dockY, dockW, dockH);

    // Từng thanh ván gỗ
    ctx.strokeStyle = '#583101';
    ctx.lineWidth = 2;
    for (let x = dockX + 16; x < dockX + dockW; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, dockY);
      ctx.lineTo(x, dockY + dockH);
      ctx.stroke();
    }

    // Cọc gỗ neo thuyền hai bên
    for (const px of [dockX + 12, dockX + dockW - 12]) {
      ctx.fillStyle = '#713f12';
      ctx.fillRect(px - 6, dockY - 8, 12, 34);
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(px, dockY - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cuộn dây thừng & Ống đựng cần câu
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(this.origin.x - 48, dockY + 28, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Xô đựng cá đỏ xinh xắn
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(this.origin.x + 36, dockY + 16, 18, 22);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.origin.x + 45, dockY + 16, 9, Math.PI, 0);
    ctx.fill();

    // Ròng rọc dây câu tại vị trí origin
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(this.origin.x, this.origin.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(this.origin.x, this.origin.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Lá sen & Hoa sen hồng trên mặt hồ gần bờ
    const pads = [
      { x: 120, y: 64, r: 18 },
      { x: 145, y: 70, r: 14 },
      { x: 610, y: 65, r: 19 },
      { x: 635, y: 60, r: 13 }
    ];
    for (const p of pads) {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0.3, Math.PI * 1.85);
      ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fill();
    }

    // Hoa sen hồng nở rộ
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(140, 62, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(625, 58, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    // Các hạt confetti / bọt nước
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chữ điểm nổi
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px "Nunito", sans-serif';

    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.save();
      ctx.translate(ft.x, ft.y);
      if (ft.scale) ctx.scale(ft.scale, ft.scale);

      // Viền đen tạo độ sắc nét
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, 0, 0);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
}
