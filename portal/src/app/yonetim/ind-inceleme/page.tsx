"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {PageFrame} from "@/components/avofis/PageFrame";
import {usePortalLanguage} from "@/hooks/usePortalLanguage";
import {useUser} from "@/hooks/useUser";
import {supabase} from "@/lib/supabase";
import {indProcedureIds,evaluateINDAdmission} from "@/lib/ind-admission";

// Both switches are off by default; this page never makes a live database
// request while disabled. RLS and database triggers remain the security boundary.
const enabled=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true" &&
 process.env.NEXT_PUBLIC_AVOFIS_IND_CLEARANCE_ENABLED==="true";
type Case={id:string;title:string;status:string};
const blank={
 procedure_family:"ind",ind_procedure:"ind_objection",jurisdiction:"Netherlands",
 representative_name:"",representative_role:"",authority_evidence_reference:"",
 work_right_verified:false,professional_authority_verified:false,
 procedure_reviewed:false,notified_or_filed_on:"",deadline_reviewed:false,
 deadline_basis:"",stay_consequences_reviewed:false,
 asylum_transition_reviewed:false,representation_requested:false,
 special_mandate_verified:false,mandate_reference:"",
 ind_form_reviewed:false,privacy_legal_basis_reviewed:false,
 secure_document_channel_verified:false,disclosure_and_retention_reviewed:false,
 specialist_credential_verified:false,specialist_name:"",human_approved:false
};
type Draft=typeof blank;
const inputFields:{key:keyof Draft;label:string;date?:boolean}[]=[
 {key:"jurisdiction",label:"Ülke / yetki alanı"},
 {key:"representative_name",label:"İşlemi yapacak gerçek kişinin adı"},
 {key:"representative_role",label:"Görevi ve meslekî sıfatı"},
 {key:"authority_evidence_reference",label:"Çalışma ve meslekî yetki kanıt referansı"},
 {key:"notified_or_filed_on",label:"Tebliğ veya başvuru tarihi",date:true},
 {key:"deadline_basis",label:"Hukukî süre ve resmî kaynak kontrolü"},
 {key:"mandate_reference",label:"İşlem kapsamlı imzalı temsil belgesi referansı"},
 {key:"specialist_name",label:"Bağımsız yetkili uzman kimliği"}
];
const checks:{key:keyof Draft;label:string}[]=[
 {key:"work_right_verified",label:"G1 · Çalışma hakkı doğrulandı"},
 {key:"professional_authority_verified",label:"G1 · Meslekî ve fiilî yetki doğrulandı"},
 {key:"procedure_reviewed",label:"G2 · İşlem / makam incelendi"},
 {key:"deadline_reviewed",label:"G2 · Süre insan tarafından incelendi"},
 {key:"stay_consequences_reviewed",label:"G2 · Ülkede kalış etkisi incelendi"},
 {key:"asylum_transition_reviewed",label:"İltica · 12 Haziran 2026 geçiş hükümleri incelendi"},
 {key:"representation_requested",label:"G3 · Temsil talebi var"},
 {key:"special_mandate_verified",label:"G3 · İşlem özelindeki imzalı yetki belgesi doğrulandı"},
 {key:"ind_form_reviewed",label:"IND dosya temini özel formu incelendi"},
 {key:"privacy_legal_basis_reviewed",label:"G4 · Veri işleme dayanağı incelendi"},
 {key:"secure_document_channel_verified",label:"G4 · Güvenli belge kanalı doğrulandı"},
 {key:"disclosure_and_retention_reviewed",label:"G4 · Veri paylaşımı ve saklama incelendi"},
 {key:"specialist_credential_verified",label:"Yüksek riskli işlemde uzman yetkisi doğrulandı"}
];
export default function INDStaffReviewPage(){
 const lang=usePortalLanguage(),{user,loading:authLoading}=useUser();
 const [role,setRole]=useState<"checking"|"admin"|"denied">("checking");
 const [cases,setCases]=useState<Case[]>([]);
 const [reviews,setReviews]=useState<(Draft&{case_id:string})[]>([]);
 const [selected,setSelected]=useState("");
 const [form,setForm]=useState<Draft>({...blank});
 const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState("");
 const approved=!!reviews.find(x=>x.case_id===selected)?.human_approved;
 const current=cases.find(c=>c.id===selected);
 async function load(){
  const [c,r]=await Promise.all([
   supabase.from("avofis_cases").select("id,title,status").order("created_at",{ascending:false}).limit(100),
   supabase.from("avofis_case_clearances").select("*").limit(100)
  ]);
  if(c.error||r.error){setFeedback("İnceleme verisi alınamadı; migration ve RLS doğrulanmalı.");return;}
  const list=(c.data||[]) as Case[];
  setCases(list);setReviews((r.data||[]) as (Draft&{case_id:string})[]);
  setSelected(prev=>list.some(v=>v.id===prev)?prev:list[0]?.id||"");
 }
 useEffect(()=>{
  if(!enabled||authLoading)return;
  if(!user){setRole("denied");return;}
  let mounted=true;
  void supabase.from("avofis_staff").select("role").eq("user_id",user.id)
   .maybeSingle().then(({data,error})=>{
     if(!mounted)return;
     const isAdmin=!error&&data?.role==="admin";
     setRole(isAdmin?"admin":"denied");
     if(isAdmin)void load();
   });
  return ()=>{mounted=false;};
 },[user?.id,authLoading]);
 useEffect(()=>{
   const old=reviews.find(r=>r.case_id===selected);
   setForm(old?{...blank,...old}:{...blank});
 },[selected,reviews]);
 async function save(approve:boolean){
  if(!enabled||role!=="admin"||!user||!selected||busy||approved)return;
  setBusy(true);setFeedback("");
  if(approve){
   const {data,error}=await supabase.from("avofis_agreements").select("signed_at")
    .eq("case_id",selected).maybeSingle();
   if(error||!data?.signed_at){
    setFeedback("G3: İmzalı hizmet sözleşmesi henüz doğrulanmadı.");setBusy(false);return;
   }
   if(form.procedure_family==="ind"){
    const check=evaluateINDAdmission({
      procedure:form.ind_procedure,
      person:{fullName:form.representative_name,roleDescription:form.representative_role,
        workRightVerified:form.work_right_verified,
        professionalAuthorityVerified:form.professional_authority_verified},
      timing:{notifiedOrFiledOn:form.notified_or_filed_on,deadlineReviewed:form.deadline_reviewed,
        deadlineBasis:form.deadline_basis,stayConsequencesReviewed:form.stay_consequences_reviewed,
        asylumPrePost12June2026Reviewed:form.asylum_transition_reviewed},
      representation:{requested:form.representation_requested,
        signedSpecialMandate:form.special_mandate_verified,
        procedureSpecificINDFormReviewed:form.ind_form_reviewed,serviceAgreementSigned:true},
      privacy:{legalBasisReviewed:form.privacy_legal_basis_reviewed,
        secureDocumentChannelVerified:form.secure_document_channel_verified,
        disclosureAndRetentionReviewed:form.disclosure_and_retention_reviewed},
      specialist:{credentialVerified:form.specialist_credential_verified,
        specialistIdentity:form.specialist_name},
      humanApproval:{approved:true,reviewerId:user.id}
    });
    if(!check.canActivate){
     setFeedback("Onay engellendi: "+check.issues.join(", "));setBusy(false);return;
    }
   }
  }
  const {error}=await supabase.from("avofis_case_clearances").upsert({
    ...form,case_id:selected,
    ind_procedure:form.procedure_family==="ind"?form.ind_procedure:null,
    notified_or_filed_on:form.notified_or_filed_on||null,
    human_approved:approve
  },{onConflict:"case_id"});
  setFeedback(error?"Veritabanı reddetti: "+error.message:
    approve?"İç inceleme kaydedildi; bu IND temsili veya başvuru yetkisi vermez.":
    "Taslak kaydedildi. Dosya aktivasyonu henüz mümkün değil.");
  if(!error)await load();
  setBusy(false);
 }
 return <PageFrame wide lang={lang} eyebrow="PERSONEL İÇ KONTROLÜ"
   title="IND ve dosya aktivasyonu — G1–G4"
   description="İnsan tarafından incelenen yetki, süre, temsil belgesi ve güvenli veri işlemenin kaydı.">
  {!enabled?<div className="avofis-card rounded-xl border p-6">
   <p>İç inceleme kapalı. Staging, RLS, sözleşme ve yetki testleri tamamlanmadan etkinleştirilemez.</p>
   <Link href="/yonetim" className="mt-4 inline-block text-[#dfbf59]">Personel alanı</Link>
  </div>:authLoading||role==="checking"?<p>Yetki doğrulanıyor…</p>:
  role!=="admin"?<p role="alert">Erişim reddedildi. Yalnızca doğrulanmış yönetici rolü kullanabilir.</p>:
  <div className="space-y-6">
   <p className="rounded-xl border border-[#dfbf59]/40 p-4 text-sm leading-7">
    Belgeler bu ekrana yüklenmez. Yetki ve kanıt referansları gerçek bir hukukî incelemeye dayanmalıdır.
    İltica, gözetim ve sınır dışı dosyalarında uzman kontrolü ayrıca zorunludur.
   </p>
   {feedback&&<p role="status" className="rounded-xl border p-4 text-sm">{feedback}</p>}
   <label className="block text-sm">Dosya
    <select className="avofis-field mt-2 w-full" value={selected} onChange={e=>setSelected(e.target.value)}>
     <option value="">Dosya seçin</option>
     {cases.map(c=><option key={c.id} value={c.id}>{c.title} · {c.status} · {c.id.slice(0,8)}</option>)}
    </select>
   </label>
   {selected&&<>
    <p className="text-sm">Durum: {current?.status}. {approved?"Onaylı inceleme.":"İnceleme bekleniyor."}</p>
    <fieldset className="space-y-5 disabled:opacity-60" disabled={busy||approved}>
     <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Kategori
       <select className="avofis-field mt-2 w-full" value={form.procedure_family}
        onChange={e=>setForm(f=>({...f,procedure_family:e.target.value}))}>
        <option value="ind">IND</option><option value="other">Diğer hukukî işlem</option>
       </select>
      </label>
      {form.procedure_family==="ind"&&<label className="text-sm">IND işlemi
        <select className="avofis-field mt-2 w-full" value={form.ind_procedure}
         onChange={e=>setForm(f=>({...f,ind_procedure:e.target.value}))}>
         {indProcedureIds.map(p=><option value={p} key={p}>{p.replaceAll("_"," ")}</option>)}
        </select>
      </label>}
     </div>
     <div className="grid gap-3 sm:grid-cols-2">
      {inputFields.map(field=><label key={field.key} className="text-sm">{field.label}
       <input className="avofis-field mt-2 w-full" type={field.date?"date":"text"}
        value={String(form[field.key])}
        onChange={e=>setForm(f=>({...f,[field.key]:e.target.value}))}/>
      </label>)}
     </div>
     <div className="grid gap-2 sm:grid-cols-2">
      {checks.map(field=><label key={field.key} className="flex gap-3 rounded-lg border border-[#dfbf59]/20 p-3 text-sm">
       <input type="checkbox" checked={Boolean(form[field.key])}
        onChange={e=>setForm(f=>({...f,[field.key]:e.target.checked}))}/>
       <span>{field.label}</span>
      </label>)}
     </div>
    </fieldset>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={busy||approved} onClick={()=>void save(false)}
       className="avofis-outline avofis-btn disabled:opacity-50">Taslak kaydet</button>
      <button type="button" disabled={busy||approved} onClick={()=>void save(true)}
       className="avofis-cta avofis-btn disabled:opacity-50">Kanıtları inceleyerek onayla</button>
    </div>
    <p className="text-xs text-[#c2cde1]">Nihai işlem reddi ve onay kaydı veritabanı RLS/trigger kurallarına bağlıdır.
       Bu ekran otomatik IND başvurusu yapmaz, hukukî süre durdurmaz.</p>
   </>}
  </div>}
 </PageFrame>;
}
