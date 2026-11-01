import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AVOfis | Seviye 1 Personel ve Yönetim Önizlemesi",
  description: "16 AVOfis personel modülünün kişisel verisiz sentetik önizlemesi. Gerçek müşteri ve personel işlemleri henüz açık değildir.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
