---
type: abnahme
title: "Abnahme — Abgeschnittener Titel und gesperrtes API-Key-Feld"
description: "Zwei gemeldete Fehler behoben: der PROMPTHEUS-Schriftzug war oben abgeschnitten (31,1 px in 24 px), und das API-Key-Feld in den Modelle-Einstellungen war gesperrt, weil der Schlüssel in der Prozessumgebung stand. Mit Messwerten und dem Nachweis, dass der Chat wieder läuft."
tags: [abnahme, promptheus, werkstatt, fehler, api-key, schrift]
timestamp: 2026-09-29T19:30:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Abgeschnittener Titel und gesperrtes API-Key-Feld

> **Beide Fehler behoben. Beide waren mein Fehler.** Der Schriftzug war zu groß
> für seine 24 px, und ich hatte den Schlüssel in die Prozessumgebung gehoben —
> genau die Schicht, die der Harness als nicht beschreibbar sperrt.

## 1. Der abgeschnittene Titel

**Die Ursache, gerechnet.** Der Harness gibt der Markenzeile genau **24 px**
Höhe und schneidet Überstand ab:

```css
/* packages/client/ui-sidebar/src/client/SidebarRoot.module.css */
.brandIdentity { height: 24px; }
.logoRow      { overflow: hidden; }
```

Mein Schriftzug brauchte aber mehr:

| Bestandteil | vorher | jetzt |
|---|---|---|
| „PROMPTHEUS" (Serife) | 16,3 px (1.02 rem) | **12,2 px** (0.76 rem) |
| „Werkstatt" (Grotesk) | 8,8 px (.55 rem) | **6,7 px** (.42 rem) |
| Mäander-Kante | 6,0 px (3 + 3) | **4,0 px** (2 + 2) |
| **Summe** | **31,1 px** | **22,9 px** |
| verfügbar | 24 px | 24 px |
| **Ergebnis** | **abgeschnitten** | **passt, 1,1 px Luft** |

**Behoben** in `pakete/dsh-client-ui-promptheus/src/client/index.ts`. Die Rechnung
steht jetzt als Kommentar an der Stelle selbst — wer dort etwas vergrößert, muss
sie neu machen.

**Nachgewiesen:** Das gebaute Bündel trägt `0.76rem` und **nicht mehr**
`1.02rem`. Auch im ausgelieferten Gesamtbündel steht der neue Wert, und der
Schriftzug ist dort.

## 2. Das gesperrte API-Key-Feld — mein Fehler

**Die Ursache.** Der Harness läutet seine Zugangsquellen so
(`packages/credentials/credentials-local/src/index.ts`, Kopfkommentar):

```text
inherited process environment      (read-only, wins)      ← gesperrt
> $DSH_HOME/.credentials.yaml      (provider-managed, writable)
> <invocation cwd>/.env            (read-only fallback)
> $DSH_HOME/.env                   (read-only fallback)
```

Und im Quelltext steht der Grund ausdrücklich:

> „The inherited environment wins because `DEEPSEEK_API_KEY=… dsh`, a CI secret,
> or a container `-e` is this run's explicit intent; it cannot be edited from
> inside, so it must be *visibly* read-only rather than silently shadow writes."

**Was ich falsch gemacht hatte:** Mein `starten.mjs` hob den Schlüssel aus der
`.env` **in die Prozessumgebung**:

```js
for (const [name, wert] of Object.entries(dateiUmgebung)) {
  if (umgebung[name] === undefined) umgebung[name] = wert   // ← das sperrt das Feld
}
```

Damit gewann die Umgebung, und das Feld war von innen nicht beschreibbar. Die
Oberfläche sagte es auch — genau der Text, den du gesehen hast:

> `keyEnvLocked`: „Provided by the launch environment (read-only)"

**Dazu kam die Windows-Benutzerumgebung.** `OPENROUTER_API_KEY` stand dort
dauerhaft. Der neue Anbieter, den du angelegt hast, leitet seine Referenz aus
seinem Namen ab (`deriveKeyRef(route)` in `CustomProviderCard.tsx`) — für die
Route `openrouter` also `OPENROUTER_API_KEY`. Und genau die war gesperrt.

> Deshalb war **beides** gesperrt: der DeepSeek-Anbieter (Referenz
> `DEEPSEEK_API_KEY`) und der neue OpenRouter-Anbieter (Referenz
> `OPENROUTER_API_KEY`). Es war nicht ein Feld, es waren zwei — aus derselben
> Ursache.

**Behoben, an drei Stellen:**

| Ort | Was |
|---|---|
| `werkzeuge/starten.mjs` | hebt den Schlüssel **nicht mehr** in die Umgebung; nur noch `DEEPSEEK_BASE_URL` (das ist keine Zugangsangabe, sondern die Anbieteradresse) |
| `werkzeuge/starten.mjs` | **warnt ausdrücklich**, wenn ein Schlüssel doch in der Prozessumgebung steht — mit dem Befehl zum Entfernen |
| Windows-Benutzerumgebung | `OPENROUTER_API_KEY` **entfernt** |

Zur dritten Stelle: Der Schlüssel gehört in die `.env` des Harness oder in
`.credentials.yaml` — dort ist er wirksam **und** über die Modelle-Seite
änderbar. In der Windows-Umgebung wäre er dauerhaft und unsichtbar.

## 3. Der falsche Schlüssel unter `DEEPSEEK_API_KEY`

Beim Nachsehen gefunden: In `.credentials.yaml` stand unter der Referenz
`DEEPSEEK_API_KEY` ein **OpenRouter**-Schlüssel (`sk-or-v1-…`). Der
DeepSeek-Anbieter liest genau diese Referenz und fragt damit `api.deepseek.com` —
das ergibt **HTTP 401**.

Das ist **nicht** durch diese Runde entstanden, sondern die Folge des früheren
Zustands (ein Schlüssel, zwei Namen). Es erklärt, warum der DeepSeek-Anbieter
„nichts annimmt". Mit freiem Feld lässt sich dort jetzt der richtige Schlüssel
eintragen — oder man bleibt beim OpenRouter-Anbieter, was ohnehin eingerichtet
ist.

## 4. Der Chat läuft

Gemessen, nicht behauptet. Der Harness ist auf den Anbieter `openrouter` mit dem
Modell `deepseek/deepseek-v4-flash-0731` eingestellt. Die Probe gegen OpenRouter
mit deinem Schlüssel:

```
Modell: deepseek/deepseek-v4-flash-0731
Anfrage: „antworte nur mit OK"
Antwort: „OK"
```

**Der Chat funktioniert.**

## 5. Stand

| Prüfung | Ergebnis |
|---|---|
| Werkstatt 3081 | **200** |
| Betrieb 3080 | **200** — unberührt |
| Schriftzug | **0.76rem** im Bündel, 22,9 px in 24 px |
| `OPENROUTER_API_KEY` in Prozessumgebung | **nein** |
| `OPENROUTER_API_KEY` in Windows-Benutzerumgebung | **nein** |
| Anbieter konfiguriert | `provider: openrouter` |
| Modellprobe | **HTTP 200**, Antwort „OK" |

## 6. Was du jetzt tun kannst

1. Die Werkstatt läuft. Öffne die Adresse aus dem Fenster — sie trägt das
   Zugangstoken.
2. **Unter Einstellungen → Modelle ist das Schlüsselfeld jetzt frei.** Der
   OpenRouter-Schlüssel liegt bereits in `.credentials.yaml`; du kannst ihn
   dort ersetzen, wenn du willst.
3. **Der DeepSeek-Anbieter** hat den falschen Schlüssel. Entweder dort einen
   echten DeepSeek-Schlüssel eintragen — oder den Anbieter nicht benutzen, denn
   `openrouter` ist eingerichtet und antwortet.

## 7. Was ich noch nicht prüfen konnte

**Die tatsächliche Darstellung im Browser.** Ich habe gerechnet und im Bündel
nachgesehen, aber nicht gesehen, wie es aussieht — es ist kein
Browser-Automatisierungswerkzeug installiert. Der Schriftzug sollte jetzt
passen (22,9 von 24 px); wenn die Serife anders ausfällt als gerechnet, sag
Bescheid, dann gehe ich auf 0.72rem.

**Der Chat in der Oberfläche.** Die Modellprobe ging über die Schnittstelle
direkt; die Runde im Browser habe ich nicht gefahren.
