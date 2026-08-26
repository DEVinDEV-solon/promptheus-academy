# Muster-Seite Login & Rechte — der Entwurf

Diese drei Dateien sind der **Entwurf**, aus dem die Rechte-Matrix der Academy
entstanden ist. Sie laufen ohne Server (`index.html` im Browser öffnen) und
halten nichts fest: jeder Klick lebt nur im Fenster.

**Das Laufende steht woanders:**

| Was | Wo |
|---|---|
| Ebenen, Matrix, Prüfung | `srv/rechte.php` |
| Schalterfeld in der Academy | Einstellungen › Login & Rechte (`assets/einstellungen.js`) |
| Wachen an den Aktionen | `api.php` |
| Prüfungen | `tests/rechte_test.php` |

Der Entwurf weicht an drei Stellen ab, und das mit Absicht — er wird nicht
nachgezogen, sondern bleibt als das liegen, was er war:

* Ebene 2 heisst hier `schule`, im Programm `verwaltung`.
* `bibliothek.manage` gibt es im Programm nicht mehr (die Bibliothek ist raus).
* Die Admin-Spalte ist hier schaltbar. Im Programm ist sie festgenagelt —
  sonst könnte Ebene 1 sich selbst aussperren.
