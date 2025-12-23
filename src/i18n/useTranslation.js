// src/i18n/useTranslation.js
import { useState, useEffect, useRef } from "react"; // ← добавь useRef
import {
  translations,
  supportedLanguages,
  defaultLanguage,
} from "./translations";

export function useTranslation() {
  const [lang, setLang] = useState(defaultLanguage);
  const isMounted = useRef(true); // ← флаг монтирования

  useEffect(() => {
    return () => {
      isMounted.current = false; // ← при размонтировании — false
    };
  }, []);

  useEffect(() => {
    // Проверка: выполняем только в браузере
    if (typeof window === "undefined") return;

    const savedLang = localStorage.getItem("lang");
    if (savedLang && supportedLanguages.includes(savedLang)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isMounted.current) setLang(savedLang); // ← проверка перед обновлением
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (supportedLanguages.includes(browserLang)) {
        const newLang = browserLang;
        if (isMounted.current) setLang(newLang);
        localStorage.setItem("lang", newLang);
      }
    }
  }, []);

  const t = (key, options = {}) => {
    let text =
      translations[lang]?.[key] || translations[defaultLanguage]?.[key] || key;

    Object.keys(options).forEach((placeholder) => {
      const value = options[placeholder];
      text = text.replace(new RegExp(`{{${placeholder}}}`, "g"), value);
    });

    return text;
  };

  const changeLanguage = (newLang) => {
    if (supportedLanguages.includes(newLang)) {
      if (isMounted.current) setLang(newLang);
      localStorage.setItem("lang", newLang);
      window.location.reload();
    }
  };

  return { t, lang, changeLanguage };
}
