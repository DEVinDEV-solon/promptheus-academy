---
type: source
title: "index"
description: ""
tags:
  - source
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/forensik/index.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:67b7cd3335d6a79102d79fe55a3f441b4c4806f81969c97c451d7ad7f6c207c4"
---

# forensik — On-Chain-Forensik

Der härteste, objektivste Beweis: was die Chain selbst zeigt. `type: foundation`.

* [rug-pull-muster](rug-pull-muster.md) — Muster-Katalog für Rug-Pulls & Scams

> Werkzeuge/Quellen: Block-Explorer, Contract-Verifikation, Holder-/LP-Analyse, Wallet-Clustering
> (Nansen/Arkham-Labels), On-Chain über `05_Hyperstellar/hyperstellar.py`.

---

## Bewertungsraster — **Gewicht 30 % am Fundament-Index** · Veto-fähig

On-Chain-Beweise sind reproduzierbar → höchste Beweiskraft. Ein belegtes Scam-Muster ist ein
Kill-Kriterium (siehe [../index.md](../index.md)).

### Ampel-Rubrik (für diese Domäne)

| Ampel | Bedeutung |
|:---:|---|
| 🟢 | Sauber: Contract verifiziert, kein Mint/Owner-Backdoor, LP gelockt/verbrannt, gesunde Holder-Verteilung, keine Rug-Muster. |
| 🟡 | Heuristische Auffälligkeiten: Cluster-Verdacht, mittlere Konzentration, Code unverifiziert aber plausibel. |
| 🔴 | Belegtes Rug-/Scam-Muster: Honeypot, Mint-Backdoor, Dev-Dump, LP-Abzug, Wash-Trading. **→ Veto.** |

### Unterkriterien (Summe = 100 % dieser Domäne)

| Kriterium | Gewicht |
|---|:---:|
| Contract-Sicherheit (Mint/Owner/Honeypot/Upgradeability) | 30 % |
| Liquidität (LP-Lock/Burn, Tiefe, Slippage) | 25 % |
| Holder-/Wallet-Verteilung (Konzentration, Cluster, Insider) | 25 % |
| Transaktions-Integrität (Wash-Trading, Bot-Volumen, Bridge-Flows) | 20 % |

### Übersetzungsformat — Beweis-Härte on-chain

| Beleg | Wertung |
|---|---|
| Verifizierter TX / Explorer-Link, **reproduzierbar** | 🟢 hart (zählt voll) |
| Heuristik / Cluster-Wahrscheinlichkeit (Label-Anbieter) | 🟡 Indiz |
| Screenshot / Behauptung **ohne** TX-Hash | 🔴 zählt nicht |

### Anwendung durch Agenten
Jede Aussage mit **TX-Hash/Explorer-Link + Datum** belegen; Heuristik als solche kennzeichnen.
Domänen-Ampel + Score (0–100) ausgeben; Muster-Abgleich gegen *rug-pull-muster*.

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/forensik/index.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
