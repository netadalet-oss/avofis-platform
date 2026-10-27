import { redirect } from "next/navigation";

// Eski, uygulanmamış araştırma/topluluk modülleri müşteri hizmeti gibi sunulmaz.
export default function LegacyPage(){
  redirect("/hizmetler");
}
