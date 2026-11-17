/**
 * Word Pop — Core Game Logic & English Vocabulary Categories
 * Pure Vanilla JavaScript (ES Module)
 */

export const THEMES = [
  {
    id: 'animals',
    title: { vi: 'Thế Giới Động Vật', en: 'Animal Kingdom' },
    target: { vi: 'Bắn các bóng chứa con vật (Animals)', en: 'Pop all Animal balloons' },
    icon: '🦁',
    words: ['LION', 'TIGER', 'ELEPHANT', 'MONKEY', 'RABBIT', 'PENGUIN', 'DOLPHIN', 'GIRAFFE', 'ZEBRA', 'KANGAROO', 'BEAR', 'FOX'],
    distractors: ['APPLE', 'PENCIL', 'YELLOW', 'CLOUD', 'GUITAR', 'CHAIR', 'BREAD', 'RAIN', 'DESK', 'PIZZA'],
  },
  {
    id: 'food',
    title: { vi: 'Món Ăn & Trái Cây', en: 'Food & Delicious Fruits' },
    target: { vi: 'Bắn các bóng chứa đồ ăn / trái cây (Food & Fruits)', en: 'Pop all Food & Fruit balloons' },
    icon: '🍓',
    words: ['APPLE', 'BANANA', 'MANGO', 'ORANGE', 'PIZZA', 'BREAD', 'BURGER', 'CHEESE', 'WATERMELON', 'STRAWBERRY', 'NOODLES', 'MILK'],
    distractors: ['LION', 'PENCIL', 'PURPLE', 'TIGER', 'SUN', 'RULER', 'SHOES', 'TABLE', 'DRUM', 'CAR'],
  },
  {
    id: 'school',
    title: { vi: 'Trường Học & Đồ Dùng', en: 'School & Stationery' },
    target: { vi: 'Bắn các bóng chứa đồ dùng học tập (School Things)', en: 'Pop all School & Stationery balloons' },
    icon: '🎒',
    words: ['PENCIL', 'NOTEBOOK', 'RULER', 'ERASER', 'BACKPACK', 'SCISSORS', 'BOOK', 'DESK', 'BLACKBOARD', 'CRAYON', 'PEN', 'GLUE'],
    distractors: ['BURGER', 'MONKEY', 'GREEN', 'APPLE', 'RABBIT', 'MOON', 'PIZZA', 'CAKE', 'DOG', 'HORSE'],
  },
  {
    id: 'colors',
    title: { vi: 'Màu Sắc & Hình Khối', en: 'Colors & Colorful Shapes' },
    target: { vi: 'Bắn các bóng chứa màu sắc (Colors)', en: 'Pop all Color balloons' },
    icon: '🎨',
    words: ['RED', 'BLUE', 'YELLOW', 'GREEN', 'ORANGE', 'PURPLE', 'PINK', 'BROWN', 'BLACK', 'WHITE', 'GOLDEN', 'VIOLET'],
    distractors: ['BANANA', 'ELEPHANT', 'CHAIR', 'ERASER', 'TIGER', 'TREE', 'RIVER', 'BURGER', 'BREAD', 'FISH'],
  },
  {
    id: 'nature',
    title: { vi: 'Thiên Nhiên & Thời Tiết', en: 'Nature & Wonderful Weather' },
    target: { vi: 'Bắn các bóng chứa thiên nhiên & thời tiết (Nature & Weather)', en: 'Pop all Nature & Weather balloons' },
    icon: '🌈',
    words: ['SUNNY', 'RAINBOW', 'THUNDER', 'CLOUD', 'BREEZE', 'MOUNTAIN', 'RIVER', 'OCEAN', 'FOREST', 'WINDY', 'SNOW', 'STAR'],
    distractors: ['PENCIL', 'PIZZA', 'CHEESE', 'LION', 'DESK', 'RULER', 'BURGER', 'ERASER', 'ORANGE', 'NOTEBOOK'],
  },
];

export const BALLOON_COLORS = [
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
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
 * Generates a batch of balloons for a given theme round.
 * Contains both correct words and distractors.
 */
export function generateRoundBalloons(theme, count = 12, rng = Math.random) {
  if (!theme) return [];

  const correctCount = Math.floor(count * 0.6); // ~7 correct, 5 distractors
  const distractorCount = count - correctCount;

  const shuffledCorrect = shuffle(theme.words, rng).slice(0, correctCount);
  const shuffledDistractors = shuffle(theme.distractors, rng).slice(0, distractorCount);

  const pool = [
    ...shuffledCorrect.map((word, i) => ({
      id: `correct-${i}-${word}`,
      word,
      isCorrect: true,
      color: BALLOON_COLORS[Math.floor(rng() * BALLOON_COLORS.length)],
    })),
    ...shuffledDistractors.map((word, i) => ({
      id: `distractor-${i}-${word}`,
      word,
      isCorrect: false,
      color: BALLOON_COLORS[Math.floor(rng() * BALLOON_COLORS.length)],
    })),
  ];

  return shuffle(pool, rng);
}

/**
 * Calculates score for popping a balloon.
 */
export function calculatePopScore({ isCorrect, streak = 0 }) {
  if (isCorrect) {
    const base = 50;
    const streakBonus = Math.min(100, streak * 10);
    return { earned: base + streakBonus, isCorrect: true };
  } else {
    return { earned: -25, isCorrect: false };
  }
}

/**
 * Checks if a player has cleared the round targets.
 */
export function isRoundCleared(remainingCorrect) {
  return remainingCorrect <= 0;
}
