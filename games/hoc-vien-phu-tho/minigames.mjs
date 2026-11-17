/**
 * Minigame challenges inside Hoc Vien Phu Tho
 * Station quizzes and reflex games giving points to students.
 */

export const MINIGAME_DATA = {
  math: {
    title: 'Trạm Toán Học Thông Thái 🧮',
    instructions: 'Giải nhanh 3 câu hỏi toán đố để nhận 20 Sao Danh Dự!',
    questions: [
      {
        question: 'Tìm số tiếp theo trong dãy quy luật: 3, 6, 12, 24, ...?',
        options: ['36', '48', '52', '42'],
        answer: 1,
        explanation: 'Quy luật nhân đôi: 24 × 2 = 48.'
      },
      {
        question: 'Một hình vuông có chu vi 36 cm. Diện tích của hình vuông đó là bao nhiêu?',
        options: ['64 cm²', '72 cm²', '81 cm²', '90 cm²'],
        answer: 2,
        explanation: 'Cạnh = 36 : 4 = 9 cm. Diện tích = 9 × 9 = 81 cm².'
      },
      {
        question: 'Tính nhanh: 25 × 18 × 4 = ?',
        options: ['1600', '1800', '2000', '1500'],
        answer: 1,
        explanation: '(25 × 4) × 18 = 100 × 18 = 1800.'
      },
      {
        question: 'Có 5 gói kẹo, mỗi gói có 12 cái. Chia đều cho 6 bạn, mỗi bạn được mấy cái kẹo?',
        options: ['10 cái', '8 cái', '12 cái', '14 cái'],
        answer: 0,
        explanation: '5 × 12 = 60 cái. 60 : 6 = 10 cái.'
      }
    ]
  },
  vietnamese: {
    title: 'Thư Viện Tri Thức & Vua Tiếng Việt 📚',
    instructions: 'Đoán đúng các câu đố ca dao, từ ngữ và chính tả để nhận 20 Sao Danh Dự!',
    questions: [
      {
        question: 'Điền từ còn thiếu vào câu tục ngữ: "Học thầy không tày học ..."',
        options: ['sách', 'bạn', 'mẹ', 'ông'],
        answer: 1,
        explanation: 'Tục ngữ Việt Nam: "Học thầy không tày học bạn".'
      },
      {
        question: 'Từ nào sau đây viết ĐÚNG chính tả?',
        options: ['Xắp xếp', 'Sắp xếp', 'Sắp sếp', 'Xắp sếp'],
        answer: 1,
        explanation: '"Sắp xếp" là từ chuẩn chính tả Tiếng Việt.'
      },
      {
        question: 'Giải câu đố: "Cây gì lá nhỏ, quả tròn / Chín vàng ngọt lịm, cội nguồn quê hương?"',
        options: ['Cây bưởi', 'Cây nhãn', 'Cây cam', 'Cây ổi'],
        answer: 1,
        explanation: 'Nhãn lồng chín vàng ngọt lịm thơm ngon.'
      },
      {
        question: 'Trong câu: "Mặt trời đỏ rực như một quả cầu lửa khổng lồ", có biện pháp nghệ thuật gì?',
        options: ['Nhân hóa', 'So sánh', 'Điệp ngữ', 'Ẩn dụ'],
        answer: 1,
        explanation: 'Có từ so sánh "như": mặt trời đỏ rực như quả cầu lửa.'
      }
    ]
  },
  coding: {
    title: 'Phòng Tin Học & Lập Trình Robot 💻',
    instructions: 'Sắp xếp tư duy thuật toán và logic máy tính để nhận 25 Sao!',
    questions: [
      {
        question: 'Robot đang đứng ở ô (0, 0) nhìn về hướng Đông. Robot đi lệnh: [Tiến 3] -> [Quay trái] -> [Tiến 2]. Tọa độ hiện tại là?',
        options: ['(3, 2)', '(2, 3)', '(3, -2)', '(5, 0)'],
        answer: 0,
        explanation: 'Tiến 3 sang Đông (X=3), quay trái là hướng Bắc, tiến 2 (Y=2) => Tọa độ (3, 2).'
      },
      {
        question: 'Trong lập trình, cấu trúc vòng lặp "Lặp lại 4 lần [Tiến 1 bước, Rẽ phải 90°]" sẽ tạo thành hình gì?',
        options: ['Hình tam giác', 'Hình chữ nhật dài', 'Hình vuông', 'Hình tròn'],
        answer: 2,
        explanation: '4 cạnh bằng nhau và 4 góc vuông 90° tạo thành hình vuông.'
      },
      {
        question: 'Nếu trời mưa THÌ mang ô, NGƯỢC LẠI THÌ đội mũ. Nếu trời NẮNG, hành động là gì?',
        options: ['Mang ô', 'Đội mũ', 'Ở nhà', 'Đi ngủ'],
        answer: 1,
        explanation: 'Vì trời không mưa (ngược lại), nên robot thực hiện hành động "Đội mũ".'
      }
    ]
  },
  sports: {
    title: 'Sân Bóng & Phản Xạ Thể Thao ⚽',
    instructions: 'Thử thách độ hiểu biết và tinh thần thể thao năng động!',
    questions: [
      {
        question: 'Một trận đấu bóng đá chính thức gồm mấy hiệp thi đấu chính và mỗi hiệp bao nhiêu phút?',
        options: ['2 hiệp, mỗi hiệp 40 phút', '2 hiệp, mỗi hiệp 45 phút', '3 hiệp, mỗi hiệp 30 phút', '2 hiệp, mỗi hiệp 50 phút'],
        answer: 1,
        explanation: 'Bóng đá tiêu chuẩn có 2 hiệp, mỗi hiệp 45 phút.'
      },
      {
        question: 'Động tác nào giúp phòng tránh chấn thương hiệu quả nhất TRƯỚC KHI chơi thể thao?',
        options: ['Uống thật nhiều nước ngọt', 'Khởi động xoay các khớp kỹ càng', 'Chạy nước rút ngay lập tức', 'Ngồi nghỉ ngơi'],
        answer: 1,
        explanation: 'Khởi động kỹ các khớp cổ chân, đầu gối, cánh tay giúp làm ấm cơ thể và chống chấn thương.'
      },
      {
        question: 'Đội tuyển bóng đá nam Tiểu học có bao nhiêu cầu thủ thi đấu trên sân bóng mini 5 người?',
        options: ['4 bạn', '5 bạn (tính cả thủ môn)', '6 bạn', '7 bạn'],
        answer: 1,
        explanation: 'Sân 5 người có 5 cầu thủ mỗi đội, bao gồm cả thủ môn.'
      }
    ]
  },
  nature: {
    title: 'Vườn Sinh Thái & Trí Nhớ Thiên Nhiên 🍎',
    instructions: 'Khám phá thế giới thực vật và động vật quanh sân trường!',
    questions: [
      {
        question: 'Quá trình cây xanh sử dụng ánh sáng mặt trời, nước và khí CO₂ để tạo ra chất dinh dưỡng và khí Oxi gọi là gì?',
        options: ['Hô hấp', 'Quang hợp', 'Thoát hơi nước', 'Nảy mầm'],
        answer: 1,
        explanation: 'Quang hợp là quá trình tạo chất hữu cơ và nhả khí oxy của lá cây.'
      },
      {
        question: 'Cá Koi bơi lội dưới hồ nước thở bằng bộ phận nào?',
        options: ['Phổi', 'Mang cá', 'Vây cá', 'Đuôi'],
        answer: 1,
        explanation: 'Cá thở bằng mang để lấy oxy hòa tan trong nước.'
      },
      {
        question: 'Loài chim nào thường xuất hiện trên logo hòa bình và bay lượn ở đài phun nước sân trường?',
        options: ['Chim Bồ Câu', 'Chim Đại Bàng', 'Chim Cú Mèo', 'Chim Hải Âu'],
        answer: 0,
        explanation: 'Chim Bồ Câu trắng là biểu tượng quốc tế của tình hữu nghị và hòa bình.'
      }
    ]
  },
  olympiad: {
    title: '🌟 Tháp Học Giả Tinh Hoa Phú Thọ (Đại Khảo Thí) 👑',
    instructions: 'Khu vực đặc biệt dành cho các học giả nhí xuất sắc! Câu hỏi tổng hợp độ khó cao, nhân đôi điểm số (+50 Sao Danh Dự) và mở khóa Huy Hiệu Tinh Hoa!',
    questions: [
      {
        question: 'Olympic Toán: Một lớp học có 32 học sinh. Có 20 bạn thích môn Toán, 18 bạn thích môn Tiếng Việt, và 10 bạn thích cả hai môn. Hỏi có mấy bạn không thích môn nào trong hai môn này?',
        options: ['2 bạn', '4 bạn', '6 bạn', '0 bạn'],
        answer: 1,
        explanation: 'Số bạn thích ít nhất 1 môn = 20 + 18 - 10 = 28 bạn. Số bạn không thích môn nào = 32 - 28 = 4 bạn.'
      },
      {
        question: 'Olympic Tiếng Việt: Trong các từ sau, từ nào là từ ghép đẳng lập?',
        options: ['Nhà sàn', 'Mưa rào', 'Núi non', 'Bút bi'],
        answer: 2,
        explanation: '"Núi non" gồm hai tiếng có nghĩa ngang hàng bình đẳng, là từ ghép đẳng lập.'
      },
      {
        question: 'Olympic Tiếng Anh: "If you want to keep the school clean and green, you should never throw ______ on the ground."',
        options: ['litter', 'flowers', 'water', 'books'],
        answer: 0,
        explanation: '"throw litter" nghĩa là vứt rác bừa bãi ra sân trường.'
      },
      {
        question: 'Lịch sử & Địa lý: Đền Hùng - nơi thờ các vị Vua Hùng có công dựng nước Văn Lang tọa lạc tại tỉnh nào của nước ta?',
        options: ['Vĩnh Phúc', 'Hà Nội', 'Phú Thọ', 'Tuyên Quang'],
        answer: 2,
        explanation: 'Di tích lịch sử Đền Hùng nằm trên núi Nghĩa Lĩnh, tỉnh Phú Thọ!'
      }
    ]
  }
};
