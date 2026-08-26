---
type: source
title: "Audit-Trail-Prinzip"
description: "Warum eine Hash-verkettete Protokollierung ein tauglicher Rechtsnachweis ist."
tags:
  - source
  - fundament
  - audit-trail
  - chain-of-custody
  - art-32
  - art-5
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "24_Auditrail_DSGVO"
  pfad: "00_Fundament/audit-trail-prinzip/index.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:cccad0ff2247938ff579098dcb9f3d5991657e01eb6d663766ddb19243f927ea"
---



# Audit-Trail-Prinzip

## Das Problem, das er loest

Die DSGVO verlangt in **Art. 5 Abs. 2** nicht nur, dass man rechtmaessig verarbeitet, sondern
dass man es **nachweisen kann** (Rechenschaftspflicht). Der AI Act verlangt fuer Hochrisiko-
Systeme in **Art. 12** eine automatische Aufzeichnung von Ereignissen ueber die Lebensdauer.

Beides laeuft auf dieselbe Frage hinaus: *Woher weiss eine Aufsichtsbehoerde, dass dein
Protokoll nicht nachtraeglich frisiert wurde?*

## Die technische Antwort

Jeder Eintrag traegt den Hash seines Vorgaengers:

```
entry_hash = SHA256( prev_hash + "\n" + canonical_json(payload) )
```

Daraus folgt die entscheidende Eigenschaft: **Jede Aenderung, Umsortierung oder Loeschung
eines vergangenen Eintrags bricht die Kette ab dieser Stelle.** Man kann Eintraege nicht
still entfernen — man kann nur eine erkennbar gebrochene Kette vorlegen.

Das ist *tamper-evident*, nicht *tamper-proof*: Manipulation wird nicht verhindert, aber
**unweigerlich sichtbar**. Fuer den Nachweiszweck reicht genau das.

## Rechtliche Zuordnung

| Eigenschaft | Norm |
|---|---|
| Nachweis der Rechtmaessigkeit | Art. 5 Abs. 2 DSGVO (Rechenschaft) |
| Integritaet und Vertraulichkeit | Art. 5 Abs. 1 lit. f, Art. 32 Abs. 1 lit. b DSGVO |
| Wiederherstellbarkeit, Belastbarkeit | Art. 32 Abs. 1 lit. b, c DSGVO |
| Aufzeichnungspflicht Hochrisiko-KI | Art. 12, Art. 26 Abs. 6 AI Act |
| Unveraenderbarkeit (steuerlich) | § 146 Abs. 4 AO, GoBD |

## Zwei Fallen

1. **Der Trail selbst ist eine Verarbeitung.** Er enthaelt personenbezogene Daten (wer hat
   wann was getan) und braucht damit eine eigene Rechtsgrundlage, einen Eintrag im
   *Verarbeitungsverzeichnis*
   und eine Loeschfrist.
2. **Loeschpflicht trifft Aufbewahrungspflicht.** Art. 17 DSGVO verlangt Loeschung, § 257 HGB
   und § 147 AO verlangen Aufbewahrung. Der Konflikt wird ueber das
   *Loeschkonzept* aufgeloest —
   nicht ad hoc.

Umsetzung: *Audit-Trail-System*,
*Audit-Trail-App*.

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `24_Auditrail_DSGVO`
> geerntet (`00_Fundament/audit-trail-prinzip/index.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
