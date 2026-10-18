---
type: lesson
title: "Ein Ablauf auf Papier"
description: "Eingang, Schritte, Ausgang — und an welcher Stelle ein Modell sitzt und an welcher eine feste Regel."
tags:
  - lesson
  - stufe-3
  - automation
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 14
---

# Ein Ablauf auf Papier

## Erst zeichnen, dann bauen

Jede Automation, die später ohne dich läuft, hat vorher auf einem Blatt
Papier gestanden — oder sie hätte es sollen. Der Grund ist nicht Ordnung,
sondern **Sichtbarkeit**: Auf Papier siehst du die Stelle, an der etwas
Unerwartetes ankommen kann. Im fertigen Programm siehst du sie erst, wenn es
passiert ist.

Ein Ablauf hat immer drei Teile:

| Teil | Frage | Beispiel: Rechnungen sortieren |
|---|---|---|
| **Eingang** | Was kommt herein, und woher? | Eine PDF im Postfach |
| **Schritte** | Was passiert damit, in welcher Reihenfolge? | Lesen → Absender erkennen → Ordner wählen |
| **Ausgang** | Was liegt am Ende wo? | Die PDF im Ordner „Rechnungen/2026" |

## Regel oder Modell?

Hier wird es spannend. In Lektion 1 hast du gelernt: An der Entscheidungsstelle
eines Agenten sitzt oft ein Modell. Oft — nicht immer. **Die erste Frage an
jeden Schritt lautet: Brauche ich hier ein Modell, oder reicht eine Regel?**

- *„Ist die Datei eine PDF?"* — eine Regel. Die Dateiendung lügt selten, und
  eine Regel irrt nie zufällig.
- *„Ist das eine Rechnung oder ein Werbebrief?"* — ein Modell. Es gibt keine
  Regel, die alle Rechnungen der Welt erkennt.
- *„Ist der Betrag größer als 500 Euro?"* — wieder eine Regel, sobald der
  Betrag gelesen ist.

Die Faustregel aus Stufe 1 gilt hier praktisch: Ein Modell **zieht** eine
Antwort, es rechnet sie nicht aus. Wo eine Regel genügt, ist sie besser —
schneller, kostenlos und jedes Mal gleich.

```aufgabe
id: E3-02
typ: plugplay
titel: "Regel oder Modell?"
punkte: 30
frage: "Wähle die Schritte, für die du wirklich ein Modell brauchst. Die übrigen erledigt eine feste Regel."
bausteine:
  - "Prüfen, ob die Datei größer als 10 MB ist"
  - "Erkennen, ob eine E-Mail eine Beschwerde ist"
  - "Das Datum aus dem Dateinamen 2026-10-19.pdf lesen"
  - "Einen Brief in drei Sätzen zusammenfassen"
  - "Prüfen, ob ein Betrag über 500 liegt"
  - "Eine freundliche Antwort auf eine Kundenfrage entwerfen"
loesung:
  - "Erkennen, ob eine E-Mail eine Beschwerde ist"
  - "Einen Brief in drei Sätzen zusammenfassen"
  - "Eine freundliche Antwort auf eine Kundenfrage entwerfen"
richtzeit_s: 90
hinweise:
  - text: "Kannst du die Antwort mit einem Vergleich oder einer festen Form prüfen? Dann ist es eine Regel."
    kostet: 5
erklaerung: |
  Größe, Datum im festen Format und ein Betragsvergleich sind Regeln - sie
  irren nie zufällig. Bedeutung erkennen, zusammenfassen und formulieren
  kann keine Regel. Dort gehört das Modell hin, und nur dort.
```

## Die Verzweigung

Ein Ablauf ohne Verzweigung ist eine Liste. Interessant wird er an der Raute:
**Wenn ja, dann hier entlang; wenn nein, dann dort.** Das ist die
Wenn-Dann-Kette aus Stufe 2, Lektion 3 — jetzt mit Pfeilen.

```
[PDF kommt an] --> <Rechnung?> --ja--> [Betrag lesen] --> <über 500?> --ja--> [Mensch fragen]
                        |                                     |
                       nein                                  nein
                        v                                     v
                 [Ordner „Sonstiges"]                  [Ordner „Rechnungen"]
```

Jede Raute verlangt zwei Pfeile. **Ein fehlender Pfeil ist der häufigste
Fehler in jedem Ablauf**: Was passiert, wenn die Antwort weder Ja noch Nein
ist? Wenn das Modell „vielleicht" sagt? Wenn die Datei leer ist?

```aufgabe
id: E3-03
typ: raeumlich
titel: "Der fehlende Pfeil"
punkte: 25
frage: "In diesem Ablauf fehlt ein Weg. An welcher Raute ist nicht festgelegt, was bei „nein“ passiert?"
diagramm: |
  [Mail] --> <Anhang da?> --ja--> <PDF?> --ja--> [Ablegen]
                 |                   |
                nein               (???)
                 v
            [Ignorieren]
optionen: ["Anhang da?", "PDF?", "Ablegen", "Ignorieren"]
loesung: "PDF?"
richtzeit_s: 60
erklaerung: |
  Bei „PDF?" fehlt der Nein-Pfeil. Kommt ein Word-Dokument, weiß der Ablauf
  nicht weiter - in einem echten Programm heißt das: Absturz oder, schlimmer,
  stilles Verschwinden der Datei.
```

## Dein erster Ablauf

```aufgabe
id: E3-04
typ: planung
titel: "Ein Ablauf aus deinem Alltag"
punkte: 40
frage: "Beschreibe einen Ablauf aus deinem Alltag, den eine Maschine übernehmen könnte. Nenne Eingang, Schritte und Ausgang, und sag bei mindestens einem Schritt, ob dort eine Regel oder ein Modell entscheidet. Mindestens 50 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_eines
    werte: [eingang, kommt an, kommt herein, eingabe, startet, auslöser]
    punkte: 10
    begruendung: "Du nennst den Eingang."
  - art: enthaelt_eines
    werte: [ausgang, ergebnis, am ende, ausgabe, landet, liegt dann]
    punkte: 10
    begruendung: "Du nennst den Ausgang."
  - art: enthaelt_eines
    werte: [regel, modell, ki entscheidet, fest]
    punkte: 10
    begruendung: "Du sagst, ob eine Regel oder ein Modell entscheidet."
richtzeit_s: 480
erklaerung: |
  Wer Eingang und Ausgang benennen kann, hat den Ablauf verstanden. Wer
  zusätzlich weiß, wo eine Regel genügt, baut ihn später billiger und
  zuverlässiger als jemand, der überall ein Modell einsetzt.
```
