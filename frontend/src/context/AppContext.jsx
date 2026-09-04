import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('landing');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [profile, setProfile] = useState({
    age: 24,
    gender: 'female',
    state_domicile: 'tamil_nadu',
    annual_family_income: 120000,
    ration_card_head: true,
    ration_card_holder: true,
    school_type_6_to_12: 'tn_govt_school',
    education_course_type: 'regular_higher_education',
    education_level: '12th_pass',
    marital_status: 'married',
    district: 'Chennai'
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'ta' 
        ? 'வணக்கம்! நான் ஜன் சுவிதா AI. உங்கள் வயது, பாலினம், வருமானம், பள்ளிப் படிப்பு மற்றும் மாவட்டம் பற்றிப் பேசுங்கள். உங்களுக்குப் பொருத்தமான நலத்திட்டங்களைக் கண்டுபிடிக்கிறேன்.' 
        : 'Hello! I am Jan Suvidha AI. Tell me about your age, gender, family income, school, and district. I will match you with Tamil Nadu welfare schemes.'
    }
  ]);

  const [schemeMatches, setSchemeMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [verifiedDocs, setVerifiedDocs] = useState([]);

  const t = translations[lang] || translations.en;

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const loginUser = (userObj) => {
    setCurrentUser(userObj);
    setIsLoggedIn(true);
    if (userObj.profile) {
      updateProfileAndMatch(userObj.profile);
    }
    setActiveTab('dashboard');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('landing');
  };

  // Fetch grounded matches whenever profile updates
  const updateProfileAndMatch = async (newProfileFields) => {
    const updated = { ...profile, ...newProfileFields };
    setProfile(updated);

    try {
      setLoadingMatches(true);
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updated })
      });
      const data = await res.json();
      if (data.success) {
        setSchemeMatches(data.schemes || []);
      }
    } catch (err) {
      console.warn('Error fetching scheme matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    updateProfileAndMatch({});
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        t,
        activeTab,
        setActiveTab,
        isLoggedIn,
        currentUser,
        loginUser,
        logoutUser,
        profile,
        setProfile,
        updateProfileAndMatch,
        messages,
        setMessages,
        schemeMatches,
        setSchemeMatches,
        loadingMatches,
        verifiedDocs,
        setVerifiedDocs
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
