/** AVOfis public navigation, restricted to the canonical 17-service portal. */
export type NavigationItem = { label: string; href: string };
export type FooterColumn = { title: string; links: string[] };

export const navigation: NavigationItem[] = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Kimler için?", href: "/katalog" },
  { label: "İşlem yolları", href: "/islemler" },
  { label: "İlk hazırlık", href: "/baslangic" },
  { label: "Hukuk rehberleri", href: "/bilgi/rehberler" },
  { label: "Belge hazırlığı", href: "/belge-hazirlik" },
  { label: "Kurumsal ve uyum", href: "/uyum" },
  { label: "İletişim", href: "/iletisim" }
];

export const footerColumns: FooterColumn[] = [
  { title: "Hizmet ve işlem", links: ["17 hizmet alanı", "14 hedef kitle", "12 sorun rotası"] },
  { title: "Hukukî bilgi", links: ["16 kaynaklı rehber", "Yargı ve resmî kaynaklar", "Belge hazırlık bilgisi"] },
  { title: "Şeffaflık", links: ["Gizlilik ve veri hakları", "Hizmet ve temsil sınırları", "Geliştirme durumu"] }
];
