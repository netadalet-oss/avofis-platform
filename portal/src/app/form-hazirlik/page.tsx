"use client";
import {useState} from "react";
import {internationalPreviews} from "@/lib/international-form-preview";
import Link from "next/link";
import {PageFrame} from "@/components/avofis/PageFrame";
import {sectorPreviews,validateLocalSectorAnswers,evaluateLocalSectorPreview,
 type PreviewAnswers} from "@/lib/sector-intake-preview";
const catalogue=[...sectorPreviews,...internationalPreviews];
const tr=(value:string)=>value==="unknown"?"Bilmiyorum":value==="yes"?"Evet":value==="no"?"Hayır":value;
export default function FormPreparation(){
 const [id,setId]=useState("R-361");
 const [answers,setAnswers]=useState<PreviewAnswers>({});
 const [confirmed,setConfirmed]=useState("");
 const template=catalogue.find(x=>x.sourceId===id)??catalogue[0];
 const valid=validateLocalSectorAnswers(template,answers);
 const result=valid?evaluateLocalSectorPreview(template,answers,catalogue):null;
 const signature=id+JSON.stringify(answers);
 return <PageFrame lang="tr" eyebrow="L4 · GÖNDERİMSİZ TASLAK"
 title="İş, kira, tüketici ve uluslararası işlem hazırlığı"
 description="31 ayrı konu için yalnız yerel teknik önizleme. Dosya açılmaz; resmî başvuru, hukukî sonuç veya ödeme yapılmaz.">
  <aside className="rounded-xl border p-4 text-sm">
   İsim, kimlik, özel belge veya hassas olay ayrıntısı girmeyin.
   Yanıtlar yalnız bu ekranda bulunur, gönderilmez veya kaydedilmez.
   Diğer dil ve bağımsız hukukî onay henüz yoktur.
   <Link href="/gizlilik?lang=tr" className="ml-2 underline">Gizlilik metni</Link>
  </aside>
  <section className="avofis-card mt-6 rounded-xl border p-5">
   <label htmlFor="sector" className="block font-semibold">Konu</label>
   <select id="sector" className="avofis-field mt-2 w-full" value={id}
    onChange={e=>{setId(e.target.value);setAnswers({});setConfirmed("");}}>
    {catalogue.map(x=><option key={x.sourceId} value={x.sourceId}>{x.sourceId} · {x.title}</option>)}
   </select>
   <p className="mt-3 text-xs">{template.originalRequirement}</p>
   {template.highRisk&&<p role="alert" className="mt-3 border p-3 text-sm">
    Bu konu öncelikli insan incelemesi gerektirebilir; hiçbir hukukî süre hesaplanmaz.
   </p>}
   {template.sensitiveHold&&<p className="mt-3 border p-3 text-sm">
    Hassas veri burada alınmaz; özel paylaşım kanalı kapalıdır.
   </p>}
   <div className="mt-5 grid gap-4 sm:grid-cols-2">
    {template.fields.map(field=><label key={field.key} className="block border p-3 text-sm">
     {field.label}
     {field.kind==="choice"?
      <select className="avofis-field mt-2 w-full" value={answers[field.key]||"unknown"}
       onChange={e=>setAnswers(p=>({...p,[field.key]:e.target.value}))}>
       {[...new Set([...(field.options??[]),"unknown"])].map(choice=>
        <option key={choice} value={choice}>{tr(choice)}</option>)}
      </select>:
      <span className="mt-2 flex items-center gap-2">
       <input className="avofis-field min-w-0 flex-1"
        type={field.kind==="date"?"date":"text"} maxLength={field.kind==="short_note"?160:14}
        value={answers[field.key]==="unknown"?"":answers[field.key]||""}
        disabled={answers[field.key]==="unknown"}
        onChange={e=>setAnswers(p=>({...p,[field.key]:e.target.value}))}/>
       <input type="checkbox" aria-label="Bilmiyorum"
        checked={answers[field.key]==="unknown"}
        onChange={e=>setAnswers(p=>({...p,[field.key]:e.target.checked?"unknown":""}))}/>
       Bilmiyorum
      </span>}
    </label>)}
   </div>
  </section>
  <section aria-label="Yerel özet" className="mt-6 rounded-xl border p-5">
   <h2 className="font-semibold">Yanıtları kontrol edin</h2>
   {!valid&&<p role="alert">Geçersiz sayı veya tarih. Düzeltin ya da Bilmiyorum seçin.</p>}
   {result&&<dl className="mt-3 grid gap-3 sm:grid-cols-2">
    {result.fields.map(x=><div key={x.key}>
     <dt className="text-xs">{x.label}</dt><dd className="font-semibold">{tr(x.answer)}</dd>
    </div>)}
   </dl>}
   <p className="mt-3 text-sm">Bu yalnız taslaktır; hukukî sonuç, dosya veya resmî gönderim değildir.</p>
   <label className="mt-4 flex gap-2 text-sm">
    <input type="checkbox" disabled={!valid} checked={valid&&confirmed===signature}
     onChange={e=>setConfirmed(e.target.checked?signature:"")}/>
    Seçimlerimi kontrol ettim (gönderim değildir).
   </label>
  </section>
 </PageFrame>;
}
