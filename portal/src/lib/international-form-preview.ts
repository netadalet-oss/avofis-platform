import type {PreviewField,SectorPreview} from "./sector-intake-preview";
type Section=SectorPreview["section"];
const c=(key:string,label:string,options:readonly string[]):PreviewField=>({
 key,label,kind:"choice",options,required:false,unknownAllowed:true
});
const d=(key:string,label:string):PreviewField=>({
 key,label,kind:"date",required:false,unknownAllowed:true
});
const n=(key:string,label:string):PreviewField=>({
 key,label,kind:"short_note",required:false,unknownAllowed:true
});
const yesNo=["yes","no","unknown"] as const;
const countries=["nl","tr","de","other","unknown"] as const;
const forms=(id:string,title:string,section:Section,originalRequirement:string,
 fields:PreviewField[],highRisk=false,sensitiveHold=false):SectorPreview=>({
 sourceId:id,title,section,originalRequirement,fields,highRisk,sensitiveHold,
 requiresAuthenticatedDetails:true
});
/** R-379..395: only non-submitting local preparation.
 * IND IDs, child identities, medical data, family allegations, company names,
 * institution names and any real filing are deliberately NOT collected.
 */
export const internationalPreviews:readonly SectorPreview[]=[
 forms("R-379","Göç ve IND başvurusu","migration",
  "Göç formunda başvuru türü, IND referans bilgisi varsa ve kararın tarihini sor.",[
  c("applicationType","Başvuru türü",["residence","asylum","family","other","unknown"]),
  c("indReferenceAvailable","IND referansı var mı? Numara burada alınmaz.",yesNo),
  d("decisionDate","Beyan edilen karar tarihi")],true,true),
 forms("R-380","Oturum süresi","migration",
  "Oturum formunda son geçerlilik tarihi sorusunu güvenlik ve gizlilik ilkeleriyle işle.",[
  d("permitExpiryDate","Beyan edilen son geçerlilik tarihi")],true,true),
 forms("R-381","Vize ret kararı","migration",
  "Vize ret formunda ret makamı, karar tarihi ve başvuranın bulunduğu ülkeyi kaydet.",[
  c("refusalAuthorityType","Ret makamı kategorisi",["consulate","embassy","immigration_authority","other","unknown"]),
  d("decisionDate","Ret kararının tarihi"),
  c("applicantCountry","Başvuranın bulunduğu ülke",countries)],true),
 forms("R-382","Aile birleşimi","migration",
  "Aile birleşimi formunda sponsor ve başvuran rollerini açık biçimde ayır.",[
  c("userRole","Rolünüz",["sponsor","applicant","representative","unknown"]),
  c("otherRole","Diğer tarafın rolü",["sponsor","applicant","unknown"])],true,true),
 forms("R-383","Vatandaşlık yönlendirmesi","migration",
  "Vatandaşlık sorusunda önce danışmanlığın genel bilgi mi karar incelemesi mi olduğunu belirle.",[
  c("requestKind","Talep türü",["general_information","decision_review","unknown"])],true),
 forms("R-384","Uluslararası aile hukuku","family",
  "Aile hukuku formunda evlilik ülkesi, ikamet ülkesi ve işlem ülkesini ayrı sor.",[
  c("marriageCountry","Evlilik ülkesi",countries),
  c("residenceCountry","İkamet ülkesi",countries),
  c("procedureCountry","İşlem ülkesi",countries)],true,true),
 forms("R-385","Boşanma","family",
  "Boşanma formunda mevcut dava/karar ve iki tarafın yaşadığı ülkeleri kaydet.",[
  c("caseExists","Mevcut dava veya karar var mı?",yesNo),
  c("firstCountry","İlk tarafın ülkesi",countries),
  c("secondCountry","Diğer tarafın ülkesi",countries)],true,true),
 forms("R-386","Çocukla ilgili genel hazırlık","family",
  "Çocukla ilgili formda ayrıntılı çocuk kişisel verilerini ilk aşamada toplama.",[
  c("requestKind","Genel konu",["custody","contact","care","other","unknown"])],true,true),
 forms("R-387","Miras","family",
  "Miras formunda ölüm tarihi, ilgili ülkeler ve belge türlerini asgarî düzeyde sor.",[
  d("reportedDeathDate","Beyan edilen tarih; kişi kimliği alınmaz"),
  c("originCountry","İlgili ülke",countries),
  c("otherCountry","Diğer ilgili ülke",countries),
  c("documentType","Belge türü",["civil_status","will","court_decision","other","unknown"])],true,true),
 forms("R-388","İdarî itiraz","administration",
  "İdarî itiraz formunda kurum adı, karar türü, gönderim ve öğrenme tarihini ayrıştır.",[
  c("institutionCategory","Kurum türü; adı bu ekranda alınmaz",["municipality","tax","immigration","benefits","other","unknown"]),
  c("decisionType","Karar türü",["refusal","fine","recovery","other","unknown"]),
  d("dispatchDate","Gönderim tarihi"),
  d("knowledgeDate","Öğrenme tarihi")],true),
 forms("R-389","Sosyal haklar","administration",
  "Sosyal hak formunda kullanıcıdan sadece talebin değerlendirilebilmesi için gerekli bilgiyi iste.",[
  c("benefitType","Sosyal hak türü",["housing","income","family","other","unknown"])],true,true),
 forms("R-390","Türkiye–Hollanda belge kullanımı","cross_border",
  "Türkiye–Hollanda formunda belgenin düzenlendiği ülke ve kullanılacağı ülkeyi ayrı seçtir.",[
  c("issuedCountry","Belgenin düzenlendiği ülke",countries),
  c("useCountry","Kullanılacağı ülke",countries)]),
 forms("R-391","Tanınma ve tenfiz","cross_border",
  "Tanınma/tenfiz başvurusunda karar türünü ve kesinleşme bilgisinin mevcut olup olmadığını sor.",[
  c("decisionType","Karar türü",["family","commercial","civil","other","unknown"]),
  c("finalityAvailable","Kesinleşme bilgisi var mı?",yesNo)],true),
 forms("R-392","Apostil ve tercüme","cross_border",
  "Apostil ve tercüme formunda belge tipi, dil ve başvurulacak makamı kaydet.",[
  c("documentType","Belge türü",["civil","education","business","court","other","unknown"]),
  c("documentLanguage","Belge dili",["tr","nl","en","de","ar","ru","other","unknown"]),
  c("authorityType","Başvurulacak makam türü",["municipality","notary","court","consulate","other","unknown"])]),
 forms("R-393","Sınır aşan ticaret","cross_border",
  "Sınır aşan ticaret formunda şirket ülkeleri, sözleşme dili ve uyuşmazlık türünü sor.",[
  c("firstCompanyCountry","Birinci şirketin ülkesi",countries),
  c("secondCompanyCountry","İkinci şirketin ülkesi",countries),
  c("contractLanguage","Sözleşme dili",["tr","nl","en","de","other","unknown"]),
  c("disputeType","Uyuşmazlık türü",["payment","delivery","performance","other","unknown"])],true),
 forms("R-394","Paralel uluslararası aile işlemleri","family",
  "Uluslararası aile formuna farklı ülkelerde süren paralel işlemler için seçenek ekle.",[
  c("parallelProceedings","Paralel işlem var mı?",yesNo),
  c("firstCountry","Birinci işlem ülkesi",countries),
  c("secondCountry","Diğer işlem ülkesi",countries)],true,true),
 forms("R-395","Yazılı açıklama tercihi","cross_border",
  "Kullanıcının dileğini serbest metin ve isteğe bağlı ses yerine öncelikle yazıyla al.",[
  n("briefWrittenIntent","En fazla 160 karakterlik isteğe bağlı yazılı genel niyet")],false,true)
];
