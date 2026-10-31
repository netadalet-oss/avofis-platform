"use client";

import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  createLocalText, excerpt, filterLocalTexts, removeLocalText,
  type LocalText,
} from "@/lib/local-research";

type Props = {
  heading: string;
  summary: string;
  example: string;
};

export function LocalResearchWorkbench({ heading, summary, example }: Props) {
  const [records, setRecords] = useState<LocalText[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const nextId = useRef(1);
  const matches = filterLocalTexts(records, query);

  function addRecord() {
    const proposedId = String(nextId.current);
    const result = createLocalText(records, proposedId, title, body);
    if (!result.item) {
      setMessage(result.error || "Metin eklenemedi.");
      return;
    }
    nextId.current++;
    setRecords((old) => [...old, result.item!]);
    setTitle("");
    setBody("");
    setMessage("Metin bu sayfada geçici olarak eklendi.");
  }

  function removeRecord(id: string) {
    setRecords((old) => removeLocalText(old, id));
    setMessage("Metin geçici listeden çıkarıldı.");
  }

  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16">
        <h1 className="text-3xl font-semibold text-white">{heading}</h1>
        <p className="mt-4 max-w-3xl text-slate-300">{summary}</p>
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Bu çalışma alanı yalnızca bu açık sayfa oturumunda çalışır. Metinler sunucuya
          gönderilmez, hesaba kaydedilmez ve sayfa yenilenince kaybolur. Gerçek hukuk
          veritabanı, otomatik içtihat bulma veya yapay zekâ değerlendirmesi değildir.
          Gizli müvekkil bilgisi girmeyin.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Kendi metnini ekle</h2>
            <label htmlFor="research-title" className="mt-5 block text-sm text-slate-200">Metin başlığı</label>
            <input id="research-title" maxLength={160} value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={example}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-white" />
            <label htmlFor="research-body" className="mt-4 block text-sm text-slate-200">Metnin içeriği</label>
            <textarea id="research-body" rows={9} maxLength={15000} value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Sahip olduğunuz ve kullanmaya yetkili olduğunuz metni buraya yapıştırın."
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-white" />
            <button type="button" onClick={addRecord}
              className="mt-4 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">
              Metni geçici listeye ekle
            </button>
            {message ? <p role="status" className="mt-3 text-sm text-sky-100">{message}</p> : null}
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Metin içinde ara</h2>
            <label htmlFor="research-query" className="mt-5 block text-sm">Aranacak sözcük veya ifade</label>
            <input id="research-query" value={query} maxLength={150}
              onChange={(e) => setQuery(e.target.value)} placeholder="Örn. zamanaşımı"
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-white" />
            <p className="mt-4 text-sm text-slate-300" role="status">
              {matches.length} eşleşen metin / {records.length} geçici metin
            </p>
            <div className="mt-5 space-y-4">
              {matches.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">
                    {excerpt(item.body, query)}
                  </p>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-sky-200">Metnin tamamını göster</summary>
                    <p className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words">{item.body}</p>
                  </details>
                  <button type="button" onClick={() => removeRecord(item.id)}
                    className="mt-4 rounded-lg border border-rose-400/40 px-3 py-2 text-sm text-rose-200">
                    Metni listeden çıkar
                  </button>
                </article>
              ))}
              {records.length === 0 ? <p className="text-sm text-slate-400">Henüz metin eklenmedi.</p> : null}
              {records.length > 0 && matches.length === 0 ? <p className="text-sm text-slate-400">Aramaya uyan metin bulunamadı.</p> : null}
            </div>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
