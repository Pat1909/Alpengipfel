(function () {
'use strict';
const $ = id => document.getElementById(id);
const SHELL = "<div class=\"app\" id=\"app\" data-view=\"list\" data-sheet=\"half\">\n  <header class=\"top\">\n    <h1><button type=\"button\" id=\"navhome\" class=\"brand\" aria-label=\"Alpengipfel, zur Startseite\"><svg class=\"logo\" viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"8\" fill=\"#1f2a27\"/><path d=\"M4.5 25 12.2 11.3l3.6 5.8 3.4-5.3L27.5 25z\" fill=\"#f3f6f3\"/><path d=\"m10.4 14.5 1.8-3.2 1.9 3-1.2-.6zM17.7 14.1l1.5-2.3 1.6 2.4-1.1-.5z\" fill=\"#8fb8d6\"/><circle cx=\"12.2\" cy=\"8.6\" r=\"2.3\" fill=\"#c62828\" stroke=\"#f3f6f3\" stroke-width=\"1\"/><\/svg><span>Alpengipfel<\/span><\/button><\/h1>\n    <span class=\"sub\" id=\"sub\">Alle benannten Gipfel der Alpen aus OpenStreetMap<\/span>\n    <nav class=\"nav\" aria-label=\"Bereiche\"><button id=\"navstart\" type=\"button\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 11.5 12 4l9 7.5\"/><path d=\"M5.5 10v9.5h13V10\"/><\/svg><span>Start<\/span><\/button><button id=\"navexp\" type=\"button\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.5 19.5 9 8l3.5 6 2.5-4 6.5 9.5z\"/><\/svg><span>Gipfel<\/span><\/button><button id=\"openbook\" type=\"button\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 4.5h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2z\"/><path d=\"M5 17.5a2 2 0 0 1 2-2h11\"/><path d=\"m9 9.5 2 2 3.5-3.5\"/><\/svg><span>Gipfelbuch<\/span><\/button><button id=\"openprofile\" type=\"button\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8.5\" r=\"3.5\"/><path d=\"M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5\"/><\/svg><span>Profil<\/span><\/button><\/nav>\n    <button type=\"button\" id=\"openfb\" class=\"fbbtn\" aria-label=\"Feedback geben\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 5h16v11H9l-5 4z\"/><path d=\"M8 9.5h8M8 12.5h5\"/><\/svg><span>Feedback<\/span><\/button>\n    <div class=\"tabs\" role=\"group\" aria-label=\"Ansicht\">\n      <button id=\"tab-list\" type=\"button\" aria-pressed=\"true\">Liste<\/button>\n      <button id=\"tab-map\" type=\"button\" aria-pressed=\"false\">Karte<\/button>\n    <\/div>\n  <\/header>\n\n  <main class=\"page\" id=\"page\" hidden><\/main>\n\n  <section class=\"side\" id=\"side\">\n    <div class=\"grab\" id=\"grab\" aria-hidden=\"true\"><span><\/span><\/div>\n    <div class=\"filters\" id=\"filters\">\n      <div class=\"f wide fq\"><label for=\"q\">Name<\/label><div class=\"qrow\"><input id=\"q\" type=\"search\" placeholder=\"Gipfel suchen, z. B. Großglockner\" autocomplete=\"off\"><button type=\"button\" class=\"ftoggle\" id=\"ftoggle\" aria-expanded=\"false\" aria-controls=\"filters\">Filter<b id=\"fcount\" hidden><\/b><\/button><\/div><\/div>\n      <div class=\"f wide\">\n        <span class=\"lab\">Höhe in Metern<\/span>\n        <div class=\"hrow\"><input id=\"hmin\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"4900\" step=\"50\" placeholder=\"von\" aria-label=\"Mindesthöhe\"><span>bis<\/span><input id=\"hmax\" type=\"number\" inputmode=\"numeric\" min=\"0\" max=\"4900\" step=\"50\" placeholder=\"bis\" aria-label=\"Maximalhöhe\"><\/div>\n        <div class=\"bands\" id=\"bands\"><\/div>\n      <\/div>\n      <div class=\"f\"><label for=\"country\">Land<\/label><select id=\"country\"><\/select><\/div>\n      <div class=\"f\"><label for=\"state\">Bundesland / Region<\/label><select id=\"state\"><\/select><\/div>\n      <div class=\"f wide\"><label for=\"group\">Gebirgsgruppe<\/label><select id=\"group\"><\/select><\/div>\n      <div class=\"f wide\"><label for=\"kind\">Weg zum Gipfel<\/label><select id=\"kind\"><option value=\"\">Alle Gipfel<\/option><option value=\"0\">Wandern (bis T3)<\/option><option value=\"1\">Hochalpin (T4–T6)<\/option><option value=\"2\">Klettersteig<\/option><option value=\"3\">Skitour<\/option><option value=\"4\">Nur Weg in Gipfelnähe<\/option><option value=\"none\">Kein Weg, keine Route erfasst<\/option><\/select><\/div>\n      <div class=\"f\"><label for=\"book\">Gipfelbuch<\/label><select id=\"book\"><option value=\"\">Alle Gipfel<\/option><option value=\"done\">Bestiegen<\/option><option value=\"todo\">Noch nicht bestiegen<\/option><option value=\"wish\">Wunschliste<\/option><\/select><\/div>\n      <div class=\"f\"><span class=\"lab\">In meiner Nähe<\/span><div class=\"hrow\"><button class=\"nearbtn\" id=\"near\" type=\"button\">Standort verwenden<\/button><select id=\"radius\" aria-label=\"Umkreis\" hidden><option value=\"\">beliebig weit<\/option><option value=\"10\">10 km<\/option><option value=\"25\">25 km<\/option><option value=\"50\">50 km<\/option><option value=\"100\">100 km<\/option><\/select><\/div><\/div>\n      <div class=\"f wide note\" id=\"nearmsg\" hidden><\/div>\n    <\/div>\n    <div class=\"status\">\n      <span><strong id=\"count\">–<\/strong> Gipfel<\/span>\n      <button class=\"reset\" id=\"reset\" type=\"button\" hidden>Filter zurücksetzen<\/button>\n      <select id=\"sort\" aria-label=\"Sortierung\">\n        <option value=\"hd\">Höchste zuerst<\/option>\n        <option value=\"ha\">Niedrigste zuerst<\/option>\n        <option value=\"na\">Name A–Z<\/option>\n        <option value=\"near\">Nächste zuerst<\/option>\n      <\/select>\n    <\/div>\n    <div class=\"list\" id=\"list\" tabindex=\"0\"><div class=\"spacer\" id=\"spacer\"><\/div><\/div>\n    <footer class=\"foot\" id=\"foot\" hidden><\/footer>\n    <div class=\"detail\" id=\"detail\" hidden><\/div>\n    <div class=\"detail\" id=\"bookpanel\" hidden><\/div>\n    <div class=\"loading\" id=\"loading\">Gipfeldaten werden geladen …<\/div>\n  <\/section>\n\n  <section class=\"mapwrap\" id=\"mapwrap\">\n    <div id=\"map\"><\/div>\n    <div class=\"legend\" id=\"legendbox\" data-open=\"true\"><button type=\"button\" class=\"legtoggle\" id=\"legtoggle\" aria-expanded=\"true\" aria-controls=\"legbody\">Legende<\/button><div class=\"lrow note\" id=\"tmsg\" role=\"status\" hidden><\/div><div class=\"legbody\" id=\"legbody\"><div class=\"lrow\" id=\"legend\"><\/div><div class=\"lrow\" id=\"tlegend\" hidden><\/div><label class=\"lrow hutrow\"><input type=\"checkbox\" id=\"huts\" checked><i class=\"sq\"><\/i>Hütten anzeigen (ab mittlerer Zoomstufe)<\/label><\/div><\/div>\n    <div class=\"tip\" id=\"tip\" hidden><\/div>\n    <div class=\"view3d\" id=\"view3d\" hidden><div id=\"v3map\"><\/div><button class=\"back\" id=\"v3close\" type=\"button\">← Zur flachen Karte<\/button><div class=\"v3hint\">Ziehen: verschieben · rechte Maustaste oder zwei Finger: drehen und kippen<\/div><div class=\"v3msg\" id=\"v3msg\" role=\"status\"><\/div><\/div>\n  <\/section>\n<\/div>\n";
// the summit page's own text (written for search engines) stays visible in the summit's overview tab
const SEO_TEXT = (() => { const a = document.querySelector('#app-root article.seo'); return a ? { id: window.AG_PEAK, html: a.innerHTML.replace(/<h1>[\s\S]*?<\/h1>/, '') } : null; })();
if ($('app-root')) $('app-root').innerHTML = SHELL;
// Hosted on a web server each summit has its own address; the single-file build keeps everything on one page.
const HOSTED = !$('data-peaks') && location.protocol.startsWith('http');
const ROOT = new URL(window.AG_BASE || './', location.href).pathname;
const fmt = new Intl.NumberFormat('de-DE');
const BANDS = [[0, 1000, '--h0', 'unter 1000'], [1000, 2000, '--h1', '1000–2000'], [2000, 3000, '--h2', '2000–3000'], [3000, 4000, '--h3', '3000–4000'], [4000, 9999, '--h5', 'über 4000']];
const ROW = 52;
let D, GEO, N = 0, idx = [], selected = -1, rankByEle = null;
let map, peakLayer, cssColors = {}, mapShown = false;
let me = null, distKm = null, idIndex = null, showHuts = true;
try { showHuts = localStorage.getItem('alpengipfel.huts') !== '0'; } catch (err) { /* default: shown */ }
const ALPS_BOUNDS = [[43.4, 5.0], [48.4, 16.6]];

function bandOf(e) { if (e == null) return -1; for (let i = 0; i < BANDS.length; i++) if (e < BANDS[i][1]) return i; return BANDS.length - 1; }
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  ['--h0','--h1','--h2','--h3','--h4','--h5','--ink','--surface','--accent','--map-alps','--map-water','--map-border','--map-group','--map-label','--map-land','--muted','--tw','--ta','--tk','--tt','--hut','--park','--stop']
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
  const nAct = [hmin != null || hmax != null, c != null, s != null, g != null, kind !== '', !!bk, rad != null].filter(Boolean).length;
  $('fcount').hidden = !nAct; $('fcount').textContent = nAct;
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
  const cover = MOBILE() ? Math.min(sheetPx($('app').dataset.sheet || 'half'), $('mapwrap').clientHeight - 120) : 0;
  map.fitBounds([[a, b], [c, d]], { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30 + Math.max(0, cover)], maxZoom: 13 });
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
/* ---------- Camptocamp route titles: common French, Italian and English terms in German ---------- */
// Translates the common French, Italian and English terms in Camptocamp route titles into German.
const DIRS = { N: 'Nord', S: 'Süd', E: 'Ost', W: 'West', O: 'West', NE: 'Nordost', NO: 'Nordwest', NW: 'Nordwest', SE: 'Südost', SO: 'Südwest', SW: 'Südwest' };
const NOUNS = { face: ['wand', 'die'], paroi: ['wand', 'die'], parete: ['wand', 'die'], 'arête': ['grat', 'den'], arete: ['grat', 'den'], 'crête': ['grat', 'den'], cresta: ['grat', 'den'], ridge: ['grat', 'den'],
  versant: ['flanke', 'die'], versante: ['flanke', 'die'], flanc: ['flanke', 'die'], couloir: ['rinne', 'die'], canale: ['rinne', 'die'], canalone: ['rinne', 'die'], gully: ['rinne', 'die'],
  pilier: ['pfeiler', 'den'], pilastro: ['pfeiler', 'den'], 'éperon': ['sporn', 'den'], sperone: ['sporn', 'den'], spigolo: ['kante', 'die'], glacier: ['gletscher', 'den'], ghiacciaio: ['gletscher', 'den'] };
const NOUN = Object.keys(NOUNS).join('|'), DIR = Object.keys(DIRS).sort((a, b) => b.length - a.length).join('|');
const ART = "(?:le |la |les |l'|l’|il |lo |i |gli |the )?";
function deTitle(t) {
  let s = ' ' + t.trim() + ' ';
  const compound = (noun, dir) => DIRS[dir] + NOUNS[noun.toLowerCase()][0];
  // "par le versant SE" -> "über die Südostflanke"
  s = s.replace(new RegExp(`\\b(?:par|per|via)\\s+${ART}(${NOUN})\\s+(${DIR})(?![\\wÀ-ÿ])`, 'giu'), (m, n, d) => DIRS[d] ? ` über ${NOUNS[n.toLowerCase()][1]} ${compound(n, d)}` : m);
  // "Face N", "l'arête SW" -> "Nordwand", "Südwestgrat"
  s = s.replace(new RegExp(`(^|[\\s(\\-–>])${ART}(${NOUN})\\s+(${DIR})(?![\\wÀ-ÿ])`, 'giu'), (m, pre, n, d) => DIRS[d] ? pre + compound(n, d) : m);
  // English "SW ridge", "N face"
  s = s.replace(new RegExp(`(^|\\s)(${DIR})\\s+(face|ridge|gully|couloir)\\b`, 'gu'), (m, pre, d, n) => pre + compound(n, d));
  // "Arête du Hörnli" -> "Hörnligrat", "Couloir Coolidge" -> "Coolidge-Rinne"
  s = s.replace(/(^|[\s(])(?:l'|l’)?([Aa]rête|[Cc]resta|[Cc]rête)\s+(?:du |de la |des |de l'|del |della |dei )([A-ZÄÖÜ][\wäöüß]+)(?=[\s,.)]|$)/gu, (m, pre, n, x) => pre + x + 'grat');
  s = s.replace(/(^|\s)([Cc]ouloir|[Cc]anale)\s+([A-Z][\wäöüß]+)(?=[\s,.)]|$)/gu, (m, pre, n, x) => DIRS[x] ? m : pre + x + '-Rinne');
  const rep = [
    [/\b(?:voie|via) normale\b/giu, 'Normalweg'], [/\bitinéraire normal(?:e)?\b/giu, 'Normalweg'], [/\b(?:normal|standard) (?:route|ascent)\b/giu, 'Normalweg'],
    [/\btravers(?:ée|ata|e)\b/giu, 'Überschreitung'], [/\btravers(?:ées|ate)\b/giu, 'Überschreitungen'],
    [/(^|\s)en boucle\b/giu, '$1Rundtour'], [/\b(?:boucle|giro ad anello|anello|circuit|loop)\b/giu, 'Rundtour'],
    [/\bretour par\b/giu, 'Rückweg über'], [/\b(?:descente par|discesa per|discesa da)\b/giu, 'Abstieg über'], [/\b(?:montée par|salita per|salita da)\b/giu, 'Aufstieg über'],
    [/\bdepuis (?:le |la |les |l'|l’)?/giu, 'von '], [/\b(?:dalla|dallo|dal|dai|dagli|dall'|dall’) ?/gu, 'von '], [/(^|\s)da (?=[A-ZÄÖÜ])/gu, '$1von '], [/\bfrom\b/giu, 'von'],
    [/\bpar (?:le |la |les |l'|l’)?/giu, 'über '], [/\bper (?:il |la |lo |le |i |gli |l'|l’)?/giu, 'über '],
    [/\b(?:hiver|inverno)\b/giu, 'Winter'], [/(^|\s)été(?=\s|$)/giu, '$1Sommer'], [/\bdirecte\b/giu, 'Direkte'], [/\bintégrale\b/giu, 'Integrale'],
    [/ (?:et|ed) /gu, ' und '], [/\s+/g, ' ']
  ];
  for (const [re, to] of rep) s = s.replace(re, to);
  s = s.trim();
  return s ? s[0].toUpperCase() + s.slice(1) : t;
}

/* ---------- ways and routes to the summit ---------- */
const KINDS = ['Wandern', 'Hochalpin', 'Klettersteig', 'Skitour'];
const KIND_HINT = ['Wanderwege und -routen bis T3 oder ohne Schwierigkeitsangabe', 'Alpinwanderwege T4–T6, Hochtouren und Klettereien', 'Gesicherte Steige mit Drahtseil, Klettersteigset nötig', 'Skitouren und Schneeschuhrouten im Winter'];
const gradeLabel = (cat, grade, vf) => [grade ? 'T' + grade : '', vf === '0' ? 'gesicherter Steig' : vf ? 'Klettersteig-Skala ' + vf + ' von 6' : ''].filter(Boolean).join(' · ');
function routesHtml(i, d) {
  if (HOSTED) return routesHostedHtml(i, d);
  const P = D.peaks, osm = [[], [], [], []], c2c = [[], [], [], []];
  (d.rt || []).forEach(([rel, rname, cat, grade, vf]) => {
    const x = [rel, rname];
    osm[cat].push(`<li><a href="https://hiking.waymarkedtrails.org/#route?id=${x[0]}" target="_blank" rel="noopener">${esc(x[1] || 'Markierte Route ohne Namen')}</a>` +
      (HOSTED ? `<button type="button" class="onmap" data-rel="${x[0]}">Auf Karte</button>` : '') +
      `<small>markierte Route${gradeLabel(cat, grade, vf) ? ' · ' + gradeLabel(cat, grade, vf) : ''}</small></li>`);
  });
  (d.ap || []).forEach(([cat, grade, vf, name]) => {
    osm[cat].push(`<li>${esc(name || (cat === 2 ? 'Klettersteig ohne Namen' : 'Weg ohne Namen'))}<small>${gradeLabel(cat, grade, vf) || 'ohne Schwierigkeitsangabe'}</small></li>`);
  });
  (d.cc || []).forEach(([id, title, cat, act, rating, up]) => {
    c2c[cat].push(`<li><a href="https://www.camptocamp.org/routes/${id}" target="_blank" rel="noopener"${title && deTitle(title) !== title.trim() ? ` title="Originaltitel: ${esc(title)}"` : ''}>${esc(title ? deTitle(title) : 'Route ohne Namen')}</a>` +
      `<small>${[D.c2cActs[act], rating, up ? fmt.format(up) + ' Hm Aufstieg' : ''].filter(Boolean).map(esc).join(' · ')}</small></li>`);
  });
  const near = d.nr || [], total = osm.concat(c2c).reduce((s, g) => s + g.length, 0);
  let out = `<section class="ways"><h3 class="h3">Wege und Routen auf den Gipfel</h3>`;
  if (!total && !near.length) out += `<p class="note">Weder in OpenStreetMap noch bei Camptocamp ist ein Weg oder eine Route zu diesem Gipfel erfasst. Das heißt meist: wegloser Anstieg oder ein selten besuchter Nebengipfel.</p>`;
  KINDS.forEach((kind, cat) => {
    const n = osm[cat].length + c2c[cat].length;
    if (!n) return;
    const moreOsm = osm[cat].length - 15, moreC = c2c[cat].length - 8;
    out += `<div class="kind"><div class="kh"><span class="kb k${cat}">${kind}</span><small>${KIND_HINT[cat]}</small></div><ul class="rts">` +
      osm[cat].slice(0, 15).join('') + (moreOsm > 0 ? `<li>und ${moreOsm} weitere Wege</li>` : '') +
      c2c[cat].slice(0, 8).join('') + (moreC > 0 ? `<li><a href="https://www.camptocamp.org/waypoints/${d.cw}" target="_blank" rel="noopener">${moreC} weitere Routen bei Camptocamp</a></li>` : '') + `</ul></div>`;
  });
  if (near.length) out += `<div class="kind"><div class="kh"><span class="kb kn">In Gipfelnähe</span><small>Diese Wege führen nicht bis zum Gipfel, das letzte Stück ist weglos</small></div><ul class="rts">` +
    near.map(([dist, cat, grade, vf, name]) => `<li>${esc(name || 'Weg ohne Namen')}<small>${dist} m vom Gipfel entfernt · ${KINDS[cat]}${gradeLabel(cat, grade, vf) ? ' · ' + gradeLabel(cat, grade, vf) : ''}</small></li>`).join('') + `</ul></div>`;
  if (d.fw) out += `<p class="note fw"><b>Fernwanderwege über den Gipfel:</b> ${d.fw.map(esc).join(' · ')}. Sie führen nur hier vorbei und sind deshalb nicht als Aufstieg aufgeführt.</p>`;
  if (total || near.length) out += `<p class="note">Markierte Routen sind nur aufgeführt, wenn sie bis zum Gipfel führen; Fernwanderwege, die nur vorbeiführen, stehen gesondert. Wege und markierte Routen: OpenStreetMap, mit der Schwierigkeit des Abschnitts am Gipfel (SAC-Wanderskala T1–T6). ` +
    `Hochtouren, Klettereien, Skitouren und weitere Routen: <a href="https://www.camptocamp.org/" target="_blank" rel="noopener">Camptocamp.org</a> (CC BY-SA 3.0), Schwierigkeit dort nach Alpinskala von F (leicht) bis ED (extrem schwierig). ` +
    `Die Angaben stammen von Freiwilligen und können fehlen oder veraltet sein.</p>`;
  return out + '</section>';
}

const ccItem = ([id, title, cat, act, rating, up]) => `<li><a href="https://www.camptocamp.org/routes/${id}" target="_blank" rel="noopener"${title && deTitle(title) !== title.trim() ? ` title="Originaltitel: ${esc(title)}"` : ''}>${esc(title ? deTitle(title) : 'Route ohne Namen')}</a>` +
  `<small>${[D.c2cActs[act], rating, up ? fmt.format(up) + ' Hm Aufstieg' : ''].filter(Boolean).map(esc).join(' · ')}</small></li>`;
const NORMAL = /normal|voie normale|via normale|ordinaire|normale/i;
function routesHostedHtml(i, d) {
  let out = `<section class="ways ascent"><h3 class="h3">Aufstiege vom Parkplatz</h3><div id="asclist" aria-live="polite"><p class="note">Wege zum Gipfel werden berechnet …</p></div></section>` +
    `<section class="ways" id="trackbox"><h3 class="h3">Tracks von Nutzern</h3><div id="tracklist" aria-live="polite"><p class="note">Tracks werden geladen …</p></div><div id="trackup"></div></section>`;
  const cc = (d.cc || []).map((c, k) => [c, k]).sort((a, b) => (NORMAL.test(b[0][1]) - NORMAL.test(a[0][1])) || a[1] - b[1]).map(x => x[0]);
  if (cc.length) out += `<section class="ways"><h3 class="h3">Hochtouren, Klettereien und Skitouren</h3><ul class="rts">${cc.slice(0, 5).map(ccItem).join('')}` +
    (cc.length > 5 ? `<li><a href="https://www.camptocamp.org/waypoints/${d.cw}" target="_blank" rel="noopener">Alle ${cc.length} Routen bei Camptocamp</a></li>` : '') + `</ul>` +
    `<p class="note">Beschreibungen von <a href="https://www.camptocamp.org/" target="_blank" rel="noopener">Camptocamp.org</a> (CC BY-SA 3.0), Normalwege zuerst; Schwierigkeit nach Alpinskala von F (leicht) bis ED (extrem schwierig).</p></section>`;
  if (d.fw) out += `<p class="note fw"><b>Fernwanderwege über den Gipfel:</b> ${d.fw.map(esc).join(' · ')}. Sie führen nur hier vorbei und sind deshalb nicht als Aufstieg aufgeführt.</p>`;
  return out;
}
/* ---------- trails on the map (fetched live from OpenStreetMap via Overpass) ---------- */
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const SAC = { strolling: 1, hiking: 1, mountain_hiking: 2, demanding_mountain_hiking: 3, alpine_hiking: 4, demanding_alpine_hiking: 5, difficult_alpine_hiking: 6 };
const trailCache = new Map();
let trailLayer, hiLayer, trailsFor = -1, hiFor = -1;
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
const QLEVER = 'https://qlever.dev/api/osm-planet';
const QPFX = 'PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:> PREFIX osmnode: <https://www.openstreetmap.org/node/> PREFIX osmrel: <https://www.openstreetmap.org/relation/> ' +
  'PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX ogc: <http://www.opengis.net/rdf#> PREFIX qlss: <https://qlever.cs.uni-freiburg.de/spatialSearch/> ';
const WAYS = '?w osmkey:highway ?h ; geo:hasGeometry/geo:asWKT ?g . FILTER(?h = "path" || ?h = "footway" || ?h = "track" || ?h = "via_ferrata" || ?h = "steps")';
// paths within `dist` metres of a summit; candidates are the paths of the districts and municipalities the summit lies in
const nearQuery = (id, dist, select, payload, inner) => `SELECT DISTINCT ${select} WHERE { osmnode:${id} geo:hasGeometry/geo:asWKT ?pg . ` +
  `SERVICE qlss: { _:c qlss:algorithm qlss:libspatialjoin ; qlss:joinType qlss:within-dist ; qlss:maxDistance ${dist} ; qlss:left ?pg ; qlss:right ?g ; qlss:payload ${payload} . { ${inner} } } }`;
const inDistricts = id => `?m ogc:sfIntersects osmnode:${id} ; osmkey:boundary "administrative" ; osmkey:admin_level ?l . FILTER(?l >= 6) ?m ogc:sfIntersects ?w . `;
async function qlever(query, tries = 3) {           // rows of a SPARQL result, values unquoted
  for (let k = 1; ; k++) {
    try { return await qleverOnce(query); }
    catch (err) { if (k >= tries || !/^(429|502|503|504)$/.test(err.message)) throw err; await new Promise(r => setTimeout(r, 1500 * k)); }
  }
}
async function qleverOnce(query) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(QLEVER, { method: 'POST', body: 'query=' + encodeURIComponent(QPFX + query), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'text/tab-separated-values' }, signal: ctl.signal });
    if (!r.ok) throw new Error(r.status);
    return (await r.text()).split('\n').slice(1).filter(Boolean).map(line => line.split('\t').map(v => v[0] === '<' ? v.slice(1, -1) : v[0] === '"' ? v.slice(1, v.lastIndexOf('"')) : v));
  } finally { clearTimeout(timer); }
}
const wktLine = wkt => { const ll = []; wkt.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, lon, lat) => { ll.push([+lat, +lon]); }); return ll; };
const wayId = iri => +iri.slice(iri.lastIndexOf('/') + 1);
function trailMsg(text) { const el = $('tmsg'); el.hidden = !text; el.textContent = text; }
function clearTrails() { trailsFor = -1; if (trailLayer) { trailLayer.clearLayers(); showAllTrails(); } if ($('tlegend')) { trailMsg(''); $('tlegend').hidden = true; } }
async function fetchTrails(i) {                     // -> { ways: [{ id, t: tags, ll }], marked: Set of way ids, or null while still loading }
  const P = D.peaks, id = P.id[i];
  let empty = false;
  try {
    const rows = await qlever(nearQuery(id, 2000, '?w ?h ?sac ?vf ?name ?g', '?w , ?h , ?sac , ?vf , ?name',
      inDistricts(id) + WAYS + ' OPTIONAL { ?w osmkey:sac_scale ?sac } OPTIONAL { ?w osmkey:via_ferrata_scale ?vf } OPTIONAL { ?w osmkey:name ?name }'));
    if (rows.length) return { marked: null, ways: rows.map(r => ({ id: wayId(r[0]), t: { highway: r[1], sac_scale: r[2], via_ferrata_scale: r[3], name: r[4] }, ll: wktLine(r[5]) })) };
    empty = true;
  } catch (err) { /* fall through to the second source */ }
  try {
    const d = await overpass(`[out:json][timeout:20];way(around:2000,${P.la[i]},${P.lo[i]})[highway~"^(path|footway|track|via_ferrata|steps)$"]->.w;.w out tags geom qt;` +
      `rel(bw.w)[type=route][route~"^(hiking|foot)$"];way(r)->.rw;way.w.rw;out ids qt;`);
    return { marked: new Set(d.elements.filter(e => !e.geometry).map(e => e.id)), ways: d.elements.filter(e => e.geometry).map(e => ({ id: e.id, t: e.tags || {}, ll: e.geometry.map(p => [p.lat, p.lon]) })) };
  } catch (err) { if (empty) return { marked: new Set(), ways: [] }; throw err; }
}
function drawTrails(data) {
  trailLayer.clearLayers();
  const lines = [];
  for (const w of data.ways) {
    const t = w.t, g = Math.max(0, ...(t.sac_scale || '').split(';').map(v => SAC[v.trim()] || 0));
    const cat = t.highway === 'via_ferrata' || t.via_ferrata_scale ? 2 : g >= 4 ? 1 : 0, track = t.highway === 'track' && !g, on = !!data.marked && data.marked.has(w.id);
    const label = [t.name, track ? 'Fahrweg' : '', g ? 'T' + g : '', cat === 2 ? 'Klettersteig' + (t.via_ferrata_scale ? ' ' + t.via_ferrata_scale : '') : '', on ? 'markierte Route' : ''].filter(Boolean).join(' · ') || 'Weg ohne Angaben';
    lines.push({ ll: w.ll, track, label, rank: cat * 10 + g + (on ? 5 : 0),
      style: { color: cssColors[cat === 2 ? '--tk' : cat === 1 ? '--ta' : track ? '--tt' : '--tw'], weight: (track ? 1.8 : 2.6) + (on ? 1.6 : 0), opacity: .95, dashArray: !g && !cat && !track && !on ? '5 5' : null } });
  }
  lines.sort((x, y) => x.rank - y.rank);
  lines.forEach(l => { if (!l.track) L.polyline(l.ll, { color: cssColors['--surface'], weight: l.style.weight + 2.4, opacity: .85, interactive: false }).addTo(trailLayer); });
  lines.forEach(l => L.polyline(l.ll, l.style).bindTooltip(l.label, { sticky: true }).addTo(trailLayer));
  trailMsg(''); const el = $('tlegend'); el.hidden = false;
  el.innerHTML = lines.length ? `<span><i class="ln" style="background:var(--tw)"></i>Wandern</span><span><i class="ln" style="background:var(--ta)"></i>Hochalpin T4–T6</span>` +
    `<span><i class="ln" style="background:var(--tk)"></i>Klettersteig</span><span><i class="ln" style="background:var(--tt)"></i>Fahrweg</span><span>${data.marked ? 'dick = markierte Route' : 'markierte Routen werden geladen …'}</span>` : 'Im Umkreis von 2 km ist kein Weg erfasst.';
}
async function loadTrails(i) {
  if (!HOSTED || !map || trailsFor === i || !$('map').clientWidth) return;      // on phones the map loads once it is opened
  trailsFor = i; trailLayer.clearLayers(); if (hiFor !== i) showAllTrails(); trailMsg('Wege um den Gipfel werden geladen …');
  let data = trailCache.get(i);
  if (!data) {
    try { data = await fetchTrails(i); trailCache.set(i, data); }
    catch (err) { if (trailsFor === i) { trailsFor = -1; trailMsg('Die Wege um den Gipfel konnten gerade nicht geladen werden.'); } return; }
  }
  const current = () => trailsFor === i && selected === i;
  if (!current()) return;
  drawTrails(data);
  if (!data.marked && data.ways.length) {            // second, slower step: which of these paths carry a signposted route
    const id = D.peaks.id[i];
    try {
      const rows = await qlever(nearQuery(id, 2000, '?w', '?w', inDistricts(id) + WAYS + ' ?rm osmrel:member_id ?w . ?r osmrel:member ?rm ; osmkey:route ?rt . FILTER(?rt = "hiking" || ?rt = "foot")'));
      data.marked = new Set(rows.map(r => wayId(r[0])));
    } catch (err) { data.marked = new Set(); }
    if (current()) drawTrails(data);
  }
}
async function showRouteOnMap(rel, btn) {
  const i = selected; if (i < 0 || !map) return;
  const P = D.peaks, la = P.la[i], lo = P.lo[i];
  btn.disabled = true; btn.textContent = 'Lädt …';
  try {
    let ll = [];
    try {
      ll = (await qlever(nearQuery(P.id[i], 15000, '?w ?g', '?w', `osmrel:${+rel} osmrel:member ?m . ?m osmrel:member_id ?w . ?w geo:hasGeometry/geo:asWKT ?g`))).map(r => wktLine(r[1])).filter(l => l.length > 1);
    } catch (err) { /* second source below */ }
    if (!ll.length) {
      const d = await overpass(`[out:json][timeout:25];rel(${+rel});way(r)(${la - 0.15},${lo - 0.22},${la + 0.15},${lo + 0.22});out geom qt;`);
      ll = d.elements.filter(e => e.geometry).map(e => e.geometry.map(p => [p.lat, p.lon]));
    }
    if (!ll.length) throw new Error('empty');
    setView('map'); hiLayer.clearLayers(); hiFor = i;
    if (map.hasLayer(trailLayer)) map.removeLayer(trailLayer);      // only this route
    L.polyline(ll, { color: cssColors['--surface'], weight: 9, opacity: .9, interactive: false }).addTo(hiLayer);
    const line = L.polyline(ll, { color: cssColors['--accent'], weight: 4.5, interactive: false }).addTo(hiLayer);
    map.fitBounds(line.getBounds(), { padding: [30, 30], maxZoom: 14 });
    btn.textContent = 'Auf Karte';
  } catch (err) { btn.textContent = 'Gerade nicht verfügbar'; setTimeout(() => { btn.textContent = 'Auf Karte'; }, 2500); }
  btn.disabled = false;
}
/* ---------- ascents from the car park: routed in the browser on the OpenStreetMap path network around the summit ---------- */
const NET_H = ['path', 'footway', 'track', 'via_ferrata', 'steps', 'bridleway', 'pedestrian', 'service', 'unclassified', 'residential', 'living_street', 'tertiary', 'secondary', 'primary'];
const ROADF = { service: 1.3, unclassified: 1.3, residential: 1.3, living_street: 1.2, tertiary: 2.5, secondary: 5, primary: 8, gap: 3 };   // cost factors per metre
const inAreas = (id, ar, v) => ar ? `VALUES ?m { ${ar.map(a => 'osmrel:' + a).join(' ')} } ?m ogc:sfIntersects ${v} . ` : inDistricts(id).replace(/\?w \. $/, v + ' . ');
const atPoints = pts => `VALUES ?pg { ${pts.map(p => `"POINT(${p[1].toFixed(6)} ${p[0].toFixed(6)})"^^geo:wktLiteral`).join(' ')} } `;
const nearPts = (pts, dist, select, payload, inner) => `SELECT DISTINCT ${select} WHERE { ${atPoints(pts)}` +
  `SERVICE qlss: { _:c qlss:algorithm qlss:libspatialjoin ; qlss:joinType qlss:within-dist ; qlss:maxDistance ${dist} ; qlss:left ?pg ; qlss:right ?g ; qlss:payload ${payload} . { ${inner} } } }`;
const NET_SEL = ['?w ?h ?sac ?vf ?name ?foot ?g', '?w , ?h , ?sac , ?vf , ?name , ?foot'];
const netInner = (id, ar) => inAreas(id, ar, '?w') + `?w osmkey:highway ?h ; geo:hasGeometry/geo:asWKT ?g . FILTER(${NET_H.map(h => `?h = "${h}"`).join(' || ')}) ` +
  'OPTIONAL { ?w osmkey:sac_scale ?sac } OPTIONAL { ?w osmkey:via_ferrata_scale ?vf } OPTIONAL { ?w osmkey:name ?name } OPTIONAL { ?w osmkey:foot ?foot }';
const PARK_SEL = ['?p ?name ?access ?g', '?p , ?name , ?access'];
const parkInner = (id, ar) => inAreas(id, ar, '?p') + '?p osmkey:amenity "parking" ; geo:hasGeometry/geo:asWKT ?g . OPTIONAL { ?p osmkey:name ?name } OPTIONAL { ?p osmkey:access ?access }';
const netQuery = (id, dist, ar) => nearQuery(id, dist, ...NET_SEL, netInner(id, ar));
const parkQuery = (id, dist, ar) => nearQuery(id, dist, ...PARK_SEL, parkInner(id, ar));
const memberQuery = rels => `SELECT ?r ?w ?g WHERE { VALUES ?r { ${rels.map(r => 'osmrel:' + (+r)).join(' ')} } ?r osmrel:member ?m . ?m osmrel:member_id ?w . ?w geo:hasGeometry/geo:asWKT ?g }`;
function metres(a, b) {
  const k = Math.PI / 180, x = (b[1] - a[1]) * k * Math.cos((a[0] + b[0]) / 2 * k), y = (b[0] - a[0]) * k;
  return Math.hypot(x, y) * 6371000;
}
function buildNet(rows) {
  const ids = new Map(), pts = [], adj = [], ways = [], seen = new Set();
  const vert = p => { const k = p[0] + ',' + p[1]; let x = ids.get(k); if (x === undefined) { x = pts.length; ids.set(k, x); pts.push(p); adj.push([]); } return x; };
  for (const [w, h, sac, vf, name, foot, g] of rows) {
    if (seen.has(w) || foot === 'no' || foot === 'private' || !/LINESTRING/.test(g)) continue;
    seen.add(w);
    const ll = wktLine(g); if (ll.length < 2) continue;
    const grade = Math.max(0, ...(sac || '').split(';').map(s => SAC[s.trim()] || 0));
    const fer = h === 'via_ferrata' || /^[0-6][+-]?$/.test(vf || '');
    const wi = ways.length, way = { id: wayId(w), h, grade, vf: fer && /^[0-6][+-]?$/.test(vf || '') ? vf : '', fer, name: name || '', len: 0 };
    ways.push(way);
    let a = vert(ll[0]);
    for (let k = 1; k < ll.length; k++) {
      const b = vert(ll[k]), d = metres(ll[k - 1], ll[k]); way.len += d;
      if (a !== b) { adj[a].push(b, wi, d); adj[b].push(a, wi, d); }
      a = b;
    }
  }
  // short gaps in the mapping: join each dead end to the nearest point of another way within 60 m (counted as pathless)
  const gap = ways.length; ways.push({ id: 0, h: 'gap', grade: 0, vf: '', fer: false, name: '', len: 0 });
  const cell = new Map(), key = (la, lo) => Math.floor(la * 2000) + ':' + Math.floor(lo * 1400);
  pts.forEach((p, v) => { const k = key(p[0], p[1]); if (!cell.has(k)) cell.set(k, []); cell.get(k).push(v); });
  for (let v = 0; v < pts.length; v++) {
    if (adj[v].length !== 3) continue;               // exactly one neighbour: a dead end
    const p = pts[v], own = adj[v][1]; let best = -1, bd = 60;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      for (const u of cell.get(Math.floor(p[0] * 2000) + a + ':' + (Math.floor(p[1] * 1400) + b)) || []) {
        if (u === v || u === adj[v][0]) continue;
        const au = adj[u]; let mine = false; for (let j = 1; j < au.length; j += 3) if (au[j] === own) mine = true;
        if (mine) continue;
        const d = metres(p, pts[u]); if (d < bd) { bd = d; best = u; }
      }
    }
    if (best >= 0) { adj[v].push(best, gap, bd); adj[best].push(v, gap, bd); }
  }
  return { pts, adj, ways };
}
function nearestVert(net, p) {
  let best = -1, bd = Infinity;
  for (let v = 0; v < net.pts.length; v++) { const q = net.pts[v]; if (Math.abs(q[0] - p[0]) > .01 || Math.abs(q[1] - p[1]) > .015) continue; const d = metres(p, q); if (d < bd) { bd = d; best = v; } }
  return [best, bd];
}
function dijkstra(net, s, factor) {               // factor(way) -> cost per metre, Infinity = not allowed
  const n = net.pts.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), via = new Int32Array(n).fill(-1);
  const f = net.ways.map(factor), hk = [], hv = [];
  const push = (k, v) => { let i = hk.length; hk.push(k); hv.push(v); while (i > 0) { const p = (i - 1) >> 1; if (hk[p] <= k) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; } hk[i] = k; hv[i] = v; };
  const pop = () => { const v = hv[0], k = hk.pop(), x = hv.pop(); let i = 0; const m = hk.length; if (m) { while (true) { let c = 2 * i + 1; if (c >= m) break; if (c + 1 < m && hk[c + 1] < hk[c]) c++; if (hk[c] >= k) break; hk[i] = hk[c]; hv[i] = hv[c]; i = c; } hk[i] = k; hv[i] = x; } return v; };
  dist[s] = 0; push(0, s);
  while (hk.length) {
    const k0 = hk[0], u = pop(); if (k0 > dist[u]) continue;
    const a = net.adj[u];
    for (let j = 0; j < a.length; j += 3) {
      const c = f[a[j + 1]]; if (c === Infinity) continue;
      const nd = dist[u] + a[j + 2] * c, v = a[j];
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; via[v] = a[j + 1]; push(nd, v); }
    }
  }
  return { dist, prev, via };
}
const demTiles = new Map();
function demTile(k) {
  if (!demTiles.has(k)) demTiles.set(k, new Promise((res, rej) => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.drawImage(im, 0, 0); res(g.getImageData(0, 0, 256, 256).data); };
    im.onerror = () => { demTiles.delete(k); rej(new Error('dem')); };
    im.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${k}.png`;
  }));
  return demTiles.get(k);
}
function heights(pts) {                            // terrain height (Mapzen terrain tiles, about 15 m per pixel) at each point
  const n = 2 ** 13;
  return Promise.all(pts.map(async ([la, lo]) => {
    const s = Math.sin(la * Math.PI / 180), x = (lo + 180) / 360 * n, y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
    const tx = Math.floor(x), ty = Math.floor(y), d = await demTile(`13/${tx}/${ty}`);
    const o = (Math.min(255, Math.floor((y - ty) * 256)) * 256 + Math.min(255, Math.floor((x - tx) * 256))) * 4;
    return d[o] * 256 + d[o + 1] + d[o + 2] / 256 - 32768;
  }));
}
async function climb(ll) {                         // -> { up, down, h } with walking time after DIN 33466
  const pts = [ll[0]];
  for (let k = 1; k < ll.length; k++) {
    const a = ll[k - 1], b = ll[k], d = metres(a, b), m = Math.floor(d / 30);
    for (let j = 1; j <= m; j++) pts.push([a[0] + (b[0] - a[0]) * j / (m + 1), a[1] + (b[1] - a[1]) * j / (m + 1)]);
    pts.push(b);
  }
  const z = await heights(pts);
  let up = 0, down = 0, ref = z[0];
  for (const h of z) { if (h - ref > 8) { up += h - ref; ref = h; } else if (ref - h > 8) { down += ref - h; ref = h; } }
  return { up: Math.round(up), down: Math.round(down), start: Math.round(z[0]), trk: pts.map((p, k) => [p[0], p[1], Math.round(z[k])]) };
}
const hm = h => { const m = Math.round(h * 60 / 5) * 5; return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + String(m % 60).padStart(2, '0') + ' min' : ''); };
const dinHours = (km, up, down) => { const th = km / 4, tv = up / 300 + down / 500; return Math.max(th, tv) + Math.min(th, tv) / 2; };
const ascents = new Map();
let ascList = [], trackList = [], selKey = '';
function loadAscents(i, d) {
  if (!$('asclist')) return;
  let p = ascents.get(i);
  if (!p) { p = computeAscents(i, d); ascents.set(i, p); p.catch(() => ascents.delete(i)); }
  p.then(r => { if (selected === i) renderAscents(i, d, r); }, () => { if (selected === i) renderAscError(i, d); });
  loadTracks(i);
}
const startName = (s, h) => s.name || (s.kind ? START_KIND[s.kind] : 'Parkplatz') + (h ? ' auf ' + fmt.format(Math.round(h / 10) * 10) + ' m' : ' ohne Namen');
function ascTitle(x) { return x.type === 'normal' ? x.name : x.type === 'rel' ? (x.name || 'Markierte Route ohne Namen') : (x.name || 'Klettersteig ohne Namen'); }
const factsHtml = x => `<span class="ascfacts"><span>${n1(x.km)} km</span>${x.up != null ? `<span>↑ ${fmt.format(x.up)} Hm</span>` : ''}${x.down > 30 ? `<span>↓ ${fmt.format(x.down)} Hm</span>` : ''}<span>${x.up != null ? hm(x.h) : ''}</span></span>`;
function renderAscents(i, d, r) {
  const box = $('asclist'); if (!box) return;
  ascList = r.list; if (selKey.startsWith('a:')) selKey = '';
  if (!r.list.length) {
    const nr = d.nr && d.nr[0];
    box.innerHTML = `<p class="note">${r.why === 'noway' ? 'In OpenStreetMap führt kein Weg bis zum Gipfel' + (nr ? ` (der nächste endet etwa ${nr[0]} m entfernt)` : '') + '. Der Gipfel ist weglos oder nur über Gletscher, Fels oder Klettereien erreichbar.'
      : r.why === 'island' ? 'Die Wege am Gipfel sind in OpenStreetMap nicht durchgehend bis ins Tal eingetragen; meist liegt dazwischen ein Gletscher, Fels oder Kletterei.'
      : 'Im Umkreis von etwa 6 km ist kein öffentlicher Parkplatz mit Weg zum Gipfel erfasst.'}${d.cc ? ' Hochtouren und Kletterrouten findest du unten.' : ''}</p>` + restHtml(r.rest);
    box.querySelectorAll('.onmap[data-rel]').forEach(b => { b.onclick = () => showRouteOnMap(b.dataset.rel, b); });
    return;
  }
  box.innerHTML = `<p class="note">Tippe einen Aufstieg an, um nur ihn auf der Karte und sein Höhenprofil zu sehen.</p><ul class="asc">` + r.list.map((x, k) => {
    const diff = gradeLabel(x.cat, x.grade, x.vf);
    const sub = [x.type === 'rel' ? 'markierte Route' : '', x.easiest || x.type === 'normal' ? 'leichtester gefundener Weg' : '', x.via.length ? 'über ' + x.via.join(', ') : ''].filter(Boolean).join(' · ');
    return `<li><button type="button" class="ascpick" data-key="a:${k}" aria-pressed="false"><span class="ascrow"><span class="kb k${x.cat}">${KINDS[x.cat]}</span><b>${esc(ascTitle(x))}</b></span>` +
      (sub ? `<small>${esc(sub)}</small>` : '') + `<small>ab ${esc(startName(x.res.park, x.start))}${diff ? ' · ' + diff : ''}</small>` + factsHtml(x) + `</button></li>`;
  }).join('') + `</ul>` + restHtml(r.rest) +
    `<p class="note">Berechnet aus den Wegen in OpenStreetMap vom nächstgelegenen Parkplatz bis zum Gipfel. Gehzeit nur für den Aufstieg, ohne Pausen, nach DIN 33466; Höhenmeter aus einem Geländemodell, auf etwa 10 % genau. ` +
    `Ein Vorschlag, keine geprüfte Tour: Wege können gesperrt, verfallen oder schwieriger sein als angegeben. Prüfe die Tour vor dem Aufbruch auf einer Wanderkarte.</p>`;
  box.querySelectorAll('.ascpick').forEach(b => { b.onclick = () => pickItem(b.dataset.key); });
  box.querySelectorAll('.onmap[data-rel]').forEach(b => { b.onclick = () => showRouteOnMap(b.dataset.rel, b); });
}
function restHtml(rest) {                         // marked routes at the summit that could not be followed from a car park
  if (!rest || !rest.length) return '';
  return `<h3 class="h3">Weitere markierte Routen am Gipfel</h3><ul class="rts">${rest.map(([rel, name, cat, grade, vf]) => `<li><a href="https://hiking.waymarkedtrails.org/#route?id=${rel}" target="_blank" rel="noopener">${esc(name || 'Markierte Route ohne Namen')}</a>` +
    `<button type="button" class="onmap" data-rel="${rel}">Auf Karte</button><small>${KINDS[cat]}${gradeLabel(cat, grade, vf) ? ' · ' + gradeLabel(cat, grade, vf) : ''} · Verlauf vom Parkplatz nicht durchgehend erfasst</small></li>`).join('')}</ul>`;
}
const itemOf = key => { const [t, k] = key.split(':'); return (t === 'a' ? ascList : trackList)[+k]; };
function pickItem(key) {
  selKey = selKey === key ? '' : key;
  document.querySelectorAll('#detail .ascpick').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === selKey)));
  const old = $('ascact'); if (old) old.remove();
  const x = selKey && itemOf(selKey);
  if (!x) { showAllTrails(); return; }
  const li = document.querySelector(`#detail .ascpick[data-key="${selKey}"]`).closest('li');
  const act = document.createElement('div'); act.id = 'ascact'; act.className = 'ascact';
  const s = x.trk[0], user = x.type === 'user', mine = user && sbUser && sbUser.id === x.user_id;
  act.innerHTML = profileHtml(x) + `<div class="ascbtns">` +
    `<button type="button" class="onmap" id="ascgpx">GPX herunterladen</button>` +
    `<a class="onmap" href="https://www.google.com/maps/dir/?api=1&destination=${s[0].toFixed(5)},${s[1].toFixed(5)}" target="_blank" rel="noopener">Anfahrt zum Startpunkt</a>` +
    (x.type === 'rel' ? `<a class="onmap" href="https://hiking.waymarkedtrails.org/#route?id=${x.rel}" target="_blank" rel="noopener">Route bei Waymarked Trails</a>` : '') +
    (user ? `<button type="button" class="onmap" id="ascrep">Melden</button>` : '') +
    (user && (mine || isAdminNow) ? `<button type="button" class="onmap" id="ascdel">Löschen</button>` : '') +
    `<button type="button" class="onmap" id="ascall">Alle Wege zeigen</button></div><div id="ascmsg"></div>`;
  li.appendChild(act);
  wireProfile(act, x);
  $('ascgpx').onclick = () => downloadGpx(x);
  $('ascall').onclick = () => pickItem(selKey);
  if ($('ascrep')) $('ascrep').onclick = () => reportForm(x);
  if ($('ascdel')) $('ascdel').onclick = () => deleteTrack(x);
  drawAscent(x);
}
function renderAscError(i, d) {
  const box = $('asclist'); if (!box) return;
  box.innerHTML = `<p class="note">Die Wege konnten gerade nicht geladen werden. <button type="button" class="linkbtn" id="ascretry">Noch einmal versuchen</button></p>` +
    ((d.rt || []).length ? `<ul class="rts">${d.rt.map(([rel, name]) => `<li><a href="https://hiking.waymarkedtrails.org/#route?id=${rel}" target="_blank" rel="noopener">${esc(name || 'Markierte Route ohne Namen')}</a><button type="button" class="onmap" data-rel="${rel}">Auf Karte</button></li>`).join('')}</ul>` : '');
  $('ascretry').onclick = () => { box.innerHTML = '<p class="note">Wege zum Gipfel werden berechnet …</p>'; loadAscents(i, d); };
  box.querySelectorAll('.onmap[data-rel]').forEach(b => { b.onclick = () => showRouteOnMap(b.dataset.rel, b); });
}
const ASC_COLOR = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches) ? '#5ea8ff' : '#1d5fd6';
function showAllTrails() { if (hiLayer) hiLayer.clearLayers(); hoverDot = null; if (map && trailLayer && !map.hasLayer(trailLayer)) trailLayer.addTo(map); }
let hoverDot = null;
function drawAscent(x) {
  if (!map) return;
  if (MOBILE()) setSheet('half'); else setView('map');   // on phones the profile stays visible under the map
  hiLayer.clearLayers(); hiFor = selected; hoverDot = null;
  if (map.hasLayer(trailLayer)) map.removeLayer(trailLayer);      // only the chosen ascent
  const col = ASC_COLOR();
  L.polyline(x.ll, { color: cssColors['--surface'], weight: 10, opacity: .95, interactive: false }).addTo(hiLayer);
  const line = L.polyline(x.ll, { color: col, weight: 5, interactive: false }).addTo(hiLayer);
  if (x.fer && x.fer.length) L.polyline(x.fer, { color: cssColors['--tk'] || '#e07b00', weight: 5, dashArray: '2 7', lineCap: 'round', interactive: false }).addTo(hiLayer);
  L.circleMarker(x.ll[0], { radius: 8, color: cssColors['--surface'], weight: 3, fillColor: col, fillOpacity: 1, interactive: false })
    .bindTooltip(x.res ? 'Start: ' + startName(x.res.park, x.start) : 'Start').addTo(hiLayer);
  setTimeout(() => {
    map.invalidateSize();
    const leg = $('legendbox') ? $('legendbox').offsetHeight + 16 : 0;
    const cover = MOBILE() ? Math.min(sheetPx($('app').dataset.sheet || 'half'), $('mapwrap').clientHeight - 120) : leg;
    map.fitBounds(line.getBounds(), { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30 + cover], maxZoom: 15 });
  }, 60);
}
/* ---------- height profile, shared by computed ascents and uploaded tracks ---------- */
function profPoints(trk) {                         // -> [[km, height, index in trk]], at most 240 points
  const out = []; let km = 0;
  trk.forEach((p, k) => { if (k) km += metres(trk[k - 1], p) / 1000; if (p[2] != null) out.push([km, p[2], k]); });
  if (out.length <= 240) return out;
  const step = out.length / 240, res = [];
  for (let k = 0; k < 240; k++) res.push(out[Math.floor(k * step)]);
  res.push(out[out.length - 1]); return res;
}
function profileHtml(x) {
  const pp = profPoints(x.trk); if (pp.length < 2) return '';
  const W = 600, H = 150, L0 = 46, R0 = 8, T0 = 10, B0 = 22;
  const km = pp[pp.length - 1][0], lo = Math.min(...pp.map(p => p[1])), hi = Math.max(...pp.map(p => p[1]));
  const step = [50, 100, 200, 250, 500, 1000].find(s => (hi - lo) / s <= 4) || 1000, y0 = Math.floor(lo / step) * step, y1 = Math.max(y0 + step, Math.ceil(hi / step) * step);
  const X = v => L0 + v / km * (W - L0 - R0), Y = v => T0 + (1 - (v - y0) / (y1 - y0)) * (H - T0 - B0);
  const line = pp.map((p, k) => (k ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('');
  const kstep = [0.5, 1, 2, 5, 10].find(s => km / s <= 6) || 10, xt = [];
  for (let v = 0; v <= km + 1e-9; v += kstep) xt.push(v);
  let grid = '';
  for (let v = y0; v <= y1; v += step) grid += `<line x1="${L0}" x2="${W - R0}" y1="${Y(v)}" y2="${Y(v)}" class="pg"/><text x="${L0 - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt.format(v)}</text>`;
  xt.forEach(v => { grid += `<text x="${X(v)}" y="${H - 5}" text-anchor="middle">${n1(v)}${v === 0 ? '' : ''}</text>`; });
  return `<figure class="prof"><figcaption>Höhenprofil · ${n1(km)} km · ${fmt.format(Math.round(lo))}–${fmt.format(Math.round(hi))} m</figcaption>` +
    `<div class="profbox"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Höhenprofil: von ${fmt.format(Math.round(pp[0][1]))} m auf ${fmt.format(Math.round(pp[pp.length - 1][1]))} m über ${n1(km)} km, höchster Punkt ${fmt.format(Math.round(hi))} m">` +
    grid + `<path d="${line}L${X(km)} ${Y(y0)}L${X(0)} ${Y(y0)}Z" class="pa"/><path d="${line}" class="pl"/>` +
    `<line class="px" x1="0" x2="0" y1="${T0}" y2="${H - B0}" visibility="hidden"/><circle class="pd" r="4" visibility="hidden"/></svg><div class="ptip" hidden></div></div>` +
    `<div class="paxis"><span>km</span></div></figure>`;
}
function wireProfile(box, x) {
  const svg = box.querySelector('.prof svg'); if (!svg) return;
  const pp = profPoints(x.trk), W = 600, H = 150, L0 = 46, R0 = 8, T0 = 10, B0 = 22, km = pp[pp.length - 1][0];
  const lo = Math.min(...pp.map(p => p[1])), hi = Math.max(...pp.map(p => p[1]));
  const step = [50, 100, 200, 250, 500, 1000].find(s => (hi - lo) / s <= 4) || 1000, y0 = Math.floor(lo / step) * step, y1 = Math.max(y0 + step, Math.ceil(hi / step) * step);
  const X = v => L0 + v / km * (W - L0 - R0), Y = v => T0 + (1 - (v - y0) / (y1 - y0)) * (H - T0 - B0);
  const cross = svg.querySelector('.px'), dot = svg.querySelector('.pd'), tip = box.querySelector('.ptip');
  const move = ev => {
    const r = svg.getBoundingClientRect(), vx = (ev.clientX - r.left) / r.width * W, v = Math.max(0, Math.min(km, (vx - L0) / (W - L0 - R0) * km));
    let p = pp[0]; for (const q of pp) if (Math.abs(q[0] - v) < Math.abs(p[0] - v)) p = q;
    cross.setAttribute('x1', X(p[0])); cross.setAttribute('x2', X(p[0])); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', X(p[0])); dot.setAttribute('cy', Y(p[1])); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = `${n1(p[0])} km · ${fmt.format(Math.round(p[1]))} m`;
    tip.style.left = Math.min(r.width - tip.offsetWidth, Math.max(0, X(p[0]) / W * r.width - tip.offsetWidth / 2)) + 'px';
    const t = x.trk[p[2]];
    if (map && t) { if (!hoverDot) hoverDot = L.circleMarker(t, { radius: 6, color: cssColors['--surface'], weight: 2, fillColor: cssColors['--accent'], fillOpacity: 1, interactive: false }).addTo(hiLayer); else hoverDot.setLatLng(t); }
  };
  const leave = () => { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; if (hoverDot) { hiLayer.removeLayer(hoverDot); hoverDot = null; } };
  svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', leave);
}
/* ---------- GPX download ---------- */
const xmlEsc = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
function downloadGpx(x) {
  const name = (x.type === 'user' ? x.name : ascTitle(x)) + ' – ' + D.peaks.n[selected];
  const pts = x.trk.map(p => `<trkpt lat="${p[0].toFixed(6)}" lon="${p[1].toFixed(6)}">${p[2] != null ? `<ele>${Math.round(p[2])}</ele>` : ''}</trkpt>`).join('\n');
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Alpengipfel (alpen-gipfel.de)" xmlns="http://www.topografix.com/GPX/1/1">\n` +
    `<metadata><name>${xmlEsc(name)}</name><copyright author="${x.type === 'user' ? xmlEsc(x.autor || 'Alpengipfel-Nutzer') : 'OpenStreetMap-Mitwirkende'}"><license>${x.type === 'user' ? 'https://alpen-gipfel.de/nutzungsbedingungen.html' : 'https://opendatacommons.org/licenses/odbl/'}</license></copyright></metadata>\n` +
    `<trk><name>${xmlEsc(name)}</name><desc>${xmlEsc(x.type === 'user' ? 'Track von ' + (x.autor || 'einem Nutzer') + ' auf alpen-gipfel.de' : 'Berechneter Aufstieg aus OpenStreetMap-Daten, ungeprüft')}</desc><trkseg>\n${pts}\n</trkseg></trk>\n</gpx>\n`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' }));
  a.download = (norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'track') + '.gpx';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
/* ---------- GPX tracks of users (Supabase table tracks) ---------- */
let isAdminNow = false, adminFor = '';
async function checkAdmin() {
  const uid = sbUser ? sbUser.id : '';
  if (adminFor === uid) return isAdminNow;
  adminFor = uid; isAdminNow = false;
  if (sb && uid) { try { const r = await sb.rpc('ist_admin'); isAdminNow = r.data === true; } catch (err) { /* no admin */ } }
  return isAdminNow;
}
async function loadTracks(i) {
  const box = $('tracklist'); if (!box) return;
  if (!sb) { $('trackbox').hidden = true; return; }
  const id = D.peaks.id[i];
  const [{ data, error }] = await Promise.all([sb.from('tracks').select('id,user_id,autor,name,art,kommentar,km,hm_auf,hm_ab,punkte,created_at').eq('gipfel', id).order('created_at', { ascending: false }).limit(50), checkAdmin()]);
  if (selected !== i || !$('tracklist')) return;
  if (error) { box.innerHTML = `<p class="note">${/relation .* does not exist|tracks/.test(error.message || '') && error.code === '42P01' ? 'Tracks sind noch nicht eingerichtet.' : 'Die Tracks konnten gerade nicht geladen werden.'}</p>`; renderUpload(i); return; }
  trackList = data.map(t => {
    const trk = t.punkte.map(p => [p[0], p[1], p[2] == null ? null : p[2]]);
    return { type: 'user', id: t.id, user_id: t.user_id, autor: t.autor, name: t.name, cat: t.art, kommentar: t.kommentar, km: t.km, up: t.hm_auf, down: t.hm_ab,
      h: dinHours(t.km, t.hm_auf, t.hm_ab), when: new Date(t.created_at), trk, ll: trk.map(p => [p[0], p[1]]), fer: [] };
  });
  if (selKey.startsWith('t:')) selKey = '';
  box.innerHTML = trackList.length ? `<ul class="asc">${trackList.map((x, k) => `<li><button type="button" class="ascpick" data-key="t:${k}" aria-pressed="false">` +
    `<span class="ascrow"><span class="kb k${x.cat}">${KINDS[x.cat]}</span><b>${esc(x.name)}</b></span><small>von ${esc(x.autor || 'einem Nutzer')} · ${x.when.toLocaleDateString('de-DE')}</small>` +
    (x.kommentar ? `<small class="tcom">${esc(x.kommentar)}</small>` : '') + factsHtml(x) + `</button></li>`).join('')}</ul>`
    : `<p class="note">Noch kein Track für diesen Gipfel. Warst du schon oben? Lade deinen Track hoch, damit andere ihn nutzen können.</p>`;
  box.querySelectorAll('.ascpick').forEach(b => { b.onclick = () => pickItem(b.dataset.key); });
  renderUpload(i);
}
function renderUpload(i) {
  const up = $('trackup'); if (!up) return;
  if (!sbUser) { up.innerHTML = `<p class="note"><button type="button" class="linkbtn" id="tlogin">Melde dich an</button>, um eigene GPX-Tracks hochzuladen.</p>`; $('tlogin').onclick = () => showProfile(); return; }
  up.innerHTML = `<label class="upbtn"><input type="file" id="gpxfile" accept=".gpx,application/gpx+xml" hidden>GPX-Datei hochladen</label><div id="upform"></div>`;
  $('gpxfile').onchange = ev => { const f = ev.target.files[0]; ev.target.value = ''; if (f) prepareUpload(i, f); };
}
function simplify(pts, tol) {                      // Douglas-Peucker in metres
  const k0 = Math.cos(pts[0][0] * Math.PI / 180), P = pts.map(p => [p[1] * 111320 * k0, p[0] * 110540]);
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let md = 0, mi = -1;
    const [ax, ay] = P[a], [bx, by] = P[b], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    for (let k = a + 1; k < b; k++) {
      const t = l2 ? Math.max(0, Math.min(1, ((P[k][0] - ax) * dx + (P[k][1] - ay) * dy) / l2)) : 0;
      const d = Math.hypot(P[k][0] - ax - t * dx, P[k][1] - ay - t * dy); if (d > md) { md = d; mi = k; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, k) => keep[k]);
}
function gain(z, hyst) { let up = 0, down = 0, ref = z[0]; for (const h of z) { if (h - ref > hyst) { up += h - ref; ref = h; } else if (ref - h > hyst) { down += ref - h; ref = h; } } return [Math.round(up), Math.round(down)]; }
async function prepareUpload(i, file) {
  const form = $('upform'), top = [D.peaks.la[i], D.peaks.lo[i]];
  const fail = msg => { form.innerHTML = `<p class="note warn">${msg}</p>`; };
  if (file.size > 20e6) return fail('Die Datei ist zu groß (höchstens 20 MB).');
  let doc;
  try { doc = new DOMParser().parseFromString(await file.text(), 'application/xml'); } catch (err) { return fail('Die Datei konnte nicht gelesen werden.'); }
  if (doc.getElementsByTagName('parsererror').length) return fail('Das ist keine gültige GPX-Datei.');
  let nodes = [...doc.getElementsByTagName('trkpt')]; if (nodes.length < 2) nodes = [...doc.getElementsByTagName('rtept')];
  let pts = nodes.map(n => { const e = n.getElementsByTagName('ele')[0]; const z = e ? parseFloat(e.textContent) : NaN; return [+n.getAttribute('lat'), +n.getAttribute('lon'), Number.isFinite(z) ? z : null]; })
    .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180);
  if (pts.length < 10) return fail('In der Datei ist kein Track mit genügend Punkten.');
  let nearest = Infinity; pts.forEach(p => { nearest = Math.min(nearest, metres(p, top)); });
  if (nearest > 150) return fail(`Der Track führt nicht auf diesen Gipfel: Sein nächster Punkt ist ${nearest < 10000 ? fmt.format(Math.round(nearest / 10) * 10) + ' m' : n1(nearest / 1000) + ' km'} entfernt.`);
  // privacy: drop the first and last 200 m where the track starts or ends away from the summit
  const trim = arr => { if (metres(arr[0], top) < 500) return arr; let d = 0, k = 1; while (k < arr.length - 2 && d < 200) { d += metres(arr[k - 1], arr[k]); k++; } return arr.slice(k - 1); };
  pts = trim(pts); pts = trim(pts.reverse()).reverse();
  let km = 0;
  const hasEle = pts.filter(p => p[2] != null).length >= pts.length * 0.8;
  let tol = 4, simple = simplify(pts, tol); while (simple.length > 2500) { tol *= 1.5; simple = simplify(pts, tol); }
  let up, down;
  if (hasEle) { let last = null; pts.forEach(p => { if (p[2] == null) p[2] = last; else last = p[2]; }); [up, down] = gain(pts.map(p => p[2] ?? pts.find(q => q[2] != null)[2]), 5); simple = simple.map(p => [p[0], p[1], p[2] ?? null]); }
  else {
    try { const z = await heights(simple.map(p => [p[0], p[1]])); simple = simple.map((p, k) => [p[0], p[1], z[k]]); [up, down] = gain(z, 8); }
    catch (err) { simple = simple.map(p => [p[0], p[1], null]); up = 0; down = 0; }
  }
  const punkte = simple.map(p => [+p[0].toFixed(6), +p[1].toFixed(6), p[2] == null ? null : Math.round(p[2])]);
  km = punkte.reduce((s, p, k) => k ? s + metres(punkte[k - 1], p) : 0, 0) / 1000;   // the distance of what is shown and stored
  const x = { type: 'user', name: '', cat: 0, km, up, down, h: dinHours(km, up, down), trk: punkte, ll: punkte.map(p => [p[0], p[1]]), fer: [] };
  const nameEl = doc.querySelector('trk > name') || doc.querySelector('rte > name') || doc.querySelector('metadata > name');
  const guess = nameEl ? nameEl.textContent.trim().slice(0, 80) : '';
  drawAscent(x);
  form.innerHTML = `<form class="upf" id="upf"><p class="note">Vorschau auf der Karte: ${n1(km)} km · ↑ ${fmt.format(up)} Hm · ↓ ${fmt.format(down)} Hm. ` +
    `Zeitstempel und Geräteangaben werden nicht übertragen${pts.length ? '' : ''}.</p>` + profileHtml(x) +
    `<label>Name der Route<input id="upname" required minlength="3" maxlength="80" value="${esc(guess)}" placeholder="z. B. Über die Höllentalangerhütte"></label>` +
    `<label>Art<select id="upart">${KINDS.map((k, c) => `<option value="${c}">${k}</option>`).join('')}</select></label>` +
    `<label>Kommentar (freiwillig)<textarea id="upcom" maxlength="500" rows="3" placeholder="z. B. Zustand, Schlüsselstelle, Einkehr"></textarea></label>` +
    `<label class="chk"><input type="checkbox" id="upok" required><span>Ich habe den Track selbst aufgezeichnet oder darf ihn veröffentlichen. Er wird mit meinem Benutzernamen öffentlich gezeigt` +
    (window.AG_LEGAL ? ` (<a href="${ROOT}nutzungsbedingungen.html" target="_blank">Nutzungsbedingungen</a>, <a href="${ROOT}datenschutz.html" target="_blank">Datenschutz</a>)` : '') + `.</span></label>` +
    `<div class="ascbtns"><button type="submit" class="primary">Veröffentlichen</button><button type="button" class="onmap" id="upcancel">Abbrechen</button></div><p class="note" id="upmsg" role="status"></p></form>`;
  wireProfile(form, x);
  $('upcancel').onclick = () => { form.innerHTML = ''; showAllTrails(); };
  $('upf').onsubmit = async ev => {
    ev.preventDefault();
    const name = $('upname').value.trim(); if (name.length < 3) { $('upmsg').textContent = 'Bitte gib einen Namen mit mindestens 3 Zeichen ein.'; return; }
    $('upmsg').textContent = 'Wird hochgeladen …';
    const { error } = await sb.from('tracks').insert({ gipfel: D.peaks.id[i], name, art: +$('upart').value, kommentar: $('upcom').value.trim(), km: Math.round(km * 100) / 100, hm_auf: up, hm_ab: down, punkte });
    if (error) { $('upmsg').textContent = /Zu viele/.test(error.message) ? 'Du hast heute schon 20 Tracks hochgeladen. Versuch es morgen wieder.' : 'Das Hochladen hat nicht geklappt. Bitte versuch es noch einmal.'; return; }
    form.innerHTML = '<p class="note">Danke! Dein Track ist jetzt sichtbar.</p>'; showAllTrails(); loadTracks(i);
  };
}
function reportForm(x) {
  const m = $('ascmsg');
  m.innerHTML = `<form class="upf" id="repf"><label>Was stimmt nicht mit diesem Track?<textarea id="repg" minlength="3" maxlength="500" rows="2" required placeholder="z. B. führt über einen gesperrten Weg"></textarea></label>` +
    `<div class="ascbtns"><button type="submit" class="onmap">Meldung senden</button></div></form>`;
  $('repf').onsubmit = async ev => {
    ev.preventDefault();
    const g = $('repg').value.trim(); if (g.length < 3) return;
    const { error } = await sb.rpc('track_melden', { track: x.id, text_grund: g });
    m.innerHTML = `<p class="note">${error ? 'Die Meldung konnte nicht gesendet werden. Schreib uns gern per E-Mail.' : 'Danke, wir sehen uns den Track an.'}</p>`;
  };
}
async function deleteTrack(x) {
  if (!confirm(`Track „${x.name}“ wirklich löschen?`)) return;
  const { error } = await sb.rpc('track_entfernen', { track: x.id });
  if (error) { $('ascmsg').innerHTML = '<p class="note">Der Track konnte nicht gelöscht werden.</p>'; return; }
  selKey = ''; showAllTrails(); loadTracks(selected);
}
function ferGroups(net) {                         // connected via_ferrata sections: { ways, verts, len }
  const parent = net.ways.map((_, k) => k), find = k => parent[k] === k ? k : (parent[k] = find(parent[k])), grp = new Map();
  net.adj.forEach(a => { let first = -1; for (let j = 1; j < a.length; j += 3) if (net.ways[a[j]].fer) { if (first < 0) first = a[j]; else parent[find(a[j])] = find(first); } });
  const byName = new Map();                       // secured stretches of one named path form one via ferrata (e.g. Georg Jäger-Steig, many short pieces)
  net.ways.forEach((w, k) => { if (!w.fer || !w.name) return; if (byName.has(w.name)) parent[find(k)] = find(byName.get(w.name)); else byName.set(w.name, k); });
  net.adj.forEach((a, v) => { for (let j = 1; j < a.length; j += 3) { const wi = a[j]; if (!net.ways[wi].fer) continue; const g = find(wi); const e = grp.get(g) || { ways: new Set(), verts: new Set(), len: 0 }; e.ways.add(wi); e.verts.add(v); grp.set(g, e); } });
  for (const g of grp.values()) g.len = [...g.ways].reduce((s, wi) => s + net.ways[wi].len, 0);
  return [...grp.values()];
}
function hutsAlong(ll, top) {                     // named huts on the way (within 80 m), in walking order, not the one at the summit
  if (!GEO || !GEO.huts) return [];
  let s = 90, n = -90, w = 180, e = -180; ll.forEach(p => { s = Math.min(s, p[0]); n = Math.max(n, p[0]); w = Math.min(w, p[1]); e = Math.max(e, p[1]); });
  const found = [];
  for (const h of GEO.huts) {
    const p = [h[1], h[0]]; if (!h[2] || p[0] < s - .001 || p[0] > n + .001 || p[1] < w - .0015 || p[1] > e + .0015 || metres(p, top) < 300) continue;
    let bd = 80, at = -1; ll.forEach((q, k) => { const dd = metres(p, q); if (dd < bd) { bd = dd; at = k; } });
    if (at >= 0) found.push([at, h[2]]);
  }
  return found.sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
const parkRows = (rows, kind = 0) => rows.filter(r => ['', 'yes', 'public', 'permissive', 'customers'].includes(r[2] || '')).map(r => {
  const ll = wktLine(r[3]); return { name: r[1] || '', p: ll.reduce((s, p) => [s[0] + p[0] / ll.length, s[1] + p[1] / ll.length], [0, 0]), kind };
});
async function computeAscents(i, d) {
  const P = D.peaks, id = P.id[i], top = [P.la[i], P.lo[i]];
  const near = d.pk && d.pk[0] ? d.pk[0][1] : 5;
  const dist = Math.round(Math.min(d.ar ? 6.5 : 11, Math.max(6, near + 2.5)) * 1000);
  const rels = (d.rt || []).map(r => r[0]);
  let rows = await qlever(netQuery(id, dist, d.ar));                     // one after the other: QLever refuses bursts
  let prow = await qlever(parkQuery(id, dist, d.ar)).catch(() => []);
  const mrows = rels.length ? await qlever(memberQuery(rels)).catch(() => []) : [];
  const members = new Map(), relRows = [];
  for (const [r, w, g] of mrows) {
    if (!/\/way\//.test(w)) continue;
    const k = wayId(r); if (!members.has(k)) members.set(k, new Set()); members.get(k).add(wayId(w));
    relRows.push([w, 'path', '', '', '', '', g]);    // the whole route, also where it leaves the loaded area
  }
  let net = buildNet(rows.concat(relRows));
  if (!net.pts.length) return { list: [], why: 'noway' };
  // where do the marked routes and via ferratas begin? Far from the summit, load paths and car parks there too
  const relStart = rel => { let best = null, bd = 0; net.ways.forEach((w, wi) => { if (!members.get(rel).has(w.id)) return; });
    for (let v = 0; v < net.pts.length; v++) { const a = net.adj[v]; for (let j = 1; j < a.length; j += 3) if (members.get(rel).has(net.ways[a[j]].id)) { const dd = metres(net.pts[v], top); if (dd > bd) { bd = dd; best = v; } break; } }
    return best; };
  const ends = [];
  for (const rel of rels) if (members.has(+rel)) { const v = relStart(+rel); if (v != null && metres(net.pts[v], top) > 2500) ends.push(net.pts[v]); }
  for (const g of ferGroups(net)) if (g.len >= 150) { let bv = null, bd = 0; g.verts.forEach(v => { const dd = metres(net.pts[v], top); if (dd > bd) { bd = dd; bv = v; } }); if (bd > 2500) ends.push(net.pts[bv]); }
  if (ends.length) {
    const pts = ends.slice(0, 8);
    rows = rows.concat(await qlever(nearPts(pts, 3500, ...NET_SEL, netInner(id, d.ar))).catch(() => []));
    prow = prow.concat(await qlever(nearPts(pts, 3500, ...PARK_SEL, parkInner(id, d.ar))).catch(() => []));
    net = buildNet(rows.concat(relRows));
  }
  const [sv, sd] = nearestVert(net, top);
  if (sd > 250) return { list: [], why: 'noway' };
  // starting points: public car parks (centre of the area), else the stored ones, else stops
  let starts = parkRows(prow);
  if (!starts.length) starts = (d.pk || []).map(s => ({ name: s[0], p: [s[2], s[3]], kind: 0 }));
  if (!starts.length) starts = (d.st || []).map(s => ({ name: s[0], p: [s[2], s[3]], kind: s[4] }));
  const parks = [], usedV = new Set();
  for (const s of starts) { const [v, sn] = nearestVert(net, s.p); if (v >= 0 && sn < 250 && !usedV.has(v)) { usedV.add(v); parks.push({ ...s, v, sn }); } }
  if (!parks.length) return { list: [], why: 'nopark' };
  const linked = dijkstra(net, sv, () => 1); if (!parks.some(p => linked.dist[p.v] < Infinity)) return { list: [], why: 'island' };
  const groups = ferGroups(net), shortFer = new Set();     // a few metres of cable on an ordinary path do not make it a via ferrata
  groups.forEach(g => { if (g.len < 150) g.ways.forEach(wi => shortFer.add(wi)); });
  const base = (w, k) => w.fer ? (shortFer.has(k) ? 2 : Infinity) : (ROADF[w.h] || 1) * (w.grade >= 6 ? 8 : w.grade === 5 ? 4 : w.grade === 4 ? 1.6 : 1);
  const trace = (r, v) => { const verts = [], wl = []; while (v !== -1) { verts.push(v); if (r.via[v] >= 0) wl.push(r.via[v]); v = r.prev[v]; } return { verts, wl }; };
  const bestPark = r => { let best = null; for (const p of parks) { const c = r.dist[p.v] + p.sn * 3; if (c < Infinity && (!best || c < best.c)) best = { p, c }; } return best; };
  const fromBest = factor => {                    // the car park with the cheapest way to the summit
    const r = dijkstra(net, sv, factor), b = bestPark(r); if (!b) return null;
    const t = trace(r, b.p.v); return { park: b.p, cost: b.c, ...t };
  };
  const viaStart = (start, factor, own) => {      // from the car park closest (on foot) to where the route begins, then the route up
    const up = dijkstra(net, sv, factor); if (start == null || up.dist[start] === Infinity) return null;
    const down = dijkstra(net, start, (w, k) => w.fer && !(own && own.has(k)) ? (shortFer.has(k) ? 2 : 4) : base(w, k)), b = bestPark(down); if (!b) return null;
    const a = trace(down, b.p.v), c = trace(up, start);
    return { park: b.p, cost: b.c + up.dist[start], verts: a.verts.concat(c.verts.slice(1)), wl: a.wl.concat(c.wl) };
  };
  const usedOf = (res, test) => { let u = 0; res.wl.forEach((wi, k) => { if (test(wi)) u += metres(net.pts[res.verts[k]], net.pts[res.verts[k + 1]]); }); return u; };
  const out = [], normal = fromBest(base);
  if (normal) out.push({ type: 'normal', res: normal });
  for (const rel of rels) {
    const set = members.get(+rel); if (!set) continue;
    const f = (w, k) => set.has(w.id) ? (w.fer ? 1 : base(w, k)) * 0.3 : base(w, k);
    const s = relStart(+rel), res = s != null && metres(net.pts[s], top) > 300 ? viaStart(s, f) : fromBest(f);
    if (!res) continue;
    let relLen = 0; net.ways.forEach(w => { if (set.has(w.id)) relLen += w.len; });
    if (relLen && usedOf(res, wi => set.has(net.ways[wi].id)) / relLen > 0.3) out.push({ type: 'rel', rel: +rel, res, name: ((d.rt.find(x => x[0] === rel) || [])[1]) || '' });
  }
  // via ferratas near the summit: start below the ferrata, climb it, on to the summit
  const free = dijkstra(net, sv, (w, k) => w.fer ? 1 : base(w, k));
  const cand = groups.filter(g => g.len >= 150).map(g => ({ ...g, near: Math.min(...[...g.verts].map(v => free.dist[v])) }))
    .filter(g => g.near < 6000).sort((a, b) => a.near - b.near).slice(0, 4);
  const pathEdge = v => { const a = net.adj[v]; for (let j = 1; j < a.length; j += 3) if (!net.ways[a[j]].fer) return true; return false; };
  for (const g of cand) {
    const f = (w, k) => w.fer ? (g.ways.has(k) ? 0.25 : shortFer.has(k) ? 2 : 3) : base(w, k);
    const up = dijkstra(net, sv, f), vs = [...g.verts].filter(v => up.dist[v] < Infinity);
    if (!vs.length) continue;
    const topD = Math.min(...vs.map(v => up.dist[v]));
    // the places where paths join the ferrata, lowest first: each can be its own way in (e.g. from two sides of a ridge)
    const exits = vs.filter(v => pathEdge(v) && up.dist[v] - topD > 100).sort((a, b) => up.dist[b] - up.dist[a]);
    const names = {}; g.ways.forEach(wi => { const nm = net.ways[wi].name; if (nm) names[nm] = (names[nm] || 0) + net.ways[wi].len; });
    const name = Object.keys(names).sort((a, b) => names[b] - names[a])[0] || '';   // unnamed: titled after the huts on the way, like the normal way
    const tried = [];
    for (const s of exits) {
      if (tried.length === 2 || tried.some(t => metres(net.pts[t], net.pts[s]) < 300)) continue;
      tried.push(s);
      const res = viaStart(s, f, g.ways); if (!res) continue;
      if (usedOf(res, wi => g.ways.has(wi)) < Math.min(150, g.len * 0.3) || (normal && res.cost > normal.cost * 3)) continue;
      out.push({ type: 'fer', res, name });
    }
  }
  // drop near-identical results; a marked route that is the easiest way replaces the plain one
  const same = (a, b) => { const A = new Set(a.verts); let n = 0; b.verts.forEach(v => { if (A.has(v)) n++; }); return n / Math.min(a.verts.length, b.verts.length) > 0.7; };
  const hasFer = r => r.wl.some(wi => net.ways[wi].fer && !shortFer.has(wi));
  const list = [];
  for (const x of out) {
    const k = list.findIndex(y => hasFer(x.res) === hasFer(y.res) && same(x.res, y.res));   // a via ferrata is never the same as a path
    if (k < 0) list.push(x);
    else if (list[k].type === 'normal' && x.type === 'rel') list[k] = { ...x, easiest: true };
  }
  // describe each: line, length, difficulty, the longest named paths, height gain and time
  for (const x of list) {
    const r = x.res, ll = [x.res.park.p, ...r.verts.map(v => net.pts[v])];
    if (sd > 5) ll.push(top);
    x.ll = ll; x.km = ll.reduce((s, p, k) => k ? s + metres(ll[k - 1], p) : 0, 0) / 1000;
    let grade = 0, vf = '', fer = false; const names = {};
    x.fer = r.wl.map((wi, k) => net.ways[wi].fer && !shortFer.has(wi) ? [net.pts[r.verts[k]], net.pts[r.verts[k + 1]]] : null).filter(Boolean);
    r.wl.forEach(wi => { const w = net.ways[wi]; if (!ROADF[w.h]) grade = Math.max(grade, w.grade); if (w.fer && !shortFer.has(wi)) { fer = true; if (w.vf > vf) vf = w.vf; } if (w.name && !/^(tertiary|secondary|primary)$/.test(w.h)) names[w.name] = (names[w.name] || 0) + w.len; });
    x.grade = grade; x.vf = vf; x.cat = fer ? 2 : grade >= 4 ? 1 : 0;
    const ways = Object.keys(names).sort((a, b) => names[b] - names[a]).filter(n => n !== x.name), huts = hutsAlong(ll, top);
    if (!x.name) x.name = huts.length ? 'Über ' + huts.slice(0, 2).join(' und ') : ways.length ? 'Über ' + ways.shift() : 'Normalweg';
    x.via = (x.name.startsWith('Über ') ? (huts.length > 2 ? huts.slice(2) : ways) : huts.length ? huts : ways).filter(n => !x.name.includes(n)).slice(0, 2);
    try { Object.assign(x, await climb(ll)); } catch (err) { x.up = null; x.trk = ll.map(p => [p[0], p[1], null]); }
    x.h = dinHours(x.km, x.up || 0, x.down || 0);
  }
  // a T6 ridge is no 'easiest way' when there are other ascents (e.g. Jubiläumsgrat at the Zugspitze)
  const k6 = list.findIndex(x => x.type === 'normal' && x.grade >= 6);
  if (k6 >= 0 && list.length > 1) list.splice(k6, 1);
  const shown = new Set(list.filter(x => x.type === 'rel').map(x => x.rel));
  return { list, why: list.length ? '' : 'nopark', rest: (d.rt || []).filter(r => !shown.has(r[0])) };
}
/* ---------- details of a summit are loaded in small files when it is opened ---------- */
const chunkCache = new Map();
let inlineDetails = null, startPts = [];
async function detailOf(i) {
  const size = D.meta.chunk, c = Math.floor(i / size);
  let p = chunkCache.get(c);
  if (!p) {
    p = inlineDetails ? Promise.resolve(inlineDetails[c]) : fetch(ROOT + 'data/d/' + c + '.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    chunkCache.set(c, p); p.catch(() => chunkCache.delete(c));
  }
  const chunk = await p, d = {};
  for (const key in chunk) d[key] = chunk[key][i % size];
  return d;
}
const START_KIND = ['Parkplatz', 'Bushaltestelle', 'Bahnhof', 'Seilbahnstation'];
function startHtml(d) {
  const item = ([name, dist, la, lo, kind]) => `<li>${esc(name || START_KIND[kind] + ' ohne Namen')}` +
    `<a class="onmap" href="https://www.google.com/maps/dir/?api=1&destination=${la},${lo}" target="_blank" rel="noopener">Anfahrt</a>` +
    `<small>${kind ? START_KIND[kind] + ' · ' : ''}${n1(dist)} km Luftlinie zum Gipfel</small></li>`;
  const pk = d.pk || [], st = d.st || [];
  if (!pk.length && !st.length) return `<p class="note">Im Umkreis von 12 km ist kein öffentlicher Parkplatz und keine Haltestelle erfasst.</p>`;
  return `<section class="ways"><h3 class="h3">Ausgangspunkte in der Nähe</h3>` +
    (pk.length ? `<div class="kind"><div class="kh"><span class="kb kp">P</span><small>Nächste öffentliche Parkplätze</small></div><ul class="rts">${pk.map(item).join('')}</ul></div>` : '') +
    (st.length ? `<div class="kind"><div class="kh"><span class="kb kh2">H</span><small>Nächste Haltestellen</small></div><ul class="rts">${st.map(item).join('')}</ul></div>` : '') +
    `<p class="note">Die nächsten Punkte nach Luftlinie, auf der Karte mit P und H markiert. Der Weg von dort zum Gipfel kann deutlich länger sein oder auf der anderen Talseite beginnen; prüfe ihn auf der Karte.</p></section>`;
}
function showDetail(i, fromMap, noPush) {
  count('gipfel:' + D.peaks.id[i]);
  if (pageMode) setPage(null);
  if (selected !== i) close3d();
  selected = i;
  $('bookpanel').hidden = true;
  if (HOSTED) {
    if (!noPush && location.pathname !== peakUrl(i)) history.pushState({ p: D.peaks.id[i] }, '', peakUrl(i));
    document.title = `${D.peaks.n[i]}${D.peaks.e[i] != null ? ' (' + fmt.format(D.peaks.e[i]) + ' m)' : ''} – Alpengipfel`;
  }
  const box = $('detail');
  box.innerHTML = `<button class="back" id="back" type="button">← Zur Liste</button><div><h2 tabindex="-1" id="dtitle">${esc(D.peaks.n[i])}</h2></div><p class="note" id="dload" role="status">Angaben werden geladen …</p>`;
  box.hidden = false; $('back').onclick = () => closeDetail();
  if (!fromMap) $('dtitle').focus({ preventScroll: true });
  startPts = []; if (peakLayer) peakLayer.redraw(); renderList();
  detailOf(i).then(d => { if (selected === i) renderDetail(i, fromMap, d); },
    () => { if (selected === i && $('dload')) $('dload').textContent = 'Die Angaben zu diesem Gipfel konnten nicht geladen werden. Prüfe die Verbindung und öffne den Gipfel noch einmal.'; });
}
let detailTab = 'over', curDetail = null;
function setTab(k, user) {
  detailTab = k;
  if (k === 'routes' && HOSTED && curDetail && curDetail.i === selected) loadAscents(selected, curDetail.d);
  document.querySelectorAll('#detail .dtabs button').forEach(b => { const on = b.dataset.k === k; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('#detail .dpanel').forEach(p => { p.hidden = p.id !== 'dp-' + k; });
  if (user) { const el = $('detail'), t = el.querySelector('.dtabs'), top = t.offsetTop - parseFloat(getComputedStyle(el).paddingTop); if (el.scrollTop > top) el.scrollTop = top; }
}
function renderDetail(i, fromMap, d) {
  curDetail = { i, d }; selKey = '';
  const P = D.peaks, e = P.e[i], la = P.la[i], lo = P.lo[i];
  const pl = placeNames(i);
  startPts = [...(d.pk || []), ...(d.st || [])];
  const countries = arr(P.c[i]).map(x => D.countries[x].n).join(', ') || '–';
  const sub = arr(d.sg).map(x => D.subgroups[x]).join(', ');
  if (!rankByEle) {
    const order = [...Array(N).keys()].filter(k => P.e[k] != null).sort((a, b) => P.e[b] - P.e[a]);
    rankByEle = new Int32Array(N).fill(0); order.forEach((k, r) => rankByEle[k] = r + 1);
  }
  const wp = d.wp;
  let wpLink = '';
  if (wp) { const k = wp.indexOf(':'); wpLink = `<a href="https://${esc(wp.slice(0, k))}.wikipedia.org/wiki/${encodeURIComponent(wp.slice(k + 1).replace(/ /g, '_'))}" target="_blank" rel="noopener">Wikipedia</a>`; }
  const el = $('detail'), nR = (d.rt || []).length + (d.ap || []).length + (d.cc || []).length, nS = (d.pk || []).length + (d.st || []).length;
  const tabs = [['over', 'Übersicht', ''], ['routes', 'Routen', HOSTED ? '' : nR || ''], ['wx', 'Wetter', ''], ['go', 'Anfahrt', nS || '']];
  el.innerHTML =
    `<div class="dtop"><button class="back" id="back" type="button">← Zur Liste</button>${HOSTED ? `<button type="button" class="sharebtn" id="share2" aria-label="${esc(P.n[i])} teilen">${SHARE_ICON}<span>Teilen</span></button>` : ''}</div>` +
    `<div><h2>${esc(P.n[i])}</h2>${P.an[i] ? `<div class="alt">auch: ${esc(P.an[i])}</div>` : ''}</div>` +
    `<div class="summit"><span class="big">${e == null ? '–' : fmt.format(e)}</span><span class="unit">m Höhe</span>` +
    (e != null ? `<span class="rank">Rang ${fmt.format(rankByEle[i])}<br>von ${fmt.format(N)} Gipfeln</span>` : `<span class="rank">Höhe in OpenStreetMap<br>nicht eingetragen</span>`) + `</div>` +
    `<button type="button" class="wxnow" id="wxnow"><span class="lab">Heute am Gipfel</span><span id="wxnowt">Wetter wird geladen …</span></button>` +
    `<div class="dtabs" role="tablist" aria-label="Angaben zum Gipfel">${tabs.map(([k, t, n]) => `<button type="button" role="tab" id="dt-${k}" aria-controls="dp-${k}" data-k="${k}">${t}${n ? `<span>${n}</span>` : ''}</button>`).join('')}</div>` +
    `<section class="dpanel" role="tabpanel" id="dp-over" aria-labelledby="dt-over">` +
    `<div class="bookrow" id="bookrow"></div>` +
    `<dl class="facts">` +
    (me ? `<dt>Entfernung</dt><dd>${km(distKm[i])} Luftlinie von deinem Standort</dd>` : '') +
    `<dt>Koordinaten</dt><dd>${la.toFixed(5)}° N, ${lo.toFixed(5)}° O<small>${dms(la, 'N', 'S')}, ${dms(lo, 'O', 'W')}</small></dd>` +
    `<dt>Land</dt><dd>${esc(countries)}</dd>` +
    `<dt>Bundesland / Region</dt><dd>${esc(pl.s || '–')}</dd>` +
    `<dt>Gebirgsgruppe</dt><dd>${esc(pl.g || 'Ohne Zuordnung')}${sub ? `<small>Untergruppe: ${esc(sub)}</small>` : ''}</dd>` +
    (d.p ? `<dt>Schartenhöhe</dt><dd>${fmt.format(d.p)} m</dd>` : '') +
    `<dt>Wege und Routen</dt><dd>${nR ? `${nR} erfasst · <button type="button" class="linkbtn" data-goto="routes">ansehen</button>` : 'keine erfasst'}</dd>` +
    `</dl>` +
    `<div class="links"><button type="button" id="zoomto">Auf Karte zeigen</button>${HOSTED ? '<button type="button" id="show3d">3D-Ansicht</button><button type="button" id="share">Teilen</button>' : ''}` +
    `<a href="https://www.openstreetmap.org/node/${P.id[i]}" target="_blank" rel="noopener">OpenStreetMap</a>${wpLink}` +
    `<a href="https://www.opentopomap.org/#marker=15/${la}/${lo}" target="_blank" rel="noopener">Topokarte</a></div>` +
    (SEO_TEXT && SEO_TEXT.id === P.id[i] ? `<section class="about">${SEO_TEXT.html}</section>` : '') + `</section>` +
    `<section class="dpanel" role="tabpanel" id="dp-routes" aria-labelledby="dt-routes">${routesHtml(i, d)}</section>` +
    `<section class="dpanel" role="tabpanel" id="dp-wx" aria-labelledby="dt-wx"><section class="wx" id="wx"><h3>Wetter am Gipfel, nächste 7 Tage</h3><div id="wxbody" class="note">Vorhersage wird geladen …</div></section></section>` +
    `<section class="dpanel" role="tabpanel" id="dp-go" aria-labelledby="dt-go">${startHtml(d)}</section>`;
  setTab(detailTab, false);
  el.querySelectorAll('.dtabs button').forEach(btn => { btn.onclick = () => setTab(btn.dataset.k, true); });
  el.querySelector('.dtabs').onkeydown = ev => {
    const keys = tabs.map(t => t[0]), k = keys.indexOf(detailTab);
    const to = ev.key === 'ArrowRight' ? keys[(k + 1) % keys.length] : ev.key === 'ArrowLeft' ? keys[(k + keys.length - 1) % keys.length] : ev.key === 'Home' ? keys[0] : ev.key === 'End' ? keys[keys.length - 1] : null;
    if (to) { ev.preventDefault(); setTab(to, true); $('dt-' + to).focus(); }
  };
  el.querySelectorAll('.about a[href*="gipfel/"]').forEach(a => { a.onclick = ev => { const m = a.getAttribute('href').match(/-(\d+)\.html$/), k = m ? indexOfId(+m[1]) : -1; if (k >= 0) { ev.preventDefault(); showDetail(k); } }; });
  el.querySelectorAll('[data-goto]').forEach(btn => { btn.onclick = () => setTab(btn.dataset.goto, true); });
  $('wxnow').onclick = () => setTab('wx', true);
  el.hidden = false; el.scrollTop = 0;
  loadWeather(i);
  $('back').onclick = () => closeDetail();
  renderBookRow(i);
  if ($('show3d')) $('show3d').onclick = () => open3d(i);
  ['share', 'share2'].forEach(id => { if ($(id)) $(id).onclick = () => sharePeak(i); });
  $('zoomto').onclick = () => { close3d(); setView('map'); centerOn(la, lo, Math.max(map.getZoom(), 13)); };
  if (MOBILE()) setSheet(fromMap ? 'half' : 'full');
  if (map && (!fromMap || MOBILE())) centerOn(la, lo, fromMap ? map.getZoom() : Math.max(map.getZoom(), HOSTED ? 13 : 12));
  el.querySelectorAll('.onmap[data-rel]').forEach(b => { b.onclick = () => showRouteOnMap(b.dataset.rel, b); });
  if (trailsFor !== i) clearTrails();
  loadTrails(i);
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
      if (selected === i && $('wxnowt')) $('wxnowt').textContent = 'Wetter gerade nicht verfügbar';
      if (selected === i && $('wxbody')) $('wxbody').innerHTML = (HOSTED ? 'Der Wetterdienst ist gerade nicht erreichbar. Öffne den Gipfel in ein paar Minuten noch einmal. ' : 'Die Vorhersage konnte nicht geladen werden. Innerhalb von claude.ai darf die Seite keine Wetterdaten abrufen; auf der eigenen Webadresse erscheint sie hier. ') + windy;
      return;
    }
  }
  if (selected !== i || !$('wxbody')) return;
  const d = data.daily, h = data.hourly;
  if ($('wxnowt')) {
    const warn = [];
    if (h.weather_code.slice(0, 24).some(c => c >= 95)) warn.push('Gewitter');
    if (d.wind_gusts_10m_max[0] >= 75) warn.push('Sturmböen');
    if (d.snowfall_sum[0] >= 10) warn.push('viel Neuschnee');
    $('wxnowt').innerHTML = `<b>${WMO[d.weather_code[0]] || '–'}</b> · ${n0(d.temperature_2m_min[0])} / ${n0(d.temperature_2m_max[0])} °C · Böen ${n0(d.wind_gusts_10m_max[0])} km/h` +
      warn.map(w => `<em class="warn">${w}</em>`).join('') + `<span class="more">7 Tage ›</span>`;
  }
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
/* ---------- 3D view of a summit's surroundings (MapLibre GL with terrain, loaded only when opened) ---------- */
let gl3d = null, glLib = null;
function loadMaplibre() {
  if (!glLib) glLib = new Promise((ok, fail) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = ROOT + 'assets/maplibre-gl.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = ROOT + 'assets/maplibre-gl.js'; s.onload = ok; s.onerror = () => { glLib = null; fail(new Error('load')); }; document.head.appendChild(s);
  });
  return glLib;
}
function close3d() { if (gl3d) { gl3d.remove(); gl3d = null; } if ($('view3d')) $('view3d').hidden = true; }
async function open3d(i) {
  count('3d');
  const P = D.peaks, la = P.la[i], lo = P.lo[i], wrap = $('view3d'), msg = $('v3msg');
  setView('map'); wrap.hidden = false; msg.hidden = false; msg.textContent = '3D-Ansicht wird geladen …';
  const fail = () => { msg.hidden = false; msg.textContent = 'Die 3D-Ansicht lässt sich auf diesem Gerät oder gerade nicht laden. Die flache Karte funktioniert weiter.'; };
  try { await loadMaplibre(); } catch (err) { return fail(); }
  if (gl3d) { gl3d.remove(); gl3d = null; }
  try {
    gl3d = new maplibregl.Map({
      container: 'v3map', center: [lo, la], zoom: 12.6, pitch: 62, bearing: -20, maxPitch: 80, maxZoom: 16, minZoom: 9,
      style: { version: 8,
        sources: {
          osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: '© OpenStreetMap-Mitwirkende' },
          dem: { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 14, encoding: 'terrarium', attribution: 'Höhendaten: Mapzen Terrain Tiles' } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        terrain: { source: 'dem', exaggeration: 1.2 },
        sky: { 'sky-color': '#9cc3e6', 'horizon-color': '#e6eef2', 'fog-color': '#e6eef2', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.6, 'fog-ground-blend': 0.3 } }
    });
  } catch (err) { return fail(); }
  const m = gl3d;
  m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  m.on('error', ev => { if (!m.loaded()) fail(); });
  m.on('load', async () => {
    if (gl3d !== m) return;
    msg.hidden = true;
    // neighbouring summits as dots, the open one as a labelled pin
    const near = [];
    for (let k = 0; k < N; k++) if (k !== i && Math.abs(P.la[k] - la) < 0.09 && Math.abs(P.lo[k] - lo) < 0.13) near.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [P.lo[k], P.la[k]] }, properties: { c: colorOf(P.e[k]), n: P.n[k] + (P.e[k] != null ? ', ' + fmt.format(P.e[k]) + ' m' : '') } });
    m.addSource('peaks', { type: 'geojson', data: { type: 'FeatureCollection', features: near } });
    m.addLayer({ id: 'peaks', type: 'circle', source: 'peaks', paint: { 'circle-radius': 4.5, 'circle-color': ['get', 'c'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.2 } });
    const tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 });
    m.on('mousemove', 'peaks', ev => { m.getCanvas().style.cursor = 'pointer'; tip.setLngLat(ev.features[0].geometry.coordinates).setText(ev.features[0].properties.n).addTo(m); });
    m.on('mouseleave', 'peaks', () => { m.getCanvas().style.cursor = ''; tip.remove(); });
    m.on('click', 'peaks', ev => { tip.setLngLat(ev.features[0].geometry.coordinates).setText(ev.features[0].properties.n).addTo(m); });
    const pin = document.createElement('div'); pin.className = 'v3pin'; pin.textContent = P.n[i] + (P.e[i] != null ? ' · ' + fmt.format(P.e[i]) + ' m' : '');
    new maplibregl.Marker({ element: pin, anchor: 'bottom', offset: [0, -6] }).setLngLat([lo, la]).addTo(m);
    // the paths around the summit, coloured like on the flat map
    let data = trailCache.get(i);
    if (!data) { try { data = await fetchTrails(i); trailCache.set(i, data); } catch (err) { data = null; } }
    if (!data || gl3d !== m) return;
    const feats = data.ways.map(w => {
      const t = w.t, g = Math.max(0, ...(t.sac_scale || '').split(';').map(v => SAC[v.trim()] || 0));
      const cat = t.highway === 'via_ferrata' || t.via_ferrata_scale ? 2 : g >= 4 ? 1 : 0, track = t.highway === 'track' && !g;
      return { type: 'Feature', geometry: { type: 'LineString', coordinates: w.ll.map(p => [p[1], p[0]]) }, properties: { c: cssColors[cat === 2 ? '--tk' : cat === 1 ? '--ta' : track ? '--tt' : '--tw'], w: track ? 1.6 : 3 } };
    });
    m.addSource('trails', { type: 'geojson', data: { type: 'FeatureCollection', features: feats } });
    m.addLayer({ id: 'trails-case', type: 'line', source: 'trails', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': ['+', ['get', 'w'], 2.2], 'line-opacity': 0.8 } }, 'peaks');
    m.addLayer({ id: 'trails', type: 'line', source: 'trails', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'c'], 'line-width': ['get', 'w'] } }, 'peaks');
  });
}
function closeDetail(noPush) {
  $('detail').hidden = true; selected = -1; startPts = []; clearTrails(); close3d();
  if (HOSTED) { if (!noPush && location.pathname !== ROOT) history.pushState({}, '', ROOT + '#karte'); document.title = 'Alpengipfel'; }
  renderList(); if (peakLayer) peakLayer.redraw();
}
function indexOfId(id) {
  if (!idIndex) { idIndex = new Map(); D.peaks.id.forEach((v, k) => idIndex.set(v, k)); }
  return idIndex.has(id) ? idIndex.get(id) : -1;
}
function route() {                                  // show what the current address names
  const m = location.pathname.match(/-(\d+)\.html$/), i = m ? indexOfId(+m[1]) : -1;
  if (i >= 0) { setPage(null); return showDetail(i, false, true); }
  if (selected >= 0) closeDetail(true);
  if (location.hash === '#profil') showProfile(true); else if (location.hash === '#karte') { $('bookpanel').hidden = true; setPage(null); } else showHome(true);
}

/* ---------- start page and profile: full-width pages above the list and the map ---------- */
let pageMode = null;                                 // null = list and map, 'home', 'profile'
function markNav() {
  const cur = pageMode === 'home' ? 'navstart' : pageMode === 'profile' ? 'openprofile' : !$('bookpanel').hidden ? 'openbook' : 'navexp';
  ['navstart', 'navexp', 'openbook', 'openprofile'].forEach(id => $(id).setAttribute('aria-current', String(id === cur)));
}
/* ---------- phone layout: the list is a sheet over the map (peek, half, full) ---------- */
const MOBILE = () => matchMedia('(max-width: 760px)').matches;
function sheetPx(st) { const a = $('mapwrap').clientHeight; return st === 'peek' ? Math.min(132, a) : st === 'half' ? Math.round(a * .52) : a; }
function setSheet(st) {
  const app = $('app'); app.dataset.sheet = st; $('side').style.height = '';
  app.style.setProperty('--cover', MOBILE() ? sheetPx(st) + 'px' : '0px');
  setTimeout(renderList, 320);
}
function centerOn(la, lo, z) {                       // centre a point in the part of the map the sheet leaves free
  map.setView([la, lo], z, { animate: false });
  const c = MOBILE() ? Math.min(sheetPx($('app').dataset.sheet || 'half'), $('mapwrap').clientHeight - 80) : 0;
  if (c > 0) map.panBy([0, c / 2], { animate: false });
}
function initSheet() {
  const grab = $('grab'), side = $('side'), app = $('app'); let y0 = 0, h0 = 0, t0 = 0, moved = false, drag = false;
  grab.addEventListener('pointerdown', ev => { if (!MOBILE()) return; drag = true; moved = false; y0 = ev.clientY; t0 = Date.now(); h0 = side.offsetHeight; side.classList.add('dragging'); grab.setPointerCapture(ev.pointerId); });
  grab.addEventListener('pointermove', ev => {
    if (!drag) return; const dy = ev.clientY - y0; if (Math.abs(dy) > 5) moved = true;
    const h = Math.max(96, Math.min($('mapwrap').clientHeight, h0 - dy)); side.style.height = h + 'px'; app.style.setProperty('--cover', h + 'px');
  });
  const end = ev => {
    if (!drag) return; drag = false; side.classList.remove('dragging');
    const h = side.offsetHeight, v = (ev.clientY - y0) / Math.max(1, Date.now() - t0), cur = app.dataset.sheet; let st;
    if (!moved) st = cur === 'peek' ? 'half' : cur === 'half' ? 'full' : 'half';          // a tap steps up, from full back to half
    else if (v > .5) st = h > sheetPx('half') ? 'half' : 'peek';                          // quick swipe down
    else if (v < -.5) st = h < sheetPx('half') ? 'half' : 'full';                         // quick swipe up
    else st = ['peek', 'half', 'full'].reduce((x, y) => Math.abs(sheetPx(y) - h) < Math.abs(sheetPx(x) - h) ? y : x);
    setSheet(st);
  };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  addEventListener('resize', () => setSheet(app.dataset.sheet || 'half'));
  setSheet(app.dataset.sheet || 'half');
}
function setPage(mode) {
  pageMode = mode; $('page').hidden = !mode; $('app').dataset.page = mode || '';
  markNav();
  if (mode) { $('page').scrollTop = 0; document.title = mode === 'profile' ? 'Profil – Alpengipfel' : 'Alpengipfel'; }
  else if (map) setTimeout(() => map.invalidateSize(), 0);
}
const pushUrl = url => { if (HOSTED && location.pathname + location.hash !== url) history.pushState({}, '', url); };
let explored = false;
function explore(noPush) { setPage(null);
  if (MOBILE() && !explored && map && selected < 0 && idx.length === N) setTimeout(() => map.fitBounds(ALPS_BOUNDS, { paddingTopLeft: [10, 10], paddingBottomRight: [10, 10 + Math.min(sheetPx('half'), $('mapwrap').clientHeight - 120)] }), 0);
  explored = true; if (MOBILE() && selected < 0 && $('bookpanel').hidden && $('app').dataset.sheet === 'full') setSheet('half'); if (!noPush && selected < 0) pushUrl(ROOT + '#karte'); }
function showHome(noPush) { if (selected >= 0) closeDetail(true); $('bookpanel').hidden = true; setPage('home'); renderHome(); if (!noPush) pushUrl(ROOT); }
function showProfile(noPush) { if (selected >= 0) closeDetail(true); $('bookpanel').hidden = true; setPage('profile'); renderProfile(); if (!noPush) pushUrl(ROOT + '#profil'); }
function refreshAccount() { if (pageMode === 'profile') renderProfile(); }
function bookStats() {
  const P = D.peaks, done = []; for (let i = 0; i < N; i++) if (book.done[P.id[i]] != null) done.push(i);
  const withEle = done.filter(i => P.e[i] != null), top = withEle.length ? withEle.reduce((a, b) => P.e[a] >= P.e[b] ? a : b) : -1;
  const countries = new Set(), groups = new Set(); done.forEach(i => { arr(P.c[i]).forEach(c => countries.add(c)); arr(P.g[i]).forEach(g => groups.add(g)); });
  return { done, top, sum: withEle.reduce((s, i) => s + P.e[i], 0), countries: countries.size, groups: groups.size, wish: Object.keys(book.wish).filter(id => indexOfId(+id) >= 0).length };
}
function preset(f) {                                 // set the filters for a shortcut and open list and map
  ['q', 'hmin', 'hmax'].forEach(k => $(k).value = ''); $('country').value = ''; fillStates(); $('state').value = ''; $('group').value = ''; $('kind').value = ''; $('book').value = ''; $('radius').value = '';
  if (f.hmin != null) $('hmin').value = f.hmin; if (f.hmax != null) $('hmax').value = f.hmax;
  if (f.kind != null) $('kind').value = f.kind; if (f.country != null) { $('country').value = f.country; fillStates(); } if (f.book) $('book').value = f.book;
  $('sort').value = 'hd'; explore(); apply(); setTimeout(fitToFilter, 60);
}
let heroCache = null;
const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
function drawHero() {                                // the Alps seen from the north: every summit as a cone, in five bands from far (south) to near (north)
  const cv = $('herocv'); if (!cv) return;
  const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), Wc = Math.round(r.width), Hc = Math.round(r.height);
  if (!Wc || !Hc) return;
  cv.width = Wc * dpr; cv.height = Hc * dpr;
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  const P = D.peaks, dark = isDark(), band = Math.min(Hc * .62, Math.max(130, Wc * .2)), base = Hc, LON0 = 5.3, LON1 = 16.5;
  if (!heroCache) {                                 // peaks above 700 m, split by latitude into five depth bands
    const list = []; for (let i = 0; i < N; i++) if (P.e[i] >= 700) list.push(i);
    const lats = list.map(i => P.la[i]).sort((a, b) => a - b), cut = [1, 2, 3, 4].map(q => lats[Math.floor(lats.length * q / 5)]);
    heroCache = [[], [], [], [], []]; list.forEach(i => { let b = 0; while (b < 4 && P.la[i] > cut[b]) b++; heroCache[b].push(i); });   // 0 = far south
  }
  const X = lon => (LON1 - lon) / (LON1 - LON0) * Wc;           // seen from the north: east on the left
  const Hpx = e => (e - 300) / (4810 - 300) * band;
  // sky: stars at night, a low sun by day
  if (dark) { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; c.fillStyle = 'rgba(230,236,245,.75)'; for (let k = 0; k < 70; k++) { const x = rnd() * Wc, y = rnd() * (Hc - band) * .9, z = rnd() * 1.3 + .3; c.fillRect(x, y, z, z); } }
  else { const g = c.createRadialGradient(Wc * .78, Hc - band * .7, 0, Wc * .78, Hc - band * .7, band * 1.4); g.addColorStop(0, 'rgba(255,214,150,.55)'); g.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = g; c.fillRect(0, 0, Wc, Hc); }
  const far = dark ? [52, 70, 90] : [184, 200, 214], near = dark ? [16, 24, 33] : [52, 72, 88];
  const env = [];
  heroCache.forEach((ids, b) => {
    const ys = new Float32Array(Wc + 1).fill(0);
    for (const i of ids) {
      const h = Hpx(P.e[i]), x0 = X(P.lo[i]), w = h * 1.45;
      const a = Math.max(0, Math.floor(x0 - w)), z = Math.min(Wc, Math.ceil(x0 + w));
      for (let x = a; x <= z; x++) { const t = 1 - Math.abs(x - x0) / w; if (t > 0) { const v = h * Math.pow(t, 1.5); if (v > ys[x]) ys[x] = v; } }
    }
    env.push(ys);
    const f = b / 4, col = far.map((v, k) => Math.round(v + (near[k] - v) * f));
    c.beginPath(); c.moveTo(0, base);
    for (let x = 0; x <= Wc; x++) c.lineTo(x, base - ys[x] * (1 - b * .04));
    c.lineTo(Wc, base); c.closePath();
    c.fillStyle = `rgb(${col})`; c.fill();
    if (b < 3) {                                   // snow caps above about 2800 m, following the ridge
      const k = 1 - b * .04, sh = Hpx(2800); let on = false;
      c.beginPath();
      for (let x = 0; x <= Wc; x++) {
        if (ys[x] > sh) { const top = base - ys[x] * k; if (!on) { c.moveTo(x, top); on = true; } else c.lineTo(x, top); }
        else if (on) { for (let z = x - 1; z >= 0 && ys[z] > sh; z--) c.lineTo(z, base - Math.max(sh, ys[z] - (ys[z] - sh) * .55 - 6) * k); c.closePath(); on = false; }
      }
      if (on) { for (let z = Wc; z >= 0 && ys[z] > sh; z--) c.lineTo(z, base - Math.max(sh, ys[z] - (ys[z] - sh) * .55 - 6) * k); c.closePath(); }
      c.fillStyle = dark ? 'rgba(205,218,232,.4)' : 'rgba(255,255,255,.9)'; c.fill();
    }
  });
  // a few names on the skyline
  c.font = `600 ${Wc < 500 ? 10.5 : 12}px ${getComputedStyle(document.body).fontFamily}`; c.textAlign = 'center';
  const names = Wc < 500 ? ['Mont Blanc / Monte Bianco', 'Großglockner'] : ['Mont Blanc / Monte Bianco', 'Matterhorn', 'Piz Bernina', 'Ortler', 'Großglockner', 'Zugspitze'];
  names.forEach(n => {
    const i = P.n.indexOf(n); if (i < 0) return;
    const b = heroCache.findIndex(l => l.includes(i)), x = X(P.lo[i]), y = base - Hpx(P.e[i]) * (1 - b * .04);
    c.fillStyle = dark ? 'rgba(230,236,245,.8)' : 'rgba(29,38,35,.75)'; c.fillRect(x - .5, y - 12, 1, 7);
    c.fillText(n.split(' / ')[0], Math.max(30, Math.min(Wc - 30, x)), y - 16);
  });
}
const ICON = {
  route: '<path d="M6 19c3 0 3-5 6-5s3-4 6-4"/><circle cx="6" cy="19" r="2"/><path d="M18 4v6m0-6 4 2-4 2"/>',
  wx: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z"/>',
  book: '<path d="M5 4.5h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2z"/><path d="M5 17.5a2 2 0 0 1 2-2h11"/><path d="m9 9.5 2 2 3.5-3.5"/>',
  cube: '<path d="M3 17 9 7l3.5 5.5L15 9l6 8z"/><path d="M3 17h18"/>',
  msg: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'
};
const svgIcon = k => `<svg viewBox="0 0 24 24" aria-hidden="true" class="ico">${ICON[k]}</svg>`;
function peakOfDay() {                              // the same summit for everybody on one day: one with a way to the top, above 2000 m
  const P = D.peaks, cand = []; for (let i = 0; i < N; i++) if (P.e[i] >= 2000 && (P.k[i] & 7)) cand.push(i);
  const day = Math.floor((Date.now() + 36e5) / 864e5); return cand.length ? cand[(day * 7919) % cand.length] : 0;
}
function renderHome() {
  const P = D.peaks, cnt = fn => { let n = 0; for (let i = 0; i < N; i++) if (fn(i)) n++; return n; };
  const tiles = [
    ['Viertausender', cnt(i => P.e[i] >= 4000), 'Die höchsten Gipfel der Alpen', { hmin: 4000 }, '--h5'],
    ['Dreitausender', cnt(i => P.e[i] >= 3000 && P.e[i] < 4000), 'Hochgebirge zwischen 3000 und 4000 m', { hmin: 3000, hmax: 3999 }, '--h3'],
    ['Wandergipfel', cnt(i => P.k[i] & 1), 'Mit Wanderweg bis T3 zum Gipfel', { kind: '0' }, '--tw'],
    ['Klettersteige', cnt(i => P.k[i] & 4), 'Gipfel mit gesichertem Steig', { kind: '2' }, '--tk'],
    ['Hochalpine Routen', cnt(i => P.k[i] & 2), 'Alpinwege, Hochtouren, Klettereien', { kind: '1' }, '--ta'],
    ['Skitouren', cnt(i => P.k[i] & 8), 'Gipfel mit erfasster Skiroute', { kind: '3' }, '--ski']];
  const lands = D.countries.map((c, i) => [i, c.n, c.count]).filter(x => x[2]).sort((a, b) => b[2] - a[2]);
  const st = bookStats(), name = sbUser ? (sbUser.user_metadata && sbUser.user_metadata.username) || '' : '';
  const pd = peakOfDay(), pl = placeNames(pd), kinds = [0, 1, 2, 3].filter(k => P.k[pd] & (1 << k));
  const feats = [['route', 'Aufstiege vom Parkplatz', 'Mit Höhenprofil, Gehzeit und GPX-Download', 'exp'], ['wx', 'Bergwetter', '7 Tage Vorhersage für die Gipfelhöhe', 'exp'],
    ['book', 'Gipfelbuch', 'Bestiegene Gipfel und Wunschliste, auf allen Geräten', 'book'], ['cube', '3D-Ansicht', 'Jeden Gipfel im Gelände drehen und ansehen', 'exp']];
  $('page').innerHTML = `<div class="home">
    <section class="hero"><div class="herobg"><canvas id="herocv" aria-hidden="true"></canvas></div><div class="herotxt">
      <p class="eyebrow">${fmt.format(N)} benannte Gipfel · von Nizza bis Wien</p>
      <h2>${name ? `Servus ${esc(name)}, wohin geht es als Nächstes?` : 'Finde deinen nächsten Gipfel in den Alpen'}</h2>
      <p class="lede">Höhe, Aufstieg vom Parkplatz, Bergwetter und dein Gipfelbuch – für jeden Gipfel der Alpen.</p>
      <div class="hsearch"><input id="hq" type="search" placeholder="Gipfel suchen, z. B. Watzmann" autocomplete="off" aria-label="Gipfel suchen"><div class="hres" id="hres" hidden></div></div>
      <div class="hact"><button type="button" class="primary" id="hmap">Karte und Liste öffnen</button><button type="button" id="hnear">Gipfel in meiner Nähe</button></div></div></section>
    <section class="kpis" aria-label="Alpengipfel in Zahlen"><div><b>${fmt.format(N)}</b><span>Gipfel</span></div><div><b>${fmt.format(tiles[0][1])}</b><span>Viertausender</span></div>
      <div><b>${fmt.format(GEO && GEO.huts ? GEO.huts.length : 0)}</b><span>Hütten</span></div><div><b>${lands.length}</b><span>Länder</span></div></section>
    <section class="potd"><div class="potdtxt"><p class="eyebrow">Gipfel des Tages</p><h3>${esc(P.n[pd])}</h3>
      <p class="potdmeta">${P.e[pd] != null ? `<b>${fmt.format(P.e[pd])} m</b>` : ''}${esc([pl.g, pl.s || pl.c].filter(Boolean).join(' · '))}</p>
      <div class="potdk">${kinds.map(k => `<span class="kb k${k}">${KINDS[k]}</span>`).join('')}</div></div>
      <button type="button" class="primary" id="hpotd">Gipfel ansehen</button></section>
    <section><h3 class="h3">Schnell entdecken</h3><div class="tiles">${tiles.map((t, k) => `<button type="button" class="tile" data-k="${k}" style="--c:var(${t[4]})"><span class="tn">${fmt.format(t[1])}</span><b>${t[0]}</b><small>${t[2]}</small></button>`).join('')}</div></section>
    <section><h3 class="h3">Was du hier findest</h3><div class="feats">${feats.map(f => `<button type="button" class="feat" data-go="${f[3]}">${svgIcon(f[0])}<b>${f[1]}</b><small>${f[2]}</small></button>`).join('')}</div></section>
    <section><h3 class="h3">Nach Land</h3><div class="lands">${lands.map(l => `<button type="button" data-c="${l[0]}">${esc(l[1])} <span>${fmt.format(l[2])}</span></button>`).join('')}</div></section>
    <section class="two"><div><h3 class="h3">Die höchsten Gipfel</h3><ol class="toplist">${[0, 1, 2, 3, 4].map(i => `<li><button type="button" data-i="${i}"><i>${i + 1}</i><b>${esc(P.n[i])}</b><span>${fmt.format(P.e[i])} m</span></button></li>`).join('')}</ol></div>
      <div class="hcard"><h3 class="h3">Dein Gipfelbuch</h3>${st.done.length || st.wish ? `<p class="hbig">${fmt.format(st.done.length)}<span> bestiegen · ${fmt.format(st.wish)} auf der Wunschliste</span></p>
        <p class="note">${st.done.length ? `Höchster bisher: ${esc(P.n[st.top] || '–')}${st.top >= 0 ? ', ' + fmt.format(P.e[st.top]) + ' m' : ''}.` : 'Noch kein Gipfel als bestiegen eingetragen.'}</p>`
        : `<p class="hempty">Noch kein Gipfel eingetragen</p><p class="note">Öffne einen Gipfel und trage ihn als bestiegen ein, zum Beispiel die Zugspitze. Dein Fortschritt erscheint dann hier.</p>`}
        <div class="links"><button type="button" id="hbook">Gipfelbuch öffnen</button>${sb ? `<button type="button" id="hprof">${sbUser ? 'Profil' : 'Anmelden'}</button>` : ''}</div></div></section>
    <section class="fbcard">${svgIcon('msg')}<div><h3>Fehlt etwas oder stimmt etwas nicht?</h3><p>Schreib mir deine Idee, einen Fehler oder eine falsche Route. Jede Nachricht wird gelesen.</p></div><button type="button" class="primary" id="hfb">Feedback geben</button></section>
    <footer class="hfoot">${window.AG_SUPPORT ? `<a class="support" href="${esc(window.AG_SUPPORT)}" target="_blank" rel="noopener">Unterstützen</a>` : ''}<button type="button" class="linkbtn" id="hfb2">Feedback</button>${HOSTED ? `<a href="${ROOT}gebirge/">Gebirgsgruppen</a><a href="${ROOT}land/">Länder</a><a href="${ROOT}listen/viertausender.html">Viertausender</a>` : ''}${window.AG_LEGAL ? `<a href="${ROOT}impressum.html">Impressum</a><a href="${ROOT}datenschutz.html">Datenschutz</a><a href="${ROOT}nutzungsbedingungen.html">Nutzungsbedingungen</a>` : ''}<span>Daten: © OpenStreetMap-Mitwirkende, Camptocamp, Open-Meteo · Stand ${D.meta.date}</span></footer></div>`;
  drawHero();
  $('hmap').onclick = () => explore();
  $('hnear').onclick = () => { explore(); locate(); };
  $('hbook').onclick = showBook; if ($('hprof')) $('hprof').onclick = () => showProfile();
  $('hfb').onclick = $('hfb2').onclick = () => openFeedback();
  $('page').querySelectorAll('.tile').forEach(b => { b.onclick = () => preset(tiles[+b.dataset.k][3]); });
  $('page').querySelectorAll('.lands button').forEach(b => { b.onclick = () => preset({ country: b.dataset.c }); });
  $('page').querySelectorAll('.feat').forEach(b => { b.onclick = () => b.dataset.go === 'book' ? showBook() : explore(); });
  const open = i => { explore(true); showDetail(i, false); };
  $('hpotd').onclick = () => open(pd);
  $('page').querySelectorAll('.toplist button').forEach(b => { b.onclick = () => open(+b.dataset.i); });
  const hq = $('hq'), hres = $('hres');
  hq.oninput = () => {
    const q = norm(hq.value.trim()), hits = [];
    if (q.length >= 2) for (let i = 0; i < N && hits.length < 7; i++) if (P.nn[i].includes(q)) hits.push(i);
    hres.hidden = q.length < 2;
    hres.innerHTML = hits.length ? hits.map(i => { const pl = placeNames(i); return `<button type="button" data-i="${i}"><b>${esc(P.n[i])}</b><small>${esc([pl.g, pl.s || pl.c].filter(Boolean).join(' · '))}</small><span>${P.e[i] == null ? '–' : fmt.format(P.e[i]) + ' m'}</span></button>`; }).join('')
      : '<p class="note">Kein Gipfel mit diesem Namen gefunden.</p>';
    hres.querySelectorAll('button').forEach(b => { b.onclick = () => open(+b.dataset.i); });
  };
  hq.onkeydown = ev => { if (ev.key === 'Enter') { const first = hres.querySelector('button'); if (first) first.click(); else if (hq.value.trim()) { preset({}); $('q').value = hq.value.trim(); apply(); } } };
}
const THEME_KEY = 'alpengipfel.theme';
function setTheme(t) {
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  try { if (t) localStorage.setItem(THEME_KEY, t); else localStorage.removeItem(THEME_KEY); } catch (err) { /* applies to this visit only */ }
}
function renderProfile() {
  const P = D.peaks, st = bookStats(), page = $('page');
  const empty = !st.done.length && !st.wish;
  const stats = empty ? `<div class="emptybox"><h3>Noch keine Gipfel eingetragen</h3><p>Öffne einen Gipfel und trage ihn als bestiegen ein oder setze ihn auf die Wunschliste. Hier erscheinen dann deine Zahlen.</p></div>` : `<div class="pstats">${[['Bestiegen', fmt.format(st.done.length)], ['Wunschliste', fmt.format(st.wish)], ['Höchster Gipfel', st.top >= 0 ? `${esc(P.n[st.top])}<small>${fmt.format(P.e[st.top])} m</small>` : '–'],
    ['Gipfelhöhe gesamt', fmt.format(st.sum) + ' m'], ['Länder', st.countries], ['Gebirgsgruppen', st.groups]].map(s => `<div><span class="lab">${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>`;
  const actions = empty ? `<div class="links"><button type="button" id="pexp">Gipfel entdecken</button><button type="button" id="pbook">Gipfelbuch öffnen</button></div>`
    : `<div class="links"><button type="button" id="pbook">Gipfelbuch öffnen</button><button type="button" id="pdone">Bestiegene auf der Karte</button><button type="button" id="pwish">Wunschliste zeigen</button></div>`;
  const cur = document.documentElement.dataset.theme || '';
  const theme = HOSTED ? `<section><h3 class="h3">Darstellung</h3><div class="seg3" role="radiogroup" aria-label="Farbschema">${[['', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([v, t]) => `<button type="button" role="radio" data-t="${v}" aria-checked="${v === cur}">${t}</button>`).join('')}</div><p class="note">„Automatisch“ folgt der Einstellung deines Geräts.</p></section>` : '';
  let headHtml;
  if (sbUser) {
    const name = (sbUser.user_metadata && sbUser.user_metadata.username) || sbUser.email || '', since = sbUser.created_at ? new Date(sbUser.created_at).toLocaleDateString('de-DE') : '';
    headHtml = `<div class="phead"><div class="avatar" aria-hidden="true">${esc(name.slice(0, 1).toUpperCase())}</div><div><h2>${esc(name)}</h2><p class="note">${esc(sbUser.email || '')}${since ? ' · dabei seit ' + since : ''}</p></div></div>`;
  } else headHtml = `<div class="phead"><div class="avatar" aria-hidden="true">?</div><div><h2>Profil</h2><p class="note">${sb ? 'Du bist nicht angemeldet. Dein Gipfelbuch liegt nur in diesem Browser.' : 'Konten gibt es nur auf alpen-gipfel.de. Hier liegt dein Gipfelbuch in diesem Browser.'}</p></div></div>`;
  page.innerHTML = `<div class="home profile">${headHtml}<section><h3 class="h3">Deine Gipfel</h3>${stats}${actions}</section><section class="pacct">${accountHtml()}</section>${sbUser ? '<section id="pstatsadmin"></section>' : ''}${theme}</div>`;
  $('pbook').onclick = showBook;
  if ($('pdone')) { $('pdone').onclick = () => preset({ book: 'done' }); $('pwish').onclick = () => preset({ book: 'wish' }); }
  if ($('pexp')) $('pexp').onclick = () => showHome();
  page.querySelectorAll('.seg3 button').forEach(b => { b.onclick = () => { setTheme(b.dataset.t); page.querySelectorAll('.seg3 button').forEach(x => x.setAttribute('aria-checked', String(x === b))); }; });
  wireAccount();
  loadStats();
}

/* ---------- Gipfelbuch (kept in this browser) ---------- */
const BOOK_KEY = 'alpengipfel.gipfelbuch.v1';
let book = { done: {}, wish: {} };
try { const raw = JSON.parse(localStorage.getItem(BOOK_KEY) || 'null'); if (raw && raw.done && raw.wish) book = raw; } catch (err) { /* storage unavailable: the book lasts for this visit only */ }
function storeBook() { try { localStorage.setItem(BOOK_KEY, JSON.stringify(book)); } catch (err) { /* see above */ } }
function saveBook() { storeBook(); if (sbUser) { clearTimeout(pushTimer); pushTimer = setTimeout(pushBook, 800); } }

/* ---------- account: the Gipfelbuch of a signed-in user is kept in Supabase and follows them to every device ---------- */
const SB_URL = 'https://jhkzxneztgpezidgfhah.supabase.co', SB_KEY = 'sb_publishable_ITvFoKOEjH8mBzWuxhWOlQ_haTXZXmW';   // publishable key, safe in page code
const SYNC_KEY = 'alpengipfel.konto';               // remembers which account this browser's book was already merged into
let sb = null, sbUser = null, pushTimer = 0, syncMsg = '';
/* ---------- visitor counter: page loads per day, where visitors come from, opened summits.
   No cookies, nothing stored in the browser, no identifiers; Supabase only keeps daily totals. ---------- */
const counted = new Set();
let countGate = Promise.resolve(), noCount = false;     // admins (see public.admins) are not counted
function count(seite) {
  if (location.hostname !== 'alpen-gipfel.de' || counted.has(seite)) return;
  counted.add(seite);
  countGate.then(() => { if (!noCount) fetch(SB_URL + '/rest/v1/rpc/aufruf_zaehlen', { method: 'POST', keepalive: true, headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ seite }) }).catch(() => { /* counting is optional */ }); });
}
function countVisit() {
  if (sb) countGate = (async () => {                   // signed in as an admin? then this browser is not counted
    try { const { data } = await sb.auth.getSession(); if (data && data.session) { const adm = await sb.rpc('ist_admin'); noCount = adm.data === true; } } catch (err) { /* count normally */ }
  })();
  count('seitenaufruf');
  count('einstieg:' + (/-\d+\.html$/.test(location.pathname) ? 'gipfelseite' : location.hash === '#profil' ? 'profil' : location.hash === '#karte' ? 'karte' : 'start'));
  let ref = ''; try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (err) { /* no referrer */ }
  const src = !ref ? 'direkt' : /tiktok/.test(ref) ? 'tiktok' : /google\./.test(ref) ? 'google' : /instagram|facebook|fb\.com/.test(ref) ? 'instagram' : /bing|duckduckgo|ecosia|yahoo/.test(ref) ? 'suche' : ref.endsWith('alpen-gipfel.de') ? 'intern' : 'andere';
  if (src !== 'intern') count('von:' + src);
}
/* ---------- sharing: the phone's own share menu, otherwise a small window with the preview image ---------- */
const SHARE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m7.5 7.5 4.5-4.5 4.5 4.5"/><path d="M5 12v7.5h14V12"/></svg>';
async function sharePeak(i) {
  const P = D.peaks, url = location.origin + peakUrl(i);
  const title = `${P.n[i]}${P.e[i] != null ? ' (' + fmt.format(P.e[i]) + ' m)' : ''}`;
  const text = `${title} – Aufstieg vom Parkplatz, Bergwetter und Karte auf Alpengipfel`;
  count('teilen');
  if (navigator.share && (MOBILE() || matchMedia('(pointer: coarse)').matches)) {
    try { await navigator.share({ title, text, url }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
  }
  let dlg = $('sharedlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'sharedlg'; dlg.className = 'fbdlg sharedlg'; document.body.appendChild(dlg); dlg.onclick = ev => { if (ev.target === dlg) dlg.close(); }; }
  const enc = encodeURIComponent, img = `${ROOT}og/${P.id[i]}.jpg`;
  const targets = [['WhatsApp', `https://wa.me/?text=${enc(text + ' ' + url)}`], ['Telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`], ['X', `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`],
    ['E-Mail', `mailto:?subject=${enc(title)}&body=${enc(text + '\n\n' + url)}`]];
  dlg.innerHTML = `<div class="fbhead"><h2>${esc(P.n[i])} teilen</h2><button type="button" class="fbx" id="shx" aria-label="Schließen">×</button></div>` +
    `<img class="shareimg" src="${img}" alt="Vorschaubild: ${esc(title)}" width="1200" height="630" onerror="this.onerror=null;this.src='${ROOT}og/alpengipfel.jpg'">` +
    `<p class="note">So sieht die Vorschau aus, wenn du den Link teilst.</p>` +
    `<div class="sharegrid">${targets.map(([n, href]) => `<a class="onmap" href="${href}" target="_blank" rel="noopener">${n}</a>`).join('')}<button type="button" class="onmap" id="shcopy">Link kopieren</button></div>` +
    `<input class="shareurl" id="shurl" readonly value="${esc(url)}" aria-label="Link">`;
  $('shx').onclick = () => dlg.close();
  $('shcopy').onclick = () => navigator.clipboard.writeText(url).then(() => { $('shcopy').textContent = 'Kopiert ✓'; }, () => { $('shurl').select(); });
  $('shurl').onclick = () => $('shurl').select();
  dlg.showModal();
}
/* ---------- feedback: visitors write, only admins read (Supabase table feedback) ---------- */
const FB_ART = [['idee', 'Idee oder Wunsch'], ['fehler', 'Fehler auf der Seite'], ['daten', 'Gipfel oder Route stimmt nicht'], ['sonstiges', 'Sonstiges']];
function openFeedback() {
  let dlg = $('fbdlg');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'fbdlg'; dlg.className = 'fbdlg'; dlg.setAttribute('aria-labelledby', 'fbtitle'); document.body.appendChild(dlg); }
  const here = selected >= 0 ? D.peaks.n[selected] : '';
  dlg.innerHTML = `<form id="fbform" class="upf"><div class="fbhead"><h2 id="fbtitle">Feedback</h2><button type="button" class="fbx" id="fbx" aria-label="Schließen">×</button></div>` +
    `<p class="note">Was gefällt dir, was fehlt, was stimmt nicht? Deine Nachricht liest nur der Betreiber von Alpengipfel.${here ? ` Sie bezieht sich auf <b>${esc(here)}</b>, falls du nichts anderes schreibst.` : ''}</p>` +
    `<fieldset class="fbart"><legend>Worum geht es?</legend>${FB_ART.map(([v, t], k) => `<label><input type="radio" name="fbart" value="${v}"${k === (here ? 2 : 0) ? ' checked' : ''}><span>${t}</span></label>`).join('')}</fieldset>` +
    `<label>Nachricht<textarea id="fbtext" required minlength="5" maxlength="2000" rows="5" placeholder="Schreib einfach drauf los …"></textarea></label>` +
    `<label>E-Mail, falls du eine Antwort möchtest (freiwillig)<input id="fbmail" type="email" maxlength="200" autocomplete="email"></label>` +
    `<p class="note small">Gespeichert werden deine Nachricht, die freiwillige E-Mail-Adresse und die Seite, auf der du gerade bist${sbUser ? ', dazu dein Benutzername' : ''}.` +
    (window.AG_LEGAL ? ` Mehr in der <a href="${ROOT}datenschutz.html" target="_blank">Datenschutzerklärung</a>.` : '') + `</p>` +
    `<div class="ascbtns"><button type="submit" class="primary">Senden</button><button type="button" class="onmap" id="fbcancel">Abbrechen</button></div><p id="fbmsg" class="note" role="status"></p></form>`;
  const close = () => dlg.close();
  $('fbx').onclick = $('fbcancel').onclick = close;
  dlg.onclick = ev => { if (ev.target === dlg) close(); };
  $('fbform').onsubmit = async ev => {
    ev.preventDefault();
    const text = $('fbtext').value.trim(), art = (dlg.querySelector('input[name=fbart]:checked') || {}).value || 'sonstiges', mail = $('fbmail').value.trim();
    if (text.length < 5) { $('fbmsg').textContent = 'Bitte schreib mindestens ein paar Worte.'; return; }
    if (!sb) { location.href = 'mailto:kontakt@alpen-gipfel.de?subject=' + encodeURIComponent('Feedback Alpengipfel') + '&body=' + encodeURIComponent(text); return; }
    $('fbmsg').textContent = 'Wird gesendet …'; dlg.querySelector('button[type=submit]').disabled = true;
    const { data, error } = await sb.rpc('feedback_senden', { art, nachricht: text, kontakt: mail, seite: (location.pathname + location.hash).slice(0, 200) });
    if (error || data === false) { $('fbmsg').textContent = 'Das hat leider nicht geklappt. Versuch es später noch einmal oder schreib an kontakt@alpen-gipfel.de.'; dlg.querySelector('button[type=submit]').disabled = false; return; }
    dlg.querySelector('form').innerHTML = `<div class="fbhead"><h2>Danke!</h2><button type="button" class="fbx" id="fbx2" aria-label="Schließen">×</button></div><p>Deine Nachricht ist angekommen.${mail ? ' Falls nötig, melde ich mich per E-Mail.' : ''}</p>`;
    $('fbx2').onclick = close; setTimeout(() => { if (dlg.open) close(); }, 2500);
  };
  dlg.showModal(); $('fbtext').focus();
}
async function loadFeedback(box) {                 // all feedback, for admins
  const sec = document.createElement('div'); box.appendChild(sec);
  const { data, error } = await sb.rpc('feedback_liste');
  if (error) { sec.innerHTML = '<h3 class="h3">Feedback</h3><p class="note">Noch nicht eingerichtet (supabase/feedback.sql ausführen).</p>'; return; }
  const ART = Object.fromEntries(FB_ART);
  const draw = rows => {
    const open = rows.filter(r => !r.erledigt).length;
    sec.innerHTML = `<h3 class="h3">Feedback · ${open} offen</h3>` + (rows.length ? `<ul class="fblist">${rows.map((r, k) => `<li class="${r.erledigt ? 'done' : ''}"><div class="fbmeta"><span class="fbtag">${esc(ART[r.art] || r.art)}</span>` +
      `<span>${new Date(r.created_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</span>${r.autor ? `<span>von ${esc(r.autor)}</span>` : ''}${r.seite ? `<a href="${esc(r.seite)}" target="_blank">${esc(decodeURIComponent(r.seite.replace(/^\/gipfel\//, '').replace(/-\d+\.html$/, '')) || 'Startseite')}</a>` : ''}</div>` +
      `<p>${esc(r.nachricht)}</p>${r.kontakt ? `<p class="note">Antwort an: <a href="mailto:${esc(r.kontakt)}">${esc(r.kontakt)}</a></p>` : ''}` +
      `<div class="ascbtns"><button type="button" class="onmap" data-done="${k}">${r.erledigt ? 'Wieder öffnen' : 'Erledigt'}</button><button type="button" class="onmap" data-del="${k}">Löschen</button></div></li>`).join('')}</ul>`
      : '<p class="note">Noch kein Feedback.</p>');
    sec.querySelectorAll('[data-done]').forEach(b => { b.onclick = async () => { const r = rows[+b.dataset.done]; await sb.rpc('feedback_erledigt', { eintrag: r.id, wert: !r.erledigt }); r.erledigt = !r.erledigt; draw(rows); }; });
    sec.querySelectorAll('[data-del]').forEach(b => { b.onclick = async () => { const r = rows[+b.dataset.del]; if (!confirm('Dieses Feedback löschen?')) return; await sb.rpc('feedback_loeschen', { eintrag: r.id }); draw(rows.filter(x => x !== r)); }; });
  };
  draw(data || []);
}
async function loadReports(box) {                // reported user tracks, for admins
  const sec = document.createElement('div'); box.appendChild(sec);
  const { data, error } = await sb.rpc('track_meldungen_liste');
  if (error) { sec.innerHTML = '<h3 class="h3">Gemeldete Tracks</h3><p class="note">Noch nicht eingerichtet (supabase/tracks.sql ausführen).</p>'; return; }
  const draw = rows => {
    sec.innerHTML = `<h3 class="h3">Gemeldete Tracks</h3>` + (rows.length ? `<ul class="slist">${rows.map((r, k) => { const i = indexOfId(+r.gipfel);
      return `<li><span><b>${esc(r.name)}</b> von ${esc(r.autor || '?')} · ${i >= 0 ? esc(D.peaks.n[i]) : r.gipfel}<small class="note">„${esc(r.grund)}“ · ${new Date(r.created_at).toLocaleDateString('de-DE')}</small></span>` +
        `<span class="ascbtns">${i >= 0 ? `<button type="button" class="onmap" data-open="${i}">Ansehen</button>` : ''}<button type="button" class="onmap" data-del="${k}">Track löschen</button><button type="button" class="onmap" data-ok="${k}">Meldung erledigt</button></span></li>`; }).join('')}</ul>`
      : '<p class="note">Keine offenen Meldungen.</p>');
    sec.querySelectorAll('[data-open]').forEach(b => { b.onclick = () => { detailTab = 'routes'; showDetail(+b.dataset.open); }; });
    sec.querySelectorAll('[data-del]').forEach(b => { b.onclick = async () => { const r = rows[+b.dataset.del]; if (!confirm(`Track „${r.name}“ löschen?`)) return; await sb.rpc('track_entfernen', { track: r.track_id }); draw(rows.filter(x => x.track_id !== r.track_id)); }; });
    sec.querySelectorAll('[data-ok]').forEach(b => { b.onclick = async () => { const r = rows[+b.dataset.ok]; await sb.rpc('meldung_erledigt', { track: r.track_id }); draw(rows.filter(x => x.track_id !== r.track_id)); }; });
  };
  draw(data || []);
}
async function loadStats() {                            // only for accounts listed as admins
  const box = $('pstatsadmin'); if (!box || !sb || !sbUser) return;
  const adm = await sb.rpc('ist_admin'); if (adm.error || !adm.data) { box.remove(); return; }
  noCount = true;
  const { data, error } = await sb.rpc('aufrufe_statistik', { tage: 30 });
  if (error) { box.innerHTML = '<h3 class="h3">Besucher</h3><p class="note">Die Statistik konnte nicht geladen werden.</p>'; return; }
  const days = {}, src = {}, peaks = {}; let total = 0;
  for (const r of data) {
    if (r.seite === 'seitenaufruf') { days[r.tag] = (days[r.tag] || 0) + r.anzahl; total += r.anzahl; }
    else if (r.seite.startsWith('von:')) src[r.seite.slice(4)] = (src[r.seite.slice(4)] || 0) + r.anzahl;
    else if (r.seite.startsWith('gipfel:')) peaks[r.seite.slice(7)] = (peaks[r.seite.slice(7)] || 0) + r.anzahl;
  }
  const list = []; for (let k = 29; k >= 0; k--) { const d = new Date(Date.now() - k * 864e5); const key = d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }); list.push([key, days[key] || 0]); }
  const max = Math.max(1, ...list.map(x => x[1])), today = list[list.length - 1][1], week = list.slice(-7).reduce((s, x) => s + x[1], 0);
  const SRC = { tiktok: 'TikTok', google: 'Google', instagram: 'Instagram/Facebook', suche: 'andere Suchmaschinen', direkt: 'direkt oder App', andere: 'andere Seiten' };
  const top = Object.entries(peaks).sort((a, b) => b[1] - a[1]).slice(0, 8);
  box.innerHTML = `<h3 class="h3">Besucher · nur für dich sichtbar</h3>` +
    `<div class="pstats"><div><span class="lab">Heute</span><b>${fmt.format(today)}</b></div><div><span class="lab">Letzte 7 Tage</span><b>${fmt.format(week)}</b></div><div><span class="lab">Letzte 30 Tage</span><b>${fmt.format(total)}</b></div></div>` +
    `<div class="sbars" role="img" aria-label="Seitenaufrufe der letzten 30 Tage">${list.map(([d, n]) => `<i style="height:${Math.max(2, n / max * 100)}%" title="${d.split('-').reverse().join('.')}: ${n}"></i>`).join('')}</div>` +
    `<p class="note">Seitenaufrufe pro Tag, letzte 30 Tage (höchster Tag: ${fmt.format(max)}).</p>` +
    `<div class="two"><div><h3 class="h3">Herkunft</h3><ul class="slist">${Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<li><span>${SRC[k] || k}</span><b>${fmt.format(n)}</b></li>`).join('') || '<li class="note">noch keine Daten</li>'}</ul></div>` +
    `<div><h3 class="h3">Meistgeöffnete Gipfel</h3><ul class="slist">${top.map(([id, n]) => { const i = indexOfId(+id); return `<li><span>${i >= 0 ? esc(D.peaks.n[i]) : id}</span><b>${fmt.format(n)}</b></li>`; }).join('') || '<li class="note">noch keine Daten</li>'}</ul></div></div>` +
    `<p class="note">Gezählt wird jeder Seitenaufruf, ohne Cookies und ohne Wiedererkennung. Mehrere Aufrufe derselben Person zählen deshalb mehrfach. Deine eigenen Aufrufe zählen nicht, solange du mit diesem Konto angemeldet bist. Die Herkunft fehlt oft, wenn jemand den Link in der TikTok-App öffnet; dann steht er unter „direkt“.</p>`;
  loadFeedback(box); loadReports(box);
}
function initAccount() {
  if (!HOSTED || !window.supabase) return;
  sb = window.supabase.createClient(SB_URL, SB_KEY);
  sb.auth.onAuthStateChange((event, session) => {
    const user = session ? session.user : null, changed = (user && user.id) !== (sbUser && sbUser.id);
    sbUser = user;
    if (event === 'PASSWORD_RECOVERY') { acctMode = 'newpass'; acctMsg = ''; setTimeout(() => showProfile(), 0); }
    if (user && changed) setTimeout(pullBook, 0);
    if (changed) { refreshAccount(); if (!$('bookpanel').hidden) showBook(); if (pageMode === 'home') renderHome(); }
  });
}
function setSync(text) { syncMsg = text; if ($('syncmsg')) $('syncmsg').textContent = text; }
async function pullBook() {
  const user = sbUser; if (!user) return;
  setSync('Gipfelbuch wird geladen …');
  const { data, error } = await sb.from('gipfelbuch').select('data').eq('user_id', user.id).maybeSingle();
  if (error) return setSync('Das Gipfelbuch konnte nicht vom Konto geladen werden. Deine Einträge bleiben in diesem Browser.');
  const remote = data && data.data && data.data.done && data.data.wish ? data.data : null;
  let merged = false; try { merged = localStorage.getItem(SYNC_KEY) === user.id; } catch (err) { /* treat as first sign-in */ }
  if (merged) { if (remote) book = remote; }        // this browser was synced before: the account is the truth
  else {                                            // first sign-in here: bring this browser's entries into the account
    book = { done: Object.assign({}, remote ? remote.done : {}, book.done), wish: Object.assign({}, remote ? remote.wish : {}, book.wish) };
    try { localStorage.setItem(SYNC_KEY, user.id); } catch (err) { /* merges again next time, which is harmless */ }
    await pushBook();
  }
  storeBook(); setSync('Gespeichert im Konto.');
  apply(); if (selected >= 0) renderBookRow(selected); if (!$('bookpanel').hidden) showBook(); refreshAccount(); if (pageMode === 'home') renderHome();
}
async function pushBook() {
  if (!sbUser) return;
  const { error } = await sb.from('gipfelbuch').upsert({ user_id: sbUser.id, data: book, updated_at: new Date().toISOString() });
  setSync(error ? 'Die Änderung konnte nicht im Konto gespeichert werden. Sie bleibt in diesem Browser.' : 'Gespeichert im Konto.');
}
// Account forms: sign in (e-mail + password), register (user name, e-mail, password), confirm by e-mailed code, reset password by code.
let acctMode = 'login', acctMail = '', acctMsg = '';
const privacyHint = () => window.AG_LEGAL ? ` Mit dem Anlegen akzeptierst du die <a href="${ROOT}nutzungsbedingungen.html">Nutzungsbedingungen</a>. Was gespeichert wird, steht in der <a href="${ROOT}datenschutz.html">Datenschutzerklärung</a>.` : '';
function accountHtml() {
  if (!sb) return '';
  const head = `<h3 class="h3">Konto</h3>`, msg = `<p class="note" id="acctmsg" role="status">${esc(acctMsg)}</p>`;
  const mail = `<label>E-Mail-Adresse<input type="email" id="amail" autocomplete="email" required value="${esc(acctMail)}"></label>`;
  const sw = (mode, text) => `<button type="button" class="linkbtn" data-mode="${mode}">${text}</button>`;
  if (sbUser && acctMode === 'newpass') return `<form class="acct" id="acctform">${head}<p>Lege ein neues Passwort für dein Konto fest.</p>` +
    `<label>Neues Passwort (mindestens 8 Zeichen)<input type="password" id="apass" autocomplete="new-password" required minlength="8"></label>` +
    `<div class="links"><button type="submit" id="asubmit">Passwort speichern</button></div>${msg}</form>`;
  if (sbUser && acctMode === 'delete') return `<div class="acct">${head}<p><b>Konto wirklich löschen?</b> Dein Konto, dein Benutzername und dein gespeichertes Gipfelbuch werden sofort und endgültig gelöscht. Das lässt sich nicht rückgängig machen.</p>` +
    `<div class="links"><button type="button" id="delyes" class="danger">Endgültig löschen</button><button type="button" id="delno">Abbrechen</button></div>${msg}</div>`;
  if (sbUser) return `<div class="acct">${head}<p>Angemeldet als <b>${esc((sbUser.user_metadata && sbUser.user_metadata.username) || sbUser.email || '')}</b><small class="note"> · ${esc(sbUser.email || '')}</small></p>` +
    `<p class="note" id="syncmsg">${esc(syncMsg)}</p><div class="links"><button type="button" id="logout">Abmelden</button><button type="button" id="chpass">Passwort ändern</button><button type="button" id="delask">Konto löschen</button></div></div>`;
  if (acctMode === 'register') return `<form class="acct" id="acctform">${head}<p class="note">Lege ein Konto an, damit dein Gipfelbuch gespeichert bleibt und auf jedem Gerät dasselbe ist.${privacyHint()}</p>` +
    `<label>Benutzername<input type="text" id="aname" autocomplete="username" required minlength="3" maxlength="20" pattern="[A-Za-z0-9_.\-]{3,20}" title="3 bis 20 Zeichen: Buchstaben ohne Umlaute, Ziffern, Punkt, Binde- und Unterstrich"></label>${mail}` +
    `<label>Passwort (mindestens 8 Zeichen)<input type="password" id="apass" autocomplete="new-password" required minlength="8"></label>` +
    `<div class="links"><button type="submit" id="asubmit">Konto anlegen</button></div>${msg}<p class="note">Schon ein Konto? ${sw('login', 'Anmelden')}</p></form>`;
  if (acctMode === 'verify') return `<form class="acct" id="acctform">${head}<p>Wir haben eine E-Mail an <b>${esc(acctMail)}</b> geschickt. Öffne den Bestätigungslink darin auf diesem Gerät, dann bist du angemeldet.</p>` +
    `<p class="note">Keine E-Mail bekommen? Sieh im Spam-Ordner nach. Der Versand kann ein paar Minuten dauern und ist auf wenige E-Mails pro Stunde begrenzt.</p>` +
    `<label>Nur falls die E-Mail einen Code enthält<input type="text" id="acode" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9]{6,8}" maxlength="8"></label>` +
    `<div class="links"><button type="submit" id="asubmit">Code bestätigen</button><button type="button" id="aresend">E-Mail erneut senden</button></div>${msg}<p class="note">${sw('login', 'Zurück zur Anmeldung')}</p></form>`;
  if (acctMode === 'forgot') return `<form class="acct" id="acctform">${head}<p class="note">Gib deine E-Mail-Adresse ein. Du bekommst eine E-Mail, mit der du ein neues Passwort festlegst.</p>${mail}` +
    `<div class="links"><button type="submit" id="asubmit">Code senden</button></div>${msg}<p class="note">${sw('login', 'Zurück zur Anmeldung')}</p></form>`;
  if (acctMode === 'reset') return `<form class="acct" id="acctform">${head}<p>Wir haben eine E-Mail an <b>${esc(acctMail)}</b> geschickt. Öffne den Link darin auf diesem Gerät und lege dann das neue Passwort fest. Die Felder unten brauchst du nur, falls die E-Mail einen Code enthält.</p>` +
    `<label>Code aus der E-Mail<input type="text" id="acode" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9]{6,8}" maxlength="8"></label>` +
    `<label>Neues Passwort (mindestens 8 Zeichen)<input type="password" id="apass" autocomplete="new-password" required minlength="8"></label>` +
    `<div class="links"><button type="submit" id="asubmit">Passwort ändern</button></div>${msg}<p class="note">${sw('login', 'Zurück zur Anmeldung')}</p></form>`;
  return `<form class="acct" id="acctform">${head}<p class="note">Melde dich an, damit dein Gipfelbuch gespeichert bleibt und auf jedem Gerät dasselbe ist.</p>${mail}` +
    `<label>Passwort<input type="password" id="apass" autocomplete="current-password" required></label>` +
    `<div class="links"><button type="submit" id="asubmit">Anmelden</button></div>${msg}<p class="note">Noch kein Konto? ${sw('register', 'Konto anlegen')} · ${sw('forgot', 'Passwort vergessen')}</p></form>`;
}
function wireAccount() {
  const go = (mode, text) => { acctMode = mode; acctMsg = text || ''; refreshAccount(); };
  const say = text => { acctMsg = text; if ($('acctmsg')) $('acctmsg').textContent = text; };
  const tooMany = err => err && err.status === 429 ? 'Zu viele Versuche: Der E-Mail-Versand ist gerade gesperrt. Warte bis zu einer Stunde und versuch es dann noch einmal.' : '';
  if ($('logout')) $('logout').onclick = async () => {
    clearTimeout(pushTimer); await pushBook(); await sb.auth.signOut();
    book = { done: {}, wish: {} }; storeBook(); try { localStorage.removeItem(SYNC_KEY); } catch (err) { /* nothing to forget */ }
    syncMsg = ''; acctMode = 'login'; acctMsg = ''; apply(); refreshAccount();
  };
  if ($('delask')) $('delask').onclick = () => go('delete');
  if ($('chpass')) $('chpass').onclick = () => go('newpass');
  if ($('delno')) $('delno').onclick = () => go('login');
  if ($('delyes')) $('delyes').onclick = async () => {
    $('delyes').disabled = true; clearTimeout(pushTimer);
    const { error } = await sb.rpc('konto_loeschen');
    if (error) { $('delyes').disabled = false; return say('Das Konto konnte nicht gelöscht werden. Versuch es noch einmal oder schreib an die Adresse im Impressum.'); }
    await sb.auth.signOut({ scope: 'local' });
    book = { done: {}, wish: {} }; storeBook(); try { localStorage.removeItem(SYNC_KEY); } catch (err) { /* nothing to forget */ }
    syncMsg = ''; acctMode = 'login'; acctMsg = 'Dein Konto und dein Gipfelbuch wurden gelöscht.'; apply(); refreshAccount();
  };
  document.querySelectorAll('#page .acct .linkbtn').forEach(btn => { btn.onclick = () => { if ($('amail')) acctMail = $('amail').value.trim(); go(btn.dataset.mode); }; });
  if ($('aresend')) $('aresend').onclick = async () => {
    const { error } = await sb.auth.resend({ type: 'signup', email: acctMail, options: { emailRedirectTo: location.origin + ROOT } });
    say(error ? tooMany(error) || 'Die E-Mail konnte nicht gesendet werden. Versuch es später noch einmal.' : 'Eine neue E-Mail ist unterwegs.');
  };
  if (!$('acctform')) return;
  $('acctform').onsubmit = async ev => {
    ev.preventDefault();
    const val = id => $(id) ? $(id).value.trim() : '';
    if ($('amail')) acctMail = val('amail');
    const btn = $('asubmit'); btn.disabled = true; say('Einen Moment …');
    try {
      if (acctMode === 'newpass') {
        const { error } = await sb.auth.updateUser({ password: $('apass').value });
        if (error) return say('Das Passwort wurde nicht gespeichert. Es muss mindestens 8 Zeichen haben.');
        return go('login');
      }
      if (acctMode === 'register') {
        const name = val('aname');
        const free = await sb.rpc('username_frei', { name });
        if (free.error) return say('Die Anmeldung ist noch nicht fertig eingerichtet. Versuch es später noch einmal.');
        if (!free.data) return say('Dieser Benutzername ist schon vergeben. Wähle einen anderen.');
        const { data, error } = await sb.auth.signUp({ email: acctMail, password: $('apass').value, options: { data: { username: name }, emailRedirectTo: location.origin + ROOT } });
        if (error) return say(tooMany(error) || (/password/i.test(error.message) ? 'Das Passwort ist zu schwach. Nimm mindestens 8 Zeichen.' : 'Das Konto konnte nicht angelegt werden. Prüfe Benutzername und E-Mail-Adresse.'));
        // Supabase answers a sign-up for an address that already has an account with a user without identities, and sends no e-mail
        if (data && data.user && data.user.identities && !data.user.identities.length) return go('login', 'Für diese E-Mail-Adresse gibt es schon ein Konto. Melde dich an oder wähle „Passwort vergessen“.');
        if (data && data.session) { acctMode = 'login'; acctMsg = ''; return; }
        return go('verify');
      }
      if (acctMode === 'verify') {
        const { error } = await sb.auth.verifyOtp({ email: acctMail, token: val('acode'), type: 'email' });
        if (error) return say(tooMany(error) || 'Der Code stimmt nicht oder ist abgelaufen. Fordere einen neuen an.');
        acctMode = 'login'; acctMsg = ''; return;        // signed in: the panel redraws through onAuthStateChange
      }
      if (acctMode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(acctMail, { redirectTo: location.origin + ROOT });
        if (error) return say(tooMany(error) || 'Der Code konnte nicht gesendet werden. Prüfe die Adresse.');
        return go('reset');
      }
      if (acctMode === 'reset') {
        const pass = $('apass').value, v = await sb.auth.verifyOtp({ email: acctMail, token: val('acode'), type: 'recovery' });
        if (v.error) return say(tooMany(v.error) || 'Der Code stimmt nicht oder ist abgelaufen.');
        const u = await sb.auth.updateUser({ password: pass });
        acctMode = 'login'; acctMsg = '';
        if (u.error) say('Du bist angemeldet, aber das neue Passwort wurde nicht gespeichert. Es muss mindestens 8 Zeichen haben.');
        return;
      }
      const { error } = await sb.auth.signInWithPassword({ email: acctMail, password: $('apass').value });
      if (error && /not confirmed/i.test(error.message)) { await sb.auth.resend({ type: 'signup', email: acctMail }); return go('verify', 'Deine E-Mail-Adresse ist noch nicht bestätigt. Wir haben dir einen neuen Code geschickt.'); }
      if (error) return say(tooMany(error) || 'E-Mail-Adresse oder Passwort stimmen nicht.');
      acctMsg = '';
    } finally { if ($('asubmit')) $('asubmit').disabled = false; }
  };
}
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
  if (pageMode) explore();
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
  const empty = !doneIdx.length && !wishN;
  el.innerHTML = `<button class="back" id="bookback" type="button">← Zurück</button><div><h2>Gipfelbuch</h2></div>` +
    (empty ? `<div class="emptybox"><h3>Dein Gipfelbuch ist noch leer</h3><p>Öffne einen Gipfel und tippe auf „Als bestiegen eintragen“. Gipfel, die du noch vorhast, setzt du auf die Wunschliste.</p>` +
      `<p>Hier siehst du dann deine Statistik: deinen höchsten Gipfel, die Höhenmeter und wie viele Dreitausender du schon hast.</p><div class="links"><button type="button" id="bex1">Zugspitze öffnen</button><button type="button" id="bex2">Gipfel entdecken</button></div></div>` : '') +
    (empty ? '' :     `<div class="summit"><span class="big">${fmt.format(doneIdx.length)}</span><span class="unit">Gipfel bestiegen</span>` +
    `<span class="rank">${wishN} auf der<br>Wunschliste</span></div>` +
    (doneIdx.length ? `<dl class="facts"><dt>Höchster</dt><dd>${top >= 0 ? esc(P.n[top]) + ', ' + fmt.format(P.e[top]) + ' m' : '–'}</dd>` +
      `<dt>Höhenmeter</dt><dd>${fmt.format(withEle.reduce((s, i) => s + P.e[i], 0))} m Gipfelhöhe zusammengezählt</dd>` +
      `<dt>Gebiete</dt><dd>${countries.size} ${countries.size === 1 ? 'Land' : 'Länder'}, ${groups.size} ${groups.size === 1 ? 'Gebirgsgruppe' : 'Gebirgsgruppen'}</dd></dl>`
      : `<p class="note">Noch kein Eintrag. Öffne einen Gipfel und wähle „Als bestiegen eintragen“ oder „Auf die Wunschliste“.</p>`) +
    `<div class="prog">${BANDS.map((b, k) => `<div><span>${b[3]} m</span><span class="bar"><i style="width:${total[k] ? Math.max(got[k] ? 2 : 0, got[k] / total[k] * 100) : 0}%;background:var(${b[2]})"></i></span><span>${fmt.format(got[k])} von ${fmt.format(total[k])}</span></div>`).join('')}</div>` +
    (recent.length ? `<div><h3 class="h3">Zuletzt eingetragen</h3><ul class="rts">${recent.map(i => `<li><a href="${HOSTED ? peakUrl(i) : '#'}" data-i="${i}">${esc(P.n[i])}</a> · ${dateDe(book.done[P.id[i]])}</li>`).join('')}</ul></div>` : '')) +
    `<div class="links">${empty ? '' : '<button type="button" id="bshowdone">Bestiegene in der Liste zeigen</button><button type="button" id="bshowwish">Wunschliste zeigen</button>'}` +
    (HOSTED ? `<button type="button" id="bexport">Sichern (Datei)</button><button type="button" id="bimport">Wiederherstellen</button><input type="file" id="bfile" accept="application/json,.json" hidden>` : '') + `</div>` +
    `<div class="acct"><h3 class="h3">Konto</h3><p class="note">${sbUser ? 'Angemeldet als ' + esc((sbUser.user_metadata && sbUser.user_metadata.username) || sbUser.email || '') + '.' : 'Mit einem Konto bleibt dein Gipfelbuch gespeichert und ist auf jedem Gerät dasselbe.'}</p><div class="links"><button type="button" id="toprofile">${sbUser ? 'Zum Profil' : 'Anmelden oder Konto anlegen'}</button></div></div>` +
    `<p class="note" id="bookmsg">${sbUser ? 'Dein Gipfelbuch liegt in deinem Konto und zusätzlich in diesem Browser.' : 'Ohne Anmeldung wird das Gipfelbuch nur in diesem Browser auf diesem Gerät gespeichert.'}${HOSTED ? ' Mit „Sichern“ kannst du es als Datei ablegen und auf einem anderen Gerät wiederherstellen.' : ''}</p>`;
  el.hidden = false; el.scrollTop = 0; setView('list'); markNav();
  $('bookback').onclick = () => { el.hidden = true; markNav(); };
  if ($('bex1')) { $('bex1').onclick = () => { const k = indexOfId(27384190); if (k >= 0) { el.hidden = true; markNav(); showDetail(k, false); } }; $('bex2').onclick = () => showHome(); }
  $('toprofile').onclick = () => showProfile();
  const show = v => { el.hidden = true; markNav(); if (selected >= 0) closeDetail(); $('book').value = v; apply(); fitToFilter(); };
  if ($('bshowdone')) { $('bshowdone').onclick = () => show('done'); $('bshowwish').onclick = () => show('wish'); }
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
  if (MOBILE()) setSheet(v === 'map' ? 'peek' : 'full');
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
  $('map').setAttribute('role', 'application'); $('map').setAttribute('aria-label', 'Karte der Gipfel, Hütten und Wege. Alle Gipfel sind auch über die Liste erreichbar.');
  map = L.map('map', { preferCanvas: true, zoomSnap: 0.5, minZoom: 5, maxZoom: 17, maxBounds: [[35, -4], [52, 26]] }).fitBounds(ALPS_BOUNDS);
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
      this._huts = [];
      if (GEO && GEO.huts && showHuts && z >= 9.5) {  // huts: small squares, names once zoomed in
        ctx.fillStyle = cssColors['--hut']; ctx.strokeStyle = cssColors['--surface']; ctx.lineWidth = 1.5;
        const hs = z >= 12 ? 4.5 : 3.2, named = [];
        GEO.huts.forEach((h, k) => {
          if (h[1] < s || h[1] > n || h[0] < w || h[0] > e) return;
          const p = m.latLngToContainerPoint([h[1], h[0]]);
          ctx.beginPath(); ctx.rect(p.x - hs, p.y - hs, hs * 2, hs * 2); ctx.fill(); ctx.stroke();
          this._huts.push([p.x, p.y, k]); if (z >= 14 && named.length < 24) named.push([p.x, p.y, h[2]]);
        });
        ctx.font = '500 11.5px "Barlow", system-ui, sans-serif';
        named.forEach(([x, y, t]) => label(ctx, t, x, y + hs + 12, cssColors['--hut']));
      }
      if (selected >= 0 && startPts.length && z >= 9) {   // car parks and stops of the open summit
        ctx.font = '700 10.5px "Barlow", system-ui, sans-serif'; ctx.lineWidth = 1.5; ctx.strokeStyle = cssColors['--surface'];
        for (const [name, dist, la, lo, kind] of startPts) {
          const p = m.latLngToContainerPoint([la, lo]);
          ctx.fillStyle = cssColors[kind ? '--stop' : '--park'];
          ctx.beginPath(); ctx.rect(p.x - 7, p.y - 7, 14, 14); ctx.fill(); ctx.stroke();
          ctx.fillStyle = cssColors['--surface']; ctx.fillText(kind ? 'H' : 'P', p.x, p.y + 3.8);
          if (z >= 13.5 && name) { ctx.font = '500 11.5px "Barlow", system-ui, sans-serif'; label(ctx, name, p.x, p.y + 20, cssColors[kind ? '--stop' : '--park']); ctx.font = '700 10.5px "Barlow", system-ui, sans-serif'; ctx.lineWidth = 1.5; ctx.strokeStyle = cssColors['--surface']; }
        }
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
    nearestHut(pt, maxd) {
      let best = -1, bd = maxd * maxd;
      for (const [x, y, k] of this._huts || []) { const d = (x - pt.x) ** 2 + (y - pt.y) ** 2; if (d < bd) { bd = d; best = k; } }
      return best;
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
  map.createPane('hi').style.zIndex = 420; const hiRenderer = L.canvas({ pane: 'hi' });   // highlighted route above all paths
  hiLayer.addLayer = (orig => function (l) { if (l.options) { l.options.renderer = hiRenderer; l.options.pane = 'hi'; } return orig.call(this, l); })(hiLayer.addLayer);
  peakLayer = new PeakLayer().addTo(map);
  const tip = $('tip');
  map.on('click', ev => {
    const i = peakLayer.nearest(ev.containerPoint, 14);
    if (i >= 0) return showDetail(i, true);
    const k = peakLayer.nearestHut(ev.containerPoint, 12);
    if (k < 0) return;
    const h = GEO.huts[k], osm = { n: 'node', w: 'way', r: 'relation' }[h[5][0]] + '/' + h[5].slice(1);
    L.popup().setLatLng([h[1], h[0]]).setContent(`<b>${esc(h[2])}</b><br>${h[3] ? fmt.format(h[3]) + ' m · ' : ''}${h[4] ? 'Biwak oder Selbstversorgerhütte' : 'Berghütte'}<br>` +
      `<a href="https://www.openstreetmap.org/${osm}" target="_blank" rel="noopener">OpenStreetMap</a>${h[6] ? ` · <a href="${esc(h[6])}" target="_blank" rel="noopener">Website</a>` : ''}`).openOn(map);
  });
  map.on('mousemove', ev => {
    const i = peakLayer.nearest(ev.containerPoint, 9);
    $('map').style.cursor = i >= 0 ? 'pointer' : '';
    const k = i < 0 ? peakLayer.nearestHut(ev.containerPoint, 9) : -1;
    if (k >= 0) $('map').style.cursor = 'pointer';
    if (i < 0 && k < 0) { tip.hidden = true; return; }
    tip.textContent = i >= 0 ? D.peaks.n[i] + (D.peaks.e[i] != null ? ` · ${fmt.format(D.peaks.e[i])} m` : '') : GEO.huts[k][2] + (GEO.huts[k][3] ? ` · ${fmt.format(GEO.huts[k][3])} m` : '') + ' (Hütte)';
    tip.style.left = ev.containerPoint.x + 'px'; tip.style.top = ev.containerPoint.y + 'px'; tip.hidden = false;
  });
  map.on('mouseout movestart', () => { tip.hidden = true; });
  const restyle = () => { if (pageMode === 'home') drawHero(); readColors(); const s2 = baseStyle(); for (const k in layers) if (map.hasLayer(layers[k])) layers[k].setStyle(s2[k]); peakLayer.redraw(); renderList(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restyle);
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/* ---------- boot ---------- */
async function boot() {
  readColors();
  try {
    const inP = $('data-peaks'), inG = $('data-geo');   // the single-file build carries the data inline
    if (inP) { D = JSON.parse(inP.textContent); GEO = inG ? JSON.parse(inG.textContent) : null; inlineDetails = JSON.parse($('data-details').textContent); }
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
  if ($('openfb')) $('openfb').addEventListener('click', () => openFeedback());
  $('navhome').addEventListener('click', () => showHome()); $('navstart').addEventListener('click', () => showHome());
  $('ftoggle').onclick = () => { const f = $('filters'), open = !f.classList.contains('open'); f.classList.toggle('open', open); $('ftoggle').setAttribute('aria-expanded', String(open)); if (open && MOBILE()) setSheet('full'); };
  let legOpen = !MOBILE(); try { const v = localStorage.getItem('alpengipfel.legende'); if (v) legOpen = v === '1'; } catch (err) { /* default */ }
  const setLeg = open => { legOpen = open; $('legendbox').dataset.open = String(open); $('legtoggle').setAttribute('aria-expanded', String(open)); };
  setLeg(legOpen); $('legtoggle').onclick = () => { setLeg(!legOpen); try { localStorage.setItem('alpengipfel.legende', legOpen ? '1' : '0'); } catch (err) { /* not remembered */ } };
  initSheet(); $('navexp').addEventListener('click', () => explore()); $('openprofile').addEventListener('click', () => showProfile());
  $('v3close').addEventListener('click', close3d);
  $('huts').checked = showHuts;
  $('huts').addEventListener('change', () => { showHuts = $('huts').checked; try { localStorage.setItem('alpengipfel.huts', showHuts ? '1' : '0'); } catch (err) { /* not remembered */ } if (map) map.closePopup(); if (peakLayer) peakLayer.redraw(); });
  $('reset').addEventListener('click', () => {
    ['q', 'hmin', 'hmax'].forEach(k => $(k).value = ''); $('country').value = ''; fillStates(); $('state').value = ''; $('group').value = ''; $('kind').value = ''; $('book').value = ''; $('radius').value = '';
    apply(); if (map) map.fitBounds([[43.4, 5.0], [48.4, 16.6]]);
  });
  let raf = 0;
  $('list').addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; renderList(); }); });
  $('list').addEventListener('click', ev => { const b = ev.target.closest('.row'); if (b) showDetail(+b.dataset.i, false); });
  addEventListener('resize', () => { renderList(); if (pageMode === 'home') drawHero(); });
  $('tab-list').onclick = () => setView('list');
  $('tab-map').onclick = () => setView('map');
  apply();
  $('loading').hidden = true;
  initAccount();
  if (HOSTED) countVisit();
  if (HOSTED) { addEventListener('popstate', route); route(); } else showHome(true);
  if (HOSTED && 'serviceWorker' in navigator) navigator.serviceWorker.register(ROOT + 'sw.js').catch(() => { /* the app works without it */ });
  if (window.AG_LEGAL) { $('foot').hidden = false; $('foot').innerHTML = `${window.AG_SUPPORT ? `<a class="support" href="${esc(window.AG_SUPPORT)}" target="_blank" rel="noopener">Unterstützen</a>` : ''}<button type="button" class="linkbtn" id="footfb">Feedback</button><a href="${ROOT}impressum.html">Impressum</a><a href="${ROOT}datenschutz.html">Datenschutz</a><a href="${ROOT}nutzungsbedingungen.html">Nutzungsbedingungen</a><span>Daten: © OpenStreetMap-Mitwirkende, Camptocamp, Open-Meteo</span>`; $('footfb').onclick = () => openFeedback(); }
}
boot();
})();
