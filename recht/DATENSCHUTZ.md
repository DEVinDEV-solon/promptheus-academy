---
type: reference
title: "Datenschutzerklärung (Entwurf)"
description: "Was PROMPTHEUS verarbeitet: lokal auf dem eigenen Rechner (fast nichts verlässt ihn), auf dem Gemeinde-VPS (pseudonym, ohne Klarnamen) und bei Stripe/PayPal (Zahlung, mit Drittlandbezug). Entwurf mit Platzhaltern, ungeprüft."
tags: [recht, datenschutz, dsgvo, minderjaehrige, prometheus]
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[recht/README]]"
stand: entwurf
status: zur-pruefung
---

> **Entwurf, ungeprüft.** Platzhalter in `‹spitzen Klammern›`. Siehe
> [README.md](README.md).

# Datenschutzerklärung

## Die eine Sache, die vorweg gehört

PROMPTHEUS besteht aus **zwei getrennten Teilen**, und der Unterschied ist der
wichtigste Satz dieser Erklärung:

| | Läuft wo | Wer sieht Daten |
|---|---|---|
| **Die Academy** | auf deinem eigenen Rechner (`127.0.0.1`) | **niemand außer dir** |
| **Die Online-Seite** | auf unserem Server | wir, im unten beschriebenen Umfang |

Lernstände, Aufgaben, Chatverläufe mit den Tutoren, Sprachaufnahmen und
Urkunden liegen in einer Datei auf deinem Rechner. **Wir bekommen davon
nichts.** Nicht, weil wir es versprechen, sondern weil das Programm keine
Verbindung dorthin hat.

Was den Rechner verlässt, sind genau drei Dinge, und jedes einzeln:

1. eine **Frage an ein Sprachmodell**, wenn du einen Tutor fragst (Abschnitt 4),
2. eine **Zahlung**, wenn du ein Abo oder Token kaufst (Abschnitt 5),
3. eine **Produktion**, wenn du sie ausdrücklich freigibst (Abschnitt 6).

---

## 1. Verantwortlicher

‹Firmierung, Anschrift, Kontakt — identisch mit dem [Impressum](IMPRESSUM.md)›

**Datenschutzbeauftragter:** ‹Name und Kontakt, oder: „Ein Datenschutzbeauftragter
ist nicht bestellt; die Voraussetzungen des Art. 37 DSGVO / § 38 BDSG liegen
nicht vor."›

## 2. Deine Rechte

Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung
(Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit
(Art. 20) und Widerspruch (Art. 21 DSGVO). Eine erteilte Einwilligung kannst du
jederzeit für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO).

Wende dich dafür an ‹datenschutz@domain›.

Du kannst dich außerdem bei einer Aufsichtsbehörde beschweren, insbesondere bei
der für uns zuständigen: ‹Name und Anschrift der Landesdatenschutzbehörde›.

**Der praktische Teil bei uns:** Für die lokale Academy brauchst du uns dafür
nicht. Die Daten liegen bei dir; „Löschung" heißt dort, die Datei zu löschen,
und die Academy hat dafür einen Knopf in den Einstellungen.

## 3. Die lokale Academy

**Was verarbeitet wird:** Anzeigename, Kennung, Kennwort-Hash, Klasse/Schule,
Lernstände, Aufgabenlösungen, Punkte, Urkunden, Tutor-Verläufe, gegebenenfalls
Sprachaufnahmen und deren Transkripte.

**Wo:** ausschließlich in einer SQLite-Datei auf deinem Gerät.

**Wer bekommt es:** niemand. Es gibt keine Telemetrie, keine Absturzberichte,
keine Nutzungsstatistik, keinen Aufruf an unsere Server. Die Academy lässt sich
vollständig ohne Internetverbindung betreiben.

**Rechtsgrundlage:** Soweit wir hier überhaupt Verantwortlicher sind (Art. 4
Nr. 7 DSGVO) und die Verarbeitung nicht nach Art. 2 Abs. 2 lit. c DSGVO als
rein persönliche Tätigkeit aus dem Anwendungsbereich fällt: Vertragserfüllung,
Art. 6 Abs. 1 lit. b DSGVO.

**Im Schulbetrieb** ist die Schule Verantwortliche für die Daten ihrer
Schülerinnen und Schüler; wir sind dann Auftragsverarbeiter. Dafür schließen
wir mit der Schule einen Vertrag nach Art. 28 DSGVO.

## 4. Die Tutoren und das Sprachmodell

Die vier Tutoren beantworten Fragen mit Hilfe eines Sprachmodells. Wo dieses
Modell läuft, entscheidest **du** in den Einstellungen:

| Einstellung | Was hinausgeht | An wen |
|---|---|---|
| **Kein Schlüssel** *(Werkseinstellung)* | nichts | — |
| **Eigener Schlüssel** | deine Frage und der Zusammenhang | an den Anbieter, den **du** eingetragen hast |
| **Gemeinde-Schleuse** | deine Frage und der Zusammenhang | über unseren Server an ‹Modellanbieter› |

**Ab Werk ist kein Schlüssel hinterlegt.** Ohne Schlüssel funktioniert die
Academy weiter, nur die Tutoren antworten nicht — das ist eine bewusste
Entscheidung und keine Sparmaßnahme.

**Was mitgeht:** deine Frage, der Kursabschnitt, an dem du gerade arbeitest, und
deine bisherigen Nachrichten in diesem Gespräch.
**Was nicht mitgeht:** dein Name, deine Kennung, deine Klasse, deine
Lernstände, deine Urkunden.

**Bei eigenem Schlüssel** ist der Anbieter, den du gewählt hast, eigenständig
verantwortlich; es gilt dessen Datenschutzerklärung. Wir sind an dieser
Übermittlung nicht beteiligt und sehen sie nicht.

**Bei der Gemeinde-Schleuse** leiten wir die Anfrage weiter, ohne sie zu
speichern; wir zählen nur die verbrauchten Token für die Abrechnung.
Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. ‹Modellanbieter› sitzt in
‹Land›; bei Drittlandbezug gilt Abschnitt 8.

**Ein ehrlicher Hinweis, der in keine Rechtsgrundlage passt:** Was du in ein
Sprachmodell tippst, ist beim Anbieter. Schreib den Tutoren nichts, was
niemanden etwas angeht — keine Gesundheitsdaten, keine Kennwörter, keine
Geheimnisse anderer Leute. Die Academy sagt dir das auch beim ersten Öffnen des
Tutor-Fensters.

## 5. Zahlung: Stripe und PayPal

Bezahlt wird **nicht in der Academy**, sondern auf unserer Online-Seite. Dabei
verarbeiten wir: Name, Rechnungsanschrift, E-Mail-Adresse, gekauftes Produkt,
Betrag, Zahlungszeitpunkt, Rechnungsnummer.

**Kartendaten sehen wir nie.** Die Zahlung läuft über die weitergeleitete Kasse
des jeweiligen Anbieters; du gibst deine Daten dort ein, nicht bei uns.

| Anbieter | Rolle | Sitz |
|---|---|---|
| Stripe Payments Europe, Ltd., Dublin, Irland | eigener Verantwortlicher für die Zahlungsabwicklung | EU, Konzernmutter USA |
| PayPal (Europe) S.à r.l. et Cie, S.C.A., Luxemburg | eigener Verantwortlicher für die Zahlungsabwicklung | EU, Konzernmutter USA |

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), für die
Rechnungsaufbewahrung Art. 6 Abs. 1 lit. c DSGVO i. V. m. § 147 AO und
§ 257 HGB.

**Aufbewahrung:** Rechnungsdaten 10 Jahre (steuerrechtlich), danach Löschung.

**Der Einlöse-Code.** Nach der Zahlung erzeugt unser Server einen Code, den du
in der Academy einlöst. Der Code trägt nur „so viele Token, gültig, einmalig" —
**keinen Namen**. Dadurch weiß unser Zahlungssystem, wer bezahlt hat, aber
nicht, welches Konto in der Academy die Token bekommt. Das ist beabsichtigt.

## 6. Die Gemeinde-Plattform (geplant)

*Dieser Abschnitt beschreibt einen geplanten Dienst nach
[[COMMUNITY-VPS-PLAN]]. Solange er nicht läuft, gilt er nicht — dann bitte
streichen statt vorsorglich stehen lassen.*

**Das Konto ist ein Schlüsselpaar, keine Anmeldedaten.** Beim Anlegen erzeugt
die Academy auf deinem Rechner ein Schlüsselpaar. Der private Teil verlässt
deinen Rechner nie. Auf unserem Server liegt nur der öffentliche Teil und ein
daraus abgeleitetes Rufzeichen (`PU-W-…`). Wir speichern **keinen Klarnamen,
keine E-Mail-Adresse, kein Kennwort und kein Geburtsdatum**.

**Was hochgeht:** nur, was du in den Einstellungen einzeln freigibst — eine
Produktion (Skript, Baustein, Präsentation, Seite), signiert, mit Zeitpunkt und
Umfang. Lernstände, Chatverläufe, Kennungen und persönliche Ordner sind vom
Hochladen technisch ausgeschlossen, nicht nur nicht vorgesehen.

**Talent-Buchungen** (wer wem für welchen Auftrag Talente gutgeschrieben hat)
liegen pseudonym unter dem Rufzeichen.

**Rechtsgrundlage:** Einwilligung, Art. 6 Abs. 1 lit. a DSGVO — je Freigabe
einzeln und jederzeit widerrufbar. Ein Widerruf nimmt die Produktion vom Server;
Kopien, die andere heruntergeladen haben, können wir nicht zurückholen, und das
steht vor der Freigabe im Klartext auf dem Schirm.

## 7. Kinder und Jugendliche

Ein großer Teil der Nutzerinnen und Nutzer ist minderjährig. Deshalb:

- Der **Vertrag** wird mit einer erwachsenen Person geschlossen (Eltern, Schule,
  Träger), nicht mit dem Kind.
- Eine **Einwilligung** nach Art. 6 Abs. 1 lit. a DSGVO — sie wird nur für die
  Gemeinde-Plattform (Abschnitt 6) gebraucht — ist bei unter 16-Jährigen nur
  mit Zustimmung der Sorgeberechtigten wirksam (Art. 8 DSGVO). In der Academy
  heißt das: eine Veröffentlichung eines minderjährigen Kontos wartet auf das
  **Mit-Siegel** eines Eltern- oder Lehrerkontos.
- Die **lokale Academy** braucht keine dieser Einwilligungen, weil dort nichts
  hinausgeht.
- **Rufzeichen statt Namen.** Auf der Gemeinde-Plattform erscheint nie ein
  Klarname, es sei denn, ein volljähriger Nutzer trägt ihn selbst ein.

## 8. Übermittlung in Drittländer

Soweit Dienste eingesetzt werden, deren Konzernmütter in den USA sitzen
(Stripe, PayPal, gegebenenfalls der Modellanbieter), kann es zu einer
Verarbeitung außerhalb der EU kommen. Grundlage ist der Angemessenheitsbeschluss
zum EU-US Data Privacy Framework, ergänzt um Standardvertragsklauseln nach
Art. 46 Abs. 2 lit. c DSGVO.

‹Vor Live-Gang prüfen, welche der genannten Anbieter tatsächlich zertifiziert
sind — die Liste ändert sich, und ein falscher Verweis ist schlimmer als
keiner.›

## 9. Server-Protokolle der Online-Seite

Beim Aufruf unserer Online-Seite verarbeitet der Server: gekürzte IP-Adresse,
Zeitpunkt, aufgerufene Adresse, Statuscode, übertragene Datenmenge, Browser-
und Betriebssystemkennung.

**Zweck:** Betrieb und Abwehr von Angriffen.
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am
sicheren Betrieb).
**Löschung:** nach ‹7 / 14› Tagen.

**Keine Cookies außer den technisch erforderlichen.** Kein Tracking, keine
Reichweitenmessung, keine eingebetteten Schriften, keine Netzwerke Dritter. Ein
Einwilligungsbanner ist deshalb nicht nötig — und das ist der Grund, warum du
keins siehst.

## 10. Änderungen

Wir passen diese Erklärung an, wenn sich der Dienst ändert. Maßgeblich ist die
Fassung, die beim Aufruf abrufbar ist. Wesentliche Änderungen kündigen wir
Bestandskunden vorher an.

**Stand:** ‹Datum›
