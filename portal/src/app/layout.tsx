import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EditModeProvider } from "@/components/providers/EditModeProvider";

export const metadata: Metadata = {
 title:{default:"AVOfis | Avrupa Genelinde Hukukî ve İdarî Destek",template:"%s | AVOfis"},
 description:"Hollanda ve Almanya ağırlıklı Avrupa genelinde hukukî danışmanlık, idarî itiraz, uygun temsil, alacak takibi, kira, sosyal güvenlik, göçmenlik, sözleşmeler ve ticari işlem hizmetleri.",
 robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="tr"><body><AuthProvider><EditModeProvider>{children}</EditModeProvider></AuthProvider></body></html>;
}
