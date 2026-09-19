(() => {
  const clock = document.getElementById('datetime');

  function updateClock() {
    if (!clock) return;
    const now = new Date();
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(now);
    const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    clock.textContent = `${date} ${time}`;
  }

  updateClock();
  window.setInterval(updateClock, 15000);

  // Desktop search: visually filters shortcuts/folders without navigating away.
  const search = document.getElementById('desktopSearch');
  const hint = document.getElementById('searchHint');
  const searchable = [...document.querySelectorAll('[data-search]')];

  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let matches = 0;

      searchable.forEach((item) => {
        const haystack = (item.dataset.search || item.textContent || '').toLowerCase();
        const matched = !q || haystack.includes(q);
        item.classList.toggle('search-hidden', !!q && !matched);
        item.classList.toggle('search-match', !!q && matched);
        if (q && matched) matches += 1;
      });

      if (!hint) return;
      if (!q) {
        hint.classList.remove('show');
        hint.textContent = '';
      } else {
        hint.textContent = matches ? `${matches} desktop item${matches === 1 ? '' : 's'} found` : 'Nothing found on this desktop';
        hint.classList.add('show');
      }
    });

    search.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        search.value = '';
        search.dispatchEvent(new Event('input'));
        search.blur();
      }
    });
  }

  // Bring clicked windows forward and allow dragging from their title areas.
  const desktop = document.getElementById('desktop');
  const shell = document.querySelector('.desktop-window');
  const windows = [...document.querySelectorAll('.window')];
  let z = 30;

  function focusWindow(win) {
    windows.forEach((item) => item.classList.remove('is-focused'));
    win.classList.add('is-focused');
    win.style.zIndex = String(++z);
  }

  windows.forEach((win) => {
    win.addEventListener('pointerdown', () => focusWindow(win));
  });

  document.querySelectorAll('.draggable').forEach((win) => {
    const handle = win.querySelector('.drag-handle') || win;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let left = 0;
    let top = 0;

    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !desktop || !shell) return;
      if (event.target.closest('a,button,input')) return;
      dragging = true;
      focusWindow(win);
      const desktopRect = desktop.getBoundingClientRect();
      const winRect = win.getBoundingClientRect();
      const scale = shell.getBoundingClientRect().width / shell.offsetWidth || 1;
      startX = event.clientX;
      startY = event.clientY;
      left = (winRect.left - desktopRect.left) / scale;
      top = (winRect.top - desktopRect.top) / scale;
      win.style.left = `${left}px`;
      win.style.top = `${top}px`;
      win.style.right = 'auto';
      win.style.bottom = 'auto';
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', (event) => {
      if (!dragging || !desktop || !shell) return;
      const scale = shell.getBoundingClientRect().width / shell.offsetWidth || 1;
      const dx = (event.clientX - startX) / scale;
      const dy = (event.clientY - startY) / scale;
      const maxLeft = Math.max(0, desktop.clientWidth - win.offsetWidth - 5);
      const maxTop = Math.max(0, desktop.clientHeight - win.offsetHeight - 5);
      win.style.left = `${Math.min(maxLeft, Math.max(0, left + dx))}px`;
      win.style.top = `${Math.min(maxTop, Math.max(0, top + dy))}px`;
    });

    const stop = (event) => {
      if (!dragging) return;
      dragging = false;
      try { handle.releasePointerCapture?.(event.pointerId); } catch (_) {}
    };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  });

  // Tiny synthesized chiptune. No external/copyrighted audio file is required.
  const playButton = document.getElementById('playPauseBtn');
  const trackTime = document.getElementById('trackTime');
  let audioContext = null;
  let masterGain = null;
  let timer = null;
  let timeTimer = null;
  let step = 0;
  let elapsed = 0;

  const melody = [659.25, 783.99, 880, 783.99, 659.25, 523.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 0];
  const bass = [130.81, 130.81, 174.61, 174.61, 146.83, 146.83, 196, 196];

  function beep(frequency, duration, volume, type = 'square') {
    if (!audioContext || !masterGain || !frequency) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const t = audioContext.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  function tick() {
    beep(melody[step % melody.length], 0.12, 0.11);
    if (step % 2 === 0) beep(bass[Math.floor(step / 2) % bass.length], 0.18, 0.07, 'triangle');
    step += 1;
  }

  async function startAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) {
      audioContext = new AudioCtx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.45;
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') await audioContext.resume();
    tick();
    timer = window.setInterval(tick, 165);
    timeTimer = window.setInterval(() => {
      elapsed += 1;
      if (trackTime) trackTime.textContent = `00:${String(elapsed % 60).padStart(2, '0')}`;
    }, 1000);
    playButton?.classList.add('is-playing');
    playButton?.setAttribute('aria-label', 'Pause Yuki theme');
  }

  function stopAudio() {
    window.clearInterval(timer);
    window.clearInterval(timeTimer);
    timer = null;
    timeTimer = null;
    playButton?.classList.remove('is-playing');
    playButton?.setAttribute('aria-label', 'Play Yuki theme');
  }

  playButton?.addEventListener('click', () => {
    if (timer) stopAudio();
    else startAudio();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) stopAudio();
  });
})();
