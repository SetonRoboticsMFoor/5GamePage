const savedTheme = localStorage.getItem('neon-coil-theme') || 'lime';
document.body.dataset.theme = savedTheme;
const themeSelect = document.querySelector('#theme');
const fullscreenButton = document.querySelector('#fullscreen');
if (themeSelect) {
  themeSelect.value = savedTheme;
  themeSelect.addEventListener('change', (event) => {
    document.body.dataset.theme = event.target.value;
    localStorage.setItem('neon-coil-theme', event.target.value);
  });
}
if (fullscreenButton) {
  fullscreenButton.addEventListener('click', () => {
    if (document.fullscreenElement) {
      localStorage.setItem('neon-coil-fullscreen', 'false');
      document.exitFullscreen();
    } else {
      localStorage.setItem('neon-coil-fullscreen', 'true');
      document.querySelector('.shell').requestFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    localStorage.setItem('neon-coil-fullscreen', document.fullscreenElement ? 'true' : 'false');
    fullscreenButton.textContent = document.fullscreenElement ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN';
  });
}
document.querySelectorAll('.game-card').forEach((card) => card.addEventListener('click', () => {
  if (document.fullscreenElement) localStorage.setItem('neon-coil-fullscreen', 'true');
}));
if (localStorage.getItem('neon-coil-fullscreen') === 'true' && !document.fullscreenElement) {
  const resumeFullscreen = () => {
    document.querySelector('.shell').requestFullscreen().catch(() => {});
    document.removeEventListener('pointerdown', resumeFullscreen);
  };
  document.addEventListener('pointerdown', resumeFullscreen, { once: true });
}