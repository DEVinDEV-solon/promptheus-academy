"""PROMPTHEUS Cinema Studio — HyperFrames-Werkzeuge als MCP-Server (stdio, JSON-RPC 2.0) für die Claude-CLI.

Ohne Abhängigkeit: liest eine JSON-Nachricht je Zeile von stdin, antwortet auf stdout.
Dieselben Werkzeuge und dieselbe Sandbox wie der OpenRouter-Weg (hyperframes_werkzeuge.py).

Aufruf (durch assistent.py):  python hyperframes_mcp.py --projekt <ordner> --skills <ordner> [--ffmpeg <exe>]
Bilder aus bild_ansehen gehen als MCP-Inhalte {type: "image", data, mimeType} zurück.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hyperframes_werkzeuge as hw  # noqa: E402

PROTOKOLL = "2025-06-18"


def antwort(kasten: hw.Werkzeugkasten, nachricht: dict) -> dict | None:
    """Eine JSON-RPC-Nachricht beantworten; None bei Benachrichtigungen (ohne id)."""
    methode, nid = nachricht.get("method"), nachricht.get("id")
    if nid is None:
        return None
    if methode == "initialize":
        version = str((nachricht.get("params") or {}).get("protocolVersion") or PROTOKOLL)
        ergebnis = {"protocolVersion": version, "capabilities": {"tools": {"listChanged": False}},
                    "serverInfo": {"name": "hf", "version": hw.HF_VERSION}}
    elif methode == "ping":
        ergebnis = {}
    elif methode == "tools/list":
        ergebnis = {"tools": [{"name": w["name"], "description": w["description"], "inputSchema": w["parameters"]}
                              for w in hw.WERKZEUGE]}
    elif methode == "tools/call":
        p = nachricht.get("params") or {}
        text = kasten.ausfuehren(str(p.get("name") or ""), p.get("arguments") or {})
        bilder = [{"type": "image", "data": b["daten"], "mimeType": b["mime"]} for b in getattr(text, "bilder", [])]
        ergebnis = {"content": [{"type": "text", "text": str(text)}, *bilder],
                    "isError": text.startswith(("FEHLER:", "VERWEIGERT:"))}
    else:
        return {"jsonrpc": "2.0", "id": nid, "error": {"code": -32601, "message": f"Unbekannte Methode {methode}"}}
    return {"jsonrpc": "2.0", "id": nid, "result": ergebnis}


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--projekt", required=True)
    ap.add_argument("--skills", required=True)
    ap.add_argument("--ffmpeg", default=None, help="Pfad zu ffmpeg zum Verkleinern der Bilder (sonst PATH)")
    a = ap.parse_args(argv)
    kasten = hw.Werkzeugkasten(Path(a.projekt), Path(a.skills), ffmpeg=a.ffmpeg)
    ein = sys.stdin.buffer
    aus = sys.stdout.buffer
    for zeile in ein:
        zeile = zeile.strip()
        if not zeile:
            continue
        try:
            nachricht = json.loads(zeile)
        except ValueError:
            r = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
        else:
            r = antwort(kasten, nachricht) if isinstance(nachricht, dict) else None
        if r is not None:
            aus.write((json.dumps(r, ensure_ascii=False) + "\n").encode("utf-8"))
            aus.flush()


if __name__ == "__main__":
    main()
