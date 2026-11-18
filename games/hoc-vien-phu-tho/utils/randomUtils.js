/** Bộ sinh số ngẫu nhiên có hạt giống (dùng cho kiểm thử và bản đồ cố định). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates trên bản sao, không làm thay đổi mảng gốc. */
export function shuffle(items, rng = Math.random) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandom(items, rng = Math.random) {
  if (!items.length) return undefined;
  return items[Math.floor(rng() * items.length)];
}

export function sample(items, count, rng = Math.random) {
  return shuffle(items, rng).slice(0, count);
}

export function randomInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randomRange(min, max, rng = Math.random) {
  return min + rng() * (max - min);
}
