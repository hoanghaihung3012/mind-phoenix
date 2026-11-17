/**
 * Vua Tiếng Việt — Core Game Logic & Vietnamese Word Database
 * Pure Vanilla JavaScript (ES Module)
 */

export const GAME_MODES = {
  LEVELS: 'levels',
  SPEED: 'speed',
};

export const WORD_BANK = [
  // --- MỨC ĐỘ 1: TỪ GHÉP & TỪ LÁY QUEN THUỘC (Letter Scramble) ---
  {
    id: 1,
    type: 'letters',
    word: 'CHĂM CHỈ',
    meaning: {
      vi: 'Siêng năng, cần cù làm việc hoặc học tập đều đặn.',
      en: 'Hardworking, diligent, studious.',
    },
    category: 'Từ ghép / Láy',
    difficulty: 1,
  },
  {
    id: 2,
    type: 'letters',
    word: 'DŨNG CẢM',
    meaning: {
      vi: 'Có dũng khí, dám đương đầu với khó khăn nguy hiểm.',
      en: 'Brave, courageous, fearless.',
    },
    category: 'Từ ghép',
    difficulty: 1,
  },
  {
    id: 3,
    type: 'letters',
    word: 'TRUNG THỰC',
    meaning: {
      vi: 'Ngay thẳng, thật thà, không gian dối.',
      en: 'Honest, truthful, upright.',
    },
    category: 'Từ ghép',
    difficulty: 1,
  },
  {
    id: 4,
    type: 'letters',
    word: 'ĐOÀN KẾT',
    meaning: {
      vi: 'Gắn bó chặt chẽ, cùng hướng về một mục đích chung.',
      en: 'United, solidary, working together.',
    },
    category: 'Từ ghép',
    difficulty: 1,
  },
  {
    id: 5,
    type: 'letters',
    word: 'LUNG LINH',
    meaning: {
      vi: 'Ánh sáng lấp lánh phản chiếu chập chờn đẹp mắt.',
      en: 'Glittering, sparkling, shimmering.',
    },
    category: 'Từ láy',
    difficulty: 1,
  },
  {
    id: 6,
    type: 'letters',
    word: 'RỰC RỠ',
    meaning: {
      vi: 'Tươi sáng, nổi bật với màu sắc chói lọi.',
      en: 'Brilliant, radiant, magnificent.',
    },
    category: 'Từ láy',
    difficulty: 1,
  },
  {
    id: 7,
    type: 'letters',
    word: 'SÁNG TẠO',
    meaning: {
      vi: 'Tìm tòi, tạo ra những điều mới mẻ có giá trị.',
      en: 'Creative, innovative, inventive.',
    },
    category: 'Từ ghép',
    difficulty: 2,
  },
  {
    id: 8,
    type: 'letters',
    word: 'KHIÊM TỐN',
    meaning: {
      vi: 'Có ý thức đánh giá đúng mực bản thân, không tự cao.',
      en: 'Humble, modest, unassuming.',
    },
    category: 'Từ ghép',
    difficulty: 2,
  },
  {
    id: 9,
    type: 'letters',
    word: 'THÔNG THÁI',
    meaning: {
      vi: 'Hiểu biết sâu rộng, có trí tuệ sáng suốt.',
      en: 'Wise, knowledgeable, sage.',
    },
    category: 'Từ ghép',
    difficulty: 2,
  },
  {
    id: 10,
    type: 'letters',
    word: 'KIÊN TRÌ',
    meaning: {
      vi: 'Bền bỉ, vững vàng giữ vững ý chí đến cùng.',
      en: 'Persistent, perseverant, steadfast.',
    },
    category: 'Từ ghép',
    difficulty: 2,
  },
  {
    id: 11,
    type: 'letters',
    word: 'BÌNH MINH',
    meaning: {
      vi: 'Khoảng thời gian mặt trời mới mọc rạng đông.',
      en: 'Dawn, sunrise, daybreak.',
    },
    category: 'Từ ghép',
    difficulty: 2,
  },
  {
    id: 12,
    type: 'letters',
    word: 'HOÀNG HÔN',
    meaning: {
      vi: 'Khoảng thời gian mặt trời lặn cuối buổi chiều.',
      en: 'Dusk, sunset, twilight.',
    },
    category: 'Từ ghép',
    difficulty: 2,
  },

  // --- MỨC ĐỘ 3: TỪ PHỨC NÂNG CAO & TỪ HÁN VIỆT ---
  {
    id: 13,
    type: 'letters',
    word: 'TRƯỜNG TỒN',
    meaning: {
      vi: 'Tồn tại lâu dài, bền vững cùng với thời gian.',
      en: 'Eternal, everlasting, enduring.',
    },
    category: 'Từ Hán-Việt',
    difficulty: 3,
  },
  {
    id: 14,
    type: 'letters',
    word: 'VĂN HIẾN',
    meaning: {
      vi: 'Truyền thống văn hóa và tri thức lâu đời của dân tộc.',
      en: 'Ancient civilization, time-honored cultural heritage.',
    },
    category: 'Từ Hán-Việt',
    difficulty: 3,
  },
  {
    id: 15,
    type: 'letters',
    word: 'BẤT KHUẤT',
    meaning: {
      vi: 'Không chịu khuất phục, luôn giữ vững khí tiết.',
      en: 'Indomitable, unyielding, invincible.',
    },
    category: 'Từ Hán-Việt',
    difficulty: 3,
  },

  // --- MỨC ĐỘ 4 & 5: THÀNH NGỮ, TỤC NGỮ (Word/Syllable Scramble) ---
  {
    id: 16,
    type: 'words',
    word: 'UỐNG NƯỚC NHỚ NGUỒN',
    meaning: {
      vi: 'Bài học đạo lý nhắc nhở phải biết ơn cội nguồn, người đi trước.',
      en: 'When drinking water, remember the source (Gratitude to benefactors).',
    },
    category: 'Thành ngữ',
    difficulty: 4,
  },
  {
    id: 17,
    type: 'words',
    word: 'HỌC ĐI ĐÔI VỚI HÀNH',
    meaning: {
      vi: 'Học tập lý thuyết phải gắn liền với thực hành và trải nghiệm.',
      en: 'Learning must go hand-in-hand with practice.',
    },
    category: 'Tục ngữ',
    difficulty: 4,
  },
  {
    id: 18,
    type: 'words',
    word: 'CÓ CHÍ THÌ NÊN',
    meaning: {
      vi: 'Người có ý chí, nghị lực ắt sẽ gặt hái thành công.',
      en: 'Where there is a will, there is a way.',
    },
    category: 'Tục ngữ',
    difficulty: 4,
  },
  {
    id: 19,
    type: 'words',
    word: 'LÁ LÀNH ĐÙM LÁ RÁCH',
    meaning: {
      vi: 'Tinh thần tương thân tương ái, cưu mang giúp đỡ người khó khăn.',
      en: 'The good leaves protect the torn ones (Mutual support and compassion).',
    },
    category: 'Thành ngữ',
    difficulty: 4,
  },
  {
    id: 20,
    type: 'words',
    word: 'ĂN QUẢ NHỚ KẺ TRỒNG CÂY',
    meaning: {
      vi: 'Hưởng thụ thành quả phải biết ghi ơn người đã dày công vun đắp.',
      en: 'When eating fruit, remember the one who planted the tree.',
    },
    category: 'Tục ngữ',
    difficulty: 5,
  },
  {
    id: 21,
    type: 'words',
    word: 'NƯỚC CHẢY ĐÁ MÒN',
    meaning: {
      vi: 'Sự kiên trì, nhẫn nại bền bỉ theo thời gian sẽ làm nên kỳ tích.',
      en: 'Constant dripping wears away the stone (Patience conquers all).',
    },
    category: 'Thành ngữ',
    difficulty: 5,
  },
  {
    id: 22,
    type: 'words',
    word: 'ĐỒNG CAM CỘNG KHỔ',
    meaning: {
      vi: 'Cùng nhau chia sẻ ngọt bùi và gánh vác hoạn nạn gian khó.',
      en: 'Sharing joys and sorrows together through thick and thin.',
    },
    category: 'Thành ngữ',
    difficulty: 5,
  },
  {
    id: 23,
    type: 'words',
    word: 'CÔNG THÀNH DANH TOẠI',
    meaning: {
      vi: 'Sự nghiệp vẻ vang thành đạt, danh tiếng được người đời khen ngợi.',
      en: 'Achieving great success and renowned distinction.',
    },
    category: 'Thành ngữ',
    difficulty: 5,
  },
  {
    id: 24,
    type: 'words',
    word: 'GẦN MỰC THÌ ĐEN GẦN ĐÈN THÌ RẠNG',
    meaning: {
      vi: 'Môi trường sống và bạn bè ảnh hưởng sâu sắc đến sự trưởng thành.',
      en: 'Near ink one gets soiled, near light one shines (Surround yourself with virtue).',
    },
    category: 'Tục ngữ',
    difficulty: 5,
  },
  {
    id: 25,
    type: 'words',
    word: 'TÔN SƯ TRỌNG ĐẠO',
    meaning: {
      vi: 'Tôn kính người thầy và coi trọng đạo lý, tri thức học hỏi được.',
      en: 'Respecting teachers and cherishing morality.',
    },
    category: 'Thành ngữ',
    difficulty: 4,
  },
];

export const LEVELS = [
  {
    level: 1,
    title: { vi: 'Ải 1: Nhập Môn — Chữ Vàng', en: 'Level 1: Novice — Golden Letters' },
    targetCount: 3,
    difficulties: [1],
    type: 'letters',
    timePerWord: 45,
  },
  {
    level: 2,
    title: { vi: 'Ải 2: Tập Sự — Ghép Chữ Nhanh', en: 'Level 2: Apprentice — Swift Spelling' },
    targetCount: 3,
    difficulties: [1, 2],
    type: 'letters',
    timePerWord: 40,
  },
  {
    level: 3,
    title: { vi: 'Ải 3: Thông Thái — Phản Xạ Từ', en: 'Level 3: Scholar — Word Reflex' },
    targetCount: 4,
    difficulties: [2, 3],
    type: 'letters',
    timePerWord: 35,
  },
  {
    level: 4,
    title: { vi: 'Ải 4: Trạng Nguyên — Thành Ngữ Hay', en: 'Level 4: Laureate — Wise Idioms' },
    targetCount: 3,
    difficulties: [4],
    type: 'words',
    timePerWord: 40,
  },
  {
    level: 5,
    title: { vi: 'Ải 5: Vua Tiếng Việt — Tinh Hoa Ngôn Từ', en: 'Level 5: Word Master — Crown of Wisdom' },
    targetCount: 4,
    difficulties: [4, 5],
    type: 'all',
    timePerWord: 35,
  },
];

/**
 * Normalizes Vietnamese string for comparison (uppercase, trimmed, normalized spaces).
 */
export function normalizeVietnamese(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Splits a phrase into letter tokens (ignoring spaces for tile creation).
 */
export function splitIntoLetters(phrase) {
  if (!phrase) return [];
  // Keep uppercase letters, exclude spaces
  return Array.from(phrase.toUpperCase().replace(/\s+/g, ''));
}

/**
 * Splits a phrase into syllables/words (separated by spaces).
 */
export function splitIntoWords(phrase) {
  if (!phrase) return [];
  return phrase.trim().toUpperCase().split(/\s+/).filter(Boolean);
}

/**
 * Deterministic or random shuffle with guarantee of non-identity when length > 1.
 */
export function shuffleArray(arr, rng = Math.random) {
  if (!Array.isArray(arr) || arr.length <= 1) return [...(arr || [])];
  
  const original = [...arr];
  let result = [...arr];
  let attempts = 0;

  do {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    attempts++;
  } while (
    attempts < 20 &&
    result.every((val, idx) => val === original[idx])
  );

  return result;
}

/**
 * Creates scramble tokens for a given question.
 * Returns array of objects: { id, text, originalIndex }
 */
export function createScrambleTokens(item, rng = Math.random) {
  if (!item || !item.word) return [];

  const rawTokens = item.type === 'words'
    ? splitIntoWords(item.word)
    : splitIntoLetters(item.word);

  const tokensWithId = rawTokens.map((char, index) => ({
    id: `token-${index}-${char}`,
    text: char,
    originalIndex: index,
  }));

  const shuffled = shuffleArray(tokensWithId, rng);
  return shuffled;
}

/**
 * Validates the player's current sequence against the expected answer.
 */
export function checkAnswer(selectedTokens, item) {
  if (!item || !Array.isArray(selectedTokens)) return false;

  if (item.type === 'words') {
    const userPhrase = selectedTokens.map(t => t.text).join(' ');
    return normalizeVietnamese(userPhrase) === normalizeVietnamese(item.word);
  } else {
    const userString = selectedTokens.map(t => t.text).join('');
    const targetString = normalizeVietnamese(item.word).replace(/\s+/g, '');
    return userString === targetString;
  }
}

/**
 * Finds next hint token to pick for the user.
 */
export function getNextHintToken(availableTokens, selectedTokens, item) {
  if (!item || !item.word || !Array.isArray(availableTokens)) return null;

  const targetTokens = item.type === 'words'
    ? splitIntoWords(item.word)
    : splitIntoLetters(item.word);

  const nextIndex = selectedTokens ? selectedTokens.length : 0;
  if (nextIndex >= targetTokens.length) return null;

  const expectedText = targetTokens[nextIndex];
  return availableTokens.find(token => token.text === expectedText) || null;
}

/**
 * Calculates score for a solved question.
 */
export function calculateQuestionScore({ timeRemaining = 0, hintsUsed = 0, streak = 0, difficulty = 1 }) {
  const baseScore = difficulty * 100;
  const timeBonus = Math.max(0, Math.floor(timeRemaining * 5));
  const streakBonus = Math.min(150, streak * 25);
  const hintPenalty = hintsUsed * 30;

  return Math.max(20, baseScore + timeBonus + streakBonus - hintPenalty);
}

/**
 * Selects questions for a given level.
 */
export function getQuestionsForLevel(levelDef, pool = WORD_BANK, rng = Math.random) {
  if (!levelDef) return [];

  const filtered = pool.filter(item => {
    const matchesDiff = levelDef.difficulties.includes(item.difficulty);
    const matchesType = levelDef.type === 'all' || item.type === levelDef.type;
    return matchesDiff && matchesType;
  });

  const shuffled = shuffleArray(filtered, rng);
  return shuffled.slice(0, levelDef.targetCount);
}
