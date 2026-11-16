import { PUZZLES, constrainPosition, createBoard, isWithinSnap } from './puzzle.mjs';
import { createGameAudio } from '../audio.mjs';
import { english, initGameLanguage } from '../i18n.mjs';

const i18n = initGameLanguage();
const text = i18n.text;
const get = (id) => document.getElementById(id);
const board = get('puzzle-board');
const targets = get('targets');
const piecesLayer = get('pieces');
const completionDialog = get('completion-dialog');
const compactQuery = matchMedia('(max-width: 700px)');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const completed = new Set();
let puzzleIndex = 0;
let layout;
let pieces = [];
let selected = null;
let drag = null;
let hints = false;
let confettiTimer;
const audio = createGameAudio({
  theme: 'puzzle', button: get('sound-toggle'), i18n,
  onError: (message, error) => {
    console.error(message, error);
    text(get('game-notice'), message);
    get('game-notice').hidden = false;
  }
});

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
  const targetActive = hints && piece === selected;
  piece.targetElement.setAttribute('tabindex', targetActive ? '0' : '-1');
  piece.targetElement.setAttribute('aria-disabled', String(!targetActive));
}

function selectPiece(piece) {
  if (piece && selected !== piece) audio.tone(520, .08, { volume: .07, to: 640 });
  selected = piece;
  pieces.forEach((item) => {
    if (item !== piece) item.targetElement.classList.remove('is-near');
    updatePiece(item);
  });
  if (piece) {
    const instruction = hints ? `Kéo hoặc chạm vào bóng có số ${piece.number} nhé!` :
      'Nhìn hình mẫu rồi tìm vị trí trong khung nhé!';
    text(get('game-status'), `Đã chọn mảnh ${piece.number}: ${piece.name.toLowerCase()}. ${instruction}`, `Selected piece ${piece.number}: ${english(piece.name).toLowerCase()}. ${hints ? `Drag or tap target ${piece.number}!` : 'Look at the model and find its place in the frame!'}`);
  }
}

function screenMatrix() {
  const matrix = board.getScreenCTM();
  if (matrix && matrix.a * matrix.d - matrix.b * matrix.c !== 0) return matrix;
  const message = 'Chưa thể xác định vị trí bảng ghép. Hãy tải lại trang rồi thử lại nhé.';
  console.error(message);
  text(get('game-notice'), message, 'Could not locate the puzzle board. Reload the page and try again.');
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
  text(get('piece-count').querySelector('small'), '/ 7 mảnh');
  document.querySelector('.progress-counter').setAttribute('aria-valuenow', count);
  text(get('game-status'), count === 7 ? 'Bé đã ghép đủ 7 mảnh. Tuyệt vời!' : `Khớp rồi! Bé đã ghép ${count} / 7 mảnh. Tiếp tục nào!`, count === 7 ? 'All 7 pieces placed. Wonderful!' : `It fits! ${count} / 7 pieces placed. Keep going!`);
}

function celebrate() {
  audio.setMusicPlaying(false);
  audio.chime([523, 659, 784, 1047]);
  const puzzle = PUZZLES[puzzleIndex];
  completed.add(puzzle.id);
  const option = document.querySelector(`[data-puzzle="${puzzle.id}"]`);
  option.classList.add('is-finished');
  text(option.querySelector('.completion-label'), 'Đã hoàn thành');
  text(get('completion-message'), puzzle.celebration);
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
  audio.chime([660 + piece.number * 25, 880 + piece.number * 25], .06);
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
  targets.toggleAttribute('hidden', !hints);
  targets.setAttribute('aria-hidden', String(!hints));
  targets.classList.toggle('targets-hinted', hints);
  const hint = get('hint-toggle');
  hint.setAttribute('aria-pressed', String(hints));
  text(hint.querySelector('span'), hints ? 'Ẩn gợi ý' : 'Gợi ý');
  pieces.forEach(updatePiece);
}

function loadPuzzle(index, preserve = false) {
  cancelDrag();
  const oldPieces = preserve ? pieces : [];
  puzzleIndex = index;
  selected = null;
  clearTimeout(confettiTimer);
  get('confetti').replaceChildren();
  if (completionDialog.open && !preserve) completionDialog.close();
  audio.setMusicPlaying(!completionDialog.open && !get('help-dialog').open);
  const puzzle = PUZZLES[index];
  if (!preserve) hints = false;
  layout = createBoard(puzzle, compactQuery.matches);
  board.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
  text(get('board-title'), `Bảng ghép hình ${puzzle.name.toLowerCase()}`, `${english(puzzle.name)} puzzle board`);
  text(get('puzzle-title'), puzzle.name);
  get('level-number').textContent = String(index + 1).padStart(2, '0');
  document.querySelectorAll('[data-puzzle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.puzzle === puzzle.id));
    const finished = completed.has(button.dataset.puzzle);
    button.classList.toggle('is-finished', finished);
    text(button.querySelector('.completion-label'), finished ? 'Đã hoàn thành' : '');
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
    i18n.attr(target, 'aria-label', `Vị trí mảnh ${state.number}: ${state.name.toLowerCase()}`, `Target for piece ${state.number}: ${english(state.name).toLowerCase()}`);
    target.style.setProperty('--piece-color', state.color);
    target.setAttribute('transform', `translate(${state.target.x} ${state.target.y})`);
    target.append(svgElement('polygon', { points: polygonPoints(state.points) }), numberLabel(state));
    targets.append(target);
    const element = svgElement('g', {
      class: 'puzzle-piece', 'data-id': state.id, role: 'button', tabindex: '0',
      'aria-label': `Mảnh ${state.number}: ${state.name.toLowerCase()}`
    });
    i18n.attr(element, 'aria-label', `Mảnh ${state.number}: ${state.name.toLowerCase()}`, `Piece ${state.number}: ${english(state.name).toLowerCase()}`);
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
  const { frame } = layout;
  get('board-decoration').replaceChildren(svgElement('rect', {
    class: 'outer-frame', x: frame.x, y: frame.y, width: frame.width, height: frame.height, rx: 18
  }));
  renderFrame();
  const count = pieces.filter((piece) => piece.placed).length;
  get('piece-count').innerHTML = `${count} <small>/ 7 mảnh</small>`;
  text(get('piece-count').querySelector('small'), '/ 7 mảnh');
  document.querySelector('.progress-counter').setAttribute('aria-valuenow', count);
  text(get('game-status'), count === 7 ? 'Bé đã ghép đủ 7 mảnh. Tuyệt vời!' :
    count ? `Bé đã ghép ${count} / 7 mảnh. Tiếp tục nào!` :
    hints ? 'Bé thử kéo một mảnh màu vào bóng hình nhé!' : 'Bé ghép 7 mảnh vào trong khung để tạo thành hình mẫu nhé!',
  count === 7 ? 'All 7 pieces placed. Wonderful!' : count ? `${count} / 7 pieces placed. Keep going!` : hints ? 'Try dragging a colored piece onto its target!' : 'Fit all 7 pieces inside the frame to match the model!');
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
  else {
    audio.tone(330, .12, { volume: .055, to: 280 });
    text(get('game-status'), hints ?
      `Mảnh ${piece.number} chưa khớp. Thử đưa gần bóng có số ${piece.number}, hoặc chạm vào bóng đó nhé!` :
      `Mảnh ${piece.number} chưa khớp. Nhìn hình mẫu rồi thử sắp xếp lại nhé!`, hints ? `Piece ${piece.number} does not fit yet. Move it near target ${piece.number}, or tap that target!` : `Piece ${piece.number} does not fit yet. Look at the model and try again!`);
  }
});
['pointercancel', 'lostpointercapture'].forEach((type) => {
  board.addEventListener(type, (event) => { if (drag?.pointerId === event.pointerId) cancelDrag(); });
});

board.addEventListener('click', (event) => {
  if (!hints) return;
  const target = event.target.closest('.target-piece');
  if (!target || !selected) return;
  if (target === selected.targetElement) placePiece(selected);
  else text(get('game-status'), `Bé tìm bóng có số ${selected.number} để ghép mảnh này nhé!`, `Find target ${selected.number} to place this piece!`);
});

board.addEventListener('keydown', (event) => {
  const target = event.target.closest('.target-piece');
  if (hints && target && ['Enter', ' '].includes(event.key) && selected?.targetElement === target) {
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
  text(get('game-status'), 'Đã bỏ chọn. Bé có thể chọn một mảnh khác nhé!', 'Deselected. Choose another piece!');
});
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelDrag(); });
window.addEventListener('blur', cancelDrag);

document.querySelectorAll('[data-puzzle]').forEach((button) => {
  button.addEventListener('click', () => {
    const index = PUZZLES.findIndex((puzzle) => puzzle.id === button.dataset.puzzle);
    if (index !== puzzleIndex) {
      audio.tone(740, .1, { volume: .07 });
      loadPuzzle(index);
    }
  });
});
get('reset-puzzle').addEventListener('click', () => loadPuzzle(puzzleIndex));
get('play-again').addEventListener('click', () => loadPuzzle(puzzleIndex));
get('next-puzzle').addEventListener('click', () => loadPuzzle((puzzleIndex + 1) % PUZZLES.length));
get('hint-toggle').addEventListener('click', () => {
  hints = !hints;
  audio.tone(hints ? 880 : 660, .12, { volume: .07 });
  renderFrame();
  text(get('game-status'), hints ? 'Đây là cách ghép: đưa mảnh màu vào bóng có cùng màu và số nhé!' : 'Đã ẩn gợi ý. Bé tiếp tục khám phá nhé!', hints ? 'Match each piece to the target with the same color and number!' : 'Hints hidden. Keep exploring!');
});
get('open-help').addEventListener('click', () => {
  cancelDrag();
  audio.setMusicPlaying(false);
  get('help-dialog').showModal();
});
[get('help-dialog'), completionDialog].forEach((dialog) => {
  dialog.addEventListener('close', () => audio.setMusicPlaying(!get('help-dialog').open && !completionDialog.open));
});
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
compactQuery.addEventListener('change', () => loadPuzzle(puzzleIndex, true));
PUZZLES.forEach((puzzle) => renderPreview(puzzle, document.querySelector(`[data-preview="${puzzle.id}"]`)));
loadPuzzle(0);
