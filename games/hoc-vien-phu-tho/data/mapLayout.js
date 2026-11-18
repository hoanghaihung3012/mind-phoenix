/** Bố cục bản đồ Trường Tiểu học Phú Thọ (tọa độ thế giới mở rộng 2240 x 1624, rộng hơn 40%). */

export const WORLD = { width: 2240, height: 1624 };
/** Vùng nhân vật được phép đi lại (để lại dải trang trí phía trên và cổng trường phía dưới). */
export const BOUNDS = { x: 40, y: 160, w: 2160, h: 1320 };
/** Kích thước nửa chân của nhân vật dùng để tính va chạm. */
export const PLAYER_HALF = { w: 12, h: 7 };
export const SPAWN = { x: 1120, y: 1400 };
export const INTERACT_RADIUS = 95;

/**
 * Các công trình. (cx, baseY) là điểm giữa cạnh dưới; (ix, iy) là điểm tương tác ngay trước cửa.
 * `texture` khớp với texture vẽ trong src/art/mapArt.js.
 */
export const BUILDINGS = [
  {
    zone: "library",
    texture: "bld-library",
    cx: 378,
    baseY: 574,
    w: 320,
    h: 240,
    ix: 378,
    iy: 630,
  },
  {
    zone: "grand",
    texture: "bld-grand",
    cx: 1120,
    baseY: 574,
    w: 420,
    h: 290,
    ix: 1120,
    iy: 630,
  },
  {
    zone: "literature",
    texture: "bld-literature",
    cx: 1862,
    baseY: 574,
    w: 320,
    h: 240,
    ix: 1862,
    iy: 630,
  },
  {
    zone: "spelling",
    texture: "bld-spelling",
    cx: 350,
    baseY: 1064,
    w: 280,
    h: 200,
    ix: 350,
    iy: 1120,
  },
  {
    zone: "arena",
    texture: "bld-arena",
    cx: 1120,
    baseY: 1064,
    w: 260,
    h: 210,
    ix: 1120,
    iy: 1120,
  },
  {
    zone: "idiom",
    texture: "bld-idiom",
    cx: 1890,
    baseY: 1064,
    w: 280,
    h: 200,
    ix: 1890,
    iy: 1120,
  },
  {
    zone: "pets",
    texture: "bld-pets",
    cx: 322,
    baseY: 1386,
    w: 190,
    h: 190,
    ix: 322,
    iy: 1445,
  },
  {
    zone: "math",
    texture: "bld-math",
    cx: 1526,
    baseY: 1386,
    w: 190,
    h: 190,
    ix: 1526,
    iy: 1445,
  },
  {
    zone: "shop",
    texture: "bld-shop",
    cx: 1932,
    baseY: 1386,
    w: 210,
    h: 200,
    ix: 1932,
    iy: 1445,
  },
];

/** Bảng nhiệm vụ là vật nhỏ đứng riêng ở sân. */
export const BOARD = {
  zone: "missions",
  texture: "prop-board",
  x: 728,
  baseY: 1344,
  w: 90,
  h: 100,
  ix: 728,
  iy: 1400,
};

export const TREES = [
  { x: 700, y: 504, v: 0 },
  { x: 1540, y: 504, v: 1 },
  { x: 140, y: 728, v: 1 },
  { x: 2100, y: 728, v: 0 },
  { x: 630, y: 924, v: 0 },
  { x: 1652, y: 966, v: 1 },
  { x: 168, y: 1260, v: 0 },
  { x: 616, y: 1414, v: 1 },
  { x: 1729, y: 1445, v: 0 },
  { x: 896, y: 1456, v: 1 },
  { x: 1309, y: 1456, v: 0 },
  { x: 84, y: 420, v: 1 },
  { x: 2156, y: 420, v: 0 },
  { x: 784, y: 266, v: 0 },
  { x: 1456, y: 266, v: 1 },
  { x: 1020, y: 350, v: 0 },
  { x: 1220, y: 350, v: 1 },
  { x: 420, y: 840, v: 1 },
  { x: 1820, y: 840, v: 0 },
  { x: 980, y: 880, v: 0 },
  { x: 1260, y: 880, v: 1 },
];

export const BENCHES = [
  { x: 798, y: 728 },
  { x: 1442, y: 728 },
  { x: 896, y: 1246 },
  { x: 1302, y: 1246 },
  { x: 500, y: 1100 },
  { x: 1740, y: 1100 },
  { x: 1380, y: 920 },
];

export const FLOWER_BEDS = [
  { x: 504, y: 728, w: 100 },
  { x: 1736, y: 728, w: 100 },
  { x: 1120, y: 742, w: 120 },
  { x: 1120, y: 1260, w: 90 },
  { x: 730, y: 1120, w: 90 },
  { x: 1510, y: 1120, w: 90 },
];

export const FLAGPOLE = { x: 749, y: 910 };
export const POND = { x: 1491, y: 896, rx: 101, ry: 64 };

/** Ổ khóa và nhãn của từng khu vực nằm cao hơn cửa một đoạn. */
export const GATE = { x: 1120, y: 1624 };

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
  rects.push({ x: GATE.x - 161, y: 1480, w: 62, h: 40 });
  rects.push({ x: GATE.x + 99, y: 1480, w: 62, h: 40 });
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
