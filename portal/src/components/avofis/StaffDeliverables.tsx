"use client";

import { useState,type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import type { Language } from "@/lib/avofis-content";
const labels={"tr":{"title":"Sonuç belgesini müşteriye ilet","intro":"Yalnızca seçilen, sözleşmesi kabul edilmiş dosyaya sonuç yükleyin. Belgeler özel depoda kalır ve müşteri kendi dosyasından indirir.","field":"Teslim edilecek belge","choose":"Önce müşteri dosyası seçin.","invalid":"Yalnızca 10 MB'a kadar PDF, PNG, JPG ve WEBP belgeleri kabul edilir.","failed":"Belge özel depoya yüklenemedi; sözleşme ve erişim yetkisini kontrol edin.","indexError":"Belge depoya yüklendi fakat teslim listesine kaydedilemedi. Dosya sorumlusu kayıt uyumsuzluğunu gidermelidir.","success":"Sonuç belgesi müşterinin teslim listesine kaydedildi.","unexpected":t.unexpected},"nl":{"title":"Resultaatdocument aan klant leveren","intro":"Lever alleen bestanden bij een geselecteerd dossier met geaccepteerde overeenkomst. De documenten blijven privé en zijn beschikbaar via het klantdossier.","field":"Op te leveren document","choose":"Selecteer eerst een klantdossier.","invalid":"Alleen PDF-, PNG-, JPG- en WEBP-bestanden tot 10 MB toegestaan.","failed":"Upload naar privéopslag mislukt; controleer overeenkomst en rechten.","indexError":"Bestand opgeslagen maar niet in de afleverlijst geregistreerd. De dossierbeheerder moet dit herstellen.","success":"Resultaatdocument geregistreerd in de afleverlijst.","unexpected":"Document kon niet worden verstuurd."},"en":{"title":"Deliver result documents to client","intro":"Only upload results to a selected case with an accepted agreement. Files remain private and are downloadable through the client's case.","field":"Document for delivery","choose":"Choose a client case first.","invalid":"Only PDF, PNG, JPG and WEBP up to 10 MB are accepted.","failed":"Could not upload to private storage; check agreement and access permissions.","indexError":"File uploaded but not recorded in delivery list. The case operator must reconcile the records.","success":"Result document recorded for client delivery.","unexpected":"Could not complete the document submission."}};
const allowed=["application/pdf","image/png","image/jpeg","image/webp"];

export function StaffDeliverables({caseId,lang}:{caseId:string;lang:Language}){
 const t=labels[lang];
 const {user}=useUser();
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function upload(e:ChangeEvent<HTMLInputElement>){
   const file=e.currentTarget.files?.[0];e.currentTarget.value="";
   if(!file||!caseId||!user)return;
   if(file.size===0||file.size>10*1024*1024||!allowed.includes(file.type)){
     setMessage(t.invalid);return;
   }
   const ext=file.type==="application/pdf"?"pdf":file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const name=file.name.slice(0,200);
   const path=caseId+"/"+user.id+"/"+crypto.randomUUID()+"."+ext;
   setBusy(true);setMessage("");
   try{
     const stored=await supabase.storage.from("avofis-private").upload(path,file,{contentType:file.type,upsert:false});
     if(stored.error){setMessage(t.failed);return;}
     const indexed=await supabase.from("avofis_deliverables").insert({case_id:caseId,uploaded_by:user.id,storage_path:path,original_file_name:name});
     if(indexed.error){
       setMessage(t.indexError);
       return;
     }
     setMessage(t.success);
   }catch{setMessage(t.unexpected);}
   finally{setBusy(false);}
 }
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
   <h2 className="text-[17px] font-semibold">{t.title}</h2>
   <p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">{t.intro}</p>
   {caseId?<label className="mt-4 block max-w-lg text-[13px] font-semibold">{t.field}
      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>void upload(e)} className="mt-3 block w-full min-w-0 cursor-pointer rounded-xl border border-[#dfbf59]/25 p-3 text-[13px] disabled:opacity-50"/>
   </label>:<p className="mt-4 text-[13px] text-[#B9C5DF]">{t.choose}</p>}
   {message&&<p role="status" className="mt-4 text-[13px] leading-6 text-[#B9C5DF]">{message}</p>}
 </section>;
}
