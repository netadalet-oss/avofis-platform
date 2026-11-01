"use client";

import Link from "next/link";
import { useState } from "react";
import { previewInternalHref, previewSelectionExists } from "@/lib/whole-product-explorer";

type PublicChoice = {
  id: string;
  title: string;
  summary: string;
};

export function WholeProductExplorer({
  services,
  journeys
}: {
  services: readonly PublicChoice[];
  journeys: readonly PublicChoice[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [journeyId, setJourneyId] = useState(journeys[0]?.id ?? "");
  const service = services.find(item => item.id === serviceId);
  const journey = journeys.find(item => item.id === journeyId);
  const validService = previewSelectionExists(serviceId, services);
  const validJourney = previewSelectionExists(journeyId, journeys);

  return (
    <section aria-labelledby="explorer-heading" className="mt-12 rounded-2xl border border-sky-300/20 bg-white/5 p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
        Etkileşimli bütün ürün gezintisi · kişisel veri istenmez
      </p>
      <h2 id="explorer-heading" className="mt-3 text-2xl font-semibold">
        Hizmet ve işlem ana yollarını deneyin
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
        Aşağıdaki iki seçim mevcut genel bilgi sayfalarına götürür.
        Bir hizmet ile işlem arasında hukukî eşleştirme, profesyonel tavsiye,
        gerçek başvuru ya da fiyat teklifi yapılmaz. Seçimler kaydedilmez.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-white/15 bg-[#07111f] p-5">
          <label htmlFor="preview-service" className="block text-sm font-semibold">Hizmet alanını seçin</label>
          <select id="preview-service" value={serviceId} onChange={event => setServiceId(event.target.value)}
            className="mt-3 w-full rounded-xl border border-white/20 bg-[#0e2038] p-3 text-sm text-white">
            {services.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}
          </select>
          {service && validService && <div role="status" className="mt-4">
            <h3 className="font-semibold">{service.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{service.summary}</p>
            <Link className="mt-4 inline-flex min-h-10 items-center text-sm text-sky-200 underline"
              href={previewInternalHref("service", serviceId, services.map(item => item.id))}>
              Bilgilendirme sayfasını aç
            </Link>
          </div>}
        </div>
        <div className="rounded-xl border border-white/15 bg-[#07111f] p-5">
          <label htmlFor="preview-journey" className="block text-sm font-semibold">İşlem rotasını seçin</label>
          <select id="preview-journey" value={journeyId} onChange={event => setJourneyId(event.target.value)}
            className="mt-3 w-full rounded-xl border border-white/20 bg-[#0e2038] p-3 text-sm text-white">
            {journeys.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}
          </select>
          {journey && validJourney && <div role="status" className="mt-4">
            <h3 className="font-semibold">{journey.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{journey.summary}</p>
            <Link className="mt-4 inline-flex min-h-10 items-center text-sm text-sky-200 underline"
              href={previewInternalHref("journey", journeyId, journeys.map(item => item.id))}>
              Genel işlem bilgisine git
            </Link>
          </div>}
        </div>
      </div>
      <p className="mt-5 text-xs leading-6 text-amber-200">
        Bu kontrol yalnız önizleme ve gezintidir. Gerçek dosya, kimlik, süre
        hesabı, dilekçe, temsil, belge gönderimi veya ödeme kabul etmez.
      </p>
    </section>
  );
}
