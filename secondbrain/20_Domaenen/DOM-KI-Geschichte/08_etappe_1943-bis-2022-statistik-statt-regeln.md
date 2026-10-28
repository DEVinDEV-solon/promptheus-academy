---
type: lesson
title: "1943 bis 2022: Statistik statt Regeln"
description: "Etappe 8 des Geschichtsvortrags — Lesetext ohne Aufgabe, zum Nachschlagen und Hören."
tags:
  - lesson
  - geschichte
  - etappe-8
timestamp: 2026-10-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 5
lese: true
---

# 1943 bis 2022: Statistik statt Regeln

## Die biologische Wurzel

**1943** formulieren **Warren McCulloch** und **Walter Pitts** das erste
mathematische Modell eines Neurons: viele Eingänge, eine Schwelle, ein Ausgang.
**1952** liefern Hodgkin und Huxley die Messdaten dazu — am Tintenfisch, siehe
Etappe 1. **1958** baut **Frank Rosenblatt** das **Perzeptron**: ein Netz, das
lernt, Eingaben zu unterscheiden, indem es seine Gewichte anpasst.

Das Muster ist überall dasselbe: **Die Natur inspiriert, die Technik
übertreibt.** Ein Vogel fliegt nicht mit Flügeln, sondern mit Tragflächen und
Triebwerken. Ein Neuronales Netz ist heute keine Nachbildung von Biologie,
sondern eine Rechenarchitektur, die sich von Biologie hat anregen lassen.

## Der mathematische Rückenwind

**1982** zeigt **John Hopfield** (geboren 1933), dass man ein Netz als
Energielandschaft auffassen kann: Es rutscht in den tiefsten Punkt, das ist die
Lösung. **1985** übersetzen **Geoffrey Hinton**, **Terry Sejnowski** und David
Ackley das in die **Boltzmann-Maschine** — benannt nach **Ludwig Boltzmann**
(1844–1906), dem Begründer der statistischen Mechanik.

Der Trick ist bestechend und verdient ein Alltagsbild: In der Physik haben wir
Milliarden von Molekülen in einem Gas, die energetisch wechselwirken. Niemand
kennt einzelne Moleküle. Man beschreibt sie statistisch — Verteilungen,
Phasenübergänge, Temperatur. Jetzt ersetze man Moleküle durch **Neuronen**,
energetische Wechselwirkung durch **synaptische Gewichte**, Phasenübergänge
durch **Lernregeln**. Ergebnis: ein Netz, das Muster nicht speichert, sondern
wahrscheinlich macht.

**1986** wird das **Backpropagation**-Verfahren populär — die Methode, mit der
ein Netz aus seinen Fehlern lernt (Rumelhart, Hinton, Williams; die mathematische
Wurzel reicht bis Linnainmaa 1970 zurück). **1989** beweist **George Cybenko**
das **Universal Approximation Theorem**: Für jede stetige Zielfunktion existiert
ein ausreichend großes Netz, das sie beliebig genau annähert.

Und jetzt der Satz, den man sich merken sollte, weil er die Grenze dieser
ganzen Welt markiert: **Das ist ein reines Existenztheorem.** Es sagt, dass ein
Netz existiert. Es sagt nicht, wie groß es ist, wie man es findet und was man
dafür an Daten braucht. Alles Praktische danach war Ingenieursarbeit — das
Gefummel an Architekturen, das Mainzer ausdrücklich als „Gehirnschmalz von
Ingenieuren" bezeichnet. Das Theorem sagt dazu nichts.

## Was in den Netzen steckt — und was fehlt

Die heutigen Netze sind keine braven Kopien. Sie haben Schichten, die auf
bestimmte Merkmale spezialisiert sind (konvolutionale Netze für Bilder), und sie
sind deutlich effektiver als das einfache Modell. Aber die Lernarten sind der
Biologie abgeschaut:

| Lernart | Alltagsbild |
|---|---|
| **Überwachtes Lernen** | Ein Muster wird gezeigt und benannt; danach erkennt das System es wieder. |
| **Unüberwachtes Lernen** | Das System findet selbst Ähnlichkeiten und bildet Gruppen. |
| **Bestärkendes Lernen** | Korrektur von außen verändert die Strategie — wie ein Kind, das zurechtgewiesen wird. |
| **Tiefes Lernen** | Viele Schichten hintereinander. „Tief" heißt nicht „tiefsinnig". |

## Die Durchbrüche, die man datieren kann

- **2012**: Ein tiefes Netz gewinnt den Bildwettbewerb ImageNet deutlich. Der
  Startschuss der Ära, in der „KI" zum Produkt wurde.
- **2018**: Am **CERN** in Genf sucht man in Milliarden von Protonenkollisionen
  nach dem **Higgs-Teilchen**. Sein Zerfall hinterlässt charakteristische Muster
  — einen Fingerabdruck. Man programmiert das Netz mit diesem Muster; es findet
  es in Sekunden. Dasselbe Prinzip, anderes Feld: **Brustkrebs** — ein Netz wird
  mit den Merkmalen von Krebszellen trainiert und trennt sie von gesundem
  Gewebe.
- **2018**: **AlphaFold** (Google DeepMind) sagt die Faltung von Proteinen voraus
  — ein hochgradig geometrisches Problem. Das ermöglicht, Abweichungen zu
  finden, die Ursache früher Tumorerkrankungen sein können. In der
  Impfstoffentwicklung hat diese Klasse von Verfahren die Pharmaindustrie
  beschleunigt wie nichts zuvor.
- **2022**: **ChatGPT** wendet dasselbe auf Sprache an. Riesige Textmengen,
  überwachtes Lernen, dann bestärkendes Lernen aus menschlicher Kritik.

## Und die nüchterne Diagnose

Mainzer nennt es „hochgetrimmte Statistik auf schnellen Rechnern. Mehr ist es
nicht." Im Maschinenraum passiert genau das: Es werden statistische
Erwartungswerte ausgerechnet, um an einer Stelle im Text ein plausibles Wort
einzusetzen.

Das ist keine Abwertung, das ist eine Ortsbestimmung. Der Erfolg ist gewaltig.
Aber es ist **nicht** der Weg, auf dem Newton und Einstein zu ihren Gesetzen
kamen. Die hatten fast keine Daten. Newton hatte Keplers Beobachtungen, ein
paar Zahlen; Einstein hatte die Messabweichungen der klassischen Physik, die
alle für Messfehler hielten. Aus einem **Kausalitätsprinzip** — jeder Effekt hat
eine Ursache — wurde eine Gleichung, und aus der Gleichung wurde eine Theorie,
die Dinge vorhersagte, die noch niemand gesehen hatte: schwarze Löcher, die
Expansion des Universums. Beides später nachgewiesen.

Das ist der Unterschied, an dem sich die nächste Etappe entzündet: **Statistik
findet Muster in Daten. Physik findet Gesetze hinter den Daten.**

> **Merksatz für den Kurs:** Ein Modell, das nur Statistik ist, kann sehr klug
> wirken und trotzdem nichts verstehen. Die Frage ist nicht, ob es beeindruckt,
> sondern ob es trägt.

---

---

**Weiter:** [[20_Domaenen/DOM-KI-Geschichte/zeitstrahl-personen-begriffe|zeitstrahl · personen-und-begriffe]]
