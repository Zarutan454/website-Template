import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguageObject, languages, changeLanguage } from '../../translations/i18n';

/**
 * LanguageSwitcher Komponente zum Wechseln der Sprache
 *
 * @param {Object} props - Komponenten-Props
 * @param {string} props.className - Optional: CSS-Klassen für den Container
 * @param {string} props.variant - Optional: Variante des Designs ('default' oder 'minimal')
 * @returns {React.ReactElement}
 */
const LanguageSwitcher = ({ className = '', variant = 'default' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang = getCurrentLanguageObject();

  // Schließt das Dropdown, wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Wechselt die Sprache
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // Minimale Variante (nur Flagge)
  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Change language"
        >
          <span className="text-xl">{currentLang.flag}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 bg-black/90 backdrop-blur-md rounded-md shadow-lg py-1 z-50 border border-gray-800">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`flex items-center w-full px-3 py-2 hover:bg-[#00a2ff]/20 transition ${
                  lang.code === i18n.language ? 'bg-[#00a2ff]/10 text-[#00a2ff]' : 'text-white'
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="text-lg mr-2">{lang.flag}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard-Variante (Flagge + Text)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Aktuell ausgewählte Sprache */}
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800/50 transition-colors text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown mit verfügbaren Sprachen */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-md shadow-lg overflow-hidden z-50 border border-gray-800">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`flex items-center w-full px-4 py-3 hover:bg-[#00a2ff]/20 transition ${
                lang.code === i18n.language
                ? 'bg-[#00a2ff]/10 text-[#00a2ff] border-l-2 border-[#00a2ff]'
                : 'text-white'
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="text-lg mr-3">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 