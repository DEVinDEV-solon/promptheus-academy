/**
 * Client half of @promptheus/dsh-plugin-workflows.
 *
 * Three seats:
 *   conversation.input.dock  - the line above the composer (template button)
 *   sidebar.footer.action    - the button "Agenten-Team"
 *   shell.overlay            - the large window the button opens
 *
 * The window runs at root scope and therefore receives no composer actions.
 * It hands its finished request to the composer line through `bruecke`, which
 * writes it into the draft.
 */
window.__ModuleLoader__.load({
  id: '@promptheus/dsh-plugin-workflows',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const useState = React.useState;
    const useEffect = React.useEffect;
    const useRef = React.useRef;

    /**
     * ReactDOM, wenn die Seite es hergibt: damit hängen Fenster und Leiste direkt
     * am Seitenkörper. Dann hängt ihre Lage nicht mehr davon ab, wie der
     * Überlagerungsplatz gestapelt ist. Fehlt es, bleibt alles wie bisher.
     */
    const anBody = (() => {
      try {
        const rd = require('react-dom');
        if (rd && typeof rd.createPortal === 'function') {
          return (knoten) => rd.createPortal(knoten, document.body);
        }
      } catch {
        // Ohne ReactDOM wird der Knoten dort gezeichnet, wo er hingehört.
      }
      return (knoten) => knoten;
    })();

    /** Hüllt einen Baustein so ein, dass er am Seitenkörper landet. */
    function KoerperHuelle(Inner) {
      return function Gehuellt() {
        return anBody(h(Inner));
      };
    }

    const NS = 'workflows-karte';

    const DE = {
      title: 'Workflows',
      text: 'Ganze Abläufe als Skript: viele Helfer arbeiten in Phasen an einem Auftrag.',
      button: 'Vorlage einsetzen',
      draft: 'Programmiere mir einen Workflow: [hier die Aufgabe einsetzen]. Fasse am Ende zusammen, was jede Phase ergeben hat.',
      team: 'Agenten-Team',
      modalTitle: 'Agenten-Team',
      modalHint: 'Wähle je Schritt die Bausteine. Grün heisst an, grau heisst aus.',
      auftragLabel: 'Auftrag in einem Satz',
      auftragPlatzhalter: 'Zum Beispiel: prüfe alle Texte im Ordner auf Rechtschreibung',
      filterLabel: 'Filtern',
      filterPlatzhalter: 'Schlagwort suchen',
      einsetzen: 'Auftrag einsetzen',
      schliessen: 'Schliessen',
      zurueck: '< Zurück',
      hoch: '↑ Hoch',
      keinChat: 'Kein Chat offen. Der Auftrag wartet, bis ein Chat läuft.',
      an: 'an',
      aus: 'aus',
      legende: 'Farbe der Punkte',
      leer: 'Nichts gefunden. Filter ändern.',
      fragenTitel: 'Was willst du bauen?',
      fragenHinweis: 'Antippen setzt passende Karten im Plan und nimmt Gegner heraus.',
      neuFragen: 'Neu fragen',
      mehrAnzeigen: 'Mehr anzeigen',
      wenigerAnzeigen: 'Weniger anzeigen',
      antwortenTitel: 'Deine Antworten',
      gemerkt: 'Auswahl gemerkt.',
      beraten: 'Beratung holen',
      fragen: 'Hephaistos fragen',
      beratungTitel: 'Beratung',
      beratungLaeuft: 'Holt die Beratung …',
      beratungKeinDienst: 'Der Beratungsweg ist hier nicht erreichbar. Sag es mir, dann prüfe ich es.',
      beratungKeine: 'Keine Antwort erhalten.',
      beratungFehler: 'Fehler',
      mail: 'Mail-Abruf',
      mailHinweis: 'Trage alles ein, was der Abruf wissen muss. Die Einstellungen bleiben in deinem Browser; gehandelt wird nur, wenn du einen Knopf drückst.',
      mailQuelle: 'Quelle',
      mailQuellePlatz: 'z. B. https://… oder imap://… oder ein Ordner auf dem Server',
      mailZeitplan: 'Zeitplan',
      mailZeitplanPlatz: 'z. B. täglich um 7 Uhr',
      mailZeitraum: 'Zeitraum',
      mailZeitraumPlatz: 'z. B. seit dem letzten Lauf',
      mailDanach: 'Nach dem Abruf',
      mailDanachA: 'liegen lassen',
      mailDanachB: 'in die Ablage verschieben',
      mailDanachC: 'als gelesen markieren',
      mailAblage: 'Ablage',
      mailAblagePlatz: 'Ordner für Mails und Einstellungen',
      mailKategorien: 'Mail-Workflows',
      mailName: 'Name',
      mailZiel: 'Zielordner',
      mailRegel: 'Regel',
      mailNeu: '+ Kategorie',
      mailWeg: 'entfernen',
      mailSpeichern: 'Speichern',
      mailGemerkt: 'Gemerkt.',
      mailErzeugen: 'Plugin erzeugen',
      mailQuelleFehlt: 'Die Mailquelle ist noch offen. Trage sie oben ein — dann baue ich den Abruf.',
      mailLeer: 'Noch keine Kategorie. Mit «+ Kategorie» anfangen.',
      mailKeinChat: 'Kein Chat offen: das Plugin kann erst erzeugt werden, wenn ein Chat läuft.',
      leisteHinweis: 'Unten links öffnet sie. Sie bleibt, solange du sie berührst.',
      leisteFest: 'Festhalten',
      leisteLose: 'Loslassen',
      fenster: 'Fenster',
      bausteineAn: 'Bausteine an',
      vorlesen: 'Vorlesen',
      stoppen: 'Stopp',
      sprichtNicht: 'Dieser Browser kann nicht sprechen.',
      freieTitel: 'Freie Plätze',
      freieHinweis: 'Sechs leere Schalter, noch ohne Aufgabe. Sie warten auf deine Ideen.',
      frei: 'Noch frei',
    };
    const EN = {
      title: 'Workflows',
      text: 'Whole procedures as one script: many helpers work on one job in phases.',
      button: 'Insert template',
      draft: 'Program a workflow: [put the task here]. Summarize at the end what each phase produced.',
      team: 'Agent team',
      modalTitle: 'Agent team',
      modalHint: 'Pick the building blocks per step. Green is on, grey is off.',
      auftragLabel: 'Task in one sentence',
      auftragPlatzhalter: 'For example: check every text in the folder for spelling',
      filterLabel: 'Filter',
      filterPlatzhalter: 'Search a keyword',
      einsetzen: 'Insert task',
      schliessen: 'Close',
      zurueck: '< Back',
      hoch: '↑ Up',
      keinChat: 'No chat open. The task waits until a chat runs.',
      an: 'on',
      aus: 'off',
      legende: 'Colour of the dots',
      leer: 'Nothing found. Change the filter.',
      fragenTitel: 'What do you want to build?',
      fragenHinweis: 'Tapping sets matching cards in the plan and removes opponents.',
      neuFragen: 'Ask again',
      mehrAnzeigen: 'Show more',
      wenigerAnzeigen: 'Show less',
      antwortenTitel: 'Your answers',
      gemerkt: 'Selection kept.',
      beraten: 'Get advice',
      fragen: 'Ask Hephaistos',
      beratungTitel: 'Advice',
      beratungLaeuft: 'Fetching advice …',
      beratungKeinDienst: 'The advice route is not reachable here. Tell me and I will check it.',
      beratungKeine: 'No answer received.',
      beratungFehler: 'Error',
      mail: 'Mail fetch',
      mailHinweis: 'Enter everything the fetch needs to know. The settings stay in your browser; something happens only when you press a button.',
      mailQuelle: 'Source',
      mailQuellePlatz: 'e.g. https://… or imap://… or a folder on the server',
      mailZeitplan: 'Schedule',
      mailZeitplanPlatz: 'e.g. daily at 7',
      mailZeitraum: 'Period',
      mailZeitraumPlatz: 'e.g. since the last run',
      mailDanach: 'After the fetch',
      mailDanachA: 'leave them',
      mailDanachB: 'move them into the store',
      mailDanachC: 'mark them as read',
      mailAblage: 'Store',
      mailAblagePlatz: 'folder for mails and settings',
      mailKategorien: 'Mail workflows',
      mailName: 'Name',
      mailZiel: 'Target folder',
      mailRegel: 'Rule',
      mailNeu: '+ category',
      mailWeg: 'remove',
      mailSpeichern: 'Save',
      mailGemerkt: 'Kept.',
      mailErzeugen: 'Create plugin',
      mailQuelleFehlt: 'The mail source is still open. Enter it above and I will build the fetch.',
      mailLeer: 'No category yet. Start with «+ category».',
      mailKeinChat: 'No chat open: the plugin can only be created while a chat runs.',
      leisteHinweis: 'Bottom left opens it. It stays while you touch it.',
      leisteFest: 'Pin open',
      leisteLose: 'Unpin',
      fenster: 'Window',
      bausteineAn: 'building blocks on',
      vorlesen: 'Read aloud',
      stoppen: 'Stop',
      sprichtNicht: 'This browser cannot speak.',
      freieTitel: 'Free slots',
      freieHinweis: 'Six empty switches, no task yet. They wait for your ideas.',
      frei: 'Still free',
    };

    /**
     * Wörter, Sprache und Anmelde-Kontext stehen hier oben, weil die Bausteine
     * der Oberfläche ausserhalb von `apply` liegen und alle drei benutzen.
     */
    let t = (key) => (Object.prototype.hasOwnProperty.call(DE, key) ? DE[key] : key);
    let sprache = 'de-DE';
    let kontext;

    /**
     * Höchstbreite von Zeile und Leiste: ungefähr die Breite der Eingabezeile.
     * Steht ganz oben, weil die Stile weiter unten sie schon beim Laden lesen.
     */
    const SPALTE = '46rem';

    /* ---------- Schrift und Spalten des Fensters ---------- */

    /** Eine kleine Stufenleiter für die Schriftgrößen der Oberfläche. */
    const SCHRIFT = { titel: '17px', block: '14px', text: '13px', klein: '12px', min: '11px' };
    /** Die sechs noch freien Plätze in der rechten Karte. */
    const LEER = [1, 2, 3, 4, 5, 6];

    /** Zwei Hälften: links die Schalter und Filter, rechts die freien Plätze. */
    const spaltenStil = { display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' };
    const linksStil = {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      flex: '1 1 52%',
      minWidth: 0,
    };
    const rechtsStil = {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      flex: '1 1 40%',
      minWidth: 0,
      padding: '12px',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: '10px',
      background: 'var(--dsw-alias-bg-layer-2)',
    };
    /** Ein leerer quadratischer Schalter, noch ohne Aufgabe. */
    const quadratStil = {
      width: '76px',
      height: '76px',
      boxSizing: 'border-box',
      border: '1px dashed var(--dsw-alias-border-l2)',
      borderRadius: '10px',
      background: 'transparent',
    };

    /** Kinds of building blocks; the dot colour follows the theme tokens. */
    const ARTEN = [
      { id: 'regel', name: 'Regel', punkt: 'var(--dsw-alias-label-secondary)' },
      { id: 'werkzeug', name: 'Werkzeug', punkt: 'var(--dsw-alias-state-idle-primary)' },
      { id: 'workflow', name: 'Workflow', punkt: 'var(--dsw-alias-state-success-primary)' },
      { id: 'plugin', name: 'Plugin', punkt: 'var(--dsw-alias-brand-primary)' },
      { id: 'skill', name: 'Skill', punkt: 'var(--dsw-alias-state-warn-primary)' },
      { id: 'modell', name: 'Modell', punkt: 'var(--dsw-alias-label-primary)' },
    ];
    const ART_VON = {};
    for (const art of ARTEN) ART_VON[art.id] = art;

    /** The ten steps and their cards. Hand-kept for now. */
    const SCHRITTE = [
      { nr: 1, name: 'Auftrag klären', karten: [
        { id: 's1-ziel', wort: 'Ziel in einem Satz', art: 'regel', an: true, text: 'Der Auftrag steht in einem Satz, den ein Fremder versteht.' },
        { id: 's1-fertig', wort: 'Fertig-Kriterium', art: 'regel', an: true, text: 'Woran man erkennt, dass es fertig ist: eine prüfbare Bedingung.' },
        { id: 's1-grenze', wort: 'Was nicht dazugehört', art: 'regel', an: false, text: 'Ausdrücklich nennen, was ausserhalb bleibt, damit die Arbeit nicht wächst.' },
      ] },
      { nr: 2, name: 'Recherche', karten: [
        { id: 's2-web', wort: 'Web-Suche', art: 'plugin', an: true, text: 'Der Helfer darf im Netz suchen und muss die Adresse nennen.' },
        { id: 's2-datei', wort: 'Dateien lesen', art: 'werkzeug', an: true, text: 'Der Helfer liest im Arbeitsordner, nichts ausserhalb.' },
        { id: 's2-nichts', wort: 'Nur vorhandenes Wissen', art: 'regel', an: false, text: 'Kein Netz. Spart Zeit und Geld, kann aber veralten.' },
      ] },
      { nr: 3, name: 'Quellen prüfen', karten: [
        { id: 's3-pfad', wort: 'Jede Quelle mit Pfad', art: 'regel', an: true, text: 'Jede Aussage trägt Datei und Zeile oder eine Adresse.' },
        { id: 's3-gegen', wort: 'Gegenprobe', art: 'workflow', an: true, text: 'Ein zweiter Helfer liest dieselbe Quelle und widerspricht, wenn nötig.' },
      ] },
      { nr: 4, name: 'Plan legen', karten: [
        { id: 's4-phasen', wort: 'Phasen im Skript', art: 'workflow', an: true, text: 'Der Ablauf läuft als Skript mit klaren Phasen und Zwischenständen.' },
        { id: 's4-helfer', wort: 'Ein Helfer je Teil', art: 'workflow', an: true, text: 'Jeder Teilauftrag bekommt einen eigenen Helfer mit eigenem Auftrag.' },
        { id: 's4-einer', wort: 'Alles in einem Zug', art: 'regel', an: false, text: 'Ein einzelner Durchlauf. Schnell und günstig, aber ohne Gegenprüfung.' },
      ] },
      { nr: 5, name: 'Modelle zuteilen', karten: [
        { id: 's5-leicht', wort: 'Leichtes an günstige Modelle', art: 'modell', an: true, text: 'Sortieren, Kürzen, Umformen geht an ein günstiges Modell.' },
        { id: 's5-schwer', wort: 'Schweres an starke Modelle', art: 'modell', an: true, text: 'Urteilen, Prüfen und Formulieren bleiben beim stärkeren Modell.' },
        { id: 's5-eins', wort: 'Alles ein Modell', art: 'regel', an: false, text: 'Ein Modell für alle Phasen. Einfach, aber teurer als nötig.' },
      ] },
      { nr: 6, name: 'Werkzeuge anschliessen', karten: [
        { id: 's6-mcp', wort: 'MCP-Server', art: 'plugin', an: false, text: 'Ein MCP-Anschluss wird als Bündel eingetragen und dann zugeschaltet.' },
        { id: 's6-dateien', wort: 'Arbeitsordner', art: 'plugin', an: true, text: 'Der Helfer arbeitet nur im Arbeitsordner. Schreiben nur mit Rückfrage.' },
        { id: 's6-skill', wort: 'Skill laden', art: 'skill', an: false, text: 'Eine fertige Anleitung aus dem Katalog nutzen, statt alles neu zu erfinden.' },
      ] },
      { nr: 7, name: 'Bauen', karten: [
        { id: 's7-skript', wort: 'Skript schreiben', art: 'werkzeug', an: true, text: 'Der Ablauf entsteht als Skript mit Phasen und gesammelten Ergebnissen.' },
        { id: 's7-klein', wort: 'Klein anfangen', art: 'regel', an: true, text: 'Erst ein Durchlauf mit zwei Helfern, dann erweitern.' },
      ] },
      { nr: 8, name: 'Prüfen', karten: [
        { id: 's8-syntax', wort: 'Syntax und Tests', art: 'werkzeug', an: true, text: 'Jede Datei wird geprüft, bevor sie zählt.' },
        { id: 's8-nach', wort: 'Zweiter liest nach', art: 'workflow', an: true, text: 'Ein anderer Helfer liest das Ergebnis und meldet Fehler.' },
      ] },
      { nr: 9, name: 'Gegenprüfung', karten: [
        { id: 's9-aussen', wort: 'Blick von aussen', art: 'workflow', an: true, text: 'Ein Helfer prüft gegen den ursprünglichen Auftrag, nicht gegen den Plan.' },
        { id: 's9-wider', wort: 'Widerspruch melden', art: 'regel', an: true, text: 'Ein Widerspruch wird gemeldet, nicht stillschweigend geglättet.' },
      ] },
      { nr: 10, name: 'Übergabe', karten: [
        { id: 's10-zusammen', wort: 'Zusammenfassung', art: 'workflow', an: true, text: 'Am Ende steht, was jede Phase ergeben hat und was offen blieb.' },
        { id: 's10-datei', wort: 'Datei ablegen', art: 'werkzeug', an: true, text: 'Das Ergebnis liegt als Datei im Arbeitsordner, mit genanntem Pfad.' },
        { id: 's10-offen', wort: 'Offene Fragen nennen', art: 'regel', an: true, text: 'Was nicht geprüft werden konnte, wird ausdrücklich gesagt.' },
      ] },
    ];

    const START = {};
    for (const schritt of SCHRITTE) {
      for (const karte of schritt.karten) START[karte.id] = karte.an;
    }

    /* ---------- Onboarding: Fragen, die den Plan vorbelegen ---------- */

    /**
     * Answer cards per question. `setzt` names the step cards the answer turns
     * on, `nimmt` the ones it turns off. Only the first twelve answers of a
     * question are shown; the rest waits behind "mehr anzeigen".
     */
    const FRAGEN = [
      { id: 'was', frage: 'Was willst du bauen?', antworten: [
        { id: 'a-text', wort: 'Text oder Bericht', setzt: ['s1-ziel', 's3-pfad', 's10-datei'] },
        { id: 'a-tabelle', wort: 'Tabelle oder Liste', setzt: ['s1-fertig', 's8-syntax', 's10-datei'] },
        { id: 'a-recherche', wort: 'Recherche', setzt: ['s2-web', 's3-pfad', 's3-gegen'] },
        { id: 'a-code', wort: 'Code oder Programm', setzt: ['s7-skript', 's8-syntax', 's8-nach'] },
        { id: 'a-website', wort: 'Website', setzt: ['s6-skill', 's8-syntax', 's10-datei'] },
        { id: 'a-bild', wort: 'Bild oder Grafik', setzt: ['s6-skill', 's10-datei'] },
        { id: 'a-video', wort: 'Video oder Film', setzt: ['s4-phasen', 's6-skill'] },
        { id: 'a-ton', wort: 'Ton oder Sprechtext', setzt: ['s6-skill', 's10-datei'] },
        { id: 'a-daten', wort: 'Daten prüfen', setzt: ['s8-syntax', 's9-aussen', 's10-zusammen'] },
        { id: 'a-aufraeumen', wort: 'Ordner aufräumen', setzt: ['s1-grenze', 's6-dateien', 's9-wider'] },
        { id: 'a-uebersetzen', wort: 'Übersetzen', setzt: ['s5-leicht', 's8-nach'] },
        { id: 'a-zusammenfassen', wort: 'Zusammenfassen', setzt: ['s5-leicht', 's10-zusammen'] },
        { id: 'a-katalog', wort: 'Katalog oder Sammlung', setzt: ['s3-pfad', 's10-datei'] },
        { id: 'a-unterricht', wort: 'Unterrichtsmaterial', setzt: ['s1-ziel', 's9-aussen'] },
        { id: 'a-vortrag', wort: 'Vortrag oder Sprechtext', setzt: ['s1-ziel', 's10-zusammen'] },
        { id: 'a-plan', wort: 'Nur ein Plan', setzt: ['s4-phasen', 's4-helfer'] },
      ] },
      { id: 'woher', frage: 'Woher kommt der Stoff?', antworten: [
        { id: 'w-dateien', wort: 'Dateien im Arbeitsordner', setzt: ['s2-datei', 's6-dateien'] },
        { id: 'w-netz', wort: 'Netz und Quellen', setzt: ['s2-web', 's3-pfad'], nimmt: ['s2-nichts'] },
        { id: 'w-wissen', wort: 'Nur vorhandenes Wissen', setzt: ['s2-nichts'], nimmt: ['s2-web', 's3-pfad', 's3-gegen'] },
        { id: 'w-beides', wort: 'Beides gemischt', setzt: ['s2-web', 's2-datei'], nimmt: ['s2-nichts'] },
      ] },
    ];
    const ANTWORTEN_SICHTBAR = 12;

    /* ---------- Gedächtnis: die Auswahl übersteht ein Neuladen ---------- */

    const SPEICHER = 'agenten-team-auswahl';
    function laden() {
      try {
        const roh = window.localStorage.getItem(SPEICHER);
        if (!roh) return null;
        const daten = JSON.parse(roh);
        return daten && typeof daten === 'object' ? daten : null;
      } catch {
        return null;
      }
    }
    function sichern(daten) {
      try {
        window.localStorage.setItem(SPEICHER, JSON.stringify(daten));
      } catch {
        // Ohne Speicher läuft alles weiter, nur ohne Gedächtnis.
      }
    }

    /* ---------- Brücke: Fenster schreibt, Eingabefeld nimmt an ---------- */

    const bruecke = {
      offen: false,
      mail: false,
      text: null,
      schreiber: false,
      session: undefined,
      horcher: new Set(),
    };
    function melden() { bruecke.horcher.forEach((fn) => fn()); }
    function useBruecke() {
      const [zustand, setZustand] = useState(0);
      useEffect(() => {
        const horcher = () => setZustand((n) => n + 1);
        bruecke.horcher.add(horcher);
        return () => bruecke.horcher.delete(horcher);
      }, []);
      return zustand;
    }
    function oeffnen() { bruecke.offen = true; melden(); }
    function schliessen() { bruecke.offen = false; melden(); }
    function auftragEinsetzen(text) { bruecke.text = text; bruecke.offen = false; melden(); }
    function textAbholen() { const text = bruecke.text; bruecke.text = null; return text; }

    /**
     * Write text into the draft. Without `ersetzen` it inserts at the caret and
     * only replaces the draft when the editor refuses the insertion.
     */
    function schreibe(actions, text, ersetzen) {
      if (!actions || !text) return;
      if (!ersetzen) {
        try {
          if (typeof actions.captureInsertion === 'function' && typeof actions.insertText === 'function') {
            if (actions.insertText(text, actions.captureInsertion()) === true) return;
          }
        } catch {
          // Der Editor hat die Einfügung abgelehnt; unten wird der Entwurf ersetzt.
        }
      }
      if (typeof actions.setDraft === 'function') actions.setDraft(text);
    }

    /* ---------- Stile ---------- */

    const box = {
      display: 'flex',
      width: 'fit-content',
      maxWidth: 'min(100%, ' + SPALTE + ')',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '8px',
      boxSizing: 'border-box',
      margin: '0 auto 6px',
      padding: '8px 12px',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: '10px',
      background: 'var(--dsw-alias-bg-layer-1)',
      color: 'var(--dsw-alias-label-secondary)',
      font: 'inherit',
      fontSize: '13px',
      lineHeight: '1.4',
    };
    const titelStil = { color: 'var(--dsw-alias-label-primary)', fontWeight: 600, flex: '0 0 auto' };
    const textStil = { flex: '0 1 auto', minWidth: 0 };
    const knopfStil = {
      flex: '0 0 auto',
      padding: '4px 10px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '8px',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '13px',
      cursor: 'pointer',
    };
    const randStil = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      padding: '6px 8px',
      border: 'none',
      borderRadius: '8px',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '13px',
      textAlign: 'left',
      cursor: 'pointer',
    };
    /** Quadratischer Knopf für ein Zeichen statt eines Wortes. */
    const zeichenKnopf = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: '36px',
      height: '36px',
      padding: 0,
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '8px',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      cursor: 'pointer',
    };
    /** Kleines quadratisches Zeichen im Kartenrücken. */
    const kartenKnopf = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: '28px',
      height: '28px',
      padding: 0,
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '8px',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      cursor: 'pointer',
    };
    const scrimStil = {
      position: 'fixed',
      inset: 0,
      zIndex: 8900,
      background: 'var(--dsw-alias-bg-base)',
      opacity: 0.8,
    };
    const fensterStil = {
      position: 'fixed',
      inset: '1.5vh 1.5vw',
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxSizing: 'border-box',
      padding: '16px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '14px',
      background: 'var(--dsw-alias-bg-layer-1)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '13px',
      lineHeight: '1.45',
      overflowY: 'auto',
    };
    const karteAussen = {
      position: 'relative',
      width: '200px',
      perspective: '800px',
    };
    const karteInnen = {
      position: 'relative',
      transformStyle: 'preserve-3d',
      transition: 'transform 260ms ease, height 260ms ease',
    };
    const karteSeite = {
      position: 'absolute',
      inset: 0,
      boxSizing: 'border-box',
      padding: '8px 10px',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: '10px',
      background: 'var(--dsw-alias-bg-layer-2)',
      backfaceVisibility: 'hidden',
      overflow: 'hidden',
    };
    const schrittZeile = { display: 'flex', alignItems: 'flex-start', gap: '10px' };
    const nummerStil = {
      flex: '0 0 auto',
      width: '26px',
      height: '26px',
      marginTop: '4px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '50%',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '12px',
      lineHeight: '24px',
      textAlign: 'center',
    };
    const kartenReihe = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
    const schalterStil = {
      flex: '0 0 auto',
      padding: '0 6px',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: '999px',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '11px',
      cursor: 'pointer',
    };

    /* ---------- Bausteine der Oberfläche ---------- */

    function Punkt(props) {
      return h('span', {
        'aria-hidden': true,
        style: {
          display: 'inline-block',
          flex: '0 0 auto',
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          background: props.farbe,
        },
      });
    }

    /** Das Zeichen der Werkstatt: drei Köpfe, die zusammen arbeiten. */
    function Logo(props) {
      const kante = props && props.kante ? props.kante : 44;
      return h('svg', {
        viewBox: '0 0 32 32',
        width: kante,
        height: kante,
        'aria-hidden': true,
        style: { flex: '0 0 auto', display: 'block' },
      },
        h('circle', { cx: 16, cy: 8, r: 6, fill: 'var(--dsw-alias-brand-primary)' }),
        h('circle', { cx: 7, cy: 23, r: 5, fill: 'var(--dsw-alias-brand-primary)' }),
        h('circle', { cx: 25, cy: 23, r: 5, fill: 'var(--dsw-alias-brand-primary)' }),
      );
    }

    /** Fenstersymbol mit grünen Bitzeichen in einer 32x32-Matrix. */
    function FensterZeichen() {
      const muster = [
        '101101',
        '010010',
        '110011',
        '110011',
        '010010',
        '101101',
      ];
      const bits = [];
      for (let zeile = 0; zeile < muster.length; zeile += 1) {
        for (let spalte = 0; spalte < muster[zeile].length; spalte += 1) {
          if (muster[zeile].charAt(spalte) !== '1') continue;
          bits.push(h('rect', {
            key: zeile + '-' + spalte,
            x: 7 + spalte * 3,
            y: 12 + zeile * 3,
            width: 2,
            height: 2,
            fill: 'var(--dsw-alias-state-success-primary)',
          }));
        }
      }
      return h('svg', {
        viewBox: '0 0 32 32',
        width: 30,
        height: 30,
        'aria-hidden': true,
        style: { flex: '0 0 auto', display: 'block' },
      },
        h('rect', {
          x: 1,
          y: 1,
          width: 30,
          height: 30,
          rx: 3,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
        }),
        h('rect', { x: 1, y: 1, width: 30, height: 8, rx: 3, fill: 'var(--dsw-alias-border-l2)' }),
        h('circle', { cx: 5.5, cy: 5, r: 1.2, fill: 'var(--dsw-alias-label-secondary)' }),
        h('circle', { cx: 9.5, cy: 5, r: 1.2, fill: 'var(--dsw-alias-label-secondary)' }),
        ...bits,
      );
    }

    /** Pfeil nach oben oder unten, für das Festhalten der Leiste. */
    function PfeilZeichen(props) {
      const hoch = props.richtung !== 'runter';
      return h('svg', {
        viewBox: '0 0 24 24',
        width: 20,
        height: 20,
        'aria-hidden': true,
        style: { flex: '0 0 auto', display: 'block' },
      },
        h('path', {
          d: hoch
            ? 'M12 4 L20 14 L15 14 L15 20 L9 20 L9 14 L4 14 Z'
            : 'M12 20 L4 10 L9 10 L9 4 L15 4 L15 10 L20 10 Z',
          fill: 'currentColor',
        }),
      );
    }

    /** Die Art als kleines Schild in ihrer eigenen Farbe. */
    function ArtSchild(props) {
      return h('span', {
        style: {
          flex: '0 0 auto',
          padding: '1px 6px',
          border: '1px solid ' + props.farbe,
          borderRadius: '999px',
          color: props.farbe,
          fontSize: SCHRIFT.min,
          lineHeight: '1.5',
        },
      }, props.name);
    }

    /** Dreieck zum Abspielen, Quadrat zum Anhalten. */
    function TonZeichen(props) {
      return h('svg', {
        viewBox: '0 0 24 24',
        width: 14,
        height: 14,
        'aria-hidden': true,
        style: { display: 'block' },
      }, props.laeuft === true
        ? h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2, fill: 'currentColor' })
        : h('path', { d: 'M7 5 L19 12 L7 19 Z', fill: 'currentColor' }));
    }

    /** Ein Briefumschlag mit grünem Punkt: neue Post. */
    function MailZeichen() {
      return h('svg', {
        viewBox: '0 0 24 24',
        width: 18,
        height: 18,
        'aria-hidden': true,
        style: { display: 'block', flex: '0 0 auto' },
      },
        h('rect', {
          x: 2.5,
          y: 5,
          width: 19,
          height: 14,
          rx: 2.5,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
        }),
        h('path', { d: 'M3.4 7 L12 13.2 L20.6 7', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }),
        h('circle', { cx: 19.6, cy: 5.6, r: 2.2, fill: 'var(--dsw-alias-state-success-primary)' }),
      );
    }

    function Legende(props) {
      return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' } },
        h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, props.t('legende') + ':'),
        ...ARTEN.map((art) => h('span', { key: art.id, style: { display: 'inline-flex', alignItems: 'center', gap: '5px' } },
          h(Punkt, { farbe: art.punkt }),
          h('span', null, art.name),
        )),
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '5px' } },
          h(Punkt, { farbe: 'var(--dsw-alias-state-success-primary)' }),
          h('span', null, props.t('an')),
        ),
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '5px' } },
          h(Punkt, { farbe: 'var(--dsw-alias-state-idle-primary)' }),
          h('span', null, props.t('aus')),
        ),
      );
    }

    /**
     * The card's small player. It speaks through the browser's own voice and
     * prefers a voice that runs on this machine, so the text leaves the device
     * only if no local voice fits.
     */
    function Vorleser(props) {
      const [laeuft, setLaeuft] = useState(false);
      const [anteil, setAnteil] = useState(0);
      const laut = useRef(null);

      const stopp = () => {
        laut.current = null;
        try {
          if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        } catch {
          // Ohne Sprachausgabe passiert hier nichts.
        }
        setLaeuft(false);
        setAnteil(0);
      };
      useEffect(() => stopp, []);

      const moeglich = typeof window !== 'undefined' &&
        !!window.speechSynthesis &&
        typeof window.SpeechSynthesisUtterance === 'function';
      if (!moeglich) {
        return h('div', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: '11px' } },
          props.t('sprichtNicht'));
      }

      const sprich = () => {
        if (laeuft) {
          stopp();
          return;
        }
        const sprecher = window.speechSynthesis;
        const text = props.wort + '. ' + props.text;
        const stimme = new window.SpeechSynthesisUtterance(text);
        stimme.lang = props.sprache;
        try {
          const kurz = String(props.sprache).slice(0, 2).toLowerCase();
          const passend = (sprecher.getVoices() || []).filter(
            (eine) => String(eine.lang || '').toLowerCase().startsWith(kurz),
          );
          const hiesig = passend.filter((eine) => eine.localService === true);
          if (hiesig.length) stimme.voice = hiesig[0];
          else if (passend.length) stimme.voice = passend[0];
        } catch {
          // Ohne Stimmenliste spricht der Browser mit seiner Vorgabe.
        }
        stimme.onboundary = (ereignis) => {
          if (typeof ereignis.charIndex === 'number' && text.length > 0) {
            setAnteil(Math.max(0, Math.min(1, ereignis.charIndex / text.length)));
          }
        };
        stimme.onend = () => { laut.current = null; setLaeuft(false); setAnteil(1); };
        stimme.onerror = () => { laut.current = null; setLaeuft(false); setAnteil(0); };
        laut.current = stimme;
        setAnteil(0);
        setLaeuft(true);
        try {
          sprecher.cancel();
          sprecher.speak(stimme);
        } catch {
          laut.current = null;
          setLaeuft(false);
        }
      };

      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
        h('button', {
          type: 'button',
          style: kartenKnopf,
          title: laeuft ? props.t('stopp') : props.t('vorlesen'),
          'aria-label': laeuft ? props.t('stopp') : props.t('vorlesen'),
          onClick: sprich,
        }, h(TonZeichen, { laeuft: laeuft })),
        h('div', {
          'aria-hidden': true,
          style: {
            flex: '0 0 auto',
            width: '96px',
            height: '6px',
            borderRadius: '999px',
            border: '1px solid var(--dsw-alias-border-l1)',
            background: 'var(--dsw-alias-bg-base)',
          },
        },
          h('div', {
            style: {
              width: Math.round(anteil * 100) + '%',
              height: '100%',
              borderRadius: '999px',
              background: 'var(--dsw-alias-brand-primary)',
              transition: 'width 120ms linear',
            },
          }),
        ),
        h('span', {
          style: { color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.min },
        }, props.sprache),
      );
    }

    /** One card: keyword in front, description behind, turning on click. */
    function Karte(props) {
      const offen = props.offen;
      const art = ART_VON[props.karte.art] || ARTEN[0];
      const hoehe = offen ? 200 : 64;
      const seite = Object.assign({}, karteSeite, { height: hoehe + 'px' });
      return h('div', { style: karteAussen },
        h('div', {
          style: Object.assign({}, karteInnen, {
            height: hoehe + 'px',
            transform: offen ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }),
        },
        h('div', {
          style: Object.assign({}, seite, { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }),
          role: 'button',
          tabIndex: 0,
          onClick: props.aufdrehen,
          onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') props.aufdrehen(); },
        },
          h(Punkt, { farbe: art.punkt }),
          h('span', { style: { flex: '1 1 auto', minWidth: 0, fontWeight: 600 } }, props.karte.wort),
          h('button', {
            type: 'button',
            style: Object.assign({}, schalterStil, props.an
              ? { borderColor: 'var(--dsw-alias-state-success-primary)', color: 'var(--dsw-alias-state-success-primary)' }
              : { borderColor: 'var(--dsw-alias-border-l2)', color: 'var(--dsw-alias-label-secondary)' }),
            onClick: (e) => { e.stopPropagation(); props.umschalten(); },
          }, props.an ? props.t('an') : props.t('aus')),
        ),
        h('div', {
          style: Object.assign({}, seite, {
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }),
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
            h(Punkt, { farbe: art.punkt }),
            h('span', { style: { fontWeight: 600, flex: '1 1 auto', minWidth: 0 } }, props.karte.wort),
            h(ArtSchild, { name: art.name, farbe: art.punkt }),
          ),
          h(Vorleser, {
            wort: props.karte.wort,
            text: props.karte.text,
            sprache: props.sprache,
            t: props.t,
          }),
          h('div', {
            style: {
              height: '1px',
              background: 'var(--dsw-alias-border-l2)',
              margin: '2px 0',
            },
            'aria-hidden': true,
          }),
          h('div', {
            style: {
              flex: '1 1 auto',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              overflowY: 'auto',
            },
          }, props.karte.text),
          h('div', { style: { display: 'flex', gap: '6px' } },
            h('button', { type: 'button', style: schalterStil, onClick: props.zudrehen }, props.t('zurueck')),
            h('button', {
              type: 'button',
              style: Object.assign({}, schalterStil, { marginLeft: 'auto' }),
              onClick: props.zudrehen,
            }, props.t('hoch')),
          ),
        ),
        ),
      );
    }

    /* ---------- Text des fertigen Auftrags ---------- */

    function auftragsText(auftrag, gewaehlt, antworten) {
      const zeilen = [];
      for (const schritt of SCHRITTE) {
        const aktiv = schritt.karten.filter((karte) => gewaehlt[karte.id]).map((karte) => karte.wort);
        if (aktiv.length) zeilen.push(schritt.nr + '. ' + schritt.name + ': ' + aktiv.join(', '));
      }
      const gewuenscht = [];
      for (const frage of FRAGEN) {
        for (const antwort of frage.antworten) {
          if (antworten && antworten[antwort.id]) gewuenscht.push(antwort.wort);
        }
      }
      const teile = [
        auftrag.trim()
          ? 'Baue mir einen Workflow für diese Aufgabe: ' + auftrag.trim()
          : 'Baue mir einen Workflow.',
      ];
      if (gewuenscht.length) teile.push('Aus meinen Antworten: ' + gewuenscht.join(', ') + '.');
      teile.push('Nutze diesen Plan:');
      teile.push(zeilen.join('\n'));
      teile.push('Teile die Arbeit auf Helfer auf, schicke leichte Aufgaben an günstigere Modelle und starke Arbeit an stärkere, und fasse am Ende zusammen, was jede Phase ergeben hat.');
      return teile.join('\n');
    }

    /** The payload the host command reads: ids for the rules, readable text for the model. */
    function beratungAuftrag(auftrag, gewaehlt, antworten) {
      const karten = [];
      const plan = [];
      for (const schritt of SCHRITTE) {
        const aktiv = [];
        for (const karte of schritt.karten) {
          if (!gewaehlt[karte.id]) continue;
          karten.push(karte.id);
          aktiv.push(karte.wort);
        }
        if (aktiv.length) plan.push(schritt.nr + '. ' + schritt.name + ': ' + aktiv.join(', '));
      }
      const gewuenscht = [];
      for (const frage of FRAGEN) {
        for (const antwort of frage.antworten) if (antworten && antworten[antwort.id]) gewuenscht.push(antwort.id);
      }
      return JSON.stringify({
        karten: karten,
        antworten: gewuenscht,
        auftrag: String(auftrag || '').trim(),
        plan: plan,
      });
    }

    /** The request that goes into the chat for a real second opinion. */
    function frageText(auftrag, gewaehlt, antworten) {
      return [
        'Hephaistos, berate mich zu diesem Workflow-Plan.',
        auftragsText(auftrag, gewaehlt, antworten),
        'Sag mir: welche Phasen an ein günstiges Modell gehen, welche an ein starkes, und welche MCP-Anschlüsse sich lohnen.',
      ].join('\n');
    }

    /* ---------- Die drei Plätze ---------- */

    function WorkflowKarte(props) {
      const runde = useBruecke();
      const actions = props ? props.inputActions : undefined;
      const bereit = !!(actions && (typeof actions.setDraft === 'function' || typeof actions.insertText === 'function'));

      useEffect(() => {
        bruecke.schreiber = true;
        bruecke.session = props && props.sessionId ? props.sessionId : undefined;
        melden();
        return () => {
          bruecke.schreiber = false;
          bruecke.session = undefined;
          melden();
        };
      }, []);

      useEffect(() => {
        if (!bruecke.text || !bereit) return;
        schreibe(actions, textAbholen(), true);
      }, [runde, bereit]);

      return h('div', { style: box },
        h('span', { style: titelStil }, t('title')),
        h('span', { style: textStil }, t('text')),
        h('button', {
          type: 'button',
          style: bereit ? knopfStil : Object.assign({}, knopfStil, { opacity: 0.5, cursor: 'default' }),
          disabled: !bereit,
          onClick: () => schreibe(actions, t('draft'), false),
        }, t('button')),
        h('button', {
          type: 'button',
          style: zeichenKnopf,
          title: t('fenster'),
          'aria-label': t('fenster'),
          onClick: oeffnen,
        }, h(FensterZeichen)),
      );
    }

    function TeamKnopf() {
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%' } },
        h('button', {
          type: 'button',
          style: Object.assign({}, randStil, { flex: '1 1 auto' }),
          onClick: () => (bruecke.offen ? schliessen() : oeffnen()),
        }, t('team')),
        h('button', {
          type: 'button',
          style: Object.assign({}, zeichenKnopf, { width: '30px', height: '30px' }),
          title: t('mail'),
          'aria-label': t('mail'),
          onClick: () => {
            bruecke.mail = !bruecke.mail;
            if (bruecke.mail) bruecke.offen = false;
            melden();
          },
        }, h(MailZeichen)),
      );
    }

    function TeamFenster() {
      useBruecke();
      const [gemerkt] = useState(() => laden());
      const [filter, setFilter] = useState('');
      const [arten, setArten] = useState({});
      const [auftrag, setAuftrag] = useState('');
      const [offenKarte, setOffenKarte] = useState('');
      const [gewaehlt, setGewaehlt] = useState(() => Object.assign({}, START, gemerkt && gemerkt.gewaehlt ? gemerkt.gewaehlt : {}));
      const [antworten, setAntworten] = useState(() => (gemerkt && gemerkt.antworten ? gemerkt.antworten : {}));
      const [mehr, setMehr] = useState({});
      const [beratung, setBeratung] = useState(null);
      const [laeuft, setLaeuft] = useState(false);

      useEffect(() => {
        sichern(Object.assign({}, laden() || {}, { antworten: antworten, gewaehlt: gewaehlt }));
      }, [antworten, gewaehlt]);

      useEffect(() => {
        if (!bruecke.offen) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') schliessen(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [bruecke.offen]);

      if (!bruecke.offen) return null;

      const such = filter.trim().toLowerCase();
      const sichtbar = (karte) => {
        if (arten[karte.art]) return false;
        if (!such) return true;
        return karte.wort.toLowerCase().includes(such) || karte.text.toLowerCase().includes(such);
      };
      const zeilen = SCHRITTE
        .map((schritt) => ({ schritt, karten: schritt.karten.filter(sichtbar) }))
        .filter((zeile) => zeile.karten.length > 0);

      const umschalten = (id) => setGewaehlt(Object.assign({}, gewaehlt, { [id]: !gewaehlt[id] }));

      /** Eine Antwort antippen: Plan vorbelegen, Gegner herausnehmen, Auswahl merken. */
      const antwortUmschalten = (antwort) => {
        const war = !!antworten[antwort.id];
        const naechste = Object.assign({}, antworten);
        if (war) delete naechste[antwort.id];
        else naechste[antwort.id] = true;
        const plan = Object.assign({}, gewaehlt);
        for (const id of antwort.setzt || []) plan[id] = war ? !!START[id] : true;
        for (const id of antwort.nimmt || []) if (!war) plan[id] = false;
        setAntworten(naechste);
        setGewaehlt(plan);
      };

      const neuFragen = () => {
        setAntworten({});
        setGewaehlt(Object.assign({}, START));
        setMehr({});
      };

      /** Beratung aus der Werkstatt holen: der Host-Befehl rechnet, das Fenster zeigt. */
      const beraten = async () => {
        setLaeuft(true);
        setBeratung(null);
        try {
          const remote = kontext && kontext.get ? kontext.get('remote.commands') : undefined;
          if (!remote || typeof remote.execute !== 'function') {
            setBeratung({ fehler: t('beratungKeinDienst') });
            return;
          }
          if (!bruecke.session) {
            setBeratung({ fehler: t('keinChat') });
            return;
          }
          const ergebnis = await remote.execute(
            bruecke.session,
            '/team-beratung ' + beratungAuftrag(auftrag, gewaehlt, antworten),
            [],
          );
          const antwortText = ergebnis && ergebnis.result ? ergebnis.result.text : undefined;
          if (ergebnis && ergebnis.result && ergebnis.result.kind === 'success' && antwortText) {
            setBeratung({ text: antwortText });
          } else if (antwortText) {
            setBeratung({ fehler: t('beratungFehler') + ': ' + antwortText });
          } else {
            setBeratung({ fehler: t('beratungKeine') });
          }
        } catch (fehler) {
          setBeratung({
            fehler: t('beratungFehler') + ': ' + (fehler && fehler.message ? fehler.message : 'unbekannt'),
          });
        } finally {
          setLaeuft(false);
        }
      };

      return h('div', { style: { position: 'fixed', inset: 0, pointerEvents: 'auto' } },
        h('div', { style: scrimStil, onClick: schliessen }),
        h('div', { style: fensterStil },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' } },
            h('span', { style: { fontSize: SCHRIFT.titel, fontWeight: 600, flex: '0 0 auto' } }, t('modalTitle')),
            h('span', {
              style: { color: 'var(--dsw-alias-label-secondary)', flex: '0 0 auto', fontSize: SCHRIFT.klein },
            }, t('modalHint')),
            h('button', {
              type: 'button',
              style: Object.assign({}, knopfStil, { marginLeft: 'auto' }),
              onClick: schliessen,
            }, t('schliessen')),
          ),

          h('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px 12px',
              border: '1px solid var(--dsw-alias-border-l1)',
              borderRadius: '10px',
              background: 'var(--dsw-alias-bg-layer-2)',
            },
          },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
              h('span', { style: { fontWeight: 600, fontSize: SCHRIFT.block } }, t('fragenTitel')),
              h('span', {
                style: { color: 'var(--dsw-alias-label-secondary)', flex: '0 0 auto', fontSize: SCHRIFT.klein },
              }, t('fragenHinweis')),
              h('button', {
                type: 'button',
                style: Object.assign({}, knopfStil, { marginLeft: 'auto' }),
                onClick: neuFragen,
              }, t('neuFragen')),
            ),
            ...FRAGEN.map((frage) => {
              const alle = frage.antworten;
              const wieviele = mehr[frage.id] ? alle.length : Math.min(ANTWORTEN_SICHTBAR, alle.length);
              const rest = alle.length - ANTWORTEN_SICHTBAR;
              return h('div', { key: frage.id, style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                h('div', {
                  style: { color: 'var(--dsw-alias-label-secondary)', textAlign: 'center', fontSize: SCHRIFT.klein },
                }, frage.frage),
                h('div', { style: Object.assign({}, kartenReihe, { justifyContent: 'center' }) },
                  ...alle.slice(0, wieviele).map((antwort) => h('button', {
                    key: antwort.id,
                    type: 'button',
                    style: Object.assign({}, schalterStil, {
                      padding: '4px 10px',
                      fontSize: '12px',
                      borderColor: antworten[antwort.id]
                        ? 'var(--dsw-alias-state-success-primary)'
                        : 'var(--dsw-alias-border-l1)',
                      color: antworten[antwort.id]
                        ? 'var(--dsw-alias-state-success-primary)'
                        : 'var(--dsw-alias-label-primary)',
                    }),
                    onClick: () => antwortUmschalten(antwort),
                  }, antwort.wort)),
                ),
                rest > 0 && h('button', {
                  type: 'button',
                  style: schalterStil,
                  onClick: () => setMehr(Object.assign({}, mehr, { [frage.id]: !mehr[frage.id] })),
                }, (mehr[frage.id] ? t('wenigerAnzeigen') : t('mehrAnzeigen')) + ' (' + rest + ')'),
              );
            }),
          ),

          h('div', { style: spaltenStil },
            h('div', { style: linksStil },
              h(Legende, { t: t }),

          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px' } },
            h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 240px', minWidth: 0 } },
              h('span', { style: { color: 'var(--dsw-alias-label-secondary)', flex: '0 0 auto' } }, t('filterLabel')),
              h('input', {
                type: 'search',
                value: filter,
                placeholder: t('filterPlatzhalter'),
                onChange: (e) => setFilter(e.target.value),
                style: {
                  flex: '1 1 auto',
                  minWidth: 0,
                  padding: '4px 8px',
                  border: '1px solid var(--dsw-alias-border-l1)',
                  borderRadius: '8px',
                  background: 'var(--dsw-alias-bg-layer-2)',
                  color: 'var(--dsw-alias-label-primary)',
                  font: 'inherit',
                  fontSize: '13px',
                },
              }),
            ),
            ...ARTEN.map((art) => h('button', {
              key: art.id,
              type: 'button',
              style: Object.assign({}, schalterStil, { padding: '3px 8px', opacity: arten[art.id] ? 0.45 : 1 }),
              onClick: () => setArten(Object.assign({}, arten, { [art.id]: !arten[art.id] })),
            }, art.name)),
          ),

          h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
            h('span', { style: { color: 'var(--dsw-alias-label-secondary)', flex: '0 0 auto' } }, t('auftragLabel')),
            h('input', {
              type: 'text',
              value: auftrag,
              placeholder: t('auftragPlatzhalter'),
              onChange: (e) => setAuftrag(e.target.value),
              style: {
                flex: '1 1 auto',
                minWidth: 0,
                padding: '4px 8px',
                border: '1px solid var(--dsw-alias-border-l1)',
                borderRadius: '8px',
                background: 'var(--dsw-alias-bg-layer-2)',
                color: 'var(--dsw-alias-label-primary)',
                font: 'inherit',
                fontSize: '13px',
              },
            }),
          ),

          zeilen.length === 0
            ? h('div', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t('leer'))
            : zeilen.map((zeile) => h('div', { key: zeile.schritt.nr, style: schrittZeile },
              h('div', { style: nummerStil }, String(zeile.schritt.nr)),
              h('div', { style: { flex: '1 1 auto', minWidth: 0 } },
                h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, zeile.schritt.name),
                h('div', { style: kartenReihe },
                  ...zeile.karten.map((karte) => h(Karte, {
                    key: karte.id,
                    karte: karte,
                    t: t,
                    sprache: sprache,
                    an: !!gewaehlt[karte.id],
                    offen: offenKarte === karte.id,
                    umschalten: () => umschalten(karte.id),
                    aufdrehen: () => setOffenKarte(offenKarte === karte.id ? '' : karte.id),
                    zudrehen: () => setOffenKarte(''),
                  })),
                ),
              ),
            )),
            ),

            h('div', { style: rechtsStil },
              h('span', { style: { fontWeight: 600, fontSize: SCHRIFT.block } }, t('freieTitel')),
              h('span', {
                style: { color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.klein },
              }, t('freieHinweis')),
              h('div', { style: Object.assign({}, kartenReihe, { justifyContent: 'flex-start' }) },
                ...LEER.map((nr) => h('div', {
                  key: nr,
                  style: quadratStil,
                  title: t('frei'),
                })),
              ),
            ),
          ),

          h('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px 12px',
              border: '1px solid var(--dsw-alias-border-l1)',
              borderRadius: '10px',
              background: 'var(--dsw-alias-bg-layer-2)',
            },
          },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
              h('span', { style: { fontWeight: 600, fontSize: SCHRIFT.block } }, t('beratungTitel')),
              h('button', {
                type: 'button',
                style: laeuft ? Object.assign({}, knopfStil, { opacity: 0.5, cursor: 'default' }) : knopfStil,
                disabled: laeuft,
                onClick: beraten,
              }, laeuft ? t('beratungLaeuft') : t('beraten')),
              h('button', {
                type: 'button',
                style: bruecke.schreiber ? knopfStil : Object.assign({}, knopfStil, { opacity: 0.5, cursor: 'default' }),
                disabled: !bruecke.schreiber,
                onClick: () => auftragEinsetzen(frageText(auftrag, gewaehlt, antworten)),
              }, t('fragen')),
            ),
            beratung && h('div', {
              style: {
                whiteSpace: 'pre-wrap',
                color: beratung.fehler
                  ? 'var(--dsw-alias-state-warn-primary)'
                  : 'var(--dsw-alias-label-primary)',
              },
            }, beratung.fehler ? beratung.fehler : beratung.text),
          ),

          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
            h('button', {
              type: 'button',
              style: bruecke.schreiber ? knopfStil : Object.assign({}, knopfStil, { opacity: 0.5, cursor: 'default' }),
              disabled: !bruecke.schreiber,
              onClick: () => auftragEinsetzen(auftragsText(auftrag, gewaehlt, antworten)),
            }, t('einsetzen')),
            !bruecke.schreiber && h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t('keinChat')),
          ),
        ),
      );
    }

    /* ---------- Taskleiste am unteren Rand ---------- */

    /**
     * Die Auslösefläche liegt unten links: ein Fünftel der Fensterbreite mal
     * ein Fünftel der Fensterhöhe. Die Mitte bleibt frei, damit die Leiste
     * nicht aufspringt, wenn man zum Eingabefeld fährt.
     */
    const LINKS_ANTEIL = 0.2;
    /** Höhe der Auslösefläche, als Anteil der Fensterhöhe, von unten gemessen. */
    const UNTEN_ANTEIL = 0.2;
    /** Nachlauf in Millisekunden, bevor die Leiste wieder einfährt. */
    const WARTEZEIT_MS = 300;

    /** Die Leiste liest die zuletzt gemerkte Auswahl; persönlichen Text speichert sie nie. */
    function standLesen() {
      const gemerkt = laden();
      const gewaehlt = Object.assign({}, START, gemerkt && gemerkt.gewaehlt ? gemerkt.gewaehlt : {});
      let an = 0;
      const schritte = SCHRITTE.map((schritt) => {
        const zahl = schritt.karten.filter((karte) => gewaehlt[karte.id]).length;
        an += zahl;
        return { nr: schritt.nr, name: schritt.name, an: zahl, gesamt: schritt.karten.length };
      });
      return { an: an, schritte: schritte };
    }

    const leisteStil = {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 500,
      width: '100%',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'nowrap',
      boxSizing: 'border-box',
      padding: '6px 14px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: 0,
      background: 'var(--dsw-alias-bg-layer-1)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: '13px',
      transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
    };

    /** Quadratischer Knopf für ein Zeichen statt eines Wortes. */

    /**
     * The bottom bar. It rides up when the pointer reaches the bottom edge, stays
     * while the pointer is on it, and slides back {@link WARTEZEIT_MS} after the
     * pointer leaves. "Festhalten" keeps it open regardless.
     */
    function Taskleiste() {
      useBruecke();
      const [offen, setOffen] = useState(false);
      const [fest, setFest] = useState(() => {
        const gemerkt = laden();
        return !!(gemerkt && gemerkt.leiste === 'fest');
      });
      const [stand, setStand] = useState(() => standLesen());
      const schwebt = useRef(false);
      const liegtOffen = useRef(false);
      const wecker = useRef(null);
      /** Die letzte Zeigerstellung; sie unterscheidet echte Bewegung von einem Umbau. */
      const letzterZeiger = useRef({ x: -1, y: -1 });
      /** Der eigene Knoten und die angewandte Verschiebung, für die Breite. */
      const leisteKnoten = useRef(null);
      const versatz = useRef(0);
      const [korrektur, setKorrektur] = useState(null);

      const aufraeumen = () => {
        if (wecker.current) {
          window.clearTimeout(wecker.current);
          wecker.current = null;
        }
      };
      useEffect(() => aufraeumen, []);

      const hoch = () => {
        aufraeumen();
        if (!liegtOffen.current) {
          liegtOffen.current = true;
          setStand(standLesen());
        }
        setOffen(true);
        // Ist der Zeiger nicht auf der Leiste, fährt sie nach der Wartezeit wieder
        // ein. Ohne das bliebe sie hängen, sobald man in der Auslösefläche arbeitet.
        if (!schwebt.current && !fest) spaeterRunter();
      };
      const runter = () => {
        liegtOffen.current = false;
        setOffen(false);
      };
      const spaeterRunter = () => {
        aufraeumen();
        wecker.current = window.setTimeout(() => {
          wecker.current = null;
          if (!schwebt.current && !fest) runter();
        }, WARTEZEIT_MS);
      };

      useEffect(() => {
        // Solange ein Fenster offen ist, bleibt die Leiste unten und hört nicht zu.
        if (bruecke.offen || bruecke.mail) {
          runter();
          return undefined;
        }
        if (fest) {
          hoch();
          return undefined;
        }
        const beiBewegung = (ereignis) => {
          const vorher = letzterZeiger.current;
          const bewegt = ereignis.clientX !== vorher.x || ereignis.clientY !== vorher.y;
          letzterZeiger.current = { x: ereignis.clientX, y: ereignis.clientY };
          // Baut der Browser unter dem Zeiger etwas um, schickt er ein Ereignis
          // ohne Bewegung. Das darf die Leiste nicht hochfahren.
          if (!bewegt) return;
          const links = ereignis.clientX <= window.innerWidth * LINKS_ANTEIL;
          const unten = ereignis.clientY >= window.innerHeight * (1 - UNTEN_ANTEIL);
          if (links && unten) {
            hoch();
            return;
          }
          // Zeiger ist weg von der Auslösefläche: die Leiste darf wieder einfahren.
          if (!schwebt.current) spaeterRunter();
        };
        window.addEventListener('mousemove', beiBewegung);
        return () => window.removeEventListener('mousemove', beiBewegung);
      }, [fest, bruecke.offen, bruecke.mail]);

      // Die Leiste soll am linken Fensterrand beginnen und bis zum rechten reichen.
      // Sitzt sie in einem eingerückten Rahmen, wird sie hier darauf umgerechnet.
      // Stimmt die Breite schon, passiert nichts.
      useEffect(() => {
        const messen = () => {
          const knoten = leisteKnoten.current;
          if (!knoten) return;
          const kasten = knoten.getBoundingClientRect();
          const breite = document.documentElement.clientWidth;
          // Die schon angewandte Verschiebung herausrechnen, sonst misst man sie mit.
          const links = kasten.left - versatz.current;
          if (Math.abs(links) < 0.5 && Math.abs(kasten.width - breite) < 1) {
            versatz.current = 0;
            setKorrektur(null);
            return;
          }
          versatz.current = -links;
          setKorrektur({ marginLeft: versatz.current + 'px', width: breite + 'px' });
        };
        messen();
        window.addEventListener('resize', messen);
        return () => window.removeEventListener('resize', messen);
      }, [offen, fest]);

      if (bruecke.offen || bruecke.mail) return null;

      const umschaltenFest = () => {
        const naechster = !fest;
        setFest(naechster);
        sichern(Object.assign({}, laden() || {}, { leiste: naechster ? 'fest' : 'hover' }));
        if (naechster) hoch();
        else spaeterRunter();
      };

      return h('div', {
        ref: leisteKnoten,
        style: Object.assign({}, leisteStil, korrektur || {}, {
          transform: offen ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: offen ? 'auto' : 'none',
        }),
        onMouseEnter: () => { schwebt.current = true; hoch(); },
        onMouseLeave: () => { schwebt.current = false; spaeterRunter(); },
      },
        h(Logo, { kante: 30 }),
        h('span', { style: { width: '8px', flex: '0 0 auto' } }),
        h('span', { style: { fontWeight: 600, flex: '0 0 auto' } }, t('team')),
        h('span', { style: { color: 'var(--dsw-alias-label-secondary)', flex: '0 0 auto' } },
          stand.an + ' ' + t('bausteineAn')),
        h('div', {
          style: {
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '6px',
            flex: '1 1 auto',
            minWidth: 0,
            overflowX: 'auto',
            overflowY: 'hidden',
          },
        },
          ...stand.schritte.map((schritt) => h('button', {
            key: schritt.nr,
            type: 'button',
            title: schritt.name + ': ' + schritt.an + ' von ' + schritt.gesamt,
            style: Object.assign({}, schalterStil, {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
            }),
            onClick: () => { hoch(); oeffnen(); },
          },
            h(Punkt, {
              farbe: schritt.an > 0
                ? 'var(--dsw-alias-state-success-primary)'
                : 'var(--dsw-alias-state-idle-primary)',
            }),
            h('span', null, String(schritt.nr)),
            h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, schritt.an + '/' + schritt.gesamt),
          )),
        ),
        h('span', {
          style: {
            color: 'var(--dsw-alias-label-secondary)',
            fontSize: SCHRIFT.klein,
            flex: '0 1 auto',
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }, t('leisteHinweis')),
        h('div', { style: { display: 'flex', gap: '8px', flex: '0 0 auto' } },
          h('button', {
            type: 'button',
            style: Object.assign({}, zeichenKnopf, { width: '30px', height: '30px' }),
            title: t('fenster'),
            'aria-label': t('fenster'),
            onClick: () => { hoch(); oeffnen(); },
          }, h(FensterZeichen)),
          h('button', {
            type: 'button',
            style: Object.assign({}, zeichenKnopf, { width: '30px', height: '30px' }),
            title: fest ? t('leisteLose') : t('leisteFest'),
            'aria-label': fest ? t('leisteLose') : t('leisteFest'),
            onClick: umschaltenFest,
          }, h(PfeilZeichen, { richtung: fest ? 'runter' : 'hoch' })),
        ),
      );
    }

    /* ---------- Mail-Abruf: das grosse Fenster ---------- */

    /**
     * Der Schalter eines Workflows: grün heisst ein, rot heisst aus.
     * Ein Klick schaltet um.
     */
    function MailSchalter(props) {
      const an = props.an === true;
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': an,
        title: an ? t('an') : t('aus'),
        onClick: props.umschalten,
        style: {
          flex: '0 0 auto',
          position: 'relative',
          width: '42px',
          height: '22px',
          padding: 0,
          border: '1px solid ' + (an
            ? 'var(--dsw-alias-state-success-primary)'
            : 'var(--dsw-alias-state-error-primary)'),
          borderRadius: '11px',
          background: an
            ? 'var(--dsw-alias-state-success-primary)'
            : 'var(--dsw-alias-state-error-primary)',
          cursor: 'pointer',
        },
      }, h('span', {
        style: {
          position: 'absolute',
          top: '2px',
          left: an ? '22px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'var(--dsw-alias-bg-base)',
        },
      }));
    }

    /** Die Vorgaben; alles Weitere trägt man im Fenster ein. */
    const MAIL_VORGABE = {
      quelle: '',
      zeitplan: 'täglich um 7 Uhr',
      zeitraum: 'seit dem letzten Lauf',
      danach: 'liegen',
      ablage: 'D:\\zarbot\\tenants\\admin\\plugins\\EIGENE\\mailposten',
      kategorien: [],
    };

    /** Die gemerkten Wünsche lesen. */
    function mailLaden() {
      const gemerkt = laden();
      const roh = gemerkt && gemerkt.mail && typeof gemerkt.mail === 'object' ? gemerkt.mail : {};
      return Object.assign({}, MAIL_VORGABE, roh, {
        kategorien: Array.isArray(roh.kategorien) ? roh.kategorien : [],
      });
    }

    /**
     * Das Fenster für den Mail-Abruf: alles eintragen, Kategorien anlegen,
     * je Kategorie ein eigenes Plugin erzeugen. Die Eintragungen bleiben im
     * Browser; gehandelt wird nur über den Befehl beim Erzeugen.
     */
    function MailFenster() {
      useBruecke();
      const [stand, setStand] = useState(() => mailLaden());
      const [meldung, setMeldung] = useState('');
      const [laeuft, setLaeuft] = useState(false);

      if (!bruecke.mail) return null;

      const mailFeld = {
        flex: '1 1 260px',
        minWidth: 0,
        padding: '5px 8px',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: '8px',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        fontSize: SCHRIFT.text,
      };
      const mailZeile = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' };
      const mailMarke = { flex: '0 0 120px', color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.klein };
      const mailBlock = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px 12px',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: '10px',
        background: 'var(--dsw-alias-bg-layer-2)',
      };

      const aendern = (name, wert) => setStand(Object.assign({}, stand, { [name]: wert }));
      const kategorieAendern = (nr, name, wert) => setStand(Object.assign({}, stand, {
        kategorien: stand.kategorien.map((eintrag, i) => (
          i === nr ? Object.assign({}, eintrag, { [name]: wert }) : eintrag
        )),
      }));
      const kategorieNeu = () => setStand(Object.assign({}, stand, {
        kategorien: stand.kategorien.concat([{ name: '', ziel: '', regel: '', an: true }]),
      }));
      const kategorieWeg = (nr) => setStand(Object.assign({}, stand, {
        kategorien: stand.kategorien.filter((eintrag, i) => i !== nr),
      }));

      const speichern = () => {
        sichern(Object.assign({}, laden() || {}, { mail: stand }));
        setMeldung(t('mailGemerkt'));
      };

      /** Das eigene Plugin für diese Kategorie vom Host erzeugen lassen. */
      const erzeugen = async (kategorie) => {
        setLaeuft(true);
        setMeldung('');
        try {
          const remote = kontext && kontext.get ? kontext.get('remote.commands') : undefined;
          if (!remote || typeof remote.execute !== 'function') {
            setMeldung(t('beratungKeinDienst'));
            return;
          }
          if (!bruecke.session) {
            setMeldung(t('mailKeinChat'));
            return;
          }
          const auftrag = JSON.stringify({
            name: kategorie.name || '',
            ziel: kategorie.ziel || '',
            regel: kategorie.regel || '',
            quelle: stand.quelle || '',
            ablage: stand.ablage || '',
            an: kategorie.an !== false,
          });
          const ergebnis = await remote.execute(bruecke.session, '/mail-erzeugen ' + auftrag, []);
          const antwort = ergebnis && ergebnis.result ? ergebnis.result.text : undefined;
          setMeldung(antwort || t('beratungKeine'));
        } catch (fehler) {
          setMeldung(t('beratungFehler') + ': ' + (fehler && fehler.message ? fehler.message : 'unbekannt'));
        } finally {
          setLaeuft(false);
        }
      };

      const schliessenMail = () => { bruecke.mail = false; melden(); };

      return h('div', { style: { position: 'fixed', inset: 0, pointerEvents: 'auto' } },
        h('div', { style: scrimStil, onClick: schliessenMail }),
        h('div', { style: fensterStil },
          h('div', { style: Object.assign({}, mailZeile, { justifyContent: 'center' }) },
            h('span', { style: { fontSize: SCHRIFT.titel, fontWeight: 600 } }, t('mail')),
            h('span', {
              style: { color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.klein, flex: '0 0 auto' },
            }, t('mailHinweis')),
            h('button', {
              type: 'button',
              style: Object.assign({}, knopfStil, { marginLeft: 'auto' }),
              onClick: schliessenMail,
            }, t('schliessen')),
          ),

          h('div', { style: mailBlock },
            h('div', { style: mailZeile },
              h('span', { style: mailMarke }, t('mailQuelle')),
              h('input', {
                type: 'text',
                value: stand.quelle,
                placeholder: t('mailQuellePlatz'),
                onChange: (e) => aendern('quelle', e.target.value),
                style: mailFeld,
              }),
            ),
            h('div', { style: mailZeile },
              h('span', { style: mailMarke }, t('mailZeitplan')),
              h('input', {
                type: 'text',
                value: stand.zeitplan,
                placeholder: t('mailZeitplanPlatz'),
                onChange: (e) => aendern('zeitplan', e.target.value),
                style: mailFeld,
              }),
            ),
            h('div', { style: mailZeile },
              h('span', { style: mailMarke }, t('mailZeitraum')),
              h('input', {
                type: 'text',
                value: stand.zeitraum,
                placeholder: t('mailZeitraumPlatz'),
                onChange: (e) => aendern('zeitraum', e.target.value),
                style: mailFeld,
              }),
            ),
            h('div', { style: mailZeile },
              h('span', { style: mailMarke }, t('mailDanach')),
              h('select', {
                value: stand.danach,
                onChange: (e) => aendern('danach', e.target.value),
                style: Object.assign({}, mailFeld, { flex: '0 0 220px' }),
              },
                h('option', { value: 'liegen' }, t('mailDanachA')),
                h('option', { value: 'verschieben' }, t('mailDanachB')),
                h('option', { value: 'gelesen' }, t('mailDanachC')),
              ),
            ),
            h('div', { style: mailZeile },
              h('span', { style: mailMarke }, t('mailAblage')),
              h('input', {
                type: 'text',
                value: stand.ablage,
                placeholder: t('mailAblagePlatz'),
                onChange: (e) => aendern('ablage', e.target.value),
                style: mailFeld,
              }),
            ),
            !String(stand.quelle).trim() && h('div', {
              style: { color: 'var(--dsw-alias-state-warn-primary)', fontSize: SCHRIFT.klein },
            }, t('mailQuelleFehlt')),
          ),

          h('div', { style: mailBlock },
            h('div', { style: mailZeile },
              h('span', {
                style: { fontWeight: 600, fontSize: SCHRIFT.block, flex: '1 1 auto' },
              }, t('mailKategorien')),
              h('button', { type: 'button', style: knopfStil, onClick: kategorieNeu }, t('mailNeu')),
            ),
            stand.kategorien.length === 0 && h('div', {
              style: { color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.klein },
            }, t('mailLeer')),
            ...stand.kategorien.map((kategorie, nr) => {
              const an = kategorie.an !== false;
              return h('div', {
                key: nr,
                style: Object.assign({}, mailZeile, {
                  alignItems: 'flex-start',
                  flexWrap: 'nowrap',
                  padding: '8px 10px',
                  border: '1px solid var(--dsw-alias-border-l1)',
                  borderRadius: '10px',
                  background: 'var(--dsw-alias-bg-layer-1)',
                }),
              },
                h('div', {
                  style: { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 auto', minWidth: 0 },
                },
                  h('div', { style: mailZeile },
                    h('input', {
                      type: 'text',
                      value: kategorie.name || '',
                      placeholder: t('mailName'),
                      onChange: (e) => kategorieAendern(nr, 'name', e.target.value),
                      style: Object.assign({}, mailFeld, { flex: '1 1 150px' }),
                    }),
                    h('input', {
                      type: 'text',
                      value: kategorie.ziel || '',
                      placeholder: t('mailZiel'),
                      onChange: (e) => kategorieAendern(nr, 'ziel', e.target.value),
                      style: Object.assign({}, mailFeld, { flex: '1 1 190px' }),
                    }),
                  ),
                  h('input', {
                    type: 'text',
                    value: kategorie.regel || '',
                    placeholder: t('mailRegel'),
                    onChange: (e) => kategorieAendern(nr, 'regel', e.target.value),
                    style: mailFeld,
                  }),
                  h('div', { style: mailZeile },
                    h('button', {
                      type: 'button',
                      style: Object.assign({}, knopfStil, { flex: '0 0 auto' }),
                      disabled: laeuft || !an || !String(kategorie.name || '').trim(),
                      onClick: () => erzeugen(kategorie),
                    }, t('mailErzeugen')),
                    h('button', {
                      type: 'button',
                      style: Object.assign({}, schalterStil, { flex: '0 0 auto' }),
                      title: t('mailWeg'),
                      onClick: () => kategorieWeg(nr),
                    }, '✕'),
                  ),
                ),
                h('div', {
                  style: {
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    paddingTop: '2px',
                  },
                },
                  h(MailSchalter, { an: an, umschalten: () => kategorieAendern(nr, 'an', !an) }),
                  h('span', {
                    style: { color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.min },
                  }, an ? t('an') : t('aus')),
                ),
              );
            }),
          ),

          h('div', { style: mailZeile },
            h('button', { type: 'button', style: knopfStil, onClick: speichern }, t('mailSpeichern')),
            meldung && h('span', {
              style: { color: 'var(--dsw-alias-label-secondary)', fontSize: SCHRIFT.klein },
            }, meldung),
          ),
        ),
      );
    }

    /* ---------- Anmeldung ---------- */

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        kontext = ctx;
        try {
          ctx.locale.register(NS, 'de', DE);
          ctx.locale.register(NS, 'en', EN);
          t = ctx.locale.bind(NS);
        } catch {
          // Zweiter Anlauf im selben Blatt: die Wörter stehen schon, DE bleibt der Rückfall.
        }
        try {
          const sprachstand = ctx.locale.getLocale();
          const aktiv = sprachstand && sprachstand.active ? String(sprachstand.active) : 'de';
          sprache = aktiv.slice(0, 2).toLowerCase() === 'en' ? 'en-US' : 'de-DE';
        } catch {
          // Ohne Sprachstand bleibt es bei de-DE.
        }
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'workflows-karte',
          order: 30,
        }, WorkflowKarte));
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'agenten-team',
          order: 30,
        }, TeamKnopf));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'agenten-team-fenster',
        }, KoerperHuelle(TeamFenster)));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'agenten-team-leiste',
          order: -10,
        }, KoerperHuelle(Taskleiste)));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'mail-fenster',
          order: 20,
        }, KoerperHuelle(MailFenster)));
      },
    };
  },
});
