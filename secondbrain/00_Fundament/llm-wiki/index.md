# LLM-Wiki (Karpathy) — Fundament

Wie LLMs „denken" — Grenzen, Bias, Halluzination, Tokenisierung, Kontextfenster. Leitsatz:
*„What I cannot create, I do not understand."* Der Senior-Analyst behauptet nur, was er aus Belegen
nachbauen kann. `type: foundation`.

## Quelle
* Karpathys LLM-Wiki liegt bereits importiert unter
  [../ki-strukturen/AIS 2027/raw/llm-wiki.md](../ki-strukturen/AIS%202027/raw/llm-wiki.md).

## Anwendung im Vault
- **Quellenpflicht + Ampel** gegen Halluzination (siehe GESAMTKONZEPT §5).
- **Progressive Verständnis-Tiefe:** jede Analyse baut prüfbar auf den vorherigen auf.

---

## Qualitäts-Gate — Konfidenz-Deckel (kein 100 %-Gewicht)

Dieses Fundament punktet nicht im Index (siehe [../index.md](../index.md)); es setzt die **Obergrenze der
Konfidenz** und ist damit der eigentliche Schutz gegen falsche 99,99 %. Ziel-Genauigkeit wird nicht
behauptet, sondern **verdient** — durch reproduzierbare Belege.

### Konfidenz-Skala (0–1) nach Beleglage

| Beleglage | Konfidenz-Deckel |
|---|:---:|
| Keine Quelle / reine Vermutung | ≤ **0,30** |
| Eine unverifizierte Quelle | ≤ **0,60** |
| Mehrere unabhängige, verifizierbare Quellen | ≤ **0,90** |
| Behördlich **oder** On-Chain reproduzierbar (mehrere harte 🟢-Domänen) | ≤ **0,99** |

> **99,99 %** ist reserviert für den Fall, dass Recht **und** Forensik hart 🟢 sind *und* jeder Schritt
> reproduzierbar ist. Alles andere wird gesenkt.

### Übersetzungsformat — Karpathy-Filter
| Aussage-Typ | Umgang |
|---|---|
| Aus Belegen nachbaubar | behaupten (mit Quelle+Datum) |
| Plausibel, aber nicht belegt | als Hypothese markieren, Konfidenz senken |
| Datenlücke | **markieren, senken, NICHTS erfinden** |

### Anwendung durch Agenten
Konfidenz nie über den durch die Beleglage erlaubten Deckel setzen; zusätzlich das Prozess-Gate
([../ki-strukturen/](../ki-strukturen/)) beachten — der jeweils **niedrigere** Deckel gewinnt.
