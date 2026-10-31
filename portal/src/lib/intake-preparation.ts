// Seviye 1: Tarayicida calisan, kisisel veri toplamayan bilgi hazirligi.
// Resmi basvuru, vekalet, sure hesabi veya musteri kabul sistemi degildir.
export type Country = "NL" | "DE" | "BE" | "TR" | "OTHER";
export type IssueId =
  | "employment" | "housing" | "official-decision" | "residence"
  | "family" | "debt" | "benefits" | "business"
  | "documents" | "education" | "commercial" | "cross-border";
export type UserSide = "person" | "employee" | "employer" | "tenant" | "landlord" | "business";
export type Answer = "yes" | "no" | "unknown";
export type PreparationInput = {
  country: Country;
  issue: IssueId;
  side: UserSide;
  otherCountry: Country | "NONE";
  decisionReceived: Answer;
  timeConcern: Answer;
};
export type PreparationResult = {
  issueLabel: string;
  relatedService: string;
  countryLabel: string;
  requiredChecks: string[];
  nextSteps: string[];
  officialSources: { label: string; url: string }[];
  needsPromptHumanReview: boolean;
  description: string;
};

export const countries: Record<Country, string> = {
  NL: "Hollanda", DE: "Almanya", BE: "Belçika",
  TR: "Türkiye", OTHER: "Başka ülke"
};
export const issues: Record<IssueId, {
  label: string; relatedService: string; documents: readonly string[]; focus: string;
}> = {
  employment: {
    label: "İşverenimle veya çalışanımla sorun yaşıyorum",
    relatedService: "Çalışma hayatı / Uluslararası istihdam",
    documents: ["İlgili iş sözleşmesinin türü ve tarihi", "İşverenin karar veya yazışmalarının listesi"],
    focus: "Çalışan ve işverenin menfaatleri farklıdır; başvuru yolu ve görevli merciye göre inceleme gerekir."
  },
  housing: {
    label: "Kirada, depozitoda veya konutta sorun yaşıyorum",
    relatedService: "Konut, kira ve sigorta",
    documents: ["Kira sözleşmesinin ve ilgili yazışmaların listesi", "Uyuşmazlığın konusu: kira, depozito, bakım veya tahliye"],
    focus: "Kiracı ile ev sahibi için başvuru yolları ve yetkili kurum farklı olabilir."
  },
  "official-decision": {
    label: "Bir kamu kurumundan karar aldım",
    relatedService: "Resmî başvuru ve itiraz",
    documents: ["Kararı veren kurum, kararın türü ve tebliğ yönteminin not edilmesi", "Kararda belirtilen başvuru yolunun ve varsa süre bilgisinin kontrolü"],
    focus: "İtiraz ve dava yolları ülkeye, kuruma ve işlem türüne bağlıdır; otomatik son gün hesaplanmaz."
  },
  residence: {
    label: "Vize, oturum veya vatandaşlık sorum var",
    relatedService: "Vize, oturum ve vatandaşlık",
    documents: ["Başvurunun veya kararın hangi makama ait olduğunun belirlenmesi", "Başvuru türü ve işlem aşamasının not edilmesi"],
    focus: "İltica, sınır dışı ve idarî gözetim gibi durumlarda ayrıca yetkili uzman değerlendirmesi gerekir."
  },
  family: {
    label: "Aile, çocuk veya mirasla ilgili sorunum var",
    relatedService: "Hukukî dosya değerlendirmesi / Avrupa içi işlemler",
    documents: ["İlgili ülkelerin ve işlem türünün belirlenmesi", "Yetkili makamın veya varsa resmî kararın not edilmesi"],
    focus: "Çocuklara ve aile ilişkilerine ait hassas kişisel belgeleri bu hazırlık ekranına yazmayın."
  },
  debt: {
    label: "Alacağımı tahsil etmek veya borcumu değerlendirmek istiyorum",
    relatedService: "Alacak takibi",
    documents: ["Alacağın veya borcun dayanağı olan sözleşme/fatura türü", "Vade, ödeme ve yazışmaların tarih sıralaması"],
    focus: "Tahsilat ve icra işlemleri yetki, kayıt ve ülke şartlarına bağlıdır; bu ekran tahsilat başlatmaz."
  },
  benefits: {
    label: "Sosyal yardım, sigorta veya vergi kararını anlamıyorum",
    relatedService: "Sosyal güvenlik ve vergi",
    documents: ["Kararı veren kurum ile yardım veya verginin türü", "Kararın bildirim şeklinin ve varsa başvuru yolunun not edilmesi"],
    focus: "Kurum ve karar türüne göre özel başvuru yolu ve süre olabilir."
  },
  business: {
    label: "Şirket kurma veya işletme işlemi yapacağım",
    relatedService: "Şirket ve ticaret",
    documents: ["Planlanan ülke, işletme türü ve faaliyet", "Kurucuların rollerine ilişkin doğrulanacak bilgilerin listesi"],
    focus: "Şirket tescili, vergi kaydı ve düzenlenmiş meslek yetkisi ayrı konulardır."
  },
  documents: {
    label: "Resmî belge, apostil veya tercüme gerekiyor",
    relatedService: "Belge, apostil ve tercüme",
    documents: ["Belgeyi düzenleyen ülke ve kurum", "Belgenin kullanılacağı ülke ve kurum"],
    focus: "Bir belgenin apostil, tasdik veya yeminli tercüme gerektirmesi işlem ve ülkeye göre değişir."
  },
  education: {
    label: "Diploma, eğitim veya denklik sorunum var",
    relatedService: "Eğitim ve diploma",
    documents: ["Belgenin düzenlendiği ülke ve eğitim düzeyi", "Belgenin kullanılacağı ülke ve amaç"],
    focus: "Akademik tanıma ile düzenlenmiş bir mesleğe kabul aynı işlem değildir."
  },
  commercial: {
    label: "Sözleşme veya ticari uyuşmazlığım var",
    relatedService: "Sözleşmeler ve uyuşmazlıklar",
    documents: ["Sözleşmenin taraf rollerinin ve ülkelerinin belirlenmesi", "Sözleşme, ödeme ve yazışma tarih sırasının çıkarılması"],
    focus: "Yargı yetkisi ve uygulanacak hukuk, sözleşme ile ilgili ülkelerden ayrı incelenmelidir."
  },
  "cross-border": {
    label: "İki Avrupa ülkesi arasında işlemim var",
    relatedService: "Avrupa içi hukukî ve idarî işlemler",
    documents: ["İşlemin etkilediği ülkeler ve kurumlar", "Gerekli belge ve olası yerel uzman ihtiyaçlarının listesi"],
    focus: "Bir ülkede yapılan işlem veya meslekî yetki diğer ülkede otomatik geçerli sayılmaz."
  }
};

export const officialSourceByCountry: Partial<Record<Country, { label: string; url: string }>> = {
  NL: { label: "Hollanda devlet bilgi portalı", url: "https://www.rijksoverheid.nl/" },
  DE: { label: "Almanya federal hükümet portalı", url: "https://www.bundesregierung.de/" },
  BE: { label: "Belçika resmî portalı", url: "https://www.belgium.be/" },
  TR: { label: "Türkiye e-Devlet Kapısı", url: "https://www.turkiye.gov.tr/" }
};

function isOwnKey<T extends object>(value: T, key: string): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function isAnswer(value: unknown): value is Answer {
  return value === "yes" || value === "no" || value === "unknown";
}
const sides: readonly UserSide[] = ["person", "employee", "employer", "tenant", "landlord", "business"];

export function createPreparation(input: PreparationInput): PreparationResult {
  if (!input || !isOwnKey(countries, input.country) || !isOwnKey(issues, input.issue)
    || !sides.includes(input.side) || !(input.otherCountry === "NONE" || isOwnKey(countries, input.otherCountry))
    || !isAnswer(input.decisionReceived) || !isAnswer(input.timeConcern)) {
    throw new Error("Geçerli ülke, konu ve durum bilgileri seçilmelidir.");
  }
  const issue = issues[input.issue];
  const crossBorder = input.otherCountry !== "NONE" && input.otherCountry !== input.country;
  const urgent = input.timeConcern !== "no" || input.decisionReceived !== "no"
    || input.issue === "residence" || input.issue === "official-decision";
  const checks = [...issue.documents];
  if (input.decisionReceived !== "no") {
    checks.push("Varsa resmî kararın ve tebliğin gerçek tarihini kendi güvenli kayıtlarınızda belirleyin.");
  }
  if (crossBorder) {
    checks.push("İki ülkenin yetkili kurumlarını ve ayrı işlem koşullarını doğrulayın.");
  }
  if (input.side === "tenant" || input.side === "landlord") {
    checks.push("Konutta kiracı/ev sahibi konumuna özgü başvuru yolunu kontrol edin.");
  }
  if (input.side === "employee" || input.side === "employer") {
    checks.push("İşçi/işveren sıfatınıza özgü hakları ve çıkar çatışması ihtimalini değerlendirin.");
  }
  const steps = [
    "Önce ilgili ülke, kurum ve işlem türünü resmî kaynaktan doğrulayın.",
    "Gerekli belgelerin yalnız listesini çıkarın; kimlik, dosya, sağlık veya göç evrakınızı bu ekrana yüklemeyin.",
    "Genel bilgi ile ücretli kişisel hukukî değerlendirmeyi ve resmî başvuruyu birbirinden ayırın."
  ];
  if (urgent) {
    steps.unshift("Karar, tebliğ veya zaman baskısı olabilir: yetkili kurumdan ve gerekiyorsa bağımsız yetkili hukuk profesyonelinden gecikmeden teyit alın. Bu ekran süre hesaplamaz.");
  }
  if (crossBorder) {
    steps.push("Diğer ülkedeki işlem ve gerekli meslekî yetki için ayrıca yerel resmî kaynak veya yetkili uzman incelemesi yapın.");
  }
  steps.push("AVOfis kuruluş/fizibilite aşamasındadır; bu hazırlık özeti AVOfis'e gönderilmez, dosya açmaz ve hizmet sözleşmesi kurmaz.");
  const sources = [officialSourceByCountry[input.country], crossBorder ? officialSourceByCountry[input.otherCountry as Country] : undefined]
    .filter((source): source is { label: string; url: string } => Boolean(source));
  return {
    issueLabel: issue.label,
    relatedService: issue.relatedService,
    countryLabel: countries[input.country],
    requiredChecks: checks,
    nextSteps: steps,
    officialSources: sources,
    needsPromptHumanReview: urgent,
    description: issue.focus
  };
}

export function createPreparationText(input: PreparationInput): string {
  const result = createPreparation(input);
  return [
    "AVOfis — Kişisel veri içermeyen hazırlık özeti (resmî işlem değildir)",
    "Ülke: " + result.countryLabel,
    "Konu: " + result.issueLabel,
    "İlgili hizmet alanı (henüz etkin hizmet teklifi değildir): " + result.relatedService,
    "Başka ülke: " + (input.otherCountry === "NONE" ? "Seçilmedi" : countries[input.otherCountry]),
    "Resmî karar: " + input.decisionReceived,
    "Zaman endişesi: " + input.timeConcern,
    "",
    "Ön kontrol:", ...result.requiredChecks.map((item, index) => (index + 1) + ". " + item),
    "",
    "Sonraki güvenli adımlar:", ...result.nextSteps.map((item, index) => (index + 1) + ". " + item),
    "",
    "Resmî başlangıç kaynakları:", ...result.officialSources.map((source) => source.label + ": " + source.url),
    "",
    "Bu özet mevzuat görüşü, müvekkil kabulü, süre hesabı veya herhangi bir kuruma başvuru değildir."
  ].join("\n");
}
