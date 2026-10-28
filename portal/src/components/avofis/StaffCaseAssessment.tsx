"use client";
import { useEffect,useState,type FormEvent } from "react";
import { AlertTriangle,CheckCircle2,Scale,ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Assessment={
 case_id:string;jurisdiction:string;secondary_jurisdiction:string;authority_name:string;
 procedure_type:string;notified_on:string|null;applicable_deadline_on:string|null;
 deadline_basis:string;deadline_review:string;authorisation:string;
 specialist_reference:string;decision:string;review_notes:string;
 reviewer_id:string|null;reviewed_at:string|null;
};
const blank=(caseId:string):Assessment=>({
 case_id:caseId,jurisdiction:"Netherlands",secondary_jurisdiction:"",authority_name:"",
 procedure_type:"",notified_on:null,applicable_deadline_on:null,deadline_basis:"",
 deadline_review:"pending",authorisation:"unverified",specialist_reference:"",
 decision:"pending",review_notes:"",reviewer_id:null,reviewed_at:null
});
const decisions=[
 ["pending","Ön inceleme bekliyor"],["needs_specialist","Yetkili uzman gerekiyor"],
 ["approved","Uygunluk incelemesi onaylandı"],["declined","Hizmet kabul edilemiyor"]
] as const;
const authorisations=[
 ["unverified","Yetki ve çalışma hakkı doğrulanmadı"],["permitted","Bu işlem için yetki doğrulandı"],
 ["specialist_confirmed","Bağımsız yetkili uzman teyit edildi"],["not_permitted","Bu faaliyet için yetki yok"]
] as const;
const deadlineStates=[
 ["pending","Başvuru süresi henüz incelenmedi"],["confirmed","İşlem süresi uzman tarafından doğrulandı"],
 ["not_applicable","Bu işlem için başvuru süresi bulunmuyor"]
] as const;
const field="avofis-field mt-1.5";
const label="avofis-form-label block text-[13px]";
export function StaffCaseAssessment({caseId,canApprove=false}:{caseId:string;canApprove?:boolean}){
 const [form,setForm]=useState<Assessment>(()=>blank(caseId));
 const [loaded,setLoaded]=useState(false),[working,setWorking]=useState(false),[error,setError]=useState(""),[saved,setSaved]=useState("");
 useEffect(()=>{
  let active=true;
  setForm(blank(caseId));setLoaded(false);setError("");setSaved("");
  if(!caseId)return;
  void (async()=>{
   const {data,error}=await supabase.from("avofis_case_assessments")
    .select("case_id,jurisdiction,secondary_jurisdiction,authority_name,procedure_type,notified_on,applicable_deadline_on,deadline_basis,deadline_review,authorisation,specialist_reference,decision,review_notes,reviewer_id,reviewed_at")
    .eq("case_id",caseId).maybeSingle();
   if(!active)return;
   if(error)setError("Uygunluk kayıtları alınamadı. Veritabanı geçişini ve erişim yetkilerini kontrol edin.");
   else setForm(data as Assessment||blank(caseId));
   setLoaded(true);
  })();
  return ()=>{active=false;};
 },[caseId]);
 function change<K extends keyof Assessment>(key:K,value:Assessment[K]){
  setForm(prev=>({...prev,[key]:value}));setSaved("");
 }
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!caseId||!loaded||working)return;
  setWorking(true);setError("");setSaved("");
  if(form.decision==="approved"&&!canApprove){setError("Nihai uygunluk onayı yalnızca yetkili yönetici tarafından verilebilir.");setWorking(false);return;}
  if(form.decision==="approved"&&(!["permitted","specialist_confirmed"].includes(form.authorisation)||
    form.deadline_review==="pending"||form.review_notes.trim().length<12||
    (form.deadline_review==="confirmed"&&(!form.applicable_deadline_on||form.deadline_basis.trim().length<5))||
    (form.authorisation==="specialist_confirmed"&&form.specialist_reference.trim().length<3))){
   setError("Onay için meslekî yetki, süre kontrolü, gerekçe ve gerekiyorsa bağımsız uzman teyidi zorunludur.");
   setWorking(false);return;
  }
  const record={
   case_id:caseId,jurisdiction:form.jurisdiction.trim(),
   secondary_jurisdiction:form.secondary_jurisdiction.trim(),authority_name:form.authority_name.trim(),
   procedure_type:form.procedure_type.trim(),notified_on:form.notified_on||null,
   applicable_deadline_on:form.deadline_review==="confirmed"?(form.applicable_deadline_on||null):null,
   deadline_basis:form.deadline_review==="confirmed"?form.deadline_basis.trim():"",
   deadline_review:form.deadline_review,authorisation:form.authorisation,
   specialist_reference:form.specialist_reference.trim(),decision:form.decision,
   review_notes:form.review_notes.trim()
  };
  const {data,error}=await supabase.from("avofis_case_assessments").upsert(record,{onConflict:"case_id"}).select("case_id,jurisdiction,secondary_jurisdiction,authority_name,procedure_type,notified_on,applicable_deadline_on,deadline_basis,deadline_review,authorisation,specialist_reference,decision,review_notes,reviewer_id,reviewed_at").single();
  if(error)setError("İnceleme kaydedilemedi: "+error.message);
  else {setForm(data as Assessment);setSaved("İnceleme kaydedildi. Dosya aktivasyonu için müşteri sözleşmesi ayrıca kabul edilmiş olmalıdır.");}
  setWorking(false);
 }
 if(!caseId)return <section className="avofis-card rounded-[18px] border p-5"><h2 className="text-[17px] font-semibold text-[#F2F5FF]">Hukukî uygunluk ve dosya kabulü</h2><p className="mt-2 text-[13px] text-[#B9C5DF]">İnceleme için önce müşteri dosyası seçin.</p></section>;
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
  <div className="flex items-start gap-3"><span className="avofis-icon-tile"><Scale className="h-5 w-5"/></span><div><h2 className="text-[18px] font-semibold text-[#F2F5FF]">Hukukî uygunluk ve dosya kabulü</h2><p className="mt-2 text-[12px] leading-[1.8] text-[#B9C5DF]">İlgili ülke, işin kapsamı, çalışma ve meslekî yetkiler, zorunlu uzman ile başvuru süresi insan incelemesinden geçmeden dosya “İşlemde” durumuna alınamaz.</p></div></div>
  {!loaded?<p className="mt-5 text-[13px] text-[#B9C5DF]">İnceleme yükleniyor…</p>:<form onSubmit={save} className="mt-5 grid gap-4">
   <div className="grid gap-4 sm:grid-cols-2">
    <label className={label}>İşlemin gerçekleştiği ülke<input required minLength={2} maxLength={100} className={field} value={form.jurisdiction} onChange={e=>change("jurisdiction",e.target.value)}/></label>
    <label className={label}>İkinci ülke (varsa)<input maxLength={100} className={field} value={form.secondary_jurisdiction} onChange={e=>change("secondary_jurisdiction",e.target.value)}/></label>
    <label className={label}>Mahkeme veya kurum<input maxLength={160} className={field} value={form.authority_name} onChange={e=>change("authority_name",e.target.value)}/></label>
    <label className={label}>İşlem / dava türü<input maxLength={160} className={field} value={form.procedure_type} onChange={e=>change("procedure_type",e.target.value)}/></label>
   </div>
   <div className="grid gap-4 sm:grid-cols-2">
    <label className={label}>Kararın tebliğ tarihi (varsa)<input type="date" className={field} value={form.notified_on||""} onChange={e=>change("notified_on",e.target.value||null)}/></label>
    <label className={label}>Başvuru süresi değerlendirmesi<select className={field} value={form.deadline_review} onChange={e=>change("deadline_review",e.target.value)}>{deadlineStates.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
   </div>
   {form.deadline_review==="confirmed"&&<div className="grid gap-4 sm:grid-cols-2">
     <label className={label}>Doğrulanan son tarih<input required type="date" className={field} value={form.applicable_deadline_on||""} onChange={e=>change("applicable_deadline_on",e.target.value||null)}/></label>
     <label className={label}>Süre hesabının dayanağı<input required minLength={5} maxLength={900} className={field} value={form.deadline_basis} onChange={e=>change("deadline_basis",e.target.value)} placeholder="Resmî karar, ilgili hüküm veya uzman görüşü"/></label>
    </div>}
   <div className="grid gap-4 sm:grid-cols-2">
    <label className={label}>Meslekî yetki ve çalışma hakkı<select className={field} value={form.authorisation} onChange={e=>change("authorisation",e.target.value)}>{authorisations.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
    <label className={label}>Bağımsız uzman teyit kaydı<input maxLength={180} className={field} value={form.specialist_reference} onChange={e=>change("specialist_reference",e.target.value)} placeholder="İsim, meslekî kayıt veya teyit referansı"/></label>
   </div>
   <label className={label}>Değerlendirme sonucu<select className={field} value={form.decision} onChange={e=>change("decision",e.target.value)}>{decisions.map(([value,text])=><option key={value} value={value} disabled={value==="approved"&&!canApprove}>{text}</option>)}</select></label>
   <label className={label}>İnceleme gerekçesi, doğrulanan çalışma hakkı ve uygulanacak hizmet sınırları<textarea maxLength={2400} rows={4} className={field} value={form.review_notes} onChange={e=>change("review_notes",e.target.value)} placeholder="Yetki, ülke, mahkeme aşaması, süre ve gerekli uzman incelemesini belgeleyin."/></label>
   {error&&<div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-[13px] leading-6 text-red-200">{error}</div>}
   {saved&&<p role="status" className="flex items-start gap-2 text-[13px] leading-6 text-[#f0d56d]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>{saved}</p>}
   {form.reviewed_at&&<p className="text-[12px] text-[#B9C5DF]">Son inceleme kaydı: {new Date(form.reviewed_at).toLocaleString("tr-TR")}</p>}
   <p className="flex items-start gap-2 text-[12px] leading-[1.7] text-[#B9C5DF]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#dfbf59]"/>Bu ekran hukukî süreyi otomatik hesaplamaz. Uygunluk onayı, gerçek çalışma veya meslekî yetkinin yerine geçmez; yetkiler kayıtlara dayanmalıdır.</p>
   <button type="submit" disabled={working} className="avofis-cta avofis-btn justify-self-start disabled:opacity-50"><ShieldCheck className="h-4 w-4"/>{working?"Kaydediliyor…":"İncelemeyi kaydet"}</button>
  </form>}
 </section>;
}
