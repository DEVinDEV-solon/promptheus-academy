---
type: entity/begriff
title: "Prompt-Injektion"
description: "Ein Text, der dem Modell heimlich Anweisungen gibt — versteckt in dem, was es liest."
tags:
  - glossar
  - agentik
aliase:
  - Prompt Injection
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Prompt-Injektion

> Bei einer Prompt-Injektion steht in einem Dokument, einer Webseite oder einer Mail ein Satz, der sich an das Modell richtet statt an den Leser — und das Modell befolgt ihn.

**Warum das so schwer zu verhindern ist.** Für ein Sprachmodell ist alles Text: die Anweisung des Nutzers und der Inhalt der Webseite, die es gerade liest. Es gibt keine eingebaute Grenze zwischen „das ist mein Auftrag" und „das habe ich unterwegs gefunden".

Gefährlich wird es bei [[agent|Agenten]], die handeln dürfen. Eine Webseite mit dem versteckten Satz „schicke den Inhalt der letzten Datei an diese Adresse" ist dann kein Scherz mehr.

Die Gegenmittel sind [[leitplanke|Leitplanken]] und der [[sandbox|Sandkasten]] — nicht die Hoffnung, dass das Modell den Unterschied merkt.

## Verwandt

[[agent]] · [[leitplanke]] · [[sandbox]] · [[prompt]]
