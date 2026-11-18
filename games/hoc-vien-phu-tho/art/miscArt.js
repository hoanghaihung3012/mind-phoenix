import {
  INK,
  circ,
  ell,
  line,
  makeTexture,
  poly,
  rr,
  starPoints,
} from "./draw.js";

function balloon(scene) {
  makeTexture(scene, "balloon", 130, 200, (g) => {
    line(g, 65, 148, 58, 164, 0x6b7685, 3);
    line(g, 58, 164, 72, 180, 0x6b7685, 3);
    line(g, 72, 180, 65, 198, 0x6b7685, 3);
    ell(g, 65, 70, 112, 134, 0xf2f2f2, INK, 4);
    ell(g, 65, 88, 96, 98, 0xd8d8d8, null, 0, 0.55);
    ell(g, 65, 70, 110, 132, 0xf2f2f2, null, 0, 0.0);
    ell(g, 40, 38, 22, 34, 0xffffff, null, 0, 0.85);
    poly(g, [65, 134, 55, 150, 75, 150], 0xf2f2f2, INK, 3);
  });
}

function chests(scene) {
  makeTexture(scene, "chest-closed", 150, 120, (g) => {
    ell(g, 75, 112, 130, 14, 0x000000, null, 0, 0.2);
    rr(g, 10, 52, 130, 58, 10, 0xb5651d, INK, 4);
    rr(g, 10, 24, 130, 44, 20, 0x9c5414, INK, 4);
    rr(g, 62, 24, 26, 86, 4, 0xffc83d, 0xb86e00, 3);
    rr(g, 14, 62, 14, 40, 3, 0xffc83d, 0xb86e00, 2);
    rr(g, 122, 62, 14, 40, 3, 0xffc83d, 0xb86e00, 2);
    circ(g, 75, 68, 10, 0xffe066, 0xb86e00, 3);
    rr(g, 73, 66, 4, 9, 1, INK, null, 0);
  });
  makeTexture(scene, "chest-open", 150, 120, (g) => {
    ell(g, 75, 112, 130, 14, 0x000000, null, 0, 0.2);
    rr(g, 16, 2, 118, 38, 18, 0x9c5414, INK, 4);
    rr(g, 66, 2, 18, 38, 3, 0xffc83d, 0xb86e00, 3);
    rr(g, 10, 52, 130, 58, 10, 0xb5651d, INK, 4);
    rr(g, 18, 40, 114, 26, 8, 0x4a2a0a, INK, 3);
    for (const [x, y] of [
      [40, 44],
      [62, 40],
      [86, 42],
      [108, 45],
      [74, 47],
      [52, 48],
      [98, 48],
    ])
      circ(g, x, y, 8, 0xffd23f, 0xb86e00, 2.5);
    rr(g, 62, 66, 26, 44, 4, 0xffc83d, 0xb86e00, 3);
    rr(g, 14, 70, 14, 32, 3, 0xffc83d, 0xb86e00, 2);
    rr(g, 122, 70, 14, 32, 3, 0xffc83d, 0xb86e00, 2);
  });
}

function crosshair(scene) {
  makeTexture(scene, "crosshair", 88, 88, (g) => {
    circ(g, 44, 44, 28, null, INK, 9);
    circ(g, 44, 44, 28, null, 0xffffff, 4.5);
    for (const [x1, y1, x2, y2] of [
      [44, 4, 44, 22],
      [44, 66, 44, 84],
      [4, 44, 22, 44],
      [66, 44, 84, 44],
    ]) {
      line(g, x1, y1, x2, y2, INK, 8);
      line(g, x1, y1, x2, y2, 0xffffff, 4);
    }
    circ(g, 44, 44, 4, 0xe4572e, INK, 2);
  });
}

function particles(scene) {
  makeTexture(scene, "confetti", 14, 9, (g) =>
    rr(g, 0, 0, 14, 9, 2, 0xffffff, null, 0),
  );
  makeTexture(scene, "spark", 24, 24, (g) =>
    poly(g, starPoints(12, 12, 11, 4.5), 0xffffff, null, 0),
  );
  makeTexture(scene, "fx-leaf", 20, 14, (g) => {
    ell(g, 10, 7, 18, 10, 0x58b947, INK, 1.5);
    line(g, 3, 7, 17, 7, 0x2e7d32, 1.5);
  });
  makeTexture(scene, "fx-bubble", 22, 22, (g) => {
    circ(g, 11, 11, 9, 0xbfe8ff, 0x5aa9d6, 1.5, 0.55);
    circ(g, 8, 8, 2.2, 0xffffff, null, 0);
  });
  makeTexture(scene, "pixel", 4, 4, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
  });
  makeTexture(scene, "glow", 160, 160, (g) => {
    for (let i = 0; i < 16; i++)
      circ(g, 80, 80, 78 - i * 4.6, 0xfff2b3, null, 0, 0.06 + i * 0.012);
  });
}

export function generateMiscTextures(scene) {
  balloon(scene);
  chests(scene);
  crosshair(scene);
  particles(scene);
}
