import { Bell, Briefcase, Building2, FileSearch, FileText, Gavel, LineChart, MessageSquareMore, Scale, ShieldCheck, Users2, Workflow } from "lucide-react";

export const navigation = [
  { label: "Modüller", href: "#moduller" },
  { label: "İçtihat", href: "#arastirma" },
  { label: "Mevzuat", href: "#arastirma" },
  { label: "Kariyer", href: "#kariyer" },
  { label: "Forum", href: "#topluluk" },
  { label: "Ofisler", href: "#ofisler" },
  { label: "İstatistikler", href: "#istatistikler" }
];

export const modules = [
  { icon: FileSearch, title: "İçtihat Araştırma", text: "Karar arama, filtreleme, emsal kümeleri, ilgili mevzuat ve paylaşım." },
  { icon: Scale, title: "Mevzuat Modülü", text: "Madde bazlı görüntüleme, değişiklik geçmişi, ilişkili mevzuat ve yorum katmanı." },
  { icon: Workflow, title: "Dosya Analizi", text: "Belge yükleme, olay kronolojisi, hukuki sorun tespiti ve risk analizi." },
  { icon: FileText, title: "Taslak Üretim", text: "Dava dilekçesi, cevap, savunma, istinaf, temyiz, sözleşme ve görüş üretimi." },
  { icon: Briefcase, title: "Kariyer ve Staj", text: "Stajyer profilleri, ofis profilleri, ilanlar, başvurular ve eşleşme akışları." },
  { icon: MessageSquareMore, title: "Forum ve Topluluk", text: "Alan bazlı tartışmalar, soru-cevap, oylama, moderasyon ve uzman katkıları." },
  { icon: Users2, title: "Profesyonel Workspace", text: "Dosya klasörleri, görevler, notlar, ortak belge çalışması ve ekip rolleri." },
  { icon: LineChart, title: "Analitik ve Yönetim", text: "Kullanıcı, içerik, kariyer dönüşümü ve modül performansı takibi." },
  { icon: ShieldCheck, title: "Güvenlik ve Uyum", text: "Rol bazlı erişim, audit log, KVKK kayıtları ve güvenli veri yönetimi." },
  { icon: Building2, title: "Ofis Profilleri", text: "Doğrulanmış ofis görünürlüğü, ekip profilleri ve uzmanlık alanı sunumu." },
  { icon: Bell, title: "Bildirim Sistemi", text: "Platform içi, e-posta ve olay tabanlı bildirim merkezi." },
  { icon: Gavel, title: "Connect Ekonomisi", text: "İlan, görünürlük ve premium işlemler için platform içi kredi modeli." }
];

export const stats = [
  { value: "120K+", label: "İçtihat kaydı" },
  { value: "5.200+", label: "Mevzuat / madde kaydı" },
  { value: "18K+", label: "Kayıtlı kullanıcı" },
  { value: "350+", label: "Aktif ofis profili" },
  { value: "1.400+", label: "Forum başlığı" },
  { value: "9.800+", label: "Aylık belge üretimi" }
];

export const footerColumns = [
  { title: "Platform", links: ["Ana Sayfa", "Modüller", "İçtihat", "Mevzuat", "Forum", "Kariyer"] },
  { title: "Kurumsal", links: ["Hakkında", "Yayın İlkeleri", "Güvenlik", "Gizlilik", "İletişim"] },
  { title: "Destek", links: ["Yardım Merkezi", "Sık Sorulan Sorular", "Kullanım Şartları", "KVKK"] }
];
