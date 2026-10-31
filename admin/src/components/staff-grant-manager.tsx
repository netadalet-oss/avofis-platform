"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
import {sections,type StaffCapability} from "@/lib/workspace-model";
type Staff={user_id:string;role:string};
type Grant={staff_user_id:string;capability:string;granted_at:string};
type Event={staff_user_id:string;capability:string;action:string;recorded_at:string};
export function StaffGrantManager(){
 const [staff,setStaff]=useState<Staff[]>([]);
 const [grants,setGrants]=useState<Grant[]>([]);
 const [events,setEvents]=useState<Event[]>([]);
 const [selected,setSelected]=useState("");
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(false);
 const [loaded,setLoaded]=useState(false);
 async function read(){
  setLoading(true);setMessage("");
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){setMessage("Yönetici oturumu doğrulanamadı.");return;}
   const result=await fetch("/api/workspace/grants",{cache:"no-store",
    headers:{Authorization:"Bearer "+session.access_token}});
   const data=await result.json() as {
    staff?:Staff[];grants?:Grant[];audit?:Event[];error?:string
   };
   if(!result.ok){setMessage(result.status===503?
    "Personel yetkileri gerçek staging ortamı doğrulanıncaya kadar düzenlenemez.":
    "Personel siciline erişim doğrulanamadı.");return;}
   setStaff(data.staff||[]);setGrants(data.grants||[]);setEvents(data.audit||[]);
   setSelected(prev=>(data.staff||[]).some(x=>x.user_id===prev)?prev:
    (data.staff||[]).find(x=>x.role==="operator")?.user_id||"");
  }catch{setMessage("Yetki sicili şu anda kullanılamıyor.");}
  finally{setLoading(false);setLoaded(true);}
 }
 useEffect(()=>{void read();},[]);
 const operator=staff.find(x=>x.user_id===selected&&x.role==="operator");
 const active=new Set(grants.filter(x=>x.staff_user_id===selected).map(x=>x.capability));
 async function toggle(capability:StaffCapability){
  if(!operator||loading)return;setLoading(true);setMessage("");
  const granted=active.has(capability);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){setMessage("Oturum geçersiz.");return;}
   const res=await fetch("/api/workspace/grants",{method:granted?"DELETE":"POST",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},
    body:JSON.stringify({staff_user_id:operator.user_id,capability})});
   const data=await res.json() as {error?:string};
   if(!res.ok){setMessage(res.status===503?
    "Bu işlem yalnız ayrıca onaylanmış staging ortamında açılabilir.":
    "Yetki değişikliği reddedildi: doğrulanmış yönetici ve kapsam koşulları gerekiyor.");return;}
   await read();
   setMessage(granted?"Kişisel modül izni kaldırıldı ve işlem kaydedildi.":
    "Kişisel modül izni verildi ve işlem kaydedildi.");
  }catch{setMessage("Yetki değişikliği tamamlanamadı.");}
  finally{setLoading(false);}
 }
 return <section aria-label="Personel modül yetkileri"
  className="mt-7 rounded-xl border border-[#DEE7F0] bg-white p-5 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div><h2 className="text-[15px] font-semibold">Personel modül yetkileri</h2>
    <p className="mt-1 text-[12px] leading-6 text-[#64778D]">Her izin bir kişi ve modül için ayrı tanımlanır. Dosyaya atama ve meslekî yetki ayrıca doğrulanır.</p></div>
   <button onClick={()=>void read()} disabled={loading} className="rounded-lg border border-[#D3DCE6] px-3 py-2 text-[12px] disabled:opacity-50" type="button">Sicili yenile</button>
  </div>
  {message&&<p role="status" className="mt-4 rounded-lg bg-[#FAF5E9] p-3 text-[12px] text-[#765B30]">{message}</p>}
  {loaded&&staff.length>0&&<>
   <label className="mt-5 block max-w-xl text-[12px] font-semibold">Personel hesabı
    <select className="mt-2 w-full rounded-lg border border-[#D7E1EA] bg-white px-3 py-2.5 text-[12px]"
     value={selected} onChange={e=>setSelected(e.target.value)}>
     {staff.filter(x=>x.role==="operator").map(u=><option key={u.user_id} value={u.user_id}>
      Personel · {u.user_id.slice(0,8)}…{u.user_id.slice(-4)}
     </option>)}
    </select>
   </label>
   {operator?<div className="mt-5 grid gap-2 sm:grid-cols-2">
    {sections.map(item=><label key={item.id} className="flex items-center gap-3 rounded-lg border border-[#E5EBF2] px-3 py-3">
     <input type="checkbox" disabled={loading} checked={active.has(item.id)}
      onChange={()=>void toggle(item.id)} className="h-4 w-4 accent-[#214D73]"/>
     <span className="text-[12px] font-medium">{item.label}</span>
    </label>)}
   </div>:<p className="mt-5 text-[12px] text-[#718298]">Yetkilendirilebilir operatör kaydı bulunamadı.</p>}
   <div className="mt-6 border-t border-[#E2E9F1] pt-5">
    <h3 className="text-[13px] font-semibold">Yetki değişiklik geçmişi</h3>
    <p className="mt-1 text-[11px] leading-6 text-[#6A7B90]">Son 40 olay · denetim kayıtları ekleme sonrasında değiştirilemez.</p>
    <ol className="mt-3 space-y-2">{events.slice(0,40).map((e,i)=><li key={i} className="flex flex-wrap justify-between gap-2 border-t border-[#EEF2F6] pt-2 text-[11px] text-[#5F7289]">
     <span>{e.action==="granted"?"İzin verildi":"İzin kaldırıldı"} · {sections.find(s=>s.id===e.capability)?.label||e.capability}</span>
     <span>{e.staff_user_id.slice(0,8)}… · {e.recorded_at.slice(0,16).replace("T"," ")}</span>
    </li>)}</ol>
   </div>
  </>}
 </section>;
}
