import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AvOfis",
  description: "Hukuk araştırması, belge üretimi, topluluk ve kariyer platformu"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
