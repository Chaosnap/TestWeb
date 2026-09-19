(() => {
  const dt = document.querySelector('#datetime');
  const fmt = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
  const tick = () => { if (dt) dt.textContent = fmt.format(new Date()).replace(',','').toUpperCase(); };
  tick(); setInterval(tick,30000);

  let topZ = 40;
  document.querySelectorAll('.draggable').forEach(win => {
    const handle = win.querySelector('.drag-handle');
    if(!handle) return;
    const focus = () => { win.style.zIndex = ++topZ; };
    win.addEventListener('pointerdown',focus);
    handle.addEventListener('pointerdown',e => {
      if (e.button !== 0) return;
      focus();
      const desk = win.closest('.desktop');
      const wr = win.getBoundingClientRect(), dr = desk.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY;
      const startLeft = wr.left - dr.left, startTop = wr.top - dr.top;
      win.style.right='auto'; win.style.bottom='auto';
      win.setPointerCapture?.(e.pointerId);
      const move = ev => {
        const x = Math.max(0, Math.min(dr.width - wr.width, startLeft + ev.clientX - sx));
        const y = Math.max(0, Math.min(dr.height - wr.height, startTop + ev.clientY - sy));
        win.style.left = x + 'px'; win.style.top = y + 'px';
      };
      const up = () => { window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); };
      window.addEventListener('pointermove',move); window.addEventListener('pointerup',up);
    });
  });

  const search = document.querySelector('#desktopSearch');
  if(search){
    const items=[...document.querySelectorAll('[data-search]')], hint=document.querySelector('#searchHint');
    search.addEventListener('input',()=>{
      const q=search.value.trim().toLowerCase(); let hits=0;
      items.forEach(el=>{const ok=!q||(el.dataset.search||'').toLowerCase().includes(q); el.classList.toggle('is-hidden',!ok); if(ok&&q) hits++;});
      if(hint) hint.textContent=q ? `${hits} item${hits===1?'':'s'} matched` : '';
    });
  }

  const play = document.querySelector('#playPauseBtn'), trackTime=document.querySelector('#trackTime');
  let ctx=null, timer=null, step=0, started=0;
  const notes=[261.63,329.63,392,523.25,392,329.63,293.66,349.23,440,587.33,440,349.23];
  function chirp(freq,when,dur=.12){
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type='square'; osc.frequency.setValueAtTime(freq,when);
    gain.gain.setValueAtTime(.045,when); gain.gain.exponentialRampToValueAtTime(.001,when+dur);
    osc.connect(gain).connect(ctx.destination); osc.start(when); osc.stop(when+dur);
  }
  function startMusic(){
    ctx ||= new (window.AudioContext||window.webkitAudioContext)(); ctx.resume(); started=Date.now(); step=0;
    timer=setInterval(()=>{chirp(notes[step%notes.length],ctx.currentTime); step++; const s=Math.floor((Date.now()-started)/1000); if(trackTime) trackTime.textContent=`00:${String(s%60).padStart(2,'0')}`;},180);
    play.textContent='Ⅱ'; play.setAttribute('aria-label','Pause demo');
  }
  function stopMusic(){clearInterval(timer);timer=null;play.textContent='▶';play.setAttribute('aria-label','Play demo');}
  play?.addEventListener('click',()=>timer?stopMusic():startMusic());

  const gate=document.querySelector('#termsGate');
  if(gate){
    const box=document.querySelector('#agreeTerms'), accept=document.querySelector('#acceptTerms');
    const sync=()=>accept.disabled=!box.checked; box.addEventListener('change',sync); sync();
    accept.addEventListener('click',()=>{sessionStorage.setItem('guanhua-files-ok','1'); location.href='../files/';});
    document.querySelector('#cancelTerms')?.addEventListener('click',()=>location.href='../');
  }
  if(document.body.dataset.requireGate==='true' && sessionStorage.getItem('guanhua-files-ok')!=='1'){
    location.replace('../readme/');
  }
})();