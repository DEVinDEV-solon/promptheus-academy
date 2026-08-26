---
type: source
title: "Stablecoin-Typen — Die neue Geldschicht"
description: "Fiat-backed, Crypto-backed, Algorithmic, CBDC: die vier Stablecoin-Kategorien und ihre Rolle im neuen Geldsystem."
tags:
  - source
  - geldsystem
  - stablecoin
  - cbdc
  - usdc
  - rlusd
  - pyusd
  - usdt
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/geldsystem/stablecoin-architektur/stablecoin-typen.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:382d214681c4ee2807dc06a9f7d794553dda5122c9e1e01bf436d222e718fdc5"
---


# Stablecoin-Typen — Die neue Geldschicht

## Vier Kategorien

### 1. Fiat-Backed Stablecoins (Marktführer)
- **USDC** (Circle): multichain, reguliert, MiCA-konform, auf Stellar
- **USDT** (Tether): größter Stablecoin, MiCA-Konformität umstritten
- **RLUSD** (Ripple): JFSA/MiCA/DFSA-reguliert, $1.7B MC
- **PYUSD** (PayPal/Paxos): auf Ethereum + Solana
- **USST** (Open USD Konsortium): backed by tokenisierte Treasuries (BlackRock BUIDL), live auf Stellar

**Reserven:** USD-Cash + US-Treasuries. Regulierung: GENIUS Act (US), MiCA (EU).

### 2. Crypto-Backed Stablecoins
- **DAI** (MakerDAO): überbesichert durch ETH/RWA
- **aUSDT** (Tether, eingestellt Juni 2026): Gold-backed Variante

**Reserven:** On-Chain-Collateral (ETH, BTC). Transparent, aber volatil.

### 3. Algorithmic Stablecoins
- Beispiel: UST (Terra, kollabiert Mai 2022)
- **Status:** 🔴 Nach UST-Kollaps reguliert praktisch tot

**Keine Reserven.** Algorithmus regelt Supply. Hochriskant.

### 4. CBDCs (Central Bank Digital Currencies)
- **Wholesale CBDC:** Bank-zu-Bank, Shared Ledger (BIS-Projekte, Project Agora)
- **Retail CBDC:** Bürger-zu-Zentralbank (China e-CNY, Bahamas Sand Dollar)

**Emittent:** Zentralbank direkt. Kein privater Intermediär. Siehe *geldsystem-2030*.

## Das Drei-Ebenen-Modell (IMF)

```
  Ebene 1: Zentralbank-Reserven (Wholesale CBDC)
           ↓ tokenisiert auf Shared Ledger
  Ebene 2: Commercial-Bank-Gelder (Deposits)
           ↓ tokenisiert auf Permissioned Ledger
  Ebene 3: Stablecoins (privat, fiat-backed)
           ↓ auf Public Ledger (Stellar, Ethereum)
```

**IMF-Position:** Alle drei Formen koexistieren. Tokenisierung "eliminiert nicht Banken,
sondern zwingt sie auf Shared Ledgers." Stellar adressiert alle drei Ebenen:
- Permissioned Layer (Soroban + Vaults) für Ebene 1+2
- Public Ledger für Ebene 3

## Regulatorischer Rahmen (2026)

| Gesetz | Status | Wirkung |
|---|---|---|
| **GENIUS Act** (Lummis-Gillibrand) | 🟡 In Bearbeitung (Senat) | Stablecoin-Regulierung US, Reserve-Anforderungen |
| **Clarity Act** (H.R. 4766) | 🟡 In Bearbeitung (House) | Payment-Stablecoin-Rahmen, State/Federal-Zuständigkeit |
| **STABLE Act** | 🟡 In Bearbeitung | Transparenz + Reserve-Anforderungen |
| **MiCA** (EU) | ✅ In Kraft seit 01.07.2026 | CASP-Lizenz, Stablecoin-Reserven |
| **JFSA** (Japan) | ✅ RLUSD zugelassen | "Neue Art elektronisches Zahlungsinstrument" |

**Erwartung:** Sobald GENIUS Act + Clarity Act verabschiedet sind → große Ausroll-Phase.
Stablecoins werden reguliert legal → Institutionen steigen massiv ein → Liquidität flutet
die Chains → Airdrops als Community-Building werden strategisch eingesetzt. (*GOAL_STELLAR_AIRDROPS_PLAN*)

## Stablecoins auf Stellar

| Stablecoin | Emittent | Status | Notes |
|---|---|---|---|
| USDC | Circle | 🟢 Live | Multichain, MiCA-konform |
| USST | Open USD Konsortium | 🟢 Live (02.07.2026) | Backed by tokenisierte Treasuries |
| EURC | Circle | 🟢 Live | Euro-Stablecoin |
| USDV | Velo Labs | 🟢 Live | BlackRock BUIDL Reserven via Securitize |

## Stablecoins auf Ripple/XRPL

| Stablecoin | Emittent | Status |
|---|---|---|
| RLUSD | Ripple | 🟢 Live, multichain (40 Blockchains) |

## Quellen

- IMF Blog (02.07.2026): Tobias Adrian — Tokenization Can Change Financial Architecture
- The Dissident Voice (Juni 2026): Clarity Act und Stablecoin Wars
- Transak (2026): Visa/Mastercard Stablecoin Settlement
- Wharton BDAP (Jan 2026): Stablecoin Toolkit

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/stablecoin-architektur/stablecoin-typen.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
