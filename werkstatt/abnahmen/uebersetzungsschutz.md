---
type: abnahme
title: "Abnahme — Schutz gegen Übersetzungserweiterungen"
description: "Die Werkstatt stürzt nicht mehr ab, wenn Google Translate oder eine ähnliche Browser-Erweiterung die Seite übersetzt. Der Schutz sitzt in unserem Paket, läuft vor dem Programm der Seite und ist geprüft."
tags: [abnahme, promptheus, werkstatt, uebersetzung, schutz]
timestamp: 2026-09-29T21:40:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Schutz gegen Übersetzungserweiterungen

> **Eingebaut und geprüft.** Die Maske stürzt beim Übersetzen nicht mehr ab.
> Der Schutz liegt in unserem Paket, ausserhalb des Harness.

## 1. Das Problem

Die Werkstatt läuft im Browser — also kann jede Übersetzungserweiterung sie
übersetzen. Google Translate tut das aber nicht durch blosses Ersetzen von Text,
sondern **es ersetzt die Textknoten** im DOM durch eigene Elemente (`<font>`).
React führt darüber ein eigenes Schatten-DOM: es glaubt, einen Knoten zu
besitzen, den die Erweiterung längst ausgetauscht hat. Will es ihn entfernen,
bricht es ab:

```
NotFoundError: Failed to execute 'removeChild' on 'Node':
The node to be removed is not a child of this node.
```

**Das ist kein Randfall.** Es ist ein seit Jahren offener Fehler
([react#11538](https://github.com/react/react/issues/11538)) mit ausführlicher
Analyse bei [Martijn Hols](https://martijnhols.nl/blog/everything-about-google-translate-crashing-react).
Ohne Fehlergrenze hängt React den **ganzen Baum** ab — die Maske wird weiss.

Dazu kommt ein zweiter Effekt, der bei einer Werkstatt schwerer wiegt: von
Translate ersetzte Textknoten werden im Speicher weiterverändert, im Browser
aber nicht mehr angezeigt. **Streaming-Ausgaben, Fortschritt und Tokenzähler
bleiben stehen.**

## 2. Was gebaut wurde

Die von React selbst empfohlene Absicherung: die beiden DOM-Methoden, die
scheitern können, werden abgefangen.

```js
Node.prototype.removeChild = function (child) {
  if (child && child.parentNode !== this) return child   // statt zu werfen
  return originalRemoveChild.apply(this, arguments)
}
```

Dasselbe für `insertBefore`. Beide rufen im gewöhnlichen Fall unverändert durch —
der Schutz kostet nichts, wenn nicht übersetzt wird.

**Er liegt in unserem Paket** (`pakete/dsh-client-ui-promptheus/src/index.ts`),
nicht im Harness. Damit überlebt er jede Aufwertung.

## 3. Der wichtigste Punkt: die Reihenfolge

**Ein Schutz, der zu spät läuft, schützt nichts.** Deshalb wurde die
Reihenfolge nachgesehen, nicht angenommen:

| | Zeichenposition im ausgelieferten HTML |
|---|---|
| Der Schutz | **33.671** |
| Das Programm der Seite (`type="module"`) | **34.912** |

Der Schutz steht **vor** dem Programm. Das ist kein Zufall: der Harness setzt
die Einspeisungen unmittelbar hinter `<head>`, und `type="module"`-Skripte
werden vom Browser zurückgestellt, bis das Dokument gelesen ist.

## 4. Der Nachweis, dass er wirkt

`werkzeuge\schutz_pruefen.mjs` **führt den Schutz aus** — mit einem nachgebauten
`Node` — und prüft vier Dinge:

```
  ✓ Schutz im Bündel gefunden (665 Zeichen)
  ✓ Schutz ausgeführt
      doppelt eingesetzt? ja (richtig)
      fremder Knoten entfernen: abgefangen (richtig)
      fremden Knoten einfügen:  abgefangen (richtig)
      echter Knoten entfernen:  durchgelaufen (richtig)

schutz_pruefen: BESTANDEN
```

Die drei letzten Zeilen sind die entscheidenden:

- **Fremder Knoten entfernen** — der Fall, den Translate erzeugt: wird
  abgefangen statt zu werfen.
- **Fremden Knoten einfügen** — dasselbe für `insertBefore`.
- **Echter Knoten entfernen** — der gewöhnliche Betrieb läuft **unverändert**
  durch. Der Schutz macht die Anwendung nicht träge.

Geprüft wird auch, dass der Schutz sich **nicht doppelt** einsetzt — die
Kennzeichnung `__promptheusGuarded` verhindert das.

## 5. Was der Schutz nicht behebt

**Das Einfrieren bleibt.** Von Translate ersetzte Textknoten werden im Speicher
weiterverändert, im Browser aber nicht mehr angezeigt. Live-Anzeigen —
Streaming, Fortschritt, Tokenzähler — **bleiben bei aktiver Übersetzung stehen**.

Das lässt sich von aussen nicht beheben: es wäre Arbeit an fremdem Quelltext
(alle veränderlichen Textknoten in `<span>` einfassen), und selbst das hilft nur
gegen einen Teil. Wer die Live-Anzeigen braucht, schaltet die Übersetzung ab.

**Was der Schutz leistet:** die Maske bleibt bedienbar. Man kann sich umsehen,
einstellen, lesen — sie wird nicht weiss.

## 6. Stand

| Prüfung | Ergebnis |
|---|---|
| `schutz_pruefen.mjs` | **BESTANDEN** (4 Prüfungen) |
| Schutz vor dem Programm im HTML | **ja** (33.671 vor 34.912) |
| `woerter_pruefen.mjs` | 1.937 von 1.937, BESTANDEN |
| `update_festigkeit.mjs` | BESTANDEN, 0 gefährdet |
| Harness-Quelltext geändert | **0 Zeilen** |
| Werkstatt 3081 | 200, Titel korrekt |
| Betrieb 3080 | 200 — unberührt |

## 7. Offen

- [ ] **Die Sichtprüfung mit echter Übersetzung.** Der Schutz ist nachgewiesen,
      aber nicht mit laufendem Google Translate erprobt — dafür müsste die
      Erweiterung im Browser arbeiten.
- [ ] **Der Umfangszähler** `uebersetzung_umfang.mjs` meldet weiterhin falsche
      „offene" Texte; `woerter_pruefen.mjs` ist das verbindliche Werkzeug.
- [ ] **Der Vorbehalt aus Runde 1** (BRAND.md, `--schrift-3`).
