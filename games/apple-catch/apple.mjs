import { createQuestionDeck as createDeck } from '../../shared/core/game-utils.mjs';

export { addScore, mulberry32, normalizeName, parseLeaderboard } from '../../shared/core/game-utils.mjs';

export const VIEW_HEIGHT = 540;
export const GROUND_Y = 510;
export const BASKET_W = 92;
export const BASKET_RIM = 44;
export const MOVE_SPEED = 560;
export const WORM_PENALTY = 20;
export const HARD_CHANCE = 0.2;

export const ITEMS = {
  apple: { name: 'Táo đỏ', points: 10 },
  greenApple: { name: 'Táo xanh', points: 10 },
  pear: { name: 'Lê', points: 15 },
  orange: { name: 'Cam', points: 15 },
  banana: { name: 'Chuối', points: 15 },
  grapes: { name: 'Nho', points: 20 },
  strawberry: { name: 'Dâu tây', points: 20 },
  cherry: { name: 'Anh đào', points: 25 },
  watermelon: { name: 'Dưa hấu', points: 30 },
  goldenApple: { name: 'Táo vàng', points: 50 },
  worm: { name: 'Sâu', points: -WORM_PENALTY },
  question: { name: 'Câu hỏi', points: 0 },
};

const FRUIT_WEIGHTS = { apple: 30, greenApple: 14, pear: 8, orange: 8, banana: 7, grapes: 6, strawberry: 6, cherry: 4, watermelon: 3, goldenApple: 1.5 };

export const LEVELS = [
  { id: 1, name: 'Vườn táo buổi sáng', scene: 'morning', music: 'orchard', target: 250, time: 70, speed: [150, 215], spawnEvery: 0.85, worm: 0.08, question: 0.06 },
  { id: 2, name: 'Nông trại hoàng hôn', scene: 'sunset', music: 'sunset', target: 350, time: 70, speed: [200, 285], spawnEvery: 0.72, worm: 0.14, question: 0.07 },
  { id: 3, name: 'Rừng trăng đêm', scene: 'night', music: 'night', target: 450, time: 70, speed: [250, 350], spawnEvery: 0.6, worm: 0.2, question: 0.08 },
];

export const QUESTION_RULES = {
  medium: { label: 'Lớp 4', reward: 40, penalty: 20, time: 20 },
  hard: { label: 'Nâng cao', reward: 80, penalty: 20, time: 30 },
};

/** The first choice of each question is correct; choices are reshuffled per draw. */
export const MEDIUM_QUESTIONS = [
  { topic: 'Toán', q: 'Số “Bốn triệu không trăm linh năm nghìn” viết là:', choices: ['4 005 000', '4 050 000', '4 500 000', '400 500'] },
  { topic: 'Toán', q: 'Làm tròn số 3 748 đến hàng trăm được:', choices: ['3 700', '3 800', '3 750', '4 000'] },
  { topic: 'Toán', q: '2 345 + 4 678 = ?', choices: ['7 023', '6 913', '7 013', '6 023'] },
  { topic: 'Toán', q: '8 000 − 2 764 = ?', choices: ['5 236', '5 346', '6 236', '5 246'] },
  { topic: 'Toán', q: '125 × 8 = ?', choices: ['1 000', '1 025', '960', '1 100'] },
  { topic: 'Toán', q: '1 206 : 6 = ?', choices: ['201', '21', '210', '2 001'] },
  { topic: 'Toán', q: '45 × 11 = ?', choices: ['495', '445', '505', '450'] },
  { topic: 'Toán', q: 'Trung bình cộng của 24, 36 và 48 là:', choices: ['36', '108', '34', '38'] },
  { topic: 'Toán', q: '3 tạ = … kg', choices: ['300', '30', '3 000', '3'] },
  { topic: 'Toán', q: '2 yến 5 kg = … kg', choices: ['25', '205', '250', '52'] },
  { topic: 'Toán', q: '1 m² = … dm²', choices: ['100', '10', '1 000', '10 000'] },
  { topic: 'Toán', q: '3 phút 20 giây = … giây', choices: ['200', '320', '180', '230'] },
  { topic: 'Toán', q: 'Thế kỉ XXI bắt đầu từ năm nào?', choices: ['2001', '2000', '2100', '1901'] },
  { topic: 'Toán', q: 'Góc nào bé hơn góc vuông?', choices: ['Góc nhọn', 'Góc tù', 'Góc bẹt', 'Không có góc nào'] },
  { topic: 'Toán', q: 'Hình nào có 4 cạnh bằng nhau và hai cặp cạnh đối diện song song?', choices: ['Hình thoi', 'Hình thang', 'Hình chữ nhật', 'Hình tam giác'] },
  { topic: 'Toán', q: 'Phân số nào bằng 1/2?', choices: ['4/8', '2/3', '3/5', '5/8'] },
  { topic: 'Toán', q: '2/7 + 3/7 = ?', choices: ['5/7', '5/14', '6/7', '1/7'] },
  { topic: 'Toán', q: 'Rút gọn phân số 12/18 được phân số tối giản là:', choices: ['2/3', '3/2', '1/3', '4/9'] },
  { topic: 'Toán', q: 'Phân số nào bé hơn 1?', choices: ['5/6', '7/7', '9/8', '4/3'] },
  { topic: 'Toán', q: 'Số nào chia hết cho cả 2 và 5?', choices: ['350', '255', '122', '505'] },
  { topic: 'Toán', q: 'Chữ số 5 trong số 352 418 thuộc hàng nào?', choices: ['Chục nghìn', 'Nghìn', 'Trăm nghìn', 'Trăm'] },
  { topic: 'Toán', q: 'Một hộp có 12 cái bút. 9 hộp như thế có bao nhiêu cái bút?', choices: ['108', '96', '118', '21'] },
  { topic: 'Toán', q: 'Tổng hai số là 50, hiệu hai số là 10. Số bé là:', choices: ['20', '30', '40', '25'] },
  { topic: 'Toán', q: 'Hình chữ nhật dài 9 cm, rộng 6 cm. Diện tích là:', choices: ['54 cm²', '30 cm²', '15 cm²', '45 cm²'] },
  { topic: 'Toán', q: 'Hình vuông cạnh 7 cm có chu vi là:', choices: ['28 cm', '49 cm', '14 cm', '21 cm'] },
  { topic: 'Toán', q: 'Số lớn nhất trong các số 98 765; 98 756; 99 001; 97 999 là:', choices: ['99 001', '98 765', '98 756', '97 999'] },
  { topic: 'Tiếng Việt', q: 'Từ nào là danh từ?', choices: ['dòng sông', 'xanh biếc', 'chạy nhảy', 'vui vẻ'] },
  { topic: 'Tiếng Việt', q: 'Từ nào là động từ?', choices: ['nhảy dây', 'xinh xắn', 'bông hoa', 'mềm mại'] },
  { topic: 'Tiếng Việt', q: 'Từ nào là tính từ chỉ màu sắc?', choices: ['đỏ thắm', 'to lớn', 'thơm ngát', 'ngọt lịm'] },
  { topic: 'Tiếng Việt', q: 'Vị ngữ của câu “Đàn chim bay về tổ.” là:', choices: ['bay về tổ', 'Đàn chim', 'về tổ', 'Đàn chim bay'] },
  { topic: 'Tiếng Việt', q: 'Câu nào sử dụng biện pháp nhân hóa?', choices: ['Ông mặt trời thức dậy.', 'Trời nắng chang chang.', 'Hoa hồng màu đỏ.', 'Em đi học sớm.'] },
  { topic: 'Tiếng Việt', q: 'Trạng ngữ trong câu “Sáng nay, em đi học sớm.” là:', choices: ['Sáng nay', 'em', 'đi học', 'sớm'] },
  { topic: 'Khoa học', q: 'Nước tồn tại ở những thể nào?', choices: ['Rắn, lỏng, khí', 'Chỉ thể lỏng', 'Rắn và lỏng', 'Lỏng và khí'] },
  { topic: 'Khoa học', q: 'Ở điều kiện bình thường, nước đóng băng ở:', choices: ['0 °C', '100 °C', '10 °C', '37 °C'] },
  { topic: 'Khoa học', q: 'Vật nào cho ánh sáng truyền qua?', choices: ['Tấm kính trong', 'Tấm gỗ', 'Bức tường', 'Tấm sắt'] },
  { topic: 'Khoa học', q: 'Nhóm thức ăn nào giàu chất đạm?', choices: ['Thịt, cá, trứng', 'Gạo, ngô', 'Rau, quả', 'Dầu, mỡ'] },
  { topic: 'Khoa học', q: 'Vật nào dẫn nhiệt tốt?', choices: ['Thìa nhôm', 'Thìa nhựa', 'Đũa gỗ', 'Găng tay len'] },
  { topic: 'Khoa học', q: 'Nấm men thường được dùng để làm gì?', choices: ['Làm bánh mì', 'Làm muối ăn', 'Làm thủy tinh', 'Làm giấy'] },
  { topic: 'Lịch sử – Địa lí', q: 'Đỉnh núi cao nhất Việt Nam là:', choices: ['Phan-xi-păng', 'Ngọc Linh', 'Bà Đen', 'Tây Côn Lĩnh'] },
  { topic: 'Lịch sử – Địa lí', q: 'Đền Hùng nằm ở tỉnh nào?', choices: ['Phú Thọ', 'Ninh Bình', 'Thanh Hóa', 'Nghệ An'] },
  { topic: 'Lịch sử – Địa lí', q: 'Văn Miếu – Quốc Tử Giám ở đâu?', choices: ['Hà Nội', 'Huế', 'Hội An', 'Cần Thơ'] },
  { topic: 'Lịch sử – Địa lí', q: 'Không gian văn hóa Cồng chiêng là nét đặc sắc của vùng nào?', choices: ['Tây Nguyên', 'Đồng bằng Bắc Bộ', 'Nam Bộ', 'Duyên hải miền Trung'] },
  { topic: 'Lịch sử – Địa lí', q: 'Chợ nổi Cái Răng thuộc vùng nào?', choices: ['Nam Bộ', 'Tây Nguyên', 'Đồng bằng Bắc Bộ', 'Trung du miền núi Bắc Bộ'] },
  { topic: 'Lịch sử – Địa lí', q: 'Phố cổ Hội An thuộc vùng nào?', choices: ['Duyên hải miền Trung', 'Tây Nguyên', 'Nam Bộ', 'Trung du miền núi Bắc Bộ'] },
  { topic: 'Lịch sử – Địa lí', q: 'Đồng bằng Bắc Bộ do những sông nào bồi đắp?', choices: ['Sông Hồng và sông Thái Bình', 'Sông Tiền và sông Hậu', 'Sông Đồng Nai', 'Sông Hương'] },
];

export const HARD_QUESTIONS = [
  { topic: 'Toán', q: 'Tổng hai số là 84, số lớn gấp 3 lần số bé. Số lớn là:', choices: ['63', '21', '42', '28'] },
  { topic: 'Toán', q: 'Hiệu hai số là 36, số lớn gấp 4 lần số bé. Số bé là:', choices: ['12', '9', '48', '24'] },
  { topic: 'Toán', q: 'Trung bình cộng của hai số là 45, số thứ nhất là 38. Số thứ hai là:', choices: ['52', '7', '45', '83'] },
  { topic: 'Toán', q: 'Mẹ hơn con 30 tuổi. Sau 5 năm nữa, tuổi mẹ gấp 4 lần tuổi con. Tuổi con hiện nay là:', choices: ['5', '10', '15', '35'] },
  { topic: 'Toán', q: 'Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng 3?', choices: ['6', '5', '4', '3'] },
  { topic: 'Toán', q: 'Dãy số 2, 5, 8, 11, … Số hạng thứ 15 là:', choices: ['44', '47', '45', '41'] },
  { topic: 'Toán', q: 'Số tròn chục lớn nhất có ba chữ số khác nhau là:', choices: ['980', '990', '987', '900'] },
  { topic: 'Toán', q: 'Hình chữ nhật có chu vi 48 cm, chiều dài gấp đôi chiều rộng. Diện tích là:', choices: ['128 cm²', '96 cm²', '144 cm²', '64 cm²'] },
  { topic: 'Toán', q: 'Lớp 4A có 32 học sinh, số bạn nữ bằng 3/5 số bạn nam. Lớp có bao nhiêu bạn nữ?', choices: ['12', '20', '16', '18'] },
  { topic: 'Toán', q: '3/4 của một số là 27. Số đó là:', choices: ['36', '20', '81', '9'] },
  { topic: 'Toán', q: 'Tính nhanh: 25 × 36 × 4 = ?', choices: ['3 600', '900', '360', '36 000'] },
  { topic: 'Toán', q: 'Tính nhanh: 98 + 99 + 1 + 2 = ?', choices: ['200', '190', '199', '210'] },
  { topic: 'Toán', q: 'Để viết các số từ 1 đến 30 cần bao nhiêu chữ số?', choices: ['51', '30', '60', '50'] },
  { topic: 'Toán', q: '5 bạn gặp nhau, mỗi bạn bắt tay mỗi bạn còn lại đúng 1 lần. Có tất cả bao nhiêu cái bắt tay?', choices: ['10', '20', '25', '5'] },
  { topic: 'Tiếng Việt', q: 'Trạng ngữ trong câu “Mùa xuân, cây gạo gọi đến bao nhiêu là chim.” chỉ gì?', choices: ['Thời gian', 'Nơi chốn', 'Nguyên nhân', 'Mục đích'] },
  { topic: 'Tiếng Việt', q: 'Thành ngữ nào nói về lòng dũng cảm?', choices: ['Gan vàng dạ sắt', 'Uống nước nhớ nguồn', 'Lá lành đùm lá rách', 'Ăn quả nhớ kẻ trồng cây'] },
];

/** Mostly grade-4 medium questions, with an occasional advanced one. */
export function createQuestionDeck(rng = Math.random) {
  const medium = createDeck(rng, MEDIUM_QUESTIONS);
  const hard = createDeck(rng, HARD_QUESTIONS);
  return {
    next() {
      const level = rng() < HARD_CHANCE ? 'hard' : 'medium';
      return { ...(level === 'hard' ? hard : medium).next(), level, ...QUESTION_RULES[level] };
    },
  };
}

export function pickItemKind(level, rng = Math.random) {
  const roll = rng();
  if (roll < level.question) return 'question';
  if (roll < level.question + level.worm) return 'worm';
  const entries = Object.entries(FRUIT_WEIGHTS);
  let pick = rng() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [kind, weight] of entries) {
    pick -= weight;
    if (pick < 0) return kind;
  }
  return 'apple';
}

let nextId = 1;
export function spawnItem(level, width, rng = Math.random) {
  const kind = pickItemKind(level, rng);
  const [min, max] = level.speed;
  const speed = (min + (max - min) * rng()) * (kind === 'question' ? 0.75 : kind === 'goldenApple' ? 1.2 : 1);
  return {
    id: nextId++, kind, x: 40 + rng() * Math.max(0, width - 80), y: -40, prevY: -40, vy: speed,
    sway: kind === 'worm' || kind === 'question' ? 18 + rng() * 22 : 0, phase: rng() * Math.PI * 2, spin: (rng() - 0.5) * 3, angle: 0,
  };
}

/** An item is caught when its centre crosses the basket rim within the basket's opening this frame. */
export function isCaught(item, basketX, rimY = GROUND_Y - BASKET_RIM) {
  return item.prevY < rimY && item.y >= rimY && Math.abs(item.x - basketX) <= BASKET_W / 2 + 6;
}

export function levelResult(levelScore, timeLeft, level) {
  if (levelScore >= level.target) return 'cleared';
  return timeLeft <= 0 ? 'failed' : 'playing';
}

/** Penalties never push a level's score below zero. */
export function applyPoints(score, delta) {
  return Math.max(0, score + delta);
}
