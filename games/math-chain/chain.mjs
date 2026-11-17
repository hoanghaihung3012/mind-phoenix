export const GRID_COLS = 6;
export const GRID_ROWS = 6;
export const DEFAULT_TARGET = 10;

export const BUBBLE_COLORS = [
  '',
  '#3b82f6', // 1: Blue
  '#06b6d4', // 2: Cyan
  '#10b981', // 3: Emerald
  '#84cc16', // 4: Lime
  '#f59e0b', // 5: Amber
  '#f97316', // 6: Orange
  '#ef4444', // 7: Red
  '#a855f7', // 8: Purple
  '#ec4899', // 9: Pink
];

export const LEVELS = [
  {
    id: 1,
    title: { vi: 'Khởi đầu: Mục tiêu 10', en: 'Start: Target 10' },
    hint: { vi: 'Nối các số liền kề sao cho tổng đúng bằng 10!', en: 'Chain adjacent numbers that sum up to 10!' },
    target: 10,
    targetType: 'fixed',
    goalScore: 300,
    timeLimit: 90,
  },
  {
    id: 2,
    title: { vi: 'Thử thách: Mục tiêu 12', en: 'Challenge: Target 12' },
    hint: { vi: 'Nối chuỗi dài 3 hoặc 4 số để nhận nhiều điểm hơn.', en: 'Connect 3 or 4 numbers for bigger combo points.' },
    target: 12,
    targetType: 'fixed',
    goalScore: 500,
    timeLimit: 90,
  },
  {
    id: 3,
    title: { vi: 'Năng lượng số 15', en: 'Power of 15' },
    hint: { vi: 'Tìm tổng bằng 15. Cố gắng tạo chuỗi từ 3 số trở lên!', en: 'Find sums of 15. Try chaining 3 or more numbers!' },
    target: 15,
    targetType: 'fixed',
    goalScore: 700,
    timeLimit: 85,
  },
  {
    id: 4,
    title: { vi: 'Mục tiêu 16 & Combo', en: 'Target 16 & Combos' },
    hint: { vi: 'Nối các số đạt tổng 16. Bom nổ sẽ dọn dẹp các ô xung quanh.', en: 'Reach 16. Bombs will blast surrounding cells.' },
    target: 16,
    targetType: 'fixed',
    goalScore: 900,
    timeLimit: 80,
  },
  {
    id: 5,
    title: { vi: 'Đỉnh cao: Mục tiêu 20', en: 'Peak: Target 20' },
    hint: { vi: 'Tổng lớn đòi hỏi chuỗi dài 4-5 số. Điểm thưởng cực cao!', en: 'Bigger sum requires 4-5 numbers with massive bonuses!' },
    target: 20,
    targetType: 'fixed',
    goalScore: 1200,
    timeLimit: 75,
  },
  {
    id: 6,
    title: { vi: 'Biến ảo số mục tiêu', en: 'Dynamic Targets' },
    hint: { vi: 'Số mục tiêu sẽ tự động đổi sau mỗi lần nổ thành công!', en: 'Target changes after each successful chain burst!' },
    target: 10,
    targetType: 'dynamic',
    targetsPool: [10, 11, 12, 13, 14, 15],
    goalScore: 1500,
    timeLimit: 70,
  },
  {
    id: 7,
    title: { vi: 'Bậc thầy Tính nhẩm Sigma', en: 'Sigma Mental Master' },
    hint: { vi: 'Đạt 2000 điểm trong thời gian giới hạn!', en: 'Reach 2000 points before time runs out!' },
    target: 12,
    targetType: 'dynamic',
    targetsPool: [12, 14, 15, 16, 18, 20],
    goalScore: 2000,
    timeLimit: 60,
  },
];

export function createRandomBubble(rng = Math.random) {
  // Numbers 1 to 9 with weighted probability
  // 1-5 are slightly more frequent to allow flexible summing
  const weights = [0, 18, 16, 15, 14, 12, 9, 7, 5, 4];
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = rng() * total;
  let val = 1;
  for (let i = 1; i <= 9; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      val = i;
      break;
    }
  }

  // 4% chance of being a bomb
  const isBomb = rng() < 0.04;

  return {
    value: val,
    color: BUBBLE_COLORS[val],
    isBomb,
    id: Math.random().toString(36).substring(2, 9),
  };
}

export function createBoard(cols = GRID_COLS, rows = GRID_ROWS, rng = Math.random) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(createRandomBubble(rng));
    }
    grid.push(row);
  }
  return grid;
}

export function isAdjacent(p1, p2) {
  if (!p1 || !p2) return false;
  const dx = Math.abs(p1.c - p2.c);
  const dy = Math.abs(p1.r - p2.r);
  return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
}

export function isValidChain(chain, board) {
  if (!Array.isArray(chain) || chain.length < 2) return false;
  const visited = new Set();

  for (let i = 0; i < chain.length; i++) {
    const pos = chain[i];
    if (!pos || pos.r < 0 || pos.r >= board.length || pos.c < 0 || pos.c >= board[0].length) {
      return false;
    }
    const key = `${pos.r},${pos.c}`;
    if (visited.has(key)) return false; // Duplicate cell
    visited.add(key);

    if (i > 0) {
      if (!isAdjacent(chain[i - 1], pos)) return false;
    }
  }
  return true;
}

export function calculateChainSum(chain, board) {
  let sum = 0;
  for (const pos of chain) {
    const cell = board[pos.r]?.[pos.c];
    if (cell && Number.isInteger(cell.value)) {
      sum += cell.value;
    }
  }
  return sum;
}

export function calculatePoints(chainLength, hasBomb = false) {
  // Base points: 10 per bubble
  // Length multipliers: 2->1x, 3->1.5x, 4->2x, 5->3x, 6+->4x
  const base = chainLength * 10;
  let multiplier = 1;
  if (chainLength === 3) multiplier = 1.5;
  else if (chainLength === 4) multiplier = 2;
  else if (chainLength === 5) multiplier = 3;
  else if (chainLength >= 6) multiplier = 4;

  const bombBonus = hasBomb ? 50 : 0;
  return Math.round(base * multiplier + bombBonus);
}

export function evaluateChain(chain, board, target) {
  if (!isValidChain(chain, board)) {
    return { valid: false, sum: 0, match: false, points: 0 };
  }
  const sum = calculateChainSum(chain, board);
  const match = sum === target;
  const hasBomb = chain.some((pos) => board[pos.r]?.[pos.c]?.isBomb);
  const points = match ? calculatePoints(chain.length, hasBomb) : 0;

  return {
    valid: true,
    sum,
    match,
    points,
    length: chain.length,
    hasBomb,
  };
}

export function getSurroundingCells(pos, cols = GRID_COLS, rows = GRID_ROWS) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = pos.r + dr;
      const nc = pos.c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        result.push({ r: nr, c: nc });
      }
    }
  }
  return result;
}

/**
 * Removes matched bubbles (and bomb splash), then collapses the grid down with gravity
 * and fills top with new random bubbles.
 */
export function collapseBoard(board, chain, rng = Math.random) {
  const rows = board.length;
  const cols = board[0].length;
  const removeSet = new Set();

  chain.forEach((pos) => {
    removeSet.add(`${pos.r},${pos.c}`);
    if (board[pos.r]?.[pos.c]?.isBomb) {
      // Explode 3x3 surrounding
      const splash = getSurroundingCells(pos, cols, rows);
      splash.forEach((s) => removeSet.add(`${s.r},${s.c}`));
    }
  });

  const nextBoard = [];
  for (let r = 0; r < rows; r++) {
    nextBoard.push([...board[r]]);
  }

  // Clear removed cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (removeSet.has(`${r},${c}`)) {
        nextBoard[r][c] = null;
      }
    }
  }

  // Gravity: shift non-null bubbles down per column
  for (let c = 0; c < cols; c++) {
    const survivors = [];
    for (let r = rows - 1; r >= 0; r--) {
      if (nextBoard[r][c] !== null) {
        survivors.push(nextBoard[r][c]);
      }
    }

    // Place survivors from bottom up
    let writeRow = rows - 1;
    for (const bubble of survivors) {
      nextBoard[writeRow][c] = bubble;
      writeRow--;
    }

    // Fill the empty top spots with new bubbles
    while (writeRow >= 0) {
      nextBoard[writeRow][c] = createRandomBubble(rng);
      writeRow--;
    }
  }

  return {
    board: nextBoard,
    clearedCount: removeSet.size,
  };
}

/**
 * Searches for at least one valid chain that sums to target.
 * Uses DFS with depth limit to quickly detect if board has any moves.
 */
export function hasPossibleMove(board, target, maxDepth = 5) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(curr, currentSum, visited, depth) {
    if (currentSum === target && visited.size >= 2) return true;
    if (currentSum > target || depth >= maxDepth) return false;

    const neighbors = getSurroundingCells(curr, cols, rows);
    for (const n of neighbors) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key) && isAdjacent(curr, n)) {
        visited.add(key);
        const nextVal = board[n.r][n.c].value;
        if (dfs(n, currentSum + nextVal, visited, depth + 1)) return true;
        visited.delete(key);
      }
    }
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const start = { r, c };
      const visited = new Set([`${r},${c}`]);
      if (dfs(start, board[r][c].value, visited, 1)) {
        return true;
      }
    }
  }
  return false;
}
