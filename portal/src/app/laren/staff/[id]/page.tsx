"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CaseMessages } from "@/components/laren/CaseMessages";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import {
  LAREN_CATEGORY, LAREN_STATUS, larenDate,
  type LarenDocument, type LarenEvent, type LarenRequest, type LarenStatus,
} from "@/lib/laren";

const statusValues = Object.keys(LAREN_STATUS) as LarenStatus[];

function StaffCase() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [item, setItem] = useState<LarenRequest | null>(null);
  const [history, setHistory] = useState<LarenEvent[]>([]);
  const [docs, setDocs] = useState<LarenDocument[]>([]);
  const [status, setStatus] = useState<LarenStatus>("new");
  const [statusNote, setStatusNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!user || !id) return;
    const { data: member, error: accessError } = await supabase.from("laren_staff")
      .select("role").eq("user_id", user.id).maybeSingle();
    if (accessError || !member) {
      setAuthorized(false);
      setError(accessError?.message || "");
      setLoading(false);
      return;
    }
    setAuthorized(true);
    const [caseResult, eventsResult, docsResult] = await Promise.all([
      supabase.from("laren_requests").select("*").eq("id", id).single(),
      supabase.from("laren_request_events").select("*").eq("request_id", id).order("created_at", { ascending: false }),
      supabase.from("laren_documents").select("*").eq("request_id", id).order("created_at", { ascending: false }),
    ]);
    if (caseResult.error || eventsResult.error || docsResult.error) {
      setError(caseResult.error?.message || eventsResult.error?.message || docsResult.error?.message || "Dosya yüklenemedi.");
    } else {
      const record = caseResult.data as LarenRequest;
      setItem(record);
      setStatus(record.status);
      setHistory((eventsResult.data || []) as LarenEvent[]);
      setDocs((docsResult.data || []) as LarenDocument[]);
      setError("");
    }
    setLoading(false);
  }, [user, id]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function saveStatus() {
    if (!item || !statusNote.trim()) {
      setError("Müşteriye iletilecek durum notunu yazın.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    const { error: dbError } = await supabase.rpc("laren_set_status", {
      p_request_id: item.id, p_status: status, p_message: statusNote.trim(),
    });
    if (dbError) setError(dbError.message);
    else {
      setStatusNote("");
      setNotice("Dosya durumu güncellendi.");
      await refresh();
    }
    setSaving(false);
  }

  async function openFile(storagePath: string) {
    setError("");
    const { data, error: storageError } = await supabase.storage
      .from("laren-private").createSignedUrl(storagePath, 60);
    if (storageError || !data?.signedUrl) {
      setError(storageError?.message || "Belge açılamadı.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="container-shell py-12">
      <Link href="/laren/staff" className="text-sm text-slate-400 hover:text-white">← Başvurular</Link>
      {loading ? <p className="mt-8 text-slate-300">Dosya kontrol ediliyor...</p> : null}
      {authorized === false && !loading ? (
        <p className="mt-8 rounded-xl border border-red-400/20 p-6 text-slate-200">
          Bu alana yalnızca LAREN personeli erişebilir.
        </p>
      ) : null}
      {error ? <p role="alert" className="mt-6 rounded-xl bg-red-950 p-4 text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="mt-6 text-emerald-300">{notice}</p> : null}
      {authorized && item ? (
        <div className="mt-7 space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl font-semibold text-white">{item.subject}</h1>
              <span className="rounded-xl border border-sky-500/30 px-4 py-2 text-sm text-sky-200">
                {LAREN_STATUS[item.status]}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-300">{item.contact_name} · {item.contact_email}</p>
            <p className="mt-2 text-sm text-slate-400">
              {LAREN_CATEGORY[item.category]} · {item.jurisdiction} · {larenDate(item.created_at)}
            </p>
            <p className="mt-6 whitespace-pre-wrap text-slate-200">{item.description}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">İşlem durumunu güncelle</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
              <label className="text-sm text-slate-200">Durum
                <select value={status} onChange={e=>setStatus(e.target.value as LarenStatus)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-white">
                  {statusValues.map(s=><option key={s} value={s}>{LAREN_STATUS[s]}</option>)}
                </select>
              </label>
              <label className="text-sm text-slate-200">Müşteriye gösterilecek açıklama
                <input value={statusNote} onChange={e=>setStatusNote(e.target.value)} maxLength={1000}
                  placeholder="İşlem notu..."
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-white"/>
              </label>
              <button type="button" disabled={saving} onClick={()=>void saveStatus()}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
                {saving ? "Kaydediliyor..." : "Güncelle"}
              </button>
            </div>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Dosya belgeleri</h2>
            <p className="mt-2 text-sm text-slate-400">Belge bağlantıları 60 saniye geçerlidir.</p>
            <div className="mt-4 space-y-3">
              {docs.length === 0 ? <p className="text-sm text-slate-400">Bu dosyada belge yok.</p> : null}
              {docs.map(doc=>(
                <button type="button" key={doc.id}
                  className="block text-left text-sm text-sky-300 hover:underline"
                  onClick={()=>void openFile(doc.storage_path)}>
                  {doc.file_name} · {Math.ceil(doc.size_bytes / 1024)} KB · {larenDate(doc.created_at)}
                </button>
              ))}
            </div>
          </section>

          {user && <CaseMessages requestId={item.id} currentUserId={user.id} clientUserId={item.owner_user_id} status={item.status} />}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">İşlem geçmişi</h2>
            <div className="mt-4 space-y-3">
              {history.map(e=>(
                <div key={e.id} className="border-l border-white/20 pl-4">
                  <p className="text-sm font-semibold text-white">{LAREN_STATUS[e.status]}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{e.message}</p>
                  <time className="mt-1 block text-xs text-slate-500">{larenDate(e.created_at)}</time>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default function LarenStaffCasePage() {
  return <main><SiteHeader /><ProtectedRoute><StaffCase /></ProtectedRoute><SiteFooter /></main>;
}
