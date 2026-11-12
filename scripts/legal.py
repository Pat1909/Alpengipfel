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
             '<li>Höhendaten der 3D-Ansicht: Mapzen Terrain Tiles (u. a. SRTM, EU-DEM, Daten der Alpenländer; Nachweise unter <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">Terrain Tiles Attribution</a>)</li>'
             '<li>Schrift Barlow: SIL Open Font License 1.1 · Kartenbibliotheken Leaflet (BSD-2-Clause) und MapLibre GL JS (BSD-3-Clause)</li></ul>'
             '<p>Weitergabe: Die aus OpenStreetMap abgeleiteten Daten dieser Website stehen unter der ODbL, die aus Camptocamp übernommenen Routenangaben unter CC BY-SA 3.0. '
             'Wer sie weiterverwendet, muss die Quellen nennen und Bearbeitungen unter denselben Bedingungen weitergeben. Der Quelltext und die Datendateien liegen offen unter '
             '<a href="https://github.com/Pat1909/Alpengipfel">github.com/Pat1909/Alpengipfel</a>.</p>'
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
    support = ('<h2>Unterstützen über PayPal</h2><p>Über den Link „Unterstützen“ können Sie freiwillig einen Betrag senden. Der Link führt zu PayPal (PayPal (Europe) S.à r.l. et Cie, S.C.A., '
               '22-24 Boulevard Royal, L-2449 Luxemburg). Erst dort werden Daten verarbeitet, nach der <a href="https://www.paypal.com/de/legalhub/privacy-full">Datenschutzerklärung von PayPal</a>. '
               'Wir erhalten von PayPal Ihren Namen, Ihre E-Mail-Adresse und den Betrag und speichern diese Angaben nur, soweit steuerliche Aufbewahrungspflichten es verlangen. '
               'Eine Gegenleistung ist mit der Zahlung nicht verbunden; eine Spendenbescheinigung können wir nicht ausstellen.</p>') if d.get('support_url') else ''
    return f'''<h1>Datenschutzerklärung</h1>
<p>Diese Erklärung beschreibt, welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden. Rechtsgrundlage ist die Datenschutz-Grundverordnung (DSGVO).</p>
<h2>Verantwortlicher</h2>{contact(d)}
<h2>Kurz gesagt</h2>
<ul><li>Die Website verwendet keine Werbung, keine Tracking-Dienste und keine Cookies. Seitenaufrufe zählen wir nur als anonyme Tagessummen.</li>
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
Nur Sie selbst können Ihr Gipfelbuch lesen und ändern. Wir speichern die Daten, solange Ihr Konto besteht. Sie können Ihr Konto mit allen zugehörigen Daten jederzeit selbst löschen: im Gipfelbuch unter „Konto“ → „Konto löschen“. Alternativ genügt eine E-Mail an die oben genannte Adresse.</p>
<p>Das Angebot richtet sich an Personen ab 16 Jahren. Wir erheben wissentlich keine Daten von Kindern.</p>
<h2>Besucherzählung</h2>
<p>Um zu sehen, wie die Website genutzt wird, zählen wir Seitenaufrufe: je Tag die Anzahl der Aufrufe, die Art der Einstiegsseite, von welcher Art Website Besucher kommen
(zum Beispiel Suchmaschine oder soziales Netzwerk, ermittelt aus der Herkunftsangabe Ihres Browsers) und welche Gipfel geöffnet werden. Gespeichert werden nur diese Tagessummen bei Supabase (Speicherort {region}),
keine IP-Adressen, keine Cookies, keine Kennungen und nichts in Ihrem Browser. Einzelne Personen lassen sich daraus nicht erkennen. Beim Übermitteln des Zählers verarbeitet Supabase technisch bedingt Ihre IP-Adresse,
die wir nicht erhalten und nicht speichern. Rechtsgrundlage ist unser berechtigtes Interesse, das Angebot zu verbessern (Art. 6 Abs. 1 lit. f DSGVO). Sie können widersprechen, indem Sie die Verbindung zu supabase.co
in Ihrem Browser blockieren; die Website funktioniert dann ohne Konto weiter.</p>
<h2>Speicherung in Ihrem Browser</h2>
<p>Die Website legt im lokalen Speicher Ihres Browsers ab: Ihr Gipfelbuch, die Einstellung zur Anzeige der Hütten und, falls Sie angemeldet sind, die Anmeldung. Außerdem werden die Dateien der App im Browser zwischengespeichert, damit sie auch ohne Internetverbindung startet. Diese Daten sind für die von Ihnen genutzten Funktionen
erforderlich, werden nicht zu Werbe- oder Analysezwecken verwendet und lassen sich über die Browser-Einstellungen jederzeit löschen. Beim Abmelden wird das Gipfelbuch aus dem Browser entfernt.</p>
<h2>Standort</h2>
<p>Wenn Sie „Standort verwenden“ wählen, fragt Ihr Browser Sie um Erlaubnis. Der Standort wird nur in Ihrem Browser verwendet, um Entfernungen zu berechnen und Sie auf der Karte anzuzeigen. Er wird weder an uns noch an Dritte übermittelt und nicht gespeichert.</p>
<h2>Eingebundene Dienste</h2>
<p>Die folgenden Inhalte lädt Ihr Browser direkt beim jeweiligen Anbieter. Dabei wird Ihre IP-Adresse an den Anbieter übermittelt, bei Wetter und Wegen außerdem die Koordinaten bzw. die Kennung des geöffneten Gipfels.
Rechtsgrundlage ist unser berechtigtes Interesse, Karte, Wetter und Wege anzuzeigen (Art. 6 Abs. 1 lit. f DSGVO).</p>
<ul><li><b>Kartenbilder:</b> OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich (<a href="https://osmfoundation.org/wiki/Privacy_Policy">Datenschutzerklärung</a>)</li>
<li><b>Höhendaten der 3D-Ansicht</b> (nur wenn Sie diese öffnen): Terrain Tiles, bereitgestellt über Amazon Web Services, Inc., 410 Terry Avenue North, Seattle, WA 98109, USA; dabei kann Ihre IP-Adresse in die USA übermittelt werden</li>
<li><b>Wettervorhersage:</b> Open-Meteo, Bischofszell, Schweiz (<a href="https://open-meteo.com/en/terms">Bedingungen und Datenschutz</a>)</li>
<li><b>Wegverläufe:</b> QLever, Lehrstuhl für Algorithmen und Datenstrukturen der Albert-Ludwigs-Universität Freiburg, Deutschland; ersatzweise die Overpass-Schnittstellen von FOSSGIS e.V., Deutschland (overpass-api.de), und Private.coffee, Österreich</li></ul>
<p>Schriften und Programmbibliotheken werden von dieser Website selbst ausgeliefert, nicht von Dritten.</p>
{support}<h2>Links zu anderen Websites</h2>
<p>Die Website verlinkt unter anderem auf OpenStreetMap, Wikipedia, Camptocamp, Waymarked Trails, OpenTopoMap und Windy. Erst wenn Sie einen solchen Link öffnen, gelten die Datenschutzbestimmungen des jeweiligen Anbieters.</p>
<h2>Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitungen, die auf berechtigtem Interesse beruhen.
Wenden Sie sich dazu an die oben genannte Adresse. Außerdem können Sie sich bei {authority} beschweren.</p>
<p>Stand: {stand}</p>'''


def nutzungsbedingungen(d):
    stand = datetime.date.today().strftime('%d.%m.%Y')
    return f"""<h1>Nutzungsbedingungen</h1>
<p>Diese Bedingungen gelten für die Nutzung von Alpengipfel als Website und als App. Anbieter ist {E(d['name'])}; die Kontaktdaten stehen im <a href="impressum.html">Impressum</a>.</p>
<h2>1. Leistung</h2>
<p>Alpengipfel zeigt Informationen zu Gipfeln der Alpen: Lage, Höhe, Wege und Routen, Hütten, Ausgangspunkte und Wettervorhersagen. Die Nutzung ist kostenlos. Es gibt keine kostenpflichtigen Funktionen, keine Abonnements und keine Käufe in der App.
Ein Anspruch auf ständige Verfügbarkeit oder auf bestimmte Funktionen besteht nicht.</p>
<h2>2. Keine Gewähr für die Angaben, Touren auf eigene Gefahr</h2>
<p>Die Angaben stammen aus frei verfügbaren Quellen (unter anderem OpenStreetMap, Camptocamp und Open-Meteo) und werden von Freiwilligen gepflegt. Sie können unvollständig, veraltet oder falsch sein.
Das gilt besonders für Wegverläufe, Schwierigkeitsangaben und Wetter. Alpengipfel ersetzt keine Tourenplanung mit aktuellen Karten, Führerliteratur, Lawinen- und Wetterbericht und keine eigene Beurteilung vor Ort.
Bergtouren unternehmen Sie auf eigene Gefahr.</p>
<h2>3. Konto</h2>
<p>Für das Gipfelbuch auf mehreren Geräten können Sie ein kostenloses Konto anlegen. Voraussetzung ist ein Mindestalter von 16 Jahren. Wählen Sie einen Benutzernamen, der keine Rechte Dritter verletzt und nicht beleidigend ist,
und halten Sie Ihr Passwort geheim. Sie können Ihr Konto jederzeit in der App löschen (Gipfelbuch → Konto → Konto löschen). Wir können Konten sperren oder löschen, die missbräuchlich verwendet werden.</p>
<h2>4. Erlaubte Nutzung</h2>
<p>Sie dürfen Alpengipfel für private Zwecke nutzen. Nicht erlaubt ist es, den Dienst zu stören, Schutzmaßnahmen zu umgehen oder Inhalte automatisiert in großem Umfang abzurufen.
Die Daten selbst stehen unter den im Impressum genannten freien Lizenzen und können bei den jeweiligen Quellen bezogen werden.</p>
<h2>5. Haftung</h2>
<p>Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Im Übrigen ist die Haftung für die unentgeltliche Bereitstellung im gesetzlich zulässigen Umfang ausgeschlossen.</p>
<h2>6. Änderungen</h2>
<p>Wir können diese Bedingungen anpassen, etwa wenn Funktionen hinzukommen. Die jeweils aktuelle Fassung steht auf dieser Seite. Es gilt deutsches Recht; zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes bleiben unberührt.</p>
<p>Stand: {stand}</p>"""
