"use client";

import { useState } from "react";
import {
  transitionStaffDemo, staffDemoDisplay, type DemoState
} from "@/lib/staff-synthetic-flow";

/**
 * Interactive whole-product S1 demonstration. No auth, data collection,
 * persistence, provider request, or production API operation.
 */
export function StaffSyntheticDemonstration({ slug }: { slug: string }) {
  const [state, setState] = useState<DemoState>("EMPTY");
  const view = staffDemoDisplay(slug, state);
  function advance(action: "prepare" | "review" | "reset") {
    setState(previous => transitionStaffDemo(slug, previous, action));
  }

  return (
    <section aria-labelledby="demo-heading" className="mt-7 rounded-2xl border border-sky-300/25 bg-white/5 p-6">
      <p className="text-xs font-semibold tracking-[0.12em] text-sky-300">
        Yerel ve sentetik örnek · gerçek veri kullanılmaz
      </p>
      <h2 id="demo-heading" className="mt-3 text-lg font-semibold">Ana işlevin örnek akışı</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">{view.input}</p>
      <div role="status" aria-live="polite" className="mt-5 rounded-xl border border-white/15 bg-[#07111f] p-4">
        <p className="text-xs font-semibold text-sky-300">{view.status}</p>
        <p className="mt-2 text-sm leading-7 text-slate-100">{view.result}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={state !== "EMPTY"} onClick={() => advance("prepare")}
          className="rounded-lg border border-sky-300/40 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          Örnek ana adımı hazırla
        </button>
        <button type="button" disabled={state !== "PREPARED"} onClick={() => advance("review")}
          className="rounded-lg border border-sky-300/40 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          Güvenlik/insan kontrolünü göster
        </button>
        <button type="button" disabled={state === "EMPTY"} onClick={() => advance("reset")}
          className="rounded-lg border border-white/20 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          Sıfırla
        </button>
      </div>
      <p className="mt-4 text-xs leading-6 text-amber-200">
        Bu simülasyondaki düğmeler sadece tarayıcı belleğindeki örnek durumu değiştirir.
        Müşteri, dosya, mesaj, resmî kurum, banka, Supabase veya API ile işlem yapmaz.
      </p>
    </section>
  );
}
