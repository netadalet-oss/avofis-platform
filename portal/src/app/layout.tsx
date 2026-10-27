import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EditModeProvider } from "@/components/providers/EditModeProvider";

export const metadata: Metadata = {
 title:{default:"AVOfis | Avrupa–Türkiye Profesyonel İşlem Desteği",template:"%s | AVOfis"},
 description:"Hollanda, Almanya ve Türkiye bağlantılı vize, oturum, resmî başvuru, sözleşme, uyuşmazlık, insan hakları, belge, eğitim, şirket ve ticari işlem organizasyonu.",
 robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="tr"><body><AuthProvider><EditModeProvider>{children}</EditModeProvider></AuthProvider></body></html>;
}
