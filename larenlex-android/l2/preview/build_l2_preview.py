"""Offline, interactive, full 14-module L2 design preview; does NOT call Python WSGI API."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
L1=Path('/mnt/data/larenlex_l1/preview/LARENLEX_ANDROID_L1_BUTUN_UYGULAMA_ONIZLEME.html')
html=L1.read_text(encoding='utf-8')
assert html.count('</main>')==1 and html.count('</body>')==1
html=html.replace('LarenLex • Tüm Uygulama — L1 Veri ve Yetki Önizlemesi',
                  'LarenLex • Tüm Uygulama — L2 API ve İşlem Önizlemesi')
html=html.replace('L1 · veri ve yetki prototipi · yayımlanmadı',
                  'L2 · 14 modül API/işlem prototipi · yayımlanmadı')
html=html.replace('LarenLex Android • L1 bütün ürün maketi',
                  'LarenLex Android • L2 bütün ürün maketi')
css='''
/* L2 interactive offline drilldown: works on phone and desktop */
.l2-wrap{margin:28px 0 38px; padding:24px; border:1px solid #596780; background:#09142b; color:#eef3ff; border-radius:18px}
.l2-wrap h2{font-size:clamp(22px,4vw,29px);margin:8px 0}
.l2-warning{border-left:4px solid #dfb855;padding:12px;background:#302716;border-radius:6px;color:#fff1ce;margin:12px 0}
.l2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}
.l2-tile{border-radius:12px;border:1px solid #566987;background:#152240;color:#eff5ff;text-align:left;display:flex;flex-direction:column;gap:7px;padding:15px;cursor:pointer}
.l2-tile b{color:#f9ce74}.l2-tile small{color:#bdcbe5}.l2-tile[aria-pressed=true]{outline:2px solid #efc66a;outline-offset:1px}
.l2-form{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:14px}
.l2-form label{display:grid;gap:5px;font-size:13px;color:#b9d2ec}.l2-form select,.l2-form input{background:#09102b;color:white;border:1px solid #798aa7;border-radius:8px;padding:12px;min-width:0;width:100%}
.l2-actions{display:flex;flex-wrap:wrap;gap:9px;margin:14px 0}.l2-actions button{border:1px solid #deb965;background:#d8b359;color:#17192c;border-radius:10px;font-weight:700;min-height:44px;padding:9px 12px;cursor:pointer}.l2-actions button.secondary{color:#f8f2d8;background:transparent}
.l2-output{background:#050a18;min-height:92px;padding:15px;border:1px solid #63708b;border-radius:10px;color:#dbf2ff;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}
.l2-decision{font-size:14px;margin:12px 0;padding:12px;border:1px solid #927447;border-radius:9px}
.l2-decision.deny{border-color:#ba6571;color:#ffbfc5}.l2-decision.allow{border-color:#5cba92;color:#a9edce}
.l2-assess{font-size:12px;color:#b6c5d9;line-height:1.6}
@media(max-width:700px){.l2-grid,.l2-form{grid-template-columns:1fr}.l2-wrap{padding:15px}}
'''
html=html.replace('</style>',css+'</style>',1)
section='''
<section id="l2-interactive" class="l2-wrap" aria-labelledby="l2-heading">
 <div class="kicker">L2 • Tüm ürün • 14 modül</div>
 <h2 id="l2-heading">Kimlik · API · veri işlemleri · yetki sınırı</h2>
 <p>Özgün 453 işlev kimliği üstteki modül gezgininde yer alır. Aşağıda bütün modüller için L2 sentetik rota sözleşmesi ve kullanıcı rolüne göre işlem akışını inceleyebilirsiniz.</p>
 <div class="l2-warning" role="note"><b>Çevrimdışı etkileşimli prototip.</b> Bu ekran gerçek sunucuya, PostgreSQL'e, hukukî dosyaya veya Android APK'ya bağlanmaz. Simülatör sonuçları kanıt niteliğinde değildir; ayrı Python WSGI/SQLite testleri gerçek yerel test kanıtıdır.</div>
 <div id="l2-module-grid" class="l2-grid" aria-label="14 modül için işlem gezinimi"></div>
 <div class="l2-form">
   <label for="l2-module">Modül<select id="l2-module"></select></label>
   <label for="l2-actor">Sentetik kullanıcı rolü<select id="l2-actor"><option value="owner">Dosya sahibi müşteri</option><option value="same-other">Aynı tenant, başka müşteri</option><option value="foreign">Başka tenant</option><option value="staff-mfa">Atanmış personel + MFA</option><option value="staff-nomfa">Personel, MFA yok</option><option value="staff-unassigned">Personel, atama yok</option><option value="revoked">İptal edilmiş oturum</option></select></label>
   <label for="l2-activity">İşlem<select id="l2-activity"><option value="create">POST · Taslak oluştur</option><option value="list">GET · Dosya kayıtlarını listele</option><option value="read">GET · Kayıt oku</option><option value="update">PATCH · Revizyonla güncelle</option><option value="delete">DELETE · Kayıt sil</option></select></label>
   <label for="l2-feature">Örnek özgün A2 işlevi<select id="l2-feature"></select></label>
 </div>
 <div id="l2-authorize" role="status" class="l2-decision"></div>
 <div class="l2-actions"><button type="button" id="l2-execute">Sentetik işlemi dene</button><button type="button" id="l2-reset" class="secondary">Yerel simülasyonu sıfırla</button></div>
 <pre id="l2-output" class="l2-output" aria-live="polite">Modül ve işlem seçerek sentetik sonucu görüntüleyin.</pre>
 <p class="l2-assess">L2 yerel test kapsamı: tenant / dosya sahibi / modül ataması / MFA / oturum iptali / iyimser sürüm kontrolü / JSON boyut ve alan sınırları / imzalı, kısa ömürlü sentetik belge referansı. Tarihî A4 102 API kimliği ayrıca korunmuştur, bu 102 rotanın üretimde uygulandığı iddia edilmez.</p>
</section>
'''
html=html.replace('</main>',section+'</main>',1)
script='''
<script id="l2-controller">
(function(){
 'use strict';
 const original=JSON.parse(document.getElementById('module-data').textContent);
 const metadata=JSON.parse(document.getElementById('l1-domain-data').textContent);
 const grid=document.getElementById('l2-module-grid');
 const moduleSelect=document.getElementById('l2-module');
 const actorSelect=document.getElementById('l2-actor');
 const activitySelect=document.getElementById('l2-activity');
 const featureSelect=document.getElementById('l2-feature');
 const decision=document.getElementById('l2-authorize');
 const output=document.getElementById('l2-output');
 const local=new Map();let counter=0;
 function selected(){return moduleSelect.value;}
 function allowed(){const staffOnly=['LX-09','LX-12','LX-13','LX-14'].includes(selected());
   if(actorSelect.value==='staff-mfa')return true;
   return actorSelect.value==='owner'&&!staffOnly;
 }
 function verdict(){const ok=allowed();decision.className='l2-decision '+(ok?'allow':'deny');
   decision.textContent=(ok?'SENTETİK İZİN':'SENTETİK RET')+' — '+(ok?'Örnek kimlik ve dosya/modül koşulları sağlandı varsayılır.':'Güven sınırı: dosya sahibi, tenant, personel ataması, MFA veya oturum koşulu eksik.');}
 function setModule(id){moduleSelect.value=id;featureSelect.replaceChildren();const m=original.find(x=>x.id===id);
  for(const g of Object.values(m.groups))for(const f of g.features){const op=document.createElement('option');op.value=f.id;op.textContent=f.id+' · '+f.title;featureSelect.append(op);}
  for(const b of grid.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.id===id));
  verdict();}
 for(const m of metadata){const b=document.createElement('button');b.type='button';b.className='l2-tile';b.dataset.id=m.system_id;
  b.setAttribute('aria-pressed','false');
  for(const [tag,value] of [['b',m.system_id],['strong',m.system_title],['small',m.proposed_l1_record_kind+' · '+m.source_features+' tanımlı işlev'],['small','Gerçek üretim kabulü: yok']]){
    const el=document.createElement(tag);el.textContent=value;b.append(el);}
  b.addEventListener('click',()=>{setModule(m.system_id);document.querySelector('#l2-heading').scrollIntoView({block:'start',behavior:'auto'});});
  grid.append(b);const o=document.createElement('option');o.value=m.system_id;o.textContent=m.system_id+' · '+m.system_title;moduleSelect.append(o);
 }
 moduleSelect.addEventListener('change',()=>setModule(selected()));actorSelect.addEventListener('change',verdict);
 document.getElementById('l2-execute').addEventListener('click',()=>{
  const module=selected(), op=activitySelect.value, feature=featureSelect.value, method=({create:'POST',list:'GET',read:'GET',update:'PATCH',delete:'DELETE'})[op];
  const path=op==='list'||op==='create'?'/v2/matters/demo-matter/modules/'+module+'/records':'/v2/records/demo-record';
  if(!allowed()){output.textContent=JSON.stringify({status:404,error:'resource unavailable',module,method,path,source:'BROWSER_SIMULATION_NOT_HTTP'},null,2);return;}
  let records=local.get(module)||[];let body={status:200,method,path,module,source:'LOCAL_BROWSER_MEMORY_ONLY_NOT_REAL_API'};
  if(op==='create'){const item={id:'demo-'+(++counter),feature_id:feature,label:'Sentetik taslak',state:'draft',version:1};records.push(item);local.set(module,records);body={...body,status:201,record:item};}
  if(op==='list')body.records=records;
  if(op==='read'){body.record=records.at(-1)||null;if(!body.record)body={...body,status:404,error:'no demo record'};}
  if(op==='update'){if(records.length){const r=records.at(-1);if(r.state==='archived')body={...body,status:409,error:'immutable'};else{r.label='Sentetik inceleme';r.state='review';r.version++;body.record=r;}}else body={...body,status:404,error:'no demo record'};}
  if(op==='delete'){if(records.length){body.deleted=records.pop().id;local.set(module,records);}else body={...body,status:404,error:'no demo record'};}
  output.textContent=JSON.stringify(body,null,2);
 });
 document.getElementById('l2-reset').addEventListener('click',()=>{local.clear();counter=0;output.textContent='Yerel simülasyon temizlendi. Gerçek sunucu verisi yoktur.';});
 setModule('LX-01');
})();
</script>
'''
html=html.replace('</body>',script+'</body>',1)
assert 'id="l2-module-grid"' in html and 'BROWSER_SIMULATION_NOT_HTTP' in html
out=ROOT/'preview/LARENLEX_ANDROID_L2_BUTUN_UYGULAMA_ONIZLEME.html'
out.write_text(html,encoding='utf-8')
print(out, out.stat().st_size)
