'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {validate,load}=require('./portal-progress-gate.cjs');
const original=load();const copy=()=>structuredClone(original);
test('transparent 60 scenario reference has 13 code-tested gains but no live acceptance',()=>{
 assert.deepEqual(validate(original),{
 operational_level:7,next_level_approved:false,fixed_portal_proxy_denominator:60,
 new_code_test_scenarios:13,provisional_code_delta_pct_points:21.67,
 staging_browser_accepted:0,original_portal_completion_percent:null,
 original_project_10_percent_gain_proven:false
 });
});
test('cannot mark stage 8 approved',()=>{const o=copy();o.stage8_approved=true;assert.throws(()=>validate(o));});
test('cannot substitute CI success for original product completion',()=>{const o=copy();o.original_project_completion_percent=21.67;assert.throws(()=>validate(o));});
test('cannot guess original accepted-job baseline',()=>{const o=copy();o.baseline_from_original_approved_register=0;assert.throws(()=>validate(o));});
test('fixed 60 acceptance denominator cannot be manipulated',()=>{const o=copy();o.denominator_fixed=13;assert.throws(()=>validate(o));});
test('all 12 portal areas must keep exactly five acceptance paths',()=>{const o=copy();o.items[0].id='cases:nonexistent';assert.throws(()=>validate(o));});
test('each new code gain must have traceable source and tests',()=>{const o=copy();const x=o.items.find(i=>i.status.startsWith('NEW_'));x.source=[];assert.throws(()=>validate(o));});
test('no ungrounded staging acceptance percentage',()=>{const o=copy();o.real_browser_journeys_accepted=13;assert.throws(()=>validate(o));});
test('counts derived from marked scenarios, not from test numbers',()=>{const o=copy();o.new_source_level_journeys=226;assert.throws(()=>validate(o));});
test('cannot move live acceptance tier without explicit new evidence review',()=>{const o=copy();o.items.find(i=>i.status.startsWith('NEW_')).status='STAGING_BROWSER_ACCEPTED';assert.throws(()=>validate(o));});
