---
type: note
title: "Lob-Titel"
description: "Die kurzen Schlagworte über dem Lob-Satz — je Zielgruppe ein Kern, je Aufgabenart ein eigener Kopf, gezogen nach Person und Aufgabe."
tags:
  - fundament
  - gamification
  - didaktik
  - dialektik
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Lob-Titel

Nach einer richtigen Antwort zeigt das Lob-Fenster oben ein kurzes Schlagwort,
etwa „Genau richtig!“, und darunter den längeren Satz aus [[motivation]]. Diese
Notiz ist gleichzeitig Lehrstoff und Konfiguration: Das Fenster zieht seine
Titel aus den Aufzählungen weiter unten. Wer eigene Titel will, ändert diese
Datei, nicht den Programmcode.

## Wie gezogen wird — die drei Formeln

Die Auswahl folgt den drei Formeln der angewandten Dialektik
(Seite „Dialektik“ der Webseite, Bilder in `assets/img/dialektik/`):

1. **Ein gemeinsamer Grundton** (Formel 1). Alle Titel loben die Leistung und
   den Weg, nie die Person — kein „Genie“, kein „Naturtalent“. Sie sind kurz,
   damit man sie mit einem Blick erfasst, und tragen höchstens ein
   Ausrufezeichen ([[lernpsychologie]], [[gamification]]).
2. **Geteilt plus spezifisch** (Formel 2). Es gibt zwei Arten von Pools: einen
   **Kern je Zielgruppe** (wer liest?) und einen **Kopf je Aufgabenart** (was
   wurde gerade gelöst?). Gezogen wird aus beiden zusammen — so passt der Titel
   zur Person *und* zur Aufgabe: „Richtig sortiert!“ nach Quizkarten, „Sauber
   gerechnet“ nach einer Rechnung.
3. **Konditionierung auf die Person** (Formel 3). Die Zielgruppe ist das
   Kennzeichen z: Alter oder Klasse bei Lernenden, sonst die Rolle. Kinder
   bekommen ein warmes, bildhaftes Wort mit Ausrufezeichen; Jugendliche
   Anerkennung ihrer Methode; Erwachsene den Bezug zur Arbeit; Eltern den Bezug
   zum Kind; Lehrkräfte die fachliche Einordnung; Schulleitung und Verwaltung
   die knappe Bilanz. Gleicher Inhalt, angepasste Ansprache.

Der zuletzt gezeigte Titel wird übersprungen, so wiederholt sich nichts
unmittelbar. Welche Zielgruppe gilt, entscheidet `pu_lobgruppe()` in
`srv/profil.php`.

### So liest das Programm diese Notiz

- Eine Überschrift mit **„Kern“** und dem Namen einer Zielgruppe (grundschule,
  unterstufe, mittelstufe, oberstufe, erwachsen, eltern, lehrkraft, schule)
  beginnt einen Kern-Pool.
- Eine Überschrift mit **„Aufgabenart“** und dem Typ in Klammern, etwa
  `(quizkarten)`, beginnt einen Kopf-Pool. Steht darin **„Kinder“**, gilt er
  für Grundschule und Unterstufe, sonst für alle anderen.
- Jede Aufzählungszeile darunter ist ein Titel, höchstens 40 Zeichen.

## Kern — Grundschule (Klasse 1 bis 4)

Warm, bildhaft, mit Ausrufezeichen. Lob für Mühe und Dranbleiben.

- Genau richtig!
- Super gemacht!
- Klasse gedacht!
- Volltreffer!
- Stark geknobelt!
- Geschafft!
- Toll aufgepasst!
- Prima überlegt!
- Hurra, richtig!
- Spitze!
- Gut hingeschaut!
- Das sitzt!
- Fein gemacht!
- Mutig probiert – und richtig!
- Dein Funke leuchtet!
- Schlau gelöst!
- Bravo!
- Gewusst wie!
- Knifflig – und gepackt!
- Richtig erkannt!

## Kern — Unterstufe (Klasse 5 bis 7)

Mehr Substanz, noch immer konkret. Verstehen statt Raten.

- Treffer!
- Sauber gelöst!
- Gut kombiniert!
- Richtig gedacht!
- Stark!
- Läuft!
- Clever!
- Geknackt!
- Ins Schwarze!
- Gut durchschaut!
- Nicht geraten – gewusst!
- Logisch gelöst!
- Weiter so!
- Klar erkannt!
- Saubere Arbeit!
- Dranbleiben lohnt sich!
- Muster erkannt!
- Richtig, ganz allein!
- Kopf an, Treffer!
- Das war Verstehen!

## Kern — Mittelstufe (Klasse 8 bis 10)

Normaler Ton, sparsam mit Ausrufezeichen. Methode, prüfen statt glauben.

- Richtig!
- Sauber hergeleitet
- Treffer mit Verstand
- Kern getroffen
- Klar durchdacht
- Geprüft und richtig
- Präzise
- Struktur erkannt
- Belastbar gelöst
- Starke Methode
- Kein Zufall
- Die Logik sitzt
- Auf den Punkt
- Richtig begründet
- Durchschaut
- Saubere Lösung
- Weitergedacht
- Das hält
- Verstanden, nicht geraten
- Genau so

## Kern — Oberstufe (Klasse 11 bis 13)

Anerkennung der Urteilskraft. Knapp, gelegentlich aphoristisch.

- Treffend geurteilt
- Elegant gelöst
- Stringent
- Begründet richtig
- Zu Ende gedacht
- Mit Substanz
- Scharf gedacht
- Das Argument trägt
- Klar geschlossen
- Urteilskraft
- Kein Schritt zu viel
- Belastbar
- Durchdrungen
- Sauber abgewogen
- Beleg statt Behauptung
- Tief verstanden
- Folgerichtig
- Ins Zentrum
- Souverän
- Präzise gedacht

## Kern — Erwachsen (Erwachsene im Beruf)

Respektvoll, mit Bezug zur eigenen Arbeit. Ohne Ausrufezeichen.

- Richtig
- Sauber gelöst
- Fachlich sicher
- Auf den Punkt gebracht
- Gut entschieden
- Praxistauglich
- Klar durchdacht
- Genau so
- Randfall bedacht
- Professionell gelöst
- Übertragbar
- Solide Arbeit
- Treffsicher
- Gut geprüft
- Verlässlich
- Sachlich richtig
- Das trägt im Alltag
- Handwerklich sauber
- Präzise
- Belastbar begründet

## Kern — Eltern

Bezug zum Kind und zur Begleitung zu Hause. Freundlich, ohne Fachjargon.

- Genau richtig!
- Gut verstanden
- Jetzt kannst du mitreden
- Richtig erkannt
- Das hilft deinem Kind
- Klar gesehen
- Treffer
- Sicher gelöst
- Das sitzt
- Stark mitgedacht
- Gute Begleitung beginnt hier
- Verstanden – und erklärbar
- Gut aufgepasst
- Einen Schritt voraus
- Richtig eingeordnet
- Vorbild in Aktion
- Wissen für den Familientisch
- Sicher im Thema
- Gut gemacht
- Gelassen gelöst

## Kern — Lehrkraft (Lehrerinnen und Lehrer)

Fachliche und didaktische Einordnung: Ist das unterrichtstauglich?

- Fachlich sauber
- Unterrichtsreif
- Didaktisch klar
- Richtig eingeordnet
- Gut erklärbar
- Prüfungsfest
- Klar strukturiert
- Sicher im Stoff
- Stark für die Klasse
- Belastbar begründet
- Tafelreif
- Methodisch sauber
- Das trägt in die Stunde
- Fachlich korrekt
- Lehrreich gelöst
- Souverän
- Richtig – und vermittelbar
- Präzise unterschieden
- Distraktor erkannt
- Sauber hergeleitet

## Kern — Schule (Schulleitung und Verwaltung)

Knapp und bilanzierend: Ist das entschieden, verantwortbar, tragfähig?

- Erledigt
- Ziel erreicht
- Geprüft und korrekt
- Sauber entschieden
- Sauber abgewogen
- Klar bilanziert
- Verlässlich
- Richtig priorisiert
- Gut gesteuert
- Im Rahmen
- Stimmig
- Nachvollziehbar
- Solide
- Entscheidungsreif
- Ordnungsgemäß
- Zielsicher
- Haken dran
- Tragfähig
- Verantwortbar
- Klare Linie

## Aufgabenart „Denkaufgabe“ (denkaufgabe) — Kinder

- Richtig gewählt!
- Gut überlegt!
- Die richtige Wahl!
- Schlau ausgesucht!
- Richtig angekreuzt!
- Klug entschieden!
- Genau die!
- Nachgedacht und getroffen!
- Treffer bei der Wahl!
- Gut abgewogen!
- Nicht getippt – gewusst!
- Super ausgewählt!
- Alle Fallen umgangen!
- Genau geprüft!
- Die passende Antwort!
- Gedacht, gewählt, getroffen!
- Richtig entschieden!
- Fein ausgesucht!
- Die Falle durchschaut!
- Gut gelesen!

## Aufgabenart „Denkaufgabe“ (denkaufgabe) — Jugendliche und Erwachsene

- Richtig gewählt
- Gut abgewogen
- Die richtige Option
- Klug entschieden
- Fallen erkannt
- Sauber ausgeschlossen
- Treffend gewählt
- Richtig eingeschätzt
- Klare Entscheidung
- Die Abwägung stimmt
- Falsche Fährten durchschaut
- Begründet gewählt
- Gut unterschieden
- Präzise gewählt
- Die Auswahl sitzt
- Urteil statt Bauchgefühl
- Richtig gelesen
- Alternativen geprüft
- Treffsicher entschieden
- Sauber differenziert

## Aufgabenart „Bausteine“ (plugplay) — Kinder

- Alle Teile passen!
- Richtig zusammengesucht!
- Die richtigen Bausteine!
- Puzzle gelöst!
- Passt genau!
- Nichts vergessen!
- Kein Teil zu viel!
- Sauber ausgewählt!
- Alles an seinem Platz!
- Richtig gepackt!
- Gut gefiltert!
- Die Mischung stimmt!
- Klick – passt!
- Alles drin, was rein muss!
- Teile richtig gefunden!
- Super kombiniert!
- Gut aussortiert!
- Volle Ablage, alles richtig!
- Baustein für Baustein!
- Richtig ausgesucht!

## Aufgabenart „Bausteine“ (plugplay) — Jugendliche und Erwachsene

- Auswahl vollständig
- Alle Bausteine richtig
- Nichts zu viel, nichts zu wenig
- Sauber gefiltert
- Richtig zusammengestellt
- Die Kombination stimmt
- Gut aussortiert
- Vollständig erkannt
- Präzise ausgewählt
- Die Bausteine sitzen
- Treffsichere Auswahl
- Relevantes erkannt
- Ballast weggelassen
- Stimmige Zusammenstellung
- Richtig kombiniert
- Lückenlos
- Klar abgegrenzt
- Gut selektiert
- Passgenau
- Exakt die richtigen

## Aufgabenart „Reihenfolge“ (schiebe) — Kinder

- Richtige Reihenfolge!
- Schritt für Schritt richtig!
- Alles in Ordnung!
- Gut sortiert!
- Erst, dann, danach – stimmt!
- Die Kette hält!
- Perfekt aufgereiht!
- Der Weg stimmt!
- Ordnung geschafft!
- Eins nach dem anderen!
- Super geordnet!
- Kein Schritt vertauscht!
- Stufe für Stufe richtig!
- Alles am richtigen Platz!
- Die Reihe stimmt!
- Gut geplant!
- Von vorn bis hinten richtig!
- Wie am Schnürchen!
- Startklar sortiert!
- Richtig der Reihe nach!

## Aufgabenart „Reihenfolge“ (schiebe) — Jugendliche und Erwachsene

- Die Reihenfolge stimmt
- Der Ablauf sitzt
- Sauber sequenziert
- Prozess verstanden
- Schritt für Schritt korrekt
- Logische Abfolge
- Kein Schritt vertauscht
- Gut strukturiert
- Prozesssicher
- Folgerichtig geordnet
- Der Ablauf trägt
- Richtig priorisiert
- Klare Abfolge
- Sauber geordnet
- Erst prüfen, dann handeln
- Ablauf durchschaut
- Ordnung mit System
- Kette geschlossen
- Ablauf durchdacht
- Sequenz korrekt

## Aufgabenart „Zuordnen“ (uebereinstimmung) — Kinder

- Alle Paare gefunden!
- Richtig zugeordnet!
- Passt zusammen!
- Perfekte Paare!
- Jedes an seinen Platz!
- Gut verbunden!
- Treffer bei allen Paaren!
- Wie Topf und Deckel!
- Super verknüpft!
- Alles richtig verbunden!
- Paare erkannt!
- Zusammengehörendes gefunden!
- Klasse zugeordnet!
- Die Verbindung steht!
- Gut gemerkt!
- Partner gefunden!
- Alle Linien richtig!
- Zuordnung geschafft!
- Passend gemacht!
- Super gepaart!

## Aufgabenart „Zuordnen“ (uebereinstimmung) — Jugendliche und Erwachsene

- Richtig zugeordnet
- Alle Paare stimmen
- Sauber verknüpft
- Die Begriffe sitzen
- Zuordnung exakt
- Zusammenhänge erkannt
- Passgenau verbunden
- Klar unterschieden
- Begriffssicher
- Gut verknüpft
- Vollständig zugeordnet
- Treffsichere Paare
- Konzepte verbunden
- Jede Zeile richtig
- Saubere Zuordnung
- Bedeutung erfasst
- Präzise gepaart
- Systematisch zugeordnet
- Stimmige Verknüpfung
- Ordnung erkannt

## Aufgabenart „Mehrteilig“ (multitask) — Kinder

- Alle Teile geschafft!
- Jeder Schritt richtig!
- Großes Ding gepackt!
- Durchgehalten und geschafft!
- Komplett gelöst!
- Alles zusammen richtig!
- Starke Ausdauer!
- Teil für Teil geknackt!
- Die ganze Aufgabe geschafft!
- Bis zum Ende richtig!
- Ein ganzes Projekt!
- Kein Teil ausgelassen!
- Großartig zusammengesetzt!
- Alles im Griff!
- Mehrfach richtig!
- Lange Aufgabe, starkes Ergebnis!
- Geschafft, von A bis Z!
- Gut durchgezogen!
- Der große Wurf!
- Stück für Stück zum Ziel!

## Aufgabenart „Mehrteilig“ (multitask) — Jugendliche und Erwachsene

- Komplett gelöst
- Alle Teile stimmen
- Durchgängig richtig
- Das Gesamtbild stimmt
- Mehrteilig, fehlerfrei
- Von A bis Z sauber
- Systematisch gelöst
- Ganzheitlich verstanden
- Ausdauer zahlt sich aus
- Zusammenhang erkannt
- Projekt gemeistert
- Alle Teile greifen
- Lückenlos bearbeitet
- Komplexes geordnet
- Durchgehend richtig
- Durchdacht in allen Teilen
- Stimmiges Ganzes
- Die Gesamtlösung trägt
- Schritt für Schritt komplett
- Gründlich bis zum Schluss

## Aufgabenart „Rechnen“ (mathe) — Kinder

- Richtig gerechnet!
- Die Zahl stimmt!
- Rechenweg super!
- Genau getroffen!
- Plus, minus – passt!
- Zahlen geknackt!
- Das Ergebnis stimmt!
- Gut gerechnet!
- Schlau gerechnet!
- Die Rechnung geht auf!
- Treffer bei den Zahlen!
- Bis aufs Komma richtig!
- Super gezählt!
- Zahlensicher!
- Sauber gerechnet!
- Der Rechenweg stimmt!
- Ganz genau!
- Zahl gefunden!
- Kopfrechnen gelungen!
- Rechnung geknackt!

## Aufgabenart „Rechnen“ (mathe) — Jugendliche und Erwachsene

- Sauber gerechnet
- Das Ergebnis stimmt
- Die Rechnung geht auf
- Exakt
- Zahlensicher
- Korrekt kalkuliert
- Der Rechenweg trägt
- Präzise gerechnet
- Auf den Cent
- Die Kalkulation sitzt
- Richtig beziffert
- Numerisch sauber
- Plausibel und exakt
- Formel richtig angewandt
- Zahlenfest
- Korrekt ermittelt
- Bezugsgröße richtig gewählt
- Genau gerechnet
- Rechnerisch einwandfrei
- Richtige Basis gewählt

## Aufgabenart „Räumlich denken“ (raeumlich) — Kinder

- Gut vorgestellt!
- Richtig gedreht!
- Adlerauge!
- Bild im Kopf – richtig!
- Gut gesehen!
- Die Sicht stimmt!
- Raum erobert!
- Von allen Seiten richtig!
- Formen erkannt!
- Klar gesehen!
- Das Bild passt!
- Scharfer Blick!
- Muster gefunden!
- Gut gedreht und gewendet!
- Ecke für Ecke richtig!
- Starke Vorstellungskraft!
- Im Kopf gebaut!
- Genau hingesehen!
- Richtig erkannt!
- Alles im Blick!

## Aufgabenart „Räumlich denken“ (raeumlich) — Jugendliche und Erwachsene

- Räumlich sicher
- Die Perspektive stimmt
- Struktur erkannt
- Klar visualisiert
- Muster erfasst
- Gut vorgestellt
- Sauber abgeleitet
- Gutes Raumgefühl
- Präzise gesehen
- Form erkannt
- Diagramm verstanden
- Aufbau durchschaut
- Gedanklich gedreht – richtig
- Treffend gelesen
- Die Geometrie sitzt
- Lage richtig bestimmt
- Das Bild im Kopf stimmt
- Sauber übertragen
- Anordnung erkannt
- Klarer Blick

## Aufgabenart „Spurensuche“ (secret) — Kinder

- Gefunden!
- Spur entdeckt!
- Gute Detektivarbeit!
- Versteck geknackt!
- Scharfe Augen!
- Schatz gehoben!
- Gut gesucht!
- Rätsel gelöst!
- Geheimnis gelüftet!
- Fall gelöst!
- Lupe an, Treffer!
- Nichts übersehen!
- Gut versteckt, gut gefunden!
- Spur verfolgt!
- Code geknackt!
- Ganz genau hingeschaut!
- Die Spur führt richtig!
- Entdeckt!
- Super Spürnase!
- Aufgedeckt!

## Aufgabenart „Spurensuche“ (secret) — Jugendliche und Erwachsene

- Gefunden
- Spur gesichert
- Leck entdeckt
- Sauber aufgespürt
- Fund bestätigt
- Gründlich durchsucht
- Aufmerksam gelesen
- Detail erkannt
- Fall gelöst
- Treffsicher gefunden
- Versteck aufgedeckt
- Scharfer Blick
- Nichts übersehen
- Fundstelle sicher
- Forensisch sauber
- Muster im Rauschen erkannt
- Sorgfältig geprüft
- Klar identifiziert
- Präzise aufgedeckt
- Spur ausgewertet

## Aufgabenart „Sicherheit“ (sicherheit) — Kinder

- Lücke gefunden!
- Gefahr erkannt!
- Gut aufgepasst!
- Falle entdeckt!
- Schutzschild an!
- Nicht reingefallen!
- Scharf geprüft!
- Fehler entlarvt!
- Gut geschützt!
- Trick durchschaut!
- Wachsam!
- Richtig gemeldet!
- Alarm richtig erkannt!
- Sicher ist sicher!
- Das Schlupfloch gefunden!
- Gute Wache!
- Nichts rutscht durch!
- Genau geprüft!
- Entdeckt und gestoppt!
- Clever durchschaut!

## Aufgabenart „Sicherheit“ (sicherheit) — Jugendliche und Erwachsene

- Schwachstelle erkannt
- Risiko benannt
- Lücke gefunden
- Angriff durchschaut
- Sauber geprüft
- Sicherheitsbewusst
- Nicht reingefallen
- Manipulation erkannt
- Wachsam gelesen
- Gefahr richtig verortet
- Audit bestanden
- Zeile für Zeile geprüft
- Treffsicher markiert
- Täuschung entlarvt
- Kritisch geprüft
- Sicher bewertet
- Kein Schlupfloch übersehen
- Defensiv gedacht
- Präzise markiert
- Gut abgesichert

## Aufgabenart „Technik“ (technisch) — Kinder

- Technik geknackt!
- Richtig eingegeben!
- Funktioniert!
- Der Code sitzt!
- Die Maschine sagt: richtig!
- Gut gebastelt!
- Ausprobiert und geschafft!
- Das Format stimmt!
- Super getüftelt!
- Richtig gebaut!
- Klappt!
- Tüftelei gelungen!
- Kein Tippfehler!
- Genau so muss es aussehen!
- Prüfer zufrieden!
- Alles korrekt eingetippt!
- Werkstatt-Treffer!
- Bauplan erfüllt!
- Läuft wie geschmiert!
- Zeichen für Zeichen richtig!

## Aufgabenart „Technik“ (technisch) — Jugendliche und Erwachsene

- Technisch korrekt
- Format gültig
- Sauber umgesetzt
- Funktioniert
- Die Syntax sitzt
- Prüfung bestanden
- Exakt ausgeführt
- Werkzeug beherrscht
- Korrekt erzeugt
- Maschinenlesbar
- Spezifikation erfüllt
- Sauber validiert
- Einwandfrei
- Präzise umgesetzt
- Handwerklich sauber
- Technisch belastbar
- Fehlerfrei übertragen
- Struktur gültig
- Richtig konfiguriert
- Läuft beim ersten Mal

## Aufgabenart „Verschlüsselung“ (krypto) — Kinder

- Code geknackt!
- Geheimschrift gelöst!
- Verschlüsselt? Entschlüsselt!
- Schlüssel gefunden!
- Geheimnis entziffert!
- Buchstaben geknackt!
- Alles entschlüsselt!
- Super chiffriert!
- Zahlenschloss offen!
- Der Code stimmt!
- Gute Agentenarbeit!
- Verschlüsselung verstanden!
- Der Fingerabdruck stimmt!
- Klartext erreicht!
- Geheimcode richtig!
- Zeichen für Zeichen gelöst!
- Tresor auf!
- Muster geknackt!
- Richtig verschlüsselt!
- Geheim, aber gelöst!

## Aufgabenart „Verschlüsselung“ (krypto) — Jugendliche und Erwachsene

- Korrekt entschlüsselt
- Der Hash stimmt
- Die Kodierung sitzt
- Kryptografisch sauber
- Schlüssel richtig angewandt
- Bitgenau
- Klartext erreicht
- Verfahren verstanden
- Prüfsumme korrekt
- Zeichen für Zeichen exakt
- Sauber kodiert
- Algorithmus beherrscht
- Integrität bestätigt
- Präzise transformiert
- Korrekt verschlüsselt
- Der Fingerabdruck passt
- Kodierung verstanden
- Einwandfrei dekodiert
- Krypto-Handwerk sitzt
- Exakt berechnet

## Aufgabenart „Eigene Antwort“ (planung) — Kinder

- Gut geschrieben!
- Deine Idee zählt!
- Klasse formuliert!
- Alles drin!
- Eigene Worte – stark!
- Super Plan!
- Gut erklärt!
- Gedanken sortiert!
- Prima aufgeschrieben!
- Schön beschrieben!
- Toller Entwurf!
- Alles bedacht!
- Klar und deutlich!
- Starker Text!
- Mit eigenen Ideen!
- Gut durchdacht!
- Der Plan steht!
- Schön ausführlich!
- Wort für Wort gelungen!
- Dein Plan überzeugt!

## Aufgabenart „Eigene Antwort“ (planung) — Jugendliche und Erwachsene

- Der Plan steht
- Gut formuliert
- Alle Punkte bedacht
- Überzeugend begründet
- Vollständig ausgearbeitet
- Klar strukturiert
- Durchdachter Entwurf
- Präzise beschrieben
- Das Konzept trägt
- Alle Kriterien erfüllt
- Eigenständig gelöst
- Umsetzbar
- Sauber argumentiert
- Strategisch gedacht
- Gut auf den Punkt gebracht
- Praxisnaher Plan
- Stimmig aufgebaut
- Kriterien im Blick
- Belastbares Konzept
- Ausgereift

## Aufgabenart „Quizkarten“ (quizkarten) — Kinder

- Richtig sortiert!
- Jede Karte am Platz!
- Alle Stapel stimmen!
- Karte für Karte richtig!
- Super einsortiert!
- Stapel geordnet!
- Alles richtig abgelegt!
- Gut gemischt, gut sortiert!
- Kein Fehlgriff!
- Volltreffer im Stapel!
- Ordnung im Kartenstapel!
- Richtig gelegt!
- Flink sortiert!
- Alle Karten durchschaut!
- Karte für Karte entschieden!
- Sortiert wie gedacht!
- Stimmt bei jeder Karte!
- Prima eingeordnet!
- Alles am richtigen Stapel!
- Die Karten liegen richtig!

## Aufgabenart „Quizkarten“ (quizkarten) — Jugendliche und Erwachsene

- Richtig sortiert
- Jede Karte am Platz
- Sauber eingeordnet
- Die Stapel stimmen
- Klar kategorisiert
- Fehlerfrei zugeordnet
- Treffsicher eingeordnet
- Die Kategorien sitzen
- Karte für Karte korrekt
- Urteil bei jeder Karte
- Gut unterschieden
- Sicher abgegrenzt
- Ordnung mit Begründung
- Präzise sortiert
- Alle Fälle richtig
- Die Einordnung trägt
- Schnell und richtig sortiert
- Klare Trennung
- Systematisch eingeordnet
- Entscheidungssicher
