import { initLanguage } from '../tools/i18n.mjs';
import { translations } from './translations.mjs';

export const english = (text) => Object.hasOwn(translations, text) ? translations[text] : text;

export function initGameLanguage() {
  const i18n = initLanguage({ translations });
  const bindings = new Map();
  function bind(node, attribute, vi, en) {
    if (!bindings.has(node)) bindings.set(node, new Map());
    const values = bindings.get(node);
    let target = values.get(attribute)?.target;
    if (!attribute && node.nodeType !== 3 && target?.parentNode !== node) {
      target = document.createTextNode('');
      node.replaceChildren(target);
    }
    values.set(attribute, { vi: String(vi), en: String(en), target });
    if (attribute) node.setAttribute(attribute, i18n.t(vi, en));
    else (target ?? node).textContent = i18n.t(vi, en);
  }
  i18n.onChange(() => {
    for (const [node, values] of bindings) {
      if (!node.isConnected) { bindings.delete(node); continue; }
      for (const [attribute, { vi, en }] of values) bind(node, attribute, vi, en);
    }
  });
  return Object.assign(i18n, {
    text: (node, vi, en = english(vi)) => bind(node, null, vi, en),
    attr: (node, attribute, vi, en = english(vi)) => bind(node, attribute, vi, en),
  });
}
