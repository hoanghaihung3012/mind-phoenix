export const SNAP_DISTANCE = 15;

const pieceTypes = [
  { id: 'large-1', name: 'Tam giác lớn', color: '#ef8276' },
  { id: 'large-2', name: 'Tam giác lớn', color: '#efc45d' },
  { id: 'medium', name: 'Tam giác vừa', color: '#ac99d5' },
  { id: 'square', name: 'Hình vuông', color: '#7bbfa7' },
  { id: 'parallelogram', name: 'Hình bình hành', color: '#82b6d5' },
  { id: 'small-1', name: 'Tam giác nhỏ', color: '#eca36c' },
  { id: 'small-2', name: 'Tam giác nhỏ', color: '#d98eb5' }
];
const diagonal = Math.SQRT1_2;

export const PUZZLES = [
  {
    id: 'boat',
    name: 'Thuyền buồm',
    caption: 'Cùng ra khơi nào!',
    celebration: 'Thuyền đã căng buồm. Cùng mang trí tưởng tượng ra khơi nào!',
    polygons: [
      [[.5, 2], [2.5, 2], [2.5, 0]],
      [[2.5, 0], [2.5, 2], [4.5, 2]],
      [[0, 2], [2, 2], [1, 3]],
      [[3, 2], [4, 2], [4, 3], [3, 3]],
      [[2, 2], [3, 2], [2, 3], [1, 3]],
      [[3, 2], [3, 3], [2, 3]],
      [[4, 2], [5, 2], [4, 3]]
    ]
  },
  {
    id: 'cat',
    name: 'Chú mèo',
    caption: 'Một người bạn nhỏ',
    celebration: 'Meo meo! Bé vừa ghép nên một người bạn thật đáng yêu.',
    polygons: [
      [[2 - diagonal, 1 + diagonal], [2 - diagonal, 3 + diagonal], [4 - diagonal, 3 + diagonal]],
      [[2 - diagonal, 1 + diagonal], [2 - diagonal, 3 + diagonal], [-diagonal, 3 + diagonal]],
      [[3 - diagonal, 2 + diagonal], [5 - diagonal, 2 + diagonal], [4 - diagonal, 3 + diagonal]],
      [[2, 1], [2 + diagonal, 1 + diagonal], [2, 1 + 2 * diagonal], [2 - diagonal, 1 + diagonal]],
      [[-1 - diagonal, 3 + diagonal], [-diagonal, 2 + diagonal], [1 - diagonal, 2 + diagonal], [-diagonal, 3 + diagonal]],
      [[2, 1], [2 - diagonal, 1 - diagonal], [2 - diagonal, 1 + diagonal]],
      [[2, 1], [2 + diagonal, 1 + diagonal], [2 + diagonal, 1 - diagonal]]
    ]
  },
  {
    id: 'house',
    name: 'Ngôi nhà',
    caption: 'Mái ấm đầy màu sắc',
    celebration: 'Một ngôi nhà rực rỡ đã sẵn sàng. Bé là kiến trúc sư tài ba!',
    polygons: [
      [[0, 2], [2, 2], [2, 0]],
      [[2, 0], [2, 2], [4, 2]],
      [[0, 2], [2, 2], [1, 3]],
      [[3, 2], [4, 2], [4, 3], [3, 3]],
      [[2, 2], [3, 2], [2, 3], [1, 3]],
      [[0, 2], [1, 3], [0, 3]],
      [[3, 2], [3, 3], [2, 3]]
    ]
  }
];

function bounds(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function createBoard(puzzle, compact = false) {
  const width = compact ? 420 : 900;
  const height = compact ? 500 : 600;
  const center = { x: width / 2, y: compact ? 229 : 294 };
  const slots = compact
    ? [[72, 66], [348, 66], [74, 389], [377, 241], [211, 414], [46, 249], [348, 390]]
    : [[110, 137], [784, 144], [100, 338], [796, 333], [188, 499], [445, 532], [704, 500]];
  const silhouette = bounds(puzzle.polygons.flat());
  const scale = Math.min((compact ? 230 : 340) / silhouette.width, (compact ? 205 : 275) / silhouette.height);
  const origin = {
    x: center.x - silhouette.width * scale / 2 - silhouette.x * scale,
    y: center.y - silhouette.height * scale / 2 - silhouette.y * scale
  };
  const pieces = puzzle.polygons.map((polygon, index) => {
    const box = bounds(polygon);
    const pieceWidth = box.width * scale;
    const pieceHeight = box.height * scale;
    return {
      ...pieceTypes[index],
      number: index + 1,
      width: pieceWidth,
      height: pieceHeight,
      points: polygon.map(([x, y]) => [(x - box.x) * scale, (y - box.y) * scale]),
      target: { x: origin.x + box.x * scale, y: origin.y + box.y * scale },
      start: { x: slots[index][0] - pieceWidth / 2, y: slots[index][1] - pieceHeight / 2 }
    };
  });
  return { width, height, center, pieces };
}

export function constrainPosition(position, piece, board) {
  return {
    x: Math.max(8, Math.min(board.width - piece.width - 8, position.x)),
    y: Math.max(8, Math.min(board.height - piece.height - 8, position.y))
  };
}

export function isWithinSnap(position, target, matrix) {
  const values = [position.x, position.y, target.x, target.y, matrix.a, matrix.b, matrix.c, matrix.d];
  if (!values.every(Number.isFinite) || matrix.a * matrix.d - matrix.b * matrix.c === 0) {
    throw new TypeError('Tọa độ hoặc tỉ lệ bảng ghép không hợp lệ.');
  }
  const dx = position.x - target.x;
  const dy = position.y - target.y;
  // The screen matrix keeps the magnet radius at 15 CSS pixels, not SVG units.
  return Math.hypot(dx * matrix.a + dy * matrix.c, dx * matrix.b + dy * matrix.d) <= SNAP_DISTANCE;
}
