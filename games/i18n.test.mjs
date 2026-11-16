import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { english } from './i18n.mjs';
import { QUESTIONS } from './sky-jump/sky.mjs';
import { MEDIUM_QUESTIONS, HARD_QUESTIONS } from './apple-catch/apple.mjs';

const source = readFileSync(new URL('./i18n.mjs', import.meta.url), 'utf8')
  .replace(/^import .*;$/gm, '').replace(/^export /gm, '');

function setup() {
  let language = 'vi';
  const listeners = [];
  const createTextNode = (value) => ({ nodeType: 3, textContent: value, isConnected: true });
  const context = vm.createContext({
    translations: {}, document: { createTextNode },
    initLanguage: () => ({
      t: (vi, en) => language === 'en' ? en : vi,
      onChange: (listener) => listeners.push(listener)
    })
  });
  vm.runInContext(source, context);
  return {
    i18n: context.initGameLanguage(),
    switchTo(next) { language = next; listeners.forEach((listener) => listener()); },
    node() {
      return {
        nodeType: 1, isConnected: true, children: [], attributes: {},
        replaceChildren(child) { this.children = [child]; child.parentNode = this; },
        setAttribute(name, value) { this.attributes[name] = value; }
      };
    }
  };
}

test('live game translations retain appended key hints, latest feedback and disabled answer state', () => {
  const env = setup();
  const answer = env.node();
  env.i18n.text(answer, 'Đáp án', 'Answer');
  const hint = { textContent: '1' };
  answer.children.push(hint);
  answer.disabled = true;
  const feedback = env.node();
  env.i18n.text(feedback, 'Cũ', 'Old');
  env.i18n.text(feedback, 'Chính xác!', 'Correct!');
  env.i18n.attr(answer, 'aria-label', 'Phím 1', 'Key 1');
  env.switchTo('en');
  assert.equal(answer.children[0].textContent, 'Answer');
  assert.equal(answer.children[1], hint);
  assert.equal(answer.disabled, true);
  assert.equal(answer.attributes['aria-label'], 'Key 1');
  assert.equal(feedback.children[0].textContent, 'Correct!');
  env.switchTo('vi');
  assert.equal(answer.children[0].textContent, 'Đáp án');
  assert.equal(feedback.children[0].textContent, 'Chính xác!');
});

test('every worded quiz prompt is translated and English choices remain distinct in the original order', () => {
  for (const question of [...QUESTIONS, ...MEDIUM_QUESTIONS, ...HARD_QUESTIONS]) {
    if (/[à-ỹđ]/iu.test(question.q)) assert.notEqual(english(question.q), question.q, question.q);
    assert.notEqual(english(question.topic), question.topic);
    const choices = question.choices.map(english);
    assert.equal(new Set(choices).size, question.choices.length, question.q);
  }
  assert.match(english('Từ nào là tính từ?'), /Vietnamese.*adjective/);
  assert.equal(english('chăm chỉ'), 'chăm chỉ (hard-working)');
  assert.equal(english('Lý Thái Tổ'), 'Lý Thái Tổ');
});
