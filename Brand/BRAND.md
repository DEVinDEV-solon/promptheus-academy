# PROMPTHEUS ACADEMY — Brand Kit

> Die verbindliche Kurzfassung. Was hier steht, gilt. Was hier nicht steht,
> steht in `REFERENCE.md` und ist Hintergrund, keine Regel.

## Die Marke in einem Satz

PROMPTHEUS ACADEMY bringt Menschen zwischen neun und neunzig bei, wie
Sprachmodelle wirklich arbeiten — durch eigene Aufgaben statt durch Videos.

**Persönlichkeit:** ernsthaft, aber nicht steif. Antik, aber nicht museal.
Sie erklärt, statt zu beeindrucken.

**Das eine Bild:** Prometheus bringt das Feuer. Nicht ein Roboter, nicht ein
Gehirn mit Platinen, nicht ein blau-violetter Verlauf. Wer die Academy sieht,
soll an eine Schmiede denken, nicht an ein Start-up.

## 1. Tokens

Alle Farben stehen als CSS-Variablen in `assets/css/promptheus.css` (Basis) und
`assets/css/marke.css` (Marke). **Im Layout stehen nur `var(--…)`, nie rohe
Hexwerte.** Eine Farbänderung ist dann eine Zeile.

### Vorgabe-Palette „Schmiede" (dunkel)

| Variable | Wert | Rolle |
|---|---|---|
| `--grund` | `#14110f` | die Grundfläche |
| `--grund-2` | `#1c1815` | Karten, Kopfleiste |
| `--grund-3` | `#262019` | Eingabefelder, stille Knöpfe |
| `--rand` | `#3a3129` | 1-px-Rahmen |
| `--rand-hell` | `#504338` | kräftigerer Rahmen |
| `--schrift` | `#ede5db` | Haupttext |
| `--schrift-2` | `#b3a596` | Zweittext, Beschriftungen |
| `--schrift-3` | `#8b8178` | Hinweise, Metadaten |
| `--glut` | `#ff7a1c` | **Akzent** — Links, Hauptknopf, Fortschritt |
| `--glut-hell` | `#ffa347` | Verlauf, Hover |
| `--glut-tief` | `#c14e00` | Zitatstrich, Ornament im Hellen |
| `--gold` | `#ffc94d` | **Erfolg** — Punkte, Ränge, Abzeichen |
| `--lapis` | `#4e82b6` | **Ruhe** — Wissenskästen, Tutorkarten, Zitate |
| `--gut` / `--schlecht` / `--warn` | `#5fbf7a` / `#e8635a` / `#e5b34a` | nur Zustände |

### Flächenverteilung

| Fläche | Anteil | Regel |
|---|---|---|
| Grundflächen (`--grund`, `--grund-2`, `--grund-3`) | ~85 % | tragen alles |
| Glut | **unter 8 %** | nie als Sektionshintergrund, nie als grossflächiger Verlauf |
| Gold | **unter 4 %** | nur, wo etwas gelungen ist |
| Lapis | ~5 % | nur erklärende Flächen |

**Glut und Gold sind nicht austauschbar.** Glut heisst „hier geht es weiter",
Gold heisst „das hast du geschafft". Wer sie mischt, nimmt beiden die Aussage.

### Farbe trägt nie allein eine Aussage

Richtig und falsch stehen **immer** zusätzlich als Wort und als Zeichen (✓ / ✕)
da. Ohne diese Regel ist die Academy für Rot-Grün-Blinde unbenutzbar — und das
sind rund 8 % der Jungen in jeder Klasse.

### Kontrast: gemessen, nicht geschätzt

| Was | Schwelle | Warum |
|---|---|---|
| Haupttext, Akzente, Gold | **4,5:1** (AA) | Fliesstext ab 16 px |
| **`--schrift-3`** — Hinweise, Beschreibungen | **7:1** (AAA) | steht in 0,86 rem ≈ 13,8 px |

Die zweite Zeile kam aus dem Betrieb: alle sechs Paletten lagen bei 4,6:1,
formal in Ordnung — und die Rückmeldung lautete „grau ist manchmal ganz
schlecht zu lesen". Sie war berechtigt. Für so kleinen Text ist die
AA-Schwelle zu knapp; jetzt gilt AAA, und alle sechs erreichen 7,0–7,1:1.

`tests/varianten_test.php` rechnet beide Schwellen für alle Paletten nach und
schlägt fehl, wenn eine darunter rutscht. Eine Palette, die schön aussieht und
die man nicht lesen kann, kommt nicht durch.

## 2. Die sechs Farbvarianten

Steht die Academy-Regel `farbvarianten` auf **an**, erscheint im Kopf ein
Farbwähler. Die Paletten stehen in `srv/varianten.php` — **eine Quelle**, aus
der sowohl die Auswahlliste als auch das CSS entsteht.

| Variante | Grundton | Partner | Wofür |
|---|---|---|---|
| **Schmiede** | dunkel ☾ | Pergament | die Vorgabe |
| **Pergament** | hell ☀ | Schmiede | Tageslicht, Papiergefühl |
| **Olymp** | dunkel ☾ | Marmor | Nachtblau, ruhig für lange Sitzungen |
| **Marmor** | hell ☀ | Olymp | kühl, sehr ruhig |
| **Terrakotta** | dunkel ☾ | Pergament | warm, erdig |
| **Funkenflug** | dunkel ☾ | Marmor | kräftig, für die jüngeren Stufen |

**Eine Palette ist hell oder dunkel — das ist keine zweite Einstellung.**
„Olymp in hell" gibt es nicht; das wäre eine andere Palette. Deshalb trägt jede
einen `partner` auf der anderen Seite, und der ☀/☾-Knopf wechselt dorthin.

Sind Varianten **aus**, gilt wieder die gewöhnliche Themawahl — dann steht kein
Variantenblock im Dokument, der sie überschreiben könnte.

Ab Werk ist die Regel **aus**: eine Academy mit sechs Gesichtern hat keins.
Sie wird zugeschaltet, wenn eine Schule sie braucht.

### Feineinstellung

Unter den Paletten steht eine zugeklappte Feineinstellung mit genau zwei
Reglern und drei Farbfeldern — mehr wäre ein zweites Einstellungsfenster im
Kopf.

| Stellschraube | Wirkung | Vorgabe |
|---|---|---|
| **Hintergrundbild** 0–100 % | `--bild-faktor` | 100 % |
| **Bilder auf Karten** 0–100 % | `--karten-faktor` | 100 % |
| **Glut · Gold · Lapis** | `--glut` · `--gold` · `--lapis` | die der Palette |
| **Titel · Untertitel · Beschreibung** | `--schrift` · `--schrift-2` · `--schrift-3` | die der Palette |

Die drei Schriftstufen sind **getrennt** einstellbar, weil sie verschiedene
Aufgaben haben: der Titel darf kräftig sein, die Beschreibung soll zurücktreten
— aber nur so weit, dass man sie noch liest. Wer die Beschreibung heller haben
will, soll dafür nicht den Titel mitziehen müssen.

**Beide Regler sind Faktoren, keine festen Werte.** Das Hintergrundbild ist je
nach Ort verschieden stark — Seite 20 %, Tor 30 %, Tor mit Animation 42 %. Ein
fester Wert am Dokument hätte diese Abstufung plattgemacht; ein Faktor
multipliziert, was an der jeweiligen Stelle steht.

Bei den Kartenbildern wird auf der **Lücke zum Deckenden** gerechnet:
`1 − (1 − Stopp) × Faktor`. Bei 0 stehen alle vier Stopps auf 1 — die Karte ist
zu, kein Bild. Der Kontrast kann dabei nur besser werden, nie schlechter: die
gemessenen 7:1 sind der schlechteste Fall.

**Nur die Akzente sind frei wählbar, nie die Grundflächen.** Wer den Grund
selbst setzt, macht seine Seite irgendwann unlesbar; ein Akzent kann kaum so
danebengehen. Zusätzlich rechnet die Oberfläche live den Kontrast gegen den
Grund und warnt unter 4,5:1 — sie verbietet nichts, aber sie nennt die Zahl.

## 3. Typografie

**Keine Webschrift.** Die Academy läuft auf 127.0.0.1 und wird von
Minderjährigen benutzt; auch eine Schriftanfrage ist eine Anfrage nach draussen.
Es gelten Systemschriften mit ähnlichen Massen.

| Rolle | Stapel | Wofür |
|---|---|---|
| `--serif` | Iowan Old Style · Palatino Linotype · Palatino · Georgia | Überschriften, Wortmarke, Lehrtext |
| `--sans` | Segoe UI · system-ui · Roboto · Helvetica | Oberfläche, Knöpfe, Tabellen |
| `--mono` | Cascadia Mono · Consolas · SF Mono · Menlo | Code, Token, Zahlen |

### Grössen

| Element | Grösse | Zeilenhöhe |
|---|---|---|
| h1 | 2 rem | 1.25 |
| h2 | 1.45 rem | 1.25 |
| h3 | 1.15 rem | 1.25 |
| Fliesstext | 1 rem (16 px) | 1.6 |
| `.klein` | 0.86 rem | 1.5 |
| `.hinweis` | 0.86 rem, `--schrift-3` | 1.5 |

Die Serife trägt den **Inhalt**, die Grotesk die **Bedienung**. Ein Knopf in
Palatino sieht aus wie eine Überschrift, die man versehentlich anklicken kann.

## 4. Raster, Abstände, Radien

| Mass | Wert |
|---|---|
| Inhaltsbreite | 1180 px (`--breit`) |
| Seitenrand Desktop | 1.2 rem |
| Abstandsreihe | .15 · .3 · .45 · .6 · .9 · 1.2 · 1.6 · 2.4 rem |
| Radius Standard | 10 px (`--radius`) |
| Radius klein | 6 px (`--radius-klein`) — Knöpfe, Felder |
| Radius Torkarte | 16 px |
| Rahmen | immer 1 px, `--rand`; bei hohem Kontrast 2 px |
| Schatten | `0 2px 10px rgba(0,0,0,.45)` — genau einer, kein zweiter |

## 5. Ornamente

Drei Muster, alle als **SVG-Maske**, nie als Bild: die Fläche darunter gibt die
Farbe, ein Token die Deckkraft. Dadurch stimmt dasselbe Muster in jeder
Variante, ohne zweimal zu existieren.

| Ornament | Kachel | Wo | Deckkraft |
|---|---|---|---|
| **Mäander** | 32 px | Kopfleiste (8 px Kante), Zierbänder | .16 – .30 |
| **Palmette** | 72 px | nur Feierflächen: verdiente Abzeichen, Rangkarte | .09 – .14 |
| **Funken** | 96 px | ganzflächiger Grund, Tor | .02 – .10 |

**Die harte Regel:** höchstens **ein** Ornament je Fläche, und nie über Text.
Ein Muster auf jeder Fläche ist Tapete, und Tapete ist das Gegenteil von edel.

Die Palmette ist reserviert. Sie erscheint **nur**, wo etwas geschafft wurde —
sonst verliert sie ihre Bedeutung und wird Dekoration.

## 6. Bilder

### Hintergrundbild

`assets/img/background/promptheus-background.jpg` — Prometheus, gefesselt, mit
dem Feuer. Liegt fest hinter jeder Seite (`background-attachment: fixed`,
`cover`), sichtbar zu **20 %** im Dunkeln, **9 %** im Hellen. Der Text läuft
darüber.

Regelbar über `--bild-staerke`. **0 schaltet es aus** — es darf nie nötig sein,
Code anzufassen, um ein Bild loszuwerden.

### Kartenbilder

Jeder Kurs trägt sein Bild aus `assets/img/kurse/<ordnername>.jpg`. Die
Zuordnung ist eine **Regel, kein Katalog**: der Ordnername des Kurses ergibt
den Dateinamen (`01_Entdecker` → `entdecker.jpg`).

Darüber liegt ein **schräger Schutzverlauf** (115°), links fast deckend, zur
rechten unteren Ecke durchlässig. Die vier Stopps sind für alle Bilder
durchgerechnet und halten überall 7:1:

| | 0 % | 38 % | 72 % | 100 % |
|---|---|---|---|---|
| dunkel | .96 | .90 | .66 | .42 |
| hell | .97 | .94 | .80 | .62 |

Zwei verschiedene Kurven, weil die Bilder dunkle Stiche sind: auf schwarzem
Grund helfen sie dem hellen Text, auf hellem Papier fressen sie den dunklen.
Dieselbe Kurve für beide ergab im Hellen 3,3:1 — unlesbar.

## 7. Bausteine

| Baustein | Mass |
|---|---|
| Karte | Radius 10, Rahmen 1 px, Polster 1rem 1.1rem, Fläche `--glas` |
| Hauptknopf | Polster .55rem 1.1rem, Verlauf glut-hell → glut, Text `--grund` |
| Stiller Knopf | Fläche `--grund-3`, Rahmen `--rand-hell`, Text `--schrift` |
| Absendeknopf | 2.55 rem im Quadrat, Pfeil `➤`, kein Text |
| Wissenskasten | 3 px Lapis links, Fläche `--lapis-flor` |
| Fortschrittsbalken | 6 px hoch, Verlauf glut → gold |
| Zierband | genau eine Kachelhöhe (32 px, fein: 16 px) |
| Textkarte | Fläche 82 %, Radius 10, **kein Rahmen, kein Schatten** |

### Textkarten

Kein Text steht frei auf dem Grund. Überschrift und die Absätze darunter kommen
gemeinsam in eine `.textkarte` — automatisch, über `assets/js/textkarten.js`.

Die Fläche ist **bewusst schwächer als eine Karte**: nur so viel Deckung, dass
der Text steht. Sonst zerfiele die Seite in lauter gleich starke Kästen, und
man sähe nicht mehr, was ein Kurs ist und was eine Zwischenüberschrift.

Eine einzelne kurze Zeile bekommt keine Karte — ein Kasten um drei Wörter sieht
aus wie ein Fehler.

## 8. Text

**Sprache:** Deutsch, `ss` statt `ß` im Programmtext, Sie-Form nirgends — die
Academy duzt, auch die Schulleitung.

**Ansprache:** Sag, was ist. Kein Marketing, keine Ausrufezeichen, keine
Superlative.

> **Gut:** „Noch 3 von 6 Stufen."
> **Schlecht:** „Wow, du bist schon so weit gekommen! 🎉 Weiter so!"

> **Gut:** „Es ist kein Mikrofon angeschlossen. Der Browser fragt deshalb auch
> nicht nach Erlaubnis."
> **Schlecht:** „Fehler beim Zugriff auf das Mikrofon."

**Jede Fehlermeldung nennt einen Weg.** „Geht nicht" ohne „so geht es" ist
keine Meldung, sondern eine Sackgasse.

### Verbotsliste Text

- „einfach", „schnell", „mühelos" — wer es nicht schafft, fühlt sich dumm
- „Lass uns …", „Gemeinsam …" — die Academy ist kein Mitbewohner
- Ausrufezeichen ausser bei echter Gefahr
- Emoji im Fliesstext; erlaubt sind sie als Zeichen an Agenten, Rängen, Abzeichen
- Fachbegriffe ohne Erklärung beim ersten Mal
- Verweise auf den SecondBrain-Vault in allem, was Lernende sehen

## 9. Nicht benutzen

- **Blau-violette Verläufe.** Das ist die Farbe, die Sprachmodelle am
  häufigsten ausgeben. Wir haben Feuer.
- **Roboter, Gehirne, Platinen, Schaltkreise, Verlaufskugeln** als Symbol
- **Mehr als ein Schatten.** Es gibt genau einen, und der ist definiert.
- **Farbe als einzige Aussage** (siehe 1.)
- **Webschriften, CDN-Skripte, externe Bilder** — jede Fremdquelle ist eine
  Anfrage nach draussen
- **Ornament über Text** oder mehr als eines je Fläche
- **Gold für etwas, das nicht verdient wurde**
- **Rohe Hexwerte im Layout** statt `var(--…)`
- **Die Wortmarke im Quadrat.** Dafür gibt es `mark.svg`.

## 10. Prüfliste vor dem Abgeben

1. Stehen im Layout nur `var(--…)` und keine rohen Hexwerte?
2. Liegt jeder Text über 4,5:1 gegen seine Fläche — auch über Bildern?
3. Trägt irgendwo Farbe allein eine Aussage?
4. Höchstens ein Ornament je Fläche, keines über Text?
5. Gold nur, wo etwas geschafft wurde?
6. Sieht die Seite in **allen sechs** Varianten richtig aus, hell wie dunkel?
7. Läuft sie ohne Fremdquelle — kein CDN, keine Webschrift, kein externes Bild?
8. Funktioniert sie mit `data-bewegung="wenig"` (keine Animation, schwächere
   Ornamente)?
9. Nennt jede Fehlermeldung einen Weg?
10. Laufen die Tests grün — besonders `tests/varianten_test.php`?
