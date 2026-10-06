// pakete/dsh-client-ui-promptheus/src/index.ts
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { dirname, join as join2 } from "node:path";
import { fileURLToPath } from "node:url";

// pakete/dsh-client-ui-promptheus/src/cinema.ts
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
var CINEMA_PFAD = "/promptheus-cinema";
var CINEMA_PORT_VORGABE = 8796;
var STARTER = "CINEMA-STUDIO-START.bat";
var TICKET_SEKUNDEN = 120;
var WARTEN_SEKUNDEN = 60;
var CINEMA_ORTE = [
  ["scripts", "CINEMA-STUDIO"],
  ["scripts", "CINEMA-STUDIO", ".claude", "worktrees", "image-generator-dashboard-aff1bf", "scripts", "cinemastudio"]
];
function istCinemaOrdner(ordner) {
  return ["server.py", "zugang.py", STARTER].every((datei) => existsSync(join(ordner, datei)));
}
function cinemaOrdner(werkstatt, roh) {
  if (typeof roh === "string" && roh !== "" && isAbsolute(roh) && istCinemaOrdner(roh)) return roh;
  for (const teile of CINEMA_ORTE) {
    const ordner = join(werkstatt, ...teile);
    if (istCinemaOrdner(ordner)) return ordner;
  }
  return void 0;
}
function cinemaPort(roh) {
  const zahl = typeof roh === "string" && /^\d{4,5}$/.test(roh) ? Number(roh) : NaN;
  return zahl >= 1024 && zahl <= 65535 ? zahl : CINEMA_PORT_VORGABE;
}
function pfadSicherFuerCmd(pfad) {
  return !/["%^&|<>!\r\n]/.test(pfad);
}
async function laeuft(port) {
  try {
    const antwort = await fetch(`http://127.0.0.1:${port}/`, {
      redirect: "manual",
      signal: AbortSignal.timeout(1500)
    });
    await antwort.body?.cancel();
    return /^Multi-LLM\b/i.test(antwort.headers.get("server") ?? "");
  } catch {
    return false;
  }
}
function ticketSchreiben(ordner, jetzt = Date.now()) {
  const zugang = join(ordner, "zugang");
  mkdirSync(zugang, { recursive: true });
  const ticket = {
    nonce: randomBytes(16).toString("hex"),
    ablauf: Math.floor(jetzt / 1e3) + TICKET_SEKUNDEN,
    von: "werkstatt"
  };
  const zwischen = join(zugang, `ticket.${randomBytes(4).toString("hex")}.tmp`);
  writeFileSync(zwischen, JSON.stringify(ticket), "utf8");
  const ziel = join(zugang, "ticket.json");
  renameSync(zwischen, ziel);
  return ziel;
}
var EINLASS_SEKUNDEN = 60;
function einlassAusstellen(ordner, jetzt = Date.now()) {
  const zugang = join(ordner, "zugang");
  mkdirSync(zugang, { recursive: true });
  const marke = randomBytes(32).toString("base64url");
  const daten = {
    hash: createHash("sha256").update(marke).digest("hex"),
    ablauf: Math.floor(jetzt / 1e3) + EINLASS_SEKUNDEN
  };
  const zwischen = join(zugang, `einlass.${randomBytes(4).toString("hex")}.tmp`);
  writeFileSync(zwischen, JSON.stringify(daten), "utf8");
  renameSync(zwischen, join(zugang, "einlass.json"));
  return marke;
}
function arbeitsordnerFinden(dshHome) {
  let j;
  try {
    j = JSON.parse(readFileSync(join(dshHome, "storages", "workspace.json"), "utf8"));
  } catch {
    return void 0;
  }
  const tabelle = j?.tables?.workspaces ?? {};
  const ids = [j?.global?.defaultWorkspaceId, ...Array.isArray(j?.global?.workspaceIds) ? j.global.workspaceIds : []];
  for (const id of ids) {
    const pfad = typeof id === "string" ? tabelle[id]?.path : void 0;
    if (typeof pfad === "string" && isAbsolute(pfad) && existsSync(pfad)) return pfad;
  }
  return void 0;
}
function bindungSchreiben(ordner, bindung) {
  const zugang = join(ordner, "zugang");
  mkdirSync(zugang, { recursive: true });
  const daten = {
    arbeitsordner: bindung.arbeitsordner ?? null,
    schutzschicht: typeof bindung.schutzschicht === "string" && /^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(bindung.schutzschicht) ? bindung.schutzschicht : null
  };
  const zwischen = join(zugang, `werkstatt.${randomBytes(4).toString("hex")}.tmp`);
  writeFileSync(zwischen, JSON.stringify(daten), "utf8");
  renameSync(zwischen, join(zugang, "werkstatt.json"));
}
function starterUmgebung(umgebung) {
  const weg = /^(OPENROUTER_|DEEPSEEK_|ANTHROPIC_|OPENAI_|DSH_|PROMPTHEUS_|CLAUDE_CODE_|BILDGEN_)|^NODE_OPTIONS$/i;
  const sauber = {};
  for (const [name2, wert] of Object.entries(umgebung)) {
    if (typeof wert === "string" && !weg.test(name2)) sauber[name2] = wert;
  }
  return sauber;
}
function starterAufrufen(ordner) {
  const zeile = `"start "PROMPTHEUS Cinema Studio" /d "${ordner}" "${join(ordner, STARTER)}""`;
  const kind = spawn("cmd.exe", ["/d", "/s", "/c", zeile], {
    cwd: ordner,
    env: starterUmgebung(process.env),
    detached: true,
    stdio: "ignore",
    windowsVerbatimArguments: true
  });
  kind.on("error", () => {
  });
  kind.unref();
}
function eigeneSeite(req) {
  return String(req?.headers?.["sec-fetch-site"] ?? "") === "same-origin";
}
function json(res, code, daten) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(daten));
}
function cinemaRouten(u) {
  const starten = u.starten ?? starterAufrufen;
  const laeuftPruefen = u.laeuftPruefen ?? laeuft;
  const jetzt = u.jetzt ?? Date.now;
  const binden = (ordner) => bindungSchreiben(ordner, {
    arbeitsordner: u.dshHome === void 0 ? void 0 : arbeitsordnerFinden(u.dshHome),
    schutzschicht: u.schutz
  });
  const weiter = (ordner) => {
    binden(ordner);
    return `http://127.0.0.1:${u.port}/#e=${einlassAusstellen(ordner, jetzt())}`;
  };
  let letzterStart = 0;
  return {
    [CINEMA_PFAD]: (req, res) => {
      if (req?.method !== "GET" && req?.method !== "HEAD") return json(res, 405, { fehler: "nur GET" });
      const nonce = randomBytes(16).toString("base64");
      res.writeHead(eigeneSeite(req) ? 200 : 403, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
        "content-security-policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`
      });
      res.end(req?.method === "HEAD" ? void 0 : startseite(nonce, eigeneSeite(req)));
    },
    [`${CINEMA_PFAD}/starten`]: (req, res) => {
      if (req?.method !== "POST") return json(res, 405, { fehler: "nur POST" });
      if (!eigeneSeite(req)) return json(res, 403, { fehler: "fremd" });
      void (async () => {
        const ordner = cinemaOrdner(u.werkstatt, u.ordnerRoh);
        if (ordner === void 0) return json(res, 404, { fehler: "nicht-eingerichtet" });
        if (await laeuftPruefen(u.port)) {
          try {
            return json(res, 200, { stand: "laeuft", adresse: weiter(ordner) });
          } catch {
            return json(res, 500, { fehler: "start" });
          }
        }
        if (jetzt() - letzterStart < WARTEN_SEKUNDEN * 1e3) return json(res, 200, { stand: "startet" });
        if (!pfadSicherFuerCmd(ordner)) return json(res, 500, { fehler: "pfad" });
        try {
          binden(ordner);
          ticketSchreiben(ordner, jetzt());
          starten(ordner);
        } catch {
          return json(res, 500, { fehler: "start" });
        }
        letzterStart = jetzt();
        return json(res, 200, { stand: "startet" });
      })();
    },
    [`${CINEMA_PFAD}/stand`]: (req, res) => {
      if (req?.method !== "GET") return json(res, 405, { fehler: "nur GET" });
      if (!eigeneSeite(req)) return json(res, 403, { fehler: "fremd" });
      void (async () => {
        if (!await laeuftPruefen(u.port)) return json(res, 200, { stand: "startet" });
        const ordner = cinemaOrdner(u.werkstatt, u.ordnerRoh);
        if (ordner === void 0) return json(res, 404, { fehler: "nicht-eingerichtet" });
        try {
          return json(res, 200, { stand: "laeuft", adresse: weiter(ordner) });
        } catch {
          return json(res, 500, { fehler: "start" });
        }
      })();
    }
  };
}
function startseite(nonce, erlaubt) {
  const SEKUNDEN = WARTEN_SEKUNDEN;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cinema Studio wird ge\xF6ffnet \u2014 PROMPTHEUS</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style nonce="${nonce}">
:root{
  --grund:#14110f; --grund-2:#1c1815; --grund-3:#262019; --rand:#3a3129;
  --schrift:#ede5db; --schrift-2:#b3a596; --glut:#ff7a1c; --glut-hell:#ffa347; --gold:#ffc94d;
  --serife:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --grotesk:"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;
  background:var(--grund);color:var(--schrift);font:15px/1.55 var(--grotesk)}
.karte{width:100%;max-width:520px;background:var(--grund-2);border:1px solid var(--rand);border-radius:16px;padding:28px 26px}
.marke{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.marke img{width:40px;height:40px}
.name{font-family:var(--serife);font-size:1.3rem;font-weight:600;letter-spacing:.05em;line-height:1}
.zusatz{font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;color:var(--schrift-2);margin-top:5px}
h1{font-family:var(--serife);font-weight:600;font-size:1.25rem;margin:0 0 6px}
p{margin:0 0 14px;color:var(--schrift-2)}
ol{list-style:none;margin:18px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}
li{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid var(--rand);border-radius:12px;background:var(--grund-3)}
li .punkt{flex:none;width:24px;height:24px;border-radius:50%;border:1px solid var(--rand);display:flex;align-items:center;
  justify-content:center;font-size:.8rem;color:var(--schrift-2);margin-top:1px}
li b{display:block;font-weight:600;color:var(--schrift)}
li span.text{color:var(--schrift-2);font-size:.92rem}
li.aktiv{border-color:var(--glut)}
li.aktiv .punkt{border-color:var(--glut);color:var(--glut);animation:puls 1.4s ease-in-out infinite}
li.fertig .punkt{background:var(--gold);border-color:var(--gold);color:var(--grund)}
@keyframes puls{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){li.aktiv .punkt{animation:none}}
.meldung{margin-top:18px;padding:12px 14px;border-radius:12px;border:1px solid var(--glut);background:var(--grund-3);display:none}
.meldung.an{display:block}
.meldung b{display:block;margin-bottom:4px}
button{margin-top:12px;font:inherit;font-weight:600;padding:9px 16px;border-radius:10px;border:0;cursor:pointer;
  background:linear-gradient(180deg,var(--glut-hell),var(--glut));color:var(--grund)}
button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
</style>
</head>
<body>
<main class="karte" aria-live="polite">
  <div class="marke"><img src="/favicon.svg" alt="">
    <div><div class="name">PROMPTHEUS</div><div class="zusatz">- Cinema Studio -</div></div></div>
  <h1>Cinema Studio wird ge\xF6ffnet</h1>
  <p>Hier erzeugst du gleich Bilder, Videos und Audio. Du musst nichts tun \u2014 diese Seite zeigt dir, was gerade passiert.</p>
  <ol>
    <li id="s1"><span class="punkt">1</span><div><b>Zugang pr\xFCfen</b>
      <span class="text">Die Werkstatt stellt dir einen Zugangsschein aus. Er gilt zwei Minuten und nur f\xFCr diesen einen Start.</span></div></li>
    <li id="s2"><span class="punkt">2</span><div><b>Programm starten</b>
      <span class="text">Gleich \xF6ffnet sich ein schwarzes Fenster. Lass es offen, solange du mit Cinema Studio arbeitest. Schliesst du es, endet Cinema Studio.</span></div></li>
    <li id="s3"><span class="punkt">3</span><div><b>Weiter zu Cinema Studio</b>
      <span class="text">Sobald Cinema Studio bereit ist, geht es hier von selbst weiter.</span></div></li>
  </ol>
  <div class="meldung" id="meldung" role="alert"><b id="mTitel"></b><span id="mText"></span>
    <div><button type="button" id="nochmal">Noch einmal versuchen</button></div></div>
</main>
<script nonce="${nonce}">
(function () {
  var ERLAUBT = ${erlaubt ? "true" : "false"};
  var GRENZE = Date.now() + ${SEKUNDEN} * 1000;
  var MELDUNGEN = {
    fremd: ['Bitte aus der Werkstatt \xF6ffnen', 'Cinema Studio \xF6ffnet sich nur \xFCber den Knopf \u201ECinema-Studio\u201C links unten in der Werkstatt. Geh zur\xFCck in die Werkstatt und klicke dort darauf.'],
    'nicht-eingerichtet': ['Cinema Studio ist auf diesem Rechner nicht eingerichtet', 'Die Werkstatt findet das Programm nicht. Es geh\xF6rt in den Ordner werkstatt\\\\scripts\\\\CINEMA-STUDIO. Wende dich an die Person, die bei dir die Academy betreut.'],
    pfad: ['Der Ordner von Cinema Studio hat einen ungew\xF6hnlichen Namen', 'Im Pfad steht eines der Zeichen " % ^ & | < > !. Damit l\xE4sst sich das Programm nicht sicher starten. Benenne den Ordner um und versuche es dann noch einmal.'],
    start: ['Cinema Studio liess sich nicht starten', 'Die Werkstatt konnte den Zugangsschein nicht ablegen oder das Programm nicht aufrufen. Versuche es noch einmal. Klappt es wieder nicht, starte die Werkstatt neu.'],
    zeit: ['Cinema Studio meldet sich nicht', 'Schau in das schwarze Fenster \u201EPROMPTHEUS Cinema Studio\u201C: Dort steht, was fehlt \u2014 zum Beispiel Python. Ist kein Fenster aufgegangen, versuche es noch einmal.'],
    netz: ['Die Werkstatt antwortet nicht', 'L\xE4uft die Werkstatt noch? Ist ihr Fenster zu, \xF6ffne sie wieder aus der Academy und klicke dann noch einmal auf \u201ECinema-Studio\u201C.']
  };
  function schritt(n) {
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('s' + i);
      el.className = i < n ? 'fertig' : (i === n ? 'aktiv' : '');
      el.querySelector('.punkt').textContent = i < n ? '\\u2713' : String(i);
    }
  }
  function melden(art) {
    var m = MELDUNGEN[art] || MELDUNGEN.start;
    document.getElementById('mTitel').textContent = m[0];
    document.getElementById('mText').textContent = m[1];
    document.getElementById('meldung').className = 'meldung an';
    document.getElementById('nochmal').hidden = art === 'fremd' || art === 'nicht-eingerichtet';
  }
  function weiter(adresse) {
    schritt(4);
    if (/^http:\\/\\/127\\.0\\.0\\.1:\\d{1,5}\\/#e=[A-Za-z0-9_-]{43}$/.test(adresse)) setTimeout(function () { location.replace(adresse); }, 600);
    else melden('start');
  }
  function abfragen() {
    fetch('${CINEMA_PFAD}/stand', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.stand === 'laeuft') return weiter(d.adresse);
      if (Date.now() > GRENZE) return melden('zeit');
      setTimeout(abfragen, 1000);
    }).catch(function () { melden('netz'); });
  }
  function los() {
    document.getElementById('meldung').className = 'meldung';
    GRENZE = Date.now() + ${SEKUNDEN} * 1000;
    if (!ERLAUBT) { schritt(1); return melden('fremd'); }
    schritt(1);
    fetch('${CINEMA_PFAD}/starten', { method: 'POST', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.fehler) return melden(d.fehler);
      if (d.stand === 'laeuft') { schritt(3); return weiter(d.adresse); }
      schritt(2);
      setTimeout(function () { schritt(3); abfragen(); }, 1500);
    }).catch(function () { melden('netz'); });
  }
  document.getElementById('nochmal').addEventListener('click', los);
  los();
})();
</script>
</body>
</html>
`;
}

// pakete/dsh-client-ui-promptheus/src/index.ts
var PRODUKT_TITEL = "Werkstatt \u2014 Promptheus Academy";
var FAVICON_PFAD = "/favicon.svg";
var FAVICON_DUNKEL_PFAD = "/favicon-dark.svg";
var HINTERGRUND_PFAD = "/promptheus-hintergrund.jpg";
var GEMEINDE_PFAD = "/promptheus-community";
var SCHUTZ_PFAD = "/promptheus-schutz";
function schutzAdresse(roh) {
  return typeof roh === "string" && /^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(roh) ? roh : "http://127.0.0.1:3089";
}
function schutzWeiterreichen(req, res, ziel) {
  const antwort = (code, text) => {
    res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(text);
  };
  if (req.method !== "POST") return antwort(405, '{"fehler":"nur POST"}');
  const site = String(req.headers?.["sec-fetch-site"] ?? "");
  if (site !== "same-origin") return antwort(403, '{"fehler":"nur von der Werkstatt-Seite"}');
  const teile = [];
  let laenge = 0;
  req.on("data", (c) => {
    laenge += c.length;
    if (laenge <= 65536) teile.push(c);
  });
  req.on("end", () => {
    if (laenge > 65536) return antwort(413, '{"fehler":"zu gross"}');
    fetch(ziel, { method: "POST", headers: { "content-type": "application/json" }, body: Buffer.concat(teile) }).then(async (r) => antwort(r.status, await r.text())).catch(() => antwort(503, '{"fehler":"Schutzschicht nicht erreichbar"}'));
  });
}
var ACADEMY_VORGABE = "http://127.0.0.1:8801";
var PALETTEN = ["schmiede", "pergament", "olymp", "marmor", "terrakotta", "funkenflug"];
function academyAdresse(roh) {
  return typeof roh === "string" && /^http:\/\/(127\.0\.0\.1|localhost):\d{1,5}$/.test(roh) ? roh : ACADEMY_VORGABE;
}
function gemeindeZiel(academy, url) {
  const v = new URL(url ?? "/", "http://x").searchParams.get("v") ?? "";
  return `${academy}/api.php?aktion=community_oeffnen${PALETTEN.includes(v) ? `&v=${v}` : ""}`;
}
var HINTERGRUND_RELATIV = ["assets", "img", "promptheus-background.jpg"];
var name = "promptheus-werkstatt";
var inject = ["webServer"];
var MARKE_RELATIV = ["Brand", "mark.svg"];
function markeLesen() {
  const roh = dateiLesen(MARKE_RELATIV);
  return roh === void 0 ? void 0 : roh.toString("utf8");
}
function dateiLesen(relativ) {
  const hier = dirname(fileURLToPath(import.meta.url));
  const kandidaten = [
    join2(hier, "..", ".."),
    // …\werkstatt
    join2(hier, "..", "..", ".."),
    // …\PROMPTHEUS
    join2(hier, "..", "..", "..", "..")
    // …\scripts
  ];
  for (const basis of kandidaten) {
    for (const teil of [relativ, ["werkstatt", ...relativ]]) {
      const pfad = join2(basis, ...teil);
      if (existsSync2(pfad)) return readFileSync2(pfad);
    }
  }
  return void 0;
}
var UEBERSETZUNGS_SCHUTZ = `
(function () {
  if (typeof Node !== 'function' || !Node.prototype) return;
  if (Node.prototype.__promptheusGuarded) return;
  Node.prototype.__promptheusGuarded = true;
  var originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) return child;
    return originalRemoveChild.apply(this, arguments);
  };
  var originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.apply(this, arguments);
  };
})();
`;
function apply(ctx) {
  const webServer = ctx.get?.("webServer");
  if (webServer === void 0) return;
  const academy = academyAdresse(process.env.PROMPTHEUS_ACADEMY_URL);
  ctx.effect(() => webServer.register({
    kind: "exact",
    path: GEMEINDE_PFAD,
    handler: (req, res) => {
      res.writeHead(302, {
        "location": gemeindeZiel(academy, req?.url),
        "cache-control": "no-store",
        "referrer-policy": "no-referrer"
      });
      res.end();
    }
  }), `promptheus: Community ${GEMEINDE_PFAD}`);
  const cinema = cinemaRouten({
    werkstatt: werkstattWurzel(),
    ordnerRoh: process.env.PROMPTHEUS_CINEMA_DIR,
    port: cinemaPort(process.env.PROMPTHEUS_CINEMA_PORT),
    dshHome: process.env.DSH_HOME || join2(werkstattWurzel(), ".dsh"),
    schutz: schutzAdresse(process.env.PROMPTHEUS_SCHUTZ_URL)
  });
  for (const [pfad, handler] of Object.entries(cinema)) {
    ctx.effect(() => webServer.register({ kind: "exact", path: pfad, handler }), `promptheus: Cinema Studio ${pfad}`);
  }
  const schutz = schutzAdresse(process.env.PROMPTHEUS_SCHUTZ_URL);
  for (const weg of ["pruefen", "entscheidung"]) {
    ctx.effect(() => webServer.register({
      kind: "exact",
      path: `${SCHUTZ_PFAD}/${weg}`,
      handler: (req, res) => schutzWeiterreichen(req, res, `${schutz}/schutz/${weg}`)
    }), `promptheus: Schutz ${weg}`);
  }
  ctx.effect(() => ctx.on("webserver/index-inject", (table) => {
    table.push({ kind: "script", placement: "head", text: UEBERSETZUNGS_SCHUTZ });
  }), "promptheus: Schutz gegen \xDCbersetzungserweiterungen");
  ctx.effect(() => ctx.on("webserver/index-inject", (table) => {
    table.push({
      // `<` wird escaped, damit der Wert nicht aus dem Element bricht.
      kind: "html",
      placement: "head",
      html: `<title>${escapeHtml(PRODUKT_TITEL)}</title>`
    });
  }), "promptheus: Browser-Titel");
  const marke = markeLesen();
  if (marke === void 0) {
    ctx.logger?.warn?.("promptheus: Brand/mark.svg nicht gefunden \u2014 der Harness liefert sein eigenes Symbol");
    return;
  }
  for (const pfad of [FAVICON_PFAD, FAVICON_DUNKEL_PFAD]) {
    ctx.effect(() => webServer.register({
      kind: "exact",
      path: pfad,
      handler: (_req, res) => {
        res.writeHead(200, {
          "content-type": "image/svg+xml; charset=utf-8",
          // Kurz zwischenspeichern; die Marke ändert sich nur bei neuem Bau.
          "cache-control": "public, max-age=300"
        });
        res.end(marke);
      }
    }), `promptheus: Favicon ${pfad}`);
  }
  const bild = dateiLesen(HINTERGRUND_RELATIV);
  if (bild === void 0) {
    ctx.logger?.warn?.("promptheus: assets/img/promptheus-background.jpg nicht gefunden \u2014 kein Hintergrundbild");
    return;
  }
  ctx.effect(() => webServer.register({
    kind: "exact",
    path: HINTERGRUND_PFAD,
    handler: (_req, res) => {
      res.writeHead(200, {
        "content-type": "image/jpeg",
        "content-length": String(bild.length),
        // Lange zwischenspeichern: das Bild ändert sich nur, wenn es ersetzt wird.
        "cache-control": "public, max-age=86400"
      });
      res.end(bild);
    }
  }), `promptheus: Hintergrundbild ${HINTERGRUND_PFAD}`);
}
function werkstattWurzel() {
  const start = dirname(fileURLToPath(import.meta.url));
  let ordner = start;
  for (let i = 0; i < 6; i++) {
    if (existsSync2(join2(ordner, "werkzeuge", "starten.mjs"))) return ordner;
    ordner = join2(ordner, "..");
  }
  return join2(start, "..", "..", "..");
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export {
  ACADEMY_VORGABE,
  CINEMA_PFAD,
  FAVICON_DUNKEL_PFAD,
  FAVICON_PFAD,
  GEMEINDE_PFAD,
  HINTERGRUND_PFAD,
  PRODUKT_TITEL,
  SCHUTZ_PFAD,
  academyAdresse,
  apply,
  arbeitsordnerFinden,
  bindungSchreiben,
  cinemaOrdner,
  cinemaPort,
  cinemaRouten,
  einlassAusstellen,
  gemeindeZiel,
  inject,
  name,
  schutzAdresse,
  starterUmgebung,
  ticketSchreiben
};
