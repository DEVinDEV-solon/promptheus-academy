# Aufnahmen zu dieser Etappe

Drei Formen, ein Stoff. Die Dateinamen bestimmen die Reihenfolge.

| Datei | Was | Wo es erscheint |
|---|---|---|
| `01_referat.mp3` | langes Referats-Audio, ganzes Referat zum Anhören | Hörfolge, oben in der Liste |
| — | der gesprochene Text dazu | liegt **nicht hier**, sondern unter `vps\assets\video\geschichte-der-ki-entwicklung\<etappe>\01_text\` |
| `video.mp4` | Motionvideo (HyperFrames) | Videoplayer über der Hörfolge |
| `02_dia.mp4` | Präsentationsvideo als Diashow mit Ton (NotebookLM) | *noch nicht darstellbar* — die Spalte zeigt heute nur **ein** Video je Ordner |

## Warum das so aufgeteilt ist

Der Player liest den Ordner, es gibt keine Zuordnungsdatei. Alles, was mit
`.mp3`, `.m4a`, `.ogg`, `.opus` oder `.wav` endet, erscheint in der Hörfolge;
die führende Nummer macht die Reihenfolge. `titel.md` gibt den Aufnahmen
lesbare Namen — ohne sie steht der Dateiname da.

## Wenn das Diashow-Video dazukommt

Sobald die Medienspalte mehrere Videos kann, liegen die beiden Filme
nebeneinander im selben Ordner: `01_motion.mp4` (HyperFrames) und
`02_dia.mp4` (Diashow). Die Nummer ist dann die Reihenfolge, nicht der Name.
