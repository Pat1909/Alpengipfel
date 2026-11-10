"""Download peaks, admin membership and extra group polygons from the QLever OSM planet endpoint."""
import urllib.request, urllib.parse, os, sys, json, time
sys.path.insert(0, 'scripts')
from regions import STATES, COUNTRIES
EP = 'https://qlever.dev/api/osm-planet'
PFX = '''PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:>
PREFIX osmrel: <https://www.openstreetmap.org/relation/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX ogc: <http://www.opengis.net/rdf#>
'''
ALPS = 2698607
def run(q, out):
    if os.path.exists(out): return
    for attempt in range(4):
        try:
            req = urllib.request.Request(EP, data=urllib.parse.urlencode({'query': PFX + q}).encode(),
                                         headers={'Accept': 'text/tab-separated-values', 'User-Agent': 'alpengipfel-build/0.1'})
            body = urllib.request.urlopen(req, timeout=300).read()
            open(out, 'wb').write(body); print(out, len(body)); return
        except Exception as ex:
            print('retry', out, str(ex)[:200], getattr(ex, 'read', lambda: b'')()[:300]); time.sleep(5 * (attempt + 1))
    sys.exit('failed: ' + out)
os.makedirs('data/raw/q', exist_ok=True)
run(f'''SELECT ?n ?wkt ?name ?ele ?name_de ?name_it ?name_fr ?name_sl ?alt ?prom ?wp WHERE {{
  osmrel:{ALPS} ogc:sfContains ?n . ?n osmkey:natural "peak" ; geo:hasGeometry/geo:asWKT ?wkt .
  OPTIONAL {{ ?n osmkey:name ?name }} OPTIONAL {{ ?n osmkey:ele ?ele }} OPTIONAL {{ ?n osmkey:name:de ?name_de }}
  OPTIONAL {{ ?n osmkey:name:it ?name_it }} OPTIONAL {{ ?n osmkey:name:fr ?name_fr }} OPTIONAL {{ ?n osmkey:name:sl ?name_sl }}
  OPTIONAL {{ ?n osmkey:alt_name ?alt }} OPTIONAL {{ ?n osmkey:prominence ?prom }} OPTIONAL {{ ?n osmkey:wikipedia ?wp }} }}''',
    'data/raw/q/peaks.tsv')
for k in STATES:
    run(f'SELECT ?n WHERE {{ ?a osmkey:ISO3166-2 "{k}" ; osmkey:boundary "administrative" ; ogc:sfIntersects ?n . ?n osmkey:natural "peak" }}', f'data/raw/q/s_{k}.tsv')
# countries without a state level are fetched by their boundary relation id
for k, rid in {'SI': 218657, 'LI': 1155955, 'MC': 1124039, 'HU': 21335}.items():
    run(f'SELECT ?n WHERE {{ osmrel:{rid} ogc:sfIntersects ?n . ?n osmkey:natural "peak" }}', f'data/raw/q/c_{k}.tsv')
ids = [10617220,19313657,19313658,19313659,19313660,17227722,16257269,17227685,19217149,18257161,17929832,19261748,19237700,17930728,19314438,19313949,19313950,19317437,19317439,19317440,19317436,19317438,19317441,19335057]
vals = ' '.join(f'osmrel:{i}' for i in ids)
run(f'SELECT ?r ?name ?name_de ?wkt WHERE {{ VALUES ?r {{ {vals} }} ?r geo:hasGeometry/geo:asWKT ?wkt ; osmkey:name ?name . OPTIONAL {{ ?r osmkey:name:de ?name_de }} }}', 'data/raw/q/groups2.tsv')
# admin boundary geometry, used to give summits right next to a border both sides
for k in STATES:
    run(f'SELECT ?wkt WHERE {{ ?a osmkey:ISO3166-2 "{k}" ; osmkey:boundary "administrative" ; geo:hasGeometry/geo:asWKT ?wkt }}', f'data/raw/q/b_{k}.tsv')
for k, rid in {'SI': 218657, 'LI': 1155955, 'MC': 1124039, 'HU': 21335}.items():
    run(f'SELECT ?wkt WHERE {{ osmrel:{rid} geo:hasGeometry/geo:asWKT ?wkt }}', f'data/raw/q/b_{k}.tsv')
# signposted hiking routes (route relations) and paths within 100 m of each named summit
PFX += 'PREFIX qlss: <https://qlever.cs.uni-freiburg.de/spatialSearch/>\n'
PEAK = f'osmrel:{ALPS} ogc:sfContains ?n . ?n osmkey:natural "peak" ; osmkey:name ?pname ; geo:hasGeometry/geo:asWKT ?pg .'
JOIN = '_:config qlss:algorithm qlss:libspatialjoin ; qlss:joinType qlss:within-dist ; qlss:maxDistance 100 ; qlss:left ?pg ; qlss:right ?rg ;'
ROUTE = f'osmrel:{ALPS} ogc:sfIntersects ?rel . ?rel osmkey:type "route" ; osmkey:route ?rt . FILTER(?rt = "hiking" || ?rt = "foot")'
run(f'''SELECT ?n ?rel WHERE {{ {PEAK}
  SERVICE qlss: {{ {JOIN} qlss:payload ?rel .
    {{ {ROUTE} ?rel geo:hasGeometry/geo:asWKT ?rg }} }} }}''', 'data/raw/q/routes.tsv')
run(f'SELECT ?rel ?name ?ref WHERE {{ {ROUTE} OPTIONAL {{ ?rel osmkey:name ?name }} OPTIONAL {{ ?rel osmkey:ref ?ref }} }}', 'data/raw/q/route_names.tsv')
run(f'''SELECT ?n ?w WHERE {{ {PEAK}
  SERVICE qlss: {{ {JOIN} qlss:payload ?w .
    {{ osmrel:{ALPS} ogc:sfIntersects ?w . ?w osmkey:highway ?h ; geo:hasGeometry/geo:asWKT ?rg . FILTER(?h = "path" || ?h = "footway" || ?h = "track" || ?h = "via_ferrata" || ?h = "steps") }} }} }}''', 'data/raw/q/ways.tsv')
# Natural Earth: country borders and lakes for the overview map
for name in ('ne_10m_admin_0_countries', 'ne_10m_lakes'):
    out = 'data/raw/' + {'ne_10m_admin_0_countries': 'ne_countries', 'ne_10m_lakes': 'ne_lakes'}[name] + '.geojson'
    if not os.path.exists(out):
        urllib.request.urlretrieve(f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/{name}.geojson', out); print(out)
