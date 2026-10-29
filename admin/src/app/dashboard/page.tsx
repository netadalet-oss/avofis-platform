"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import type {StaffCapability,WorkspaceSection} from "@/lib/workspace-model";
import type {Workstream} from "@/lib/legal-workflows";
import {StaffReviewQueue} from "@/components/staff-review-queue";
import {StaffGrantManager} from "@/components/staff-grant-manager";

type StaffItem=Record<string,unknown>;
type WorkspaceResponse={
  error?:string;role?:string;employeeId?:string;verifiedSession?:boolean;
  environment?:string;sections?:WorkspaceSection[];items?:StaffItem[];
  notice?:string;sources?:{title:string;url:string;type:string}[];
};
const groups=["Dosya ve hizmet","Belge ve hukuk","İletişim","Finans","Yönetim"] as const;
const navItem="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start text-[13px] transition-colors";
const fmt=(val:unknown)=>typeof val==="string"?val:typeof val==="number"?String(val):"—";
const titleMap:Record<string,string>={
 id:"Dosya kimliği",title:"Konu",service_key:"Hizmet",country:"Ülke",status:"Durum",
 created_at:"Kayıt",case_id:"Dosya",amount_eur_cents:"Tutar (cent)",
 role:"Görev",user_id:"Personel kimliği",body:"Mesaj içeriği",staff_user_id:"Atanan personel"
};
const money=(v:unknown)=>typeof v==="number"?
 new Intl.NumberFormat("nl-NL",{style:"currency",currency:"EUR"}).format(v/100):"—";
const readableDate=(v:unknown)=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}/.test(v)?
 new Date(v).toLocaleDateString("nl-NL"):"—";

export default function StaffDashboard(){
 const router=useRouter();
 const [authorized,setAuthorized]=useState(false);
 const [loading,setLoading]=useState(true);
 const [role,setRole]=useState("");
 const [sections,setSections]=useState<WorkspaceSection[]>([]);
 const [section,setSection]=useState<StaffCapability|null>(null);
 const [items,setItems]=useState<StaffItem[]>([]);
 const [sources,setSources]=useState<NonNullable<WorkspaceResponse["sources"]>>([]);
 const [filter,setFilter]=useState("");
 const [query,setQuery]=useState("");
 const [status,setStatus]=useState("");
 const [selectedWorkflow,setSelectedWorkflow]=useState<Workstream|null>(null);
 const [draft,setDraft]=useState("");
 const [menu,setMenu]=useState(false);
 const [drafts,setDrafts]=useState<StaffItem[]>([]);
 const [draftTitle,setDraftTitle]=useState(""),[draftSummary,setDraftSummary]=useState("");
 const [draftAmount,setDraftAmount]=useState(""),[savingDraft,setSavingDraft]=useState(false);
 const [draftFeedback,setDraftFeedback]=useState("");

 const fetchWorkspace=useCallback(async(view:StaffCapability|null,phrase="")=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token){router.replace("/login");return;}
  const q=new URLSearchParams();
  if(view)q.set("section",view);
  if(phrase)q.set("q",phrase);
  const response=await fetch("/api/workspace?"+q.toString(),{
   cache:"no-store",headers:{Authorization:"Bearer "+session.access_token}});
  const result=await response.json() as WorkspaceResponse;
  if(!response.ok){
   if(response.status===401){router.replace("/login");return;}
   if(response.status===403){setAuthorized(false);setSections([]);setStatus("Bu alan için personel erişim yetkisi bulunmuyor.");return;}
   throw new Error(result.error||"Çalışma alanı şu anda kullanılamıyor.");
  }
  setRole(result.role||"");
  setSections(result.sections||[]);
  setItems(result.items||[]);
  setSources(result.sources||[]);
  setAuthorized(true);
  setStatus(result.notice==="MODULE_DATA_SOURCE_NOT_YET_CONNECTED"?
   "Bu modülün gerçek veri akışı henüz etkinleştirilmedi; yalnız iş kapsamı görüntülenebilir.":"");
 },[router]);
 useEffect(()=>{
  let mounted=true;
  (async()=>{
   try{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.replace("/login");return;}
    if(mounted){
     const initial=new URLSearchParams(window.location.search).get("section");
     const valid=initial&&[
      "inbox","triage","matters","calendar","documents","pleadings",
      "research","judicial","ind","messages","billing","payables",
      "reporting","audit","people","settings"
     ].includes(initial)?initial as StaffCapability:null;
     await fetchWorkspace(valid);
     if(valid)setSection(valid);
    }
   }catch(e){if(mounted)setStatus(e instanceof Error?e.message:"Bağlantı hatası.");}
   finally{if(mounted)setLoading(false);}
  })();
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
   if(event==="SIGNED_OUT"){setAuthorized(false);router.replace("/login");}
  });
  return ()=>{mounted=false;subscription.unsubscribe();};
 },[router,fetchWorkspace]);
 async function openModule(id:StaffCapability){
  setSection(id);setFilter("");setQuery("");setItems([]);setDrafts([]);
  setDraftTitle("");setDraftSummary("");setDraftAmount("");setDraftFeedback("");setSelectedWorkflow(null);
  setDraft("");setLoading(true);setMenu(false);setStatus("");
  try{await fetchWorkspace(id);await loadDrafts(id);}catch(e){setStatus(e instanceof Error?e.message:"İşlem başarısız.");}
  finally{setLoading(false);}
 }
 async function search(){
  if(!section)return;
  setLoading(true);
  try{setQuery(filter);await fetchWorkspace(section,filter);}
  catch(e){setStatus(e instanceof Error?e.message:"Arama kullanılamıyor.");}
  finally{setLoading(false);}
 }
 async function loadDrafts(id:StaffCapability){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)return;
  try{
   const response=await fetch("/api/workspace/drafts?module="+id,{cache:"no-store",
    headers:{Authorization:"Bearer "+session.access_token}});
   if(!response.ok)return;
   const result=await response.json() as {items?:StaffItem[]};
   setDrafts(result.items||[]);
  }catch{/* no draft data is fabricated if staging isn't configured */}
 }
 async function saveWorkDraft(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(!section||savingDraft)return;
  setSavingDraft(true);setDraftFeedback("");
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){router.replace("/login");return;}
   const body:Record<string,unknown>={module:section,title:draftTitle.trim(),summary:draftSummary.trim()};
   if(section==="billing"||section==="payables"){
    const parsed=Math.round(Number(draftAmount.replace(",","."))*100);
    if(!Number.isSafeInteger(parsed)||parsed<0){setDraftFeedback("Lütfen geçerli ve pozitif bir tutar giriniz.");return;}
    body.amount_eur_cents=parsed;
   }
   const response=await fetch("/api/workspace/drafts",{
    method:"POST",headers:{"Content-Type":"application/json",
     Authorization:"Bearer "+session.access_token},body:JSON.stringify(body)});
   const res=await response.json() as {error?:string};
   if(!response.ok){setDraftFeedback(res.error==="DRAFT_WRITES_DISABLED"?
    "Staging ortamında taslak yazma henüz açılmadı.":"Taslak kaydedilemedi: "+(res.error||"Yetki veya bağlantı doğrulanamadı."));return;}
   setDraftTitle("");setDraftSummary("");setDraftAmount("");
   setDraftFeedback("İç çalışma taslağı güvenli kayıt alanına eklendi; resmî işlem başlatılmadı.");
   await loadDrafts(section);
  }catch{setDraftFeedback("Taslak kaydı şu anda kullanılamıyor.");}
  finally{setSavingDraft(false);}
 }
 async function requestReview(item:StaffItem){
  if(!section||savingDraft||item.state!=="draft")return;
  setSavingDraft(true);setDraftFeedback("");
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){router.replace("/login");return;}
   const res=await fetch("/api/workspace/drafts",{method:"PATCH",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},
    body:JSON.stringify({module:section,id:item.id,state:"review_requested"})});
   const body=await res.json() as {error?:string};
   if(!res.ok){setDraftFeedback(res.status===503?
    "Staging ortamında iç inceleme talebi henüz etkinleştirilmedi.":
    "İnceleme talebi kabul edilmedi. Yetki veya taslak durumu doğrulanamadı.");return;}
   setDraftFeedback("Taslak iç incelemeye yönlendirildi. Resmî işlem gerçekleştirilmedi.");
   await loadDrafts(section);
  }catch{setDraftFeedback("İnceleme talebi şu anda kaydedilemedi.");}
  finally{setSavingDraft(false);}
 }
 async function signOut(){
  setAuthorized(false);setSections([]);setItems([]);
  await supabase.auth.signOut();router.replace("/login");
 }
 const current=sections.find(x=>x.id===section);
 const grouped=useMemo(()=>groups.map(group=>({
  group,items:sections.filter(x=>x.group===group)
 })).filter(x=>x.items.length>0),[sections]);
 const isLibrary=section==="research"||section==="pleadings";
 const workItems=isLibrary?items as unknown as Workstream[]:[];
 const counts=items.length;
 return <main className="min-h-screen bg-[#F6F8FB] text-[#14253D]">
  <a href="#work-area" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4">İçeriğe geç</a>
  <header className="sticky top-0 z-30 border-b border-[#DDE5EF] bg-white/95 backdrop-blur">
   <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-5 px-5 py-3">
    <div className="flex items-center gap-3">
     <button aria-label="Menüyü aç veya kapat" aria-expanded={menu} onClick={()=>setMenu(!menu)}
      className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm lg:hidden">☰</button>
     <Link href="/dashboard" className="text-[19px] font-semibold tracking-tight text-[#14253D]">AVOfis<span className="text-[#B59349]">.</span>
      <span className="ml-3 border-l border-[#D4DCE8] pl-3 text-[12px] font-medium text-[#5C6D81]">Personel</span></Link>
    </div>
    <div className="flex items-center gap-4 text-[12px]">
     <span className="hidden text-[#62738C] sm:inline">{role==="admin"?"Yönetim yetkisi":role==="operator"?"Görev bazlı personel":"Özel erişim"}</span>
     <button onClick={()=>void signOut()} className="rounded-lg border border-[#D8E1ED] px-3 py-2 font-medium hover:bg-[#F2F5F9]">Güvenli çıkış</button>
    </div>
   </div>
  </header>
  {loading&&!authorized?<div role="status" className="mx-auto max-w-3xl px-5 py-16 text-center text-sm text-[#526580]">Personel erişimi doğrulanıyor…</div>:
   !authorized?<div role="alert" className="mx-auto max-w-xl px-5 py-16">
    <h1 className="text-xl font-semibold">Yetkili personel girişi</h1>
    <p className="mt-3 text-sm leading-7 text-[#536780]">{status||"Personel çalışma alanına erişim doğrulanamadı."}</p>
    <Link href="/login" className="mt-6 inline-block rounded-lg bg-[#163454] px-4 py-2 text-sm text-white">Giriş sayfası</Link>
   </div>:
   <div className="mx-auto grid max-w-[1480px] grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
    <aside className={(menu?"block":"hidden")+" border-r border-[#E5EBF2] bg-white px-4 py-6 lg:block"} aria-label="Personel modülleri">
     <button onClick={()=>{setSection(null);setItems([]);setStatus("");setMenu(false);}}
      className={navItem+(section===null?" bg-[#EAF1F8] font-semibold text-[#163454]":" hover:bg-[#F2F5F9]")}>
      <span>Çalışma alanı</span><span aria-hidden="true">⌂</span>
     </button>
     {grouped.map(g=><div className="mt-6" key={g.group}>
      <h2 className="px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#8490A1]">{g.group}</h2>
      <div className="mt-2 space-y-0.5">{g.items.map(m=><button key={m.id} onClick={()=>void openModule(m.id)}
       aria-current={section===m.id?"page":undefined}
       className={navItem+(section===m.id?" bg-[#EAF1F8] font-semibold text-[#163454]":" text-[#50617C] hover:bg-[#F2F5F9]")}>
       <span>{m.label}</span><span aria-hidden="true" className="text-[11px] text-[#A3AFBF]">›</span></button>)}</div>
     </div>)}
    </aside>
    <section className="min-w-0 px-5 py-8 sm:px-8" id="work-area">
     <div className="max-w-6xl">
      <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9A7C3F]">
       {current?.group||"Genel görünüm"} / Özel personel alanı
      </p>
      <h1 className="mt-2 text-[clamp(1.55rem,2.5vw,2.2rem)] font-semibold tracking-tight">
       {current?.label||"Çalışma alanınız"}
      </h1>
      <p className="mt-2 max-w-3xl text-[13px] leading-7 text-[#5E7188]">
       {current?.description||
        "İş bölümünüze tanımlanan alanlar, ilgili mevzuat kaynakları ve dosya işlemleri bu çalışma alanından yönetilir."}
      </p>
      {status&&<p role="status" className="mt-5 rounded-lg border border-[#D9B978]/40 bg-[#FFF8E9] px-4 py-3 text-[12px] text-[#805E22]">{status}</p>}
      {current?.requiresLiveAuthorization&&<p className="mt-5 rounded-lg border border-[#DCE6F2] bg-white px-4 py-3 text-[12px] text-[#62748A]">Bu iş alanında resmî gönderim, para aktarımı ve dış iletişim yalnız ayrı yetki, kurum onayı ve doğrulanan işlem kanalıyla etkinleştirilir.</p>}
      {!current?<div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(m=><button key={m.id} onClick={()=>void openModule(m.id)}
         className="group rounded-xl border border-[#E1E8F0] bg-white p-5 text-start shadow-[0_2px_10px_rgba(21,38,64,.025)] hover:border-[#BECFE0] hover:shadow-sm">
         <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF3F9] text-[12px] font-semibold text-[#244969]">{m.icon.slice(0,2).toUpperCase()}</div>
         <div className="text-[14px] font-semibold">{m.label}</div>
         <p className="mt-1 text-[12px] leading-6 text-[#65748A]">{m.subtitle}</p>
        </button>)}
       </div>:<>
       <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {current.tasks.map((task,i)=><div key={i} className="rounded-xl border border-[#E0E7EF] bg-white p-4 text-[12px] leading-6">
         <span className="mb-2 block text-[10px] font-semibold tracking-widest text-[#9E8145]">0{i+1}</span>
         <span className="font-medium">{task}</span>
        </div>)}
       </div>
       {isLibrary?<>
        <form className="mt-7 flex gap-2" onSubmit={e=>{e.preventDefault();void search();}}>
         <input value={filter} onChange={e=>setFilter(e.target.value)} maxLength={80}
          aria-label="Mevzuat, işlem ve dilekçe arama" placeholder="İşlem, mevzuat veya dilekçe türü arayın"
          className="min-w-0 flex-1 rounded-lg border border-[#D7DFE9] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#2B5A84]"/>
         <button type="submit" className="rounded-lg bg-[#183B5E] px-5 py-3 text-[12px] font-semibold text-white">Ara</button>
        </form>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
         <div className="space-y-2">
          <p className="mb-3 text-[12px] text-[#66778D]">{counts} kaynaklı işlem örneği gösteriliyor · {query&&"Filtre: "+query}</p>
          {workItems.map(w=><button key={w.id} onClick={()=>{setSelectedWorkflow(w);setDraft(w.templateBody);}}
           className={"w-full rounded-lg border bg-white p-4 text-start "+(selectedWorkflow?.id===w.id?"border-[#BD9F63]":"border-[#DFE7EF] hover:border-[#B9CADB]")}>
           <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9C7C3A]">{w.country} · {w.domain}</span>
           <span className="mt-1 block text-[13px] font-semibold">{w.title}</span>
           <span className="mt-1 block text-[12px] text-[#65768C]">{w.professional}</span>
          </button>)}
         </div>
         <div className="rounded-xl border border-[#DFE7EF] bg-white p-5 sm:p-6">
          {!selectedWorkflow?<p className="text-[13px] leading-7 text-[#65768C]">İşlem seçerek belge listesi, iş akışı ve kurum kaynağını inceleyebilirsiniz.</p>:
          <div className="space-y-5">
           <div><p className="text-[11px] font-semibold uppercase tracking-widest text-[#A0834A]">İnceleme kaydı</p><h2 className="mt-2 text-lg font-semibold">{selectedWorkflow.title}</h2>
            <p className="mt-2 text-[12px] text-[#536881]">Yetkili uzman: {selectedWorkflow.professional}</p>
            <p className="mt-1 text-[12px] text-[#536881]">İlgili kişi: {selectedWorkflow.audience}</p>
           </div>
           <div><h3 className="text-[13px] font-semibold">Gerekli olabilecek belge ve bilgiler</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] leading-6 text-[#566B82]">{selectedWorkflow.documents.map(x=><li key={x}>{x}</li>)}</ul></div>
           <div><h3 className="text-[13px] font-semibold">İşlem kontrol sırası</h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-[12px] leading-6 text-[#566B82]">{selectedWorkflow.steps.map(x=><li key={x}>{x}</li>)}</ol></div>
           <div><h3 className="text-[13px] font-semibold">Resmî kaynak</h3>
            <a href={selectedWorkflow.source} target="_blank" rel="noopener noreferrer"
             className="mt-2 inline-block text-[12px] font-semibold text-[#215786] underline">{selectedWorkflow.sourceLabel}</a>
            <p className="mt-1 text-[11px] leading-5 text-[#66778D]">{selectedWorkflow.review}</p></div>
           <div><label htmlFor="draft-text" className="text-[13px] font-semibold">{selectedWorkflow.templateTitle} · Çalışma taslağı</label>
            <textarea id="draft-text" value={draft} onChange={e=>setDraft(e.target.value)}
             rows={11} maxLength={15000} className="mt-2 w-full rounded-lg border border-[#D7DFE9] p-4 font-mono text-[12px] leading-6 outline-none focus:border-[#2B5A84]"/>
            <p className="mt-2 text-[11px] leading-6 text-[#78889A]">
             Bu metin resmî dilekçe veya onaylanmış form değildir. Düzenleme yalnız mevcut tarayıcı oturumu içindedir; dosyaya, sunucuya veya resmî kuruma kaydedilmez. Şahsî dosya bilgisi girmeyin.
            </p>
            <button type="button" onClick={()=>{setDraft(selectedWorkflow.templateBody);}}
             className="mt-3 rounded-lg border border-[#CAD6E2] px-4 py-2 text-[12px] font-medium">Taslağı sıfırla</button>
           </div>
          </div>}
         </div>
        </div>
        {section==="research"&&sources.length>0&&<div className="mt-6 rounded-xl border border-[#E0E7EF] bg-white p-5">
         <h3 className="text-[14px] font-semibold">Resmî kaynak rehberi</h3>
         <div className="mt-4 grid gap-2 sm:grid-cols-2">{sources.map(x=><a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer"
          className="rounded-lg border border-[#E5EBF2] p-3 hover:bg-[#F5F8FC]"><span className="block text-[10px] text-[#8090A4]">{x.type}</span>
          <span className="mt-1 block text-[12px] font-medium text-[#255A84] underline">{x.title}</span></a>)}</div>
        </div>}
       </>:<div className="mt-7 rounded-xl border border-[#DFE7EF] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
         <h2 className="text-[14px] font-semibold">Yetki kapsamınızdaki kayıtlar</h2>
         <span className="rounded-md bg-[#EFF4F8] px-3 py-1 text-[11px] font-medium text-[#63778D]">{loading?"Yükleniyor":counts+" kayıt"}</span>
        </div>
        {loading?<p role="status" className="mt-5 text-[12px] text-[#67788D]">Kayıtlar doğrulanıyor…</p>:
        counts===0?<p className="mt-5 text-[12px] leading-6 text-[#6A7A8F]">Gösterilebilir kayıt yok. Bu alan için erişim ve veri kaynağı doğrulaması gerekir; örnek kayıt gerçek veri gibi gösterilmez.</p>:
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[610px] table-auto border-collapse text-left text-[12px]">
         <thead><tr className="border-b border-[#E1E8EF] text-[#708299]">
          {Object.keys(items[0]).slice(0,6).map(key=><th key={key} className="py-3 pr-4 font-medium">{titleMap[key]||key}</th>)}</tr></thead>
         <tbody>{items.map((row,i)=><tr key={i} className="border-b border-[#EFF2F6] text-[#334861]">
          {Object.entries(row).slice(0,6).map(([key,value])=><td key={key} className="max-w-[250px] truncate py-3 pr-4"
           title={typeof value==="string"?value:undefined}>
           {key==="amount_eur_cents"?money(value):key.endsWith("_at")?readableDate(value):fmt(value)}</td>)}</tr>)}</tbody>
        </table></div>}
        <p className="mt-4 text-[11px] leading-6 text-[#7B8999]">Bu ekranda görüntüleme yetkisi ayrıca veritabanı satır politikalarıyla sınırlandırılır. Resmî başvuru, banka/PSP ödemesi ve dış mesaj gönderimi bu çalışma alanından başlatılamaz.</p>
       </div>}
      </>}
      {current&&<div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
       <section className="rounded-xl border border-[#DFE7EF] bg-white p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold">İç çalışma notu oluştur</h2>
        <p className="mt-2 text-[12px] leading-6 text-[#64788D]">Bu kayıt yalnız görev alanınızdaki iç çalışma taslağıdır; banka işlemi, kurum başvurusu veya karşı tarafa gönderim değildir.</p>
        <form onSubmit={e=>void saveWorkDraft(e)} className="mt-5 space-y-4">
         <label className="block text-[12px] font-medium">İşlem başlığı
          <input value={draftTitle} onChange={e=>setDraftTitle(e.target.value)} required minLength={4} maxLength={160}
           placeholder="İç görev / işlem başlığı" className="mt-2 w-full rounded-lg border border-[#D7DFE9] px-3 py-2.5 text-[13px] focus:border-[#28547D] focus:outline-none"/>
         </label>
         <label className="block text-[12px] font-medium">Kısa çalışma notu
          <textarea value={draftSummary} onChange={e=>setDraftSummary(e.target.value)}
           placeholder="Kişisel veya gizli dosya bilgisi girmeyiniz."
           rows={4} maxLength={2500} className="mt-2 w-full rounded-lg border border-[#D7DFE9] px-3 py-2.5 text-[13px] focus:border-[#28547D] focus:outline-none"/>
         </label>
         {(section==="billing"||section==="payables")&&<label className="block text-[12px] font-medium">Taslak tutar (EUR)
          <input value={draftAmount} type="text" inputMode="decimal" onChange={e=>setDraftAmount(e.target.value)}
           placeholder="0,00" required className="mt-2 w-full rounded-lg border border-[#D7DFE9] px-3 py-2.5 text-[13px] focus:border-[#28547D] focus:outline-none"/>
          <span className="mt-1 block text-[11px] leading-5 text-[#7B899B]">Muhasebe taslağıdır; tahsilat, ödeme emri veya banka bakiyesi değildir.</span>
         </label>}
         <button disabled={savingDraft} className="rounded-lg bg-[#193C5E] px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50" type="submit">{savingDraft?"Kaydediliyor…":"İç taslak olarak kaydet"}</button>
        </form>
        {draftFeedback&&<p role="status" className="mt-3 text-[12px] leading-6 text-[#685326]">{draftFeedback}</p>}
       </section>
       <section className="rounded-xl border border-[#DFE7EF] bg-white p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold">Kendi çalışma taslaklarım</h2>
        <p className="mt-2 text-[12px] leading-6 text-[#718398]">{drafts.length} iç taslak · yalnızca sizin yetki alanınız</p>
        {drafts.length===0?<p className="mt-6 text-[12px] leading-7 text-[#7C8C9F]">Henüz görüntülenebilir kayıt bulunmuyor. Erişim ve staging bağlantısı etkinleştirilmeden kayıtlar sunulmaz.</p>:
         <div className="mt-4 space-y-2">{drafts.map((item,i)=><article key={String(item.id||i)} className="rounded-lg border border-[#E7EBF1] p-4">
          <h3 className="text-[12px] font-semibold">{fmt(item.title)}</h3>
          <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[12px] leading-6 text-[#62748B]">{fmt(item.summary)}</p>
          <p className="mt-1 text-[11px] text-[#8190A3]">{fmt(item.state)} · {readableDate(item.created_at)}</p>
          {item.state==="draft"&&<button type="button" disabled={savingDraft}
           onClick={()=>void requestReview(item)}
           className="mt-2 rounded-md border border-[#D5E0EA] px-3 py-1.5 text-[11px] font-semibold text-[#234F75] disabled:opacity-50">İç inceleme iste</button>}
          {(section==="billing"||section==="payables")&&<p className="mt-1 text-[12px] font-semibold">{money(item.amount_eur_cents)} · Yalnız taslak</p>}
         </article>)}</div>}
       </section>
      </div>}
      {role==="admin"&&section==="people"&&<StaffGrantManager/>}
      {role==="admin"&&section&&<StaffReviewQueue module={section}/>}
      <footer className="mt-12 border-t border-[#E1E8F0] pt-5 text-[11px] leading-6 text-[#718298]">
       AVOfis · Personel çalışma alanı · Kurumsal ve mevzuata uygun işlem süreçleri
       <p>Bu ekran yalnız yetkili personel içindir. Gerçek resmî işlemlerde dosya kapsamı, insan onayı ve dış sistem makbuzu ayrıca doğrulanır.</p>
      </footer>
     </div>
    </section>
   </div>}
 </main>;
}
