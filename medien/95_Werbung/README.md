# medien/95_Werbung — Clips für das Werbe-Modal

Das Werbe-Modal für Community und Werkstatt (`assets/js/werbung.js`) zeigt
sechs Clips aus der Shotcraft-Bibliothek. Die Standbilder dazu liegen im
Programm (`assets/img/werbung/`), die Clips kommen wie alle Aufnahmen mit dem
Medienpaket (`werkzeuge/medien_paket_bauen.php`). Fehlt ein Clip, zeigt das
Modal sein Standbild.

| Datei | Wo |
|---|---|
| `carousel-3d.mp4` | Kopf „Community“ |
| `terminal-3d.mp4` | Kopf „Werkstatt“ |
| `neon-triple-marquee.mp4`, `fracture.mp4`, `flying-words.mp4`, `cube-navigation.mp4` | Abschnitt „Die Bibliothek“ |

Quelle: `CinemaStudio/shotcraft/gallery/media/` (Shotcraft, Apache-2.0; die
Lizenz liegt der Community-Bibliothek auf dem Server bei). Holen, vom
Academy-Ordner aus:

```
for %n in (carousel-3d terminal-3d neon-triple-marquee fracture flying-words cube-navigation) do copy ..\CinemaStudio\shotcraft\gallery\media\%n.mp4 medien\95_Werbung\
```

Zusammen rund 12 MB.
