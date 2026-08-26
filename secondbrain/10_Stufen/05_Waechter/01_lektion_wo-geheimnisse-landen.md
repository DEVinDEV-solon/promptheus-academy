---
type: lesson
title: "Wo Geheimnisse landen"
description: "Beispiellektion der Stufe 5 — zeigt die Form, nicht den vollen Stoff."
tags:
  - lesson
  - stufe-5
  - geruest
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 5
dauer_min: 12
---

# Wo Geheimnisse landen

> **Beispiellektion.** Stufe 5 wird noch ausgearbeitet. Diese Lektion ist vollständig und benutzbar — sie zeigt, wie der Kurs aussehen wird.

Ein Schlüssel ist selten dort verloren gegangen, wo jemand ihn hingeschrieben hat. Er ist **mitgewandert**: in ein Protokoll, eine Fehlermeldung, einen Screenshot, eine Zwischenablage, einen Commit.

Die Stellen, an denen das passiert, sind erstaunlich gleichförmig:

| Ort | Warum |
|---|---|
| Protokolldatei | jemand hat den ganzen Aufruf mitgeschrieben |
| Fehlermeldung | die Bibliothek gibt die Anfrage im Klartext aus |
| Versionsgeschichte | einmal committet, bleibt für immer |
| Adresszeile | Parameter landen in jedem Server-Log unterwegs |

**Alle Geheimnisse in dieser Academy sind Attrappen** im Format `PROMPTHEUS{…}`. Was du hier suchst, ist das Muster — nicht ein Schlüssel.

```aufgabe
id: E5-01
typ: secret
titel: "Im Protokoll"
punkte: 30
frage: "In diesem Protokollauszug steckt ein Geheimnis. Finde es."
dump: |
  2026-08-18 09:12:03 INFO  Dienst gestartet, Port 8801
  2026-08-18 09:12:04 INFO  Datenbank verbunden
  2026-08-18 09:14:21 DEBUG Anfrage an api.example.com
  2026-08-18 09:14:21 DEBUG   header: authorization=Bearer PROMPTHEUS{log_ist_kein_tresor}
  2026-08-18 09:14:22 INFO  Antwort 200, 1418 Bytes
  2026-08-18 09:15:00 WARN  Zeitüberschreitung, wiederhole
loesung: "PROMPTHEUS{log_ist_kein_tresor}"
richtzeit_s: 60
hinweise:
  - text: "Sieh dir die DEBUG-Zeilen an. Was schreibt jemand mit, der 'alles' mitschreiben wollte?"
    kostet: 6
erklaerung: |
  Der Schlüssel steht in einer DEBUG-Zeile, weil jemand den kompletten
  Kopf der Anfrage protokolliert hat. Genau deshalb gehört in ein Protokoll
  nie ein ganzer Anfragekopf - sondern das, was man wirklich braucht.
```
