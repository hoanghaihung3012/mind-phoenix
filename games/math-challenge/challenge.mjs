export const ROUNDS = [
  { id: 'bubbles', name: 'Bắn bong bóng', hint: 'Tính nhẩm rồi bắn bong bóng mang đáp án đúng.', icon: '◎', theme: 'sky' },
  { id: 'bridge', name: 'Cây cầu con số', hint: 'Điền đáp án vào tấm ván còn thiếu để xây cầu.', icon: '▰', theme: 'orchard' },
  { id: 'stars', name: 'Hái sao theo thứ tự', hint: 'Chạm các ngôi sao từ số bé nhất đến số lớn nhất.', icon: '★', theme: 'night' },
  { id: 'lightning', name: 'Chớp nhoáng đúng sai', hint: 'Xem phép tính và quyết định: đúng hay sai?', icon: 'ϟ', theme: 'sunset' },
];
export const QUESTIONS_PER_ROUND = 5;
export const PASS_COUNT = 3;
export const DIFFICULTIES = {
  easy: { name: 'Dễ', seconds: 18 },
  hard: { name: 'Khó', seconds: 12 },
};

function integer(min, max, rng) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function shuffle(values, rng = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = integer(0, i, rng);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function arithmetic(difficulty, rng) {
  const hard = difficulty === 'hard';
  const operation = integer(0, hard ? 4 : 2, rng);
  let a = integer(1, hard ? 99 : 20, rng);
  let b = integer(1, hard ? 99 : 20, rng);
  if (operation === 0) return { expression: `${a} + ${b}`, answer: a + b };
  if (operation === 1) {
    [a, b] = [Math.max(a, b), Math.min(a, b)];
    return { expression: `${a} − ${b}`, answer: a - b };
  }
  a = integer(1, hard ? 12 : 5, rng);
  b = integer(1, hard ? 12 : 5, rng);
  if (operation === 2) return { expression: `${a} × ${b}`, answer: a * b };
  if (operation === 3) return { expression: `${a * b} : ${b}`, answer: a };
  const c = integer(1, 30, rng);
  return { expression: `${a} × ${b} + ${c}`, answer: a * b + c };
}

export function createQuestion(roundId, difficulty, rng = Math.random) {
  if (!ROUNDS.some((round) => round.id === roundId)) throw new RangeError('Unknown round');
  if (!Object.hasOwn(DIFFICULTIES, difficulty)) throw new RangeError('Unknown difficulty');
  if (roundId === 'stars') {
    const base = integer(0, difficulty === 'hard' ? 160 : 15, rng);
    const step = integer(1, difficulty === 'hard' ? 12 : 5, rng);
    const answer = Array.from({ length: 4 }, (_, i) => base + i * step);
    return { prompt: 'Hái sao từ bé đến lớn', answer, choices: shuffle(answer, rng), solution: answer.join(' < ') };
  }
  const { expression, answer } = arithmetic(difficulty, rng);
  if (roundId === 'lightning') {
    const shown = rng() < .5 ? answer : answer + integer(1, 9, rng);
    return { prompt: `${expression} = ${shown}`, answer: shown === answer, solution: `${expression} = ${answer}` };
  }
  const offsets = shuffle([-10, -5, -2, -1, 1, 2, 5, 10], rng);
  const choices = [answer];
  for (const offset of offsets) {
    if (answer + offset >= 0) choices.push(answer + offset);
    if (choices.length === 4) break;
  }
  return { prompt: `${expression} = ?`, answer, choices: shuffle(choices, rng), solution: `${expression} = ${answer}` };
}

export function createRun(difficulty) {
  if (!Object.hasOwn(DIFFICULTIES, difficulty)) throw new RangeError('Unknown difficulty');
  return { difficulty, round: 0, answered: 0, correct: 0, roundScore: 0, score: 0, results: [], status: 'playing' };
}

export function recordAnswer(run, correct, secondsLeft) {
  if (run.status !== 'playing') return run;
  const remaining = Math.min(DIFFICULTIES[run.difficulty].seconds, Math.max(0, secondsLeft));
  const answered = run.answered + 1;
  const count = run.correct + Number(correct);
  return {
    ...run, answered, correct: count,
    roundScore: run.roundScore + (correct ? 100 + Math.ceil(remaining) * 5 : 0),
    status: answered === QUESTIONS_PER_ROUND ? (count >= PASS_COUNT ? 'passed' : 'failed') : 'playing',
  };
}

export function advanceRound(run) {
  if (run.status !== 'passed') throw new Error('Round must be passed before advancing');
  const results = [...run.results, { correct: run.correct, score: run.roundScore }];
  const score = run.score + run.roundScore;
  if (run.round === ROUNDS.length - 1) return { ...run, score, results, status: 'complete' };
  return { ...run, round: run.round + 1, answered: 0, correct: 0, roundScore: 0, score, results, status: 'playing' };
}

export function retryRound(run) {
  if (run.status !== 'failed') throw new Error('Only failed rounds can be retried');
  return { ...run, answered: 0, correct: 0, roundScore: 0, status: 'playing' };
}
