import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPELLING_BANK,
  getQuestionOptions,
  evaluateAnswer,
} from './chinh-ta.mjs';

test('SPELLING_BANK contains rich pairs with explanation and rule', () => {
  assert.ok(SPELLING_BANK.length >= 12);
  for (const item of SPELLING_BANK) {
    assert.ok(item.sentence && item.correct && item.wrong && item.explanation && item.rule);
    assert.notEqual(item.correct, item.wrong);
  }
});

test('getQuestionOptions provides both correct and wrong choices shuffled', () => {
  const item = SPELLING_BANK[0];
  const opts = getQuestionOptions(item);
  assert.equal(opts.length, 2);
  assert.ok(opts.some(o => o.isCorrect && o.text === item.correct));
  assert.ok(opts.some(o => !o.isCorrect && o.text === item.wrong));
});

test('evaluateAnswer rewards correct choices and streaks while penalizing mistakes', () => {
  const hit = evaluateAnswer({ isCorrect: true, timeRemaining: 10, streak: 2 });
  // 100 + 40 + 40 = 180
  assert.equal(hit.earned, 180);

  const miss = evaluateAnswer({ isCorrect: false, timeRemaining: 10, streak: 2 });
  assert.equal(miss.earned, -30);
});
