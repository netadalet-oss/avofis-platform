export type ActionSnapshot={
 status:string; hasAgreement:boolean; agreementSigned:boolean;
 priceEurCents:number; paid:boolean; hasPendingDocuments:boolean;
};
export function nextCaseAction(s:ActionSnapshot):string{
 if(s.status==="closed")return "Dosya kapatılmış. Sorularınız için dosya mesajlarını kullanabilirsiniz.";
 if(s.status==="completed")return "İşlem tamamlandı olarak kaydedilmiş. Sonuç belgelerini ve dosya geçmişini kontrol edin.";
 if(s.status==="review")return "AVOfis ön inceleme yapıyor. Şu anda sizden kayıtlı bir işlem beklenmiyor.";
 if(!s.hasAgreement)return "Hizmet kapsamı ve sözleşme hazırlanıyor. Sözleşme sunulmadan onay veya ödeme istenmez.";
 if(!s.agreementSigned)return "Sözleşmenizi okuyup uygun görürseniz hesabınızdan kabul edin.";
 const pendingPayment=s.priceEurCents>0&&!s.paid;
 if(s.hasPendingDocuments&&pendingPayment)return "İstenen belgeler ve doğrulanmış ödeme kaydı bekleniyor. Aşağıdaki belge listesi ve ödeme bölümünü inceleyin.";
 if(s.hasPendingDocuments)return "Dosyanız için belge talebi bulunuyor. İstenen belgeleri ve teslim durumunu kontrol edin.";
 if(pendingPayment)return "Ücretli dosyanızın doğrulanmış ödeme kaydı henüz bulunmuyor. Ödeme bölümünü kontrol edin.";
 if(s.status==="open")return "İşleminiz yürütülüyor. Yeni bir işlem talebi kaydedilmedi; mesajları ve geçmişi takip edebilirsiniz.";
 return "Dosyanın sonraki aşaması henüz kaydedilmedi. Dosya sorumlusuna mesaj gönderebilirsiniz.";
}
