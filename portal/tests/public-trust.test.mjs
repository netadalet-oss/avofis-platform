import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const site = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8");

test("pre-formation warning remains on public home page", () => {
  assert.match(home, /AVOfis kuruluş öncesi geliştirme aşamasındadır/);
  assert.match(home, /henüz aktif hukukî danışmanlık veya dosya kabulü sunmamaktadır/);
  assert.match(home, /\/baslangic/);
});

test("unverified live career figures and claims are no longer shipped as defaults", () => {
  for (const forbidden of ["Canlı metrikler","420+","7.2K+","%68","Doğrulanmış Ofis","Avo Legal Partners","Canlı yapı"]) {
    assert.ok(!home.includes(forbidden), forbidden);
  }
  assert.match(home, /Planlanan kariyer özellikleri/);
  assert.match(home, /Temsili profil/);
  assert.match(home, /Geliştirme örneği/);
});

test("the source tree has no fabricated portal-wide default counts", () => {
  assert.match(site, /export const stats: StatItem\[\] = \[\]/);
  for (const forbidden of ["120K+","5.200+","18K+","1.400+","9.800+"]) {
    assert.ok(!site.includes(forbidden), forbidden);
  }
  assert.ok(!site.includes('href: "#istatistikler"'));
});

test("CMS community cards cannot display old invented counts as proof of public discussions", () => {
  assert.match(home, /Forum henüz kamuya açık değil/);
  for (const forbidden of ["248 başlık","182 başlık","331 başlık","416 başlık"]) {
    assert.ok(!home.includes(forbidden), forbidden);
  }
});
