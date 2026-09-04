import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, User, LogIn, LayoutDashboard, UserCheck, ShieldCheck, Home } from 'lucide-react';

export function Header() {
  const { lang, toggleLanguage, t, activeTab, setActiveTab, isLoggedIn, currentUser, profileCompleted, schemeMatches } = useApp();

  const eligibleCount = schemeMatches.filter(s => s.status === 'ELIGIBLE' || s.status === 'PARTIALLY_ELIGIBLE').length;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="brand" onClick={() => setActiveTab('landing')}>
            <div className="brand-badge">JS</div>
            <div>
              <div className="brand-title">{t.appName}</div>
              <div className="brand-sub">{t.appTagline}</div>
            </div>
          </div>

          <div className="nav-controls">
            <button className="lang-btn" onClick={toggleLanguage} title="Switch Language / மொழியை மாற்றவும்">
              <Globe size={16} />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {isLoggedIn ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="lang-btn" style={{ background: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 0.4)', color: '#60a5fa' }} onClick={() => setActiveTab('profile-wizard')}>
                  <UserCheck size={16} />
                  <span>{t.navProfile}</span>
                </button>

                <button className="lang-btn" style={{ background: 'rgba(5, 150, 105, 0.2)', borderColor: 'rgba(5, 150, 105, 0.4)', color: '#34d399' }} onClick={() => setActiveTab('dashboard')}>
                  <LayoutDashboard size={16} />
                  <span>{t.navDashboard}</span>
                </button>
              </div>
            ) : (
              <button className="lang-btn" style={{ background: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 0.4)', color: '#60a5fa' }} onClick={() => setActiveTab('login')}>
                <LogIn size={16} />
                <span>{t.navLogin}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab !== 'landing' && activeTab !== 'login' && (
        <div className="stepper-bar">
          {isLoggedIn && (
            <div 
              className={`step-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="step-num">★</span>
              <span>{t.navDashboard}</span>
            </div>
          )}

          <div 
            className={`step-item ${activeTab === 'profile-wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile-wizard')}
          >
            <span className="step-num">1</span>
            <span>{t.navProfile}</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="step-num">2</span>
            <span>{t.navChat}</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <span className="step-num">3</span>
            <span>{t.navResults} ({eligibleCount})</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            <span className="step-num">4</span>
            <span>{t.navDocs}</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <span className="step-num">5</span>
            <span>{t.navChecklist}</span>
          </div>
        </div>
      )}
    </header>
  );
}
