import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function isSensitiveEnvPath(value) {
  if (typeof value !== 'string') throw new TypeError('Expected repository path');
  const clean = value.replaceAll('\\', '/');
  return clean.split('/').some(segment => segment === '.env' ||
    (segment.startsWith('.env.') && segment !== '.env.example'));
}

export function findTrackedSensitiveEnv(paths) {
  if (!Array.isArray(paths)) throw new TypeError('Expected tracked file paths');
  return paths.filter(isSensitiveEnvPath).sort();
}

export function inspectGitIndex() {
  const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  const output = spawnSync('git', ['ls-files', '-z'], {cwd: root, encoding: 'utf8', maxBuffer: 2_000_000});
  if (output.error || output.status !== 0) throw new Error('Cannot inspect repository index');
  const names = output.stdout.split('\0').filter(Boolean);
  return {tracked_count: names.length, forbidden_paths: findTrackedSensitiveEnv(names)};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = inspectGitIndex();
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  if (report.forbidden_paths.length > 0) process.exitCode = 2;
}
