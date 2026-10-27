"use client";
import { useEffect,useState } from "react";
import { CheckCircle2,Clock3,ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Task={id:string;case_id:string;title:string;details:string;due_at:string|null;status:string;updated_at:string};
const labels:Record<string,string>={pending:"Bekleniyor",in_progress:"İşlemde",completed:"Tamamlandı",cancelled:"İptal edildi"};
export function ClientCaseTasks({caseId}:{caseId:string}){
 const [tasks,setTasks]=useState<Task[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  (async()=>{
   setLoading(true);setError("");
   const {data,error}=await supabase.from("avofis_case_tasks").select("id,case_id,title,details,due_at,status,updated_at").eq("case_id",caseId).order("created_at",{ascending:false});
   if(!active)return;
   if(error)setError("Dosyanızın işlem aşamaları şu anda alınamadı.");
   else setTasks(data as Task[]||[]);
   setLoading(false);
  })();
  return ()=>{active=false;};
 },[caseId]);
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
  <div className="flex items-center gap-3"><span className="avofis-icon-tile"><ClipboardList className="h-5 w-5"/></span><h2 className="text-[17px] font-semibold text-[#F2F5FF]">İşlem takibi ve sonraki adımlar</h2></div>
  {loading?<p className="mt-4 text-[13px] text-[#B9C5DF]">İşlem adımları yükleniyor…</p>:error?<p role="status" className="mt-4 text-[13px] text-[#f0d56d]">{error}</p>:!tasks.length?<p className="mt-4 text-[13px] leading-7 text-[#B9C5DF]">Bu dosya için henüz bildirilmiş bir işlem adımı bulunmuyor.</p>:<ul className="mt-4 grid gap-2">
   {tasks.map(task=><li key={task.id} className="flex items-start gap-3 rounded-xl border border-[#dfbf59]/10 bg-[#071738]/75 p-3">
     {task.status==="completed"?<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#dfbf59]"/>:<Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#dfbf59]"/>}
     <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-[#F2F5FF]">{task.title}</p>{task.details&&<p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-[1.7] text-[#B9C5DF]">{task.details}</p>}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#dfbf59]"><span>{labels[task.status]||task.status}</span>{task.due_at&&<span>Bildirilmiş tarih: {new Date(task.due_at).toLocaleDateString("tr-TR")}</span>}</div>
     </div>
    </li>)}
  </ul>}
  <p className="mt-4 text-[12px] leading-[1.75] text-[#AEBBD5]">Gösterilen tarihler dosyaya kaydedilmiş bilgilerdir; hukukî süre hesabının yerine geçmez.</p>
 </section>;
}
