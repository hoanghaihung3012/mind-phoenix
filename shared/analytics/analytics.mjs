/**
 * MindPhoenix Client Analytics & Activity Tracker
 * Automatically tracks user sessions, online presence, game plays, tool usages, and high scores.
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.MINDPHOENIX_API_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5005/api'
    : 'https://api-production-c2686e59.up.railway.app/api'
);

const GAME_NAMES = {
  'vua-tieng-viet': 'Vua Tiếng Việt',
  'hoc-vien-phu-tho': 'Học Viện Phú Thọ',
  'duck-race': 'Đua Vịt',
  'mind-arena': 'Mind Arena',
  'soi-chinh-ta': 'Soi Lỗi Chính Tả',
  'noi-tu': 'Nối Từ Nhanh',
  'sentence-builder': 'Sentence Builder',
  'memory-safari': 'Memory Safari',
  'math-challenge': 'Thử Thách Toán Học',
  'word-pop': 'Word Pop',
  'sky-jump': 'Sky Jump',
  'breakout': 'Breakout Edu',
  'apple-catch': 'Apple Catch',
  'shadow-puzzle': 'Ghép Bóng Hình',
  'code-the-bot': 'Code The Bot',
  'spell-quest': 'Spell Quest',
  'math-chain': 'Math Chain',
};

const TOOL_NAMES = {
  'spin-wheel': 'Vòng Quay May Mắn (Spin Wheel)',
  'timer': 'Đồng Hồ Bấm Giờ Lớp Học (Timer)',
  'formula-sandbox': 'Formula Sandbox Toán Học',
  'youtube-dashboard': 'YouTube Video Analytics',
};

export class AnalyticsTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.heartbeatInterval = null;
    this.isInitialized = false;
    this.currentContext = this.detectContext();
  }

  getOrCreateSessionId() {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    let sid = sessionStorage.getItem('mp_analytics_session_id');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('mp_analytics_session_id', sid);
    }
    return sid;
  }

  getStoredUser() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem('mindphoenix_user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  detectContext() {
    if (typeof window === 'undefined') {
      return { type: 'page', id: 'home', title: 'Mind Phoenix' };
    }
    const path = window.location.pathname.toLowerCase();

    // Check games
    for (const [key, name] of Object.entries(GAME_NAMES)) {
      if (path.includes(`/games/${key}`)) {
        return { type: 'game', id: key, title: name };
      }
    }
    if (path.includes('/games')) {
      return { type: 'page', id: 'games-portal', title: 'Cổng Trò Chơi Mind Phoenix' };
    }

    // Check tools
    for (const [key, name] of Object.entries(TOOL_NAMES)) {
      if (path.includes(`/tools/${key}`)) {
        return { type: 'tool', id: key, title: name };
      }
    }
    if (path.includes('/tools')) {
      return { type: 'page', id: 'tools-portal', title: 'Bộ Công Cụ Lớp Học' };
    }

    return { type: 'page', id: 'home', title: document.title || 'Mind Phoenix Trang Chủ' };
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Send initial heartbeat
    this.sendHeartbeat();

    // Auto-track initial event
    if (this.currentContext.type === 'game') {
      this.trackGamePlay(this.currentContext.id, this.currentContext.title);
    } else if (this.currentContext.type === 'tool') {
      this.trackToolUse(this.currentContext.id, this.currentContext.title, 'opened');
    } else {
      this.trackPageView();
    }

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
      }
    }, 30000);

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
      }
    });

    // Unload beacon
    window.addEventListener('pagehide', () => {
      this.sendBeaconHeartbeat();
    });
  }

  async sendHeartbeat() {
    const user = this.getStoredUser();
    const payload = {
      sessionId: this.sessionId,
      userId: user?.id || null,
      userName: user?.name || null,
      userEmail: user?.email || null,
      userAvatar: user?.avatar || null,
      role: user?.role || null,
      currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      currentActivity: this.currentContext.type === 'game'
        ? `Đang chơi: ${this.currentContext.title}`
        : this.currentContext.type === 'tool'
        ? `Đang dùng: ${this.currentContext.title}`
        : `Đang xem: ${this.currentContext.title}`,
    };

    try {
      await fetch(`${API_BASE_URL}/analytics/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Offline or network error: silently ignored
    }
  }

  sendBeaconHeartbeat() {
    if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
    const user = this.getStoredUser();
    const payload = JSON.stringify({
      sessionId: this.sessionId,
      userId: user?.id || null,
      userName: user?.name || null,
      userEmail: user?.email || null,
      userAvatar: user?.avatar || null,
      role: user?.role || null,
      currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      currentActivity: 'Vừa rời trang',
    });
    navigator.sendBeacon(`${API_BASE_URL}/analytics/heartbeat`, new Blob([payload], { type: 'application/json' }));
  }

  async trackEvent(type, targetId, targetTitle, score = 0, metadata = {}) {
    const user = this.getStoredUser();
    const payload = {
      sessionId: this.sessionId,
      userId: user?.id || null,
      userName: user?.name || (user?.email ? user.email.split('@')[0] : 'Khách ghé thăm'),
      type,
      targetId,
      targetTitle,
      score: typeof score === 'number' ? score : 0,
      metadata: {
        ...metadata,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await fetch(`${API_BASE_URL}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Ignored
    }
  }

  trackGamePlay(gameId, gameTitle, metadata = {}) {
    return this.trackEvent('game_play', gameId, gameTitle || GAME_NAMES[gameId] || gameId, 0, metadata);
  }

  trackToolUse(toolId, toolTitle, action = 'interact', metadata = {}) {
    return this.trackEvent('tool_use', toolId, toolTitle || TOOL_NAMES[toolId] || toolId, 0, { action, ...metadata });
  }

  trackScore(gameId, gameTitle, score, metadata = {}) {
    const user = this.getStoredUser();
    const title = gameTitle || GAME_NAMES[gameId] || gameId;
    const playerName = user?.name || 'Khách ghé thăm';

    // Track score event
    this.trackEvent('score', gameId, title, score, metadata);

    // Also send to dedicated score API
    try {
      fetch(`${API_BASE_URL}/analytics/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: user?.id || null,
          playerName,
          gameId,
          gameTitle: title,
          score,
        }),
      }).catch(() => {});
    } catch {}
  }

  trackPageView(pageTitle, path) {
    const title = pageTitle || (typeof document !== 'undefined' ? document.title : 'Trang Mind Phoenix');
    const p = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    return this.trackEvent('page_view', p, title);
  }
}

export const analytics = new AnalyticsTracker();

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined') {
  window.MindPhoenixAnalytics = analytics;
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    analytics.init();
  } else {
    window.addEventListener('DOMContentLoaded', () => analytics.init());
  }
}
