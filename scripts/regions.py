# Countries and first-level regions that touch the Alps. key = ISO 3166-2 code (or ISO 3166-1 for countries without states)
COUNTRIES = {'AT': 'Österreich', 'DE': 'Deutschland', 'CH': 'Schweiz', 'IT': 'Italien', 'FR': 'Frankreich',
             'SI': 'Slowenien', 'LI': 'Liechtenstein', 'MC': 'Monaco', 'HU': 'Ungarn'}
STATES = {
 'AT-1': 'Burgenland', 'AT-2': 'Kärnten', 'AT-3': 'Niederösterreich', 'AT-4': 'Oberösterreich', 'AT-5': 'Salzburg',
 'AT-6': 'Steiermark', 'AT-7': 'Tirol', 'AT-8': 'Vorarlberg', 'AT-9': 'Wien',
 'DE-BY': 'Bayern', 'DE-BW': 'Baden-Württemberg',
 'CH-AG': 'Aargau', 'CH-AI': 'Appenzell Innerrhoden', 'CH-AR': 'Appenzell Ausserrhoden', 'CH-BE': 'Bern', 'CH-FR': 'Freiburg',
 'CH-GE': 'Genf', 'CH-GL': 'Glarus', 'CH-GR': 'Graubünden', 'CH-LU': 'Luzern', 'CH-NW': 'Nidwalden', 'CH-OW': 'Obwalden',
 'CH-SG': 'St. Gallen', 'CH-SZ': 'Schwyz', 'CH-TG': 'Thurgau', 'CH-TI': 'Tessin', 'CH-UR': 'Uri', 'CH-VD': 'Waadt',
 'CH-VS': 'Wallis', 'CH-ZG': 'Zug', 'CH-ZH': 'Zürich',
 'IT-21': 'Piemont', 'IT-23': 'Aostatal', 'IT-25': 'Lombardei', 'IT-34': 'Venetien', 'IT-36': 'Friaul-Julisch Venetien',
 'IT-42': 'Ligurien', 'IT-BZ': 'Südtirol', 'IT-TN': 'Trentino',
 'FR-ARA': 'Auvergne-Rhône-Alpes', 'FR-PAC': "Provence-Alpes-Côte d'Azur",
}
# countries queried as a whole (no state level used)
WHOLE = ['SI', 'LI', 'MC', 'HU']
BBOX = '43.0,4.5,48.6,17.0'
