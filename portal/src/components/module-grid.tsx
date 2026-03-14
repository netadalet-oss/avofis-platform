import { ArrowRight } from "lucide-react";
import { modules } from "@/lib/site";
import { SectionTitle } from "@/components/section-title";

export function ModuleGrid() {
  return (
    <section id="moduller" className="container-shell py-24">
      <SectionTitle
        eyebrow="Temel modüller"
        title="Araştırma, üretim, işbirliği ve kariyer aynı platform mimarisinde."
        text="AvOfis yalnızca bilgiye erişim sağlamaz; hukuk iş akışının üretim, eşleşme, moderasyon ve ekip koordinasyonu tarafını da merkezi hale getirir."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="group rounded-[26px] border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/[0.08]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50">
                <Icon className="h-5 w-5 text-sky-300" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-300">
                Modülü incele
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
