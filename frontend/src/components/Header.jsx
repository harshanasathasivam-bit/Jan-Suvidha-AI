import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  MessageSquare, 
  Award, 
  FileCheck, 
  ClipboardCheck 
} from 'lucide-react';

export function Header() {
  const { 
    lang, 
    toggleLanguage, 
    t, 
    activeTab, 
    setActiveTab, 
    schemeMatches 
  } = useApp();

  const eligibleCount = schemeMatches.filter(s => s.status === 'ELIGIBLE' || s.matchPercentage >= 70).length;

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

          {/* Language Switch */}
          <div className="nav-controls">
            <button className="lang-btn" onClick={toggleLanguage} title="Switch Language / மொழியை மாற்றவும்">
              <Globe size={15} />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
