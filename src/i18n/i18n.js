import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "@/i18n/language/en.json";
import vnTranslation from "@/i18n/language/vn.json";

const savedLang = localStorage.getItem("language");
const initialLang = savedLang === "en" || savedLang === "vi" ? savedLang : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    vn: {
      translation: vnTranslation,
    },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;