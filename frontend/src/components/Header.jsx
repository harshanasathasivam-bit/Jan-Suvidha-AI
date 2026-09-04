import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, ShieldCheck, Home, MessageSquare, Award, FileText, CheckCircle2 } from 'lucide-react';

export function Header() {
  const { lang, toggleLanguage, t, activeTab, setActiveTab, schemeMatches } = useApp();

  const eligibleCount = schemeMatches.filter(s => s.status === 'ELIGIBLE').length;

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
          </div>
        </div>
      </div>

      {activeTab !== 'landing' && (
        <div className="stepper-bar">
          <div 
            className={`step-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="step-num">1</span>
            <span>{t.navChat}</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <span className="step-num">2</span>
            <span>{t.navResults} ({eligibleCount})</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            <span className="step-num">3</span>
            <span>{t.navDocs}</span>
          </div>

          <div 
            className={`step-item ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <span className="step-num">4</span>
            <span>{t.navChecklist}</span>
          </div>
        </div>
      )}
    </header>
  );
}
