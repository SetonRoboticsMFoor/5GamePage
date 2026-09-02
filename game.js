const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const bestElement = document.querySelector('#best');
const statusElement = document.querySelector('#status');
const startButton = document.querySelector('#start');
const gridSize = 24;
const cellSize = canvas.width / gridSize;
const bestKey = 'neon-coil-best';
let snake;
let food;
let direction;
let queuedDirection;
let score;
let running;
let paused;
let timer;

function getThemeColors() {
  const styles = getComputedStyle(document.body);
  return {
    board: styles.getPropertyValue('--board').trim() || '#0d1510',
    grid: styles.getPropertyValue('--grid').trim() || 'rgba(199, 244, 100, .06)',
    food: styles.getPropertyValue('--food').trim() || '#ff8157',
    head: styles.getPropertyValue('--head').trim() || '#e5ff9c',
    snake: styles.getPropertyValue('--snake').trim() || '#91bd4c',
    overlay: styles.getPropertyValue('--overlay').trim() || 'rgba(8, 12, 9, .68)'
  };
}

function reset() {
  snake = [{ x: 12, y: 13 }, { x: 11, y: 13 }, { x: 10, y: 13 }];
  direction = { x: 1, y: 0 };
  queuedDirection = direction;
  score = 0;
  paused = false;
  running = true;
  placeFood();
  updateScore();
  statusElement.textContent = 'LIVE';
  startButton.textContent = 'RESTART GAME';
  clearInterval(timer);
  timer = setInterval(tick, 105);
  draw();
}

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function tick() {
  if (!running || paused) return;
  direction = queuedDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) return endGame();

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    placeFood();
    updateScore();
  } else {
    snake.pop();
  }
  draw();
}

function endGame() {
  running = false;
  clearInterval(timer);
  statusElement.textContent = 'GAME OVER';
  startButton.textContent = 'PLAY AGAIN';
  const best = Math.max(score, Number(localStorage.getItem(bestKey) || 0));
  localStorage.setItem(bestKey, best);
  bestElement.textContent = String(best).padStart(3, '0');
  draw(true);
}

function updateScore() {
  scoreElement.textContent = String(score).padStart(3, '0');
  bestElement.textContent = String(Number(localStorage.getItem(bestKey) || 0)).padStart(3, '0');
}

function draw(gameOver = false) {
  const colors = getThemeColors();
  context.fillStyle = colors.board;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = colors.grid;
  context.lineWidth = 1;
  for (let index = 1; index < gridSize; index += 1) {
    context.beginPath(); context.moveTo(index * cellSize, 0); context.lineTo(index * cellSize, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, index * cellSize); context.lineTo(canvas.width, index * cellSize); context.stroke();
  }
  context.fillStyle = colors.food;
  context.beginPath();
  context.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize * .29, 0, Math.PI * 2);
  context.fill();
  snake.forEach((part, index) => {
    context.fillStyle = index === 0 ? colors.head : colors.snake;
    context.fillRect(part.x * cellSize + 2, part.y * cellSize + 2, cellSize - 4, cellSize - 4);
  });
  if (gameOver) {
    context.fillStyle = colors.overlay;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function setDirection(x, y) {
  if (x !== -direction.x || y !== -direction.y) queuedDirection = { x, y };
}

document.addEventListener('keydown', (event) => {
  const keys = {
    ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0]
  };
  if (keys[event.key]) {
    event.preventDefault();
    setDirection(...keys[event.key]);
  }
  if (event.code === 'Space' && running) {
    paused = !paused;
    statusElement.textContent = paused ? 'PAUSED' : 'LIVE';
  }
});

startButton.addEventListener('click', reset);
reset();
running = false;
clearInterval(timer);
statusElement.textContent = 'READY';
startButton.textContent = 'START GAME';
