import React, { createContext, useContext, useState } from 'react';
import { LanguageCapability } from '../types';
import { MOCK_LANGUAGES } from '../services/api';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (langCode: string) => void;
  availableLanguages: LanguageCapability[];
  t: (key: string) => string;
}

const UI_DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    tagline: 'Your Language. Your Voice. Your Government.',
    registerGrievance: 'Register a Grievance',
    trackComplaint: 'Track Your Complaint',
    myComplaints: 'My Grievances',
    departmentDashboard: 'Department Portal',
    adminDashboard: 'Admin Control',
    login: 'Sign In',
    register: 'Create Account',
    logout: 'Sign Out',
    howItWorks: 'How It Works',
    languages: 'Languages',
    about: 'About',
    help: 'Help & FAQs',
  },
  hi: {
    tagline: 'आपकी भाषा। आपकी आवाज़। आपकी सरकार।',
    registerGrievance: 'शिकायत दर्ज करें',
    trackComplaint: 'शिकायत की स्थिति जांचें',
    myComplaints: 'मेरी शिकायतें',
    departmentDashboard: 'विभागीय पोर्टल',
    adminDashboard: 'प्रशासनिक नियंत्रण',
    login: 'लॉग इन करें',
    register: 'नया खाता बनाएं',
    logout: 'लॉग आउट',
    howItWorks: 'यह कैसे काम करता है',
    languages: 'भाषाएं',
    about: 'परिचय',
    help: 'सहायता और प्रश्न',
  },
  mr: {
    tagline: 'तुमची भाषा. तुमचा आवाज. तुमचे सरकार.',
    registerGrievance: 'तक्रार नोंदवा',
    trackComplaint: 'तक्रारीची स्थिती तपासा',
    myComplaints: 'माझ्या तक्रारी',
    departmentDashboard: 'विभागीय पोर्टल',
    adminDashboard: 'प्रशासकीय नियंत्रण',
    login: 'लॉगिन करा',
    register: 'नोंदणी करा',
    logout: 'लॉग आउट',
    howItWorks: 'हे कसे कार्य करते',
    languages: 'भाषा',
    about: 'माहिती',
    help: 'मदत व प्रश्न',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    localStorage.getItem('jansahayak_lang') || 'en'
  );

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('jansahayak_lang', code);
  };

  const t = (key: string): string => {
    return UI_DICTIONARY[currentLanguage]?.[key] || UI_DICTIONARY['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        availableLanguages: MOCK_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
