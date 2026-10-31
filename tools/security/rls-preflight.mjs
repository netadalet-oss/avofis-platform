/**
 * AVOfis S1 B01/B02: offline RLS metadata release preflight.
 * Never connects to Supabase or modifies tables, grants or policies.
 * A passing synthetic test does not establish live or staging acceptance.
 */
import { readFileSync } from 'node:fs';
export const LEGACY_TABLES = Object.freeze([
  'applications','jobs','media_assets','office_members','offices','posts','topics'
]);
export const CMS_TABLES = Object.freeze(['pages','site_settings']);
export const REQUIRED_TABLES = Object.freeze([...LEGACY_TABLES,...CMS_TABLES]);

function hasBroadCmsRead(p) {
  if (p?.cmd !== 'SELECT' || p?.permissive !== 'PERMISSIVE') return false;
  const roles = String(p.roles ?? '').toLowerCase();
  if (!['public','authenticated','anon'].some(role => roles.includes(role))) return false;
  const expression = String(p.qual ?? '').trim();
  return /auth\.role\s*\(\s*\)\s*=\s*'authenticated'/i.test(expression) ||
    /^\(*\s*true\s*\)*$/i.test(expression);
}

/** Reports only table names and issue codes. Personal records are never read. */
export function evaluateRlsPreflight(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.tables) || !Array.isArray(snapshot.policies)) {
    throw new TypeError('Expected metadata-only tables[] and policies[]');
  }
  const findings = [];
  const byName = new Map();
  for (const row of snapshot.tables) {
    if (typeof row?.table_name !== 'string') continue;
    if (byName.has(row.table_name)) {
      findings.push({ table: row.table_name, code: 'DUPLICATE_TABLE_METADATA' });
    }
    byName.set(row.table_name, row);
  }
  for (const table of REQUIRED_TABLES) {
    const row = byName.get(table);
    if (!row) {
      findings.push({ table, code: 'METADATA_MISSING' });
      continue;
    }
    if (row.rls_enabled !== true) findings.push({ table, code: 'RLS_NOT_ENABLED' });
    if (LEGACY_TABLES.includes(table) &&
        ['anon_insert','anon_update','anon_delete'].some(key => row[key] !== false)) {
      findings.push({ table, code: 'ANON_MUTATION_GRANT_UNREVIEWED' });
    }
    if (CMS_TABLES.includes(table)) {
      const policies = snapshot.policies.filter(p => p?.tablename === table);
      if (!Number.isSafeInteger(row.policy_count) || row.policy_count !== policies.length) {
        findings.push({ table, code: 'POLICY_INVENTORY_INCOMPLETE' });
      }
      if (policies.some(hasBroadCmsRead)) {
        findings.push({ table, code: 'BROAD_CMS_READ_POLICY' });
      }
    }
  }
  findings.sort((a,b) => a.table.localeCompare(b.table) || a.code.localeCompare(b.code));
  return { releaseReady: findings.length === 0, checkedTables: REQUIRED_TABLES.length, findings };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  if (!process.argv[2]) {
    console.error('Usage: node tools/security/rls-preflight.mjs <metadata-only-snapshot.json>');
    process.exitCode = 2;
  } else {
    try {
      const result = evaluateRlsPreflight(JSON.parse(readFileSync(process.argv[2], 'utf8')));
      console.log(JSON.stringify(result, null, 2));
      if (!result.releaseReady) process.exitCode = 1;
    } catch (e) {
      console.error('Snapshot rejected: ' + (e instanceof Error ? e.message : 'invalid metadata'));
      process.exitCode = 2;
    }
  }
}
