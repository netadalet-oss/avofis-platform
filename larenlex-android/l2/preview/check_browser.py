"""Real Chromium DOM and screenshot checks of offline preview (no network)."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

BASE=Path(__file__).resolve().parents[1]
html=(BASE/'preview/LARENLEX_ANDROID_L2_BUTUN_UYGULAMA_ONIZLEME.html').read_text(encoding='utf-8')
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for name,size in [('mobile',{'width':390,'height':844}),('desktop',{'width':1440,'height':900})]:
        page=browser.new_page(viewport=size,device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='domcontentloaded')
        page.locator('#l2-module-grid button').first.wait_for(timeout=10000)
        count=page.locator('#l2-module-grid button').count()
        assert count==14,count
        modules=page.locator('#l2-module option').count()
        assert modules==14
        assert page.locator('#l2-feature option').count()>0
        page.locator('#l2-activity').select_option('create')
        page.locator('#l2-actor').select_option('owner')
        page.locator('#l2-execute').click()
        assert '"status": 201' in page.locator('#l2-output').inner_text()
        page.locator('#l2-actor').select_option('foreign')
        page.locator('#l2-execute').click()
        assert '"status": 404' in page.locator('#l2-output').inner_text()
        page.locator('#l2-module').select_option('LX-09')
        page.locator('#l2-actor').select_option('owner')
        assert 'SENTETİK RET' in page.locator('#l2-authorize').inner_text()
        page.locator('#l2-actor').select_option('staff-mfa')
        assert 'SENTETİK İZİN' in page.locator('#l2-authorize').inner_text()
        page.locator('#l2-execute').click()
        assert '"status": 201' in page.locator('#l2-output').inner_text()
        page.locator('#l2-reset').click()
        assert 'temizlendi' in page.locator('#l2-output').inner_text()
        overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
        assert not overflow, 'horizontal overflow'
        assert not errors,errors
        page.locator('#l2-interactive').scroll_into_view_if_needed()
        dest=BASE/f'preview/LARENLEX_ANDROID_L2_{name.upper()}_EKRAN.png'
        page.screenshot(path=str(dest),full_page=True)
        results.append({'view':name,'width':size['width'],'module_cards':count,
                        'errors':errors,'overflow':overflow,'screenshot':dest.name,
                        'synthetic_post':201,'cross_tenant_denial':404})
        page.close()
    browser.close()
out=BASE/'evidence/L2_BROWSER_TEST.json'
out.write_text(json.dumps({'status':'PASS','observations':results,'browser':'system chromium, playwright, set_content; offline DOM'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(results,ensure_ascii=False))
