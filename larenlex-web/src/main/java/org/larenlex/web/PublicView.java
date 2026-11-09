package org.larenlex.web;

import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.orderedlayout.FlexLayout;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;

/**
 * LarenLex public, service-first W1 landing.
 * Internal technical modules are NEVER displayed as public legal services.
 * This W1 page links to the separately hosted, clickable 554-service preview.
 * The actual v86 source import and live user workflows remain W1 acceptance work.
 */
@Route("")
@AnonymousAllowed
public class PublicView extends VerticalLayout {
  private static final String PREVIEW =
    "https://larenlex-hizmetler-w1-onizleme.vercel.app/";
  private static final String[] SERVICES = {
    "Sözleşmeler, dilekçeler ve hukukî belgeler",
    "Tüketici hakları, alışveriş ve abonelikler",
    "Şikâyet, itiraz, uzlaşma ve temsil",
    "İş, çalışma ve ücret hakları",
    "Sosyal yardımlar, emeklilik ve sigorta",
    "Aile, nüfus, miras ve ölüm işlemleri",
    "Oturum, vize ve aile birleşimi",
    "Uluslararası evrak, apostil ve tercüme",
    "Banka, kredi, borç ve alacak",
    "Kira, konut ve gayrimenkul",
    "Eğitim, diploma ve sağlık işlemleri",
    "Vergi, kamu kurumları ve idarî itirazlar",
    "Kişisel veriler ve dijital haklar",
    "Türkiye – Avrupa resmî işlemleri",
    "Araç, ulaşım ve seyahat sorunları",
    "Şirket kuruluşu, işletme ve ticaret",
    "İthalat, ihracat, gümrük ve pazar bulma"
  };

  public PublicView() {
    setWidthFull();
    addClassName("shell");
    H1 title = new H1("LarenLex");
    title.getStyle().set("color", "#f0d56d");
    add(title,
      new H2("Hukukî ve idarî işiniz için doğru hizmete ulaşın"),
      new Paragraph("Hollanda, Türkiye, Almanya, Belçika ve diğer ülkelerle bağlantılı işlemler için hizmetleri inceleyin; kapsam ve başvuru yolunu öğrenin."),
      new Paragraph("554 gerçek hizmet başlığı, 17 konu alanında aranabilir. Her talep ücret alınmadan önce yetki ve uygunluk kontrolünden geçer."),
      new Anchor(PREVIEW, "554 hukukî hizmeti incele →"));

    FlexLayout grid = new FlexLayout();
    grid.setFlexWrap(FlexLayout.FlexWrap.WRAP);
    grid.getStyle().set("gap", "12px").set("padding", "18px 0");
    for (String service : SERVICES) {
      Div tile = new Div();
      tile.addClassName("card");
      tile.getStyle().set("width", "280px").set("padding", "18px");
      tile.add(new H3(service),
        new Paragraph("Bu alandaki hizmetleri, belgeleri ve başvuru yolunu görüntüleyin."),
        new Anchor(PREVIEW + "#hizmetler", "Hizmetleri gör →"));
      grid.add(tile);
    }
    add(new H3("Hangi konuda yardımcı olabiliriz?"), grid);
    add(new H3("İş talebinden teslime"),
      new Paragraph("Hizmeti seçin → işinizi ve bütçenizi bildirin → ücretsiz uygunluk incelemesi → teklif ve sözleşme → dosya takibi → iş teslimi ve fatura."),
      new Paragraph("Bu W1 önizlemesi canlı başvuru, ödeme veya resmî kurum işlemi yapmaz. Hukukî onayı bulunmayan kaynaklar otomatik yayınlanmaz."));
  }
}
