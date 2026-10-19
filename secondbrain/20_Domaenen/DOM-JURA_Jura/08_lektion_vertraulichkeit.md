---
type: lesson
title: "Vertraulichkeit"
description: "Berufsgeheimnis, Geschäftsgeheimnis, Mandantendaten: Was ins Modell geht, verlässt das Haus. Wer vorher anonymisiert, braucht nachher nichts zu erklären."
tags:
  - lesson
  - domaene
  - dom-jura
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Vertraulichkeit

## Zwei Arten von Geheimnis

Neben dem Datenschutz aus Lektion 6 gibt es im Recht zwei weitere Gründe,
vorsichtig zu sein:

- **Berufsgeheimnis:** Anwältinnen, Steuerberater, Ärztinnen und andere
  Berufe dürfen Geheimnisse ihrer Mandanten nicht offenbaren, sonst machen sie
  sich strafbar (§ 203 StGB). Dienstleister dürfen sie nur unter engen
  Bedingungen einbeziehen, unter anderem mit einer Verpflichtung zur
  Verschwiegenheit.
- **Geschäftsgeheimnis:** Eine Information ist rechtlich nur dann als
  Geschäftsgeheimnis geschützt, wenn die Firma **angemessene Maßnahmen** zur
  Geheimhaltung getroffen hat (Geschäftsgeheimnisgesetz).

Die einfachste Maßnahme ist dieselbe wie in Stufe 5: Was das Modell für die
Aufgabe nicht braucht, bekommt es nicht.

```aufgabe
id: D6-18
typ: plugplay
titel: "Was vor dem Modell raus muss"
punkte: 30
frage: "Du willst die Haftungsklausel eines Mandantenvertrags von einem externen Modell erklären lassen. Welche Angaben ersetzt du vorher durch Platzhalter?"
bausteine:
  - "Die Namen der Vertragsparteien"
  - "Die Anschrift des Mandanten"
  - "Das Aktenzeichen des Mandats"
  - "Der Wortlaut der Haftungsklausel"
  - "Die Bankverbindung im Anhang"
  - "Die Kündigungsfrist von drei Monaten"
loesung:
  - "Die Namen der Vertragsparteien"
  - "Die Anschrift des Mandanten"
  - "Das Aktenzeichen des Mandats"
  - "Die Bankverbindung im Anhang"
richtzeit_s: 80
hinweise:
  - text: "Was braucht das Modell, um eine Klausel zu erklären?"
    kostet: 5
erklaerung: |
  Für die Erklärung braucht das Modell den Wortlaut, nicht die Beteiligten.
  Namen, Anschrift, Aktenzeichen und Bankdaten machen den Fall erkennbar und
  sind für die Aufgabe überflüssig. Die Kündigungsfrist verrät niemanden.
```

## Was Schweigen nützt

```aufgabe
id: D6-19
typ: denkaufgabe
titel: "Das verlorene Geheimnis"
punkte: 25
frage: "In einer Firma kopieren Beschäftigte seit Monaten interne Kalkulationen in ein öffentliches Gratis-Chatfenster. Es gibt keine Regel dazu. Welches rechtliche Risiko entsteht neben dem Datenabfluss?"
optionen:
  - "Die Firma riskiert, dass die Kalkulationen nicht mehr als Geschäftsgeheimnis geschützt sind, weil angemessene Geheimhaltungsmaßnahmen fehlen."
  - "Keines, solange niemand die Daten veröffentlicht."
  - "Das Chatfenster wird Miteigentümer der Kalkulation."
  - "Die Beschäftigten werden automatisch zu Auftragsverarbeitern."
loesung: "Die Firma riskiert, dass die Kalkulationen nicht mehr als Geschäftsgeheimnis geschützt sind, weil angemessene Geheimhaltungsmaßnahmen fehlen."
richtzeit_s: 60
erklaerung: |
  Wer seine Geheimnisse nicht schützt, kann sich später schwer auf ihren
  Schutz berufen - etwa wenn ein ehemaliger Mitarbeiter sie mitnimmt. Eine
  klare Regel, welches Werkzeug was sehen darf, ist eine solche Maßnahme.
```
