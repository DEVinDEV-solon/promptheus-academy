---
type: reference
title: "Netzwerk-Vorplan — Creator, Motivations-Engine, Community-SecondBrain"
description: "Vorplan für die Evolution von PROMPTHEUS von der lokalen Einzel-Academy zur lokal-vernetzten Lern-Community mit Creator-Funktionen, verhaltensbasierter Kurs-Generierung und zentralem SecondBrain auf einem VPS."
tags: [reference, prometheus, netzwerk, creator, community, vps, datenschutz]
timestamp: 2026-08-20T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stand: vorplan
status: zur-pruefung
---

# Netzwerk-Vorplan — PROMPTHEUS von lokal zu vernetzt

> Dieser Vorplan zeigt, **ob und wie** wir PROMPTHEUS von der lokalen Einzel-Academy
> zu einer Gemeinde erweitern, ohne die nicht verhandelbaren Grundsätze aus
> `PLAN.md` anzutasten. Er ist ein **Vorplan zur Prüfung** — kein
> Implementierungsauftrag. Solon prüft, ob die Stoßrichtung stimmt; erst dann
> wird daraus schrittweise gebaut.

---

## 1. Worum es geht — das übergeordnete Bild

PROMPTHEUS soll vom Werkzeug, das **einem** Lernenden vor Ort dient, zu einer
**plattform-übergreifenden, sich selbst erweiternden Lern-Gemeinde** werden.
Drei Kräfte wirken zusammen:

1. **Kreator** — der Lernende baut sein eigenes Programm und erlebt, wie die
   Academy **mit seinem Wissen mitwächst**.
2. **Entdecker** — aus dem eigenen Verhalten (Kursstände + Tutor-Chat) erkennt
   die Academy Interessen und Schwächen und bietet **mit einem Klick** einen
   passenden Kurs an — mit alters- und berufsangemessener Motivation.
3. **Gemeinde** — mit Freigabe des Users fließen Inhalte anonymisiert in einen
   **zentralen Wissenspool** auf einem VPS; daraus profitieren andere User an
   anderen Schulen. Das schafft Abo-Bindung **und** ein wachsendes Netzwerk.

**Leitprinzip für alles Weitere:** *Lokal bleibt alles beim User. Zentral geht
nur, was der User ausdrücklich freigibt — gereinigt von Personenbezug.*

---

## 2. Architektur-Linie: lokal ↔ zentral

```
┌──────────────────────────  LOKAL (beim User)  ──────────────────────────┐
│  PROMPTHEUS-App  (PHP 8, 127.0.0.1, wie heute)                          │
│   ├─ Lernen / Aufgaben / Prüfung / Gamification   (deterministisch)     │
│   ├─ 4 Tutor-Agenten  (Prometheus · Athena · Hermes · Hephaistos)       │
│   ├─ [NEU] Creator-Engine     → User baut eigene Kurse/Bausteine        │
│   ├─ [NEU] Knowledge-Detektor → Interessen/Schwächen → One-Click-Kurs   │
│   └─ Second Brain = eigener OKF-Vault (`secondbrain/`)                  │
│        = die Erweiterungs-Schnittstelle des Programms                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  Sync (VPS-Bridge) — NUR mit Freigabe
                                │  pseudonymisiert, bereinigt, geloggt
┌───────────────────────────────▼─────────────────────────────────────────┐
│  ZENTRAL (VPS, ein Klick Anbindung)                                     │
│   ├─ Community-SecondBrain  = zentraler OKF-Pool (Prompts, Aufgaben,    │
│   │                          Übungsbeispiele, Antwort-Bausteine)        │
│   ├─ Bibliothekar-LLM (günstig) → räumt auf: taggt, entdoppelt,         │
│   │                          kuratiert, kategorisiert                   │
│   ├─ Vernetzungs-/Download-Dienst → User sehen Auswahl, laden Bausteine │
│   └─ Consent- & Audit-Dienst → jede Freigabe/Download append-only        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Kernentscheidung:** Der bestehende Grundsatz *„Die Datenbank ist ein Index,
nicht der Lehrstoff"* wird auf das Netzwerk übertragen. Der VPS ist **kein
Bewertungs- und kein Personen-Dienst**, sondern ein **Inhalts- und
Vernetzungs-Dienst**. Personenbezug verlässt den lokalen Rechner prinzipiell
nie; der VPS verwaltet nur Wissensbausteine.

---

## 3. Baustein A — Creator-Engine (das Programm wächst mit)

**Ziel:** Der Lernende (oder eine Schule) erstellt eigene Kurse direkt in der
Academy, sodass sich der eigene Second Brain stetig erweitert.

- Das Programm hat das **Creator-Prinzip bereits verinnerlicht**: *„Ein neuer
  Kurs ist eine neue Datei, kein Codeeingriff."* Wir machen daraus einen
  sichtbaren **Creator-Modus** in der App (neben Lernen / Tutor / Bibliothek).
- Der Creator baut auf **OKF-Vorlagen** (`_templates/`) auf: ein Kurskopf +
  Lektionen mit Aufgabenblöcken + Prüfung als **generierte Markdown-Dateien**.
- **Validierung vor Veröffentlichung im eigenen Vault:** dieselbe Prüfung wie
  `kurse_test.php` — ein Kurs gilt nur dann als „erstellt", wenn Frontmatter,
  alle Aufgaben und die Bewertung grün durchlaufen. Kein „halbgarer" Kurs.
- **Wiederverwendung:** Der Creator zieht Bausteine aus dem eigenen Second
  Brain und aus geernteten Quellen (`90_Quellen/`) — das eigene Wissen wird
  zum Fundament neuer Kurse. So *wächst* das Programm, weil es auf dem
  mitwachsen kann, was der User schon hat.

---

## 4. Baustein B — Knowledge-Detektor & One-Click-Kurs

**Ziel:** Aus dem Verhalten des Users Schwächen und Interessen erkennen und
ihm **suggestiv** einen passenden Kurs anbieten, den er **mit einem Klick**
erstellt — inklusive angepasster Motivation.

### 4.1 Verhaltens-Signale (nur lokal, nur pseudonymisiert)
Die Daten liegen **schon heute** in der lokalen SQLite (`versuche`,
`fortschritt`, `streak`, `pruefungen`) und im Tutor-Chat.

- **Schwäche** → Aufgabentyp mit niedriger Trefferquote, genutzte Hinweise,
  lange Bearbeitungszeit, wiederholte Fehlversuche in einem Gebiet.
- **Interesse** → hohes Engagement in einer Domäne, häufige Chat-Themen,
  wiederkehrende Tags, hoher Streak in einem Bereich.
- Auswertung **deterministisch** (wie Punkte und Badges): kein Modell bewertet
  den Lernenden; das Modell nur formuliert den Vorschlag.

### 4.2 Suggestive Fragen & One-Click-Erstellung
- Der Detektor erzeugt eine **unaufdringliche Suggestivfrage**, z. B.:
  *„Du hängst oft bei Rechen-Aufgaben. Willst du einen Minikurs
  »Rechnen im Beruf« — ein Klick und er ist da?"*
- **Ein Klick** → Creator-Engine rendert aus der Detektor-Ausgabe einen
  OKF-Kurskopf + 5–8 Aufgaben + Prüfung **lokal** in `secondbrain/10_Stufen/`
  bzw. einer `Kurs_Eigene/`-Ablage. Sofort spielbar.

### 4.3 Alters-, Stufen- und berufsangepasste Motivation
„Angemessen" heißt: **die Methode passt zur Zielgruppe**.
- Nach **Alter / Stufe**: Entdecker-Stufe spielerisch, höhere Stufen
  anspruchsvoll — Abstimmung anhand der bestehenden Stufenlogik (1–6).
- Nach **Berufsfeld** (DOM-*): Wir gehen bewusst in **Berufssparten, deren
  Tagesabläufe durch Automationen ersetzt werden**. Dazu bauen wir
  **praktische Übungsprompts** — der User probiert die Automationslösung
  seines Berufs **spielerisch** aus (z. B. über den bereits vorhandenen
  Tokenicer-Playground), statt sie nur zu lesen.
- Diese Praxisbeispiele werden **individuell gespeichert** und — nach Freigabe —
  als Bausteine in die Gemeinde gespeist (siehe Baustein C).

---

## 5. Baustein C — Community-SecondBrain auf dem VPS

**Ziel:** ein zentrales, wachsendes Wissensnetzwerk, von dem alle User
profitieren.

- **One-Click-VPS-Anbindung** (Opt-in): Der User verbindet seine lokale Academy mit
  dem zentralen Dienst. Ohne Klick bleibt alles rein lokal — PROMPTHEUS bleibt
  voll benutzbar (bestehender Grundsatz bleibt).
- **Community-SecondBrain** = zentraler OKF-Pool: Prompts, Aufgaben, praktische
  Übungsbeispiele, gelöste Antwort-Bausteine (ohne Personenbezug).
- **Bibliothekar-LLM (günstiges Modell)** räumt die Bibliothek auf: taggt,
  entdoppelt, kategorisiert, markiert Qualität — die Rolle von „Hermes" wird
  im Netzwerk zum Community-Bibliothekar.
- **Vernetzung & Download:** User sehen, wie Bausteine **miteinander vernetzt**
  sind, wählen aus und **laden sie in ihren eigenen Kurs** (Import in den
  lokalen Vault via Creator-Engine / Freigabe-Pfad).
- **Anreiz-Schleife:** einreichen → Bibliothekar kuratiert → Gemeinde nutzt →
  Ansehen/Reputation → stärkere Bindung und Abo-Grundlage.

---

## 6. Baustein D — Lern-Muster aus der Open-Welt (übernommen, NICHT importiert)

Aus der GitHub-Analyse (OATutor, eduadapt-ai, OpenTutor, LeetNode, FSRS/Anki)
ergibt sich die Linie: **kein System wird importiert; bewährte Algorithmus- und
Didaktik-Prinzipien werden als deterministischer PHP-Code selbst implementiert.**
Importiert wird nur, was als *Prinzip* passt und die bestehende Architektur
nicht verbiegt. Zwei Muster lohnen sich konkret.

### 6.1 Muster 1 — FSRS-Wiederholungs-Timing

**Woher:** FSRS (offen, MIT) verbessert das alte SM-2 dadurch, dass es pro
Wissensteil eine Gedächtnis-Kurve führt und den nächsten Wiederhol-Zeitpunkt
aus **Lernverlauf + Ziel-Abrufe** vorhersagt. Das „richtige Timing" gegen
Vergessen ist der Kern von „Lernen bleibt spannend".

**Für PROMPTHEUS (deterministisch, ohne Cloud):**
- Ersetzt nicht die Punkte-/Badges-Engine, sondern **ergänzt** `srv/motivation.php`
  um eine `wiederholung`-Routine: pro Aufgabe ein Abrufdatum, berechnet aus
  (a) bisherigen Versuchsergebnissen, (b) gewünschtem Erhaltungs-Ziel.
- Einfache, **reproduzierbare Formel**: nach richtiger Antwort Intervall
  verlängern (z. B. 1 Tag → 3 → 7 → 14 → Streak-log), nach falscher Antwort
  zurücksetzen. Das ist die SM-2-ähnliche Kernidee, umgesetzt in PHP, ohne
  fremde Bibliothek, ohne Netz.
- **Kein ML-Neugewicht nötig:** FSRS' voller Parameter-Profit braucht
  Laufzeit-Daten. Für die erste Stufe reicht eine feste, testbare
  Intervallkurve in `srv/wiederholung.php` — **deterministisch, testbar** wie
  Punkte/Badges. Die volle FSRS-Optimierung ist eine spätere Option, nie
  Pflicht-Erweiterung.

### 6.2 Muster 2 — Beherrschungs-Tracing (Schwächen intra wiederfinden)

**Woher kommt es:** OATutor nutzt Mastery-Tracing (Verfolgen des
Können-Grads pro Skill), um vorherzusagen, wo ein Lernender hängt, statt
nur den letzten Klick zu betrachten.

**Für unseren Detektor (deterministisch):**
- Pro **Fertigkeit** (Aufgabentyp / Kursgebiet) ein deterministischer
  Beherrschungs-Wert, nur aus `versuche` + `fortschritt` + `pruefungen`
  gerechnet (Trefferquote, genutzte Hinweise, Zeit, Wiederholfehler).
- Ein niedriger Mastery-Wert = Signal „Schwäche". Mehrere zusammen liefern
  die **Suggestivfrage**: „Du hängst bei X und Y — Minikurs zu Z?"
- **Ergänzt** die Interessen-Seite (hohes Engagement, Streak, Tags) zu einem
  vollen Bild → **One-Click-Kurs** (§4).
- **Deterministisch, kein Modell:** Das Modell formuliert höchstens den
  bedienten Lehrtext; der Erkenntnisblock bleibt reine Funktion der Daten —
  damit bleibt Urkunde/Beurteilung nachrechenbar (§1-Grundsatz).

### Fazit Muster
Wir übernehmen **Prinzipien** (Timing-gegen-Vergessen, Mastery-Schwächen-
Erkennung), aber **kein einziges fremdes System**, keinen fremden Code, keinen
fremden Stack. Alles, was PROMPTHEUS kann, bleibt mit seinem Determinismus,
seiner Sperrliste und seinem 127.0.0.1-Ortsprinzip kompatibel. Die zwei
Routinen entstehen als eigene PHP-Module mit eigenem Test. So wächst das
Programm mit Lernstand und Mitteln des Users — ohne „Durcheinander".

---

## 7. Datenschutz / Verschleierung / Audit-Trail — Pflicht-Block

Weil PROMPTHEUS auch **Minderjährige** erreicht, gilt hier die strengste
Stufe. Die bestehenden Regeln aus `PLAN.md` (§1, §9) werden auf die
Netzwerk-Ebene **hochgezogen**, nicht gelockert.

1. **Lokal-first, Opt-in:** Ohne explizite Freigabe verlässt **nichts** den
   Rechner. Der VPS-Pool enthält nur freigegebene Bausteine.
2. **Pseudonymisierung vor Upload:** Inhalte werden vor dem Senden von
   Personenbezug bereinigt — keine Namen, keine Lernstände, kein Chat-Rohtext,
   keine Kennungen. Der bestehende Satz *„keine Klarnamen und keine Lernstände
   in Git-Commits"* gilt wortgleich für die Sync-Ebene.
3. **Sperrliste gewinnt immer:** `data`, `80_PRIVAT`, `.env*`, `*.db`,
   `.obsidian`, `**/versuche` dürfen **nie** in den Pool. Die bekannte
   Sperrlisten-Logik aus `setup/ernte.php` wird für den Upload wiederverwendet;
   ein Test prüft, dass die Sperrliste gegen die Freigabe gewinnt.
4. **Consent-Verwaltung:** Jede Freigabe ist einzeln, verständlich und
   **protokolliert** — mit Datum, Umfang (welcher Baustein), Hash und
   **Widerrufsmöglichkeit**. Ein Widerruf entfernt den Baustein aus der
   Pool-Auslieferung.
5. **Audit-Trail (append-only, Hash-Kette):** Jede Freigabe, jeder Upload,
   jeder Download wird in einem append-only Log mit verketteten Prüfsummen
   festgehalten (Muster wie im DSGVO-/Audit-Modul). Nachträgliches Ändern oder
   Löschen eines Log-Eintrags wäre nachweisbar.
6. **Keine Telemetrie für Minderjährige:** Wie heute keine externen
   Schreibe/Cookies/Telemetrie; die VPS-Anbindung ist ein **reiner
   Inhalts- und Ein/Aus-Dienst**, kein Tracking.

---

## 8. Phasen (Vorplan-Stufen, je eigene Runde)

| Phase | Inhalt | Netz nötig? |
|---|---|---|
| P1 | **Creator-Engine lokal** — Creator-Modus, Vorlagen, Validierung, eigener Vault-Bereich | nein |
| P2 | **Knowledge-Detektor lokal** — deterministische Schwächen/Interessen-Analyse + One-Click-Kurs + Motivations-Anpassung | nein |
| P3 | **VPS-Bridge-Kern** — Export-Filter, Pseudonymisierung, Consent, Audit-Log, Sperrliste-Tests | ja (VPS) |
| P4 | **Community-SecondBrain auf VPS** — zentraler Pool, Upload eines freigegebenen Bausteins | ja (VPS) |
| P5 | **Bibliothekar-LLM** — Kuratierung/Tagging/Dedupe | ja (VPS) |
| P6 | **Vernetzung & Download** — Netzwerk-Ansicht, Baustein-Import in lokalen Kurs, Reputation | ja (VPS) |
| P7 | **Mehrere Schulen / Anbindungen** — Skalierung des Netzwerks, Community-Regeln | ja (VPS) |

P1 und P2 sind **rein lokal** und sofort baubar, ohne VPS. P3–P7 brauchen den
Zentral-Dienst und bauen aufeinander auf.

---

## 9. Noch zu entscheiden (vor dem Bau)

1. **Sync-Format:** Übertragen wir OKF-Notizen 1:1 (nur „Gut-Typen" ohne
   Personenbezug) oder ein eigenes schlankes Baustein-Format für den Pool?
2. **Bibliothekar-Modell:** Welches günstige Modell läuft auf dem VPS als
   Community-Bibliothekar? (Technisch ähnlich zu `srv/tutor.php`, aber ohne
   Bewertungskompetenz.)
3. **Reputation/Anreiz:** Wie sichtbar ist der Beitrag einzelner User im Pool,
   ohne dass es zum Personen-/Leistungsverzeichnis wird (Minderjährige)?
4. **Widerruf bei Verbreitung:** Ein bereits von anderen heruntergeladener
   Baustein kann nicht „zurückgeholt" werden — nur die künftige Auslieferung
   stoppen. Das muss der Consent-Text klar sagen.

---

## 10. Was dieser Vorplan NICHT ist

- kein Implementierungsauftrag — er prüft die **Richtung**;
- keine Lockerung des Datenschutzes — die Grenzen aus `PLAN.md` bleiben;
- kein Ersatz der bestehenden deterministischen Bewertung — das Modell
  formuliert Vorschläge, bewertet keine Leistung.

> Nächster Schritt nach Solons Prüfung: P1 (Creator-Engine lokal) als erste
> eigene Runde planen, sobald dieser Vorplan freigegeben ist.
