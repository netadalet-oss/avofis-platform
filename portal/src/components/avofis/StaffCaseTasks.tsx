"use client";
import { useEffect,useState,type FormEvent } from "react";
import { ClipboardList,Plus,RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Task={id:string;case_id:string;title:string;details:string;due_at:string|null;status:string;visible_to_client:boolean};
const statuses:[string,string][]=[["pending","Bekleniyor"],["in_progress","İşlemde"],["completed","Tamamlandı"],["cancelled","İptal edildi"]];
export function StaffCaseTasks({caseId,userId}:{caseId:string;userId:string}){
 const [items,setItems]=useState<Task[]>([]),[title,setTitle]=useState(""),[details,setDetails]=useState(""),[due,setDue]=useState(""),[clientVisible,setClientVisible]=useState(false);
 const [working,setWorking]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState("");
 async function refresh(){
  setLoading(true);setError("");
  const {data,error}=await supabase.from("avofis_case_tasks").select("id,case_id,title,details,due_at,status,visible_to_client").eq("case_id",caseId).order("created_at",{ascending:false});
  if(error)setError("Görevler alınamadı. Veritabanı geçişini ve erişim yetkilerini kontrol edin.");
  else setItems(data as Task[]||[]);
  setLoading(false);
 }
 useEffect(()=>{if(caseId)void refresh();},[caseId]);
 async function add(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!caseId||!title.trim()||working)return;
  setWorking(true);setError("");
  const {error}=await supabase.from("avofis_case_tasks").insert({case_id:caseId,title:title.trim().slice(0,180),details:details.trim().slice(0,1200),due_at:due?due+"T12:00:00.000Z":null,created_by:userId,visible_to_client:clientVisible,status:"pending"});
  if(error)setError("Görev kaydedilemedi: "+error.message);
  else{setTitle("");setDetails("");setDue("");setClientVisible(false);await refresh();}
  setWorking(false);
 }
 async function update(id:string,patch:Partial<Pick<Task,"status"|"visible_to_client">>){
  setWorking(true);setError("");
  const {error}=await supabase.from("avofis_case_tasks").update(patch).eq("id",id).eq("case_id",caseId);
  if(error)setError("Görev güncellenemedi: "+error.message);
  else await refresh();
  setWorking(false);
 }
 if(!caseId)return <section className="avofis-card rounded-[18px] border p-5"><h2 className="text-[17px] font-semibold">Görevler ve tarihler</h2><p className="mt-2 text-[13px] text-[#B9C5DF]">Önce dosya seçiniz.</p></section>;
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
  <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-[17px] font-semibold"><ClipboardList className="h-5 w-5 text-[#dfbf59]"/>Görevler, işlem takibi ve tarihler</h2><button type="button" disabled={loading} onClick={()=>void refresh()} aria-label="Görevleri yenile" className="avofis-icon-btn"><RefreshCw className="h-4 w-4"/></button></div>
  <p className="mt-2 text-[12px] leading-[1.75] text-[#B9C5DF]">Süreler yetkili uzman tarafından doğrulanmalı. Görev tarihi otomatik hukukî süre hesabı değildir.</p>
  {error&&<p role="alert" className="mt-3 rounded-lg border border-red-400/25 bg-red-950/30 p-3 text-[13px] text-red-200">{error}</p>}
  <div className="mt-4 grid gap-2">{items.map(item=><div key={item.id} className="rounded-xl border border-[#dfbf59]/15 bg-[#071738]/70 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-[#F2F5FF]">{item.title}</p>{item.details&&<p className="mt-1 text-[12px] leading-[1.7] text-[#B9C5DF]">{item.details}</p>}{item.due_at&&<p className="mt-1 text-[12px] text-[#dfbf59]">Kaydedilen tarih: {new Date(item.due_at).toLocaleDateString("tr-TR")}</p>}</div><select aria-label="Görev durumu" disabled={working} value={item.status} className="rounded-lg border border-[#dfbf59]/30 p-2 text-[12px]" onChange={e=>void update(item.id,{status:e.target.value})}>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    <label className="mt-3 flex items-center gap-2 text-[12px] text-[#DCE4F4]"><input type="checkbox" checked={item.visible_to_client} disabled={working} onChange={e=>void update(item.id,{visible_to_client:e.target.checked})}/>Müşteriye göster</label>
   </div>)}{!loading&&!items.length&&<p className="text-[13px] text-[#B9C5DF]">Bu dosyada kayıtlı görev bulunmuyor.</p>}</div>
  <form onSubmit={add} className="mt-5 grid gap-3 border-t border-[#dfbf59]/15 pt-4">
    <h3 className="text-[14px] font-semibold">Yeni görev ekle</h3>
    <label className="avofis-form-label block">Görev başlığı<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} className="avofis-field"/></label>
    <label className="avofis-form-label block">Açıklama<textarea rows={2} maxLength={1200} value={details} onChange={e=>setDetails(e.target.value)} className="avofis-field"/></label>
    <label className="avofis-form-label block">Kaydedilecek tarih (varsa)<input type="date" value={due} onChange={e=>setDue(e.target.value)} className="avofis-field"/></label>
    <label className="flex items-center gap-2 text-[13px] text-[#DCE4F4]"><input type="checkbox" checked={clientVisible} onChange={e=>setClientVisible(e.target.checked)}/>Müşteriye göster</label>
    <button disabled={working} className="avofis-cta avofis-btn justify-self-start disabled:opacity-50"><Plus className="h-4 w-4"/>Görevi kaydet</button>
  </form>
 </section>;
}
