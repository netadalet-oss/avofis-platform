import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "AVOfis | Hukukî ve idarî işlem hazırlığı",
  description: "17 hukukî hizmet, 14 hedef kitle, 12 sorun rotası, kaynaklı hukuk bilgisi ve güvenli belge hazırlığı.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
