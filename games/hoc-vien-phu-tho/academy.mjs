/**
 * Học Viện Phú Thọ (Phu Tho Academy) - Core Game Engine
 * Manages game state, campus POIs, character customization, sound synthesis, minigame scoring, and network synchronization.
 */

export const MAP_CONFIG = {
  width: 2600,
  height: 1900,
  spawn: { x: 1300, y: 1720 },
};

export const SCHOOL_PRESETS = [
  'TH Phú Thọ',
  'TH Chu Văn An',
  'TH Lê Quý Đôn',
  'TH Kim Đồng',
  'TH Nguyễn Bỉnh Khiêm',
  'TH Võ Thị Sáu',
  'Trường Bạn Khác'
];

export const CUSTOMIZATION_OPTIONS = {
  skins: [
    { id: 'fair', label: 'Trắng hồng', color: '#ffdfbf' },
    { id: 'warm', label: 'Tự nhiên', color: '#f5c798' },
    { id: 'tan', label: 'Bánh mật', color: '#d89a64' },
    { id: 'peach', label: 'Ấm áp', color: '#ffd2b0' },
  ],
  hairs: [
    { id: 'short', label: 'Tóc ngắn năng động' },
    { id: 'bob', label: 'Tóc ngắn cúp' },
    { id: 'ponytail', label: 'Tóc đuôi ngựa' },
    { id: 'curly', label: 'Tóc xoăn bồng bềnh' },
    { id: 'spiky', label: 'Tóc cá tính' },
  ],
  hairColors: [
    { id: 'black', label: 'Đen tuyền', color: '#1f1f1f' },
    { id: 'brown', label: 'Nâu hạt dẻ', color: '#4a2c11' },
    { id: 'chestnut', label: 'Nâu sáng', color: '#7c3f1d' },
    { id: 'navy', label: 'Xanh đêm', color: '#1e3a8a' },
    { id: 'amber', label: 'Hổ phách', color: '#b45309' },
  ],
  outfits: [
    { id: 'uniform', label: 'Đồng phục Phú Thọ (Khăn quàng đỏ)', primary: '#ffffff', secondary: '#1e3a8a', scarf: '#dc2626' },
    { id: 'sport', label: 'Thể dục năng động', primary: '#f97316', secondary: '#0284c7', scarf: null },
    { id: 'scholar', label: 'Nhà khoa học nhí', primary: '#059669', secondary: '#0f172a', scarf: null },
    { id: 'flag', label: 'Áo Cờ đỏ sao vàng', primary: '#dc2626', secondary: '#1e293b', scarf: null, emblem: 'star' },
  ],
  accessories: [
    { id: 'none', label: 'Không phụ kiện' },
    { id: 'glasses', label: 'Kính cận tri thức' },
    { id: 'cap', label: 'Nón tai bèo' },
    { id: 'headband', label: 'Băng đô thể thao' },
    { id: 'star_pin', label: 'Huy hiệu Sao Vàng Phú Thọ' },
  ]
};

export const POI_LOCATIONS = [
  {
    id: 'gate',
    name: 'Cổng Trường Tiểu Học Phú Thọ',
    nameEn: 'Phu Tho Primary School Main Gate',
    x: 1300,
    y: 1720,
    radius: 110,
    icon: '🏫',
    category: 'welcome',
    desc: 'Cổng trường khang trang đón chào học sinh Phú Thọ và các bạn trường bạn!',
  },
  {
    id: 'flagpole',
    name: 'Cột Cờ & Lễ Đài Vinh Danh',
    nameEn: 'Flagpole & Honor Plaza',
    x: 1300,
    y: 1250,
    radius: 95,
    icon: '🚩',
    category: 'landmark',
    desc: 'Nơi chào cờ đầu tuần và vinh danh những học sinh đạt nhiều điểm danh dự.',
  },
  {
    id: 'fountain',
    name: 'Đài Phun Nước Bồ Câu Trắng',
    nameEn: 'Central Peace Fountain',
    x: 1300,
    y: 950,
    radius: 85,
    icon: '⛲',
    category: 'social',
    desc: 'Khu vực trung tâm mát mẻ, nơi học sinh gặp gỡ, giao lưu và trò chuyện.',
  },
  {
    id: 'building_a',
    name: 'Tòa Nhà Thông Thái: Trạm Toán Học',
    nameEn: 'Wisdom Wing: Math Academy',
    x: 750,
    y: 850,
    radius: 130,
    icon: '🧮',
    category: 'game',
    gameType: 'math',
    minigameTitle: 'Thử Thách Thần Đồng Toán Học',
    desc: 'Giải toán tính nhẩm, chuỗi số logic và câu đố hình học.',
    rewardPoints: 20,
  },
  {
    id: 'library',
    name: 'Thư Viện Tri Thức (Nhà B)',
    nameEn: 'Knowledge Library: Vietnamese Arts',
    x: 1850,
    y: 850,
    radius: 130,
    icon: '📚',
    category: 'game',
    gameType: 'vietnamese',
    minigameTitle: 'Vua Tiếng Việt & Đố Ca Dao',
    desc: 'Thử tài từ vựng Tiếng Việt, câu đố dân gian và bắt lỗi chính tả.',
    rewardPoints: 20,
  },
  {
    id: 'tech_lab',
    name: 'Phòng Tin Học & Sáng Tạo Số',
    nameEn: 'Future Tech & Coding Lab',
    x: 650,
    y: 1380,
    radius: 120,
    icon: '💻',
    category: 'game',
    gameType: 'coding',
    minigameTitle: 'Lập Trình Robot & Gỡ Mã',
    desc: 'Tư duy thuật toán, sắp xếp lệnh điều khiển robot vượt chướng ngại vật.',
    rewardPoints: 25,
  },
  {
    id: 'sports_field',
    name: 'Sân Bóng & Khu Thể Thao Đa Năng',
    nameEn: 'Sports Court & Athletic Center',
    x: 1950,
    y: 1380,
    radius: 135,
    icon: '⚽',
    category: 'game',
    gameType: 'sports',
    minigameTitle: 'Tâng Bóng Phản Xạ Thể Thao',
    desc: 'Rèn luyện phản xạ nhanh nhẹn, tâng bóng chính xác ghi điểm cao.',
    rewardPoints: 20,
  },
  {
    id: 'eco_garden',
    name: 'Vườn Sinh Thái & Hồ Cá Koi',
    nameEn: 'Eco Nature Garden & Koi Pond',
    x: 700,
    y: 420,
    radius: 125,
    icon: '🍎',
    category: 'game',
    gameType: 'nature',
    minigameTitle: 'Thu Hoạch Táo & Nhớ Hình Động Vật',
    desc: 'Hái táo chín và thử thách trí nhớ các loài cây quả, động vật đáng yêu.',
    rewardPoints: 20,
  },
  {
    id: 'special_zone',
    name: 'Tháp Học Giả Tinh Hoa Phú Thọ',
    nameEn: 'Phu Tho Elite Golden Tower',
    x: 1300,
    y: 360,
    radius: 145,
    icon: '👑',
    category: 'special_zone',
    gameType: 'olympiad',
    minigameTitle: 'Đại Khảo Thí Tinh Hoa Phú Thọ',
    desc: 'Khu vực bí ẩn có cổng rào ánh sáng vàng. Chỉ dành cho học sinh ưu tú!',
    requiredPoints: 50,
    rewardPoints: 50,
  }
];

export const DEFAULT_NPCS = [
  {
    id: 'npc_minh',
    name: 'Bạn Minh (Lớp 5A Phú Thọ)',
    school: 'TH Phú Thọ',
    skin: 'fair',
    hair: 'short',
    hairColor: '#1f1f1f',
    outfit: 'uniform',
    accessory: 'glasses',
    x: 1200,
    y: 1620,
    direction: 'down',
    messages: [
      'Chào mừng bạn đến với trường Tiểu học Phú Thọ!',
      'Trường mình có sân bóng đẹp và thư viện rất nhiều truyện hay đó.',
      'Bạn hãy thử đi qua các trạm để tích lũy sao danh dự nhé!'
    ]
  },
  {
    id: 'npc_lan',
    name: 'Bạn Lan (Lớp 4B Phú Thọ)',
    school: 'TH Phú Thọ',
    skin: 'warm',
    hair: 'ponytail',
    hairColor: '#4a2c11',
    outfit: 'uniform',
    accessory: 'star_pin',
    x: 1420,
    y: 1100,
    direction: 'left',
    messages: [
      'Chào bạn! Tớ vừa giải xong 3 câu đố ở Thư viện.',
      'Bạn đã kiếm đủ 50 sao để mở Tháp Học Giả Tinh Hoa chưa?',
      'Tháp Tinh Hoa ở phía trên cùng đó, cổng sáng rực luôn!'
    ]
  },
  {
    id: 'npc_khoi',
    name: 'Bạn Khôi (TH Chu Văn An)',
    school: 'TH Chu Văn An',
    skin: 'tan',
    hair: 'spiky',
    hairColor: '#7c3f1d',
    outfit: 'sport',
    accessory: 'headband',
    x: 1850,
    y: 1460,
    direction: 'up',
    messages: [
      'Trường Phú Thọ rộng và mát mẻ thật đấy!',
      'Sân bóng ở đây cỏ xanh mướt, tâng bóng đã ghê!',
      'Cậu có muốn đọ điểm tâng bóng cùng tớ không?'
    ]
  },
  {
    id: 'npc_mai',
    name: 'Bạn Mai (TH Lê Quý Đôn)',
    school: 'TH Lê Quý Đôn',
    skin: 'peach',
    hair: 'bob',
    hairColor: '#1f1f1f',
    outfit: 'scholar',
    accessory: 'glasses',
    x: 720,
    y: 920,
    direction: 'right',
    messages: [
      'Phòng Toán học đố nhiều câu hay dã man!',
      'Tớ từ trường Lê Quý Đôn sang giao lưu đây.',
      'Cùng nhau học tập tiến bộ nhé bạn ơi!'
    ]
  }
];

export function createDefaultPlayer(savedData = {}) {
  return {
    id: savedData.id || `pt_${Math.random().toString(36).slice(2, 9)}`,
    name: savedData.name || 'Học sinh Phú Thọ',
    school: savedData.school || 'TH Phú Thọ',
    skin: savedData.skin || 'fair',
    hair: savedData.hair || 'short',
    hairColor: savedData.hairColor || '#1f1f1f',
    outfit: savedData.outfit || 'uniform',
    accessory: savedData.accessory || 'star_pin',
    x: savedData.x ?? MAP_CONFIG.spawn.x,
    y: savedData.y ?? MAP_CONFIG.spawn.y,
    targetX: savedData.x ?? MAP_CONFIG.spawn.x,
    targetY: savedData.y ?? MAP_CONFIG.spawn.y,
    speed: 240, // pixels per second
    direction: 'down',
    moving: false,
    animFrame: 0,
    points: Number(savedData.points) || 0,
    clearedGames: savedData.clearedGames || {},
    specialUnlocked: Boolean(savedData.specialUnlocked),
    currentZone: null,
  };
}

export function isSpecialZoneUnlocked(player) {
  if (player.specialUnlocked) return true;
  if ((player.points || 0) >= 50) return true;
  const count = Object.keys(player.clearedGames || {}).length;
  return count >= 3;
}

export function checkProximityPOI(x, y) {
  for (const poi of POI_LOCATIONS) {
    const dx = x - poi.x;
    const dy = y - poi.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= poi.radius) {
      return { poi, dist };
    }
  }
  return null;
}

export function calculateDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Web Audio sound synthesizers (friendly 8-bit / cheerful tones for kids)
 */
export class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playStep() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 20, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  }

  playClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  }

  playSuccess() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.28);
      });
    } catch (_) {}
  }

  playUnlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (_) {}
  }

  playChat() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  }
}

/**
 * Multiplayer Network Manager (WebSocket + BroadcastChannel multi-tab sync + NPC bots)
 */
export class AcademyNetworkManager {
  constructor(localPlayer, onRemotePlayerUpdate, onChatReceived, onInteractionReceived) {
    this.localPlayer = localPlayer;
    this.onRemotePlayerUpdate = onRemotePlayerUpdate;
    this.onChatReceived = onChatReceived;
    this.onInteractionReceived = onInteractionReceived;
    this.ws = null;
    this.connected = false;
    this.remotePlayers = new Map();
    this.lastBroadcastMove = 0;

    // Local tab-to-tab real-time sync
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.bc = new BroadcastChannel('phutho_academy_channel');
        this.bc.onmessage = (e) => this.handleLocalMessage(e.data);
      } catch (_) {}
    }
  }

  connect(wsUrl) {
    if (typeof window === 'undefined') return;
    try {
      const url = wsUrl || (
        window.location.protocol === 'https:'
          ? `wss://${window.location.host}/ws/academy`
          : `ws://${window.location.hostname}:5005/ws/academy`
      );

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connected = true;
        this.send({
          type: 'join',
          player: {
            id: this.localPlayer.id,
            name: this.localPlayer.name,
            school: this.localPlayer.school,
            skin: this.localPlayer.skin,
            hair: this.localPlayer.hair,
            hairColor: this.localPlayer.hairColor,
            outfit: this.localPlayer.outfit,
            accessory: this.localPlayer.accessory,
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            points: this.localPlayer.points,
            specialUnlocked: this.localPlayer.specialUnlocked
          }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (_) {}
      };

      this.ws.onclose = () => {
        this.connected = false;
      };

      this.ws.onerror = () => {
        this.connected = false;
      };
    } catch (e) {
      this.connected = false;
    }
  }

  send(data) {
    if (this.ws && this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
    // Also broadcast to other browser tabs
    if (this.bc) {
      try {
        this.bc.postMessage(data);
      } catch (_) {}
    }
  }

  handleServerMessage(msg) {
    if (msg.type === 'welcome') {
      if (Array.isArray(msg.players)) {
        msg.players.forEach(p => {
          this.remotePlayers.set(p.id, { ...p, lastActive: Date.now() });
        });
        if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
      }
    } else if (msg.type === 'player_joined') {
      if (msg.player && msg.player.id !== this.localPlayer.id) {
        this.remotePlayers.set(msg.player.id, { ...msg.player, lastActive: Date.now() });
        if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
      }
    } else if (msg.type === 'player_moved') {
      if (msg.id && msg.id !== this.localPlayer.id) {
        let p = this.remotePlayers.get(msg.id);
        if (p) {
          p.x = msg.x;
          p.y = msg.y;
          p.direction = msg.direction || p.direction;
          p.anim = msg.anim || p.anim;
          p.lastActive = Date.now();
        }
      }
    } else if (msg.type === 'player_chat') {
      if (this.onChatReceived) this.onChatReceived(msg);
    } else if (msg.type === 'player_interacted') {
      if (this.onInteractionReceived) this.onInteractionReceived(msg);
    } else if (msg.type === 'player_left') {
      this.remotePlayers.delete(msg.id);
      if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
    } else if (msg.type === 'score_updated') {
      const p = this.remotePlayers.get(msg.id);
      if (p) {
        p.points = msg.points;
        p.specialUnlocked = msg.specialUnlocked;
      }
    }
  }

  handleLocalMessage(msg) {
    // Process messages from peer tabs
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'join' && msg.player && msg.player.id !== this.localPlayer.id) {
      this.remotePlayers.set(msg.player.id, { ...msg.player, lastActive: Date.now() });
      if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
      // Respond with my own player info so the new tab sees me
      if (this.bc) {
        this.bc.postMessage({
          type: 'peer_presence',
          player: {
            id: this.localPlayer.id,
            name: this.localPlayer.name,
            school: this.localPlayer.school,
            skin: this.localPlayer.skin,
            hair: this.localPlayer.hair,
            hairColor: this.localPlayer.hairColor,
            outfit: this.localPlayer.outfit,
            accessory: this.localPlayer.accessory,
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            points: this.localPlayer.points,
            specialUnlocked: this.localPlayer.specialUnlocked
          }
        });
      }
    } else if (msg.type === 'peer_presence' && msg.player && msg.player.id !== this.localPlayer.id) {
      this.remotePlayers.set(msg.player.id, { ...msg.player, lastActive: Date.now() });
      if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
    } else if (msg.type === 'move' && msg.id && msg.id !== this.localPlayer.id) {
      const p = this.remotePlayers.get(msg.id);
      if (p) {
        p.x = msg.x;
        p.y = msg.y;
        p.direction = msg.direction || p.direction;
        p.anim = msg.anim || p.anim;
        p.lastActive = Date.now();
      }
    } else if (msg.type === 'chat' && msg.senderId !== this.localPlayer.id) {
      if (this.onChatReceived) {
        this.onChatReceived({
          id: msg.senderId,
          name: msg.name,
          school: msg.school,
          text: msg.text,
          timestamp: Date.now()
        });
      }
    } else if (msg.type === 'interact') {
      if (this.onInteractionReceived) this.onInteractionReceived(msg);
    }
  }

  broadcastMove(x, y, direction, anim) {
    const now = Date.now();
    if (now - this.lastBroadcastMove < 50) return; // throttle 20 fps network sync
    this.lastBroadcastMove = now;

    const payload = {
      type: 'move',
      id: this.localPlayer.id,
      x: Math.round(x),
      y: Math.round(y),
      direction,
      anim
    };
    this.send(payload);
  }

  broadcastChat(text) {
    const payload = {
      type: 'chat',
      senderId: this.localPlayer.id,
      name: this.localPlayer.name,
      school: this.localPlayer.school,
      text: String(text).slice(0, 150),
      timestamp: Date.now()
    };
    this.send(payload);
  }

  broadcastInteraction(targetId, action) {
    const payload = {
      type: 'interact',
      fromId: this.localPlayer.id,
      fromName: this.localPlayer.name,
      targetId,
      action,
      timestamp: Date.now()
    };
    this.send(payload);
  }

  broadcastScore(deltaPoints, specialUnlocked) {
    const payload = {
      type: 'score_update',
      id: this.localPlayer.id,
      deltaPoints,
      specialUnlocked
    };
    this.send(payload);
  }
}
