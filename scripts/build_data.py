"""Turn the raw Overpass downloads into docs/data/peaks.json and docs/data/geo.json."""
import json, glob, gzip, os, re, sys, datetime, math, unicodedata
import numpy as np
import shapely
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union, linemerge
sys.path.insert(0, 'scripts')
from geomlib import relation_polygon
from regions import COUNTRIES, STATES, WHOLE

RAW, OUT = 'data/raw', 'docs/data'

def tsv(path):
    """Read a QLever TSV result into dicts (variables without '?', literals unquoted)."""
    with open(path, encoding='utf-8') as fh:
        head = [h.strip().lstrip('?') for h in fh.readline().rstrip('\n').split('\t')]
        for line in fh:
            vals = []
            for v in line.rstrip('\n').split('\t'):
                if v.startswith('<') and v.endswith('>'): v = v[1:-1]
                elif v.startswith('"'):
                    v = v[1:v.rindex('"')].replace('\\"', '"').replace('\\n', ' ').replace('\\t', ' ').replace('\\\\', '\\')
                vals.append(v.strip())
            yield dict(zip(head, vals + [''] * (len(head) - len(vals))))
os.makedirs(OUT, exist_ok=True)
ROUTE_RADIUS = 100        # a path or route this close counts as reaching the summit
NEAR_RADIUS = 300         # paths up to here are listed as 'near the summit' when nothing reaches it

# ---------- Alps outline ----------
alps = relation_polygon(json.load(gzip.open(f'{RAW}/alps.json.gz', 'rt', encoding='utf-8'))['elements'][0])

# ---------- mountain groups ----------
rels = json.load(gzip.open(f'{RAW}/groups.json.gz', 'rt', encoding='utf-8'))['elements']
extra = []                                      # groups without AVE number, as WKT from QLever
for row in tsv(f'{RAW}/q/groups2.tsv'):
    extra.append({'id': int(row['r'].rsplit('/', 1)[1]), 'tags': {'name': row['name'], 'name:de': row['name_de']}, 'wkt': row['wkt']})
SKIP = {20965467, 13743094, 19217025, 10612258}          # ranges that only duplicate finer groups
RENAME = {'Bauget-Alpen': 'Bauges', 'Massif du Giffre': 'Giffre-Massiv', 'Zentralmassiv': None}
primary, fallback, subs = [], [], []
seen = set()
for r in rels + extra:
    if r['id'] in seen or r['id'] in SKIP: continue
    seen.add(r['id'])
    t = r['tags']; ref = t.get('ref:aveo', '')
    name = t.get('name:de') or t.get('name')
    name = RENAME.get(name, name)
    if not name: continue
    name = re.sub(r'\s*\(SOIUSA\)$', '', name)
    geom = shapely.from_wkt(r['wkt']).buffer(0) if 'wkt' in r else relation_polygon(r)
    if geom is None: continue
    rec = {'n': name, 'ref': ref, 'geom': geom, 'id': r['id']}
    if re.fullmatch(r'\d+[a-d]?', ref): primary.append(rec)
    elif ';' in ref: continue                     # umbrella ranges (Hohe Tauern, Niedere Tauern, ...)
    elif '.' in ref: subs.append(rec)
    elif ref == '': fallback.append(rec)
fallback.sort(key=lambda g: g['geom'].area)       # smallest first: most specific wins
subs.sort(key=lambda g: g['geom'].area)
groups = primary + fallback
print(f'groups: {len(primary)} primary, {len(fallback)} fallback, {len(subs)} subgroups')

# ---------- peaks ----------
def parse_num(v, lo, hi):
    if not v: return None
    m = re.match(r'^\s*(\d{1,4})(?:[.,](\d+))?\s*(m|M|müA|m ü\. ?A\.?|m\.)?\s*$', v)
    if not m: return None
    x = float(m.group(1) + '.' + (m.group(2) or '0'))
    return int(round(x)) if lo < x < hi else None

peaks = {}
for row in tsv(f'{RAW}/q/peaks.tsv'):
    m = re.match(r'POINT\(([-\d.]+) ([-\d.]+)\)', row['wkt'])
    if not m: continue
    pid = int(row['n'].rsplit('/', 1)[1])
    t = {'name': row['name'], 'ele': row['ele'], 'name:de': row['name_de'], 'name:it': row['name_it'], 'name:fr': row['name_fr'],
         'name:sl': row['name_sl'], 'alt_name': row['alt'], 'prominence': row['prom'], 'wikipedia': row['wp']}
    peaks[pid] = {'id': pid, 'lon': float(m.group(1)), 'lat': float(m.group(2)), 't': {k: v for k, v in t.items() if v}, 'st': set(), 'co': set()}
for f in sorted(glob.glob(f'{RAW}/q/[sc]_*.tsv')):
    key = os.path.basename(f)[2:-4]
    for row in tsv(f):
        p = peaks.get(int(row['n'].rsplit('/', 1)[1]))
        if p is None: continue
        if key in STATES: p['st'].add(key)
        p['co'].add(key[:2])
print('raw peaks:', len(peaks))

P = list(peaks.values())
xs = np.array([p['lon'] for p in P]); ys = np.array([p['lat'] for p in P])
inside = shapely.contains_xy(alps, xs, ys)
def pick_name(t):
    return t.get('name') or t.get('name:de') or t.get('name:it') or t.get('name:fr') or t.get('name:sl') or t.get('alt_name')
keep = [i for i, p in enumerate(P) if inside[i] and pick_name(p['t'])]
print('in Alps:', int(inside.sum()), 'named in Alps:', len(keep))
P = [P[i] for i in keep]; xs = xs[keep]; ys = ys[keep]

# Summits within BORDER_M metres of an admin boundary count for both sides (Zugspitze, Matterhorn, ...).
BORDER_M = 50
KX = math.cos(math.radians(46.5))
pts_scaled = shapely.points(xs * KX, ys)
tol = BORDER_M / 111320
for f in sorted(glob.glob(f'{RAW}/q/b_*.tsv')):
    key = os.path.basename(f)[2:-4]
    for row in tsv(f):
        geom = shapely.from_wkt(row['wkt'])
        if geom is None or geom.is_empty: continue
        minx, miny, maxx, maxy = geom.bounds
        cand = np.nonzero((xs >= minx - .01) & (xs <= maxx + .01) & (ys >= miny - .01) & (ys <= maxy + .01))[0]
        if not len(cand): continue
        line = shapely.transform(geom.boundary, lambda c: c * [KX, 1])
        shapely.prepare(line)
        near = cand[shapely.dwithin(line, pts_scaled[cand], tol)]
        for i in near:
            if key in STATES: P[i]['st'].add(key)
            P[i]['co'].add(key[:2])
        print(' border', key, len(near))

def assign(recs):
    res = [[] for _ in P]
    for gi, g in enumerate(recs):
        shapely.prepare(g['geom'])
        minx, miny, maxx, maxy = g['geom'].bounds
        cand = np.nonzero((xs >= minx) & (xs <= maxx) & (ys >= miny) & (ys <= maxy))[0]
        hit = cand[shapely.contains_xy(g['geom'], xs[cand], ys[cand])]
        for i in hit: res[i].append(gi)
    return res
gp = assign(primary); gf = assign(fallback); gs = assign(subs)

# ---------- routes: signposted hiking routes and paths within ROUTE_RADIUS of the summit ----------
nid = lambda v: int(v.rsplit('/', 1)[1])
rnames = {}
for row in tsv(f'{RAW}/q/route_names.tsv'):
    label = row['name'] or (f"Route {row['ref']}" if row['ref'] else '')
    if label: rnames[nid(row['rel'])] = label
peak_routes, peak_ways = {}, {}
for row in tsv(f'{RAW}/q/routes.tsv'): peak_routes.setdefault(nid(row['n']), set()).add(nid(row['rel']))
# Each path near a summit is classed as 0 = Wandern (T1-T3 or untagged), 1 = Hochalpin (T4-T6), 2 = Klettersteig.
SAC = {'strolling': 1, 'hiking': 1, 'mountain_hiking': 2, 'demanding_mountain_hiking': 3,
       'alpine_hiking': 4, 'demanding_alpine_hiking': 5, 'difficult_alpine_hiking': 6}
def classify(row):
    grade = max([SAC.get(v.strip(), 0) for v in row['sac'].split(';')] or [0])
    vf = row['vf'] if re.fullmatch(r'[0-6][+-]?', row['vf']) else ''
    if row['h'] == 'via_ferrata' or vf: return (2, grade, vf, row['name'])
    return (1 if grade >= 4 else 0, grade, '', row['name'])
for row in tsv(f'{RAW}/q/ways.tsv'): peak_ways.setdefault(nid(row['n']), {})[nid(row['w'])] = (float(row['d']), classify(row))
route_ways = {}
for row in tsv(f'{RAW}/q/route_ways.tsv'): route_ways.setdefault(nid(row['rel']), set()).add(nid(row['w']))
hardest = lambda infos: max(infos, key=lambda x: (x[0], x[1], x[2]))
route_list, route_idx = [], {}
def route_ref(rid):
    if rid not in route_idx:
        route_idx[rid] = len(route_list); route_list.append([rid, rnames.get(rid, '')])
    return route_idx[rid]

# ---------- Camptocamp.org: alpine routes, ski tours, via ferratas and hikes per summit (CC BY-SA 3.0) ----------
C2C_ACT = {'hiking': 'Wandern', 'via_ferrata': 'Klettersteig', 'snow_ice_mixed': 'Hochtour', 'mountain_climbing': 'Alpinklettern',
           'rock_climbing': 'Klettern', 'ice_climbing': 'Eisklettern', 'skitouring': 'Skitour', 'snowshoeing': 'Schneeschuh'}
ALPINE = {'snow_ice_mixed', 'mountain_climbing', 'rock_climbing', 'ice_climbing'}
GLOBAL = ['F', 'F+', 'PD-', 'PD', 'PD+', 'AD-', 'AD', 'AD+', 'D-', 'D', 'D+', 'TD-', 'TD', 'TD+', 'ED-', 'ED', 'ED+', 'ED4', 'ED5', 'ED6', 'ED7']
QUALITY = {'great': 0, 'fine': 1, 'medium': 2, 'draft': 3}
def c2c_cat(acts):
    if 'via_ferrata' in acts: return 2
    if ALPINE & acts: return 1
    if 'hiking' in acts: return 0
    if acts & {'skitouring', 'snowshoeing'}: return 3
    return None                                    # mountain biking, paragliding, ...
def c2c_rating(r, cat):
    if cat == 0: parts, rank = [r.get('hiking_rating')], r.get('hiking_rating') or 'T9'
    elif cat == 2: parts, rank = [r.get('via_ferrata_rating')], r.get('via_ferrata_rating') or 'K9'
    elif cat == 1:
        parts = [r.get('global_rating'), f"Fels {r['rock_free_rating']}" if r.get('rock_free_rating') else None, f"Eis {r['ice_rating']}" if r.get('ice_rating') else None]
        rank = '%02d' % (GLOBAL.index(r['global_rating']) if r.get('global_rating') in GLOBAL else 50)
    else:
        parts = [f"Ski {r['ski_rating']}" if r.get('ski_rating') else None, r.get('snowshoe_rating'), r.get('labande_global_rating')]
        rank = r.get('ski_rating') or r.get('snowshoe_rating') or '9'
    return ' · '.join(p for p in parts if p), rank
def name_keys(*names):
    """Normalised spellings of a summit name; bilingual names are split."""
    out = set()
    for n in names:
        for part in re.split(r'\s+[/-]\s+|;|,', n or ''):
            k = re.sub('[\u0300-\u036f]', '', unicodedata.normalize('NFD', part.lower())).replace('ß', 'ss')
            k = re.sub('[^a-z0-9]+', ' ', k).strip()
            if len(k) >= 3: out.add(k)
    return out
def lonlat(xy):
    return math.degrees(xy[0] / 6378137), math.degrees(2 * math.atan(math.exp(xy[1] / 6378137)) - math.pi / 2)

c2c_routes, c2c_wp, c2c_acts = {}, {}, []
if os.path.exists(f'{RAW}/c2c/routes.json'):
    summits = json.load(open(f'{RAW}/c2c/summits.json')); croutes = json.load(open(f'{RAW}/c2c/routes.json'))
    osm_keys = [name_keys(*[p['t'].get(k) for k in ('name', 'name:de', 'name:it', 'name:fr', 'name:sl', 'alt_name')]) for p in P]
    osm_ele = [parse_num(p['t'].get('ele'), 0, 4900) for p in P]
    # 1. each Camptocamp summit -> the OpenStreetMap peak it describes
    summit_peak = {}
    for sm in summits:
        lon, lat = lonlat(sm['xy']); keys = name_keys(*sm['titles'])
        dist = np.hypot((xs - lon) * KX, ys - lat) * 111320
        best = None
        for i in np.nonzero(dist <= 400)[0]:
            same = bool(keys & osm_keys[i]); de = abs(osm_ele[i] - sm['ele']) if osm_ele[i] is not None and sm['ele'] else None
            if same and (de is None or de <= 100): score = dist[i]
            elif dist[i] <= 80 and de is not None and de <= 30: score = 1000 + dist[i]      # other name, same spot and height
            else: continue
            if best is None or score < best[0]: best = (score, i)
        if best: summit_peak[sm['id']] = best[1]
    # 2. each route -> the summit it is named after (title prefix), the nearest one within 6 km
    by_title = {}
    for sm in summits:
        for t in sm['titles']: by_title.setdefault(t.strip().lower(), []).append(sm)
    attached = 0
    for r in croutes:
        cat = c2c_cat(set(r['act']))
        if cat is None or r.get('quality') == 'empty': continue
        cands = by_title.get(r['prefix'].strip().lower())
        if not cands: continue
        d, sm = min(((math.hypot(c['xy'][0] - r['xy'][0], c['xy'][1] - r['xy'][1]) * KX, c) for c in cands), key=lambda x: x[0])
        if d > 6000 or sm['id'] not in summit_peak: continue
        pid = P[summit_peak[sm['id']]]['id']
        label = ' / '.join(C2C_ACT[a] for a in r['act'] if a in C2C_ACT)
        if label not in c2c_acts: c2c_acts.append(label)
        rating, rank = c2c_rating(r, cat)
        c2c_routes.setdefault(pid, []).append(((cat, rank, QUALITY.get(r.get('quality'), 4), r['title']), [r['id'], r['title'].strip(), cat, c2c_acts.index(label), rating, r.get('up') or 0]))
        c2c_wp.setdefault(pid, sm['id']); attached += 1
    print(f'camptocamp: {len(summit_peak)} of {len(summits)} summits matched to OSM peaks, {attached} routes on {len(c2c_routes)} peaks')

country_keys = list(COUNTRIES); state_keys = list(STATES)
cols = {k: [] for k in ['n', 'an', 'e', 'la', 'lo', 'c', 's', 'g', 'sg', 'p', 'wp', 'id', 'rt', 'ap', 'nr', 'cc', 'cw', 'k']}
ccount = [0] * len(country_keys); scount = [0] * len(state_keys); gcount = [0] * len(groups); ungrouped = 0
def compact(lst): return -1 if not lst else (lst[0] if len(lst) == 1 else lst)
order = sorted(range(len(P)), key=lambda i: -(parse_num(P[i]['t'].get('ele'), 0, 4900) or -1))
for i in order:
    p = P[i]; t = p['t']
    name = pick_name(t).strip()
    alts = []
    for k in ('name:de', 'alt_name', 'name:it', 'name:fr', 'name:sl'):
        v = t.get(k)
        if v and v != name and v not in alts and v not in name: alts.append(v.replace(';', ', '))
    cs = sorted(country_keys.index(c) for c in p['co'] if c in country_keys)
    ss = sorted(state_keys.index(s) for s in p['st'])
    g = gp[i][:1] if gp[i] else [len(primary) + gf[i][0]] if gf[i] else []
    for c in cs: ccount[c] += 1
    for s in ss: scount[s] += 1
    for x in g: gcount[x] += 1
    if not g: ungrouped += 1
    cols['n'].append(name); cols['an'].append(', '.join(alts[:3]) if alts else 0)
    cols['e'].append(parse_num(t.get('ele'), 0, 4900))
    cols['la'].append(round(p['lat'], 5)); cols['lo'].append(round(p['lon'], 5))
    cols['c'].append(compact(cs)); cols['s'].append(compact(ss)); cols['g'].append(compact(g))
    cols['sg'].append(gs[i][0] if gs[i] else -1)
    cols['p'].append(parse_num(t.get('prominence'), 0, 4900) or 0)
    cols['wp'].append(t.get('wikipedia') or 0)
    cols['id'].append(p['id'])
    allw = peak_ways.get(p['id'], {})
    ways = {w: c for w, (d, c) in allw.items() if d <= ROUTE_RADIUS}
    rts = sorted(peak_routes.get(p['id'], ()), key=lambda r: rnames.get(r, '~'))
    rt, used, kinds = [], set(), 0
    for r in rts:                                   # a route is as hard as its hardest stretch at the summit
        mine = route_ways.get(r, set()) & ways.keys(); used |= mine
        cat, grade, vf, _ = hardest([ways[w] for w in mine]) if mine else (0, 0, '', '')
        rt.append([route_ref(r), cat, grade, vf]); kinds |= 1 << cat
    ap = sorted({ways[w] for w in ways.keys() - used})   # paths that belong to no signposted route
    for cat, *_ in ap: kinds |= 1 << cat
    nr = []                                         # nothing reaches the summit: the nearest paths around it
    if not rt and not ap:
        for d, c in sorted(allw.values()):
            if d <= NEAR_RADIUS and c not in [tuple(x[1:]) for x in nr]: nr.append([int(round(d / 10) * 10), *c])
            if len(nr) == 3: break
    cc = [rec for _, rec in sorted(c2c_routes.get(p['id'], []), key=lambda x: x[0])]
    for rec in cc: kinds |= 1 << rec[2]
    if not kinds and nr: kinds = 16                 # only a path nearby
    cols['rt'].append(rt or 0); cols['ap'].append([list(x) for x in ap] or 0); cols['nr'].append(nr or 0)
    cols['cc'].append(cc or 0); cols['cw'].append(c2c_wp.get(p['id'], 0)); cols['k'].append(kinds)

data = {
    'meta': {'date': datetime.date.today().strftime('%d.%m.%Y'), 'source': 'OpenStreetMap contributors, ODbL', 'routeRadius': ROUTE_RADIUS, 'nearRadius': NEAR_RADIUS},
    'countries': [{'c': k, 'n': COUNTRIES[k], 'count': ccount[i]} for i, k in enumerate(country_keys)],
    'states': [{'n': STATES[k], 'c': country_keys.index(k[:2]), 'count': scount[i]} for i, k in enumerate(state_keys)],
    'groups': [{'n': g['n'], 'count': gcount[i]} for i, g in enumerate(groups)],
    'subgroups': [g['n'] for g in subs],
    'ungrouped': ungrouped,
    'routes': route_list,
    'c2cActs': c2c_acts,
    'peaks': cols,
}
json.dump(data, open(f'{OUT}/peaks.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('peaks.json', os.path.getsize(f'{OUT}/peaks.json') // 1024, 'KB;', len(cols['n']), 'peaks; ungrouped', ungrouped,
      '; with ele', sum(e is not None for e in cols['e']))

# ---------- base map geometry ----------
def rings(geom, tol, nd=3):
    geom = geom.simplify(tol, preserve_topology=True)
    polys = getattr(geom, 'geoms', [geom])
    out = []
    for poly in polys:
        if poly.is_empty or poly.geom_type != 'Polygon': continue
        rr = [[[round(x, nd), round(y, nd)] for x, y in ring.coords] for ring in [poly.exterior, *poly.interiors] if len(ring.coords) >= 4]
        if rr: out.append(rr)
    return out
view = box(2.5, 41.5, 19.5, 50)
geo = {'alps': rings(alps, 0.004), 'groups': [], 'lakes': [], 'borders': []}
for i, g in enumerate(groups):
    if not gcount[i]: continue
    c = g['geom'].representative_point()
    geo['groups'].append({'n': g['n'], 'c': [round(c.x, 3), round(c.y, 3)], 'a': round(g['geom'].area, 3), 'p': rings(g['geom'], 0.003)})
for f in json.load(open(f'{RAW}/ne_lakes.geojson'))['features']:
    gm = shape(f['geometry'])
    if gm.intersects(view) and gm.area > 0.002: geo['lakes'] += rings(gm.intersection(view), 0.002)
cs = [shape(f['geometry']).buffer(0) for f in json.load(open(f'{RAW}/ne_countries.geojson'))['features'] if shape(f['geometry']).intersects(view)]
lines = []
for a in range(len(cs)):
    for b in range(a + 1, len(cs)):
        shared = cs[a].boundary.intersection(cs[b].boundary).intersection(view)
        for part in getattr(shared, 'geoms', [shared]):
            if part.geom_type == 'LineString' and part.length > 0: lines.append(part)
merged = linemerge(lines) if lines else None
for part in getattr(merged, 'geoms', [merged] if merged is not None else []):
    s = part.simplify(0.003)
    if s.length > 0.02: geo['borders'].append([[round(x, 3), round(y, 3)] for x, y in s.coords])
# mountain huts: [lon, lat, name, height or 0, 0 = staffed hut / 1 = shelter, OSM reference, website or 0]
geo['huts'] = []
for row in tsv(f'{RAW}/q/huts.tsv'):
    g = shapely.from_wkt(row['wkt'])
    if g is None or g.is_empty or not row['name']: continue
    c = g if g.geom_type == 'Point' else g.centroid
    kind, oid = row['h'].rsplit('/', 2)[-2:]
    web = row['web'] if re.match(r'https?://[^\s"<>]+$', row['web']) else 0
    geo['huts'].append([round(c.x, 5), round(c.y, 5), row['name'], parse_num(row['ele'], 0, 4900) or 0, int(row['type'] == 'wilderness_hut'), kind[0] + oid, web])
print('huts', len(geo['huts']))
json.dump(geo, open(f'{OUT}/geo.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('geo.json', os.path.getsize(f'{OUT}/geo.json') // 1024, 'KB')
