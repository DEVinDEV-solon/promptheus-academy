"""Tests für server.py — laufen offline (OpenRouter wird simuliert).

Aufruf:  python -m unittest discover -s tests -v   (im Ordner scripts/Bildgenerator)
"""
import base64
import http.client
import json
import os
import struct
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import zlib
from pathlib import Path

TMP = tempfile.mkdtemp(prefix="bildgen_test_")
os.environ["BILDGEN_DATA"] = TMP
os.environ["BILDGEN_ABLAGE"] = str(Path(TMP) / "Ablage")      # Tests schreiben nie in die echte Ablage
os.environ.pop("OPENROUTER_API_KEY", None)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server  # noqa: E402
server.zugang.EINLASS = Path(TMP) / "zugang" / "einlass.json"   # Tests legen Marken nie in den echten Programmordner
server.zugang.BINDUNG = Path(TMP) / "zugang" / "werkstatt.json"  # ohne Datei: nicht an die Werkstatt gebunden
server.lokal_stimme.installiert = lambda: False   # Tests unabhängig davon, ob Chatterbox hier installiert ist


def png(w=3, h=2):
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    roh = b"".join(b"\x00" + b"\xff\x00\x00" * w for _ in range(h))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(roh)) + chunk(b"IEND", b""))


FAKE = {
    "id": "test/bild-modell", "name": "Test Bild", "anbieter": "Test", "beschreibung": "x", "erstellt": 0,
    "referenzbilder": True,
    "parameter": {"aspect_ratio": {"typ": "liste", "werte": ["1:1", "16:9", "auto"]},
                  "quality": {"typ": "liste", "werte": ["low", "high"]},
                  "n": {"typ": "bereich", "min": 1, "max": 1},
                  "input_references": {"typ": "bereich", "min": 0, "max": 2}},
    "preise": {"output_image": {"einheit": "megapixel", "usd": 0.03}},
}


class Einheiten(unittest.TestCase):
    def test_bildtyp_und_masse(self):
        self.assertEqual(server.bild_typ(png())[0], "image/png")
        self.assertEqual(server.bild_masse(png(7, 5)), (7, 5))
        self.assertIsNone(server.bild_typ(b"<html>"))

    def test_schaetzung(self):
        s = server.schaetzen(FAKE, "2K", "", 2)
        self.assertAlmostEqual(s["je_bild"], 0.03 * server.MP["2K"], places=4)
        self.assertEqual(s["quelle"], "schaetzung")
        tok = dict(FAKE, id="openai/x", preise={"output_image": {"einheit": "token", "usd": 0.00003}})
        self.assertAlmostEqual(server.schaetzen(tok, "", "high", 1)["je_bild"], 0.00003 * 4160, places=5)
        leer = dict(FAKE, preise={})
        self.assertEqual(server.schaetzen(leer, "", "", 1)["quelle"], "unbekannt")


class Http(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        server.verzeichnisse()
        server.KATALOG.update({"modelle": [FAKE], "stand": time.time(), "fehler": ""})
        cls.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()

    def req(self, pfad, body=None, cookie="", csrf="", host=None):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        kopf = {"Host": host or f"127.0.0.1:{self.port}"}
        if cookie:
            kopf["Cookie"] = cookie
        if csrf:
            kopf["X-CSRF"] = csrf
        daten = None
        if body is not None:
            daten = json.dumps(body).encode()
            kopf["Content-Type"] = "application/json"
        c.request("POST" if body is not None else "GET", pfad, body=daten, headers=kopf)
        r = c.getresponse()
        roh = r.read()
        try:
            j = json.loads(roh)
        except ValueError:
            j = None
        return r.status, j, r.getheader("Set-Cookie") or "", roh

    def test_ablauf(self):
        st, j, _, _ = self.req("/api/status")
        self.assertIsNone(j["nutzer"])
        # falscher Host (DNS-Rebinding) wird abgewiesen
        self.assertEqual(self.req("/api/status", host="boese.example")[0], 421)
        # Anmeldung, Einrichtung, Passwort, Benutzerverwaltung gibt es nicht mehr
        for weg in ("einrichten", "anmelden", "abmelden", "passwort", "benutzer", "profil"):
            self.assertIn(self.req(f"/api/{weg}", {"benutzer": "a", "passwort": "12345678"})[0], (401, 404), weg)
        # Einlass: falsche Marke abgewiesen, ohne die liegende zu verbrauchen
        marke = server.zugang.einlass_ausstellen()
        self.assertEqual(self.req("/api/einlass", {"marke": "A" * 43})[0], 403)
        self.assertEqual(self.req("/api/einlass", {"marke": "kaputt"})[0], 403)
        st, j, ck, _ = self.req("/api/einlass", {"marke": marke})
        self.assertEqual(st, 200, j)
        cookie, csrf = ck.split(";")[0], j["csrf"]
        self.assertEqual(j["nutzer"]["benutzer"], "werkstatt")
        self.assertEqual(j["nutzer"]["rolle"], "admin")
        self.assertIn("HttpOnly", ck)
        self.assertIn("SameSite=Strict", ck)
        # dieselbe Marke ein zweites Mal: verbraucht
        self.assertEqual(self.req("/api/einlass", {"marke": marke})[0], 403)
        # auch mit Sitzung: die alten Kontowege sind fort
        for weg in ("einrichten", "anmelden", "abmelden", "passwort", "benutzer", "profil"):
            self.assertEqual(self.req(f"/api/{weg}", {}, cookie, csrf)[0], 404, weg)
        # ohne CSRF kein POST
        self.assertEqual(self.req("/api/ordner", {"name": "A"}, cookie=cookie)[0], 403)
        # ohne Sitzung kein Zugriff
        self.assertEqual(self.req("/api/bilder")[0], 401)
        # Ordner
        st, j, _, _ = self.req("/api/ordner", {"name": "Kampagne"}, cookie, csrf)
        oid = j["id"]
        # Upload + Pfadschutz
        daten = "data:image/png;base64," + base64.b64encode(png()).decode()
        st, j, _, _ = self.req("/api/upload", {"daten": daten}, cookie, csrf)
        self.assertEqual(st, 200, j)
        up = j["id"]
        self.assertEqual(self.req(f"/upload/{up}", cookie=cookie)[0], 200)
        self.assertEqual(self.req("/bild/..%2Fbenutzer.json", cookie=cookie)[0], 404)
        self.assertEqual(self.req("/static/../server.py")[0], 404)
        svg = "data:image/svg+xml;base64," + base64.b64encode(b"<svg onload=alert(1)></svg>").decode()
        self.assertEqual(self.req("/api/upload", {"daten": svg}, cookie, csrf)[0], 400)

        # Erzeugen mit simuliertem OpenRouter
        aufrufe = []

        def fake(pfad, daten=None, timeout=30, mit_key=True):
            aufrufe.append(daten)
            return {"data": [{"b64_json": base64.b64encode(png(4, 4)).decode()}], "usage": {"cost": 0.05, "completion_tokens": 4096}}

        alt_or, alt_key = server.or_anfrage, server.api_key
        server.or_anfrage, server.api_key = fake, lambda: "sk-or-test"
        try:
            st, j, _, _ = self.req("/api/erzeugen", {"prompt": "Ein roter Apfel", "modell": FAKE["id"], "anzahl": 2,
                                                      "seitenverhaeltnis": "16:9", "qualitaet": "ultra", "refs": [up]}, cookie, csrf)
            self.assertEqual(st, 200, j)
            job = j["auftrag"]
            for _ in range(50):
                _, j, _, _ = self.req("/api/auftraege", cookie=cookie)
                if all(a["status"] != "laufend" for a in j["auftraege"]):
                    break
                time.sleep(0.1)
        finally:
            server.or_anfrage, server.api_key = alt_or, alt_key
        self.assertEqual(len(aufrufe), 2, "n max 1 → zwei Einzelaufrufe")
        self.assertEqual(aufrufe[0]["aspect_ratio"], "16:9")
        self.assertNotIn("quality", aufrufe[0], "ungültige Qualität darf nicht durchgereicht werden")
        self.assertTrue(aufrufe[0]["input_references"][0]["image_url"]["url"].startswith("data:image/png;base64,"))
        fertig = next(a for a in j["auftraege"] if a["id"] == job["id"])
        self.assertEqual(fertig["status"], "fertig")
        self.assertEqual(len(fertig["bilder"]), 2)

        # Bibliothek, Aktionen, Messwert
        _, j, _, _ = self.req("/api/bilder?ansicht=alle", cookie=cookie)
        self.assertEqual(len(j["bilder"]), 2)
        bid = j["bilder"][0]["id"]
        self.assertEqual(j["bilder"][0]["breite"], 4)
        self.assertEqual(self.req(f"/bild/{bid}", cookie=cookie)[0], 200)
        self.req(f"/api/bild/{bid}", {"aktion": "like"}, cookie, csrf)
        self.req(f"/api/bild/{bid}", {"aktion": "ordner", "ordner": oid}, cookie, csrf)
        _, j, _, _ = self.req("/api/bilder?ansicht=favoriten", cookie=cookie)
        self.assertEqual([b["id"] for b in j["bilder"]], [bid])
        _, j, _, _ = self.req(f"/api/bilder?ansicht=ordner:{oid}", cookie=cookie)
        self.assertEqual(len(j["bilder"]), 1)
        _, j, _, _ = self.req("/api/schaetzen", {"modell": FAKE["id"], "anzahl": 1}, cookie, csrf)
        self.assertEqual(j["quelle"], "gemessen")
        self.assertAlmostEqual(j["je_bild"], 0.05)

        # Element aus Bild
        _, j, _, _ = self.req("/api/elemente", {"name": "Apfel", "art": "produkt", "bilder": [bid, "fremdid123"]}, cookie, csrf)
        self.assertEqual(j["elemente"][0]["bilder"], [{"id": bid, "url": f"/bild/{bid}"}])

        # Ein anderes, altes Konto (nur noch in benutzer.json) sieht die Bilder von „werkstatt“ nicht,
        # veröffentlichte schon — und kann sie nicht löschen
        alle = server.benutzer()
        alle["gast"] = {"name": "Gast", "rolle": "nutzer"}
        server.schreib_json("benutzer.json", alle)
        token2, csrf2 = server.sitzung_neu("gast")
        cookie2 = f"bildgen_sid={token2}"
        self.assertEqual(self.req(f"/bild/{bid}", cookie=cookie2)[0], 404)
        self.req(f"/api/bild/{bid}", {"aktion": "veroeffentlichen", "wert": True}, cookie, csrf)
        self.assertEqual(self.req(f"/bild/{bid}", cookie=cookie2)[0], 200)
        self.assertEqual(self.req(f"/api/bild/{bid}", {"aktion": "papierkorb"}, cookie2, csrf2)[0], 404)

        # Papierkorb → endgültig
        self.req(f"/api/bild/{bid}", {"aktion": "papierkorb"}, cookie, csrf)
        _, j, _, _ = self.req("/api/bilder?ansicht=papierkorb", cookie=cookie)
        self.assertEqual(len(j["bilder"]), 1)
        _, j, _, _ = self.req("/api/papierkorb_leeren", {}, cookie, csrf)
        self.assertEqual(j["anzahl"], 1)

        # Verbrauch
        _, j, _, _ = self.req("/api/verbrauch", cookie=cookie)
        self.assertAlmostEqual(j["summe"], 0.1)
        self.assertEqual(j["bilder"], 2)

        # 4:5 bei einem Modell ohne 4:5 → nächstes Format anfragen, danach Zuschnitt
        _, j, _, _ = self.req("/api/status", cookie=cookie)
        csrf = j["csrf"]
        aufrufe.clear()
        server.or_anfrage, server.api_key = fake, lambda: "sk-or-test"
        try:
            st, j, _, _ = self.req("/api/erzeugen", {"prompt": "Porträt", "modell": FAKE["id"], "anzahl": 1,
                                                      "seitenverhaeltnis": "4:5"}, cookie, csrf)
            self.assertEqual(st, 200, j)
            for _ in range(50):
                _, j, _, _ = self.req("/api/auftraege", cookie=cookie)
                if all(a["status"] != "laufend" for a in j["auftraege"]):
                    break
                time.sleep(0.1)
        finally:
            server.or_anfrage, server.api_key = alt_or, alt_key
        self.assertEqual(aufrufe[0]["aspect_ratio"], "1:1", "nächstliegendes Format zu 4:5 aus [1:1, 16:9]")
        self.assertEqual(aufrufe[0]["prompt"], "Porträt", "Strecken (Standard) braucht keinen Bildaufbau-Hinweis")
        _, j, _, _ = self.req("/api/bilder?ansicht=alle", cookie=cookie)
        b = next(x for x in j["bilder"] if x.get("zuschnitt"))
        self.assertEqual((b["zuschnitt"], b["anpassung"], b["parameter"]["seitenverhaeltnis"]), ("4:5", "strecken", "4:5"))
        # Umschalten auf Zuschneiden → Hinweis im Prompt
        self.req("/api/einstellungen", {"anpassung": "zuschneiden"}, cookie, csrf)
        server.or_anfrage, server.api_key = fake, lambda: "sk-or-test"
        try:
            self.req("/api/erzeugen", {"prompt": "Porträt", "modell": FAKE["id"], "seitenverhaeltnis": "4:5"}, cookie, csrf)
            for _ in range(50):
                if len(aufrufe) > 1:
                    break
                time.sleep(0.1)
        finally:
            time.sleep(0.3)
            server.or_anfrage, server.api_key = alt_or, alt_key
        self.assertIn("Zuschnitt", aufrufe[1]["prompt"])
        falsch = "data:image/png;base64," + base64.b64encode(png(4, 4)).decode()
        self.assertEqual(self.req(f"/api/bild/{b['id']}", {"aktion": "zuschnitt", "daten": falsch}, cookie, csrf)[0], 400)
        richtig = "data:image/png;base64," + base64.b64encode(png(8, 10)).decode()
        st, j, _, _ = self.req(f"/api/bild/{b['id']}", {"aktion": "zuschnitt", "daten": richtig}, cookie, csrf)
        self.assertEqual(st, 200, j)
        self.assertEqual((j["bild"]["breite"], j["bild"]["hoehe"]), (8, 10))
        self.assertNotIn("zuschnitt", j["bild"])
        self.assertEqual(self.req(f"/api/bild/{b['id']}", {"aktion": "zuschnitt", "daten": richtig}, cookie, csrf)[0], 404)

    def test_naechstes_format(self):
        self.assertEqual(server.naechstes_format("4:5", ["1:1", "3:4", "16:9", "auto"]), "3:4")
        self.assertEqual(server.naechstes_format("4:5", ["1:1", "3:2", "2:3"]), "2:3")
        self.assertEqual(server.naechstes_format("4:5", ["1:1", "16:9"]), "1:1")
        self.assertEqual(server.naechstes_format("4:5", ["auto"]), "")


def mp4(w=1280, h=720, dauer_ms=5000):
    """Minimales MP4-Gerüst mit ftyp, mvhd (v0) und tkhd (v0) — reicht für video_masse()."""
    def box(t, d):
        return struct.pack(">I", 8 + len(d)) + t + d
    mvhd = box(b"mvhd", b"\x00\x00\x00\x00" + b"\x00" * 8 + struct.pack(">II", 1000, dauer_ms) + b"\x00" * 80)
    tkhd = box(b"tkhd", b"\x00\x00\x00\x07" + b"\x00" * 20 + b"\x00" * 8 + b"\x00" * 8 + b"\x00" * 36
               + struct.pack(">II", w << 16, h << 16))
    return box(b"ftyp", b"isom\x00\x00\x02\x00isom") + box(b"moov", mvhd + box(b"trak", tkhd)) + box(b"mdat", b"\x00" * 64)


FAKEV = {"id": "test/video-modell", "name": "Test Video", "anbieter": "Test", "beschreibung": "x", "erstellt": 0,
         "art": "erzeugen", "aufloesungen": ["720p", "1080p"], "formate": ["16:9", "9:16"], "dauern": [4, 6, 8],
         "frames": ["first_frame"], "ton": True, "seed": False,
         "preise": {"duration_seconds_with_audio": 0.12, "duration_seconds_without_audio": 0.10,
                    "duration_seconds_with_audio_720p": 0.10, "duration_seconds_without_audio_720p": 0.08}}


class WerkstattBindung(unittest.TestCase):
    """Aus der Werkstatt gestartet: Schlüssel über die Schutzschicht; die Ablage bleibt beim Programm (zugang.bindung)."""

    def setUp(self):
        import http.server
        self.angekommen = []
        test = self

        class Schutz(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                test.angekommen.append((self.path, self.headers.get("Authorization")))
                roh = json.dumps({"data": {"usage": 1, "limit": 10, "limit_remaining": 9}}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(roh)))
                self.end_headers()
                self.wfile.write(roh)

            def log_message(self, *a):
                pass

        self.schutz = server.ThreadingHTTPServer(("127.0.0.1", 0), Schutz)
        threading.Thread(target=self.schutz.serve_forever, daemon=True).start()
        self.arbeitsordner = Path(tempfile.mkdtemp(prefix="arbeitsordner_"))
        server.zugang.BINDUNG.parent.mkdir(parents=True, exist_ok=True)
        server.zugang.BINDUNG.write_text(json.dumps({
            "arbeitsordner": str(self.arbeitsordner),
            "schutzschicht": f"http://127.0.0.1:{self.schutz.server_address[1]}"}), encoding="utf-8")

    def tearDown(self):
        server.zugang.BINDUNG.unlink(missing_ok=True)
        if self.schutz is not None:
            self.schutz.shutdown()
            self.schutz.server_close()

    def test_schluessel_ueber_schutzschicht(self):
        self.assertEqual(server.key_quelle(), "werkstatt")
        server.or_anfrage("/key")
        self.assertEqual(self.angekommen, [("/v1/key", "Bearer schutzschicht")],
                         "nur der Platzhalter, nie ein eigener Schlüssel; Weg unter /v1")

    def test_schutzschicht_weg_verstaendliche_meldung(self):
        self.schutz.shutdown()
        self.schutz.server_close()
        self.schutz = None
        with self.assertRaises(RuntimeError) as f:
            server.or_anfrage("/key", timeout=3)
        self.assertIn("Werkstatt", str(f.exception))

    def test_ablage_beim_programm_ohne_nutzerordner(self):
        e = server.bild_speichern("werkstatt", png(3, 2), {"prompt": "Möwe am Meer"})
        f = server.medium_pfad(e)
        self.assertTrue(f.is_file())
        teile = f.relative_to(server.ablage_wurzel()).parts
        self.assertEqual(teile[0], "bilder", teile)
        self.assertRegex(teile[1], r"^\d{4}-\d{2}$")
        self.assertIn("möwe-am-meer", teile[2])
        self.assertFalse((self.arbeitsordner / "Cinema-Studio").exists(), "nichts mehr im Werkstatt-Arbeitsordner")
        # ein altes Konto behält seinen Unterordner
        alt = server.bild_speichern("anna", png(3, 2), {"prompt": "x"})
        self.assertEqual(server.medium_pfad(alt).relative_to(server.ablage_wurzel()).parts[:2], ("anna", "bilder"))

    def test_vereinheitlichen_holt_alles_an_einen_ort(self):
        alt = self.arbeitsordner / "Cinema-Studio"
        (alt / "Bilder" / "2026-10").mkdir(parents=True)
        (alt / "Bilder" / "2026-10" / "2026-10-08_0444_x_aa11bb.png").write_bytes(png())
        (alt / "Vorlagen" / "Bilder" / "Influencer Kühn").mkdir(parents=True)
        (alt / "Vorlagen" / "Bilder" / "Influencer Kühn" / "HF-52 sporty.png").write_bytes(png())
        (alt / "Vorlagen" / "Bilder" / "Influencer Kühn" / "HF-52 sporty.txt").write_text("prompt", "utf-8")
        (server.DATA / "uploads").mkdir(parents=True, exist_ok=True)
        (server.DATA / "uploads" / "up1.png").write_bytes(png())
        liste = server.bilder()
        liste.append({"id": "aa11bb", "owner": "werkstatt", "datei": "Bilder/2026-10/2026-10-08_0444_x_aa11bb.png",
                      "wurzel": str(alt), "mime": "image/png", "erstellt": server.jetzt(), "typ": "bild", "prompt": "x"})
        server.schreib_json("bilder.json", liste)
        server.ablage_vereinheitlichen()
        w = server.ablage_wurzel()
        self.assertTrue((w / "bilder" / "2026-10" / "2026-10-08_0444_x_aa11bb.png").is_file())
        self.assertTrue((w / "vorlagen" / "bilder" / "influencer-kuehn" / "hf-52-sporty.png").is_file())
        self.assertTrue((w / "vorlagen" / "bilder" / "influencer-kuehn" / "hf-52-sporty.txt").is_file())
        self.assertTrue((w / "uploads" / "up1.png").is_file())
        self.assertFalse(alt.exists(), "alter Ort ist leer und weg")
        b = server.bild_finden("aa11bb")
        self.assertEqual((b["datei"], b["wurzel"]), ("bilder/2026-10/2026-10-08_0444_x_aa11bb.png", str(w)))
        self.assertTrue(server.medium_pfad(b).is_file())
        self.assertEqual(server.ablage_vereinheitlichen(), 0, "zweiter Lauf ändert nichts")

    def test_eigener_schluessel_wird_abgelehnt(self):
        token, csrf = server.sitzung_neu("werkstatt")
        alle = server.benutzer()
        alle["werkstatt"] = {"name": "Werkstatt", "rolle": "admin"}
        server.schreib_json("benutzer.json", alle)
        srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        try:
            c = http.client.HTTPConnection("127.0.0.1", srv.server_address[1], timeout=10)
            c.request("POST", "/api/einstellungen", body=json.dumps({"schluessel": "sk-or-v1-" + "a" * 40}),
                      headers={"Host": "127.0.0.1", "Cookie": f"bildgen_sid={token}", "X-CSRF": csrf,
                               "Content-Type": "application/json"})
            r = c.getresponse()
            self.assertEqual(r.status, 400)
            self.assertIn("Werkstatt", json.loads(r.read())["fehler"])
            c.request("GET", "/api/einstellungen", headers={"Host": "127.0.0.1", "Cookie": f"bildgen_sid={token}"})
            d = json.loads(c.getresponse().read())
            self.assertTrue(d["werkstatt"]["schutzschicht"])
            self.assertEqual(d["werkstatt"]["ablage"], "", "die Ablage bleibt beim Programm")
        finally:
            srv.shutdown()


class Video(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.alt_data = server.DATA
        server.DATA = Path(tempfile.mkdtemp(prefix="bildgen_video_"))
        server.verzeichnisse()
        server.VKATALOG.update({"modelle": [FAKEV], "stand": time.time(), "fehler": ""})
        server.VIDEO_TEST_TAKT = 0.05
        server.schreib_json("benutzer.json", {"vid": {"name": "Vid", "rolle": "admin"}})
        cls.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        server.DATA = cls.alt_data
        server.VIDEO_TEST_TAKT = None

    def setUp(self):
        self.aufrufe = []
        self.alt = (server.or_anfrage, server.or_video_laden, server.api_key)

        def fake(pfad, daten=None, timeout=30, mit_key=True):
            self.aufrufe.append((pfad, daten))
            if pfad == "/videos":
                return {"id": f"vid{len(self.aufrufe)}", "status": "pending"}
            return {"id": pfad.rsplit("/", 1)[1], "status": "completed", "usage": {"cost": 0.4}}

        server.or_anfrage, server.or_video_laden, server.api_key = fake, lambda rid: mp4(), lambda: "sk-or-test"

    def tearDown(self):
        server.or_anfrage, server.or_video_laden, server.api_key = self.alt

    def warte(self, job):
        for _ in range(100):
            if job["status"] != "laufend":
                return
            time.sleep(0.05)
        self.fail("Auftrag wurde nicht fertig")

    def test_vorlagen_und_raster(self):
        ups = {}
        for owner in ("vid", "vid", "vid", "andere"):
            up = server.neue_id()
            (server.uploads_ordner() / f"{up}.png").write_bytes(png())
            ups[up] = {"owner": owner, "datei": f"{up}.png", "mime": "image/png"}
        server.schreib_json("uploads.json", ups)
        ids = list(ups)
        basis = {"modell": FAKEV["id"], "prompt": "Figur tanzt am Strand"}
        for falsch in ({"vorlagen": ids}, {"vorlagen": [ids[0], ids[0]]}, {"raster": "3x2"},
                       {"vorlagen": ids[:1], "raster": "9x9"}, {"vorlagen": ids[:1], "startbild": ids[1]},
                       {"vorlagen": [ids[3]]}):
            with self.assertRaises(ValueError, msg=str(falsch)):
                server.video_auftrag_starten("vid", {**basis, **falsch})
        job = server.video_auftrag_starten("vid", {**basis, "vorlagen": ids[:3], "raster": "3x2"})
        self.warte(job)
        self.assertEqual(job["status"], "fertig", job["fehler"])
        gesendet = [d for p_, d in self.aufrufe if p_ == "/videos"][-1]
        self.assertNotIn("frame_images", gesendet, "Vorlagen sind kein Startbild")
        self.assertEqual(len(gesendet["input_references"]), 3)
        for r in gesendet["input_references"]:
            self.assertEqual(r["type"], "image_url")
            self.assertNotIn("frame_type", r)
            self.assertTrue(r["image_url"]["url"].startswith("data:image/png;base64,"))
        self.assertIn("6-Panel-Storyboard-Raster (3 Spalten, 2 Reihen)", gesendet["prompt"])
        self.assertIn("@Bild 1, @Bild 2, @Bild 3 (in dieser Reihenfolge)", gesendet["prompt"])
        self.assertTrue(gesendet["prompt"].endswith("\n\nFigur tanzt am Strand"))
        self.assertEqual(job["prompt"], "Figur tanzt am Strand", "gespeichert bleibt die eigene Beschreibung")
        self.assertEqual((job["parameter"]["vorlagen"], job["parameter"]["raster"]), (ids[:3], "3x2"))
        eins = server.vorlagen_prompt("x", 1, "3x1")
        self.assertIn("(3 Spalten, 1 Reihe)", eins)
        self.assertNotIn("Reihenfolge", eins)
        self.assertNotIn("Storyboard", server.vorlagen_prompt("x", 2))

    def test_masse_und_typ(self):
        self.assertEqual(server.bild_typ(mp4())[0], "video/mp4")
        self.assertEqual(server.video_masse(mp4(1080, 1920, 8000)), (1080, 1920, 8.0))

    def test_preise(self):
        p = lambda **k: server.video_preis(dict(FAKEV, preise=k.pop("preise")), **k)
        self.assertEqual(p(preise=FAKEV["preise"], aufl="1080p", ton=True, mit_bild=False)["je_sekunde"], 0.12)
        self.assertEqual(p(preise=FAKEV["preise"], aufl="720p", ton=False, mit_bild=False)["je_sekunde"], 0.08)
        kling = {"duration_seconds": 0.112, "duration_seconds_with_audio": 0.168,
                 "text_to_video_duration_seconds_720p": 0.112}
        self.assertEqual(p(preise=kling, aufl="720p", ton=True, mit_bild=False)["je_sekunde"], 0.168)
        self.assertEqual(p(preise=kling, aufl="720p", ton=False, mit_bild=False)["je_sekunde"], 0.112)
        aleph = {"cents_per_second_output": 28, "minimum_cents_per_generation": 56}
        m = dict(FAKEV, preise=aleph, dauern=[1])
        self.assertAlmostEqual(server.schaetzen_video(m, "", 1, False, False, 1)["je_video"], 0.56)
        seed = {"video_tokens": 0.000007}
        s = p(preise=seed, aufl="720p", ton=True, mit_bild=False)
        self.assertEqual(s["quelle"], "schaetzung")
        self.assertAlmostEqual(s["je_sekunde"], 0.000007 * 1280 * 720 * 24 / 1024, places=6)
        ohne_messwert = dict(FAKEV, id="test/nur-preisliste")
        self.assertEqual(server.schaetzen_video(ohne_messwert, "1080p", 8, True, False, 2)["gesamt"], 1.92)

    def test_auftrag_und_wiedergabe(self):
        server.schreib_json("einstellungen.json", {"startbild_anpassung": "aus"})
        self.addCleanup(server.schreib_json, "einstellungen.json", {})
        up = server.neue_id()
        (server.uploads_ordner() / f"{up}.png").write_bytes(png())
        server.schreib_json("uploads.json", {up: {"owner": "vid", "datei": f"{up}.png", "mime": "image/png"}})
        with self.assertRaises(ValueError):
            server.video_auftrag_starten("vid", {"modell": FAKEV["id"], "prompt": "x", "endbild": up})
        job = server.video_auftrag_starten("vid", {"modell": FAKEV["id"], "prompt": "Möwe über dem Meer", "anzahl": 2,
                                                   "aufloesung": "1080p", "seitenverhaeltnis": "9:16", "dauer": 7,
                                                   "ton": True, "startbild": up})
        self.warte(job)
        self.assertEqual(job["status"], "fertig", job["fehler"])
        gesendet = [d for p_, d in self.aufrufe if p_ == "/videos"]
        self.assertEqual(len(gesendet), 2)
        self.assertEqual((gesendet[0]["duration"], gesendet[0]["aspect_ratio"], gesendet[0]["generate_audio"]), (6, "9:16", True))
        self.assertEqual(gesendet[0]["frame_images"][0]["frame_type"], "first_frame")
        self.assertAlmostEqual(job["kosten"], 0.8)
        self.assertEqual(server.lies_json("video_offen.json", {}), {})
        v = server.bild_finden(job["bilder"][0])
        self.assertEqual((v["typ"], v["breite"], v["hoehe"], v["dauer"]), ("video", 1280, 720, 5.0))
        self.assertIsNone(server.referenz_daten(v["id"], "vid"), "Video darf kein Referenzbild sein")
        # gemessener Preis je Sekunde ersetzt die Preisliste
        s = server.schaetzen_video(FAKEV, "1080p", 6, True, True, 1)
        self.assertEqual(s["quelle"], "gemessen")
        self.assertAlmostEqual(s["je_sekunde"], 0.4 / 6, places=4)
        # Wiedergabe mit Range
        token, _ = server.sitzung_neu("vid")
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        c.request("GET", f"/bild/{v['id']}", headers={"Host": f"127.0.0.1:{self.port}", "Cookie": f"bildgen_sid={token}",
                                                     "Range": "bytes=0-9"})
        r = c.getresponse()
        self.assertEqual((r.status, len(r.read())), (206, 10))
        self.assertTrue(r.getheader("Content-Range").startswith("bytes 0-9/"))
        _, j, _, _ = Http.req(self, "/api/bilder?typ=video", cookie=f"bildgen_sid={token}")
        self.assertEqual({b["typ"] for b in j["bilder"]}, {"video"})

    def test_start_und_endbild_ki_erweitern(self):
        """16:9-Start- und Endbild, Video 9:16: beide werden erst per Bildmodell erweitert (kein Mischformat)."""
        bildm = dict(FAKE, id="test/erweitern", parameter=dict(FAKE["parameter"],
                     aspect_ratio={"typ": "liste", "werte": ["1:1", "16:9", "9:16"]}))
        alt_kat = dict(server.KATALOG)
        server.KATALOG.update({"modelle": [bildm], "stand": time.time()})
        server.schreib_json("einstellungen.json", {"standard_modell": "test/erweitern"})
        self.addCleanup(server.schreib_json, "einstellungen.json", {})
        self.addCleanup(server.KATALOG.update, alt_kat)
        server.VKATALOG["modelle"] = [dict(FAKEV, frames=["first_frame", "last_frame"])]
        self.addCleanup(server.VKATALOG.update, {"modelle": [FAKEV]})
        ups = {}
        for _ in range(2):
            up = server.neue_id()
            (server.uploads_ordner() / f"{up}.png").write_bytes(png(16, 9))
            ups[up] = {"owner": "vid", "datei": f"{up}.png", "mime": "image/png"}
        server.schreib_json("uploads.json", ups)
        start, ende = list(ups)
        alt_bild = server.ein_aufruf
        bildaufrufe = []

        def fake_bild(nl):
            bildaufrufe.append(nl)
            return [png(9, 16)], 0.04, 0
        server.ein_aufruf = fake_bild
        self.addCleanup(setattr, server, "ein_aufruf", alt_bild)
        auftrag = {"modell": FAKEV["id"], "prompt": "Held", "seitenverhaeltnis": "9:16", "aufloesung": "720p",
                   "dauer": 5, "startbild": start, "endbild": ende}
        job = server.video_auftrag_starten("vid", auftrag)
        self.assertIn("erweitert", job["hinweis"])
        self.warte(job)
        self.assertEqual(job["status"], "fertig", job["fehler"])
        self.assertEqual([(n["aspect_ratio"], n["model"]) for n in bildaufrufe], [("9:16", "test/erweitern")] * 2)
        video = [d for p_, d in self.aufrufe if p_ == "/videos"][0]
        for fr in video["frame_images"]:
            roh = base64.b64decode(fr["image_url"]["url"].split(",", 1)[1])
            self.assertEqual(server.bild_masse(roh), (9, 16), fr["frame_type"])
        self.assertAlmostEqual(job["kosten"], 0.08 + 0.4)
        self.assertEqual(len(job["hilfsbilder"]), 2)
        # zweiter Lauf: erweiterte Bilder werden wiederverwendet, kein neuer Bildaufruf
        job2 = server.video_auftrag_starten("vid", auftrag)
        self.warte(job2)
        self.assertEqual((job2["status"], len(bildaufrufe)), ("fertig", 2))
        # scheitert die Erweiterung, wird kein Video bezahlt
        server.schreib_json("erweitert.json", {})
        server.ein_aufruf = lambda nl: (_ for _ in ()).throw(RuntimeError("Modell weg"))
        vorher = len([1 for p_, _ in self.aufrufe if p_ == "/videos"])
        job3 = server.video_auftrag_starten("vid", auftrag)
        self.warte(job3)
        self.assertEqual(job3["status"], "fehler")
        self.assertEqual(len([1 for p_, _ in self.aufrufe if p_ == "/videos"]), vorher)

    def test_fortsetzen_nach_neustart(self):
        server.video_offen_setzen("altvid9", {"job": "jobalt1", "owner": "vid", "start": server.jetzt(),
                                              "info": {"prompt": "alt", "modell": FAKEV["id"], "modell_name": "Test Video",
                                                       "parameter": {"dauer": 4}, "refs": []}})
        self.assertEqual(server.video_offen_fortsetzen(), 1)
        job = server.AUFTRAEGE["jobalt1"]
        self.warte(job)
        self.assertEqual((job["status"], len(job["bilder"])), ("fertig", 1))
        self.assertEqual(server.lies_json("video_offen.json", {}), {})
        self.assertEqual([p_ for p_, _ in self.aufrufe], ["/videos/altvid9"], "kein neuer, doppelt bezahlter Auftrag")


class Chat(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.alt_data = server.DATA
        server.DATA = Path(tempfile.mkdtemp(prefix="bildgen_chat_"))
        server.verzeichnisse()
        server.KATALOG.update({"modelle": [FAKE], "stand": time.time(), "fehler": ""})
        server.VKATALOG.update({"modelle": [FAKEV], "stand": time.time(), "fehler": ""})
        server.schreib_json("benutzer.json", {"chat": {"name": "C", "rolle": "admin"}})
        cls.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        token, cls.csrf = server.sitzung_neu("chat")
        cls.cookie = f"bildgen_sid={token}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        server.DATA = cls.alt_data

    def setUp(self):
        self.alt = (server.assistent.claude_strom, server.assistent.openrouter_strom, server.assistent.claude_finden, server.api_key)
        server.assistent.claude_finden = lambda eigen="": "C:/fake/claude.exe"
        server.api_key = lambda: "sk-or-test"

    def tearDown(self):
        (server.assistent.claude_strom, server.assistent.openrouter_strom, server.assistent.claude_finden, server.api_key) = self.alt

    def test_bausteine(self):
        a = server.assistent
        args = a.claude_argumente("claude", "sonnet")
        self.assertEqual(args[args.index("--tools") + 1], "", "CLI ohne Werkzeuge")
        self.assertIn("--strict-mcp-config", args)
        with self.assertRaises(ValueError):
            a.claude_argumente("claude", "haiku; rm -rf")
        self.assertTrue(a.CLAUDE_MODELL_RE.match("claude-opus-5-5"))
        self.assertFalse(a.CLAUDE_MODELL_RE.match("claude-haiku-4-5"))
        os.environ["ANTHROPIC_API_KEY"] = "nicht-verwenden"
        try:
            self.assertNotIn("ANTHROPIC_API_KEY", a.claude_umgebung())
        finally:
            del os.environ["ANTHROPIC_API_KEY"]
        text = 'Vorschlag:\n```videoprompt\n{"prompt": "A gull", "modell": "x", "dauer": 5}\n```\n```bildprompt\nkaputt\n```'
        self.assertEqual(a.karten(text), [{"art": "video", "prompt": "A gull", "modell": "x", "dauer": 5}])
        lang = [{"rolle": "nutzer", "text": "x" * 40000}, {"rolle": "assistent", "text": "y" * 40000}, {"rolle": "nutzer", "text": "z"}]
        v = a.verlauf_als_text("ANW", lang, max_zeichen=50000)
        self.assertNotIn("x" * 100, v, "älteste Nachricht fällt weg")
        self.assertIn("NUTZER: z", v)
        s = server.einstellungen()
        self.assertEqual(server.gehirne(s, False), ["claude", "openrouter"])
        self.assertEqual(server.gehirne(s, True), ["vision"])
        self.assertEqual(server.gehirne(dict(s, assistent_claude=False), False), ["openrouter"])

    def strom_lesen(self, cid, text):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        c.request("POST", f"/api/chat/{cid}/senden", body=json.dumps({"text": text, "kontext": {"modus": "video"}}),
                  headers={"Host": f"127.0.0.1:{self.port}", "Cookie": self.cookie, "X-CSRF": self.csrf,
                           "Content-Type": "application/json"})
        r = c.getresponse()
        return r.status, [json.loads(z) for z in r.read().decode().splitlines() if z.strip()]

    def test_strom_und_ausweichen(self):
        _, j, _, _ = Http.req(self, "/api/chats", {"modus": "drehbuch"}, self.cookie, self.csrf)
        cid = j["chat"]["id"]
        gesehen = {}

        def claude_ok(exe, modell, prompt, ordner, tok, abbruch, zeitlimit=600):
            gesehen["prompt"] = prompt
            yield "text", "Hallo "
            yield "text", "Welt"
            yield "ende", {}

        server.assistent.claude_strom = claude_ok
        st, ev = self.strom_lesen(cid, "Wer bist du?")
        self.assertEqual(st, 200)
        self.assertEqual("".join(e["d"] for e in ev if e["t"] == "text"), "Hallo Welt")
        self.assertEqual(ev[-1]["t"], "ende")
        self.assertIn("Claude-CLI", ev[-1]["gehirn"])
        self.assertIn("# Modus Drehbuch", gesehen["prompt"])
        self.assertIn("test/video-modell", gesehen["prompt"], "Modellkatalog steckt in der Anweisung")

        def claude_kaputt(*a, **k):
            yield "fehler", "Claude-CLI ist nicht angemeldet"

        def or_ok(key, modell, nachrichten, abbruch, basis=""):
            gesehen["msgs"] = nachrichten
            yield "text", "Ersatzantwort"
            yield "ende", {"kosten": 0.0012}

        server.assistent.claude_strom, server.assistent.openrouter_strom = claude_kaputt, or_ok
        st, ev = self.strom_lesen(cid, "Nochmal")
        self.assertEqual([e["t"] for e in ev], ["hinweis", "text", "ende"])
        self.assertIn("OpenRouter", ev[-1]["gehirn"])
        self.assertEqual(gesehen["msgs"][0]["role"], "system")
        _, j, _, _ = Http.req(self, f"/api/chat/{cid}", cookie=self.cookie)
        self.assertEqual([n["rolle"] for n in j["chat"]["nachrichten"]], ["nutzer", "assistent", "nutzer", "assistent"])
        self.assertEqual(j["chat"]["titel"], "Wer bist du?")
        self.assertEqual(server.CHAT_LAEUFT, {}, "Sperre wird freigegeben")
        _, j, _, _ = Http.req(self, "/api/verbrauch", cookie=self.cookie)
        self.assertAlmostEqual(j["summe"], 0.0012)
        # fremder Chat ist nicht erreichbar, ungültige Einstellungen werden abgelehnt
        self.assertEqual(Http.req(self, "/api/chat/..%2Fx", cookie=self.cookie)[0], 404)
        self.assertEqual(Http.req(self, "/api/einstellungen", {"assistent_claude_modell": "gpt-5"}, self.cookie, self.csrf)[0], 400)
        self.assertEqual(Http.req(self, "/api/einstellungen", {"assistent_claude_modell": "claude-sonnet-5"}, self.cookie, self.csrf)[0], 200)


class Startbild(unittest.TestCase):
    @unittest.skipUnless(server.klon.werkzeug("ffmpeg"), "ffmpeg fehlt")
    def test_format_angleichen(self):
        ff = server.klon.werkzeug("ffmpeg")
        r = subprocess.run([ff, "-v", "error", "-f", "lavfi", "-i", "testsrc=size=320x180", "-frames:v", "1",
                            "-f", "image2pipe", "-c:v", "png", "pipe:1"], capture_output=True, timeout=60)
        url = "data:image/png;base64," + base64.b64encode(r.stdout).decode()
        neu, hinweis = server.startbild_angleichen(url, "9:16", "zuschneiden", ff)
        self.assertEqual(server.bild_masse(base64.b64decode(neu.split(",", 1)[1])), (180, 320))
        self.assertIn("9:16", hinweis)
        self.assertTrue(server.format_weicht_ab(url, "9:16"))
        self.assertFalse(server.format_weicht_ab(url, "16:9"))
        self.assertEqual(server.startbild_angleichen(url, "16:9", "zuschneiden", ff), (url, ""))
        self.assertEqual(server.startbild_angleichen(url, "9:16", "aus", ff), (url, ""))


class Uploads(unittest.TestCase):
    """Bibliothek › Uploads: Dateien jeder Art, eigene Ordner, im Explorer hineingelegte Dateien."""

    def setUp(self):
        self.alt_data, self.alt_ablage = server.DATA, os.environ["BILDGEN_ABLAGE"]
        server.DATA = Path(tempfile.mkdtemp(prefix="bildgen_up_"))
        os.environ["BILDGEN_ABLAGE"] = str(server.DATA / "Ablage")
        server.verzeichnisse()
        server.schreib_json("benutzer.json", {server.zugang.KONTO: {"name": "Werkstatt", "rolle": "admin"}})
        self.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        self.port = self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        token, self.csrf = server.sitzung_neu(server.zugang.KONTO)
        self.kopf = {"Host": f"127.0.0.1:{self.port}", "Cookie": f"bildgen_sid={token}", "X-CSRF": self.csrf}
        self.w = server.uploads_ordner()

    def tearDown(self):
        self.srv.shutdown()
        server.DATA = self.alt_data
        os.environ["BILDGEN_ABLAGE"] = self.alt_ablage

    def req(self, methode, pfad, body=None, kopf=None):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        h = {**self.kopf, **(kopf or {})}
        if isinstance(body, dict):
            body = json.dumps(body).encode()
            h["Content-Type"] = "application/json"
        c.request(methode, pfad, body=body, headers=h)
        r = c.getresponse()
        roh = r.read()
        try:
            j = json.loads(roh)
        except ValueError:
            j = None
        return r.status, j, r, roh

    def liste(self, q=""):
        st, j, _, _ = self.req("GET", "/api/uploads" + q)
        self.assertEqual(st, 200, j)
        return j

    def test_explorer_dateien_und_ordner(self):
        # Wie im Explorer hineingelegt – ohne Eintrag in uploads.json
        (self.w / "03-modell.png").write_bytes(png())
        (self.w / "Charaktere").mkdir()
        (self.w / "Charaktere" / "blatt.png").write_bytes(png(6, 4))
        (self.w / "notizen.txt").write_text("Figur: rote Jacke", encoding="utf-8")
        (self.w / "clip.mp4").write_bytes(mp4())
        (self.w / "boese.html").write_text("<script>alert(1)</script>", encoding="utf-8")
        for intern in ("clone", "_papierkorb", ".versteckt"):
            (self.w / intern).mkdir(exist_ok=True)
            (self.w / intern / "x.png").write_bytes(png())
        (self.w / ".abc.part").write_bytes(b"halb")
        (self.w / "desktop.ini").write_text("[x]")
        j = self.liste()
        namen = sorted(u["datei"] for u in j["uploads"])
        self.assertEqual(namen, ["03-modell.png", "Charaktere/blatt.png", "boese.html", "clip.mp4", "notizen.txt"])
        self.assertEqual(j["gesamt"], 5)
        self.assertEqual(j["ordner"], [{"name": "Charaktere", "anzahl": 1}])
        nach = {u["dateiname"]: u for u in j["uploads"]}
        self.assertEqual((nach["blatt.png"]["typ"], nach["blatt.png"]["ordner"], nach["blatt.png"]["breite"], nach["blatt.png"]["hoehe"]),
                         ("bild", "Charaktere", 6, 4))
        self.assertTrue(nach["03-modell.png"]["nutzbar"])
        self.assertEqual((nach["clip.mp4"]["typ"], nach["notizen.txt"]["typ"], nach["boese.html"]["typ"]), ("video", "text", "text"))
        self.assertFalse(nach["clip.mp4"]["nutzbar"])
        self.assertEqual(len(self.liste("?typ=bild")["uploads"]), 2)
        self.assertEqual([u["dateiname"] for u in self.liste("?ordner=Charaktere")["uploads"]], ["blatt.png"])
        self.assertEqual(len(self.liste("?ordner=-")["uploads"]), 4)
        self.assertEqual([u["dateiname"] for u in self.liste("?q=modell")["uploads"]], ["03-modell.png"])
        # Erneutes Öffnen legt nichts doppelt an
        self.assertEqual(len(server.lies_json("uploads.json", {})), 5)
        self.liste()
        self.assertEqual(len(server.lies_json("uploads.json", {})), 5)
        # Ausliefern: Bild als Bild, HTML/Text nie als Seite
        st, _, r, roh = self.req("GET", nach["03-modell.png"]["url"])
        self.assertEqual((st, r.getheader("Content-Type"), roh), (200, "image/png", png()))
        st, _, r, _ = self.req("GET", nach["boese.html"]["url"])
        self.assertEqual(r.getheader("Content-Type"), "text/plain; charset=utf-8")
        self.assertIn("sandbox", r.getheader("Content-Security-Policy"))
        # Als Referenz/Startbild/Vorlage taugen nur Bilder
        self.assertTrue(server.referenz_daten(nach["blatt.png"]["id"], server.zugang.KONTO).startswith("data:image/png;base64,"))
        self.assertIsNone(server.referenz_daten(nach["notizen.txt"]["id"], server.zugang.KONTO))
        self.assertIsNone(server.referenz_daten(nach["blatt.png"]["id"], "jemand-anders"))
        # Im Explorer verschoben: die Id bleibt (Verweise aus früheren Aufträgen stimmen weiter)
        (self.w / "Neu").mkdir()
        os.replace(self.w / "Charaktere" / "blatt.png", self.w / "Neu" / "blatt.png")
        neu = {u["dateiname"]: u for u in self.liste()["uploads"]}
        self.assertEqual((neu["blatt.png"]["id"], neu["blatt.png"]["ordner"]), (nach["blatt.png"]["id"], "Neu"))

    def test_hochladen_ordner_und_aktionen(self):
        def hoch(name, daten, ordner=""):
            return self.req("POST", "/api/uploads/datei?ordner=" + ordner, daten,
                            {"Content-Type": "application/octet-stream", "X-Dateiname": name})
        st, j, _, _ = hoch("Mein%20Bild.png", png(), "Projekt")
        self.assertEqual(st, 200, j)
        self.assertEqual((j["upload"]["datei"], j["upload"]["typ"]), ("Projekt/Mein Bild.png", "bild"))
        self.assertEqual(hoch("Mein%20Bild.png", png(), "Projekt")[1]["upload"]["dateiname"], "Mein Bild (2).png")
        st, j, _, _ = hoch("..%2F..%2Fdrehbuch.md", "# Szene 1".encode())
        self.assertEqual((j["upload"]["datei"], j["upload"]["typ"]), ("drehbuch.md", "text"), "kein Weg aus uploads heraus")
        self.assertTrue((self.w / "drehbuch.md").is_file())
        for falsch in ("_intern", "clone", "Clone"):
            self.assertEqual(hoch("a.png", png(), falsch)[0], 400, falsch)
        self.assertEqual(self.req("POST", "/api/uploads/datei", png(), {"X-CSRF": "falsch", "X-Dateiname": "a.png"})[0], 403)
        # Eigene Ordner: anlegen, umbenennen, auflösen (Dateien bleiben)
        st, j, _, _ = self.req("POST", "/api/uploads/ordner", {"name": "Kunden"})
        self.assertEqual((st, j["name"]), (200, "Kunden"))
        self.assertEqual(self.req("POST", "/api/uploads/ordner", {"name": "a/b:c"})[1]["name"], "abc")
        st, j, _, _ = self.req("POST", "/api/uploads/ordner", {"name": "Projekt", "neu": "Projekt 2026"})
        self.assertEqual(j["name"], "Projekt 2026")
        self.assertIn({"name": "Projekt 2026", "anzahl": 2}, j["ordner"])
        bilder = self.liste("?ordner=Projekt 2026".replace(" ", "%20"))["uploads"]
        self.assertEqual(sorted(u["datei"] for u in bilder), ["Projekt 2026/Mein Bild (2).png", "Projekt 2026/Mein Bild.png"])
        st, j, _, _ = self.req("POST", "/api/uploads/ordner", {"name": "Projekt 2026", "loeschen": True})
        self.assertNotIn("Projekt 2026", [o["name"] for o in j["ordner"]])
        self.assertTrue((self.w / "Mein Bild.png").is_file() and (self.w / "Mein Bild (2).png").is_file())
        uid = next(u["id"] for u in self.liste()["uploads"] if u["dateiname"] == "Mein Bild.png")
        # Einzelne Datei: verschieben, umbenennen (Endung bleibt), löschen → _papierkorb
        st, j, _, _ = self.req("POST", f"/api/upload/{uid}", {"aktion": "ordner", "ordner": "Kunden"})
        self.assertEqual(j["upload"]["datei"], "Kunden/Mein Bild.png")
        st, j, _, _ = self.req("POST", f"/api/upload/{uid}", {"aktion": "umbenennen", "name": "Profil"})
        self.assertEqual(j["upload"]["datei"], "Kunden/Profil.png")
        self.assertEqual(self.req("POST", f"/api/upload/{uid}", {"aktion": "ordner", "ordner": "Gibtsnicht"})[0], 404)
        st, j, _, _ = self.req("POST", f"/api/upload/{uid}", {"aktion": "loeschen"})
        self.assertEqual(st, 200, j)
        self.assertTrue((self.w / "_papierkorb" / "Profil.png").is_file())
        self.assertNotIn(uid, [u["id"] for u in self.liste()["uploads"]])
        self.assertEqual(self.req("POST", f"/api/upload/{uid}", {"aktion": "ordner", "ordner": ""})[0], 404)
        # Auch Bilder aus dem +-Menü („Bild hochladen“) erscheinen in Uploads
        daten = "data:image/png;base64," + base64.b64encode(png()).decode()
        st, j, _, _ = self.req("POST", "/api/upload", {"daten": daten, "name": "referenz.png"})
        self.assertIn(j["id"], [u["id"] for u in self.liste()["uploads"]])

    def test_namen(self):
        self.assertEqual(server.upload_name_ok('..\\..\\a<b>.png'), "ab.png")
        self.assertEqual(server.upload_name_ok("CON.txt"), "")
        self.assertEqual(server.upload_name_ok("  . "), "")
        self.assertEqual(server.upload_typ("application/pdf", "x.pdf"), "text")
        self.assertEqual(server.upload_typ("application/zip", "x.zip"), "datei")
        self.assertEqual(server.upload_auslieferung("text/html")[0], "text/plain; charset=utf-8")
        self.assertEqual(server.upload_auslieferung("application/x-msdownload"), ("application/octet-stream", True))


class Klon(unittest.TestCase):
    def test_bausteine(self):
        k = server.klon
        self.assertEqual(k.url_pruefen("https://x.com/a/status/1"), "https://x.com/a/status/1")
        for boese in ("file:///c:/x", "http://127.0.0.1:8796/api/status", "http://localhost/x", "http://192.168.1.5/v",
                      "http://[::1]/v", "ftp://example.com/v", "javascript:alert(1)"):
            with self.assertRaises(ValueError, msg=boese):
                k.url_pruefen(boese)
        sz = k.szenen_bilden([2.0, 5.0], 8.0)
        self.assertEqual([(s["nr"], s["von"], s["bis"], s["t"]) for s in sz], [(1, 0.0, 2.0, 1.0), (2, 2.0, 5.0, 3.5), (3, 5.0, 8.0, 6.5)])
        viele = k.szenen_bilden([i * 0.5 for i in range(1, 100)], 50.0)
        self.assertEqual(len(viele), k.MAX_BILDER)
        self.assertEqual(viele[-1]["bis"], 50.0)
        self.assertEqual(k.json_aus_text('Hier:\n```json\n{"hook": "x", "szenen": []}\n```'), {"hook": "x", "szenen": []})
        with self.assertRaises(RuntimeError):
            k.json_aus_text("keine Daten")
        b = k.bericht({"hook": "Frage", "szenen": [{"nr": 1, "von": 0, "bis": 2, "bild": "Kaffee", "zweck": "Hook"}],
                       "fremdmarken": ["MarkeX"]}, 8.0, "Test")
        self.assertIn("Szene 1", b)
        self.assertIn("NICHT übernehmen): MarkeX", b)

    @unittest.skipUnless(server.klon.werkzeug("ffmpeg") and server.klon.werkzeug("ffprobe"), "ffmpeg fehlt")
    def test_ablauf_mit_ffmpeg(self):
        alt_data, alt_an, alt_key = server.DATA, server.klon.analysieren, server.api_key
        server.DATA = Path(tempfile.mkdtemp(prefix="bildgen_klon_"))
        try:
            server.verzeichnisse()
            ff = server.klon.werkzeug("ffmpeg")
            quelle = server.DATA / "t.mp4"
            # 2 s blau, dann 2 s rot → ein Schnitt bei 2 s
            subprocess_run = __import__("subprocess").run
            subprocess_run([ff, "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-f", "lavfi", "-i", "color=blue:s=320x240:d=2:r=24",
                            "-f", "lavfi", "-i", "color=red:s=320x240:d=2:r=24", "-filter_complex", "[0][1]concat=n=2:v=1",
                            "-pix_fmt", "yuv420p", str(quelle)], check=True, timeout=60)
            server.schreib_json("benutzer.json", {"k": {"name": "K", "rolle": "admin"}})
            srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
            port = srv.server_address[1]
            threading.Thread(target=srv.serve_forever, daemon=True).start()
            token, csrf = server.sitzung_neu("k")
            kopf = {"Host": f"127.0.0.1:{port}", "Cookie": f"bildgen_sid={token}", "X-CSRF": csrf}
            # Rohdaten-Upload: echtes Video wird angenommen, Nicht-Video abgelehnt
            c = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
            c.request("POST", "/api/klon/upload", body=quelle.read_bytes(), headers={**kopf, "Content-Type": "video/mp4", "X-Dateiname": "test.mp4"})
            r = c.getresponse()
            up = json.loads(r.read())
            self.assertEqual(r.status, 200, up)
            c = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
            c.request("POST", "/api/klon/upload", body=png(), headers={**kopf, "Content-Type": "image/png"})
            self.assertEqual(c.getresponse().status, 400)

            gesehen = {}

            def fake_analyse(key, modell, szenen, bilder, dauer, titel, basis=""):
                gesehen.update(szenen=len(szenen), bilder=len(bilder), dauer=dauer)
                return {"hook": "Farbwechsel", "szenen": [{"nr": 1, "von": 0, "bis": 2, "bild": "blau"}]}, 0.01

            server.klon.analysieren, server.api_key = fake_analyse, lambda: "sk-or-test"
            chat = {"id": server.neue_id(), "titel": "", "modus": "klon", "erstellt": server.jetzt(), "nachrichten": []}
            server.chat_speichern("k", chat)
            job = server.klon_starten("k", {"chat": chat["id"], "upload": up["id"]})
            for _ in range(200):
                if server.KLON_JOBS[job["id"]]["status"] != "laeuft":
                    break
                time.sleep(0.1)
            j = server.KLON_JOBS[job["id"]]
            self.assertEqual(j["status"], "fertig", j.get("fehler"))
            self.assertEqual((gesehen["szenen"], gesehen["bilder"]), (2, 2), "Schnitt bei 2 s erkannt")
            self.assertAlmostEqual(gesehen["dauer"], 4.0, places=1)
            ch = server.chat_laden("k", chat["id"])
            self.assertIn("Farbwechsel", ch["klon"]["bericht"])
            self.assertEqual(ch["titel"], "Clone: eigenes Video")
            self.assertFalse(list((server.DATA / "klon_uploads").glob("*.mp4")), "Quellvideo wird gelöscht")
            c = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
            c.request("GET", ch["klon"]["bilder"][0], headers=kopf)
            r = c.getresponse()
            self.assertEqual((r.status, r.getheader("Content-Type")), (200, "image/jpeg"))
            r.read()
            srv.shutdown()
        finally:
            server.DATA, server.klon.analysieren, server.api_key = alt_data, alt_an, alt_key


FAKEA = {"id": "test/sprache", "name": "Test Sprache", "anbieter": "Test", "erstellt": 0, "beschreibung": "x",
         "je_zeichen": 0.000015, "frei": False, "stimmen": ["eve", "rex"], "stimme_frei": False, "beispiel_stimme": "eve"}


class AudioAblage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.alt_data = server.DATA
        server.DATA = Path(tempfile.mkdtemp(prefix="bildgen_audio_"))
        os.environ["BILDGEN_ABLAGE"] = str(server.DATA / "Ablage")
        server.verzeichnisse()
        server.AKATALOG.update({"modelle": [FAKEA], "stand": time.time(), "fehler": ""})

    @classmethod
    def tearDownClass(cls):
        server.DATA = cls.alt_data
        os.environ["BILDGEN_ABLAGE"] = str(Path(TMP) / "Ablage")

    def test_stimmen_und_regler(self):
        a = server.audio
        llms = ('### Request fields\n- model: string (required)\n'
                '- voice: "eve" | "ara" | "rex" (optional) — provider-specific voice identifier\n  "voice": "ara",\n')
        self.assertEqual(a.stimmen_aus_llms(llms), (["eve", "ara", "rex"], "ara"))
        frei = '- voice: string (optional) — provider-specific voice identifier\n  "voice": "b347db03",\n'
        self.assertEqual(a.stimmen_aus_llms(frei), ([], "b347db03"))
        self.assertEqual(a.klang_saeubern({"tempo": 500, "tiefe": -40, "klarheit": "x"}),
                         {"tempo": 130, "tiefe": -12, "klarheit": 0, "laut": 100})
        self.assertEqual(a.klang_filter({}), "")
        self.assertEqual(a.klang_filter({"tempo": 90, "tiefe": 3, "klarheit": -2, "laut": 120}),
                         "atempo=0.90,bass=g=3:f=220,treble=g=-2:f=3200,volume=1.20")
        self.assertEqual(server.bild_typ(b"ID3\x04\x00")[0], "audio/mpeg")
        self.assertEqual(server.bild_typ(a.pcm_als_wav(b"\x00\x00" * 10))[0], "audio/wav")

    def test_ablage_name_und_einsortieren(self):
        rel = server.ablage_relativ("video", "2026-09-25T10:00:00+00:00", "Möwe über dem Meer! 4K", "abc123def456", "mp4")
        self.assertTrue(rel.startswith("videos/2026-09/2026-09-25_"))
        self.assertTrue(rel.endswith("_möwe-über-dem-meer-4k_abc123def456.mp4"), rel)
        # alte, flache Datei wird beim Start einsortiert
        (server.DATA / "bilder" / "altbild00001.png").write_bytes(png())
        server.schreib_json("bilder.json", [{"id": "altbild00001", "owner": "anna", "datei": "altbild00001.png",
                                             "mime": "image/png", "typ": "bild", "erstellt": "2026-08-01T09:00:00+00:00",
                                             "prompt": "Alter Leuchtturm"}])
        self.assertEqual(server.ablage_einsortieren(), 1)
        b = server.bild_finden("altbild00001")
        self.assertTrue(b["datei"].startswith("bilder/2026-08/"))
        self.assertTrue(server.medium_pfad(b).is_file())
        self.assertFalse((server.DATA / "bilder" / "altbild00001.png").exists())
        self.assertEqual(server.ablage_einsortieren(), 0, "zweiter Lauf ändert nichts")
        # sehr langer Ablagepfad → Stichwort entfällt, damit die 260-Zeichen-Grenze hält
        lang = Path("C:/" + "x" * 200)
        kurz = server.ablage_relativ("bild", "2026-09-25T10:00:00+00:00", "Ein sehr langes Stichwort", "abc123def456", "png", lang, "anna")
        self.assertTrue(kurz.endswith("_abc123def456.png") and "stichwort" not in kurz, kurz)
        # scheitert das Verschieben, startet der Server trotzdem und die Datei bleibt erreichbar
        (server.DATA / "bilder" / "altbild00002.png").write_bytes(png())
        liste = server.bilder() + [{"id": "altbild00002", "owner": "anna", "datei": "altbild00002.png", "mime": "image/png",
                                    "typ": "bild", "erstellt": "2026-08-01T09:00:00+00:00", "prompt": "x"}]
        server.schreib_json("bilder.json", liste)
        alt_move = server.shutil.move
        server.shutil.move = lambda *a: (_ for _ in ()).throw(OSError("Pfad zu lang"))
        try:
            self.assertEqual(server.ablage_einsortieren(), 0)
        finally:
            server.shutil.move = alt_move
        self.assertTrue(server.medium_pfad(server.bild_finden("altbild00002")).is_file())

    @unittest.skipUnless(server.klon.werkzeug("ffmpeg"), "ffmpeg fehlt")
    def test_sprachauftrag_und_klang(self):
        ff = server.klon.werkzeug("ffmpeg")
        ton = server.DATA / "ton.mp3"
        __import__("subprocess").run([ff, "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-f", "lavfi", "-i",
                                      "sine=frequency=440:duration=2", "-c:a", "libmp3lame", str(ton)], check=True, timeout=60)
        aufrufe = []

        def fake_sprechen(key, modell, text, stimme, basis, refs=None):
            aufrufe.append((modell, text, stimme))
            return ton.read_bytes(), "audio/mpeg", ""

        alt = (server.audio.sprechen, server.api_key)
        server.audio.sprechen, server.api_key = fake_sprechen, lambda: "sk-or-test"
        try:
            job = server.audio_auftrag_starten("anna", {"modell": "test/sprache", "text": "Guten Tag", "stimme": "gibtsnicht",
                                                        "klang": {"tempo": 80, "laut": 110}})
            for _ in range(200):
                if job["status"] != "laufend":
                    break
                time.sleep(0.05)
            self.assertEqual(job["status"], "fertig", job["fehler"])
            self.assertEqual(aufrufe[0][2], "eve", "unbekannte Stimme → Beispielstimme des Modells")
            b = server.bild_finden(job["bilder"][0])
            self.assertEqual((b["typ"], b["mime"]), ("audio", "audio/mpeg"))
            self.assertTrue(b["datei"].startswith("audio/"))
            self.assertAlmostEqual(b["dauer"], 2.5, delta=0.2, msg="Tempo 80 % → 2 s werden ~2,5 s")
            self.assertAlmostEqual(b["kosten"], 0.000015 * len("Guten Tag"), places=6)
            self.assertTrue((server.DATA / "audio_roh" / b["roh"]).is_file(), "Original bleibt erhalten")
            # Klang ändern: aus dem Original, ohne neuen Aufruf
            neu = server.audio_klang_aendern("anna", b["id"], {"tempo": 100})
            self.assertAlmostEqual(neu["dauer"], 2.0, delta=0.15)
            self.assertEqual(len(aufrufe), 1)
            # Stimmprobe: einmal bezahlt, danach aus dem Speicher
            k1 = server.stimmprobe(FAKEA, "rex")
            k2 = server.stimmprobe(FAKEA, "rex")
            self.assertEqual(k1, k2)
            self.assertEqual(len(aufrufe), 2)
            with self.assertRaises(ValueError):
                server.audio_auftrag_starten("anna", {"modell": "test/sprache", "text": "x" * 6000})
        finally:
            server.audio.sprechen, server.api_key = alt

    @unittest.skipUnless(server.klon.werkzeug("ffmpeg"), "ffmpeg fehlt")
    def test_stimme_klonen(self):
        ff = server.klon.werkzeug("ffmpeg")
        probe = server.DATA / "probe.wav"
        __import__("subprocess").run([ff, "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-f", "lavfi", "-i",
                                      "sine=frequency=220:duration=6", str(probe)], check=True, timeout=60)
        server.schreib_json("benutzer.json", {"anna": {"name": "A", "rolle": "admin"}})
        srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        port = srv.server_address[1]
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        token, csrf = server.sitzung_neu("anna")
        kopf = {"Host": f"127.0.0.1:{port}", "Cookie": f"bildgen_sid={token}", "X-CSRF": csrf}
        try:
            c = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
            c.request("POST", "/api/stimme_upload", body=probe.read_bytes(), headers={**kopf, "Content-Type": "audio/wav"})
            r = c.getresponse()
            up = json.loads(r.read())
            self.assertEqual(r.status, 200, up)
            with self.assertRaises(server.Fehler):
                server.stimme_anlegen("anna", {"upload": up["id"], "name": "Ich"})          # ohne Einwilligung
            st = server.stimme_anlegen("anna", {"upload": up["id"], "name": "Ich", "transkript": "Hallo", "einwilligung": True})
            self.assertAlmostEqual(st["dauer"], 6.0, delta=0.3)
            self.assertTrue((server.DATA / "stimmen" / f"{st['id']}.mp3").is_file())
            self.assertFalse(list((server.DATA / "stimmen" / "_roh").glob("*")), "Rohupload wird entfernt")
            with self.assertRaises(server.Fehler):
                server.eigene_stimme("bert", st["id"])                                     # fremde Stimme
            with self.assertRaises(ValueError):
                server.audio_auftrag_starten("anna", {"modell": "test/sprache", "text": "Hi", "klon": st["id"]})
            gesehen = {}

            def fake(key, modell, text, stimme, basis, refs=None):
                gesehen["refs"] = refs
                gesehen.setdefault("stimmen", []).append(stimme)
                return b"ID3" + b"\x00" * 200, "audio/mpeg", ""

            alt = (server.audio.sprechen, server.api_key)
            server.audio.sprechen, server.api_key = fake, lambda: "sk-or-test"
            FAKEA["klonen"] = True
            try:
                server.stimmprobe(FAKEA, "rex", st["id"], "anna")
                # Auftrag mit geklonter Stimme: auch wenn die Oberfläche noch eine Katalogstimme mitschickt
                job = server.audio_auftrag_starten("anna", {"modell": "test/sprache", "text": "Guten Tag",
                                                            "stimme": "rex", "klon": st["id"]})
                for _ in range(100):
                    if job["status"] != "laufend":
                        break
                    time.sleep(0.05)
                self.assertEqual(job["parameter"]["klon"], st["id"])
            finally:
                FAKEA["klonen"] = False
                server.audio.sprechen, server.api_key = alt
            self.assertEqual(gesehen["refs"][0]["type"], "input_audio")
            self.assertTrue(gesehen["refs"][0]["input_audio"]["data"].startswith("data:audio/mpeg;base64,"))
            self.assertEqual(gesehen["refs"][1], {"type": "text", "text": "Hallo"})
            # Stimmprobe + voice zusammen lehnt Fish Audio mit 400 ab → beim Klonen nie eine Stimme mitschicken
            self.assertEqual(gesehen["stimmen"], ["", ""])
        finally:
            srv.shutdown()

    def test_profile_mit_klon_und_standard(self):
        roh = [{"id": "abc123def456", "name": "Solon", "modell": "fish-audio/s2.1-pro", "stimme": "", "klon": "c16ff94f10c7"},
               {"id": "nneu12345", "name": "Neu", "modell": "x", "stimme": "eve", "klon": "../boese"}]
        out = server.profile_saeubern(roh)
        self.assertEqual(out[0]["klon"], "c16ff94f10c7", "geklonte Stimme bleibt im Profil")
        self.assertEqual(out[1]["klon"], "", "ungültige Kennung wird verworfen")
        self.assertEqual(out[1]["id"], "nneu12345", "neue Zeile behält ihre Kennung (für „Standard“)")

    def test_stimmenliste_bleibt_bei_abrufpanne(self):
        server.AKATALOG.update({"modelle": [dict(FAKEA)], "stand": 0, "fehler": ""})
        alt = (server.or_anfrage, server.audio.llms_laden)
        server.or_anfrage = lambda pfad, **kw: ({"data": [{"id": "test/sprache", "name": "Test: Sprache",
                                                             "pricing": {"prompt": "0.000015"}}]} if "output_modalities" in pfad else {})
        server.audio.llms_laden = lambda mid, timeout=20: ""          # openrouter.ai antwortet gerade nicht
        try:
            k = server.akatalog_laden(erzwingen=True)
            m = next(x for x in k["modelle"] if x["id"] == "test/sprache")
            self.assertEqual(m["stimmen"], FAKEA["stimmen"], "letzte bekannte Stimmen bleiben erhalten")
            self.assertLess(k["stand"], time.time() - server.KATALOG_TTL + 20 * 60, "mit Lücke bald neu versuchen")
            server.audio.llms_laden = lambda mid, timeout=20: '- voice: "eve" | "ara" (optional)\n'
            m = next(x for x in server.akatalog_laden(erzwingen=True)["modelle"] if x["id"] == "test/sprache")
            self.assertEqual(m["stimmen"], ["eve", "ara"])
            self.assertGreater(server.AKATALOG["stand"], time.time() - 60, "ohne Lücke volle Frist")
        finally:
            server.or_anfrage, server.audio.llms_laden = alt
            server.AKATALOG.update({"modelle": [FAKEA], "stand": time.time(), "fehler": ""})

    def test_feinjustierung_speichern(self):
        server.AKATALOG.update({"modelle": [FAKEA], "stand": time.time(), "fehler": ""})
        klang = {"tempo": 90, "tiefe": 3, "klarheit": -2, "laut": 110}
        d = server.stimmprofil_speichern({"name": "Solon ruhig", "modell": "test/sprache", "stimme": "rex",
                                          "klon": "c16ff94f10c7", "klang": klang})
        self.assertFalse(d["ueberschrieben"])
        p = d["profil"]
        self.assertEqual((p["name"], p["stimme"], p["klon"], p["klang"]), ("Solon ruhig", "rex", "c16ff94f10c7", klang))
        anzahl = len(d["profile"])
        d2 = server.stimmprofil_speichern({"name": "solon RUHIG", "modell": "test/sprache", "stimme": "eve",
                                           "klang": {"tempo": 999}, "standard": True})
        self.assertTrue(d2["ueberschrieben"], "gleicher Name ohne Groß/klein überschreibt")
        self.assertEqual(len(d2["profile"]), anzahl, "kein Duplikat")
        self.assertEqual(d2["profil"]["id"], p["id"], "Kennung bleibt beim Überschreiben")
        self.assertEqual(d2["profil"]["klang"]["tempo"], 130, "Regler werden auf ihren Bereich gestutzt")
        self.assertEqual(server.einstellungen()["standard_profil"], p["id"])
        with self.assertRaises(server.Fehler):
            server.stimmprofil_speichern({"name": "x", "modell": "gibt/esnicht"})
        with self.assertRaises(server.Fehler):
            server.stimmprofil_speichern({"name": "  ", "modell": "test/sprache"})

    def test_pcm_pflicht_wird_gelernt(self):
        import io
        import urllib.error
        a = server.audio
        formate = []

        class Antwort:
            headers = {"Content-Type": "audio/pcm;rate=24000", "X-Generation-Id": "g1"}
            def __enter__(self): return self
            def __exit__(self, *x): return False
            def read(self, n=-1): return b"\x00\x01" * 100

        def fake(req, timeout=0):
            fmt = json.loads(req.data)["response_format"]
            formate.append(fmt)
            if fmt != "pcm":
                raise urllib.error.HTTPError(req.full_url, 400, "Bad Request", {}, io.BytesIO(
                    b'{"error":{"message":"Gemini TTS only supports response_format=\\"pcm\\". Got \\"mp3\\"."}}'))
            return Antwort()
        alt = a.urllib.request.urlopen
        a.urllib.request.urlopen = fake
        a.FORMAT_PFLICHT.pop("google/test-tts", None)
        try:
            daten, art, gid = a.sprechen("k", "google/test-tts", "Hallo", "Kore", "https://x")
            self.assertEqual((art, gid), ("audio/wav", "g1"))
            self.assertEqual(daten[:4], b"RIFF")
            a.sprechen("k", "google/test-tts", "Hallo", "Kore", "https://x")
            self.assertEqual(formate, ["mp3", "pcm", "pcm"], "Format wird gemerkt, kein zweiter Fehlversuch")
        finally:
            a.urllib.request.urlopen = alt
            a.FORMAT_PFLICHT.pop("google/test-tts", None)

    def test_medium_pfad_nach_umbenennung(self):
        rel = "Bilder/2026-09/x_umbenannt.png"
        ziel = server.ablage_wurzel() / "anna" / "Bilder" / "2026-09" / "x_umbenannt.png"
        ziel.parent.mkdir(parents=True, exist_ok=True)
        ziel.write_bytes(png())
        alt_wurzel = str(Path(TMP) / "GibtsNichtMehr" / "Ablage")      # Programmordner wurde umbenannt
        b = {"owner": "anna", "datei": rel, "wurzel": alt_wurzel}
        self.assertEqual(server.medium_pfad(b), ziel, "Datei in der aktuellen Ablage wird gefunden")
        b2 = {"owner": "anna", "datei": "Bilder/2026-09/fehlt.png", "wurzel": alt_wurzel}
        self.assertEqual(server.medium_pfad(b2), Path(alt_wurzel) / "anna" / "Bilder" / "2026-09" / "fehlt.png",
                         "fehlt die Datei überall, bleibt der gespeicherte Pfad")

    def test_lokale_stimme(self):
        ls = server.lokal_stimme
        mid = ls.MODELL_ID
        gesehen = {}

        def fake(text, probe, sprache="de"):
            gesehen.update(text=text, probe=probe)
            return b"RIFF" + b"\x00" * 2000, "audio/wav", ""

        alt = (ls.sprechen, ls.installiert)
        ls.sprechen = fake
        try:
            ls.installiert = lambda: False
            self.assertIsNone(server.audiomodell(mid), "ohne Installation kein lokales Modell")
            ls.installiert = lambda: True
            m = server.audiomodell(mid)
            self.assertTrue(m["lokal"] and m["klonen"] and m["frei"])
            server.tts(m, "Hallo", "standard", [{"type": "input_audio"}], "abc123def456")
            self.assertEqual(gesehen["probe"], server.DATA / "stimmen" / "abc123def456.mp3", "nur der Pfad geht an den Dienst")
            server.tts(m, "Hallo", "standard")
            self.assertIsNone(gesehen["probe"])
        finally:
            ls.sprechen, ls.installiert = alt

    def test_lokaler_dienst_zerlegt_text(self):
        from lokal_stimme import dienst
        text = ("Das ist ein Satz. " * 40) + "Ein sehr langer Satz ohne Punkt " + "und noch mehr Wörter, " * 30 + "Ende."
        stuecke = dienst.teile(text)
        self.assertTrue(all(0 < len(s) <= dienst.TEIL_MAX for s in stuecke))
        self.assertEqual(" ".join(stuecke).split(), text.split(), "kein Wort geht verloren")
        self.assertEqual(dienst.teile("  \n "), [])

    def test_gesamtkatalog(self):
        server.KATALOG.update({"modelle": [FAKE], "stand": time.time(), "fehler": ""})
        server.VKATALOG.update({"modelle": [FAKEV], "stand": time.time(), "fehler": ""})
        server.CHATMODELLE.update({"liste": [{"id": "a/b", "name": "AB", "preis_ein": 1, "preis_aus": 2}], "stand": time.time()})
        k = server.katalog_gesamt()
        self.assertEqual(set(k) >= {"bild", "video", "sprache", "text", "stand"}, True)
        self.assertAlmostEqual(k["bild"][0]["preis_bild"], 0.03 * server.MP["1K"], places=4)
        self.assertEqual((k["video"][0]["preis_sek_min"], k["video"][0]["preis_sek_max"]), (0.08, 0.12))
        self.assertEqual(k["sprache"][0]["id"], "test/sprache")


class Influencer(unittest.TestCase):
    """Influencer › Erstellen: Charaktere anlegen, Bilder anhängen, nur eigene sehen."""
    @classmethod
    def setUpClass(cls):
        cls.alt_data = server.DATA
        server.DATA = Path(tempfile.mkdtemp(prefix="bildgen_inf_"))
        server.verzeichnisse()
        server.KATALOG.update({"modelle": [FAKE], "stand": time.time(), "fehler": ""})
        server.schreib_json("benutzer.json", {"ia": {"name": "A", "rolle": "admin"}, "ib": {"name": "B", "rolle": "nutzer"}})
        cls.srv = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        ta, cls.csrf_a = server.sitzung_neu("ia")
        tb, cls.csrf_b = server.sitzung_neu("ib")
        cls.a, cls.b = f"bildgen_sid={ta}", f"bildgen_sid={tb}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        server.DATA = cls.alt_data

    req = Http.req

    def test_vorlagen_statisch(self):
        st, j, _, _ = self.req("/static/influencer_vorlagen.json")
        self.assertEqual(st, 200)
        self.assertGreaterEqual(len(j["vorlagen"]), 60)
        self.assertEqual(set(j["typen"]), set(server.INFLUENCER_TYPEN))
        self.assertTrue(all(v["typ"] in server.INFLUENCER_TYPEN and v["prompt"] for v in j["vorlagen"]))
        self.assertEqual(len({v["id"] for v in j["vorlagen"]}), len(j["vorlagen"]), "IDs eindeutig")
        self.assertEqual(self.req("/static/influencer.js")[0], 200)
        self.assertEqual(self.req("/static/muster_haupttaenzer.webp")[0], 200)
        self.assertEqual(self.req("/static/bewegung.js")[0], 200)

    def test_uebersetzen(self):
        a, ca = self.a, self.csrf_a
        alt, alt_key = server.assistent.openrouter_strom, server.api_key
        aufrufe = []

        def falsch(key, modell, nachrichten, abbruch, basis=""):
            aufrufe.append(nachrichten[-1]["content"])
            yield "text", "Ein Mann mit Pilzkopf"
            yield "ende", {"kosten": 0.0004}
        server.assistent.openrouter_strom, server.api_key = falsch, lambda: "sk-or-test"
        try:
            b = server.bild_speichern("ia", png(), {"prompt": "A man with a bowl cut", "modell": "x", "modell_name": "x"})
            st, j, _, _ = self.req("/api/uebersetzen", {"bild": b["id"]}, a, ca)
            self.assertEqual((st, j["text"]), (200, "Ein Mann mit Pilzkopf"))
            st, j, _, _ = self.req("/api/uebersetzen", {"bild": b["id"]}, a, ca)
            self.assertEqual((j["text"], j["kosten"], len(aufrufe)), ("Ein Mann mit Pilzkopf", 0, 1), "zweites Mal aus dem Speicher")
            self.assertEqual(self.req("/api/uebersetzen", {"bild": b["id"]}, self.b, self.csrf_b)[0], 404, "fremdes Bild")
        finally:
            server.assistent.openrouter_strom, server.api_key = alt, alt_key

    def test_vorlagen_ordner(self):
        a, ca = self.a, self.csrf_a
        st, j, _, _ = self.req("/api/vorlagen", None, a)
        self.assertEqual(st, 200)
        w = server.vorlagen_wurzel()
        self.assertTrue((w / "videos" / "tanz").is_dir(), "Standardordner werden angelegt")
        (w / "bilder" / "charaktere" / "figur.png").write_bytes(png())
        (w / "bilder" / "charaktere" / "figur.txt").write_text("a man in a black coat", "utf-8")
        (w / "bilder" / "charaktere" / "falsch.png").write_bytes(b"kein bild")
        st, j, _, _ = self.req("/api/vorlagen", None, a)
        v = next(x for x in j["vorlagen"] if x["name"] == "figur")
        self.assertEqual((v["art"], v["ordner"], v["prompt"]), ("bild", "charaktere", "a man in a black coat"))
        self.assertEqual(self.req(v["url"], None, a)[0], 200)
        self.assertEqual(self.req("/vorlage/bilder/charaktere/falsch.png", None, a)[0], 415)
        self.assertEqual(self.req("/vorlage/bilder/..%2F..%2Fserver.py", None, a)[0], 404)
        self.assertEqual(self.req("/vorlage/bilder/charaktere/figur.png")[0], 401)
        st, j, _, _ = self.req("/api/vorlagen/uebernehmen", {"pfad": v["pfad"]}, a, ca)
        self.assertEqual(st, 200)
        self.assertTrue(j["url"].startswith("/upload/"))
        self.assertEqual(self.req("/api/vorlagen/uebernehmen", {"pfad": "bilder/../../x.png"}, a, ca)[0], 404)

    def test_ablauf(self):
        a, ca, b, cb = self.a, self.csrf_a, self.b, self.csrf_b
        self.assertEqual(self.req("/api/influencer", {"name": " "}, a, ca)[0], 400)
        st, j, _, _ = self.req("/api/influencer", {"name": "Quak Drip", "typ": "frosch", "prompt": "frog", "vorlage_id": "IF-41"}, a, ca)
        self.assertEqual(st, 200, j)
        iid = j["id"]
        st, j, _, _ = self.req("/api/influencer", {"name": "Ohne Typ", "typ": "drache"}, a, ca)
        self.assertEqual(next(i for i in j["influencer"] if i["id"] == j["id"])["typ"], "normal", "unbekannter Typ → normal")
        # fremder Nutzer sieht und ändert nichts
        self.assertEqual(self.req("/api/influencer", cookie=b)[1]["influencer"], [])
        self.assertEqual(self.req(f"/api/influencer/{iid}/loeschen", {}, b, cb)[0], 404)
        self.assertEqual(self.req("/api/influencer", {"id": iid, "name": "Gekapert"}, b, cb)[0], 404)

        def fake(pfad, daten=None, timeout=30, mit_key=True):
            return {"data": [{"b64_json": base64.b64encode(png(4, 4)).decode()}], "usage": {"cost": 0.01}}

        alt_or, alt_key = server.or_anfrage, server.api_key
        server.or_anfrage, server.api_key = fake, lambda: "sk-or-test"
        try:
            self.assertEqual(self.req("/api/erzeugen", {"prompt": "x", "modell": FAKE["id"], "influencer_id": iid}, b, cb)[0], 404)
            st, j, _, _ = self.req("/api/erzeugen", {"prompt": "frog", "modell": FAKE["id"], "influencer_id": iid}, a, ca)
            self.assertEqual(st, 200, j)
            self.assertEqual(j["auftrag"]["influencer"], iid)
            for _ in range(50):
                _, j, _, _ = self.req("/api/auftraege", cookie=a)
                if all(x["status"] != "laufend" for x in j["auftraege"]):
                    break
                time.sleep(0.1)
        finally:
            server.or_anfrage, server.api_key = alt_or, alt_key
        _, j, _, _ = self.req("/api/influencer", cookie=a)
        quak = next(i for i in j["influencer"] if i["id"] == iid)
        self.assertEqual(len(quak["bilder"]), 1)
        bid = quak["bilder"][0]["id"]
        self.assertEqual(quak["bilder"][0]["url"], f"/bild/{bid}")
        # umbenennen, löschen – das Bild bleibt in der Bibliothek
        _, j, _, _ = self.req("/api/influencer", {"id": iid, "name": "Quak 2", "typ": "frosch"}, a, ca)
        self.assertEqual(next(i for i in j["influencer"] if i["id"] == iid)["name"], "Quak 2")
        _, j, _, _ = self.req(f"/api/influencer/{iid}/loeschen", {}, a, ca)
        self.assertFalse(any(i["id"] == iid for i in j["influencer"]))
        self.assertTrue(any(x["id"] == bid for x in self.req("/api/bilder?ansicht=alle", cookie=a)[1]["bilder"]))

    def test_assistent_kontext(self):
        t = server.assistent.anweisungen("assistent", [], [], {"modus": "influencer", "influencer": {"typ": "katze", "besonderheiten": "Goldkette"}}, "englisch")
        self.assertIn("```influencer", t)
        self.assertIn("Goldkette", t)
        self.assertNotIn("```influencer", server.assistent.anweisungen("assistent", [], [], {"modus": "bild"}, "englisch"))
        # technischer Rat zu den Bildrollen im Video, samt aktuellem Stand
        v = server.assistent.anweisungen("assistent", [], [], {"modus": "video", "bildrollen": {"vorlagen": 7, "raster": "3x2"}}, "englisch")
        for wort in ("Startbild (frame_images first_frame)", "Vorlage (input_references", "Storyboard-Raster", "schließen sich aus"):
            self.assertIn(wort, v)
        self.assertIn("Vorlagen 3 · Storyboard-Raster 3x2", v)


if __name__ == "__main__":
    unittest.main()
