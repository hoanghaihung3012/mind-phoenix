/**
 * Sentence Builder — Core Game Logic & English Sentence Structures
 * Pure Vanilla JavaScript (ES Module)
 */

export const SENTENCE_DECK = [
  {
    id: 1,
    sentence: 'I love sunny days.',
    translation: 'Tôi yêu những ngày nắng đẹp.',
    words: ['I', 'love', 'sunny', 'days.'],
    hint: 'Chủ ngữ "I" đứng đầu câu.',
  },
  {
    id: 2,
    sentence: 'The cat is sleeping.',
    translation: 'Chú mèo đang ngủ.',
    words: ['The', 'cat', 'is', 'sleeping.'],
    hint: 'Thì hiện tại tiếp diễn (is + V-ing).',
  },
  {
    id: 3,
    sentence: 'She drinks warm milk.',
    translation: 'Cô ấy uống sữa ấm.',
    words: ['She', 'drinks', 'warm', 'milk.'],
    hint: 'Chủ ngữ ngôi thứ ba số ít thêm "s".',
  },
  {
    id: 4,
    sentence: 'We play soccer together.',
    translation: 'Chúng tôi chơi bóng đá cùng nhau.',
    words: ['We', 'play', 'soccer', 'together.'],
    hint: 'Chúng tôi cùng chơi đá bóng.',
  },
  {
    id: 5,
    sentence: 'Do you like apples?',
    translation: 'Bạn có thích táo không?',
    words: ['Do', 'you', 'like', 'apples?'],
    hint: 'Câu hỏi Yes/No với trợ động từ "Do".',
  },
  {
    id: 6,
    sentence: 'The birds are singing.',
    translation: 'Những chú chim đang hót.',
    words: ['The', 'birds', 'are', 'singing.'],
    hint: 'Chủ ngữ số nhiều dùng "are".',
  },
  {
    id: 7,
    sentence: 'He can swim very fast.',
    translation: 'Cậu ấy có thể bơi rất nhanh.',
    words: ['He', 'can', 'swim', 'very', 'fast.'],
    hint: 'Động từ khuyết thiếu "can" + V nguyên mẫu.',
  },
  {
    id: 8,
    sentence: 'They go to school every day.',
    translation: 'Họ đến trường mỗi ngày.',
    words: ['They', 'go', 'to', 'school', 'every', 'day.'],
    hint: 'Thói quen hàng ngày.',
  },
  {
    id: 9,
    sentence: 'My brother has a red bicycle.',
    translation: 'Anh trai tôi có một chiếc xe đạp màu đỏ.',
    words: ['My', 'brother', 'has', 'a', 'red', 'bicycle.'],
    hint: 'Tính từ đứng trước danh từ.',
  },
  {
    id: 10,
    sentence: 'Where is your favorite book?',
    translation: 'Cuốn sách yêu thích của bạn ở đâu?',
    words: ['Where', 'is', 'your', 'favorite', 'book?'],
    hint: 'Từ để hỏi "Where" đứng đầu câu.',
  },
];

export function shuffle(arr, rng = Math.random) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates scrambled word tokens for a sentence.
 */
export function createSentenceTokens(sentenceItem, rng = Math.random) {
  if (!sentenceItem || !Array.isArray(sentenceItem.words)) return [];

  const tokens = sentenceItem.words.map((w, idx) => ({
    id: `token-${idx}-${w}`,
    text: w,
    originalIdx: idx,
  }));

  let shuffled = shuffle(tokens, rng);
  let attempts = 0;
  while (attempts < 10 && shuffled.map(t => t.text).join(' ') === sentenceItem.sentence) {
    shuffled = shuffle(tokens, rng);
    attempts++;
  }
  return shuffled;
}

/**
 * Validates player's word sequence.
 */
export function checkSentence(selectedTokens, targetSentence) {
  if (!Array.isArray(selectedTokens) || !targetSentence) return false;
  const assembled = selectedTokens.map(t => t.text).join(' ').trim();
  return assembled.toLowerCase() === targetSentence.trim().toLowerCase();
}
