import test from 'node:test';
import assert from 'node:assert/strict';
import { createRace, parseNames, progressAt, readNamesFile, remainingNames, selectRacers, validateSetup } from './race.mjs';

test('names retain Vietnamese text, duplicate entries and their original identity', () => {
  const names = parseNames('\uFEFF  Hà  \r\n\r\nNguyễn Bình\rHà\n  ');
  assert.deepEqual(names, ['Hà', 'Nguyễn Bình', 'Hà']);
  const race = createRace(names, 15, () => 0);
  const selected = race.find((racer) => racer.id === 2);
  assert.deepEqual(remainingNames(names, [selected]), ['Hà', 'Nguyễn Bình']);
  assert.deepEqual(names, ['Hà', 'Nguyễn Bình', 'Hà']);
});

test('invalid lists and selection counts cannot silently start a different race', () => {
  const settings = { duration: 30, count: 1, mode: 'first' };
  const names = Array.from({ length: 200 }, (_, index) => `Người ${index + 1}`);
  assert.equal(validateSetup(names, settings), '');
  assert.match(validateSetup([...names, 'Tên thừa'], settings), /tối đa 200/);
  assert.match(validateSetup([], settings), /ít nhất một tên/);
  for (const count of [0, 1.5, 201, NaN]) {
    assert.match(validateSetup(names, { ...settings, count }), /Số người chọn/);
  }
  assert.match(validateSetup(['🦆'.repeat(81)], settings), /80 ký tự/);
  assert.equal(validateSetup(['🦆'.repeat(80)], settings), '');
  assert.throws(() => createRace([], 30), RangeError);
});

test('English validation and import errors retain the exact limits without changing Vietnamese defaults', async () => {
  const settings = { duration: 30, count: 1, mode: 'first' };
  assert.equal(validateSetup([], settings, 'en'), 'Add at least one name to start the race.');
  assert.match(validateSetup(Array(201).fill('An'), settings, 'en'), /201 names.*200 or fewer/);
  assert.match(validateSetup(['An'], { ...settings, count: 2 }, 'en'), /integer from 1 to 1/);
  assert.match(validateSetup([], settings), /ít nhất một tên/);
  await assert.rejects(readNamesFile(new File(['An\n'.repeat(201)], 'names.txt')), (error) => {
    assert.ok(error instanceof RangeError);
    assert.match(error.message, /tối đa 200/);
    assert.match(error.englishMessage, /201 names.*200 or fewer/);
    return true;
  });
  await assert.rejects(readNamesFile(new File([new Uint8Array([0xff])], 'invalid.txt')), (error) => {
    assert.match(error.englishMessage, /UTF-8/);
    assert.ok(error.cause instanceof TypeError);
    return true;
  });
});

test('TXT imports decode UTF-8 and BOMs, retain duplicate names and reject invalid complete files', async () => {
  const file = new File(['\uFEFF An \r\n\r\nNguyễn Bình\rHà\nHà\n'], 'lop-4a.TXT');
  assert.deepEqual(await readNamesFile(file), ['An', 'Nguyễn Bình', 'Hà', 'Hà']);
  const cases = [
    [new File(['An'], 'names.csv'), /đuôi .txt/],
    [new File([' \n\r\n'], 'empty.txt'), /ít nhất một tên/],
    [new File([new Uint8Array([0xff, 0xfe, 0x61])], 'encoding.txt'), /UTF-8/],
    [new File(['An\0Bình'], 'binary.txt'), /không phải văn bản/],
    [new File(['An\n'.repeat(201)], 'too-many.txt'), /tối đa 200/],
    [new File(['x'.repeat(81)], 'long-name.txt'), /80 ký tự/]
  ];
  for (const [invalidFile, message] of cases) await assert.rejects(readNamesFile(invalidFile), message);
});

test('TXT byte-size and participant limits accept the exact boundary without dropping names', async () => {
  const bytes = new Uint8Array(1024 * 1024).fill(32);
  bytes.set(new TextEncoder().encode('An'));
  assert.deepEqual(await readNamesFile(new File([bytes], 'boundary.txt')), ['An']);
  await assert.rejects(readNamesFile(new File([bytes, ' '], 'oversize.txt')), /1 MB/);
  const names = Array.from({ length: 200 }, (_, index) => `Bạn ${index + 1}`);
  assert.deepEqual(await readNamesFile(new File([names.join('\n')], '200.txt')), names);
});

test('every duck progresses monotonically and crosses only at its ranked finish time', () => {
  const names = ['An', 'Bình', 'Chi', 'Dũng'];
  let seed = 12;
  const race = createRace(names, 15, (limit) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % limit;
  });
  assert.deepEqual([...race].sort((a, b) => a.id - b.id).map((racer) => racer.name), names);
  for (const racer of race) {
    let previous = 0;
    for (let elapsed = 0; elapsed < racer.finishAt; elapsed += 50) {
      const progress = progressAt(racer, elapsed);
      assert.ok(progress >= previous && progress < 1);
      previous = progress;
    }
    assert.equal(progressAt(racer, -100), 0);
    assert.equal(progressAt(racer, racer.finishAt), 1);
    assert.equal(progressAt(racer, 20000), 1);
  }
  assert.ok(race.every((racer, index) => index === 0 || racer.finishAt > race[index - 1].finishAt));
  assert.equal(race.at(-1).finishAt, 15000);
});

test('first and last selections use the same actual finish order, including a single racer', () => {
  const race = createRace(['An', 'Bình', 'Chi', 'Dũng'], 30, (limit) => limit - 1);
  assert.deepEqual(selectRacers(race, 'first', 2).map((racer) => racer.name), ['An', 'Bình']);
  assert.deepEqual(selectRacers(race, 'last', 2).map((racer) => racer.name), ['Dũng', 'Chi']);
  assert.throws(() => selectRacers(race, 'last', 5), RangeError);
  const single = createRace(['Một người'], 60);
  assert.equal(single[0].finishAt, 60000);
  assert.deepEqual(selectRacers(single, 'last', 1), single);
});
