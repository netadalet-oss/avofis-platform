"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/avofis-content";

export function usePortalLanguage(): Language {
  const [language,setLanguage] = useState<Language>("tr");
  useEffect(()=>{
    const value = new URLSearchParams(window.location.search).get("lang");
    if(value==="tr"||value==="nl"||value==="en") setLanguage(value);
  },[]);
  return language;
}
