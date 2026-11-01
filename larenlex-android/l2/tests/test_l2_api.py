"""WSGI in-process request tests; NO port, real user or external backend."""
import io
import json
from pathlib import Path
import sys
import unittest

BASE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE/'src'))
from l1_store import SyntheticStore, STAFF_ONLY
from l2_api import OfflineAPI
from catalog import load_catalog


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=load_catalog(BASE/'evidence/SOURCE_A2_453_LOCAL_REFERENCE.csv')

    def setUp(self):
        self.now=100000
        self.store=SyntheticStore(self.catalog,schema=BASE/'sql/001_sqlite_synthetic_schema.sql',clock=lambda:self.now)
        self.app=OfflineAPI(self.store,self.catalog)
        for t in ('ta','tb'):self.store.tenant(t)
        for user,tenant,kind in [('ca','ta','customer'),('cb','ta','customer'),('cc','tb','customer'),('sa','ta','staff'),('sb','tb','staff')]:
            self.store.principal(user,tenant,kind)
        for matter,tenant,owner in [('ma','ta','ca'),('mb','ta','cb'),('mc','tb','cc')]:
            self.store.matter(matter,tenant,owner)
        self.owner=self.store.session('ca')
        self.other=self.store.session('cb')
        self.foreign=self.store.session('cc')
        self.staff=self.store.session('sa',mfa=True)
        self.nomfa=self.store.session('sa',mfa=False)

    def tearDown(self):self.store.close()

    def request(self,method,path,body=None,token=None,headers=None,content_type='application/json'):
        if isinstance(body,(dict,list)):
            raw=json.dumps(body).encode()
        elif isinstance(body,bytes):raw=body
        elif body is None:raw=b''
        else:raw=str(body).encode()
        env={'REQUEST_METHOD':method,'PATH_INFO':path,'QUERY_STRING':'',
             'wsgi.input':io.BytesIO(raw),'CONTENT_LENGTH':str(len(raw)),
             'CONTENT_TYPE':content_type}
        if token is not None:env['HTTP_AUTHORIZATION']='Bearer '+token
        env.update(headers or {})
        result=[]
        def cb(status,h):result.append((status,dict(h)))
        data=b''.join(self.app(env,cb))
        return int(result[0][0].split()[0]),json.loads(data),result[0][1]

    def feature(self,module):
        return next(iter(self.store.allowed[module]))

    def create(self,module='LX-05',id='r',token=None,matter='ma',feature=None):
        return self.request('POST',f'/v2/matters/{matter}/modules/{module}/records',
                            {'id':id,'feature_id':feature or self.feature(module),'label':'fixture'}, token or self.owner)

    def test_catalog_is_14_modules_and_453_reference_features(self):
        status,body,h=self.request('GET','/v2/catalog')
        self.assertEqual(status,200)
        self.assertEqual(len(body['modules']),14)
        self.assertEqual(sum(x['features'] for x in body['modules']),453)
        self.assertTrue(all(not x['independent_acceptance'] for x in body['modules']))
        self.assertFalse(body['real_backend_connected'])

    def test_each_module_create_read_update_delete_real_sqlite(self):
        for idx,module in enumerate(sorted(self.catalog)):
            if module in STAFF_ONLY:
                self.store.assign('a'+str(idx),'sa','ma',module)
            token=self.staff if module in STAFF_ONLY else self.owner
            code,body,_=self.create(module,id='r'+str(idx),token=token)
            self.assertEqual(code,201, (module,body))
            self.assertEqual(body['module_id'],module)
            code,result,_=self.request('GET','/v2/records/r'+str(idx),token=token)
            self.assertEqual(code,200)
            code,result,_=self.request('PATCH','/v2/records/r'+str(idx),
              {'version':1,'label':'reviewed','state':'review'},token=token)
            self.assertEqual((code,result.get('version')), (200,2))
            code,result,_=self.request('DELETE','/v2/records/r'+str(idx),token=token,
                                      headers={'HTTP_IF_MATCH':'2'})
            self.assertEqual(code,200)
            code,_,_=self.request('GET','/v2/records/r'+str(idx),token=token)
            self.assertEqual(code,404)
        self.assertTrue(self.store.verify_audit())

    def test_all_453_feature_ids_through_create_api(self):
        n=0
        for module,features in sorted(self.store.allowed.items()):
            if module in STAFF_ONLY:
                self.store.assign('as'+module,'sa','ma',module)
            token=self.staff if module in STAFF_ONLY else self.owner
            for feature in sorted(features):
                code,result,_=self.create(module,'record'+str(n),token=token,feature=feature)
                self.assertEqual(code,201,(module,feature,result))
                self.assertEqual(result['feature_id'],feature)
                n+=1
        self.assertEqual(n,453)

    def test_no_token_and_invalid_token_are_401(self):
        for token in (None,'bogus',self.owner+'bad'):
            code,body,headers=self.request('GET','/v2/session',token=token)
            self.assertEqual(code,401)
            self.assertEqual(headers['WWW-Authenticate'],'Bearer')
            self.assertNotIn('principal_id',body)

    def test_revoked_token_cannot_use_api(self):
        self.store.revoke_sessions('ca')
        code,_,_=self.create()
        self.assertEqual(code,401)

    def test_foreign_tenant_same_tenant_other_client_denied(self):
        self.assertEqual(self.create()[0],201)
        for token in (self.other,self.foreign):
            self.assertEqual(self.request('GET','/v2/records/r',token=token)[0],404)
            self.assertEqual(self.request('GET','/v2/matters/ma/modules/LX-05/records',token=token)[0],404)
            self.assertEqual(self.request('PATCH','/v2/records/r',{'version':1,'label':'x','state':'review'},token=token)[0],404)

    def test_staff_no_assignment_mfa_rejected(self):
        self.create()
        self.assertEqual(self.request('GET','/v2/records/r',token=self.staff)[0],404)
        self.store.assign('a','sa','ma','LX-05')
        self.assertEqual(self.request('GET','/v2/records/r',token=self.staff)[0],200)
        self.assertEqual(self.request('GET','/v2/records/r',token=self.nomfa)[0],404)
        self.store.revoke_assignment('a')
        self.assertEqual(self.request('GET','/v2/records/r',token=self.staff)[0],404)

    def test_staff_only_denied_to_customer_on_create(self):
        for m in STAFF_ONLY:
            code,_,_=self.create(m)
            self.assertEqual(code,404)

    def test_version_conflict_409_and_no_mutation(self):
        self.create()
        self.assertEqual(self.request('PATCH','/v2/records/r',{'version':1,'label':'new','state':'review'},self.owner)[0],200)
        code,body,_=self.request('PATCH','/v2/records/r',{'version':1,'label':'stale','state':'review'},self.owner)
        self.assertEqual(code,409)
        self.assertEqual(self.store.read(self.owner,'r')['label'],'new')

    def test_unknown_feature_and_overposting_denied(self):
        self.assertEqual(self.create(feature='LX-09.G01.F01')[0],422)
        code,_,_=self.request('POST','/v2/matters/ma/modules/LX-05/records',
          {'id':'evil','feature_id':self.feature('LX-05'),'label':'x','tenant_id':'tb'},self.owner)
        self.assertEqual(code,422)

    def test_dangerous_methods_unknown_paths_query_rejected(self):
        self.assertEqual(self.request('PUT','/v2/catalog')[0],405)
        self.assertEqual(self.request('GET','/v2/unknown')[0],404)
        self.assertEqual(self.request('GET','/v2/records/%2e%2e',token=self.owner)[0],404)
        self.assertEqual(self.request('GET','/v2/catalog',headers={'QUERY_STRING':'tenant=other'})[0],400)

    def test_no_credentials_or_cors_headers_on_any_response(self):
        for method,path in [('GET','/v2/catalog'),('GET','/v2/session')]:
            code,body,headers=self.request(method,path)
            self.assertNotIn('Access-Control-Allow-Origin',headers)
            self.assertEqual(headers['Cache-Control'],'no-store')
            self.assertEqual(headers['X-Content-Type-Options'],'nosniff')
            self.assertFalse(body['real_backend_connected'])

    def test_duplicate_json_names_and_nan_rejected(self):
        for raw in (b'{"id":"a","id":"b","feature_id":"f","label":"x"}',
                    b'{"id":"a","feature_id":"f","label":NaN}'):
            self.assertEqual(self.request('POST','/v2/matters/ma/modules/LX-05/records',raw,self.owner)[0],400)

    def test_payload_bound_and_wrong_content_type(self):
        path='/v2/matters/ma/modules/LX-05/records'
        self.assertEqual(self.request('POST',path,b'a'*(16*1024+1),self.owner)[0],413)
        self.assertEqual(self.request('POST',path,b'{}',self.owner,content_type='text/plain')[0],415)
        self.assertEqual(self.request('POST',path,b'',self.owner,headers={'CONTENT_LENGTH':''})[0],411)

    def test_forced_client_status_untrusted(self):
        self.assertEqual(self.create()[0],201)
        code,_,_=self.request('PATCH','/v2/records/r',{'version':'1','label':'x','state':'review'},self.owner)
        self.assertEqual(code,422)
        code,_,_=self.request('PATCH','/v2/records/r',{'version':True,'label':'x','state':'review'},self.owner)
        self.assertEqual(code,422)
        code,_,_=self.request('DELETE','/v2/records/r',token=self.owner,headers={'HTTP_IF_MATCH':'abc'})
        self.assertEqual(code,422)

    def test_document_grant_is_synthetic_and_bound_to_document_path(self):
        self.create('LX-06')
        code,doc,_=self.request('POST','/v2/records/r/documents',
           {'document_id':'doc1','mime':'application/pdf'},self.owner)
        self.assertEqual(code,201)
        self.assertFalse(doc['content_uploaded'])
        self.assertNotIn('storage_key', doc)
        code,grant,_=self.request('POST','/v2/documents/doc1/grants',{'ttl':30},self.owner)
        self.assertEqual(code,200)
        self.assertEqual(self.request('POST','/v2/documents/doc1/verify',
            {'payload':grant['payload'],'signature':grant['signature']},self.owner)[0],200)
        self.assertEqual(self.request('POST','/v2/documents/doc2/verify',
            {'payload':grant['payload'],'signature':grant['signature']},self.owner)[0],404)
        self.assertEqual(self.request('POST','/v2/documents/doc1/verify',
            {'payload':grant['payload'],'signature':'0'*64},self.owner)[0],404)
        self.now+=31
        self.assertEqual(self.request('POST','/v2/documents/doc1/verify',
            {'payload':grant['payload'],'signature':grant['signature']},self.owner)[0],404)

    def test_archived_record_cannot_delete_or_reopen(self):
        self.create()
        self.request('PATCH','/v2/records/r',{'version':1,'label':'r','state':'archived'},self.owner)
        self.assertEqual(self.request('DELETE','/v2/records/r',token=self.owner,
                       headers={'HTTP_IF_MATCH':'2'})[0],404)

    def test_no_stack_trace_or_token_on_error(self):
        code,data,head=self.request('GET','/v2/records/nothere',token=self.owner)
        self.assertEqual(code,404)
        self.assertNotIn(self.owner,str(data))
        self.assertNotIn('Traceback',str(data))

    def test_client_supplied_role_and_tenant_headers_do_not_override_identity(self):
        self.create()
        forged={'HTTP_X_TENANT_ID':'ta','HTTP_X_PRINCIPAL_ID':'ca','HTTP_X_ROLE':'admin',
                'HTTP_X_MFA_VERIFIED':'true'}
        self.assertEqual(self.request('GET','/v2/records/r',token=self.foreign,headers=forged)[0],404)
        self.assertEqual(self.request('GET','/v2/records/r',token=self.nomfa,headers=forged)[0],404)

    def test_invalid_json_body_does_not_change_audit_or_records(self):
        before=self.store._one('SELECT COUNT(*) n FROM audit_events')['n']
        self.assertEqual(self.request('POST','/v2/matters/ma/modules/LX-05/records',
                          b'{"invalid":',self.owner)[0],400)
        after=self.store._one('SELECT COUNT(*) n FROM audit_events')['n']
        self.assertEqual(before,after)
        self.assertEqual(self.store._one('SELECT COUNT(*) n FROM module_records')['n'],0)

    def test_malformed_body_length_400(self):
        self.assertEqual(self.request('POST','/v2/matters/ma/modules/LX-05/records',
           b'{}',self.owner,headers={'CONTENT_LENGTH':'3'})[0],400)

if __name__=='__main__':unittest.main()
