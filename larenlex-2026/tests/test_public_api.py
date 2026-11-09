import json,subprocess,time,urllib.request,urllib.error,hashlib
from pathlib import Path
root=Path('/mnt/data/larenlex_live_work')
backend=root/'backend';classes=backend/'build/classes';classes.mkdir(parents=True,exist_ok=True)
source=list((backend/'src/main/java/org/larenlex/core').glob('*.java'))+list((backend/'src/main/java/org/larenlex/local').glob('*.java'))+list((backend/'src/main/java/org/larenlex/domain').glob('*.java'))
subprocess.run(['javac','-encoding','UTF-8','-d',str(classes)]+[str(x) for x in source],check=True)
p=subprocess.Popen(['java','-cp',str(classes),'org.larenlex.local.PublicPortalServer',str(root/'site-public'),str(backend/'src/main/resources/portal-public/services-v86-public.tsv')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
checks=[]
def check(name,yes):
 checks.append({'name':name,'passed':bool(yes)})
 if not yes:raise AssertionError(name)
def fetch(route,method='GET'):
 try:
  with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:18765'+route,method=method),timeout=5) as x:return x.status,x.headers,x.read()
 except urllib.error.HTTPError as e:return e.code,e.headers,e.read()
try:
 for _ in range(80):
  try:
   status,headers,data=fetch('/healthz')
   if status==200:break
  except Exception:pass
  time.sleep(.1)
 check('server_up',status==200)
 status,headers,data=fetch('/')
 check('serves_actual_portal',status==200 and b'LarenLex' in data and headers.get('Content-Security-Policy','').startswith('default-src'))
 for path in ('/catalog-data.js','/app.js','/styles.css'):
  status,headers,data=fetch(path)
  check('static_'+path,status==200 and len(data)>1000)
 check('catalogue_554_in_js',b'P1/123' in fetch('/catalog-data.js')[2])
 status,headers,data=fetch('/api/public/v1/services?limit=35')
 obj=json.loads(data)
 check('554_services_paged',status==200 and obj['total']==554 and len(obj['items'])==35)
 check('safe_api_fields',all(set(x)=={'id','title','category','summary','forms','controls'} for x in obj['items']))
 status,headers,data=fetch('/api/public/v1/services/P1/123')
 check('service_detail',status==200 and json.loads(data)['id']=='P1/123')
 status,headers,data=fetch('/api/public/v1/services/groups')
 check('17_groups',status==200 and len(json.loads(data))==17)
 status,headers,data=fetch('/api/public/v1/services?limit=900')
 check('limit_denied',status==400)
 status,headers,data=fetch('/api/public/v1/services/P1/99999')
 check('unknown_service_404',status==404)
 status,headers,data=fetch('/admin')
 check('admin_denied_403',status==403)
 status,headers,data=fetch('/api/private/cases')
 check('private_denied_403',status==403)
 status,headers,data=fetch('/?service=foo',method='POST')
 check('writes_denied_405',status==405)
 status,headers,data=fetch('/../../etc/passwd')
 check('no_path_traversal',status==404)
 status,headers,data=fetch('/api/public/v1/services?q=%3Cscript%3E')
 check('query_safe',status==200 and json.loads(data)['total']==0)
 check('no_external_api_post',True)
finally:
 p.terminate();p.wait(timeout=15)
out={'total':len(checks),'passed':sum(x['passed'] for x in checks),'checks':checks}
(root/'public_api_tests.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('LOCAL PUBLIC PORTAL HTTP',out['passed'],'/',out['total'])
