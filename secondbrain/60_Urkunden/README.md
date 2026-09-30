---
type: index
title: "🎓 Urkunden — Vorlagen der Abschluss-Urkunde"
description: "Drei Gruppen, beliebig viele Varianten. Jede Variante ist ein Ordner mit vorlage.json, optional hintergrund.jpg und ihrem Bildprompt."
tags: [urkunde, vorlage, design]
---

# Urkunden-Vorlagen

Die Abschluss-Urkunde nach allen sechs Stufen wird in drei Schritten erstellt:

1. **Design wählen** — eine Variante aus einer der drei Gruppen.
2. **Namen eintragen** — mit Warnung, Bestätigung, danach unveränderlich.
3. **Ansehen, anpassen, drucken** — am eigenen Drucker oder als PDF.

Name und Prüfcode sind fest und versiegelt. **Das Design gehört dem Teilnehmer**
und lässt sich jederzeit ändern — innerhalb der Grenzen, die jede Vorlage setzt.

## Ordner

| Ordner | Gruppe | Schmuck ohne Bild |
|---|---|---|
| `01_schlicht/` | Schlicht & sachlich | Farbband links, feiner Rahmen |
| `02_historisch-siegel/` | Historisch mit Siegel | Pergament, Ranken, rotes Wachssiegel |
| `03_historisch-blumen/` | Historisch mit Blumen | Pergament, Rosen in zwei Ecken, Goldranken |
| `_unterschriften/` | Prometheus · Athena · Hermes | Linie mit Namen, bis die PNG da sind |

Jede Gruppe hat eine `_system-bildprompt.md` — die Regeln, die für **jedes** Bild
dieser Gruppe gelten. Jede Variante hat ihre eigene `hintergrund-bildprompt.md`.

## Eine neue Variante anlegen

1. Ordner in der passenden Gruppe anlegen, Name nur `a-z 0-9 - _`,
   z. B. `02_historisch-siegel/eichenlaub/`.
2. `vorlage.json` aus einer Nachbarvariante kopieren und anpassen.
3. Bildprompt schreiben (Vorlage: die Nachbarvariante), Bild erzeugen, als
   `hintergrund.jpg` (oder `.png`/`.webp`, höchstens 12 MB) daneben legen.
4. Fertig — die Academy findet die Variante beim nächsten Öffnen von Schritt 1.

Ohne `hintergrund.*` zeichnet die Academy den Schmuck der Gruppe selbst.

## vorlage.json

```json
{
  "name": "Pergament",
  "beschreibung": "Ein Satz für die Auswahl.",
  "farben": { "papier": "#efe0bf", "schrift": "#14110f", "titel": "#7a1515",
              "name": "#14110f", "akzent": "#8b6b3a", "linie": "#8b6b3a" },
  "inhalt_mm": { "oben": 36, "unten": 52, "links": 26, "rechts": 26 },
  "text_groesse": 11.5,
  "vorgabe": { "titel_schrift": "fraktur", "titel_schreibweise": "normal",
               "titel_groesse": 44, "titel_sperrung": 0.02,
               "name_schrift": "garamond", "name_groesse": 28,
               "abstand": 1.0, "zeilenabstand": 1.45 },
  "grenzen": { "titel_groesse": [32, 58], "titel_sperrung": [0, 0.2],
               "name_groesse": [20, 38], "abstand": [0.7, 1.5], "zeilenabstand": [1.25, 1.8] },
  "schriften_titel": ["fraktur", "cinzel", "garamond"],
  "schriften_name":  ["garamond", "cormorant", "schreibschrift", "cinzel"]
}
```

- **`inhalt_mm`** ist der Textbereich auf dem A4-Blatt (210 × 297 mm), gemessen vom
  Blattrand. Alles Motiv — Ranken, Siegel, Blumen — liegt **ausserhalb**. Mindestens
  12 mm, sonst schneidet der Drucker.
- **`vorgabe`** ist, was der Teilnehmer zuerst sieht. **`grenzen`** ist, wie weit er
  die Regler drehen darf. Alles wird in `srv/urkunden_design.php` geklemmt — die
  Oberfläche zeigt die Grenzen nur an.
- Farben als `#rrggbb`. Text muss auf dem Papier gut lesbar bleiben: `schrift`
  dunkel auf hellem `papier`, Kontrast mindestens 7:1.
- **`titel_im_bild`** (optional, `true`): Das Wort „Urkunde" steckt schon im
  Hintergrundbild. Die Seite setzt es dann nicht noch einmal, und die Regler für
  das Wort verschwinden. Gilt nur, wenn das Bild da ist.
- **`nur_mit_bild`** (optional, `true`): Die Variante erscheint erst in der Auswahl,
  wenn ihr `hintergrund.*` liegt. Beispiel für beide: `02_historisch-siegel/urkunde-siegel/`.

Dieselben Vorlagen gestalten seit 30.09.2026 auch die Urkunde **jeder einzelnen
Stufe** (Fortschritt → „Design wählen & drucken"): gleiche Seite, eigener Text,
nur Prüfcode statt Konto-Hash und Siegel.

## Die fünf Schriften

Alle unter der SIL Open Font License — frei zum Mitliefern und Einbetten. Die
Dateien liegen unter `assets/fonts/urkunde/` (von Fontsource, je Schrift `latin` und
`latin-ext`, Lizenztexte daneben) und werden in jede Urkunde eingebettet — keine
Anfrage nach draussen. Fehlt eine, nimmt die Urkunde eine ähnliche Systemschrift.
UnifrakturMaguntia gibt es nur als `latin`; seltene Buchstaben wie „Ł" setzt dort
eine Ersatzschrift.

| Kennung | Schrift | Wofür |
|---|---|---|
| `cinzel` | Cinzel | römische Versalien — „URKUNDE" im schlichten Stil |
| `garamond` | EB Garamond | klassisch, neutral — Name und Fliesstext |
| `cormorant` | Cormorant Garamond, kursiv | fein, elegant — Name |
| `fraktur` | UnifrakturMaguntia | gebrochene Schrift — „Urkunde" mit Siegel |
| `schreibschrift` | Great Vibes | Schreibschrift — „Urkunde" mit Blumen, Name |

## Bildformat: 9:16 auf DIN A4

Der Bildgenerator liefert nur **9:16**. Das Blatt ist **1 : 1,414**. Die Urkunde legt
das Bild über die ganze Breite und schneidet oben und unten ab:

- sichtbar ist das **mittlere 79,5 %** der Bildhöhe,
- oben und unten fallen je **10,2 %** weg — **dort darf kein Motiv liegen**.

Umrechnung einer Blatthöhe `y` (mm) in einen Anteil der Bildhöhe:

    Anteil = 10,2 % + (y / 297) × 79,5 %

Jeder Variantenprompt nennt die Werte für seinen Textbereich schon ausgerechnet.

## Unterschriften

Prometheus, Athena und Hermes unterzeichnen jede Urkunde in einer Linie unten.
Die PNG entstehen noch — siehe `_unterschriften/README.md`. Hephaistos
unterzeichnet nicht: er gehört zur Werkstatt nach der sechsten Stufe.
