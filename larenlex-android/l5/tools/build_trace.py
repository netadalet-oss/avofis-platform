"""L5 evidence mapping: names and counts not equivalent to acceptance."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT=Path(__file__).resolve().parents[1]
MANUAL=Path('/mnt/data/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip')


def generate():
    modules=json.loads((ROOT/'android/app/src/main/assets/modules.json').read_text())
    with zipfile.ZipFile(MANUAL) as archive:
        api=json.loads(archive.read('KAYNAK_KANIT/A5_18_102_API_COVERAGE.json'))['operations']
    a2=[]
    for module in modules:
        for group in module['groups']:
            for feature in group['features']:
                a2.append({'feature_id':feature['id'],'module_id':module['id'],
                    'positive_test':'L5-HTTP-POS-'+feature['id'],
                    'negative_test':'L5-HTTP-BOLA-'+feature['id'],
                    'test_layer':'actual_local_loopback_http_synthetic_sqlite',
                    'test_execution_id':'SET_AT_RUNTIME_NOT_PRESUMED',
                    'real_android_client':'NOT_TESTED',
                    'technical_independent_acceptance':False,
                    'legal_independent_acceptance':False})
    source_ops=[{'operationId':o['operationId'],'method':o['method'],'path':o['path'],
      'historical_RAM_fixture':bool(o['transient_fixture_tested']),
      'historical_SQLite_fixture':bool(o['persistent_sqlite_fixture_tested']),
      'l5_implemented':'NOT_IMPLEMENTED_AS_A4_OPERATION',
      'l5_test_id':None,'independent_acceptance':False} for o in api]
    assert len(a2)==len({x['feature_id'] for x in a2})==453
    assert len(source_ops)==len({x['operationId'] for x in source_ops})==102
    assert len(modules)==14 and sum(len(x['groups']) for x in modules)==69
    result={'product':'LarenLex Android','stage':'L5',
     'semantic_scope':'A2 label evidence plus L2 generic HTTP fixture; not implementation of 453 distinct real functions',
     'counts':{'modules':14,'groups':69,'A2_historical_features':453,'A4_historical_operations':102,'new_real_accepted':0},
     'A2':a2,'A4':source_ops,
     'acceptance_gate':{'at_least_46_real_newly_accepted':False,'actual_real_newly_accepted':0,
      'genuine_commit_build_legal_language_security_independent_evidence':'MISSING',
      'reason':'Synthetic HTTP/SQLite tests cannot satisfy genuine A2 independent acceptance'}}
    out=ROOT/'evidence/L5_A2_A4_TRACE.json';out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    return result

if __name__=='__main__':
    r=generate();print(r['counts'])
