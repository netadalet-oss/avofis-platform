import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AvOfis | Yönetim Masası",
  description: "Başvuru inceleme, iş ve teslim yönetimi, hukuk yayınları ve topluluk moderasyonu."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
