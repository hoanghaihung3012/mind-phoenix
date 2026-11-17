import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBoard,
  isAdjacent,
  isValidChain,
  calculateChainSum,
  calculatePoints,
  evaluateChain,
  collapseBoard,
  hasPossibleMove,
  LEVELS,
} from './chain.mjs';

test('createBoard generates correct rows and columns with valid numbers 1-9', () => {
  const board = createBoard(6, 6);
  assert.equal(board.length, 6);
  assert.equal(board[0].length, 6);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const b = board[r][c];
      assert.ok(b.value >= 1 && b.value <= 9);
      assert.ok(typeof b.color === 'string');
    }
  }
});

test('isAdjacent correctly detects orthogonal and diagonal neighbors and rejects non-neighbors', () => {
  const center = { r: 2, c: 2 };
  // Orthogonal
  assert.equal(isAdjacent(center, { r: 1, c: 2 }), true);
  assert.equal(isAdjacent(center, { r: 3, c: 2 }), true);
  assert.equal(isAdjacent(center, { r: 2, c: 1 }), true);
  assert.equal(isAdjacent(center, { r: 2, c: 3 }), true);
  // Diagonal
  assert.equal(isAdjacent(center, { r: 1, c: 1 }), true);
  assert.equal(isAdjacent(center, { r: 3, c: 3 }), true);
  // Same cell
  assert.equal(isAdjacent(center, { r: 2, c: 2 }), false);
  // Too far
  assert.equal(isAdjacent(center, { r: 0, c: 2 }), false);
  assert.equal(isAdjacent(center, { r: 4, c: 4 }), false);
});

test('isValidChain rejects single items, duplicate cells, and disconnected steps', () => {
  const board = createBoard(4, 4);
  // Single item rejected
  assert.equal(isValidChain([{ r: 0, c: 0 }], board), false);
  // Valid 2 items
  assert.equal(isValidChain([{ r: 0, c: 0 }, { r: 0, c: 1 }], board), true);
  // Duplicate cell rejected
  assert.equal(isValidChain([{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 0 }], board), false);
  // Disconnected cell rejected
  assert.equal(isValidChain([{ r: 0, c: 0 }, { r: 2, c: 2 }], board), false);
});

test('calculateChainSum and evaluateChain verify matching target sum and scoring bonuses', () => {
  const board = [
    [{ value: 3 }, { value: 7 }, { value: 2 }],
    [{ value: 5 }, { value: 2 }, { value: 1 }],
    [{ value: 4 }, { value: 6 }, { value: 9 }],
  ];

  const chain = [{ r: 0, c: 0 }, { r: 0, c: 1 }]; // 3 + 7 = 10
  assert.equal(calculateChainSum(chain, board), 10);

  const evalMatch = evaluateChain(chain, board, 10);
  assert.equal(evalMatch.valid, true);
  assert.equal(evalMatch.match, true);
  assert.equal(evalMatch.sum, 10);
  assert.equal(evalMatch.points, 20); // 2 * 10 * 1

  const evalMismatch = evaluateChain(chain, board, 12);
  assert.equal(evalMismatch.match, false);
  assert.equal(evalMismatch.points, 0);

  // Longer chain bonus
  const longChain = [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 0, c: 2 }]; // 3 + 2 + 1 + 2 = 8
  const evalLong = evaluateChain(longChain, board, 8);
  assert.equal(evalLong.match, true);
  assert.equal(evalLong.points, 80); // 4 * 10 * 2 = 80
});

test('collapseBoard collapses columns down and fills new bubbles on top', () => {
  const board = [
    [{ value: 1 }, { value: 2 }],
    [{ value: 3 }, { value: 4 }],
    [{ value: 5 }, { value: 6 }],
  ];

  // Remove bottom row: (2,0) and (2,1)
  const chain = [{ r: 2, c: 0 }, { r: 2, c: 1 }];
  const { board: nextBoard, clearedCount } = collapseBoard(board, chain);

  assert.equal(clearedCount, 2);
  // Old (1,0) value 3 falls to (2,0)
  assert.equal(nextBoard[2][0].value, 3);
  // Old (0,0) value 1 falls to (1,0)
  assert.equal(nextBoard[1][0].value, 1);
  // (0,0) is newly generated and non-null
  assert.ok(nextBoard[0][0].value >= 1 && nextBoard[0][0].value <= 9);
});

test('bomb bubble destroys 3x3 surrounding cells on match', () => {
  const board = [
    [{ value: 2 }, { value: 2 }, { value: 2 }],
    [{ value: 2 }, { value: 6, isBomb: true }, { value: 2 }],
    [{ value: 2 }, { value: 2 }, { value: 2 }],
  ];

  // Chain matching 6 + 2 = 8 containing the bomb
  const chain = [{ r: 1, c: 1 }, { r: 0, c: 0 }];
  const { clearedCount } = collapseBoard(board, chain);
  // All 9 cells inside 3x3 exploded!
  assert.equal(clearedCount, 9);
});

test('hasPossibleMove detects existing valid targets', () => {
  const board = [
    [{ value: 5 }, { value: 5 }],
    [{ value: 1 }, { value: 1 }],
  ];
  assert.equal(hasPossibleMove(board, 10), true); // 5 + 5 = 10
  assert.equal(hasPossibleMove(board, 99), false);
});
