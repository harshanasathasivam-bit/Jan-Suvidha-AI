import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Mic, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  Home, 
  Calendar,
  AlertCircle,
  Sprout,
  LogIn,
  LayoutDashboard,
  PlayCircle
} from 'lucide-react';

export function LandingPage() {
  const { t, lang, setActiveTab, allSchemes, isLoggedIn, setAuthMode, updateProfileAndMatch } = useApp();

  const handleTryFarmerDemo = () => {
    const demoFarmer = {
      name: 'Murugan (Farmer Demo)',
      age: 45,
      gender: 'male',
      occupation: 'farmer',
      annual_family_income: 120000,
      family_size: 4,
      state_domicile: 'tamil_nadu',
      district: 'Thanjavur',
      ration_card_head: true,
      ration_card_holder: true,
      owns_pucca_house: false,
      owns_four_wheeler: false
    };
    updateProfileAndMatch(demoFarmer);
    setActiveTab('results');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Housing': return <Home size={18} className="cat-icon housing" />;
      case 'Education': return <GraduationCap size={18} className="cat-icon education" />;
      case 'Health': return <HeartHandshake size={18} className="cat-icon health" />;
      case 'Women & Child': return <Sparkles size={18} className="cat-icon women" />;
      case 'Agriculture': return <Sprout size={18} className="cat-icon agri" />;
      default: return <Building2 size={18} className="cat-icon govt" />;
    }
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge-tag">
          <Sparkles size={16} />
          <span>{t.heroBadge}</span>
        </div>

        <h1 className="hero-title">
          {t.heroTitle}
        </h1>

        <p className="hero-desc">
          {t.heroDesc}
        </p>

        {/* Hero Action CTAs */}
        <div className="hero-cta-group">
          <button className="btn-primary" onClick={() => setActiveTab('chat')}>
            <Mic size={18} />
            <span>{t.primaryCta}</span>
          </button>

          <button className="btn-secondary" onClick={() => setActiveTab('results')}>
            <Search size={18} />
            <span>{t.secondaryCta}</span>
          </button>

          <button 
            className="btn-demo"
            onClick={handleTryFarmerDemo}
            title="Instant Deterministic Demo: 45-year-old Tamil Nadu Farmer (Income ₹1,20,000)"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontWeight: '600',
              padding: '0.75rem 1.4rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <PlayCircle size={18} />
            <span>TRY DEMO</span>
          </button>
        </div>

        {/* Stats Row */}
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
      </section>

      {/* AI Transparency & Trust Section */}
      <section className="transparency-section">
        <div className="transparency-card">
          <div className="transparency-header">
            <ShieldCheck size={26} color="#3b82f6" />
            <div>
              <h3 className="transparency-title">{t.transparencyTitle}</h3>
              <p className="transparency-sub">Transparent, deterministic rule matching with zero hallucinations.</p>
            </div>
          </div>

          <div className="transparency-steps">
            <div className="trans-step">
              <div className="trans-step-num">1</div>
              <div>
                <strong>{t.step1Title}</strong>
                <p>{t.step1Desc}</p>
              </div>
            </div>

            <div className="trans-step">
              <div className="trans-step-num">2</div>
              <div>
                <strong>{t.step2Title}</strong>
                <p>{t.step2Desc}</p>
              </div>
            </div>

            <div className="trans-step">
              <div className="trans-step-num">3</div>
              <div>
                <strong>{t.step3Title}</strong>
                <p>{t.step3Desc}</p>
              </div>
            </div>

            <div className="trans-step">
              <div className="trans-step-num">4</div>
              <div>
                <strong>{t.step4Title}</strong>
                <p>{t.step4Desc}</p>
              </div>
            </div>

            <div className="trans-step">
              <div className="trans-step-num">5</div>
              <div>
                <strong>{t.step5Title}</strong>
                <p>{t.step5Desc}</p>
              </div>
            </div>
          </div>

          {/* Mandatory Trust Disclaimer */}
          <div className="trust-banner">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>{t.transparencyNote}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Real Government Schemes Showcase */}
      <section className="schemes-preview-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              {lang === 'ta' ? 'அரசு அங்கீகாரம் பெற்ற நலத்திட்டங்கள் (2026 விதிகள்)' : 'Verified Real Government Welfare Schemes (2026 Rules)'}
            </h3>
            <p className="section-subtitle">
              {lang === 'ta' ? 'அதிகாரப்பூர்வ அரசு இணையதள ஆதாரங்களுடன் கூடிய நலத்திட்டங்கள்' : 'Grounded in active Tamil Nadu & Government of India gazettes and portals.'}
            </p>
          </div>

          <button className="btn-secondary" onClick={() => setActiveTab('results')}>
            <span>{t.secondaryCta}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="schemes-grid">
          {allSchemes.slice(0, 6).map((scheme) => (
            <div key={scheme.id} className="preview-scheme-card">
              <div className="preview-card-top">
                <div className="scheme-cat-tag">
                  {getCategoryIcon(scheme.category)}
                  <span>{scheme.category}</span>
                </div>
                <span className="govt-tag">{scheme.government}</span>
              </div>

              <h4 className="preview-scheme-name">
                {lang === 'ta' ? scheme.name_ta : scheme.name_en}
              </h4>
              
              <div className="preview-scheme-dept">
                {lang === 'ta' ? scheme.department_ta : scheme.department_en}
              </div>

              <div className="preview-benefit-box">
                <strong>{lang === 'ta' ? scheme.benefit_ta : scheme.benefit_en}</strong>
              </div>

              <div className="preview-card-footer">
                <div className="verified-date">
                  <Calendar size={13} />
                  <span>{t.lastVerifiedPrefix} {scheme.last_verified}</span>
                </div>

                <a 
                  href={scheme.official_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="official-link-btn"
                  title="Open official government portal in new tab"
                >
                  <span>{t.viewOfficialSource}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
