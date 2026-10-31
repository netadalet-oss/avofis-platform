import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createPreparation, createPreparationText, countries, issues } from "../src/lib/intake-preparation.ts";

const base = {
  country: "NL", issue: "employment", side: "employee",
  otherCountry: "NONE", decisionReceived: "no", timeConcern: "no"
};

test("all twelve initial everyday problem categories provide a real preparation checklist", () => {
  assert.equal(Object.keys(issues).length, 12);
  for (const issue of Object.keys(issues)) {
    const result = createPreparation({ ...base, issue });
    assert.ok(result.issueLabel.length > 12);
    assert.ok(result.relatedService.length > 3);
    assert.ok(result.requiredChecks.length >= 2);
    assert.ok(result.nextSteps.length >= 4);
    assert.match(result.nextSteps.at(-1), /kuruluş\/fizibilite/);
  }
});

test("the countries and official sources never claim verified legal advice", () => {
  assert.equal(Object.keys(countries).length, 5);
  for (const country of Object.keys(countries)) {
    const result = createPreparation({ ...base, country });
    assert.equal(result.countryLabel, countries[country]);
    assert.ok(result.officialSources.every((s) => s.url.startsWith("https://")));
    assert.ok(result.nextSteps.some((s) => /resmî kayna/i.test(s)));
  }
});

test("official decisions and uncertainty trigger an explicit human verification warning", () => {
  for (const decisionReceived of ["yes", "unknown"]) {
    const result = createPreparation({ ...base, decisionReceived });
    assert.equal(result.needsPromptHumanReview, true);
    assert.match(result.nextSteps[0], /süre hesaplamaz/);
  }
  for (const timeConcern of ["yes", "unknown"]) {
    const result = createPreparation({ ...base, timeConcern });
    assert.equal(result.needsPromptHumanReview, true);
  }
});

test("routine request without official decision can avoid needless urgency claim", () => {
  const result = createPreparation(base);
  assert.equal(result.needsPromptHumanReview, false);
  assert.ok(result.nextSteps.every((s) => !s.includes("başvurunuz gönderildi")));
});

test("residence and official decisions always receive elevated human-review guidance", () => {
  for (const issue of ["residence", "official-decision"]) {
    const result = createPreparation({ ...base, issue });
    assert.equal(result.needsPromptHumanReview, true);
  }
});

test("cross-border requests include separate national checks and country sources", () => {
  const result = createPreparation({ ...base, otherCountry: "DE", issue: "cross-border" });
  assert.ok(result.requiredChecks.some((s) => /İki ülkenin/.test(s)));
  assert.ok(result.nextSteps.some((s) => /yerel resmî kaynak/.test(s)));
  assert.equal(result.officialSources.length, 2);
  const duplicates = createPreparation({ ...base, otherCountry: "NL" });
  assert.equal(duplicates.officialSources.length, 1);
});

test("worker, employer, landlord and tenant receive different context reminders", () => {
  for (const side of ["employee", "employer"]) {
    const result = createPreparation({ ...base, side });
    assert.ok(result.requiredChecks.some((s) => /İşçi\/işveren/.test(s)));
  }
  for (const side of ["tenant", "landlord"]) {
    const result = createPreparation({ ...base, side, issue: "housing" });
    assert.ok(result.requiredChecks.some((s) => /kiracı\/ev sahibi/.test(s)));
  }
});

test("the text export is deterministic and does not manufacture a case number or deadline", () => {
  const first = createPreparationText({ ...base, decisionReceived: "yes" });
  assert.equal(first, createPreparationText({ ...base, decisionReceived: "yes" }));
  assert.match(first, /resmî işlem değildir/);
  assert.match(first, /Bu özet mevzuat görüşü/);
  assert.doesNotMatch(first, /dosya\s*numarası:\s*[0-9]/i);
  assert.doesNotMatch(first, /son gün:\s*\d/i);
});

test("invalid input is rejected, never displayed as a valid legal recommendation", () => {
  for (const input of [
    { ...base, country: "XX" },
    { ...base, issue: "fictional" },
    { ...base, side: "admin" },
    { ...base, otherCountry: "XY" },
    { ...base, decisionReceived: "tomorrow" },
    { ...base, timeConcern: "urgent!" },
    null
  ]) {
    assert.throws(() => createPreparation(input), /Geçerli ülke/);
  }
});

test("public page visibly states that data is not submitted and provides client-only download", () => {
  const page = readFileSync(new URL("../src/app/baslangic/page.tsx", import.meta.url), "utf8");
  assert.match(page, /Sorununuza göre başlayın/);
  assert.match(page, /kişisel hukukî danışmanlık/);
  assert.match(page, /Seçimleriniz sunucuya gönderilmez/);
  assert.match(page, /createPreparationText/);
  assert.match(page, /document\.createElement\("a"\)/);
  assert.doesNotMatch(page, /supabase|fetch\(|localStorage|sessionStorage|upsert\(/);
});
