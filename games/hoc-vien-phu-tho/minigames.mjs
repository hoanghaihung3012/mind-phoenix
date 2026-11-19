/**
 * Minigame challenges inside Học Viện Phú Thọ
 * Dựa trên cấu trúc chuẩn từ nguồn học liệu Trường Tiểu học Phú Thọ:
 * Từ vựng, Chính tả, Ngữ văn, Thành ngữ, Toán học, Đấu trường 60s và Đại hội Tri thức.
 * Câu hỏi được phân cấp rõ ràng theo 3 mức độ:
 * - 'easy': Cấp độ Dễ (Nhận biết cơ bản)
 * - 'medium': Cấp độ Vừa (Thông hiểu & vận dụng)
 * - 'hard': Cấp độ Thử thách / Khó (Nâng cao & tư duy sâu)
 */

export const MINIGAME_DATA = {
  // 1. Thư viện Từ vựng (Vocabulary Treasure)
  vocabulary: {
    title: 'Thư Viện Từ Vựng Tri Thức 📚',
    instructions: 'Khám phá từ đồng nghĩa, từ trái nghĩa, từ ghép và từ láy theo cấp độ từ dễ đến khó!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Cặp từ nào dưới đây là cặp TỪ TRÁI NGHĨA?',
        options: ['Nóng - Lạnh', 'Chăm chỉ - Cần cù', 'Thông minh - Sáng dạ', 'Hiền lành - Nhân hậu'],
        answer: 0,
        explanation: '“Nóng” và “Lạnh” là hai trạng thái nhiệt độ hoàn toàn đối lập nhau.'
      },
      {
        difficulty: 'easy',
        question: 'Từ nào sau đây là TỪ LÁY tượng thanh mô tả tiếng chim hót vui tươi?',
        options: ['Ríu rít', 'Rì rầm', 'Thầm thì', 'Ồn ào'],
        answer: 0,
        explanation: '“Ríu rít” là từ láy mô tả tiếng chim chuyền cành hót rộn ràng.'
      },
      {
        difficulty: 'easy',
        question: 'Tìm từ ĐỒNG NGHĨA với từ “chăm chỉ”:',
        options: ['Cần cù', 'Lười biếng', 'Bé nhỏ', 'Nhanh nhảu'],
        answer: 0,
        explanation: '“Cần cù” đồng nghĩa với “chăm chỉ”, chỉ tính chịu khó làm việc.'
      },
      {
        difficulty: 'easy',
        question: 'Từ nào sau đây chỉ ĐỒ DÙNG HỌC TẬP quen thuộc của học sinh?',
        options: ['Thước kẻ', 'Cái xẻng', 'Chiếc chảo', 'Bếp ga'],
        answer: 0,
        explanation: '“Thước kẻ” là đồ dùng học tập gắn liền với học sinh hàng ngày.'
      },
      {
        difficulty: 'easy',
        question: 'Từ nào sau đây là TỪ LÁY toàn bộ?',
        options: ['Xanh xanh', 'Xanh ngắt', 'Xanh lơ', 'Xanh biếc'],
        answer: 0,
        explanation: '“Xanh xanh” lặp lại hoàn toàn âm đầu, vần và thanh điệu.'
      },
      {
        difficulty: 'easy',
        question: 'Từ nào dưới đây là TỪ TRÁI NGHĨA với “vui vẻ”?',
        options: ['Buồn bã', 'Phấn khởi', 'Hớn hở', 'Hân hoan'],
        answer: 0,
        explanation: '“Buồn bã” đối lập hoàn toàn về mặt cảm xúc với “vui vẻ”.'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
        question: 'Từ nào sau đây là TỪ GHÉP tổng hợp?',
        options: ['Sách vở', 'Sách Toán', 'Xe đạp', 'Bút bi'],
        answer: 0,
        explanation: '“Sách vở” gộp chung tất cả các loại sách và vở, là từ ghép tổng hợp.'
      },
      {
        difficulty: 'medium',
        question: 'Từ nào sau đây là TỪ GHÉP phân loại?',
        options: ['Xe đạp', 'Quần áo', 'Bàn ghế', 'Cây cối'],
        answer: 0,
        explanation: '“Xe đạp” chỉ một loại phương tiện cụ thể phân biệt với xe máy, ô tô.'
      },
      {
        difficulty: 'medium',
        question: 'Từ láy nào dưới đây là từ láy tượng hình mô tả dáng đi chậm chạp, còng lưng?',
        options: ['Lom khom', 'Ào ào', 'Tí tách', 'Loảng xoảng'],
        answer: 0,
        explanation: '“Lom khom” gợi tả dáng người hơi còng lưng khi di chuyển hoặc làm việc.'
      },
      {
        difficulty: 'medium',
        question: 'Tiếng “nhân” trong từ nào dưới đây có nghĩa là “lòng thương người”?',
        options: ['Nhân ái', 'Nhân dân', 'Nhân công', 'Nhân tài'],
        answer: 0,
        explanation: '“Nhân ái” là lòng yêu thương con người; “nhân” ở đây nghĩa là lòng nhân từ.'
      },
      {
        difficulty: 'medium',
        question: 'Tiếng “đồng” trong từ nào dưới đây có nghĩa là “cùng nhau, cùng một lòng”?',
        options: ['Đồng lòng', 'Đồng ruộng', 'Đồng hồ', 'Đồng tiền'],
        answer: 0,
        explanation: '“Đồng lòng” nghĩa là cùng chung một ý chí và suy nghĩ.'
      },
      {
        difficulty: 'medium',
        question: 'Từ nào dưới đây là TỪ TRÁI NGHĨA với “tiết kiệm”?',
        options: ['Lãng phí', 'Kín đáo', 'Cẩn thận', 'Chăm sóc'],
        answer: 0,
        explanation: '“Lãng phí” tiêu xài bừa bãi, đối lập với “tiết kiệm”.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Từ “mắt” trong trường hợp nào dưới đây được dùng theo NGHĨA CHUYỂN?',
        options: ['Quả na mở mắt', 'Mắt em bé sáng ngời', 'Đôi mắt tinh tường', 'Nhắm mắt ngủ ngon'],
        answer: 0,
        explanation: '“Mắt” của quả na là kẽ hở giữa các múi na, là nghĩa chuyển dựa trên sự tương đồng hình dáng.'
      },
      {
        difficulty: 'hard',
        question: 'Từ Hán - Việt nào dưới đây đồng nghĩa với cụm từ “đất nước, non sông”?',
        options: ['Sơn hà', 'Hải cảng', 'Phong cảnh', 'Địa lý'],
        answer: 0,
        explanation: '“Sơn hà” (núi sông) là từ Hán - Việt chỉ đất nước thiêng liêng.'
      },
      {
        difficulty: 'hard',
        question: 'Trong câu “Bàn chân đặt lên chiếc bàn gỗ”, hai từ “bàn” thuộc hiện tượng từ nào?',
        options: ['Từ đồng âm', 'Từ nhiều nghĩa', 'Từ đồng nghĩa', 'Từ trái nghĩa'],
        answer: 0,
        explanation: 'Hai từ “bàn” giống nhau về âm đọc nhưng nghĩa hoàn toàn khác biệt nhau (bộ phận cơ thể vs đồ vật).'
      },
      {
        difficulty: 'hard',
        question: 'Từ “ăn” trong trường hợp nào dưới đây mang nghĩa gốc?',
        options: ['Bé ăn cơm trưa', 'Chiếc xe ăn xăng', 'Tàu ăn than', 'Hai người rất ăn ý'],
        answer: 0,
        explanation: '“Bé ăn cơm” là hoạt động nhai và nuốt thức ăn vào dạ dày, là nghĩa gốc ban đầu.'
      },
      {
        difficulty: 'hard',
        question: 'Từ láy nào dưới đây có các tiếng có quan hệ LÁY ÂM ĐẦU?',
        options: ['Long lanh', 'Liêu xiêu', 'Lưa thưa', 'Lả lướt'],
        answer: 0,
        explanation: '“Long lanh” lặp lại âm đầu “l”, vần “ong” và “anh” khác nhau.'
      }
    ]
  },

  // 2. Khu Chính Tả (Spelling Pavilion)
  spelling: {
    title: 'Khu Chính Tả Tiếng Việt ✏️',
    instructions: 'Soi lỗi chính tả và rèn luyện chính tả chuẩn mực từ dễ đến khó!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Chọn từ viết ĐÚNG chính tả:',
        options: ['Xinh đẹp', 'Sinh đẹp', 'Xinh đệp', 'Sinh đệp'],
        answer: 0,
        explanation: '“Xinh đẹp” là từ chuẩn chính tả: “xinh” viết với âm x.'
      },
      {
        difficulty: 'easy',
        question: 'Từ nào sau đây viết ĐÚNG chính tả khi phân biệt s/x?',
        options: ['Sáng sủa', 'Xáng sủa', 'Sáng xủa', 'Xáng xủa'],
        answer: 0,
        explanation: '“Sáng sủa” là cách viết đúng: cả hai tiếng đều viết bằng s.'
      },
      {
        difficulty: 'easy',
        question: 'Chọn từ viết ĐÚNG chính tả khi phân biệt ch/tr:',
        options: ['Chăm chỉ', 'Trăm chỉ', 'Chăm chỉa', 'Trăm trỉ'],
        answer: 0,
        explanation: '“Chăm chỉ” viết bằng chữ ch.'
      },
      {
        difficulty: 'easy',
        question: 'Từ nào dưới đây viết ĐÚNG quy tắc c/k/q trước các nguyên âm i, e, ê?',
        options: ['Kiên trì', 'Ciên trì', 'Qiên trì', 'Kiêng chì'],
        answer: 0,
        explanation: 'Trước nguyên âm i, e, ê, âm /k/ luôn viết bằng chữ k.'
      },
      {
        difficulty: 'easy',
        question: 'Chọn từ viết ĐÚNG chính tả khi phân biệt l/n:',
        options: ['Nỗ lực', 'Lỗ lực', 'Nỗ nực', 'Lỗ nực'],
        answer: 0,
        explanation: '“Nỗ lực” bắt đầu bằng âm n (nỗ) và âm l (lực).'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
        question: 'Từ nào sau đây viết ĐÚNG chính tả khi phân biệt dấu hỏi / ngã?',
        options: ['Dũng cảm', 'Dủng cảm', 'Dũng cãm', 'Dủng cãm'],
        answer: 0,
        explanation: '“Dũng cảm”: “dũng” mang dấu ngã, “cảm” mang dấu hỏi.'
      },
      {
        difficulty: 'medium',
        question: 'Chọn từ viết ĐÚNG chính tả:',
        options: ['Xôn xao', 'Sôn sao', 'Xôn sao', 'Sôn xao'],
        answer: 0,
        explanation: '“Xôn xao” là từ tượng thanh viết với âm đầu x.'
      },
      {
        difficulty: 'medium',
        question: 'Chọn cách viết ĐÚNG chính tả phân biệt d/gi/r:',
        options: ['Gìn giữ', 'Dìn dững', 'Rìn rữ', 'Gìn dững'],
        answer: 0,
        explanation: '“Gìn giữ” cả hai tiếng đều viết bằng chữ gi.'
      },
      {
        difficulty: 'medium',
        question: 'Từ nào dưới đây viết ĐÚNG chính tả khi phân biệt dấu hỏi / ngã?',
        options: ['Suy nghĩ', 'Suy nghỉ', 'Xuy nghĩ', 'Xuy nghỉ'],
        answer: 0,
        explanation: '“Suy nghĩ”: tiếng “nghĩ” mang dấu ngã.'
      },
      {
        difficulty: 'medium',
        question: 'Chọn cặp từ viết ĐÚNG chính tả khi phân biệt tr/ch:',
        options: ['Trung thực', 'Chung thực', 'Trung thụt', 'Chung trật'],
        answer: 0,
        explanation: '“Trung thực” (thành thật) viết bằng âm đầu tr.'
      },
      {
        difficulty: 'medium',
        question: 'Chọn từ viết ĐÚNG chính tả phân biệt s/x:',
        options: ['Sắp xếp', 'Xắp xếp', 'Sắp sếp', 'Xắp xếch'],
        answer: 0,
        explanation: '“Sắp xếp”: “sắp” viết s, “xếp” viết x.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Từ nào sau đây viết ĐÚNG chính tả phân biệt vần ao/au và uâng:',
        options: ['Bâng khuâng', 'Bân khưng', 'Bâng khâng', 'Bân khuân'],
        answer: 0,
        explanation: '“Bâng khuâng” viết bằng vần âng và uâng.'
      },
      {
        difficulty: 'hard',
        question: 'Chọn từ viết ĐÚNG chính tả chỉ địa hình khúc khuỷu, hiểm trở:',
        options: ['Ngoằn ngoèo', 'Ngoằn ngoèo', 'Ngoằn nghèo', 'Ngoàng ngoèo'],
        answer: 0,
        explanation: '“Ngoằn ngoèo” viết với vần oăn và oeo.'
      },
      {
        difficulty: 'hard',
        question: 'Từ nào dưới đây viết ĐÚNG quy tắc viết hoa tên địa lý Việt Nam?',
        options: ['Phú Thọ', 'Phú thọ', 'phú Thọ', 'phú thọ'],
        answer: 0,
        explanation: 'Tên địa lý riêng Việt Nam phải viết hoa chữ cái đầu của tất cả các âm tiết: Phú Thọ.'
      },
      {
        difficulty: 'hard',
        question: 'Cặp từ láy nào dưới đây viết ĐÚNG chính tả dấu hỏi / ngã?',
        options: ['Màu mỡ', 'Màu mở', 'Màu mỡ', 'Mầu mở'],
        answer: 0,
        explanation: '“Màu mỡ” (đất đai màu mỡ) viết bằng dấu ngã.'
      }
    ]
  },

  // 3. Nhà Ngữ Văn (Sentence Builder)
  literature: {
    title: 'Nhà Ngữ Văn & Ghép Câu 📜',
    instructions: 'Rèn luyện ngữ pháp, cấu trúc câu và các biện pháp tu từ nghệ thuật từ dễ đến khó!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Trong câu: “Những chú chim hót ríu rít trên cành bàng.”, bộ phận CHỦ NGỮ là gì?',
        options: ['Những chú chim', 'hót ríu rít', 'trên cành bàng', 'Những chú chim hót'],
        answer: 0,
        explanation: '“Những chú chim” trả lời cho câu hỏi “Con gì?”.'
      },
      {
        difficulty: 'easy',
        question: 'Trong câu: “Bạn Lan là học sinh giỏi của lớp 4A.”, bộ phận VỊ NGỮ là:',
        options: ['là học sinh giỏi của lớp 4A', 'Bạn Lan', 'học sinh giỏi', 'của lớp 4A'],
        answer: 0,
        explanation: 'Vị ngữ nối với chủ ngữ bằng từ “là” và trả lời câu hỏi “Là gì?”.'
      },
      {
        difficulty: 'easy',
        question: 'Dấu câu nào dùng để KẾT THÚC CÂU HỎI?',
        options: ['Dấu chấm hỏi (?)', 'Dấu chấm (.)', 'Dấu chấm than (!)', 'Dấu phẩy (,)'],
        answer: 0,
        explanation: 'Dấu chấm hỏi (?) được đặt ở cuối câu nghi vấn, câu hỏi.'
      },
      {
        difficulty: 'easy',
        question: 'Câu nào dưới đây là CÂU KỂ “Ai làm gì?”?',
        options: [
          'Các bạn học sinh đang chăm chỉ học bài.',
          'Ngôi trường Phú Thọ rất đẹp.',
          'Em là học sinh lớp bốn.',
          'Bầu trời mùa thu trong xanh.'
        ],
        answer: 0,
        explanation: 'Vị ngữ “đang chăm chỉ học bài” nêu hoạt động của các bạn học sinh.'
      },
      {
        difficulty: 'easy',
        question: 'Dấu câu nào dùng để NGĂN CÁCH các vế câu hoặc các từ cùng giữ chức vụ trong câu?',
        options: ['Dấu phẩy (,)', 'Dấu chấm (.)', 'Dấu chấm hỏi (?)', 'Dấu chấm than (!)'],
        answer: 0,
        explanation: 'Dấu phẩy (,) dùng để ngăn cách các bộ phận cùng chức vụ hoặc các vế trong câu.'
      },
      {
        difficulty: 'easy',
        question: 'Trong câu “Trường Tiểu học Phú Thọ rất khang trang và sạch đẹp.”, bộ phận VỊ NGỮ là:',
        options: ['rất khang trang và sạch đẹp', 'Trường Tiểu học', 'Phú Thọ', 'sạch đẹp'],
        answer: 0,
        explanation: '“Rất khang trang và sạch đẹp” trả lời câu hỏi “Thế nào?”, là vị ngữ chỉ đặc điểm.'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
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
        difficulty: 'medium',
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
        difficulty: 'medium',
        question: 'Xác định TRẠNG NGỮ trong câu: “Sáng sớm hôm nay, em hân hoan bước vào cổng trường Phú Thọ.”',
        options: ['Sáng sớm hôm nay', 'em hân hoan', 'bước vào cổng trường', 'cổng trường Phú Thọ'],
        answer: 0,
        explanation: '“Sáng sớm hôm nay” là trạng ngữ chỉ thời gian.'
      },
      {
        difficulty: 'medium',
        question: 'Xác định TRẠNG NGỮ CHỈ NƠI CHỐN trong câu: “Trên cành bàng cổ thụ, những chú chim non cất tiếng hót líu lo.”',
        options: ['Trên cành bàng cổ thụ', 'những chú chim non', 'cất tiếng hót líu lo', 'chim non'],
        answer: 0,
        explanation: '“Trên cành bàng cổ thụ” trả lời câu hỏi “Ở đâu?”, là trạng ngữ chỉ nơi chốn.'
      },
      {
        difficulty: 'medium',
        question: 'Từ ngữ nào nối hai vế so sánh trong câu: “Mặt trời như một quả cầu lửa khổng lồ.”?',
        options: ['như', 'một', 'quả cầu', 'khổng lồ'],
        answer: 0,
        explanation: '“Như” là từ chỉ ý so sánh giữa hai sự vật.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Cặp quan hệ từ trong câu “Vì trời mưa to nên đường đến trường rất trơn.” biểu thị mối quan hệ gì?',
        options: ['Nguyên nhân - Kết quả', 'Điều kiện - Kết quả', 'Tương phản', 'Tăng tiến'],
        answer: 0,
        explanation: '“Vì... nên...” là cặp quan hệ từ chỉ nguyên nhân dẫn đến kết quả.'
      },
      {
        difficulty: 'hard',
        question: 'Câu nào dưới đây là CÂU GHÉP có hai vế câu nối trực tiếp không dùng từ nối?',
        options: [
          'Mây bay, gió thổi, mưa bắt đầu rơi.',
          'Tuy trời mưa nhưng chúng em vẫn đi học đúng giờ.',
          'Nếu em chăm học thì em sẽ đạt điểm cao.',
          'Hoa hồng và hoa cúc cùng khoe sắc trong vườn.'
        ],
        answer: 0,
        explanation: 'Các vế câu có cấu trúc C-V riêng biệt và được ngăn cách bằng dấu phẩy, không dùng quan hệ từ.'
      },
      {
        difficulty: 'hard',
        question: 'Biện pháp tu từ nào được sử dụng trong câu: “Bàn tay mẹ dịu dàng sưởi ấm tâm hồn em suốt tuổi thơ.”?',
        options: ['Hoán dụ / Ẩn dụ', 'So sánh', 'Nói quá', 'Chơi chữ'],
        answer: 0,
        explanation: '“Bàn tay mẹ” lấy bộ phận để gọi toàn thể người mẹ chở che, mang tính hoán dụ và biểu cảm sâu sắc.'
      },
      {
        difficulty: 'hard',
        question: 'Tác dụng của DẤU NGOẶC KÉP trong câu: Bác Hồ từng căn dặn: “Không có gì quý hơn độc lập, tự do.” là gì?',
        options: [
          'Dẫn lời nói trực tiếp của nhân vật',
          'Đánh dấu từ ngữ được dùng với ý nghĩa đặc biệt',
          'Giải thích cho bộ phận đứng trước',
          'Ngăn cách các vế câu ghép'
        ],
        answer: 0,
        explanation: 'Dấu ngoặc kép dùng để đánh dấu câu danh ngôn, lời dẫn trực tiếp của Chủ tịch Hồ Chí Minh.'
      },
      {
        difficulty: 'hard',
        question: 'Trong đoạn thơ: “Tre xanh, xanh tự bao giờ / Chuyện ngày xưa đã có bờ tre xanh”, từ “xanh” được lặp lại 3 lần nhằm mục đích gì?',
        options: ['Điệp từ nhấn mạnh sức sống bền bỉ, trường tồn của cây tre Việt Nam', 'Chỉ để câu thơ thêm vần', 'Tả màu sắc của lá tre', 'Không có tác dụng nghệ thuật'],
        answer: 0,
        explanation: 'Điệp từ “xanh” khắc sâu vẻ đẹp trường tồn, dẻo dai và sức sống mãnh liệt của tre làng quê.'
      }
    ]
  },

  // 4. Quảng trường Thành ngữ (Idiom & Folklore Plaza)
  idiom: {
    title: 'Quảng Trường Thành Ngữ & Tục Ngữ 🧩',
    instructions: 'Khám phá kho tàng ca dao tục ngữ và bài học cha ông từ dễ đến khó!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Hoàn thành câu tục ngữ: “Học đi đôi với ......”',
        options: ['hành', 'nghỉ', 'chơi', 'thi'],
        answer: 0,
        explanation: '“Học đi đôi với hành” khuyên chúng ta học lý thuyết phải gắn liền với thực hành.'
      },
      {
        difficulty: 'easy',
        question: 'Điền từ còn thiếu vào câu thành ngữ: “Uống nước nhớ ......”',
        options: ['nguồn', 'sông', 'biển', 'suối'],
        answer: 0,
        explanation: '“Uống nước nhớ nguồn” nhắc nhở đạo lý biết ơn tổ tiên, cội nguồn.'
      },
      {
        difficulty: 'easy',
        question: 'Hoàn thành câu tục ngữ: “Có công mài sắt, có ngày nên ......”',
        options: ['kim', 'dao', 'kéo', 'chày'],
        answer: 0,
        explanation: '“Có công mài sắt, có ngày nên kim” khuyên nhủ lòng kiên trì sẽ gặt hái thành công.'
      },
      {
        difficulty: 'easy',
        question: 'Điền từ còn thiếu: “Ăn quả nhớ kẻ ...... cây”',
        options: ['trồng', 'chặt', 'hái', 'tưới'],
        answer: 0,
        explanation: '“Ăn quả nhớ kẻ trồng cây” răn dạy lòng biết ơn người đã tạo ra thành quả.'
      },
      {
        difficulty: 'easy',
        question: 'Hoàn thành câu thành ngữ: “Lá lành đùm lá ......”',
        options: ['rách', 'vàng', 'héo', 'rụng'],
        answer: 0,
        explanation: '“Lá lành đùm lá rách” khuyên nhủ con người biết cưu mang, giúp đỡ lẫn nhau khi hoạn nạn.'
      },
      {
        difficulty: 'easy',
        question: 'Điền từ còn thiếu vào câu tục ngữ: “Thương người như thể thương ......”',
        options: ['thân', 'nhà', 'bạn', 'mình'],
        answer: 0,
        explanation: '“Thương người như thể thương thân” dạy lòng nhân ái, yêu thương người khác như chính bản thân mình.'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
        question: 'Câu thành ngữ “Chân lấm tay bùn” gợi tả điều gì?',
        options: [
          'Sự lao động vất vả, lam lũ của người nông dân',
          'Người lười biếng không chịu tắm giặt',
          'Trẻ em nghịch bẩn ngoài đồng',
          'Người thợ sửa xe ô tô'
        ],
        answer: 0,
        explanation: '“Chân lấm tay bùn” ca ngợi sự chăm chỉ, chịu thương chịu khó của người nông dân.'
      },
      {
        difficulty: 'medium',
        question: 'Hoàn thành câu ca dao: “Một cây làm chẳng nên non, Ba cây chụm lại nên hòn ...... cao.”',
        options: ['núi', 'đá', 'đồi', 'đất'],
        answer: 0,
        explanation: 'Câu ca dao ca ngợi sức mạnh của sự đoàn kết và hợp lực.'
      },
      {
        difficulty: 'medium',
        question: 'Câu tục ngữ “Gần mực thì đen, gần đèn thì sáng” khuyên chúng ta điều gì?',
        options: [
          'Nên chọn bạn tốt, môi trường lành mạnh để học tập và rèn luyện',
          'Nên tiết kiệm mực viết và bóng đèn',
          'Ban đêm phải bật đèn sáng để học bài',
          'Không nên dùng mực đen để viết thư'
        ],
        answer: 0,
        explanation: 'Môi trường sống và bạn bè xung quanh ảnh hưởng rất lớn đến tính cách của mỗi người.'
      },
      {
        difficulty: 'medium',
        question: 'Câu thành ngữ “Đi một ngày đàng, học một sàng khôn” khuyên chúng ta điều gì?',
        options: [
          'Tích cực đi ra ngoài trải nghiệm, học hỏi để mở rộng hiểu biết',
          'Mỗi ngày chỉ cần đi một đoạn đường',
          'Nên mang theo sàng khi đi đường',
          'Không nên ở nhà quá nhiều'
        ],
        answer: 0,
        explanation: 'Càng đi nhiều nơi, trải nghiệm nhiều thực tế thì vốn tri thức và sự hiểu biết càng phong phú.'
      },
      {
        difficulty: 'medium',
        question: 'Điền từ còn thiếu: “Bầu ơi thương lấy bí cùng, Tuy rằng khác ...... nhưng chung một giàn.”',
        options: ['giống', 'nhà', 'cây', 'lá'],
        answer: 0,
        explanation: 'Câu ca dao nhắc nhở đồng bào cùng sống trên một đất nước phải đoàn kết, thương yêu nhau.'
      },
      {
        difficulty: 'medium',
        question: 'Câu thành ngữ “Chị ngã em nâng” nói về truyền thống đạo đức nào?',
        options: [
          'Tình cảm gắn bó, tương trợ đùm bọc giữa anh chị em trong gia đình',
          'Kỹ năng giúp đỡ người bị ngã trên đường',
          'Quy tắc khi tham gia trò chơi vận động',
          'Bài tập thể dục buổi sáng'
        ],
        answer: 0,
        explanation: '“Chị ngã em nâng” ca ngợi tình anh chị em ruột thịt yêu thương nhau.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Thành ngữ “Đồng cam cộng khổ” có ý nghĩa là gì?',
        options: [
          'Cùng nhau chia sẻ ngọt bùi và gánh vác gian nan, cay đắng',
          'Cùng nhau ăn quả cam và quả khổ qua',
          'Cùng nhau đi chợ mua hoa quả',
          'Cùng nhau thi đua giải toán nhanh'
        ],
        answer: 0,
        explanation: '“Cam” là ngọt, “khổ” là đắng; thành ngữ chỉ sự đồng lòng vượt qua mọi thử thách.'
      },
      {
        difficulty: 'hard',
        question: 'Hoàn thành câu châm ngôn giáo dục: “Tiên học lễ, hậu học ......”',
        options: ['văn', 'toán', 'vẽ', 'hát'],
        answer: 0,
        explanation: '“Tiên học lễ, hậu học văn” nhắc nhở học sinh trước hết phải học đạo đức, lễ nghĩa rồi mới học tri thức văn hóa.'
      },
      {
        difficulty: 'hard',
        question: 'Câu tục ngữ “Tấc đất tấc vàng” sử dụng biện pháp tu từ nào để nhấn mạnh giá trị của đất đai?',
        options: ['So sánh ngầm (Ẩn dụ)', 'Nhân hóa', 'Nói quá', 'Chơi chữ'],
        answer: 0,
        explanation: 'Đất quý giá như vàng bạc, so sánh tấc đất ngang hàng với tấc vàng để khuyên quý trọng đất đai bờ cõi.'
      },
      {
        difficulty: 'hard',
        question: 'Thành ngữ nào dưới đây khuyên con người phải có lòng kiên định, không dao động trước khó khăn?',
        options: ['Vững như bàn thạch', 'Gió chiều nào theo chiều ấy', 'Nước chảy bèo trôi', 'Ba chìm bảy nổi'],
        answer: 0,
        explanation: '“Vững như bàn thạch” chỉ sự kiên định, vững chãi, không gì lay chuyển nổi.'
      }
    ]
  },

  // 5. Vườn Toán Học (Math Garden & Logic Maze)
  math: {
    title: 'Vườn Toán Học & Chuỗi Số 🧮',
    instructions: 'Thử tài tính nhẩm nhanh và giải câu đố tư duy logic toán học từ dễ đến khó!',
    rewardCoins: 25,
    rewardXP: 30,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Tính nhẩm nhanh: 25 x 4 = ?',
        options: ['100', '90', '110', '125'],
        answer: 0,
        explanation: '25 x 4 = 100.'
      },
      {
        difficulty: 'easy',
        question: 'Một hình vuông có cạnh dài 6 cm. CHU VI của hình vuông đó là:',
        options: ['24 cm', '36 cm', '18 cm', '12 cm'],
        answer: 0,
        explanation: 'Chu vi hình vuông = cạnh x 4 = 6 x 4 = 24 cm.'
      },
      {
        difficulty: 'easy',
        question: 'Điền số thích hợp vào dấu hỏi chấm: 5, 10, 15, 20, (?)',
        options: ['25', '30', '22', '35'],
        answer: 0,
        explanation: 'Quy luật dãy số cộng thêm 5 đơn vị mỗi bước: 20 + 5 = 25.'
      },
      {
        difficulty: 'easy',
        question: 'Đổi đơn vị đo thời gian: 2 giờ bằng bao nhiêu phút?',
        options: ['120 phút', '60 phút', '100 phút', '180 phút'],
        answer: 0,
        explanation: '1 giờ = 60 phút, vậy 2 giờ = 2 x 60 = 120 phút.'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
        question: 'Một lớp học có 18 bạn nam và 16 bạn nữ. Hỏi lớp học đó có tất cả bao nhiêu học sinh?',
        options: ['34 học sinh', '32 học sinh', '36 học sinh', '30 học sinh'],
        answer: 0,
        explanation: '18 + 16 = 34 học sinh.'
      },
      {
        difficulty: 'medium',
        question: 'Tìm số TRUNG BÌNH CỘNG của ba số: 10, 20 và 30:',
        options: ['20', '15', '25', '30'],
        answer: 0,
        explanation: 'Trung bình cộng = (10 + 20 + 30) : 3 = 60 : 3 = 20.'
      },
      {
        difficulty: 'medium',
        question: 'Một hình chữ nhật có chiều dài 12 cm, chiều rộng 5 cm. DIỆN TÍCH của hình chữ nhật đó là:',
        options: ['60 cm²', '34 cm²', '17 cm²', '40 cm²'],
        answer: 0,
        explanation: 'Diện tích hình chữ nhật = dài x rộng = 12 x 5 = 60 cm².'
      },
      {
        difficulty: 'medium',
        question: 'Rút gọn phân số 15/25 về phân số tối giản:',
        options: ['3/5', '1/5', '5/3', '3/10'],
        answer: 0,
        explanation: 'Chia cả tử số và mẫu số cho 5: 15:5 / 25:5 = 3/5.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Tổng của hai số là 50, hiệu của hai số là 10. Tìm SỐ LỚN:',
        options: ['30', '20', '40', '25'],
        answer: 0,
        explanation: 'Số lớn = (Tổng + Hiệu) : 2 = (50 + 10) : 2 = 60 : 2 = 30.'
      },
      {
        difficulty: 'hard',
        question: 'Một người đi xe đạp với vận tốc 15 km/h trong thời gian 3 giờ. QUÃNG ĐƯỜNG người đó đi được là:',
        options: ['45 km', '30 km', '60 km', '50 km'],
        answer: 0,
        explanation: 'Quãng đường s = v x t = 15 x 3 = 45 km.'
      },
      {
        difficulty: 'hard',
        question: 'Điền số tiếp theo trong dãy số Fibonacci: 1, 1, 2, 3, 5, 8, (?)',
        options: ['13', '11', '15', '10'],
        answer: 0,
        explanation: 'Quy luật: Mỗi số bằng tổng 2 số liền trước nó: 5 + 8 = 13.'
      },
      {
        difficulty: 'hard',
        question: 'Vừa gà vừa chó có tất cả 10 con, đếm được 28 cái chân. Hỏi có bao nhiêu CON CHÓ?',
        options: ['4 con chó', '6 con chó', '3 con chó', '5 con chó'],
        answer: 0,
        explanation: 'Giả sử cả 10 con đều là gà thì có 20 chân. Số chân dôi ra: 28 - 20 = 8 chân. Mỗi con chó hơn con gà 2 chân. Số chó là 8 : 2 = 4 con.'
      }
    ]
  },

  // 6. Đấu Trường Thử Thách 60s (Speed Challenge Arena)
  arena: {
    title: 'Đấu Trường Tốc Độ 60 Giây ⚡',
    instructions: 'Phản xạ nhanh như chớp với các câu hỏi thi đấu dồn dập từ dễ đến khó!',
    rewardCoins: 35,
    rewardXP: 45,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Mặt trời mọc ở hướng nào?',
        options: ['Hướng Đông', 'Hướng Tây', 'Hướng Nam', 'Hướng Bắc'],
        answer: 0,
        explanation: 'Mặt trời luôn luôn mọc ở hướng Đông và lặn ở hướng Tây.'
      },
      {
        difficulty: 'easy',
        question: 'Việt Nam có thủ đô là thành phố nào?',
        options: ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Huế'],
        answer: 0,
        explanation: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là Hà Nội.'
      },
      {
        difficulty: 'easy',
        question: 'Một năm nhuận có bao nhiêu ngày?',
        options: ['366 ngày', '365 ngày', '364 ngày', '360 ngày'],
        answer: 0,
        explanation: 'Năm nhuận có tháng Hai có 29 ngày, tổng cộng 366 ngày.'
      },
      {
        difficulty: 'easy',
        question: 'Loài vật nào sau đây được mệnh danh là “Chúa sơn lâm”?',
        options: ['Hổ (Cọp)', 'Sư tử', 'Hươu sao', 'Voi'],
        answer: 0,
        explanation: 'Hổ được mệnh danh là Chúa sơn lâm của rừng rậm.'
      },
      {
        difficulty: 'easy',
        question: 'Cầu vồng sau cơn mưa thường có bao nhiêu màu sắc chính?',
        options: ['7 màu', '5 màu', '6 màu', '8 màu'],
        answer: 0,
        explanation: 'Cầu vồng gồm 7 sắc: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím.'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
        question: 'Đỉnh núi nào được mệnh danh là “Nóc nhà Đông Dương” tại Việt Nam?',
        options: ['Fansipan', 'Bà Đen', 'Langbiang', 'Bạch Mộc Lương Tử'],
        answer: 0,
        explanation: 'Đỉnh Fansipan cao 3.143m tại Sa Pa, Lào Cai là đỉnh núi cao nhất Đông Dương.'
      },
      {
        difficulty: 'medium',
        question: 'Tỉnh Phú Thọ nổi tiếng khắp cả nước với di tích lịch sử quốc gia đặc biệt nào?',
        options: ['Khu di tích lịch sử Đền Hùng', 'Chùa Một Cột', 'Cố đô Hoa Lư', 'Thành nhà Hồ'],
        answer: 0,
        explanation: 'Đền Hùng trên núi Nghĩa Lĩnh, Phú Thọ là nơi thờ cúng các Vua Hùng dựng nước.'
      },
      {
        difficulty: 'medium',
        question: 'Chất khí nào chiếm thể tích lớn nhất trong không khí quanh ta?',
        options: ['Khí Nitơ (khoảng 78%)', 'Khí Oxy (khoảng 21%)', 'Khí Cacbonic', 'Khí Hidro'],
        answer: 0,
        explanation: 'Khí Nitơ chiếm khoảng 78% thể tích bầu khí quyển Trái Đất.'
      },
      {
        difficulty: 'medium',
        question: 'Vịnh biển nào của Việt Nam hai lần được UNESCO vinh danh là Di sản thiên nhiên thế giới?',
        options: ['Vịnh Hạ Long', 'Vịnh Nha Trang', 'Vịnh Cam Ranh', 'Vịnh Lăng Cô'],
        answer: 0,
        explanation: 'Vịnh Hạ Long (Quảng Ninh) là kỳ quan thiên nhiên thế giới nổi tiếng của Việt Nam.'
      },
      {
        difficulty: 'medium',
        question: 'Động vật nào đẻ trứng trong số các loài sau?',
        options: ['Chim bồ câu', 'Cá heo', 'Chuột túi', 'Mèo'],
        answer: 0,
        explanation: 'Chim bồ câu là loài chim đẻ trứng; các loài còn lại đẻ con và nuôi con bằng sữa mẹ.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Vận tốc của ánh sáng trong chân không là khoảng bao nhiêu?',
        options: ['300.000 km/s', '30.000 km/s', '3.000 km/s', '300 km/s'],
        answer: 0,
        explanation: 'Vận tốc ánh sáng xấp xỉ 300.000 km mỗi giây.'
      },
      {
        difficulty: 'hard',
        question: 'Vị vua nào của nước ta đã dời đô từ Hoa Lư về Thăng Long vào năm 1010?',
        options: ['Lý Thái Tổ (Lý Công Uẩn)', 'Lê Lợi', 'Trần Hưng Đạo', 'Quang Trung'],
        answer: 0,
        explanation: 'Mùa thu năm Canh Tuất (1010), vua Lý Thái Tổ ban Chiếu dời đô về thành Đại La (Thăng Long).'
      },
      {
        difficulty: 'hard',
        question: 'Nhạc sĩ nào là tác giả của bài hát Quốc ca Việt Nam (“Tiến quân ca”)?',
        options: ['Văn Cao', 'Trịnh Công Sơn', 'Phạm Tuyên', 'Phong Nhã'],
        answer: 0,
        explanation: 'Nhạc sĩ Văn Cao sáng tác ca khúc “Tiến quân ca” vào cuối năm 1944.'
      },
      {
        difficulty: 'hard',
        question: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?',
        options: ['Sao Thủy (Mercury)', 'Sao Kim', 'Trái Đất', 'Sao Hỏa'],
        answer: 0,
        explanation: 'Sao Thủy là hành tinh nằm gần Mặt Trời nhất trong Thái Dương Hệ.'
      }
    ]
  },

  // 7. Đại Hội Tri Thức (Grand Hall of Wisdom)
  grand: {
    title: 'ĐẠI HỘI TRI THỨC PHÚ THỌ 👑',
    instructions: 'Đại khảo thí tri thức tinh hoa — thử thách toàn diện từ dễ đến khó!',
    rewardCoins: 100,
    rewardXP: 120,
    questions: [
      // DỄ (EASY)
      {
        difficulty: 'easy',
        question: 'Ngày Giỗ Tổ Hùng Vương được tổ chức vào ngày nào âm lịch hàng năm?',
        options: ['Mùng 10 tháng 3 âm lịch', 'Mùng 1 tháng 1 âm lịch', 'Rằm tháng 8 âm lịch', 'Mùng 5 tháng 5 âm lịch'],
        answer: 0,
        explanation: '“Dù ai đi ngược về xuôi / Nhớ ngày Giỗ Tổ mùng mười tháng ba”.'
      },
      {
        difficulty: 'easy',
        question: 'Ai là người đã làm ra Bánh Chưng và Bánh Giầy để dâng lên Vua Hùng thứ 6?',
        options: ['Lang Liêu', 'Mai An Tiêm', 'Chử Đồng Tử', 'Thạch Sanh'],
        answer: 0,
        explanation: 'Lang Liêu đã tạo ra bánh chưng tượng trưng cho Đất, bánh giầy tượng trưng cho Trời.'
      },
      {
        difficulty: 'easy',
        question: 'Tỉnh Phú Thọ nằm ở khu vực địa lý nào của Việt Nam?',
        options: ['Trung du và miền núi phía Bắc', 'Đồng bằng sông Cửu Long', 'Tây Nguyên', 'Duyên hải Nam Trung Bộ'],
        answer: 0,
        explanation: 'Phú Thọ là tỉnh thuộc vùng Trung du và miền núi phía Bắc, được coi là đất Tổ cội nguồn.'
      },
      {
        difficulty: 'easy',
        question: 'Bánh Giầy theo quan niệm dân gian thời Hùng Vương tượng trưng cho điều gì?',
        options: ['Tượng trưng cho Trời (hình tròn, màu trắng)', 'Tượng trưng cho Đất', 'Tượng trưng cho Núi non', 'Tượng trưng cho Biển cả'],
        answer: 0,
        explanation: 'Bánh giầy hình tròn màu trắng ngần tượng trưng cho Trời bao la.'
      },
      {
        difficulty: 'easy',
        question: 'Thành phố trực thuộc tỉnh Phú Thọ là thành phố nào?',
        options: ['Thành phố Việt Trì', 'Thành phố Hạ Long', 'Thành phố Yên Bái', 'Thành phố Tuyên Quang'],
        answer: 0,
        explanation: 'Thành phố Việt Trì là trung tâm kinh tế, chính trị, văn hóa của tỉnh Phú Thọ.'
      },

      // VỪA (MEDIUM)
      {
        difficulty: 'medium',
        question: 'Loại hình nghệ thuật dân gian độc đáo của Phú Thọ được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại là gì?',
        options: ['Hát Xoan Phú Thọ', 'Hát Quan họ', 'Nhã nhạc cung đình', 'Đờn ca tài tử'],
        answer: 0,
        explanation: 'Hát Xoan Phú Thọ là di sản văn hóa phi vật thể quý giá của dân tộc Việt Nam.'
      },
      {
        difficulty: 'medium',
        question: 'Câu nói bất hủ: “Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước” được Bác Hồ căn dặn tại đâu?',
        options: ['Tại Đền Giếng (Khu di tích Đền Hùng, Phú Thọ)', 'Tại Quảng trường Ba Đình', 'Tại Bến cảng Nhà Rồng', 'Tại Tân Trào (Tuyên Quang)'],
        answer: 0,
        explanation: 'Bác Hồ căn dặn Đại đoàn Quân Tiên Phong tại Đền Giếng (Đền Hùng) vào ngày 19/9/1954.'
      },
      {
        difficulty: 'medium',
        question: 'Sông nào sau đây chảy qua địa phận tỉnh Phú Thọ?',
        options: ['Sông Hồng, sông Đà và sông Lô', 'Sông Tiền và sông Hậu', 'Sông Hương và sông Hàn', 'Sông Đồng Nai'],
        answer: 0,
        explanation: 'Phú Thọ là nơi ngã ba sông hợp lưu của ba dòng sông lớn: Sông Hồng (Sông Thao), Sông Đà và Sông Lô.'
      },
      {
        difficulty: 'medium',
        question: 'Cột đá thề trên đỉnh núi Nghĩa Lĩnh gắn liền với lời thề bảo vệ non sông của ai?',
        options: ['Thục Phán An Dương Vương', 'Hai Bà Trưng', 'Lý Nam Đế', 'Ngô Quyền'],
        answer: 0,
        explanation: 'Sau khi được Hùng Vương nhường ngôi, Thục Phán An Dương Vương đã dựng cột đá thề gìn giữ giang sơn.'
      },
      {
        difficulty: 'medium',
        question: 'Trống đồng Đông Sơn cổ đại được các nhà khảo cổ tìm thấy nhiều ở vùng đất nào?',
        options: ['Lưu vực sông Hồng và sông Mã', 'Vùng đồng bằng sông Cửu Long', 'Tây Nguyên', 'Duyên hải Nam Trung Bộ'],
        answer: 0,
        explanation: 'Trống đồng Đông Sơn là đỉnh cao của nền văn hóa đồng thau thời các Vua Hùng dựng nước.'
      },

      // KHÓ (HARD)
      {
        difficulty: 'hard',
        question: 'Tên gọi nước ta dưới thời các Vua Hùng đầu tiên trong lịch sử là gì?',
        options: ['Văn Lang', 'Âu Lạc', 'Đại Cồ Việt', 'Đại Việt'],
        answer: 0,
        explanation: 'Nhà nước đầu tiên trong lịch sử dân tộc ta do các Vua Hùng lập nên mang tên Văn Lang, đóng đô tại Phong Châu (nay thuộc Phú Thọ).'
      },
      {
        difficulty: 'hard',
        question: 'Trận chiến thắng lẫy lừng trên Sông Lô lịch sử (Phú Thọ) gắn liền với cuộc kháng chiến nào?',
        options: ['Chiến dịch Thu - Đông 1947 chống thực dân Pháp', 'Kháng chiến chống quân Mông - Nguyên', 'Chiến dịch Điện Biên Phủ 1954', 'Kháng chiến chống quân Minh'],
        answer: 0,
        explanation: 'Chiến thắng Sông Lô vang dội vào tháng 10/1947 trong Chiến dịch Việt Bắc Thu - Đông bẻ gãy gọng kìm của thực dân Pháp.'
      },
      {
        difficulty: 'hard',
        question: 'Cây cọ và đồi chè xanh mướt là biểu tượng thiên nhiên đặc trưng gắn liền với vùng quê nào?',
        options: ['Đất rừng Trung du Phú Thọ', 'Đồng bằng Bắc Bộ', 'Vùng đất Mũi Cà Mau', 'Rừng ngập mặn Cần Giờ'],
        answer: 0,
        explanation: '“Rừng cọ đồi chè, đồng xanh ngào ngạt” là câu thơ tuyệt đẹp mô tả cảnh sắc Phú Thọ trong thơ Tố Hữu.'
      },
      {
        difficulty: 'hard',
        question: 'Trong truyền thuyết Hùng Vương, Sơn Tinh và Thủy Tinh đến cầu hôn công chúa tên là gì?',
        options: ['Mị Nương', 'Tiên Dung', 'Mỵ Châu', 'An Tiêm'],
        answer: 0,
        explanation: 'Vua Hùng thứ 18 kén rể cho con gái cưng là công chúa Mị Nương.'
      },
      {
        difficulty: 'hard',
        question: 'Khu rừng nguyên sinh quốc gia nằm trên địa phận tỉnh Phú Thọ là vườn quốc gia nào?',
        options: ['Vườn quốc gia Xuân Sơn', 'Vườn quốc gia Cúc Phương', 'Vườn quốc gia Ba Vì', 'Vườn quốc gia Tam Đảo'],
        answer: 0,
        explanation: 'Vườn quốc gia Xuân Sơn tại huyện Tân Sơn, Phú Thọ là khu rừng nguyên sinh giàu đa dạng sinh học.'
      }
    ]
  }
};
