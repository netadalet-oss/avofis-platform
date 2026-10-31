import test from "node:test";
import assert from "node:assert/strict";
import {reserveRechtspraakUpstreamSlot,validateRedisEndpoint,
 RECHTSPRAAK_MAX_CALLS_PER_ROLLING_SEC,RECHTSPRAAK_NAMESPACE,
 SHARED_RATE_SCRIPT} from "../src/lib/rechtspraak-shared-rate-limit.ts";

const url="https://eu1-test-118.upstash.io/", token="synthetic-test-token";
test("J05 rejects missing, untrusted or insecure Redis endpoints before any fetch",async()=>{
 let called=false;
 const fetcher=async()=>{called=true;throw Error("MUST_NOT_CALL");};
 for(const candidate of ["http://eu1-test-118.upstash.io/","https://google.com/",
 "https://eu1-test-118.upstash.io/other","https://eu1-test-118.upstash.io/?token=secret",
 "https://name:pass@eu1-test-118.upstash.io/","file:///etc/passwd","https://upstash.io/"]){
  assert.equal(validateRedisEndpoint(candidate),null,candidate);
  const result=await reserveRechtspraakUpstreamSlot({url:candidate,token,fetcher});
  assert.equal(result.allowed,false);
  assert.equal(result.reason,"INVALID_CONFIG");
 }
 assert.equal(called,false);
 assert.equal((await reserveRechtspraakUpstreamSlot({url,token:"",fetcher})).reason,"UNCONFIGURED");
});
test("J05 shared limiter posts exact Redis EVAL shape without visitor data",async()=>{
 let invoked=0;
 const fetcher=async (endpoint,opts)=>{
  invoked++;
  assert.equal(endpoint,url);
  assert.equal(opts.method,"POST");
  assert.equal(opts.headers.Authorization,"Bearer "+token);
  assert.equal(opts.cache,"no-store");
  assert.equal(opts.redirect,"error");
  const parts=JSON.parse(opts.body);
  assert.deepEqual(parts.slice(0,3),["EVAL",SHARED_RATE_SCRIPT,"2"]);
  assert.deepEqual(parts.slice(3,5),[RECHTSPRAAK_NAMESPACE,RECHTSPRAAK_NAMESPACE+":sequence"]);
  assert.deepEqual(parts.slice(-2),["1000","8"]);
  for(const term of ["ECLI:","client_id","password","request.jwt","DigiD","cookie"])assert.equal(opts.body.includes(term),false,term);
  return {ok:true,json:async()=>({result:1})};
 };
 const result=await reserveRechtspraakUpstreamSlot({url,token,fetcher});
 assert.deepEqual(result,{allowed:true,reason:"RESERVED"});
 assert.equal(invoked,1);
 assert.equal(RECHTSPRAAK_MAX_CALLS_PER_ROLLING_SEC,8);
});
test("J05 429/500/broken replies, timeout and HTTP errors never allow provider requests",async()=>{
 for(const response of [
  {ok:true,json:async()=>({result:0}),why:"LIMITED"},
  {ok:true,json:async()=>({result:"1"}),why:"BAD_REPLY"},
  {ok:true,json:async()=>({result:null}),why:"BAD_REPLY"},
  {ok:true,json:async()=>({error:"something failed"}),why:"BACKEND_UNAVAILABLE"},
  {ok:false,status:500,why:"BACKEND_UNAVAILABLE"},
  {ok:true,json:async()=>{throw Error("malformed response")},why:"BACKEND_UNAVAILABLE"}
 ]){
  const r=await reserveRechtspraakUpstreamSlot({url,token,fetcher:async()=>response});
  assert.equal(r.allowed,false);
  assert.equal(r.reason,response.why);
 }
 const dead=await reserveRechtspraakUpstreamSlot({url,token,fetcher:async()=>{throw Error("timeout")}});
 assert.equal(dead.allowed,false);
 assert.equal(dead.reason,"BACKEND_UNAVAILABLE");
});
test("J05 Redis namespace is immutable across tenants and deployments",async()=>{
 const result=await reserveRechtspraakUpstreamSlot({
  url,token,namespace:"avofis:rechtspraak:upstream:dev-only",
  fetcher:async()=>{throw Error("SHOULD_NOT_CALL")}
 });
 assert.deepEqual(result,{allowed:false,reason:"INVALID_CONFIG"});
 assert.match(SHARED_RATE_SCRIPT,/ZREMRANGEBYSCORE/);
 assert.match(SHARED_RATE_SCRIPT,/ZCARD/);
 assert.match(SHARED_RATE_SCRIPT,/ZADD/);
 assert.match(SHARED_RATE_SCRIPT,/PEXPIRE/);
 assert.match(SHARED_RATE_SCRIPT,/redis\.call\("TIME"\)/);
});
