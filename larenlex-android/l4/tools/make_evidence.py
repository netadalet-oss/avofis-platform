import json,datetime,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
c=json.loads((root/'android/app/src/main/assets/l4_legal_catalog.json').read_text())
status={
'LX-040':('17/17 ana hizmet ve kaynak tanımı','Ülke, meslekî yetki, sorumlu/ücret ve bağımsız hukukî onay bekliyor'),
'LX-041':('14/14 tarihî hedef kitle slug referansı; 12 kimliksiz eksik rota kayıt yeri','12 özgün sorun rota URL/ID kaynağı yok; ilişkiler açılmadı'),
'LX-042':('16 rehber, 7 kurumsal sayfa, 8 belge listesi için kanıt modeli','31 özgün içerik/URL/sürüm/insan onay kaydı yok'),
'LX-043':('Sentetik intake→triyaj→matter→delil→uzman→örnek dışa aktarma safhaları','Gerçek bağımsız backend, RLS ve mobil API entegrasyonu yok'),
'LX-044':('16 personel modülün ID ve varsayılan read/write kapalı politikası','Gerçek oturum, matter scope ve MFA kabulü yok'),
'LX-045':('Koşullu belge alanı ve insan onayı, resmî makbuzdan ayrı taslak statüsü','İnsan hukukî onayı ve gerçek DOCX/PDF Android cihaz regresyonu yok'),
'LX-046':('TR/NL/DE/EN/AR/RU arayüz nav taslak çevirisi ve Arapça RTL','Altı dilin hukukî çeviri/terminoloji incelemesi yok'),
'LX-047':('Tarayıcı mobil/desktop/320px ölçek tasarımı, Android en az 48dp buton','TalkBack/Android gerçek cihaz WCAG 2.2 AA kabulü yok'),
'LX-048':('IND01–08, G1–G4 kaynak açıklamaları ve varsayılan gönderim yasağı','Yazılı vekâlet, kişi/ülke/süre ve uzman onayı yok'),
'LX-049':('J01–16, Rechtspraak ve IND bilgileri; gerçek kurum işlemi kapalı','Resmî adaptör/erişim/kimlik/kurum kabulü yok'),
'LX-050':('Finans ve ücret taslağı için üretim ödeme/PSP kesin kapalı politika','Ücret, sağlayıcı, tüketici hakları ve gerçek ödeme onayları yok'),
'LX-051':('AVG/GDPR veri yakalama/DSAR/transfer varsayılan kapalı şema','DPIA, DPA, veri sorumlusu, saklama ve uzman onayı yok')}
reg=[]
for key,(done,pending) in status.items():reg.append({'lx':key,'implemented_offline':done,'still_open':pending,'technical_independent_acceptance':False,'legal_human_acceptance':False,'released':False})
modules=[]
for m in c['modules']:
    modules.append({'id':m['id'],'title':m['title'],'subgroups':len(m['groups']),'a2_features':sum(len(g['features']) for g in m['groups']),
      'L4_mobile_navigation':'IMPLEMENTED_IN_ANDROID_SOURCE_AND_HTML_PREVIEW',
      'L4_legal_content':'SOURCE_REGISTER_ONLY_NOT_HUMAN_APPROVED',
      'L4_translation':'UI_NAV_DRAFT_NOT_LEGAL_APPROVED',
      'L4_matter_privacy':'EXTERNAL_DATA_WRITE_DISABLED',
      'L4_documents':'DRAFT_ONLY',
      'device_accepted':False,'independently_accepted':False})
regfile=root/'evidence/L4_LX040_051_AND_ALL_MODULE_ACCEPTANCE.json'
regfile.write_text(json.dumps({'product':'LarenLex Android','stage':'L4','level_work_cycle':'DELIVERED_SUBJECT_TO_LAST_VALIDATION','L4_tasks':reg,'14_module_matrix':modules,'scope_counts':{'modules':14,'subgroups':69,'A2':453,'services_source_titles':17,'audiences_reference_routes':14,'unverified_original_issue_routes':12,'guides_placeholder':16,'corporate_pages_placeholder':7,'document_lists_placeholder':8,'IND_procedures':8,'IND_gates':4,'J_tasks':16,'staff_modules':16,'ui_languages_unreviewed':6},'explicit_nonclaims':['No real Android APK','No legal translation approval','No official submissions','No portal code reuse or production deployment','No PostgreSQL or mobile device acceptance']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(regfile)
