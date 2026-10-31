"""Real in-memory SQLite tests of the source-derived 14-module L1 reference model."""
import sys
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'))
from catalog import load_catalog
from l1_store import SyntheticStore,Denied,Conflict

class L1RealFixture(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=load_catalog(ROOT.parent/'preview/whole-app-l0.html')
        cls.feature={sid:next(iter(next(iter(m['groups'].values()))['features']))['id']
                     for sid,m in cls.catalog.items()}
    def setUp(self):
        self.db=SyntheticStore(self.catalog,schema=ROOT/'sql/001_sqlite_synthetic_schema.sql')
        self.db.tenant('t1');self.db.tenant('t2')
        for id,t,k in [('c1','t1','customer'),('c2','t1','customer'),('c3','t2','customer'),
                       ('staff','t1','staff')]:self.db.principal(id,t,k)
        self.db.matter('m1','t1','c1');self.db.matter('m2','t1','c2');self.db.matter('m3','t2','c3')
        self.c1=self.db.session('c1')
        self.c2=self.db.session('c2')
        self.c3=self.db.session('c3')
        self.staff=self.db.session('staff',mfa=True)
    def tearDown(self):self.db.close()
    def test_each_module_one_record(self):
        for i,sid in enumerate(sorted(self.catalog)):
            if sid in {'LX-09','LX-12','LX-13','LX-14'}:
                self.db.assign('grant'+str(i),'staff','m1',sid)
                token=self.staff
            else:token=self.c1
            r=self.db.create(token,'rec'+str(i),'m1',sid,self.feature[sid],'synthetic')
            self.assertEqual(r['module_id'],sid)
        self.assertTrue(self.db.verify_audit())
        self.assertEqual(self.db._one('SELECT COUNT(*) n FROM module_records')['n'],14)
    def test_cross_tenant_and_same_tenant_owner_denied(self):
        self.db.create(self.c1,'r','m1','LX-05',self.feature['LX-05'],'x')
        for token in [self.c2,self.c3,self.staff]:
            with self.assertRaises(Denied):self.db.read(token,'r')
    def test_staff_revoke_reject(self):
        self.db.create(self.c1,'r','m1','LX-05',self.feature['LX-05'],'x')
        self.db.assign('g','staff','m1','LX-05')
        self.db.read(self.staff,'r')
        self.db.revoke_assignment('g')
        with self.assertRaises(Denied):self.db.read(self.staff,'r')
    def test_stale_version_reject(self):
        self.db.create(self.c1,'r','m1','LX-05',self.feature['LX-05'],'x')
        self.db.update(self.c1,'r',1,'changed','review')
        with self.assertRaises(Conflict):self.db.update(self.c1,'r',1,'stale','review')
    def test_session_revocation_denied(self):
        self.db.create(self.c1,'r','m1','LX-05',self.feature['LX-05'],'x')
        self.db.revoke_sessions('c1')
        with self.assertRaises(Denied):self.db.read(self.c1,'r')

if __name__=='__main__': unittest.main()
