"""Compose reproducible evidence without inferring independent Android acceptance."""
from pathlib import Path
import json,hashlib,datetime,subprocess,sys,re
sys.path.insert(0,str(Path(__file__).resolve().parent/'src'))
from catalog import load_catalog
from domain_registry import register

ROOT=Path(__file__).resolve().parent
catalog=load_catalog(ROOT/'evidence/SOURCE_A2_453_LOCAL_REFERENCE.csv')
registry=register(ROOT/'evidence/SOURCE_A2_453_LOCAL_REFERENCE.csv')
contracts=json.loads((ROOT/'contracts/L2_API_CONTRACT_SCOPE.json').read_text())
retries=json.loads((ROOT/'evidence/L2_PREVIOUS_LEVEL_RETRIES.json').read_text())
rows=[]
for mod in registry['modules']:
    sid=mod['system_id'];m=catalog[sid]
    rows.append({
        'id':sid,'title':m['title'],'subgroups':len(m['groups']),
        'source_feature_ids':[f['id'] for g in m['groups'].values() for f in g['features']],
        'l2_object_kind':mod['proposed_l1_record_kind'],'risk_classification':mod['data_handling'],
        'synthetic_authorization':'OWN_MATTER_ONLY_OR_STAFF_ASSIGNED_MFA' if sid not in ('LX-09','LX-12','LX-13','LX-14') else 'STAFF_ASSIGNED_MFA_ONLY',
        'l2_tested_operations':['POST','GET_LIST','GET_RECORD','PATCH','DELETE'],
        'test_kind':'IN_PROCESS_WSGI_SQLITE_REFERENCE_ONLY',
        'a4_exact_102_operations_implemented_here':False,
        'postgres_rls_real_engine_tested':False,
        'android_ui_or_apk_implemented':False,
        'independent_acceptance':False,'legal_acceptance':False,
        'evidence':['tests/test_l2_api.py::test_each_module_create_read_update_delete_real_sqlite',
                    'tests/test_l2_api.py::test_all_453_feature_ids_through_create_api']})
assert len(rows)==14 and sum(x['subgroups'] for x in rows)==69
assert len(set(fid for m in rows for fid in m['source_feature_ids']))==453
( ROOT/'evidence/L2_ALL_14_MODULES_REGISTER.json').write_text(json.dumps({
 'product':'LarenLex Android','stage':'L2','status':'ALL_14_MODULES_SYNTHETIC_API_REFERENCE_DELIVERED',
 'systems':14,'subgroups':69,'source_features':453,'a4_historical_source_operations':102,
 'l2_tested_parameterized_http_route_templates':10,
 'modules':rows,'historical_102_contract_status':'PRESERVED_NOT_REIMPLEMENTED',
 'real_android_source':'MISSING','production':'NOT_AUTHORIZED',
 'independent_acceptance':'NOT_ESTABLISHED'
},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

baseline=subprocess.run([sys.executable,'-m','unittest','discover','-s','tests','-v'],cwd=ROOT,capture_output=True,text=True)
(ROOT/'evidence/L2_ALL_TESTS_STANDARD.log').write_text(baseline.stdout+baseline.stderr)
if baseline.returncode:raise RuntimeError('unit regression failed '+baseline.stderr[-2000:])
optimized=subprocess.run([sys.executable,'-O','-m','unittest','discover','-s','tests','-v'],cwd=ROOT,capture_output=True,text=True)
(ROOT/'evidence/L2_ALL_TESTS_OPTIMIZED.log').write_text(optimized.stdout+optimized.stderr)
if optimized.returncode:raise RuntimeError('optimized regression failed '+optimized.stderr[-2000:])
compilecheck=subprocess.run([sys.executable,'-m','compileall','-q','src','tests','contract_inventory.py','retry_previous_gates.py','preview/build_l2_preview.py'],cwd=ROOT,capture_output=True,text=True)
if compilecheck.returncode:raise RuntimeError('compileall failed')

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
checks=[]
for path in sorted(ROOT.rglob('*')):
    if path.is_file() and '/__pycache__/' not in str(path) and path.suffix!='.pyc' and path.name!='L2_SHA256SUMS.txt':
        checks.append(sha(path)+'  '+str(path.relative_to(ROOT)))
(ROOT/'evidence/L2_SHA256SUMS.txt').write_text('\n'.join(checks)+'\n')

report={
 'product':'LarenLex Android','level':'L2','updated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'user_approval_L1_to_L2':True,
 'scope':{'systems':14,'subgroups':69,'source_A2_functions':453,'historical_A4_operations':102,
          'new_synthetic_route_templates':10},
 'technical_work':{'offline_wsgi_endpoint_templates':10,'source_feature_records_created_in_test':453,
                   'all_14_module_crud_in_test':True,'bearer_tokens':'SYNTHETIC_IN_PROCESS_ONLY',
                   'tenant_ownership_and_staff_mfa':'SQLITE_REFERENCE_CHECKED',
                   'document_tokens':'SYNTHETIC_HMAC_ONLY',
                   'postgres_schema':'DRAFT_NOT_EXECUTED',
                   'real_auth':'NOT_CONNECTED','android_client':'NOT_BUILT'},
 'tests':{'standard':{'status':'PASS','return_code':baseline.returncode,'count':int(re.search(r'Ran (\d+) tests',baseline.stderr).group(1))},
          'python_optimized':{'status':'PASS','return_code':optimized.returncode,'count':int(re.search(r'Ran (\d+) tests',optimized.stderr).group(1))},
          'compileall':{'status':'PASS','return_code':compilecheck.returncode},
          'browser':json.loads((ROOT/'evidence/L2_BROWSER_TEST.json').read_text())},
 'carried_previous_level_blockers':retries,
 'acceptance':{'whole_app_L2_development_cycle':'DELIVERED',
               'independent_Android_build':'NOT_VERIFIED',
               'independent_API_staging':'NOT_VERIFIED',
               'independent_PostgreSQL_RLS':'NOT_VERIFIED',
               'legal_and_translation':'NOT_VERIFIED',
               'production_deployment':'NOT_AUTHORIZED'},
 'notes':['Historic A4 102 ops NOT identical to new L2 10 generic routes',
          'Synthetic SQLite HMAC is not durable WORM or production authorization',
          'Browser demo has local JS state and never calls Python WSGI API',
          'GitHub CI must be checked separately; local execution is not GitHub CI']
}
(ROOT/'evidence/L2_TECHNICAL_EVIDENCE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'standard_tests':report['tests']['standard']['count'],'optimized_tests':report['tests']['python_optimized']['count'],'modules':14,'files_manifest':len(checks),'open_gate_groups':sum(x['open_after_attempts'] for x in retries['previous_level_gate_groups'])},ensure_ascii=False))
