/**
 * MindPhoenix Client Auth Manager
 * Handles user sign in, sign up, session management, and auth modal UI.
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.MINDPHOENIX_API_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5005/api'
    : 'https://api-production-c2686e59.up.railway.app/api'
);
const TOKEN_KEY = 'mindphoenix_user_token';
const USER_KEY = 'mindphoenix_user_data';

const I18N = {
  vi: {
    navBtn: 'Đăng nhập / Đăng ký',
    logout: 'Thoát',
    modalTitle: 'Mind Phoenix',
    modalSubtitle: 'Tham gia học tập và giải đố cùng Mind Phoenix',
    tabLogin: 'Đăng nhập',
    tabRegister: 'Đăng ký mới',
    loginEmailLabel: 'Email hoặc Tên tài khoản',
    loginEmailPlaceholder: 'ban@gmail.com',
    loginPassLabel: 'Mật khẩu',
    loginPassPlaceholder: '••••••••',
    loginBtn: 'Đăng nhập',
    loginLoading: 'Đang xử lý...',
    regNameLabel: 'Họ và tên',
    regNamePlaceholder: 'Nguyễn Văn A',
    regEmailLabel: 'Email',
    regEmailPlaceholder: 'a@gmail.com',
    regPassLabel: 'Mật khẩu (tối thiểu 4 ký tự)',
    regPassPlaceholder: '••••••••',
    regBtn: 'Tạo tài khoản',
    regLoading: 'Đang tạo...',
    loginSuccess: 'Đăng nhập thành công!',
    regSuccess: 'Tạo tài khoản thành công!',
    loginFailed: 'Đăng nhập thất bại',
    regFailed: 'Đăng ký thất bại',
  },
  en: {
    navBtn: 'Sign In / Sign Up',
    logout: 'Logout',
    modalTitle: 'Mind Phoenix',
    modalSubtitle: 'Join Mind Phoenix to learn, play, and explore puzzles',
    tabLogin: 'Sign In',
    tabRegister: 'Sign Up',
    loginEmailLabel: 'Email or Username',
    loginEmailPlaceholder: 'you@example.com',
    loginPassLabel: 'Password',
    loginPassPlaceholder: '••••••••',
    loginBtn: 'Sign In',
    loginLoading: 'Signing in...',
    regNameLabel: 'Full Name',
    regNamePlaceholder: 'Alex Johnson',
    regEmailLabel: 'Email',
    regEmailPlaceholder: 'alex@example.com',
    regPassLabel: 'Password (min 4 characters)',
    regPassPlaceholder: '••••••••',
    regBtn: 'Create Account',
    regLoading: 'Creating account...',
    loginSuccess: 'Signed in successfully!',
    regSuccess: 'Account created successfully!',
    loginFailed: 'Sign in failed',
    regFailed: 'Sign up failed',
  },
};

export class AuthManager {
  constructor() {
    this.user = this.getStoredUser();
    this.token = localStorage.getItem(TOKEN_KEY);
    this.modalEl = null;
    this.activeTab = 'login'; // 'login' | 'register'
    this.lang = typeof document !== 'undefined' && document.documentElement.lang === 'vi' ? 'vi' : 'en';
  }

  get t() {
    return I18N[this.lang] || I18N.en;
  }

  setLanguage(nextLang) {
    this.lang = nextLang === 'vi' ? 'vi' : 'en';
    this.updateNavUI();
    if (this.modalEl) {
      this.updateModalTexts();
    }
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
      throw new Error(json.message || this.t.loginFailed);
    }

    this.token = json.data.token;
    this.user = json.data.user;
    localStorage.setItem(TOKEN_KEY, this.token);
    localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    this.updateNavUI();
    window.dispatchEvent(new CustomEvent('mindphoenix-auth-change', { detail: { user: this.user, token: this.token } }));
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
      throw new Error(json.message || this.t.regFailed);
    }

    this.token = json.data.token;
    this.user = json.data.user;
    localStorage.setItem(TOKEN_KEY, this.token);
    localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    this.updateNavUI();
    window.dispatchEvent(new CustomEvent('mindphoenix-auth-change', { detail: { user: this.user, token: this.token } }));
    return this.user;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.updateNavUI();
    window.dispatchEvent(new CustomEvent('mindphoenix-auth-change', { detail: { user: null, token: null } }));
  }

  initUI(containerId = 'nav-auth-container') {
    this.container = document.getElementById(containerId);
    this.renderModal();
    this.updateNavUI();

    // Listen to global language change if available
    window.addEventListener('mp-lang-change', (e) => {
      if (e.detail?.lang) {
        this.setLanguage(e.detail.lang);
      }
    });
  }

  updateNavUI() {
    if (!this.container) return;

    if (this.isLoggedIn()) {
      const initial = (this.user.name || 'U').charAt(0).toUpperCase();
      this.container.innerHTML = `
        <div class="nav-user-profile">
          <div class="nav-user-avatar">${initial}</div>
          <span class="nav-user-name">${this.user.name}</span>
          <button type="button" class="nav-logout-btn" id="btn-logout" title="${this.t.logout}">${this.t.logout}</button>
        </div>
      `;
      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.onclick = () => this.logout();
      }
    } else {
      this.container.innerHTML = `
        <button type="button" class="nav-auth-btn" id="btn-open-auth">
          <span>${this.t.navBtn}</span>
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
    this.updateModalTexts();
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

  updateModalTexts() {
    if (!this.modalEl) return;
    const t = this.t;

    const titleEl = this.modalEl.querySelector('.auth-title');
    if (titleEl) titleEl.textContent = t.modalTitle;

    const subEl = this.modalEl.querySelector('.auth-subtitle');
    if (subEl) subEl.textContent = t.modalSubtitle;

    const tabLogin = this.modalEl.querySelector('#tab-login');
    if (tabLogin) tabLogin.textContent = t.tabLogin;

    const tabReg = this.modalEl.querySelector('#tab-register');
    if (tabReg) tabReg.textContent = t.tabRegister;

    // Login labels
    const lblLoginEmail = this.modalEl.querySelector('label[for="login-email"]');
    if (lblLoginEmail) lblLoginEmail.textContent = t.loginEmailLabel;
    const inpLoginEmail = this.modalEl.querySelector('#login-email');
    if (inpLoginEmail) inpLoginEmail.placeholder = t.loginEmailPlaceholder;

    const lblLoginPass = this.modalEl.querySelector('label[for="login-password"]');
    if (lblLoginPass) lblLoginPass.textContent = t.loginPassLabel;

    const btnSubmitLogin = this.modalEl.querySelector('#btn-submit-login');
    if (btnSubmitLogin) btnSubmitLogin.textContent = t.loginBtn;

    // Register labels
    const lblRegName = this.modalEl.querySelector('label[for="reg-name"]');
    if (lblRegName) lblRegName.textContent = t.regNameLabel;
    const inpRegName = this.modalEl.querySelector('#reg-name');
    if (inpRegName) inpRegName.placeholder = t.regNamePlaceholder;

    const lblRegEmail = this.modalEl.querySelector('label[for="reg-email"]');
    if (lblRegEmail) lblRegEmail.textContent = t.regEmailLabel;
    const inpRegEmail = this.modalEl.querySelector('#reg-email');
    if (inpRegEmail) inpRegEmail.placeholder = t.regEmailPlaceholder;

    const lblRegPass = this.modalEl.querySelector('label[for="reg-password"]');
    if (lblRegPass) lblRegPass.textContent = t.regPassLabel;

    const btnSubmitReg = this.modalEl.querySelector('#btn-submit-reg');
    if (btnSubmitReg) btnSubmitReg.textContent = t.regBtn;
  }

  renderModal() {
    if (document.getElementById('mindphoenix-auth-modal')) {
      this.modalEl = document.getElementById('mindphoenix-auth-modal');
      return;
    }

    const t = this.t;
    const modal = document.createElement('div');
    modal.id = 'mindphoenix-auth-modal';
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
      <div class="auth-modal-card">
        <button type="button" class="auth-modal-close" id="auth-modal-close" aria-label="Close">✕</button>
        <div class="auth-header">
          <img src="assets/mascots/mind-phoenix-logo.png" alt="MindPhoenix Mascot" class="auth-mascot">
          <h3 class="auth-title">${t.modalTitle}</h3>
          <p class="auth-subtitle">${t.modalSubtitle}</p>
        </div>

        <div class="auth-tabs">
          <button type="button" class="auth-tab-btn active" id="tab-login">${t.tabLogin}</button>
          <button type="button" class="auth-tab-btn" id="tab-register">${t.tabRegister}</button>
        </div>

        <div id="auth-alert" class="auth-error" style="display: none;"></div>

        <!-- Login Form -->
        <form id="form-login" class="auth-form">
          <div class="auth-field">
            <label for="login-email">${t.loginEmailLabel}</label>
            <input type="text" id="login-email" placeholder="${t.loginEmailPlaceholder}" required autocomplete="username">
          </div>
          <div class="auth-field">
            <label for="login-password">${t.loginPassLabel}</label>
            <input type="password" id="login-password" placeholder="${t.loginPassPlaceholder}" required autocomplete="current-password">
          </div>
          <button type="submit" class="auth-submit-btn" id="btn-submit-login">${t.loginBtn}</button>
        </form>

        <!-- Register Form -->
        <form id="form-register" class="auth-form" style="display: none;">
          <div class="auth-field">
            <label for="reg-name">${t.regNameLabel}</label>
            <input type="text" id="reg-name" placeholder="${t.regNamePlaceholder}" required autocomplete="name">
          </div>
          <div class="auth-field">
            <label for="reg-email">${t.regEmailLabel}</label>
            <input type="email" id="reg-email" placeholder="${t.regEmailPlaceholder}" required autocomplete="email">
          </div>
          <div class="auth-field">
            <label for="reg-password">${t.regPassLabel}</label>
            <input type="password" id="reg-password" placeholder="${t.regPassPlaceholder}" minlength="4" required autocomplete="new-password">
          </div>
          <button type="submit" class="auth-submit-btn" id="btn-submit-reg">${t.regBtn}</button>
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
      btn.textContent = this.t.loginLoading;

      try {
        await this.login(email, pass);
        this.closeModal();
      } catch (err) {
        alertBox.className = 'auth-error';
        alertBox.textContent = err.message || this.t.loginFailed;
        alertBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = this.t.loginBtn;
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
      btn.textContent = this.t.regLoading;

      try {
        await this.register(name, email, pass);
        this.closeModal();
      } catch (err) {
        alertBox.className = 'auth-error';
        alertBox.textContent = err.message || this.t.regFailed;
        alertBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = this.t.regBtn;
      }
    };
  }
}

export const auth = new AuthManager();
