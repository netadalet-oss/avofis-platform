"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import type { LarenCategory, LarenJurisdiction } from "@/lib/laren";

function NewRequestForm() {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<LarenCategory>("administrative");
  const [jurisdiction, setJurisdiction] = useState<LarenJurisdiction>("NL_TR");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!accepted) { setError("Bilgilendirme metnini okuyup onaylayın."); return; }
    setSubmitting(true);
    setError("");
    try {
      const { data, error: insertError } = await supabase.from("laren_requests").insert({
        owner_user_id: user.id,
        contact_name: name.trim(),
        contact_email: (email || user.email || "").trim(),
        category,
        jurisdiction,
        subject: subject.trim(),
        description: description.trim(),
      }).select("id").single();
      if (insertError) throw insertError;
      router.push(`/laren/my/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Başvuru kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  const input = "mt-2 w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-white";
  return (
    <section className="container-shell py-12">
      <Link href="/laren" className="text-sm text-slate-400 hover:text-white">← LAREN ana sayfası</Link>
      <div className="mt-6 max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-10">
        <h1 className="text-3xl font-semibold text-white">Yeni işlem başvurusu</h1>
        <p className="mt-3 text-slate-300">Başvurunuz LAREN ekibine iletilir. Avukatlık hizmeti için bu form üzerinden sözleşme kurulmaz.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-slate-200">Ad soyad
              <input className={input} value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={150} required />
            </label>
            <label className="text-sm text-slate-200">E-posta
              <input className={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={user?.email || ""} required={!user?.email} maxLength={254}/>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-slate-200">Hizmet türü
              <select className={input} value={category} onChange={e=>setCategory(e.target.value as LarenCategory)}>
                <option value="administrative">İdari işlem desteği</option>
                <option value="commercial">Ticari operasyon</option>
                <option value="legal_coordination">Bağımsız avukatla koordinasyon</option>
              </select>
            </label>
            <label className="text-sm text-slate-200">İlgili ülke
              <select className={input} value={jurisdiction} onChange={e=>setJurisdiction(e.target.value as LarenJurisdiction)}>
                <option value="NL">Hollanda</option>
                <option value="TR">Türkiye</option>
                <option value="NL_TR">Hollanda ve Türkiye</option>
              </select>
            </label>
          </div>
          <label className="block text-sm text-slate-200">Konu
            <input className={input} value={subject} onChange={e=>setSubject(e.target.value)} minLength={5} maxLength={160} required />
          </label>
          <label className="block text-sm text-slate-200">İşlemin açıklaması
            <textarea className={input} rows={6} value={description} onChange={e=>setDescription(e.target.value)} minLength={15} maxLength={8000} required />
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
            <input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} className="mt-1"/>
            <span>Başvurumun idari değerlendirme için işleneceğini, bu formun avukatlık sözleşmesi veya temsil yetkisi oluşturmadığını anladım. Bu onay, gerekli aydınlatma ve veri aktarım belgelerinin yerine geçmez.</span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-950 p-4 text-sm text-red-200">{error}</p>}
          <button type="submit" disabled={submitting || !accepted} className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 disabled:opacity-50">
            {submitting ? "Kaydediliyor..." : "Başvuru oluştur"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function NewRequestPage() {
  return <main><SiteHeader/><ProtectedRoute><NewRequestForm/></ProtectedRoute><SiteFooter/></main>;
}
