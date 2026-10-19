---
type: lesson
title: "Das CRM pflegen"
description: "Doppelte Firmen, veraltete Kontakte, leere Felder: Jedes Werkzeug ist nur so gut wie das CRM darunter. Dubletten schlägt ein Werkzeug vor, zusammenführen entscheidet ein Mensch."
tags:
  - lesson
  - domaene
  - dom-vk
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Das CRM pflegen

## Mist rein, Mist raus

Die Bewertung aus Lektion 2 liest ihre Angaben aus dem **CRM**, dem System,
in dem alle Kunden und Interessenten stehen. Steht dort dieselbe Firma
dreimal, mit drei verschiedenen Ansprechpersonen und drei Ständen, rechnet
jedes Werkzeug falsch, und drei Kolleginnen rufen denselben Kunden an.

Dubletten zu finden, ist eine gute Aufgabe für ein Werkzeug. Es erkennt, dass
„Müller GmbH" und „Mueller GmbH" vermutlich dieselbe Firma sind. Ob sie es
wirklich sind, ist eine andere Frage.

```aufgabe
id: D4-06
typ: quizkarten
titel: "Dublette oder nicht?"
punkte: 30
frage: "Das Werkzeug hat Paare von Einträgen gefunden. Welche sind wahrscheinlich dieselbe Firma?"
karten:
  - "Müller GmbH, Hauptstraße 5, Kassel / Mueller GmbH, Hauptstr. 5, Kassel"
  - "Schmidt & Partner, Berlin / Schmidt & Partner, München"
  - "Bäckerei Koch, Tel. 0561 1234 / Baeckerei Koch, Tel. 0561 1234"
  - "Nordlicht Solar GmbH / Nordlicht Reisen GmbH"
  - "ABC Logistik AG, info@ / A.B.C. Logistik AG, info@"
stapel: [wahrscheinlich dieselbe, verschiedene Firmen]
loesung:
  "Müller GmbH, Hauptstraße 5, Kassel / Mueller GmbH, Hauptstr. 5, Kassel": wahrscheinlich dieselbe
  "Schmidt & Partner, Berlin / Schmidt & Partner, München": verschiedene Firmen
  "Bäckerei Koch, Tel. 0561 1234 / Baeckerei Koch, Tel. 0561 1234": wahrscheinlich dieselbe
  "Nordlicht Solar GmbH / Nordlicht Reisen GmbH": verschiedene Firmen
  "ABC Logistik AG, info@ / A.B.C. Logistik AG, info@": wahrscheinlich dieselbe
richtzeit_s: 90
hinweise:
  - text: "Achte auf das, was gleich bleibt: Adresse, Telefon, Kernname."
    kostet: 5
erklaerung: |
  Umlaute, Abkürzungen und Punkte ändern nichts an der Firma. Ein anderer Ort
  oder eine andere Branche dagegen schon - „Schmidt & Partner" in Berlin und
  München können zwei Kanzleien sein, die nichts miteinander zu tun haben.
```

## Zusammenführen ist endgültig

Werden zwei Einträge zusammengeführt, verschmelzen Notizen, Angebote und
Verlauf. Das lässt sich oft nicht sauber rückgängig machen.

```aufgabe
id: D4-07
typ: denkaufgabe
titel: "Wer führt zusammen?"
punkte: 25
frage: "Das Werkzeug findet jede Woche rund 30 mögliche Dubletten. Wie sollte das Zusammenführen geregelt sein?"
optionen:
  - "Das Werkzeug schlägt vor, ein Mensch bestätigt jedes Paar, bevor zusammengeführt wird."
  - "Das Werkzeug führt alle Paare sofort zusammen, das spart Zeit."
  - "Dubletten bleiben einfach stehen, sie stören nicht."
  - "Das Modell entscheidet, und nur bei mehr als 50 Paaren schaut jemand."
loesung: "Das Werkzeug schlägt vor, ein Mensch bestätigt jedes Paar, bevor zusammengeführt wird."
richtzeit_s: 50
erklaerung: |
  Finden ist billig, falsch zusammenführen ist teuer. Dreißig Bestätigungen
  pro Woche dauern zehn Minuten. Zwei verschmolzene Kanzleien zu trennen,
  dauert einen Tag - und ist peinlich gegenüber beiden.
```
