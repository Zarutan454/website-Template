/**
 * translationHelper.js
 * Hilfsfunktionen zur Verwaltung und Überprüfung von Übersetzungen
 */

import i18n from '../translations/i18n';

/**
 * Findet fehlende Übersetzungsschlüssel für eine bestimmte Sprache
 * im Vergleich zur Basissprache (normalerweise Englisch)
 * 
 * @param {string} language - Die zu prüfende Sprache
 * @param {string} baseLanguage - Die Basissprache (Standard: 'en')
 * @returns {Object} - Ein Objekt mit fehlenden Schlüsseln nach Abschnitten gruppiert
 */
export const findMissingTranslationKeys = async (language, baseLanguage = 'en') => {
  // Stelle sicher, dass i18n initialisiert ist
  if (!i18n.isInitialized) {
    await new Promise(resolve => {
      i18n.on('initialized', resolve);
    });
  }
  
  const baseResources = i18n.getResourceBundle(baseLanguage, 'translation');
  const targetResources = i18n.getResourceBundle(language, 'translation');
  
  if (!baseResources || !targetResources) {
    console.error(`Resources not found for ${baseLanguage} or ${language}`);
    return {};
  }
  
  return findMissingKeys(baseResources, targetResources);
};

/**
 * Rekursiv fehlende Schlüssel in einem Übersetzungsobjekt finden
 * 
 * @param {Object} baseObj - Das Basis-Übersetzungsobjekt
 * @param {Object} targetObj - Das zu prüfende Übersetzungsobjekt
 * @param {string} prefix - Präfix für verschachtelte Schlüssel
 * @returns {Object} - Ein Objekt mit fehlenden Schlüsseln nach Abschnitten gruppiert
 */
const findMissingKeys = (baseObj, targetObj, prefix = '') => {
  const missingKeys = {};
  
  // Durchlaufe alle Schlüssel im Basisobjekt
  for (const key in baseObj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    // Wenn der Schlüssel im Zielobjekt fehlt
    if (!(key in targetObj)) {
      // Extrahiere den Hauptabschnitt (z.B. 'homepage' aus 'homepage.title')
      const section = prefix || key;
      
      if (!missingKeys[section]) {
        missingKeys[section] = [];
      }
      
      missingKeys[section].push(fullKey);
    } 
    // Wenn beide Werte Objekte sind, rekursiv prüfen
    else if (
      typeof baseObj[key] === 'object' && 
      baseObj[key] !== null &&
      typeof targetObj[key] === 'object' &&
      targetObj[key] !== null
    ) {
      const nestedMissing = findMissingKeys(baseObj[key], targetObj[key], fullKey);
      
      // Füge fehlende Schlüssel aus verschachtelten Objekten hinzu
      for (const section in nestedMissing) {
        if (!missingKeys[section]) {
          missingKeys[section] = [];
        }
        
        missingKeys[section].push(...nestedMissing[section]);
      }
    }
  }
  
  return missingKeys;
};

/**
 * Erstellt ein Übersetzungsobjekt mit fehlenden Schlüsseln
 * 
 * @param {Object} baseTranslations - Die Basisübersetzungen
 * @param {Array} missingKeys - Liste der fehlenden Schlüssel
 * @returns {Object} - Ein Übersetzungsobjekt mit den fehlenden Schlüsseln
 */
export const createMissingTranslations = (baseTranslations, missingKeys) => {
  const result = {};
  
  for (const key of missingKeys) {
    const value = getNestedValue(baseTranslations, key);
    setNestedValue(result, key, value);
  }
  
  return result;
};

/**
 * Holt einen verschachtelten Wert aus einem Objekt
 * 
 * @param {Object} obj - Das Objekt
 * @param {string} path - Der Pfad zum Wert (z.B. 'homepage.title')
 * @returns {any} - Der Wert oder undefined
 */
const getNestedValue = (obj, path) => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  
  return current;
};

/**
 * Setzt einen verschachtelten Wert in einem Objekt
 * 
 * @param {Object} obj - Das Zielobjekt
 * @param {string} path - Der Pfad (z.B. 'homepage.title')
 * @param {any} value - Der zu setzende Wert
 */
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
};

/**
 * Formatiert ein Übersetzungsobjekt als JSON-String
 * 
 * @param {Object} translations - Das zu formatierende Übersetzungsobjekt
 * @returns {string} - Formatierter JSON-String
 */
export const formatTranslations = (translations) => {
  return JSON.stringify(translations, null, 2);
};

/**
 * Prüft die Vollständigkeit aller Übersetzungen im Vergleich zu einer Basissprache
 * 
 * @param {Object} allTranslations - Objekt mit allen Übersetzungen nach Sprache
 * @param {string} baseLanguage - Die Basissprache (Standard: 'en')
 * @returns {Object} - Ein Bericht über die Vollständigkeit der Übersetzungen
 */
export const checkAllTranslations = (allTranslations, baseLanguage = 'en') => {
  const baseTranslation = allTranslations[baseLanguage];
  const report = {};
  
  // Alle Schlüssel aus der Basisübersetzung extrahieren
  const baseKeys = extractAllKeys(baseTranslation);
  
  // Jede Sprache prüfen
  for (const lang in allTranslations) {
    if (lang === baseLanguage) continue;
    
    const translation = allTranslations[lang];
    const langKeys = extractAllKeys(translation);
    
    // Fehlende und zusätzliche Schlüssel finden
    const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
    const extraKeys = langKeys.filter(key => !baseKeys.includes(key));
    
    // Vollständigkeit berechnen
    const completeness = ((baseKeys.length - missingKeys.length) / baseKeys.length) * 100;
    
    report[lang] = {
      completeness,
      missingCount: missingKeys.length,
      extraCount: extraKeys.length,
      missingKeys,
      extraKeys
    };
  }
  
  return report;
};

/**
 * Extrahiert alle Schlüssel aus einem verschachtelten Objekt
 * 
 * @param {Object} obj - Das Objekt
 * @param {string} prefix - Präfix für verschachtelte Schlüssel
 * @returns {Array} - Liste aller Schlüssel
 */
const extractAllKeys = (obj, prefix = '') => {
  let keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(extractAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

/**
 * Findet zusätzliche Schlüssel in einer Zielsprache, die in der Referenzsprache nicht existieren
 * 
 * @param {Object} referenceTranslations - Die Referenzübersetzungen (normalerweise Englisch)
 * @param {Object} targetTranslations - Die zu überprüfenden Übersetzungen
 * @param {String} prefix - Präfix für verschachtelte Schlüssel (für rekursive Aufrufe)
 * @returns {Array} - Array mit zusätzlichen Schlüsseln
 */
export function findExtraKeys(referenceTranslations, targetTranslations, prefix = '') {
  const extraKeys = [];
  
  // Durchlaufe alle Schlüssel in der Zielübersetzung
  Object.keys(targetTranslations).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    // Wenn der Schlüssel in der Referenz nicht existiert, füge ihn zur Liste hinzu
    if (!(key in referenceTranslations)) {
      extraKeys.push(fullKey);
    } 
    // Wenn beide Werte Objekte sind, rekursiv prüfen
    else if (
      typeof targetTranslations[key] === 'object' && 
      targetTranslations[key] !== null &&
      !Array.isArray(targetTranslations[key]) &&
      typeof referenceTranslations[key] === 'object' &&
      referenceTranslations[key] !== null &&
      !Array.isArray(referenceTranslations[key])
    ) {
      const nestedExtraKeys = findExtraKeys(
        referenceTranslations[key], 
        targetTranslations[key], 
        fullKey
      );
      extraKeys.push(...nestedExtraKeys);
    }
  });
  
  return extraKeys;
}

/**
 * Fügt fehlende Übersetzungen zu einer Zielsprache hinzu
 * 
 * @param {Object} targetTranslations - Die zu aktualisierenden Übersetzungen
 * @param {Object} missingTranslations - Die hinzuzufügenden Übersetzungen
 * @returns {Object} - Die aktualisierten Übersetzungen
 */
export function addMissingTranslations(targetTranslations, missingTranslations) {
  // Erstelle eine tiefe Kopie der Zielübersetzungen
  const updatedTranslations = JSON.parse(JSON.stringify(targetTranslations));
  
  // Rekursive Funktion zum Hinzufügen fehlender Übersetzungen
  function mergeObjects(target, source) {
    Object.keys(source).forEach(key => {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        // Erstelle das Objekt, wenn es nicht existiert
        if (!target[key]) {
          target[key] = {};
        }
        // Rekursiv für verschachtelte Objekte
        mergeObjects(target[key], source[key]);
      } else {
        // Füge den Wert hinzu, wenn er nicht existiert
        if (!(key in target)) {
          target[key] = source[key];
        }
      }
    });
  }
  
  mergeObjects(updatedTranslations, missingTranslations);
  return updatedTranslations;
}