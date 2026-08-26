---
type: source
title: "Ripple/XRP — Institutionelle Cross-Border-Schiene"
description: "Ripple ersetzt SWIFT-Clearing für banknahe grenzüberschreitende Zahlungen; XRP als Bridge-Currency via ODL."
tags:
  - source
  - geldsystem
  - ripple
  - xrp
  - cross-border
  - iso-20022
  - schiene
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/geldsystem/schienen-ripple/ripple-xrp.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:a9811cbb35f5394d5ca71069c1793c50ef20d10c9067e09837a74e7be0d15b62"
---


# Ripple/XRP — Institutionelle Cross-Border-Schiene

## Kernthese

Ripple Labs (gegr. 2012) baut die Schiene, die SWIFT für banknahe Cross-Border-Zahlungen
ersetzt. XRP dient als **Bridge-Currency** im ODL-System (On-Demand-Liquidity): statt
Nostro/Vostro-Konten in jedem Währungsparität vorzuhalten, wird Fiat→XRP→Fiat in Sekunden
abgewickelt. 300+ Bank-Partnerschaften weltweit (Stand Nov 2025, Yahoo Finance).

## Architektur

```
  Bank A (Währung X)                    Bank B (Währung Y)
  ┌─────────────┐                      ┌─────────────┐
  │ RippleNet   │ ── Fiat → XRP ──►   │ RippleNet   │ ── XRP → Fiat ──►
  │ (Software)  │    (ODL-Bridge)      │ (Software)  │
  └─────────────┘                      └─────────────┘
         │                                    │
         └──── XRP Ledger (XRPL) ────────────┘
               3-5 Sek. Settlement
```

**Zwei Modi:**
1. **RippleNet Software** — Bank nutzt Ripple-Messaging/Routing ohne XRP (~60 % der Partner)
2. **ODL (On-Demand-Liquidity)** — XRP als Bridge-Currency, sekundenschnelles Settlement (~40 %)

## Value-Accrual-Problem

| Aspekt | Bewertung |
|---|---|
| 300+ Bank-Partnerschaften | ✅ Fakt |
| Davon mit XRP-Kontakt (ODL) | ~40 % (geschätzt, nicht von Ripple bestätigt) |
| ODL-Partner halten XRP? | Nein — Fiat→XRP→Fiat in Sekunden, keine Haltedauer |
| Escrow-Overhang | 1B XRP monatlich (Jan 2026), ~70 % re-locked |
| Spot-ETF-Flows | >$1B (Bitwise, Grayscale, Franklin Templeton, Nov 2025) |

**Strukturelle Diskrepanz:** Ripple als Unternehmen ist erfolgreich (Software-Lizenzen,
Partnerschaften). XRP als Asset profitiert nur, wenn ODL-Volumen massiv skaliert — nicht
von Software-Partnerschaften.

## SEC vs. Ripple

- **Juli 2023:** Judge Torres — XRP ist **kein Security** im secondary market
- **August 2024:** Ripple zu $125M Strafe verurteilt (unter ursprünglicher Forderung $2B)
- **Status:** Urteil nicht vollumfänglich rechtskräftig; SEC-Appeal möglich
- **Wirkung:** Klarheit für secondary-market XRP-Verkäufe, aber primary-market-Fragen offen

## Regulatorische Meilensteine (2026)

| Datum | Ereignis | Quelle |
|---|---|---|
| 25.06.2026 | JFSA-Zulassung für RLUSD in Japan via SBI VC Trade | Ripple Press |
| Q2 2026 | Vorläufige MiCA-CASP-Lizenz (CSSF Luxemburg) | Stella-Bewertung |
| Q2 2026 | DFSA-Lizenz (Dubai) | Stella-Bewertung |
| 18.07.2026 | OCC Final Rules für Stablecoins (GENIUS Act) ausstehend | Tracee Group |

## ISO 20022

Ripple ist Mitglied im ISO 20022 Standards Body. XRPL ist nativ ISO-20022-kompatibel.
SWIFT migriert bis 2026 von MT- auf ISO-20022-Format — Ripple ist prä-positioniert.
Siehe *iso-20022*.

## Schlüssel-Partnerschaften

| Partner | Art | Status |
|---|---|---|
| *SBI* Holdings ($214B AUM) | Strategische Partnerschaft, RLUSD-Japan | 🟢 Live |
| Santander, PNC, Banco Bilbao | RippleNet-Software | 🟡 Software (teilweise ODL) |
| Volante Technologies | FedNow + RippleNet-Integration | 🟡 Pilot |

## Verbindung zu Stellar

Ripple (institutionell) und *stellar-xlm* (Retail/Mass) sind **komplementär**:
- Ripple: Bank ↔ Bank, hohe Tickets, Cross-Border-Clearing
- Stellar: Mensch ↔ Merchant, kleine Tickets, Massenadoption

Beide ISO-20022-kompatibel. Gemeinsamer Nenner: *Jed McCaleb* (Ripple-Mitgründer → Stellar-Mitgründer).

## Quellen

- Forbes (März 2026): Ripple-Guide für Investoren
- crypto.news (01.07.2026): Value-Accrual-Analyse
- Yahoo Finance (Nov 2025): 300+ Bank-Partnerschaften
- Ripple Press (24.06.2026): SBI/RLUSD-Japan-Launch
- BeInCrypto (Dez 2025): XRP-Escrow-Unlock 1B

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/schienen-ripple/ripple-xrp.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
