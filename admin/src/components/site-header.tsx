export function SiteHeader() {
  return (
    <header className="w-full border-b border-white/10 bg-black/20">
      <div className="container-shell px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">AvOfis</p>
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
