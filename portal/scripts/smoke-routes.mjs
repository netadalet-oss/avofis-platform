import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import assert from "node:assert/strict";

const require=createRequire(import.meta.url);
const bin=require.resolve("next/dist/bin/next");
const port=3187;
const url="http://127.0.0.1:"+port;
const cwd=fileURLToPath(new URL("../",import.meta.url));
const server=spawn(process.execPath,[bin,"start","-p",String(port),"-H","127.0.0.1"],{
 cwd,env:{...process.env,AVOFIS_LEGAL_READY:"false",AVOFIS_INTAKE_ENABLED:"false",AVOFIS_PAYMENT_ENABLED:"false"},
 stdio:["ignore","pipe","pipe"]
});
let output="";
server.stdout.on("data",x=>{output+=String(x).slice(-500);});
server.stderr.on("data",x=>{output+=String(x).slice(-500);});
async function waitUntilReady(){
 for(let attempt=0;attempt<80;attempt++){
  if(server.exitCode!==null)throw new Error("Next server exited: "+output.slice(-1500));
  try{const response=await fetch(url,{signal:AbortSignal.timeout(800)});if(response.ok)return;}
  catch{}
  await sleep(500);
 }
 throw new Error("Next server did not become ready: "+output.slice(-1500));
}
async function check(path,expected,method="GET"){
 const result=await fetch(url+path,{method,redirect:"manual",headers:method==="POST"?{"Content-Type":"application/json"}:{},body:method==="POST"?"{}":undefined,signal:AbortSignal.timeout(8000)});
 assert.equal(result.status,expected,path+" should be "+expected+" but is "+result.status);
 console.log(method+" "+path+" → "+result.status);
 return result;
}
try{
 await waitUntilReady();
 for(const route of ["/","/hizmetler","/islemler","/nasil-calisir","/iletisim","/bilgi","/gizlilik","/basvuru","/auth/login","/musteri","/yonetim"]){
  const response=await check(route,200);
  assert.match(response.headers.get("content-type")||"",/text\/html/,route+" content type");
 }
 const journey=await check("/islemler?lang=nl",200);
 const html=await journey.text();
 assert.match(html,/AVOfis/, "Brand should be present");
 const forum=await fetch(url+"/forum",{redirect:"manual",signal:AbortSignal.timeout(8000)});
 assert.ok([301,302,303,307,308].includes(forum.status),"Old forum must redirect");
 await check("/api/intake",503,"POST");
 await check("/api/payments/checkout",503,"POST");
 console.log("Route and disabled-action smoke test passed");
}finally{
 server.kill("SIGTERM");
}
