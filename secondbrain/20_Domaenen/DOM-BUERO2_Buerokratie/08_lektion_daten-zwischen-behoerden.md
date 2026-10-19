---
type: lesson
title: "Daten zwischen Behörden"
description: "Einmal angeben soll reichen, aber Daten dürfen nur für den Zweck genutzt werden, für den sie erhoben wurden. Was ein Modell technisch verknüpfen könnte, darf es rechtlich oft nicht."
tags:
  - lesson
  - domaene
  - dom-buero2
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Daten zwischen Behörden

## Vier Begriffe

Lektion 3 hat gezeigt: Was eine Behörde schon weiß, soll niemand erneut
eintragen müssen. Dahinter stehen Regeln, die die Verwaltung genauer einhalten
muss als jedes Unternehmen.

```aufgabe
id: D10-18
typ: uebereinstimmung
titel: "Die Regeln für den Datenaustausch"
punkte: 25
frage: "Ordne jedem Begriff seine Bedeutung zu."
links: [Zweckbindung, Once-Only, Rechtsgrundlage, Protokollierung]
rechts:
  - "Daten dürfen nur für den Zweck genutzt werden, für den sie erhoben wurden"
  - "Bürgerinnen und Bürger geben Daten nur einmal an, Behörden tauschen sie aus"
  - "Ein Gesetz muss die Übermittlung zwischen Behörden ausdrücklich erlauben"
  - "Jeder Abruf wird festgehalten, damit er später überprüfbar ist"
loesung:
  Zweckbindung: "Daten dürfen nur für den Zweck genutzt werden, für den sie erhoben wurden"
  Once-Only: "Bürgerinnen und Bürger geben Daten nur einmal an, Behörden tauschen sie aus"
  Rechtsgrundlage: "Ein Gesetz muss die Übermittlung zwischen Behörden ausdrücklich erlauben"
  Protokollierung: "Jeder Abruf wird festgehalten, damit er später überprüfbar ist"
richtzeit_s: 75
erklaerung: |
  Once-Only ist bequem, aber nur in den Grenzen der Zweckbindung und mit
  Rechtsgrundlage. Die Protokollierung macht nachprüfbar, wer wann welche
  Daten abgerufen hat - wie der Audit-Trail im Fachkurs Sicherheit.
```

## Was ein Modell nicht verknüpfen darf

Technisch wäre es einfach: Melderegister, Fahrzeugregister und Leistungsakten
zusammenführen und ein Modell „Auffälligkeiten" finden lassen. Rechtlich ist
das in aller Regel unzulässig.

```aufgabe
id: D10-19
typ: denkaufgabe
titel: "Das Profil aus allen Registern"
punkte: 25
frage: "Ein Amt schlägt vor, Daten aus mehreren Registern zusammenzuführen und von einem Modell Personen markieren zu lassen, die „vermutlich zu Unrecht“ Leistungen beziehen. Was ist die richtige Einschätzung?"
optionen:
  - "Ohne ausdrückliche Rechtsgrundlage unzulässig: Es verstößt gegen die Zweckbindung, und eine solche Bewertung von Menschen kann unter die Verbote des AI Act fallen."
  - "Zulässig, weil die Daten ohnehin beim Staat liegen."
  - "Zulässig, solange das Modell nur Verdachtsfälle markiert."
  - "Zulässig, wenn die Ergebnisse geheim bleiben."
loesung: "Ohne ausdrückliche Rechtsgrundlage unzulässig: Es verstößt gegen die Zweckbindung, und eine solche Bewertung von Menschen kann unter die Verbote des AI Act fallen."
richtzeit_s: 70
erklaerung: |
  Daten aus verschiedenen Zwecken zu einem Profil zu verbinden, ist genau
  das, was die Zweckbindung verhindern soll. Eine Bewertung von Menschen aus
  zusammengeführten Daten, die zu Nachteilen führt, kommt dem nahe, was der
  AI Act als Social Scoring verbietet. Und ein „Verdacht" vom Modell ist
  bereits eine Belastung für die Betroffenen.
```
