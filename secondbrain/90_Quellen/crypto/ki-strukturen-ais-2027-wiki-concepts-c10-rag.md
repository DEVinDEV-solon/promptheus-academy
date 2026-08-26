---
type: source
title: "RAG (Retrieval-Augmented Generation)"
description: "Klassisches Pattern für LLM-Wissenssysteme — Abruf von Chunks bei Query-Zeit, ohne persistente Wissensakkumulation."
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
  pfad: "00_Fundament/ki-strukturen/AIS 2027/wiki/concepts/c10_rag.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:e37a92bada26f16215374245e4fab1dd8b63b062d3bef12eee6519c3b3571122"
---


# RAG (Retrieval-Augmented Generation)

**Type:** Concept  
**Tags:** Knowledge Systems, LLM Methods, Retrieval, Alternative  
**Zuletzt aktualisiert:** 2026-04-06  
**Quellen:** *s02_llm_wiki*

## Zusammenfassung

**RAG = Retrieval-Augmented Generation.** Classical pattern für LLM knowledge systems. Gegensatz zu *LLM Wiki pattern*.

## How RAG Works

1. User uploads documents/files
2. System indexes/chunks them (embedding DB)
3. User asks question
4. System retrieves relevant chunks at query time
5. LLM generates answer from chunks

## Problem with RAG

**No accumulation:**
- Same documents, same searches, same retrieval
- LLM rediscoveres knowledge from scratch every query
- Contradictions not flagged automatically
- Synthesis not stored
- No compounding

**Example:** Ask 5 documents synthesized:
- 1st time: LLM finds & combines all 5
- 2nd time: Same work all over
- 3rd time: Same work again

## Technology (Classical RAG)

- Embedding databases (Vector DBs)
- FAISS, Pinecone, Weaviate, etc.
- BM25 + embedding hybrid search
- Chunk-level retrieval

## Successful Products

- NotebookLM
- ChatGPT file uploads
- Most commercial LLM knowledge systems

## Why RAG Works but Feels Limited

✓ Solves the "searching many documents" problem
✗ Doesn't build persistent knowledge structure
✗ No synthesis or conflict resolution
✗ Maintenance cost high (rebuild indexes)

## Alternative

*LLM Wiki Pattern* — LLM maintains persistent wiki instead of just retrieving

## Verbindungen

- *s02_llm_wiki* — Criticizes RAG, proposes alternative
- *c05_kb_design* — The better pattern
- LLM Workflows & Knowledge Management

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `60_Crypto_Analyse`
> geerntet (`00_Fundament/ki-strukturen/AIS 2027/wiki/concepts/c10_rag.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
