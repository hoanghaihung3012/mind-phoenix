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
    ell(g, w / 2, h - 6, w * 0.98, 28, 0x000000, null, 0, 0.18);
    rr(g, bx, roofH - 6, bw, h - roofH, 8, o.wall, INK, 4);
    rr(g, bx + 2, h - 28, bw - 4, 24, 4, o.base, null, 0);
    // Cửa sổ hai bên
    const wy = roofH + 60;
    const wh = Math.max(30, Math.min(68, h - wy - 42));
    const doorH = Math.max(72, Math.min(110, h - roofH - 70));
    const cols = o.windows ?? 2;
    const ww = w >= 350 ? 52 : (w >= 280 ? 44 : 36);
    for (let i = 0; i < cols; i++) {
      const step = i * 62;
      windowShape(g, bx + 20 + step, wy, ww, wh);
      windowShape(g, w - bx - 20 - ww - step, wy, ww, wh);
    }
    door(g, w / 2, h - 6, 70, doorH, o.door);
    // Mái
    poly(g, [0, roofH, 42, 8, w - 42, 8, w, roofH], o.roof, INK, 4);
    poly(
      g,
      [16, roofH - 4, 48, 14, w - 48, 14, w - 16, roofH - 4],
      shade(o.roof, 0.18),
      null,
      0,
    );
    for (const t of [0.35, 0.65]) {
      const yy = 8 + (roofH - 8) * t;
      const inset = 42 * (1 - t);
      line(g, inset + 4, yy, w - inset - 4, yy, shade(o.roof, -0.3), 3);
    }
    // Bảng tên
    const p = plate(key, w, w / 2, roofH + 6, bw * 0.90, 44);
    rr(g, p.x, p.y, p.w, p.h, 12, 0xfff9e6, INK, 3.5);
    // Biểu tượng trên mái
    const iconY = 8 + (roofH - 8) * 0.48;
    circ(g, w / 2, iconY, 30, 0xfff9e6, INK, 3.5);
    drawIconShape(g, o.deco, w / 2, iconY, 40);
    o.extra?.(g, w, h, doorH);
  });
}

function grandHall(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    const mid = w / 2;
    ell(g, mid, h - 6, w * 0.98, 32, 0x000000, null, 0, 0.18);
    rr(g, 14, 156, w - 28, h - 162, 8, 0xfff1c9, INK, 4);
    rr(g, 16, h - 34, w - 32, 28, 4, 0xcfb989, null, 0);
    // Tháp giữa
    rr(g, mid - 81, 36, 162, 130, 8, 0xffe6a3, INK, 4);
    poly(g, [mid - 98, 44, mid + 98, 44, mid, 2], 0xc0392b, INK, 4);
    circ(g, mid, 86, 28, 0xffffff, INK, 4);
    line(g, mid, 86, mid, 66, INK, 4);
    line(g, mid, 86, mid + 16, 94, INK, 4);
    // Cánh nhà và mái
    poly(g, [0, 164, 40, 126, w - 40, 126, w, 164], 0xc0392b, INK, 4);
    poly(g, [18, 158, 50, 134, w - 50, 134, w - 18, 158], 0xd9564a, null, 0);
    // Cửa sổ
    for (const row of [196, 272]) {
      for (const x of [44, 114]) {
        windowShape(g, x, row, 52, 58);
        windowShape(g, w - x - 52, row, 52, 58);
      }
    }
    // Cửa chính và bậc thềm
    rr(g, mid - 80, h - 18, 160, 16, 4, 0xcfd6df, INK, 3);
    rr(g, mid - 68, h - 32, 136, 16, 4, 0xdbe1e8, INK, 3);
    rr(g, mid - 52, h - 162, 104, 132, 22, 0x8a5a2b, INK, 4);
    line(g, mid, h - 154, mid, h - 36, 0x5b3a1b, 4);
    circ(g, mid - 14, h - 100, 4.5, 0xffd23f, INK, 2);
    circ(g, mid + 14, h - 100, 4.5, 0xffd23f, INK, 2);
    // Bảng tên trường
    const p = plate(key, w, mid, 136, 450, 50);
    rr(g, p.x, p.y, p.w, p.h, 12, 0xfff9e6, INK, 4);
  });
}

function arenaTent(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    const mid = w / 2;
    ell(g, mid, h - 6, w * 0.98, 30, 0x000000, null, 0, 0.18);
    rr(g, 14, 124, w - 28, h - 130, 8, 0xfff1c9, INK, 4);
    // Sọc dọc của thân lều
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) continue;
      g.fillStyle(0xf6c5bd, 1);
      g.fillRect(16 + i * ((w - 32) / 8), 126, (w - 32) / 8, h - 160);
    }
    rr(g, 14, 124, w - 28, h - 130, 8, null, INK, 4);
    // Mái lều
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const x1 = 2 + (i * (w - 4)) / steps;
      const x2 = 2 + ((i + 1) * (w - 4)) / steps;
      poly(
        g,
        [mid, 30, x1, 134, x2, 134],
        i % 2 === 0 ? 0xe4572e : 0xffffff,
        INK,
        3.5,
      );
    }
    line(g, mid, 30, mid, 5, INK, 4);
    poly(g, [mid, 5, mid + 30, 13, mid, 21], 0xffc83d, INK, 3);
    circ(g, mid, 90, 21, 0xfff9e6, INK, 3);
    drawIconShape(g, "flame", mid, 90, 28);
    door(g, mid, h - 6, 72, 104, 0x7b3f1d);
    const p = plate(key, w, mid, 142, w - 65, 42);
    rr(g, p.x, p.y, p.w, p.h, 12, 0xfff9e6, INK, 3.5);
  });
}

function idiomStage(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    const mid = w / 2;
    ell(g, mid, h - 6, w * 0.98, 30, 0x000000, null, 0, 0.18);
    rr(g, 12, h - 60, w - 24, 52, 8, 0xd9c6a0, INK, 4);
    rr(g, 30, h - 80, w - 60, 26, 8, 0xe8d8b4, INK, 4);
    rr(g, 60, 78, w - 120, h - 146, 10, 0xffe0a3, INK, 4);
    // Rèm
    poly(g, [60, 78, 106, 78, 60, h - 68], 0xc0392b, INK, 3);
    poly(g, [w - 60, 78, w - 106, 78, w - 60, h - 68], 0xc0392b, INK, 3);
    // Cột
    for (const x of [28, w - 56]) {
      rr(g, x, 65, 28, h - 128, 6, 0xf3efe6, INK, 3);
      rr(g, x - 5, 57, 38, 16, 5, 0xe0d8c6, INK, 3);
    }
    // Mái che
    poly(g, [10, 72, w - 10, 72, w - 46, 16, 46, 16], 0x8e5bd0, INK, 4);
    poly(g, [28, 68, w - 28, 68, w - 58, 24, 58, 24], 0xa77be0, null, 0);
    // Các ô chữ trang trí
    const tiles = [0xff8a65, 0xffd54f, 0x81c784, 0x64b5f6, 0xba68c8];
    for (let i = 0; i < 5; i++)
      rr(g, mid - 65 + i * 26, h - 140, 22, 31, 4, tiles[i], INK, 2);
    const p = plate(key, w, mid, 86, w - 80, 42);
    rr(g, p.x, p.y, p.w, p.h, 12, 0xfff9e6, INK, 3.5);
    circ(g, mid, 38, 22, 0xfff9e6, INK, 3);
    drawIconShape(g, "scroll", mid, 38, 30);
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
            doorX - 60 + i * 20,
            top - 2,
            doorX - 60 + (i + 1) * 20,
            top - 2,
            doorX - 68 + (i + 1) * 22.6,
            top + 24,
            doorX - 68 + i * 22.6,
            top + 24,
          ],
          i % 2 === 0 ? 0xe4572e : 0xffffff,
          INK,
          2.5,
        );
      }
    },
  });
}

function soccerField(scene, key, w, h) {
  makeTexture(scene, key, w, h, (g) => {
    const midX = w / 2;
    // Bóng đổ
    ell(g, midX, h - 6, w * 0.98, 30, 0x000000, null, 0, 0.18);

    // Bờ tường / hàng rào bao quanh sân bóng
    rr(g, 6, 28, w - 12, h - 36, 16, 0xd4c5a9, INK, 4);

    // Nền sân cỏ bóng đá
    const fieldX = 16;
    const fieldY = 38;
    const fieldW = w - 32;
    const fieldH = h - 54;
    rr(g, fieldX, fieldY, fieldW, fieldH, 12, 0x2e7d32, INK, 3);

    // Các dải cỏ sáng tối xen kẽ (sọc cỏ sân vận động)
    const stripeW = 40;
    let stripeIdx = 0;
    for (let x = fieldX + 2; x < fieldX + fieldW - 2; x += stripeW) {
      if (stripeIdx % 2 === 1) {
        const sw = Math.min(stripeW, fieldX + fieldW - 2 - x);
        g.fillStyle(0x388e3c, 1);
        g.fillRect(x, fieldY + 2, sw, fieldH - 4);
      }
      stripeIdx++;
    }

    // Vạch biên ngoài sân cỏ
    const innerX = fieldX + 14;
    const innerY = fieldY + 14;
    const innerW = fieldW - 28;
    const innerH = fieldH - 28;
    rr(g, innerX, innerY, innerW, innerH, 4, null, 0xffffff, 3);

    // Đường giữa sân
    const centerY = innerY + innerH / 2;
    line(g, innerX, centerY, innerX + innerW, centerY, 0xffffff, 3);

    // Vòng tròn trung tâm
    circ(g, midX, centerY, 30, null, 0xffffff, 3);
    circ(g, midX, centerY, 4.5, 0xffffff, null, 0);

    // Khung thành phía trên (Top Goal)
    const goalW = 98;
    const goalH = 28;
    const goalX = midX - goalW / 2;
    const goalY = innerY - 6;

    // Lưới khung thành phía trên
    g.fillStyle(0xe2e8f0, 0.7);
    g.fillRect(goalX + 2, goalY - goalH + 4, goalW - 4, goalH);
    // Mắt lưới caro
    for (let lx = goalX + 10; lx < goalX + goalW; lx += 10) {
      line(g, lx, goalY - goalH + 4, lx, goalY + 4, 0xffffff, 1.3);
    }
    for (let ly = goalY - goalH + 10; ly <= goalY; ly += 7) {
      line(g, goalX + 2, ly, goalX + goalW - 2, ly, 0xffffff, 1.3);
    }
    // Cột dọc và xà ngang khung thành trên
    rr(g, goalX, goalY - goalH + 2, goalW, goalH + 2, 3, null, 0xffffff, 3.5);
    rr(g, goalX, goalY - goalH + 2, goalW, goalH + 2, 3, null, INK, 1.8);

    // Vòng cấm địa (Penalty box) phía trên
    rr(g, midX - 68, innerY, 136, 38, 2, null, 0xffffff, 2.5);
    circ(g, midX, innerY + 28, 3, 0xffffff, null, 0);

    // Vòng cấm địa phía dưới
    rr(g, midX - 68, innerY + innerH - 38, 136, 38, 2, null, 0xffffff, 2.5);
    circ(g, midX, innerY + innerH - 28, 3, 0xffffff, null, 0);

    // Cờ 4 góc sân (vàng & đỏ)
    for (const [cx, cy, dir] of [
      [innerX, innerY, 1],
      [innerX + innerW, innerY, -1],
      [innerX, innerY + innerH, 1],
      [innerX + innerW, innerY + innerH, -1],
    ]) {
      line(g, cx, cy, cx, cy - 13, 0xfacc15, 2.5);
      poly(g, [cx, cy - 13, cx + 10 * dir, cy - 9, cx, cy - 5], 0xef4444, INK, 1.2);
    }

    // Quả bóng đá ở trung tâm
    circ(g, midX, centerY, 10, 0xffffff, INK, 2.5);
    circ(g, midX, centerY, 4, 0x1f2937, null, 0);
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2.5) {
      circ(g, midX + Math.cos(a) * 6.5, centerY + Math.sin(a) * 6.5, 2.2, 0x1f2937, null, 0);
    }

    // Bảng tên sân bóng đá
    const p = plate(key, w, midX, 4, w - 75, 36);
    rr(g, p.x, p.y, p.w, p.h, 10, 0x15803d, INK, 3.5);
    rr(g, p.x + 3, p.y + 3, p.w - 6, p.h - 6, 8, 0xfff9e6, null, 0);

    // Biểu tượng bóng đá hai bên bảng tên
    circ(g, p.x + 20, p.y + p.h / 2, 10, 0xffffff, INK, 2);
    circ(g, p.x + 20, p.y + p.h / 2, 3.5, 0x1e293b, null, 0);
    circ(g, p.x + p.w - 20, p.y + p.h / 2, 10, 0xffffff, INK, 2);
    circ(g, p.x + p.w - 20, p.y + p.h / 2, 3.5, 0x1e293b, null, 0);
  });
}

function tree(scene, key, variant) {
  makeTexture(scene, key, 145, 185, (g) => {
    ell(g, 72, 178, 70, 16, 0x000000, null, 0, 0.2);
    rr(g, 60, 102, 24, 76, 6, 0x8a5a2b, INK, 4);
    const green = variant === 0 ? 0x3fa34d : 0x58b947;
    circ(g, 44, 82, 38, green, INK, 5);
    circ(g, 100, 82, 38, green, INK, 5);
    circ(g, 72, 48, 42, green, INK, 5);
    circ(g, 72, 88, 34, green, null, 0);
    circ(g, 58, 38, 16, shade(green, 0.25), null, 0);
    circ(g, 36, 72, 11, shade(green, 0.25), null, 0);
    if (variant === 1) {
      for (const [x, y] of [
        [52, 66],
        [92, 58],
        [76, 92],
        [42, 95],
        [102, 90],
      ])
        circ(g, x, y, 6.5, 0xff5a5f, INK, 2);
    }
  });
}

function bench(scene) {
  makeTexture(scene, "prop-bench", 118, 60, (g) => {
    ell(g, 59, 55, 110, 10, 0x000000, null, 0, 0.2);
    rr(g, 10, 31, 16, 24, 4, 0x8f9aa8, INK, 3);
    rr(g, 92, 31, 16, 24, 4, 0x8f9aa8, INK, 3);
    rr(g, 3, 21, 112, 16, 6, 0xb9c2cd, INK, 3);
    rr(g, 8, 3, 102, 15, 6, 0xc7cfd8, INK, 3);
  });
}

function flowerBed(scene, w) {
  makeTexture(scene, `prop-bed-${w}`, w, 56, (g) => {
    rr(g, 0, 24, w, 32, 10, 0xb9c2cd, INK, 3);
    rr(g, 5, 29, w - 10, 20, 8, 0x6b4a2b, null, 0);
    const colors = [0xff6b81, 0xffd23f, 0xffffff, 0xff9f43, 0xb388ff];
    const n = Math.floor(w / 22);
    for (let i = 0; i < n; i++) {
      const x = 14 + i * ((w - 28) / Math.max(1, n - 1));
      line(g, x, 29, x, 13 + (i % 2) * 5, 0x2e8b57, 3.5);
      circ(g, x, 11 + (i % 2) * 5, 9, colors[i % colors.length], INK, 2);
      circ(g, x, 11 + (i % 2) * 5, 3.2, 0xffe066, null, 0);
    }
  });
}

function flagpole(scene) {
  makeTexture(scene, "prop-flag", 170, 310, (g) => {
    ell(g, 74, 294, 128, 30, 0x000000, null, 0, 0.2);
    ell(g, 74, 284, 120, 38, 0xcfd6df, INK, 5);
    ell(g, 74, 278, 92, 26, 0x9be07a, INK, 4);
    rr(g, 69, 32, 11, 250, 4, 0xdfe5ec, INK, 4);
    circ(g, 74, 26, 9.5, 0xffc83d, 0xb86e00, 3.5);
    poly(g, [80, 40, 160, 40, 160, 108, 80, 108], 0xda251d, INK, 4);
    poly(g, starPoints(120, 74, 21, 8.5), 0xffe34d, null, 0);
  });
}

function board(scene) {
  makeTexture(scene, "prop-board", 120, 130, (g) => {
    ell(g, 60, 122, 94, 13, 0x000000, null, 0, 0.2);
    rr(g, 18, 65, 12, 62, 3, 0x8a5a2b, INK, 4);
    rr(g, 90, 65, 12, 62, 3, 0x8a5a2b, INK, 4);
    rr(g, 3, 5, 114, 82, 10, 0xc99a5b, INK, 4);
    rr(g, 11, 13, 98, 66, 6, 0xfff4d6, INK, 2.5);
    const notes = [
      [18, 20, 0xffd54f],
      [58, 20, 0x81d4fa],
      [38, 46, 0xf8bbd0],
    ];
    for (const [x, y, c] of notes) {
      rr(g, x, y, 36, 28, 3, c, INK, 2);
      circ(g, x + 18, y + 3, 3, 0xe4572e, INK, 1.5);
    }
    drawIconShape(g, "check", 88, 62, 18);
  });
}

function gate(scene) {
  makeTexture(scene, "prop-gate", 430, 182, (g) => {
    ell(g, 215, 174, 416, 18, 0x000000, null, 0, 0.18);
    for (const x of [6, 344]) {
      rr(g, x, 26, 80, 154, 8, 0xdfe5ec, INK, 5);
      rr(g, x - 5, 16, 90, 20, 6, 0xc3ccd6, INK, 4);
      rr(g, x + 10, 52, 60, 20, 4, 0xcdd5df, INK, 3);
    }
    // Cổng sắt mở
    for (let i = 0; i < 5; i++) {
      line(g, 98 + i * 12, 92, 98 + i * 12, 172, 0x4a5568, 3.5);
      line(g, 332 - i * 12, 92, 332 - i * 12, 172, 0x4a5568, 3.5);
    }
    // Biển hiệu cổng
    rr(g, 26, 0, 378, 60, 14, 0x1e6fd9, INK, 5);
    rr(g, 36, 8, 358, 44, 10, 0xfff9e6, null, 0);
    PLATE_INFO[`prop-gate`] = { x: 215, y: 30, w: 350, h: 44 };
  });
}

function pondRim(g, cx, cy, rx, ry) {
  // Bờ kè đá hồ sen
  ell(g, cx, cy, rx * 2 + 16, ry * 2 + 14, 0xcfd6df, INK, 4);
  // Mặt nước hồ trong xanh
  ell(g, cx, cy, rx * 2, ry * 2, 0x6ec6ff, INK, 3);
  ell(g, cx - 12, cy - 8, rx * 1.2, ry * 0.7, 0x9fdcff, null, 0, 0.8);

  // Đàn cá bơi lội dưới làn nước
  circ(g, cx - 55, cy - 18, 8, 0xff793f, null, 0);
  circ(g, cx - 44, cy - 18, 5, 0xffb142, null, 0);
  circ(g, cx + 55, cy + 16, 9, 0xff5252, null, 0);
  circ(g, cx + 67, cy + 16, 6, 0xff793f, null, 0);
  circ(g, cx - 15, cy + 32, 7, 0xffb142, null, 0);
  circ(g, cx - 5, cy + 32, 4, 0xff793f, null, 0);

  // Cầu tàu / bến gỗ câu cá Phú Thọ
  rr(g, cx - 34, cy + ry - 22, 68, 48, 4, 0x854d0e, INK, 3);
  for (let py = cy + ry - 16; py <= cy + ry + 18; py += 10) {
    line(g, cx - 32, py, cx + 32, py, 0x583101, 2);
  }
  // Hai cọc gỗ neo bờ
  rr(g, cx - 32, cy + ry - 25, 8, 14, 2, 0x583101, INK, 2);
  rr(g, cx + 24, cy + ry - 25, 8, 14, 2, 0x583101, INK, 2);

  // Biển hiệu gỗ "Bến Câu Cá"
  rr(g, cx + 42, cy + ry + 6, 6, 26, 2, 0x713f12, INK, 2);
  rr(g, cx + 24, cy + ry - 8, 42, 20, 4, 0xfde047, INK, 2);
  circ(g, cx + 45, cy + ry + 2, 3.5, 0x0284c7, null, 0);

  // Lá sen và hoa sen hồng nở
  for (const [dx, dy, r] of [
    [32, 12, 10],
    [-38, 6, 9],
    [8, -22, 8],
    [-70, 18, 9],
    [75, -15, 11]
  ]) {
    circ(g, cx + dx, cy + dy, r, 0x58b947, INK, 2);
  }
  circ(g, cx + 32, cy + 10, 3.5, 0xff8fab, null, 0);
  circ(g, cx - 70, cy + 16, 3, 0xff8fab, null, 0);
  circ(g, cx + 75, cy - 17, 4, 0xff8fab, null, 0);
}

function pathRects() {
  const rects = [
    // 3 Đại lộ ngang kết nối toàn trường:
    // Đại lộ phía trước hàng 1 (Thư viện - Đại hội - Ngữ văn)
    { x: 350, y: 890, w: 4100, h: 80 },
    // Đại lộ trung tâm phía trước hàng 2 (Chính tả - Đấu trường - Thành ngữ)
    { x: 350, y: 2090, w: 4100, h: 80 },
    // Đại lộ sân trước phía trước hàng 3 (Thú cưng - Bảng NV - Cổng - Vườn toán - Cửa hàng)
    { x: 350, y: 2990, w: 4100, h: 90 },

    // 5 Trục đường dọc chính:
    // Trục chính trung tâm (Đại hội -> Đấu trường -> Cổng chính)
    { x: 2340, y: 890, w: 120, h: 2510 },
    // Trục phía Tây (Thư viện -> Chính tả -> Thú cưng)
    { x: 580, y: 890, w: 90, h: 2190 },
    // Trục phía Đông (Ngữ văn -> Thành ngữ -> Cửa hàng)
    { x: 4120, y: 890, w: 90, h: 2190 },
    // Trục cột cờ kết nối hàng 1 & hàng 2
    { x: 1405, y: 890, w: 90, h: 1280 },
    // Trục hồ sen kết nối hàng 1 & hàng 2
    { x: 3305, y: 890, w: 90, h: 1280 },

    // Đường dạo ngang qua quảng trường cột cờ & hồ sen
    { x: 1405, y: 1460, w: 1990, h: 80 },
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
      if (x > (GATE.x - 200) && x < (GATE.x + 200)) continue;
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
    ell(g, FLAGPOLE.x, FLAGPOLE.y - 10, 495, 285, STONE_EDGE, null, 0, 1);
    ell(g, FLAGPOLE.x, FLAGPOLE.y - 10, 475, 265, 0xf1e9d4, null, 0, 1);
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
    for (let i = 0; i < 680; i++) {
      const x = 30 + rng() * (W - 60);
      const y = 110 + rng() * (H - 200);
      if (!free(x, y)) continue;
      if (Math.hypot((x - POND.x) / (POND.rx + 20), (y - POND.y) / (POND.ry + 20)) < 1) continue;
      if (Math.hypot((x - FLAGPOLE.x) / 260, (y - (FLAGPOLE.y - 10)) / 155) < 1) continue;
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
      roofH: 100,
      wall: 0xf7c59f,
      base: 0xc97a4b,
      roof: 0x1e6fd9,
      door: 0x8a5a2b,
      deco: "book",
      windows: 2,
    },
    literature: {
      roofH: 100,
      wall: 0xd3bff5,
      base: 0x9b7fd1,
      roof: 0xe07b00,
      door: 0x5b3a8c,
      deco: "blocks",
      windows: 2,
    },
    spelling: {
      roofH: 86,
      wall: 0xc2ead6,
      base: 0x7fbf9f,
      roof: 0xe4572e,
      door: 0x2f6f5a,
      deco: "pencil",
      windows: 2,
    },
    pets: {
      roofH: 74,
      wall: 0xffe6a8,
      base: 0xd9b55a,
      roof: 0x2fa56b,
      door: 0x8a5a2b,
      deco: "paw",
      windows: 1,
    },
    math: {
      roofH: 74,
      wall: 0xcfe8ff,
      base: 0x7fb2e6,
      roof: 0x7e57c2,
      door: 0x2b4a8a,
      deco: "calc",
      windows: 1,
    },
    arcade: {
      roofH: 76,
      wall: 0xfff3c4,
      base: 0xffd54f,
      roof: 0xe65100,
      door: 0x311b92,
      deco: "sparkle",
      windows: 2,
    },
  };
  for (const b of BUILDINGS) {
    if (b.zone === "grand") grandHall(scene, b.texture, b.w, b.h);
    else if (b.zone === "arena") arenaTent(scene, b.texture, b.w, b.h);
    else if (b.zone === "idiom") idiomStage(scene, b.texture, b.w, b.h);
    else if (b.zone === "soccer") soccerField(scene, b.texture, b.w, b.h);
    else if (b.zone === "shop")
      shopFront(scene, b.texture, b.w, b.h, {
        roofH: 74,
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
