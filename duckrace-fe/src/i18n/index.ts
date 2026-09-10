import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

const DEFAULT_LANGUAGE = "en";
const savedLanguage = localStorage.getItem("language");
const initialLanguage = savedLanguage === DEFAULT_LANGUAGE 
  ? savedLanguage : DEFAULT_LANGUAGE;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
