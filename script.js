(() => {
  const dt = document.querySelector('#datetime');
  const fmt = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
  const tick = () => { if (dt) dt.textContent = fmt.format(new Date()).replace(',','').toUpperCase(); };
  tick(); setInterval(tick,30000);

  const labelMap = [
    ['profile','Voicebank'],['contact','Contact'],['about','About'],['readme','Archive'],['files','Archive']
  ];
  document.querySelectorAll('.taskbar>a').forEach(a => {
    if (a.dataset.label) return;
    const href = a.getAttribute('href') || '';
    const found = labelMap.find(([key]) => href.includes(key));
    a.dataset.label = found ? found[1] : 'Home';
  });

  let topZ = 60;
  document.querySelectorAll('.draggable').forEach(win => {
    const handle = win.querySelector('.drag-handle');
    if (!handle) return;
    const focus = () => { win.style.zIndex = ++topZ; };
    win.addEventListener('pointerdown', focus);
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      focus();
      const desk = win.closest('.desktop');
      if (!desk) return;
      const wr = win.getBoundingClientRect(), dr = desk.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY;
      const startLeft = wr.left - dr.left, startTop = wr.top - dr.top;
      win.style.right = 'auto'; win.style.bottom = 'auto';
      const move = ev => {
        const x = Math.max(0, Math.min(dr.width - wr.width, startLeft + ev.clientX - sx));
        const y = Math.max(0, Math.min(dr.height - wr.height, startTop + ev.clientY - sy));
        win.style.left = x + 'px'; win.style.top = y + 'px';
      };
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
  });

  const search = document.querySelector('#desktopSearch');
  if (search) {
    const items = [...document.querySelectorAll('[data-search]')];
    const hint = document.querySelector('#searchHint');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase(); let hits = 0;
      items.forEach(el => {
        const ok = !q || (el.dataset.search || '').toLowerCase().includes(q);
        el.classList.toggle('is-hidden', !ok); if (ok && q) hits++;
      });
      if (hint) hint.textContent = q ? `${hits} match${hits === 1 ? '' : 'es'}` : '';
    });
  }

  let audioCtx = null, musicTimer = null, musicStep = 0, musicStarted = 0;
  const notes = [261.63,329.63,392,523.25,392,329.63,293.66,349.23,440,587.33,440,349.23];
  function chirp(freq, when, dur=.12, volume=.04){
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type='square'; osc.frequency.setValueAtTime(freq,when);
    gain.gain.setValueAtTime(volume,when); gain.gain.exponentialRampToValueAtTime(.001,when+dur);
    osc.connect(gain).connect(audioCtx.destination); osc.start(when); osc.stop(when+dur);
  }
  const play = document.querySelector('#playPauseBtn'), trackTime = document.querySelector('#trackTime');
  if (play) {
    play.addEventListener('click', () => {
      if (musicTimer) {
        clearInterval(musicTimer); musicTimer = null; play.classList.remove('playing');
        return;
      }
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); musicStarted = Date.now(); musicStep = 0;
      musicTimer = setInterval(() => {
        chirp(notes[musicStep++ % notes.length], audioCtx.currentTime);
        const s = Math.floor((Date.now()-musicStarted)/1000); if (trackTime) trackTime.textContent = `00:${String(s%60).padStart(2,'0')}`;
      },180);
      play.classList.add('playing');
    });
  }

  const voiceBtn = document.querySelector('#voiceSampleBtn'), voiceTimer = document.querySelector('#voiceTimer');
  let voiceInterval = null, voiceSeconds = 0;
  voiceBtn?.addEventListener('click', () => {
    if (voiceInterval) { clearInterval(voiceInterval); voiceInterval = null; return; }
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); voiceSeconds = 0;
    voiceInterval = setInterval(() => {
      const melody = [392,440,523.25,659.25,523.25,440];
      chirp(melody[voiceSeconds % melody.length], audioCtx.currentTime, .16, .028);
      voiceSeconds++;
      if (voiceTimer) voiceTimer.textContent = `0:${String(voiceSeconds).padStart(2,'0')} / 0:16`;
      if (voiceSeconds >= 16) { clearInterval(voiceInterval); voiceInterval = null; voiceSeconds = 0; }
    },1000);
  });

  const expanders = [...document.querySelectorAll('.vbdeslangexpandable')];
  expanders.forEach(btn => btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    const opening = content.style.display !== 'block';
    expanders.forEach(other => { other.classList.remove('expanded'); if (other.nextElementSibling) other.nextElementSibling.style.display='none'; });
    if (opening) { btn.classList.add('expanded'); content.style.display='block'; }
  }));

  const gate = document.querySelector('#termsGate');
  if (gate) {
    const tabs = [...gate.querySelectorAll('.browser-tab[data-lang]')];
    const panels = [...gate.querySelectorAll('.language-panel')];
    function setLang(lang){
      tabs.forEach(t => t.classList.toggle('active', t.dataset.lang === lang));
      panels.forEach(p => p.classList.toggle('active', p.dataset.panel === lang));
    }
    tabs.forEach(t => t.addEventListener('click', () => setLang(t.dataset.lang)));
    gate.querySelectorAll('.language-panel').forEach(panel => {
      const box = panel.querySelector('.gate-checkbox');
      const accept = panel.querySelector('.gate-accept');
      const cancel = panel.querySelector('.gate-cancel');
      const sync = () => { accept.disabled = !box.checked; accept.classList.toggle('enabled', box.checked); };
      box.addEventListener('change', sync); sync();
      accept.addEventListener('click', () => { if (!box.checked) return; sessionStorage.setItem('guanhua-files-ok','1'); location.href='../files/'; });
      cancel.addEventListener('click', () => { location.href='../'; });
    });
  }

  if (document.body.dataset.requireGate === 'true' && sessionStorage.getItem('guanhua-files-ok') !== '1') {
    location.replace('../readme/');
  }
})();
