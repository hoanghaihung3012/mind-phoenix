import test from 'node:test';
import assert from 'node:assert/strict';
import { DIFFICULTIES, ROUNDS, advanceRound, createQuestion, createRun, recordAnswer, retryRound } from './challenge.mjs';

function seeded(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

function calculate(prompt) {
  const tokens = prompt.split(' = ')[0].split(' ');
  let value = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const next = Number(tokens[i + 1]);
    if (tokens[i] === '+') value += next;
    else if (tokens[i] === '−') value -= next;
    else if (tokens[i] === '×') value *= next;
    else if (tokens[i] === ':') value /= next;
  }
  return value;
}

test('generated arithmetic is correct, elementary and has distinct answer choices in both modes', () => {
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    const rng = seeded(23);
    const operators = new Set();
    for (let i = 0; i < 500; i++) {
      for (const id of ['bubbles', 'bridge', 'lightning']) {
        const question = createQuestion(id, difficulty, rng);
        const answer = calculate(question.prompt);
        question.prompt.split(' ').filter((token) => ['+', '−', '×', ':'].includes(token)).forEach((op) => operators.add(op));
        assert.ok(Number.isInteger(answer) && answer >= 0);
        if (id === 'lightning') {
          assert.equal(question.answer, answer === Number(question.prompt.split(' = ')[1]));
        } else {
          assert.equal(question.answer, answer);
          assert.equal(question.choices.length, 4);
          assert.equal(new Set(question.choices).size, 4);
          assert.ok(question.choices.includes(answer));
          assert.ok(question.choices.every((value) => Number.isInteger(value) && value >= 0));
          if (difficulty === 'easy') assert.ok(answer <= 40);
        }
      }
    }
    assert.deepEqual([...operators].sort(), (difficulty === 'easy' ? ['+', '−', '×'] : ['+', '−', '×', ':']).sort());
  }
});

test('stars have four unique numbers and an ascending solution; lightning includes both verdicts', () => {
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    const rng = seeded(77);
    const verdicts = new Set();
    for (let i = 0; i < 100; i++) {
      const question = createQuestion('stars', difficulty, rng);
      assert.equal(new Set(question.choices).size, 4);
      assert.deepEqual([...question.choices].sort((a, b) => a - b), question.answer);
      verdicts.add(createQuestion('lightning', difficulty, rng).answer);
    }
    assert.equal(verdicts.size, 2);
  }
});

test('five answers close a round, passing requires three and scores are banked only once', () => {
  let run = createRun('easy');
  for (const correct of [true, false, true, false, true]) run = recordAnswer(run, correct, 10);
  assert.equal(run.status, 'passed');
  assert.equal(run.roundScore, 450);
  assert.equal(run.score, 0);
  assert.equal(recordAnswer(run, true, 10), run);
  run = advanceRound(run);
  assert.equal(run.round, 1);
  assert.equal(run.score, 450);
  assert.equal(run.correct, 0);
  assert.equal(run.answered, 0);
  assert.throws(() => advanceRound(run));
  for (let round = 1; round < ROUNDS.length; round++) {
    for (let i = 0; i < 5; i++) run = recordAnswer(run, true, 0);
    run = advanceRound(run);
  }
  assert.equal(run.status, 'complete');
  assert.equal(run.results.length, 4);
  assert.equal(run.score, 1950);
  assert.throws(() => advanceRound(run));
});

test('retry discards failed round points, preserves cleared rounds and restarts the same mini game', () => {
  let run = createRun('hard');
  for (let i = 0; i < 5; i++) run = recordAnswer(run, true, 5);
  run = advanceRound(run);
  const banked = run.score;
  for (let i = 0; i < 5; i++) run = recordAnswer(run, i < 2, 5);
  assert.equal(run.status, 'failed');
  assert.throws(() => advanceRound(run));
  run = retryRound(run);
  assert.equal(run.round, 1);
  assert.equal(run.score, banked);
  assert.equal(run.results.length, 1);
  assert.equal(run.roundScore, 0);
  assert.equal(run.answered, 0);
  assert.equal(run.correct, 0);
  assert.throws(() => retryRound(run));
});

test('time bonus is bounded and invalid game settings fail explicitly', () => {
  assert.equal(recordAnswer(createRun('hard'), true, 100).roundScore, 160);
  assert.equal(recordAnswer(createRun('easy'), true, -1).roundScore, 100);
  assert.equal(recordAnswer(createRun('easy'), false, 18).roundScore, 0);
  assert.throws(() => createRun('unknown'));
  assert.throws(() => createQuestion('unknown', 'easy'));
  assert.throws(() => createQuestion('bridge', 'unknown'));
});
