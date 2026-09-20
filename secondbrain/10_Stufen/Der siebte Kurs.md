---
type: foundation
title: "Der siebte Kurs"
description: "Der Abschlusskurs Brand-Guideline: was er ist, wann er frei wird, was am Ende in der Hand liegt. Geschenkt nach allen sechs Stufen."
tags:
  - foundation
  - uni
  - studium
  - marke
  - brand-guideline
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
ampel: "🟡"
konfidenz: mittel
---

# Der siebte Kurs

> **Stand:** beschlossen und beschrieben, **noch nicht geschrieben**. Der
> Lehrstoff fehlt; was hier steht, ist die Ordnung, nach der er entsteht.
> Deshalb 🟡 und nicht 🟢.

## Was er ist

Ein Kurs über die **Brand-Guideline**: ein kurzes Dokument, das festhält, wie
jemand klingt, wie er aussieht und was er nie tut — in einer Form, die ein
Mensch lesen und ein Sprachmodell befolgen kann.

Er heißt in der Oberfläche **Dein Ziel** (auf der Kurskarte) und **Der 7. Kurs**
(im Seitenmenü). Beides führt auf dieselbe Erklärseite.

## Warum er der siebte ist

Die [[10_Stufen/_index|sechs Stufen]] erklären, wie ein Sprachmodell arbeitet.
Der siebte Kurs erklärt, wie man es sich zu eigen macht. Das ist keine siebte
Stufe: Er hat **keine Prüfung, keine Urkunde und keinen Rang**, denn was dabei
entsteht, lässt sich nicht bewerten. Eine Handschrift ist nicht richtig oder
falsch.

Er ist auch kein [[20_Domaenen/_index|Fachkurs]]. Die zehn Fachkurse laufen
**neben** den Stufen und setzen Stufe 1 bis 3 voraus. Dieser hier läuft
**hinter** allen sechs und setzt sie vollständig voraus — aus einem sachlichen
Grund: Wer nicht weiß, wie ein Modell Wörter zerlegt und warum ein
Systemprompt anders wirkt als eine Frage, schreibt ein Dokument, das gut
klingt und nichts ändert.

## Wann er frei wird

Nach der bestandenen Prüfung der sechsten Stufe. Er kostet nichts extra und
läuft nicht ab.

Die Zielkarte auf „Lernen" und „Dein Stand" zeigt den Abstand dorthin von
Anfang an — **das ist Absicht.** Ein Ziel, das man von der ersten Stunde an
sieht, trägt weiter als eine Überraschung am Schluss. Und weil daneben steht,
wie weit es noch ist, bleibt es eine Aussage über den eigenen Weg statt eine
Reklame.

## Was er lehrt

Acht Felder, in dieser Reihenfolge. Sie sind dieselben, nach denen die Academy
ihre eigene Marke beschrieben hat — das Musterstück liegt in der Bibliothek
unter [[90_Bibliothek/Brand-Guideline|Brand-Guideline PROMPTHEUS]].

| Feld | Die Frage |
|---|---|
| Ausweis | Was, für wen, welcher Satz, welches Bild, welche Haltung? |
| Persönlichkeit | Vier Eigenschaften — und wogegen grenzt jede sich ab? |
| Register | Mit welchen Gruppen wird gesprochen, und was ändert sich? |
| Sprache | Gut/Schlecht-Paare. Die eigene Verbotsliste. |
| Gestalt | Drei Farben. Was **bedeutet** jede? |
| Ausgabeformen | Die häufigsten Anlässe. Welche Form hat jeder? |
| Einsatz | Der Systemprompt-Baustein, aus dem Obigen gezogen |
| Dialektik | Wo läuft die Trennlinie zwischen fest und frei? |

## Die drei Einsatzstufen

Der praktische Teil zeigt dasselbe Dokument an drei Orten:

1. **Der einzelne ChatBot** — die Guideline steht einmal im Systemprompt und
   gilt für jede Antwort, ohne dass jemand sie wiederholt.
2. **Der Agent mit Werkzeugen** — dazu kommt, wie er berichtet und wo er vor
   dem Unumkehrbaren stehenbleibt.
3. **Das Mehr-Agenten-System** — eine Datei, mehrere Verweise. Der Prüfer
   widerspricht dem Tutor nicht im Ton, weil beide dieselbe Grundlage haben.

Siehe [[30_Agenten/_index|Agenten]] für die Rollen, die die Academy selbst so
betreibt.

## Was am Ende in der Hand liegt

Ein Ordner, herunterladbar als **.zip**:

- `BRAND.md` — das eigene Dokument, zwei Seiten
- `systemprompt.txt` — der Baustein zum Einsetzen
- `index.html` + `stil.css` — die eigene Seite, gebaut nach dem Dokument
- `PRUEFLISTE.md` — zehn Fragen vor dem Abgeben
- `LIZENZ.md` — PolyForm Shield 1.0.0 für die Vorlage

**Die Lizenz gilt für Vorlage und Bausteine, nicht für die eigenen Inhalte.**
Was jemand hineingeschrieben hat, gehört ihm; die Academy erteilt dafür keine
Erlaubnis, weil sie keine zu erteilen hat. Eine Lizenz auf eine fremde
Handschrift wäre eine Anmaßung.

Die Vorlage darf geschäftlich benutzt werden — die eigene Seite darf für das
eigene Gewerbe werben. Ausgenommen ist allein, daraus ein Produkt zu bauen, das
der Academy Konkurrenz macht (siehe [../../LIZENZ.md](../../LIZENZ.md)).

## Für wen, mit welchem Nutzen

| Gruppe | Wofür |
|---|---|
| **Schule** | Außenwirkung und Sekretariat sprechen dieselbe Sprache: Aushänge, Elternbriefe, Absagen, die Antwort des Schul-Bots, wenn er etwas nicht weiß |
| **Lehrende** | Arbeitsblatt, Folie, Elterninfo aus einem Guss — und der Bildungsauftrag aufgeschrieben statt vorausgesetzt („Ich sage nie, etwas sei einfach") |
| **Eltern** | Dieselbe Methode für Handwerk, Praxis, Gastronomie, Büro. Für Selbständige der brauchbare Anfang eines Corporate Designs, das sonst vierstellig kostet |
| **Lernende** | Praktisch: Bewerbung, Referat, Vereinsplakat. Privat: der eigene Kanal, der eigene Bot. Nebenbei die Übung, sich selbst zu beschreiben |

## Was noch fehlt

- Der Lehrstoff: Lektionen, Aufgaben, Beispiele
- Der Ort im Vault, wenn er als Kurs laufen soll — das Programm liest nur
  `10_Stufen/` und `20_Domaenen/`, also braucht er einen davon oder eine
  Erweiterung in `srv/kurse.php`
- Die Freigabe-Regel „erst nach Stufe 6" (Fachkurse öffnen heute ab Stufe 3)
- Der Zip-Bau auf dem Server samt beigelegten Lizenztexten

## Verwandt

- [[000_Academy/Studienordnung|Studienordnung]] — Stufen, Fachkurse, Freischaltung
- [[000_Academy/Leitbild|Leitbild]] — warum die Academy nichts erfindet
- [[10_Stufen/_index|Die sechs Stufen]] — was vorher kommt
- [[20_Domaenen/_index|Fachkurse]] — die Kurse daneben
- [[90_Bibliothek/Brand-Guideline|Brand-Guideline PROMPTHEUS]] — das Musterstück
