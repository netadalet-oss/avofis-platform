"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "@/lib/supabase";
import type {PreparationDraft,DraftLocale} from "@/lib/document-preparation";
type Item={id:string;case_id:string|null;service_slug:string;locale:string;revision:number;status:string;updated_at:string};
type Matter={id:string;title:string};
const labels:Record<DraftLocale,[string,string,string,string,string,string,string,string]>={
 tr:["Hesap taslakları (test ortamı)","Yalnız bağımsız staging ortamı; resmî başvuru değildir.","Dosyaya bağla (isteğe bağlı)","Yalnız bana özel","Hesabıma kaydet","Taslaklarımı getir","Taslağı aç","İncelemeye devret"],
 nl:["Concepten (testomgeving)","Uitsluitend test; geen officiële indiening.","Koppel aan zaak (optioneel)","Privéconcept","Opslaan","Concepten ophalen","Openen","Ter beoordeling delen"],
 de:["Entwürfe (Testumgebung)","Nur Test; keine amtliche Einreichung.","Akte (optional)","Privater Entwurf","Speichern","Entwürfe laden","Öffnen","Zur Prüfung teilen"],
 en:["Account drafts (staging)","Test environment only; no official submission.","Linked case (optional)","Private draft","Save to account","List drafts","Open draft","Request review"],
 ar:["مسودات الحساب (اختبار)","بيئة اختبار فقط، وليست تقديمًا رسميًا.","الملف (اختياري)","مسودة خاصة","حفظ في الحساب","عرض المسودات","فتح","طلب مراجعة"],
 ru:["Черновики (тест)","Только тестовая среда; не официальная подача.","Дело (необязательно)","Личный черновик","Сохранить","Показать черновики","Открыть","Передать на проверку"]
};
const reviewText:Record<DraftLocale,string>={
 tr:"Taslak kilitlenecek ve yalnız atanmış, iki ayrı belge yetkisi olan personelle paylaşılacak. Onaylıyor musunuz?",
 nl:"Het concept wordt vergrendeld en alleen gedeeld met toegewezen, bevoegde medewerkers. Akkoord?",
 de:"Der Entwurf wird gesperrt und nur berechtigtem, zugewiesenem Personal gezeigt. Zustimmen?",
 en:"Lock this draft and share it only with assigned staff holding both document permissions?",
 ar:"سيتم قفل المسودة ومشاركتها فقط مع الموظف المعين والمصرح له. هل توافق؟",
 ru:"Заблокировать документ и передать только назначенным уполномоченным сотрудникам?"
};
const stageUI=process.env.NEXT_PUBLIC_AVOFIS_DOCUMENT_DRAFT_STAGING_ENABLED==="true";
export function AccountDraftControls({draft,onLoad}:{draft:PreparationDraft;onLoad:(v:PreparationDraft)=>void}){
 const w=labels[draft.locale];
 const [signed,setSigned]=useState(false);
 const [cases,setCases]=useState<Matter[]>([]);
 const [caseId,setCaseId]=useState("");
 const [items,setItems]=useState<Item[]>([]);
 const [current,setCurrent]=useState<Item|null>(null);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  if(!stageUI)return;
  let live=true;
  void supabase.auth.getSession().then(async ({data})=>{
   if(!live||!data.session)return;
   setSigned(true);
   const response=await supabase.from("avofis_cases").select("id,title").limit(60);
   if(live&&!response.error)setCases((response.data||[]) as Matter[]);
  });
  return ()=>{live=false;};
 },[]);
 async function api(method:"GET"|"POST"|"PATCH",body?:unknown,id?:string){
  const {data}=await supabase.auth.getSession();
  if(!data.session)throw Error("LOGIN_REQUIRED");
  const url="/api/document-drafts"+(id?"?id="+encodeURIComponent(id):"");
  const result=await fetch(url,{method,cache:"no-store",headers:{
   Authorization:"Bearer "+data.session.access_token,...(body?{"Content-Type":"application/json"}:{})
  },body:body?JSON.stringify(body):undefined});
  if(!result.ok)throw Error(String(result.status));
  return result.json();
 }
 async function list(){
  setBusy(true);setNotice("");
  try{const result=await api("GET");setItems(result.items||[]);}
  catch{setNotice("STAGING_UNAVAILABLE");}finally{setBusy(false);}
 }
 async function save(review=false){
  if(busy||current?.status==="review_requested")return;
  if(review&&(!current?.case_id||!window.confirm(reviewText[draft.locale])))return;
  setBusy(true);setNotice("");
  try{
   const result=current?
    await api("PATCH",{id:current.id,revision:current.revision,draft,
     status:review?"review_requested":"draft",consent_to_staff:review}):
    await api("POST",{draft,case_id:caseId||null});
   const value:Item={id:result.draft.id,revision:result.draft.revision,
    status:result.draft.status,updated_at:result.draft.updated_at,
    case_id:current?.case_id??(caseId||null),service_slug:draft.service,locale:draft.locale};
   setCurrent(value);setNotice(review?"REVIEW_REQUESTED_LOCKED":"DRAFT_SAVED");
   const loaded=await api("GET");setItems(loaded.items||[]);
  }catch(e){setNotice(e instanceof Error&&e.message==="409"?"REVISION_CONFLICT":"STAGING_UNAVAILABLE");}
  finally{setBusy(false);}
 }
 async function open(id:string){
  setBusy(true);setNotice("");
  try{
   const loaded=await api("GET",undefined,id);
   onLoad(loaded.draft.content as PreparationDraft);
   setCurrent(loaded.draft as Item);
   setCaseId(loaded.draft.case_id||"");
   if(loaded.draft.status==="review_requested")setNotice("REVIEW_REQUESTED_LOCKED");
  }catch{setNotice("STAGING_UNAVAILABLE");}finally{setBusy(false);}
 }
 if(!stageUI)return null;
 return <section className="mt-7 rounded-xl border border-[#dfbf59]/35 bg-[#0b213d] p-5 print:hidden" lang={draft.locale} dir={draft.locale==="ar"?"rtl":"ltr"}>
  <h2 className="font-semibold">{w[0]}</h2><p className="mt-2 text-sm text-[#c1cbdf]">{w[1]}</p>
  {!signed?<p className="mt-3 text-sm"><Link href="/auth/login" className="underline">{w[4]}</Link></p>:
   <div className="mt-4 space-y-3">
    {!current&&<label className="block text-sm">{w[2]}<select className="mt-2 block w-full rounded-lg bg-[#102142] p-3" value={caseId} onChange={e=>setCaseId(e.target.value)}>
      <option value="">{w[3]}</option>{cases.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
     </select></label>}
    <div className="flex flex-wrap gap-2">
     <button type="button" disabled={busy||current?.status==="review_requested"} className="avofis-btn avofis-outline disabled:opacity-50" onClick={()=>void save()}>{w[4]}</button>
     <button type="button" disabled={busy} className="avofis-btn avofis-outline" onClick={()=>void list()}>{w[5]}</button>
     {current?.case_id&&current.status==="draft"&&<button type="button" disabled={busy} className="avofis-btn avofis-outline" onClick={()=>void save(true)}>{w[7]}</button>}
    </div>
    {items.length>0&&<ul className="space-y-2">{items.map(d=><li key={d.id} className="flex flex-wrap justify-between gap-3 rounded-lg bg-[#102142] p-3 text-sm">
     <span>{d.service_slug} · v{d.revision} · {d.status}</span><button type="button" className="underline" disabled={busy} onClick={()=>void open(d.id)}>{w[6]}</button>
    </li>)}</ul>}
    {notice&&<p role="status" className="text-sm text-[#dfbf59]">{notice}</p>}
   </div>}
 </section>;
}
