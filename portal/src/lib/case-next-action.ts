import type { Language } from "./avofis-content";
export type ActionSnapshot={status:string;hasAgreement:boolean;agreementSigned:boolean;priceEurCents:number;paid:boolean;hasPendingDocuments:boolean};
const sentences={
tr:{closed:"Dosya kapatıldı. Gerekirse dosya mesajlarını kullanabilirsiniz.",completed:"İşlem tamamlandı olarak kaydedildi. Sonuç belgelerini ve dosya geçmişini kontrol edin.",review:"Ön inceleme sürüyor. Şu anda sizden kayıtlı bir işlem beklenmiyor.",notReady:"Hizmet kapsamı ve sözleşme hazırlanıyor. Sözleşme sunulmadan onay veya ödeme istenmez.",accept:"Sözleşmenizi okuyup uygun görürseniz hesabınızdan kabul edin.",both:"İstenen belgeler ve doğrulanmış ödeme kaydı bekleniyor. Belge ve ödeme bölümlerini inceleyin.",documents:"Dosyanız için belge talebi bulunuyor. İstenen belgeleri ve teslim durumunu kontrol edin.",payment:"Ücretli dosyanın doğrulanmış ödeme kaydı henüz yok. Ödeme bölümünü kontrol edin.",working:"İşleminiz sürüyor. Yeni bir işlem talebi kaydedilmedi; mesajları ve geçmişi takip edebilirsiniz.",unknown:"Dosyanın sonraki aşaması henüz kaydedilmedi. Dosya sorumlusuna mesaj gönderebilirsiniz."},
nl:{closed:"Het dossier is gesloten. Gebruik indien nodig dossierberichten.",completed:"De procedure is als afgerond geregistreerd. Controleer uw opgeleverde documenten en dossiergeschiedenis.",review:"De eerste beoordeling loopt. Er is momenteel geen geregistreerde actie voor u.",notReady:"De opdracht en overeenkomst worden voorbereid. Er wordt geen goedkeuring of betaling gevraagd zonder overeenkomst.",accept:"Lees de overeenkomst en accepteer deze via uw account als u akkoord gaat.",both:"Gevraagde documenten en een bevestigde betaling ontbreken. Controleer de document- en betalingssecties.",documents:"Er zijn documenten opgevraagd. Controleer de vereisten en afleverstatus.",payment:"Er is nog geen bevestigde betaling voor dit betaalde dossier. Bekijk de betalingssectie.",working:"Uw procedure wordt behandeld. Er is geen nieuwe actie voor u geregistreerd. Volg berichten en gebeurtenissen.",unknown:"Er is nog geen volgende stap geregistreerd. Neem contact op via dossierberichten."},
en:{closed:"The case is closed. Use case messages if needed.",completed:"The matter is recorded as completed. Review delivered documents and case history.",review:"Initial review is underway. No action has been recorded for you at this time.",notReady:"The scope and agreement are being prepared. No approval or payment is requested without an agreement.",accept:"Read your agreement and accept it from your account if you agree.",both:"Requested documents and a verified payment are outstanding. Check the documents and payments sections.",documents:"Documents have been requested. Review what is needed and the receipt status.",payment:"No verified payment is recorded for this paid case. Check the payment section.",working:"Your matter is in progress. No new action is recorded for you; follow messages and case history.",unknown:"No next step has been recorded yet. Contact the case operator through case messages."}
};
export function nextCaseAction(s:ActionSnapshot,lang:Language="tr"):string{
 const t=sentences[lang];
 if(s.status==="closed")return t.closed;
 if(s.status==="completed")return t.completed;
 if(s.status==="review")return t.review;
 if(!s.hasAgreement)return t.notReady;
 if(!s.agreementSigned)return t.accept;
 const pending=s.priceEurCents>0&&!s.paid;
 if(s.hasPendingDocuments&&pending)return t.both;
 if(s.hasPendingDocuments)return t.documents;
 if(pending)return t.payment;
 if(s.status==="open")return t.working;
 return t.unknown;
}
