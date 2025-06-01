import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'uk');

  const changeLanguage = async (lng) => {
    try {      
      if (i18n && typeof i18n.changeLanguage === 'function') {
        await i18n.changeLanguage(lng);
        setCurrentLanguage(lng);
        
        localStorage.setItem('i18nextLng', lng);
        } else {
        console.error('i18n is not properly initialized');
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const availableLanguages = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    if (i18n && i18n.language) {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n.language]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      availableLanguages,
      isRTL: false,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;