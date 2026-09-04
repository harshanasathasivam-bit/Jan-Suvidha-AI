import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, ShieldCheck, Award, FileText, ArrowRight, Bell, CheckCircle2, Clock, LogOut } from 'lucide-react';

export function DashboardPage() {
  const { lang, t, currentUser, logoutUser, profile, schemeMatches, verifiedDocs, setActiveTab } = useApp();

  const eligibleSchemes = schemeMatches.filter(s => s.status === 'ELIGIBLE' || s.status === 'PARTIALLY_ELIGIBLE');

  return (
    <div>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>{t.dashWelcome} {currentUser?.name || 'Citizen'}!</span>
            <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
              ✓ {t.dashStatusVerified}
            </span>
          </div>
          <p style={{ color: '#94a3b8' }}>{t.dashSub} • District: {profile.district || 'Chennai'}</p>
        </div>

        <button className="btn-secondary" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }} onClick={logoutUser}>
          <LogOut size={16} />
          <span>{t.navLogout}</span>
        </button>
      </div>

      {/* Quick Action Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #2563eb', cursor: 'pointer' }} onClick={() => setActiveTab('results')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '10px', borderRadius: '12px', color: '#60a5fa' }}>
              <Award size={24} />
            </div>
            <ArrowRight size={18} color="#94a3b8" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.35rem' }}>{t.dashActionCheckSchemes}</h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>View {eligibleSchemes.length} matched TN government schemes with rule citations.</p>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #059669', cursor: 'pointer' }} onClick={() => setActiveTab('docs')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(5, 150, 105, 0.15)', padding: '10px', borderRadius: '12px', color: '#34d399' }}>
              <ShieldCheck size={24} />
            </div>
            <ArrowRight size={18} color="#94a3b8" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.35rem' }}>{t.dashActionUploadDocs}</h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Run instant OCR health check on Aadhaar, Ration & Income certificates.</p>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #d97706', cursor: 'pointer' }} onClick={() => setActiveTab('checklist')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(217, 119, 6, 0.15)', padding: '10px', borderRadius: '12px', color: '#fbbf24' }}>
              <FileText size={24} />
            </div>
            <ArrowRight size={18} color="#94a3b8" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.35rem' }}>{t.dashActionViewDossier}</h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Print or download your official ready-to-submit citizen dossier.</p>
        </div>
      </div>

      {/* Main Dashboard Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Applications & Schemes */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award color="#60a5fa" size={22} />
            <span>{t.dashApplicationsTitle}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {eligibleSchemes.map((s) => (
              <div key={s.schemeId} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc' }}>{lang === 'ta' ? s.nameTa : s.nameEn}</h5>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{lang === 'ta' ? s.departmentTa : s.departmentEn}</span>
                  </div>
                  <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                    {s.matchPercentage}% Match
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#60a5fa', fontWeight: '600' }}>
                  {lang === 'ta' ? s.benefitTa : s.benefitEn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Identity Card & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Identity Card */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={18} color="#34d399" />
              <span>{t.dashProfileTitle}</span>
            </h4>

            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#cbd5e1' }}>
              <div><strong>Name:</strong> {currentUser?.name || 'Lakshmi Devi'}</div>
              <div><strong>Aadhaar:</strong> {currentUser?.aadhaar || 'XXXX-XXXX-4892'}</div>
              <div><strong>Ration Card:</strong> 03/G/0491823</div>
              <div><strong>Income:</strong> ₹{profile.annual_family_income ? profile.annual_family_income.toLocaleString() : '1,20,000'} (Certified)</div>
              <div><strong>District:</strong> {profile.district || 'Chennai'}</div>
            </div>
          </div>

          {/* 2026 Notifications */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
              <Bell size={18} />
              <span>{t.dashUpdatesTitle}</span>
            </h4>

            <div style={{ fontSize: '0.83rem', color: '#fcd34d', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(217, 119, 6, 0.1)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                📢 <strong>KMUT Notice:</strong> 2026 monthly DBT assistance confirmed at ₹1,000/mo.
              </div>
              <div style={{ background: 'rgba(217, 119, 6, 0.1)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                📢 <strong>CMCHIS Notice:</strong> Proposed coverage expansion up to ₹25 Lakh/family.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
