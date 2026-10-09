"""Tests für Audio/Musik im HyperFrames-Onboarding: Takt, Wortzeiten, Einbinden, Projektordner, Film in der Bibliothek.

Laufen offline: die HyperFrames-CLI (init, beats, transcribe) wird simuliert; ffmpeg wird nur genutzt, wenn vorhanden.
Aufruf:  python -m unittest discover -s tests -v
"""
import base64
import json
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
ha = server.ha
hw = server.hw
FFMPEG = server.wk.pfad("ffmpeg")

GERUEST = """<!doctype html><html><body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="10"
      data-width="1920"
      data-height="1080"
    >
      <h1 id="t" class="clip" data-start="0" data-duration="5">T</h1>
    </div></body></html>"""


class Bausteine(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="hf_audio_"))

    def test_takt(self):
        f = self.tmp / "b.json"
        schlaege = [{"time": round(0.5 + i * 0.25, 3), "strength": 0.9 if i % 4 == 0 else 0.3} for i in range(60)]
        f.write_text(json.dumps({"version": 1, "audio": "musik.mp3", "beats": schlaege}), "utf-8")
        md = ha.takt_md(f, 10)
        self.assertIn("Tempo ≈ 240 BPM", md)
        self.assertIn("gefühlt ≈ 120 BPM", md, "Achtel-Zählung wird erkannt")
        schnitte = [float(x) for x in md.split("## Vorschlag Schnittpunkte")[1].split("\n")[1].split(", ")]
        self.assertEqual(schnitte[0], 0.5)
        self.assertTrue(all(b - a >= 1.2 for a, b in zip(schnitte, schnitte[1:])), "Mindestabstand")
        self.assertTrue(all(t <= 9.2 for t in schnitte), "kein Schnitt kurz vor Schluss")
        self.assertNotIn("15.25/", md, "nur Schläge im Videofenster")
        f.write_text(json.dumps({"beats": []}), "utf-8")
        self.assertIn("Keine Schläge", ha.takt_md(f, 10))

    def test_text(self):
        f = self.tmp / "t.json"
        woerter = [("Wir", 0.1, 0.3), ("sind", 0.3, 0.5), ("eins.", 0.5, 0.9), ("Jeder", 2.0, 2.3), ("Ort", 2.3, 2.6)]
        f.write_text(json.dumps([{"text": t, "start": a, "end": b} for t, a, b in woerter]), "utf-8")
        md = ha.text_md(f)
        self.assertIn("0.10–  0.90  Wir sind eins.", md)
        self.assertIn("2.00–  2.60  Jeder Ort", md)

    def test_einbinden(self):
        f = self.tmp / "index.html"
        f.write_text(GERUEST, "utf-8")
        ha.einbinden(f, 12.5)
        html = f.read_text("utf-8")
        self.assertIn('data-duration="12.5"', html.split('id="musik"')[0], "Gesamtlänge gesetzt")
        self.assertIn('<audio id="musik" data-timeline-role="music" src="assets/musik.mp3"', html)
        self.assertLess(html.index('id="musik"'), html.index('id="t"'), "Musikspur im #root")
        ha.einbinden(f, 12.5)
        self.assertEqual(f.read_text("utf-8").count('id="musik"'), 1, "nicht doppelt")

    def test_songinfo_und_whisper(self):
        a = self.tmp / "Mein Song.mp3"
        a.write_bytes(b"x")
        (self.tmp / "Anderes.txt").write_text("x", "utf-8")
        self.assertIsNone(ha.songinfo_finden(a))
        (self.tmp / "Mein Song STYLE.txt").write_text("Text", "utf-8")
        self.assertEqual(ha.songinfo_finden(a).name, "Mein Song STYLE.txt")
        exe = self.tmp / "whisper-cli.exe"
        exe.write_bytes(b"x")
        lokal = server.wk.pfad("whisper-cli")
        self.assertEqual(ha.whisper_finden(str(exe)), lokal or str(exe), "der Werkzeugordner im Repo geht vor")
        self.assertEqual(ha.whisper_finden(str(self.tmp / "fehlt.exe")), lokal)

    @unittest.skipUnless(FFMPEG and server.wk.pfad("ffprobe"), "ffmpeg fehlt")
    def test_ausschnitt(self):
        q = self.tmp / "ton.wav"
        subprocess.run([FFMPEG, "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=8", str(q)], check=True)
        self.assertAlmostEqual(ha.dauer(server.wk.pfad("ffprobe"), q), 8, delta=0.1)
        z = self.tmp / "a" / "musik.mp3"
        ha.ausschnitt(FFMPEG, q, z, 2, 3)
        self.assertAlmostEqual(ha.dauer(server.wk.pfad("ffprobe"), z), 3, delta=0.15)


@unittest.skipUnless(FFMPEG and server.wk.pfad("ffprobe"), "ffmpeg fehlt")
class Onboarding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.alt_data = server.DATA
        server.DATA = Path(tempfile.mkdtemp(prefix="hf_audio_srv_"))
        server.verzeichnisse()
        server.KATALOG.update({"modelle": [ts.FAKE], "stand": time.time(), "fehler": ""})
        server.VKATALOG.update({"modelle": [ts.FAKEV], "stand": time.time(), "fehler": ""})
        server.schreib_json("benutzer.json", {server.zugang.KONTO: {"name": "W", "rolle": "admin"}})
        cls.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        token, cls.csrf = server.sitzung_neu(server.zugang.KONTO)
        cls.cookie = f"bildgen_sid={token}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        server.DATA = cls.alt_data

    def setUp(self):
        self.alt = (hw.Werkzeugkasten.hyperframes_ausfuehren, ha.cli, ha.whisper_finden, ha.whisper_modell_bereit)
        self.aufrufe = []

        def fake_init(kasten, befehl, argumente=None, ordner="."):
            (kasten.projekt / "video").mkdir(parents=True, exist_ok=True)
            (kasten.projekt / "video" / "index.html").write_text(GERUEST, "utf-8")
            return "ok"

        def fake_cli(befehl, argumente, cwd, zeitlimit=300, whisper=""):
            self.aufrufe.append((befehl, argumente, whisper))
            # wie die echte CLI 0.8.143: beats/<src-Pfad>.json und transcript.json neben der Eingabedatei
            if befehl == "beats":
                (cwd / "beats" / "assets").mkdir(parents=True, exist_ok=True)
                (cwd / "beats" / "assets" / "musik.mp3.json").write_text(json.dumps(
                    {"beats": [{"time": i * 0.5, "strength": 0.9} for i in range(1, 30)]}), "utf-8")
            if befehl == "transcribe":
                (cwd / "assets" / "transcript.json").write_text(json.dumps([{"text": "Hallo", "start": 0.2, "end": 0.6}]), "utf-8")
            return 0, "{}"

        hw.Werkzeugkasten.hyperframes_ausfuehren = fake_init
        ha.cli = fake_cli
        ha.whisper_finden = lambda eigen="", programm=None: "C:/fake/whisper-cli.exe"
        ha.whisper_modell_bereit = lambda exe="": True

    def tearDown(self):
        hw.Werkzeugkasten.hyperframes_ausfuehren, ha.cli, ha.whisper_finden, ha.whisper_modell_bereit = self.alt

    def req(self, pfad, body=None):
        return ts.Http.req(self, pfad, body, self.cookie, self.csrf)

    def audio_upload(self, sekunden=12) -> str:
        musik = server.uploads_ordner() / "musik"
        musik.mkdir(parents=True, exist_ok=True)
        subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-f", "lavfi", "-i", f"sine=frequency=330:duration={sekunden}",
                        str(musik / "Mein Song.mp3")], check=True)
        (musik / "Mein Song LYRICS.txt").write_text("Hallo Welt", "utf-8")
        _, j, _, _ = self.req("/api/uploads?typ=audio")
        return next(u["id"] for u in j["uploads"] if u["dateiname"] == "Mein Song.mp3")

    def test_audio_onboarding(self):
        aid = self.audio_upload()
        _, j, _, _ = self.req("/api/chats", {"modus": "hyperframes"})
        cid = j["chat"]["id"]
        basis = {"chat": cid, "quelle": "idee", "idee": "Lyric-Video", "format": "9:16"}
        self.assertEqual(self.req("/api/hyperframes/start", {**basis, "audio": "fehlt00000"})[0], 400)
        self.assertEqual(self.req("/api/hyperframes/start", {**basis, "audio": aid, "audio_art": "rm"})[0], 400)
        self.assertEqual(self.req("/api/hyperframes/start", {**basis, "audio": aid, "audio_ab": 99})[0], 400, "Start hinter dem Ende")
        st, j, _, _ = self.req("/api/hyperframes/start", {**basis, "audio": aid, "audio_art": "de", "audio_ab": 2, "audio_ganz": True})
        self.assertEqual(st, 200, j)
        self.assertEqual(j["workflow"], "music-to-video")
        self.assertIn("TAKT.md", j["auftrag"])
        projekt = server.hf_wurzel(server.zugang.KONTO) / j["projekt"]
        self.assertEqual(projekt.parent, server.uploads_ordner() / "hyperframe-filme", "alles im Extraordner")
        video = projekt / "video"
        self.assertAlmostEqual(server.ha.dauer(server.wk.pfad("ffprobe"), video / "assets" / "musik.mp3"), 10, delta=0.2,
                               msg="Länge = Audio ab Sekunde 2")
        brief = (video / "BRIEF.md").read_text("utf-8")
        for teil in ("audio: de", "length: 10s", "## Audio", "beats/TAKT.md", "transcript/TEXT.md", "assets/songinfo.txt"):
            self.assertIn(teil, brief)
        self.assertIn('id="musik"', (video / "index.html").read_text("utf-8"))
        self.assertTrue((video / "beats" / "TAKT.md").is_file())
        self.assertIn("Hallo", (video / "transcript" / "TEXT.md").read_text("utf-8"))
        self.assertEqual((video / "assets" / "songinfo.txt").read_text("utf-8"), "Hallo Welt")
        befehle = [a[0] for a in self.aufrufe]
        self.assertEqual(befehle, ["beats", "transcribe"])
        self.assertIn("de", self.aufrufe[1][1], "Sprache an whisper")
        self.assertEqual(self.aufrufe[1][2], "C:/fake/whisper-cli.exe")
        # Original bleibt in Uploads › musik, das Projekt erscheint nicht als einzelne Uploads
        _, j2, _, _ = self.req("/api/uploads")
        self.assertFalse([u for u in j2["uploads"] if "hyperframe-filme" in u["datei"]])
        self.assertTrue((server.uploads_ordner() / "musik" / "Mein Song.mp3").is_file())

        # Nur Takt: keine Transkription; Länge bleibt beim Regler, höchstens Audiolänge
        self.aufrufe.clear()
        _, j, _, _ = self.req("/api/chats", {"modus": "hyperframes"})
        st, j, _, _ = self.req("/api/hyperframes/start", {**basis, "chat": j["chat"]["id"], "audio": aid, "audio_art": "takt",
                                                          "laenge": 30})
        self.assertEqual(st, 200, j)
        self.assertEqual([a[0] for a in self.aufrufe], ["beats"])
        self.assertIn("length: 12s", (server.hf_wurzel(server.zugang.KONTO) / j["projekt"] / "video" / "BRIEF.md").read_text("utf-8"))

    def test_film_bleibt_im_projektordner(self):
        _, j, _, _ = self.req("/api/chats", {"modus": "hyperframes"})
        chat = server.chat_laden(server.zugang.KONTO, j["chat"]["id"])
        projekt = server.hf_projekt(server.zugang.KONTO, chat)
        (projekt / "video" / "renders").mkdir(parents=True)
        film = projekt / "video" / "renders" / "film.mp4"
        film.write_bytes(b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 4000)
        neu = server.hf_videos_uebernehmen(server.zugang.KONTO, chat)
        self.assertEqual(len(neu), 1)
        self.assertTrue(neu[0]["datei"].startswith("uploads/hyperframe-filme/"), neu[0]["datei"])
        self.assertEqual(server.medium_pfad(neu[0]).resolve(), film.resolve(), "keine Kopie in videos/")
        st, _, _, roh = self.req(f"/bild/{neu[0]['id']}")
        self.assertEqual((st, roh[:12]), (200, film.read_bytes()[:12]))
        self.assertEqual(server.hf_videos_uebernehmen(server.zugang.KONTO, chat), [], "nicht doppelt")


if __name__ == "__main__":
    unittest.main()
