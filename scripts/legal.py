"""Impressum and Datenschutzerklärung, generated from src/legal.json.

src/legal.json holds the operator's details, for example:
{
  "country": "AT",                       "AT" or "DE"
  "name": "Vorname Nachname",
  "street": "Straße 1",
  "city": "1234 Ort",
  "email": "name@example.com",
  "phone": "",                           optional
  "purpose": "Private, nicht kommerzielle Website über die Gipfel der Alpen.",
  "supabase_region": "EU (Frankfurt)"
}
These texts are a careful draft, not legal advice.
"""
import datetime, html

E = html.escape


def contact(d):
    lines = [d['name'], d['street'], d['city'], {'AT': 'Österreich', 'DE': 'Deutschland'}.get(d['country'], d['country'])]
    out = '<p>' + '<br>'.join(E(x) for x in lines if x) + '</p><p>E-Mail: ' + E(d['email'])
    if d.get('phone'): out += '<br>Telefon: ' + E(d['phone'])
    return out + '</p>'


def impressum(d):
    at = d['country'] == 'AT'
    head = 'Angaben gemäß § 5 ECG und Offenlegung gemäß § 25 Mediengesetz' if at else 'Angaben gemäß § 5 DDG'
    body = f'<h1>Impressum</h1><h2>{head}</h2><h3>Medieninhaber und Herausgeber</h3>' if at else f'<h1>Impressum</h1><h2>{head}</h2>'
    body += contact(d)
    body += f"<h3>{'Unternehmensgegenstand und grundlegende Richtung' if at else 'Inhalt der Website'}</h3><p>{E(d.get('purpose') or 'Informationen über die Gipfel der Alpen.')}</p>"
    if not at: body += f"<h3>Verantwortlich für den Inhalt</h3><p>{E(d['name'])}, Anschrift wie oben</p>"
    body += ('<h2>Datenquellen und Lizenzen</h2><ul>'
             '<li>Gipfel, Wege, Hütten, Grenzen: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, Open Database License (ODbL)</li>'
             '<li>Hochtouren, Klettereien, Skitouren und weitere Routen: © <a href="https://www.camptocamp.org/">Camptocamp.org</a>-Mitwirkende, CC BY-SA 3.0</li>'
             '<li>Wettervorhersage: <a href="https://open-meteo.com/">Open-Meteo.com</a>, CC BY 4.0</li>'
             '<li>Ländergrenzen und Seen der Übersichtskarte: Natural Earth (gemeinfrei)</li>'
             '<li>Schrift Barlow: SIL Open Font License 1.1 · Kartenbibliothek Leaflet: BSD-2-Clause</li></ul>'
             '<h2>Haftungshinweis</h2><p>Alle Angaben zu Gipfeln, Wegen, Routen, Schwierigkeiten, Hütten und Wetter stammen aus frei verfügbaren Quellen und werden ohne Gewähr '
             'für Richtigkeit, Vollständigkeit und Aktualität bereitgestellt. Sie ersetzen keine Tourenplanung mit aktuellen Karten, Führerliteratur, Lawinen- und Wetterbericht. '
             'Touren im Gebirge erfolgen auf eigene Gefahr.</p>'
             '<p>Diese Website enthält Links zu fremden Websites. Für deren Inhalte sind ausschließlich die jeweiligen Betreiber verantwortlich.</p>')
    return body


def datenschutz(d):
    at = d['country'] == 'AT'
    authority = ('der österreichischen Datenschutzbehörde (<a href="https://www.dsb.gv.at/">www.dsb.gv.at</a>)' if at
                 else 'einer Datenschutz-Aufsichtsbehörde, zum Beispiel der Ihres Bundeslandes')
    region = E(d.get('supabase_region') or 'EU')
    stand = datetime.date.today().strftime('%d.%m.%Y')
    return f'''<h1>Datenschutzerklärung</h1>
<p>Diese Erklärung beschreibt, welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden. Rechtsgrundlage ist die Datenschutz-Grundverordnung (DSGVO).</p>
<h2>Verantwortlicher</h2>{contact(d)}
<h2>Kurz gesagt</h2>
<ul><li>Die Website verwendet keine Werbung, keine Analyse- oder Tracking-Dienste und keine Cookies zu solchen Zwecken.</li>
<li>Ohne Anmeldung bleiben Ihr Gipfelbuch und Ihre Einstellungen ausschließlich in Ihrem Browser.</li>
<li>Nur wenn Sie ein Konto anlegen, speichern wir Benutzername, E-Mail-Adresse, Passwort (als Prüfwert) und Ihr Gipfelbuch.</li>
<li>Für Karte, Wetter und Wegverläufe ruft Ihr Browser Daten bei den unten genannten Diensten ab; diese erfahren dabei technisch bedingt Ihre IP-Adresse.</li></ul>
<h2>Hosting</h2>
<p>Die Website wird über GitHub Pages ausgeliefert, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf verarbeitet GitHub technisch notwendige Daten,
insbesondere IP-Adresse, Zeitpunkt, aufgerufene Seite und Angaben zum Browser, um die Seiten auszuliefern und den Dienst abzusichern. Rechtsgrundlage ist unser berechtigtes Interesse an einem zuverlässigen Betrieb
(Art. 6 Abs. 1 lit. f DSGVO). Dabei können Daten in die USA übermittelt werden; GitHub ist unter dem EU-US Data Privacy Framework zertifiziert. Näheres in der
<a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement">Datenschutzerklärung von GitHub</a>.</p>
<h2>Konto und Gipfelbuch</h2>
<p>Die Anmeldung ist freiwillig. Wenn Sie sich anmelden, verarbeiten wir Ihren Benutzernamen, Ihre E-Mail-Adresse (für den Bestätigungscode und zum Zurücksetzen des Passworts) und Ihr Passwort, das nur als nicht umkehrbarer Prüfwert gespeichert wird, sowie Ihr Gipfelbuch
(bestiegene Gipfel mit Datum, Wunschliste), damit es auf allen Ihren Geräten verfügbar ist. Rechtsgrundlage ist die Bereitstellung der von Ihnen gewünschten Funktion (Art. 6 Abs. 1 lit. b DSGVO).</p>
<p>Konto und Gipfelbuch werden bei unserem Auftragsverarbeiter Supabase, Inc., 970 Toa Payoh North #07-04, Singapur 318992, gespeichert; der Speicherort der Datenbank ist {region}.
Nur Sie selbst können Ihr Gipfelbuch lesen und ändern. Wir speichern die Daten, solange Ihr Konto besteht. Sie können die Löschung Ihres Kontos und aller zugehörigen Daten jederzeit per E-Mail an die oben genannte Adresse verlangen.</p>
<h2>Speicherung in Ihrem Browser</h2>
<p>Die Website legt im lokalen Speicher Ihres Browsers ab: Ihr Gipfelbuch, die Einstellung zur Anzeige der Hütten und, falls Sie angemeldet sind, die Anmeldung. Diese Daten sind für die von Ihnen genutzten Funktionen
erforderlich, werden nicht zu Werbe- oder Analysezwecken verwendet und lassen sich über die Browser-Einstellungen jederzeit löschen. Beim Abmelden wird das Gipfelbuch aus dem Browser entfernt.</p>
<h2>Standort</h2>
<p>Wenn Sie „Standort verwenden“ wählen, fragt Ihr Browser Sie um Erlaubnis. Der Standort wird nur in Ihrem Browser verwendet, um Entfernungen zu berechnen und Sie auf der Karte anzuzeigen. Er wird weder an uns noch an Dritte übermittelt und nicht gespeichert.</p>
<h2>Eingebundene Dienste</h2>
<p>Die folgenden Inhalte lädt Ihr Browser direkt beim jeweiligen Anbieter. Dabei wird Ihre IP-Adresse an den Anbieter übermittelt, bei Wetter und Wegen außerdem die Koordinaten bzw. die Kennung des geöffneten Gipfels.
Rechtsgrundlage ist unser berechtigtes Interesse, Karte, Wetter und Wege anzuzeigen (Art. 6 Abs. 1 lit. f DSGVO).</p>
<ul><li><b>Kartenbilder:</b> OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich (<a href="https://osmfoundation.org/wiki/Privacy_Policy">Datenschutzerklärung</a>)</li>
<li><b>Wettervorhersage:</b> Open-Meteo, Bischofszell, Schweiz (<a href="https://open-meteo.com/en/terms">Bedingungen und Datenschutz</a>)</li>
<li><b>Wegverläufe:</b> QLever, Lehrstuhl für Algorithmen und Datenstrukturen der Albert-Ludwigs-Universität Freiburg, Deutschland; ersatzweise die Overpass-Schnittstellen von FOSSGIS e.V., Deutschland (overpass-api.de), und Private.coffee, Österreich</li></ul>
<p>Schriften und Programmbibliotheken werden von dieser Website selbst ausgeliefert, nicht von Dritten.</p>
<h2>Links zu anderen Websites</h2>
<p>Die Website verlinkt unter anderem auf OpenStreetMap, Wikipedia, Camptocamp, Waymarked Trails, OpenTopoMap und Windy. Erst wenn Sie einen solchen Link öffnen, gelten die Datenschutzbestimmungen des jeweiligen Anbieters.</p>
<h2>Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitungen, die auf berechtigtem Interesse beruhen.
Wenden Sie sich dazu an die oben genannte Adresse. Außerdem können Sie sich bei {authority} beschweren.</p>
<p>Stand: {stand}</p>'''
