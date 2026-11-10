#!/bin/bash
# usage: op.sh <queryfile> <outfile>  — runs an Overpass query, trying several mirrors
for i in 1 2 3 4 5 6; do
  for ep in "https://maps.mail.ru/osm/tools/overpass/api/interpreter"; do
    code=$(curl -sS -m 200 -A 'alpengipfel-build/0.1' -o "$2.tmp" -w '%{http_code}' --data-urlencode "data@$1" "$ep" 2>/dev/null)
    if [ "$code" = "200" ] && ! grep -q '"remark": "runtime error' "$2.tmp"; then mv "$2.tmp" "$2"; echo "ok $ep $(stat -c%s "$2")"; exit 0; fi
    echo "fail $ep $code" >&2
  done
  sleep $((i*10))
done
exit 1
