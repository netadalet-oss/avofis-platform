"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@/hooks/useUser";
import { CaseMessages } from "@/components/laren/CaseMessages";
import { supabase } from "@/lib/supabase";
import { LAREN_CATEGORY, LAREN_STATUS, larenDate, type LarenDocument, type LarenEvent, type LarenRequest } from "@/lib/laren";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

function RequestDetails() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useUser();
  const [item, setItem] = useState<LarenRequest | null>(null);
  const [events, setEvents] = useState<LarenEvent[]>([]);
  const [documents, setDocuments] = useState<LarenDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!user || !id) return;
    const [requestResult, eventResult, documentResult] = await Promise.all([
      supabase.from("laren_requests").select("*").eq("id", id).eq("owner_user_id", user.id).single(),
      supabase.from("laren_request_events").select("*").eq("request_id", id).order("created_at", { ascending: false }),
      supabase.from("laren_documents").select("*").eq("request_id", id).order("created_at", { ascending: false }),
    ]);
    if (requestResult.error) { setError(requestResult.error.message); setLoading(false); return; }
    if (eventResult.error || documentResult.error) {
      setError(eventResult.error?.message || documentResult.error?.message || "Dosya yüklenemedi.");
    } else {
      setError("");
      setItem(requestResult.data as LarenRequest);
      setEvents((eventResult.data || []) as LarenEvent[]);
      setDocuments((documentResult.data || []) as LarenDocument[]);
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user || !item) return;
    if (!ALLOWED.includes(file.type) || file.size > MAX_BYTES || file.size === 0) {
      setError("Yalnızca PDF, JPG ve PNG; en fazla 10 MB yüklenebilir.");
      return;
    }
    setError("");
    setNotice("");
    setUploading(true);
    const path = `${user.id}/${item.id}/${crypto.randomUUID()}`;
    try {
      const { error: storageError } = await supabase.storage.from("laren-private").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (storageError) throw storageError;
      const { error: metadataError } = await supabase.from("laren_documents").insert({
        request_id: item.id, uploaded_by: user.id,
        storage_path: path, file_name: file.name,
        mime_type: file.type, size_bytes: file.size,
      });
      if (metadataError) throw metadataError;
      setNotice("Belge güvenli alana yüklendi.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Belge yükleme başarısız. Destek ile iletişime geçin.");
    } finally {
      setUploading(false);
    }
  }

  async function openDocument(path: string) {
    setError("");
    const { data, error: signedError } = await supabase.storage.from("laren-private").createSignedUrl(path, 60);
    if (signedError || !data?.signedUrl) {
      setError(signedError?.message || "Belge bağlantısı oluşturulamadı.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="container-shell py-6 sm:py-12">
      <Link href="/laren/my" className="text-sm text-slate-400 hover:text-white">← Dosyalarım</Link>
      {loading ? <p className="mt-8 text-slate-300">Dosya yükleniyor...</p> : null}
      {error ? <p className="mt-6 text-red-300" role="alert">{error}</p> : null}
      {notice ? <p className="mt-6 text-emerald-300" role="status">{notice}</p> : null}
      {item && (
        <div className="mt-6 space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">{item.subject}</h1>
              <span className="rounded-xl bg-sky-950 px-3 py-2 text-sky-200">{LAREN_STATUS[item.status]}</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{LAREN_CATEGORY[item.category]} · {item.jurisdiction} · {larenDate(item.created_at)}</p>
            <p className="mt-6 whitespace-pre-wrap text-slate-200">{item.description}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <h2 className="break-words text-lg font-semibold text-white sm:text-xl">Belgeler</h2>
            <p className="mt-2 text-sm text-slate-400">Yalnızca PDF, JPG ve PNG; en fazla 10 MB. Dosyalara yetkisiz kişiler ulaşamaz.</p>
            <label className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-3 text-center font-semibold text-slate-950 sm:inline-flex sm:w-auto">
              {uploading ? "Yükleniyor..." : "Belge ekle"}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={uploading} onChange={upload} className="sr-only"/>
            </label>
            <div className="mt-4 space-y-2">
              {documents.map(doc=>(
                <button key={doc.id} type="button" onClick={()=>void openDocument(doc.storage_path)}
                  className="flex min-h-11 w-full items-center break-all text-left text-sm text-sky-300 hover:underline">
                  {doc.file_name} ({Math.ceil(doc.size_bytes/1024)} KB)
                </button>
              ))}
              {documents.length === 0 ? <p className="text-sm text-slate-400">Henüz belge yüklenmedi.</p> : null}
            </div>
          </div>
          {user && <CaseMessages requestId={item.id} currentUserId={user.id} clientUserId={item.owner_user_id} status={item.status} />}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <h2 className="break-words text-lg font-semibold text-white sm:text-xl">İşlem geçmişi</h2>
            <div className="mt-4 space-y-3">
              {events.map(e=>(
                <div key={e.id} className="border-l border-white/20 pl-4">
                  <p className="text-sm font-semibold text-white">{LAREN_STATUS[e.status]}</p>
                  <p className="mt-1 text-sm text-slate-300">{e.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{larenDate(e.created_at)}</p>
                </div>
              ))}
              {events.length === 0 ? <p className="text-slate-400">Başvurunuz değerlendirmeye alındığında güncellemeler burada görünür.</p> : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function LarenRequestPage() {
  return <main><ProtectedRoute><RequestDetails/></ProtectedRoute></main>;
}
