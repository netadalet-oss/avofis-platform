"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const filename = path.join(root, "src/lib/admin-login-access.ts");
const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  fileName: filename,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const m = { exports: {} };
new Function("module", "exports", js)(m, m.exports);
const { verifyAdminLoginAccess } = m.exports;

function fake(opts = {}) {
  const calls = [];
  let identityChecks = 0;
  const client = {
    auth: {
      async getUser() {
        calls.push("getUser");
        identityChecks++;
        if (opts.authThrows) throw Error("synthetic auth offline");
        const id = identityChecks === 2 && Object.hasOwn(opts, "secondId")
          ? opts.secondId : (Object.hasOwn(opts, "id") ? opts.id : "synthetic-admin");
        return {
          data: { user: id ? { id, user_metadata: { role: "admin" } } : null },
          error: opts.authError ? { message: "denied" } : null
        };
      },
      mfa: {
        async getAuthenticatorAssuranceLevel() {
          calls.push("mfa");
          if (opts.mfaThrows) throw Error("synthetic mfa timeout");
          return {
            data: opts.mfaNull ? null : { currentLevel: opts.aal ?? "aal2" },
            error: opts.mfaError ? { message: "denied" } : null
          };
        }
      }
    },
    from(table) {
      calls.push(["from", table]);
      return {
        select(field) {
          calls.push(["select", field]);
          return {
            eq(column, value) {
              calls.push(["eq", column, value]);
              return {
                async maybeSingle() {
                  calls.push("maybeSingle");
                  if (opts.roleThrows) throw Error("synthetic RLS outage");
                  return {
                    data: opts.roleMissing ? null :
                      { role: Object.hasOwn(opts, "role") ? opts.role : "admin" },
                    error: opts.roleError ? { message: "denied" } : null
                  };
                }
              };
            }
          };
        }
      };
    }
  };
  return { client, calls };
}

test("database admin, AAL2, stable identity grants only a client navigation hint", async () => {
  const { client, calls } = fake();
  assert.deepEqual(await verifyAdminLoginAccess(client),
    { allowed: true, reason: "VERIFIED_ADMIN_AAL2" });
  assert.deepEqual(calls, [
    "getUser", ["from", "avofis_staff"], ["select", "role"],
    ["eq", "user_id", "synthetic-admin"], "maybeSingle", "mfa", "getUser"
  ]);
});

test("nonadmin user_metadata may never grant admin navigation", async () => {
  const { client, calls } = fake({ role: "member" });
  assert.deepEqual(await verifyAdminLoginAccess(client),
    { allowed: false, reason: "NOT_ADMIN" });
  assert.equal(calls.includes("mfa"), false);
});
for (const role of ["operator", "user", "super_admin", "ADMIN", "", null]) {
  test("unknown/not-exact-admin staff role is denied: " + String(role), async () => {
    const { client } = fake({ role });
    assert.deepEqual(await verifyAdminLoginAccess(client),
      { allowed: false, reason: "NOT_ADMIN" });
  });
}
test("AAL1 and missing MFA must never lead to the CMS", async () => {
  for (const aal of ["aal1", "none", "aal3"]) {
    assert.deepEqual(await verifyAdminLoginAccess(fake({ aal }).client),
      { allowed: false, reason: "MFA_REQUIRED" });
  }
});
test("MFA error, missing AAL and provider exception all fail closed", async () => {
  for (const opts of [{ mfaError:true }, { mfaNull:true }, { mfaThrows:true }]) {
    assert.deepEqual(await verifyAdminLoginAccess(fake(opts).client),
      { allowed: false, reason: "VERIFY_FAILED" });
  }
});
test("identity absent, changed mid-check, or Auth outage is a denial", async () => {
  assert.deepEqual(await verifyAdminLoginAccess(fake({ id:null }).client),
    { allowed:false, reason:"NO_SESSION" });
  assert.deepEqual(await verifyAdminLoginAccess(fake({ secondId:"other" }).client),
    { allowed:false, reason:"VERIFY_FAILED" });
  assert.deepEqual(await verifyAdminLoginAccess(fake({ authError:true }).client),
    { allowed:false, reason:"NO_SESSION" });
  assert.deepEqual(await verifyAdminLoginAccess(fake({ authThrows:true }).client),
    { allowed:false, reason:"VERIFY_FAILED" });
});
test("no staff row, denied RLS or role lookup failure are denials", async () => {
  for (const opts of [{ roleMissing:true }, { roleError:true }, { roleThrows:true }]) {
    const {client} = fake(opts);
    const result = await verifyAdminLoginAccess(client);
    assert.equal(result.allowed, false);
  }
});
test("all admin login entrypoints check DB role and AAL2 before navigating", () => {
  const current = fs.readFileSync(path.join(root, "src/app/auth/login/page.tsx"), "utf8");
  const legacy = fs.readFileSync(path.join(root, "src/app/login/page.tsx"), "utf8");
  assert.match(current, /verifyAdminLoginAccess\(supabase\)/);
  assert.match(legacy, /verifyAdminLoginAccess\(supabase\)/);
  assert.match(current, /access\.allowed/);
  assert.match(legacy, /access\.allowed/);
  assert.doesNotMatch(current, /user_metadata\?\.role/);
  assert.doesNotMatch(legacy, /user_metadata\?\.role/);
});
