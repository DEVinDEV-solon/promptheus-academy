---
type: source
title: "LLM Wiki Pattern (Karpathy)"
description: "Meta-Beschreibung des LLM Wiki Patterns von Andrej Karpathy — theoretisches Framework für LLM-gesteuerte, persistente Wissenssysteme."
tags:
  - source
  - fundament
  - ki-strukturen
  - ais-2027
  - quelle
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/ki-strukturen/AIS 2027/wiki/sources/Source_002_LLM_Wiki_Pattern.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:6cc94b2e7a66dbf671aea041fd81735e2d92defe324553ec8c94c355088831c9"
---


# Source_002_LLM_Wiki_Pattern

**Type:** Source  
**Tags:** LLM Wiki Pattern, Knowledge Base, Architecture, Methodology  
**Zuletzt aktualisiert:** 2026-04-06  
**Original:** https://gist.github.com/karpaugusti/442a6bf555914893e9891c11519de94f  
**Author:** Andrej Karpathy (implied)

## Zusammenfassung

Eine Meta-Beschreibung des **LLM Wiki Pattern selbst** — ein abstraktes Ideendokument das beschreibt wie man ein LLM-gesteuertes Wissenssystem aufbaut. Im Gegensatz zu klassischem RAG baut der LLM eine **persistent wiki** auf, nicht nur abrufen. Dies ist das theoretische Framework hinter dem System, das ihr gerade in Paperclip aufbaut.

## Kernidee: Persistent Wiki vs RAG

### Klassisches RAG (Problem)
- Upload von Dateien
- LLM ruft Chunks bei Query ab
- **Keine Akkumulation** — neu deriviert bei jeder Query
- 5 Sources synthestisieren = 5x die Arbeit jedesmal

### LLM Wiki (Lösung)
- LLM **builds and maintains** persistent wiki incrementally
- Neue Source: **integriert** in bestehende Wiki, nicht nur indexed
- **Compounding artifact** — wird reicher mit jedem Ingest
- Bekannte Cross-References, Contradictions, Synthesen

**Kognitive Metapher:** 
> "Obsidian ist die IDE. Der LLM ist der Programmer. Die Wiki ist der Codebase."

---

## Die Drei-Schichten Architektur

### 1. **Raw Sources** (Immutable)
- Deine kurierten Quellen (Articles, Papers, PDFs, etc)
- LLM liest ONLY, never modifies
- **Quelle der Wahrheit**

### 2. **The Wiki** (LLM-owned)
- Summaries, Entity Pages, Concept Pages, Analyses
- **LLM creates, updates, maintains** alles
- Cross-references maintained
- Consistency garantiert

### 3. **The Schema** (Configuration Doc)
- Definiert Struktur, Konventionen, Workflows
- **The Key:** macht aus LLM einen disciplined maintainer, nicht generic chatbot
- Co-evolves mit User über Zeit
- Domain-specific

---

## Die Drei Hauptoperationen

### **Ingest**
1. Drop new source in `raw`
2. LLM reads & discusses key points
3. LLM writes summary page
4. Updates relevant entity/concept pages
5. Adds cross-references
6. Updates index.md
7. Appends log.md entry

**Important:** Single source kann 10-15 wiki pages berühren

### **Query**
1. Du stellst Frage gegen Wiki
2. LLM konsultiert index.md
3. LLM reads relevant pages
4. LLM synthesizes answer mit Citations
5. **Key Insight:** Gute Antworten werden zurück in Wiki gespeichert als neue Pages

**Result:** Explorations compound in knowledge base

### **Lint** (Health Check)
Periodisch:
- Widersprüche zwischen Pages
- Stale claims vs neue Sources
- Verwaiste Pages (keine inbound links)
- Konzepte erwähnt aber ohne eigne Seite
- Fehlende Cross-References
- Data Gaps

---

## Index & Log (Die Spezial-Dateien)

### **index.md** (Content-oriented)
- Katalog aller Wiki-Seiten
- Links + One-line summaries
- Organized by category
- Updated on every ingest
- **Scalierbar:** Works at ~100 sources, hundreds of pages ohne RAG Infrastructure

### **log.md** (Chronological)
- Append-only record von Events
- Ingests, Queries, Lint Passes
- **Parseable Format:** `## [YYYY-MM-DD] action | description`
- Timeline der Wiki-Evolution

---

## Use Cases

Der Pattern funktioniert für viele Domains:

| Use Case | Anwendung |
|----------|-----------|
| **Personal** | Goals, Health, Psychology, Self-Improvement tracking |
| **Research** | Deep topic dives — Papers, Articles, Synthesis |
| **Book Reading** | Characters, Themes, Plot threads als you read |
| **Business** | Internal wiki fed by Slack, Meetings, Transcripts |
| **Competitive Analysis** | Due Diligence, Trends, Market Intelligence |
| **Hobby Deep-Dives** | Collecting knowledge systematically |

---

## Why This Works (Die Kernlogik)

**Problem:** Wikis werden abandoned von Humans weil:
- Bookkeeping ist tedious
- Updating cross-references ist boring
- Konsistenz zu halten ist schwer
- Maintenance burden wächst schneller als Value

**Solution:** LLMs never get bored
- Don't forget cross-references
- Can touch 15 files in one pass
- Maintenance cost ist nahe null

**Role Split:**
- **Mensch:** Curate sources, direct analysis, ask good questions, think about meaning
- **LLM:** Everything else (summarizing, cross-referencing, filing, bookkeeping)

---

## Optional: Tools & Tricks

### Obsidian Extensions
- **Web Clipper:** Convert web articles to markdown quickly
- **Graph View:** Visualize connections, find hubs/orphans
- **Dataview Plugin:** Query over YAML frontmatter, generate dynamic tables

### Search at Scale
- Small scale: Index file is enough
- Larger: Use *qmd* (local search engine, BM25/vector, LLM re-ranking)

### Version Control
- Wiki is git repo → version history, branching, collaboration free

---

## Important: It's Abstract

**This document is intentionally abstract.** It describes the idea, not specific implementation.

---

## Historical Context: Vannevar Bush's Memex (1945)

References *e04_bush*'s **Memex** concept:
- Personal, curated knowledge store
- **Associative trails** between documents as valuable as documents themselves
- **Problem Bush couldn't solve:** Who does maintenance?

**Modern Solution:** LLM handles maintenance

---

## Widersprüche & Meta-Gedanken

**Meta-Frage:** Dieses Dokument beschreibt das System, das gerade aufgebaut wird!

**Potential Contradiction:**
- *src-ai_2027* sagt: "AGI wird gebaut von Firmen wie OpenBrain"
- LLM Wiki Pattern sagt: "LLMs können Wissen maintain"
- **Synthesis Question:** Wenn AGI kommt, kann LLM wikis autonom warten?

---

## Verbindungen

- *src-ai_2027* — The Use Case: AI Futures Research
- *c05_kb_design* — Knowledge Base Design concept
- *e04_bush* — Historical reference (Memex)

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/ki-strukturen/AIS 2027/wiki/sources/Source_002_LLM_Wiki_Pattern.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
