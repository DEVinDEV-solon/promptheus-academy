---
type: lesson
title: "Sicherheit & Secrets — Einstieg"
description: "Mit KI kommen neue Angriffe ins Büro und neue Wege, auf denen Geheimnisse abfließen. Welche Abwehr darf automatisch laufen, und wo entscheidet ein Mensch?"
tags:
  - lesson
  - domaene
  - dom-sic
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 10
---

# Sicherheit & Secrets — Einstieg

## Die Frage, die in jeder Domäne zuerst kommt

Nicht „Was kann KI hier tun?“, sondern: **Welche Entscheidung wird hier
getroffen, und was passiert, wenn sie falsch ist?**

In der Sicherheit sind die Folgen oft groß und schwer umkehrbar: ein
Schlüssel im Netz, ein Konto mit zu vielen Rechten, eine Überweisung nach
einem gefälschten Anruf. Mit KI kommen neue Wege hinzu: Anweisungen in
Dokumenten, geklonte Stimmen, Geheimnisse in Chatfenstern. In Stufe 5 hast du
die Grundlagen gelernt. Dieser Kurs bringt sie in den Arbeitsalltag.

Ein Vorschlag, den ein Mensch prüft, ist etwas anderes als eine Entscheidung,
die durchläuft. Das hast du in Stufe 3 als **Freigabe** kennengelernt. In
diesem Kurs wendest du es auf die Sicherheit an.

```aufgabe
id: D7-01
typ: denkaufgabe
titel: "Vorschlag oder Entscheidung?"
punkte: 20
frage: "Ein KI-System arbeitet im Bereich Sicherheit. Wann ist es unbedenklich, wann braucht es eine menschliche Freigabe?"
optionen:
  - "Unbedenklich, solange es nur Vorschläge macht, die ein Mensch prüft."
  - "Unbedenklich, solange es schneller ist als ein Mensch."
  - "Unbedenklich, solange die Trefferquote über 95 Prozent liegt."
  - "Unbedenklich, solange niemand widerspricht."
loesung: "Unbedenklich, solange es nur Vorschläge macht, die ein Mensch prüft."
richtzeit_s: 50
erklaerung: |
  Geschwindigkeit und Trefferquote sagen nichts über die Folgen eines
  Fehlers. 95 Prozent heißt: jeder zwanzigste Fall geht daneben - bei
  tausend Vorgängen sind das fünfzig Menschen.
```

## Schnell abwehren, bewusst entscheiden

In der Sicherheit gilt eine Besonderheit: Manche Abwehr muss **sofort und
automatisch** laufen, weil ein Angriff nicht wartet. Eine verdächtige
Anmeldung wird gesperrt, nicht erst am Montag besprochen. Was dagegen Rechte
vergibt, Dienste umbaut oder nach außen meldet, entscheidet ein Mensch.

```aufgabe
id: D7-02
typ: quizkarten
titel: "Laufen lassen oder freigeben?"
punkte: 25
frage: "Darf der Schritt automatisch laufen, oder entscheidet ein Mensch?"
karten:
  - "Eine Anmeldung von einem unbekannten Gerät im Ausland vorläufig sperren"
  - "Einem Werkstudenten Administratorrechte geben"
  - "Sicherheitsupdates für die Bürorechner einspielen"
  - "Einen Datenschutzvorfall an die Aufsichtsbehörde melden"
  - "Die Protokolle jede Nacht nach Auffälligkeiten durchsuchen"
stapel: [läuft automatisch, Mensch entscheidet]
loesung:
  "Eine Anmeldung von einem unbekannten Gerät im Ausland vorläufig sperren": läuft automatisch
  "Einem Werkstudenten Administratorrechte geben": Mensch entscheidet
  "Sicherheitsupdates für die Bürorechner einspielen": läuft automatisch
  "Einen Datenschutzvorfall an die Aufsichtsbehörde melden": Mensch entscheidet
  "Die Protokolle jede Nacht nach Auffälligkeiten durchsuchen": läuft automatisch
richtzeit_s: 80
erklaerung: |
  Vorläufig sperren, Updates einspielen und Protokolle durchsuchen sind
  Abwehr, die schnell sein muss und sich zurücknehmen lässt. Rechte vergeben
  und Behörden melden sind Entscheidungen mit Folgen - die trifft ein Mensch.
```

In den nächsten Lektionen gehst du die Sicherheitsfragen eines Betriebs der
Reihe nach durch: Geheimnisse, Rechte, Täuschung, Angriffe auf KI-Werkzeuge,
Protokolle, Herkunft von Inhalten und der Ernstfall.
