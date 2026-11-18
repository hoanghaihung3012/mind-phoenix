/**
 * Minigame challenges inside Học Viện Phú Thọ
 * Dựa trên cấu trúc chuẩn từ nguồn học liệu Trường Tiểu học Phú Thọ:
 * Từ vựng, Chính tả, Ngữ văn, Thành ngữ, Toán học, Đấu trường 60s và Đại hội Tri thức.
 */

export const MINIGAME_DATA = {
  // 1. Thư viện Từ vựng (Vocabulary Treasure)
  vocabulary: {
    title: 'Thư Viện Từ Vựng Tri Thức 📚',
    instructions: 'Khám phá từ đồng nghĩa, từ trái nghĩa, từ ghép và từ láy để nhận 25 Xu & 30 XP!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      {
        question: 'Từ nào sau đây là TỪ LÁY tượng thanh mô tả tiếng chim kêu?',
        options: ['Ríu rít', 'Rì rầm', 'Thầm thì', 'Ồn ào'],
        answer: 0,
        explanation: '“Ríu rít” là từ láy mô tả tiếng chim hót vui vẻ rộn ràng.'
      },
      {
        question: 'Cặp từ nào dưới đây là cặp TỪ TRÁI NGHĨA?',
        options: ['Chăm chỉ - Siêng năng', 'Dũng cảm - Hèn nhát', 'Thông minh - Sáng dạ', 'Hiền lành - Nhân hậu'],
        answer: 1,
        explanation: '“Dũng cảm” đối lập hoàn toàn về nghĩa với “Hèn nhát”.'
      },
      {
        question: 'Từ nào sau đây là TỪ GHÉP tổng hợp?',
        options: ['Sách vở', 'Sách Toán', 'Xe đạp', 'Bút bi'],
        answer: 0,
        explanation: '“Sách vở” gộp chung tất cả các loại sách và vở, là từ ghép tổng hợp.'
      },
      {
        question: 'Tìm từ ĐỒNG NGHĨA với từ “bao la”:',
        options: ['Mênh mông', 'Chật hẹp', 'Bé nhỏ', 'Ngắn ngủi'],
        answer: 0,
        explanation: '“Bao la” đồng nghĩa với “mênh mông”, “bát ngát”.'
      },
      {
        question: 'Tiếng “nhân” trong từ nào dưới đây có nghĩa là “lòng thương người”?',
        options: ['Nhân dân', 'Nhân ái', 'Nhân công', 'Nhân tài'],
        answer: 1,
        explanation: '“Nhân ái” là lòng yêu thương con người; “nhân” ở đây nghĩa là lòng nhân từ.'
      },
      {
        question: 'Từ nào sau đây là TỪ GHÉP phân loại?',
        options: ['Xe đạp', 'Quần áo', 'Bàn ghế', 'Cây cối'],
        answer: 0,
        explanation: '“Xe đạp” chỉ một loại phương tiện cụ thể phân biệt với xe máy, xe hơi.'
      },
      {
        question: 'Từ láy nào dưới đây là từ láy tượng hình mô tả dáng đi?',
        options: ['Lom khom', 'Ào ào', 'Tí tách', 'Loảng xoảng'],
        answer: 0,
        explanation: '“Lom khom” gợi tả dáng người hơi còng lưng khi di chuyển hoặc làm việc.'
      },
      {
        question: 'Cặp từ nào dưới đây là cặp TỪ ĐỒNG NGHĨA?',
        options: ['Chăm chỉ - Cần cù', 'Cao lớn - Bé nhỏ', 'Nhanh nhẹn - Chậm chạp', 'Rộng rãi - Chật hẹp'],
        answer: 0,
        explanation: '“Chăm chỉ” và “Cần cù” cùng chỉ đức tính siêng năng chịu khó.'
      },
      {
        question: 'Từ “mắt” trong trường hợp nào dưới đây được dùng theo NGHĨA CHUYỂN?',
        options: ['Quả na mở mắt', 'Mắt em bé sáng ngời', 'Đôi mắt tinh tường', 'Nhắm mắt ngủ ngon'],
        answer: 0,
        explanation: '“Mắt” của quả na là kẽ hở giữa các múi na, là nghĩa chuyển dựa trên sự tương đồng hình dáng.'
      },
      {
        question: 'Tiếng “đồng” trong từ nào dưới đây có nghĩa là “cùng nhau, cùng một lòng”?',
        options: ['Đồng lòng', 'Đồng ruộng', 'Đồng hồ', 'Đồng tiền'],
        answer: 0,
        explanation: '“Đồng lòng” nghĩa là cùng chung một ý chí và suy nghĩ.'
      },
      {
        question: 'Từ nào sau đây là TỪ LÁY toàn bộ?',
        options: ['Xanh xanh', 'Xanh ngắt', 'Xanh lơ', 'Xanh xao'],
        answer: 0,
        explanation: '“Xanh xanh” lặp lại hoàn toàn cả âm đầu, vần và thanh điệu.'
      },
      {
        question: 'Từ nào sau đây chỉ PHẨM CHẤT đáng quý của học sinh?',
        options: ['Trung thực', 'Cao ráo', 'Khỏe khoắn', 'Trắng trẻo'],
        answer: 0,
        explanation: '“Trung thực” là đức tính thành thật, không gian dối.'
      },
      {
        question: 'Từ nào dưới đây là TỪ TRÁI NGHĨA với “tiết kiệm”?',
        options: ['Lãng phí', 'Kín đáo', 'Cẩn thận', 'Chăm sóc'],
        answer: 0,
        explanation: '“Lãng phí” tiêu xài bừa bãi, đối lập với “tiết kiệm”.'
      },
      {
        question: 'Từ Hán - Việt nào dưới đây đồng nghĩa với cụm từ “đất nước, non sông”?',
        options: ['Sơn hà', 'Hải cảng', 'Phong cảnh', 'Địa lý'],
        answer: 0,
        explanation: '“Sơn hà” (núi sông) là từ Hán - Việt chỉ đất nước thiêng liêng.'
      }
    ]
  },

  // 2. Khu Chính Tả (Spelling Pavilion)
  spelling: {
    title: 'Khu Chính Tả Tiếng Việt ✏️',
    instructions: 'Soi lỗi chính tả, chọn cách viết chuẩn xác nhất tiếng Việt!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      {
        question: 'Chọn từ viết ĐÚNG chính tả:',
        options: ['Xinh đẹp', 'Sinh đẹp', 'Xinh đệp', 'Sinh đệp'],
        answer: 0,
        explanation: '“Xinh đẹp” là từ chuẩn chính tả: “xinh” viết với x.'
      },
      {
        question: 'Từ nào sau đây viết ĐÚNG chính tả khi phân biệt s/x?',
        options: ['Sáng sủa', 'Xáng sủa', 'Sáng xủa', 'Xáng xủa'],
        answer: 0,
        explanation: '“Sáng sủa” là cách viết đúng: cả hai tiếng đều viết bằng s.'
      },
      {
        question: 'Chọn từ viết ĐÚNG chính tả khi phân biệt ch/tr:',
        options: ['Chăm chỉ', 'Trăm chỉ', 'Chăm chỉa', 'Trăm trỉ'],
        answer: 0,
        explanation: '“Chăm chỉ” viết bằng chữ ch.'
      },
      {
        question: 'Từ nào sau đây viết ĐÚNG chính tả khi phân biệt dấu hỏi / ngã?',
        options: ['Dũng cảm', 'Dủng cảm', 'Dũng cãm', 'Dủng cãm'],
        answer: 0,
        explanation: '“Dũng cảm”: “dũng” viết dấu ngã, “cảm” viết dấu hỏi.'
      },
      {
        question: 'Chọn từ viết ĐÚNG chính tả:',
        options: ['Xôn xao', 'Sôn sao', 'Xôn sao', 'Sôn xao'],
        answer: 0,
        explanation: '“Xôn xao” là từ tượng thanh viết với âm đầu x.'
      },
      {
        question: 'Chọn từ viết ĐÚNG chính tả khi phân biệt l/n:',
        options: ['Nỗ lực', 'Lỗ lực', 'Nỗ nực', 'Lỗ nực'],
        answer: 0,
        explanation: '“Nỗ lực” bắt đầu bằng âm n (nỗ) và âm l (lực).'
      },
      {
        question: 'Từ nào dưới đây viết ĐÚNG quy tắc c/k/q trước các nguyên âm i, e, ê?',
        options: ['Kiên trì', 'Ciên trì', 'Qiên trì', 'Kiêng chì'],
        answer: 0,
        explanation: 'Trước nguyên âm i, e, ê, âm /k/ phải viết bằng chữ k.'
      },
      {
        question: 'Chọn cách viết ĐÚNG chính tả phân biệt d/gi/r:',
        options: ['Gìn giữ', 'Dìn dững', 'Rìn rữ', 'Gìn dững'],
        answer: 0,
        explanation: '“Gìn giữ” cả hai tiếng đều viết bằng chữ gi.'
      },
      {
        question: 'Từ nào dưới đây viết ĐÚNG chính tả khi phân biệt dấu hỏi / ngã?',
        options: ['Suy nghĩ', 'Suy nghỉ', 'Xuy nghĩ', 'Xuy nghỉ'],
        answer: 0,
        explanation: '“Suy nghĩ”: tiếng “nghĩ” mang dấu ngã.'
      },
      {
        question: 'Chọn cặp từ viết ĐÚNG chính tả khi phân biệt tr/ch:',
        options: ['Trung thực', 'Chung thực', 'Trung thụt', 'Chung trật'],
        answer: 0,
        explanation: '“Trung thực” (thành thật) viết bằng âm đầu tr.'
      },
      {
        question: 'Chọn từ viết ĐÚNG chính tả phân biệt s/x:',
        options: ['Sắp xếp', 'Xắp xếp', 'Sắp sếp', 'Xắp xếch'],
        answer: 0,
        explanation: '“Sắp xếp”: “sắp” viết s, “xếp” viết x.'
      },
      {
        question: 'Từ nào sau đây viết ĐÚNG chính tả khi phân biệt iu/iêu:',
        options: ['Dịu dàng', 'Diệu dàng', 'Dịu giàng', 'Diệu giàng'],
        answer: 0,
        explanation: '“Dịu dàng” viết bằng vần iu.'
      },
      {
        question: 'Chọn từ viết ĐÚNG chính tả khi phân biệt ao/au:',
        options: ['Lau chùi', 'Lao chùi', 'Lau chuyền', 'Lao chuyền'],
        answer: 0,
        explanation: '“Lau chùi” (làm sạch bụi bẩn) viết bằng vần au.'
      },
      {
        question: 'Từ nào dưới đây viết ĐÚNG chính tả:',
        options: ['Bâng khuâng', 'Bân khưng', 'Bâng khâng', 'Bân khuân'],
        answer: 0,
        explanation: '“Bâng khuâng” gợi tả cảm xúc xao xuyến, viết bằng vần âng và uâng.'
      }
    ]
  },

  // 3. Nhà Ngữ Văn (Sentence Builder)
  literature: {
    title: 'Nhà Ngữ Văn & Ghép Câu 📜',
    instructions: 'Nhận diện thành phần câu Chủ ngữ - Vị ngữ và biện pháp tu từ nghệ thuật!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      {
        question: 'Trong câu: “Những chú chim hót ríu rít trên cành bàng.”, bộ phận CHỦ NGỮ là gì?',
        options: ['Những chú chim', 'hót ríu rít', 'trên cành bàng', 'Những chú chim hót'],
        answer: 0,
        explanation: '“Những chú chim” trả lời cho câu hỏi “Con gì?”.'
      },
      {
        question: 'Câu nào sau đây sử dụng biện pháp nghệ thuật NHÂN HÓA?',
        options: [
          'Chị gió nhẹ nhàng lướt qua tán lá cây.',
          'Bông hoa hồng nở rất đẹp.',
          'Mặt trời đỏ rực như quả cầu lửa.',
          'Cây bàng cao lớn trong sân trường.'
        ],
        answer: 0,
        explanation: 'Gọi gió là “chị” và gán hành động “lướt qua” là biện pháp nhân hóa.'
      },
      {
        question: 'Câu nào dưới đây là CÂU KỂ “Ai làm gì?”?',
        options: [
          'Các bạn học sinh đang cùng nhau dọn dẹp sân trường.',
          'Trường Tiểu học Phú Thọ rất khang trang và sạch đẹp.',
          'Bạn Minh là học sinh gương mẫu của lớp 4A.',
          'Bầu trời mùa thu trong xanh vời vợi.'
        ],
        answer: 0,
        explanation: 'Vị ngữ “đang cùng nhau dọn dẹp sân trường” nêu hoạt động của người.'
      },
      {
        question: 'Xác định TRẠNG NGỮ trong câu: “Sáng sớm hôm nay, em hân hoan bước vào cổng trường Phú Thọ.”',
        options: ['Sáng sớm hôm nay', 'em hân hoan', 'bước vào cổng trường', 'cổng trường Phú Thọ'],
        answer: 0,
        explanation: '“Sáng sớm hôm nay” là trạng ngữ chỉ thời gian.'
      },
      {
        question: 'Câu nào dưới đây sử dụng biện pháp nghệ thuật SO SÁNH?',
        options: [
          'Mặt trăng tròn vành vạnh như chiếc đĩa ngọc.',
          'Bác bàng già đứng sừng sững giữa sân trường.',
          'Gió thổi rì rào qua rặng tre xanh.',
          'Em rất yêu quý ngôi trường thân yêu của mình.'
        ],
        answer: 0,
        explanation: 'Có từ so sánh “như” liên kết giữa “mặt trăng tròn” và “chiếc đĩa ngọc”.'
      },
      {
        question: 'Trong câu: “Trường Tiểu học Phú Thọ rất khang trang và sạch đẹp.”, bộ phận VỊ NGỮ là:',
        options: ['rất khang trang và sạch đẹp', 'Trường Tiểu học', 'Phú Thọ', 'sạch đẹp'],
        answer: 0,
        explanation: '“rất khang trang và sạch đẹp” trả lời cho câu hỏi “Thế nào?”.'
      },
      {
        question: 'Câu nào dưới đây là CÂU CẢM THÁN bộc lộ cảm xúc vui mừng?',
        options: [
          'Ôi, vườn hoa trường mình rực rỡ biết bao!',
          'Hôm nay chúng em học môn Tiếng Việt.',
          'Bạn có muốn cùng chơi cầu lông không?',
          'Xin mời các bạn vào lớp học bài.'
        ],
        answer: 0,
        explanation: 'Câu cảm thán có từ ngữ bộc lộ cảm xúc “Ôi... biết bao!” và dấu chấm than.'
      },
      {
        question: 'Xác định TRẠNG NGỮ CHỈ NƠI CHỐN trong câu: “Dưới bóng râm cây phượng vĩ, chúng em cùng nhau đọc sách.”',
        options: ['Dưới bóng râm cây phượng vĩ', 'chúng em', 'cùng nhau', 'đọc sách'],
        answer: 0,
        explanation: '“Dưới bóng râm cây phượng vĩ” trả lời cho câu hỏi “Ở đâu?”.'
      },
      {
        question: 'Cặp quan hệ từ trong câu: “Vì bạn An chăm chỉ ôn bài nên bạn đã đạt điểm mười.” biểu thị quan hệ gì?',
        options: ['Nguyên nhân - Kết quả', 'Điều kiện - Kết quả', 'Tương phản', 'Tăng tiến'],
        answer: 0,
        explanation: 'Cặp quan hệ từ “Vì ... nên ...” biểu thị quan hệ Nguyên nhân - Kết quả.'
      },
      {
        question: 'Câu nào sau đây là CÂU CẦU KHIẾN?',
        options: [
          'Chúng mình hãy cùng nhau giữ gìn vệ sinh trường lớp nhé!',
          'Trường học của em rất đẹp.',
          'Ai là người tưới nước cho cây?',
          'Trời hôm nay mát mẻ quá!'
        ],
        answer: 0,
        explanation: 'Có từ cầu khiến “hãy... nhé!” dùng để khuyên nhủ, kêu gọi hành động.'
      },
      {
        question: 'Dấu hai chấm trong câu sau có tác dụng gì: “Cô giáo dặn cả lớp: Các em hãy nhớ chuẩn bị bài chu đáo.”',
        options: ['Báo hiệu lời nói trực tiếp của nhân vật', 'Giải thích cho bộ phận đứng trước', 'Để liệt kê sự vật', 'Kết thúc câu'],
        answer: 0,
        explanation: 'Dấu hai chấm báo hiệu lời nói trực tiếp của cô giáo.'
      },
      {
        question: 'Câu nào dưới đây là CÂU KỂ “Ai là gì?”?',
        options: [
          'Trường Tiểu học Phú Thọ là ngôi nhà thứ hai của chúng em.',
          'Các bạn đang tập thể dục buổi sáng.',
          'Sân trường rợp bóng cây xanh mát.',
          'Em chăm chỉ làm bài tập về nhà.'
        ],
        answer: 0,
        explanation: 'Vị ngữ nối với chủ ngữ bằng từ “là” dùng để giới thiệu, nhận định.'
      },
      {
        question: 'Biện pháp tu từ nào được sử dụng trong câu: “Tre giữ làng, giữ nước, giữ mái nhà tranh, giữ đồng lúa chín.”?',
        options: ['Điệp từ (lặp lại từ “giữ”)', 'So sánh', 'Nói quá', 'Ẩn dụ'],
        answer: 0,
        explanation: 'Từ “giữ” được lặp lại nhiều lần tạo nhịp điệu và nhấn mạnh sức mạnh bảo vệ quê hương của cây tre.'
      }
    ]
  },

  // 4. Quảng Trường Thành Ngữ (Idiom Plaza)
  idiom: {
    title: 'Quảng Trường Thành Ngữ Tục Ngữ 🧩',
    instructions: 'Khám phá kho tàng ca dao, tục ngữ và bài học quý báu của cha ông!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      {
        question: 'Điền từ còn thiếu vào câu tục ngữ: “Có công mài sắt, có ngày ______”',
        options: ['nên kim', 'nên vàng', 'thành công', 'có thưởng'],
        answer: 0,
        explanation: '“Có công mài sắt, có ngày nên kim” khuyên chúng ta kiên trì và bền chí.'
      },
      {
        question: 'Hoàn thành câu tục ngữ: “Uống nước nhớ ______”',
        options: ['nguồn', 'sông', 'mưa', 'ao'],
        answer: 0,
        explanation: '“Uống nước nhớ nguồn” nhắc nhở lòng biết ơn cội nguồn, tổ tiên.'
      },
      {
        question: 'Điền từ thích hợp: “Lá lành đùm lá ______”',
        options: ['rách', 'vàng', 'rơi', 'khô'],
        answer: 0,
        explanation: '“Lá lành đùm lá rách” thể hiện tinh thần tương thân tương ái của người Việt.'
      },
      {
        question: 'Câu thành ngữ nào mang ý nghĩa “đoàn kết một lòng thì làm việc gì cũng thành công”?',
        options: [
          'Đồng sức đồng lòng',
          'Đứng núi này trông núi nọ',
          'Được đằng chân lân đằng đầu',
          'Đầu voi đuôi chuột'
        ],
        answer: 0,
        explanation: '“Đồng sức đồng lòng” nghĩa là cùng hợp sức, đoàn kết một ý chí.'
      },
      {
        question: 'Điền từ còn thiếu: “Ăn quả nhớ kẻ ______”',
        options: ['trồng cây', 'hái quả', 'bán quả', 'mua quả'],
        answer: 0,
        explanation: '“Ăn quả nhớ kẻ trồng cây” răn dạy lòng biết ơn người đã cống hiến tạo dựng.'
      },
      {
        question: 'Hoàn thành câu tục ngữ khuyên học hỏi từ bạn bè: “Học thầy không tày học ______”',
        options: ['bạn', 'sách', 'anh', 'người'],
        answer: 0,
        explanation: '“Học thầy không tày học bạn” nhắc nhở học hỏi giao lưu cùng bạn bè xung quanh.'
      },
      {
        question: 'Điền từ còn thiếu: “Đi một ngày đàng, học một sàng ______”',
        options: ['khôn', 'chữ', 'vàng', 'gạo'],
        answer: 0,
        explanation: '“Đi một ngày đàng, học một sàng khôn” khuyên mở rộng tầm nhìn, tích lũy kiến thức.'
      },
      {
        question: 'Hoàn thành câu ca dao: “Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong ______ chảy ra”',
        options: ['nguồn', 'khe', 'suối', 'sông'],
        answer: 0,
        explanation: 'Công ơn cha mẹ vô bờ bến không bao giờ vơi cạn.'
      },
      {
        question: 'Khẩu hiệu truyền thống nào thường thấy ở trường học nhắc nhở đạo đức đi trước học thức?',
        options: ['Tiên học lễ, hậu học văn', 'Học đi đôi với hành', 'Vạn sự khởi đầu nan', 'Học thầy học bạn'],
        answer: 0,
        explanation: '“Tiên học lễ, hậu học văn” dạy học sinh học lễ nghĩa đạo làm người trước khi học văn hóa.'
      },
      {
        question: 'Câu tục ngữ nào khuyên chúng ta nên chọn bạn tốt để noi theo?',
        options: ['Gần mực thì đen, gần đèn thì rạng', 'Nước chảy đá mòn', 'Môi hở răng lạnh', 'Tai vách mạch rừng'],
        answer: 0,
        explanation: '“Gần mực thì đen, gần đèn thì rạng” nói về ảnh hưởng của môi trường và bạn bè đối với con người.'
      },
      {
        question: 'Điền từ vào câu ca dao về thầy cô: “Muốn sang thì bắc cầu kiều / Muốn con hay chữ thì yêu lấy ______”',
        options: ['thầy', 'trường', 'sách', 'bạn'],
        answer: 0,
        explanation: 'Thể hiện truyền thống tôn sư trọng đạo của dân tộc ta.'
      },
      {
        question: 'Hoàn thành câu ca dao kết đoàn: “Bầu ơi thương lấy bí cùng / Tuy rằng khác giống nhưng chung một ______”',
        options: ['giàn', 'vườn', 'nhà', 'cây'],
        answer: 0,
        explanation: 'Nhắc nhở đồng bào cùng sống chung một mái nhà non sông phải luôn đùm bọc lẫn nhau.'
      },
      {
        question: 'Câu thành ngữ nào ca ngợi sự kiên trì vượt khó trước thử thách?',
        options: [
          'Chớ thấy sóng cả mà ngã tay chèo',
          'Đứng núi này trông núi nọ',
          'Qua cầu rút ván',
          'Cưỡi ngựa xem hoa'
        ],
        answer: 0,
        explanation: 'Khuyên không nên nản lòng lùi bước trước khó khăn gian khổ.'
      },
      {
        question: 'Điền từ vào câu khuyên răn về giao tiếp: “Lời nói chẳng mất tiền mua / Lựa lời mà nói cho ______ lòng nhau”',
        options: ['vừa', 'ấm', 'đẹp', 'hài'],
        answer: 0,
        explanation: 'Khuyên dùng lời lẽ hòa nhã, lịch thiệp và tôn trọng khi trò chuyện.'
      }
    ]
  },

  // 5. Vườn Toán Học (Math Garden)
  math: {
    title: 'Vườn Toán Học & Chuỗi Số Logic 🧮',
    instructions: 'Thử tài tính nhẩm nhanh nhẹn, hình học không gian và chuỗi số quy luật!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      {
        question: 'Tìm số tiếp theo trong dãy quy luật: 4, 8, 16, 32, ...?',
        options: ['64', '48', '56', '60'],
        answer: 0,
        explanation: 'Quy luật nhân đôi: 32 × 2 = 64.'
      },
      {
        question: 'Một mảnh vườn chữ nhật có chiều dài 18m, chiều rộng 12m. Chu vi mảnh vườn là:',
        options: ['60m', '54m', '72m', '216m'],
        answer: 0,
        explanation: 'Chu vi = (18 + 12) × 2 = 30 × 2 = 60m.'
      },
      {
        question: 'Tính nhanh: 125 × 7 × 8 = ?',
        options: ['7000', '6000', '8000', '7500'],
        answer: 0,
        explanation: '(125 × 8) × 7 = 1000 × 7 = 7000.'
      },
      {
        question: 'Số nào chia hết cho cả 2, 3 và 5?',
        options: ['90', '75', '80', '65'],
        answer: 0,
        explanation: '90 có tận cùng là 0 (chia hết cho 2 và 5), tổng chữ số 9+0=9 (chia hết cho 3).'
      },
      {
        question: 'Tìm số trung bình cộng của ba số: 24, 28 và 38:',
        options: ['30', '29', '32', '31'],
        answer: 0,
        explanation: 'Trung bình cộng = (24 + 28 + 38) : 3 = 90 : 3 = 30.'
      },
      {
        question: 'Một hình vuông có cạnh dài 15 cm. Diện tích của hình vuông đó là:',
        options: ['225 cm²', '60 cm²', '150 cm²', '200 cm²'],
        answer: 0,
        explanation: 'Diện tích hình vuông = cạnh × cạnh = 15 × 15 = 225 cm².'
      },
      {
        question: 'Dãy số cách đều: 5, 10, 15, 20, 25... Số thứ 10 của dãy số này là:',
        options: ['50', '45', '55', '60'],
        answer: 0,
        explanation: 'Số thứ 10 = 5 × 10 = 50.'
      },
      {
        question: 'Đổi đơn vị đo khối lượng: 3 tấn 5 tạ bằng bao nhiêu ki-lô-gam?',
        options: ['3500 kg', '3050 kg', '350 kg', '35000 kg'],
        answer: 0,
        explanation: '3 tấn = 3000 kg; 5 tạ = 500 kg. 3000 + 500 = 3500 kg.'
      },
      {
        question: 'Rút gọn phân số 18/24 về phân số tối giản:',
        options: ['3/4', '2/3', '9/12', '4/5'],
        answer: 0,
        explanation: 'Chia cả tử và mẫu cho 6: 18:6 = 3, 24:6 = 4 => phân số tối giản 3/4.'
      },
      {
        question: 'Tính nhẩm nhanh phép nhân với 11: 45 × 11 = ?',
        options: ['495', '485', '505', '475'],
        answer: 0,
        explanation: 'Mẹo nhân 11: viết 4 và 5 ở hai đầu, ở giữa là 4 + 5 = 9 => 495.'
      },
      {
        question: 'Một lớp có 35 học sinh, số bạn nữ chiếm 3/5 số học sinh cả lớp. Lớp đó có bao nhiêu bạn nữ?',
        options: ['21 bạn', '20 bạn', '18 bạn', '15 bạn'],
        answer: 0,
        explanation: 'Số bạn nữ = 35 × 3 : 5 = 21 bạn.'
      },
      {
        question: '2 giờ 15 phút đổi ra phút bằng bao nhiêu phút?',
        options: ['135 phút', '125 phút', '145 phút', '150 phút'],
        answer: 0,
        explanation: '2 giờ = 120 phút. 120 + 15 = 135 phút.'
      },
      {
        question: 'Tìm x biết: x : 8 = 125 (dư 3)?',
        options: ['1003', '1000', '1025', '1035'],
        answer: 0,
        explanation: 'x = 125 × 8 + 3 = 1000 + 3 = 1003.'
      },
      {
        question: 'Số tự nhiên bé nhất có 5 chữ số khác nhau là:',
        options: ['10234', '10000', '12345', '10243'],
        answer: 0,
        explanation: 'Chữ số đầu tiên khác 0 bé nhất là 1, tiếp theo là 0, 2, 3, 4 => 10234.'
      }
    ]
  },

  // 6. Đấu Trường 60 Giây (Speed Arena)
  arena: {
    title: 'Đấu Trường Thử Thách 60 Giây ⚡',
    instructions: 'Phản xạ nhanh như chớp với các câu đố đa lĩnh vực Toán - Văn - Khoa học!',
    rewardCoins: 35,
    rewardXP: 45,
    questions: [
      {
        question: 'Tỉnh Phú Thọ nổi tiếng với lễ hội truyền thống nào lớn nhất cả nước vào mùng 10 tháng 3 âm lịch?',
        options: ['Lễ hội Đền Hùng', 'Lễ hội Chùa Hương', 'Lễ hội Đền Trần', 'Hội Lim'],
        answer: 0,
        explanation: '“Dù ai đi ngược về xuôi / Nhớ ngày Giỗ Tổ mùng mười tháng ba” - Đền Hùng, Phú Thọ.'
      },
      {
        question: 'Đố vui: Cái gì chặt không đứt, bứt không rời, phơi không khô, nấu không chín?',
        options: ['Nước', 'Sợi chỉ', 'Tóc', 'Đá'],
        answer: 0,
        explanation: 'Dòng nước chảy không thể chặt đứt hay bứt rời.'
      },
      {
        question: '1 ngày và 6 giờ bằng bao nhiêu giờ?',
        options: ['30 giờ', '24 giờ', '28 giờ', '36 giờ'],
        answer: 0,
        explanation: '1 ngày = 24 giờ. 24 + 6 = 30 giờ.'
      },
      {
        question: 'Từ nào viết ĐÚNG: “gọn gàng” hay “gọn gàn”?',
        options: ['Gọn gàng', 'Gọn gàn', 'Cả hai đều đúng', 'Cả hai đều sai'],
        answer: 0,
        explanation: '“Gọn gàng” là từ láy chuẩn chính tả.'
      },
      {
        question: 'Điệu hát dân ca di sản văn hóa phi vật thể đại diện của nhân loại tại tỉnh Phú Thọ là gì?',
        options: ['Hát Xoan', 'Hát Quan Họ', 'Hát Chèo', 'Hát Ca Trù'],
        answer: 0,
        explanation: 'Hát Xoan Phú Thọ là di sản văn hóa phi vật thể quý báu được UNESCO vinh danh.'
      },
      {
        question: 'Đặc sản quả bưởi thơm ngọt nổi danh của tỉnh Phú Thọ là giống bưởi nào?',
        options: ['Bưởi Đoan Hùng', 'Bưởi Năm Roi', 'Bưởi Da Xanh', 'Bưởi Diễn'],
        answer: 0,
        explanation: 'Bưởi Đoan Hùng (Phú Thọ) nổi tiếng với tép bưởi mọng nước và hương thơm ngát dịu ngọt.'
      },
      {
        question: 'Đố vui: Con gì chân ngắn mà lại có màng, mỏ bẹt màu vàng, hay kêu cạp cạp?',
        options: ['Con vịt', 'Con gà', 'Con ngan', 'Con ngỗng'],
        answer: 0,
        explanation: 'Chú vịt con chân có màng bơi lội và tiếng kêu cạp cạp.'
      },
      {
        question: 'Thành phố Việt Trì thuộc tỉnh Phú Thọ nằm tại ngã ba của những dòng sông nào?',
        options: ['Sông Hồng, Sông Lô, Sông Đà', 'Sông Mã, Sông Chu', 'Sông Hương, Sông Gianh', 'Sông Đồng Nai, Sông Sài Gòn'],
        answer: 0,
        explanation: 'Thành phố Ngã ba sông Việt Trì nơi hội tụ sông Hồng (Thao), sông Lô và sông Đà.'
      },
      {
        question: 'Năm nhuận theo Dương lịch có tất cả bao nhiêu ngày?',
        options: ['366 ngày', '365 ngày', '364 ngày', '360 ngày'],
        answer: 0,
        explanation: 'Năm nhuận có thêm ngày 29 tháng 2 nên có tổng cộng 366 ngày.'
      },
      {
        question: 'Loài thú nào chạy nhanh nhất trên cạn hiện nay?',
        options: ['Báo săn Cheetah', 'Sư tử', 'Ngựa vằn', 'Chó sói'],
        answer: 0,
        explanation: 'Báo săn Cheetah có thể đạt tốc độ hơn 100 km/h trong thời gian ngắn.'
      },
      {
        question: 'Đố vui: Cây gì nghiêng bóng sân trường, mùa hè hoa nở đỏ rực gọi ve sầu?',
        options: ['Cây phượng vĩ', 'Cây bàng', 'Cây xà cừ', 'Cây đa'],
        answer: 0,
        explanation: 'Hoa phượng đỏ thắm gắn liền với tuổi học trò và mùa hè sôi động.'
      },
      {
        question: 'Tính nhanh: 15 × 6 = ?',
        options: ['90', '80', '85', '95'],
        answer: 0,
        explanation: '15 × 6 = 90.'
      },
      {
        question: 'Khí nào chiếm tỉ lệ thể tích lớn nhất trong bầu không khí Trái Đất?',
        options: ['Khí Nitơ', 'Khí Ô-xi', 'Khí Các-bô-níc', 'Khí Hi-đrô'],
        answer: 0,
        explanation: 'Khí Nitơ chiếm khoảng 78% thể tích bầu khí quyển Trái Đất.'
      },
      {
        question: 'Đố chữ: Để nguyên lấp lánh trên trời / Bớt đầu thành chỗ đón người bạn thân là chữ gì?',
        options: ['Sao - Ao', 'Trăng - Răng', 'Mây - Cây', 'Nắng - Lắng'],
        answer: 0,
        explanation: 'Ngôi sao (trên trời) bớt chữ S thành cái “Ao” (đón bạn thân).'
      }
    ]
  },

  // 7. KHU VỰC ĐẶC BIỆT: ĐẠI HỘI TRI THỨC (Grand Hall of Wisdom)
  grand: {
    title: '👑 ĐẠI HỘI TRI THỨC HỌC VIỆN PHÚ THỌ 🌟',
    instructions: 'Khu vực khảo thí tinh hoa đỉnh cao! Trả lời đúng các câu hỏi Olympic để mở khóa Áo Choàng Thủ Lĩnh và nhận 100 Xu & 120 XP!',
    rewardCoins: 100,
    rewardXP: 120,
    questions: [
      {
        question: 'Olympic Phú Thọ: Địa danh lịch sử Đền Hùng tọa lạc trên ngọn núi có tên là gì?',
        options: ['Núi Nghĩa Lĩnh', 'Núi Ba Vì', 'Núi Yên Tử', 'Núi Tam Đảo'],
        answer: 0,
        explanation: 'Khu di tích lịch sử Quốc gia đặc biệt Đền Hùng nằm trên núi Nghĩa Lĩnh, TP Việt Trì, Phú Thọ.'
      },
      {
        question: 'Olympic Tiếng Việt: Trong bài thơ “Hạt gạo làng ta” của Trần Đăng Khoa, hạt gạo có những vị gì?',
        options: [
          'Vị phù sa, hương sen thơm, lời mẹ hát',
          'Vị mưa rào, nắng gắt, hương lúa',
          'Vị ngọt ngào, cay đắng, gió bão',
          'Vị đồng quê, dòng sông, mồ hôi'
        ],
        answer: 0,
        explanation: '“Hạt gạo làng ta / Có vị phù sa / Của sông Kinh Thầy / Có hương sen thơm / Trong hồ nước đầy / Có lời mẹ hát...”.'
      },
      {
        question: 'Olympic Toán: Trung bình cộng của ba số là 45. Số thứ nhất là 38, số thứ hai là 42. Số thứ ba là bao nhiêu?',
        options: ['55', '50', '60', '48'],
        answer: 0,
        explanation: 'Tổng ba số = 45 × 3 = 135. Số thứ ba = 135 - (38 + 42) = 135 - 80 = 55.'
      },
      {
        question: 'Olympic Khoa Học: Tại sao lá cây hầu hết lại có màu xanh lục?',
        options: [
          'Do có chất diệp lục hấp thụ ánh sáng để quang hợp',
          'Do hút nước có màu xanh từ rễ',
          'Do phản chiếu màu của bầu trời',
          'Do tác động của không khí'
        ],
        answer: 0,
        explanation: 'Chất diệp lục trong lục lạp của tế bào thực vật tạo nên màu xanh tươi mát của lá.'
      },
      {
        question: 'Olympic Tiếng Anh: "Phu Tho Primary School is a ________ and modern school with green trees and cheerful friends."',
        options: ['spacious', 'tiny', 'narrow', 'messy'],
        answer: 0,
        explanation: '“spacious” nghĩa là rộng rãi, khang trang.'
      },
      {
        question: 'Olympic Lịch Sử: Theo truyền thuyết, vị vua đầu tiên sáng lập nhà nước Văn Lang đóng đô tại Phong Châu (Phú Thọ) là ai?',
        options: ['Hùng Vương thứ nhất (Kinh Dương Vương)', 'An Dương Vương', 'Lạc Long Quân', 'Ngô Quyền'],
        answer: 0,
        explanation: 'Các Vua Hùng đóng đô tại Phong Châu, mở đầu thời đại dựng nước hào hùng của dân tộc.'
      },
      {
        question: 'Olympic Toán: Cho dãy số: 1, 3, 6, 10, 15, 21, ... Số hạng tiếp theo của dãy là số nào?',
        options: ['28', '27', '26', '30'],
        answer: 0,
        explanation: 'Khoảng cách giữa các số tăng dần: +2, +3, +4, +5, +6, +7. Vậy 21 + 7 = 28.'
      },
      {
        question: 'Olympic Tiếng Việt: Hai câu thơ: “Thân em vừa trắng lại vừa tròn / Bảy nổi ba chìm với nước non” của Hồ Xuân Hương viết về món bánh truyền thống nào?',
        options: ['Bánh trôi nước', 'Bánh chưng', 'Bánh tét', 'Bánh giầy'],
        answer: 0,
        explanation: 'Bài thơ “Bánh trôi nước” mượn hình ảnh chiếc bánh trôi để ca ngợi vẻ đẹp và phẩm giá người phụ nữ.'
      },
      {
        question: 'Olympic Khoa Học: Bộ phận nào của thực vật có chức năng chính là hút nước và chất khoáng hòa tan từ lòng đất?',
        options: ['Rễ cây', 'Thân cây', 'Lá cây', 'Hoa'],
        answer: 0,
        explanation: 'Rễ cây đâm sâu vào lòng đất với các lông hút giúp hấp thu nước và khoáng chất nuôi cây.'
      },
      {
        question: 'Olympic Lịch Sử: Chiến thắng Bạch Đằng năm 938 đánh tan quân Nam Hán dưới sự lãnh đạo của vị anh hùng dân tộc nào?',
        options: ['Ngô Quyền', 'Trần Hưng Đạo', 'Lê Lợi', 'Quang Trung'],
        answer: 0,
        explanation: 'Ngô Quyền cắm cọc nhọn trên sông Bạch Đằng, chấm dứt hơn 1000 năm Bắc thuộc mở ra kỷ nguyên độc lập.'
      },
      {
        question: 'Olympic Địa Lý: Đỉnh núi Phan-xi-păng được mệnh danh là “Nóc nhà Đông Dương” cao bao nhiêu mét?',
        options: ['3143 m', '2980 m', '3250 m', '3050 m'],
        answer: 0,
        explanation: 'Đỉnh núi Fansipan thuộc dãy Hoàng Liên Sơn cao 3143 mét.'
      },
      {
        question: 'Olympic Tiếng Anh: "What is the capital city of Vietnam?"',
        options: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Phu Tho'],
        answer: 0,
        explanation: 'Hanoi (Hà Nội) là thủ đô ngàn năm văn hiến của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.'
      },
      {
        question: 'Olympic Toán: Tổng số tuổi của hai mẹ con hiện nay là 42 tuổi. Biết mẹ hơn con 26 tuổi. Tuổi của con hiện nay là:',
        options: ['8 tuổi', '10 tuổi', '7 tuổi', '9 tuổi'],
        answer: 0,
        explanation: 'Tuổi con = (42 - 26) : 2 = 16 : 2 = 8 tuổi.'
      },
      {
        question: 'Olympic Văn Học: Tác giả của tác phẩm thiếu nhi kinh điển "Dế Mèn phiêu lưu ký" là nhà văn nào?',
        options: ['Tô Hoài', 'Trần Đăng Khoa', 'Nguyễn Nhật Ánh', 'Võ Quảng'],
        answer: 0,
        explanation: 'Nhà văn Tô Hoài sáng tác "Dế Mèn phiêu lưu ký" năm 1941, truyền cảm hứng cho bao thế hệ học sinh.'
      },
      {
        question: 'Olympic Môi Trường: Hành động nào sau đây là thiết thực nhất để bảo vệ môi trường học đường xanh - sạch - đẹp?',
        options: [
          'Phân loại và bỏ rác đúng nơi quy định, chăm sóc bồn hoa cây cảnh',
          'Vứt rác bừa bãi dưới ngăn bàn',
          'Ngắt hoa bẻ cành trang trí lớp học',
          'Khắc tên lên bàn học và thân cây'
        ],
        answer: 0,
        explanation: 'Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định và chăm sóc cây xanh giúp trường luôn xanh sạch đẹp.'
      }
    ]
  }
};
