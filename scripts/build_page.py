"""Assemble the site from src/ and docs/data/peaks.json.

Writes
  docs/assets/app.css, docs/assets/app.js   shared by every page
  docs/index.html                           the app
  docs/gipfel/<name>-<osm id>.html          one page per summit (static facts for search engines, then the app takes over)
  docs/sitemap.xml
  dist/artifact.html                        single-file variant with everything inline
"""
import glob, html, json, os, re, shutil, sys, unicodedata
sys.path.insert(0, 'scripts')
import legal

SITE_URL = 'https://alpen-gipfel.de/'      # public address of docs/ (used for canonical links and the sitemap)
# The hosted site serves fonts and libraries itself (src/vendor), so visitors' browsers contact no third party for them.
# Only the single-file variant loads them from these addresses.
LEAFLET = '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>'
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600&display=swap">'

leaflet_css = re.sub(r'/\*.*?\*/', '', open('src/leaflet.css').read(), flags=re.S)
leaflet_css = re.sub(r'[^{}]*\{[^{}]*url\(images/[^{}]*\}', '', leaflet_css)     # drop rules that need image files we do not ship
css = leaflet_css.strip() + '\n' + open('src/app.css').read()
shell = open('src/shell.html').read()
js = open('src/app.js').read().replace("/*__SHELL__*/''", json.dumps(shell, ensure_ascii=False).replace('</', '<\\/'))
assert '__SHELL__' not in js

os.makedirs('docs/assets', exist_ok=True); os.makedirs('dist', exist_ok=True)
open('docs/assets/app.css', 'w').write(css)
open('docs/assets/app.js', 'w').write(js)

# vendored libraries and fonts
for f in ('leaflet.js', 'supabase.js', 'maplibre-gl.js', 'maplibre-gl.css'): shutil.copy(f'src/vendor/{f}', f'docs/assets/{f}')
os.makedirs('docs/assets/fonts', exist_ok=True)
faces = []
for f in sorted(glob.glob('src/vendor/fonts/*.woff2')):
    shutil.copy(f, 'docs/assets/fonts/')
    name = os.path.basename(f); fam, subset, weight = re.match(r'(barlow(?:-condensed)?)-(latin(?:-ext)?)-(\d+)-normal', name).groups()
    urange = ('U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' if subset == 'latin-ext'
              else 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD')
    faces.append(f"@font-face{{font-family:'{'Barlow Condensed' if 'condensed' in fam else 'Barlow'}';font-style:normal;font-weight:{weight};font-display:swap;src:url(fonts/{name}) format('woff2');unicode-range:{urange}}}")
open('docs/assets/fonts.css', 'w').write('\n'.join(faces) + '\n')

# Impressum and Datenschutzerklärung exist once the operator's details are in src/legal.json
LEGAL = json.load(open('src/legal.json')) if os.path.exists('src/legal.json') else None
def legal_page(title, body):
    return ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>{title} – Alpengipfel</title>\n<meta name="robots" content="noindex">\n<link rel="stylesheet" href="assets/fonts.css">\n<link rel="stylesheet" href="assets/app.css">\n'
            '<script>try{var t=localStorage.getItem(\'alpengipfel.theme\');if(t)document.documentElement.setAttribute(\'data-theme\',t)}catch(e){}</script>\n'
            '<style>html{color-scheme:light}body{margin:0}</style>\n</head>\n<body>\n'
            f'<article class="static legal"><p><a href="./">← Alpengipfel</a></p>{body}</article>\n</body>\n</html>\n')
for name, title in (('impressum', 'Impressum'), ('datenschutz', 'Datenschutzerklärung'), ('nutzungsbedingungen', 'Nutzungsbedingungen')):
    if LEGAL: open(f'docs/{name}.html', 'w').write(legal_page(title, getattr(legal, name)(LEGAL)))
    elif os.path.exists(f'docs/{name}.html'): os.remove(f'docs/{name}.html')

D = json.load(open('docs/data/peaks.json'))
P = D['peaks']; N = len(P['n'])
details = [json.load(open(f'docs/data/d/{c}.json')) for c in range((N + D['meta']['chunk'] - 1) // D['meta']['chunk'])]
for key in details[0]: P[key] = [v for ch in details for v in ch[key]]      # full columns for the static summit pages
E = html.escape
num = lambda v: f'{v:,}'.replace(',', '.')
lst = lambda v: [] if v in (-1, None) else (v if isinstance(v, list) else [v])

def slug(i):
    """Must match slug() in src/app.js."""
    s = unicodedata.normalize('NFD', P['n'][i].lower())
    s = re.sub('[̀-ͯ]', '', s).replace('ß', 'ss')
    s = re.sub('[^a-z0-9]+', '-', s)[:60].strip('-')
    return f"{s or 'gipfel'}-{P['id'][i]}"

def page(base, title, desc, canonical, static, extra_head='', peak=None):
    boot = f"<script>window.AG_BASE={json.dumps(base)};" + (f"window.AG_PEAK={peak};" if peak else '') + ('window.AG_LEGAL=1;' if LEGAL else '') + (f"window.AG_SUPPORT={json.dumps(LEGAL['support_url'])};" if LEGAL and LEGAL.get('support_url') else '') + "</script>"
    return ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n<link rel="canonical" href="{canonical}">\n'
            f'<meta property="og:title" content="{E(title)}">\n<meta property="og:description" content="{E(desc)}">\n{extra_head}'
            '<script>try{var t=localStorage.getItem(\'alpengipfel.theme\');if(t)document.documentElement.setAttribute(\'data-theme\',t)}catch(e){}</script>\n'
            f'<link rel="manifest" href="{base}manifest.webmanifest">\n<meta name="theme-color" content="#1d2623">\n<link rel="apple-touch-icon" href="{base}assets/icon-180.png">\n<link rel="icon" href="{base}assets/icon-192.png">\n'
            f'<link rel="stylesheet" href="{base}assets/fonts.css">\n<link rel="stylesheet" href="{base}assets/app.css">\n'
            '<style>html{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
            f'<div id="app-root" style="height:100%">{static}</div>\n<script src="{base}assets/leaflet.js"></script>\n<script src="{base}assets/supabase.js"></script>\n{boot}\n<script src="{base}assets/app.js"></script>\n</body>\n</html>\n')

intro = ('<article class="static"><h1>Alpengipfel</h1>'
         f'<p>Alle {num(N)} benannten Gipfel der Alpen aus OpenStreetMap: filterbar nach Höhe, Land, Bundesland und Gebirgsgruppe, '
         'mit Karte, Wanderrouten, Gipfelbuch und Bergwetter für jeden Gipfel.</p></article>')
open('docs/index.html', 'w').write(page('', 'Alpengipfel', f'Alle {num(N)} benannten Gipfel der Alpen mit Karte, Höhe, Lage, Routen und Bergwetter.', SITE_URL, intro))

# ---------- summit pages with readable content, and overview pages (mountain groups, countries, regions, lists) ----------
import math
for d in ('gebirge', 'land', 'region', 'listen'): shutil.rmtree('docs/' + d, ignore_errors=True)
GEO = json.load(open('docs/data/geo.json'))
KINDS = ['Wandern', 'Hochalpin', 'Klettersteig', 'Skitour']
SACN = {1: 'T1', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6'}
C2C_ACTS = D.get('c2cActs', [])
def plain(s):
    s = unicodedata.normalize('NFD', s.lower()); s = re.sub('[̀-ͯ]', '', s).replace('ß', 'ss')
    return re.sub('[^a-z0-9]+', '-', s).strip('-')[:70] or 'x'
def km_between(a1, o1, a2, o2):
    return math.hypot((o2 - o1) * 111.32 * math.cos(math.radians((a1 + a2) / 2)), (a2 - a1) * 110.57)
# spatial grid for neighbours and huts
cell = lambda la, lo: (int(la * 10), int(lo * 10))
grid = {}
for i in range(N): grid.setdefault(cell(P['la'][i], P['lo'][i]), []).append(i)
hgrid = {}
for k, h in enumerate(GEO.get('huts', [])): hgrid.setdefault(cell(h[1], h[0]), []).append(k)
def near(la, lo, g, r):
    a, b = cell(la, lo)
    for x in range(a - r, a + r + 1):
        for y in range(b - r, b + r + 1): yield from g.get((x, y), [])
# ranks: overall and within the mountain group
order = sorted([i for i in range(N) if P['e'][i] is not None], key=lambda i: -P['e'][i])
rank = {i: k + 1 for k, i in enumerate(order)}
gmembers = {}
for i in range(N):
    for g in lst(P['g'][i]): gmembers.setdefault(g, []).append(i)
for g in gmembers: gmembers[g].sort(key=lambda i: -(P['e'][i] or -1))
grank = {(g, i): k + 1 for g, m in gmembers.items() for k, i in enumerate(m)}
gslug = {g: plain(D['groups'][g]['n']) for g in gmembers}
cslug = {c: plain(D['countries'][c]['n']) for c in range(len(D['countries']))}
sslug = {s: plain(D['states'][s]['n']) for s in range(len(D['states']))}
gl = lambda g, base: f'<a href="{base}gebirge/{gslug[g]}.html">{E(D["groups"][g]["n"])}</a>'
cl = lambda c, base: f'<a href="{base}land/{cslug[c]}.html">{E(D["countries"][c]["n"])}</a>'
sl = lambda s, base: f'<a href="{base}region/{sslug[s]}.html">{E(D["states"][s]["n"])}</a>'
pl = lambda i, base: f'<a href="{base}gipfel/{slug(i)}.html">{E(P["n"][i])}</a>'
IN_LAND = {'Schweiz': 'in der Schweiz'}
in_land = lambda n: IN_LAND.get(n, 'in ' + n)
hm = lambda e: f'{num(e)} m' if e is not None else 'Höhe unbekannt'

def summit_html(i):
    name, ele, la, lo = P['n'][i], P['e'][i], P['la'][i], P['lo'][i]
    gs, cs, ss = lst(P['g'][i]), lst(P['c'][i]), lst(P['s'][i])
    out = [f'<h1>{E(name)}</h1>']
    crumbs = ['<a href="../">Alpen</a>'] + [cl(c, '../') for c in cs[:2]] + [sl(s, '../') for s in ss[:2]] + [gl(g, '../') for g in gs[:1]]
    out.append('<nav class="crumbs" aria-label="Lage">' + ' › '.join(crumbs) + '</nav>')
    # intro in sentences
    where = ('der Gebirgsgruppe ' + ' / '.join(D['groups'][g]['n'] for g in gs)) if gs else 'den Alpen'
    lands = ' / '.join(D['states'][s]['n'] for s in ss) or ', '.join(D['countries'][c]['n'] for c in cs)
    t = f'{E(name)} ist ein {hm(ele) + " hoher " if ele is not None else ""}Gipfel in {E(where)}' + (f' ({E(lands)})' if lands else '') + '.'
    if P['an'][i]: t += f' Er ist auch als {E(P["an"][i])} bekannt.'
    if ele is not None:
        t += f' Unter den {num(N)} benannten Gipfeln der Alpen steht er nach der Höhe auf Rang {num(rank[i])}'
        if gs and len(gmembers[gs[0]]) > 1:
            r = grank[(gs[0], i)]
            t += f', in der Gebirgsgruppe auf Rang {num(r)} von {num(len(gmembers[gs[0]]))}' + (' – er ist dort der höchste Gipfel' if r == 1 else '')
        t += '.'
    if P['p'][i]: t += f' Seine Schartenhöhe beträgt {num(P["p"][i])} m.'
    out.append(f'<p>{t}</p>')
    # routes
    rt, cc, ap, nr, fw = P['rt'][i] or [], P['cc'][i] or [], P['ap'][i] or [], P['nr'][i] or [], P['fw'][i] or []
    items = []
    for rel, rname, cat, grade, vf in rt:
        items.append(f'<li>{E(rname or "Markierte Route ohne Namen")} – markierte Route, {KINDS[cat]}' + (f', {SACN[grade]}' if grade in SACN else '') + (f', Klettersteig-Skala {E(vf)}' if vf else '') + '</li>')
    for cid, title, cat, act, rating, up in cc[:6]:
        items.append(f'<li>{E(title or "Route")} – {E(C2C_ACTS[act] if act < len(C2C_ACTS) else KINDS[cat])}' + (f', {E(rating)}' if rating else '') + (f', {num(up)} Hm' if up else '') + '</li>')
    named_paths = sorted({(n, cat, grade) for cat, grade, vf, n in ap if n})
    for n, cat, grade in named_paths[:4]: items.append(f'<li>{E(n)} – Weg, {KINDS[cat]}' + (f', {SACN[grade]}' if grade in SACN else '') + '</li>')
    if items:
        kinds = sorted({KINDS[x[2]] for x in rt} | {KINDS[x[2]] for x in cc} | {KINDS[x[0]] for x in ap})
        out.append(f'<h2>Wege und Routen auf {E(name)}</h2><p>Erfasst sind {len(rt) + len(cc) + len(ap)} Wege und Routen ({", ".join(kinds)}). '
                   'Auf alpen-gipfel.de berechnet die Karte den Aufstieg vom nächsten Parkplatz mit Höhenprofil, Gehzeit und GPX-Download.</p><ul>' + ''.join(items) + '</ul>')
    elif nr:
        out.append(f'<h2>Wege und Routen</h2><p>Bis auf den Gipfel ist kein Weg erfasst; der nächste Weg endet etwa {nr[0][0]} m entfernt. Der Gipfel ist vermutlich weglos.</p>')
    if fw: out.append(f'<p>Über den Gipfel führen auch Fernwanderwege: {E(", ".join(fw))}.</p>')
    # starting points
    pk, st = P['pk'][i] or [], P['st'][i] or []
    if pk or st:
        KIND = ['Parkplatz', 'Bushaltestelle', 'Bahnhof', 'Seilbahnstation']
        li = [f'<li>{E(n or KIND[k])} ({KIND[k] if n else "ohne Namen"}, {str(d).replace(".", ",")} km Luftlinie)</li>' for n, d, a, o, k in (pk + st)[:6]]
        out.append(f'<h2>Ausgangspunkte</h2><ul>{"".join(li)}</ul>')
    # huts
    hs = []
    for k in near(la, lo, hgrid, 1):
        h = GEO['huts'][k]; d = km_between(la, lo, h[1], h[0])
        if d <= 5 and h[2]: hs.append((d, h))
    hs.sort(key=lambda x: x[0])
    if hs: out.append(f'<h2>Hütten in der Nähe</h2><ul>' + ''.join(f'<li>{E(h[2])}' + (f', {num(h[3])} m' if h[3] else '') + f' – {str(round(d, 1)).replace(".", ",")} km Luftlinie</li>' for d, h in hs[:5]) + '</ul>')
    # neighbours
    nb = sorted(((km_between(la, lo, P['la'][j], P['lo'][j]), j) for j in near(la, lo, grid, 1) if j != i), key=lambda x: x[0])[:6]
    if nb: out.append(f'<h2>Gipfel in der Nähe</h2><ul>' + ''.join(f'<li>{pl(j, "../")} ({hm(P["e"][j])}, {str(round(d, 1)).replace(".", ",")} km)</li>' for d, j in nb) + '</ul>')
    out.append(f'<p>Koordinaten: {la:.5f}° N, {lo:.5f}° O. Bergwetter für die Gipfelhöhe, Karte, 3D-Ansicht und Gipfelbuch gibt es in der App.</p>')
    out.append('<p class="src">Daten: OpenStreetMap-Mitwirkende (ODbL)' + (', Routen: Camptocamp.org (CC BY-SA 3.0)' if cc else '') + '</p>')
    return '<article class="static seo">' + ''.join(out) + '</article>'

def hub_page(path, title, desc, body, depth=1):
    base = '../' * depth
    head = ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n<link rel="canonical" href="{SITE_URL}{path}">\n'
            f'<meta property="og:title" content="{E(title)}">\n<meta property="og:description" content="{E(desc)}">\n'
            '<script>try{var t=localStorage.getItem(\'alpengipfel.theme\');if(t)document.documentElement.setAttribute(\'data-theme\',t)}catch(e){}</script>\n'
            f'<link rel="icon" href="{base}assets/icon-192.png">\n<link rel="stylesheet" href="{base}assets/fonts.css">\n<link rel="stylesheet" href="{base}assets/app.css">\n'
            '<style>body{margin:0}</style>\n</head>\n<body class="hubbody">\n')
    top = (f'<header class="hubtop"><a class="brand" href="{base}"><img class="logo" src="{base}assets/icon-192.png" alt=""><span>Alpengipfel</span></a>'
           f'<nav><a href="{base}">Start</a><a href="{base}#karte">Karte</a><a href="{base}listen/viertausender.html">Viertausender</a><a href="{base}gebirge/">Gebirgsgruppen</a></nav></header>')
    foot = (f'<footer class="hubfoot"><a href="{base}gebirge/">Alle Gebirgsgruppen</a><a href="{base}land/">Länder</a>'
            + (f'<a href="{base}impressum.html">Impressum</a><a href="{base}datenschutz.html">Datenschutz</a>' if LEGAL else '') + '<span>Daten: © OpenStreetMap-Mitwirkende</span></footer>')
    os.makedirs(os.path.dirname('docs/' + path) or 'docs', exist_ok=True)
    open('docs/' + path, 'w').write(head + top + f'<main class="hub">{body}</main>' + foot + '\n</body>\n</html>\n')
    return SITE_URL + path

def peak_table(ids, base='../', show_group=True):
    rows = ''.join(f'<tr><td class="r">{k + 1}</td><td>{pl(i, base)}</td><td class="h">{hm(P["e"][i])}</td>'
                   + (f'<td>{E(" / ".join(D["groups"][g]["n"] for g in lst(P["g"][i])))}</td>' if show_group else f'<td>{E(" / ".join(D["states"][s]["n"] for s in lst(P["s"][i])))}</td>')
                   + f'<td class="k">{" ".join(KINDS[k][:1] for k in range(4) if P["k"][i] & (1 << k))}</td></tr>' for k, i in enumerate(ids))
    return (f'<table class="ptab"><thead><tr><th>#</th><th>Gipfel</th><th>Höhe</th><th>{"Gebirgsgruppe" if show_group else "Region"}</th><th title="W = Wandern, H = Hochalpin, K = Klettersteig, S = Skitour">Wege</th></tr></thead><tbody>{rows}</tbody></table>'
            '<p class="note">Wege: W = Wanderweg, H = hochalpin, K = Klettersteig, S = Skitour erfasst.</p>')
def app_cta(text, base='../'):
    return f'<p class="cta"><a class="ctab" href="{base}">{text}</a></p>'

hub_urls = []
# mountain groups
glist = sorted(gmembers, key=lambda g: D['groups'][g]['n'])
for g in glist:
    m = gmembers[g]; name = D['groups'][g]['n']; top = m[0]
    cs = sorted({c for i in m for c in lst(P['c'][i])}); ss = sorted({s for i in m for s in lst(P['s'][i])})
    n_w = sum(1 for i in m if P['k'][i] & 1); n_k = sum(1 for i in m if P['k'][i] & 4)
    body = (f'<nav class="crumbs"><a href="../">Alpen</a> › <a href="./">Gebirgsgruppen</a></nav><h1>{E(name)}: alle Gipfel nach Höhe</h1>'
            f'<p>Die Gebirgsgruppe {E(name)} umfasst {num(len(m))} benannte Gipfel.' + (f' Länder: {", ".join(cl(c, "../") for c in cs)}.' if cs else '') + ' '
            + (f'Der höchste ist {pl(top, "../")} mit {hm(P["e"][top])}. ' if P['e'][top] is not None else '')
            + f'Auf {num(n_w)} Gipfel führt ein Wanderweg (bis T3), {num(n_k)} haben einen Klettersteig.'
            + (f' Regionen: {", ".join(sl(s, "../") for s in ss)}.' if ss else '') + '</p>'
            + app_cta(f'{E(name)} auf der Karte öffnen') + f'<h2>Alle Gipfel nach Höhe</h2>' + peak_table(m[:1500], show_group=False))
    hub_urls.append(hub_page(f'gebirge/{gslug[g]}.html', f'{name}: alle {num(len(m))} Gipfel nach Höhe | Alpengipfel',
                             f'Alle {num(len(m))} Gipfel der Gebirgsgruppe {name}, sortiert nach Höhe, mit Wegen, Klettersteigen, Karte und Bergwetter. Höchster Gipfel: {P["n"][top]}.', body))
body = '<nav class="crumbs"><a href="../">Alpen</a></nav><h1>Gebirgsgruppen der Alpen</h1><p>Alle Gebirgsgruppen mit ihrer Gipfelzahl und dem höchsten Gipfel.</p><ul class="hublist">' + \
       ''.join(f'<li><a href="{gslug[g]}.html">{E(D["groups"][g]["n"])}</a><span>{num(len(gmembers[g]))} Gipfel · höchster: {E(P["n"][gmembers[g][0]])} {hm(P["e"][gmembers[g][0]])}</span></li>' for g in sorted(glist, key=lambda g: -len(gmembers[g]))) + '</ul>'
hub_urls.append(hub_page('gebirge/index.html', 'Gebirgsgruppen der Alpen | Alpengipfel', 'Alle Gebirgsgruppen der Alpen mit Gipfelzahl und höchstem Gipfel.', body))
# countries and regions
for kind, coll, slugs, key in (('land', D['countries'], cslug, 'c'), ('region', D['states'], sslug, 's')):
    mem = {}
    for i in order: [mem.setdefault(x, []).append(i) for x in lst(P[key][i])]
    for x, m in mem.items():
        name = coll[x]['n']; gs = {}
        for i in m:
            for g in lst(P['g'][i]): gs[g] = gs.get(g, 0) + 1
        body = (f'<nav class="crumbs"><a href="../">Alpen</a></nav><h1>Die Berge {E(in_land(name)) if kind == "land" else "der Region " + E(name)}</h1>'
                f'<p>{(E(in_land(name)) if kind == "land" else "in der Region " + E(name))[:1].upper() + (E(in_land(name)) if kind == "land" else "in der Region " + E(name))[1:]} liegen {num(len(m))} benannte Alpengipfel mit Höhenangabe. Der höchste ist {pl(m[0], "../")} ({hm(P["e"][m[0]])}).</p>'
                + app_cta('Auf der Karte öffnen') +
                '<h2>Gebirgsgruppen</h2><ul class="hublist">' + ''.join(f'<li>{gl(g, "../")}<span>{num(c)} Gipfel</span></li>' for g, c in sorted(gs.items(), key=lambda z: -z[1])) + '</ul>'
                + f'<h2>Die {min(300, len(m))} höchsten Gipfel</h2>' + peak_table(m[:300]))
        hub_urls.append(hub_page(f'{kind}/{slugs[x]}.html', f'Berge {in_land(name) if kind == "land" else "in " + name}: die höchsten Gipfel | Alpengipfel',
                                 f'Die höchsten Berge {in_land(name) if kind == "land" else "der Region " + name}: {num(len(m))} Alpengipfel nach Höhe, mit Gebirgsgruppen, Wegen und Klettersteigen.', body))
    if kind == 'land':
        body = '<nav class="crumbs"><a href="../">Alpen</a></nav><h1>Alpengipfel nach Land</h1><ul class="hublist">' + ''.join(f'<li><a href="{slugs[x]}.html">{E(coll[x]["n"])}</a><span>{num(len(m))} Gipfel</span></li>' for x, m in sorted(mem.items(), key=lambda z: -len(z[1]))) + '</ul>'
        hub_urls.append(hub_page('land/index.html', 'Alpengipfel nach Land | Alpengipfel', 'Die Gipfel der Alpen nach Ländern.', body))
# lists
v4 = [i for i in order if P['e'][i] >= 4000]
body = (f'<nav class="crumbs"><a href="../">Alpen</a></nav><h1>Alle Viertausender der Alpen</h1><p>In OpenStreetMap sind {len(v4)} benannte Gipfel der Alpen mit einer Höhe ab 4.000 m eingetragen – '
        'Hauptgipfel ebenso wie Nebengipfel. Die offizielle UIAA-Liste zählt 82 Viertausender; hier stehen alle benannten Erhebungen.</p>' + app_cta('Viertausender auf der Karte') + peak_table(v4))
hub_urls.append(hub_page('listen/viertausender.html', f'Alle Viertausender der Alpen ({len(v4)} Gipfel über 4000 m) | Alpengipfel', 'Liste aller benannten Gipfel der Alpen über 4.000 m mit Höhe, Gebirgsgruppe und Routen.', body))
print('hub pages:', len(hub_urls))
shutil.rmtree('docs/gipfel', ignore_errors=True); os.makedirs('docs/gipfel')
urls = [SITE_URL]
for i in range(N):
    name, ele, la, lo = P['n'][i], P['e'][i], P['la'][i], P['lo'][i]
    countries = ', '.join(D['countries'][c]['n'] for c in lst(P['c'][i]))
    states = ' / '.join(D['states'][s]['n'] for s in lst(P['s'][i]))
    group = ' / '.join(D['groups'][g]['n'] for g in lst(P['g'][i]))
    routes = len(P['rt'][i] or []) + len(P['ap'][i] or []) + len(P['cc'][i] or [])
    where = ', '.join(x for x in (group, states, countries) if x)
    title = f"{name}{f' ({num(ele)} m)' if ele is not None else ''} – {group or countries or 'Alpen'} | Alpengipfel"
    desc = (f"{name}{f', {num(ele)} m hoch' if ele is not None else ''}: Gipfel in {where or 'den Alpen'}. "
            f"Lage, Koordinaten, {'Wege und Routen, ' if routes else ''}Karte und Bergwetter für die nächsten 7 Tage.")
    static = summit_html(i)
    ld = {'@context': 'https://schema.org', '@type': 'Mountain', 'name': name,
          'geo': {'@type': 'GeoCoordinates', 'latitude': la, 'longitude': lo, **({'elevation': ele} if ele is not None else {})}}
    head = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'
    s = slug(i)
    open(f'docs/gipfel/{s}.html', 'w').write(page('../', title, desc, f'{SITE_URL}gipfel/{s}.html', static, head, P['id'][i]))
    urls.append(f'{SITE_URL}gipfel/{s}.html')
open('docs/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                    + ''.join(f'<url><loc>{u}</loc></url>\n' for u in urls + hub_urls) + '</urlset>\n')

# single-file variant: styles, data and script inline, nothing to fetch
inline = ''.join(f'<script type="application/json" id="data-{k}">' + open(f'docs/data/{k}.json').read().replace('</', '<\\/') + '</script>\n' for k in ('peaks', 'geo'))
# the single file has a size limit, so it carries the details without the starting points
slim = [{k: v for k, v in ch.items() if k not in ('pk', 'st', 'ar')} for ch in details]
inline += '<script type="application/json" id="data-details">' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>\n'
open('dist/artifact.html', 'w').write(
    '<title>Alpengipfel</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + FONTS + '\n<style>\n' + css + '</style>\n'
    '<div id="app-root" style="height:100%"></div>\n' + inline + LEAFLET + '\n<script>\n' + js.replace('</script', '<\\/script') + '</script>\n')
open('docs/robots.txt', 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n')    # points search engines to the sitemap
open('docs/CNAME', 'w').write(SITE_URL.split('//')[1].strip('/') + '\n')      # tells GitHub Pages which domain serves the site

# installable app: icons, manifest and a service worker that caches the app itself for offline use
for f in glob.glob('src/vendor/icons/*.png'): shutil.copy(f, 'docs/assets/')
json.dump({'name': 'Alpengipfel', 'short_name': 'Alpengipfel', 'description': 'Alle benannten Gipfel der Alpen mit Karte, Routen, Gipfelbuch und Bergwetter.', 'lang': 'de',
           'start_url': './', 'scope': './', 'display': 'standalone', 'background_color': '#f3f5f2', 'theme_color': '#1d2623',
           'icons': [{'src': 'assets/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'assets/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
                     {'src': 'assets/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]},
          open('docs/manifest.webmanifest', 'w'), ensure_ascii=False, indent=1)
shell_files = ['./', 'manifest.webmanifest', 'data/peaks.json', 'data/geo.json'] + sorted('assets/' + os.path.relpath(f, 'docs/assets') for f in glob.glob('docs/assets/**/*', recursive=True) if os.path.isfile(f) and 'maplibre' not in f)
import hashlib
version = hashlib.sha1(b''.join(open('docs/' + (f if f != './' else 'index.html'), 'rb').read() for f in shell_files)).hexdigest()[:12]
open('docs/sw.js', 'w').write(open('src/sw.js').read().replace('__VERSION__', version).replace('__FILES__', json.dumps(shell_files)))

print(f'ok: {N} summit pages, sitemap with {len(urls)} addresses')
