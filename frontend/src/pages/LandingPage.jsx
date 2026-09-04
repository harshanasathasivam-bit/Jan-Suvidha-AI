import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, Award, LogIn, Sparkles, LayoutDashboard } from 'lucide-react';

export function LandingPage() {
  const { t, setActiveTab, isLoggedIn } = useApp();

  const handleStartEligibility = () => {
    if (isLoggedIn) {
      setActiveTab('chat');
    } else {
      setActiveTab('login');
    }
  };

  return (
    <div className="hero-section">
      <div className="badge-tag">
        <Sparkles size={16} />
        <span>{t.heroBadge}</span>
      </div>

      <h1 className="hero-title">
        {t.heroTitle.split(' ').slice(0, 4).join(' ')}{' '}
        <span className="gradient-text">{t.heroTitle.split(' ').slice(4).join(' ')}</span>
      </h1>

      <p className="hero-desc">{t.heroDesc}</p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleStartEligibility}>
          <span>{t.startBtn}</span>
          <ArrowRight size={18} />
        </button>

        {isLoggedIn ? (
          <button className="btn-secondary" style={{ background: 'rgba(5, 150, 105, 0.2)', borderColor: 'rgba(5, 150, 105, 0.4)', color: '#34d399' }} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>{t.navDashboard}</span>
          </button>
        ) : (
          <button className="btn-secondary" style={{ background: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(37, 99, 235, 0.3)', color: '#60a5fa' }} onClick={() => setActiveTab('login')}>
            <LogIn size={18} />
            <span>{t.loginHeroBtn}</span>
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val">{t.stat1Val}</div>
          <div className="stat-label">{t.stat1Label}</div>
        </div>

        <div className="stat-card">
          <div className="stat-val">{t.stat2Val}</div>
          <div className="stat-label">{t.stat2Label}</div>
        </div>

        <div className="stat-card">
          <div className="stat-val">{t.stat3Val}</div>
          <div className="stat-label">{t.stat3Label}</div>
        </div>
      </div>

      {/* Scheme Cards Highlight */}
      <div style={{ textAlign: 'left', marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award color="#60a5fa" size={22} />
          <span>Seeded Tamil Nadu Government Schemes (Verified 2026 Rules)</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={handleStartEligibility}>
            <h4 style={{ color: '#60a5fa', marginBottom: '0.4rem' }}>1. Kalaignar Magalir Urimai Thogai (KMUT)</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              ₹1,000/month financial assistance for women family heads aged 21+ with family annual income below ₹2.5L.
            </p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px', color: '#93c5fd' }}>kmut.tn.gov.in</span>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={handleStartEligibility}>
            <h4 style={{ color: '#60a5fa', marginBottom: '0.4rem' }}>2. Pudhumai Penn Thittam</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              ₹1,000/month assistance for female students who studied 6-12th in TN Govt/Govt-aided schools pursuing regular higher education.
            </p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px', color: '#93c5fd' }}>tnsocialwelfare.tn.gov.in</span>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={handleStartEligibility}>
            <h4 style={{ color: '#60a5fa', marginBottom: '0.4rem' }}>3. Free Bus Travel (Magalir Payanam)</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Zero-fare travel for women & transgender persons on ordinary TNSTC/MTC town buses across Tamil Nadu.
            </p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px', color: '#93c5fd' }}>tnstc.in</span>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={handleStartEligibility}>
            <h4 style={{ color: '#60a5fa', marginBottom: '0.4rem' }}>4. Health Insurance (CMCHIS)</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Cashless hospital treatment up to ₹5,000,000/family/year for ration card holders with annual income below ₹1.2L.
            </p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px', color: '#93c5fd' }}>cmchistn.com</span>
          </div>

          <div className="glass-card" style={{ cursor: 'pointer' }} onClick={handleStartEligibility}>
            <h4 style={{ color: '#60a5fa', marginBottom: '0.4rem' }}>5. Thalikku Thangam Marriage Scheme</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Marriage financial assistance (₹25,000 / ₹50,000) + 8g 22-carat gold coin for qualified brides from low-income families.
            </p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px', color: '#93c5fd' }}>tnsocialwelfare.tn.gov.in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
