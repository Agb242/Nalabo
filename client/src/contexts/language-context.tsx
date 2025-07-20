import React, { createContext, useContext, useState, useEffect } from 'react';
import { t, type Language } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to French
    const stored = localStorage.getItem('nalabo-language') as Language;
    return stored && ['fr', 'en'].includes(stored) ? stored : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('nalabo-language', language);
  }, [language]);

  const translateFn = (key: string) => t(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translateFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}