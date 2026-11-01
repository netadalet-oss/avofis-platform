"use client";
import Link from "next/link";
import { useState } from "react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { officialSources } from "@/lib/journey-sources";
import { journeyServiceSlugs } from "@/lib/journey-service-links";
import { SERVICES } from "@/lib/service-catalog";
import type { Journey } from "@/lib/journeys";

const words = {
  tr: { title: "İşleme özel hazırlık soruları", option: "Lütfen seçiniz", count: "Hazırlanan konu",
    summary: "Yerel hazırlık özeti", related: "Konuyla ilgili genel hizmet bilgileri", reset: "Seçimleri sıfırla",
    responsibility: "Görev ve yetki sınırı", source: "Resmî kaynaklar",
    alert: "Bu seçenekler yalnız ekranda tutulur; gerçek başvuru, süre hesabı, hukukî görüş, belge gönderimi veya ücretli hizmet başlatmaz.",
    urgent: "İltica, sınır dışı veya itiraz süresi açısından acil risk varsa derhal yetkili hukuk uzmanına danışın. Bu sayfa süre hesaplamaz.",
    back: "12 işlem rotasına dön", legal: "Yetki ve gizlilik sınırları" },
  nl: { title: "Voorbereidingsvragen", option: "Maak een keuze", count: "Ingevulde onderwerpen",
    summary: "Lokale voorbereidingskeuzes", related: "Gerelateerde algemene diensten", reset: "Keuzes wissen",
    responsibility: "Bevoegdheid en verantwoordelijkheid", source: "Officiële bronnen",
    alert: "Uw keuzes blijven in dit scherm. Er vindt geen aanvraag, termijnberekening, juridisch advies, upload of betaling plaats.",
    urgent: "Bij dringend risico van uitzetting, asiel of een beroepstermijn: neem direct contact op met een bevoegde jurist. Deze pagina berekent geen termijnen.",
    back: "Terug naar 12 procedures", legal: "Bevoegdheid en privacy" },
  en: { title: "Procedure preparation questions", option: "Choose an option", count: "Topics answered",
    summary: "Local preparation selections", related: "Related general service information", reset: "Clear selections",
    responsibility: "Responsibility and authority", source: "Official sources",
    alert: "Selections stay only on this screen. No application, deadline calculation, legal advice, file upload or payment takes place.",
    urgent: "For urgent asylum, removal or appeal deadline risks, contact an authorised legal professional immediately. This page does not calculate deadlines.",
    back: "Back to 12 procedures", legal: "Authority and privacy limits" }
} as const;

/** Local, predefined categorical answers only. No network, free text or persistence. */
export function JourneyPreparationView({ journey }: { journey: Journey }) {
  const lang = usePortalLanguage();
  const t = words[lang];
  const [selected, setSelected] = useState<Record<string, string>>({});
  const count = journey.fields.filter(field =>
    field.options.some(option => option.value === selected[field.key])).length;
  function choose(key: string, value: string) {
    const field = journey.fields.find(item => item.key === key);
    if (!field || (value && !field.options.some(item => item.value === value))) return;
    setSelected(previous => ({ ...previous, [key]: value }));
  }
  return (
    <PageFrame lang={lang} wide eyebrow={journey.title[lang]}
      title={journey.title[lang]} description={journey.audience[lang]}>
      <nav aria-label="İşlem" className="flex flex-wrap gap-5 text-sm">
        <Link href="/islemler" className="text-[#dfbf59] underline">{t.back}</Link>
        <Link href="/uyum" className="text-[#dfbf59] underline">{t.legal}</Link>
      </nav>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section className="avofis-card rounded-[18px] border p-6">
          <h2 className="text-lg font-semibold">{journey.need[lang]}</h2>
          <p className="mt-4 text-sm leading-7 text-[#B9C5DF]">{journey.preparation[lang]}</p>
          <h3 className="mt-5 text-sm font-semibold text-[#E7D08A]">{t.responsibility}</h3>
          <p className="mt-2 text-sm leading-7 text-[#B9C5DF]">{journey.responsibility[lang]}</p>
          <h3 className="mt-5 text-sm font-semibold text-[#E7D08A]">{t.related}</h3>
          <ul className="mt-3 space-y-2">
            {(journeyServiceSlugs[journey.id] ?? []).map(slug => {
              const service = SERVICES.find(item => item.slug === slug);
              return service ? (
                <li key={slug}>
                  <Link href={"/hizmetler/" + slug}
                    className="inline-flex min-h-10 items-center text-sm text-[#dfbf59] underline">
                    {service.title}
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-[#E7D08A]">{t.source}</h3>
          <ul className="mt-3 space-y-3">
            {(officialSources[journey.id] ?? []).map(source => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-[#dfbf59] underline">
                  {source.name[lang]}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="avofis-card rounded-[18px] border p-6"
          aria-labelledby="journey-preparation-fields">
          <h2 id="journey-preparation-fields" className="text-xl font-semibold">{t.title}</h2>
          <p role="status" aria-live="polite" className="mt-3 text-sm text-[#E7D08A]">
            {t.count}: {count} / {journey.fields.length}
          </p>
          <div className="mt-5 space-y-5">
            {journey.fields.map(field => (
              <div key={field.key}>
                <label htmlFor={"journey-" + journey.id + "-" + field.key}
                  className="block text-sm font-semibold">{field.label[lang]}</label>
                <select id={"journey-" + journey.id + "-" + field.key}
                  value={selected[field.key] ?? ""}
                  onChange={event => choose(field.key, event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-lg border border-[#dfbf59]/30 bg-[#071738] px-4 py-2 text-base text-white">
                  <option value="">{t.option}</option>
                  {field.options.map(option => (
                    <option key={option.value} value={option.value}>{option.label[lang]}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button type="button" disabled={count === 0}
            onClick={() => setSelected({})}
            className="mt-6 min-h-11 rounded-lg border border-[#dfbf59]/40 px-4 text-sm text-[#dfbf59] disabled:opacity-40">
            {t.reset}
          </button>
          {count === journey.fields.length && (
            <div role="status" className="mt-6 rounded-xl border border-[#dfbf59]/20 bg-[#071738] p-4">
              <h3 className="text-sm font-semibold text-[#E7D08A]">{t.summary}</h3>
              <dl className="mt-3 space-y-3">
                {journey.fields.map(field => {
                  const option = field.options.find(item => item.value === selected[field.key]);
                  return option ? (
                    <div key={field.key}>
                      <dt className="text-xs text-[#B9C5DF]">{field.label[lang]}</dt>
                      <dd className="text-sm font-semibold">{option.label[lang]}</dd>
                    </div>
                  ) : null;
                })}
              </dl>
            </div>
          )}
        </section>
      </div>
      {journey.id === "ind-decision-objection" && (
        <p role="alert" className="mt-6 rounded-xl border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100">
          {t.urgent}
        </p>
      )}
      <p className="mt-6 rounded-xl border border-amber-300/25 p-5 text-sm leading-7 text-[#B9C5DF]">
        {t.alert}
      </p>
    </PageFrame>
  );
}
