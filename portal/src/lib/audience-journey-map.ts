/**
 * AV-044: editorial, NON-BINDING first-information route map.
 * Journey IDs are sourced from journeys.ts; this is not eligibility,
 * representation, fee advice, limitation-period advice or user profiling.
 */
export const audienceFirstPaths: Readonly<Record<string, readonly string[]>> = {
  "avrupadaki-turkiyeliler": ["tr-to-nl", "nl-to-tr", "crossborder"],
  "gocmenler-ve-aileler": ["ind-decision-objection", "municipality", "tr-to-nl"],
  "ogrenciler-ve-mezunlar": ["diploma", "translation", "tr-to-nl"],
  "calisanlar-ve-hak-arayanlar": ["unpaid-wages", "specialist"],
  "girisicim-ve-isletmeler": ["company", "crossborder", "specialist"],
  "vize-basvuranlar-ve-davet-edenler": ["tr-to-nl", "specialist"],
  "turkiyeden-avrupaya": ["tr-to-nl", "diploma", "company"],
  "avrupadan-turkiyeye": ["nl-to-tr", "apostille", "crossborder"],
  "insan-haklari-basvurulari": ["specialist"],
  "avrupa-ici-islemler": ["crossborder", "company", "specialist"],
  "hukuki-destek-arayanlar": ["specialist"],
  "alacakli-ve-borclular": ["specialist"],
  "kiracilar-ve-ev-sahipleri": ["rent-repairs", "specialist"],
  "sosyal-yardim-vergi": ["municipality", "specialist"]
};
