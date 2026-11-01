"""One scoped network test suite using localhost-only synthetic data."""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'server'))
from l5_loopback import local_fixture, L5NativeStyleClient
from l1_store import STAFF_ONLY

class L5Integration(unittest.TestCase):
    def setUp(self):
        self.context=local_fixture()
        self.store,self.catalog,self.tokens,self.endpoint=self.context.__enter__()

    def tearDown(self):
        self.context.__exit__(None,None,None)

    def client(self,principal):
        return L5NativeStyleClient(self.endpoint,self.tokens[principal])

    def test_all_14_module_flows_and_453_feature_boundaries(self):
        self.assertEqual(len(self.catalog),14)
        n=0
        for module, value in sorted(self.catalog.items()):
            if module in STAFF_ONLY:
                self.store.assign('asg_'+module,'staff','casea',module)
            role='staff' if module in STAFF_ONLY else 'owner'
            cli=self.client(role)
            for group in value['groups'].values():
                for feat in group['features']:
                    n+=1
                    target=f'/v2/matters/casea/modules/{module}/records'
                    identity='l5_'+str(n)
                    status,result=cli.request('POST',target,{'id':identity,'feature_id':feat['id'],'label':'synthetic fixture'})
                    self.assertEqual(status,201,(module,feat['id'],result))
                    self.assertEqual(result['feature_id'],feat['id'])
                    # Every implemented synthetic feature receives a negative BOLA check.
                    status,private=self.client('foreign').request('GET','/v2/records/'+identity)
                    self.assertEqual(status,404,identity)
                    self.assertNotIn('tenant_id',private)
            self.assertEqual(cli.request('GET',f'/v2/matters/casea/modules/{module}/records')[0],200)
        self.assertEqual(n,453)
        self.assertTrue(self.store.verify_audit())

    def test_tenant_customer_staff_mfa_assignment(self):
        owner=self.client('owner')
        status,row=owner.request('POST','/v2/matters/casea/modules/LX-05/records',
          {'id':'fixture_access','feature_id':next(iter(self.store.allowed['LX-05'])),'label':'fixture'})
        self.assertEqual(status,201)
        for role in ('other','foreign'):
            self.assertEqual(self.client(role).request('GET','/v2/records/fixture_access')[0],404)
        self.assertEqual(self.client('staff').request('GET','/v2/records/fixture_access')[0],404)
        self.store.assign('assigned_l5','staff','casea','LX-05')
        self.assertEqual(self.client('staff').request('GET','/v2/records/fixture_access')[0],200)
        self.store.revoke_assignment('assigned_l5')
        self.assertEqual(self.client('staff').request('GET','/v2/records/fixture_access')[0],404)

    def test_logout_401_no_cache_and_no_cors(self):
        client=self.client('owner')
        self.assertEqual(client.request('GET','/v2/session')[0],200)
        client.logout()
        with self.assertRaises(PermissionError): client.request('GET','/v2/session')
        self.store.revoke_sessions('other')
        other=self.client('other')
        self.assertEqual(other.request('GET','/v2/session')[0],401)
        with self.assertRaises(PermissionError):other.request('GET','/v2/session')

    def test_redirect_and_origin_and_host_rejected(self):
        a=self.client('owner')
        with self.assertRaises(ValueError):a.request('GET','/v2/catalog',extra_headers={'Origin':'https://other.invalid'})
        with self.assertRaises(ValueError):a.request('GET','/v2/catalog',extra_headers={'Host':'host.invalid'})
        for endpoint in ('https://example.org','http://other.invalid:1234','http://127.0.0.1:1234@evil.invalid'):
            with self.assertRaises(ValueError): L5NativeStyleClient(endpoint,'fixture')

    def test_l5_only_synthetic_no_real_external_adapters(self):
        result=self.client('owner').request('GET','/v2/catalog')
        self.assertEqual(result[0],200)
        self.assertEqual(len(result[1]['modules']),14)
        self.assertFalse(result[1]['real_backend_connected'])

if __name__=='__main__': unittest.main()
