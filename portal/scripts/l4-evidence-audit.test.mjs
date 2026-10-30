import test from "node:test";
import assert from "node:assert/strict";
import {inspectL4Evidence,readL4Sources} from "./l4-evidence-audit.mjs";
const fresh=()=>structuredClone(readL4Sources());
test("L4: 973 source items, 2 changed code scopes, 971 unproven, 18 decisions OPEN; L5 hard locked",()=>{
 const r=inspectL4Evidence(fresh());
 assert.deepEqual(r,{tracked:973,codeChanged:2,unproven:971,
  accepted:0,openDecisions:18,l5Locked:true,ciSynthetic:
   readL4Sources().plan.implementationEvidence.filter(x=>x.status==="CI_SYNTHETIC_VERIFIED").length});
});
test("L4: cannot call any open design decision resolved or unlock L5",()=>{
 const a=fresh();a.decisions.items[0].state="CLOSED";
 assert.throws(()=>inspectL4Evidence(a),/OPEN/);
 const b=fresh();b.plan.approvals.L5="OPEN";
 assert.throws(()=>inspectL4Evidence(b),/LOCKED/);
 const c=fresh();c.plan.openDecisions.pop();
 assert.throws(()=>inspectL4Evidence(c),/18/);
});
test("L4: cannot fabricate accepted work, alter denominator or move an original source",()=>{
 const a=fresh();a.plan.implementationEvidence[0].independentAcceptance=true;
 assert.throws(()=>inspectL4Evidence(a),/independent acceptance/);
 const b=fresh();b.plan.denominator.tracked=972;
 assert.throws(()=>inspectL4Evidence(b),/973/);
 const c=fresh();c.atomic[0].parentL0="L0-08";
 assert.throws(()=>inspectL4Evidence(c),/R-001/);
 const d=fresh();d.atomic.push(d.atomic[0]);
 assert.throws(()=>inspectL4Evidence(d),/duplicate canonical source IDs/);
});
test("L4: no invented source ID or missing audited code/test file",()=>{
 const a=fresh();a.plan.implementationEvidence[0].id="R-999";
 assert.throws(()=>inspectL4Evidence(a),/fabricated implementation ID/);
 const b=fresh();b.plan.implementationEvidence[0].codePaths=["portal/src/lib/does-not-exist.ts"];
 assert.throws(()=>inspectL4Evidence(b),/missing actual source/);
 const c=fresh();c.plan.implementationEvidence[0].testPaths=["portal/scripts/../secret.mjs"];
 assert.throws(()=>inspectL4Evidence(c),/path traversal/);
});
test("L4: unverified CI cannot be asserted successful",()=>{
 const a=fresh();a.plan.implementationEvidence[0].status="CI_SYNTHETIC_VERIFIED";
 assert.throws(()=>inspectL4Evidence(a),/actions\/runs/);
});
