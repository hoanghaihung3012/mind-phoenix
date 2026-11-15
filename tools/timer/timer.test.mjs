import test from 'node:test';
import assert from 'node:assert/strict';
import { createCountdown, formatDuration, readDuration } from './timer.mjs';

test('custom durations accept hours, minutes, seconds and blank zero-valued parts', () => {
  assert.equal(readDuration({ hours: '1', minutes: '02', seconds: '03' }), 3723);
  assert.equal(readDuration({ hours: '', minutes: ' 5 ', seconds: '' }), 300);
  assert.equal(readDuration({ hours: '', minutes: '', seconds: '1' }), 1);
  assert.equal(readDuration({ hours: '99', minutes: '59', seconds: '59' }), 359999);
});

test('invalid or zero durations report errors rather than changing the timer', () => {
  const valid = { hours: '0', minutes: '5', seconds: '0' };
  for (const [part, invalid] of [
    ['hours', '100'], ['minutes', '60'], ['seconds', '60'],
    ['minutes', '-1'], ['seconds', '1.5'], ['hours', '1e1'],
    ['seconds', 'abc'], ['hours', undefined], ['minutes', 'Infinity']
  ]) {
    assert.throws(() => readDuration({ ...valid, [part]: invalid }), RangeError);
  }
  assert.throws(() => readDuration({ hours: '', minutes: '', seconds: '' }), /1 giây/);
  assert.throws(() => readDuration({ hours: '0', minutes: '0', seconds: '0' }), /1 giây/);
  for (const seconds of [0, -1, 0.5, 360000, NaN, Infinity]) {
    assert.throws(() => createCountdown(seconds), RangeError);
  }
});

test('clock rounds remaining fractions up and shows hours when needed', () => {
  for (const [milliseconds, expected] of [
    [0, '00:00'], [1, '00:01'], [1000, '00:01'], [1001, '00:02'],
    [59999, '01:00'], [3599000, '59:59'], [3600000, '01:00:00'],
    [3723000, '01:02:03'], [359999000, '99:59:59']
  ]) {
    assert.equal(formatDuration(milliseconds), expected);
  }
});

test('pausing preserves fractional seconds and resuming excludes paused time', () => {
  let now = 1000;
  const timer = createCountdown(90, () => now);
  assert.equal(timer.start().state, 'running');
  now += 11234;
  assert.equal(timer.pause().remainingMs, 78766);
  now += 600000;
  assert.deepEqual(timer.snapshot(), { durationMs: 90000, remainingMs: 78766, state: 'paused' });
  timer.start();
  now += 78765;
  assert.equal(timer.snapshot().remainingMs, 1);
  now += 1;
  assert.deepEqual(timer.snapshot(), { durationMs: 90000, remainingMs: 0, state: 'finished' });
});

test('delayed updates finish at zero, and a finished timer can start again', () => {
  let now = 0;
  const timer = createCountdown(60, () => now);
  timer.start();
  now = 25000;
  assert.equal(timer.start().remainingMs, 35000);
  now = 180000;
  assert.deepEqual(timer.pause(), { durationMs: 60000, remainingMs: 0, state: 'finished' });
  now += 10000;
  assert.equal(timer.pause().state, 'finished');
  assert.deepEqual(timer.start(), { durationMs: 60000, remainingMs: 60000, state: 'running' });
});

test('reset stops the previous countdown and preserves state if a new duration is invalid', () => {
  let now = 0;
  const timer = createCountdown(300, () => now);
  timer.start();
  now += 20000;
  assert.throws(() => timer.reset(0), RangeError);
  assert.deepEqual(timer.snapshot(), { durationMs: 300000, remainingMs: 280000, state: 'running' });
  assert.deepEqual(timer.reset(), { durationMs: 300000, remainingMs: 300000, state: 'idle' });
  timer.start();
  assert.deepEqual(timer.reset(3723), { durationMs: 3723000, remainingMs: 3723000, state: 'idle' });
  now += 4000000;
  assert.equal(timer.snapshot().remainingMs, 3723000);
});
