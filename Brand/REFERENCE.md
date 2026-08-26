# PROMPTHEUS ACADEMY — Herleitung

> Hintergrund zu `BRAND.md`. Hier steht das **Warum**; verbindlich ist dort das
> **Was**. Bei Widerspruch gewinnt `BRAND.md`.

## Wer das benutzt

Vier Gruppen, dieselbe Oberfläche:

| Gruppe | Alter | Was sie braucht |
|---|---|---|
| Schüler | 9–19 | grosse Klickflächen, klare Zustände, sichtbarer Fortschritt |
| Lehrkräfte | Erwachsene | Übersicht über eine Gruppe, keine Spielereien |
| Eltern | Erwachsene | in fünf Minuten verstehen, was ihr Kind tut |
| Schulleitung | Erwachsene | Zahlen, Rechnungen, Nachvollziehbarkeit |

Das ist die eigentliche Aufgabe: **edel genug für eine Schulleitung, leicht
genug für einen Neunjährigen.** Beides zugleich, nicht ein Kompromiss zwischen
beidem.

Der Weg dorthin ist nicht „bunt für Kinder, grau für Erwachsene", sondern:
**ruhige Flächen, klare Zeichen, ein starkes Bild.** Ein Kind versteht ein
Feuer sofort. Eine Schulleiterin auch — und beide finden es nicht albern.

## Warum Feuer und nicht Technik

Der Name gibt es vor: Prometheus bringt den Menschen das Feuer. Nicht als
Geschenk, sondern gegen den Willen der Götter, und er zahlt dafür.

Das ist ein besseres Bild für dieses Thema als jedes Technik-Symbol:

- **Feuer ist Werkzeug und Gefahr zugleich** — genau das, was über
  Sprachmodelle zu lernen ist.
- **Feuer wird weitergegeben.** Man verliert nichts, wenn man es teilt. Das ist
  die Aussage einer Schule.
- **Es ist keine Marketing-Metapher**, sondern 2.500 Jahre alt.

Was ausgeschlossen bleibt: Roboter, Gehirne mit Platinen, Schaltkreise, blaue
Verlaufskugeln. Nicht, weil sie hässlich wären, sondern weil sie das sind, was
Sprachmodelle am häufigsten ausgeben, wenn man sie um ein KI-Logo bittet. Eine
KI-Schule, die aussieht wie KI-Durchschnitt, hat ihre erste Lektion verfehlt.

## Warum diese Farben

**Glut (`#ff7a1c`)** — die Farbe des Feuers im Moment des Weitergebens. Warm,
aktiv, unverwechselbar. Sie darf nie grossflächig werden: eine ganze Seite in
Glut liest sich wie eine Warnung.

**Gold (`#ffc94d`)** — der Lohn. Streng getrennt von der Glut: Glut heisst „hier
geht es weiter", Gold heisst „das hast du geschafft". Wer beide mischt, nimmt
beiden die Aussage — und dann bedeutet ein goldenes Abzeichen nichts mehr.

**Lapis (`#4e82b6`)** — kam später dazu und ist die wichtigste Ergänzung. Eine
Oberfläche nur in Glut und Gold ist nach zwanzig Minuten anstrengend; jede
Fläche will etwas. Lapis ist das Gegenteil und trotzdem antik: das Blau der
Wandmalerei, nicht das Blau der Softwarebranche. Es trägt alles, was erklärt
statt bewertet.

Damit hat die Academy **drei Farben mit drei Aussagen** — genug, um Zustände zu
unterscheiden, wenig genug, um eine Handschrift zu bleiben.

## Warum sechs Varianten, und warum ab Werk aus

Ein freier Farbwähler wäre einfacher zu bauen und eine schlechtere Lösung: dann
stellt jemand Gelb auf Weiss und liest nichts mehr. Sechs geprüfte Paletten
sind der Mittelweg — Auswahl ja, Unlesbarkeit nein.

Ab Werk stehen sie **aus**. Eine Academy mit sechs Gesichtern hat keins. Sie
werden zugeschaltet, wenn eine Schule einen Grund hat: ein Bildschirm im
Sonnenlicht braucht Marmor, eine fünfte Klasse mag Funkenflug lieber als
Schmiede.

**Jede Palette ist gerechnet, nicht geschätzt.** Beim Schreiben von
`tests/varianten_test.php` fielen vier von sechs durch — darunter die Vorgabe:
`--schrift-3` lag bei 4,0:1 statt 4,5. Das war kein neuer Fehler, sondern ein
alter, den vorher niemand gemessen hatte. Er steckte seit der ersten Fassung im
Programm und betraf jeden Hinweistext auf jeder Seite.

Das ist der eigentliche Wert des Tests: Nicht, dass er neue Paletten prüft,
sondern dass er die alte durchfallen liess.

## Warum keine Webschrift

Die Academy läuft auf 127.0.0.1 und wird von Minderjährigen benutzt. Eine
Schriftanfrage an Google Fonts ist eine Anfrage nach draussen — mit IP-Adresse,
Zeitstempel und Herkunftsseite. Für eine Schulsoftware ist das kein Detail,
sondern die Frage, ob man sie einsetzen darf.

Deshalb Systemschriften mit ähnlichen Massen: Iowan Old Style / Palatino für
den Inhalt, Segoe UI für die Bedienung. Der Unterschied zu einer geladenen
Schrift ist auf einem Bildschirm klein; der Unterschied in der Datenschutzakte
ist gross.

Dieselbe Regel hat die Hintergrundanimation geprägt. Die Vorlage war eine
React-Komponente mit three.js — 600 KB aus dem Netz. Übernommen wurde der
GLSL-Kern, der Rest ist selbst geschrieben: 90 Zeilen reines WebGL, die
dasselbe tun. **Wenn eine Vorlage eine Bibliothek verlangt, nimmt man den Kern
und schreibt den Rest.**

## Warum Ornamente

Ohne sie sieht die Oberfläche aus wie jedes andere dunkle Dashboard: Karten,
Rahmen, Fortschrittsbalken. Der Mäander macht daraus etwas mit Herkunft.

Drei Regeln halten das davon ab, in Tapete umzuschlagen:

1. **Eines je Fläche.** Zwei Muster übereinander sind Unruhe, keine Zierde.
2. **Nie über Text.** Ornament liegt hinter dem Inhalt, immer.
3. **Die Palmette ist reserviert** — nur, wo etwas geschafft wurde. Ein
   Ornament, das überall erscheint, sagt nichts mehr.

Technisch laufen alle drei als **Maske**, nicht als Bild. Das ist der Grund,
warum sie in allen sechs Varianten stimmen: die Fläche darunter gibt die Farbe,
ein Token die Deckkraft. Als Bild bräuchte man sechs Fassungen von jedem — und
hätte fünf davon irgendwann vergessen.

## Warum das Hintergrundbild nur zu 20 % sichtbar ist

Ein Bild hinter Text ist fast immer ein Fehler. Hier funktioniert es, weil drei
Dinge zusammenkommen:

- Es **bewegt sich nicht** (`background-attachment: fixed`). Was mitscrollt,
  zieht das Auge; was steht, wird zur Wand und verschwindet.
- Es ist **ein dunkler Stich**, kein Foto. Wenig Farbe, wenig Detail in den
  Mitteltönen.
- Der **Schleier deckt 80 %**. Man liest es nicht, man ahnt es.

Im hellen Thema sind es nur 9 %: derselbe dunkle Stich sticht auf hellem Papier
viel stärker heraus. Dieselbe Zahl für beide wäre im Hellen eine Wand.

## Warum die Kartenbilder einen schrägen Verlauf haben

Naheliegend wäre ein gleichmässiger Deckel über dem ganzen Bild. Der macht das
Bild aber überall gleich schwach — und der Text ist trotzdem an manchen Stellen
schlecht lesbar, weil Bilder ungleichmässig sind.

Der schräge Verlauf löst beides: links, wo der Text steht, ist er fast deckend;
zur rechten unteren Ecke lässt er das Bild durch. Das Bild bleibt deutlich
sichtbar, der Text steht auf ruhigem Grund.

Die vier Stopps sind für **alle 17 Bilder** durchgerechnet: mittlere Farbe in
zehn senkrechten Streifen, mit dem Schleier gemischt, Kontrast gegen
`--schrift`. Ergebnis 7,4:1 im Dunkeln, 7,5:1 im Hellen — beides über AAA.

Eine mutigere Kurve (Bild zu 68 % sichtbar) ergab im Hellen 3,3:1. Deshalb zwei
verschiedene Kurven statt einer.

## Was bewusst nicht entschieden wurde

- **Kein Logo mit Symbol neben dem Namen.** Die Wortmarke trägt allein; die
  Flamme in `mark.svg` steht getrennt und darf fehlen.
- **Keine Illustrationsrichtung.** Es gibt Kursbilder, aber keinen definierten
  Stil für neue — das wäre eine eigene Runde.
- **Keine Bewegungssprache.** Ausser der Hintergrundanimation bewegt sich
  nichts, und das soll so bleiben.
