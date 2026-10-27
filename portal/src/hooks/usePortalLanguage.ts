"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/avofis-content";

export function usePortalLanguage(): Language {
  const [language,setLanguage] = useState<Language>("tr");
  useEffect(()=>{
    const query = new URLSearchParams(window.location.search).get("lang");
    let stored: string | null=null;
    try{ stored=window.localStorage.getItem("avofis-language"); }catch{}
    const candidate=query==="tr"||query==="nl"||query==="en"?query:stored;
    const selected:Language=candidate==="tr"||candidate==="nl"||candidate==="en"?candidate:"tr";
    setLanguage(selected);
    document.documentElement.lang=selected;
    try{ window.localStorage.setItem("avofis-language",selected); }catch{}
  },[]);
  return language;
}
