/** Canonical topic navigation, not a diagnosis, mandate, or professional recommendation. */
export const journeyServiceSlugs: Readonly<Record<string, readonly string[]>> = {
  "tr-to-nl": ["belge-apostil-tercume"],
  "nl-to-tr": ["belge-apostil-tercume"],
  apostille: ["belge-apostil-tercume"],
  translation: ["belge-apostil-tercume"],
  municipality: ["resmi-basvuru-itiraz"],
  diploma: ["egitim-diploma"],
  company: ["sirket-ticaret"],
  crossborder: ["belge-apostil-tercume", "avrupa-turkiye-hukuki-uzman-koordinasyonu"],
  specialist: ["avrupa-turkiye-hukuki-uzman-koordinasyonu"],
  "rent-repairs": ["konut-kira-sigorta"],
  "unpaid-wages": ["calisma-hayati"],
  "ind-decision-objection": ["resmi-basvuru-itiraz", "vize-oturum-vatandaslik"]
};
