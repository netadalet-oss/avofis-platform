/** AVOfis FORM-01: offline preparation notes, not an official form or filing. */
import {fieldsByService,localizedFieldLabels,validateServiceAnswers,formReadyForReview,formSchemaRevision,type ServiceAnswers} from "./service-document-forms.ts";
export const serviceSlugs = [
  "hukuki-danismanlik","mahkeme-temsil","avrupa-turkiye-hukuki-uzman-koordinasyonu",
  "alacak-takibi","sozlesmeler-uyusmazliklar","konut-kira-sigorta",
  "ceza-sikayet-trafik","resmi-basvuru-itiraz","sosyal-guvenlik-vergi",
  "vize-oturum-vatandaslik","uluslararasi-insan-haklari","avrupa-ici-islemler",
  "calisma-hayati","sirket-ticaret","uluslararasi-istihdam",
  "belge-apostil-tercume","egitim-diploma",
] as const;
export type ServiceSlug = typeof serviceSlugs[number];
export type DraftLocale = "tr"|"nl"|"de"|"en"|"ar"|"ru";
export const draftLocales:DraftLocale[] = ["tr","nl","de","en","ar","ru"];
export type PreparationDraft = {
  version:1|2; service:ServiceSlug; locale:DraftLocale;
  country:string; institution:string; purpose:string; chronology:string; documentList:string;
  schemaRevision?:1; answers?:ServiceAnswers;
};
const MAX_TEXT=4000;
export const isServiceSlug=(s:unknown):s is ServiceSlug=>typeof s==="string"&&(serviceSlugs as readonly string[]).includes(s);
export const isDraftLocale=(s:unknown):s is DraftLocale=>typeof s==="string"&&draftLocales.includes(s as DraftLocale);
export function validatePreparation(value:unknown):PreparationDraft|null{
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const v=value as Record<string,unknown>;
  const base=["version","service","locale","country","institution","purpose","chronology","documentList"];
  const allowed=v.version===2?[...base,"schemaRevision","answers"]:base;
  if(Object.keys(v).length!==allowed.length||Object.keys(v).some(k=>!allowed.includes(k))||
   (v.version!==1&&v.version!==2)||!isServiceSlug(v.service)||!isDraftLocale(v.locale))return null;
  if(v.version===2&&(v.schemaRevision!==formSchemaRevision||!validateServiceAnswers(v.service,v.answers)))return null;
  for(const key of ["country","institution","purpose","chronology","documentList"] as const){
    if(typeof v[key]!=="string"||v[key].length>MAX_TEXT||/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(v[key]))return null;
  }
  return v as PreparationDraft;
}
const titles:Record<DraftLocale,{head:string;warning:string;service:string;country:string;institution:string;purpose:string;chronology:string;documents:string}>={
 tr:{head:"Belge hazırlık notları",warning:"HAZIRLIK TASLAĞI — Resmî başvuru, hukukî görüş, uzman onayı veya kuruma gönderim değildir. Kesin süre ve doğru makam yetkili uzman tarafından kontrol edilmelidir.",service:"Hizmet",country:"Ülke",institution:"Kurum / muhatap (doğrulanmadı)",purpose:"İşlemin amacı",chronology:"Olaylar ve açıklama (beyan)",documents:"Belge ve ek listesi (beyan)"},
 nl:{head:"Documentvoorbereiding",warning:"CONCEPT — Geen officiële aanvraag, juridisch advies, deskundigenfiat of indiening. Bevoegde deskundigen moeten termijnen en instanties controleren.",service:"Dienst",country:"Land",institution:"Instantie (niet geverifieerd)",purpose:"Doel",chronology:"Feiten en toelichting (eigen verklaring)",documents:"Documentenlijst (eigen verklaring)"},
 de:{head:"Notizen zur Dokumentvorbereitung",warning:"ENTWURF — Kein amtlicher Antrag, keine Rechtsberatung, fachliche Freigabe oder Einreichung. Fristen und Behörden müssen fachlich geprüft werden.",service:"Thema",country:"Land",institution:"Behörde (nicht geprüft)",purpose:"Zweck",chronology:"Sachverhalt (eigene Angaben)",documents:"Anlagen (eigene Angaben)"},
 en:{head:"Document preparation notes",warning:"DRAFT ONLY — Not an official application, legal opinion, professional approval or filing. Relevant deadlines and authorities require expert verification.",service:"Service",country:"Country",institution:"Authority (unverified)",purpose:"Purpose",chronology:"Facts and chronology (self-reported)",documents:"Attachments (self-reported)"},
 ar:{head:"ملاحظات إعداد المستند",warning:"مسودة تحضيرية فقط، وليست طلباً رسمياً أو استشارة قانونية أو إيداعاً. يجب التحقق من الجهة والمواعيد لدى مختص مؤهل.",service:"المجال",country:"البلد",institution:"الجهة (غير متحقق منها)",purpose:"الغرض",chronology:"الوقائع والتسلسل الزمني (بحسب إفادتك)",documents:"قائمة المرفقات (بحسب إفادتك)"},
 ru:{head:"Заметки для подготовки документа",warning:"ЧЕРНОВИК — Не является официальным заявлением, юридическим заключением или подачей. Сроки и компетенцию органов проверяет уполномоченный специалист.",service:"Услуга",country:"Страна",institution:"Орган (не проверен)",purpose:"Цель",chronology:"Обстоятельства (со слов заявителя)",documents:"Приложения (со слов заявителя)"}
};
export function preparationLines(draft:PreparationDraft,serviceTitle:string):string[]{
 const t=titles[draft.locale];
 const common=[t.head,"",t.warning,"",`${t.service}: ${serviceTitle}`,`${t.country}: ${draft.country}`,`${t.institution}: ${draft.institution}`,`${t.purpose}: ${draft.purpose}`,"",t.chronology,draft.chronology,"",t.documents,draft.documentList];
 if(draft.version===2&&draft.answers&&validateServiceAnswers(draft.service,draft.answers)){
  const labels=localizedFieldLabels[draft.locale];
  for(const field of fieldsByService[draft.service]){
   if(draft.answers[field])common.push("",labels[field],draft.answers[field]!);
  }
 }
 return common;
}
export const preparationText=(draft:PreparationDraft,title:string)=>preparationLines(draft,title).join("\n")+"\n";
const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
const uint16=(n:number)=>[n&255,(n>>>8)&255];
const uint32=(n:number)=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
function crc32(data:Uint8Array):number{
 let crc=0xffffffff;
 for(const x of data){crc^=x;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
}
/** Standards-compliant uncompressed ZIP, no dependency and no network. */
function zip(files:{name:string;data:string}[]):Uint8Array{
 const enc=new TextEncoder();const parts:number[]=[];const central:number[]=[];
 for(const f of files){
  const name=enc.encode(f.name),body=enc.encode(f.data),offset=parts.length,crc=crc32(body);
  parts.push(...uint32(0x04034b50),...uint16(20),...uint16(0x0800),...uint16(0),...uint16(0),...uint16(0),...uint32(crc),...uint32(body.length),...uint32(body.length),...uint16(name.length),...uint16(0),...name);
  for(const b of body)parts.push(b);
  central.push(...uint32(0x02014b50),...uint16(20),...uint16(20),...uint16(0x0800),...uint16(0),...uint16(0),...uint16(0),...uint32(crc),...uint32(body.length),...uint32(body.length),...uint16(name.length),...uint16(0),...uint16(0),...uint16(0),...uint16(0),...uint32(0),...uint32(offset),...name);
 }
 const center=parts.length;parts.push(...central,...uint32(0x06054b50),...uint16(0),...uint16(0),...uint16(files.length),...uint16(files.length),...uint32(central.length),...uint32(center),...uint16(0));
 return new Uint8Array(parts);
}
/** Minimal valid DOCX with six-language Unicode/RTL, not an approved official template. */
export function preparationDocx(draft:PreparationDraft,serviceTitle:string):Uint8Array{
 const rtl=draft.locale==="ar";
 const paragraphs=preparationLines(draft,serviceTitle).flatMap(line=>line.split(/\r?\n/)).map(line=>
  `<w:p><w:pPr>${rtl?"<w:bidi/>":""}</w:pPr><w:r><w:rPr>${rtl?"<w:rtl/>":""}</w:rPr><w:t xml:space="preserve">${esc(line)}</w:t></w:r></w:p>`).join("");
 const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`;
 return zip([
  {name:"[Content_Types].xml",data:'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'},
  {name:"_rels/.rels",data:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'},
  {name:"word/document.xml",data:doc}
 ]);
}
export function newPreparation(service:ServiceSlug,locale:DraftLocale):PreparationDraft{
 return {version:2,service,locale,country:"",institution:"",purpose:"",chronology:"",documentList:"",schemaRevision:formSchemaRevision,answers:{}};
}
/** Review is a distinct consent+assignment operation; never imply official filing. */
export function isPreparationReadyForReview(draft:PreparationDraft):boolean{
 return !!validatePreparation(draft)&&draft.version===2&&!!draft.answers&&
  !!draft.country.trim()&&!!draft.purpose.trim()&&!!draft.chronology.trim()&&
  formReadyForReview(draft.service,draft.answers);
}
