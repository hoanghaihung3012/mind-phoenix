/**
 * Học Viện Phú Thọ - Minigame Sân Bóng Rổ (Basketball Shooting Minigame)
 * Chế độ ném bóng vào rổ vui nhộn giải trí cho học sinh sau giờ học.
 * ĐẶC BIỆT: Chơi vui thuần túy, KHÔNG tính điểm kinh nghiệm (XP) hay cấp độ (Level) học viện.
 */

export class BasketballMinigame {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.sound = options.sound || null;
    this.onClose = options.onClose || (() => {});

    // Game Mode: 'free' (tự do), 'challenge' (10 lượt ném), 'timed' (60s thử thách)
    this.mode = 'challenge';
    this.maxShots = 10;
    this.shots = 0;
    this.baskets = 0;
    this.points = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.timeRemaining = 60;
    this.roundComplete = false;

    // Kích thước canvas (760 x 440)
    this.width = 760;
    this.height = 440;

    // Thông số Bảng rổ & Vành rổ
    this.hoop = {
      // Bảng rổ (Backboard)
      backboardX: 310,
      backboardY: 65,
      backboardW: 140,
      backboardH: 90,
      // Ô vuông tiêu chuẩn trong bảng rổ
      innerX: 350,
      innerY: 105,
      innerW: 60,
      innerH: 42,
      // Vành rổ (Rim)
      rimY: 145,
      rimLeftX: 345,
      rimRightX: 415,
      rimRadius: 5.5,
      rimWidth: 70,
      // Lưới (Net)
      netH: 48,
      netWave: 0,
      netTension: 0
    };

    // Vị trí bóng
    this.ballSpot = { x: 380, y: 355 };
    this.ball = {
      x: this.ballSpot.x,
      y: this.ballSpot.y,
      r: 21,
      vx: 0,
      vy: 0,
      rot: 0,
      rotSpeed: 0,
      state: 'ready', // 'ready', 'aiming', 'flying', 'scored', 'missed'
      touchedRim: false,
      scored: false,
      bounces: 0
    };

    // Chuỗi ngắm bắn (Aiming Trajectory)
    this.aim = {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      power: 0,
      angle: 0
    };

    // Hiệu ứng hạt & text nổi
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = 0;

    this.animId = null;
    this.lastTime = performance.now();
    this.nextShotTimer = null;

    this.setupEvents();
  }

  setupEvents() {
    if (!this.canvas) return;

    const getCanvasPos = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const handlePointerDown = (clientX, clientY) => {
      if (this.ball.state !== 'ready' || this.roundComplete) return;
      const pos = getCanvasPos(clientX, clientY);

      this.aim.active = true;
      this.aim.startX = pos.x;
      this.aim.startY = pos.y;
      this.aim.currentX = pos.x;
      this.aim.currentY = pos.y;
    };

    const handlePointerMove = (clientX, clientY) => {
      if (!this.aim.active || this.ball.state !== 'ready') return;
      const pos = getCanvasPos(clientX, clientY);
      this.aim.currentX = pos.x;
      this.aim.currentY = pos.y;
    };

    const handlePointerUp = () => {
      if (!this.aim.active || this.ball.state !== 'ready') return;
      this.aim.active = false;

      // Tính lực và góc ném dựa trên khoảng cách kéo (Drag or Tap)
      const dx = this.aim.startX - this.aim.currentX;
      const dy = this.aim.startY - this.aim.currentY;
      const dragDist = Math.hypot(dx, dy);

      if (dragDist > 18) {
        // Kéo thả theo kiểu súng cao su / ngắm bắn thể thao
        const powerScale = Math.min(1.4, Math.max(0.4, dragDist / 90));
        let vx = (dx / dragDist) * 380 * powerScale;
        let vy = (dy / dragDist) * 580 * powerScale;

        // Nếu kéo hướng xuống thì đảo ngược để ném hướng lên rổ
        if (vy > 0) vy = -Math.abs(vy);
        // Đảm bảo bóng có lực bay lên
        if (Math.abs(vy) < 320) vy = -460;

        this.shootBall(vx, vy);
      } else {
        // Chạm / Click trực tiếp vào một điểm trên sân
        const targetX = this.aim.startX;
        const targetY = this.aim.startY;
        this.shootTowards(targetX, targetY);
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handlePointerDown(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.aim.active) handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      if (this.aim.active) handlePointerUp();
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.aim.active && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.aim.active) handlePointerUp();
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.resetMatch();
  }

  resetMatch() {
    this.shots = 0;
    this.baskets = 0;
    this.points = 0;
    this.streak = 0;
    this.timeRemaining = 60;
    this.roundComplete = false;
    this.resetBall();
    this.updateUI();

    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const overlay = document.getElementById('basketballResultOverlay');
      if (overlay) overlay.classList.add('hidden');
      const ann = document.getElementById('basketballAnnounce');
      if (ann) ann.classList.add('hidden');
    }
  }

  resetBall() {
    if (this.nextShotTimer) {
      clearTimeout(this.nextShotTimer);
      this.nextShotTimer = null;
    }
    // Đổi vị trí bóng nhẹ để tạo sự đa dạng các góc ném
    const offset = (Math.random() - 0.5) * 120;
    this.ball.x = this.ballSpot.x + offset;
    this.ball.y = this.ballSpot.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.rot = 0;
    this.ball.rotSpeed = 0;
    this.ball.state = 'ready';
    this.ball.touchedRim = false;
    this.ball.scored = false;
    this.ball.bounces = 0;
  }

  shootTowards(targetX, targetY) {
    const startX = this.ball.x;
    const startY = this.ball.y;

    // Giới hạn target vào khu vực bảng rổ
    const tX = Math.max(220, Math.min(540, targetX));
    const tY = Math.max(50, Math.min(200, targetY));

    // Tính toán vận tốc đường đạn parabol để bóng bay tới đích
    const dx = tX - startX;
    const dy = tY - startY;
    const g = 720;
    const flightTime = 0.85;

    const vx = dx / flightTime;
    const vy = (dy - 0.5 * g * flightTime * flightTime) / flightTime;

    this.shootBall(vx, vy);
  }

  shootBall(vx, vy) {
    if (this.ball.state !== 'ready' || this.roundComplete) return;

    this.ball.state = 'flying';
    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.rotSpeed = (Math.random() - 0.5) * 8 + (vx > 0 ? 4 : -4);
    this.ball.touchedRim = false;
    this.ball.scored = false;
    this.ball.bounces = 0;

    this.shots++;
    this.updateUI();

    if (this.sound && typeof this.sound.playBasketballShoot === 'function') {
      this.sound.playBasketballShoot();
    } else if (this.sound && typeof this.sound.playClick === 'function') {
      this.sound.playClick();
    }
  }

  start() {
    this.resetMatch();
    this.lastTime = performance.now();
    if (!this.animId) {
      this.loop();
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.nextShotTimer) {
      clearTimeout(this.nextShotTimer);
      this.nextShotTimer = null;
    }
  }

  loop() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    // 1. Cập nhật thời gian nếu ở chế độ 60s
    if (this.mode === 'timed' && !this.roundComplete) {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
      if (this.timeRemaining <= 0) {
        this.finishRound();
      }
    }

    // 2. Vật lý bóng rổ
    const b = this.ball;
    const h = this.hoop;
    const g = 720; // Trọng lực (px/s²)

    if (b.state === 'flying' || b.state === 'bouncing') {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += g * dt;
      b.rot += b.rotSpeed * dt;

      // 3. Va chạm Bảng rổ (Backboard)
      if (
        b.x + b.r > h.backboardX &&
        b.x - b.r < h.backboardX + h.backboardW &&
        b.y + b.r > h.backboardY &&
        b.y - b.r < h.backboardY + h.backboardH
      ) {
        // Va chạm mặt trước bảng rổ (chỉ khi bóng nằm cao hơn vành rổ)
        if (b.y < h.rimY - 10) {
          b.vx = -b.vx * 0.65;
          b.vy = b.vy * 0.6;
          b.touchedRim = true;
          this.triggerBounceSound();
          this.spawnHitParticles(b.x, b.y, '#ffffff');
        }
      }

      // 4. Va chạm Vành rổ (Left Rim & Right Rim)
      const checkRimCollision = (rx, ry) => {
        const dx = b.x - rx;
        const dy = b.y - ry;
        const dist = Math.hypot(dx, dy);
        if (dist < b.r + h.rimRadius) {
          // Phản xạ góc va chạm
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const dot = b.vx * nx + b.vy * ny;
          if (dot < 0) {
            b.vx = (b.vx - 2 * dot * nx) * 0.68;
            b.vy = (b.vy - 2 * dot * ny) * 0.68;
            b.touchedRim = true;
            this.triggerRimSound();
            this.spawnHitParticles(rx, ry, '#ea580c');
          }
        }
      };

      checkRimCollision(h.rimLeftX, h.rimY);
      checkRimCollision(h.rimRightX, h.rimY);

      // 5. Kiểm tra Bóng lọt vào rổ (Score Check)
      if (
        !b.scored &&
        b.vy > 0 && // Bóng đang rơi xuống
        b.y > h.rimY - 4 &&
        b.y < h.rimY + 22 &&
        b.x > h.rimLeftX + 8 &&
        b.x < h.rimRightX - 8
      ) {
        // GHI ĐIỂM!
        this.handleScore(b);
      }

      // 6. Va chạm sàn nhà (Floor Bounce)
      const floorY = 405;
      if (b.y + b.r >= floorY) {
        b.y = floorY - b.r;
        b.vy = -b.vy * 0.58;
        b.vx = b.vx * 0.75;
        b.rotSpeed *= 0.7;
        b.bounces++;

        if (Math.abs(b.vy) > 60) {
          this.triggerBounceSound();
        }

        if (b.bounces >= 3 || Math.abs(b.vy) < 40) {
          // Bóng đã dừng hẳn
          this.handleShotEnd();
        }
      }

      // Va chạm 2 mép tường bên
      if (b.x - b.r < 15) {
        b.x = 15 + b.r;
        b.vx = -b.vx * 0.6;
      } else if (b.x + b.r > this.width - 15) {
        b.x = this.width - 15 - b.r;
        b.vx = -b.vx * 0.6;
      }
    }

    // 7. Hoạt họa lưới rổ (Net physics wave)
    if (h.netTension > 0) {
      h.netTension = Math.max(0, h.netTension - dt * 2.5);
      h.netWave += dt * 14;
    }

    // 8. Cập nhật hạt & text nổi
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.life -= dt * 1.4;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 45 * dt;
      ft.life -= dt * 1.1;
      ft.alpha = Math.max(0, ft.life);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 12);
    }
  }

  handleScore(ball) {
    ball.scored = true;
    ball.state = 'scored';

    // Lưới rổ rung lên bồng bềnh
    this.hoop.netTension = 1.0;
    this.hoop.netWave = 0;

    // Phân loại cú ném: Swish (vào thẳng không chạm vành) hoặc vào thường
    const isSwish = !ball.touchedRim;
    const pts = isSwish ? 3 : 2;
    this.points += pts;
    this.baskets++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;

    // Âm thanh lưới sột soạt tuyệt phẩm
    if (this.sound && typeof this.sound.playBasketballSwish === 'function') {
      this.sound.playBasketballSwish();
    } else if (this.sound && typeof this.sound.playGoal === 'function') {
      this.sound.playGoal();
    }

    // Hiển thị thông báo vui nhộn
    let text = isSwish ? 'SWISH TUYỆT ĐỈNH! 🎯 +3' : 'VÀO RỔ! 🏀 +2';
    if (this.streak >= 3) text += ` · COMBO x${this.streak} 🔥`;

    this.showAnnouncement(text, isSwish ? '#10b981' : '#f59e0b');
    this.addFloatingText(text, this.hoop.rimLeftX + 35, this.hoop.rimY - 20, isSwish ? '#10b981' : '#f59e0b');

    // Nổ pháo hoa hạt nhiều màu
    this.spawnConfetti(this.hoop.rimLeftX + 35, this.hoop.rimY + 15);
    this.screenShake = 4.5;

    this.updateUI();
  }

  handleShotEnd() {
    if (this.ball.state === 'ready') return;

    if (!this.ball.scored) {
      // Ném trượt
      this.streak = 0;
      this.updateUI();
    }

    // Kiểm tra kết thúc round ở mode 10 lượt
    if (this.mode === 'challenge' && this.shots >= this.maxShots) {
      this.nextShotTimer = setTimeout(() => {
        this.finishRound();
      }, 700);
      return;
    }

    // Chuẩn bị quả bóng tiếp theo
    this.nextShotTimer = setTimeout(() => {
      this.resetBall();
    }, 550);
  }

  finishRound() {
    this.roundComplete = true;
    this.ball.state = 'ready';

    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const overlay = document.getElementById('basketballResultOverlay');
      const titleEl = document.getElementById('basketballResultTitle');
      const scoreEl = document.getElementById('basketballResultScore');
      const descEl = document.getElementById('basketballResultDesc');

      if (overlay && titleEl && scoreEl && descEl) {
        titleEl.textContent = 'Kết Thúc Vòng Ném!';
        const accuracy = this.shots > 0 ? Math.round((this.baskets / this.shots) * 100) : 0;
        scoreEl.textContent = `${this.baskets}/${this.shots} Quả Vào (${accuracy}%)`;

        if (accuracy >= 80) {
          descEl.textContent = '🌟 Đẳng cấp xạ thủ bóng rổ xuất sắc! Cú ném vô cùng chuẩn xác!';
        } else if (accuracy >= 50) {
          descEl.textContent = '👏 Rất tuyệt vời! Bạn có cảm giác bóng và lực ném rất tốt!';
        } else {
          descEl.textContent = '💪 Rèn luyện thể chất hăng say! Cố gắng ngắm chuẩn hơn ở lượt sau nhé!';
        }

        overlay.classList.remove('hidden');
      }
    }

    if (this.sound && typeof this.sound.playSuccess === 'function') {
      this.sound.playSuccess();
    }
  }

  triggerBounceSound() {
    if (this.sound && typeof this.sound.playBasketballBounce === 'function') {
      this.sound.playBasketballBounce();
    } else if (this.sound && typeof this.sound.playClick === 'function') {
      this.sound.playClick();
    }
  }

  triggerRimSound() {
    if (this.sound && typeof this.sound.playBasketballRim === 'function') {
      this.sound.playBasketballRim();
    } else if (this.sound && typeof this.sound.playCrossbar === 'function') {
      this.sound.playCrossbar();
    }
  }

  spawnHitParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 180,
        vy: -40 - Math.random() * 120,
        color,
        size: 3 + Math.random() * 3,
        life: 0.6,
        alpha: 1
      });
    }
  }

  spawnConfetti(x, y) {
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
    for (let i = 0; i < 36; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 320,
        vy: -160 - Math.random() * 240,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 5,
        life: 1.0 + Math.random() * 0.4,
        alpha: 1
      });
    }
  }

  addFloatingText(text, x, y, color = '#f59e0b') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      life: 1.2,
      alpha: 1
    });
  }

  showAnnouncement(msg, color = '#f59e0b') {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const ann = document.getElementById('basketballAnnounce');
    if (!ann) return;
    ann.textContent = msg;
    ann.style.borderColor = color;
    ann.style.color = color;
    ann.classList.remove('hidden');
    clearTimeout(this.annTimeout);
    this.annTimeout = setTimeout(() => {
      ann.classList.add('hidden');
    }, 1600);
  }

  updateUI() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const bEl = document.getElementById('basketballBaskets');
    const sEl = document.getElementById('basketballShots');
    const mEl = document.getElementById('basketballMaxShots');
    const stEl = document.getElementById('basketballStreak');
    const pEl = document.getElementById('basketballPoints');

    if (bEl) bEl.textContent = this.baskets;
    if (sEl) sEl.textContent = this.shots;
    if (mEl) mEl.textContent = this.mode === 'challenge' ? this.maxShots : '∞';
    if (stEl) stEl.textContent = this.streak;
    if (pEl) pEl.textContent = this.points;
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.save();

    // Rung màn hình khi ghi bàn hoặc đập mạnh
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Vẽ nền sân vận động bóng rổ
    this.renderStadiumBackground(ctx);

    // 2. Vẽ bảng rổ & vành rổ phía sau bóng
    this.renderHoopBack(ctx);

    // 3. Vẽ đường ngắm quỹ đạo bóng (Trajectory line dots)
    if (this.aim.active && this.ball.state === 'ready') {
      this.renderAimTrajectory(ctx);
    }

    // 4. Vẽ quả bóng rổ
    this.renderBall(ctx);

    // 5. Vẽ lưới rổ phía trước đè lên quả bóng khi bóng chui qua
    this.renderHoopFront(ctx);

    // 6. Hiệu ứng hạt & text nổi
    this.renderEffects(ctx);

    ctx.restore();
  }

  renderStadiumBackground(ctx) {
    // Tường nhà thi đấu phía sau với gradient sang trọng
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 280);
    wallGrad.addColorStop(0, '#0f172a');
    wallGrad.addColorStop(0.65, '#1e293b');
    wallGrad.addColorStop(1, '#334155');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, this.width, 280);

    // Băng rôn "HỌC VIỆN PHÚ THỌ • SÂN BÓNG RỔ"
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(160, 16, 440, 32);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 16, 440, 32);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏀 HỌC VIỆN PHÚ THỌ · SÂN BÓNG RỔ GIAO HỮU 🏀', 380, 32);

    // Khán đài chibi mờ ảo phía sau
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 30; x < this.width - 30; x += 40) {
      ctx.beginPath();
      ctx.arc(x, 190, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 12, 198, 24, 28);
    }

    // Sàn gỗ bóng rổ vân gỗ vàng bóng bẩy
    const floorGrad = ctx.createLinearGradient(0, 270, 0, this.height);
    floorGrad.addColorStop(0, '#c2410c');
    floorGrad.addColorStop(0.2, '#d97706');
    floorGrad.addColorStop(0.7, '#b45309');
    floorGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 270, this.width, this.height - 270);

    // Các đường nan gỗ phản quang
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 285; y < this.height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Vạch 3 điểm trên sàn (Perspective Arc)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(380, 420, 260, 110, 0, Math.PI, 0);
    ctx.stroke();

    // Vạch ném phạt (Free throw line)
    ctx.beginPath();
    ctx.ellipse(380, 370, 100, 38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Trụ kim loại đỡ bảng rổ
    ctx.fillStyle = '#475569';
    ctx.fillRect(372, 0, 16, 75);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(372, 0, 16, 75);
  }

  renderHoopBack(ctx) {
    const h = this.hoop;

    // 1. Bảng rổ (Kính cường lực trong suốt viền trắng)
    ctx.save();
    ctx.fillStyle = 'rgba(241, 245, 249, 0.88)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.fillRect(h.backboardX, h.backboardY, h.backboardW, h.backboardH);
    ctx.strokeRect(h.backboardX, h.backboardY, h.backboardW, h.backboardH);

    // Ô vuông target màu đỏ cam bên trong
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(h.innerX, h.innerY, h.innerW, h.innerH);
    ctx.restore();

    // 2. Cần đỡ vành rổ kim loại
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(368, 142, 24, 8);

    // 3. Vành rổ phía sau (Half ellipse rim)
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(380, h.rimY, 35, 9, 0, Math.PI, 0);
    ctx.stroke();

    // 4. Các sợi lưới phía sau
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.8;
    const wave = Math.sin(h.netWave) * 8 * h.netTension;
    for (let x = h.rimLeftX + 5; x <= h.rimRightX - 5; x += 10) {
      const btmX = 380 + (x - 380) * 0.45 + wave;
      ctx.beginPath();
      ctx.moveTo(x, h.rimY + 2);
      ctx.lineTo(btmX, h.rimY + h.netH);
      ctx.stroke();
    }
  }

  renderHoopFront(ctx) {
    const h = this.hoop;

    // 1. Các sợi lưới đan caro phía trước
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    const wave = Math.sin(h.netWave) * 10 * h.netTension;

    // Lưới đan chéo
    for (let x = h.rimLeftX + 4; x <= h.rimRightX - 4; x += 12) {
      const btmX = 380 + (x - 380) * 0.5 + wave;
      ctx.beginPath();
      ctx.moveTo(x, h.rimY + 3);
      ctx.lineTo(btmX, h.rimY + h.netH);
      ctx.stroke();
    }

    // Các vòng ngang của lưới
    for (let step = 1; step <= 3; step++) {
      const ny = h.rimY + step * 12;
      const nw = 35 * (1 - step * 0.16);
      ctx.beginPath();
      ctx.ellipse(380 + wave * (step / 3), ny, nw, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Vành rổ phía trước (Front half ellipse rim nổi bật)
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.ellipse(380, h.rimY, 35, 9, 0, 0, Math.PI);
    ctx.stroke();

    // Hai mấu chốt vành rổ
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.arc(h.rimLeftX, h.rimY, h.rimRadius, 0, Math.PI * 2);
    ctx.arc(h.rimRightX, h.rimY, h.rimRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  renderBall(ctx) {
    const b = this.ball;

    ctx.save();
    ctx.translate(b.x, b.y);

    // Bóng đổ xuống sàn
    if (b.y < 390) {
      const distFromFloor = 390 - b.y;
      const shadowScale = Math.max(0.3, 1 - distFromFloor / 380);
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(0, distFromFloor + b.r - 4, b.r * 1.2 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.rotate(b.rot);

    // Thân quả bóng rổ màu cam rực rỡ
    const grad = ctx.createRadialGradient(-6, -6, 2, 0, 0, b.r);
    grad.addColorStop(0, '#fb923c');
    grad.addColorStop(0.7, '#ea580c');
    grad.addColorStop(1, '#9a3412');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Các đường gân đen đặc trưng của bóng rổ
    ctx.strokeStyle = '#291e14';
    ctx.lineWidth = 2.2;

    // Đường ngang và dọc giữa
    ctx.beginPath();
    ctx.moveTo(-b.r + 2, 0);
    ctx.lineTo(b.r - 2, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -b.r + 2);
    ctx.lineTo(0, b.r - 2);
    ctx.stroke();

    // Hai đường vòng cung 2 bên
    ctx.beginPath();
    ctx.arc(-b.r * 0.75, 0, b.r * 0.85, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(b.r * 0.75, 0, b.r * 0.85, (Math.PI * 2) / 3, (Math.PI * 4) / 3);
    ctx.stroke();

    // Đốm sáng phản chiếu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-b.r * 0.35, -b.r * 0.35, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderAimTrajectory(ctx) {
    const dx = this.aim.startX - this.aim.currentX;
    const dy = this.aim.startY - this.aim.currentY;
    const dragDist = Math.hypot(dx, dy);

    if (dragDist < 12) return;

    const powerScale = Math.min(1.4, Math.max(0.4, dragDist / 90));
    let vx = (dx / dragDist) * 380 * powerScale;
    let vy = (dy / dragDist) * 580 * powerScale;
    if (vy > 0) vy = -Math.abs(vy);
    if (Math.abs(vy) < 320) vy = -460;

    let simX = this.ball.x;
    let simY = this.ball.y;
    let simVy = vy;
    const dt = 0.045;
    const g = 720;

    ctx.save();
    for (let step = 0; step < 18; step++) {
      simX += vx * dt;
      simY += simVy * dt;
      simVy += g * dt;

      const alpha = Math.max(0.15, 1 - step / 18);
      const dotRadius = Math.max(2, 5.5 - step * 0.2);

      ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
      ctx.beginPath();
      ctx.arc(simX, simY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mũi tên chỉ hướng kéo
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.ball.x, this.ball.y);
    ctx.lineTo(this.ball.x - dx * 0.5, this.ball.y - dy * 0.5);
    ctx.stroke();

    ctx.restore();
  }

  renderEffects(ctx) {
    // 1. Hạt bắn ra
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Chữ nổi animation
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = 'bold 22px "Nunito", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
