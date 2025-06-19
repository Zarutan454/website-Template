import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Importiere die Übersetzungen
import translationDE from './de/translation.json';
import translationEN from './en/translation.json';
import translationES from './es/translation.json';
import translationRU from './ru/translation.json';
import translationJA from './ja/translation.json';
import translationTR from './tr/translation.json';
import translationZH from './zh/translation.json';

// Definiere alle unterstützten Sprachen
export const languages = [
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
  },
  {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
  },
  {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    dir: 'ltr',
  },
];

// Ressourcen für i18next
const resources = {
  de: {
    translation: translationDE,
  },
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  ru: {
    translation: translationRU,
  },
  ja: {
    translation: translationJA,
  },
  tr: {
    translation: translationTR,
  },
  zh: {
    translation: translationZH,
  },
};

// Konfiguriere i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React escaped bereits
    },
    detection: {
      // Konfiguration für den Sprachdetektor
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      // URL-Format: /de/home, /en/home, etc.
      checkWhitelist: true,
    },
  });

/**
 * Gibt das aktuelle Sprachobjekt zurück
 * @returns {Object} Das Sprachobjekt mit Code, Name und Flagge
 */
export const getCurrentLanguageObject = () => {
  const currentLanguageCode = i18n.language || window.localStorage.i18nextLng || 'en';
  return languages.find((lang) => lang.code === currentLanguageCode) || languages[1]; // Fallback zu Englisch
};

/**
 * Ändert die aktuelle Sprache und aktualisiert die URL
 * @param {string} langCode - Der Sprachcode (z.B. 'de', 'en')
 */
export const changeLanguage = (langCode) => {
  if (i18n.language !== langCode) {
    i18n.changeLanguage(langCode);
    
    // URL-Lokalisierung aktualisieren
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    // Überprüfe, ob der erste Pfadteil ein Sprachcode ist
    const isFirstSegmentLang = languages.some(lang => lang.code === pathSegments[0]);
    
    if (isFirstSegmentLang) {
      // Ersetze den Sprachcode in der URL
      pathSegments[0] = langCode;
    } else {
      // Füge den Sprachcode am Anfang der URL hinzu
      pathSegments.unshift(langCode);
    }
    
    // Aktualisiere die URL ohne Neuladen der Seite
    const newPath = `/${pathSegments.join('/')}`;
    window.history.pushState({}, '', newPath);
  }
};

/**
 * Sichere Übersetzungsfunktion, die einen Fallback-Text zurückgibt, wenn der Schlüssel nicht existiert
 * @param {string} key - Der Übersetzungsschlüssel
 * @param {string} fallback - Der Fallback-Text
 * @param {Object} options - Optionen für die Übersetzung
 * @returns {string} Die übersetzte Zeichenfolge oder der Fallback-Text
 */
export const safeT = (key, fallback = '', options = {}) => {
  const translated = i18n.t(key, { ...options, defaultValue: fallback });
  return translated !== key ? translated : fallback;
};

/**
 * Sichere Übersetzungsfunktion für Objekte mit mehreren Übersetzungsschlüsseln
 * @param {Object} obj - Ein Objekt mit Übersetzungsschlüsseln
 * @param {Object} fallbackObj - Ein Fallback-Objekt
 * @returns {Object} Ein Objekt mit übersetzten Werten
 */
export const safeObjectT = (obj, fallbackObj = {}) => {
  if (!obj) return fallbackObj;
  
  const result = {};
  Object.keys(obj).forEach(key => {
    const translationKey = obj[key];
    result[key] = safeT(translationKey, fallbackObj[key] || '');
  });
  
  return result;
};

/**
 * Extrahiert den Sprachcode aus der URL
 * @returns {string|null} Der Sprachcode oder null, wenn keiner gefunden wurde
 */
export const getLanguageFromURL = () => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const possibleLangCode = pathSegments[0];
    if (languages.some(lang => lang.code === possibleLangCode)) {
      return possibleLangCode;
    }
  }
  return null;
};

/**
 * Initialisiert die URL-Lokalisierung beim ersten Laden der Seite
 */
export const initURLLocalization = () => {
  const urlLang = getLanguageFromURL();
  const currentLang = i18n.language || window.localStorage.i18nextLng || 'en';
  
  if (!urlLang) {
    // Kein Sprachcode in der URL, füge ihn hinzu
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    pathSegments.unshift(currentLang);
    const newPath = `/${pathSegments.join('/')}`;
    window.history.replaceState({}, '', newPath);
  } else if (urlLang !== currentLang) {
    // Sprachcode in der URL unterscheidet sich von der aktuellen Sprache
    i18n.changeLanguage(urlLang);
  }
};

export default i18n;
