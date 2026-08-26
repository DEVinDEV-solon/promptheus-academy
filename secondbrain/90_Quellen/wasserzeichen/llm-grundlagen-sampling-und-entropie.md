---
type: source
title: "Sampling und Entropie"
description: "Entropie ist das Budget, aus dem ein Wasserzeichen bezahlt wird"
tags:
  - source
  - fundament
  - llm
  - entropie
timestamp: 2026-08-18T17:43:48+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/llm-grundlagen/sampling-und-entropie.md"
  geerntet: 2026-08-18T17:43:48+00:00
  pruefsumme: "sha256:fb46ae5fcc5bf8ab4cc17f1c883d1942a96053503de620b7f28bd7174b0fc926"
---


# Sampling und Entropie

## Die Kernidee in einem Satz

**Ein Textwasserzeichen kann nur dort Information unterbringen, wo das Modell echte Wahlfreiheit hat.**

Entropie misst genau diese Wahlfreiheit. Sie ist das Budget. Ist das Budget null, gibt es kein Wasserzeichen — egal wie gut das Verfahren ist.

## Entropie nach Textsorte

| Textsorte | Entropie | Markierbarkeit |
|---|---|---|
| Freier Fließtext, Marketing, Essay | hoch | sehr gut |
| Erzählung, Dialog | hoch | sehr gut |
| Fachtext mit festen Termini | mittel | mäßig |
| Faktenaussage („Newtons Hauptwerk heißt …") | niedrig | schwach |
| Zitat, Zahl, Eigenname, Adresse | ≈ 0 | keine |
| Quellcode (Syntax, Bezeichner) | sehr niedrig | vernachlässigbar |
| Code-**Kommentare** | hoch | gut |

Anthropic bestätigt genau diese Abstufung und nennt ausdrücklich das Faktenbeispiel sowie die Sonderrolle von Code, bei dem die Markierung „vernachlässigbar" sei, weil es keine freie Wortwahl gebe. → *2026-08-11-anthropic-news-text-watermark*

## Vier Konsequenzen, die alles erklären

1. **Kurze Texte sind nicht nachweisbar.** Wenige Tokens = wenig akkumuliertes Signal = statistisch nicht vom Zufall unterscheidbar. → *these-03-entfernung-durch-paraphrase*
2. **Code ist praktisch ausgenommen, Kommentare nicht.** Der wichtigste Praxisbefund für Entwickler. → *these-04-code-ist-weitgehend-ausgenommen*
3. **Stark redigierter Text verliert das Signal.** Sind die meisten Wörter vom Menschen, bleibt nichts, woran das Wasserzeichen hängt.
4. **Temperatur beeinflusst das Budget.** Bei $T \to 0$ (greedy) kollabiert die Verteilung auf den Spitzenkandidaten; die Wahlfreiheit sinkt und mit ihr die Markierbarkeit. Deterministische Ausgaben sind schlecht markierbar.

Punkt 4 ist eine direkte Folgerung aus *logits-und-softmax*; Anthropic äußert sich dazu nicht — daher hier als Ableitung, nicht als Beleg gekennzeichnet `[Ableitung]`.

## Das Grundproblem jedes Wasserzeichens

Es gibt einen unauflösbaren Zielkonflikt:

* **Stärkeres Signal** → weniger natürliche Wortwahl → Qualitätsverlust.
* **Unsichtbares Signal** → längerer Text nötig für den Nachweis.

Verteilungserhaltende Verfahren wie SynthID-Text versuchen, diesen Konflikt zu umgehen, indem sie nicht die Verteilung verbiegen, sondern die Zufallsquelle ersetzen. → *synthid-text-tournament-sampling*

## Siehe auch
* *robustheit-und-angriffe*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/llm-grundlagen/sampling-und-entropie.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
