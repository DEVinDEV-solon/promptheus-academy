---
type: lesson
title: "Symmetrisch und asymmetrisch"
description: "Ein Schlüssel für beide Seiten oder ein Schlüsselpaar: wie Verschlüsselung und Signatur funktionieren — und warum Base64 keine Verschlüsselung ist."
tags:
  - lesson
  - stufe-5
  - krypto
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 5
dauer_min: 18
---

# Symmetrisch und asymmetrisch

## Drei Dinge, die oft verwechselt werden

In Lektion 2 hast du den Hash kennengelernt: einen Fingerabdruck, der sich
nicht zurückrechnen lässt. Daneben gibt es zwei weitere Verfahren, die im
Alltag ständig durcheinandergeworfen werden:

| Verfahren | Zurück zum Original? | Braucht einen Schlüssel? | Wofür |
|---|---|---|---|
| **Kodierung** (Base64, Hex) | Ja, für jeden | Nein | Daten transportfähig machen |
| **Hash** (SHA-256) | Nein, für niemanden | Nein | Prüfen, ob etwas unverändert ist |
| **Verschlüsselung** | Ja, aber nur mit Schlüssel | Ja | Inhalt geheim halten |

Die erste Zeile ist die wichtigste Falle: **Base64 sieht aus wie
Verschlüsselung, ist aber keine.** Jeder kann es in einer Sekunde
zurückverwandeln. Wer ein Passwort „verschlüsselt", indem er es in Base64
schreibt, hat es nur umgeschrieben.

```aufgabe
id: E5-11
typ: technisch
titel: "Ist das geheim?"
punkte: 25
frage: "In einer Konfigurationsdatei steht als angeblich verschlüsselter Wert: UFJPTVBUSEVVU3tiYXNlNjRfaXN0X2tlaW5fdHJlc29yfQ== — wandle ihn aus Base64 zurück und gib den Klartext ein."
pruefer: base64_dekodiert
eingabe: "UFJPTVBUSEVVU3tiYXNlNjRfaXN0X2tlaW5fdHJlc29yfQ=="
richtzeit_s: 180
hinweise:
  - text: "Jedes Base64-Werkzeug im Netz oder ein Modell kann das zurückverwandeln — genau das ist der Punkt."
    kostet: 5
erklaerung: |
  Heraus kommt eine Attrappe im Format PROMPTHEUS{…}. Ohne Schlüssel, ohne
  Mühe, in einer Sekunde. Base64 macht Daten transportfähig, nicht geheim.
```

## Symmetrisch: ein Schlüssel für beide

Bei der **symmetrischen** Verschlüsselung benutzen beide Seiten denselben
Schlüssel: zum Verschließen und zum Öffnen. Das ist schnell und sicher — mit
einem Haken, der so alt ist wie die Kryptografie selbst:

> **Wie kommt der Schlüssel sicher zum Empfänger?** Wer ihn unterwegs
> abfängt, kann alles lesen.

Das klassische Beispiel für ein (schlechtes) symmetrisches Verfahren ist die
Caesar-Verschiebung: Jeder Buchstabe rückt um eine feste Zahl weiter. ROT13
verschiebt um 13 — und weil das Alphabet 26 Buchstaben hat, ist zweimal ROT13
wieder der Klartext.

```aufgabe
id: E5-12
typ: technisch
titel: "Caesar, Stufe 13"
punkte: 20
frage: "Entschlüssle mit ROT13: Fpuyhrffry tvo avpug ure"
pruefer: rot13
eingabe: "Fpuyhrffry tvo avpug ure"
richtzeit_s: 120
hinweise:
  - text: "A wird N, B wird O, … und umgekehrt. Groß- und Kleinschreibung bleiben."
    kostet: 5
erklaerung: |
  „Schluessel gib nicht her" - die Botschaft passt zum Haken des Verfahrens.
  Moderne symmetrische Verfahren (etwa AES) sind unvergleichlich stärker als
  Caesar, aber das Schlüsselproblem bleibt dasselbe.
```

## Asymmetrisch: ein Schlüsselpaar

Die **asymmetrische** Verschlüsselung löst das Schlüsselproblem mit einem
Paar, das mathematisch zusammengehört:

- Den **öffentlichen Schlüssel** darf jeder haben. Mit ihm kann man etwas
  verschließen.
- Den **privaten Schlüssel** hat nur der Besitzer. Nur mit ihm lässt es sich
  wieder öffnen.

Das Bild ist ein **Briefkasten**: Jeder kann einen Brief einwerfen, aber nur
wer den Schlüssel hat, kann ihn herausholen. Niemand muss einen geheimen
Schlüssel verschicken.

Dasselbe Paar funktioniert auch umgekehrt, und das ist die **Signatur**: Der
Besitzer verschließt etwas mit seinem *privaten* Schlüssel, und jeder kann mit
dem *öffentlichen* prüfen, dass es wirklich von ihm kommt und unverändert ist.
Die Academy nutzt genau das: Jedes Update ist signiert, und deine Installation
prüft die Signatur mit einem öffentlichen Schlüssel, bevor sie etwas einspielt.

```aufgabe
id: E5-13
typ: uebereinstimmung
titel: "Welcher Schlüssel wofür?"
punkte: 30
frage: "Ordne jeder Handlung den Schlüssel zu, der dafür benutzt wird."
links:
  - "Jemand will dir eine geheime Nachricht schicken"
  - "Du öffnest die geheime Nachricht"
  - "Du unterschreibst ein Update digital"
  - "Jemand prüft deine Unterschrift"
rechts:
  - "Dein öffentlicher Schlüssel, zum Verschließen"
  - "Dein privater Schlüssel, zum Öffnen"
  - "Dein privater Schlüssel, zum Signieren"
  - "Dein öffentlicher Schlüssel, zum Prüfen"
loesung:
  "Jemand will dir eine geheime Nachricht schicken": "Dein öffentlicher Schlüssel, zum Verschließen"
  "Du öffnest die geheime Nachricht": "Dein privater Schlüssel, zum Öffnen"
  "Du unterschreibst ein Update digital": "Dein privater Schlüssel, zum Signieren"
  "Jemand prüft deine Unterschrift": "Dein öffentlicher Schlüssel, zum Prüfen"
richtzeit_s: 90
erklaerung: |
  Verschlüsseln mit dem öffentlichen, öffnen mit dem privaten. Signieren mit
  dem privaten, prüfen mit dem öffentlichen. Der private Schlüssel verlässt
  nie seinen Besitzer - das ist die ganze Idee.
```

## In der Praxis: beides zusammen

Asymmetrische Verfahren sind langsam. Deshalb wird im Alltag kombiniert: Das
Schlüsselpaar dient nur dazu, einen **symmetrischen Sitzungsschlüssel** sicher
auszutauschen, und mit dem wird dann der eigentliche Inhalt verschlüsselt. Genau
das passiert jedes Mal, wenn im Browser ein Schloss neben der Adresse steht.

```aufgabe
id: E5-14
typ: denkaufgabe
titel: "Was darf öffentlich sein?"
punkte: 25
frage: "Welche dieser Dinge darf man bedenkenlos veröffentlichen?"
mehrfach: true
optionen:
  - "Den öffentlichen Schlüssel eines Schlüsselpaars"
  - "Den privaten Schlüssel eines Schlüsselpaars"
  - "Den SHA-256-Hash einer veröffentlichten Datei"
  - "Ein Passwort in Base64"
loesung:
  - "Den öffentlichen Schlüssel eines Schlüsselpaars"
  - "Den SHA-256-Hash einer veröffentlichten Datei"
richtzeit_s: 60
erklaerung: |
  Der öffentliche Schlüssel ist zum Verteilen da, und ein Hash einer
  öffentlichen Datei hilft anderen, sie zu prüfen. Der private Schlüssel und
  ein Passwort - auch in Base64 - gehören niemals heraus.
```
