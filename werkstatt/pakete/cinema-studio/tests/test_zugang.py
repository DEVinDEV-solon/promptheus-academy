"""Tests für zugang.py — die Startsperre (nur mit Ticket aus der Werkstatt).

Aufruf:  python -m unittest discover -s tests -v
"""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

WURZEL = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WURZEL))
import zugang  # noqa: E402

NONCE = "0123456789abcdef0123456789abcdef"
JETZT = 1_800_000_000


class TicketTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="zugang_test_"))
        self.pfad = self.tmp / "ticket.json"

    def schreibe(self, inhalt):
        self.pfad.write_text(inhalt if isinstance(inhalt, str) else json.dumps(inhalt), encoding="utf-8")

    def test_gueltig_und_verbraucht(self):
        self.schreibe({"nonce": NONCE, "ablauf": JETZT + 60})
        self.assertEqual(zugang.ticket_pruefen(self.pfad, JETZT)["nonce"], NONCE)
        self.assertFalse(self.pfad.exists(), "Ticket muss nach dem Lesen weg sein")
        self.assertIsNone(zugang.ticket_pruefen(self.pfad, JETZT), "ein Ticket startet nur einmal")

    def test_fehlt(self):
        self.assertIsNone(zugang.ticket_pruefen(self.pfad, JETZT))

    def test_abgelaufen_wird_trotzdem_verbraucht(self):
        self.schreibe({"nonce": NONCE, "ablauf": JETZT - 1})
        self.assertIsNone(zugang.ticket_pruefen(self.pfad, JETZT))
        self.assertFalse(self.pfad.exists())

    def test_zu_lang_gueltig(self):
        self.schreibe({"nonce": NONCE, "ablauf": JETZT + zugang.HOECHSTENS + 1})
        self.assertIsNone(zugang.ticket_pruefen(self.pfad, JETZT))

    def test_falsche_formen(self):
        for inhalt in ["kein json", "[]", {"ablauf": JETZT + 60},
                       {"nonce": "ZZ" * 16, "ablauf": JETZT + 60},
                       {"nonce": NONCE[:-1], "ablauf": JETZT + 60},
                       {"nonce": NONCE, "ablauf": True},
                       {"nonce": NONCE, "ablauf": str(JETZT + 60)}]:
            with self.subTest(inhalt=inhalt):
                self.schreibe(inhalt)
                self.assertIsNone(zugang.ticket_pruefen(self.pfad, JETZT))
                self.assertFalse(self.pfad.exists())


class EinlassTest(unittest.TestCase):
    def setUp(self):
        self.pfad = Path(tempfile.mkdtemp(prefix="einlass_test_")) / "einlass.json"

    def test_einmal_gueltig(self):
        marke = zugang.einlass_ausstellen(self.pfad, JETZT)
        self.assertRegex(marke, zugang.MARKE_RE)
        self.assertNotIn(marke, self.pfad.read_text(encoding="utf-8"), "die Marke selbst darf nicht gespeichert sein")
        self.assertTrue(zugang.einlass_pruefen(marke, self.pfad, JETZT + 59))
        self.assertFalse(self.pfad.exists())
        self.assertFalse(zugang.einlass_pruefen(marke, self.pfad, JETZT + 1))

    def test_falsche_marke_verbraucht_nicht(self):
        marke = zugang.einlass_ausstellen(self.pfad, JETZT)
        for falsch in ["A" * 43, marke[:-1], marke + "x", "", None, 42, "ä" * 43]:
            with self.subTest(falsch=falsch):
                self.assertFalse(zugang.einlass_pruefen(falsch, self.pfad, JETZT))
        self.assertTrue(zugang.einlass_pruefen(marke, self.pfad, JETZT), "die echte Marke muss danach noch gelten")

    def test_abgelaufen(self):
        marke = zugang.einlass_ausstellen(self.pfad, JETZT)
        self.assertFalse(zugang.einlass_pruefen(marke, self.pfad, JETZT + zugang.EINLASS_SEKUNDEN + 1))
        self.assertFalse(self.pfad.exists(), "abgelaufene Marke wird weggeräumt")

    def test_zu_lang_gueltig(self):
        self.pfad.write_text(json.dumps({"hash": "0" * 64, "ablauf": JETZT + 3600}), encoding="utf-8")
        self.assertFalse(zugang.einlass_pruefen("A" * 43, self.pfad, JETZT))


class BindungTest(unittest.TestCase):
    """zugang/werkstatt.json: Arbeitsordner und Schutzschicht der Werkstatt."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="bindung_test_"))
        self.pfad = self.tmp / "werkstatt.json"
        self.arbeitsordner = self.tmp / "arbeitsordner"
        self.arbeitsordner.mkdir()

    def schreibe(self, daten):
        self.pfad.write_text(json.dumps(daten), encoding="utf-8")

    def test_ohne_datei_ungebunden(self):
        self.assertEqual(zugang.bindung(self.pfad), {"arbeitsordner": None, "schutzschicht": None})

    def test_gueltig(self):
        self.schreibe({"arbeitsordner": str(self.arbeitsordner), "schutzschicht": "http://127.0.0.1:3089"})
        b = zugang.bindung(self.pfad)
        self.assertEqual(b["arbeitsordner"], self.arbeitsordner)
        self.assertEqual(b["schutzschicht"], "http://127.0.0.1:3089")

    def test_fremdes_wird_verworfen(self):
        for sc in ["https://boese.example", "http://0.0.0.0:3089", "http://127.0.0.1:3089/v1", "http://localhost:3089", 5]:
            with self.subTest(schutzschicht=sc):
                self.schreibe({"arbeitsordner": "relativ\\pfad", "schutzschicht": sc})
                self.assertEqual(zugang.bindung(self.pfad), {"arbeitsordner": None, "schutzschicht": None})

    def test_fehlender_ordner_wird_verworfen(self):
        self.schreibe({"arbeitsordner": str(self.tmp / "gibt-es-nicht")})
        self.assertIsNone(zugang.bindung(self.pfad)["arbeitsordner"])

    def test_aenderung_gilt_ohne_neustart(self):
        self.schreibe({"schutzschicht": "http://127.0.0.1:3089"})
        self.assertEqual(zugang.bindung(self.pfad)["schutzschicht"], "http://127.0.0.1:3089")
        self.schreibe({"schutzschicht": "http://127.0.0.1:3090", "x": "laenger, damit sich die Grösse ändert"})
        self.assertEqual(zugang.bindung(self.pfad)["schutzschicht"], "http://127.0.0.1:3090")


class StartTest(unittest.TestCase):
    def test_server_ohne_ticket_startet_nicht(self):
        """`python server.py` ohne Ticket: Rückgabewert 3, Hinweis, kein Server."""
        self.assertFalse(zugang.TICKET.exists(), "Testumgebung darf kein echtes Ticket enthalten")
        # Ohne feste Kodierung: Eltern- und Kindprozess nutzen dieselbe Vorgabe des Systems (unter Windows cp1252).
        lauf = subprocess.run([sys.executable, str(WURZEL / "server.py")], cwd=WURZEL, capture_output=True,
                              text=True, timeout=60)
        self.assertEqual(lauf.returncode, 3)
        self.assertIn("aus der Werkstatt geöffnet", lauf.stdout)
        self.assertNotIn("läuft auf", lauf.stdout)


if __name__ == "__main__":
    unittest.main()
