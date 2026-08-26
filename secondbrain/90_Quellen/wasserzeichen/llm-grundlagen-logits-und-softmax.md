---
type: source
title: "Logits und Softmax"
description: "Wie ein LLM aus rohen Scores eine Wahrscheinlichkeitsverteilung über das nächste Token macht"
tags:
  - source
  - fundament
  - llm
  - sampling
timestamp: 2026-08-18T17:43:48+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/llm-grundlagen/logits-und-softmax.md"
  geerntet: 2026-08-18T17:43:48+00:00
  pruefsumme: "sha256:29661d0649e52eb2909c64d988b656c2a0ec3ca1df8c136a89575ed2ea026f5b"
---


# Logits und Softmax

Die Stelle, an der **jedes** Textwasserzeichen ansetzt. Wer das hier versteht, versteht alle Verfahren in *verfahren-uebersicht*.

## Der Ablauf pro Token

1. Das Modell verarbeitet den bisherigen Kontext.
2. Es gibt für **jedes** Token des Vokabulars (bei Claude/GPT-Klassen grob 100.000–200.000 Einträge) genau eine reelle Zahl aus: den **Logit**. Unnormiert, beliebig positiv oder negativ.
3. **Softmax** wandelt den Logit-Vektor in eine Wahrscheinlichkeitsverteilung:

   $$p_i = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}$$

   mit $z_i$ = Logit, $T$ = Temperatur.
4. Aus dieser Verteilung wird **gesampelt** → ein Token fällt. Zurück zu Schritt 1.

## Illustration

Satzanfang: „Die neue Version ist …"

| Kandidat | Logit `[Illustration]` | → Softmax |
|---|---|---|
| deutlich | 4,2 | 46,1 % |
| spürbar | 3,8 | 30,9 % |
| klar | 3,1 | 15,3 % |
| … | … | … |
| Banane | −7,1 | ≈ 0,00001 % |

Diese Zahlen stammen als Rechenbeispiel aus dem analysierten Video (*segment-02-34-05-19-mechanismus*) und sind frei erfunden — sie illustrieren die Größenordnungen korrekt.

## Warum das die Angriffsfläche ist

Zwischen Schritt 3 und 4 sitzt ein Punkt, an dem man eingreifen kann, **ohne die Textqualität messbar zu beschädigen**:

* Man kann die Logits leicht verbiegen (**Logit-Bias**) → *kirchenbauer-green-red-list*.
* Oder man kann die **Zufallsquelle** des Samplings ersetzen, ohne die Verteilung anzutasten → *synthid-text-tournament-sampling* und *aaronson-gumbel-schema*.

Der zweite Weg ist eleganter: er ist im Erwartungswert **verteilungserhaltend** („distortion-free"), der erste nicht.

## Der entscheidende Nebenpunkt: Entropie

Die Manipulierbarkeit hängt davon ab, **wie viel Auswahl** überhaupt besteht.

* Viele etwa gleich gute Kandidaten (freier Fließtext) = hohe Entropie = viel Platz für ein Wasserzeichen.
* Ein einziger zulässiger Kandidat (Syntax, Eigennamen, Zitate, Zahlen) = null Entropie = **kein** Platz.

Das erklärt unmittelbar, warum Code kaum und kurze Texte schlecht markiert werden. → *sampling-und-entropie*

## Siehe auch
* *tokens-und-vokabular*
* *glossar*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/llm-grundlagen/logits-und-softmax.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
