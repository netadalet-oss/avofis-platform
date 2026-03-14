"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error.message);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
    </button>
  );
}