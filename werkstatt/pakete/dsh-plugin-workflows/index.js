/**
 * Host half of @promptheus/dsh-plugin-workflows.
 *
 * Registers the `team-beratung` command. The Agenten-Team window calls it
 * through `ctx.remote.commands.execute` and shows the returned text in the
 * window.
 *
 * Two parts, deliberately in this order:
 *   1. fixed rules that hold whatever the model says — they arrive instantly
 *      and never lie about the plan;
 *   2. one short assessment from the configured default model. It goes through
 *      the same route as every other call in the workshop, so the protection
 *      layer stays in the path.
 *
 * If the model route is missing or answers nothing, part 1 still stands and the
 * reason is named.
 */

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Ein Ordner ist die Werkstatt, wenn ihr Startwerkzeug darin liegt. */
function istWerkstatt(ordner) {
  return existsSync(join(ordner, 'werkzeuge', 'starten.mjs'));
}

/**
 * Der Werkstatt-Ordner, ohne festen Laufwerkspfad.
 *
 * `werkzeuge/starten.mjs` setzt `DSH_HOME` auf `<werkstatt>\.dsh`; dessen
 * Elternordner ist die Werkstatt. Fehlt die Angabe (oder zeigt sie auf das
 * globale `~\.dsh`), gilt der Ort dieses Pakets: `<werkstatt>\pakete\dsh-plugin-workflows`.
 * @param umgebung - die Prozessumgebung.
 * @param hier - der Ordner dieser Datei.
 * @returns der Werkstatt-Ordner.
 */
export function werkstattOrdner(umgebung = process.env, hier = dirname(fileURLToPath(import.meta.url))) {
  const zuhause = umgebung.DSH_HOME;
  if (typeof zuhause === 'string' && isAbsolute(zuhause)) {
    const oben = dirname(resolve(zuhause));
    if (istWerkstatt(oben)) return oben;
  }
  return resolve(hier, '..', '..');
}

/** Das Zuhause des Harness: `DSH_HOME`, sonst `<werkstatt>\.dsh` wie in `starten.mjs`. */
export function zuhauseOrdner(umgebung = process.env) {
  const zuhause = umgebung.DSH_HOME;
  if (typeof zuhause === 'string' && isAbsolute(zuhause)) return resolve(zuhause);
  return join(werkstattOrdner(umgebung), '.dsh');
}

/** Wohin neue Kategorie-Plugins geschrieben werden. */
const EIGENE_PLUGINS = join(werkstattOrdner(), 'deepseek-harness', 'plugins', 'eigene');

/**
 * Die Ablage für Mails, wenn im Fenster keine eingetragen ist. Sie liegt im
 * Zuhause der Werkstatt (`.dsh`, nicht in git), damit keine Mail versehentlich
 * in einen Commit gerät.
 */
const MAIL_ABLAGE = join(zuhauseOrdner(), 'mailposten');

/** Ein Name, der als Ordner- und Paketname taugt. */
export function kennung(name) {
  const sauber = String(name || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sauber || 'mail';
}

/** Die Auftragsdaten aus dem Fenster lesen. */
export function auftragLesen(roh) {
  const leer = { name: '', ziel: '', regel: '', quelle: '', ablage: '', an: true };
  const text = String(roh || '').trim();
  if (!text.startsWith('{')) return leer;
  try {
    const daten = JSON.parse(text);
    return {
      name: typeof daten.name === 'string' ? daten.name.trim() : '',
      ziel: typeof daten.ziel === 'string' ? daten.ziel : '',
      regel: typeof daten.regel === 'string' ? daten.regel : '',
      quelle: typeof daten.quelle === 'string' ? daten.quelle : '',
      ablage: typeof daten.ablage === 'string' ? daten.ablage : '',
      an: daten.an !== false,
    };
  } catch {
    return leer;
  }
}

/**
 * Die vier Dateien eines neuen Kategorie-Plugins: Anmeldung, Befehl, Beschreibung
 * und ein Befehl, der seine Einstellungen ausgibt. Der Abruf selbst fehlt noch —
 * dafür braucht es die Mailquelle.
 */
export function geruest(daten) {
  const kenn = kennung(daten.name);
  const paketName = '@promptheus/' + kenn + '-mail';
  const befehl = kenn + '-abruf';
  const paket = {
    name: paketName,
    version: '1.0.0',
    private: true,
    description: 'Mail-Abruf für die Kategorie «' + daten.name + '»' +
      (daten.regel ? ': ' + daten.regel : '.'),
    type: 'module',
    exports: { '.': './index.js' },
    dsh: { bundle: { patch: './cordis.patch.yml' } },
  };
  const patch = [
    '- insert:',
    '    - id: ' + befehl,
    '      name: ' + JSON.stringify(paketName),
    '',
  ].join('\n');
  const index = [
    '/**',
    ' * Abruf für die Kategorie «' + daten.name + '».',
    ' * Erzeugt vom Agenten-Team aus dem Fenster «Mail-Abruf».',
    ' */',
    '',
    'const KONFIG = {',
    '  kategorie: ' + JSON.stringify(daten.name) + ',',
    '  regel: ' + JSON.stringify(daten.regel) + ',',
    '  ziel: ' + JSON.stringify(daten.ziel) + ',',
    '  quelle: ' + JSON.stringify(daten.quelle) + ',',
    '  ablage: ' + JSON.stringify(daten.ablage) + ',',
    '  an: ' + JSON.stringify(daten.an !== false) + ',',
    '};',
    '',
    "export const inject = ['commands'];",
    '',
    'export function apply(ctx) {',
    '  ctx.effect(() => ctx.commands.register({',
    '    name: ' + JSON.stringify(befehl) + ',',
    "    description: 'Abruf für die Kategorie «" + daten.name + "».',",
    "    input: { hint: 'noch ohne Argumente' },",
    '    handler() {',
    '      return {',
    "        kind: 'success',",
    '        text: [',
    "          'Kategorie: ' + KONFIG.kategorie,",
    "          'Regel: ' + (KONFIG.regel || '(keine)'),",
    "          'Zielordner: ' + (KONFIG.ziel || '(noch offen)'),",
    "          'Quelle: ' + (KONFIG.quelle || '(noch offen)'),",
    "          'Ablage: ' + (KONFIG.ablage || '(noch offen)'),",
    "          'Workflow an: ' + (KONFIG.an ? 'ein' : 'aus'),",
    "          '',",
    "          'Der Abruf selbst fehlt noch: dafür braucht es die Mailquelle.',",
    "        ].join('\\n'),",
    '      };',
    '    },',
    "  }), 'Kategorie-Abruf');",
    '}',
    '',
  ].join('\n');
  const readme = [
    '# ' + daten.name + ' — Mail-Abruf',
    '',
    'Ein eigenes Plugin für die Kategorie «' + daten.name + '». Erzeugt vom',
    'Agenten-Team aus dem Fenster «Mail-Abruf».',
    '',
    '| Feld | Wert |',
    '|---|---|',
    '| Regel | ' + (daten.regel || '(keine)') + ' |',
    '| Zielordner | ' + (daten.ziel || '(noch offen)') + ' |',
    '| Quelle | ' + (daten.quelle || '(noch offen)') + ' |',
    '| Ablage | ' + (daten.ablage || '(noch offen)') + ' |',
    '| Workflow an | ' + (daten.an !== false ? 'ein' : 'aus') + ' |',
    '',
    '## Was es schon kann',
    '',
    'Der Befehl `/' + befehl + '` gibt die Einstellungen dieser Kategorie aus.',
    '',
    '## Was noch fehlt',
    '',
    'Der eigentliche Abruf. Dafür muss die Mailquelle bekannt sein und ein',
    'Beispiel für das Zielformat vorliegen.',
    '',
  ].join('\n');
  return {
    kennung: kenn,
    paketName: paketName,
    befehl: befehl,
    dateien: {
      'package.json': JSON.stringify(paket, null, 2) + '\n',
      'cordis.patch.yml': patch,
      'index.js': index,
      'README.md': readme,
    },
  };
}

/** One rule: when the selected cards match, the line is added. */
const REGELN = [
  {
    text: 'Modelle: «Leichtes an günstige Modelle» ist aus. Ordnen, Kürzen und Umformen zahlen sonst das starke Modell mit.',
    trifft: (lage) => !lage.karten.has('s5-leicht'),
  },
  {
    text: 'Modelle: Die Zuteilung steht. Ordnen und Umformen an ein günstiges Modell, Urteilen und Formulieren an ein starkes.',
    trifft: (lage) => lage.karten.has('s5-leicht') && !lage.karten.has('s5-eins'),
  },
  {
    text: 'Gegenprüfung ohne eigene Helfer geht nicht: «Ein Helfer je Teil» einschalten, sonst prüft derselbe Lauf sich selbst.',
    trifft: (lage) => lage.karten.has('s9-aussen') && !lage.karten.has('s4-helfer'),
  },
  {
    text: 'Netz ohne Pfadpflicht: «Jede Quelle mit Pfad» einschalten, sonst ist keine Aussage nachprüfbar.',
    trifft: (lage) => lage.karten.has('s2-web') && !lage.karten.has('s3-pfad'),
  },
  {
    text: 'MCP-Server: Im Harness ist das reine Konfiguration. Ich trage die Zeile ein, freigeben tust du.',
    trifft: (lage) => lage.karten.has('s6-mcp'),
  },
  {
    text: 'Ordner aufräumen: erst die Bestandsliste zeigen, dann fragen. Löschen und Verschieben nur nach deinem Ja.',
    trifft: (lage) => lage.antworten.has('a-aufraeumen'),
  },
  {
    text: 'Ohne Antworten im Onboarding ist der Plan geraten. Antippe im Fenster, was du bauen willst.',
    trifft: (lage) => lage.antworten.size === 0,
  },
];

const SCHLUSS = [
  'Günstig wird es, wenn jeder Helfer nur das Nötige liest: Pfade schicken, keine ganzen Ordner.',
  'Zweite Meinung: «Hephaistos fragen» schickt denselben Plan in den Chat, dort antworte ich darauf.',
];

const SYSTEM = [
  'Du berätst in der PROMPTHEUS-Werkstatt Lernende zwischen 10 und 18 Jahren.',
  'Antworte auf Deutsch, in der Du-Form, in kurzen Sätzen, ohne Ausrufezeichen und ohne Emoji, höchstens sechs Zeilen.',
  'Nenne konkret: welche Phasen an ein günstiges Modell gehen, welche an ein starkes, und welche MCP-Anschlüsse sich lohnen.',
  'Sage auch, was du nicht beurteilen kannst.',
].join(' ');

/**
 * Read the window's payload. The window sends JSON; anything else falls back to
 * the older `karten=…;antworten=…` form so an old page cannot break the command.
 */
function lesen(roh) {
  const text = String(roh || '').trim();
  if (text.startsWith('{')) {
    try {
      const daten = JSON.parse(text);
      return {
        karten: new Set(Array.isArray(daten.karten) ? daten.karten : []),
        antworten: new Set(Array.isArray(daten.antworten) ? daten.antworten : []),
        auftrag: typeof daten.auftrag === 'string' ? daten.auftrag : '',
        plan: Array.isArray(daten.plan) ? daten.plan.filter((zeile) => typeof zeile === 'string') : [],
      };
    } catch {
      // Fällt unten auf die Kurzform zurück.
    }
  }
  const karten = new Set();
  const antworten = new Set();
  for (const teil of text.split(';')) {
    const schnitt = teil.indexOf('=');
    if (schnitt < 0) continue;
    const ziel = teil.slice(0, schnitt).trim() === 'antworten' ? antworten : karten;
    for (const stueck of teil.slice(schnitt + 1).split(',')) {
      const sauber = stueck.trim();
      if (sauber) ziel.add(sauber);
    }
  }
  return { karten: karten, antworten: antworten, auftrag: '', plan: [] };
}

/** The fixed advice. Exported so it can be exercised without a running host. */
export function beratung(roh) {
  const lage = lesen(roh);
  const zeilen = ['Feste Regeln: ' + lage.karten.size + ' Bausteine sind an.'];
  for (const regel of REGELN) if (regel.trifft(lage)) zeilen.push(regel.text);
  for (const zeile of SCHLUSS) zeilen.push(zeile);
  return zeilen.join('\n');
}

/** The question put to the model. */
export function fragenText(roh, zusatz) {
  const lage = lesen(roh);
  const teile = [];
  teile.push('Aufgabe: ' + (lage.auftrag || 'noch offen'));
  if (lage.plan.length) teile.push('Geplanter Ablauf:\n' + lage.plan.join('\n'));
  if (zusatz) teile.push(zusatz);
  teile.push('Der Plan steht. Berate kurz: welche Phasen an ein günstiges Modell, welche an ein starkes, welche MCP-Anschlüsse lohnen, und was noch fehlt.');
  return teile.join('\n\n');
}

/** Flatten a settings value into readable `key=value` pieces, two levels deep. */
function kurz(wert, tiefe) {
  if (wert === null || wert === undefined) return [];
  if (typeof wert === 'string' || typeof wert === 'number' || typeof wert === 'boolean') {
    return [String(wert)];
  }
  if (Array.isArray(wert)) {
    const teile = [];
    for (const eintrag of wert) for (const stueck of kurz(eintrag, tiefe + 1)) teile.push(stueck);
    return teile;
  }
  if (typeof wert === 'object') {
    if (tiefe > 2) return [];
    const teile = [];
    for (const schluessel of Object.keys(wert)) {
      const innen = kurz(wert[schluessel], tiefe + 1);
      if (innen.length) teile.push(schluessel + '=' + innen.join(' | '));
    }
    return teile;
  }
  return [];
}

/** What the workshop has set for helpers: the concrete cheap-model route. */
export function helferZeile(ctx) {
  const dienst = ctx && ctx.get ? ctx.get('subagentModelSelection') : undefined;
  if (!dienst || typeof dienst.current !== 'function') return '';
  try {
    const teile = kurz(dienst.current(), 0);
    if (!teile.length) return '';
    return 'Für Helfer eingestellt: ' + teile.join(', ') + '.';
  } catch {
    return '';
  }
}

/** One short assessment from the configured default model. */
async function modellEinschaetzung(ctx, frage, signal) {
  const llm = ctx.get ? ctx.get('llm') : undefined;
  const modelle = ctx.get ? ctx.get('agentDefaultModel') : undefined;
  if (!llm || typeof llm.stream !== 'function') return { fehler: 'kein Modellweg im Haus (Dienst llm fehlt)' };
  if (!modelle || typeof modelle.currentSelection !== 'function') return { fehler: 'Standardmodell nicht lesbar' };
  const auswahl = modelle.currentSelection();
  const provider = auswahl ? auswahl.provider : undefined;
  const model = auswahl ? auswahl.model : undefined;
  if (!provider || !model) return { fehler: 'Standardmodell unvollständig' };

  // Two shapes for the message content; the first that works wins.
  const formen = [
    [{ role: 'user', content: [{ type: 'text', text: frage }] }],
    [{ role: 'user', content: frage }],
  ];
  let letzterFehler = 'unbekannt';
  for (const messages of formen) {
    try {
      const teile = [];
      const strom = llm.stream({
        provider: provider,
        model: model,
        system: SYSTEM,
        messages: messages,
        maxTokens: 400,
        signal: signal,
      });
      for await (const stueck of strom) {
        if (stueck.type === 'text-delta') teile.push(stueck.text);
        else if (stueck.type === 'finish' && stueck.reason) {
          if (stueck.reason.kind === 'error') {
            const fehler = stueck.reason.failure;
            throw new Error(fehler && fehler.message ? fehler.message : 'Modellfehler');
          }
          if (stueck.reason.kind === 'aborted') throw new Error('abgebrochen');
        }
      }
      const text = teile.join('').trim();
      if (text) return { text: text, modell: provider + '/' + model };
      letzterFehler = 'leere Antwort';
    } catch (fehler) {
      letzterFehler = fehler && fehler.message ? fehler.message : 'unbekannt';
      if (signal && signal.aborted) break;
    }
  }
  return { fehler: letzterFehler };
}

export const inject = ['commands'];

export function apply(ctx) {
  ctx.effect(() => ctx.commands.register({
    name: 'team-beratung',
    description: 'Berät zum gewählten Workflow-Plan: Modelle, Helfer, MCP und Kosten.',
    input: { hint: 'setzt die Oberfläche selbst' },
    async handler(invocation) {
      const roh = invocation ? invocation.rawInput : '';
      const fest = beratung(roh);
      const helfer = helferZeile(ctx);
      let einschaetzung;
      try {
        const ergebnis = await modellEinschaetzung(
          ctx,
          fragenText(roh, helfer),
          invocation ? invocation.signal : undefined,
        );
        if (ergebnis.text) {
          einschaetzung = 'Einschätzung des Modells (' + ergebnis.modell + '):\n' + ergebnis.text;
        } else {
          einschaetzung = 'Einschätzung des Modells: nicht erhalten (' + (ergebnis.fehler || 'unbekannt') + ').';
        }
      } catch (fehler) {
        einschaetzung = 'Einschätzung des Modells: nicht erhalten (' +
          (fehler && fehler.message ? fehler.message : 'unbekannt') + ').';
      }
      const teile = [fest];
      if (helfer) teile.push(helfer);
      teile.push(einschaetzung);
      return { kind: 'success', text: teile.join('\n\n') };
    },
  }), 'agenten-team: beratung');

  ctx.effect(() => ctx.commands.register({
    name: 'mail-erzeugen',
    description: 'Erzeugt für eine Mail-Kategorie ein eigenes Plugin mit eigenem Abruf-Befehl.',
    input: { hint: 'name, ziel, regel, quelle, ablage' },
    async handler(invocation) {
      const daten = auftragLesen(invocation ? invocation.rawInput : '');
      if (!daten.name) {
        return {
          kind: 'error',
          text: 'Ohne Kategorienamen geht es nicht. Trage im Fenster «Mail-Abruf» einen Namen ein.',
        };
      }
      if (!daten.ablage.trim()) daten.ablage = MAIL_ABLAGE;
      try {
        const bau = geruest(daten);
        const ordner = join(EIGENE_PLUGINS, bau.kennung + '-mail');
        await mkdir(ordner, { recursive: true });
        const namen = Object.keys(bau.dateien);
        for (const name of namen) {
          await writeFile(join(ordner, name), bau.dateien[name], 'utf8');
        }
        return {
          kind: 'success',
          text: 'Plugin für «' + daten.name + '» erzeugt: ' + namen.length + ' Dateien in ' + ordner +
            '\nBefehl darin: /' + bau.befehl,
        };
      } catch (fehler) {
        return {
          kind: 'error',
          text: 'Konnte das Plugin nicht schreiben: ' +
            (fehler && fehler.message ? fehler.message : 'unbekannt'),
        };
      }
    },
  }), 'agenten-team: mail-erzeugen');
}
