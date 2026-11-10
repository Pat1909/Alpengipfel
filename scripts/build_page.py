"""Assemble the page: inline the Leaflet stylesheet into src/app.html.
Writes docs/index.html (complete document for any static web server) and dist/artifact.html (page fragment)."""
import os, re
css = open('src/leaflet.css').read()
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'[^{}]*\{[^{}]*url\(images/[^{}]*\}', '', css)      # drop rules that need image files we do not ship
app = open('src/app.html').read().replace('/*__LEAFLET_CSS__*/', css.strip())
os.makedirs('dist', exist_ok=True); os.makedirs('docs', exist_ok=True)
# single-file variant: data embedded, nothing to fetch
inline = ''.join(f'<script type="application/json" id="data-{k}">' + open(f'docs/data/{k}.json').read().replace('</', '<\\/') + '</script>\n' for k in ('peaks', 'geo'))
marker = '<script src="https://cdnjs'
open('dist/artifact.html', 'w').write(app.replace(marker, inline + marker, 1))
open('docs/index.html', 'w').write(
    '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<style>html{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style>\n'
    + app.replace('</style>\n\n<div class="app"', '</style>\n</head>\n<body>\n<div class="app"', 1) + '</body>\n</html>\n')
print('ok', len(app))
