/**
 * PROMPTHEUS Werkstatt — Einträge für den Audit-Trail der Academy.
 *
 * Node schreibt nicht in die Datenbank der Academy. Es hängt Zeilen an
 * `data/audit/spool/<quelle>-<tag>.jsonl`; die Academy liest sie mit
 * pu_audit_einlesen() in die Hash-Kette (srv/audit.php) und schwärzt dabei
 * noch einmal. Das Feldschema ist das von Hermy (`audittrail/core.py`).
 *
 * Auch hier wird vorher maskiert: Ein Spool, der Klartext enthält, wäre selbst
 * ein Leck, solange er auf der Platte liegt.
 */
import { createHash, randomBytes } from 'node:crypto'
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { ACADEMY } from './maske.mjs'

/** Der Spool-Ordner. Tests legen ihn über PU_TEST_AUDIT um (wie srv/audit.php). */
export function spoolOrdner() {
  const t = process.env.PU_TEST_AUDIT
  return join(t && t !== '' ? t : join(ACADEMY, 'data', 'audit'), 'spool')
}

/** ISO-8601 UTC ohne Millisekunden, wie Hermy. */
export function isoJetzt(ms = Date.now()) {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/** Eine feste Kennung aus Bestandteilen: dasselbe Ereignis ergibt dieselbe Zeile. */
export function auditId(praefix, ...teile) {
  return `aud_${praefix}_` + createHash('sha1').update(teile.join('|')).digest('hex').slice(0, 16)
}

/**
 * Hängt einen Eintrag an. `maske` (aus maske.mjs) maskiert Beschreibung,
 * Ressource und alle Text-Blätter der Metadaten.
 */
export function spoolSchreiben(quelle, eintrag, maske = null) {
  const e = {
    audit_id: eintrag.audit_id ?? `aud_${quelle}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`,
    ts: eintrag.ts ?? isoJetzt(),
    actor_type: eintrag.actor_type ?? 'agent',
    actor_id: eintrag.actor_id ?? 'hephaistos',
    actor_role: eintrag.actor_role ?? 'werkstatt',
    action_type: eintrag.action_type ?? 'event',
    action_category: eintrag.action_category ?? 'ai_act_audit',
    action_description: eintrag.action_description ?? '',
    resource: eintrag.resource ?? '',
    outcome: eintrag.outcome ?? 'success',
    severity: eintrag.severity ?? 'info',
    project: eintrag.project ?? 'werkstatt',
    tenant: eintrag.tenant ?? '',
    session_id: eintrag.session_id ?? '',
    model: eintrag.model ?? '',
    metadata: { source: quelle, ...(eintrag.metadata ?? {}) },
    pii_handling: 'masked',
    retention_days: eintrag.retention_days ?? 365,
  }
  if (maske) {
    e.action_description = maske.text(e.action_description)
    e.resource = maske.text(e.resource)
    // Auch das Modellfeld: Was dort steht, kommt aus der Anfrage und ist nicht vertrauenswürdig.
    e.model = maske.text(e.model)
    e.metadata = maske.wert(e.metadata)
  }
  const ordner = spoolOrdner()
  mkdirSync(ordner, { recursive: true })
  appendFileSync(join(ordner, `${quelle}-${e.ts.slice(0, 10)}.jsonl`), JSON.stringify(e) + '\n', 'utf8')
  return e.audit_id
}
