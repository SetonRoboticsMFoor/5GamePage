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
    if (document.fullscreenElement) document.exitFullscreen();
    else document.querySelector('.shell').requestFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.textContent = document.fullscreenElement ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN';
  });
}