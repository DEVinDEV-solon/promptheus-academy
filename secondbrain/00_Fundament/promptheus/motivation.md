---
type: note
title: "Motivationssprüche"
description: "Die Sätze, die nach einer richtigen Antwort im Lob-Fenster erscheinen — nach Altersband getrennt, von kindgerecht bis akademisch."
tags:
  - fundament
  - gamification
  - didaktik
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Motivationssprüche

Diese Notiz ist gleichzeitig Lehrstoff und Konfiguration: das Lob-Fenster zieht
seine Sätze aus den Aufzählungen weiter unten. Wer der Klasse eigene Sprüche
geben will, ändert diese Datei — nicht den Programmcode.

Bei **jeder** richtigen Antwort wird ein Satz gezogen, und zwar aus der
**Zielgruppe** der Person: bei Lernenden das Altersband nach Alter oder Klasse,
sonst die Rolle — Eltern, Lehrkraft oder Schule (Schulleitung und Verwaltung).
Der zuletzt gezeigte wird dabei übersprungen, so wiederholt sich nichts
unmittelbar. Welche Gruppe gilt, entscheidet `pu_lobgruppe()` in
`srv/profil.php`.

Über dem Satz steht seit 19.10.2026 ein kurzer **Titel** wie „Genau richtig!“.
Die Titel liegen in einer eigenen Notiz, [[lob-titel]], und richten sich nach
Zielgruppe und Aufgabenart.

## Was einen guten Spruch ausmacht

Aus [[lernpsychologie]] und [[gamification]] folgen vier Regeln, und alle zeigen
in dieselbe Richtung:

1. **Die Leistung loben, nicht die Person.** „Du hast das Muster erkannt" hilft
   weiter. „Du bist ein Genie" erzeugt Angst vor der nächsten Aufgabe, weil ein
   Fehler dann den Status kostet. Das ist der Kern des „growth mindset": gelobt
   wird die Anstrengung und der Weg, nicht die Begabung.
2. **Kurz.** Der Satz erscheint kurz und verschwindet wieder. Was man zu Ende
   lesen muss, unterbricht statt zu bestärken.
3. **Kein Ausrufezeichenhagel.** Wer bei jeder richtigen Antwort angeschrien
   wird, hört nach dem fünften Mal weg. Lob nutzt sich ab, wenn es zu laut ist.
4. **Zum Alter passen.** Ein Achtjähriger braucht ein warmes, konkretes Wort und
   ein Bild; ein Oberstufenschüler die Anerkennung seiner Urteilskraft; ein
   Erwachsener den Bezug zur eigenen Arbeit. Derselbe Satz für alle trifft
   niemanden.

Sätze über 160 Zeichen werden übergangen — das ist keine Geschmacksfrage,
sondern die Breite des Fensters.

Die Überschrift bestimmt das Band: enthält sie „grundschule", „unterstufe",
„mittelstufe", „oberstufe", „erwachsen", „eltern", „lehrkraft" oder „schule",
gehören die Sätze darunter dorthin. Fehlt für Eltern, Lehrkraft oder Schule ein
eigener Abschnitt, gilt der Abschnitt für Erwachsene.

## Grundschule — Klasse 1 bis 4 (kindgerecht)

Warm, konkret, ein Bild. Lob für die Mühe und das Dranbleiben, nie ein grosses
Fremdwort.

- Stark gemacht. Du hast nicht aufgegeben.
- Das war schlau überlegt.
- Du hast genau hingeschaut. Das hilft dir immer.
- Ein kleiner Funke wird ein Feuer. Du hast einen gemacht.
- Richtig. Und du hast es ganz allein geschafft.
- Weiter so, Schritt für Schritt.
- Du hast nachgedacht statt geraten. Sehr gut.
- Das war knifflig, und du hast es gepackt.
- Fein gemacht. Dein Kopf hat gut gearbeitet.
- Gut gemacht. Morgen kannst du noch ein Stück mehr.
- Du wirst immer besser. Man merkt es richtig.
- Toll überlegt. So macht Lernen Freude.
- Du hast dir Mühe gegeben, und es hat geklappt.
- Ein Treffer. Dein Üben zahlt sich aus.
- Richtig gedacht. Darauf darfst du stolz sein.
- Du hast die Idee ganz allein gefunden.
- Schön ruhig überlegt. Genau so geht es.
- Das Feuer brennt. Halte es am Leuchten.
- Prima. Du bist mutig an die Aufgabe gegangen.
- Sauber. Du hast dir Zeit genommen — das war klug.

## Unterstufe — Klasse 5 bis 7

Etwas mehr Substanz, noch immer konkret. Verständnis vor Ergebnis, Durchhalten
zahlt sich aus.

- Sauber gelöst. Du hast den Weg selbst gefunden.
- Das war Verstehen, nicht Glück.
- Du hast das Muster erkannt. Genau darum geht es.
- Richtig — und beim nächsten Mal geht es schneller.
- Gut kombiniert. So denkt man ein Problem durch.
- Ein Schritt weiter als gestern. Mehr braucht es nicht.
- Du hast nachgehakt statt geraten. Das trägt.
- Treffer. Aus Üben wird Sicherheit.
- Klar gedacht. Die Idee dahinter hast du verstanden.
- Stark. Du hast dich nicht ablenken lassen.
- Das sitzt. Dieses Wissen nimmt dir keiner mehr.
- Richtig gelöst — und Fehler wären hier erlaubt gewesen.
- Du hast es zerlegt und gelöst. Saubere Arbeit.
- Richtig. Und du weisst jetzt auch, warum.
- Weitergedacht statt abgeschrieben. Genau richtig.
- Der Funke wird zur Flamme. Bleib dran.
- Du hast Geduld gehabt, und sie hat sich gelohnt.
- Gut. Diese Denkweise brauchst du bald wieder.
- Sicher gelöst. Du vertraust deinem eigenen Kopf.
- Ordentlich durchdacht. So wächst Können.

## Mittelstufe — Klasse 8 bis 10

Normaler Ton. Methode, Übertragbarkeit, prüfen statt glauben.

- Sauber hergeleitet. Der Weg zählt, und der stimmte.
- Du hast die Struktur erkannt, nicht nur die Antwort.
- Richtig — und übertragbar auf die nächste Aufgabe.
- Klar durchdacht. So unterscheidet sich Können von Raten.
- Du hast geprüft statt geglaubt. Genau die richtige Haltung.
- Treffer mit Verständnis. Das bleibt länger als Auswendiggelerntes.
- Gut. Du hast die Ausnahme mitgedacht, nicht nur die Regel.
- Sicher gelöst. Dein Blick fürs Wesentliche wird schärfer.
- Das war Methode, nicht Zufall. Weiter so.
- Du hast den Kern getroffen, nicht die Hülle.
- Richtig begründet. Eine Note liesse sich damit verteidigen.
- Stark kombiniert. Dieses Denken trägt eine Stufe höher.
- Du bleibst dran, wo andere raten. Das macht den Unterschied.
- Sauber. Aus Verstehen wird Werkzeug.
- Gut geprüft. Wer nachfragt, wird selten getäuscht.
- Der Weg war schwerer als die Antwort. Du bist ihn gegangen.
- Präzise gedacht. Das Feuer bekommt Form.
- Richtig — und du könntest es jetzt jemandem erklären.
- Du hast die Annahme geprüft, bevor du gerechnet hast. Klug.
- Belastbar gelöst. Das hält auch der zweiten Frage stand.

## Oberstufe — Klasse 11 bis 13 (anspruchsvoll, literarisch)

Anerkennung der Urteilskraft. Knapp, gelegentlich aphoristisch; Eleganz und
Strenge dürfen vorkommen.

- Sauber argumentiert. Die Begründung trägt, nicht nur das Ergebnis.
- Du hast die Frage hinter der Frage gesehen.
- Klar und belastbar. So sieht durchdachtes Wissen aus.
- Treffer mit Substanz — der Unterschied zwischen Wissen und Meinen.
- Du prüfst, wo andere vertrauen. Das ist geistige Unabhängigkeit.
- Eleganz ist, wenn kein Schritt fehlt und keiner zu viel ist. Genau so.
- Du hast den Einwand vorweggenommen. So denkt man zu Ende.
- Ein Gedanke, der der Prüfung standhält, wiegt mehr als zehn, die gefallen.
- Präzise. Randfälle inbegriffen — daran erkennt man Tiefe.
- Du trennst Beleg von Behauptung. Diese Klinge bleibt scharf.
- Wer die Struktur sieht, muss nicht auswendig lernen. Du siehst sie.
- Richtig — und du weisst, warum die naheliegende Antwort falsch war.
- Das war Urteilskraft, nicht Routine.
- Du hast Geduld mit dem Schweren. Daraus wird Meisterschaft.
- Feuer, das Form annimmt, wird zum Werkzeug. Deins nimmt Form an.
- Ein guter Zug: erst die Annahme geprüft, dann gerechnet.
- Die Herleitung würde auch einen Skeptiker überzeugen.
- Du denkst in Zusammenhängen, nicht in Häppchen. Das trägt weit.
- Sauber. Klarheit ist die Höflichkeit des Denkens.
- Richtig geschlossen. Du folgst dem Argument, nicht dem Gefühl.

## Erwachsene und Beruf (fachlich, technisch, sozial-pädagogisch)

Respektvoll, mit Bezug zur eigenen Arbeit. Handwerk, Übertragbarkeit,
Verlässlichkeit — und wo es passt, der Blick auf die, die man anleitet.

- Sauber gelöst. Belastbar begründet, nicht bloss plausibel.
- Treffer. Das lässt sich im Arbeitsalltag genauso anwenden.
- Du prüfst, statt zu vertrauen — die Gewohnheit, die sich am meisten lohnt.
- Wissen, das man erklären kann, ist Wissen, das man besitzt. Du besitzt es.
- Präzise und knapp. Mehr braucht eine belastbare Antwort nicht.
- Du hast den Randfall bedacht. Genau dort entscheidet sich Qualität.
- Sauber. Aus Verstehen wird ein Werkzeug, das du wiederverwenden kannst.
- Richtig. Diese Denkfigur trägt vom Klassenzimmer bis ins Büro.
- Treffer mit Substanz. Das war Verstehen, kein Glück.
- Du trennst Beleg von Behauptung. Im Beruf ist das bares Geld wert.
- Klar durchdacht. So baut man Vertrauen — bei sich und bei anderen.
- Eine Entscheidung, die man verteidigen kann, ist eine gute. Das war eine.
- Wer den Kern versteht, überlebt den nächsten Werkzeugwechsel. Du verstehst ihn.
- Präzise. Du hast die Annahme benannt, statt sie zu verschweigen.
- Gut gearbeitet. Handwerk schlägt Effekt, jeden Tag.
- Richtig — und übertragbar auf den nächsten Fall, nicht nur diesen.
- Du bleibst gründlich, wo Tempo lockt. Das unterscheidet Profis.
- Sauber gedacht. Wer es selbst versteht, kann es andere lehren.
- Ruhig und genau gelöst. Diese Haltung überträgt sich auf ein Team.
- Belastbar. Auf so eine Antwort lässt sich eine weitere aufbauen.

## Eltern — Begleitung zu Hause

Eltern lösen Aufgaben, um ihr Kind zu begleiten. Der Satz schlägt die Brücke
dorthin: mitreden können, gelassen erklären, Vorbild sein.

- Richtig. Jetzt kannst du deinem Kind erklären, worauf es ankommt.
- Gut verstanden. So begleitest du dein Kind sicher durch die Lektion.
- Du hast geprüft statt geglaubt — genau das lernt dein Kind hier auch.
- Treffer. Wer es selbst versteht, kann gelassen mitreden.
- Sauber gelöst. Das ist Wissen für das nächste Gespräch am Küchentisch.
- Du kennst jetzt die Falle, in die viele tappen. Dein Kind profitiert davon.
- Richtig eingeordnet. Gute Fragen an dein Kind beginnen genau hier.
- Gut gemacht. Lernen vorleben wirkt stärker als jede Ermahnung.
- Klar erkannt. So merkst du auch, wann dein Kind Hilfe braucht.
- Das sitzt. Jetzt weißt du, was dein Kind in dieser Stufe übt.
- Verstanden statt überflogen. Diese Ruhe überträgt sich.
- Richtig. Du sprichst jetzt dieselbe Sprache wie die Lektion deines Kindes.
- Stark mitgedacht. Begleiten heißt nicht vorsagen — und du weißt jetzt, wie.
- Gut geprüft. Dieses Misstrauen gegenüber glatten Antworten schützt dein Kind.
- Sicher gelöst. Den Fragen deines Kindes musst du jetzt nicht mehr ausweichen.
- Treffer. Neugier ist ansteckend — deine zeigt sich gerade.
- Gut gewählt. Wer die Regeln kennt, kann sie zu Hause gelassen erklären.
- Richtig. Ein gemeinsamer Wissensstand macht Gespräche leichter.
- Klar durchschaut. So schützt du dich und deine Familie vor Täuschungen.
- Sauber verstanden. Darauf lässt sich zu Hause gut aufbauen.

## Lehrkraft — Unterricht und fachliche Einordnung

Für Lehrerinnen und Lehrer: Ist das fachlich sauber, und trägt es in die
nächste Stunde?

- Fachlich sauber. Das lässt sich so in die nächste Stunde mitnehmen.
- Richtig — und mit dieser Begründung auch für die Klasse nachvollziehbar.
- Gut erkannt. Genau an dieser Stelle stolpern Lernende am häufigsten.
- Präzise gelöst. Ein gutes Tafelbeispiel für diese Unterscheidung.
- Treffer. Die falsche Fährte war gut gebaut — und du hast sie gesehen.
- Sauber hergeleitet. So sieht ein Erwartungshorizont aus.
- Richtig eingeordnet. Daraus wird eine klare Lernzielformulierung.
- Belastbar begründet. Diese Antwort hält auch kritischen Nachfragen stand.
- Gut geprüft. Quellenkritik vorleben ist die beste Unterrichtsmethode.
- Klar durchdacht. Das lässt sich in drei Schritten an der Tafel zeigen.
- Richtig. Du weißt jetzt, was die Lernenden in dieser Lektion leisten.
- Sicher im Stoff. Damit kannst du Fragen im Unterricht gelassen begegnen.
- Präzise. Fachbegriff und Alltagsbeispiel passen zusammen.
- Gut unterschieden. Genau diese Trennung brauchen Lernende als Gerüst.
- Treffer mit Methode. Das ist übertragbar auf eigene Aufgaben.
- Sauber gelöst. Daraus lässt sich eine gute Übung für die Klasse bauen.
- Richtig — und du hast den typischen Fehler gleich mitgesehen.
- Durchdacht. So entsteht Unterricht, der über das Werkzeug hinaus trägt.
- Klar strukturiert. Lernende danken es mit weniger Rückfragen.
- Gut gemacht. Wer den Stoff durchdringt, kann ihn auf viele Arten erklären.

## Schule — Schulleitung und Verwaltung

Knapp und bilanzierend: entschieden, verantwortbar, tragfähig für das ganze
Haus.

- Richtig. Diese Entscheidung ließe sich vor jeder Konferenz vertreten.
- Sauber abgewogen. So entsteht eine Regel, die im Kollegium trägt.
- Treffer. Das ist die Grundlage für eine klare Linie im Haus.
- Belastbar. Darauf lässt sich eine Schulvereinbarung aufbauen.
- Richtig eingeordnet. Die Verantwortung bleibt beim Menschen — genau so.
- Klar entschieden. Datenschutz und Nutzen sind hier im Gleichgewicht.
- Gut geprüft. So vermeidet eine Schule teure Fehlentscheidungen.
- Präzise. Diese Unterscheidung gehört in jedes Medienkonzept.
- Sauber gelöst. Das erspart dem Kollegium später Rückfragen.
- Richtig. Wer das Prinzip kennt, kann Werkzeuge gelassen bewerten.
- Nachvollziehbar entschieden. Transparenz schafft Vertrauen bei Eltern.
- Gut gesteuert. Klare Regeln entlasten alle Beteiligten.
- Treffer. Diese Haltung lässt sich auf das ganze Haus übertragen.
- Zielsicher. So sieht eine Entscheidung aus, die Aufsicht und Praxis besteht.
- Richtig priorisiert. Erst die Regel, dann das Werkzeug.
- Sauber bilanziert. Kosten, Nutzen und Risiko sind benannt.
- Klar. Damit kann die Schule eine verständliche Linie vorgeben.
- Verlässlich gelöst. Auf solchen Entscheidungen baut Schulentwicklung auf.
- Richtig. Das schützt Lernende und Lehrkräfte zugleich.
- Belastbar begründet. Genau das erwarten Schulträger und Eltern.

## Wo sie erscheinen

Nach jeder richtig gelösten Aufgabe, sofern in den persönlichen Einstellungen
„Lob-Fenster" eingeschaltet ist. Dort steht auch, nach wie vielen Sekunden es
sich selbst schliesst; bei `0` bleibt es stehen, bis jemand das × drückt.

Gezogen wird bei jeder Antwort neu und zufällig aus dem passenden Altersband,
ohne den zuletzt gezeigten Satz. Fehlt zu einem Band ein Pool, greift der
gemeinsame Rückfall im Programm.
