---
type: entity/begriff
title: "RAG (Antwort mit Nachschlagen)"
description: "Erst in echten Dokumenten suchen, dann antworten — mit Fundstelle."
tags:
  - glossar
  - agentik
aliase:
  - Retrieval Augmented Generation
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# RAG (Antwort mit Nachschlagen)

> **R**etrieval **A**ugmented **G**eneration: Bevor das Modell antwortet, wird in einer Sammlung eigener Texte nachgeschlagen; die Fundstellen kommen mit in den [[prompt]].

Das löst zwei Probleme auf einmal. Das Modell kann Dinge beantworten, die nach seinem [[training]] passiert sind — und es kann **sagen, woher es das hat**.

Gegen [[halluzination|Halluzinationen]] hilft es, aber es beseitigt sie nicht: Wenn die Suche das Falsche findet, wird das Falsche ordentlich belegt. Die Qualität der Antwort hängt an der Qualität der Sammlung.

Der Wissensspeicher dieser Academy ist genau dafür gebaut: Jede geerntete Notiz trägt Herkunft und Prüfsumme.

## Verwandt

[[prompt]] · [[halluzination]] · [[training]] · [[feinabstimmung]]
