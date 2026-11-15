import test from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLES, constrainPosition, createBoard, isWithinSnap } from './puzzle.mjs';

const identity = { a: 1, b: 0, c: 0, d: 1 };
const target = { x: 100, y: 200 };

test('snapping includes exactly 15 CSS pixels but excludes farther and diagonal drops', () => {
  assert.equal(isWithinSnap({ x: 115, y: 200 }, target, identity), true);
  assert.equal(isWithinSnap({ x: 85, y: 200 }, target, identity), true);
  assert.equal(isWithinSnap({ x: 115.01, y: 200 }, target, identity), false);
  assert.equal(isWithinSnap({ x: 109, y: 212 }, target, identity), true);
  assert.equal(isWithinSnap({ x: 111, y: 211 }, target, identity), false);
});

test('the magnet radius stays 15 CSS pixels on scaled, rotated and stretched boards', () => {
  for (const scale of [.4, .75, 1, 1.5, 2]) {
    const matrix = { a: scale, b: 0, c: 0, d: scale };
    assert.equal(isWithinSnap({ x: 0, y: 15 / scale }, { x: 0, y: 0 }, matrix), true);
    assert.equal(isWithinSnap({ x: 0, y: 15.01 / scale }, { x: 0, y: 0 }, matrix), false);
  }
  assert.equal(isWithinSnap({ x: 7.5, y: 0 }, { x: 0, y: 0 }, { a: 0, b: 2, c: -2, d: 0 }), true);
  assert.equal(isWithinSnap({ x: 0, y: 8 }, { x: 0, y: 0 }, { a: .5, b: 0, c: 0, d: 2 }), false);
  assert.throws(() => isWithinSnap({ x: NaN, y: 0 }, target, identity), TypeError);
  assert.throws(() => isWithinSnap(target, target, { a: 0, b: 0, c: 0, d: 0 }), TypeError);
});

function area(points) {
  return Math.abs(points.reduce((sum, [x, y], index) => {
    const next = points[(index + 1) % points.length];
    return sum + x * next[1] - next[0] * y;
  }, 0)) / 2;
}

function overlaps(a, b) {
  for (const polygon of [a, b]) {
    for (let index = 0; index < polygon.length; index++) {
      const point = polygon[index];
      const next = polygon[(index + 1) % polygon.length];
      const axis = [next[1] - point[1], point[0] - next[0]];
      const project = (vertices) => vertices.map(([x, y]) => x * axis[0] + y * axis[1]);
      const first = project(a);
      const second = project(b);
      if (Math.max(...first) <= Math.min(...second) + 1e-7 || Math.max(...second) <= Math.min(...first) + 1e-7) return false;
    }
  }
  return true;
}

const at = (piece, position) => piece.points.map(([x, y]) => [x + position.x, y + position.y]);

test('every silhouette uses a complete, non-overlapping seven-piece tangram set', () => {
  for (const puzzle of PUZZLES) {
    assert.equal(puzzle.polygons.filter((polygon) => polygon.length === 3).length, 5);
    const areas = puzzle.polygons.map(area).sort((a, b) => a - b);
    [.5, .5, 1, 1, 1, 2, 2].forEach((expected, index) => {
      assert.ok(Math.abs(areas[index] - expected) < 1e-9, `${puzzle.id}: piece area ${areas[index]}`);
    });
    for (let first = 0; first < 7; first++) {
      for (let second = first + 1; second < 7; second++) {
        assert.equal(overlaps(puzzle.polygons[first], puzzle.polygons[second]), false, `${puzzle.id}: targets ${first + 1} and ${second + 1} overlap`);
      }
    }
  }
});

test('desktop and phone layouts keep every loose piece visible and clear of the silhouette', () => {
  for (const puzzle of PUZZLES) {
    for (const compact of [false, true]) {
      const board = createBoard(puzzle, compact);
      for (const piece of board.pieces) {
        assert.deepEqual(constrainPosition(piece.start, piece, board), piece.start, `${puzzle.id}: piece ${piece.number} starts outside board`);
        for (const other of board.pieces) {
          assert.equal(overlaps(at(piece, piece.start), at(other, other.target)), false, `${puzzle.id}: loose piece covers silhouette`);
          if (piece !== other) assert.equal(overlaps(at(piece, piece.start), at(other, other.start)), false, `${puzzle.id}: tray pieces overlap`);
        }
        const { frame } = board;
        const outside = piece.start.x + piece.width <= frame.x || piece.start.x >= frame.x + frame.width ||
          piece.start.y + piece.height <= frame.y || piece.start.y >= frame.y + frame.height;
        assert.ok(outside, `${puzzle.id}: piece ${piece.number} starts inside the outer frame`);
        assert.ok(piece.target.x >= frame.x && piece.target.y >= frame.y &&
          piece.target.x + piece.width <= frame.x + frame.width && piece.target.y + piece.height <= frame.y + frame.height);
        assert.equal(isWithinSnap(piece.target, piece.target, identity), true);
        assert.deepEqual(constrainPosition({ x: -500, y: 5000 }, piece, board), { x: 8, y: board.height - piece.height - 8 });
      }
    }
  }
});
