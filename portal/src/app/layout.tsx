import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EditModeProvider } from "@/components/providers/EditModeProvider";

export const metadata: Metadata = {
  title: "AvOfis",
  description: "Hukuk araştırması, belge üretimi, topluluk ve kariyer platformu",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
