window.__ModuleLoader__.load({
	id: "@promptheus/dsh-client-ui-promptheus",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// pakete/dsh-client-ui-promptheus/src/client/index.ts
var index_exports = {};
__export(index_exports, {
  FASSUNG: () => FASSUNG,
  GEMEINDE_URL: () => GEMEINDE_URL,
  apply: () => apply,
  default: () => index_default,
  gemeindeAdresse: () => gemeindeAdresse,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// pakete/dsh-client-ui-promptheus/src/client/anpassungen.ts
var HERO_TITEL_EN = "Earn Talent\u2026";
function anpassungenCss() {
  return `
/* PROMPTHEUS Werkstatt \u2014 Feinanpassungen.
   Erzeugt von pakete/dsh-client-ui-promptheus/src/client/anpassungen.ts. */

/* \u2500\u2500 1. \u201ENeue Session" linksb\xFCndig \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Der Harness zentriert Inhalt und K\xFCrzel in der Knopfmitte
   (.newSessionContent { justify-content: center }). Die Werkstatt setzt den
   Text an den linken Rand, wie es die Liste darunter auch tut.

   **Der Anker.** Der gesuchte Knopf tr\xE4gt kein Merkmal, das ihn allein
   auszeichnet: sein aria-label \u201ENew session" teilt er mit dem Markenknopf
   dar\xFCber, und aria-keyshortcuts mit mehreren. Seine INNERE FORM ist dagegen
   einmalig \u2014 nur hier steht eine Zelle, die ein Sinnbild UND eine Beschriftung
   nebeneinander f\xFChrt:

       button > span > span:has(> svg):has(> span)

   Beim eingeklappten Streifen fehlt die Beschriftung; dann greift die Regel
   nicht, und es gibt auch nichts auszurichten. */
[data-slot="sidebar"] button > span > span:has(> svg):has(> span) {
  justify-content: flex-start;
  /* Der Inhalt f\xFCllt den Knopf nicht mehr mittig, deshalb r\xFCckt er an den
     Innenabstand \u2014 sonst klebte das Sinnbild am Rand. */
  padding-left: 2px;
}

/* \u2500\u2500 2. Der Hero-Titel: eigener Text statt \u201EInto the Unknown" \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Nur unter englischer Sprache \u2014 bei Deutsch rendert der Harness unseren Text
   aus dem eigenen W\xF6rterbuch, und es wird nichts verdoppelt.

   **Der Anker.** Die Kopfzeile des Heros ist

       <div class="headline">
         <span>                       \u2190 die Marke und ihr Rahmen
           <div data-slot="conversation.hero.brand.mark">\u2026
         </span>
         <span class="titleGroup">     \u2190 hier steht der Titel
           <span>Into the Unknown</span>
           <span class="previewBadge">Preview</span>
         </span>
       </div>

   Der Titel ist das ERSTE KIND der Titelgruppe. Eine erste Fassung hatte eine
   Ebene zu tief gesucht und traf ihn deshalb nicht: der eingef\xFCgte Text
   erschien, der englische blieb aber daneben stehen.

   **Keine Backticks in diesen Kommentaren.** Sie stehen in einer
   Vorlagenzeichenkette von TypeScript; ein Backtick darin beendet sie, und der
   Bau bricht ab. Das ist zweimal passiert. */
html[lang="en"] span:has(> [data-slot="conversation.hero.brand.mark"]) + span > span:first-child {
  display: none;
}
html[lang="en"] span:has(> [data-slot="conversation.hero.brand.mark"]) + span::before {
  content: "${HERO_TITEL_EN}";
}
`.trim();
}

// pakete/dsh-client-ui-promptheus/src/client/hintergrund.ts
var BILD_PFAD = "/promptheus-hintergrund.jpg";
var BILDSTAERKE = 0.18;
function hintergrundCss() {
  const schleier = 1 - BILDSTAERKE;
  const deckkraft = Math.round(schleier * 100);
  return `
/* PROMPTHEUS Werkstatt \u2014 Hintergrundbild der Chatseite.
   Erzeugt von pakete/dsh-client-ui-promptheus/src/client/hintergrund.ts.
   Nicht von Hand \xE4ndern: die Bildst\xE4rke steht dort als Zahl. */
:root {
  /* Als Marke ver\xF6ffentlicht, damit Pr\xFCfwerkzeuge dieselbe Zahl lesen statt
     eine eigene zu f\xFChren. Zwei Zahlen an zwei Orten laufen auseinander. */
  --promptheus-bildstaerke: ${BILDSTAERKE};
}

[data-slot="main"] [data-slot="main.conversation"] > * {
  background-image:
    linear-gradient(
      color-mix(in srgb, var(--dsw-alias-bg-base) ${deckkraft}%, transparent),
      color-mix(in srgb, var(--dsw-alias-bg-base) ${deckkraft}%, transparent)
    ),
    url("${BILD_PFAD}");
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  /* Der Grundton bleibt darunter: fehlt das Bild, sieht man ihn. */
  background-color: var(--dsw-alias-bg-base);
}
`.trim();
}

// pakete/dsh-client-ui-promptheus/src/client/paletten.ts
var ZUSTANDSFARBEN = {
  dunkel: { fehler: "#e8635a", erfolg: "#5fbf7a", warnung: "#e5b34a" },
  hell: { fehler: "#b3261e", erfolg: "#1f7a3d", warnung: "#8a5a00" }
};
function markenAus(farben, grundton) {
  const zustand = ZUSTANDSFARBEN[grundton];
  return {
    "--dsw-alias-bg-base": farben.grund,
    "--dsw-alias-bg-layer-1": farben["grund-2"],
    "--dsw-alias-bg-layer-2": farben["grund-3"],
    "--dsw-alias-bg-overlay": farben["grund-2"],
    "--dsw-alias-border-l1": farben.rand,
    "--dsw-alias-border-l2": farben["rand-hell"],
    "--dsw-alias-brand-primary": farben.glut,
    "--dsw-alias-label-primary": farben.schrift,
    "--dsw-alias-label-secondary": farben["schrift-2"],
    // Der Ruhezustand trägt den Hinweiston: gedämpft, aber lesbar.
    "--dsw-alias-state-idle-primary": farben["schrift-3"],
    "--dsw-alias-state-error-primary": zustand.fehler,
    "--dsw-alias-state-success-primary": zustand.erfolg,
    "--dsw-alias-state-warn-primary": zustand.warnung,
    "--dsw-specific-sidebar-fill": farben["grund-2"]
  };
}
var SCHMIEDE = {
  grund: "#14110f",
  "grund-2": "#1c1815",
  "grund-3": "#262019",
  rand: "#3a3129",
  "rand-hell": "#504338",
  schrift: "#ede5db",
  "schrift-2": "#b3a596",
  "schrift-3": "#aaa39c",
  glut: "#ff7a1c",
  "glut-hell": "#ffa347",
  "glut-tief": "#c14e00",
  gold: "#ffc94d",
  lapis: "#4e82b6"
};
var PERGAMENT = {
  grund: "#f7f3ec",
  "grund-2": "#fffdfa",
  "grund-3": "#efe8dc",
  rand: "#ddd2c0",
  "rand-hell": "#c4b49a",
  schrift: "#241d16",
  "schrift-2": "#55483c",
  "schrift-3": "#5a5046",
  glut: "#b74e0c",
  "glut-hell": "#e2711d",
  "glut-tief": "#8f3800",
  gold: "#9a6a00",
  lapis: "#2f6394"
};
var OLYMP = {
  grund: "#0d1420",
  "grund-2": "#141d2c",
  "grund-3": "#1c2839",
  rand: "#2c3a4f",
  "rand-hell": "#3e5069",
  schrift: "#e4ebf5",
  "schrift-2": "#a3b2c6",
  "schrift-3": "#9da9b9",
  glut: "#5b9bd8",
  "glut-hell": "#8dbcea",
  "glut-tief": "#2c5f96",
  gold: "#ffd27a",
  lapis: "#7fb0dd"
};
var MARMOR = {
  grund: "#f4f5f7",
  "grund-2": "#ffffff",
  "grund-3": "#e8eaee",
  rand: "#d3d7de",
  "rand-hell": "#b3bac5",
  schrift: "#1a1e26",
  "schrift-2": "#454c58",
  "schrift-3": "#4d535e",
  glut: "#9a5b1e",
  "glut-hell": "#b06d28",
  "glut-tief": "#6d3c0d",
  gold: "#8a6a12",
  lapis: "#2a5d90"
};
var TERRAKOTTA = {
  grund: "#20120e",
  "grund-2": "#2b1a14",
  "grund-3": "#38231b",
  rand: "#4d3225",
  "rand-hell": "#6b4632",
  schrift: "#f3e3d5",
  "schrift-2": "#c3a794",
  "schrift-3": "#b5a69b",
  glut: "#e0642f",
  "glut-hell": "#f08a58",
  "glut-tief": "#a33d13",
  gold: "#e8b45c",
  lapis: "#5f93ab"
};
var FUNKENFLUG = {
  grund: "#161028",
  "grund-2": "#211838",
  "grund-3": "#2d2149",
  rand: "#413063",
  "rand-hell": "#5b4487",
  schrift: "#f2ecff",
  "schrift-2": "#c0b3dd",
  "schrift-3": "#ada2c8",
  glut: "#ff8a3d",
  "glut-hell": "#ffab6b",
  "glut-tief": "#d1550e",
  gold: "#ffd93d",
  lapis: "#6ac9e8"
};
var PALETTEN = [
  {
    kennung: "schmiede",
    name: "Schmiede",
    was: "Die Vorgabe: Glut auf dunklem Grund, Gold f\xFCr Erfolg.",
    grundton: "dunkel",
    partner: "pergament",
    farben: SCHMIEDE
  },
  {
    kennung: "pergament",
    name: "Pergament",
    was: "Hell und warm, wie ein Buch bei Tageslicht.",
    grundton: "hell",
    partner: "schmiede",
    farben: PERGAMENT
  },
  {
    kennung: "olymp",
    name: "Olymp",
    was: "Nachtblau mit Gold \u2014 ruhiger als die Glut, f\xFCr lange Sitzungen.",
    grundton: "dunkel",
    partner: "marmor",
    farben: OLYMP
  },
  {
    kennung: "marmor",
    name: "Marmor",
    was: "Hell und k\xFChl, sehr ruhig. F\xFCr Bildschirme in hellen R\xE4umen.",
    grundton: "hell",
    partner: "olymp",
    farben: MARMOR
  },
  {
    kennung: "terrakotta",
    name: "Terrakotta",
    was: "Erdig und warm \u2014 gebrannter Ton statt schwarzer Bildschirm.",
    grundton: "dunkel",
    partner: "pergament",
    farben: TERRAKOTTA
  },
  {
    kennung: "funkenflug",
    name: "Funkenflug",
    was: "Kr\xE4ftig und bunt. Gedacht f\xFCr die j\xFCngeren Stufen.",
    grundton: "dunkel",
    partner: "marmor",
    farben: FUNKENFLUG
  }
];
var PALETTEN_VORGABE = "schmiede";
function paletteFinden(kennung) {
  return PALETTEN.find((p) => p.kennung === kennung);
}
function markenPaar(kennung) {
  const gewaehlt = paletteFinden(kennung) ?? paletteFinden(PALETTEN_VORGABE);
  if (gewaehlt === void 0) throw new Error("markenPaar: die Vorgabepalette fehlt in PALETTEN");
  const partner = paletteFinden(gewaehlt.partner) ?? gewaehlt;
  const eigen = markenAus(gewaehlt.farben, gewaehlt.grundton);
  const fremd = markenAus(partner.farben, partner.grundton);
  const hell = gewaehlt.grundton === "hell" ? eigen : fremd;
  const dunkel = gewaehlt.grundton === "dunkel" ? eigen : fremd;
  const aus = {};
  for (const name of Object.keys(eigen)) {
    aus[name] = { light: hell[name], dark: dunkel[name] };
  }
  return aus;
}

// pakete/dsh-client-ui-promptheus/src/client/farbkasten.ts
var SPEICHER = "promptheus.farbkasten.v1";
var SCHICHT = "@promptheus/farbkasten";
var TEXTE = {
  titel: "Farbkasten",
  erklaerung: "Sechs gepr\xFCfte Paletten aus dem Hauptprogramm. Schrift und Kontrast bringt jede mit; die Wahl gilt f\xFCr dieses Ger\xE4t.",
  grundton: { hell: "hell", dunkel: "dunkel" },
  partnerHinweis: "Der Hell/Dunkel-Knopf oben wechselt zur Partnerpalette."
};
function farbschemaAus(ton) {
  return ton === "hell" ? "light" : "dark";
}
function grundtonAus(schema) {
  return schema === "light" ? "hell" : "dunkel";
}
function bereinigen(kennung) {
  if (typeof kennung !== "string") return PALETTEN_VORGABE;
  return paletteFinden(kennung) === void 0 ? PALETTEN_VORGABE : kennung;
}
function wirksam(kennung, ton) {
  const gewaehlt = paletteFinden(bereinigen(kennung));
  if (gewaehlt === void 0) return PALETTEN_VORGABE;
  return gewaehlt.grundton === ton ? gewaehlt.kennung : gewaehlt.partner;
}
function lesen() {
  if (typeof localStorage === "undefined") return PALETTEN_VORGABE;
  try {
    return bereinigen(localStorage.getItem(SPEICHER));
  } catch {
    return PALETTEN_VORGABE;
  }
}
function schreiben(kennung) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SPEICHER, kennung);
  } catch {
  }
}
var Palettenwaehler = class {
  /** Die gewählte Kennung (die Wahl, nicht die Wirkung). */
  kennung;
  /** Der Grundton, der im Harness gerade gilt. */
  ton;
  /** Was zuletzt gemeldet wurde — damit nur echte Änderungen melden. */
  letzteWirkung;
  /** Die Angemeldeten der Anzeige. */
  zuhoerer = /* @__PURE__ */ new Set();
  /**
   * Trägt eine Kennung in die Oberfläche ein.
   *
   * Wird von aussen gereicht, damit dieser Halter den Themendienst nicht selbst
   * kennen muss — dieselbe Trennung, die der Harness zwischen Dienst und
   * Presenter zieht.
   */
  eintragen;
  /**
   * @param eintragen - trägt die Kennung in den Überschreibungs-Layer ein.
   * @param schema - das Farbschema, das beim Aufbau gilt (`'light'`/`'dark'`).
   */
  constructor(eintragen, schema) {
    this.eintragen = eintragen;
    this.ton = grundtonAus(schema);
    this.kennung = lesen();
    this.letzteWirkung = wirksam(this.kennung, this.ton);
  }
  /**
   * Die Palette, die gerade wirkt.
   * @returns die wirksame Palettenkennung.
   */
  getSnapshot() {
    return this.letzteWirkung;
  }
  /**
   * Meldet sich für Änderungen an.
   * @param zuhoerer - wird bei jeder Änderung gerufen.
   * @returns der Abmelder.
   */
  subscribe(zuhoerer) {
    this.zuhoerer.add(zuhoerer);
    return () => {
      this.zuhoerer.delete(zuhoerer);
    };
  }
  /**
   * Übernimmt ein neues Farbschema aus dem Harness.
   *
   *Wird gerufen, wenn der Harness seinen Hell/Dunkel-Schalter bewegt. Die Wahl
   * bleibt, die Wirkung wechselt zur Partnerpalette — und nur, wenn sich dadurch
   * wirklich etwas ändert, wird gemeldet.
   * @param schema - das Farbschema des Harness (`'light'` oder `'dark'`).
   */
  farbschemaSetzen(schema) {
    const ton = grundtonAus(schema);
    if (ton === this.ton) return;
    this.ton = ton;
    const neu = wirksam(this.kennung, ton);
    if (neu === this.letzteWirkung) return;
    this.letzteWirkung = neu;
    for (const zuhoerer of this.zuhoerer) zuhoerer();
  }
  /**
   * Trägt die aktuelle Wahl ein.
   *
   * Der Layer führt beide Seiten, deshalb ist er vom Grundton unabhängig: der
   * Harness wählt beim Umschalten selbst die passende. Beim Start einmal zu
   * rufen.
   */
  anwenden() {
    this.eintragen(this.kennung);
  }
  /**
   * Wählt eine Palette.
   * @param kennung - die gewünschte Kennung; unbekannte werden zur Vorgabe.
   * @returns der Grundton der gewählten Palette, damit der Harness-Schalter
   *   nachgezogen werden kann — übersetzt in sein Farbschema.
   */
  waehlen(kennung) {
    const sauber = bereinigen(kennung);
    const palette = paletteFinden(sauber);
    if (palette === void 0) throw new Error("waehlen: die bereinigte Palette fehlt in PALETTEN");
    this.kennung = sauber;
    schreiben(sauber);
    this.eintragen(sauber);
    this.ton = palette.grundton;
    const neu = wirksam(sauber, this.ton);
    if (neu !== this.letzteWirkung) {
      this.letzteWirkung = neu;
      for (const zuhoerer of this.zuhoerer) zuhoerer();
    }
    return farbschemaAus(palette.grundton);
  }
};
function beschreiben(kennung) {
  const palette = paletteFinden(kennung) ?? paletteFinden(PALETTEN_VORGABE);
  if (palette === void 0) throw new Error("beschreiben: die Vorgabepalette fehlt in PALETTEN");
  return {
    kennung: palette.kennung,
    name: palette.name,
    was: palette.was,
    grundton: palette.grundton,
    partner: palette.partner,
    farben: [palette.farben.grund, palette.farben.glut, palette.farben.gold]
  };
}
function layerAus(kennung) {
  return markenPaar(kennung);
}

// pakete/dsh-client-ui-promptheus/src/client/farbkasten-zeile.ts
var SANS = '"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif';
var SERIFE = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
function Wuerfel(eigenschaften) {
  const React = require("react");
  const { kennung, gewaehlt, aufWahl } = eigenschaften;
  const palette = beschreiben(kennung);
  const React2 = React;
  return React2.createElement(
    "button",
    {
      type: "button",
      // Der Name trägt den Zustand mit: wer nur hört, soll wissen, welche
      // Palette gilt (BRAND.md §1: „Farbe trägt nie allein eine Bedeutung").
      "aria-pressed": gewaehlt,
      title: palette.was,
      onClick: () => {
        aufWahl(kennung);
      },
      style: {
        display: "flex",
        flexDirection: "column",
        gap: ".4rem",
        padding: ".5rem",
        boxSizing: "border-box",
        border: gewaehlt ? "2px solid var(--dsw-alias-brand-primary, #ff7a1c)" : "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.14))",
        borderRadius: "10px",
        // Die Grundfarbe der VORSCHAU, nicht der laufenden Oberfläche.
        background: palette.farben[0],
        color: "var(--dsw-alias-label-primary, #ede5db)",
        fontFamily: SANS,
        textAlign: "left",
        cursor: "pointer",
        minWidth: 0,
        overflow: "hidden"
      }
    },
    // Die Farbkante: Grund, Glut, Gold — die drei, die eine Palette ausmachen.
    React2.createElement(
      "span",
      {
        "aria-hidden": "true",
        style: {
          display: "flex",
          height: "6px",
          borderRadius: "3px",
          overflow: "hidden"
        }
      },
      palette.farben.map((farbe, i) => React2.createElement("span", {
        key: String(i),
        style: { flex: "1", background: farbe }
      }))
    ),
    React2.createElement("span", {
      style: {
        fontFamily: SERIFE,
        fontSize: ".78rem",
        fontWeight: 600,
        // Der Name steht auf der Vorschaufläche, also in der Schriftfarbe
        // DIESER Palette — sonst wäre er auf Pergament weiss auf weiss.
        color: palette.grundton === "hell" ? "#241d16" : "#ede5db",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, palette.name),
    React2.createElement("span", {
      style: {
        fontSize: ".68rem",
        opacity: ".72",
        color: palette.grundton === "hell" ? "#241d16" : "#ede5db"
      }
    }, TEXTE.grundton[palette.grundton] ?? palette.grundton)
  );
}
function FarbkastenZeile(eigenschaften) {
  const React = require("react");
  const gewaehlt = eigenschaften.usePalette((s) => s);
  const aufWahl = eigenschaften.aufWahl;
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: ".6rem", minWidth: 0 } },
    React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: ".86rem",
        fontWeight: 600,
        color: "var(--dsw-alias-label-primary, #ede5db)"
      }
    }, TEXTE.titel),
    React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: ".78rem",
        lineHeight: 1.5,
        color: "var(--dsw-alias-label-secondary, #b3a596)"
      }
    }, TEXTE.erklaerung),
    React.createElement(
      "div",
      {
        role: "group",
        "aria-label": TEXTE.titel,
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: ".5rem"
        }
      },
      PALETTEN.map((p) => React.createElement(Wuerfel, {
        key: p.kennung,
        kennung: p.kennung,
        gewaehlt: p.kennung === gewaehlt,
        aufWahl
      }))
    ),
    React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: ".74rem",
        color: "var(--dsw-alias-label-secondary, #b3a596)"
      }
    }, TEXTE.partnerHinweis)
  );
}

// pakete/dsh-client-ui-promptheus/src/client/marke.ts
var BILDMARKE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="PROMPTHEUS">
  <defs>
    <linearGradient id="pu-flamme" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ff4d1c"/>
      <stop offset=".55" stop-color="#ff9d2e"/>
      <stop offset="1" stop-color="#ffe08a"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="#ffc94d" stroke-width="2" opacity=".42">
    <path d="M8 8 H20 V14 H14 V20 H8 Z"/>
    <path d="M56 8 H44 V14 H50 V20 H56 Z"/>
    <path d="M8 56 H20 V50 H14 V44 H8 Z"/>
    <path d="M56 56 H44 V50 H50 V44 H56 Z"/>
  </g>
  <path d="M32 14C32 14 21 26 21 37a11 11 0 0 0 22 0C43 30 36.5 27.5 36.5 21c0 0-4 4-4 9.5 0 0-4-4-4-10.5 0 0 3.5-6 3.5-6z" fill="url(#pu-flamme)"/>
</svg>`;
var MAEANDER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="square"><path d="M0 28 H32"/><path d="M6 28 V6 H26 V22 H12 V16 H20"/></g></svg>`;

// pakete/dsh-client-ui-promptheus/src/client/woerter/gespraech.ts
var gespraech = {
  // ── Tastenkürzel und Hinweise ──────────────────────────────────────────────
  "shortcut.newline": "Zeilenumbruch",
  "shortcut.complementary": "Gegenst\xFCck zu Warteschlange und Einwurf",
  "shortcut.slash": "Befehlsmen\xFC \xF6ffnen",
  "shortcut.mention": "Verweisemen\xFC \xF6ffnen",
  "hint.plan": "Beschreibe deine Aufgabe, um einen Plan zu erzeugen",
  "hint.goal": "Gib ein Ziel ein \u2014 der Agent arbeitet daran weiter",
  "hint.goal.active": "Ein Ziel l\xE4uft. Du kannst edit, pause, resume oder clear eingeben",
  "placeholder.plan": "Beschreibe deine Aufgabe, um einen Plan zu erzeugen",
  "placeholder.default": "Nachricht senden \xB7 / f\xFCr Befehle \xB7 @ f\xFCr Dateien oder Chats",
  "placeholder.unavailable": "Der Chat ist nicht verf\xFCgbar",
  "placeholder.parentOffline": "Der \xFCbergeordnete Chat ist nicht mehr verbunden. Senden geht nicht mehr; anhalten l\xE4sst sich der Lauf noch.",
  "placeholder.hero": "Beschreibe, was du bauen willst \xB7 / f\xFCr Befehle \xB7 @ f\xFCr Dateien oder Chats",
  "placeholder.workspace": "W\xE4hle einen Arbeitsbereich, um zu beginnen",
  "placeholder.steerQueue": "Strg+Eingabe wirft alle wartenden Nachrichten ein",
  // ── Eingabezeile ───────────────────────────────────────────────────────────
  "input.commands": "Datei hinzuf\xFCgen oder Befehl aufrufen",
  "input.file": "Datei",
  "input.stop": "Erzeugung anhalten",
  "input.send": "Nachricht senden",
  "input.send.queue": "In die Warteschlange",
  "input.send.steer": "Als Einwurf senden",
  // ── Anhänge ────────────────────────────────────────────────────────────────
  "attachment.pending": "Noch nicht gesendete Anh\xE4nge",
  "attachment.scrollLeft": "Anh\xE4nge nach links rollen",
  "attachment.scrollRight": "Anh\xE4nge nach rechts rollen",
  "attachment.dropTitle": "Dateien oder Bilder hierher ziehen, um sie anzuh\xE4ngen",
  "attachment.dropDesc": "H\xF6chstens {count} Bilder, jedes bis {size}",
  "attachment.dropBlocked": "Zur Zeit lassen sich keine Dateien oder Bilder anh\xE4ngen",
  "attachment.directoryDesktopOnly": "Ordner gehen nur in der Desktop-Fassung. Im Browser h\xE4ngst du einzelne Dateien an.",
  "attachment.pathUnavailable": "Der Ordnerpfad liess sich nicht lesen. Zieh den Ordner noch einmal hinein.",
  "attachment.pathUnsupported": "Der Pfad enth\xE4lt Zeichen, auf die sich nicht verweisen l\xE4sst. Benenne ihn um und versuche es noch einmal.",
  // ── Bilder ─────────────────────────────────────────────────────────────────
  "image.pending": "Noch nicht gesendete Bilder",
  "image.openOriginal": "Original ansehen",
  "image.openOriginalLabel": "{label} \u2014 klicken f\xFCr das Original",
  "image.remove": "Bild {name} entfernen",
  "image.original": "Original",
  "image.label": "Bild",
  "image.loadFailed": "Das Bild liess sich nicht laden. Klicke, um es erneut zu versuchen.",
  "image.loading": "Das Bild wird geladen\u2026",
  "image.preview": "Vorschau des Originals",
  "image.closePreview": "Vorschau schliessen",
  "image.unsupportedType": "Nur PNG, JPG, WebP und GIF werden angenommen.",
  "image.tooMany": "Eine Nachricht nimmt h\xF6chstens {count} Bilder.",
  "image.fileTooLarge": "Ein einzelnes Bild darf h\xF6chstens {size} gross sein.",
  "image.totalTooLarge": "Die Bilder sind zusammen gr\xF6sser als {size}. Entferne einige.",
  "image.tooManyPixels": "Das Bild hat zu viele Bildpunkte. Verkleinere es und versuche es noch einmal.",
  "image.dimensionTooLarge": "H\xF6he und Breite d\xFCrfen {size} px nicht \xFCberschreiten. Verkleinere das Bild.",
  "image.modelUnsupported": "Das gew\xE4hlte Modell nimmt keine Bilder. W\xE4hle eines, das Bilder versteht.",
  "image.sendFailed": "Das Bild liess sich nicht senden ({reason}). F\xFCge es noch einmal hinzu.",
  // ── Dateien ────────────────────────────────────────────────────────────────
  "file.pending": "Noch nicht gesendete Dateien",
  "file.remove": "Datei {name} entfernen",
  "file.uploading": "Wird hochgeladen\u2026",
  "file.uploadFailed": "Der Upload ist gescheitert. Klicke, um es erneut zu versuchen.",
  "file.retry": "Upload von {name} erneut versuchen",
  "file.stillUploading": "Die Datei l\xE4dt noch. Warte, bis sie fertig ist, und sende dann.",
  "file.sessionUnavailable": "Der Chat ist nicht verf\xFCgbar \u2014 Hochladen geht nicht.",
  "file.notStaged": "Die Datei wurde noch nicht \xFCbertragen. F\xFCge sie noch einmal hinzu.",
  "file.label": "Datei",
  // ── Kontextanzeige ─────────────────────────────────────────────────────────
  "context.aria": "Kontext zu {percent} belegt",
  "context.used": "Kontext belegt",
  "context.system": "Systemanweisung",
  "context.tools": "Werkzeugbeschreibungen",
  "context.messages": "Nachrichten",
  // ── Einstellung: Senden bei laufender Arbeit ───────────────────────────────
  "settings.enter.title": "Senden, w\xE4hrend der Agent arbeitet",
  "settings.enter.description": "Was Eingabe und Senden-Knopf tun, w\xE4hrend der Agent l\xE4uft. Strg+Eingabe macht immer das andere.",
  "settings.enter.queue": "In die Warteschlange",
  "settings.enter.steer": "Als Einwurf",
  // ── Startseite ─────────────────────────────────────────────────────────────
  "hero.headline": "Talente verdienen\u2026",
  "hero.preview": "Vorschau",
  "hero.chooseWorkspace": "Arbeitsbereich w\xE4hlen",
  "session.hierarchy": "Chat-\xDCbersicht",
  // ── Aufgabenliste ──────────────────────────────────────────────────────────
  "todo.title": "Aufgaben",
  "todo.progress.done": "{done} fertig",
  "todo.progress.active": "{active} in Arbeit",
  "todo.progress.pending": "{pending} offen",
  "todo.status.completed": "Fertig",
  "todo.status.inProgress": "In Arbeit",
  "todo.status.pending": "Offen",
  "todo.rowTitle": "Aufgabenliste \xE4ndern",
  "todo.completed": "{done} von {total} fertig",
  // ── Werkzeugtitel ──────────────────────────────────────────────────────────
  "tool.title.createGoal": "Ziel anlegen",
  "tool.title.getGoal": "Ziel ansehen",
  "tool.title.updateGoal": "Ziel \xE4ndern",
  "tool.preparing.content": "Inhalt wird vorbereitet, {kilobytes} KB",
  "tool.title.createSchedule": "Zeitplan anlegen",
  "tool.title.listSchedules": "Zeitpl\xE4ne ansehen",
  "tool.title.deleteSchedule": "Zeitplan l\xF6schen",
  "tool.title.updateSchedule": "Zeitplan \xE4ndern",
  "tool.title.inspectProviders": "Anbieter pr\xFCfen",
  "tool.title.queryRuntime": "Laufzeit abfragen",
  "tool.title.inspectPlugins": "Erweiterungen pr\xFCfen",
  "tool.title.workflow": "Arbeitsablauf ausf\xFChren",
  "tool.title.ralph": "Ralph-Schleife ausf\xFChren",
  "tool.title.readEvent": "Ereignis lesen",
  "tool.title.searchEvents": "Ereignisse durchsuchen",
  "tool.title.traceEvent": "Ereignis verfolgen",
  "tool.title.searchSessions": "Chats durchsuchen",
  "tool.title.traceSession": "Chat verfolgen",
  "tool.title.listModels": "Verf\xFCgbare Modelle ansehen",
  "tool.title.subagent": "Unteragent starten",
  "tool.title.listAgents": "Unteragenten ansehen",
  "tool.title.sendMessage": "Nachricht senden",
  "tool.title.interruptAgent": "Agent unterbrechen",
  "tool.title.listJobs": "Hintergrundauftr\xE4ge ansehen",
  "tool.title.readJob": "Auftragsausgabe lesen",
  "tool.title.killJob": "Hintergrundauftrag abbrechen",
  "tool.title.openTerminal": "Terminal \xF6ffnen",
  "tool.title.readTerminal": "Terminal lesen",
  "tool.title.listTerminals": "Terminals ansehen",
  "tool.title.signalTerminal": "Signal an das Terminal senden",
  "tool.title.closeTerminal": "Terminal schliessen",
  "tool.title.lsp": "Codesymbole abfragen",
  "tool.title.findDefinition": "Definition finden",
  "tool.title.findReferences": "Verwendungen finden",
  "tool.title.findImplementation": "Umsetzung finden",
  "tool.title.hoverSymbol": "Symbolinformation ansehen",
  "tool.title.spawnTeammate": "Mitarbeiter starten",
  "tool.title.createTeamTask": "Teamaufgabe anlegen",
  "tool.title.getTeamTask": "Teamaufgabe lesen",
  "tool.title.updateTeamTask": "Teamaufgabe \xE4ndern",
  "tool.title.listTeamTasks": "Teamaufgaben ansehen",
  "tool.title.waitAgent": "Auf Unteragenten warten",
  "tool.title.search": "Suchen",
  "tool.title.read": "Lesen",
  "tool.title.bash": "Befehl ausf\xFChren",
  "tool.title.write": "Schreiben",
  "tool.title.edit": "Bearbeiten",
  "tool.title.code": "Quelltext",
  "tool.title.generic": "Werkzeugaufruf",
  "tool.title.inspect": "Cordis-Umgebung abfragen",
  "tool.title.runCordis": "Cordis-Erweiterung ausf\xFChren",
  "tool.title.stopCordis": "Cordis-Erweiterung anhalten",
  "tool.title.removeCordis": "Cordis-Erweiterung entfernen",
  "tool.title.pwsh": "Befehl ausf\xFChren",
  "tool.title.readImage": "Bild lesen",
  "tool.title.grep": "Dateiinhalte durchsuchen",
  "tool.title.glob": "Dateien finden",
  "tool.title.webSearch": "Im Netz suchen",
  "tool.title.webFetch": "Seite abrufen",
  "tool.autoReviewRejected": "Die Auto-Pr\xFCfung hat abgelehnt",
  "tool.autoReviewNotExecuted": "Das Werkzeug wurde nicht ausgef\xFChrt. Grund: {reason}",
  "tool.autoReviewReasonFallback": "Die Auto-Pr\xFCfung hat diesen Vorgang nicht erlaubt",
  // ── Einzelheiten: Zustände ─────────────────────────────────────────────────
  "detail.state": "Zustand",
  "detail.todo.completed": "Fertig",
  "detail.todo.in_progress": "In Arbeit",
  "detail.todo.pending": "Offen",
  "detail.todo.empty": "Die Aufgabenliste ist leer",
  "todo.diff.initial": "Erste Aufzeichnung",
  "todo.diff.compare": "Gegen\xFCber der vorigen Liste",
  "todo.diff.unavailable": "Die vorige Liste ist nicht verf\xFCgbar",
  "todo.diff.noChanges": "Die Liste hat sich nicht ge\xE4ndert",
  "todo.diff.added": "{count} hinzugef\xFCgt",
  "todo.diff.updated": "{count} ge\xE4ndert",
  "todo.diff.removed": "{count} entfernt",
  "todo.diff.unchanged": "{count} unver\xE4ndert",
  "todo.diff.addedItem": "Hinzugef\xFCgt",
  "todo.diff.updatedItem": "Zustand ge\xE4ndert",
  "todo.diff.movedItem": "Reihenfolge ge\xE4ndert",
  "todo.diff.removedItem": "Entfernt",
  // ── Einzelheiten: Ziel ─────────────────────────────────────────────────────
  "detail.goal.empty": "Kein Ziel",
  "detail.goal.active": "L\xE4uft",
  "detail.goal.disarmed": "Wartet auf Fortsetzung",
  "detail.goal.paused": "Angehalten",
  "detail.goal.blocked": "Blockiert",
  "detail.goal.complete": "Fertig",
  "detail.goal.rounds": "Runden",
  "detail.goal.reason": "Grund der Blockade",
  // ── Einzelheiten: Zeitangaben ──────────────────────────────────────────────
  "detail.days": "{count} Tage",
  "detail.hours": "{count} Stunden",
  "detail.minutes": "{count} Minuten",
  "detail.seconds": "{count} Sekunden",
  // ── Einzelheiten: Zeitpläne ────────────────────────────────────────────────
  "detail.schedule.once": "Einmalig",
  "detail.schedule.every": "Alle {interval}",
  "detail.schedule.when": "Geplante Zeit",
  "detail.schedule.frequency": "Wiederholung",
  "detail.schedule.scheduled": "Wartet auf Ausl\xF6sung",
  "detail.schedule.overdue": "F\xE4llig \u2014 wartet darauf, dass der Chat wieder l\xE4uft",
  "detail.schedule.empty": "Kein Zeitplan",
  "detail.schedule.deleted": "Gel\xF6scht",
  "detail.schedule.count": "{count} Zeitpl\xE4ne",
  "detail.schedule.daily": "T\xE4glich {time} ({zone})",
  "detail.schedule.weekly": "W\xF6chentlich {days} {time} ({zone})",
  "detail.schedule.cron": "Cron {expression} ({zone})",
  "detail.weekday.1": "Montag",
  "detail.weekday.2": "Dienstag",
  "detail.weekday.3": "Mittwoch",
  "detail.weekday.4": "Donnerstag",
  "detail.weekday.5": "Freitag",
  "detail.weekday.6": "Samstag",
  "detail.weekday.7": "Sonntag",
  "detail.weekday.join": ", ",
  // ── Einzelheiten: Ergebnis und Zustände ────────────────────────────────────
  "detail.recordedResult": "Ergebnis des Aufrufs",
  "detail.empty": "Noch kein Ergebnis",
  "detail.none": "Keine",
  "detail.yes": "Ja",
  "detail.no": "Nein",
  "detail.moreInInspect": '{count} weitere \u2014 unter \u201EAnsehen" nachlesbar',
  "detail.status.running": "L\xE4uft",
  "detail.status.idle": "Ruht",
  "detail.status.ready": "Bereit",
  "detail.status.inactive": "L\xE4uft nicht",
  "detail.status.provisioning": "Wird vorbereitet",
  "detail.status.failed": "Gescheitert",
  "detail.status.completed": "Fertig",
  "detail.status.deleted": "Gel\xF6scht",
  "detail.status.killed": "Abgebrochen",
  "detail.status.accepted": "Angenommen",
  "detail.status.queued": "In der Warteschlange",
  "detail.status.exited": "Beendet",
  // ── Einzelheiten: Felder ───────────────────────────────────────────────────
  "detail.field.id": "Kennung",
  "detail.field.revision": "Fassung",
  "detail.field.platform": "Plattform",
  "detail.field.provider": "Anbieter",
  "detail.field.model": "Modell",
  "detail.field.role": "Rolle",
  "detail.field.context": "Kontext",
  "detail.field.owner": "Verantwortlich",
  "detail.field.ready": "Bereit ab",
  "detail.field.dependencies": "Voraussetzungen",
  "detail.field.writeScopes": "Schreibbereich",
  "detail.field.warnings": "Hinweise",
  "detail.field.diagnostics": "Fehlerbericht",
  "detail.field.methods": "Methoden",
  "detail.field.inputSchema": "Eingabeschema",
  "detail.field.outputSchema": "Ausgabeschema",
  "detail.field.currentPackage": "Aktuelle Fassung",
  "detail.field.nextPackage": "N\xE4chste Fassung",
  "detail.field.latestRun": "Letzter Lauf",
  "detail.field.packages": "Fassungen",
  "detail.field.registrations": "Anmeldungen",
  "detail.field.props": "Eigenschaften",
  "detail.field.data": "Daten",
  "detail.field.source": "Herkunft",
  "detail.field.content": "Inhalt",
  "detail.field.message": "Nachricht",
  "detail.field.messageId": "Nachrichtenkennung",
  "detail.field.root": "Wurzelknoten",
  "detail.field.pid": "Prozesskennung",
  "detail.field.type": "Art",
  "detail.field.time": "Zeit",
  "detail.field.seq": "Laufende Nummer",
  "detail.field.turn": "Runde",
  "detail.field.step": "Schritt",
  "detail.field.callId": "Aufrufkennung",
  "detail.field.agents": "Gestartete Agenten",
  "detail.field.result": "Ergebnis",
  "detail.field.parent": "\xDCbergeordnet",
  "detail.field.depth": "Ebene",
  "detail.field.exitCode": "R\xFCckgabewert",
  "detail.field.signal": "Signal",
  "detail.field.previousStatus": "Zustand vor der Unterbrechung",
  "detail.field.agent": "Agentenkennung",
  "detail.field.job": "Auftragskennung",
  "detail.field.task": "Auftragsinhalt",
  "detail.field.processGroup": "Prozessgruppe",
  "detail.field.availability": "Verf\xFCgbarkeit",
  "detail.field.bestMatch": "Passendstes Ereignis",
  "detail.field.target": "Zielereignis",
  "detail.field.surface": "Aufgezeichnet",
  "detail.agents.count": "{count} Agenten",
  "detail.jobs.count": "{count} Hintergrundauftr\xE4ge",
  "detail.terminals.count": "{count} Terminals",
  "detail.tasks.count": "{count} Teamaufgaben",
  "detail.tasks.nextPage": "Es folgen weitere Aufgaben; die n\xE4chste Seite beginnt bei {cursor}",
  "detail.locations.count": "{count} Stellen",
  "detail.location": "Zeile {line}, Spalte {column}",
  "detail.receipt.delivered": "Die Nachricht ist angekommen",
  "detail.receipt.interrupt": "Unterbrechung angefordert",
  "detail.receipt.started": "Gestartet",
  "detail.receipt.cancel": "Abbruch angefordert",
  "detail.receipt.alreadyFinished": "Der Auftrag war schon beendet",
  "detail.receipt.signal": "Signal gesendet",
  "detail.receipt.closed": "Geschlossen",
  "detail.receipt.closing": "Wird geschlossen",
  "detail.wait.noProgress": "Es l\xE4uft kein Unteragent",
  "detail.wait.title": "Zustand der Unteragenten",
  "detail.wait.timeout": "Zeit abgelaufen",
  "detail.wait.changed": "\xC4nderung erkannt",
  "detail.agent.reply": "Antwort des Agenten",
  "detail.models.title": "Verf\xFCgbare Modelle",
  "detail.output.lines": "Zeilen {begin}\u2013{end} von {total}",
  "detail.output.truncated": "Die Ausgabe ist gek\xFCrzt",
  "detail.providers.count": "{count} gepr\xFCfte Anbieter",
  "detail.plugins.count": "{count} Erweiterungen",
  "detail.workflow.script": "Ablaufskript",
  "detail.ralph.reportedComplete": "Der Agent meldet Fertigstellung",
  "detail.ralph.reportedBlocker": "Der Agent meldet eine Blockade",
  "detail.ralph.limit": "Die Rundengrenze ist erreicht",
  "detail.report.nextSteps": "Noch zu tun",
  "detail.trace.replacedBy": "Ersetzt durch",
  "detail.trace.replacementChain": "Kette der Ersetzungen",
  "detail.trace.replaces": "Ersetztes Ereignis",
  "detail.trace.sources": "Verwiesene Herk\xFCnfte",
  "detail.trace.derived": "Abgeleitetes Ereignis",
  "detail.trace.ancestors": "\xDCbergeordnete Chats",
  "detail.trace.descendants": "Abgeleitete Chats",
  "detail.matches.count": "{count} Treffer",
  "detail.matches.capped": "Die Trefferzahl ist erreicht. Grenze die Suche weiter ein.",
  "detail.event.neighbors": "Nachbarereignisse",
  // ── Rückfragen ─────────────────────────────────────────────────────────────
  "ask.rowTitle": "R\xFCckfrage",
  "ask.waiting": "Wartet auf Antwort",
  "ask.pending": "Die Arbeit l\xE4uft weiter; du kannst noch antworten",
  "ask.pendingDetail": "Die offene Frage l\xE4sst sich im Eingabefeld beantworten",
  "ask.reopen": "Antworten",
  "ask.review": "Antwort ansehen",
  "ask.closed": "Abgeschlossen",
  "ask.closedDetail": "Diese Frage ist abgeschlossen; das Ergebnis steht im Gespr\xE4ch darunter.",
  "ask.cancelled": "Abgebrochen",
  "ask.cancelledDetail": "Diese Runde wurde abgebrochen, ohne Antwort.",
  "ask.interrupted": "Unterbrochen",
  "ask.interruptedDetail": "Diese Runde wurde unterbrochen, ohne Antwort.",
  "ask.answered": "{answered} von {total} beantwortet",
  "ask.skipped": "Nicht beantwortet",
  // ── Werkzeugzeilen ─────────────────────────────────────────────────────────
  "bash.running": "L\xE4uft",
  "bash.failed": "Gescheitert",
  "bash.stopped": "Angehalten",
  "row.running": "L\xE4uft",
  "row.preparing": "Der Aufruf wird vorbereitet",
  "row.failed": "Gescheitert",
  "row.stopped": "Angehalten",
  "row.input": "Eingabe",
  "row.output": "Ausgabe",
  "row.inspect": "Ansehen",
  // ── Unterschiede, Lesen, Suchen, Netz ──────────────────────────────────────
  "diff.collapseAria": "Unterschiede einklappen",
  "diff.expandAria": "Die \xFCbrigen {count} Zeilen Unterschiede ausklappen",
  "diff.expandRest": "\u2026 {count} weitere Zeilen",
  "read.window": "{shown} von {total} Zeilen",
  "read.collapseAria": "Inhalt einklappen",
  "read.expandAria": "Die \xFCbrigen {count} Zeilen ausklappen",
  "read.expandRest": "\u2026 {count} weitere Zeilen",
  "search.paths": "{shown} Pfade",
  "search.paths.truncated": "{shown} von {total} Pfaden",
  "search.matches": "{shown} Treffer in {files} Dateien",
  "search.matches.truncated": "{shown} von {total} Treffern in {files} Dateien",
  "search.noResults": "Kein Ergebnis",
  "search.collapseAria": "Ergebnisse einklappen",
  "search.expandAria": "Die \xFCbrigen {count} Zeilen Ergebnisse ausklappen",
  "search.expandRest": "\u2026 {count} weitere Zeilen",
  "web.noResults": "Nichts gefunden",
  "web.sourcesTruncated": "Die Quellenliste ist gek\xFCrzt",
  "web.http": "HTTP",
  "web.contentTruncated": "Der Inhalt ist gek\xFCrzt",
  "details.running": "L\xE4uft\u2026",
  // ── Warteschlange ──────────────────────────────────────────────────────────
  "queue.count": "{n} wartende Nachrichten",
  "queue.sending": "Wird gesendet\u2026",
  "queue.image": "Bild einer wartenden Nachricht",
  "queue.file": "Wartende Datei {name}",
  "queue.edit": "Wartende Nachricht bearbeiten",
  "queue.edit.unsupported": "Sie enth\xE4lt Nicht-Text; Bearbeiten geht daf\xFCr noch nicht.",
  "queue.save": "Wartende Nachricht speichern",
  "queue.cancelEdit": "Bearbeiten abbrechen",
  "queue.remove": "Wartende Nachricht entfernen",
  "queue.steer": "Als Einwurf senden",
  "queue.steer.unavailable": "Einwerfen geht nur, w\xE4hrend der Agent l\xE4uft",
  "queue.editFailed": "Das Bearbeiten ist gescheitert: Die Nachricht wird vielleicht schon gesendet.",
  "queue.removeFailed": "Das Entfernen ist gescheitert: Die Nachricht wird vielleicht schon gesendet.",
  "queue.steerFailed": "Der Einwurf ist gescheitert. Versuche es noch einmal.",
  "error.sessionInUse": "Dieser Chat wird bereits benutzt, vermutlich von einer anderen laufenden DSH-Fassung (etwa einem weiteren dsh web oder der Desktop-Fassung). Beende die anderen und versuche es noch einmal.",
  // ── Terminal ───────────────────────────────────────────────────────────────
  "terminal.signal": "Signal {signal}",
  "terminal.exitCode": "R\xFCckgabewert {code}",
  "terminal.noExitCode": "Nicht ordentlich beendet",
  "terminal.running": "L\xE4uft",
  "terminal.failed": "Gescheitert",
  "terminal.done": "Fertig",
  "terminal.noOutput": "Keine Ausgabe",
  "terminal.collapseAria": "Ausgabe einklappen",
  "terminal.expandAria": "Die \xFCbrigen {n} Zeilen Ausgabe ausklappen",
  "terminal.expandRest": "\u2026 {n} weitere Zeilen",
  "terminal.sendInput": "(Eingabe senden)",
  "terminal.session": "Terminal {sessionId}",
  // ── Befehle ────────────────────────────────────────────────────────────────
  "command.attachmentsUnsupported": "/{command} nimmt keine Anh\xE4nge. Entferne sie zuerst."
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/ergebnisse.ts
var ergebnisse = {
  // ── Erzeugte Dateien ───────────────────────────────────────────────────────
  "presented.nativeUnavailable": "F\xFCr diese Datei gibt es keinen Pfad auf diesem Rechner. Sie l\xE4sst sich in der Seitenleiste ansehen.",
  "presented.revealError": "Die Datei liess sich im Dateimanager nicht zeigen. Versuche es noch einmal.",
  "presented.directoryError": "Der Ordner liess sich nicht \xF6ffnen. Versuche es noch einmal.",
  "presented.directoryOpening": "Der Ordner wird ge\xF6ffnet\u2026",
  "presented.directoryOpened": "Der Ordner wurde angefordert",
  "presented.revealed": "Im Dateimanager angefordert",
  "presented.revealing": "Wird im Dateimanager gezeigt\u2026",
  "presented.unavailable": "Auf diesem Rechner gibt es keinen Desktop, \xFCber den sich Dateien oder Ordner mit einem anderen Programm \xF6ffnen liessen. Ansehen in der Seitenleiste geht weiterhin.",
  "presented.retry": "Erneut versuchen",
  "presented.hostError": "Die Angaben zum Desktop liessen sich nicht lesen.",
  "presented.preview": "In der Seitenleiste ansehen",
  "presented.previewButton": "{name} in der Seitenleiste \xF6ffnen",
  "presented.previewCard": "{name} in der Seitenleiste ansehen",
  "presented.all": "Alle {count} Dateien",
  "presented.expandAria": "Alle {count} erzeugten Dateien ausklappen",
  "presented.collapse": "Einklappen",
  "presented.collapseAria": "Die Liste der erzeugten Dateien einklappen",
  "presented.opening": "Wird ge\xF6ffnet\u2026",
  "presented.opened": "\xD6ffnen angefordert",
  "presented.error": "Das \xD6ffnen ist gescheitert. Klicke, um es erneut zu versuchen.",
  "presented.file": "Datei",
  // ── Die Zeile unter der Antwort ────────────────────────────────────────────
  "row.title": "Erzeugte Dateien",
  "row.running": "Wird erzeugt",
  "row.preparing": "Wird vorbereitet",
  "row.ok": "Erzeugt",
  "row.error": "Gescheitert",
  "row.stopped": "Unterbrochen",
  "row.inspect": "Aufruf ansehen",
  // ── Geänderte Dateien ──────────────────────────────────────────────────────
  "changes.title": "{count} Dateien bearbeitet",
  "changes.singleTitle": "{name} bearbeitet",
  "changes.added": "+{count}",
  "changes.deleted": "\u2212{count}",
  "changes.binary": "Bin\xE4rdatei",
  "changes.openReview": "Die \xC4nderungen dieser Runde in der Seitenleiste ansehen",
  "changes.all": "Alle {count} Dateien",
  "changes.expandAria": "Alle {count} ge\xE4nderten Dateien ausklappen",
  "changes.collapse": "Einklappen",
  "changes.collapseAria": "Die Liste der ge\xE4nderten Dateien einklappen",
  "changes.oversized": "Zu gross",
  "changes.viewDiff": "Die \xC4nderungen an {name} ansehen",
  // ── Ansicht der Unterschiede ───────────────────────────────────────────────
  "review.title": "\xC4nderungen der Runde {turn}",
  "review.selectFile": "W\xE4hle eine Datei zum Ansehen",
  "review.split": "Auf Nebeneinander umstellen",
  "review.unified": "Auf Untereinander umstellen",
  "review.splitAria": "Nebeneinander",
  "review.wrap": "Zeilenumbruch einschalten",
  "review.nowrap": "Zeilenumbruch ausschalten",
  "review.wrapAria": "Zeilenumbruch",
  "review.openFile": "Die ganze Datei in der Seitenleiste \xF6ffnen",
  "review.openFileAria": "{name} in der Seitenleiste \xF6ffnen",
  "diff.loading": "Die \xC4nderungen werden gelesen\u2026",
  "diff.missing": "Der Inhalt dieser Runde ist nicht mehr verf\xFCgbar",
  "diff.error": "Die \xC4nderungen liessen sich nicht lesen",
  "diff.binary": "Bin\xE4rdatei \u2014 die \xC4nderungen lassen sich nicht zeigen",
  "diff.oversized": "Die Datei ist zu gross \u2014 die \xC4nderungen lassen sich nicht zeigen",
  "diff.created": "In dieser Runde neu angelegt",
  "diff.deleted": "In dieser Runde gel\xF6scht",
  "diff.unchanged": "Beide Seiten sind gleich",
  "diff.coarse": "Der Zeilenvergleich hat zu lange gedauert; es wird der ganze Dateiaustausch gezeigt.",
  "diff.truncated": "Es werden nur die ersten {count} Zeilen gezeigt"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/erweiterungen.ts
var erweiterungen = {
  // ── Rahmen ─────────────────────────────────────────────────────────────────
  panel: "Erweiterungen",
  title: "Erweiterungen",
  intro: "Erweiterungen einrichten, einschalten und einstellen",
  infoLabel: "\xDCber Erweiterungen",
  infoDescription: 'Hier stellst du die mitgelieferten Erweiterungen ein und verwaltest weitere. Die Liste der eingebauten Erweiterungen mit ihrem Zustand steht unter \u201EEinstellungen \u2192 Eingebaute Erweiterungen".',
  loading: "Erweiterungen werden gelesen\u2026",
  error: "Es liessen sich nicht alle Erweiterungen lesen \u2014 vermutlich ein Netzproblem.",
  unavailable: "Diese Einrichtung hat kein verwaltbares Profil. Erweiterungen lassen sich deshalb weder einrichten noch ein- und ausschalten.",
  retry: "Erneut versuchen",
  refresh: "Neu laden",
  refreshError: "Das Neuladen ist gescheitert. Versuche es noch einmal.",
  empty: "Es ist noch keine Erweiterung eingerichtet.",
  addPlugin: "Erweiterung hinzuf\xFCgen",
  restartNotice: "\xC4nderungen greifen beim n\xE4chsten Start",
  overriddenNotice: "{name} wurde gespeichert, aber von einer h\xF6herrangigen Einstellung \xFCberdeckt und wirkt deshalb zur Zeit nicht",
  bundlesTitle: "Eingerichtet",
  officialTitle: "Mitgeliefert",
  statusProblem: "Auff\xE4llig",
  statusBeta: "Versuchsweise",
  reasonLabel: "Grund",
  // ── Einzelheiten der Erweiterung ───────────────────────────────────────────
  metadataError: "Die Angaben zum Paket sind fehlerhaft: {error}",
  versionTag: "v{version}",
  partsLabel: "Enthaltene Bestandteile",
  partsEmpty: "Dieses Paket enth\xE4lt keine Bestandteile.",
  partsCountTotal: "zusammen {count}",
  partsCountRunning: "{count} laufen",
  partsCountOff: "{count} abgeschaltet",
  partOff: "Abgeschaltet",
  partsCountFailed: "{count} auff\xE4llig",
  partsFilter: "Bestandteile filtern",
  partsFilterEmpty: "Kein Bestandteil passt zum Filter.",
  partToggle: "Bestandteil {name} einschalten",
  rowPhasePending: "Wartet auf Voraussetzungen",
  rowPhaseLoading: "Wird geladen",
  rowPhaseActive: "L\xE4uft",
  rowPhaseFailed: "Auff\xE4llig",
  rowPhaseUnloading: "Wird entfernt",
  enableToggle: "{name} einschalten",
  openDetail: "{name} ansehen",
  backToList: "Zur\xFCck zur Liste",
  crumbRoot: "Erweiterungen",
  backToPackage: "Zur\xFCck zu {name}",
  configureRow: "{name} einstellen",
  rowStateIdle: "L\xE4uft nicht",
  uninstall: "Entfernen",
  uninstallLabel: "{name} entfernen",
  // ── Installation ───────────────────────────────────────────────────────────
  installTitle: "Erweiterung hinzuf\xFCgen",
  installDescription: "Gib den Paketnamen, die Adresse des Git-Repositorys oder den Pfad eines \xF6rtlichen Ordners ein.",
  installSpecLabel: "Paketname oder Adresse",
  installSpecPlaceholder: "zum Beispiel dsh-plugin-whale-pet",
  installGuideToggle: "Anleitung und Beispiele",
  installGuideHide: "Anleitung einklappen",
  installGuideIdTitle: "Den npm-Paketnamen eintragen",
  installGuideIdExample: "dsh-plugin-whale-pet",
  installGuideIdHint: "Der Paketname ist der npm-Name (etwa dsh-xxx oder @autor/name). In der README einer Erweiterung steht er hinter dsh plugin add oder pnpm add.",
  installGuideExampleLabel: "Beispiel:",
  installGitTemplateHint: "Setze hier die wirkliche Adresse des Git-Repositorys ein",
  installPathTemplateHint: "Setze hier den wirklichen Pfad des Ordners auf diesem Rechner ein",
  installGuideFill: "Beispiel einsetzen",
  installGuideFillAria: "Beispiel {example} einsetzen",
  installGuideSafety: "Pr\xFCfe, ob die Herkunft der Erweiterung vertrauensw\xFCrdig ist. Erweiterungen laufen auf diesem Rechner mit deinen Rechten. Eine Erweiterung unbekannter Herkunft kann den DeepSeek Harness besch\xE4digen oder deine Daten lesen und weitergeben.",
  installUpgradeNotice: "Nach der Installation l\xE4sst sich eine Erweiterung noch nicht selbst aktualisieren. Zum Aktualisieren entferne sie und richte die neue Fassung ein.",
  // ── Bezugsquelle ───────────────────────────────────────────────────────────
  registryToggle: "Bezugsquelle",
  registryLegend: "Aus welcher npm-Quelle die Erweiterung geladen wird",
  registryDefault: "Vorgegebene Quelle",
  registryOfficial: "Die offizielle npm-Quelle",
  registryNpmmirror: "Spiegel in China",
  registryCustom: "Eigene Adresse",
  registryCustomPlaceholder: "https://npm.example.com/",
  registryCustomHint: "Trage die Adresse einer internen oder eigenen npm-Quelle ein; sie beginnt mit http:// oder https://. Braucht die Quelle eine Anmeldung, lege die Zugangsdaten in ~/.npmrc auf diesem Rechner ab.",
  registryCustomInvalid: "Die Adresse muss mit http:// oder https:// beginnen",
  registryListSeparator: ", ",
  sentenceSeparator: "",
  // ── Installation: Ablauf ───────────────────────────────────────────────────
  installRun: "Einrichten",
  installChecking: "Wird gepr\xFCft\u2026",
  installProblemInvalid: "Dieser Paketname oder diese Adresse ist nicht zu erkennen: {reason}",
  installProblemInstalled: "Diese Erweiterung ist schon eingerichtet. Zum Aktualisieren entferne sie und richte sie neu ein.",
  installProblemShipped: "Diese Erweiterung kommt mit DSH. Eine neue Fassung bekommst du mit einem DSH-Update.",
  installProblemNotFound: "Es wurde keine passende Erweiterung gefunden.",
  installProblemNotPackage: "Diesen Pfad gibt es nicht, oder dort liegt kein g\xFCltiges Erweiterungspaket.",
  installProblemNotBundle: "Dieses Paket erkl\xE4rt sich nicht als B\xFCndel und l\xE4sst sich deshalb nicht als Erweiterung einrichten: {reason}",
  installProblemNetwork: "Die Bezugsquelle ist nicht erreichbar. Pr\xFCfe die Netzverbindung und versuche es noch einmal.",
  installProblemNetworkAll: "Keine Bezugsquelle war erreichbar (versucht: {registries}). Pr\xFCfe Netz und Proxy oder w\xE4hle eine andere Quelle.",
  installProblemUnknown: "Die Angaben zur Erweiterung liessen sich nicht holen: {reason}",
  installingTitle: "Die Erweiterung wird eingerichtet\u2026",
  installedTitle: "Eingerichtet",
  installFailedTitle: "Das Einrichten ist gescheitert",
  installGithubFailedTitle: "GitHub ist nicht erreichbar",
  installGithubTimeoutTitle: "Die Verbindung zu GitHub hat zu lange gedauert",
  installGithubFailedDescription: "Versuche eine andere Bezugsquelle.",
  installUseGithubMirror: "Spiegel verwenden",
  installTryAnotherWay: "Anderen Weg versuchen",
  installPackageLabel: "Paketname",
  installEdit: "Bearbeiten",
  installEditAria: "Zur\xFCck zum Bearbeiten",
  installCancelAndEdit: "Abbrechen und zur\xFCck zum Bearbeiten",
  installApplyingCancellationError: "Der Abbruch wurde nicht best\xE4tigt. Die Einrichtung l\xE4uft schon aus. Warte das Ergebnis ab. {reason}",
  installReconcile: "Zustand abgleichen",
  installUnknownTitle: "Kein Ergebnis erhalten",
  installUnknownDescription: "Der Dienst kennt diesen Einrichtungsvorgang nicht mehr. Sieh in der Liste nach und versuche es dann erneut.",
  installResultUnconfirmed: "Es kam kein Ergebnis zur\xFCck. Gleiche den Zustand ab. {reason}",
  installAwaitingAcceptance: "Der Dienst hat den Auftrag noch nicht angenommen. Sobald die Best\xE4tigung kommt, wird der Abbruch erneut versucht.",
  installBackgroundUnknown: "Es kam kein Ergebnis zur\xFCck. Sieh in der Liste der Erweiterungen nach.",
  installCancel: "Einrichtung abbrechen",
  installCloseCancels: "Abbrechen und schliessen",
  installViewTask: "Einrichtungsauftrag ansehen",
  installUnconfirmedTitle: "Der Zustand ist noch nicht best\xE4tigt",
  installBackgroundDone: "Die Erweiterung ist eingerichtet. Das Ergebnis l\xE4sst sich ansehen.",
  installBackgroundFailed: "Das Einrichten ist gescheitert. Einzelheiten lassen sich ansehen.",
  installBackgroundUnconfirmed: "Der Zustand ist noch nicht best\xE4tigt. Sieh im Einrichtungsauftrag nach.",
  installBackgroundApplying: "Die Einrichtung l\xE4uft schon aus und l\xE4sst sich nicht mehr abbrechen. Der Fortschritt l\xE4sst sich ansehen.",
  installStarting: "Die Einrichtung wird vorbereitet\u2026",
  installCancelling: "Die Einrichtung wird angehalten\u2026",
  installApplying: "Die Einstellungen werden \xFCbernommen. Einen Augenblick\u2026",
  installCancelledShort: "Abgebrochen",
  installCancelled: "Die Einrichtung wurde abgebrochen. Die Erweiterung ist nicht eingeschaltet; heruntergeladene Dateien k\xF6nnen liegen bleiben.",
  installCancelUnconfirmed: "Dass die Einrichtung angehalten ist, wurde nicht best\xE4tigt. Versuche den Abbruch erneut oder warte das Ergebnis ab. {reason}",
  installEnableNow: "Jetzt einschalten",
  installDetailsShow: "Einzelheiten zeigen",
  installDetailsHide: "Einzelheiten einklappen",
  installVersion: "Fassung {version}",
  installSubjectPath: "\xD6rtlicher Ordner",
  installSubjectGit: "Git-Repository",
  installSubjectTarball: "Archivdatei",
  installLocation: "Eingerichtet unter: {dir}",
  installRetry: "Erneut versuchen",
  installChangeRegistry: "Andere Bezugsquelle",
  installAttempt: "{previous} war nicht erreichbar. Es wird mit {registry} versucht ({index}. von {total} Quellen).",
  installAttemptBadge: "{index}. Versuch \xB7 {registry}",
  // ── Installationsfehler im Einzelnen ───────────────────────────────────────
  installFailureNetwork: "Die Netzverbindung ist gescheitert",
  installFailureNetworkAll: "Keine Bezugsquelle war erreichbar (versucht: {registries}). Pr\xFCfe Netz und Proxy oder w\xE4hle eine andere Quelle und versuche es erneut.",
  installFailureNetworkHost: "{host} ist nicht erreichbar. Git-Adressen und .tgz-Verweise gehen nicht \xFCber die Bezugsquelle; dieser Rechner muss sie selbst erreichen k\xF6nnen, sonst ist ein Proxy n\xF6tig. Ist die Erweiterung auch bei npm ver\xF6ffentlicht, trage statt der Adresse den Paketnamen ein.",
  installFailureNotFound: "Es wurde keine passende Erweiterung gefunden.",
  installFailureNoMatchingVersion: "Es gibt keine passende Fassung.",
  installFailureDiskFull: "Der Speicherplatz reicht nicht. Die Einrichtung wurde angehalten.",
  installFailurePermission: "Es fehlt die Schreibberechtigung. Die Einrichtung geht nicht.",
  installFailureBuildBlocked: "Ein Installationsskript einer Abh\xE4ngigkeit braucht deine Erlaubnis, bevor es weitergeht.",
  installFailureBuildBlockedManual: "pnpm hat ein Installationsskript einer Abh\xE4ngigkeit angehalten. Erlaube es in der Datei pnpm-workspace.yaml des Profils unter allowBuilds und versuche es dann erneut.",
  installFailureIntegrity: "Die Pr\xFCfsumme der geladenen Datei stimmt nicht.",
  installFailureTimeout: "Die Einrichtung hat zu lange gedauert.",
  installFailurePnpmMissing: "pnpm wurde nicht gefunden. Die Einrichtung geht nicht.",
  installFailureGeneric: "W\xE4hrend der Einrichtung ist ein Fehler aufgetreten. Der Grund steht in den Einzelheiten.",
  // ── Ausgabe des Einrichtungsauftrags ───────────────────────────────────────
  terminalRunning: "L\xE4uft",
  terminalFailed: "Gescheitert",
  terminalDone: "Fertig",
  terminalCopy: "Kopieren",
  terminalCopied: "Kopiert",
  terminalNoOutput: "Keine Ausgabe",
  terminalCollapseAria: "Ausgabe einklappen",
  terminalCollapse: "Einklappen",
  terminalExpandAria: "Die \xFCbrigen {n} Zeilen Ausgabe ausklappen",
  terminalExpand: "\u2026 {n} weitere Zeilen",
  terminalExitCode: "R\xFCckgabewert {code}",
  terminalSignal: "Signal {signal}",
  terminalNoExitCode: "Nicht ordentlich beendet",
  // ── Abschluss ──────────────────────────────────────────────────────────────
  installDoneNothing: "Fertig. Es kamen keine neuen Abh\xE4ngigkeiten dazu.",
  installDoneRestart: "Eingerichtet. Die Erweiterung wird beim n\xE4chsten Start geladen.",
  installDoneApproved: "Diese Installationsskripte d\xFCrfen laufen: {names}",
  installApprovalTitle: "Installationsskripte brauchen deine Erlaubnis",
  installApprovalDescription: "Die folgenden Pakete bringen Installationsskripte mit. pnpm f\xFChrt sie von sich aus nicht aus.",
  installApprovalConsequence: "Nach deiner Erlaubnis laufen die Skripte auf diesem Rechner mit deinen Rechten. Die Erlaubnis gilt f\xFCr das aktuelle Profil; danach wird nicht mehr gefragt.",
  installApprovalCaution: "Erlaube es nur, wenn du diesen Paketen vertraust.",
  installApproveAndRetry: "Diese Skripte erlauben und erneut versuchen",
  installClose: "Fertig",
  close: "Schliessen",
  cancel: "Abbrechen",
  // ── Entfernen ──────────────────────────────────────────────────────────────
  confirmUninstallTitle: '\u201E{name}" entfernen?',
  confirmUninstallDescription: "Nach dem Entfernen sind die Funktionen weg, die sie bereitstellt.",
  confirmUninstall: "Entfernen",
  // ── Fehlschläge ────────────────────────────────────────────────────────────
  failedEnable: "Das Einschalten ist gescheitert: {reason}",
  failedDisable: "Das Abschalten ist gescheitert: {reason}",
  failedUninstall: "Das Entfernen ist gescheitert: {reason}",
  failedRowEnable: "Der Bestandteil liess sich nicht einschalten: {reason}",
  failedRowDisable: "Der Bestandteil liess sich nicht abschalten: {reason}",
  // ── Gründe ─────────────────────────────────────────────────────────────────
  reasonManagementRequired: "Wird zur Verwaltung der Erweiterungen gebraucht und l\xE4sst sich deshalb weder abschalten noch entfernen.",
  reasonUnaddressable: "Die Schicht dieses Profils kann diesen Eintrag nicht eindeutig treffen.",
  reasonUnknownPlugin: "Diese Erweiterung wurde nicht gefunden.",
  reasonInvalidSpec: "Gib einen g\xFCltigen Paketnamen oder eine Adresse ein.",
  reasonAmbiguousInstall: "Aus den \xC4nderungen an den Abh\xE4ngigkeiten l\xE4sst sich nicht erkennen, welches Paket eingerichtet wurde.",
  reasonNotBundle: "Dieses Paket erkl\xE4rt sich nicht als B\xFCndel und l\xE4sst sich deshalb nicht als Erweiterung verwalten.",
  reasonNotRemovable: "Dieses Paket geh\xF6rt nicht zum aktuellen Profil, oder es wird zur Verwaltung der Erweiterungen gebraucht.",
  reasonStopProfile: "In diesem Profil ist HMR nicht eingeschaltet. Ein Paket, das gerade benutzt wird, muss angehalten und dann mit dsh plugin entfernt werden.",
  reasonBundleInUse: "Andere Einstellungen benutzen noch Bestandteile dieses B\xFCndels. Schalte sie zuerst ab.",
  reasonStaleApproval: "Die Liste der Skripte, die auf Erlaubnis warten, hat sich ge\xE4ndert. Richte die Erweiterung erneut ein, um sie zu erneuern.",
  reasonIncompatibleVersion: "{plugin} passt nicht zu DSH {runtime} (verlangt {peers}). Der Betrieb kann abst\xFCrzen oder Daten verlieren.",
  reasonIncompatibleVersionUnnamed: "Diese Erweiterung passt nicht zur laufenden DSH-Fassung. Der Betrieb kann abst\xFCrzen oder Daten verlieren.",
  reasonIncompatibleInstall: "Richte eine Fassung ein, die zur laufenden DSH-Fassung passt.",
  reasonIncompatibleInstalled: "Entferne sie und richte eine Fassung ein, die zur laufenden DSH-Fassung passt.",
  reasonOperationError: "Die Host-Seite hat einen Fehler gemeldet"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/runde3.ts
var erweiterungsliste = {
  tab: "Erweiterungsliste",
  loading: "Erweiterungen werden gelesen\u2026",
  clientSyncing: "Die Erweiterungen dieser Seite werden abgeglichen\u2026",
  clientSyncFailed: "Die Erweiterungen dieser Seite liessen sich nicht abgleichen. Der Zustand auf der Serverseite bleibt, wie er war.",
  clientSyncRetry: "Abgleich dieser Seite erneut versuchen",
  error: "Die Erweiterungen lassen sich zur Zeit nicht lesen.",
  metadataError: "Die Angaben zum Paket sind fehlerhaft: {error}",
  retry: "Erneut versuchen",
  search: "Erweiterungen durchsuchen",
  empty: "Keine Erweiterung vorhanden.",
  emptySearch: "Keine Erweiterung passt zur Suche.",
  presetTitle: "Erweiterungen des Chats",
  presetSubtitle: "Werden je Chat aus der Agenten-Voreinstellung zusammengestellt",
  countUnit: "St\xFCck",
  switcherLabel: "W\xE4hle die Agenten-Voreinstellung, die du ansehen willst",
  presetOptionDefault: "{name} (Vorgabe)",
  presetOptionBroken: "{name} (liess sich nicht laden)",
  globalTitle: "Globale Erweiterungen",
  globalSubtitle: "Gelten f\xFCr das System und alle Chats",
  presetProvidedDetail: "Global abgeschaltet; je Chat kommt sie aus der Agenten-Voreinstellung",
  enabledIn: "Eingeschaltet in",
  viewInPreset: "In der Gruppe der Voreinstellung ansehen",
  matchesInOtherPresets: "In anderen Voreinstellungen passen noch {count} weitere:",
  failedCountLabel: "gescheitert",
  enabledTag: "Eingeschaltet",
  disabledTag: "Abgeschaltet",
  conditionalTag: "Bedingt eingeschaltet",
  presetEnabledTag: "In der Voreinstellung eingeschaltet",
  failedTag: "Start gescheitert",
  moduleLabel: "Vollst\xE4ndiger Name",
  fromPreset: "Aus",
  condition: "Bedingung zum Abschalten",
  configuration: "Einstellungszustand",
  runtime: "Laufzustand",
  unobserved: "L\xE4uft nicht",
  pending: "Wartet auf Voraussetzungen",
  loadingPhase: "Wird geladen",
  active: "L\xE4uft",
  failed: "Start gescheitert",
  unloading: "Wird entfernt"
};
var auftraege = {
  "count.live.one": "{count} Hintergrundauftrag l\xE4uft",
  "count.live.other": "{count} Hintergrundauftr\xE4ge laufen",
  "count.idle.one": "{count} Hintergrundauftrag",
  "count.idle.other": "{count} Hintergrundauftr\xE4ge",
  "list.aria": "Hintergrundauftr\xE4ge",
  "section.live": "Laufend",
  "section.settledCount": "{count} abgeschlossen",
  "section.clear": "Leeren",
  "row.expandAria": "Die laufende Ausgabe von {label} ausklappen",
  "row.collapseAria": "Die laufende Ausgabe von {label} einklappen",
  "kill.stop": "Auftrag {label} anhalten",
  "kill.confirm": "Zum Best\xE4tigen noch einmal klicken",
  "kill.confirmAction": "Anhalten best\xE4tigen",
  "kill.failed": "Das Anhalten ist gescheitert",
  "status.running": "L\xE4uft",
  "status.stopping": "Wird angehalten",
  "status.completed": "Fertig",
  "status.killed": "Abgebrochen",
  "status.failed": "Gescheitert",
  "duration.seconds": "{seconds} s",
  "duration.minutes": "{minutes} Min. {seconds} s",
  "duration.hours": "{hours} Std. {minutes} Min.",
  "duration.title.live": "L\xE4uft seit {duration}",
  "duration.title.done": "Dauerte {duration}",
  "output.gap": "\u2026 fr\xFChere Ausgabe wurde verworfen \u2026",
  "output.error": "Die laufende Ausgabe ist abgerissen: {error}",
  "terminal.signal": "Signal {signal}",
  "terminal.exitCode": "R\xFCckgabewert {code}",
  "terminal.noExitCode": "Nicht ordentlich beendet",
  "terminal.running": "L\xE4uft",
  "terminal.failed": "Gescheitert",
  "terminal.done": "Fertig",
  "terminal.copy": "Kopieren",
  "terminal.copied": "Kopiert",
  "terminal.noOutput": "(keine Ausgabe)",
  "terminal.collapse": "Einklappen",
  "terminal.collapseAria": "Ausgabe einklappen",
  "terminal.expand": "Die \xFCbrigen {n} Zeilen ausklappen",
  "terminal.expandAria": "Die eingeklappten {n} Zeilen Ausgabe ausklappen"
};
var unteragenten = {
  "duration.seconds": "{seconds} s",
  "duration.minutes": "{minutes} Min. {seconds} s",
  "duration.hours": "{hours} Std. {minutes} Min. {seconds} s",
  "duration.days": "{days} Tage",
  "duration.daysHours": "{days} Tage {hours} Std.",
  "duration.months": "etwa {months} Monate",
  "duration.monthsDays": "etwa {months} Monate {days} Tage",
  "duration.years": "etwa {years} Jahre",
  "duration.yearsMonths": "etwa {years} Jahre {months} Monate",
  "duration.exactDays": "{days} Tage {hours} Std. {minutes} Min. {seconds} s",
  "duration.exactTitle": "Aktive Zeit zusammen: {duration}",
  "tokens.thousand": "{value} Tsd.",
  "tokens.million": "{value} Mio.",
  "tokens.total": "{value} Tok",
  "loading.label": "Unteragenten werden geladen\u2026",
  "load.error": "Die Unteragenten liessen sich nicht laden",
  "retry": "Erneut versuchen",
  "mode.oneShot": "Einmalig",
  "mode.continuable": "Fortsetzbar",
  "mode.unknown": "Art unbekannt",
  "readonly.unknown.body": "Ob er fortsetzbar ist, zeigt sich erst nach dem Lesen des untergeordneten Chats.",
  "activity.running": "L\xE4uft",
  "activity.completed": "Fertig",
  "activity.inactive": "L\xE4uft zur Zeit nicht",
  "branch.collapse": "Die untergeordneten Unteragenten von {label} einklappen",
  "branch.expand": "Die untergeordneten Unteragenten von {label} ausklappen",
  "count.total.one": "{count} Unteragent",
  "count.total.other": "{count} Unteragenten",
  "count.running.one": "{count} Unteragent l\xE4uft",
  "count.running.other": "{count} Unteragenten laufen",
  "switcher.aria": "Unteragent wechseln: {title}",
  "tree.aria": "Chats der Unteragenten",
  "open.sidebar": "In der Seitenleiste \xF6ffnen",
  "open.sidebar.aria": "{label} in der Seitenleiste \xF6ffnen",
  "sidebar.chat": "Chat",
  "readonly.oneShot.title": "Aufzeichnung eines einmaligen Unteragenten",
  "readonly.title": "Dieser Unteragent l\xE4sst sich zur Zeit nur lesen",
  "readonly.oneShot.body": "Ein einmaliger Auftrag nimmt keine weiteren Nachrichten an. Der vollst\xE4ndige Ablauf l\xE4sst sich hier nachlesen.",
  "readonly.body": "Der \xFCbergeordnete Chat ist zur Zeit nicht verbunden. Sobald du ihn wieder \xF6ffnest, lassen sich Nachrichten senden."
};
var unteragentenEinstellungen = {
  overridden: "\xDCberdeckt",
  reset: "Auf Vorgabe zur\xFCck",
  readOnly: "Die Einstellungen dieser Einrichtung sind nur lesbar.",
  unavailable: "Diese Erweiterung ist zur Zeit nicht geladen und l\xE4sst sich deshalb nicht einstellen.",
  save: "Speichern",
  saving: "Wird gespeichert\u2026",
  saveFailed: "Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum \xC4ndern stehen.",
  subagentTitle: "Unteragenten",
  subagentDescription: "Tiefe, Anzahl und Modell der Unteragenten einstellen.",
  subagentLimitsTitle: "Grenzen",
  subagentMaxDepth: "Gr\xF6sste Verschachtelungstiefe",
  subagentDepthHelpLabel: "Erkl\xE4rung zur Verschachtelungstiefe",
  subagentDepthHelp: "Begrenzt, wie tief ein Agent weitere Unteragenten anlegen darf.",
  subagentDepthZero: "Unteragenten abschalten",
  subagentDepthOne: "Nur der Hauptagent darf Unteragenten anlegen",
  subagentDepthOverride: "Hat ein einzelnes Werkzeug eine eigene Tiefe, gilt dessen Einstellung.",
  subagentMaxActive: "H\xF6chstzahl gleichzeitig laufender Unteragenten",
  subagentCapacityHelpLabel: "Erkl\xE4rung zur H\xF6chstzahl",
  subagentCapacityHelp: "Die Gesamtzahl der Unteragenten, die unter einem Hauptagenten \xFCber alle Ebenen gleichzeitig bestehen. Der Hauptagent z\xE4hlt nicht mit. Ist die Grenze erreicht, werden neue Startanfragen abgelehnt.",
  subagentDepthInvalid: "Gib eine ganze Zahl ein, die nicht kleiner als 0 ist.",
  subagentCapacityInvalid: "Gib eine ganze Zahl ein, die nicht kleiner als 1 ist.",
  subagentModelSelectionTitle: "Modellwahl",
  subagentModelSelectionToggle: "Dem Agenten erlauben, f\xFCr Unteragenten ein Modell zu w\xE4hlen",
  subagentModelSelectionChoose: "Eingeschaltet darf der Agent aus den unten freigegebenen Modellen f\xFCr jeden Unteragenten Anbieter, Modell und Denkaufwand w\xE4hlen. Es wirkt nur auf neue Chats.",
  subagentModelSelectionAllowed: "Modelle, die der Agent w\xE4hlen darf",
  subagentModelSelectionLoading: "Modelle werden geladen\u2026",
  subagentModelSelectionLoadFailed: "Die Modelle liessen sich nicht laden.",
  subagentModelSelectionRetry: "Erneut versuchen",
  subagentModelSelectionPartial: "Einige Anbieter liessen sich zur Zeit nicht laden. Gespeicherte Auswahlen lassen sich trotzdem entfernen.",
  subagentModelSelectionUnavailable: "Zur Zeit nicht verf\xFCgbar",
  subagentModelSelectionUnavailableGroup: "Gespeichert, aber zur Zeit nicht verf\xFCgbar",
  subagentModelSelectionEmpty: "Zur Zeit meldet kein Anbieter Modelle.",
  subagentModelSelectionRequired: "W\xE4hle vor dem Speichern mindestens ein Modell.",
  subagentModelSelectionConflict: "Die Einstellungen wurden anderswo ge\xE4ndert. Verwirf deine \xC4nderung und versuche es erneut.",
  subagentModelSelectionOff: "Ausgeschaltet benutzt der Unteragent das eingestellte Vorgabemodell oder das des \xFCbergeordneten Agenten. Gew\xE4hlte Modelle bleiben erhalten."
};
var rechteSpalte = {
  "command.close": "Die aktuelle Seite oder das Fenster schliessen",
  "command.refresh": "Die aktuelle Seite neu laden",
  "command.noRefresh": "Diese Seite l\xE4sst sich nicht neu laden",
  "command.toggle": "Die rechte Spalte aus- oder einklappen",
  "command.fullscreen": "Bereich vollbilden oder verlassen",
  "command.noSession": "W\xE4hle zuerst einen Chat",
  "command.noFocus": "W\xE4hle zuerst den rechten Bereich",
  "command.stale": "Die Seite hat gewechselt. W\xE4hle den Bereich erneut.",
  "command.collapsed": "Klappe zuerst die rechte Spalte aus",
  "command.float": "Ein schwebender Bereich kann das nicht",
  "command.empty": "\xD6ffne zuerst eine Seite",
  "command.budget": "Die Grenze von zwei Bereichen ist erreicht",
  "command.width": "Die Spalte ist zu schmal. Zieh sie breiter und teile dann.",
  "chrome.expand": "Seitenleiste \xF6ffnen",
  "chrome.expandAria": "Die rechte Seitenleiste \xF6ffnen",
  "chrome.collapse": "Seitenleiste einklappen",
  "chrome.collapseAria": "Die rechte Seitenleiste einklappen",
  "chrome.toFullscreen": "Vollbild",
  "chrome.exitFullscreen": "Vollbild verlassen",
  "dock.emptyPane": "Leerer Bereich",
  "dock.splitPane": "Teilen",
  "dock.splitPaneDisabled": "Die Grenze von zwei Bereichen ist erreicht",
  "dock.splitPaneNarrow": "Die Spalte ist zu schmal. Zieh sie breiter und teile dann.",
  "dock.closeTab": "Schliessen",
  "dock.addTab": "Neue Registerkarte",
  "dock.dockFloat": "Zur\xFCck in die Seitenleiste",
  "dock.closeFloat": "Schliessen",
  "dock.drop.center": "Hierher verschieben",
  "dock.drop.left": "Links teilen",
  "dock.drop.right": "Rechts teilen",
  "dock.drop.top": "Oben teilen",
  "dock.drop.bottom": "Unten teilen",
  "tab.guide.title": "Beginn",
  "tab.unavailable": "F\xFCr diese Art von Inhalt gibt es noch keine Ansicht."
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/runde4.ts
var tastenkuerzel = {
  "edit-label": "Tastenk\xFCrzel f\xFCr {command} \xE4ndern",
  record: "Tasten dr\xFCcken",
  "record-help": "Beim Loslassen wird gespeichert. Tab wechselt die Aktion, Esc beendet die Aufnahme.",
  "web-help": "Im Browser verf\xFCgbar: Mod+/, Mod+Umschalt+, und Mod+Umschalt+. \u2014 Mod ist auf dem Mac Befehl, sonst Strg.",
  "unsupported-key": "Diese Taste wird noch nicht unterst\xFCtzt.",
  reserved: "Diese Kombination geh\xF6rt dem System oder der Textbearbeitung.",
  "modifier-required": "Dr\xFCcke zus\xE4tzlich Befehl, Strg oder Alt.",
  "too-many-keys": "H\xF6chstens zwei Tasten neben den Zusatztasten. Lass los und versuche es erneut.",
  "macos-web-help": "M\xF6glich sind Befehl+/, Befehl+,, Befehl+Backslash, Steuerung+Gravis, Befehl+Wahl+Taste oder Befehl+Umschalt+Taste. Auch drei oder vier verschiedene Zusatztasten gehen. Kombinationen, die Browser oder System belegen, erreichen die Seite vielleicht nicht.",
  "windows-web-help": "M\xF6glich sind Strg+/, Strg+,, Strg+Alt+Taste oder Strg+Umschalt+Taste. Auch drei oder vier verschiedene Zusatztasten gehen. Kombinationen, die Browser oder System belegen, erreichen die Seite vielleicht nicht.",
  "unsupported-browser": "Dieser Browser kann diese Kombination nicht.",
  conflict: 'Belegt von \u201E{commands}"',
  saved: "Ge\xE4ndert",
  clear: "Entfernen",
  "retry-save": "Speichern erneut versuchen",
  reset: "Auf Vorgabe zur\xFCck",
  "reset-all": "Alle auf Vorgabe zur\xFCck",
  "modified-count": "{count} angepasst",
  "reset-title": "Alle Tastenk\xFCrzel auf die Vorgabe zur\xFCcksetzen?",
  "reset-description": "Die Vorgaben dieser Plattform werden wiederhergestellt. Deine \xC4nderungen und Entfernungen fallen weg; andere Plattformen bleiben unber\xFChrt.",
  cancel: "Abbrechen",
  "reset-saved": "Die Vorgaben sind wiederhergestellt",
  "close-confirmation": "Best\xE4tigung schliessen",
  "reset-failed": "Das Zur\xFCcksetzen ist gescheitert. Die bisherigen K\xFCrzel bleiben erhalten. Versuche es noch einmal.",
  review: "Die neueste Einstellung wurde gepr\xFCft",
  stale: "Die Tastenk\xFCrzel oder die verf\xFCgbaren Befehle haben sich ge\xE4ndert. Pr\xFCfe die Belegung und speichere dann.",
  "write-failed": "Das Speichern ist gescheitert. Die bisherigen K\xFCrzel und dein Entwurf bleiben erhalten. Versuche es noch einmal.",
  "not-ready": "Die Tastenk\xFCrzel sind noch nicht bereit. Versuche es sp\xE4ter noch einmal.",
  read: "{location} liess sich nicht lesen. Pr\xFCfe die Zugriffsrechte und {reload}.",
  invalid: "Die Tastenk\xFCrzel in {location} sind besch\xE4digt. Sichere die Datei, repariere sie und {reload}.",
  future: "Die Tastenk\xFCrzel in {location} stammen aus einer neueren Fassung. Aktualisiere den Harness und versuche es erneut.",
  "web-document": "dsh.keybindings.v1 im lokalen Speicher dieser Seite",
  "desktop-document": "userData/keybindings.json",
  "web-reload": "lade die Seite neu",
  "desktop-reload": "starte den Harness neu",
  "using-defaults": "Zur Zeit gelten die Vorgaben.",
  "using-accepted": "Zur Zeit gelten die zuletzt erfolgreich gelesenen K\xFCrzel.",
  "native-failed": "Der Schutz f\xFCr die Tastenaufnahme liess sich nicht einschalten. Schliesse das Fenster und versuche es erneut.",
  "global-hint": "Global aufrufen",
  "clear-search": "Suche leeren",
  title: "Tastenk\xFCrzel",
  open: "\xDCbersicht der Tastenk\xFCrzel",
  settings: "Tastenk\xFCrzel",
  view: "Tastenk\xFCrzel bearbeiten",
  description: "Die verf\xFCgbaren Tastenk\xFCrzel und Eingaben ansehen und \xE4ndern",
  search: "Tastenk\xFCrzel durchsuchen",
  close: "Tastenk\xFCrzel schliessen",
  application: "Anwendung",
  input: "Nachrichteneingabe",
  menus: "Men\xFCs und Einblendungen",
  approval: "Freigabebereich",
  unbound: "Kein K\xFCrzel",
  empty: "Kein Tastenk\xFCrzel passt zur Suche",
  move: "Die Auswahl im Men\xFC bewegen",
  select: "Den Men\xFCeintrag w\xE4hlen",
  dismiss: "Das Men\xFC oder die oberste Einblendung schliessen"
};
var rueckfragen = {
  "error.incomplete": "Beantworte zuerst diese Frage.",
  "error.unanswered": "W\xE4hle eine M\xF6glichkeit oder schreibe eine eigene Antwort.",
  "error.unavailable": "Zur Zeit l\xE4sst sich nichts senden. Versuche es sp\xE4ter noch einmal.",
  "error.resubmit": "Die Antwort ist nicht angekommen; die Arbeit l\xE4uft weiter. Sende sie noch einmal.",
  "status.sent": "Die Antwort ist gesendet; der Bereich liess sich nicht schliessen.",
  "wait.takeTime": "Lass dir Zeit",
  "wait.countdown": "Die Arbeit l\xE4uft in {seconds} Sekunden weiter",
  "wait.paused": "Angehalten \xB7 noch {seconds} Sekunden",
  "wait.held": "Es wird auf deine Antwort gewartet",
  "wait.continued": "Die Arbeit l\xE4uft weiter; du kannst noch antworten",
  "review.status": "Beantwortet",
  "review.skipped": "Diese Frage wurde damals \xFCbersprungen.",
  "reply.label": "Eine fr\xFChere offene Frage beantworten",
  "reply.open": "Einzelheiten der Frage ausklappen",
  "reply.close": "Einzelheiten der Frage einklappen",
  "reply.answerLabel": "Antwort:",
  "reply.skipped": "\xDCbersprungen",
  "nav.prev": "Vorige Frage",
  "nav.next": "N\xE4chste Frage",
  "nav.minimize": "Die Fragenkarte einklappen",
  "nav.maximize": "Die Fragenkarte ausklappen",
  "nav.cancel": "Die ganze Fragengruppe verwerfen",
  "nav.close": "Den Fragenbereich einklappen; er l\xE4sst sich \xFCber den Werkzeugaufruf wieder \xF6ffnen",
  "option.recommended": "Empfohlen",
  "custom.placeholder": "Deine Antwort eingeben",
  "action.skip": "\xDCberspringen",
  "action.next": "N\xE4chste Frage",
  "plan.header": "Plan zur Pr\xFCfung",
  "plan.approve": "Ausf\xFChren",
  "plan.decline": "Ablehnen",
  "plan.discuss": "\xC4nderung verlangen"
};
var konto = {
  modelSignInRequired: "Die aktuellen Modelle sind nicht verf\xFCgbar. Melde dich an und versuche es erneut.",
  sessionExpired: "Die Anmeldung ist abgelaufen. Melde dich erneut an.",
  close: "Schliessen",
  addApiKey: "Zugangsschl\xFCssel hinzuf\xFCgen",
  retry: "Erneut anmelden",
  loginTitle: "Loslegen",
  loginDescription: "Melde dich mit einem DeepSeek-Konto an oder trage einen Zugangsschl\xFCssel ein. Deine Projekte und Dateien bleiben auf diesem Rechner.",
  browserTitle: "Warte auf die Anmeldung",
  browserPrompt: "Hat sich kein neues Fenster ge\xF6ffnet?",
  copyLink: "Anmeldeadresse kopieren",
  copiedLink: "Adresse kopiert",
  copyFailed: "Das Kopieren ist gescheitert. Schreibe die Adresse von Hand ab.",
  browserDescription: " \u2014 \xF6ffne die Anmeldeseite von Hand und schliesse die Anmeldung dort ab.",
  timeoutTitle: "Die Anmeldung ist abgelaufen",
  timeoutDescription: "Melde dich erneut an und mach dann weiter.",
  failureTitle: "Die Anmeldung ist gescheitert",
  platformFailed: "Der Vorgang blieb unvollendet. Versuche es erneut.",
  platformRetry: "Erneut versuchen",
  loading: "Wird geladen\u2026",
  backToHarness: "Zur\xFCck zum DeepSeek Harness",
  settings: "Einstellungen",
  contactUs: "R\xFCckmeldung",
  menu: "Kontomen\xFC",
  nav: "Konto und Guthaben",
  signedIn: "Bei DeepSeek angemeldet",
  signedOut: "Nicht angemeldet",
  signIn: "Anmelden",
  signOut: "Abmelden",
  signOutUnknownDescription: "Der Zustand der Aufgaben liess sich nicht feststellen. Abmelden kann Aufgaben unterbrechen, die mit diesem Konto laufen. Fortfahren?",
  signOutDescription: "Beim Abmelden gehen keine Daten verloren; du kannst dich sp\xE4ter wieder anmelden.",
  signOutRunningDescription: "Es l\xE4uft gerade etwas. Abmelden unterbricht es. Willst du dich sofort abmelden?",
  cancel: "Abbrechen",
  open: "Browser \xF6ffnen",
  initializing: "Die Anmeldung wird begonnen\u2026",
  waiting: "Mach im Browser weiter",
  completing: "Die Anmeldung wird abgeschlossen\u2026",
  expired: "Die Anmeldung ist abgelaufen. Versuche es erneut.",
  failed: "Der Vorgang blieb unvollendet. Versuche es erneut.",
  settingsSignedOutTitle: "Du bist nicht beim DeepSeek Harness angemeldet",
  settingsSignedOutDescription: "Melde dich an, um deinen eigenen Zugangsschl\xFCssel zu erhalten",
  signInDescription: "Melde dich mit einem DeepSeek-Konto an, um loszulegen",
  profileUnavailable: "Die Kontodaten sind zur Zeit nicht verf\xFCgbar",
  balance: "Guthaben",
  bonusBalance: "Geschenktes Guthaben",
  balanceUnavailable: "In der offenen Plattform nachsehen",
  balanceSignedOut: "Nach dem Anmelden sichtbar",
  accountInfo: "Weitere Kontodaten",
  more: "Mehr",
  usage: "Verbrauch ansehen",
  topUp: "Aufladen",
  quotaTitle: "Kein verf\xFCgbares Guthaben",
  quotaDescription: "Ohne Guthaben kann der DeepSeek Harness keine neuen Aufgaben beginnen. M\xF6chtest du aufladen? Das geht auch sp\xE4ter unter Einstellungen \u2192 Konto und Guthaben.",
  quotaTopUp: "Zum Aufladen",
  bonusNoticeTitle: "Geschenktes Guthaben ist eingetroffen",
  // ── Die erste Einrichtung ──────────────────────────────────────────────────
  //
  // **Diese 39 Texte fehlten.** Sie liegen im Harness in einer eigenen Datei
  // (`locales/onboarding.ts`) und werden über `...onboardingEnglishCopy` in das
  // Konto-Wörterbuch gespreizt. Solange die Namensraum-Tabelle von Hand geführt
  // wurde, zählte die Prüfung nur die 54 Texte der Hauptdatei — die
  // Einrichtungsstrecke blieb englisch, und kein Werkzeug sagte etwas.
  //
  // `onboardingArtworkLocale` sagt der Abbildung, welche Sprache sie zeigen
  // soll; für uns ist das `de`. Die Marke bleibt stehen: `DeepSeek Harness` ist
  // ein Produktname.
  onboardingArtworkLocale: "de",
  onboardingWelcome: "Willkommen bei",
  onboardingBrand: "DeepSeek Harness",
  onboardingIntroduction: "DeepSeek Harness arbeitet in einem Ordner auf deinem Rechner und liest und schreibt Dateien mit Werkzeugen. Es hilft dir, Informationen zu suchen und zu ordnen, Dokumente und Tabellen zu erstellen, Code zu schreiben und Fehlern auf den Grund zu gehen.",
  onboardingStart: "Einrichtung beginnen",
  onboardingCredit: "Guthaben bereitstellen",
  onboardingCreditDescription: "DeepSeek Harness rechnet nach den Token ab, die Modelle und Werkzeuge verbrauchen. Stelle rechtzeitig Guthaben bereit, damit eine Aufgabe nicht mittendrin abbricht. Dein Guthaben wird nur verbraucht, w\xE4hrend der Agent wirklich arbeitet.",
  onboardingTopUp: "Zum Aufladen",
  onboardingLater: "Weiter",
  onboardingFundedTopUp: "Zum Aufladen",
  onboardingPurposePrefix: "Womit soll ich dir",
  onboardingPurposeSuffix: "helfen?",
  onboardingPurposeDescription: "Wir richten Oberfl\xE4che und Werkzeuge nach deiner Wahl ein, damit sie zu deiner Arbeitsweise passen.",
  onboardingOffice: "B\xFCro und Gestaltung",
  onboardingOfficeDescription: "Dokumente bearbeiten, Daten ordnen, Pr\xE4sentationen erstellen und mehr",
  onboardingDevelopment: "Code und Entwicklung",
  onboardingDevelopmentDescription: "Code \xE4ndern, Fehler suchen, Befehle ausf\xFChren, Projektdateien verwalten und mehr",
  onboardingContinue: "Weiter",
  onboardingProcess: "Wie viel vom Arbeitsverlauf m\xF6chtest du sehen?",
  onboardingProcessDescription: "Das \xE4ndert nur, wie der Verlauf gezeigt wird \u2014 nicht, was DeepSeek Harness kann.",
  onboardingCompact: "Nur Ergebnisse",
  onboardingCompactDescription: "Du siehst nur die Ergebnisse, in einer ruhigen Oberfl\xE4che",
  onboardingStandard: "Die wichtigsten Schritte",
  onboardingStandardDescription: "Ergebnisse zuerst, dazu die wichtigen Schritte und Handlungen",
  onboardingDetailed: "Der ganze Verlauf",
  onboardingDetailedDescription: "Der vollst\xE4ndige Verlauf \u2014 gut zum Nachsehen und f\xFCr die Fehlersuche",
  onboardingEnter: "Programm \xF6ffnen",
  onboardingBack: "Zur\xFCck",
  onboardingSkip: "\xDCberspringen",
  onboardingSkipTitle: "Einrichtung \xFCberspringen?",
  onboardingSkipDescription: "Du kannst jederzeit unter Einstellungen \u2192 Allgemein einstellen, wie Verlauf, Leistung und Verbrauch gezeigt werden, und die Codewerkzeuge einschalten.",
  onboardingKeepSetting: "Einrichtung fortsetzen",
  onboardingNoCreditTitle: "Aufladen \xFCberspringen?",
  onboardingNoCreditDescription: "Ohne Guthaben kann DeepSeek Harness keine neue Aufgabe beginnen. Du kannst sp\xE4ter unter Einstellungen \u2192 Konto und Guthaben aufladen.",
  onboardingUnderstood: "Verstanden",
  onboardingGoTopUp: "Zum Aufladen",
  onboardingSaveFailed: "Die Einstellungen liessen sich nicht speichern. Versuche es erneut.",
  onboardingRetry: "Erneut versuchen",
  onboardingLoading: "Einstellungen werden geladen \u2026"
};
var befehle = {
  "section.add": "Hinzuf\xFCgen",
  "section.commands": "Befehle",
  "label.goal": "Ziel",
  "label.plan": "Plan",
  "label.feedback": "R\xFCckmeldung",
  "label.compact": "Verdichten",
  "label.permission": "Zugriff",
  "label.export": "Protokoll laden",
  "description.goal": "Ein langfristiges Ziel setzen oder ansehen",
  "description.plan": "In den Planmodus wechseln oder ihn verlassen",
  "description.feedback": "Eine R\xFCckmeldung zu diesem Chat senden",
  "description.compact": "Das Gespr\xE4ch bis hierher verdichten",
  "description.permission": "Die Zugriffsstufe wechseln (Sandkasten und Freigaben)",
  "description.export": "Diesen Chat als ZIP-Datei ausf\xFChren",
  "token.goal": "Ziel",
  "token.plan": "Plan",
  "token.feedback": "R\xFCckmeldung",
  "token.compact": "Verdichten",
  "token.permission": "Zugriff",
  "token.export": "Ausfuhren",
  "search.placeholder": "Suchen\u2026",
  "search.aria": "M\xF6glichkeiten filtern",
  "status.loading": "Die M\xF6glichkeiten werden geladen\u2026",
  "status.applying": "Wird \xFCbernommen\u2026",
  "status.empty": "Keine M\xF6glichkeiten",
  "overlay.aria": "M\xF6glichkeiten f\xFCr /{command}",
  "listbox.aria": "Treffer f\xFCr /{command}",
  "notice.attachmentsUnsupported": "/{command} nimmt keine Anh\xE4nge. Entferne sie zuerst."
};
var dateibrowser = {
  "type.label": "Browser",
  "guide.title": "Browser",
  "guide.description": "Seiten im Netz ansehen",
  "shortcut.noSession": "\xD6ffne zuerst einen Chat",
  "address.placeholder": "Eine HTTP(S)-Adresse eingeben",
  "address.changed": "Die Adresse hat sich ge\xE4ndert",
  back: "Zur\xFCck",
  forward: "Vorw\xE4rts",
  reload: "Neu laden",
  go: "Aufrufen",
  external: "Im Browser des Systems \xF6ffnen",
  "sandbox.disable": "Die Sandkastengrenze ausschalten",
  "sandbox.enable": "Die Sandkastengrenze wieder einschalten",
  "sandbox.warning": "Die Sandkastengrenze ist aus. Seiten d\xFCrfen die oberste Anwendung wegnavigieren und Download, modale Fenster sowie Tastensperre benutzen.",
  start: "Gib eine HTTP(S)-Adresse ein und beginne zu bl\xE4ttern",
  loading: "Wird ge\xF6ffnet\u2026",
  "restore.previous": "Zuletzt ge\xF6ffnet",
  "restore.action": "Seite wiederherstellen",
  "error.empty": "Gib eine Adresse ein.",
  "error.invalid": "Diese Adresse ist ung\xFCltig oder zu lang.",
  "error.protocol": "Nur HTTP und HTTPS gehen. \xD6rtliche Dateien siehst du in der Dokumentvorschau.",
  "error.credentials": "Die Adresse darf keinen Benutzernamen und kein Kennwort enthalten.",
  "error.application-origin": "Die DSH-Anwendung selbst l\xE4sst sich nicht im eingebauten Browser \xF6ffnen.",
  "load.failed": "Die Seite liess sich nicht laden. Lade sie neu oder \xF6ffne sie im Browser des Systems.",
  "load.failed.detail": "Die Seite liess sich nicht laden ({code}): {description}",
  "address.unknown": "Die Seite hat gewechselt; die neue Adresse l\xE4sst sich hier nicht lesen."
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/runde5.ts
var rueckmeldung = {
  "action.like": "Gute Antwort",
  "action.likeActive": "Kennzeichnung zur\xFCcknehmen",
  "action.dislike": "Problematische Antwort",
  "action.dislikeActive": "Kennzeichnung zur\xFCcknehmen",
  "dialog.title": "R\xFCckmeldung senden",
  "dialog.categories": "Art der R\xFCckmeldung",
  "dialog.detail": "Einzelheiten",
  "dialog.hint": "Einzelheiten helfen uns weiter. Beim Senden wird das Protokoll dieses Chats mitgeschickt.",
  "category.task-result": "Ergebnis der Aufgabe",
  "category.instruction-following": "Anweisungen verstanden und befolgt",
  "category.product-interaction": "Funktionen und Bedienung",
  "category.service-stability": "Stabilit\xE4t und Geschwindigkeit",
  "category.resource-cost": "Verbrauch und Kosten",
  "category.security-privacy-permission": "Sicherheit, Datenschutz und Zugriffsrechte",
  "category.other": "Sonstiges",
  "toast.recorded": "Danke f\xFCr die R\xFCckmeldung",
  "error.conflict": "Diese R\xFCckmeldung wurde anderswo ge\xE4ndert; angezeigt wird der neueste Stand",
  "error.load": "Der Zustand der R\xFCckmeldung liess sich nicht laden",
  "error.generic": "Die R\xFCckmeldung liess sich nicht speichern",
  "error.noteTooLarge": "Die Beschreibung ist zu lang. K\xFCrze sie und sende dann."
};
var netzsuche = {
  title: "Suche im Netz",
  description: "Den Suchanbieter des DeepSeek Harness einstellen.",
  apiKey: "Zugangsschl\xFCssel",
  apiKeyHint: "Wird nicht in die Einstellungsdatei geschrieben. Leer lassen heisst: der bisherige Schl\xFCssel bleibt.",
  apiKeySet: "Ein Schl\xFCssel ist hinterlegt.",
  apiKeyUnset: "Es ist kein Schl\xFCssel hinterlegt. Nur Chats mit einem DeepSeek-Kontomodell k\xF6nnen \xFCber die vorgegebene Adresse suchen.",
  baseUrl: "Adresse der Schnittstelle",
  baseUrlHint: "Leer lassen heisst: die vorgegebene Adresse des Anbieters.",
  maxUses: "H\xF6chstzahl Suchen je Anfrage",
  maxUsesHint: "Wie oft eine Anfrage suchen darf, bevor geantwortet werden muss.",
  overridden: "\xDCberdeckt",
  reset: "Auf Vorgabe zur\xFCck",
  readOnly: "Die Einstellungen dieser Einrichtung sind nur lesbar.",
  unavailable: "Diese Erweiterung ist zur Zeit nicht geladen und l\xE4sst sich deshalb nicht einstellen.",
  save: "Speichern",
  saving: "Wird gespeichert\u2026",
  saveFailed: "Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum \xC4ndern stehen.",
  invalidNumber: "Gib eine Zahl ein, oder lass das Feld leer f\xFCr die Vorgabe."
};
var arbeitsablauf = {
  "run.title": "{name}",
  "run.members.one": "{count} Mitwirkender",
  "run.members.other": "{count} Mitwirkende",
  "run.empty": "Es wurde kein Mitwirkender gestartet",
  "phase.unassigned": "Ohne Abschnitt",
  "phase.empty": "Leerer Abschnittsname",
  "statusCount.running": "{count} laufen",
  "statusCount.completed": "{count} fertig",
  "statusCount.failed": "{count} gescheitert",
  "statusCount.cancelled": "{count} abgebrochen",
  "statusCount.interrupted": "{count} unterbrochen",
  "member.empty": "Leerer Name",
  "member.open": "{name} \xF6ffnen",
  "status.running": "L\xE4uft",
  "status.completed": "Fertig",
  "status.failed": "Gescheitert",
  "status.cancelled": "Abgebrochen",
  "status.interrupted": "Unterbrochen"
};
var plan = {
  "chip.label": "Plan",
  "preview.title": "Plan",
  "preview.document": "Plan \xB7 Markdown",
  "preview.action": "\xD6ffnen",
  "preview.open": "Den Plan in der Seitenleiste \xF6ffnen",
  "preview.full": "Ganzen Text ansehen",
  "preview.openNamed": "Plan \xF6ffnen: {title}",
  "preview.loading": "Der Plan wird gelesen\u2026",
  "preview.failed": "Der Plan liess sich nicht lesen",
  "preview.invalidAddress": "Die Adresse des Plans ist ung\xFCltig",
  "preview.historyUnavailable": "Der Chatverlauf liess sich nicht lesen",
  "preview.notFound": "Dieser Plan wurde nicht gefunden",
  "preview.unavailable": "Die Planvorschau ist nicht verf\xFCgbar",
  "preview.expired": "Diese vorl\xE4ufige Planvorschau ist abgelaufen. \xD6ffne sie \xFCber die Karte neu, die noch auf Freigabe wartet.",
  "chip.on.aria": "Der Planmodus ist an. Dr\xFCcken schaltet ihn aus.",
  "chip.on.title": "Der Planmodus ist an \u2014 klicken schaltet ihn aus (/plan off)",
  "chip.exitFailed": "Der Planmodus liess sich nicht verlassen"
};
var arbeitsbereichsdateien = {
  "shortcut.noSession": "W\xE4hle zuerst einen Chat",
  "type.label": "Dateien",
  "guide.title": "Dateien des Arbeitsbereichs",
  "guide.description": "Die Dateien des Arbeitsbereichs dieses Chats ansehen",
  loading: "Wird gelesen\u2026",
  empty: "Leerer Ordner",
  truncated: "Es gibt zu viele Eintr\xE4ge; angezeigt wird nur ein Teil.",
  noWorkspace: "Dieser Chat hat keinen Ordner als Arbeitsbereich.",
  reload: "Neu einlesen",
  autoRefresh: "Selbstt\xE4tig erneuern",
  "autoRefresh.enable": "Selbstt\xE4tiges Erneuern einschalten",
  "autoRefresh.disable": "Selbstt\xE4tiges Erneuern ausschalten",
  "entry.other": "Das ist weder Datei noch Ordner und l\xE4sst sich nicht \xF6ffnen.",
  "error.notFound": "Diesen Ordner gibt es nicht mehr. Er wurde vielleicht verschoben oder gel\xF6scht.",
  "error.outsideWorkspace": "Dieser Ordner liegt ausserhalb des Arbeitsbereichs; die Seitenleiste liest ihn nicht.",
  "error.notDirectory": "Das ist kein Ordner.",
  "error.unavailable": "Das Lesen ist gescheitert: {message}"
};
var oertlichOeffnen = {
  "open.title": "Mit {app} \xF6ffnen",
  "path.appDefault": "{app} (Vorgabe)",
  "path.appsError": "Die Liste der Programme liess sich nicht holen",
  "shortcut.busy": "Es wird gerade ein Arbeitsbereich ge\xF6ffnet",
  "shortcut.unavailable": "Der Arbeitsbereich oder das \xF6rtliche Programm ist nicht verf\xFCgbar",
  "open.tooltip": "\xD6rtlich \xF6ffnen",
  "path.open": "\xD6ffnen",
  "path.more": "Weitere Programme",
  "path.reveal": "Den Ort der Datei zeigen",
  "path.openError": "Das \xD6ffnen ist gescheitert. Versuche es erneut.",
  "path.revealError": "Der Ort der Datei liess sich nicht zeigen. Versuche es erneut.",
  "app.finder": "Finder",
  "app.explorer": "Datei-Explorer",
  "app.filemanager": "Dateiverwaltung",
  "app.terminal": "Terminal"
};
var terminalEinstellungen = {
  title: "Terminal",
  description: "Begrenzen, wie lange ein Befehl laufen darf und wie viel Ausgabe er erzeugen kann.",
  timeoutMs: "Zeitgrenze je Befehl (Millisekunden)",
  timeoutMsHint: "Wie lange ein einzelner Befehl laufen darf; danach wird er beendet.",
  maxOutputBytes: "Obergrenze je Ausgabestrom (Bytes)",
  maxOutputBytesHint: "Was dar\xFCber hinausgeht, wird in eine Zwischendatei umgeleitet statt verworfen.",
  overridden: "\xDCberdeckt",
  reset: "Auf Vorgabe zur\xFCck",
  readOnly: "Die Einstellungen dieser Einrichtung sind nur lesbar.",
  unavailable: "Diese Erweiterung ist zur Zeit nicht geladen und l\xE4sst sich deshalb nicht einstellen.",
  save: "Speichern",
  saving: "Wird gespeichert\u2026",
  saveFailed: "Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum \xC4ndern stehen.",
  invalidNumber: "Gib eine Zahl ein, oder lass das Feld leer f\xFCr die Vorgabe."
};
var seitenleistenTerminal = {
  "shortcut.noSession": "W\xE4hle zuerst einen Chat",
  recoveryFailed: "Das Terminal liess sich nicht wiederherstellen: {message}",
  retryRecovery: "Wiederherstellung erneut versuchen",
  shell: "Shell w\xE4hlen",
  shellLoading: "Die Shell wird gelesen\u2026",
  shellEmpty: "Keine Shell verf\xFCgbar",
  description: "Befehle im Arbeitsbereich des Chats ausf\xFChren",
  title: "Terminal",
  new: "Neues Terminal",
  loading: "Die Terminalumgebung wird gelesen\u2026",
  creating: "Wird gestartet\u2026",
  connecting: "Verbindung wird aufgebaut\u2026",
  disconnected: "Die Verbindung ist abgerissen.",
  reconnect: "Neu verbinden",
  readonly: "Diese Seite ist zur Zeit nur lesbar.",
  control: "Eingabe \xFCbernehmen",
  closed: "Das Terminal ist geschlossen.",
  exited: "Der Prozess ist beendet ({code})",
  failed: "Terminalfehler: {message}",
  rename: "Name des Terminals",
  unavailable: "Nicht verf\xFCgbar",
  retry: "Erneut versuchen",
  cleanupFailed: 'Das Terminal \u201E{title}" liess sich nicht beenden: {message}',
  missingTerminal: "Dieses Terminal gibt es nicht mehr. Lege ein neues an.",
  inputFull: "Der Eingabepuffer ist voll. Verbinde neu und versuche es dann.",
  attachmentEnded: "Die Terminalverbindung ist beendet. Verbinde neu.",
  invalidOutput: "Die Bild\xFCbertragung des Terminals ist gest\xF6rt. Verbinde neu.",
  terminalLimit: "Die H\xF6chstzahl Terminals ist erreicht. Schliesse nicht gebrauchte; auch beendete z\xE4hlen mit."
};
var ziele = {
  "phase.active": "Laufendes Ziel",
  "phase.active.disarmed": "Ziel ohne Fortsetzung",
  "phase.paused": "Angehaltenes Ziel",
  "phase.blocked": "Blockiertes Ziel",
  "objective.aria": "Inhalt des Ziels",
  "commandInput.aria": "Befehlseingabe",
  "action.save": "Ziel speichern",
  "action.cancel": "Bearbeiten abbrechen",
  "action.pause": "Ziel anhalten",
  "action.resume": "Ziel fortsetzen",
  "action.edit": "Ziel \xE4ndern",
  "action.clear": "Ziel l\xF6schen"
};
var agentenschleife = {
  title: "Agentenschleife",
  description: "Steuern, wie der Agent Werkzeugaufrufe verteilt.",
  maxParallel: "Gleichzeitige Werkzeugaufrufe",
  maxParallelHint: "Wie viele Aufrufe innerhalb eines Schritts gleichzeitig laufen d\xFCrfen.",
  overridden: "\xDCberdeckt",
  reset: "Auf Vorgabe zur\xFCck",
  readOnly: "Die Einstellungen dieser Einrichtung sind nur lesbar.",
  unavailable: "Diese Erweiterung ist zur Zeit nicht geladen und l\xE4sst sich deshalb nicht einstellen.",
  save: "Speichern",
  saving: "Wird gespeichert\u2026",
  saveFailed: "Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum \xC4ndern stehen.",
  invalidNumber: "Gib eine Zahl ein, oder lass das Feld leer f\xFCr die Vorgabe."
};
var verweise = {
  "section.files": "Dateien und Ordner",
  "section.subagents": "Unteragenten",
  "section.sessions": "Chats",
  "candidate.noCwd": "(ohne Arbeitsordner)",
  "crumb.root": "Arbeitsbereich",
  "time.now": "gerade eben",
  "time.minutes": "{n} Minuten",
  "time.hours": "{n} Stunden",
  "time.days": "{n} Tage",
  "time.months": "{n} Monate",
  "time.years": "{n} Jahre"
};
var ausloeser = {
  command: "Befehl",
  skill: "Fertigkeit",
  subagent: "Unteragent",
  loading: "Wird geladen\u2026",
  "drill.aria": "In den Ordner wechseln",
  "drill.hint": "In den Ordner wechseln",
  "drill.key": "Tab",
  "crumbs.aria": "Navigation durch die Ordner",
  "suggestions.aria": "Vorschl\xE4ge zum Ausl\xF6ser"
};
var erscheinungsbild = {
  "appearance.title": "Erscheinungsbild",
  "appearance.light": "Hell",
  "appearance.dark": "Dunkel",
  "appearance.system": "Wie das System",
  "fontSize.title": "Schriftgr\xF6sse",
  "fontSize.description": "Wirkt nur auf die Schriftgr\xF6sse des Gespr\xE4chs",
  "fontSize.unit": "px",
  "fontSize.increase": "Schrift vergr\xF6ssern",
  "fontSize.decrease": "Schrift verkleinern"
};
var fertigkeiten = {
  "row.title": "Fertigkeit laden",
  "row.running": "Die Fertigkeit wird geladen",
  "row.preparing": "Das Laden wird vorbereitet",
  "row.failed": "Die Fertigkeit liess sich nicht laden",
  "row.stopped": "Das Laden wurde abgebrochen",
  "row.instructions": "Anleitung",
  "row.inspect": "Ansehen",
  "menu.userOnly": "Nur von Hand"
};
var freigabe = {
  waiting: "Wartet auf Freigabe",
  "detail.aria": "Einzelheiten der Freigabe",
  escalation: "Das Werkzeug {toolName} bittet um erweiterte Rechte",
  reject: "Ablehnen",
  allowOnce: "Einmal erlauben"
};
var eingebauteErweiterungen = {
  nav: "Eingebaute Erweiterungen",
  title: "Eingebaute Erweiterungen",
  intro: "Die Erweiterungen ansehen, die diese Einrichtung mitbringt",
  tabs: "Ansichten",
  empty: "Diese Einrichtung bietet keine Ansicht der Erweiterungen an."
};
var sitzungsprotokoll = {
  title: "Beim Nutzen der offiziellen Modellschnittstelle das Sitzungsprotokoll hochladen",
  description: "Hilft, die DeepSeek-Modelle und das Erzeugnis zu verbessern",
  saved: "Die Einstellung ist gespeichert",
  failed: "Die Einstellung liess sich nicht speichern"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/voreinstellungen.ts
var voreinstellungen = {
  // ── Die Anleitung: Rahmen ──────────────────────────────────────────────────
  modeExplanation: "Erkl\xE4rung des Modus",
  howToUse: "So gehst du vor",
  guideSections: "Inhalt der Anleitung",
  guideExampleTask: "Beispielauftrag",
  guideCopy: "Kopieren",
  guideCopied: "Kopiert",
  guideFootnotes: "Fussnoten",
  // ── Standardmodus ──────────────────────────────────────────────────────────
  guideStandardIntro: "W\xE4hle beim Anlegen eines Auftrags den **Standardmodus** und beschreibe, was erreicht werden soll, wo die betroffenen Dateien liegen und woran man erkennt, dass es fertig ist.",
  guideStandardExplanation: [
    "### Wie er arbeitet",
    "Der Agent ruft Werkzeuge unmittelbar auf, um Dateien zu lesen und zu \xE4ndern, zu suchen und Befehle im Terminal auszuf\xFChren. Enthalten sind Fertigkeiten, Pl\xE4ne, Ziele, Unteragenten, Arbeitsabl\xE4ufe und das Verdichten des Kontexts.",
    "### Wann du ihn w\xE4hlst",
    "F\xFCr gew\xF6hnliches Programmieren, Dateiarbeit und das Ordnen von Material ist er der Anfang. Der Standardmodus kann auch Skripte schreiben und Dateien stapelweise verarbeiten; PTC \xE4ndert nur die Art der Werkzeugaufrufe und ist f\xFCr Stapelarbeit nicht n\xF6tig."
  ].join("\n\n"),
  guideStandardUsage: [
    "### Einen Fehler beheben",
    "> Beim zweiten Absenden des Suchformulars verschwinden die Ergebnisse. Finde die Ursache, behebe sie, lass die betroffenen Pr\xFCfungen laufen und erkl\xE4re zum Schluss die Ursache und was du ge\xE4ndert hast.",
    "Erwartetes Ergebnis: eine Code\xE4nderung, die Ergebnisse der betroffenen Pr\xFCfungen und eine Erkl\xE4rung der Ursache.",
    "### Projektnotizen ordnen",
    "> Lies die Markdown-Aufzeichnungen dieses Projekts. Fasse die getroffenen Entscheidungen und die noch offenen Fragen zusammen, jeweils mit Verweis auf die Datei.",
    "Erwartetes Ergebnis: eine Zusammenfassung mit Quellenangaben, die sich am Original nachpr\xFCfen l\xE4sst."
  ].join("\n\n"),
  // ── PTC-Modus ──────────────────────────────────────────────────────────────
  guidePtcIntro: "W\xE4hle beim Anlegen eines Auftrags den **PTC-Modus** und nenne die Eingabedateien, die Verarbeitungsregeln und das Ausgabeformat. Den Code schreibt der Agent.",
  guidePtcExplanation: [
    "### Wie Werkzeuge aufgerufen werden",
    "PTC heisst *Programmatic Tool Calling* \u2014 Werkzeuge werden aus einem Programm heraus aufgerufen. In dieser mitgelieferten Voreinstellung schreibt der Agent mit `run_code` ein TypeScript-Programm, das die Werkzeuge \xFCber ein erzeugtes SDK aufruft. Das Programm darf Schleifen, Bedingungen, Fehlerbehandlung und gleichzeitige Aufrufe benutzen.",
    "### Was beim Modell ankommt",
    "Die Ergebnisse der Werkzeuge gehen zuerst an das Programm, das sie filtern, berechnen und zusammenfassen kann. Das Modell bekommt, was das Programm ausgibt oder zur\xFCckgibt; Bilder werden getrennt angeh\xE4ngt. Aufrufe aus dem Programm werden weiterhin aufgezeichnet und bleiben an die Werkzeugrechte gebunden.",
    "### Der Unterschied zum Standardmodus",
    "Beide Modi k\xF6nnen programmieren und Dateien stapelweise verarbeiten. Der Standardmodus stellt dem Modell die einzelnen Werkzeuge bereit; PTC l\xE4sst es die Aufrufe in Code ordnen. Die PTC-Voreinstellung hat das Arbeitsablauf-Werkzeug abgeschaltet. Geschwindigkeit und Tokenverbrauch h\xE4ngen vom Auftrag und von der Art ab, wie das Programm seine Ergebnisse behandelt."
  ].join("\n\n"),
  guidePtcUsage: [
    "### Einstellungsdateien stapelweise pr\xFCfen",
    "> Pr\xFCfe alle JSON-Dateien unter configs/ und finde anhand von schema.json fehlende Pflichtfelder und ung\xFCltige Werte. Schreibe je Problem eine Zeile in eine CSV-Datei. Nimm Dateien, die sich nicht lesen lassen, in den Bericht auf und pr\xFCfe die \xFCbrigen weiter. Die Originale bleiben unver\xE4ndert.",
    "Erwartetes Ergebnis: eine \xDCbersicht der Probleme und ein CSV-Bericht. Das Programm kann dieselben Pr\xFCfungen auf viele Dateien anwenden, einzelne Fehlschl\xE4ge verkraften und die Ergebnisse sammeln.",
    "### Fehlerprotokolle zusammenfassen",
    "> Werte die Protokolle unter logs/ aus und z\xE4hle die Fehler nach Dienst und Art. Zeige die zehn h\xE4ufigsten Gruppen mit je einem Beispiel. Die vollst\xE4ndige Z\xE4hlung kommt in eine CSV-Datei.",
    "Erwartetes Ergebnis: die h\xE4ufigsten Fehlergruppen und eine vollst\xE4ndige Z\xE4hlung. Zwischenergebnisse kann das Programm sammeln, bevor die Zusammenfassung beim Modell ankommt."
  ].join("\n\n"),
  // ── Minimalmodus ───────────────────────────────────────────────────────────
  guideMinimalIntro: "W\xE4hle beim Anlegen eines Auftrags den **Minimalmodus**. F\xFCr einen Vergleich halte Modell, Rechte, Eingabe und den Anfangszustand des Arbeitsbereichs \xFCber alle L\xE4ufe gleich.",
  guideMinimalExplanation: [
    "### Was enthalten ist",
    "Es gibt nur ein dauerhaftes Shell-Werkzeug und eine feste Systemanweisung. Die Voreinstellung l\xE4dt keine Fertigkeiten, Pl\xE4ne und kein Verdichten des Kontexts und reicht auch den \xFCblichen Laufzeitkontext nicht hinein.",
    "### Wann du ihn w\xE4hlst",
    "Er taugt als Grundlinie f\xFCr Versuche und Vergleiche. Der Agent kann \xFCber Terminalbefehle weiterhin Dateien lesen und schreiben und Skripte laufen lassen, entbehrt aber der eingebauten Hilfen f\xFCr lange Auftr\xE4ge. Weniger Werkzeuge heisst nicht, dass es f\xFCr Anf\xE4nger leichter w\xE4re."
  ].join("\n\n"),
  guideMinimalUsage: [
    "### Die Grundf\xE4higkeit beim Beheben vergleichen",
    "> Lass die Pr\xFCfungen dieses Projekts laufen, finde die Ursache des Fehlschlags, behebe ihn so knapp wie m\xF6glich, lass die betroffenen Pr\xFCfungen erneut laufen und berichte das Ergebnis.",
    "F\xFChre denselben Auftrag einmal im Standardmodus und einmal im Minimalmodus aus, jeweils vom gleichen Zustand des Arbeitsbereichs, und vergleiche Ergebnis, Werkzeugaufrufe und die \xC4nderungen. Der Minimalmodus erledigt das \xFCber Terminalbefehle."
  ].join("\n\n"),
  // ── Schaffensmodus ─────────────────────────────────────────────────────────
  guideCordisIntro: "W\xE4hle beim Anlegen eines Auftrags den **Schaffensmodus** und beschreibe, welche F\xE4higkeit dazukommen soll, von wo aus sie benutzt wird und woran sich die Wirkung pr\xFCfen l\xE4sst.",
  guideCordisExplanation: [
    "### Was sich schaffen l\xE4sst",
    "Der Schaffensmodus hat die Werkzeuge des Standardmodus und zus\xE4tzlich das Pr\xFCfen der Laufzeit, das dauerhafte Verwalten von Erweiterungen sowie Anleitungen zum Schreiben von Cordis-Erweiterungen und Agenten-Voreinstellungen. Du kannst Erweiterungen schreiben, die Funktionen oder Oberfl\xE4chen hinzuf\xFCgen, und Werkzeuge samt Anweisungen zu eigenen Modi zusammenstellen.",
    "### Erweiterung und Modus",
    "Eine **Erweiterung** gibt dem DSH neue F\xE4higkeiten, etwa Werkzeuge, Verbindungen zu Diensten oder Einstiege in der Oberfl\xE4che. Ein **Modus** ist eine Agenten-Voreinstellung: sie w\xE4hlt die Werkzeuge, die einem Auftrag zur Verf\xFCgung stehen, und legt fest, wie der Agent arbeitet. In einem eigenen Modus lassen sich auch selbst geschriebene Erweiterungen benutzen.",
    "### Wie das Ergebnis wirkt",
    "Du kannst den Agenten bitten, die Einrichtung abzuschliessen und die Wirkung nachzupr\xFCfen. Eine Erweiterung l\xE4dt manchmal sofort, manchmal erst nach einem Neustart \u2014 je nach \xC4nderung. Ein neu angelegter Modus wird beim Anlegen eines Auftrags gew\xE4hlt."
  ].join("\n\n"),
  guideCordisUsage: [
    "### Eine Oberfl\xE4che hinzuf\xFCgen",
    '> Schreib mir eine DSH-Erweiterung, die in der Seitenleiste einen Einstieg \u201EProjektnotizen" hinzuf\xFCgt. Sie soll die Markdown-Dateien des Arbeitsbereichs auflisten und beim Anklicken den Inhalt zeigen. Schliesse die Einrichtung ab und pr\xFCfe, dass die Seite sich \xF6ffnet.',
    "Erwartetes Ergebnis: die Erweiterung mit dem Einstieg und der Ansicht, dazu die noch n\xF6tigen Schritte, bis sie wirkt.",
    "### Ein Werkzeug hinzuf\xFCgen",
    "> Schreib eine Erweiterung, die den Testbericht des Projekts liest und die gescheiterten F\xE4lle zusammenfasst. Melde das Werkzeug an und pr\xFCfe den Aufruf an einem Beispielbericht.",
    "Erwartetes Ergebnis: ein aufrufbares Werkzeug und das Ergebnis eines Beispielaufrufs.",
    "### Einen eigenen Modus anlegen",
    '> Leg auf Grundlage des Standardmodus einen Modus \u201ECodepr\xFCfung" an, der zuerst nach m\xF6glichen Fehlern und L\xFCcken in den Pr\xFCfungen sucht, Datei und Zeile nennt und mich vor jeder \xC4nderung fragt. Speichere ihn als w\xE4hlbare Voreinstellung.',
    "Erwartetes Ergebnis: eine eigene Voreinstellung, die sich beim Anlegen eines Auftrags w\xE4hlen l\xE4sst. Die Pr\xFCfanforderungen leiten den Agenten; was er wirklich darf, entscheiden weiterhin die Zugriffsrechte."
  ].join("\n\n"),
  // ── Die Auswahlliste ───────────────────────────────────────────────────────
  builtInGroup: "Mitgeliefert",
  customGroup: "Eigene",
  sectionIntro: "W\xE4hle, welche Werkzeuge und welche Arbeitsweise der Agent hat. F\xFCr den Alltag der **Standardmodus**, zum Erweitern des DSH der **Schaffensmodus**.",
  seatHint: "Die Voreinstellung f\xFCr den Auftrag, den du beginnen willst",
  headerHint: "Die Voreinstellung dieses Auftrags; sie steht seit seinem Beginn fest",
  nav: "Agenten-Voreinstellungen",
  setDefault: "Als Vorgabe f\xFCr neue Auftr\xE4ge",
  view: "Zusammensetzung ansehen",
  presetStandardName: "Standardmodus",
  presetStandardDescription: "F\xFCr Code, Dateien und Material \u2014 f\xFCr die meisten Auftr\xE4ge passend. Der Agent benutzt Suche, Bearbeitung und Terminal nach Bedarf.",
  presetPtcName: "PTC-Modus",
  presetPtcDescription: "Kann alles, was der Standardmodus kann, eignet sich aber besser f\xFCr viele Werkzeugaufrufe und f\xFCr Auftr\xE4ge, bei denen Ergebnisse gefiltert, geordnet, entdoppelt, gez\xE4hlt oder zusammengefasst werden.",
  presetMinimalName: "Minimalmodus",
  presetMinimalDescription: "Der Agent arbeitet allein mit dem Terminalwerkzeug. Geeignet f\xFCr Versuche und Vergleiche seiner Grundf\xE4higkeit.",
  presetCordisName: "Schaffensmodus",
  presetCordisDescription: "Den DSH im Gespr\xE4ch umbauen: der Agent schreibt Erweiterungen, die neue Funktionen oder Oberfl\xE4chen hinzuf\xFCgen; ebenso lassen sich Werkzeuge und Anweisungen zu eigenen Modi zusammenstellen.",
  inUse: "Vorgabe f\xFCr neue Auftr\xE4ge",
  noDescription: "Noch keine Beschreibung.",
  brokenBadge: "Liess sich nicht laden",
  switchRefused: 'Der Wechsel zu \u201E{name}" geht nicht: {reason}',
  close: "Schliessen",
  creatorDraft: "Den Agenten eine Voreinstellung entwerfen lassen"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/dokumentvorschau.ts
var dokumentrahmen = {
  loading: "Dokument wird dargestellt \u2026",
  loadMore: "Mehr laden",
  changed: "Die Datei hat sich ge\xE4ndert; angezeigt wird der vorige Inhalt.",
  reloadNow: "Neu laden",
  reload: "Die Datei erneut lesen",
  autoRefresh: "Selbstt\xE4tig auffrischen",
  "autoRefresh.enable": "Selbstt\xE4tiges Auffrischen einschalten",
  "autoRefresh.disable": "Selbstt\xE4tiges Auffrischen ausschalten",
  "wrap.enable": "Zeilenumbruch einschalten",
  "wrap.disable": "Zeilenumbruch ausschalten",
  "wrap.aria": "Zeilenumbruch",
  openWith: "\xD6ffnen mit",
  "viewer.text": "Reiner Text",
  resourceUnavailable: "Der Dateidienst steht nicht zur Verf\xFCgung.",
  rendererUnavailable: "Die Vorschau f\xFCr {name} steht nicht zur Verf\xFCgung.",
  unsupportedFile: "F\xFCr diesen Dateityp gibt es noch keine Vorschau.",
  "error.notFound": "Datei nicht gefunden. Sie wurde vielleicht verschoben oder gel\xF6scht.",
  "error.tooLarge": "Diese Seite \xFCberschreitet die Grenze von {limit} und l\xE4sst sich nicht lesen.",
  "error.notText": "F\xFCr diesen Dateityp gibt es noch keine Vorschau.",
  "error.notRegularFile": "Keine gew\xF6hnliche Datei \u2014 es gibt nichts anzuzeigen.",
  "error.unavailable": "Lesen fehlgeschlagen: {message}",
  retry: "Erneut versuchen"
};
var zoomtexte = {
  zoomControls: "Zoom-Bedienung",
  zoomMenu: "Zoom w\xE4hlen",
  zoomOut: "Verkleinern",
  zoomIn: "Vergr\xF6ssern",
  zoomFitWidth: "An Breite anpassen",
  zoomValue: "{percent} %"
};
var codevorschau = {
  title: "Quelltext",
  copy: "Kopieren",
  copied: "Kopiert"
};
var tabellenvorschau = {
  title: "Tabelle",
  // Wird an den Tabellenleser durchgereicht: `de` wählt dort die Zahlen- und
  // Datumsformate. Der Harness schreibt hier sonst seine eigene Sprache hinein.
  language: "de",
  loading: "Dokument wird dargestellt \u2026",
  invalid: "Diese Tabelle liess sich nicht \xF6ffnen. Pr\xFCfe das Dateiformat, den Inhalt oder den Passwortschutz.",
  tooLarge: "Diese Tabelle \xFCberschreitet die Gr\xF6sse f\xFCr die Vorschau.",
  timeout: "Das \xD6ffnen dieser Tabelle hat zu lange gedauert. Versuche es mit einer kleineren Datei.",
  encoding: "Diese Textkodierung liess sich nicht lesen. Speichere die Datei als UTF-8 oder als UTF-16 mit BOM und versuche es erneut.",
  formulaWarning: "Diese Arbeitsmappe enth\xE4lt Formeln. Angezeigte Ergebnisse k\xF6nnen fehlen oder ungenau sein.",
  unsupportedNotice: "Diese Vorschau unterst\xFCtzt {features} in dieser Arbeitsmappe nicht. \xD6ffne sie in einer Systemanwendung f\xFCr den vollen Umfang.",
  charts: "Diagramme",
  images: "Bilder",
  shapes: "Formen",
  conditionalFormatting: "bedingte Formatierung",
  // Die Aufzählung in `unsupportedNotice` braucht ein Trennzeichen, das zur
  // Sprache passt. Im Chinesischen ist es `、`, im Englischen `, `.
  featureSeparator: ", ",
  retry: "Erneut versuchen"
};
var htmlvorschau = {
  title: "HTML",
  frame: "HTML-Dokumentvorschau",
  loading: "Dokument wird dargestellt \u2026",
  failed: "Dieses HTML-Dokument liess sich nicht darstellen."
};
var bildvorschau = {
  ...zoomtexte,
  title: "Bild",
  preview: "Bildvorschau: {name}",
  loading: "Dokument wird dargestellt \u2026",
  failed: "Dieses Bild liess sich nicht anzeigen.",
  unsupported: "Die Bildvorschau braucht den vollst\xE4ndigen Dateiinhalt."
};
var markdownvorschau = {
  "viewer.label": "Markdown",
  "code.copy": "Kopieren",
  "code.copied": "Kopiert",
  "footnotes": "Fussnoten"
};
var officevorschau = {
  title: "Office-Dokument",
  loading: "Dokument wird dargestellt \u2026",
  retry: "Erneut versuchen",
  viewMissingFonts: "Fehlende Schriften: {count}. Zum Ansehen dr\xFCcken.",
  missingFontsTitle: "Fehlende Schriften",
  missingFontsDescription: "Diese Schriften stehen f\xFCr die Vorschau nicht zur Verf\xFCgung. Text und Satz k\xF6nnen vom Original abweichen.",
  missingFontsCount: "Schriften: {count}",
  closeDetails: "Schriftangaben schliessen",
  unavailable: "Die Office-Vorschau steht nicht zur Verf\xFCgung. Aktiviere den Dokumentvorschau-Dienst auf dem Rechner, auf dem DeepSeek Harness l\xE4uft.",
  invalid: "Diese Office-Datei liess sich nicht darstellen. Sie kann besch\xE4digt oder passwortgesch\xFCtzt sein, oder die Endung passt nicht zum Inhalt.",
  tooLarge: "Die Office-Datei oder das umgewandelte PDF \xFCberschreitet die Gr\xF6sse f\xFCr die Vorschau. Verkleinere die Datei oder passe die Vorschau-Einstellung an.",
  failed: "Die Umwandlung hat kein brauchbares PDF ergeben. Pr\xFCfe die Datei und versuche es erneut.",
  timeout: "Die Umwandlung hat zu lange gedauert. Versuche es erneut.",
  busy: "Die Office-Vorschau ist gerade ausgelastet. Versuche es gleich noch einmal.",
  changed: "Die Datei wurde w\xE4hrend des Lesens ge\xE4ndert. \xD6ffne die Vorschau erneut."
};
var pdfvorschau = {
  ...zoomtexte,
  title: "PDF",
  pageImage: "PDF-Seite {page}",
  loading: "Dokument wird dargestellt \u2026",
  rendering: "Seite wird gezeichnet \u2026",
  failed: "Das PDF liess sich nicht anzeigen: {message}",
  password: "Dieses PDF ist passwortgesch\xFCtzt. Gesch\xFCtzte Vorschauen werden nicht unterst\xFCtzt.",
  workerFailed: "Der Zeichenvorgang des PDF konnte nicht fortgesetzt werden. Versuche es erneut.",
  unsupported: "Die PDF-Vorschau braucht den vollst\xE4ndigen Dateiinhalt.",
  retry: "Erneut versuchen"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/grundsprache.ts
var gemeinsameSprache = {
  ok: "OK",
  cancel: "Abbrechen",
  close: "Schliessen",
  copy: "Kopieren",
  copied: "Kopiert",
  "codeBlock.title": "Codeblock",
  "codeBlock.wrap": "Zeilen umbrechen",
  "codeBlock.unwrap": "Zeilen nicht umbrechen",
  "copy.failed": "Das Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn von Hand.",
  "copy.value": "Wert kopieren",
  "copy.json": "JSON kopieren",
  "copy.path": "Pfad der Eigenschaft kopieren",
  "copy.prettyJson": "Formatiertes JSON kopieren",
  "copy.compactJson": "Kompaktes JSON kopieren",
  "copy.optionsHint": "{action}; Rechtsklick f\xFCr die Kopierarten",
  retry: "Erneut versuchen",
  loading: "Wird geladen \u2026",
  "load.failed": "Das Laden hat nicht geklappt. Versuche es erneut.",
  submit: "Absenden",
  submitting: "Wird gesendet \u2026",
  next: "Weiter",
  previous: "Zur\xFCck",
  skip: "\xDCberspringen",
  delete: "L\xF6schen",
  edit: "Bearbeiten",
  save: "Speichern",
  search: "Suchen",
  more: "Mehr",
  collapse: "Einklappen",
  expand: "Ausklappen",
  back: "Zur\xFCck",
  // Der Name des Harness bleibt stehen: es ist ein Produktname, kein Wort.
  "brand.localBuild": "DSH lokal gebaut",
  "workspace.defaultName": "Standardarbeitsbereich",
  unknown: "Unbekannt",
  none: "Keine",
  truncated: "Abgeschnitten",
  "json.label": "JSON",
  "markdown.footnotes": "Fussnoten",
  "markdown.truncatedCharacters": "\u2026 bei {total} Zeichen abgeschnitten",
  "number.thousand": "{value} Tsd.",
  "number.million": "{value} Mio."
};
var sprachzeile = {
  "language.title": "Sprache"
};
var layoutbefehle = {
  toggle: "Linke Spalte ein- oder ausklappen"
};
var modelleinstellungen = {
  nav: "Modelle",
  deepSeekAccount: "DeepSeek-Konto",
  title: "Modelle",
  intro: "Trage deine API-Schl\xFCssel ein, um Modelle der folgenden Anbieter zu nutzen.",
  edit: "Bearbeiten",
  editProvider: "{provider} bearbeiten",
  remove: "L\xF6schen",
  removeProvider: "{provider} l\xF6schen",
  deleteTitle: "{provider} l\xF6schen?",
  deleteDescription: "Beim L\xF6schen von {provider} verschwindet seine Einrichtung. Ein Schl\xFCssel, den er benutzt, wird woanders verwaltet und bleibt erhalten.",
  deleteDescriptionWithCredential: "Beim L\xF6schen von {provider} verschwinden seine Einrichtung und der gespeicherte API-Schl\xFCssel.",
  deleteConfirm: "{provider} l\xF6schen",
  deleting: "{provider} wird gel\xF6scht \u2026",
  add: "Modellanbieter hinzuf\xFCgen",
  addMode: "Wie m\xF6chtest du hinzuf\xFCgen",
  addCatalog: "Anbieter aus der Liste",
  addCustom: "Eigene Modell-API",
  addCatalogHint: "W\xE4hle OpenAI, Anthropic, Kimi oder einen anderen Anbieter aus der mitgelieferten Liste und trage seinen API-Schl\xFCssel ein.",
  addCustomHint: "Verbinde eine Weiterleitung, einen eigenen Server oder eine beliebige Schnittstelle nach OpenAI- oder Anthropic-Art \u2014 \xFCber Basisadresse, Protokoll und Modelle.",
  addCatalogExhausted: "Alle Anbieter aus der Liste sind bereits eingerichtet.",
  addCustomUnavailable: "Es steht kein API-Protokoll zur Auswahl.",
  provider: "Anbieter",
  close: "Schliessen",
  cancel: "Abbrechen",
  apply: "\xDCbernehmen",
  applying: "Wird \xFCbernommen \u2026",
  savedProvider: "{provider} gespeichert.",
  credentialConfigured: "API-Schl\xFCssel eingetragen",
  credentialMissing: "API-Schl\xFCssel fehlt",
  readOnly: "Die Einstellungsdatei ist in dieser Umgebung schreibgesch\xFCtzt.",
  loadFailed: "Die Anbieterliste liess sich nicht laden. Versuche es erneut.",
  conflict: "Jemand anders hat diese Einstellungen ge\xE4ndert, w\xE4hrend dieses Fenster offen war. Schliesse es und \xF6ffne es erneut, um die jetzigen Werte zu bearbeiten.",
  retry: "Erneut versuchen",
  keyInput: "API-Schl\xFCssel",
  keyPlaceholder: "Trage deinen API-Schl\xFCssel ein",
  keyPlaceholderNative: "Trage einen API-Schl\xFCssel ein, oder lass das Feld leer, um die Anmeldung aus der Umgebung zu nutzen",
  keyStored: "Eingetragen \u2014 trage einen neuen Wert ein, um ihn zu ersetzen",
  keyEnvLocked: "Kommt aus der Startumgebung (nicht \xE4nderbar)",
  customized: "Angepasste Einstellungen",
  baseUrl: "Base URL",
  baseUrlDefault: "Vorgabe des Anbieters",
  deepSeekBaseUrl: "https://api.deepseek.com/anthropic",
  deepSeekEndpointHint: "Nutze eine Schnittstelle, die zu Anthropic Messages passt.",
  models: "Modelle",
  modelsInherited: "Es gelten die Vorgaben des Adapters",
  modelsCustomized: "Angepasste Modellliste",
  resetModels: "Vorgaben wiederherstellen",
  model: "Modell",
  modelId: "Modell-Kennung",
  modelName: "Anzeigename",
  modelNamePlaceholder: "Ohne Eintrag gilt die Modell-Kennung",
  contextWindow: "Kontextfenster",
  contextWindowPlaceholder: "Ohne Eintrag gilt die Vorgabe des Anbieters",
  maxTokens: "H\xF6chstzahl Ausgabe-Token",
  maxTokensPlaceholder: "Ohne Eintrag gilt die Vorgabe des Anbieters",
  modelAdvanced: "Modell-Optionen",
  modelInputTypes: "Eingabearten",
  modelInputText: "Text",
  modelInputImage: "Bild",
  addModel: "Modell hinzuf\xFCgen",
  removeModel: "Modell l\xF6schen",
  modelsEmpty: "In der Auswahl erscheinen keine Modelle. Kennungen, die hier nicht stehen, lassen sich weiterhin direkt senden.",
  keyBlank: "Trage den API-Schl\xFCssel ein, oder lass das Feld leer, um den gespeicherten zu behalten.",
  keyBlankNew: "Trage den API-Schl\xFCssel ein, oder lass das Feld leer, wenn dieser Anbieter sich anders anmeldet.",
  keyIllegalCharacters: "Dieser API-Schl\xFCssel hat kein g\xFCltiges Format. Pr\xFCfe ihn.",
  modelIdRequired: "Die Modell-Kennung wird gebraucht.",
  modelIdDuplicate: "Die Modell-Kennung muss einmalig sein.",
  modelNameInvalid: "Der Anzeigename darf nicht leer sein.",
  modelContextInvalid: "Das Kontextfenster braucht eine positive Zahl, etwa 131072, 256K oder 1M.",
  modelMaxTokensInvalid: "Die H\xF6chstzahl Ausgabe-Token braucht eine positive Zahl, etwa 8192, 64K oder 1M.",
  advancedHint: "Weitere Felder stehen in cordis.patch.yml; bearbeite diesen Abschnitt direkt.",
  modelCapacityInvalid: "Eine Kapazit\xE4t ist eine Zahl, wahlweise mit K oder M dahinter.",
  modelDuplicate: "Jede Modell-Kennung darf einmal vorkommen.",
  fetchModels: "Verf\xFCgbare Modelle holen",
  fetching: "Der Anbieter wird gefragt \u2026",
  fetchNeedsBaseUrl: "Trage zuerst die Basisadresse ein, dann hole die Modelle.",
  fetchEmpty: "Der Anbieter hat keine Modelle genannt. Trage sie von Hand ein.",
  fetchTitle: "Modelle zum Hinzuf\xFCgen w\xE4hlen",
  fetchDescription: "Das sind die Modelle, die dieser Anbieter f\xFChrt. W\xE4hle die aus, die du hinzuf\xFCgen willst.",
  fetchSearch: "Modelle durchsuchen",
  fetchNoMatches: "Keine passenden Modelle.",
  fetchSelectAll: "Alle ausw\xE4hlen",
  fetchDeselectAll: "Auswahl aufheben",
  fetchAdopt: "Ausgew\xE4hlte hinzuf\xFCgen",
  customTag: "Eigene",
  customRoute: "Anbieter-Kennung",
  customRouteHint: "Eine Kennung aus Kleinbuchstaben, beginnend mit einem Buchstaben. Sie benennt diesen Anbieter eindeutig in Anfragen und als Name seines Schl\xFCssels.",
  customRouteInvalid: "Beginne mit einem Kleinbuchstaben; danach Kleinbuchstaben, Ziffern und Bindestriche.",
  customRouteTaken: "Diese Kennung benutzt schon ein Anbieter.",
  customDisplayName: "Anzeigename",
  customApi: "API-Protokoll",
  customApiUnset: "Nicht ausgew\xE4hlt",
  protocolOpenAiCompletions: "OpenAI Chat Completions",
  protocolOpenAiResponses: "OpenAI Responses",
  protocolAnthropicMessages: "Anthropic Messages",
  customNeedsBaseUrl: "Ein eigener Anbieter braucht eine Basisadresse.",
  customBaseUrlInvalid: "Trage eine g\xFCltige HTTP- oder HTTPS-Adresse ein.",
  customNeedsModels: "Ein eigener Anbieter braucht mindestens ein Modell.",
  customBaseUrlPlaceholder: "https://gateway.example/v1",
  customAnthropicBaseUrlPlaceholder: "https://gateway.example",
  settingsPathUnresolvable: "Pfad in den Einstellungen nicht aufl\xF6sbar",
  create: "Anbieter anlegen",
  creating: "Wird angelegt \u2026",
  welcomeTitle: "Hinweis zur Vorschau",
  welcomeBody: "DeepSeek Harness 0.2 ist noch in der Vorschau, und an vielen Stellen gibt es weiter zu verbessern. Wir freuen uns \xFCber R\xFCckmeldungen von allen Entwicklern und Nutzern. Die neue Desktop-Anwendung richtet sich an ein breites Publikum; die weiterf\xFChrenden Funktionen f\xFCr Entwickler lassen sich in den Einstellungen einschalten. Die Produktfunktionen und die Plugin-Schnittstellen von DeepSeek Harness werden sich weiter z\xFCgig entwickeln und mit der Zeit ruhiger werden.\n\nWir freuen uns darauf, die Grenzen des Machbaren gemeinsam mit Nutzern und Entwicklern auszuloten \u2014 auf einer offenen, wiederverwendbaren und zusammensetzbaren Grundlage. Bring deine Ideen mit DeepSeek Harness zum Laufen und mach in der Gemeinde mit, um das \xD6kosystem der Erweiterungen zu bereichern.",
  welcomeContinue: "Weiter",
  welcomeError: "Die Best\xE4tigung liess sich nicht speichern. Versuche es erneut.",
  onboardingTitle: "Trage einen API-Schl\xFCssel ein, um zu beginnen",
  onboardingDescription: "Richte den offiziellen DeepSeek-Anbieter ein, um loszulegen.",
  onboardingLater: "Sp\xE4ter einrichten",
  onboardingSave: "Speichern und weiter",
  onboardingSaving: "Wird gespeichert \u2026",
  keyRequired: "Trage einen API-Schl\xFCssel ein, um fortzufahren."
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/gespraech2.ts
var gespraechstexte = {
  // ── Schritte einer Runde ──────────────────────────────────────────────────
  "message.stepProcess.thinking": "Die Anfrage wird ausgewertet",
  "message.stepProcess.read": "Dateien werden gelesen",
  "message.stepProcess.readImage": "Bilder werden gelesen",
  "message.stepProcess.write": "Dateien werden geschrieben",
  "message.stepProcess.search": "Der Code wird durchsucht",
  "message.stepProcess.edit": "Dateien werden bearbeitet",
  "message.stepProcess.commands": "Befehle werden ausgef\xFChrt",
  "message.stepProcess.code": "Code wird ausgef\xFChrt",
  "message.stepProcess.webSearch": "Das Web wird durchsucht",
  "message.stepProcess.webFetch": "Webseiten werden aufgerufen",
  "message.stepProcess.subagents": "Unteragenten werden gesteuert",
  "message.stepProcess.plan": "Der Plan wird aktualisiert",
  "message.stepProcess.questions": "Warte auf deine Eingabe",
  "message.stepProcess.tools": "Werkzeuge werden aufgerufen",
  "message.stepProcess.prepare.read": "Dateien werden zum Lesen vorbereitet",
  "message.stepProcess.prepare.readImage": "Bilder werden zum Lesen vorbereitet",
  "message.stepProcess.prepare.write": "Dateien werden zum Schreiben vorbereitet",
  "message.stepProcess.prepare.search": "Die Codesuche wird vorbereitet",
  "message.stepProcess.prepare.edit": "Dateien werden zum Bearbeiten vorbereitet",
  "message.stepProcess.prepare.commands": "Befehle werden vorbereitet",
  "message.stepProcess.prepare.code": "Die Codeausf\xFChrung wird vorbereitet",
  "message.stepProcess.prepare.webSearch": "Die Websuche wird vorbereitet",
  "message.stepProcess.prepare.webFetch": "Der Seitenaufruf wird vorbereitet",
  "message.stepProcess.prepare.subagents": "Die Steuerung der Unteragenten wird vorbereitet",
  "message.stepProcess.prepare.plan": "Die Planaktualisierung wird vorbereitet",
  "message.stepProcess.prepare.questions": "Fragen werden vorbereitet",
  "message.stepProcess.prepare.tools": "Werkzeugaufrufe werden vorbereitet",
  "message.stepProcess.done.thinking": "Anfrage ausgewertet",
  "message.stepProcess.done.read": "Dateien gelesen",
  "message.stepProcess.done.readImage": "Bilder gelesen",
  "message.stepProcess.done.write": "Dateien geschrieben",
  "message.stepProcess.done.search": "Code durchsucht",
  "message.stepProcess.done.edit": "Dateien bearbeitet",
  "message.stepProcess.done.commands": "Befehle ausgef\xFChrt",
  "message.stepProcess.done.code": "Code ausgef\xFChrt",
  "message.stepProcess.done.webSearch": "Web durchsucht",
  "message.stepProcess.done.webFetch": "Webseiten aufgerufen",
  "message.stepProcess.done.subagents": "Unteragenten gesteuert",
  "message.stepProcess.done.plan": "Plan aktualisiert",
  "message.stepProcess.done.questions": "Fragen gestellt",
  "message.stepProcess.done.tools": "Werkzeuge aufgerufen",
  "message.stepProcess.joinTwo": "{first} und {second}",
  "message.stepProcess.comma": ", ",
  "message.stepProcess.sharedPrefix": "",
  "message.stepProcess.more": "{title} und weitere",
  // ── Auslöser einer Antwort ────────────────────────────────────────────────
  "message.trigger.request": "Ausf\xFChrung angefordert",
  "message.trigger.goal": "Ziel wird fortgesetzt",
  "message.trigger.agent": "Aufgabennachricht erhalten",
  "message.trigger.team": "Teamnachricht erhalten",
  "message.trigger.subagent": "Status der Unteraufgabe aktualisiert",
  "message.trigger.github": "GitHub-Ereignis erhalten",
  "message.trigger.webhook": "Externes Ereignis erhalten",
  "message.trigger.schedule": "Automatischer Auftrag",
  "message.trigger.job": "Hintergrundauftrag aktualisiert",
  "message.trigger.plugin": "Status der Erweiterung aktualisiert",
  "message.trigger.explanation": "Diese Meldung hat diese Antwort ausgel\xF6st.",
  // ── Lauf einer Runde ──────────────────────────────────────────────────────
  "message.turnProcess.worked": "Abgeschlossen",
  "message.turnProcess.took": "Abgeschlossen in ",
  "message.turnProcess.failed": "Fehlgeschlagen",
  // ── Ansicht, Bilder, Zahlen ───────────────────────────────────────────────
  "view.chat": "Chat",
  "image.open": "Ganzes Bild ansehen",
  "image.loading": "Bild wird geladen\u2026",
  "image.failed": "Keine Bildvorschau verf\xFCgbar. \xD6ffne die Datei ausserhalb der App.",
  "image.dialog": "Bildvorschau",
  "image.close": "Bildvorschau schliessen",
  "number.groupSeparator": ".",
  "duration.compactSeconds": "{seconds}s",
  "duration.compactMinutes": "{minutes}m{seconds}s",
  "duration.milliseconds": "{milliseconds}ms",
  "duration.secondUnit": "s",
  "duration.minuteUnit": "m ",
  "duration.hourUnit": "h ",
  // ── Statistik des Chats ───────────────────────────────────────────────────
  "stats.counts": "{turns} Runden \xB7 {steps} Schritte",
  "stats.cacheHit": "Cache-Treffer {percent}%",
  "stats.dialog.title": "Statistik des Chats",
  "stats.dialog.usageTitle": "Token-Verbrauch",
  "stats.dialog.llmTime": "Zeit im LLM",
  "stats.dialog.toolTime": "Zeit in Werkzeugen",
  "stats.dialog.ttft": "Mittlere Zeit bis zum ersten Token (TTFT)",
  "stats.dialog.speed": "Token pro Sekunde (TPS)",
  // ── Verlauf und Navigation ────────────────────────────────────────────────
  "chat.loadingHistory": "Verlauf wird geladen\u2026",
  "chat.loadError": "Verlauf konnte nicht geladen werden: {message} ({code}). Lade die Seite neu oder pr\xFCfe die Verbindung.",
  "chat.loadOlder": "\xC4ltere laden",
  "chat.toBottom": "Zur\xFCck nach unten",
  "chat.deepDiving": "Denkt eingehend nach",
  "chat.deepDivingFor": "Denkt seit {duration} nach \xB7\xB7\xB7",
  "chat.turnNavigation.label": "Rundennavigation",
  "chat.turnNavigation.jump": "Zu Runde {turn} springen",
  "chat.turnNavigation.jumpLoad": "Runde {turn} laden und dorthin springen",
  "chat.turnNavigation.turn": "Runde {turn}",
  // ── Einstellungen zum Verlauf ─────────────────────────────────────────────
  "settings.performance.title": "Leistung und Verbrauch",
  "settings.performance.description": "W\xE4hle, wie viele Angaben zu Leistung und Verbrauch angezeigt werden",
  "settings.performance.compact": "Kompakt",
  "settings.performance.detailed": "Ausf\xFChrlich",
  "settings.links.title": "Chat-Links \xF6ffnen in",
  "settings.links.description": "W\xE4hle, wo Weblinks ge\xF6ffnet werden",
  "settings.links.sidebar": "Seitenleiste in der App",
  "settings.links.newTab": "Standardbrowser",
  "settings.transcript.title": "Arbeitsdetails",
  "settings.transcript.description": "W\xE4hle, wie ausf\xFChrlich Werkzeugaufrufe angezeigt werden",
  "settings.transcript.compact": "Kompakt",
  "settings.transcript.standard": "Standard",
  "settings.transcript.detailed": "Ausf\xFChrlich",
  "settings.transcript.verbose": "Alles anzeigen",
  // ── Dateien öffnen ────────────────────────────────────────────────────────
  "fileOpen.title": "Datei konnte nicht ge\xF6ffnet werden",
  "fileOpen.unknown": "Diese Datei konnte nicht ge\xF6ffnet werden. Pr\xFCfe den Pfad oder \xF6ffne sie ausserhalb der App.",
  // ── Inhaltsblöcke und Werkzeuge ───────────────────────────────────────────
  "message.extraBlock": "Zus\xE4tzlicher Inhaltsblock",
  "message.systemPrompt": "System-Prompt",
  "message.systemPromptUpdate": "System-Prompt aktualisiert",
  "message.toolAdded": "Werkzeug hinzugef\xFCgt: {name}",
  "message.toolRemoved": "Werkzeug entfernt: {name}",
  "message.toolsAdded": "Hinzugef\xFCgt: {names}",
  "message.toolsAddedCount": "{count} hinzugef\xFCgt",
  "message.toolsChanged": "{added} hinzugef\xFCgt, {removed} entfernt",
  "message.toolsRemoved": "Entfernt: {names}",
  "message.toolsRemovedCount": "{count} entfernt",
  "message.toolsUpdated": "Werkzeuge aktualisiert",
  // ── Kontext und Verdichtung ───────────────────────────────────────────────
  "message.contextInjection": "Kontexteinf\xFCgung",
  "message.contextRecall": "R\xFCckgriff auf fr\xFCheren Chat",
  "message.referenceSummary": "Verwiesener Chat \xB7 {labels}",
  "message.referenceSeparator": ", ",
  "message.context.instructions.loaded": "geladen",
  "message.context.instructions.added": "hinzugef\xFCgt",
  "message.context.instructions.updated": "aktualisiert",
  "message.context.instructions.removed": "entfernt",
  "message.context.catalog.replaced": "Ersetzter Katalog",
  "message.context.catalog.more": "\u2026 {count} weitere",
  "message.context.snapshot.supersedes": "Ersetzt fr\xFChere Momentaufnahmen",
  "message.context.relay.from": "Aus Chat {session}",
  "message.context.recall.counts": "{retained} behalten \xB7 {omitted} ausgelassen",
  "message.context.recall.truncated": "gek\xFCrzt",
  "message.compaction": "Kontext verdichtet",
  "message.compaction.running": "Kontext wird verdichtet\u2026",
  "message.compaction.completed": "{items} Verlaufseintr\xE4ge verdichtet (~{tokens} Token)",
  "message.compaction.expand": "Zusammenfassung der Verdichtung ansehen",
  "message.compaction.unavailable": "Keine Zusammenfassung der Verdichtung verf\xFCgbar",
  "message.compaction.commandTitle": "compact",
  "message.think": "Denken",
  "message.unknownSurface": "Unbekanntes Ereignis der Oberfl\xE4che: {type}",
  "message.unknownBlock": "Unbekannter Inhaltsblock",
  // ── Zählungen in einer Runde ──────────────────────────────────────────────
  "message.turnProcess.toolCalls.one": "{count} Werkzeugaufruf",
  "message.turnProcess.toolCalls.other": "{count} Werkzeugaufrufe",
  "message.turnProcess.messages.one": "{count} Nachricht",
  "message.turnProcess.messages.other": "{count} Nachrichten",
  "message.turnProcess.subagents.one": "{count} Unteragent",
  "message.turnProcess.subagents.other": "{count} Unteragenten",
  "message.turnProcess.thoughtForAWhile": "Hat eine Weile nachgedacht",
  "message.turnProcess.separator": " \xB7 ",
  "message.stopped": "Angehalten",
  "message.branch": "In einen neuen Chat abzweigen",
  "message.branchUnavailable": "Nur bei der letzten Nachricht einer abgeschlossenen Runde m\xF6glich",
  // ── Wiederholung einer Modellanfrage ──────────────────────────────────────
  "message.retry.active": "Die Modellanfrage wird erneut gesendet",
  "message.retry.cancelled": "Wiederholung der Modellanfrage abgebrochen",
  "message.retry.started": "Modellanfrage erneut gesendet",
  "message.retry.scheduled": "Wartet auf Wiederholung der Modellanfrage",
  "message.retry.status": "{label} ({retry}/{maximum}) \xB7 {seconds}s",
  "message.retry.delay": "Wartezeit bis zur Wiederholung: ",
  "message.retry.failure": "Grund des Fehlschlags: ",
  // ── Fehler ────────────────────────────────────────────────────────────────
  "message.failure.auth": "Der API-Schl\xFCssel ist ung\xFCltig. Trage in den Einstellungen unter Modelle einen g\xFCltigen Schl\xFCssel ein.",
  "message.accountStopped": "Aufgabe angehalten",
  "message.failure.accountSignedOut": "Angehalten, weil du dich bei DeepSeek abgemeldet hast. Melde dich wieder an, um fortzusetzen.",
  "message.failure.accountSignInRequired": "Melde dich bei DeepSeek an und pr\xFCfe, ob das Ziel der Anfrage die Kontoanmeldung unterst\xFCtzt.",
  "message.failure.quota": "Das Kontingent f\xFCr Anfragen ist aufgebraucht. Warte auf den n\xE4chsten Zeitraum oder erh\xF6he das Kontingent.",
  "message.turnError": "Diese Runde ist fehlgeschlagen. Sende die Nachricht erneut oder pr\xFCfe die Einstellungen.",
  "message.maxTokens": "Obergrenze f\xFCr Ausgabe-Token erreicht",
  "message.maxTokens.hint": 'Die Antwort wurde abgeschnitten; fr\xFChere Ausgaben bleiben im Chat erhalten. Sende "continue", damit das Modell fortsetzt.',
  // ── Verbrauch einer Runde ─────────────────────────────────────────────────
  "message.tokensPerSecond": "{tps} tok/s",
  "message.turnUsage.title": "Verbrauch der Runde",
  "message.turnUsage.consumed": "Verbrauch {total}",
  "message.turnUsage.model": "Anbieter / Modell",
  "message.turnUsage.cacheHit": "Cache-Treffer",
  "message.turnUsage.input": "Nicht zwischengespeicherte Eingabe",
  "message.turnUsage.cacheRead": "Zwischengespeicherte Eingabe",
  "message.turnUsage.cacheWrite": "Schreiben in den Cache",
  "message.turnUsage.output": "Ausgabe",
  "message.turnUsage.reasoning": " ({tokens} Denk-Token)",
  "message.turnUsage.count": "{count} tok",
  // ── Befehle und Zeilen ────────────────────────────────────────────────────
  "command.running": "L\xE4uft\u2026",
  "command.failed": "Befehl fehlgeschlagen. Pr\xFCfe die Ausgabe und starte ihn erneut.",
  "command.done": "Abgeschlossen",
  "command.title": "Befehl",
  "row.running": "L\xE4uft",
  "row.failed": "Fehlgeschlagen",
  "json.truncated": "\u2026 gek\xFCrzt, insgesamt {total} Zeichen",
  // ── Datumsformate ─────────────────────────────────────────────────────────
  "clock.md": "{d}.{m}.",
  "clock.ymd": "{d}.{m}.{y}"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/zeitregeln.ts
var frequenz = {
  // ── Zeitangabe ─────────────────────────────────────────────────────────────
  // Das Sprachkürzel bestimmt, wie Datum und Uhrzeit dargestellt werden.
  "time.locale": "de-DE",
  "time.utcPrefix": "UTC",
  // ── Wiederholungen ─────────────────────────────────────────────────────────
  "frequency.daily": "T\xE4glich um {time} ({timeZone})",
  "frequency.dailyLocal": "T\xE4glich um {time}",
  "frequency.weekly": "W\xF6chentlich {weekdays} um {time} ({timeZone})",
  "frequency.weeklyLocal": "W\xF6chentlich {weekdays} um {time}",
  "frequency.cron": "Cron {expression} ({timeZone})",
  "frequency.cronLocal": "Cron {expression}",
  "frequency.cronRule": "{rule} ({timeZone})",
  // ── Cron-Regel in Worte fassen ─────────────────────────────────────────────
  "cron.list.join": ", ",
  "cron.part.join": " ",
  "cron.weekday.name": "{weekday}",
  "cron.weekday.range": "{from} bis {to}",
  "cron.months": " im {months}",
  "cron.day.every": "Jeden Tag{months}",
  "cron.day.weekdays": "{weekdays}{months}",
  "cron.day.monthDays": "Am {days}. jedes Monats{months}",
  "cron.day.both": "Am {days}. jedes Monats oder {weekdays}{months}",
  "cron.day.bothStarred": "Am {days}. jedes Monats und {weekdays}{months}",
  "cron.hours.range": "{from} bis {to}",
  "cron.hours.list": "{hours}",
  // ── Uhrzeiten ──────────────────────────────────────────────────────────────
  "cron.time.everyMinute": "Jede Minute",
  "cron.time.everyMinutes": "Alle {step} Minuten",
  "cron.time.joinedEveryMinute": "jede Minute",
  "cron.time.joinedEveryMinutes": "alle {step} Minuten",
  "cron.time.everyHour": "Jede Stunde",
  "cron.time.joinedEveryHour": "jede Stunde",
  "cron.time.everyNHours": "Alle {count} Stunden",
  "cron.time.joinedEveryNHours": "alle {count} Stunden",
  "cron.time.hourlyAt": "Jede Stunde zur Minute {minutes}",
  "cron.time.joinedHourlyAt": "jede Stunde zur Minute {minutes}",
  "cron.time.hoursEveryMinute": "jede Minute in den Stunden {hours}",
  "cron.time.hoursEveryMinutes": "alle {step} Minuten in den Stunden {hours}",
  "cron.time.at": "um {times}",
  "cron.time.hoursAt": "zur Minute {minutes} in den Stunden {hours}",
  // ── Wochentage ─────────────────────────────────────────────────────────────
  "frequency.weekday.join": ", ",
  "frequency.weekday.1": "montags",
  "frequency.weekday.2": "dienstags",
  "frequency.weekday.3": "mittwochs",
  "frequency.weekday.4": "donnerstags",
  "frequency.weekday.5": "freitags",
  "frequency.weekday.6": "samstags",
  "frequency.weekday.7": "sonntags",
  // ── Zeiteinheiten ──────────────────────────────────────────────────────────
  "unit.day.one": "Tag",
  "unit.day.other": "Tage",
  "unit.hour.one": "Stunde",
  "unit.hour.other": "Stunden",
  "unit.minute.one": "Minute",
  "unit.minute.other": "Minuten",
  "unit.second.one": "Sekunde",
  "unit.second.other": "Sekunden",
  // ── Verhältnis zur Jetztzeit ───────────────────────────────────────────────
  "relative.now": "Jetzt f\xE4llig",
  "relative.future": "in {value} {unit}",
  "relative.overdue": "seit {value} {unit} \xFCberf\xE4llig"
};
var zeitregeln = {
  ...frequenz,
  "trigger.label": "Erinnerungen",
  "list.loading": "Die Erinnerungen werden geladen\u2026",
  "list.error": "Die Erinnerungen liessen sich nicht laden.",
  "list.retry": "Erneut versuchen",
  "delete.action": "L\xF6schen",
  "delete.pending": "Wird gel\xF6scht\u2026",
  "delete.label": "Erinnerung l\xF6schen: {title}",
  "list.open": "Einzelheiten der Erinnerung \xF6ffnen: {title}",
  "trigger.one": "{count} Erinnerung",
  "trigger.other": "{count} Erinnerungen",
  "list.aria": "Laufende Erinnerungen",
  "list.nextRun": "N\xE4chster Lauf",
  "frequency.once": "Einmalig",
  "frequency.every": "Alle {value} {unit}",
  "mark.aria": "{count} automatische Auftr\xE4ge",
  "hover.more": "und {count} weitere Auftr\xE4ge"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter/zeitplanverwaltung.ts
var zeitplanverwaltung = {
  ...frequenz,
  // ── Rahmen ─────────────────────────────────────────────────────────────────
  panel: "Automatische Auftr\xE4ge",
  title: "Automatische Auftr\xE4ge",
  "new.action": "Neu",
  // ── Liste ──────────────────────────────────────────────────────────────────
  "list.label": "Auftragsliste",
  "list.nextPrefix": "N\xE4chster Lauf: ",
  "list.loading": "Die Auftr\xE4ge werden geladen\u2026",
  "list.error": "Die Auftr\xE4ge liessen sich nicht laden",
  "list.retry": "Erneut versuchen",
  "list.empty": "Es gibt noch keine automatischen Auftr\xE4ge. Auftr\xE4ge, die du in einem Chat anlegst, erscheinen hier.",
  "list.emptyInactive": "Es gibt keine beendeten automatischen Auftr\xE4ge",
  "list.noMatches": "Kein automatischer Auftrag passt zur Suche",
  "search.label": "Auftr\xE4ge durchsuchen",
  "search.placeholder": "Automatische Auftr\xE4ge durchsuchen",
  "search.clear": "Suche leeren",
  "empty.action": "Automatischen Auftrag anlegen",
  "statusFilter.label": "Zustand des Auftrags",
  "statusFilter.all": "Alle",
  "status.active": "Eingeschaltet",
  "status.inactive": "Beendet",
  // ── Einzelheiten ───────────────────────────────────────────────────────────
  "detail.label": "Einzelheiten des Auftrags",
  "detail.close": "Einzelheiten schliessen",
  "detail.more": "Aktionen f\xFCr den Auftrag",
  "detail.nextRun": "N\xE4chster Lauf",
  "detail.tabs": "Ansichten der Einzelheiten",
  "detail.rule": "Regel",
  "detail.records": "Aufzeichnungen der L\xE4ufe",
  "detail.name": "Name des Auftrags",
  "detail.instruction": "Inhalt des Auftrags",
  "detail.status": "Zustand",
  "detail.next": "N\xE4chste geplante Zeit",
  "detail.frequency": "H\xE4ufigkeit",
  "detail.id": "Kennung",
  "detail.session": "Zugeh\xF6riger Chat",
  "detail.openSession": "Zugeh\xF6riger Chat: den urspr\xFCnglichen Chat \xF6ffnen",
  "detail.openSessionTitle": "Zugeh\xF6riger Chat {title}: den urspr\xFCnglichen Chat \xF6ffnen",
  "detail.sessionLoading": "Die Angaben zum urspr\xFCnglichen Chat werden geladen",
  "detail.sessionArchived": "Der urspr\xFCngliche Chat ist archiviert",
  "detail.sessionUnavailable": "Der urspr\xFCngliche Chat ist zur Zeit nicht verf\xFCgbar",
  "detail.missing": "Diesen Auftrag gibt es nicht mehr \u2014 vielleicht wurde er gel\xF6scht",
  // ── Aufzeichnungen der Läufe ───────────────────────────────────────────────
  "delivery.label": "Gespeicherte Aufzeichnungen der L\xE4ufe",
  "delivery.empty": "Noch keine Aufzeichnung",
  "delivery.loading": "Die Aufzeichnungen werden geladen\u2026",
  "delivery.error": "Die Aufzeichnungen liessen sich nicht laden",
  "delivery.notFound": "Der Auftrag ist nicht mehr verf\xFCgbar",
  "delivery.cursorError": "Die Aufzeichnungen wurden erneuert",
  "delivery.retry": "Erneut versuchen",
  "delivery.refresh": "Neu laden",
  "delivery.loadMore": "Mehr laden",
  "delivery.expand": "Ausklappen",
  "delivery.collapse": "Einklappen",
  "delivery.pruned": "\xC4ltere Aufzeichnungen wurden aufger\xE4umt",
  "delivery.retention": "Aufbewahrung",
  "delivery.retentionBounds": "Je Auftrag werden h\xF6chstens {records} Aufzeichnungen aus den letzten {days} Tagen behalten.",
  "delivery.retentionExplanation": "Kommen neue Aufzeichnungen hinzu, werden \xE4ltere ausserhalb dieser Grenze selbstt\xE4tig aufger\xE4umt. Das Aufr\xE4umen st\xF6rt den weiteren Lauf des Auftrags nicht.",
  // ── Zeitregel ──────────────────────────────────────────────────────────────
  "frequency.once": "Nur einmal",
  "frequency.every": "Alle {value} {unit}",
  "rule.title": "Laufzeit",
  "rule.repeat": "Wiederholung",
  "rule.weekday": "Wochentag",
  "rule.weekdayOption": "{weekday}",
  "rule.unsaved": "Es gibt ungespeicherte \xC4nderungen",
  "rule.save": "\xC4nderungen speichern",
  "rule.saving": "Wird gespeichert\u2026",
  "rule.cancel": "Abbrechen",
  "rule.invalidTitle": "Der Name darf h\xF6chstens 120 Zeichen haben",
  "rule.invalidPrompt": "Gib den Inhalt des Auftrags ein",
  "rule.once": "Nur einmal",
  "rule.everyMinutes": "Alle N Minuten",
  "rule.everyHours": "Alle N Stunden",
  "rule.everySeconds": "Alle N Sekunden",
  "rule.daily": "T\xE4glich",
  "rule.weekdays": "Montag bis Freitag",
  "rule.weekly": "W\xF6chentlich",
  "rule.cron": "Eigene Regel",
  "rule.cronLabel": "Cron-Ausdruck",
  "rule.cronInvalid": "Gib einen Cron-Ausdruck mit f\xFCnf Feldern ein, zum Beispiel 0 9 * * 1-5",
  "rule.zone.system": " (System)",
  "rule.error.conflict": "Der Auftrag hat sich vor dem Speichern ge\xE4ndert. Angezeigt wird die gespeicherte Regel. Versuche es erneut.",
  "rule.error.notFound": "Dieser Auftrag ist zur Zeit nicht verf\xFCgbar",
  "rule.error.unknown": "Ob die Regel \xFCbernommen wurde, liess sich nicht feststellen. Angezeigt wird die gespeicherte Regel.",
  // ── Der Regel-Editor ───────────────────────────────────────────────────────
  "cronForm.frequency": "H\xE4ufigkeit",
  "cronForm.monthly": "Monatlich",
  "cronForm.weekly": "W\xF6chentlich",
  "cronForm.daily": "T\xE4glich",
  "cronForm.dates": "An diesen Tagen",
  "cronForm.dateOption": "Am {day}.",
  "cronForm.atMinute": "Zur Minute",
  "cronForm.minuteIncrease": "Minute erh\xF6hen",
  "cronForm.minuteDecrease": "Minute verringern",
  // ── Zeit und Zeitzone ──────────────────────────────────────────────────────
  "timing.date": "Datum",
  "timing.time": "Uhrzeit",
  "timing.hour": "Stunde",
  "timing.minute": "Minute",
  "timing.second": "Sekunde",
  "timing.prevMonth": "Voriger Monat",
  "timing.nextMonth": "N\xE4chster Monat",
  "timing.zone": "Zeitzone",
  "timing.zoneSearch": "Nach UTC-Versatz, IANA-Kennung oder Stadt suchen",
  "timing.zoneNoResults": "Keine Zeitzone passt zur Suche",
  "timing.interval": "Abstand der Wiederholung",
  "timing.intervalIncrease": "Abstand vergr\xF6ssern",
  "timing.intervalDecrease": "Abstand verkleinern",
  "timing.unit.hour": "Stunden",
  "timing.unit.minute": "Minuten",
  "timing.unit.second": "Sekunden",
  "timing.intervalHint.hour": "Mindestens 1 Stunde. Der Abstand z\xE4hlt ab dem Anlegen des Auftrags oder ab der letzten Regel\xE4nderung und h\xE4ngt nicht von der Zeitzone ab.",
  "timing.intervalHint.minute": "Mindestens 1 Minute. Der Abstand z\xE4hlt ab dem Anlegen des Auftrags oder ab der letzten Regel\xE4nderung und h\xE4ngt nicht von der Zeitzone ab.",
  "timing.intervalHint.second": "Mindestens 60 Sekunden. Der Abstand z\xE4hlt ab dem Anlegen des Auftrags oder ab der letzten Regel\xE4nderung und h\xE4ngt nicht von der Zeitzone ab.",
  "timing.zoneNoStored": "Ein einmaliger Auftrag speichert nur den Zeitpunkt, nicht die Zeitzone. Datum und Uhrzeit werden in die gew\xE4hlte Zeitzone umgerechnet.",
  "timing.inactive": "Ein beendeter Auftrag ist nur lesbar; die Zeit l\xE4sst sich nicht \xE4ndern.",
  "timing.conflict": "Der Auftrag hat sich w\xE4hrend der Bearbeitung ge\xE4ndert; dein Entwurf bleibt erhalten. Lade neu, brich ab und \xF6ffne den Editor erneut, um die neueste Regel zu \xE4ndern.",
  "timing.notFound": "Dieser Auftrag ist zur Zeit nicht verf\xFCgbar; dein Entwurf bleibt erhalten. Brich ab, um den Editor zu schliessen.",
  "timing.invalid": "Gib ein g\xFCltiges Datum und eine g\xFCltige Uhrzeit ein, oder pr\xFCfe die Zeitfelder.",
  "timing.invalidZone": "Gib eine g\xFCltige IANA-Zeitzone ein, zum Beispiel Europe/Berlin",
  "timing.notFuture": "W\xE4hle ein Datum und eine Uhrzeit in der Zukunft",
  "timing.invalidInterval": "Gib einen Abstand von mindestens 1 Minute ein",
  "timing.invalidInterval.hour": "Gib einen Abstand von mindestens 1 Stunde ein",
  "timing.invalidInterval.minute": "Gib einen Abstand von mindestens 1 Minute ein",
  "timing.invalidInterval.second": "Gib einen Abstand von mindestens 60 Sekunden ein",
  "timing.error": "Ob die Zeit\xE4nderung gespeichert wurde, liess sich nicht feststellen. Dein Entwurf bleibt erhalten; pr\xFCfe den Auftrag, bevor du es erneut versuchst.",
  // ── Löschen ────────────────────────────────────────────────────────────────
  "delete.action": "Auftrag l\xF6schen",
  "delete.title": "Diesen Auftrag l\xF6schen?",
  "delete.description": "Der Auftrag l\xF6st nichts mehr aus und wird samt seinen gespeicherten Aufzeichnungen gel\xF6scht. Der urspr\xFCngliche Chat und seine Nachrichten bleiben erhalten; bereits eingereihte Nachrichten werden nicht zur\xFCckgeholt.",
  "delete.confirm": "L\xF6schen best\xE4tigen",
  "delete.cancel": "Abbrechen",
  "delete.close": "Best\xE4tigung schliessen",
  "delete.pending": "Wird gel\xF6scht\u2026",
  "toast.deleted": "Der Auftrag ist gel\xF6scht",
  "toast.deleteFailed": "Der Auftrag liess sich nicht l\xF6schen",
  // ── Karten und Werkzeug ────────────────────────────────────────────────────
  "card.open": "\xD6ffnen",
  "card.openLabel": "Einzelheiten des Auftrags \xF6ffnen: {title}",
  "card.deleted": "Gel\xF6scht",
  "tool.invoked": "{name} aufgerufen"
};

// pakete/dsh-client-ui-promptheus/src/client/woerter.ts
var sidebar = {
  "session.new": "Neuer Chat",
  "session.new.label": "Neuen Chat beginnen",
  "toggle.open": "Seitenleiste \xF6ffnen",
  "toggle.collapse": "Seitenleiste einklappen",
  "panels.label": "Globale Bereiche"
};
var settingsGeneral = {
  "trigger": "Einstellungen",
  "shortcut.open": "Einstellungen \xF6ffnen",
  "title": "Einstellungen",
  "close": "Schliessen",
  "openDocument": "Konfigurationsdatei \xF6ffnen",
  "openDocument.error": "Die Konfigurationsdatei liess sich nicht \xF6ffnen. Pr\xFCfe, ob sie vorhanden ist, und \xF6ffne sie dann von Hand.",
  "general.nav": "Allgemein",
  "general.currentVersion": "Fassung: {version}",
  "developerTools.title": "Code-Ansicht zeigen",
  "developerTools.error": "Das Speichern ist gescheitert. Versuche es noch einmal.",
  "developerTools.description": "Zeigt den Verlauf, die Code-\xC4nderungen dieser Runde und alle Agenten-Voreinstellungen.",
  "connection.error": "Die Verbindung ist gest\xF6rt. Lade die Seite neu.",
  "connection.connecting": "Verbindung wird wiederhergestellt",
  "connection.connected": "Verbunden",
  "connection.reconnect": "Die Verbindung ist gest\xF6rt. Klicke, um sie sofort wiederherzustellen.",
  "connection.restart": "Die Verbindung ist abgerissen. Ein Versuch l\xE4uft. Klicke, um ihn sofort zu starten.",
  "desktop.update.available": "Neue Fassung",
  "desktop.update.checking": "Es wird nach einer neuen Fassung gesucht\u2026",
  "desktop.update.progress": "{percent} %",
  "desktop.update.verifying": "Die Aktualisierungsdateien werden gepr\xFCft\u2026",
  "desktop.update.installing": "Der Neustart wird vorbereitet\u2026",
  "desktop.update.ready": "Einspielen und neu starten",
  "desktop.update.retry": "Aktualisierung erneut versuchen",
  "desktop.update.versionDetail": "{label}: {version}",
  "desktop.update.downloadDetail": "Aktualisierung wird geladen: {percent} %\nZielfassung: {version}",
  "desktop.update.checkFailed": "Die Suche nach einer neuen Fassung ist gescheitert. Versuche es sp\xE4ter noch einmal.",
  "desktop.update.downloadFailed": "Die Aktualisierung liess sich nicht laden. Versuche es noch einmal.",
  "desktop.update.installFailed": "Die Aktualisierung liess sich nicht einspielen. Versuche es sp\xE4ter noch einmal.",
  "desktop.update.checkNetworkFailed": "Die Suche ist gescheitert. Pr\xFCfe die Netzverbindung und versuche es noch einmal.",
  "desktop.update.downloadNetworkFailed": "Das Laden ist gescheitert. Pr\xFCfe die Netzverbindung und versuche es noch einmal.",
  "desktop.update.installNetworkFailed": "Das Einspielen ist gescheitert. Pr\xFCfe die Netzverbindung und versuche es noch einmal.",
  "desktop.update.stopFailed": "Die laufenden Aufgaben liessen sich nicht sicher anhalten. Die Aktualisierung wurde deshalb nicht eingespielt. Versuche es sp\xE4ter noch einmal.",
  "desktop.update.tasksChanged": "Es sind neue Aufgaben angelaufen. Best\xE4tige noch einmal, dass sie angehalten und die Aktualisierung eingespielt werden soll.",
  "desktop.update.tasksUnavailable": "Der Zustand der Aufgaben liess sich nicht feststellen. Versuche die Aktualisierung noch einmal, wenn der Arbeitsbereich bereit ist."
};
var trajectory = {
  "view.trajectory": "Verlauf",
  "toolbar.aria": "Werkzeugleiste des Verlaufs",
  "toolbar.duration": "Dauer",
  "toolbar.useActualDuration": "Wirkliche Dauer verwenden",
  "toolbar.useEqualWidth": "Alle Schritte gleich breit",
  "toolbar.actualTime": "Wirkliche Zeit",
  "toolbar.turns": "Runden",
  "toolbar.expandTurns": "Alle Runden ausklappen",
  "toolbar.collapseTurns": "Alle Runden einklappen",
  "toolbar.calls": "Aufrufe",
  "toolbar.expandCalls": "Alle Aufrufe ausklappen",
  "toolbar.collapseCalls": "Alle Aufrufe einklappen",
  "toolbar.search": "Im Verlauf suchen",
  "toolbar.searchPlaceholder": "Suchen",
  "kind.system": "SYSTEM",
  "kind.user": "NUTZER",
  "kind.context": "KONTEXT",
  "kind.compacted": "VERDICHTET",
  "kind.message": "Nachricht",
  "kind.assistant": "AGENT",
  "kind.tool": "WERKZEUG",
  "kind.subtool": "UNTERWERKZEUG",
  "kind.sub": "Unter",
  "column.input": "Eingabe",
  "column.output": "Ausgabe",
  "column.think": "Denken",
  "column.time": "Zeit",
  "column.model": "Modell",
  "column.tools": "Werkzeuge",
  "turn.label": "Runde {turn}",
  "section.betweenTurns": "Zwischen den Runden",
  "group.message": "Nachricht",
  "group.step": "Schritt {step}",
  "group.compaction": "Verdichtung {seq}",
  "status.failed": "Gescheitert",
  "status.pending": "Wartet",
  "status.completed": "Fertig",
  "timing.notAvailable": "Nicht verf\xFCgbar",
  "timing.notRecorded": "Nicht aufgezeichnet",
  "timing.stepStartUnavailable": "Der Schrittbeginn ist nicht verf\xFCgbar",
  "timing.firstTokenUnavailable": "Die Zeit bis zum ersten Token ist nicht verf\xFCgbar",
  "timing.usageUnavailable": "Der Verbrauch ist nicht verf\xFCgbar",
  "timing.outputTokensUnavailable": "Die Zahl der Ausgabe-Token ist nicht verf\xFCgbar",
  "timing.durationTooShort": "Die Dauer ist zu kurz",
  "timing.showLocalTime": "Ortszeit zeigen",
  "timing.showUnixTimestamp": "Unix-Zeitstempel zeigen",
  "timing.started": "Beginn",
  "timing.totalDuration": "Gesamtdauer",
  "timing.ttft": "Zeit bis zum ersten Token",
  "timing.generation": "Erzeugung",
  "timing.throughput": "Durchsatz",
  "timing.duration": "Dauer",
  "timing.source": "Quelle der Zeitmessung",
  "timing.sessionTimestamps": "Zeitstempel der Sitzung",
  "timing.sessionTimestampsRunning": "Zeitstempel der Sitzung (l\xE4uft)",
  "timing.request": "Zeitmessung der Anfrage",
  "unit.milliseconds": "{value} ms",
  "unit.seconds": "{value} s",
  "unit.tokens": "{value} Tok",
  "unit.tokensPerSecond": "{value} Tok/s",
  "usage.tokens": "Token",
  "usage.reasoning": "Denken",
  "usage.content": "Inhalt",
  "usage.notReported": "Kein Verbrauch gemeldet",
  "usage.input": "Eingabe",
  "usage.cached": "Aus dem Zwischenspeicher",
  "usage.cacheCreated": "In den Zwischenspeicher geschrieben",
  "usage.other": "Sonstiges",
  "usage.output": "Ausgabe",
  "usage.thisRequest": "Diese Anfrage",
  "usage.sessionCumulative": "Zusammengerechnet in dieser Sitzung",
  "options.notRecorded": "Keine Optionen aufgezeichnet",
  "options.json": "Optionen der Anfrage als JSON",
  "source.unknown": "Unbekannt",
  "source.user": "Nutzereingabe",
  "source.plugin": "Erweiterung",
  "source.pluginNamed": "Erweiterung \xB7 {plugin}",
  "source.goal": "Ziel",
  "source.goalRound": "Ziel \xB7 Runde {round}",
  "source.notRecorded": "Keine Quelle aufgezeichnet",
  "source.messageJson": "Quelle der Nachricht als JSON",
  "tab.summary": "\xDCbersicht",
  "tab.rawOutput": "Rohe Ausgabe",
  "tab.preview": "Vorschau",
  "tab.raw": "Rohinhalt",
  "tab.source": "Quelle",
  "tab.payload": "Parameter",
  "tab.result": "Ergebnis",
  "tab.schema": "Schema",
  "tab.timing": "Zeitmessung",
  "tab.diff": "Unterschiede",
  "tab.systemPrompt": "Systemanweisung",
  "tab.tools": "Werkzeuge",
  "tab.options": "Optionen",
  "tab.usage": "Verbrauch",
  "record.toolCallOnly": "(nur Werkzeugaufruf)",
  "record.noContent": "Kein Inhalt",
  "record.noPayload": "Keine Parameter aufgezeichnet",
  "record.noResult": "Kein Ergebnis aufgezeichnet",
  "record.noOutput": "Keine Ausgabe",
  "record.schemaUnavailable": "Das Schema ist nicht verf\xFCgbar",
  "record.parameters": "Parameter",
  "record.resultJson": "Ergebnis als JSON",
  "record.json": "JSON",
  "record.parametersJson": "Parameter als JSON",
  "record.namedParametersJson": "{name}: Parameter als JSON",
  "record.payloadJson": "Parameter als JSON",
  "record.outputJson": "Ergebnis als JSON",
  "record.thinking": "Denken",
  "record.wrapLines": "Zeilen umbrechen",
  "code.source": "Quelltext",
  "code.output": "Ausgabe",
  "code.copySource": "Quelltext kopieren",
  "code.copyOutput": "Ausgabe kopieren",
  "code.originalJson": "Urspr\xFCngliches JSON",
  "code.running": "L\xE4uft\u2026",
  "record.systemPromptMissing": "Diese Anfrage trug keine Systemanweisung",
  "record.toolsMissing": "Diese Anfrage trug keine Werkzeuge",
  "record.systemPrompt": "Systemanweisung",
  "record.tools": "Werkzeuge",
  "block.openSummary": "\xDCbersicht der Werkzeugaufrufe von Block {index} \xF6ffnen",
  "block.openSummaryTitle": "\xDCbersicht der Werkzeugaufrufe \xF6ffnen",
  "block.label": "Block {index} {type}",
  "history.loadingTrajectory": "Der Verlauf wird geladen\u2026",
  "history.loadingEarlier": "Der fr\xFChere Verlauf wird geladen\u2026",
  "history.loadingEarlierAria": "Der fr\xFChere Verlauf wird geladen\u2026",
  "history.loadEarlier": "Fr\xFCheren Verlauf laden",
  "history.clickToLoadEarlier": "Klicke, um den fr\xFCheren Verlauf zu laden",
  "request.label": "Anfrage {request}",
  "request.labelCompaction": "Anfrage {request} \xB7 Verdichtung",
  "request.compaction": "Verdichtung \xB7 {section}",
  "request.compactionPurpose": "Verdichtung",
  "request.retryProgress": "{retry} von {maximum}",
  "request.collapsedSummary": "Eingeklappte \xDCbersicht: {kind}, {summary}",
  "request.collapsedTurn": "Runde",
  "request.collapsedAssistant": "Agent",
  "request.rowAria": "{request}{kind}, {content}",
  "request.rowPrefix": "Anfrage {request}, ",
  "request.rowAriaCompaction": "Anfrage {request}, Verdichtung",
  "request.noContent": "kein Inhalt",
  "summary.toolCalls.one": "{count} Werkzeugaufruf",
  "summary.toolCalls.other": "{count} Werkzeugaufrufe",
  "summary.steps.one": "{count} Schritt",
  "summary.steps.other": "{count} Schritte",
  "details.event": "Einzelheiten des Ereignisses",
  "details.resize": "Breite der Einzelheiten \xE4ndern",
  "details.resizeTitle": "Ziehen \xE4ndert die Breite. Ein Doppelklick stellt den Ausgangswert her.",
  "details.close": "Einzelheiten schliessen",
  "details.status": "Zustand",
  "details.purpose": "Zweck",
  "details.provider": "Anbieter",
  "details.model": "Modell",
  "details.toolCalls": "Werkzeugaufrufe",
  "details.subtoolCalls": "Unterwerkzeug-Aufrufe",
  "details.error": "Fehler",
  "details.failure.auth": "Der Zugangsschl\xFCssel ist ung\xFCltig. Trage in den Einstellungen unter Modelle einen g\xFCltigen ein.",
  "details.retry": "Erneut versuchen",
  "details.scheduled": "Eingeplant",
  "details.retryDelay": "Wartezeit bis zum neuen Versuch",
  "details.result": "Ergebnis",
  "details.compacted": "Verdichtet",
  "details.assistantMessage": "Nachricht des Agenten",
  "details.source": "Quelle",
  "details.hierarchy": "Rangfolge",
  "details.toolCall": "Werkzeugaufruf",
  "timeline.aria": "Zeitleiste des Verlaufs",
  "timeline.overviewAria": "\xDCbersicht der Zeitleiste. Waagerecht ziehen, um Ereignisse zu fokussieren.",
  "timeline.noTimingData": "Keine Zeitdaten",
  "timeline.total": "Zusammen {duration}",
  "timeline.started": "Begonnen {time}",
  "timeline.ttftDecoding": "Erstes Token {ttft} \xB7 Entschl\xFCsselung {decoding}",
  "layout.compacting": "Der Kontext wird verdichtet\u2026",
  "layout.compactionFailed": "Die Verdichtung des Kontexts ist gescheitert",
  "layout.compacted": "Der Kontext ist verdichtet",
  "layout.toolCallOnly": "Nur Werkzeugaufruf",
  "attachment.list": "Anlagen",
  "attachment.imageName": "Bild {index}",
  "layout.imageCount": "Bilder \xD7{count}",
  "layout.fileAttachments": "Dateien \xD7{count}",
  "layout.initialSystemPrompt": "Erste Systemanweisung",
  "layout.systemPromptUpdated": "Die Systemanweisung wurde ge\xE4ndert",
  "layout.toolsUpdated": "Die Werkzeuge wurden ge\xE4ndert",
  "layout.toolAdded": "Werkzeug hinzugef\xFCgt: {name}",
  "layout.toolRemoved": "Werkzeug entfernt: {name}",
  "layout.toolUpdateNotice": "Die Werkzeuge wurden ge\xE4ndert",
  "layout.toolsAdded": "Hinzugef\xFCgt: {names}",
  "layout.toolsAddedCount": "{count} hinzugef\xFCgt",
  "layout.toolsChanged": "{added} hinzugef\xFCgt, {removed} entfernt",
  "layout.toolsRemoved": "Entfernt: {names}",
  "layout.toolsRemovedCount": "{count} entfernt",
  "layout.systemPromptAndToolsUpdated": "Systemanweisung und Werkzeuge wurden ge\xE4ndert",
  "layout.compactionInterrupted": "Die Verdichtung des Kontexts wurde vor dem Ende abgebrochen."
};
var model = {
  "provider.account": "DeepSeek-Konto",
  "command.label": "Modell",
  "command.description": "Das Modell f\xFCr diesen Chat w\xE4hlen",
  "option.loadError": "Die Modellliste liess sich nicht laden: {message}",
  "trigger.fallback": "Modell w\xE4hlen",
  "trigger.loading": "Die Modelle werden geladen\u2026",
  "trigger.selectAria": "Modell w\xE4hlen",
  "trigger.aria": "Modell w\xE4hlen, zur Zeit {model}",
  "trigger.ariaEffort": "Modell w\xE4hlen, zur Zeit {model}, Denkaufwand {effort}",
  "menu.aria": "Modell und Denkaufwand",
  "menu.model": "Modell",
  "menu.effort": "Denkaufwand",
  "effort.providerDefault": "Vorgabe des Anbieters",
  "status.loading": "Die Modellliste wird erneuert\u2026",
  "error.action": "Die Modellaktion ist gescheitert: {message}",
  "error.sessionInUse": "Dieser Chat wird bereits benutzt, vermutlich von einer anderen laufenden DSH-Fassung (etwa einem weiteren dsh web oder der Desktop-Fassung). Beende die anderen und versuche es noch einmal.",
  "action.reload": "Neu laden",
  "warning.groupLoad": "{name} liess sich nicht laden: {message}",
  "search.placeholder": "Modelle durchsuchen\u2026",
  "search.clear": "Suche leeren",
  "search.empty": "Kein Modell passt zur Suche.",
  "empty.models": "Es ist kein Modell verf\xFCgbar. Pr\xFCfe in den Einstellungen unter Modelle, ob ein Anbieter mit Schl\xFCssel eingetragen ist.",
  "empty.efforts": "Dieses Modell bietet keinen Denkaufwand an."
};
var settingsPermission = {
  "title": "Zugriffsstufe",
  "description": "Die Vorgabe-Zugriffsstufe f\xFCr neue Chats",
  "loading": "Wird geladen",
  "unavailable": "Nicht verf\xFCgbar",
  "preset.readOnly": "Nur lesen",
  "preset.workspaceWrite": "Workspace schreiben",
  "preset.fullAccess": "Vollzugriff",
  "confirm.title": "Vollzugriff einschalten?",
  "confirm.description": "Vollzugriff l\xE4sst neue Chats weniger Best\xE4tigungen verlangen und mehr unmittelbar ausf\xFChren \u2014 auch heikle Vorg\xE4nge, Datei\xE4nderungen und Befehle nach draussen. Nutze ihn nur, wenn du den folgenden Aufgaben vertraust.",
  "confirm.acknowledge": "Ich kenne die Risiken und m\xF6chte fortfahren",
  "confirm.cancel": "Abbrechen",
  "confirm.enable": "Vollzugriff einschalten"
};
var settingsPermissionAccess = {
  "mode": "Zugriffsstufe, zur Zeit: {name}",
  "close": "Schliessen",
  "preset.readOnly": "Nur lesen",
  "preset.workspaceWrite": "Workspace schreiben",
  "preset.fullAccess": "Vollzugriff",
  "confirm.title": "Vollzugriff einschalten?",
  "confirm.description": "Vollzugriff verringert die Best\xE4tigungen und l\xE4sst den Agenten mehr unmittelbar ausf\xFChren \u2014 auch heikle Vorg\xE4nge, Datei\xE4nderungen und Befehle nach draussen. Nutze ihn nur, wenn du der laufenden Aufgabe vertraust.",
  "confirm.acknowledge": "Ich kenne die Risiken und m\xF6chte fortfahren",
  "confirm.cancel": "Abbrechen",
  "confirm.enable": "Vollzugriff einschalten",
  "auto.label": "Auto-Pr\xFCfung",
  "auto.badge": "VERSUCH",
  "auto.description": "L\xE4uft ohne Sandkasten. Vor jedem nativen Werkzeugaufruf und jedem inneren PTC-Aufruf pr\xFCft dasselbe Modell den Vorgang.",
  "auto.confirm.title": "Auto-Pr\xFCfung einschalten (versuchsweise)?",
  "auto.confirm.description": "Die Auto-Pr\xFCfung l\xE4uft ohne Sandkasten. Vor jedem nativen Werkzeugaufruf und jedem inneren PTC-Aufruf entscheidet dasselbe Modell wie der laufende Agent, ob der Vorgang erlaubt ist; was es ablehnt, entscheidest du. Dieses Verfahren ist versuchsweise, kann Vorg\xE4nge f\xE4lschlich erlauben oder ablehnen und verbraucht zus\xE4tzliche Token.",
  "auto.confirm.acknowledge": "Ich kenne diese Risiken und m\xF6chte fortfahren",
  "auto.confirm.enable": "Auto-Pr\xFCfung einschalten"
};
var workspace = {
  "defaultWorkspace.failed": 'Der vorgegebene Arbeitsbereich liess sich nicht anlegen. W\xE4hle \xFCber \u201EWorkspace w\xE4hlen" einen Ordner.',
  "group.ungrouped": "Ohne Zuordnung",
  "session.new": "Neuer Chat",
  "session.untitled": "Ohne Namen",
  "shortcut.noSession": "W\xE4hle zuerst einen Chat",
  "shortcut.noPicker": "Die Ordnerauswahl ist nicht verf\xFCgbar",
  "shortcut.directoryBusy": "Es wird gerade ein Arbeitsbereich gew\xE4hlt oder hinzugef\xFCgt",
  "shortcut.noCompletedTurn": "Dieser Chat hat noch keine abgeschlossene Runde",
  "shortcut.forkFailed": "Der Chat liess sich nicht verzweigen. Versuche es noch einmal.",
  "section.workspaces": "Arbeitsbereiche",
  "section.sessions": "Chats",
  "viewOptions.label": "Ansicht",
  "groupBy.label": "Gruppieren nach",
  "groupBy.workspace": "Arbeitsbereich",
  "groupBy.workspaceTree": "Arbeitsbereich als Baum",
  "groupBy.flat": "Eine Liste",
  "orderBy.label": "Sortieren nach",
  "orderBy.manual": "Eigene Reihenfolge",
  "orderBy.updated": "Zuletzt ge\xE4ndert",
  "filterBy.label": "Chats filtern",
  "viewOptions.hideArchived": "Archivierte ausblenden",
  "viewOptions.showArchived": "Alle Chats (archivierte zeigen)",
  "viewOptions.onlyArchived": "Nur archivierte",
  "sessions.expand": "Die \xFCbrigen {n} Chats ausklappen",
  "sessions.collapse": "Weniger zeigen",
  "empty.none": "Noch kein Chat",
  "empty.noneArchived": "Noch kein archivierter Chat",
  "empty.viewOthers": "Andere Chats ansehen",
  "empty.noMatches": "Nichts gefunden",
  "workspace.add": "Workspace hinzuf\xFCgen",
  "search.sessions.aria": "Chats durchsuchen",
  "search.placeholder": "Chatnamen durchsuchen",
  "search.clear": "Suche leeren",
  "search.results.aria": "Suchergebnisse",
  "search.pending": "Der Chatverlauf wird durchsucht\u2026",
  "search.noMatches": "Kein Chat gefunden",
  "search.hasMore": "Es werden nur die ersten {n} Treffer gezeigt. Grenze die Suche weiter ein.",
  "menu.addWorkspace": "Workspace hinzuf\xFCgen\u2026",
  "picker.loading": "Arbeitsbereiche werden geladen\u2026",
  "conflict.named": 'Ein Arbeitsbereich mit dem Namen \u201E{name}" gibt es schon.',
  "folderError.title": "Der Ordner liess sich nicht \xF6ffnen",
  "folderError.retry": "Anderen Ordner w\xE4hlen",
  "rename": "Umbenennen",
  "rename.workspace.title": "Arbeitsbereich umbenennen",
  "rename.session.title": "Chat umbenennen",
  "field.workspaceName": "Name des Arbeitsbereichs",
  "field.sessionName": "Name des Chats",
  "delete.workspace": "Arbeitsbereich entfernen",
  "delete.desc": '\u201E{name}" wird aus der Liste entfernt. Der Ordner und die Chatverl\xE4ufe bleiben erhalten; die Chats erscheinen danach unter \u201EOhne Zuordnung".',
  "delete.pending": "Der Arbeitsbereich wird entfernt\u2026",
  "menu.fork": "Chat verzweigen",
  "menu.archiveSession": "Chat archivieren",
  "menu.unarchiveSession": "Archivierung aufheben",
  "menu.pinSession": "Chat anheften",
  "menu.unpinSession": "Anheftung l\xF6sen",
  "row.archived": "Archiviert",
  "row.pinned": "Angeheftet",
  "toast.archivedNotOpenable": "Archivierte Chats lassen sich nicht \xF6ffnen. Hebe die Archivierung auf, um ihn zu sehen.",
  "toast.archived": "Der Chat ist archiviert. Du kannst ",
  "toast.stoppedAndArchived": "Der Chat wurde angehalten und archiviert. Du kannst ",
  "archive.confirm.title": "Diesen Chat anhalten und archivieren?",
  "archive.confirm.desc": 'In \u201E{title}" l\xE4uft noch Arbeit. Das Archivieren h\xE4lt sie zuerst an; du kannst den Chat sp\xE4ter \xFCber den Filter \u201EAlle Chats (archivierte zeigen)" in der Seitenleiste zur\xFCckholen. Die angehaltene Arbeit l\xE4uft nicht von selbst weiter.',
  "archive.confirm.activity": "Arbeit, die angehalten wird",
  "archive.confirm.turn": "Die laufende Runde",
  "archive.confirm.subagents.one": "{n} laufender Unteragent: {names}",
  "archive.confirm.subagents.other": "{n} laufende Unteragenten: {names}",
  "archive.confirm.jobs.one": "{n} Hintergrundauftrag: {names}",
  "archive.confirm.jobs.other": "{n} Hintergrundauftr\xE4ge: {names}",
  "archive.confirm.schedules.one": "{n} eingeplante Erinnerung: {names}",
  "archive.confirm.schedules.other": "{n} eingeplante Erinnerungen: {names}",
  "archive.confirm.other.one": "{n} weitere Arbeit ({kind})",
  "archive.confirm.other.other": "{n} weitere Arbeiten ({kind})",
  "archive.confirm.listSeparator": ", ",
  "archive.confirm.action": "Anhalten und archivieren",
  "archive.confirm.pending": "Wird angehalten und archiviert\u2026",
  "toast.archivedUndo": "r\xFCckg\xE4ngig machen",
  "toast.archivedOr": " oder ",
  "toast.archivedFilter": "archivierte Chats filtern",
  "toast.pinFailed": "Das Anheften ist gescheitert. Versuche es sp\xE4ter noch einmal.",
  "toast.unpinFailed": "Das L\xF6sen der Anheftung ist gescheitert. Versuche es sp\xE4ter noch einmal.",
  "toast.createFailed": "Der neue Chat liess sich nicht anlegen: {message}",
  "sessions.count.one": "{n} Chat",
  "sessions.count.other": "{n} Chats",
  "actions.workspace.aria": 'Aktionen f\xFCr den Arbeitsbereich \u201E{name}"',
  "actions.session.aria": 'Aktionen f\xFCr den Chat \u201E{name}"',
  "actions.archive": "Archivieren",
  "actions.unarchive": "Archivierung aufheben",
  "actions.pin": "Anheften",
  "actions.unpin": "Anheftung l\xF6sen",
  "actions.newSession": "Neuer Chat",
  "actions.newSession.aria": 'Neuen Chat in \u201E{name}" beginnen',
  "status.running": "L\xE4uft",
  "status.subagentsRunning.one": "{n} Unteragent l\xE4uft",
  "status.subagentsRunning.other": "{n} Unteragenten laufen",
  "status.idle": "Ruht",
  "status.waitingApproval": "Wartet auf Freigabe",
  "status.planReview": "Plan zur Pr\xFCfung",
  "status.waitingAnswer": "Wartet auf Antwort",
  "status.compact.approval": "Freigabe",
  "status.compact.planReview": "Planpr\xFCfung",
  "status.compact.answer": "Antwort",
  "status.completed": "Fertig",
  "hover.created": "Angelegt {time}",
  "hover.copied": "Kopiert",
  "date.ymd": "{d}.{m}.{y}",
  "time.now": "gerade eben",
  "time.minutes": "{n} Min.",
  "time.hours": "{n} Std.",
  "time.days": "{n} T.",
  "time.months": "{n} Mon.",
  "time.years": "{n} J.",
  "time.ago": "vor {t}"
};

// pakete/dsh-client-ui-promptheus/src/client/index.ts
var FASSUNG = "0.1.0";
var GEMEINDE_URL = "/promptheus-community";
var farbkastenWaehler = null;
function gemeindeAdresse() {
  const v = farbkastenWaehler?.getSnapshot() ?? "";
  return v === "" ? GEMEINDE_URL : `${GEMEINDE_URL}?v=${encodeURIComponent(v)}`;
}
function gemeindeKlick(ereignis) {
  ereignis.currentTarget.href = gemeindeAdresse();
}
var inject = ["slots"];
var GLUT = "#ff7a1c";
var GLUT_HELL = "#ffa347";
var GOLD = "#ffc94d";
var SERIFE2 = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
var SANS2 = '"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif';
var MAEANDER_MASKE = `url("data:image/svg+xml;utf8,${encodeURIComponent(MAEANDER)}")`;
var ZEILENHOEHE = 13.1 + 8 + 2;
function Marke(eigenschaften) {
  const React = require("react");
  const angeboten = typeof eigenschaften?.size === "number" ? eigenschaften.size : 24;
  const groesse = Math.min(angeboten, ZEILENHOEHE);
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${groesse}px`,
      height: `${groesse}px`,
      flex: "none"
    },
    // Wörtlich aus Brand/mark.svg. Kein CDN, keine Schriftanfrage (BRAND.md §9).
    dangerouslySetInnerHTML: { __html: BILDMARKE }
  });
}
function Wortmarke() {
  const React = require("react");
  return React.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", justifyContent: "center", minWidth: 0 } },
    React.createElement(
      "span",
      { style: { display: "inline-flex", flexDirection: "column", lineHeight: 1, whiteSpace: "nowrap" } },
      React.createElement("span", {
        style: {
          fontFamily: SERIFE2,
          fontSize: "0.82rem",
          fontWeight: 600,
          letterSpacing: ".05em",
          color: "inherit"
        }
      }, "PROMPTHEUS"),
      React.createElement("span", {
        style: {
          fontFamily: SANS2,
          fontSize: ".50rem",
          fontWeight: 500,
          // Der gewünschte Zeichenabstand: „- W E R K S T A T T -".
          // .34em bei .50rem ≈ 2,7 px zwischen den Zeichen — sichtbar gesperrt,
          // aber noch lesbar als Wort. (.22em waren zu eng dafür.)
          letterSpacing: ".34em",
          textTransform: "uppercase",
          // Hinweiston, nicht Haupttext — BRAND.md §3.
          opacity: ".6"
        }
      }, "- Werkstatt -")
    ),
    React.createElement("span", {
      "aria-hidden": "true",
      style: {
        display: "block",
        height: "2px",
        marginTop: "0",
        background: GOLD,
        opacity: ".5",
        WebkitMask: `${MAEANDER_MASKE} repeat-x left center / 32px 32px`,
        mask: `${MAEANDER_MASKE} repeat-x left center / 32px 32px`
      }
    })
  );
}
function Gemeindeknopf(eigenschaften) {
  const React = require("react");
  const breit = eigenschaften?.wide !== false;
  return React.createElement(
    "a",
    {
      href: GEMEINDE_URL,
      onClick: gemeindeKlick,
      target: "_blank",
      rel: "noreferrer",
      title: "Zur Gemeinde der PROMPTHEUS Academy",
      style: {
        display: "inline-flex",
        alignItems: "center",
        // **Linksbündig, nicht mittig.** Der Knopf steht in einer Spalte mit
        // lauter linksbündigen Zeilen (Arbeitsbereiche, Erweiterungen,
        // Einstellungen). Mittiger Text darin liest sich wie ein Fremdkörper.
        justifyContent: "flex-start",
        gap: ".45rem",
        height: "34px",
        padding: breit ? "0 .7rem" : "0",
        margin: "0 2px 6px",
        boxSizing: "border-box",
        border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.14))",
        borderRadius: "10px",
        background: "transparent",
        color: "var(--dsw-alias-label-primary, #ede5db)",
        fontFamily: SANS2,
        fontSize: ".8rem",
        fontWeight: 500,
        lineHeight: 1,
        textAlign: "left",
        textDecoration: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        flex: "1",
        minWidth: 0,
        overflow: "hidden"
      }
    },
    React.createElement("span", {
      "aria-hidden": "true",
      style: {
        flex: "none",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: `linear-gradient(180deg, ${GLUT_HELL}, ${GLUT})`
      }
    }),
    breit ? React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, "Community") : null
  );
}
function GemeindeImKopf() {
  const React = require("react");
  return React.createElement(
    "a",
    {
      href: GEMEINDE_URL,
      onClick: gemeindeKlick,
      target: "_blank",
      rel: "noreferrer",
      title: "Zur Gemeinde der PROMPTHEUS Academy",
      "aria-label": "Zur Gemeinde",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: ".35rem",
        height: "28px",
        padding: "0 .55rem",
        borderRadius: "8px",
        color: "var(--dsw-alias-label-secondary, #b3a596)",
        fontFamily: SANS2,
        fontSize: ".76rem",
        lineHeight: 1,
        textDecoration: "none",
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    },
    React.createElement("span", {
      "aria-hidden": "true",
      style: {
        flex: "none",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: `linear-gradient(180deg, ${GLUT_HELL}, ${GLUT})`
      }
    }),
    "Community"
  );
}
function farbkastenAufbauen(theme) {
  let abraeumer;
  const eintragen = (kennung) => {
    abraeumer?.();
    abraeumer = theme.overrideTokens(SCHICHT, layerAus(kennung));
  };
  const waehler = new Palettenwaehler(eintragen, theme.getTheme().active.colorScheme);
  return { waehler, abraeumer: () => abraeumer?.() };
}
var WOERTERBUECHER = [
  ["sidebar", sidebar],
  ["settings", settingsGeneral],
  ["trajectory", trajectory],
  ["model", model],
  // Der größte Namensraum des Harness: 369 Texte. Das Wörterbuch liegt in einer
  // eigenen Datei (`woerter/gespraech.ts`), damit die Übersicht erhalten bleibt.
  ["conversation", gespraech],
  // Erweiterungsverwaltung: 189 Texte.
  ["pluginManager", erweiterungen],
  // Erzeugte Dateien und Änderungen einer Runde: 60 Texte.
  ["deliverables", ergebnisse],
  // Runde 3: fünf Namensräume mit zusammen 187 Texten.
  ["settings.pluginInventory", erweiterungsliste],
  ["job", auftraege],
  ["subagent", unteragenten],
  ["settings.subagent", unteragentenEinstellungen],
  ["sidebarRight", rechteSpalte],
  // Runde 4: fünf Namensräume mit zusammen 146 Texten.
  ["shortcuts", tastenkuerzel],
  ["question", rueckfragen],
  ["settings.account", konto],
  ["command", befehle],
  ["sidebarBrowser", dateibrowser],
  // Runden 5 bis 9: die kleinen Namensräume, zusammen 228 Texte.
  //
  // **`sidebarDocumentPreview` steht NICHT hier.** Er steht weiter unten bei den
  // acht Namensräumen der Dokumentvorschau. Er stand eine Zeitlang an beiden
  // Stellen — und das war ein Fehler mit Folgen: der zweite `register` wirft
  // (`already has locale "de"`), der ganze Effekt stirbt, und ALLE danach
  // folgenden Namensräume werden nie angemeldet. Am Bildschirm blieb die
  // Oberfläche halb englisch, und nichts meldete einen Fehler.
  //
  // **Eine Anmeldung ist EINMALIG.** Wer hier einen Namensraum hinzufügt, prüft
  // zuerst, ob er nicht schon weiter oben oder unten steht.
  ["feedback", rueckmeldung],
  ["settings.webSearch", netzsuche],
  ["workflowRun", arbeitsablauf],
  ["plan", plan],
  ["sidebarFiles", arbeitsbereichsdateien],
  ["open-in-app", oertlichOeffnen],
  ["settings.shell", terminalEinstellungen],
  ["sidebarTerminal", seitenleistenTerminal],
  ["goal", ziele],
  ["settings.agentLoop", agentenschleife],
  ["reference", verweise],
  ["slash.menu", ausloeser],
  ["settings.theme", erscheinungsbild],
  ["skill", fertigkeiten],
  ["approval", freigabe],
  ["settings.plugins", eingebauteErweiterungen],
  ["settings.sessionLog", sitzungsprotokoll],
  // Die beiden letzten: die Voreinstellungen des Agenten (60 Texte) und die
  // automatischen Aufträge (311 Texte in zwei Namensräumen).
  ["settings.agentPreset", voreinstellungen],
  ["schedule.catalog", zeitregeln],
  ["schedule.manager", zeitplanverwaltung],
  ["settings.permission", settingsPermission],
  // Der Namensraum des Zugriffsfensters heisst `permission.access`, NICHT
  // `settings.permission.access`. Die beiden Fenster (Einstellungszeile und
  // laufende Sitzung) führen ihre Texte bewusst getrennt, damit sie sich
  // unabhängig laden lassen (`ACCESS_NS` in ui-permission-presets).
  ["permission.access", settingsPermissionAccess],
  ["workspace", workspace],
  // ── Die Dokumentvorschau: acht Namensräume ────────────────────────────────
  //
  // **Diese acht fehlten.** Die Vorschau meldet ihre Texte über eigene Dateien
  // an, nicht über eine gemeinsame (`ui-sidebar-documentpreview/src/client/
  // {code,excel,html,image,markdown,office,pdf}/locales.ts`), und die Tabelle in
  // `woerter_pruefen.mjs` führte sie nicht. Das Werkzeug meldete deshalb „1.937
  // von 1.937" und war zufrieden, während 54 Texte unübersetzt blieben.
  // Gefunden hat das `uebersetzung_umfang.mjs`, nachdem es den Namensraum nicht
  // mehr aus dem Paketnamen riet.
  //
  // Der Zoom gehört zu mehreren: der Harness spreizt `zoomEn` in die
  // Wörterbücher von Tabelle, Bild und PDF (`...zoomEn`). Deshalb steht er in
  // jedem dieser drei – hier ist er in den Wörterbüchern selbst enthalten.
  ["sidebarDocumentPreview", dokumentrahmen],
  ["sidebarCodePreview", codevorschau],
  ["sidebarExcel", tabellenvorschau],
  ["documentHtml", htmlvorschau],
  ["sidebarImage", bildvorschau],
  ["documentMarkdown", markdownvorschau],
  ["sidebarOffice", officevorschau],
  ["sidebarPdf", pdfvorschau],
  // ── Die Grundsprache und die vier, die fehlten ────────────────────────────
  //
  // **`common` ist der wichtigste davon.** Es ist die gemeinsame Sprache des
  // Harness — „OK", „Abbrechen", „Speichern", „Suchen" — und steht an Dutzenden
  // Stellen. Fehlte sie, blieben gerade die alltäglichsten Knöpfe englisch.
  //
  // Die anderen drei sind einzelne Fenster: die Zeile „Sprache", die
  // Beschriftung des Spaltenbefehls, und das ganze Fenster „Modelle".
  //
  // Auch diese vier waren unsichtbar, solange die Namensraum-Tabelle von Hand
  // geführt wurde: sie standen nicht darin, also prüfte sie niemand.
  ["common", gemeinsameSprache],
  ["settings.locale", sprachzeile],
  ["shortcuts.layout", layoutbefehle],
  ["settings.models", modelleinstellungen],
  // **`chat` ist NICHT `conversation`.** Das ist der teuerste Irrtum dieses
  // Pakets gewesen: `conversation` (369 Texte) ist der Gesprächsverlauf des
  // Hauptfensters, `chat` (186 Texte) sind die Zustandstexte daneben — „Liest
  // Dateien", „Denkt nach", „Kontext verdichtet", die Statistiktafel. Weil die
  // Tabelle von Hand geführt wurde, stand `chat` nie darin, und die deutschen
  // Texte dafür fehlten ganz. Am Bildschirm sah man es an den Hinweisen über
  // jeder Runde, die englisch blieben.
  ["chat", gespraechstexte]
];
function apply(ctx) {
  const slots = ctx.slots;
  if (typeof document !== "undefined") {
    ctx.effect(() => {
      const marke = document.createElement("style");
      marke.dataset.plugin = "@promptheus/dsh-client-ui-promptheus";
      marke.dataset.pluginCss = "@promptheus/dsh-client-ui-promptheus/hintergrund.css";
      marke.textContent = hintergrundCss();
      document.head.appendChild(marke);
      return () => {
        marke.remove();
      };
    }, "promptheus: Hintergrundbild");
    ctx.effect(() => {
      const marke = document.createElement("style");
      marke.dataset.plugin = "@promptheus/dsh-client-ui-promptheus";
      marke.dataset.pluginCss = "@promptheus/dsh-client-ui-promptheus/anpassungen.css";
      marke.textContent = anpassungenCss();
      document.head.appendChild(marke);
      return () => {
        marke.remove();
      };
    }, "promptheus: Feinanpassungen");
  }
  ctx.inject(["locale"], (lokal) => {
    lokal.effect(() => {
      const abraeumer = [];
      for (const [ns, woerter] of WOERTERBUECHER) {
        try {
          abraeumer.push(lokal.locale.register(ns, "de", woerter));
        } catch (fehler) {
          console.error(`promptheus: \u201E${ns}" liess sich nicht anmelden:`, fehler?.message);
          throw fehler;
        }
      }
      return () => {
        for (const ab of abraeumer) ab();
      };
    }, "promptheus: deutsche Texte");
    lokal.effect(
      () => lokal.locale.addLanguage({ id: "de", label: "Deutsch", fallback: "en" }),
      "promptheus: Deutsch zur Auswahl stellen"
    );
  });
  ctx.inject(["theme"], (thema) => {
    const theme = thema.theme;
    const { waehler, abraeumer } = farbkastenAufbauen(theme);
    farbkastenWaehler = waehler;
    waehler.anwenden();
    thema.effect(() => {
      const ab = thema.on("theme/change", (stand) => {
        waehler.farbschemaSetzen(stand.active.colorScheme);
      });
      return () => {
        ab();
        abraeumer();
        farbkastenWaehler = null;
      };
    }, "promptheus: Farbkasten");
    thema.slots.inject("settings.general.item", () => thema.slots.register({
      name: "settings.general.item",
      id: "promptheus-farbkasten",
      order: 12,
      inject: () => ({
        hooks: { palette: waehler },
        aufWahl: (kennung) => {
          const schema = waehler.waehlen(kennung);
          try {
            theme.setTheme(schema);
          } catch (fehler) {
            console.warn(`promptheus: Farbschema \u201E${schema}" liess sich nicht setzen \u2014`, fehler?.message);
          }
        }
      })
    }, FarbkastenZeile));
  });
  slots.inject("sidebar.brand.mark", () => slots.register({ name: "sidebar.brand.mark" }, Marke));
  slots.inject("sidebar.brand.name", () => slots.register({ name: "sidebar.brand.name" }, Wortmarke));
  slots.inject("conversation.hero.brand.mark", () => slots.register({ name: "conversation.hero.brand.mark" }, Marke));
  slots.inject("sidebar.footer.action", () => slots.register(
    { name: "sidebar.footer.action", id: "promptheus-community", order: 10 },
    Gemeindeknopf
  ));
  slots.inject("conversation.session.header.utilities", () => slots.register(
    { name: "conversation.session.header.utilities", id: "promptheus-community-kopf", order: 10 },
    GemeindeImKopf
  ));
}
var index_default = { apply, inject };

	return module.exports; } });
