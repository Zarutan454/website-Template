/**
 * i18nUtils.js - Utilities for handling translations safely
 */

import i18n from '../translations/i18n';
import { languages } from '../translations/i18n';

/**
 * A helper function to safely retrieve translations with fallback
 * 
 * @param {Function} t - The translation function from useTranslation()
 * @param {string} key - The translation key
 * @param {string} fallback - Fallback text if translation is missing
 * @returns {string} - The translated text or fallback
 */
export const safeT = (t, key, fallback = '') => {
  if (!t || !key) return fallback;
  
  try {
    // Versuche, die Übersetzung zu bekommen
    const translation = t(key, { defaultValue: fallback });
    
    // Wenn die Übersetzung existiert und nicht der Schlüssel selbst ist
    if (translation !== key) {
      return translation;
    }
    
    return fallback;
  } catch (error) {
    console.error(`Error getting translation for key ${key}:`, error);
    return fallback;
  }
};

/**
 * A helper function to safely retrieve object translations with fallback
 * 
 * @param {Function} t - The translation function from useTranslation()
 * @param {string} path - The path to the translation object (e.g., 'aboutPage.milestones.items')
 * @param {any} fallback - Fallback value if translation is missing
 * @returns {any} - The translated object or fallback
 */
export const safeObjectT = (t, path, fallback) => {
  if (!t || !path) return fallback;
  
  try {
    // Versuche, die Übersetzung direkt zu bekommen
    const translation = t(path, { returnObjects: true });
    
    // Wenn die Übersetzung existiert und nicht der Schlüssel selbst ist
    if (translation !== path && translation !== undefined && translation !== null) {
      return translation;
    }
    
    // Alternativ versuche, das Objekt aus dem Ressourcenbundle zu holen
    const pathParts = path.split('.');
    const resources = i18n.getResourceBundle(i18n.language, 'translation');
    
    if (!resources) return fallback;
    
    // Navigiere durch das Objekt entsprechend dem Pfad
    let result = resources;
    for (const part of pathParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return fallback;
      }
    }
    
    return result || fallback;
  } catch (error) {
    console.error(`Error getting translation for path ${path}:`, error);
    return fallback;
  }
};

/**
 * Extrahiert den Sprachcode aus der URL
 * @returns {string|null} Der Sprachcode oder null, wenn keiner gefunden wurde
 */
export const getLanguageFromURL = () => {
  if (typeof window === 'undefined') return null;
  
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
 * Gibt das aktuelle Sprachobjekt zurück
 * @returns {Object} Das Sprachobjekt mit Code, Name und Flagge
 */
export const getCurrentLanguageObject = () => {
  const currentLanguageCode = i18n.language || 
    (typeof window !== 'undefined' ? window.localStorage.i18nextLng : null) || 
    'en';
  return languages.find((lang) => lang.code === currentLanguageCode) || languages.find(lang => lang.code === 'en');
};

/**
 * Erstellt die URL mit Sprachpräfix
 * @param {string} langCode - Der Sprachcode
 * @param {string} path - Der Pfad ohne Sprachcode
 * @returns {string} Die URL mit Sprachpräfix
 */
export const getUrlWithLanguage = (langCode, path = '') => {
  if (typeof window === 'undefined') return `/${langCode}${path ? `/${path}` : ''}`;
  
  const currentPath = path || window.location.pathname;
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // Entferne den Sprachcode, falls vorhanden
  if (languages.some(lang => lang.code === pathSegments[0])) {
    pathSegments.shift();
  }
  
  return `${window.location.origin}/${langCode}${pathSegments.length > 0 ? `/${pathSegments.join('/')}` : ''}`;
};

/**
 * Generiert hreflang-Links für alle unterstützten Sprachen
 * @param {string} path - Der aktuelle Pfad (optional)
 * @returns {Array} Array mit hreflang-Link-Objekten
 */
export const generateHrefLangLinks = (path = '') => {
  const hrefLangLinks = languages.map(lang => ({
    rel: 'alternate',
    hrefLang: lang.code,
    href: getUrlWithLanguage(lang.code, path)
  }));
  
  // Füge x-default hreflang hinzu
  hrefLangLinks.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: getUrlWithLanguage('en', path) // Englisch als Standard
  });
  
  return hrefLangLinks;
};

/**
 * Findet fehlende Übersetzungen in den angegebenen Sprachen
 * @param {Array} langs - Array mit Sprachcodes
 * @param {Object} referenceTranslations - Referenzübersetzungen (normalerweise Englisch)
 * @returns {Object} Objekt mit fehlenden Übersetzungen pro Sprache
 */
export const findMissingTranslations = (langs, referenceTranslations) => {
  const result = {};
  
  // Funktion zum rekursiven Durchsuchen von Objekten
  const findMissing = (refObj, targetObj, path = '') => {
    const missing = [];
    
    Object.keys(refObj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      
      if (typeof refObj[key] === 'object' && refObj[key] !== null) {
        // Rekursiv für verschachtelte Objekte
        if (!targetObj[key] || typeof targetObj[key] !== 'object') {
          missing.push(newPath);
        } else {
          const nestedMissing = findMissing(refObj[key], targetObj[key], newPath);
          missing.push(...nestedMissing);
        }
      } else {
        // Prüfe, ob der Schlüssel existiert
        if (targetObj[key] === undefined || targetObj[key] === '') {
          missing.push(newPath);
        }
      }
    });
    
    return missing;
  };
  
  // Durchsuche alle Sprachen
  langs.forEach(lang => {
    if (lang === i18n.language) return; // Überspringe die Referenzsprache
    
    const langResources = i18n.getResourceBundle(lang, 'translation');
    if (langResources) {
      result[lang] = findMissing(referenceTranslations, langResources);
    } else {
      result[lang] = ['Gesamte Übersetzung fehlt'];
    }
  });
  
  return result;
};

/**
 * Erstellt fehlende Übersetzungen basierend auf einem Referenzobjekt
 * @param {Object} referenceObj - Das Referenzobjekt mit allen Schlüsseln
 * @param {Object} targetObj - Das Zielobjekt, das ergänzt werden soll
 * @returns {Object} Ein neues Objekt mit allen Schlüsseln aus dem Referenzobjekt
 */
export const createMissingTranslations = (referenceObj, targetObj = {}) => {
  const result = { ...targetObj };
  
  // Rekursive Funktion zum Erstellen fehlender Schlüssel
  const createMissing = (refObj, target, result) => {
    Object.keys(refObj).forEach(key => {
      if (typeof refObj[key] === 'object' && refObj[key] !== null) {
        // Für verschachtelte Objekte
        if (!target[key] || typeof target[key] !== 'object') {
          result[key] = {};
        }
        createMissing(refObj[key], target[key] || {}, result[key]);
      } else {
        // Für einfache Werte
        if (target[key] === undefined || target[key] === '') {
          result[key] = ''; // Leerer String als Platzhalter
        }
      }
    });
  };
  
  createMissing(referenceObj, targetObj, result);
  return result;
};

/**
 * Formatiert ein Übersetzungsobjekt als JSON-String
 * @param {Object} translationObj - Das zu formatierende Übersetzungsobjekt
 * @returns {string} Formatierter JSON-String
 */
export const formatTranslations = (translationObj) => {
  return JSON.stringify(translationObj, null, 2);
};

export default {
  safeT,
  safeObjectT,
  getLanguageFromURL,
  getCurrentLanguageObject,
  getUrlWithLanguage,
  generateHrefLangLinks,
  findMissingTranslations,
  createMissingTranslations,
  formatTranslations
}; 