import React from 'react';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, getCurrentLanguageObject } from '../translations/i18n';
import { safeT } from '../utils/i18nUtils';

/**
 * A component to test the multilingual support
 * Displays text in all supported languages and allows switching between them
 */
const LanguageTester = () => {
  const { t } = useTranslation();
  const currentLang = getCurrentLanguageObject();

  // Test translation keys to verify
  const testKeys = [
    'common.learnMore',
    'navigation.home',
    'aboutPage.title',
    'documentationPage.title',
    'communityPage.title'
  ];

  return (
    <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 my-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-light text-white mb-4">Language Support Test</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-medium text-[#00a2ff] mb-2">Current Language</h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{currentLang.flag}</span>
          <span className="text-white">{currentLang.name}</span>
          <span className="text-white/50">({currentLang.code})</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-medium text-[#00a2ff] mb-2">Test Translations</h3>
        <ul className="space-y-2">
          {testKeys.map(key => (
            <li key={key} className="flex justify-between">
              <span className="text-white/70">{key}:</span>
              <span className="text-white font-medium">{safeT(t, key, '(missing)')}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-medium text-[#00a2ff] mb-2">Switch Language</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`flex items-center justify-center space-x-2 p-2 rounded-md transition-colors ${
                lang.code === currentLang.code 
                  ? 'bg-[#00a2ff]/20 text-[#00a2ff]' 
                  : 'bg-black/20 text-white/70 hover:bg-[#00a2ff]/10 hover:text-white'
              }`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageTester;
