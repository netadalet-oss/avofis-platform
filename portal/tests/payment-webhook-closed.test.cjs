"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Exact source under test; no real provider, customer request, payment or DB.
const webhook = fs.readFileSync(path.join(__dirname,"../src/app/api/payments/webhook/route.ts"),"utf8");
const release = fs.readFileSync(path.join(__dirname,"../src/lib/release-authorization.ts"),"utf8");

function loadWebhookWithDeniedRelease() {
  const result = ts.transpileModule(webhook,{
    fileName:"route.ts",
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
  });
  let gateChecks=0;
  class FakeResponse {
    constructor(body,options={}) {
      this.body=body;
      this.status=options.status??200;
      this.headers=options.headers??{};
    }
  }
  const deps = {
    "next/server":{NextResponse:FakeResponse},
    "@supabase/supabase-js":{createClient:()=>{throw Error("DB must never be called");}},
    "@/lib/release-authorization":{paymentsReleased:()=>{gateChecks++;return false;}}
  };
  const m={exports:{}};
  new Function("require","module","exports",result.outputText)(
    (name)=>Object.hasOwn(deps,name)?deps[name]:require(name),m,m.exports
  );
  return {POST:m.exports.POST,getGateChecks:()=>gateChecks};
}

test("payment webhook refuses before reading request body or contacting any provider", async()=>{
  const route=loadWebhookWithDeniedRelease();
  const request=new Proxy({},{
    get(_target,property){throw Error("Request touched before release gate: "+String(property));}
  });
  const response=await route.POST(request);
  assert.equal(route.getGateChecks(),1);
  assert.equal(response.status,503);
  assert.equal(response.headers["Cache-Control"],"no-store");
});

test("webhook and checkout share the signed payment release gate",()=>{
  const checkout=fs.readFileSync(path.join(__dirname,"../src/app/api/payments/checkout/route.ts"),"utf8");
  assert.match(checkout,/if\(!paymentsReleased\(\)\)/);
  assert.match(webhook,/if\(!paymentsReleased\(\)\)/);
  assert.match(release,/activeReleaseEvidence:\s*ReleaseEvidence\s*\|\s*null\s*=\s*null/);
  assert.ok(webhook.indexOf("if(!paymentsReleased())")<webhook.indexOf("process.env.MOLLIE_API_KEY"));
  assert.ok(webhook.indexOf("if(!paymentsReleased())")<webhook.indexOf("request.formData()"));
});
