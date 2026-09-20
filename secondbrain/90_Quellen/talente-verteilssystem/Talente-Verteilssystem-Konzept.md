---
type: plan
title: "KONZEPT — Talente-Verteilungs- & Belohnungssystem (Netzwerk)"
description: "Gesamtkonzept des Talent-basierten Belohnungs- und Verteilungsnetzwerks der PROMPTHEUS Academy: Grundgedanke (Anreiz + Verteilautomatik statt Token-Verfall), Bewertungssystem über Likes, prozentuale Top-Honorierung nach Schülerzahl, Anteile (Eltern/Lehrer 70/30, Verwaltung behält 10 %, eigener Netzwerkanteil), vollautomatische Verteilung beim Trigger, Code-Generator & Verwaltungs-Dashboard. Dient als technische Arbeitsgrundlage für die Umsetzung."
tags:
  - plan
  - PROMPTHEUS
  - talente
  - token
  - verteilungssystem
  - belohnungssystem
  - netzwerk
  - community
  - automatisierung
  - bewertungssystem
  - gamification
timestamp: 2026-08-29T00:00:00+02:00
ampel: "🟡"
konfidenz: mittel
status: konzept
kontext: "[[Brainstorming-Onboarding-Dashboard-Netzwerk-Talente]]"
---

# KONZEPT — Talente-Verteilungs- & Belohnungssystem der PROMPTHEUS Academy

> **Zweck:** Eigenständiges Gesamtkonzept, das den **Grundgedanken** hinter dem
> Talente-System und **alle Feinheiten** bündelt — als technische
> Arbeitsgrundlage, damit aus dem Konzept eine **vollautomatische Verteilung**
> werden kann. Baut auf dem Onboarding-/Netzwerk-Brainstorming auf
> ([[Brainstorming-Onboarding-Dashboard-Netzwerk-Talente]]) und greift das
> Token-/Verfall-Thema ([[90_Quellen/agb-token-verfall-recherche]]) auf.

---

## 1. Grundgedanke (Warum Talente?)

Das Netzwerk lebt vom **Teilen funktionaler Produktionen** (Workflows, Plugins,
Skills, Templates, Guidelines, System-Prompts). Talente sind das **gegenseitige
Belohnungssystem**, das dieses Teilen anreizt:

- **Wertschöpfung durch Teilen:** Wer ein funktionierendes Produkt für die
  Community erstellt und zur Verfügung stellt, möchte **gute Arbeit honoriert**
  sehen.
- **Nicht gierig, sondern fair:** Wer teilt, hat per se **keinen Anspruch** auf
  Talente. Talente entstehen daraus, dass **andere** die Arbeit nutzen und
  **bewerten**.
- **Selbstverbessernder Kreislauf:** Je mehr funktionierende Produktionen
  geteilt und & geliked werden, desto besser wird die Bibliothek — desto mehr
  profitieren Schüler, Lehrer, Schulen. Die Verteilung eskalierbar nach
  Netzwerkgröße.
- **Juristisch sauber statt Verfall:** Gekaufte Token dürfen **nicht einfach
  verfallen** (Verbraucher-/AGB-Recht). Lösung: **kein Verfall, sondern
  automatische Umverteilung.** Das vermeidet Rechtsrisiko und hält das Guthaben
  im Umlauf (→ Wertfluss, Marketing- und Rechtsvorteil).

> **Leitprinzip:** *Verteilung statt Verfall — Belohnung statt Bitte.*

---

## 2. Woher kommen die Token (Topf)?

1. **Verwaltung kauft Token** (i. d. R. höherer Betrag, da sie zentrale
   Verteilinstanz ist).
2. **Eltern/Lehrer kaufen Token** (optional) und geben sie weiter.
3. **Code-Generator:** Lehrer/Eltern generieren einen **Einlöse-Code**, über den
   z. B. ein Kind **sofort Guthaben (Talente)** erhält (Anreiz für den
   KI-Unterricht: „Hier ist ein Code — du bekommst direkt Guthaben.").
4. **Direktförderung durch die Verwaltung** für einzelne Schüler.

---

## 3. Verteilungs-Modell im Überblick

**Grundregel (Eingrenzung): Die Verteilung bleibt je Schule.** Jede Schule, jede
Verwaltung, die nach einem Jahr automatisiert verteilt, hält den Anteil **bei den
Schülern ihrer eigenen Schule**. Keine Schüler anderer Schulen sind betroffen.
Damit das funktioniert, ist der Verteilmodus an die **Hash-Anmeldung** gekoppelt
(siehe § 3.4): Auf der Community wird klar unterschieden, **welcher Schüler zu
welcher Schule gehört**.

### 3.1 Prozent-Aufteilung (fixiert, bezogen aufs Ganze)

Die Aufteilung ist **final fixiert** (bezogen auf den Gesamttopf = 100 %):

- **Verwaltung:** **10 %** (bleibt, verfällt nicht).
- **Community (Netzwerk/VPS):** **50 %** → automatisch, separat online.
- **Intern (Eltern ↔ Lehrer):** **40 %** → davon **70 % = 28 % für Eltern**,
  **30 % = 12 % für Lehrer**.

> Kontrolle: 10 + 50 + 28 + 12 = **100 %** ✅
>
> Die zwei gesetzmäßigen Pfeiler: **(a) Community bekommt 50 %**, **(b) die
> verbleibenden 40 % laufen intern zu **70 % Eltern / 30 % Lehrer**.

### 3.2 Eltern/Lehrer intern: 70/30

- Der **verbleibende** interne Anteil wird zwischen **Lehrenden und Eltern**
  verteilt: **70 % → Eltern, 30 % → Lehrer.**
- (Schüler kommen darin nicht vor — sie laufen über Direktförderung.)

### 3.3 Netzwerk-/Community-Anteil: automatisch nach Umverteilungsfrist

- Mit **Einwilligung** (in den Einstellungen der Verwaltung aktiviert) läuft ein
  **Verteilmodus**.
- Die Verwaltung **behält 10 %** (diese verfallen nicht).
- **Spätestens nach 1 Jahr** (Umverteilungsfrist) geht der **festgelegte
  Community-Prozentsatz** (z. B. 50 % der 90 %) automatisiert **an das Netzwerk**.
- Trennung: Die interne 90-%-umverteilung (Eltern/Lehrer) läuft **lokal intern**;
  der **Community-Anteil wird „online" separat festgestellt** (geht auf den VPS /
  die Community).
- **Nur die Verwaltung** nutzt diesen Modus (nicht die Lehrer).

### 3.4 Hash-Anmeldung & Zuordnung zur Schule

- Der **Verteilmodus ist mit der Hash-Anmeldung verbunden**: Jeder Teilnehmer
  wird auf der **PROMPTHEUS Community** klar einer **Schule** zugeordnet.
- Der **installationsgenerierte Hash** (Schule + Benutzername codiert)
  ermöglicht diese Zuordnung automatisch — die Community weiß bei jedem
  Teilnehmer, **zu welcher Schule er gehört**.
- Dadurch bleibt die Verteilung **sauber pro Schule abgegrenzt** und vermischt
  nicht Anteile verschiedener Schulen.

### 3.5 „Talente" → Verteilmodus-Seite in den Einstellungen

- Neuer **Menülink** in den Einstellungen der Verwaltung, z. B. **„Talente" →
  „Verteilmodus"** („Verteiler" / „Talente" als Alternativen).
- Dahinter eine **eigene Seite**, die **klar beschreibt**:
  - was genau passiert (Verteilung statt Verfall, nach einem Jahr),
  - **an wen** genau geht (Verwaltung 10 % behalten · Community-Anteil ·
    Eltern/Lehrer 70/30),
  - der **Hintergrund** (Belohnungssystem, GJ, juristisch sauberer Weg),
  - **dass nur unter den Schülern der eigenen Schule verteilt wird** und
    **keine Schüler anderer Schulen** betroffen sind.

---

## 4. Bewertungssystem (Wer bekommt Talente?)

### 4.1 Likes als Verteil-Richter & Community-Zustimmung

- Unter jedem geteilten Projekt steht ein **Kommentar-/Bewertungsbereich**.
- Andere Nutzer **testen** und **liken** funktionierende Produktionen.
- Die **Likes erzeugen eine Bestenliste** — das ist die Grundlage der Verteilung
  (wer gute Sachen gemacht hat, wird automatisch honoriert). Die Likes sind also
  das Maß der **Zustimmung der Community**.

### 4.2 Prozentuale Honorierung nach Schülerzahl (10 %-Orientierung)

Die Zahl der belohnten Produzenten skaliert mit der **Schülerzahl der je-weiligen
Schule** (Verteilung bleibt pro Schule):

| Netzwerk | Schüler (Beispiel) | Belohnte (10 %) |
|---|---|---|
| 1 Schule | ~300 | **Top 30** |
| 2 Schulen | je ~300 → deutet auf je Top 30 pro Schule | pro Schule **~10 %** |

- Universeller Grundsatz: **~10 % der aktiven Produzenten/Schüler der Schule**
  werden honoriert.
- Einstellbarer Modus (siehe Dashboard): Top 10 / 20 / 30 / 40 / 50 — die
  Verwaltung stellt den Wert je nach Schülerzahl ihrer Schule selbst ein.
- Die Top 10 / 20 / 30 werden mit diesem Modus **unterschiedlich honoriert**
  (abhängig von den Likes).

### 4.3 Gewichtung: fair über 100 % (z. B. 60 / 30 / 10)

Der komplette Community-Anteil (100 % davon) wird **gerecht** verteilt — nach
Rang gestuft, ohne dass jemand auf den hinteren Plätzen leer ausgeht:

- **Beispiel (Dreier-Stufe):** die **ersten 10** bekommen **60 %**, die **nächsten
  → 30 %**, die **darauffolgenden → 10 %**.
- Gestaffelt proBündel, sodass **die Summe der Anteile exakt 100 %** des
  Verteil-Topfes ergibt.
- Genauer Schlüssel (wie viel Prozent je Bündel) ist noch **offen/einstellbar**
  (§ 7) — das Prinzip ist fest: **oben mehr, unten nicht leer, Ende bei genau
  100 %.**

---

## 5. Vollautomatische Verteilung (der „Kick")

### 5.1 Ablauf pro Schule

Die Verteilung läuft **je Schule** ab (nicht netzwerkweit vermischt). Es gibt
einen **Trigger (Tag / Kick-Zeitpunkt)**, der die Verteilung auslöst. Ab dem
Moment läuft alles **vollautomatisch und sofort**, **ohne manuelle Überlegung**:

1. Umverteilungsfrist abgelaufen (z. B. Jahresfrist),
2. **10 %-Rücklage** der Verwaltung abgezogen (verfällt nicht),
3. **50 % Community-Anteil** separat online festgestellt (VPS) + **40 % intern**
   getrennt zu **70/30 Eltern/Lehrer**,
4. **Zuordnung zur Schule** über den **Hash** geprüft (jeder Teilnehmer gehört
   klar zu seiner Schule),
5. **Likes → Bestenliste** erzeugt (Zustimmung der Community),
6. **Top-10-%-Anteil** (einstellbar) der Schule gewählt,
7. Token **proportional nach Rang** verteilt (100 % fair, z. B. 60/30/10),
8. Empfänger sehen **Talente-Guthaben** in ihrem Talentekonto (lokal + Netzwerk
   synchronisiert).

> **Zielbild:** *„Kein Nachdenken — sobald der Kick da ist, ist verteilt."* Und
> es bleibt **pro Schule**: Die Anteile der Verwaltung kommen ausschließlich
> **den Schülern der eigenen Schule** zugute.

### 5.2 Community: Einstellungsbereich mit Talente-Übersicht & Transfer

Nach der Anmeldung gibt es auf der Community einen **Einstellungsbereich**:

- **Übersicht mit Gauge/Chart:** Jeder Schüler **sieht**, wie viele **Talente** er
  bekommen hat (z. B. als Anzeige/Grafik).
- **Liste/Tabelle darunter:** **woher, wann, wie, weswegen** — welches Produkt,
  das er geschaffen hat, die **meiste Bewertung** bekommen hat und deswegen die
  **meisten Talente**. Eine schöne **Statistik**, damit jeder weiß, **warum,
  weshalb, woher und wann**.
- **Button „Transfer" (= Gutschrift):** Da die **Token dort nichts nützen**,
  müssen sie **zurückgespielt** werden — **über den Hash gesichert** — **zurück
  dorthin, woher sie kamen** (in die lokal installierte Software des Schülers).
  - Die **Gutschrift wird registriert** und der Community-Stand **genullt**
    (Entweder alles oder nichts).
  - Der **Transfer-Button hat eine Aufforderung:** „Nun werden die Talente auf deine
    eigene, installierte Software, woher sie kamen, zurückgespielt und
    gutgeschrieben."
  - Danach ist die **Gutschrift auch lokal bei ihm sichtbar** (Talentekonto).

### 5.3 Zentrale Protokollierung & Talente-Übersicht in der Verwaltung (VPS)

- **Parallel** muss die Verwaltung **denselben Überblick** haben:
  - **wann** welche Token/Talente **von wem an wen** vergeben wurden,
  - und der **Transfer zurück** (Gutschrift) entsprechend protokolliert sein.
- Die Verwaltung braucht **eine konkrete Übersicht im Tokenbereich des VPS**, in
  der **auch die Talente noch einmal strukturiert dargestellt** werden — um die
  **Protokolle korrekt weiterzuführen** und den Überblick zu bewahren.
- Die **Gutschrift der Talente/Token hängt vom VPS-Server (Zentrale) ab** — dort
  führen wir die Verwaltung **korrekt und protokolliert**, weil
  **es im Kern um Geld geht.**

### 5.4 Transfer-Absicherung: kryptographischer Schlüssel & Key-Rotation

Der **Transfer (Gutschrift zurück zum lokalen Hash)** wird zusätzlich
**kryptographisch abgesichert**, damit bei einer **Kompromittierung** niemand
Token abziehen kann (z. B. jemand setzt einen Agenten auf die lokal installierte
Software, um zu betrügen):

- **Generierung wie API-Keys:** In unserer Verwaltung läuft ein **spezieller,
  kryptologisch verschlüsselter Generator** (analog zur Generierung von **API
  Keys**: **relativ lang, sicher**). Erzeugt werden lange, sichere
  Schlüssel/Secrets.
- **Automatischer Tausch bei Kompromittierung:** Sobald ein Verdacht/eine
  Kompromittierung vorliegt, werden die Schlüssel **automatisch getauscht**
  („bei Kompromittierung automatisch tauschen").
- **Automatische Key-Rotation (Hash/Key):** Wir können unseren **Hash bzw. Key
  automatisch rotieren** lassen. Rotieren wir etwa unseren **PrivatKey**, ist
  **sichergestellt**, dass:
  - Token bei einer kompromittierten Community **nicht abgezogen** werden können
    (kein Missbrauch durch Dritte oder durch manipulierte lokale Software),
  - Betrug über die lokale Instanz (Agent auf der eigenen Software) verhindert
    wird.
- **Haupt-PrivatKey als Schutzanker:** Falls es doch einmal zu einer
  Kompromittierung kommt, sichert der **Transfer über unseren Haupt-PrivatKey** —
  beim Übertrag zurück an denjenigen, **von dem die Token stammen / der in die
  Community eingetreten ist** — die Integrität. Die Gutschrift ist damit an uns
  (Zentrale) und unseren Haupt-PrivatKey gebunden.

> **Einordnung (offen, handwerklich):** Wie die Rotation technisch mit dem Hash
> auf den **installierten Versionen** läuft, ist hier noch **nicht spezifiziert**
> (diese Frage bleibt für die technische Umsetzung). Ziel ist ausschließlich, den
> **Transfer abzusichern** — Hash/Key rotieren, damit ein kompromittierter
> Community-Zustand keine Token abziehen kann.

---

## 6. Technischer Arbeitsplan (für die Umsetzung)

### 6.1 Bausteine

| Baustein | Funktion |
|---|---|
| `token-topf` | Verwaltung des Gesamttopfes + Rücklagen |
| `verteil-trigger` | Jahres-/Zeitpunkt-Trigger, löst Verteilung aus |
| `likes-bestenliste` | Ranking aus Likes (Bestenliste, alle Bereiche) |
| `verteil-logik` | Top-10-%-Selektion + proporale Rang-Gewichtung |
| `netzwerk-abrechnung` | separater, online festgestellter Netzwerkanteil (VPS) |
| `talentekonto` | Guthaben-Konto (lokal + Netzwerk-Sync) |
| `code-generator` | Einlöse-Codes (Lehrer/Eltern → Schüler) |
| `dashboard-konfig` | Einstellungen in der Verwaltung (Prozentsätze, Top-Zahl, Frist) |
| `schlüssel-rotation` | kryptologischer Generator + automatische Key-Rotation (API-Key-artig, Haupt-PrivatKey-Schutz für den Transfer) |

### 6.2 Verteil-Schritte im Detail (Pseudocode, pro Schule)

```
verteile_schule(Verwaltung, schule):
  Topf = verwaltung.Guthaben
  rücklage = Topf * 0.10              # Verwaltung behält 10 %, verfällt nicht
  community = Topf * 0.50             # Community-Anteil 50 % (separat online/VPS)
  intern   = Topf * 0.40              # intern 40 %, läuft 70/30 (Eltern/Lehrer)
  verteileIntern(intern, Eltern/Lehrer, 70/30)
  # Community-Anteil: pro Schule, an eigene Schüler, über Likes-Ranking:
  verteileCommunity(community, schule):
    teile = alle_schueler(schule)          # nur diese Schule via Hash
    liste = bestliste_aus_likes(teile)     # Zustimmung der Community
    n     = max(10%, topZahlEinstellung)   # Top 10/20/.../50
    gewicht = rang_gewichtung(n)           # 100 % fair (z. B. 60/30/10)
    gutschreiben(liste[:n], gewicht)
```

### 6.3 Automatisierung & Skalierung

- **Selbstheilung/Skalierung:** Mit mehr Schulen wächst die Schülerzahl → die
  belohnte Menge (10 %) wächst automatisch mit; der Modus ist im
  **Verwaltungs-Dashboard** hinterlegt und einstellbar.
- Kein manueller Eingriff zur Laufzeit (außer Konfiguration).

---

## 7. Verknüpfungen & offene Punkte

- **Recht:** Verfall-Thematik rechtssicher (siehe `agb-token-verfall-recherche.md`
  für den Anwalt). Das Konzept vermeidet Verfall durch Umverteilung → rechtlich
  + strategisch sauber.
- **Architektur:** Netzwerk-Anteil + VPS-Anbindung muss getrennt vom lokalen
  Verwaltungsbereich laufen (Sandbox, Hash-Login — siehe Onboarding-Brainstorming
  Abschnitte 11 & 15).
- **DSGVO/anonymisiert:** Community-Verteilung über anonymisierte Kontakte
  (kein Klarname bei Bewertung/Produktion ohne Einwilligung).

### Offene Fragen (zur Feinabstimmung)

- [x] **Community-Prozentsatz final:** **50 %** des Gesamtanteils (fixiert);
      intern 40 % (70/30 Eltern/Lehrer), Verwaltung 10 %.
      → **bestätigt von Solon am 05.09.2026** (Normalisierung der Voice auf
      10/50/40 → 70/30 Eltern/Lehrer ist verbindlich).
- [ ] Standard-**Top-Zahl** je Schule/Schülerzahl (10 %-Regel als Default — Modus
      einstellbar 10/20/30/40/50).
- [ ] **Rang-Gewichtung** final als 100-%-Schlüssel (z. B. 60/30/10 je Bündel;
      exakte Stufen sind noch offen/einstellbar).
- [ ] **Frist:** Jahresfrist festlegen (Umverteilungstag), Trigger definieren.
- [ ] **VPS-Talente-Übersicht** im Tokenbereich strukturiert umsetzen
      (für korrekte Protokollierung/Buchführung).
- [ ] **Transfer-Sicherheit:** kryptologischer Generator + automatische
      **Key-Rotation** (Haupt-PrivatKey-Schutz bei Kompromittierung) technisch
      detaillieren — inkl. Frage, wie die Rotation auf den installierten
      Versionen (Hash) praktisch läuft.
- [ ] Anwaltliche Freigabe der AGB-Fassung (Verfall→Umverteilung) einholen.

---

## 8. Nächste Schritte

1. **Prozentsätze final** (10 % Verwaltung · 50 % Community · 40 % intern 70/30).
2. Rang-Gewichtung (z. B. 60/30/10) quantifizieren.
3. Verteil-Trigger & Jahresfrist technisch fixieren.
4. **VPS-Talente-Übersicht** im Tokenbereich strukturiert aufbauen (Buchführung).
5. AGB-Fassung mit dem Advokaten abstimmen.
6. Umsetzung Baustein-für-Baustein (token-topf → verteil-logik → netzwerk-abrechnung → talente-übersicht).