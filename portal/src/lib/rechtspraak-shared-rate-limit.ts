/**
 * AVOfis J05: cross-instance upstream budget, SHARED by every AVOfis Vercel
 * instance/deployment using the same Redis URL + namespace.
 * The official limit is 10 calls/sec. Reserve 2/s headroom and allow 8
 * calls in ANY rolling 1000ms, using an atomic Redis Lua script.
 * NEVER send search terms, ECLI, IPs, cookies or visitor data to Redis.
 *
 * Requires separately provisioned HTTPS Upstash Redis and a reviewed release.
 * Missing credentials, latency, errors, ambiguous replies -> DENY.
 * This does NOT itself enable the public API.
 */
export const RECHTSPRAAK_MAX_CALLS_PER_ROLLING_SEC=8;
export const RECHTSPRAAK_WINDOW_MS=1000;
export const RECHTSPRAAK_NAMESPACE="avofis:rechtspraak:upstream:global:v1";
export const SHARED_RATE_SCRIPT=[
 'local key = KEYS[1]',
 'local seqkey = KEYS[2]',
 'local t = redis.call("TIME")',
 'local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)',
 'local window = tonumber(ARGV[1])',
 'local limit = tonumber(ARGV[2])',
 'redis.call("ZREMRANGEBYSCORE", key, "-inf", now - window)',
 'local current = redis.call("ZCARD", key)',
 'if current >= limit then return 0 end',
 'local seq = redis.call("INCR", seqkey)',
 'redis.call("ZADD", key, now, tostring(now)..":"..tostring(seq))',
 'redis.call("PEXPIRE", key, 2000)',
 'redis.call("PEXPIRE", seqkey, 2000)',
 'return 1'
].join("\n");
type RateDecision={allowed:boolean;reason:
 "RESERVED"|"UNCONFIGURED"|"INVALID_CONFIG"|"LIMITED"|"BACKEND_UNAVAILABLE"|"BAD_REPLY"};
type RedisResponse={result?:unknown;error?:unknown};
export function validateRedisEndpoint(raw:string):string|null{
 try{
  const uri=new URL(raw);
  if(uri.protocol!=="https:"||!/^[a-z0-9-]+\.upstash\.io$/.test(uri.hostname)||
   uri.username||uri.password||uri.port||uri.pathname!=="/"||
   uri.search||uri.hash)return null;
  return uri.href;
 }catch{return null;}
}
export async function reserveRechtspraakUpstreamSlot(
 input:{url?:string;token?:string;namespace?:string;
  fetcher?:typeof fetch;signal?:AbortSignal}={}
):Promise<RateDecision>{
 const url=input.url??process.env.UPSTASH_REDIS_REST_URL;
 const token=input.token??process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token)return {allowed:false,reason:"UNCONFIGURED"};
 const endpoint=validateRedisEndpoint(url);
 if(!endpoint||token.length<8||token.length>4096||
  (input.namespace!==undefined && input.namespace!==RECHTSPRAAK_NAMESPACE))
  return {allowed:false,reason:"INVALID_CONFIG"};
 const fetcher=input.fetcher??fetch;
 const keys=[RECHTSPRAAK_NAMESPACE,RECHTSPRAAK_NAMESPACE+":sequence"];
 try{
  const response=await fetcher(endpoint,{
   method:"POST",redirect:"error",cache:"no-store",
   headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
   body:JSON.stringify(["EVAL",SHARED_RATE_SCRIPT,"2",...keys,
    String(RECHTSPRAAK_WINDOW_MS),String(RECHTSPRAAK_MAX_CALLS_PER_ROLLING_SEC)]),
   signal:input.signal??AbortSignal.timeout(1800)
  });
  if(!response.ok)return {allowed:false,reason:"BACKEND_UNAVAILABLE"};
  const data:RedisResponse=await response.json();
  if(data.error!==undefined)return {allowed:false,reason:"BACKEND_UNAVAILABLE"};
  if(data.result===1)return {allowed:true,reason:"RESERVED"};
  if(data.result===0)return {allowed:false,reason:"LIMITED"};
  return {allowed:false,reason:"BAD_REPLY"};
 }catch{return {allowed:false,reason:"BACKEND_UNAVAILABLE"};}
}
