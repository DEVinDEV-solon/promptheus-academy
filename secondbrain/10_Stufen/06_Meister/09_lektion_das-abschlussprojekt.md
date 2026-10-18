---
type: lesson
title: "Das Abschlussprojekt"
description: "Idee, Plan, Bau, Test, Betrieb und Übergabe an einem eigenen Projekt — und warum danach der 7. Kurs kommt."
tags:
  - lesson
  - stufe-6
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 45
---

# Das Abschlussprojekt

## Der ganze Weg an einem Stück

Sechs Stufen, und jede hat ein Werkzeug beigesteuert. Das Abschlussprojekt
benutzt sie alle — nicht als Pflichtübung, sondern weil eine Lösung, die
jemand anderes benutzen kann, sie alle braucht:

| Stufe | Was sie zum Projekt beiträgt |
|---|---|
| 1 Entdecker | Du weißt, wo das Modell irren kann |
| 2 Priester | Deine Aufträge an das Modell sind genau |
| 3 Builder | Der Ablauf hat Regeln, Modell, Fehlerfall und Kostendeckel |
| 4 Architekt | Die Teile sind sauber geschnitten, mit Freigabe an der richtigen Stelle |
| 5 Wächter | Rechte, Geheimnisse und Datenschutz sind geprüft |
| 6 Meister | Es ist getestet, dokumentiert und lohnt sich |

## Der Projektbericht

Die Abschlussarbeit ist ein **Projektbericht**: kurz, ehrlich, nachprüfbar. Er
ist das, was du einem Auftraggeber geben würdest — und er folgt den Lektionen
dieser Stufe:

1. **Idee und Domäne** — wer benutzt es, was tut er heute stattdessen? (L1, L8)
2. **Entwurf** — Teile, Pfeile, Regel oder Modell, Freigabe. (Stufe 3 und 4)
3. **Sicherheit** — was schützenswert ist und was es schützt. (Stufe 5)
4. **Tests** — welche Fälle, auch an den Grenzen, und mit wem. (L3, L4)
5. **Betrieb** — Protokoll, Überwachung, Wartung, Anleitung. (L5, L6)
6. **Rechnung** — lohnt es sich, und was zeigt die Zahl nicht? (L7)

Ein guter Bericht verschweigt nicht, was nicht geklappt hat. **Was du über die
Grenzen deiner Lösung weißt, ist genauso viel wert wie das, was sie kann.**

```aufgabe
id: E6-23
typ: schiebe
titel: "Der Weg einer Lösung"
punkte: 30
frage: "Bring die Abschnitte eines Projekts in die Reihenfolge, in der sie entstehen."
bausteine:
  - "Tests mit Grenzfällen und mit Menschen"
  - "Idee und Domäne mit den drei Planungsfragen"
  - "Betrieb mit Überwachung und Anleitung"
  - "Entwurf mit Teilen, Freigaben und Bedrohungsmodell"
  - "Bau in kleinen, gesicherten Schritten"
loesung:
  - "Idee und Domäne mit den drei Planungsfragen"
  - "Entwurf mit Teilen, Freigaben und Bedrohungsmodell"
  - "Bau in kleinen, gesicherten Schritten"
  - "Tests mit Grenzfällen und mit Menschen"
  - "Betrieb mit Überwachung und Anleitung"
richtzeit_s: 80
erklaerung: |
  Planen, entwerfen, bauen, testen, betreiben. Die Sicherheit steht im
  Entwurf, nicht am Ende - wer sie nachträglich einbaut, baut um.
```

## Ehrlich über Grenzen

```aufgabe
id: E6-24
typ: denkaufgabe
titel: "Der ehrliche Bericht"
punkte: 25
frage: "Deine Lösung sortiert 95 von 100 Mails richtig. Was gehört in den Projektbericht?"
optionen:
  - "„Die Lösung sortiert Mails zuverlässig.“"
  - "„95 von 100 Mails richtig; die 5 falschen waren Mails ohne Betreff, sie landen jetzt zur Prüfung bei einem Menschen.“"
  - "Nichts über die Fehler, damit das Projekt besser aussieht."
  - "„Die Lösung hat leider Fehler.“"
loesung: "„95 von 100 Mails richtig; die 5 falschen waren Mails ohne Betreff, sie landen jetzt zur Prüfung bei einem Menschen.“"
richtzeit_s: 50
erklaerung: |
  Eine Zahl, die Ursache der Fehler und die Antwort darauf. Das ist genau
  das, was Stufe 1 gefordert hat: eine Zahl mit Fundstelle statt einer
  Behauptung - diesmal über die eigene Arbeit.
```

## Und danach: der 7. Kurs

Nach dieser Stufe hast du alle sechs bestanden, und der **7. Kurs** wird frei.
Er ist kein weiterer Technikkurs. Er beantwortet eine Frage, die dein
Abschlussprojekt offengelassen hat: *Wie klingt und wie aussieht, was deine
Lösung herstellt?*

Jede Lösung, die Texte, Bilder oder Antworten erzeugt, spricht mit einer
Stimme. Ohne Vorgabe ist es die Stimme des Durchschnitts. Im 7. Kurs schreibst
du deine Brand-Guideline — und danach arbeiten die Werkstatt und das Cinema
Studio nach ihr. Was du in sechs Stufen gebaut hast, bekommt dort deine
Handschrift.

```aufgabe
id: E6-25
typ: planung
titel: "Dein Projektbericht"
punkte: 60
frage: "Schreibe den Projektbericht deines Abschlussprojekts mit den sechs Abschnitten: Idee und Domäne, Entwurf, Sicherheit, Tests, Betrieb und Rechnung. Nenne auch mindestens eine Grenze deiner Lösung. Mindestens 150 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 150
    punkte: 10
    begruendung: "Mindestens 150 Wörter."
  - art: enthaelt_eines
    werte: [entwurf, teile, regel, modell, freigabe]
    punkte: 10
    begruendung: "Du beschreibst den Entwurf."
  - art: enthaelt_eines
    werte: [sicherheit, datenschutz, rechte, schützenswert, personenbezogen]
    punkte: 10
    begruendung: "Du gehst auf die Sicherheit ein."
  - art: enthaelt_eines
    werte: [test, getestet, grenzfall, grenze, testperson]
    punkte: 10
    begruendung: "Du beschreibst die Tests."
  - art: enthaelt_eines
    werte: [betrieb, überwachung, protokoll, wartung, anleitung]
    punkte: 10
    begruendung: "Du beschreibst den Betrieb."
  - art: enthaelt_eines
    werte: [lohnt, spart, stunden, kosten, euro]
    punkte: 10
    begruendung: "Du rechnest, ob es sich lohnt."
richtzeit_s: 1800
erklaerung: |
  Ein Bericht mit diesen sechs Abschnitten und einer ehrlichen Grenze ist
  das Meisterstück dieser Academy. Danach die Abschlussprüfung - und dann
  der 7. Kurs.
```
