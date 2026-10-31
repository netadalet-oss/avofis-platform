"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { PageFrame } from "@/components/avofis/PageFrame";
import { StaffDocumentRequests } from "@/components/avofis/StaffDocumentRequests";
import { StaffDeliverables } from "@/components/avofis/StaffDeliverables";
import { getJourney } from "@/lib/journeys";
import { staffText } from "@/lib/staff-text";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { ArrowLeft, FilePlus2, Inbox, LockKeyhole, MessageSquareText, RefreshCw, ShieldCheck } from "lucide-react";

type Lead={id:string;full_name:string;email:string;service_key:string;country:string;summary:string;status:string;created_at:string;journey_key:string|null;intake_details:Record<string,string>|null;};
type Matter={id:string;client_user_id:string;title:string;service_key:string;price_eur_cents:number;status:string;created_at:string;};
type Conversation={id:string;case_id:string;sender_id:string;body:string;created_at:string;};
type Payment={id:string;case_id:string;status:string;amount_eur_cents:number;};
export default function ManagementPage(){
 const {user,loading:authLoading}=useUser();
 const lang=usePortalLanguage(),t=staffText[lang],dateLocale=lang==="nl"?"nl-NL":lang==="en"?"en-GB":"tr-TR";
 const [isStaff,setIsStaff]=useState<boolean|null>(null),[staffRole,setStaffRole]=useState<"admin"|"operator"|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const isAdmin=staffRole==="admin";
 const [leads,setLeads]=useState<Lead[]>([]),[cases,setCases]=useState<Matter[]>([]),[messages,setMessages]=useState<Conversation[]>([]),[payments,setPayments]=useState<Payment[]>([]);
 const [leadId,setLeadId]=useState(""),[title,setTitle]=useState(""),[price,setPrice]=useState("0.00");
 const [chosen,setChosen]=useState(""),[agreementText,setAgreementText]=useState(""),[version,setVersion]=useState("2026-10-v1"),[note,setNote]=useState("");
 const [busy,setBusy]=useState(false);
 const [fileNames,setFileNames]=useState<string[]>([]);
 const ready=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
 useEffect(()=>{
  const selectedCase=cases.find(c=>c.id===chosen);
  if(!isStaff||!selectedCase){setFileNames([]);return;}
  void supabase.storage.from("avofis-private").list(selectedCase.id+"/"+selectedCase.client_user_id,{limit:100}).then(({data,error})=>{if(!error)setFileNames((data||[]).map(f=>f.name));});
 },[chosen,isStaff,cases]);
 async function openStaffFile(name:string){
  const selectedCase=cases.find(c=>c.id===chosen);if(!selectedCase)return;
  const path=selectedCase.id+"/"+selectedCase.client_user_id+"/"+name;
  const {data,error}=await supabase.storage.from("avofis-private").createSignedUrl(path,60);
  if(error||!data?.signedUrl){setError(t.fileLinkError);return;}
  window.open(data.signedUrl,"_blank","noopener,noreferrer");
 }

 async function load(){
  setLoading(true);setError("");
  const results=await Promise.all([
    supabase.from("avofis_leads").select("id,full_name,email,service_key,country,summary,status,created_at,journey_key,intake_details").order("created_at",{ascending:false}).limit(100),
    supabase.from("avofis_cases").select("id,client_user_id,title,service_key,price_eur_cents,status,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("avofis_messages").select("id,case_id,sender_id,body,created_at").order("created_at",{ascending:false}).limit(200),
    supabase.from("avofis_payments").select("id,case_id,status,amount_eur_cents").order("created_at",{ascending:false}).limit(100)
  ]);
  if(results.some(x=>x.error))setError(t.loadError);
  else {setLeads(results[0].data as Lead[]||[]);setCases(results[1].data as Matter[]||[]);setMessages(results[2].data as Conversation[]||[]);setPayments(results[3].data as Payment[]||[]);}
  setLoading(false);
 }
 useEffect(()=>{if(!user){setIsStaff(null);setStaffRole(null);return;}void (async()=>{const {data,error}=await supabase.from("avofis_staff").select("role").eq("user_id",user.id).maybeSingle();setIsStaff(!error&&!!data);setStaffRole(data?.role==="admin"?"admin":data?.role==="operator"?"operator":null);if(data)await load();})();},[user?.id]);
 async function createMatter(e:FormEvent){
  e.preventDefault();
  if(!isAdmin||!ready)return;
  const cents=Math.round(Number(price)*100);
  if(!leadId||title.trim().length<3||!Number.isInteger(cents)||cents<0||cents>10000000){setError(t.caseFormError);return;}
  setBusy(true);setError("");
  const {data,error}=await supabase.rpc("avofis_open_case_from_lead",{p_lead:leadId,p_title:title.trim(),p_price_eur_cents:cents});
  if(error)setError(t.conversionError);else {setTitle("");setLeadId("");setChosen(String(data||""));await load();}setBusy(false);
 }
 async function createAgreement(e:FormEvent){
  e.preventDefault();if(!isAdmin||!ready||!chosen||agreementText.trim().length<50)return;
  setBusy(true);setError("");
  const {error}=await supabase.from("avofis_agreements").insert({case_id:chosen,agreement_version:version.trim(),legal_text:agreementText.trim()});
  if(error)setError(t.agreementError);else {setAgreementText("");await load();}setBusy(false);
 }
 async function sendMessage(e:FormEvent){
  e.preventDefault();if(!user||!chosen||!note.trim())return;
  setBusy(true);
  const {error}=await supabase.from("avofis_messages").insert({sender_id:user.id,case_id:chosen,body:note.trim().slice(0,1500)});
  setError(error?t.messageError:"");if(!error){setNote("");await load();}setBusy(false);
 }
 async function markLead(id:string,status:string){
   const {error}=await supabase.from("avofis_leads").update({status}).eq("id",id);
   if(error)setError(t.leadStatusError);else await load();
 }
 async function setCaseStatus(id:string,status:string){
   const {error}=await supabase.from("avofis_cases").update({status}).eq("id",id);
   if(error)setError(t.caseStatusError);else await load();
 }
 return <PageFrame wide lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro}>
 {!ready?<div className="mt-9 rounded-2xl avofis-card p-5"><LockKeyhole className="h-7 w-7"/><p className="mt-3">{t.closed}</p></div>:
 authLoading?<p className="mt-9">{t.checking}</p>:
 !user?<Link className="mt-9 inline-block rounded-xl avofis-cta avofis-btn text-white" href="/auth/login">{t.login}</Link>:
 isStaff===null?<p className="mt-9">{t.checkingRole}</p>:
 !isStaff?<p className="mt-9 rounded-2xl avofis-card p-5 text-sm">{t.noAccess}</p>:
 <div className="mt-9 space-y-4">
 {error&&<div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
 {isAdmin&&process.env.NEXT_PUBLIC_AVOFIS_IND_CLEARANCE_ENABLED==="true"&&<Link href="/yonetim/ind-inceleme" className="inline-flex min-h-11 items-center rounded-xl border border-[#dfbf59]/40 px-4 text-sm text-[#dfbf59]">IND G1–G4 iç inceleme</Link>}
 <div className="flex gap-3"><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-full border border-[#dfbf59]/25 px-4 py-2 text-sm"><RefreshCw className="h-4 w-4"/>{t.reload}</button><p className="text-xs text-[#B9C5DF]">{t.leadsCount}: {leads.length} · {t.casesCount}: {cases.length}</p></div>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Inbox className="h-5 w-5"/> {t.leads}</h2><div className="mt-5 space-y-3">{leads.map(l=><div key={l.id} className="rounded-xl border border-[#dfbf59]/25 p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{l.full_name} · {getJourney(l.journey_key||"")?.title[lang]||l.service_key}</p><p className="mt-1 text-xs text-[#dfbf59]">{l.email} · {l.country} · {new Date(l.created_at).toLocaleDateString(dateLocale)}</p><p className="mt-2 break-words text-sm">{l.summary}</p><dl className="mt-3 space-y-1 text-[13px] text-[#B9C5DF]">{Object.entries(l.intake_details||{}).map(([key,value])=>{const field=getJourney(l.journey_key||"")?.fields.find(f=>f.key===key);return <div key={key}><dt className="inline font-semibold">{field?.label[lang]||t.unknownField}: </dt><dd className="inline">{field?.options.find(o=>o.value===value)?.label[lang]||t.notSpecified}</dd></div>;})}</dl></div><select value={l.status} onChange={e=>void markLead(l.id,e.target.value)} className="h-10 rounded-lg border border-[#dfbf59]/25 px-2 text-sm"><option value="new">{t.new}</option><option value="reviewed">{t.reviewed}</option><option value="closed">{t.closedLead}</option></select></div></div>)}{!leads.length&&<p className="text-sm text-[#B9C5DF]">{t.empty}</p>}</div></section>
 {isAdmin&&<section className="rounded-[18px] avofis-card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><FilePlus2 className="h-5 w-5"/> {t.createCase}</h2><p className="mt-2 text-xs leading-6 text-[#B9C5DF]">{t.createIntro}</p><form onSubmit={createMatter} className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-[13px] font-semibold">{t.selectLead}<select value={leadId} onChange={e=>setLeadId(e.target.value)} required className="avofis-field"><option value="">{t.selectLeadPlaceholder}</option>{leads.filter(l=>l.status!=="closed").map(l=><option key={l.id} value={l.id}>{l.full_name} · {getJourney(l.journey_key||"")?.title[lang]||l.service_key}</option>)}</select></label><label className="text-[13px] font-semibold">{t.caseTitle}<input value={title} minLength={3} maxLength={160} onChange={e=>setTitle(e.target.value)} required placeholder={t.caseTitleHint} className="avofis-field"/></label><label className="text-[13px] font-semibold">{t.fee}<input type="number" min="0" max="100000" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required className="avofis-field"/></label><button disabled={busy||!leadId||title.trim().length<3} className="avofis-cta avofis-btn self-end disabled:opacity-50">{t.convert}</button></form><p className="mt-3 text-[12px] leading-6 text-[#B9C5DF]">{t.convertInfo}</p></section>}
 <section className="rounded-[18px] avofis-card p-6"><h2 className="text-lg font-semibold">{t.caseAgreements}</h2><div className="mt-4 space-y-3">{cases.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#071738] p-4"><div><p className="font-semibold">{c.title}</p><p className="mt-1 break-all text-xs text-[#B9C5DF]">{t.casesCount} {c.id} · {t.client} {c.client_user_id}</p><p className="mt-1 text-xs">{(c.price_eur_cents/100).toFixed(2)} € · {t.payment}: {payments.filter(p=>p.case_id===c.id).map(p=>({paid:t.paid,open:t.pending,pending:t.inProgress,refunded:t.refunded} as Record<string,string>)[p.status]||p.status).join(", ")||t.noRecord}</p></div><select value={c.status} onChange={e=>void setCaseStatus(c.id,e.target.value)} className="rounded-lg border border-[#dfbf59]/25 px-3 py-2 text-sm">{[["review",t.statusReview],["awaiting_agreement",t.statusAgreement],["open",t.statusOpen],["completed",t.statusCompleted],["closed",t.statusClosed]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>)}</div>{isAdmin&&<form onSubmit={createAgreement} className="mt-6 space-y-3"><h3 className="font-semibold">{t.createAgreement}</h3><select required value={chosen} onChange={e=>setChosen(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3"><option value="">{t.selectCase}</option>{cases.map(c=><option value={c.id} key={c.id}>{c.title} · {c.id.slice(0,8)}</option>)}</select><input aria-label={t.agreementVersion} value={version} onChange={e=>setVersion(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3"/><textarea required minLength={50} maxLength={25000} rows={7} placeholder={t.legalText} value={agreementText} onChange={e=>setAgreementText(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3 text-sm"/><button disabled={busy} className="rounded-xl avofis-cta avofis-btn text-sm font-semibold text-white disabled:opacity-50">{t.addAgreement}</button></form>}</section>
 <StaffDocumentRequests lang={lang} caseId={chosen}/>
 <StaffDeliverables lang={lang} caseId={chosen}/>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="text-lg font-semibold">{t.clientFiles}</h2><p className="mt-2 text-sm text-[#B9C5DF]">{t.clientFilesInfo}</p><div className="mt-4 space-y-2">{fileNames.map(name=><div key={name} className="flex items-center justify-between gap-3 rounded-xl bg-[#071738] p-3"><span className="truncate font-mono text-xs">{name}</span><button onClick={()=>void openStaffFile(name)} className="shrink-0 text-sm font-semibold text-[#dfbf59]">{t.view}</button></div>)}</div></section>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><MessageSquareText className="h-5 w-5"/> {t.messages}</h2><div className="mt-4 max-h-80 space-y-2 overflow-auto">{messages.filter(m=>!chosen||m.case_id===chosen).map(m=><div key={m.id} className="rounded-xl bg-[#071738] p-3 text-sm"><p className="text-xs text-[#B9C5DF]">{m.case_id.slice(0,8)} · {m.sender_id.slice(0,8)} · {new Date(m.created_at).toLocaleString(dateLocale)}</p><p className="mt-2 whitespace-pre-wrap break-words">{m.body}</p></div>)}</div><form onSubmit={sendMessage} className="mt-4"><p className="mb-2 text-xs text-[#B9C5DF]">{t.messageInfo}</p><textarea rows={3} maxLength={1500} value={note} onChange={e=>setNote(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3"/><button disabled={busy||!chosen||!note.trim()} className="mt-3 rounded-xl avofis-cta avofis-btn text-sm font-semibold text-white disabled:opacity-50">{t.sendMessage}</button></form></section>
 </div>}
 </PageFrame>;
}
