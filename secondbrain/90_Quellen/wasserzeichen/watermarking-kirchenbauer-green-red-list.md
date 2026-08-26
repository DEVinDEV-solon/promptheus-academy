---
type: source
title: "Green-/Red-List mit Logit-Bias (Kirchenbauer 2023)"
description: "Das Verfahren, das das Video erklärt — real, gut dokumentiert, aber nicht Anthropics"
tags:
  - source
  - fundament
  - watermarking
  - kirchenbauer
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/watermarking/kirchenbauer-green-red-list.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:fddc990a607c71084fe082f4ee9b6af2c9ac7fd8a7b10a0bfa8005517d610bf8"
---


# Green-/Red-List mit Logit-Bias

**Quelle:** Kirchenbauer, Geiping, Wen, Katz, Miers, Goldstein — *A Watermark for Large Language Models*, ICML 2023.

Das bekannteste Textwasserzeichen-Verfahren und dasjenige, das im analysierten Video ab 02:34 detailliert erklärt wird. Es ist **real und korrekt beschrieben** — es ist nur nicht das, was Anthropic einsetzt. → *2026-08-16-mechanismus-divergenz*

## Der Algorithmus

Für jedes zu erzeugende Token:

1. **Hashen.** Nimm die letzten $h$ Tokens (oft $h=1$) und hashe sie zusammen mit einem geheimen Schlüssel.
2. **Seeden.** Initialisiere mit diesem Hash einen Pseudozufallsgenerator.
3. **Partitionieren.** Teile das **gesamte** Vokabular pseudo-zufällig in eine **Green List** (Anteil $\gamma$, typisch 0,25–0,5) und eine **Red List** (Rest).
4. **Bias addieren.** Addiere auf die Logits **aller** Green-List-Tokens eine Konstante $\delta$ (typisch 0,5–4,0).
5. **Sampeln.** Normal weitersampeln.

Entscheidend: die Partition ist **kontextabhängig**. Ein Token ist an einer Stelle grün, an der nächsten rot. Es gibt keine feste „grüne Wortliste", die man auslesen könnte.

## Warum die Bedeutung erhalten bleibt

$\delta$ ist klein. Ein plausibler Kandidat mit grünem Los rutscht vor einen ähnlich plausiblen mit rotem Los. Ein unsinniger Kandidat („Banane") bleibt auch mit Bonus chancenlos, weil sein Logit dramatisch niedriger liegt. Das Video bringt genau dieses Beispiel und trifft die Logik korrekt.

## Der Nachweis

Der Detektor kennt den Schlüssel, rechnet die Partition für jede Position nach und zählt die grünen Tokens. Unter der Nullhypothese „kein Wasserzeichen" ist der Anteil grüner Tokens $\approx \gamma$. Die Prüfgröße ist ein z-Score:

$$z = \frac{|s|_G - \gamma T}{\sqrt{T\gamma(1-\gamma)}}$$

mit $T$ = Token-Zahl, $|s|_G$ = Anzahl grüner Tokens.

Der Nenner enthält $\sqrt{T}$ — **daher die Längenabhängigkeit**. Das Signal wächst mit $T$, das Rauschen nur mit $\sqrt{T}$.

### Zahlenbeispiel `[Illustration, γ = 0,5]`

| Tokens | erwartet grün | beobachtet | z ≈ | Bewertung |
|---|---|---|---|---|
| 24 | 12 | 18 | 2,4 | schwacher Hinweis |
| 300 | 150 | 225 | 8,7 | praktisch sicher |

> **Fehler im Video:** Es nennt bei 24 Tokens „28 grün" — mehr grüne Tokens als Tokens insgesamt. Vermutlich verlesen; gemeint war vermutlich 18. Der zweite Fall (300/150/225) ist konsistent. → *asr-korrekturliste*

## Der wesentliche Nachteil

Das Verfahren ist **nicht verteilungserhaltend**. Der Bias $\delta$ verschiebt die Ausgabeverteilung tatsächlich — bei niedriger Entropie oder großem $\delta$ messbar in Richtung schlechterer Textqualität. Genau dieser Nachteil motivierte Familie 3. → *synthid-text-tournament-sampling*

## Siehe auch
* *paper-kirchenbauer-2023*
* *verfahren-uebersicht*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/watermarking/kirchenbauer-green-red-list.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
