# Arbeitsregeln für diesen Ordner

Diese Datei greift automatisch, sobald in `Brand/` oder an der Gestaltung von
PROMPTHEUS ACADEMY gearbeitet wird. Sie regelt nur den Umgang mit den anderen
Dateien.

## Was gilt

1. **`BRAND.md` gewinnt.** Bei jedem Widerspruch zwischen einer Datei hier und
   dem, was im Programm steht, gilt `BRAND.md`. Weicht der Code ab, ist der
   Code der Fehler — nicht die Regel.

2. **Nur definierte Tokens.** Im Layout stehen `var(--…)`, nie rohe Hexwerte.
   Fehlt ein Token für etwas, wird es in `BRAND.md` aufgenommen und in
   `assets/css/marke.css` definiert, bevor es benutzt wird.

3. **Änderungen am Kit sind abzustimmen.** Eine Farbe, ein Ornament, ein Mass
   hier zu ändern, ändert das Aussehen des ganzen Programms. Das ist keine
   Nebenarbeit an einer Aufgabe.

4. **Neue Farbe heisst neue Messung.** Wer eine Palette anlegt oder einen Wert
   ändert, lässt `tests/varianten_test.php` laufen. Er prüft neun
   Farbpaarungen je Variante gegen 4,5:1 und ist die einzige Instanz, die
   „sieht gut aus" von „ist lesbar" trennt.

5. **Keine Fremdquelle.** Kein CDN, keine Webschrift, kein externes Bild, kein
   npm-Paket. Die Academy läuft auf 127.0.0.1 und wird von Minderjährigen
   benutzt: es geht nichts hinaus. Wenn eine Vorlage eine Bibliothek verlangt,
   wird der Kern übernommen und der Rest selbst geschrieben — so wie bei der
   Hintergrundanimation, die aus einer three.js-Komponente kam und heute
   reines WebGL ist.

## Wo was liegt

| Datei | Inhalt |
|---|---|
| `BRAND.md` | die verbindliche Kurzfassung — das Herzstück |
| `REFERENCE.md` | Herleitung und Hintergrund, zum Nachschlagen |
| `brand-helmet.html` | alle Tokens als fertiger CSS-Block für neue Seiten |
| `brand-props.json` | die Varianten als Datei, für Design-Werkzeuge |
| `wordmark.svg` | Schriftzug, Standardfall, ab 160 px Breite |
| `mark.svg` | quadratische Bildmarke, ab 16 px |
| `ornamente/` | die drei Muster als lesbare Quelldateien |
| `beispiel/index.html` | lauffähige Referenz mit allen Bausteinen |

Im Programm selbst:

| Datei | Inhalt |
|---|---|
| `assets/css/promptheus.css` | die Bausteine — Knöpfe, Karten, Raster |
| `assets/css/marke.css` | die Marke — Ornamente, Lapis, Glas, Bilder |
| `srv/varianten.php` | die sechs Paletten, **einzige Quelle** |
| `tests/varianten_test.php` | die Kontrastprüfung |

## Für Arbeit ausserhalb dieses Ordners

Diese Zeilen an den Anfang einer Sitzung setzen:

```
Lies zuerst C:\zarbot\tenants\admin\scripts\PROMPTHEUS\Brand\BRAND.md
und halte dich exakt daran.
Referenz: Brand\beispiel\index.html
```

Das Kit lädt sich nicht von allein.
