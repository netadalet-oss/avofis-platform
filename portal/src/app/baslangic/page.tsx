"use client";

import { useMemo, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  countries, issues, createPreparation, createPreparationText,
  type PreparationInput, type Country, type IssueId, type UserSide, type Answer
} from "@/lib/intake-preparation";

const initial: PreparationInput = {
  country: "NL", issue: "employment", side: "person", otherCountry: "NONE",
  decisionReceived: "unknown", timeConcern: "unknown"
};

const formField = "w-full rounded-xl border border-white/15 bg-[#0c1a2e] px-4 py-3 text-base text-white outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-300/30";
const fieldLabel = "mb-2 block text-sm font-medium text-slate-100";

export default function BaslangicPage() {
  const [answers, setAnswers] = useState<PreparationInput>(initial);
  const [downloadMessage, setDownloadMessage] = useState("");
  const result = useMemo(() => createPreparation(answers), [answers]);

  function update<K extends keyof PreparationInput>(key: K, value: PreparationInput[K]) {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setDownloadMessage("");
  }

  function downloadSummary() {
    const text = createPreparationText(answers);
    const blob = new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "avofis-kisisel-verisiz-hazirlik-ozeti.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadMessage("Özet yalnızca cihazınıza indirildi; AVOfis'e gönderilmedi.");
  }

  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-10 md:py-16">
        <div className="mb-8 max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Genel bilgi ve hazırlık</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Sorununuza göre başlayın</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Ülkeyi ve yaşadığınız konuyu seçerek hangi bilgileri kontrol etmeniz gerektiğini öğrenin.
            Bu ekran sizden isim, kimlik, dosya numarası veya belge istemez.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100" role="note">
          <strong>Önemli:</strong> AVOfis henüz kuruluş ve fizibilite aşamasındadır.
          Bu araç genel hazırlık bilgisidir; kişisel hukukî danışmanlık, avukatlık/temsil,
          hizmet teklifi veya resmî başvuru değildir. Seçimleriniz sunucuya gönderilmez ve bu sayfada saklanmaz.
          Acil bir resmî süre varsa yetkili kurum veya yetkili hukuk profesyoneliyle doğrudan görüşün.
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <form className="rounded-[26px] border border-white/10 bg-white/5 p-5 md:p-7" onSubmit={(event) => event.preventDefault()}>
            <h2 className="text-xl font-semibold">1. Konunuzu belirleyin</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Buraya isim, e-posta, kişisel açıklama veya gizli evrak yazmayın.</p>

            <div className="mt-7 space-y-5">
              <div>
                <label className={fieldLabel} htmlFor="s1-country">İşlem hangi ülkede?</label>
                <select id="s1-country" className={formField} value={answers.country}
                  onChange={(event) => update("country", event.target.value as Country)}>
                  {Object.entries(countries).map(([value, label]) =>
                    <option value={value} key={value}>{label}</option>)}
                </select>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="s1-issue">Sizi en iyi anlatan konu hangisi?</label>
                <select id="s1-issue" className={formField} value={answers.issue}
                  onChange={(event) => update("issue", event.target.value as IssueId)}>
                  {Object.entries(issues).map(([value, issue]) =>
                    <option value={value} key={value}>{issue.label}</option>)}
                </select>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="s1-side">Bu işlemde hangi taraftasınız?</label>
                <select id="s1-side" className={formField} value={answers.side}
                  onChange={(event) => update("side", event.target.value as UserSide)}>
                  <option value="person">Birey / Henüz belli değil</option>
                  <option value="employee">Çalışan</option>
                  <option value="employer">İşveren</option>
                  <option value="tenant">Kiracı</option>
                  <option value="landlord">Ev sahibi</option>
                  <option value="business">İşletme</option>
                </select>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="s1-other-country">Başka bir ülke de ilgili mi?</label>
                <select id="s1-other-country" className={formField} value={answers.otherCountry}
                  onChange={(event) => update("otherCountry", event.target.value as Country | "NONE")}>
                  <option value="NONE">Hayır / Bilmiyorum</option>
                  {Object.entries(countries).map(([value, label]) =>
                    <option value={value} key={value}>{label}</option>)}
                </select>
              </div>

              <fieldset className="rounded-xl border border-white/10 p-4">
                <legend className="px-1 text-sm font-medium">Bir kurum veya mahkemeden resmî karar aldınız mı?</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {([["yes", "Evet"], ["no", "Hayır"], ["unknown", "Emin değilim"]] as const).map(([value, label]) =>
                    <label className="flex items-center gap-2 text-sm" key={value}>
                      <input type="radio" name="official-decision" value={value}
                        checked={answers.decisionReceived === value}
                        onChange={() => update("decisionReceived", value as Answer)} />
                      {label}
                    </label>)}
                </div>
              </fieldset>

              <fieldset className="rounded-xl border border-white/10 p-4">
                <legend className="px-1 text-sm font-medium">İtiraz, duruşma veya başka bir süre endişesi var mı?</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {([["yes", "Evet"], ["no", "Hayır"], ["unknown", "Emin değilim"]] as const).map(([value, label]) =>
                    <label className="flex items-center gap-2 text-sm" key={value}>
                      <input type="radio" name="time-concern" value={value}
                        checked={answers.timeConcern === value}
                        onChange={() => update("timeConcern", value as Answer)} />
                      {label}
                    </label>)}
                </div>
              </fieldset>

              <button type="button" onClick={() => { setAnswers(initial); setDownloadMessage(""); }}
                className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                Seçimleri sıfırla
              </button>
            </div>
          </form>

          <div className="rounded-[26px] border border-sky-400/20 bg-[#10213a]/70 p-5 md:p-7" aria-live="polite">
            <h2 className="text-xl font-semibold">2. Hazırlık rehberiniz</h2>
            <p className="mt-2 text-sm text-slate-300">{result.countryLabel} · {result.relatedService}</p>
            <p className="mt-4 text-sm leading-7 text-slate-200">{result.description}</p>

            {result.needsPromptHumanReview ? (
              <div role="alert" className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
                Resmî karar veya süre ihtimali söz konusu olabilir. Bu araç kesin başvuru günü hesaplamaz.
                Yetkili kurumun bildirimini gecikmeden kontrol edin ve gerekirse bağımsız yetkili hukuk profesyoneline başvurun.
              </div>
            ) : null}

            <h3 className="mt-7 font-semibold">Önce kontrol edilecekler</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-200">
              {result.requiredChecks.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <h3 className="mt-7 font-semibold">Sonraki güvenli adımlar</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-200">
              {result.nextSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>

            <h3 className="mt-7 font-semibold">Resmî kaynaklara başlangıç</h3>
            {result.officialSources.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {result.officialSources.map((source) =>
                  <li key={source.url}><a className="text-sky-300 underline underline-offset-4 hover:text-sky-200"
                    href={source.url} target="_blank" rel="noopener noreferrer">{source.label} (yeni sekme)</a></li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-300">İlgili ülkenin yetkili kurumunu belirleyin; burada ülkeye özgü resmî kaynak henüz tanımlı değil.</p>}

            <div className="mt-8 border-t border-white/10 pt-6">
              <button type="button" onClick={downloadSummary}
                className="w-full rounded-xl bg-sky-200 px-5 py-3 font-semibold text-slate-950 hover:bg-white">
                Hazırlık özetini TXT olarak indir
              </button>
              <p className="mt-3 text-xs leading-6 text-slate-300">
                Yalnız seçtiğiniz genel başlıkları indirir. Gerçek dosya açmaz, otomatik olarak
                hiçbir kuruma veya AVOfis personeline göndermez.
              </p>
              {downloadMessage ? <p className="mt-2 text-xs text-emerald-200" role="status">{downloadMessage}</p> : null}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
