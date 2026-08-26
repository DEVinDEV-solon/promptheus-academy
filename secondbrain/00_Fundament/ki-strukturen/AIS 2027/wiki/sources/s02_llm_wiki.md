---
type: foundation
title: "LLM Wiki Pattern"
description: "Meta-Beschreibung des LLM Wiki Patterns — theoretisches Framework für LLM-gesteuerte Wissenssysteme als Alternative zu klassischem RAG."
tags: [fundament, ki-strukturen, ais-2027, quelle]
timestamp: "2026-04-06T00:00:00Z"
ampel: 🟢
konfidenz: 0.9
---

# LLM Wiki Pattern

**Type:** Source  
**Tags:** LLM Wiki Pattern, Knowledge Base, Architecture, Methodology  
**Zuletzt aktualisiert:** 2026-04-06  
**Original:** https://gist.github.com/karpaugusti/442a6bf555914893e9891c11519de94f  
**Author:** Andrej Karpathy (implied)

## Zusammenfassung

Eine Meta-Beschreibung des **LLM Wiki Pattern selbst** — ein abstraktes Ideendokument das beschreibt wie man ein LLM-gesteuertes Wissenssystem aufbaut. Im Gegensatz zu klassischem RAG baut der LLM eine **persistent wiki** auf, nicht nur abrufen. Dies ist das theoretische Framework hinter dem System, das ihr gerade in AIS 2027 aufbaut.

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
- **The Key:** macht aus LLM einen disciplined maintainer

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

### **Query**
1. Du stellst Frage gegen Wiki
2. LLM konsultiert index.md
3. LLM synthesizes answer mit Citations

### **Lint** (Health Check)
Periodisch: Widersprüche, stale claims, orphan pages, fehlende references

---

## Why This Works

**Problem:** Wikis werden abandoned weil maintenance burdensome ist.

**Solution:** LLMs never get bored
- Don't forget cross-references
- Can touch 15 files in one pass
- Maintenance cost ist nahe null

---

## Use Cases

| Use Case | Anwendung |
|----------|-----------|
| **Personal** | Goals, Health, Psychology, Self-Improvement tracking |
| **Research** | Deep topic dives — Papers, Articles, Synthesis |
| **Book Reading** | Characters, Themes, Plot threads |
| **Business** | Internal wiki fed by Slack, Meetings |

---

## Historical Context: Vannevar Bush's Memex (1945)

[[e04_bush]]'s **Memex** concept:
- Personal, curated knowledge store
- **Associative trails** between documents
- **Problem Bush couldn't solve:** Who does maintenance?

**Modern Solution:** LLM handles maintenance

---

## Widersprüche & Meta-Gedanken

**Meta-Frage:** Dieses Dokument beschreibt das System, das gerade aufgebaut wird!

**Potential Contradiction:**
- [[src-ai_2027]] sagt: "AGI wird gebaut von Firmen wie [[e01_openbrain]]"
- LLM Wiki Pattern sagt: "LLMs können Wissen maintain"
- **Synthesis Question:** Wenn AGI kommt, kann LLM wikis autonom warten?

---

## Verbindungen

- [[src-ai_2027]] — The Use Case: AI Futures Research
- [[c05_kb_design]] — Knowledge Base Design concept
- [[c10_rag]] — Alternative to this approach
- [[e04_bush]] — Historical reference (Memex)