/**
 * Học Viện Phú Thọ (Phu Tho Academy) - Core Game Engine
 * Thiết kế theo kiến trúc chuẩn từ game Phú Thọ gốc:
 * Bản đồ trường học hoành tráng, nhân vật chibi xịn xò, thú cưng đi theo (Pet Follower),
 * hệ thống tiền xu (Coins), điểm kinh nghiệm (XP), cấp độ (Level), Cửa hàng (Shop),
 * Nhiệm vụ (Missions), Huy hiệu (Badges) và Đại hội Tri thức (Grand Challenge).
 */

export const MAP_CONFIG = {
  width: 2240,
  height: 1624,
  spawn: { x: 1120, y: 1400 },
  bounds: { x: 40, y: 160, w: 2160, h: 1320 }
};

export const SCHOOL_PRESETS = [
  'TH Phú Thọ',
  'TH Chu Văn An',
  'TH Lê Quý Đôn',
  'TH Kim Đồng',
  'TH Nguyễn Bỉnh Khiêm',
  'TH Võ Thị Sáu',
  'Trường Bạn Khác'
];

export const PET_CONFIGS = [
  { id: 'duck', name: 'Vịt Vàng', icon: '🐥', desc: 'Chú vịt vàng lạch bạch dễ thương.', price: 0 },
  { id: 'dog', name: 'Cún Con', icon: '🐶', desc: 'Chú cún nhỏ trung thành hay vẫy đuôi.', price: 50 },
  { id: 'chicken', name: 'Gà Con', icon: '🐣', desc: 'Cô gà con lông vàng mào đỏ xinh xắn.', price: 80 },
  { id: 'rabbit', name: 'Thỏ Trắng', icon: '🐰', desc: 'Chú thỏ trắng tai dài nhảy nhẹ nhàng.', price: 100 },
  { id: 'cat', name: 'Mèo Mướp', icon: '🐱', desc: 'Chú mèo con tinh nghịch với đôi mắt biếc.', price: 120 }
];

export const CUSTOMIZATION_OPTIONS = {
  characters: [
    { id: 'boy', label: 'Bạn Nam', icon: '👦' },
    { id: 'girl', label: 'Bạn Nữ', icon: '👧' }
  ],
  skins: [
    { id: 'fair', label: 'Trắng hồng', color: '#ffd9b8' },
    { id: 'warm', label: 'Tự nhiên', color: '#f5c798' },
    { id: 'tan', label: 'Bánh mật', color: '#d89a64' },
    { id: 'peach', label: 'Ấm áp', color: '#ffd2b0' },
  ],
  hairs: [
    { id: 'short', label: 'Tóc ngắn gọn gàng' },
    { id: 'spiky', label: 'Tóc vuốt cá tính' },
    { id: 'bob', label: 'Tóc bob năng động' },
    { id: 'ponytail', label: 'Đuôi ngựa thắt nơ' },
    { id: 'twintail', label: 'Hai chùm cột cao' },
    { id: 'curly', label: 'Tóc xoăn bồng bềnh' },
  ],
  hairColors: [
    { id: 'black', label: 'Đen tuyền', color: '#1f1f1f' },
    { id: 'brown', label: 'Nâu hạt dẻ', color: '#4a2c11' },
    { id: 'chestnut', label: 'Nâu sáng', color: '#7c3f1d' },
    { id: 'navy', label: 'Xanh đêm', color: '#1e3a8a' },
    { id: 'amber', label: 'Hổ phách', color: '#b45309' },
  ],
  outfits: [
    {
      id: 'default-student',
      label: 'Đồng phục Phú Thọ (Khăn quàng đỏ)',
      shirt: '#ffffff',
      bottom: '#2f4b9b',
      scarf: '#dc2626',
      accessory: 'none',
      price: 0
    },
    {
      id: 'explorer',
      label: 'Nhà Thám Hiểm (Áo gile & Nón)',
      shirt: '#c9b27a',
      bottom: '#6b5b3a',
      scarf: null,
      accessory: 'explorer',
      price: 80
    },
    {
      id: 'scholar',
      label: 'Học Giả Cử Nhân (Mũ tú tài & Nơ)',
      shirt: '#f2efe6',
      bottom: '#3b3b5c',
      scarf: null,
      accessory: 'scholar',
      price: 150
    },
    {
      id: 'inventor',
      label: 'Nhà Phát Minh (Áo blouse & Kính)',
      shirt: '#ffffff',
      bottom: '#546e7a',
      scarf: null,
      accessory: 'inventor',
      price: 200
    },
    {
      id: 'leader',
      label: 'Thủ Lĩnh Học Viện (Áo hoàng gia & Choàng đỏ)',
      shirt: '#fff1a8',
      bottom: '#b3261e',
      scarf: null,
      accessory: 'leader',
      price: 0,
      unlockRequirement: 'Hoàn thành Đại Hội Tri Thức'
    },
    {
      id: 'sport',
      label: 'Thể Dục Năng Động',
      shirt: '#f97316',
      bottom: '#0284c7',
      scarf: null,
      accessory: 'none',
      price: 40
    }
  ],
  bagColors: [
    { id: 'red', label: 'Balo Đỏ', color: '#e4572e' },
    { id: 'blue', label: 'Balo Xanh Dương', color: '#3a7bd5' },
    { id: 'green', label: 'Balo Xanh Lá', color: '#2fa56b' },
    { id: 'purple', label: 'Balo Tím', color: '#8e5bd0' },
    { id: 'yellow', label: 'Balo Vàng', color: '#f59e0b' },
    { id: 'pink', label: 'Balo Hồng', color: '#ec4899' },
  ],
  accessories: [
    { id: 'none', label: 'Không phụ kiện' },
    { id: 'glasses', label: 'Kính cận tri thức' },
    { id: 'star_pin', label: 'Huy hiệu Sao Vàng Phú Thọ' },
    { id: 'headband', label: 'Băng đô thể thao' },
  ]
};

export const POI_LOCATIONS = [
  {
    id: 'gate',
    name: 'Cổng Trường Tiểu Học Phú Thọ',
    nameEn: 'Phu Tho Primary School Main Gate',
    x: 1120,
    y: 1520,
    radius: 120,
    icon: '🏫',
    category: 'welcome',
    desc: 'Cổng trường Phú Thọ khang trang đón chào các bạn học sinh và bạn bè trường bạn!',
  },
  {
    id: 'flagpole',
    name: 'Cột Cờ & Lễ Đài Quốc Kỳ',
    nameEn: 'Honor Flagpole Plaza',
    x: 749,
    y: 910,
    radius: 95,
    icon: '🚩',
    category: 'landmark',
    desc: 'Lễ đài cờ đỏ sao vàng trang nghiêm, nơi vinh danh học sinh xuất sắc.',
  },
  {
    id: 'pond',
    name: 'Hồ Hoa Sen Phú Thọ',
    nameEn: 'Phu Tho Lotus Pond',
    x: 1491,
    y: 896,
    radius: 100,
    icon: '🐟',
    category: 'social',
    desc: 'Hồ sen trong lành rợp bóng mát, đàn cá tung tăng dưới ánh nắng sân trường.',
  },
  {
    id: 'library',
    name: 'Thư Viện Từ Vựng',
    nameEn: 'Vocabulary Library',
    x: 378,
    y: 630,
    radius: 125,
    icon: '📚',
    category: 'game',
    gameType: 'vocabulary',
    minigameTitle: 'Truy Tìm Kho Báu Từ Vựng',
    desc: 'Khám phá từ đồng nghĩa, trái nghĩa, từ ghép và từ láy phong phú.',
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: 'grand',
    name: 'ĐẠI HỘI TRI THỨC PHÚ THỌ',
    nameEn: 'Grand Hall of Wisdom',
    x: 1120,
    y: 630,
    radius: 145,
    icon: '👑',
    category: 'special_zone',
    gameType: 'grand',
    minigameTitle: 'Đại Khảo Thí Tri Thức Tinh Hoa',
    desc: 'Tòa nhà Tân Cổ Điển nguy nga nhất trường! Cần đạt Cấp độ 3 hoặc 60 Sao để mở khóa.',
    requiredLevel: 3,
    requiredPoints: 60,
    rewardCoins: 100,
    rewardXP: 120,
  },
  {
    id: 'literature',
    name: 'Nhà Ngữ Văn & Ghép Câu',
    nameEn: 'Literature & Sentence Palace',
    x: 1862,
    y: 630,
    radius: 125,
    icon: '📜',
    category: 'game',
    gameType: 'literature',
    minigameTitle: 'Xây Dựng Câu Văn Hoàn Chỉnh',
    desc: 'Rèn luyện ngữ pháp, chủ ngữ - vị ngữ và biện pháp tu từ nghệ thuật.',
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: 'spelling',
    name: 'Khu Chính Tả Tiếng Việt',
    nameEn: 'Spelling Pavilion',
    x: 350,
    y: 1120,
    radius: 125,
    icon: '✏️',
    category: 'game',
    gameType: 'spelling',
    minigameTitle: 'Bắn Bong Bóng Chính Tả',
    desc: 'Soi lỗi chính tả tiếng Việt: s/x, tr/ch, d/gi/r và thanh điệu hỏi ngã.',
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: 'arena',
    name: 'Đấu Trường Thử Thách 60s',
    nameEn: 'Speed Challenge Arena',
    x: 1120,
    y: 1120,
    radius: 120,
    icon: '⚡',
    category: 'game',
    gameType: 'arena',
    minigameTitle: 'Đấu Trường Tốc Độ 60 Giây',
    desc: 'Phản xạ nhanh như chớp với các câu hỏi thi đấu dồn dập.',
    rewardCoins: 35,
    rewardXP: 45,
  },
  {
    id: 'idiom',
    name: 'Quảng Trường Thành Ngữ',
    nameEn: 'Idiom & Folklore Plaza',
    x: 1890,
    y: 1120,
    radius: 125,
    icon: '🧩',
    category: 'game',
    gameType: 'idiom',
    minigameTitle: 'Mở Ô Chữ Thành Ngữ - Tục Ngữ',
    desc: 'Kho tàng ca dao tục ngữ và bài học quý báu của cha ông.',
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: 'math',
    name: 'Vườn Toán Học & Chuỗi Số',
    nameEn: 'Math Garden & Logic Maze',
    x: 1526,
    y: 1445,
    radius: 120,
    icon: '🧮',
    category: 'game',
    gameType: 'math',
    minigameTitle: 'Bắn Bong Bóng Toán Học & Chuỗi Số',
    desc: 'Thử tài tính nhẩm nhanh và câu đố hình học thông thái.',
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: 'missions',
    name: 'Bảng Nhiệm Vụ Học Viện',
    nameEn: 'Daily Mission Board',
    x: 728,
    y: 1400,
    radius: 95,
    icon: '📋',
    category: 'panel',
    panelType: 'missions',
    desc: 'Bảng gỗ nhiệm vụ mỗi ngày: Hoàn thành thử thách để nhận thêm Xu và XP!',
  },
  {
    id: 'shop',
    name: 'Cửa Hàng Học Viện',
    nameEn: 'Academy Boutique',
    x: 1932,
    y: 1445,
    radius: 120,
    icon: '🛍️',
    category: 'panel',
    panelType: 'shop',
    desc: 'Nơi mua sắm trang phục mới, đổi màu balo, giày và nâng cấp phụ kiện!',
  },
  {
    id: 'pets',
    name: 'Khu Thú Cưng Đáng Yêu',
    nameEn: 'Pet Companion Sanctuary',
    x: 322,
    y: 1445,
    radius: 120,
    icon: '🐾',
    category: 'panel',
    panelType: 'pets',
    desc: 'Nhận nuôi thú cưng đồng hành chạy theo sau bạn trên khắp sân trường!',
  }
];

export const DAILY_MISSIONS = [
  { id: 'm-spell-3', text: 'Trả lời đúng 3 câu Chính tả', target: 3, category: 'spelling', current: 0, rewardCoins: 15, rewardXP: 20 },
  { id: 'm-idiom-3', text: 'Hoàn thành 3 câu Thành ngữ', target: 3, category: 'idiom', current: 0, rewardCoins: 15, rewardXP: 20 },
  { id: 'm-vocab-3', text: 'Chinh phục 3 câu Thư viện Từ vựng', target: 3, category: 'vocabulary', current: 0, rewardCoins: 15, rewardXP: 20 },
  { id: 'm-math-3', text: 'Giải đúng 3 bài Vườn Toán học', target: 3, category: 'math', current: 0, rewardCoins: 15, rewardXP: 20 },
  { id: 'm-grand-1', text: 'Chinh phục thử thách Đại Hội Tri Thức', target: 1, category: 'grand', current: 0, rewardCoins: 50, rewardXP: 80 }
];

export const DEFAULT_NPCS = [
  {
    id: 'npc_minh',
    name: 'Bạn Minh (Lớp 4A Phú Thọ)',
    school: 'TH Phú Thọ',
    character: 'boy',
    skin: 'fair',
    hair: 'short',
    hairStyle: 0,
    hairColor: 0,
    outfit: 'default-student',
    skinId: 'default-student',
    bagColor: 'blue',
    shoeColor: 'white',
    pet: 'dog',
    x: 1040,
    y: 1380,
    direction: 'down',
    messages: [
      'Chào mừng bạn đến với Trường Tiểu học Phú Thọ!',
      'Sân trường chúng mình rộng rãi, thoáng mát và có rất nhiều điều kỳ thú!',
      'Bạn hãy vào Thư viện và Khu Chính tả để kiếm thêm Xu mua thú cưng nhé!'
    ]
  },
  {
    id: 'npc_lan',
    name: 'Bạn Lan (Lớp 4B Phú Thọ)',
    school: 'TH Phú Thọ',
    character: 'girl',
    skin: 'warm',
    hair: 'ponytail',
    hairStyle: 2,
    hairColor: 1,
    outfit: 'default-student',
    skinId: 'default-student',
    bagColor: 'red',
    shoeColor: 'white',
    pet: 'duck',
    x: 820,
    y: 920,
    direction: 'left',
    messages: [
      'Chào bạn! Đứng dưới bóng Cột Cờ Tổ Quốc thật tự hào!',
      'Cậu đã đạt Cấp độ 3 để mở khóa Đại Hội Tri Thức chưa?',
      'Đại Hội Tri Thức ở tòa nhà trung tâm mái vòm vàng lộng lẫy đó!'
    ]
  },
  {
    id: 'npc_khoi',
    name: 'Bạn Khôi (TH Chu Văn An)',
    school: 'TH Chu Văn An',
    character: 'boy',
    skin: 'tan',
    hair: 'spiky',
    hairStyle: 1,
    hairColor: 2,
    outfit: 'explorer',
    skinId: 'explorer',
    bagColor: 'green',
    shoeColor: 'black',
    pet: 'rabbit',
    x: 1800,
    y: 1140,
    direction: 'up',
    messages: [
      'Trường Phú Thọ vừa rộng vừa đẹp, khuôn viên xanh mát tuyệt vời!',
      'Tớ từ trường Chu Văn An sang đây giao lưu học tập.',
      'Quảng trường Thành ngữ có nhiều câu đố thú vị lắm đó bạn ơi!'
    ]
  },
  {
    id: 'npc_mai',
    name: 'Bạn Mai (TH Lê Quý Đôn)',
    school: 'TH Lê Quý Đôn',
    character: 'girl',
    skin: 'peach',
    hair: 'twintail',
    hairStyle: 3,
    hairColor: 0,
    outfit: 'scholar',
    skinId: 'scholar',
    bagColor: 'pink',
    shoeColor: 'pink',
    pet: 'chicken',
    x: 460,
    y: 650,
    direction: 'right',
    messages: [
      'Tớ vừa mua mũ cử nhân ở Cửa hàng Học viện nè, xinh không?',
      'Hãy ghé Thư Viện Từ Vựng giải đố từ ghép và từ láy với tớ nhé!'
    ]
  },
  {
    id: 'npc_thay_hieu_truong',
    name: 'Thầy Hiệu Trưởng (TH Phú Thọ)',
    school: 'TH Phú Thọ',
    character: 'boy',
    skin: 'warm',
    hair: 'short',
    hairStyle: 0,
    hairColor: 5,
    outfit: 'scholar',
    skinId: 'scholar',
    bagColor: 'purple',
    shoeColor: 'black',
    pet: 'dog',
    x: 1120,
    y: 660,
    direction: 'down',
    messages: [
      'Chào mừng các em học sinh thân mến đến với Đại Hội Tri Thức!',
      'Học tập là hành trình khám phá không ngừng nghỉ.',
      'Chúc các em đạt được thật nhiều Sao Danh Dự và niềm vui!'
    ]
  },
  {
    id: 'npc_an',
    name: 'Bạn An (Lớp 3C Phú Thọ)',
    school: 'TH Phú Thọ',
    character: 'boy',
    skin: 'fair',
    hair: 'spiky',
    hairStyle: 1,
    hairColor: 3,
    outfit: 'default-student',
    skinId: 'default-student',
    bagColor: 'orange',
    shoeColor: 'yellow',
    pet: 'rabbit',
    x: 1120,
    y: 1170,
    direction: 'up',
    messages: [
      'Đấu trường 60 giây dồn dập và nghẹt thở cực kỳ!',
      'Cậu có tự tin phản xạ nhanh hơn tớ không nào?',
      'Vào thi đấu để thử thách giới hạn bản thân nhé!'
    ]
  },
  {
    id: 'npc_ngoc',
    name: 'Bạn Ngọc (TH Nguyễn Bỉnh Khiêm)',
    school: 'TH Nguyễn Bỉnh Khiêm',
    character: 'girl',
    skin: 'warm',
    hair: 'bob',
    hairStyle: 1,
    hairColor: 2,
    outfit: 'explorer',
    skinId: 'explorer',
    bagColor: 'red',
    shoeColor: 'white',
    pet: 'duck',
    x: 1560,
    y: 920,
    direction: 'left',
    messages: [
      'Hồ sen Phú Thọ mát quá! Cá bơi lội dưới hoa súng nở rộ.',
      'Tớ thích ngắm đàn vịt vàng bơi cùng đàn cá ở đây.',
      'Sau giờ học được thư giãn bên hồ thật là sảng khoái!'
    ]
  },
  {
    id: 'npc_duc',
    name: 'Bạn Đức (Lớp 5A Phú Thọ)',
    school: 'TH Phú Thọ',
    character: 'boy',
    skin: 'fair',
    hair: 'short',
    hairStyle: 0,
    hairColor: 4,
    outfit: 'leader',
    skinId: 'leader',
    bagColor: 'red',
    shoeColor: 'mint',
    pet: 'chicken',
    x: 1240,
    y: 640,
    direction: 'left',
    messages: [
      'Tớ đã xuất sắc chinh phục Đại Hội Tri Thức và nhận Áo Choàng Thủ Lĩnh!',
      'Các câu hỏi rất thú vị, bao quát kiến thức cả tiểu học.',
      'Cố gắng lên nhé bạn ơi, danh hiệu Thủ Lĩnh đang chờ bạn!'
    ]
  },
  {
    id: 'npc_ha',
    name: 'Bạn Hà (TH Kim Đồng)',
    school: 'TH Kim Đồng',
    character: 'girl',
    skin: 'peach',
    hair: 'twintail',
    hairStyle: 2,
    hairColor: 1,
    outfit: 'inventor',
    skinId: 'inventor',
    bagColor: 'purple',
    shoeColor: 'white',
    pet: 'rabbit',
    x: 1600,
    y: 1440,
    direction: 'down',
    messages: [
      'Kính bảo hộ sáng chế giúp tớ tập trung giải toán siêu nhanh!',
      'Vườn Toán học có trò bắn bong bóng số học vui lắm.',
      'Cùng thi xem ai đạt chuỗi trả lời đúng dài nhất nhé!'
    ]
  },
  {
    id: 'npc_linh',
    name: 'Bạn Linh (TH Võ Thị Sáu)',
    school: 'TH Võ Thị Sáu',
    character: 'girl',
    skin: 'fair',
    hair: 'ponytail',
    hairStyle: 3,
    hairColor: 0,
    outfit: 'default-student',
    skinId: 'default-student',
    bagColor: 'pink',
    shoeColor: 'pink',
    pet: 'dog',
    x: 1860,
    y: 650,
    direction: 'down',
    messages: [
      'Chào bạn! Tớ rất mê những câu văn hay ở Nhà Ngữ Văn.',
      'Ghép câu đúng ngữ pháp giúp bài văn của chúng mình giàu cảm xúc hơn!',
      'Học viện Phú Thọ thật sự là sân chơi tri thức bổ ích cho học sinh chúng mình.'
    ]
  }
];

export function calculateLevel(xp = 0) {
  // Level threshold: 50 XP per level
  const level = Math.floor(xp / 60) + 1;
  const currentLevelXP = xp % 60;
  return { level, currentLevelXP, maxLevelXP: 60 };
}

export function createDefaultPlayer(savedData = {}) {
  const xp = Number(savedData.xp) || 0;
  const { level } = calculateLevel(xp);

  const character = savedData.character || 'boy';
  return {
    id: savedData.id || `pt_${Math.random().toString(36).slice(2, 9)}`,
    name: savedData.name || 'Học sinh Phú Thọ',
    school: savedData.school || 'TH Phú Thọ',
    character, // 'boy' | 'girl'
    skin: savedData.skin || 'fair',
    hair: savedData.hair || (character === 'girl' ? 'ponytail' : 'short'),
    hairStyle: typeof savedData.hairStyle === 'number' ? savedData.hairStyle : (character === 'girl' ? 2 : 0),
    hairColor: typeof savedData.hairColor === 'number' ? savedData.hairColor : 0,
    outfit: savedData.outfit || 'default-student',
    skinId: savedData.skinId || savedData.outfit || 'default-student',
    bagColor: savedData.bagColor || 'red',
    shoeColor: savedData.shoeColor || 'white',
    accessory: savedData.accessory || 'none',
    pet: savedData.pet || 'duck', // follower pet: duck, dog, chicken, rabbit
    coins: Number(savedData.coins) || 50, // starting gift coins
    xp,
    level,
    points: Number(savedData.points) || 0, // Academy Stars
    clearedGames: savedData.clearedGames || {},
    specialUnlocked: Boolean(savedData.specialUnlocked),
    ownedSkins: savedData.ownedSkins || ['default-student'],
    ownedPets: savedData.ownedPets || ['duck'],
    x: savedData.x ?? MAP_CONFIG.spawn.x,
    y: savedData.y ?? MAP_CONFIG.spawn.y,
    targetX: savedData.x ?? MAP_CONFIG.spawn.x,
    targetY: savedData.y ?? MAP_CONFIG.spawn.y,
    speed: 250,
    direction: 'down',
    moving: false,
    animFrame: 0,
    currentZone: null,
  };
}

export function isSpecialZoneUnlocked(player) {
  if (player.specialUnlocked) return true;
  if ((player.points || 0) >= 60) return true;
  if ((player.level || 1) >= 3) return true;
  const count = Object.keys(player.clearedGames || {}).length;
  return count >= 3;
}

export function checkProximityPOI(x, y) {
  for (const poi of POI_LOCATIONS) {
    const dx = x - poi.x;
    const dy = y - poi.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= poi.radius) {
      return { poi, dist };
    }
  }
  return null;
}

export function calculateDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Web Audio sound synthesizers
 */
export class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playStep() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 20, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  }

  playClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  }

  playSuccess() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.28);
      });
    } catch (_) {}
  }

  playUnlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.38);
      });
    } catch (_) {}
  }

  playChat() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      osc.frequency.setValueAtTime(960, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  }

  playCoin() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (_) {}
  }
}

/**
 * Multiplayer Network Manager
 */
export class AcademyNetworkManager {
  constructor(localPlayer, onRemotePlayerUpdate, onChatReceived, onInteractionReceived) {
    this.localPlayer = localPlayer;
    this.onRemotePlayerUpdate = onRemotePlayerUpdate;
    this.onChatReceived = onChatReceived;
    this.onInteractionReceived = onInteractionReceived;
    this.ws = null;
    this.connected = false;
    this.remotePlayers = new Map();
    this.lastBroadcastMove = 0;

    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.bc = new BroadcastChannel('phutho_academy_channel');
        this.bc.onmessage = (e) => this.handleLocalMessage(e.data);
      } catch (_) {}
    }
  }

  connect(wsUrl) {
    if (typeof window === 'undefined') return;
    try {
      const url = wsUrl || (
        window.location.protocol === 'https:'
          ? `wss://${window.location.host}/ws/academy`
          : `ws://${window.location.hostname}:5005/ws/academy`
      );

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connected = true;
        this.send({
          type: 'join',
          player: {
            id: this.localPlayer.id,
            name: this.localPlayer.name,
            school: this.localPlayer.school,
            character: this.localPlayer.character,
            skin: this.localPlayer.skin,
            hair: this.localPlayer.hair,
            hairColor: this.localPlayer.hairColor,
            outfit: this.localPlayer.outfit,
            bagColor: this.localPlayer.bagColor,
            accessory: this.localPlayer.accessory,
            pet: this.localPlayer.pet,
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            points: this.localPlayer.points,
            level: this.localPlayer.level,
            specialUnlocked: this.localPlayer.specialUnlocked
          }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (_) {}
      };

      this.ws.onclose = () => { this.connected = false; };
      this.ws.onerror = () => { this.connected = false; };
    } catch (e) {
      this.connected = false;
    }
  }

  send(data) {
    if (this.ws && this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
    if (this.bc) {
      try { this.bc.postMessage(data); } catch (_) {}
    }
  }

  handleServerMessage(msg) {
    if (msg.type === 'welcome') {
      if (Array.isArray(msg.players)) {
        msg.players.forEach(p => {
          this.remotePlayers.set(p.id, { ...p, lastActive: Date.now() });
        });
        if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
      }
    } else if (msg.type === 'player_joined') {
      if (msg.player && msg.player.id !== this.localPlayer.id) {
        this.remotePlayers.set(msg.player.id, { ...msg.player, lastActive: Date.now() });
        if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
      }
    } else if (msg.type === 'player_moved') {
      if (msg.id && msg.id !== this.localPlayer.id) {
        let p = this.remotePlayers.get(msg.id);
        if (p) {
          p.x = msg.x;
          p.y = msg.y;
          p.direction = msg.direction || p.direction;
          p.anim = msg.anim || p.anim;
          p.lastActive = Date.now();
        }
      }
    } else if (msg.type === 'player_chat') {
      if (this.onChatReceived) this.onChatReceived(msg);
    } else if (msg.type === 'player_interacted') {
      if (this.onInteractionReceived) this.onInteractionReceived(msg);
    } else if (msg.type === 'player_left') {
      this.remotePlayers.delete(msg.id);
      if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
    } else if (msg.type === 'score_updated') {
      const p = this.remotePlayers.get(msg.id);
      if (p) {
        p.points = msg.points;
        p.level = msg.level;
        p.specialUnlocked = msg.specialUnlocked;
      }
    }
  }

  handleLocalMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'join' && msg.player && msg.player.id !== this.localPlayer.id) {
      this.remotePlayers.set(msg.player.id, { ...msg.player, lastActive: Date.now() });
      if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
      if (this.bc) {
        this.bc.postMessage({
          type: 'peer_presence',
          player: {
            id: this.localPlayer.id,
            name: this.localPlayer.name,
            school: this.localPlayer.school,
            character: this.localPlayer.character,
            skin: this.localPlayer.skin,
            hair: this.localPlayer.hair,
            hairColor: this.localPlayer.hairColor,
            outfit: this.localPlayer.outfit,
            bagColor: this.localPlayer.bagColor,
            accessory: this.localPlayer.accessory,
            pet: this.localPlayer.pet,
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            points: this.localPlayer.points,
            level: this.localPlayer.level,
            specialUnlocked: this.localPlayer.specialUnlocked
          }
        });
      }
    } else if (msg.type === 'peer_presence' && msg.player && msg.player.id !== this.localPlayer.id) {
      this.remotePlayers.set(msg.player.id, { ...msg.player, lastActive: Date.now() });
      if (this.onRemotePlayerUpdate) this.onRemotePlayerUpdate(this.remotePlayers);
    } else if (msg.type === 'move' && msg.id && msg.id !== this.localPlayer.id) {
      const p = this.remotePlayers.get(msg.id);
      if (p) {
        p.x = msg.x;
        p.y = msg.y;
        p.direction = msg.direction || p.direction;
        p.anim = msg.anim || p.anim;
        p.lastActive = Date.now();
      }
    } else if (msg.type === 'chat' && msg.senderId !== this.localPlayer.id) {
      if (this.onChatReceived) {
        this.onChatReceived({
          id: msg.senderId,
          name: msg.name,
          school: msg.school,
          text: msg.text,
          timestamp: Date.now()
        });
      }
    } else if (msg.type === 'interact') {
      if (this.onInteractionReceived) this.onInteractionReceived(msg);
    }
  }

  broadcastMove(x, y, direction, anim) {
    const now = Date.now();
    if (now - this.lastBroadcastMove < 50) return;
    this.lastBroadcastMove = now;

    const payload = {
      type: 'move',
      id: this.localPlayer.id,
      x: Math.round(x),
      y: Math.round(y),
      direction,
      anim
    };
    this.send(payload);
  }

  broadcastChat(text) {
    const payload = {
      type: 'chat',
      senderId: this.localPlayer.id,
      name: this.localPlayer.name,
      school: this.localPlayer.school,
      text: String(text).slice(0, 150),
      timestamp: Date.now()
    };
    this.send(payload);
  }

  broadcastInteraction(targetId, action) {
    const payload = {
      type: 'interact',
      fromId: this.localPlayer.id,
      fromName: this.localPlayer.name,
      targetId,
      action,
      timestamp: Date.now()
    };
    this.send(payload);
  }

  broadcastScore(deltaPoints, deltaXP, level, specialUnlocked) {
    const payload = {
      type: 'score_update',
      id: this.localPlayer.id,
      points: this.localPlayer.points,
      xp: this.localPlayer.xp,
      level,
      specialUnlocked
    };
    this.send(payload);
  }
}
