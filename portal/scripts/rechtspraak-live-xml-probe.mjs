/**
 * One-time public-data GET against the official XML endpoint; NO client data,
 * no login, no scraping, no filing. Non-gating CI health probe only.
 * The API is NOT enabled by a passing probe: distributed 10/s limiter and
 * independent approval are still mandatory. Max 1 request / CI run.
 */
import {parseContentMetadata} from "../src/lib/rechtspraak-open-data.ts";
const ecli="ECLI:NL:HR:2026:1684";
const url="https://data.rechtspraak.nl/uitspraken/content?"+
 new URLSearchParams({id:ecli,return:"META"}).toString();
try{
 const r=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(12000),
  headers:{Accept:"application/xml,text/xml"}});
 if(!r.ok)throw Error("UPSTREAM_HTTP_"+r.status);
 const len=Number(r.headers.get("content-length")||0);
 if(len>250000)throw Error("XML_TOO_LARGE");
 const xml=await r.text();if(xml.length>250000)throw Error("XML_TOO_LARGE");
 const meta=parseContentMetadata(xml,ecli);
 if(meta.ecli!==ecli)throw Error("ECLI_MISMATCH");
 console.log("PASS: 1 authentic Rechtspraak Open Data XML metadata response for",ecli);
 console.log("OFFICIAL:",meta.url);
}catch(error){
 console.error("INCONCLUSIVE: live Rechtspraak Open Data XML probe unavailable:",error instanceof Error?error.message:"unknown");
 process.exitCode=1;
}
