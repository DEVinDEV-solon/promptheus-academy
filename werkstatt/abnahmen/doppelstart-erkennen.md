---
type: abnahme
title: "Abnahme — Doppelstart erkennen (EADDRINUSE)"
description: "Der Start scheiterte mit „Starten nicht möglich“ und EADDRINUSE. Ursache: eine Werkstatt-Instanz lief bereits auf Port 3081. starten.mjs erkennt das jetzt vorher und sagt es klar, statt den Harness in einen Abbruch laufen zu lassen."
tags: [abnahme, promptheus, werkstatt, start, eaddrinuse]
timestamp: 2026-09-29T18:30:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Doppelstart erkennen

> **Behoben.** Der Start meldet jetzt „Die Werkstatt läuft BEREITS" mit Adresse
> und Lösungsweg — statt in den Abbruch des Harness zu laufen.

## 1. Was wirklich los war

Das Diagnoseprotokoll sagte es deutlich:

```
Error: listen EADDRINUSE: address already in use 127.0.0.1:3081
dsh: startup failed: 2 required plugins did not activate
```

**Es war kein Defekt.** Die Werkstatt lief bereits — seit 17:51, gestartet aus
einem früheren Versuch. Der zweite Start traf auf den belegten Port.

Der Harness verhält sich dabei **korrekt**: er bricht sauber ab und schreibt ein
vollständiges Diagnoseprotokoll nach `.dsh\logs\startup-…log`. Nur sagt die
Meldung am Bildschirm nicht, **warum**:

```
starten: beendet (1)
```

Und im Protokoll stehen dann zehn Plugins „waiting for services" — alle warten
auf `webServer`, der nicht hochkam. Das sieht nach einem großen Problem aus,
ist aber die Folge einer einzigen Ursache: der belegte Port.

**Nachgeprüft:** Auf 3081 hörte PID 1672 zu (gestartet 17:51:32,
`--import tsx/esm apps\cli\src\bin.ts --profile promptheus --port 3081`).
Der Betrieb auf 3080 war davon unberührt.

## 2. Was jetzt passiert

`starten.mjs` prüft **vor** dem Start, ob auf dem Port schon jemand lauscht, und
meldet es klar:

```
  ================================================================
   Die Werkstatt laeuft BEREITS.
  ================================================================

  Auf http://127.0.0.1:3081 hoert schon jemand zu. Ein zweiter
  Start scheitert mit "EADDRINUSE" - das ist kein Defekt, sondern
  eine Doppelung.

  So findest du die laufende Instanz:
    * Oeffne das Fenster, das sie geoeffnet hat.
    * Oder starte auf einem anderen Port:
        node werkzeuge\starten.mjs --port 3082

  So beendest du sie, um neu zu starten:
    Get-NetTCPConnection -LocalPort 3081 -State Listen |
      ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Die Prüfung ist eine schlichte Verbindung** (`node:net`): kommt sie zustande,
hört dort jemand zu. Das ist verlässlicher als ein Blick in die Prozessliste,
denn es fragt genau das, was der Harness gleich fragen wird. Mit einer
Zeitgrenze von 1,5 Sekunden, damit der Start bei einem halb offenen Port nicht
hängenbleibt.

**Die alte Instanz wird NICHT beendet.** Eine laufende Werkstatt kann eine
bewusst offene Sitzung sein — sie wegzuräumen wäre ein Eingriff, den niemand
verlangt hat. Die Meldung nennt den Befehl, und die Entscheidung bleibt beim
Menschen.

## 3. Nachgewiesen, beide Fälle

| Fall | Ergebnis |
|---|---|
| **Port belegt** (3081, Werkstatt läuft) | Meldung „läuft BEREITS", Ausgang 2, **kein** Harness-Start |
| **Port frei** (3099, Testlauf) | startet durch, 401 auf 3099 = läuft |

Der Testlauf auf 3099 wurde danach beendet; der Port ist wieder frei.

## 4. Stand

| Prüfung | Ergebnis |
|---|---|
| Werkstatt 3081 | läuft (401 = Zugangssperre, normal) |
| Betrieb 3080 | **200** — unberührt |
| Port 3099 (Testlauf) | wieder frei |
| `woerter_pruefen.mjs` | BESTANDEN |
| `buendel_pruefen.mjs` | BESTANDEN |

## 5. Für den Alltag

Wenn der Start meldet, dass die Werkstatt schon läuft, gibt es drei Wege:

1. **Das offene Fenster benutzen.** Die laufende Instanz hat ihres schon
   geöffnet — mit der vollständigen Adresse samt Zugangstoken.
2. **Auf einem anderen Port starten:** `node werkzeuge\starten.mjs --port 3082`.
   Zwei Werkstätten nebeneinander sind möglich.
3. **Die alte beenden** und neu starten — der Befehl steht in der Meldung.

**Das Zugangstoken** steht nur in der Startausgabe der jeweiligen Instanz. Wer
es verloren hat, beendet die Instanz und startet neu; dann wird ein neues
ausgegeben.

## 6. Offen

- [ ] **Das Zugangstoken auffindbar machen.** Es steht nur in der Startausgabe.
      Wer das Fenster schließt, muss neu starten. Eine kleine Datei mit der
      aktuellen Adresse (etwa `.dsh\letzte-adresse.txt`) würde das lösen —
      noch nicht gebaut, weil es eine eigene Entscheidung ist.
- [ ] **Die übrigen Wörterbücher** der 0.2.0-Pakete sind noch englisch.
- [ ] **Der Vorbehalt aus Runde 1** (BRAND.md, `--schrift-3`).
