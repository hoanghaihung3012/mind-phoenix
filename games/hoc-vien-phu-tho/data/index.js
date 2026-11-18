// Dữ liệu danh mục Học Viện Phú Thọ (shop, pets, badges, zones)
export const shop = {
  skins: [
    {
      id: "default-student",
      name: "Đồng phục xanh nhạt",
      description: "Áo xanh nhạt, quần hoặc váy xanh đậm.",
      price: 0,
      style: { shirt: "#8fd3ff", bottom: "#2f4b9b", accessory: "none" }
    },
    {
      id: "explorer",
      name: "Nhà thám hiểm",
      description: "Mũ thám hiểm và áo gi-lê xanh lá.",
      price: 150,
      style: { shirt: "#c9b27a", bottom: "#6b5b3a", accessory: "explorer" }
    },
    {
      id: "scholar",
      name: "Học giả",
      description: "Mũ cử nhân và nơ bướm thông thái.",
      price: 300,
      style: { shirt: "#f2efe6", bottom: "#3b3b5c", accessory: "scholar" }
    },
    {
      id: "inventor",
      name: "Nhà phát minh",
      description: "Áo choàng trắng và kính bảo hộ sáng chế.",
      price: 500,
      style: { shirt: "#ffffff", bottom: "#546e7a", accessory: "inventor" }
    },
    {
      id: "leader",
      name: "Thủ lĩnh Học viện",
      description: "Dải lụa vàng và áo choàng đỏ. Chỉ mở khi hoàn thành Đại hội Tri thức.",
      price: 0,
      unlock: "finalChallenge",
      style: { shirt: "#fff1a8", bottom: "#b3261e", accessory: "leader" }
    }
  ],
  bagColors: [
    { id: "red", name: "Đỏ", color: "#e4572e", price: 0 },
    { id: "blue", name: "Xanh dương", color: "#3a7bd5", price: 0 },
    { id: "green", name: "Xanh lá", color: "#2fa56b", price: 0 },
    { id: "purple", name: "Tím", color: "#8e5bd0", price: 40 },
    { id: "pink", name: "Hồng", color: "#f27bb0", price: 40 },
    { id: "orange", name: "Cam", color: "#f28c28", price: 40 }
  ],
  shoeColors: [
    { id: "white", name: "Trắng", color: "#ffffff", price: 0 },
    { id: "black", name: "Đen", color: "#333a45", price: 0 },
    { id: "red", name: "Đỏ", color: "#d94a3a", price: 0 },
    { id: "pink", name: "Hồng", color: "#f78fb9", price: 50 },
    { id: "yellow", name: "Vàng", color: "#f5c518", price: 50 },
    { id: "mint", name: "Xanh bạc hà", color: "#5ed1b1", price: 50 }
  ],
  effects: [
    { id: "none", name: "Không hiệu ứng", description: "Đi bộ bình thường.", price: 0 },
    { id: "sparkle", name: "Đường sao lấp lánh", description: "Những ngôi sao nhỏ rơi theo bước chân.", price: 80 },
    { id: "leaves", name: "Lá xanh bay bay", description: "Lá xanh nhẹ nhàng bay quanh con.", price: 100 },
    { id: "bubbles", name: "Bong bóng xà phòng", description: "Bong bóng nhỏ bay lên sau mỗi bước.", price: 120 }
  ],
  hairColors: [
    { id: 0, name: "Đen", color: "#2b2b33" },
    { id: 1, name: "Nâu đậm", color: "#5b3a29" },
    { id: 2, name: "Nâu sáng", color: "#a0612f" },
    { id: 3, name: "Vàng", color: "#e8c15b" },
    { id: 4, name: "Đỏ nâu", color: "#b5412c" },
    { id: 5, name: "Xám bạc", color: "#9aa3ad" }
  ]
};

export const pets = [
  { id: "duck", name: "Vịt", description: "Chú vịt vàng lạch bạch dễ thương.", price: 0 },
  { id: "dog", name: "Chó", description: "Chú chó nhỏ trung thành, hay vẫy đuôi.", price: 100 },
  { id: "chicken", name: "Gà", description: "Cô gà con lông vàng, mào đỏ xinh xắn.", price: 150 },
  { id: "rabbit", name: "Thỏ", description: "Chú thỏ trắng tai dài, nhảy rất nhẹ nhàng.", price: 200 }
];

export const badges = [
  { id: "spelling-master", name: "Bậc thầy Chính tả", description: "Trả lời đúng 20 câu chính tả.", icon: "pencil", color: "#e4572e", coinReward: 25 },
  { id: "vocab-explorer", name: "Nhà thám hiểm Từ vựng", description: "Trả lời đúng 20 câu từ vựng.", icon: "book", color: "#1e6fd9", coinReward: 25 },
  { id: "sentence-builder", name: "Người xây câu", description: "Hoàn thành 10 thử thách ghép câu.", icon: "blocks", color: "#8e5bd0", coinReward: 25 },
  { id: "idiom-sage", name: "Người hiểu Thành ngữ", description: "Hoàn thành 10 câu thành ngữ.", icon: "scroll", color: "#c97a00", coinReward: 25 },
  { id: "perfect-streak", name: "Chuỗi hoàn hảo", description: "Đạt combo 10.", icon: "flame", color: "#e07b00", coinReward: 30 },
  { id: "diligent-learner", name: "Người học chăm chỉ", description: "Hoàn thành 10 nhiệm vụ.", icon: "clipboard", color: "#2e9e5b", coinReward: 30 },
  { id: "collector", name: "Người sưu tập", description: "Sở hữu 3 skin hoặc 3 thú cưng.", icon: "gem", color: "#d6409f", coinReward: 30 },
  { id: "honor", name: "Huy hiệu Danh dự", description: "Hoàn thành Đại hội Tri thức.", icon: "trophy", color: "#f2a900", coinReward: 50 }
];

export const zones = [
  { id: "library", name: "Thư viện Từ vựng", game: "Truy tìm kho báu từ vựng", requirements: {} },
  { id: "spelling", name: "Khu Chính tả", game: "Bắn bong bóng chính tả", requirements: {} },
  { id: "literature", name: "Nhà Ngữ văn", game: "Ghép câu hoàn chỉnh", requirements: {} },
  { id: "idiom", name: "Quảng trường Thành ngữ", game: "Mở ô chữ thành ngữ", requirements: {} },
  { id: "math", name: "Vườn Toán học", game: "Bắn bong bóng toán học", requirements: {} },
  { id: "arena", name: "Phòng Thử thách", game: "Đấu trường 60 giây", requirements: { minLevel: 3 } },
  { id: "grand", name: "Đại hội Tri thức", game: "Đại hội Tri thức", requirements: { minLevel: 5, minBadges: 3, minCorrect: 20 } },
  { id: "shop", name: "Cửa hàng Học viện", game: "Cửa hàng", panel: true, requirements: {} },
  { id: "pets", name: "Khu thú cưng", game: "Thú cưng", panel: true, requirements: {} }
];
