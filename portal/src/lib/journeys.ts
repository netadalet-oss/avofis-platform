import type { Language } from "./avofis-content";

export type Localized = Record<Language,string>;
export type JourneyService = "documents"|"translation"|"administration"|"diplomas"|"business"|"expert";
export type Choice = {value:string; label:Localized};
export type JourneyField = {key:string;label:Localized;options:Choice[]};
export type Journey = {
 id:string;service:JourneyService;title:Localized;audience:Localized;
 need:Localized;preparation:Localized;responsibility:Localized;next:Localized;
 fields:JourneyField[];
};
const l=(tr:string,nl:string,en:string):Localized=>({tr,nl,en});
const opt=(value:string,tr:string,nl:string,en:string):Choice=>({value,label:l(tr,nl,en)});
const origins=[
 opt("netherlands","Hollanda","Nederland","Netherlands"),
 opt("turkiye","Türkiye","Turkije","Türkiye"),
 opt("other","Başka bir ülke","Ander land","Another country"),
];
const languages=[
 opt("tr","Türkçe","Turks","Turkish"),opt("nl","Hollandaca","Nederlands","Dutch"),
 opt("en","İngilizce","Engels","English"),opt("other","Başka bir dil","Andere taal","Another language")
];
const documentTypes=[
 opt("civil","Nüfus / medeni hâl belgesi","Burgerlijke stand","Civil-status record"),
 opt("education","Diploma / eğitim belgesi","Diploma / onderwijsdocument","Diploma / education record"),
 opt("business","Şirket / ticaret belgesi","Bedrijfsdocument","Company / trade document"),
 opt("other","Diğer resmî belge","Ander officieel document","Other official record")
];
export const journeys:Journey[]=[
 {id:"tr-to-nl",service:"documents",title:l("Türkiye belgesini Hollanda'da kullanmak","Een Turks document in Nederland gebruiken","Use a Turkish document in the Netherlands"),
 audience:l("Türkiye'den belge getiren veya Hollanda'daki bir kuruma belge sunan kişiler.","Voor wie een document uit Turkije aan een Nederlandse organisatie moet overleggen.","For people presenting Turkish documents to a Dutch organisation."),
 need:l("Belgenin türüne ve kabul eden kuruma göre apostil, tercüme veya tasdik gerekebilir; hepsi her zaman zorunlu değildir.","Afhankelijk van document en ontvangende instantie kunnen apostille, vertaling of legalisatie nodig zijn.","An apostille, translation or legalisation may be required depending on the receiving authority."),
 preparation:l("Belgeyi düzenleyen kurum, belgenin güncelliği, kabul edecek Hollanda kurumu ve teslim biçimi kontrol edilir.","Controle van afgevende instantie, actualiteit, ontvangende organisatie en wijze van overleggen.","Confirm issuing authority, document validity, Dutch recipient and submission method."),
 responsibility:l("Resmî belge ve apostili yetkili kurum düzenler; yeminli tercümeyi yetkili tercüman yapar. AVOfis koordinasyon sağlayabilir.","Bevoegde instanties verzorgen documenten en apostilles; een bevoegde vertaler verzorgt zo nodig de vertaling.","Competent authorities issue documents and apostilles; authorised translators perform sworn translations where needed."),
 next:l("Belgenin türünü ve Hollanda'da kullanım amacını seçin.","Kies het documenttype en het gebruiksdoel in Nederland.","Select the document type and intended use in the Netherlands."),
 fields:[
  {key:"documentType",label:l("Hangi belge?","Welk document?","Which document?"),options:documentTypes},
  {key:"use",label:l("Hollanda'da hangi amaçla?","Waarvoor in Nederland?","Purpose in the Netherlands?"),options:[opt("municipality","Belediye / kayıt","Gemeente / registratie","Municipality / registration"),opt("education","Eğitim / diploma","Onderwijs / diploma","Education / diploma"),opt("employment","İş / işveren","Werk / werkgever","Employment"),opt("other","Diğer işlem","Anders","Other")]}
 ]},
 {id:"nl-to-tr",service:"documents",title:l("Hollanda belgesini Türkiye'de kullanmak","Een Nederlands document in Turkije gebruiken","Use a Dutch document in Türkiye"),
 audience:l("Hollanda'dan alınan belgeyi Türkiye'deki makama sunmak isteyen kişiler.","Voor wie Nederlandse documenten aan een Turkse instantie moet overleggen.","For people presenting Dutch documents to a Turkish authority."),
 need:l("Belgeyi düzenleyen Hollanda kurumu, Türkiye'deki kabul mercii ve istenen tasdik/tercüme biçimi belirlenir.","De afgevende Nederlandse instantie en de eisen van de ontvangende Turkse instantie bepalen de stappen.","Requirements depend on the Dutch issuer and the Turkish receiving authority."),
 preparation:l("Belge aslı veya uygun nüsha, apostil ihtimali ve tercüme sırası teyit edilir.","Origineel of toegestaan afschrift, apostillevereisten en volgorde van vertaling worden nagegaan.","Check accepted original/copy, possible apostille and order of translation."),
 responsibility:l("Belgeyi ve apostili yetkili Hollanda kurumları verir; Türkiye'deki kabul koşullarını ilgili makam belirler.","Bevoegde Nederlandse instanties verzorgen documenten en apostilles; de Turkse ontvanger bepaalt acceptatievoorwaarden.","Dutch authorities issue records and apostilles; the Turkish authority determines admissibility."),
 next:l("Belgenin türünü ve Türkiye'de kullanım alanını belirtin.","Geef het documenttype en het gebruiksdoel in Turkije op.","Indicate the document type and purpose in Türkiye."),
 fields:[
  {key:"documentType",label:l("Hangi belge?","Welk document?","Which document?"),options:documentTypes},
  {key:"use",label:l("Türkiye'de hangi amaçla?","Waarvoor in Turkije?","Purpose in Türkiye?"),options:[opt("civil","Nüfus / aile işlemi","Burgerlijke stand / familie","Civil / family records"),opt("education","Eğitim / diploma","Onderwijs / diploma","Education / diploma"),opt("business","Şirket / ticaret","Bedrijf / handel","Business / trade"),opt("other","Diğer","Anders","Other")]}
 ]},
 {id:"apostille",service:"documents",title:l("Apostil veya resmî tasdik ihtiyacını belirlemek","Apostille of legalisatie bepalen","Determine apostille or legalisation requirements"),
 audience:l("Belgesinin başka ülkede kabul edilmesi için hangi tasdikin gerektiğinden emin olmayanlar.","Voor wie niet weet welke authenticatie voor een document nodig is.","For people unsure which authentication their document requires."),
 need:l("Belgenin kaynağı, kullanılacağı ülke ve kabul eden kurum esas alınır. Apostil her belge için uygun değildir.","Het land van afgifte, bestemmingsland en ontvangende instantie bepalen de voorwaarden.","Requirements depend on issuing country, destination and recipient; apostilles are not universally applicable."),
 preparation:l("Belge türü, düzenleyen makam, kullanılacağı ülke ve gerekirse çeviri/tasdik sırası incelenir.","Documenttype, afgevende instantie, bestemming en eventuele volgorde van vertaling of legalisatie worden beoordeeld.","Check document type, issuer, destination and any translation/legalisation sequence."),
 responsibility:l("Apostil veya tasdik yalnızca yetkili kurum tarafından verilir; AVOfis süreci koordine edebilir.","Een apostille of legalisatie wordt uitsluitend door de bevoegde instantie afgegeven.","Only competent public authorities issue apostilles or legalisation."),
 next:l("Belgenin düzenlendiği ve kullanılacağı ülkeyi seçin.","Kies het land van afgifte en het bestemmingsland.","Choose issuing and destination countries."),
 fields:[
  {key:"issuedIn",label:l("Belge hangi ülkede düzenlendi?","Waar is het afgegeven?","Where was it issued?"),options:origins},
  {key:"usedIn",label:l("Nerede kullanılacak?","Waar wordt het gebruikt?","Where will it be used?"),options:origins},
  {key:"documentType",label:l("Belge türü","Soort document","Document type"),options:documentTypes}
 ]},
 {id:"translation",service:"translation",title:l("Belge tercümesi ve yeminli tercüman","Documentvertaling en beëdigd vertaler","Document translation and sworn translator"),
 audience:l("Tercüme, yeminli tercüme veya tercümenin tasdiki için koordinasyon isteyenler.","Voor wie een vertaling of beëdigde vertaler en eventuele legalisatie nodig heeft.","For people needing a translation, sworn translator or related authentication."),
 need:l("Hedef kurumun tercüme dili, yeminli tercüme ve tasdik kuralları önceden kontrol edilir.","Controleer eerst de taal- en legalisatievereisten van de ontvangende instantie.","First confirm the recipient's translation and authentication requirements."),
 preparation:l("Kaynak dil, hedef dil ve belgenin sunulacağı kurum belirlenir. İlk başvuruda belge yüklenmez.","Bron- en doeltaal en ontvangende instantie worden vastgesteld; geen documenten bij de eerste aanvraag.","Identify source/target languages and recipient; no document is uploaded initially."),
 responsibility:l("Yeminli tercüme yalnızca yetkili tercüman tarafından yapılır. AVOfis yetkili uzman koordinasyonu sağlayabilir.","Een beëdigde vertaling wordt door een bevoegde vertaler uitgevoerd.","Sworn translations are performed by authorised translators."),
 next:l("Kaynak ve hedef dili seçin.","Selecteer de bron- en doeltaal.","Choose source and target language."),
 fields:[
  {key:"sourceLanguage",label:l("Belgenin dili","Brontaal","Source language"),options:languages},
  {key:"targetLanguage",label:l("İstenen tercüme dili","Doeltaal","Target language"),options:languages},
  {key:"useCountry",label:l("Belge nerede sunulacak?","Land van gebruik","Receiving country"),options:origins}
 ]},
 {id:"municipality",service:"administration",title:l("Hollanda belediye ve idarî belge işlemleri","Gemeentelijke en administratieve documenten","Dutch municipality and administrative records"),
 audience:l("Hollanda'da kayıt veya idarî belge hazırlamak isteyen bireyler.","Voor personen die documenten voor de gemeente of andere Nederlandse instanties voorbereiden.","For individuals preparing municipal or administrative documents in the Netherlands."),
 need:l("İlgili gemeente veya kurumun güncel şartları kontrol edilir; kimlik doğrulama ve karar kuruma aittir.","De actuele vereisten van de gemeente of instantie zijn leidend.","The municipality's or authority's current rules govern."),
 preparation:l("İşlem türü, ilgili belediye ve beklenen kayıt/belge türü belirlenir. DigiD bilgileri talep edilmez.","Vermeld type procedure en gemeente; DigiD-inloggegevens worden niet gevraagd.","Identify procedure and municipality; DigiD credentials are never requested."),
 responsibility:l("Resmî başvuru kararı ve belge düzenleme yetkili Hollanda kurumuna aittir.","De bevoegde Nederlandse instantie beslist en verstrekt officiële documenten.","The Dutch authority remains responsible for official decisions and records."),
 next:l("Yapılacak idarî işlemin türünü seçin.","Kies het type gemeentelijke handeling.","Select your administrative procedure."),
 fields:[{key:"purpose",label:l("Hangi işlem?","Welke procedure?","Which procedure?"),options:[
  opt("registration","Belediye kaydı","Inschrijving gemeente","Municipal registration"),
  opt("extract","Kayıt örneği / belge","Uittreksel / document","Record extract"),
  opt("civil","Medeni hâl belgesi","Burgerlijke-standdocument","Civil-status record"),
  opt("other","Diğer idarî işlem","Andere administratieve zaak","Other administrative matter")
 ]}]},
 {id:"diploma",service:"diplomas",title:l("Diploma ve eğitim belgesi değerlendirmesi","Diplomawaardering en onderwijsdocumenten","Diploma evaluation and education records"),
 audience:l("Diplomasını başka ülkede kullanacak veya değerlendirme başvurusu yapacak kişiler.","Voor mensen die hun diploma in een ander land willen laten waarderen.","For people seeking recognition or evaluation of foreign education."),
 need:l("Değerlendirme kurumunun belge ve tercüme listesi amaca göre değişir; sonuç kararını AVOfis vermez.","Vereisten verschillen per beoordelende instantie en doel; AVOfis bepaalt de uitkomst niet.","The competent evaluator's requirements depend on intended use; AVOfis cannot determine recognition."),
 preparation:l("Diplomanın düzenlendiği ülke, kullanılacağı ülke ve değerlendirme amacı belirlenir.","Herkomst, bestemmingsland en doel van de waardering worden vastgesteld.","Identify issuing country, destination and purpose."),
 responsibility:l("Akademik değerlendirme ve düzenlenmiş mesleğe giriş yetkisi ilgili yetkili kuruma aittir.","De bevoegde waarderingsinstantie of beroepsautoriteit beslist.","The competent evaluation or professional licensing authority makes the decision."),
 next:l("Diplomanızın kaynağını ve başvuru amacını belirtin.","Geef land en doel van de diplomawaardering op.","Select issuing country and purpose."),
 fields:[
  {key:"issuedIn",label:l("Diploma nereden alındı?","Land van diploma","Issuing country"),options:origins},
  {key:"purpose",label:l("Hangi amaçla?","Doel","Purpose"),options:[opt("study","Eğitim / üniversite","Studie","Further study"),opt("employment","İş başvurusu","Werk","Employment"),opt("regulated","Düzenlenmiş meslek","Gereglementeerd beroep","Regulated profession"),opt("other","Diğer","Anders","Other")]}
 ]},
 {id:"company",service:"business",title:l("Hollanda veya Türkiye şirket işlemi hazırlığı","Voorbereiding van bedrijfszaken","Prepare business formation or trade documents"),
 audience:l("Hollanda'da veya Türkiye ile bağlantılı iş kurmak ya da ticaret belgesi hazırlamak isteyenler.","Voor ondernemers met een oprichting of zakelijke documenten in Nederland of Turkije.","For entrepreneurs preparing incorporation or cross-border commercial records."),
 need:l("Şirket türü, ülke, noter/KVK veya ilgili ticaret sicili aşaması ve gereken uzmanlık belirlenir.","Rechtsvorm, land, notaris/KVK of handelsregister en vereiste expertise worden bepaald.","Determine legal form, jurisdiction, notary or trade registry steps and professionals."),
 preparation:l("Ticaret işleminin türü ve ülke belirlenir. İlk başvuruda ortakların kişisel belgeleri istenmez.","Het type zakelijke handeling en land worden bepaald; geen identiteitsstukken bij de eerste aanvraag.","Identify the business procedure and country; no identity documents are collected in initial enquiries."),
 responsibility:l("Tescil, noterlik, hukukî/vergisel danışmanlık ilgili yetkili kurum ve bağımsız uzmanlara aittir.","Registratie, notariële werkzaamheden en juridisch/fiscaal advies blijven bij bevoegde partijen.","Registration, notarisation and legal/tax advice remain with competent bodies and professionals."),
 next:l("Şirket işleminin konusunu ve ülkesini seçin.","Selecteer de zakelijke procedure en het land.","Choose procedure and country."),
 fields:[
  {key:"country",label:l("İşlem hangi ülkede?","Land van procedure","Jurisdiction"),options:origins},
  {key:"purpose",label:l("Hangi ihtiyaç?","Welke behoefte?","What is needed?"),options:[opt("formation","Şirket kuruluş evrakı","Oprichtingsstukken","Incorporation documents"),opt("trade","Ticaret / sicil belgesi","Handels-/registerdocument","Trade or registry record"),opt("notary","Noter işlemi koordinasyonu","Afstemming met notaris","Notary coordination"),opt("other","Diğer","Anders","Other")]}
 ]},
 {id:"crossborder",service:"expert",title:l("Hollanda–Türkiye belge aktarımı ve koordinasyonu","Documentoverdracht Nederland–Turkije","Netherlands–Türkiye document transfer and coordination"),
 audience:l("İki ülke arasında belge temini, teslimi veya farklı uzmanları koordine ettirmek isteyenler.","Voor wie documenten tussen Nederland en Turkije moet laten verwerken of doorsturen.","For people coordinating document handling and transfer between the Netherlands and Türkiye."),
 need:l("Belgenin kimde olduğu, teslim şekli, hangi kurumun kabul edeceği ve gerekiyorsa tasdik gereksinimi belirlenir.","De houder, wijze van aflevering, ontvanger en eventuele legalisatie worden vastgesteld.","Identify issuer, recipient, authorised delivery method and potential authentication."),
 preparation:l("Belgenin gönderileceği yön ve belge kategorisi belirlenir; ilk aşamada kişisel belge gönderilmez.","Geef richting en categorie aan; bij de eerste aanvraag geen persoonlijke bestanden.","Select transfer direction and document category, without uploading files."),
 responsibility:l("Belge düzenleme/teslim yetkisi ilgili kurum ve meslek mensuplarına aittir; AVOfis koordinasyonla sınırlıdır.","De bevoegde instantie of beroepsbeoefenaar voert voorbehouden handelingen uit.","Competent authorities and professionals perform reserved acts; AVOfis may coordinate."),
 next:l("Belge akışının yönünü ve türünü seçin.","Kies de overdrachtsrichting en het documenttype.","Choose direction and record type."),
 fields:[
  {key:"direction",label:l("Hangi yönde?","Welke richting?","Transfer direction?"),options:[opt("tr-nl","Türkiye → Hollanda","Turkije → Nederland","Türkiye → Netherlands"),opt("nl-tr","Hollanda → Türkiye","Nederland → Turkije","Netherlands → Türkiye"),opt("other","Başka ülke bağlantısı","Andere landen","Other countries")]},
  {key:"documentType",label:l("Belge türü","Documentsoort","Document category"),options:documentTypes}
 ]},
 {id:"specialist",service:"expert",title:l("Yetkili avukat, noter veya yeminli tercüman yönlendirmesi","Doorverwijzing naar bevoegde specialist","Referral to an authorised specialist"),
 audience:l("Bağımsız yetkili bir meslek mensubuna yönlendirilmesi gereken kişiler.","Voor wie een zelfstandige bevoegde beroepsbeoefenaar nodig heeft.","For people requiring an independently authorised professional."),
 need:l("Düzenlenmiş meslek faaliyeti AVOfis'in kendi hizmeti gibi gösterilmez; profesyonelin yetkisi ve görev sınırı ayrıca kontrol edilir.","Voorbehouden werkzaamheden worden niet als eigen AVOfis-dienst aangeboden.","Reserved professional activities are not presented as AVOfis's own services."),
 preparation:l("İstenen meslekî uzmanlık ve ülke belirlenir. Hukukî/sağlık içerikli hassas dosyalar ilk başvuruda istenmez.","Benoem expertise en land; geen gevoelige dossiers bij de eerste aanvraag.","Indicate profession and country without providing sensitive case files initially."),
 responsibility:l("Hukukî temsil, noterlik ve yeminli tercüme hizmetinin sorumluluğu ilgili yetkili profesyoneldedir.","De onafhankelijke bevoegde professional blijft verantwoordelijk voor zijn werkzaamheden.","The independent licensed professional remains responsible for reserved services."),
 next:l("Hangi uzmana ve hangi ülkede ihtiyaç olduğunu belirtin.","Kies specialisme en land.","Choose profession and country."),
 fields:[
  {key:"profession",label:l("Hangi uzmanlık?","Welk beroep?","Professional expertise"),options:[opt("lawyer","Avukat","Advocaat","Lawyer"),opt("notary","Noter","Notaris","Civil-law notary"),opt("translator","Yeminli tercüman","Beëdigd vertaler","Sworn translator"),opt("tax","Vergi uzmanı","Belastingadviseur","Tax professional"),opt("other","Diğer yetkili uzman","Andere specialist","Other specialist")]},
  {key:"country",label:l("Hangi ülke?","Welk land?","Country"),options:origins}
 ]}
];
export const journeyIds=journeys.map(x=>x.id);
export function getJourney(id:string):Journey|undefined{return journeys.find(x=>x.id===id);}
export function validateJourneyDetails(journeyId:string,details:unknown):details is Record<string,string>{
 const journey=getJourney(journeyId);
 if(!journey||!details||typeof details!=="object"||Array.isArray(details))return false;
 const fields=journey.fields,values=details as Record<string,unknown>;
 return Object.keys(values).length===fields.length && fields.every(f=>
   typeof values[f.key]==="string"&&f.options.some(option=>option.value===values[f.key]));
}
