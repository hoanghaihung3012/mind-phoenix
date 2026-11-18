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
  hex,
} from "./draw.js";
import { badges } from "../data/index.js";

const GOLD = 0xffc83d;
const GOLD_D = 0xb86e00;

/** Mỗi biểu tượng được vẽ trong khung 100 x 100, tâm (50, 50). */
const ICONS = {
  star(g) {
    poly(g, starPoints(50, 54, 46, 20), GOLD, GOLD_D, 5);
  },
  coin(g) {
    circ(g, 50, 50, 42, GOLD, GOLD_D, 5);
    circ(g, 50, 50, 29, null, 0xe09a00, 4);
    poly(g, starPoints(50, 52, 17, 7.5), 0xfff2b3, null, 0);
  },
  heart(g) {
    circ(g, 34, 36, 22, 0xe84a5f, 0x9e1f33, 5);
    circ(g, 66, 36, 22, 0xe84a5f, 0x9e1f33, 5);
    poly(g, [14, 46, 86, 46, 50, 90], 0xe84a5f, 0x9e1f33, 5);
    circ(g, 34, 36, 20, 0xe84a5f, null, 0);
    circ(g, 66, 36, 20, 0xe84a5f, null, 0);
    poly(g, [17, 48, 83, 48, 50, 86], 0xe84a5f, null, 0);
  },
  lock(g) {
    g.lineStyle(11, 0x4a5568, 1);
    g.beginPath();
    g.moveTo(31, 50);
    g.lineTo(31, 42);
    g.arc(50, 42, 19, Math.PI, 0, false);
    g.lineTo(69, 50);
    g.strokePath();
    rr(g, 18, 46, 64, 46, 10, 0x8a97ab, INK, 5);
    circ(g, 50, 66, 7, INK, null, 0);
    rr(g, 47, 66, 6, 14, 2, INK, null, 0);
  },
  check(g) {
    g.lineStyle(17, 0x1f8a4c, 1);
    g.beginPath();
    g.moveTo(20, 54);
    g.lineTo(42, 76);
    g.lineTo(80, 28);
    g.strokePath();
  },
  cross(g) {
    g.lineStyle(15, 0xc0392b, 1);
    g.lineBetween(24, 24, 76, 76);
    g.lineBetween(76, 24, 24, 76);
  },
  book(g) {
    rr(g, 8, 22, 40, 58, 6, 0xffffff, 0x1558b0, 5);
    rr(g, 52, 22, 40, 58, 6, 0xffffff, 0x1558b0, 5);
    rr(g, 8, 70, 84, 12, 4, 0x1e6fd9, 0x1558b0, 4);
    for (const y of [34, 46, 58]) {
      line(g, 16, y, 40, y, 0x8fb4e8, 4);
      line(g, 60, y, 84, y, 0x8fb4e8, 4);
    }
  },
  pencil(g) {
    g.save();
    g.translateCanvas(50, 50);
    g.rotateCanvas(Math.PI / 4);
    rr(g, -12, -42, 24, 64, 3, 0xffd23f, 0xb86e00, 5);
    rr(g, -12, -50, 24, 12, 4, 0xf48fb1, 0xb86e00, 5);
    poly(g, [-12, 22, 12, 22, 0, 46], 0xf3d3a8, 0xb86e00, 5);
    poly(g, [-4.5, 36, 4.5, 36, 0, 46], 0x333a45, null, 0);
    g.restore();
  },
  blocks(g) {
    rr(g, 10, 52, 38, 38, 6, 0xe4572e, INK, 4);
    rr(g, 52, 52, 38, 38, 6, 0x1e6fd9, INK, 4);
    rr(g, 31, 12, 38, 38, 6, 0xffc83d, INK, 4);
  },
  scroll(g) {
    rr(g, 18, 22, 64, 56, 6, 0xfff4d6, 0xb86e00, 5);
    ell(g, 18, 50, 20, 56, 0xf3d9a4, 0xb86e00, 5);
    ell(g, 82, 50, 20, 56, 0xf3d9a4, 0xb86e00, 5);
    for (const y of [38, 50, 62]) line(g, 34, y, 66, y, 0xc97a00, 4);
  },
  flame(g) {
    poly(
      g,
      [50, 6, 70, 32, 84, 58, 76, 84, 50, 94, 24, 84, 16, 58, 32, 38, 40, 52],
      0xf28c28,
      0xb85c00,
      5,
    );
    poly(
      g,
      [50, 44, 64, 66, 60, 82, 50, 86, 40, 82, 36, 66],
      0xffd23f,
      null,
      0,
    );
  },
  clipboard(g) {
    rr(g, 20, 12, 60, 80, 8, 0xe8c98d, 0x8a5a00, 5);
    rr(g, 32, 6, 36, 18, 6, 0x8a97ab, INK, 4);
    rr(g, 28, 30, 44, 54, 4, 0xffffff, null, 0);
    for (const y of [40, 54, 68]) {
      line(g, 34, y, 66, y, 0x1e6fd9, 4);
    }
  },
  gem(g) {
    poly(g, [50, 90, 8, 38, 26, 12, 74, 12, 92, 38], 0xd6409f, 0x7a1d5a, 5);
    poly(g, [8, 38, 92, 38, 50, 90], 0xf27bb0, null, 0);
    line(g, 8, 38, 92, 38, 0x7a1d5a, 4);
    line(g, 34, 38, 50, 12, 0x7a1d5a, 3);
    line(g, 66, 38, 50, 12, 0x7a1d5a, 3);
    line(g, 34, 38, 50, 90, 0x7a1d5a, 3);
    line(g, 66, 38, 50, 90, 0x7a1d5a, 3);
  },
  trophy(g) {
    g.lineStyle(8, GOLD_D, 1);
    g.strokeCircle(22, 30, 13);
    g.strokeCircle(78, 30, 13);
    poly(g, [24, 8, 76, 8, 72, 46, 50, 64, 28, 46], GOLD, GOLD_D, 5);
    rr(g, 43, 60, 14, 18, 2, GOLD, GOLD_D, 5);
    rr(g, 28, 78, 44, 14, 5, 0xe09a00, GOLD_D, 5);
  },
  paw(g) {
    ell(g, 50, 64, 46, 36, 0xa0612f, 0x5b3a29, 5);
    circ(g, 20, 40, 10, 0xa0612f, 0x5b3a29, 4);
    circ(g, 38, 24, 10, 0xa0612f, 0x5b3a29, 4);
    circ(g, 62, 24, 10, 0xa0612f, 0x5b3a29, 4);
    circ(g, 80, 40, 10, 0xa0612f, 0x5b3a29, 4);
  },
  bag(g) {
    g.lineStyle(7, INK, 1);
    g.beginPath();
    g.arc(50, 36, 17, Math.PI, 0, false);
    g.strokePath();
    rr(g, 16, 34, 68, 58, 10, 0xe4572e, INK, 5);
    rr(g, 16, 46, 68, 8, 0, 0xb83c1c, null, 0);
    circ(g, 50, 66, 9, GOLD, GOLD_D, 4);
  },
  clock(g) {
    circ(g, 50, 50, 42, 0xffffff, INK, 5);
    line(g, 50, 50, 50, 24, INK, 6);
    line(g, 50, 50, 70, 58, INK, 6);
    circ(g, 50, 50, 5, INK, null, 0);
  },
  map(g) {
    poly(
      g,
      [10, 24, 36, 14, 64, 24, 90, 14, 90, 76, 64, 86, 36, 76, 10, 86],
      0xfff4d6,
      0x8a5a00,
      5,
    );
    line(g, 36, 14, 36, 76, 0x8a5a00, 3);
    line(g, 64, 24, 64, 86, 0x8a5a00, 3);
    circ(g, 50, 46, 11, 0xe4572e, INK, 4);
  },
  gear(g) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const r = i % 2 === 0 ? 44 : 33;
      pts.push(50 + Math.cos(a) * r, 50 + Math.sin(a) * r);
    }
    poly(g, pts, 0x8a97ab, INK, 5);
    circ(g, 50, 50, 15, 0xe8eef6, INK, 5);
  },
  note(g) {
    circ(g, 34, 74, 15, INK, null, 0);
    rr(g, 44, 14, 10, 62, 3, INK, null, 0);
    poly(g, [50, 14, 80, 26, 80, 44, 50, 34], INK, null, 0);
  },
  sound(g) {
    poly(g, [14, 38, 34, 38, 56, 18, 56, 82, 34, 62, 14, 62], 0x8a97ab, INK, 5);
    g.lineStyle(6, INK, 1);
    g.beginPath();
    g.arc(56, 50, 16, -0.9, 0.9, false);
    g.strokePath();
    g.beginPath();
    g.arc(56, 50, 28, -0.9, 0.9, false);
    g.strokePath();
  },
  muted(g) {
    ICONS.sound(g);
    line(g, 10, 90, 90, 10, 0xc0392b, 8);
  },
  medal(g) {
    poly(g, [28, 4, 46, 4, 54, 40, 36, 40], 0xe4572e, INK, 4);
    poly(g, [72, 4, 54, 4, 46, 40, 64, 40], 0x1e6fd9, INK, 4);
    circ(g, 50, 64, 28, GOLD, GOLD_D, 5);
    poly(g, starPoints(50, 65, 16, 7), 0xfff2b3, GOLD_D, 3);
  },
  sparkle(g) {
    poly(
      g,
      [50, 4, 60, 40, 96, 50, 60, 60, 50, 96, 40, 60, 4, 50, 40, 40],
      0xfff2b3,
      GOLD_D,
      4,
    );
  },
  arrow(g) {
    poly(
      g,
      [14, 38, 54, 38, 54, 18, 90, 50, 54, 82, 54, 62, 14, 62],
      0xffffff,
      INK,
      5,
    );
  },
  home(g) {
    poly(
      g,
      [50, 10, 92, 48, 80, 48, 80, 90, 20, 90, 20, 48, 8, 48],
      0xfff4d6,
      INK,
      5,
    );
    rr(g, 42, 60, 16, 30, 3, 0xe07b00, INK, 4);
  },
  calc(g) {
    rr(g, 16, 6, 68, 88, 10, 0x1e6fd9, INK, 5);
    rr(g, 26, 16, 48, 22, 4, 0xd6f5e0, INK, 3);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++)
        rr(
          g,
          26 + c * 17,
          46 + r * 15,
          13,
          11,
          3,
          c === 2 ? 0xffc83d : 0xffffff,
          INK,
          2,
        );
    }
  },
  target(g) {
    circ(g, 50, 50, 42, 0xffffff, 0xc0392b, 6);
    circ(g, 50, 50, 26, 0xe4572e, 0xc0392b, 4);
    circ(g, 50, 50, 10, 0xffffff, 0xc0392b, 3);
  },
};

export const ICON_KEYS = Object.keys(ICONS);

/** Vẽ một biểu tượng bất kỳ lên Graphics có sẵn, tâm (cx, cy), kích thước s. */
export function drawIconShape(g, kind, cx, cy, s) {
  const draw = ICONS[kind];
  if (!draw) return;
  const u = s / 100;
  g.save();
  g.translateCanvas(cx - 50 * u, cy - 50 * u);
  g.scaleCanvas(u, u);
  draw(g);
  g.restore();
}

/** Tạo texture cho tất cả biểu tượng (icon-*) và huy hiệu (badge-*). */
export function generateIconTextures(scene) {
  for (const kind of ICON_KEYS) {
    makeTexture(scene, `icon-${kind}`, 96, 96, (g) =>
      drawIconShape(g, kind, 48, 48, 92),
    );
  }
  for (const b of badges) {
    const base = hex(b.color);
    makeTexture(scene, `badge-${b.id}`, 112, 112, (g) => {
      circ(g, 56, 56, 52, shade(base, -0.25), INK, 4);
      circ(g, 56, 56, 43, base, null, 0);
      circ(g, 56, 56, 36, shade(base, 0.82), shade(base, -0.3), 3);
      drawIconShape(g, b.icon, 56, 56, 52);
    });
  }
  makeTexture(scene, "badge-locked", 112, 112, (g) => {
    circ(g, 56, 56, 52, 0x8b95a3, INK, 4);
    circ(g, 56, 56, 43, 0xb9c1cc, null, 0);
    circ(g, 56, 56, 36, 0xdfe4ea, 0x7b8594, 3);
    drawIconShape(g, "lock", 56, 56, 44);
  });
}
