import type { Localized } from "./journeys";

type OfficialSource={name:Localized;url:string};
const l=(tr:string,nl:string,en:string):Localized=>({tr,nl,en});
export const officialSources:Record<string,OfficialSource[]>={
 "tr-to-nl":[{name:l("Türkiye belgelerinin Hollanda'da kullanımı (NetherlandsWorldwide)","Turkse documenten in Nederland (NetherlandsWorldwide)","Turkish documents in the Netherlands (NetherlandsWorldwide)"),url:"https://www.netherlandsworldwide.nl/legalisation/foreign-documents/turkiye"}],
 "nl-to-tr":[{name:l("Hollanda belgelerinin yurt dışında kullanımı","Nederlandse documenten in het buitenland","Dutch documents for use abroad"),url:"https://www.netherlandsworldwide.nl/legalisation/dutch-documents"}],
 apostille:[{name:l("Apostil hangi makamdan alınır?","Waar kunt u een apostille krijgen?","Where to obtain an apostille"),url:"https://www.netherlandsworldwide.nl/legalisation/where-get-apostille"}],
 translation:[{name:l("Hollanda yeminli tercüman kaydı (Bureau Wbtv)","Register beëdigde tolken en vertalers","Dutch register of sworn interpreters and translators"),url:"https://www.bureauwbtv.nl/"}],
 municipality:[{name:l("Hollanda kamu kurumları (Government.nl)","Nederlandse overheid (Government.nl)","Netherlands government portal"),url:"https://www.government.nl/"}],
 diploma:[{name:l("Diploma değerlendirmesi için istenen belgeler (IDW)","Vereiste documenten diplomawaardering (IDW)","Documents for credential evaluation (IDW)"),url:"https://www.idw.nl/en/required-documents/"}],
 company:[{name:l("KVK işletme kayıt ve vergi bilgileri","KVK bedrijfsregistratie en belastingen","KVK business registration and tax"),url:"https://www.kvk.nl/en/starting/business-register-and-tax-administration/"}],
 crossborder:[{name:l("Hollanda ve yurt dışı belge tasdik koşulları","Legalisatie van documenten voor gebruik over de grens","Document legalisation across borders"),url:"https://www.netherlandsworldwide.nl/legalisation/dutch-documents"}],
 specialist:[{name:l("Yeminli tercümanların resmî kayıtları","Register beëdigde vertalers","Official sworn-translator register"),url:"https://www.bureauwbtv.nl/"}]
};
