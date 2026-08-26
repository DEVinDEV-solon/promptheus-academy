---
type: source
title: "Glossar"
description: "Begriffe dieses Vaults in einem Satz"
tags:
  - source
  - fundament
  - glossar
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/glossar.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:4a07891bbf531992fc939a162aa448dc3cf1e51bf2d7c25e3aae81cb75f2e139"
---


# Glossar

| Begriff | Bedeutung |
|---|---|
| **AI Act** | VO (EU) 2024/1689. Art. 50 (Transparenz) seit 02.08.2026 anwendbar. → *eu-ai-act-artikel-50* |
| **C2PA** | Offener Standard für signierte Herkunftsmetadaten in Dateien. Für Bilder, nicht für Text. → *c2pa-content-credentials* |
| **Content Credentials** | Marketingname der C2PA-Manifeste. |
| **Detection-API** | Angekündigte Anthropic-Schnittstelle zur Wasserzeichenprüfung. Noch nicht verfügbar. |
| **Distortion-free** | Eigenschaft eines Wasserzeichens, die Ausgabeverteilung im Erwartungswert nicht zu verändern. |
| **Entropie** | Maß der Wahlfreiheit bei der nächsten Tokenwahl. Das „Budget" des Wasserzeichens. → *sampling-und-entropie* |
| **Falsch-Negativ** | KI-Text wird nicht erkannt. Häufig. |
| **Falsch-Positiv** | Menschentext wird als KI markiert. Selten, aber schadensträchtig. |
| **Green List / Red List** | Kontextabhängige Zweiteilung des Vokabulars bei Kirchenbauer. → *kirchenbauer-green-red-list* |
| **Gumbel-Max-Trick** | Sampling per Rauschaddition + argmax. Basis des Aaronson-Schemas. |
| **Logit** | Unnormierter Score, den das Modell jedem Vokabular-Token gibt. → *logits-und-softmax* |
| **Logit-Bias** | Additive Konstante δ auf ausgewählte Logits. Der Eingriff bei Kirchenbauer. |
| **Softmax** | Funktion, die Logits in Wahrscheinlichkeiten wandelt. |
| **SynthID / SynthID-Text** | Google-DeepMind-Verfahren; SynthID-Text ist die Textvariante (Nature 2024). Grundlage von Anthropics Wasserzeichen. → *synthid-text-tournament-sampling* |
| **Temperatur (T)** | Skalierungsfaktor vor der Softmax. Niedrig = deterministischer. |
| **Token** | Verarbeitungseinheit des Modells, meist Wortteil. Deutsch ≈ 1,8–2,2 Tokens/Wort. → *tokens-und-vokabular* |
| **Tournament-Sampling** | Auswahlverfahren von SynthID-Text: Kandidaten treten paarweise nach schlüsselabhängigen g-Werten an. |
| **Vibe Coding** | Code weitgehend vom Modell erzeugen lassen, ohne gestaltende Kontrolle. Urheberrechtlich der kritische Fall. |
| **Wasserzeichen (Text)** | Statistisches Signal in der Tokenauswahl, nur mit Geheimschlüssel nachweisbar. |
| **z-Score** | Teststatistik für die Abweichung vom Zufallserwartungswert. |

## Begriffe, die im Video falsch fallen

Die ASR-Verballhornungen (z. B. „Cloud" für Claude, „Loggets" für Logits) stehen vollständig in *asr-korrekturliste*.

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/glossar.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
