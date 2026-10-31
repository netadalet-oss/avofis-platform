/**
 * L4 R-397/R-399/R-400: public document preparation ONLY.
 * Not an upload broker. No credential, object, signed URL, network request,
 * file bytes, content scan or GDPR approval is handled here.
 * R-398 original DOCX vs security whitelist discrepancy stays OPEN.
 */
export const documentCategories=[
 "event","decision","contract","correspondence","identity","other","unknown"
] as const;
export type DocumentCategory=typeof documentCategories[number];
export type DocumentPreparationInput={
 category:DocumentCategory;
 redactionWarningRead:boolean;
 privateChannelRequested:boolean;
};
export type DocumentPreparationResult={
 sourceIds:readonly ["R-397","R-399","R-400"];
 category:DocumentCategory;
 canUpload:false;
 canShare:false;
 canCreateSignedUrl:false;
 willStoreFile:false;
 classificationIsLegalOpinion:false;
 humanAuthStorageCheckRequired:true;
 docxFormatDecision:"OPEN";
 displayPreUploadWarning:true;
 reasons:readonly string[];
};
export const preUploadWarning={
 tr:"Yüklemeden önce gereksiz BSN, kimlik numarası, kimlik görüntüsü ve sağlık bilgilerini mümkünse karartın. Belgenin hukukî değerini veya gizliliğini etkileyebilecek değişiklikleri bağımsız uzmanla değerlendirin. Bu ekrandan belge yüklenemez.",
 nl:"Scherm onnodige BSN-, identiteits- en gezondheidsgegevens af voordat u ooit documenten deelt. Controleer eerst met een bevoegde professional of afscherming juridisch verantwoord is. Uploaden is hier niet mogelijk.",
 en:"Before sharing any document, consider redacting unnecessary national IDs, identity images and health information. Consult a qualified professional about legally appropriate redaction. File upload is unavailable here."
} as const;
export function evaluateDocumentPreparation(input:unknown):DocumentPreparationResult{
 if(!input||typeof input!=="object"||Array.isArray(input))
  throw new Error("INVALID_PUBLIC_DOCUMENT_PREPARATION");
 const obj=input as Record<string,unknown>;
 const keys=Object.keys(obj).sort();
 if(JSON.stringify(keys)!==JSON.stringify(["category","privateChannelRequested","redactionWarningRead"]))
  throw new Error("INVALID_PUBLIC_DOCUMENT_PREPARATION");
 if(typeof obj.category!=="string"||
  !documentCategories.includes(obj.category as DocumentCategory)||
  typeof obj.redactionWarningRead!=="boolean"||
  typeof obj.privateChannelRequested!=="boolean")
  throw new Error("INVALID_PUBLIC_DOCUMENT_PREPARATION");
 const reasons=[
  "PUBLIC_FIRST_CONTACT_MUST_NOT_UPLOAD_DOCUMENTS",
  "AUTHENTICATED_PRIVATE_STORAGE_NOT_INDEPENDENTLY_VERIFIED",
  "MALWARE_SCAN_AND_ACCESS_CONTROL_NOT_INDEPENDENTLY_VERIFIED",
  "DOCX_WHITELIST_SOURCE_CONFLICT_STILL_OPEN"
 ];
 if(!obj.redactionWarningRead)reasons.push("REDUCTION_WARNING_NOT_ACKNOWLEDGED");
 if(obj.privateChannelRequested)reasons.push("PRIVATE_CHANNEL_NOT_RELEASED");
 if(["unknown","identity","other"].includes(obj.category))reasons.push("DOCUMENT_CATEGORY_REQUIRES_HUMAN_REVIEW");
 return{
  sourceIds:["R-397","R-399","R-400"],
  category:obj.category as DocumentCategory,
  canUpload:false,canShare:false,canCreateSignedUrl:false,willStoreFile:false,
  classificationIsLegalOpinion:false,humanAuthStorageCheckRequired:true,
  docxFormatDecision:"OPEN",displayPreUploadWarning:true,reasons
 };
}
