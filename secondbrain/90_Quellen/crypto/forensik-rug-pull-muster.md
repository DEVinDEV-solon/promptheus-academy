---
type: source
title: "Rug-Pull- & Scam-Muster (Stellar-Token)"
description: "Forensik-Kriterienkatalog für den Detector: woran man einen Scam/Rug-Pull auf Stellar erkennt."
tags:
  - source
  - forensik
  - scam
  - rug-pull
  - stellar
  - kriterien
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/forensik/rug-pull-muster.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:d831ba7f4bc28224a7f07a9d91ba701e6d19b744ebe19ddaafec99976b166c7b"
---

# Rug-Pull- & Scam-Muster (Stellar-Token)

Kriterienkatalog für die **Detector-Phase** (Five-Eyes). Jedes Kriterium: belegt? Severity 🔴/🟡/🟢.

## Issuer / Emittent
- **Frische/anonyme Issuer-Wallet**, kurz vor Token-Launch finanziert → 🔴 im Kombi mit Kontrollflags.
- **XLM-Abflüsse vom Issuer** an CEX/Mixer nach Verkäufen → Draining-Signal.
- **Token-Familie:** derselbe Creator emittiert viele Assets → Serien-Rugger.

## TOML / Projekt-Identität (`stellar.toml`)
- **Fehlt / nicht erreichbar** → keine prüfbare Identität.
- **Reset-Historie** (Web-Archive vergleichen): Domain/Team ausgetauscht → Piggyback auf fremder Reputation.
- Fremde Domain, die nicht zum Projekt passt → Piggyback-Scam.

## Kontroll-Flags (Stellar Asset)
- `auth_required` / `auth_revocable` / `clawback_enabled` aktiv → Emittent kann Guthaben **einfrieren/zurückholen**.
- **Kill-Kriterium:** Clawback/Revoke aktiv **+** anonymer Issuer ⇒ Tendenz REJECT.

## Markt / Liquidität
- **Wash-Trading:** zirkuläre Trades zwischen wenigen Wallets, Bot-Takt → Fake-Volumen.
- **Holder-Konzentration:** wenige Wallets halten Großteil des Supply → Dump-Risiko.
- **Liquidity Pools:** echt aktiv vs. leer/gestellt? Orderbook-Tiefe prüfen.
- **Ghost Supply** (autorisiert, aber nie zirkuliert) → Verwässerungs-Hebel des Emittenten.

## Abgrenzung Schläfer vs. Zombie
- **Zombie:** Team weg, Infrastruktur tot, keine On-Chain-Aktivität, TOML tot → strukturell tot.
- **Schläfer:** Infrastruktur intakt, LP/Orderbook aktiv, TOML erreichbar → Reaktivierung bei Rally möglich.

## Regulatorischer Hebel
- Historischer ICO (2017/18) → potenziell *SEC*-/Howey-relevant. Abgleich *MiCA* / *CLARITY Act*.

**Werkzeug:** On-Chain-Rohdaten via `05_Hyperstellar/hyperstellar.py` (Horizon direkt).

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/forensik/rug-pull-muster.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
