/**
 * AVOfis private staff workspace. These permissions scope the UI and drafts.
 * Production data access is ALWAYS additionally guarded by Supabase RLS and
 * verified service policies. A client's scope never follows an employee role.
 */
export const staffCapabilities=[
 "inbox","triage","matters","calendar","documents","pleadings",
 "research","judicial","ind","messages","billing","payables",
 "reporting","audit","people","settings"
] as const;
export type StaffCapability=(typeof staffCapabilities)[number];
export type StaffRole="admin"|"operator";
export type WorkspaceSection={
 id:StaffCapability; label:string;subtitle:string;group:string;
 description:string;tasks:readonly string[];icon:string;
 requiresLiveAuthorization?:boolean;
};
export const sections:readonly WorkspaceSection[]=[
 {id:"inbox",label:"Başvuru masası",subtitle:"Gelen talepler",group:"Dosya ve hizmet",icon:"inbox",description:"Taleplerin sınıflandırılması, kapsam ve kabul değerlendirmesi.",tasks:["Yeni başvurunun ön kontrolü","Çıkar çatışması ve temsil yetkisi","Veri minimizasyonu","İnsana yönlendirme"]},
 {id:"triage",label:"Ön inceleme",subtitle:"Ülke ve süre riski",group:"Dosya ve hizmet",icon:"route",description:"Ülke, tebliğ, usul ve uzmanlık incelemesi.",tasks:["Acil durum ayrımı","Tebliğ kaynağı","İşlem bazlı yetki kontrolü","İşlem kabul veya gerekçeli sevk"]},
 {id:"matters",label:"Dava ve dosyalar",subtitle:"Atanan işler",group:"Dosya ve hizmet",icon:"folder",description:"Müvekkil ve dosyaya özgü görev alanı.",tasks:["Dosya durumu","Personel ataması","Sözleşme/kapsam","İşlem ve karar kaydı"]},
 {id:"calendar",label:"Takvim ve görevler",subtitle:"İnceleme gerektiren tarihler",group:"Dosya ve hizmet",icon:"calendar",description:"Duruşma, hatırlatma ve insan tarafından kontrol edilen süreler.",tasks:["Tebliğ doğrulama","Son tarih uzman kontrolü","Görev ataması","Takvim ve bildirim"]},
 {id:"documents",label:"Belgeler ve talepler",subtitle:"Güvenli evrak süreçleri",group:"Belge ve hukuk",icon:"files",description:"Belge listeleri, sürüm ve imza kontrolleri.",tasks:["Eksik belge talebi","Özel depolama","Kaynak ve sürüm","Yetkili paylaşım"]},
 {id:"pleadings",label:"Dilekçe ve şablonlar",subtitle:"Hazırlık çalışma alanı",group:"Belge ve hukuk",icon:"file-pen",description:"Yetkili meslek mensubunun inceleyeceği düzenlenebilir taslaklar.",tasks:["Resmî form kaynağı","Dilekçe taslağı","Ek listesi","İnsan imzası ve onayı"]},
 {id:"research",label:"Mevzuat ve içtihat",subtitle:"Kaynaklı hukuk kütüphanesi",group:"Belge ve hukuk",icon:"book",description:"Resmî mevzuat, süreç kuralları ve ECLI kaynakları.",tasks:["Resmî kaynakları incele","Güncellik kontrolü","Konuya özgü not","Uzman değerlendirmesi"]},
 {id:"judicial",label:"Rechtspraak işlemleri",subtitle:"Mahkeme bağlantıları",group:"Belge ve hukuk",icon:"landmark",description:"Mijn Rechtspraak ve Aansluitpunt sınırları.",tasks:["Gerçek temsil belgesi","Usul ve mahkeme seçimi","Manuel gönderim teyidi","Resmî makbuz kontrolü"],requiresLiveAuthorization:true},
 {id:"ind",label:"IND ve yabancılar hukuku",subtitle:"Ayrı G1–G4 kapıları",group:"Belge ve hukuk",icon:"shield",description:"İltica ve gözetim dâhil özel IND yetkileri.",tasks:["Sekiz prosedür ayrımı","G1–G4 inceleme","Geçiş hukuku kontrolü","NOvA/özel yetki"],requiresLiveAuthorization:true},
 {id:"messages",label:"Yazışmalar",subtitle:"Dosyaya bağlı iletişim",group:"İletişim",icon:"message",description:"Gelen ve giden taslaklar; gönderme için ayrı kanal ve yetki.",tasks:["Mesaj görüntüleme","Taslak yanıt","Dosyaya bağlama","İletim kaydı"]},
 {id:"billing",label:"Gelir ve tahsilatlar",subtitle:"Sözleşme ve mutabakat",group:"Finans",icon:"wallet",description:"Teklif, fatura, tahsilat ve iade inceleme kayıtları.",tasks:["Ücret ve harç ayrımı","Fatura taslağı","PSP mutabakatı","İade kontrolü"],requiresLiveAuthorization:true},
 {id:"payables",label:"Gider ve ödemeler",subtitle:"Bütçe ve tedarikçi",group:"Finans",icon:"receipt",description:"Gider, tedarikçi, vergiler ve onay akışı.",tasks:["Gider kaydı","Bütçe kodu","İki kişi onayı","Banka mutabakatı"],requiresLiveAuthorization:true},
 {id:"reporting",label:"Rapor ve performans",subtitle:"İş yükü ve kalite",group:"Yönetim",icon:"chart",description:"Veri erişim yetkisine göre toplulaştırılmış gösterge.",tasks:["Dosya yaşam döngüsü","Geciken incelemeler","Gelir-gider özeti","Kalite kontrol"]},
 {id:"audit",label:"Denetim ve uyum",subtitle:"AVG, yetki ve olaylar",group:"Yönetim",icon:"shield-check",description:"Erişim denetimi ve bağımsız onay takip alanı.",tasks:["Erişim kayıtları","GDPR/AVG talepleri","Güvenlik bulguları","Bağımsız onay"]},
 {id:"people",label:"Personel yetkileri",subtitle:"Görev kapsamı ve atama",group:"Yönetim",icon:"users",description:"Personel rollerini ve görev yetkilerini insan incelemesine açar.",tasks:["Bireysel hesap","En az ayrıcalık","Personel görevlendirme","Yetki iptali"]},
 {id:"settings",label:"Sistem ve yayın",subtitle:"Hizmet ve içerik yönetimi",group:"Yönetim",icon:"settings",description:"Alan, kaynak, dil, yayın ve entegrasyon bayrakları.",tasks:["Altı dil kontrolü","Kaynak güncelliği","Modül durumu","Yayın kararı"]}
];
export const capabilityGroups=["Dosya ve hizmet","Belge ve hukuk","İletişim","Finans","Yönetim"] as const;
export function isStaffCapability(input:string):input is StaffCapability{
 return (staffCapabilities as readonly string[]).includes(input);
}
export function canAccessWorkspace(role:string|null,grants:readonly string[],cap:StaffCapability){
 if(role==="admin")return true;
 return role==="operator" && grants.includes(cap);
}
export function availableWorkspaceSections(role:string|null,grants:readonly string[]){
 return sections.filter(s=>canAccessWorkspace(role,grants,s.id));
}
export const productionActions={
 clientIntake:false,bankTransfer:false,officialCourtFiling:false,
 indSubmission:false,externalMessageDispatch:false,automaticDeadlineApproval:false,
 personalDocumentUpload:false
} as const;
