---
type: lesson
title: "Tokens selbst zerlegen: der Tokenicer"
description: "Mit dem eingebauten Werkzeug nachmessen, was die vorige Lektion behauptet — und dabei sehen, warum ein Modell keine Buchstaben zählen kann."
tags:
  - lesson
  - stufe-1
  - tokens
  - werkzeug
timestamp: 2026-08-21T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 16
---

# Tokens selbst zerlegen

In der vorigen Lektion stand eine Behauptung: Deutsch braucht mehr Tokens als
Englisch. Behauptungen glaubt man in dieser Academy nicht — man misst sie nach.

Dafür gibt es oben im Menü den **Tokenicer**. Er zerlegt jeden Text, den du
eintippst, mit denselben Tabellen, die OpenAI benutzt. Nicht geschätzt,
nicht gerundet: dieselbe Rechnung, die auch im Rechenzentrum läuft — nur eben
auf diesem Rechner, und dein Text geht dabei nirgendwohin.

> Lass den Tokenicer in einem zweiten Fenster offen, während du diese Lektion
> liest. Alles hier ist zum Nachtippen gedacht.

## Was du siehst

Jeder farbige Block ist **ein Token**. Die Farben bedeuten nichts — sie
trennen nur, damit du die Grenzen erkennst. Wichtig sind drei Zahlen:

| Zahl | Was sie sagt |
|---|---|
| **Token** | in wie viele Stücke das Modell den Text zerlegt |
| Zeichen | wie viele Buchstaben, Ziffern und Leerzeichen du getippt hast |
| Zeichen je Token | wie „günstig" dein Text zerlegt wird — je höher, desto besser |

Bei englischem Fliesstext liegt der letzte Wert oft bei 4, bei deutschem
eher bei 2,5 bis 3. Genau darin steckt der ganze Preisunterschied.

## Der erste Versuch

Tippe die beiden Zeilen nacheinander ein, Modell **GPT-5.5**:

```
Künstliche Intelligenz
Artificial intelligence
```

Dasselbe gemeint, dieselbe Länge — und trotzdem: **6 Tokens gegen 2**. Du
siehst auch, warum: „Künstliche" zerfällt in `K` + `ünst` + `liche`. Das
Modell hat dieses Wort nie als Ganzes gelernt, weil in seinen Trainingsdaten
viel mehr Englisch stand als Deutsch.

```aufgabe
id: E1-15
typ: mathe
titel: "Nachmessen: ein deutsches Wortungetüm"
punkte: 25
frage: "Tippe im Tokenicer bei Modell GPT-5.5 das Wort »Wasserzeichenentfernung« ein — nur das Wort, ohne Leerzeichen davor. Wie viele Tokens sind es?"
loesung: 6
toleranz: 0
richtzeit_s: 90
hinweise:
  - text: "Der Tokenicer zeigt die Zahl oben links als grosse Zahl unter »Token«."
    kostet: 5
erklaerung: |
  Sechs: W | asser | zeichen | ent | fer | nung. Ein Wort, das ein Mensch in
  einem Stück liest, ist für das Modell ein Bauklotzhaufen. Das englische
  "watermark removal" braucht drei Tokens — bei doppelter Wortzahl.
quelle: "[[90_Quellen/wasserzeichen/wasserzeichen-entfernen-index]]"
```

## Warum ein Modell „Erdbeere" nicht buchstabieren kann

Tippe `Erdbeere` ein. Ergebnis: `E` | `rd` | `be` | `ere` — vier Tokens.

Und jetzt die entscheidende Frage: **Wie viele „e" stehen in „Erdbeere"?**

Du siehst es sofort, weil du Buchstaben siehst. Das Modell sieht sie nicht.
Es sieht vier Zahlen — etwa `36` `624` `1395` `9006`. In diesen Zahlen ist
nirgends vermerkt, wie viele „e" darin stecken. Wenn ein Modell die Frage
trotzdem richtig beantwortet, dann weil es solche Fragen samt Antwort im
Training gesehen hat, nicht weil es nachgezählt hätte.

Das ist die Erklärung für eine ganze Familie von Fehlern, über die im Netz
gelacht wird:

- Buchstaben zählen
- Wörter rückwärts schreiben
- reimen, wenn der Reim auf der Schreibweise beruht
- Silben trennen

Nichts davon ist „Dummheit". Es ist eine **Folge der Bauart**. Und du kannst
sie jetzt nachweisen, statt sie zu glauben.

```aufgabe
id: E1-16
typ: denkaufgabe
titel: "Was folgt aus der Tokenzerlegung?"
punkte: 30
frage: "Welche dieser Aussagen stimmen — nach dem, was du im Tokenicer siehst?"
mehrfach: true
optionen:
  - "Ein Token ist mal ein ganzes Wort, mal nur ein Wortstück."
  - "Ein Token ist immer genau eine Silbe."
  - "Derselbe Inhalt braucht auf Deutsch meist mehr Tokens als auf Englisch."
  - "Das Modell bekommt die einzelnen Buchstaben eines Wortes mitgeliefert."
  - "Ein Leerzeichen gehört oft zum folgenden Token dazu."
loesung:
  - "Ein Token ist mal ein ganzes Wort, mal nur ein Wortstück."
  - "Derselbe Inhalt braucht auf Deutsch meist mehr Tokens als auf Englisch."
  - "Ein Leerzeichen gehört oft zum folgenden Token dazu."
richtzeit_s: 120
hinweise:
  - text: "Sieh dir im Tokenicer an, wo genau ein Block anfängt: vor oder nach dem Leerzeichen?"
    kostet: 6
erklaerung: |
  Silben sind es nicht — die Grenzen entstehen aus Häufigkeit, nicht aus
  Aussprache. Und Buchstaben sieht das Modell nie: es bekommt Zahlen. Dass
  das Leerzeichen zum folgenden Token gehört, siehst du im Werkzeug daran,
  dass die Blöcke jeweils vor dem Wort beginnen.
```

## Der Vergleich, den du im Kopf behalten sollst

Miss selbst nach, Modell GPT-5.5:

| Text | Tokens |
|---|---|
| `street` | 1 |
| `Straße` | 2 |
| `The capital of France is Paris.` | 7 |
| `Die Hauptstadt von Frankreich ist Paris.` | 7 |

Der letzte Fall ist der interessante: **hier ist Deutsch gleich teuer.** Weil
„Hauptstadt" und „Frankreich" häufig genug vorkommen, um je ein Token zu
sein. Der Aufschlag auf Deutsch ist also keine Naturkonstante, sondern eine
Frage davon, wie oft die Wörter im Training vorkamen. Wähle im Tokenicer
einmal das ältere Modell **GPT-4 / 3.5** und tippe denselben Satz: dort sind
es 9 Tokens. Dasselbe Deutsch, ein älterer Zerleger, zwei Tokens mehr.

```aufgabe
id: E1-17
typ: uebereinstimmung
titel: "Vier Wörter, vier Zahlen"
punkte: 30
frage: "Miss jedes Wort einzeln im Tokenicer nach (Modell GPT-5.5) und ordne die Tokenzahl zu."
links: [street, Straße, Erdbeere, Donaudampfschifffahrtsgesellschaft]
rechts:
  - "1 Token"
  - "2 Tokens"
  - "4 Tokens"
  - "10 Tokens"
loesung:
  street: "1 Token"
  Straße: "2 Tokens"
  Erdbeere: "4 Tokens"
  Donaudampfschifffahrtsgesellschaft: "10 Tokens"
richtzeit_s: 180
hinweise:
  - text: "Tippe wirklich nur das eine Wort ein — ein Leerzeichen davor ändert die Zerlegung."
    kostet: 6
erklaerung: |
  Das lange Wort ist die Pointe: ein einziges deutsches Substantiv kostet so
  viel wie ein ganzer englischer Satz. Wer ein Kontextfenster füllt oder je
  1000 Tokens zahlt, merkt genau das.
```

## Was das für dein Prompten heisst

Vier Dinge, die ab hier gelten:

1. **Rechne nie Wörter in Tokens um, ohne nachzumessen.** „300 Tokens sind
   etwa 300 Wörter" stimmt im Englischen halbwegs und im Deutschen gar nicht.
2. **Bei knappem Kontextfenster ist Englisch sparsamer.** Wenn ein Modell viel
   Text auf einmal sehen muss, kann es sich lohnen, ihm den Text auf Englisch
   zu geben — auch wenn die Antwort deutsch sein soll.
3. **Englisch ist oft nicht nur kürzer, sondern auch treffsicherer.** Und das
   ist der wichtigere Grund. Die Modelle haben ungleich mehr Englisch gelesen
   als Deutsch — Fachbegriffe, Anweisungswörter wie *step by step* oder
   *return only valid JSON*, ganze Aufgabenmuster. Ein englischer Auftrag trifft
   deshalb häufiger das, was gemeint war, und wird seltener eigenwillig
   ausgelegt. Das hat mit Sparen nichts zu tun: Es wäre auch dann so, wenn
   Englisch mehr Tokens kostete.
4. **Frag ein Modell nichts, was Buchstaben zählt.** Dafür nimmt man ein
   Programm. Genau dafür gibt es den Tokenicer.

## Die Regel über allen vieren

**Es entscheidet das Endprodukt, nicht die Tokenzahl.**

Tokens sind der Preis, nicht das Ziel. Ein Auftrag, der dreissig Tokens spart
und eine unbrauchbare Antwort bringt, hat nichts gespart — du schreibst ihn ja
noch einmal, und dann kostet er das Doppelte. Umgekehrt ist ein längerer
Auftrag, der auf Anhieb das Richtige liefert, der billigere.

Also: Bringt Englisch das bessere Ergebnis, nimm Englisch — auch wenn es länger
wäre. Bringt Deutsch das bessere, nimm Deutsch — auch wenn es teurer ist. Das
ist keine Geschmacksfrage, und raten musst du auch nicht: Gib denselben Auftrag
einmal auf Deutsch und einmal auf Englisch und vergleiche, was zurückkommt.

Der Tokenicer sagt dir, was etwas **kostet**. Ob es etwas **taugt**, sagt dir
nur das Ergebnis. Beides zu messen ist die Arbeit; nur das Erste zu messen ist
der bequeme Fehler.

Der Tokenicer bleibt im Menü. Du wirst ihn in Stufe 2 wieder brauchen, wenn
es um Kosten je 1000 Tokens geht — und in Stufe 3, wenn ein Kontextfenster
zum ersten Mal zu klein ist.
