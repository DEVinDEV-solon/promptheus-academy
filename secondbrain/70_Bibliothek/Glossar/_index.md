---
type: index
title: "Glossar"
description: "Fremdwörter und Fachbegriffe der Academy — je Begriff eine Notiz, verbunden über ihre Nachbarn."
tags:
  - index
  - glossar
  - bibliothek
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Glossar

Jeder Begriff hat eine eigene Notiz. Das ist Absicht: Die verwandten
Schlagworte, die im Programm neben der Erklärung stehen, sind die
Wikilinks dieser Notiz — sie kommen aus dem Graphen und nicht aus einer
zweiten, von Hand gepflegten Liste.

> Diese Seite wird erzeugt. Neue Begriffe kommen als eigene Datei in
> diesen Ordner; danach `python secondbrain/_scripts/glossar_index.py`.

## Wie ein Sprachmodell arbeitet

- [[agent]] — **Agent**: Ein Sprachmodell, das nicht nur antwortet, sondern Werkzeuge benutzt.
- [[c2pa]] — **C2PA**: Ein offener Standard für signierte Herkunftsangaben in Dateien — für Bilder, nicht für Text.
- [[entropie]] — **Entropie**: Das Maß dafür, wie viel Wahlfreiheit an einer Textstelle besteht.
- [[few-shot]] — **Few-Shot**: Dem Modell ein paar Beispiele mitgeben, statt es zu beschreiben.
- [[halluzination]] — **Halluzination**: Wenn ein Modell etwas erfindet und dabei genauso überzeugt klingt wie sonst.
- [[kontextfenster]] — **Kontextfenster**: Wie viele Token ein Modell gleichzeitig überblicken kann.
- [[llm]] — **LLM (Sprachmodell)**: Ein Programm, das vorhersagt, welches Textstück als nächstes kommt.
- [[logits]] — **Logits**: Die rohen Punktzahlen, die ein Modell jedem möglichen nächsten Token gibt.
- [[maschinelles-lernen]] — **Maschinelles Lernen**: Muster aus Daten ziehen, statt Regeln zu schreiben.
- [[prompt]] — **Prompt**: Der Text, den man einem Sprachmodell gibt — Anweisung, Frage und Zusammenhang in einem.
- [[regelsystem]] — **Regelsystem**: Ein Programm, das Regeln befolgt, die ein Mensch geschrieben hat.
- [[sampling]] — **Sampling**: Das Ziehen des nächsten Tokens aus der Wahrscheinlichkeitsverteilung.
- [[softmax]] — **Softmax**: Die Rechnung, die aus rohen Punktzahlen Wahrscheinlichkeiten macht.
- [[temperatur]] — **Temperatur**: Der Regler, der bestimmt, wie mutig ein Modell wählt.
- [[token]] — **Token**: Das Stück Text, mit dem ein Sprachmodell rechnet — meist kürzer als ein Wort.
- [[tokenizer]] — **Tokenizer**: Das Programm, das Text in Token zerlegt — immer nach derselben festen Tabelle.
- [[wasserzeichen]] — **Wasserzeichen (im Text)**: Eine unsichtbare Markierung, die beim Schreiben in KI-Text eingebettet wird.

## Agenten, Werkzeuge und ihre Grenzen

- [[api]] — **API (Schnittstelle)**: Eine festgelegte Art, wie zwei Programme miteinander reden.
- [[harness]] — **Harness (Gestell)**: Das Gerüst um ein Sprachmodell herum — Werkzeuge, Schleife, Grenzen.
- [[leitplanke]] — **Leitplanke**: Eine Regel, die vor dem Modell steht oder hinter ihm — und nicht in ihm.
- [[mcp]] — **MCP (Model Context Protocol)**: Eine gemeinsame Steckernorm dafür, wie KI-Programme an Werkzeuge und Daten kommen.
- [[prompt-injektion]] — **Prompt-Injektion**: Ein Text, der dem Modell heimlich Anweisungen gibt — versteckt in dem, was es liest.
- [[rag]] — **RAG (Antwort mit Nachschlagen)**: Erst in echten Dokumenten suchen, dann antworten — mit Fundstelle.
- [[sandbox]] — **Sandkasten**: Ein abgeschlossener Bereich, in dem ein Programm nichts kaputt machen kann.
- [[werkzeugaufruf]] — **Werkzeugaufruf**: Das Modell fragt nach einer Rechnung, einer Suche, einer Datei — und bekommt eine Antwort.

## Womit gerechnet wird

- [[arbeitsspeicher]] — **Arbeitsspeicher**: Der Tisch, auf dem gerechnet wird — passt das Modell nicht drauf, läuft es nicht.
- [[cpu]] — **CPU (Hauptprozessor)**: Der Allrounder im Rechner — kann alles, aber wenig gleichzeitig.
- [[feinabstimmung]] — **Feinabstimmung**: Ein fertiges Modell auf ein Fachgebiet nachschulen — klein, günstig, gezielt.
- [[gpu]] — **GPU (Grafikprozessor)**: Tausende kleine Rechenwerke, die alle dasselbe gleichzeitig tun — das Arbeitstier der KI.
- [[hybride-speicherchips]] — **Hybride Speicherchips**: Speicher, der selbst mitrechnet — damit die Zahlen nicht ständig hin- und hergeschoben werden.
- [[inferenz]] — **Inferenz**: Das Benutzen eines fertigen Modells — jede Antwort, die du bekommst.
- [[edge-ki]] — **KI auf dem Gerät**: Das Modell läuft dort, wo du bist — nicht in einer Halle irgendwo.
- [[modellgewichte]] — **Modellgewichte**: Die Milliarden Zahlen, in denen das Können eines Modells steckt.
- [[npu]] — **NPU (KI-Recheneinheit)**: Ein kleiner Rechenbaustein im Gerät, der nur für KI gebaut ist.
- [[quantisierung]] — **Quantisierung**: Ein Modell mit gröberen Zahlen kleiner machen — damit es auf normale Geräte passt.
- [[rechenzentrum]] — **Rechenzentrum**: Eine Halle voller Rechner — dort steht die KI, die man im Browser benutzt.
- [[tpu]] — **TPU (Tensor-Recheneinheit)**: Googles eigener KI-Chip — dieselbe Idee wie eine NPU, nur für Rechenzentren.
- [[training]] — **Training**: Das monatelange Rechnen, aus dem ein Modell entsteht — einmal, vorher, sehr teuer.

## Offen und geschlossen

- [[lizenz]] — **Lizenz**: Der Text, der sagt, was du mit etwas tun darfst — und was nicht.
- [[open-source]] — **Open Source**: Der Quelltext liegt offen — jeder darf hineinsehen, ihn benutzen und ändern.
- [[open-weights]] — **Open Weights**: Die Gewichte sind frei herunterzuladen — das Rezept dahinter aber nicht.
- [[proprietaer]] — **Proprietär**: Geschlossen: Man darf es benutzen, aber nicht hineinsehen.

## Automatisierung und Robotik

- [[aktor]] — **Aktor**: Das Gegenstück zum Sensor — er macht aus einer Zahl eine Bewegung.
- [[automatisierung]] — **Automatisierung**: Eine Arbeit, die einmal beschrieben wurde und danach von selbst abläuft.
- [[digitaler-zwilling]] — **Digitaler Zwilling**: Ein Abbild einer echten Maschine im Rechner — zum Ausprobieren, bevor es teuer wird.
- [[robotik]] — **Robotik**: Maschinen, die die Welt wahrnehmen und in ihr handeln — nicht nur rechnen.
- [[rpa]] — **RPA (Prozessautomatisierung)**: Ein Programm, das Bildschirmarbeit übernimmt — klicken, tippen, kopieren.
- [[sensor]] — **Sensor**: Das Sinnesorgan einer Maschine — er macht aus einem Stück Welt eine Zahl.

## Erkennen, was von einer Maschine stammt

- [[falsch-negativ]] — **Falsch-Negativ**: Ein Alarm, der ausbleibt, obwohl etwas ist — hier: KI-Text, der durchgeht.
- [[falsch-positiv]] — **Falsch-Positiv**: Ein Alarm, der losgeht, obwohl nichts ist — hier: echter Text, als KI eingestuft.

## Sich in Behauptungen zurechtfinden

- [[desinformation]] — **Desinformation**: Etwas Falsches, das mit Absicht in Umlauf gebracht wird.
- [[kontextentzug]] — **Kontextentzug**: Ein wahrer Satz, aus dem herausgeschnitten, was ihn erklärt.
- [[malinformation]] — **Malinformation**: Etwas Wahres, das gezielt zum Schaden veröffentlicht wird.
- [[misinformation]] — **Misinformation**: Etwas Falsches, das ohne Absicht weitergegeben wird.
- [[quellenkritik]] — **Quellenkritik**: Nicht fragen, ob es stimmen könnte, sondern woher es kommt und wer etwas davon hat.

## Wie Lernen wirkt

- [[bestaetigungsfehler]] — **Bestätigungsfehler**: Die Neigung, das leichter zu glauben, was man ohnehin schon dachte.
- [[bloomsche-taxonomie]] — **Bloomsche Taxonomie**: Sechs Stufen des Könnens, von Wiedergeben bis Erschaffen.
- [[constructive-alignment]] — **Constructive Alignment**: Lernziel, Aufgabe und Prüfung müssen dasselbe meinen.
- [[overjustification-effekt]] — **Overjustification-Effekt**: Wenn Belohnung die Freude an einer Sache verdrängt, die vorher Spaß machte.
- [[selbstbestimmungstheorie]] — **Selbstbestimmungstheorie**: Was Menschen von innen antreibt: Autonomie, Kompetenz, Verbundenheit.
- [[testing-effekt]] — **Testing-Effekt**: Sich abfragen lassen bringt mehr als noch einmal lesen.
- [[spaced-repetition]] — **Verteiltes Wiederholen**: Mit wachsendem Abstand wiederholen, statt am Stück zu pauken.

## Sprache dieser Academy

- [[dialektik]] — **Dialektik**: Ein Gedanke, sein Gegengedanke, und was aus beiden wird.
- [[okf]] — **OKF (Open Knowledge Format)**: Das Format, in dem dieser Wissensspeicher abgelegt ist — lesbar für Mensch und Maschine.
- [[stufe]] — **Stufe**: Einer der sechs Abschnitte des Hauptwegs — von Entdecker bis Meister.
- [[talent]] — **Talent**: Die Recheneinheit der Academy — ein Talent ist ein Token.
- [[tokenicer]] — **Tokenicer**: Das Werkzeug der Academy, das zeigt, wie ein Modell einen Text zerlegt.

---

67 Begriffe. Der Bestand wächst mit dem Stoff: Was in einer Lektion erklärt werden muss, gehört hierher.
