---
type: architecture
title: "Login-Level-Rechte-Plan — 6 Rollen: Admin/Schule/Direktor/Lehrer/Eltern/Schüler"
description: "RBAC-Rechte-Plan für PROMPTHEUS, übernommen aus dem DEVinDEV-Hauptprogramm (Spatie Permission-Muster). Drei Verwaltungs-Ebenen plus Lehrer, Eltern, Schüler — feingranular, mit eigener Einstellungsseite."
tags: [architecture, login, rollen, rechte, rbac, prometheus]
timestamp: 2026-08-20T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stand: plan
status: zur-pruefung
---

# Login-Level-Rechte-Plan — 6 Rollen

> Vorbild ist das Rollen-/Rechte-Modell aus dem DEVinDEV-Hauptprogramm
> (`Future Ai`): **Spatie Permission** (RBAC). Kern-Muster: Rollen sind
> feingranularen Berechtigungen `modul.action` zugeordnet, jede geschützte
> Funktion prüft ihre Permission, und eine eigene Einstellungsseite verfeinert
> den Login.
>
> PROMPTHEUS übernimmt das Konzept ohne Framework in PHP 8 + SQLite als
> schlanke, deterministische RBAC-Engine — **sechs** Rollen: Verwaltungsebene
> (Admin/Schule/Direktor) sowie Lehrer, Eltern und Schüler.

---

## 1. Die sechs Rollen

| Kürzel | Rolle | Ebene |
|---|---|---|
| `admin` | Plattform-Betreiber (DEVinDEV) | Verwaltung |
| `schule` | Einrichtung (Institutions-Konto) | Verwaltung |
| `direktor` | Leitung der Einrichtung | Verwaltung |
| `lehrer` | Unterrichtende / Tutor | Lehre |
| `eltern` | Erziehungsberechtigte eines Schülers | Transparenz/Schutz |
| `schueler` | Lernender | Lernen |

Die drei Verwaltungs-Rollen bilden eine **Hierarchie** (`admin` ⊃ `schule` ⊃
`direktor`): Wer oben steht, kann das darunter Verwaltete frei (überschneidende
Rechte über die Matrix). Lehrer, Eltern und Schüler sind **eigenständige
Zielgruppen** mit klar begrenztem Sicht- und Handlungsraum. Kürzel sind
sprachneutral; Anzeigenamen werden in der Einstellungsseite lokalisiert.

---

## 2. Rechte-Matrix (fein granular, 6 Rollen)

Jede Fähigkeit ist genau eine Permission `modul.action`; gewährt wird nur über
diese Prüfung. Spalten: **A**=Admin · **S**=Schule · **D**=Direktor ·
**L**=Lehrer · **E**=Eltern · **Sch**=Schüler. ✓ darf, ✗ nicht.

### 2.1 Dashboard & System
| modul.action | A | S | D | L | E | Sch |
|---|---|---|---|---|---|---|
| `dashboard.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `login.einstellungen` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `rechte.einstellungen` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `sicherheit.einstellungen` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 2.2 Schulverwaltung
| modul.action | A | S | D | L | E | Sch |
|---|---|---|---|---|---|---|
| `schulen.manage` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `schulen.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `klassen.manage` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `klassen.view` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |

### 2.3 Lehrkörper, Eltern & Lernende
| modul.action | A | S | D | L | E | Sch |
|---|---|---|---|---|---|---|
| `lehrkraefte.manage` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `lehrkraefte.view` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `eltern.manage` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `eltern.view` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `schueler.view` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `schueler.selbst` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `lernende.manage` | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `rollen.manage` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 2.4 Inhalte & Kurse
| modul.action | A | S | D | L | E | Sch |
|---|---|---|---|---|---|---|
| `kurse.manage` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `kurse.veroeffentlichen` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `lektionen.manage` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `lektionen.freigabe` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `bibliothek.manage` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `creator.manage` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

### 2.5 Lernen, Prüfung & Fortschritt
| modul.action | A | S | D | L | E | Sch |
|---|---|---|---|---|---|---|
| `lernen.ausfuehren` | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| `pruefung.ausfuehren` | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| `pruefung.bewerten` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `urkunde.ausstellen` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `fortschritt.sehen` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `fortschritt.eigen` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `auswertung.lehrersehen` | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |

### 2.6 Netzwerk / Community (später VPS)
| modul.action | A | S | D | L | E | Sch |
|---|---|---|---|---|---|---|
| `pool.upload` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `pool.download` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `pool.kuratieren` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 3. Datenschutz & Besonderheiten (Pflicht)

- **Minderjährige:** `personen` bleibt pseudonym (Hash); Klarnamen nur so weit
  für die Rolle zwingend.
- **Schüler sieht nur sein eigenes Lern-Ergebnis** (`schueler.selbst` /
  `fortschritt.eigen`) — nie Klassendurchschnitte, nie fremde Schüler.
- **Eltern sehen nur ihr eigenes Kind** — über einen `eltern_link` (Schüler →
  Erziehungsberechtigtes Konto). Nie fremde Kinder, nie Klassen-Auswertung.
- **Jede Recht-Änderung** wird append-only mit Hash-Kette ins
  `login_audit.log` geschrieben (Rolle, Permission, Zeit, Prüfsumme); eine
  spätere Änderung bricht die Kette und ist nachweisbar.
- **Keine Kennwörter/Personendaten** in Logs — nur die Recht-Änderung.
- Sperrlisten-Logik aus `Netzwerk-Vorplan.md` gilt auch hier.

---

## 4. Technische Umsetzung (PHP 8 / SQLite, deterministisch)

### 4.1 Tabellen (in `data/promptheus.db` erweitert)
```
rollen        (id, name, anzeige)
rechte        (id, name=modul.action, beschreibung)
rollen_rechte (rolle_id, recht_id)          → Pivot
personen      (id, rolle, name_hash, schule_id, klasse_id, eltern_link, ...)
sitzungen                                  → Session, wie heute
login_konfig  (schluessel, wert)
```

### 4.2 Prüfung
- `rechte_hat(modul.action)` prüft die angemeldete Rolle gegen die Pivot.
- Es wird **eine** Permission geprüft, nie eine Rollen-Kopie → Anpassung der
  Matrix in §2, ohne Code zu ändern.
- `admin` bekommt alle Rechte über Matrix + Hierarchie, kein Zusatz-Flag.

### 4.3 Kernel-Dateien
- `srv/rechte.php` — Rechtetyp-Check, Rollen-CRUD, Setzen der Rechte.
- `srv/auth.php` — Login (Passwort-Hash), Session, Rollenzuordnung.
- `srv/settings_login.php` — die Einstellungsseite.
- Jede geschützte Aktion ruft `rechte_hat`, sonst `403`.

---

## 5. Die Einstellungsseite

Modul „Einstellungen → Login & Rechte", für die Rolle mit
`rechte.einstellungen` (Admin): **Sechs-Rollen-Matrix**:

- Pro Rolle ein Block mit Anzeigename (lokalisierbar) + Farbe.
- Pro Permission ein Umschalter — auf einen Blick, wer darf was.
- Gruppiert in Sektionen, mit Suche über Namen/Beschreibung.
- **Änderungs-Protokoll** (wer, wann, welche Rechtänderung) — Audit.
- **Simulation:** Vorschau, was die gewählte Rolle dann kann.

**Beispiel-Simulation (Lehrer):**
```markdown
✓ Dashboard · ✓ Klassen ansehen · ✓ Kurse pflegen · ✓ Lektionen
✗ Kurs veröffentlichen · ✗ Prüfung bewerten · ✗ Rechte verwalten
✓ Lernende seiner Klassen
```

**Beispiel-Simulation (Schüler):** nur Eigenbezug (`schueler.selbst`,
`fortschritt.eigen`), sonst nichts Fremdes.
**Beispiel-Simulation (Eltern):** nur Fortschritt des verknüpften Kindes.

---

## 6. Audit & Datenschutz (Pflicht)

- **Jede Recht-Änderung** append-only mit Hash-Kette ins `login_audit.log`
  (Rolle, Permission, Zeit, Prüfsumme).
- **Keine Kennwörter/Personendaten** in Logs — nur die Recht-Änderung.
- **Minderjährige:** Schüler sieht nur eigene Werte; Eltern nur verknüpftes
  Kind; beides nie fremd. Klarnamen nur soweit zwingend.

---

## 7. Testdateien

| Datei | Prüfgegenstand |
|---|---|
| `rechte_test.php` | jede Matrix-Zelle; `admin` hat alles; Hierarchie admin ≥ schule ≥ direktor |
| `auth_test.php` | Rollen-CRUD, Passwort-Hash, Session, Rollenzuordnung |
| `set_rechte_test.php` | Anzeige + Recht-Änderung + Audit-Kette + Simulation |
| `privat_test.php` | Schüler sieht nur Eigenes; Eltern nur verknüpftes Kind; Fremdes → 403 |
| `router_login_test.php` | jede geschützte Funktion ohne Recht → 403 |

---

## 8. Nächster Schritt nach Freigabe

1. DB-Schema auf 6 Rollen erweitern.
2. `app.js` (Muster-Engine) auf **6 Rollen** umstellen (admin→schule→direktor→
   lehrer→eltern→schueler).
3. `srv/auth.php` + `srv/rechte.php` mit Tests.
4. Eltern-/Schüler-Sicht strikt nach §3: nur Selbst-/verknüpfte Daten.

---
> **Status:** Plan steht (6 Rollen). Muster-Seite folgt jetzt unter
> `tests/Login-Levelsystem/`.