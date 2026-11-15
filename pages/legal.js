(() => {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-lang]')];
  const notice = document.getElementById('storage-notice');
  let storageUnavailable = false;

  function reportStorageError(error) {
    storageUnavailable = true;
    notice.hidden = false;
    console.warn('Mind Phoenix could not access the saved language preference.', error);
  }

  function setLanguage(language, persist = false) {
    const lang = language === 'vi' ? 'vi' : 'en';
    root.lang = lang;
    document.querySelectorAll('[data-en][data-vi]').forEach((element) => {
      element.textContent = element.dataset[lang];
    });
    document.querySelectorAll('[data-language]').forEach((element) => {
      element.hidden = element.dataset.language !== lang;
    });
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    });
    document.title = `${document.querySelector('h1').textContent} | Mind Phoenix`;
    const description = document.querySelector('meta[name="description"]');
    description.content = description.dataset[lang];
    if (persist && !storageUnavailable) {
      try {
        localStorage.setItem('mp-lang', lang);
      } catch (error) {
        reportStorageError(error);
      }
    }
  }

  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('mp-lang');
  } catch (error) {
    reportStorageError(error);
  }
  setLanguage(savedLanguage);
  buttons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang, true));
  });
  document.querySelector('.lang-toggle').hidden = false;
})();
