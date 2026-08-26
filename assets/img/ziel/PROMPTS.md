# Fotos der Zielseite — Auftragstexte

**Stand 23.08.2026: alle fünf Bilder sind erzeugt und liegen hier.** Was folgt,
ist die Anleitung, um sie nachzubauen oder zu ersetzen — nicht eine offene
Aufgabe.

Fünf Stellen der Zielseite (`assets/js/ziel.js`) nehmen ein Foto entgegen.
Liegt die Datei hier, wird sie gezeigt; fehlt sie, bleibt die Zeichnung aus
`assets/js/zielbilder.js` stehen. Die Seite ist also in beiden Fällen fertig —
ein Foto macht sie wärmer, es rettet sie nicht.

Erzeugt mit `kie.mjs still` (Modell nach Vorgabe des Skripts), danach mit
ffmpeg auf 1400 px (Aufmacher) bzw. 1200 px Breite verkleinert und als JPEG
gespeichert:

```bash
ffmpeg -y -i roh.png -vf "scale=1200:-2" -q:v 4 assets/img/ziel/name.jpg
```

Zusammen wiegen alle fünf 444 KB. Die Rohdateien waren je rund 7 MB — ein
Bild, das siebenmal so schwer ist wie die ganze Seite, ist kein Bild, sondern
eine Wartezeit.

| Datei | Abschnitt |
|---|---|
| `kopf.jpg` | Aufmacher, rechts neben der Überschrift |
| `schule.jpg` | Für die Schule |
| `lehrer.jpg` | Für Lehrende |
| `eltern.jpg` | Für Eltern |
| `schueler.jpg` | Für Lernende |

**`kopf.jpg` ist das einzige Werbebild der Seite.** Die anderen vier sind
Atmosphäre; dieses hier steht neben dem Satz, um den es geht, und wird als
erstes gesehen. Es darf deshalb inszenierter sein als die übrigen — aber es
bleibt eine Aufnahme, keine Grafik: kein Text, keine Symbole, keine
Bildschirme mit erfundenen Oberflächen.

## Der gemeinsame Vorspann

**Wörtlich in jedes Bild übernehmen, nicht umformulieren.** Dass sechs
getrennte Bilder wie eine Aufnahmeserie wirken, kommt allein daher — ein
umgeschriebener Vorspann ergibt eine zweite Serie.

```
Documentary editorial photograph, natural available light from a side window,
warm neutral palette of parchment, oak and terracotta with a single ember-orange
accent. Shallow depth of field, 35mm, eye level. Unposed, quiet, ordinary German
setting. Muted colours, film grain, no gloss.
```

## Verbote

Sie kommen aus `Brand/BRAND.md` und gelten hier genauso:

- keine blau-violetten Verläufe — das ist die Farbe, die Modelle ab Werk ausgeben
- keine Roboter, Gehirne, Platinen, Schaltkreise, Verlaufskugeln
- kein Text im Bild; Schrift steht als Markup daneben
- keine Bildschirme mit erfundenen Oberflächen darauf
- keine gestellten Lächel-Aufnahmen, kein Bestandsfoto-Gefühl

## Die fünf Szenen

**kopf.jpg** (16:9) — Eine Werkstattbank von schräg oben. In der Mitte ein
aufgeschlagenes, handbeschriebenes Notizheft; darum herum, sauber ausgelegt,
vier fertige Druckstücke im selben Papier und derselben Farbe: ein Briefbogen,
eine Karte, ein Faltblatt, ein Aufkleber. Warmes Seitenlicht, ein einzelner
oranger Farbtupfer auf jedem Stück. Keine Hände, kein Gesicht, kein
Bildschirm. Die Aussage der Aufnahme: **eine Handschrift, viele Ausgaben.**

## Die vier Atmosphären

**schule.jpg** — Ein Schulflur am späten Nachmittag, leer. An der Pinnwand
hängen mehrere Aushänge, erkennbar im selben Zuschnitt und derselben
Papierfarbe. Ein Fenster wirft Licht auf den Boden.

**lehrer.jpg** — Ein Lehrerarbeitsplatz von oben: Arbeitsblätter, ein Stift,
eine Kaffeetasse, ein aufgeschlagener Ordner. Hände am Bildrand, kein Gesicht.

**eltern.jpg** — Eine Werkbank oder ein Ladentresen eines kleinen Betriebs,
darauf ein Notizbuch mit handschriftlichen Zeilen und ein Stapel Briefbögen.
Handwerklich, benutzt, nicht aufgeräumt.

**schueler.jpg** — Ein Schreibtisch im Jugendzimmer am Abend: Schulheft,
Kopfhörer, Skizzenblatt mit Farbfeldern, eine kleine Lampe. Niemand im Bild.

## Erzeugen

Braucht `KIE_AI_API_KEY` in der Umgebung.

```bash
node "$SKILL/scripts/kie.mjs" still "<Vorspann>\n\n<Szene>" assets/img/ziel/schule.jpg --ar 4:3
```

Danach jedes Bild ansehen, bevor es bleibt. Ein Bild, das den Vorspann verfehlt,
fällt in der Reihe sofort auf — und die Reihe ist der ganze Zweck.
