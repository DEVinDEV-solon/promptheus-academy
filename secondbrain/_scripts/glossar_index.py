# -*- coding: utf-8 -*-
"""Schreibt die A-Z-Nabe des Glossars aus den Begriffsnotizen neu.

Warum erzeugt und nicht von Hand gepflegt: Titel und Beschreibung stehen schon
in der Frontmatter jeder Notiz. Stuenden sie zusaetzlich in einer Liste, gaebe
es zwei Wahrheiten -- und eines Tages einen Begriff, der in der Uebersicht
anders heisst als auf seiner eigenen Seite.

Aufruf aus dem Programmordner:

    python secondbrain/_scripts/glossar_index.py
"""
import io
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.dirname(HIER)
GLOSSAR = os.path.join(VAULT, '90_Bibliothek', 'Glossar')

# Die Achsen, nach denen sortiert wird. Ein Glossar allein alphabetisch ist eine
# Wand; nach Feldern gruppiert findet man auch, wonach man nicht suchen kann.
FELDER = [
    ('ki',              'Wie ein Sprachmodell arbeitet'),
    ('agentik',         'Agenten, Werkzeuge und ihre Grenzen'),
    ('hardware',        'Womit gerechnet wird'),
    ('offenheit',       'Offen und geschlossen'),
    ('automation',      'Automatisierung und Robotik'),
    ('erkennung',       'Erkennen, was von einer Maschine stammt'),
    ('medienkompetenz', 'Sich in Behauptungen zurechtfinden'),
    ('psychologie',     'Wie Lernen wirkt'),
    ('academy',         'Sprache dieser Academy'),
]


def frontmatter(text):
    """Die Kopfdaten einer OKF-Notiz -- flach, ohne YAML-Bibliothek."""
    m = re.match(r'^---\r?\n(.*?)\r?\n---', text, re.S)
    if not m:
        return {}
    kopf, tags = {}, []
    in_tags = False
    for zeile in m.group(1).split('\n'):
        if re.match(r'^\s*-\s', zeile) and in_tags:
            tags.append(zeile.strip()[2:].strip())
            continue
        in_tags = False
        paar = re.match(r'^([a-zA-Z_]+):\s*(.*)$', zeile)
        if not paar:
            continue
        schluessel, wert = paar.group(1), paar.group(2).strip()
        if schluessel == 'tags' and wert == '':
            in_tags = True
            continue
        kopf[schluessel] = wert.strip('"')
    kopf['tags'] = tags
    return kopf


def sammeln():
    aus = []
    for datei in sorted(os.listdir(GLOSSAR)):
        if not datei.endswith('.md') or datei.startswith('_'):
            continue
        kopf = frontmatter(io.open(os.path.join(GLOSSAR, datei), encoding='utf-8').read())
        if not kopf.get('title'):
            print('  ohne Titel, uebersprungen:', datei)
            continue
        aus.append({
            'slug':  datei[:-3],
            'titel': kopf['title'],
            'was':   kopf.get('description', ''),
            'tags':  kopf.get('tags', []),
        })
    return aus


def bauen(begriffe):
    z = ['---',
         'type: index',
         'title: "Glossar"',
         'description: "Fremdwörter und Fachbegriffe der Academy — '
         'je Begriff eine Notiz, verbunden über ihre Nachbarn."',
         'tags:',
         '  - index',
         '  - glossar',
         '  - bibliothek',
         'timestamp: 2026-08-22T00:00:00+02:00',
         'kontext: "[[PROMPTHEUS WISSEN]]"',
         '---',
         '',
         '# Glossar',
         '',
         'Jeder Begriff hat eine eigene Notiz. Das ist Absicht: Die verwandten',
         'Schlagworte, die im Programm neben der Erklärung stehen, sind die',
         'Wikilinks dieser Notiz — sie kommen aus dem Graphen und nicht aus einer',
         'zweiten, von Hand gepflegten Liste.',
         '',
         '> Diese Seite wird erzeugt. Neue Begriffe kommen als eigene Datei in',
         '> diesen Ordner; danach `python secondbrain/_scripts/glossar_index.py`.',
         '']

    # Aufzählung statt Tabelle: Ein Wikilink mit Alias braucht in einer
    # Markdown-Tabelle einen maskierten Strich, und der macht den Link tot.
    # Ein Listenpunkt kommt ohne aus.
    #
    # Jeder Begriff steht genau einmal. Wer zwei Felder trägt — „Wasserzeichen"
    # ist KI-Technik UND Erkennung —, landet beim ersten; sonst stünde er
    # zweimal da und die Übersicht wäre länger als das Glossar.
    vergeben = set()

    def liste(teil):
        for eintrag in sorted(teil, key=lambda x: x['titel'].lower()):
            vergeben.add(eintrag['slug'])
            z.append('- [[%s]] — **%s**: %s'
                     % (eintrag['slug'], eintrag['titel'], eintrag['was']))
        z.append('')

    for tag, ueberschrift in FELDER:
        teil = [b for b in begriffe
                if tag in b['tags'] and b['slug'] not in vergeben]
        if not teil:
            continue
        z += ['## %s' % ueberschrift, '']
        liste(teil)

    rest = [b for b in begriffe if b['slug'] not in vergeben]
    if rest:
        z += ['## Weitere', '']
        liste(rest)

    z += ['---', '',
          '%d Begriffe. Der Bestand wächst mit dem Stoff: Was in einer Lektion '
          'erklärt werden muss, gehört hierher.' % len(begriffe), '']
    return '\n'.join(z)


def main():
    if not os.path.isdir(GLOSSAR):
        print('Kein Glossar-Ordner:', GLOSSAR)
        return 1
    begriffe = sammeln()
    ziel = os.path.join(GLOSSAR, '_index.md')
    io.open(ziel, 'w', encoding='utf-8', newline='\n').write(bauen(begriffe))
    print('%d Begriffe -> %s' % (len(begriffe), ziel))
    return 0


if __name__ == '__main__':
    sys.exit(main())
