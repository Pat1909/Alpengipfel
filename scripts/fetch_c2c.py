"""Download routes and summit waypoints of the Alps from the Camptocamp.org API (content licensed CC BY-SA 3.0).

The API returns at most 10 000 documents per search, so the area is split into tiles that stay below that.
Writes data/raw/c2c/routes.json and data/raw/c2c/summits.json (trimmed to the fields the build uses).
"""
import json, os, sys, time, urllib.request, urllib.parse
API = 'https://api.camptocamp.org/'
BBOX = (500000, 5310000, 1895000, 6210000)        # the Alps in Web-Mercator metres
OUT = 'data/raw/c2c'
os.makedirs(OUT, exist_ok=True)

def get(path, **params):
    url = API + path + '?' + urllib.parse.urlencode(params)
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'alpengipfel-build/0.1'})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception as ex:
            print('retry', str(ex)[:120], flush=True); time.sleep(3 * (attempt + 1))
    sys.exit('failed: ' + url)

def crawl(path, bbox, extra, seen, depth=0):
    bb = ','.join(str(int(v)) for v in bbox)
    total = get(path, bbox=bb, limit=1, **extra).get('total', 0)
    if total > 9000:                               # too many for one search: split into four
        x0, y0, x1, y1 = bbox; xm, ym = (x0 + x1) / 2, (y0 + y1) / 2
        for sub in ((x0, y0, xm, ym), (xm, y0, x1, ym), (x0, ym, xm, y1), (xm, ym, x1, y1)):
            crawl(path, sub, extra, seen, depth + 1)
        return
    for off in range(0, total, 100):
        for doc in get(path, bbox=bb, limit=100, offset=off, **extra)['documents']:
            seen[doc['document_id']] = doc
        time.sleep(0.2)
    print(path, bb, total, '->', len(seen), flush=True)

def point(doc):
    g = json.loads(doc['geometry']['geom']) if doc.get('geometry') and doc['geometry'].get('geom') else None
    return g['coordinates'][:2] if g and g['type'] == 'Point' else None

RATINGS = ['global_rating', 'engagement_rating', 'rock_free_rating', 'ice_rating', 'mixed_rating', 'hiking_rating',
           'via_ferrata_rating', 'ski_rating', 'labande_global_rating', 'snowshoe_rating']
if not os.path.exists(f'{OUT}/summits.json'):
    seen = {}; crawl('waypoints', BBOX, {'wtyp': 'summit'}, seen)   # no language preference: every title of a summit
    out = [{'id': d['document_id'], 'xy': point(d), 'ele': d.get('elevation'), 'titles': [l['title'] for l in d['locales']]} for d in seen.values() if point(d)]
    json.dump(out, open(f'{OUT}/summits.json', 'w'), ensure_ascii=False); print('summits', len(out))
if not os.path.exists(f'{OUT}/routes.json'):
    seen = {}; crawl('routes', BBOX, {'pl': 'de'}, seen)        # one title per route, German where there is one
    out = []
    for d in seen.values():
        if not point(d) or not d['locales']: continue
        loc = d['locales'][0]
        out.append({'id': d['document_id'], 'xy': point(d), 'title': loc.get('title') or '', 'prefix': loc.get('title_prefix') or '', 'lang': loc.get('lang'),
                    'act': d.get('activities') or [], 'up': d.get('height_diff_up'), 'max': d.get('elevation_max'), 'quality': d.get('quality'),
                    'track': bool(d['geometry'].get('has_geom_detail')), **{k: d[k] for k in RATINGS if d.get(k)}})
    json.dump(out, open(f'{OUT}/routes.json', 'w'), ensure_ascii=False); print('routes', len(out))
