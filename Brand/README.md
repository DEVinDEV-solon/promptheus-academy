# PROMPTHEUS ACADEMY — Brand Kit

Die Marke der Academy: Regeln, Farben, Ornamente, Marken-Dateien.

Aufgebaut mit den vier `brandkit-*`-Skills aus
[Arnie936/ai-brand-kit](https://github.com/Arnie936/ai-brand-kit) — aber mit
einer Abweichung, die alles andere prägt: **keine Fremdquelle.** Kein Google
Fonts, kein CDN, kein npm. Die Academy läuft auf 127.0.0.1 und wird von
Minderjährigen benutzt; auch eine Schriftanfrage wäre eine Anfrage nach
draussen. Wo das Kit eine Webschrift vorsieht, stehen hier Systemschriften mit
ähnlichen Massen.

## Was wo liegt

| Datei | Inhalt |
|---|---|
| **`BRAND.md`** | **die verbindliche Kurzfassung — hier anfangen** |
| `REFERENCE.md` | Herleitung: warum diese Farben, warum diese Ornamente |
| `CLAUDE.md` | Arbeitsregeln, greifen automatisch in diesem Ordner |
| `brand-helmet.html` | alle Tokens als fertiger CSS-Block für neue Seiten |
| `brand-props.json` | die sechs Paletten als Daten (aus `srv/varianten.php` erzeugt) |
| `wordmark.svg` | Schriftzug, ab 160 px Breite |
| `mark.svg` | quadratische Bildmarke, ab 16 px |
| `ornamente/` | Mäander, Palmette, Funken als lesbare Quelldateien |
| `beispiel/index.html` | lauffähige Referenz mit allen Bausteinen |

## Wie das Kit ins Programm kommt

Es dekoriert nicht, es läuft:

| Im Kit | Im Programm |
|---|---|
| Tokens aus `BRAND.md` | `assets/css/promptheus.css` (`:root`) |
| Ornamente, Glas, Lapis, Bilder | `assets/css/marke.css` |
| die sechs Paletten | `srv/varianten.php` — **einzige Quelle**, erzeugt CSS *und* Auswahlliste |
| die Kontrastregel | `tests/varianten_test.php` — 88 Prüfungen, läuft mit |

`brand-props.json` wird erzeugt, nicht gepflegt:

```bash
php -r 'require "srv/varianten.php"; /* siehe Brand/README */'
```

## Für eine Sitzung ausserhalb dieses Ordners

Das Kit lädt sich nicht von allein. Diese Zeilen an den Anfang setzen:

```
Lies zuerst C:\zarbot\tenants\admin\scripts\PROMPTHEUS\Brand\BRAND.md
und halte dich exakt daran.
Referenz: Brand\beispiel\index.html
```

## Die drei Regeln, die man sich merken muss

1. **Glut heisst „weiter", Gold heisst „geschafft".** Nie mischen.
2. **Ein Ornament je Fläche, nie über Text.**
3. **Kontrast wird gerechnet, nicht geschätzt** — mindestens 4,5:1, in allen
   sechs Varianten. Der Test sagt, ob es stimmt.
