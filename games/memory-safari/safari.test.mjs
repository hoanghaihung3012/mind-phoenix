import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SAFARI_THEMES,
  createMemoryBoard,
  isMatch,
} from './safari.mjs';

test('SAFARI_THEMES has valid theme categories with 6 pairs each', () => {
  assert.ok(SAFARI_THEMES.length >= 3);
  for (const t of SAFARI_THEMES) {
    assert.ok(t.id && t.title.vi && t.title.en);
    assert.equal(t.pairs.length, 6);
    assert.ok(t.pairs.every(p => p.id && p.word && p.icon));
  }
});

test('createMemoryBoard generates 12 card tokens (6 word cards, 6 icon cards)', () => {
  const theme = SAFARI_THEMES[0];
  const board = createMemoryBoard(theme);
  assert.equal(board.length, 12);

  const words = board.filter(c => c.type === 'word');
  const icons = board.filter(c => c.type === 'icon');

  assert.equal(words.length, 6);
  assert.equal(icons.length, 6);
});

test('isMatch accurately pairs a word card with its matching icon card', () => {
  const cardWord = { cardId: 'c1', pairId: 'lion', type: 'word' };
  const cardIcon = { cardId: 'c2', pairId: 'lion', type: 'icon' };
  const cardDiff = { cardId: 'c3', pairId: 'zebra', type: 'icon' };

  assert.equal(isMatch(cardWord, cardIcon), true);
  assert.equal(isMatch(cardWord, cardDiff), false);
  assert.equal(isMatch(cardWord, cardWord), false); // Same card
});
