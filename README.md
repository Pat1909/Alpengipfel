# Alpengipfel

Web-App mit allen benannten Gipfeln der Alpen aus OpenStreetMap: filterbare Liste, Karte und Detailansicht je Gipfel.

## Starten

Die App ist statisch und braucht nur einen Webserver für den Ordner `docs/`:

```bash
python3 -m http.server 8000 --directory docs
```

Danach im Browser `http://localhost:8000` öffnen. Zum Veröffentlichen genügt es, den Ordner `docs/` auf einen beliebigen Webspace zu legen.

## Funktionen

- Handy: Navigation am unteren Rand, Liste als ziehbares Blatt über der Karte, Filter einklappbar
- Gipfel-Detail mit Reitern (Übersicht, Routen, Wetter, Anfahrt) und dem heutigen Gipfelwetter oben
- Farbschema wählbar im Profil (automatisch, hell, dunkel); Camptocamp-Routentitel werden für häufige französische und italienische Begriffe übersetzt
- Startseite mit Suche, Schnellzugriffen (Viertausender, Klettersteige, Länder …) und Gipfelbuch-Übersicht; Profilseite mit Konto und eigener Statistik
- Liste mit Filtern (Name, Höhe, Land, Bundesland, Gebirgsgruppe), Karte und Detailansicht
- Eigene Adresse je Gipfel unter `docs/gipfel/<name>-<OSM-ID>.html`, dazu `docs/sitemap.xml` für Suchmaschinen
- „In meiner Nähe“: Gipfel nach Entfernung zum eigenen Standort
- Gipfelbuch (bestiegen, Wunschliste), gespeichert im Browser, mit Sichern und Wiederherstellen als Datei
- Wege und Routen je Gipfel, eingeteilt in Wandern, Hochalpin, Klettersteig und Skitour; die Wege um den Gipfel und einzelne markierte Routen lassen sich auf der Karte einzeichnen (live über die Overpass-Schnittstelle von OpenStreetMap)
- Ausgangspunkte je Gipfel: die nächsten öffentlichen Parkplätze und Haltestellen (Bus, Bahn, Seilbahn) nach Luftlinie, in der Liste und auf der Karte
- Installierbar als App (Manifest und Service Worker); Liste, Karte ohne Hintergrund und Gipfelbuch funktionieren auch ohne Netz
- Schneller Start: `docs/data/peaks.json` enthält nur die Spalten für Liste und Karte, die Angaben je Gipfel liegen in `docs/data/d/` und werden beim Öffnen geladen
- 3D-Ansicht je Gipfel: Geländekarte mit Wegen (MapLibre GL JS mit Höhendaten der Mapzen Terrain Tiles), wird erst beim Öffnen geladen
- Bergwetter für 7 Tage mit 3-Stunden-Verlauf, Nullgradgrenze, Wind und Sicht (Open-Meteo, kostenlos nur für nicht-kommerzielle Nutzung)

Die öffentliche Adresse steht als `SITE_URL` in `scripts/build_page.py`; bei einem Umzug dort ändern und neu bauen.

## Nutzerkonten

Angemeldete Nutzer bekommen ihr Gipfelbuch aus einem Supabase-Projekt. Registrierung mit Benutzername, E-Mail-Adresse und Passwort, Bestätigung über einen Code aus der E-Mail, Anmeldung mit E-Mail-Adresse und Passwort. Projektadresse und öffentlicher Schlüssel stehen in `src/app.js` (`SB_URL`, `SB_KEY`). Einmalig im Supabase-Projekt nötig:

1. `supabase/gipfelbuch.sql` im SQL Editor ausführen (Gipfelbücher, eindeutige Benutzernamen).
2. Unter Authentication → URL Configuration die Site URL auf die Adresse der App setzen und dieselbe Adresse mit `**` am Ende bei Redirect URLs eintragen. Damit führen die Links in den Standard-E-Mails zurück in die App.
3. Für einen Code statt eines Links: eigenen E-Mail-Versand (SMTP) hinterlegen und in den Vorlagen „Confirm signup“ und „Reset password“ `{{ .Token }}` einsetzen. Neue Gratis-Projekte können die Vorlagen ohne eigenen SMTP-Versand nicht ändern. Die App kommt mit beidem zurecht.

## Impressum und Datenschutzerklärung

Beide Seiten entstehen beim Bauen aus `src/legal.json` (Aufbau siehe `scripts/legal.py`). Fehlt die Datei, gibt es die Seiten und die Links darauf nicht. Die Texte sind ein sorgfältiger Entwurf, keine Rechtsberatung.

Schriften, Leaflet und die Supabase-Bibliothek liegen in `src/vendor` und werden von der Seite selbst ausgeliefert, damit dafür kein fremder Dienst kontaktiert wird.

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
  - OpenStreetMap: markierte Wanderrouten (Routenrelationen `hiking`/`foot`) und Wege, die höchstens 100 m am Gipfel vorbeiführen, eingeteilt nach dem Abschnitt am Gipfel in Wandern (SAC-Skala T1–T3 oder ohne Angabe), Hochalpin (T4–T6) und Klettersteig (`highway=via_ferrata` oder `via_ferrata_scale`). Führt kein Weg bis zum Gipfel, werden die nächsten Wege bis 300 m Entfernung als „In Gipfelnähe“ genannt. Eine markierte Route zählt nur, wenn einer ihrer Wege bis auf 40 m an den Gipfel heranreicht (oder bis 100 m, wenn die Route nach dem Gipfel benannt ist), höchstens 8 je Gipfel. Fernwanderwege (Netz `iwn`/`nwn`, über 30 km oder am Namen erkannt: E-Wege, Via Alpina, Landesrundwanderwege, Höhenwege, Weitwanderwege x01–x10 …) werden nicht als Aufstieg, sondern gesondert als „Fernwanderwege über den Gipfel“ genannt.
  - Aufstiege vom Parkplatz (nur auf der Website): beim Öffnen des Reiters „Routen“ lädt die App über QLever das Wegenetz (Wege, Fahrwege, Straßen) und die Parkplätze der Gemeinden im Umkreis von 6 km (vorab bestimmt, Spalte `ar`) und sucht im Browser mit Dijkstra den Weg vom besten Parkplatz zum Gipfel: den leichtesten Weg ohne Klettersteig, je markierter Route einen Weg, der diese Route nutzt, und je Klettersteig in der Nähe einen Weg über ihn (z. B. Königsjodler am Hochkönig). Höhenmeter aus den Terrain Tiles, Gehzeit nach DIN 33466. Für markierte Routen und Klettersteige beginnt die Suche dort, wo die Route unten anfängt (z. B. Höllentalangerhütte): Die App lädt dort zusätzlich Wege und Parkplätze und nimmt den Parkplatz, der zu Fuß am nächsten an diesem Anfang liegt. Gesicherte Abschnitte mit gleichem Wegnamen gelten zusammen als ein Klettersteig. Aufstiege ohne eigenen Namen heißen nach den Hütten am Weg. Jeder Aufstieg lässt sich antippen und wird dann allein auf der Karte gezeigt. Camptocamp-Routen bleiben Links (deren Schnittstelle erlaubt keinen Abruf von fremden Websites); gezeigt werden die ersten fünf, Normalwege zuerst.
  - Camptocamp: Routen, die nach dem Gipfel benannt sind. Ein Camptocamp-Gipfel wird dem OpenStreetMap-Gipfel zugeordnet, wenn Name und Lage passen (höchstens 400 m entfernt, Höhe höchstens 100 m abweichend) oder Lage und Höhe fast gleich sind. Einteilung nach Aktivität: Hochtour, Alpinklettern, Klettern, Eisklettern → Hochalpin; Klettersteig; Wandern; Skitour und Schneeschuh → Skitour. Die Titel sind meist französisch oder italienisch.
- Die Wegverläufe auf der Karte werden beim Öffnen eines Gipfels live geladen (Umkreis 2 km): zuerst über den QLever-Dienst (`qlever.dev`), ersatzweise über die Overpass-Schnittstelle. Sind beide nicht erreichbar, bleibt die Karte ohne Wege.
- Hütten (`tourism=alpine_hut` und `wilderness_hut` mit Namen) stammen aus OpenStreetMap, liegen in `docs/data/geo.json` und lassen sich in der Kartenlegende ausblenden.
