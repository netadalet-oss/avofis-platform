"use client";

import Link from "next/link";
import { useState } from "react";
import {
  stageTwoJourneyIds, stageTwoRelatedServices,
  type StageTwoAudience, type StageTwoJourney, type StageTwoService
} from "@/lib/stage-two-navigation";

export function StageTwoPublicFlow({ audiences, journeys, services }: {
  audiences: readonly StageTwoAudience[];
  journeys: readonly StageTwoJourney[];
  services: readonly StageTwoService[];
}) {
  const [audienceSlug, setAudienceSlug] = useState(audiences[0]?.slug ?? "");
  const allowedJourneys = stageTwoJourneyIds(audienceSlug, audiences);
  const [journeyId, setJourneyId] = useState("");
  const selectedJourney = journeys.find(item => item.id === journeyId && allowedJourneys.includes(item.id));
  const related = selectedJourney
    ? stageTwoRelatedServices(audienceSlug, selectedJourney.id, audiences, journeys, services)
    : [];

  return (
    <section aria-labelledby="s2-flow-heading" className="rounded-2xl border border-sky-300/25 bg-white/5 p-5 sm:p-8">
      <h2 id="s2-flow-heading" className="text-2xl font-semibold">Giriş → işlem → sonuç</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Kişisel veri girilmez. Eşleştirmeler yalnız genel bilgi navigasyonudur;
        meslekî yetki, başvuru hakkı, süre veya hukukî uygunluk kararı değildir.
      </p>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="s2-audience" className="block text-sm font-semibold">1. Hedef kitle</label>
          <select id="s2-audience" value={audienceSlug}
            onChange={event => { setAudienceSlug(event.target.value); setJourneyId(""); }}
            className="mt-2 min-h-12 w-full rounded-lg border border-white/25 bg-[#10213a] px-4 py-2 text-white">
            {audiences.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="s2-journey" className="block text-sm font-semibold">2. İşlem konusu</label>
          <select id="s2-journey" value={selectedJourney?.id ?? ""}
            onChange={event => setJourneyId(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-white/25 bg-[#10213a] px-4 py-2 text-white">
            <option value="">Konuyu seçin</option>
            {journeys.filter(item => allowedJourneys.includes(item.id)).map(item =>
              <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>
      </div>
      {selectedJourney ? (
        <div role="status" className="mt-7 rounded-xl border border-sky-300/30 p-5">
          <h3 className="text-lg font-semibold">3. Gerçek bilgi ve hazırlık sayfası</h3>
          <Link className="mt-3 inline-flex min-h-11 items-center text-sky-200 underline"
            href={"/islemler/" + selectedJourney.id}>
            {selectedJourney.title} — hazırlık soruları
          </Link>
          <h4 className="mt-5 font-semibold">İlgili genel hizmet sayfaları</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {related.map(item => <li key={item.slug}>
              <Link className="inline-flex min-h-11 items-center text-sm text-sky-200 underline"
                href={"/hizmetler/" + item.slug}>{item.title}</Link>
            </li>)}
          </ul>
          <p className="mt-4 text-xs leading-6 text-amber-200">
            Sonuç: yalnız bilgilendirme. Gerçek müşteri kaydı, belge yükleme,
            ödeme, resmî başvuru ve dış sistem gönderimi kapalı.
          </p>
          <Link href="/uyum" className="mt-3 inline-flex min-h-11 text-sm text-sky-200 underline">
            İşlem ve insan onayı sınırlarını inceleyin
          </Link>
        </div>
      ) : (
        <p role="status" className="mt-7 text-sm text-slate-300">
          Henüz işlem seçilmedi; hiçbir dosya açılmadı veya bilgi gönderilmedi.
        </p>
      )}
      <div className="mt-7 flex flex-wrap gap-5 text-sm">
        <Link href="/hizmetler" className="text-sky-200 underline">17 hizmetin tamamı</Link>
        <Link href="/kimler-icin" className="text-sky-200 underline">14 hedef kitlenin tamamı</Link>
        <Link href="/islemler" className="text-sky-200 underline">12 işlem rotasının tamamı</Link>
        <Link href="/belge-hazirlik" className="text-sky-200 underline">Belge güvenliği</Link>
      </div>
    </section>
  );
}
