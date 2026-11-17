/**
 * Nối Từ Siêu Tốc — Core Game Logic & Vietnamese Word Chain Dictionary
 * Pure Vanilla JavaScript (ES Module)
 */

export const WORD_PAIRS = [
  // Cụm bắt đầu từ HOA
  'HOA MAI', 'MAI SAU', 'SAU NÀY', 'NÀY NỌ', 'NỌ KIA',
  // Cụm bắt đầu từ HỌC
  'HỌC TẬP', 'TẬP LÀM', 'LÀM ĐẸP', 'ĐẸP ĐẼ', 'ĐẼ CỦI',
  'HỌC HÀNH', 'HÀNH ĐỘNG', 'ĐỘNG LỰC', 'LỰC LƯỢNG',
  // Cụm BÌNH MINH
  'BÌNH MINH', 'MINH BẠCH', 'BẠCH TUỘC',
  // Cụm MẶT TRỜI
  'MẶT TRỜI', 'TRỜI ĐẤT', 'ĐẤT NƯỚC', 'NƯỚC NON', 'NON SÔNG', 'SÔNG NÚI', 'NÚI RỪNG', 'RỪNG VÀNG', 'VÀNG BẠC', 'BẠC ĐẦU',
  // Cụm TƯƠNG LAI
  'TƯƠNG LAI', 'LAI TẠO', 'TẠO NÊN', 'NÊN THƠ', 'THƠ CA', 'CA HÁT', 'HÁT XƯỚNG',
  // Cụm SÁNG TẠO
  'SÁNG TẠO', 'TẠO HÓA', 'HÓA HỌC',
  // Cụm YÊU THƯƠNG
  'YÊU THƯƠNG', 'THƯƠNG MẾN', 'MẾN MỘ', 'MỘ PHẦN',
  // Cụm KIÊN TRÌ
  'KIÊN TRÌ', 'TRÌ TRỆ',
  // Cụm THÀNH CÔNG
  'THÀNH CÔNG', 'CÔNG TÂM', 'TÂM ĐỨC', 'ĐỨC ĐỘ', 'ĐỘ LƯỢNG',
  // Cụm ĐOÀN KẾT
  'ĐOÀN KẾT', 'KẾT BẠN', 'BẠN BÈ', 'BÈ PHÁI',
];

export function normalizeWord(word) {
  if (!word) return '';
  return word.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function getHeadSyllable(word) {
  const parts = normalizeWord(word).split(' ');
  return parts[0] || '';
}

export function getTailSyllable(word) {
  const parts = normalizeWord(word).split(' ');
  return parts[parts.length - 1] || '';
}

export function isValidChainStep(previousWord, nextWord) {
  if (!previousWord || !nextWord) return false;
  const tail = getTailSyllable(previousWord);
  const head = getHeadSyllable(nextWord);
  return tail === head && normalizeWord(previousWord) !== normalizeWord(nextWord);
}

/**
 * Finds all valid continuation words from dictionary.
 */
export function findContinuations(currentWord, pool = WORD_PAIRS) {
  const tail = getTailSyllable(currentWord);
  return pool.filter(w => getHeadSyllable(w) === tail && normalizeWord(w) !== normalizeWord(currentWord));
}

/**
 * Generates options for a round: 1-2 correct continuations and 2-3 distractors.
 */
export function generateStepOptions(currentWord, pool = WORD_PAIRS, rng = Math.random) {
  const valid = findContinuations(currentWord, pool);
  if (valid.length === 0) return [];

  const correctWord = valid[Math.floor(rng() * valid.length)];
  const distractors = pool.filter(w => getHeadSyllable(w) !== getTailSyllable(currentWord));

  // Pick 2 distractors
  const shuffledDist = [...distractors].sort(() => rng() - 0.5).slice(0, 2);

  const options = [
    { text: correctWord, isCorrect: true },
    ...shuffledDist.map(w => ({ text: w, isCorrect: false })),
  ];

  return options.sort(() => rng() - 0.5);
}
