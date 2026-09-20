---
type: analysis
title: "Community-Software-Auswahl: KI-/Agenten-basiert, Apache-2.0, für PROMPTHEUS"
description: "Markterhebung moderner, frei nutzbarer Community-/Kollaborations-Software unter Apache-2.0-Lizenz als Fundament für die PROMPTHEUS Community. Prüft Zusammenspiel mit Agenten, Maschinenlesbarkeit (Markdown), Struktur & die Entscheidung Eigenbau vs. Übernahme — inkl. Liste mit Links, Lizenzen, Stärken/Schwächen und Empfehlung."
tags:
  - analyse
  - PROMPTHEUS
  - community
  - softwareauswahl
  - open-source
  - apache-2.0
  - agenten
  - markdown
  - second-brain
  - vps
timestamp: 2026-08-29T00:00:00+02:00
ampel: "🟡"
konfidenz: mittel
handverlesen: true
kontext: "[[Brainstorming-Onboarding-Dashboard-Netzwerk-Talente]]"
---

# Community-Software: Apache-2.0, KI-/Agenten-tauglich (für PROMPTHEUS)

> **Auftrag (Solon):** Entweder **von Grund auf selbst** bauen oder auf GitHub
> **moderne, KI-/Agenten-basierte Community-Software** finden. Muss in der
> Struktur **einfach** sein, unseren **Bedürfnissen genügen**, **frei verfügbar**
> und **nur unter Apache-2.0-Lizenz** (da **gewerbliche Nutzung**). Ziel: prüfen,
> ob ein **Zusammenspiel mit Agenten** möglich ist und ob wir **Teile oder alles**
> übernehmen — mit Anschluss an unser VPS-Verwaltungssystem.
>
> **Wichtig (Lizenz-Vorbehalt):** Diese Datei ist eine handverlesene
> Markterhebung, **keine Rechtsberatung.** Für die finale
> Lizenz-/Nutzungsprüfung (insb. gewerbliche Weitergabe, Copyleft,
> Zusatzbedingungen) ist der **Advokat** zu konsultieren, bevor Teile übernommen
> werden.

---

## 0. Zusammenfassung / Empfehlung (vorab)

- **Merktergebnis:** Zulip ist als **fertige, Apache-2.0-Community-Software** der
  stärkste Kandidat — **topic-basiertes Threading**, volle **Markdown**-
  Unterstützung, mächtige **REST-/Events-API** (ideal für Agenten), self-hosted.
  Es deckt Community-Basisfunktionen ab und zeigt, wie eine „moderne, simple,
  agentenfreundliche" Struktur aussieht.
- **ABER (Entscheidung von PROMPTHEUS):** Wir **installieren Zulip NICHT**. Gründe:
  (1) Zulip ist ein **Chat/Team-Comms-Tool**, **keine** fertige
  „PROMPTHEUS-Community" mit **Talente-/Token-Verteilung**, Likes-Ranking,
  Produkt-Bibliothek, Hash-Login, Verteilmodus — diese fachspezifischen Teile
  fehlen und müssten ergänzt werden; (2) Zulip/Stack wäre auf diesen knappen
  VPS-Ressourcen (1 Kern, ~1 GB frei) riskant.
- **Beschlossen:** **Kompletter Eigenbau von Grund auf.** Zulip dient **nur als
  Ideenquelle** — einzelne Features (Topic-Threads, Kanäle, Mentions, Reaktionen,
  Volltextsuche, Pinnen, Bots) übernehmen wir **leicht gewichtet** in unseren
  eigenen, schlanken, markdown-basierten Bau (siehe [[Community/Plan-Community]]).
- **Lizenz-Boden: Apache 2.0** bleibt unser Maßstab für genutzte Komponenten/
  Libraries (gewerblich ohne Copyleft), auch wenn wir keine fertige Plattform
  übernehmen.

---

## 1. Verglichene Software-Kandidaten (Liste mit Links & Lizenzen)

> Lizenzen sind **Stand der Recherche** und müssen vor Übernahme verifiziert
> werden. ⚠️ = nur eingeschränkt Apache-2.0-konform / abweichende Lizenz.

### 1.1 Direkt Apache 2.0 (rein gewerblich nutzbar)

| Produkt | Link | Lizenz | Kurzbeschreibung | Für uns? |
|---|---|---|---|---|
| **Zulip** | github.com/zulip/zulip | **Apache 2.0** ✅ | Topic-basiertes Team-Chat/Community, Markdown, REST + Events-API, self-hosted | ⭐ **höchste Trefferquote** |
| **Zulip (Docs)** | zulip.readthedocs.io | Apache 2.0 | API + App-Framework, Bots (Zulip bots = Agenten!) | ⭐ API für Agenten |

### 1.2 Apache-2.0-derivat (⚠️ Zusatzbedingungen, für gewerblich prüfen)

| Produkt | Link | Lizenz | Kurzbeschreibung | Für uns? |
|---|---|---|---|---|
| **Dify** | github.com/langgenius/dify | Dify Open Source License (basiert auf Apache 2.0 **mit Zusatzbedingungen**) ⚠️ | Agentic-Workflows, RAG, Kollaborations-Workspace | Agent-Engine, aber Lizenz-Zusatzbedingungen beachten |

### 1.3 MIT (frei, aber nicht Apache 2.0 — gewerblich ok, nur Lizenz anders als gefordert)

| Produkt | Link | Lizenz | Kurzbeschreibung | Für uns? |
|---|---|---|---|---|
| **Gitea** | github.com/go-gitea/gitea | MIT | Leichtgewichtige Git-Forge, Issues, Markdown, Agent-API | gut, aber MIT |
| **Forgejo** | forgejo.org | MIT | Community-Fork von Gitea | gut, aber MIT |
| **LibreChat** | librechat.ai | MIT | Open-Source-KI-Plattform (Chat, viele Modelle) | KI-Chat, MIT |
| **Rocket.Chat** | rocket.chat | MIT | Team-Chat-Plattform, self-hosted | Comms, MIT |
| **Mattermost** | mattermost.com | MIT | Slack-Alternative, self-hosted | Comms, MIT |

### 1.4 Copyleft (⚠️ NICHT gewerblich uneingeschränkt — aussortiert für unseren Zweck)

| Produkt | Link | Lizenz | Warum raus |
|---|---|---|---|
| **Discourse** | discourse.org | GPL/AGPL | Copyleft → Verpflichtung zur Quellcode-Freigabe |
| **Lemmy** | join-lemmy.org | AGPL | Copyleft, soziales Netz, kein Verteilmodus |
| **Mastodon** | joinmastodon.org | AGPL | Copyleft, fediverse |

> **Lesart:** Unter der geforderten **„nur Apache 2.0"**-Forderung bleibt als
> fertiges, modernes Community-Teilstück primär **Zulip**. KI-/Agent-Plattformen
> wie Dify/LibreChat/OpenWebUI sind meist MIT oder Derivat-Lizenzen.

---

## 2. KI-/Agenten-Zusammenspiel — Ist das möglich?

- **Ja, grundsätzlich** — die moderne Kommunikations- und Community-Software
  setzt fast durchgängig auf **offene REST-APIs + Webhooks + Markdown**, sodass
  ein **Agent** (z. B. ein PROMPTHEUS-Tutor oder unser Verwaltungs-Host)
  Nachrichten posten, lesen, Threads anlegen und Inhalte strukturieren kann.
- **Zulip** sticht heraus: Sehr gute **Bots/API-Events** (reine HTTP-Zulip-Bots
  = genau die „Agenten", wie wir sie fürs Aufräumen/Umstrukturieren der
  Bibliothek bräuchten).
- **Agenten als Bibliothekspfleger:** Ein Agent kann mithilfe der API Inhalte
  lesen, in Ordner/Streams sortieren, Meta-Guidelines auswerten und
  kommentieren — **sofern die Daten maschinenlesbar vorliegen** (Punkt 4).
- **Fazit:** Das Zusammenspiel ist machbar, **nicht** an eine Cloud gebunden —
  wir hosten selbst, die API läuft lokal auf dem VPS.

---

## 3. Was ist eine Community? Unabdingbare Features (Anforderungssatz)

Sammel-Übersicht, was zu einer funkionierenden, einfachen Community gehört
(idealerweisem als **Eigenbau-Checkliste** zu verwenden):

| # | Feature | Warum unabdingbar |
|---|---|---|
| 1 | **Identität/Anmeldung** | Nutzer zuordnen; bei uns: **automatisierter Hash-Login** aus lokaler Software per Klick |
| 2 | **Stream/Forum/Kanäle** | Diskussionsräume (Schule, Klasse, Themen, Berufssparten) |
| 3 | **Threads/Topics** | zusammenhängende Gespräche; bei uns: **Kommentarbereiche unter Produkten** |
| 4 | **Beiträge markdown-basiert** | Strukturierbar, maschinenlesbar (Obsidian/Second-Brain-Anschluss) |
| 5 | **Suche** | Inhalte wiederfinden |
| 6 | **Profil/Statistik** | Talente-Übersicht (Gauge/Chart), eigene Beiträge |
| 7 | **Bewertung (Likes/Reaktionen)** | Grundlage für Bestenliste + Talente-Verteilung |
| 8 | **Benachrichtigungen** | Nutzer über Antworten/Likes/Lo-Talente informieren |
| 9 | **Moderation/Verwaltung** | Rollen (Verwaltung/Lehrer/Eltern/Schüler), Zugriff |
| 10 | **Offener Chat/Kommentare** | Austausch, Bestätigung getesteter Produktionen |
| 11 | **API für Agenten** | Agent kann automatisieren (Aufräumen, Strukturieren, Repo-Pflege) |
| 12 | **Datentrennung/DSGVO** | Nutzerdaten vs. Programm/Publikationen strikt getrennt |
| 13 | **Export/Markdown-Dump** | Nachrichten machinenlesbar exportierbar (Obsidian-Fähigkeit) |

> **Für uns spezifisch (fehlt überall am Markt):** Talente-/Token-Balance,
> Likes-Ranking, Verteilmodus (10/50/40), Hash-Login, Transfer, Key-Rotation.
> Das sind **keine** Standard-Community-Features → müssen ergänzt/gebaut werden.

---

## 4. Maschinenlesbarkeit & Second Brain (Obsidian, MD)

- Die Community-Daten sollten **als Markdown** vorliegen bzw. **exportierbar
  sein** (Zulip erlaubt Volltext-/Data export; API liefert Beiträge als
  formatierten Inhalt).
- Bloße Datenbank-Ablage (SQL) reicht **nicht**: Für ein **Second Brain mit
  Obsidian** brauchen wir **flache `.md`-Dateien** pro Beitrag/Produkt → daraus
  lassen sich **Knotenpunkte** (Wikilinks) **schneller verbinden**.
- **Empfehlung:** Community-Modul schreibt **je Beitrag/Produkt eine `.md`-Datei**
  in eine definierte `community/`-Struktur → diese wird **hydriert** in Streumaps
  / Obsidian-Vault, sodass die ganze **Architektur in sich schlüssig**, die
  Verlinkung funktioniert und ein Agent effizient arbeiten kann.

---

## 5. Entscheidung: Eigenbau vs. Übernahme

### 5.1 Übernahme (fertige Software)
**+** schneller Start, wenig Code, getestet, Community-Support.
**–** Jede fertige Plattform bringt **viel Fremdlogik** mit; wir müssten
**Talente/Verteilung/Likes-Ranking/Hash/Transfer/Key-Rotation** trotzdem
ergänzen = trotzdem viel Eigenbau. Lizenz-Zusatzbedingungen (z. B. Dify) und
Copyleft eng ein.
**Fazit:** Nur wenige fertige Apache-2.0-Kandidaten (Zulip) — und selbst die
liefern **nicht** unsere Kernlogik.

### 5.2 Eigenbau (modular, selbst gemacht) — ✅ BESCHLOSSEN
**+** exakt unsere Struktur; sauberer Anschluss ans **VPS-Verwaltungssystem**;
**keine** Übergangs-/Altsystem-Probleme; Datentrennung & Sicherheit von Anfang
an eingebaut; Markdown-/Obsidian-Export direkt vorgesehen.
**–** Mehraufwand, wir tragen Wartung.
**Beschluss:** Die Community wird **komplett von Grund auf selbst gebaut**
(siehe [[Community/Plan-Community]]). Kein Zulip-Install.

### 5.3 Umsetzungs-Fahrplan (Eigenbau)
- **Schlanke, selbstgebaute Markdown-Community** (Threads →
  `.md`-Dateien, Kommentare, Likes, Profil/Talente) **+** Bots/API für Agenten + Bibliothekar.
- **Zulip nur als Ideenquelle** für einzelne Features — nicht als Frontend/Engine.
- Damit bleiben **Übergänge zur VPS-Verwaltung sauber** und es gibt **kein
  systematisches Altsoftware-Problem**.

> Nachstellung konkreter Schritt: zuerst Anforderungssatz (Punkt 3) als
> Aufwandsschätzung, dann Mini-MVP der Markdown-Community, dann Talente-/Verteil-
> modul, dann Agenten-Anbindung.

---

## 6. Offene Fragen / nächste Schritte

- [ ] **Lizenz-Freigabe** durch Advokaten (rein Apache-2.0 vs. MIT/Derivat vs.
      Copyleft tolerierbar?) — bevor übernommen wird
- [x] **Scope geklärt:** **Kompletter Eigenbau** der Community (Zulip als
      Ideenquelle, nicht als Engine). Siehe [[Community/Plan-Community]].
- [ ] **Feature-Set** mit Punkt 3 abgleichen — was gehört in MVP v1?
- [ ] **Markdown-Layout** fürs Second-Brain (pro Beitrag eine `.md`, Namens-
      konvention, `_index`) definieren
- [ ] **Agenten-API-Anforderungen** formulieren (lesen/schreiben/sortieren,
      kommentieren, Bibliothekspflege)
- [ ] **VPS-Übergang:** Community-Modul schnittstelle zur Verwaltung sauber
      definieren (Hash-Login, Talente-Sync, Key-Rotation)

---

## 7. Quellen (Stand der Recherche)

- github.com/zulip/zulip · zulip.readthedocs.io (Apache 2.0)
- github.com/langgenius/dify · dify.ai (Derivat-Lizenz auf Apache 2.0-Basis, ⚠️)
- github.com/go-gitea/gitea · forgejo.org (MIT)
- librechat.ai (MIT) · rocket.chat (MIT) · mattermost.com (MIT)
- discourse.org · join-lemmy.org · joinmastodon.org (Copyleft/GPL/AGPL — raus)
- appselfhost.com / osswire.com (Marktübersicht, zur Einordnung)