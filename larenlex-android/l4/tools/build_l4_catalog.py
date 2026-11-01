#!/usr/bin/env python3
"""Build L4 *offline* Android legal catalogue strictly from LarenLex special manual.
Never treats historic portal routes as enabled LarenLex services.
"""
import json,re,hashlib,argparse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MODULES=ROOT/'android/app/src/main/assets/modules.json'
DEST=ROOT/'android/app/src/main/assets/l4_legal_catalog.json'
SERVICE_SLUGS=['hukuki-danismanlik','mahkeme-temsil','avrupa-turkiye-hukuki-uzman-koordinasyonu','alacak-takibi','sozlesmeler-uyusmazliklar','konut-kira-sigorta','ceza-sikayet-trafik','resmi-basvuru-itiraz','sosyal-guvenlik-vergi','vize-oturum-vatandaslik','uluslararasi-insan-haklari','avrupa-ici-islemler','calisma-hayati','sirket-ticaret','uluslararasi-istihdam','belge-apostil-tercume','egitim-diploma']
AUDIENCES=[('avrupadaki-turkiyeliler','Avrupa’daki Türkiyeliler'),('gocmenler-ve-aileler','Göçmenler ve aileler'),('ogrenciler-ve-mezunlar','Öğrenciler ve mezunlar'),('calisanlar-ve-hak-arayanlar','Çalışanlar ve hak arayanlar'),('girisicim-ve-isletmeler','Girişimciler ve işletmeler'),('vize-basvuranlar-ve-davet-edenler','Vize başvuranlar ve davet edenler'),('turkiyeden-avrupaya','Türkiye’den Avrupa’ya'),('avrupadan-turkiyeye','Avrupa’dan Türkiye’ye'),('insan-haklari-basvurulari','İnsan hakları başvuruları'),('avrupa-ici-islemler','Avrupa içi işlemler'),('hukuki-destek-arayanlar','Hukukî destek arayanlar'),('alacakli-ve-borclular','Alacaklılar ve borçlular'),('kiracilar-ve-ev-sahipleri','Kiracılar ve ev sahipleri'),('sosyal-yardim-vergi','Sosyal yardım ve vergi')]
STAFF=['inbox','triage','matters','calendar','documents','pleadings','research','judicial','ind','messages','billing','payables','reporting','audit','people','settings']
OFFICIAL=[{'id':'OFFICIAL-IND-ASYLUM','name':'IND – Asiel aanvragen','url':'https://ind.nl/nl/verblijfsvergunningen/asiel/asiel-aanvragen-in-nederland','country':'NL','checked_date':'2026-11-01','legal_human_approved':False}, {'id':'OFFICIAL-IND-OBJECTION','name':'IND – Bezwaar en beroep','url':'https://ind.nl/nl/na-uw-aanvraag/bezwaar-maken-of-in-beroep-gaan','country':'NL','checked_date':'2026-11-01','legal_human_approved':False}, {'id':'OFFICIAL-RECHTSPRAAK','name':'Rechtspraak – Open Data','url':'https://www.rechtspraak.nl/uitspraken/open-data','country':'NL','checked_date':'2026-11-01','legal_human_approved':False}]
LANGS=['tr','nl','de','en','ar','ru']
UI={
 'tr':{'home':'Tüm modüller','services':'Hizmetler','audiences':'Kimler için?','issues':'Sorununuza göre','guides':'Rehberler','staff':'Personel','documents':'Belgeler','institutions':'Resmî kurumlar','privacy':'Gizlilik','blocked':'İşlem etkin değil','back':'Geri','review':'Uzman doğrulaması bekliyor','preview':'Çevrimdışı geliştirme önizlemesi','locale':'Dil','module':'Modüller'},
 'nl':{'home':'Alle modules','services':'Diensten','audiences':'Voor wie?','issues':'Problemen','guides':'Gidsen','staff':'Medewerkers','documents':'Documenten','institutions':'Instanties','privacy':'Privacy','blocked':'Actie niet beschikbaar','back':'Terug','review':'Controle door deskundige vereist','preview':'Offline ontwikkelvoorbeeld','locale':'Taal','module':'Modules'},
 'de':{'home':'Alle Module','services':'Leistungen','audiences':'Für wen?','issues':'Probleme','guides':'Leitfäden','staff':'Mitarbeitende','documents':'Dokumente','institutions':'Behörden','privacy':'Datenschutz','blocked':'Aktion nicht verfügbar','back':'Zurück','review':'Prüfung durch Fachkraft erforderlich','preview':'Offline-Entwicklungsvorschau','locale':'Sprache','module':'Module'},
 'en':{'home':'All modules','services':'Services','audiences':'For whom?','issues':'Issues','guides':'Guides','staff':'Staff','documents':'Documents','institutions':'Authorities','privacy':'Privacy','blocked':'Action unavailable','back':'Back','review':'Professional verification required','preview':'Offline development preview','locale':'Language','module':'Modules'},
 'ar':{'home':'جميع الوحدات','services':'الخدمات','audiences':'لمن؟','issues':'المشكلات','guides':'الأدلة','staff':'فريق العمل','documents':'المستندات','institutions':'الجهات الرسمية','privacy':'الخصوصية','blocked':'الإجراء غير متاح','back':'رجوع','review':'يلزم التحقق من مختص','preview':'معاينة تطوير دون اتصال','locale':'اللغة','module':'الوحدات'},
 'ru':{'home':'Все модули','services':'Услуги','audiences':'Для кого?','issues':'Проблемы','guides':'Руководства','staff':'Сотрудники','documents':'Документы','institutions':'Органы власти','privacy':'Конфиденциальность','blocked':'Действие недоступно','back':'Назад','review':'Требуется проверка специалистом','preview':'Автономный прототип','locale':'Язык','module':'Модули'}}

def source_line(text,prefix):
    pattern=r'^- \*\*'+re.escape(prefix)+r'\*\* / `[^`]+` [^:]+: (.+?) — \*\*Bağımsız kabul:'
    m=re.search(pattern,text,re.M)
    if not m: raise ValueError('Missing canonical source for '+prefix)
    return m.group(1).strip()

def build(manual):
    text=Path(manual).read_text(encoding='utf-8')
    mods=json.loads(MODULES.read_text(encoding='utf-8'))
    if len(mods)!=14 or sum(len(m['groups']) for m in mods)!=69 or sum(len(g['features']) for m in mods for g in m['groups'])!=453:raise ValueError('Module inventory mismatch')
    services=[]
    for i,(slug) in enumerate(SERVICE_SLUGS,1):
        fid=f'LX-03.G01.F{i:02d}'
        title=source_line(text,fid)
        description_match=re.search(r'^\d+\. `'+re.escape(slug)+r'` — (.+)$',text,re.M)
        if not description_match: raise ValueError('Missing canonical description: '+slug)
        description=description_match.group(1).strip()
        services.append({'id':fid,'slug_reference_only':slug,'title_tr':title,'description_tr':description,'country':None,'professional_permission':'UNVERIFIED','availability':'CLOSED_UNTIL_LEGAL_REVIEW','responsible_professional':None,'fee_model':'UNVERIFIED','inputs':[],'outputs':[],'reviewer':None,'source_version':'LarenLex v3 IV.3, LX-03.G01','independent_acceptance':False,'route_kind':'OFFLINE_DETAIL_ONLY'})
    # Historic 14 portal slugs are kept *only* as labelled, offline references: never portal API/URL routing.
    audiences=[{'id':f'AUDIENCE-{i:02d}','historic_portal_slug_reference_only':slug,'title_tr':title,'description_tr':description,'country':None,'services_verified_links':[],'source':'LarenLex IV.3 / 6','route_enabled':False} for i,(slug,title) in enumerate(AUDIENCES,1)]
    # No exact 12 issue route IDs are present in the supplied primary source. Do not fabricate slugs.
    issues=[{'slot':i,'canonical_id':None,'canonical_slug':None,'title_tr':None,'state':'BLOCKED_MISSING_ORIGINAL_V18_ROUTE_RECORD','services_verified_links':[]} for i in range(1,13)]
    # Catalog slots are NOT fabricated guide/institution/list titles.
    content={kind:[{'slot':i,'canonical_id':None,'title':None,'source_url':None,'source_date':None,'country':None,'expert_approved':False,'state':'AWAITING_CANONICAL_CONTENT'} for i in range(1,count+1)] for kind,count in [('guides',16),('corporate_pages',7),('document_lists',8)]}
    ind=[]
    for i in range(1,9):
        fid=f'LX-11.G02.F{i:02d}'
        ind.append({'id':f'IND-{i:02d}','a2_id':fid,'title_tr':source_line(text,fid),'gates_required':['G1','G2','G3','G4'],'authorized_representative':False,'official_submission':'DISABLED','receipt':'NEVER_SYNTHESIZE'})
    gates=[{'id':f'G{i}','title_tr':source_line(text,f'LX-11.G03.F{i:02d}'),'reviewed':False} for i in range(1,5)]
    judicial=[{'id':f'J{i:02d}','title_tr':source_line(text,f'LX-11.G01.F{i:02d}'),'official_network':'DISABLED'} for i in range(1,17)]
    staff=[{'id':n,'module_scope':None,'matter_scope':None,'read':False,'write':False,'mfa_verified':False,'independent_acceptance':False} for n in STAFF]
    # Conditions are *architectural schema*, not legal advice or validated document forms.
    document={'stages':['DRAFT','REVIEW_REQUIRED','HUMAN_APPROVED_FOR_EXPORT'],'official_submission_supported':False,'official_receipt_supported':False,'fields_required_before_review':['jurisdiction','country','document_type','authority','source_version','evidence_list','responsible_expert'],'reviewer_required':True,'file_formats_planned':['DOCX','PDF'],'source':'LX-045'}
    privacy={'personal_data_capture':'DISABLED','cross_border_transfer':'DISABLED','dsar_live':'DISABLED','retention_policy':'AWAITING_DPIA_DPA_CONTROLLER_APPROVAL','explicit_consent':'NOT_COLLECTED','legal_review':None}
    return {'meta':{'product':'LarenLex Android','level':'L4','status':'OFFLINE_ARCHITECTURE_NOT_PRODUCTION','source_sha256':hashlib.sha256(text.encode()).hexdigest(),'source_primary':'LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md','service_titles_source':'LX-03.G01.F01–F17','human_legal_translation_approved':False,'independent_acceptance':False,'network_adapters_enabled':False},'modules':mods,'services':services,'audiences':audiences,'issue_routes':issues,'content':content,'staff':staff,'ind_procedures':ind,'ind_gates':gates,'judicial_tasks':judicial,'institutions':OFFICIAL,'languages':LANGS,'ui_translations_unreviewed':UI,'document_schema':document,'privacy':privacy}

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--manual',type=Path,required=True,help='Unmodified private LarenLex special manual Markdown (never publish)')
    data=build(parser.parse_args().manual)
    DEST.parent.mkdir(parents=True,exist_ok=True)
    DEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('L4 source catalogue',len(data['modules']),len(data['services']),len(data['audiences']),len(data['issue_routes']),len(data['ind_procedures']))
