---
type: source
title: "Tokens und Vokabular"
description: "Warum „Token\" und „Wort\" nicht dasselbe sind — und warum das für Wasserzeichen zählt"
tags:
  - source
  - fundament
  - llm
  - tokenisierung
timestamp: 2026-08-18T17:43:48+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/llm-grundlagen/tokens-und-vokabular.md"
  geerntet: 2026-08-18T17:43:48+00:00
  pruefsumme: "sha256:f2304ae817bf86fe90109c50a224f8d45a51c895c7cfde2587e25d97ddfef678"
---


# Tokens und Vokabular

## Was ein Token ist

Ein LLM arbeitet nicht auf Wörtern, sondern auf **Tokens** — Teilstücken, die ein BPE-artiger Tokenizer aus dem Trainingskorpus gelernt hat. Ein Token ist mal ein ganzes Wort, mal eine Silbe, mal ein einzelnes Zeichen, oft inklusive führendem Leerzeichen.

Grobe Faustregeln:

| Sprache | Tokens pro Wort (ca.) |
|---|---|
| Englisch | 1,3 |
| Deutsch | 1,8–2,2 |

Deutsch ist wegen Komposita und Flexion **teurer**. „Wasserzeichenentfernung" ist ein Wort und leicht vier bis sechs Tokens.

## Warum das hier relevant ist

Das analysierte Video setzt Tokens und Wörter gleich: es spricht von *„300 Tokens, also etwa 300 Wörter"* (*segment-05-19-07-04-nachweis-und-grenzen*).

Das ist im Deutschen **falsch** und zwar in der für die Sache günstigen Richtung: 300 deutsche Tokens sind eher 140–170 Wörter. Für die Nachweisschwelle heißt das:

> Ein deutscher Text erreicht eine gegebene Token-Zahl mit **weniger** Wörtern als ein englischer.

Die praktische Konsequenz ist gering (die Schwelle liegt in Tokens, nicht in Wörtern), aber die Gleichsetzung führt in die Irre, wenn man abschätzen will, ab welcher Textlänge man nachweisbar ist.

## Vokabulargröße

Moderne Frontier-Modelle nutzen Vokabulare in der Größenordnung 100.000–200.000 Tokens. Jeder Sampling-Schritt ist also eine Auswahl aus sechsstelliger Kandidatenmenge — auch wenn nach Softmax fast die gesamte Masse auf einer Handvoll Kandidaten liegt.

Wichtig für das Verständnis von Wasserzeichen: die Verfahren ordnen **das gesamte Vokabular** pseudo-zufällig, nicht nur die plausiblen Kandidaten. Das Video sagt das korrekt: auch ein völlig unpassendes Token bekommt seine Zuordnung.

## Siehe auch
* *logits-und-softmax*
* *sampling-und-entropie*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/llm-grundlagen/tokens-und-vokabular.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
