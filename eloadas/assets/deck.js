/* A MI képmásunkra — a diák működése (lapozás, lépésenkénti megjelenítés, gépelés). */
/* ===== BEÁLLÍTÁSOK ===== */
const GEPELES_MS = 24;                 // gépelési sebesség: ennyi ezredmásodperc betűnként (kisebb = gyorsabb)
const TOVABB_ELOBB_A_DIAN_BELUL = true; // true: a → / lapozó előbb a dián lévő kérdést, címszót indítja
const WEBCIM = '';                     // a weblap címe a címlapi QR-kódhoz, pl. 'https://valami.netlify.app/' — üresen: a jelenlegi cím (ha weben nyitották meg)
const VALASZ_MIN_BETUMERET = 26;       // ha egy válasz nem fér ki, a betű eddig (px) kisebbedhet; ha így sem fér ki, részletekben jelenik meg

/* ===== innentől nem kell szerkeszteni ===== */
const stage = document.getElementById('stage');
const slides = [...stage.querySelectorAll(':scope > .slide')];
const bar = document.querySelector('#bar i');
const count = document.getElementById('count');
const menu = document.getElementById('menu');
let cur = 0, typing = null;

function fit(){
  const vv = window.visualViewport;                       // telefonon a böngészősáv miatt változik
  const w = vv ? vv.width : document.documentElement.clientWidth || innerWidth;
  const h = vv ? vv.height : document.documentElement.clientHeight || innerHeight;
  const s = Math.min(w / 1280, h / 720);
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 200));
window.visualViewport?.addEventListener('resize', fit);
document.addEventListener('fullscreenchange', fit); document.addEventListener('webkitfullscreenchange', fit);
addEventListener('load', fit); fit();

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

/* pixeles könyvszekrény: 6 polc, polconként 27 könyv (a „Mennyi szöveg?” diához) */
function drawShelf(cv){
  const POLC = 6, KONYV = 27, BW = 2, SH = 11;
  const W = KONYV * BW + 4, H = POLC * SH + 4; cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const colors = ['#b13e53','#ef7d57','#ffcd75','#38b764','#257179','#3b5dc9','#41a6f6','#5d275d','#94b0c2'];
  g.fillStyle = '#5d275d'; g.fillRect(0, 0, W, H);           // keret
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let r = 0; r < POLC; r++){
    const y0 = 2 + r * SH;
    g.fillStyle = '#1a1c2c'; g.fillRect(2, y0, W - 4, SH - 1); // polc belseje
    for (let k = 0; k < KONYV; k++){
      const h = 6 + Math.floor(rnd() * 4);
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.fillRect(2 + k * BW, y0 + SH - 1 - h, BW - (rnd() < .15 ? 1 : 0), h);
    }
    g.fillStyle = '#ef7d57'; g.fillRect(2, y0 + SH - 1, W - 4, 1); // polcdeszka
  }
}
document.querySelectorAll('canvas.shelf').forEach(drawShelf);

/* QR-kód a címlapon: a weblapra mutat, bibliaórai nézettel (qrcode.js: Kazuhiko Arase, MIT) */
function siteUrl(){
  if (WEBCIM) return WEBCIM;
  if (/^https?:$/.test(location.protocol)) return location.origin + location.pathname.replace(/index\.html$/, '');
  return '';
}
function drawQR(cv){
  const box = cv.closest('.qr'), base = siteUrl();
  if (!base || typeof qrcode !== 'function'){
    box.classList.add('missing');
    box.querySelector('.qr-cap').textContent = 'QR-kód: add meg a webcímet (deck.js, WEBCIM)';
    return;
  }
  const target = base + (base.includes('?') ? '&' : '?') + 'nezet=bibliaora';
  const q = qrcode(0, 'M'); q.addData(target); q.make();
  const n = q.getModuleCount(), quiet = 2, W = n + quiet * 2;
  cv.width = W; cv.height = W;
  const g = cv.getContext('2d');
  g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, W, W);
  g.fillStyle = '#1a1c2c';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(c + quiet, r + quiet, 1, 1);
  box.querySelector('.qr-url').textContent = base.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
document.querySelectorAll('canvas.qr-code').forEach(drawQR);

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
    term.addEventListener('click', () => {
      if (typing && typing.qa === qa) finishTyping();
      else if (qa.classList.contains('more')) nextPage(qa);
    });
  });
});

function idle(qa){
  const out = qa.querySelector('.out'); out.innerHTML = '';
  const c = document.createElement('span'); c.className = 'cursor idle'; out.append(c);
}

/* tördelés: a választ előre lemérjük. Ha a betű kis mértékű kisebbítésével kifér, egyben írjuk ki;
   ha nem, bekezdések mentén részletekre bontjuk, és a következő gombnyomás hozza a folytatást.
   Így semmi nem gördül el, és a betű sem lesz olvashatatlanul kicsi. */
const readableMode = () => document.body.classList.contains('readable');
function sentLine(qa){
  const q = qa.querySelector('.q'); if (!q) return null;
  const s = document.createElement('p'); s.className = 'sent'; s.textContent = '> ' + q.textContent.trim(); return s;
}
function renderPage(qa, paras, first, more, cursor){
  const out = qa.querySelector('.out');
  out.innerHTML = '';
  if (first){ const s = sentLine(qa); if (s) out.append(s); }
  paras.forEach(t => { const p = document.createElement('p'); p.textContent = t; out.append(p); });
  const last = out.lastElementChild;
  if (last && cursor) last.append(cursor);
  if (more){ const m = document.createElement('p'); m.className = 'more'; m.textContent = '▼ folytatás'; out.append(m); }
}
function layoutAnswer(qa){
  const out = qa.querySelector('.out'), term = qa.querySelector('.term');
  const paras = [...qa.querySelectorAll('.a > p')].map(p => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const fits = () => term.scrollHeight <= term.clientHeight;
  const probe = () => { const c = document.createElement('span'); c.className = 'cursor'; return c; };
  const paginate = size => {
    out.style.fontSize = size + 'px';
    const pages = []; let page = [];
    paras.forEach(t => {
      renderPage(qa, page.concat(t), pages.length === 0, true, probe());
      if (fits() || !page.length) page.push(t); else { pages.push(page); page = [t]; }
    });
    if (page.length) pages.push(page);
    // akkor jó, ha minden részlet ténylegesen kifér (egy túl hosszú bekezdés önmagában is kilóghat)
    const ok = pages.every((pg, k) => { renderPage(qa, pg, k === 0, k < pages.length - 1, probe()); return fits(); });
    return { size, pages, ok };
  };
  out.style.fontSize = '';
  const base = parseFloat(getComputedStyle(out).fontSize);
  const min = readableMode() ? Math.round(VALASZ_MIN_BETUMERET * .85) : VALASZ_MIN_BETUMERET; // a rendes betű nagyobbnak hat
  // 1. a lehető legnagyobb betű, amellyel egyben kifér
  for (let size = base; size >= min; size--){
    out.style.fontSize = size + 'px';
    renderPage(qa, paras, true, false, probe());
    if (fits()){ out.innerHTML = ''; return { size, pages: [paras] }; }
  }
  // 2. ha nem fér ki: a legkevesebb részlet, ahhoz a legnagyobb betű
  let best = null;
  for (let size = base; size >= min; size--){
    const l = paginate(size);
    if (l.ok && (!best || l.pages.length < best.pages.length)) best = l;
  }
  // 3. végső eset: egy bekezdés önmagában sem fér ki — kisebb betű
  for (let size = min - 1; !best && size >= 12; size--){ const l = paginate(size); if (l.ok) best = l; }
  out.innerHTML = '';
  return best || paginate(min);
}
function prepareQA(qa){
  const l = layoutAnswer(qa);
  qa._pages = l.pages; qa._mode = readableMode();
  qa.querySelector('.out').style.fontSize = l.size + 'px';
}

function startQA(qa){
  finishTyping();
  qa.classList.add('started');
  qa.querySelector('.ask').disabled = true;
  prepareQA(qa);
  qa._page = 0;
  typePage(qa);
}
function typePage(qa){
  const out = qa.querySelector('.out'), term = qa.querySelector('.term');
  qa.classList.remove('more');
  renderPage(qa, [], qa._page === 0, false, null);
  const cursor = document.createElement('span'); cursor.className = 'cursor';
  typing = { qa, out, term, paras: qa._pages[qa._page], pi: 0, ci: 0, p: null, text: null, cursor, timer: null };
  tick();
}
function nextPage(qa){ qa._page++; typePage(qa); }
/* a már elindított válasz újratördelése (olvasható mód váltásakor), gépelés nélkül */
function relayoutQA(qa){
  prepareQA(qa);
  qa._page = Math.min(qa._page || 0, qa._pages.length - 1);
  const more = qa._page < qa._pages.length - 1;
  const c = document.createElement('span'); c.className = 'cursor';
  renderPage(qa, qa._pages[qa._page], qa._page === 0, more, c);
  qa.classList.toggle('more', more);
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
  if (t.qa._page < t.qa._pages.length - 1){
    const m = document.createElement('p'); m.className = 'more'; m.textContent = '▼ folytatás'; t.out.append(m);
    t.qa.classList.add('more');
  }
  t.term.scrollTop = 0;
}

/* a dián belüli következő lépés: címszó, egy válasz folytatása, vagy kérdés */
function act(){
  if (typing){ finishTyping(); return true; }
  const item = slides[cur].querySelector('.step:not(.shown), .qa.more, .qa:not(.started)');
  if (!item) return false;
  if (item.classList.contains('step')) item.classList.add('shown');
  else if (item.classList.contains('more')) nextPage(item);
  else startQA(item);
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
  slides[cur].querySelectorAll('.qa.started').forEach(qa => { if (qa._mode !== readableMode()) relayoutQA(qa); });
  updatePresenter();
  updateNotes();
}
function next(){ if (TOVABB_ELOBB_A_DIAN_BELUL && act()) return; go(cur + 1); }
function prev(){ go(cur - 1); }

function resetSlide(){
  finishTyping();
  const sl = slides[cur];
  sl.querySelectorAll('.step.shown').forEach(s => s.classList.remove('shown'));
  sl.querySelectorAll('.qa').forEach(qa => {
    qa.classList.remove('started', 'more'); qa.querySelector('.ask').disabled = false;
    qa._page = 0; qa.querySelector('.out').style.fontSize = ''; idle(qa);
  });
}

/* fekete képernyő (B vagy pont — sok lapozón külön gomb): bármelyik billentyű visszahozza */
const blank = document.createElement('div'); blank.id = 'blank'; stage.append(blank);
function toggleBlank(on){ blank.classList.toggle('on', on); }

/* olvasható mód (O): a hosszabb szövegek rendes betűvel — ha a teremben a pixeles betű nehezen olvasható */
function toggleReadable(){
  finishTyping();
  document.body.classList.toggle('readable');
  slides[cur].querySelectorAll('.qa.started').forEach(relayoutQA);
}

/* előadói nézet (P): külön ablak a laptopon — óra, eltelt idő, következő dia, jegyzet.
   Jegyzet: a diába tett <aside class="notes">…</aside> szövege; a vetítésen nem látszik. */
let pv = null, pvStart = null, pvTimer = null;
const slideTitle = sl => {
  const h = sl && sl.querySelector('h1, h2, .big, cite');
  return h ? h.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
};
const mmss = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function openPresenter(){
  if (pv && !pv.closed){ pv.focus(); return; }
  pv = window.open('', 'eloadoi-nezet', 'width=980,height=900');
  if (!pv){ alert('A böngésző letiltotta a felugró ablakot. Engedélyezd ennél az oldalnál, és nyomd meg újra a P-t.'); return; }
  pv.document.open();
  pv.document.write(`<!DOCTYPE html><html lang="hu"><head><meta charset="utf-8"><title>Előadói nézet</title><style>
    body{margin:0;padding:24px 32px;background:#1a1c2c;color:#f4f4f4;font:20px/1.4 'Segoe UI',Calibri,Arial,sans-serif}
    .row{display:flex;gap:40px;align-items:baseline;color:#94b0c2;font-size:18px}
    .row b{color:#ffcd75;font-size:40px;font-weight:600}
    h1{font-size:30px;margin:22px 0 4px;color:#f4f4f4}
    .lbl{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#566c86;margin-top:22px}
    #nx{font-size:22px;color:#73eff7}
    #notes{white-space:pre-wrap;font-size:22px;color:#f4f4f4;margin-top:6px}
    #notes:empty::before{content:"(ehhez a diához nincs jegyzet)";color:#566c86}
    button{font:inherit;font-size:15px;background:#333c57;color:#f4f4f4;border:0;padding:6px 14px;cursor:pointer}
    .help{font-size:14px;color:#566c86;margin-top:26px}
    .live{margin-top:10px;padding:14px 16px;background:#29366f}
    .live textarea{display:block;width:100%;box-sizing:border-box;margin:4px 0 10px;font:17px/1.35 'Segoe UI',Calibri,Arial,sans-serif;background:#1a1c2c;color:#f4f4f4;border:1px solid #566c86;padding:8px}
    .live small{color:#94b0c2;font-size:14px}
    .live #lgo{background:#ffcd75;color:#1a1c2c;font-weight:600}
  </style></head><body>
    <div class="row"><span>Eltelt <b id="el">0:00</b></span><span>Óra <b id="ck"></b></span><span>Dia <b id="nr"></b></span><button id="rs" type="button">Idő nullázása</button></div>
    <div class="lbl">Most</div><h1 id="cu"></h1>
    <div class="lbl">Következik</div><div id="nx"></div>
    <div class="lbl">Jegyzet</div><div id="notes"></div>
    <div class="lbl">Élő kérdés</div>
    <div class="live">
      <small>Kérdés (ez kerül a sárga gombra)</small><textarea id="pq" rows="2"></textarea>
      <small>Claude válasza a chatből (bekezdések üres sorral elválasztva)</small><textarea id="pa" rows="7"></textarea>
      <button id="lgo" type="button">Betöltés a „Kérdezzétek Claude-ot” diára</button> <small id="pst"></small>
    </div>
    <p class="help">Innen is lapozhatsz (ha nem egy mezőben gépelsz): → / ← / Szóköz / Enter, B = fekete képernyő. A vetítő ablakot tedd a projektorra, F = teljes képernyő. Betöltés után Enter: indul a válasz.</p>
  </body></html>`);
  pv.document.close();
  pv.document.addEventListener('keydown', onKey);
  pv.document.getElementById('rs').addEventListener('click', () => { pvStart = Date.now(); tickPresenter(); });
  pv.document.getElementById('lgo').addEventListener('click', () => {
    const d = pv.document, q = d.getElementById('pq'), a = d.getElementById('pa');
    if (loadLive(q.value, a.value)){
      d.getElementById('pst').textContent = 'Betöltve: ' + (q.value.trim() || '(a kérdés nem változott)');
      q.value = ''; a.value = ''; d.activeElement?.blur();
    }
  });
  if (!pvStart) pvStart = Date.now();
  clearInterval(pvTimer); pvTimer = setInterval(tickPresenter, 1000);
  updatePresenter();
}
function tickPresenter(){
  if (!pv || pv.closed){ clearInterval(pvTimer); return; }
  const d = pv.document;
  d.getElementById('el').textContent = mmss(Date.now() - pvStart);
  d.getElementById('ck').textContent = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}
function updatePresenter(){
  if (!pv || pv.closed) return;
  const d = pv.document, sl = slides[cur], nx = slides[cur + 1];
  d.getElementById('nr').textContent = (cur + 1) + '/' + slides.length;
  d.getElementById('cu').textContent = (sl.dataset.block ? sl.dataset.block + ' — ' : '') + (slideTitle(sl) || 'Dia ' + (cur + 1));
  d.getElementById('nx').textContent = nx ? (slideTitle(nx) || 'Dia ' + (cur + 2)) : '— vége —';
  const n = sl.querySelector('aside.notes');
  d.getElementById('notes').textContent = n ? n.textContent.replace(/[ \t]+/g, ' ').replace(/\n\s*/g, '\n').trim() : '';
  tickPresenter();
}

/* élő kérdés: a teremből érkező kérdés és a chatből bemásolt válasz betöltése az „élő” diára.
   Betölthető az előadói nézetből (P) vagy a K billentyűvel nyíló panelről; a fájlt nem kell szerkeszteni. */
function parseAnswer(text){
  let t = (text || '').replace(/\r/g, '').trim();
  t = t.replace(/^\s*claude\s*:\s*/i, '');                           // „Claude:” előtag
  t = t.replace(/\*\*|__|`/g, '').replace(/^#+\s*/gm, '').replace(/^\s*[-*•]\s+/gm, ''); // chatből hozott jelölés
  let paras = t.split(/\n\s*\n/);
  if (paras.length === 1) paras = t.split('\n');
  return paras.map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
function loadLive(question, answerText){
  const sl = stage.querySelector('.slide.live'); if (!sl) return false;
  const qa = sl.querySelector('.qa'), q = qa.querySelector('.q'), a = qa.querySelector('.a');
  finishTyping();
  if (question && question.trim()) q.textContent = question.replace(/\s+/g, ' ').trim();
  a.innerHTML = '';
  parseAnswer(answerText).forEach(t => { const p = document.createElement('p'); p.textContent = t; a.append(p); });
  qa.classList.remove('started', 'more'); qa._page = 0;
  const btn = qa.querySelector('.ask'); btn.disabled = false; btn.textContent = '▶ ' + q.textContent;
  qa.querySelector('.out').style.fontSize = ''; idle(qa);
  go(slides.indexOf(sl));
  return true;
}
const livePanel = document.getElementById('live');
function toggleLive(open){
  if (!livePanel) return;
  livePanel.classList.toggle('open', open);
  if (open){ livePanel.querySelector('#lq').focus(); liveStats(); }
  else document.activeElement?.blur();
}
function liveStats(){
  const t = livePanel.querySelector('#la').value, n = parseAnswer(t);
  livePanel.querySelector('#ls').textContent = t.trim()
    ? `${t.trim().length} karakter, ${n.length} bekezdés. Betöltés után Enter (vagy a lapozó): indul a válasz.`
    : 'Ctrl+Enter: betöltés, Esc: mégse.';
}
if (livePanel){
  const lq = livePanel.querySelector('#lq'), la = livePanel.querySelector('#la');
  const submit = () => { if (loadLive(lq.value, la.value)){ lq.value = ''; la.value = ''; toggleLive(false); } };
  la.addEventListener('input', liveStats);
  livePanel.querySelector('#lok').addEventListener('click', submit);
  livePanel.querySelector('#lno').addEventListener('click', () => toggleLive(false));
  stage.querySelectorAll('.live-edit').forEach(b => b.addEventListener('click', () => { b.blur(); toggleLive(true); }));
  livePanel.addEventListener('click', e => { if (e.target === livePanel) toggleLive(false); });
  livePanel.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ e.preventDefault(); toggleLive(false); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); submit(); }
  });
}

/* diák listája */
const ol = menu.querySelector('ol');
slides.forEach((sl, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button'); b.type = 'button';
  b.textContent = slideTitle(sl) || 'Dia ' + (i + 1);
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

function onKey(e){
  if (e.target && e.target.closest && e.target.closest('textarea, input')) return; // gépelés a mezőkben
  if (livePanel && livePanel.classList.contains('open')) return;
  if (intro.classList.contains('open') || noteEdit.classList.contains('open')) return; // a felugró ablakok kezelik
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (menu.classList.contains('open')){
    if (e.key === 'Escape' || e.key === 'm' || e.key === 'M'){ e.preventDefault(); toggleMenu(false); }
    return;
  }
  if (blank.classList.contains('on')){
    if ((e.key === 'k' || e.key === 'K') && mode === 'dani'){ e.preventDefault(); toggleLive(true); return; } // a fekete marad
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)){ e.preventDefault(); toggleBlank(false); }
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
      toggleFullscreen();
      break;
    case 'b': case 'B': case '.': e.preventDefault(); toggleBlank(true); break;
    case 'o': case 'O': e.preventDefault(); toggleReadable(); break;
    case 'p': case 'P': if (mode === 'dani'){ e.preventDefault(); openPresenter(); } break;
    case 'k': case 'K': if (mode === 'dani'){ e.preventDefault(); toggleLive(true); } break;
  }
}
addEventListener('keydown', onKey);

/* ===== teljes képernyő ===== */
const fsSupported = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
function enterFullscreen(){
  const el = document.documentElement;
  try { (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {}); } catch (_) {}
}
function toggleFullscreen(){
  if (fsElement()){ try { (document.exitFullscreen || document.webkitExitFullscreen)?.call(document); } catch (_) {} }
  else enterFullscreen();
}

/* ===== nyitó ablak: teljes képernyő, majd nézet választása =====
   A böngészők csak kattintásra engednek teljes képernyőt, ezért ez az első lépés.
   ?nezet=dani vagy ?nezet=bibliaora a címben: a nézetválasztás elmarad. */
const intro = document.getElementById('intro');
let mode = 'dani';
function setMode(m){
  mode = m === 'bibliaora' ? 'bibliaora' : 'dani';
  document.body.classList.toggle('mode-bibliaora', mode === 'bibliaora');
  intro.classList.remove('open');
  updateNotes();
}
(function setupIntro(){
  const fsBox = document.getElementById('intro-fs'), modeBox = document.getElementById('intro-mode');
  const preset = new URLSearchParams(location.search).get('nezet');
  const toMode = () => {
    if (preset){ setMode(preset); return; }
    fsBox.hidden = true; modeBox.hidden = false; modeBox.querySelector('button').focus();
  };
  if (!fsSupported()){
    document.getElementById('fs-msg').textContent = 'Ezen az eszközön a böngésző nem enged teljes képernyőt. Telefonon fordítsd fekvőbe a készüléket.';
    document.getElementById('fs-yes').hidden = true;
    document.getElementById('fs-no').textContent = 'Tovább';
  }
  document.getElementById('fs-yes').addEventListener('click', () => { enterFullscreen(); toMode(); });
  document.getElementById('fs-no').addEventListener('click', toMode);
  modeBox.querySelectorAll('button[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  intro.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.preventDefault(); toMode(); } });
  (fsSupported() ? document.getElementById('fs-yes') : document.getElementById('fs-no')).focus();
})();

/* ===== bibliaórai nézet: jegyzetek diánként =====
   A jegyzetek ebben a böngészőben, ezen az eszközön maradnak meg (localStorage). */
const NOTES_KEY = 'mi-kepmasunkra-jegyzetek-v1';
const slideKeys = (() => { const seen = {}; return slides.map((sl, i) => {
  const k = slideTitle(sl) || 'Dia ' + (i + 1); seen[k] = (seen[k] || 0) + 1; return seen[k] > 1 ? k + ' #' + seen[k] : k; }); })();
let notes = {}, notesPersist = true;
try { notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') || {}; } catch (_) { notesPersist = false; notes = {}; }
function saveNotes(){
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); notesPersist = true; } catch (_) { notesPersist = false; }
}
const noteOf = i => (notes[slideKeys[i]] && notes[slideKeys[i]].text || '').trim();
const noteBtn = document.getElementById('nbtn'), noteNext = document.getElementById('nnext');
const noteEdit = document.getElementById('nedit'), noteText = document.getElementById('ntext');
function noteIndexes(){ return slides.map((_, i) => i).filter(i => noteOf(i)); }
function updateNotes(){
  if (!noteBtn) return;
  const has = !!noteOf(cur), all = noteIndexes();
  noteBtn.textContent = has ? '✎ Jegyzeted ehhez a diához' : '✎ Jegyzet';
  noteBtn.classList.toggle('has', has);
  noteNext.querySelector('span').textContent = all.length;
  noteNext.disabled = !all.length || (all.length === 1 && all[0] === cur);
}
function openNote(){
  document.getElementById('nttl').textContent = (cur + 1) + '. dia — ' + slideKeys[cur];
  noteText.value = noteOf(cur);
  noteEdit.classList.add('open');
  noteStatus();
  noteText.focus();
}
function noteStatus(){
  const n = noteIndexes().length;
  document.getElementById('nstat').textContent = notesPersist
    ? `Automatikusan mentve, csak ezen az eszközön, ebben a böngészőben. Jegyzetek összesen: ${n}.`
    : 'Figyelem: ez a böngésző nem engedi a mentést (pl. privát ablak) — a jegyzet az oldal bezárásával elvész. Töltsd le!';
}
function storeNote(){
  const t = noteText.value.trim(), k = slideKeys[cur];
  if (t) notes[k] = { text: t, dia: cur + 1, ido: new Date().toISOString() }; else delete notes[k];
  saveNotes(); updateNotes(); noteStatus();
}
function closeNote(){ storeNote(); noteEdit.classList.remove('open'); noteText.blur(); }
function nextNote(){
  const all = noteIndexes(); if (!all.length) return;
  const target = all.find(i => i > cur) ?? all[0];
  go(target); openNote();
}
function exportNotes(){
  const lines = noteIndexes().map(i => `${i + 1}. dia — ${slideKeys[i]}\n${noteOf(i)}\n`);
  const text = 'A MI képmásunkra — jegyzeteim\n\n' + (lines.join('\n') || '(nincs jegyzet)\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  a.download = 'jegyzeteim-mi-kepmasunkra.txt'; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
if (noteBtn){
  let timer = null;
  noteBtn.addEventListener('click', openNote);
  noteNext.addEventListener('click', nextNote);
  document.getElementById('nfs').addEventListener('click', toggleFullscreen);
  noteText.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(storeNote, 400); });
  document.getElementById('nclose').addEventListener('click', closeNote);
  document.getElementById('ndel').addEventListener('click', () => { noteText.value = ''; storeNote(); closeNote(); });
  document.getElementById('nexp').addEventListener('click', () => { storeNote(); exportNotes(); });
  noteEdit.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.preventDefault(); closeNote(); } });
  noteEdit.addEventListener('click', e => { if (e.target === noteEdit) closeNote(); });
  addEventListener('pagehide', () => { if (noteEdit.classList.contains('open')) storeNote(); });
}

/* lapozás húzással (telefonon, táblagépen) */
let touch = null;
stage.addEventListener('touchstart', e => {
  if (e.touches.length !== 1 || e.target.closest('.term, button, textarea')) { touch = null; return; }
  touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
stage.addEventListener('touchend', e => {
  if (!touch) return;
  const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y; touch = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
}, { passive: true });

const start = parseInt(location.hash.slice(1), 10);
slides.forEach(s => s.classList.remove('active'));
go(Number.isFinite(start) ? start - 1 : 0);
