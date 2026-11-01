import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PUBLIC_ACCOUNT_REGISTRATION_ENABLED, PUBLIC_ACCOUNT_LOGIN_ENABLED, PUBLIC_CMS_EDITING_ENABLED } from "../src/lib/launch-gates.ts";

const read = (relative) => readFileSync(new URL("../src/" + relative, import.meta.url), "utf8");

test("all public professional registration and account creation remain closed", () => {
  assert.equal(PUBLIC_ACCOUNT_REGISTRATION_ENABLED, false);
  const page = read("app/auth/register/page.tsx");
  assert.ok(page.includes("Hesap açılışı şu anda kapalı"));
  assert.ok(page.includes("Yeni kullanıcı kaydı etkin değildir"));
  assert.ok(page.includes("kişisel veri istemez"));
  for (const prohibited of ['auth.signUp(', '.from("profiles")', '.upsert(', '<form', '<input', 'user_metadata']) {
    assert.equal(page.includes(prohibited), false, prohibited);
  }
});

test("public client login cannot take credentials or create a Supabase session", () => {
  assert.equal(PUBLIC_ACCOUNT_LOGIN_ENABLED, false);
  const page = read("app/auth/login/page.tsx");
  assert.ok(page.includes("Müşteri girişi şu anda kapalı"));
  assert.ok(page.includes("PUBLIC_ACCOUNT_LOGIN_ENABLED"));
  assert.ok(page.includes("robots: { index: false"));
  for (const forbidden of [
    "signInWithPassword(", "auth.getSession(", "auth.getUser(", "user_metadata",
    ".from(", ".upsert(", "<form", "<input", "@/" + "lib/supabase"
  ]) assert.equal(page.includes(forbidden), false, forbidden);
});

test("canonical public pages cannot expose a legacy CMS editor or client role grant", () => {
  assert.equal(PUBLIC_CMS_EDITING_ENABLED, false);
  for (const path of ["components/site-header.tsx", "app/page.tsx"]) {
    const page = read(path);
    for (const bad of ["user_metadata", "EditModeProvider", "useEditMode",
      ".upsert(", ".insert(", ".update(", "saveContentField",
      "saveHeroField", "PUBLIC_CMS_CONTENT_READER_ENABLED"]) {
      assert.equal(page.includes(bad), false, path + ": " + bad);
    }
  }
});

test("public launch gates cannot be enabled by environment alone", () => {
  const source = read("lib/launch-gates.ts");
  assert.equal(source.includes("process.env"), false);
  assert.equal(source.includes("NEXT_PUBLIC_"), false);
  assert.ok(source.includes("PUBLIC_ACCOUNT_REGISTRATION_ENABLED = false"));
  assert.ok(source.includes("PUBLIC_ACCOUNT_LOGIN_ENABLED = false"));
  assert.ok(source.includes("PUBLIC_CMS_EDITING_ENABLED = false"));
});
