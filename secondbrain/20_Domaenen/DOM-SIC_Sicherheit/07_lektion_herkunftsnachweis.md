---
type: lesson
title: "Herkunftsnachweis"
description: "Ist dieses Bild echt, dieses Video von der Chefin, dieser Text von einem Menschen? Wasserzeichen und Herkunftsdaten helfen, aber sie beweisen weniger, als man denkt."
tags:
  - lesson
  - domaene
  - dom-sic
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Herkunftsnachweis

## Woher kommt ein Inhalt?

Das Protokoll aus Lektion 6 weist nach, was im eigenen Haus passiert ist. Bei
Bildern, Videos und Texten von außen ist die Frage schwerer: Wer hat das
gemacht, und ist es verändert worden? Drei Ansätze gibt es heute:

- **Herkunftsdaten** (etwa nach dem Standard C2PA, auch „Content
  Credentials“): signierte Angaben in der Datei, mit welchem Gerät oder Programm
  ein Inhalt entstand und wie er bearbeitet wurde.
- **Unsichtbare Wasserzeichen**, die manche KI-Anbieter in erzeugte Bilder,
  Töne oder Texte einbetten.
- **Kennzeichnung:** Der AI Act verlangt, dass täuschend echte KI-Inhalte als
  solche gekennzeichnet werden (Art. 50).

Alle drei haben Grenzen. Herkunftsdaten gehen beim Weiterleiten oder bei
einem Screenshot oft verloren. Nicht jeder Anbieter setzt Wasserzeichen. Und
Programme, die KI-Texte erkennen wollen, irren häufig.

```aufgabe
id: D7-16
typ: quizkarten
titel: "Stimmt das?"
punkte: 30
frage: "Stimmt die Aussage über Herkunftsnachweise oder nicht?"
karten:
  - "Fehlt ein Wasserzeichen, ist das Bild echt."
  - "Herkunftsdaten können zeigen, mit welchem Programm ein Bild erstellt und bearbeitet wurde."
  - "Bei einem Screenshot gehen Herkunftsdaten meist verloren."
  - "KI-Erkennungsprogramme erkennen KI-Texte zuverlässig."
  - "Täuschend echte KI-Videos müssen nach dem AI Act gekennzeichnet werden."
stapel: [stimmt, stimmt nicht]
loesung:
  "Fehlt ein Wasserzeichen, ist das Bild echt.": stimmt nicht
  "Herkunftsdaten können zeigen, mit welchem Programm ein Bild erstellt und bearbeitet wurde.": stimmt
  "Bei einem Screenshot gehen Herkunftsdaten meist verloren.": stimmt
  "KI-Erkennungsprogramme erkennen KI-Texte zuverlässig.": stimmt nicht
  "Täuschend echte KI-Videos müssen nach dem AI Act gekennzeichnet werden.": stimmt
richtzeit_s: 80
erklaerung: |
  Ein vorhandener Nachweis sagt etwas, ein fehlender fast nichts. Und
  KI-Texterkennung ist so unzuverlässig, dass niemand allein deswegen
  beschuldigt werden darf - weder Beschäftigte noch Bewerberinnen.
```

## Wenn der Nachweis fehlt

```aufgabe
id: D7-17
typ: denkaufgabe
titel: "Das Video im Teamchat"
punkte: 25
frage: "Im Teamchat taucht ein Video auf, in dem der Geschäftsführer scheinbar eine Umstrukturierung ankündigt. Es hat keine Herkunftsdaten. Was tust du?"
optionen:
  - "Über einen anderen, bekannten Kanal bei der Geschäftsführung nachfragen und das Video bis dahin nicht weiterverbreiten."
  - "Es mit einem KI-Erkennungsprogramm prüfen und dem Ergebnis glauben."
  - "Es an alle weiterleiten, damit niemand etwas verpasst."
  - "Davon ausgehen, dass es echt ist, weil die Stimme stimmt."
loesung: "Über einen anderen, bekannten Kanal bei der Geschäftsführung nachfragen und das Video bis dahin nicht weiterverbreiten."
richtzeit_s: 60
erklaerung: |
  Wie beim Anruf in Lektion 4: Die Prüfung läuft über einen zweiten Kanal,
  den du schon kanntest. Eine echte Stimme ist kein Beweis mehr, und ein
  Erkennungsprogramm auch nicht.
```
