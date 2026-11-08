"use client";

import Link from "next/link";
import {
  ArrowRight, BookOpen, Briefcase, ClipboardList, FileText,
  FolderOpen, MessageSquare, Scale, Wallet, type LucideIcon
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useUser } from "@/hooks/useUser";

const shortcuts: { title: string; description: string; slug: string; icon: LucideIcon }[] = [
  { title: "Başvurularım", description: "Başvuru durumları ve işlem geçmişi", slug: "basvurularim", icon: ClipboardList },
  { title: "İş taleplerim", description: "Yayınlanan ve devam eden işler", slug: "is-talebi-olustur", icon: Briefcase },
  { title: "Tekliflerim", description: "Gelen ve gönderilen teklifler", slug: "tekliflerim", icon: FileText },
  { title: "Dosyalarım", description: "İş ve hizmet dosyaları", slug: "dosyalarim", icon: FolderOpen },
  { title: "Teslim ve revizyon", description: "Teslim alınan çalışmalar", slug: "is-teslimi", icon: Scale },
  { title: "Ödemelerim", description: "Bütçe ve ödeme kayıtları", slug: "odeme-kayitlari", icon: Wallet },
  { title: "Sorularım", description: "Soru ve yanıt süreçleri", slug: "soru-sor", icon: MessageSquare },
  { title: "Kaynaklarım", description: "Makaleler ve hukuk rehberleri", slug: "makaleler", icon: BookOpen }
];

const stages = ["Başvuru", "İnceleme", "Teklif", "Çalışma", "Teslim", "Sonuç"];

export default function DashboardPage() {
  const { user } = useUser();
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f6f8fb] text-[#273e57]">
        <header className="border-b border-[#e4eaf0] bg-white">
          <div className="mx-auto flex h-[72px] max-w-[1220px] items-center justify-between gap-4 px-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a58] text-white"><Scale size={22}/></div>
              <div><div className="text-lg font-bold leading-5">AvOfis</div><div className="text-[11px] text-[#8090a0]">Çalışma alanım</div></div>
            </Link>
            <LogoutButton/>
          </div>
        </header>
        <div className="mx-auto max-w-[1220px] px-5 pb-20 pt-10">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.13em] text-[#a48a58]">HESABIM</p>
              <h1 className="mt-2 text-[30px] font-bold tracking-[-.04em] text-[#203a55]">Çalışma alanım</h1>
              <p className="mt-2 text-[13px] text-[#79899a]">Hoş geldiniz, {user?.user_metadata?.full_name || user?.email || "AvOfis üyesi"}.</p>
            </div>
            <Link href="/hizmet/is-talebi-olustur" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3b59] px-5 py-3 text-[13px] font-semibold text-white">Yeni iş talebi <ArrowRight size={15}/></Link>
          </div>
          <section className="mb-10">
            <h2 className="mb-5 text-[19px] font-bold text-[#233c56]">İşlemlerim</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return <Link key={item.title} href={"/hizmet/" + item.slug} className="group rounded-[17px] border border-[#e3e9ef] bg-white p-5 hover:border-[#bdccda] hover:shadow-sm">
                  <div className="mb-5 flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3f7] text-[#355b7c]"><Icon size={20}/></span><ArrowRight size={15} className="text-[#9dacba]"/></div>
                  <h3 className="text-[14px] font-bold text-[#243d56]">{item.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#7c8998]">{item.description}</p>
                </Link>;
              })}
            </div>
          </section>
          <section className="rounded-[20px] border border-[#e3e9ef] bg-white p-6 md:p-8">
            <h2 className="text-[19px] font-bold text-[#233c56]">Dosya süreci</h2>
            <p className="mt-2 text-[13px] text-[#7b8998]">Başvurular bu aşamalar üzerinden izlenir.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {stages.map((stage, i) => <div key={stage} className="flex items-center gap-2 rounded-xl bg-[#f4f7fa] p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e3ebf3] text-[11px] font-bold text-[#345b79]">{i + 1}</span><span className="text-[12px] font-semibold text-[#566b80]">{stage}</span></div>)}
            </div>
            <div className="mt-7 border-t border-[#edf0f4] pt-6">
              <h3 className="text-[14px] font-bold text-[#2b435b]">İşlem kayıtlarım</h3>
              <p className="mt-2 text-[13px] text-[#8b97a5]">İşlem kayıtları ve başvuru durumları bu alanda görüntülenecektir. Bu görünüm henüz canlı işlem verilerine bağlı değildir.</p>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
