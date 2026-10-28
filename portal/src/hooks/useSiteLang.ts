"use client";
import { useEffect,useState } from "react";
import {type SiteLang,validLanguage} from "@/lib/avofis-site";
export function useSiteLang():SiteLang {
 const [lang,setLang]=useState<SiteLang>("tr");
 useEffect(()=>{setLang(validLanguage(new URLSearchParams(window.location.search).get("lang")));},[]);
 return lang;
}
