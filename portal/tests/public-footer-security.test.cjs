"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const footer = fs.readFileSync(path.join(root, "src/components/site-footer.tsx"), "utf8");
const progress = fs.readFileSync(path.join(root, "src/app/ilerleme/page.tsx"), "utf8");

test("public footer does not trust user-editable metadata or expose a CMS writer", () => {
  for (const forbidden of [
    /user_metadata/i,
    /\.upsert\s*\(/,
    /\.insert\s*\(/,
    /\.update\s*\(/,
    /\.delete\s*\(/,
    /supabase/i,
    /useUser\s*\(/,
    /useEditMode\s*\(/,
    /onClick\s*=/,
    /Footer Düzenle/,
  ]) {
    // Comments are not authority: a public CMS writer must not exist in this component.
    assert.doesNotMatch(footer.replace(/\/\*[\s\S]*?\*\//g, ""), forbidden);
  }
  assert.match(footer, /footerColumns\.map/);
  assert.match(footer, /href="\/ilerleme"/);
});

test("public progress route names its evidence limits and never asks for personal information", () => {
  for (const title of [
    "Bu dönem ne değişti?",
    "Şimdi neredeyiz?",
    "Sırada ne var?",
    "Önemli sınır",
  ]) {
    assert.ok(progress.includes(title), title);
  }
  assert.match(progress, /1 Kasım 2026/);
  assert.doesNotMatch(progress, /Son doğrulanan CI kodu: 856ea77d/);
  assert.match(progress, /Her kodun CI sonucu ilgili GitHub PR/);
  assert.match(progress, /Kamu sayfaları yalnız AVOfis hizmet, işlem ve hukukî hazırlık kapsamına göre düzenlendi/);
  assert.match(progress, /bağımsız ürün kabulü\s+veya üretim yayını beyanı değildir/);
  assert.match(progress, /kişisel belge gönderimi/);
  assert.match(progress, /robots:\s*\{\s*index:\s*false/);
  for (const forbidden of [
    /from\s+["']@\/lib\/supabase["']/,
    /fetch\s*\(/,
    /localStorage/,
    /sessionStorage/,
    /form\s+action/,
    /onSubmit/,
  ]) {
    assert.doesNotMatch(progress, forbidden);
  }
});

test("no public footer role authorization remains in the production source", () => {
  assert.doesNotMatch(footer, /isAdmin\s*=|role\s*===\s*["']admin|authLoading/);
  assert.match(footer, /Aktif hukukî temsil veya müşteri dosyası kabulü sunulmaz/);
});
