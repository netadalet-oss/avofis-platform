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
    "/bilgi/rehberler","/belge-hazirlik","/uyum","/iletisim"]) {
    assert.ok(nav.includes('href: "'+href+'"'),href);
  }
  assert.match(header,/navigation\.map/);
  for (const forbidden of ["useUser", "EditModeProvider", "supabase", ".from(",
    "onSubmit", "saveVerifiedNavigation", "PUBLIC_CMS_EDITING_ENABLED"]) {
    assert.equal(header.includes(forbidden),false,forbidden);
  }
});
