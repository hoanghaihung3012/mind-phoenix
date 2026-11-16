import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpin, numberRange, validateNames } from './wheel.mjs';
import { remainingNames } from '../../games/duck-race/race.mjs';

test('every selected entry lands at the fixed top pointer, across repeated spins and list sizes', () => {
  for (const count of [1, 2, 29, 48, 200]) {
    const names = Array.from({ length: count }, (_, index) => `Bạn ${index}`);
    for (let id = 0; id < count; id++) {
      let rotation = 123.45;
      for (let turn = 0; turn < 3; turn++) {
        const spin = createSpin(names, rotation, (limit) => limit === id + 1 ? 0 : limit - 1);
        assert.equal(spin.winner.id, id);
        assert.ok(spin.rotation - rotation >= 2160 - 1e-8);
        const pointerAngle = (360 - spin.rotation % 360) % 360;
        assert.equal(Math.floor(pointerAngle / (360 / count)), id);
        rotation = spin.rotation;
      }
    }
  }
});

test('duplicate labels are independent entries and removal only removes the winning line', () => {
  const names = ['An', 'Bình', 'An'];
  const { winner } = createSpin(names, 0, () => 0);
  assert.equal(winner.id, 1);
  assert.deepEqual(remainingNames(names, [winner]), ['An', 'An']);
  const duplicate = createSpin(names, 0, (limit) => limit === 3 ? 0 : 1).winner;
  assert.equal(duplicate.id, 2);
  assert.deepEqual(remainingNames(names, [duplicate]), ['An', 'Bình']);
  assert.deepEqual(names, ['An', 'Bình', 'An']);
});

test('input limits reject invalid spins and accept exact boundaries', () => {
  assert.match(validateNames([]), /ít nhất/);
  assert.equal(validateNames(Array(200).fill('🦆'.repeat(80))), '');
  assert.match(validateNames(Array(201).fill('An')), /200/);
  assert.match(validateNames(['🦆'.repeat(81)]), /80/);
  assert.throws(() => createSpin([]), RangeError);
  assert.throws(() => createSpin(['An'], NaN), RangeError);
});

test('number ranges are inclusive and do not silently truncate or reverse input', () => {
  assert.deepEqual(numberRange(3, 5), ['3', '4', '5']);
  assert.deepEqual(numberRange(99999, 99999), ['99999']);
  assert.equal(numberRange(1, 200).length, 200);
  for (const values of [[0, 5], [5, 3], [1, 201], [1.5, 5], [1, Infinity], [NaN, 5], [99999, 100000]]) {
    assert.throws(() => numberRange(...values), RangeError);
  }
});
