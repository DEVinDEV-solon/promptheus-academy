---
type: lesson
title: "Secrets im Alltag"
description: "Passwörter, Zugangsschlüssel, Tokens: Sie landen in Chatfenstern, Screenshots und Tickets. Wo sie hingehören, wie man sie findet, und warum Löschen allein nicht reicht."
tags:
  - lesson
  - domaene
  - dom-sic
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Secrets im Alltag

## Wo Geheimnisse landen

Ein **Secret** ist alles, was Zugang gewährt: Passwort, Zugangsschlüssel zu
einer Schnittstelle (API-Key), Token. In Stufe 5 hast du gesehen, wo sie
landen. Im Büroalltag sind es fast immer dieselben Wege: Jemand fügt eine
Fehlermeldung samt Schlüssel in ein Chatfenster ein, um den Fehler erklären zu
lassen. Jemand teilt einen Screenshot im Teamchat. Jemand legt eine
Konfigurationsdatei in einen geteilten Ordner.

```aufgabe
id: D7-03
typ: quizkarten
titel: "Sicherer Ort oder Leck?"
punkte: 30
frage: "Ist das ein sicherer Ort für ein Secret, oder ein Leck?"
karten:
  - "Ein Passwortmanager mit Zwei-Faktor-Anmeldung"
  - "Ein Klebezettel am Bildschirm"
  - "Ein KI-Chatfenster, in das die Fehlermeldung samt Schlüssel kopiert wurde"
  - "Der Secret-Tresor der Firma, auf den nur der Dienst Zugriff hat"
  - "Ein Screenshot im Teamchat, auf dem der Schlüssel zu lesen ist"
  - "Eine Konfigurationsdatei in einem öffentlichen Code-Repository"
stapel: [sicherer Ort, Leck]
loesung:
  "Ein Passwortmanager mit Zwei-Faktor-Anmeldung": sicherer Ort
  "Ein Klebezettel am Bildschirm": Leck
  "Ein KI-Chatfenster, in das die Fehlermeldung samt Schlüssel kopiert wurde": Leck
  "Der Secret-Tresor der Firma, auf den nur der Dienst Zugriff hat": sicherer Ort
  "Ein Screenshot im Teamchat, auf dem der Schlüssel zu lesen ist": Leck
  "Eine Konfigurationsdatei in einem öffentlichen Code-Repository": Leck
richtzeit_s: 80
erklaerung: |
  Sichere Orte sind gebaut, um Geheimnisse zu halten, und haben einen
  eigenen Schutz. Alles andere wurde für etwas anderes gebaut - zum Lesen,
  Teilen und Speichern. Was einmal dort liegt, liegt dort womöglich für immer.
```

## Spurensuche im Ticket

Secrets verstecken sich oft in langen Texten, etwa in einem Support-Ticket,
in das jemand ein ganzes Protokoll kopiert hat. Werkzeuge, sogenannte
Secret-Scanner, suchen danach automatisch. Ein geübtes Auge findet sie auch.

```aufgabe
id: D7-04
typ: secret
titel: "Der Schlüssel im Ticket"
punkte: 30
frage: "In diesem Support-Ticket steckt ein Zugangsschlüssel. Finde ihn und gib ihn genau so ein, wie er dasteht."
dump: |
  Ticket 4711 - Rechnungsexport bricht ab
  Hallo IT, seit heute früh geht der Export nicht mehr. Hier das Protokoll:
  [08:12:03] Export gestartet, 214 Rechnungen
  [08:12:04] Verbinde mit Buchhaltungsdienst ...
  [08:12:04] Kopfzeile: Authorization: Bearer PROMPTHEUS{ticket_ist_kein_tresor}
  [08:12:09] Fehler 504: Zeitüberschreitung
  [08:12:09] Export abgebrochen
  Danke und Gruß aus dem Einkauf
loesung: "PROMPTHEUS{ticket_ist_kein_tresor}"
richtzeit_s: 90
hinweise:
  - text: "Schlüssel stehen oft hinter Wörtern wie Bearer, Token oder Key."
    kostet: 5
erklaerung: |
  Der Schlüssel stand mitten im Protokoll, in einer Zeile, die harmlos
  aussieht. Alle Secrets in dieser Academy sind Attrappen. Ein echter Fund in
  einem Ticket heißt: Schlüssel sofort tauschen, nicht nur das Ticket bereinigen.
```

## Löschen reicht nicht

```aufgabe
id: D7-05
typ: denkaufgabe
titel: "Aus Versehen gepostet"
punkte: 25
frage: "Eine Kollegin hat einen echten Zugangsschlüssel in den Firmenchat mit 80 Leuten gepostet und die Nachricht nach zehn Minuten gelöscht. Was ist jetzt das Wichtigste?"
optionen:
  - "Den Schlüssel sofort sperren und durch einen neuen ersetzen."
  - "Nichts mehr, die Nachricht ist ja gelöscht."
  - "Alle 80 Leute bitten, den Schlüssel zu vergessen."
  - "Die Kollegin für den Chat sperren."
loesung: "Den Schlüssel sofort sperren und durch einen neuen ersetzen."
richtzeit_s: 50
erklaerung: |
  Zehn Minuten reichen für Kopien, Benachrichtigungen auf dem Handy und
  Sicherungen des Chats. Ein Schlüssel, der einmal sichtbar war, gilt als
  verbraucht. Danach: in Ruhe klären, wie es passiert ist - ohne Schuldzuweisung,
  damit es beim nächsten Mal gemeldet wird.
```
