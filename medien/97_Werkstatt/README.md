# medien/97_Werkstatt — der Erklärfilm zur Werkstatt

Das Fenster hinter dem Menüpunkt „Werkstatt“ (`assets/js/werkstatt.js`,
`werkstattFilm()`) zeigt unter den beiden Blöcken und dem Mäanderband diesen
Film. Das Standbild liegt im Programm (`assets/img/werkstatt-film.jpg`), der
Film kommt wie alle Aufnahmen mit dem Medienpaket
(`werkzeuge/medien_paket_bauen.php`). Fehlt der Film, zeigt das Fenster das
Standbild.

| Datei | Was |
|---|---|
| `werkstatt-film.mp4` | Erklärfilm, Sprecher Hephaistos: der 7. Kurs, der Zugang mit Ticket, Schlüssel und Fingerabdruck, Sicherheit, der Weg in die Community. 1280 × 720, 30 Bilder/s, 2:20, mit Ton, rund 9 MB |

Quelle: `promptheus-devindev/assets/mp3/werkstatt/film/renders/werkstatt-film-web.mp4`
(Hyperframes-Projekt mit Anleitung in `film/LIESMICH.md`). Holen, vom
Academy-Ordner aus:

```
copy promptheus-devindev\assets\mp3\werkstatt\film\renders\werkstatt-film-web.mp4 medien\97_Werkstatt\werkstatt-film.mp4
```

Das Standbild ist Sekunde 9 (Titel „DIE WERKSTATT“):

```
ffmpeg -ss 9 -i promptheus-devindev\assets\mp3\werkstatt\film\renders\werkstatt-film.mp4 -frames:v 1 -vf scale=1280:-1 -q:v 4 assets\img\werkstatt-film.jpg
```
