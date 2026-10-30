-- AVOfis FORM-03 production-compatible contextual intake schema revision.
-- Forward additive: keeps all original FORM-01 v1 records, adds v2 validation.
-- Requires FORM-02 migration; no live execution without action-specific approval.
begin;
create function public.avofis_form03_v2_valid(p jsonb,p_slug text,p_locale text)
returns boolean language plpgsql immutable set search_path='' as $validator$
declare v jsonb; k text; raw text; allowed text[]; y int; m int; d int;
begin
 if jsonb_typeof(p)<>'object' or p->'version'<>'2'::jsonb
  or p->'schemaRevision'<>'1'::jsonb or p->>'service'<>p_slug
  or p->>'locale'<>p_locale or octet_length(p::text)>24000 then return false; end if;
 if (select count(*) from jsonb_object_keys(p))<>10 then return false; end if;
 if not (p ?& array['version','schemaRevision','service','locale',
   'country','institution','purpose','chronology','documentList','answers']) then return false; end if;
 foreach k in array array['country','institution','purpose','chronology','documentList'] loop
  v:=p->k;
  if jsonb_typeof(v)<>'string' or length(p->>k)>4000
    or (p->>k) ~ '[[:cntrl:]]' then return false; end if;
 end loop;
 if jsonb_typeof(p->'answers')<>'object' then return false; end if;
 allowed:=case p_slug
  when 'hukuki-danismanlik' then string_to_array('incidentDate,otherParty,decisionReference,requestedAction',',')
  when 'mahkeme-temsil' then string_to_array('caseReference,noticeDate,courtOrAuthority,requestedAction',',')
  when 'avrupa-turkiye-hukuki-uzman-koordinasyonu' then string_to_array('courtOrAuthority,decisionReference,documentOrigin,requestedAction',',')
  when 'alacak-takibi' then string_to_array('invoiceAmount,contractDate,otherParty,requestedAction',',')
  when 'sozlesmeler-uyusmazliklar' then string_to_array('contractDate,otherParty,contractType,requestedAction',',')
  when 'konut-kira-sigorta' then string_to_array('contractDate,otherParty,incidentDate,requestedAction',',')
  when 'ceza-sikayet-trafik' then string_to_array('incidentDate,courtOrAuthority,decisionReference,requestedAction',',')
  when 'resmi-basvuru-itiraz' then string_to_array('noticeDate,decisionReference,courtOrAuthority,requestedAction',',')
  when 'sosyal-guvenlik-vergi' then string_to_array('noticeDate,decisionReference,benefitType,requestedAction',',')
  when 'vize-oturum-vatandaslik' then string_to_array('expiryDate,decisionReference,courtOrAuthority,requestedAction',',')
  when 'uluslararasi-insan-haklari' then string_to_array('noticeDate,courtOrAuthority,decisionReference,requestedAction',',')
  when 'avrupa-ici-islemler' then string_to_array('documentOrigin,decisionReference,courtOrAuthority,requestedAction',',')
  when 'calisma-hayati' then string_to_array('employerName,contractDate,noticeDate,requestedAction',',')
  when 'sirket-ticaret' then string_to_array('organizationName,contractType,documentOrigin,requestedAction',',')
  when 'uluslararasi-istihdam' then string_to_array('employerName,employmentCategory,contractDate,requestedAction',',')
  when 'belge-apostil-tercume' then string_to_array('documentOrigin,appointmentDate,courtOrAuthority,requestedAction',',')
  when 'egitim-diploma' then string_to_array('qualificationName,documentOrigin,decisionReference,requestedAction',',')
  else null end;
 if allowed is null then return false; end if;
 for k,v in select key,value from jsonb_each(p->'answers') loop
  if not k=any(allowed) or jsonb_typeof(v)<>'string' then return false; end if;
  raw:=v #>> '{}';
  if length(raw)>1200 or raw ~ '[[:cntrl:]]' then return false; end if;
  if raw<>'' and k=any(array['incidentDate','noticeDate','contractDate','expiryDate','appointmentDate']) then
   if raw !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then return false; end if;
   y:=substring(raw,1,4)::int;m:=substring(raw,6,2)::int;d:=substring(raw,9,2)::int;
   if y<1800 or y>2200 then return false; end if;
   begin perform pg_catalog.make_date(y,m,d);
   exception when others then return false; end;
  end if;
  if raw<>'' and k='invoiceAmount' and raw !~ '^[0-9]{1,10}([.,][0-9]{1,2})?$' then
   return false; end if;
 end loop;
 return true;
exception when others then return false;
end $validator$;
revoke all on function public.avofis_form03_v2_valid(jsonb,text,text) from public,anon;
grant execute on function public.avofis_form03_v2_valid(jsonb,text,text) to authenticated;
alter table public.avofis_client_document_drafts
 drop constraint valid_form02_payload;
alter table public.avofis_client_document_drafts
 add constraint valid_form02_payload check (
  (content->'version'='1'::jsonb and (
  jsonb_typeof(content)='object' and octet_length(content::text)<=24000
  and content ?& array['version','service','locale','country','institution','purpose','chronology','documentList']
  and content=jsonb_build_object(
   'version',content->'version','service',content->'service','locale',content->'locale',
   'country',content->'country','institution',content->'institution','purpose',content->'purpose',
   'chronology',content->'chronology','documentList',content->'documentList')
  and content->'version'='1'::jsonb and content->>'service'=service_slug and content->>'locale'=locale
  and jsonb_typeof(content->'country')='string' and length(content->>'country')<=4000
  and jsonb_typeof(content->'institution')='string' and length(content->>'institution')<=4000
  and jsonb_typeof(content->'purpose')='string' and length(content->>'purpose')<=4000
  and jsonb_typeof(content->'chronology')='string' and length(content->>'chronology')<=4000
  and jsonb_typeof(content->'documentList')='string' and length(content->>'documentList')<=4000))
  or public.avofis_form03_v2_valid(content,service_slug,locale)
 );
-- Records may be saved partially. A handoff requires an actual client request
-- and minimum facts, not an invented official filing or fabricated deadline.
alter table public.avofis_client_document_drafts
 add constraint form03_review_requires_user_description check(
  status <> 'review_requested' or content->'version'<>'2'::jsonb
  or (length(btrim(content->>'country'))>=2 and
      length(btrim(content->>'purpose'))>=3 and
      length(btrim(content->>'chronology'))>=3 and
      length(btrim(content#>>'{answers,requestedAction}'))>=3)
 );
commit;
