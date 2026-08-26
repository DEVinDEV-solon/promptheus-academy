---
type: source
title: "Stellar/XLM — Globale Massenadoption-Schiene"
description: "Stellar ist die DLT-Schiene für Retail-Zahlungen, RWA-Tokenisierung und CBDC-Pilots; XLM als Gas/Settlement-Asset."
tags:
  - source
  - geldsystem
  - stellar
  - xlm
  - mass-adoption
  - rwa
  - cbdc
  - schiene
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/geldsystem/schienen-stellar/stellar-xlm.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:0230b5a54d4726ed70fa1f5ea4fd84e3f9daf9f773e8d17c8ef017e37d824a5a"
---


# Stellar/XLM — Globale Massenadoption-Schiene

## Kernthese

Stellar (gegr. 2014 von Jed McCaleb, ehem. Ripple-Mitgründer) ist die DLT-Schiene für den
**globalen Massenbetrieb**: schnelle (3-5 Sek.), billige (<0.01 $) Cross-Border-Zahlungen,
Stablecoin-Settlement, RWA-Tokenisierung und CBDC-Pilots. XLM (Lumens) ist das native
Gas-/Settlement-Asset.

## Architektur

```
  Retail / Merchant                      Institution
  ┌──────────────┐                      ┌──────────────┐
  │ MoneyGram    │ ── Fiat → XLM ──►   │ DTCC         │ ── Tokenized RWA
  │ LOBSTR       │    (Stellar Net)     │ Visa/OpenUSD │ ── USST Stablecoin
  │ USDC/PYUSD   │                      │ SDF          │
  └──────────────┘                      └──────────────┘
         │                                    │
         └──── Stellar Ledger ────────────────┘
               + Soroban (Smart Contracts, Rust/WASM)
```

## Institutionelle Meilensteine (2026)

| Datum | Meilenstein | Quelle |
|---|---|---|
| 27.05.2026 | DTCC + SDF: Tokenisierung DTC-verwahrter Assets angekündigt | DTCC.com |
| 04.05.2026 | DTCC: 50+ Firmen beitreten Tokenization Service | DTCC.com |
| Juli 2026 | Erste limitierte Live-Trades tokenisierter RWAs auf Stellar | DTCC.com |
| 02.07.2026 | Open USD Konsortium: Visa, Stripe, BlackRock + 140 Firmen | Blockhead |
| 02.07.2026 | USST (tokenisierte Treasuries) live auf Stellar | BanklessTimes |
| Juni 2026 | Protocol 25/27: Confidential Tokens + Quanten-Resistenz | Stellar.org |
| 2026 | Protocol 27 "Zipper": Validator-Upgrade | Stella-Bewertung |

## XLM Token-Ökonomie

| Aspekt | Status |
|---|---|
| Max Supply | ~50 Mrd. XLM (ursprünglich 100 Mrd., Halbierung 2019) |
| SDF-Reserven | ~50 % der Supply (zentr. Verteilungsrisiko) |
| Circulating Supply | ~30 Mrd. XLM |
| Preis (Juli 2026) | ~$0.20 (CoinMarketCap) |
| ATH | $0.94 (Jan 2018) |
| Gas-Modell | XLM für Transaktionsgebühren (0.00001 XLM/Op) |

**Risiko:** SDF hält ~50 % der Supply — zentralisiertes Verteilungsrisiko, aber SDF ist
Non-Profit mit transparenter Governance (Denelle Dixon, CEO).

## Partnerschaften

| Partner | Art | Status |
|---|---|---|
| *DTCC* | Tokenisierung DTC-verwahrter Assets | 🟢 Angekündigt, Live-Trades Juli 2026 |
| *MoneyGram* | Cash On/Off-Ramp auf Stellar (MoneyGram Access) | 🟢 Live |
| Visa / Open USD | Konsortiums-Mitglied, USST-Stablecoin | 🟢 Live (02.07.2026) |
| BlackRock (BUIDL) | Tokenisierte Treasuries als USST-Reserve | 🟢 Live |
| Circle (USDC) | Stablecoin auf Stellar | 🟢 Live |
| IBM (World Wire) | Ehemalige Cross-Border-Lösung | 🔴 Eingestellt (2021) |

## Soroban — Smart Contracts auf Stellar

Siehe *soroban*. Rust-basierte, WASM-ausgeführte Smart Contracts auf Stellar.
$100M Adoption Fund. Protocol 25 brachte Privacy-Features (Confidential Tokens).

## CBDC-Pilots

Stellar hat mehrere CBDC-Pilots gehostet (Ukraine, Bahamas Sand Dollar Anbindung).
Die SDF positioniert Stellar als CBDC-kompatibel durch Permissioned-Layer-Ansatz
(Soroban + Vaults). Siehe *stablecoin-typen* für CBDC vs Stablecoin.

## Verbindung zu Ripple

Stellar (Retail/Mass) und *ripple-xrp* (institutionell) sind **komplementär**.
Gemeinsamer Ursprung: Jed McCaleb. Beide ISO-20022-kompatibel. Siehe *geldsystem-2030*.

## Quellen

- CCN: Meet Stellar — XLM Global Payments
- Stellar.org Case Studies: DTCC
- BanklessTimes (02.07.2026): XLM-Rally durch Open USD
- Blockhead (01.07.2026): Visa, Stripe, BlackRock im Open USD Konsortium
- IMF Blog (02.07.2026): Tobias Adrian zur Tokenisierung

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/schienen-stellar/stellar-xlm.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
