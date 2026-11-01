import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AvOfis Admin",
  description: "CMS, moderasyon, kullanıcı ve sistem yönetimi",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
