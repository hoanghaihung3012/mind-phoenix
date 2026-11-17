import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BALL_RADIUS, BONUS_POINTS, BRICK_POINTS, HEIGHT, MAX_SPEED, PADDLE_Y, START_SPEED,
  WIDTH, advance, ballSpeed, createGame, finishQuestion, launch, movePaddle,
} from './breakout.mjs';
import { mulberry32 } from '../../shared/core/game-utils.mjs';

function playing() {
  const game = createGame('Player', mulberry32(4));
  launch(game);
  return game;
}

function target(game, kind) {
  game.bricks = [
    { x: 200, y: 100, w: 86, h: 27, kind, alive: true },
    { x: 650, y: 100, w: 86, h: 27, kind: 'normal', alive: true },
  ];
  Object.assign(game.ball, { x: 243, y: 140, vx: 0, vy: -START_SPEED });
}

test('board always has bonus and question bricks within bounds', () => {
  for (let seed = 0; seed < 10; seed += 1) {
    const { bricks } = createGame('', mulberry32(seed));
    assert.equal(bricks.length, 48);
    assert.equal(bricks.filter((b) => b.kind === 'question').length, 6);
    assert.equal(bricks.filter((b) => b.kind === 'bonus').length, 8);
    assert.ok(bricks.every((b) => b.x >= 0 && b.x + b.w <= WIDTH && b.y + b.h < PADDLE_Y));
  }
});

test('paddle is bounded, carries the docked ball and launch only works once', () => {
  const game = createGame('');
  movePaddle(game, -1000);
  assert.ok(game.paddleX > 0);
  assert.equal(game.ball.x, game.paddleX);
  movePaddle(game, WIDTH + 1000);
  assert.ok(game.paddleX < WIDTH);
  advance(game, 2, -1);
  assert.equal(game.elapsed, 0);
  launch(game);
  const velocity = { vx: game.ball.vx, vy: game.ball.vy };
  launch(game);
  assert.equal(game.status, 'playing');
  assert.deepEqual({ vx: game.ball.vx, vy: game.ball.vy }, velocity);
});

test('ball speeds up with play time and brick hits but never exceeds cap', () => {
  assert.equal(ballSpeed(0, 0), START_SPEED);
  assert.ok(ballSpeed(10, 4) > ballSpeed(5, 2));
  assert.equal(ballSpeed(1e6, 1e6), MAX_SPEED);
  const game = playing();
  game.elapsed = 10000;
  advance(game, 0.1);
  assert.ok(Math.abs(Math.hypot(game.ball.vx, game.ball.vy) - MAX_SPEED) < 1e-8);
});

test('normal and bonus bricks award once and reflect the ball', () => {
  for (const kind of ['normal', 'bonus']) {
    const game = playing();
    target(game, kind);
    const events = advance(game, 0.04);
    assert.equal(events.filter((e) => e.type === 'brick').length, 1);
    assert.equal(game.bricks[0].alive, false);
    assert.ok(game.ball.vy > 0);
    assert.equal(game.score, BRICK_POINTS + (kind === 'bonus' ? BONUS_POINTS : 0));
    const score = game.score;
    advance(game, 0.04);
    assert.equal(game.score, score);
  }
});

test('question collision freezes physics, awards Sky Jump rewards and resumes safely', () => {
  const game = playing();
  target(game, 'question');
  advance(game, 0.1);
  assert.equal(game.status, 'question');
  const snapshot = structuredClone(game);
  advance(game, 5, 1);
  assert.deepEqual(game, snapshot);
  assert.equal(finishQuestion(game, true, 30), 110);
  assert.equal(game.correct, 1);
  assert.equal(game.status, 'playing');
  assert.equal(finishQuestion(game, true, 30), 0);
  assert.equal(game.score, BRICK_POINTS + 110);
  assert.equal(game.lives, 3);
});

test('wrong and timed out questions deduct points but not lives and score never goes negative', () => {
  for (const seconds of [30, 0]) {
    const game = playing();
    target(game, 'question');
    advance(game, 0.05);
    assert.equal(finishQuestion(game, false, seconds), -BRICK_POINTS);
    assert.equal(game.score, 0);
    assert.equal(game.lives, 3);
  }
});

test('paddle reflects descending balls with controllable angles, not ascending ones', () => {
  for (const offset of [-45, 0, 45]) {
    const game = playing();
    Object.assign(game.ball, { x: game.paddleX + offset, y: PADDLE_Y - 15, vx: 0, vy: START_SPEED });
    assert.ok(advance(game, 0.04).some((e) => e.type === 'paddle'));
    assert.ok(game.ball.vy < 0);
    assert.equal(Math.sign(game.ball.vx), Math.sign(offset));
  }
  const game = playing();
  Object.assign(game.ball, { x: game.paddleX, y: PADDLE_Y + 5, vx: 0, vy: -START_SPEED });
  assert.ok(!advance(game, 0.04).some((e) => e.type === 'paddle'));
});

test('walls and brick sides reflect even at maximum speed without tunnelling', () => {
  const game = playing();
  game.elapsed = 10000;
  Object.assign(game.ball, { x: WIDTH - BALL_RADIUS - 1, y: 350, vx: MAX_SPEED, vy: 1 });
  advance(game, 0.05);
  assert.ok(game.ball.vx < 0);
  target(game, 'normal');
  Object.assign(game.ball, { x: 180, y: 113, vx: MAX_SPEED, vy: 1 });
  advance(game, 0.05);
  assert.equal(game.bricks[0].alive, false);
  assert.ok(game.ball.vx < 0);
});

test('three missed balls end the game; both Sky Jump cheats keep infinite lives', () => {
  for (const name of ['', 'HHHH', 'HHH extra', 'HHH', ' phoenix HOANG ']) {
    const game = createGame(name);
    const cheat = ['HHH', ' phoenix HOANG '].includes(name);
    for (let miss = 1; miss <= 4; miss += 1) {
      launch(game);
      Object.assign(game.ball, { x: 15, y: HEIGHT + BALL_RADIUS + 1, vx: 0, vy: START_SPEED });
      advance(game, 0.02);
      assert.equal(game.lives, cheat ? Infinity : Math.max(0, 3 - miss));
      assert.equal(game.status, !cheat && miss >= 3 ? 'over' : 'ready');
    }
  }
});

test('clearing a wave preserves lives and difficulty, including a final question brick', () => {
  for (const kind of ['normal', 'question']) {
    const game = playing();
    target(game, kind);
    game.bricks.pop();
    game.lives = 2;
    game.elapsed = 150;
    advance(game, 0.05);
    if (kind === 'question') {
      assert.equal(game.wave, 1);
      finishQuestion(game, false, 0, mulberry32(8));
    }
    assert.equal(game.wave, 2);
    assert.equal(game.status, 'ready');
    assert.equal(game.lives, 2);
    assert.ok(game.elapsed >= 150);
    assert.equal(game.bricks.filter((b) => b.alive).length, 48);
    assert.equal(game.ball.y, PADDLE_Y - BALL_RADIUS - 1);
  }
});
