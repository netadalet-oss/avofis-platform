/** Source-derived NL editorial guide index.
 * Reference: AVOfis_16_Hukuk_Rehberi_NL_Yapilandirilmis_v10_2026-10-29.json
 * This is NOT a legal/publication signoff; content access is gated separately.
 */
export type GuideRecord={
 number:number;slug:string;titleNl:string;introNl:string;
 relatedService:string;officialSourceUrl:string;sourceChecked:"2026-10-29";
 legalReview:"pending";nativeReview:"pending";published:false;
};
export const guideSourceVersion="AVOfis NL v10 / 2026-10-29" as const;
const g=(number:number,slug:string,titleNl:string,introNl:string,relatedService:string,officialSourceUrl:string):GuideRecord=>({
 number,slug,titleNl,introNl,relatedService,officialSourceUrl,
 sourceChecked:"2026-10-29",legalReview:"pending",nativeReview:"pending",published:false
});
export const legalGuides:readonly GuideRecord[]=[
 g(1,"jurist-advocaat-farki","Wat is het verschil tussen een jurist en een advocaat in Nederland?",
  "Niet iedere juridische activiteit is voorbehouden aan een advocaat. De juiste bevoegdheid hangt af van de procedure, instantie en soort werkzaamheden.","hukuki-danismanlik",
  "https://www.rechtspraak.nl/naar-de-rechter/rol-in-rechtszaak/gemachtigde/gemachtigde-bestuursrecht"),
 g(2,"bezwaar-beroep","Bezwaar of beroep tegen een besluit: wat is het verschil?",
  "Bij veel bestuursbesluiten gaat bezwaar bij de besluitvormende instantie aan beroep bij de bestuursrechter vooraf. Bijzondere procedures kunnen hiervan afwijken.","resmi-basvuru-itiraz",
  "https://www.rijksoverheid.nl/themas/overheid-en-democratie/bezwaar-en-beroep/vraag-en-antwoord/bezwaar-en-beroep/bezwaar-tegen-beslissing-overheid"),
 g(3,"tebligat-tarihi","Waarom is de datum van bekendmaking van een besluit zo belangrijk?",
  "De datum op een brief, de verzending en de juridische bekendmaking hoeven niet samen te vallen. De juiste termijn moet per procedure worden gecontroleerd.","resmi-basvuru-itiraz",
  "https://www.rijksoverheid.nl/themas/overheid-en-democratie/bezwaar-en-beroep/vraag-en-antwoord/bezwaar-en-beroep/bezwaar-tegen-beslissing-overheid"),
 g(4,"kantonrechter-temsil","Kantonrechter: wanneer hebt u een advocaat nodig?",
  "Kantonzaken verschillen van andere civiele en bestuursrechtelijke procedures. Zelf optreden of een gemachtigde kiezen kan alleen binnen de toepasselijke procesregels.","mahkeme-temsil",
  "https://www.rechtspraak.nl/naar-de-rechter/om-toestemming-vragen/verzoekschrift-indienen-kantonrechter"),
 g(5,"vso-ilk-kontrol","Vaststellingsovereenkomst ontvangen: wat controleert u vóór ondertekening?",
  "Een beëindigingsovereenkomst kan gevolgen hebben voor loon, uitkering, ziekte en finale kwijting. Controleer de afspraken vóór ondertekening.","calisma-hayati",
  "https://www.rijksoverheid.nl/themas/werk/ontslag/nieuwe-regels-ontslagrecht"),
 g(6,"depozito-onarim","Huurwaarborg, gebreken en huurverhoging: welke stappen zijn mogelijk?",
  "Waarborgsom, gebreken, huurprijs en servicekosten vereisen elk hun eigen bewijs en procedure. De Huurcommissie behandelt niet automatisch ieder huurgeschil.","konut-kira-sigorta",
  "https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/woning-huren/woning-huren-waarborgsom"),
 g(7,"incasso-deurwaarder","Incassobureau, schuldeiser en gerechtsdeurwaarder: wat is het verschil?",
  "Een schuldeiser, incassobureau en gerechtsdeurwaarder hebben verschillende posities. Een aanmaning geeft niet op zichzelf de bevoegdheid tot beslag.","alacak-takibi",
  "https://www.justis.nl/nieuws/07-10-2026-artikel-18-van-de-wet-kwaliteit-incassodienstverlening-sinds-1-oktober-2026-van-kracht"),
 g(8,"ind-karar-ret","IND-besluit ontvangen: bezwaar, beroep en vertegenwoordiging onderscheiden",
  "Een regulier verblijfsbesluit verschilt van een asielbesluit. Rechtsmiddel, verblijfseffecten en vertegenwoordiging worden per besluit en procedure bepaald.","vize-oturum-vatandaslik",
  "https://ind.nl/nl/na-uw-aanvraag/bezwaar-maken-of-in-beroep-gaan"),
 g(9,"avrupa-yetkili-mahkeme","Een conflict in twee Europese landen: welke rechter is bevoegd?",
  "Bij grensoverschrijdende geschillen spelen woonplaats, overeenkomst, uitvoering en soort vordering een rol. Rechterlijke bevoegdheid en toepasselijk recht zijn niet hetzelfde.","avrupa-ici-islemler",
  "https://commission.europa.eu/law/cross-border-cases/competent-courts-cross-border-disputes_en"),
 g(10,"kvk-noter-vergi","Een onderneming in Nederland starten: wat doen KVK, notaris en Belastingdienst?",
  "Inschrijving, oprichting van een bv, belastingregistratie en het recht om te werken zijn afzonderlijke vragen. Voor een bv heeft de notaris een eigen rol.","sirket-ticaret",
  "https://www.kvk.nl/inschrijven/inschrijven-besloten-vennootschap-of-naamloze-vennootschap-in-oprichting/"),
 g(11,"sozlesme-on-kontrol","Een overeenkomst ondertekenen: welke bepalingen controleert u eerst?",
  "Let op betalingsafspraken, opzegging, aansprakelijkheid, rechtskeuze en bevoegde rechter. Voor consumenten en professionele partijen kunnen andere regels gelden.","sozlesmeler-uyusmazliklar",
  "https://commission.europa.eu/law/cross-border-cases/competent-courts-cross-border-disputes_en"),
 g(12,"uwv-svb-toeslagen","Een beslissing van UWV, SVB of Dienst Toeslagen: welke route past?",
  "UWV, SVB en Dienst Toeslagen hanteren niet automatisch dezelfde procedures. Grensoverschrijdende sociale zekerheid vraagt bovendien een landgebonden beoordeling.","sosyal-guvenlik-vergi",
  "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/niet_met_ons_eens_toeslagen/bezwaar_maken/"),
 g(13,"apostil-tercume","Apostille, legalisatie en beëdigde vertaling: wat is echt nodig?",
  "Welke documenten gelegaliseerd of vertaald moeten worden hangt af van de ontvangende instantie en landen. Een apostille bewijst niet de inhoudelijke geldigheid.","belge-apostil-tercume",
  "https://e-justice.europa.eu/topics/taking-legal-action/european-judicial-atlas-civil-matters/public-documents_en"),
 g(14,"turkiye-karar-hollanda","Een Turkse of andere buitenlandse uitspraak gebruiken in Nederland: welke vragen spelen?",
  "Erkenning en tenuitvoerlegging van buitenlandse uitspraken zijn verschillende juridische vragen. Voor EU-landen en derde landen gelden niet altijd dezelfde regels.","avrupa-turkiye-hukuki-uzman-koordinasyonu",
  "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBROT%3A2024%3A8639"),
 g(15,"aihm-basvuru","Een klacht bij het EHRM of een VN-comité: waar begint de beoordeling?",
  "Internationale mensenrechteninstanties hebben verschillende bevoegdheden en toelatingseisen. Een negatieve nationale uitspraak is niet automatisch een ontvankelijke klacht.","uluslararasi-insan-haklari",
  "https://www.echr.coe.int/apply-to-the-court"),
 g(16,"uzman-veri-paylasim","Een dossier delen met een onafhankelijke juridische specialist: wat moet vooraf duidelijk zijn?",
  "De betrokkene moet weten wie verantwoordelijk is, voor welk doel gegevens gedeeld worden en wie bevoegd is. Een verwijzing is geen aangetoonde opdracht of beroepskwalificatie.","avrupa-turkiye-hukuki-uzman-koordinasyonu",
  "https://autoriteitpersoonsgegevens.nl/themas/internationaal/doorgifte-binnen-en-buiten-de-eer/doorgifte-persoonsgegevens-buiten-de-eer")
] as const;
/** Editorial preview must never be enabled on a production deployment. */
export function guideEditorialPreviewAllowed(env:Record<string,string|undefined>):boolean{
 return env.AVOFIS_EDITORIAL_GUIDE_PREVIEW==="true"&&
  env.VERCEL_ENV!=="production"&&env.AVOFIS_LEGAL_READY!=="true"&&
  env.AVOFIS_EDITORIAL_REVIEW_MODE==="unapproved";
}
