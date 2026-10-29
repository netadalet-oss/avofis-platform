import {NextRequest,NextResponse} from "next/server";
import {buildOfficialQuery,matchesLocalFilters,parseAtomEntries,parseContentMetadata,
 searchDefaults,validatePublicSearch,type SearchInput} from "@/lib/rechtspraak-open-data";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const fail=(status:number,message:string)=>NextResponse.json({error:message,source:"Rechtspraak Open Data",officialData:false},{status,headers:{"Cache-Control":"no-store"}});
/**
 * NO AUTOMATIC OPENING: public interface may display official cited examples
 * while server upstream is disabled. Multi-instance production needs a proven
 * *distributed* shared 10 calls/s limiter, written approval, monitoring and
 * data-source change handling. This in-process 1/2sec bound is insufficient
 * by itself across Vercel instances.
 */
const LIVE_PUBLIC_API_ENABLED=false;
let lastOutbound=0;
const cache=new Map<string,{expires:number,value:unknown}>();
export async function GET(req:NextRequest){
 if(!LIVE_PUBLIC_API_ENABLED || process.env.AVOFIS_RECHTSPRAAK_OPEN_DATA_ENABLED!=="true")
   return fail(503,"NOT_ENABLED_PENDING_SHARED_RATE_LIMIT_VALIDATION");
 const q=req.nextUrl.searchParams;
 const allow=new Set(["ecli","court","dateFrom","dateTo","law","keyword","procedure"]);
 if([...q.keys()].some(key=>!allow.has(key))||q.size>7)return fail(400,"UNKNOWN_PARAMETER");
 const s:SearchInput={...searchDefaults,...Object.fromEntries([...allow].map(k=>[k,q.get(k)||""]))};
 const issue=validatePublicSearch(s);if(issue)return fail(400,issue);
 const official=buildOfficialQuery(s);
 const cacheKey=JSON.stringify(s);
 const now=Date.now(),hit=cache.get(cacheKey);if(hit&&hit.expires>now){
  const data=hit.value as {results:unknown[]};return NextResponse.json({
   ...data,fromCache:true},{headers:{"Cache-Control":"private, max-age=60"}});
 }
 if(cache.size>120)cache.clear();
 // Local per-instance budget. A global limit is mandatory before enabling.
 if(now-lastOutbound<2000)return fail(429,"LOCAL_UPSTREAM_RATE_LIMIT");
 lastOutbound=now;
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7000);
  let response:Response;
  try{response=await fetch(official,{signal:controller.signal,redirect:"error",
     headers:{Accept:"application/xml,application/atom+xml,text/xml"},
     cache:"no-store"});}finally{clearTimeout(timer);}
  if(!response.ok)return fail(502,"UPSTREAM_HTTP_"+response.status);
  const length=Number(response.headers.get("content-length")||0);
  if(length>250000)return fail(502,"UPSTREAM_XML_TOO_LARGE");
  const xml=await response.text();if(xml.length>250000)return fail(502,"UPSTREAM_XML_TOO_LARGE");
  const results=s.ecli?[parseContentMetadata(xml,s.ecli)]:
   parseAtomEntries(xml).filter(row=>matchesLocalFilters(row,s));
  const value={results,source:"Rechtspraak Open Data",officialData:true,
   partialLocalFilters:!s.ecli&&!!(s.court||s.keyword||s.law||s.procedure),
   sourceLink:official,notice:"Local filters apply ONLY to the fetched first 20 ECLI entries. Not a full-text index."};
  cache.set(cacheKey,{expires:now+5*60*1000,value});
  return NextResponse.json(value,{headers:{"Cache-Control":"private, max-age=60"}});
 }catch{return fail(502,"UPSTREAM_UNAVAILABLE");}
}
