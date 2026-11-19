/**
 * Minigame challenges inside Học Viện Phú Thọ
 * Dựa trên cấu trúc chuẩn từ nguồn học liệu Trường Tiểu học Phú Thọ:
 * Từ vựng, Chính tả, Ngữ văn, Thành ngữ, Toán học, Đấu trường 60s và Đại hội Tri thức.
 * Câu hỏi được phân cấp rõ ràng theo 3 mức độ:
 * - 'easy': Cấp độ Dễ (Nhận biết cơ bản)
 * - 'medium': Cấp độ Vừa (Thông hiểu & vận dụng)
 * - 'hard': Cấp độ Thử thách / Khó (Nâng cao & tư duy sâu)
 * Mỗi khu vực học viện sở hữu ngân hàng 30 câu hỏi phong phú, chuẩn mực sư phạm.
 */

export const MINIGAME_DATA = {
  "vocabulary": {
    "title": "Thư Viện Từ Vựng Tri Thức 📚",
    "instructions": "Khám phá từ đồng nghĩa, từ trái nghĩa, từ ghép và từ láy theo cấp độ từ dễ đến khó!",
    "rewardCoins": 25,
    "rewardXP": 30,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Cặp từ nào dưới đây là cặp TỪ TRÁI NGHĨA?",
        "options": [
          "Nóng - Lạnh",
          "Chăm chỉ - Cần cù",
          "Thông minh - Sáng dạ",
          "Hiền lành - Nhân hậu"
        ],
        "answer": 0,
        "explanation": "“Nóng” và “Lạnh” là hai trạng thái nhiệt độ hoàn toàn đối lập nhau."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây là TỪ LÁY tượng thanh mô tả tiếng chim hót vui tươi?",
        "options": [
          "Ríu rít",
          "Rì rầm",
          "Thầm thì",
          "Ồn ào"
        ],
        "answer": 0,
        "explanation": "“Ríu rít” là từ láy mô tả tiếng chim chuyền cành hót rộn ràng."
      },
      {
        "difficulty": "easy",
        "question": "Tìm từ ĐỒNG NGHĨA với từ “chăm chỉ”:",
        "options": [
          "Cần cù",
          "Lười biếng",
          "Bé nhỏ",
          "Nhanh nhảu"
        ],
        "answer": 0,
        "explanation": "“Cần cù” đồng nghĩa với “chăm chỉ”, chỉ tính chịu khó làm việc."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây chỉ ĐỒ DÙNG HỌC TẬP quen thuộc của học sinh?",
        "options": [
          "Thước kẻ",
          "Cái xẻng",
          "Chiếc chảo",
          "Bếp ga"
        ],
        "answer": 0,
        "explanation": "“Thước kẻ” là đồ dùng học tập gắn liền với học sinh hàng ngày."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây là TỪ LÁY toàn bộ?",
        "options": [
          "Xanh xanh",
          "Xanh ngắt",
          "Xanh lơ",
          "Xanh biếc"
        ],
        "answer": 0,
        "explanation": "“Xanh xanh” lặp lại hoàn toàn âm đầu, vần và thanh điệu."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây là TỪ TRÁI NGHĨA với “vui vẻ”?",
        "options": [
          "Buồn bã",
          "Phấn khởi",
          "Hớn hở",
          "Hân hoan"
        ],
        "answer": 0,
        "explanation": "“Buồn bã” đối lập hoàn toàn về mặt cảm xúc với “vui vẻ”."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây là TỪ GHÉP tổng hợp?",
        "options": [
          "Sách vở",
          "Sách Toán",
          "Xe đạp",
          "Bút bi"
        ],
        "answer": 0,
        "explanation": "“Sách vở” gộp chung tất cả các loại sách và vở, là từ ghép tổng hợp."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây là TỪ GHÉP phân loại?",
        "options": [
          "Xe đạp",
          "Quần áo",
          "Bàn ghế",
          "Cây cối"
        ],
        "answer": 0,
        "explanation": "“Xe đạp” chỉ một loại phương tiện cụ thể phân biệt với xe máy, ô tô."
      },
      {
        "difficulty": "medium",
        "question": "Từ láy nào dưới đây là từ láy tượng hình mô tả dáng đi chậm chạp, còng lưng?",
        "options": [
          "Lom khom",
          "Ào ào",
          "Tí tách",
          "Loảng xoảng"
        ],
        "answer": 0,
        "explanation": "“Lom khom” gợi tả dáng người hơi còng lưng khi di chuyển hoặc làm việc."
      },
      {
        "difficulty": "medium",
        "question": "Tiếng “nhân” trong từ nào dưới đây có nghĩa là “lòng thương người”?",
        "options": [
          "Nhân ái",
          "Nhân dân",
          "Nhân công",
          "Nhân tài"
        ],
        "answer": 0,
        "explanation": "“Nhân ái” là lòng yêu thương con người; “nhân” ở đây nghĩa là lòng nhân từ."
      },
      {
        "difficulty": "medium",
        "question": "Tiếng “đồng” trong từ nào dưới đây có nghĩa là “cùng nhau, cùng một lòng”?",
        "options": [
          "Đồng lòng",
          "Đồng ruộng",
          "Đồng hồ",
          "Đồng tiền"
        ],
        "answer": 0,
        "explanation": "“Đồng lòng” nghĩa là cùng chung một ý chí và suy nghĩ."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào dưới đây là TỪ TRÁI NGHĨA với “tiết kiệm”?",
        "options": [
          "Lãng phí",
          "Kín đáo",
          "Cẩn thận",
          "Chăm sóc"
        ],
        "answer": 0,
        "explanation": "“Lãng phí” tiêu xài bừa bãi, đối lập với “tiết kiệm”."
      },
      {
        "difficulty": "hard",
        "question": "Từ “mắt” trong trường hợp nào dưới đây được dùng theo NGHĨA CHUYỂN?",
        "options": [
          "Quả na mở mắt",
          "Mắt em bé sáng ngời",
          "Đôi mắt tinh tường",
          "Nhắm mắt ngủ ngon"
        ],
        "answer": 0,
        "explanation": "“Mắt” của quả na là kẽ hở giữa các múi na, là nghĩa chuyển dựa trên sự tương đồng hình dáng."
      },
      {
        "difficulty": "hard",
        "question": "Từ Hán - Việt nào dưới đây đồng nghĩa với cụm từ “đất nước, non sông”?",
        "options": [
          "Sơn hà",
          "Hải cảng",
          "Phong cảnh",
          "Địa lý"
        ],
        "answer": 0,
        "explanation": "“Sơn hà” (núi sông) là từ Hán - Việt chỉ đất nước thiêng liêng."
      },
      {
        "difficulty": "hard",
        "question": "Trong câu “Bàn chân đặt lên chiếc bàn gỗ”, hai từ “bàn” thuộc hiện tượng từ nào?",
        "options": [
          "Từ đồng âm",
          "Từ nhiều nghĩa",
          "Từ đồng nghĩa",
          "Từ trái nghĩa"
        ],
        "answer": 0,
        "explanation": "Hai từ “bàn” giống nhau về âm đọc nhưng nghĩa hoàn toàn khác biệt nhau (bộ phận cơ thể vs đồ vật)."
      },
      {
        "difficulty": "hard",
        "question": "Từ “ăn” trong trường hợp nào dưới đây mang nghĩa gốc?",
        "options": [
          "Bé ăn cơm trưa",
          "Chiếc xe ăn xăng",
          "Tàu ăn than",
          "Hai người rất ăn ý"
        ],
        "answer": 0,
        "explanation": "“Bé ăn cơm” là hoạt động nhai và nuốt thức ăn vào dạ dày, là nghĩa gốc ban đầu."
      },
      {
        "difficulty": "hard",
        "question": "Từ láy nào dưới đây có các tiếng có quan hệ LÁY ÂM ĐẦU?",
        "options": [
          "Long lanh",
          "Liêu xiêu",
          "Lưa thưa",
          "Lả lướt"
        ],
        "answer": 0,
        "explanation": "“Long lanh” lặp lại âm đầu “l”, vần “ong” và “anh” khác nhau."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây là TỪ ĐỒNG NGHĨA với từ “dũng cảm”?",
        "options": [
          "Can đảm",
          "Nhút nhát",
          "Sợ sệt",
          "Rụt rè"
        ],
        "answer": 0,
        "explanation": "“Can đảm” đồng nghĩa với “dũng cảm”, chỉ người có tinh thần dám đối mặt với hiểm nguy, khó khăn."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây chỉ TÊN MỘT LOÀI HOA nở đỏ rực sân trường mỗi dịp hè sang?",
        "options": [
          "Hoa phượng vĩ",
          "Bàn ghế",
          "Bút chì",
          "Cặp sách"
        ],
        "answer": 0,
        "explanation": "Hoa phượng vĩ gắn liền với tuổi học trò nở đỏ rực khắp sân trường báo hiệu mùa hè."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây là TỪ LÁY mô tả tiếng suối chảy nhẹ nhàng?",
        "options": [
          "Róc rách",
          "Ầm ầm",
          "Loảng xoảng",
          "Ầm ĩ"
        ],
        "answer": 0,
        "explanation": "“Róc rách” là từ láy mô tả âm thanh trong trẻo, êm đềm của dòng suối nhỏ chảy qua khe đá."
      },
      {
        "difficulty": "easy",
        "question": "Cặp từ nào dưới đây là cặp từ trái nghĩa mô tả kích thước chiều cao?",
        "options": [
          "Cao - Thấp",
          "Hiền - Lành",
          "Đẹp - Xinh",
          "Học - Tập"
        ],
        "answer": 0,
        "explanation": "“Cao” và “Thấp” là hai từ trái nghĩa chỉ kích thước chiều cao đối lập."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây là TỪ LÁY tượng hình mô tả ánh sáng nhấp nháy, lấp lánh như ngàn vì sao?",
        "options": [
          "Lấp lánh",
          "Sáng quắc",
          "Chói lòa",
          "Trắng muốt"
        ],
        "answer": 0,
        "explanation": "“Lấp lánh” là từ láy gợi tả ánh sáng phản chiếu nhấp nháy, lung linh."
      },
      {
        "difficulty": "medium",
        "question": "Trong các từ sau, từ nào là TỪ GHÉP TỔNG HỢP?",
        "options": [
          "Nhà cửa",
          "Nhà ngói",
          "Nhà lá",
          "Nhà tầng"
        ],
        "answer": 0,
        "explanation": "“Nhà cửa” chỉ chung nơi ăn chốn ở của con người, mang ý nghĩa khái quát tổng hợp."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào dưới đây ĐỒNG NGHĨA với từ “gìn giữ”?",
        "options": [
          "Bảo vệ",
          "Phá hủy",
          "Bỏ bê",
          "Lãng quên"
        ],
        "answer": 0,
        "explanation": "“Bảo vệ” đồng nghĩa với “gìn giữ”, đều chỉ hành động che chở giữ gìn cho nguyên vẹn."
      },
      {
        "difficulty": "medium",
        "question": "Tiếng “hữu” trong từ nào dưới đây có nghĩa là “bạn bè thân thiết”?",
        "options": [
          "Hữu nghị",
          "Hữu ích",
          "Phía hữu",
          "Hữu hình"
        ],
        "answer": 0,
        "explanation": "“Hữu” trong “hữu nghị”, “bằng hữu” có nghĩa là bạn bè thân ái, gắn bó."
      },
      {
        "difficulty": "hard",
        "question": "Trong câu thơ: “Mùa xuân là tết trồng cây / Làm cho đất nước càng ngày càng xuân”, từ “xuân” thứ hai mang nghĩa gì?",
        "options": [
          "Tươi trẻ, phát triển tràn đầy sức sống",
          "Mùa đầu tiên trong bốn mùa của năm",
          "Tuổi tác của con người",
          "Màu sắc hoa nở rực rỡ"
        ],
        "answer": 0,
        "explanation": "Từ “xuân” thứ hai được dùng theo nghĩa chuyển, tượng trưng cho sức trẻ và sự phồn vinh của non sông."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào dưới đây là TỪ ĐỒNG ÂM với từ “chỉ” trong “đường kim mũi chỉ”?",
        "options": [
          "Chỉ tay năm ngón",
          "Sợi chỉ trắng",
          "Chỉ may áo",
          "Cuộn chỉ thêu"
        ],
        "answer": 0,
        "explanation": "“Chỉ” trong “chỉ tay” là động từ trỏ/hướng dẫn, phát âm giống nhưng nghĩa hoàn toàn khác với danh từ “sợi chỉ”."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào sau đây là TỪ HÁN - VIỆT dùng để chỉ người có tài năng và trí tuệ vượt bậc?",
        "options": [
          "Nhân tài",
          "Nhân viên",
          "Nhân công",
          "Nhân tính"
        ],
        "answer": 0,
        "explanation": "“Nhân tài” là từ Hán - Việt chỉ người tài năng xuất chúng, có nhiều đóng góp lớn cho đất nước."
      },
      {
        "difficulty": "hard",
        "question": "Trong câu: “Những cánh buồm trắng giương cao lướt sóng ra khơi”, từ “cánh buồm” là hình ảnh hoán dụ chỉ sự vật gì?",
        "options": [
          "Cả con thuyền đang căng buồm ra khơi",
          "Bầu trời và mây trắng ngoài biển",
          "Cánh chim hải âu chao lượn",
          "Ngọn hải đăng chỉ đường"
        ],
        "answer": 0,
        "explanation": "“Cánh buồm” là phép hoán dụ lấy một bộ phận để chỉ toàn thể con thuyền."
      },
      {
        "difficulty": "hard",
        "question": "Từ “chạy” trong câu nào dưới đây được sử dụng theo NGHĨA CHUYỂN?",
        "options": [
          "Chiếc đồng hồ này chạy rất đúng giờ",
          "Bé chạy lon ton trong sân trường",
          "Vận động viên điền kinh đang chạy",
          "Chú chó chạy đuổi theo quả bóng"
        ],
        "answer": 0,
        "explanation": "“Đồng hồ chạy” là nghĩa chuyển chỉ sự vận hành của máy móc, không phải bước chân di chuyển của người hay động vật."
      }
    ]
  },
  "spelling": {
    "title": "Khu Chính Tả Tiếng Việt ✏️",
    "instructions": "Soi lỗi chính tả và rèn luyện chính tả chuẩn mực từ dễ đến khó!",
    "rewardCoins": 25,
    "rewardXP": 30,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Chọn từ viết ĐÚNG chính tả:",
        "options": [
          "Xinh đẹp",
          "Sinh đẹp",
          "Xinh đệp",
          "Sinh đệp"
        ],
        "answer": 0,
        "explanation": "“Xinh đẹp” là từ chuẩn chính tả: “xinh” viết với âm x."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây viết ĐÚNG chính tả khi phân biệt s/x?",
        "options": [
          "Sáng sủa",
          "Xáng sủa",
          "Sáng xủa",
          "Xáng xủa"
        ],
        "answer": 0,
        "explanation": "“Sáng sủa” là cách viết đúng: cả hai tiếng đều viết bằng s."
      },
      {
        "difficulty": "easy",
        "question": "Chọn từ viết ĐÚNG chính tả khi phân biệt ch/tr:",
        "options": [
          "Chăm chỉ",
          "Trăm chỉ",
          "Chăm chỉa",
          "Trăm trỉ"
        ],
        "answer": 0,
        "explanation": "“Chăm chỉ” viết bằng chữ ch."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây viết ĐÚNG quy tắc c/k/q trước các nguyên âm i, e, ê?",
        "options": [
          "Kiên trì",
          "Ciên trì",
          "Qiên trì",
          "Kiêng chì"
        ],
        "answer": 0,
        "explanation": "Trước nguyên âm i, e, ê, âm /k/ luôn viết bằng chữ k."
      },
      {
        "difficulty": "easy",
        "question": "Chọn từ viết ĐÚNG chính tả khi phân biệt l/n:",
        "options": [
          "Nỗ lực",
          "Lỗ lực",
          "Nỗ nực",
          "Lỗ nực"
        ],
        "answer": 0,
        "explanation": "“Nỗ lực” bắt đầu bằng âm n (nỗ) và âm l (lực)."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây viết ĐÚNG chính tả khi phân biệt dấu hỏi / ngã?",
        "options": [
          "Dũng cảm",
          "Dủng cảm",
          "Dũng cãm",
          "Dủng cãm"
        ],
        "answer": 0,
        "explanation": "“Dũng cảm”: “dũng” mang dấu ngã, “cảm” mang dấu hỏi."
      },
      {
        "difficulty": "medium",
        "question": "Chọn từ viết ĐÚNG chính tả:",
        "options": [
          "Xôn xao",
          "Sôn sao",
          "Xôn sao",
          "Sôn xao"
        ],
        "answer": 0,
        "explanation": "“Xôn xao” là từ tượng thanh viết với âm đầu x."
      },
      {
        "difficulty": "medium",
        "question": "Chọn cách viết ĐÚNG chính tả phân biệt d/gi/r:",
        "options": [
          "Gìn giữ",
          "Dìn dững",
          "Rìn rữ",
          "Gìn dững"
        ],
        "answer": 0,
        "explanation": "“Gìn giữ” cả hai tiếng đều viết bằng chữ gi."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào dưới đây viết ĐÚNG chính tả khi phân biệt dấu hỏi / ngã?",
        "options": [
          "Suy nghĩ",
          "Suy nghỉ",
          "Xuy nghĩ",
          "Xuy nghỉ"
        ],
        "answer": 0,
        "explanation": "“Suy nghĩ”: tiếng “nghĩ” mang dấu ngã."
      },
      {
        "difficulty": "medium",
        "question": "Chọn cặp từ viết ĐÚNG chính tả khi phân biệt tr/ch:",
        "options": [
          "Trung thực",
          "Chung thực",
          "Trung thụt",
          "Chung trật"
        ],
        "answer": 0,
        "explanation": "“Trung thực” (thành thật) viết bằng âm đầu tr."
      },
      {
        "difficulty": "medium",
        "question": "Chọn từ viết ĐÚNG chính tả phân biệt s/x:",
        "options": [
          "Sắp xếp",
          "Xắp xếp",
          "Sắp sếp",
          "Xắp xếch"
        ],
        "answer": 0,
        "explanation": "“Sắp xếp”: “sắp” viết s, “xếp” viết x."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào sau đây viết ĐÚNG chính tả phân biệt vần ao/au và uâng:",
        "options": [
          "Bâng khuâng",
          "Bân khưng",
          "Bâng khâng",
          "Bân khuân"
        ],
        "answer": 0,
        "explanation": "“Bâng khuâng” viết bằng vần âng và uâng."
      },
      {
        "difficulty": "hard",
        "question": "Chọn từ viết ĐÚNG chính tả chỉ địa hình khúc khuỷu, hiểm trở:",
        "options": [
          "Ngoằn ngoèo",
          "Ngoằn ngoèo",
          "Ngoằn nghèo",
          "Ngoàng ngoèo"
        ],
        "answer": 0,
        "explanation": "“Ngoằn ngoèo” viết với vần oăn và oeo."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào dưới đây viết ĐÚNG quy tắc viết hoa tên địa lý Việt Nam?",
        "options": [
          "Phú Thọ",
          "Phú thọ",
          "phú Thọ",
          "phú thọ"
        ],
        "answer": 0,
        "explanation": "Tên địa lý riêng Việt Nam phải viết hoa chữ cái đầu của tất cả các âm tiết: Phú Thọ."
      },
      {
        "difficulty": "hard",
        "question": "Cặp từ láy nào dưới đây viết ĐÚNG chính tả dấu hỏi / ngã?",
        "options": [
          "Màu mỡ",
          "Màu mở",
          "Màu mỡ",
          "Mầu mở"
        ],
        "answer": 0,
        "explanation": "“Màu mỡ” (đất đai màu mỡ) viết bằng dấu ngã."
      },
      {
        "difficulty": "easy",
        "question": "Chọn từ viết ĐÚNG chính tả khi phân biệt d/gi/r (chỉ nét đẹp dịu dàng, nết na):",
        "options": [
          "Dịu dàng",
          "Rịu dàng",
          "Giịu dàng",
          "Dịu dằng"
        ],
        "answer": 0,
        "explanation": "“Dịu dàng” viết với âm đầu “d” là từ mô tả tính tình nết na, đằm thắm."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây viết ĐÚNG chính tả khi phân biệt l/n (chỉ một giống lúa thơm dẻo)?",
        "options": [
          "Lúa nếp",
          "Núa lếp",
          "Lúa lếp",
          "Núa nếp"
        ],
        "answer": 0,
        "explanation": "“Lúa nếp” viết đúng chính tả với âm đầu “l” (lúa) và “n” (nếp)."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây viết ĐÚNG chính tả khi phân biệt s/x (mô tả môi trường không bụi bẩn)?",
        "options": [
          "Sạch sẽ",
          "Xạch xẽ",
          "Sạch xẽ",
          "Xạch sẽ"
        ],
        "answer": 0,
        "explanation": "“Sạch sẽ” viết đúng chính tả với hai âm đầu “s”."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây viết ĐÚNG quy tắc viết chữ “gh” hay “g”?",
        "options": [
          "Ghé thăm",
          "Gé thăm",
          "Ghà con",
          "Ghe gớm"
        ],
        "answer": 0,
        "explanation": "Quy tắc chính tả tiếng Việt: “gh” luôn đứng trước các nguyên âm e, ê, i; do đó “ghé thăm” là từ đúng."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào sau đây viết ĐÚNG chính tả khi phân biệt ch/tr (chỉ nơi em đến học tập hàng ngày)?",
        "options": [
          "Trường học",
          "Chường học",
          "Trường trọc",
          "Chường chọc"
        ],
        "answer": 0,
        "explanation": "“Trường học” viết đúng chính tả với âm đầu “tr”."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây viết ĐÚNG chính tả thanh hỏi/ngã (chỉ sự kiên cố, không lay chuyển)?",
        "options": [
          "Vững chãi",
          "Vững chải",
          "Vửng chãi",
          "Vửng chải"
        ],
        "answer": 0,
        "explanation": "“Vững chãi” cả hai tiếng đều mang thanh ngã (~), chỉ sự vững vàng chắc chắn."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây viết ĐÚNG chính tả khi phân biệt ng/ngh?",
        "options": [
          "Nghề nghiệp",
          "Ngề ngiệp",
          "Nghề ngiệp",
          "Ngề nghiệp"
        ],
        "answer": 0,
        "explanation": "Âm “ngh” đi với các nguyên âm e, ê, i nên viết đúng là “nghề nghiệp”."
      },
      {
        "difficulty": "medium",
        "question": "Chọn từ viết ĐÚNG chính tả phân biệt r/d/gi (chỉ vẻ mặt rạng rỡ, tươi tắn):",
        "options": [
          "Rạng ngời",
          "Dạng ngời",
          "Giạng ngời",
          "Rạng ngờ"
        ],
        "answer": 0,
        "explanation": "“Rạng ngời” viết đúng với âm đầu “r”, miêu tả nét mặt tươi vui bừng sáng."
      },
      {
        "difficulty": "medium",
        "question": "Từ nào sau đây viết ĐÚNG chính tả thanh hỏi/ngã (chỉ ký ức đẹp đẽ đáng nhớ của tuổi thơ)?",
        "options": [
          "Kỷ niệm",
          "Kỹ niệm",
          "Kỉ niện",
          "Kỷ niện"
        ],
        "answer": 0,
        "explanation": "“Kỷ niệm” (hoặc kỉ niệm) mang dấu hỏi (?), chỉ những ký ức đẹp đáng ghi nhớ."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào sau đây viết ĐÚNG quy tắc viết hoa tên cơ quan, trường học?",
        "options": [
          "Trường Tiểu học Phú Thọ",
          "Trường tiểu học phú thọ",
          "Trường Tiểu Học Phú Thọ",
          "trường tiểu học Phú Thọ"
        ],
        "answer": 0,
        "explanation": "Quy tắc viết hoa tên cơ quan, tổ chức: viết hoa chữ cái đầu của các từ/cụm từ cấu thành tên riêng."
      },
      {
        "difficulty": "hard",
        "question": "Chọn từ viết ĐÚNG chính tả miêu tả hình dáng uốn khúc, quanh co khúc khuỷu:",
        "options": [
          "Ngoằn ngoèo",
          "Ngoằn nghèo",
          "Ngoằn ngoẻo",
          "Ngoằn nghoèo"
        ],
        "answer": 0,
        "explanation": "“Ngoằn ngoèo” viết với vần oăn và oeo là từ tượng hình chuẩn xác trong từ điển tiếng Việt."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào sau đây viết ĐÚNG chính tả khi phân biệt ch/tr (chỉ sự trơ trọi, đơn độc một mình)?",
        "options": [
          "Chỏng trơ",
          "Trỏng chơ",
          "Chỏng chơ",
          "Trỏng trơ"
        ],
        "answer": 0,
        "explanation": "“Chỏng trơ” viết đúng với âm đầu “ch” ở tiếng chỏng và “tr” ở tiếng trơ."
      },
      {
        "difficulty": "hard",
        "question": "Chọn cách viết ĐÚNG chính tả của từ biểu thị sự chia ngọt sẻ bùi, đồng cảm:",
        "options": [
          "San sẻ",
          "San xẻ",
          "Xan sẻ",
          "Xan xẻ"
        ],
        "answer": 0,
        "explanation": "“San sẻ” viết với âm đầu “s” và dấu hỏi (?) ở tiếng sẻ (chia sẻ, nâng đỡ nhau)."
      },
      {
        "difficulty": "hard",
        "question": "Từ nào dưới đây viết ĐÚNG chính tả khi phân biệt d/gi/r (chỉ hành động gom góp, tiết kiệm)?",
        "options": [
          "Dành dụm",
          "Giành dụm",
          "Rành dụm",
          "Dành giụm"
        ],
        "answer": 0,
        "explanation": "“Dành dụm” (tiết kiệm, tích góp) viết với âm “d”; phân biệt với “tranh giành” viết với “gi”."
      },
      {
        "difficulty": "hard",
        "question": "Chọn từ viết ĐÚNG chính tả khi phân biệt s/x (chỉ thành tích xuất chúng, vượt trội):",
        "options": [
          "Xuất sắc",
          "Suất sắc",
          "Xuất xắc",
          "Suất xắc"
        ],
        "answer": 0,
        "explanation": "“Xuất sắc” viết với “x” ở tiếng xuất (vượt trội) và “s” ở tiếng sắc."
      }
    ]
  },
  "literature": {
    "title": "Nhà Ngữ Văn & Ghép Câu 📜",
    "instructions": "Rèn luyện ngữ pháp, cấu trúc câu và các biện pháp tu từ nghệ thuật từ dễ đến khó!",
    "rewardCoins": 25,
    "rewardXP": 30,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Trong câu: “Những chú chim hót ríu rít trên cành bàng.”, bộ phận CHỦ NGỮ là gì?",
        "options": [
          "Những chú chim",
          "hót ríu rít",
          "trên cành bàng",
          "Những chú chim hót"
        ],
        "answer": 0,
        "explanation": "“Những chú chim” trả lời cho câu hỏi “Con gì?”."
      },
      {
        "difficulty": "easy",
        "question": "Trong câu: “Bạn Lan là học sinh giỏi của lớp 4A.”, bộ phận VỊ NGỮ là:",
        "options": [
          "là học sinh giỏi của lớp 4A",
          "Bạn Lan",
          "học sinh giỏi",
          "của lớp 4A"
        ],
        "answer": 0,
        "explanation": "Vị ngữ nối với chủ ngữ bằng từ “là” và trả lời câu hỏi “Là gì?”."
      },
      {
        "difficulty": "easy",
        "question": "Dấu câu nào dùng để KẾT THÚC CÂU HỎI?",
        "options": [
          "Dấu chấm hỏi (?)",
          "Dấu chấm (.)",
          "Dấu chấm than (!)",
          "Dấu phẩy (,)"
        ],
        "answer": 0,
        "explanation": "Dấu chấm hỏi (?) được đặt ở cuối câu nghi vấn, câu hỏi."
      },
      {
        "difficulty": "easy",
        "question": "Câu nào dưới đây là CÂU KỂ “Ai làm gì?”?",
        "options": [
          "Các bạn học sinh đang chăm chỉ học bài.",
          "Ngôi trường Phú Thọ rất đẹp.",
          "Em là học sinh lớp bốn.",
          "Bầu trời mùa thu trong xanh."
        ],
        "answer": 0,
        "explanation": "Vị ngữ “đang chăm chỉ học bài” nêu hoạt động của các bạn học sinh."
      },
      {
        "difficulty": "easy",
        "question": "Dấu câu nào dùng để NGĂN CÁCH các vế câu hoặc các từ cùng giữ chức vụ trong câu?",
        "options": [
          "Dấu phẩy (,)",
          "Dấu chấm (.)",
          "Dấu chấm hỏi (?)",
          "Dấu chấm than (!)"
        ],
        "answer": 0,
        "explanation": "Dấu phẩy (,) dùng để ngăn cách các bộ phận cùng chức vụ hoặc các vế trong câu."
      },
      {
        "difficulty": "easy",
        "question": "Trong câu “Trường Tiểu học Phú Thọ rất khang trang và sạch đẹp.”, bộ phận VỊ NGỮ là:",
        "options": [
          "rất khang trang và sạch đẹp",
          "Trường Tiểu học",
          "Phú Thọ",
          "sạch đẹp"
        ],
        "answer": 0,
        "explanation": "“Rất khang trang và sạch đẹp” trả lời câu hỏi “Thế nào?”, là vị ngữ chỉ đặc điểm."
      },
      {
        "difficulty": "medium",
        "question": "Câu nào sau đây sử dụng biện pháp nghệ thuật NHÂN HÓA?",
        "options": [
          "Chị gió nhẹ nhàng lướt qua tán lá cây.",
          "Bông hoa hồng nở rất đẹp.",
          "Mặt trời đỏ rực như quả cầu lửa.",
          "Cây bàng cao lớn trong sân trường."
        ],
        "answer": 0,
        "explanation": "Gọi gió là “chị” và gán hành động “lướt qua” là biện pháp nhân hóa."
      },
      {
        "difficulty": "medium",
        "question": "Câu nào dưới đây sử dụng biện pháp nghệ thuật SO SÁNH?",
        "options": [
          "Mặt trăng tròn vành vạnh như chiếc đĩa ngọc.",
          "Bác bàng già đứng sừng sững giữa sân trường.",
          "Gió thổi rì rào qua rặng tre xanh.",
          "Em rất yêu quý ngôi trường thân yêu của mình."
        ],
        "answer": 0,
        "explanation": "Có từ so sánh “như” liên kết giữa “mặt trăng tròn” và “chiếc đĩa ngọc”."
      },
      {
        "difficulty": "medium",
        "question": "Xác định TRẠNG NGỮ trong câu: “Sáng sớm hôm nay, em hân hoan bước vào cổng trường Phú Thọ.”",
        "options": [
          "Sáng sớm hôm nay",
          "em hân hoan",
          "bước vào cổng trường",
          "cổng trường Phú Thọ"
        ],
        "answer": 0,
        "explanation": "“Sáng sớm hôm nay” là trạng ngữ chỉ thời gian."
      },
      {
        "difficulty": "medium",
        "question": "Xác định TRẠNG NGỮ CHỈ NƠI CHỐN trong câu: “Trên cành bàng cổ thụ, những chú chim non cất tiếng hót líu lo.”",
        "options": [
          "Trên cành bàng cổ thụ",
          "những chú chim non",
          "cất tiếng hót líu lo",
          "chim non"
        ],
        "answer": 0,
        "explanation": "“Trên cành bàng cổ thụ” trả lời câu hỏi “Ở đâu?”, là trạng ngữ chỉ nơi chốn."
      },
      {
        "difficulty": "medium",
        "question": "Từ ngữ nào nối hai vế so sánh trong câu: “Mặt trời như một quả cầu lửa khổng lồ.”?",
        "options": [
          "như",
          "một",
          "quả cầu",
          "khổng lồ"
        ],
        "answer": 0,
        "explanation": "“Như” là từ chỉ ý so sánh giữa hai sự vật."
      },
      {
        "difficulty": "hard",
        "question": "Cặp quan hệ từ trong câu “Vì trời mưa to nên đường đến trường rất trơn.” biểu thị mối quan hệ gì?",
        "options": [
          "Nguyên nhân - Kết quả",
          "Điều kiện - Kết quả",
          "Tương phản",
          "Tăng tiến"
        ],
        "answer": 0,
        "explanation": "“Vì... nên...” là cặp quan hệ từ chỉ nguyên nhân dẫn đến kết quả."
      },
      {
        "difficulty": "hard",
        "question": "Câu nào dưới đây là CÂU GHÉP có hai vế câu nối trực tiếp không dùng từ nối?",
        "options": [
          "Mây bay, gió thổi, mưa bắt đầu rơi.",
          "Tuy trời mưa nhưng chúng em vẫn đi học đúng giờ.",
          "Nếu em chăm học thì em sẽ đạt điểm cao.",
          "Hoa hồng và hoa cúc cùng khoe sắc trong vườn."
        ],
        "answer": 0,
        "explanation": "Các vế câu có cấu trúc C-V riêng biệt và được ngăn cách bằng dấu phẩy, không dùng quan hệ từ."
      },
      {
        "difficulty": "hard",
        "question": "Biện pháp tu từ nào được sử dụng trong câu: “Bàn tay mẹ dịu dàng sưởi ấm tâm hồn em suốt tuổi thơ.”?",
        "options": [
          "Hoán dụ / Ẩn dụ",
          "So sánh",
          "Nói quá",
          "Chơi chữ"
        ],
        "answer": 0,
        "explanation": "“Bàn tay mẹ” lấy bộ phận để gọi toàn thể người mẹ chở che, mang tính hoán dụ và biểu cảm sâu sắc."
      },
      {
        "difficulty": "hard",
        "question": "Tác dụng của DẤU NGOẶC KÉP trong câu: Bác Hồ từng căn dặn: “Không có gì quý hơn độc lập, tự do.” là gì?",
        "options": [
          "Dẫn lời nói trực tiếp của nhân vật",
          "Đánh dấu từ ngữ được dùng với ý nghĩa đặc biệt",
          "Giải thích cho bộ phận đứng trước",
          "Ngăn cách các vế câu ghép"
        ],
        "answer": 0,
        "explanation": "Dấu ngoặc kép dùng để đánh dấu câu danh ngôn, lời dẫn trực tiếp của Chủ tịch Hồ Chí Minh."
      },
      {
        "difficulty": "hard",
        "question": "Trong đoạn thơ: “Tre xanh, xanh tự bao giờ / Chuyện ngày xưa đã có bờ tre xanh”, từ “xanh” được lặp lại 3 lần nhằm mục đích gì?",
        "options": [
          "Điệp từ nhấn mạnh sức sống bền bỉ, trường tồn của cây tre Việt Nam",
          "Chỉ để câu thơ thêm vần",
          "Tả màu sắc của lá tre",
          "Không có tác dụng nghệ thuật"
        ],
        "answer": 0,
        "explanation": "Điệp từ “xanh” khắc sâu vẻ đẹp trường tồn, dẻo dai và sức sống mãnh liệt của tre làng quê."
      },
      {
        "difficulty": "easy",
        "question": "Câu nào dưới đây là CÂU CẢM THÁN bày tỏ cảm xúc vui mừng, trầm trồ?",
        "options": [
          "Ôi, bông hoa hồng này đẹp quá!",
          "Bông hoa hồng nở ngoài ban công.",
          "Ai đã tưới nước cho hoa hồng?",
          "Bạn hãy chăm sóc cây hoa cẩn thận nhé!"
        ],
        "answer": 0,
        "explanation": "Câu cảm thán sử dụng từ ngữ bộc lộ cảm xúc “Ôi... quá!” và kết thúc bằng dấu chấm than (!)."
      },
      {
        "difficulty": "easy",
        "question": "Dấu câu nào được dùng để KẾT THÚC MỘT CÂU KỂ lại sự việc?",
        "options": [
          "Dấu chấm (.)",
          "Dấu chấm hỏi (?)",
          "Dấu chấm than (!)",
          "Dấu hai chấm (:)"
        ],
        "answer": 0,
        "explanation": "Dấu chấm (.) đặt ở cuối câu kể lại sự việc, hiện tượng đã kết thúc trọn vẹn."
      },
      {
        "difficulty": "easy",
        "question": "Câu nào dưới đây là CÂU CẦU KHIẾN (dùng để yêu cầu, đề nghị, khuyên bảo)?",
        "options": [
          "Chúng mình hãy cùng nhau giữ gìn trường lớp xanh sạch đẹp nhé!",
          "Lớp học của chúng em rất sạch sẽ và ngăn nắp.",
          "Ai đã quét sân trường sáng hôm nay?",
          "Trường học của em đẹp làm sao!"
        ],
        "answer": 0,
        "explanation": "Câu cầu khiến có từ ngữ cầu khiến “hãy... nhé!” nhằm kêu gọi, khuyên bảo mọi người cùng hành động."
      },
      {
        "difficulty": "easy",
        "question": "Từ nào dưới đây là TỪ CHỈ HOẠT ĐỘNG của học sinh trong giờ ra chơi trên sân trường?",
        "options": [
          "Nhảy dây",
          "Quyển sách",
          "Sân trường",
          "Thầy giáo"
        ],
        "answer": 0,
        "explanation": "“Nhảy dây” là từ chỉ hoạt động vui chơi thể chất quen thuộc của các bạn học sinh."
      },
      {
        "difficulty": "medium",
        "question": "Biện pháp nghệ thuật nào được sử dụng trong câu thơ: “Mặt trời đạp lửa thức dậy”?",
        "options": [
          "Nhân hóa",
          "So sánh",
          "Điệp từ",
          "Đảo ngữ"
        ],
        "answer": 0,
        "explanation": "Gán những hành động của con người (“đạp lửa”, “thức dậy”) cho Mặt trời là biện pháp tu từ nhân hóa."
      },
      {
        "difficulty": "medium",
        "question": "Câu nào dưới đây thuộc mẫu câu “Ai là gì?” dùng để giới thiệu, nhận định?",
        "options": [
          "Hà Nội là thủ đô ngàn năm văn hiến của nước ta.",
          "Bé Mai đang chăm chú đọc cuốn truyện thiếu nhi.",
          "Bác nông dân đang miệt mài cày ruộng trên đồng.",
          "Đàn chim sâu chuyền cành ríu rít tìm mồi."
        ],
        "answer": 0,
        "explanation": "Câu sử dụng từ “là” để giới thiệu, định nghĩa hoặc nhận định thuộc kiểu câu “Ai là gì?”."
      },
      {
        "difficulty": "medium",
        "question": "Xác định VỊ NGỮ trong câu: “Đàn chim én đang chao liệng trên bầu trời xanh thẳm.”:",
        "options": [
          "đang chao liệng trên bầu trời xanh thẳm",
          "Đàn chim én",
          "trên bầu trời xanh thẳm",
          "chao liệng"
        ],
        "answer": 0,
        "explanation": "Vị ngữ trả lời cho câu hỏi “làm gì?”, bắt đầu từ cụm động từ “đang chao liệng trên bầu trời xanh thẳm”."
      },
      {
        "difficulty": "medium",
        "question": "Câu nào sau đây sử dụng biện pháp SO SÁNH NGANG BẰNG?",
        "options": [
          "Mặt hồ phẳng lặng như một tấm gương khổng lồ.",
          "Trăng đêm rằm sáng hơn đêm trước.",
          "Cây bàng đứng sừng sững bên góc sân trường.",
          "Bác kim giờ bước từng bước chậm chạp."
        ],
        "answer": 0,
        "explanation": "Từ so sánh “như” kết nối hình ảnh “mặt hồ phẳng lặng” với “tấm gương khổng lồ”."
      },
      {
        "difficulty": "medium",
        "question": "Dấu hai chấm (:) trong câu sau có tác dụng gì: “Mẹ dặn em: Phải luôn lễ phép với thầy cô.”?",
        "options": [
          "Báo hiệu lời nói trực tiếp của nhân vật",
          "Giải thích lý do cho mệnh đề trước",
          "Liệt kê các sự vật sự việc",
          "Báo hiệu kết thúc một đoạn văn"
        ],
        "answer": 0,
        "explanation": "Dấu hai chấm phối hợp với chữ viết hoa đầu câu báo hiệu lời dặn dò trực tiếp của mẹ."
      },
      {
        "difficulty": "hard",
        "question": "Xác định câu ghép có mối quan hệ TƯƠNG PHẢN (đối lập ý nghĩa) giữa hai vế câu:",
        "options": [
          "Tuy hoàn cảnh khó khăn nhưng bạn Nam vẫn luôn vươn lên học giỏi.",
          "Vì trời mưa rào nên chuyến cắm trại bị dời lại.",
          "Nếu em nỗ lực chăm chỉ thì em sẽ đạt kết quả tốt.",
          "Chẳng những Hoa chăm học mà bạn ấy còn hát rất hay."
        ],
        "answer": 0,
        "explanation": "Cặp quan hệ từ “Tuy... nhưng...” biểu thị mối quan hệ tương phản đối lập giữa hoàn cảnh và ý chí nghị lực."
      },
      {
        "difficulty": "hard",
        "question": "Biện pháp tu từ nào được sử dụng trong hai câu thơ: “Bác đã đi rồi sao, Bác ơi! / Mùa thu đang đẹp, nắng xanh trời” (Tố Hữu)?",
        "options": [
          "Nói giảm nói tránh",
          "So sánh ngang bằng",
          "Nhân hóa sự vật",
          "Điệp từ cách quãng"
        ],
        "answer": 0,
        "explanation": "Từ “đi” được dùng để nói giảm nói tránh cho sự qua đời của Chủ tịch Hồ Chí Minh, giúp giảm bớt nỗi đau xót vô hạn."
      },
      {
        "difficulty": "hard",
        "question": "Câu văn nào dưới đây có cụm CHỦ - VỊ làm thành phần định ngữ bổ nghĩa cho danh từ?",
        "options": [
          "Quyển sách bố mua cho em nhân ngày sinh nhật rất bổ ích.",
          "Bố tặng em một cuốn sách hay.",
          "Em rất thích đọc sách báo mỗi ngày.",
          "Cuốn sách này có tranh vẽ rất sinh động."
        ],
        "answer": 0,
        "explanation": "Cụm “bố mua cho em nhân ngày sinh nhật” (có đủ C-V) đóng vai trò định ngữ làm rõ nghĩa cho danh từ “Quyển sách”."
      },
      {
        "difficulty": "hard",
        "question": "Trong bài thơ “Hạt gạo làng ta” của nhà thơ Trần Đăng Khoa, hạt gạo kết tinh hương vị phù sa của dòng sông nào?",
        "options": [
          "Sông Kinh Thầy",
          "Sông Hồng",
          "Sông Lô",
          "Sông Đáy"
        ],
        "answer": 0,
        "explanation": "“Hạt gạo làng ta / Có vị phù sa / Của sông Kinh Thầy / Có hương sen thơm / Trong hồ nước đầy...”."
      },
      {
        "difficulty": "hard",
        "question": "Tác dụng của DẤU GẠCH NGANG trong câu: “Mùa xuân - mùa của trăm hoa đua nở - đã về tràn ngập khắp thôn xóm.” là gì?",
        "options": [
          "Đánh dấu bộ phận chú thích, giải thích thêm trong câu",
          "Đánh dấu lời nói trực tiếp của nhân vật",
          "Đánh dấu các ý liệt kê trong đoạn văn",
          "Nối các từ ngữ trong một liên danh"
        ],
        "answer": 0,
        "explanation": "Hai dấu gạch ngang đặt trước và sau cụm từ để đánh dấu thành phần chú thích giải thích rõ hơn về mùa xuân."
      }
    ]
  },
  "idiom": {
    "title": "Quảng Trường Thành Ngữ & Tục Ngữ 🧩",
    "instructions": "Khám phá kho tàng ca dao tục ngữ và bài học cha ông từ dễ đến khó!",
    "rewardCoins": 25,
    "rewardXP": 30,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Hoàn thành câu tục ngữ: “Học đi đôi với ......”",
        "options": [
          "hành",
          "nghỉ",
          "chơi",
          "thi"
        ],
        "answer": 0,
        "explanation": "“Học đi đôi với hành” khuyên chúng ta học lý thuyết phải gắn liền với thực hành."
      },
      {
        "difficulty": "easy",
        "question": "Điền từ còn thiếu vào câu thành ngữ: “Uống nước nhớ ......”",
        "options": [
          "nguồn",
          "sông",
          "biển",
          "suối"
        ],
        "answer": 0,
        "explanation": "“Uống nước nhớ nguồn” nhắc nhở đạo lý biết ơn tổ tiên, cội nguồn."
      },
      {
        "difficulty": "easy",
        "question": "Hoàn thành câu tục ngữ: “Có công mài sắt, có ngày nên ......”",
        "options": [
          "kim",
          "dao",
          "kéo",
          "chày"
        ],
        "answer": 0,
        "explanation": "“Có công mài sắt, có ngày nên kim” khuyên nhủ lòng kiên trì sẽ gặt hái thành công."
      },
      {
        "difficulty": "easy",
        "question": "Điền từ còn thiếu: “Ăn quả nhớ kẻ ...... cây”",
        "options": [
          "trồng",
          "chặt",
          "hái",
          "tưới"
        ],
        "answer": 0,
        "explanation": "“Ăn quả nhớ kẻ trồng cây” răn dạy lòng biết ơn người đã tạo ra thành quả."
      },
      {
        "difficulty": "easy",
        "question": "Hoàn thành câu thành ngữ: “Lá lành đùm lá ......”",
        "options": [
          "rách",
          "vàng",
          "héo",
          "rụng"
        ],
        "answer": 0,
        "explanation": "“Lá lành đùm lá rách” khuyên nhủ con người biết cưu mang, giúp đỡ lẫn nhau khi hoạn nạn."
      },
      {
        "difficulty": "easy",
        "question": "Điền từ còn thiếu vào câu tục ngữ: “Thương người như thể thương ......”",
        "options": [
          "thân",
          "nhà",
          "bạn",
          "mình"
        ],
        "answer": 0,
        "explanation": "“Thương người như thể thương thân” dạy lòng nhân ái, yêu thương người khác như chính bản thân mình."
      },
      {
        "difficulty": "medium",
        "question": "Câu thành ngữ “Chân lấm tay bùn” gợi tả điều gì?",
        "options": [
          "Sự lao động vất vả, lam lũ của người nông dân",
          "Người lười biếng không chịu tắm giặt",
          "Trẻ em nghịch bẩn ngoài đồng",
          "Người thợ sửa xe ô tô"
        ],
        "answer": 0,
        "explanation": "“Chân lấm tay bùn” ca ngợi sự chăm chỉ, chịu thương chịu khó của người nông dân."
      },
      {
        "difficulty": "medium",
        "question": "Hoàn thành câu ca dao: “Một cây làm chẳng nên non, Ba cây chụm lại nên hòn ...... cao.”",
        "options": [
          "núi",
          "đá",
          "đồi",
          "đất"
        ],
        "answer": 0,
        "explanation": "Câu ca dao ca ngợi sức mạnh của sự đoàn kết và hợp lực."
      },
      {
        "difficulty": "medium",
        "question": "Câu tục ngữ “Gần mực thì đen, gần đèn thì sáng” khuyên chúng ta điều gì?",
        "options": [
          "Nên chọn bạn tốt, môi trường lành mạnh để học tập và rèn luyện",
          "Nên tiết kiệm mực viết và bóng đèn",
          "Ban đêm phải bật đèn sáng để học bài",
          "Không nên dùng mực đen để viết thư"
        ],
        "answer": 0,
        "explanation": "Môi trường sống và bạn bè xung quanh ảnh hưởng rất lớn đến tính cách của mỗi người."
      },
      {
        "difficulty": "medium",
        "question": "Câu thành ngữ “Đi một ngày đàng, học một sàng khôn” khuyên chúng ta điều gì?",
        "options": [
          "Tích cực đi ra ngoài trải nghiệm, học hỏi để mở rộng hiểu biết",
          "Mỗi ngày chỉ cần đi một đoạn đường",
          "Nên mang theo sàng khi đi đường",
          "Không nên ở nhà quá nhiều"
        ],
        "answer": 0,
        "explanation": "Càng đi nhiều nơi, trải nghiệm nhiều thực tế thì vốn tri thức và sự hiểu biết càng phong phú."
      },
      {
        "difficulty": "medium",
        "question": "Điền từ còn thiếu: “Bầu ơi thương lấy bí cùng, Tuy rằng khác ...... nhưng chung một giàn.”",
        "options": [
          "giống",
          "nhà",
          "cây",
          "lá"
        ],
        "answer": 0,
        "explanation": "Câu ca dao nhắc nhở đồng bào cùng sống trên một đất nước phải đoàn kết, thương yêu nhau."
      },
      {
        "difficulty": "medium",
        "question": "Câu thành ngữ “Chị ngã em nâng” nói về truyền thống đạo đức nào?",
        "options": [
          "Tình cảm gắn bó, tương trợ đùm bọc giữa anh chị em trong gia đình",
          "Kỹ năng giúp đỡ người bị ngã trên đường",
          "Quy tắc khi tham gia trò chơi vận động",
          "Bài tập thể dục buổi sáng"
        ],
        "answer": 0,
        "explanation": "“Chị ngã em nâng” ca ngợi tình anh chị em ruột thịt yêu thương nhau."
      },
      {
        "difficulty": "hard",
        "question": "Thành ngữ “Đồng cam cộng khổ” có ý nghĩa là gì?",
        "options": [
          "Cùng nhau chia sẻ ngọt bùi và gánh vác gian nan, cay đắng",
          "Cùng nhau ăn quả cam và quả khổ qua",
          "Cùng nhau đi chợ mua hoa quả",
          "Cùng nhau thi đua giải toán nhanh"
        ],
        "answer": 0,
        "explanation": "“Cam” là ngọt, “khổ” là đắng; thành ngữ chỉ sự đồng lòng vượt qua mọi thử thách."
      },
      {
        "difficulty": "hard",
        "question": "Hoàn thành câu châm ngôn giáo dục: “Tiên học lễ, hậu học ......”",
        "options": [
          "văn",
          "toán",
          "vẽ",
          "hát"
        ],
        "answer": 0,
        "explanation": "“Tiên học lễ, hậu học văn” nhắc nhở học sinh trước hết phải học đạo đức, lễ nghĩa rồi mới học tri thức văn hóa."
      },
      {
        "difficulty": "hard",
        "question": "Câu tục ngữ “Tấc đất tấc vàng” sử dụng biện pháp tu từ nào để nhấn mạnh giá trị của đất đai?",
        "options": [
          "So sánh ngầm (Ẩn dụ)",
          "Nhân hóa",
          "Nói quá",
          "Chơi chữ"
        ],
        "answer": 0,
        "explanation": "Đất quý giá như vàng bạc, so sánh tấc đất ngang hàng với tấc vàng để khuyên quý trọng đất đai bờ cõi."
      },
      {
        "difficulty": "hard",
        "question": "Thành ngữ nào dưới đây khuyên con người phải có lòng kiên định, không dao động trước khó khăn?",
        "options": [
          "Vững như bàn thạch",
          "Gió chiều nào theo chiều ấy",
          "Nước chảy bèo trôi",
          "Ba chìm bảy nổi"
        ],
        "answer": 0,
        "explanation": "“Vững như bàn thạch” chỉ sự kiên định, vững chãi, không gì lay chuyển nổi."
      },
      {
        "difficulty": "easy",
        "question": "Hoàn thành câu tục ngữ quen thuộc: “Gần mực thì đen, gần đèn thì ......”",
        "options": [
          "Sáng",
          "Tối",
          "Đỏ",
          "Vàng"
        ],
        "answer": 0,
        "explanation": "Tục ngữ có câu: “Gần mực thì đen, gần đèn thì rạng (sáng)”, khuyên ta nên chọn bạn tốt, môi trường tốt để noi theo."
      },
      {
        "difficulty": "easy",
        "question": "Điền từ còn thiếu vào thành ngữ rèn luyện học tập: “Muốn biết phải hỏi, muốn giỏi phải ......”",
        "options": [
          "Học",
          "Chơi",
          "Làm",
          "Nói"
        ],
        "answer": 0,
        "explanation": "“Muốn biết phải hỏi, muốn giỏi phải học” nhắc nhở tinh thần hiếu học, cầu thị và luôn rèn luyện tri thức."
      },
      {
        "difficulty": "easy",
        "question": "Hoàn thành câu ca dao hiếu thảo: “Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong ...... chảy ra”",
        "options": [
          "Nguồn",
          "Suối",
          "Sông",
          "Hồ"
        ],
        "answer": 0,
        "explanation": "“Nghĩa mẹ như nước trong nguồn chảy ra” ca ngợi công ơn sinh thành dưỡng dục vô bờ bến của cha mẹ."
      },
      {
        "difficulty": "easy",
        "question": "Điền từ còn thiếu vào câu tục ngữ: “Học thầy không tày học ......”",
        "options": [
          "Bạn",
          "Sách",
          "Trường",
          "Đời"
        ],
        "answer": 0,
        "explanation": "“Học thầy không tày học bạn” khuyên chúng ta ngoài học thầy còn phải biết học hỏi lẫn nhau từ bạn bè."
      },
      {
        "difficulty": "medium",
        "question": "Câu thành ngữ “Môi hở răng lạnh” nhắc nhở chúng ta điều gì trong cuộc sống gia đình, xã hội?",
        "options": [
          "Những người ruột thịt, gắn bó thân thuộc phải luôn chở che, bảo vệ lẫn nhau",
          "Cần phải giữ ấm cơ thể trong mùa đông giá lạnh",
          "Khi nói năng cần chú ý giữ gìn răng miệng",
          "Nên ăn thức ăn ấm nóng để tránh đau họng"
        ],
        "answer": 0,
        "explanation": "“Môi hở răng lạnh” ví như anh em ruột thịt gắn bó, nếu một người gặp khó khăn hoạn nạn thì người kia cũng bị tổn thương."
      },
      {
        "difficulty": "medium",
        "question": "Điền từ còn thiếu vào câu tục ngữ khuyên giữ gìn phẩm giá: “Giấy rách phải giữ lấy ......”",
        "options": [
          "Lề",
          "Bìa",
          "Chữ",
          "Trang"
        ],
        "answer": 0,
        "explanation": "“Giấy rách phải giữ lấy lề” khuyên con người dù rơi vào cảnh nghèo nàn cơ hàn vẫn phải giữ trọn nền nếp gia phong và nhân phẩm."
      },
      {
        "difficulty": "medium",
        "question": "Câu thành ngữ “Chuột sa chĩnh gạo” miêu tả hoàn cảnh nào?",
        "options": [
          "May mắn gặp được nơi ấm no, đầy đủ ngoài mong đợi",
          "Bị rơi vào hoàn cảnh trắc trở, gian nan",
          "Chăm chỉ gom góp của cải lương thực",
          "Hành vi lén lút ăn trộm tài sản"
        ],
        "answer": 0,
        "explanation": "“Chuột sa chĩnh gạo” ví người tình cờ gặp được nơi giàu sang sung túc, ấm no thuận lợi."
      },
      {
        "difficulty": "medium",
        "question": "Thành ngữ “Mưa thuận gió hòa” thể hiện ước mong gì của bà con nông dân?",
        "options": [
          "Thời tiết điều hòa để mùa màng bội thu, đời sống ấm no",
          "Trời đổ mưa bão lớn để tích nước ngọt",
          "Gió mát mẻ trong những ngày hè oi bức",
          "Mùa đông không còn băng giá khắc nghiệt"
        ],
        "answer": 0,
        "explanation": "“Mưa thuận gió hòa” là ước vọng thời tiết êm đềm, thuận lợi cho cây trồng tốt tươi, nhà nhà ấm no."
      },
      {
        "difficulty": "hard",
        "question": "Thành ngữ nào dưới đây đề cao tinh thần TỰ LỰC CÁNH SINH, không dựa dẫm ỷ lại vào người khác?",
        "options": [
          "Tự lực cánh sinh",
          "Nước chảy bèo trôi",
          "Gió chiều nào theo chiều ấy",
          "Há miệng chờ sung"
        ],
        "answer": 0,
        "explanation": "“Tự lực cánh sinh” khuyên mỗi người phải tự đứng trên đôi chân của mình, chủ động nỗ lực vươn lên."
      },
      {
        "difficulty": "hard",
        "question": "Ý nghĩa giáo dục sâu sắc của câu tục ngữ “Đói cho sạch, rách cho thơm” là gì?",
        "options": [
          "Dù trong hoàn cảnh thiếu thốn bần hàn vẫn phải giữ trọn nhân cách trong sáng, lòng tự trọng",
          "Khi đói cần rửa tay sạch sẽ, quần áo rách phải xịt nước hoa thơm",
          "Phải biết chăm chút ăn mặc sang trọng mọi lúc mọi nơi",
          "Nên tiết kiệm lương thực và giặt quần áo thơm tho"
        ],
        "answer": 0,
        "explanation": "Câu tục ngữ nhắc nhở con người dù nghèo khổ đến đâu cũng không được làm điều xằng bậy, phải giữ trọn danh dự."
      },
      {
        "difficulty": "hard",
        "question": "Thành ngữ “Rút dây động rừng” khuyên chúng ta bài học gì trước khi quyết định hành động?",
        "options": [
          "Phải cẩn trọng suy xét vì một việc nhỏ có thể làm kinh động, ảnh hưởng đến toàn thể hệ thống",
          "Khi vào rừng không nên giật đứt các dây leo nguy hiểm",
          "Cần tích cực trồng cây gây rừng để bảo vệ thú quý",
          "Phải hành động nhanh chóng chớp thời cơ không chần chừ"
        ],
        "answer": 0,
        "explanation": "“Rút dây động rừng” cảnh báo một hành động thiếu cân nhắc ở một mắt xích nhỏ có thể tạo phản ứng dây chuyền lan rộng."
      },
      {
        "difficulty": "hard",
        "question": "Câu tục ngữ “Bán anh em xa, mua láng giềng gần” đề cao giá trị tốt đẹp nào trong cuộc sống?",
        "options": [
          "Tình làng nghĩa xóm tối lửa tắt đèn có nhau",
          "Việc mua bán đất đai với hàng xóm thân cận",
          "Không cần thăm hỏi người thân họ hàng ở xa",
          "Nên chuyển nhà đến sống gần người thân quen"
        ],
        "answer": 0,
        "explanation": "Câu tục ngữ nhắc nhở bà con lối xóm sống chan hòa, vì khi có việc khẩn cấp thì hàng xóm láng giềng là người giúp đỡ trước tiên."
      },
      {
        "difficulty": "hard",
        "question": "Thành ngữ nào sau đây mang ý nghĩa ĐỒNG NGHĨA với câu “Chung lưng đấu cật”?",
        "options": [
          "Đồng tâm hiệp lực",
          "Thân ai nấy lo",
          "Được chăng hay chớ",
          "Một nắng hai sương"
        ],
        "answer": 0,
        "explanation": "“Chung lưng đấu cật” và “Đồng tâm hiệp lực” đều nói về tinh thần đoàn kết, kề vai sát cánh vượt qua gian khổ."
      },
      {
        "difficulty": "hard",
        "question": "Hoàn thành câu ca dao nhắc nhở lòng hiếu thảo thiêng liêng: “Ơn cha nặng lắm ai ơi / Nghĩa mẹ bằng trời mang nặng ......”",
        "options": [
          "Đẻ đau",
          "Hy sinh",
          "Lo toan",
          "Gian lao"
        ],
        "answer": 0,
        "explanation": "Ca dao cổ truyền: “Ơn cha nặng lắm ai ơi / Nghĩa mẹ bằng trời mang nặng đẻ đau”."
      }
    ]
  },
  "math": {
    "title": "Vườn Toán Học & Chuỗi Số 🧮",
    "instructions": "Thử tài tính nhẩm nhanh và giải câu đố tư duy logic toán học từ dễ đến khó!",
    "rewardCoins": 25,
    "rewardXP": 30,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Tính nhẩm nhanh: 25 x 4 = ?",
        "options": [
          "100",
          "90",
          "110",
          "125"
        ],
        "answer": 0,
        "explanation": "25 x 4 = 100."
      },
      {
        "difficulty": "easy",
        "question": "Một hình vuông có cạnh dài 6 cm. CHU VI của hình vuông đó là:",
        "options": [
          "24 cm",
          "36 cm",
          "18 cm",
          "12 cm"
        ],
        "answer": 0,
        "explanation": "Chu vi hình vuông = cạnh x 4 = 6 x 4 = 24 cm."
      },
      {
        "difficulty": "easy",
        "question": "Điền số thích hợp vào dấu hỏi chấm: 5, 10, 15, 20, (?)",
        "options": [
          "25",
          "30",
          "22",
          "35"
        ],
        "answer": 0,
        "explanation": "Quy luật dãy số cộng thêm 5 đơn vị mỗi bước: 20 + 5 = 25."
      },
      {
        "difficulty": "easy",
        "question": "Đổi đơn vị đo thời gian: 2 giờ bằng bao nhiêu phút?",
        "options": [
          "120 phút",
          "60 phút",
          "100 phút",
          "180 phút"
        ],
        "answer": 0,
        "explanation": "1 giờ = 60 phút, vậy 2 giờ = 2 x 60 = 120 phút."
      },
      {
        "difficulty": "medium",
        "question": "Một lớp học có 18 bạn nam và 16 bạn nữ. Hỏi lớp học đó có tất cả bao nhiêu học sinh?",
        "options": [
          "34 học sinh",
          "32 học sinh",
          "36 học sinh",
          "30 học sinh"
        ],
        "answer": 0,
        "explanation": "18 + 16 = 34 học sinh."
      },
      {
        "difficulty": "medium",
        "question": "Tìm số TRUNG BÌNH CỘNG của ba số: 10, 20 và 30:",
        "options": [
          "20",
          "15",
          "25",
          "30"
        ],
        "answer": 0,
        "explanation": "Trung bình cộng = (10 + 20 + 30) : 3 = 60 : 3 = 20."
      },
      {
        "difficulty": "medium",
        "question": "Một hình chữ nhật có chiều dài 12 cm, chiều rộng 5 cm. DIỆN TÍCH của hình chữ nhật đó là:",
        "options": [
          "60 cm²",
          "34 cm²",
          "17 cm²",
          "40 cm²"
        ],
        "answer": 0,
        "explanation": "Diện tích hình chữ nhật = dài x rộng = 12 x 5 = 60 cm²."
      },
      {
        "difficulty": "medium",
        "question": "Rút gọn phân số 15/25 về phân số tối giản:",
        "options": [
          "3/5",
          "1/5",
          "5/3",
          "3/10"
        ],
        "answer": 0,
        "explanation": "Chia cả tử số và mẫu số cho 5: 15:5 / 25:5 = 3/5."
      },
      {
        "difficulty": "hard",
        "question": "Tổng của hai số là 50, hiệu của hai số là 10. Tìm SỐ LỚN:",
        "options": [
          "30",
          "20",
          "40",
          "25"
        ],
        "answer": 0,
        "explanation": "Số lớn = (Tổng + Hiệu) : 2 = (50 + 10) : 2 = 60 : 2 = 30."
      },
      {
        "difficulty": "hard",
        "question": "Một người đi xe đạp với vận tốc 15 km/h trong thời gian 3 giờ. QUÃNG ĐƯỜNG người đó đi được là:",
        "options": [
          "45 km",
          "30 km",
          "60 km",
          "50 km"
        ],
        "answer": 0,
        "explanation": "Quãng đường s = v x t = 15 x 3 = 45 km."
      },
      {
        "difficulty": "hard",
        "question": "Điền số tiếp theo trong dãy số Fibonacci: 1, 1, 2, 3, 5, 8, (?)",
        "options": [
          "13",
          "11",
          "15",
          "10"
        ],
        "answer": 0,
        "explanation": "Quy luật: Mỗi số bằng tổng 2 số liền trước nó: 5 + 8 = 13."
      },
      {
        "difficulty": "hard",
        "question": "Vừa gà vừa chó có tất cả 10 con, đếm được 28 cái chân. Hỏi có bao nhiêu CON CHÓ?",
        "options": [
          "4 con chó",
          "6 con chó",
          "3 con chó",
          "5 con chó"
        ],
        "answer": 0,
        "explanation": "Giả sử cả 10 con đều là gà thì có 20 chân. Số chân dôi ra: 28 - 20 = 8 chân. Mỗi con chó hơn con gà 2 chân. Số chó là 8 : 2 = 4 con."
      },
      {
        "difficulty": "easy",
        "question": "Tính giá trị của biểu thức cộng: 150 + 250 = ?",
        "options": [
          "400",
          "300",
          "500",
          "450"
        ],
        "answer": 0,
        "explanation": "150 + 250 = 400."
      },
      {
        "difficulty": "easy",
        "question": "Số liền sau của số 999 là số nào?",
        "options": [
          "1000",
          "998",
          "1001",
          "990"
        ],
        "answer": 0,
        "explanation": "Muốn tìm số liền sau của một số tự nhiên, ta cộng thêm 1 đơn vị: 999 + 1 = 1000."
      },
      {
        "difficulty": "easy",
        "question": "Kết quả của phép chia 48 : 6 là bao nhiêu?",
        "options": [
          "8",
          "7",
          "9",
          "6"
        ],
        "answer": 0,
        "explanation": "Dựa vào bảng cửu chương nhân 6: 6 x 8 = 48, do đó 48 : 6 = 8."
      },
      {
        "difficulty": "easy",
        "question": "Đổi đơn vị đo độ dài: 3 mét bằng bao nhiêu xăng-ti-mét?",
        "options": [
          "300 cm",
          "30 cm",
          "3000 cm",
          "3 cm"
        ],
        "answer": 0,
        "explanation": "Vì 1 m = 100 cm nên 3 m = 3 x 100 = 300 cm."
      },
      {
        "difficulty": "easy",
        "question": "Một ngày đêm trên Trái Đất có tất cả bao nhiêu giờ?",
        "options": [
          "24 giờ",
          "12 giờ",
          "48 giờ",
          "60 giờ"
        ],
        "answer": 0,
        "explanation": "Một ngày đêm tiêu chuẩn gồm 24 giờ."
      },
      {
        "difficulty": "easy",
        "question": "Số nào dưới đây là SỐ CHẴN?",
        "options": [
          "24",
          "15",
          "37",
          "49"
        ],
        "answer": 0,
        "explanation": "Số chẵn là các số có chữ số tận cùng là 0, 2, 4, 6, 8. Số 24 tận cùng là 4 nên là số chẵn."
      },
      {
        "difficulty": "medium",
        "question": "Tìm x biết: x - 125 = 375.",
        "options": [
          "500",
          "250",
          "450",
          "600"
        ],
        "answer": 0,
        "explanation": "Muốn tìm số bị trừ, ta lấy hiệu cộng với số trừ: x = 375 + 125 = 500."
      },
      {
        "difficulty": "medium",
        "question": "Một hình chữ nhật có chu vi bằng 28 cm. NỬA CHU VI của hình chữ nhật đó là:",
        "options": [
          "14 cm",
          "7 cm",
          "56 cm",
          "21 cm"
        ],
        "answer": 0,
        "explanation": "Nửa chu vi hình chữ nhật bằng Chu vi chia cho 2: 28 : 2 = 14 cm."
      },
      {
        "difficulty": "medium",
        "question": "Tính giá trị của biểu thức: 20 + 5 x 4 = ?",
        "options": [
          "40",
          "100",
          "29",
          "45"
        ],
        "answer": 0,
        "explanation": "Thực hiện phép tính nhân trước rồi cộng sau: 5 x 4 = 20, sau đó 20 + 20 = 40."
      },
      {
        "difficulty": "medium",
        "question": "Đổi đơn vị đo khối lượng: 4 tấn 50 kg bằng bao nhiêu ki-lô-gam?",
        "options": [
          "4050 kg",
          "4500 kg",
          "4005 kg",
          "450 kg"
        ],
        "answer": 0,
        "explanation": "Vì 1 tấn = 1000 kg nên 4 tấn 50 kg = 4000 + 50 = 4050 kg."
      },
      {
        "difficulty": "medium",
        "question": "Phân số nào dưới đây có giá trị LỚN HƠN 1?",
        "options": [
          "5/4",
          "3/4",
          "4/5",
          "1/2"
        ],
        "answer": 0,
        "explanation": "Phân số có tử số lớn hơn mẫu số (5 > 4) thì luôn có giá trị lớn hơn 1."
      },
      {
        "difficulty": "medium",
        "question": "Tìm 3/5 của số 45:",
        "options": [
          "27",
          "15",
          "25",
          "30"
        ],
        "answer": 0,
        "explanation": "Muốn tìm 3/5 của 45, ta lấy: 45 : 5 x 3 = 9 x 3 = 27."
      },
      {
        "difficulty": "hard",
        "question": "Một mảnh vườn hình chữ nhật có chu vi là 64 m, chiều dài gấp 3 lần chiều rộng. Diện tích của mảnh vườn đó là:",
        "options": [
          "192 m²",
          "256 m²",
          "144 m²",
          "240 m²"
        ],
        "answer": 0,
        "explanation": "Nửa chu vi là 64 : 2 = 32 m. Chiều rộng là 32 : (1 + 3) = 8 m. Chiều dài là 8 x 3 = 24 m. Diện tích = 24 x 8 = 192 m²."
      },
      {
        "difficulty": "hard",
        "question": "Hiện nay mẹ 36 tuổi và con 8 tuổi. Hỏi sau bao nhiêu năm nữa thì tuổi mẹ gấp 3 lần tuổi con?",
        "options": [
          "6 năm",
          "4 năm",
          "5 năm",
          "7 năm"
        ],
        "answer": 0,
        "explanation": "Mẹ hơn con: 36 - 8 = 28 tuổi (hiệu số tuổi không đổi). Khi tuổi mẹ gấp 3 lần tuổi con, tuổi con là: 28 : (3 - 1) = 14 tuổi. Sau số năm là: 14 - 8 = 6 năm."
      },
      {
        "difficulty": "hard",
        "question": "Một bể nước có thể tích bằng 2,4 m³. Khi chứa đầy nước, bể chứa được bao nhiêu lít nước?",
        "options": [
          "2400 lít",
          "240 lít",
          "24000 lít",
          "24 lít"
        ],
        "answer": 0,
        "explanation": "Ta biết 1 m³ = 1000 dm³ = 1000 lít nước. Do đó: 2,4 m³ = 2,4 x 1000 = 2400 lít."
      },
      {
        "difficulty": "hard",
        "question": "Tìm số tiếp theo trong dãy số quy luật: 2, 6, 12, 20, 30, (?)",
        "options": [
          "42",
          "40",
          "36",
          "48"
        ],
        "answer": 0,
        "explanation": "Quy luật n x (n + 1): 1x2=2, 2x3=6, 3x4=12, 4x5=20, 5x6=30. Số tiếp theo là 6x7 = 42."
      },
      {
        "difficulty": "hard",
        "question": "Một đội công nhân gồm 12 người sửa xong đoạn đường trong 6 ngày. Muốn sửa xong đoạn đường đó trong 4 ngày thì cần bao nhiêu người? (năng suất như nhau)",
        "options": [
          "18 người",
          "15 người",
          "16 người",
          "20 người"
        ],
        "answer": 0,
        "explanation": "Tổng số công hoàn thành đoạn đường: 12 x 6 = 72 công. Trong 4 ngày cần số người là: 72 : 4 = 18 người."
      },
      {
        "difficulty": "hard",
        "question": "Tính giá trị của biểu thức phân số: (1/2 + 1/3) : 5/6 = ?",
        "options": [
          "1",
          "5/6",
          "2/3",
          "1/6"
        ],
        "answer": 0,
        "explanation": "Quy đồng mẫu số: 1/2 + 1/3 = 3/6 + 2/6 = 5/6. Sau đó lấy (5/6) : (5/6) = 1."
      }
    ]
  },
  "arena": {
    "title": "Đấu Trường Tốc Độ 60 Giây ⚡",
    "instructions": "Phản xạ nhanh như chớp với các câu hỏi thi đấu dồn dập từ dễ đến khó!",
    "rewardCoins": 35,
    "rewardXP": 45,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Mặt trời mọc ở hướng nào?",
        "options": [
          "Hướng Đông",
          "Hướng Tây",
          "Hướng Nam",
          "Hướng Bắc"
        ],
        "answer": 0,
        "explanation": "Mặt trời luôn luôn mọc ở hướng Đông và lặn ở hướng Tây."
      },
      {
        "difficulty": "easy",
        "question": "Việt Nam có thủ đô là thành phố nào?",
        "options": [
          "Hà Nội",
          "TP Hồ Chí Minh",
          "Đà Nẵng",
          "Huế"
        ],
        "answer": 0,
        "explanation": "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là Hà Nội."
      },
      {
        "difficulty": "easy",
        "question": "Một năm nhuận có bao nhiêu ngày?",
        "options": [
          "366 ngày",
          "365 ngày",
          "364 ngày",
          "360 ngày"
        ],
        "answer": 0,
        "explanation": "Năm nhuận có tháng Hai có 29 ngày, tổng cộng 366 ngày."
      },
      {
        "difficulty": "easy",
        "question": "Loài vật nào sau đây được mệnh danh là “Chúa sơn lâm”?",
        "options": [
          "Hổ (Cọp)",
          "Sư tử",
          "Hươu sao",
          "Voi"
        ],
        "answer": 0,
        "explanation": "Hổ được mệnh danh là Chúa sơn lâm của rừng rậm."
      },
      {
        "difficulty": "easy",
        "question": "Cầu vồng sau cơn mưa thường có bao nhiêu màu sắc chính?",
        "options": [
          "7 màu",
          "5 màu",
          "6 màu",
          "8 màu"
        ],
        "answer": 0,
        "explanation": "Cầu vồng gồm 7 sắc: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím."
      },
      {
        "difficulty": "medium",
        "question": "Đỉnh núi nào được mệnh danh là “Nóc nhà Đông Dương” tại Việt Nam?",
        "options": [
          "Fansipan",
          "Bà Đen",
          "Langbiang",
          "Bạch Mộc Lương Tử"
        ],
        "answer": 0,
        "explanation": "Đỉnh Fansipan cao 3.143m tại Sa Pa, Lào Cai là đỉnh núi cao nhất Đông Dương."
      },
      {
        "difficulty": "medium",
        "question": "Tỉnh Phú Thọ nổi tiếng khắp cả nước với di tích lịch sử quốc gia đặc biệt nào?",
        "options": [
          "Khu di tích lịch sử Đền Hùng",
          "Chùa Một Cột",
          "Cố đô Hoa Lư",
          "Thành nhà Hồ"
        ],
        "answer": 0,
        "explanation": "Đền Hùng trên núi Nghĩa Lĩnh, Phú Thọ là nơi thờ cúng các Vua Hùng dựng nước."
      },
      {
        "difficulty": "medium",
        "question": "Chất khí nào chiếm thể tích lớn nhất trong không khí quanh ta?",
        "options": [
          "Khí Nitơ (khoảng 78%)",
          "Khí Oxy (khoảng 21%)",
          "Khí Cacbonic",
          "Khí Hidro"
        ],
        "answer": 0,
        "explanation": "Khí Nitơ chiếm khoảng 78% thể tích bầu khí quyển Trái Đất."
      },
      {
        "difficulty": "medium",
        "question": "Vịnh biển nào của Việt Nam hai lần được UNESCO vinh danh là Di sản thiên nhiên thế giới?",
        "options": [
          "Vịnh Hạ Long",
          "Vịnh Nha Trang",
          "Vịnh Cam Ranh",
          "Vịnh Lăng Cô"
        ],
        "answer": 0,
        "explanation": "Vịnh Hạ Long (Quảng Ninh) là kỳ quan thiên nhiên thế giới nổi tiếng của Việt Nam."
      },
      {
        "difficulty": "medium",
        "question": "Động vật nào đẻ trứng trong số các loài sau?",
        "options": [
          "Chim bồ câu",
          "Cá heo",
          "Chuột túi",
          "Mèo"
        ],
        "answer": 0,
        "explanation": "Chim bồ câu là loài chim đẻ trứng; các loài còn lại đẻ con và nuôi con bằng sữa mẹ."
      },
      {
        "difficulty": "hard",
        "question": "Vận tốc của ánh sáng trong chân không là khoảng bao nhiêu?",
        "options": [
          "300.000 km/s",
          "30.000 km/s",
          "3.000 km/s",
          "300 km/s"
        ],
        "answer": 0,
        "explanation": "Vận tốc ánh sáng xấp xỉ 300.000 km mỗi giây."
      },
      {
        "difficulty": "hard",
        "question": "Vị vua nào của nước ta đã dời đô từ Hoa Lư về Thăng Long vào năm 1010?",
        "options": [
          "Lý Thái Tổ (Lý Công Uẩn)",
          "Lê Lợi",
          "Trần Hưng Đạo",
          "Quang Trung"
        ],
        "answer": 0,
        "explanation": "Mùa thu năm Canh Tuất (1010), vua Lý Thái Tổ ban Chiếu dời đô về thành Đại La (Thăng Long)."
      },
      {
        "difficulty": "hard",
        "question": "Nhạc sĩ nào là tác giả của bài hát Quốc ca Việt Nam (“Tiến quân ca”)?",
        "options": [
          "Văn Cao",
          "Trịnh Công Sơn",
          "Phạm Tuyên",
          "Phong Nhã"
        ],
        "answer": 0,
        "explanation": "Nhạc sĩ Văn Cao sáng tác ca khúc “Tiến quân ca” vào cuối năm 1944."
      },
      {
        "difficulty": "hard",
        "question": "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
        "options": [
          "Sao Thủy (Mercury)",
          "Sao Kim",
          "Trái Đất",
          "Sao Hỏa"
        ],
        "answer": 0,
        "explanation": "Sao Thủy là hành tinh nằm gần Mặt Trời nhất trong Thái Dương Hệ."
      },
      {
        "difficulty": "easy",
        "question": "Cơ quan nào trong cơ thể con người đảm nhận nhiệm vụ bơm máu đi khắp cơ thể suốt ngày đêm?",
        "options": [
          "Trái tim",
          "Lá phổi",
          "Dạ dày",
          "Bộ não"
        ],
        "answer": 0,
        "explanation": "Trái tim hoạt động như một chiếc máy bơm bền bỉ đẩy máu giàu oxy nuôi sống toàn bộ cơ thể."
      },
      {
        "difficulty": "easy",
        "question": "Nước tinh khiết sôi và bốc hơi ở bao nhiêu độ C ở điều kiện áp suất khí quyển tiêu chuẩn?",
        "options": [
          "100°C",
          "0°C",
          "50°C",
          "200°C"
        ],
        "answer": 0,
        "explanation": "Nước tinh khiết đạt điểm sôi ở 100°C và đóng băng ở 0°C."
      },
      {
        "difficulty": "easy",
        "question": "Đơn vị tiền tệ chính thức của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?",
        "options": [
          "Đồng",
          "Đô la",
          "Yên",
          "Bạt"
        ],
        "answer": 0,
        "explanation": "Đồng (VND) là đơn vị tiền tệ pháp định duy nhất của nước ta."
      },
      {
        "difficulty": "easy",
        "question": "Chim cánh cụt sinh sống chủ yếu ở khu vực nào trên Trái Đất?",
        "options": [
          "Nam Cực",
          "Bắc Cực",
          "Rừng rậm Amazon",
          "Sa mạc Sahara"
        ],
        "answer": 0,
        "explanation": "Hầu hết các loài chim cánh cụt cư trú tại vùng biển băng giá ở Nam Bán Cầu và châu Nam Cực."
      },
      {
        "difficulty": "easy",
        "question": "Hành tinh nào trong Hệ Mặt Trời được mệnh danh là “Hành tinh Đỏ”?",
        "options": [
          "Sao Hỏa",
          "Sao Thủy",
          "Sao Kim",
          "Sao Mộc"
        ],
        "answer": 0,
        "explanation": "Sao Hỏa có bề mặt bao phủ bởi nhiều khoáng chất sắt oxit tạo nên màu sắc đỏ cam đặc trưng."
      },
      {
        "difficulty": "medium",
        "question": "Đại dương nào có diện tích và độ sâu lớn nhất trên bề mặt Trái Đất?",
        "options": [
          "Thái Bình Dương",
          "Đại Tây Dương",
          "Ấn Độ Dương",
          "Bắc Băng Dương"
        ],
        "answer": 0,
        "explanation": "Thái Bình Dương bao phủ hơn 30% diện tích bề mặt Trái Đất, lớn hơn toàn bộ diện tích các lục địa cộng lại."
      },
      {
        "difficulty": "medium",
        "question": "Bác Hồ đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa vào ngày tháng năm nào?",
        "options": [
          "Ngày 2 tháng 9 năm 1945",
          "Ngày 19 tháng 8 năm 1945",
          "Ngày 30 tháng 4 năm 1975",
          "Ngày 2 tháng 9 năm 1969"
        ],
        "answer": 0,
        "explanation": "Vào ngày 2/9/1945 tại Quảng trường Ba Đình lịch sử, Chủ tịch Hồ Chí Minh đã đọc bản Tuyên ngôn Độc lập."
      },
      {
        "difficulty": "medium",
        "question": "Trong quá trình quang hợp dưới ánh sáng mặt trời, cây xanh nhả ra khí gì cần thiết cho hô hấp của con người?",
        "options": [
          "Khí Ô-xi (O2)",
          "Khí Cac-bo-nic (CO2)",
          "Khí Ni-tơ (N2)",
          "Khí Hi-đrô (H2)"
        ],
        "answer": 0,
        "explanation": "Quang hợp hấp thu nước và CO2, tạo ra glucose và giải phóng dưỡng khí Oxy (O2)."
      },
      {
        "difficulty": "medium",
        "question": "Đại kim tự tháp Giza - một trong bảy kỳ quan của thế giới cổ đại - nằm ở quốc gia nào?",
        "options": [
          "Ai Cập",
          "Hy Lạp",
          "Ý",
          "Ấn Độ"
        ],
        "answer": 0,
        "explanation": "Quần thể kim tự tháp Giza nổi tiếng tọa lạc bên bờ sông Nile huyền bí tại đất nước Ai Cập."
      },
      {
        "difficulty": "medium",
        "question": "Đàn bầu - nhạc cụ truyền thống dân gian độc đáo của Việt Nam - có bao nhiêu dây gảy?",
        "options": [
          "1 dây",
          "2 dây",
          "4 dây",
          "6 dây"
        ],
        "answer": 0,
        "explanation": "Đàn bầu (còn gọi là độc huyền cầm) là nhạc cụ gảy truyền thống độc nhất vô nhị chỉ có một dây."
      },
      {
        "difficulty": "hard",
        "question": "Dãy núi nào dài nhất trên đất liền trên thế giới?",
        "options": [
          "Dãy Andes (Nam Mỹ)",
          "Dãy Himalaya (Châu Á)",
          "Dãy Alps (Châu Âu)",
          "Dãy Rocky (Bắc Mỹ)"
        ],
        "answer": 0,
        "explanation": "Dãy Andes chạy dọc theo sườn bờ tây lục địa Nam Mỹ với chiều dài ấn tượng hơn 7.000 km."
      },
      {
        "difficulty": "hard",
        "question": "Nhà khoa học nào đã phát hiện ra Định luật Vạn vật hấp dẫn khi quan sát một quả táo rơi từ trên cây?",
        "options": [
          "Isaac Newton",
          "Albert Einstein",
          "Galileo Galilei",
          "Thomas Edison"
        ],
        "answer": 0,
        "explanation": "Sir Isaac Newton đã đặt nền móng cho cơ học cổ điển với định luật vạn vật hấp dẫn vào thế kỷ 17."
      },
      {
        "difficulty": "hard",
        "question": "Chiến dịch Điện Biên Phủ “lừng lẫy năm châu, chấn động địa cầu” toàn thắng vào ngày tháng năm nào?",
        "options": [
          "Ngày 7 tháng 5 năm 1954",
          "Ngày 2 tháng 9 năm 1945",
          "Ngày 30 tháng 4 năm 1975",
          "Ngày 19 tháng 12 năm 1946"
        ],
        "answer": 0,
        "explanation": "Chiều ngày 7/5/1954, lá cờ Quyết chiến Quyết thắng của quân đội ta tung bay trên nóc hầm tướng De Castries."
      },
      {
        "difficulty": "hard",
        "question": "Nguyên tố kim loại quý nào có ký hiệu hóa học là “Au” trên bảng tuần hoàn?",
        "options": [
          "Vàng",
          "Bạc",
          "Đồng",
          "Bạch kim"
        ],
        "answer": 0,
        "explanation": "Ký hiệu “Au” xuất phát từ danh từ Latin “Aurum” có nghĩa là rạng đông rực rỡ, chỉ kim loại Vàng."
      },
      {
        "difficulty": "hard",
        "question": "Hòn đảo tự nhiên nào có diện tích lớn nhất trên thế giới?",
        "options": [
          "Đảo Greenland",
          "Đảo Madagascar",
          "Đảo Borneo",
          "Đảo New Guinea"
        ],
        "answer": 0,
        "explanation": "Greenland thuộc vương quốc Đan Mạch là đảo lớn nhất hành tinh với diện tích khoảng 2,16 triệu km²."
      },
      {
        "difficulty": "hard",
        "question": "Ai là tác giả của kiệt tác văn học “Đoạn trường tân thanh” (Truyện Kiều) của dân tộc Việt Nam?",
        "options": [
          "Đại thi hào Nguyễn Du",
          "Nguyễn Trãi",
          "Hồ Xuân Hương",
          "Chu Văn An"
        ],
        "answer": 0,
        "explanation": "Đại thi hào Nguyễn Du (1765 - 1820) được UNESCO vinh danh là Danh nhân văn hóa thế giới."
      }
    ]
  },
  "grand": {
    "title": "ĐẠI HỘI TRI THỨC PHÚ THỌ 👑",
    "instructions": "Đại khảo thí tri thức tinh hoa — thử thách toàn diện từ dễ đến khó!",
    "rewardCoins": 100,
    "rewardXP": 120,
    "questions": [
      {
        "difficulty": "easy",
        "question": "Ngày Giỗ Tổ Hùng Vương được tổ chức vào ngày nào âm lịch hàng năm?",
        "options": [
          "Mùng 10 tháng 3 âm lịch",
          "Mùng 1 tháng 1 âm lịch",
          "Rằm tháng 8 âm lịch",
          "Mùng 5 tháng 5 âm lịch"
        ],
        "answer": 0,
        "explanation": "“Dù ai đi ngược về xuôi / Nhớ ngày Giỗ Tổ mùng mười tháng ba”."
      },
      {
        "difficulty": "easy",
        "question": "Ai là người đã làm ra Bánh Chưng và Bánh Giầy để dâng lên Vua Hùng thứ 6?",
        "options": [
          "Lang Liêu",
          "Mai An Tiêm",
          "Chử Đồng Tử",
          "Thạch Sanh"
        ],
        "answer": 0,
        "explanation": "Lang Liêu đã tạo ra bánh chưng tượng trưng cho Đất, bánh giầy tượng trưng cho Trời."
      },
      {
        "difficulty": "easy",
        "question": "Tỉnh Phú Thọ nằm ở khu vực địa lý nào của Việt Nam?",
        "options": [
          "Trung du và miền núi phía Bắc",
          "Đồng bằng sông Cửu Long",
          "Tây Nguyên",
          "Duyên hải Nam Trung Bộ"
        ],
        "answer": 0,
        "explanation": "Phú Thọ là tỉnh thuộc vùng Trung du và miền núi phía Bắc, được coi là đất Tổ cội nguồn."
      },
      {
        "difficulty": "easy",
        "question": "Bánh Giầy theo quan niệm dân gian thời Hùng Vương tượng trưng cho điều gì?",
        "options": [
          "Tượng trưng cho Trời (hình tròn, màu trắng)",
          "Tượng trưng cho Đất",
          "Tượng trưng cho Núi non",
          "Tượng trưng cho Biển cả"
        ],
        "answer": 0,
        "explanation": "Bánh giầy hình tròn màu trắng ngần tượng trưng cho Trời bao la."
      },
      {
        "difficulty": "easy",
        "question": "Thành phố trực thuộc tỉnh Phú Thọ là thành phố nào?",
        "options": [
          "Thành phố Việt Trì",
          "Thành phố Hạ Long",
          "Thành phố Yên Bái",
          "Thành phố Tuyên Quang"
        ],
        "answer": 0,
        "explanation": "Thành phố Việt Trì là trung tâm kinh tế, chính trị, văn hóa của tỉnh Phú Thọ."
      },
      {
        "difficulty": "medium",
        "question": "Loại hình nghệ thuật dân gian độc đáo của Phú Thọ được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại là gì?",
        "options": [
          "Hát Xoan Phú Thọ",
          "Hát Quan họ",
          "Nhã nhạc cung đình",
          "Đờn ca tài tử"
        ],
        "answer": 0,
        "explanation": "Hát Xoan Phú Thọ là di sản văn hóa phi vật thể quý giá của dân tộc Việt Nam."
      },
      {
        "difficulty": "medium",
        "question": "Câu nói bất hủ: “Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước” được Bác Hồ căn dặn tại đâu?",
        "options": [
          "Tại Đền Giếng (Khu di tích Đền Hùng, Phú Thọ)",
          "Tại Quảng trường Ba Đình",
          "Tại Bến cảng Nhà Rồng",
          "Tại Tân Trào (Tuyên Quang)"
        ],
        "answer": 0,
        "explanation": "Bác Hồ căn dặn Đại đoàn Quân Tiên Phong tại Đền Giếng (Đền Hùng) vào ngày 19/9/1954."
      },
      {
        "difficulty": "medium",
        "question": "Sông nào sau đây chảy qua địa phận tỉnh Phú Thọ?",
        "options": [
          "Sông Hồng, sông Đà và sông Lô",
          "Sông Tiền và sông Hậu",
          "Sông Hương và sông Hàn",
          "Sông Đồng Nai"
        ],
        "answer": 0,
        "explanation": "Phú Thọ là nơi ngã ba sông hợp lưu của ba dòng sông lớn: Sông Hồng (Sông Thao), Sông Đà và Sông Lô."
      },
      {
        "difficulty": "medium",
        "question": "Cột đá thề trên đỉnh núi Nghĩa Lĩnh gắn liền với lời thề bảo vệ non sông của ai?",
        "options": [
          "Thục Phán An Dương Vương",
          "Hai Bà Trưng",
          "Lý Nam Đế",
          "Ngô Quyền"
        ],
        "answer": 0,
        "explanation": "Sau khi được Hùng Vương nhường ngôi, Thục Phán An Dương Vương đã dựng cột đá thề gìn giữ giang sơn."
      },
      {
        "difficulty": "medium",
        "question": "Trống đồng Đông Sơn cổ đại được các nhà khảo cổ tìm thấy nhiều ở vùng đất nào?",
        "options": [
          "Lưu vực sông Hồng và sông Mã",
          "Vùng đồng bằng sông Cửu Long",
          "Tây Nguyên",
          "Duyên hải Nam Trung Bộ"
        ],
        "answer": 0,
        "explanation": "Trống đồng Đông Sơn là đỉnh cao của nền văn hóa đồng thau thời các Vua Hùng dựng nước."
      },
      {
        "difficulty": "hard",
        "question": "Tên gọi nước ta dưới thời các Vua Hùng đầu tiên trong lịch sử là gì?",
        "options": [
          "Văn Lang",
          "Âu Lạc",
          "Đại Cồ Việt",
          "Đại Việt"
        ],
        "answer": 0,
        "explanation": "Nhà nước đầu tiên trong lịch sử dân tộc ta do các Vua Hùng lập nên mang tên Văn Lang, đóng đô tại Phong Châu (nay thuộc Phú Thọ)."
      },
      {
        "difficulty": "hard",
        "question": "Trận chiến thắng lẫy lừng trên Sông Lô lịch sử (Phú Thọ) gắn liền với cuộc kháng chiến nào?",
        "options": [
          "Chiến dịch Thu - Đông 1947 chống thực dân Pháp",
          "Kháng chiến chống quân Mông - Nguyên",
          "Chiến dịch Điện Biên Phủ 1954",
          "Kháng chiến chống quân Minh"
        ],
        "answer": 0,
        "explanation": "Chiến thắng Sông Lô vang dội vào tháng 10/1947 trong Chiến dịch Việt Bắc Thu - Đông bẻ gãy gọng kìm của thực dân Pháp."
      },
      {
        "difficulty": "hard",
        "question": "Cây cọ và đồi chè xanh mướt là biểu tượng thiên nhiên đặc trưng gắn liền với vùng quê nào?",
        "options": [
          "Đất rừng Trung du Phú Thọ",
          "Đồng bằng Bắc Bộ",
          "Vùng đất Mũi Cà Mau",
          "Rừng ngập mặn Cần Giờ"
        ],
        "answer": 0,
        "explanation": "“Rừng cọ đồi chè, đồng xanh ngào ngạt” là câu thơ tuyệt đẹp mô tả cảnh sắc Phú Thọ trong thơ Tố Hữu."
      },
      {
        "difficulty": "hard",
        "question": "Trong truyền thuyết Hùng Vương, Sơn Tinh và Thủy Tinh đến cầu hôn công chúa tên là gì?",
        "options": [
          "Mị Nương",
          "Tiên Dung",
          "Mỵ Châu",
          "An Tiêm"
        ],
        "answer": 0,
        "explanation": "Vua Hùng thứ 18 kén rể cho con gái cưng là công chúa Mị Nương."
      },
      {
        "difficulty": "hard",
        "question": "Khu rừng nguyên sinh quốc gia nằm trên địa phận tỉnh Phú Thọ là vườn quốc gia nào?",
        "options": [
          "Vườn quốc gia Xuân Sơn",
          "Vườn quốc gia Cúc Phương",
          "Vườn quốc gia Ba Vì",
          "Vườn quốc gia Tam Đảo"
        ],
        "answer": 0,
        "explanation": "Vườn quốc gia Xuân Sơn tại huyện Tân Sơn, Phú Thọ là khu rừng nguyên sinh giàu đa dạng sinh học."
      },
      {
        "difficulty": "easy",
        "question": "Khu di tích lịch sử Quốc gia Đền Hùng tọa lạc trang nghiêm trên ngọn núi nào?",
        "options": [
          "Núi Nghĩa Lĩnh",
          "Núi Ba Vì",
          "Núi Yên Tử",
          "Núi Tam Đảo"
        ],
        "answer": 0,
        "explanation": "Quần thể Đền Hùng tọa lạc trên núi Nghĩa Lĩnh cao 175 mét, thuộc xã Hy Cương, thành phố Việt Trì."
      },
      {
        "difficulty": "easy",
        "question": "Tỉnh Phú Thọ nổi tiếng với đặc sản quả có múi thơm ngon từng được tiến vua là gì?",
        "options": [
          "Bưởi Đoan Hùng",
          "Cam sành Hàm Yên",
          "Xoài cát Hòa Lộc",
          "Nhãn lồng Hưng Yên"
        ],
        "answer": 0,
        "explanation": "Bưởi Đoan Hùng (như bưởi Sửu, bưởi Bằng Luân) thơm ngon nức tiếng là niềm tự hào của vùng đất Tổ."
      },
      {
        "difficulty": "easy",
        "question": "Hình ảnh thiên nhiên đặc trưng được ngợi ca trong thơ ca quê hương Phú Thọ là:",
        "options": [
          "Rừng cọ đồi chè",
          "Rừng dừa bạt ngàn",
          "Cánh đồng sen thơm ngát",
          "Rừng ngập mặn sú vẹt"
        ],
        "answer": 0,
        "explanation": "“Rừng cọ đồi chè, đồng xanh ngào ngạt” là hình ảnh biểu tượng gắn liền với cảnh sắc thanh bình của Phú Thọ."
      },
      {
        "difficulty": "easy",
        "question": "Hệ thống các ngôi đền chính trên trục leo núi Nghĩa Lĩnh Đền Hùng gồm những đền nào?",
        "options": [
          "Đền Hạ, Đền Trung, Đền Thượng và Đền Giếng",
          "Đền Đông và Đền Tây",
          "Chỉ có một Đền Thượng duy nhất",
          "Đền Vua và Đền Tướng"
        ],
        "answer": 0,
        "explanation": "Hành trình leo núi Đền Hùng đi qua Đền Hạ (nơi Mẹ Âu Cơ sinh bọc trăm trứng), Đền Trung, Đền Thượng và Đền Giếng."
      },
      {
        "difficulty": "easy",
        "question": "Huyện nào sau đây thuộc địa giới hành chính của tỉnh Phú Thọ?",
        "options": [
          "Thanh Ba",
          "Ba Vì",
          "Sóc Sơn",
          "Gia Lâm"
        ],
        "answer": 0,
        "explanation": "Thanh Ba là một huyện trung du đồi chè trù phú của tỉnh Phú Thọ."
      },
      {
        "difficulty": "medium",
        "question": "Nguồn tài nguyên suối nước khoáng nóng tự nhiên nổi tiếng của Phú Thọ nằm tại huyện nào?",
        "options": [
          "Huyện Thanh Thủy",
          "Huyện Cẩm Khê",
          "Huyện Tam Nông",
          "Huyện Phù Ninh"
        ],
        "answer": 0,
        "explanation": "Khu du lịch suối khoáng nóng Thanh Thủy là điểm đến nghỉ dưỡng và chăm sóc sức khỏe nổi tiếng của Phú Thọ."
      },
      {
        "difficulty": "medium",
        "question": "Lễ hội Đền Hùng hàng năm thu hút hàng triệu đồng bào cả nước hướng về với truyền thống đạo lý cốt lõi nào?",
        "options": [
          "Uống nước nhớ nguồn",
          "Tôn sư trọng đạo",
          "Lá lành đùm lá rách",
          "Hiếu học thành tài"
        ],
        "answer": 0,
        "explanation": "Giỗ Tổ Hùng Vương thể hiện lòng biết ơn sâu sắc và tri ân công đức tổ tiên dựng nước của dân tộc Việt Nam."
      },
      {
        "difficulty": "medium",
        "question": "Tỉnh Phú Thọ tiếp giáp về phía đông nam với thành phố trực thuộc Trung ương nào?",
        "options": [
          "Thủ đô Hà Nội",
          "Thành phố Hải Phòng",
          "Thành phố Đà Nẵng",
          "Thành phố Hồ Chí Minh"
        ],
        "answer": 0,
        "explanation": "Phú Thọ giáp thủ đô Hà Nội qua ranh giới tự nhiên là sông Đà và sông Hồng."
      },
      {
        "difficulty": "medium",
        "question": "Món ăn đặc sản dân dã truyền thống làm từ thịt lợn trộn thính ngô rang thơm của đồng bào Mường ở Phú Thọ là gì?",
        "options": [
          "Thịt chua Thanh Sơn",
          "Nem chua Thanh Hóa",
          "Chả cá Lã Vọng",
          "Bánh tẻ Làng Chờ"
        ],
        "answer": 0,
        "explanation": "Thịt chua Thanh Sơn là đặc sản trứ danh làm từ thịt lợn lửng lên men tự nhiên với thính gạo rang."
      },
      {
        "difficulty": "medium",
        "question": "Di tích lịch sử Đền Mẫu Âu Cơ - nơi thờ người Mẹ huyền thoại sinh ra đồng bào ta - tọa lạc tại huyện nào của Phú Thọ?",
        "options": [
          "Huyện Hạ Hòa",
          "Huyện Đoan Hùng",
          "Huyện Lâm Thao",
          "Huyện Thanh Ba"
        ],
        "answer": 0,
        "explanation": "Đền Mẫu Âu Cơ nằm ở xã Hiền Lương, huyện Hạ Hòa, là nơi Mẹ Âu Cơ cùng 50 người con dừng chân khai hoang lập nghiệp."
      },
      {
        "difficulty": "hard",
        "question": "Di chỉ khảo cổ học Phùng Nguyên (huyện Lâm Thao, Phú Thọ) ghi dấu thời kỳ nào trong tiến trình lịch sử tiền sử Việt Nam?",
        "options": [
          "Thời đại đồ đồng sơ kỳ (bước mở đầu thời đại kim khí)",
          "Thời kỳ đồ đá cũ nguyên thủy",
          "Thời kỳ đồ sắt muộn",
          "Thời kỳ đồ sứ hiện đại"
        ],
        "answer": 0,
        "explanation": "Văn hóa Phùng Nguyên (khoảng 4000 năm trước) chứng minh sự hiện diện của cư dân bản địa phát triển rực rỡ thời tiền Hùng Vương."
      },
      {
        "difficulty": "hard",
        "question": "Ngã ba Bạch Hạc lịch sử tại thành phố Việt Trì (Phú Thọ) là nơi hợp lưu của ba con sông lớn nào?",
        "options": [
          "Sông Thao (Sông Hồng), Sông Lô và Sông Đà",
          "Sông Mã, Sông Chu và Sông Cả",
          "Sông Cầu, Sông Thương và Sông Lục Nam",
          "Sông Đồng Nai, Sông Bé và Sông Sài Gòn"
        ],
        "answer": 0,
        "explanation": "Ngã ba Hạc là địa danh địa lý - lịch sử kỳ vĩ nơi hội tụ ba dòng sông lớn của miền Bắc trước khi đổ về đồng bằng."
      },
      {
        "difficulty": "hard",
        "question": "Nơi Vua Hùng xưa dạy nhân dân cách cấy lúa nước, gắn liền với Lễ hội Tịch điền cổ truyền diễn ra tại địa danh nào ở Phú Thọ?",
        "options": [
          "Vùng đất Minh Nông (thành phố Việt Trì)",
          "Xã Hiền Lương (Hạ Hòa)",
          "Rừng quốc gia Xuân Sơn",
          "Đồi chè Long Cốc (Tân Sơn)"
        ],
        "answer": 0,
        "explanation": "Phường Minh Nông (TP. Việt Trì) là cái nôi nền văn minh lúa nước, nơi Vua Hùng đích thân xuống đồng dạy dân cấy lúa."
      },
      {
        "difficulty": "hard",
        "question": "Câu thơ bất hủ nhắc nhở ngày Giỗ Tổ: “Hằng năm ăn đâu làm đâu / Cũng biết cúi đầu nhớ ngày giỗ Tổ” nằm trong trường ca nào của nhà thơ Nguyễn Khoa Điềm?",
        "options": [
          "Trường ca Mặt đường khát vọng (đoạn trích Đất Nước)",
          "Trường ca Bài ca người thợ xây",
          "Tây Tiến",
          "Ánh trăng"
        ],
        "answer": 0,
        "explanation": "Đoạn trích “Đất Nước” trong trường ca “Mặt đường khát vọng” ngợi ca đạo lý hướng về nguồn cội thiêng liêng Phú Thọ."
      },
      {
        "difficulty": "hard",
        "question": "Ngôi đền tọa lạc trên đỉnh cao nhất của núi Nghĩa Lĩnh, nơi thờ kính Trời Đất và các vị Vua Hùng, có tên chữ là gì?",
        "options": [
          "Kính Thiên Lĩnh Điện (Đền Thượng)",
          "Đền Hạ",
          "Đền Giếng",
          "Đền Trung"
        ],
        "answer": 0,
        "explanation": "Đền Thượng mang tên chữ “Kính Thiên Lĩnh Điện” (Điện Kính Thiên trên đỉnh núi), là nơi diễn ra đại lễ Giỗ Tổ Hùng Vương trang trọng nhất."
      }
    ]
  }
};
