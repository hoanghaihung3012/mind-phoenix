/** Bố cục bản đồ Trường Tiểu học Phú Thọ (tọa độ thế giới mở rộng 3200 x 2300, giãn cách các tòa nhà). */

export const WORLD = { width: 3200, height: 2300 };
/** Vùng nhân vật được phép đi lại (để lại dải trang trí phía trên và cổng trường phía dưới). */
export const BOUNDS = { x: 40, y: 160, w: 3120, h: 1980 };
/** Kích thước nửa chân của nhân vật dùng để tính va chạm. */
export const PLAYER_HALF = { w: 12, h: 7 };
export const SPAWN = { x: 1600, y: 2020 };
export const INTERACT_RADIUS = 110;

/**
 * Các công trình. (cx, baseY) là điểm giữa cạnh dưới; (ix, iy) là điểm tương tác ngay trước cửa.
 * `texture` khớp với texture vẽ trong src/art/mapArt.js.
 */
export const BUILDINGS = [
  {
    zone: "library",
    texture: "bld-library",
    cx: 460,
    baseY: 680,
    w: 320,
    h: 240,
    ix: 460,
    iy: 750,
  },
  {
    zone: "grand",
    texture: "bld-grand",
    cx: 1600,
    baseY: 680,
    w: 420,
    h: 290,
    ix: 1600,
    iy: 750,
  },
  {
    zone: "literature",
    texture: "bld-literature",
    cx: 2740,
    baseY: 680,
    w: 320,
    h: 240,
    ix: 2740,
    iy: 750,
  },
  {
    zone: "spelling",
    texture: "bld-spelling",
    cx: 440,
    baseY: 1440,
    w: 280,
    h: 200,
    ix: 440,
    iy: 1510,
  },
  {
    zone: "arena",
    texture: "bld-arena",
    cx: 1600,
    baseY: 1440,
    w: 260,
    h: 210,
    ix: 1600,
    iy: 1510,
  },
  {
    zone: "idiom",
    texture: "bld-idiom",
    cx: 2760,
    baseY: 1440,
    w: 280,
    h: 200,
    ix: 2760,
    iy: 1510,
  },
  {
    zone: "pets",
    texture: "bld-pets",
    cx: 400,
    baseY: 1980,
    w: 190,
    h: 190,
    ix: 400,
    iy: 2040,
  },
  {
    zone: "math",
    texture: "bld-math",
    cx: 2220,
    baseY: 1980,
    w: 190,
    h: 190,
    ix: 2220,
    iy: 2040,
  },
  {
    zone: "shop",
    texture: "bld-shop",
    cx: 2800,
    baseY: 1980,
    w: 210,
    h: 200,
    ix: 2800,
    iy: 2040,
  },
];

/** Bảng nhiệm vụ là vật nhỏ đứng riêng ở sân. */
export const BOARD = {
  zone: "missions",
  texture: "prop-board",
  x: 980,
  baseY: 1930,
  w: 90,
  h: 100,
  ix: 980,
  iy: 1990,
};

export const TREES = [
  // Hàng cây trên cùng
  { x: 180, y: 400, v: 0 },
  { x: 740, y: 350, v: 1 },
  { x: 1080, y: 320, v: 0 },
  { x: 1360, y: 350, v: 1 },
  { x: 1840, y: 350, v: 0 },
  { x: 2120, y: 320, v: 1 },
  { x: 2460, y: 350, v: 0 },
  { x: 3020, y: 400, v: 1 },
  // Hàng cây biên trái & phải
  { x: 140, y: 880, v: 1 },
  { x: 140, y: 1320, v: 0 },
  { x: 140, y: 1750, v: 1 },
  { x: 3060, y: 880, v: 0 },
  { x: 3060, y: 1320, v: 1 },
  { x: 3060, y: 1750, v: 0 },
  // Cây trong các khoảng sân rộng giữa các tòa nhà
  { x: 760, y: 920, v: 0 },
  { x: 1320, y: 920, v: 1 },
  { x: 1880, y: 920, v: 0 },
  { x: 2440, y: 920, v: 1 },
  { x: 740, y: 1260, v: 1 },
  { x: 1300, y: 1260, v: 0 },
  { x: 1900, y: 1260, v: 1 },
  { x: 2460, y: 1260, v: 0 },
  // Sân trước và gần cổng
  { x: 700, y: 1800, v: 0 },
  { x: 1260, y: 1800, v: 1 },
  { x: 1940, y: 1800, v: 0 },
  { x: 2520, y: 1800, v: 1 },
  { x: 1320, y: 2120, v: 1 },
  { x: 1880, y: 2120, v: 0 },
];

export const BENCHES = [
  { x: 740, y: 790 },
  { x: 2460, y: 790 },
  { x: 1340, y: 820 },
  { x: 1860, y: 820 },
  { x: 1020, y: 1280 },
  { x: 2180, y: 1280 },
  { x: 1280, y: 1550 },
  { x: 1920, y: 1550 },
  { x: 680, y: 2010 },
  { x: 2520, y: 2010 },
];

export const FLOWER_BEDS = [
  { x: 680, y: 790, w: 120 },
  { x: 2520, y: 790, w: 120 },
  { x: 1600, y: 830, w: 140 },
  { x: 1020, y: 1350, w: 100 },
  { x: 2180, y: 1350, w: 100 },
  { x: 1600, y: 1680, w: 120 },
  { x: 1280, y: 2010, w: 90 },
  { x: 1920, y: 2010, w: 90 },
];

export const FLAGPOLE = { x: 1020, y: 1100 };
export const POND = { x: 2180, y: 1100, rx: 130, ry: 80 };

/** Ổ khóa và nhãn của từng khu vực nằm cao hơn cửa một đoạn. */
export const GATE = { x: 1600, y: 2300 };

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
  rects.push({ x: BOARD.x - 28, y: BOARD.baseY - 22, w: 56, h: 22 });
  for (const t of TREES) rects.push({ x: t.x - 14, y: t.y - 18, w: 28, h: 18 });
  for (const b of BENCHES)
    rects.push({ x: b.x - 38, y: b.y - 16, w: 76, h: 18 });
  for (const f of FLOWER_BEDS)
    rects.push({ x: f.x - f.w / 2, y: f.y - 24, w: f.w, h: 24 });
  rects.push({ x: FLAGPOLE.x - 40, y: FLAGPOLE.y - 30, w: 80, h: 34 });
  // Hai trụ cổng trường
  rects.push({ x: GATE.x - 161, y: GATE.y - 60, w: 62, h: 40 });
  rects.push({ x: GATE.x + 99, y: GATE.y - 60, w: 62, h: 40 });
  // Hồ nước
  rects.push({ x: POND.x - POND.rx, y: POND.y - 16, w: POND.rx * 2, h: 32 });
  rects.push({
    x: POND.x - POND.rx * 0.72,
    y: POND.y - POND.ry,
    w: POND.rx * 1.44,
    h: POND.ry - 14,
  });
  rects.push({
    x: POND.x - POND.rx * 0.72,
    y: POND.y + 16,
    w: POND.rx * 1.44,
    h: POND.ry - 14,
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
