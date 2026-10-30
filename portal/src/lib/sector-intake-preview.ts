/**
 * AVOfis L4 R-361..R-374: 14 standalone, non-submitting local form blueprints.
 * These are source-specific preparation drafts, NOT real intake or legal decisions.
 * All answers stay in component memory; nothing is sent to a server or Storage.
 * Mandatory identity, employer/creditor names and sensitive allegations are
 * deliberately held until authorised authenticated workflow and legal review.
 */
export type PreviewField={
 key:string; label:string; kind:"choice"|"date"|"approx_money"|"count";
 options?:readonly string[]; required:false; unknownAllowed:true;
};
export type SectorPreview={
 sourceId:string;title:string;section:"employment"|"housing"|"consumer";
 originalRequirement:string;fields:readonly PreviewField[];
 highRisk:boolean;sensitiveHold:boolean;
 requiresAuthenticatedDetails:boolean;
};
const choice=(key:string,label:string,options:readonly string[]):PreviewField=>({
 key,label,kind:"choice",options,required:false,unknownAllowed:true
});
const date=(key:string,label:string):PreviewField=>({key,label,kind:"date",required:false,unknownAllowed:true});
const money=(key:string,label:string):PreviewField=>({key,label,kind:"approx_money",required:false,unknownAllowed:true});
const count=(key:string,label:string):PreviewField=>({key,label,kind:"count",required:false,unknownAllowed:true});
const yesNo=["yes","no","unknown"] as const;
const status=["yes","no","unknown"] as const;
const kind=["original","fixed_term","temporary","on_call","other","unknown"] as const;
const notification=["yes","no","unknown"] as const;
const section=(sourceId:string,title:string,group:SectorPreview["section"],
 originalRequirement:string,fields:PreviewField[],highRisk=false,sensitiveHold=false):SectorPreview=>({
 sourceId,title,section:group,originalRequirement,fields,highRisk,sensitiveHold,
 requiresAuthenticatedDetails:true
});
export const sectorPreviews:readonly SectorPreview[]=[
 section("R-361","İşten çıkarma","employment",
  "İşten çıkarma formunda iş sözleşmesi türü, işe giriş, bildirim ve karar tarihlerini sor.",[
  choice("contractType","İş sözleşmesinin türü",kind),
  date("employmentStartDate","İşe giriş tarihi (beyan)"),
  date("noticeDate","Bildirim tarihi (beyan)"),
  date("decisionDate","Karar tarihi (beyan)")],true),
 section("R-362","VSO anlaşması","employment",
  "VSO formunda sözleşmenin imzalanıp imzalanmadığını ve varsa son yanıt tarihini kaydet.",[
  choice("vsoSigned","Anlaşma imzalandı mı?",yesNo),
  date("responseDate","Beyan edilen son yanıt tarihi")],true),
 section("R-363","Ödenmeyen ücret","employment",
  "Ödenmeyen ücret formunda dönem, yaklaşık tutar, bordro ve yazışma durumunu sor.",[
  choice("period","Ücretin ait olduğu dönem",["current_month","last_month","older","multiple","unknown"]),
  money("approxUnpaidEur","Yaklaşık ödenmemiş tutar (EUR)"),
  choice("payslip","Bordro mevcut mu?",yesNo),
  choice("correspondence","Yazışma mevcut mu?",yesNo)]),
 section("R-364","İşveren için belge hazırlığı","employment",
  "İşveren formunda çalışan sayısı, talep edilen belge ve karşı taraf rolü alanlarını ekle.",[
  count("employeeCount","Çalışan sayısı (yaklaşık)"),
  choice("documentType","Talep edilen belge kategorisi",["contract","payslip","warning","policy","other","unknown"]),
  choice("otherPartyRole","Karşı tarafın rolü",["employee","representative","authority","other","unknown"])]),
 section("R-365","Ayrımcılık şikâyeti — hassas veri kapalı","employment",
  "Ayrımcılık şikâyeti formunda hassas bilgi paylaşımını gönüllü ve korumalı tut.",[
  choice("sensitiveDisclosure","Hassas bilgi paylaşmayı tercih ediyor musunuz?",["no","request_private_channel","unknown"])
 ],true,true),
 section("R-366","Kira uyuşmazlığı","housing",
  "Kira formunda kiracı/ev sahibi rolünü ve konut/ticari taşınmaz türünü belirle.",[
  choice("housingRole","Kiralama rolünüz",["tenant","landlord","representative","unknown"]),
  choice("propertyType","Taşınmaz türü",["residential","commercial","other","unknown"])]),
 section("R-367","Depozito iadesi","housing",
  "Depozito iadesi formunda kira bitişi, tutar ve ev sahibiyle son yazışma tarihini sor.",[
  date("rentalEndDate","Kira bitiş tarihi (beyan)"),
  money("depositEur","Depozito yaklaşık tutarı (EUR)"),
  date("lastCorrespondenceDate","Son yazışma tarihi (beyan)")]),
 section("R-368","Konut bakım","housing",
  "Konut bakım formunda sorunun türü, bildirim tarihi ve mevcut fotoğraf durumunu kaydet.",[
  choice("maintenanceKind","Bakım sorununun türü",["heating","water","safety","structure","other","unknown"]),
  date("reportedDate","Bildirim tarihi (beyan)"),
  choice("photosAvailable","Fotoğraf mevcut mu? (yüklenmez)",yesNo)]),
 section("R-369","Tahliye riski","housing",
  "Tahliye riski formunda resmî belge ve son tarih alanını öne al.",[
  choice("officialNotice","Resmî belge var mı?",notification),
  date("reportedDeadline","Kullanıcının bildirdiği tarih (hukukî son tarih değil)")],true),
 section("R-370","Kira artışı","housing",
  "Kira artışı formunda yazılı bildirim, yeni tutar ve yürürlük tarihi sor.",[
  choice("writtenNotice","Yazılı bildirim var mı?",yesNo),
  money("newRentEur","Yeni kira tutarı (EUR)"),
  date("effectiveDate","Bildirilen yürürlük tarihi")]),
 section("R-371","Tüketici satın alımı","consumer",
  "Tüketici formunda ürün/hizmet, satın alma kanalı ve teslim tarihini sor.",[
  choice("purchaseType","Ürün veya hizmet",["goods","service","digital","other","unknown"]),
  choice("purchaseChannel","Satın alma kanalı",["online","physical","phone","other","unknown"]),
  date("deliveryDate","Teslim tarihi (beyan)")]),
 section("R-372","Ayıplı ürün","consumer",
  "Ayıplı ürün formunda satıcıya bildirim yapılıp yapılmadığını ve cevabı kaydet.",[
  choice("sellerNotified","Satıcıya bildirim yapıldı mı?",yesNo),
  choice("sellerResponse","Satıcı yanıtı",["accepted","rejected","pending","no_response","unknown"])]),
 section("R-373","Abonelik feshi","consumer",
  "Abonelik feshi formunda sözleşme başlangıcı, fesih talebi ve ücret ihtilafı alanlarını aç.",[
  date("subscriptionStartDate","Sözleşme başlangıcı (beyan)"),
  choice("cancelRequested","Fesih talebi yapıldı mı?",yesNo),
  choice("feeDisputed","Ücret ihtilafı var mı?",yesNo)]),
 section("R-374","Borç itirazı — alacaklı kimliği kapalı","consumer",
  "Borç itiraz formunda alacaklı, tahsilat aşaması ve tebliğ tarihi alanlarını ekle.",[
  choice("creditorCategory","Alacaklı türü; kişi/şirket adı burada alınmaz",["person","company","authority","other","unknown"]),
  choice("collectionStage","Tahsilat aşaması",["notification","collection_agent","court","enforcement","unknown"]),
  date("serviceDate","Bildirdiğiniz tebliğ tarihi")],true)
];
export type PreviewAnswers=Record<string,string>;
export type PreviewResult={
 sourceId:string;status:"LOCAL_DRAFT_ONLY";fields:{key:string;label:string;answer:string;isUnknown:boolean}[];
 attention:"PRIORITY_HUMAN_REVIEW"|"HUMAN_REVIEW";
 requiresAuthenticatedDetails:true;
 sensitiveDataNotCollected:true;fileUploadAllowed:false;
 mayCalculateDeadline:false;maySubmit:false;mayCollectIdentity:false;
};
const iso=/^(\d{4})-(\d{2})-(\d{2})$/;
export function validDate(text:string){
 const match=iso.exec(text);
 if(!match)return false;
 const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);
 if(y<1900||y>2100||m<1||m>12||d<1||d>31)return false;
 const dt=new Date(Date.UTC(y,m-1,d));
 return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
}
export function validateLocalSectorAnswers(template:SectorPreview,answers:PreviewAnswers):boolean{
 if(!answers||typeof answers!=="object"||Array.isArray(answers))return false;
 const fields=new Map(template.fields.map(x=>[x.key,x]));
 for(const [key,value] of Object.entries(answers)){
  const f=fields.get(key);
  if(!f||typeof value!=="string"||value.length>40)return false;
  if(value===""||value==="unknown")continue;
  if(f.kind==="choice"&&!f.options?.includes(value))return false;
  if(f.kind==="date"&&!validDate(value))return false;
  if(f.kind==="count"&&!/^(0|[1-9]\d{0,5})$/.test(value))return false;
  if(f.kind==="approx_money"&&!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(value))return false;
 }
 return true;
}
export function evaluateLocalSectorPreview(template:SectorPreview,answers:PreviewAnswers):PreviewResult{
 if(!sectorPreviews.includes(template)||!validateLocalSectorAnswers(template,answers))
  throw new Error("INVALID_LOCAL_PREVIEW_INPUT");
 return{
  sourceId:template.sourceId,status:"LOCAL_DRAFT_ONLY",
  fields:template.fields.map(f=>({key:f.key,label:f.label,answer:answers[f.key]||"unknown",
    isUnknown:!answers[f.key]||answers[f.key]==="unknown"})),
  attention:template.highRisk||
    (template.sourceId==="R-374"&&answers.collectionStage==="enforcement")?
      "PRIORITY_HUMAN_REVIEW":"HUMAN_REVIEW",
  requiresAuthenticatedDetails:true,sensitiveDataNotCollected:true,
  fileUploadAllowed:false,mayCalculateDeadline:false,maySubmit:false,mayCollectIdentity:false
 };
}
