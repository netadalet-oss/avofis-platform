"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { LAREN_CATEGORY, LAREN_STATUS, larenDate, type LarenRequest } from "@/lib/laren";

function MyRequests() {
  const { user } = useUser();
  const [items, setItems] = useState<LarenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function load() {
      const { data, error: dbError } = await supabase.from("laren_requests")
        .select("*").eq("owner_user_id", user!.id).order("created_at", { ascending: false });
      if (!active) return;
      if (dbError) setError(dbError.message);
      else setItems((data || []) as LarenRequest[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [user]);

  return (
    <section className="container-shell py-6 sm:py-12">
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">Dosyalarım</h1>
          <p className="mt-2 text-slate-300">LAREN'e ilettiğiniz başvurular ve güncel durumları.</p>
        </div>
        <Link href="/laren/new" className="flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-center font-semibold text-slate-950">Yeni başvuru</Link>
      </div>
      {loading ? <p className="mt-8 text-slate-300">Dosyalar yükleniyor...</p> : null}
      {error ? <p role="alert" className="mt-8 text-red-300">{error}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="mt-8 text-slate-300">Henüz başvurunuz yok.</p> : null}
      <div className="mt-8 space-y-4">
        {items.map(item => (
          <Link key={item.id} href={`/laren/my/${item.id}`} className="block rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 transition hover:border-white/30">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="min-w-0 break-words text-lg font-medium text-white">{item.subject}</h2>
              <span className="rounded-lg border border-sky-500/30 bg-sky-900/20 px-3 py-1 text-sm text-sky-200">{LAREN_STATUS[item.status]}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{LAREN_CATEGORY[item.category]}</p>
            <p className="mt-2 text-xs text-slate-400">Başvuru: {larenDate(item.created_at)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function MyRequestsPage() {
  return <main><ProtectedRoute><MyRequests/></ProtectedRoute></main>;
}
