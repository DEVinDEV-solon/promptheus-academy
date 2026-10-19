---
type: lesson
title: "Belege erfassen"
description: "Was eine Rechnung enthalten muss, damit die Vorsteuer zählt, und wie eine Regel prüft, ob die ausgelesenen Zahlen zusammenpassen. Das Modell liest, die Rechnung rechnet nach."
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Belege erfassen

## Was auf eine Rechnung gehört

Eine Papier- oder PDF-Rechnung kommt herein. Ein Werkzeug liest sie aus, wie
im Fachkurs Bürobetrieb: Texterkennung, dann ein Modell, das die Felder
findet. In der Buchhaltung kommt eine Frage dazu: **Ist die Rechnung
vollständig?** Nur eine Rechnung mit allen Pflichtangaben nach § 14 des
Umsatzsteuergesetzes berechtigt zum Vorsteuerabzug. (Für Kleinbeträge bis
250 Euro gelten vereinfachte Regeln.)

```aufgabe
id: D8-03
typ: quizkarten
titel: "Pflichtangabe oder nicht?"
punkte: 30
frage: "Gehört die Angabe zu den Pflichtangaben einer Rechnung nach dem Umsatzsteuergesetz?"
karten:
  - "Fortlaufende Rechnungsnummer"
  - "Steuernummer oder Umsatzsteuer-Identifikationsnummer des Leistenden"
  - "Zeitpunkt der Lieferung oder Leistung"
  - "Firmenlogo"
  - "Steuersatz und Steuerbetrag"
  - "Telefonnummer des Leistenden"
stapel: [Pflichtangabe, keine Pflichtangabe]
loesung:
  "Fortlaufende Rechnungsnummer": Pflichtangabe
  "Steuernummer oder Umsatzsteuer-Identifikationsnummer des Leistenden": Pflichtangabe
  "Zeitpunkt der Lieferung oder Leistung": Pflichtangabe
  "Firmenlogo": keine Pflichtangabe
  "Steuersatz und Steuerbetrag": Pflichtangabe
  "Telefonnummer des Leistenden": keine Pflichtangabe
richtzeit_s: 90
erklaerung: |
  Dazu kommen unter anderem Name und Anschrift beider Seiten, das
  Ausstellungsdatum, Menge und Art der Leistung und das Entgelt. Ob alle
  Angaben da sind, kann eine Regel nach dem Auslesen prüfen - fehlt eine,
  geht die Rechnung zurück an den Absender.
```

## Netto, Steuer, Brutto

Die wichtigste Prüfung nach dem Auslesen ist eine Rechnung: **Netto plus
Steuer muss Brutto ergeben.** Stimmt das nicht, hat sich entweder der
Rechnungssteller verrechnet oder das Modell verlesen.

```aufgabe
id: D8-04
typ: mathe
titel: "Die Steuer in der Summe"
punkte: 25
frage: "Eine Rechnung lautet über 595,00 Euro brutto, darin 19 Prozent Umsatzsteuer. Wie hoch ist der Steuerbetrag?"
loesung: 95
toleranz: 0.01
einheit: "Euro"
richtzeit_s: 90
hinweise:
  - text: "Brutto geteilt durch 1,19 ergibt Netto. Die Differenz ist die Steuer."
    kostet: 5
erklaerung: |
  595 / 1,19 = 500 Euro netto, die Steuer beträgt 95 Euro. Wer 19 Prozent
  von 595 rechnet, kommt auf 113,05 Euro - der häufigste Fehler, auch bei
  Modellen, die im Kopf rechnen.
```

```aufgabe
id: D8-05
typ: denkaufgabe
titel: "Ein Zahlendreher"
punkte: 25
frage: "Auf der Rechnung steht 1.910,00 Euro brutto. Das Modell liest 1.190,00 Euro. Netto (1.605,04 Euro) und Steuer (304,96 Euro) hat es richtig gelesen. Was fängt den Fehler ab?"
optionen:
  - "Eine Regel prüft, ob Netto plus Steuer den Bruttobetrag ergibt, und legt die Rechnung bei Abweichung einem Menschen vor."
  - "Nichts, solche Fehler fallen erst beim Jahresabschluss auf."
  - "Das Modell bemerkt es selbst, wenn man es freundlich bittet."
  - "Die Bank lehnt die Zahlung ab."
loesung: "Eine Regel prüft, ob Netto plus Steuer den Bruttobetrag ergibt, und legt die Rechnung bei Abweichung einem Menschen vor."
richtzeit_s: 60
erklaerung: |
  1.605,04 + 304,96 = 1.910,00 - nicht 1.190,00. Eine einfache Summenprüfung
  findet den Dreher sofort. Ohne sie würde die Rechnung um 720 Euro zu
  niedrig bezahlt, und die Mahnung käme in sechs Wochen.
```
