import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { findMissingTranslationKeys } from './translationHelper';

/**
 * TranslationChecker Component
 * 
 * Diese Komponente zeigt einen Überblick über fehlende Übersetzungen in allen Sprachen an.
 * Sie ist nützlich für die Entwicklung und sollte nicht in der Produktionsumgebung verwendet werden.
 */
const TranslationChecker = () => {
  const { t, i18n } = useTranslation();
  const [missingTranslations, setMissingTranslations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Alle verfügbaren Sprachen
  const languages = Object.keys(i18n.options.resources || {});

  useEffect(() => {
    const checkTranslations = async () => {
      setIsLoading(true);
      
      try {
        const missing = {};
        
        // Für jede Sprache fehlende Übersetzungen finden
        for (const lang of languages) {
          const missingKeys = await findMissingTranslationKeys(lang);
          missing[lang] = missingKeys;
        }
        
        setMissingTranslations(missing);
      } catch (error) {
        console.error('Error checking translations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkTranslations();
  }, [languages]);

  // Berechne die Gesamtzahl der fehlenden Übersetzungen
  const getTotalMissingCount = (lang) => {
    if (!missingTranslations[lang]) return 0;
    
    return Object.values(missingTranslations[lang]).reduce((total, section) => {
      return total + section.length;
    }, 0);
  };

  // Berechne die Gesamtzahl der fehlenden Übersetzungen für alle Sprachen
  const getAllMissingCount = () => {
    return languages.reduce((total, lang) => {
      return total + getTotalMissingCount(lang);
    }, 0);
  };

  // Filtere die anzuzeigenden fehlenden Übersetzungen basierend auf der ausgewählten Sprache
  const getFilteredMissingTranslations = () => {
    if (selectedLanguage === 'all') {
      return missingTranslations;
    }
    
    return {
      [selectedLanguage]: missingTranslations[selectedLanguage]
    };
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-light mb-6">Translation Checker</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a2ff]"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-lg">Filter by language:</span>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()} ({getTotalMissingCount(lang)} missing)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {languages.map(lang => (
                <div 
                  key={lang}
                  className={`p-4 rounded-lg border ${
                    getTotalMissingCount(lang) > 0 
                      ? 'bg-red-900/20 border-red-800' 
                      : 'bg-green-900/20 border-green-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{lang.toUpperCase()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      getTotalMissingCount(lang) > 0 ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {getTotalMissingCount(lang)} missing
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 rounded-lg bg-gray-800 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium">Total Missing Translations</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  getAllMissingCount() > 0 ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  {getAllMissingCount()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.entries(getFilteredMissingTranslations()).map(([lang, sections]) => (
              <div key={lang} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-light mb-4 text-[#00a2ff]">{lang.toUpperCase()}</h2>
                
                {Object.keys(sections).length === 0 ? (
                  <div className="text-green-400">No missing translations!</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(sections).map(([section, keys]) => (
                      <div key={section} className="border-l-4 border-[#00a2ff] pl-4">
                        <h3 className="text-xl font-medium mb-2">{section}</h3>
                        {keys.length === 0 ? (
                          <div className="text-green-400">No missing keys</div>
                        ) : (
                          <ul className="list-disc list-inside space-y-1">
                            {keys.map(key => (
                              <li key={key} className="text-red-400">
                                {key}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TranslationChecker;