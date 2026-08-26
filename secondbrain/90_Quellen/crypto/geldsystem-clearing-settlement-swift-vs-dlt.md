---
type: source
title: "SWIFT vs DLT — Vom Messaging zur Shared Ledger"
description: "SWIFT als Messaging-Standard (ISO 20022) vs DLT-basiertes Settlement (Ripple/Stellar); die drei Ebenen des Zahlungsverkehrs."
tags:
  - source
  - geldsystem
  - swift
  - dlt
  - ripple
  - stellar
  - iso-20022
  - clearing
  - settlement
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/geldsystem/clearing-settlement/swift-vs-dlt.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:3a53359489be8347455ef1e728d2bbc91bc81e82f4ed06c9b0acb7a5eb889715"
---


# SWIFT vs DLT — Vom Messaging zur Shared Ledger

## Drei Ebenen des Zahlungsverkehrs

```
  Ebene 1: MESSAGING
  ┌─────────────────────────────────────────┐
  │ SWIFT (ISO 20022) — "Was soll passieren?" │
  │ Legacy: MT-Format (MT103/MT202)           │
  └─────────────────────────────────────────┘
           ↓
  Ebene 2: SETTLEMENT
  ┌─────────────────────────────────────────┐
  │ Nostro/Vostro (Legacy) — vorfinanziert   │
  │ XRP/ODL (Ripple) — sekundenschnell       │
  │ Stablecoin (USDC/RLUSD) — on-chain       │
  └─────────────────────────────────────────┘
           ↓
  Ebene 3: CLEARING
  ┌─────────────────────────────────────────┐
  │ DTCC/Euroclear (Legacy) — zentral        │
  │ Stellar Shared Ledger — dezentral        │
  │ DTCC auf Stellar — Hybrid                │
  └─────────────────────────────────────────┘
```

## SWIFT — Der Legacy-Messenger

| Aspekt | SWIFT (Legacy MT) | SWIFT (ISO 20022) |
|---|---|---|
| Format | MT103/MT202 (text) | XML/JSON, strukturiert |
| Geschwindigkeit | 1-3 Tage | <1 Stunde (GPI) |
| Transparenz | Opak | End-to-End-Tracking |
| Migration | 2022–2026 | 90 % bis 2026 |
| Volumen | $155 Trillionen/Jahr | wachsend |

**SWIFT "Policy Lab":** Top-Banken erkunden XRP-Integration. SWIFT positioniert sich als
neutraler Messenger, der DLT-Netzwerke routet — nicht als Konkurrent zu Ripple/Stellar.

## DLT-Settlement — Die neue Schiene

| Schiene | Ebene 1 (Messaging) | Ebene 2 (Settlement) | Ebene 3 (Clearing) |
|---|---|---|---|
| Ripple | ISO 20022 (RippleNet) | XRP/ODL/Stablecoin | XRPL Shared Ledger |
| Stellar | ISO 20022-kompatibel | XLM/Stablecoin | Stellar Shared Ledger + DTCC |
| Ethereum | — | ETH/Stablecoin | EVM Smart Contracts |

**Vorteil DLT:** Settlement und Clearing verschmelzen — keine separate Clearing-Stufe,
keine Nostro/Vostro-Konten, keine 1-3 Tage Wartezeit.

## Nostro/Vostro — Das Liquiditäts-Problem

Traditionelles Correspondent Banking braucht **vorfinanzierte Konten** in jeder Währung:
- Bank A hat ein Vostro-Konto bei Bank B in Währung Y
- Bank B hat ein Nostro-Konto bei Bank A in Währung X
- Kapitalbindung: Billionen USD globally in Nostro/Vostro

**ODL-Lösung (Ripple):** Statt Nostro/Vostro → XRP als Bridge, sekundenschnell, keine
Kapitalbindung. Aber: ~60 % der Ripple-Partner nutzen nur Software, nicht ODL.

## FedNow — Der dritte Weg

FedNow (Federal Reserve, Juli 2026) ist ein **Instant-Payment-Rail** für US-Inlandszahlungen.
- Nicht blockchain-basiert (zentralisiertes Fed-System)
- 24/7/365, <1 Sekunde, ISO-20022-konform
- Ripple-Partner Volante testet FedNow-Integration

**Position:** FedNow ersetzt nicht Cross-Border (Ripple's Domain), sondern beschleunigt
US-Inlandszahlungen. Ergänzt, konkurriert nicht direkt mit Ripple/Stellar.

## Die SWIFT-Koexistenz-These

SWIFT verschwindet nicht — es **transformiert** sich zum ISO-20022-Messaging-Layer,
der DLT-Netzwerke routet. Die Ebenen 2+3 (Settlement + Clearing) werden von DLT übernommen.

## Quellen

- CCN (Nov 2025): SWIFT ISO 20022 Migration — XRP vs XLM
- DailyCoin (2026): SWIFT Policy Lab fast-tracking XRP adoption
- Transak (2026): Real-Time Payments — RTP, FedNow, Stablecoin Rails
- CoinGape (2026): Ripple-Partner Volante komplettiert FedNow-Testing

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/clearing-settlement/swift-vs-dlt.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
