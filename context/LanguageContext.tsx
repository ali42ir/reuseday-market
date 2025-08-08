

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations } from '../translations.ts';
import { useSystemSettings } from './SystemSettingsContext.tsx';

type Language = 'en' | 'fr' | 'fa' | 'nl' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { systemSettings } = useSystemSettings();

  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && ['en', 'fr', 'fa', 'nl', 'ar'].includes(storedLang)) {
      return storedLang as Language;
    }
    return systemSettings.defaultLanguage || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = ['fa', 'ar'].includes(language) ? 'rtl' : 'ltr';
  }, [language]);
  
  // Update language if system default changes and no user preference is set
  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (!storedLang && systemSettings.defaultLanguage) {
      setLanguageState(systemSettings.defaultLanguage);
    }
  }, [systemSettings.defaultLanguage]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const langTranslations = translations[language] || translations.en;
    let text = getNestedTranslation(langTranslations, key) || getNestedTranslation(translations.en, key) || key;

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{{${placeholder}}}`, String(replacements[placeholder]));
        });
    }

    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};