---
type: lesson
title: "Retouren und Reklamationen"
description: "Freitext in Kategorien sortieren kann ein Modell gut. Ob ein Mangel vorliegt und ob es Kulanz gibt, entscheidet ein Mensch. Und aus den Gründen lernt der Einkauf."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Retouren und Reklamationen

## Aus Freitext werden Kategorien

Die Ware ist verkauft, mit Preis und Text aus den Lektionen 5 und 6. Ein Teil
kommt zurück. Im Retourenschein schreibt die Kundschaft, was sie stört, und
zwar so, wie Menschen schreiben: „Zu eng an den Schultern", „Reißverschluss
klemmt nach einem Tag", „Farbe ganz anders als auf dem Foto".

Diese Sätze in feste **Kategorien** zu sortieren, ist eine typische Aufgabe für
ein Modell. Eine feste Regel mit Stichwörtern scheitert an der Vielfalt der
Formulierungen. Das Modell ordnet zu, und du prüfst stichprobenweise, ob es
richtig sortiert.

```aufgabe
id: D1-17
typ: quizkarten
titel: "Rücksendegründe sortieren"
punkte: 30
frage: "Sortiere die Rücksendegründe in die Kategorien, die der Shop auswertet."
karten:
  - "Fällt eine Nummer zu klein aus."
  - "Naht am Ärmel nach dem ersten Waschen gerissen."
  - "Bestellt in Blau, bekommen in Grün."
  - "Gefällt mir angezogen doch nicht."
  - "Zu weit an der Taille."
  - "Schalter funktioniert nicht."
stapel: [Passform, Defekt, Falsch geliefert, Gefällt nicht]
loesung:
  "Fällt eine Nummer zu klein aus.": Passform
  "Naht am Ärmel nach dem ersten Waschen gerissen.": Defekt
  "Bestellt in Blau, bekommen in Grün.": Falsch geliefert
  "Gefällt mir angezogen doch nicht.": Gefällt nicht
  "Zu weit an der Taille.": Passform
  "Schalter funktioniert nicht.": Defekt
richtzeit_s: 90
erklaerung: |
  Genau diese Zuordnung macht ein Modell bei tausend Retourenscheinen pro
  Woche. Wichtig ist eine feste Liste von Kategorien - darf das Modell eigene
  erfinden, lässt sich am Monatsende nichts mehr zählen.
```

## Widerruf, Gewährleistung, Kulanz

Nicht jede Rücksendung ist gleich, und die Unterschiede sind rechtlich:

- **Widerruf:** Wer online kauft, darf in der Regel innerhalb von 14 Tagen
  ohne Angabe von Gründen zurücksenden.
- **Gewährleistung:** Ist die Ware mangelhaft, haftet der Händler gesetzlich,
  in der Regel zwei Jahre lang.
- **Kulanz:** Alles darüber hinaus ist freiwillig, eine Geste an die
  Kundschaft.

Eine Regel kann prüfen, ob eine Rücksendung innerhalb der 14 Tage liegt, und
dann automatisch das Etikett schicken. Ob ein **Mangel** vorliegt oder ob es
**Kulanz** gibt, braucht Ermessen. Dafür ist ein Mensch zuständig.

```aufgabe
id: D1-18
typ: uebereinstimmung
titel: "Drei Wege zurück"
punkte: 25
frage: "Ordne jedem Fall den Weg zu, auf dem er zurückkommt."
links:
  - "Kunde schickt am 10. Tag zurück, ohne Begründung."
  - "Kundin meldet nach acht Monaten einen Defekt, der von Anfang an da war."
  - "Kunde will nach 20 Tagen umtauschen, weil ihm die Farbe nicht mehr gefällt."
rechts: [Widerruf, Gewährleistung, Kulanz]
loesung:
  "Kunde schickt am 10. Tag zurück, ohne Begründung.": Widerruf
  "Kundin meldet nach acht Monaten einen Defekt, der von Anfang an da war.": Gewährleistung
  "Kunde will nach 20 Tagen umtauschen, weil ihm die Farbe nicht mehr gefällt.": Kulanz
richtzeit_s: 70
erklaerung: |
  Innerhalb der Frist ohne Grund ist Widerruf. Ein Mangel ist Gewährleistung.
  Ein Umtausch nach der Frist ohne Mangel ist Kulanz - und Kulanz ist eine
  Entscheidung, die kein Werkzeug allein trifft.
```

## Was die Retouren erzählen

Die Kategorien sind kein Selbstzweck. Fallen 30 Prozent der Retouren eines
Schuhs in „Passform: zu klein", dann stimmt etwas mit dem Artikel oder seinem
Text nicht. Das ist eine Information für Einkauf und Produkttext, nicht nur für
das Lager.

```aufgabe
id: D1-19
typ: denkaufgabe
titel: "Der Schuh, der zu klein ausfällt"
punkte: 25
frage: "Die Auswertung zeigt: 30 Prozent aller Retouren eines Schuhmodells haben den Grund „fällt zu klein aus“. Was ist die sinnvollste Reaktion?"
optionen:
  - "Einen Hinweis „fällt eine Nummer kleiner aus“ in den Artikeltext setzen und den Lieferanten informieren."
  - "Das Modell bitten, die negativen Bewertungen zu dem Schuh zu löschen."
  - "Nichts tun, Retouren gehören im Onlinehandel dazu."
  - "Den Preis senken, damit sich niemand mehr beschwert."
loesung: "Einen Hinweis „fällt eine Nummer kleiner aus“ in den Artikeltext setzen und den Lieferanten informieren."
richtzeit_s: 60
erklaerung: |
  Die Kategorie hat einen Grund sichtbar gemacht. Der Hinweis im Text senkt
  die Retouren sofort, die Rückmeldung an den Lieferanten vielleicht dauerhaft.
  Bewertungen zu löschen, verdeckt das Problem und ist gegenüber der
  Kundschaft unehrlich.
```
