import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { getApiUrl } from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('landing');
  
  // Auth & Profile state
  const [token, setToken] = useState(localStorage.getItem('jan_suvidha_token') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);

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

  const loginWithToken = (jwtToken, userObj) => {
    localStorage.setItem('jan_suvidha_token', jwtToken);
    setToken(jwtToken);
    setCurrentUser(userObj);
    setIsLoggedIn(true);

    const isDone = Boolean(userObj?.profile_completed);
    setProfileCompleted(isDone);

    if (!isDone) {
      // Force onboarding for first-time users
      setActiveTab('profile-wizard');
    } else {
      setActiveTab('dashboard');
    }

    if (userObj) {
      updateProfileAndMatch({
        district: userObj.district || profile.district,
        annual_family_income: userObj.annual_income || profile.annual_family_income
      });
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('jan_suvidha_token');
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setProfileCompleted(false);
    setActiveTab('landing');
  };

  // Restore session from token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('jan_suvidha_token');
    if (savedToken) {
      fetch(getApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setIsLoggedIn(true);
            const isDone = Boolean(data.user.profile_completed);
            setProfileCompleted(isDone);

            if (!isDone) {
              setActiveTab('profile-wizard');
            }

            updateProfileAndMatch({
              district: data.user.district,
              annual_family_income: data.user.annual_income
            });
          } else {
            logoutUser();
          }
        })
        .catch(() => logoutUser());
    }
  }, []);

  // Strict gating: If logged in but profile not completed, lock activeTab to 'profile-wizard'
  const setTabGated = (tabName) => {
    if (isLoggedIn && !profileCompleted && tabName !== 'profile-wizard') {
      setActiveTab('profile-wizard');
      return;
    }
    setActiveTab(tabName);
  };

  // Fetch grounded matches whenever profile updates
  const updateProfileAndMatch = async (newProfileFields) => {
    const updated = { ...profile, ...newProfileFields };
    setProfile(updated);

    try {
      setLoadingMatches(true);
      const res = await fetch(getApiUrl('/api/match'), {
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

  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        t,
        activeTab,
        setActiveTab: setTabGated,
        authMode,
        setAuthMode,
        token,
        isLoggedIn,
        currentUser,
        profileCompleted,
        setProfileCompleted,
        loginWithToken,
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
