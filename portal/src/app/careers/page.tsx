"use client";

import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  createCareerItem, filterCareerItems, removeCareerItem, updateCareerStage,
  type CareerItem, type ApplicationStage
} from "@/lib/local-careers";

const stages: Array<{ id: ApplicationStage; label: string }> = [
  { id: "saved", label: "Kaydedildi" },
  { id: "applied", label: "Başvurdum (manuel)" },
  { id: "interview", label: "Görüşme" },
  { id: "closed", label: "Kapandı" }
];

export default function CareersPage() {
  const [items, setItems] = useState<CareerItem[]>([]);
  const [organization, setOrganization] = useState("");
  const [position, setPosition] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ApplicationStage | "all">("all");
  const [message, setMessage] = useState("");
  const next = useRef(1);
  const shown = filterCareerItems(items, search, filter);

  function add() {
    const item = createCareerItem(items, String(next.current), organization, position, sourceUrl);
    if (!item) {
      setMessage("Kurum, pozisyon veya bağlantı geçersiz; en fazla 30 kayıt eklenebilir.");
      return;
    }
    next.current += 1;
    setItems((old) => [...old, item]);
    setOrganization("");
    setPosition("");
    setSourceUrl("");
    setMessage("Fırsat geçici takip listesine eklendi; başvuru gönderilmedi.");
  }
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16">
        <h1 className="text-3xl font-semibold text-white">Staj ve Kariyer — Kişisel Takip</h1>
        <p className="mt-4 text-slate-300">Kendinizin bulduğu ilanları ve başvurularınızı geçici olarak düzenleyin.</p>
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Bu sayfa gerçek iş ilanlarını taramaz veya başvuru göndermez. Başvuru durumu
          yalnızca sizin işaretlemenizle değişir. Bilgiler sunucuya gönderilmez;
          sayfayı yenileyince kaybolur. Kişisel ve gizli başvuru belgeleri eklemeyin.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Takip listesine ekle</h2>
            <label htmlFor="career-org" className="mt-5 block text-sm">Kurum veya büro</label>
            <input id="career-org" value={organization} maxLength={140} onChange={(e)=>setOrganization(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <label htmlFor="career-position" className="mt-4 block text-sm">Pozisyon</label>
            <input id="career-position" value={position} maxLength={140} onChange={(e)=>setPosition(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <label htmlFor="career-url" className="mt-4 block text-sm">İlan bağlantısı (isteğe bağlı)</label>
            <input id="career-url" type="url" value={sourceUrl} maxLength={1000} onChange={(e)=>setSourceUrl(e.target.value)}
              placeholder="https://..." className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <button type="button" onClick={add}
              className="mt-5 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">Listeye ekle</button>
            {message ? <p role="status" className="mt-3 text-sm text-sky-200">{message}</p> : null}
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Fırsat ve başvuru takibi</h2>
            <label htmlFor="career-search" className="mt-4 block text-sm">Listemde ara</label>
            <input id="career-search" value={search} onChange={(e)=>setSearch(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <label htmlFor="career-filter" className="mt-4 block text-sm">Başvuru durumu</label>
            <select id="career-filter" value={filter} onChange={(e)=>setFilter(e.target.value as ApplicationStage | "all")}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-white">
              <option value="all">Tümü</option>
              {stages.map((s)=><option value={s.id} key={s.id}>{s.label}</option>)}
            </select>
            <p className="mt-4 text-sm text-slate-300">{shown.length} görünen / {items.length} geçici kayıt</p>
            <ul className="mt-4 space-y-3">
              {shown.map((item)=>(
                <li key={item.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="font-semibold">{item.position}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.organization}</p>
                  {item.sourceUrl ? <a className="mt-2 block break-all text-sm text-sky-300 underline" href={item.sourceUrl}
                    target="_blank" rel="noopener noreferrer">İlan kaynağını aç</a> : null}
                  <label htmlFor={"career-status-"+item.id} className="mt-4 block text-sm">Benim takip durumum</label>
                  <select id={"career-status-"+item.id} value={item.stage}
                    onChange={(e)=>setItems((old)=>updateCareerStage(old,item.id,e.target.value as ApplicationStage))}
                    className="mt-2 w-full rounded-lg border border-white/20 bg-slate-950 p-2">
                    {stages.map((s)=><option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <button type="button" onClick={()=>setItems((old)=>removeCareerItem(old,item.id))}
                    className="mt-3 rounded-lg border border-rose-400/40 px-3 py-2 text-sm text-rose-200">Listeden çıkar</button>
                </li>
              ))}
            </ul>
            {shown.length===0 ? <p className="mt-4 text-sm text-slate-400">Bu filtrede kayıt bulunamadı.</p> : null}
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
