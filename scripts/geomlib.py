import json
from shapely.geometry import LineString, Polygon, MultiPolygon
from shapely.ops import polygonize, unary_union

def relation_polygon(rel):
    """Build a (multi)polygon from an Overpass relation with `out geom` members."""
    outer, inner = [], []
    for m in rel.get('members', []):
        if m['type'] != 'way' or 'geometry' not in m: continue
        pts = [(p['lon'], p['lat']) for p in m['geometry'] if p]
        if len(pts) < 2: continue
        (inner if m.get('role') == 'inner' else outer).append(LineString(pts))
    if not outer: return None
    polys = list(polygonize(unary_union(outer)))
    if not polys: return None
    geom = unary_union(polys)
    if inner:
        holes = list(polygonize(unary_union(inner)))
        if holes: geom = geom.difference(unary_union(holes))
    return geom if not geom.is_empty else None
