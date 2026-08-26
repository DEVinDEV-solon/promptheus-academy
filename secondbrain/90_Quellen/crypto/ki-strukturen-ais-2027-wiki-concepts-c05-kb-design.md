---
type: source
title: "Knowledge Base Design"
description: "Designprinzipien hinter einer persistenten, LLM-gepflegten Wiki als Alternative zu klassischem RAG — das Compounding Artifact."
tags:
  - source
  - fundament
  - ki-strukturen
  - ais-2027
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "60_Crypto_Analyse"
  pfad: "00_Fundament/ki-strukturen/AIS 2027/wiki/concepts/c05_kb_design.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:f4aea5ec67ae6f252493bab51c3ffd1040a35465d9d4bc86b376c3b21d2b5793"
---


# Knowledge Base Design

**Type:** Concept  
**Tags:** Wiki, Knowledge Management, Architecture, Systems, LLM Tools  
**Zuletzt aktualisiert:** 2026-04-06  
**Quellen:** *s02_llm_wiki*

## Zusammenfassung

Die Designprinzipien hinter einer **persistent, LLM-gepflegten Wiki** als Alternative zu klassischem RAG. Core idea: **Compounding artifact** das reicher wird mit jedem Ingest statt alles von Anfang zu re-derive.

## Klassische Alternativen

### **RAG (Retrieval-Augmented Generation)**
- Upload files → index chunks → retrieve at query time
- **Problem:** No accumulation
- **Mittel:** Embedding-based search, vector DBs
- **Workflow:** Every query re-derives answers
- **Examples:** NotebookLM, ChatGPT file uploads

### **LLM Wiki**
- Upload source → integrate into wiki → persistent structured knowledge
- **Advantage:** Compounding, organized, queryable
- **Mittel:** Persistent markdown, structured metadata, cross-references
- **Workflow:** Source integrated once, then queried
- **New:** This approach (2025+)

---

## The Three Layers

### Layer 1: Raw Sources (Immutable)
**Purpose:** Single source of truth

- User curates and uploads sources
- LLM only reads, never modifies
- Prevents drift between source & Wiki
- Enables reproductibility ("Trace back to original")

### Layer 2: The Wiki (LLM Territory)

**Purpose:** Structured, queryable, maintained knowledge

**Subdirectories:**
- `sources/` — Summary of each raw source
- `concepts/` — Ideas, theories, patterns
- `entities/` — People, organizations, places
- `analyses/` — Deep syntheses spanning multiple sources

**Key Properties:**
- ✓ Cross-linked (pages reference each other)
- ✓ Indexed (quick search via index.md)
- ✓ Timestamped (updatable, versionable)
- ✓ LLM-maintained (user never edits these)

### Layer 3: Schema (Configuration)

**Purpose:** Governance document that makes LLM a disciplined maintainer

**Contains:**
- Directory structure conventions
- Page format standards
- Naming conventions
- Workflow procedures (Ingest, Query, Lint)
- Domain-specific rules

**Key Insight:** Schema co-evolves with user experience

---

## The Three Operations

### **Ingest** (Integration)

Flow:
1. User drops source in `raw/`
2. LLM reads & discusses with user
3. LLM creates Source summary page
4. LLM creates/updates relevant Concept pages
5. LLM creates/updates relevant Entity pages
6. LLM adds cross-references (markdown links)
7. LLM updates `index.md`
8. LLM appends `log.md` entry

**Impact:** Single source touches 10-15 pages

### **Query** (Analysis)

Flow:
1. User asks question
2. LLM reads `index.md` to find relevant pages
3. LLM reads those pages deeply
4. LLM synthesizes answer with citations

**Key Insight:** **Good answers become wiki pages**

### **Lint** (Maintenance)

Periodic health checks:
- ✓ Contradictions between pages
- ✓ Stale claims vs newer sources
- ✓ Orphan pages (no inbound links)
- ✓ Missing cross-references
- ✓ Data gaps

---

## Scaling Characteristics

### Small Wiki (~10-50 pages)
- `index.md` is sufficient search
- No embedding DB needed
- Manual browsing works

### Medium Wiki (~100-500 pages)
- Still works without RAG infrastructure
- `index.md` + category organization effective
- Some tool support useful (graph view, search)

### Large Wiki (~500+ pages)
- Need proper search engine
- Suggestion: *c10_rag* (local, BM25/vector/LLM re-ranking)
- Graph navigation becomes critical

---

## Why Humans Abandon Wikis

**Why personal wikis fail:**
1. Maintenance burden grows
2. Cross-references get stale
3. New info contradicts old
4. No systematic summary
5. Low perceived ROI

**Why LLM Wiki works:**
- LLM **never gets bored**
- LLM **remembers to update links**
- LLM **notices contradictions automatically**
- LLM **maintains consistency across N files in one pass**
- **Maintenance cost approaches zero**

---

## Verbindungen

- *s02_llm_wiki* — Primäre Quelle für dieses System
- *s01_ai_2027* — Use Case: AI Futures Research
- *c11_memex* — Historical inspiration (Memex concept)
- *c10_rag* — Alternative approach to knowledge systems

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/ki-strukturen/AIS 2027/wiki/concepts/c05_kb_design.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
