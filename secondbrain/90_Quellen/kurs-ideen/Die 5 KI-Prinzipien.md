---
type: kursidee
title: "Die 5 KI-Prinzipien (Vault)"
description: "Übersetzung & Zusammenfassung: 'What I learned about AI at Goldman Sachs (in 10 minutes)' — die 5 KI-Prinzipien V.A.U.L.T. als Kursidee."
tags:
  - kursidee
  - stufe-1
  - ki-grundlagen
  - goldman-sachs
  - promptheus
status: zur-pruefung
quellentyp: youtube
quelle: "https://www.youtube.com/watch?v=ZzHsJW10iq4"
merkliste: "Verifizieren · Aufwerten · Verstehen warum · Menschen einbinden · Transparenz"
timestamp: 2026-08-24T00:00:00+02:00
kanonisch: "[[PROMPTHEUS WISSEN]]"
---

# Die 5 KI-Prinzipien (Vault)

> **Kursidee — abgeleitet aus:** *What I learned about AI at Goldman Sachs (in 10 minutes)*
> (YouTube, Transcript-Auswertung). Übersetzt und verdichtet ins Deutsche.

Die Grundlage: Ein Unternehmen wie Goldman Sachs kann sich keine Fehler leisten — eine falsche
Zahl oder Halluzination kostet Millionen oder den Ruf. Deshalb befolgt es fünf Prinzipien.
Sie gelten unabhängig vom Werkzeug (ob Claude, Charts oder das nächste Tool von morgen).

Die fünf Prinzipien ergeben das Akronym **VAULT**:

## V — Verify (Verifizieren)

KI liefert etwas, das *fertig aussieht* — formatiert, selbstbewusst, in 30 Sekunden. Aber „sieht
fertig aus" und „ist korrekt" sind zweierlei. Die Unterscheidung von Goldmans CIO (Agentis):
*Begründung* eines Modells kann wertvoll sein, selbst wenn die *Endantwort* falsch ist.

- **Daten vor dem Einsatz prüfen:** Jedes System ist nur so gut wie die Daten dahinter.
  Veraltete, doppelte oder schmutzige Daten in KI zu stecken heilt nichts — es liefert nur
  „die falsche Antwort schneller".
- **Verifikation in den Prozess einbauen:** Prompt-Beispiel — „Prüfe jede Zahl und jede
  Tatsachenangabe, nenne die Quelle, markiere alles, woran du nicht zu 100 % sicher bist."
- Bei Berichten reichen meist 2–3 Entscheidungs-Zahlen zum Spot-Check.
- Hochprior: eigener KI-Reviewer / Agenten-Review als Zusatzkontrolle.
- **Wichtig bleiben Originalquellen, deterministische Tests oder menschliche Review.**

## A — Augment, nicht ersetzen (Aufwerten statt Ersetzen)

Menschen sind inkonsistent: müde, übersehen Schritte, Kommunikation bricht. Eine getestete,
deterministische Automation läuft jedes Mal identisch. (Aber falsche Logik = selber Fehler perfekt
wiederholt.)

**Faustregel:** Folgt eine Aufgabe klaren Regeln → normale Automation, kein KI-Agent. KI nutzen,
wenn *Urteilsvermögen, Interpretation, Flexibilität* oder *unordentliche Informationen* nötig sind.

Bester Fall ist die Kombination: Automation zieht/zufrieden Daten, KI erklärt die Änderung in
Klartext. — *„Nimm etwas, das schon funktioniert, zerlege es, und verbessere nur die Schritte, wo
KI wirklich hilft."*

## U — Understand the Why (Weißt du, warum)

Goldmans Ingenieursprinzip: *build with purpose*. Erzählen Sie *das Warum*, nicht nur das Wie.

> **Start mit dem Problem, dann wähle das Werkzeug.**

- Vor jedem KI-Tool: **ein Satz** — *„Das Problem, das ich löse, ist ___ — und ein gutes
  Ergebnis sähe aus wie ___."* Wenn du den Satz nicht schreiben kannst, bist du nicht bereit
  zu prompten.
- Anfangen mit der Tech bringt tolle Workflows, die niemand braucht. Angefangen mit dem
  Schmerzpunkt + ein nützliches System → kann Gehalt ersetzen; angefangen mit dem Tool → kein
  Auftrag.

## L — Loop Humans In (Menschen einbden)

KI wie ein **Megafon**: vergrößert alles, auch Fehler. Ein unklarer Hinweis statt einem Knopf
im Chat kann als autonomer Agent die falsche Mail, den falschen Datensatz, sogar den Post an
die ganze Kundengruppe liefern (Praxisbeispiel: Agent interpretierte eine Aufgabe falsch →
Rabattcode an ~200.000 Mailadressen).

**Argentis Schluss:** Solange diese Tools nicht durchgehend zuverlässig sind, **müssen Menschen
im System bleiben.**

- **Aufsichtsmäßhuber ↔ Folge der Aktion:** Notizen sortieren → einfach laufen lassen.
  Client vorbereiten, Geld ausgeben, große Gruppen schreiben → Freigabeschritt.
- **Einfachste Methode:** Automationen auf „Entwurf" statt „Senden" — KI schreibt in Gmail-
  Entwürfe, Vorschläge in ein Dokument, zeigt den Plan, bevor sie Dateien ändert/eines bereitstellt.
- Leitsatz: *„Wenn ein Agent es potenziell tun könnte, nimm an, dass er es tut."* — 999× richtig,
  1× schlimm.

## T — Transparency (Transparenz)

Bei Goldman: Bauen, das Daten, Berichte oder Risiko berührt, muss die Herkunft der Infos,
die Verarbeitung und das Ergebnis erklären können (Regulieren, Kunden, Manager, Prüfer).

- **Systeme dokument so bauen:** Wenn ein Agent arbeitet, aber niemand versteht, wie er es
  getan hat, ist es ein Albtraum, wenn etwas bleibt, Daten sich ändern oder eine andere Person
  das übernimmt.
- Jede Ausführung loggt: Datenquellen, Annahmen, Werkzeuge, offizielle Checks, wichtige
  Entscheidungen.
- Transparenz ≠ Verborgendes Denken freilegen, sondern **überprüfbare Belege**: Quellen,
  Eingaben, Handlungen, Annahmechan, Checks.

---

## Takeaway (das Wichtigste von Goldman)

> **Man muss nicht *alles* zu einem KI-Agenten machen.** Problem verstehen, Daten schützen, das
> einfachste System nehmen, das funktioniert — und die Kontrolle über die Handlungen behalten,
> die wirklich zählen. So baut man KI-Systeme, **denen Man vertrauen kann.**

## Kurs-Karte (Vorschlag für die Academy)

| Modul | Inhalt | Übung |
|---|---|---|
| V | Werte prüfen | Zahlen-Fehlsuche in einem Beispiel-Dashboard |
| A | Verstärken statt ersäuzen | Eine Automation in Events zerlegen, KI-Stelle lokalisieren |
| U | Problem zuerst | „Ein Satz" — echtes Problem formulieren |
| L | Menschen | Beispiele für Freigabeschwellen |
| T | Transparenz | System-Log nachvollziehen + lücken finden |

**Passend für Stufe 1 (Entdecker).** Anschluss an dahinter: deterministische
PROMPTHEUS-Aufgaben begünstigen genau diese Prinziplogik — „inhaltlich korrekt, bewertet
deterministisch".