import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEADERBOARD_SIZE, LevelGenerator, MAX_PLATFORM_Y, MIN_PLATFORM_Y, PLATFORM_LIFE, QUESTIONS,
  addScore, createQuestionDeck, horizontalReach, maxJumpHeight, mulberry32, normalizeName, parseLeaderboard, platformState, questionReward,
} from './sky.mjs';

test('question bank has four distinct choices per question and the deck tracks the shuffled answer', () => {
  for (const { q, choices } of QUESTIONS) {
    assert.equal(choices.length, 4, q);
    assert.equal(new Set(choices).size, 4, q);
  }
  const deck = createQuestionDeck(mulberry32(7));
  const seen = new Set();
  for (let i = 0; i < QUESTIONS.length; i += 1) {
    const question = deck.next();
    const source = QUESTIONS.find((item) => item.q === question.prompt);
    assert.equal(question.choices[question.correctIndex], source.choices[0]);
    seen.add(question.prompt);
  }
  assert.equal(seen.size, QUESTIONS.length, 'no repeats before the whole bank is used');
});

test('platforms crack over five seconds, shake in the final second, then break', () => {
  assert.deepEqual(platformState(null), { stage: 0, shaking: false, broken: false });
  assert.equal(platformState(2.5).stage, 1);
  assert.equal(platformState(3.9).shaking, false);
  assert.equal(platformState(4.2).shaking, true);
  assert.equal(platformState(PLATFORM_LIFE - 0.01).broken, false);
  assert.equal(platformState(PLATFORM_LIFE).broken, true);
});

test('every generated main platform and branch is within jump reach', () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const world = { platforms: [], stars: [], questions: [] };
    const generator = new LevelGenerator(mulberry32(seed));
    generator.start(world, 0, 400, 400);
    generator.generateUntil(world, 30000);
    const mains = world.platforms.filter((p) => p.kind !== 'branch');
    for (let i = 1; i < mains.length; i += 1) {
      const from = mains[i - 1];
      const to = mains[i];
      const branch = world.platforms.find((p) => p.kind === 'branch' && p.x > from.x && p.x < from.x + from.w);
      const launch = branch && branch.x + branch.w > from.x + from.w ? branch : from;
      const rise = launch.y - to.y;
      assert.ok(to.y >= MIN_PLATFORM_Y && to.y <= MAX_PLATFORM_Y, `y ${to.y}`);
      assert.ok(to.x - (launch.x + launch.w) <= horizontalReach(rise) * 0.8, `seed ${seed}: gap ${to.x - launch.x - launch.w} rise ${rise}`);
      if (branch) assert.ok(from.y - branch.y < maxJumpHeight() - 20, 'branch can be climbed onto');
    }
    assert.ok(world.questions.length > 10, 'questions appear regularly');
    assert.ok(world.stars.length > 50, 'stars appear regularly');
  }
});

test('correct answers reward faster responses', () => {
  assert.equal(questionReward(30), 110);
  assert.equal(questionReward(0.2), 52);
  assert.equal(questionReward(-1), 50);
});

test('leaderboard keeps the top scores, ranks ties by earliest and sanitizes stored data', () => {
  let board = [];
  for (let i = 0; i < LEADERBOARD_SIZE; i += 1) board = addScore(board, { name: `P${i}`, score: 100 + i, date: i }).board;
  const low = addScore(board, { name: 'Thấp', score: 50, date: 99 });
  assert.equal(low.rank, null);
  assert.equal(low.board.length, LEADERBOARD_SIZE);
  const tie = addScore(board, { name: 'Hòa', score: 109, date: 99 });
  assert.equal(tie.rank, 2);
  assert.equal(normalizeName('   '), 'Bạn nhỏ');
  assert.equal(normalizeName('  Nguyễn   Văn\tAn  rất dài tên quá '), 'Nguyễn Văn An rấ');
  assert.deepEqual(parseLeaderboard('nope'), []);
  assert.deepEqual(parseLeaderboard('{"a":1}'), []);
  const parsed = parseLeaderboard(JSON.stringify([{ name: 'A', score: 5.7, date: 1 }, { name: 'B', score: -1 }, { score: 'x' }, null, { name: 'C', score: 9, date: 2 }]));
  assert.deepEqual(parsed.map((entry) => [entry.name, entry.score]), [['C', 9], ['A', 5]]);
});
