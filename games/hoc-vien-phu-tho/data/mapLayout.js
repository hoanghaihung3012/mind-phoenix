/** Bố cục bản đồ Trường Tiểu học Phú Thọ (tọa độ thế giới 1600 x 1160). */

export const WORLD = { width: 1600, height: 1160 };
/** Vùng nhân vật được phép đi lại (để lại dải trang trí phía trên và cổng trường phía dưới). */
export const BOUNDS = { x: 30, y: 120, w: 1540, h: 940 };
/** Kích thước nửa chân của nhân vật dùng để tính va chạm. */
export const PLAYER_HALF = { w: 12, h: 7 };
export const SPAWN = { x: 800, y: 1000 };
export const INTERACT_RADIUS = 78;

/**
 * Các công trình. (cx, baseY) là điểm giữa cạnh dưới; (ix, iy) là điểm tương tác ngay trước cửa.
 * `texture` khớp với texture vẽ trong src/art/mapArt.js.
 */
export const BUILDINGS = [
  {
    zone: "library",
    texture: "bld-library",
    cx: 270,
    baseY: 410,
    w: 320,
    h: 240,
    ix: 270,
    iy: 450,
  },
  {
    zone: "grand",
    texture: "bld-grand",
    cx: 800,
    baseY: 410,
    w: 420,
    h: 290,
    ix: 800,
    iy: 450,
  },
  {
    zone: "literature",
    texture: "bld-literature",
    cx: 1330,
    baseY: 410,
    w: 320,
    h: 240,
    ix: 1330,
    iy: 450,
  },
  {
    zone: "spelling",
    texture: "bld-spelling",
    cx: 250,
    baseY: 760,
    w: 280,
    h: 200,
    ix: 250,
    iy: 800,
  },
  {
    zone: "arena",
    texture: "bld-arena",
    cx: 800,
    baseY: 760,
    w: 260,
    h: 210,
    ix: 800,
    iy: 800,
  },
  {
    zone: "idiom",
    texture: "bld-idiom",
    cx: 1350,
    baseY: 760,
    w: 280,
    h: 200,
    ix: 1350,
    iy: 800,
  },
  {
    zone: "pets",
    texture: "bld-pets",
    cx: 230,
    baseY: 990,
    w: 190,
    h: 190,
    ix: 230,
    iy: 1032,
  },
  {
    zone: "math",
    texture: "bld-math",
    cx: 1090,
    baseY: 990,
    w: 190,
    h: 190,
    ix: 1090,
    iy: 1032,
  },
  {
    zone: "shop",
    texture: "bld-shop",
    cx: 1380,
    baseY: 990,
    w: 210,
    h: 200,
    ix: 1380,
    iy: 1032,
  },
];

/** Bảng nhiệm vụ là vật nhỏ đứng riêng ở sân. */
export const BOARD = {
  zone: "missions",
  texture: "prop-board",
  x: 520,
  baseY: 960,
  w: 90,
  h: 100,
  ix: 520,
  iy: 1000,
};

export const TREES = [
  { x: 500, y: 360, v: 0 },
  { x: 1100, y: 360, v: 1 },
  { x: 100, y: 520, v: 1 },
  { x: 1500, y: 520, v: 0 },
  { x: 450, y: 660, v: 0 },
  { x: 1180, y: 690, v: 1 },
  { x: 120, y: 900, v: 0 },
  { x: 440, y: 1010, v: 1 },
  { x: 1235, y: 1032, v: 0 },
  { x: 640, y: 1040, v: 1 },
  { x: 935, y: 1040, v: 0 },
  { x: 60, y: 300, v: 1 },
  { x: 1540, y: 300, v: 0 },
  { x: 560, y: 190, v: 0 },
  { x: 1040, y: 190, v: 1 },
];

export const BENCHES = [
  { x: 570, y: 520 },
  { x: 1030, y: 520 },
  { x: 640, y: 890 },
  { x: 930, y: 890 },
];

export const FLOWER_BEDS = [
  { x: 360, y: 520, w: 100 },
  { x: 1240, y: 520, w: 100 },
  { x: 800, y: 530, w: 120 },
  { x: 800, y: 900, w: 90 },
];

export const FLAGPOLE = { x: 535, y: 650 };
export const POND = { x: 1065, y: 640, rx: 72, ry: 46 };

/** Ổ khóa và nhãn của từng khu vực nằm cao hơn cửa một đoạn. */
export const GATE = { x: 800, y: 1160 };

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
  rects.push({ x: GATE.x - 161, y: 1030, w: 62, h: 40 });
  rects.push({ x: GATE.x + 99, y: 1030, w: 62, h: 40 });
  // Hồ nước: xấp xỉ hình elip bằng ba hình chữ nhật chồng nhau.
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
