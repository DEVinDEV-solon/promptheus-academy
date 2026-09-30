/* PROMPTHEUS — Das Tor: Einrichtung, Anmeldung, Urkundenpruefung.
 *
 * Eine eigene kleine Datei statt app.js: auf der Anmeldeseite ist niemand
 * angemeldet, und die Academy-Skripte setzen ein Konto voraus. */
'use strict';

async function torRuf(daten) {
  const antwort = await fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(daten)
  });
  let j;
  try { j = await antwort.json(); }
  catch (e) { throw new Error('Der Server hat kein JSON geantwortet (HTTP ' + antwort.status + ').'); }
  if (!j.ok && j.fehler) throw new Error(j.fehler);
  return j;
}

function torFehler(text) {
  const p = document.getElementById('tor-fehler');
  if (p) p.textContent = text || '';
}

function torFormular(id, aktion) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    torFehler('');
    const knopf = form.querySelector('button[type=submit]');
    if (knopf) knopf.disabled = true;
    try {
      const daten = { aktion };
      new FormData(form).forEach((wert, name) => { daten[name] = wert; });
      await torRuf(daten);
      location.reload();
    } catch (fehler) {
      torFehler(fehler.message);
      if (knopf) knopf.disabled = false;
    }
  });
}

torFormular('form-einrichten', 'einrichten');
torFormular('form-anmelden', 'anmelden');

/* Urkundenpruefung — ohne Anmeldung, ohne Namen in der Antwort. */
const formUrkunde = document.getElementById('form-urkunde');
if (formUrkunde) {
  formUrkunde.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ziel = document.getElementById('urkunde-ergebnis');
    ziel.textContent = 'Wird geprüft …';
    try {
      const j = await torRuf({ aktion: 'urkunde_pruefen', code: formUrkunde.code.value });
      const r = j.ergebnis;
      if (!r.gefunden) {
        ziel.innerHTML = '<p class="fehler">✕ ' + r.grund + '</p>';
        return;
      }
      if (r.art === 'abschluss' && r.test) {
        ziel.innerHTML = '<p class="fehler">✕ Das ist eine Testurkunde — zum Ausprobieren erstellt, nicht gültig.</p>';
        return;
      }
      if (r.art === 'abschluss' && !r.siegel_ok) {
        ziel.innerHTML = '<p class="fehler">✕ Das Siegel dieser Urkunde ist gebrochen — sie ist ungültig.</p>';
        return;
      }
      if (!r.gueltig) {
        ziel.innerHTML = '<p class="fehler">✕ Diese Urkunde wurde widerrufen.</p>';
        return;
      }
      // Die Abschluss-Urkunde: kein Name, aber Konto-Hash und Siegel — wer
      // die Urkunde vor sich hat, vergleicht beides mit dem Aufdruck.
      if (r.art === 'abschluss') {
        ziel.innerHTML =
          '<div class="ergebnis richtig">' +
          '<div class="ergebnis-kopf"><span class="zeichen">✓</span> Gültige Abschluss-Urkunde</div>' +
          '<p>Alle sechs Stufen bestanden (Durchgang ' + r.durchgang + ')<br>' +
          'Ausgestellt am ' + new Date(r.ausgestellt).toLocaleDateString('de-DE') + '<br>' +
          'Konto-Hash <code>' + r.konto_hash + '</code><br>' +
          'Siegel <code>' + r.siegel_kurz + '</code></p></div>';
        return;
      }
      ziel.innerHTML =
        '<div class="ergebnis richtig">' +
        '<div class="ergebnis-kopf"><span class="zeichen">✓</span> Gültige Urkunde</div>' +
        '<p>Stufe ' + r.stufe + ' — ' + r.stufe_name + '<br>' +
        'Ausgestellt am ' + new Date(r.ausgestellt).toLocaleDateString('de-DE') + '<br>' +
        r.punkte + ' Punkte in der Prüfung</p></div>';
    } catch (fehler) {
      ziel.innerHTML = '<p class="fehler">' + fehler.message + '</p>';
    }
  });
}
