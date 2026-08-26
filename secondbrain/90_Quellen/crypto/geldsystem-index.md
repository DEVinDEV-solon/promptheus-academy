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
  pfad: "00_Fundament/geldsystem/index.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:209144d5812ff479dcf9101aa641fe429b84f537f9c39c2f637c12e12ec8cc29"
---

# geldsystem — Das neue Geldsystem: Schienen, Clearing & Stablecoins

Die architektonische Transformation des globalen Geldverkehrs: Legacy-Infrastruktur
(SWIFT, Clearinghäuser) wird durch DLT-basierte Schienen ersetzt. `type: foundation`.

> Themen: Ripple/XRP als institutionelle Cross-Border-Schiene, Stellar/XLM als
> Massenadoption-Layer, DTCC-Tokenisierung, ISO 20022, CBDCs vs Stablecoins,
> Settlement-Architektur, RLUSD/USDC/PYUSD als neue Geldschicht.

---

## Bewertungsraster — **Kontext-Domäne (ergänzend, kein Veto)**

Das Geldsystem-Raster bewertet nicht ein einzelnes Token, sondern die **infrastrukturelle
Position** eines Projekts im sich formenden neuen Geldsystem. Es erweitert die 100 %-Bewertung
(Recht 30 / Forensik 30 / Psychologie 20 / Politik 20) um die Frage: *Ist dieses Projekt
auf einer Schiene, die das neue System trägt — oder am Rand?*

> Noch nicht Teil der gewichteten 100 %. Bei Integration als 6. Domäne Neugewichtung
> aller Domänen erforderlich. Veto-Kraft liegt weiterhin bei Recht + Forensik.

### Ampel-Rubrik (für diese Domäne)

| Ampel | Bedeutung |
|:---:|---|
| 🟢 | Schienen-Position: Projekt sitzt auf einer DLT-Infrastruktur, die nachweislich institutionell adoptiert wird (DTCC, SBI, MoneyGram, Visa-Konsortium). ISO-20022-konform, reguliert, Live-Transaktionen. |
| 🟡 | Anschluss vorhanden: Projekt hat tech. Kompatibilität, aber Adoption ist pilothaft, angekündigt oder auf Nischen beschränkt. Schiene existiert, aber Nutzen ist nicht skalierend. |
| 🔴 | Keine Schienen-Position: Projekt auf einer Chain ohne institutionelle Anbindung, keine ISO-20022-Kompatibilität, keine echten Partnerschaften. Reine Spekulation. |

### Unterkriterien (Summe = 100 % dieser Domäne)

| Kriterium | Gewicht |
|---|:---:|
| Institutionelle Adoption (Banken, Clearinghäuser, Zahlungsdienstleister live) | 30 % |
| Settlement-Fähigkeit (Cross-Border, sekundenschnell, reguliert) | 25 % |
| ISO 20022-Kompatibilität & Regulierungskonformität | 20 % |
| Stablecoin-Integration (eigene oder Dritt-Stablecoins auf der Chain) | 15 % |
| Tokenisierungs-Fähigkeit (RWA, Wertpapiere, Real-World-Assets) | 10 % |

### Übersetzungsformat — Schienen-Härte

| Signal | Wertung |
|---|---|
| Regulierte Partnerschaft mit Institution (DTCC, SBI, MoneyGram) + Live-Transaktionen | 🟢 harte Schiene |
| Pilot / angekündigte Integration / Konsortiums-Mitgliedschaft ohne Live-Volumen | 🟡 angekündigte Schiene |
| Blockchain vorhanden, aber keine institutionelle Anbindung | 🔴 keine Schiene |

### Anwendung durch Agenten
Schienen-Position **datieren** (Adoption dreht sich schnell). Belege: Partnership-Press-Release,
Live-Transaktions-Volumen, ISO-20022-Zertifizierung, Regulierungsstatus (JFSA/MiCA/DFSA).
Domänen-Ampel + Score (0–100) mit Quelle + Datum. Schienen-Overlay auf Gesamtbewertung:
ein Projekt auf einer 🟢-Schiene ist timing-mäßig besser positioniert als eines ohne Anschluss.

---

## Die zwei Schienen des neuen Geldsystems

Die Fundamentalthese (aus *GOAL_STELLAR_AIRDROPS_PLAN* und den Agenten-Bewertungen):

| Schiene | Primärer Nutzen | Träger-Asset | Status |
|---|---|---|---|
| **Ripple (XRP/RLUSD)** | Institutionelle Cross-Border-Zahlungen, Banken-Clearing | XRP (Bridge) + RLUSD (Stablecoin) | SWIFT-Ersatz für Banken; 300+ Partner; JFSA/MiCA/DFSA-reguliert |
| **Stellar (XLM)** | Globaler Massenbetrieb, Retail-Zahlungen, RWA-Tokenisierung | XLM (Gas/Settlement) | DTCC-Partnerschaft; MoneyGram-Integration; Visa/Open-USD-Konsortium; Soroban-Smart-Contracts |

**Komplementär, nicht konkurrierend:** Ripple bedient die institutionelle Schiene
(Banken ↔ Banken), Stellar die Retail/Mass-Adoption-Schiene (Mensch ↔ Institution/Merchant).
Beide sind ISO-20022-kompatibel und ersetzen unterschiedliche Teile des Legacy-Systems.

---

## Unterordner

* [schienen-ripple/](schienen-ripple/) — Ripple/XRP, RLUSD, ISO 20022
* [schienen-stellar/](schienen-stellar/) — Stellar/XLM, Soroban, DTCC-Tokenisierung
* [stablecoin-architektur/](stablecoin-architektur/) — Stablecoin-Typen, Geldschicht-Modell
* [clearing-settlement/](clearing-settlement/) — SWIFT vs DLT, DTCC, Clearinghaus-Transformation

---

## Quellen & Werkzeuge

* Ripple Press (ripple.com) — Offizielle Partnerschafts-Ankündigungen
* Stellar.org Case Studies — DTCC, MoneyGram, IBM World Wire
* DTCC Digital Assets (dtcc.com/digital-assets) — Tokenization Service
* ISO 20022 Registration Authority — SWIFT-Migrationsstatus
* IMF Working Papers — Tokenisierung, CBDC-Forschung
* BIS Innovation Hub — Cross-Border-Zahlungs-Experimente
* CoinGecko / DefiLlama — On-Chain-Metriken (TVL, Volume)
* Hyperstellar (`05_Hyperstellar/hyperstellar.py`) — Stellar On-Chain-Analyse

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/geldsystem/index.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
