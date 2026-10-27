export type Language = "tr" | "nl" | "en";
export type ServiceCode = "documents" | "translation" | "administration" | "diplomas" | "business" | "referral";

type Service = { id: ServiceCode; title: string; description: string; detail: string; category: string };
type Step = { title: string; description: string };
type Principle = { title: string; description: string };
type LanguageContent = {
  status: string; servicesNav: string; processNav: string; infoNav: string; accountNav: string; requestNav: string;
  eyebrow: string; headline: string; intro: string; browse: string; enquiryStatus: string;
  cardHeading: string; cardSubheading: string; cardScope: string; cardDocuments: string; cardFee: string; cardNote: string;
  servicesHeading: string; servicesIntro: string; detailLink: string; serviceList: Service[];
  processHeading: string; processIntro: string; steps: Step[];
  principlesHeading: string; principles: Principle[];
  closeHeading: string; closeText: string; closeAction: string;
  footerScope: string; privacy: string; info: string; serviceDetail: string; notice: string;
};
export const serviceCodes: ServiceCode[] = ["documents","translation","administration","diplomas","business","referral"];
export const copy: Record<Language,LanguageContent> = {
  tr: {
    status: "Kuruluş hazırlığında · Henüz müşteri kabul edilmiyor",
    servicesNav: "Hizmetler", processNav: "İşleyiş", infoNav: "Bilgi merkezi", accountNav: "Müşteri alanı", requestNav: "Başvuru durumu",
    eyebrow: "HOLLANDA · TÜRKİYE",
    headline: "Belge ve idarî işlemler için düzenli destek.",
    intro: "AVOfis; Hollanda ve Türkiye bağlantılı belge hazırlığı, başvuru süreçleri ve uzman koordinasyonunda açık kapsamlı hizmetler sunmak üzere hazırlanmaktadır.",
    browse: "Hizmetleri incele", enquiryStatus: "Başvuru durumunu gör",
    cardHeading: "Bir işlem başlamadan önce", cardSubheading: "Müşterinin ne alacağı baştan belli olmalıdır.",
    cardScope: "Yapılacak işlemin kapsamı", cardDocuments: "Gerekli belgelerin listesi", cardFee: "Hizmet bedeli ve resmî masraflar", cardNote: "Bu düzen, hizmete açılış sonrasında kullanılacaktır.",
    servicesHeading: "Hizmet alanları", servicesIntro: "Başlangıçta belge, tercüme ve idarî başvuru hazırlığına odaklanıyoruz. Yetki gerektiren meslekî işler bağımsız uzmanlar tarafından yürütülür.",
    detailLink: "Ayrıntıları gör",
    serviceList: [
      {id:"documents",title:"Resmî belgeler ve apostil",description:"Belge temini, apostil ihtiyacı ve kullanım ülkesine göre hazırlık adımlarının belirlenmesi.",detail:"Belgenin türü, yetkili kurum, apostil ve teslim koşulları kontrol edilerek işlem sırası hazırlanır. Resmî işlemler yetkili kurumlarca yapılır.",category:"Belge organizasyonu"},
      {id:"translation",title:"Tercüme ve tasdik koordinasyonu",description:"Belgelerin tercüme, yeminli tercüman ve tasdik gereksinimlerinin organize edilmesi.",detail:"Belgeyi kabul edecek kurumun tercüme ve tasdik koşulları belirlenir. Yeminli tercüme gerekiyorsa iş ilgili yetkili tercüman tarafından yapılır.",category:"Uzman koordinasyonu"},
      {id:"administration",title:"Hollanda idarî başvuruları",description:"Belediye, kayıt ve diğer idarî işlemler için belge ve başvuru hazırlığının düzenlenmesi.",detail:"İlgili kurumun yayımladığı şartlar temel alınarak belge listesi, başvuru adımları ve randevu gereksinimleri kontrol edilir. Kimlik ve DigiD şifreleri talep edilmez.",category:"Başvuru hazırlığı"},
      {id:"diplomas",title:"Diploma değerlendirme",description:"Diploma ve eğitim belgeleriyle ilgili değerlendirme başvurusunun hazırlanması.",detail:"İlgili değerlendirme kuruluşunun belge ve başvuru koşulları kontrol edilir. Değerlendirme ve meslek icra yetkisi kararı ilgili yetkili kurumlara aittir.",category:"Başvuru hazırlığı"},
      {id:"business",title:"Şirket kuruluş hazırlığı",description:"KVK ve noter işlemleri öncesinde belge, adres ve süreç planlamasının yapılması.",detail:"Kuruluş türü, hazırlanacak bilgi ve belgeler, noter ve KVK aşamaları için kontrol listesi hazırlanır. Hukukî ve vergisel görüş bağımsız yetkili uzmanlardan alınır.",category:"İşlem organizasyonu"},
      {id:"referral",title:"Yetkili uzmana yönlendirme",description:"Avukat, noter, vergi uzmanı veya yeminli tercüman gerektiren işlemlerde doğru uzmana ulaşılması.",detail:"AVOfis yetki gerektiren faaliyeti kendi üstlenmez. Gerekli durumda bağımsız ve yetkili profesyonellerle hizmet kapsamı ayrıca belirlenir.",category:"Bağımsız uzman"}
    ],
    processHeading: "Bir başvuru nasıl ilerler?", processIntro: "Hizmete açılışın ardından her dosya aynı anlaşılır sırayla yürütülecektir.",
    steps: [
      {title:"Talep ve ihtiyaç tespiti",description:"İşlem türü ve temel iletişim bilgileri alınır. İlk aşamada hassas belge istenmez."},
      {title:"Kapsam ve ücretin açıklanması",description:"Gerekli belgeler, yapılabilecek işlemler, tahmini süre ve masraflar yazılı olarak belirtilir."},
      {title:"Onay ve dosya takibi",description:"Müşterinin onayından sonra yetkili kişi işlemi yürütür; durum ve sonuç bilgisi paylaşılır."}
    ],
    principlesHeading:"Çalışma ilkelerimiz",
    principles:[
      {title:"Belirli hizmet kapsamı",description:"Hangi işin yapılacağı ve hangi işlemlerin kapsam dışında kaldığı baştan açıklanır."},
      {title:"Gizlilik ve güvenli dosya paylaşımı",description:"Kişisel belgeler yalnızca gerekli olduğunda ve yetkili erişimle işlenir."},
      {title:"Meslekî yetki sınırlarına saygı",description:"Avukatlık, noterlik ve yeminli tercüme gibi işler yetkili meslek mensuplarına bırakılır."}
    ],
    closeHeading:"İhtiyacınıza uygun hizmeti inceleyin.", closeText:"AVOfis şu anda kuruluş hazırlığındadır. Başvuru ve ödeme işlevleri gerekli kontroller tamamlanınca açılacaktır.",closeAction:"Başvuru sayfası",
    footerScope:"AVOfis bir Hollanda avukatlık bürosu değildir. Meslekî yetki gerektiren hizmetler bağımsız yetkili uzmanlarca yürütülür.",
    privacy:"Gizlilik",info:"Bilgi merkezi",serviceDetail:"Hizmet ayrıntıları",notice:"Ücretli dosya kabulü ve ödeme henüz etkin değildir."
  },
  nl: {
    status:"In voorbereiding · Nog geen klantdossiers",servicesNav:"Diensten",processNav:"Werkwijze",infoNav:"Informatie",accountNav:"Mijn dossiers",requestNav:"Aanvraagstatus",
    eyebrow:"NEDERLAND · TURKIJE",headline:"Duidelijke ondersteuning bij documenten en aanvragen.",
    intro:"AVOfis bereidt dienstverlening voor rondom officiële documenten, administratieve aanvragen en professionele coördinatie tussen Nederland en Turkije.",
    browse:"Bekijk diensten",enquiryStatus:"Bekijk beschikbaarheid",
    cardHeading:"Voordat een opdracht begint",cardSubheading:"U weet vooraf wat de dienstverlening omvat.",
    cardScope:"Duidelijke opdrachtomschrijving",cardDocuments:"Lijst met vereiste documenten",cardFee:"Servicekosten en officiële kosten",cardNote:"Deze werkwijze geldt zodra de dienstverlening start.",
    servicesHeading:"Onze diensten",servicesIntro:"De eerste dienstverlening richt zich op documenten, vertalingen en administratieve voorbereiding. Voorbehouden werkzaamheden blijven bij onafhankelijke bevoegde beroepsbeoefenaren.",
    detailLink:"Meer informatie",
    serviceList:[
      {id:"documents",title:"Officiële documenten en apostille",description:"Voorbereiding voor het aanvragen, legaliseren en gebruiken van officiële documenten.",detail:"Wij brengen de bevoegde instantie, vereiste apostille en voorwaarden in kaart. Officiële handelingen blijven bij de bevoegde instanties.",category:"Documentcoördinatie"},
      {id:"translation",title:"Vertaling en legalisatie",description:"Coördinatie van vertaling, beëdigde vertalers en benodigde legalisatie.",detail:"De eisen van de ontvangende organisatie worden gecontroleerd. Beëdigde vertalingen worden door bevoegde vertalers uitgevoerd.",category:"Specialistencoördinatie"},
      {id:"administration",title:"Nederlandse administratieve aanvragen",description:"Voorbereiding van documenten voor gemeentelijke en andere administratieve procedures.",detail:"Documenten en aanvraagstappen worden afgestemd op de officiële vereisten. Persoonlijke DigiD-inloggegevens worden nooit gevraagd.",category:"Aanvraagvoorbereiding"},
      {id:"diplomas",title:"Diplomawaardering",description:"Voorbereiding van aanvragen voor waardering van diploma's en opleidingsstukken.",detail:"De vereisten van de bevoegde waarderingsinstantie worden nagegaan. De instantie beslist over waardering en eventuele beroepstoegang.",category:"Aanvraagvoorbereiding"},
      {id:"business",title:"Voorbereiding bedrijfsoprichting",description:"Documenten, adresinformatie en processtappen voor notaris en KVK.",detail:"Er wordt een documentchecklist gemaakt. Juridisch en fiscaal advies wordt gegeven door onafhankelijk bevoegde professionals.",category:"Procescoördinatie"},
      {id:"referral",title:"Doorverwijzing naar specialisten",description:"Passende doorverwijzing wanneer een advocaat, notaris, fiscalist of beëdigd vertaler nodig is.",detail:"AVOfis voert geen voorbehouden werkzaamheden zelfstandig uit. De specialist spreekt de opdracht en verantwoordelijkheid zelf af.",category:"Onafhankelijke specialist"}
    ],
    processHeading:"Hoe verloopt een aanvraag?",processIntro:"Na de start van de dienstverlening wordt ieder dossier in drie heldere stappen behandeld.",
    steps:[
      {title:"Vraag en eerste beoordeling",description:"Wij vragen naar het soort verzoek en basiscontactgegevens, zonder gevoelige documenten."},
      {title:"Afspraken over inhoud en kosten",description:"Benodigde documenten, afbakening, indicatieve doorlooptijd en kosten worden schriftelijk toegelicht."},
      {title:"Uitvoering na akkoord",description:"Na uw akkoord verzorgt de bevoegde uitvoerder het proces en de terugkoppeling."}
    ],
    principlesHeading:"Onze uitgangspunten",
    principles:[
      {title:"Afgebakende opdracht",description:"Vooraf wordt duidelijk wat wel en niet onder de dienstverlening valt."},
      {title:"Vertrouwelijke documentverwerking",description:"Documenten worden alleen verwerkt wanneer nodig en met passende toegang."},
      {title:"Respect voor beroepsregels",description:"Voorbehouden diensten worden uitgevoerd door daartoe bevoegde beroepsbeoefenaren."}
    ],
    closeHeading:"Bekijk welke ondersteuning past bij uw vraag.",closeText:"AVOfis is momenteel in voorbereiding. Aanvragen en betalingen worden pas na de noodzakelijke controles ingeschakeld.",closeAction:"Aanvraagpagina",
    footerScope:"AVOfis is geen Nederlands advocatenkantoor. Voorbehouden beroepsdiensten worden uitgevoerd door onafhankelijke bevoegde professionals.",
    privacy:"Privacy",info:"Informatie",serviceDetail:"Dienstinformatie",notice:"Betaalde dossiers en betalingen zijn nog niet beschikbaar."
  },
  en: {
    status:"Preparing to launch · Not accepting clients yet",servicesNav:"Services",processNav:"How it works",infoNav:"Information",accountNav:"Client area",requestNav:"Enquiry status",
    eyebrow:"NETHERLANDS · TÜRKIYE",headline:"Clear support with documents and administrative applications.",
    intro:"AVOfis is preparing services for official documents, administrative applications and professional coordination between the Netherlands and Türkiye.",
    browse:"View services",enquiryStatus:"Check availability",
    cardHeading:"Before an engagement begins",cardSubheading:"Know exactly what the service will cover.",
    cardScope:"Defined scope of work",cardDocuments:"Required-document checklist",cardFee:"Service fees and official costs",cardNote:"This process will apply once services open.",
    servicesHeading:"Service areas",servicesIntro:"Initial services focus on document preparation, translation coordination and administrative applications. Regulated work remains with independently authorised professionals.",
    detailLink:"Service details",
    serviceList:[
      {id:"documents",title:"Official documents and apostilles",description:"Planning document requests, apostille requirements and cross-border use.",detail:"The issuing authority and document requirements are identified. Official acts are carried out by the responsible authorities.",category:"Document coordination"},
      {id:"translation",title:"Translation and legalisation",description:"Coordinating translations, sworn translators and required legalisation.",detail:"The receiving organisation's requirements are checked. Sworn translations are provided by authorised translators.",category:"Specialist coordination"},
      {id:"administration",title:"Dutch administrative applications",description:"Preparing documents for municipal and other administrative procedures.",detail:"Applications and document checklists follow official guidance. Personal DigiD credentials are never requested.",category:"Application preparation"},
      {id:"diplomas",title:"Diploma evaluation",description:"Preparing document packs for diploma and academic-credential evaluation.",detail:"Requirements are checked with the evaluating body, which alone decides recognition or professional access.",category:"Application preparation"},
      {id:"business",title:"Business formation preparation",description:"Organising document and process checklists for KVK and notary appointments.",detail:"Required information is prepared. Legal and tax opinions come from independently qualified professionals.",category:"Process coordination"},
      {id:"referral",title:"Referral to authorised specialists",description:"Referrals where a lawyer, civil-law notary, tax adviser or sworn translator is needed.",detail:"AVOfis does not itself perform reserved professional activities. The authorised specialist agrees separate scope and responsibility.",category:"Independent professional"}
    ],
    processHeading:"How does a request proceed?",processIntro:"Once services open, cases will follow the same straightforward sequence.",
    steps:[
      {title:"Initial request",description:"Only the service category and basic contact details are requested initially."},
      {title:"Scope and pricing",description:"Documents, proposed steps, indicative timing and costs are explained in writing."},
      {title:"Agreement and delivery",description:"Following approval, the authorised provider handles the process and shares outcomes."}
    ],
    principlesHeading:"Our operating principles",
    principles:[
      {title:"Defined scope",description:"The services included and excluded are documented before work begins."},
      {title:"Confidential documents",description:"Documents are processed only when necessary and access is restricted."},
      {title:"Respect for professional regulation",description:"Reserved services remain with independent, duly authorised professionals."}
    ],
    closeHeading:"Find the appropriate support for your request.",closeText:"AVOfis is in preparation. Enquiries and payments remain disabled until required checks are complete.",closeAction:"Enquiry page",
    footerScope:"AVOfis is not a Dutch law firm. Reserved professional activities are delivered by independently authorised professionals.",
    privacy:"Privacy",info:"Information",serviceDetail:"Service details",notice:"Paid services and payments are currently unavailable."
  }
};
