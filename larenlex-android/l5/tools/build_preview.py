"""Build full-app L5 HTML without external assets, handlers or network calls."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
base=(Path('/mnt/data/larenlex_l4/preview/LARENLEX_L4_BUTUN_UYGULAMA_ETKILESIMLI_ONIZLEME.html')).read_text()
mods=json.loads((ROOT/'android/app/src/main/assets/l5_integration.json').read_text())['modules']
assert len(mods)==14 and sum(m['features'] for m in mods)==453
js=json.dumps(mods,ensure_ascii=False).replace('<','\\u003c')
style='''<style>
#l5-panel{max-width:1180px;margin:12px auto 32px;padding:20px;border:1px solid #dce4e9;background:#fff;border-radius:14px;box-shadow:0 8px 24px #12263c14;color:#18304b}
#l5-panel h2{font-size:24px;margin:3px 0 12px}#l5-panel .l5-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:10px}
#l5-panel .l5-card{background:#f8fafc;border:1px solid #dce4e9;border-radius:12px;padding:14px}#l5-panel .l5-card b{display:block;margin-bottom:5px}#l5-panel .l5-card button{width:100%;text-align:left;background:#fff;color:#18304b;border:1px solid #dce4e9;border-radius:9px;padding:9px;min-height:48px}
#l5-panel .l5-tag{font-size:13px;color:#4b6175}#l5-panel .l5-inputs{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin:12px 0}#l5-panel label{display:grid;gap:4px;font-weight:600;min-width:180px;flex:1}#l5-panel select{height:48px;border:1px solid #a6b4c3;padding:8px;border-radius:8px;background:#fff;color:#18304b}#l5-panel .l5-output{border-left:5px solid #b58b4b;background:#f4f7f9;padding:14px;min-height:62px}#l5-panel .l5-warning{font-size:14px;margin:12px 0;background:#fef5e7;border:1px solid #e8bd83;padding:12px;border-radius:8px}
@media(max-width:600px){#l5-panel{margin:10px;padding:14px}#l5-panel .l5-grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){#l5-panel *{scroll-behavior:auto!important}}
</style>'''
append='''<section id="l5-panel" aria-label="L5 entegrasyon ve kanıt">
<p class="l5-tag">LARENLEX ANDROID · L5 · ÇEVRİMDIŞI ÖNİZLEME</p><h2>Tüm modüllerde entegrasyon ve güvenli erişim</h2>
<p class="l5-warning" role="note">Bu ekran yalnız sentetik HTTP sözleşmesi ve rol kararlarını simüle eder. Gerçek sunucu, Android APK, bağımsız PostgreSQL RLS, hukukî temsil, ödeme, resmî gönderim veya +46 kabul yoktur. L4 hukukî katalog ve altı dil sekmeleri üstte korunmuştur.</p>
<div class="l5-inputs"><label for="l5-role">Örnek erişim rolü<select id="l5-role"><option value="owner">Dosya sahibi müşteri</option><option value="other">Aynı tenant, başka müşteri</option><option value="foreign">Farklı tenant</option><option value="staff">Personel (MFA ve dosya+modül ataması)</option><option value="nomfa">Personel (MFA yok)</option><option value="revoked">Oturum iptal edilmiş</option></select></label>
<label for="l5-action">Örnek API işlemi<select id="l5-action"><option value="GET">GET · kayıt görüntüleme</option><option value="POST">POST · sentetik kayıt oluşturma</option><option value="PATCH">PATCH · sürüm kontrolü</option><option value="DELETE">DELETE · kayıt silme</option></select></label></div>
<div id="l5-out" class="l5-output" role="status" aria-live="polite">Bir modül seçin. Simülasyon herhangi bir ağ isteği göndermez.</div>
<h3>14 sistem için iz ve sözleşme görünümü</h3><div id="l5-grid" class="l5-grid"></div>
<p class="l5-tag">L5 yerel HTTP test kapsamı: 453 sentetik oluşturma ve 453 farklı-tenant ret kontrolü. Tarihî A4 operasyonları: 102, üretim uygulama kabulü: 0.</p></section>'''
script='''<script>(function(){"use strict";
const m=__L5_MODULES__;
const grid=document.getElementById('l5-grid'),output=document.getElementById('l5-out');
for(const item of m){const card=document.createElement('article');card.className='l5-card';const button=document.createElement('button');button.type='button';button.textContent=item.id+' · '+item.title;button.addEventListener('click',()=>choose(item));card.append(button);const info=document.createElement('p');info.className='l5-tag';info.textContent=item.groups+' alt grup · '+item.features+' A2 ID · sentetik kayıt kapsamı';card.append(info);grid.append(card)}
function choose(item){const role=document.getElementById('l5-role').value,verb=document.getElementById('l5-action').value;const staffOnly=['LX-09','LX-12','LX-13','LX-14'].includes(item.id);let status='403 / 404 · Erişim reddi';
if(role==='owner'&&!staffOnly)status=(verb==='POST'?'201':verb==='PATCH'?'200':'200')+' · Sentetik politika izinli';
if(role==='staff')status=(verb==='POST'?'201':'200')+' · Sentetik politika izinli (MFA ve atama varsayımı)';
output.textContent=item.id+' · '+item.title+' — '+verb+' — '+status+'. Gerçek API çağrısı yapılmadı; sunucu izni doğrulanmadı.';output.dataset.currentModule=item.id;
}
document.getElementById('l5-role').addEventListener('change',()=>{const item=m.find(x=>x.id===output.dataset.currentModule);if(item)choose(item)});
document.getElementById('l5-action').addEventListener('change',()=>{const item=m.find(x=>x.id===output.dataset.currentModule);if(item)choose(item)});
})();</script>'''.replace('__L5_MODULES__',js)
assert '</head>' in base and '</body>' in base
base=base.replace('LarenLex Android • L4 tüm uygulama','LarenLex Android • L5 tüm uygulama')
base=base.replace('</head>',style+'</head>').replace('</body>',append+script+'</body>')
out=ROOT/'preview/LARENLEX_ANDROID_L5_BUTUN_UYGULAMA_ONIZLEME.html'
out.write_text(base,encoding='utf-8')
print('output',out,'bytes',out.stat().st_size)
