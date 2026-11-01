"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

function load(file, deps = {}) {
  const script = ts.transpileModule(fs.readFileSync(path.join(root,file), "utf8"), {
    fileName:file, compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
  }).outputText;
  const mod={exports:{}};
  new Function("module","exports","require",script)(
    mod, mod.exports,
    key => key === "lucide-react" ? new Proxy({}, {get:()=>function Icon(){}})
      : Object.hasOwn(deps,key) ? deps[key]
      : (()=>{throw new Error("Unexpected dependency: " + key);})()
  );
  return mod.exports;
}
const expanded=load("src/lib/avofis-expanded.ts");
const site=load("src/lib/avofis-site.ts",{"./avofis-expanded":expanded});
const journeys=load("src/lib/journeys.ts").journeys;
const service=load("src/lib/service-catalog.ts").SERVICES;
const audiencePaths=load("src/lib/audience-journey-map.ts").audienceFirstPaths;
const journeyLinks=load("src/lib/journey-service-links.ts").journeyServiceSlugs;
const model=load("src/lib/stage-two-navigation.ts");

const audiences=site.audiences.map(item=>({
  slug:item.slug,title:item.title.tr,journeyIds:audiencePaths[item.slug]||[],
  serviceSlugs:item.serviceSlugs
}));
const journeyRows=journeys.map(item=>({
  id:item.id,title:item.title.tr,serviceSlugs:journeyLinks[item.id]||[]
}));
const services=service.map(item=>({slug:item.slug,title:item.title}));

test("Stage 2 source flow validates every canonical audience, journey and service without invented paths",()=>{
  assert.equal(audiences.length,14);
  assert.equal(journeyRows.length,12);
  assert.equal(services.length,17);
  assert.doesNotThrow(()=>model.validateStageTwoNavigation(audiences,journeyRows,services));
  for(const audience of audiences){
    assert.deepEqual(model.stageTwoJourneyIds(audience.slug,audiences),audience.journeyIds);
    for(const journey of audience.journeyIds){
      const related=model.stageTwoRelatedServices(audience.slug,journey,audiences,journeyRows,services);
      assert.ok(related.length>0,audience.slug+" -> "+journey);
      for(const item of related) assert.ok(services.some(s=>s.slug===item.slug));
    }
  }
});

test("Stage 2 fail-closed navigation rejects forged, cross-audience and missing selections",()=>{
  assert.deepEqual(model.stageTwoJourneyIds("../../api",audiences),[]);
  assert.deepEqual(model.stageTwoRelatedServices("wrong","tr-to-nl",audiences,journeyRows,services),[]);
  assert.deepEqual(model.stageTwoRelatedServices(audiences[0].slug,"../../../checkout",audiences,journeyRows,services),[]);
  const audience=audiences.find(item=>item.slug==="kiracilar-ve-ev-sahipleri");
  assert.ok(audience);
  assert.deepEqual(model.stageTwoRelatedServices(audience.slug,"ind-decision-objection",audiences,journeyRows,services),[]);
  assert.throws(()=>model.validateStageTwoNavigation(audiences.slice(1),journeyRows,services),/COUNT_OR_DUPLICATE/);
  const broken=audiences.map((item,i)=>i?item:{...item,journeyIds:["invented"]});
  assert.throws(()=>model.validateStageTwoNavigation(broken,journeyRows,services),/AUDIENCE_LINK_INVALID/);
});

test("Stage 2 real Next page and local selections link to real preparation, services and release boundary",()=>{
  const page=fs.readFileSync(path.join(root,"src/app/seviye-2-akis/page.tsx"),"utf8");
  const view=fs.readFileSync(path.join(root,"src/components/StageTwoPublicFlow.tsx"),"utf8");
  const nav=fs.readFileSync(path.join(root,"src/lib/site.ts"),"utf8");
  assert.match(page,/validateStageTwoNavigation\(stageAudiences, stageJourneys, stageServices\)/);
  assert.match(page,/StageTwoPublicFlow audiences=\{stageAudiences\}/);
  assert.match(page,/robots: \{ index: false, follow: false \}/);
  assert.ok(nav.includes('href: "/seviye-2-akis"'));
  for(const destination of ['href={"/islemler/" + selectedJourney.id}','href={"/hizmetler/" + item.slug}','href="/uyum"']){
    assert.ok(view.includes(destination),destination);
  }
  for(const prohibited of ["fetch(", "supabase", "createClient(", "localStorage", "sessionStorage",
    "window.location", "<form", "<input", "type=\"file\"", "process.env", "sendBeacon"]){
    assert.equal(view.includes(prohibited),false,prohibited);
  }
});


test("Stage 2 shared A0-A6 contract covers every workstream without inventing any release",()=>{
  const contract=JSON.parse(fs.readFileSync(path.join(root,"../docs/program/AVOFIS_LEVEL2_HORIZONTAL_FLOW_CONTRACT_2026-11-01.json"),"utf8"));
  assert.deepEqual(contract.horizontalAreas.map(area=>area.id),["A0","A1","A2","A3","A4","A5","A6"]);
  assert.equal(contract.levelTwo.scopeCounts.rRequirements,594);
  assert.equal(contract.levelTwo.scopeCounts.audiences,14);
  assert.equal(contract.levelTwo.scopeCounts.journeys,12);
  assert.equal(contract.levelTwo.scopeCounts.services,17);
  assert.equal(contract.levelTwo.status,"IN_PROGRESS_NOT_ACCEPTED");
  assert.equal(contract.stageOne.independentRAccepted,0);
  assert.equal(contract.stageOne.liveRAccepted,0);
  assert.equal(contract.controls.productionDeploymentAuthorized,false);
  assert.ok(contract.carryover.some(item=>item.id==="PORTAL_STALE_ANCHOR_CI"));
});

test("Stage 2 all 12 real routes validate categorical form completion without free-text or case data",()=>{
  const flow=load("src/lib/stage-two-preparation.ts");
  assert.equal(journeys.length,12);
  for(const journey of journeys){
    const fields=journey.fields.map(field=>({
      key:field.key,label:field.label.tr,
      options:field.options.map(option=>({value:option.value,label:option.label.tr}))
    }));
    const initial=flow.safeStageTwoPreparation(fields,{});
    assert.equal(initial.total,fields.length,journey.id);
    assert.equal(initial.answered,0,journey.id);
    assert.equal(initial.complete,false,journey.id);
    let current={};
    for(const field of fields){
      const chosen=field.options[0];
      current=flow.updateStageTwoPreparation(fields,current,field.key,chosen.value);
    }
    const done=flow.safeStageTwoPreparation(fields,current);
    assert.equal(done.complete,true,journey.id);
    assert.equal(done.answered,fields.length,journey.id);
    assert.deepEqual(done.selections.map(item=>item.chosen),fields.map(f=>f.options[0].label));
    assert.deepEqual(flow.updateStageTwoPreparation(fields,current,"__proto__","evil"),current);
    assert.deepEqual(flow.updateStageTwoPreparation(fields,current,fields[0].key,"arbitrary"),current);
    const forged=flow.safeStageTwoPreparation(fields,{...current,__proto__:"secret",arbitrary:"PII"});
    assert.deepEqual(forged.selections,done.selections);
    const cleared=flow.updateStageTwoPreparation(fields,current,fields[0].key,"");
    assert.equal(flow.safeStageTwoPreparation(fields,cleared).complete,false);
  }
});
test("Stage 2 end-to-end UI exposes only local completion and guarded per-journey answers",()=>{
  const page=fs.readFileSync(path.join(root,"src/app/seviye-2-akis/page.tsx"),"utf8");
  const view=fs.readFileSync(path.join(root,"src/components/StageTwoPublicFlow.tsx"),"utf8");
  assert.match(page,/fields: item\.fields\.map/);
  for(const expected of ["safeStageTwoPreparation","updateStageTwoPreparation",
    "setAnswers({})","setShowLocalResult(false)",
    "disabled={!preparation.complete}","showLocalResult && preparation.complete",
    "preparation.selections.map","Yerel hazırlık özeti"]) {
    assert.ok(view.includes(expected),expected);
  }
  for(const bad of ["fetch(","localStorage","sessionStorage","createClient(","<textarea",
    "type=\"file\"","type=\"text\"","<form",".insert(",".upsert("]) {
    assert.equal(view.includes(bad),false,bad);
  }
});
