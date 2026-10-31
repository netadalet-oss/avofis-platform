import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = readFileSync(new URL('../../admin/src/app/cms/page.tsx', import.meta.url), 'utf8');
test('admin CMS page contains valid JSX source, not copied markdown instructions', () => {
  assert.ok(page.startsWith('import Link from "next/link";'));
  assert.doesNotMatch(page, /```|Bunu aynen güncellenmiş haliyle değiştir/);
  assert.match(page, /export default function CmsPage/);
});
test('unverified CMS page performs no reads or writes of private data', () => {
  assert.doesNotMatch(page, /\.from\(|\.upsert\(|\.insert\(|\.update\(|\.delete\(|createClient\(|user_metadata\??\.role/);
  assert.match(page, /henüz kullanıma açık değildir/);
  assert.match(page, /ikinci kişinin yayın onayı/);
});
