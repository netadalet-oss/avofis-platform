"""One bounded L3 source, document, Java-policy and browser verification run."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile
from xml.etree import ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'android/app/src/main'
JAVA=APP/'java/nl/larenlex/app'
CAT=APP/'assets/modules.json'
HTML=ROOT/'preview/LARENLEX_ANDROID_L3_BUTUN_UYGULAMA_ONIZLEME.html'
manifest=(APP/'AndroidManifest.xml').read_text()
modules=json.loads(CAT.read_text())
assert len(modules)==14
assert sum(len(m['groups']) for m in modules)==69
ids=[f['id'] for m in modules for g in m['groups'] for f in g['features']]
assert len(ids)==len(set(ids))==453
assert all(not f['accepted'] for m in modules for g in m['groups'] for f in g['features'])
assert 'android:allowBackup="false"' in manifest and 'android:usesCleartextTraffic="false"' in manifest
assert 'android.permission.INTERNET' not in manifest
assert 'WebView' not in (JAVA/'MainActivity.java').read_text()
assert 'addJavascriptInterface' not in ''.join(p.read_text() for p in JAVA.glob('*.java'))
assert 'android:exported="true"' in manifest
ET.parse(APP/'AndroidManifest.xml')
for p in (APP/'res/xml').glob('*.xml'):ET.parse(p)
for p in (APP/'res/values').glob('*.xml'):ET.parse(p)

with tempfile.TemporaryDirectory() as tmp:
    tmp=Path(tmp)
    pure=['SafeUrlPolicy','DeadlinePolicy','AppSessionBoundary','NativeRecordOwnershipPolicy','DraftDocxWriter','CaseIndexDocxWriter']
    runner=tmp/'L3PolicySmoke.java'
    runner.write_text('''import nl.larenlex.app.*;
import java.io.*;
public class L3PolicySmoke {
 public static void main(String[] args) throws Exception {
  if(SafeUrlPolicy.isAllowed("https://avofis-platform.example.invalid"))throw new AssertionError();
  if(SafeUrlPolicy.isAllowed("file:///etc/passwd"))throw new AssertionError();
  if(NativeRecordOwnershipPolicy.canDisplay("tenant-a","owner","tenant-b","owner",true,true,false))throw new AssertionError();
  if(NativeRecordOwnershipPolicy.canDisplay("tenant-a","owner","tenant-a","other",true,false,false))throw new AssertionError();
  if(!NativeRecordOwnershipPolicy.canDisplay("tenant-a","owner","tenant-a","owner",false,false,false))throw new AssertionError();
  AppSessionBoundary lock=new AppSessionBoundary();if(lock.canUsePrivateData())throw new AssertionError();
  lock.onBackground();if(lock.canUsePrivateData()||lock.generation()!=1)throw new AssertionError();
  if(!DeadlinePolicy.reminderOnly("2026-11-01").contains("resmî tebligat"))throw new AssertionError();
  try {DeadlinePolicy.reminderOnly("2026-02-30");throw new AssertionError();}catch(java.time.DateTimeException accepted){}
  try(OutputStream out=new FileOutputStream(args[0])){DraftDocxWriter.writeExample(out,"Örnek <&> başlık");}
  System.out.println("L3_PURE_JAVA_SOURCE_AND_DOCX_OK");
 }
}''')
    cmd=['javac','-d',str(tmp)]+[str(JAVA/(name+'.java')) for name in pure]+[str(runner)]
    p=subprocess.run(cmd,capture_output=True,text=True)
    assert p.returncode==0,p.stderr
    docx=tmp/'sample.docx'
    p=subprocess.run(['java','-cp',str(tmp),'L3PolicySmoke',str(docx)],capture_output=True,text=True)
    assert p.returncode==0,p.stderr
    with zipfile.ZipFile(docx) as z:
        assert z.testzip() is None
        assert set(z.namelist())=={'[Content_Types].xml','_rels/.rels','word/document.xml'}
        ET.fromstring(z.read('word/document.xml'))
        assert b'&lt;&amp;&gt;' in z.read('word/document.xml')
    print('POLICY_AND_DOCX_JAVA_PASS',p.stdout.strip())

with sync_playwright() as playwright:
    for label,width,height in [('mobile',390,844),('desktop',1280,800)]:
        browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
        assert page.locator('#module-grid .module').count()==14
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        for i in range(14):
            page.locator('#module-grid .module').nth(i).click()
            assert page.locator('#view-module:not(.hidden)').count()==1
            page.locator('#back-modules').click()
        page.locator('#module-grid .module').first.click()
        page.locator('#group-list button').first.click()
        page.locator('#feature-list button').first.click()
        page.locator('#simulate-draft').click()
        assert 'Sentetik taslak' in page.locator('#feature-result').inner_text()
        page.locator('#simulate-lock').click()
        page.locator('#simulate-draft').click()
        assert 'Kilitli' in page.locator('#feature-result').inner_text()
        page.locator('[data-nav="documents"]').click()
        page.locator('#doc-preview').click()
        assert 'OFFLINE_UI_ONLY' in page.locator('#doc-output').inner_text()
        page.locator('[data-nav="staff"]').click()
        assert page.locator('#staff-list li').count()==16
        page.locator('[data-nav="home"]').click()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not errors,errors
        page.screenshot(path=str(ROOT/'preview'/f'LARENLEX_L3_{label.upper()}_EKRAN.png'),full_page=True)
        browser.close()
        print('BROWSER_PASS',label,'14/14 module routes','16 staff areas', 'no horizontal overflow')
print('L3_REQUIRED_SINGLE_VERIFICATION_PASS')
