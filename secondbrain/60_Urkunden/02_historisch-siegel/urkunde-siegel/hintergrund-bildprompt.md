# Systemprompt — Hintergrund „Urkunde mit Siegel"

Für den Bildgenerator. Erzeugt das Hintergrundblatt der Academy-Vorlage
`secondbrain/60_Urkunden/02_historisch-siegel/urkunde-siegel/`: Pergament,
das Wort **„Urkunde"** fest im Bild (Fraktur, oben links), rotes Wachssiegel
unten rechts. Vorbild ist `urkunde2.png` in diesem Ordner.

**Warum neu erzeugen statt `urkunde2.png` verwenden:**
- `urkunde2.png` hat nur **353 × 500 Pixel**. Auf A4 gedruckt sind das rund
  40 dpi — sichtbar unscharf. Gebraucht werden mindestens 1240 × 1754 Pixel
  (150 dpi), besser 2480 × 3508 (300 dpi).
- Herkunft und Lizenz von `urkunde2.png` sind nicht belegt. Ein eigenes Bild
  gehört uns und darf auf die Webseite und in jede Academy.

**Ablage des fertigen Bildes:** `hintergrund.png` (oder `.jpg`, höchstens 3 MB)
nach `secondbrain/60_Urkunden/02_historisch-siegel/urkunde-siegel/`. Erst mit
dem Bild erscheint die Vorlage in der Auswahl (`nur_mit_bild`), und die Academy
blendet ihr eigenes Wort „Urkunde" aus (`titel_im_bild`).

---

## 1. Systemprompt (in das Systemfeld des Generators)

> You create a single, flat, print-ready background sheet for a German
> certificate ("Urkunde"). The sheet is later filled with text by software, so
> large areas must stay calm and empty. You never add any text other than the
> single word "Urkunde". You follow the layout zones exactly, given as
> percentages of the image width (x, from left) and height (y, from top).
>
> Output: portrait, aspect ratio 1 : 1.414 (DIN A4), at least 1240 × 1754 px,
> preferably 2480 × 3508 px. Flat, frontal, evenly lit scan of one sheet that
> fills the whole frame edge to edge. No table, no perspective, no drop shadow,
> no photo of a desk, no hands, no quill.
>
> Paper: warm antique parchment, light (around #efe0bf) with soft, even
> mottling and slightly darker, gently burnt edges. The centre stays pale and
> smooth — no stains, cracks, folds or dark spots in the text zone.
>
> The word "Urkunde": exactly this spelling, U-r-k-u-n-d-e, one word, German
> blackletter (Fraktur) calligraphy. The initial "U" is large and deep red
> (#7a1515) with a fine ornamental swash; the letters "rkunde" are dark
> brown-black (#2a1c12). Place it in the zone x 7–62 %, y 7–20 %. Sepia pen
> flourishes may grow out of the "U" and the final "e".
>
> Flourishes: fine sepia/brown ink, thin lines. Upper left: from the word down
> along the left edge, but never beyond x 13 % below y 22 %, and ending by
> y 42 %. Nothing ornamental anywhere else except around the seal.
>
> Text zone — keep completely empty and calm: x 14–86 %, y 23–78 %.
>
> Seal: one round red wax seal with a natural, slightly irregular rim, centred
> at about x 86 %, y 87 %, diameter about 16 % of the width, with a short
> natural cord (beige hemp) hanging from it. The seal face is blank or shows a
> simple flame relief — no letters, no monogram, no coat of arms.
>
> Style: calm, dignified, historical document, printable on an ink-jet
> printer. Colours only parchment, sepia, brown-black and wax red.
>
> Never: any text except "Urkunde", letters or numbers in the seal, coats of
> arms of real cities, families or companies, skulls, weapons, robots,
> screens, blue or violet tones, lens flare, watermarks, signatures, frames
> that cut into the text zone.

## 2. Nutzerprompt (für jeden Lauf)

> Create the certificate background as specified. Word: "Urkunde" in Fraktur,
> red initial U, upper left. Red wax seal with cord, lower right, blank face
> with a small flame relief. Text zone x 14–86 %, y 23–78 % must stay empty.
> DIN A4 portrait, 2480 × 3508 px.

**Mit Vorlagebild (Bild-zu-Bild):** `urkunde2.png` als Referenz anhängen und
ergänzen: *„Use the attached image only as a loose reference for mood and
composition. Do not copy it. Redraw everything in high resolution with the
zones above."* Die Stärke der Referenz niedrig halten (etwa 0,3–0,45), sonst
übernimmt der Generator die Unschärfe.

## 3. Zonen (so rechnet die Academy)

Die Academy legt den Text in diese Fläche (`vorlage.json`, `inhalt_mm`):
oben 70 mm, unten 66 mm, links und rechts je 30 mm vom Blattrand.

| Bereich | x (Breite) | y (Höhe) | Inhalt |
|---|---|---|---|
| Wort „Urkunde" | 7–62 % | 7–20 % | Fraktur, U rot, Rest braunschwarz |
| Ranke links | 2–13 % | 20–42 % | fein, Sepia |
| **Textfläche** | **14–86 %** | **23–78 %** | leer, hell, ruhig |
| Unterschriften | 14–86 % | 68–78 % | gehört zur Textfläche — leer |
| Siegel | 78–94 % | 79–95 % | rot, mit Kordel, ohne Schrift |

Mit `urkunde2.png` probehalber gerendert (30.09.2026): Die Fläche passt, der
Text steht frei zwischen Ranke und Siegel. Nur die Schärfe reicht nicht.

## 4. Prüfen vor dem Ablegen

1. Steht dort genau **„Urkunde"**? Generatoren verschreiben Fraktur gern
   („Urkunbe", „Urfunde"). Buchstabe für Buchstabe prüfen. Stimmt es nicht:
   neu erzeugen, nicht nachbessern.
2. Ist die Textfläche wirklich leer und hell? Kein Fleck, keine Ranke darin.
3. Keine Schrift im Siegel.
4. Grösse mindestens 1240 × 1754 Pixel, Datei höchstens 3 MB.
5. In der Academy: Einstellungen → Urkunden → Generator → Design „Urkunde mit
   Siegel" → Vorschau prüfen, einmal als PDF drucken.

**Falls das Wort nicht sauber gelingt:** das Bild ohne Wort erzeugen (Prompt
wie oben, aber „no text at all") und in `vorlage.json` den Schalter
`"titel_im_bild": true` entfernen. Dann setzt die Academy „Urkunde" selbst in
Fraktur — gestochen scharf und in jeder Schreibweise.
