/**
 * Memory Safari — Core Game Logic & English Word/Picture Pairs
 * Pure Vanilla JavaScript (ES Module)
 */

export const SAFARI_THEMES = [
  {
    id: 'animals',
    title: { vi: 'Thế Giới Safari', en: 'Safari Kingdom' },
    pairs: [
      { id: 'lion', word: 'Lion', icon: '🦁' },
      { id: 'elephant', word: 'Elephant', icon: '🐘' },
      { id: 'giraffe', word: 'Giraffe', icon: '🦒' },
      { id: 'monkey', word: 'Monkey', icon: '🐵' },
      { id: 'zebra', word: 'Zebra', icon: '🦓' },
      { id: 'penguin', word: 'Penguin', icon: '🐧' },
    ],
  },
  {
    id: 'food',
    title: { vi: 'Bữa Tiệc Ẩm Thực', en: 'Yummy Feast' },
    pairs: [
      { id: 'apple', word: 'Apple', icon: '🍎' },
      { id: 'pizza', word: 'Pizza', icon: '🍕' },
      { id: 'burger', word: 'Burger', icon: '🍔' },
      { id: 'banana', word: 'Banana', icon: '🍌' },
      { id: 'cheese', word: 'Cheese', icon: '🧀' },
      { id: 'cake', word: 'Cake', icon: '🎂' },
    ],
  },
  {
    id: 'school',
    title: { vi: 'Góc Học Tập', en: 'Classroom Wonder' },
    pairs: [
      { id: 'book', word: 'Book', icon: '📖' },
      { id: 'pencil', word: 'Pencil', icon: '✏️' },
      { id: 'backpack', word: 'Backpack', icon: '🎒' },
      { id: 'scissors', word: 'Scissors', icon: '✂️' },
      { id: 'ruler', word: 'Ruler', icon: '📏' },
      { id: 'palette', word: 'Palette', icon: '🎨' },
    ],
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
 * Creates 12 cards (6 pairs: 6 words, 6 icons) for a memory board.
 */
export function createMemoryBoard(theme, rng = Math.random) {
  if (!theme || !Array.isArray(theme.pairs)) return [];

  const cards = [];
  theme.pairs.forEach((pair, idx) => {
    // Card 1: Text
    cards.push({
      cardId: `word-${idx}-${pair.id}`,
      pairId: pair.id,
      type: 'word',
      content: pair.word,
    });
    // Card 2: Icon/Image
    cards.push({
      cardId: `icon-${idx}-${pair.id}`,
      pairId: pair.id,
      type: 'icon',
      content: pair.icon,
    });
  });

  return shuffle(cards, rng);
}

/**
 * Checks if two flipped cards form a match.
 */
export function isMatch(cardA, cardB) {
  if (!cardA || !cardB || cardA.cardId === cardB.cardId) return false;
  return cardA.pairId === cardB.pairId && cardA.type !== cardB.type;
}
