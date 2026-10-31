/**
 * Runs ONLY in the GitHub CI disposable Redis service.
 * Verifies the exact Lua script exported by production TypeScript,
 * including atomic over-limit rejection across concurrent clients.
 */
import assert from "node:assert/strict";
import {execFileSync,execFile} from "node:child_process";
import {promisify} from "node:util";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {SHARED_RATE_SCRIPT,RECHTSPRAAK_MAX_CALLS_PER_ROLLING_SEC} from "../src/lib/rechtspraak-shared-rate-limit.ts";
const runAsync=promisify(execFile);
const dir=mkdtempSync(join(tmpdir(),"avofis-redis-"));
const file=join(dir,"rate.lua");
const key="avofis:rechtspraak:ci:"+process.pid;
const seqkey=key+":sequence";
const call=()=>execFileSync("redis-cli",["--raw","--eval",file,key,seqkey,",","1000","8"],{encoding:"utf8"}).trim();
try{
 writeFileSync(file,SHARED_RATE_SCRIPT,"utf8");
 execFileSync("redis-cli",["PING"],{encoding:"utf8"});
 const first=Array.from({length:8},call);
 assert.ok(first.every(v=>v==="1"),"the first 8 calls must be allowed");
 assert.equal(call(),"0","the 9th request within 1 second must be rejected");
 console.log("PASS: shared Redis rolling-window denies request 9/second");
 await new Promise(resolve=>setTimeout(resolve,1150));
 assert.equal(call(),"1","expired window should reopen");
 // Reset only this synthetic namespace; never FLUSHDB.
 execFileSync("redis-cli",["DEL",key,seqkey]);
 const batch=await Promise.all(Array.from({length:32},()=>
  runAsync("redis-cli",["--raw","--eval",file,key,seqkey,",","1000","8"])
   .then(r=>r.stdout.trim())));
 assert.equal(batch.filter(v=>v==="1").length,RECHTSPRAAK_MAX_CALLS_PER_ROLLING_SEC,
  "parallel workers must not oversubscribe upstream");
 assert.equal(batch.filter(v=>v==="0").length,24);
 console.log("PASS: 32 concurrent Redis clients globally allow EXACTLY 8, reject 24");
 console.log("PASS: 1100ms sliding expiry and atomic cross-instance limit");
}finally{
 try{execFileSync("redis-cli",["DEL",key,seqkey]);}catch{}
 rmSync(dir,{recursive:true,force:true});
}
