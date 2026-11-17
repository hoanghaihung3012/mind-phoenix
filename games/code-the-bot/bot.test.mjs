import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIRECTIONS,
  COMMANDS,
  LEVELS,
  expandCommands,
  getLevel,
  simulate,
} from './bot.mjs';

test('expandCommands flattens simple strings and nested repeat blocks', () => {
  const input = [
    'forward',
    { type: 'repeat-2', body: ['forward', 'turn-right'] },
    'turn-left',
  ];
  const expanded = expandCommands(input);
  assert.equal(expanded.length, 1 + 2 * 2 + 1);
  assert.deepEqual(expanded.map((c) => c.type), [
    'forward',
    'forward', 'turn-right',
    'forward', 'turn-right',
    'turn-left',
  ]);
});

test('level 1 can be solved with 2 forward steps and collects 1 star', () => {
  const lvl = getLevel(1);
  const result = simulate(lvl, ['forward', 'forward']);
  assert.equal(result.success, true);
  assert.equal(result.status, 'goal');
  assert.equal(result.starsEarned, 1);
  assert.equal(result.allStarsCollected, true);
  assert.equal(result.optimal, true);
});

test('turning left and right updates orientation properly without moving coordinates', () => {
  const lvl = {
    id: 99,
    width: 3,
    height: 3,
    start: { x: 1, y: 1, dir: DIRECTIONS.UP },
    goal: { x: 2, y: 2 },
    stars: [],
    walls: [],
    bugs: [],
  };
  const result = simulate(lvl, ['turn-right', 'turn-right']);
  assert.equal(result.steps[1].dir, DIRECTIONS.RIGHT);
  assert.equal(result.steps[2].dir, DIRECTIONS.DOWN);
  assert.equal(result.steps[2].x, 1);
  assert.equal(result.steps[2].y, 1);
});

test('walking into a wall reports wall_hit status and halts simulation', () => {
  const lvl = {
    id: 100,
    width: 4,
    height: 4,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 3, y: 1 },
    stars: [],
    walls: [{ x: 2, y: 1 }],
    bugs: [],
  };
  const result = simulate(lvl, ['forward', 'forward']);
  assert.equal(result.success, false);
  assert.equal(result.status, 'wall_hit');
});

test('stepping on a bug reports bug_hit and halts', () => {
  const lvl = {
    id: 101,
    width: 4,
    height: 4,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 3, y: 1 },
    stars: [],
    walls: [],
    bugs: [{ x: 2, y: 1 }],
  };
  const result = simulate(lvl, ['forward']);
  assert.equal(result.success, false);
  assert.equal(result.status, 'bug_hit');
});

test('jumping leaps over an obstacle cell', () => {
  const lvl = getLevel(5); // Has jumpable wall at { x: 2, y: 1 }, goal at { x: 4, y: 1 }
  const result = simulate(lvl, ['jump', 'forward', 'forward']);
  assert.equal(result.success, true);
  assert.equal(result.status, 'goal');
  assert.equal(result.steps[1].x, 3);
  assert.equal(result.steps[1].y, 1);
});

test('walking into a teleport portal moves bot immediately to target', () => {
  const lvl = getLevel(10);
  // Start: (1,1), dir: RIGHT. Portal: from (3,1) to (2,3)
  const result = simulate(lvl, ['forward', 'forward']);
  const lastStep = result.steps[result.steps.length - 1];
  assert.equal(lastStep.action, 'teleport');
  assert.equal(lastStep.x, 2);
  assert.equal(lastStep.y, 3);
});

test('level 7 solves with repeat loop', () => {
  const lvl = getLevel(7);
  const result = simulate(lvl, [{ type: 'repeat-3', body: ['forward'] }]);
  assert.equal(result.success, true);
  assert.equal(result.status, 'goal');
  assert.equal(result.starsEarned, 2);
});

test('out of bounds detects walking off the grid edges', () => {
  const lvl = getLevel(1); // Start (1,1), dir: RIGHT, width: 5
  const result = simulate(lvl, ['turn-left', 'turn-left', 'forward', 'forward']);
  assert.equal(result.success, false);
  assert.equal(result.status, 'out_of_bounds');
});
