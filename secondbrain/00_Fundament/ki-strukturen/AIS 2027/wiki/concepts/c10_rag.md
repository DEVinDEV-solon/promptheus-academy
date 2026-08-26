---
type: foundation
title: "RAG (Retrieval-Augmented Generation)"
description: "Klassisches Pattern für LLM-Wissenssysteme — Abruf von Chunks bei Query-Zeit, ohne persistente Wissensakkumulation."
tags: [fundament, ki-strukturen, ais-2027]
timestamp: "2026-04-06T00:00:00Z"
ampel: 🟢
konfidenz: 0.9
---

# RAG (Retrieval-Augmented Generation)

**Type:** Concept  
**Tags:** Knowledge Systems, LLM Methods, Retrieval, Alternative  
**Zuletzt aktualisiert:** 2026-04-06  
**Quellen:** [[10 Wissen/AIS 2027/wiki/sources/s02_llm_wiki]]

## Zusammenfassung

**RAG = Retrieval-Augmented Generation.** Classical pattern für LLM knowledge systems. Gegensatz zu [[10 Wissen/AIS 2027/wiki/concepts/c05_kb_design|LLM Wiki pattern]].

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

[[10 Wissen/AIS 2027/wiki/concepts/c05_kb_design|LLM Wiki Pattern]] — LLM maintains persistent wiki instead of just retrieving

## Verbindungen

- [[10 Wissen/AIS 2027/wiki/sources/s02_llm_wiki]] — Criticizes RAG, proposes alternative
- [[10 Wissen/AIS 2027/wiki/concepts/c05_kb_design]] — The better pattern
- LLM Workflows & Knowledge Management