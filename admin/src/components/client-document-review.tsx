"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
type Listing={id:string;case_id:string;service_slug:string;locale:string;revision:number;status:string;updated_at:string};
type Version={revision:number;recorded_at:string;content:Record<string,unknown>};
type Review={id:string;author_user_id:string;note:string;created_at:string};
type Detail={document:Listing&{content:Record<string,unknown>};versions:Version[];notes:Review[]};
async function authorizedFetch(path:string,init?:{method:"POST";body:string}){
 const {data:{session}}=await supabase.auth.getSession();
 if(!session?.access_token)throw Error("Oturum bulunamadı; yeniden giriş yapın.");
 const result=await fetch(path,{cache:"no-store",method:init?.method||"GET",
  headers:{Authorization:"Bearer "+session.access_token,...(init?{"Content-Type":"application/json"}:{})},
  body:init?.body});
 if(!result.ok)throw Error(result.status===403?"Bu dosya için görev veya belge yetkiniz yok.":
  result.status===404?"Dosya kapsamınızdan çıkarılmış veya bulunamadı.":
  result.status===503?"Belge erişim bağlantısı etkin değil.":"İşlem gerçekleştirilemedi.");
 return result.json();
}
const details=["country","institution","purpose","chronology","documentList"] as const;
const names:Record<(typeof details)[number],string>={
 country:"Ülke",institution:"Başvurulacak kurum",purpose:"Amaç",chronology:"Olaylar ve açıklama",
 documentList:"Ekler / belgeler"
};
/** Only real user-owned database records; no seeded preview/placeholder clients. */
export function ClientDocumentReview(){
 const [rows,setRows]=useState<Listing[]>([]);
 const [current,setCurrent]=useState<Detail|null>(null);
 const [note,setNote]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function load(){
  setBusy(true);setError("");
  try{const data=await authorizedFetch("/api/client-documents");
   setRows(data.items||[]);}catch(e){setError(String(e instanceof Error?e.message:e));}
  finally{setBusy(false);}
 }
 async function open(id:string){
  setBusy(true);setError("");setCurrent(null);
  try{const data=await authorizedFetch("/api/client-documents?id="+encodeURIComponent(id));
   setCurrent(data);}catch(e){setError(String(e instanceof Error?e.message:e));}
  finally{setBusy(false);}
 }
 async function addNote(){
  if(!current||busy||note.trim().length<3)return;
  setBusy(true);setError("");
  const id=current.document.id;
  try{await authorizedFetch("/api/client-documents",{method:"POST",body:JSON.stringify({
   draft_id:id,note:note.trim()})});
   setNote("");const data=await authorizedFetch("/api/client-documents?id="+encodeURIComponent(id));
   setCurrent(data);}catch(e){setError(String(e instanceof Error?e.message:e));}
  finally{setBusy(false);}
 }
 useEffect(()=>{void load();},[]);
 return <section className="mt-7 rounded-xl border border-[#DFE7EF] bg-white p-5 sm:p-6">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-[15px] font-semibold">Müşteriden gelen belge incelemeleri</h2>
    <p className="mt-2 text-[12px] leading-6 text-[#64788D]">Yalnız açık rızayla paylaşılmış, size atanmış dosyalar. İçerik müşteri kaydıdır; personel metni değiştiremez.</p></div>
   <button type="button" onClick={()=>void load()} disabled={busy}
    className="rounded-md border border-[#CBD7E5] px-3 py-2 text-xs disabled:opacity-50">Yenile</button>
  </div>
  {error&&<p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}
  {rows.length===0&&!busy&&<p className="mt-4 text-xs text-[#64788D]">İncelenmek üzere paylaşılmış bir belge bulunmuyor.</p>}
  {rows.length>0&&<ul className="mt-4 space-y-2">{rows.map(row=><li key={row.id}
   className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#E0E8EF] p-3 text-xs">
   <span className="break-words">{row.service_slug} · {row.locale.toUpperCase()} · sürüm {row.revision}
    <span className="block mt-1 text-[#72849A]">Dosya: {row.case_id}</span></span>
   <button disabled={busy} type="button" onClick={()=>void open(row.id)}
    className="rounded-md bg-[#193C5E] px-3 py-2 text-white disabled:opacity-50">Dosyayı incele</button>
  </li>)}</ul>}
  {current&&<article className="mt-6 border-t border-[#E0E8EF] pt-5">
   <h3 className="text-sm font-semibold">Müşteri belgesi — sürüm {current.document.revision}</h3>
   <p className="mt-2 text-xs text-[#66778D]">Her sürüm geçmişte korunur. İnceleme notu eklemek resmî başvuru veya hukukî onay değildir.</p>
   <dl className="mt-4 space-y-3">{details.map(key=><div key={key} className="rounded-md bg-[#F6F8FA] p-3">
    <dt className="text-[11px] font-semibold text-[#53677F]">{names[key]}</dt>
    <dd className="mt-2 whitespace-pre-wrap break-words text-xs leading-6" dir="auto">
     {typeof current.document.content[key]==="string"?String(current.document.content[key]):"—"}</dd>
   </div>)}</dl>
   {current.document.content.version===2&&Boolean(current.document.content.answers)&&
      typeof current.document.content.answers==="object"&&
      !Array.isArray(current.document.content.answers)&&
      <section className="mt-5 rounded-lg border border-[#E0E8EF] p-4">
       <h4 className="text-xs font-semibold">Hizmete özgü müşteri beyanları</h4>
       <dl className="mt-3 space-y-2">{Object.entries(current.document.content.answers as Record<string,unknown>)
        .filter(([,v])=>typeof v==="string"&&v.trim().length>0).map(([field,value])=>
        <div key={field} className="rounded-md bg-[#F6F8FA] p-3">
         <dt className="text-[11px] font-semibold">{({
          requestedAction:"İstenen sonuç",incidentDate:"Olay tarihi",noticeDate:"Karar/tebligat tarihi",
          contractDate:"Sözleşme tarihi",expiryDate:"Geçerlilik bitişi",appointmentDate:"Randevu tarihi",
          decisionReference:"Karar referansı",caseReference:"Dosya numarası",courtOrAuthority:"Kurum/merci",
          otherParty:"Karşı taraf",invoiceAmount:"Tutar (EUR)",employerName:"İşveren",
          organizationName:"Şirket",documentOrigin:"Belgenin menşei",qualificationName:"Diploma",
          benefitType:"Yardım/vergi türü",contractType:"Sözleşme türü",
          employmentCategory:"İstihdam türü"})[field as
           "requestedAction"|"incidentDate"|"noticeDate"|"contractDate"|"expiryDate"|"appointmentDate"|
           "decisionReference"|"caseReference"|"courtOrAuthority"|"otherParty"|"invoiceAmount"|
           "employerName"|"organizationName"|"documentOrigin"|"qualificationName"|"benefitType"|
           "contractType"|"employmentCategory"]||field}</dt>
         <dd className="mt-2 whitespace-pre-wrap break-words text-xs" dir="auto">{String(value)}</dd>
        </div>)}</dl>
      </section>}
   <details className="mt-4 rounded-md border border-[#E0E8EF] p-3">
    <summary className="cursor-pointer text-xs font-semibold">Değiştirilemeyen sürüm geçmişi ({current.versions.length})</summary>
    <ol className="mt-3 space-y-2 text-xs">{current.versions.map(v=><li key={v.revision}>
     Sürüm {v.revision} · {new Date(v.recorded_at).toLocaleString("nl-NL")}
     <details className="mt-1"><summary className="cursor-pointer text-[#235B83]">İçeriği görüntüle</summary>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[#F6F8FA] p-3" dir="auto">{JSON.stringify(v.content,null,2)}</pre></details>
    </li>)}</ol>
   </details>
   <h4 className="mt-5 text-xs font-semibold">İnceleme notları</h4>
   {current.notes.length===0?<p className="mt-2 text-xs text-[#72849A]">Henüz not yok.</p>:
    <ol className="mt-3 space-y-2">{current.notes.map(n=><li key={n.id}
     className="rounded-md bg-[#F6F8FA] p-3 text-xs">
      <span className="text-[#64788D]">{new Date(n.created_at).toLocaleString("nl-NL")}</span>
      <p className="mt-2 whitespace-pre-wrap break-words">{n.note}</p></li>)}</ol>}
   <label className="mt-5 block text-xs font-medium">Yeni inceleme notu
    <textarea value={note} maxLength={2500} rows={4} onChange={e=>setNote(e.target.value)}
     className="mt-2 block w-full rounded-md border border-[#CED9E5] p-3 text-xs" placeholder="Kayıt sahibi tarafından görülebilen inceleme notu"/></label>
   <button type="button" onClick={()=>void addNote()} disabled={busy||note.trim().length<3}
    className="mt-3 rounded-md bg-[#193C5E] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Notu kaydet</button>
  </article>}
 </section>;
}
