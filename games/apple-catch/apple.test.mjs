import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASKET_RIM, BASKET_W, GROUND_Y, HARD_QUESTIONS, LEVELS, MEDIUM_QUESTIONS, QUESTION_RULES,
  applyPoints, createQuestionDeck, isCaught, levelResult, mulberry32, pickItemKind,
} from './apple.mjs';

test('question banks have four distinct choices and the deck mixes in occasional advanced questions', () => {
  for (const { q, choices } of [...MEDIUM_QUESTIONS, ...HARD_QUESTIONS]) {
    assert.equal(choices.length, 4, q);
    assert.equal(new Set(choices).size, 4, q);
  }
  const deck = createQuestionDeck(mulberry32(3));
  let hard = 0;
  for (let i = 0; i < 500; i += 1) {
    const question = deck.next();
    const bank = question.level === 'hard' ? HARD_QUESTIONS : MEDIUM_QUESTIONS;
    const source = bank.find((item) => item.q === question.prompt);
    assert.ok(source, 'question comes from the bank matching its level');
    assert.equal(question.choices[question.correctIndex], source.choices[0]);
    assert.equal(question.reward, QUESTION_RULES[question.level].reward);
    if (question.level === 'hard') hard += 1;
  }
  assert.ok(hard > 60 && hard < 140, `advanced questions should be occasional, got ${hard}/500`);
  assert.ok(QUESTION_RULES.hard.reward > QUESTION_RULES.medium.reward);
});

test('later levels drop more worms, faster, and every level drops questions and mostly fruit', () => {
  const counts = LEVELS.map((level) => {
    const rng = mulberry32(level.id);
    const tally = {};
    for (let i = 0; i < 5000; i += 1) { const kind = pickItemKind(level, rng); tally[kind] = (tally[kind] ?? 0) + 1; }
    return tally;
  });
  for (let i = 0; i < LEVELS.length; i += 1) {
    assert.ok(counts[i].question > 0 && counts[i].apple > counts[i].worm, `level ${i + 1}`);
    if (i) {
      assert.ok(counts[i].worm > counts[i - 1].worm, 'worms increase');
      assert.ok(LEVELS[i].speed[0] > LEVELS[i - 1].speed[0], 'fruit falls faster');
      assert.notEqual(LEVELS[i].scene, LEVELS[i - 1].scene, 'each level has its own scene');
    }
  }
  assert.ok(counts[0].goldenApple > 0 && counts[0].goldenApple < counts[0].apple / 5, 'golden apples are rare');
});

test('items are caught only when crossing the basket rim inside the opening', () => {
  const rim = GROUND_Y - BASKET_RIM;
  assert.equal(isCaught({ x: 300, prevY: rim - 5, y: rim + 2 }, 300), true);
  assert.equal(isCaught({ x: 300 + BASKET_W / 2, prevY: rim - 5, y: rim + 2 }, 300), true);
  assert.equal(isCaught({ x: 300 + BASKET_W, prevY: rim - 5, y: rim + 2 }, 300), false, 'beside the basket');
  assert.equal(isCaught({ x: 300, prevY: rim + 2, y: rim + 8 }, 300), false, 'already below the rim (slid in from the side)');
  assert.equal(isCaught({ x: 300, prevY: rim - 20, y: rim - 5 }, 300), false, 'still above');
});

test('a level is cleared at its target, fails when time runs out, and penalties never go below zero', () => {
  const level = LEVELS[0];
  assert.equal(levelResult(level.target, 10, level), 'cleared');
  assert.equal(levelResult(level.target, 0, level), 'cleared');
  assert.equal(levelResult(level.target - 1, 0.01, level), 'playing');
  assert.equal(levelResult(level.target - 1, 0, level), 'failed');
  assert.equal(applyPoints(10, -20), 0);
  assert.equal(applyPoints(30, -20), 10);
  assert.equal(applyPoints(30, 40), 70);
});
