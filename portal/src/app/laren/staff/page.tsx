"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { LAREN_CATEGORY, LAREN_STATUS, larenDate, type LarenRequest, type LarenStatus } from "@/lib/laren";

const options = Object.keys(LAREN_STATUS) as LarenStatus[];

function StaffDashboard() {
  const { user } = useUser();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<LarenRequest[]>([]);
  const [selected, setSelected] = useState<Record<string, LarenStatus>>({});
  const [message, setMessage] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LarenStatus | "all">("all");

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data: membership, error: membershipError } = await supabase.from("laren_staff")
      .select("role").eq("user_id", user.id).maybeSingle();
    if (membershipError || !membership) {
      setAuthorized(false);
      setLoading(false);
      if (membershipError) setError(membershipError.message);
      return;
    }
    setAuthorized(true);
    const { data, error: dbError } = await supabase.from("laren_requests")
      .select("*").order("created_at", { ascending: false }).limit(100);
    if (dbError) setError(dbError.message);
    else {
      const rows = (data || []) as LarenRequest[];
      setItems(rows);
      setSelected(Object.fromEntries(rows.map(row=>[row.id, row.status])) as Record<string, LarenStatus>);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function update(item: LarenRequest) {
    const nextStatus = selected[item.id] || item.status;
    const nextMessage = (message[item.id] || "").trim();
    if (!nextMessage) { setError("Durum değişikliği için müşteriye gösterilecek açıklamayı yazın."); return; }
    setSaving(item.id);
    setError("");
    const { error: rpcError } = await supabase.rpc("laren_set_status", {
      p_request_id: item.id,
      p_status: nextStatus,
      p_message: nextMessage,
    });
    if (rpcError) setError(rpcError.message);
    else {
      setMessage(prev=>({ ...prev, [item.id]: "" }));
      await refresh();
    }
    setSaving(null);
  }

  const filtered = items.filter(item => {
    const matchesStatus = filter === "all" || item.status === filter;
    const term = query.trim().toLocaleLowerCase("tr");
    const matchesQuery = !term || [item.subject, item.contact_name, item.contact_email]
      .some(part => part.toLocaleLowerCase("tr").includes(term));
    return matchesStatus && matchesQuery;
  });

  return (
    <section className="container-shell py-12">
      <Link href="/laren" className="text-sm text-slate-400 hover:text-white">← LAREN</Link>
      <h1 className="mt-6 text-3xl font-semibold text-white">LAREN personel paneli</h1>
      <p className="mt-2 text-sm text-slate-300">Başvuruların durumunu güncelleyin. Her güncelleme müşteri dosyasına zaman damgasıyla işlenir.</p>
      {loading ? <p className="mt-8 text-slate-300">Yetkiler kontrol ediliyor...</p> : null}
      {error ? <p role="alert" className="mt-6 text-red-300">{error}</p> : null}
      {authorized === false ? <p className="mt-8 rounded-xl border border-red-400/20 p-5 text-slate-200">Bu hesaba LAREN personel yetkisi verilmemiş.</p> : null}
      {authorized && !loading && items.length === 0 ? <p className="mt-8 text-slate-300">Henüz başvuru bulunmuyor.</p> : null}
      {authorized && (
        <div className="mt-8 space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_240px]">
            <label className="text-sm text-slate-300">Başvurularda ara
              <input value={query} onChange={event=>setQuery(event.target.value)}
                placeholder="Konu, isim veya e-posta"
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-white"/>
            </label>
            <label className="text-sm text-slate-300">Duruma göre filtrele
              <select value={filter} onChange={event=>setFilter(event.target.value as LarenStatus | "all")}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-white">
                <option value="all">Tüm durumlar</option>
                {options.map(value=><option key={value} value={value}>{LAREN_STATUS[value]}</option>)}
              </select>
            </label>
          </div>
          <p className="text-sm text-slate-400">Gösterilen: {filtered.length} / {items.length} (son 100 başvuru)</p>
          {filtered.length === 0 ? <p className="text-sm text-slate-300">Bu filtreyle eşleşen başvuru bulunamadı.</p> : null}
          {filtered.map(item => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">{item.subject}</h2>
                <span className="rounded-lg border border-white/10 px-3 py-1 text-sm text-slate-200">{LAREN_STATUS[item.status]}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {item.contact_name} · {item.contact_email} · {LAREN_CATEGORY[item.category]} · {larenDate(item.created_at)}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">{item.description}</p>
              <Link href={`/laren/staff/${item.id}`} className="mt-4 inline-block rounded-lg border border-sky-500/30 px-4 py-2 text-sm text-sky-200 hover:bg-sky-900/20">Dosyayı, belgeleri ve yazışmaları aç →</Link>
              <div className="mt-6 grid gap-3 md:grid-cols-[240px_1fr_auto] md:items-end">
                <label className="text-sm text-slate-200">Yeni durum
                  <select className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3 text-white"
                    value={selected[item.id] || item.status}
                    onChange={event=>setSelected(prev=>({ ...prev,[item.id]:event.target.value as LarenStatus }))}>
                    {options.map(opt=><option key={opt} value={opt}>{LAREN_STATUS[opt]}</option>)}
                  </select>
                </label>
                <label className="text-sm text-slate-200">Müşteriye durum notu
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950 p-3 text-white"
                    maxLength={1000} value={message[item.id] || ""}
                    onChange={event=>setMessage(prev=>({ ...prev,[item.id]:event.target.value }))}
                    placeholder="Örn. Belgeleriniz inceleniyor."/>
                </label>
                <button type="button" disabled={saving===item.id}
                  onClick={()=>void update(item)}
                  className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
                  {saving===item.id?"Kaydediliyor...":"Durumu kaydet"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LarenStaffPage() {
  return <main><SiteHeader/><ProtectedRoute><StaffDashboard/></ProtectedRoute><SiteFooter/></main>;
}
