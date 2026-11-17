import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SENTENCE_DECK,
  createSentenceTokens,
  checkSentence,
} from './builder.mjs';

test('SENTENCE_DECK contains valid sentences and word lists', () => {
  assert.ok(SENTENCE_DECK.length >= 8);
  for (const item of SENTENCE_DECK) {
    assert.ok(item.sentence && item.translation && item.words.length >= 3);
    assert.equal(item.words.join(' '), item.sentence);
  }
});

test('createSentenceTokens scrambles the word list into tokens', () => {
  const item = SENTENCE_DECK[0];
  const tokens = createSentenceTokens(item);
  assert.equal(tokens.length, item.words.length);
  assert.ok(tokens.every(t => t.id && t.text));
});

test('checkSentence verifies matching full string ignoring case', () => {
  const correctTokens = [{ text: 'I' }, { text: 'love' }, { text: 'sunny' }, { text: 'days.' }];
  const wrongTokens = [{ text: 'love' }, { text: 'I' }, { text: 'sunny' }, { text: 'days.' }];

  assert.equal(checkSentence(correctTokens, 'I love sunny days.'), true);
  assert.equal(checkSentence(wrongTokens, 'I love sunny days.'), false);
});
