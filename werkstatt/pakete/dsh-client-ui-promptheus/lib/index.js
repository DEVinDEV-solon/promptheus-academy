// pakete/dsh-client-ui-promptheus/src/index.ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var PRODUKT_TITEL = "Werkstatt \u2014 Promptheus Academy";
var FAVICON_PFAD = "/favicon.svg";
var FAVICON_DUNKEL_PFAD = "/favicon-dark.svg";
var HINTERGRUND_PFAD = "/promptheus-hintergrund.jpg";
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
    join(hier, "..", ".."),
    // …\werkstatt
    join(hier, "..", "..", ".."),
    // …\PROMPTHEUS
    join(hier, "..", "..", "..", "..")
    // …\scripts
  ];
  for (const basis of kandidaten) {
    for (const teil of [relativ, ["werkstatt", ...relativ]]) {
      const pfad = join(basis, ...teil);
      if (existsSync(pfad)) return readFileSync(pfad);
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
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export {
  FAVICON_DUNKEL_PFAD,
  FAVICON_PFAD,
  HINTERGRUND_PFAD,
  PRODUKT_TITEL,
  apply,
  inject,
  name
};
