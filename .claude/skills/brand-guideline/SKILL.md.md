# Skill: brand-guideline

> Quelle: SecondBrain 10_Stufen / â€Der 7. Kurs" (6 Lektionen) +
> Musterstück `90_Bibliothek/Brand-Guideline.md`.
> Zweck: Ein Agent soll für **Kursteilnehmer** eine vollstÖndige,
> einsatzfÖhige Brand-Guideline erarbeiten â€” nach exakt der Methodik des
> Kurses. Nicht für PROMPTHEUS selbst; die Marke der Academy ist nur
> Referenz.

---

## SKILL.md

```markdown
---
name: brand-guideline
description: Erstellt eine vollstÖndige Brand-Guideline für ein Unternehmen,
  eine Praxis oder eine Privatmarke â€” als zweiseitiges Dokument plus
  Systemprompt-Baustein und Webseite. Nutzen bei Anfragen wie "mach mir eine
  Brand-Guideline", "beschreibe meinen Stil", "Corporate Design light".
version: 1.0.0
---

# Brand-Guideline erstellen

Ziel: Ein Dokument von maximal zwei Seiten, das festhÖlt, **wie die Marke
klingt, wie sie aussieht und was sie nie tut** â€” lesbar für Menschen,
befolgbar für Sprachmodelle. Dazu der Systemprompt-Baustein und optional
eine Webseite als Probe.

## Grundprinzipien (aus dem Kurs, nie abweichen)

1. **Ein Modell hat keinen Stil, nur einen Durchschnitt.** Die Guideline
   lÃ¶st das an EINER Stelle statt an vierzig.
2. **Zwei Seiten sind die Obergrenze** â€” weil das Ganze in einen
   Systemprompt passen muss.
3. **Gut/Schlecht-Paare statt Adjektive.** "sei prÖzise" wirkt nicht;
   zwei gegenübergestellte SÖtze wirken.
4. **Verbote sind stÖrker als Wünsche**, Zahlen statt Adjektive
   ("2â€“5 SÖtze", nicht "kurz").
5. **Fest ist, was der Leser wiedererkennen soll. Frei ist, was der
   Anlass verlangt.** Die Trennlinie pro Marke neu ziehen, nicht die
   Mitte wÖhlen.

## Onboarding â€” das vollstÖndige ErstgesprÖch

**Grundregel:** Der Nutzer weiÃŸ in der Regel nicht, was er sagen soll.
Der Agent fragt deshalb **vollumfÖnglich** ab â€” nie nur die HÖlfte und
dann raten. Jede Frage wird verstÖndlich gestellt (mit Mini-Beispiel),
jede Antwort wird kurz zusammengefasst bestÖtigt ("Also: du willst X,
nicht Y â€” richtig?"). Erst wenn alle BlÃ¶cke 1â€“7 beantwortet sind, wird
produziert. Das Ergebnis ist dann für **unterschiedliche Produktionen**
brauchbar (ChatBot, Mails, Webseite, Social Posts) â€” nicht nur für einen
Zweck.

### Block 1 â€” Wer bist du, was machst du?
- Wie heiÃŸt dein Unternehmen / deine Praxis / dein Projekt?
- Was bietest du an? In einem Satz, ohne FachwÃ¶rter.
- Wer sind deine Kunden? (Alter, Anlass, Erwartung)
- Was unterscheidet dich von anderen, die dasselbe anbieten?

### Block 2 â€” Der Kern
- Wenn deine Marke EIN Satz wÖre â€” welcher wÖre das? (Leitsatz)
- Welches Bild passt zu dir? (Objekt, Ort, Stimmung â€” z.B. "Werkstatt",
  "hell und luftig", "alte Buchhandlung")
- Welche Haltung hast du zu deinen Kunden? (z.B. "auf AugenhÃ¶he",
  "erklÖren statt verkaufen")

### Block 3 â€” PersÃ¶nlichkeit mit Abgrenzung
Frage viermal: "Du bist ___, aber niemals ___."
Beispiel: "freundlich, aber nicht kumpelhaft". Die Abgrenzung ist der
eigentliche Trick â€” sie macht die Eigenschaft prüfbar.

### Block 4 â€” Register (die Gruppen)
- Mit welchen verschiedenen Gruppen sprichst du? (z.B. Patienten /
  AngehÃ¶rige / Krankenkassen)
- Was Öndert sich im Ton je Gruppe â€” und was bleibt IMMER gleich?

### Block 5 â€” Gestalt
- Hast du bereits Farben? Wenn ja: welche und wo eingesetzt?
- Drei Farben mit Bedeutung: Was soll z.B. "weiter", was "geschafft",
  was "erklÖrt" signalisieren?
- Gibt es eine Schriftart oder einen Schrift-Stil, den du nutzt oder magst?

### Block 6 â€” Bestehende Marke / Webseite (besonders wichtig bei BerufstÖtigen!)
- **Gibt es bereits eine Webseite?** Wenn JA â†’ **Link erfragen.**
  Aus dem Link werden abgeholt: Farben (Hexwerte), Schriften, TonalitÖt
  der Texte, Bildsprache, Logo/Ornamente. Diese Bestandteile flieÃŸen als
  Ausgangslage in die Guideline ein â€” nichts wird neu erfunden, was es
  schon gibt. Der Agent analysiert die Seite vor den weiteren Fragen und
  legt die Ergebnisse dem Nutzer zur BestÖtigung vor.
- Gibt es Logo, Visitenkarten, Flyer, Briefpapier? (Beschreibung genügt)
- Gibt es schon einen ChatBot oder Texte, deren Ton dir gefÖllt? Als
  Beispiel zitieren lassen.

### Block 7 â€” Inspiration (falls KEINE Marke/Webseite existiert)
Zwei Internetquellen stehen im Kurs (Lektion 6) bereit:

- **[21st.dev](https://21st.dev/community/components)** â€” fertige
  OberflÖchen-Bausteine zum Ansehen und Nachlesen im Code: KnÃ¶pfe,
  Kopfbereiche, Karten. Nützlich, wenn man weiÃŸ, WAS man braucht.
- **[Dribbble](https://dribbble.com/)** â€” Entwürfe von Gestalterinnen
  und Gestaltern weltweit; zwanzig Auffassungen derselben Aufgabe
  nebeneinander. Nützlich, wenn man noch nicht weiÃŸ, was man will.

Der Agent weist den Nutzer auf diese beiden Quellen hin, lÖsst ihn
2â€“3 Beispiele aussuchen und leitet daraus Farbrichtung, Stil und
Anmutung ab. Alternativ kann der Agent selbst SuchvorschlÖge machen
("schau dir auf Dribbble 'Zahnarztpraxis warm' an").

### Block 8 â€” Einsatz & Produktionen
- Wo soll die Guideline wirken? (ChatBot, E-Mails, Webseite,
  Social Media, AushÖnge â€¦) â€” mehrere Antworten mÃ¶glich.
- Gibt es TextanlÖsse, die besonders hÖufig vorkommen?
  (Terminabsage, Angebot, Reklamation â€¦)
- Soll am Ende auch eine Webseite gebaut werden?
- Verbotsliste: Was tut deine Marke NIE? (WÃ¶rter, TÃ¶ne, Verhalten)

---

## Ablauf

### Schritt 1 â€” Onboarding führen
Führe das vollstÖndige Onboarding (BlÃ¶cke 1â€“8 oben). Bei einer
bestehenden Webseite: zuerst den Link analysieren, dann die restlichen
BlÃ¶cke mit den gefundenen Werten vorbefüllen und bestÖtigen lassen.

Erst wenn alle BlÃ¶cke geklÖrt sind: weiter zu Schritt 2. Fehlen einzelne
Antworten: begründet vorschlagen und vom Nutzer bestÖtigen lassen.
Nie stillschweigend erfinden.

### Schritt 2 â€” Die acht Felder ausfüllen
Das Dokument hat genau diese Reihenfolge:

| # | Feld | Inhalt |
|---|------|--------|
| 1 | Ausweis | 5 Zeilen: Was, Für wen, Der Satz, Das Bild, Die Haltung |
| 2 | PersÃ¶nlichkeit | 4 Eigenschaften je mit Abgrenzung |
| 3 | Register | Gruppen + was sich Öndert (Haltung bleibt fest) |
| 4 | Sprache | Gut/Schlecht-Paare + Verbotsliste |
| 5 | Gestalt | 3 Farben mit Bedeutung |
| 6 | Ausgabeformen | HÖufigste AnlÖsse mit Form je Anlass |
| 7 | Einsatz | Der Systemprompt-Baustein (siehe Schritt 3) |
| 8 | Dialektik | Tabelle Fest vs. Frei |

Probe auf Feld 1: KÃ¶nnte der Text unter fremdem Namen stehen? Dann fehlt
Haltung oder Genauigkeit.

### Schritt 3 â€” Systemprompt-Baustein ableiten
Aus den acht Feldern nur das, was in JEDER Antwort muss â€” ca. 6 Zeilen:

```
Du bist [Rolle] von [Marke].
Haltung: [eine Zeile].
Ansprache: [du/Sie â€” eine Regel].
Form: [Zahlenvorgabe, z.B. 2 bis 5 SÖtze].
Nie: [3â€“6 prüfbare Verbote].
Jede Absage nennt einen Weg: was ist, warum, was jetzt zu tun ist.
```

Regeln für den Baustein:
- Kein "bitte", kein "versuche" â€” Regeln sind ZustÖnde, keine Bitten.
- Verbote statt Wunschadjektive.
- Zahlen statt Adjektive.
- Alles, was nicht in jede Antwort muss, bleibt drauÃŸen.

Bei Agenten zusÖtzlich definieren: Berichtsform (was getan / Ergebnis /
offen) und Stopp-Regel vor Unumkehrbarem ("Ich würde X tun. Soll ich?").
Bei Mehr-Agenten-Systemen: EINE Guideline-Datei, mehrere unverÖnderte
Verweise + je Agent nur seine Rolle.

### Schritt 4 â€” Paket bauen
Liefern als Ordner:

| Datei | Inhalt |
|---|------|
| BRAND.md | das Dokument, max. 2 Seiten |
| systemprompt.txt | der Baustein zum Einfügen |
| index.html + stil.css | optionale Seite; Farben als CSS-Tokens (:root-Variablen mit bedeutungstragenden Namen) |
| PRUEFLISTE.md | 10 Fragen vor dem Abgeben |
| LIZENZ.md | Hinweis PolyForm Shield 1.0.0 für die Vorlage (geschäftlich nutzbar, kein Konkurrenzprodukt) â€” eigene Inhalte bleiben beim Nutzer |

### Schritt 5 â€” Prüfliste (vor Übergabe selbst anwenden)
1. Steht alles unter 2 Seiten?
2. KÃ¶nnte ein Text unter fremdem Namen stehen? â†’ Feld 1 nachschÖrfen
3. Hat jede Eigenschaft ihre Abgrenzung?
4. Sind Sprache-Regeln als Gut/Schlecht-Paare formuliert?
5. Bedeutet jede der drei Farben etwas?
6. Ist der Systemprompt â‰¤ ca. 10 Zeilen und ohne "bitte"?
7. Gibt es mindestens eine prüfbare Verbotsliste?
8. Ist die Fest/Frei-Trennlinie explizit notiert?
9. Nennt jede Fehlermeldung einen Weg?
10. Passt die Webseite zum Dokument (Knopffarbe = Bedeutung)?

## Fallstricke

- NICHT mehr als 2 Seiten schreiben â€” Länge zerstört die Wirkung.
- NICHT Adjektive als Stil-Anweisung akzeptieren; in Paare/Zahlen
  übersetzen.
- Register dürfen Tonlage Öndern, niemals Haltung oder Ansprache.
- Eigene Inhalte des Nutzers gehören ihm â€” keine Lizenz darauf erklÖren.
- Bei fehlenden Nutzer-Antworten: vorschlagen UND bestÖtigen lassen,
  nie stillschweigend erfinden.
```