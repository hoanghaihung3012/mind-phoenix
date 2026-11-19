/**
 * MindPhoenix Client Floating Chat Widget
 * Enables real-time visitor and student support with Admin Messages management.
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.MINDPHOENIX_API_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5005/api'
    : 'https://api-production-c2686e59.up.railway.app/api'
);

const I18N = {
  vi: {
    title: 'Hỗ Trợ Mind Phoenix',
    online: 'Trực tuyến · Sẵn sàng trợ giúp',
    welcomeTitle: 'Xin chào bạn! 👋',
    welcomeText: 'Chào mừng bạn đến với Mind Phoenix. Bạn cần hướng dẫn minigame, thắc mắc bài học hay hỗ trợ tài khoản? Đừng ngần ngại nhắn tin nhé!',
    placeholder: 'Nhập tin nhắn của bạn...',
    send: 'Gửi',
    pills: [
      '🎮 Hướng dẫn chơi minigame',
      '🏆 Cách tính điểm bảng vàng',
      '🏫 Giới thiệu Học Viện Phú Thọ',
      '💡 Báo lỗi hoặc góp ý',
    ],
  },
  en: {
    title: 'Mind Phoenix Support',
    online: 'Online · Ready to help',
    welcomeTitle: 'Hello there! 👋',
    welcomeText: 'Welcome to Mind Phoenix! Need guidance on games, math puzzles, or your student account? Send us a message anytime!',
    placeholder: 'Type your message...',
    send: 'Send',
    pills: [
      '🎮 How to play minigames',
      '🏆 High score leaderboards',
      '🏫 Phu Tho Academy guide',
      '💡 Feedback or suggestions',
    ],
  },
};

export class ChatManager {
  constructor() {
    this.isOpen = false;
    this.unreadCount = 0;
    this.messages = [];
    this.pollTimer = null;
    this.isInitialized = false;

    this.lang = typeof document !== 'undefined' && document.documentElement.lang === 'vi' ? 'vi' : 'en';
    this.user = this.getStoredUser();
    this.guestId = this.getOrCreateGuestId();
    this.threadId = this.user?.id ? `thread_usr_${this.user.id}` : `thread_gst_${this.guestId}`;
    this.contactName = this.user?.name || `Khách ghé thăm #${this.guestId.substring(4, 8).toUpperCase()}`;
    this.contactEmail = this.user?.email || '';
    this.avatar = this.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${this.guestId}`;

    this.dom = {
      launcher: null,
      badge: null,
      window: null,
      body: null,
      input: null,
      sendBtn: null,
    };
  }

  get t() {
    return I18N[this.lang] || I18N.vi;
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

  getOrCreateGuestId() {
    if (typeof localStorage === 'undefined') return `gst_${Date.now()}`;
    let gid = localStorage.getItem('mindphoenix_chat_guest_id');
    if (!gid) {
      gid = `gst_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('mindphoenix_chat_guest_id', gid);
    }
    return gid;
  }

  init() {
    if (this.isInitialized || typeof document === 'undefined') return;
    this.isInitialized = true;

    this.injectStyles();
    this.renderUI();
    this.fetchHistory();
    this.startPolling();
  }

  injectStyles() {
    if (document.getElementById('mp-chat-styles')) return;
    const link = document.createElement('link');
    link.id = 'mp-chat-styles';
    link.rel = 'stylesheet';
    // Look up correct relative path for chat.css
    const isSubdir = window.location.pathname.includes('/games/') || window.location.pathname.includes('/tools/');
    const isDeep = (window.location.pathname.match(/\//g) || []).length > 2;
    const prefix = isDeep ? '../../' : isSubdir ? '../' : './';
    link.href = `${prefix}shared/chat/chat.css`;
    document.head.appendChild(link);
  }

  renderUI() {
    // 1. Launcher button
    const launcher = document.createElement('button');
    launcher.className = 'mp-chat-launcher';
    launcher.setAttribute('aria-label', this.t.title);
    launcher.innerHTML = `
      <svg class="mp-icon-chat" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg class="mp-icon-close" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
      <span class="mp-chat-badge" style="display: none;">0</span>
    `;

    // 2. Chat window
    const win = document.createElement('div');
    win.className = 'mp-chat-window';
    win.innerHTML = `
      <div class="mp-chat-header">
        <div class="mp-chat-header-info">
          <div class="mp-chat-avatar">
            <img src="${this.avatar}" alt="Mascot">
            <span class="mp-chat-status-dot"></span>
          </div>
          <div>
            <h3 class="mp-chat-title">${this.t.title}</h3>
            <p class="mp-chat-subtitle">
              <span class="pulse-dot"></span>
              ${this.t.online}
            </p>
          </div>
        </div>
        <div class="mp-chat-header-actions">
          <button type="button" class="mp-chat-close-btn" aria-label="Đóng chat">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="mp-chat-body">
        <div class="mp-chat-welcome">
          <div class="mp-chat-welcome-title">${this.t.welcomeTitle}</div>
          <div>${this.t.welcomeText}</div>
          <div class="mp-chat-pills">
            ${this.t.pills.map(p => `<button type="button" class="mp-chat-pill">${p}</button>`).join('')}
          </div>
        </div>
        <div class="mp-chat-messages-container"></div>
      </div>

      <form class="mp-chat-footer">
        <input type="text" class="mp-chat-input" placeholder="${this.t.placeholder}" />
        <button type="submit" class="mp-chat-send-btn" aria-label="${this.t.send}">
          <svg viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    this.dom.launcher = launcher;
    this.dom.badge = launcher.querySelector('.mp-chat-badge');
    this.dom.window = win;
    this.dom.body = win.querySelector('.mp-chat-body');
    this.dom.messagesContainer = win.querySelector('.mp-chat-messages-container');
    this.dom.input = win.querySelector('.mp-chat-input');
    this.dom.sendBtn = win.querySelector('.mp-chat-send-btn');

    // Event listeners
    launcher.addEventListener('click', () => this.toggleChat());
    win.querySelector('.mp-chat-close-btn').addEventListener('click', () => this.closeChat());

    win.querySelector('.mp-chat-footer').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });

    win.querySelectorAll('.mp-chat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.dom.input.value = pill.textContent.replace(/^[^\s]+\s/, ''); // strip emoji
        this.handleSend();
      });
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    this.dom.launcher.classList.add('is-open');
    this.dom.window.classList.add('is-open');
    this.unreadCount = 0;
    this.updateBadge();
    this.scrollToBottom();
    setTimeout(() => this.dom.input.focus(), 200);

    // Speed up polling when open
    this.restartPolling(3000);
  }

  closeChat() {
    this.isOpen = false;
    this.dom.launcher.classList.remove('is-open');
    this.dom.window.classList.remove('is-open');

    // Slow down polling when closed
    this.restartPolling(20000);
  }

  updateBadge() {
    if (!this.dom.badge) return;
    if (this.unreadCount > 0) {
      this.dom.badge.textContent = this.unreadCount > 9 ? '9+' : String(this.unreadCount);
      this.dom.badge.style.display = 'flex';
    } else {
      this.dom.badge.style.display = 'none';
    }
  }

  scrollToBottom() {
    if (this.dom.body) {
      this.dom.body.scrollTop = this.dom.body.scrollHeight;
    }
  }

  async fetchHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/thread/${this.threadId}?name=${encodeURIComponent(this.contactName)}&email=${encodeURIComponent(this.contactEmail)}`);
      const json = await res.json();
      if (json?.success && json?.data?.messages) {
        const prevCount = this.messages.length;
        this.messages = json.data.messages;
        this.renderMessages();

        // If new messages from admin arrived while chat was closed
        if (!this.isOpen && this.messages.length > prevCount && prevCount > 0) {
          const newAdminMsgs = this.messages.slice(prevCount).filter(m => m.sender === 'user');
          if (newAdminMsgs.length > 0) {
            this.unreadCount += newAdminMsgs.length;
            this.updateBadge();
          }
        }
      }
    } catch {
      // Offline / error ignored
    }
  }

  renderMessages() {
    if (!this.dom.messagesContainer) return;
    this.dom.messagesContainer.innerHTML = this.messages.map(m => {
      const isUser = m.sender === 'contact';
      return `
        <div class="mp-chat-msg-row ${isUser ? 'from-user' : 'from-admin'}">
          <div class="mp-chat-bubble">${this.escapeHtml(m.content)}</div>
          <span class="mp-chat-time">${m.timestamp || ''}</span>
        </div>
      `;
    }).join('');
    this.scrollToBottom();
  }

  async handleSend() {
    const text = this.dom.input.value.trim();
    if (!text) return;

    this.dom.input.value = '';

    // Optimistic append
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    this.messages.push({
      id: `local-${Date.now()}`,
      sender: 'contact',
      content: text,
      timestamp: now,
    });
    this.renderMessages();

    // Call API
    try {
      const res = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: this.threadId,
          contactName: this.contactName,
          contactEmail: this.contactEmail,
          avatar: this.avatar,
          content: text,
        }),
      });
      const json = await res.json();
      if (json?.success && json?.data?.messages) {
        this.messages = json.data.messages;
        this.renderMessages();
      }
    } catch (err) {
      console.warn('Failed to send message:', err);
    }
  }

  startPolling() {
    this.restartPolling(20000);
  }

  restartPolling(intervalMs) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      this.fetchHistory();
    }, intervalMs);
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const chat = new ChatManager();

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined') {
  window.MindPhoenixChat = chat;
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    chat.init();
  } else {
    window.addEventListener('DOMContentLoaded', () => chat.init());
  }
}
