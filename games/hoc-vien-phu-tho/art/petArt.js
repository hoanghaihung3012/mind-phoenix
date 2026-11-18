import { INK, circ, ell, line, poly, rr } from "./draw.js";

/** Vẽ thú cưng quay sang phải. Gốc tọa độ ở giữa hai chân, cao khoảng 44 px. */
const PETS = {
  duck(g) {
    poly(g, [-17, -20, -28, -30, -20, -12], 0xf2c230, INK, 2.5);
    ell(g, 0, -17, 36, 27, 0xffd84a, INK, 3);
    ell(g, -3, -16, 18, 12, 0xf2c230, INK, 2.5);
    circ(g, 13, -33, 11, 0xffd84a, INK, 3);
    ell(g, 24, -30, 14, 7, 0xff8a3d, INK, 2.5);
    circ(g, 16, -36, 2.6, INK, null, 0);
    line(g, -4, -4, -4, 0, 0xff8a3d, 3);
    line(g, 6, -4, 6, 0, 0xff8a3d, 3);
    ell(g, -4, 0, 9, 4, 0xff8a3d, INK, 2);
    ell(g, 7, 0, 9, 4, 0xff8a3d, INK, 2);
  },
  dog(g) {
    ell(g, -17, -25, 7, 15, 0xc08a52, INK, 2.5);
    for (const x of [-12, 8]) rr(g, x - 4, -12, 8, 12, 3, 0xc08a52, INK, 2.5);
    ell(g, 0, -18, 38, 24, 0xd9a566, INK, 3);
    circ(g, 14, -32, 12, 0xd9a566, INK, 3);
    ell(g, 6, -38, 8, 16, 0x8a5a2b, INK, 2.5);
    ell(g, 21, -29, 12, 9, 0xf3dcb8, INK, 2.5);
    circ(g, 26, -31, 2.6, INK, null, 0);
    circ(g, 14, -36, 2.4, INK, null, 0);
    rr(g, 18, -26, 6, 3, 1, 0xe57373, null, 0);
  },
  chicken(g) {
    poly(g, [-17, -24, -30, -36, -26, -18, -32, -22], 0xf2e6c9, INK, 2.5);
    ell(g, 0, -19, 34, 30, 0xfff4d6, INK, 3);
    ell(g, -4, -18, 18, 14, 0xf2e0b0, INK, 2.5);
    circ(g, 12, -36, 10, 0xfff4d6, INK, 3);
    circ(g, 8, -47, 4, 0xe53935, INK, 2);
    circ(g, 13, -48, 4.5, 0xe53935, INK, 2);
    circ(g, 18, -46, 4, 0xe53935, INK, 2);
    poly(g, [20, -37, 29, -34, 20, -31], 0xff9800, INK, 2.5);
    circ(g, 19, -29, 3, 0xe53935, INK, 1.5);
    circ(g, 15, -39, 2.4, INK, null, 0);
    line(g, -5, -4, -5, 0, 0xff9800, 3);
    line(g, 6, -4, 6, 0, 0xff9800, 3);
  },
  rabbit(g) {
    ell(g, 6, -42, 8, 24, 0xffffff, INK, 2.5);
    ell(g, 6, -42, 3.5, 17, 0xffb7c5, null, 0);
    ell(g, 16, -41, 8, 22, 0xffffff, INK, 2.5);
    ell(g, 16, -41, 3.5, 16, 0xffb7c5, null, 0);
    circ(g, -17, -17, 7, 0xffffff, INK, 2.5);
    ell(g, 0, -15, 34, 24, 0xffffff, INK, 3);
    circ(g, 13, -27, 11, 0xffffff, INK, 3);
    ell(g, 8, -3, 11, 7, 0xffffff, INK, 2.5);
    ell(g, -8, -2, 11, 6, 0xffffff, INK, 2.5);
    circ(g, 19, -28, 2.6, INK, null, 0);
    circ(g, 23, -24, 2.4, 0xff8fab, INK, 1.2);
    circ(g, 17, -22, 3, 0xffb7c5, null, 0, 0.7);
  },
};

export const PET_KEYS = Object.keys(PETS);

export function drawPet(g, kind) {
  g.clear();
  ell(g, 0, 1, 36, 8, 0x000000, null, 0, 0.18);
  (PETS[kind] ?? PETS.duck)(g);
}
