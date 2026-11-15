import { PUZZLES, constrainPosition, createBoard, isWithinSnap } from './puzzle.mjs';

const get = (id) => document.getElementById(id);
const board = get('puzzle-board');
const targets = get('targets');
const piecesLayer = get('pieces');
const completionDialog = get('completion-dialog');
const compactQuery = matchMedia('(max-width: 700px)');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const completed = new Set();
let puzzleIndex = 0;
let difficulty = 'hard';
let layout;
let pieces = [];
let selected = null;
let drag = null;
let hints = false;
let confettiTimer;

const frameVisible = () => difficulty === 'easy' || hints;

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

function polygonPoints(points) {
  return points.map((point) => point.join(',')).join(' ');
}

function numberLabel(piece) {
  const x = piece.points.reduce((sum, point) => sum + point[0], 0) / piece.points.length;
  const y = piece.points.reduce((sum, point) => sum + point[1], 0) / piece.points.length;
  const label = svgElement('text', { x, y, class: 'piece-number', 'aria-hidden': 'true' });
  label.textContent = piece.number;
  return label;
}

function renderPreview(puzzle, svg) {
  const preview = createBoard(puzzle);
  const left = Math.min(...preview.pieces.map((piece) => piece.target.x));
  const top = Math.min(...preview.pieces.map((piece) => piece.target.y));
  const right = Math.max(...preview.pieces.map((piece) => piece.target.x + piece.width));
  const bottom = Math.max(...preview.pieces.map((piece) => piece.target.y + piece.height));
  svg.setAttribute('viewBox', `${left - 14} ${top - 14} ${right - left + 28} ${bottom - top + 28}`);
  svg.replaceChildren(...preview.pieces.map((piece) => svgElement('polygon', {
    points: polygonPoints(piece.points),
    transform: `translate(${piece.target.x} ${piece.target.y})`,
    fill: piece.color, stroke: '#fffefa', 'stroke-width': 2, 'stroke-linejoin': 'round'
  })));
}

function updatePiece(piece) {
  piece.element.setAttribute('transform', `translate(${piece.position.x} ${piece.position.y})`);
  piece.element.classList.toggle('is-selected', piece === selected);
  piece.element.classList.toggle('is-placed', piece.placed);
  piece.element.setAttribute('tabindex', piece.placed ? '-1' : '0');
  piece.element.setAttribute('aria-disabled', String(piece.placed));
  piece.element.setAttribute('aria-pressed', String(piece === selected));
  piece.targetElement.classList.toggle('is-selected', piece === selected);
  piece.targetElement.classList.toggle('is-filled', piece.placed);
  const targetActive = frameVisible() && piece === selected;
  piece.targetElement.setAttribute('tabindex', targetActive ? '0' : '-1');
  piece.targetElement.setAttribute('aria-disabled', String(!targetActive));
}

function selectPiece(piece) {
  selected = piece;
  pieces.forEach((item) => {
    if (item !== piece) item.targetElement.classList.remove('is-near');
    updatePiece(item);
  });
  if (piece) {
    const instruction = frameVisible() ? `Kéo hoặc chạm vào bóng có số ${piece.number} nhé!` :
      'Nhìn hình mẫu rồi tìm vị trí ở giữa bảng nhé!';
    get('game-status').textContent = `Đã chọn mảnh ${piece.number}: ${piece.name.toLowerCase()}. ${instruction}`;
  }
}

function screenMatrix() {
  const matrix = board.getScreenCTM();
  if (matrix && matrix.a * matrix.d - matrix.b * matrix.c !== 0) return matrix;
  const message = 'Chưa thể xác định vị trí bảng ghép. Hãy tải lại trang rồi thử lại nhé.';
  console.error(message);
  get('game-notice').textContent = message;
  get('game-notice').hidden = false;
  return null;
}

function pointerPosition(event, matrix) {
  const point = board.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(matrix.inverse());
}

function cancelDrag() {
  if (!drag) return;
  const previous = drag;
  drag = null;
  previous.piece.position = previous.origin;
  previous.piece.element.classList.remove('is-dragging');
  previous.piece.targetElement.classList.remove('is-near');
  updatePiece(previous.piece);
  if (board.hasPointerCapture(previous.pointerId)) board.releasePointerCapture(previous.pointerId);
}

function updateProgress() {
  const count = pieces.filter((piece) => piece.placed).length;
  get('piece-count').innerHTML = `${count} <small>/ 7 mảnh</small>`;
  document.querySelector('.progress-counter').setAttribute('aria-valuenow', count);
  get('game-status').textContent = count === 7 ? 'Bé đã ghép đủ 7 mảnh. Tuyệt vời!' : `Khớp rồi! Bé đã ghép ${count} / 7 mảnh. Tiếp tục nào!`;
}

function celebrate() {
  const puzzle = PUZZLES[puzzleIndex];
  completed.add(`${difficulty}:${puzzle.id}`);
  const option = document.querySelector(`[data-puzzle="${puzzle.id}"]`);
  option.classList.add('is-finished');
  option.querySelector('.completion-label').textContent = 'Đã hoàn thành';
  get('completion-message').textContent = puzzle.celebration;
  renderPreview(puzzle, get('finished-preview'));
  completionDialog.showModal();
  if (motionQuery.matches) return;
  const colors = pieces.map((piece) => piece.color);
  get('confetti').replaceChildren(...Array.from({ length: 25 }, (_, index) => {
    const item = document.createElement('span');
    item.className = 'confetti-piece';
    item.style.setProperty('--left', `${5 + index * 3.7}%`);
    item.style.setProperty('--color', colors[index % colors.length]);
    item.style.setProperty('--delay', `${index % 5 * .05}s`);
    item.style.setProperty('--drift', `${index % 2 ? 35 : -35}px`);
    item.style.setProperty('--turn', `${180 + index * 37}deg`);
    return item;
  }));
  confettiTimer = setTimeout(() => get('confetti').replaceChildren(), 1700);
}

function placePiece(piece, keyboard = false) {
  if (piece.placed) return;
  piece.position = { ...piece.target };
  piece.placed = true;
  piece.targetElement.classList.remove('is-near');
  selectPiece(null);
  updateProgress();
  if (pieces.every((item) => item.placed)) celebrate();
  else if (keyboard) pieces.find((item) => !item.placed).element.focus();
}

function moveDrag(event) {
  if (!drag || drag.pointerId !== event.pointerId) return false;
  const matrix = screenMatrix();
  if (!matrix) {
    cancelDrag();
    return false;
  }
  const point = pointerPosition(event, matrix);
  const piece = drag.piece;
  const position = constrainPosition({ x: point.x - drag.offset.x, y: point.y - drag.offset.y }, piece, layout);
  const near = isWithinSnap(position, piece.target, matrix);
  piece.position = near ? { ...piece.target } : position;
  piece.targetElement.classList.toggle('is-near', near);
  updatePiece(piece);
  return near;
}

function renderFrame() {
  const visible = frameVisible();
  const hard = difficulty === 'hard';
  targets.toggleAttribute('hidden', !visible);
  targets.setAttribute('aria-hidden', String(!visible));
  targets.classList.toggle('targets-hinted', hints);
  const hint = get('hint-toggle');
  hint.setAttribute('aria-pressed', String(hints));
  hint.querySelector('span').textContent = hints ? 'Ẩn gợi ý' : 'Gợi ý';
  get('difficulty-note').textContent = hard ? (hints ? 'Đang xem cách ghép' : 'Không có khung · bấm Gợi ý để xem') : 'Có khung và gợi ý';
  get('board-instructions').textContent = hard && !hints ?
    'Nhìn hình mẫu rồi ghép lại ở giữa bảng. Bí quá thì bấm “Gợi ý” để xem cách ghép nhé!' :
    'Kéo những mảnh màu vào bóng mờ. Điều kỳ diệu đang chờ bé!';
  pieces.forEach(updatePiece);
  const decoration = [];
  if (visible && layout) {
    const puzzle = PUZZLES[puzzleIndex];
    const { x, y } = layout.center;
    const compact = compactQuery.matches;
    decoration.push(
      svgElement('ellipse', { class: 'shadow-backdrop', cx: x, cy: y, rx: compact ? 143 : 220, ry: compact ? 110 : 178 }),
      svgElement('text', { class: 'board-caption', x, y: compact ? 127 : 86 }),
      svgElement('path', { class: 'board-spark', d: `M${x - (compact ? 118 : 181)} ${y - 112}l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z` }),
      svgElement('path', { class: 'board-spark', d: `M${x + (compact ? 105 : 180)} ${y + 98}l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z` })
    );
    decoration[1].textContent = 'GHÉP MẢNH VÀO ĐÂY';
    if (puzzle.id === 'boat') {
      decoration.push(svgElement('path', { class: 'board-wave', d: `M${x - 70} ${y + (compact ? 94 : 136)}q18-10 35 0t35 0t35 0t35 0` }));
    }
  }
  get('board-decoration').replaceChildren(...decoration);
}

function loadPuzzle(index, preserve = false) {
  cancelDrag();
  const oldPieces = preserve ? pieces : [];
  puzzleIndex = index;
  selected = null;
  clearTimeout(confettiTimer);
  get('confetti').replaceChildren();
  if (completionDialog.open && !preserve) completionDialog.close();
  const puzzle = PUZZLES[index];
  if (!preserve) hints = false;
  document.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.difficulty === difficulty));
  });
  layout = createBoard(puzzle, compactQuery.matches);
  board.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
  get('board-title').textContent = `Bảng ghép hình ${puzzle.name.toLowerCase()}`;
  get('puzzle-title').textContent = puzzle.name;
  get('level-number').textContent = String(index + 1).padStart(2, '0');
  document.querySelectorAll('[data-puzzle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.puzzle === puzzle.id));
    const finished = completed.has(`${difficulty}:${button.dataset.puzzle}`);
    button.classList.toggle('is-finished', finished);
    button.querySelector('.completion-label').textContent = finished ? 'Đã hoàn thành' : '';
  });
  targets.replaceChildren();
  piecesLayer.replaceChildren();
  pieces = layout.pieces.map((piece) => {
    const old = oldPieces.find((item) => item.id === piece.id);
    const state = { ...piece, position: { ...piece.start }, placed: Boolean(old?.placed) };
    if (state.placed) state.position = { ...state.target };
    const target = svgElement('g', {
      class: 'target-piece', 'data-id': state.id, role: 'button', tabindex: '-1',
      'aria-label': `Vị trí mảnh ${state.number}: ${state.name.toLowerCase()}`
    });
    target.style.setProperty('--piece-color', state.color);
    target.setAttribute('transform', `translate(${state.target.x} ${state.target.y})`);
    target.append(svgElement('polygon', { points: polygonPoints(state.points) }), numberLabel(state));
    targets.append(target);
    const element = svgElement('g', {
      class: 'puzzle-piece', 'data-id': state.id, role: 'button', tabindex: '0',
      'aria-label': `Mảnh ${state.number}: ${state.name.toLowerCase()}`
    });
    element.style.setProperty('--piece-color', state.color);
    element.append(
      svgElement('polygon', { class: 'piece-hit', points: polygonPoints(state.points) }),
      svgElement('polygon', { class: 'piece-face', points: polygonPoints(state.points) }),
      numberLabel(state)
    );
    piecesLayer.append(element);
    state.element = element;
    state.targetElement = target;
    updatePiece(state);
    return state;
  });
  renderFrame();
  const count = pieces.filter((piece) => piece.placed).length;
  get('piece-count').innerHTML = `${count} <small>/ 7 mảnh</small>`;
  document.querySelector('.progress-counter').setAttribute('aria-valuenow', count);
  get('game-status').textContent = count === 7 ? 'Bé đã ghép đủ 7 mảnh. Tuyệt vời!' :
    count ? `Bé đã ghép ${count} / 7 mảnh. Tiếp tục nào!` :
    !frameVisible() ? 'Bé thử ghép lại hình mẫu ở giữa bảng nhé!' : 'Bé thử kéo một mảnh màu vào bóng hình nhé!';
}

board.addEventListener('pointerdown', (event) => {
  if (drag || !event.isPrimary || event.button !== 0) return;
  const element = event.target.closest('.puzzle-piece');
  const piece = pieces.find((item) => item.element === element);
  if (!piece || piece.placed) return;
  const matrix = screenMatrix();
  if (!matrix) return;
  event.preventDefault();
  const point = pointerPosition(event, matrix);
  selectPiece(piece);
  piecesLayer.append(piece.element);
  drag = {
    piece, pointerId: event.pointerId, origin: { ...piece.position },
    offset: { x: point.x - piece.position.x, y: point.y - piece.position.y }
  };
  piece.element.classList.add('is-dragging');
  board.setPointerCapture(event.pointerId);
});

board.addEventListener('pointermove', moveDrag);
board.addEventListener('pointerup', (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return;
  const near = moveDrag(event);
  if (!drag) return;
  const piece = drag.piece;
  drag = null;
  piece.element.classList.remove('is-dragging');
  piece.targetElement.classList.remove('is-near');
  if (board.hasPointerCapture(event.pointerId)) board.releasePointerCapture(event.pointerId);
  if (near) placePiece(piece);
  else get('game-status').textContent = frameVisible() ?
    `Mảnh ${piece.number} chưa khớp. Thử đưa gần bóng có số ${piece.number}, hoặc chạm vào bóng đó nhé!` :
    `Mảnh ${piece.number} chưa khớp. Nhìn hình mẫu rồi thử sắp xếp lại nhé!`;
});
['pointercancel', 'lostpointercapture'].forEach((type) => {
  board.addEventListener(type, (event) => { if (drag?.pointerId === event.pointerId) cancelDrag(); });
});

board.addEventListener('click', (event) => {
  if (!frameVisible()) return;
  const target = event.target.closest('.target-piece');
  if (!target || !selected) return;
  if (target === selected.targetElement) placePiece(selected);
  else get('game-status').textContent = `Bé tìm bóng có số ${selected.number} để ghép mảnh này nhé!`;
});

board.addEventListener('keydown', (event) => {
  const target = event.target.closest('.target-piece');
  if (frameVisible() && target && ['Enter', ' '].includes(event.key) && selected?.targetElement === target) {
    event.preventDefault();
    placePiece(selected, true);
    return;
  }
  const piece = pieces.find((item) => item.element === event.target.closest('.puzzle-piece'));
  if (!piece || piece.placed || drag) return;
  if (['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    const matrix = screenMatrix();
    if (!matrix) return;
    if (isWithinSnap(piece.position, piece.target, matrix)) placePiece(piece, true);
    else selectPiece(piece);
  } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    const matrix = screenMatrix();
    if (!matrix) return;
    selectPiece(piece);
    const step = event.shiftKey ? 2 : 10;
    const dx = step / Math.hypot(matrix.a, matrix.b);
    const dy = step / Math.hypot(matrix.c, matrix.d);
    piece.position = constrainPosition({
      x: piece.position.x + (event.key === 'ArrowLeft' ? -dx : event.key === 'ArrowRight' ? dx : 0),
      y: piece.position.y + (event.key === 'ArrowUp' ? -dy : event.key === 'ArrowDown' ? dy : 0)
    }, piece, layout);
    piece.targetElement.classList.toggle('is-near', isWithinSnap(piece.position, piece.target, matrix));
    updatePiece(piece);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const dialog = [get('help-dialog'), completionDialog].find((item) => item.open);
  if (dialog) {
    event.preventDefault();
    dialog.close();
    return;
  }
  cancelDrag();
  pieces.forEach((piece) => piece.targetElement.classList.remove('is-near'));
  selectPiece(null);
  get('game-status').textContent = 'Đã bỏ chọn. Bé có thể chọn một mảnh khác nhé!';
});
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelDrag(); });
window.addEventListener('blur', cancelDrag);

document.querySelectorAll('[data-puzzle]').forEach((button) => {
  button.addEventListener('click', () => {
    const index = PUZZLES.findIndex((puzzle) => puzzle.id === button.dataset.puzzle);
    if (index !== puzzleIndex) loadPuzzle(index);
  });
  document.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.difficulty === difficulty) return;
      difficulty = button.dataset.difficulty;
      loadPuzzle(puzzleIndex);
    });
  });
});
get('reset-puzzle').addEventListener('click', () => loadPuzzle(puzzleIndex));
get('play-again').addEventListener('click', () => loadPuzzle(puzzleIndex));
get('next-puzzle').addEventListener('click', () => loadPuzzle((puzzleIndex + 1) % PUZZLES.length));
get('hint-toggle').addEventListener('click', () => {
  hints = !hints;
  renderFrame();
  get('game-status').textContent = hints ? 'Đây là cách ghép: đưa mảnh màu vào bóng có cùng màu và số nhé!' : 'Đã ẩn gợi ý. Bé tiếp tục khám phá nhé!';
});
get('open-help').addEventListener('click', () => {
  cancelDrag();
  get('help-dialog').showModal();
});
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
compactQuery.addEventListener('change', () => loadPuzzle(puzzleIndex, true));
PUZZLES.forEach((puzzle) => renderPreview(puzzle, document.querySelector(`[data-preview="${puzzle.id}"]`)));
loadPuzzle(0);
