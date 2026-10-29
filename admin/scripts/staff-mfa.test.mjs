import test from "node:test";
import assert from "node:assert/strict";
import {evaluateStaffMfa} from "../src/lib/staff-mfa.ts";
const jwt="synthetic-with-no-real-authority-01234567890123";
const fake=(currentLevel,error=null)=>({
 auth:{mfa:{getAuthenticatorAssuranceLevel:async token=>{
  assert.equal(token,jwt,"MFA must check exactly the presented bearer JWT");
  return {data:currentLevel?{currentLevel}:null,error};
 }}}
});
test("P09 only server-verified aal2 can access private staff data",async()=>{
 assert.deepEqual(await evaluateStaffMfa(fake("aal2"),jwt),
  {allowed:true,reason:"AAL2_VERIFIED"});
 for(const level of ["aal1",null,"aal3","", "verified", "true"]){
  const result=await evaluateStaffMfa(fake(level),jwt);
  assert.deepEqual(result,{allowed:false,reason:level?"MFA_REQUIRED":"MFA_UNAVAILABLE"});
 }
});
test("P09 broken identity provider, error, omitted JWT are always denied",async()=>{
 assert.deepEqual(await evaluateStaffMfa(fake("aal2"),""),
  {allowed:false,reason:"MFA_REQUIRED"});
 assert.deepEqual(await evaluateStaffMfa(fake("aal2",new Error("network")),jwt),
  {allowed:false,reason:"MFA_UNAVAILABLE"});
 const db={auth:{mfa:{getAuthenticatorAssuranceLevel:async()=>{throw Error("timeout")}}}};
 assert.deepEqual(await evaluateStaffMfa(db,jwt),
  {allowed:false,reason:"MFA_UNAVAILABLE"});
});
test("P09 assurance uses token not client metadata, role or query parameters",async()=>{
 let actual;
 const db={auth:{mfa:{getAuthenticatorAssuranceLevel:async t=>{
  actual=t;return {data:{currentLevel:"aal2"},error:null};
 }}}};
 assert.equal((await evaluateStaffMfa(db,jwt)).allowed,true);
 assert.equal(actual,jwt);
});
