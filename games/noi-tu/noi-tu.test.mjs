import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORD_PAIRS,
  getHeadSyllable,
  getTailSyllable,
  isValidChainStep,
  findContinuations,
  generateStepOptions,
} from './noi-tu.mjs';

test('WORD_PAIRS contains 2-syllable Vietnamese words', () => {
  assert.ok(WORD_PAIRS.length >= 20);
  for (const w of WORD_PAIRS) {
    const parts = w.split(' ');
    assert.equal(parts.length, 2, `Word "${w}" should have 2 syllables`);
  }
});

test('getHeadSyllable and getTailSyllable extract first and last syllable', () => {
  assert.equal(getHeadSyllable('HOA MAI'), 'HOA');
  assert.equal(getTailSyllable('HOA MAI'), 'MAI');
});

test('isValidChainStep correctly verifies syllable chain', () => {
  assert.equal(isValidChainStep('HOA MAI', 'MAI SAU'), true);
  assert.equal(isValidChainStep('MAI SAU', 'SAU NÀY'), true);
  assert.equal(isValidChainStep('HOA MAI', 'HỌC HÀNH'), false);
  assert.equal(isValidChainStep('HOA MAI', 'HOA MAI'), false); // Duplicate word
});

test('findContinuations returns words starting with the tail syllable', () => {
  const conts = findContinuations('HOA MAI');
  assert.ok(conts.includes('MAI SAU'));
});

test('generateStepOptions creates mixed choices containing the valid next word', () => {
  const options = generateStepOptions('HOA MAI');
  assert.ok(options.length >= 2);
  assert.ok(options.some(o => o.isCorrect && o.text === 'MAI SAU'));
  assert.ok(options.some(o => !o.isCorrect));
});
