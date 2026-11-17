import { questionScoreChange, shuffle, startingLives } from '../../shared/core/game-utils.mjs';

export const WIDTH = 800;
export const HEIGHT = 620;
export const PADDLE_WIDTH = 116;
export const PADDLE_Y = 530;
export const PADDLE_HEIGHT = 16;
export const BALL_RADIUS = 9;
export const START_SPEED = 330;
export const MAX_SPEED = 660;
export const BRICK_POINTS = 10;
export const BONUS_POINTS = 40;
const PADDLE_SPEED = 620;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function ballSpeed(seconds, hits) {
  return Math.min(MAX_SPEED, START_SPEED + Math.max(0, seconds) * 2 + Math.max(0, hits) * 4);
}

export function createBricks(rng = Math.random) {
  const kinds = shuffle(Array.from({ length: 48 }, (_, i) => i < 6 ? 'question' : i < 14 ? 'bonus' : 'normal'), rng);
  return kinds.map((kind, i) => ({
    x: 28 + (i % 8) * 94, y: 64 + Math.floor(i / 8) * 36,
    w: 86, h: 27, kind, row: Math.floor(i / 8), alive: true,
  }));
}

export function createGame(name, rng = Math.random) {
  const game = {
    status: 'ready', lives: startingLives(name), score: 0, wave: 1,
    elapsed: 0, hits: 0, broken: 0, correct: 0, paddleX: WIDTH / 2,
    ball: { x: WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 1, vx: 0, vy: 0 },
    bricks: createBricks(rng),
  };
  return game;
}

export function movePaddle(game, x) {
  game.paddleX = clamp(x, PADDLE_WIDTH / 2, WIDTH - PADDLE_WIDTH / 2);
  if (game.status === 'ready') game.ball.x = game.paddleX;
}

export function launch(game) {
  if (game.status !== 'ready') return;
  const speed = ballSpeed(game.elapsed, game.hits);
  game.ball.vx = speed * 0.4;
  game.ball.vy = -speed * Math.sqrt(1 - 0.4 ** 2);
  game.status = 'playing';
}

function dock(game) {
  game.status = 'ready';
  Object.assign(game.ball, { x: game.paddleX, y: PADDLE_Y - BALL_RADIUS - 1, vx: 0, vy: 0 });
}

function nextWave(game, rng) {
  game.wave += 1;
  game.bricks = createBricks(rng);
  dock(game);
}

export function finishQuestion(game, correct, secondsLeft, rng = Math.random) {
  if (game.status !== 'question') return 0;
  const change = questionScoreChange(correct, secondsLeft, game.score);
  game.score += change;
  if (correct) game.correct += 1;
  game.status = 'playing';
  if (game.bricks.every((brick) => !brick.alive)) nextWave(game, rng);
  return change;
}

export function advance(game, dt, direction = 0, rng = Math.random) {
  const events = [];
  if (game.status !== 'playing' && game.status !== 'ready') return events;
  // Substeps keep travel shorter than half a ball radius, even at the speed cap.
  const steps = Math.max(1, Math.ceil(dt * MAX_SPEED / (BALL_RADIUS / 2)));
  const h = dt / steps;
  for (let i = 0; i < steps; i += 1) {
    movePaddle(game, game.paddleX + clamp(direction, -1, 1) * PADDLE_SPEED * h);
    if (game.status === 'ready') continue;
    game.elapsed += h;
    const b = game.ball;
    const speed = ballSpeed(game.elapsed, game.hits);
    const ratio = speed / Math.hypot(b.vx, b.vy);
    b.vx *= ratio;
    b.vy *= ratio;
    const previous = { x: b.x, y: b.y };
    b.x += b.vx * h;
    b.y += b.vy * h;
    if (b.x < BALL_RADIUS || b.x > WIDTH - BALL_RADIUS) {
      b.x = clamp(b.x, BALL_RADIUS, WIDTH - BALL_RADIUS);
      b.vx *= -1;
      events.push({ type: 'bounce' });
    }
    if (b.y < BALL_RADIUS) {
      b.y = BALL_RADIUS;
      b.vy = Math.abs(b.vy);
      events.push({ type: 'bounce' });
    }
    if (b.vy > 0 && previous.y + BALL_RADIUS <= PADDLE_Y && b.y + BALL_RADIUS >= PADDLE_Y) {
      const t = (PADDLE_Y - BALL_RADIUS - previous.y) / (b.y - previous.y);
      const impactX = previous.x + (b.x - previous.x) * t;
      if (Math.abs(impactX - game.paddleX) <= PADDLE_WIDTH / 2 + BALL_RADIUS / 2) {
        const offset = clamp((impactX - game.paddleX) / (PADDLE_WIDTH / 2), -1, 1);
        const angle = offset * Math.PI / 3;
        b.vx = speed * Math.sin(angle);
        b.vy = -speed * Math.cos(angle);
        b.y = PADDLE_Y - BALL_RADIUS;
        events.push({ type: 'paddle', x: b.x, y: b.y });
      }
    }
    for (const brick of game.bricks) {
      if (!brick.alive) continue;
      const closestX = clamp(b.x, brick.x, brick.x + brick.w);
      const closestY = clamp(b.y, brick.y, brick.y + brick.h);
      if ((b.x - closestX) ** 2 + (b.y - closestY) ** 2 > BALL_RADIUS ** 2) continue;
      let nx = b.x - closestX;
      let ny = b.y - closestY;
      const length = Math.hypot(nx, ny);
      if (length) { nx /= length; ny /= length; }
      else if (previous.y <= brick.y || previous.y >= brick.y + brick.h) {
        nx = 0; ny = previous.y < brick.y ? -1 : 1;
      } else { nx = previous.x < brick.x ? -1 : 1; ny = 0; }
      const dot = b.vx * nx + b.vy * ny;
      if (dot >= 0) continue;
      b.vx -= 2 * dot * nx;
      b.vy -= 2 * dot * ny;
      // Avoid nearly horizontal loops after glancing corner hits.
      if (Math.abs(b.vy) < speed * 0.3) {
        b.vy = (b.vy < 0 ? -1 : 1) * speed * 0.3;
        b.vx = (b.vx < 0 ? -1 : 1) * Math.sqrt(speed ** 2 - b.vy ** 2);
      }
      b.x = previous.x;
      b.y = previous.y;
      brick.alive = false;
      game.hits += 1;
      game.broken += 1;
      const points = brick.kind === 'bonus' ? BRICK_POINTS + BONUS_POINTS : BRICK_POINTS;
      game.score += points;
      events.push({ type: 'brick', brick, points });
      if (brick.kind === 'question') game.status = 'question';
      break;
    }
    if (b.y - BALL_RADIUS > HEIGHT) {
      game.lives -= 1;
      events.push({ type: 'miss' });
      if (game.lives <= 0) game.status = 'over';
      else dock(game);
      break;
    }
    if (game.status === 'question') break;
    if (game.bricks.every((brick) => !brick.alive)) {
      nextWave(game, rng);
      events.push({ type: 'wave' });
      break;
    }
  }
  return events;
}
