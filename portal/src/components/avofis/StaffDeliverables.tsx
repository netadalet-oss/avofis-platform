"use client";

import { useState,type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
const allowed=["application/pdf","image/png","image/jpeg","image/webp"];

export function StaffDeliverables({caseId}:{caseId:string}){
 const {user}=useUser();
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function upload(e:ChangeEvent<HTMLInputElement>){
   const file=e.currentTarget.files?.[0];e.currentTarget.value="";
   if(!file||!caseId||!user)return;
   if(file.size===0||file.size>10*1024*1024||!allowed.includes(file.type)){
     setMessage("Yalnızca 10 MB veya altındaki PDF, PNG, JPG ve WEBP belgeleri kabul edilir.");return;
   }
   const ext=file.type==="application/pdf"?"pdf":file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const name=file.name.slice(0,200);
   const path=caseId+"/"+user.id+"/"+crypto.randomUUID()+"."+ext;
   setBusy(true);setMessage("");
   try{
     const stored=await supabase.storage.from("avofis-private").upload(path,file,{contentType:file.type,upsert:false});
     if(stored.error){setMessage("Belge özel depoya yüklenemedi. Sözleşme ve erişim yetkisini kontrol edin.");return;}
     const indexed=await supabase.from("avofis_deliverables").insert({case_id:caseId,uploaded_by:user.id,storage_path:path,original_file_name:name});
     if(indexed.error){
       setMessage("Belge depoya yüklendi ancak müşteri teslim listesine kaydedilemedi. Dosya sorumlusu kayıt uyumsuzluğunu gidermelidir.");
       return;
     }
     setMessage("Sonuç belgesi dosyanın teslim listesine kaydedildi.");
   }catch{setMessage("Belge gönderimi tamamlanamadı.");}
   finally{setBusy(false);}
 }
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
   <h2 className="text-[17px] font-semibold">Sonuç belgesi müşteriye ilet</h2>
   <p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">Yalnızca seçilmiş ve sözleşmesi kabul edilmiş dosyaya belge yükleyin. Dosya özel depoda tutulur; müşteri kendi dosya alanından indirir.</p>
   {caseId?<label className="mt-4 block max-w-lg text-[13px] font-semibold">Teslim edilecek belge
      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>void upload(e)} className="mt-3 block w-full min-w-0 cursor-pointer rounded-xl border border-[#dfbf59]/25 p-3 text-[13px] disabled:opacity-50"/>
   </label>:<p className="mt-4 text-[13px] text-[#B9C5DF]">Önce müşteri dosyası seçiniz.</p>}
   {message&&<p role="status" className="mt-4 text-[13px] leading-6 text-[#B9C5DF]">{message}</p>}
 </section>;
}
