export function initLanguage() {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-lang]')];
  const entries = [...document.querySelectorAll('[data-en]')].map((element) =>
    [element, null, element.innerHTML, element.dataset.en]);
  for (const attribute of ['aria-label', 'title', 'content']) {
    document.querySelectorAll(`[data-en-${attribute}]`).forEach((element) => {
      entries.push([element, attribute, element.getAttribute(attribute), element.getAttribute(`data-en-${attribute}`)]);
    });
  }
  const listeners = new Set();
  let language;

  function setLanguage(next, persist = false) {
    language = next === 'vi' ? 'vi' : 'en';
    root.lang = language;
    for (const [element, attribute, vi, en] of entries) {
      const value = language === 'en' ? en : vi;
      if (attribute) element.setAttribute(attribute, value);
      else element.innerHTML = value;
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    }
    if (persist) {
      try {
        localStorage.setItem('mp-lang', language);
      } catch (error) {
        console.warn('Mind Phoenix could not save the language preference.', error);
      }
    }
    listeners.forEach((listener) => listener());
  }

  let saved;
  try {
    saved = localStorage.getItem('mp-lang');
  } catch (error) {
    console.warn('Mind Phoenix could not read the language preference.', error);
  }
  setLanguage(saved === 'vi' || saved === 'en' ? saved
    : (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en');
  for (const button of buttons) {
    button.addEventListener('click', () => setLanguage(button.dataset.lang, true));
  }
  document.querySelector('.lang-toggle').hidden = false;

  return {
    get language() { return language; },
    get locale() { return language === 'en' ? 'en-US' : 'vi-VN'; },
    t: (vi, en) => language === 'en' ? en : vi,
    onChange: (listener) => listeners.add(listener)
  };
}
