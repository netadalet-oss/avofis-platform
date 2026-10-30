"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
import type {StaffCapability} from "@/lib/workspace-model";
type ReviewItem={
 id:string;title:string;summary:string;module:string;staff_user_id:string;state:string;
 amount_eur_cents:number|null;flow:"expense"|"income"|null;
 created_at:string;canIndependentlyReview:boolean;
 reviewers:{reviewer_user_id:string;decision:"reviewed_internal"|"changes_requested"}[];
};
export function StaffReviewQueue({module}:{module:StaffCapability}){
 const [records,setRecords]=useState<ReviewItem[]>([]);
 const [status,setStatus]=useState("");
 const [pending,setPending]=useState(false);
 const [loaded,setLoaded]=useState(false);
 async function load(){
  setPending(true);setStatus("");setRecords([]);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){setStatus("Personel oturumu doğrulanamadı.");return;}
   const r=await fetch("/api/workspace/reviews?module="+module,{
    cache:"no-store",headers:{Authorization:"Bearer "+session.access_token}});
   const body=await r.json() as {error?:string;items?:ReviewItem[]};
   if(!r.ok){setStatus(r.status===503?
    "Bağımsız inceleme alanı yalnız doğrulanmış staging ortamında açılabilir.":
    "İnceleme kayıtlarına erişim doğrulanamadı.");return;}
   setRecords(body.items||[]);
  }catch{setStatus("İnceleme kayıtları şu anda getirilemedi.");}
  finally{setPending(false);setLoaded(true);}
 }
 useEffect(()=>{void load();/* re-evaluate access when selecting a module */},[module]);
 async function sign(item:ReviewItem,decision:"reviewed_internal"|"changes_requested"){
  if(pending)return;setPending(true);setStatus("");
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token){setStatus("Oturum geçersiz.");return;}
   const r=await fetch("/api/workspace/reviews",{
    method:"POST",headers:{"Content-Type":"application/json",
    Authorization:"Bearer "+session.access_token},
    body:JSON.stringify({work_item_id:item.id,decision})});
   const res=await r.json() as {error?:string};
   if(!r.ok){setStatus(r.status===503?
     "Bağımsız iç inceleme yazma işlemi henüz etkinleştirilmedi.":
     "İnceleme kaydı kabul edilmedi; farklı yönetici ve geçerli görev şartı aranır.");return;}
   await load();
   setStatus("İç inceleme kaydedildi. Resmî veya mali işlem gerçekleştirilmedi.");
  }catch{setStatus("İnceleme işlemi doğrulanamadı.");}
  finally{setPending(false);}
 }
 const euro=(n:number|null)=>n===null?"—":
  new Intl.NumberFormat("nl-NL",{style:"currency",currency:"EUR"}).format(n/100);
 return <section className="mt-7 rounded-xl border border-[#DCE5EE] bg-white p-5 sm:p-6"
   aria-label="Bağımsız iç inceleme kuyruğu">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div><h2 className="text-[15px] font-semibold">Bağımsız iç inceleme</h2>
    <p className="mt-1 text-[12px] leading-6 text-[#64788D]">
     Hazırlayan kişiden farklı yöneticilerin yaptığı iç kalite kontrolüdür; ödeme, resmî teslim veya hukukî onay değildir.
    </p></div>
   <button type="button" disabled={pending} onClick={()=>void load()}
    className="rounded-lg border border-[#CCD8E4] px-3 py-2 text-[12px] font-medium disabled:opacity-50">Yenile</button>
  </div>
  {status&&<p role="status" className="mt-4 rounded-lg bg-[#F8F2E6] p-3 text-[12px] text-[#765D32]">{status}</p>}
  {loaded&&records.length===0&&<p className="mt-5 text-[12px] leading-6 text-[#718298]">
   Bu modülde görüntülenebilir inceleme talebi bulunmuyor.
  </p>}
  <div className="mt-5 space-y-3">
   {records.map(item=>{
    const reviewed=item.reviewers.filter(x=>x.decision==="reviewed_internal").length;
    return <article key={item.id} className="rounded-lg border border-[#E4EAF0] p-4">
     <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-[13px] font-semibold">{item.title}</h3>
       <p className="mt-1 max-w-xl whitespace-pre-wrap text-[12px] leading-6 text-[#66798E]">{item.summary}</p>
       <p className="mt-1 text-[11px] text-[#8B98A8]">İç taslak · {item.state} · {item.created_at.slice(0,10)}</p></div>
      <span className="text-[12px] font-semibold text-[#214D71]">
       {item.flow?euro(item.amount_eur_cents):"İç görev"}
      </span>
     </div>
     <p className="mt-3 text-[12px] text-[#63778F]">Bağımsız inceleme: {reviewed} farklı yönetici kaydı
      {item.flow?" · Mali işlemi serbest bırakmaz":""}</p>
     {item.canIndependentlyReview&&
      <div className="mt-3 flex flex-wrap gap-2">
       <button type="button" disabled={pending} onClick={()=>void sign(item,"reviewed_internal")}
        className="rounded-lg bg-[#1E496E] px-3 py-2 text-[12px] font-medium text-white disabled:opacity-50">İç incelemeyi kaydet</button>
       <button type="button" disabled={pending} onClick={()=>void sign(item,"changes_requested")}
        className="rounded-lg border border-[#CDD7E2] px-3 py-2 text-[12px] font-medium disabled:opacity-50">Düzeltme iste</button>
      </div>}
    </article>;
   })}
  </div>
 </section>;
}
