---
type: source
title: "Aaronson-Schema (Gumbel / Exponential-Sampling)"
description: "Der konzeptionelle Vorläufer, den Anthropic ausdrücklich nennt"
tags:
  - source
  - fundament
  - watermarking
  - aaronson
  - openai
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/watermarking/aaronson-gumbel-schema.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:b7b3534cd42bfa9f8b3a6138d2e42afc1d464c578c8e6c090d711fa07651a355"
---


# Aaronson-Schema (Gumbel / Exponential-Sampling)

**Ursprung:** Scott Aaronson, während seines Gastjahres bei OpenAI, 2022. Nie als Produkt ausgerollt, aber öffentlich vorgetragen und seither der theoretische Referenzpunkt für verteilungserhaltende Textwasserzeichen. Anthropic verweist im eigenen Beitrag darauf. → *2026-08-11-anthropic-news-text-watermark*

## Die Idee

Ausgangspunkt ist der **Gumbel-Max-Trick**: Sampeln aus einer Kategorialverteilung lässt sich äquivalent so ausdrücken, dass man auf jeden Logit unabhängiges Gumbel-Rauschen addiert und dann das **Maximum** nimmt.

$$\text{argmax}_i \left( z_i + g_i \right), \quad g_i \sim \text{Gumbel}(0,1)$$

Aaronsons Beitrag: Ersetze das echte Rauschen $g_i$ durch **pseudo-zufällige Werte**, die aus einem geheimen Schlüssel und dem vorangehenden Kontext abgeleitet werden.

Äquivalente Formulierung über Exponentialverteilung: ziehe pro Token $r_i \in (0,1)$ pseudo-zufällig und wähle

$$\text{argmax}_i \; r_i^{1/p_i}$$

## Die entscheidende Eigenschaft

Wer den Schlüssel **nicht** kennt, sieht $r_i$ als gleichverteilten Zufall — die Ausgabeverteilung ist **exakt** die des unmarkierten Modells. Das Wasserzeichen ist informationstheoretisch unsichtbar.

Wer den Schlüssel **kennt**, rechnet $r_i$ nach. Bei markiertem Text korreliert der gewählte Token systematisch mit hohen $r_i$-Werten; bei unmarkiertem Text nicht. Aufsummiert über den Text ergibt das den Nachweis.

## Verhältnis zu SynthID-Text

| | Aaronson 2022 | SynthID-Text 2024 |
|---|---|---|
| Prinzip | Zufallsquelle ersetzen | Zufallsquelle ersetzen |
| Auswahl | argmax über transformierte Scores | mehrschichtiges Turnier |
| Status | Vorschlag, nie ausgerollt | produktiv, Open Source, Nature-Paper |
| Skalierbarkeit | theoretisch | für Produktionslast ausgelegt |

SynthID-Text ist die **praktisch tragfähige Weiterentwicklung** derselben Grundidee — deshalb nennt Anthropic beide. → *synthid-text-tournament-sampling*

## Merksatz

> Kirchenbauer verbiegt die Verteilung, um ein Signal einzubauen.
> Aaronson und SynthID bauen das Signal in den **Zufall** ein und lassen die Verteilung unangetastet.

## Siehe auch
* *verfahren-uebersicht* · *openai*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/watermarking/aaronson-gumbel-schema.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
