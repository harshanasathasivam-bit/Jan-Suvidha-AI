import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  MessageSquare, 
  Award, 
  FileCheck, 
  ClipboardCheck, 
  UserCheck, 
  LayoutDashboard, 
  UserPlus, 
  LogIn 
} from 'lucide-react';

export function Header() {
  const { 
    lang, 
    toggleLanguage, 
    t, 
    activeTab, 
    setActiveTab, 
    schemeMatches,
    isLoggedIn,
    setAuthMode
  } = useApp();

  const eligibleCount = schemeMatches.filter(s => s.status === 'ELIGIBLE').length;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Brand Logo & Title */}
          <div className="brand" onClick={() => setActiveTab('landing')}>
            <div className="brand-badge">
              <span>JS</span>
            </div>
            <div>
              <div className="brand-title">{t.appName}</div>
              <div className="brand-sub">{t.appTagline}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="header-nav">
            <button 
              className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} />
              <span>{t.navChat}</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <Award size={16} />
              <span>{t.navResults} ({eligibleCount})</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              <FileCheck size={16} />
              <span>{t.navDocs}</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
              onClick={() => setActiveTab('checklist')}
            >
              <ClipboardCheck size={16} />
              <span>{t.navChecklist}</span>
            </button>
          </nav>

          {/* Controls: Language and Auth */}
          <div className="nav-controls">
            <button className="lang-btn" onClick={toggleLanguage} title="Switch Language / மொழியை மாற்றவும்">
              <Globe size={15} />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {isLoggedIn ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="lang-btn" 
                  style={{ background: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 0.4)', color: '#60a5fa' }} 
                  onClick={() => setActiveTab('profile-wizard')}
                >
                  <UserCheck size={16} />
                  <span>{t.navProfile}</span>
                </button>

                <button 
                  className="lang-btn" 
                  style={{ background: 'rgba(5, 150, 105, 0.2)', borderColor: 'rgba(5, 150, 105, 0.4)', color: '#34d399' }} 
                  onClick={() => setActiveTab('dashboard')}
                >
                  <LayoutDashboard size={16} />
                  <span>{t.navDashboard}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="lang-btn" 
                  style={{ background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', color: '#fff', fontWeight: '600', boxShadow: '0 2px 8px rgba(37,99,235,0.4)' }} 
                  onClick={() => { setAuthMode('register'); setActiveTab('login'); }}
                >
                  <UserPlus size={16} />
                  <span>{t.navRegister || 'Register'}</span>
                </button>

                <button 
                  className="lang-btn" 
                  style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#f1f5f9' }} 
                  onClick={() => { setAuthMode('login'); setActiveTab('login'); }}
                >
                  <LogIn size={16} />
                  <span>{t.navLogin || 'Login'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
