from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


HOST = "0.0.0.0"
PORT = 8000

PAGE = r"""<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Neon Coil</title>
	<style>
		:root { --ink: #f4f7f0; --muted: #9ba89e; --panel: #17221d; --line: #2d3d33; --lime: #c7f464; --orange: #ff8157; }
		* { box-sizing: border-box; }
		body { margin: 0; min-height: 100vh; color: var(--ink); background: radial-gradient(circle at 80% 0%, #293e31 0, #111713 42%, #0b0f0d 100%); font-family: Georgia, serif; }
		main { width: min(1080px, 100%); margin: auto; padding: 34px 22px; }
		header { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 22px; }
		.eyebrow { margin: 0 0 8px; color: var(--lime); font: 700 12px/1.2 monospace; letter-spacing: 2px; text-transform: uppercase; }
		h1 { margin: 0; font-size: clamp(42px, 8vw, 82px); line-height: .9; letter-spacing: 0; }
		.intro { max-width: 270px; margin: 0; color: var(--muted); font: 14px/1.5 monospace; }
		.layout { display: grid; grid-template-columns: minmax(280px, 680px) 1fr; gap: 22px; align-items: start; }
		.board-wrap { position: relative; padding: 12px; background: var(--panel); border: 1px solid var(--line); box-shadow: 12px 12px 0 #0a0d0b; }
		canvas { display: block; width: 100%; aspect-ratio: 1; background: #0d1510; image-rendering: pixelated; }
		.status { position: absolute; top: 26px; left: 26px; padding: 7px 10px; color: #101710; background: var(--lime); font: 700 12px monospace; }
		aside { display: grid; gap: 14px; }
		.score { padding: 20px; border-top: 3px solid var(--orange); background: var(--panel); }
		.score span { display: block; color: var(--muted); font: 11px monospace; text-transform: uppercase; }
		.score strong { display: block; margin-top: 2px; color: var(--lime); font: 700 54px/1 monospace; }
		.controls { color: var(--muted); font: 13px/1.7 monospace; }
		button { width: 100%; padding: 13px 16px; border: 0; color: #101710; background: var(--lime); cursor: pointer; font: 700 13px monospace; }
		button:hover { background: #e0ff91; }
		.hint { margin: 0; color: var(--muted); font: 12px/1.5 monospace; }
		@media (max-width: 720px) { main { padding: 24px 14px; } header { display: block; } .intro { margin-top: 15px; } .layout { grid-template-columns: 1fr; } .board-wrap { box-shadow: 6px 6px 0 #0a0d0b; } }
	</style>
</head>
<body>
	<main>
		<header><div><p class="eyebrow">Arcade / 001</p><h1>Neon Coil</h1></div><p class="intro">Eat the bright fruit. Grow with every bite. Keep your cool when the walls close in.</p></header>
		<section class="layout">
			<div class="board-wrap"><div class="status" id="status">READY</div><canvas id="game" width="600" height="600" aria-label="Snake game board"></canvas></div>
			<aside>
				<div class="score"><span>Current score</span><strong id="score">000</strong></div>
				<div class="controls">MOVE<br>Arrow keys or WASD<br><br>PAUSE<br>Spacebar</div>
				<button id="start">START GAME</button>
				<p class="hint">Your best run is saved in this browser.</p>
			</aside>
		</section>
	</main>
	<script>
		const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
		const scoreEl = document.querySelector('#score'), statusEl = document.querySelector('#status'), startBtn = document.querySelector('#start');
		const grid = 24, cell = canvas.width / grid;
		let snake, food, direction, queued, score, running, paused, timer;
		const bestKey = 'neon-coil-best';

		function reset() {
			snake = [{ x: 12, y: 13 }, { x: 11, y: 13 }, { x: 10, y: 13 }];
			direction = { x: 1, y: 0 }; queued = direction; score = 0; paused = false; running = true;
			placeFood(); updateScore(); statusEl.textContent = 'LIVE'; startBtn.textContent = 'RESTART GAME'; draw();
			clearInterval(timer); timer = setInterval(tick, 105);
		}
		function placeFood() {
			do { food = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) }; }
			while (snake.some(part => part.x === food.x && part.y === food.y));
		}
		function tick() {
			if (!running || paused) return;
			direction = queued; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
			if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid || snake.some(part => part.x === head.x && part.y === head.y)) return end();
			snake.unshift(head);
			if (head.x === food.x && head.y === food.y) { score += 10; placeFood(); updateScore(); } else snake.pop();
			draw();
		}
		function end() { running = false; clearInterval(timer); statusEl.textContent = 'GAME OVER'; startBtn.textContent = 'PLAY AGAIN'; const best = Math.max(score, Number(localStorage.getItem(bestKey) || 0)); localStorage.setItem(bestKey, best); draw(true); }
		function updateScore() { scoreEl.textContent = String(score).padStart(3, '0'); }
		function draw(gameOver = false) {
			ctx.fillStyle = '#0d1510'; ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.strokeStyle = 'rgba(199,244,100,.06)'; ctx.lineWidth = 1;
			for (let i = 1; i < grid; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(canvas.width, i * cell); ctx.stroke(); }
			ctx.fillStyle = '#ff8157'; ctx.beginPath(); ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * .29, 0, Math.PI * 2); ctx.fill();
			snake.forEach((part, index) => { ctx.fillStyle = index === 0 ? '#e5ff9c' : '#91bd4c'; ctx.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4); });
			if (gameOver) { ctx.fillStyle = 'rgba(8,12,9,.68)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
		}
		function setDirection(x, y) { if (x !== -direction.x || y !== -direction.y) queued = { x, y }; }
		document.addEventListener('keydown', event => { const keys = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] }; if (keys[event.key]) { event.preventDefault(); setDirection(...keys[event.key]); } if (event.code === 'Space' && running) { paused = !paused; statusEl.textContent = paused ? 'PAUSED' : 'LIVE'; } });
		startBtn.addEventListener('click', reset); reset(); running = false; clearInterval(timer); statusEl.textContent = 'READY'; startBtn.textContent = 'START GAME';
	</script>
</body>
</html>"""


class GameHandler(BaseHTTPRequestHandler):
		def do_GET(self):
				if self.path != "/":
						self.send_error(404)
						return
				content = PAGE.encode("utf-8")
				self.send_response(200)
				self.send_header("Content-Type", "text/html; charset=utf-8")
				self.send_header("Content-Length", str(len(content)))
				self.end_headers()
				self.wfile.write(content)

		def log_message(self, format_string, *args):
				return


if __name__ == "__main__":
		server = ThreadingHTTPServer((HOST, PORT), GameHandler)
		print(f"Neon Coil is running at http://localhost:{PORT}")
		try:
				server.serve_forever()
		except KeyboardInterrupt:
				print("\nServer stopped.")
		finally:
				server.server_close()
