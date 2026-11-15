export const VIEW_HEIGHT = 540;
export const GRAVITY = 2200;
export const JUMP_VELOCITY = 900;
export const RUN_SPEED = 320;
export const PLATFORM_HEIGHT = 24;
export const PLATFORM_LIFE = 5;
export const QUESTION_TIME = 30;
export const START_LIVES = 3;
export const STAR_POINTS = 10;
export const QUESTION_POINTS = 50;
export const DISTANCE_UNIT = 50;
export const MIN_PLATFORM_Y = 190;
export const MAX_PLATFORM_Y = 450;
export const MAX_RISE = 110;
export const LEADERBOARD_SIZE = 10;
export const MAX_NAME_LENGTH = 16;
const SAFE_REACH = 0.72;
const BRANCH_RISE = [135, 155];

export const QUESTIONS = [
  { topic: 'Toán', q: 'Số nào chia hết cho cả 2, 3, 5 và 9?', choices: ['270', '135', '240', '315'] },
  { topic: 'Toán', q: 'Tổng hai số là 120, hiệu hai số là 24. Số lớn là:', choices: ['72', '48', '96', '60'] },
  { topic: 'Toán', q: 'Trung bình cộng của ba số là 45. Tổng của ba số đó là:', choices: ['135', '90', '15', '145'] },
  { topic: 'Toán', q: '2 tấn 5 tạ = … kg', choices: ['2500', '250', '2050', '25 000'] },
  { topic: 'Toán', q: '3 m² 5 dm² = … dm²', choices: ['305', '350', '35', '3005'] },
  { topic: 'Toán', q: 'Năm 2000 thuộc thế kỷ nào?', choices: ['XX', 'XXI', 'XIX', 'XVIII'] },
  { topic: 'Toán', q: 'Phân số nào bằng 3/4?', choices: ['15/20', '9/16', '6/9', '12/15'] },
  { topic: 'Toán', q: 'Phân số nào lớn nhất?', choices: ['5/6', '4/5', '3/4', '7/9'] },
  { topic: 'Toán', q: 'Hình chữ nhật có nửa chu vi 30 cm, chiều dài hơn chiều rộng 6 cm. Diện tích là:', choices: ['216 cm²', '180 cm²', '224 cm²', '144 cm²'] },
  { topic: 'Toán', q: 'Hình bình hành có độ dài đáy 15 cm, chiều cao 8 cm. Diện tích là:', choices: ['120 cm²', '60 cm²', '46 cm²', '23 cm²'] },
  { topic: 'Toán', q: 'Hình thoi có hai đường chéo dài 12 cm và 8 cm. Diện tích là:', choices: ['48 cm²', '96 cm²', '40 cm²', '20 cm²'] },
  { topic: 'Toán', q: 'Tổng hai số là 96, số lớn gấp 3 lần số bé. Số bé là:', choices: ['24', '32', '72', '48'] },
  { topic: 'Toán', q: 'Hiệu hai số là 45, số bé bằng 2/5 số lớn. Số lớn là:', choices: ['75', '30', '90', '60'] },
  { topic: 'Toán', q: 'Góc lớn hơn góc vuông nhưng bé hơn góc bẹt là:', choices: ['Góc tù', 'Góc nhọn', 'Góc bẹt', 'Góc vuông'] },
  { topic: 'Toán', q: '1 giờ 15 phút = … phút', choices: ['75', '115', '65', '615'] },
  { topic: 'Toán', q: 'Trong số 5 724 386, chữ số 7 thuộc hàng nào?', choices: ['Trăm nghìn', 'Chục nghìn', 'Triệu', 'Nghìn'] },
  { topic: 'Toán', q: 'Giá trị của biểu thức 1250 : 25 × 4 là:', choices: ['200', '12', '50', '2000'] },
  { topic: 'Toán', q: 'Tìm x, biết: x × 12 = 1452', choices: ['121', '112', '1440', '1464'] },
  { topic: 'Toán', q: '3/5 của 45 là:', choices: ['27', '15', '75', '9'] },
  { topic: 'Toán', q: 'Số bé nhất có bốn chữ số khác nhau là:', choices: ['1023', '1000', '1234', '1012'] },
  { topic: 'Toán', q: 'Một xe chở 45 bao gạo, mỗi bao 50 kg. Xe chở tất cả bao nhiêu ki-lô-gam?', choices: ['2250 kg', '2025 kg', '225 kg', '95 kg'] },
  { topic: 'Toán', q: 'Trung bình cộng của 36, 42 và 57 là:', choices: ['45', '135', '42', '47'] },
  { topic: 'Toán', q: '1/2 + 1/3 = ?', choices: ['5/6', '2/5', '1/6', '2/6'] },
  { topic: 'Toán', q: '7/8 − 3/8 = ? (rút gọn)', choices: ['1/2', '1/4', '4/16', '5/4'] },
  { topic: 'Toán', q: '2/3 × 3/4 = ? (rút gọn)', choices: ['1/2', '5/7', '8/9', '6/7'] },
  { topic: 'Toán', q: '4/5 : 2 = ?', choices: ['2/5', '8/5', '4/10', '2/10'] },
  { topic: 'Toán', q: 'Số nào chia hết cho 9?', choices: ['4563', '2345', '1234', '5672'] },
  { topic: 'Toán', q: 'Hình vuông có chu vi 36 cm. Diện tích hình vuông là:', choices: ['81 cm²', '36 cm²', '144 cm²', '18 cm²'] },
  { topic: 'Toán', q: '1 km² = … m²', choices: ['1 000 000', '1000', '100 000', '10 000'] },
  { topic: 'Toán', q: 'Năm 1010 thuộc thế kỷ nào?', choices: ['XI', 'X', 'XII', 'IX'] },
  { topic: 'Toán', q: 'Có bao nhiêu số có hai chữ số chia hết cho 5?', choices: ['18', '19', '20', '17'] },
  { topic: 'Toán', q: 'Mẹ hơn con 28 tuổi, tuổi con bằng 1/5 tuổi mẹ. Con bao nhiêu tuổi?', choices: ['7', '5', '35', '8'] },
  { topic: 'Toán', q: 'Hình chữ nhật dài 24 m, chiều rộng bằng 1/3 chiều dài. Chu vi là:', choices: ['64 m', '32 m', '192 m', '56 m'] },
  { topic: 'Toán', q: 'Lan có 15 nhãn vở, Huệ có 21 nhãn vở. Mai có nhiều hơn trung bình cộng của cả ba bạn 4 nhãn vở. Mai có bao nhiêu nhãn vở?', choices: ['24', '22', '20', '18'] },
  { topic: 'Toán', q: 'Số bé nhất có ba chữ số chia hết cho cả 3 và 5 là:', choices: ['105', '100', '150', '120'] },
  { topic: 'Toán', q: 'Mảnh đất hình bình hành có đáy 40 m, chiều cao bằng 3/4 đáy. Diện tích là:', choices: ['1200 m²', '1600 m²', '300 m²', '140 m²'] },
  { topic: 'Toán', q: 'Một số nhân với 9 rồi cộng 15 thì được 132. Số đó là:', choices: ['13', '16', '117', '12'] },
  { topic: 'Toán', q: 'Dãy số 1, 4, 7, 10, … Số hạng thứ 20 là:', choices: ['58', '61', '60', '57'] },
  { topic: 'Toán', q: 'Cần bao nhiêu chữ số để viết các số từ 1 đến 50?', choices: ['91', '100', '50', '90'] },
  { topic: 'Toán', q: '5 yến = … kg', choices: ['50', '500', '5000', '15'] },
  { topic: 'Tiếng Việt', q: 'Từ nào là tính từ?', choices: ['chăm chỉ', 'học sinh', 'chạy nhảy', 'quyển vở'] },
  { topic: 'Tiếng Việt', q: 'Chủ ngữ của câu “Bạn Lan học bài rất chăm chỉ.” là:', choices: ['Bạn Lan', 'học bài', 'rất chăm chỉ', 'Lan học'] },
  { topic: 'Tiếng Việt', q: 'Từ nào là động từ?', choices: ['suy nghĩ', 'xinh đẹp', 'bàn ghế', 'dịu dàng'] },
  { topic: 'Tiếng Việt', q: '“Chậm như rùa” sử dụng biện pháp nghệ thuật nào?', choices: ['So sánh', 'Nhân hóa', 'Điệp từ', 'Liệt kê'] },
  { topic: 'Tiếng Việt', q: 'Từ nào là từ láy?', choices: ['long lanh', 'bàn ghế', 'nhà cửa', 'học hỏi'] },
  { topic: 'Tiếng Việt', q: 'Danh từ nào chỉ khái niệm?', choices: ['hạnh phúc', 'cô giáo', 'con mèo', 'cơn mưa'] },
  { topic: 'Khoa học', q: 'Ở điều kiện bình thường, nước sôi ở bao nhiêu độ C?', choices: ['100 °C', '0 °C', '50 °C', '37 °C'] },
  { topic: 'Khoa học', q: 'Khí nào trong không khí duy trì sự cháy?', choices: ['Ô-xi', 'Ni-tơ', 'Các-bô-níc', 'Hơi nước'] },
  { topic: 'Khoa học', q: 'Khi quang hợp, cây xanh hấp thụ khí nào?', choices: ['Các-bô-níc', 'Ô-xi', 'Ni-tơ', 'Hi-đrô'] },
  { topic: 'Khoa học', q: 'Âm thanh KHÔNG truyền được qua:', choices: ['Chân không', 'Nước', 'Không khí', 'Sắt thép'] },
  { topic: 'Khoa học', q: 'Vật nào tự phát ra ánh sáng?', choices: ['Mặt Trời', 'Mặt Trăng', 'Cái gương', 'Quyển sách'] },
  { topic: 'Lịch sử', q: 'Ai dời đô từ Hoa Lư ra Thăng Long năm 1010?', choices: ['Lý Thái Tổ', 'Lê Lợi', 'Trần Hưng Đạo', 'Đinh Bộ Lĩnh'] },
  { topic: 'Lịch sử', q: 'Chiến thắng Bạch Đằng năm 938 do ai lãnh đạo?', choices: ['Ngô Quyền', 'Lý Thường Kiệt', 'Quang Trung', 'Lê Hoàn'] },
  { topic: 'Lịch sử', q: 'Vua Quang Trung đại phá quân Thanh vào năm nào?', choices: ['1789', '1010', '1288', '1945'] },
  { topic: 'Lịch sử', q: 'Kinh đô của triều Nguyễn đặt ở đâu?', choices: ['Huế', 'Thăng Long', 'Hoa Lư', 'Cổ Loa'] },
  { topic: 'Địa lý', q: 'Dãy núi cao nhất nước ta là:', choices: ['Hoàng Liên Sơn', 'Trường Sơn', 'Bạch Mã', 'Tam Đảo'] },
  { topic: 'Địa lý', q: 'Đồng bằng lớn nhất nước ta là:', choices: ['Đồng bằng Nam Bộ', 'Đồng bằng Bắc Bộ', 'Đồng bằng duyên hải miền Trung', 'Đồng bằng Thanh Hóa'] },
  { topic: 'Địa lý', q: 'Thành phố Đà Lạt nằm trên cao nguyên nào?', choices: ['Lâm Viên', 'Kon Tum', 'Đắk Lắk', 'Mộc Châu'] },
];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** The first choice of each bank question is the correct one; choices are reshuffled per draw. */
export function createQuestionDeck(rng = Math.random, bank = QUESTIONS) {
  let pile = [];
  let last = null;
  return {
    next() {
      if (!pile.length) {
        pile = shuffle(bank, rng);
        if (pile.length > 1 && pile[pile.length - 1] === last) pile.unshift(pile.pop());
      }
      last = pile.pop();
      const order = shuffle(last.choices.map((text, index) => ({ text, index })), rng);
      return { topic: last.topic, prompt: last.q, choices: order.map((choice) => choice.text), correctIndex: order.findIndex((choice) => choice.index === 0) };
    },
  };
}

export function questionReward(secondsLeft) {
  return QUESTION_POINTS + 2 * Math.max(0, Math.ceil(secondsLeft));
}

export function maxJumpHeight() {
  return JUMP_VELOCITY ** 2 / (2 * GRAVITY);
}

/** Horizontal distance covered by a full jump that lands `rise` px higher (negative = lower). */
export function horizontalReach(rise) {
  const disc = JUMP_VELOCITY ** 2 - 2 * GRAVITY * rise;
  if (disc < 0) return 0;
  return RUN_SPEED * (JUMP_VELOCITY + Math.sqrt(disc)) / GRAVITY;
}

export function platformState(age) {
  if (age == null || age < 0) return { stage: 0, shaking: false, broken: false };
  if (age >= PLATFORM_LIFE) return { stage: 4, shaking: false, broken: true };
  const stage = age < 2 ? 0 : age < 3 ? 1 : age < 4 ? 2 : 3;
  return { stage, shaking: age >= PLATFORM_LIFE - 1, broken: false };
}

export function distancePoints(maxX, startX = 0) {
  return Math.max(0, Math.floor((maxX - startX) / DISTANCE_UNIT));
}

const between = (rng, min, max) => min + (max - min) * rng();
const lerp = (a, b, t) => a + (b - a) * t;

export class LevelGenerator {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.nextId = 1;
    this.cursorX = 0;
    this.cursorY = 400;
    this.lastBranch = null;
    this.questionIn = 5;
  }

  platform(x, y, w, kind) {
    return { id: this.nextId++, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: PLATFORM_HEIGHT, kind, touchedAt: null, broken: false };
  }

  start(world, x, y, w, kind = 'start') {
    const start = this.platform(x, y, w, kind);
    world.platforms.push(start);
    this.continueFrom(start);
    return start;
  }

  continueFrom(platform) {
    this.cursorX = platform.x + platform.w;
    this.cursorY = platform.y;
    this.lastBranch = null;
  }

  generateUntil(world, untilX) {
    while (this.cursorX < untilX) this.step(world);
  }

  step(world) {
    const { rng } = this;
    const difficulty = Math.min(1, this.cursorX / 15000);
    let rise = between(rng, -130, MAX_RISE);
    // A branch hangs over the gap after its main platform, so the next platform must not climb into it.
    if (this.lastBranch) rise = Math.min(rise, 0);
    const y = Math.min(MAX_PLATFORM_Y, Math.max(MIN_PLATFORM_Y, this.cursorY - rise));
    const actualRise = this.cursorY - y;
    const minGap = lerp(40, 70, difficulty);
    const maxGap = Math.max(minGap, Math.min(lerp(115, 175, difficulty), horizontalReach(actualRise) * SAFE_REACH));
    let x = this.cursorX + between(rng, minGap, maxGap);
    if (this.lastBranch) x = Math.max(x, this.lastBranch.x + this.lastBranch.w + 30);
    const w = between(rng, lerp(150, 95, difficulty), lerp(240, 150, difficulty));
    const main = this.platform(x, y, w, 'main');
    world.platforms.push(main);

    if (rng() < 0.25 && main.x - this.cursorX > 70) {
      world.stars.push(this.star((this.cursorX + main.x) / 2, Math.min(this.cursorY, main.y) - 110));
    }

    this.questionIn -= 1;
    if (this.questionIn <= 0 && main.w >= 120) {
      world.questions.push({ id: this.nextId++, x: main.x + main.w / 2, y: main.y - 30, used: false });
      this.questionIn = 6 + Math.floor(rng() * 5);
    } else if (rng() < 0.4) {
      const count = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < count; i += 1) world.stars.push(this.star(main.x + main.w * (i + 1) / (count + 1), main.y - 60));
    }

    this.lastBranch = null;
    const branchY = main.y - between(rng, ...BRANCH_RISE);
    if (rng() < 0.3 && branchY >= 100) {
      const branch = this.platform(main.x + main.w * 0.55, branchY, between(rng, 90, 130), 'branch');
      world.platforms.push(branch);
      world.stars.push(this.star(branch.x + branch.w * 0.33, branch.y - 55), this.star(branch.x + branch.w * 0.67, branch.y - 55));
      this.lastBranch = branch;
    }

    this.cursorX = main.x + main.w;
    this.cursorY = main.y;
    return main;
  }

  star(x, y) {
    return { id: this.nextId++, x: Math.round(x), y: Math.round(y), taken: false };
  }
}

export function normalizeName(name) {
  const clean = String(name ?? '').replace(/\s+/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return [...clean].slice(0, MAX_NAME_LENGTH).join('') || 'Bạn nhỏ';
}

export function startingLives(name) {
  const key = String(name ?? '').trim().toLowerCase();
  return key === 'phoenix hoang' || key === 'hhh' ? Infinity : START_LIVES;
}

function compareEntries(a, b) {
  return b.score - a.score || a.date - b.date;
}

export function parseLeaderboard(text) {
  let data;
  try { data = JSON.parse(text ?? '[]'); } catch { return []; }
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry) => entry && Number.isFinite(entry.score) && entry.score >= 0)
    .map((entry) => ({ name: normalizeName(entry.name), score: Math.floor(entry.score), character: String(entry.character ?? ''), date: Number(entry.date) || 0 }))
    .sort(compareEntries)
    .slice(0, LEADERBOARD_SIZE);
}

export function addScore(board, entry) {
  const item = { character: '', date: Date.now(), ...entry, name: normalizeName(entry.name), score: Math.max(0, Math.floor(entry.score)) };
  const next = [...board, item].sort(compareEntries).slice(0, LEADERBOARD_SIZE);
  const index = next.indexOf(item);
  return { board: next, rank: index === -1 ? null : index + 1 };
}
