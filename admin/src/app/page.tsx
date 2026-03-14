const sections = [
  "Dashboard",
  "Kullanıcı Yönetimi",
  "Rol ve Yetki Yönetimi",
  "CMS Sayfa Yönetimi",
  "Menü Yönetimi",
  "Medya Kütüphanesi",
  "Forum Moderasyonu",
  "İçtihat Yönetimi",
  "Mevzuat Yönetimi",
  "Kariyer Yönetimi",
  "Bildirim Şablonları",
  "Analitik",
  "Audit Log",
  "Sistem Ayarları"
];

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="container-shell py-16">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold">AvOfis Admin</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Bu panel; dosya yüklemeden, GitHub kullanmadan, doğrudan web arayüzü üzerinden menü, başlık, blok, içerik ve görsel düzenleme mantığına göre tasarlanmıştır. Kalıcı kullanım için API ve veritabanı bağlantısı gereklidir.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sections.map((section) => (
              <div key={section} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                {section}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
