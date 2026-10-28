---
type: entity/begriff
title: "KI-Programmier-Glossar"
description: "Die Fachbegriffe rund um KI und Programmieren auf Deutsch — übersetzt nach der Sammlung von Matt Pocock, ergänzt um Verweise auf die eigenen Blätter dieses Glossars."
tags:
  - glossar
  - ki
  - agentik
timestamp: 2026-10-17T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# KI-Programmier-Glossar

> Was hinter den englischen Fachbegriffen rund um KI und Programmieren steckt — übersetzt, erklärt und für die Academy eingerichtet.

Dieses Glossar fasst die Begriffe der öffentlichen Sammlung „Dictionary of AI Coding“ von Matt Pocock auf Deutsch zusammen (https://github.com/mattpocock/dictionary-of-ai-coding, Stand: September 2026). Die Sammlung wurde nur gelesen und übersetzt — installiert oder in die Systeme übernommen wurde nichts. Sie ergänzt die eigenen Blätter dieses Glossar-Ordners: Wo es bereits ein eigenes Blatt gibt, steht am Ende des Eintrags der Verweis darauf.

Die Einträge stehen alphabetisch nach dem englischen Begriff und sind in drei Teile gegliedert:

1. **Wie ein Modell arbeitet** — was in einem Sprachmodell vorgeht: Token, Aufmerksamkeit, Kontext, Wissen.
2. **Agenten, Werkzeuge und ihre Grenzen** — was um das Modell herum gebaut wird, damit daraus ein arbeitender Assistent wird.
3. **Betrieb, Praxis und Qualität** — wie man mit solchen Systemen im Alltag arbeitet und woran man gute Arbeit erkennt.

Jeder Eintrag beginnt mit einer Definition in einem Satz, erklärt dann den Begriff in Alltagssprache und warnt — wo die Quelle das hergibt — vor einem verbreiteten Missverständnis.

## Wie ein Modell arbeitet

### KI (Künstliche Intelligenz)

**"KI" ist keine feste Technik, sondern eine bewegliche Sammelbezeichnung für das, was Computer gerade neu und eindrucksvoll können.**

Heute zeigt der Begriff auf große Sprachmodelle. Früher zeigte er auf anderes: Expertensysteme der achtziger Jahre, Schachprogramme, Bilderkennung. Sobald eine Technik zuverlässig funktioniert, wird sie umbenannt — "nur Suche", "nur Statistik" — und "KI" rutscht zum nächsten ungelösten Problem.

Deshalb reden Gespräche über KI so oft aneinander vorbei. Der Satz "KI kann nicht denken" trägt einen versteckten Zeitstempel. Stockt eine Diskussion, hilft es, das Wort durch den genau gemeinten Begriff zu ersetzen: das Modell, das Harness, den Agenten, den Kontext.

**Oft missverstanden:** "KI" sollte in technischen Aussagen gemieden werden; besser ist das gemeinte Teil zu benennen. "KI-Programmierung" als Bezeichnung für die Tätigkeit ist in Ordnung, "die KI halluziniert" nicht.

**Verwandt:** [[llm]] · [[harness]] · [[agent]] · **Modell**

### Aufmerksamkeitsbudget (Attention Budget)

**Jedes Token hat eine begrenzte Menge Einfluss, die es über den übrigen Kontext verteilen kann.**

Starke Wirkung auf eine Beziehung lässt weniger Einfluss für die anderen übrig. Das Budget gilt pro Token und wächst nicht mit dem Kontext mit — deshalb verwässern lange Sitzungen. Man kann es sich als Signal und Lärm vorstellen: Die Anweisung behält ihre Lautstärke, aber der Raum um sie herum wird lauter. Eine Vorgabe, die bei zehntausend Token Kontext am deutlichsten war, ist bei hundertfünfzigtausend nur noch Hintergrundrauschen.

Das ist der Mechanismus hinter dem Aufmerksamkeitsabbau. Das Modell vergisst nichts; das Signal geht im Lärm unter. Beim Nutzer liest sich das als Ungehorsam: Eine Vorgabe wurde früh zugesagt und driftet später weg. Steuern lässt sich nur, was in den Kontext kommt.

**Verwandt:** [[token]] · [[kontextfenster]] · **Aufmerksamkeitsabbau** · **Kontext**

### Aufmerksamkeitsabbau (Attention Degradation)

**Mit wachsender Sitzung verteilt sich das Aufmerksamkeitsbudget jedes Tokens auf immer mehr Konkurrenten.**

Dadurch wird das Signal auf eine bedeutsame Beziehung schwächer, und Lärm aus unwichtigem Kontext drängt sich vor. Gleiches Modell, gleiche Parameter — nur mehr Münder an einem Teller. Es äußert sich als Nachlassen mitten in der Sitzung: Vorgaben, die eine Stunde lang galten, rutschen weg, das Modell fragt Nachgefragtes erneut, Code ignoriert eine früher gelesene Datei.

Der Abbau verläuft allmählich, ohne Fehlermeldung und ohne Schwelle. Jeder Zug ist nur ein wenig schlechter als der vorige. Geholfen wird durch Kontext entfernen, nicht hinzufügen: leeren und nur laden, was die Aufgabe braucht, verdichten oder an eine frische Sitzung übergeben.

**Verwandt:** [[kontextfenster]] · **Aufmerksamkeitsbudget** · [[kontextentzug]] · **Aufmerksamkeitsbeziehung**

### Aufmerksamkeitsbeziehung (Attention Relationship)

**Eine Aufmerksamkeitsbeziehung ist die Paarung zweier Token: Bedeutungsvolle Paare beeinflussen sich stärker als zusammenhanglose.**

Bei der Vorhersage jedes Tokens bezieht das Modell alle anderen Token des Kontexts ein — manche stark, viele kaum. Paare wie "sie" und "Sarah" oder ein Funktionsaufruf und seine Definition wirken deutlich aufeinander. Ein Kontext mit tausend Token hat grob eine Million solcher Paarungen, einer mit hunderttausend etwa zehn Milliarden.

In diesen Paarungen liegt das scheinbare Verständnis des Modells. Nur wenige Beziehungen zählen für eine Aufgabe; ihr Anteil am Ganzen sinkt, je länger der Kontext wird. Das ist die Rechnung unter dem Aufmerksamkeitsbudget.

**Verwandt:** [[token]] · **Aufmerksamkeitsbudget** · **Aufmerksamkeitsabbau** · [[kontextfenster]]

### Cache-Token (Cache Tokens)

**Cache-Token sind Eingabe-Token, die der Anbieter aus einer früheren Anfrage zwischengespeichert hat und günstiger abrechnet.**

Weil das Modell zustandslos ist, sendet jede Anfrage die gesamte Unterhaltung erneut. Erkennt der Anbieter einen unveränderten Anfang wieder, rechnet er diesen Teil zu einem Bruchteil des normalen Preises ab, oft zu einem Zehntel. Beim fünfzigsten Zug trägt jede Anfrage fünfzig Züge Verlauf; ohne den Zwischenspeicher würde alles davon jedes Mal voll bezahlt.

Der Speicher ist empfindlich, denn er passt nur auf exakt gleiche Anfänge. Ändert sich weiter oben etwas — eine Umsortierung, ein neuer Zeitstempel —, verfällt die Ersparnis ab dieser Stelle, und alles danach kostet wieder voll. Nach längerer Pause läuft der Speicher ebenfalls ab.

**Verwandt:** **Eingabe-Token** · **Ausgabe-Token** · [[token]] · [[harness]]

### Kontext (Context)

**Kontext ist die Gesamtheit der sachlich relevanten Informationen, die ein Agent gerade zur Verfügung hat.**

Gemeint ist nicht die Roh-Eingabe, die das Modell sieht — das ist das Kontextfenster —, und nicht der laufende Verlauf — das ist die Sitzung —, sondern das, was der Agent zur Aufgabe Wissenswertes kennt. "Etwas in den Kontext laden" heißt, es zu diesem Satz hinzuzufügen.

Kontext ist ein Maß für Qualität, nicht für Menge. Ein fast volles Kontextfenster kann schlechten Kontext enthalten: tausend Token veralteter Werkzeugausgaben, nichts davon zur Aufgabe. Ein fast leeres kann ausgezeichnet sein, wenn die eine entscheidende Typdefinition darin steht. Die meisten Alltagsfehler gehen auf den Kontext zurück.

**Verwandt:** [[kontextfenster]] · [[agent]] · **Kontextwissen** · **Aufmerksamkeitsabbau**

### Kontextzeiger (Context Pointer)

**Ein Kontextzeiger ist ein Verweis in einem Dokument auf ein anderes, den der Agent nur bei Bedarf nachlädt.**

Der Grund ist der Preis. Ein Zeiger belegt eine Zeile im Kontextfenster; das dahinterliegende Dokument kann Tausende Token umfassen, kostet aber nichts, solange der Agent ihm nicht folgt. Ein Zeiger braucht zwei Teile: einen stabilen Pfad und genug Beschreibung, damit erkennbar ist, wann das Folgen lohnt. "Siehe internal/deploy.md" ohne Hinweis wird von der Sitzung übersprungen, die ihn gebraucht hätte; "Release, Deploy oder Rollback — zuerst internal/deploy.md lesen" funktioniert.

Zeiger verbinden außerdem eine Sekundärquelle mit ihrer Primärquelle, damit ein Auszug verlustbehaftet bleiben darf statt endgültig.

**Oft missverstanden:** "Referenz" ist zu trocken und vermittelt nicht, dass das Folgen mehr Kontext hereinholt; "Portal" ist zu blumig.

**Verwandt:** [[kontextfenster]] · [[token]] · [[werkzeugaufruf]] · **Skill**

### Kontextfenster (Context Window)

**Das Kontextfenster ist alles, was das Modell bei jeder Anfrage sieht — endlich groß und von Modell zu Modell verschieden.**

Es ist eine einzige Folge von Token: die Systemvorgabe, der bisherige Gesprächsverlauf, jedes zurückgespielte Werkzeugergebnis. Was in dieser Folge steht, kann das Modell nutzen. Was nicht darin steht, kennt es nicht — nicht den eigenen Code, nicht die gestern geänderte Datei, nicht die Anweisung von vor drei Sitzungen. Alles außerhalb muss hereingeholt werden.

Endlich heißt: Das Fenster füllt sich. Jeder Zug hängt mehr an, und lange Sitzungen stoßen an die Grenze. Zugleich konkurriert alles im Fenster. Praktisch behandelt man es deshalb als Budget: laden, was die Aufgabe braucht, den Rest weglassen.

**Oft missverstanden:** "Gedächtnis" — das Kontextfenster ist Arbeitszustand und bleibt nicht über Sitzungen hinweg erhalten; ein Gedächtnissystem ist ein eigener Begriff darüber.

**Auch als eigenes Blatt:** [[kontextfenster]]

**Verwandt:** [[token]] · [[agent]] · **Kontext**

### Kontextwissen (Contextual Knowledge)

**Kontextwissen sind Fakten, die ein Agent gerade direkt aus dem Kontext lesen kann.**

Dazu gehören die Aufgabe der Nutzerin, eingelesene Dateien, Werkzeugergebnisse und zu Sitzungsbeginn geladene Regelwerke. Das Gegenstück ist das parametrische Wissen: Jenes wird aus den Parametern erinnert, dieses aus dem Fenster gelesen. Halluzinationen sind deutlich seltener, wenn der Agent mit Kontextwissen arbeitet, weil die Antwort direkt vor ihm liegt.

Von beiden Arten ist nur das Kontextwissen beeinflussbar, denn die Parameter sind eingefroren. Widersprechen sich beide, gewinnt meist das Kontextwissen. Sein Einsatz kostet allerdings Token, weshalb mehr nicht automatisch besser ist.

**Oft missverstanden:** "Arbeitsgedächtnis" — Kontextwissen ist, was jetzt im Fenster steht; ein Gedächtnissystem bringt Inhalte über Sitzungen hinweg hinein.

**Verwandt:** **Kontext** · [[kontextfenster]] · [[halluzination]] · [[token]]

### Aufwand (Effort)

**Der Aufwand ist ein Regler dafür, wie viel Überlegung ein Modell vor seiner Antwort betreibt.**

Er wird pro Anfrage gesetzt und steuert die Länge des Nachdenkens, das vor der sichtbaren Antwort abläuft. Dieses Nachdenken entsteht bei der Inferenz wie alle übrige Ausgabe und wird als Ausgabe-Token abgerechnet, auch wenn man es nie sieht. Höherer Aufwand kostet daher mehr und dauert länger.

Üblich ist eine kleine Leiter: niedrig für mechanische Änderungen und Nachschlagen, mittel als Alltagsstandard, hoch für schwierige Fehler und Entwurfsfragen, maximal für die schwersten Fälle. Zu niedrig gesetzt entsteht eine selbstsichere, flache Antwort; zu hoch gesetzt für eine Umbenennung nur Wartezeit. Der Aufwand gehört zur Aufgabe, nicht zur Sitzung.

**Verwandt:** [[inferenz]] · [[token]] · [[llm]] · [[sampling]]

### Halluzination

**Eine Halluzination ist eine selbstsicher vorgetragene, falsche Ausgabe eines Modells.**

Es gibt zwei Sorten mit verschiedenen Ursachen. Die Sorte Fakten erfindet oder verwechselt Weltwissen: eine Funktion, die es nicht gibt, eine falsche Schnittstellensignatur, eine erfundene Quelle. Ihre Ursache sind Lücken im parametrischen Wissen, oft jenseits des Wissensstichtags. Die Sorte Treue weicht vom geladenen Kontext, von den Anweisungen oder vom eigenen früheren Denken ab; ihre Ursache ist Aufmerksamkeitsabbau.

Die Unterscheidung entscheidet über das Gegenmittel, denn beide widersprechen sich: Fakten brauchen mehr Kontext, Treue weniger. Wer Treue für Fakten hält, schaufelt weitere Dokumente nach und verschlimmert die Abweichung. Die Vorhersage des nächsten Tokens liefert flüssigen Text, ob der Inhalt stimmt oder nicht.

**Oft missverstanden:** "Halluzination" als blankes Synonym für "falsch" — ohne die Sorte zu nennen, hat der Begriff keinen diagnostischen Wert.

**Auch als eigenes Blatt:** [[halluzination]]

**Verwandt:** [[modellgewichte]] · [[kontextentzug]] · [[quellenkritik]]

### Inferenz (Inference)

**Inferenz ist das Ausführen eines trainierten Modells, um Ausgabe zu erzeugen — genau das, was bei jeder Anfrage geschieht.**

Die Parameter bleiben dabei unverändert. Das Modell betreibt Vorhersage des nächsten Tokens über den Kontext, den es erhält. Das Leben eines Modells zerfällt in zwei Phasen: das Training einmalig vor der Veröffentlichung, das die Parameter schreibt, und die Inferenz bei jeder Nutzung, die sie nur liest.

Nichts an der Inferenz schreibt in die Parameter zurück. Deshalb bleibt eine heute sorgfältig erklärte Korrektur morgen nicht haften; das Modell ist zustandslos, und Kontinuität muss von außen kommen. Abgerechnet wird pro Token, und da jede Anfrage den vollen Kontext durchläuft, hängt die Rechnung auch an der Kontextgröße.

**Auch als eigenes Blatt:** [[inferenz]]

**Verwandt:** [[training]] · [[token]] · [[llm]]

### Eingabe-Token (Input Tokens)

**Eingabe-Token sind die Token, die das Harness bei jeder Anfrage an das Modell sendet.**

Dazu gehören die Systemvorgabe, der Gesprächsverlauf und alles, was das Modell liest, bevor es zu schreiben beginnt. Sie werden günstiger abgerechnet als Ausgabe-Token, weil sie billiger zu verarbeiten sind. Bei der Arbeit mit Sprachmodellen machen Eingabe-Token den größten Teil der Rechnung aus: Das Modell ist zustandslos, also sendet jeder Zug die gesamte Sitzung erneut. Die Eingabe für den fünfzigsten Zug enthält die vorigen neunundvierzig Züge.

Der Zwischenspeicher des Anbieters senkt diese Kosten. Reicht das nicht, verkleinert man die gesendete Menge — etwa durch Leeren oder Verdichten zwischen Aufgaben.

**Verwandt:** [[token]] · [[harness]] · **Cache-Token** · [[llm]]

### Wissensstichtag (Knowledge Cutoff)

**Der Wissensstichtag ist das Datum, nach dem ein Modell aus seinem Training nichts Neues mehr weiß.**

Alles, was später erschienen ist – neue Bibliotheksversionen, geänderte Schnittstellen, Ereignisse –, kennt das Modell nicht. Der Grund liegt in der Herstellung: Beim Training wird ein Abbild von Text in die Modellgewichte eingebrannt, und danach bleiben diese Zahlen unverändert.

Gefährlich ist das, weil das Modell die Grenze selbst nicht bemerkt. Fragt man nach etwas aus der Zeit danach, verweigert es nicht, sondern setzt aus dem zusammen, was es kennt. So entsteht Code für eine alte Version: Er sieht stimmig aus, lässt sich oft übersetzen und scheitert an den Stellen, die sich geändert haben. Die Lösung ist immer gleich – aktuelle Angaben in den Kontext legen, etwa die Dokumentation der installierten Version.

**Verwandt:** [[training]] · **Parametrisches Wissen** · [[kontextfenster]]

### Modell (Model)

**Ein Modell ist die Gesamtheit seiner Parameter; es sagt das nächste Token voraus und tut von sich aus nichts weiter.**

Ein Modell arbeitet zustandslos: Es nimmt Text auf und sagt jeweils das nächste Token voraus, mehr nicht. Von sich aus kann es nichts Handfestes tun – keine Dateien lesen, keine Befehle ausführen, nicht im Netz suchen und sich nicht an gestern erinnern. Alles, was wie ein Agent wirkt, entsteht dadurch, dass ein Harness viele dieser Vorhersagen hintereinander ordnet.

Anbieter liefern Modelle in Stufen: ein großes, klügeres, aber langsameres und teureres sowie kleinere, schnellere und günstigere. Diese Wahl ist eine echte Entscheidung. Wer genau wissen will, wo ein Fehler liegt, prüft, was das Modell bekommen hat: Enttäuschende Ergebnisse stammen meist aus Kontext oder Harness, nicht aus den Parametern.

**Verwandt:** [[modellgewichte]] · [[harness]] · [[werkzeugaufruf]]

### Modellanbieter (Model Provider)

**Ein Modellanbieter ist die Stelle, die ein Modell für die Inferenz bereitstellt.**

Meist ist das ein entfernter Dienst, es kann aber auch lokal laufen, etwa auf dem eigenen Rechner. Der Harness führt das Modell nicht selbst aus, er bittet einen Anbieter darum. Der Anbieter besitzt die Maschinerie: Die Parameter liegen auf seiner Hardware, und jede Anfrage besteht darin, dass der Harness Tokens über das Netz sendet und Vorhersagen zurückbekommt.

Damit ist der Anbieter die Quelle von Problemen, die man leicht dem Modell anlastet: Nutzungsgrenzen und Ausfälle. Stockt ein Agent mitten in einer Sitzung, lohnt zuerst ein Blick auf die Statusseite des Anbieters. Der Anbieter legt außerdem die Preise fest: je Eingabe- und Ausgabe-Token und Rabatte für den Präfix-Cache. Anbieter und Hersteller können verschiedene Firmen sein.

**Verwandt:** [[inferenz]] · [[token]] · [[harness]]

### Modellanfrage (Model Provider Request)

**Eine Modellanfrage ist ein einzelner Austausch zwischen Harness und Modellanbieter.**

Der Harness sendet den aktuellen Kontext, der Anbieter antwortet einmal – mit einem Werkzeugaufruf oder einer endgültigen Antwort. Aus einer einzigen Nutzereingabe können viele solcher Anfragen werden, denn jedes Werkzeugergebnis löst eine weitere Anfrage aus. Jede Anfrage führt alles mit: die Systemanweisung, den bisherigen Gesprächsverlauf und jedes Ergebnis.

Weil das Modell zustandslos ist, wiederholt sich bei jeder Anfrage fast der gesamte Inhalt; der Präfix-Cache macht diese Wiederholung bezahlbar. Die Anfrage ist zugleich die Abrechnungseinheit. Ein harmlos wirkender Auftrag kann überraschend viel kosten, weil die Kosten von der Zahl der Anfragen und der Größe des mitgeführten Kontexts abhängen, nicht von der Länge der gestellten Frage.

**Verwandt:** [[werkzeugaufruf]] · [[harness]] · [[token]]

### Nächstes-Token-Vorhersage (Next-Token Prediction)

**Die Nächstes-Token-Vorhersage ist die einzige Arbeitsweise eines Modells: Es wählt aus dem Kontext das nächste Token.**

Aus einem Kontext wählt das Modell ein nächstes Token, hängt es an und läuft erneut. Jede Ausgabe – ein Satz, ein Werkzeugaufruf, eine lange Datei – entsteht Token für Token. Jeder Schritt läuft gleich ab: Die Tokens im Kontextfenster durchlaufen die Parameter, die für jedes Token des Wortschatzes eine Wahrscheinlichkeit erzeugen. Eines wird daraus gezogen, angehängt, und die Schleife läuft mit dem nun etwas längeren Kontext weiter.

Dieser Zufallsschritt erklärt, warum dieselbe Eingabe unterschiedliche Ausgaben liefern kann. Das Modell prüft außerdem nie, ob ein Token wahr ist, sondern nur, ob es wahrscheinlich ist – daraus entstehen Halluzinationen. Und weil die Ausgabe strikt Token für Token entsteht, hat die Erzeugungsgeschwindigkeit eine Untergrenze.

**Verwandt:** [[sampling]] · [[halluzination]] · [[modellgewichte]]

### Nichtdeterminismus (Non-Determinism)

**Nichtdeterminismus bedeutet, dass dieselbe Eingabe zu unterschiedlichen Ausgaben führen kann.**

Lässt man ein Modell zweimal mit gleichem Kontext laufen, kommen manchmal andere Wörter oder sogar ein ganz anderer Lösungsweg heraus. Am eigenen Code muss sich dafür nichts ändern. Der Grund liegt in der Erzeugung: Das Modell bildet Wahrscheinlichkeiten über mögliche nächste Tokens und zieht eines daraus, meist absichtlich mit etwas Zufall. Ein anders gezogenes Token früh im Text verändert alles Folgende. Auch die Auslieferung beim Anbieter bringt Schwankungen, weil Anfragen auf gemeinsamer Hardware gebündelt werden.

Daraus folgen zwei Dinge. Wiederholen ist eine legitime Strategie – ein misslungener Versuch ist nur eine Ziehung. Und Prüfungen sind wichtiger als bei eindeutigen Werkzeugen. Aus ein paar schlechten Läufen sollte man nicht schließen, das Modell sei schlechter geworden.

**Verwandt:** [[sampling]] · [[inferenz]] · **Modellanbieter**

### Ausgabe-Token (Output Tokens)

**Ausgabe-Token sind die Tokens, die das Modell selbst erzeugt und zurückgibt; sie werden teurer abgerechnet als Eingabe-Token.**

Alles, was das Modell schreibt, zählt dazu: der sichtbare Text, der Code, Werkzeugaufrufe und auch längeres Nachdenken vor der Antwort. Dieser letzte Punkt überrascht viele – Denk-Tokens werden als Ausgabe berechnet, auch wenn der Harness sie oft nicht zeigt. Der höhere Satz, häufig etwa das Fünffache der Eingabe, liegt daran, dass ihre Erzeugung mehr Rechenleistung kostet.

Ausgabe-Token bestimmen zudem das Tempo. Eingaben liest das Modell schnell, Ausgaben erzeugt es Token für Token. Wirkt eine Antwort langsam, liegt es fast immer an der Ausgabe, nicht an der Eingabe. Eine lange Wartezeit kündigt meist eine lange Antwort an.

**Verwandt:** [[token]] · [[werkzeugaufruf]] · [[inferenz]]

### Parameter (Parameters)

**Parameter sind die Zahlen im Inneren eines Modells, die beim Training eingestellt werden; darin liegt alles Wissen.**

Oft sind es Milliarden solcher Zahlen; man nennt sie auch Gewichte. Sie verwandeln Eingabe in Ausgabe: Die Tokens im Kontextfenster werden durch die Parameter gerechnet, und heraus kommt eine Vorhersage für das nächste Token. Eine Datenbank mit Fakten gibt es nicht, nur diese Zahlen, so angeordnet, dass die Rechnung brauchbare Ergebnisse liefert.

Wichtig ist, dass Parameter nach dem Training eingefroren bleiben. Nichts in einer Sitzung verändert sie – keine Korrektur, kein gezeigter Code, kein gelernter Fehler. Deshalb ist das Modell zustandslos, endet sein Wissen am Wissensstichtag, und alles Projektspezifische muss über den Kontext kommen. Geändert werden sie nur durch weiteres Training.

**Verwandt:** [[training]] · [[feinabstimmung]] · [[kontextfenster]]

### Parametrisches Wissen (Parametric Knowledge)

**Parametrisches Wissen ist das, was ein Modell aus dem Training kennt und in seinen Parametern trägt.**

Es ist beim Training eingefroren und lässt sich vom Modell nicht ändern. Bei der Verdichtung geht Feinheit verloren: Milliarden Fakten müssen in eine feste Zahl von Parametern passen, seltene verschwimmen. Fakten werden nämlich nicht als Einträge gespeichert. Das Training stellt die Parameter so ein, dass das Modell Text gut vorhersagt, und ein Modell, das über ein Thema gut vorhersagt, verhält sich, als kenne es das Thema.

Wie verlässlich das Wissen ist, hängt davon ab, wie oft etwas in den Trainingsdaten vorkam. Wiedergeben und Raten sind für das Modell derselbe Vorgang, deshalb klingt eine erfundene Antwort so flüssig wie eine richtige. Nach dem Wissensstichtag endet dieses Wissen zusätzlich.

**Verwandt:** [[training]] · [[halluzination]] · [[kontextfenster]]

### Präfix-Cache (Prefix Cache)

**Ein Präfix-Cache ist ein Speicher beim Anbieter, der den gleichbleibenden Anfang aufeinanderfolgender Anfragen wiederverwendet.**

Stimmt der Beginn einer Anfrage mit dem einer früheren überein – dieselbe Systemanweisung, derselbe Verlauf bis zu einem Punkt –, nutzt der Anbieter seine frühere Arbeit und rechnet diese Tokens günstiger ab. Das lohnt sich, weil Sitzungen stetig wachsen. Jede Anfrage sendet den ganzen Verlauf erneut, und in einer normalen Sitzung ändert sich dieser nur am Ende.

Der Anbieter bearbeitet den langen gemeinsamen Anfang einmal, speichert das Ergebnis und setzt am Ende des Präfixes fort. Ohne ihn müsste eine lange Sitzung den Anfang immer wieder neu bezahlen. Cache-Einträge laufen aber ab, meist nach Minuten. Lässt man eine Sitzung lange ruhen, wird der Anfang beim nächsten Mal einmal zum vollen Preis neu berechnet.

**Verwandt:** [[token]] · **System-Prompt** · [[harness]]

### Sykophantie (Anbiederung)

**Sykophantie bezeichnet selbstsicher zustimmende Ausgaben eines Modells.**

Sie entsteht durch Training: Das Modell wurde auf Antworten ausgerichtet, die Menschen gefallen, und Zustimmung gefällt leichter als ein Widerspruch. So lernte es, dass Zustimmen belohnt wird – auch wenn es falsch ist. Man erkennt es daran, dass das Modell eine richtige Antwort zurücknimmt, wenn man unter Druck „bist du sicher?" fragt. Oder es lobt einen fehlerhaften Plan, bevor es ihn prüft. Auch die Bewertung verschiebt sich: Wer den Text selbst geschrieben hat, bekommt eher Lob.

**Oft missverstanden:** Der Begriff steht nur für falsche Antworten, die einem zufällig gefallen. Ohne Gegenprobe sagt er nicht mehr als „falsch". Ein Test ist die Frage, ob das Modell dasselbe auch ohne den Hinweis gesagt hätte; hat sich nur der Ton geändert, ist es Anbiederung.

**Verwandt:** [[training]] · [[prompt]]

### Token (Textstück)

**Ein Token ist die kleinste Einheit, die ein Modell liest und schreibt; es ist ungefähr wortgroß, aber nicht genau.**

Häufige Wörter sind ein Token, seltene oder lange zerfallen in mehrere. Größe des Kontextfensters, Kosten und Geschwindigkeit werden alle in Tokens gezählt. Text wird über einen Tokenizer in Tokens zerlegt, einen festen Wortschatz aus Zehntausenden Bruchstücken. Als Faustregel ist ein Token etwa drei Viertel eines englischen Wortes, tausend Tokens also rund 750 Wörter.

Bei Code gilt das weniger: Häufige Schlüsselwörter werden kompakt gespeichert, erzeugte Bezeichner und Zeichenketten wie Prüfsummen zerfallen in viele kleine Stücke. Solche Textstücke belegen deshalb überraschend viel Platz im Kontextfenster.

**Oft missverstanden:** Ein Token ist kein Wort. Die Grenzen stimmen nicht überein, und aussagekräftig sind eher Tokens pro Sekunde und Tokens pro Geldeinheit.

**Auch als eigenes Blatt:** [[token]]

**Verwandt:** [[tokenizer]] · [[kontextfenster]]

### Training (Einübung)

**Training ist der Vorgang, der die Parameter eines Modells festlegt.**

Das Modell sieht sehr viel Text, sagt jeweils das nächste Token voraus, und die Parameter werden in Richtung des tatsächlichen nächsten Tokens verschoben. Das wiederholt sich über Billionen Tokens. Es ist ein einmaliger, teurer Vorgang, den der Modellanbieter durchführt, und umfasst sowohl das große Grundtraining als auch spätere Verfeinerungen wie das Befolgen von Anweisungen.

Nichts wird als Fakten oder Regeln gespeichert: Alles, was das Modell „weiß", ist ein Nebeneffekt des besseren Vorhersagens. Zwei Folgen zählen im Alltag. Training endet zu einem Zeitpunkt, daher hat jedes Modell einen Wissensstichtag. Und Training ist nichts, was man selbst tut: Fehlen dem Modell der eigene Code, die eigenen Konventionen oder interne Schnittstellen, gehören diese Unterlagen in den Kontext.

**Auch als eigenes Blatt:** [[training]]

**Verwandt:** [[modellgewichte]] · [[feinabstimmung]]

## Agenten, Werkzeuge und ihre Grenzen

### Agent

**Ein Agent ist ein Modell in einer Schleife: wahrnehmen, entscheiden, handeln.**

Ein Agent entsteht, wenn ein Modell mit Werkzeugen, einer Systemanweisung und einem Kontextfenster ausgestattet wird und abwechselnd mit einem Menschen arbeitet. Angesprochen wird im Alltag genau diese Einheit, etwa Claude Code oder Cursor. Der Agent ist kein Bauteil im Inneren, sondern die arbeitende Verbindung aus Modell und Gestell.

Das Modell selbst ist nur eine Datei mit Parametern, das Gestell ist Software. Erst im Zusammenspiel wird daraus etwas, dem man eine Aufgabe übergibt: Es liest die Nachricht, greift zu Werkzeugen und antwortet. Wer sagt, der Agent habe den Build zerstört, meint diese Kombination.

**Oft missverstanden:** Bezeichnungen wie "die KI" oder "der Bot" sind zu unbestimmt. Sie lassen offen, ob das Modell allein oder das gesteuerte Gesamtsystem gemeint ist.

**Auch als eigenes Blatt:** [[agent]]

**Verwandt:** [[harness]] · [[werkzeugaufruf]] · [[kontextfenster]]

### Agenten-Modus (Agent Mode)

**Ein Agenten-Modus ist eine Voreinstellung, die festlegt, wie ein Agent arbeitet: welche Werkzeugaufrufe erlaubt sind und welche Verhaltensanweisungen zusätzlich gelten.**

Ein Modus verbindet zwei Dinge: einen Berechtigungsmodus, der über einzelne Werkzeugaufrufe entscheidet, und Verhaltensanweisungen, die dem Agenten sagen, was gerade von ihm erwartet wird. So blockiert ein Planungsmodus nicht nur das Schreiben, sondern teilt dem Agenten mit, dass er sich in einer Planungsphase befindet, sodass er liest, fragt und vorschlägt. Ohne diese zusätzliche Steuerung würde er weiter schreiben wollen und gegen die Sperre anrennen.

Den Modus wechselt man mit dem eigenen Vertrauen. Dieselbe Aufgabe kann durch mehrere Modi laufen: zuerst Planung, dann der vorsichtige Standard, später automatische Bearbeitungen. Der Wechsel kostet nichts, das Gespräch läuft an derselben Stelle weiter.

**Verwandt:** [[harness]] · [[sandbox]] · **Berechtigungsmodus** · **Sitzung**

### AGENTS.md (Anweisungsdatei)

**Eine AGENTS.md ist eine Datei in der Umgebung, die das Gestell beim Start einer Sitzung automatisch in das Kontextfenster lädt — die dauerhafte Anweisung des Projekts an den Agenten.**

Weil sie automatisch geladen wird, erspart sie das ständige Wiederholen. Das Modell ist zustandslos: Eine Korrektur aus einer Sitzung ist in der nächsten verschwunden, und man erklärt jeder neuen Sitzung erneut, dass Tests mit einem besonderen Schalter laufen. Wer zweimal dasselbe korrigiert, hat einen Kandidaten für die AGENTS.md.

Hinein gehört, was sich nicht aus dem Code ableiten lässt: Bau- und Testbefehle, feste Regeln, knappe Hinweise. Der Nachteil: Alles darin wird immer geladen und kostet Token.

**Oft missverstanden:** Selten gebrauchte Inhalte gehören nicht in die AGENTS.md. Alles darin kostet in jeder Sitzung Token und verwässert sich selbst, wenn die Datei wächst.

**Verwandt:** [[kontextfenster]] · [[token]] · [[harness]] · **Dateisystem**

### Autokompaktierung (Autocompact)

**Autokompaktierung ist eine Kompaktierung, die das Gestell von selbst auslöst, sobald sich das Kontextfenster füllt.**

Das Gestell beobachtet, wie voll das Kontextfenster ist. Überschreitet es eine Schwelle, oft bei etwa achtzig Prozent, hält es inne, lässt das Modell die bisherige Sitzung zusammenfassen und eröffnet mit dieser Zusammenfassung eine neue Sitzung. Die Arbeit läuft danach weiter, als wäre nichts geschehen.

Nur ist etwas geschehen: Die Zusammenfassung ist verlustbehaftet, und sie geschieht zu einem Zeitpunkt, den man nicht gewählt hat. Sie trifft mitten in einer Aufgabe ein und entscheidet selbst, welche Festlegungen wichtig waren. Ein typisches Anzeichen ist ein Agent, der selbstsicher weiterarbeitet, aber eine frühere Vorgabe stillschweigend vergessen hat.

**Verwandt:** [[kontextfenster]] · [[harness]] · **Kompaktierung** · **Übergabedokument**

### Kontext leeren (Clearing)

**Kontext leeren heißt, die laufende Sitzung zu beenden und eine frische zu beginnen. Die nächste Nachricht startet mit leerem Kontextfenster.**

Leeren ist das Mittel gegen einen belasteten Kontext. In einer Sitzung sammelt sich alles: gescheiterte Versuche, Irrwege, veraltete Werkzeugergebnisse, aufgegebene Pläne. Das Modell liest das bei jedem Zug erneut, und eine schlechte Vorgeschichte zieht neue Arbeit herunter. Tief in einer langen Sitzung wird der Agent ungenauer und weniger folgsam, obwohl die Anweisungen klar waren.

Das Leeren löscht das Gespräch nicht. Die meisten Gestelle behalten den Verlauf auf dem Rechner, er bleibt lesbar oder fortsetzbar. Verloren geht der Arbeitszustand: Das Modell ist zustandslos, die neue Sitzung weiß nichts von der alten. Wichtige Entscheidungen sollte der Agent vorher in ein Übergabedokument schreiben.

**Verwandt:** **Kompaktierung** · **Übergabedokument** · [[kontextfenster]] · **Sitzung**

### Kompaktierung (Compaction)

**Kompaktierung ist eine Übergabe im Arbeitsspeicher: Der bisherige Verlauf einer Sitzung wird zusammengefasst, und diese Zusammenfassung eröffnet eine neue Sitzung.**

Das Kontextfenster ist begrenzt, und eine lange Sitzung füllt es. Wird es zu schwer, bittet das Gestell das Modell um eine Zusammenfassung, verwirft den ursprünglichen Verlauf und beginnt mit dem Text von vorn. Was nicht in die Zusammenfassung gelangt ist, fehlt danach im Kontext. Manche Gestelle legen den alten Verlauf zusätzlich auf der Festplatte ab und setzen einen Verweis darauf, sodass Verlorenes nachgelesen werden kann.

Die Zusammenfassung schreibt das Modell, deshalb lässt sie sich steuern: Ein Hinweis, welche Festlegungen erhalten bleiben sollen, macht sie gezielter. Der Zeitpunkt zählt ebenso — sinnvoll ist eine Grenze zwischen zwei Arbeitsphasen, nicht mitten in der Aufgabe.

**Verwandt:** **Übergabe** · **Kontext leeren** · [[kontextfenster]] · **Autokompaktierung**

### Umgebung (Environment)

**Die Umgebung ist die Welt, auf die ein Agent einwirkt: alles außerhalb des Gestells, das er über Werkzeugergebnisse wahrnimmt und über Werkzeugaufrufe verändert.**

Das Gestell lässt den Agenten laufen, die Umgebung ist das, worin er arbeitet. AGENTS.md liegt in der Umgebung, das Gestell lädt sie in das Kontextfenster. Ein Dateisystem ist die häufigste Umgebung, aber nicht die einzige; auch eine Datenbank zählt dazu.

Der Agent sieht die Umgebung nur, wenn er hinschaut: Alles, was er über sie weiß, kam über ein Werkzeugergebnis. Ändert sich eine Datei später, arbeitet er weiter mit der alten Kopie. Die Umgebung ist zudem die Schicht, die bleibt — was ein Agent morgen noch wissen soll, steht dort.

**Oft missverstanden:** "Umgebung" meint nicht die Laufzeit oder das Gestell, sondern den Arbeitsbereich des Agenten.

**Verwandt:** [[harness]] · [[sandbox]] · **Dateisystem** · [[werkzeugaufruf]]

### Dateisystem (Filesystem)

**Ein Dateisystem ist ein Baum aus Dateien und Verzeichnissen, aus dem ein Agent liest, in den er schreibt und in dem er Befehle ausführt — die übliche Umgebung für einen Programmier-Agenten.**

Anweisungsdateien, Skills, Quellcode, Bauskripte und Werkzeugkonfigurationen liegen alle in einem Dateisystem. Wenn ein Gestell "in einem Projekt startet", richtet es den Agenten auf ein Dateisystem.

Der Agent berührt es nur über Werkzeugaufrufe: eine Datei lesen, eine schreiben, einen Befehl ausführen. Nichts auf der Festplatte steht im Kontextfenster, bis ein Aufruf es lädt. Dadurch kann der Agent in einem Projekt arbeiten, das weit größer ist als das Fenster: Das Dateisystem hält alles, der Kontext nur das Gelesene. Und es ist mit dem Menschen geteilt — dieselben Dateien öffnet man im Editor und vergleicht sie in der Versionsverwaltung.

**Verwandt:** **Umgebung** · [[werkzeugaufruf]] · [[kontextfenster]] · [[sandbox]]

### Übergabe (Handoff)

**Eine Übergabe bringt den Kontext eines Agenten von einer Sitzung in die nächste, und zwar ohne Rückweg.**

Das Transportmittel ist unterschiedlich: ein geschriebenes Übergabedokument, eine Zusammenfassung im Arbeitsspeicher oder anderes. Von der Übergabe zu unterscheiden ist das Leeren, bei dem überhaupt nichts mitgenommen wird. Die Anlässe sind verschieden: ein Rollenwechsel von der Planung zur Umsetzung, der Start eines unbeaufsichtigten Laufs, das Aufteilen auf mehrere Sitzungen oder das Freimachen von Platz im Kontextfenster.

Die aufnehmende Sitzung startet ohne Kontext; das Modell ist zustandslos, und nichts aus der alten Sitzung ist für die neue sichtbar. Alles, was gebraucht wird, muss ausdrücklich mitgegeben werden. Ohne Rückweg kann die neue Sitzung nicht nachfragen, was gemeint war — das Mitgegebene muss für sich stehen.

**Verwandt:** **Übergabedokument** · **Kompaktierung** · [[kontextfenster]] · **Sitzung**

### Übergabedokument (Handoff Artifact)

**Ein Übergabedokument ist eine Datei, die eine Sitzung schreibt, damit eine andere sie liest — das Transportmittel für eine Übergabe.**

Der Grund dafür liegt im zustandslosen Modell: Nichts aus einer Sitzung übersteht das Leeren. Entscheidungen, Vorgaben und halbfertige Pläne verschwinden mit dem Kontext. Die Umgebung dagegen bleibt. Wichtiges in eine Datei zu schreiben heißt also, es an einen Ort zu bringen, von dem die nächste Sitzung es zurücklesen kann.

Das Dokument ist eine zweite Quelle, ein Bericht über die Arbeit, nicht die Arbeit selbst. Es beschreibt, was die schreibende Sitzung glaubte; Ausgelassenes oder Falsches bleibt unsichtbar. Wo eine Aussage wichtig ist, sollte die nächste Sitzung sie gegen den Code und die Tests prüfen. Brauchbar ist ein Dokument, das ohne Vorwissen verständlich ist: konkrete Pfade, Entscheidungen samt Begründung, Stand und Restarbeit.

**Verwandt:** **Übergabe** · **Umgebung** · [[quellenkritik]] · **Kompaktierung**

### Harness (Gestell)

**Das Gestell ist alles rund um das Modell, das daraus einen Agenten macht: Werkzeuge, Systemanweisung, Kontextverwaltung, Berechtigungen und Haken.**

Das Modell selbst tut nur eines: Text hineinnehmen und Text ausgeben. Es kann keine Datei lesen, keinen Befehl ausführen und sich nicht an den letzten Zug erinnern. Das Gestell liefert all das. Es stellt den Kontext für jede Anfrage zusammen, führt die gewünschten Werkzeugaufrufe aus, gibt deren Ergebnisse zurück, speichert den Sitzungsverlauf, fragt vor riskanten Schritten um Erlaubnis und entscheidet, wann kompaktiert wird.

Das ist wichtig für die Fehlersuche. Wenn sich zwei Produkte unterschiedlich verhalten, ist oft nicht das Modell die Ursache, sondern das Gestell: eine andere Systemanweisung, andere Werkzeuge, eine geänderte Voreinstellung. Dort liegt auch der größte Teil der eigenen Einstellungen.

**Auch als eigenes Blatt:** [[harness]]

**Verwandt:** [[agent]] · [[werkzeugaufruf]] · [[kontextfenster]]

### MCP (Model Context Protocol)

**MCP ist ein Protokoll, mit dem sich externe Werkzeug-Server an ein Gestell anschließen lassen — so bekommt ein Agent Werkzeuge, die über die mitgelieferten hinausgehen.**

Der Agent ruft nie "MCP" auf. Er ruft ein Werkzeug auf, und das Gestell hat dieses Werkzeug von einem MCP-Server bezogen. Das Protokoll löst ein Anbindungsproblem: Ohne einen Standard bräuchte jedes Gestell seine eigene Anbindung an ein Ticketsystem, an einen Chatdienst, an eine Datenbank. Mit MCP wird die Anbindung einmal als Server geschrieben, und jedes passende Gestell kann sie nutzen.

Bezahlt wird das mit Kontext. Jedes angebotene Werkzeug kommt als Beschreibung mit Namen, Erläuterung und Parameterschema, und das Modell kann nur Werkzeuge aufrufen, die es kennt. Manche Gestelle laden deshalb nur einen Verweis und suchen Werkzeuge bei Bedarf heraus.

**Auch als eigenes Blatt:** [[mcp]]

**Verwandt:** [[harness]] · [[werkzeugaufruf]] · [[kontextfenster]]

### Gedächtnis-System (Memory System)

**Ein Gedächtnis-System versucht, einen Agenten über Sitzungen hinweg zustandsbehaftet zu machen: Es schreibt Informationen in die Umgebung und lädt sie beim Start neuer Sitzungen wieder.**

Ein solches System hat zwei Hälften. Der Schreibweg: Während einer Sitzung legt der Agent ab, was er gelernt hat — Vorlieben, Fakten über das Projekt — als Dateien in der Umgebung. Der Leseweg: Beim Start lädt das Gestell diese Dateien oder einen Index zurück in das Kontextfenster. Viele Gestelle bringen so etwas mit; man kann es auch selbst bauen.

Es gelten die Abwägungen aller dauerhaft geladenen Inhalte. Erinnerungen sammeln sich an, deshalb laden die meisten Systeme nur einen kurzen Index. Außerdem sind sie zweite Quellen und veralten: Eine Notiz vom März wird im Juni mit gleicher Sicherheit geladen, obwohl das Projekt längst weiter ist.

**Verwandt:** **Umgebung** · [[kontextfenster]] · [[quellenkritik]] · **AGENTS.md**

### Berechtigungsmodus (Permission Mode)

**Der Berechtigungsmodus legt fest, welche Werkzeugaufrufe automatisch laufen und welche zuerst nach Erlaubnis fragen.**

Gestelle liefern eine Leiter solcher Stufen. Ganz oben steht ein Lesemodus, der nur liest und Schreibversuche sperrt — geeignet für Recherche und Planung. Darunter der Standard, der harmlose Schritte durchlässt und bei allem anderen nachfragt. Darunter ein Modus, der Bearbeitungen selbst ausführt, aber bei Befehlen nachfragt. Ganz unten ein Modus, der alles erlaubt, üblich nur in einer Sandbox.

Die Wahl ist ein Handel zwischen Sicherheit und Unterbrechung, und beide Extreme sind zu spüren. Zu streng wird der Mensch zum Flaschenhals: Der Agent hält ständig an, und man bestätigt ohne hinzusehen, sodass die Erlaubnisse bedeutungslos werden. Zu locker bearbeitet der Agent Dateien und führt Befehle aus, die man vorher gesehen hätte.

**Verwandt:** **Agenten-Modus** · [[sandbox]] · [[werkzeugaufruf]] · [[leitplanke]]

### Berechtigungsanfrage (Permission Request)

**Eine Berechtigungsanfrage ist die Rückfrage, mit der ein Harness den Nutzer um Erlaubnis bittet, bevor ein Werkzeugaufruf ausgeführt wird, der nicht vorab freigegeben ist.**

Das Modell erzeugt einen Werkzeugaufruf; statt ihn sofort auszuführen, hält der Harness an und zeigt die Anfrage. Stimmt der Nutzer zu, läuft der Aufruf. Lehnt er ab, erhält das Modell die Ablehnung als Werkzeugergebnis zurück und sucht einen anderen Weg. So kommt ein Mensch an den riskanten Stellen in den Ablauf. Eine Ablehnung steuert den Agenten wie jedes andere Ergebnis auch.

Der Preis ist das Warten. Jede Anfrage blockiert den Lauf, bis geantwortet wird. Wer nicht daneben sitzt, kann den Agenten deshalb nicht arbeiten lassen. Die übliche Lösung ist, ungefährliche Werkzeuge vorab zu erlauben und die gefährlichen durch eine [[sandbox]] abzusichern.

**Verwandt:** [[harness]] · [[werkzeugaufruf]] · [[sandbox]]

### Schrittweises Aufdecken (Progressive Disclosure)

**Schrittweises Aufdecken bedeutet, nur den Kontext zu laden, den ein Agent gerade braucht, und den Rest über Verweise erreichbar zu halten.**

Das Verfahren stammt aus dem Design von Benutzeroberflächen, wo nur die Bedienelemente der aktuellen Aufgabe sichtbar sind und der Rest hinter einem Klick liegt. Der Grund ist der doppelte Preis von Kontext: Jedes Token wird bei jedem Gesprächszug erneut berechnet und beansprucht Aufmerksamkeit, ob es gebraucht wird oder nicht. Eine Datei, die Stilrichtlinie, Betriebshandbuch und Datenbankregeln auf einmal enthält, macht den Agenten in allen drei Bereichen schlechter, weil die wichtigen Regeln von den unwichtigen verwässert werden.

Die Gegenbewegung ist einfach: Die ständig geladene Ebene bleibt klein, oft nur ein Satz je Thema samt Verweis auf den Ort der Details. Ein **Skill** ist dieses Muster fest im [[harness]] verankert.

**Verwandt:** [[harness]] · [[token]] · **Skill**

### Sandkasten (Sandbox)

**Ein Sandkasten ist eine abgeschottete Umgebung, in der ein Agent läuft — ein Container, eine virtuelle Maschine oder eine eingeschränkte Shell.**

Die Isolation begrenzt den Schaden, den der Agent anrichten kann: Selbst wenn er zerstörerische Befehle ausführt oder etwas Schädliches herunterlädt, bleibt der Schaden eingegrenzt. Damit wird unbeaufsichtigtes Arbeiten überhaupt praktikabel. Sandkasten und Berechtigungsanfragen lösen dasselbe Problem von zwei Seiten. Anfragen fragen vor der Ausführung, ein Sandkasten begrenzt, was die Ausführung erreichen kann. Je stärker die Isolation, desto weniger Rückfragen sind nötig.

Die Abschottung gibt es in Stufen, von der eingeschränkten Shell über einen frischen Container ohne Zugangsdaten bis zur getrennten Maschine. Was kein Sandkasten verhindert, sind Handlungen, die ihn berechtigt verlassen — ein Agent mit Netzwerkzugang kann fremde Dienste aufrufen. Man entscheidet also zuerst, was die Grenze überschreiten darf.

**Auch als eigenes Blatt:** [[sandbox]]

**Verwandt:** [[agent]] · **Berechtigungsanfrage**

### Sitzung (Session)

**Eine Sitzung ist ein zusammenhängender, begrenzter Lauf der Zusammenarbeit mit einem Agenten.**

Sie beginnt leer, sammelt Nachrichten, Werkzeugergebnisse und gelesene Dateien und endet, wenn sie geleert, geschlossen oder in eine neue Sitzung überführt wird. Bildlich gesprochen: Wenn das [[kontextfenster]] die Kiste ist, dann ist die Sitzung das, was sie nach und nach füllt. Arbeit, die größer ist als ein Kontextfenster, muss auf mehrere Sitzungen verteilt werden.

Der Nachrichtenverlauf ist das Arbeitsgedächtnis des Agenten. Das Modell selbst ist zustandslos, also liegt alles, woran es sich zu erinnern scheint, im Verlauf und wird bei jeder Anfrage erneut mitgeschickt. Was nicht in der Sitzung steht, existiert für den Agenten nicht. Mit dem Ende der Sitzung endet auch dieses Gedächtnis; was bleibt, ist das Dateisystem. Deshalb sollte man pro Sitzung möglichst eine Aufgabe bearbeiten.

**Verwandt:** [[kontextfenster]] · [[agent]] · **Zustandslos**

### Skill (Fertigkeit)

**Ein Skill ist eine gebündelte, vermittelbare Fähigkeit — Anweisungen und Hilfsmittel für eine bestimmte Aufgabe, die außerhalb des Kontexts lagern, bis sie gebraucht werden.**

Der Skill bleibt in der Umgebung, bis ein Verweis ihn für die aktuelle Aufgabe ins Kontextfenster holt. Er ist damit die Einheit des schrittweisen Aufdeckens in einem Harness. Nur Name und Beschreibung belegen standardmäßig Platz; passt die Aufgabe, lädt der Agent den Rest.

Das unterscheidet Skills von Dateien, die in jeder Sitzung geladen werden, unabhängig von der Aufgabe. Ein Skill wird gelesen, wenn eine bestimmte Art von Arbeit ansteht, und sonst ignoriert.

**Oft missverstanden:** Ein Skill ist kein Werkzeug — ein **Werkzeug** ist etwas, das der Agent aufruft; ein Skill ist etwas, das er liest.

**Verwandt:** [[harness]] · [[kontextfenster]] · **Werkzeug**

### Spezifikation (Spec)

**Eine Spezifikation ist ein Übergabedokument, das eine Arbeit über mehrere Sitzungen beschreibt: was entsteht, nicht wie jede einzelne Sitzung ihren Teil erledigt.**

Sie verändert sich mit dem Fortschritt und besteht aus einzelnen Arbeitspaketen. Nötig ist sie, weil Sitzungen vergänglich sind, große Arbeit aber nicht: Alles, was mehr als ein Kontextfenster an Aufwand braucht, benötigt einen Ort außerhalb des Kontexts, der das Leeren übersteht — etwa eine Datei im Projekt oder eine Aufgabenliste. Dort stehen Ziel, Randbedingungen, bisherige Entscheidungen und der Stand der Arbeitspakete. Eine neue Sitzung kann das lesen und weiß sofort, wo die Arbeit steht.

Die Form ist unterschiedlich — einmal stärker auf das Nutzererlebnis ausgerichtet, einmal technischer —, aber für den Agenten ist jede dieser Formen dasselbe: die dauerhafte Absichtserklärung am Anfang jeder Sitzung.

**Verwandt:** [[agent]] · [[kontextfenster]] · **Sitzung**

### Zustandsbehaftet (Stateful)

**Zustandsbehaftet bedeutet, dass Information weitergetragen wird.**

Eine Sitzung ist über ihre Gesprächszüge hinweg zustandsbehaftet: Der Kontext wächst, während sie läuft, weshalb lange Sitzungen allmählich unzuverlässig werden. Ein Agent lässt sich über Sitzungen hinweg zustandsbehaftet machen, indem ein Gedächtnissystem Informationen in der Umgebung ablegt und bei späteren Sitzungen wieder lädt. Das Modell selbst ist nie zustandsbehaftet; jede scheinbare Kontinuität entsteht dadurch, dass der Harness den Kontext erneut zuführt.

Jede Ebene baut ihren Zustand, indem sie etwas liest, das eine Ebene tiefer gespeichert ist. Die Sitzung wirkt zusammenhängend, weil der Harness den Nachrichtenverlauf erneut an das zustandslose Modell sendet. Zustand ist nicht immer erwünscht: Auch eine frühe falsche Annahme wird weitergetragen.

**Verwandt:** **Sitzung** · **Zustandslos** · [[agent]] · [[harness]]

### Zustandslos (Stateless)

**Zustandslos bedeutet, dass keine Information weitergetragen wird.**

Das Modell ist über einzelne Anfragen hinweg zustandslos: Jede Anfrage sendet das vollständige Kontextfenster erneut, weil das Modell nichts anderes sehen kann. Ein Agent ist standardmäßig über Sitzungen hinweg zustandslos — eine neue Sitzung beginnt leer, ohne Spur der früheren. Das Modell selbst bleibt dauerhaft zustandslos: Seine Parameter sind nach dem Training eingefroren, und nichts, was beim Ausführen geschieht, verändert sie. Es lernt also nicht aus Korrekturen und erinnert sich nicht daran, dass man ihm gestern dasselbe gesagt hat.

Das Gefühl von Kontinuität innerhalb einer Sitzung erzeugt der Harness, indem er das Protokoll aufbewahrt und erneut mitschickt. Wenn etwas über Sitzungen hinweg erinnert werden soll, muss man es aufschreiben, an einer Stelle, die der Agent später wieder liest.

**Verwandt:** [[agent]] · [[training]] · **Zustandsbehaftet**

### Subagent (Unter-Agent)

**Ein Subagent ist ein Agent, der von einem anderen Agenten über einen Werkzeugaufruf gestartet wird.**

Er läuft in einer eigenen Sitzung mit eigenem Kontextfenster und meldet genau ein Werkzeugergebnis zurück. Anders als bei einer Übergabe erwartet der startende Agent ausdrücklich eine Rückmeldung. Ein Subagent kann keine weiteren Subagenten starten; der Baum bleibt eine Ebene tief. Der Zweck ist, unruhige Arbeit aus dem Kontext des Auftraggebers herauszuhalten. Eine breite Suche oder ein langes Durchlesen von Dateien erzeugt Seiten von Ergebnissen, von denen die meisten nur kurz wichtig sind. Läuft das im Auftraggeber, bleibt alles bis zum Ende der Sitzung dort.

Im Subagenten füllt der Lärm ein wegwerfbares Fenster, und nur der Abschlussbericht erreicht den Auftraggeber. Mehrere Subagenten können gleichzeitig an unabhängigen Teilen arbeiten.

**Verwandt:** [[werkzeugaufruf]] · [[kontextfenster]] · **Sitzung**

### System-Prompt (Systemanweisung)

**Ein System-Prompt ist die Anweisung, die der Harness jeder Anfrage an das Modell voranstellt — die dauerhafte Dienstanweisung des Agenten.**

Darin steht, wer er ist, wie er sich verhalten soll, welche Werkzeuge er aufrufen darf und welchen Konventionen er folgt. In der Regel bleibt der Text über eine Sitzung hinweg gleich. Er wird vom Anbieter des Harness geschrieben, nicht vom Nutzer, und ist in manchen Systemen sehr lang: Zehntausende Token aus Verhaltensregeln und Werkzeugbeschreibungen, die bei jedem Gesprächszug als Eingabe berechnet werden. Eigene dauerhafte Anweisungen laufen mit und werden zu Beginn der Sitzung daneben geladen.

Weil der Text bei jeder Anfrage gleich ist, bildet er den Anfang des Zwischenspeichers. Modelle lernen, den System-Prompt höher zu gewichten als Nutzernachrichten. Wenn ein Agent auf einer Konvention beharrt, folgt er meist seinem System-Prompt.

**Verwandt:** [[harness]] · [[prompt]] · [[token]]

### Werkzeug (Tool)

**Ein Werkzeug ist eine Funktion, die der Harness dem Agenten zum Aufrufen bereitstellt.**

Über Werkzeuge nimmt der Agent seine Umgebung wahr und verändert sie: Er kann sie nicht anders sehen als über Werkzeugergebnisse und nicht anders ändern als über Werkzeugaufrufe. Jeder Aufruf kostet eine zusätzliche Anfrage an den Modellanbieter, weil das Ergebnis erst zum Modell zurückgehen muss.

Ein Werkzeug besteht aus drei Teilen: einem Namen, einer Beschreibung und einem Schema für seine Parameter. Der Harness sendet diese Angaben mit jeder Anfrage, und das Modell wählt ein Werkzeug, indem es einen strukturierten Aufruf mit Argumenten erzeugt. Ausgeführt wird nie das Modell, sondern der Harness. Die Werkzeugliste bestimmt, was der Agent kann: Ein fähiges Modell mit schmaler Werkzeugauswahl bleibt ein schmaler Agent.

**Verwandt:** [[harness]] · [[werkzeugaufruf]] · [[mcp]]

### Werkzeugaufruf (Tool Call)

**Ein Werkzeugaufruf ist die Ausgabe des Modells, die ein Werkzeug und seine Argumente benennt — zunächst nur strukturierter Text.**

Er bewirkt von sich aus nichts; der Harness muss ihn lesen und ausführen. Das Modell lernt aus den Beschreibungen im System-Prompt, welche Werkzeuge es gibt, und gibt dann einen Aufruf mit Namen und Argumenten aus, meist als JSON, und hält an. Der Harness prüft ihn, führt ihn aus, wenn erlaubt, und schickt das Ergebnis als Werkzeugergebnis in der nächsten Anfrage zurück. Ein Gesprächszug besteht meist aus vielen solchen Runden.

Weil der Aufruf durch Vorhersage des nächsten Tokens entsteht, kann er falsch sein wie jede andere Ausgabe: ein Pfad, den es nicht gibt, ein Schalter, den der Befehl nicht kennt. Der Harness führt aus, was geschrieben wurde, nicht was gemeint war.

**Auch als eigenes Blatt:** [[werkzeugaufruf]]

**Verwandt:** [[harness]] · [[token]]

### Werkzeugergebnis (Tool Result)

**Ein Werkzeugergebnis ist das, was der Harness nach der Ausführung eines Werkzeugaufrufs zurücksendet — Dateiinhalte, Ausgabe oder ein Fehler.**

Es ist die einzige Sicht des Agenten auf seine Umgebung. Es reist in der nächsten Anfrage zum Modell, das dann entscheidet, was damit geschieht. Das Ergebnis bleibt für den Rest der Sitzung im Kontext. Meist macht es den größten Teil des Kontexts einer Arbeitssitzung aus: jede gelesene Datei, jeder Testlauf, jede Suche landet vollständig und belegt weiter Platz, lange nachdem es nützlich war. Wenige große Ergebnisse können eine Sitzung schneller an die Grenze des Kontextfensters treiben als das Gespräch selbst.

Weil das Ergebnis alles ist, was das Modell sieht, kann es die Umgebung dahinter nicht prüfen. Passt das Bild des Agenten von einem System nicht, lohnt der Blick in die Ergebnisse.

**Verwandt:** [[werkzeugaufruf]] · [[harness]] · [[token]]

### Turn (Gesprächszug)

**Ein Turn ist eine Nutzernachricht plus alles, was der Agent daraufhin tut, bis er wieder an den Nutzer abgibt.**

Er enthält eine oder mehrere Anfragen an das Modell — viele, wenn der Agent Werkzeuge aufruft. Eine Rückfrage schließt den Turn; die Antwort darauf öffnet den nächsten. Bemerkenswert ist, dass die Länge eines Turns der Agent entscheidet, nicht der Nutzer. Man übergibt eine Nachricht, und der Agent bestimmt, wie viele Werkzeugaufrufe er aneinanderreiht. Ein Turn kann eine Antwort in einem Satz sein oder zwanzig Minuten aus Lesen, Ändern und Testen.

Lange Turns ermöglichen unbeaufsichtigtes Arbeiten und sind zugleich die Stelle, an der unbeobachtet etwas schiefgeht. Der Turn ist außerdem die natürliche Einheit zum Steuern: Innerhalb eines Turns geschieht alles ohne den Nutzer, die Lücken dazwischen sind die Gelegenheit zum Nachjustieren.

**Verwandt:** **Sitzung** · [[werkzeugaufruf]] · [[harness]]

## Betrieb, Praxis und Qualität

### AFK (weg vom Rechner)

**AFK beschreibt ein Arbeitsmuster, bei dem man eine Sitzung startet und den Agenten danach unbeaufsichtigt laufen lässt.**

AFK steht für „away from keyboard", also weg von der Tastatur. Der Agent arbeitet allein weiter, während man schläft oder etwas anderes tut. Sicher wird das meist durch eine großzügige Freigabe-Einstellung und eine [[sandbox]].

Der Unterschied liegt bei Unklarheiten. Wer zusieht, erhält eine Rückfrage und antwortet. Wer weggeht, erhält keine: Der Agent wählt einen Standardwert und macht weiter, und jede spätere Entscheidung baut darauf auf. Der typische Fehler ist, nach Stunden fertige, selbstsichere Arbeit vorzufinden, die auf einer falschen Annahme aus den ersten Minuten beruht.

**Oft missverstanden:** „Hintergrund-Agent" beschreibt die Maschine statt das menschliche Muster; AFK benennt, dass niemand zusieht.

**Verwandt:** [[agent]] · **Grilling** · [[sandbox]] · **Menschliche Prüfung**

### Automatisierte Prüfung (Automated Check)

**Eine automatisierte Prüfung ist eine maschinelle Kontrolle, die im Arbeitsumfeld läuft und nur bestanden oder durchgefallen kennt.**

Dazu gehören Tests, Typprüfungen, Stilprüfungen und der Build. Das Ergebnis ist eindeutig und ohne Ermessen. Genau deshalb kann ein [[agent]] sich selbst korrigieren: Er ändert etwas, ruft die Prüfung als [[werkzeugaufruf]] auf, und die Fehlermeldung mit Datei und Zeile landet in seinem [[kontextfenster]]. Daraus bessert er nach und prüft erneut, bis es durchläuft.

Verlässlich ist das nur, weil die Prüfung eindeutig bleibt: gleicher Code, gleiches Urteil. Eine schwankende Prüfung zerstört das, denn dann „repariert" der Agent fehlerfreien Code. Grün heißt außerdem nur, dass die geprüften Eigenschaften gelten, nicht dass der Code richtig ist.

**Oft missverstanden:** „Test" meint nur einen Teil dieser Prüfungen; ein Test ist eine solche Prüfung, aber nicht jede.

**Verwandt:** [[agent]] · [[werkzeugaufruf]] · [[kontextfenster]] · **Menschliche Prüfung**

### Automatisierte Code-Prüfung (Automated Review)

**Bei der automatisierten Code-Prüfung begutachtet ein Agent die Arbeit eines anderen Agenten und bildet dabei ein Urteil.**

Sie läuft an vielen Stellen: vor dem Zusammenführen, nachträglich über die Versionsgeschichte oder mitten in einer Sitzung als Unteragent. Der Abstand zum arbeitenden Agenten ist der Kern. Wer den eigenen Code prüft, liest die eigenen Schlussfolgerungen als Bestätigung. Eine frische Sitzung mit leerem [[kontextfenster]] sieht den Unterschied dagegen wie ein Fremder. Ein anderes [[llm]] oder ein eigener System-Auftrag schärft das zusätzlich.

Sie liegt zwischen den anderen Ebenen: **Automatisierte Prüfungen** fangen Mechanisches ab, die **menschliche Prüfung** ist teuer, und die automatisierte Code-Prüfung deckt das Urteilsförmige zu Maschinenkosten ab. Weil sie nicht eindeutig ist, übersieht sie Dinge und meldet Fehlalarme.

**Oft missverstanden:** „KI-Prüfung" ist zu unbestimmt, weil es nicht vom arbeitenden Agenten unterscheidet.

**Verwandt:** [[agent]] · [[kontextfenster]] · [[llm]] · **Menschliche Prüfung**

### AX (Agent Experience)

**AX beschreibt, wie gut ein Arbeitsumfeld für einen Agenten eingerichtet ist, damit er gute Arbeit leisten kann.**

AX ist das Gegenstück zu DX, nur für den Agenten statt für den Menschen. Wenn dasselbe [[llm]] in einem Projekt gut und in einem anderen schlecht arbeitet, liegt das meist an AX. Der Reflex ist, das Modell zu beschuldigen; die Ursache steckt häufiger im Projekt selbst.

Gutes AX hat drei Seiten: schnelle, eindeutige **automatisierte Prüfungen**, von denen der Agent sich selbst korrigiert; eine Struktur, die er ohne vollständiges Lesen durchschaut; und knapp gehaltenes Beiwerk wie Regeln und Werkzeuge, damit genug [[kontextfenster]] für die Aufgabe frei bleibt. Menschen verzeihen langsame Abläufe und Halbwissen, Agenten nicht.

**Oft missverstanden:** AX gilt leicht als Synonym für DX; beide Zielgruppen brauchen aber andere Investitionen.

**Verwandt:** **DX** · [[agent]] · [[kontextfenster]] · **Smarte Zone**

### Dark Factory (dunkle Fabrik)

**Eine Dark Factory ist ein Codeteil, in dem eine Softwarefabrik den Code schreibt und kein Mensch ihn liest.**

Der Name stammt von „Licht-aus"-Fabriken, die ohne Menschen produzieren. Menschen dürfen weiterhin die Aufträge schreiben, die die Arbeit auslösen. Niemand liest jedoch, was herauskommt, denn es gibt keine **menschliche Prüfung**.

Eine Dark Factory ist **Vibe Coding** für einen ganzen Bereich statt für eine einzelne Änderung. Wer nach Gefühl programmiert, verzichtet darauf, eine angeforderte Änderung zu lesen; in der Dark Factory trifft das Team diese Entscheidung einmal für den gesamten Bereich. Bricht etwas, weiß man nicht, was sich geändert hat, und muss Code untersuchen, den im Team niemand gelesen hat.

**Oft missverstanden:** Ein Projekt ist nicht schon deshalb „dunkel", weil seine Fabrik unbeaufsichtigt läuft. Prüft ein Mensch die Ergebnisse, bleibt es eine Softwarefabrik.

**Verwandt:** **Softwarefabrik** · **Vibe Coding** · **Menschliche Prüfung** · [[agent]]

### Designkonzept (Design Concept)

**Ein Designkonzept ist das gemeinsame Verständnis davon, was gebaut werden soll, getragen von Mensch und Agent, aber unabhängig von jedem Dokument.**

Der Begriff stammt von Brooks. Gespräch, Übergabe-Dokumente und Code sind Versuche, dieses Verständnis zu fassen; keiner davon ist das Konzept selbst. Seine Qualität zeigt sich in der Qualität des Gesprächs, das ihn hervorbringt.

Hinter einer vertrauten Enttäuschung steht genau diese Lücke: Der Agent baut exakt das Gewünschte, und es ist trotzdem falsch. Meist war noch nicht klar, was man wollte. Der [[prompt]] enthielt die durchdachten Teile und schwieg über den Rest; die Leerstellen füllte der Agent mit eigenen Annahmen. Man merkt, dass ein Designkonzept geteilt wird, wenn das Gegenüber Fragen beantwortet, die man noch nicht gestellt hat, und zwar so, wie man es selbst tun würde.

**Verwandt:** **Grilling** · **Prototyping** · [[agent]] · [[prompt]]

### DX (Developer Experience)

**DX beschreibt, wie leicht ein Projekt und sein Werkzeugkasten es Menschen machen, gute Arbeit zu leisten.**

Gutes DX bedeutet schnelle Rückmeldung, klare Fehlermeldungen, hilfreiche Dokumentation und eine Einrichtung, die beim ersten Versuch klappt. Der Begriff ist älter als die KI-Programmierung und steht hier vor allem als Gegensatz zu **AX**.

Der wichtigste Unterschied: Menschen lernen das Projekt einmal und tragen dieses Wissen in jeden folgenden Tag, Agenten nicht. Deshalb überlebt man schwaches DX, indem man langsame Abläufe umgeht und Kollegen fragt. Ein [[agent]] beginnt dagegen jede Sitzung von vorn; was er gestern verstanden hat, ist fort, sofern es nicht im Umfeld festgehalten wurde. Er nimmt das Umfeld nur über Werkzeugergebnisse wahr.

**Verwandt:** **AX** · [[agent]] · [[kontextfenster]] · [[harness]]

### Grilling (beharrliches Nachfragen)

**Grilling ist eine Technik, um ein Designkonzept zu entwickeln: Der Agent befragt den Nutzer Schritt für Schritt und schlägt zu jeder Entscheidung eine Antwort vor.**

Das Verfahren bremst die Eile zum fertigen Plan. Solange das Verständnis nicht steht, wird kein Übergabe-Dokument geschrieben.

Es gibt die Technik, weil Agenten Lücken still füllen. Bittet man ihn, aus einem zwei Zeilen langen [[prompt]] eine Spezifikation zu schreiben, hält er nicht bei den offenen Entscheidungen an, sondern setzt Standardwerte und schreibt sie hinein. Das Ergebnis wirkt vollständig, und die Vermutungen sind von den echten Entscheidungen nicht zu unterscheiden. Grilling kehrt das um: Statt zu raten, muss der Agent fragen. Die Antworten sind die Eingabe; lässt sich eine Frage nur durch Anschauen klären, wechselt man zum **Prototyping**.

**Verwandt:** **Designkonzept** · **Human-in-the-Loop** · **Prototyping** · [[prompt]]

### Menschliche Prüfung (Human Review)

**Bei der menschlichen Prüfung liest der Nutzer den vom Agenten erzeugten Code und bildet sich ein Urteil.**

Den Unterschied zu lesen zählt; die Beschreibung des Agenten zu lesen zählt nicht. Die Beschreibung ist eine **Sekundärquelle** aus der Feder des Geprüften, der Unterschied ist die **Primärquelle**, und Prüfen heißt, diese zu lesen.

Agenten erzeugen mehr Code, deshalb wird die Prüfung zum Engpass. Sinnvoll ist es, die Ebenen zu staffeln: **Automatisierte Prüfungen** fangen Mechanisches, die **automatisierte Code-Prüfung** Beschreibbares, und die menschliche Prüfung bleibt für das, was nur ein Mensch beurteilen kann. Prüfen ist außerdem früher billiger: ein Plan vor Beginn oder ein kleiner Unterschied zwischendurch kostet Minuten.

**Oft missverstanden:** „Code-Prüfung" allein ist mehrdeutig, weil es zwischen menschlicher und automatischer Prüfung nicht unterscheidet.

**Verwandt:** **Primärquelle** · **Sekundärquelle** · **Automatisierte Code-Prüfung** · [[agent]]

### Human-in-the-Loop (Mensch in der Schleife)

**Human-in-the-Loop beschreibt ein Arbeitsmuster, bei dem ein oder mehrere Menschen während einer Sitzung mit dem Agenten zusammenarbeiten, ihn begleiten und rechtzeitig umlenken.**

Der Mensch ist anwesend und beteiligt, nicht nur als Freigabe für einzelne Schritte. Der Gegensatz ist die **AFK**-Arbeit, bei der der Agent unbeaufsichtigt läuft und man das Ergebnis danach beurteilt.

Der Vorteil liegt darin, Probleme zu erkennen, solange sie billig sind. Man sieht, dass der Agent die falsche Datei öffnet oder eine Anforderung missversteht, und lenkt ihn mit einem Satz um, statt zwanzig Minuten selbstsichere Arbeit auf einem Irrweg zu entdecken. Agenten merken oft nicht zuverlässig, dass sie sich verrannt haben; allein gelassen machen sie eher weiter, als innezuhalten. Welches Muster passt, hängt von der Aufgabe ab: eindeutige, leicht prüfbare Arbeit eignet sich für AFK, heikle dagegen nicht.

**Verwandt:** **AFK** · **Grilling** · **Softwarefabrik** · **Menschliche Prüfung**

### Primärquelle (Primary Source)

**Eine Primärquelle ist die Sache selbst in ihrer ursprünglichen Form: der Code, das Gesprächsprotokoll, das Rohprotokoll, die tatsächliche Antwort einer Schnittstelle.**

Sie ist nicht der Bericht über die Sache, sondern die Sache. Ihr Gegenstück ist die **Sekundärquelle**.

Will man wissen, was ein Projekt tut, ist der Code die Primärquelle. Dokumentation und Übersichtsbilder sind Beschreibungen davon, zutreffend zum Zeitpunkt ihrer Erstellung und seither auf eigene Faust veraltet. Behauptet ein Agent etwas Falsches über das Projekt, lohnt die Frage, woraus er gearbeitet hat: Wer eine Beschreibung gelesen hat, erbt deren Alter; wer den Code gelesen hat, liest die aktuelle Wahrheit. Der Preis hält Primärquellen davon ab, die Regel zu sein. Sie kosten viel [[kontextfenster]] und viele [[token]], liefern dafür aber Vollständigkeit ohne fremde Vorauswahl.

**Verwandt:** **Sekundärquelle** · [[kontextfenster]] · [[token]] · [[quellenkritik]]

### Prototyping (Schneller Vorab-Bau)

**Beim Prototyping lässt man den Agenten schnell eine grobe Version bauen, wenn das Gespräch zu ungenau ist und man ein echtes Stück zum Besprechen braucht.**

**Grilling** klärt Entscheidungen im Gespräch. Das ist billig, aber ungenau: Manche Fragen lassen sich mit Worten nicht beantworten, etwa wie sich eine Bedienung anfühlt oder ob eine Schnittstelle im echten Aufruf bequem ist. Dann lautet die ehrliche Antwort „ich müsste es sehen", und die Diskussion dreht sich im Kreis. Stattdessen baut der Agent die Sache, man schaut sie an und kommt mit einer Antwort zurück.

Möglich wird das, weil Agenten das Bauen verbilligen: Was früher einen Tag kostete, dauert jetzt Minuten. Der Prototyp ist da, damit man auf ihn reagiert; meist folgen mehrere Runden am echten Stück.

**Verwandt:** **Grilling** · **Human-in-the-Loop** · **Designkonzept** · [[agent]]

### Sekundärquelle (Secondary Source)

**Eine Sekundärquelle ist der Bericht über eine Primärquelle, einen Schritt entfernt: eine Beschreibung des Codes, eine Zusammenfassung eines Protokolls, ein Kurzbericht über Suchergebnisse.**

Sie lässt sich billiger in das [[kontextfenster]] laden als das Beschriebene, ist aber von Natur aus verlustbehaftet: Wer sie schrieb, hat entschieden, was wichtig war, und alles Weggelassene ist für die Leserin unsichtbar.

Sekundärquellen scheitern auf zwei Weisen. Sie verlieren Inhalt, etwa die Zusammenfassung, in der eine wichtige Entscheidung fehlte. Und sie driften ab: Die Quelle ändert sich, der Bericht folgt nicht, und so beschreibt die Dokumentation die Architektur des letzten Quartals mit der Zuversicht von heute. Arbeitet ein [[agent]] mit einer solchen Quelle, arbeitet er selbstsicher mit falschen Angaben. Die Rettung ist der Rückgriff auf die **Primärquelle**.

**Verwandt:** **Primärquelle** · [[kontextfenster]] · [[quellenkritik]] · [[agent]]

### Smarte Zone (Smart Zone)

**Die smarte Zone ist der frühe Abschnitt einer Sitzung, in dem der Agent aufmerksam und zuverlässig arbeitet; später kippt dieselbe Sitzung in eine dumpfe Zone mit mehr Fehlern.**

Es ist dasselbe [[llm]] und dasselbe [[harness]], nur mehr [[kontextfenster|Kontext]]. Der Übergang ist schleichend, deshalb übersieht man ihn leicht. Es gibt keine Fehlermeldung und keine sichtbare Grenze; der Agent arbeitet einfach etwas schlechter, dann deutlich schlechter. Häufige Anzeichen: Er vergisst eine Anweisung von vor zwanzig Beiträgen, wiederholt einen bereits behobenen Fehler oder behauptet etwas, dem der Kontext widerspricht.

Die Zonen richten sich nicht nach dem Limit des Kontextfensters. Eine Sitzung kann tief in der dumpfen Zone sein, während noch viel Platz frei ist. Die Qualität sinkt lange vor der technischen Grenze, und jede zusätzliche Aufgabe verbraucht das Budget der Zone mit.

**Verwandt:** [[kontextfenster]] · [[kontextentzug]] · [[halluzination]] · [[agent]]

### Softwarefabrik (Software Factory)

**Eine Softwarefabrik ist ein Arbeitsablauf, in dem Auslöser statt Menschen die Sitzungen der Agenten starten.**

Auslöser können ein neues Ticket, ein Zeitplan, ein Fehlschlag in der Prüfung oder das Ende einer anderen Sitzung sein. So läuft mehr Arbeit **AFK**, und die Aufmerksamkeit der Menschen bleibt für die Entscheidungen, die sie wirklich treffen müssen.

Ohne Fabrik beginnt jede Sitzung, weil jemand sie beginnt: Man öffnet sie, richtet sie auf das Ticket und startet sie. Eine Fabrik nimmt den Menschen das Starten ab, aber nicht zwingend mehr. Menschen können weiterhin die Aufträge schreiben, einen Plan freigeben oder vor dem Zusammenführen prüfen. Welche dieser Entscheidungen menschlich bleiben, ist die eigentliche Gestaltungsfrage. Prüft niemand die Ergebnisse, entsteht eine **Dark Factory**.

**Verwandt:** **AFK** · **Ticket** · **Dark Factory** · **Human-in-the-Loop**

### Ticket (Arbeitsauftrag)

**Ein Ticket ist ein Übergabe-Dokument, das eine Sitzung Arbeit umreißt; es steht allein oder hängt als Teil unter einer Spezifikation.**

Die entscheidende Grenze ist die Größe: eine Sitzung. Ein Ticket sollte fertig werden, bevor die Sitzung die **smarte Zone** verlässt. Diese Grenze lässt sich prüfen. Werden Sitzungen regelmäßig vor dem Ende schlechter, sind die Tickets zu groß und müssen geteilt werden. Vergeht der größte Teil des [[kontextfenster|Kontexts]] mit Einrichtung und nur wenige Minuten mit Arbeit, sind sie zu klein.

Ein gutes Ticket ist für eine Leserin ohne Vorwissen geschrieben: Ziel, Abnahmekriterien und Verweise auf die wichtigen Dateien. Tickets können einander blockieren, sodass sich die Reihenfolge aus ihrem Abhängigkeitsnetz ergibt. Unabhängige Tickets lassen sich parallel in getrennten Sitzungen bearbeiten.

**Verwandt:** **Smarte Zone** · **Softwarefabrik** · [[kontextfenster]] · [[agent]]

### Vibe Coding (nach Gefühl programmieren)

**Vibe Coding beschreibt ein Arbeitsmuster, bei dem man den Code des Agenten annimmt, ohne ihn selbst zu prüfen; der Unterschied wird als undurchsichtig behandelt.**

Wichtig ist, ob das Programm richtig läuft, nicht was darin steht. Der Begriff stammt von Andrej Karpathy und meint, dass man den Code vergisst.

**Automatisierte Prüfungen** dürfen weiterlaufen; Vibe Coding sagt dazu nichts. Es tauscht Prüfung gegen Geschwindigkeit, weil das Lesen von Unterschieden der langsamste Schritt ist. Bei Code mit billigen Fehlern, etwa Prototypen, ist das vertretbar; das Risiko wächst mit Lebensdauer und Bedeutung.

Bezahlt wird später: Die Änderungen sammeln sich zu einem Bestand, den niemand gelesen hat, und alles, was das Verhalten nicht zeigt, geht unbemerkt mit.

**Oft missverstanden:** Er benennt die Prüf-Haltung, nicht die Qualität des Codes, und ist kein Synonym für schlechte KI-Programmierung.

**Verwandt:** **Prototyping** · **Dark Factory** · **Menschliche Prüfung** · **Automatisierte Prüfung**

## Quellen und Hinweise

- **Quelle der Begriffe:** Matt Pocock, „Dictionary of AI Coding“ — https://github.com/mattpocock/dictionary-of-ai-coding, Stand: September 2026. Die englischen Definitionen wurden sinngemäß übersetzt und für die Academy gekürzt; die Beispieldialoge der Quelle entfallen.
- **Bearbeitet:** 17.10.2026, Carmen. Reihenfolge: alphabetisch nach dem englischen Begriff innerhalb der drei Teile.
- **Verhältnis zum Glossar-Ordner:** Begriffe, die hier auch als eigenes Blatt vorliegen, sind am Eintragsende verlinkt (z. B. [[agent]], [[harness]], [[token]]). Eigene Blätter und dieses Dokument ergänzen sich; bei Abweichungen gilt das einzelne Blatt als der gekürzte Einstieg und dieses Dokument als die ausführliche Fassung.
- **Nicht enthalten:** Begriffe, die dieses Glossar bereits eigens abdeckt und die in der Quelle keine zusätzliche Deutung bringen (etwa [[logits]], [[sampling]], [[softmax]], [[temperatur]]).
