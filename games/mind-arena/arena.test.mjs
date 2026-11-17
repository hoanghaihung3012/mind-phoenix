import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUBJECTS,
  STAGE_CONFIGS,
  LESSONS,
  calculateQuestionScore,
  calculateMedal,
  generateArenaLeaderboard,
  getLessonStages,
  shuffleArray,
  ARENA_LEVELS,
  calculatePlayerLevel,
  TOWER_FLOORS,
  DUEL_RIVALS,
  calculateDuelResult,
  getNationalLeaderboard,
} from './arena.mjs';

function pseudoRng(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('SUBJECTS covers Math, Vietnamese, English, and All-round with rich metadata', () => {
  assert.equal(SUBJECTS.length, 4);
  const ids = SUBJECTS.map((s) => s.id);
  assert.deepEqual(ids, ['math', 'vietnamese', 'english', 'all-round']);

  for (const sub of SUBJECTS) {
    assert.ok(sub.name && sub.nameEn, `Subject ${sub.id} must have names in VI/EN`);
    assert.ok(sub.badge && sub.badgeEn, `Subject ${sub.id} must have badge`);
    assert.ok(sub.description && sub.descriptionEn);
    assert.ok(sub.color && sub.bgGradient);
    assert.ok(sub.mascot);
  }
});

test('STAGE_CONFIGS defines 3 stages with progressive difficulty', () => {
  assert.equal(STAGE_CONFIGS.length, 3);
  assert.equal(STAGE_CONFIGS[0].id, 'sprint');
  assert.equal(STAGE_CONFIGS[1].id, 'surge');
  assert.equal(STAGE_CONFIGS[2].id, 'summit');

  // Progressive difficulty: time and base points increase
  assert.ok(STAGE_CONFIGS[0].timePerQuestion < STAGE_CONFIGS[1].timePerQuestion);
  assert.ok(STAGE_CONFIGS[1].timePerQuestion < STAGE_CONFIGS[2].timePerQuestion);
  assert.ok(STAGE_CONFIGS[0].basePoints < STAGE_CONFIGS[1].basePoints);
  assert.ok(STAGE_CONFIGS[1].basePoints < STAGE_CONFIGS[2].basePoints);
});

test('every LESSON has 12 valid questions split evenly across 3 stages (4 per stage)', () => {
  assert.ok(LESSONS.length >= 8, 'There should be at least 8 lessons');

  for (const lesson of LESSONS) {
    assert.ok(lesson.id && lesson.title && lesson.titleEn);
    assert.ok(['math', 'vietnamese', 'english', 'all-round'].includes(lesson.subjectId));
    assert.equal(lesson.questions.length, 12, `Lesson ${lesson.id} must have 12 questions`);

    const stageCounts = [0, 0, 0];
    for (const q of lesson.questions) {
      assert.ok(q.stage >= 0 && q.stage <= 2);
      stageCounts[q.stage]++;
      assert.ok(q.prompt && q.prompt.length > 5, 'Prompt should have content');
      assert.ok(q.promptEn && q.promptEn.length > 5, 'PromptEn should have content');
      assert.equal(q.options.length, 4, 'Must have 4 options');
      assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3, 'Correct index must be in range 0-3');
      assert.ok(q.explanation && q.explanation.length > 3, 'Must have explanation');
    }
    assert.deepEqual(stageCounts, [4, 4, 4], `Lesson ${lesson.id} must have 4 questions per stage`);
  }
});

test('calculateQuestionScore handles correct, incorrect, speed bonuses and streak multipliers', () => {
  // Incorrect answer yields 0 points and resets streak
  const wrong = calculateQuestionScore({ stageIndex: 0, timeRemaining: 14, isCorrect: false, currentStreak: 4 });
  assert.equal(wrong.pointsAwarded, 0);
  assert.equal(wrong.newStreak, 0);

  // Stage 0 (base 10, max bonus 7), 10 seconds remaining => bonus = floor(10/2) = 5
  // Streak 0 -> 1: multiplier 1.0 => (10 + 5) * 1.0 = 15
  const st0 = calculateQuestionScore({ stageIndex: 0, timeRemaining: 10, isCorrect: true, currentStreak: 0 });
  assert.equal(st0.basePoints, 10);
  assert.equal(st0.speedBonus, 5);
  assert.equal(st0.streakMultiplier, 1.0);
  assert.equal(st0.pointsAwarded, 15);
  assert.equal(st0.newStreak, 1);

  // Speed bonus is capped by stage maxBonus
  const st0MaxTime = calculateQuestionScore({ stageIndex: 0, timeRemaining: 20, isCorrect: true, currentStreak: 0 });
  assert.equal(st0MaxTime.speedBonus, 7);

  // Streak multipliers:
  // Streak 1 -> 2 (1.2x)
  const stStreak2 = calculateQuestionScore({ stageIndex: 1, timeRemaining: 0, isCorrect: true, currentStreak: 1 });
  assert.equal(stStreak2.streakMultiplier, 1.2);
  assert.equal(stStreak2.pointsAwarded, Math.round(20 * 1.2)); // 24

  // Streak 2 -> 3 (1.5x)
  const stStreak3 = calculateQuestionScore({ stageIndex: 1, timeRemaining: 0, isCorrect: true, currentStreak: 2 });
  assert.equal(stStreak3.streakMultiplier, 1.5);
  assert.equal(stStreak3.pointsAwarded, Math.round(20 * 1.5)); // 30

  // Streak 4 -> 5 (2.0x) in stage 2 (base 30 + speed 10 = 40) => 40 * 2 = 80
  const stStreak5 = calculateQuestionScore({ stageIndex: 2, timeRemaining: 20, isCorrect: true, currentStreak: 4 });
  assert.equal(stStreak5.streakMultiplier, 2.0);
  assert.equal(stStreak5.speedBonus, 10);
  assert.equal(stStreak5.pointsAwarded, 80);
  assert.equal(stStreak5.newStreak, 5);
});

test('calculateMedal awards Diamond, Gold, Silver, Bronze and Rising star appropriately', () => {
  const max = 400;
  assert.equal(calculateMedal(370, max).id, 'diamond'); // 370 / 400 = 0.925 >= 0.88
  assert.equal(calculateMedal(300, max).id, 'gold');    // 300 / 400 = 0.75 >= 0.72
  assert.equal(calculateMedal(240, max).id, 'silver');  // 240 / 400 = 0.60 >= 0.55
  assert.equal(calculateMedal(160, max).id, 'bronze');  // 160 / 400 = 0.40 >= 0.35
  assert.equal(calculateMedal(80, max).id, 'rising');   // 80 / 400 = 0.20 < 0.35
  assert.equal(calculateMedal(0, 0).id, 'novice');
});

test('generateArenaLeaderboard places user alongside simulated competitors sorted by score', () => {
  const rng = pseudoRng(12345);
  const leaderboard = generateArenaLeaderboard({
    userScore: 280,
    userName: 'Minh Đăng',
    maxScore: 360,
    rng,
  });

  assert.equal(leaderboard.length, 10, 'Must have 10 ranks (Top 10)');
  assert.ok(leaderboard.some((p) => p.isUser && p.name === 'Minh Đăng'));

  for (let i = 0; i < leaderboard.length - 1; i++) {
    assert.equal(leaderboard[i].rank, i + 1);
    assert.ok(leaderboard[i].score >= leaderboard[i + 1].score, 'Must be sorted descending');
  }
});

test('getLessonStages groups questions into 3 distinct stages', () => {
  const { lesson, stages } = getLessonStages('math-arithmetic');
  assert.equal(lesson.id, 'math-arithmetic');
  assert.equal(stages.length, 3);
  assert.equal(stages[0].questions.length, 4);
  assert.equal(stages[1].questions.length, 4);
  assert.equal(stages[2].questions.length, 4);
});

test('shuffleArray returns all elements without losing items', () => {
  const arr = [1, 2, 3, 4, 5, 6];
  const shuffled = shuffleArray(arr, pseudoRng(99));
  assert.equal(shuffled.length, arr.length);
  assert.deepEqual(shuffled.sort((a, b) => a - b), arr);
});


test('calculatePlayerLevel correctly maps XP to Levels 1-8 and computes progress', () => {
  const lvl1 = calculatePlayerLevel(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.titleVi, 'Tập Sự Đấu Trường');
  assert.ok(lvl1.progressPercent >= 0 && lvl1.progressPercent <= 100);

  const lvl3 = calculatePlayerLevel(750);
  assert.equal(lvl3.level, 3);
  assert.equal(lvl3.titleVi, 'Chiến Binh Trí Tuệ');

  const lvl8 = calculatePlayerLevel(9500);
  assert.equal(lvl8.level, 8);
  assert.equal(lvl8.titleVi, 'Huyền Thoại Mind Phoenix');
  assert.equal(lvl8.progressPercent, 100);
});

test('TOWER_FLOORS contains 5 progressive challenge floors', () => {
  assert.equal(TOWER_FLOORS.length, 5);
  for (let i = 0; i < TOWER_FLOORS.length; i++) {
    assert.equal(TOWER_FLOORS[i].floor, i + 1);
    assert.ok(TOWER_FLOORS[i].titleVi && TOWER_FLOORS[i].titleEn);
    assert.ok(TOWER_FLOORS[i].timePerQ >= 15);
    assert.ok(TOWER_FLOORS[i].basePoints >= 15);
    if (i > 0) {
      assert.ok(TOWER_FLOORS[i].basePoints > TOWER_FLOORS[i - 1].basePoints);
    }
  }
});

test('calculateDuelResult awards points only to winner, while loser gets 0', () => {
  // Case 1: User Wins
  const winResult = calculateDuelResult({ userScore: 180, rivalScore: 120, victoryBonus: 100 });
  assert.equal(winResult.isWinner, true);
  assert.equal(winResult.isDraw, false);
  assert.equal(winResult.pointsAwarded, 280); // 180 + 100
  assert.equal(winResult.victoryBonus, 100);
  assert.ok(winResult.messageVi.includes('CHIẾN THẮNG'));

  // Case 2: User Loses (Thua không được gì)
  const loseResult = calculateDuelResult({ userScore: 90, rivalScore: 150, victoryBonus: 100 });
  assert.equal(loseResult.isWinner, false);
  assert.equal(loseResult.isDraw, false);
  assert.equal(loseResult.pointsAwarded, 0); // Thua ko dc gi
  assert.equal(loseResult.victoryBonus, 0);
  assert.ok(loseResult.messageVi.includes('THUA'));

  // Case 3: Draw
  const drawResult = calculateDuelResult({ userScore: 150, rivalScore: 150, victoryBonus: 100 });
  assert.equal(drawResult.isWinner, false);
  assert.equal(drawResult.isDraw, true);
  assert.equal(drawResult.pointsAwarded, 0);
});

test('getNationalLeaderboard integrates user profile sorted by total XP', () => {
  const profile = {
    userId: 'test_user',
    name: 'Anh Minh',
    xp: 3200, // Should be level 6
    duelWins: 25,
  };

  const board = getNationalLeaderboard(profile);
  assert.ok(board.length >= 9);
  const userEntry = board.find((p) => p.isUser);
  assert.ok(userEntry);
  assert.equal(userEntry.name, 'Anh Minh');
  assert.equal(userEntry.level, 6);

  for (let i = 0; i < board.length - 1; i++) {
    assert.ok(board[i].xp >= board[i + 1].xp, 'Leaderboard must be sorted descending by XP');
    assert.equal(board[i].rank, i + 1);
  }
});
