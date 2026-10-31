"use client";

import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  addVersion, renderDraft, safeTextFilename, validateDraft,
  type DraftFields, type DraftVersion
} from "@/lib/draft-builder";

const empty: DraftFields = {
  title: "", parties: "", facts: "", requests: "", evidence: ""
};

export default function DocumentsPage() {
  const [draft, setDraft] = useState<DraftFields>(empty);
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const nextId = useRef(1);

  function change(field: keyof DraftFields, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setPreview("");
  }
  function makePreview() {
    const problem = validateDraft(draft);
    if (problem) { setMessage(problem); return; }
    setPreview(renderDraft(draft));
    setMessage("Önizleme oluşturuldu; içeriğin hukukî doğruluğunu kullanıcı kontrol etmelidir.");
  }
  function saveVersion() {
    const problem = validateDraft(draft);
    if (problem) { setMessage(problem); return; }
    const content = renderDraft(draft);
    setVersions((previous) => addVersion(previous, nextId.current, content));
    nextId.current += 1;
    setPreview(content);
    setMessage("Taslak sürümü yalnızca bu sayfanın geçici listesine eklendi.");
  }
  function exportText() {
    const problem = validateDraft(draft);
    if (problem) { setMessage(problem); return; }
    const blob = new Blob([renderDraft(draft)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeTextFilename(draft.title);
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Taslak TXT dosyası olarak indirildi; hukuki doğrulama yapılmadı.");
  }

  const fields: Array<{ id: keyof DraftFields; label: string; rows: number }> = [
    { id: "title", label: "Belge başlığı", rows: 1 },
    { id: "parties", label: "Taraflar / muhataplar", rows: 2 },
    { id: "facts", label: "Olaylar ve açıklamalar", rows: 5 },
    { id: "requests", label: "Talepler", rows: 4 },
    { id: "evidence", label: "Deliller / ekler", rows: 3 }
  ];

  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16">
        <h1 className="text-3xl font-semibold text-white">Belge ve Hukuki Taslak Çalışma Masası</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Kendi verdiğiniz bilgilerle başlıklı bir taslak oluşturun, üzerinde değişiklik yapın,
          sürümlerini bu sayfada karşılaştırın veya TXT dosyası olarak dışa aktarın.
        </p>
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Bu araç gerçek mevzuat ya da içtihat kaynağı aramaz, yapay zekâ kullanmaz
          ve metnin hukuken yeterli olduğunu onaylamaz. Bilgiler sunucuya
          gönderilmez veya hesaba kaydedilmez; yenileme sürüm geçmişini siler.
          Gizli müvekkil veya kişisel veri girmeyin.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Metni düzenle</h2>
            {fields.map((field) => (
              <div key={field.id} className="mt-4">
                <label htmlFor={"draft-" + field.id} className="block text-sm text-slate-200">{field.label}</label>
                <textarea
                  id={"draft-" + field.id} rows={field.rows}
                  maxLength={10000} value={draft[field.id]}
                  onChange={(e) => change(field.id, e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-white"
                />
              </div>
            ))}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={makePreview} className="rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950">Taslağı görüntüle</button>
              <button type="button" onClick={saveVersion} className="rounded-xl border border-white/20 px-4 py-3 text-white">Sürüm ekle</button>
              <button type="button" onClick={exportText} className="rounded-xl border border-white/20 px-4 py-3 text-white">TXT indir</button>
            </div>
            <p role="status" className="mt-3 text-sm text-sky-200">{message}</p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Belge önizlemesi</h2>
            <pre className="mt-4 max-h-[38rem] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-sm text-slate-200">{preview || "Önizleme henüz oluşturulmadı."}</pre>
            <h3 className="mt-7 text-lg font-semibold">Bu sayfada kaydedilen sürümler</h3>
            <p className="mt-2 text-sm text-slate-400">En son 12 sürüm, yalnızca açık sekmede.</p>
            <ul className="mt-4 space-y-2">
              {versions.map((version) => (
                <li key={version.id} className="rounded-xl border border-white/10 p-3">
                  <button type="button" onClick={() => setPreview(version.content)}
                    className="text-left text-sm text-sky-200">
                    Sürüm {version.id} — içeriği görüntüle
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
