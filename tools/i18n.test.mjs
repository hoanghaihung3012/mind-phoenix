import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./i18n.mjs', import.meta.url), 'utf8').replace('export function', 'function');

function setup({ saved = null, browserLanguage = 'en-US', blocked = false } = {}) {
  const element = (html = '', attributes = {}) => ({
    innerHTML: html, attributes, dataset: {}, listeners: {},
    getAttribute(name) { return this.attributes[name] ?? null; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; }
  });
  const title = element('Tiêu đề <span>gốc</span>');
  title.dataset.en = 'English <span>title</span>';
  const label = element('', { 'aria-label': 'Nhãn', 'data-en-aria-label': 'Label' });
  const vi = element(), en = element(), toggle = { hidden: true };
  vi.dataset.lang = 'vi';
  en.dataset.lang = 'en';
  const values = new Map(saved == null ? [] : [['mp-lang', saved]]);
  const warnings = [];
  const document = {
    documentElement: { lang: 'vi' },
    querySelector: () => toggle,
    querySelectorAll: (selector) => ({
      '[data-lang]': [vi, en], '[data-en]': [title], '[data-en-aria-label]': [label]
    })[selector] || []
  };
  const context = vm.createContext({
    document, navigator: { language: browserLanguage },
    console: { warn: (...args) => warnings.push(args) },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage blocked'); return values.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error('Storage blocked'); values.set(key, value); }
    }
  });
  vm.runInContext(source, context);
  return { document, title, label, vi, en, toggle, values, warnings, i18n: context.initLanguage() };
}

test('switching restores original markup and accessible labels, persists choice, and notifies dynamic renderers', () => {
  const env = setup({ saved: 'vi' });
  let changes = 0;
  env.i18n.onChange(() => { changes++; });
  assert.equal(env.toggle.hidden, false);
  env.en.listeners.click();
  assert.equal(env.title.innerHTML, 'English <span>title</span>');
  assert.equal(env.label.getAttribute('aria-label'), 'Label');
  assert.equal(env.en.getAttribute('aria-pressed'), 'true');
  assert.equal(env.i18n.locale, 'en-US');
  assert.equal(env.i18n.t('Gốc', 'Translated'), 'Translated');
  assert.equal(env.values.get('mp-lang'), 'en');
  env.vi.listeners.click();
  assert.equal(env.title.innerHTML, 'Tiêu đề <span>gốc</span>');
  assert.equal(env.label.getAttribute('aria-label'), 'Nhãn');
  assert.equal(env.en.getAttribute('aria-pressed'), 'false');
  assert.equal(env.i18n.locale, 'vi-VN');
  assert.equal(changes, 2);
});

test('a valid saved preference overrides the browser; missing or invalid preferences use the browser language', () => {
  assert.equal(setup({ saved: 'vi', browserLanguage: 'en-US' }).i18n.language, 'vi');
  assert.equal(setup({ saved: 'en', browserLanguage: 'vi-VN' }).i18n.language, 'en');
  assert.equal(setup({ browserLanguage: 'vi-VN' }).i18n.language, 'vi');
  assert.equal(setup({ saved: 'invalid', browserLanguage: 'en-GB' }).i18n.language, 'en');
});

test('blocked storage reports the failure but does not prevent language switching', () => {
  const env = setup({ blocked: true });
  assert.equal(env.i18n.language, 'en');
  env.vi.listeners.click();
  assert.equal(env.document.documentElement.lang, 'vi');
  assert.equal(env.warnings.length, 2);
});
