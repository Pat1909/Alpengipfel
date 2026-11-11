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
- Wege und Routen je Gipfel, eingeteilt in Wandern, Hochalpin, Klettersteig und Skitour; die Wege um den Gipfel und einzelne markierte Routen lassen sich auf der Karte einzeichnen (live über die Overpass-Schnittstelle von OpenStreetMap)
- Bergwetter für 7 Tage mit 3-Stunden-Verlauf, Nullgradgrenze, Wind und Sicht (Open-Meteo, kostenlos nur für nicht-kommerzielle Nutzung)

Die öffentliche Adresse steht als `SITE_URL` in `scripts/build_page.py`; bei einem Umzug dort ändern und neu bauen.

## Daten neu erzeugen

```bash
pip install shapely numpy
python3 scripts/fetch_qlever.py   # lädt OpenStreetMap-Rohdaten nach data/raw/q (vorhandene Dateien werden übersprungen)
python3 scripts/fetch_c2c.py      # lädt Camptocamp-Routen und -Gipfel nach data/raw/c2c
python3 scripts/build_data.py     # erzeugt docs/data/peaks.json und docs/data/geo.json
python3 scripts/build_page.py     # erzeugt docs/index.html, docs/assets, die Gipfelseiten und die Sitemap aus src/
```

Für einen frischen Datenstand vorher `data/raw/q` und `data/raw/c2c` löschen.

## Datenquellen

- Gipfel (`natural=peak` mit Namen, innerhalb der OSM-Umgrenzung der Alpen), Länder, Bundesländer, Wanderrouten: OpenStreetMap, abgefragt über den QLever-Dienst (`qlever.dev/api/osm-planet`). © OpenStreetMap-Mitwirkende, ODbL.
- Gebirgsgruppen: in OpenStreetMap erfasste Flächen der Alpenvereinseinteilung, ergänzt um weitere dort erfasste Massive der West- und Schweizer Alpen (`data/raw/groups.json.gz`, einmalig über Overpass geladen).
- Hochtouren, Klettereien, Skitouren und weitere Routen: Camptocamp.org, über deren öffentliche Schnittstelle. © Camptocamp-Mitwirkende, CC BY-SA 3.0. Die daraus abgeleiteten Routenangaben in `docs/data/peaks.json` stehen damit ebenfalls unter CC BY-SA 3.0 (Namensnennung, Weitergabe unter gleichen Bedingungen).
- Ländergrenzen und Seen der Übersichtskarte: Natural Earth.

## Was die Angaben bedeuten

- Höhe, Schartenhöhe und Namen stammen unverändert aus OpenStreetMap. Gipfel ohne eingetragene Höhe erscheinen mit „–“.
- Gipfel, die höchstens 50 m von einer Grenze entfernt liegen, zählen für beide Länder bzw. Bundesländer.
- „Wege und Routen auf den Gipfel“ fasst zwei Quellen zusammen:
  - OpenStreetMap: markierte Wanderrouten (Routenrelationen `hiking`/`foot`) und Wege, die höchstens 100 m am Gipfel vorbeiführen, eingeteilt nach dem Abschnitt am Gipfel in Wandern (SAC-Skala T1–T3 oder ohne Angabe), Hochalpin (T4–T6) und Klettersteig (`highway=via_ferrata` oder `via_ferrata_scale`). Führt kein Weg bis zum Gipfel, werden die nächsten Wege bis 300 m Entfernung als „In Gipfelnähe“ genannt.
  - Camptocamp: Routen, die nach dem Gipfel benannt sind. Ein Camptocamp-Gipfel wird dem OpenStreetMap-Gipfel zugeordnet, wenn Name und Lage passen (höchstens 400 m entfernt, Höhe höchstens 100 m abweichend) oder Lage und Höhe fast gleich sind. Einteilung nach Aktivität: Hochtour, Alpinklettern, Klettern, Eisklettern → Hochalpin; Klettersteig; Wandern; Skitour und Schneeschuh → Skitour. Die Titel sind meist französisch oder italienisch.
- Die Wegverläufe auf der Karte werden beim Öffnen eines Gipfels live geladen (Umkreis 2 km): zuerst über den QLever-Dienst (`qlever.dev`), ersatzweise über die Overpass-Schnittstelle. Sind beide nicht erreichbar, bleibt die Karte ohne Wege.
- Hütten (`tourism=alpine_hut` und `wilderness_hut` mit Namen) stammen aus OpenStreetMap, liegen in `docs/data/geo.json` und lassen sich in der Kartenlegende ausblenden.
