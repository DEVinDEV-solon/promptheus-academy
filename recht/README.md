---
type: reference
title: "recht/ — Impressum, Datenschutz, AGB (Entwürfe)"
description: "Die drei Rechtstexte für die kostenpflichtige Online-Seite von PROMPTHEUS: was sie abdecken, welche Platzhalter noch zu füllen sind und was ausdrücklich noch nicht geprüft ist."
tags: [recht, impressum, datenschutz, agb, prometheus]
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stand: entwurf
status: zur-pruefung
---

# recht/

> Drei Entwürfe, kein Rechtsrat. Sie sind so weit gebaut, dass ein Anwalt
> darüber lesen kann statt bei null anzufangen — mehr sollen sie nicht sein.

## Die eine Sache, die vorweg gehört

**Diese Texte sind nicht geprüft und dürfen so nicht live gehen.** Ich bin kein
Anwalt, und drei Punkte darin sind echte Haftungsfragen, keine Formsachen:

1. **Talente.** Eine Recheneinheit, die zwischen Nutzern wandert und gegen eine
   Leistung eingetauscht werden kann, kommt in die Nähe von Zahlungsdiensteauf-
   sicht und E-Geld (ZAG, ZAG § 2 Bereichsausnahmen). Die AGB sind bewusst so
   geschrieben, dass Talente **kein** Zahlungsmittel sind: kein Auszahlungs-
   anspruch, kein Rückkauf, kein Handel gegen Geld, keine Übertragung außerhalb
   der Academy. Ob das trägt, muss jemand beurteilen, der das darf.
2. **Minderjährige.** Die Nutzer sind zum Teil unter 16. Das betrifft die
   Einwilligung (Art. 8 DSGVO), die Geschäftsfähigkeit (§§ 104 ff. BGB — Vertrag
   schließt der Erwachsene, nicht das Kind) und den Jugendmedienschutz.
3. **Umsatzsteuer und OSS.** Sobald echt kassiert wird. Gehört dem
   Steuerberater.

## Was drinsteht

| Datei | Deckt ab | Rechtsgrundlage |
|---|---|---|
| [IMPRESSUM.md](IMPRESSUM.md) | Anbieterkennzeichnung der Online-Seite | § 5 DDG, § 18 MStV |
| [DATENSCHUTZ.md](DATENSCHUTZ.md) | Was verarbeitet wird — lokal, auf dem VPS, bei Stripe/PayPal | Art. 12–14 DSGVO |
| [AGB.md](AGB.md) | Abos, Token, Talente, Schulverträge | BGB, FernAbsG, DDG |
| [WIDERRUF.md](WIDERRUF.md) | 14 Tage, Erlöschen bei sofort freigeschalteten Token, Muster-Formular | § 355, § 356 Abs. 5 BGB |
| [AVV.md](AVV.md) | Vorlage für Schulen, wenn sie Online-Teile einschalten | Art. 28 DSGVO |

Im Programm sichtbar sind die ersten vier: der Fussteil der Startseite verlinkt
Impressum, Datenschutz und AGB, die AGB verlinken die Widerrufsbelehrung.
Ausgeliefert werden sie über `recht.php`, das die Markdown-Datei rendert — es
gibt sie also nur **einmal**, und nicht einmal als Text und einmal als Seite.

Der AVV steht bewusst **nicht** im Fussteil: er ist kein Aushang, sondern eine
Vorlage, die man einer Schule schickt.

## Die Platzhalter

Alles in `‹spitzen Klammern›` fehlt noch und lässt sich nicht erraten:
Anbietername, Rechtsform, Anschrift, Registergericht, USt-IdNr.,
Vertretungsberechtigte, Kontakt, Domain, gegebenenfalls Datenschutzbeauftragter
und Aufsichtsbehörde.

Suchen mit:

```bash
grep -o "‹[^›]*›" recht/*.md | sort -u
```

## Was diese Texte NICHT abdecken

- **Die lokale Academy auf 127.0.0.1.** Sie ist kein Telemedium für die
  Öffentlichkeit und braucht kein Impressum. Sie taucht in der
  Datenschutzerklärung nur auf, um zu erklären, was dort **nicht** passiert.
- **Die Gemeinde-Plattform.** Solange Produktionen und Aufträge nach
  [[COMMUNITY-VPS-PLAN]] noch nicht laufen, sind die Abschnitte dazu als
  „geplant" markiert. Ein Rechtstext, der Dinge regelt, die es nicht gibt, ist
  ebenso falsch wie einer, der fehlende Dinge verschweigt.
- **Cookie-Banner / TTDSG.** Erst nötig, wenn die Online-Seite etwas setzt, was
  nicht technisch erforderlich ist. Der Plan sieht das nicht vor.
