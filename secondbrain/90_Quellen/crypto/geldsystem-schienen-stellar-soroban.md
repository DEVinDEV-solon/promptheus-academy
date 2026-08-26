---
type: source
title: "Soroban — Smart Contracts auf Stellar"
description: "Rust/WASM-basierte Smart-Contract-Plattform auf Stellar; $100M Adoption Fund, Protocol 25 Confidential Tokens."
tags:
  - source
  - geldsystem
  - stellar
  - soroban
  - smart-contracts
  - defi
  - rust
  - wasm
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/geldsystem/schienen-stellar/soroban.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:7131fbabcf11c79abd81cdc29f675f4c56fd992c433857561abbc1827f5e9f1e"
---


# Soroban — Smart Contracts auf Stellar

## Kernthese

Soroban ist Stellars Smart-Contract-Plattform: Rust-basiert, WASM-ausgeführt, nahtlos
integriert in das Stellar-Ledger. Bringt DeFi-Fähigkeit auf Stellar, ohne die bewährte
Payments-Infrastruktur zu kompromittieren. $100M Adoption Fund von SDF.

## Technische Architektur

| Aspekt | Detail |
|---|---|
| Sprache | Rust (primär), AssemblyScript |
| Runtime | WebAssembly (WASM) |
| Gas | XLM (native Asset) |
| Integration | Parallel zu Stellar-Ledger, nicht als Layer-2 |
| Event-System | Contract-Events auf Stellar-Ledger |

## Protocol-Upgrades

| Protocol | Feature | Datum |
|---|---|---|
| Protocol 20 | Soroban Launch (Mainnet) | Feb 2024 |
| Protocol 22 | Soroban-Verbesserungen | 2025 |
| Protocol 25 | Confidential Tokens (Privacy) | Juni 2026 |
| Protocol 27 | "Zipper" — Validator-Upgrade | Juli 2026 |

## DeFi-Ecosystem

- $100M SDF Adoption Fund für Soroban-Entwickler
- DEX: StellarX, LOBSTR
- Lending: Blend Protocol
- Yield: Aquarius (AMM)

## Quanten-Resistenz

Protocol 25+ plant Quanten-resistente Signaturen. Stellar positioniert sich als
langfristig sichere Schiene — relevant für institutionelle Asset-Tokenisierung
(Wertpapiere haben Laufzeiten von Jahrzehnten).

## IMF-Bezug

IMF-Finanzdirektor Tobias Adrian (02.07.2026) warnt vor "too important to fail"-Smart
Contracts. Sorobans Sicherheitsphilosophie (auditierte Contracts, Rust-Typsystem,
kein unbounded-Loops) adressiert genau diese Sorge.

## Quellen

- stellar.org/soroban (offiziell)
- LeveX (Apr 2026): Soroban Smart Contracts Guide
- CryptoAdventure (Feb 2026): Stellar XLM Review 2026

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/schienen-stellar/soroban.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
