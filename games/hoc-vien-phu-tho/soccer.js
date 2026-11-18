/**
 * Học Viện Phú Thọ - Minigame Sân Đá Banh (Soccer Penalty Shootout)
 * Chế độ sút bóng đá vui nhộn giải trí cho học sinh sau giờ học.
 * ĐẶC BIỆT: Chơi vui thuần túy, KHÔNG tính điểm kinh nghiệm (XP) hay cấp độ (Level) học viện.
 */

export class SoccerMinigame {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.sound = options.sound || null;
    this.onClose = options.onClose || (() => {});

    // Game Mode: 'penalty' (5 lượt) hoặc 'free' (tự do)
    this.mode = 'penalty';
    this.maxShots = 5;
    this.shots = 0;
    this.goals = 0;
    this.streak = 0;
    this.bestStreak = 0;

    // Kích thước thế giới khung thành (canvas: 760 x 440)
    this.width = 760;
    this.height = 440;

    // Thông số khung thành
    this.goal = {
      x: 170,
      y: 95,
      w: 420,
      h: 175,
      postWidth: 10,
      depth: 45
    };

    // Chấm sút penalty
    this.penaltySpot = { x: 380, y: 375 };

    // Trạng thái bóng: 'ready', 'aiming', 'flying', 'result'
    this.ballState = 'ready';
    this.ball = {
      x: this.penaltySpot.x,
      y: this.penaltySpot.y,
      r: 22,
      rotation: 0,
      vx: 0,
      vy: 0,
      targetX: 380,
      targetY: 180,
      progress: 0,
      startX: 380,
      startY: 375,
      curve: 0,
      peakHeight: 60
    };

    // Thủ môn (Goalkeeper)
    this.keeper = {
      x: 380,
      baseY: 250,
      w: 54,
      h: 70,
      vx: 2.2,
      minX: 230,
      maxX: 530,
      diveX: 0,
      diveY: 0,
      isDiving: false,
      diveProgress: 0,
      reactionTimer: 0,
      armAngle: 0,
      color: '#f59e0b', // Áo thủ môn vàng cam
      state: 'patrol' // 'patrol', 'dive', 'catch', 'miss'
    };

    // Lưới bóng đá & Rung lưới
    this.netRung = 0;

    // Hiệu ứng hạt (confetti & pháo hoa khi ghi bàn)
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = 0;

    // Aim pointer & power
    this.aim = {
      active: false,
      x: 380,
      y: 180,
      power: 0.8,
      powerDir: 1
    };

    this.animId = null;
    this.lastTime = performance.now();
    this.resultMessage = '';
    this.roundComplete = false;

    this.setupEvents();
  }

  setupEvents() {
    if (!this.canvas) return;

    // Click hoặc chạm để sút bóng vào vị trí mong muốn
    const handleShootAt = (clientX, clientY) => {
      if (this.ballState !== 'ready' || this.roundComplete) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      // Giới hạn hướng sút hợp lý về phía nửa trên sân bóng
      const clampedX = Math.max(80, Math.min(this.width - 80, clickX));
      const clampedY = Math.max(50, Math.min(270, clickY));

      this.shootBall(clampedX, clampedY);
    };

    this.canvas.addEventListener('mousedown', (e) => {
      handleShootAt(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        e.preventDefault();
        handleShootAt(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    // Hỗ trợ di chuột để xem hồng tâm ngắm bóng
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.ballState !== 'ready' || this.roundComplete) return;
      const rect = this.canvas.getBoundingClientRect();
      this.aim.x = (e.clientX - rect.left) * (this.width / rect.width);
      this.aim.y = (e.clientY - rect.top) * (this.height / rect.height);
      this.aim.active = this.aim.y < 300;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.aim.active = false;
    });
  }

  start() {
    this.resetMatch();
    this.ballState = 'ready';
    this.lastTime = performance.now();
    this.loop();
    if (this.sound) this.sound.playWhistle();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resetMatch() {
    this.shots = 0;
    this.goals = 0;
    this.streak = 0;
    this.roundComplete = false;
    this.particles = [];
    this.floatingTexts = [];
    this.resetBall();
    this.updateUI();
  }

  resetBall() {
    this.ballState = 'ready';
    this.ball.x = this.penaltySpot.x;
    this.ball.y = this.penaltySpot.y;
    this.ball.r = 22;
    this.ball.rotation = 0;
    this.ball.progress = 0;
    this.keeper.state = 'patrol';
    this.keeper.isDiving = false;
    this.keeper.diveProgress = 0;
    this.keeper.reactionTimer = 0;
    this.resultMessage = '';
  }

  setMode(mode) {
    this.mode = mode;
    this.resetMatch();
  }

  shootBall(targetX, targetY) {
    if (this.ballState !== 'ready') return;

    this.ballState = 'flying';
    this.shots++;
    this.ball.startX = this.penaltySpot.x;
    this.ball.startY = this.penaltySpot.y;
    this.ball.targetX = targetX;
    this.ball.targetY = targetY;
    this.ball.progress = 0;

    // Độ xoáy ngẫu nhiên nhẹ
    this.ball.curve = (Math.random() - 0.5) * 40;

    // Âm thanh sút bóng
    if (this.sound && this.sound.playKick) {
      this.sound.playKick();
    } else if (this.sound && this.sound.playClick) {
      this.sound.playClick();
    }

    // Thủ môn phản xạ sau 0.12s
    this.keeper.reactionTimer = 0.12;

    // Dự đoán hướng thủ môn sẽ bay người bắt bóng
    // 70% thủ môn đoán đúng hướng sang trái hoặc sang phải, 30% bị lừa hướng
    const shotToLeft = targetX < this.goal.x + this.goal.w / 2;
    const keeperGuessedRight = Math.random() < 0.65;
    const keeperDivesLeft = keeperGuessedRight ? shotToLeft : !shotToLeft;

    // Điểm thủ môn bay tới
    const keeperTargetX = keeperDivesLeft
      ? Math.max(this.goal.x + 35, targetX + (Math.random() - 0.45) * 60)
      : Math.min(this.goal.x + this.goal.w - 35, targetX + (Math.random() - 0.45) * 60);

    const keeperTargetY = Math.max(this.goal.y + 40, Math.min(this.goal.y + this.goal.h - 15, targetY));

    this.keeper.diveTargetX = keeperTargetX;
    this.keeper.diveTargetY = keeperTargetY;

    this.updateUI();
  }

  update(dt) {
    // 1. Cập nhật thủ môn
    if (this.keeper.state === 'patrol') {
      this.keeper.x += this.keeper.vx;
      if (this.keeper.x > this.keeper.maxX || this.keeper.x < this.keeper.minX) {
        this.keeper.vx = -this.keeper.vx;
      }
    } else if (this.keeper.state === 'diving') {
      this.keeper.diveProgress += dt * 3.2;
      const t = Math.min(1, this.keeper.diveProgress);
      this.keeper.x += (this.keeper.diveTargetX - this.keeper.x) * 0.18;
    }

    // 2. Cập nhật bóng bay
    if (this.ballState === 'flying') {
      if (this.keeper.reactionTimer > 0) {
        this.keeper.reactionTimer -= dt;
        if (this.keeper.reactionTimer <= 0) {
          this.keeper.state = 'diving';
          this.keeper.isDiving = true;
          this.keeper.diveProgress = 0;
        }
      }

      this.ball.progress += dt * 1.55; // Thời gian bay ~0.65 giây
      const t = Math.min(1, this.ball.progress);

      // Nội suy tọa độ
      const currentX = this.ball.startX + (this.ball.targetX - this.ball.startX) * t + Math.sin(t * Math.PI) * (this.ball.curve * 0.4);
      const currentY = this.ball.startY + (this.ball.targetY - this.ball.startY) * t;

      this.ball.x = currentX;
      this.ball.y = currentY;

      // Giảm kích thước bán kính tạo hiệu ứng chiều sâu 3D bay vào xa
      this.ball.r = 22 - t * 9; // Giảm từ 22 xuống 13
      this.ball.rotation += dt * 16;

      // Khi bóng bay đến vạch khung thành
      if (t >= 1) {
        this.evaluateShot();
      }
    }

    // 3. Rung lưới
    if (this.netRung > 0) {
      this.netRung = Math.max(0, this.netRung - dt * 2.5);
    }

    // 4. Rung màn hình
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    // 5. Cập nhật hạt confetti / hiệu ứng
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt; // trọng lực
      p.life -= dt * 1.2;
      p.rotation += (p.vRot || 4) * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Cập nhật chữ nổi
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 35 * dt;
      ft.alpha -= dt * 0.9;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  evaluateShot() {
    this.ballState = 'result';
    const bx = this.ball.x;
    const by = this.ball.y;

    const gx = this.goal.x;
    const gy = this.goal.y;
    const gw = this.goal.w;
    const gh = this.goal.h;

    // Kiểm tra trúng cột dọc hoặc xà ngang
    const hitLeftPost = Math.abs(bx - gx) < 14 && by >= gy && by <= gy + gh;
    const hitRightPost = Math.abs(bx - (gx + gw)) < 14 && by >= gy && by <= gy + gh;
    const hitCrossbar = Math.abs(by - gy) < 14 && bx >= gx - 10 && bx <= gx + gw + 10;

    if (hitLeftPost || hitRightPost || hitCrossbar) {
      this.screenShake = 6;
      this.streak = 0;
      if (this.sound && this.sound.playCrossbar) {
        this.sound.playCrossbar();
      }
      this.showFeedback('💥 BÓNG DỘI XÀ / CỘT DỌC!', '#f59e0b');
      this.scheduleNextRound(1600);
      return;
    }

    // Kiểm tra ra ngoài khung thành
    const isInsideGoal = bx > gx + 10 && bx < gx + gw - 10 && by > gy + 10 && by < gy + gh;
    if (!isInsideGoal) {
      this.streak = 0;
      if (this.sound && this.sound.playClick) this.sound.playClick();
      this.showFeedback('💨 SÚT RA NGOÀI KHUNG THÀNH!', '#94a3b8');
      this.scheduleNextRound(1500);
      return;
    }

    // Kiểm tra thủ môn cản phá
    // Vùng bao tay & thân của thủ môn
    const keeperBox = {
      x: this.keeper.x - 36,
      y: (this.keeper.diveTargetY || this.keeper.baseY) - 50,
      w: 72,
      h: 80
    };

    const isSavedByKeeper = bx >= keeperBox.x && bx <= keeperBox.x + keeperBox.w &&
                            by >= keeperBox.y && by <= keeperBox.y + keeperBox.h;

    if (isSavedByKeeper) {
      this.keeper.state = 'catch';
      this.streak = 0;
      if (this.sound && this.sound.playClick) this.sound.playClick();
      this.showFeedback('🧤 THỦ MÔN CẢN PHÁ XUẤT SẮC!', '#3b82f6');
      this.scheduleNextRound(1600);
      return;
    }

    // VÀOOOOO! GHI BÀN THẮNG!
    this.goals++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    this.netRung = 1;
    this.spawnGoalParticles(bx, by);

    if (this.sound && this.sound.playGoal) {
      this.sound.playGoal();
    } else if (this.sound && this.sound.playSuccess) {
      this.sound.playSuccess();
    }

    const streakMsg = this.streak > 1 ? ` 🔥 Chuỗi ${this.streak} bàn!` : '';
    this.showFeedback(`⚽ VÀOOOOOO! GOAL!${streakMsg}`, '#10b981');
    this.scheduleNextRound(1800);
  }

  showFeedback(text, color = '#10b981') {
    this.resultMessage = text;
    this.floatingTexts.push({
      text,
      color,
      x: this.width / 2,
      y: 160,
      alpha: 1
    });

    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const announceEl = document.getElementById('soccerAnnounce');
    if (announceEl) {
      announceEl.textContent = text;
      announceEl.style.color = color;
      announceEl.classList.remove('hidden');
      setTimeout(() => {
        if (announceEl) announceEl.classList.add('hidden');
      }, 1500);
    }
  }

  spawnGoalParticles(x, y) {
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ffffff'];
    for (let i = 0; i < 48; i++) {
      const angle = (Math.PI * 2 * i) / 48 + (Math.random() - 0.5) * 0.4;
      const speed = 80 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        life: 1,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 12
      });
    }
  }

  scheduleNextRound(delayMs) {
    this.updateUI();
    setTimeout(() => {
      if (this.mode === 'penalty' && this.shots >= this.maxShots) {
        this.finishMatch();
      } else {
        this.resetBall();
      }
    }, delayMs);
  }

  finishMatch() {
    this.roundComplete = true;
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const overlay = document.getElementById('soccerResultOverlay');
    const resultScore = document.getElementById('soccerResultScore');
    const resultTitle = document.getElementById('soccerResultTitle');
    const resultDesc = document.getElementById('soccerResultDesc');

    if (overlay && resultScore) {
      resultScore.textContent = `${this.goals}/${this.maxShots} Bàn Thắng`;

      let title = 'Cầu Thủ Nhí Tiềm Năng! 🌟';
      let desc = 'Những cú sút đầy tự tin trên sân bóng trường Phú Thọ!';
      if (this.goals === 5) {
        title = 'Vua Phá Lưới Phú Thọ Hoàn Hảo! 🏆';
        desc = '5/5 bàn thắng tuyệt đỉnh! Kỹ năng sút bóng đỉnh cao chuẩn siêu sao sân cỏ!';
      } else if (this.goals >= 3) {
        title = 'Tiền Đạo Xuất Sắc Của Trường! 🥇';
        desc = 'Khả năng nhắm góc và sút bóng rất hiểm hóc, làm thủ môn bó tay!';
      } else if (this.goals >= 1) {
        title = 'Rèn Luyện Khỏe Mạnh! ⚽';
        desc = 'Cố gắng nhắm vào 2 góc chữ A của khung thành để ghi nhiều bàn hơn nhé!';
      }

      if (resultTitle) resultTitle.textContent = title;
      if (resultDesc) resultDesc.textContent = desc;

      overlay.classList.remove('hidden');
    }
  }

  updateUI() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const goalsEl = document.getElementById('soccerGoals');
    const shotsEl = document.getElementById('soccerShots');
    const maxShotsEl = document.getElementById('soccerMaxShots');
    const streakEl = document.getElementById('soccerStreak');

    if (goalsEl) goalsEl.textContent = this.goals;
    if (shotsEl) shotsEl.textContent = this.shots;
    if (maxShotsEl) maxShotsEl.textContent = this.mode === 'penalty' ? this.maxShots : '∞';
    if (streakEl) streakEl.textContent = this.streak;
  }

  loop() {
    const now = performance.now();
    const dt = Math.min(0.08, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(() => this.loop());
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Rung màn hình khi trúng xà ngang
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Vẽ Bầu trời & Khán đài phía sau
    this.drawSkyAndStadium(ctx);

    // 2. Vẽ Mặt cỏ sân bóng đá
    this.drawPitch(ctx);

    // 3. Vẽ Khung thành bóng đá & Lưới
    this.drawGoal(ctx);

    // 4. Vẽ Thủ môn
    this.drawKeeper(ctx);

    // 5. Vẽ Quả bóng đá
    this.drawBall(ctx);

    // 6. Vẽ Aim Pointer (nếu đang sẵn sàng sút)
    if (this.ballState === 'ready' && !this.roundComplete && this.aim.active) {
      this.drawAimPointer(ctx);
    }

    // 7. Vẽ Hạt hiệu ứng (Particles)
    this.drawParticles(ctx);

    // 8. Vẽ Chữ nổi thông báo
    this.drawFloatingTexts(ctx);

    ctx.restore();
  }

  drawSkyAndStadium(ctx) {
    // Bầu trời chuyển sắc xanh tươi sáng
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 160);
    skyGrad.addColorStop(0, '#60a5fa');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, 160);

    // Mây bồng bềnh
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(140, 45, 24, 0, Math.PI * 2);
    ctx.arc(170, 38, 30, 0, Math.PI * 2);
    ctx.arc(205, 45, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(580, 50, 20, 0, Math.PI * 2);
    ctx.arc(610, 42, 28, 0, Math.PI * 2);
    ctx.arc(640, 50, 22, 0, Math.PI * 2);
    ctx.fill();

    // Hàng cây và khán đài trường học phía sau
    ctx.fillStyle = '#166534';
    for (let x = 0; x < this.width + 40; x += 48) {
      ctx.beginPath();
      ctx.arc(x, 90, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Khán đài / Banner cổ vũ
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(40, 72, this.width - 80, 24);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 72, this.width - 80, 24);

    ctx.font = 'bold 11px "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽ TRƯỜNG TIỂU HỌC PHÚ THỌ - KHỎE ĐỂ HỌC TẬP TỐT 🏃', this.width / 2, 84);
  }

  drawPitch(ctx) {
    const pitchTop = 94;
    const pitchH = this.height - pitchTop;

    // Mặt cỏ xanh sọc sân bóng
    const stripes = 8;
    const stripeH = pitchH / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#16a34a';
      ctx.fillRect(0, pitchTop + i * stripeH, this.width, stripeH + 1);
    }

    // Vạch vôi trắng khu vực cầu môn (phối cảnh)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3.5;

    // Đường biên ngang cuối sân
    ctx.beginPath();
    ctx.moveTo(80, 270);
    ctx.lineTo(this.width - 80, 270);
    ctx.stroke();

    // Khu vực 5m50
    ctx.strokeRect(this.goal.x + 30, 250, this.goal.w - 60, 20);

    // Vòng cấm địa 16m50
    ctx.strokeRect(this.goal.x - 30, 260, this.goal.w + 60, 50);

    // Chấm phạt đền 11m
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.penaltySpot.x, this.penaltySpot.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Vòng cung trước chấm phạt đền
    ctx.beginPath();
    ctx.arc(this.penaltySpot.x, this.penaltySpot.y - 40, 32, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  drawGoal(ctx) {
    const gx = this.goal.x;
    const gy = this.goal.y;
    const gw = this.goal.w;
    const gh = this.goal.h;
    const d = this.goal.depth;

    // 1. Lưới bóng đá phía sau
    const rungOffset = Math.sin(performance.now() / 60) * (this.netRung * 6);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.4)';
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + d, gy - d * 0.4 + rungOffset);
    ctx.lineTo(gx + gw - d, gy - d * 0.4 + rungOffset);
    ctx.lineTo(gx + gw, gy);
    ctx.lineTo(gx + gw + 10, gy + gh);
    ctx.lineTo(gx - 10, gy + gh);
    ctx.closePath();
    ctx.fill();

    // Mắt lưới đan chéo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1;

    // Lưới dọc
    const netCols = 28;
    for (let i = 0; i <= netCols; i++) {
      const topX = gx + (gw * i) / netCols;
      const botX = gx - 10 + ((gw + 20) * i) / netCols;
      ctx.beginPath();
      ctx.moveTo(topX, gy);
      ctx.lineTo(botX, gy + gh);
      ctx.stroke();
    }

    // Lưới ngang
    const netRows = 14;
    for (let j = 0; j <= netRows; j++) {
      const ly = gy + (gh * j) / netRows;
      ctx.beginPath();
      ctx.moveTo(gx - 5, ly);
      ctx.lineTo(gx + gw + 5, ly);
      ctx.stroke();
    }

    // 2. Khung sắt đỡ lưới phía sau (depth lines)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + d, gy - d * 0.4);
    ctx.lineTo(gx + gw - d, gy - d * 0.4);
    ctx.lineTo(gx + gw, gy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gx + d, gy - d * 0.4);
    ctx.lineTo(gx + d, gy + gh - 10);
    ctx.moveTo(gx + gw - d, gy - d * 0.4);
    ctx.lineTo(gx + gw - d, gy + gh - 10);
    ctx.stroke();

    // 3. Khung thành mặt trước (Cột dọc và xà ngang trắng sáng)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Cột trái
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx, gy);
    // Xà ngang
    ctx.lineTo(gx + gw, gy);
    // Cột phải
    ctx.lineTo(gx + gw, gy + gh);
    ctx.stroke();

    // Viền bóng kim loại trên xà và cột
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gx + 2, gy + gh);
    ctx.lineTo(gx + 2, gy + 2);
    ctx.lineTo(gx + gw - 2, gy + 2);
    ctx.lineTo(gx + gw - 2, gy + gh);
    ctx.stroke();
  }

  drawKeeper(ctx) {
    const k = this.keeper;
    const x = k.x;
    const y = k.isDiving && k.diveTargetY ? k.diveTargetY : k.baseY;

    ctx.save();
    ctx.translate(x, y);

    // Bóng đổ của thủ môn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Góc nghiêng khi bay người bắt bóng
    if (k.isDiving) {
      const tilt = (k.diveTargetX - 380) * 0.002;
      ctx.rotate(tilt);
    }

    // 1. Chân & Giày thể thao
    ctx.fillStyle = '#1e293b'; // Quần đùi xanh đen
    ctx.fillRect(-14, -28, 28, 14);

    ctx.fillStyle = '#f87171'; // Giày đỏ
    ctx.beginPath();
    ctx.roundRect(-16, -10, 11, 10, 3);
    ctx.roundRect(5, -10, 11, 10, 3);
    ctx.fill();

    // 2. Thân áo thủ môn (Màu cam phản quang số 1)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(-18, -54, 36, 28, 6);
    ctx.fill();

    // Số 1 trên áo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', 0, -40);

    // 3. Đầu Chibi & Nón thể thao
    ctx.fillStyle = '#fed7aa'; // Mặt da sáng
    ctx.beginPath();
    ctx.arc(0, -66, 15, 0, Math.PI * 2);
    ctx.fill();

    // Mắt & Miệng
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-5, -67, 2.2, 0, Math.PI * 2);
    ctx.arc(5, -67, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Nụ cười tập trung
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -62, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Mũ lưỡi trai vàng
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -71, 14, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-12, -73, 24, 4);

    // 4. Tay & Găng tay thủ môn to bản (Gloves)
    ctx.fillStyle = '#38bdf8'; // Găng tay xanh sáng
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;

    if (k.isDiving || k.state === 'catch') {
      // Giơ hai tay lên cao cản bóng
      ctx.beginPath();
      ctx.arc(-22, -64, 9, 0, Math.PI * 2);
      ctx.arc(22, -64, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Tư thế chuẩn bị bắt gôn
      const armBob = Math.sin(performance.now() / 180) * 3;
      ctx.beginPath();
      ctx.arc(-24, -44 + armBob, 9, 0, Math.PI * 2);
      ctx.arc(24, -44 + armBob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBall(ctx) {
    const b = this.ball;

    // Bóng đổ của quả bóng trên mặt cỏ
    const shadowScale = Math.max(0.4, b.r / 22);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + b.r * 0.8, b.r * 1.1 * shadowScale, b.r * 0.4 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);

    // Thân quả bóng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Viền bóng
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1.2, b.r * 0.08);
    ctx.stroke();

    // Họa tiết ngũ giác/lục giác đen trên bóng đá kinh điển
    ctx.fillStyle = '#1e293b';
    const centerSize = b.r * 0.35;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5;
      const px = Math.cos(a) * centerSize;
      const py = Math.sin(a) * centerSize;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Các mảng đen viền quanh
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5;
      const outX = Math.cos(a) * b.r * 0.85;
      const outY = Math.sin(a) * b.r * 0.85;
      ctx.beginPath();
      ctx.arc(outX, outY, b.r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawAimPointer(ctx) {
    const x = this.aim.x;
    const y = this.aim.y;

    ctx.save();
    // Vòng tròn hồng tâm ngắm sút bóng
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Chữ thập tâm
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y + 22);
    ctx.stroke();

    // Đường nét đứt hướng từ bóng lên mục tiêu
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.penaltySpot.x, this.penaltySpot.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gợi ý nhỏ
    ctx.font = 'bold 11px "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Click để sút ⚽', x, y - 28);

    ctx.restore();
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  drawFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = 'bold 22px "Baloo 2", "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
