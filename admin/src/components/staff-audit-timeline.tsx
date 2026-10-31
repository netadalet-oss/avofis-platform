"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
type Priv={staff_user_id:string;capability:string;actor_user_id:string|null;action:string;recorded_at:string};
type Work={work_item_id:string;actor_user_id:string|null;event_kind:string;from_state:string|null;to_state:string;recorded_at:string};
type Sign={work_item_id:string;reviewer_user_id:string;decision:string;reviewed_at:string};
type Audit={privilegeEvents:Priv[];workEvents:Work[];internalSignoffs:Sign[]};
type Row={category:string;action:string;actor:string;reference:string;at:string};
const short=(id:string|null)=>id?id.slice(0,8)+"…":"Sistem";
function summarize(d:Audit):Row[]{
 const result:Row[]=[
  ...d.privilegeEvents.map(x=>({category:"Personel yetkisi",
   action:x.action==="granted"?"İzin verildi":"İzin kaldırıldı",
   actor:short(x.actor_user_id),reference:x.capability+" · "+short(x.staff_user_id),at:x.recorded_at})),
  ...d.workEvents.map(x=>({category:"İç görev",
   action:x.event_kind==="review_requested"?"İnceleme istendi":
    x.event_kind==="created"?"Taslak oluşturuldu":"Taslak düzenlendi",
   actor:short(x.actor_user_id),reference:short(x.work_item_id),at:x.recorded_at})),
  ...d.internalSignoffs.map(x=>({category:"İnceleme",
   action:x.decision==="reviewed_internal"?"İç kontrol kaydedildi":"Düzeltme istendi",
   actor:short(x.reviewer_user_id),reference:short(x.work_item_id),at:x.reviewed_at}))
 ];
 return result.sort((a,b)=>b.at.localeCompare(a.at)).slice(0,100);
}
export function StaffAuditTimeline(){
 const [data,setData]=useState<Audit>({privilegeEvents:[],workEvents:[],internalSignoffs:[]});
 const [note,setNote]=useState(""),[loaded,setLoaded]=useState(false),[loading,setLoading]=useState(false);
 async function read(){
  setLoading(true);setNote("");
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){setNote("Oturum yeniden doğrulanmalıdır.");return;}
   const r=await fetch("/api/workspace/audit",{cache:"no-store",
     headers:{Authorization:"Bearer "+session.access_token}});
   const body=await r.json() as Audit&{error?:string};
   if(!r.ok){setNote(r.status===503?
     "Denetim kayıtları yalnız doğrulanmış staging veritabanında görüntülenebilir.":
     "Bu kayıtları inceleme yetkisi doğrulanamadı.");return;}
   setData({privilegeEvents:body.privilegeEvents||[],
    workEvents:body.workEvents||[],internalSignoffs:body.internalSignoffs||[]});
  }catch{setNote("Denetim kaydı bağlantısı şu anda kullanılamıyor.");}
  finally{setLoaded(true);setLoading(false);}
 }
 useEffect(()=>{void read();},[]);
 const rows=summarize(data);
 return <section aria-label="Personel güvenlik ve işlem denetim geçmişi"
  className="mt-7 rounded-xl border border-[#DFE7EF] bg-white p-5 sm:p-6">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-[15px] font-semibold">Güvenlik ve işlem denetim kayıtları</h2>
    <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#687B90]">
     Kişisel modül izni değişiklikleri, iç görev durumları ve bağımsız inceleme kayıtlarının yalnız yöneticiye açık özeti.
    </p></div>
   <button type="button" onClick={()=>void read()} disabled={loading}
    className="rounded-lg border border-[#D6E1EC] px-3 py-2 text-[12px] disabled:opacity-50">Yenile</button>
  </div>
  {note&&<p role="status" className="mt-4 rounded-lg border border-[#EFE2C9] bg-[#FFFAEF] px-3 py-3 text-[12px] text-[#705932]">{note}</p>}
  <div className="mt-5 grid gap-2 sm:grid-cols-3">
   {[["İzin olayları",data.privilegeEvents.length],["Görev olayları",data.workEvents.length],
     ["İç incelemeler",data.internalSignoffs.length]].map(([label,num])=>
    <div key={label} className="rounded-lg border border-[#E5ECF3] bg-[#F9FBFD] p-4">
     <p className="text-[11px] text-[#73859A]">{label}</p>
     <p className="mt-1 text-xl font-semibold tabular-nums text-[#1D3D5C]">{num}</p>
    </div>)}
  </div>
  {loaded&&rows.length===0?<p className="mt-5 text-[12px] text-[#687C90]">
   Görüntülenebilir denetim olayı yok.
  </p>:<div className="mt-5 overflow-x-auto">
   <table className="w-full min-w-[580px] border-collapse text-start text-[12px]">
    <thead><tr className="border-b border-[#DDE6EF] text-[#62768B]">
     {["Zaman","Kategori","Olay","İşlem yapan","İlgili kayıt"].map(x=><th key={x} className="py-3 pe-3 text-start font-semibold">{x}</th>)}
    </tr></thead>
    <tbody>{rows.map((row,i)=><tr key={row.category+"-"+row.reference+"-"+row.at+"-"+i}
     className="border-b border-[#EDF2F6] text-[#304963]">
     <td className="whitespace-nowrap py-3 pe-3">{row.at.replace("T"," ").slice(0,16)}</td>
     <td className="py-3 pe-3">{row.category}</td><td className="py-3 pe-3">{row.action}</td>
     <td className="py-3 pe-3">{row.actor}</td><td className="py-3 pe-3">{row.reference}</td>
    </tr>)}</tbody>
   </table>
  </div>}
  <p className="mt-5 text-[11px] leading-6 text-[#7B8B9B]">
   Kayıtlar veritabanı politikalarıyla korunur. Bu özet, bağımsız denetim veya değiştirilemez dış kayıt saklama sisteminin sertifikalı kanıtı değildir; hukukî, mali ya da resmî işlem onayı vermez.
  </p>
 </section>;
}
