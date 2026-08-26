---
type: foundation
title: "Knowledge Base Design"
description: "Designprinzipien einer persistenten, LLM-gepflegten Wiki als Alternative zu klassischem RAG — Compounding Artifact."
tags: [fundament, ki-strukturen, ais-2027]
timestamp: "2026-04-06T00:00:00Z"
ampel: 🟡
konfidenz: 0.8
---

# Knowledge Base Design

**Type:** Concept  
**Tags:** Wiki, Knowledge Management, Architecture, Systems, LLM Tools  
**Zuletzt aktualisiert:** 2026-04-06  
**Quellen:** [[s02_llm_wiki]]

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
5. **Key Insight:** Good answers become wiki pages — Explorations are preserved

### **Lint** (Maintenance)

Periodic health checks:
- ✓ Contradictions between pages
- ✓ Stale claims vs newer sources
- ✓ Orphan pages (no inbound links)
- ✓ Concepts mentioned but no dedicated page
- ✓ Missing cross-references
- ✓ Data gaps

---

## Scaling Characteristics

| Scale | Pages | Approach |
|-------|-------|----------|
| **Small** | ~10-50 | `index.md` is sufficient search, no embedding DB needed |
| **Medium** | ~100-500 | `index.md` + category organization effective, graph view useful |
| **Large** | ~500+ | Need proper search engine, e.g. [[qmd]] (local BM25/vector/LLM re-ranking) |

---

## Why Humans Abandon Wikis

**Why personal wikis fail:**
1. **Maintenance burden grows** → breaks motivation
2. **Cross-references get stale** → links rot
3. **New info contradicts old** → nobody updates
4. **No systematic summary** → hard to query
5. **Low perceived ROI** → not worth the work

**Why LLM Wiki works:**
- LLM **never gets bored**
- LLM **remembers to update links**
- LLM **notices contradictions automatically**
- LLM **maintains consistency across N files in one pass**
- **Maintenance cost approaches zero**

---

## Historical Context: Vannevar Bush's Memex (1945)

[[s02_llm_wiki]] references [[e04_bush]]'s **Memex** concept:
- Personal, curated knowledge store
- **Associative trails** between documents
- **Problem Bush couldn't solve:** Who does maintenance?

**Modern Solution:** LLM handles maintenance

---

## Verbindungen

- [[s02_llm_wiki]] — Primäre Quelle für dieses System
- [[src-ai_2027]] — Use Case: AI Futures Research
- [[e04_bush]] — Historical inspiration (Memex concept)
