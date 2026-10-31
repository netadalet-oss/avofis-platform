"""Disposable SQLite checks, not RLS or a live LarenLex authentication system."""
import json
from pathlib import Path
import sqlite3
import unittest

ROOT=Path(__file__).resolve().parents[1]
SQL=(ROOT/'sql/002_synthetic_sqlite_baseline.sql').read_text()
MODS=json.loads((ROOT/'contracts/all_module_data_contracts.json').read_text())['modules']

class L1SQLiteBaseline(unittest.TestCase):
    def setUp(self):
        self.db=sqlite3.connect(':memory:',isolation_level=None)
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.executescript(SQL)
        for t in ['t1','t2']:self.db.execute('INSERT INTO tenants VALUES(?)',(t,))
        for p,t,k in [('c1','t1','customer'),('c2','t1','customer'),('c3','t2','customer'),('s1','t1','staff')]:
            self.db.execute('INSERT INTO principals(id,tenant_id,kind) VALUES(?,?,?)',(p,t,k))
        for m,t,c in [('m1','t1','c1'),('m2','t1','c2'),('m3','t2','c3')]:
            self.db.execute('INSERT INTO matters(id,tenant_id,owner_id) VALUES(?,?,?)',(m,t,c))
    def tearDown(self):self.db.close()
    def test_14_synthetic_module_rows(self):
        for m in MODS:
            self.db.execute('INSERT INTO module_records(id,tenant_id,matter_id,owner_id,module_id,feature_id,label) VALUES(?,?,?,?,?,?,?)',(m['id'],'t1','m1','c1',m['id'],'synthetic:'+m['id'],'test fixture'))
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM module_records').fetchone()[0],14)
    def test_tenant_owner_composite_fk_rejects_foreign_owner(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO matters(id,tenant_id,owner_id) VALUES('bad','t2','c1')")
    def test_tenant_matter_composite_fk_rejects_foreign_record(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO module_records(id,tenant_id,matter_id,owner_id,module_id,feature_id,label) VALUES('bad','t2','m1','c3','LX-05','x','x')")
    def test_default_version_counter_and_soft_deletion(self):
        self.db.execute("INSERT INTO module_records(id,tenant_id,matter_id,owner_id,module_id,feature_id,label) VALUES('r','t1','m1','c1','LX-05','x','x')")
        updated=self.db.execute("UPDATE module_records SET version=version+1,label='y' WHERE id='r' AND version=1").rowcount
        stale=self.db.execute("UPDATE module_records SET version=version+1,label='stale' WHERE id='r' AND version=1").rowcount
        self.assertEqual((updated,stale),(1,0))
    def test_sqlite_has_no_database_rls(self):
        self.assertIn('SQLite has NO RLS',SQL)
        self.assertNotIn('CREATE POLICY',SQL)
if __name__=='__main__':unittest.main()
