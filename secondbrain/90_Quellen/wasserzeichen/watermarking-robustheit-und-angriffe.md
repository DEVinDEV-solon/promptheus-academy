---
type: source
title: "Robustheit und Angriffe"
description: "Was ein Textwasserzeichen überlebt und was es zerstört — sortiert nach Wirksamkeit"
tags:
  - source
  - fundament
  - watermarking
  - robustheit
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/watermarking/robustheit-und-angriffe.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:91336df3245fedf64432119d4cce296d4fcdba53e714b7a6b6a66b1df9501572"
---


# Robustheit und Angriffe

Gilt sinngemäß für beide Textwasserzeichen-Familien, da beide dieselbe Abhängigkeit von akkumuliertem Signal über Tokens haben. → *verfahren-uebersicht*

## Wirksamkeitsmatrix

| Eingriff | Signal danach | Bewertung |
|---|---|---|
| Copy & Paste | **vollständig** | Anthropic bestätigt ausdrücklich |
| Formatierung ändern (fett, Listen) | vollständig | Tokens bleiben |
| Unicode-Zeichen entfernen / Gedankenstriche tauschen | **vollständig** | 🔴 **Mythos** — greift ins Leere |
| Einzelne Wörter tauschen | fast vollständig | jedes Token trägt nur einen Bruchteil |
| Leichtes Redigieren / Korrekturlesen | überwiegend erhalten | Anthropic: leichtes Editieren entfernt es nicht |
| Text stark kürzen | geschwächt | weniger Tokens = weniger Signal |
| Nur kurze Texte erzeugen (< ~ 100 Tokens) | oft nicht nachweisbar | Video nennt das korrekt als Abschwächung |
| Übersetzung in andere Sprache | **weitgehend zerstört** | komplette Neu-Tokenisierung |
| **Vollständige Paraphrase durch Fremdmodell** | **zerstört** | 🟢 wirksamste Methode |
| Vollständige Neuformulierung von Hand | zerstört | trivialerweise |

## Warum die Oberflächen-Mythen nicht funktionieren

Das Wasserzeichen sitzt **in der Auswahl der Tokens**, nicht in Sonderzeichen. Wer Zero-Width-Spaces sucht oder Em-Dashes ersetzt, verändert die Tokenfolge nur marginal — das statistische Signal aus mehreren hundert Auswahlentscheidungen bleibt unberührt. Das Video bringt diesen Punkt richtig und deutlich.

## Warum Paraphrase funktioniert

Ein Fremdmodell (z. B. ChatGPT oder Gemini) trifft die Auswahlentscheidungen **neu** — mit seiner eigenen Zufallsquelle, ohne Anthropics Schlüssel. Der resultierende Text trägt Anthropics Signal nicht mehr. Die Bedeutung bleibt, die Tokenfolge ist neu.

**Wichtige Einschränkung:** Ein durch Gemini paraphrasierter Text trägt danach möglicherweise **SynthID von Google**. Man tauscht ein Wasserzeichen gegen ein anderes. Das Video erwähnt das nicht. → *2026-08-16-entfernungsmethoden-bewertung*

## Der Asymmetrie-Punkt

| | Falsch-Negativ | Falsch-Positiv |
|---|---|---|
| Bedeutung | KI-Text wird nicht erkannt | Menschentext wird als KI markiert |
| Häufigkeit | **hoch** (kurz, editiert, paraphrasiert) | von Anthropic auf sehr niedrig ausgelegt |
| Schaden | gering | **hoch** (Prüfungen, Arbeitsverhältnisse) |

Statistische Wasserzeichen sind bewusst so parametrisiert, dass Falsch-Positive selten sind — der Preis sind viele Falsch-Negative. **Daraus folgt die wichtigste Nutzungsregel:**

> Ein Treffer ist ein starker Hinweis. Ein Nicht-Treffer ist **kein** Beweis für menschliche Autorschaft.

Anthropic formuliert das im Support-Artikel ausdrücklich. → *detection-api-und-beweiswert*

## Was ein Angreifer ohne Schlüssel *nicht* kann

* Herausfinden, welche Tokens „begünstigt" waren — die Zuordnung ist kontextabhängig und schlüsselgebunden.
* Ein Wasserzeichen **fälschen**, also Menschentext als Claude-Text erscheinen lassen.
* Gezielt einzelne Tokens „entmarkieren".

Das Video schätzt den Suchraum auf „10^21 Möglichkeiten" `[Schätzung des Videos, unbelegt]`. Die Größenordnung ist beliebig — der Punkt ist qualitativ richtig: ohne Schlüssel ist der Raum praktisch nicht durchsuchbar.

## Siehe auch
* *sampling-und-entropie*
* *these-03-entfernung-durch-paraphrase*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/watermarking/robustheit-und-angriffe.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
