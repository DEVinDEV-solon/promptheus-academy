---
type: source
title: "ISO 20022 — Der globale Zahlungs-Messaging-Standard"
description: "ISO 20022 ersetzt SWIFTs MT-Format; Ripple und Stellar sind nativ kompatibel und prä-positioniert für die Migration bis 2026."
tags:
  - source
  - geldsystem
  - iso-20022
  - swift
  - ripple
  - stellar
  - messaging-standard
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/geldsystem/schienen-ripple/iso-20022.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:3bbc974e0097bf853b70580870e85a689edef4dab86f597b9e03c2d132dffdb7"
---


# ISO 20022 — Der globale Zahlungs-Messaging-Standard

## Kernthese

ISO 20022 ist der internationale Standard für elektronischen Datenaustausch im
Zahlungsverkehr. Er ersetzt SWIFTs veraltetes MT-Format (MT103/MT202) durch ein
reichhaltiges, strukturiertes XML/JSON-Format. SWIFT erwartet, dass bis 2026 **90 % der
globalen Transaktionen** auf ISO 20022 migriert sind.

## Warum das für Ripple/Stellar wichtig ist

| Projekt | ISO 20022 Status | Vorteil |
|---|---|---|
| Ripple (XRPL) | Mitglied im ISO 20022 Standards Body | Native Kompatibilität; RippleNet sendet/empfängt ISO-20022-Nachrichten |
| Stellar (XLM) | ISO-20022-kompatibles Ledger-Format | Stellar-Transaktionen abbildbar auf ISO-20022-Nachrichten |

**Beide Schienen sind prä-positioniert:** Wenn Banken von MT auf ISO 20022 migrieren,
fallen sie nicht auf eine proprietäre Blockchain-Lösung, sondern auf ISO-20022-kompatible
DLT-Schienen. Ripple und Stellar sind die einzigen großen Blockchains mit nativer
ISO-20022-Kompatibilität.

## Migration Timeline

| Meilenstein | Datum |
|---|---|
| SWIFT startet ISO 20022 Migration | Nov 2022 |
| Cross-Border-Payments vollständig migriert | 2023–2025 |
| 90 % globale Transaktionen auf ISO 20022 | 2026 (SWIFT-Erwartung) |
| MT-Format-End-of-Life | 2025+ (phasenweise) |

## SWIFT "Policy Lab"

SWIFT hat die "Policy Lab" wiederbelebt — Top-Banken erkunden XRP-Integration
für Compliance, Automatisierung und Interoperabilität. SWIFT positioniert sich
selbst als neutraler Messenger, der mehrere Netzwerke (inkl. Blockchain) routet.

## Drei-Ebenen-Modell

```
  Ebene 1: Messaging (SWIFT GPI / ISO 20022)
           ↓
  Ebene 2: Settlement (traditionell: Nostro/Vostro → neu: XRP/XLM/Stablecoin)
           ↓
  Ebene 3: Clearing (traditionell: Clearinghäuser → neu: DLT-Shared-Ledger)
```

ISO 20022 adressiert Ebene 1. Ripple/Stellar adressieren Ebene 2 + 3. DTCC-Tokenisierung
adressiert Ebene 3. Siehe *swift-vs-dlt*.

## Quellen

- CCN (Nov 2025): SWIFT ISO 20022 Migration — XRP vs XLM
- CoinCentral (Dez 2025): ISO 20022 boostet XRP Cross-Border-Nutzung
- ainvest (Aug 2025): Strategische Auswirkung auf XRP/XLM
- DailyCoin (Dez 2025): SWIFT-Glow-up katapultiert XRP ins Banking-Core

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/schienen-ripple/iso-20022.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
