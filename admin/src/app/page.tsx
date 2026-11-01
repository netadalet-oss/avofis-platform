import Link from "next/link";
import { STAFF_TOP_LEVEL } from "@/lib/staff-module-directory";



export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="container-shell py-16">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold">AvOfis Admin</h1>
          <Link href="/seviye-1-onizleme" className="mt-5 inline-flex rounded-xl border border-sky-300/40 px-4 py-3 text-sm font-semibold text-sky-200 underline underline-offset-4">
            Seviye 1 — bütün yönetim ve API önizlemesini aç
          </Link>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Bu panel talimatnamenin 16 personel modülünün ana işlevlerini gösterir. Gerçek müşteri verileri ve üretim işlemleri bağımsız yetki ve güvenlik kabulüne kadar kapalıdır.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAFF_TOP_LEVEL.map((module) => (
              <Link href={"/personel/" + module.slug} key={module.slug}
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-200 hover:border-sky-300/50">
                <h2 className="font-semibold text-white">{module.title}</h2>
                <p className="mt-2 text-xs leading-6 text-slate-300">{module.scope}</p>
                <span className="mt-3 inline-block text-xs text-sky-200">Ana işlevi inceleyin</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
