"""Tests für den Werkzeugordner im Repo (werkzeugkiste.py): Orte, Umgebung, Prüfsummen, Übernehmen – offline.

Aufruf:  python -m unittest discover -s tests -v
"""
import hashlib
import json
import os
import shutil
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import werkzeugkiste as wk  # noqa: E402


class WerkzeugkisteTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.alt = os.environ.get("CINEMA_WERKZEUGE")
        os.environ["CINEMA_WERKZEUGE"] = str(self.tmp / "werkzeuge")

    def tearDown(self):
        if self.alt is None:
            os.environ.pop("CINEMA_WERKZEUGE", None)
        else:
            os.environ["CINEMA_WERKZEUGE"] = self.alt
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_standardort_liegt_im_repo(self):
        os.environ.pop("CINEMA_WERKZEUGE")
        repo = Path(wk.__file__).resolve().parents[3]          # …\PROMPTHEUS
        self.assertTrue(wk.ordner().resolve().is_relative_to(repo), wk.ordner())
        self.assertEqual(wk.ordner().name, "werkzeuge")

    def test_leer_heisst_nicht_eingerichtet(self):
        self.assertEqual(wk.pfad("ffmpeg"), "")
        self.assertEqual(wk.hyperframes_befehl(), [])
        st = wk.stand()
        self.assertFalse(st["ffmpeg"] or st["whisper"] or st["modell"] or st["hyperframes"])

    def test_umgebung_lenkt_heim_und_caches_um(self):
        (self.tmp / "werkzeuge" / "ffmpeg").mkdir(parents=True)
        (self.tmp / "werkzeuge" / "ffmpeg" / f"ffmpeg{wk.EXE}").write_bytes(b"x")
        env = wk.umgebung({"PATH": "X", "USERPROFILE": r"C:\Users\jemand", "HYPERFRAMES_WHISPER_PATH": "aussen"})
        w = self.tmp / "werkzeuge"
        for k in ("USERPROFILE", "HOME", "TEMP", "TMP", "TMPDIR", "npm_config_cache", "HYPERFRAMES_FONT_CACHE_DIR"):
            self.assertTrue(Path(env[k]).is_relative_to(w), k)
        self.assertNotIn("HYPERFRAMES_WHISPER_PATH", env, "kein whisper von außen")
        self.assertTrue(env["PATH"].startswith(str(w / "ffmpeg")))
        self.assertEqual(env["HYPERFRAMES_FFMPEG_PATH"], wk.pfad("ffmpeg"))
        self.assertEqual(Path(wk.modell_pfad()).parent, w / "heim" / ".cache" / "hyperframes" / "whisper" / "models")

    def test_laden_nur_https_und_erlaubte_hosts(self):
        for url in ("http://github.com/x", "https://example.com/x", "file:///c:/x", "https://127.0.0.1/x"):
            with self.assertRaises(wk.Fehler, msg=url):
                wk.laden(url, self.tmp / "x", "0" * 64)
        self.assertFalse((self.tmp / "x").exists())

    def test_zip_nur_gewaehlte_dateien_flach(self):
        z = self.tmp / "a.zip"
        with zipfile.ZipFile(z, "w") as f:
            f.writestr("Release/whisper-cli.exe", b"cli")
            f.writestr("Release/ggml.dll", b"dll")
            f.writestr("../../boese.dll", b"x")
            f.writestr("Release/main.exe", b"x")
        ziel = self.tmp / "ziel"
        genommen = wk._aus_zip(z, ziel, lambda n: n in ("whisper-cli.exe", "ggml.dll"))
        self.assertEqual(sorted(genommen), ["ggml.dll", "whisper-cli.exe"])
        self.assertFalse((self.tmp / "boese.dll").exists())
        self.assertEqual(sorted(p.name for p in ziel.iterdir()), ["ggml.dll", "whisper-cli.exe"])

    def test_einrichten_uebernimmt_eigene_quellen_ohne_download(self):
        q, qw = self.tmp / "ffmpeg-quelle", self.tmp / "whisper-quelle"
        for d, namen in ((q, (f"ffmpeg{wk.EXE}", f"ffprobe{wk.EXE}", "avcodec.dll", "liesmich.txt", f"yt-dlp{wk.EXE}")),
                         (qw, (f"whisper-cli{wk.EXE}", "ggml-cpu.dll", "whisper.dll", "SDL2.dll", "parakeet.dll"))):
            d.mkdir()
            for n in namen:
                (d / n).write_bytes(n.encode())
        r = wk.einrichten({"ffmpeg": str(q / f"ffmpeg{wk.EXE}"), "yt-dlp": str(q / f"yt-dlp{wk.EXE}"),
                           "whisper-cli": str(qw / f"whisper-cli{wk.EXE}")}, laden_ok=False, melden=lambda t: None)
        self.assertTrue(r["ffmpeg"].startswith("übernommen") and r["whisper"].startswith("übernommen"), r)
        w = self.tmp / "werkzeuge"
        self.assertEqual(sorted(p.name for p in (w / "ffmpeg").iterdir()),
                         sorted(["avcodec.dll", f"ffmpeg{wk.EXE}", f"ffprobe{wk.EXE}"]))
        self.assertEqual(sorted(p.name for p in (w / "whisper").iterdir()),
                         sorted(["ggml-cpu.dll", "whisper.dll", f"whisper-cli{wk.EXE}"]))
        self.assertTrue(wk.pfad("yt-dlp"))
        self.assertEqual(wk.einrichten({}, laden_ok=False, melden=lambda t: None)["ffmpeg"], "vorhanden")

    def test_pruefsumme_falsch_verwirft(self):
        f = self.tmp / "m.bin"
        f.write_bytes(b"modell")
        self.assertEqual(wk.sha256(f), hashlib.sha256(b"modell").hexdigest())

    def test_hyperframes_version_muss_passen(self):
        paket = self.tmp / "werkzeuge" / "hyperframes" / "node_modules" / "hyperframes"
        (paket / "bin").mkdir(parents=True)
        (paket / "bin" / "hyperframes.mjs").write_text("", "utf-8")
        (paket / "package.json").write_text(json.dumps({"version": "0.0.1"}), "utf-8")
        self.assertEqual(wk.hyperframes_befehl(), [], "falsche Version wird nicht gestartet")
        (paket / "package.json").write_text(json.dumps({"version": wk.HF_VERSION}), "utf-8")
        if wk.node():
            self.assertEqual(wk.hyperframes_befehl()[1], str(paket / "bin" / "hyperframes.mjs"))


if __name__ == "__main__":
    unittest.main()
