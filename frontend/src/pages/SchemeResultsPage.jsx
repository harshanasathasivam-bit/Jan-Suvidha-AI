import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, CheckCircle, AlertTriangle, XCircle, ExternalLink, ArrowRight, Info, UserCheck, ShieldAlert } from 'lucide-react';

export function SchemeResultsPage() {
  const { lang, t, schemeMatches, loadingMatches, setActiveTab } = useApp();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.35rem' }}>{t.resultsTitle}</h2>
          <p style={{ color: '#94a3b8' }}>{t.resultsSubtitle}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ background: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(37, 99, 235, 0.3)', color: '#60a5fa' }} onClick={() => setActiveTab('profile-wizard')}>
            <UserCheck size={18} />
            <span>{t.btnEditProfile}</span>
          </button>

          <button className="btn-primary" onClick={() => setActiveTab('docs')}>
            <span>Verify Documents</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {loadingMatches ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#94a3b8' }}>{lang === 'ta' ? 'அரசு விதிகளுடன் தகுதியை சரிபார்க்கிறது...' : 'Evaluating grounded scheme eligibility against real Tamil Nadu rules...'}</p>
        </div>
      ) : (
        <div className="schemes-list">
          {schemeMatches.map((scheme) => {
            const isEligible = scheme.status === 'ELIGIBLE';
            const isPartial = scheme.status === 'PARTIALLY_ELIGIBLE';

            return (
              <div key={scheme.schemeId} className="glass-card scheme-card">
                <div className="scheme-header">
                  <div>
                    <h3 className="scheme-title">
                      {lang === 'ta' ? scheme.nameTa : scheme.nameEn}
                    </h3>
                    <div className="scheme-dept">
                      {lang === 'ta' ? scheme.departmentTa : scheme.departmentEn}
                    </div>
                  </div>

                  <div className={`match-badge ${isEligible ? 'eligible' : isPartial ? 'partial' : 'ineligible'}`}>
                    {isEligible ? (
                      <>
                        <CheckCircle size={16} />
                        <span>{scheme.matchPercentage}% {t.statusEligible}</span>
                      </>
                    ) : isPartial ? (
                      <>
                        <AlertTriangle size={16} />
                        <span>{scheme.matchPercentage}% {t.statusPartial}</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>{scheme.matchPercentage}% {t.statusIneligible}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Monetary Benefit Highlight */}
                <div className="benefit-box">
                  <div className="benefit-amount">
                    {lang === 'ta' ? scheme.benefitTa : scheme.benefitEn}
                  </div>
                </div>

                {/* Grounded Rules Citations */}
                <div className="rules-citation-box">
                  <h5 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: '600' }}>
                    {t.rulePassedHeader}
                  </h5>

                  {scheme.passedRules.map((rule, idx) => (
                    <div key={idx} className="rule-item">
                      <CheckCircle className="rule-icon pass" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{lang === 'ta' ? rule.ta : rule.en}</span>
                    </div>
                  ))}

                  {scheme.failedRules.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h5 style={{ fontSize: '0.9rem', color: '#f87171', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t.ruleFailedHeader}
                      </h5>
                      {scheme.failedRules.map((rule, idx) => (
                        <div key={idx} className="rule-item">
                          <XCircle className="rule-icon fail" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ color: '#fca5a5' }}>
                            {lang === 'ta' ? rule.ta : rule.en} (Your value: {rule.userValue ?? 'Not met'})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2026 Policy Context Note */}
                {(scheme.policyNotes2026En || scheme.policyNotes2026Ta) && (
                  <div className="policy-note">
                    <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>2026 Policy Note:</strong> {lang === 'ta' ? scheme.policyNotes2026Ta : scheme.policyNotes2026En}
                    </div>
                  </div>
                )}

                {/* Required Documents & Links */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    <strong>{t.requiredDocsHeader}</strong>{' '}
                    {scheme.requiredDocuments.map(d => (lang === 'ta' ? d.nameTa : d.nameEn)).join(', ')}
                  </div>

                  <a 
                    href={scheme.officialPortal} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    <span>{t.officialLink}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
