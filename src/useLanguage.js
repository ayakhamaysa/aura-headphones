import { useEffect, useState } from "react";

// Remembers the chosen language and flips the whole page
export function useLanguage() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("lang") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    // lang changes the fonts, dir flips the layout right ↔ left
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // private mode: just don't remember
    }
  }, [lang]);

  const toggle = () => setLang(lang === "ar" ? "en" : "ar");
  return { lang, toggle };
}
