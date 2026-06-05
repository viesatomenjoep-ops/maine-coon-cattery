'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('nl');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved && ['nl', 'en', 'es'].includes(saved)) {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang) => {
    if (['nl', 'en', 'es'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('lang', lang);
    }
  };

  const t = (key) => {
    const translationGroup = translations[language];
    if (!translationGroup) return key;
    return translationGroup[key] || translations['nl'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
