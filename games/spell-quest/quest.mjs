/**
 * Spell Quest — Core Game Logic & English Spelling Puzzles
 * Pure Vanilla JavaScript (ES Module)
 */

export const SPELL_WORDS = [
  { id: 1, word: 'CAT', icon: '🐱', hint: { vi: 'Con mèo đáng yêu', en: 'A friendly feline pet' } },
  { id: 2, word: 'DOG', icon: '🐶', hint: { vi: 'Chú cún trung thành', en: 'Man’s best loyal friend' } },
  { id: 3, word: 'SUN', icon: '☀️', hint: { vi: 'Mặt trời tỏa nắng rực rỡ', en: 'Bright star in our solar system' } },
  { id: 4, word: 'FISH', icon: '🐟', hint: { vi: 'Con cá bơi lội dưới nước', en: 'Swims in oceans and rivers' } },
  { id: 5, word: 'BIRD', icon: '🐦', hint: { vi: 'Chú chim bay lượn trên trời', en: 'Feathered animal that flies' } },
  { id: 6, word: 'STAR', icon: '⭐', hint: { vi: 'Ngôi sao lấp lánh ban đêm', en: 'Twinkles in the night sky' } },
  { id: 7, word: 'BOOK', icon: '📖', hint: { vi: 'Cuốn sách chứa nhiều tri thức', en: 'Pages of knowledge to read' } },
  { id: 8, word: 'TREE', icon: '🌳', hint: { vi: 'Cây xanh tỏa bóng mát', en: 'Tall plant with trunk and leaves' } },
  { id: 9, word: 'APPLE', icon: '🍎', hint: { vi: 'Quả táo đỏ ngon lành', en: 'A sweet and crisp red fruit' } },
  { id: 10, word: 'TIGER', icon: '🐯', hint: { vi: 'Chúa sơn lâm dũng mãnh', en: 'Fierce striped big cat' } },
  { id: 11, word: 'ZEBRA', icon: '🦓', hint: { vi: 'Ngựa vằn sọc đen trắng', en: 'Black and white striped animal' } },
  { id: 12, word: 'PENCIL', icon: '✏️', hint: { vi: 'Bút chì để vẽ và viết', en: 'Writing and drawing instrument' } },
  { id: 13, word: 'BANANA', icon: '🍌', hint: { vi: 'Quả chuối vàng chín ngọt', en: 'Long curved yellow fruit' } },
  { id: 14, word: 'ROCKET', icon: '🚀', hint: { vi: 'Tên lửa bay vào vũ trụ', en: 'Spacecraft flying to outer space' } },
  { id: 15, word: 'DOLPHIN', icon: '🐬', hint: { vi: 'Cá heo thông minh thân thiện', en: 'Smart and playful marine mammal' } },
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
 * Creates scramble letter tiles for spelling a target word.
 */
export function createLetterTiles(word, rng = Math.random) {
  if (!word) return [];
  const upper = word.toUpperCase();
  const tokens = upper.split('').map((char, idx) => ({
    id: `letter-${idx}-${char}`,
    char,
    originalIdx: idx,
  }));

  // Shuffle until not identical to original word
  let shuffled = shuffle(tokens, rng);
  let attempts = 0;
  while (attempts < 10 && shuffled.map(t => t.char).join('') === upper) {
    shuffled = shuffle(tokens, rng);
    attempts++;
  }
  return shuffled;
}

/**
 * Validates player answer against expected word.
 */
export function checkSpelling(selectedTiles, word) {
  if (!Array.isArray(selectedTiles) || !word) return false;
  const current = selectedTiles.map(t => t.char).join('').toUpperCase();
  return current === word.toUpperCase();
}

/**
 * Suggests the next hint tile.
 */
export function getNextTileHint(availableTiles, selectedTiles, word) {
  if (!word || !Array.isArray(availableTiles)) return null;
  const nextIndex = selectedTiles.length;
  if (nextIndex >= word.length) return null;
  const targetChar = word[nextIndex].toUpperCase();
  return availableTiles.find(t => t.char === targetChar) || null;
}
