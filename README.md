# Alpengipfel

Web-App mit allen benannten Gipfeln der Alpen aus OpenStreetMap: filterbare Liste, Karte und Detailansicht je Gipfel.

## Starten

Die App ist statisch und braucht nur einen Webserver für den Ordner `docs/`:

```bash
python3 -m http.server 8000 --directory docs
```

Danach im Browser `http://localhost:8000` öffnen. Zum Veröffentlichen genügt es, den Ordner `docs/` auf einen beliebigen Webspace zu legen.

## Funktionen

- Liste mit Filtern (Name, Höhe, Land, Bundesland, Gebirgsgruppe), Karte und Detailansicht
- Eigene Adresse je Gipfel unter `docs/gipfel/<name>-<OSM-ID>.html`, dazu `docs/sitemap.xml` für Suchmaschinen
- „In meiner Nähe“: Gipfel nach Entfernung zum eigenen Standort
- Gipfelbuch (bestiegen, Wunschliste), gespeichert im Browser, mit Sichern und Wiederherstellen als Datei
- Bergwetter für 7 Tage mit 3-Stunden-Verlauf, Nullgradgrenze, Wind und Sicht (Open-Meteo, kostenlos nur für nicht-kommerzielle Nutzung)

Die öffentliche Adresse steht als `SITE_URL` in `scripts/build_page.py`; bei einem Umzug dort ändern und neu bauen.

## Daten neu erzeugen

```bash
pip install shapely numpy
python3 scripts/fetch_qlever.py   # lädt Rohdaten nach data/raw/q (vorhandene Dateien werden übersprungen)
python3 scripts/build_data.py     # erzeugt docs/data/peaks.json und docs/data/geo.json
python3 scripts/build_page.py     # erzeugt docs/index.html, docs/assets, die Gipfelseiten und die Sitemap aus src/
```

Für einen frischen Datenstand vorher `data/raw/q` löschen.

## Datenquellen

- Gipfel (`natural=peak` mit Namen, innerhalb der OSM-Umgrenzung der Alpen), Länder, Bundesländer, Wanderrouten: OpenStreetMap, abgefragt über den QLever-Dienst (`qlever.dev/api/osm-planet`). © OpenStreetMap-Mitwirkende, ODbL.
- Gebirgsgruppen: in OpenStreetMap erfasste Flächen der Alpenvereinseinteilung, ergänzt um weitere dort erfasste Massive der West- und Schweizer Alpen (`data/raw/groups.json.gz`, einmalig über Overpass geladen).
- Ländergrenzen und Seen der Übersichtskarte: Natural Earth.

## Was die Angaben bedeuten

- Höhe, Schartenhöhe und Namen stammen unverändert aus OpenStreetMap. Gipfel ohne eingetragene Höhe erscheinen mit „–“.
- Gipfel, die höchstens 50 m von einer Grenze entfernt liegen, zählen für beide Länder bzw. Bundesländer.
- „Routen“ zählt ausgeschilderte Wanderrouten (OSM-Routenrelationen `hiking`/`foot`), die höchstens 100 m am Gipfel vorbeiführen. Kletter- und Hochtourenrouten sind in OpenStreetMap nicht systematisch erfasst.
