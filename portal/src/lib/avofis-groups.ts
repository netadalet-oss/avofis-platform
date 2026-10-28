import type { L } from "./avofis-site";
const l=(tr:string,nl:string,de:string,en:string):L=>({tr,nl,de,en});
export const serviceGroups=[
 {id:"legal",title:l("Hukukî Danışmanlık, Uyuşmazlık ve Temsil","Juridische hulp, geschillen en vertegenwoordiging","Rechtliche Hilfe, Konflikte und Vertretung","Legal Support, Disputes & Representation"),description:l("Hukukî görüş, sözleşme, alacak, kira, ceza şikâyeti ve izin verilen yargısal işlemler.","Juridisch advies, contracten, incasso, huur en toegestane vertegenwoordiging.","Beratung, Verträge, Forderungen, Miete und zulässige Vertretung.","Opinions, contracts, debts, housing disputes and eligible representation."),slugs:["hukuki-danismanlik","mahkeme-temsil","avrupa-turkiye-hukuki-uzman-koordinasyonu","alacak-takibi","sozlesmeler-uyusmazliklar","konut-kira-sigorta","ceza-sikayet-trafik"]},
 {id:"public",title:l("Resmî Kurumlar, Göç ve Hak Arama","Overheid, migratie en rechtsmiddelen","Behörden, Migration und Rechtsschutz","Public Authorities, Immigration & Remedies"),description:l("İdarî kararlar, sosyal güvenlik ve vergi, oturum ve uluslararası insan hakları başvuruları.","Overheidsbesluiten, sociale zekerheid, belasting, verblijf en mensenrechten.","Behördenentscheidungen, Sozialleistungen, Steuern, Aufenthalt und Menschenrechte.","Official decisions, benefits and tax, residency and international human-rights mechanisms."),slugs:["resmi-basvuru-itiraz","sosyal-guvenlik-vergi","vize-oturum-vatandaslik","uluslararasi-insan-haklari"]},
 {id:"business",title:l("Avrupa İçi İşlemler, İş ve Ticaret","Europa, werk en handel","Europa, Arbeit und Handel","European Affairs, Employment & Trade"),description:l("Türkiye bağlantısı aranmadan Avrupa içi işlemler, çalışma hayatı, şirketler ve uluslararası istihdam.","Ook zonder Turkse band: Europese zaken, werk, ondernemingen en internationale werving.","Auch ohne Türkei-Bezug: EU-Angelegenheiten, Arbeit, Unternehmen und Personal.","European matters without any Türkiye requirement, employment, business and recruitment."),slugs:["avrupa-ici-islemler","calisma-hayati","sirket-ticaret","uluslararasi-istihdam"]},
 {id:"documents",title:l("Belge ve Eğitim İşlemleri","Documenten en onderwijs","Dokumente und Bildung","Documents & Education"),description:l("Apostil, yeminli tercüme, resmî belgeler, öğrenciler ve diploma değerlendirme.","Apostille, officiële documenten, vertalingen en onderwijs.","Apostille, Dokumente, Übersetzung und Bildung.","Apostilles, records, sworn translations and qualifications."),slugs:["belge-apostil-tercume","egitim-diploma"]}
] as const;
export const featuredServiceSlugs=[
 "hukuki-danismanlik","mahkeme-temsil","resmi-basvuru-itiraz",
 "alacak-takibi","vize-oturum-vatandaslik","avrupa-ici-islemler",
 "calisma-hayati","sirket-ticaret","konut-kira-sigorta"
];
export const featuredAudienceSlugs=[
 "avrupa-ici-islemler","hukuki-destek-arayanlar","calisanlar-ve-hak-arayanlar",
 "gocmenler-ve-aileler","alacakli-ve-borclular","girisicim-ve-isletmeler",
 "kiracilar-ve-ev-sahipleri","ogrenciler-ve-mezunlar","avrupadaki-turkiyeliler"
];
