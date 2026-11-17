import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPELL_WORDS,
  createLetterTiles,
  checkSpelling,
  getNextTileHint,
} from './quest.mjs';

test('SPELL_WORDS contains valid words, icons, and bilingual hints', () => {
  assert.ok(SPELL_WORDS.length >= 10);
  for (const item of SPELL_WORDS) {
    assert.ok(item.word && typeof item.word === 'string');
    assert.ok(item.icon);
    assert.ok(item.hint.vi && item.hint.en);
  }
});

test('createLetterTiles splits word into uppercase character tokens', () => {
  const tiles = createLetterTiles('CAT');
  assert.equal(tiles.length, 3);
  assert.ok(tiles.every(t => ['C', 'A', 'T'].includes(t.char)));
});

test('checkSpelling correctly verifies exact match', () => {
  const correct = [{ char: 'L' }, { char: 'I' }, { char: 'O' }, { char: 'N' }];
  const wrong = [{ char: 'O' }, { char: 'I' }, { char: 'L' }, { char: 'N' }];

  assert.equal(checkSpelling(correct, 'LION'), true);
  assert.equal(checkSpelling(wrong, 'LION'), false);
});

test('getNextTileHint finds the next needed character from available pool', () => {
  const available = [{ char: 'N' }, { char: 'L' }, { char: 'O' }, { char: 'I' }];
  const hint1 = getNextTileHint(available, [], 'LION');
  assert.equal(hint1?.char, 'L');

  const hint2 = getNextTileHint(available, [{ char: 'L' }], 'LION');
  assert.equal(hint2?.char, 'I');
});
