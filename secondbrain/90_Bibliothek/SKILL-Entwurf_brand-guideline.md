# Skill-Entwurf: brand-guideline

> Quelle: SecondBrain 10_Stufen / „Der 7. Kurs" (6 Lektionen) +
> Musterstück `90_Bibliothek/Brand-Guideline.md`.
> Zweck: Ein Agent soll für **Kursteilnehmer** eine vollständige,
> einsatzfähige Brand-Guideline erarbeiten — nach exakt der Methodik des
> Kurses. Nicht für PROMPTHEUS selbst; die Marke der Academy ist nur
> Referenz.

---

## SKILL.md

```markdown
---
name: brand-guideline
description: Erstellt eine vollständige Brand-Guideline für ein Unternehmen,
  eine Praxis oder eine Privatmarke — als zweiseitiges Dokument plus
  Systemprompt-Baustein und Webseite. Nutzen bei Anfragen wie "mach mir eine
  Brand-Guideline", "beschreibe meinen Stil", "Corporate Design light".
version: 1.0.0
---

# Brand-Guideline erstellen

Ziel: Ein Dokument von maximal zwei Seiten, das festhält, **wie die Marke
klingt, wie sie aussieht und was sie nie tut** — lesbar für Menschen,
befolgbar für Sprachmodelle. Dazu der Systemprompt-Baustein und optional
eine Webseite als Probe.

## Grundprinzipien (aus dem Kurs, nie abweichen)

1. **Ein Modell hat keinen Stil, nur einen Durchschnitt.** Die Guideline
   löst das an EINER Stelle statt an vierzig.
2. **Zwei Seiten sind die Obergrenze** — weil das Ganze in einen
   Systemprompt passen muss.
3. **Gut/Schlecht-Paare statt Adjektive.** "sei präzise" wirkt nicht;
   zwei gegenübergestellte Sätze wirken.
4. **Verbote sind stärker als Wünsche**, Zahlen statt Adjektive
   ("2–5 Sätze", nicht "kurz").
5. **Fest ist, was der Leser wiedererkennen soll. Frei ist, was der
   Anlass verlangt.** Die Trennlinie pro Marke neu ziehen, nicht die
   Mitte wählen.

## Onboarding — das vollständige Erstgespräch

**Grundregel:** Der Nutzer weiß in der Regel nicht, was er sagen soll.
Der Agent fragt deshalb **vollumfänglich** ab — nie nur die Hälfte und
dann raten. Jede Frage wird verständlich gestellt (mit Mini-Beispiel),
jede Antwort wird kurz zusammengefasst bestätigt ("Also: du willst X,
nicht Y — richtig?"). Erst wenn alle Blöcke 1–7 beantwortet sind, wird
produziert. Das Ergebnis ist dann für **unterschiedliche Produktionen**
brauchbar (ChatBot, Mails, Webseite, Social Posts) — nicht nur für einen
Zweck.

### Block 1 — Wer bist du, was machst du?
- Wie heißt dein Unternehmen / deine Praxis / dein Projekt?
- Was bietest du an? In einem Satz, ohne Fachwörter.
- Wer sind deine Kunden? (Alter, Anlass, Erwartung)
- Was unterscheidet dich von anderen, die dasselbe anbieten?

### Block 2 — Der Kern
- Wenn deine Marke EIN Satz wäre — welcher wäre das? (Leitsatz)
- Welches Bild passt zu dir? (Objekt, Ort, Stimmung — z.B. "Werkstatt",
  "hell und luftig", "alte Buchhandlung")
- Welche Haltung hast du zu deinen Kunden? (z.B. "auf Augenhöhe",
  "erklären statt verkaufen")

### Block 3 — Persönlichkeit mit Abgrenzung
Frage viermal: "Du bist ___, aber niemals ___."
Beispiel: "freundlich, aber nicht kumpelhaft". Die Abgrenzung ist der
eigentliche Trick — sie macht die Eigenschaft prüfbar.

### Block 4 — Register (die Gruppen)
- Mit welchen verschiedenen Gruppen sprichst du? (z.B. Patienten /
  Angehörige / Krankenkassen)
- Was ändert sich im Ton je Gruppe — und was bleibt IMMER gleich?

### Block 5 — Gestalt
- Hast du bereits Farben? Wenn ja: welche und wo eingesetzt?
- Drei Farben mit Bedeutung: Was soll z.B. "weiter", was "geschafft",
  was "erklärt" signalisieren?
- Gibt es eine Schriftart oder einen Schrift-Stil, den du nutzt oder magst?

### Block 6 — Bestehende Marke / Webseite (besonders wichtig bei Berufstätigen!)
- **Gibt es bereits eine Webseite?** Wenn JA → **Link erfragen.**
  Aus dem Link werden abgeholt: Farben (Hexwerte), Schriften, Tonalität
  der Texte, Bildsprache, Logo/Ornamente. Diese Bestandteile fließen als
  Ausgangslage in die Guideline ein — nichts wird neu erfunden, was es
  schon gibt. Der Agent analysiert die Seite vor den weiteren Fragen und
  legt die Ergebnisse dem Nutzer zur Bestätigung vor.
- Gibt es Logo, Visitenkarten, Flyer, Briefpapier? (Beschreibung genügt)
- Gibt es schon einen ChatBot oder Texte, deren Ton dir gefällt? Als
  Beispiel zitieren lassen.

### Block 7 — Inspiration (falls KEINE Marke/Webseite existiert)
Zwei Internetquellen stehen im Kurs (Lektion 6) bereit:

- **[21st.dev](https://21st.dev/community/components)** — fertige
  Oberflächen-Bausteine zum Ansehen und Nachlesen im Code: Knöpfe,
  Kopfbereiche, Karten. Nützlich, wenn man weiß, WAS man braucht.
- **[Dribbble](https://dribbble.com/)** — Entwürfe von Gestalterinnen
  und Gestaltern weltweit; zwanzig Auffassungen derselben Aufgabe
  nebeneinander. Nützlich, wenn man noch nicht weiß, was man will.

Der Agent weist den Nutzer auf diese beiden Quellen hin, lässt ihn
2–3 Beispiele aussuchen und leitet daraus Farbrichtung, Stil und
Anmutung ab. Alternativ kann der Agent selbst Suchvorschläge machen
("schau dir auf Dribbble 'Zahnarztpraxis warm' an").

### Block 8 — Einsatz & Produktionen
- Wo soll die Guideline wirken? (ChatBot, E-Mails, Webseite,
  Social Media, Aushänge …) — mehrere Antworten möglich.
- Gibt es Textanlässe, die besonders häufig vorkommen?
  (Terminabsage, Angebot, Reklamation …)
- Soll am Ende auch eine Webseite gebaut werden?
- Verbotsliste: Was tut deine Marke NIE? (Wörter, Töne, Verhalten)

---

## Ablauf

### Schritt 1 — Onboarding führen
Führe das vollständige Onboarding (Blöcke 1–8 oben). Bei einer
bestehenden Webseite: zuerst den Link analysieren, dann die restlichen
Blöcke mit den gefundenen Werten vorbefüllen und bestätigen lassen.

Erst wenn alle Blöcke geklärt sind: weiter zu Schritt 2. Fehlen einzelne
Antworten: begründet vorschlagen und vom Nutzer bestätigen lassen.
Nie stillschweigend erfinden.

### Schritt 2 — Die acht Felder ausfüllen
Das Dokument hat genau diese Reihenfolge:

| # | Feld | Inhalt |
|---|------|--------|
| 1 | Ausweis | 5 Zeilen: Was, Für wen, Der Satz, Das Bild, Die Haltung |
| 2 | Persönlichkeit | 4 Eigenschaften je mit Abgrenzung |
| 3 | Register | Gruppen + was sich ändert (Haltung bleibt fest) |
| 4 | Sprache | Gut/Schlecht-Paare + Verbotsliste |
| 5 | Gestalt | 3 Farben mit Bedeutung |
| 6 | Ausgabeformen | Häufigste Anlässe mit Form je Anlass |
| 7 | Einsatz | Der Systemprompt-Baustein (siehe Schritt 3) |
| 8 | Dialektik | Tabelle Fest vs. Frei |

Probe auf Feld 1: Könnte der Text unter fremdem Namen stehen? Dann fehlt
Haltung oder Genauigkeit.

### Schritt 3 — Systemprompt-Baustein ableiten
Aus den acht Feldern nur das, was in JEDER Antwort muss — ca. 6 Zeilen:

```
Du bist [Rolle] von [Marke].
Haltung: [eine Zeile].
Ansprache: [du/Sie — eine Regel].
Form: [Zahlenvorgabe, z.B. 2 bis 5 Sätze].
Nie: [3–6 prüfbare Verbote].
Jede Absage nennt einen Weg: was ist, warum, was jetzt zu tun ist.
```

Regeln für den Baustein:
- Kein "bitte", kein "versuche" — Regeln sind Zustände, keine Bitten.
- Verbote statt Wunschadjektive.
- Zahlen statt Adjektive.
- Alles, was nicht in jede Antwort muss, bleibt draußen.

Bei Agenten zusätzlich definieren: Berichtsform (was getan / Ergebnis /
offen) und Stopp-Regel vor Unumkehrbarem ("Ich würde X tun. Soll ich?").
Bei Mehr-Agenten-Systemen: EINE Guideline-Datei, mehrere unveränderte
Verweise + je Agent nur seine Rolle.

### Schritt 4 — Paket bauen
Liefern als Ordner:

| Datei | Inhalt |
|---|------|
| BRAND.md | das Dokument, max. 2 Seiten |
| systemprompt.txt | der Baustein zum Einfügen |
| index.html + stil.css | optionale Seite; Farben als CSS-Tokens (:root-Variablen mit bedeutungstragenden Namen) |
| PRUEFLISTE.md | 10 Fragen vor dem Abgeben |
| LIZENZ.md | Hinweis MIT/Apache 2.0 für Vorlage — eigene Inhalte bleiben beim Nutzer |

### Schritt 5 — Prüfliste (vor Übergabe selbst anwenden)
1. Steht alles unter 2 Seiten?
2. Könnte ein Text unter fremdem Namen stehen? → Feld 1 nachschärfen
3. Hat jede Eigenschaft ihre Abgrenzung?
4. Sind Sprache-Regeln als Gut/Schlecht-Paare formuliert?
5. Bedeutet jede der drei Farben etwas?
6. Ist der Systemprompt ≤ ca. 10 Zeilen und ohne "bitte"?
7. Gibt es mindestens eine prüfbare Verbotsliste?
8. Ist die Fest/Frei-Trennlinie explizit notiert?
9. Nennt jede Fehlermeldung einen Weg?
10. Passt die Webseite zum Dokument (Knopffarbe = Bedeutung)?

## Fallstricke

- NICHT mehr als 2 Seiten schreiben — Länge zerstört die Wirkung.
- NICHT Adjektive als Stil-Anweisung akzeptieren; in Paare/Zahlen
  übersetzen.
- Register dürfen Tonlage ändern, niemals Haltung oder Ansprache.
- Eigene Inhalte des Nutzers gehören ihm — keine Lizenz darauf erklären.
- Bei fehlenden Nutzer-Antworten: vorschlagen UND bestätigen lassen,
  nie stillschweigend erfinden.
```
