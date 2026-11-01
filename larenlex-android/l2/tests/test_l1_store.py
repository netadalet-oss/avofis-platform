"""L1 local-only access tests. No real customer identities, credentials or live calls."""
import hashlib
import json
import pathlib
import sqlite3
import sys
import unittest

BASE=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE/'src'))
from catalog import load_catalog
from l1_store import SyntheticStore,Denied,Invalid,Conflict,STAFF_ONLY


class StoreTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=load_catalog((BASE.parent/'preview/whole-app-l0.html') if (BASE.parent/'preview/whole-app-l0.html').exists() else (BASE/'evidence/SOURCE_A2_453_LOCAL_REFERENCE.csv'))
        cls.features={sid:[f['id'] for g in m['groups'].values() for f in g['features']]
                      for sid,m in cls.catalog.items()}

    def setUp(self):
        self.s=SyntheticStore(self.catalog,schema=BASE/'sql/001_sqlite_synthetic_schema.sql',clock=lambda:self.time)
        self.time=1000000
        for tenant in ['t1','t2']:
            self.s.tenant(tenant)
        for user,tenant,kind in [('c1','t1','customer'),('c2','t1','customer'),('c3','t2','customer'),('s1','t1','staff'),('s2','t2','staff')]:
            self.s.principal(user,tenant,kind)
        self.s.matter('m1','t1','c1')
        self.s.matter('m2','t1','c2')
        self.s.matter('m3','t2','c3')
        self.t1=self.s.session('c1')
        self.t2=self.s.session('c2')
        self.t3=self.s.session('c3')
        self.staff=self.s.session('s1',mfa=True)
        self.no_mfa=self.s.session('s1',mfa=False)
        self.staff_foreign=self.s.session('s2',mfa=True)

    def tearDown(self):
        self.s.close()

    def f(self, module='LX-05'):
        return self.features[module][0]

    def new(self, module='LX-05', id='rec1'):
        if module in STAFF_ONLY:
            self.s.assign('assign-'+module,'s1','m1',module)
            return self.s.create(self.staff,id,'m1',module,self.f(module),'fixture')
        return self.s.create(self.t1,id,'m1',module,self.f(module),'fixture')

    def test_source_inventory_all_14_and_453(self):
        self.assertEqual(len(self.s.allowed),14)
        self.assertEqual(sum(map(len,self.s.allowed.values())),453)
        self.assertEqual(len(set.union(*self.s.allowed.values())),453)

    def test_all_14_modules_are_represented_by_actual_record(self):
        for i,module in enumerate(sorted(self.features)):
            rec=self.new(module,f'rec{i}')
            self.assertEqual(rec['module_id'],module)
            self.assertEqual(rec['feature_id'],self.f(module))
            self.assertEqual(rec['tenant_id'],'t1')
            self.assertEqual(rec['matter_id'],'m1')
        self.assertTrue(self.s.verify_audit())
        self.assertEqual(self.s._one('SELECT COUNT(*) n FROM module_records')['n'],14)

    def test_every_453_feature_maps_to_its_module_without_acceptance_claim(self):
        count=0
        for module, ids in sorted(self.features.items()):
            for idx,feature in enumerate(ids):
                if module in STAFF_ONLY and not self.s._one('SELECT 1 FROM staff_assignments WHERE module_id=?',(module,)):
                    self.s.assign(f'ass-{module}','s1','m1',module)
                token=self.staff if module in STAFF_ONLY else self.t1
                result=self.s.create(token,f'r{count}','m1',module,feature,'synthetic')
                self.assertEqual(result['feature_id'],feature)
                count+=1
        self.assertEqual(count,453)
        self.assertEqual(self.s._one('SELECT COUNT(*) n FROM module_records')['n'],453)
        self.assertTrue(self.s.verify_audit())

    def test_cross_tenant_read_denied(self):
        self.new()
        with self.assertRaises(Denied):self.s.read(self.t3,'rec1')
        with self.assertRaises(Denied):self.s.read(self.staff_foreign,'rec1')
        with self.assertRaises(Denied):self.s.list_records(self.t3,'m1','LX-05')

    def test_same_tenant_other_client_denied(self):
        self.new()
        with self.assertRaises(Denied):self.s.read(self.t2,'rec1')
        with self.assertRaises(Denied):self.s.update(self.t2,'rec1',1,'hacked','draft')
        with self.assertRaises(Denied):self.s.list_records(self.t2,'m1','LX-05')

    def test_staff_requires_module_assignment_and_mfa(self):
        self.new()
        with self.assertRaises(Denied):self.s.read(self.staff,'rec1')
        self.s.assign('g1','s1','m1','LX-05')
        self.assertEqual(self.s.read(self.staff,'rec1')['id'],'rec1')
        with self.assertRaises(Denied):self.s.read(self.no_mfa,'rec1')
        with self.assertRaises(Denied):self.s.assign('bad','s2','m1','LX-05')

    def test_staff_assigned_only_to_one_module_and_matter(self):
        self.new('LX-05','a')
        self.new('LX-06','b')
        self.s.assign('g1','s1','m1','LX-05')
        self.s.assign('g2','s1','m2','LX-06')
        self.s.read(self.staff,'a')
        with self.assertRaises(Denied):self.s.read(self.staff,'b')
        with self.assertRaises(Denied):self.s.list_records(self.staff,'m2','LX-05')

    def test_revoked_assignment_immediately_denies(self):
        self.new()
        self.s.assign('g1','s1','m1','LX-05')
        self.s.read(self.staff,'rec1')
        self.s.revoke_assignment('g1')
        with self.assertRaises(Denied):self.s.read(self.staff,'rec1')

    def test_logout_generation_invalidates_delayed_response(self):
        self.new()
        self.s.revoke_sessions('c1')
        with self.assertRaises(Denied):self.s.read(self.t1,'rec1')
        refreshed=self.s.session('c1')
        self.assertEqual(self.s.read(refreshed,'rec1')['id'],'rec1')
        with self.assertRaises(Denied):self.s.read(self.t1,'rec1')

    def test_deactivated_user_cannot_create_new_session(self):
        self.new()
        self.s.deactivate_principal('c1')
        with self.assertRaises(Denied):self.s.session('c1')
        with self.assertRaises(Denied):self.s.read(self.t1,'rec1')

    def test_optimistic_concurrency_denies_second_update(self):
        self.new()
        u=self.s.update(self.t1,'rec1',1,'changed','review')
        self.assertEqual(u['version'],2)
        with self.assertRaises(Conflict):self.s.update(self.t1,'rec1',1,'stale','review')
        self.assertEqual(self.s.read(self.t1,'rec1')['label'],'changed')

    def test_archived_and_reverse_lifecycle_denied(self):
        self.new()
        self.s.update(self.t1,'rec1',1,'in review','review')
        with self.assertRaises(Denied):self.s.update(self.t1,'rec1',2,'rollback','draft')
        self.s.update(self.t1,'rec1',2,'archived','archived')
        with self.assertRaises(Denied):self.s.update(self.t1,'rec1',3,'bad','review')
        with self.assertRaises(Denied):self.s.delete(self.t1,'rec1',3)

    def test_deleted_records_unreadable_and_stale_version(self):
        self.new()
        with self.assertRaises(Conflict):self.s.delete(self.t1,'rec1',999)
        self.s.delete(self.t1,'rec1',1)
        with self.assertRaises(Denied):self.s.read(self.t1,'rec1')
        self.assertEqual(self.s.list_records(self.t1,'m1','LX-05'),[])

    def test_cross_tenant_composite_foreign_key(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.s._run("INSERT INTO matters(id,tenant_id,owner_id) VALUES ('hack','t2','c1')")
        with self.assertRaises(sqlite3.IntegrityError):
            self.s._run("INSERT INTO module_records(id,tenant_id,matter_id,owner_id,module_id,feature_id,label) VALUES ('hack','t2','m1','c1','LX-05','fake','x')")

    def test_mass_assignment_wrong_feature_rejected(self):
        with self.assertRaises(Invalid):self.s.create(self.t1,'bad','m1','LX-05',self.f('LX-06'),'x')
        with self.assertRaises(Invalid):self.s.create(self.t1,'bad','m1','LX-99','none','x')

    def test_restrict_sensitive_internal_modules_to_staff(self):
        for module in sorted(STAFF_ONLY):
            with self.assertRaises(Denied):
                self.s.create(self.t1,f'restricted-{module}','m1',module,self.f(module),'x')
            self.new(module, 'staff-'+module)
            with self.assertRaises(Denied):self.s.read(self.t1,'staff-'+module)

    def test_audit_chain_detects_mutation(self):
        self.new()
        self.assertTrue(self.s.verify_audit())
        self.s._run("UPDATE audit_events SET operation='forged' WHERE seq=1")
        self.assertFalse(self.s.verify_audit())

    def test_audit_is_synthetic_not_worm(self):
        self.assertEqual(self.s.db.execute('PRAGMA database_list').fetchone()['file'],'')
        self.assertTrue(self.s.verify_audit())

    def test_signed_document_short_expiry_replay_and_revocation(self):
        self.new('LX-06')
        doc=self.s.document_reference(self.t1,'rec1','doc1','application/pdf')
        self.assertFalse(doc['content_uploaded'])
        grant=self.s.short_lived_document_token(self.t1,'doc1',ttl=30)
        self.assertTrue(self.s.verify_document_token(self.t1,grant))
        bad=dict(grant);bad['signature']='0'*64
        with self.assertRaises(Denied):self.s.verify_document_token(self.t1,bad)
        with self.assertRaises(Denied):self.s.verify_document_token(self.t2,grant)
        self.time+=31
        with self.assertRaises(Denied):self.s.verify_document_token(self.t1,grant)
        new=self.s.short_lived_document_token(self.t1,'doc1',ttl=20)
        self.s.revoke_sessions('c1')
        with self.assertRaises(Denied):self.s.verify_document_token(self.t1,new)

    def test_unsupported_document_mime_and_bad_ttl_rejected(self):
        self.new()
        with self.assertRaises(Invalid):self.s.document_reference(self.t1,'rec1','doc1','application/x-msdownload')
        self.s.document_reference(self.t1,'rec1','doc1','application/pdf')
        with self.assertRaises(Invalid):self.s.short_lived_document_token(self.t1,'doc1',ttl=999999)

    def test_invalid_session_and_input_rejected(self):
        with self.assertRaises(Denied):self.s.list_records('fake-token','m1','LX-05')
        with self.assertRaises(Invalid):self.s.create(self.t1,'../evil','m1','LX-05',self.f(),'x')
        with self.assertRaises(Invalid):self.s.create(self.t1,'good','m1','LX-05',self.f(),' ' * 151)

    def test_unassigned_staff_and_cross_org_are_denied_before_mutation(self):
        with self.assertRaises(Denied):self.s.create(self.staff,'bad','m1','LX-05',self.f(),'bad')
        with self.assertRaises(Denied):self.s.create(self.t3,'bad','m1','LX-05',self.f(),'bad')
        self.assertEqual(self.s._one('SELECT count(*) n FROM module_records')['n'],0)


if __name__=='__main__':unittest.main()
