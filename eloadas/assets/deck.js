/* A M.I. képmásunkra — a diák működése (lapozás, lépésenkénti megjelenítés, gépelés). */
/* ===== BEÁLLÍTÁSOK ===== */
const GEPELES_MS = 24;                 // gépelési sebesség: ennyi ezredmásodperc betűnként (kisebb = gyorsabb)
const TOVABB_ELOBB_A_DIAN_BELUL = true; // true: a → / lapozó előbb a dián lévő kérdést, címszót indítja

/* ===== innentől nem kell szerkeszteni ===== */
const stage = document.getElementById('stage');
const slides = [...stage.querySelectorAll(':scope > .slide')];
const bar = document.querySelector('#bar i');
const count = document.getElementById('count');
const menu = document.getElementById('menu');
let cur = 0, typing = null;

function fit(){
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); fit();

/* pixeltükör: homályos (dithered) vagy tiszta tükörkép */
function drawMirror(cv, dim){
  const W = 24, H = 34; cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const cx = 11.5, cy = 14, rx = 11, ry = 14;
  const px = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const dx = (x + .5 - (cx + .5)) / rx, dy = (y + .5 - (cy + .5)) / ry, d = dx*dx + dy*dy;
    if (d > 1) continue;
    if (d > .74){ px(x, y, d > .93 ? '#b13e53' : (y > cy ? '#ef7d57' : '#ffcd75')); continue; }
    const s = x + (H - y) * .45;
    let c = y < cy ? '#3b5dc9' : '#29366f';
    if (y < cy + 3 && s > 13 && s < 15) c = '#41a6f6';
    if (y < cy + 3 && s >= 15 && s < 16) c = '#73eff7';
    const hx = (x - 11.5) / 3.3, hy = (y - 11) / 3.6;
    const sx = (x - 11.5) / 7.5, sy = (y - 23) / 5.5;
    const head = hx*hx + hy*hy <= 1, body = y >= 17 && sx*sx + sy*sy <= 1;
    if (head || body){
      if (!dim) c = head ? '#ffcd75' : '#94b0c2';
      else if ((x + y) % 2 === 0) c = head ? '#94b0c2' : '#566c86';
    }
    px(x, y, c);
  }
  for (let y = 28; y < 31; y++) for (let x = 10; x < 14; x++) px(x, y, '#ef7d57');
  for (let x = 5; x < 19; x++){ px(x, 31, '#ffcd75'); px(x, 32, '#ef7d57'); px(x, 33, '#b13e53'); }
}
document.querySelectorAll('canvas.mirror').forEach(cv => drawMirror(cv, cv.dataset.dim === '1'));

/* diák előkészítése */
slides.forEach(sl => {
  if (sl.dataset.block){
    const t = document.createElement('div'); t.className = 'tag'; t.textContent = sl.dataset.block; sl.prepend(t);
  }
  sl.querySelectorAll('.qa').forEach(qa => {
    const q = qa.querySelector('.q'), a = qa.querySelector('.a');
    if (a) a.hidden = true;
    if (q) q.hidden = true;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ask';
    btn.textContent = '▶ ' + (q ? q.textContent.trim() : 'Claude válaszol');
    const term = document.createElement('div'); term.className = 'term';
    const who = document.createElement('div'); who.className = 'who'; who.textContent = 'Claude';
    const out = document.createElement('div'); out.className = 'out';
    term.append(who, out); qa.append(btn, term);
    idle(qa);
    btn.addEventListener('click', () => { if (!qa.classList.contains('started')) startQA(qa); btn.blur(); });
    term.addEventListener('click', () => { if (typing && typing.qa === qa) finishTyping(); });
  });
});

function idle(qa){
  const out = qa.querySelector('.out'); out.innerHTML = '';
  const c = document.createElement('span'); c.className = 'cursor idle'; out.append(c);
}

function startQA(qa){
  finishTyping();
  qa.classList.add('started');
  qa.querySelector('.ask').disabled = true;
  const out = qa.querySelector('.out'), term = qa.querySelector('.term');
  out.innerHTML = '';
  const q = qa.querySelector('.q');
  if (q){ const s = document.createElement('p'); s.className = 'sent'; s.textContent = '> ' + q.textContent.trim(); out.append(s); }
  const paras = [...qa.querySelectorAll('.a > p')].map(p => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const cursor = document.createElement('span'); cursor.className = 'cursor';
  typing = { qa, out, term, paras, pi: 0, ci: 0, p: null, text: null, cursor, timer: null };
  tick();
}

function tick(){
  const t = typing; if (!t) return;
  if (t.pi >= t.paras.length){ endTyping(); return; }
  if (!t.p){
    t.p = document.createElement('p'); t.text = document.createTextNode('');
    t.p.append(t.text, t.cursor); t.out.append(t.p);
  }
  const s = t.paras[t.pi];
  if (t.ci < s.length){
    const ch = s[t.ci++]; t.text.data += ch;
    t.term.scrollTop = t.term.scrollHeight;
    let d = GEPELES_MS;
    if ('.!?'.includes(ch)) d *= 12; else if (',;:—'.includes(ch)) d *= 5;
    t.timer = setTimeout(tick, d);
  } else {
    t.pi++; t.ci = 0; t.p = null;
    t.timer = setTimeout(tick, GEPELES_MS * 20);
  }
}

function finishTyping(){
  const t = typing; if (!t) return;
  clearTimeout(t.timer);
  if (t.p){ t.text.data = t.paras[t.pi]; t.pi++; t.p = null; }
  for (; t.pi < t.paras.length; t.pi++){
    const p = document.createElement('p'); p.textContent = t.paras[t.pi]; t.out.append(p);
  }
  endTyping();
}

function endTyping(){
  const t = typing; if (!t) return;
  typing = null;
  const last = t.out.lastElementChild; if (last) last.append(t.cursor);
  t.term.scrollTop = t.term.scrollHeight;
}

/* a dián belüli következő lépés: címszó vagy kérdés */
function act(){
  if (typing){ finishTyping(); return true; }
  const item = slides[cur].querySelector('.step:not(.shown), .qa:not(.started)');
  if (!item) return false;
  if (item.classList.contains('step')) item.classList.add('shown'); else startQA(item);
  return true;
}

function go(i){
  finishTyping();
  i = Math.max(0, Math.min(slides.length - 1, i));
  slides[cur].classList.remove('active');
  cur = i;
  slides[cur].classList.add('active');
  bar.style.width = (slides.length > 1 ? cur / (slides.length - 1) * 100 : 100) + '%';
  count.textContent = (cur + 1) + '/' + slides.length;
  history.replaceState(null, '', '#' + (cur + 1));
}
function next(){ if (TOVABB_ELOBB_A_DIAN_BELUL && act()) return; go(cur + 1); }
function prev(){ go(cur - 1); }

function resetSlide(){
  finishTyping();
  const sl = slides[cur];
  sl.querySelectorAll('.step.shown').forEach(s => s.classList.remove('shown'));
  sl.querySelectorAll('.qa').forEach(qa => {
    qa.classList.remove('started'); qa.querySelector('.ask').disabled = false; idle(qa);
  });
}

/* diák listája */
const ol = menu.querySelector('ol');
slides.forEach((sl, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button'); b.type = 'button';
  const h = sl.querySelector('h1, h2, .big, cite');
  const label = h ? h.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  b.textContent = label || 'Dia ' + (i + 1);
  b.addEventListener('click', () => { toggleMenu(false); go(i); });
  li.append(b); ol.append(li);
});
function toggleMenu(open){
  menu.classList.toggle('open', open);
  if (open){
    [...ol.children].forEach((li, i) => li.classList.toggle('here', i === cur));
    const b = ol.children[cur].querySelector('button'); b.focus(); b.scrollIntoView({ block: 'center' });
  }
}

document.getElementById('next').addEventListener('click', e => { next(); e.currentTarget.blur(); });
document.getElementById('prev').addEventListener('click', e => { prev(); e.currentTarget.blur(); });
count.addEventListener('click', () => toggleMenu(true));

addEventListener('keydown', e => {
  if (menu.classList.contains('open')){
    if (e.key === 'Escape' || e.key === 'm' || e.key === 'M'){ e.preventDefault(); toggleMenu(false); }
    return;
  }
  switch (e.key){
    case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
      e.preventDefault(); next(); break;
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
      e.preventDefault(); prev(); break;
    case 'Enter': e.preventDefault(); act(); break;
    case 'Home': e.preventDefault(); go(0); break;
    case 'End': e.preventDefault(); go(slides.length - 1); break;
    case 'm': case 'M': e.preventDefault(); toggleMenu(true); break;
    case 'r': case 'R': e.preventDefault(); resetSlide(); break;
    case 'f': case 'F':
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
      break;
  }
});

const start = parseInt(location.hash.slice(1), 10);
slides.forEach(s => s.classList.remove('active'));
go(Number.isFinite(start) ? start - 1 : 0);
