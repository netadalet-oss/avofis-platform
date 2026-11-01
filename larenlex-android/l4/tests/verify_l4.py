"""One bounded L4 integration check; no production endpoints or personal data."""
import hashlib,json,subprocess,tempfile,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];APP=R/'android/app/src/main'; J=APP/'java/nl/larenlex/app'
C=json.loads((APP/'assets/l4_legal_catalog.json').read_text())
assert len(C['modules'])==14
assert sum(len(m['groups']) for m in C['modules'])==69
ids=[f['id'] for m in C['modules'] for g in m['groups'] for f in g['features']]
assert len(ids)==len(set(ids))==453
assert len(C['services'])==17 and len(set(s['id'] for s in C['services']))==17
assert all(s['description_tr'] and s['availability']=='CLOSED_UNTIL_LEGAL_REVIEW' and s['reviewer'] is None for s in C['services'])
assert len(C['audiences'])==14 and len(set(a['historic_portal_slug_reference_only'] for a in C['audiences']))==14
assert len(C['issue_routes'])==12 and all(x['canonical_slug'] is None for x in C['issue_routes'])
assert [len(C['content'][k]) for k in ('guides','corporate_pages','document_lists')]==[16,7,8]
assert len(C['staff'])==16 and all(not x['read'] and not x['write'] for x in C['staff'])
assert len(C['ind_procedures'])==8 and len(C['ind_gates'])==4 and len(C['judicial_tasks'])==16
assert len(C['institutions'])==3 and all(not x['legal_human_approved'] for x in C['institutions'])
assert C['languages']==['tr','nl','de','en','ar','ru']
keys=set(C['ui_translations_unreviewed']['tr']);assert all(set(x)==keys for x in C['ui_translations_unreviewed'].values())
assert C['meta']['network_adapters_enabled'] is False and C['meta']['human_legal_translation_approved'] is False
manifest=(APP/'AndroidManifest.xml').read_text()
assert 'android.permission.INTERNET' not in manifest
assert 'android:allowBackup="false"' in manifest
assert '<activity android:name=".L4LegalFlowsActivity" android:exported="false"' in manifest
ET.fromstring(manifest)
assert 'addJavascriptInterface' not in ''.join(p.read_text() for p in J.glob('*.java'))
assert 'L4LegalFlowsActivity.class' in (J/'MainActivity.java').read_text()
print('L4_SOURCE_SCOPE_PASS: 14/69/453, 17 services, 14 audiences, 12 unverified issue slots, 31 metadata slots, 8 IND, 4 G, 16 J, 16 staff, 6 languages')
with tempfile.TemporaryDirectory() as tmp:
    dest=Path(tmp)
    runner=dest/'L4Smoke.java'
    runner.write_text('''import nl.larenlex.app.*;import java.time.LocalDate;
public class L4Smoke {public static void main(String[] args){
 if(L4ProcessGate.canInvokeExternalAdapter("IND"))throw new AssertionError("network adapter");
 if(L4ProcessGate.canMarkPaid(true,true,true))throw new AssertionError("fake payment");
 if(L4ProcessGate.canCreateOfficialReceipt(true))throw new AssertionError("fake official receipt");
 if(!L4ProcessGate.canAccessMatter(true,true,false,false,true,false))throw new AssertionError("owner access");
 if(L4ProcessGate.canAccessMatter(false,true,true,true,true,false))throw new AssertionError("cross tenant");
 if(L4ProcessGate.canAccessMatter(true,false,true,false,true,false))throw new AssertionError("MFA bypass");
 if(!L4ProcessGate.canMarkReadyForReview(true,true,true,true,true))throw new AssertionError("review inputs");
 if(L4ProcessGate.canMarkReadyForReview(true,true,true,false,true))throw new AssertionError("stale source");
 if(L4ProcessGate.classifyDraft(true,true,false)!=L4ProcessGate.Stage.REVIEW_REQUIRED)throw new AssertionError("human translation");
 L4CaseWorkflow workflow=new L4CaseWorkflow();
 if(workflow.advance(L4CaseWorkflow.State.MATTER_DRAFT,0,true,true,true,true,true,true))throw new AssertionError("skip triage");
 if(!workflow.advance(L4CaseWorkflow.State.TRIAGE,0,true,true,true,true,false,false))throw new AssertionError("triage");
 if(workflow.advance(L4CaseWorkflow.State.MATTER_DRAFT,0,true,true,true,true,false,false))throw new AssertionError("revision bypass");
 if(workflow.officialSubmissionAllowed())throw new AssertionError("official submit");
 LocalDate today=LocalDate.of(2026,11,1);
 if(L4SourceFreshness.mayClaimCurrent("DE","NL","https://ind.nl",today,today,today,true))throw new AssertionError("country");
 if(L4SourceFreshness.mayClaimCurrent("NL","NL","https://ind.nl",today,today,today,false))throw new AssertionError("human review");
 if(L4SourceFreshness.mayClaimCurrent("NL","NL","https://ind.nl",today,today.minusDays(1),today,true))throw new AssertionError("stale");
 System.out.println("L4_JAVA_POLICY_PASS");
}}''')
    files=[J/x for x in ['L4ProcessGate.java','L4CaseWorkflow.java','L4SourceFreshness.java']]
    res=subprocess.run(['javac','-encoding','UTF-8','-d',str(dest)]+list(map(str,files))+[str(runner)],capture_output=True,text=True)
    if res.returncode:raise AssertionError(res.stderr)
    res=subprocess.run(['java','-cp',str(dest),'L4Smoke'],capture_output=True,text=True)
    assert res.returncode==0,res.stderr
    print(res.stdout.strip())
HTML=R/'preview/LARENLEX_L4_BUTUN_UYGULAMA_ETKILESIMLI_ONIZLEME.html'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for label,wd,ht in [('mobile',390,844),('desktop',1280,900),('small_200pct',320,800)]:
        page=browser.new_page(viewport={'width':wd,'height':ht})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
        if label=='small_200pct':page.evaluate("document.documentElement.style.fontSize='32px'")
        assert page.locator('#content .tile').count()==14,('modules',label)
        assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),('overflow',label,page.evaluate('document.documentElement.scrollWidth'))
        page.locator('#navigation [data-key="services"]').click()
        assert page.locator('#content .tile').count()==17
        page.locator('#content .tile button').first.click()
        assert 'Bağımsız kabul yok' in page.locator('#content').inner_text()
        page.locator('#navigation [data-key="audiences"]').click()
        assert page.locator('#content .tile').count()==14
        page.locator('#navigation [data-key="issues"]').click()
        assert page.locator('#content .tile').count()==12
        page.locator('#navigation [data-key="staff"]').click()
        assert page.locator('#content .tile').count()==16
        page.locator('#navigation [data-key="documents"]').click()
        page.locator('#content .inline-button').last.click()
        assert 'EKSİK TASLAK' in page.locator('#content .out').inner_text()
        page.locator('#language').select_option('ar')
        assert page.evaluate('document.documentElement.dir')=='rtl'
        assert page.locator('#content select').count()==4
        page.locator('#language').select_option('tr')
        page.locator('#navigation [data-key="institutions"]').click()
        assert page.locator('#content .subitem').count()>=28
        assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),('overflow after navigation',label)
        assert not errors,errors
        path=R/'preview'/f'LARENLEX_L4_{label.upper()}_EKRAN.png';page.screenshot(path=str(path),full_page=True)
        print('L4_BROWSER_PASS',label,'14 modules,17 services,14 audiences,12 blocked issues,16 staff, Arabic RTL, docs review')
        page.close()
    browser.close()
print('L4_SINGLE_VALIDATION_PASS')
