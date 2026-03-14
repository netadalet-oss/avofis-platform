"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { modules as defaultModules, type ModuleItem } from "@/lib/site";
import { SectionTitle } from "@/components/section-title";
import { supabase } from "@/lib/supabase";

type CmsModuleItem = {
  title: string;
  text: string;
};

export function ModuleGrid() {
  const [moduleItems, setModuleItems] = useState<ModuleItem[]>(defaultModules);

  useEffect(() => {
    let mounted = true;

    async function loadModules() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "modules")
        .single();

      if (!mounted) return;

      if (error || !data?.value || !Array.isArray(data.value)) {
        return;
      }

      const cmsModules = (data.value as CmsModuleItem[]).filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          item.title.trim() &&
          typeof item.text === "string" &&
          item.text.trim(),
      );

      if (cmsModules.length === 0) {
        return;
      }

      const mergedModules: ModuleItem[] = cmsModules.map((cmsItem) => {
        const matchedDefault =
          defaultModules.find((item) => item.title === cmsItem.title) ??
          defaultModules.find((item) =>
            item.title.toLowerCase().includes(cmsItem.title.toLowerCase()),
          ) ??
          defaultModules.find((item) =>
            cmsItem.title.toLowerCase().includes(item.title.toLowerCase()),
          ) ??
          defaultModules[0];

        return {
          icon: matchedDefault.icon,
          title: cmsItem.title,
          text: cmsItem.text,
        };
      });

      setModuleItems(mergedModules);
    }

    loadModules();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="moduller" className="container-shell py-24">
      <SectionTitle
        eyebrow="Temel modüller"
        title="Araştırma, üretim, işbirliği ve kariyer aynı platform mimarisinde."
        text="AvOfis yalnızca bilgiye erişim sağlamaz; hukuk iş akışının üretim, eşleşme, moderasyon ve ekip koordinasyonu tarafını da merkezi hale getirir."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {moduleItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="group rounded-[26px] border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/[0.08]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50">
                <Icon className="h-5 w-5 text-sky-300" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {item.text}
              </p>

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
