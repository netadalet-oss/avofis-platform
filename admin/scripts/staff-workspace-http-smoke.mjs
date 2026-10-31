/**
 * P08 live HTTP smoke against the built Next.js *admin* app in CI.
 * All external/client/staff persistence is disabled. No Supabase access.
 * Verifies 503 fail-closed on every protected endpoint including POST/PATCH/
 * DELETE, and that login shell is available without private records.
 */
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {createRequire} from "node:module";
const port=32319,base="http://127.0.0.1:"+port;
const require=createRequire(import.meta.url);
const nextCli=require.resolve("next/dist/bin/next");
const routes=[
 {method:"GET",path:"/api/client-documents"},
 {method:"POST",path:"/api/client-documents",body:{draft_id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",note:"Verified staff note"}},
 {method:"GET",path:"/api/workspace"},
 {method:"GET",path:"/api/workspace?section=people"},
 {method:"GET",path:"/api/workspace/drafts?module=payables"},
 {method:"GET",path:"/api/workspace/grants"},
 {method:"GET",path:"/api/workspace/reviews?module=payables"},
 {method:"GET",path:"/api/workspace/audit"},
 {method:"POST",path:"/api/workspace/drafts",body:{module:"payables",title:"Synthetic note",summary:"Nothing",amount_eur_cents:250}},
 {method:"PATCH",path:"/api/workspace/drafts",body:{module:"payables",id:"11111111-1111-4111-8111-111111111111",state:"review_requested"}},
 {method:"POST",path:"/api/workspace/grants",body:{staff_user_id:"11111111-1111-4111-8111-111111111111",capability:"billing"}},
 {method:"DELETE",path:"/api/workspace/grants",body:{staff_user_id:"11111111-1111-4111-8111-111111111111",capability:"billing"}},
 {method:"POST",path:"/api/workspace/reviews",body:{work_item_id:"11111111-1111-4111-8111-111111111111",decision:"reviewed_internal"}}
];
const child=spawn(process.execPath,[nextCli,"start","-p",String(port)],{
 cwd:process.cwd(),env:{...process.env,AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED:"false",
 AVOFIS_STAFF_GRANTS_ENABLED:"false",AVOFIS_STAFF_INTERNAL_REVIEW_ENABLED:"false",
 AVOFIS_STAFF_WORK_ITEM_WRITES_ENABLED:"false"},stdio:["ignore","pipe","pipe"]});
let serverLog="";
for(const stream of [child.stdout,child.stderr])
 stream.on("data",chunk=>{serverLog+=chunk.toString().slice(0,1200);});
async function waitForServer(){
 for(let attempt=0;attempt<50;attempt++){
  if(child.exitCode!==null)throw Error("Next.js exited: "+serverLog.slice(-1000));
  try{const r=await fetch(base+"/login",{signal:AbortSignal.timeout(800)});
   if(r.status===200)return;
  }catch{}
  await new Promise(resolve=>setTimeout(resolve,180));
 }
 throw Error("Next.js did not start: "+serverLog.slice(-1000));
}
try{
 await waitForServer();
 const login=await fetch(base+"/login");
 assert.equal(login.status,200);
 const html=await login.text();
 assert.match(html,/Güvenli personel girişi/);
 assert.doesNotMatch(html,/service_role|SUPABASE_SERVICE_ROLE_KEY|eyJhbGci/);
 for(const route of routes){
  const opts={method:route.method,headers:{
   "Content-Type":"application/json",
   Authorization:"Bearer synthetic-invalid-jwt-00000000000000000"
  },body:route.body?JSON.stringify(route.body):undefined};
  const r=await fetch(base+route.path,opts);
  const c=r.headers.get("cache-control")||"";
  const body=await r.json();
  assert.equal(r.status,503,route.method+" "+route.path+" "+JSON.stringify(body));
  assert.match(c,/no-store/,"Protected response must not be cached");
  assert.equal(typeof body.error,"string");
  assert.doesNotMatch(JSON.stringify(body),/staff_user_id|access_token|api_key|personalDocument/);
 }
 console.log("PASS: 13/13 protected staff admin HTTP routes fail closed (503, no-store) without real staging");
 console.log("PASS: private login shell 200 without service key / JWT leakage");
}finally{
 child.kill("SIGTERM");
 // Close the real Next process, not an npm wrapper with orphaned children.
 child.stdout?.destroy();child.stderr?.destroy();
}
