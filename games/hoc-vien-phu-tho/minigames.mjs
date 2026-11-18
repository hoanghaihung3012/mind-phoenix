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
      }
    ]
  }
};
