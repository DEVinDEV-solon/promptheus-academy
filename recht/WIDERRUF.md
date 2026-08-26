---
type: reference
title: "Widerrufsbelehrung und Muster-Widerrufsformular (Entwurf)"
description: "Widerrufsrecht für Verbraucher bei Abos und beim Kauf von Token: 14 Tage, Fristbeginn, vorzeitiges Erlöschen bei sofort freigeschalteten digitalen Inhalten, Wertersatz, Muster-Formular. Entwurf mit Platzhaltern, ungeprüft."
tags: [recht, widerruf, verbraucher, prometheus]
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[recht/README]]"
stand: entwurf
status: zur-pruefung
---

> **Entwurf, ungeprüft.** Platzhalter in `‹spitzen Klammern›`. Siehe
> [README.md](README.md).

# Widerrufsbelehrung

## Die eine Sache, die vorweg gehört

Es gibt hier **zwei verschiedene Fälle**, und sie enden unterschiedlich. Wer sie
in eine Belehrung zusammenzieht, macht sie falsch:

| Was gekauft wurde | Was das rechtlich ist | Was mit dem Widerrufsrecht passiert |
|---|---|---|
| **Abo** (Schüler, Familie, Klasse, Schule) | Dienstleistung, dauernd | bleibt 14 Tage bestehen; bei Beginn auf Wunsch anteiliger Wertersatz |
| **Token-Paket** | digitaler Inhalt, sofort geliefert | **erlischt**, sobald wir mit Zustimmung sofort freischalten |

Deshalb gilt: **Token werden erst freigeschaltet, nachdem beide Häkchen gesetzt
sind** (Abschnitt 3). Ohne diese Häkchen bleibt das Widerrufsrecht bestehen, und
das ist dann auch richtig so — nicht ein Fehler, den wir hinterher wegdiskutieren.

---

## 1. Widerrufsrecht

Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
Vertrag zu widerrufen.

Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns

‹Firmierung›\
‹Straße und Hausnummer›\
‹PLZ Ort›\
‹Land›\
E-Mail: ‹widerruf@domain›\
Telefon: ‹Rufnummer›

mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief
oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden,
das jedoch nicht vorgeschrieben ist.

Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

## 2. Folgen des Widerrufs

Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von
Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der
zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der
Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt
haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei
uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe
Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es
sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.

**Wertersatz bei begonnener Dienstleistung.** Haben Sie verlangt, dass die
Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen
angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem
Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags
unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum
Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.

*Praktisch heißt das:* Bei einem Abo, das am 3. beginnt und am 10. widerrufen
wird, behalten wir sieben Dreißigstel des Monatsbeitrags. Verbrauchte Token
werden dabei nicht gesondert berechnet.

## 3. Vorzeitiges Erlöschen bei digitalen Inhalten

Ihr Widerrufsrecht bei einem Vertrag über die Lieferung von nicht auf einem
körperlichen Datenträger befindlichen digitalen Inhalten — bei uns: **Token und
Freischaltungen** — erlischt nach § 356 Abs. 5 BGB, wenn

1. Sie **ausdrücklich zugestimmt** haben, dass wir mit der Ausführung des
   Vertrags vor Ablauf der Widerrufsfrist beginnen, **und**
2. Sie Ihre **Kenntnis davon bestätigt** haben, dass Sie durch diese Zustimmung
   mit Beginn der Ausführung des Vertrags Ihr Widerrufsrecht verlieren.

**So holen wir das ein** — zwei getrennte Häkchen im Kaufvorgang, keine
Vorauswahl, kein Sammelhaken mit den AGB:

> ☐ Ich verlange ausdrücklich, dass Sie vor Ende der Widerrufsfrist mit der
>   Ausführung beginnen, damit die Token sofort verfügbar sind.
>
> ☐ Mir ist bekannt, dass ich damit mein Widerrufsrecht für diesen Kauf
>   verliere, sobald die Token freigeschaltet sind.

**Die Häkchen sind keine Kaufbedingung.** Wer sie stehen lässt, kauft trotzdem
und behält seine vierzehn Tage; die Token kommen dann nach Fristablauf. Ein
Kauf, der sich ohne Rechtsverzicht nicht abschließen ließe, wäre genau der
Zwang, den die Vorschrift verhindern soll — ein gesperrter Bestellknopf ist
deshalb der falsche Weg, so bequem er wäre.

**Nur beide zusammen wirken.** Die Vorschrift verlangt das Verlangen *und* die
Kenntnisbestätigung; ein einzelnes Häkchen lässt das Widerrufsrecht bestehen.
Der Zeitpunkt beider Zustimmungen wird **an der Buchung** gespeichert (Spalte
`zustimmung` in `token_buchungen`) und steht in der Bestellbestätigung. Wo
nichts steht, ist nichts eingeholt worden, und dann gilt die Frist.

**Solange nichts freigeschaltet ist, ist auch nichts erloschen.** Wer den
Einlöse-Code nicht eingelöst hat, kann widerrufen.

## 4. Wer kein Widerrufsrecht hat

Das Widerrufsrecht gilt nur für **Verbraucher** (§ 13 BGB). **Schulen, Träger
und andere Einrichtungen sind Unternehmer** (§ 14 BGB) und haben keines. Für sie
gilt die Laufzeitregelung aus § 9 der [AGB](AGB.md).

## 5. Der Widerrufsknopf

Nach § 312 k BGB muss ein Widerruf online genauso einfach möglich sein wie der
Kauf. In der Abrechnung auf ‹kauf.domain› steht dafür eine Schaltfläche
**„Vertrag widerrufen"**, die ohne Anmeldung erreichbar ist und eine
Bestätigung in Textform auslöst.

*Dasselbe gilt für die Kündigung:* eine Schaltfläche **„Verträge hier kündigen"**,
ebenfalls ohne Anmeldung erreichbar. Beides ist Pflicht und keine Nettigkeit.

---

# Muster-Widerrufsformular

*(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular
aus und senden Sie es zurück.)*

---

An\
‹Firmierung›\
‹Straße und Hausnummer›\
‹PLZ Ort›\
E-Mail: ‹widerruf@domain›

Hiermit widerrufe(n) ich/wir (\*) den von mir/uns (\*) abgeschlossenen Vertrag
über den Kauf der folgenden Waren (\*) / die Erbringung der folgenden
Dienstleistung (\*):

_______________________________________________

Bestellt am (\*) / erhalten am (\*): ______________

Name des/der Verbraucher(s): ______________________

Anschrift des/der Verbraucher(s): _________________

_______________________________________________

Unterschrift des/der Verbraucher(s)\
*(nur bei Mitteilung auf Papier)*

Datum: ______________

*(\*) Unzutreffendes streichen.*

---

*Diese Belehrung folgt dem gesetzlichen Muster in Anlage 1 zu Art. 246 a
§ 1 Abs. 2 EGBGB. Abweichungen vom Mustertext sind riskant — wer daran
formuliert, verliert die Schutzwirkung des Musters. Die Platzhalter füllen,
sonst nichts ändern.*
