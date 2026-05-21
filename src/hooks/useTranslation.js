import enTranslation from "@/i18n/language/en.json";
import vnTranslation from "@/i18n/language/vn.json";
import { useUiStore } from "@store/uiStore";

const resources = {
  en: enTranslation,
  vi: vnTranslation,
};

/**
 * Custom useTranslation hook.
 * Reads translations directly from JSON resource files.
 * The JSON files use dot-notation flat keys (e.g. "header.language").
 * Re-renders via zustand store's currentLanguage selector.
 */
export const useTranslation = () => {
  const lang = useUiStore((s) => s.currentLanguage) || "en";
  const dict = resources[lang] || resources.en;

  const t = (key, options) => {
    // Keys in the JSON are dot-notation flat strings:
    // e.g. "header.language", NOT nested header -> language
    let value = dict[key];
    if (value === undefined || value === null) {
      // Fallback to English
      value = resources.en[key];
    }
    if (value === undefined || value === null) return key;

    // Simple interpolation for {placeholder} patterns
    if (options) {
      value = String(value).replace(/\{(\w+)\}/g, (_, name) => {
        return options[name] !== undefined ? String(options[name]) : `{${name}}`;
      });
    }

    return value;
  };

  return { t, lang };
};

export default useTranslation;
