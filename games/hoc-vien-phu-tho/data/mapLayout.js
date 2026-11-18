/** Bố cục bản đồ Trường Tiểu học Phú Thọ (tọa độ thế giới mở rộng 4800 x 3450, siêu rộng và đại giãn cách). */

export const WORLD = { width: 4800, height: 3450 };
/** Vùng nhân vật được phép đi lại (để lại dải trang trí phía trên và cổng trường phía dưới). */
export const BOUNDS = { x: 60, y: 180, w: 4680, h: 3050 };
/** Kích thước nửa chân của nhân vật dùng để tính va chạm. */
export const PLAYER_HALF = { w: 12, h: 7 };
export const SPAWN = { x: 2400, y: 3050 };
export const INTERACT_RADIUS = 120;

/**
 * Các công trình. (cx, baseY) là điểm giữa cạnh dưới; (ix, iy) là điểm tương tác ngay trước cửa.
 * `texture` khớp với texture vẽ trong src/art/mapArt.js.
 */
export const BUILDINGS = [
  {
    zone: "library",
    texture: "bld-library",
    cx: 650,
    baseY: 850,
    w: 420,
    h: 310,
    ix: 650,
    iy: 930,
  },
  {
    zone: "grand",
    texture: "bld-grand",
    cx: 2400,
    baseY: 850,
    w: 550,
    h: 380,
    ix: 2400,
    iy: 930,
  },
  {
    zone: "literature",
    texture: "bld-literature",
    cx: 4150,
    baseY: 850,
    w: 420,
    h: 310,
    ix: 4150,
    iy: 930,
  },
  {
    zone: "spelling",
    texture: "bld-spelling",
    cx: 620,
    baseY: 2050,
    w: 370,
    h: 260,
    ix: 620,
    iy: 2130,
  },
  {
    zone: "arcade",
    texture: "bld-arcade",
    cx: 1450,
    baseY: 2050,
    w: 370,
    h: 270,
    ix: 1450,
    iy: 2130,
  },
  {
    zone: "arena",
    texture: "bld-arena",
    cx: 2400,
    baseY: 2050,
    w: 340,
    h: 270,
    ix: 2400,
    iy: 2130,
  },
  {
    zone: "soccer",
    texture: "bld-soccer",
    cx: 3350,
    baseY: 2050,
    w: 420,
    h: 275,
    ix: 3350,
    iy: 2130,
  },
  {
    zone: "idiom",
    texture: "bld-idiom",
    cx: 4180,
    baseY: 2050,
    w: 370,
    h: 260,
    ix: 4180,
    iy: 2130,
  },
  {
    zone: "pets",
    texture: "bld-pets",
    cx: 550,
    baseY: 2950,
    w: 250,
    h: 250,
    ix: 550,
    iy: 3030,
  },
  {
    zone: "math",
    texture: "bld-math",
    cx: 3350,
    baseY: 2950,
    w: 250,
    h: 250,
    ix: 3350,
    iy: 3030,
  },
  {
    zone: "shop",
    texture: "bld-shop",
    cx: 4200,
    baseY: 2950,
    w: 275,
    h: 260,
    ix: 4200,
    iy: 3030,
  },
];

/** Bảng nhiệm vụ là vật nhỏ đứng riêng ở sân. */
export const BOARD = {
  zone: "missions",
  texture: "prop-board",
  x: 1450,
  baseY: 2900,
  w: 120,
  h: 130,
  ix: 1450,
  iy: 2970,
};

export const TREES = [
  // Hàng cây trên cùng
  { x: 250, y: 480, v: 0 },
  { x: 1100, y: 420, v: 1 },
  { x: 1600, y: 390, v: 0 },
  { x: 2050, y: 420, v: 1 },
  { x: 2750, y: 420, v: 0 },
  { x: 3200, y: 390, v: 1 },
  { x: 3700, y: 420, v: 0 },
  { x: 4550, y: 480, v: 1 },
  // Hàng cây biên trái & phải
  { x: 180, y: 1250, v: 1 },
  { x: 180, y: 1900, v: 0 },
  { x: 180, y: 2550, v: 1 },
  { x: 4620, y: 1250, v: 0 },
  { x: 4620, y: 1900, v: 1 },
  { x: 4620, y: 2550, v: 0 },
  // Cây trong các khoảng sân rộng giữa các tòa nhà
  { x: 1100, y: 1300, v: 0 },
  { x: 1950, y: 1300, v: 1 },
  { x: 2850, y: 1300, v: 0 },
  { x: 3700, y: 1300, v: 1 },
  { x: 1100, y: 1750, v: 1 },
  { x: 1950, y: 1750, v: 0 },
  { x: 2850, y: 1750, v: 1 },
  { x: 3700, y: 1750, v: 0 },
  // Sân trước và gần cổng
  { x: 1050, y: 2650, v: 0 },
  { x: 1900, y: 2650, v: 1 },
  { x: 2900, y: 2650, v: 0 },
  { x: 3750, y: 2650, v: 1 },
  { x: 1950, y: 3150, v: 1 },
  { x: 2850, y: 3150, v: 0 },
];

export const BENCHES = [
  { x: 1100, y: 1000 },
  { x: 3700, y: 1000 },
  { x: 2000, y: 1050 },
  { x: 2800, y: 1050 },
  { x: 1450, y: 1750 },
  { x: 3350, y: 1750 },
  { x: 1900, y: 2200 },
  { x: 2900, y: 2200 },
  { x: 1000, y: 2980 },
  { x: 3800, y: 2980 },
];

export const FLOWER_BEDS = [
  { x: 1000, y: 1000, w: 160 },
  { x: 3800, y: 1000, w: 160 },
  { x: 2400, y: 1050, w: 185 },
  { x: 1450, y: 1850, w: 160 },
  { x: 3350, y: 1850, w: 160 },
  { x: 2400, y: 2400, w: 185 },
  { x: 1900, y: 2980, w: 130 },
  { x: 2900, y: 2980, w: 130 },
];

export const FLAGPOLE = { x: 1450, y: 1500 };
export const POND = { x: 3350, y: 1500, rx: 235, ry: 145 };

/** Ổ khóa và nhãn của từng khu vực nằm cao hơn cửa một đoạn. */
export const GATE = { x: 2400, y: 3450 };

function buildingRect(b) {
  return {
    x: b.cx - b.w / 2 + 6,
    y: b.baseY - b.h + 40,
    w: b.w - 12,
    h: b.h - 40,
  };
}

export function buildObstacles() {
  const rects = BUILDINGS.map(buildingRect);
  rects.push({ x: BOARD.x - 36, y: BOARD.baseY - 28, w: 72, h: 28 });
  for (const t of TREES) rects.push({ x: t.x - 18, y: t.y - 23, w: 36, h: 23 });
  for (const b of BENCHES)
    rects.push({ x: b.x - 49, y: b.y - 20, w: 98, h: 23 });
  for (const f of FLOWER_BEDS)
    rects.push({ x: f.x - f.w / 2, y: f.y - 30, w: f.w, h: 30 });
  rects.push({ x: FLAGPOLE.x - 52, y: FLAGPOLE.y - 38, w: 104, h: 44 });
  // Hai trụ cổng trường (cổng rộng 430, trụ 80x52)
  rects.push({ x: GATE.x - 209, y: GATE.y - 78, w: 80, h: 52 });
  rects.push({ x: GATE.x + 129, y: GATE.y - 78, w: 80, h: 52 });
  // Hồ nước
  rects.push({ x: POND.x - POND.rx, y: POND.y - 20, w: POND.rx * 2, h: 40 });
  rects.push({
    x: POND.x - POND.rx * 0.72,
    y: POND.y - POND.ry,
    w: POND.rx * 1.44,
    h: POND.ry - 18,
  });
  rects.push({
    x: POND.x - POND.rx * 0.72,
    y: POND.y + 20,
    w: POND.rx * 1.44,
    h: POND.ry - 18,
  });
  return rects;
}

export const OBSTACLES = buildObstacles();

/** Điểm tương tác của từng khu vực, khóa theo id trong zones.json. */
export function getZonePlaces() {
  const places = {};
  for (const b of BUILDINGS) places[b.zone] = { x: b.ix, y: b.iy };
  places[BOARD.zone] = { x: BOARD.ix, y: BOARD.iy };
  return places;
}
