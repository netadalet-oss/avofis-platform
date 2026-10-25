export type LarenStatus = "new" | "reviewing" | "awaiting_documents" | "in_progress" | "completed" | "closed";
export type LarenCategory = "administrative" | "commercial" | "legal_coordination";
export type LarenJurisdiction = "NL" | "TR" | "NL_TR";

export type LarenRequest = {
  id: string;
  owner_user_id: string;
  contact_name: string;
  contact_email: string;
  subject: string;
  description: string;
  category: LarenCategory;
  jurisdiction: LarenJurisdiction;
  status: LarenStatus;
  created_at: string;
  updated_at: string;
};

export type LarenEvent = {
  id: string;
  request_id: string;
  status: LarenStatus;
  message: string;
  created_at: string;
};

export type LarenDocument = {
  id: string;
  request_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export const LAREN_STATUS: Record<LarenStatus, string> = {
  new: "Alındı",
  reviewing: "İnceleniyor",
  awaiting_documents: "Belge bekleniyor",
  in_progress: "İşlem sürüyor",
  completed: "Tamamlandı",
  closed: "Kapatıldı",
};

export const LAREN_CATEGORY: Record<LarenCategory, string> = {
  administrative: "İdari işlem desteği",
  commercial: "Ticari operasyon",
  legal_coordination: "Bağımsız avukatla koordinasyon",
};

export function larenDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
