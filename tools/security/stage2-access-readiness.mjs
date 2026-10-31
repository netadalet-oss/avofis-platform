import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const snapshotFile = path.resolve(here, '../../docs/security/seviye2-canli-rls-metadata-2026-10-31.json');
export const expectedLegacy = Object.freeze(['applications', 'jobs', 'media_assets', 'office_members', 'offices', 'posts', 'topics']);
export const expectedCms = Object.freeze(['pages', 'site_settings']);

export function assessAccess(snapshot) {
  if (!snapshot || snapshot.observation_kind !== 'read_only_postgresql_catalog_metadata' ||
      snapshot.production_modified !== false || snapshot.status !== 'OPEN_RISK_NOT_REMEDIATED' ||
      snapshot.stage_1_independently_accepted !== 0 || snapshot.requirements_total !== 594 ||
      snapshot.blockers_open !== 18) {
    throw new Error('Missing or falsified source, Seviye 1 carryover, or production safety guard');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.observed_on) ||
      !Array.isArray(snapshot.tables) || snapshot.tables.length !== 9 ||
      !Array.isArray(snapshot.cms_policy_inventory) || snapshot.cms_policy_inventory.length !== 6) {
    throw new Error('Catalog metadata is incomplete');
  }
  const expected = [...expectedLegacy, ...expectedCms];
  const names = snapshot.tables.map(x => x?.name);
  if (new Set(names).size !== 9 || expected.some(x => !names.includes(x))) {
    throw new Error('Missing, duplicate, or unexpected public table');
  }
  for (const table of snapshot.tables) {
    if (typeof table.rls_enabled !== 'boolean' ||
        !Array.isArray(table.anon_crud) || table.anon_crud.length !== 4 ||
        !Array.isArray(table.authenticated_crud) || table.authenticated_crud.length !== 4 ||
        !table.anon_crud.every(x => typeof x === 'boolean') ||
        !table.authenticated_crud.every(x => typeof x === 'boolean')) {
      throw new Error('Invalid catalog privileges or RLS state for ' + table.name);
    }
  }
  const policies = snapshot.cms_policy_inventory;
  if (new Set(policies.map(x => x.table + ':' + x.policy)).size !== policies.length ||
      policies.some(x => !expectedCms.includes(x.table) || !['SELECT', 'UPDATE'].includes(x.command) ||
        typeof x.qualifier !== 'string')) {
    throw new Error('Invalid or duplicated CMS policy metadata');
  }
  const unguarded = snapshot.tables.filter(t =>
    expectedLegacy.includes(t.name) && !t.rls_enabled && t.anon_crud.some(Boolean));
  const broadRead = policies.filter(p => p.command === 'SELECT' &&
    /auth\.role\(\)\s*=\s*'authenticated'/.test(p.qualifier));
  const cmsWithRls = snapshot.tables.filter(t => expectedCms.includes(t.name) && t.rls_enabled);
  return {
    observation_date: snapshot.observed_on,
    catalog_tables_checked: 9,
    legacy_tables_without_rls_and_anon_privileges: unguarded.map(t => t.name).sort(),
    legacy_table_risks: unguarded.length,
    cms_tables_with_rls: cmsWithRls.map(t => t.name).sort(),
    cms_broad_authenticated_read_policies: broadRead.map(p => p.table + ':' + p.policy).sort(),
    cms_policy_risks: broadRead.length,
    stage_1_independently_accepted: 0,
    requirements_total: 594,
    blockers_open: 18,
    live_change_performed: false,
    independent_staging_tested: false,
    safe_to_mark_B01_B02_resolved: false,
    ready_for_production: false
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = assessAccess(JSON.parse(fs.readFileSync(snapshotFile, 'utf8')));
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (process.argv.includes('--fail-on-open-risk') &&
      (result.legacy_table_risks !== 0 || result.cms_policy_risks !== 0)) process.exitCode = 2;
}
