/**
 * MindPhoenix Client Auth Manager
 * Handles user sign in, sign up, session management, and auth modal UI.
 */

const API_BASE_URL = window.MINDPHOENIX_API_URL || 'http://localhost:5005/api';
const TOKEN_KEY = 'mindphoenix_user_token';
const USER_KEY = 'mindphoenix_user_data';

export class AuthManager {
  constructor() {
    this.user = this.getStoredUser();
    this.token = localStorage.getItem(TOKEN_KEY);
    this.modalEl = null;
    this.activeTab = 'login'; // 'login' | 'register'
  }

  getStoredUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return !!this.token && !!this.user;
  }

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Đăng nhập không thành công');
    }

    this.token = json.data.token;
    this.user = json.data.user;
    localStorage.setItem(TOKEN_KEY, this.token);
    localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    this.updateNavUI();
    return this.user;
  }

  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'Student' }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Đăng ký không thành công');
    }

    this.token = json.data.token;
    this.user = json.data.user;
    localStorage.setItem(TOKEN_KEY, this.token);
    localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    this.updateNavUI();
    return this.user;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.updateNavUI();
  }

  initUI(containerId = 'nav-auth-container') {
    this.container = document.getElementById(containerId);
    this.renderModal();
    this.updateNavUI();
  }

  updateNavUI() {
    if (!this.container) return;

    if (this.isLoggedIn()) {
      this.container.innerHTML = `
        <div class="nav-user-profile">
          <div class="nav-user-avatar">${this.user.name.charAt(0).toUpperCase()}</div>
          <span class="nav-user-name">${this.user.name}</span>
          <button type="button" class="nav-logout-btn" id="btn-logout" title="Đăng xuất">Thoát</button>
        </div>
      `;
      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.onclick = () => this.logout();
      }
    } else {
      this.container.innerHTML = `
        <button type="button" class="nav-auth-btn" id="btn-open-auth">
          <span>Sign In / Sign Up</span>
        </button>
      `;
      const openBtn = document.getElementById('btn-open-auth');
      if (openBtn) {
        openBtn.onclick = () => this.openModal('login');
      }
    }
  }

  openModal(tab = 'login') {
    this.activeTab = tab;
    if (!this.modalEl) {
      this.renderModal();
    }
    this.switchTab(tab);
    this.modalEl.classList.add('open');
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('open');
    }
  }

  switchTab(tab) {
    this.activeTab = tab;
    const tabLogin = this.modalEl.querySelector('#tab-login');
    const tabRegister = this.modalEl.querySelector('#tab-register');
    const formLogin = this.modalEl.querySelector('#form-login');
    const formRegister = this.modalEl.querySelector('#form-register');
    const alertBox = this.modalEl.querySelector('#auth-alert');

    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.textContent = '';
    }

    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'flex';
      formRegister.style.display = 'none';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.style.display = 'flex';
      formLogin.style.display = 'none';
    }
  }

  renderModal() {
    if (document.getElementById('mindphoenix-auth-modal')) {
      this.modalEl = document.getElementById('mindphoenix-auth-modal');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'mindphoenix-auth-modal';
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
      <div class="auth-modal-card">
        <button type="button" class="auth-modal-close" id="auth-modal-close" aria-label="Close">✕</button>
        <div class="auth-header">
          <img src="assets/mascots/mind-phoenix-logo.png" alt="MindPhoenix Mascot" class="auth-mascot">
          <h3 class="auth-title">Mind Phoenix</h3>
          <p class="auth-subtitle">Tham gia học tập và giải đố cùng Mind Phoenix</p>
        </div>

        <div class="auth-tabs">
          <button type="button" class="auth-tab-btn active" id="tab-login">Đăng nhập</button>
          <button type="button" class="auth-tab-btn" id="tab-register">Đăng ký mới</button>
        </div>

        <div id="auth-alert" class="auth-error" style="display: none;"></div>

        <!-- Login Form -->
        <form id="form-login" class="auth-form">
          <div class="auth-field">
            <label for="login-email">Email hoặc Tên tài khoản</label>
            <input type="text" id="login-email" placeholder="ban@gmail.com" required>
          </div>
          <div class="auth-field">
            <label for="login-password">Mật khẩu</label>
            <input type="password" id="login-password" placeholder="••••••••" required>
          </div>
          <button type="submit" class="auth-submit-btn" id="btn-submit-login">Đăng nhập</button>
        </form>

        <!-- Register Form -->
        <form id="form-register" class="auth-form" style="display: none;">
          <div class="auth-field">
            <label for="reg-name">Họ và tên</label>
            <input type="text" id="reg-name" placeholder="Nguyễn Văn A" required>
          </div>
          <div class="auth-field">
            <label for="reg-email">Email</label>
            <input type="email" id="reg-email" placeholder="a@gmail.com" required>
          </div>
          <div class="auth-field">
            <label for="reg-password">Mật khẩu (tối thiểu 4 ký tự)</label>
            <input type="password" id="reg-password" placeholder="••••••••" minlength="4" required>
          </div>
          <button type="submit" class="auth-submit-btn" id="btn-submit-reg">Tạo tài khoản</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Bind events
    modal.querySelector('#auth-modal-close').onclick = () => this.closeModal();
    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal();
    };

    modal.querySelector('#tab-login').onclick = () => this.switchTab('login');
    modal.querySelector('#tab-register').onclick = () => this.switchTab('register');

    const alertBox = modal.querySelector('#auth-alert');

    // Login submit
    modal.querySelector('#form-login').onsubmit = async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';
      const email = modal.querySelector('#login-email').value;
      const pass = modal.querySelector('#login-password').value;
      const btn = modal.querySelector('#btn-submit-login');
      btn.disabled = true;
      btn.textContent = 'Đang xử lý...';

      try {
        await this.login(email, pass);
        this.closeModal();
      } catch (err) {
        alertBox.className = 'auth-error';
        alertBox.textContent = err.message || 'Đăng nhập thất bại';
        alertBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Đăng nhập';
      }
    };

    // Register submit
    modal.querySelector('#form-register').onsubmit = async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';
      const name = modal.querySelector('#reg-name').value;
      const email = modal.querySelector('#reg-email').value;
      const pass = modal.querySelector('#reg-password').value;
      const btn = modal.querySelector('#btn-submit-reg');
      btn.disabled = true;
      btn.textContent = 'Đang tạo...';

      try {
        await this.register(name, email, pass);
        this.closeModal();
      } catch (err) {
        alertBox.className = 'auth-error';
        alertBox.textContent = err.message || 'Đăng ký thất bại';
        alertBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Tạo tài khoản';
      }
    };
  }
}

export const auth = new AuthManager();
