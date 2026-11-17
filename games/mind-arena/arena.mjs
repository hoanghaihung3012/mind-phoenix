/**
 * Mind Arena (Đấu Trường Trí Tuệ Mind Phoenix)
 * Core Game Engine: Topics, Lessons, Stages, Scoring, Streak, and Opponent Simulation.
 */

export const SUBJECTS = [
  {
    id: 'math',
    name: 'Đấu Trường Toán Học',
    nameEn: 'Math Arena',
    icon: '🧮',
    badge: 'Toán & Tư Duy',
    badgeEn: 'Math & Logic',
    color: '#0284c7',
    bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    description: 'Thần đồng tính nhẩm, hình học không gian và toán đố logic biến hóa.',
    descriptionEn: 'Mental calculation, spatial geometry and witty math riddles.',
    mascot: '../../assets/mascots/mindmath-sigma-happy.webp',
  },
  {
    id: 'vietnamese',
    name: 'Đấu Trường Tiếng Việt',
    nameEn: 'Vietnamese Arena',
    icon: '👑',
    badge: 'Tiếng Việt & Ngôn Ngữ',
    badgeEn: 'Language Arts',
    color: '#ea580c',
    bgGradient: 'linear-gradient(135deg, #ea580c, #c2410c)',
    description: 'Vua từ vựng, bắt lỗi chính tả, biện pháp tu từ và ca dao tục ngữ cha ông.',
    descriptionEn: 'Vocabulary king, spelling detective, rhetoric devices and folklore.',
    mascot: '../../assets/mascots/mind-phoenix-mascot.png',
  },
  {
    id: 'english',
    name: 'Đấu Trường Tiếng Anh',
    nameEn: 'English Arena',
    icon: '🌍',
    badge: 'Tiếng Anh Toàn Cầu',
    badgeEn: 'Global English',
    color: '#16a34a',
    bgGradient: 'linear-gradient(135deg, #16a34a, #15803d)',
    description: 'Từ vựng đa chủ đề, ngữ pháp tinh thông và câu đố tiếng Anh thế giới.',
    descriptionEn: 'Thematic vocabulary, essential grammar and global English riddles.',
    mascot: '../../assets/mascots/mindastro-lambda-happy.webp',
  },
  {
    id: 'all-round',
    name: 'Siêu Đấu Trường Toàn Năng',
    nameEn: 'Tri-Subject Grand Arena',
    icon: '🏆',
    badge: 'Toán · Văn · Anh',
    badgeEn: 'Math · Viet · Eng',
    color: '#7c3aed',
    bgGradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    description: 'Tranh cúp Vô Địch Mind Phoenix: Kết hợp 3 môn trong một trận chiến rực lửa!',
    descriptionEn: 'Mind Phoenix Championship: Conquer all 3 subjects in one epic clash!',
    mascot: '../../assets/mascots/minddev-cmd-happy.webp',
  },
];

export const STAGE_CONFIGS = [
  {
    stageIndex: 0,
    id: 'sprint',
    title: 'Chặng 1: Khởi Động',
    titleEn: 'Stage 1: Sprint Start',
    timePerQuestion: 15,
    basePoints: 10,
    maxBonus: 7,
    description: 'Phản xạ nhanh với các câu hỏi nền tảng (15s/câu)',
    descriptionEn: 'Fast reflexes on core fundamentals (15s/q)',
    icon: '⚡',
  },
  {
    stageIndex: 1,
    id: 'surge',
    title: 'Chặng 2: Tăng Tốc',
    titleEn: 'Stage 2: Speed Surge',
    timePerQuestion: 20,
    basePoints: 20,
    maxBonus: 10,
    description: 'Vận dụng tư duy logic & suy luận sắc bén (20s/câu)',
    descriptionEn: 'Apply logical deduction and sharp reasoning (20s/q)',
    icon: '🚀',
  },
  {
    stageIndex: 2,
    id: 'summit',
    title: 'Chặng 3: Về Đích',
    titleEn: 'Stage 3: Summit Dash',
    timePerQuestion: 25,
    basePoints: 30,
    maxBonus: 12,
    description: 'Chinh phục câu hỏi phân loại & bứt phá điểm số (25s/câu)',
    descriptionEn: 'Conquer advanced master questions and seal victory (25s/q)',
    icon: '👑',
  },
];

export const LESSONS = [
  // --- TOÁN HỌC ---
  {
    id: 'math-arithmetic',
    subjectId: 'math',
    title: 'Thần Đồng Tính Nhẩm & Số Học',
    titleEn: 'Mental Math & Operations',
    tag: 'Số học & Phép tính',
    tagEn: 'Arithmetic',
    icon: '🔢',
    level: 'Lớp 1-5',
    questions: [
      // Chặng 1: 4 câu
      {
        stage: 0,
        prompt: 'Kết quả của phép tính: 35 + 47 là bao nhiêu?',
        promptEn: 'What is the result of 35 + 47?',
        options: ['72', '82', '84', '78'],
        correctIndex: 1,
        explanation: '35 + 47 = 35 + 40 + 7 = 75 + 7 = 82.',
      },
      {
        stage: 0,
        prompt: 'Tìm số thích hợp điền vào dấu ?: 9 × 8 = ?',
        promptEn: 'Find the missing number: 9 × 8 = ?',
        options: ['64', '72', '81', '74'],
        correctIndex: 1,
        explanation: 'Bảng cửu chương 9: 9 × 8 = 72.',
      },
      {
        stage: 0,
        prompt: 'Một phép chia có số bị chia là 56, số chia là 7. Thương là bao nhiêu?',
        promptEn: 'If dividend is 56 and divisor is 7, what is the quotient?',
        options: ['6', '7', '8', '9'],
        correctIndex: 2,
        explanation: '56 : 7 = 8.',
      },
      {
        stage: 0,
        prompt: 'Hiệu của số chẵn lớn nhất có hai chữ số và 45 là:',
        promptEn: 'The difference between the largest two-digit even number and 45 is:',
        options: ['53', '54', '55', '56'],
        correctIndex: 0,
        explanation: 'Số chẵn lớn nhất có 2 chữ số là 98. Hiệu: 98 − 45 = 53.',
      },
      // Chặng 2: 4 câu
      {
        stage: 1,
        prompt: 'Tính nhanh giá trị biểu thức: 25 × 17 × 4 = ?',
        promptEn: 'Quickly calculate: 25 × 17 × 4 = ?',
        options: ['1700', '1600', '1800', '1750'],
        correctIndex: 0,
        explanation: 'Nhóm (25 × 4) × 17 = 100 × 17 = 1700.',
      },
      {
        stage: 1,
        prompt: 'Tìm X biết: (X − 15) : 3 = 24.',
        promptEn: 'Solve for X: (X − 15) : 3 = 24.',
        options: ['72', '87', '57', '92'],
        correctIndex: 1,
        explanation: 'X − 15 = 24 × 3 = 72 => X = 72 + 15 = 87.',
      },
      {
        stage: 1,
        prompt: 'Trung bình cộng của ba số: 42, 58 và 65 là bao nhiêu?',
        promptEn: 'What is the average of 42, 58, and 65?',
        options: ['54', '55', '56', '58'],
        correctIndex: 1,
        explanation: 'Tổng = 42 + 58 + 65 = 165. Trung bình cộng: 165 : 3 = 55.',
      },
      {
        stage: 1,
        prompt: 'Một cửa hàng có 140kg gạo, đã bán 2/5 số gạo đó. Hỏi còn lại bao nhiêu kg gạo?',
        promptEn: 'A store has 140kg of rice, sold 2/5 of it. How many kg are left?',
        options: ['56 kg', '84 kg', '70 kg', '92 kg'],
        correctIndex: 1,
        explanation: 'Đã bán: 140 × 2/5 = 56 kg. Còn lại: 140 − 56 = 84 kg (hoặc 140 × 3/5 = 84 kg).',
      },
      // Chặng 3: 4 câu
      {
        stage: 2,
        prompt: 'Tính tổng: A = 1 + 2 + 3 + 4 + ... + 19 + 20',
        promptEn: 'Calculate sum: A = 1 + 2 + 3 + ... + 20',
        options: ['190', '200', '210', '220'],
        correctIndex: 2,
        explanation: 'Số số hạng là 20. Tổng = (1 + 20) × 20 : 2 = 210.',
      },
      {
        stage: 2,
        prompt: 'Tuổi bố gấp 4 lần tuổi con. Biết bố hơn con 27 tuổi. Hỏi con bao nhiêu tuổi?',
        promptEn: 'Father is 4 times as old as his son. Father is 27 years older than son. How old is the son?',
        options: ['7 tuổi', '9 tuổi', '8 tuổi', '10 tuổi'],
        correctIndex: 1,
        explanation: 'Hiệu số phần bằng nhau: 4 − 1 = 3 phần. Tuổi con: 27 : 3 = 9 tuổi.',
      },
      {
        stage: 2,
        prompt: 'Cho số tự nhiên có 2 chữ số. Nếu viết thêm chữ số 5 vào bên trái số đó ta được số mới gấp 21 lần số ban đầu. Số ban đầu là:',
        promptEn: 'Write digit 5 to the left of a 2-digit number to get a new number 21 times the original. The original is:',
        options: ['25', '20', '35', '15'],
        correctIndex: 0,
        explanation: 'Số mới là 500 + ab = 21 × ab => 20 × ab = 500 => ab = 25.',
      },
      {
        stage: 2,
        prompt: 'Tìm số chữ số 0 tận cùng của tích: 1 × 2 × 3 × ... × 15.',
        promptEn: 'Find the number of trailing zeros of product: 1 × 2 × ... × 15.',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation: 'Tích chứa các thừa số chia hết cho 5 là 5, 10, 15 (gồm 3 thừa số 5). Số thừa số 2 vượt trội nên tích có đúng 3 chữ số 0 tận cùng.',
      },
    ],
  },
  {
    id: 'math-geometry',
    subjectId: 'math',
    title: 'Hình Học & Đo Lường Không Gian',
    titleEn: 'Geometry & Measurement',
    tag: 'Hình học & Đo lường',
    tagEn: 'Geometry',
    icon: '📐',
    level: 'Lớp 3-5',
    questions: [
      {
        stage: 0,
        prompt: 'Hình chữ nhật có chiều dài 12cm, chiều rộng 5cm. Chu vi của hình đó là:',
        promptEn: 'A rectangle has length 12cm, width 5cm. What is its perimeter?',
        options: ['17 cm', '34 cm', '60 cm', '48 cm'],
        correctIndex: 1,
        explanation: 'Chu vi = (12 + 5) × 2 = 34 cm.',
      },
      {
        stage: 0,
        prompt: 'Diện tích hình vuông có cạnh dài 8cm là:',
        promptEn: 'What is the area of a square with side length 8cm?',
        options: ['32 cm²', '64 cm²', '16 cm²', '48 cm²'],
        correctIndex: 1,
        explanation: 'Diện tích hình vuông = cạnh × cạnh = 8 × 8 = 64 cm².',
      },
      {
        stage: 0,
        prompt: 'Đổi đơn vị: 4m 5dm bằng bao nhiêu đề-xi-mét (dm)?',
        promptEn: 'Convert: 4m 5dm = ? dm',
        options: ['45 dm', '405 dm', '450 dm', '40.5 dm'],
        correctIndex: 0,
        explanation: '4m = 40dm => 40 + 5 = 45 dm.',
      },
      {
        stage: 0,
        prompt: 'Một hình tam giác có bao nhiêu đỉnh và bao nhiêu cạnh?',
        promptEn: 'How many vertices and sides does a triangle have?',
        options: ['2 đỉnh, 3 cạnh', '3 đỉnh, 3 cạnh', '4 đỉnh, 3 cạnh', '3 đỉnh, 4 cạnh'],
        correctIndex: 1,
        explanation: 'Hình tam giác luôn có 3 đỉnh và 3 cạnh.',
      },
      {
        stage: 1,
        prompt: 'Một khu vườn hình vuông có chu vi 48m. Diện tích khu vườn đó là:',
        promptEn: 'A square garden has perimeter 48m. What is its area?',
        options: ['144 m²', '120 m²', '196 m²', '160 m²'],
        correctIndex: 0,
        explanation: 'Cạnh vườn: 48 : 4 = 12m. Diện tích: 12 × 12 = 144 m².',
      },
      {
        stage: 1,
        prompt: 'Diện tích hình bình hành có đáy 15cm và chiều cao 8cm là:',
        promptEn: 'Area of a parallelogram with base 15cm and height 8cm is:',
        options: ['60 cm²', '120 cm²', '90 cm²', '100 cm²'],
        correctIndex: 1,
        explanation: 'Diện tích hình bình hành = đáy × chiều cao = 15 × 8 = 120 cm².',
      },
      {
        stage: 1,
        prompt: 'Đổi đơn vị: 3 tấn 50 kg = ... kg?',
        promptEn: 'Convert: 3 tons 50 kg = ... kg?',
        options: ['3500 kg', '3050 kg', '350 kg', '3005 kg'],
        correctIndex: 1,
        explanation: '1 tấn = 1000 kg => 3 tấn = 3000 kg => 3000 + 50 = 3050 kg.',
      },
      {
        stage: 1,
        prompt: 'Hình lập phương có cạnh 4cm. Thể tích của hình lập phương đó là:',
        promptEn: 'A cube has edge 4cm. What is its volume?',
        options: ['16 cm³', '64 cm³', '48 cm³', '32 cm³'],
        correctIndex: 1,
        explanation: 'Thể tích hình lập phương = 4 × 4 × 4 = 64 cm³.',
      },
      {
        stage: 2,
        prompt: 'Một hình chữ nhật có chu vi 50m. Nếu tăng chiều rộng thêm 5m thì được hình vuông. Diện tích hình chữ nhật ban đầu là:',
        promptEn: 'Perimeter of a rectangle is 50m. Increasing width by 5m makes it a square. Original area is:',
        options: ['150 m²', '125 m²', '144 m²', '160 m²'],
        correctIndex: 0,
        explanation: 'Nửa chu vi = 25m. Chiều dài hơn chiều rộng 5m. Chiều dài: (25+5)/2 = 15m; rộng: 10m. Diện tích = 15 × 10 = 150 m².',
      },
      {
        stage: 2,
        prompt: 'Cho hình tròn có bán kính r = 5cm. Chu vi của hình tròn đó là (lấy π = 3.14):',
        promptEn: 'Circle with radius r = 5cm. Its circumference is (π = 3.14):',
        options: ['15.7 cm', '31.4 cm', '78.5 cm', '62.8 cm'],
        correctIndex: 1,
        explanation: 'Chu vi = 2 × r × 3.14 = 2 × 5 × 3.14 = 31.4 cm.',
      },
      {
        stage: 2,
        prompt: 'Người ta cưa một khúc gỗ dài 12m thành các đoạn dài 2m. Mỗi lần cưa mất 5 phút, nghỉ 3 phút giữa 2 lần cưa. Hỏi cưa xong khúc gỗ mất bao nhiêu phút?',
        promptEn: 'Cut 12m log into 2m segments. 5 min per cut, 3 min rest between cuts. Total minutes needed:',
        options: ['48 phút', '40 phút', '37 phút', '45 phút'],
        correctIndex: 2,
        explanation: 'Số đoạn là 12 : 2 = 6 đoạn => cần 5 lần cưa và 4 lần nghỉ. Thời gian = (5 × 5) + (4 × 3) = 25 + 12 = 37 phút.',
      },
      {
        stage: 2,
        prompt: 'Một hình thang có đáy lớn 18cm, đáy bé 12cm và diện tích bằng 150 cm². Chiều cao hình thang là:',
        promptEn: 'A trapezoid has base1 18cm, base2 12cm, area 150 cm². What is its height?',
        options: ['8 cm', '10 cm', '12 cm', '15 cm'],
        correctIndex: 1,
        explanation: 'Tổng hai đáy: 18 + 12 = 30 cm. Chiều cao = 150 × 2 : 30 = 10 cm.',
      },
    ],
  },
  {
    id: 'math-logic',
    subjectId: 'math',
    title: 'Toán Đố Logic & Quy Luật Dãy Số',
    titleEn: 'Logic Puzzles & Sequences',
    tag: 'Tư duy logic & Dãy số',
    tagEn: 'Logic & IQ',
    icon: '🧩',
    level: 'Lớp 3-5',
    questions: [
      {
        stage: 0,
        prompt: 'Tìm số tiếp theo trong dãy: 2, 5, 8, 11, ?',
        promptEn: 'Find the next number: 2, 5, 8, 11, ?',
        options: ['13', '14', '15', '16'],
        correctIndex: 1,
        explanation: 'Dãy số cách đều +3: 11 + 3 = 14.',
      },
      {
        stage: 0,
        prompt: 'Có 5 bạn bắt tay nhau đôi một. Hỏi có tất cả bao nhiêu cái bắt tay?',
        promptEn: '5 friends shake hands with each other. How many handshakes in total?',
        options: ['10', '15', '20', '25'],
        correctIndex: 0,
        explanation: 'Số cái bắt tay = (5 × 4) : 2 = 10 cái bắt tay.',
      },
      {
        stage: 0,
        prompt: 'Nếu hôm qua là thứ Ba thì ngày kia là thứ mấy?',
        promptEn: 'If yesterday was Tuesday, what day is the day after tomorrow?',
        options: ['Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
        correctIndex: 1,
        explanation: 'Hôm qua là thứ Ba => Hôm nay là thứ Tư => Ngày mai là thứ Năm => Ngày kia là thứ Sáu.',
      },
      {
        stage: 0,
        prompt: 'Tìm số điền vào chỗ trống: 1, 4, 9, 16, 25, ?',
        promptEn: 'Find the next square number: 1, 4, 9, 16, 25, ?',
        options: ['30', '35', '36', '49'],
        correctIndex: 2,
        explanation: 'Dãy bình phương: 1², 2², 3², 4², 5², 6² = 36.',
      },
      {
        stage: 1,
        prompt: 'Tìm quy luật và điền số tiếp theo: 2, 4, 8, 16, 32, ?',
        promptEn: 'Find pattern and next number: 2, 4, 8, 16, 32, ?',
        options: ['48', '60', '64', '72'],
        correctIndex: 2,
        explanation: 'Mỗi số bằng số liền trước nhân với 2: 32 × 2 = 64.',
      },
      {
        stage: 1,
        prompt: 'Vừa gà vừa chó có 10 con, đếm được tất cả 28 cái chân. Hỏi có bao nhiêu con chó?',
        promptEn: 'Chickens and dogs have 10 animals and 28 legs in total. How many dogs?',
        options: ['3 con', '4 con', '5 con', '6 con'],
        correctIndex: 1,
        explanation: 'Giả sử 10 con đều là gà: 10 × 2 = 20 chân. Thiếu 28 − 20 = 8 chân. Mỗi con chó hơn gà 2 chân => Số chó: 8 : 2 = 4 con.',
      },
      {
        stage: 1,
        prompt: 'Trong một cuộc đua, bạn vượt qua người đang chạy ở vị trí thứ hai. Lúc này bạn đang ở vị trí thứ mấy?',
        promptEn: 'In a race, you overtake the runner in 2nd place. What position are you now in?',
        options: ['Thứ nhất', 'Thứ hai', 'Thứ ba', 'Thứ tư'],
        correctIndex: 1,
        explanation: 'Vượt qua người thứ hai thì bạn sẽ thay thế chính vị trí thứ hai của người đó!',
      },
      {
        stage: 1,
        prompt: 'Số nào chia cho 2 dư 1, chia cho 3 dư 2, chia cho 5 dư 4 và nhỏ hơn 35?',
        promptEn: 'What number less than 35 leaves remainder 1 (div 2), 2 (div 3), and 4 (div 5)?',
        options: ['29', '31', '23', '19'],
        correctIndex: 0,
        explanation: 'Số đó cộng thêm 1 chia hết cho 2, 3, 5 => Bội của 30 trừ 1 => 30 − 1 = 29.',
      },
      {
        stage: 2,
        prompt: 'Dãy số Fibonacci bắt đầu: 1, 1, 2, 3, 5, 8, 13, X. Giá trị của X là:',
        promptEn: 'Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, X. Value of X is:',
        options: ['18', '20', '21', '24'],
        correctIndex: 2,
        explanation: 'Mỗi số bằng tổng 2 số liền trước: 8 + 13 = 21.',
      },
      {
        stage: 2,
        prompt: 'Có 9 đồng tiền xu giống hệt nhau, trong đó có 1 đồng xu giả nhẹ hơn. Dùng cân đĩa thăng bằng, cần ít nhất mấy lần cân để chắc chắn tìm được đồng xu giả?',
        promptEn: 'Among 9 identical-looking coins, 1 fake is lighter. Minimum weighings on a balance scale:',
        options: ['1 lần', '2 lần', '3 lần', '4 lần'],
        correctIndex: 1,
        explanation: 'Chia 9 đồng thành 3 nhóm (3, 3, 3). Lần 1 cân 2 nhóm 3 đồng => xác định nhóm chứa xu giả. Lần 2 cân 2 đồng trong nhóm 3 => tìm ra xu giả. Chỉ cần 2 lần!',
      },
      {
        stage: 2,
        prompt: 'Một con ốc sên leo lên cột cao 10m. Ban ngày bò lên được 3m, ban đêm tụt xuống 2m. Hỏi sau bao nhiêu ngày đêm ốc sên lên tới đỉnh cột?',
        promptEn: 'Snail climbs 10m pole: climbs 3m by day, slips 2m by night. Days needed to reach top:',
        options: ['7 ngày', '8 ngày', '9 ngày', '10 ngày'],
        correctIndex: 1,
        explanation: 'Sau 7 ngày đêm, ốc sên ở độ cao: 7 × 1 = 7m. Sang ngày thứ 8, ban ngày leo thêm 3m là đạt đúng 10m tới đỉnh.',
      },
      {
        stage: 2,
        prompt: 'Một cuốn sách có 100 trang. Cần dùng bao nhiêu chữ số để đánh số tất cả các trang của cuốn sách đó?',
        promptEn: 'A 100-page book: How many digits are needed to number all pages?',
        options: ['190 chữ số', '192 chữ số', '195 chữ số', '200 chữ số'],
        correctIndex: 1,
        explanation: 'Từ 1-9: 9 chữ số. Từ 10-99 có 90 trang: 90 × 2 = 180 chữ số. Trang 100 có 3 chữ số. Tổng = 9 + 180 + 3 = 192 chữ số.',
      },
    ],
  },

  // --- TIẾNG VIỆT ---
  {
    id: 'viet-vocab',
    subjectId: 'vietnamese',
    title: 'Vua Từ Vựng & Phân Biệt Chính Tả',
    titleEn: 'Vocabulary & Spelling Master',
    tag: 'Từ vựng & Chính tả',
    tagEn: 'Spelling & Lexicon',
    icon: '✍️',
    level: 'Lớp 1-5',
    questions: [
      {
        stage: 0,
        prompt: 'Từ nào sau đây viết ĐÚNG chính tả?',
        promptEn: 'Which word is spelled correctly in Vietnamese?',
        options: ['Xắp xếp', 'Sắp xếp', 'Sắp sếp', 'Xắp sếp'],
        correctIndex: 1,
        explanation: 'Viết đúng chính tả chuẩn là: "sắp xếp".',
      },
      {
        stage: 0,
        prompt: 'Tìm từ trái nghĩa với từ "Chăm chỉ":',
        promptEn: 'Antonym of "Chăm chỉ" (hardworking):',
        options: ['Cần cù', 'Siêng năng', 'Lười biếng', 'Chịu khó'],
        correctIndex: 2,
        explanation: 'Trái nghĩa với chăm chỉ là lười biếng / lười nhác.',
      },
      {
        stage: 0,
        prompt: 'Cặp từ nào dưới đây là cặp từ đồng âm?',
        promptEn: 'Which pair of words are homonyms (từ đồng âm)?',
        options: ['Đường ăn / Con đường', 'Bao la / Rộng lớn', 'Cao lớn / Thấp bé', 'Siêng năng / Chăm chỉ'],
        correctIndex: 0,
        explanation: '"Đường" (gia vị ngọt) và "Đường" (lối đi) phát âm giống nhau nhưng nghĩa hoàn toàn khác nhau.',
      },
      {
        stage: 0,
        prompt: 'Từ nào sau đây là từ chỉ ĐẶC ĐIỂM?',
        promptEn: 'Which of the following is an adjective (từ chỉ đặc điểm)?',
        options: ['Chạy nhảy', 'Xanh ngắt', 'Quyển sách', 'Thầy giáo'],
        correctIndex: 1,
        explanation: '"Xanh ngắt" là tính từ chỉ đặc điểm màu sắc.',
      },
      {
        stage: 1,
        prompt: 'Dòng nào dưới đây gồm toàn các từ láy?',
        promptEn: 'Which row contains only reduplicative words (từ láy)?',
        options: ['Long lanh, lung linh, róc rách', 'Cây cối, ruộng đồng, nhà cửa', 'Xe đạp, máy bay, tàu thủy', 'Mưa gió, sấm sét, mây trời'],
        correctIndex: 0,
        explanation: 'Long lanh, lung linh, róc rách đều là từ láy tượng thanh/tượng hình.',
      },
      {
        stage: 1,
        prompt: 'Từ "chân" trong câu nào sau đây được dùng theo NGHĨA CHUYỂN?',
        promptEn: 'In which sentence is "chân" used with a figurative/transferred meaning?',
        options: ['Bé Nam bị đau chân.', 'Dưới chân núi có một dòng suối trong.', 'Cầu thủ sút bóng bằng chân phải.', 'Bác nông dân rửa chân lội ruộng.'],
        correctIndex: 1,
        explanation: '"Chân núi" mang nghĩa chuyển (phần dưới cùng tiếp giáp với mặt đất của núi).',
      },
      {
        stage: 1,
        prompt: 'Từ nào viết ĐÚNG chính tả giữa "ch" và "tr"?',
        promptEn: 'Which word correctly uses "ch" / "tr"?',
        options: ['Chân chọng', 'Trân trọng', 'Trân chọng', 'Chân trọng'],
        correctIndex: 1,
        explanation: 'Viết đúng chuẩn tiếng Việt là "Trân trọng".',
      },
      {
        stage: 1,
        prompt: 'Tìm từ đồng nghĩa với từ "Tổ quốc":',
        promptEn: 'Find a synonym for "Tổ quốc" (Fatherland):',
        options: ['Quê hương, non sông, đất nước', 'Thiên nhiên, cây cối, hoa lá', 'Đồng bằng, đồi núi, bãi biển', 'Làng xóm, xóm ngõ, tổ dân phố'],
        correctIndex: 0,
        explanation: 'Tổ quốc đồng nghĩa với giang sơn, non sông, đất nước.',
      },
      {
        stage: 2,
        prompt: 'Trong các từ sau: "mặt trời", "xe máy", "nhỏ nhắn", "bàn ghế", từ nào là từ láy?',
        promptEn: 'Among: "mặt trời", "xe máy", "nhỏ nhắn", "bàn ghế", which is a reduplicative word?',
        options: ['Mặt trời', 'Xe máy', 'Nhỏ nhắn', 'Bàn ghế'],
        correctIndex: 2,
        explanation: '"Nhỏ nhắn" là từ láy (láy âm đầu nh). Các từ còn lại là từ ghép đẳng lập/chính phụ.',
      },
      {
        stage: 2,
        prompt: 'Tìm câu có đại từ xưng hô thể hiện sự kính trọng cao nhất:',
        promptEn: 'Find the sentence showing highest respect in Vietnamese personal pronouns:',
        options: ['Tớ đi chơi đây.', 'Con kính chúc ông bà sống lâu trăm tuổi ạ!', 'Mày làm bài xong chưa?', 'Tôi đồng ý với ý kiến của bạn.'],
        correctIndex: 1,
        explanation: '"Con kính chúc ông bà... ạ!" thể hiện sự lễ phép, kính trọng tối đa đối với bậc bề trên.',
      },
      {
        stage: 2,
        prompt: 'Câu "Trời rải mây trắng như những cánh buồm trên biển xanh." sử dụng biện pháp tu từ gì?',
        promptEn: 'What literary device is used: "Trời rải mây trắng như những cánh buồm..."?',
        options: ['Nhân hóa', 'So sánh', 'Ẩn dụ', 'Điệp từ'],
        correctIndex: 1,
        explanation: 'Có từ so sánh "như" liên kết giữa "mây trắng" và "những cánh buồm".',
      },
      {
        stage: 2,
        prompt: 'Từ "ăn" trong trường hợp nào sau đây là NGHĨA GỐC?',
        promptEn: 'In which phrase is the word "ăn" used in its primary/literal meaning?',
        options: ['Ăn cơm', 'Tàu ăn than', 'Hồ dán không ăn', 'Xe ăn phanh'],
        correctIndex: 0,
        explanation: '"Ăn cơm" là hành động đưa thức ăn vào miệng nhai và nuốt (nghĩa gốc).',
      },
    ],
  },
  {
    id: 'viet-idioms',
    subjectId: 'vietnamese',
    title: 'Ca Dao Tục Ngữ & Tinh Hoa Thành Ngữ',
    titleEn: 'Folk Idioms, Proverbs & Wisdom',
    tag: 'Ca dao & Tục ngữ',
    tagEn: 'Folklore & Proverbs',
    icon: '📜',
    level: 'Lớp 2-5',
    questions: [
      {
        stage: 0,
        prompt: 'Điền từ còn thiếu vào câu thành ngữ: "Uống nước nhớ ..."',
        promptEn: 'Complete the proverb: "Uống nước nhớ ..."',
        options: ['nguồn', 'rừng', 'sông', 'suối'],
        correctIndex: 0,
        explanation: 'Thành ngữ quen thuộc: "Uống nước nhớ nguồn" nhắc nhở lòng biết ơn.',
      },
      {
        stage: 0,
        prompt: 'Hoàn thành câu tục ngữ: "Học thầy không tày học ..."',
        promptEn: 'Complete the saying: "Học thầy không tày học ..."',
        options: ['sách', 'bạn', 'mẹ', 'cha'],
        correctIndex: 1,
        explanation: '"Học thầy không tày học bạn" khuyên chúng ta học hỏi từ bạn bè bè bạn.',
      },
      {
        stage: 0,
        prompt: 'Câu tục ngữ "Lá lành đùm lá rách" khuyên nhủ con người điều gì?',
        promptEn: 'What does "Lá lành đùm lá rách" advise people?',
        options: ['Tiết kiệm tiền bạc', 'Đoàn kết và yêu thương giúp đỡ nhau', 'Chăm chỉ làm việc', 'Giữ gìn vệ sinh'],
        correctIndex: 1,
        explanation: 'Khuyên con người phải biết san sẻ, cưu mang đùm bọc người có hoàn cảnh khó khăn.',
      },
      {
        stage: 0,
        prompt: 'Điền từ thích hợp: "Gần mực thì đen, gần đèn thì ..."',
        promptEn: 'Fill in: "Gần mực thì đen, gần đèn thì ..."',
        options: ['tối', 'rạng', 'sáng', 'đỏ'],
        correctIndex: 2,
        explanation: '"Gần mực thì đen, gần đèn thì rạng" hoặc phổ biến là "gần đèn thì sáng".',
      },
      {
        stage: 1,
        prompt: 'Điền vế tiếp theo của câu ca dao: "Công cha như núi Thái Sơn / Nghĩa mẹ như ... chảy ra."',
        promptEn: 'Complete the folk verse: "Công cha như núi Thái Sơn / Nghĩa mẹ như ... chảy ra."',
        options: ['suối trong nguồn', 'nước trong nguồn', 'sóng biển khơi', 'mây trên ngàn'],
        correctIndex: 1,
        explanation: 'Câu ca dao bất hủ: "Nghĩa mẹ như nước trong nguồn chảy ra".',
      },
      {
        stage: 1,
        prompt: 'Thành ngữ "Thức khuya dậy sớm" nói về đức tính gì?',
        promptEn: 'What quality does "Thức khuya dậy sớm" refer to?',
        options: ['Thông minh, sáng tạo', 'Cần cù, chăm chỉ, chịu thương chịu khó', 'Thật thà, ngay thẳng', 'Dũng cảm, kiên cường'],
        correctIndex: 1,
        explanation: 'Thể hiện sự chăm chỉ, nỗ lực lao động học tập không quản ngại thời gian.',
      },
      {
        stage: 1,
        prompt: 'Thành ngữ nào dưới đây đồng nghĩa với "Đồng cam cộng khổ"?',
        promptEn: 'Which idiom is synonymous with "Đồng cam cộng khổ"?',
        options: ['Chia ngọt sẻ bùi', 'Nhát như thỏ đế', 'Đứng núi này trông núi nọ', 'Nước đổ lá khoai'],
        correctIndex: 0,
        explanation: '"Chia ngọt sẻ bùi" nghĩa là cùng nhau chia sẻ vui buồn, gian khổ.',
      },
      {
        stage: 1,
        prompt: 'Câu thành ngữ "Một nắng hai sương" gợi tả hình ảnh của ai?',
        promptEn: 'Whose image does the idiom "Một nắng hai sương" evoke?',
        options: ['Những người lính biên phòng', 'Người nông dân lao động vất vả', 'Các em học sinh đến trường', 'Các thủy thủ ra khơi'],
        correctIndex: 1,
        explanation: 'Gợi tả sự dãi dầu mưa nắng vất vả sớm hôm của người nông dân lao động.',
      },
      {
        stage: 2,
        prompt: 'Thành ngữ "Chân cứng đá mềm" mang ý nghĩa khuyên nhủ con người:',
        promptEn: 'The idiom "Chân cứng đá mềm" encourages people to:',
        options: ['Có đôi chân khỏe mạnh', 'Bền bỉ, ý chí kiên định vượt qua thử thách', 'Tránh xa những tảng đá nhọn', 'Đi giày dép cẩn thận'],
        correctIndex: 1,
        explanation: 'Chúc hoặc khuyên con người có sức khỏe dẻo dai và ý chí vững vàng vượt qua mọi gian khó.',
      },
      {
        stage: 2,
        prompt: 'Điền từ vào câu tục ngữ: "Thương người như thể thương ..."',
        promptEn: 'Complete: "Thương người như thể thương ..."',
        options: ['con', 'mình', 'thân', 'ai'],
        correctIndex: 2,
        explanation: 'Tục ngữ: "Thương người như thể thương thân".',
      },
      {
        stage: 2,
        prompt: 'Trong câu thơ: "Tre xanh, xanh tự bao giờ / Chuyện ngày xưa đã có bờ tre xanh", hình tượng cây tre tượng trưng cho phẩm chất gì của dân tộc Việt Nam?',
        promptEn: 'What Vietnamese virtue does the green bamboo symbolize?',
        options: ['Giàu sang phú quý', 'Bất khuất, kiên cường, đoàn kết', 'Vội vã, náo nhiệt', 'Lãng mạn, mơ mộng'],
        correctIndex: 1,
        explanation: 'Cây tre tượng trưng cho sức sống dẻo dai, kiên cường, bất khuất và tinh thần đoàn kết.',
      },
      {
        stage: 2,
        prompt: 'Cặp từ trái nghĩa trong câu tục ngữ "Nơi chôn rau cắt rốn" ẩn dụ cho điều gì?',
        promptEn: 'What does "Nơi chôn rau cắt rốn" metaphorically signify?',
        options: ['Nơi khám bệnh', 'Quê hương bản quán nơi mình sinh ra', 'Trường học thời thơ ấu', 'Một cánh đồng lúa'],
        correctIndex: 1,
        explanation: '"Nơi chôn rau cắt rốn" là cách gọi thiêng liêng chỉ quê hương xứ sở nơi một người chào đời.',
      },
    ],
  },

  // --- TIẾNG ANH ---
  {
    id: 'eng-vocab',
    subjectId: 'english',
    title: 'Smart Explorer: Daily Vocabulary & Phonics',
    titleEn: 'Vocabulary & Phonics',
    tag: 'Từ vựng & Phát âm',
    tagEn: 'Words & Sounds',
    icon: '🔤',
    level: 'Grade 1-5',
    questions: [
      {
        stage: 0,
        prompt: 'What animal has black and white stripes and lives in Africa?',
        promptEn: 'What animal has black and white stripes and lives in Africa?',
        options: ['Tiger', 'Zebra', 'Panda', 'Giraffe'],
        correctIndex: 1,
        explanation: 'A zebra has black and white stripes.',
      },
      {
        stage: 0,
        prompt: 'Which word rhymes with "CAT"?',
        promptEn: 'Which word rhymes with "CAT"?',
        options: ['Dog', 'Hat', 'Cup', 'Sun'],
        correctIndex: 1,
        explanation: '"Hat" and "Cat" end with the same "-at" sound.',
      },
      {
        stage: 0,
        prompt: 'What color do you get when you mix Yellow and Blue?',
        promptEn: 'What color do you get when you mix Yellow and Blue?',
        options: ['Green', 'Purple', 'Orange', 'Brown'],
        correctIndex: 0,
        explanation: 'Yellow + Blue = Green.',
      },
      {
        stage: 0,
        prompt: 'Choose the word that means "a place where you borrow books":',
        promptEn: 'Choose the word that means "a place where you borrow books":',
        options: ['Bakery', 'Hospital', 'Library', 'Cinema'],
        correctIndex: 2,
        explanation: 'A library is a quiet place where you borrow books to read.',
      },
      {
        stage: 1,
        prompt: 'Which room in the house is used for cooking delicious meals?',
        promptEn: 'Which room in the house is used for cooking delicious meals?',
        options: ['Bedroom', 'Living room', 'Kitchen', 'Bathroom'],
        correctIndex: 2,
        explanation: 'Kitchen is the room where food is prepared and cooked.',
      },
      {
        stage: 1,
        prompt: 'Find the odd one out:',
        promptEn: 'Find the odd one out:',
        options: ['Apple', 'Banana', 'Carrot', 'Orange'],
        correctIndex: 2,
        explanation: 'Carrot is a vegetable, while Apple, Banana, and Orange are fruits.',
      },
      {
        stage: 1,
        prompt: 'What is the opposite of the adjective "ANCIENT"?',
        promptEn: 'What is the opposite of the adjective "ANCIENT"?',
        options: ['Old', 'Modern', 'Historic', 'Huge'],
        correctIndex: 1,
        explanation: 'Ancient means very old, so its opposite is Modern (new).',
      },
      {
        stage: 1,
        prompt: 'A person who flies an airplane is called a:',
        promptEn: 'A person who flies an airplane is called a:',
        options: ['Doctor', 'Pilot', 'Chef', 'Engineer'],
        correctIndex: 1,
        explanation: 'A pilot operates the flying controls of an aircraft.',
      },
      {
        stage: 2,
        prompt: 'Which of the following is a synonym for "COURAGEOUS"?',
        promptEn: 'Which of the following is a synonym for "COURAGEOUS"?',
        options: ['Brave', 'Timid', 'Fearful', 'Lazy'],
        correctIndex: 0,
        explanation: 'Courageous means brave and fearless.',
      },
      {
        stage: 2,
        prompt: 'Choose the correct word: "The earth rotates around the ____."',
        promptEn: 'Choose the correct word: "The earth rotates around the ____."',
        options: ['Moon', 'Sun', 'Mars', 'Jupiter'],
        correctIndex: 1,
        explanation: 'The Earth revolves around the Sun in our solar system.',
      },
      {
        stage: 2,
        prompt: 'Identify the word with the /i:/ sound like "meet":',
        promptEn: 'Identify the word with the /i:/ sound like "meet":',
        options: ['Seat', 'Sit', 'Set', 'Sat'],
        correctIndex: 0,
        explanation: '"Seat" is pronounced /si:t/, having the long /i:/ sound.',
      },
      {
        stage: 2,
        prompt: 'What do bees produce that tastes sweet?',
        promptEn: 'What do bees produce that tastes sweet?',
        options: ['Sugar', 'Honey', 'Syrup', 'Caramel'],
        correctIndex: 1,
        explanation: 'Bees make natural honey from flower nectar.',
      },
    ],
  },
  {
    id: 'eng-grammar',
    subjectId: 'english',
    title: 'Grammar Master: Tenses & Sentence Structures',
    titleEn: 'Grammar & Structures',
    tag: 'Ngữ pháp & Cấu trúc câu',
    tagEn: 'Grammar & Syntax',
    icon: '⚡',
    level: 'Grade 3-5',
    questions: [
      {
        stage: 0,
        prompt: 'She ____ to school by bicycle every morning.',
        promptEn: 'She ____ to school by bicycle every morning.',
        options: ['go', 'goes', 'went', 'going'],
        correctIndex: 1,
        explanation: 'Third person singular (She) in Present Simple takes "goes".',
      },
      {
        stage: 0,
        prompt: 'They are ____ football on the playground right now.',
        promptEn: 'They are ____ football on the playground right now.',
        options: ['play', 'plays', 'playing', 'played'],
        correctIndex: 2,
        explanation: 'Present Continuous with "right now": are + V-ing (playing).',
      },
      {
        stage: 0,
        prompt: 'How ____ apples are there on the dining table?',
        promptEn: 'How ____ apples are there on the dining table?',
        options: ['much', 'many', 'long', 'often'],
        correctIndex: 1,
        explanation: '"Apples" is a countable plural noun, so we use "How many".',
      },
      {
        stage: 0,
        prompt: 'Look! The baby is sleeping, so please speak ____.',
        promptEn: 'Look! The baby is sleeping, so please speak ____.',
        options: ['loudly', 'quietly', 'fast', 'quick'],
        correctIndex: 1,
        explanation: 'We need an adverb of manner: speak "quietly".',
      },
      {
        stage: 1,
        prompt: 'Yesterday, we ____ a memorable movie together.',
        promptEn: 'Yesterday, we ____ a memorable movie together.',
        options: ['watch', 'watched', 'watches', 'watching'],
        correctIndex: 1,
        explanation: '"Yesterday" signals Past Simple tense: "watched".',
      },
      {
        stage: 1,
        prompt: 'Mount Everest is the ____ mountain in the world.',
        promptEn: 'Mount Everest is the ____ mountain in the world.',
        options: ['high', 'higher', 'highest', 'most high'],
        correctIndex: 2,
        explanation: 'Superlative of short adjective "high": the highest.',
      },
      {
        stage: 1,
        prompt: 'If it rains tomorrow, we ____ at home and read books.',
        promptEn: 'If it rains tomorrow, we ____ at home and read books.',
        options: ['will stay', 'stayed', 'staying', 'stays'],
        correctIndex: 0,
        explanation: 'First Conditional: If + Present Simple, will + Verb base form.',
      },
      {
        stage: 1,
        prompt: 'He has lived in Da Nang city ____ five years.',
        promptEn: 'He has lived in Da Nang city ____ five years.',
        options: ['since', 'for', 'in', 'at'],
        correctIndex: 1,
        explanation: 'We use "for" + period of time (for five years) in Present Perfect.',
      },
      {
        stage: 2,
        prompt: 'I look forward to ____ you at the Mind Phoenix party.',
        promptEn: 'I look forward to ____ you at the Mind Phoenix party.',
        options: ['see', 'saw', 'seeing', 'seen'],
        correctIndex: 2,
        explanation: 'The phrase "look forward to" is always followed by a Gerund (V-ing): seeing.',
      },
      {
        stage: 2,
        prompt: 'Choose the sentence with correct word order:',
        promptEn: 'Choose the sentence with correct word order:',
        options: [
          'She bought a lovely small pink bag.',
          'She bought a pink small lovely bag.',
          'She bought a small pink lovely bag.',
          'She bought a lovely pink small bag.',
        ],
        correctIndex: 0,
        explanation: 'OSASCOMP order: Opinion (lovely) -> Size (small) -> Color (pink).',
      },
      {
        stage: 2,
        prompt: 'Neither John nor his friends ____ present at yesterday’s meeting.',
        promptEn: 'Neither John nor his friends ____ present at yesterday’s meeting.',
        options: ['was', 'were', 'is', 'are'],
        correctIndex: 1,
        explanation: 'With "Neither... nor...", the verb agrees with the closer subject ("his friends" - plural in past tense: were).',
      },
      {
        stage: 2,
        prompt: 'The cake was so delicious that everyone wanted a second ____.',
        promptEn: 'The cake was so delicious that everyone wanted a second ____.',
        options: ['part', 'piece', 'side', 'roll'],
        correctIndex: 1,
        explanation: 'A piece of cake is the standard idiom/collocation.',
      },
    ],
  },

  // --- ĐẤU TRƯỜNG TOÀN NĂNG (TRI-SUBJECT ARENA) ---
  {
    id: 'all-round-phoenix',
    subjectId: 'all-round',
    title: 'Tranh Cúp Mind Phoenix: Khởi Lửa Tri Thức',
    titleEn: 'Mind Phoenix Championship Clash',
    tag: 'Toán · Văn · Anh Liên Môn',
    tagEn: 'Tri-Disciplinary',
    icon: '🔥',
    level: 'Lớp 3-5',
    questions: [
      // Chặng 1: Toán nhẩm + Tiếng Việt cơ bản + Tiếng Anh nền
      {
        stage: 0,
        prompt: '[TOÁN] Tìm số tiếp theo trong dãy: 3, 6, 12, 24, ?',
        promptEn: '[MATH] Find the next number in sequence: 3, 6, 12, 24, ?',
        options: ['36', '48', '30', '52'],
        correctIndex: 1,
        explanation: 'Quy luật nhân đôi: 24 × 2 = 48.',
      },
      {
        stage: 0,
        prompt: '[TIẾNG VIỆT] Điền từ vào chỗ trống: "Luyện mãi thành ..., có công mài sắt có ngày nên kim."',
        promptEn: '[VIETNAMESE] Complete: "Luyện mãi thành ..."',
        options: ['tài', 'giỏi', 'quen', 'thạo'],
        correctIndex: 0,
        explanation: 'Tục ngữ: "Luyện mãi thành tài".',
      },
      {
        stage: 0,
        prompt: '[ENGLISH] What is the past form of the irregular verb "BUY"?',
        promptEn: '[ENGLISH] What is the past form of the irregular verb "BUY"?',
        options: ['Buyed', 'Bought', 'Brought', 'Boated'],
        correctIndex: 1,
        explanation: 'Past tense of "buy" is "bought".',
      },
      {
        stage: 0,
        prompt: '[TOÁN] Một hình vuông có diện tích 81 cm². Chu vi hình vuông đó là:',
        promptEn: '[MATH] A square has area 81 cm². What is its perimeter?',
        options: ['18 cm', '36 cm', '45 cm', '72 cm'],
        correctIndex: 1,
        explanation: 'Cạnh = 9 cm (vì 9 × 9 = 81). Chu vi = 9 × 4 = 36 cm.',
      },
      // Chặng 2: Nâng cao tốc độ
      {
        stage: 1,
        prompt: '[TIẾNG VIỆT] Từ nào sau đây là từ ghép đẳng lập?',
        promptEn: '[VIETNAMESE] Which of the following is a coordinate compound word?',
        options: ['Xe buýt', 'Quần áo', 'Cây chuối', 'Hoa hồng'],
        correctIndex: 1,
        explanation: '"Quần áo" có 2 tiếng bình đẳng về ngữ pháp và ý nghĩa.',
      },
      {
        stage: 1,
        prompt: '[ENGLISH] Which planet is known as the "Red Planet"?',
        promptEn: '[ENGLISH] Which planet is known as the "Red Planet"?',
        options: ['Venus', 'Mars', 'Saturn', 'Mercury'],
        correctIndex: 1,
        explanation: 'Mars is called the Red Planet because of iron oxide on its surface.',
      },
      {
        stage: 1,
        prompt: '[TOÁN] Tìm X: 150 : (X + 5) = 15.',
        promptEn: '[MATH] Solve: 150 : (X + 5) = 15.',
        options: ['5', '10', '15', '20'],
        correctIndex: 0,
        explanation: 'X + 5 = 150 : 15 = 10 => X = 10 − 5 = 5.',
      },
      {
        stage: 1,
        prompt: '[TIẾNG VIỆT] Câu: "Mùa xuân đã về, trăm hoa khoe sắc thắm." là kiểu câu gì?',
        promptEn: '[VIETNAMESE] What sentence type is: "Mùa xuân đã về, trăm hoa khoe sắc thắm."?',
        options: ['Câu đơn', 'Câu ghép', 'Câu rút gọn', 'Câu đặc biệt'],
        correctIndex: 1,
        explanation: 'Có 2 cụm Chủ - Vị nối tiếp nhau tạo thành câu ghép.',
      },
      // Chặng 3: Chinh phục đỉnh cao
      {
        stage: 2,
        prompt: '[TOÁN] Có 3 thùng chứa tổng cộng 120 lít dầu. Nếu chuyển 10 lít từ thùng 1 sang thùng 2 thì 3 thùng có số dầu bằng nhau. Hỏi ban đầu thùng 1 có bao nhiêu lít dầu?',
        promptEn: '[MATH] 3 tanks hold 120L oil. Transferring 10L from tank 1 to tank 2 makes all tanks equal. Initial oil in tank 1 was:',
        options: ['40 lít', '50 lít', '60 lít', '45 lít'],
        correctIndex: 1,
        explanation: 'Số dầu bằng nhau lúc sau: 120 : 3 = 40 lít. Thùng 1 ban đầu: 40 + 10 = 50 lít.',
      },
      {
        stage: 2,
        prompt: '[ENGLISH] "Don’t judge a book by its ____." (English Proverb)',
        promptEn: '[ENGLISH] "Don’t judge a book by its ____." (English Proverb)',
        options: ['pages', 'cover', 'author', 'title'],
        correctIndex: 1,
        explanation: 'Famous idiom: "Don’t judge a book by its cover".',
      },
      {
        stage: 2,
        prompt: '[TIẾNG VIỆT] Biện pháp tu từ nào được dùng trong câu: "Bác đã đi rồi sao Bác ơi! Mùa thu đang đẹp nắng xanh trời."',
        promptEn: '[VIETNAMESE] Which figure of speech is used: "Bác đã đi rồi sao Bác ơi!"?',
        options: ['Nói giảm nói tránh', 'So sánh', 'Hoán dụ', 'Nói quá'],
        correctIndex: 0,
        explanation: 'Dùng từ "đi" thay cho từ "mất" là biện pháp nói giảm nói tránh để giảm bớt nỗi đau thương.',
      },
      {
        stage: 2,
        prompt: '[TOÁN] Cho hình thang ABCD có đáy nhỏ 8cm, đáy lớn 14cm. Nếu kéo dài đáy lớn thêm 3cm thì diện tích tăng thêm 15 cm². Diện tích hình thang ABCD ban đầu là:',
        promptEn: '[MATH] Trapezoid bases 8cm and 14cm. Extending long base by 3cm adds 15 cm² area. Original trapezoid area:',
        options: ['90 cm²', '110 cm²', '120 cm²', '100 cm²'],
        correctIndex: 1,
        explanation: 'Phần tăng thêm là tam giác đáy 3cm, diện tích 15 cm² => Chiều cao: 15 × 2 : 3 = 10 cm. Diện tích ban đầu: (8 + 14) × 10 : 2 = 110 cm².',
      },
    ],
  },
];

/**
 * Calculate score for a single question based on stage, time remaining and streak.
 */
export function calculateQuestionScore({
  stageIndex = 0,
  timeRemaining = 0,
  isCorrect = false,
  currentStreak = 0,
}) {
  if (!isCorrect) {
    return {
      pointsAwarded: 0,
      basePoints: 0,
      speedBonus: 0,
      streakMultiplier: 1.0,
      newStreak: 0,
    };
  }

  const stage = STAGE_CONFIGS[stageIndex] || STAGE_CONFIGS[0];
  const basePoints = stage.basePoints;
  const speedBonus = Math.min(stage.maxBonus, Math.max(0, Math.floor(timeRemaining / 2)));
  const newStreak = currentStreak + 1;

  let streakMultiplier = 1.0;
  if (newStreak >= 5) streakMultiplier = 2.0;
  else if (newStreak >= 3) streakMultiplier = 1.5;
  else if (newStreak >= 2) streakMultiplier = 1.2;

  const pointsAwarded = Math.round((basePoints + speedBonus) * streakMultiplier);

  return {
    pointsAwarded,
    basePoints,
    speedBonus,
    streakMultiplier,
    newStreak,
  };
}

/**
 * Determine medal rank based on percentage of max attainable score.
 */
export function calculateMedal(score, maxScore) {
  if (maxScore <= 0) return { id: 'novice', name: 'Đấu sĩ Tập sự', nameEn: 'Novice Fighter', icon: '🌱' };
  const ratio = score / maxScore;

  if (ratio >= 0.88) {
    return {
      id: 'diamond',
      name: 'Kim Cương Đấu Trường',
      nameEn: 'Diamond Master',
      icon: '💎',
      color: '#06b6d4',
      badge: 'TOP 1 XUẤT SẮC',
    };
  }
  if (ratio >= 0.72) {
    return {
      id: 'gold',
      name: 'Huy Chương Vàng',
      nameEn: 'Gold Champion',
      icon: '🥇',
      color: '#eab308',
      badge: 'TOP 3 TINH ANH',
    };
  }
  if (ratio >= 0.55) {
    return {
      id: 'silver',
      name: 'Huy Chương Bạc',
      nameEn: 'Silver Achiever',
      icon: '🥈',
      color: '#94a3b8',
      badge: 'TOP 10 ĐẤU SĨ',
    };
  }
  if (ratio >= 0.35) {
    return {
      id: 'bronze',
      name: 'Huy Chương Đồng',
      nameEn: 'Bronze Contender',
      icon: '🥉',
      color: '#d97706',
      badge: 'ĐẤU SĨ BẢN LĨNH',
    };
  }
  return {
    id: 'rising',
    name: 'Đấu Sĩ Tiềm Năng',
    nameEn: 'Rising Star',
    icon: '🌟',
    color: '#3b82f6',
    badge: 'TIẾP TỤC BỨT PHÁ',
  };
}

/**
 * Generate simulated live arena rivals to create real-time leaderboard feel.
 */
export const ARENA_BOT_NAMES = [
  { name: 'Bảo Nam', school: 'TH Chu Văn An (Hà Nội)', avatar: '🦊' },
  { name: 'Minh Khôi', school: 'TH Lê Quý Đôn (Đà Nẵng)', avatar: '🦁' },
  { name: 'Thảo Nguyên', school: 'TH Nguyễn Du (TP.HCM)', avatar: '🐰' },
  { name: 'Hoàng Bách', school: 'TH Đinh Tiên Hoàng (Hải Phòng)', avatar: '🐯' },
  { name: 'Gia Hân', school: 'TH Trần Phú (Cần Thơ)', avatar: '🐼' },
  { name: 'Tuấn Kiệt', school: 'TH Ngô Mây (Bình Định)', avatar: '🦅' },
  { name: 'Khánh An', school: 'TH Phan Chu Trinh (Huế)', avatar: '🦄' },
  { name: 'Hải Đăng', school: 'TH Lý Tự Trọng (Nha Trang)', avatar: '🐬' },
  { name: 'Thanh Trúc', school: 'TH Kim Đồng (Vũng Tàu)', avatar: '🌸' },
];

export function generateArenaLeaderboard({
  userScore = 0,
  userName = 'Bạn',
  maxScore = 360,
  rng = Math.random,
}) {
  const competitors = ARENA_BOT_NAMES.map((bot, index) => {
    // Generate scores centered around user's score with natural variance
    const spread = (index - 4) * 0.08;
    const factor = Math.max(0.25, Math.min(0.98, (userScore / Math.max(1, maxScore)) + spread + (rng() * 0.1 - 0.05)));
    const score = Math.round(maxScore * factor);
    return {
      name: bot.name,
      school: bot.school,
      avatar: bot.avatar,
      score,
      isUser: false,
    };
  });

  const fullList = [
    ...competitors,
    {
      name: userName,
      school: 'Mind Phoenix Arena',
      avatar: '👑',
      score: userScore,
      isUser: true,
    },
  ];

  // Sort descending by score
  fullList.sort((a, b) => b.score - a.score);

  return fullList.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));
}

/**
 * Helper to get questions for a given lesson grouped by stage.
 */
export function getLessonStages(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
  const stages = [0, 1, 2].map((stageIdx) => {
    const config = STAGE_CONFIGS[stageIdx];
    const questions = lesson.questions.filter((q) => q.stage === stageIdx);
    return {
      ...config,
      questions,
    };
  });
  return {
    lesson,
    stages,
  };
}

/**
 * Fisher-Yates array shuffle.
 */
export function shuffleArray(arr, rng = Math.random) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


// ===================================================================
// LEVELING, TOWER CLIMB (LEO THÁP) & 1v1 DUEL (ĐẤU ĐỐI KHÁNG) SYSTEM
// ===================================================================

export const ARENA_LEVELS = [
  { level: 1, minXp: 0, maxXp: 200, titleVi: 'Tập Sự Đấu Trường', titleEn: 'Arena Novice', badge: '🌱' },
  { level: 2, minXp: 200, maxXp: 500, titleVi: 'Tân Binh Tinh Nhuệ', titleEn: 'Elite Recruit', badge: '⚔️' },
  { level: 3, minXp: 500, maxXp: 1000, titleVi: 'Chiến Binh Trí Tuệ', titleEn: 'Mind Warrior', badge: '🛡️' },
  { level: 4, minXp: 1000, maxXp: 1800, titleVi: 'Dũng Sĩ Tinh Anh', titleEn: 'Valiant Champion', badge: '🏹' },
  { level: 5, minXp: 1800, maxXp: 3000, titleVi: 'Cao Thủ Đấu Trường', titleEn: 'Arena Master', badge: '⚡' },
  { level: 6, minXp: 3000, maxXp: 5000, titleVi: 'Đại Sư Trí Tuệ', titleEn: 'Grand Master', badge: '🔮' },
  { level: 7, minXp: 5000, maxXp: 8000, titleVi: 'Tông Sư Bất Bại', titleEn: 'Supreme Grandmaster', badge: '👑' },
  { level: 8, minXp: 8000, maxXp: Infinity, titleVi: 'Huyền Thoại Mind Phoenix', titleEn: 'Phoenix Legend', badge: '🔥' },
];

export function calculatePlayerLevel(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const current = ARENA_LEVELS.find((l) => safeXp >= l.minXp && safeXp < l.maxXp) || ARENA_LEVELS[ARENA_LEVELS.length - 1];
  const next = ARENA_LEVELS.find((l) => l.level === current.level + 1) || null;
  const xpInLevel = safeXp - current.minXp;
  const levelSpan = next ? (next.minXp - current.minXp) : 1000;
  const progressPercent = next ? Math.min(100, Math.round((xpInLevel / levelSpan) * 100)) : 100;

  return {
    level: current.level,
    titleVi: current.titleVi,
    titleEn: current.titleEn,
    badge: current.badge,
    currentXp: safeXp,
    nextLevelXp: next ? next.minXp : safeXp,
    xpNeeded: next ? (next.minXp - safeXp) : 0,
    progressPercent,
  };
}

export const TOWER_FLOORS = [
  { floor: 1, titleVi: 'Tầng 1: Khởi Đầu Vững Chắc', titleEn: 'Floor 1: Solid Base', timePerQ: 15, basePoints: 15, icon: '🌿' },
  { floor: 2, titleVi: 'Tầng 2: Cổng Sắt Thử Lửa', titleEn: 'Floor 2: Iron Gate', timePerQ: 18, basePoints: 25, icon: '⚙️' },
  { floor: 3, titleVi: 'Tầng 3: Nấc Thang Tăng Tốc', titleEn: 'Floor 3: Sky Ladder', timePerQ: 20, basePoints: 35, icon: '🚀' },
  { floor: 4, titleVi: 'Tầng 4: Đỉnh Gió Sấm Sét', titleEn: 'Floor 4: Thunder Peak', timePerQ: 22, basePoints: 45, icon: '⚡' },
  { floor: 5, titleVi: 'Tầng 5: Đỉnh Tháp Phượng Hoàng', titleEn: 'Floor 5: Phoenix Apex', timePerQ: 25, basePoints: 60, icon: '🔥' },
];

export const DUEL_RIVALS = [
  { id: 'rival-1', name: 'Minh Khôi', school: 'TH Lê Quý Đôn (Đà Nẵng)', avatar: '🦁', level: 2, winRate: '58%', botAccuracy: 0.60, titleVi: 'Tân Binh Tinh Nhuệ', titleEn: 'Elite Recruit', isBot: true },
  { id: 'rival-2', name: 'Bảo Nam', school: 'TH Chu Văn An (Hà Nội)', avatar: '🦊', level: 3, winRate: '68%', botAccuracy: 0.70, titleVi: 'Chiến Binh Trí Tuệ', titleEn: 'Mind Warrior', isBot: true },
  { id: 'rival-3', name: 'Thảo Nguyên', school: 'TH Nguyễn Du (TP.HCM)', avatar: '🐰', level: 4, winRate: '75%', botAccuracy: 0.78, titleVi: 'Dũng Sĩ Tinh Anh', titleEn: 'Valiant Champion', isBot: true },
  { id: 'rival-4', name: 'Hoàng Bách', school: 'TH Đinh Tiên Hoàng (Hải Phòng)', avatar: '🐯', level: 5, winRate: '82%', botAccuracy: 0.85, titleVi: 'Cao Thủ Đấu Trường', titleEn: 'Arena Master', isBot: true },
  { id: 'rival-5', name: 'Gia Hân', school: 'TH Châu Văn Liêm (Cần Thơ)', avatar: '🐼', level: 6, winRate: '88%', botAccuracy: 0.90, titleVi: 'Đại Sư Trí Tuệ', titleEn: 'Grand Master', isBot: true },
  { id: 'rival-6', name: 'Tuấn Kiệt', school: 'TH Ngô Mây (Bình Định)', avatar: '🦅', level: 7, winRate: '94%', botAccuracy: 0.95, titleVi: 'Tông Sư Bất Bại', titleEn: 'Supreme Grandmaster', isBot: true },
];

export function calculateDuelResult({ userScore = 0, rivalScore = 0, victoryBonus = 100 }) {
  const isWinner = userScore > rivalScore;
  const isDraw = userScore === rivalScore;
  // Người win sẽ được điểm (điểm trận + thưởng thắng), người thua không được gì (0 điểm)
  const pointsAwarded = isWinner ? (userScore + victoryBonus) : 0;

  return {
    isWinner,
    isDraw,
    pointsAwarded,
    victoryBonus: isWinner ? victoryBonus : 0,
    userScore,
    rivalScore,
    messageVi: isWinner
      ? `CHIẾN THẮNG TUYỆT ĐỐI! +${pointsAwarded} điểm tích lũy (+${victoryBonus} thưởng thắng trận)`
      : isDraw
      ? 'HÒA ĐIỂM! Trận đấu ngang tài ngang sức (+0 điểm)'
      : 'BẠN ĐÃ THUA TRẬN! Thua không nhận được điểm (+0 điểm)',
    messageEn: isWinner
      ? `VICTORY! +${pointsAwarded} total XP (+${victoryBonus} victory bonus)`
      : isDraw
      ? 'DRAW! A closely matched battle (+0 points)'
      : 'DEFEAT! No points earned for loss (+0 points)',
  };
}

export function getUserArenaProfile(userEmailOrId, defaultName = 'Đấu Sĩ') {
  const key = `mind_arena_profile_${userEmailOrId || 'guest'}`;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    userId: userEmailOrId || 'guest',
    name: defaultName,
    xp: 0,
    towerFloorsCleared: 0,
    duelWins: 0,
    duelLosses: 0,
    duelDraws: 0,
  };
}

export function saveUserArenaProfile(profile) {
  if (!profile || !profile.userId || typeof localStorage === 'undefined') return;
  const key = `mind_arena_profile_${profile.userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch {}
}

export function getNationalLeaderboard(currentUserProfile = null) {
  const baseContestants = [
    { name: 'Tuấn Kiệt', school: 'TH Ngô Mây (Bình Định)', avatar: '🦅', xp: 7420, level: 7, wins: 54, isBot: true },
    { name: 'Gia Hân', school: 'TH Châu Văn Liêm (Cần Thơ)', avatar: '🐼', xp: 4850, level: 6, wins: 42, isBot: true },
    { name: 'Hoàng Bách', school: 'TH Đinh Tiên Hoàng (Hải Phòng)', avatar: '🐯', xp: 2950, level: 5, wins: 33, isBot: true },
    { name: 'Thảo Nguyên', school: 'TH Nguyễn Du (TP.HCM)', avatar: '🐰', xp: 1650, level: 4, wins: 24, isBot: true },
    { name: 'Bảo Nam', school: 'TH Chu Văn An (Hà Nội)', avatar: '🦊', xp: 920, level: 3, wins: 15, isBot: true },
    { name: 'Minh Khôi', school: 'TH Lê Quý Đôn (Đà Nẵng)', avatar: '🦁', xp: 480, level: 2, wins: 8, isBot: true },
    { name: 'Khánh An', school: 'TH Phan Chu Trinh (Huế)', avatar: '🦄', xp: 320, level: 2, wins: 5, isBot: true },
    { name: 'Hải Đăng', school: 'TH Lý Tự Trọng (Nha Trang)', avatar: '🐬', xp: 190, level: 1, wins: 3, isBot: true },
  ];

  let list = baseContestants.map((c) => ({
    ...c,
    levelInfo: calculatePlayerLevel(c.xp),
    isUser: false,
  }));

  if (currentUserProfile) {
    list.push({
      name: currentUserProfile.name || 'Bạn',
      school: 'Mind Phoenix Arena',
      avatar: '👑',
      xp: currentUserProfile.xp || 0,
      level: calculatePlayerLevel(currentUserProfile.xp || 0).level,
      wins: currentUserProfile.duelWins || 0,
      levelInfo: calculatePlayerLevel(currentUserProfile.xp || 0),
      isUser: true,
    });
  }

  list.sort((a, b) => b.xp - a.xp);

  return list.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));
}
