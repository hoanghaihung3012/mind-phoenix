import { parseNames, readNamesFile, remainingNames, shuffle, class46Names } from '../../shared/core/participants.mjs';
import { GameAudio } from '../../shared/core/audio.mjs';
import { createSpin, numberRange, validateNames } from './wheel.mjs';
import { initLanguage } from '../../shared/core/i18n.mjs';

const i18n = initLanguage();
const canvas = document.getElementById('wheel-canvas');
const context = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const namesInput = document.getElementById('names-input');
const removeWinnerCheck = document.getElementById('remove-winner');
const winnerDialog = document.getElementById('winner-dialog');
const winnerName = document.getElementById('winner-name');
const winnerClose = document.getElementById('winner-close');
const soundToggle = document.getElementById('sound-toggle');
const statusMessage = document.getElementById('status-message');
const fileInput = document.getElementById('file-input');

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#82E0AA', '#F1948A', '#85C1E9',
  '#F8C471', '#D7BDE2', '#A3E4D7', '#FAD7A0', '#EDBB99'
];

let names = [...class46Names];
namesInput.value = names.join('\n');
let rotation = 0;
let isSpinning = false;
let currentWinner = null;

const audio = new GameAudio({
  theme: 'duck',
  enabled: true,
  onError: (msg) => { statusMessage.textContent = msg; }
});

function drawWheel() {
  const width = canvas.width;
  const height = canvas.height;
  const radius = Math.min(width, height) / 2 - 10;
  const centerX = width / 2;
  const centerY = height / 2;

  context.clearRect(0, 0, width, height);

  if (names.length === 0) {
    context.fillStyle = '#ccc';
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fill();
    return;
  }

  const arc = (2 * Math.PI) / names.length;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotation);

  names.forEach((name, i) => {
    const angle = i * arc;
    context.beginPath();
    context.fillStyle = COLORS[i % COLORS.length];
    context.moveTo(0, 0);
    context.arc(0, 0, radius, angle, angle + arc);
    context.lineTo(0, 0);
    context.fill();
    context.stroke();

    context.save();
    context.fillStyle = '#2b2550';
    context.font = 'bold 16px Nunito, sans-serif';
    context.translate(
      Math.cos(angle + arc / 2) * (radius * 0.65),
      Math.sin(angle + arc / 2) * (radius * 0.65)
    );
    context.rotate(angle + arc / 2 + Math.PI / 2);
    context.textAlign = 'center';
    context.fillText(name, 0, 0);
    context.restore();
  });

  context.restore();

  // Draw pointer at the top
  context.fillStyle = '#2b2550';
  context.beginPath();
  context.moveTo(centerX - 15, centerY - radius - 5);
  context.lineTo(centerX + 15, centerY - radius - 5);
  context.lineTo(centerX, centerY - radius + 20);
  context.closePath();
  context.fill();
}

function updateNames() {
  const text = namesInput.value;
  names = parseNames(text);
  const error = validateNames(names, i18n.language);
  if (error) {
    statusMessage.textContent = error;
    spinBtn.disabled = true;
  } else {
    statusMessage.textContent = '';
    spinBtn.disabled = names.length === 0;
  }
  drawWheel();
}

namesInput.addEventListener('input', updateNames);

document.getElementById('btn-default').addEventListener('click', () => {
  names = [...class46Names];
  namesInput.value = names.join('\n');
  updateNames();
});

document.getElementById('btn-shuffle').addEventListener('click', () => {
  names = shuffle(names);
  namesInput.value = names.join('\n');
  updateNames();
});

document.getElementById('btn-range').addEventListener('click', () => {
  const from = parseInt(prompt(i18n.t('Từ số:', 'From number:'), '1'), 10);
  const to = parseInt(prompt(i18n.t('Đến số:', 'To number:'), '30'), 10);
  if (!isNaN(from) && !isNaN(to)) {
    names = numberRange(from, to);
    namesInput.value = names.join('\n');
    updateNames();
  }
});

document.getElementById('btn-clear').addEventListener('click', () => {
  names = [];
  namesInput.value = '';
  updateNames();
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      names = await readNamesFile(file);
      namesInput.value = names.join('\n');
      updateNames();
    } catch (err) {
      alert(i18n.t(err.message, err.englishMessage || err.message));
    }
  }
});

spinBtn.addEventListener('click', async () => {
  if (isSpinning || names.length === 0) return;
  const error = validateNames(names, i18n.language);
  if (error) {
    statusMessage.textContent = error;
    return;
  }

  await audio.activate();
  isSpinning = true;
  spinBtn.disabled = true;
  statusMessage.textContent = '';

  const { targetRotation, winnerIndex, duration } = createSpin(names, rotation);
  currentWinner = names[winnerIndex];

  const startTime = performance.now();
  const startRotation = rotation;

  function animate(currentTime) {
    const elapsed = (currentTime - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    rotation = startRotation + (targetRotation - startRotation) * ease;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;
      audio.chime();
      winnerName.textContent = currentWinner;
      winnerDialog.showModal();
    }
  }

  requestAnimationFrame(animate);
});

winnerClose.addEventListener('click', () => {
  winnerDialog.close();
  if (removeWinnerCheck.checked && currentWinner) {
    names = remainingNames(names, [{ id: names.indexOf(currentWinner) }]);
    namesInput.value = names.join('\n');
    updateNames();
  }
});

soundToggle.addEventListener('click', () => {
  audio.setEnabled(!audio.enabled);
  soundToggle.setAttribute('aria-pressed', String(audio.enabled));
});

drawWheel();
