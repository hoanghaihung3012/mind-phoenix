export const MAX_PARTICIPANTS = 200;
export const MAX_NAME_LENGTH = 80;

export const class46Names = [
  'Giàu',
  'Mỹ Hân',
  'Gia Hân',
  'Bích Hân',
  'Huy',
  'Hưng',
  'Khang',
  'Khoa',
  'Lâm',
  'Long',
  'Mẫn',
  'Gia Minh',
  'Quang Minh',
  'Tuyết My',
  'Gia My',
  'Ngọc',
  'Ni',
  'Nguyên',
  'Phát',
  'Thiên Phúc',
  'Huỳnh Thiên Phúc',
  'Phụng',
  'Thiên Phượng',
  'Quân',
  'San',
  'Thủy Tiên',
  'Toàn',
  'Trân',
  'Tứ'
];

export function parseNames(text) {
  return text.split(/\r\n?|\n/).map((name) => name.trim()).filter(Boolean);
}

export function fileError(message, englishMessage, options) {
  return Object.assign(new Error(message, options), { englishMessage });
}

export function randomInteger(upperBound) {
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

export function remainingNames(names, selected) {
  const ids = new Set(selected.map((racer) => racer.id));
  return names.filter((name, id) => !ids.has(id));
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
  if (!names.length) throw Object.assign(new RangeError('Thêm ít nhất một tên để bắt đầu cuộc đua.'), { englishMessage: 'Add at least one name to start the race.' });
  if (names.length > MAX_PARTICIPANTS) throw Object.assign(new RangeError(`Danh sách có ${names.length} tên. Vui lòng giảm xuống tối đa ${MAX_PARTICIPANTS}.`), { englishMessage: `The list has ${names.length} names. Please reduce it to ${MAX_PARTICIPANTS} or fewer.` });
  if (names.some((name) => [...name].length > MAX_NAME_LENGTH)) throw Object.assign(new RangeError(`Mỗi tên chỉ được dài tối đa ${MAX_NAME_LENGTH} ký tự.`), { englishMessage: `Each name must be ${MAX_NAME_LENGTH} characters or fewer.` });
  return names;
}
