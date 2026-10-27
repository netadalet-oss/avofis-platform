import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EditModeProvider } from "@/components/providers/EditModeProvider";

export const metadata: Metadata = {
  title: { default: "AVOfis | Netherlands · Türkiye", template: "%s | AVOfis" },
  description: "AVOfis: Nederland–Türkiye administrative support, document coordination and independent professional referrals. Services subject to authorisation.",
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body><AuthProvider><EditModeProvider>{children}</EditModeProvider></AuthProvider></body></html>;
}
