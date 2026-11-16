export const MAX_PARTICIPANTS = 200;
export const MAX_NAME_LENGTH = 80;

export function parseNames(text) {
  return text.split(/\r\n?|\n/).map((name) => name.trim()).filter(Boolean);
}

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

function fileError(message, englishMessage, options) {
  return Object.assign(new Error(message, options), { englishMessage });
}

export async function readNamesFile(file) {
  if (!file.name.toLowerCase().endsWith('.txt')) throw fileError('Vui lòng chọn file có đuôi .txt.', 'Please choose a .txt file.');
  if (file.size > 1024 * 1024) throw fileError('File quá lớn. Vui lòng chọn file .txt tối đa 1 MB.', 'The file is too large. Choose a .txt file up to 1 MB.');
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
  } catch (error) {
    throw fileError('Không thể đọc file UTF-8. Hãy lưu lại file .txt với mã hóa UTF-8 rồi nhập lại.', 'Could not read the UTF-8 file. Save it as UTF-8 text and import it again.', { cause: error });
  }
  if (text.includes('\0')) throw fileError('File chứa dữ liệu không phải văn bản. Vui lòng chọn danh sách .txt UTF-8.', 'The file contains non-text data. Choose a UTF-8 .txt list.');
  const names = parseNames(text);
  const error = validateSetup(names, { duration: 30, count: 1, mode: 'first' });
  if (error) throw Object.assign(new RangeError(error), { englishMessage: validateSetup(names, { duration: 30, count: 1, mode: 'first' }, 'en') });
  return names;
}

function randomInteger(upperBound) {
  const range = 0x100000000;
  const limit = range - (range % upperBound);
  const value = new Uint32Array(1);
  // Rejection sampling keeps every shuffle position equally likely.
  do { globalThis.crypto.getRandomValues(value); } while (value[0] >= limit);
  return value[0] % upperBound;
}

export function shuffle(items, nextInteger = randomInteger) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = nextInteger(index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
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

export function remainingNames(names, selected) {
  const ids = new Set(selected.map((racer) => racer.id));
  return names.filter((name, id) => !ids.has(id));
}
