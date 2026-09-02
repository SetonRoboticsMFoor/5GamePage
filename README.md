# Michael-Foor-Eng-2-Lab-1

## Neon Coil Arcade

A dependency-free browser arcade with five games: Snake, Tetris, Space Invaders, Breakout, and Minesweeper. `index.html` is the game-select landing page; each cabinet links to its own HTML page.

Run it with:

```bash
python -m http.server 8000
```

Open <http://localhost:8000> in a browser. Snake uses arrow keys or WASD and Spacebar to pause; each game page lists its own controls. To publish, enable GitHub Pages for the repository's `main` branch and root folder.