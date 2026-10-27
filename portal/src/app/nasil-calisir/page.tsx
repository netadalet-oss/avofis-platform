"use client";

import Link from "next/link";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

const content={
 tr:{eyebrow:"NASIL ÇALIŞIR?",title:"Başvurudan sonucun teslimine",intro:"Her dosyanın aşamaları hizmet kapsamına göre belirlenir. Gerekli olmayan aşamalar tamamlanmış gibi gösterilmez.",steps:[
 ["Başvuru alındı","İşlem türü ve temel iletişim bilgileri alınır. İlk aşamada hassas belge istenmez."],
 ["Ön inceleme","İşlemin kapsamı, kullanılacağı ülke ve yetkili kurumlar değerlendirilir."],
 ["Hizmet teklifi","Hizmet bedeli, resmî harçlar, olası KDV, üçüncü kişi giderleri ve sorumluluklar ayrı açıklanır."],
 ["Sözleşme ve onay","Müşteri kapsamı, koşulları ve sözleşme sürümünü görüp uygun yöntemle kabul eder."],
 ["Ödeme ve gerekli belgeler","Yalnızca onaylanan iş için gerekli ödeme ve belgeler talep edilir."],
 ["İşlem yürütülüyor","Sorumlu kişi veya bağımsız yetkili uzman ilgili işlemleri yürütür. Dosya durumu gerçek kayıtlara dayanır."],
 ["Sonuç teslim edildi","Sonuç, varsa ilgili dosyalar ve tamamlanan adımlar müşteri alanında gösterilir."]
 ],note:"Ücret veya belge gönderimi yalnızca yetkilendirilmiş işlem kapsamında talep edilir. Bir dosyada bazı aşamalar uygulanmayabilir.",back:"Hizmetleri inceleyin"},
 nl:{eyebrow:"HOE WERKT HET?",title:"Van aanvraag tot levering",intro:"De stappen verschillen per opdracht. Niet-toepasselijke fasen worden niet als voltooid weergegeven.",steps:[
 ["Aanvraag ontvangen","Wij nemen het type verzoek en basiscontactgegevens op, zonder gevoelige documenten."],
 ["Eerste beoordeling","Wij bepalen de reikwijdte, betrokken landen en bevoegde instanties."],
 ["Voorstel","Dienstvergoeding, leges, toepasselijke btw, derdenkosten en verantwoordelijkheden worden apart weergegeven."],
 ["Overeenkomst en akkoord","De klant beoordeelt de voorwaarden en versie van de overeenkomst en geeft passend akkoord."],
 ["Betaling en benodigde documenten","Alleen betalingen en documenten die nodig zijn voor de overeengekomen opdracht worden gevraagd."],
 ["Uitvoering","De verantwoordelijke medewerker of bevoegde onafhankelijke specialist voert de procedure uit. Status is gebaseerd op werkelijke registraties."],
 ["Resultaat geleverd","Het resultaat, relevante documenten en werkelijk afgeronde stappen worden in het klantdossier beschikbaar gemaakt."]
 ],note:"Betaling en documenten worden pas binnen een bevoegde opdracht gevraagd. Niet alle stappen zijn altijd nodig.",back:"Bekijk de diensten"},
 en:{eyebrow:"HOW IT WORKS",title:"From enquiry to delivery",intro:"Stages depend on the agreed scope. Stages that do not apply are never presented as completed.",steps:[
 ["Enquiry received","The service type and basic contact details are collected, without sensitive documents."],
 ["Initial review","Scope, countries involved and competent authorities are assessed."],
 ["Service proposal","Service charges, official fees, applicable VAT, third-party costs and responsibilities are explained separately."],
 ["Agreement and acceptance","The client reviews the scope, terms and agreement version before providing appropriate acceptance."],
 ["Payment and required documents","Only payments and documents needed for the agreed work are requested."],
 ["Processing","The responsible staff member or authorised independent professional performs the work. Status reflects recorded events."],
 ["Result delivered","The outcome, relevant documents and completed steps are displayed in the client's case."]
 ],note:"Documents or payments are only requested within an authorised matter. Not all stages apply to every case.",back:"Explore services"}
};
export default function ProcessPage(){
 const lang=usePortalLanguage(),t=content[lang];
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro} wide>
   <ol className="grid gap-3 md:grid-cols-2">
     {t.steps.map(([title,description],i)=><li key={title} className="avofis-card flex items-start gap-4 rounded-[18px] border p-5 sm:p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#dfbf59]/30 bg-[#071738] text-[14px] font-semibold text-[#dfbf59]">{i+1}</span><div><h2 className="text-[17px] font-semibold">{title}</h2><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{description}</p></div></li>)}
   </ol>
   <p className="mt-6 text-[14px] leading-7 text-[#B9C5DF]">{t.note}</p>
   <Link href={"/hizmetler?lang="+lang} className="avofis-outline avofis-btn mt-5">{t.back}</Link>
 </PageFrame>;
}
