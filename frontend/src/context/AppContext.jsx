import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { getApiUrl } from '../utils/api';
import { evaluateClientSchemes } from '../utils/clientSchemeEngine';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('landing');

  // Auth & Profile state
  const [token, setToken] = useState(localStorage.getItem('jan_suvidha_token') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'

  // Selected category & search for Scheme Discovery UX
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Currently focused scheme for document verification & checklist
  const [selectedSchemeId, setSelectedSchemeId] = useState('kmut');

  const [profile, setProfile] = useState({
    name: 'Citizen',
    age: 45,
    gender: 'male',
    occupation: 'farmer',
    state_domicile: 'tamil_nadu',
    annual_family_income: 120000,
    family_size: 4,
    ration_card_head: true,
    ration_card_holder: true,
    owns_pucca_house: false,
    owns_four_wheeler: false,
    school_type_6_to_12: 'tn_govt_school',
    education_course_type: 'regular_higher_education',
    education_level: '10th_pass',
    marital_status: 'married',
    district: 'Thanjavur'
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'ta'
        ? 'வணக்கம்! நான் ஜன் சுவிதா AI. உங்கள் தொழில், வயது, குடும்ப வருமானம் மற்றும் தேவைகளைக் கூறுங்கள். உங்களுக்குப் பொருத்தமான தமிழ்நாடு மற்றும் மத்திய அரசு நலத்திட்டங்களை உடனடியாகக் கண்டறிந்து தருகிறேன்.'
        : 'Hello! I am Jan Suvidha AI. Tell me about your occupation, age, annual income, and welfare needs. I will evaluate grounded eligibility across official schemes.'
    }
  ]);

  const [schemeMatches, setSchemeMatches] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Document states for Smart Document Checker
  const [verifiedDocs, setVerifiedDocs] = useState([
    {
      docKey: 'aadhaar_card',
      docNameEn: 'Aadhaar Card (Bank Linked)',
      docNameTa: 'ஆதார் கார்டு',
      docType: 'AADHAAR_CARD',
      ocrStatus: 'SUCCESS',
      readability: 'CLEAR',
      requiredFields: '12-digit UID detected',
      expiryStatus: 'VALID',
      status: 'READY',
      notesEn: 'Clear scan. 12-digit Aadhaar verified and bank linkage active.',
      notesTa: 'தெளிவான நகல். 12 இலக்க ஆதார் எண் சரியாக உள்ளது.'
    },
    {
      docKey: 'income_certificate',
      docNameEn: 'Revenue Income Certificate',
      docNameTa: 'வருமானச் சான்றிதழ்',
      docType: 'INCOME_CERTIFICATE',
      ocrStatus: 'WARNING',
      readability: 'FAIR',
      requiredFields: 'Income ₹1,20,000 detected',
      expiryStatus: 'ATTENTION_REQUIRED',
      status: 'NEEDS_ATTENTION',
      notesEn: 'Certificate issue date is over 11 months old. Fresh VAO renewal recommended.',
      notesTa: 'சான்றிதழ் வழங்கப்பட்டு 11 மாதங்கள் ஆகிறது. புதுப்பித்தல் தேவைப்படலாம்.'
    },
    {
      docKey: 'ration_card',
      docNameEn: 'Smart Family Ration Card',
      docNameTa: 'ஸ்மார்ட் குடும்ப அட்டை',
      docType: 'RATION_CARD',
      ocrStatus: 'SUCCESS',
      readability: 'CLEAR',
      requiredFields: 'Family Head & 4 members listed',
      expiryStatus: 'VALID',
      status: 'READY',
      notesEn: 'Active Tamil Nadu PDS Smart Card. Head of household verified.',
      notesTa: 'செயலில் உள்ள ஸ்மார்ட் குடும்ப அட்டை.'
    }
  ]);

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

  // Strict Authentication & Onboarding Gating
  const setTabGated = (tabName) => {
    if (!isLoggedIn) {
      // Require registration/login for all internal pages
      if (tabName !== 'landing' && tabName !== 'login') {
        setAuthMode('register');
        setActiveTab('login');
        return;
      }
    } else if (!profileCompleted) {
      // Force onboarding profile wizard for first-time users
      if (tabName !== 'profile-wizard' && tabName !== 'login') {
        setActiveTab('profile-wizard');
        return;
      }
    }
    setActiveTab(tabName);
  };

  // Fetch grounded matches whenever profile updates
  const updateProfileAndMatch = async (newProfileFields) => {
    const updated = { ...profile, ...newProfileFields };
    setProfile(updated);

    // Instant grounded client-side evaluation fallback
    const clientMatches = evaluateClientSchemes(updated);
    setSchemeMatches(clientMatches);

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
      console.warn('Error fetching backend scheme matches, utilizing client engine matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Initial fetch of all schemes and initial matching
  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => {
        if (data.schemes) setAllSchemes(data.schemes);
      })
      .catch(err => console.warn('Error fetching initial schemes:', err));

    updateProfileAndMatch({});
  }, []);

  // Selected Scheme object
  const selectedScheme = schemeMatches.find(s => s.schemeId === selectedSchemeId) || schemeMatches[0] || null;

  // Compute Application Readiness Score
  const calculateReadiness = () => {
    // 1. Profile Completeness (30%)
    const profileKeys = ['age', 'gender', 'occupation', 'annual_family_income', 'state_domicile', 'district'];
    const filledCount = profileKeys.filter(k => profile[k] !== null && profile[k] !== undefined).length;
    const profileScore = Math.round((filledCount / profileKeys.length) * 100);

    // 2. Eligibility Match (40%)
    const topScheme = selectedScheme || schemeMatches[0];
    const eligibilityScore = topScheme ? topScheme.matchPercentage : 80;

    // 3. Document Readiness (30%)
    const readyCount = verifiedDocs.filter(d => d.status === 'READY').length;
    const totalDocsRequired = (topScheme && topScheme.requiredDocuments) ? Math.max(topScheme.requiredDocuments.length, 3) : 4;
    const docScore = Math.min(100, Math.round((readyCount / totalDocsRequired) * 100));

    // Weighted Overall Score
    const overallScore = Math.round((profileScore * 0.3) + (eligibilityScore * 0.4) + (docScore * 0.3));

    const readyItems = [
      'Citizen profile attributes complete (Age, Income, Occupation)',
      'Grounded eligibility verified against official government rules',
      'Aadhaar Card scanned and linked with bank account',
      'Smart Family Ration Card verified with family head'
    ];

    const attentionItems = [
      'Income certificate is over 11 months old; revenue renewal recommended',
      'Bank passbook copy not yet uploaded for direct benefit credit'
    ];

    const nextActions = [
      { id: 1, text: 'Upload bank passbook copy to complete document checklist', targetTab: 'docs' },
      { id: 2, text: 'Verify or renew income certificate with local Revenue Tahsildar / VAO', targetTab: 'docs' },
      { id: 3, text: `Continue to official portal (${topScheme?.officialSource || 'Government Portal'})`, targetUrl: topScheme?.officialUrl || 'https://tnsocialwelfare.tn.gov.in' }
    ];

    return {
      overallScore: Math.min(100, Math.max(20, overallScore)),
      profileScore,
      eligibilityScore,
      docScore,
      readyItems,
      attentionItems,
      nextActions,
      readyDocCount: readyCount,
      totalDocCount: totalDocsRequired
    };
  };

  const readinessMetrics = calculateReadiness();

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
        allSchemes,
        selectedSchemeId,
        setSelectedSchemeId,
        selectedScheme,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        loadingMatches,
        verifiedDocs,
        setVerifiedDocs,
        readinessMetrics
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
