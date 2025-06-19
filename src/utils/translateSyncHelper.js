/**
 * translateSyncHelper.js
 * 
 * Dieses Script hilft bei der Synchronisierung aller Sprachdateien
 * und stellt sicher, dass die Struktur der Übersetzungsschlüssel
 * in allen Sprachen einheitlich gestaltet.
 * 
 * HINWEIS: Dieses Skript ist für die Verwendung in Node.js gedacht.
 * Um es auszuführen, importiere es in ein Node.js-Script und rufe die Funktionen manuell auf.
 * Beispiel:
 * import { updateFooterStructure, checkMissingTranslations } from './translateSyncHelper.js';
 * updateFooterStructure();
 * checkMissingTranslations();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname Polyfill für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Liest eine JSON-Datei ein
 * @param {string} filePath - Pfad zur JSON-Datei
 * @returns {object} Das geparste JSON-Objekt
 */
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Schreibt ein Objekt als JSON-Datei
 * @param {string} filePath - Pfad zur JSON-Datei
 * @param {object} data - Das zu schreibende Objekt
 */
function writeJsonFile(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`Datei ${filePath} erfolgreich geschrieben.`);
  } catch (error) {
    console.error(`Fehler beim Schreiben der Datei ${filePath}:`, error.message);
  }
}

/**
 * Aktualisiert die Footer-Struktur in allen Sprachdateien
 */
function updateFooterStructure() {
  const languages = ['en', 'de', 'es', 'ru', 'tr', 'ja', 'zh'];
  const translationsDir = path.resolve(__dirname, '../translations');
  
  // Die vollständige, korrekte Struktur aus der deutschen Datei wird als Referenz verwendet
  const deTranslationPath = path.join(translationsDir, 'de', 'translation.json');
  const deTranslation = readJsonFile(deTranslationPath);
  
  if (!deTranslation || !deTranslation.footer) {
    console.error('Deutsche Übersetzungsdatei konnte nicht gelesen werden oder enthält keinen footer-Bereich.');
    return;
  }

  // Durchlaufe alle Sprachen
  for (const lang of languages) {
    if (lang === 'de') continue; // Deutsche Datei ist bereits aktualisiert
    
    const translationPath = path.join(translationsDir, lang, 'translation.json');
    const translation = readJsonFile(translationPath);
    
    if (!translation) {
      console.error(`Übersetzungsdatei für ${lang} konnte nicht gelesen werden.`);
      continue;
    }
    
    // Stelle sicher, dass die footer-Struktur existiert
    if (!translation.footer) {
      translation.footer = {};
    }
    
    // Sicherstellen, dass die Title-Keys vorhanden sind
    if (!translation.footer.platformTitle && translation.footer.platform && typeof translation.footer.platform === 'string') {
      translation.footer.platformTitle = translation.footer.platform;
    } else if (!translation.footer.platformTitle) {
      translation.footer.platformTitle = deTranslation.footer.platformTitle;
    }
    
    if (!translation.footer.blockchainTitle && translation.footer.blockchain && typeof translation.footer.blockchain === 'string') {
      translation.footer.blockchainTitle = translation.footer.blockchain;
    } else if (!translation.footer.blockchainTitle) {
      translation.footer.blockchainTitle = deTranslation.footer.blockchainTitle;
    }
    
    if (!translation.footer.communityTitle && translation.footer.community && typeof translation.footer.community === 'string') {
      translation.footer.communityTitle = translation.footer.community;
    } else if (!translation.footer.communityTitle) {
      translation.footer.communityTitle = deTranslation.footer.communityTitle;
    }
    
    // Sicherstellen, dass die platform-, blockchain- und community-Objekte existieren
    if (!translation.footer.platform || typeof translation.footer.platform !== 'object') {
      translation.footer.platform = deTranslation.footer.platform;
    }
    
    if (!translation.footer.blockchain || typeof translation.footer.blockchain !== 'object') {
      translation.footer.blockchain = deTranslation.footer.blockchain;
    }
    
    if (!translation.footer.community || typeof translation.footer.community !== 'object') {
      translation.footer.community = deTranslation.footer.community;
    }
    
    // Sicherstellen, dass andere erforderliche Footer-Keys vorhanden sind
    const requiredKeys = [
      'description', 'rights', 'privacy', 'terms', 'contact'
    ];
    
    for (const key of requiredKeys) {
      if (!translation.footer[key]) {
        translation.footer[key] = deTranslation.footer[key];
      }
    }
    
    // Sicherstellen, dass die newsletter-Struktur existiert
    if (!translation.footer.newsletter) {
      translation.footer.newsletter = deTranslation.footer.newsletter;
    } else {
      // Stelle sicher, dass alle newsletter-Keys vorhanden sind
      const newsletterKeys = [
        'title', 'description', 'subscribers', 'placeholder', 'button', 'success', 'privacy'
      ];
      
      for (const key of newsletterKeys) {
        if (!translation.footer.newsletter[key]) {
          translation.footer.newsletter[key] = deTranslation.footer.newsletter[key];
        }
      }
    }
    
    // Speichere die aktualisierte Übersetzungsdatei
    writeJsonFile(translationPath, translation);
  }
  
  console.log('Footer-Struktur in allen Sprachen aktualisiert.');
}

/**
 * Prüft, ob alle Übersetzungsschlüssel in allen Sprachen vorhanden sind,
 * und gibt eine Liste der fehlenden Schlüssel aus
 */
function checkMissingTranslations() {
  const languages = ['en', 'de', 'es', 'ru', 'tr', 'ja', 'zh'];
  const translationsDir = path.resolve(__dirname, '../translations');

  // Die englische Datei wird als Referenz verwendet
  const enTranslationPath = path.join(translationsDir, 'en', 'translation.json');
  const enTranslation = readJsonFile(enTranslationPath);
  
  if (!enTranslation) {
    console.error('Englische Übersetzungsdatei konnte nicht gelesen werden.');
    return;
  }
  
  // Funktion zum Sammeln aller Schlüssel (auch verschachtelter)
  function collectKeys(obj, prefix = '') {
    let keys = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = [...keys, ...collectKeys(obj[key], fullKey)];
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }
  
  // Sammle alle Schlüssel aus der englischen Datei
  const enKeys = collectKeys(enTranslation);
  
  // Durchlaufe alle anderen Sprachen und prüfe, ob Schlüssel fehlen
  for (const lang of languages) {
    if (lang === 'en') continue; // Englische Datei ist die Referenz
    
    const translationPath = path.join(translationsDir, lang, 'translation.json');
    const translation = readJsonFile(translationPath);
    
    if (!translation) {
      console.error(`Übersetzungsdatei für ${lang} konnte nicht gelesen werden.`);
      continue;
    }
    
    // Funktion zum Prüfen, ob ein Schlüssel existiert
    function hasKey(obj, path) {
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (!current[part]) {
          return false;
        }
        current = current[part];
      }
      
      return true;
    }
    
    // Finde fehlende Schlüssel
    const missingKeys = enKeys.filter(key => !hasKey(translation, key));
    
    if (missingKeys.length > 0) {
      console.log(`\nFehlende Übersetzungen in ${lang}:`);
      missingKeys.forEach(key => console.log(`- ${key}`));
    } else {
      console.log(`\nKeine fehlenden Übersetzungen in ${lang}.`);
    }
  }
}

// Exportiere die Funktionen als ES-Module
export { updateFooterStructure, checkMissingTranslations };