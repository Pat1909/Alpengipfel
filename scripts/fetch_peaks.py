"""Download all natural=peak nodes per state/country area from Overpass (exact admin assignment)."""
import subprocess, os, sys, time
sys.path.insert(0, 'scripts')
from regions import STATES, WHOLE, BBOX
OUT = 'data/raw/peaks'
os.makedirs(OUT, exist_ok=True)
jobs = [(k, f'area["ISO3166-2"="{k}"]') for k in STATES] + [(k, f'area["ISO3166-1"="{k}"]["admin_level"="2"]') for k in WHOLE]
for key, area in jobs:
    out = f'{OUT}/{key}.json'
    if os.path.exists(out): continue
    open('/tmp/q_area.txt', 'w').write(f'[out:json][timeout:170];{area}->.a;node["natural"="peak"](area.a)({BBOX});out;')
    r = subprocess.run(['scripts/op.sh', '/tmp/q_area.txt', out], capture_output=True, text=True)
    print(key, r.stdout.strip() or 'FAILED', flush=True)
    time.sleep(1)
