# PROMPTHEUS — Landingpage-Brief (scrollcraft)

Der öffentliche Auftritt vor der Anmeldung: `index.php` (Zweig `$offen`),
`assets/css/landing.css`, `assets/js/landing.js`. Der Login steht **nicht** in
der Seite, sondern in einem eigenen Schirm über dem Knopf rechts oben.

## Interview (die Antworten, aus denen gebaut wurde)

1. **Vibe:** professionell, antik-schmiedehaft, ernst aber nicht steif. Referenz
   ist das Markenbild (der gefesselte Prometheus mit dem Feuer), nicht ein
   Start-up-Look.
2. **Reise:** Held → Frage (warum eigene Aufgaben) → Methode → Substanz →
   Stufen → **Feuer-Höhepunkt** → Preise → Abschluss.
3. **Energiekurve:** ruhig-ehrfürchtig, kurze Spannung bei der Frage, sachlich
   in Methode/Substanz, ansteigend über die Stufen, ein lauter Höhepunkt, dann
   ruhig-klar bei den Preisen, fest im Abschluss.
4. **Gefühl je Akt / der eine Moment:** siehe Gefühlskurve unten. Der eine
   Moment: **Prometheus bringt das Feuer.**
5. **Das Eine, das keine andere Seite tut:** der Höhepunkt fährt das Markenbild
   beim Scrollen aus dem Dunkel heran, die Glut wächst, der Spruch entzündet
   sich Zeile für Zeile.
6. **Abstand von premium-minimal:** editorial-premium mit einem inszenierten
   Höhepunkt (nicht laut über die ganze Seite).
7. **Eine Welt oder Szenen:** getrennte Szenen mit Schnitten (kein
   durchgehender Kameraflug).
8. **Assets:** vorhandenes Markenbild (`background/promptheus-background.jpg`),
   Kursbilder, Brand Kit. Neu erzeugt (KIE.AI): eine Video-Scrubspur für den
   Höhepunkt und sechs textfreie Stufen-Stiche (die Kurs-JPGs tragen fest
   eingebrannte Titel und „GESPERRT" und taugen nicht fürs Schaufenster).

## Grammatik

**Chaptered editorial** (getrennte Szenen, harte Schnitte). Nicht „filmic
one-shot": die Reise sind Kapitel, kein einziger Kameraflug — ein Schnitt
zwischen Prometheus-Stich und Preistafel ist gewollt, nicht zu verstecken.

## Signature move

Der **Feuer-Höhepunkt**: eine angehaltene (sticky) Bühne über 300 vh. Der
Scrollfortschritt `--p` fährt entweder die Video-Scrubspur von Hand durch oder
hellt das Standbild auf, hebt den Schleier, lässt die Glut wachsen und
entzündet den dreizeiligen Spruch nacheinander. Eigenständig in `landing.js`,
die scrollcraft-Engine bleibt unangetastet.

## Gefühlskurve

| Akt | Gefühl | Was es auslöst |
|---|---|---|
| Held | Ehrfurcht, Neugier | Prometheus hinter „KI-Feuer für junge Köpfe" |
| Frage | kurzes Unbehagen | „Zusehen ist nicht können." |
| Methode | Klarheit | vier ruhige Schritte, sofortige Rückmeldung |
| Substanz | Vertrauen | deterministisch, örtlich, barrierearm |
| Stufen | Ehrgeiz | der Aufstieg vom Funken zum Meister, ein laufender Zug |
| **Höhepunkt** | **Ergriffenheit** | **das Feuer wird gebracht (der Peak)** |
| Preise | Ruhe | offene, faire Tafel auf festem Grund |
| Abschluss | Entschlossenheit | „Hol dir das Feuer." |

**Peak:** Akt 6, größte Scrollspanne der Seite; der Akt davor (Stufen) ist
leiser.

## Score (Mittel je Akt, keins zweimal hintereinander)

| Akt | Mittel |
|---|---|
| Held | Parallax |
| Frage | Pin + Zeilenaufbau |
| Methode | Wisch-Aufdecken (clip-path) |
| Substanz | gestaffeltes Raster |
| Stufen | selbstlaufender Zug (Marquee) |
| Höhepunkt | Scrub/Scrim-Fortschritt (Signature) |
| Preise | ruhiges Absetzen |
| Abschluss | fester Auflöser |

Acht Mittel, sechs Familien, keins doppelt hintereinander. Gesamtlänge ~11 vh.

## Tell-someone

„Es ist die Seite, auf der Prometheus dir beim Scrollen das Feuer bringt."

## Regeln eingehalten

Nur `var(--…)`, kein CDN/keine Webschrift/nichts nach draußen zur Laufzeit
(die KIE.AI-Assets werden einmalig erzeugt und dann örtlich ausgeliefert),
Bewegung schaltet sich bei `data-bewegung="wenig"` und `prefers-reduced-motion`
ab, Text ist echtes Markup (nichts ins Bild gebrannt), ein Höhepunkt, fester
Abschluss.
