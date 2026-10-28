---
type: lesson
title: "1971 bis heute: Der Flaschenhals und die Rückkehr des Analogrechners"
description: "Etappe 9 des Geschichtsvortrags — Lesetext ohne Aufgabe, zum Nachschlagen und Hören."
tags:
  - lesson
  - geschichte
  - etappe-9
timestamp: 2026-10-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 4
lese: true
---

# 1971 bis heute: Der Flaschenhals und die Rückkehr des Analogrechners

## Das Energieproblem ist ein Architekturproblem

Die Von-Neumann-Architektur trennt Prozessor und Speicher. Das war 1945 ein
Fortschritt. 2026 ist es der Grund, warum Rechenzentren Atomkraftwerke brauchen.

Jedes Bit muss gespeichert, geholt, verarbeitet und zurückgeschrieben werden.
Bei Milliarden von Operationen ist das nicht nur langsam, sondern teuer — Mainzer
sagt: „Ketchup durch die Ketchupflasche." Der Fachbegriff ist **Von-Neumann-
Flaschenhals**.

Und daneben steht das Gehirn: etwa **20 Watt**. Kein Kraftwerk, ein
Glühbirnen-Äquivalent, für eine Leistung, die kein Rechenzentrum erreicht.

## Der Memristor

**1971** postuliert **Leon Chua** (geboren 1936 in Manila, Berkeley) ein
fehlendes viertes Bauelement neben Widerstand, Kondensator und Spule: den
**Memristor** — *memory* plus *resistor*, Gedächtniswiderstand.

**2008** baut Hewlett-Packard das erste funktionierende Exemplar aus
**Titaniumdioxid** — dem weißen Pulver, das auch in Sonnencreme steckt, also
kein seltener Erdenstoff. Behandelt man es mit Ladung, verändern sich die
molekularen Strukturen, und der Zustand bleibt erhalten. Das Material hat ein
Gedächtnis.

Der physikalische Witz: Das Ohmsche Gesetz ist linear — Spannung und Strom
ergeben im Diagramm eine Gerade, der Widerstand ist eine Konstante. Mit
Gedächtnis ist der Widerstand keine Konstante mehr, sondern hängt von der Ladung
ab. Im Diagramm entsteht keine Gerade, sondern eine **Schleife**, die wie eine
Brezel aussieht: die **Hysteresekurve**. Diese Brezel ist die Signatur eines
Memristors.

## Neuromorphes Rechnen

Wenn eine Synapse gleichzeitig Speicher *und* Recheneinheit ist, dann kann man
das in Hardware nachbauen: **memristive Netze**. Man denkt sich eine Matrix aus
Leitungen, oben Spannung hinein, unten Stromstärke heraus — und Strom und
Spannung sind über das Ohmsche Gesetz verknüpft. Die Matrix rechnet, indem sie
physikalisch arbeitet. Analog. Mit reellen Zahlen. Ohne Digitalisierung.

Der nächste Schritt: statt Elektronen **Photonen**. Man nimmt gewöhnliches
Silizium, baut optische Einheiten als Neuronen, und zwischen ihnen laufen
Laserstrahlen — statt neurochemischer Signale (Hodgkin/Huxley), statt
elektrischer Impulse (Memristor) jetzt Licht. Bekanntes Bauteil dafür ist das
**Mach-Zehnder-Interferometer**: ein Arrangement kleiner Spiegel, in dem sich
Laserstrahlen teilen, verschieben und wieder überlagern. Im Labor liegt der
Energiebedarf solcher Systeme bei etwa **75 Watt** — nahe am Gehirn. Und man
rechnet nicht in Millisekunden, sondern in Nanosekunden. Bei Zimmertemperatur,
ohne Kühlanlage.

## Der eigentliche Trumpf: die Grenze fällt

Und hier kommt der Satz, den Mainzer als den wichtigsten des Gesprächs
bezeichnet und den fast niemand kennt.

Erinnern wir uns: Gödel 1931, Turing 1936 — es gibt unentscheidbare Probleme im
Digitalen. Tarski 1951 — über den reellen Zahlen ist alles entscheidbar. Daraus
folgt: **Die digitale Grenze ist im Analogen überwindbar.** Nicht durch schneller
rechnen, sondern durch andere Arithmetik.

Praktisch wird das sofort, wenn man es an einem Beispiel zeigt: die **inversen
Probleme** in der Medizin. Beim CT oder MRT wird Gewebe gemessen und als Bild
rekonstruiert. Jede Messung ist verrauscht. Die Frage ist: Kann ich aus dem
verrauschten Bild das ursprüngliche Objekt beliebig genau zurückgewinnen? Für
digitale neuronale Netze gibt es eine bewiesene untere Schranke — es geht nur
bis zu einer Grenze. Für einen Analogrechner geht es beliebig genau. Heute
reicht die Genauigkeit; morgen vielleicht nicht. Deshalb ist das keine
Mathematiker-Kuriosität, sondern eine Frage der Medizintechnik.

## Und die Pointe: Hybride KI

Daraus folgt nicht, dass der Digitalrechner verschwindet. Es folgt, dass er
nicht mehr allein steht. Mainzer nennt es **hybride KI**: ein Rechenzentrum der
Zukunft hat mehrere Türen — digitale Superrechner, neuromorphe Analogrechner,
später Quantenrechner. Je nach Aufgabe wählt man den Zugang.

Das ist die nüchterne Antwort auf die Frage „was setzt sich durch?". Nicht das
Schönste, nicht das Radikalste, sondern das, was für eine Problemklasse den
besten Kompromiss aus Preis, Genauigkeit und Energie liefert.

> **Merksatz für den Kurs:** Der Analogrechner kommt nicht zurück, weil er
> nostalgisch ist, sondern weil er etwas kann, was der Digitalrechner
> beweisbar nicht kann.

---

---

**Weiter:** [[20_Domaenen/DOM-KI-Geschichte/zeitstrahl-personen-begriffe|zeitstrahl · personen-und-begriffe]]
