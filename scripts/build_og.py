"""Preview images (1200 x 630, Open Graph) for shared links: docs/og/<osm id>.jpg for well-known summits, docs/og/alpengipfel.jpg for all others.

Each image shows the summit's name, height and mountain group above a skyline drawn from the real neighbouring summits
(seen from the north, the summit marked in red). Existing images are kept; pass --force to redraw all.
Run after build_data.py; build_page.py then links every summit page to its image.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FORCE = '--force' in sys.argv
D = json.load(open('docs/data/peaks.json')); P = D['peaks']; N = len(P['n'])
W, H = 1200, 630
F = lambda name, size: ImageFont.truetype(f'src/vendor/fonts_ttf/{name}.ttf', size)
TITLE, BODY, BOLD = 'barlow-condensed-600', 'barlow-500', 'barlow-600'
lst = lambda v: [] if v in (-1, None) else (v if isinstance(v, list) else [v])
num = lambda v: f'{v:,}'.replace(',', '.')

def chosen():
    """Summits that get their own image: the well-known ones (Wikipedia article, prominence of 300 m or more, 4000 m or more, or the highest of their group)."""
    ch = D['meta']['chunk']; det = [json.load(open(f'docs/data/d/{c}.json')) for c in range((N + ch - 1) // ch)]
    wp = [v for d in det for v in d['wp']]; pr = [v for d in det for v in d['p']]
    top_of_group = {}
    for i in range(N):
        for g in lst(P['g'][i]):
            if P['e'][i] is not None and (g not in top_of_group or P['e'][i] > P['e'][top_of_group[g]]): top_of_group[g] = i
    out = set(top_of_group.values())
    for i in range(N):
        e = P['e'][i] or 0
        if wp[i] or (pr[i] or 0) >= 300 or e >= 4000: out.add(i)
    return sorted(out)

def sky(img, top, bottom):
    a = np.linspace(0, 1, H)[:, None, None]
    arr = (np.array(top)[None, None, :] * (1 - a) + np.array(bottom)[None, None, :] * a).repeat(W, axis=1)
    img.paste(Image.fromarray(arr.astype('uint8')), (0, 0))

def skyline(draw, centre, band_top, base, sel=None):
    """Neighbouring summits within about 22 km as cones, five depth bands by latitude (north in front)."""
    la0, lo0 = centre; kx = 111.32 * math.cos(math.radians(la0)); span = 22.0
    xs = np.arange(W + 1, dtype=np.float32)
    lat = np.array(P['la']); lon = np.array(P['lo']); ele = np.array([e if e is not None else -1 for e in P['e']], dtype=np.float32)
    m = (np.abs(lat - la0) < 0.25) & (np.abs(lon - lo0) < 0.35) & (ele > 0)
    idx = np.nonzero(m)[0]
    dx = (lo0 - lon[idx]) * kx; dy = (lat[idx] - la0) * 110.57          # east on the left, as seen from the north
    keep = np.abs(dx) < span * 1.3
    idx, dx, dy = idx[keep], dx[keep], dy[keep]
    emax = max(ele[sel] if sel is not None else ele[idx].max(), 500)
    emin = max(0, min(ele[idx].min(), emax - 1800))
    hpx = lambda e: (e - emin) / max(1, emax - emin) * (base - band_top)
    X = W / 2 + dx / span * (W / 2)
    order = np.argsort(dy)                                      # far (south) first
    bands = np.array_split(order, 5)
    far, near = np.array([176, 194, 210]), np.array([46, 66, 82])
    tops = []
    for b, ids in enumerate(bands):
        if not len(ids): continue
        h = hpx(ele[idx[ids]]); w = h * 1.45 + 6
        t = 1 - np.abs(xs[None, :] - X[ids][:, None]) / w[:, None]
        ys = (h[:, None] * np.clip(t, 0, None) ** 1.5).max(axis=0)
        col = tuple(int(v) for v in far + (near - far) * b / 4)
        pts = [(0, base)] + [(int(x), base - float(y)) for x, y in zip(xs[::2], ys[::2])] + [(W, base)]
        draw.polygon(pts, fill=col)
        sh = hpx(2800)
        if b < 3 and ys.max() > sh:                             # snow caps above about 2800 m
            for x in range(0, W, 2):
                y = ys[x]
                if y > sh: draw.line([(x, base - y), (x, base - max(sh, y - (y - sh) * .55 - 5))], fill=(250, 252, 253), width=2)
        tops.append(ys)
    if sel is not None:
        x = W / 2; y = base - hpx(ele[sel])
        draw.line([(x, y - 30), (x, y - 6)], fill=(29, 38, 35), width=3)
        draw.ellipse([x - 11, y - 11 - 30, x + 11, y + 11 - 30], fill=(198, 40, 40), outline=(255, 255, 255), width=4)

def logo(draw, x, y, s=44):
    draw.rounded_rectangle([x, y, x + s, y + s], radius=s * .25, fill=(31, 42, 39))
    k = s / 32
    draw.polygon([(x + 4.5 * k, y + 25 * k), (x + 12.2 * k, y + 11.3 * k), (x + 15.8 * k, y + 17.1 * k), (x + 19.2 * k, y + 11.8 * k), (x + 27.5 * k, y + 25 * k)], fill=(243, 246, 243))
    draw.ellipse([x + 9.9 * k, y + 6.3 * k, x + 14.5 * k, y + 10.9 * k], fill=(198, 40, 40))

def fit(draw, text, font_name, size, max_w, min_size=48):
    while size > min_size and draw.textlength(text, font=F(font_name, size)) > max_w: size -= 4
    return F(font_name, size)

def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if draw.textlength(t, font=font) <= max_w or not cur: cur = t
        else: lines.append(cur); cur = w_
    lines.append(cur); return lines[:2]

def card(i=None):
    img = Image.new('RGB', (W, H)); sky(img, (207, 226, 240), (246, 239, 228))
    d = ImageDraw.Draw(img)
    if i is None:
        # the whole Alps from the north, like the home page
        skyline_all(d)
        logo(d, 64, 64, 64); d.text((146, 70), 'Alpengipfel', font=F(TITLE, 56), fill=(29, 38, 35))
        d.text((64, 170), f'Alle {num(N)} Gipfel der Alpen', font=F(TITLE, 76), fill=(29, 38, 35))
        d.text((64, 262), 'Aufstieg vom Parkplatz · Bergwetter · Gipfelbuch', font=F(BODY, 34), fill=(59, 74, 80))
        return img
    skyline(d, (P['la'][i], P['lo'][i]), 372, H, sel=i)
    logo(d, 56, 48, 40); d.text((108, 52), 'Alpengipfel', font=F(BOLD, 30), fill=(29, 38, 35))
    font = fit(d, P['n'][i], TITLE, 104, W - 120)
    lines = wrap(d, P['n'][i], font, W - 120) if d.textlength(P['n'][i], font=font) > W - 120 else [P['n'][i]]
    y = 108
    for ln in lines: d.text((56, y), ln, font=font, fill=(29, 38, 35)); y += font.size * 1.0
    group = ' / '.join(D['groups'][g]['n'] for g in lst(P['g'][i])[:1])
    land = ', '.join(D['countries'][c]['n'] for c in lst(P['c'][i])[:2])
    meta = ' · '.join(x for x in (group, land) if x)
    if P['e'][i] is not None:
        hfont = F(TITLE, 60); d.text((56, y + 8), f'{num(P["e"][i])} m', font=hfont, fill=(179, 38, 30))
        d.text((56 + d.textlength(f'{num(P["e"][i])} m', font=hfont) + 22, y + 26), meta, font=fit(d, meta, BODY, 32, W - 400, 22), fill=(59, 74, 80))
    else:
        d.text((56, y + 18), meta, font=F(BODY, 32), fill=(59, 74, 80))
    return img

def skyline_all(d):
    lat = np.array(P['la']); lon = np.array(P['lo']); ele = np.array([e if e is not None else -1 for e in P['e']], dtype=np.float32)
    m = ele >= 700; lat, lon, ele = lat[m], lon[m], ele[m]
    xs = np.arange(W + 1, dtype=np.float32); X = (16.5 - lon) / 11.2 * W; band = 300; base = H
    hp = (ele - 300) / 4510 * band
    order = np.argsort(lat); far, near = np.array([176, 194, 210]), np.array([46, 66, 82])
    for b, ids in enumerate(np.array_split(order, 5)):
        ys = np.zeros(W + 1, dtype=np.float32)
        for chunk in np.array_split(ids, max(1, len(ids) // 2000)):
            h = hp[chunk]; w = h * 1.45 + 2
            t = 1 - np.abs(xs[None, :] - X[chunk][:, None]) / w[:, None]
            ys = np.maximum(ys, (h[:, None] * np.clip(t, 0, None) ** 1.5).max(axis=0))
        k = 1 - b * .04
        d.polygon([(0, base)] + [(int(x), base - float(y) * k) for x, y in zip(xs[::2], ys[::2])] + [(W, base)], fill=tuple(int(v) for v in far + (near - far) * b / 4))
        sh = (2800 - 300) / 4510 * band
        if b < 3:
            for x in range(0, W, 2):
                y = ys[x]
                if y > sh: d.line([(x, base - y * k), (x, base - max(sh, y - (y - sh) * .55 - 4) * k)], fill=(250, 252, 253), width=2)

os.makedirs('docs/og', exist_ok=True)
card().save('docs/og/alpengipfel.jpg', quality=84, optimize=True, progressive=True)
ids = chosen(); made = 0
for n, i in enumerate(ids):
    out = f'docs/og/{P["id"][i]}.jpg'
    if os.path.exists(out) and not FORCE: continue
    card(i).save(out, quality=74, optimize=True, progressive=True); made += 1
    if made % 500 == 0: print(made, 'images')
keep = {f'{P["id"][i]}.jpg' for i in ids} | {'alpengipfel.jpg'}
for f in os.listdir('docs/og'):
    if f not in keep: os.remove('docs/og/' + f)
size = sum(os.path.getsize('docs/og/' + f) for f in os.listdir('docs/og'))
print(f'og images: {len(ids)} summits ({made} new), {size / 1e6:.0f} MB')
