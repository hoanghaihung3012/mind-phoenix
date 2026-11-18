import {
  INK,
  circ,
  ell,
  line,
  makeTexture,
  poly,
  rr,
  shade,
  starPoints,
} from "./draw.js";
import { drawIconShape } from "./icons.js";
import { BUILDINGS, FLOWER_BEDS, POND, WORLD, FLAGPOLE, GATE } from "../data/mapLayout.js";
import { mulberry32 } from "../utils/randomUtils.js";

/** Vị trí tấm bảng tên (tâm và kích thước) bên trong texture của từng công trình. */
export const PLATE_INFO = {};

const STONE = 0xe9dfc8;
const STONE_EDGE = 0xcdbf9b;

function windowShape(g, x, y, w, h) {
  rr(g, x, y, w, h, 5, 0x9fdcff, INK, 3);
  line(g, x + w / 2, y, x + w / 2, y + h, INK, 2.5);
  line(g, x, y + h / 2, x + w, y + h / 2, INK, 2.5);
  rr(g, x + 3, y + 3, 7, 7, 2, 0xffffff, null, 0, 0.6);
}

function door(g, cx, bottom, w, h, color) {
  rr(g, cx - w / 2 - 10, bottom - 8, w + 20, 10, 3, 0xcfd6df, INK, 3);
  rr(g, cx - w / 2, bottom - 8 - h, w, h, 14, color, INK, 4);
  line(g, cx, bottom - 8 - h + 10, cx, bottom - 8, shade(color, -0.35), 3);
  circ(g, cx - 8, bottom - 8 - h * 0.45, 3, 0xffd23f, INK, 1.5);
  circ(g, cx + 8, bottom - 8 - h * 0.45, 3, 0xffd23f, INK, 1.5);
}

function plate(key, w, cx, y, pw, ph) {
  PLATE_INFO[key] = { x: cx, y: y + ph / 2, w: pw, h: ph };
  return { x: cx - pw / 2, y, w: pw, h: ph };
}

/** Công trình phổ thông: thân nhà, mái, bảng tên, cửa sổ, cửa chính và biểu tượng trên mái. */
function genericBuilding(scene, key, w, h, o) {
  makeTexture(scene, key, w, h, (g) => {
    const roofH = o.roofH;
    const bx = 14;
    const bw = w - 28;
    ell(g, w / 2, h - 6, w * 0.98, 24, 0x000000, null, 0, 0.18);
    rr(g, bx, roofH - 6, bw, h - roofH, 6, o.wall, INK, 4);
    rr(g, bx + 2, h - 24, bw - 4, 20, 4, o.base, null, 0);
    // Cửa sổ hai bên
    const wy = roofH + 50;
    const wh = Math.max(24, Math.min(54, h - wy - 34));
    const doorH = Math.max(60, Math.min(88, h - roofH - 58));
    const cols = o.windows ?? 2;
    const ww = w >= 280 ? 40 : 30;
    for (let i = 0; i < cols; i++) {
      const step = i * 52;
      windowShape(g, bx + 16 + step, wy, ww, wh);
      windowShape(g, w - bx - 16 - ww - step, wy, ww, wh);
    }
    door(g, w / 2, h - 6, 56, doorH, o.door);
    // Mái
    poly(g, [0, roofH, 34, 8, w - 34, 8, w, roofH], o.roof, INK, 4);
    poly(
      g,
      [14, roofH - 4, 40, 14, w - 40, 14, w - 14, roofH - 4],
      shade(o.roof, 0.18),
      null,
      0,
    );
    for (const t of [0.35, 0.65]) {
      const yy = 8 + (roofH - 8) * t;
      const inset = 34 * (1 - t);
      line(g, inset + 4, yy, w - inset - 4, yy, shade(o.roof, -0.3), 3);
    }
    // Bảng tên
    const p = plate(key, w, w / 2, roofH + 4, bw * 0.86, 36);
    rr(g, p.x, p.y, p.w, p.h, 10, 0xfff9e6, INK, 3);
    // Biểu tượng trên mái
    const iconY = 8 + (roofH - 8) * 0.48;
    circ(g, w / 2, iconY, 24, 0xfff9e6, INK, 3);
    drawIconShape(g, o.deco, w / 2, iconY, 32);
    o.extra?.(g, w, h, doorH);
  });
}

function grandHall(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    ell(g, w / 2, h - 6, w * 0.98, 26, 0x000000, null, 0, 0.18);
    rr(g, 14, 120, w - 28, h - 124, 6, 0xfff1c9, INK, 4);
    rr(g, 16, h - 26, w - 32, 22, 4, 0xcfb989, null, 0);
    // Tháp giữa
    rr(g, 148, 28, 124, 100, 6, 0xffe6a3, INK, 4);
    poly(g, [134, 34, 286, 34, 210, 2], 0xc0392b, INK, 4);
    circ(g, 210, 66, 22, 0xffffff, INK, 4);
    line(g, 210, 66, 210, 50, INK, 4);
    line(g, 210, 66, 222, 72, INK, 4);
    // Cánh nhà và mái
    poly(g, [0, 126, 30, 96, w - 30, 96, w, 126], 0xc0392b, INK, 4);
    poly(g, [14, 122, 38, 102, w - 38, 102, w - 14, 122], 0xd9564a, null, 0);
    // Cửa sổ
    for (const row of [150, 208]) {
      for (const x of [34, 88]) {
        windowShape(g, x, row, 40, 44);
        windowShape(g, w - x - 40, row, 40, 44);
      }
    }
    // Cửa chính và bậc thềm
    rr(g, 150, h - 14, 120, 12, 3, 0xcfd6df, INK, 3);
    rr(g, 160, h - 24, 100, 12, 3, 0xdbe1e8, INK, 3);
    rr(g, 170, h - 124, 80, 100, 18, 0x8a5a2b, INK, 4);
    line(g, 210, h - 118, 210, h - 28, 0x5b3a1b, 3);
    circ(g, 200, h - 76, 3.5, 0xffd23f, INK, 1.5);
    circ(g, 220, h - 76, 3.5, 0xffd23f, INK, 1.5);
    // Bảng tên trường
    const p = plate(key, w, w / 2, 104, 344, 38);
    rr(g, p.x, p.y, p.w, p.h, 10, 0xfff9e6, INK, 4);
  });
}

function arenaTent(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    const mid = w / 2;
    ell(g, mid, h - 6, w * 0.98, 24, 0x000000, null, 0, 0.18);
    rr(g, 14, 96, w - 28, h - 100, 8, 0xfff1c9, INK, 4);
    // Sọc dọc của thân lều
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) continue;
      g.fillStyle(0xf6c5bd, 1);
      g.fillRect(16 + i * ((w - 32) / 8), 98, (w - 32) / 8, h - 124);
    }
    rr(g, 14, 96, w - 28, h - 100, 8, null, INK, 4);
    // Mái lều
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const x1 = 2 + (i * (w - 4)) / steps;
      const x2 = 2 + ((i + 1) * (w - 4)) / steps;
      poly(
        g,
        [mid, 24, x1, 104, x2, 104],
        i % 2 === 0 ? 0xe4572e : 0xffffff,
        INK,
        3,
      );
    }
    line(g, mid, 24, mid, 4, INK, 4);
    poly(g, [mid, 4, mid + 24, 10, mid, 16], 0xffc83d, INK, 3);
    circ(g, mid, 70, 16, 0xfff9e6, INK, 3);
    drawIconShape(g, "flame", mid, 70, 22);
    door(g, mid, h - 6, 56, 80, 0x7b3f1d);
    const p = plate(key, w, mid, 110, w - 60, 32);
    rr(g, p.x, p.y, p.w, p.h, 10, 0xfff9e6, INK, 3);
  });
}

function idiomStage(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    ell(g, w / 2, h - 6, w * 0.98, 24, 0x000000, null, 0, 0.18);
    rr(g, 10, h - 46, w - 20, 40, 6, 0xd9c6a0, INK, 4);
    rr(g, 24, h - 62, w - 48, 20, 6, 0xe8d8b4, INK, 4);
    rr(g, 46, 60, w - 92, h - 112, 8, 0xffe0a3, INK, 4);
    // Rèm
    poly(g, [46, 60, 82, 60, 46, h - 52], 0xc0392b, INK, 3);
    poly(g, [w - 46, 60, w - 82, 60, w - 46, h - 52], 0xc0392b, INK, 3);
    // Cột
    for (const x of [22, w - 44]) {
      rr(g, x, 50, 22, h - 98, 5, 0xf3efe6, INK, 3);
      rr(g, x - 4, 44, 30, 12, 4, 0xe0d8c6, INK, 3);
    }
    // Mái che
    poly(g, [8, 56, w - 8, 56, w - 36, 12, 36, 12], 0x8e5bd0, INK, 4);
    poly(g, [22, 52, w - 22, 52, w - 44, 18, 44, 18], 0xa77be0, null, 0);
    // Các ô chữ trang trí
    const tiles = [0xff8a65, 0xffd54f, 0x81c784, 0x64b5f6, 0xba68c8];
    for (let i = 0; i < 5; i++)
      rr(g, 94 + i * 20, h - 108, 17, 24, 3, tiles[i], INK, 2);
    const p = plate(key, w, w / 2, 66, w - 150, 30);
    rr(g, p.x, p.y, p.w, p.h, 10, 0xfff9e6, INK, 3);
    circ(g, w / 2, 30, 17, 0xfff9e6, INK, 3);
    drawIconShape(g, "scroll", w / 2, 30, 24);
  });
}

function shopFront(scene, key, w, h, o) {
  genericBuilding(scene, key, w, h, {
    ...o,
    extra(g, _w, _h, doorH) {
      const doorX = w / 2;
      const top = h - 6 - 8 - doorH;
      for (let i = 0; i < 6; i++) {
        poly(
          g,
          [
            doorX - 46 + i * 15.3,
            top - 2,
            doorX - 46 + (i + 1) * 15.3,
            top - 2,
            doorX - 52 + (i + 1) * 17.3,
            top + 18,
            doorX - 52 + i * 17.3,
            top + 18,
          ],
          i % 2 === 0 ? 0xe4572e : 0xffffff,
          INK,
          2.5,
        );
      }
    },
  });
}

function tree(scene, key, variant) {
  makeTexture(scene, key, 110, 140, (g) => {
    ell(g, 55, 134, 52, 12, 0x000000, null, 0, 0.2);
    rr(g, 46, 78, 18, 58, 5, 0x8a5a2b, INK, 3);
    const green = variant === 0 ? 0x3fa34d : 0x58b947;
    circ(g, 34, 62, 28, green, INK, 4);
    circ(g, 76, 62, 28, green, INK, 4);
    circ(g, 55, 36, 32, green, INK, 4);
    circ(g, 55, 66, 26, green, null, 0);
    circ(g, 45, 28, 12, shade(green, 0.25), null, 0);
    circ(g, 28, 54, 8, shade(green, 0.25), null, 0);
    if (variant === 1) {
      for (const [x, y] of [
        [40, 50],
        [70, 44],
        [58, 70],
        [32, 72],
        [78, 68],
      ])
        circ(g, x, y, 5, 0xff5a5f, INK, 1.5);
    }
  });
}

function bench(scene) {
  makeTexture(scene, "prop-bench", 90, 46, (g) => {
    ell(g, 45, 42, 84, 8, 0x000000, null, 0, 0.2);
    rr(g, 8, 24, 12, 18, 3, 0x8f9aa8, INK, 3);
    rr(g, 70, 24, 12, 18, 3, 0x8f9aa8, INK, 3);
    rr(g, 2, 16, 86, 12, 5, 0xb9c2cd, INK, 3);
    rr(g, 6, 2, 78, 11, 5, 0xc7cfd8, INK, 3);
  });
}

function flowerBed(scene, w) {
  makeTexture(scene, `prop-bed-${w}`, w, 44, (g) => {
    rr(g, 0, 18, w, 26, 8, 0xb9c2cd, INK, 3);
    rr(g, 4, 22, w - 8, 16, 6, 0x6b4a2b, null, 0);
    const colors = [0xff6b81, 0xffd23f, 0xffffff, 0xff9f43, 0xb388ff];
    const n = Math.floor(w / 18);
    for (let i = 0; i < n; i++) {
      const x = 12 + i * ((w - 24) / Math.max(1, n - 1));
      line(g, x, 22, x, 10 + (i % 2) * 4, 0x2e8b57, 3);
      circ(g, x, 8 + (i % 2) * 4, 7, colors[i % colors.length], INK, 2);
      circ(g, x, 8 + (i % 2) * 4, 2.5, 0xffe066, null, 0);
    }
  });
}

function flagpole(scene) {
  makeTexture(scene, "prop-flag", 130, 240, (g) => {
    ell(g, 56, 226, 98, 24, 0x000000, null, 0, 0.2);
    ell(g, 56, 218, 92, 30, 0xcfd6df, INK, 4);
    ell(g, 56, 214, 70, 20, 0x9be07a, INK, 3);
    rr(g, 52, 24, 8, 194, 3, 0xdfe5ec, INK, 3);
    circ(g, 56, 20, 7, 0xffc83d, 0xb86e00, 3);
    poly(g, [60, 30, 122, 30, 122, 82, 60, 82], 0xda251d, INK, 3);
    poly(g, starPoints(91, 56, 16, 6.5), 0xffe34d, null, 0);
  });
}

function board(scene) {
  makeTexture(scene, "prop-board", 90, 100, (g) => {
    ell(g, 45, 94, 70, 10, 0x000000, null, 0, 0.2);
    rr(g, 14, 50, 9, 48, 2, 0x8a5a2b, INK, 3);
    rr(g, 67, 50, 9, 48, 2, 0x8a5a2b, INK, 3);
    rr(g, 2, 4, 86, 62, 8, 0xc99a5b, INK, 4);
    rr(g, 8, 10, 74, 50, 5, 0xfff4d6, INK, 2);
    const notes = [
      [14, 16, 0xffd54f],
      [44, 16, 0x81d4fa],
      [28, 36, 0xf8bbd0],
    ];
    for (const [x, y, c] of notes) {
      rr(g, x, y, 28, 22, 2, c, INK, 2);
      circ(g, x + 14, y + 2, 2.5, 0xe4572e, INK, 1);
    }
    drawIconShape(g, "check", 66, 48, 14);
  });
}

function gate(scene) {
  makeTexture(scene, "prop-gate", 330, 140, (g) => {
    ell(g, 165, 134, 320, 14, 0x000000, null, 0, 0.18);
    for (const x of [4, 264]) {
      rr(g, x, 20, 62, 118, 6, 0xdfe5ec, INK, 4);
      rr(g, x - 4, 12, 70, 16, 5, 0xc3ccd6, INK, 3);
      rr(g, x + 8, 40, 46, 16, 3, 0xcdd5df, INK, 2);
    }
    // Cổng sắt mở
    for (let i = 0; i < 4; i++) {
      line(g, 76 + i * 9, 70, 76 + i * 9, 132, 0x4a5568, 3);
      line(g, 254 - i * 9, 70, 254 - i * 9, 132, 0x4a5568, 3);
    }
    // Biển hiệu cổng
    rr(g, 20, 0, 290, 46, 12, 0x1e6fd9, INK, 4);
    rr(g, 28, 6, 274, 34, 8, 0xfff9e6, null, 0);
    PLATE_INFO[`prop-gate`] = { x: 165, y: 23, w: 270, h: 34 };
  });
}

function pondRim(g, cx, cy, rx, ry) {
  ell(g, cx, cy, rx * 2 + 16, ry * 2 + 14, 0xcfd6df, INK, 4);
  ell(g, cx, cy, rx * 2, ry * 2, 0x6ec6ff, INK, 3);
  ell(g, cx - 12, cy - 8, rx * 1.2, ry * 0.7, 0x9fdcff, null, 0, 0.8);
  for (const [dx, dy, r] of [
    [28, 12, 9],
    [-34, 6, 8],
    [6, -18, 7],
  ]) {
    circ(g, cx + dx, cy + dy, r, 0x58b947, INK, 2);
  }
  circ(g, cx + 28, cy + 10, 3, 0xff8fab, null, 0);
}

function pathRects() {
  const rects = [
    { x: 168, y: 610, w: 1904, h: 62 },
    { x: 168, y: 1100, w: 1904, h: 62 },
    { x: 168, y: 1417, w: 1904, h: 70 },
    { x: 1078, y: 610, w: 84, h: 1014 },
    { x: 333, y: 610, w: 62, h: 876 },
    { x: 1834, y: 610, w: 62, h: 876 },
    { x: 616, y: 658, w: 1008, h: 434 },
  ];
  return rects;
}

function worldBackground(scene) {
  const { width: W, height: H } = WORLD;
  makeTexture(scene, "map-bg", W, H, (g) => {
    g.fillStyle(0x8fd36e, 1);
    g.fillRect(0, 0, W, H);
    // Sọc cỏ nhạt
    g.fillStyle(0x9adb7a, 1);
    for (let y = 0; y < H; y += 80) g.fillRect(0, y, W, 40);
    // Dải bụi cây phía trên
    g.fillStyle(0x2f8f4e, 1);
    g.fillRect(0, 0, W, 90);
    const rng = mulberry32(77);
    for (let x = -20; x < W + 40; x += 56) {
      const r = 34 + rng() * 18;
      circ(g, x, 58 + rng() * 22, r, 0x3fa34d, INK, 3);
    }
    for (let x = 10; x < W; x += 90)
      circ(g, x + rng() * 30, 30 + rng() * 20, 14, 0x58b947, null, 0);
    // Hàng rào hai bên và phía dưới
    g.fillStyle(0xf3efe6, 1);
    for (let y = 100; y < H; y += 26) {
      rr(g, 4, y, 16, 22, 4, 0xf3efe6, INK, 2);
      rr(g, W - 20, y, 16, 22, 4, 0xf3efe6, INK, 2);
    }
    for (let x = 0; x < W; x += 28) {
      if (x > (GATE.x - 160) && x < (GATE.x + 160)) continue;
      rr(g, x, H - 52, 18, 40, 4, 0xf3efe6, INK, 2);
    }
    // Đường đi lát đá
    for (const r of pathRects()) {
      rr(g, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14, STONE_EDGE, null, 0);
    }
    for (const r of pathRects()) {
      rr(g, r.x, r.y, r.w, r.h, 12, STONE, null, 0);
    }
    // Vân đá trên sân
    g.lineStyle(2, STONE_EDGE, 0.7);
    for (const r of pathRects()) {
      for (let x = r.x + 30; x < r.x + r.w - 10; x += 58)
        g.lineBetween(x, r.y + 6, x, r.y + r.h - 6);
    }
    // Sân cột cờ và hồ nước
    ell(g, FLAGPOLE.x, FLAGPOLE.y - 10, 260, 150, STONE_EDGE, null, 0, 1);
    ell(g, FLAGPOLE.x, FLAGPOLE.y - 10, 246, 136, 0xf1e9d4, null, 0, 1);
    pondRim(g, POND.x, POND.y, POND.rx, POND.ry);
    // Cỏ và hoa nhỏ rải rác ở những chỗ không có đường
    const paths = pathRects();
    const free = (x, y) =>
      !paths.some(
        (r) =>
          x > r.x - 12 &&
          x < r.x + r.w + 12 &&
          y > r.y - 12 &&
          y < r.y + r.h + 12,
      );
    for (let i = 0; i < 360; i++) {
      const x = 30 + rng() * (W - 60);
      const y = 110 + rng() * (H - 200);
      if (!free(x, y)) continue;
      if (Math.hypot((x - POND.x) / 100, (y - POND.y) / 70) < 1) continue;
      if (rng() < 0.55) {
        line(g, x - 4, y, x, y - 8, 0x58b947, 2.5);
        line(g, x + 4, y, x, y - 8, 0x58b947, 2.5);
      } else {
        const c = [0xffffff, 0xffe066, 0xff8fab][Math.floor(rng() * 3)];
        circ(g, x, y, 3.5, c, null, 0);
        circ(g, x, y, 1.4, 0xff9f43, null, 0);
      }
    }
  });
}

/** Mây và các hình trang trí dùng cho trang chủ. */
function cloud(scene) {
  makeTexture(scene, "cloud", 180, 90, (g) => {
    for (const [x, y, r] of [
      [45, 56, 30],
      [88, 40, 38],
      [132, 56, 30],
      [70, 62, 28],
      [110, 64, 26],
    ])
      circ(g, x, y, r, 0xffffff, null, 0);
    g.fillStyle(0xe9f4ff, 1);
    g.fillRect(40, 72, 100, 10);
  });
}

export function generateMapTextures(scene) {
  worldBackground(scene);
  const styles = {
    library: {
      roofH: 78,
      wall: 0xf7c59f,
      base: 0xc97a4b,
      roof: 0x1e6fd9,
      door: 0x8a5a2b,
      deco: "book",
      windows: 2,
    },
    literature: {
      roofH: 78,
      wall: 0xd3bff5,
      base: 0x9b7fd1,
      roof: 0xe07b00,
      door: 0x5b3a8c,
      deco: "blocks",
      windows: 2,
    },
    spelling: {
      roofH: 66,
      wall: 0xc2ead6,
      base: 0x7fbf9f,
      roof: 0xe4572e,
      door: 0x2f6f5a,
      deco: "pencil",
      windows: 2,
    },
    pets: {
      roofH: 56,
      wall: 0xffe6a8,
      base: 0xd9b55a,
      roof: 0x2fa56b,
      door: 0x8a5a2b,
      deco: "paw",
      windows: 1,
    },
    math: {
      roofH: 56,
      wall: 0xcfe8ff,
      base: 0x7fb2e6,
      roof: 0x7e57c2,
      door: 0x2b4a8a,
      deco: "calc",
      windows: 1,
    },
  };
  for (const b of BUILDINGS) {
    if (b.zone === "grand") grandHall(scene, b.texture, b.w, b.h);
    else if (b.zone === "arena") arenaTent(scene, b.texture, b.w, b.h);
    else if (b.zone === "idiom") idiomStage(scene, b.texture, b.w, b.h);
    else if (b.zone === "shop")
      shopFront(scene, b.texture, b.w, b.h, {
        roofH: 56,
        wall: 0xffd1dc,
        base: 0xe08aa0,
        roof: 0x1fa3a3,
        door: 0x7b3f1d,
        deco: "bag",
        windows: 1,
      });
    else genericBuilding(scene, b.texture, b.w, b.h, styles[b.zone]);
  }
  tree(scene, "prop-tree-0", 0);
  tree(scene, "prop-tree-1", 1);
  bench(scene);
  for (const w of new Set(FLOWER_BEDS.map((f) => f.w))) flowerBed(scene, w);
  flagpole(scene);
  board(scene);
  gate(scene);
  cloud(scene);
}
