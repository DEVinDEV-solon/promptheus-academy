---
type: lesson
title: "Deine Seite, dein Paket, deine Lizenz"
description: "Aus dem Dokument wird eine Webseite, aus der Webseite ein Paket — und das gehört danach dir."
tags:
  - lesson
  - kurs-7
  - marke
  - lizenz
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 45
---

# Deine Seite, dein Paket, deine Lizenz

## Warum am Ende eine Webseite steht

Nicht als Zugabe. Eine Webseite ist die **Probe aufs Dokument**: Sie zwingt
jede Entscheidung ans Licht, die man im Text noch offenlassen konnte.

- Drei Farben mit Bedeutung? Dann zeig, welche der Knopf bekommt.
- Eine Haltung „erklären statt beeindrucken"? Dann steht kein „Jetzt starten!"
  auf der Seite.
- Antwortlänge festgelegt? Dann sind auch die Absätze nicht beliebig lang.

Wo das Dokument schwammig war, merkst du es hier — und nur hier.

## Die Farben als Tokens

Du schreibst deine drei Farben **einmal** an den Anfang und benutzt danach nur
noch ihre Namen:

```css
:root {
  --weiter:    #b74e0c;   /* hier geht es weiter */
  --geschafft: #9a6a00;   /* das hast du erreicht */
  --erklaert:  #2f6394;   /* hier wird erklärt */
}

.knopf { background: var(--weiter); }
```

Das ist dieselbe Idee wie beim Systemprompt: **eine Stelle statt vierzig.** Eine
Farbänderung ist danach eine Zeile — und die Bedeutung steht im Namen, nicht in
deinem Gedächtnis.

## Das Paket

Am Ende steht ein Ordner, den du als **.zip** herunterlädst:

| Datei | Was drin ist |
|---|---|
| `BRAND.md` | dein Dokument, zwei Seiten |
| `systemprompt.txt` | der Baustein zum Einsetzen |
| `index.html` | deine Seite |
| `stil.css` | deine Farben als Tokens |
| `PRUEFLISTE.md` | zehn Fragen vor dem Abgeben |
| `LIZENZ.md` | was für die Vorlage gilt — und was für deine Inhalte |

Alles lesbare Dateien. Kein Format, das nur in dieser Academy aufgeht.

## Die Lizenz — und was sie nicht abdeckt

Vorlage und Bausteine stehen unter der **PolyForm Shield 1.0.0** — derselben
Lizenz wie die Academy selbst. Sie erlaubt dir, sie zu benutzen, zu ändern und
weiterzugeben, **auch geschäftlich**: Deine Seite darf für dein Gewerbe werben,
für deinen Verein, für deine Bewerbung. Eine Patentzusage ist dabei.

Sie verbietet genau eines: **daraus ein Produkt zu machen, das der Academy
Konkurrenz macht.** Ein eigenes Lernprogramm aus diesen Bausteinen, verkauft
oder verschenkt, ist nicht erlaubt. Deine eigene Seite ist keine Konkurrenz —
die Grenze verläuft nicht bei „Geld verdienen", sondern bei „dasselbe anbieten".

> **Was du hineingeschrieben hast, gehört dir allein.**
> Deine Marke, deine Sätze, deine Farben. Darauf hat die Academy keinen
> Anspruch und erteilt dir auch keine Erlaubnis dafür — eine Lizenz auf deine
> eigene Handschrift wäre eine Anmaßung. Lizenziert ist nur, was wir beigelegt
> haben.

Der Unterschied klingt spitzfindig und ist es nicht: Er entscheidet, ob du das
Ergebnis in ein Geschäft mitnehmen, in ein Schulprojekt legen oder öffentlich
stellen kannst, ohne noch einmal jemanden zu fragen. Bei deinen eigenen Zeilen
musst du niemanden fragen — bei der Vorlage nur dann, wenn du damit dasselbe
anbieten willst wie wir.

## Die Prüfliste

Vor jeder Veröffentlichung, gleich ob du oder ein Modell den Text geschrieben
hat:

1. Könnte dieser Text unter einem fremden Namen stehen, ohne aufzufallen?
2. Steht irgendwo ein Superlativ oder ein Wort von deiner Verbotsliste?
3. Stimmt die Ansprache — durchgehend?
4. Ist jeder Fachbegriff beim ersten Auftreten erklärt?
5. Nennt jede Absage einen Weg?
6. Ist jede Zahl belegt?
7. Trägt eine Farbe hier wirklich ihre Bedeutung?
8. Trägt Farbe irgendwo **allein** eine Aussage?
9. Hat die Antwort die Form, die du für diesen Anlass festgelegt hast?
10. Bei mehreren Agenten: haben alle **dieselbe** Fassung deines Dokuments?

```aufgabe
id: K7-10
typ: denkaufgabe
titel: "Was die Lizenz abdeckt"
punkte: 20
frage: "Du lädst dein Paket herunter. Wofür gilt die beigelegte Lizenz?"
optionen:
  - "Für die Vorlage und die beigelegten Bausteine — nicht für deine eigenen Inhalte"
  - "Für alles im Paket, auch die Sätze, die du selbst geschrieben hast"
  - "Nur für die CSS-Datei, weil sie Code ist"
  - "Für nichts davon, das Paket ist nur zum Ansehen"
loesung: "Für die Vorlage und die beigelegten Bausteine — nicht für deine eigenen Inhalte"
richtzeit_s: 75
hinweise:
  - text: "Eine Lizenz kann nur geben, was der Geber auch besitzt."
    kostet: 5
erklaerung: |
  Eine Lizenz erteilt Rechte an etwas, das dem Lizenzgeber gehört. Die Academy
  besitzt die Vorlage und die Bausteine, also lizenziert sie diese. Deine
  eigenen Texte gehören dir von Anfang an — sie brauchen keine Erlaubnis, und
  die Academy könnte sie auch gar nicht erteilen.
```

```aufgabe
id: K7-11
typ: uebereinstimmung
titel: "Farbe, Name, Bedeutung"
punkte: 25
frage: "Ordne jedem Token die Aussage zu, für die es steht."
links:
  - "--weiter"
  - "--geschafft"
  - "--erklaert"
rechts:
  - "Hier führt der nächste Schritt entlang"
  - "Das hat jemand erreicht"
  - "Das ist Hintergrundwissen"
loesung:
  "--weiter": "Hier führt der nächste Schritt entlang"
  "--geschafft": "Das hat jemand erreicht"
  "--erklaert": "Das ist Hintergrundwissen"
richtzeit_s: 60
hinweise:
  - text: "Der Name sagt die Bedeutung — das ist der ganze Sinn der Benennung."
    kostet: 5
erklaerung: |
  Genau darum werden Farben nach ihrer Bedeutung benannt und nicht nach ihrem
  Aussehen. `--orange` müsste man sich merken; `--weiter` erklärt sich beim
  Lesen — und fällt sofort auf, wenn es an der falschen Stelle steht.
```

## Wo finde ich kreative Projekte?

Wenn es an die Seite geht, fehlt oft nicht die Technik, sondern die
Vorstellung: Wie **kann** so etwas aussehen? Zwei Orte helfen, und sie helfen
auf verschiedene Weise.

**[21st.dev](https://21st.dev/community/components)** — fertige
Oberflächen-Bausteine, die man ansehen und im Code nachlesen kann: Knöpfe,
Kopfbereiche, Preistafeln, Karten. Nützlich, wenn du weißt, *was* du brauchst,
aber nicht, wie man es baut.

**[Dribbble](https://dribbble.com/)** — Entwürfe von Gestalterinnen und
Gestaltern aus aller Welt. Nützlich, wenn du noch nicht weißt, was du willst:
Hier siehst du zwanzig Auffassungen derselben Aufgabe nebeneinander.

### Wie man dort richtig hinschaut

Beides sind Fundgruben und beides sind Fallen. Die Falle heißt: abschauen,
was schön aussieht, und dabei die eigene Handschrift verlieren.

**Drei Regeln, damit das nicht passiert:**

1. **Frag nach dem Warum, nicht nach dem Wie.** Nicht „diese Farbe gefällt
   mir", sondern „warum ist der Knopf hier orange und der Rest grau?". Die
   Antwort kannst du übertragen, die Farbe nicht.
2. **Halte deine Guideline daneben.** Ein Entwurf mit blau-violettem Verlauf
   ist gut gemacht — und trotzdem falsch für dich, wenn deine drei Farben
   andere sind. Was nicht zu deinem Dokument passt, ist kein Vorbild, sondern
   eine Versuchung.
3. **Nimm Struktur, nicht Oberfläche.** Die Anordnung („erst das Problem, dann
   das Angebot, dann ein Beleg") überträgt sich. Schatten, Rundungen und
   Verläufe gehören der fremden Marke.

> **Die Probe:** Wenn du am Ende erklären kannst, *warum* dein Entwurf so
> aussieht — und die Begründung in deinem Dokument steht —, hast du dich
> inspirieren lassen. Wenn nicht, hast du kopiert.

## Wie es weitergeht

Dein Dokument ist fertig, wenn du es **anwenden** kannst, ohne nachzudenken.
Das merkst du daran, dass die Prüfliste keine Überraschungen mehr bringt.

Danach ist es kein Schlusspunkt, sondern ein Werkzeug: Bei jedem neuen Bot,
jedem neuen Agenten, jeder neuen Seite ist die erste Frage nicht mehr „wie soll
das klingen?", sondern „wo hänge ich die Datei ein?".
