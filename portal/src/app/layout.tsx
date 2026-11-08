import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EditModeProvider } from "@/components/providers/EditModeProvider";

export const metadata: Metadata = {
  title: "AvOfis | Hukuki Hizmetler ve Bilgi Platformu",
  description: "Hukuki hizmet talebi, iş ve teklifler, dosya takibi, makaleler, hukuk haberleri ve soru-cevap.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <EditModeProvider>{children}</EditModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
