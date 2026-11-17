export const DIRECTIONS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

export const DIR_VECTORS = [
  { dx: 0, dy: -1 }, // UP
  { dx: 1, dy: 0 },  // RIGHT
  { dx: 0, dy: 1 },  // DOWN
  { dx: -1, dy: 0 }, // LEFT
];

export const DIR_NAMES = ['up', 'right', 'down', 'left'];

export const COMMANDS = {
  FORWARD: 'forward',
  TURN_LEFT: 'turn-left',
  TURN_RIGHT: 'turn-right',
  JUMP: 'jump',
  REPEAT_2: 'repeat-2',
  REPEAT_3: 'repeat-3',
  REPEAT_4: 'repeat-4',
};

export const MAX_EXECUTION_STEPS = 200;

export const LEVELS = [
  {
    id: 1,
    title: { vi: 'Bước đầu tiên', en: 'First Steps' },
    hint: { vi: 'Thêm 2 lệnh Tiến về phía trước để Cmd cắm sạc!', en: 'Add 2 Move Forward commands to charge Cmd!' },
    width: 5,
    height: 3,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 3, y: 1 },
    stars: [{ x: 2, y: 1 }],
    walls: [],
    bugs: [],
    availableCommands: ['forward'],
    maxCommands: 3,
  },
  {
    id: 2,
    title: { vi: 'Khúc cua đầu tiên', en: 'First Turn' },
    hint: { vi: 'Tiến lên, rẽ phải rồi tiến tiếp để về đích.', en: 'Move forward, turn right, then move again.' },
    width: 4,
    height: 4,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 2, y: 2 },
    stars: [{ x: 2, y: 1 }],
    walls: [{ x: 1, y: 2 }],
    bugs: [],
    availableCommands: ['forward', 'turn-left', 'turn-right'],
    maxCommands: 4,
  },
  {
    id: 3,
    title: { vi: 'Thu thập vi mạch sao', en: 'Collecting Star Chips' },
    hint: { vi: 'Ăn hết cả 2 ngôi sao trước khi đến ổ cắm nhé!', en: 'Collect both stars before reaching the socket!' },
    width: 5,
    height: 4,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 3, y: 3 },
    stars: [{ x: 3, y: 1 }, { x: 3, y: 2 }],
    walls: [{ x: 2, y: 2 }],
    bugs: [],
    availableCommands: ['forward', 'turn-left', 'turn-right'],
    maxCommands: 6,
  },
  {
    id: 4,
    title: { vi: 'Cảnh báo: Bọ Bug!', en: 'Warning: Bugs Ahead!' },
    hint: { vi: 'Đừng bước vào ô chú bọ màu đỏ, hãy đi vòng qua nó.', en: 'Do not step on the red bug; walk around it.' },
    width: 5,
    height: 5,
    start: { x: 1, y: 3, dir: DIRECTIONS.UP },
    goal: { x: 3, y: 1 },
    stars: [{ x: 1, y: 1 }, { x: 2, y: 1 }],
    walls: [{ x: 2, y: 3 }],
    bugs: [{ x: 1, y: 2 }],
    availableCommands: ['forward', 'turn-left', 'turn-right'],
    maxCommands: 8,
  },
  {
    id: 5,
    title: { vi: 'Cú nhảy siêu đẳng', en: 'Super Jump' },
    hint: { vi: 'Dùng lệnh Nhảy để vượt qua bức tường thấp!', en: 'Use the Jump command to leap over the wall!' },
    width: 6,
    height: 3,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 4, y: 1 },
    stars: [{ x: 2, y: 1 }],
    walls: [{ x: 2, y: 1, jumpable: true }],
    bugs: [],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'jump'],
    maxCommands: 4,
  },
  {
    id: 6,
    title: { vi: 'Nhảy qua hố bọ', en: 'Bug Hop' },
    hint: { vi: 'Nhảy qua chú bọ nằm chắn đường!', en: 'Jump over the bug blocking your path!' },
    width: 6,
    height: 4,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 4, y: 2 },
    stars: [{ x: 4, y: 1 }],
    walls: [{ x: 2, y: 2 }],
    bugs: [{ x: 2, y: 1 }],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'jump'],
    maxCommands: 5,
  },
  {
    id: 7,
    title: { vi: 'Vòng lặp thần kỳ (Repeat 3x)', en: 'Magic Loops (Repeat 3x)' },
    hint: { vi: 'Dùng khối Lặp lại 3 lần để đi thẳng mà không tốn nhiều lệnh.', en: 'Use Repeat 3x to go straight with fewer blocks.' },
    width: 6,
    height: 3,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 4, y: 1 },
    stars: [{ x: 2, y: 1 }, { x: 3, y: 1 }],
    walls: [],
    bugs: [],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'repeat-3'],
    maxCommands: 2,
  },
  {
    id: 8,
    title: { vi: 'Cầu thang thuật toán', en: 'Algorithm Stairs' },
    hint: { vi: 'Lặp lại chuỗi: Tiến ➔ Rẽ phải ➔ Tiến ➔ Rẽ trái.', en: 'Repeat pattern: Forward ➔ Turn Right ➔ Forward ➔ Turn Left.' },
    width: 5,
    height: 5,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 3, y: 3 },
    stars: [{ x: 2, y: 1 }, { x: 3, y: 2 }],
    walls: [{ x: 1, y: 2 }, { x: 2, y: 3 }],
    bugs: [],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'repeat-2'],
    maxCommands: 5,
  },
  {
    id: 9,
    title: { vi: 'Vòng xoáy ốc', en: 'Spiral Maze' },
    hint: { vi: 'Đi men theo bức tường để thu thập đủ 3 sao.', en: 'Follow the perimeter to collect all 3 stars.' },
    width: 5,
    height: 5,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 2, y: 2 },
    stars: [{ x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }],
    walls: [{ x: 2, y: 1 }, { x: 2, y: 3 }],
    bugs: [{ x: 3, y: 2 }],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'jump', 'repeat-2', 'repeat-3'],
    maxCommands: 10,
  },
  {
    id: 10,
    title: { vi: 'Cổng dịch chuyển thời gian', en: 'Teleport Portal' },
    hint: { vi: 'Bước vào cổng xanh để bay tức thì sang cổng tím!', en: 'Step into the blue portal to warp to the purple portal!' },
    width: 6,
    height: 5,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 4, y: 3 },
    stars: [{ x: 2, y: 1 }, { x: 4, y: 2 }],
    walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
    bugs: [{ x: 1, y: 3 }],
    teleports: [{ from: { x: 3, y: 1 }, to: { x: 2, y: 3 } }],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'jump'],
    maxCommands: 7,
  },
  {
    id: 11,
    title: { vi: 'Khu rừng Bug và Đá', en: 'The Bug Jungle' },
    hint: { vi: 'Kết hợp nhảy, né bọ và gom đủ sao.', en: 'Combine jumping, bug avoidance and star collection.' },
    width: 6,
    height: 6,
    start: { x: 1, y: 4, dir: DIRECTIONS.UP },
    goal: { x: 4, y: 1 },
    stars: [{ x: 1, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 4 }],
    walls: [{ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 1, jumpable: true }],
    bugs: [{ x: 1, y: 2 }, { x: 4, y: 3 }],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'jump', 'repeat-2', 'repeat-3'],
    maxCommands: 12,
  },
  {
    id: 12,
    title: { vi: 'Bậc thầy Lập trình viên', en: 'Master Coder' },
    hint: { vi: 'Thu thập tất cả 3 ngôi sao và cắm sạc pin với số lệnh ít nhất!', en: 'Collect all 3 stars and plug in with the fewest blocks!' },
    width: 6,
    height: 6,
    start: { x: 1, y: 1, dir: DIRECTIONS.RIGHT },
    goal: { x: 4, y: 4 },
    stars: [{ x: 4, y: 1 }, { x: 2, y: 3 }, { x: 1, y: 4 }],
    walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 4 }],
    bugs: [{ x: 3, y: 1 }, { x: 2, y: 4 }],
    teleports: [{ from: { x: 4, y: 2 }, to: { x: 1, y: 3 } }],
    availableCommands: ['forward', 'turn-left', 'turn-right', 'jump', 'repeat-2', 'repeat-3', 'repeat-4'],
    maxCommands: 14,
  },
];

/**
 * Expands nested loop commands into an executable flat sequence
 * while preserving tracking information for UI debugging.
 */
export function expandCommands(commands, parentIndex = null) {
  const result = [];
  commands.forEach((cmd, idx) => {
    const rawId = parentIndex !== null ? `${parentIndex}.${idx}` : `${idx}`;
    if (typeof cmd === 'string') {
      result.push({ type: cmd, id: rawId, originalIndex: idx });
    } else if (cmd && typeof cmd === 'object') {
      const type = cmd.type;
      const countMatch = type.match(/^repeat-(\d+)$/);
      if (countMatch && Array.isArray(cmd.body) && cmd.body.length > 0) {
        const times = parseInt(countMatch[1], 10);
        for (let t = 0; t < times; t++) {
          const subExpanded = expandCommands(cmd.body, `${rawId}[${t}]`);
          result.push(...subExpanded);
        }
      } else {
        result.push({ ...cmd, id: rawId, originalIndex: idx });
      }
    }
  });
  return result;
}

export function isSamePos(p1, p2) {
  return p1 && p2 && p1.x === p2.x && p1.y === p2.y;
}

export function findPos(list, target) {
  return list.find((item) => isSamePos(item, target));
}

export function getLevel(levelId) {
  return LEVELS.find((lvl) => lvl.id === levelId) || LEVELS[0];
}

/**
 * Simulates bot commands on a given level.
 * Returns history of all frames for smooth playback and ultimate status.
 */
export function simulate(level, rawCommands) {
  const flatCommands = expandCommands(rawCommands);
  const steps = [];

  let x = level.start.x;
  let y = level.start.y;
  let dir = level.start.dir;
  const collectedStars = new Set();
  const walls = level.walls || [];
  const bugs = level.bugs || [];
  const teleports = level.teleports || [];

  // Initial starting frame
  steps.push({
    stepIndex: 0,
    commandId: null,
    commandType: null,
    x,
    y,
    dir,
    action: 'start',
    collectedStarsCount: 0,
    status: 'running',
    message: '',
  });

  let status = 'running';
  let message = '';

  for (let i = 0; i < flatCommands.length; i++) {
    if (steps.length > MAX_EXECUTION_STEPS) {
      status = 'timeout';
      message = 'Chương trình vượt quá giới hạn bước (Loop Timeout).';
      break;
    }

    const cmd = flatCommands[i];
    let action = cmd.type;

    if (cmd.type === COMMANDS.TURN_LEFT) {
      dir = (dir + 3) % 4;
    } else if (cmd.type === COMMANDS.TURN_RIGHT) {
      dir = (dir + 1) % 4;
    } else if (cmd.type === COMMANDS.FORWARD) {
      const vec = DIR_VECTORS[dir];
      const nextX = x + vec.dx;
      const nextY = y + vec.dy;

      // Check bounds
      if (nextX < 0 || nextX >= level.width || nextY < 0 || nextY >= level.height) {
        status = 'out_of_bounds';
        message = 'Cmd bị rơi ra ngoài bản đồ!';
        steps.push({
          stepIndex: steps.length,
          commandId: cmd.id,
          commandType: cmd.type,
          x: nextX,
          y: nextY,
          dir,
          action: 'fail',
          collectedStarsCount: collectedStars.size,
          status,
          message,
        });
        break;
      }

      // Check wall collision
      const wall = findPos(walls, { x: nextX, y: nextY });
      if (wall) {
        status = 'wall_hit';
        message = 'Cốp! Cmd va phải bức tường!';
        steps.push({
          stepIndex: steps.length,
          commandId: cmd.id,
          commandType: cmd.type,
          x: nextX,
          y: nextY,
          dir,
          action: 'bump',
          collectedStarsCount: collectedStars.size,
          status,
          message,
        });
        break;
      }

      // Move forward
      x = nextX;
      y = nextY;
    } else if (cmd.type === COMMANDS.JUMP) {
      const vec = DIR_VECTORS[dir];
      const obstacleX = x + vec.dx;
      const obstacleY = y + vec.dy;
      const landingX = x + vec.dx * 2;
      const landingY = y + vec.dy * 2;

      // Check jump landing bounds
      if (landingX < 0 || landingX >= level.width || landingY < 0 || landingY >= level.height) {
        status = 'out_of_bounds';
        message = 'Cmd nhảy quá đà ra khỏi bản đồ!';
        steps.push({
          stepIndex: steps.length,
          commandId: cmd.id,
          commandType: cmd.type,
          x: landingX,
          y: landingY,
          dir,
          action: 'fail',
          collectedStarsCount: collectedStars.size,
          status,
          message,
        });
        break;
      }

      // Check if landing spot has wall
      const landingWall = findPos(walls, { x: landingX, y: landingY });
      if (landingWall) {
        status = 'wall_hit';
        message = 'Cốp! Chỗ tiếp đất có bức tường!';
        steps.push({
          stepIndex: steps.length,
          commandId: cmd.id,
          commandType: cmd.type,
          x: landingX,
          y: landingY,
          dir,
          action: 'bump',
          collectedStarsCount: collectedStars.size,
          status,
          message,
        });
        break;
      }

      x = landingX;
      y = landingY;
    }

    // Check teleport
    const portal = teleports.find((tp) => isSamePos(tp.from, { x, y }));
    if (portal) {
      action = 'teleport';
      x = portal.to.x;
      y = portal.to.y;
    }

    // Check star collection
    const starIdx = level.stars.findIndex((s) => isSamePos(s, { x, y }));
    if (starIdx !== -1 && !collectedStars.has(starIdx)) {
      collectedStars.add(starIdx);
    }

    // Check bug collision
    const bug = findPos(bugs, { x, y });
    if (bug) {
      status = 'bug_hit';
      message = 'Ái chà! Cmd giẫm phải chú bọ Bug rồi!';
      steps.push({
        stepIndex: steps.length,
        commandId: cmd.id,
        commandType: cmd.type,
        x,
        y,
        dir,
        action: 'bug',
        collectedStarsCount: collectedStars.size,
        status,
        message,
      });
      break;
    }

    // Check goal
    if (isSamePos(level.goal, { x, y })) {
      status = 'goal';
      message = 'Tuyệt vời! Cmd đã cắm sạc thành công!';
      steps.push({
        stepIndex: steps.length,
        commandId: cmd.id,
        commandType: cmd.type,
        x,
        y,
        dir,
        action: 'goal',
        collectedStarsCount: collectedStars.size,
        status,
        message,
      });
      break;
    }

    // Normal step record
    steps.push({
      stepIndex: steps.length,
      commandId: cmd.id,
      commandType: cmd.type,
      x,
      y,
      dir,
      action,
      collectedStarsCount: collectedStars.size,
      status: 'running',
      message: '',
    });
  }

  // If completed commands but didn't reach goal or fail
  if (status === 'running') {
    if (isSamePos(level.goal, { x, y })) {
      status = 'goal';
      message = 'Tuyệt vời! Cmd đã cắm sạc thành công!';
    } else {
      status = 'incomplete';
      message = 'Cmd dừng lại nhưng chưa tới được ổ cắm sạc!';
    }
  }

  const totalStars = level.stars.length;
  const starsEarned = collectedStars.size;
  const success = status === 'goal';

  return {
    success,
    status,
    message,
    steps,
    starsEarned,
    totalStars,
    allStarsCollected: starsEarned === totalStars,
    commandsUsed: rawCommands.length,
    optimal: success && rawCommands.length <= (level.maxCommands || 99),
  };
}
