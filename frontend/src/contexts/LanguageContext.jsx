import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGS, translations, getDir } from '@/i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'es';
    return localStorage.getItem('levond_lang') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('levond_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = getDir(lang);
  }, [lang]);

  const value = useMemo(() => {
    const t = translations[lang] || translations.en;
    return { lang, setLang, t, langs: LANGS };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
