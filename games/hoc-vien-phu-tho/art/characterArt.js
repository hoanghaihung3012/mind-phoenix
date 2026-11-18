import {
  INK,
  circ,
  ell,
  hex,
  line,
  poly,
  rr,
  shade,
  starPoints,
} from "./draw.js";
import { shop } from "../data/index.js";

export const SKIN_TONE = 0xffd9b8;
const BLUSH = 0xf5a3a3;

/** Kiểu trang phục của từng skin, đọc từ shop.json. */
export const SKIN_STYLES = Object.fromEntries(
  shop.skins.map((s) => [s.id, s.style]),
);
/** Cô giáo hướng dẫn chỉ dùng ở màn hình chính, không nằm trong cửa hàng. */
export const TEACHER_STYLE = {
  shirt: "#f48fb1",
  bottom: "#7e57c2",
  accessory: "teacher",
};

const HAIR_COLORS = shop.hairColors.map((c) => hex(c.color));
const BAG_COLORS = Object.fromEntries(
  shop.bagColors.map((c) => [c.id, hex(c.color)]),
);
const SHOE_COLORS = Object.fromEntries(
  shop.shoeColors.map((c) => [c.id, hex(c.color)]),
);

/**
 * Vẽ nhân vật. Gốc tọa độ ở giữa hai bàn chân, chiều cao khoảng 105 px.
 * dir: 'down' | 'up' | 'side' (hướng sang phải; lật ngang bằng scaleX để quay sang trái).
 * pose: 'idle' | 'walk' | 'cheer'.
 */
export function drawCharacter(
  g,
  { avatar, style, dir = "down", pose = "idle", phase = 0, t = 0 },
) {
  g.clear();
  const girl = avatar.character === "girl";
  const hair = HAIR_COLORS[avatar.hairColor] ?? HAIR_COLORS[0];
  const bag = BAG_COLORS[avatar.bagColor] ?? 0xe4572e;
  const shoe = SHOE_COLORS[avatar.shoeColor] ?? 0xffffff;
  const shirt = hex(style.shirt);
  const bottom = hex(style.bottom);
  const acc = style.accessory;

  const walking = pose === "walk";
  const cheering = pose === "cheer";
  const swing = walking ? Math.sin(phase) : 0;
  const bob = walking
    ? Math.abs(Math.sin(phase)) * 3
    : cheering
      ? Math.abs(Math.sin(t * 8)) * 9
      : Math.sin(t * 2.2) * 1.2;
  const side = dir === "side";
  const back = dir === "up";

  ell(g, 0, 0, 44, 12, 0x000000, null, 0, 0.2);

  const oy = -bob;
  const headY = -80 + oy;

  if (acc === "leader" && !back) drawCape(g, side, oy);

  if (side) {
    rr(g, -23, -64 + oy, 14, 34, 6, bag, INK, 3);
    rr(g, -23, -50 + oy, 14, 7, 0, shade(bag, -0.2), null, 0);
  }

  // Chân
  const lift = (s) => Math.max(0, s) * 5;
  if (side) {
    const reach = swing * 9;
    drawLeg(g, -3 - reach, oy, lift(-swing), bottom, shoe, girl, true, true);
    drawLeg(g, -3 + reach, oy, lift(swing), bottom, shoe, girl, true, false);
  } else {
    drawLeg(g, -9, oy, lift(swing), bottom, shoe, girl, false, false);
    drawLeg(g, 9, oy, lift(-swing), bottom, shoe, girl, false, false);
  }

  // Thân
  if (side) rr(g, -12, -63 + oy, 26, 38, 8, shirt, INK, 3);
  else rr(g, -18, -63 + oy, 36, 38, 9, shirt, INK, 3);
  if (girl) {
    const pts = side
      ? [-12, -33 + oy, 14, -33 + oy, 19, -14, -17, -14]
      : [-18, -33 + oy, 18, -33 + oy, 23, -14, -23, -14];
    poly(g, pts, bottom, INK, 3);
  }
  if (!back && !side)
    poly(g, [-6, -63 + oy, 0, -55 + oy, 6, -63 + oy], 0xffffff, INK, 2);
  drawOutfit(g, acc, { side, back, oy });

  if (acc === "leader" && back) drawCape(g, false, oy);
  if (back) {
    rr(g, -15, -62 + oy, 30, 34, 7, bag, INK, 3);
    rr(g, -15, -48 + oy, 30, 6, 0, shade(bag, -0.2), null, 0);
    circ(g, 0, -40 + oy, 3, 0xffffff, INK, 1.5);
  } else if (!side) {
    line(g, -10, -62 + oy, -12, -36 + oy, bag, 5);
    line(g, 10, -62 + oy, 12, -36 + oy, bag, 5);
  }

  // Tay
  const armColor = acc === "inventor" ? 0xffffff : shirt;
  if (side) {
    drawArm(g, 1, -58 + oy, cheering ? 2.6 : swing * 0.75, armColor);
  } else if (cheering) {
    const w = Math.sin(t * 9) * 0.25;
    drawArm(g, -20, -58 + oy, -(2.45 + w), armColor);
    drawArm(g, 20, -58 + oy, 2.45 + w, armColor);
  } else {
    drawArm(g, -20, -58 + oy, -0.12 - swing * 0.35, armColor);
    drawArm(g, 20, -58 + oy, 0.12 + swing * 0.35, armColor);
  }

  // Đầu
  const hx = side ? 3 : 0;
  if (!back) drawHairBack(g, avatar.hairStyle, hair, hx, headY, side, false);
  circ(g, hx, headY, 21, SKIN_TONE, INK, 3);
  if (back) {
    circ(g, hx, headY, 21.5, hair, INK, 3);
    drawHairBack(g, avatar.hairStyle, hair, hx, headY, false, true);
  } else {
    drawFace(g, hx, headY, side, acc === "teacher" || acc === "scholar");
    drawHairFront(g, avatar.hairStyle, hair, hx, headY, side);
  }
  drawHeadgear(g, acc, hx, headY, side, back);
}

function drawCape(g, side, oy) {
  const pts = side
    ? [-8, -62 + oy, -28, -16 + oy, -2, -28 + oy]
    : [-20, -62 + oy, -31, -12 + oy, 31, -12 + oy, 20, -62 + oy];
  poly(g, pts, 0xb3261e, INK, 3);
}

function drawLeg(g, x, oy, lift, bottom, shoe, girl, side, far) {
  const top = -27 + oy;
  const bottomY = -lift;
  let color = girl ? SKIN_TONE : bottom;
  if (far) color = shade(color, -0.22);
  rr(g, x - 5.5, top, 11, bottomY - top - 4, 4, color, INK, 3);
  if (girl) rr(g, x - 4, bottomY - 15, 8, 8, 0, 0xffffff, null, 0);
  const w = side ? 19 : 16;
  rr(
    g,
    x - w / 2 + (side ? 3 : 0),
    bottomY - 9,
    w,
    9,
    4,
    far ? shade(shoe, -0.2) : shoe,
    INK,
    3,
  );
}

/** angle = 0 là buông thẳng xuống; dương là hướng sang phải/trước, π là giơ thẳng lên. */
function drawArm(g, sx, sy, angle, color) {
  const len = 24;
  const hx = sx + Math.sin(angle) * len;
  const hy = sy + Math.cos(angle) * len;
  g.lineStyle(13, INK, 1);
  g.lineBetween(sx, sy, hx, hy);
  g.lineStyle(8, color, 1);
  g.lineBetween(sx, sy, hx, hy);
  circ(g, hx, hy, 5.5, SKIN_TONE, INK, 2.5);
}

function drawFace(g, hx, hy, side, glasses) {
  if (side) {
    ell(g, hx + 8, hy + 1, 4.5, 7, INK, null, 0);
    circ(g, hx + 9, hy - 1, 1.3, 0xffffff, null, 0);
    circ(g, hx + 11, hy + 9, 4, BLUSH, null, 0, 0.7);
    g.lineStyle(2.5, INK, 1);
    g.beginPath();
    g.arc(hx + 9, hy + 6, 5, 0.3, 1.9, false);
    g.strokePath();
    if (glasses) circ(g, hx + 8, hy + 1, 7, null, INK, 2);
    return;
  }
  ell(g, hx - 8, hy + 1, 4.5, 7, INK, null, 0);
  ell(g, hx + 8, hy + 1, 4.5, 7, INK, null, 0);
  circ(g, hx - 7, hy - 1, 1.3, 0xffffff, null, 0);
  circ(g, hx + 9, hy - 1, 1.3, 0xffffff, null, 0);
  circ(g, hx - 13, hy + 8, 4, BLUSH, null, 0, 0.7);
  circ(g, hx + 13, hy + 8, 4, BLUSH, null, 0, 0.7);
  g.lineStyle(2.5, INK, 1);
  g.beginPath();
  g.arc(hx, hy + 5, 6, 0.25, Math.PI - 0.25, false);
  g.strokePath();
  if (glasses) {
    circ(g, hx - 8, hy + 1, 7.5, null, INK, 2);
    circ(g, hx + 8, hy + 1, 7.5, null, INK, 2);
    line(g, hx - 1, hy + 1, hx + 1, hy + 1, INK, 2);
  }
}

function drawHairBack(g, style, color, hx, hy, side, full) {
  if (style === 2) {
    if (full) ell(g, hx, hy + 18, 30, 26, color, INK, 3);
    else ell(g, hx + (side ? -16 : 22), hy + 6, 11, 28, color, INK, 3);
  }
  if (style === 3) {
    circ(g, hx - 20, hy - 16, 8.5, color, INK, 3);
    if (!side || full) circ(g, hx + 20, hy - 16, 8.5, color, INK, 3);
  }
  if (side && !full) ell(g, hx - 12, hy + 1, 16, 30, color, INK, 3);
}

function drawHairFront(g, style, color, hx, hy, side) {
  g.fillStyle(color, 1);
  g.beginPath();
  g.arc(hx, hy, 21.5, Math.PI, Math.PI * 2, false);
  g.closePath();
  g.fillPath();
  g.lineStyle(3, INK, 1);
  g.beginPath();
  g.arc(hx, hy, 21.5, Math.PI, Math.PI * 2, false);
  g.strokePath();
  if (style === 1) {
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + 0.35 + i * 0.6;
      const bx = hx + Math.cos(a) * 19;
      const by = hy + Math.sin(a) * 19;
      poly(
        g,
        [
          bx - 5,
          by + 2,
          bx + Math.cos(a) * 10,
          by + Math.sin(a) * 12 - 2,
          bx + 5,
          by + 2,
        ],
        color,
        INK,
        2.5,
      );
    }
  }
  // Tóc mái: vài búi tròn, chỉ viền phần cạnh dưới.
  const bumps = side
    ? [
        [hx + 2, hy - 9, 9],
        [hx + 13, hy - 7, 7],
      ]
    : [
        [hx - 12, hy - 8, 8.5],
        [hx, hy - 10, 8.5],
        [hx + 12, hy - 8, 8.5],
      ];
  for (const [x, y, r] of bumps) circ(g, x, y, r, color, null, 0);
  g.lineStyle(2.5, INK, 1);
  for (const [x, y, r] of bumps) {
    g.beginPath();
    g.arc(x, y, r, 0.15, Math.PI - 0.15, false);
    g.strokePath();
  }
}

function drawOutfit(g, acc, { side, back, oy }) {
  if (acc === "explorer") {
    if (side || back) {
      rr(
        g,
        side ? -10 : -17,
        -62 + oy,
        side ? 22 : 34,
        36,
        6,
        0x4f7a3a,
        INK,
        3,
      );
    } else {
      rr(g, -18, -63 + oy, 13, 38, 6, 0x4f7a3a, INK, 3);
      rr(g, 5, -63 + oy, 13, 38, 6, 0x4f7a3a, INK, 3);
      rr(g, -16, -42 + oy, 9, 8, 2, 0x3b5e2a, INK, 2);
      rr(g, 7, -42 + oy, 9, 8, 2, 0x3b5e2a, INK, 2);
    }
  } else if (acc === "inventor") {
    rr(g, side ? -13 : -20, -63 + oy, side ? 28 : 40, 48, 7, 0xffffff, INK, 3);
    if (!side && !back) {
      line(g, 0, -55 + oy, 0, -15 + oy, 0x9aa7b8, 2.5);
      circ(g, -5, -40 + oy, 1.8, 0x9aa7b8, null, 0);
      circ(g, 5, -40 + oy, 1.8, 0x9aa7b8, null, 0);
      rr(g, 7, -34 + oy, 9, 8, 1, 0xe8eef6, INK, 1.5);
    }
  } else if (acc === "scholar" && !back) {
    poly(
      g,
      [-3, -62 + oy, 3, -62 + oy, 7, -56 + oy, 0, -52 + oy, -7, -56 + oy],
      0xc0392b,
      INK,
      2,
    );
    circ(g, 0, -56 + oy, 2.5, 0x8e1f15, null, 0);
  } else if (acc === "leader") {
    if (side)
      poly(
        g,
        [-12, -62 + oy, -4, -62 + oy, 14, -28 + oy, 5, -28 + oy],
        0xffc83d,
        0xb86e00,
        2.5,
      );
    else
      poly(
        g,
        [-18, -62 + oy, -8, -62 + oy, 18, -30 + oy, 8, -28 + oy],
        0xffc83d,
        0xb86e00,
        2.5,
      );
    if (!back)
      poly(
        g,
        starPoints(side ? 5 : 6, -44 + oy, 6, 2.6),
        0xffffff,
        0xb86e00,
        1.5,
      );
  } else if (acc === "teacher" && !side && !back) {
    rr(g, -7, -62 + oy, 14, 6, 3, 0xffffff, INK, 2);
  }
}

function drawHeadgear(g, acc, hx, hy, side, back) {
  if (acc === "explorer") {
    ell(g, hx, hy - 15, 56, 11, 0xc9a45a, INK, 3);
    rr(g, hx - 15, hy - 33, 30, 21, 8, 0xd9b86a, INK, 3);
    rr(g, hx - 15, hy - 20, 30, 6, 0, 0x6b4a1f, null, 0);
  } else if (acc === "scholar") {
    rr(g, hx - 15, hy - 23, 30, 11, 3, 0x2b2b3a, INK, 3);
    poly(
      g,
      [hx - 30, hy - 24, hx, hy - 36, hx + 30, hy - 24, hx, hy - 14],
      0x3a3a4f,
      INK,
      3,
    );
    line(g, hx + 22, hy - 25, hx + 25, hy - 6, 0xffc83d, 3);
    circ(g, hx + 25, hy - 5, 3, 0xffc83d, null, 0);
  } else if (acc === "inventor") {
    line(g, hx - 21, hy - 13, hx + 21, hy - 13, 0x2a7f8f, 4);
    if (!back) {
      circ(g, hx - 8, hy - 15, 7, 0x7fd6e6, INK, 3);
      if (!side) circ(g, hx + 8, hy - 15, 7, 0x7fd6e6, INK, 3);
    }
  } else if (acc === "leader") {
    poly(
      g,
      [
        hx - 14,
        hy - 17,
        hx - 14,
        hy - 31,
        hx - 7,
        hy - 23,
        hx,
        hy - 34,
        hx + 7,
        hy - 23,
        hx + 14,
        hy - 31,
        hx + 14,
        hy - 17,
      ],
      0xffc83d,
      0xb86e00,
      3,
    );
  } else if (acc === "teacher") {
    circ(g, hx, hy - 25, 9, 0x5b3a29, INK, 3);
  }
}
