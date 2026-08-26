# 00 Fundament — Grundlagen für Analyse & Bewertung

Grundlagenwissen, auf dem jede Analyse aufsetzt. `type: foundation` (bzw. `law` für Gesetze).

* [ki-strukturen/](ki-strukturen/) - Agenten, Multi-Agent, RAG, Context Engineering, PIV; Link auf [[AIS 2027]]
* [llm-wiki/](llm-wiki/) - Karpathy-Spiegel: wie LLMs „denken" (Bias, Halluzination, Grenzen)
* [okf-format/](okf-format/) - das Open Knowledge Format, selbst dokumentiert
* [recht-gesetze/](recht-gesetze/) - MiCA, GwG/AML, SEC/Howey, BaFin, EU-Crypto-Regulierung
* [aktuelle-politik/](aktuelle-politik/) - geld-/regulierungspolitische Lage (datierte Konzepte)
* [psychologie/](psychologie/) - Markt-/Anlegerpsychologie, FOMO, Narrative, Manipulation
* [forensik/](forensik/) - On-Chain-Forensik, Rug-Pull-Muster, Wallet-Clustering
* [geldsystem/](geldsystem/) - Das neue Geldsystem: Ripple/XRP, Stellar/XLM, DTCC, ISO 20022, Stablecoins
* [trends/](trends/) - Markt-Trends & Sektor-Dynamik: TVL, Narrativ-Momentum, Sektor-Rotation

---

## Bewertungsraster — der 100 %-Fundament-Index

Damit jede Agenten-Bewertung **vergleichbar, gewichtet und belegt** ist, spannt das Fundament einen
Index von **100 %** auf. Jede Domäne unten trägt ihr eigenes Raster (Ampel + Unterkriterien +
Übersetzungsformat) in ihrer `index.md`. Agenten (Stella, Corp, Gene, Miro, Carmen) sollen **je Domäne
eine Ampel + Score vergeben** und daraus einen gewichteten Gesamtwert bilden.

### A) Bewertungs-Domänen — Summe 100 %

| # | Domäne | Ordner | Gewicht | Veto? |
|---|--------|--------|:------:|:-----:|
| 1 | Recht & Regulierung | [recht-gesetze/](recht-gesetze/) | **30 %** | ✅ Kill-fähig |
| 2 | On-Chain-Forensik | [forensik/](forensik/) | **30 %** | ✅ Kill-fähig |
| 3 | Markt-/Anlegerpsychologie | [psychologie/](psychologie/) | **20 %** | — |
| 4 | Geld-/Regulierungspolitik | [aktuelle-politik/](aktuelle-politik/) | **20 %** | — |

### B) Methodik- & Qualitäts-Gates — deckeln, statt zu punkten

Diese drei fließen **nicht** in die 100 % ein; sie begrenzen, *wie sicher* ein Verdikt sein darf:

| Gate | Ordner | Funktion |
|------|--------|----------|
| Prozess-Reife (PIV/Five-Eyes) | [ki-strukturen/](ki-strukturen/) | vollständige Kette Collector→Detector→Investigator→Writer→Validator? |
| Konfidenz-Deckel (Karpathy) | [llm-wiki/](llm-wiki/) | nur behaupten, was aus Belegen nachbaubar ist → Halluzinations-Diskont |
| Struktur-Compliance (OKF) | [okf-format/](okf-format/) | zählt die Notiz überhaupt? (Frontmatter/type/tags/Ablage) |

### Ampel → Punkte → Gesamtwert

- **Ampel je Domäne:** 🟢 = 100 · 🟡 = 50 · 🔴 = 0 (feiner: gewichtetes Mittel der Unterkriterien).
- **Gesamtwert** = Σ ( Domänengewicht % × Domänen-Score / 100 ) → Skala **0–100 %**.
- **Schwellen:** ≥ 75 % → 🟢 · 40–74 % → 🟡 · < 40 % → 🔴.
- **Veto-Regel:** ein 🔴 in **Recht** *oder* **Forensik** deckelt den Gesamtwert auf höchstens 🟡 —
  ein Kill-Kriterium schlägt jede Gewichtung.
- **Konfidenz** (0–1) wird zusätzlich durch das Karpathy-Gate begrenzt (siehe [llm-wiki/](llm-wiki/)):
  keine 99,99 % ohne mehrere harte, reproduzierbare 🟢-Domänen.

> Beispiel: Token 🟢 Recht (30) + 🟢 Forensik (30) + 🟡 Psychologie (10) + 🔴 Politik (0)
> = **70 %** → 🟡 Gesamt; Konfidenz je nach Beleglage, gedeckelt durch die Gates.

Die Gewichte (30/30/20/20) sind der zentrale Stellknopf und bewusst gesetzt: die beiden
*objektivsten und kill-fähigsten* Domänen (Recht, Forensik) dominieren; Psychologie und Politik
liefern Kontext und Timing. Anpassbar — bei Änderung diese Tabelle **und** die Domänen-Indizes pflegen.
