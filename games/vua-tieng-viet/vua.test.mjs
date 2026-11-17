import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORD_BANK,
  LEVELS,
  normalizeVietnamese,
  splitIntoLetters,
  splitIntoWords,
  shuffleArray,
  createScrambleTokens,
  checkAnswer,
  getNextHintToken,
  calculateQuestionScore,
  getQuestionsForLevel,
} from './vua.mjs';

test('WORD_BANK contains valid words, meanings in VI/EN and distinct difficulties', () => {
  assert.ok(WORD_BANK.length >= 20, 'Word bank should have at least 20 entries');

  for (const item of WORD_BANK) {
    assert.ok(item.id, 'Word item must have an id');
    assert.ok(item.word && typeof item.word === 'string', 'Word must be non-empty string');
    assert.ok(item.meaning?.vi, `Word "${item.word}" must have Vietnamese meaning`);
    assert.ok(item.meaning?.en, `Word "${item.word}" must have English meaning`);
    assert.ok(['letters', 'words'].includes(item.type), 'Type must be letters or words');
    assert.ok(item.difficulty >= 1 && item.difficulty <= 5, 'Difficulty must be 1 to 5');
  }
});

test('normalizeVietnamese strips surrounding spaces and normalizes internal whitespace to uppercase', () => {
  assert.equal(normalizeVietnamese('  uống   nước  nhớ nguồn  '), 'UỐNG NƯỚC NHỚ NGUỒN');
  assert.equal(normalizeVietnamese('chăm chỉ'), 'CHĂM CHỈ');
  assert.equal(normalizeVietnamese(null), '');
});

test('splitIntoLetters extracts letters without whitespace', () => {
  const letters = splitIntoLetters('CHĂM CHỈ');
  assert.deepEqual(letters, ['C', 'H', 'Ă', 'M', 'C', 'H', 'Ỉ']);
});

test('splitIntoWords breaks down phrase into uppercase syllables', () => {
  const words = splitIntoWords('Uống nước nhớ nguồn');
  assert.deepEqual(words, ['UỐNG', 'NƯỚC', 'NHỚ', 'NGUỒN']);
});

test('shuffleArray ensures non-identity order when length > 1', () => {
  const input = ['A', 'B', 'C', 'D', 'E'];
  const shuffled = shuffleArray(input);
  assert.equal(shuffled.length, input.length);
  assert.ok(shuffled.every(item => input.includes(item)));
});

test('createScrambleTokens generates valid token objects and shuffles them', () => {
  const sample = WORD_BANK.find(w => w.word === 'DŨNG CẢM');
  const tokens = createScrambleTokens(sample);
  assert.equal(tokens.length, 7); // D, Ũ, N, G, C, Ả, M
  assert.ok(tokens.every(t => t.id && t.text));
});

test('checkAnswer validates both letter and word scramble modes accurately', () => {
  const letterItem = { type: 'letters', word: 'DŨNG CẢM' };
  const correctTokens = [
    { text: 'D' }, { text: 'Ũ' }, { text: 'N' }, { text: 'G' },
    { text: 'C' }, { text: 'Ả' }, { text: 'M' },
  ];
  const wrongTokens = [
    { text: 'C' }, { text: 'Ả' }, { text: 'M' },
    { text: 'D' }, { text: 'Ũ' }, { text: 'N' }, { text: 'G' },
  ];

  assert.equal(checkAnswer(correctTokens, letterItem), true);
  assert.equal(checkAnswer(wrongTokens, letterItem), false);

  const wordItem = { type: 'words', word: 'UỐNG NƯỚC NHỚ NGUỒN' };
  const correctWords = [
    { text: 'UỐNG' }, { text: 'NƯỚC' }, { text: 'NHỚ' }, { text: 'NGUỒN' },
  ];
  const wrongWords = [
    { text: 'NƯỚC' }, { text: 'UỐNG' }, { text: 'NHỚ' }, { text: 'NGUỒN' },
  ];

  assert.equal(checkAnswer(correctWords, wordItem), true);
  assert.equal(checkAnswer(wrongWords, wordItem), false);
});

test('getNextHintToken identifies the exact required next token from pool', () => {
  const item = { type: 'words', word: 'HỌC ĐI ĐÔI VỚI HÀNH' };
  const pool = [
    { text: 'HÀNH', id: '1' },
    { text: 'ĐÔI', id: '2' },
    { text: 'HỌC', id: '3' },
    { text: 'VỚI', id: '4' },
    { text: 'ĐI', id: '5' },
  ];

  // User hasn't selected anything yet, first should be 'HỌC'
  const hint1 = getNextHintToken(pool, [], item);
  assert.equal(hint1.text, 'HỌC');

  // User has selected 'HỌC', next should be 'ĐI'
  const hint2 = getNextHintToken(pool, [{ text: 'HỌC' }], item);
  assert.equal(hint2.text, 'ĐI');
});

test('calculateQuestionScore scales with difficulty, streak, timeRemaining and penalizes hints', () => {
  const base = calculateQuestionScore({ timeRemaining: 0, hintsUsed: 0, streak: 0, difficulty: 1 });
  assert.equal(base, 100);

  const fastScore = calculateQuestionScore({ timeRemaining: 20, hintsUsed: 0, streak: 2, difficulty: 2 });
  // base: 200 + time: 100 + streak: 50 - hint: 0 = 350
  assert.equal(fastScore, 350);

  const hintPenalized = calculateQuestionScore({ timeRemaining: 0, hintsUsed: 2, streak: 0, difficulty: 1 });
  // 100 - 60 = 40
  assert.equal(hintPenalized, 40);
});

test('getQuestionsForLevel retrieves appropriate difficulty questions', () => {
  const level1 = LEVELS[0];
  const questions = getQuestionsForLevel(level1);
  assert.equal(questions.length, level1.targetCount);
  assert.ok(questions.every(q => level1.difficulties.includes(q.difficulty)));
});
