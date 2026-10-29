-- AVOfis FORM-02: versioned client drafts. STAGING/DISPOSABLE ONLY, NO LIVE DB.
-- Parent R-303/R-325/R-341/R-342/R-521/R-527/R-586.
-- Requires MVP, case_assignment_scope, staff_personal_capability_scope migrations.
begin;
create table public.avofis_client_document_drafts (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete restrict,
 case_id uuid references public.avofis_cases(id) on delete restrict,
 service_slug text not null check(service_slug in (
 'hukuki-danismanlik','mahkeme-temsil','avrupa-turkiye-hukuki-uzman-koordinasyonu',
 'alacak-takibi','sozlesmeler-uyusmazliklar','konut-kira-sigorta','ceza-sikayet-trafik',
 'resmi-basvuru-itiraz','sosyal-guvenlik-vergi','vize-oturum-vatandaslik',
 'uluslararasi-insan-haklari','avrupa-ici-islemler','calisma-hayati','sirket-ticaret',
 'uluslararasi-istihdam','belge-apostil-tercume','egitim-diploma')),
 locale text not null check(locale in ('tr','nl','de','en','ar','ru')),
 content jsonb not null,
 revision integer not null default 1 check(revision>=1),
 status text not null default 'draft' check(status in ('draft','review_requested')),
 consent_to_staff boolean not null default false,
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 constraint valid_form02_payload check(
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
  and jsonb_typeof(content->'documentList')='string' and length(content->>'documentList')<=4000),
 constraint sharing_requires_case check(
  (not consent_to_staff or case_id is not null)
  and (status<>'review_requested' or (consent_to_staff and case_id is not null))
 )
);
create index avofis_client_drafts_owner_idx on public.avofis_client_document_drafts(owner_user_id,updated_at desc);
create index avofis_client_drafts_case_idx on public.avofis_client_document_drafts(case_id) where case_id is not null;

-- An admin title is NOT a blanket licence to inspect client documents.
-- Only a currently assigned operator with BOTH personal grants may review.
create function public.avofis_can_read_shared_document(p_case uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and auth.jwt()->>'aal'='aal2' and exists(
  select 1 from public.avofis_case_assignments a
  join public.avofis_staff s on s.user_id=a.staff_user_id and s.role='operator'
  join public.avofis_staff_capability_grants g on g.staff_user_id=a.staff_user_id and g.capability='documents'
  join public.avofis_staff_capability_grants p on p.staff_user_id=a.staff_user_id and p.capability='pleadings'
  where a.case_id=p_case and a.staff_user_id=auth.uid()
 );
$$;
revoke all on function public.avofis_can_read_shared_document(uuid) from public,anon;
grant execute on function public.avofis_can_read_shared_document(uuid) to authenticated;

alter table public.avofis_client_document_drafts enable row level security;
revoke all on public.avofis_client_document_drafts from public,anon,authenticated;
grant select on public.avofis_client_document_drafts to authenticated;
grant insert(owner_user_id,case_id,service_slug,locale,content) on public.avofis_client_document_drafts to authenticated;
grant update(content,status,consent_to_staff) on public.avofis_client_document_drafts to authenticated;
create policy "client owner or explicitly assigned reviewer reads"
 on public.avofis_client_document_drafts for select to authenticated using(
  owner_user_id=(select auth.uid()) or
  (status='review_requested' and consent_to_staff and case_id is not null
   and public.avofis_can_read_shared_document(case_id)));
create policy "only owner starts private draft"
 on public.avofis_client_document_drafts for insert to authenticated with check(
  owner_user_id=(select auth.uid()) and status='draft' and revision=1 and not consent_to_staff
  and (case_id is null or exists(
   select 1 from public.avofis_cases c where c.id=case_id and c.client_user_id=(select auth.uid()))));
create policy "only client updates unlocked draft"
 on public.avofis_client_document_drafts for update to authenticated
 using(owner_user_id=(select auth.uid()) and status='draft')
 with check(owner_user_id=(select auth.uid()) and status in ('draft','review_requested')
  and (case_id is null or exists(
   select 1 from public.avofis_cases c where c.id=case_id and c.client_user_id=(select auth.uid()))));

create table public.avofis_client_document_versions (
 draft_id uuid not null references public.avofis_client_document_drafts(id) on delete restrict,
 revision integer not null check(revision>=1),
 content jsonb not null,
 status text not null check(status in ('draft','review_requested')),
 consent_to_staff boolean not null,
 actor_user_id uuid references auth.users(id) on delete restrict,
 recorded_at timestamptz not null default clock_timestamp(),
 primary key(draft_id,revision)
);
alter table public.avofis_client_document_versions enable row level security;
revoke all on public.avofis_client_document_versions from public,anon,authenticated;
grant select on public.avofis_client_document_versions to authenticated;
create policy "version history follows current scoped access"
 on public.avofis_client_document_versions for select to authenticated using(
  exists(select 1 from public.avofis_client_document_drafts d where d.id=draft_id
   and (d.owner_user_id=(select auth.uid()) or
    (d.status='review_requested' and d.consent_to_staff and d.case_id is not null
     and public.avofis_can_read_shared_document(d.case_id)))));

create function public.avofis_guard_client_document_revision()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if old.status<>'draft' or new.id is distinct from old.id
  or new.owner_user_id is distinct from old.owner_user_id
  or new.case_id is distinct from old.case_id
  or new.service_slug is distinct from old.service_slug
  or new.locale is distinct from old.locale
  or new.revision is distinct from old.revision
  or new.created_at is distinct from old.created_at
  or new.status not in ('draft','review_requested')
 then raise exception 'FORM02 locked or immutable field'; end if;
 new.revision:=old.revision+1;
 new.updated_at:=clock_timestamp();
 return new;
end; $$;
revoke all on function public.avofis_guard_client_document_revision() from public,anon,authenticated;
create trigger avofis_guard_client_document_revision before update on public.avofis_client_document_drafts
 for each row execute function public.avofis_guard_client_document_revision();
create function public.avofis_record_client_document_revision()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.avofis_client_document_versions(draft_id,revision,content,status,consent_to_staff,actor_user_id)
 values(new.id,new.revision,new.content,new.status,new.consent_to_staff,auth.uid());
 return null;
end; $$;
revoke all on function public.avofis_record_client_document_revision() from public,anon,authenticated;
create trigger avofis_record_client_document_revision
 after insert or update on public.avofis_client_document_drafts
 for each row execute function public.avofis_record_client_document_revision();

create table public.avofis_client_document_review_notes (
 id uuid primary key default gen_random_uuid(),
 draft_id uuid not null references public.avofis_client_document_drafts(id) on delete restrict,
 author_user_id uuid not null references auth.users(id) on delete restrict,
 note text not null check(char_length(trim(note)) between 3 and 2500),
 created_at timestamptz not null default clock_timestamp()
);
create index avofis_document_notes_idx on public.avofis_client_document_review_notes(draft_id,created_at);
alter table public.avofis_client_document_review_notes enable row level security;
revoke all on public.avofis_client_document_review_notes from public,anon,authenticated;
grant select on public.avofis_client_document_review_notes to authenticated;
grant insert(draft_id,author_user_id,note) on public.avofis_client_document_review_notes to authenticated;
create policy "owner and current reviewer read notes"
 on public.avofis_client_document_review_notes for select to authenticated using(
  exists(select 1 from public.avofis_client_document_drafts d where d.id=draft_id
   and (d.owner_user_id=(select auth.uid()) or
    (d.status='review_requested' and d.consent_to_staff and d.case_id is not null
     and public.avofis_can_read_shared_document(d.case_id)))));
create policy "only assigned reviewer adds note"
 on public.avofis_client_document_review_notes for insert to authenticated with check(
  author_user_id=(select auth.uid()) and exists(
   select 1 from public.avofis_client_document_drafts d where d.id=draft_id
   and d.status='review_requested' and d.consent_to_staff and d.case_id is not null
   and public.avofis_can_read_shared_document(d.case_id)));
-- No DELETE, no submission status, no bank or court action.
commit;
