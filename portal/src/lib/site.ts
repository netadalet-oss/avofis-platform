/** AVOfis public navigation, restricted to the canonical 17-service portal. */
export type NavigationItem = { label: string; href: string };
export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };

export const navigation: NavigationItem[] = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Kimler için?", href: "/kimler-icin" },
  { label: "İşlem yolları", href: "/islemler" },
  { label: "İşlem akışı önizlemesi", href: "/seviye-2-akis" },
  { label: "İlk hazırlık", href: "/baslangic" },
  { label: "Hukukî bilgi", href: "/bilgi" },
  { label: "Belge hazırlığı", href: "/belge-hazirlik" },
  { label: "Kurumsal ve uyum", href: "/uyum" },
  { label: "İletişim", href: "/iletisim" }
];

/** AV-018 / R-067–R-068: only reviewed, real internal pages and clearly pending disclosures. */
export const footerColumns: FooterColumn[] = [
  { title: "Hizmet ve işlem", links: [
    { label: "17 hizmet alanı", href: "/hizmetler" },
    { label: "14 hedef kitle", href: "/kimler-icin" },
    { label: "12 sorun rotası", href: "/islemler" }
  ] },
  { title: "Hukukî bilgi", links: [
    { label: "Bilgi ve kaynak rehberleri", href: "/bilgi" },
    { label: "Yargı ve resmî kaynaklar", href: "/yargi-baglantilari" },
    { label: "Belge hazırlık bilgisi", href: "/belge-hazirlik" }
  ] },
  { title: "Şeffaflık ve haklar", links: [
    { label: "Gizlilik (taslak)", href: "/gizlilik" },
    { label: "Çerezler (taslak)", href: "/cerezler" },
    { label: "Genel şartların durumu", href: "/uyum#genel-sartlar" },
    { label: "Şikâyet kanalı durumu", href: "/uyum#sikayet" },
    { label: "Erişilebilirlik durumu", href: "/uyum#erisilebilirlik" },
    { label: "Tüketici hakları durumu", href: "/uyum#tuketici-haklari" },
    { label: "İletişim kanalı durumu", href: "/iletisim" },
    { label: "Geliştirme durumu", href: "/ilerleme" },
    { label: "Dil kapsamı ve insan incelemesi", href: "/diller" }
  ] }
];
