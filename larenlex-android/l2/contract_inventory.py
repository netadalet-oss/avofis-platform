"""Separate historical A4 inventory from new synthetic generic L2 templates."""
import hashlib
import json
import zipfile
from pathlib import Path

TEMPLATES = [
('GET','/v2/catalog','PUBLIC_CATALOG_ONLY'),
('GET','/v2/session','BEARER_SYNTHETIC'),
('GET','/v2/matters/{matter}/modules/{module}/records','BEARER_MATTER_MODULE'),
('POST','/v2/matters/{matter}/modules/{module}/records','BEARER_MATTER_MODULE'),
('GET','/v2/records/{record}','BEARER_RECORD'),
('PATCH','/v2/records/{record}','BEARER_RECORD_VERSION'),
('DELETE','/v2/records/{record}','BEARER_RECORD_IF_MATCH'),
('POST','/v2/records/{record}/documents','BEARER_DOCUMENT_METADATA'),
('POST','/v2/documents/{document}/grants','BEARER_SIGNED_FIXTURE'),
('POST','/v2/documents/{document}/verify','BEARER_SIGNED_FIXTURE'),
]

def generate(private_zip, dest):
    source=Path(private_zip)
    with zipfile.ZipFile(source) as z:
        values={}
        for line in z.read('SHA256SUMS.txt').decode('utf-8').splitlines():
            sha,filename=line.split('  ',1)
            if hashlib.sha256(z.read(filename)).hexdigest()!=sha:raise ValueError('source SHA mismatch')
            values[filename]=sha
        file='KAYNAK_KANIT/A5_18_102_API_COVERAGE.json'
        historic=json.loads(z.read(file))['operations']
    if len(historic)!=102 or len({x['operationId'] for x in historic})!=102:raise ValueError('A4 count mismatch')
    if sum(x['transient_fixture_tested'] for x in historic)!=87:raise ValueError('A5 history mismatch')
    if sum(x['persistent_sqlite_fixture_tested'] for x in historic)!=37:raise ValueError('A5 history mismatch')
    document={
        'product':'LarenLex Android','level':'L2',
        'historical_a4_operations_source':'KAYNAK_KANIT/A5_18_102_API_COVERAGE.json',
        'historical_a4_source_sha256':values[file],
        'source_zip_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'historical_a4_status':'IDENTITY_VERIFIED_HISTORY_ONLY_NO_CURRENT_IMPLEMENTATION_CLAIM',
        'a4_historical_102':[{'operationId':x['operationId'],'method':x['method'],'path':x['path'],
                                'historical_synthetic_RAM':bool(x['transient_fixture_tested']),
                                'historical_synthetic_SQLite_subset':bool(x['persistent_sqlite_fixture_tested']),
                                'verified_in_current_l2_runtime':False,
                                'independent_acceptance':False}
                               for x in historic],
        'new_l2_10_generic_route_templates':[{'method':m,'route':path,'security':security,
                                               'in_process_wsgi_tested':True,
                                               'real_postgres_auth_or_android_connected':False}
                                              for m,path,security in TEMPLATES],
        'new_l2_14_module_coverage':'single authorization-aware parameterized module route, not 14*102 different endpoints',
        'actual_mobile_api_client':'NOT_BUILT',
        'production_api':'NOT_CONNECTED',
        'independent_acceptance':'NOT_ESTABLISHED'
    }
    dest=Path(dest);dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return document

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--out',required=True)
    a=p.parse_args();print(len(generate(a.source,a.out)['a4_historical_102']))
