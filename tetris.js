document.body.dataset.theme = localStorage.getItem('neon-coil-theme') || 'lime';
if (localStorage.getItem('neon-coil-fullscreen') === 'true') document.addEventListener('pointerdown', () => document.querySelector('.shell').requestFullscreen().catch(() => {}), { once: true });
document.addEventListener('fullscreenchange', () => localStorage.setItem('neon-coil-fullscreen', document.fullscreenElement ? 'true' : 'false'));
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const statusEl = document.querySelector('#status');
const startBtn = document.querySelector('#start');
const cols = 10, rows = 20, size = 30;
const shapes = [[[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]];
let board, piece, x, y, score, timer, active = false;
function newPiece() { piece = shapes[Math.floor(Math.random() * shapes.length)].map(row => [...row]); x = 3; y = 0; if (collides()) endGame(); }
function collides() { return piece.some((row, py) => row.some((cell, px) => cell && (board[y + py]?.[x + px] === undefined || board[y + py][x + px]))); }
function merge() { piece.forEach((row, py) => row.forEach((cell, px) => { if (cell) board[y + py][x + px] = 1; })); }
function rotate() { const next = piece[0].map((_, i) => piece.map(row => row[i]).reverse()); const old = piece; piece = next; if (collides()) piece = old; }
function clearLines() { board = board.filter(row => row.some(cell => !cell)); const cleared = rows - board.length; while (board.length < rows) board.unshift(Array(cols).fill(0)); score += cleared * 100; scoreEl.textContent = String(score).padStart(3, '0'); }
function lockPiece() { merge(); clearLines(); newPiece(); }
function tick() { y++; if (collides()) { y--; lockPiece(); } draw(); }
function softDrop() { y++; if (collides()) { y--; lockPiece(); } draw(); }
function hardDrop() { while (!collides()) y++; y--; lockPiece(); draw(); }
function reset() { board = Array.from({length: rows}, () => Array(cols).fill(0)); score = 0; scoreEl.textContent = '000'; active = true; statusEl.textContent = 'LIVE'; startBtn.textContent = 'RESTART GAME'; newPiece(); clearInterval(timer); timer = setInterval(tick, 520); draw(); }
function endGame() { active = false; clearInterval(timer); statusEl.textContent = 'GAME OVER'; startBtn.textContent = 'PLAY AGAIN'; }
function draw() { ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--board'); ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid'); for (let i=1;i<cols;i++){ctx.beginPath();ctx.moveTo(i*size,0);ctx.lineTo(i*size,600);ctx.stroke();} for(let i=1;i<rows;i++){ctx.beginPath();ctx.moveTo(0,i*size);ctx.lineTo(300,i*size);ctx.stroke();} ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--lime'); board.forEach((row,py)=>row.forEach((cell,px)=>{if(cell)ctx.fillRect(px*size+2,py*size+2,size-4,size-4);})); ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--orange'); piece?.forEach((row,py)=>row.forEach((cell,px)=>{if(cell)ctx.fillRect((x+px)*size+2,(y+py)*size+2,size-4,size-4);})); }
document.addEventListener('keydown', event => { if (!active) return; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault(); if (event.key === 'ArrowLeft') { x--; if(collides())x++; } if(event.key==='ArrowRight'){x++;if(collides())x--;} if(event.key==='ArrowUp')rotate(); if(event.key==='ArrowDown')softDrop(); if(event.code==='Space')hardDrop(); draw(); });
startBtn.addEventListener('click', reset); reset(); active = false; clearInterval(timer); statusEl.textContent = 'READY'; startBtn.textContent = 'START GAME';
