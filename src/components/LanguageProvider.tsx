import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageContextType, getInitialLanguage } from './LanguageProvider.utils';
import { translations } from './LanguageProvider.utils';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Exportiere ggf. nur Komponenten, alles andere in LanguageProvider.utils.ts auslagern
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsn-language', lang);
    }
  };
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };
export type { LanguageContextType };
