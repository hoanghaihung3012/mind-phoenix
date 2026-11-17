/**
 * Soi Lỗi Chính Tả — Core Game Logic & Vietnamese Orthography Bank
 * Pure Vanilla JavaScript (ES Module)
 */

export const SPELLING_BANK = [
  // Nhóm S / X
  {
    id: 1,
    rule: 'Phân biệt S và X',
    sentence: 'Cô giáo khen bài văn của Lan đạt điểm ___',
    correct: 'xuất sắc',
    wrong: 'suất sắc',
    explanation: '"Xuất" có nghĩa là vượt trội, đưa ra ngoài. "Suất" chỉ một phần (suất cơm). Do đó phải là "xuất sắc".',
  },
  {
    id: 2,
    rule: 'Phân biệt S và X',
    sentence: 'Các bạn học sinh cùng nhau ___ lại bàn ghế trong lớp.',
    correct: 'sắp xếp',
    wrong: 'xắp xếp',
    explanation: '"Sắp" (sắp đặt, chuẩn bị) đi với "s". "Sắp xếp" là từ chính xác.',
  },
  {
    id: 3,
    rule: 'Phân biệt S và X',
    sentence: 'Mảnh vườn hoang vắng trông thật ___ sau cơn bão.',
    correct: 'xơ xác',
    wrong: 'sơ xác',
    explanation: '"Xơ xác" là từ láy âm "x" miêu tả sự tàn tạ, xơ rơ.',
  },
  {
    id: 4,
    rule: 'Phân biệt S và X',
    sentence: 'Mọi người trong phố cùng góp sức dọn dẹp ___ gọn gàng.',
    correct: 'sạch sẽ',
    wrong: 'xạch xẽ',
    explanation: '"Sạch sẽ" viết bằng âm "s", mang nghĩa không có bụi bẩn.',
  },

  // Nhóm TR / CH
  {
    id: 5,
    rule: 'Phân biệt TR và CH',
    sentence: 'Tôi xin gửi lời cảm ơn ___ nhất đến thầy cô.',
    correct: 'chân thành',
    wrong: 'trân thành',
    explanation: '"Chân" trong chân thật, chân tâm. Do đó phải là "chân thành" (chứ không phải "trân thành").',
  },
  {
    id: 6,
    rule: 'Phân biệt TR và CH',
    sentence: 'Người có đức tính ___ luôn được mọi người tin cậy.',
    correct: 'trung thực',
    wrong: 'chung thực',
    explanation: '"Trung" trong trung thành, trung chính. Viết đúng là "trung thực".',
  },
  {
    id: 7,
    rule: 'Phân biệt TR và CH',
    sentence: 'Bài tập làm văn của em được sửa chữa rất ___',
    correct: 'trau chuốt',
    wrong: 'chau chuốt',
    explanation: '"Trau chuốt" là từ chuẩn mang nghĩa gọt giũa tỉ mỉ, mài dũa cho đẹp.',
  },

  // Nhóm D / GI / R
  {
    id: 8,
    rule: 'Phân biệt D, GI và R',
    sentence: 'Hai đội kéo co đang ___ từng tấc đất trên sân.',
    correct: 'giành giật',
    wrong: 'dành dật',
    explanation: '"Giành" mang nghĩa tranh đoạt (giành lấy, tranh giành). "Dành" mang nghĩa cất giữ (để dành).',
  },
  {
    id: 9,
    rule: 'Phân biệt D, GI và R',
    sentence: 'Bé Lan biết tiết kiệm và ___ tiền mừng tuổi trong heo đất.',
    correct: 'dành dụm',
    wrong: 'giành giụm',
    explanation: '"Dành dụm" mang nghĩa gom góp, cất giữ để dành cho tương lai.',
  },
  {
    id: 10,
    rule: 'Phân biệt D, GI và R',
    sentence: 'Ánh nắng ban mai tỏa sáng ___ khắp sân trường.',
    correct: 'rực rỡ',
    wrong: 'dực dỡ',
    explanation: '"Rực rỡ" là từ láy âm "r", diễn tả sắc màu tươi sáng chói lọi.',
  },
  {
    id: 11,
    rule: 'Phân biệt D, GI và R',
    sentence: 'Hôm nay mẹ bảo tôi phụ trông ___ cho em bé tập bò.',
    correct: 'giữ gìn',
    wrong: 'dữ dìn',
    explanation: '"Giữ gìn" viết bằng âm "gi", mang nghĩa bảo quản, chăm sóc.',
  },

  // Nhóm Dấu Hỏi (?) và Dấu Ngã (~)
  {
    id: 12,
    rule: 'Dấu Hỏi & Dấu Ngã',
    sentence: 'Bác thợ đang chăm chỉ ___ lại mái nhà.',
    correct: 'sửa chữa',
    wrong: 'sửa chửa',
    explanation: '"Chữa" (chữa bệnh, sửa chữa) mang dấu ngã (~).',
  },
  {
    id: 13,
    rule: 'Dấu Hỏi & Dấu Ngã',
    sentence: 'Chú bé cất bước ___ về phía người mẹ đang đứng chờ.',
    correct: 'vội vã',
    wrong: 'vội vả',
    explanation: '"Vội vã" là từ láy dấu ngã (~), diễn tả sự gấp gáp.',
  },
  {
    id: 14,
    rule: 'Dấu Hỏi & Dấu Ngã',
    sentence: 'Ông cụ trầm ngâm ngồi ___ về chuyện xưa.',
    correct: 'nghĩ ngợi',
    wrong: 'nghỉ ngợi',
    explanation: '"Nghĩ" (suy nghĩ) mang dấu ngã (~). "Nghỉ" mang dấu hỏi mang nghĩa nghỉ ngơi.',
  },
  {
    id: 15,
    rule: 'Dấu Hỏi & Dấu Ngã',
    sentence: 'Từng giọt sương mai đọng ___ trên kẽ lá.',
    correct: 'long lanh',
    wrong: 'nong nanh',
    explanation: '"Long lanh" dùng âm "l", diễn tả ánh sáng phản chiếu trong trẻo.',
  },
  {
    id: 16,
    rule: 'Phân biệt L và N',
    sentence: 'Cậu bé luôn tỏ ra ___ trước mỗi kỳ thi quan trọng.',
    correct: 'lo lắng',
    wrong: 'no nắng',
    explanation: '"Lo lắng" dùng âm "l". "No" mang nghĩa no bụng, "nắng" mang nghĩa ánh nắng.',
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
 * Returns options for a question in randomized order.
 */
export function getQuestionOptions(item, rng = Math.random) {
  if (!item) return [];
  const options = [
    { text: item.correct, isCorrect: true },
    { text: item.wrong, isCorrect: false },
  ];
  return shuffle(options, rng);
}

/**
 * Calculates score for answering a spelling question.
 */
export function evaluateAnswer({ isCorrect, timeRemaining = 0, streak = 0 }) {
  if (isCorrect) {
    const base = 100;
    const timeBonus = Math.max(0, Math.floor(timeRemaining * 4));
    const streakBonus = Math.min(100, streak * 20);
    return { earned: base + timeBonus + streakBonus, isCorrect: true };
  } else {
    return { earned: -30, isCorrect: false };
  }
}
