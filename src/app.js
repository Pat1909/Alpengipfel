(function () {
'use strict';
const $ = id => document.getElementById(id);
const SHELL = /*__SHELL__*/'';
if ($('app-root')) $('app-root').innerHTML = SHELL;
// Hosted on a web server each summit has its own address; the single-file build keeps everything on one page.
const HOSTED = !$('data-peaks') && location.protocol.startsWith('http');
const ROOT = new URL(window.AG_BASE || './', location.href).pathname;
const fmt = new Intl.NumberFormat('de-DE');
const BANDS = [[0, 1000, '--h0', 'unter 1000'], [1000, 2000, '--h1', '1000–2000'], [2000, 3000, '--h2', '2000–3000'], [3000, 4000, '--h3', '3000–4000'], [4000, 9999, '--h5', 'über 4000']];
const ROW = 52;
let D, GEO, N = 0, idx = [], selected = -1, rankByEle = null;
let map, peakLayer, cssColors = {}, mapShown = false;
let me = null, distKm = null, idIndex = null;
const ALPS_BOUNDS = [[43.4, 5.0], [48.4, 16.6]];

function bandOf(e) { if (e == null) return -1; for (let i = 0; i < BANDS.length; i++) if (e < BANDS[i][1]) return i; return BANDS.length - 1; }
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  ['--h0','--h1','--h2','--h3','--h4','--h5','--ink','--surface','--accent','--map-alps','--map-water','--map-border','--map-group','--map-label','--map-land','--muted','--tw','--ta','--tk','--tt']
    .forEach(k => cssColors[k] = cs.getPropertyValue(k).trim());
}
function colorOf(e) { const b = bandOf(e); return cssColors[b < 0 ? '--h4' : BANDS[b][2]]; }
const arr = v => v == null || v === -1 ? [] : (Array.isArray(v) ? v : [v]);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
const slug = i => (norm(D.peaks.n[i]).replace(/[^a-z0-9]+/g, '-').slice(0, 60).replace(/^-+|-+$/g, '') || 'gipfel') + '-' + D.peaks.id[i];
const peakUrl = i => ROOT + 'gipfel/' + slug(i) + '.html';

/* ---------- filters ---------- */
function fillSelect(sel, items, allLabel) {
  sel.innerHTML = '';
  sel.add(new Option(allLabel, ''));
  items.forEach(([v, label]) => sel.add(new Option(label, v)));
}
function buildFilters() {
  const cc = D.countries.map((c, i) => [i, c.n, c.count]).filter(x => x[2]).sort((a, b) => a[1].localeCompare(b[1], 'de'));
  fillSelect($('country'), cc.map(x => [x[0], `${x[1]} (${fmt.format(x[2])})`]), 'Alle Länder');
  fillStates();
  const gg = D.groups.map((g, i) => [i, g.n, g.count]).filter(x => x[2]).sort((a, b) => a[1].localeCompare(b[1], 'de'));
  const items = gg.map(x => [x[0], `${x[1]} (${fmt.format(x[2])})`]);
  if (D.ungrouped) items.push(['none', `Ohne Zuordnung (${fmt.format(D.ungrouped)})`]);
  fillSelect($('group'), items, 'Alle Gebirgsgruppen');
  const bands = $('bands');
  BANDS.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = b[3] + ' m'; btn.dataset.i = i; btn.setAttribute('aria-pressed', 'false');
    btn.onclick = () => {
      const on = btn.getAttribute('aria-pressed') === 'true';
      $('hmin').value = on || b[0] === 0 ? '' : b[0];
      $('hmax').value = on || b[1] > 9000 ? '' : b[1];
      apply();
    };
    bands.appendChild(btn);
  });
  $('legend').innerHTML = BANDS.map(b => `<span><i style="background:var(${b[2]})"></i>${b[3]} m</span>`).join('') + `<span><i style="background:var(--h4)"></i>Höhe unbekannt</span>`;
}
function fillStates() {
  const c = $('country').value, prev = $('state').value;
  const ss = D.states.map((s, i) => [i, s.n, s.c, s.count]).filter(x => x[3] && (c === '' || x[2] === +c))
    .sort((a, b) => a[1].localeCompare(b[1], 'de'));
  fillSelect($('state'), ss.map(x => [x[0], `${x[1]}${c === '' ? ' · ' + D.countries[x[2]].c : ''} (${fmt.format(x[3])})`]), 'Alle');
  if ([...$('state').options].some(o => o.value === prev)) $('state').value = prev;
}
function has(v, t) { return Array.isArray(v) ? v.includes(t) : v === t; }
function apply() {
  const P = D.peaks;
  const q = norm($('q').value.trim());
  const hmin = $('hmin').value === '' ? null : +$('hmin').value;
  const hmax = $('hmax').value === '' ? null : +$('hmax').value;
  const c = $('country').value === '' ? null : +$('country').value;
  const s = $('state').value === '' ? null : +$('state').value;
  const gv = $('group').value;
  const g = gv === '' ? null : gv === 'none' ? -1 : +gv;
  const kind = $('kind').value;
  const bk = $('book').value, rad = me && $('radius').value ? +$('radius').value : null;
  const out = [];
  for (let i = 0; i < N; i++) {
    const e = P.e[i];
    if (rad != null && distKm[i] > rad) continue;
    if (bk) { const d = book.done[P.id[i]] != null; if (bk === 'done' ? !d : bk === 'todo' ? d : !book.wish[P.id[i]]) continue; }
    if (hmin != null && (e == null || e < hmin)) continue;
    if (hmax != null && (e == null || e > hmax)) continue;
    if (c != null && !has(P.c[i], c)) continue;
    if (s != null && !has(P.s[i], s)) continue;
    if (g != null && !has(P.g[i], g)) continue;
    if (kind !== '' && (kind === 'none' ? P.k[i] !== 0 : !(P.k[i] & (1 << +kind)))) continue;
    if (q && !P.nn[i].includes(q)) continue;
    out.push(i);
  }
  const sort = $('sort').value;
  if (sort === 'near' && me) out.sort((a, b) => distKm[a] - distKm[b]);
  else if (sort === 'hd' || sort === 'near') out.sort((a, b) => (P.e[b] ?? -1) - (P.e[a] ?? -1));
  else if (sort === 'ha') out.sort((a, b) => (P.e[a] ?? 1e9) - (P.e[b] ?? 1e9));
  else { const col = new Intl.Collator('de'); out.sort((a, b) => col.compare(P.n[a], P.n[b])); }
  idx = out;
  $('count').textContent = fmt.format(out.length) + (out.length === N ? '' : ' von ' + fmt.format(N));
  $('reset').hidden = !(q || hmin != null || hmax != null || c != null || s != null || g != null || kind !== '' || bk || rad != null);
  [...$('bands').children].forEach(btn => {
    const b = BANDS[+btn.dataset.i];
    btn.setAttribute('aria-pressed', String((hmin ?? 0) === b[0] && (hmax ?? 9999) === b[1]));
  });
  $('list').scrollTop = 0;
  renderList();
  if (peakLayer) peakLayer.redraw();
}
function fitToFilter() {
  if (!map || !idx.length || idx.length === N) return;
  const P = D.peaks; let a = 90, b = 180, c = -90, d = -180;
  for (const i of idx) { const la = P.la[i], lo = P.lo[i]; if (la < a) a = la; if (la > c) c = la; if (lo < b) b = lo; if (lo > d) d = lo; }
  map.fitBounds([[a, b], [c, d]], { padding: [30, 30], maxZoom: 13 });
}

/* ---------- list (windowed) ---------- */
function placeNames(i) {
  const P = D.peaks;
  const g = arr(P.g[i]).map(x => D.groups[x].n).join(' / ');
  const s = arr(P.s[i]).map(x => D.states[x].n).join(' / ');
  const c = arr(P.c[i]).map(x => D.countries[x].c).join('/');
  return { g, s, c };
}
function renderList() {
  const list = $('list'), spacer = $('spacer');
  spacer.style.height = idx.length * ROW + 'px';
  if (!idx.length) { spacer.innerHTML = '<div class="empty">Kein Gipfel passt zu diesen Filtern. Erweitere den Höhenbereich oder setze die Filter zurück.</div>'; return; }
  const top = list.scrollTop, h = list.clientHeight || 600;
  const from = Math.max(0, Math.floor(top / ROW) - 6), to = Math.min(idx.length, Math.ceil((top + h) / ROW) + 6);
  const P = D.peaks; let html = '';
  for (let k = from; k < to; k++) {
    const i = idx[k], e = P.e[i], pl = placeNames(i);
    const subl = [me ? km(distKm[i]) : '', pl.g, pl.s || pl.c].filter(Boolean).join(' · ') || '–';
    const mk = book.done[P.id[i]] != null ? '<span class="mk done" title="Bestiegen">✓</span>' : book.wish[P.id[i]] ? '<span class="mk" title="Wunschliste">☆</span>' : '';
    html += `<button type="button" class="row${i === selected ? ' sel' : ''}" data-i="${i}" style="top:${k * ROW}px">` +
      `<span class="dot" style="background:${colorOf(e)}"></span>` +
      `<span class="nm"><b>${mk}${esc(P.n[i])}</b><small>${esc(subl)}</small></span>` +
      `<span class="el">${e == null ? '–' : fmt.format(e)}<i>m</i></span></button>`;
  }
  spacer.innerHTML = html;
}
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

/* ---------- detail ---------- */
function dms(v, pos, neg) {
  const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), s = ((a - d) * 60 - m) * 60;
  return `${d}° ${String(m).padStart(2, '0')}′ ${s.toFixed(1).padStart(4, '0')}″ ${v >= 0 ? pos : neg}`;
}
/* ---------- ways and routes to the summit ---------- */
const KINDS = ['Wandern', 'Hochalpin', 'Klettersteig', 'Skitour'];
const KIND_HINT = ['Wanderwege und -routen bis T3 oder ohne Schwierigkeitsangabe', 'Alpinwanderwege T4–T6, Hochtouren und Klettereien', 'Gesicherte Steige mit Drahtseil, Klettersteigset nötig', 'Skitouren und Schneeschuhrouten im Winter'];
const gradeLabel = (cat, grade, vf) => [grade ? 'T' + grade : '', vf ? 'Klettersteig-Skala ' + vf + ' von 6' : ''].filter(Boolean).join(' · ');
function routesHtml(i) {
  const P = D.peaks, osm = [[], [], [], []], c2c = [[], [], [], []];
  (P.rt[i] || []).forEach(([k, cat, grade, vf]) => {
    const x = D.routes[k];
    osm[cat].push(`<li><a href="https://hiking.waymarkedtrails.org/#route?id=${x[0]}" target="_blank" rel="noopener">${esc(x[1] || 'Markierte Route ohne Namen')}</a>` +
      (HOSTED ? `<button type="button" class="onmap" data-rel="${x[0]}">Auf Karte</button>` : '') +
      `<small>markierte Route${gradeLabel(cat, grade, vf) ? ' · ' + gradeLabel(cat, grade, vf) : ''}</small></li>`);
  });
  (P.ap[i] || []).forEach(([cat, grade, vf, name]) => {
    osm[cat].push(`<li>${esc(name || (cat === 2 ? 'Klettersteig ohne Namen' : 'Weg ohne Namen'))}<small>${gradeLabel(cat, grade, vf) || 'ohne Schwierigkeitsangabe'}</small></li>`);
  });
  (P.cc[i] || []).forEach(([id, title, cat, act, rating, up]) => {
    c2c[cat].push(`<li><a href="https://www.camptocamp.org/routes/${id}" target="_blank" rel="noopener">${esc(title || 'Route ohne Namen')}</a>` +
      `<small>${[D.c2cActs[act], rating, up ? fmt.format(up) + ' Hm Aufstieg' : ''].filter(Boolean).map(esc).join(' · ')}</small></li>`);
  });
  const near = P.nr[i] || [], total = osm.concat(c2c).reduce((s, g) => s + g.length, 0);
  let out = `<section class="ways"><h3 class="h3">Wege und Routen auf den Gipfel</h3>`;
  if (!total && !near.length) out += `<p class="note">Weder in OpenStreetMap noch bei Camptocamp ist ein Weg oder eine Route zu diesem Gipfel erfasst. Das heißt meist: wegloser Anstieg oder ein selten besuchter Nebengipfel.</p>`;
  KINDS.forEach((kind, cat) => {
    const n = osm[cat].length + c2c[cat].length;
    if (!n) return;
    const moreOsm = osm[cat].length - 15, moreC = c2c[cat].length - 8;
    out += `<div class="kind"><div class="kh"><span class="kb k${cat}">${kind}</span><small>${KIND_HINT[cat]}</small></div><ul class="rts">` +
      osm[cat].slice(0, 15).join('') + (moreOsm > 0 ? `<li>und ${moreOsm} weitere Wege</li>` : '') +
      c2c[cat].slice(0, 8).join('') + (moreC > 0 ? `<li><a href="https://www.camptocamp.org/waypoints/${P.cw[i]}" target="_blank" rel="noopener">${moreC} weitere Routen bei Camptocamp</a></li>` : '') + `</ul></div>`;
  });
  if (near.length) out += `<div class="kind"><div class="kh"><span class="kb kn">In Gipfelnähe</span><small>Diese Wege führen nicht bis zum Gipfel, das letzte Stück ist weglos</small></div><ul class="rts">` +
    near.map(([dist, cat, grade, vf, name]) => `<li>${esc(name || 'Weg ohne Namen')}<small>${dist} m vom Gipfel entfernt · ${KINDS[cat]}${gradeLabel(cat, grade, vf) ? ' · ' + gradeLabel(cat, grade, vf) : ''}</small></li>`).join('') + `</ul></div>`;
  if (total || near.length) out += `<p class="note">Wege und markierte Routen: OpenStreetMap, mit der Schwierigkeit des Abschnitts am Gipfel (SAC-Wanderskala T1–T6). ` +
    `Hochtouren, Klettereien, Skitouren und weitere Routen: <a href="https://www.camptocamp.org/" target="_blank" rel="noopener">Camptocamp.org</a> (CC BY-SA 3.0), Schwierigkeit dort nach Alpinskala von F (leicht) bis ED (extrem schwierig). ` +
    `Die Angaben stammen von Freiwilligen und können fehlen oder veraltet sein.</p>`;
  return out + '</section>';
}

/* ---------- trails on the map (fetched live from OpenStreetMap via Overpass) ---------- */
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
const SAC = { strolling: 1, hiking: 1, mountain_hiking: 2, demanding_mountain_hiking: 3, alpine_hiking: 4, demanding_alpine_hiking: 5, difficult_alpine_hiking: 6 };
const trailCache = new Map();
let trailLayer, hiLayer, trailsFor = -1;
async function overpass(query) {
  for (const ep of OVERPASS) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctl.signal });
      if (r.ok) { const j = await r.json(); if (!/error/i.test(j.remark || '')) return j; }
    } catch (err) { /* try the next server */ } finally { clearTimeout(timer); }
  }
  throw new Error('overpass');
}
function trailMsg(text) { const el = $('tlegend'); el.hidden = !text; el.textContent = text; }
function clearTrails() { trailsFor = -1; if (trailLayer) { trailLayer.clearLayers(); hiLayer.clearLayers(); } if ($('tlegend')) trailMsg(''); }
async function loadTrails(i) {
  if (!HOSTED || !map || trailsFor === i || !$('map').clientWidth) return;      // on phones the map loads once it is opened
  trailsFor = i; trailLayer.clearLayers(); hiLayer.clearLayers(); trailMsg('Wege um den Gipfel werden geladen …');
  const P = D.peaks;
  let data = trailCache.get(i);
  if (!data) {
    try {
      data = await overpass(`[out:json][timeout:20];way(around:2000,${P.la[i]},${P.lo[i]})[highway~"^(path|footway|track|via_ferrata|steps)$"]->.w;.w out tags geom qt;` +
        `rel(bw.w)[type=route][route~"^(hiking|foot)$"];way(r)->.rw;way.w.rw;out ids qt;`);
      trailCache.set(i, data);
    } catch (err) { if (trailsFor === i) { trailsFor = -1; trailMsg('Die Wege um den Gipfel konnten gerade nicht geladen werden.'); } return; }
  }
  if (trailsFor !== i || selected !== i) return;
  const marked = new Set(data.elements.filter(e => !e.geometry).map(e => e.id)), lines = [];
  for (const e of data.elements) {
    if (!e.geometry) continue;
    const t = e.tags || {}, g = Math.max(0, ...(t.sac_scale || '').split(';').map(v => SAC[v.trim()] || 0));
    const cat = t.highway === 'via_ferrata' || t.via_ferrata_scale ? 2 : g >= 4 ? 1 : 0, track = t.highway === 'track' && !g, on = marked.has(e.id);
    const label = [t.name, track ? 'Fahrweg' : '', g ? 'T' + g : '', cat === 2 ? 'Klettersteig' + (t.via_ferrata_scale ? ' ' + t.via_ferrata_scale : '') : '', on ? 'markierte Route' : ''].filter(Boolean).join(' · ') || 'Weg ohne Angaben';
    lines.push({ ll: e.geometry.map(p => [p.lat, p.lon]), track, label, rank: cat * 10 + g + (on ? 5 : 0),
      style: { color: cssColors[cat === 2 ? '--tk' : cat === 1 ? '--ta' : track ? '--tt' : '--tw'], weight: (track ? 1.8 : 2.6) + (on ? 1.6 : 0), opacity: .95, dashArray: !g && !cat && !track && !on ? '5 5' : null } });
  }
  lines.sort((x, y) => x.rank - y.rank);
  lines.forEach(l => { if (!l.track) L.polyline(l.ll, { color: cssColors['--surface'], weight: l.style.weight + 2.4, opacity: .85, interactive: false }).addTo(trailLayer); });
  lines.forEach(l => L.polyline(l.ll, l.style).bindTooltip(l.label, { sticky: true }).addTo(trailLayer));
  const el = $('tlegend'); el.hidden = false;
  el.innerHTML = lines.length ? `<span><i class="ln" style="background:var(--tw)"></i>Wandern</span><span><i class="ln" style="background:var(--ta)"></i>Hochalpin T4–T6</span>` +
    `<span><i class="ln" style="background:var(--tk)"></i>Klettersteig</span><span><i class="ln" style="background:var(--tt)"></i>Fahrweg</span><span>dick = markierte Route</span>` : 'Im Umkreis von 2 km ist kein Weg erfasst.';
}
async function showRouteOnMap(rel, btn) {
  const i = selected; if (i < 0 || !map) return;
  const P = D.peaks, la = P.la[i], lo = P.lo[i];
  btn.disabled = true; btn.textContent = 'Lädt …';
  try {
    const d = await overpass(`[out:json][timeout:25];rel(${+rel});way(r)(${la - 0.15},${lo - 0.22},${la + 0.15},${lo + 0.22});out geom qt;`);
    const ll = d.elements.filter(e => e.geometry).map(e => e.geometry.map(p => [p.lat, p.lon]));
    if (!ll.length) throw new Error('empty');
    setView('map'); hiLayer.clearLayers();
    L.polyline(ll, { color: cssColors['--surface'], weight: 9, opacity: .9, interactive: false }).addTo(hiLayer);
    const line = L.polyline(ll, { color: cssColors['--accent'], weight: 4.5, interactive: false }).addTo(hiLayer);
    map.fitBounds(line.getBounds(), { padding: [30, 30], maxZoom: 14 });
    btn.textContent = 'Auf Karte';
  } catch (err) { btn.textContent = 'Gerade nicht verfügbar'; setTimeout(() => { btn.textContent = 'Auf Karte'; }, 2500); }
  btn.disabled = false;
}
function showDetail(i, fromMap, noPush) {
  selected = i;
  $('bookpanel').hidden = true;
  if (HOSTED) {
    if (!noPush && location.pathname !== peakUrl(i)) history.pushState({ p: D.peaks.id[i] }, '', peakUrl(i));
    document.title = `${D.peaks.n[i]}${D.peaks.e[i] != null ? ' (' + fmt.format(D.peaks.e[i]) + ' m)' : ''} – Alpengipfel`;
  }
  const P = D.peaks, e = P.e[i], la = P.la[i], lo = P.lo[i];
  const pl = placeNames(i);
  const countries = arr(P.c[i]).map(x => D.countries[x].n).join(', ') || '–';
  const sub = arr(P.sg[i]).map(x => D.subgroups[x]).join(', ');
  if (!rankByEle) {
    const order = [...Array(N).keys()].filter(k => P.e[k] != null).sort((a, b) => P.e[b] - P.e[a]);
    rankByEle = new Int32Array(N).fill(0); order.forEach((k, r) => rankByEle[k] = r + 1);
  }
  const wp = P.wp[i];
  let wpLink = '';
  if (wp) { const k = wp.indexOf(':'); wpLink = `<a href="https://${esc(wp.slice(0, k))}.wikipedia.org/wiki/${encodeURIComponent(wp.slice(k + 1).replace(/ /g, '_'))}" target="_blank" rel="noopener">Wikipedia</a>`; }
  const el = $('detail');
  el.innerHTML =
    `<button class="back" id="back" type="button">← Zur Liste</button>` +
    `<div><h2>${esc(P.n[i])}</h2>${P.an[i] ? `<div class="alt">auch: ${esc(P.an[i])}</div>` : ''}</div>` +
    `<div class="summit"><span class="big">${e == null ? '–' : fmt.format(e)}</span><span class="unit">m Höhe</span>` +
    (e != null ? `<span class="rank">Rang ${fmt.format(rankByEle[i])}<br>von ${fmt.format(N)} Gipfeln</span>` : `<span class="rank">Höhe in OpenStreetMap<br>nicht eingetragen</span>`) + `</div>` +
    `<div class="bookrow" id="bookrow"></div>` +
    `<dl class="facts">` +
    (me ? `<dt>Entfernung</dt><dd>${km(distKm[i])} Luftlinie von deinem Standort</dd>` : '') +
    `<dt>Koordinaten</dt><dd>${la.toFixed(5)}° N, ${lo.toFixed(5)}° O<small>${dms(la, 'N', 'S')}, ${dms(lo, 'O', 'W')}</small></dd>` +
    `<dt>Land</dt><dd>${esc(countries)}</dd>` +
    `<dt>Bundesland / Region</dt><dd>${esc(pl.s || '–')}</dd>` +
    `<dt>Gebirgsgruppe</dt><dd>${esc(pl.g || 'Ohne Zuordnung')}${sub ? `<small>Untergruppe: ${esc(sub)}</small>` : ''}</dd>` +
    (P.p[i] ? `<dt>Schartenhöhe</dt><dd>${fmt.format(P.p[i])} m</dd>` : '') +
    `</dl>` +
    `<div class="links"><button type="button" id="zoomto">Auf Karte zeigen</button>${HOSTED ? '<button type="button" id="share">Link kopieren</button>' : ''}` +
    `<a href="https://www.openstreetmap.org/node/${P.id[i]}" target="_blank" rel="noopener">OpenStreetMap</a>${wpLink}` +
    `<a href="https://www.opentopomap.org/#marker=15/${la}/${lo}" target="_blank" rel="noopener">Topokarte</a></div>` +
    routesHtml(i) +
    `<section class="wx" id="wx"><h3>Wetter am Gipfel, nächste 7 Tage</h3><div id="wxbody" class="note">Vorhersage wird geladen …</div></section>`;
  el.hidden = false; el.scrollTop = 0;
  loadWeather(i);
  $('back').onclick = () => closeDetail();
  renderBookRow(i);
  if ($('share')) $('share').onclick = ev => {
    const done = () => { ev.target.textContent = 'Link kopiert'; setTimeout(() => { ev.target.textContent = 'Link kopieren'; }, 1800); };
    navigator.clipboard.writeText(location.origin + peakUrl(i)).then(done).catch(() => { ev.target.textContent = location.origin + peakUrl(i); });
  };
  $('zoomto').onclick = () => { setView('map'); map.setView([la, lo], Math.max(map.getZoom(), 13)); };
  if (!fromMap && map) map.setView([la, lo], Math.max(map.getZoom(), HOSTED ? 13 : 12));
  el.querySelectorAll('.onmap').forEach(b => { b.onclick = () => showRouteOnMap(b.dataset.rel, b); });
  if (trailsFor !== i) clearTrails();
  loadTrails(i);
  if (fromMap && innerWidth <= 760) setView('list');
  if (peakLayer) peakLayer.redraw();
  renderList();
}
/* ---------- weather (Open-Meteo, forecast computed for the summit elevation) ---------- */
const WMO = { 0: 'Klar', 1: 'Überwiegend klar', 2: 'Teils bewölkt', 3: 'Bedeckt', 45: 'Nebel', 48: 'Reifnebel', 51: 'Leichter Niesel', 53: 'Niesel', 55: 'Starker Niesel',
  56: 'Gefrierender Niesel', 57: 'Gefrierender Niesel', 61: 'Leichter Regen', 63: 'Regen', 65: 'Starker Regen', 66: 'Gefrierender Regen', 67: 'Gefrierender Regen',
  71: 'Leichter Schneefall', 73: 'Schneefall', 75: 'Starker Schneefall', 77: 'Schneegriesel', 80: 'Leichte Regenschauer', 81: 'Regenschauer', 82: 'Starke Regenschauer',
  85: 'Schneeschauer', 86: 'Starke Schneeschauer', 95: 'Gewitter', 96: 'Gewitter mit Hagel', 99: 'Gewitter mit Hagel' };
const WIND_DIR = ['Nord', 'Nordost', 'Ost', 'Südost', 'Süd', 'Südwest', 'West', 'Nordwest'];
const wxCache = new Map();
const dayFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
const n1 = v => v == null ? '–' : (Math.round(v * 10) / 10).toLocaleString('de-DE');
const n0 = v => v == null ? '–' : fmt.format(Math.round(v));
const hundred = v => fmt.format(Math.round(v / 100) * 100);
async function loadWeather(i) {
  const P = D.peaks, la = P.la[i], lo = P.lo[i], e = P.e[i];
  const windy = `<a href="https://www.windy.com/${la}/${lo}?${la},${lo},11" target="_blank" rel="noopener">Wetter für diesen Punkt bei Windy öffnen</a>`;
  let data = wxCache.get(i);
  if (!data) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}${e != null ? '&elevation=' + e : ''}` +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_min,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunshine_duration,sunrise,sunset' +
        '&hourly=temperature_2m,apparent_temperature,weather_code,precipitation,snowfall,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,freezing_level_height' +
        '&timezone=Europe%2FBerlin&forecast_days=7';
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      data = await r.json(); wxCache.set(i, data);
    } catch (err) {
      if (selected === i && $('wxbody')) $('wxbody').innerHTML = (HOSTED ? 'Der Wetterdienst ist gerade nicht erreichbar. Öffne den Gipfel in ein paar Minuten noch einmal. ' : 'Die Vorhersage konnte nicht geladen werden. Innerhalb von claude.ai darf die Seite keine Wetterdaten abrufen; auf der eigenen Webadresse erscheint sie hier. ') + windy;
      return;
    }
  }
  if (selected !== i || !$('wxbody')) return;
  const d = data.daily, h = data.hourly;
  const days = d.time.map((t, k) => {
    const hs = []; for (let x = k * 24; x < k * 24 + 24 && x < h.time.length; x++) hs.push(x);
    const fl = hs.map(x => h.freezing_level_height[x]).filter(v => v != null);
    const snow = d.snowfall_sum[k], rain = d.precipitation_sum[k], prob = d.precipitation_probability_max[k], gust = d.wind_gusts_10m_max[k];
    const precip = !rain ? 'trocken' : `${n1(rain)} mm${prob != null ? ' · ' + prob + ' %' : ''}`;
    const warn = [];
    if (hs.some(x => h.weather_code[x] >= 95)) warn.push('Gewitter');
    if (gust >= 75) warn.push('Sturmböen');
    if (snow >= 10) warn.push('viel Neuschnee');
    if (d.apparent_temperature_min[k] <= -20) warn.push('strenge Kälte');
    const facts = [
      fl.length ? `Nullgradgrenze ${hundred(Math.min(...fl))}–${hundred(Math.max(...fl))} m` : '',
      d.sunshine_duration[k] != null ? `Sonne ${n1(d.sunshine_duration[k] / 3600)} h` : '',
      d.sunrise[k] ? `Sonnenaufgang ${d.sunrise[k].slice(11)}, Untergang ${d.sunset[k].slice(11)}` : '',
      `gefühlt bis ${n0(d.apparent_temperature_min[k])} °C`,
      `Wind bis ${n0(d.wind_speed_10m_max[k])} km/h aus ${WIND_DIR[Math.round(d.wind_direction_10m_dominant[k] / 45) % 8]}`
    ].filter(Boolean);
    const rows = hs.filter(x => x % 3 === 2).map(x => `<tr><td>${h.time[x].slice(11)}</td><td>${WMO[h.weather_code[x]] || '–'}</td>` +
      `<td>${n0(h.temperature_2m[x])}°<small>gef. ${n0(h.apparent_temperature[x])}°</small></td>` +
      `<td>${n0(h.wind_speed_10m[x])}<small>Böen ${n0(h.wind_gusts_10m[x])}</small></td>` +
      `<td>${h.precipitation[x] ? n1(h.precipitation[x]) + ' mm' : '–'}<small>${h.snowfall[x] ? n1(h.snowfall[x]) + ' cm Schnee' : ''}</small></td>` +
      `<td>${n0(h.cloud_cover[x])} %<small>${h.visibility[x] != null ? 'Sicht ' + (h.visibility[x] >= 10000 ? '>10' : n1(h.visibility[x] / 1000)) + ' km' : ''}</small></td></tr>`).join('');
    return `<details class="wxd"${k === 0 ? ' open' : ''}><summary><span class="day">${k === 0 ? 'Heute' : dayFmt.format(new Date(t + 'T12:00'))}</span>` +
      `<span class="wxm">${WMO[d.weather_code[k]] || '–'}${warn.map(w => `<em class="warn">${w}</em>`).join('')}<small>${precip}${snow ? ' · ' + n1(snow) + ' cm Neuschnee' : ''}</small></span>` +
      `<span class="temp">${n0(d.temperature_2m_min[k])} / ${n0(d.temperature_2m_max[k])} °C<small>Böen ${n0(gust)} km/h</small></span></summary>` +
      `<p class="wxf">${facts.join(' · ')}</p>` +
      `<div class="wxscroll"><table class="wxh"><thead><tr><th>Zeit</th><th>Wetter</th><th>Temp.</th><th>Wind km/h</th><th>Niederschlag</th><th>Wolken</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
  }).join('');
  const body = $('wxbody'); body.className = '';
  body.innerHTML = days + `<p class="note" style="margin-top:8px">Tippe auf einen Tag für den Verlauf in 3-Stunden-Schritten. Temperatur als Tagestief / Tageshoch${e != null ? `, berechnet für ${fmt.format(e)} m` : ''}. Modellvorhersage von <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>, kein Ersatz für den Bergwetterbericht.</p>`;
}
function closeDetail(noPush) {
  $('detail').hidden = true; selected = -1; clearTrails();
  if (HOSTED) { if (!noPush && location.pathname !== ROOT) history.pushState({}, '', ROOT); document.title = 'Alpengipfel'; }
  renderList(); if (peakLayer) peakLayer.redraw();
}
function indexOfId(id) {
  if (!idIndex) { idIndex = new Map(); D.peaks.id.forEach((v, k) => idIndex.set(v, k)); }
  return idIndex.has(id) ? idIndex.get(id) : -1;
}
function route() {                                  // show what the current address names
  const m = location.pathname.match(/-(\d+)\.html$/), i = m ? indexOfId(+m[1]) : -1;
  if (i >= 0) showDetail(i, false, true); else if (selected >= 0) closeDetail(true);
}

/* ---------- Gipfelbuch (kept in this browser) ---------- */
const BOOK_KEY = 'alpengipfel.gipfelbuch.v1';
let book = { done: {}, wish: {} };
try { const raw = JSON.parse(localStorage.getItem(BOOK_KEY) || 'null'); if (raw && raw.done && raw.wish) book = raw; } catch (err) { /* storage unavailable: the book lasts for this visit only */ }
function saveBook() { try { localStorage.setItem(BOOK_KEY, JSON.stringify(book)); } catch (err) { /* see above */ } }
const today = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
function renderBookRow(i) {
  const id = D.peaks.id[i], done = book.done[id] != null, wish = !!book.wish[id], el = $('bookrow');
  if (!el) return;
  el.innerHTML = `<button type="button" id="bdone" aria-pressed="${done}">${done ? '✓ Bestiegen' : 'Als bestiegen eintragen'}</button>` +
    (done ? `<label class="bdate">am <input type="date" id="bdate" value="${esc(book.done[id] || '')}" max="${today()}"></label>` : `<button type="button" id="bwish" aria-pressed="${wish}">${wish ? '☆ Auf der Wunschliste' : 'Auf die Wunschliste'}</button>`);
  $('bdone').onclick = () => { if (done) delete book.done[id]; else { book.done[id] = today(); delete book.wish[id]; } bookChanged(i); };
  if ($('bwish')) $('bwish').onclick = () => { if (wish) delete book.wish[id]; else book.wish[id] = 1; bookChanged(i); };
  if ($('bdate')) $('bdate').onchange = ev => { book.done[id] = ev.target.value; saveBook(); };
}
function bookChanged(i) { saveBook(); renderBookRow(i); if ($('book').value) apply(); else { renderList(); if (peakLayer) peakLayer.redraw(); } }
function showBook() {
  const P = D.peaks, doneIdx = [], el = $('bookpanel');
  for (let i = 0; i < N; i++) if (book.done[P.id[i]] != null) doneIdx.push(i);
  const wishN = Object.keys(book.wish).filter(id => indexOfId(+id) >= 0).length;
  const withEle = doneIdx.filter(i => P.e[i] != null), top = withEle.length ? withEle.reduce((a, b) => P.e[a] >= P.e[b] ? a : b) : -1;
  const total = BANDS.map(() => 0), got = BANDS.map(() => 0);
  for (let i = 0; i < N; i++) { const b = bandOf(P.e[i]); if (b >= 0) total[b]++; }
  doneIdx.forEach(i => { const b = bandOf(P.e[i]); if (b >= 0) got[b]++; });
  const countries = new Set(); doneIdx.forEach(i => arr(P.c[i]).forEach(c => countries.add(c)));
  const groups = new Set(); doneIdx.forEach(i => arr(P.g[i]).forEach(g => groups.add(g)));
  const recent = doneIdx.slice().sort((a, b) => String(book.done[P.id[b]]).localeCompare(String(book.done[P.id[a]]))).slice(0, 8);
  const dateDe = s => s ? s.split('-').reverse().join('.') : 'ohne Datum';
  el.innerHTML = `<button class="back" id="bookback" type="button">← Zurück</button><div><h2>Gipfelbuch</h2></div>` +
    `<div class="summit"><span class="big">${fmt.format(doneIdx.length)}</span><span class="unit">Gipfel bestiegen</span>` +
    `<span class="rank">${wishN} auf der<br>Wunschliste</span></div>` +
    (doneIdx.length ? `<dl class="facts"><dt>Höchster</dt><dd>${top >= 0 ? esc(P.n[top]) + ', ' + fmt.format(P.e[top]) + ' m' : '–'}</dd>` +
      `<dt>Höhenmeter</dt><dd>${fmt.format(withEle.reduce((s, i) => s + P.e[i], 0))} m Gipfelhöhe zusammengezählt</dd>` +
      `<dt>Gebiete</dt><dd>${countries.size} ${countries.size === 1 ? 'Land' : 'Länder'}, ${groups.size} ${groups.size === 1 ? 'Gebirgsgruppe' : 'Gebirgsgruppen'}</dd></dl>`
      : `<p class="note">Noch kein Eintrag. Öffne einen Gipfel und wähle „Als bestiegen eintragen“ oder „Auf die Wunschliste“.</p>`) +
    `<div class="prog">${BANDS.map((b, k) => `<div><span>${b[3]} m</span><span class="bar"><i style="width:${total[k] ? Math.max(got[k] ? 2 : 0, got[k] / total[k] * 100) : 0}%;background:var(${b[2]})"></i></span><span>${fmt.format(got[k])} von ${fmt.format(total[k])}</span></div>`).join('')}</div>` +
    (recent.length ? `<div><h3 class="h3">Zuletzt eingetragen</h3><ul class="rts">${recent.map(i => `<li><a href="${HOSTED ? peakUrl(i) : '#'}" data-i="${i}">${esc(P.n[i])}</a> · ${dateDe(book.done[P.id[i]])}</li>`).join('')}</ul></div>` : '') +
    `<div class="links"><button type="button" id="bshowdone">Bestiegene in der Liste zeigen</button><button type="button" id="bshowwish">Wunschliste zeigen</button>` +
    (HOSTED ? `<button type="button" id="bexport">Sichern (Datei)</button><button type="button" id="bimport">Wiederherstellen</button><input type="file" id="bfile" accept="application/json,.json" hidden>` : '') + `</div>` +
    `<p class="note" id="bookmsg">Das Gipfelbuch wird nur in diesem Browser auf diesem Gerät gespeichert, ohne Konto.${HOSTED ? ' Mit „Sichern“ kannst du es als Datei ablegen und auf einem anderen Gerät wiederherstellen.' : ''}</p>`;
  el.hidden = false; el.scrollTop = 0; setView('list');
  $('bookback').onclick = () => { el.hidden = true; };
  const show = v => { el.hidden = true; if (selected >= 0) closeDetail(); $('book').value = v; apply(); fitToFilter(); };
  $('bshowdone').onclick = () => show('done'); $('bshowwish').onclick = () => show('wish');
  el.querySelectorAll('a[data-i]').forEach(a => { a.onclick = ev => { ev.preventDefault(); showDetail(+a.dataset.i, false); }; });
  if (HOSTED) {
    $('bexport').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(book, null, 1)], { type: 'application/json' })); a.download = `gipfelbuch-${today()}.json`; a.click();
    };
    $('bimport').onclick = () => $('bfile').click();
    $('bfile').onchange = async ev => {
      try {
        const inc = JSON.parse(await ev.target.files[0].text());
        if (!inc || typeof inc.done !== 'object' || typeof inc.wish !== 'object') throw new Error('format');
        Object.assign(book.done, inc.done); Object.assign(book.wish, inc.wish); saveBook(); apply(); showBook();
      } catch (err) { $('bookmsg').textContent = 'Diese Datei ist keine Gipfelbuch-Sicherung. Wähle eine Datei, die du hier mit „Sichern“ erzeugt hast.'; }
    };
  }
}

/* ---------- in meiner Nähe ---------- */
const km = v => v < 10 ? n1(v) + ' km' : fmt.format(Math.round(v)) + ' km';
function locate() {
  const msg = $('nearmsg');
  const fail = () => { msg.hidden = false; msg.textContent = 'Der Standort konnte nicht ermittelt werden. Erlaube den Zugriff im Browser; innerhalb von claude.ai steht er nicht zur Verfügung.'; if ($('sort').value === 'near') { $('sort').value = 'hd'; apply(); } };
  if (!navigator.geolocation) return fail();
  msg.hidden = false; msg.textContent = 'Standort wird ermittelt …';
  navigator.geolocation.getCurrentPosition(pos => {
    me = { la: pos.coords.latitude, lo: pos.coords.longitude };
    const P = D.peaks, R = Math.PI / 180, c0 = Math.cos(me.la * R);
    distKm = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const dla = (P.la[i] - me.la) * R, dlo = (P.lo[i] - me.lo) * R;
      const a = Math.sin(dla / 2) ** 2 + c0 * Math.cos(P.la[i] * R) * Math.sin(dlo / 2) ** 2;
      distKm[i] = 12742 * Math.asin(Math.sqrt(a));
    }
    msg.hidden = true; $('near').textContent = 'Aktualisieren';
    $('radius').hidden = false; if (!$('radius').value) $('radius').value = '25';
    $('sort').value = 'near'; apply(); fitToFilter();
  }, fail, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
}

/* ---------- map ---------- */
function setView(v) {
  $('app').dataset.view = v;
  $('tab-list').setAttribute('aria-pressed', String(v === 'list'));
  $('tab-map').setAttribute('aria-pressed', String(v === 'map'));
  if (v === 'map' && map) setTimeout(() => {
    map.invalidateSize();
    if (selected >= 0) loadTrails(selected);
    if (!mapShown) { mapShown = true; if (selected >= 0) return; if (idx.length && idx.length < N) fitToFilter(); else map.fitBounds(ALPS_BOUNDS); }
  }, 0);
}
function initMap() {
  if (!window.L) { $('map').innerHTML = '<div class="empty">Die Kartenbibliothek konnte nicht geladen werden. Liste und Filter funktionieren trotzdem.</div>'; return; }
  map = L.map('map', { preferCanvas: true, zoomSnap: 0.5, minZoom: 5, maxZoom: 17, maxBounds: [[40.5, -1], [51, 23]] }).fitBounds(ALPS_BOUNDS);
  mapShown = $('map').clientWidth > 0;
  map.attributionControl.setPrefix(false).addAttribution('Daten © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende (ODbL)');
  const baseStyle = () => ({
    alps: { stroke: false, fillColor: cssColors['--map-alps'], fillOpacity: 1, interactive: false },
    lakes: { stroke: false, fillColor: cssColors['--map-water'], fillOpacity: 1, interactive: false },
    groups: { color: cssColors['--map-group'], weight: 1, opacity: .75, fill: false, interactive: false },
    borders: { color: cssColors['--map-border'], weight: 1.4, opacity: .9, dashArray: '6 4', fill: false, interactive: false }
  });
  const layers = {};
  const st = baseStyle();
  const toLL = ring => ring.map(p => [p[1], p[0]]);
  if (GEO) {
    layers.alps = L.polygon(GEO.alps.map(poly => poly.map(toLL)), st.alps).addTo(map);
    layers.lakes = L.polygon(GEO.lakes.map(poly => poly.map(toLL)), st.lakes).addTo(map);
    layers.groups = L.polygon(GEO.groups.flatMap(g => g.p.map(poly => poly.map(toLL))), st.groups).addTo(map);
    layers.borders = L.polyline(GEO.borders.map(toLL), st.borders).addTo(map);
  }
  // Background tiles are an optional extra: only added where the host page is allowed to load them.
  const probe = new Image();
  probe.onload = () => {
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: 'Karte © OpenStreetMap' }).addTo(map);
    tiles.bringToBack();
    if (layers.alps) { map.removeLayer(layers.alps); map.removeLayer(layers.lakes); map.removeLayer(layers.borders); layers.groups.setStyle({ opacity: .9, weight: 1.5 }); }
    hasTiles = true; peakLayer.redraw();
  };
  probe.src = 'https://tile.openstreetmap.org/6/33/22.png';

  const PeakLayer = L.Layer.extend({
    onAdd(m) {
      this._c = L.DomUtil.create('canvas', 'leaflet-layer');
      this._c.style.pointerEvents = 'none';
      m.getPanes().overlayPane.appendChild(this._c);
      m.on('moveend zoomend resize', this.redraw, this);
      m.on('zoomstart', () => { this._c.style.visibility = 'hidden'; });
      this.redraw();
    },
    redraw() {
      const m = this._map; if (!m) return;
      const size = m.getSize(), dpr = window.devicePixelRatio || 1, c = this._c;
      const tl = m.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(c, tl);
      c.width = size.x * dpr; c.height = size.y * dpr; c.style.width = size.x + 'px'; c.style.height = size.y + 'px'; c.style.visibility = '';
      const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
      const P = D.peaks, z = m.getZoom(), b = m.getBounds().pad(0.05);
      const s = b.getSouth(), n = b.getNorth(), w = b.getWest(), e = b.getEast();
      const vis = [];
      for (const i of idx) { const la = P.la[i], lo = P.lo[i]; if (la >= s && la <= n && lo >= w && lo <= e) vis.push(i); }
      this._vis = vis; this._pts = new Float32Array(vis.length * 2);
      const r = vis.length > 20000 ? 1.1 : vis.length > 6000 ? 1.6 : vis.length > 1500 ? 2.4 : vis.length > 300 ? 3.4 : 4.6;
      this._r = r;
      // draw low peaks first so high ones stay on top
      const order = vis.map((_, k) => k).sort((a, b2) => (P.e[vis[a]] ?? -1) - (P.e[vis[b2]] ?? -1));
      const outline = r >= 3.4;
      ctx.lineWidth = 1; ctx.strokeStyle = cssColors['--surface'];
      for (const k of order) {
        const i = vis[k], p = m.latLngToContainerPoint([P.la[i], P.lo[i]]);
        this._pts[k * 2] = p.x; this._pts[k * 2 + 1] = p.y;
        ctx.fillStyle = colorOf(P.e[i]);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
        if (outline) ctx.stroke();
      }
      // group names while zoomed out, peak names once few enough are in view
      ctx.textAlign = 'center';
      if (GEO && z < 10.5 && z >= 6.5) {
        ctx.font = `600 ${z < 8 ? 11 : 13}px "Barlow Condensed", "Arial Narrow", sans-serif`;
        const placed = [];
        for (const g of GEO.groups) {
          if (z < 8 && g.a < 0.12) continue;
          const p = m.latLngToContainerPoint([g.c[1], g.c[0]]);
          if (p.x < -50 || p.y < -20 || p.x > size.x + 50 || p.y > size.y + 20) continue;
          const tw = ctx.measureText(g.n).width / 2 + 4;
          if (placed.some(q => Math.abs(q[0] - p.x) < q[2] + tw && Math.abs(q[1] - p.y) < 14)) continue;
          placed.push([p.x, p.y, tw]);
          label(ctx, g.n.toUpperCase(), p.x, p.y, cssColors['--map-label']);
        }
      }
      if (z >= 9.5 || vis.length <= 60) {
        ctx.font = '600 12.5px "Barlow", system-ui, sans-serif';
        const top = order.slice(-45).reverse(), placed = [];
        for (const k of top) {
          const i = vis[k], x = this._pts[k * 2], y = this._pts[k * 2 + 1];
          if (i === selected) continue;
          const t = P.n[i] + (P.e[i] != null ? ' ' + P.e[i] : ''), tw = ctx.measureText(t).width / 2 + 4;
          if (placed.some(q => Math.abs(q[0] - x) < q[2] + tw && Math.abs(q[1] - y) < 15)) continue;
          placed.push([x, y, tw]);
          label(ctx, t, x, y - r - 5, cssColors['--ink']);
        }
      }
      if (r >= 1.6) {                                // summits in the Gipfelbuch get a ring
        ctx.lineWidth = 1.8; ctx.strokeStyle = cssColors['--ink'];
        for (let k = 0; k < vis.length; k++) if (book.done[P.id[vis[k]]] != null) { ctx.beginPath(); ctx.arc(this._pts[k * 2], this._pts[k * 2 + 1], r + 2.5, 0, 6.2832); ctx.stroke(); }
      }
      if (me) {
        const p = m.latLngToContainerPoint([me.la, me.lo]);
        ctx.fillStyle = cssColors['--accent']; ctx.strokeStyle = cssColors['--surface']; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 6.2832); ctx.fill(); ctx.stroke();
        ctx.font = '600 12px "Barlow", system-ui, sans-serif'; label(ctx, 'Dein Standort', p.x, p.y - 11, cssColors['--accent']);
      }
      if (selected >= 0) {
        const p = m.latLngToContainerPoint([P.la[selected], P.lo[selected]]);
        ctx.lineWidth = 2.5; ctx.strokeStyle = cssColors['--accent'];
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(r + 5, 8), 0, 6.2832); ctx.stroke();
        ctx.font = '600 13px "Barlow", system-ui, sans-serif';
        label(ctx, P.n[selected], p.x, p.y - Math.max(r + 5, 8) - 5, cssColors['--accent']);
      }
    },
    nearest(pt, maxd) {
      let best = -1, bd = maxd * maxd; const pts = this._pts;
      for (let k = 0; k < this._vis.length; k++) { const dx = pts[k * 2] - pt.x, dy = pts[k * 2 + 1] - pt.y, d = dx * dx + dy * dy; if (d < bd || (d === bd && best >= 0 && (D.peaks.e[this._vis[k]] ?? 0) > (D.peaks.e[best] ?? 0))) { bd = d; best = this._vis[k]; } }
      return best;
    }
  });
  function label(ctx, t, x, y, color) {
    ctx.lineWidth = 3; ctx.strokeStyle = cssColors['--surface']; ctx.lineJoin = 'round';
    ctx.strokeText(t, x, y); ctx.fillStyle = color; ctx.fillText(t, x, y);
  }
  let hasTiles = false;
  trailLayer = L.layerGroup().addTo(map); hiLayer = L.layerGroup().addTo(map);
  peakLayer = new PeakLayer().addTo(map);
  const tip = $('tip');
  map.on('click', ev => { const i = peakLayer.nearest(ev.containerPoint, 14); if (i >= 0) showDetail(i, true); });
  map.on('mousemove', ev => {
    const i = peakLayer.nearest(ev.containerPoint, 9);
    $('map').style.cursor = i >= 0 ? 'pointer' : '';
    if (i < 0) { tip.hidden = true; return; }
    tip.textContent = D.peaks.n[i] + (D.peaks.e[i] != null ? ` · ${fmt.format(D.peaks.e[i])} m` : '');
    tip.style.left = ev.containerPoint.x + 'px'; tip.style.top = ev.containerPoint.y + 'px'; tip.hidden = false;
  });
  map.on('mouseout movestart', () => { tip.hidden = true; });
  const restyle = () => { readColors(); const s2 = baseStyle(); for (const k in layers) if (map.hasLayer(layers[k])) layers[k].setStyle(s2[k]); peakLayer.redraw(); renderList(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restyle);
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/* ---------- boot ---------- */
async function boot() {
  readColors();
  try {
    const inP = $('data-peaks'), inG = $('data-geo');   // the single-file build carries the data inline
    if (inP) { D = JSON.parse(inP.textContent); GEO = inG ? JSON.parse(inG.textContent) : null; }
    else {
      const [d, g] = await Promise.all([
        fetch(ROOT + 'data/peaks.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
        fetch(ROOT + 'data/geo.json').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      D = d; GEO = g;
    }
  } catch (err) {
    $('loading').textContent = 'Die Gipfeldaten konnten nicht geladen werden. Lade die Seite neu; wenn du die App lokal öffnest, starte sie über einen Webserver (siehe README).';
    return;
  }
  const P = D.peaks; N = P.n.length;
  P.nn = P.n.map((n, i) => norm(n + (P.an[i] ? ' ' + P.an[i] : '')));
  $('sub').textContent = `${fmt.format(N)} benannte Gipfel aus OpenStreetMap, Stand ${D.meta.date}`;
  buildFilters();
  initMap();
  let t;
  const debounced = () => { clearTimeout(t); t = setTimeout(apply, 140); };
  $('q').addEventListener('input', debounced);
  $('hmin').addEventListener('input', debounced);
  $('hmax').addEventListener('input', debounced);
  $('country').addEventListener('change', () => { fillStates(); apply(); fitToFilter(); });
  $('state').addEventListener('change', () => { apply(); fitToFilter(); });
  $('group').addEventListener('change', () => { apply(); fitToFilter(); });
  $('kind').addEventListener('change', () => { apply(); fitToFilter(); });
  $('sort').addEventListener('change', () => { if ($('sort').value === 'near' && !me) locate(); else apply(); });
  $('book').addEventListener('change', () => { apply(); fitToFilter(); });
  $('radius').addEventListener('change', () => { apply(); fitToFilter(); });
  $('near').addEventListener('click', locate);
  $('openbook').addEventListener('click', showBook);
  $('reset').addEventListener('click', () => {
    ['q', 'hmin', 'hmax'].forEach(k => $(k).value = ''); $('country').value = ''; fillStates(); $('state').value = ''; $('group').value = ''; $('kind').value = ''; $('book').value = ''; $('radius').value = '';
    apply(); if (map) map.fitBounds([[43.4, 5.0], [48.4, 16.6]]);
  });
  let raf = 0;
  $('list').addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; renderList(); }); });
  $('list').addEventListener('click', ev => { const b = ev.target.closest('.row'); if (b) showDetail(+b.dataset.i, false); });
  addEventListener('resize', renderList);
  $('tab-list').onclick = () => setView('list');
  $('tab-map').onclick = () => setView('map');
  apply();
  $('loading').hidden = true;
  if (HOSTED) { addEventListener('popstate', route); route(); }
}
boot();
})();
