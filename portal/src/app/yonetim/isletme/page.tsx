"use client";
import Link from "next/link";
import { useEffect,useState,type FormEvent } from "react";
import { ArrowLeft,BriefcaseBusiness,ClipboardList,LockKeyhole,RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { businessPlan } from "@/lib/avofis-business-plan";
import { useUser } from "@/hooks/useUser";
type WorkItem={id:string;title:string;group_key:string;owner_label:string;status:string;priority:string;due_on:string|null;budget_eur_cents:number|null;notes:string;created_at:string};
const groups:[string,string][]=[["company","Kuruluş ve ortaklık"],["legal","Hukukî uygunluk"],["finance","Finans ve muhasebe"],["services","Hizmet geliştirme"],["partners","İş ortakları"],["operations","Personel ve operasyon"],["security","Portal ve veri güvenliği"],["marketing","Pazarlama ve büyüme"],["quality","Kalite ve denetim"]];
const statuses:[string,string][]=[["todo","Planlandı"],["in_progress","Yürütülüyor"],["blocked","Engel var"],["done","Tamamlandı"]];
const priorities:[string,string][]=[["low","Düşük"],["normal","Normal"],["high","Yüksek"],["critical","Kritik"]];
const enabled=process.env.NEXT_PUBLIC_AVOFIS_INTERNAL_ENABLED==="true";
export default function InternalOperationsPage(){
 const {user,loading:authLoading}=useUser();
 const [admin,setAdmin]=useState<boolean|null>(null),[items,setItems]=useState<WorkItem[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 const [filter,setFilter]=useState("all"),[title,setTitle]=useState(""),[group,setGroup]=useState("company"),[owner,setOwner]=useState(""),[priority,setPriority]=useState("normal"),[due,setDue]=useState(""),[budget,setBudget]=useState(""),[notes,setNotes]=useState("");
 useEffect(()=>{
  if(!enabled||!user){setAdmin(null);return;}
  let active=true;
  void supabase.from("avofis_staff").select("role").eq("user_id",user.id).maybeSingle().then(({data,error})=>{
   if(active){setAdmin(!error&&data?.role==="admin");}
  });
  return ()=>{active=false;};
 },[user?.id]);
 async function refresh(){
  if(!enabled||!user||admin!==true)return;
  setBusy(true);setError("");
  const {data,error}=await supabase.from("avofis_internal_tasks").select("id,title,group_key,owner_label,status,priority,due_on,budget_eur_cents,notes,created_at").order("created_at",{ascending:false}).limit(300);
  if(error)setError("İç görevler yüklenemedi. Veri tabanı geçişini ve yönetici erişimini kontrol edin.");
  else setItems(data as WorkItem[]||[]);
  setLoaded(!error);
  setBusy(false);
 }
 useEffect(()=>{if(admin===true)void refresh();},[admin,user?.id]);
 async function initialiseBusinessPlan(){
  if(!enabled||!user||admin!==true||busy||!loaded||items.length!==0)return;
  setBusy(true);setError("");
  const records=businessPlan.map(task=>({...task,created_by:user.id,status:"todo",owner_label:"",notes:task.notes,budget_eur_cents:null,due_on:null}));
  const {error}=await supabase.from("avofis_internal_tasks").insert(records);
  if(error)setError("Kuruluş planı kaydedilemedi: "+error.message);
  else await refresh();
  setBusy(false);
 }
 async function create(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!user||!admin||!enabled||title.trim().length<3||busy)return;
  const cents=budget.trim()?Math.round(Number(budget)*100):null;
  if(cents!==null&&(!Number.isFinite(cents)||cents<0||cents>1000000000)){setError("Geçerli bir bütçe tutarı girin.");return;}
  setBusy(true);setError("");
  const {error}=await supabase.from("avofis_internal_tasks").insert({title:title.trim().slice(0,180),group_key:group,owner_label:owner.trim().slice(0,100),priority,notes:notes.trim().slice(0,2000),due_on:due||null,budget_eur_cents:cents,created_by:user.id,status:"todo"});
  if(error)setError("Görev kaydedilemedi: "+error.message);
  else{setTitle("");setNotes("");setOwner("");setDue("");setBudget("");await refresh();}
  setBusy(false);
 }
 async function changeStatus(id:string,status:string){
  if(!admin||busy)return;
  setBusy(true);setError("");
  const {error}=await supabase.from("avofis_internal_tasks").update({status}).eq("id",id);
  if(error)setError("Durum değiştirilemedi: "+error.message);
  else await refresh();
  setBusy(false);
 }
 const visible=items.filter(x=>filter==="all"||x.group_key===filter);
 const total=items.reduce((s,x)=>s+(x.budget_eur_cents||0),0);
 return <main className="avofis-theme min-h-screen">
  <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
   <Link href="/yonetim" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#dfbf59]"><ArrowLeft className="h-4 w-4"/>Personel paneli</Link>
   <div className="mt-7 flex items-start gap-3.5"><span className="avofis-icon-tile"><BriefcaseBusiness className="h-5 w-5"/></span><div><p className="avofis-eyebrow">YETKİLİ YÖNETİCİ ALANI</p><h1 className="mt-2 text-[clamp(1.9rem,3.5vw,2.6rem)] font-semibold leading-tight tracking-[-.04em] text-[#F2F5FF]">İşletme kuruluşu ve çalışma programı</h1><p className="mt-3 max-w-3xl text-[14px] leading-[1.8] text-[#B9C5DF]">Ortaklık, hukukî uygunluk, mali hazırlık, iş ortakları, operasyon, teknoloji ve pazarlama görevleri. Müşteri portalında gösterilmez.</p></div></div>
   {!enabled?<div role="status" className="avofis-card mt-7 flex items-start gap-3 rounded-[16px] border p-5"><LockKeyhole className="h-5 w-5 shrink-0 text-[#dfbf59]"/><p className="text-[13px] leading-[1.8] text-[#B9C5DF]">Yönetici çalışma alanı etkinleştirilmemiştir. Yetki ve veri tabanı kontrolleri tamamlanmalıdır.</p></div>
   :authLoading||admin===null?<p className="mt-7 text-[13px] text-[#B9C5DF]">Yönetici yetkisi kontrol ediliyor…</p>
   :!admin?<div role="alert" className="avofis-card mt-7 rounded-[16px] border p-5 text-[13px] text-[#f0d56d]">Bu alana yalnızca yetkili AVOfis yöneticileri erişebilir.</div>:<>
    {error&&<p role="alert" className="mt-6 rounded-lg border border-red-400/25 bg-red-950/30 p-4 text-[13px] text-red-200">{error}</p>}
    <div className="mt-7 grid gap-3 sm:grid-cols-3">
      <div className="avofis-card rounded-[14px] border p-4"><p className="text-[12px] text-[#B9C5DF]">Toplam görev</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#F2F5FF]">{items.length}</p></div>
      <div className="avofis-card rounded-[14px] border p-4"><p className="text-[12px] text-[#B9C5DF]">Tamamlanan</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#F2F5FF]">{items.filter(i=>i.status==="done").length}</p></div>
      <div className="avofis-card rounded-[14px] border p-4"><p className="text-[12px] text-[#B9C5DF]">Girilen tahmini bütçe</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#F2F5FF]">{(total/100).toLocaleString("nl-NL",{style:"currency",currency:"EUR"})}</p></div>
    </div>
    {loaded&&items.length===0&&!error&&<div className="avofis-card mt-5 flex flex-col gap-4 rounded-[16px] border p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[15px] font-semibold text-[#F2F5FF]">24 maddelik AVOfis kuruluş planı</h2><p className="mt-1 text-[12px] leading-[1.8] text-[#B9C5DF]">Bu işlem, kuruluş ve işletme hazırlıklarının 24 gerçek görev kaydını yalnızca yetkili yönetici alanına ekler. Hiçbiri kendiliğinden tamamlanmış sayılmaz.</p></div><button type="button" disabled={busy} onClick={()=>void initialiseBusinessPlan()} className="avofis-cta avofis-btn shrink-0 disabled:opacity-50">24 görevi oluştur</button></div>}
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(290px,.7fr)]">
     <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
       <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-[17px] font-semibold text-[#F2F5FF]"><ClipboardList className="h-5 w-5 text-[#dfbf59]"/>Kuruluş ve operasyon görevleri</h2><button type="button" disabled={busy} onClick={()=>void refresh()} className="avofis-icon-btn" aria-label="Yenile"><RefreshCw className="h-4 w-4"/></button></div>
       <label className="mt-4 block text-[13px] font-semibold">Çalışma alanı<select value={filter} className="avofis-field" onChange={e=>setFilter(e.target.value)}><option value="all">Tüm alanlar</option>{groups.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
       <div className="mt-5 grid gap-3">{visible.map(item=><article key={item.id} className="rounded-xl border border-[#dfbf59]/15 bg-[#071738]/70 p-4">
         <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-[#F2F5FF]">{item.title}</p><p className="mt-1 text-[12px] text-[#dfbf59]">{groups.find(g=>g[0]===item.group_key)?.[1]} · {priorities.find(p=>p[0]===item.priority)?.[1]} öncelik</p></div><select disabled={busy} aria-label="Görev durumu" value={item.status} onChange={e=>void changeStatus(item.id,e.target.value)} className="rounded-lg border border-[#dfbf59]/25 p-2 text-[12px]">{statuses.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></div>
         {item.notes&&<p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-[1.7] text-[#B9C5DF]">{item.notes}</p>}
         <p className="mt-2 text-[12px] text-[#B9C5DF]">{item.owner_label&&"Sorumlu: "+item.owner_label}{item.due_on&&" · Hedef: "+new Date(item.due_on+"T12:00:00Z").toLocaleDateString("tr-TR")}{item.budget_eur_cents!==null&&" · Bütçe: "+(item.budget_eur_cents/100).toFixed(2)+" €"}</p>
       </article>)}{!visible.length&&<p className="text-[13px] leading-7 text-[#B9C5DF]">Bu alanda henüz kayıtlı görev bulunmuyor.</p>}</div>
     </section>
     <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
       <h2 className="text-[17px] font-semibold text-[#F2F5FF]">Yeni görev</h2>
       <form onSubmit={create} className="mt-4 grid gap-3">
        <label className="avofis-form-label block">Görev<input required maxLength={180} minLength={3} value={title} onChange={e=>setTitle(e.target.value)} className="avofis-field"/></label>
        <label className="avofis-form-label block">Alan<select value={group} className="avofis-field" onChange={e=>setGroup(e.target.value)}>{groups.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
        <label className="avofis-form-label block">Sorumlu<input maxLength={100} value={owner} onChange={e=>setOwner(e.target.value)} className="avofis-field" placeholder="Yetkili kişi veya ekip"/></label>
        <label className="avofis-form-label block">Öncelik<select value={priority} onChange={e=>setPriority(e.target.value)} className="avofis-field">{priorities.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
        <label className="avofis-form-label block">Hedef tarih<input type="date" value={due} className="avofis-field" onChange={e=>setDue(e.target.value)}/></label>
        <label className="avofis-form-label block">Tahmini bütçe (€)<input type="number" min="0" max="10000000" step="0.01" value={budget} onChange={e=>setBudget(e.target.value)} className="avofis-field"/></label>
        <label className="avofis-form-label block">Notlar<textarea rows={3} maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} className="avofis-field"/></label>
        <button disabled={busy} className="avofis-cta avofis-btn w-full disabled:opacity-50">{busy?"Kaydediliyor…":"Görevi kaydet"}</button>
       </form>
     </section>
    </div>
   </>}
  </div>
 </main>;
}
