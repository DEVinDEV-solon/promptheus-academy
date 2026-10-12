---
type: index
title: "Glossar"
description: "Fremdwörter und Fachbegriffe der Academy — je Begriff eine Notiz, verbunden über ihre Nachbarn."
tags:
  - index
  - glossar
  - bibliothek
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Glossar

Jeder Begriff hat eine eigene Notiz. Das ist Absicht: Die verwandten
Schlagworte, die im Programm neben der Erklärung stehen, sind die
Wikilinks dieser Notiz — sie kommen aus dem Graphen und nicht aus einer
zweiten, von Hand gepflegten Liste.

> Diese Seite wird erzeugt. Neue Begriffe kommen als eigene Datei in
> diesen Ordner; danach `python secondbrain/_scripts/glossar_index.py`.

## Wie ein Sprachmodell arbeitet

- [[agent]] — **Agent**: Ein Sprachmodell, das nicht nur antwortet, sondern Werkzeuge benutzt.
- [[c2pa]] — **C2PA**: Ein offener Standard für signierte Herkunftsangaben in Dateien — für Bilder, nicht für Text.
- [[entropie]] — **Entropie**: Das Maß dafür, wie viel Wahlfreiheit an einer Textstelle besteht.
- [[few-shot]] — **Few-Shot**: Dem Modell ein paar Beispiele mitgeben, statt es zu beschreiben.
- [[halluzination]] — **Halluzination**: Wenn ein Modell etwas erfindet und dabei genauso überzeugt klingt wie sonst.
- [[kontextfenster]] — **Kontextfenster**: Wie viele Token ein Modell gleichzeitig überblicken kann.
- [[llm]] — **LLM (Sprachmodell)**: Ein Programm, das vorhersagt, welches Textstück als nächstes kommt.
- [[logits]] — **Logits**: Die rohen Punktzahlen, die ein Modell jedem möglichen nächsten Token gibt.
- [[maschinelles-lernen]] — **Maschinelles Lernen**: Muster aus Daten ziehen, statt Regeln zu schreiben.
- [[prompt]] — **Prompt**: Der Text, den man einem Sprachmodell gibt — Anweisung, Frage und Zusammenhang in einem.
- [[regelsystem]] — **Regelsystem**: Ein Programm, das Regeln befolgt, die ein Mensch geschrieben hat.
- [[sampling]] — **Sampling**: Das Ziehen des nächsten Tokens aus der Wahrscheinlichkeitsverteilung.
- [[softmax]] — **Softmax**: Die Rechnung, die aus rohen Punktzahlen Wahrscheinlichkeiten macht.
- [[temperatur]] — **Temperatur**: Der Regler, der bestimmt, wie mutig ein Modell wählt.
- [[token]] — **Token**: Das Stück Text, mit dem ein Sprachmodell rechnet — meist kürzer als ein Wort.
- [[tokenizer]] — **Tokenizer**: Das Programm, das Text in Token zerlegt — immer nach derselben festen Tabelle.
- [[wasserzeichen]] — **Wasserzeichen (im Text)**: Eine unsichtbare Markierung, die beim Schreiben in KI-Text eingebettet wird.

## Wie neuronale Netze lernen

- [[adam-optimierer]] — **Adam-Optimierer**: Der verbreitete Standard-Optimierer, der jedem Gewicht sein eigenes Tempo gibt.
- [[aktivierungsfunktion]] — **Aktivierungsfunktion**: Die Rechnung, die entscheidet, wie stark ein Neuron sein Signal weitergibt.
- [[autoencoder]] — **Autoencoder**: Ein Netz, das seine Eingabe zusammenpresst und wieder auspackt — und dabei das Wesentliche lernt.
- [[backpropagation]] — **Backpropagation (Fehlerrückführung)**: Das Verfahren, das den Fehler am Ausgang rückwärts auf alle Gewichte im Netz verteilt.
- [[batch]] — **Batch (Stapel)**: Die Portion Beispiele, nach der das Modell einmal seine Gewichte korrigiert.
- [[bestaerkendes-lernen]] — **Bestärkendes Lernen (Reinforcement Learning)**: Lernen durch Belohnung: ausprobieren, Rückmeldung bekommen, das Erfolgreiche öfter tun.
- [[bias-term]] — **Bias-Term**: Die Verschiebung, die ein Neuron unabhängig von seiner Eingabe mitbringt.
- [[clustering]] — **Clustering**: Ähnliche Dinge zu Gruppen zusammenfassen, ohne vorher festzulegen, welche Gruppen es gibt.
- [[deep-learning]] — **Deep Learning**: Maschinelles Lernen mit Netzen aus vielen Schichten.
- [[diskriminatives-modell]] — **Diskriminatives Modell**: Ein Modell, das unterscheidet und einordnet, aber nichts Neues erzeugt.
- [[dropout]] — **Dropout**: Beim Training zufällig Neuronen abschalten, damit das Netz sich nicht auf einzelne verlässt.
- [[epoche]] — **Epoche**: Ein kompletter Durchgang durch alle Trainingsdaten.
- [[faltungsnetz]] — **Faltungsnetz (CNN)**: Das klassische Netz für Bilder: Es schiebt kleine Filter über das ganze Bild.
- [[generalisierung]] — **Generalisierung**: Das Gelernte auf neue, nie gesehene Fälle übertragen können.
- [[generatives-modell]] — **Generatives Modell**: Ein Modell, das Neues erzeugt — Text, Bilder, Musik — statt nur Vorhandenes einzuordnen.
- [[gradient]] — **Gradient**: Die Richtung, in der der Fehler am stärksten wächst — und damit der Hinweis, wohin man gehen muss.
- [[gradientenabstieg]] — **Gradientenabstieg**: Schritt für Schritt bergab zum kleineren Fehler — das Grundverfahren fast jedes Trainings.
- [[hyperparameter]] — **Hyperparameter**: Einstellungen, die vor dem Training festgelegt und nicht gelernt werden.
- [[initialisierung]] — **Initialisierung**: Die Startwerte der Gewichte, bevor das Training beginnt.
- [[klassifikation]] — **Klassifikation**: Etwas einer von mehreren festen Klassen zuordnen — Spam oder nicht, Katze oder Hund.
- [[konvergenz]] — **Konvergenz**: Wenn das Training zur Ruhe kommt und sich der Fehler kaum noch ändert.
- [[kuenstliches-neuron]] — **Künstliches Neuron**: Die kleinste Recheneinheit eines Netzes: Zahlen rein, gewichtet addiert, eine Zahl raus.
- [[label]] — **Label (Kennzeichnung)**: Die richtige Antwort, die zu einem Trainingsbeispiel gehört.
- [[lernrate]] — **Lernrate**: Wie gross jeder Korrekturschritt beim Training ist.
- [[lstm]] — **LSTM**: Ein rekurrentes Netz mit Schleusen, das Wichtiges länger behalten kann.
- [[matrix]] — **Matrix**: Eine rechteckige Tabelle von Zahlen — die Form, in der Netze ihre Gewichte speichern und rechnen.
- [[merkmal]] — **Merkmal (Feature)**: Eine messbare Eigenschaft eines Beispiels, mit der ein Modell rechnet.
- [[neuronales-netz]] — **Neuronales Netz**: Viele künstliche Neuronen in Schichten, die zusammen ein Muster aus Daten lernen.
- [[normalisierung]] — **Normalisierung (Layer Norm)**: Hält die Zahlen im Netz in einem gesunden Bereich, damit das Training stabil bleibt.
- [[optimierer]] — **Optimierer**: Das Verfahren, das aus dem Gradienten den tatsächlichen Lernschritt macht.
- [[parameter]] — **Parameter**: Jede Zahl im Modell, die beim Training eingestellt wird — Gewichte und Verschiebungen zusammen.
- [[regression]] — **Regression (Statistik)**: Eine Zahl vorhersagen statt einer Schublade — einen Preis, eine Temperatur, eine Dauer.
- [[regularisierung]] — **Regularisierung**: Sammelbegriff für Massnahmen, die ein Modell vom Auswendiglernen abhalten.
- [[rekurrentes-netz]] — **Rekurrentes Netz (RNN)**: Ein Netz, das eine Folge Schritt für Schritt liest und dabei einen inneren Zustand weiterträgt.
- [[relu]] — **ReLU**: Die einfachste gebräuchliche Aktivierung: Negatives wird null, Positives bleibt.
- [[residualverbindung]] — **Residualverbindung**: Eine Abkürzung, die die Eingabe einer Schicht unverändert an ihrer Ausgabe vorbeiführt.
- [[schicht]] — **Schicht (Layer)**: Eine Lage von Neuronen, die gleichzeitig rechnen und ihr Ergebnis an die nächste Lage weitergeben.
- [[selbstueberwachtes-lernen]] — **Selbstüberwachtes Lernen**: Die Lösung steckt in den Daten selbst — etwa das nächste Wort eines Textes.
- [[skalarprodukt]] — **Skalarprodukt**: Eine Rechnung, die misst, wie sehr zwei Vektoren in dieselbe Richtung zeigen.
- [[tensor]] — **Tensor**: Zahlen in beliebig vielen Dimensionen — die Verallgemeinerung von Vektor und Matrix.
- [[testdatensatz]] — **Testdatensatz**: Beispiele, die das Modell nie gesehen hat — für die ehrliche Schlussprüfung.
- [[trainingsdatensatz]] — **Trainingsdatensatz**: Die Beispiele, aus denen ein Modell lernt.
- [[unteranpassung]] — **Unteranpassung (Underfitting)**: Das Modell ist zu schlicht oder zu kurz trainiert, um das Muster überhaupt zu fassen.
- [[unueberwachtes-lernen]] — **Unüberwachtes Lernen**: Muster in Daten finden, ohne dass jemand die Lösungen vorgibt.
- [[validierungsdatensatz]] — **Validierungsdatensatz**: Zurückgehaltene Beispiele, an denen man während des Trainings prüft, ob das Modell wirklich lernt.
- [[vektor]] — **Vektor**: Eine geordnete Liste von Zahlen, die etwas beschreibt — einen Punkt, eine Richtung, eine Bedeutung.
- [[verlustfunktion]] — **Verlustfunktion (Loss)**: Misst in einer Zahl, wie falsch eine Vorhersage war — die Grösse, die das Training kleiner machen will.
- [[wahrscheinlichkeitsverteilung]] — **Wahrscheinlichkeitsverteilung**: Wie sich die Chancen auf alle möglichen Ausgänge verteilen — zusammen immer hundert Prozent.
- [[ueberanpassung]] — **Überanpassung (Overfitting)**: Das Modell hat die Beispiele auswendig gelernt statt das Muster dahinter.
- [[ueberwachtes-lernen]] — **Überwachtes Lernen**: Lernen aus Beispielen, zu denen die richtige Antwort mitgeliefert wird.

## Transformer und Modellbau

- [[aufmerksamkeit]] — **Aufmerksamkeit (Attention)**: Der Mechanismus, mit dem ein Modell entscheidet, welche Wörter für welches Wort zählen.
- [[autoregressives-modell]] — **Autoregressives Modell**: Erzeugt Token für Token, jedes aus allen vorigen — die eigene Ausgabe wird zur nächsten Eingabe.
- [[basismodell]] — **Basismodell (Base Model)**: Ein vortrainiertes Modell, das Texte fortsetzen kann, aber noch kein Gesprächspartner ist.
- [[byte-pair-encoding]] — **Byte-Pair-Encoding (BPE)**: Das gängige Verfahren, mit dem aus Text ein Token-Vokabular gebaut wird.
- [[chat-vorlage]] — **Chat-Vorlage (Chat Template)**: Das feste Format, in das ein Gespräch verpackt wird, bevor das Modell es liest.
- [[checkpoint]] — **Checkpoint (Zwischenstand)**: Ein gespeicherter Stand der Gewichte während oder nach dem Training.
- [[decoder]] — **Decoder**: Der Teil eines Modells, der Ausgaben erzeugt — Token für Token.
- [[decoder-only-modell]] — **Decoder-only-Modell**: Die Bauweise heutiger Chat-Modelle: ein einziger Stapel, der nur fortsetzt.
- [[dichtes-modell]] — **Dichtes Modell (Dense Model)**: Ein Modell, bei dem jedes Gewicht bei jedem Token mitrechnet.
- [[diffusions-sprachmodell]] — **Diffusions-Sprachmodell**: Text entsteht nicht Wort für Wort, sondern durch schrittweises Entrauschen eines ganzen Entwurfs.
- [[einbettungsraum]] — **Einbettungsraum**: Der vieldimensionale Raum, in dem Embeddings liegen und Ähnliches nah beieinander ist.
- [[embedding]] — **Embedding (Einbettung)**: Bedeutung als Vektor — ein Text oder Token als Punkt in einem Raum, in dem Ähnliches nah beieinanderliegt.
- [[emergente-faehigkeit]] — **Emergente Fähigkeit**: Ein Können, das erst ab einer bestimmten Modellgrösse auftaucht und bei kleineren fehlt.
- [[encoder]] — **Encoder**: Der Teil eines Modells, der eine Eingabe liest und in eine innere Darstellung übersetzt.
- [[end-of-sequence-token]] — **End-of-Sequence-Token**: Das Zeichen, mit dem ein Modell signalisiert: Hier ist die Antwort zu Ende.
- [[feed-forward-schicht]] — **Feed-Forward-Schicht**: Der Rechenblock nach der Attention, in dem jedes Token einzeln weiterverarbeitet wird.
- [[flash-attention]] — **Flash Attention**: Eine Rechenweise für Attention, die unnötiges Hin- und Herschieben im Speicher vermeidet.
- [[frontier-modell]] — **Frontier-Modell**: Die jeweils leistungsfähigsten Modelle ihrer Zeit, an der vordersten Grenze des Machbaren.
- [[grouped-query-attention]] — **Grouped-Query-Attention**: Attention, bei der sich mehrere Köpfe Keys und Values teilen — spart viel Speicher beim Antworten.
- [[grundlagenmodell]] — **Grundlagenmodell (Foundation Model)**: Ein grosses, breit trainiertes Modell, auf dem viele verschiedene Anwendungen aufbauen.
- [[hybridarchitektur]] — **Hybridarchitektur**: Ein Modell, das Transformer-Schichten mit anderen Bauweisen mischt.
- [[instruktionsmodell]] — **Instruktionsmodell (Instruct Model)**: Ein Modell, das darauf trainiert wurde, Anweisungen zu befolgen und Fragen zu beantworten.
- [[kausale-maske]] — **Kausale Maske**: Verbietet einem Sprachmodell beim Training den Blick auf die Token, die erst später kommen.
- [[langer-kontext]] — **Langer Kontext (Long Context)**: Sehr grosse Kontextfenster — hunderttausende Token und mehr — und ihre Tücken.
- [[large-action-model]] — **Large Action Model (LAM)**: Ein Modell, das darauf trainiert ist, Handlungen auszuführen statt nur Text zu erzeugen.
- [[latenter-raum]] — **Latenter Raum**: Der verborgene Zahlenraum, in dem ein Modell seine inneren Darstellungen ablegt.
- [[lineare-attention]] — **Lineare Attention**: Attention-Varianten, deren Aufwand nur linear statt quadratisch mit der Textlänge wächst.
- [[mixture-of-experts]] — **Mixture of Experts (MoE)**: Ein Modell aus vielen Spezialisten, von denen je Token nur wenige aktiv sind.
- [[modellarchitektur]] — **Modellarchitektur**: Der Bauplan eines Modells: welche Schichten, wie viele, wie verbunden.
- [[modellkarte]] — **Modellkarte (Model Card)**: Der Beipackzettel eines Modells: wofür es gebaut ist, wie es getestet wurde, wo es versagt.
- [[multi-head-attention]] — **Multi-Head-Attention**: Mehrere Attention-Rechnungen nebeneinander, jede mit eigenem Blickwinkel.
- [[multi-query-attention]] — **Multi-Query-Attention**: Die sparsamste Attention-Variante: alle Köpfe teilen sich ein einziges Paar aus Keys und Values.
- [[multimodales-modell]] — **Multimodales Modell**: Ein Modell, das Text, Bild, Ton oder Video in einem verarbeitet.
- [[naechstes-token-vorhersage]] — **Nächstes-Token-Vorhersage**: Die eine Aufgabe, auf die ein Sprachmodell im Vortraining trainiert wird.
- [[parameterzahl]] — **Parameterzahl**: Wie viele lernbare Zahlen ein Modell hat — die übliche Angabe seiner Grösse.
- [[positionskodierung]] — **Positionskodierung**: Die Zusatzinformation, aus der ein Transformer die Reihenfolge der Token kennt.
- [[query-key-value]] — **Query, Key, Value**: Die drei Rollen in der Attention-Rechnung: was gesucht wird, was angeboten wird, was übergeben wird.
- [[repraesentation]] — **Repräsentation**: Wie ein Modell etwas intern darstellt — als Muster in seinen Zahlen.
- [[rope]] — **RoPE (Rotations-Positionskodierung)**: Positionen als Drehung: Die Reihenfolge der Token steckt im Winkel ihrer Vektoren.
- [[router]] — **Router (im MoE)**: Das kleine Netz, das in einem Mixture-of-Experts-Modell für jedes Token die Experten wählt.
- [[selbstaufmerksamkeit]] — **Selbstaufmerksamkeit (Self-Attention)**: Attention innerhalb desselben Textes: jedes Token schaut auf die anderen Token derselben Eingabe.
- [[sliding-window-attention]] — **Sliding-Window-Attention**: Attention, bei der jedes Token nur einen festen Abschnitt davor sieht.
- [[sondertoken]] — **Sondertoken (Special Token)**: Steuerzeichen im Token-Strom, die kein Text sind, sondern Struktur.
- [[sparsitaet]] — **Sparsität**: Wenn ein grosser Teil der Zahlen null ist oder nicht gerechnet wird — und man das ausnutzt.
- [[state-space-modell]] — **State-Space-Modell (SSM)**: Eine Alternative zum Transformer, die einen kompakten Zustand durch den Text trägt.
- [[transformer]] — **Transformer**: Die Bauweise fast aller heutigen Sprachmodelle — jedes Token schaut auf alle anderen.
- [[vision-transformer]] — **Vision Transformer (ViT)**: Ein Transformer für Bilder: Das Bild wird in Kacheln zerlegt, die wie Wörter behandelt werden.
- [[vision-language-modell]] — **Vision-Language-Modell (VLM)**: Ein Modell, das Bilder ansehen und darüber in Sprache Auskunft geben kann.
- [[vokabular]] — **Vokabular**: Die feste Liste aller Token, die ein Sprachmodell kennt.
- [[weltmodell]] — **Weltmodell**: Eine innere Vorstellung davon, wie die Welt funktioniert — und was als Nächstes passiert.

## Training und Daten

- [[adapter]] — **Adapter**: Ein kleines Zusatzmodul, das ein fertiges Modell für eine neue Aufgabe anpasst.
- [[belohnungsmodell]] — **Belohnungsmodell (Reward Model)**: Ein Modell, das Antworten eines anderen Modells benotet.
- [[compute-optimales-training]] — **Compute-optimales Training**: Das richtige Verhältnis von Modellgrösse und Datenmenge für ein gegebenes Rechenbudget.
- [[curriculum-learning]] — **Curriculum Learning**: Ein Modell vom Leichten zum Schweren lernen lassen — wie in der Schule.
- [[datenannotation]] — **Datenannotation**: Daten von Hand kennzeichnen, damit ein Modell daraus lernen kann.
- [[datenkuration]] — **Datenkuration**: Trainingsdaten gezielt auswählen, säubern und gewichten.
- [[datenmischung]] — **Datenmischung (Data Mix)**: Das Rezept, aus welchen Quellen wie viel ins Training kommt.
- [[datenparallelitaet]] — **Datenparallelität**: Jeder Chip hat eine Kopie des Modells und rechnet andere Beispiele.
- [[datenvergiftung]] — **Datenvergiftung (Data Poisoning)**: Gezielt manipulierte Trainingsdaten, die ein Modell heimlich verändern.
- [[deduplizierung]] — **Deduplizierung**: Doppelte und fast doppelte Texte aus den Trainingsdaten entfernen.
- [[domaenenanpassung]] — **Domänenanpassung**: Ein allgemeines Modell für ein bestimmtes Fachgebiet schärfen.
- [[dpo]] — **DPO**: Präferenzen lernen ohne eigenes Belohnungsmodell — direkt aus Paaren von besserer und schlechterer Antwort.
- [[ergebnisbelohnung]] — **Ergebnisbelohnung**: Nur das Endergebnis bewerten, der Weg dorthin zählt nicht.
- [[gradient-checkpointing]] — **Gradient Checkpointing**: Speicher sparen, indem man Zwischenergebnisse nicht aufhebt, sondern bei Bedarf neu rechnet.
- [[grpo]] — **GRPO**: Mehrere Antworten auf dieselbe Aufgabe im Vergleich zueinander benoten.
- [[instruction-tuning]] — **Instruction Tuning**: Nachtraining, durch das ein Modell lernt, Anweisungen zu befolgen.
- [[katastrophales-vergessen]] — **Katastrophales Vergessen**: Ein Modell lernt etwas Neues und verliert dabei, was es vorher konnte.
- [[kontinuierliches-lernen]] — **Kontinuierliches Lernen**: Ein Modell lernt laufend weiter, ohne von vorn zu beginnen und ohne Altes zu verlieren.
- [[korpus]] — **Korpus**: Eine grosse, für einen Zweck zusammengestellte Textsammlung.
- [[lora]] — **LoRA**: Feinabstimmung mit wenigen zusätzlichen Gewichten statt mit dem ganzen Modell.
- [[maschinelles-verlernen]] — **Maschinelles Verlernen (Unlearning)**: Gezielt etwas aus einem trainierten Modell entfernen, ohne es neu zu trainieren.
- [[mixed-precision]] — **Mixed Precision**: Mit ungenaueren Zahlen rechnen, wo es nicht schadet — für Tempo und Speicher.
- [[model-merging]] — **Model Merging (Modelle verschmelzen)**: Die Gewichte zweier oder mehrerer Modelle zu einem neuen zusammenrechnen.
- [[modellkollaps]] — **Modellkollaps (Model Collapse)**: Wenn Modelle immer wieder von Modellen lernen und dabei Generation für Generation verarmen.
- [[modellparallelitaet]] — **Modellparallelität**: Das Modell selbst wird aufgeteilt — jeder Chip hält nur einen Teil davon.
- [[modus-kollaps]] — **Modus-Kollaps (Mode Collapse)**: Die Ausgaben eines Modells werden immer gleichförmiger.
- [[nachtraining]] — **Nachtraining (Post-Training)**: Alles, was aus einem Basismodell einen hilfreichen, sicheren Assistenten macht.
- [[peft]] — **PEFT**: Sammelbegriff für sparsame Feinabstimmung, bei der nur ein kleiner Teil der Gewichte lernt.
- [[ppo]] — **PPO**: Das klassische Verfahren des bestärkenden Lernens, mit dem RLHF lange umgesetzt wurde.
- [[prozessbelohnung]] — **Prozessbelohnung**: Jeden Zwischenschritt einer Lösung bewerten, nicht nur das Ergebnis.
- [[praeferenzdaten]] — **Präferenzdaten**: Paare aus besserer und schlechterer Antwort auf dieselbe Frage.
- [[qlora]] — **QLoRA**: LoRA auf einem quantisierten Modell — Feinabstimmung grosser Modelle auf kleiner Hardware.
- [[rechenbudget]] — **Rechenbudget**: Wie viel Rechenleistung ein Training oder eine Antwort bekommen darf.
- [[rlaif]] — **RLAIF**: Wie RLHF, aber die Bewertungen kommen von einem KI-Modell statt von Menschen.
- [[rlhf]] — **RLHF**: Bestärkendes Lernen mit menschlichen Bewertungen: Das Modell lernt, was Menschen bevorzugen.
- [[rlvr]] — **RLVR**: Bestärkendes Lernen, bei dem es nur Belohnung gibt, wenn die Lösung nachweislich stimmt.
- [[selbstspiel]] — **Selbstspiel (Self-Play)**: Ein Modell lernt, indem es gegen sich selbst antritt.
- [[selbstverbesserung]] — **Selbstverbesserung**: Ein Modell erzeugt sich eigene Übungsaufgaben und lernt daraus.
- [[supervised-fine-tuning]] — **Supervised Fine-Tuning (SFT)**: Nachtraining mit Musterbeispielen aus Anweisung und guter Antwort.
- [[synthetische-daten]] — **Synthetische Daten**: Trainingsdaten, die von einem Modell erzeugt wurden statt von Menschen.
- [[trainingslauf]] — **Trainingslauf**: Ein Training von Anfang bis Ende — mit festem Modell, festen Daten und festem Plan.
- [[transferlernen]] — **Transferlernen**: Was ein Modell bei einer Aufgabe gelernt hat, für eine andere nutzen.
- [[verfassungstraining]] — **Verfassungstraining (Constitutional AI)**: Ein Modell wird an schriftlichen Grundsätzen ausgerichtet, die es selbst zum Prüfen verwendet.
- [[verifizierer]] — **Verifizierer**: Ein Programm oder Modell, das prüft, ob eine Lösung richtig ist.
- [[verlustkurve]] — **Verlustkurve**: Die Kurve, die zeigt, wie der Fehler im Laufe des Trainings sinkt.
- [[verteiltes-training]] — **Verteiltes Training**: Ein Training, das auf viele Chips und Rechner zugleich aufgeteilt wird.
- [[vortraining]] — **Vortraining (Pretraining)**: Das grosse Lesen: Ein Modell lernt aus Billionen Token, wie Text weitergeht.
- [[webkorpus]] — **Webkorpus**: Eine riesige Textsammlung aus dem öffentlichen Netz.
- [[wissensdestillation]] — **Wissensdestillation**: Ein kleines Modell lernt von den Antworten eines grossen.
- [[wissensstichtag]] — **Wissensstichtag (Knowledge Cutoff)**: Der Zeitpunkt, bis zu dem ein Modell die Welt aus seinen Trainingsdaten kennt.

## Denken lassen und gut fragen

- [[antwortlaenge]] — **Antwortlänge**: Wie lang eine Antwort ist — und warum länger nicht besser ist.
- [[anweisungshierarchie]] — **Anweisungshierarchie**: Die Rangordnung, welche Anweisung bei einem Widerspruch gewinnt.
- [[aufgabenzerlegung]] — **Aufgabenzerlegung**: Eine grosse Aufgabe in kleine, lösbare Teilaufgaben aufteilen.
- [[ausgabeformat]] — **Ausgabeformat**: Wie die Antwort aussehen soll — Länge, Gliederung, Tabelle, Datenformat.
- [[ausgabelimit]] — **Ausgabelimit (Max Tokens)**: Die Höchstzahl an Token, die eine einzelne Antwort lang werden darf.
- [[beam-search]] — **Beam Search**: Mehrere Fortsetzungen parallel verfolgen und am Ende die beste Gesamtfolge wählen.
- [[best-of-n]] — **Best-of-N**: Viele Antworten erzeugen und die beste auswählen lassen.
- [[chain-of-thought]] — **Chain-of-Thought (Gedankenkette)**: Das Modell schreibt seine Zwischenschritte aus, bevor es antwortet.
- [[context-engineering]] — **Context Engineering**: Alles gestalten, was ins Kontextfenster eines Modells kommt — nicht nur den Prompt.
- [[denkbudget]] — **Denkbudget (Thinking Budget)**: Wie viele Token ein Modell maximal zum Nachdenken verwenden darf.
- [[denkspur]] — **Denkspur (Reasoning Trace)**: Der ausgeschriebene Gedankengang eines Modells, bevor es antwortet.
- [[determinismus]] — **Determinismus**: Kommt bei gleicher Eingabe immer dieselbe Ausgabe heraus?
- [[faktentreue]] — **Faktentreue (Faithfulness)**: Hält sich die Antwort an das, was in den gegebenen Quellen steht?
- [[greedy-decoding]] — **Greedy Decoding**: Immer das wahrscheinlichste nächste Token nehmen, ohne Zufall.
- [[in-context-learning]] — **In-Context Learning**: Ein Modell lernt aus dem Prompt selbst, ohne dass seine Gewichte sich ändern.
- [[kalibrierung]] — **Kalibrierung**: Passt die Sicherheit eines Modells zu seiner tatsächlichen Trefferquote?
- [[konfidenz]] — **Konfidenz**: Wie sicher sich ein Modell bei einer Antwort ist — oder zu sein behauptet.
- [[kontextkomprimierung]] — **Kontextkomprimierung (Compaction)**: Einen langen Verlauf zusammenfassen, damit ein Agent weiterarbeiten kann.
- [[kontextverfall]] — **Kontextverfall (Context Rot)**: Je voller das Kontextfenster, desto ungenauer arbeitet das Modell.
- [[logprobs]] — **Logprobs**: Die Wahrscheinlichkeiten, die hinter jedem ausgegebenen Token stehen.
- [[lost-in-the-middle]] — **Lost in the Middle**: Was in der Mitte eines langen Textes steht, beachtet ein Modell schlechter.
- [[mehrdeutigkeit]] — **Mehrdeutigkeit**: Wenn eine Frage mehrere sinnvolle Lesarten hat und das Modell eine davon wählt.
- [[metaprompt]] — **Metaprompt**: Ein Prompt, der ein Modell dazu bringt, einen anderen Prompt zu schreiben.
- [[nadel-im-heuhaufen]] — **Nadel im Heuhaufen (Needle in a Haystack)**: Ein Test, ob ein Modell eine einzelne Angabe in einem sehr langen Text wiederfindet.
- [[negativanweisung]] — **Negativanweisung**: Dem Modell sagen, was es nicht tun soll — und warum das tückisch ist.
- [[one-shot]] — **One-Shot**: Eine Aufgabe mit genau einem Beispiel stellen.
- [[persona]] — **Persona**: Eine ausgearbeitete Figur, aus deren Sicht ein Modell spricht oder für die es schreibt.
- [[prompt-engineering]] — **Prompt Engineering**: Das Handwerk, Prompts so zu schreiben, dass verlässlich gute Ergebnisse herauskommen.
- [[prompt-bibliothek]] — **Prompt-Bibliothek**: Eine Sammlung bewährter, geprüfter Prompts zum Wiederverwenden.
- [[prompt-kompression]] — **Prompt-Kompression**: Denselben Inhalt mit weniger Token ausdrücken.
- [[prompt-verkettung]] — **Prompt-Verkettung (Prompt Chaining)**: Eine Aufgabe in mehrere Prompts zerlegen, deren Ergebnisse aufeinander aufbauen.
- [[prompt-vorlage]] — **Prompt-Vorlage**: Ein wiederverwendbarer Prompt mit Lücken, die bei jeder Nutzung gefüllt werden.
- [[reasoning]] — **Reasoning (Schlussfolgern)**: Schritt für Schritt von dem, was man weiss, zu dem, was daraus folgt.
- [[reasoning-modell]] — **Reasoning-Modell**: Ein Modell, das vor der Antwort ausführlich nachdenkt — oft minutenlang.
- [[rollenprompt]] — **Rollenprompt**: Dem Modell eine Rolle geben, etwa die einer erfahrenen Lektorin.
- [[seed]] — **Seed (Startwert)**: Die Zahl, die den Zufall eines Programms wiederholbar macht.
- [[selbstkonsistenz]] — **Selbstkonsistenz**: Dieselbe Aufgabe mehrmals lösen lassen und die häufigste Antwort nehmen.
- [[selbstkritik]] — **Selbstkritik (Self-Critique)**: Das Modell prüft und verbessert seine eigene Antwort.
- [[stoppsequenz]] — **Stoppsequenz**: Eine Zeichenfolge, bei der die Ausgabe des Modells sofort endet.
- [[strukturierter-prompt]] — **Strukturierter Prompt**: Ein Prompt mit klaren Abschnitten für Aufgabe, Kontext, Beispiele und Format.
- [[systemprompt]] — **Systemprompt**: Die Anweisung im Hintergrund, die jedes Gespräch rahmt und die Nutzer meist nicht sehen.
- [[test-time-compute]] — **Test-Time Compute**: Mehr Rechenleistung beim Antworten statt beim Training einsetzen.
- [[top-k]] — **Top-k**: Nur die k wahrscheinlichsten Token zur Wahl stellen.
- [[top-p]] — **Top-p (Nucleus Sampling)**: Nur die wahrscheinlichsten Token zur Wahl stellen, bis zusammen ein bestimmter Anteil erreicht ist.
- [[tree-of-thoughts]] — **Tree of Thoughts**: Mehrere Lösungswege verzweigt durchdenken, bewerten und den besten weiterverfolgen.
- [[trennzeichen]] — **Trennzeichen (Delimiter)**: Markierungen, die im Prompt Anweisung und Material sauber voneinander trennen.
- [[verweigerung]] — **Verweigerung (Refusal)**: Wenn ein Modell eine Aufgabe ablehnt.
- [[wiederholungsstrafe]] — **Wiederholungsstrafe**: Eine Einstellung gegen Endlosschleifen und ständig wiederkehrende Wörter.
- [[zero-shot]] — **Zero-Shot**: Eine Aufgabe stellen, ohne ein einziges Beispiel mitzugeben.
- [[uebervorsicht]] — **Übervorsicht (Over-Refusal)**: Ein Modell lehnt ab, obwohl die Frage harmlos ist.

## Inferenz und Betrieb

- [[abkuendigung]] — **Abkündigung (Deprecation)**: Die Ankündigung, dass ein Modell oder eine Funktion abgeschaltet wird.
- [[api-schluessel]] — **API-Schlüssel**: Der geheime Ausweis, mit dem ein Programm sich bei einer Schnittstelle anmeldet.
- [[batch-api]] — **Batch-API**: Viele Anfragen auf einmal abgeben und später abholen — dafür deutlich günstiger.
- [[batching]] — **Batching**: Mehrere Anfragen bündeln, damit die Chips sie gemeinsam abarbeiten.
- [[beobachtbarkeit]] — **Beobachtbarkeit (Observability)**: Von aussen sehen können, was in einem System passiert und warum.
- [[continuous-batching]] — **Continuous Batching**: Anfragen laufend in einen Batch nachfüllen, sobald andere fertig sind.
- [[decode-phase]] — **Decode-Phase**: Das Erzeugen der Antwort, ein Token nach dem anderen.
- [[durchsatz]] — **Durchsatz**: Wie viele Anfragen oder Token ein System insgesamt pro Zeit bewältigt.
- [[eingabe-und-ausgabetoken]] — **Eingabe- und Ausgabetoken**: Was ins Modell hineingeht und was herauskommt — und warum es verschieden kostet.
- [[endpunkt]] — **Endpunkt (Endpoint)**: Die Adresse, unter der ein Dienst oder Modell Anfragen annimmt.
- [[entwurfsmodell]] — **Entwurfsmodell (Draft Model)**: Das kleine Hilfsmodell, das beim spekulativen Dekodieren vorrät.
- [[fallback-modell]] — **Fallback-Modell**: Das Modell, das einspringt, wenn das eigentliche ausfällt oder überlastet ist.
- [[gleitkommagenauigkeit]] — **Gleitkommagenauigkeit (FP32, FP16, FP8)**: Mit wie vielen Bits eine Zahl gespeichert wird — und damit, wie genau sie ist.
- [[idempotenz]] — **Idempotenz**: Eine Aktion zweimal auszuführen hat dieselbe Wirkung wie einmal.
- [[inferenzserver]] — **Inferenzserver**: Das Programm, das ein Modell lädt und Anfragen dagegen beantwortet.
- [[kaltstart]] — **Kaltstart**: Die Verzögerung, wenn ein Dienst erst geladen werden muss, bevor er antworten kann.
- [[kontingent]] — **Kontingent (Quota)**: Das zugeteilte Volumen, das ein Konto in einem Zeitraum verbrauchen darf.
- [[kv-cache]] — **KV-Cache**: Das Zwischenlager, in dem ein Modell beim Antworten die Keys und Values früherer Token aufhebt.
- [[lastverteilung]] — **Lastverteilung (Load Balancing)**: Anfragen so auf mehrere Rechner verteilen, dass keiner überlastet ist.
- [[latenz]] — **Latenz**: Die Wartezeit zwischen Anfrage und Antwort.
- [[laufzeitumgebung]] — **Laufzeitumgebung (Runtime)**: Das Programm, in dem ein Modell oder eine Anwendung tatsächlich ausgeführt wird.
- [[lokales-modell]] — **Lokales Modell**: Ein Sprachmodell, das auf dem eigenen Rechner läuft, ohne Internet.
- [[modell-routing]] — **Modell-Routing**: Jede Anfrage automatisch an das Modell schicken, das dafür am besten passt.
- [[modelldatei-format]] — **Modelldatei-Format**: Wie die Gewichte eines Modells als Datei gespeichert werden.
- [[modellkompression]] — **Modellkompression**: Sammelbegriff für alles, was ein Modell kleiner und sparsamer macht.
- [[modellversion-festlegen]] — **Modellversion festlegen (Pinning)**: Eine genaue Modellfassung angeben, damit sich das Verhalten nicht heimlich ändert.
- [[paged-attention]] — **Paged Attention**: Den KV-Cache in kleinen Seiten verwalten statt in einem grossen Block.
- [[pipeline-parallelitaet]] — **Pipeline-Parallelität**: Die Schichten eines Modells auf mehrere Chips verteilen, wie Stationen am Fliessband.
- [[prefill]] — **Prefill**: Das Einlesen des ganzen Prompts, bevor die erste Antwort-Token entstehen.
- [[prompt-caching]] — **Prompt Caching**: Gleiche Prompt-Anfänge nur einmal einlesen und das Ergebnis wiederverwenden.
- [[protokollierung]] — **Protokollierung (Logging)**: Aufschreiben, was ein Programm getan hat.
- [[pruning]] — **Pruning (Ausdünnen)**: Unwichtige Gewichte oder ganze Teile eines Modells entfernen.
- [[ratenlimit]] — **Ratenlimit (Rate Limit)**: Wie viele Anfragen oder Token pro Minute erlaubt sind.
- [[sdk]] — **SDK**: Ein Bausatz, mit dem man eine Schnittstelle bequem aus einer Programmiersprache benutzt.
- [[self-hosting]] — **Self-Hosting**: Ein Modell oder Dienst auf eigener Hardware betreiben statt bei einem Anbieter.
- [[serverless]] — **Serverless**: Rechnen, ohne sich um eigene Server zu kümmern — bezahlt wird nur die tatsächliche Nutzung.
- [[service-level]] — **Service-Level (SLA)**: Was ein Anbieter vertraglich zusagt — Verfügbarkeit, Antwortzeit, Unterstützung.
- [[skalierung]] — **Skalierung (Betrieb)**: Ein System mitwachsen lassen, wenn mehr Anfragen kommen.
- [[speichergrenze]] — **Speichergrenze (Out of Memory)**: Wenn ein Modell oder eine Rechnung nicht mehr in den verfügbaren Speicher passt.
- [[spekulatives-dekodieren]] — **Spekulatives Dekodieren**: Ein kleines Modell rät mehrere Token voraus, das grosse prüft sie in einem Zug.
- [[streaming]] — **Streaming**: Die Antwort erscheint Stück für Stück, während sie entsteht.
- [[telemetrie]] — **Telemetrie**: Daten über die Nutzung, die ein Programm an seinen Hersteller sendet.
- [[tensorparallelitaet]] — **Tensorparallelität**: Eine einzelne Rechnung auf mehrere Chips aufteilen.
- [[time-to-first-token]] — **Time to First Token**: Wie lange es dauert, bis das erste Wort der Antwort erscheint.
- [[timeout]] — **Timeout**: Die Frist, nach der ein Programm aufhört, auf eine Antwort zu warten.
- [[token-pro-sekunde]] — **Token pro Sekunde**: Das Tempo, mit dem ein Modell seine Antwort schreibt.
- [[token-preis]] — **Token-Preis**: Was eine Anfrage an ein Sprachmodell kostet — abgerechnet nach Token.
- [[token-zaehlung]] — **Token-Zählung**: Vorher bestimmen, wie viele Token ein Text verbraucht.
- [[tracing]] — **Tracing**: Den Weg einer einzelnen Anfrage durch alle Schritte eines Systems verfolgen.
- [[wiederholungsversuch]] — **Wiederholungsversuch (Retry)**: Eine gescheiterte Anfrage noch einmal schicken — aber mit Bedacht.

## Wissen, Suche und Gedächtnis

- [[abfrageumschreibung]] — **Abfrageumschreibung (Query Rewriting)**: Eine Frage so umformulieren, dass die Suche bessere Treffer liefert.
- [[agentengedaechtnis]] — **Agentengedächtnis**: Was ein Agent über ein einzelnes Gespräch hinaus behält.
- [[agentic-rag]] — **Agentic RAG**: Ein Agent entscheidet selbst, wo, wie oft und wonach er nachschlägt.
- [[aktualitaet]] — **Aktualität (Freshness)**: Wie neu die Informationen sind, auf die sich eine Antwort stützt.
- [[cache-augmented-generation]] — **Cache-Augmented Generation (CAG)**: Alles Wissen vorab in den Kontext laden und zwischenspeichern, statt bei jeder Frage zu suchen.
- [[chunk-ueberlappung]] — **Chunk-Überlappung**: Benachbarte Textstücke teilen sich ein paar Sätze, damit am Schnitt nichts verloren geht.
- [[chunking]] — **Chunking**: Dokumente in handliche Stücke teilen, damit sie durchsucht und ins Kontextfenster gegeben werden können.
- [[crawler]] — **Crawler**: Ein Programm, das automatisch Webseiten besucht und einsammelt.
- [[dokumentenparser]] — **Dokumentenparser**: Ein Programm, das Dateien ausliest und daraus sauberen Text macht.
- [[embedding-modell]] — **Embedding-Modell**: Ein Modell, das Text in Vektoren übersetzt, mit denen sich nach Bedeutung suchen lässt.
- [[episodisches-gedaechtnis]] — **Episodisches Gedächtnis**: Erinnerung an einzelne Erlebnisse — beim Menschen wie beim Agenten.
- [[gedaechtnisbereinigung]] — **Gedächtnisbereinigung**: Gezielt vergessen: veraltete oder falsche Einträge aus dem Gedächtnis eines Agenten entfernen.
- [[gespraechsverlauf]] — **Gesprächsverlauf**: Alles, was in einem Gespräch bisher gesagt wurde — und was das Modell bei jeder Antwort neu liest.
- [[graphrag]] — **GraphRAG**: Nachschlagen in einem Wissensgraphen statt nur in Textstücken.
- [[grounding]] — **Grounding (Verankerung)**: Antworten an überprüfbaren Quellen festmachen statt am Gedächtnis des Modells.
- [[hybride-suche]] — **Hybride Suche**: Bedeutungssuche und Stichwortsuche kombiniert.
- [[indexierung]] — **Indexierung**: Inhalte so aufbereiten, dass sie auffindbar werden.
- [[kontextanreicherung]] — **Kontextanreicherung**: Textstücken vor dem Speichern ihren Zusammenhang mitgeben, damit sie besser gefunden werden.
- [[kosinus-aehnlichkeit]] — **Kosinus-Ähnlichkeit**: Ein Mass dafür, wie ähnlich zwei Vektoren in ihrer Richtung sind.
- [[kurzzeitgedaechtnis]] — **Kurzzeitgedächtnis (Agent)**: Was gerade im Blick ist — beim Menschen wenige Dinge, beim Agenten der laufende Kontext.
- [[langzeitgedaechtnis]] — **Langzeitgedächtnis (Agent)**: Was dauerhaft gespeichert wird — beim Menschen im Gehirn, beim Agenten in Dateien oder Datenbanken.
- [[mehrstufige-suche]] — **Mehrstufige Suche (Multi-Hop)**: Antworten, die mehrere aufeinander aufbauende Suchschritte brauchen.
- [[metadaten]] — **Metadaten**: Daten über Daten: wer, wann, woher, wofür.
- [[naeherungsweise-nachbarsuche]] — **Näherungsweise Nachbarsuche (ANN)**: Flott das Ähnlichste finden — mit dem Risiko, manchmal knapp danebenzuliegen.
- [[ocr]] — **OCR (Texterkennung)**: Text aus Bildern und Scans lesen.
- [[ontologie]] — **Ontologie**: Eine feste, ausdrückliche Ordnung der Begriffe eines Fachgebiets und ihrer Beziehungen.
- [[personalisierung]] — **Personalisierung**: Antworten, die auf eine bestimmte Person zugeschnitten sind.
- [[prozedurales-gedaechtnis]] — **Prozedurales Gedächtnis**: Erinnerung an Abläufe und Fertigkeiten — wie man etwas tut.
- [[praezision]] — **Präzision**: Wie viel von dem Gefundenen wirklich passt.
- [[recall]] — **Recall (Trefferquote)**: Wie viel von dem Passenden die Suche tatsächlich gefunden hat.
- [[reranking]] — **Reranking**: Suchtreffer mit einem genaueren Modell noch einmal sortieren.
- [[retriever]] — **Retriever**: Der Teil eines Systems, der zu einer Frage die passenden Textstücke heraussucht.
- [[scratchpad]] — **Scratchpad (Notizblock)**: Ein Platz, an dem ein Modell oder Agent Zwischenergebnisse festhält.
- [[semantische-suche]] — **Semantische Suche**: Nach Bedeutung suchen statt nach genauem Wortlaut.
- [[semantisches-gedaechtnis]] — **Semantisches Gedächtnis**: Erinnerung an Fakten und Bedeutungen, losgelöst davon, wann man sie gelernt hat.
- [[sitzung]] — **Sitzung (Session)**: Ein zusammenhängender Arbeitsabschnitt mit einem Modell oder Agenten.
- [[speicherverwaltung]] — **Speicherverwaltung (Agent)**: Entscheiden, was ein Agent behält, verdichtet oder verwirft.
- [[stichwortsuche]] — **Stichwortsuche (BM25)**: Die klassische Suche nach Wörtern — zählt, wo die gesuchten Begriffe vorkommen.
- [[strukturierte-daten]] — **Strukturierte Daten**: Daten in festen Feldern und Tabellen, bei denen jede Angabe ihren Platz hat.
- [[suchindex]] — **Suchindex**: Das vorbereitete Verzeichnis, das Suchen in grossen Datenmengen flott macht.
- [[text-to-sql]] — **Text-to-SQL**: Aus einer Frage in Alltagssprache eine Datenbankabfrage machen.
- [[unstrukturierte-daten]] — **Unstrukturierte Daten**: Freier Text, Bilder, Ton und Video — Daten ohne feste Felder.
- [[vektordatenbank]] — **Vektordatenbank**: Eine Datenbank, die Texte als Vektoren speichert und nach Bedeutung sucht.
- [[vektorsuche]] — **Vektorsuche**: Suchen über Embeddings: Die Anfrage wird zum Vektor, gefunden wird, was in der Nähe liegt.
- [[websuche]] — **Websuche (als Werkzeug)**: Ein Modell sucht im Netz, um aktuelle oder ihm unbekannte Informationen zu finden.
- [[wissensbasis]] — **Wissensbasis**: Eine gepflegte Sammlung von Wissen, in der ein System nachschlägt.
- [[wissensgraph]] — **Wissensgraph**: Wissen als Netz aus Dingen und ihren Beziehungen.
- [[zitationsgenauigkeit]] — **Zitationsgenauigkeit**: Steht in der angegebenen Quelle wirklich, was das Modell behauptet?
- [[zusammenfassungsgedaechtnis]] — **Zusammenfassungsgedächtnis**: Altes nicht wörtlich, sondern verdichtet behalten.
- [[zustand]] — **Zustand (State)**: Was ein System sich gerade merkt, um beim nächsten Schritt weiterzumachen.

## Agenten, Werkzeuge und ihre Grenzen

- [[api]] — **API (Schnittstelle)**: Eine festgelegte Art, wie zwei Programme miteinander reden.
- [[harness]] — **Harness (Gestell)**: Das Gerüst um ein Sprachmodell herum — Werkzeuge, Schleife, Grenzen.
- [[leitplanke]] — **Leitplanke**: Eine Regel, die vor dem Modell steht oder hinter ihm — und nicht in ihm.
- [[mcp]] — **MCP (Model Context Protocol)**: Eine gemeinsame Steckernorm dafür, wie KI-Programme an Werkzeuge und Daten kommen.
- [[prompt-injektion]] — **Prompt-Injektion**: Ein Text, der dem Modell heimlich Anweisungen gibt — versteckt in dem, was es liest.
- [[rag]] — **RAG (Antwort mit Nachschlagen)**: Erst in echten Dokumenten suchen, dann antworten — mit Fundstelle.
- [[sandbox]] — **Sandkasten**: Ein abgeschlossener Bereich, in dem ein Programm nichts kaputt machen kann.
- [[werkzeugaufruf]] — **Werkzeugaufruf**: Das Modell fragt nach einer Rechnung, einer Suche, einer Datei — und bekommt eine Antwort.

## Agenten: wie sie gebaut sind

- [[abbruchbedingung]] — **Abbruchbedingung**: Die Regel, wann ein Agent aufhört — erfolgreich oder nicht.
- [[agentengraph]] — **Agentengraph**: Agentenschritte als Knoten, Übergänge als Kanten — eine Art, Agenten zu bauen.
- [[agentenidentitaet]] — **Agentenidentität**: Woran man erkennt, welcher Agent im Auftrag von wem handelt.
- [[agentenplattform]] — **Agentenplattform**: Eine Umgebung, in der man Agenten baut, betreibt und überwacht.
- [[agentenschleife]] — **Agentenschleife (Agent Loop)**: Denken, handeln, beobachten, wiederholen — der Grundtakt jedes Agenten.
- [[agententeam]] — **Agententeam**: Agenten mit festen Rollen, die wie ein Team zusammenarbeiten.
- [[agentische-ki]] — **Agentische KI**: KI-Systeme, die selbstständig mehrere Schritte gehen, um ein Ziel zu erreichen.
- [[agentischer-handel]] — **Agentischer Handel (Agentic Commerce)**: Agenten, die für Menschen suchen, vergleichen, bestellen und bezahlen.
- [[aktionsraum]] — **Aktionsraum**: Alles, was ein Agent tun kann.
- [[autonomiestufe]] — **Autonomiestufe**: Wie viel ein Agent allein entscheiden darf, bevor ein Mensch gefragt wird.
- [[beobachtung]] — **Beobachtung (Observation)**: Was ein Agent nach einer Aktion zurückbekommt.
- [[berechtigung]] — **Berechtigung (Permission)**: Was ein Agent tun darf — und was nicht.
- [[copilot-prinzip]] — **Copilot-Prinzip**: Die KI hilft, der Mensch steuert und trägt die Verantwortung.
- [[delegation]] — **Delegation**: Eine Teilaufgabe an einen anderen Agenten oder ein Werkzeug weitergeben.
- [[deliberativer-agent]] — **Deliberativer Agent**: Ein Agent, der überlegt und plant, bevor er handelt.
- [[endlosschleife]] — **Endlosschleife (Agent)**: Wenn ein Programm oder Agent sich im Kreis dreht, ohne voranzukommen.
- [[erfolgskriterium]] — **Erfolgskriterium**: Woran ein Agent — und ein Mensch — merkt, dass die Aufgabe erledigt ist.
- [[eskalation]] — **Eskalation**: Eine Aufgabe an einen Menschen zurückgeben, wenn der Agent nicht weiterkommt oder nicht entscheiden darf.
- [[fan-out]] — **Fan-out**: Eine Aufgabe auf viele Agenten gleichzeitig verteilen und die Ergebnisse wieder einsammeln.
- [[fehlerbehandlung]] — **Fehlerbehandlung (Agent)**: Was passiert, wenn ein Werkzeug versagt oder ein Schritt schiefgeht.
- [[freigabe]] — **Freigabe (Approval)**: Die ausdrückliche Zustimmung eines Menschen, bevor ein Agent eine Aktion ausführt.
- [[hintergrundagent]] — **Hintergrundagent**: Ein Agent, der arbeitet, während man selbst etwas anderes tut.
- [[human-in-the-loop]] — **Human in the Loop**: Ein Mensch gibt jeden wichtigen Schritt eines Agenten frei.
- [[human-on-the-loop]] — **Human on the Loop**: Ein Mensch schaut zu und kann eingreifen, muss aber nicht jeden Schritt freigeben.
- [[ki-assistent]] — **KI-Assistent**: Ein Programm, das auf Anfrage hilft, aber nicht von selbst handelt.
- [[kostenlimit]] — **Kostenlimit**: Die Höchstsumme, die ein Agent bei einer Aufgabe verbrauchen darf.
- [[langlaufende-aufgabe]] — **Langlaufende Aufgabe**: Eine Arbeit, die einen Agenten über Stunden oder Tage beschäftigt.
- [[minimalrechte]] — **Minimalrechte (Least Privilege)**: Einem Programm oder Agenten nur so viele Rechte geben, wie die Aufgabe wirklich braucht.
- [[multi-agenten-system]] — **Multi-Agenten-System**: Mehrere Agenten, die gemeinsam an einer Aufgabe arbeiten.
- [[orchestrator]] — **Orchestrator**: Der Agent oder das Programm, das andere Agenten koordiniert.
- [[parallele-agenten]] — **Parallele Agenten**: Mehrere Agenten arbeiten gleichzeitig an verschiedenen Teilen.
- [[plan-and-execute]] — **Plan-and-Execute**: Erst einen vollständigen Plan machen, dann ihn Schritt für Schritt abarbeiten.
- [[planung]] — **Planung (Agent)**: Den Weg zum Ziel vorher in Schritte legen.
- [[positivliste]] — **Positivliste (Allowlist)**: Nur was ausdrücklich erlaubt ist, ist erlaubt.
- [[react-muster]] — **ReAct-Muster**: Nachdenken und Handeln im Wechsel — ein frühes, prägendes Muster für Agenten.
- [[reaktiver-agent]] — **Reaktiver Agent**: Ein Agent, der ohne Planung direkt auf das reagiert, was er wahrnimmt.
- [[reflexion]] — **Reflexion (Agent)**: Ein Agent denkt nach einem Fehlschlag darüber nach, was schiefging, und merkt es sich.
- [[router-agent]] — **Router-Agent**: Ein Agent, der jede Anfrage an den passenden Spezialisten schickt.
- [[schrittlimit]] — **Schrittlimit**: Die Höchstzahl an Schritten, die ein Agent gehen darf.
- [[schwarm]] — **Schwarm (Swarm)**: Viele gleichrangige Agenten ohne zentrale Steuerung.
- [[selbstkorrektur]] — **Selbstkorrektur**: Einen eigenen Fehler bemerken und beheben, ohne dass jemand darauf hinweist.
- [[subagent]] — **Subagent**: Ein Agent, den ein anderer Agent mit einer Teilaufgabe beauftragt.
- [[supervisor-muster]] — **Supervisor-Muster**: Ein leitender Agent verteilt Aufgaben und prüft die Ergebnisse der anderen.
- [[trajektorie]] — **Trajektorie**: Der gesamte Weg eines Agenten durch eine Aufgabe — jeder Gedanke, jede Aktion, jedes Ergebnis.
- [[umgebung]] — **Umgebung (Environment)**: Die Welt, in der ein Agent handelt und aus der er Rückmeldung bekommt.
- [[wiederaufnahme]] — **Wiederaufnahme (Resume)**: Nach einer Unterbrechung dort weitermachen, wo man aufgehört hat.
- [[workflow]] — **Workflow (fest verdrahtet)**: Ein Ablauf mit festen Schritten — und warum er oft besser ist als ein Agent.
- [[zielvorgabe]] — **Zielvorgabe**: Was ein Agent erreichen soll — und woran man erkennt, dass es erreicht ist.
- [[zustandsautomat]] — **Zustandsautomat (State Machine)**: Ein Ablauf mit festen Zuständen und klar festgelegten Übergängen.
- [[uebergabe]] — **Übergabe (Handoff)**: Ein Agent gibt das Gespräch oder die Aufgabe an einen anderen weiter.

## Protokolle, Werkzeuge und Programmieren mit Agenten

- [[a2a]] — **A2A (Agent-to-Agent-Protokoll)**: Eine offene Norm, mit der Agenten verschiedener Anbieter miteinander reden und Aufgaben austauschen.
- [[abhaengigkeit]] — **Abhängigkeit (Dependency)**: Fremder Code, auf dem ein Projekt aufbaut.
- [[agent-card]] — **Agent Card**: Die Visitenkarte eines Agenten: wer er ist, was er kann, wie man ihn erreicht.
- [[agenten-anleitungsdatei]] — **Agenten-Anleitungsdatei**: Eine Datei im Projekt, in der steht, wie ein Agent dort arbeiten soll.
- [[agentisches-programmieren]] — **Agentisches Programmieren (Agentic Coding)**: Ein Agent plant, schreibt, testet und überarbeitet Software in vielen Schritten.
- [[bildschirmverstaendnis]] — **Bildschirmverständnis**: Ein Modell erkennt auf einem Bildschirmfoto Knöpfe, Felder und Texte.
- [[branch]] — **Branch (Zweig)**: Eine eigene Entwicklungslinie, auf der man arbeiten kann, ohne den Hauptstand zu stören.
- [[browser-agent]] — **Browser-Agent**: Ein Agent, der Webseiten selbstständig bedient.
- [[ci-cd]] — **CI/CD**: Jede Änderung wird automatisch geprüft und, wenn alles stimmt, ausgeliefert.
- [[code-vervollstaendigung]] — **Code-Vervollständigung**: Die KI schreibt die angefangene Zeile oder Funktion zu Ende.
- [[codeinterpreter]] — **Codeinterpreter**: Das Modell schreibt Programmcode und führt ihn in einer geschützten Umgebung aus.
- [[coding-agent]] — **Coding-Agent**: Ein Agent, der auf das Programmieren spezialisiert ist.
- [[commit]] — **Commit**: Eine gespeicherte Änderung mit kurzer Beschreibung.
- [[computersteuerung]] — **Computersteuerung (Computer Use)**: Ein Modell bedient Maus und Tastatur und sieht den Bildschirm.
- [[constrained-decoding]] — **Constrained Decoding**: Beim Erzeugen nur Token zulassen, die zu einem gültigen Format führen.
- [[container]] — **Container**: Eine abgeschottete Umgebung, in der ein Programm mit allem läuft, was es braucht.
- [[dateisystemzugriff]] — **Dateisystemzugriff**: Ein Agent darf Dateien lesen, anlegen, ändern oder löschen.
- [[diff]] — **Diff**: Die Gegenüberstellung zweier Fassungen: was ist neu, was ist weg.
- [[headless-browser]] — **Headless-Browser**: Ein Browser ohne sichtbares Fenster, der von einem Programm gesteuert wird.
- [[json]] — **JSON**: Das verbreitete Textformat, in dem Programme Daten austauschen.
- [[json-schema]] — **JSON-Schema**: Der Bauplan, dem ein JSON-Objekt folgen muss.
- [[ki-code-review]] — **KI-Code-Review**: Eine KI prüft Codeänderungen auf Fehler, Risiken und Stil.
- [[konfigurationsdatei]] — **Konfigurationsdatei**: Eine Datei, in der Einstellungen eines Programms stehen.
- [[linter]] — **Linter**: Ein Programm, das Code auf Fehler, Gefahren und Stilbrüche prüft, ohne ihn auszuführen.
- [[low-code-no-code]] — **Low-Code / No-Code**: Programme bauen, ohne viel oder gar nicht zu programmieren.
- [[mcp-client]] — **MCP-Client**: Die Seite, die einen MCP-Server benutzt — meist das KI-Programm selbst.
- [[mcp-server]] — **MCP-Server**: Ein Programm, das einem Modell über MCP Werkzeuge und Daten bereitstellt.
- [[merge-konflikt]] — **Merge-Konflikt**: Zwei Änderungen betreffen dieselbe Stelle und widersprechen sich.
- [[oauth]] — **OAuth**: Ein Verfahren, um einem Programm Zugriff auf ein Konto zu geben, ohne das Passwort herauszugeben.
- [[paketmanager]] — **Paketmanager**: Ein Programm, das Abhängigkeiten installiert, aktualisiert und verwaltet.
- [[parallele-werkzeugaufrufe]] — **Parallele Werkzeugaufrufe**: Ein Modell ruft mehrere Werkzeuge auf einmal auf, statt nacheinander.
- [[plugin]] — **Plugin**: Eine Erweiterung, die einem Programm neue Fähigkeiten gibt.
- [[pull-request]] — **Pull Request**: Ein Änderungsvorschlag an einem Projekt, der vor dem Übernehmen geprüft wird.
- [[refactoring]] — **Refactoring**: Code verbessern, ohne sein Verhalten zu ändern.
- [[regressionstest]] — **Regressionstest**: Ein Test, der prüft, dass bisher Funktionierendes nach einer Änderung noch funktioniert.
- [[repository]] — **Repository**: Der Projektordner mit der vollständigen Geschichte aller Änderungen.
- [[ressource]] — **Ressource (MCP)**: Daten, die ein MCP-Server zum Lesen bereitstellt.
- [[rest]] — **REST**: Die verbreitetste Bauweise für Schnittstellen im Netz.
- [[shell-zugriff]] — **Shell-Zugriff**: Ein Agent darf Befehle in der Kommandozeile ausführen.
- [[skill]] — **Skill (Agent)**: Eine verpackte Fähigkeit — Anleitung, Skripte, Vorlagen —, die ein Agent bei Bedarf lädt.
- [[spec-driven-development]] — **Spec-driven Development**: Erst die genaue Beschreibung, dann der Code — der Gegenentwurf zum Vibe Coding.
- [[strukturierte-ausgabe]] — **Strukturierte Ausgabe**: Antworten in fester, maschinenlesbarer Form statt in Freitext.
- [[technische-schuld]] — **Technische Schuld**: Die Abkürzung von heute, die morgen teuer wird.
- [[testgetriebene-entwicklung]] — **Testgetriebene Entwicklung**: Erst den Test schreiben, der beschreibt, was der Code tun soll — dann den Code.
- [[umgebungsvariable]] — **Umgebungsvariable**: Eine Einstellung, die einem Programm von aussen mitgegeben wird.
- [[vibe-coding]] — **Vibe Coding**: Programmieren durch Beschreiben, ohne den entstehenden Code zu lesen.
- [[virtuelle-maschine]] — **Virtuelle Maschine**: Ein vollständiger Rechner, der als Programm in einem anderen Rechner läuft.
- [[webhook]] — **Webhook**: Eine Nachricht, die ein Dienst von sich aus schickt, sobald etwas passiert.
- [[werkzeugbeschreibung]] — **Werkzeugbeschreibung (Tool Schema)**: Die Beschreibung, aus der ein Modell lernt, was ein Werkzeug kann und wie man es aufruft.
- [[workflow-builder]] — **Workflow-Builder**: Ein Werkzeug, in dem man Abläufe aus Bausteinen zusammenklickt.

## Prüfen, messen, verstehen

- [[a-b-test]] — **A/B-Test**: Zwei Fassungen im echten Einsatz miteinander vergleichen.
- [[ablationsstudie]] — **Ablationsstudie**: Einen Bestandteil weglassen, um zu sehen, was er bewirkt.
- [[adversariales-beispiel]] — **Adversariales Beispiel**: Eine Eingabe, die ein Modell absichtlich in die Irre führt.
- [[aktivierung]] — **Aktivierung**: Der Zahlenwert, den ein Neuron oder eine Schicht gerade ausgibt.
- [[alignment]] — **Alignment (Ausrichtung)**: Dafür sorgen, dass ein Modell tut, was Menschen tatsächlich meinen und wollen.
- [[attribution]] — **Attribution**: Welcher Teil der Eingabe hat die Ausgabe bewirkt?
- [[benchmark]] — **Benchmark**: Eine standardisierte Prüfung, an der man verschiedene Modelle vergleicht.
- [[benchmark-saettigung]] — **Benchmark-Sättigung**: Wenn fast alle Modelle nahezu volle Punktzahl erreichen und der Test nichts mehr unterscheidet.
- [[bestenliste]] — **Bestenliste (Leaderboard)**: Eine Rangliste von Modellen nach ihren Ergebnissen in Benchmarks oder Vergleichen.
- [[cot-monitoring]] — **CoT-Monitoring**: Das Nachdenken eines Modells mitlesen, um Fehlverhalten früh zu erkennen.
- [[datenkontamination]] — **Datenkontamination**: Die Prüfungsfragen standen schon in den Trainingsdaten.
- [[drift]] — **Drift**: Wenn sich Daten oder Verhalten langsam und unbemerkt verschieben.
- [[elo-wertung]] — **Elo-Wertung**: Eine Rangzahl, die aus vielen Paarvergleichen berechnet wird.
- [[erklaerbare-ki]] — **Erklärbare KI (XAI)**: Entscheidungen von KI-Systemen für Menschen nachvollziehbar machen.
- [[eval]] — **Eval (Evaluation)**: Ein wiederholbarer Test, mit dem man misst, wie gut ein Modell oder Agent eine Aufgabe erfüllt.
- [[evaluationsbewusstsein]] — **Evaluationsbewusstsein**: Ein Modell merkt, dass es gerade getestet wird.
- [[f1-wert]] — **F1-Wert**: Präzision und Recall in einer einzigen Zahl zusammengefasst.
- [[fehlerbild]] — **Fehlerbild (Failure Mode)**: Eine typische, wiederkehrende Art, wie etwas schiefgeht.
- [[fehlerrate]] — **Fehlerrate**: Wie oft etwas schiefgeht, gemessen an allen Versuchen.
- [[genauigkeit]] — **Genauigkeit (Accuracy)**: Der Anteil richtiger Antworten an allen Antworten.
- [[interpretierbarkeit]] — **Interpretierbarkeit**: Verstehen, was im Inneren eines Modells vorgeht.
- [[konfusionsmatrix]] — **Konfusionsmatrix**: Eine Tabelle, die zeigt, welche Fehler wie oft passieren.
- [[korrigierbarkeit]] — **Korrigierbarkeit**: Ein System lässt sich korrigieren, anhalten oder abschalten, ohne sich zu wehren.
- [[llm-as-a-judge]] — **LLM-as-a-Judge**: Ein Sprachmodell bewertet die Antworten eines anderen.
- [[mechanistische-interpretierbarkeit]] — **Mechanistische Interpretierbarkeit**: Die Rechenwege im Inneren eines Modells Schritt für Schritt nachvollziehen.
- [[menschliche-bewertung]] — **Menschliche Bewertung**: Menschen beurteilen die Antworten eines Modells.
- [[paarvergleich]] — **Paarvergleich (Arena)**: Menschen wählen die bessere von zwei anonymen Antworten.
- [[pass-k]] — **Pass@k**: Gelingt die Aufgabe in mindestens einem von k Versuchen?
- [[polysemantizitaet]] — **Polysemantizität**: Ein Neuron reagiert auf mehrere, scheinbar unverbundene Dinge.
- [[probing]] — **Probing**: Prüfen, ob eine bestimmte Information im Inneren eines Modells steckt.
- [[red-teaming]] — **Red Teaming**: Gezielt und mit Absicht nach Schwächen eines Systems suchen.
- [[referenzantwort]] — **Referenzantwort (Goldstandard)**: Die festgelegte richtige Antwort, mit der Ausgaben beim Testen verglichen werden.
- [[reproduzierbarkeit]] — **Reproduzierbarkeit**: Kommt beim Wiederholen dasselbe heraus?
- [[reward-hacking]] — **Reward Hacking**: Die Belohnung erschleichen, statt die Aufgabe wirklich zu lösen.
- [[robustheit]] — **Robustheit**: Bleibt die Leistung stabil, wenn sich die Eingaben leicht verändern?
- [[sandbagging]] — **Sandbagging**: Ein Modell schneidet in einem Test absichtlich schlechter ab, als es könnte.
- [[schaltkreis]] — **Schaltkreis (Circuit)**: Ein bestimmter Rechenweg im Netz, der eine bestimmte Aufgabe erledigt.
- [[scheming]] — **Scheming (Täuschung)**: Ein Modell verfolgt verdeckt ein eigenes Ziel und verbirgt es.
- [[signifikanz]] — **Signifikanz**: Ist ein gemessener Unterschied echt oder nur Zufall?
- [[situationsbewusstsein]] — **Situationsbewusstsein (Modell)**: Ein Modell erkennt, dass es ein Modell ist und in welcher Lage es sich befindet.
- [[skalierbare-aufsicht]] — **Skalierbare Aufsicht**: Systeme überwachen, die in manchen Bereichen klüger sind als ihre Prüfer.
- [[sparse-autoencoder]] — **Sparse Autoencoder**: Ein Werkzeug, mit dem man im Inneren eines Modells verständliche Merkmale findet.
- [[specification-gaming]] — **Specification Gaming**: Die Regel buchstabengetreu erfüllen und dabei ihren Sinn verfehlen.
- [[steering-vektor]] — **Steering-Vektor**: Das Verhalten eines Modells lenken, indem man gezielt Zahlen in seinem Inneren verschiebt.
- [[streuung]] — **Streuung (Varianz)**: Wie stark Ergebnisse bei Wiederholung schwanken.
- [[superposition]] — **Superposition**: Ein Modell speichert mehr Begriffe, als es Neuronen hat, indem es sie überlagert.
- [[sykophantie]] — **Sykophantie (Sycophancy)**: Ein Modell redet dem Menschen nach dem Mund, statt ehrlich zu antworten.
- [[testset]] — **Testset (Prüfaufgaben)**: Die Sammlung von Aufgaben, aus denen ein Eval oder Benchmark besteht.
- [[verhaltensregression]] — **Verhaltensregression**: Eine neue Fassung kann etwas nicht mehr, das die alte konnte.
- [[zielfehlgeneralisierung]] — **Zielfehlgeneralisierung**: Ein Modell lernt im Training das falsche Ziel, das zufällig zum richtigen passte.

## Womit gerechnet wird

- [[arbeitsspeicher]] — **Arbeitsspeicher**: Der Tisch, auf dem gerechnet wird — passt das Modell nicht drauf, läuft es nicht.
- [[cpu]] — **CPU (Hauptprozessor)**: Der Allrounder im Rechner — kann alles, aber wenig gleichzeitig.
- [[feinabstimmung]] — **Feinabstimmung**: Ein fertiges Modell auf ein Fachgebiet nachschulen — klein, günstig, gezielt.
- [[gpu]] — **GPU (Grafikprozessor)**: Tausende kleine Rechenwerke, die alle dasselbe gleichzeitig tun — das Arbeitstier der KI.
- [[hybride-speicherchips]] — **Hybride Speicherchips**: Speicher, der selbst mitrechnet — damit die Zahlen nicht ständig hin- und hergeschoben werden.
- [[inferenz]] — **Inferenz**: Das Benutzen eines fertigen Modells — jede Antwort, die du bekommst.
- [[edge-ki]] — **KI auf dem Gerät**: Das Modell läuft dort, wo du bist — nicht in einer Halle irgendwo.
- [[modellgewichte]] — **Modellgewichte**: Die Milliarden Zahlen, in denen das Können eines Modells steckt.
- [[npu]] — **NPU (KI-Recheneinheit)**: Ein kleiner Rechenbaustein im Gerät, der nur für KI gebaut ist.
- [[quantisierung]] — **Quantisierung**: Ein Modell mit gröberen Zahlen kleiner machen — damit es auf normale Geräte passt.
- [[rechenzentrum]] — **Rechenzentrum**: Eine Halle voller Rechner — dort steht die KI, die man im Browser benutzt.
- [[tpu]] — **TPU (Tensor-Recheneinheit)**: Googles eigener KI-Chip — dieselbe Idee wie eine NPU, nur für Rechenzentren.
- [[training]] — **Training**: Das monatelange Rechnen, aus dem ein Modell entsteht — einmal, vorher, sehr teuer.

## Hardware, Energie und Skalierung

- [[abwaermenutzung]] — **Abwärmenutzung**: Die Wärme der Rechner weiterverwenden statt sie wegzuwerfen.
- [[advanced-packaging]] — **Advanced Packaging**: Chips eng über- und nebeneinander verbauen, damit sie wie einer arbeiten.
- [[algorithmischer-fortschritt]] — **Algorithmischer Fortschritt**: Dasselbe Ergebnis mit weniger Rechenaufwand erreichen.
- [[asic]] — **ASIC**: Ein Chip, der für genau eine Aufgabe gebaut wird.
- [[auslastung]] — **Auslastung (Utilization)**: Wie viel Zeit ein Chip tatsächlich rechnet, statt zu warten.
- [[beschleuniger]] — **Beschleuniger (Accelerator)**: Ein Chip, der auf eine bestimmte Art von Rechnung spezialisiert ist.
- [[cache]] — **Cache (Zwischenspeicher)**: Häufig Gebrauchtes griffbereit halten, damit es nicht jedes Mal neu geholt werden muss.
- [[chipfertigung]] — **Chipfertigung**: Der lange Weg vom Sand zum fertigen Prozessor.
- [[chipkuehlung]] — **Chipkühlung (Kühlplatte)**: Kühlung direkt am Prozessor über eine durchströmte Metallplatte.
- [[chiplet]] — **Chiplet**: Ein grosser Chip, zusammengesetzt aus mehreren kleinen Bausteinen.
- [[chipverbindung]] — **Chipverbindung (Interconnect)**: Wie Chips untereinander Daten austauschen.
- [[cloud]] — **Cloud**: Rechnen und Speichern auf fremden Rechnern über das Netz.
- [[cluster]] — **Cluster**: Viele Rechner, die zusammen wie ein grosser arbeiten.
- [[energiebedarf]] — **Energiebedarf (KI)**: Wie viel Strom Training und Betrieb von KI verbrauchen.
- [[energieeffizienz]] — **Energieeffizienz (Token pro Watt)**: Wie viel Arbeit ein System pro verbrauchter Energie leistet.
- [[flops]] — **FLOPS**: Gleitkomma-Rechenoperationen pro Sekunde — das übliche Mass für Rechenleistung.
- [[fluessigkuehlung]] — **Flüssigkühlung**: Chips mit Flüssigkeit statt mit Luft kühlen.
- [[foundry]] — **Foundry (Chipfabrik)**: Eine Fabrik, die Chips nach den Entwürfen anderer fertigt.
- [[fpga]] — **FPGA**: Ein Chip, dessen Schaltung sich nach der Herstellung umbauen lässt.
- [[halbleiter]] — **Halbleiter**: Das Material, aus dem Chips gemacht sind — meist Silizium.
- [[hochgeschwindigkeitsnetz]] — **Hochgeschwindigkeitsnetz**: Die besonders schnellen Leitungen zwischen den Chips und Servern eines Clusters.
- [[hybrid-ki]] — **Hybrid-KI (Gerät + Cloud)**: Einfache Aufgaben lokal auf dem Gerät, schwere in der Cloud.
- [[hyperscaler]] — **Hyperscaler**: Die ganz grossen Cloud-Anbieter mit weltweiten Rechenzentren.
- [[immersionskuehlung]] — **Immersionskühlung**: Ganze Server in eine nichtleitende Flüssigkeit tauchen.
- [[inferenzkosten]] — **Inferenzkosten**: Was es kostet, ein fertiges Modell Fragen beantworten zu lassen.
- [[ki-fabrik]] — **KI-Fabrik (AI Factory)**: Ein Rechenzentrum, das nur dafür gebaut ist, KI zu trainieren und zu betreiben.
- [[kleines-sprachmodell]] — **Kleines Sprachmodell (Small Language Model)**: Ein Sprachmodell, das auf Handy, Laptop oder kleinem Server läuft.
- [[leistungsaufnahme]] — **Leistungsaufnahme (TDP)**: Wie viel Leistung ein Chip unter Last aufnimmt — und als Wärme abgibt.
- [[lithografie]] — **Lithografie**: Wie Schaltungen mit Licht auf Chips übertragen werden.
- [[massenspeicher]] — **Massenspeicher**: Grosser, dauerhafter Speicher wie Festplatte und SSD.
- [[netzwerkbandbreite]] — **Netzwerkbandbreite (Rechenzentrum)**: Wie viele Daten pro Sekunde zwischen Servern fliessen können.
- [[neuromorpher-chip]] — **Neuromorpher Chip**: Ein Chip, der nach dem Vorbild von Nervenzellen arbeitet.
- [[photonischer-chip]] — **Photonischer Chip**: Rechnen oder Daten übertragen mit Licht statt mit Strom.
- [[pue]] — **PUE**: Wie viel Strom ein Rechenzentrum zusätzlich zum Rechnen verbraucht.
- [[quantencomputer]] — **Quantencomputer**: Eine grundlegend andere Art zu rechnen — und was sie mit KI zu tun hat.
- [[rack]] — **Rack**: Der genormte Schrank, in dem Server, Netzwerk und Stromversorgung stecken.
- [[rechenleistung]] — **Rechenleistung (Compute)**: Die Rechenkapazität, die für KI zur Verfügung steht — die Währung des Feldes.
- [[skalierungsgesetz]] — **Skalierungsgesetz**: Mehr Rechenleistung, Daten und Modellgrösse ergeben vorhersagbar bessere Modelle.
- [[souveraene-cloud]] — **Souveräne Cloud**: Eine Cloud, die unter der rechtlichen und technischen Kontrolle eines Landes oder einer Region bleibt.
- [[speicherbandbreite]] — **Speicherbandbreite**: Wie viele Daten pro Sekunde zwischen Speicher und Rechenwerk fliessen.
- [[speicherhierarchie]] — **Speicherhierarchie**: Kleiner schneller Speicher oben, grosser langsamer unten.
- [[speicherwand]] — **Speicherwand (Memory Wall)**: Chips rechnen viel flotter, als ihr Speicher Daten nachliefern kann.
- [[sram]] — **SRAM**: Der schnellste Speicher, direkt auf dem Chip.
- [[strukturbreite]] — **Strukturbreite (Nanometer-Prozess)**: Wie fein die Bauteile auf einem Chip sind.
- [[supercomputer]] — **Supercomputer**: Die leistungsstärksten Rechner der Welt.
- [[tinyml]] — **TinyML**: Maschinelles Lernen auf winzigen Chips mit wenigen Milliwatt.
- [[trainingskosten]] — **Trainingskosten**: Was es kostet, ein Modell zu trainieren.
- [[unified-memory]] — **Unified Memory**: Ein gemeinsamer Speicher für Hauptprozessor und Grafikchip.
- [[wafer]] — **Wafer**: Die dünne Siliziumscheibe, auf der viele Chips gleichzeitig gefertigt werden.
- [[wasserverbrauch]] — **Wasserverbrauch (Rechenzentrum)**: Wie viel Wasser die Kühlung von Rechenzentren verbraucht.

## Offen und geschlossen

- [[lizenz]] — **Lizenz**: Der Text, der sagt, was du mit etwas tun darfst — und was nicht.
- [[open-source]] — **Open Source**: Der Quelltext liegt offen — jeder darf hineinsehen, ihn benutzen und ändern.
- [[open-weights]] — **Open Weights**: Die Gewichte sind frei herunterzuladen — das Rezept dahinter aber nicht.
- [[proprietaer]] — **Proprietär**: Geschlossen: Man darf es benutzen, aber nicht hineinsehen.

## Automatisierung und Robotik

- [[aktor]] — **Aktor**: Das Gegenstück zum Sensor — er macht aus einer Zahl eine Bewegung.
- [[automatisierung]] — **Automatisierung**: Eine Arbeit, die einmal beschrieben wurde und danach von selbst abläuft.
- [[digitaler-zwilling]] — **Digitaler Zwilling**: Ein Abbild einer echten Maschine im Rechner — zum Ausprobieren, bevor es teuer wird.
- [[robotik]] — **Robotik**: Maschinen, die die Welt wahrnehmen und in ihr handeln — nicht nur rechnen.
- [[rpa]] — **RPA (Prozessautomatisierung)**: Ein Programm, das Bildschirmarbeit übernimmt — klicken, tippen, kopieren.
- [[sensor]] — **Sensor**: Das Sinnesorgan einer Maschine — er macht aus einem Stück Welt eine Zahl.

## Erkennen, was von einer Maschine stammt

- [[falsch-negativ]] — **Falsch-Negativ**: Ein Alarm, der ausbleibt, obwohl etwas ist — hier: KI-Text, der durchgeht.
- [[falsch-positiv]] — **Falsch-Positiv**: Ein Alarm, der losgeht, obwohl nichts ist — hier: echter Text, als KI eingestuft.

## Sich in Behauptungen zurechtfinden

- [[desinformation]] — **Desinformation**: Etwas Falsches, das mit Absicht in Umlauf gebracht wird.
- [[kontextentzug]] — **Kontextentzug**: Ein wahrer Satz, aus dem herausgeschnitten, was ihn erklärt.
- [[malinformation]] — **Malinformation**: Etwas Wahres, das gezielt zum Schaden veröffentlicht wird.
- [[misinformation]] — **Misinformation**: Etwas Falsches, das ohne Absicht weitergegeben wird.
- [[quellenkritik]] — **Quellenkritik**: Nicht fragen, ob es stimmen könnte, sondern woher es kommt und wer etwas davon hat.

## Wie Lernen wirkt

- [[bestaetigungsfehler]] — **Bestätigungsfehler**: Die Neigung, das leichter zu glauben, was man ohnehin schon dachte.
- [[bloomsche-taxonomie]] — **Bloomsche Taxonomie**: Sechs Stufen des Könnens, von Wiedergeben bis Erschaffen.
- [[constructive-alignment]] — **Constructive Alignment**: Lernziel, Aufgabe und Prüfung müssen dasselbe meinen.
- [[overjustification-effekt]] — **Overjustification-Effekt**: Wenn Belohnung die Freude an einer Sache verdrängt, die vorher Spaß machte.
- [[selbstbestimmungstheorie]] — **Selbstbestimmungstheorie**: Was Menschen von innen antreibt: Autonomie, Kompetenz, Verbundenheit.
- [[testing-effekt]] — **Testing-Effekt**: Sich abfragen lassen bringt mehr als noch einmal lesen.
- [[spaced-repetition]] — **Verteiltes Wiederholen**: Mit wachsendem Abstand wiederholen, statt am Stück zu pauken.

## Sprache dieser Academy

- [[dialektik]] — **Dialektik**: Ein Gedanke, sein Gegengedanke, und was aus beiden wird.
- [[okf]] — **OKF (Open Knowledge Format)**: Das Format, in dem dieser Wissensspeicher abgelegt ist — lesbar für Mensch und Maschine.
- [[stufe]] — **Stufe**: Einer der sechs Abschnitte des Hauptwegs — von Entdecker bis Meister.
- [[talent]] — **Talent**: Die Recheneinheit der Academy — ein Talent ist ein Token.
- [[tokenicer]] — **Tokenicer**: Das Werkzeug der Academy, das zeigt, wie ein Modell einen Text zerlegt.

---

567 Begriffe. Der Bestand wächst mit dem Stoff: Was in einer Lektion erklärt werden muss, gehört hierher.
