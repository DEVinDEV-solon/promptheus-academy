# PROMPTHEUS — Die sieben Stufen

**Herkunft der Antworten:** Nicht frei erfunden und nicht vollständig interviewt.
Der Auftraggeber hat die sieben Abschnitte, ihre Texte, die Bild-Prompts, den
Hero-Wunsch und die Scroll-Anmutung bereits ausformuliert geliefert. Die
Antworten unten stehen deshalb in seinen Worten, wo er sie gegeben hat; wo ich
ergänzen musste, steht **[ergänzt]** davor. Zwei Punkte wurden ausdrücklich
gefragt und beantwortet (KIE-Schlüssel, Bildstil).

---

## Die acht Fragen

**1. Anmutung in drei bis fünf Worten, plus Referenzen.**
[ergänzt, abgeleitet aus dem gelieferten Material] *Kupferstich, Feuer,
Gelehrsamkeit, Würde.* Referenzen: Gustave Dorés Stiche, Raffaels *Schule von
Athen* als Bildaufbau (vom Auftraggeber in den Prompts genannt), das bestehende
HD-Bild der Academy.

**2. Die Scroll-Reise, Abschnitt für Abschnitt, in seinen Worten.**
Sieben Abschnitte: *Der Entdecker · Die Bibliothek · Das Modell · Der Geselle ·
Der Automat · Die Akademie · Das Erbe.* Jeweils „ein 9:16 Bild", „mit gerahmten
Effekten jeweils links und rechts im zickzack zu den 7 Texten". Davor ein
Hero-Video.

**3. Die Energiekurve.**
„nicht zu wackelig beim scrollen, sondern immer smooth und die Schrift
leserlich." — Das ist eine Aussage über die Kurve, nicht nur über die Technik:
Diese Seite darf nicht laut sein. Sie steigt ruhig von I bis VI und öffnet sich
erst in VII.

**4. Wie soll sich jemand fühlen — und der EINE Moment?**
Die Feeling-Kurve steht unten. Der eine Moment ist der **Abschnitt VII, „Das
Erbe"**: der Satz *„Die Flamme, die man teilt, brennt ewig."*

**5. Das eine, was diese Seite tut und keine andere.**
[ergänzt] Die Flamme, die im Hero in Prometheus' Hand brennt, **wandert beim
Scrollen die Seite hinunter und entzündet jede Platte, an der sie vorbeikommt.**
Vorher liegt jede Platte kalt und stumpf da; wenn die Flamme sie erreicht, kommt
das Gold hinein. Siehe *Signature Move*.

**6. Wie weit weg von premium-minimal.**
[ergänzt] Editorial, nicht minimal: eine gedruckte Tafelfolge. Ruhig gesetzter
Text, große Ziffern, viel Schwarz.

**7. Eine ungebrochene Welt oder getrennte Szenen?**
**Getrennte Szenen** — und das ist keine Auslegung: „7 Abschnitte", „jeweils ein
Bild", „im zickzack". Sieben Tafeln, sieben Kapitel. Kein Worldflight.

**8. Vorhandene Mittel.**
`assets/img/background/promptheus-background.jpg` — 1920×1081, Schwarzweiß-Stich,
Prometheus auf dem Fels, Flamme in der erhobenen linken Hand (Bildseite links),
Adler oben rechts mit ausgebreiteten Schwingen, Akropolis rechts. Dazu die
Farbmarken der Academy (Nachtgrund, Gold).

---

## Die zwei gestellten Fragen

**Bildstil.** Gewählt: *Stich wie das Hero-Bild.* Die sieben Szenen des
Auftraggebers bleiben Wort für Wort erhalten; nur die Stilzeile wechselt von
„Renaissance oil painting, warm amber and gold" auf Kupferstich mit **einer**
Farbe: der goldenen Glut. Grund: Sieben warme Ölgemälde unter einem monochromen
Stich sind zwei Bildwelten, nicht eine.

**KIE-Schlüssel.** Als „in der .env" angegeben. Gezielt nach dem *Namen* gesucht
(nie nach Werten) in `admin/.env`, `PROMPTHEUS/.env`, `zarbot/.env` und allen
`.env` unter `scripts/` — **keine KIE-Variable gefunden.** Die sieben Platten
und das Hero-Video nach Wunsch stehen deshalb aus; die Seite ist fertig gebaut
und nimmt sie auf, sobald sie da sind.

---

## Die Feeling-Kurve

Erst die Kurve, dann die Geräte — ein Gerät, das vor dem Gefühl gewählt wird,
ist ein Gerät auf der Suche nach einem Grund.

| Akt | Gefühl | Was es auf dem Schirm auslöst |
|---|---|---|
| Hero | **Angesprochen sein** | Prometheus beugt sich heraus, lächelt, zeigt nach unten. Die Flamme brennt. Man wird nicht begrüßt, man wird gemeint. |
| I Entdecker | **Mut** | Die Hand am glühenden Tafelstein, Funken. Erste Platte, die sich entzündet. |
| II Bibliothek | **Ehrfurcht** | Der Maßstab: Regale ohne Ende, ein Wirbel aus Buchstaben. Der kleinste Mensch der Seite. |
| III Modell | **Nüchternheit** | Marmor, Werkzeug, Zirkel. Nach der Ehrfurcht das Handwerk — bewusst kühler. |
| IV Geselle | **Konzentration** | Die Schmiede, enger Ausschnitt, Feder und Uhrwerk. Es wird still und nah. |
| V Automat | **Staunen** | Die Halle voller Automaten. Wieder Weite, aber diesmal beherrscht. |
| VI Akademie | **Zusammengehören** | Der Rat, die Lichtfäden laufen zusammen. Kein Einzelner mehr. |
| VII Erbe | **Aufbruch** ← *Peak* | Die Fackel über der Stadt. Die Flamme kommt oben aus dem Bild und hier unten wieder an. |

**Zwei benachbarte Akte tragen nie dasselbe Gefühl.** II→III fällt von Ehrfurcht
auf Nüchternheit, IV→V von Konzentration auf Staunen: Das sind die beiden
Stellen, an denen die Kurve absichtlich atmet, statt weiterzusteigen.

**Der Peak: VII.** Er bekommt die größte Spannweite (2,4 gegen 1,4), das einzige
volle Bild ohne Rahmen und den einzigen Satz, der allein auf einer Zeile steht.
Der Akt davor (VI) ist ruhiger als er — die Stille vor dem Peak ist eingeplant,
nicht übersehen.

**Gewollte Stille:** der Zwischenraum zwischen VI und VII. Dort steht nichts
außer Schwarz und der wandernden Flamme. Kein toter Scroll, sondern Luft holen.

**Der Satz zum Weitererzählen:** „Es ist die Seite, auf der eine Flamme beim
Scrollen mitläuft und jedes Bild erst anzündet, wenn man dort ankommt."

---

## Grammatik, Score, Signature

**Grammatik: gedruckte Tafelfolge** (editorial chapter spread). Sieben Kapitel
mit römischer Ziffer, Tafel und gesetztem Text, abwechselnd links und rechts.

*Warum nicht die sieben anderen:* **Filmic one-shot** und **Worldflight** sind
ausgeschlossen, weil der Auftraggeber ausdrücklich getrennte Abschnitte
verlangt hat. **Live surface**, **dense dashboard** und **maximalist** brauchen
Daten oder Dichte, die es hier nicht gibt — sieben Absätze sind kein Dashboard.
**Brutalist** und **retro** widersprechen dem Stich, der ein sehr gepflegtes
Bild ist. Übrig bleibt die Tafelfolge, und sie ist zufällig auch genau das, was
„im zickzack" beschreibt.

**Score**

| Akt | Gerät | Warum dieses |
|---|---|---|
| Hero | `pin` + Video (Autoplay-Schleife) | Kein `scrub`. Ein am Scrollrad hängendes Video ruckelt genau dann, wenn jemand langsam scrollt — und „nicht wackelig" war die Bedingung. |
| I, III, V, VII | `flow` + `data-sc-in`, Tafel links | Einmaliges Einblenden beim Eintreten, per IntersectionObserver. Nichts, was beim Zurückscrollen wieder verschwindet. |
| II, IV, VI | `flow` + `data-sc-in`, Tafel rechts | Derselbe Bau, gespiegelt — das ist der Zickzack. |
| durchgehend | `data-sc-parallax="-0.06"` auf den Tafeln | Sehr flach. Die Tafel wandert minimal langsamer als der Text; genug, dass die Seite Tiefe hat, zu wenig, dass sie schwimmt. |
| VII | `data-sc-drift` ins tiefe Schwarz | Der Grund wird zum Schluss dunkler, damit die Fackel das Hellste auf der Seite ist. |

Vier Gerätefamilien (pin, flow/in, parallax, drift), kein Gerät zweimal
hintereinander in derselben Rolle, **kein einziges `scrub`** — bewusst, siehe
oben. Gesamtlänge 12,2 Viewport-Höhen.

**Signature Move: Die wandernde Flamme.**
Ein goldenes Flammenzeichen läuft an der Seitenkante mit dem Scrollfortschritt
mit. Jede Tafel liegt kalt (entsättigt, gedämpft), bis die Flamme ihre Höhe
erreicht — dann kippt sie in Gold und Kontrast. Eigener Code in der Seite,
gespeist aus dem Scrollwert; die Engine bleibt unangetastet. Es ist kein
umgefärbter Kit-Effekt: Es ist die These der Seite als Mechanik — Feuer wird
weitergegeben, und man sieht zu, wie es weitergegeben wird.

**Fingerprint-Gate:** Registry frisch angelegt und leer — dies ist der erste
Build. Es gibt keine Zeile, gegen die zu bestehen wäre.
