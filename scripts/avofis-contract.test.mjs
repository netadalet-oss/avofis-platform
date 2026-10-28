import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const file=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const original=file("portal/src/lib/avofis-site.ts");
const expanded=file("portal/src/lib/avofis-expanded.ts");
const groupSrc=file("portal/src/lib/avofis-groups.ts");
const API=file("portal/src/app/api/intake/route.ts");
const payment=file("portal/src/app/api/payments/checkout/route.ts");
const client=file("portal/src/app/musteri/page.tsx");
const staff=file("portal/src/app/yonetim/page.tsx");
const assessment=file("portal/src/components/avofis/StaffCaseAssessment.tsx");
const baseMigration=file("database/migrations/20261029_avofis_case_clearance.sql");
const additionalMigration=file("database/migrations/20261030_avofis_scope_and_audit.sql");
const slugs=(source)=>[...source.matchAll(/\bslug:"([^"]+)"/g)].map(x=>x[1]);

test("the 17 services and 14 audiences have distinct route slugs",()=>{
 const services=[...slugs(original.split("export type Audience")[0]),...slugs(expanded.split("export const extraAudiences")[0])];
 const audiences=[...slugs(original.split("export const audiences:Audience[]=")[1].split("export const processSteps")[0]),...slugs(expanded.split("export const extraAudiences")[1])];
 assert.equal(services.length,17);
 assert.equal(new Set(services).size,services.length);
 assert.equal(audiences.length,14);
 assert.equal(new Set(audiences).size,audiences.length);
 const section=groupSrc.split("export const featuredServiceSlugs")[0];
 const grouped=[...section.matchAll(/\bslugs:\[([\s\S]*?)\]/g)].flatMap(m=>[...m[1].matchAll(/"([^"]+)"/g)].map(v=>v[1]));
 assert.equal(grouped.length,services.length);
 assert.deepEqual(new Set(grouped),new Set(services));
});

test("every public enquiry country is valid in the server",()=>{
 const list=original.split("export const countryOptions=[")[1].split("export const roleOptions")[0];
 const uiCountries=[...list.matchAll(/value:"([^"]+)"/g)].map(m=>m[1]);
 const allowed=[...API.split("const countries=new Set([")[1].split("]);")[0].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(new Set(uiCountries),new Set(allowed));
});

test("initial enquiries remain explicitly gated and server-side validated",()=>{
 assert.match(API,/AVOFIS_LEGAL_READY/);
 assert.match(API,/AVOFIS_INTAKE_ENABLED/);
 assert.match(API,/TURNSTILE_SECRET_KEY/);
 assert.match(API,/siteverify/);
 assert.match(API,/otherCountry\.length>80/);
 assert.match(API,/secondaryCountry\.length>80/);
});

test("case starts with review; only authorised admin can approve",()=>{
 assert.match(staff,/status:"review"/);
 assert.match(staff,/canApprove=\{staffRole==="admin"\}/);
 assert.match(assessment,/canApprove=false/);
 assert.match(additionalMigration,/New cases must start in review/);
 assert.match(additionalMigration,/Manager approval required/);
 assert.match(additionalMigration,/avofis_is_admin\(\)/);
 assert.match(baseMigration,/deadline_basis/);
 assert.match(baseMigration,/specialist_reference/);
});

test("contract, activation and payments require prior clearance",()=>{
 assert.match(additionalMigration,/avofis_guard_agreement_issue/);
 assert.match(additionalMigration,/Legal screening is required before acceptance/);
 assert.match(baseMigration,/A signed service agreement is required before activating the case/);
 assert.match(payment,/avofis_case_assessments/);
 assert.match(payment,/caseRecord\.status!=="open"/);
 assert.match(payment,/AVOFIS_PAYMENT_ENABLED/);
});

test("client files and internal reviews cannot bypass a withdrawn approval",()=>{
 assert.match(additionalMigration,/avofis_assessment_audit/);
 assert.match(additionalMigration,/staff read assessment audit/);
 assert.match(additionalMigration,/drop policy if exists "clients upload to their accepted cases"/);
 assert.match(additionalMigration,/r\.decision='approved'/);
 assert.doesNotMatch(client,/SUPABASE_SERVICE_ROLE_KEY/);
 for(const path of ["portal/src/app/page.tsx","portal/src/app/hizmetler/page.tsx","portal/src/app/kimler-icin/page.tsx"]){
  assert.doesNotMatch(file(path),/avofis_internal_tasks|avofis_case_assessments|SUPABASE_SERVICE_ROLE_KEY/);
 }
});

test("the four-stage launch programme and fifth cross-cutting focus remain strictly private",()=>{
 const roadmap=file("portal/src/lib/avofis-roadmap.ts");
 const taskPlan=file("portal/src/lib/avofis-business-plan.ts");
 const manager=file("portal/src/app/yonetim/isletme/page.tsx");
 const migration=file("database/migrations/20261030_avofis_internal_roadmap.sql");
 assert.equal([...roadmap.matchAll(/\bid:"(?:foundation|launch|digital|expansion)"/g)].length,4);
 assert.match(roadmap,/id:"coordination"/);
 assert.match(roadmap,/number:4/);
 assert.equal([...taskPlan.matchAll(/\{group_key:"/g)].length,24);
 assert.equal([...roadmap.matchAll(/\{group_key:"/g)].length,5);
 assert.match(taskPlan,/phaseForOriginalTask/);
 assert.match(manager,/phaseSections\.map/);
 assert.match(manager,/addCoordinationFocus/);
 assert.match(manager,/admin===true/);
 assert.match(migration,/avofis_internal_tasks/);
 assert.match(migration,/phase_key/);
 for(const path of ["portal/src/app/page.tsx","portal/src/app/hizmetler/page.tsx","portal/src/app/kimler-icin/page.tsx"]){
  assert.doesNotMatch(file(path),/avofis_roadmap|avofis-roadmap|avofis_internal_tasks|phaseForOriginalTask/);
 }
});
