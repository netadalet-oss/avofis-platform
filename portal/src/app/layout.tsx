import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EditModeProvider } from "@/components/providers/EditModeProvider";

export const metadata: Metadata = {
  title: { default: "AVOfis | Belge ve idarî işlem hazırlığı", template: "%s | AVOfis" },
  description: "AVOfis, Hollanda ve Türkiye bağlantılı belge temini, başvuru hazırlığı ve yetkili uzman koordinasyonuna yönelik hizmetler için kuruluş aşamasındadır.",
  robots: { index: true, follow: true },
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="tr"><body><AuthProvider><EditModeProvider>{children}</EditModeProvider></AuthProvider></body></html>;
}
