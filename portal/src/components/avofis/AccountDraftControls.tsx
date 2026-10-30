"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "@/lib/supabase";
import {isPreparationReadyForReview,type PreparationDraft,type DraftLocale} from "@/lib/document-preparation";
type Item={id:string;case_id:string|null;service_slug:string;locale:string;revision:number;status:string;updated_at:string};
type Matter={id:string;title:string};
type Revision={revision:number;status:string;recorded_at:string;content:PreparationDraft};
type ReviewNote={note:string;created_at:string};
const labels:Record<DraftLocale,[string,string,string,string,string,string,string,string]>={
 tr:["Belgelerim ve taslaklarım","Taslağınız hesabınızda korunur. Dosyaya bağlayıp açıkça izin verirseniz yalnız yetkili ve atanmış personel inceleyebilir. Bu işlem resmî gönderim değildir.","Dosyaya bağla (isteğe bağlı)","Yalnız bana özel","Hesabıma kaydet","Taslaklarımı getir","Taslağı aç","İncelemeye devret"],
 nl:["Mijn documentconcepten","Concepten worden in uw account bewaard. Alleen na uw toestemming kan toegewezen bevoegd personeel ze beoordelen; dit is geen officiële indiening.","Koppel aan zaak (optioneel)","Privéconcept","Opslaan","Concepten ophalen","Openen","Ter beoordeling delen"],
 de:["Meine Dokumententwürfe","Entwürfe bleiben in Ihrem Konto. Nur mit Ihrer Einwilligung kann zugewiesenes Personal sie prüfen; keine amtliche Einreichung.","Akte (optional)","Privater Entwurf","Speichern","Entwürfe laden","Öffnen","Zur Prüfung teilen"],
 en:["My document drafts","Drafts are saved to your account. Assigned, authorized staff may review only after your consent. No official filing is performed.","Linked case (optional)","Private draft","Save to account","List drafts","Open draft","Request review"],
 ar:["مستنداتي ومسوداتي","تُحفظ المسودات في حسابك. لا يطّلع الموظف المعين والمخوّل عليها إلا بموافقتك. لا يتم تقديم أي طلب رسمي.","الملف (اختياري)","مسودة خاصة","حفظ في الحساب","عرض المسودات","فتح","طلب مراجعة"],
 ru:["Мои документы и черновики","Черновики сохраняются в вашем аккаунте. Уполномоченный сотрудник может читать их только с вашего согласия; официальной подачи нет.","Дело (необязательно)","Личный черновик","Сохранить","Показать черновики","Открыть","Передать на проверку"]
};
const reviewText:Record<DraftLocale,string>={
 tr:"Taslak kilitlenecek ve yalnız atanmış, iki ayrı belge yetkisi olan personelle paylaşılacak. Onaylıyor musunuz?",
 nl:"Het concept wordt vergrendeld en alleen gedeeld met toegewezen, bevoegde medewerkers. Akkoord?",
 de:"Der Entwurf wird gesperrt und nur berechtigtem, zugewiesenem Personal gezeigt. Zustimmen?",
 en:"Lock this draft and share it only with assigned staff holding both document permissions?",
 ar:"سيتم قفل المسودة ومشاركتها فقط مع الموظف المعين والمصرح له. هل توافق؟",
 ru:"Заблокировать документ и передать только назначенным уполномоченным сотрудникам?"
};
const documentUI=process.env.NEXT_PUBLIC_AVOFIS_DOCUMENT_DRAFTS_ENABLED==="true";
export function AccountDraftControls({draft,onLoad}:{draft:PreparationDraft;onLoad:(v:PreparationDraft)=>void}){
 const w=labels[draft.locale];
 const [signed,setSigned]=useState(false);
 const [cases,setCases]=useState<Matter[]>([]);
 const [caseId,setCaseId]=useState("");
 const [items,setItems]=useState<Item[]>([]);
 const [versions,setVersions]=useState<Revision[]>([]);
 const [notes,setNotes]=useState<ReviewNote[]>([]);
 const [current,setCurrent]=useState<Item|null>(null);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  if(!documentUI)return;
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
  if(review&&!isPreparationReadyForReview(draft)){
   setNotice(({tr:"İncelemeye göndermek için ülke, işlem amacı, olay açıklaması ve istediğiniz sonucu doldurun.",
    nl:"Vul eerst het land, het doel, de feiten en het gewenste resultaat in.",
    de:"Bitte zuerst Land, Zweck, Sachverhalt und gewünschtes Ergebnis ausfüllen.",
    en:"Enter country, purpose, chronology and requested outcome before review.",
    ar:"أدخل البلد والغرض والوقائع والنتيجة المطلوبة قبل طلب المراجعة.",
    ru:"Перед проверкой заполните страну, цель, обстоятельства и желаемый результат."})[draft.locale]);
   return;
  }
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
   const detail=await api("GET",undefined,value.id);
   setVersions(detail.versions||[]);setNotes(detail.notes||[]);
   const loaded=await api("GET");setItems(loaded.items||[]);
  }catch(e){setNotice(e instanceof Error&&e.message==="409"?"REVISION_CONFLICT":"STAGING_UNAVAILABLE");}
  finally{setBusy(false);}
 }
 async function withdraw(){
  if(!current||current.status!=="review_requested"||busy||!window.confirm(
   ({tr:"Personelin bu belgeye erişimini şimdi kaldırmak istiyor musunuz? Belge ve sürümleriniz korunur.",
   nl:"Toegang voor medewerkers nu intrekken? Uw documentgeschiedenis blijft bewaard.",
   de:"Zugriff des Personals jetzt widerrufen? Die Versionen bleiben gespeichert.",
   en:"Revoke staff access now? Your document and version history are retained.",
   ar:"هل تريد إلغاء وصول الموظف الآن؟ سيبقى سجل المستند محفوظًا.",
   ru:"Отозвать доступ сотрудника? История документа сохранится."})[draft.locale]))return;
  setBusy(true);setNotice("");
  try{
   const result=await api("PATCH",{id:current.id,revision:current.revision,draft,
    status:"withdrawn",consent_to_staff:false});
   const detail=await api("GET",undefined,current.id);
   setCurrent({...current,revision:result.draft.revision,status:"withdrawn"});
   setVersions(detail.versions||[]);setNotes(detail.notes||[]);
   const loaded=await api("GET");setItems(loaded.items||[]);
   setNotice(({tr:"Personel erişimi kaldırıldı.",nl:"Toegang ingetrokken.",de:"Zugriff widerrufen.",
    en:"Staff access revoked.",ar:"تم إلغاء وصول الموظف.",ru:"Доступ сотрудника отозван."})[draft.locale]);
  }catch{setNotice("REVOCATION_FAILED");}finally{setBusy(false);}
 }
 async function open(id:string){
  setBusy(true);setNotice("");
  try{
   const loaded=await api("GET",undefined,id);
   onLoad(loaded.draft.content as PreparationDraft);
   setCurrent(loaded.draft as Item);
   setVersions(loaded.versions||[]);setNotes(loaded.notes||[]);
   setCaseId(loaded.draft.case_id||"");
   if(loaded.draft.status==="review_requested")setNotice("REVIEW_REQUESTED_LOCKED");
  }catch{setNotice("STAGING_UNAVAILABLE");}finally{setBusy(false);}
 }
 if(!documentUI)return null;
 return <section className="mt-7 rounded-xl border border-[#dfbf59]/35 bg-[#0b213d] p-5 print:hidden" lang={draft.locale} dir={draft.locale==="ar"?"rtl":"ltr"}>
  <h2 className="font-semibold">{w[0]}</h2><p className="mt-2 text-sm text-[#c1cbdf]">{w[1]}</p>
  {!signed?<p className="mt-3 text-sm"><Link href="/auth/login" className="underline">{w[4]}</Link></p>:
   <div className="mt-4 space-y-3">
    {!current&&<label className="block text-sm">{w[2]}<select className="mt-2 block w-full rounded-lg bg-[#102142] p-3" value={caseId} onChange={e=>setCaseId(e.target.value)}>
      <option value="">{w[3]}</option>{cases.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
     </select></label>}
    <div className="flex flex-wrap gap-2">
     {current&&<button type="button" className="avofis-btn avofis-outline" disabled={busy} onClick={()=>{setCurrent(null);setCaseId("");setNotice("");setVersions([]);setNotes([]);}}>{({tr:"Yeni taslak",nl:"Nieuw concept",de:"Neuer Entwurf",en:"New draft",ar:"مسودة جديدة",ru:"Новый черновик"})[draft.locale]}</button>}
     <button type="button" disabled={busy||current?.status==="review_requested"} className="avofis-btn avofis-outline disabled:opacity-50" onClick={()=>void save()}>{w[4]}</button>
     <button type="button" disabled={busy} className="avofis-btn avofis-outline" onClick={()=>void list()}>{w[5]}</button>
     {current?.status==="review_requested"&&<button type="button" disabled={busy}
       className="avofis-btn avofis-outline" onClick={()=>void withdraw()}>
       {({tr:"Personel erişimini geri çek",nl:"Toegang intrekken",de:"Zugriff widerrufen",
        en:"Revoke staff access",ar:"إلغاء وصول الموظف",ru:"Отозвать доступ"})[draft.locale]}
      </button>}
     {current?.case_id&&current.status==="draft"&&<button type="button" disabled={busy} className="avofis-btn avofis-outline" onClick={()=>void save(true)}>{w[7]}</button>}
    </div>
    {items.length>0&&<ul className="space-y-2">{items.map(d=><li key={d.id} className="flex flex-wrap justify-between gap-3 rounded-lg bg-[#102142] p-3 text-sm">
     <span>{d.service_slug} · v{d.revision} · {d.status}</span><button type="button" className="underline" disabled={busy} onClick={()=>void open(d.id)}>{w[6]}</button>
    </li>)}</ul>}
    {current&&<div className="mt-4 rounded-lg border border-[#dfbf59]/25 p-4">
      <h3 className="text-sm font-semibold">{({tr:"Sürüm geçmişi ve inceleme notları",nl:"Versies en opmerkingen",de:"Versionen und Prüfnotizen",en:"Version history and reviewer notes",ar:"سجل النسخ وملاحظات المراجعة",ru:"История версий и замечания"})[draft.locale]}</h3>
      <ol className="mt-3 space-y-1 text-xs">{versions.map(v=><li key={v.revision}>
       <details><summary className="cursor-pointer">{({tr:"Sürüm",nl:"Versie",de:"Version",en:"Revision",ar:"نسخة",ru:"Версия"})[draft.locale]} {v.revision} · {v.status} · {new Date(v.recorded_at).toLocaleString()}</summary>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded bg-[#071738] p-3" dir="auto">{JSON.stringify(v.content,null,2)}</pre>
       </details></li>)}</ol>
      <ul className="mt-3 space-y-2">{notes.map((n,i)=><li key={i} className="rounded-lg bg-[#071738] p-3 text-xs">
       <span className="text-[#c1cbdf]">{new Date(n.created_at).toLocaleString()}</span>
       <p className="mt-2 whitespace-pre-wrap break-words">{n.note}</p>
      </li>)}</ul>
     </div>}
    {notice&&<p role="status" className="text-sm text-[#dfbf59]">{notice}</p>}
   </div>}
 </section>;
}
