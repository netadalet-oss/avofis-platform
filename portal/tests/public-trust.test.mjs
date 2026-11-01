import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const nav = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8");
const header = readFileSync(new URL("../src/components/site-header.tsx", import.meta.url), "utf8");

test("canonical public homepage is solely AVOfis 17/14/12 service, audience and journey experience", () => {
  for (const expected of ["SERVICES.map", "audiencesAll.map", "journeys.map",
      "17 hukukî", "14 hedef kitle", "12 işlem", "/baslangic", "/hizmetler", "/uyum"]) {
    assert.ok(home.includes(expected),expected);
  }
  assert.match(home, /kuruluş öncesi geliştirme aşamasındadır/i);
  assert.match(home, /Kişisel belgelerinizi kamu sayfalarına göndermeyin/);
  for (const bad of ["/careers","/forum","/offices","/workspace","Connect Ekonomisi",
    "Forum ve Topluluk", "Kariyer ve Staj", "Ofis Profilleri", "WalletCards",
    "user_metadata", "supabase", "useEditMode", ".upsert("]) {
    assert.equal(home.includes(bad),false,bad);
    assert.equal(nav.includes(bad),false,bad);
    assert.equal(header.includes(bad),false,bad);
  }
});
test("public navigation only links real canonical information pages and does not edit CMS", () => {
  for (const href of ["/hizmetler","/kimler-icin","/islemler","/baslangic",
    "/bilgi","/belge-hazirlik","/uyum","/iletisim"]) {
    assert.ok(nav.includes('href: "'+href+'"'),href);
  }
  assert.match(header,/navigation\.map/);
  for (const forbidden of ["useUser", "EditModeProvider", "supabase", ".from(",
    "onSubmit", "saveVerifiedNavigation", "PUBLIC_CMS_EDITING_ENABLED"]) {
    assert.equal(header.includes(forbidden),false,forbidden);
  }
});


const contact = readFileSync(new URL("../src/app/iletisim/page.tsx", import.meta.url), "utf8");
test("AV-025 / R-087: public contact copy cannot promise an unavailable client inbox", () => {
  for (const text of [
    "Müşteri hesabı ve dosya içi mesajlaşma henüz etkin değildir.",
    "Klantaccounts en dossierberichten zijn nog niet actief.",
    "Client accounts and case messaging are not yet active.",
    "Ön başvuru (kapalı)",
    "Aanvraag (gesloten)",
    "Enquiries (closed)"
  ]) assert.ok(contact.includes(text), "Missing truthful release statement: " + text);
  for (const misleading of [
    "mesajlarınızı dosyanız üzerinden iletebilirsiniz",
    "dan kunt u daarin berichten versturen",
    "you can send messages through that case"
  ]) assert.equal(contact.includes(misleading), false, misleading);
  assert.ok(contact.includes('href={"/basvuru?lang="+lang}'));
  assert.ok(contact.includes('href={"/auth/login?lang="+lang}'));
});


const documentPreparation = readFileSync(new URL("../src/app/belge-hazirlik/page.tsx", import.meta.url), "utf8");
test("AV-049 / R-487: document category and open-security warning follow TR/NL/EN locale", () => {
  for(const item of [
    'tr:{event:"Olay",decision:"Karar"',
    'nl:{event:"Gebeurtenis",decision:"Besluit"',
    'en:{event:"Event",decision:"Decision"',
    'L4 · DOCUMENTVEILIGHEID',
    'L4 · DOCUMENT SAFETY',
    '{names[lang][value]}',
    '{t.risk}'
  ]) assert.ok(documentPreparation.includes(item), "Missing locale-safe copy: "+item);
  assert.equal(documentPreparation.includes('{names[value]}'), false);
  for(const prohibited of ['fetch(', 'localStorage', 'sessionStorage', 'type="file"']) {
    assert.equal(documentPreparation.includes(prohibited),false,"Public preparation must stay non-uploading: "+prohibited);
  }
});
