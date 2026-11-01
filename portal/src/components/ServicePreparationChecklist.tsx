"use client";

import { useState } from "react";

/**
 * This is only a local reading checklist. It NEVER indicates legal readiness
 * or customer intake, and it never persists or submits personal information.
 */
export function ServicePreparationChecklist({
  serviceSlug,
  steps
}: {
  serviceSlug: string;
  steps: readonly string[];
}) {
  const [reviewed, setReviewed] = useState<boolean[]>(() => steps.map(() => false));
  const count = reviewed.filter(Boolean).length;
  function toggle(index: number, checked: boolean) {
    setReviewed(previous => previous.map((value, i) => i === index ? checked : value));
  }
  function reset() {
    setReviewed(steps.map(() => false));
  }

  return (
    <section aria-labelledby="preparation-checklist-heading" className="mt-8 rounded-[24px] border border-sky-300/20 bg-white/5 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
        Kişisel verisiz · yalnız bu ekranda
      </p>
      <h2 id="preparation-checklist-heading" className="mt-3 text-xl font-semibold">
        İlk hazırlık adımlarını gözden geçirin
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
        Bunlar yalnız genel bilgilendirme kontrol noktalarıdır. İşaretlemek,
        başvurunun hazır olduğu, sürenin hesaplandığı, hukukî görüş verildiği
        veya bir kurumun kabul şartlarının karşılandığı anlamına gelmez.
      </p>
      <div role="status" aria-live="polite" className="mt-4 text-sm font-semibold text-sky-200">
        Bu ekranda gözden geçirilen adım: {count} / {steps.length}
      </div>
      <ul className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={index}>
            <label className="flex min-h-11 items-start gap-3 rounded-xl border border-white/10 p-3 text-sm leading-7">
              <input type="checkbox" checked={Boolean(reviewed[index])}
                onChange={event => toggle(index, event.target.checked)}
                aria-label={"Hazırlık adımı " + (index + 1)}
                className="mt-1 h-5 w-5 shrink-0 accent-sky-300"/>
              <span>{step}</span>
            </label>
          </li>
        ))}
      </ul>
      <button type="button" onClick={reset} disabled={count === 0}
        className="mt-5 rounded-xl border border-sky-300/40 px-5 py-3 text-sm font-semibold text-sky-200 disabled:cursor-not-allowed disabled:opacity-40">
        Seçimleri sıfırla
      </button>
      <p className="mt-4 text-xs leading-6 text-amber-200">
        Hizmet alanı: {serviceSlug}. Hiçbir seçim AVOfis'e gönderilmez veya kaydedilmez;
        yeniden yükleyince silinir. Gizli müvekkil verilerini bu sayfaya yazmayın.
      </p>
    </section>
  );
}
