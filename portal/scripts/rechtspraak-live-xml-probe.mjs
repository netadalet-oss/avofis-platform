/**
 * Two bounded public-data GETs against the official XML endpoint; NO client data,
 * no login, no scraping, no filing. Non-gating CI health probe only.
 * The API is NOT enabled by a passing probe: distributed 10/s limiter and
 * independent approval are still mandatory. Max 2 requests / CI run, spaced by >1 second.
 */
import {parseContentMetadata,parseAtomEntries,buildOfficialQuery,searchDefaults} from "../src/lib/rechtspraak-open-data.ts";
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
 // A separate single bounded ECLI-index GET confirms REAL Atom behaviour.
 // 1.2 seconds apart to respect the official source's maximum 10/sec.
 await new Promise(resolve=>setTimeout(resolve,1200));
 const feedUrl=buildOfficialQuery({...searchDefaults,dateFrom:"2026-10-16",dateTo:"2026-10-16"});
 const feedResponse=await fetch(feedUrl,{redirect:"error",signal:AbortSignal.timeout(12000),
  headers:{Accept:"application/atom+xml,application/xml,text/xml"}});
 if(!feedResponse.ok)throw Error("INDEX_HTTP_"+feedResponse.status);
 const feedLength=Number(feedResponse.headers.get("content-length")||0);
 if(feedLength>250000)throw Error("INDEX_XML_TOO_LARGE");
 const feedXml=await feedResponse.text();
 const entries=parseAtomEntries(feedXml);
 if(entries.length<1)throw Error("INDEX_NO_ECLI_ENTRIES");
 for(const item of entries)
  if(!item.ecli.startsWith("ECLI:NL:"))throw Error("INDEX_UNSAFE_ID");
 console.log("PASS: authentic Rechtspraak /zoeken Atom XML, entries:",entries.length);
 console.log("INDEX:",feedUrl);

}catch(error){
 console.error("INCONCLUSIVE: live Rechtspraak metadata/index XML probe unavailable:",error instanceof Error?error.message:"unknown");
 process.exitCode=1;
}
