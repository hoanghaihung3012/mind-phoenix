import { MAX_NAME_LENGTH, MAX_PARTICIPANTS, shuffle } from '../../games/duck-race/race.mjs';

export function validateNames(names) {
  if (!names.length) return 'Thêm ít nhất một tên hoặc số để quay.';
  if (names.length > MAX_PARTICIPANTS) return `Danh sách tối đa ${MAX_PARTICIPANTS} dòng.`;
  if (names.some((name) => [...name].length > MAX_NAME_LENGTH)) return `Mỗi dòng tối đa ${MAX_NAME_LENGTH} ký tự.`;
  return '';
}

export function numberRange(from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 99999 || to < from) {
    throw new RangeError('Nhập hai số nguyên từ 1 đến 99999, số cuối không nhỏ hơn số đầu.');
  }
  if (to - from + 1 > MAX_PARTICIPANTS) throw new RangeError(`Chỉ tạo tối đa ${MAX_PARTICIPANTS} số mỗi lần.`);
  return Array.from({ length: to - from + 1 }, (_, index) => String(from + index));
}

export function createSpin(names, rotation = 0, nextInteger) {
  const error = validateNames(names);
  if (error) throw new RangeError(error);
  if (!Number.isFinite(rotation) || rotation < 0) throw new RangeError('Góc quay không hợp lệ.');
  const entries = names.map((name, id) => ({ name, id }));
  const winner = shuffle(entries, nextInteger)[0];
  const landing = (360 - (winner.id + .5) * 360 / names.length) % 360;
  const current = rotation % 360;
  return { winner, rotation: rotation + 360 * 6 + (landing - current + 360) % 360 };
}
