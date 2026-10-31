import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SERVICES, findService } from "../src/lib/service-catalog.ts";

const exact = [
 "hukuki-danismanlik", "mahkeme-temsil", "avrupa-turkiye-hukuki-uzman-koordinasyonu",
 "alacak-takibi", "sozlesmeler-uyusmazliklar", "konut-kira-sigorta",
 "ceza-sikayet-trafik", "resmi-basvuru-itiraz", "sosyal-guvenlik-vergi",
 "vize-oturum-vatandaslik", "uluslararasi-insan-haklari", "avrupa-ici-islemler",
 "calisma-hayati", "sirket-ticaret", "uluslararasi-istihdam",
 "belge-apostil-tercume", "egitim-diploma"
];

test("exactly all 17 historical v18 service identifiers are present once", () => {
  assert.equal(SERVICES.length, 17);
  assert.deepEqual(SERVICES.map(x => x.slug), exact);
  assert.equal(new Set(SERVICES.map(x => x.slug)).size, 17);
});

test("every service supplies useful distinct preparation, audience, caveat and country-neutral information", () => {
  for (const x of SERVICES) {
    assert.ok(x.title.length > 9, x.slug);
    assert.ok(x.summary.length > 30, x.slug);
    assert.ok(x.audience.length > 15, x.slug);
    assert.ok(x.preparation.length >= 3, x.slug);
    assert.ok(x.checks.length >= 3, x.slug);
    assert.ok(x.preparation.some(s => s.length > 40), x.slug);
    assert.ok(x.checks.some(s => /yetki|uzman|başvuru|temsil|süre|hukuk|kayıt|vergi|dosya|kimlik|çalışma|ülke/i.test(s)), x.slug);
    assert.equal(findService(x.slug), x);
  }
});

test("no active customer acquisition, guaranteed case results or fabricated fees in service data", () => {
  const text = JSON.stringify(SERVICES);
  assert.doesNotMatch(text, /başvurunuz gönderildi|müşteriniz kabul edildi|ödemeniz alındı|garanti kazan|\b120K\b/i);
  for (const x of SERVICES) {
    assert.ok(x.checks.some(line => /kuruluş öncesi/.test(line)), x.slug);
    assert.ok(x.checks.some(line => /kişisel bilgi/i.test(line)), x.slug);
  }
});

test("unknown, prototype-shaped, and malformed slugs have no matching route", () => {
  for (const slug of ["nonexisting","__proto__","constructor","../../dashboard","X".repeat(110),null,42]) {
    assert.equal(findService(slug), undefined);
  }
});

test("all 17 service pages have a static rendering route and safe public disclosure", () => {
  const page = readFileSync(new URL("../src/app/hizmetler/[slug]/page.tsx", import.meta.url),"utf8");
  assert.match(page,/generateStaticParams/);
  assert.match(page,/dynamicParams = false/);
  assert.match(page,/notFound\(/);
  assert.match(page,/Hizmet durumu: yalnız genel bilgi/);
  assert.match(page,/gizli|Kişisel dosyanızı/i);
  assert.match(page,/\/baslangic/);
  assert.doesNotMatch(page,/fetch\(|supabase|upsert\(/);
});

test("catalog, header and first-stage navigation link users to actual routes", () => {
  const list = readFileSync(new URL("../src/app/hizmetler/page.tsx", import.meta.url),"utf8");
  const nav = readFileSync(new URL("../src/lib/site.ts", import.meta.url),"utf8");
  assert.match(list,/SERVICES\.map/);
  assert.match(list,/\/hizmetler\//);
  assert.match(list,/henüz müşteri kabulü/);
  assert.match(nav,/href: "\/hizmetler"/);
});
