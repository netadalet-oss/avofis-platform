import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "AvOfis",
  description: "Hukuk araştırması, belge üretimi, topluluk ve kariyer platformu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}