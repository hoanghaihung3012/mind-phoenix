import test from 'node:test';
import assert from 'node:assert/strict';
import {
  THEMES,
  generateRoundBalloons,
  calculatePopScore,
  isRoundCleared,
} from './pop.mjs';

test('THEMES has valid categories with words and distinct distractors', () => {
  assert.ok(THEMES.length >= 4, 'Should have at least 4 themes');

  for (const theme of THEMES) {
    assert.ok(theme.id && theme.title.vi && theme.title.en);
    assert.ok(theme.words.length >= 10, `${theme.id} words should have at least 10 words`);
    assert.ok(theme.distractors.length >= 8, `${theme.id} distractors should have at least 8 words`);
    
    // Distractors shouldn't overlap with words
    for (const d of theme.distractors) {
      assert.ok(!theme.words.includes(d), `Distractor ${d} overlaps with words in ${theme.id}`);
    }
  }
});

test('generateRoundBalloons creates balanced pool with correct words and distractors', () => {
  const theme = THEMES[0];
  const balloons = generateRoundBalloons(theme, 10);
  assert.equal(balloons.length, 10);

  const correct = balloons.filter(b => b.isCorrect);
  const wrong = balloons.filter(b => !b.isCorrect);

  assert.ok(correct.length >= 4, 'Should have at least 4 correct balloons');
  assert.ok(wrong.length >= 3, 'Should have at least 3 distractors');
  assert.ok(balloons.every(b => b.id && b.word && b.color));
});

test('calculatePopScore rewards combos and penalizes mistakes', () => {
  const baseHit = calculatePopScore({ isCorrect: true, streak: 0 });
  assert.equal(baseHit.earned, 50);

  const comboHit = calculatePopScore({ isCorrect: true, streak: 3 });
  assert.equal(comboHit.earned, 80); // 50 + 30

  const miss = calculatePopScore({ isCorrect: false, streak: 5 });
  assert.equal(miss.earned, -25);
});

test('isRoundCleared detects zero remaining target balloons', () => {
  assert.equal(isRoundCleared(2), false);
  assert.equal(isRoundCleared(0), true);
  assert.equal(isRoundCleared(-1), true);
});
