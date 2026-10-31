/**
 * AVOfis Dutch justice supplement J01/J02.
 * Only public Rechtspraak Open Data, never authenticated Mijn Rechtspraak.
 * Server-side static validation; no undocumented "search by text" parameter.
 * Browser input is untrusted and must not become upstream URLs.
 */
export const OPEN_DATA_ROOT = "https://data.rechtspraak.nl/uitspraken/";
export const ECLI_RE = /^ECLI:NL:[A-Z0-9]{2,12}:[0-9]{4}:[A-Z0-9.\-]{1,40}$/;
export const COURTS = ["", "HR", "RVS", "RBAMS", "RBDHA", "RBROT", "RBGEL", "RBZWB", "GHAMS", "GHDHA", "GHSHE"] as const;
export type SearchInput={ecli:string; court:string; dateFrom:string; dateTo:string; law:string; keyword:string; procedure:string;};
export type Entry={ecli:string;title:string;summary:string;updated:string;url:string;};
export const searchDefaults:SearchInput={ecli:"",court:"",dateFrom:"",dateTo:"",law:"",keyword:"",procedure:""};
const validDate=(d:string)=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+"T00:00:00Z"))&&new Date(d+"T00:00:00Z").toISOString().slice(0,10)===d;
export function validatePublicSearch(s:SearchInput):string|null{
 if(s.ecli && !ECLI_RE.test(s.ecli))return "INVALID_ECLI";
 if(!COURTS.includes(s.court as (typeof COURTS)[number]))return "INVALID_COURT";
 if((s.dateFrom&&!validDate(s.dateFrom))||(s.dateTo&&!validDate(s.dateTo)))return "INVALID_DATE";
 if(s.dateFrom&&s.dateTo&&s.dateFrom>s.dateTo)return "DATE_RANGE_REVERSED";
 for(const value of [s.keyword,s.law,s.procedure])if(value.length>90||/[<>\r\n]/.test(value))return "INVALID_FILTER";
 if(s.keyword && !/^[\p{L}\p{M}\p{N} ,.'\-()]{2,90}$/u.test(s.keyword))return "INVALID_KEYWORD";
 if(s.ecli && (s.keyword||s.court||s.dateFrom||s.dateTo||s.law||s.procedure))return "ECLI_EXCLUSIVE";
 if(!s.ecli && !s.dateFrom && !s.dateTo)return "DATE_RANGE_REQUIRED";
 if(!s.ecli && !(s.dateFrom && s.dateTo))return "BOUNDED_DATE_RANGE_REQUIRED";
 const from=s.dateFrom?Date.parse(s.dateFrom+"T00:00:00Z"):0;
 const to=s.dateTo?Date.parse(s.dateTo+"T00:00:00Z"):0;
 if(!s.ecli && (to-from)/86400000>31)return "DATE_RANGE_MAX_31_DAYS";
 return null;
}
export function officialJudgmentUrl(ecli:string){return "https://uitspraken.rechtspraak.nl/details?id="+encodeURIComponent(ecli);}
export function buildOfficialQuery(s:SearchInput){
 const error=validatePublicSearch(s);if(error)throw new Error(error);
 const url=new URL(s.ecli?"content":"zoeken",OPEN_DATA_ROOT);
 if(s.ecli){url.searchParams.set("id",s.ecli);url.searchParams.set("return","META");}
 else{
  // Only officially documented query parameters; NO keyword/court/subject guessing.
  url.searchParams.append("date",s.dateFrom);url.searchParams.append("date",s.dateTo);
  url.searchParams.set("return","DOC");url.searchParams.set("max","20");url.searchParams.set("sort","DESC");
 }
 return url.toString();
}
const unescapeXml=(s:string)=>s.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(Number.parseInt(n,16)))
 .replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(Number(n)))
 .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')
 .replace(/&apos;/g,"'").replace(/&amp;/g,"&");
const textIn=(xml:string,tag:string):string=>{
 const re=new RegExp("<(?:[a-zA-Z0-9_-]+:)?" +tag+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?" +tag+">","i");
 const m=xml.match(re);return m?unescapeXml(m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).slice(0,900):"";
};
export function parseAtomEntries(xml:string):Entry[]{
 if(xml.length>250000)throw new Error("UPSTREAM_XML_TOO_LARGE");
 if(!/<(?:\w+:)?feed[\s>]/i.test(xml))throw new Error("NOT_ATOM");
 const result:Entry[]=[];
 for(const match of xml.matchAll(/<entry\b([^>]*)>([\s\S]*?)<\/entry>/gi)){
  if(/\bdeleted\s*=/.test(match[1]))continue;
  const body=match[2],ecli=textIn(body,"id").trim().toUpperCase();
  if(!ECLI_RE.test(ecli))continue;
  result.push({ecli,title:textIn(body,"title")||ecli,summary:textIn(body,"summary"),
   updated:textIn(body,"updated"),url:officialJudgmentUrl(ecli)});
  if(result.length>=20)break;
 }
 return result;
}
export function matchesLocalFilters(row:Entry,s:SearchInput){
 if(s.court && row.ecli.split(":")[2]!==s.court)return false;
 for(const needle of [s.keyword,s.law,s.procedure])if(needle&&!(row.title+" "+row.summary).toLocaleLowerCase("nl-NL")
  .includes(needle.toLocaleLowerCase("nl-NL")))return false;
 return true;
}
export function parseContentMetadata(xml:string,ecli:string):Entry{
 if(xml.length>250000)throw new Error("UPSTREAM_XML_TOO_LARGE");
 if(!ECLI_RE.test(ecli))throw new Error("INVALID_ECLI");
 if(!xml.includes(ecli))throw new Error("CONTENT_ID_MISMATCH");
 return {ecli,title:textIn(xml,"title")||ecli,summary:textIn(xml,"abstract"),
   updated:textIn(xml,"modified"),url:officialJudgmentUrl(ecli)};
}
