import {
  MAX_PARTICIPANTS,
  MAX_NAME_LENGTH,
  parseNames,
  readNamesFile,
  shuffle,
  remainingNames,
  randomInteger
} from '../../shared/core/participants.mjs';

export {
  MAX_PARTICIPANTS,
  MAX_NAME_LENGTH,
  parseNames,
  readNamesFile,
  shuffle,
  remainingNames
};

export function validateSetup(names, { duration, count, mode }, language = 'vi') {
  const t = (vi, en) => language === 'en' ? en : vi;
  if (!names.length) return t('Thêm ít nhất một tên để bắt đầu cuộc đua.', 'Add at least one name to start the race.');
  if (names.length > MAX_PARTICIPANTS) return t(`Danh sách có ${names.length} tên. Vui lòng giảm xuống tối đa ${MAX_PARTICIPANTS}.`, `The list has ${names.length} names. Please reduce it to ${MAX_PARTICIPANTS} or fewer.`);
  if (names.some((name) => [...name].length > MAX_NAME_LENGTH)) return t(`Mỗi tên chỉ được dài tối đa ${MAX_NAME_LENGTH} ký tự.`, `Each name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  if (![15, 30, 60].includes(duration)) return t('Chọn thời lượng 15, 30 hoặc 60 giây.', 'Choose 15, 30 or 60 seconds.');
  if (!Number.isInteger(count) || count < 1 || count > names.length) return t(`Số người chọn phải là số nguyên từ 1 đến ${names.length}.`, `The number to pick must be an integer from 1 to ${names.length}.`);
  if (!['first', 'last'].includes(mode)) return t('Chọn người về đầu hoặc về cuối.', 'Choose first or last finishers.');
  return '';
}

export function createRace(names, duration, nextInteger = randomInteger) {
  const error = validateSetup(names, { duration, count: 1, mode: 'first' });
  if (error) throw new RangeError(error);
  const order = shuffle(names.map((name, id) => ({ name, id })), nextInteger);
  return order.map((participant, index) => {
    const weights = Array.from({ length: 12 }, () => 350 + nextInteger(1000));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let distance = 0;
    const splits = [0, ...weights.map((weight) => {
      distance += weight;
      return distance / total;
    })];
    return {
      ...participant,
      rank: index + 1,
      finishAt: duration * 1000 * (names.length === 1 ? 1 : .88 + .12 * index / (names.length - 1)),
      splits
    };
  });
}

export function progressAt(racer, elapsed) {
  const time = Math.max(0, Math.min(1, elapsed / racer.finishAt));
  if (time === 1) return 1;
  const segment = time * (racer.splits.length - 1);
  const index = Math.floor(segment);
  return racer.splits[index] + (racer.splits[index + 1] - racer.splits[index]) * (segment - index);
}

export function selectRacers(racers, mode, count) {
  if (!['first', 'last'].includes(mode) || !Number.isInteger(count) || count < 1 || count > racers.length) {
    throw new RangeError('Lựa chọn kết quả không hợp lệ.');
  }
  return [...racers].sort((a, b) => mode === 'first' ? a.rank - b.rank : b.rank - a.rank).slice(0, count);
}
