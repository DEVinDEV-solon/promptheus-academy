# medien/96_Community — der Community-Film

Die Community-Seite (`assets/js/gemeinde.js`, `PU.gemeindeFilm`) hat in der
Titelzeile rechts den Knopf „Film ansehen“. Er öffnet ein grosses Fenster mit
diesem Film. Das Standbild dazu liegt im Programm
(`assets/img/community/community-film.jpg`), der Film kommt wie alle Aufnahmen mit dem
Medienpaket (`werkzeuge/medien_paket_bauen.php`). Fehlt der Film, zeigt das
Fenster das Standbild.

| Datei | Was |
|---|---|
| `community-film.mp4` | Rundgang durch Community und Bibliothek mit Kino-Abspann, 1920 × 1080, 25 Bilder/s, 121,5 s, mit Ton, rund 25 MB |

Der Film trägt einen eigenen Mäander-Rahmen dicht am Bildrand. Das Fenster
zeigt ihn deshalb ungeschnitten in 16:9 (`.gemeinde-film` in
`assets/css/gemeinde.css`).

Quelle: `promptheus-devindev/assets/mp3/community/promptheus-community-film.mp4`
(Bauweise im Übergabeprotokoll daneben, `UEBERGABE-COMMUNITY-FILM.md`). Holen,
vom Academy-Ordner aus:

```
copy promptheus-devindev\assets\mp3\community\promptheus-community-film.mp4 medien\96_Community\community-film.mp4
```

Das Standbild stammt aus Sekunde 86 (die Karte vor dem Abspann). Neu ziehen,
wenn sich der Film ändert:

```
ffmpeg -ss 86 -i medien\96_Community\community-film.mp4 -frames:v 1 -vf scale=1280:-1 -q:v 4 assets\img\community-film.jpg
```
