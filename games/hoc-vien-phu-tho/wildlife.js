/**
 * Học Viện Phú Thọ - Hệ thống Chim & Bướm bay lượn (Wildlife & Nature System)
 * Mang thiên nhiên sống động vào sân trường:
 * - Đàn bướm rực rỡ sắc màu (Monarch, Blue Morpho, Hồng, Ngọc, Trắng) bay chập chờn quanh các luống hoa & vườn hoa.
 * - Đàn chim én, chim sẻ chao liệng trên bầu trời xanh, thi thoảng đậu trên cành cây hoặc sà xuống thảm cỏ.
 * - Hiệu ứng bóng đổ chân thực (ground shadows) và phản xạ né tránh khi học sinh lại gần.
 */

export class WildlifeSystem {
  constructor(options = {}) {
    this.worldWidth = options.worldWidth || 4800;
    this.worldHeight = options.worldHeight || 3450;
    this.gardenCenter = options.gardenCenter || { x: 2850, y: 1520 };
    
    this.butterflies = [];
    this.birds = [];
    
    this.initButterflies(options.butterflyCount || 28);
    this.initBirds(options.birdCount || 14);
  }

  initButterflies(count) {
    const butterflyColors = [
      { name: 'blue_morpho', primary: '#0284c7', secondary: '#38bdf8', spot: '#ffffff', edge: '#0f172a' },
      { name: 'monarch_orange', primary: '#ea580c', secondary: '#facc15', spot: '#ffffff', edge: '#18181b' },
      { name: 'pink_swallowtail', primary: '#ec4899', secondary: '#f472b6', spot: '#fdf2f8', edge: '#831843' },
      { name: 'emerald_green', primary: '#10b981', secondary: '#6ee7b7', spot: '#ecfdf5', edge: '#064e3b' },
      { name: 'golden_fairy', primary: '#eab308', secondary: '#fef08a', spot: '#ffffff', edge: '#713f12' },
      { name: 'pearl_white', primary: '#f8fafc', secondary: '#e2e8f0', spot: '#fbbf24', edge: '#64748b' }
    ];

    for (let i = 0; i < count; i++) {
      // 55% bướm tập trung tại Khu Vườn Hoa Riêng & Hồ Sen, 45% rải rác sân trường
      let startX, startY;
      if (i < Math.floor(count * 0.55)) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 220;
        startX = this.gardenCenter.x + Math.cos(angle) * radius;
        startY = this.gardenCenter.y + Math.sin(angle) * (radius * 0.75);
      } else {
        startX = 300 + Math.random() * (this.worldWidth - 600);
        startY = 400 + Math.random() * (this.worldHeight - 700);
      }

      const color = butterflyColors[i % butterflyColors.length];
      this.butterflies.push({
        id: `bf_${i}`,
        x: startX,
        y: startY,
        z: 8 + Math.random() * 24, // Độ cao so với mặt đất
        vx: (Math.random() - 0.5) * 45,
        vy: (Math.random() - 0.5) * 45,
        homeX: startX,
        homeY: startY,
        color,
        size: 7 + Math.random() * 3.5,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 16 + Math.random() * 8, // Tốc độ đập cánh
        state: 'flying', // 'flying', 'perched', 'fleeing'
        perchTimer: 0,
        changeDirTimer: Math.random() * 3
      });
    }
  }

  initBirds(count) {
    const birdTypes = [
      { name: 'swallow', body: '#1e293b', wing: '#0f172a', belly: '#f8fafc', beak: '#f59e0b', size: 10, speed: 180, isSwallow: true },
      { name: 'sparrow', body: '#78350f', wing: '#92400e', belly: '#fef3c7', beak: '#d97706', size: 8.5, speed: 120, isSwallow: false },
      { name: 'canary', body: '#ca8a04', wing: '#eab308', belly: '#fef08a', beak: '#b45309', size: 7.5, speed: 110, isSwallow: false },
      { name: 'white_dove', body: '#f1f5f9', wing: '#ffffff', belly: '#e2e8f0', beak: '#f43f5e', size: 11, speed: 140, isSwallow: false }
    ];

    for (let i = 0; i < count; i++) {
      const type = birdTypes[i % birdTypes.length];
      const startX = 200 + Math.random() * (this.worldWidth - 400);
      const startY = 300 + Math.random() * (this.worldHeight - 500);
      const angle = Math.random() * Math.PI * 2;

      this.birds.push({
        id: `bird_${i}`,
        x: startX,
        y: startY,
        z: 60 + Math.random() * 80, // Bay lượn trên cao 60-140px
        heading: angle,
        speed: type.speed * (0.8 + Math.random() * 0.4),
        type,
        wingPhase: Math.random() * Math.PI * 2,
        wingCycleSpeed: 14 + Math.random() * 6,
        glideTimer: 0,
        isGliding: false,
        turnRate: (Math.random() - 0.5) * 0.6,
        targetAngle: angle,
        turnTimer: 2 + Math.random() * 4
      });
    }
  }

  update(dt, playerX = 2400, playerY = 3050) {
    // 1. Cập nhật Bướm (Butterflies)
    for (const b of this.butterflies) {
      b.wingPhase += b.wingSpeed * dt;

      // Khoảng cách tới người chơi
      const distToPlayer = Math.hypot(b.x - playerX, b.y - playerY);
      if (distToPlayer < 75) {
        b.state = 'fleeing';
        const fleeAngle = Math.atan2(b.y - playerY, b.x - playerX);
        b.vx = Math.cos(fleeAngle) * 90;
        b.vy = Math.sin(fleeAngle) * 90;
        b.perchTimer = 0;
      }

      if (b.state === 'perched') {
        b.perchTimer -= dt;
        b.wingSpeed = 3.5; // Đập cánh nhẹ khi đậu nghỉ
        if (b.perchTimer <= 0) {
          b.state = 'flying';
          b.wingSpeed = 16 + Math.random() * 8;
        }
      } else {
        // Đang bay lượn
        b.changeDirTimer -= dt;
        if (b.changeDirTimer <= 0) {
          b.changeDirTimer = 1.5 + Math.random() * 2.5;
          // Bay lượn quanh khu vực "home" của mình
          const toHomeX = b.homeX - b.x;
          const toHomeY = b.homeY - b.y;
          const wanderAngle = Math.random() * Math.PI * 2;
          const wanderPower = 35;
          b.vx = (toHomeX * 0.35) + Math.cos(wanderAngle) * wanderPower;
          b.vy = (toHomeY * 0.35) + Math.sin(wanderAngle) * wanderPower;

          // Xác suất đậu lên hoa nghỉ ngơi
          if (b.state !== 'fleeing' && Math.random() < 0.28) {
            b.state = 'perched';
            b.perchTimer = 2.5 + Math.random() * 3.5;
            b.vx = 0;
            b.vy = 0;
          }
        }

        if (b.state === 'fleeing' && distToPlayer >= 120) {
          b.state = 'flying';
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Giữ trong biên bản đồ
        if (b.x < 80) { b.x = 80; b.vx = Math.abs(b.vx); }
        if (b.x > this.worldWidth - 80) { b.x = this.worldWidth - 80; b.vx = -Math.abs(b.vx); }
        if (b.y < 120) { b.y = 120; b.vy = Math.abs(b.vy); }
        if (b.y > this.worldHeight - 120) { b.y = this.worldHeight - 120; b.vy = -Math.abs(b.vy); }
      }
    }

    // 2. Cập nhật Đàn Chim (Birds)
    for (const bird of this.birds) {
      bird.turnTimer -= dt;
      if (bird.turnTimer <= 0) {
        bird.turnTimer = 3 + Math.random() * 5;
        bird.targetAngle += (Math.random() - 0.5) * 1.5;
        // Bắt đầu lượn cánh (glide) hoặc đập cánh
        bird.isGliding = Math.random() < 0.45;
        bird.glideTimer = 1.5 + Math.random() * 2.5;
      }

      if (bird.isGliding) {
        bird.glideTimer -= dt;
        if (bird.glideTimer <= 0) bird.isGliding = false;
      } else {
        bird.wingPhase += bird.wingCycleSpeed * dt;
      }

      // Xoay hướng êm dịu về targetAngle
      const angleDiff = Math.atan2(Math.sin(bird.targetAngle - bird.heading), Math.cos(bird.targetAngle - bird.heading));
      bird.heading += angleDiff * Math.min(1, dt * 1.8);

      const vx = Math.cos(bird.heading) * bird.speed;
      const vy = Math.sin(bird.heading) * bird.speed;
      bird.x += vx * dt;
      bird.y += vy * dt;

      // Khi chạm biên bản đồ, quay đầu vào trong
      if (bird.x < 150) bird.targetAngle = 0;
      else if (bird.x > this.worldWidth - 150) bird.targetAngle = Math.PI;
      if (bird.y < 200) bird.targetAngle = Math.PI / 2;
      else if (bird.y > this.worldHeight - 200) bird.targetAngle = -Math.PI / 2;
    }
  }

  renderButterflies(ctx) {
    if (!ctx) return;
    for (const b of this.butterflies) {
      ctx.save();

      // 1. Bóng đổ trên mặt đất (Soft shadow on ground)
      const shadowY = b.y + b.z;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(b.x, shadowY, b.size * 0.9, b.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Thân & Cánh bướm ở độ cao z
      ctx.translate(b.x, b.y);

      // Hiệu ứng đập cánh 3D (cos wingPhase)
      const wingFold = Math.cos(b.wingPhase);
      const wingW = Math.max(0.12, Math.abs(wingFold)) * b.size;

      // Thân bướm nhỏ
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.8, b.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Râu bướm
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1, -b.size * 0.4);
      ctx.lineTo(-3.5, -b.size * 0.8);
      ctx.moveTo(1, -b.size * 0.4);
      ctx.lineTo(3.5, -b.size * 0.8);
      ctx.stroke();

      // Cánh trái
      ctx.save();
      ctx.fillStyle = b.color.primary;
      ctx.strokeStyle = b.color.edge;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(-wingW * 0.9, -b.size * 0.2, wingW, b.size * 0.75, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hoa văn cánh trong
      ctx.fillStyle = b.color.secondary;
      ctx.beginPath();
      ctx.ellipse(-wingW * 0.9, -b.size * 0.15, wingW * 0.6, b.size * 0.45, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Cánh phải
      ctx.save();
      ctx.fillStyle = b.color.primary;
      ctx.strokeStyle = b.color.edge;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(wingW * 0.9, -b.size * 0.2, wingW, b.size * 0.75, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hoa văn cánh trong
      ctx.fillStyle = b.color.secondary;
      ctx.beginPath();
      ctx.ellipse(wingW * 0.9, -b.size * 0.15, wingW * 0.6, b.size * 0.45, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }
  }

  renderBirds(ctx) {
    if (!ctx) return;
    for (const bird of this.birds) {
      ctx.save();

      // 1. Bóng chim trên mặt đất (theo độ cao z)
      const shadowY = bird.y + bird.z;
      const shadowScale = Math.max(0.4, 1 - (bird.z / 200));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      ctx.ellipse(bird.x, shadowY, bird.type.size * 1.2 * shadowScale, bird.type.size * 0.5 * shadowScale, bird.heading, 0, Math.PI * 2);
      ctx.fill();

      // 2. Chú chim đang bay
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.heading);

      const wingSpan = bird.type.size * 1.5;
      const wingFlap = bird.isGliding ? 0 : Math.sin(bird.wingPhase) * (bird.type.size * 0.8);

      // Thân chim
      ctx.fillStyle = bird.type.body;
      ctx.beginPath();
      ctx.ellipse(0, 0, bird.type.size * 0.9, bird.type.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bụng chim sáng màu
      ctx.fillStyle = bird.type.belly;
      ctx.beginPath();
      ctx.ellipse(bird.type.size * 0.1, 0, bird.type.size * 0.5, bird.type.size * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Đuôi chim (chim én có đuôi chẻ chữ V đẹp mắt)
      ctx.fillStyle = bird.type.body;
      ctx.beginPath();
      if (bird.type.isSwallow) {
        ctx.moveTo(-bird.type.size * 0.7, 0);
        ctx.lineTo(-bird.type.size * 1.7, -bird.type.size * 0.45);
        ctx.lineTo(-bird.type.size * 1.2, 0);
        ctx.lineTo(-bird.type.size * 1.7, bird.type.size * 0.45);
        ctx.closePath();
      } else {
        ctx.moveTo(-bird.type.size * 0.7, -bird.type.size * 0.2);
        ctx.lineTo(-bird.type.size * 1.4, -bird.type.size * 0.35);
        ctx.lineTo(-bird.type.size * 1.4, bird.type.size * 0.35);
        ctx.lineTo(-bird.type.size * 0.7, bird.type.size * 0.2);
        ctx.closePath();
      }
      ctx.fill();

      // Cánh chim hai bên (sải cánh rộng bay lượn)
      ctx.fillStyle = bird.type.wing;
      // Cánh trái
      ctx.beginPath();
      ctx.moveTo(-bird.type.size * 0.2, 0);
      ctx.lineTo(bird.type.size * 0.1, -wingSpan);
      ctx.lineTo(bird.type.size * 0.5, -wingSpan * 0.6 + wingFlap);
      ctx.lineTo(bird.type.size * 0.4, 0);
      ctx.closePath();
      ctx.fill();

      // Cánh phải
      ctx.beginPath();
      ctx.moveTo(-bird.type.size * 0.2, 0);
      ctx.lineTo(bird.type.size * 0.1, wingSpan);
      ctx.lineTo(bird.type.size * 0.5, wingSpan * 0.6 - wingFlap);
      ctx.lineTo(bird.type.size * 0.4, 0);
      ctx.closePath();
      ctx.fill();

      // Mỏ chim vàng nhỏ xinh
      ctx.fillStyle = bird.type.beak;
      ctx.beginPath();
      ctx.moveTo(bird.type.size * 0.8, -bird.type.size * 0.15);
      ctx.lineTo(bird.type.size * 1.35, 0);
      ctx.lineTo(bird.type.size * 0.8, bird.type.size * 0.15);
      ctx.closePath();
      ctx.fill();

      // Mắt nhỏ
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bird.type.size * 0.6, -bird.type.size * 0.15, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bird.type.size * 0.65, -bird.type.size * 0.15, 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
