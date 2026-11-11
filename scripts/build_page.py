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

SITE_URL = 'https://pat1909.github.io/Alpengipfel/'      # public address of docs/ (used for canonical links and the sitemap)
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
for f in ('leaflet.js', 'supabase.js'): shutil.copy(f'src/vendor/{f}', f'docs/assets/{f}')
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
            '<style>html{color-scheme:light}body{margin:0}</style>\n</head>\n<body>\n'
            f'<article class="static legal"><p><a href="./">← Alpengipfel</a></p>{body}</article>\n</body>\n</html>\n')
for name in ('impressum', 'datenschutz'):
    if LEGAL: open(f'docs/{name}.html', 'w').write(legal_page(name.capitalize() if name == 'impressum' else 'Datenschutzerklärung', getattr(legal, name)(LEGAL)))
    elif os.path.exists(f'docs/{name}.html'): os.remove(f'docs/{name}.html')

D = json.load(open('docs/data/peaks.json'))
P = D['peaks']; N = len(P['n'])
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
    boot = f"<script>window.AG_BASE={json.dumps(base)};" + (f"window.AG_PEAK={peak};" if peak else '') + ('window.AG_LEGAL=1;' if LEGAL else '') + "</script>"
    return ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n<link rel="canonical" href="{canonical}">\n'
            f'<meta property="og:title" content="{E(title)}">\n<meta property="og:description" content="{E(desc)}">\n{extra_head}'
            f'<link rel="stylesheet" href="{base}assets/fonts.css">\n<link rel="stylesheet" href="{base}assets/app.css">\n'
            '<style>html{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
            f'<div id="app-root" style="height:100%">{static}</div>\n<script src="{base}assets/leaflet.js"></script>\n<script src="{base}assets/supabase.js"></script>\n{boot}\n<script src="{base}assets/app.js"></script>\n</body>\n</html>\n')

intro = ('<article class="static"><h1>Alpengipfel</h1>'
         f'<p>Alle {num(N)} benannten Gipfel der Alpen aus OpenStreetMap: filterbar nach Höhe, Land, Bundesland und Gebirgsgruppe, '
         'mit Karte, Wanderrouten, Gipfelbuch und Bergwetter für jeden Gipfel.</p></article>')
open('docs/index.html', 'w').write(page('', 'Alpengipfel', f'Alle {num(N)} benannten Gipfel der Alpen mit Karte, Höhe, Lage, Routen und Bergwetter.', SITE_URL, intro))

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
    facts = [('Höhe', f'{num(ele)} m' if ele is not None else 'nicht eingetragen'), ('Koordinaten', f'{la:.5f}° N, {lo:.5f}° O'),
             ('Land', countries or '–'), ('Bundesland / Region', states or '–'), ('Gebirgsgruppe', group or 'ohne Zuordnung')]
    if P['p'][i]: facts.append(('Schartenhöhe', f"{num(P['p'][i])} m"))
    if routes: facts.append(('Erfasste Wege und Routen auf den Gipfel', str(routes)))
    static = (f'<article class="static"><h1>{E(name)}</h1>'
              + (f"<p>auch: {E(P['an'][i])}</p>" if P['an'][i] else '')
              + '<dl>' + ''.join(f'<dt>{E(k)}</dt><dd>{E(v)}</dd>' for k, v in facts) + '</dl>'
              + '<p><a href="../">Alle Alpengipfel</a></p>'
              + '<p>Daten: OpenStreetMap-Mitwirkende (ODbL)' + (', Routen: Camptocamp.org (CC BY-SA 3.0)' if P['cc'][i] else '') + '</p></article>')
    ld = {'@context': 'https://schema.org', '@type': 'Mountain', 'name': name,
          'geo': {'@type': 'GeoCoordinates', 'latitude': la, 'longitude': lo, **({'elevation': ele} if ele is not None else {})}}
    head = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'
    s = slug(i)
    open(f'docs/gipfel/{s}.html', 'w').write(page('../', title, desc, f'{SITE_URL}gipfel/{s}.html', static, head, P['id'][i]))
    urls.append(f'{SITE_URL}gipfel/{s}.html')
open('docs/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                    + ''.join(f'<url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n')

# single-file variant: styles, data and script inline, nothing to fetch
inline = ''.join(f'<script type="application/json" id="data-{k}">' + open(f'docs/data/{k}.json').read().replace('</', '<\\/') + '</script>\n' for k in ('peaks', 'geo'))
open('dist/artifact.html', 'w').write(
    '<title>Alpengipfel</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + FONTS + '\n<style>\n' + css + '</style>\n'
    '<div id="app-root" style="height:100%"></div>\n' + inline + LEAFLET + '\n<script>\n' + js.replace('</script', '<\\/script') + '</script>\n')
print(f'ok: {N} summit pages, sitemap with {len(urls)} addresses')
