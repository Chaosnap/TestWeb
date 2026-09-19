const clock = document.getElementById('clock');

function updateClock() {
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);
}

updateClock();
setInterval(updateClock, 30000);

const playButton = document.getElementById('playButton');
const trackLabel = document.getElementById('trackLabel');
let playing = false;

playButton.addEventListener('click', () => {
  playing = !playing;
  playButton.textContent = playing ? 'Ⅱ' : '▶';
  trackLabel.textContent = playing
    ? "Yuki's Theme — playing a silent demo"
    : "Yuki's Theme — demo loop";
});
