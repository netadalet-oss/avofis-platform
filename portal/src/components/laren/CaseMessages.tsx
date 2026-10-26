"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { larenDate, type LarenStatus } from "@/lib/laren";

type Message = {
  id: string;
  request_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

type Props = {
  requestId: string;
  currentUserId: string;
  clientUserId: string;
  status: LarenStatus;
};

export function CaseMessages({ requestId, currentUserId, clientUserId, status }: Props) {
  const [items, setItems] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data, error: dbError } = await supabase.from("laren_messages")
      .select("id, request_id, sender_user_id, body, created_at")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (dbError) setError(dbError.message);
    else {
      setError("");
      setItems((data || []) as Message[]);
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (status === "closed" || !body || sending) return;
    setSending(true);
    setError("");
    const { error: insertError } = await supabase.from("laren_messages").insert({
      request_id: requestId,
      sender_user_id: currentUserId,
      body,
    });
    if (insertError) setError(insertError.message);
    else {
      setDraft("");
      await refresh();
    }
    setSending(false);
  }

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-white">Dosya yazışmaları</h2>
        <button type="button" onClick={() => void refresh()} className="min-h-11 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200">
          Yenile
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Yazışmalar yalnızca bu dosyanın sahibi ve yetkili LAREN personeli tarafından okunabilir.
        Bu alan bağımsız avukatla müvekkil arasında avukatlık sözleşmesi oluşturmaz.
      </p>
      {loading ? <p className="mt-5 text-sm text-slate-400">Mesajlar yükleniyor...</p> : null}
      {error ? <p role="alert" className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p> : null}
      <div className="mt-5 max-h-[430px] space-y-3 overflow-y-auto" aria-live="polite">
        {items.length === 0 && !loading ? <p className="text-sm text-slate-400">Henüz mesaj yok.</p> : null}
        {items.map(item => {
          const own = item.sender_user_id === currentUserId;
          const author = own ? "Siz" : item.sender_user_id === clientUserId ? "Müşteri" : "LAREN ekibi";
          return (
            <article key={item.id} className={`rounded-xl border p-4 ${own ? "border-sky-500/30 bg-sky-900/20" : "border-white/10 bg-black/20"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{author}</p>
                <time className="text-xs text-slate-400">{larenDate(item.created_at)}</time>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{item.body}</p>
            </article>
          );
        })}
      </div>
      {status === "closed" ? (
        <p className="mt-5 text-sm text-slate-300">Dosya kapalı. Yeni mesaj gönderilemez.</p>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={send}>
          <label className="block text-sm font-medium text-slate-200" htmlFor={`laren-message-${requestId}`}>Yeni mesaj</label>
          <textarea
            id={`laren-message-${requestId}`}
            className="min-h-12 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-base text-white"
            minLength={1}
            maxLength={3000}
            rows={3}
            required
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Bu dosyaya ilişkin sorunuz veya işlem bilginiz..."
          />
          <button disabled={sending || !draft.trim()} type="submit"
            className="min-h-12 w-full rounded-xl bg-white px-5 py-3 text-base font-semibold text-slate-950 disabled:opacity-50 sm:w-auto">
            {sending ? "Gönderiliyor..." : "Mesaj gönder"}
          </button>
        </form>
      )}
    </section>
  );
}
