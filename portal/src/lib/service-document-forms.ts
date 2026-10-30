/** FORM-03 contextual intake questions for all 17 original service slugs.
 * Data are the applicant's statements, never a verified court/IND form or deadline.
 * Schema version is immutable; future field changes require a versioned migration.
 */
import {serviceSlugs,type ServiceSlug,type DraftLocale} from "./document-preparation.ts";
export const serviceFieldTypes={
 requestedAction:"textarea",incidentDate:"date",noticeDate:"date",contractDate:"date",
 expiryDate:"date",appointmentDate:"date",decisionReference:"text",caseReference:"text",
 courtOrAuthority:"text",otherParty:"text",invoiceAmount:"amount",employerName:"text",
 organizationName:"text",documentOrigin:"text",qualificationName:"text",
 benefitType:"text",contractType:"text",employmentCategory:"text"
} as const;
export type ServiceField=keyof typeof serviceFieldTypes;
export type ServiceAnswers=Partial<Record<ServiceField,string>>;
export const formSchemaRevision=1 as const;
export const fieldsByService:Record<ServiceSlug,readonly ServiceField[]>={
 "hukuki-danismanlik":["incidentDate","otherParty","decisionReference","requestedAction"],
 "mahkeme-temsil":["caseReference","noticeDate","courtOrAuthority","requestedAction"],
 "avrupa-turkiye-hukuki-uzman-koordinasyonu":["courtOrAuthority","decisionReference","documentOrigin","requestedAction"],
 "alacak-takibi":["invoiceAmount","contractDate","otherParty","requestedAction"],
 "sozlesmeler-uyusmazliklar":["contractDate","otherParty","contractType","requestedAction"],
 "konut-kira-sigorta":["contractDate","otherParty","incidentDate","requestedAction"],
 "ceza-sikayet-trafik":["incidentDate","courtOrAuthority","decisionReference","requestedAction"],
 "resmi-basvuru-itiraz":["noticeDate","decisionReference","courtOrAuthority","requestedAction"],
 "sosyal-guvenlik-vergi":["noticeDate","decisionReference","benefitType","requestedAction"],
 "vize-oturum-vatandaslik":["expiryDate","decisionReference","courtOrAuthority","requestedAction"],
 "uluslararasi-insan-haklari":["noticeDate","courtOrAuthority","decisionReference","requestedAction"],
 "avrupa-ici-islemler":["documentOrigin","decisionReference","courtOrAuthority","requestedAction"],
 "calisma-hayati":["employerName","contractDate","noticeDate","requestedAction"],
 "sirket-ticaret":["organizationName","contractType","documentOrigin","requestedAction"],
 "uluslararasi-istihdam":["employerName","employmentCategory","contractDate","requestedAction"],
 "belge-apostil-tercume":["documentOrigin","appointmentDate","courtOrAuthority","requestedAction"],
 "egitim-diploma":["qualificationName","documentOrigin","decisionReference","requestedAction"]
};
const labelTR:Record<ServiceField,string>={
 requestedAction:"Hangi sonucu veya yardımı istiyorsunuz?",incidentDate:"Olay tarihi (biliniyorsa)",
 noticeDate:"Kararın/tebligatın ulaştığı tarih (beyanınız)",contractDate:"Sözleşme tarihi (biliniyorsa)",
 expiryDate:"İzin/belgenin geçerlilik bitiş tarihi",appointmentDate:"Randevu/işlem tarihi (biliniyorsa)",
 decisionReference:"Karar veya yazışma referansı (biliniyorsa)",caseReference:"Dosya numarası (biliniyorsa)",
 courtOrAuthority:"İlgili mahkeme veya kurum (doğrulanmadı)",otherParty:"Karşı taraf veya muhatap",
 invoiceAmount:"Talep edilen tutar (EUR, tahmini)",employerName:"İşveren adı",
 organizationName:"Şirket/kurum adı",documentOrigin:"Belgenin düzenlendiği ülke ve kurum",
 qualificationName:"Diploma / yeterlilik adı",benefitType:"Vergi, ödenek veya yardım türü",
 contractType:"Sözleşme türü",employmentCategory:"İstihdam veya görev türü"
};
const labelNL:Record<ServiceField,string>={
 requestedAction:"Wat wilt u bereiken?",incidentDate:"Datum van de gebeurtenis (indien bekend)",
 noticeDate:"Datum ontvangst besluit / kennisgeving (volgens u)",contractDate:"Datum overeenkomst (indien bekend)",
 expiryDate:"Vervaldatum vergunning of document",appointmentDate:"Datum afspraak of handeling",
 decisionReference:"Kenmerk van besluit of correspondentie",caseReference:"Zaaknummer (indien bekend)",
 courtOrAuthority:"Betrokken rechtbank of instantie (niet geverifieerd)",otherParty:"Wederpartij of contactpersoon",
 invoiceAmount:"Gevorderd bedrag (EUR, schatting)",employerName:"Naam werkgever",
 organizationName:"Bedrijfs- of organisatienaam",documentOrigin:"Land en instantie van afgifte",
 qualificationName:"Naam diploma of kwalificatie",benefitType:"Type belasting of uitkering",
 contractType:"Type overeenkomst",employmentCategory:"Soort dienstverband of functie"
};
const labelDE:Record<ServiceField,string>={
 requestedAction:"Welches Ergebnis möchten Sie erreichen?",incidentDate:"Datum des Ereignisses (falls bekannt)",
 noticeDate:"Zugang des Bescheids / Schreibens (Ihre Angabe)",contractDate:"Vertragsdatum (falls bekannt)",
 expiryDate:"Ablaufdatum des Dokuments",appointmentDate:"Termin / Bearbeitungsdatum",
 decisionReference:"Bescheid- oder Aktenzeichen (falls bekannt)",caseReference:"Aktenzeichen (falls bekannt)",
 courtOrAuthority:"Gericht oder Behörde (nicht geprüft)",otherParty:"Gegenpartei oder Ansprechpartner",
 invoiceAmount:"Geforderter Betrag (EUR, geschätzt)",employerName:"Arbeitgeber",
 organizationName:"Unternehmen oder Organisation",documentOrigin:"Ausstellungsland und Behörde",
 qualificationName:"Abschluss oder Qualifikation",benefitType:"Steuer- oder Leistungsart",
 contractType:"Vertragsart",employmentCategory:"Beschäftigungsart oder Rolle"
};
const labelEN:Record<ServiceField,string>={
 requestedAction:"What outcome or assistance do you want?",incidentDate:"Date of incident (if known)",
 noticeDate:"Date you received the decision or notice (self-reported)",
 contractDate:"Contract date (if known)",expiryDate:"Permit/document expiry date",
 appointmentDate:"Appointment or procedure date",decisionReference:"Decision or correspondence reference",
 caseReference:"Case reference (if known)",courtOrAuthority:"Relevant court or authority (unverified)",
 otherParty:"Other party or addressee",invoiceAmount:"Amount claimed (EUR, estimated)",
 employerName:"Employer name",organizationName:"Company or organization",
 documentOrigin:"Issuing country and authority",qualificationName:"Diploma / qualification",
 benefitType:"Type of tax or benefit",contractType:"Type of contract",
 employmentCategory:"Employment or role category"
};
const labelAR:Record<ServiceField,string>={
 requestedAction:"ما النتيجة أو المساعدة التي تريدها؟",incidentDate:"تاريخ الواقعة (إن عُرف)",
 noticeDate:"تاريخ استلام القرار أو الإشعار (بحسب إفادتك)",contractDate:"تاريخ العقد (إن عُرف)",
 expiryDate:"تاريخ انتهاء الوثيقة أو التصريح",appointmentDate:"تاريخ الموعد أو الإجراء",
 decisionReference:"مرجع القرار أو المراسلة",caseReference:"رقم الملف (إن عُرف)",
 courtOrAuthority:"المحكمة أو الجهة المعنية (غير مؤكدة)",otherParty:"الطرف الآخر أو المرسل إليه",
 invoiceAmount:"المبلغ المطالب به (يورو، تقديري)",employerName:"اسم جهة العمل",
 organizationName:"اسم الشركة أو المنظمة",documentOrigin:"بلد وجهة إصدار الوثيقة",
 qualificationName:"اسم الشهادة أو المؤهل",benefitType:"نوع الضريبة أو الإعانة",
 contractType:"نوع العقد",employmentCategory:"نوع العمل أو الوظيفة"
};
const labelRU:Record<ServiceField,string>={
 requestedAction:"Какого результата или помощи вы хотите?",incidentDate:"Дата события (если известна)",
 noticeDate:"Дата получения решения или уведомления (с ваших слов)",contractDate:"Дата договора (если известна)",
 expiryDate:"Срок действия документа или разрешения",appointmentDate:"Дата встречи или процедуры",
 decisionReference:"Номер решения или переписки",caseReference:"Номер дела (если известен)",
 courtOrAuthority:"Суд или ведомство (не проверено)",otherParty:"Другая сторона или адресат",
 invoiceAmount:"Сумма требования (EUR, оценка)",employerName:"Наименование работодателя",
 organizationName:"Компания или организация",documentOrigin:"Страна и орган выдачи документа",
 qualificationName:"Диплом или квалификация",benefitType:"Вид налога или пособия",
 contractType:"Вид договора",employmentCategory:"Тип занятости или должности"
};
export const localizedFieldLabels:Record<DraftLocale,Record<ServiceField,string>>={
 tr:labelTR,nl:labelNL,de:labelDE,en:labelEN,ar:labelAR,ru:labelRU
};
export const isCalendarDate=(s:string):boolean=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const [y,m,d]=s.split("-").map(Number);
 if(y<1800||y>2200||m<1||m>12||d<1||d>31)return false;
 const dt=new Date(Date.UTC(y,m-1,d));
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
};
export function validateServiceAnswers(service:ServiceSlug,answers:unknown):answers is ServiceAnswers{
 if(!answers||typeof answers!=="object"||Array.isArray(answers))return false;
 const v=answers as Record<string,unknown>,allowed=fieldsByService[service];
 if(Object.keys(v).some(k=>!allowed.includes(k as ServiceField)))return false;
 return Object.entries(v).every(([key,value])=>{
  if(typeof value!=="string"||value.length>1200||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))return false;
  if(!value)return true; // optional partial save
  const kind=serviceFieldTypes[key as ServiceField];
  if(kind==="date")return isCalendarDate(value);
  if(kind==="amount")return /^\d{1,10}(?:[.,]\d{1,2})?$/.test(value);
  return true;
 });
}
export function formReadyForReview(service:ServiceSlug,answers:ServiceAnswers):boolean{
 return validateServiceAnswers(service,answers)&&
  typeof answers.requestedAction==="string"&&answers.requestedAction.trim().length>=3;
}
export function blankServiceAnswers():ServiceAnswers{return {};}
export function serviceSchemaCoverage(){
 return {count:serviceSlugs.length,complete:serviceSlugs.every(s=>
  fieldsByService[s].includes("requestedAction")&&new Set(fieldsByService[s]).size===4)};
}
