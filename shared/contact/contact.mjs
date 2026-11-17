/**
 * MindPhoenix Client Contact Manager
 * Handles Contact Us modal, inline form, validation, and submission to the backend API.
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.MINDPHOENIX_API_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5005/api'
    : 'https://api-production-c2686e59.up.railway.app/api'
);
const USER_KEY = 'mindphoenix_user_data';

const I18N = {
  vi: {
    modalTitle: 'Liên hệ với Mind Phoenix',
    modalSubtitle: 'Gửi yêu cầu hợp tác, tư vấn hoặc đóng góp ý kiến cho chúng tôi.',
    inlineTitle: 'Để lại thông tin liên hệ',
    inlineDesc: 'Điền form dưới đây, chúng tôi sẽ phản hồi lại bạn qua Email hoặc Số điện thoại trong thời gian sớm nhất!',
    nameLabel: 'Họ và tên',
    namePlaceholder: 'Nguyễn Văn A',
    emailLabel: 'Địa chỉ Email',
    emailPlaceholder: 'ban@gmail.com',
    phoneLabel: 'Số điện thoại',
    phonePlaceholder: '0912 345 678',
    messageLabel: 'Nội dung tin nhắn / Yêu cầu',
    messagePlaceholder: 'Chia sẻ chi tiết dự án, ý tưởng hoặc câu hỏi của bạn...',
    submitBtn: 'Gửi thông tin liên hệ',
    sendingBtn: 'Đang gửi...',
    successMsg: '🎉 Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công. Đội ngũ Mind Phoenix sẽ liên hệ với bạn trong thời gian sớm nhất.',
    errorName: 'Vui lòng nhập họ và tên của bạn.',
    errorEmail: 'Vui lòng nhập địa chỉ email hợp lệ.',
    errorPhone: 'Vui lòng nhập số điện thoại hợp lệ.',
    errorMessage: 'Vui lòng nhập nội dung tin nhắn.',
    errorGeneral: 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau ít phút.',
  },
  en: {
    modalTitle: 'Contact Mind Phoenix',
    modalSubtitle: 'Get in touch for custom math animations, collaborations, or questions.',
    inlineTitle: 'Send us a message',
    inlineDesc: 'Fill out the form below and we will get back to you via email or phone promptly!',
    nameLabel: 'Full Name',
    namePlaceholder: 'Alex Johnson',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+84 912 345 678',
    messageLabel: 'Message / Project Details',
    messagePlaceholder: 'Tell us about your project, idea, or questions...',
    submitBtn: 'Send Contact Request',
    sendingBtn: 'Sending...',
    successMsg: '🎉 Thank you! Your contact request has been sent successfully. We will be in touch shortly.',
    errorName: 'Please enter your full name.',
    errorEmail: 'Please enter a valid email address.',
    errorPhone: 'Please enter a valid phone number.',
    errorMessage: 'Please enter your message.',
    errorGeneral: 'An error occurred while sending your message. Please try again.',
  },
};

export class ContactManager {
  constructor() {
    this.modalEl = null;
    this.lang = typeof document !== 'undefined' && document.documentElement.lang === 'vi' ? 'vi' : 'en';
  }

  get t() {
    return I18N[this.lang] || I18N.en;
  }

  setLanguage(nextLang) {
    this.lang = nextLang === 'vi' ? 'vi' : 'en';
    if (this.modalEl) {
      this.updateModalTexts();
    }
    this.updateInlineTexts();
  }

  getStoredUser() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  init() {
    this.renderModal();
    this.attachTriggerListeners();

    // Listen to global language change if fired
    window.addEventListener('mp-lang-change', (e) => {
      if (e.detail?.lang) {
        this.setLanguage(e.detail.lang);
      }
    });

    // Listen to auth state changes to auto-fill contact forms
    window.addEventListener('mindphoenix-auth-change', () => {
      this.prefillUserFields();
    });
  }

  attachTriggerListeners() {
    // Intercept clicks on .nav-contact or buttons asking to contact
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.nav-contact, .btn-open-contact-modal, [data-action="open-contact"]');
      if (target) {
        e.preventDefault();
        this.openModal();
      }
    });
  }

  openModal() {
    if (!this.modalEl) {
      this.renderModal();
    }
    this.updateModalTexts();
    this.prefillUserFields(this.modalEl);

    const alertBox = this.modalEl.querySelector('#contact-modal-alert');
    if (alertBox) alertBox.style.display = 'none';

    this.modalEl.classList.add('open');
    const firstInput = this.modalEl.querySelector('#modal-contact-name');
    if (firstInput && !firstInput.value) {
      setTimeout(() => firstInput.focus(), 150);
    }
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('open');
    }
  }

  prefillUserFields(scope = (typeof document !== 'undefined' ? document : null)) {
    if (!scope) return;
    const user = this.getStoredUser();
    if (!user) return;

    scope.querySelectorAll('input[name="name"], #modal-contact-name, #inline-contact-name').forEach((el) => {
      if (!el.value && user.name) el.value = user.name;
    });

    scope.querySelectorAll('input[name="email"], #modal-contact-email, #inline-contact-email').forEach((el) => {
      if (!el.value && user.email && user.email.includes('@')) el.value = user.email;
    });
  }

  validate(data) {
    if (!data.name || data.name.trim().length < 2) {
      return this.t.errorName;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      return this.t.errorEmail;
    }
    const phoneDigits = data.phone ? data.phone.replace(/\D/g, '') : '';
    if (!data.phone || phoneDigits.length < 8) {
      return this.t.errorPhone;
    }
    if (!data.message || data.message.trim().length < 4) {
      return this.t.errorMessage;
    }
    return null;
  }

  async submitContact(data) {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || this.t.errorGeneral);
    }
    return json.data;
  }

  updateModalTexts() {
    if (!this.modalEl) return;
    const t = this.t;

    const titleEl = this.modalEl.querySelector('.contact-title');
    if (titleEl) titleEl.textContent = t.modalTitle;

    const subEl = this.modalEl.querySelector('.contact-subtitle');
    if (subEl) subEl.textContent = t.modalSubtitle;

    const lblName = this.modalEl.querySelector('label[for="modal-contact-name"] .label-text');
    if (lblName) lblName.textContent = t.nameLabel;
    const inpName = this.modalEl.querySelector('#modal-contact-name');
    if (inpName) inpName.placeholder = t.namePlaceholder;

    const lblEmail = this.modalEl.querySelector('label[for="modal-contact-email"] .label-text');
    if (lblEmail) lblEmail.textContent = t.emailLabel;
    const inpEmail = this.modalEl.querySelector('#modal-contact-email');
    if (inpEmail) inpEmail.placeholder = t.emailPlaceholder;

    const lblPhone = this.modalEl.querySelector('label[for="modal-contact-phone"] .label-text');
    if (lblPhone) lblPhone.textContent = t.phoneLabel;
    const inpPhone = this.modalEl.querySelector('#modal-contact-phone');
    if (inpPhone) inpPhone.placeholder = t.phonePlaceholder;

    const lblMsg = this.modalEl.querySelector('label[for="modal-contact-msg"] .label-text');
    if (lblMsg) lblMsg.textContent = t.messageLabel;
    const inpMsg = this.modalEl.querySelector('#modal-contact-msg');
    if (inpMsg) inpMsg.placeholder = t.messagePlaceholder;

    const btnSubmit = this.modalEl.querySelector('#modal-contact-submit');
    if (btnSubmit) btnSubmit.textContent = t.submitBtn;
  }

  updateInlineTexts() {
    if (typeof document === 'undefined') return;
    const inlineContainer = document.getElementById('inline-contact-form-container');
    if (!inlineContainer) return;
    const t = this.t;

    const titleEl = inlineContainer.querySelector('.inline-contact-title');
    if (titleEl) titleEl.textContent = t.inlineTitle;

    const descEl = inlineContainer.querySelector('.inline-contact-desc');
    if (descEl) descEl.textContent = t.inlineDesc;

    const lblName = inlineContainer.querySelector('label[for="inline-contact-name"] .label-text');
    if (lblName) lblName.textContent = t.nameLabel;
    const inpName = inlineContainer.querySelector('#inline-contact-name');
    if (inpName) inpName.placeholder = t.namePlaceholder;

    const lblEmail = inlineContainer.querySelector('label[for="inline-contact-email"] .label-text');
    if (lblEmail) lblEmail.textContent = t.emailLabel;
    const inpEmail = inlineContainer.querySelector('#inline-contact-email');
    if (inpEmail) inpEmail.placeholder = t.emailPlaceholder;

    const lblPhone = inlineContainer.querySelector('label[for="inline-contact-phone"] .label-text');
    if (lblPhone) lblPhone.textContent = t.phoneLabel;
    const inpPhone = inlineContainer.querySelector('#inline-contact-phone');
    if (inpPhone) inpPhone.placeholder = t.phonePlaceholder;

    const lblMsg = inlineContainer.querySelector('label[for="inline-contact-msg"] .label-text');
    if (lblMsg) lblMsg.textContent = t.messageLabel;
    const inpMsg = inlineContainer.querySelector('#inline-contact-msg');
    if (inpMsg) inpMsg.placeholder = t.messagePlaceholder;

    const btnSubmit = inlineContainer.querySelector('#inline-contact-submit');
    if (btnSubmit) btnSubmit.textContent = t.submitBtn;
  }

  renderModal() {
    if (document.getElementById('mindphoenix-contact-modal')) {
      this.modalEl = document.getElementById('mindphoenix-contact-modal');
      return;
    }

    const t = this.t;
    const modal = document.createElement('div');
    modal.id = 'mindphoenix-contact-modal';
    modal.className = 'contact-modal-overlay';
    modal.innerHTML = `
      <div class="contact-modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <button type="button" class="contact-modal-close" id="contact-modal-close" aria-label="Close">✕</button>
        <div class="contact-header">
          <img src="assets/mascots/mind-phoenix-logo.png" alt="MindPhoenix Mascot" class="contact-mascot">
          <h3 class="contact-title" id="contact-modal-title">${t.modalTitle}</h3>
          <p class="contact-subtitle">${t.modalSubtitle}</p>
        </div>

        <div id="contact-modal-alert" style="display: none; margin-bottom: 16px;"></div>

        <form id="contact-modal-form" class="contact-form">
          <div class="contact-field">
            <label for="modal-contact-name">
              <span class="label-text">${t.nameLabel}</span>
              <span class="required-star">*</span>
            </label>
            <input type="text" id="modal-contact-name" name="name" placeholder="${t.namePlaceholder}" required>
          </div>

          <div class="contact-form-row">
            <div class="contact-field">
              <label for="modal-contact-email">
                <span class="label-text">${t.emailLabel}</span>
                <span class="required-star">*</span>
              </label>
              <input type="email" id="modal-contact-email" name="email" placeholder="${t.emailPlaceholder}" required>
            </div>

            <div class="contact-field">
              <label for="modal-contact-phone">
                <span class="label-text">${t.phoneLabel}</span>
                <span class="required-star">*</span>
              </label>
              <input type="tel" id="modal-contact-phone" name="phone" placeholder="${t.phonePlaceholder}" required>
            </div>
          </div>

          <div class="contact-field">
            <label for="modal-contact-msg">
              <span class="label-text">${t.messageLabel}</span>
              <span class="required-star">*</span>
            </label>
            <textarea id="modal-contact-msg" name="message" rows="4" placeholder="${t.messagePlaceholder}" required></textarea>
          </div>

          <button type="submit" class="contact-submit-btn" id="modal-contact-submit">
            <span>${t.submitBtn}</span>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Close events
    modal.querySelector('#contact-modal-close').onclick = () => this.closeModal();
    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal();
    };

    // Form submit
    const form = modal.querySelector('#contact-modal-form');
    const alertBox = modal.querySelector('#contact-modal-alert');
    const submitBtn = modal.querySelector('#modal-contact-submit');

    form.onsubmit = async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const formData = {
        name: form.querySelector('#modal-contact-name').value,
        email: form.querySelector('#modal-contact-email').value,
        phone: form.querySelector('#modal-contact-phone').value,
        message: form.querySelector('#modal-contact-msg').value,
      };

      const error = this.validate(formData);
      if (error) {
        alertBox.className = 'contact-error';
        alertBox.textContent = error;
        alertBox.style.display = 'flex';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = this.t.sendingBtn;

      try {
        await this.submitContact(formData);
        alertBox.className = 'contact-success';
        alertBox.textContent = this.t.successMsg;
        alertBox.style.display = 'block';
        form.reset();
        this.prefillUserFields(form);

        setTimeout(() => {
          this.closeModal();
        }, 3000);
      } catch (err) {
        alertBox.className = 'contact-error';
        alertBox.textContent = err.message || this.t.errorGeneral;
        alertBox.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = this.t.submitBtn;
      }
    };
  }

  mountInlineForm(containerId = 'inline-contact-form-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const t = this.t;
    container.innerHTML = `
      <div class="inline-contact-wrapper">
        <h3 class="inline-contact-title">${t.inlineTitle}</h3>
        <p class="desc inline-contact-desc">${t.inlineDesc}</p>

        <div id="inline-contact-alert" style="display: none; margin-bottom: 16px;"></div>

        <form id="inline-contact-form" class="contact-form">
          <div class="contact-field">
            <label for="inline-contact-name">
              <span class="label-text">${t.nameLabel}</span>
              <span class="required-star">*</span>
            </label>
            <input type="text" id="inline-contact-name" name="name" placeholder="${t.namePlaceholder}" required>
          </div>

          <div class="contact-form-row">
            <div class="contact-field">
              <label for="inline-contact-email">
                <span class="label-text">${t.emailLabel}</span>
                <span class="required-star">*</span>
              </label>
              <input type="email" id="inline-contact-email" name="email" placeholder="${t.emailPlaceholder}" required>
            </div>

            <div class="contact-field">
              <label for="inline-contact-phone">
                <span class="label-text">${t.phoneLabel}</span>
                <span class="required-star">*</span>
              </label>
              <input type="tel" id="inline-contact-phone" name="phone" placeholder="${t.phonePlaceholder}" required>
            </div>
          </div>

          <div class="contact-field">
            <label for="inline-contact-msg">
              <span class="label-text">${t.messageLabel}</span>
              <span class="required-star">*</span>
            </label>
            <textarea id="inline-contact-msg" name="message" rows="4" placeholder="${t.messagePlaceholder}" required></textarea>
          </div>

          <button type="submit" class="contact-submit-btn" id="inline-contact-submit">
            <span>${t.submitBtn}</span>
          </button>
        </form>
      </div>
    `;

    this.prefillUserFields(container);

    const form = container.querySelector('#inline-contact-form');
    const alertBox = container.querySelector('#inline-contact-alert');
    const submitBtn = container.querySelector('#inline-contact-submit');

    form.onsubmit = async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const formData = {
        name: form.querySelector('#inline-contact-name').value,
        email: form.querySelector('#inline-contact-email').value,
        phone: form.querySelector('#inline-contact-phone').value,
        message: form.querySelector('#inline-contact-msg').value,
      };

      const error = this.validate(formData);
      if (error) {
        alertBox.className = 'contact-error';
        alertBox.textContent = error;
        alertBox.style.display = 'flex';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = this.t.sendingBtn;

      try {
        await this.submitContact(formData);
        alertBox.className = 'contact-success';
        alertBox.textContent = this.t.successMsg;
        alertBox.style.display = 'block';
        form.reset();
        this.prefillUserFields(form);
      } catch (err) {
        alertBox.className = 'contact-error';
        alertBox.textContent = err.message || this.t.errorGeneral;
        alertBox.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = this.t.submitBtn;
      }
    };
  }
}

export const contact = new ContactManager();
