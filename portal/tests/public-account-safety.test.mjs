import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PUBLIC_ACCOUNT_REGISTRATION_ENABLED, PUBLIC_CMS_EDITING_ENABLED } from "../src/lib/launch-gates.ts";

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

test("client-controlled user metadata cannot show privileged CMS editing tools", () => {
  assert.equal(PUBLIC_CMS_EDITING_ENABLED, false);
  const header = read("components/site-header.tsx");
  const home = read("app/page.tsx");
  for (const [name, content, guardCount] of [["header", header, 1], ["home", home, 2]]) {
    assert.ok(content.includes("const isAdmin = false;"), name);
    assert.equal(content.includes("user_metadata?.role"), false, name);
    assert.equal(content.split("if (!PUBLIC_CMS_EDITING_ENABLED)").length - 1, guardCount, name);
  }
});

test("public launch gates cannot be enabled by environment alone", () => {
  const source = read("lib/launch-gates.ts");
  assert.equal(source.includes("process.env"), false);
  assert.equal(source.includes("NEXT_PUBLIC_"), false);
  assert.ok(source.includes("PUBLIC_ACCOUNT_REGISTRATION_ENABLED = false"));
  assert.ok(source.includes("PUBLIC_CMS_EDITING_ENABLED = false"));
});
