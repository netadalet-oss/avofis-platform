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
 for(const route of ["/","/hizmetler","/katalog","/islemler","/nasil-calisir","/iletisim","/bilgi","/gizlilik","/cerezler","/diller","/triyaj","/ornek-dosya","/uyum","/ictihat","/yargi-baglantilari","/ornek-yargi-dosyasi","/belge-hazirla","/belge-hazirla?lang=ar&hizmet=konut-kira-sigorta","/katalog?lang=ar","/katalog?lang=ru","/katalog?lang=de","/basvuru","/auth/login","/musteri","/yonetim","/yonetim/ind-inceleme"]){
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
 const draftGet=await check("/api/document-drafts",503);
 assert.match(draftGet.headers.get("cache-control")||"",/no-store/);
 await check("/api/document-drafts",503,"POST");
 await check("/api/document-drafts",503,"PATCH");
 const six=await check("/diller",200);
 const sixHtml=await six.text();
 for(const locale of ["?lang=tr","?lang=nl","?lang=de","?lang=en","?lang=ar","?lang=ru"]){
  assert.ok(sixHtml.includes("/katalog"+locale),"Missing 6-language route "+locale);
 }
 assert.match(sixHtml,/dir="rtl"/,"Arabic RTL block must be present");
 const noGo=await check("/uyum",200);
 assert.match(await noGo.text(),/KAPALI/,"Release status must not claim customer intake enabled");
 const triagePage=await check("/triyaj",200);
 const triageHTML=await triagePage.text();
 assert.match(triageHTML,/GÜVENLİ ÖN YÖNLENDİRME/);
 assert.doesNotMatch(triageHTML,/action="\/api\/intake"/);
 const examplePage=await check("/ornek-dosya",200);
 assert.match(await examplePage.text(),/Örnek müşteri dosyası/);
 const law=await check("/ictihat",200);
 const lawHtml=await law.text();
 for(const e of ["ECLI:NL:HR:2026:1684","ECLI:NL:HR:2026:1682","ECLI:NL:HR:2026:1587"])
  assert.match(lawHtml,new RegExp(e),"Documented real ECLI reference must be source-linked");
 await check("/yargi-baglantilari",200);
 const casePreview=await check("/ornek-yargi-dosyasi",200);
 assert.match(await casePreview.text(),/NOT_SUBMITTED/);
 await check("/api/rechtspraak?ecli=ECLI:NL:HR:2026:1684",503);
 console.log("Route and disabled-action smoke test passed");
}finally{
 server.kill("SIGTERM");
}
