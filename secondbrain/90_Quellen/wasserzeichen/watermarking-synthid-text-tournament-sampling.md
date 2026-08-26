---
type: source
title: "SynthID-Text / Tournament-Sampling"
description: "Das Verfahren, auf dem Anthropics Textwasserzeichen tatsächlich beruht"
tags:
  - source
  - fundament
  - watermarking
  - synthid
  - anthropic
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/watermarking/synthid-text-tournament-sampling.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:803f182bed7997ba836fdc2531eeff0ee50584c62d0dc0a70737ee691147fd4e"
---


# SynthID-Text / Tournament-Sampling

**Quelle:** Dathathri et al., *Scalable watermarking for identifying large language model outputs*, Nature, Oktober 2024 (Google DeepMind). Von DeepMind als Open Source veröffentlicht.

**Das ist die Grundlage von Anthropics Textwasserzeichen.** Anthropic nennt SynthID-Text ausdrücklich und verweist auf Scott Aaronsons Vorschlag von 2022 als konzeptionellen Vorläufer. → *2026-08-11-anthropic-news-text-watermark*

## Die Grundidee

Kirchenbauer verbiegt die **Wahrscheinlichkeiten**. SynthID lässt sie in Ruhe und ersetzt stattdessen die **Zufallsquelle**.

Anthropic beschreibt es sinngemäß so: Die Wortwahl bleibe zufällig, aber man könne nachträglich prüfen, ob die Folge mit den Entscheidungen übereinstimmt, die Claude mit dem Schlüssel getroffen hätte.

Das ist der ganze Trick. Sampling braucht ohnehin eine Zufallsquelle. Nimmt man statt echtem Zufall eine schlüsselabhängige Pseudozufallsfunktion über den Kontext, ist die Ausgabe für Außenstehende **statistisch nicht von normalem Sampling unterscheidbar** — aber mit Schlüssel exakt nachrechenbar.

## Tournament-Sampling — der Ablauf

1. Ziehe aus der echten Modellverteilung mehrere Kandidaten-Tokens.
2. Berechne für jeden Kandidaten mit Schlüssel + Kontextfenster einen pseudo-zufälligen **g-Wert** (0 oder 1 bzw. ein Score).
3. Lasse die Kandidaten in einem **Turnier** paarweise gegeneinander antreten; es gewinnt der mit dem höheren g-Wert.
4. Der Turniersieger wird ausgegeben.

Über mehrere Turnierrunden (Layer) verstärkt sich das Signal. Weil die Kandidaten **aus der korrekten Verteilung** gezogen werden, bleibt das Verfahren im Erwartungswert verteilungserhaltend.

## Der Nachweis

Der Detektor rechnet mit dem Schlüssel für jede Position die g-Werte der tatsächlich gewählten Tokens nach. Bei watermarked Text liegt der **mittlere g-Wert systematisch über** dem Erwartungswert von unmarkiertem Text. Aggregiert über viele Tokens ergibt das eine belastbare Teststatistik.

**Wieder gilt: Signal ~ T, Rauschen ~ √T.** Lange Texte sicher, kurze Texte nicht — dieselbe Längenabhängigkeit wie bei Kirchenbauer, aus demselben Grund.

## Was Anthropic konkret sagt — und was nicht

| Angabe | Status |
|---|---|
| Basiert auf SynthID-Text | 🟢 bestätigt |
| Zielt auf „low-stakes"-Wortwahl | 🟢 bestätigt |
| Keine Qualitätseinbuße | 🟢 so behauptet |
| Überlebt Copy-&-Paste | 🟢 bestätigt |
| Überlebt leichtes Editieren | 🟢 bestätigt |
| Vollständiges Umschreiben zerstört es | 🟢 bestätigt |
| Schlüssellänge, Fenstergröße, Turnierrunden | ⚫ **nicht offengelegt** |
| Schwellwerte, Falsch-Positiv-Rate | ⚫ **nicht offengelegt** |

Die fehlenden Parameter sind der Grund, warum in diesem Vault **keine** konkreten Nachweisschwellen für Claude behauptet werden. → *Scope-und-Grenzen*

## Warum nur Anthropic prüfen kann

Der Schlüssel ist geheim. Ohne ihn ist markierter Text von unmarkiertem nicht unterscheidbar — das ist keine Schwäche, sondern die Sicherheitseigenschaft des Verfahrens. Folge: **öffentliche „Wasserzeichen-Detektoren" für Claude-Text können nicht funktionieren.** Anthropic hat eine eigene Detection-API angekündigt, Details offen. → *detection-api-und-beweiswert*

## Siehe auch
* *paper-synthid-text-2024* · *google-deepmind*
* *aaronson-gumbel-schema*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/watermarking/synthid-text-tournament-sampling.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
