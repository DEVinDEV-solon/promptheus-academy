---
type: lesson
title: "Ein Sicherheitscheck für einen KI-Ablauf"
description: "Alles aus diesem Kurs an einem Stück: ein KI-Ablauf aus deinem Betrieb, geprüft auf Secrets, Rechte, Täuschung, Injection, Protokoll, Herkunft und Ernstfall."
tags:
  - lesson
  - domaene
  - dom-sic
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein Sicherheitscheck für einen KI-Ablauf

## Alles an einem Stück

In den anderen Fachkursen baust du Abläufe. Hier prüfst du sie. Nimm einen
KI-Ablauf, den es in deinem Betrieb gibt oder geben soll, und geh die Fragen
dieses Kurses einmal durch.

| Frage | aus Lektion |
|---|---|
| Wo liegen die Secrets des Ablaufs, und wer kann sie sehen? | 2 — Secrets im Alltag |
| Welche Rechte hat der Ablauf, und welche braucht er wirklich? | 3 — Rechte und Zugänge |
| Kann jemand den Ablauf über eine gefälschte Bitte auslösen? | 4 — Täuschung mit KI |
| Welche fremden Texte liest das Modell, und was schützt vor Injection? | 5 — Prompt-Injection im Betrieb |
| Was wird protokolliert, und ist das Protokoll fälschungssicher? | 6 — Protokolle und Audit-Trail |
| Woher kommen die Inhalte, die der Ablauf verarbeitet oder erzeugt? | 7 — Herkunftsnachweis |
| Was passiert im Ernstfall, und wer ist erreichbar? | 8 — Wenn etwas passiert |

```aufgabe
id: D7-21
typ: multitask
titel: "Der Rechnungsagent unter der Lupe"
punkte: 50
frage: "Ein KI-Agent liest das Postfach der Buchhaltung, legt Rechnungen ab und bereitet Zahlungen vor. Prüfe ihn in zwei Schritten."
schritte:
  - typ: plugplay
    titel: "Die Befunde"
    punkte: 20
    frage: "Welche dieser Eigenschaften des Agenten sind Sicherheitslücken?"
    bausteine:
      - "Sein Zugangsschlüssel steht im Klartext in einer geteilten Tabelle"
      - "Er darf Zahlungen ohne Bestätigung ausführen"
      - "Er protokolliert jede Aktion mit Zeitpunkt und Ergebnis"
      - "Er übernimmt Bankverbindungen aus eingehenden Mails ungeprüft"
      - "Er hat nur Leserechte auf das Postfach"
    loesung:
      - "Sein Zugangsschlüssel steht im Klartext in einer geteilten Tabelle"
      - "Er darf Zahlungen ohne Bestätigung ausführen"
      - "Er übernimmt Bankverbindungen aus eingehenden Mails ungeprüft"
  - typ: quizkarten
    titel: "Die Abhilfe"
    punkte: 30
    frage: "Welche Lektion liefert die Abhilfe für den Befund?"
    karten:
      - "Schlüssel in den Secret-Tresor verschieben und tauschen"
      - "Vor jeder Zahlung bestätigt ein Mensch"
      - "Neue Bankverbindungen nur nach Rückruf über die bekannte Nummer"
      - "Protokoll mit Hashkette und zweitem Speicherort"
    stapel: [Secrets, Rechte und Bestätigung, Täuschung, Protokoll]
    loesung:
      "Schlüssel in den Secret-Tresor verschieben und tauschen": Secrets
      "Vor jeder Zahlung bestätigt ein Mensch": Rechte und Bestätigung
      "Neue Bankverbindungen nur nach Rückruf über die bekannte Nummer": Täuschung
      "Protokoll mit Hashkette und zweitem Speicherort": Protokoll
richtzeit_s: 240
erklaerung: |
  Drei Befunde, jeder mit einer Abhilfe aus diesem Kurs. Das Protokoll ist
  schon gut - mit Hashkette und zweitem Speicherort wird es verlässlich.
```

## Dein Sicherheitscheck

```aufgabe
id: D7-22
typ: planung
titel: "Dein Sicherheitscheck"
punkte: 60
frage: "Prüfe einen KI-Ablauf aus deinem Umfeld. Beantworte die Fragen aus der Tabelle: Secrets, Rechte, Täuschung, Injection, Protokoll, Herkunft der Inhalte und Ernstfall. Nenne für jeden Befund eine Abhilfe. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [secret, schlüssel, passwort, tresor, token]
    punkte: 10
    begruendung: "Du prüfst die Secrets."
  - art: enthaelt_eines
    werte: [rechte, leserecht, berechtigung, geringste]
    punkte: 10
    begruendung: "Du prüfst die Rechte."
  - art: enthaelt_eines
    werte: [injection, anweisung, fremde texte, manipul]
    punkte: 10
    begruendung: "Du denkst an Prompt-Injection."
  - art: enthaelt_eines
    werte: [protokoll, audit, hashkette, log]
    punkte: 10
    begruendung: "Du prüfst das Protokoll."
  - art: enthaelt_eines
    werte: [ernstfall, vorfall, meldung, 72 stunden, notfall, panne]
    punkte: 10
    begruendung: "Du planst den Ernstfall."
richtzeit_s: 900
erklaerung: |
  Ein Sicherheitscheck ist kein einmaliges Dokument. Mach ihn bei jeder
  Änderung am Ablauf neu - neue Rechte, neue Datenquellen, neues Modell - und
  bewahre ihn bei den Unterlagen aus dem Fachkurs Jura auf.
```
