"""Pictures for the summit pages: OpenStreetMap peaks with a wikidata tag -> the Wikidata image (P18, a file on Wikimedia Commons).
Writes data/raw/q/peak_wd.tsv (OSM node, Wikidata item) and data/raw/q/images.tsv (Wikidata item, Commons file name)."""
import urllib.request, urllib.parse, time, csv, io, sys
PFX = '''PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:>
PREFIX osmrel: <https://www.openstreetmap.org/relation/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX ogc: <http://www.opengis.net/rdf#>
'''
ALPS = 2698607                                       # the Alps relation, as in fetch_qlever.py
def q(ep, query, accept='text/tab-separated-values'):
    for attempt in range(6):
        try:
            req = urllib.request.Request(ep, data=urllib.parse.urlencode({'query': query}).encode(), headers={'Accept': accept, 'User-Agent': 'alpengipfel-build/0.1'})
            return urllib.request.urlopen(req, timeout=300).read().decode()
        except Exception as ex:
            print('retry', str(ex)[:150]); time.sleep(6 * (attempt + 1))
    sys.exit('failed')
osm = q('https://qlever.dev/api/osm-planet', PFX + f'SELECT ?n ?wd WHERE {{ osmrel:{ALPS} ogc:sfContains ?n . ?n osmkey:natural "peak" ; osmkey:wikidata ?wd }}')
open('data/raw/q/peak_wd.tsv', 'w').write(osm)
rows = list(csv.reader(io.StringIO(osm), delimiter='\t'))[1:]
qids = sorted({r[1].strip('"') for r in rows if r[1].strip('"').startswith('Q')})
print(len(rows), 'peaks with wikidata,', len(qids), 'items')
out = ['?item\t?img']
for k in range(0, len(qids), 400):
    vals = ' '.join('wd:' + x for x in qids[k:k + 400])
    res = q('https://qlever.dev/api/wikidata', 'PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> '
            f'SELECT ?item ?img WHERE {{ VALUES ?item {{ {vals} }} ?item wdt:P18 ?img }}')
    out += res.strip().split('\n')[1:]; time.sleep(1)
open('data/raw/q/images.tsv', 'w').write('\n'.join(out) + '\n')
print(len(out) - 1, 'images')
