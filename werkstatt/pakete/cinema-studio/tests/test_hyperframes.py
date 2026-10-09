"""Tests für die HyperFrames-Werkzeuge: Sandbox, Freigabeliste, Bilder, Kostenbremse, MCP-Server, Werkzeug-Kreislauf,
Onboarding.

Laufen offline: OpenRouter und die HyperFrames-CLI werden simuliert.
Aufruf:  python -m unittest discover -s tests -v
"""
import base64
import http.client
import io
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import test_server as ts  # noqa: E402  setzt BILDGEN_DATA/BILDGEN_ABLAGE und importiert server

server = ts.server
hw = server.hw
assistent = server.assistent
PAKET = Path(__file__).resolve().parents[1]


class Sandbox(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="hf_test_"))
        self.projekt = self.tmp / "projekt"
        self.skills = self.tmp / "skills"
        (self.skills / "hyperframes" / "references").mkdir(parents=True)
        (self.skills / "hyperframes" / "SKILL.md").write_text(
            "---\nname: hyperframes\ndescription: >\n  Einstieg für\n  alle Videos.\n---\n# Inhalt\n" + "x" * 50000, "utf-8")
        (self.skills / "hyperframes" / "references" / "a.md").write_text("Referenz A", "utf-8")
        (self.tmp / "geheim.txt").write_text("GEHEIM", "utf-8")
        self.k = hw.Werkzeugkasten(self.projekt, self.skills, hf=[])

    def test_pfadausbruch(self):
        for boese in ("../geheim.txt", "a/../../geheim.txt", "..\\geheim.txt", "/etc/passwd", "C:/Windows/win.ini",
                      "c:geheim.txt", "~/x", "video/..", "a\x00b", "datei.txt:stream"):
            with self.subTest(boese=boese), self.assertRaises(hw.Verboten):
                hw.pfad_in(self.projekt, boese)
        self.assertEqual(hw.pfad_in(self.projekt, "video/index.html"), (self.projekt / "video" / "index.html").resolve())
        self.assertEqual(hw.pfad_in(self.projekt, "."), self.projekt.resolve())
        # über das Werkzeug: Text statt Ausnahme, und nichts außerhalb gelesen/geschrieben
        self.assertTrue(self.k.ausfuehren("datei_lesen", {"pfad": "../geheim.txt"}).startswith("VERWEIGERT"))
        self.assertTrue(self.k.ausfuehren("datei_schreiben", {"pfad": "../boese.html", "inhalt": "x"}).startswith("VERWEIGERT"))
        self.assertFalse((self.tmp / "boese.html").exists())
        self.assertTrue(self.k.ausfuehren("ordner_auflisten", {"pfad": ".."}).startswith("VERWEIGERT"))

    def test_verknuepfung_hinaus(self):
        ziel = self.projekt / "draussen"
        try:
            if os.name == "nt":
                import _winapi
                _winapi.CreateJunction(str(self.tmp), str(ziel))
            else:
                os.symlink(self.tmp, ziel)
        except (OSError, AttributeError) as e:
            self.skipTest(f"Verknüpfung nicht anlegbar: {e}")
        try:
            r = self.k.ausfuehren("datei_lesen", {"pfad": "draussen/geheim.txt"})
            self.assertTrue(r.startswith("VERWEIGERT"), r)
            self.assertNotIn("GEHEIM", r)
            r = self.k.ausfuehren("datei_schreiben", {"pfad": "draussen/neu.html", "inhalt": "x"})
            self.assertTrue(r.startswith("VERWEIGERT"), r)
            self.assertFalse((self.tmp / "neu.html").exists())
            self.assertNotIn("draussen", self.k.ordner_auflisten("."))
        finally:
            os.rmdir(ziel) if os.name == "nt" else ziel.unlink()

    def test_dateien_und_endungen(self):
        self.assertIn("Gespeichert", self.k.ausfuehren("datei_schreiben", {"pfad": "video/index.html", "inhalt": "<h1>Hallo</h1>"}))
        self.assertEqual(self.k.ausfuehren("datei_lesen", {"pfad": "video/index.html"}), hw.WIEDERHOLT, "eben selbst geschrieben")
        self.assertEqual(hw.Werkzeugkasten(self.projekt, self.skills, hf=[]).ausfuehren("datei_lesen", {"pfad": "video/index.html"}),
                         "<h1>Hallo</h1>")
        for endung in ("x.exe", "x.py", "x.bat", "x.ps1", "x.cmd", "ohne_endung"):
            with self.subTest(endung=endung):
                self.assertTrue(self.k.ausfuehren("datei_schreiben", {"pfad": endung, "inhalt": "x"}).startswith("VERWEIGERT"))
        self.assertIn("video/index.html", self.k.ausfuehren("ordner_auflisten", {}))

    def test_skills(self):
        liste = json.loads(self.k.ausfuehren("skills_liste", {}))
        self.assertEqual(liste, [{"name": "hyperframes", "beschreibung": "Einstieg für alle Videos."}])
        text = self.k.ausfuehren("skill_lesen", {"skill": "hyperframes"})
        self.assertIn("weiter mit ab=", text, "lange Dateien seitenweise")
        self.assertEqual(self.k.ausfuehren("skill_lesen", {"skill": "hyperframes", "datei": "references/a.md"}), "Referenz A")
        for boese in ({"skill": "../projekt"}, {"skill": "hyperframes", "datei": "../../geheim.txt"},
                      {"skill": "fehlt"}, {"skill": "HYPER FRAMES"}):
            with self.subTest(boese=boese):
                self.assertTrue(self.k.ausfuehren("skill_lesen", boese).startswith("VERWEIGERT"))
        self.assertIn("hyperframes: Einstieg", hw.skills_index(self.skills))

    def test_freigabeliste(self):
        for befehl in ("publish", "cloud", "lambda", "cloudrun", "auth", "preview", "skills", "feedback", "tts", "rm", "", "init;calc"):
            with self.subTest(befehl=befehl), self.assertRaises(hw.Verboten):
                hw.argumente_pruefen(befehl, [])
        for args in (["/abs/pfad"], ["..\\x"], ["-o", "../../out.mp4"], ["--output=C:/x.mp4"], ["--docker"], ["a\nb"],
                     ["https://example.com"]):
            with self.subTest(args=args), self.assertRaises(hw.Verboten):
                hw.argumente_pruefen("render", args)
        for url in ("http://localhost:8796", "http://127.0.0.1/", "http://192.168.1.10/", "http://[::1]/", "file:///C:/x"):
            with self.subTest(url=url), self.assertRaises(hw.Verboten):
                hw.argumente_pruefen("capture", [url])
        self.assertEqual(hw.argumente_pruefen("capture", ["https://example.com"]), ["https://example.com"])
        self.assertEqual(hw.argumente_pruefen("render", ["-o", "renders/titel.mp4", "--variables", '{"t":"a/b"}']),
                         ["-o", "renders/titel.mp4", "--variables", '{"t":"a/b"}'])
        self.assertIn("--non-interactive", hw.argumente_pruefen("init", ["video"]))
        with self.assertRaises(hw.Verboten):
            hw.argumente_pruefen("init", ["Mein Video"])
        self.assertTrue(self.k.ausfuehren("hyperframes_ausfuehren", {"befehl": "publish"}).startswith("VERWEIGERT"))

    def test_ausfuehren_ohne_shell(self):
        """Die CLI bekommt die Argumente als Liste – Shell-Zeichen kommen wörtlich an, cwd ist die Sandbox."""
        echo = self.tmp / "echo.py"
        echo.write_text("import json, os, sys\nprint(json.dumps({'argv': sys.argv[1:], 'cwd': os.getcwd(), "
                        "'tele': os.environ.get('HYPERFRAMES_NO_TELEMETRY'), 'key': os.environ.get('OPENROUTER_API_KEY')}))", "utf-8")
        (self.projekt / "video").mkdir()
        k = hw.Werkzeugkasten(self.projekt, self.skills, hf=[sys.executable, str(echo)])
        os.environ["OPENROUTER_API_KEY"] = "sk-geheim"
        try:
            r = k.ausfuehren("hyperframes_ausfuehren", {"befehl": "lint", "argumente": ["--x", "a & calc"], "ordner": "video"})
        finally:
            del os.environ["OPENROUTER_API_KEY"]
        d = json.loads(r.splitlines()[-1])
        self.assertEqual(d["argv"], ["lint", "--x", "a & calc"])
        self.assertEqual(Path(d["cwd"]).resolve(), (self.projekt / "video").resolve())
        self.assertEqual(d["tele"], "1")
        self.assertIsNone(d["key"], "Schlüssel gehen nicht an die CLI")
        self.assertIn("Exit-Code 0", r)
        self.assertTrue(k.ausfuehren("hyperframes_ausfuehren", {"befehl": "lint", "ordner": "fehlt"}).startswith("VERWEIGERT"))

    def test_abbruch_beendet_prozess(self):
        schlaf = self.tmp / "schlaf.py"
        schlaf.write_text("import time\ntime.sleep(30)", "utf-8")
        ab = threading.Event()
        k = hw.Werkzeugkasten(self.projekt, self.skills, ab, hf=[sys.executable, str(schlaf)])
        threading.Timer(0.5, ab.set).start()
        t0 = time.time()
        r = k.ausfuehren("hyperframes_ausfuehren", {"befehl": "render"})
        self.assertIn("ABBRUCH", r)
        self.assertLess(time.time() - t0, 10)

    def test_renders_finden(self):
        (self.projekt / "video" / "renders").mkdir(parents=True)
        (self.projekt / "video" / "assets").mkdir(parents=True)
        (self.projekt / "video" / "renders" / "a.mp4").write_bytes(b"x")
        (self.projekt / "video" / "assets" / "quelle.mp4").write_bytes(b"x")
        self.assertEqual([p.name for p in hw.renders_finden(self.projekt)], ["a.mp4"])


class Bilder(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="hf_bild_"))
        self.projekt = self.tmp / "projekt"
        self.snap = self.projekt / "video" / "snapshots"
        self.snap.mkdir(parents=True)
        self.k = hw.Werkzeugkasten(self.projekt, self.tmp / "skills", hf=[], ffmpeg="")

    def test_sandbox_und_arten(self):
        (self.snap / "a.png").write_bytes(ts.png(4, 2))
        (self.projekt / "video" / "assets").mkdir()
        (self.projekt / "video" / "assets" / "logo.png").write_bytes(ts.png(4, 2))
        (self.snap / "falsch.png").write_bytes(b"GIF89a" + b"\x00" * 40)
        (self.snap / "notiz.txt").write_text("x", "utf-8")
        (self.tmp / "draussen.png").write_bytes(ts.png(4, 2))
        r = self.k.ausfuehren("bild_ansehen", {"pfade": ["video/snapshots/a.png"]})
        self.assertFalse(r.startswith(("FEHLER", "VERWEIGERT")), r)
        self.assertEqual(len(r.bilder), 1)
        self.assertEqual((r.bilder[0]["mime"], r.bilder[0]["pfad"]), ("image/png", "video/snapshots/a.png"))
        self.assertEqual(base64.b64decode(r.bilder[0]["daten"]), ts.png(4, 2), "kleines Bild geht unverändert durch")
        for boese in (["video/assets/logo.png"], ["../draussen.png"], ["video/snapshots/../../../draussen.png"],
                      ["video/snapshots/falsch.png"], ["video/snapshots/notiz.txt"], ["video/snapshots/fehlt.png"],
                      ["C:/Windows/x.png"], ["video/snapshots/a.png"] * 4):
            with self.subTest(boese=boese):
                r = self.k.ausfuehren("bild_ansehen", {"pfade": boese})
                self.assertTrue(r.startswith("VERWEIGERT"), r)
                self.assertFalse(getattr(r, "bilder", None))

    def test_neueste_serie(self):
        self.assertTrue(self.k.ausfuehren("bild_ansehen", {}).startswith("VERWEIGERT"), "ohne Snapshots")
        alt = self.snap / "alt.png"
        alt.write_bytes(ts.png(2, 2))
        os.utime(alt, (time.time() - 3600, time.time() - 3600))
        for i in range(5):
            (self.snap / f"frame-{i}.png").write_bytes(ts.png(2, 2))
        r = self.k.ausfuehren("bild_ansehen", {})
        self.assertEqual([b["pfad"] for b in r.bilder],
                         ["video/snapshots/frame-0.png", "video/snapshots/frame-2.png", "video/snapshots/frame-4.png"],
                         "jüngste Serie, gleichmäßig verteilt, die alte Datei bleibt weg")

    def test_masse(self):
        self.assertEqual(hw.bild_masse(ts.png(7, 3)), (7, 3))
        jpg = b"\xff\xd8\xff\xe0" + b"\x00\x04ab" + b"\xff\xc0\x00\x11\x08" + (480).to_bytes(2, "big") + (640).to_bytes(2, "big") + b"\x00" * 12
        self.assertEqual(hw.bild_masse(jpg), (640, 480))
        self.assertEqual(hw.bild_art(jpg), "image/jpeg")
        self.assertEqual(hw.bild_masse(b"kaputt"), (0, 0))

    def test_verkleinern_mit_ffmpeg(self):
        ffmpeg = hw.wk.pfad("ffmpeg")
        if not ffmpeg:
            self.skipTest("ffmpeg nicht installiert")
        (self.snap / "gross.png").write_bytes(ts.png(2000, 1000))
        r = hw.Werkzeugkasten(self.projekt, self.tmp / "skills", hf=[], ffmpeg=ffmpeg).ausfuehren(
            "bild_ansehen", {"pfade": ["video/snapshots/gross.png"]})
        daten = base64.b64decode(r.bilder[0]["daten"])
        self.assertEqual(r.bilder[0]["mime"], "image/jpeg")
        self.assertEqual(hw.bild_masse(daten), (1024, 512))
        self.assertIn("2000×1000 → 1024×512", r)
        (self.snap / "klein.png").write_bytes(ts.png(300, 200) + b"\x00" * hw.BILD_BYTES)     # groß, aber kleine Kante
        r = hw.Werkzeugkasten(self.projekt, self.tmp / "skills", hf=[], ffmpeg=ffmpeg).ausfuehren(
            "bild_ansehen", {"pfade": ["video/snapshots/klein.png"]})
        self.assertEqual(hw.bild_masse(base64.b64decode(r.bilder[0]["daten"])), (300, 200), "nie vergrößern")

    def test_ohne_ffmpeg_zu_gross(self):
        (self.snap / "riesig.png").write_bytes(ts.png(2000, 1000) + b"\x00" * hw.BILD_HART)
        self.assertTrue(self.k.ausfuehren("bild_ansehen", {"pfade": ["video/snapshots/riesig.png"]}).startswith("VERWEIGERT"))


class Wiederholung(unittest.TestCase):
    def test_skill_und_datei_nur_einmal(self):
        tmp = Path(tempfile.mkdtemp(prefix="hf_wdh_"))
        (tmp / "skills" / "hyperframes").mkdir(parents=True)
        skill = tmp / "skills" / "hyperframes" / "SKILL.md"
        skill.write_text("A" * 50000, "utf-8")
        k = hw.Werkzeugkasten(tmp / "p", tmp / "skills", hf=[])
        erst = k.ausfuehren("skill_lesen", {"skill": "hyperframes"})
        self.assertGreater(len(erst), 39000)
        self.assertEqual(k.ausfuehren("skill_lesen", {"skill": "hyperframes", "datei": "SKILL.md"}), hw.WIEDERHOLT)
        self.assertGreater(len(k.ausfuehren("skill_lesen", {"skill": "hyperframes", "ab": 40000})), 9000, "nächste Seite ist neu")
        skill.write_text("B" * 100, "utf-8")
        self.assertEqual(k.ausfuehren("skill_lesen", {"skill": "hyperframes"}), "B" * 100, "geänderte Datei kommt wieder")
        # eigene Datei: direkt nach dem Schreiben nur der Hinweis, nach einer Änderung von außen der neue Inhalt
        k.ausfuehren("datei_schreiben", {"pfad": "video/index.html", "inhalt": "<p>1</p>"})
        self.assertEqual(k.ausfuehren("datei_lesen", {"pfad": "video/index.html"}), hw.WIEDERHOLT)
        (tmp / "p" / "video" / "index.html").write_text("<p>2</p>", "utf-8")       # z. B. durch hyperframes add
        self.assertEqual(k.ausfuehren("datei_lesen", {"pfad": "video/index.html"}), "<p>2</p>")
        self.assertEqual(k.ausfuehren("datei_lesen", {"pfad": "video/index.html"}), hw.WIEDERHOLT)
        # ein neuer Lauf (neuer Werkzeugkasten) liest wieder alles
        self.assertEqual(hw.Werkzeugkasten(tmp / "p", tmp / "skills", hf=[]).ausfuehren(
            "datei_lesen", {"pfad": "video/index.html"}), "<p>2</p>")


class Mcp(unittest.TestCase):
    def test_stdio_server(self):
        tmp = Path(tempfile.mkdtemp(prefix="hf_mcp_"))
        (tmp / "skills").mkdir()
        proc = subprocess.Popen([sys.executable, "-I", str(PAKET / "hyperframes_mcp.py"), "--projekt", str(tmp / "p"),
                                 "--skills", str(tmp / "skills")], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        try:
            def rpc(nid, methode, params=None):
                msg = {"jsonrpc": "2.0", "method": methode, **({"id": nid} if nid is not None else {}), "params": params or {}}
                proc.stdin.write((json.dumps(msg) + "\n").encode())
                proc.stdin.flush()
                return json.loads(proc.stdout.readline()) if nid is not None else None

            r = rpc(1, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t"}})
            self.assertEqual(r["result"]["serverInfo"]["name"], "hf")
            rpc(None, "notifications/initialized")
            namen = [t["name"] for t in rpc(2, "tools/list")["result"]["tools"]]
            self.assertEqual(set(namen), {"skills_liste", "skill_lesen", "ordner_auflisten", "datei_lesen", "datei_schreiben",
                                          "hyperframes_ausfuehren", "bild_ansehen"})
            r = rpc(3, "tools/call", {"name": "datei_schreiben", "arguments": {"pfad": "video/a.html", "inhalt": "ok"}})
            self.assertFalse(r["result"]["isError"])
            self.assertEqual((tmp / "p" / "video" / "a.html").read_text("utf-8"), "ok")
            r = rpc(4, "tools/call", {"name": "datei_lesen", "arguments": {"pfad": "../../x"}})
            self.assertTrue(r["result"]["isError"])
            r = rpc(5, "tools/call", {"name": "hyperframes_ausfuehren", "arguments": {"befehl": "publish"}})
            self.assertTrue(r["result"]["isError"])
            self.assertIn("error", rpc(6, "gibt/es/nicht"))
            (tmp / "p" / "video" / "snapshots").mkdir(parents=True)
            (tmp / "p" / "video" / "snapshots" / "f.png").write_bytes(ts.png(5, 5))
            r = rpc(7, "tools/call", {"name": "bild_ansehen", "arguments": {}})["result"]
            self.assertFalse(r["isError"])
            self.assertEqual([c["type"] for c in r["content"]], ["text", "image"])
            self.assertEqual((r["content"][1]["mimeType"], base64.b64decode(r["content"][1]["data"])), ("image/png", ts.png(5, 5)))
            r = rpc(8, "tools/call", {"name": "bild_ansehen", "arguments": {"pfade": ["../../x.png"]}})["result"]
            self.assertTrue(r["isError"])
            self.assertEqual([c["type"] for c in r["content"]], ["text"])
        finally:
            proc.stdin.close()
            proc.wait(timeout=10)

    def test_claude_argumente(self):
        args = assistent.claude_argumente("claude", "sonnet", "C:/x/mcp.json")
        self.assertEqual(args[args.index("--tools") + 1], "", "keine eingebauten Werkzeuge (Bash, Write …)")
        self.assertIn("--strict-mcp-config", args)
        self.assertEqual(args[args.index("--allowedTools") + 1], "mcp__hf", "nur die eigenen MCP-Werkzeuge")
        self.assertEqual(args[args.index("--mcp-config") + 1], "C:/x/mcp.json")
        self.assertEqual(args[args.index("--max-turns") + 1], str(assistent.HF_MAX_RUNDEN))
        args = assistent.claude_argumente("claude", "sonnet", "C:/x/mcp.json", max_runden=12)
        self.assertEqual(args[args.index("--max-turns") + 1], "12")
        ohne = assistent.claude_argumente("claude", "sonnet")
        self.assertNotIn("--mcp-config", ohne)
        self.assertNotIn("--allowedTools", ohne)
        tmp = Path(tempfile.mkdtemp(prefix="hf_cfg_"))
        cfg = json.loads(assistent.mcp_config_schreiben(tmp / "m.json", "py.exe", tmp / "p", tmp / "s").read_text("utf-8"))
        self.assertEqual(list(cfg["mcpServers"]), ["hf"])
        self.assertEqual(cfg["mcpServers"]["hf"]["args"][:2], ["-I", str(PAKET / "hyperframes_mcp.py")])
        self.assertNotIn("--ffmpeg", cfg["mcpServers"]["hf"]["args"])
        cfg = json.loads(assistent.mcp_config_schreiben(tmp / "m.json", "py.exe", tmp / "p", tmp / "s", "C:/ff/ffmpeg.exe").read_text("utf-8"))
        self.assertEqual(cfg["mcpServers"]["hf"]["args"][-2:], ["--ffmpeg", "C:/ff/ffmpeg.exe"])


class FakeAntwort(io.BytesIO):
    def __init__(self, ereignisse):
        super().__init__(b"".join(b"data: " + json.dumps(e).encode() + b"\n\n" for e in ereignisse) + b"data: [DONE]\n\n")


class Kreislauf(unittest.TestCase):
    def setUp(self):
        self.alt = assistent._or_oeffnen
        self.tmp = Path(tempfile.mkdtemp(prefix="hf_kreis_"))
        self.kasten = hw.Werkzeugkasten(self.tmp / "p", self.tmp / "s", hf=[])

    def tearDown(self):
        assistent._or_oeffnen = self.alt

    def test_werkzeuge_im_kreislauf(self):
        anfragen = []
        runden = [
            [{"choices": [{"delta": {"content": "Ich lege an."}}]},
             {"choices": [{"delta": {"reasoning_details": [{"type": "reasoning.encrypted", "data": "ab", "index": 0}]}}]},
             {"choices": [{"delta": {"tool_calls": [{"index": 0, "id": "c1", "function": {"name": "datei_schreiben", "arguments": '{"pfad": "vid'}}]}}]},
             {"choices": [{"delta": {"tool_calls": [{"index": 0, "function": {"arguments": 'eo/index.html", "inhalt": "<p>Hi</p>"}'}}]}}]},
             {"choices": [{"delta": {"tool_calls": [{"index": 1, "id": "c2", "function": {"name": "datei_lesen", "arguments": '{"pfad": "../x"}'}}]}}]},
             {"usage": {"cost": 0.001}}],
            [{"choices": [{"delta": {"content": "Fertig."}}]}, {"usage": {"cost": 0.002}}],
        ]

        def fake(key, koerper, basis):
            anfragen.append(json.loads(json.dumps(koerper)))
            return FakeAntwort(runden[len(anfragen) - 1]), None

        assistent._or_oeffnen = fake
        ev = list(assistent.openrouter_agent("k", "m", [{"role": "system", "content": "S"}], self.kasten, threading.Event()))
        arten = [a for a, _ in ev]
        self.assertEqual((self.tmp / "p" / "video" / "index.html").read_text("utf-8"), "<p>Hi</p>")
        self.assertIn("schritt", arten)
        self.assertTrue(any(a == "schritt" and str(w).startswith("⚠ VERWEIGERT") for a, w in ev), "Ausbruch gemeldet")
        self.assertEqual(ev[-1][0], "ende")
        self.assertEqual((ev[-1][1]["kosten"], ev[-1][1]["runden"]), (0.003, 2))
        self.assertEqual([w for a, w in ev if a == "status"], ["Runde 1/60 · 0,001 $", "Runde 2/60 · 0,003 $"])
        self.assertNotIn("cache_control", anfragen[0], "nur bei Anthropic/Gemini")
        self.assertEqual("".join(w for a, w in ev if a == "text"), "Ich lege an.\n\nFertig.")
        self.assertEqual(anfragen[0]["tools"][0]["type"], "function")
        zweite = anfragen[1]["messages"]
        self.assertEqual(zweite[1]["role"], "assistant")
        self.assertEqual([t["id"] for t in zweite[1]["tool_calls"]], ["c1", "c2"])
        self.assertEqual(zweite[1]["reasoning_details"], [{"type": "reasoning.encrypted", "data": "ab", "index": 0}])
        self.assertEqual([m["role"] for m in zweite[2:]], ["tool", "tool"])
        self.assertTrue(zweite[3]["content"].startswith("VERWEIGERT"))

    def test_rundenlimit_und_abbruch(self):
        immer = [{"choices": [{"delta": {"tool_calls": [{"index": 0, "id": "x", "function": {"name": "skills_liste", "arguments": "{}"}}]}}]}]
        assistent._or_oeffnen = lambda k, kb, b: (FakeAntwort(immer), None)
        ev = list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event(), max_runden=3))
        self.assertEqual(ev[-1][0], "ende")
        self.assertIn("Rundenlimit", "".join(w for a, w in ev if a == "text"))
        ab = threading.Event()
        ab.set()
        ev = list(assistent.openrouter_agent("k", "m", [], self.kasten, ab))
        self.assertEqual(ev[-1], ("fehler", "Abgebrochen."))
        assistent._or_oeffnen = lambda k, kb, b: (None, "OpenRouter 404: No endpoints found that support tool use")
        self.assertEqual(list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event()))[-1][0], "fehler")


class KreislaufBilderUndKosten(unittest.TestCase):
    def setUp(self):
        self.alt = assistent._or_oeffnen
        self.tmp = Path(tempfile.mkdtemp(prefix="hf_kreis2_"))
        (self.tmp / "p" / "video" / "snapshots").mkdir(parents=True)
        (self.tmp / "p" / "video" / "snapshots" / "f1.png").write_bytes(ts.png(3, 3))
        self.kasten = hw.Werkzeugkasten(self.tmp / "p", self.tmp / "s", hf=[], ffmpeg="")

    def tearDown(self):
        assistent._or_oeffnen = self.alt

    @staticmethod
    def aufruf(nid, name, args, usage=None):
        e = [{"choices": [{"delta": {"tool_calls": [{"index": 0, "id": nid, "function": {"name": name, "arguments": json.dumps(args)}}]}}]}]
        return e + ([{"usage": usage}] if usage else [])

    def test_bild_als_folgenachricht_und_ausblenden(self):
        anfragen = []
        runden = [self.aufruf("b1", "bild_ansehen", {}, {"cost": 0.01, "prompt_tokens": 1000}),
                  self.aufruf("l1", "ordner_auflisten", {}, {"cost": 0.01, "prompt_tokens": 2000,
                                                              "prompt_tokens_details": {"cached_tokens": 1000}}),
                  [{"choices": [{"delta": {"content": "Sieht gut aus."}}]}, {"usage": {"cost": 0.01, "prompt_tokens": 2000,
                                                                                         "prompt_tokens_details": {"cached_tokens": 2000}}}]]

        def fake(key, koerper, basis):
            anfragen.append(json.loads(json.dumps(koerper)))
            return FakeAntwort(runden[len(anfragen) - 1]), None
        assistent._or_oeffnen = fake
        ev = list(assistent.openrouter_agent("k", "google/gemini-x", [{"role": "system", "content": "S"}], self.kasten,
                                             threading.Event()))
        self.assertEqual(ev[-1][0], "ende")
        self.assertEqual(anfragen[0]["cache_control"], {"type": "ephemeral"}, "Gemini: Prompt-Caching an")
        zweite = anfragen[1]["messages"]
        self.assertEqual([m["role"] for m in zweite], ["system", "assistant", "tool", "user"])
        self.assertIn("angehängt", zweite[2]["content"])
        self.assertIsInstance(zweite[2]["content"], str, "tool-Antworten bleiben Text")
        bild = zweite[3]["content"]
        self.assertEqual(bild[1]["type"], "image_url")
        self.assertEqual(bild[1]["image_url"]["url"], "data:image/png;base64," + base64.b64encode(ts.png(3, 3)).decode())
        dritte = anfragen[2]["messages"]
        self.assertEqual(dritte[3], {"role": "user", "content": assistent.BILDER_AUSGEBLENDET}, "gesehenes Bild nicht erneut bezahlen")
        self.assertEqual(len(dritte), 6)
        status = [w for a, w in ev if a == "status"]
        self.assertEqual(status[-1], "Runde 3/60 · 0,030 $ · 60 % aus dem Cache")
        self.assertEqual((ev[-1][1]["eingabe_tokens"], ev[-1][1]["cache_tokens"]), (5000, 3000))

    def test_modell_ohne_bilder(self):
        anfragen = []
        runden = [self.aufruf("b1", "bild_ansehen", {}), [{"choices": [{"delta": {"content": "ok"}}]}]]

        def fake(key, koerper, basis):
            anfragen.append(json.loads(json.dumps(koerper)))
            return FakeAntwort(runden[len(anfragen) - 1]), None
        assistent._or_oeffnen = fake
        list(assistent.openrouter_agent("k", "x/text", [], self.kasten, threading.Event(), bilder=False))
        self.assertNotIn("bild_ansehen", [t["function"]["name"] for t in anfragen[0]["tools"]])
        self.assertTrue(anfragen[1]["messages"][-1]["content"].startswith("VERWEIGERT"))
        self.assertNotIn("user", [m["role"] for m in anfragen[1]["messages"]])

    def test_kostenbremse_und_rundenlimit(self):
        assistent._or_oeffnen = lambda k, kb, b: (FakeAntwort(self.aufruf("x", "skills_liste", {}, {"cost": 0.2})), None)
        ev = list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event(), max_kosten=0.5))
        self.assertTrue(ev[-1][1]["kostenbremse"])
        self.assertEqual(ev[-1][1]["runden"], 3, "nach 0,6 $ ist Schluss")
        self.assertIn("Kostenbremse", "".join(w for a, w in ev if a == "text"))
        ev = list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event(), max_runden=2))
        self.assertEqual(ev[-1][1]["runden"], 2)
        self.assertEqual([w for a, w in ev if a == "status"][-1], "Runde 2/2 · 0,400 $")

    def test_cache_rueckfall_bei_400(self):
        anfragen = []

        def fake(key, koerper, basis):
            anfragen.append(json.loads(json.dumps(koerper)))
            if "cache_control" in koerper:
                return None, "OpenRouter 400: cache_control is not supported"
            return FakeAntwort([{"choices": [{"delta": {"content": "ok"}}]}]), None
        assistent._or_oeffnen = fake
        ev = list(assistent.openrouter_agent("k", "anthropic/claude-x", [], self.kasten, threading.Event()))
        self.assertEqual(ev[-1][0], "ende")
        self.assertEqual(["cache_control" in a for a in anfragen], [True, False])
        anfragen.clear()
        list(assistent.openrouter_agent("k", "anthropic/claude-x", [], self.kasten, threading.Event(), cache=False))
        self.assertEqual(["cache_control" in a for a in anfragen], [False])

    def test_abbruch_des_anbieters_einmal_wiederholen(self):
        anfragen = []
        antworten = [[{"error": {"message": "The operation was aborted"}}],
                     [{"choices": [{"delta": {"content": "ok"}}]}, {"usage": {"cost": 0.01}}]]

        def fake(key, koerper, basis):
            anfragen.append(1)
            return FakeAntwort(antworten[len(anfragen) - 1]), None
        assistent._or_oeffnen = fake
        ev = list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event()))
        self.assertEqual(len(anfragen), 2)
        self.assertEqual(ev[-1][0], "ende")
        self.assertTrue(any(a == "schritt" and "neuer Versuch" in w for a, w in ev))
        # zweimal hintereinander → Fehler, keine Endlosschleife
        anfragen.clear()
        antworten[1] = antworten[0]
        ev = list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event()))
        self.assertEqual((len(anfragen), ev[-1]), (2, ("fehler", "OpenRouter: The operation was aborted")))
        anfragen.clear()
        assistent._or_oeffnen = lambda k, kb, b: (anfragen.append(1), (None, "OpenRouter 502: Bad gateway"))[1]
        self.assertEqual(list(assistent.openrouter_agent("k", "m", [], self.kasten, threading.Event()))[-1][0], "fehler")
        self.assertEqual(len(anfragen), 2)

    def test_anweisungen_sichtkontrolle(self):
        mit = assistent.hf_anweisungen("- hyperframes: x", "P", "", None)
        self.assertIn("bild_ansehen", mit)
        self.assertIn("befehl='snapshot'", mit)
        self.assertIn("nur einmal", mit)
        ohne = assistent.hf_anweisungen("- hyperframes: x", "P", "", None, bilder=False)
        self.assertNotIn("bild_ansehen", ohne)
        self.assertIn("4. Rendere", ohne)


class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.alt_data = server.DATA
        server.DATA = Path(tempfile.mkdtemp(prefix="hf_server_"))
        server.verzeichnisse()
        server.KATALOG.update({"modelle": [ts.FAKE], "stand": time.time(), "fehler": ""})
        server.VKATALOG.update({"modelle": [ts.FAKEV], "stand": time.time(), "fehler": ""})
        server.schreib_json("benutzer.json", {"hf": {"name": "H", "rolle": "admin"}})
        cls.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        token, cls.csrf = server.sitzung_neu("hf")
        cls.cookie = f"bildgen_sid={token}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        server.DATA = cls.alt_data

    def setUp(self):
        self.alt = (server.assistent.claude_strom, server.assistent.openrouter_agent, server.assistent.claude_finden,
                    server.api_key, hw.Werkzeugkasten.hyperframes_ausfuehren, dict(server.CHATMODELLE))
        server.assistent.claude_finden = lambda eigen="": "C:/fake/claude.exe"
        server.api_key = lambda: "sk-or-test"

        def fake_init(kasten, befehl, argumente=None, ordner="."):      # simuliert „hyperframes init video“
            if befehl == "init":
                (kasten.projekt / argumente[0]).mkdir(parents=True, exist_ok=True)
                (kasten.projekt / argumente[0] / "index.html").write_text("<html></html>", "utf-8")
            return "ok"
        hw.Werkzeugkasten.hyperframes_ausfuehren = fake_init

    def tearDown(self):
        (server.assistent.claude_strom, server.assistent.openrouter_agent, server.assistent.claude_finden,
         server.api_key, hw.Werkzeugkasten.hyperframes_ausfuehren, alt_chatmodelle) = self.alt
        server.CHATMODELLE.clear()
        server.CHATMODELLE.update(alt_chatmodelle)

    def req(self, pfad, body=None):
        return ts.Http.req(self, pfad, body, self.cookie, self.csrf)

    def senden(self, cid, text):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=20)
        c.request("POST", f"/api/chat/{cid}/senden", body=json.dumps({"text": text}),
                  headers={"Host": f"127.0.0.1:{self.port}", "Cookie": self.cookie, "X-CSRF": self.csrf,
                           "Content-Type": "application/json"})
        r = c.getresponse()
        return r.status, [json.loads(z) for z in r.read().decode().splitlines() if z.strip()]

    def test_onboarding_und_bau(self):
        _, j, _, _ = self.req("/api/chats", {"modus": "hyperframes"})
        cid = j["chat"]["id"]
        st, j, _, _ = self.req("/api/upload", {"daten": "data:image/png;base64," + __import__("base64").b64encode(ts.png(4, 4)).decode(),
                                               "name": "logo.png"})
        self.assertEqual(st, 200, j)
        logo = j["id"]
        # ungültige Eingaben
        self.assertEqual(self.req("/api/hyperframes/start", {"chat": cid, "quelle": "rm -rf"})[0], 400)
        self.assertEqual(self.req("/api/hyperframes/start", {"chat": cid, "quelle": "klon"})[0], 400, "ohne Analyse kein Clone")
        self.assertEqual(self.req("/api/hyperframes/start", {"chat": cid, "quelle": "webseite", "webseite": "http://127.0.0.1:8796"})[0], 400)
        self.assertEqual(self.req("/api/hyperframes/start", {"chat": cid, "quelle": "idee", "idee": "x", "format": "4:3"})[0], 400)
        st, j, _, _ = self.req("/api/hyperframes/start", {"chat": cid, "quelle": "idee", "idee": "Goldener Titel „Sale“",
                                                          "laenge": 99, "format": "9:16", "logo": logo, "marke": "Gold auf Schwarz"})
        self.assertEqual(st, 200, j)
        self.assertIn("5 Sekunden" if False else "30 Sekunden", j["auftrag"], "Länge auf 5–30 s begrenzt")
        projekt = server.hf_wurzel("hf") / j["projekt"]
        brief = (projekt / "video" / "BRIEF.md").read_text("utf-8")
        self.assertIn("aspect: 1080x1920", brief)
        self.assertIn("length: 30s", brief)
        self.assertIn("Gold auf Schwarz", brief)
        self.assertTrue((projekt / "video" / "assets" / "logo.png").is_file())

        # Bau über die Claude-CLI: MCP-Konfiguration zeigt auf genau dieses Projekt
        gesehen = {}

        def claude_hf(exe, modell, prompt, ordner, tok, abbruch, zeitlimit=600, mcp_config="", max_runden=0):
            cfg = json.loads(Path(mcp_config).read_text("utf-8"))["mcpServers"]["hf"]
            gesehen.update(prompt=prompt, args=cfg["args"], runden=max_runden)
            (projekt / "video" / "renders").mkdir(exist_ok=True)
            (projekt / "video" / "renders" / "titel.mp4").write_bytes(b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 4000)
            yield "schritt", "hyperframes render -o renders/titel.mp4"
            yield "text", "Fertig gerendert."
            yield "ende", {}

        server.assistent.claude_strom = claude_hf
        st, ev = self.senden(cid, j["auftrag"])
        self.assertEqual(st, 200)
        self.assertEqual([e["t"] for e in ev], ["schritt", "text", "video", "ende"], ev)
        self.assertEqual(gesehen["args"][gesehen["args"].index("--projekt") + 1], str(projekt))
        self.assertIn("# Installierte Skills", gesehen["prompt"])
        self.assertIn("BRIEF.md", gesehen["prompt"])
        self.assertIn("bild_ansehen", gesehen["prompt"], "Claude sieht Bilder über MCP")
        self.assertEqual(gesehen["runden"], server.einstellungen()["hf_max_runden"])
        self.assertEqual(list((server.DATA / "assistent_arbeit").glob("mcp_*.json")), [], "MCP-Konfiguration wird aufgeräumt")
        vid = ev[2]["id"]
        b = server.bild_finden(vid)
        self.assertEqual((b["typ"], b["modell"], b["owner"]), ("video", "hyperframes", "hf"))
        _, j2, _, _ = self.req(f"/api/chat/{cid}")
        letzte = j2["chat"]["nachrichten"][-1]
        self.assertEqual((letzte["videos"], letzte["schritte"]), ([vid], ["hyperframes render -o renders/titel.mp4"]))
        # derselbe Render wird nicht doppelt übernommen
        st, ev = self.senden(cid, "Danke")
        self.assertNotIn("video", [e["t"] for e in ev])

    def test_openrouter_braucht_werkzeuge(self):
        _, j, _, _ = self.req("/api/chats", {"modus": "hyperframes"})
        cid = j["chat"]["id"]
        s = server.einstellungen()
        server.schreib_json("einstellungen.json", {**s, "assistent_claude": False, "assistent_or_modell": "x/ohne-tools"})
        server.CHATMODELLE.update({"stand": time.time(), "liste": [
            {"id": "x/ohne-tools", "name": "Ohne", "tools": False, "frei": False, "erstellt": 1},
            {"id": "anthropic/claude-sonnet-9", "name": "Sonnet", "tools": True, "frei": False, "erstellt": 2}]})
        aufgerufen = []
        server.assistent.openrouter_agent = lambda *a, **k: aufgerufen.append(a) or iter([("ende", {})])
        try:
            st, ev = self.senden(cid, "Baue einen Titel")
            self.assertEqual(ev[-1]["t"], "fehler")
            self.assertIn("anthropic/claude-sonnet-9", ev[-1]["d"])
            self.assertEqual(aufgerufen, [])
            server.schreib_json("einstellungen.json", {**s, "assistent_claude": False, "assistent_or_modell": "anthropic/claude-sonnet-9"})

            server.schreib_json("einstellungen.json", {**server.einstellungen(), "hf_max_runden": 17, "hf_kosten_limit": 0.25,
                                                       "hf_cache": False})
            optionen = {}

            def agent(key, modell, nachrichten, kasten, abbruch, basis="", **k):
                aufgerufen.append(kasten)
                optionen.update(k)
                yield "status", "Runde 1/17 · 0,010 $"
                yield "text", "ok"
                yield "ende", {"kosten": 0.01}
            server.assistent.openrouter_agent = agent
            st, ev = self.senden(cid, "Baue einen Titel")
            self.assertEqual(ev[-1]["t"], "ende", ev)
            self.assertIn({"t": "status", "d": "Runde 1/17 · 0,010 $"}, ev)
            self.assertIsInstance(aufgerufen[0], hw.Werkzeugkasten)
            self.assertEqual(aufgerufen[0].projekt.parent, server.hf_wurzel("hf"))
            self.assertEqual((optionen["max_runden"], optionen["max_kosten"], optionen["cache"]), (17, 0.25, False))
            self.assertFalse(optionen["bilder"], "Modell ohne vision im Katalog → keine Bilder")
            _, j2, _, _ = self.req(f"/api/chat/{cid}")
            self.assertEqual(j2["chat"]["nachrichten"][-1]["status"], "Runde 1/17 · 0,010 $")
        finally:
            server.schreib_json("einstellungen.json", s)

    def test_einstellungen_kostenbremse(self):
        s = server.einstellungen()
        try:
            st, j, _, _ = self.req("/api/einstellungen", {"hf_max_runden": 999, "hf_kosten_limit": -3, "hf_cache": False})
            self.assertEqual(st, 200, j)
            neu = server.einstellungen()
            self.assertEqual((neu["hf_max_runden"], neu["hf_kosten_limit"], neu["hf_cache"]), (150, 0.0, False))
            self.assertEqual(self.req("/api/einstellungen", {"hf_kosten_limit": "viel"})[0], 400)
        finally:
            server.schreib_json("einstellungen.json", s)

    def test_normaler_chat_ohne_werkzeuge(self):
        _, j, _, _ = self.req("/api/chats", {"modus": "assistent"})
        gesehen = {}

        def claude(exe, modell, prompt, ordner, tok, abbruch, zeitlimit=600, mcp_config="", **k):
            gesehen["mcp"] = mcp_config
            yield "text", "Hallo"
            yield "ende", {}
        server.assistent.claude_strom = claude
        self.senden(j["chat"]["id"], "Hallo")
        self.assertEqual(gesehen["mcp"], "", "Werkzeuge nur im HyperFrames-Modus")


if __name__ == "__main__":
    unittest.main()
