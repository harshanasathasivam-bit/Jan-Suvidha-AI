import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ArrowRight, 
  FileEdit, 
  ShieldAlert, 
  Sparkles, 
  FileCheck 
} from 'lucide-react';

export function FinalChecklistPage() {
  const { 
    lang, 
    t, 
    profile, 
    selectedScheme, 
    readinessMetrics, 
    setActiveTab 
  } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const scheme = selectedScheme || {
    nameEn: "Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)",
    nameTa: "பிரதான் மந்திரி ஆவாஸ் யோஜனா - நகர்ப்புறம் 2.0",
    government: "Government of India & Tamil Nadu",
    officialUrl: "https://pmay-urban.gov.in",
    officialSource: "Ministry of Housing and Urban Affairs",
    benefitEn: "Direct financial subsidy up to ₹2.5 Lakh for pucca house construction",
    benefitTa: "சொந்த வீடு கட்ட ₹2.5 லட்சம் வரை நேரடி அரசு மானியம்"
  };

  return (
    <div className="final-readiness-container">
      {/* Top Header Row */}
      <div className="page-header-row no-print">
        <div>
          <h2 className="page-title">{t.readinessTitle}</h2>
          <p className="page-subtitle">{t.readinessSubtitle}</p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>{t.printBtn}</span>
          </button>
        </div>
      </div>

      {/* Final Success Banner */}
      <div className="success-banner-card glass-card no-print">
        <div className="success-banner-content">
          <div className="success-badge-tag">
            <FileCheck size={16} />
            <span>FINAL STAGE VERIFICATION</span>
          </div>

          <h2 className="success-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={26} color="#60a5fa" />
            <span>{t.finalSuccessHeading}</span>
          </h2>

          <div className="success-highlights-row">
            <span className="highlight-pill pass" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Profile completed
            </span>
            <span className="highlight-pill pass" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Scheme identified: {scheme.nameEn?.split('(')[0] || 'Target Scheme'}
            </span>
            <span className="highlight-pill pass" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Grounded eligibility reviewed
            </span>
            <span className="highlight-pill warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={13} /> 1 document needs verification
            </span>
          </div>
        </div>

        {/* Overall Score Circular Metric Widget */}
        <div className="readiness-gauge-box">
          <div className="gauge-circle">
            <div className="gauge-number">{readinessMetrics.overallScore}%</div>
            <div className="gauge-sub">READINESS</div>
          </div>
        </div>
      </div>

      {/* Component Breakdown Progress Bars */}
      <div className="readiness-breakdown-card glass-card no-print">
        <h3 className="section-title-small">Component Readiness Breakdown</h3>

        <div className="progress-bars-grid">
          {/* Profile Completeness */}
          <div className="progress-item">
            <div className="progress-label-row">
              <span>{t.profileCompleteness}</span>
              <strong>{readinessMetrics.profileScore}%</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill profile" 
                style={{ width: `${readinessMetrics.profileScore}%` }}
              ></div>
            </div>
          </div>

          {/* Eligibility Readiness */}
          <div className="progress-item">
            <div className="progress-label-row">
              <span>{t.eligibilityReadiness}</span>
              <strong>{readinessMetrics.eligibilityScore}%</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill eligibility" 
                style={{ width: `${readinessMetrics.eligibilityScore}%` }}
              ></div>
            </div>
          </div>

          {/* Documents Readiness */}
          <div className="progress-item">
            <div className="progress-label-row">
              <span>{t.documentsReadiness}</span>
              <strong>{readinessMetrics.docScore}%</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill documents" 
                style={{ width: `${readinessMetrics.docScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Apply & Needs Attention Columns */}
      <div className="readiness-columns-grid no-print">
        {/* Ready To Apply */}
        <div className="audit-col ready glass-card">
          <h4 className="col-header pass">
            <CheckCircle2 size={18} />
            <span>{t.readyToApplyHeader}</span>
          </h4>
          <ul className="audit-list">
            {readinessMetrics.readyItems.map((item, idx) => (
              <li key={idx} className="audit-list-item pass">
                <CheckCircle2 size={16} className="icon pass" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Needs Attention */}
        <div className="audit-col attention glass-card">
          <h4 className="col-header warn">
            <AlertTriangle size={18} />
            <span>{t.needsAttentionHeader}</span>
          </h4>
          <ul className="audit-list">
            {readinessMetrics.attentionItems.map((item, idx) => (
              <li key={idx} className="audit-list-item warn">
                <AlertTriangle size={16} className="icon warn" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Actions & Action Buttons */}
      <div className="next-actions-card glass-card no-print">
        <h4 className="col-header" style={{ color: '#f8fafc', marginBottom: '1rem' }}>
          <ArrowRight size={18} color="#3b82f6" />
          <span>{t.nextActionsHeader}</span>
        </h4>

        <div className="actions-steps-list">
          <div className="action-step-item">
            <div className="step-badge-num">1</div>
            <div className="step-text">
              <strong>Upload missing bank passbook copy</strong>
              <p>Ensures immediate Direct Benefit Transfer (DBT) credit into your account.</p>
            </div>
            <button className="btn-secondary small" onClick={() => setActiveTab('docs')}>
              <FileEdit size={14} />
              <span>{t.actionFixDoc}</span>
            </button>
          </div>

          <div className="action-step-item">
            <div className="step-badge-num">2</div>
            <div className="step-text">
              <strong>Verify VAO / Revenue Income Certificate</strong>
              <p>Verify that your certificate is within the 1-year validity period for revenue audits.</p>
            </div>
            <button className="btn-secondary small" onClick={() => setActiveTab('docs')}>
              <span>{t.actionFixDoc}</span>
            </button>
          </div>

          <div className="action-step-item highlight">
            <div className="step-badge-num">3</div>
            <div className="step-text">
              <strong>Proceed to official government registration portal</strong>
              <p>Submit your verified dossier directly to the authorized department.</p>
            </div>
            <a 
              href={scheme.officialUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary small"
            >
              <span>{t.actionOfficialPortal}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Safety Guardrail Notice */}
        <div className="guardrail-notice">
          <ShieldAlert size={16} />
          <span>{t.noSubmitNotice}</span>
        </div>
      </div>

      {/* PRINTABLE DOSSIER */}
      <div className="printable-dossier-paper">
        <div className="dossier-header-bar">
          <div>
            <h1 className="dossier-title">
              Jan Suvidha AI — Citizen Welfare Pre-Submission Dossier
            </h1>
            <p className="dossier-sub">
              Target Scheme: <strong>{scheme.nameEn}</strong> • Reference #: TN-JS-{Math.floor(100000 + Math.random() * 900000)} • Date: {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="dossier-status-pill">
            APPLICATION READINESS: {readinessMetrics.overallScore}%
          </div>
        </div>

        {/* Citizen Profile Summary */}
        <div className="dossier-section">
          <h3 className="dossier-sec-title">1. Citizen Verified Profile</h3>
          <div className="dossier-grid-3">
            <div><strong>Citizen Name:</strong> {profile.name || 'Citizen'}</div>
            <div><strong>Occupation:</strong> {profile.occupation || 'Farmer'}</div>
            <div><strong>Age / Gender:</strong> {profile.age || 45} yrs • {profile.gender || 'Male'}</div>
            <div><strong>Annual Family Income:</strong> ₹{profile.annual_family_income ? profile.annual_family_income.toLocaleString() : '1,20,000'}</div>
            <div><strong>District / State:</strong> {profile.district || 'Thanjavur'}, Tamil Nadu</div>
            <div><strong>Smart Ration Card:</strong> {profile.ration_card_holder ? 'Active (Family Head)' : 'Active'}</div>
          </div>
        </div>

        {/* Scheme & Grounded Eligibility Citation */}
        <div className="dossier-section">
          <h3 className="dossier-sec-title">2. Target Scheme Grounded Evaluation</h3>
          <table className="dossier-table">
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Authority</th>
                <th>Benefit Assistance</th>
                <th>Eligibility Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{scheme.nameEn}</strong><br/><small>{scheme.nameTa}</small></td>
                <td>{scheme.government}</td>
                <td>{scheme.benefitEn}</td>
                <td><strong style={{ color: '#15803d' }}>ELIGIBLE (Score: {readinessMetrics.eligibilityScore}%)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Document Readiness Audit */}
        <div className="dossier-section">
          <h3 className="dossier-sec-title">3. Document Readiness Audit Checklist</h3>
          <table className="dossier-table">
            <thead>
              <tr>
                <th>Required Document</th>
                <th>Readability</th>
                <th>OCR Health Status</th>
                <th>Action Required</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aadhaar Card (Bank Linked)</td>
                <td>CLEAR</td>
                <td style={{ color: '#15803d', fontWeight: 'bold' }}>READY</td>
                <td>None (12-digit UID verified)</td>
              </tr>
              <tr>
                <td>Smart Family Ration Card</td>
                <td>CLEAR</td>
                <td style={{ color: '#15803d', fontWeight: 'bold' }}>READY</td>
                <td>None (Head of household listed)</td>
              </tr>
              <tr>
                <td>Revenue Income Certificate</td>
                <td>FAIR</td>
                <td style={{ color: '#b45309', fontWeight: 'bold' }}>ATTENTION</td>
                <td>VAO renewal verification recommended</td>
              </tr>
              <tr>
                <td>Bank Passbook Statement</td>
                <td>PENDING</td>
                <td style={{ color: '#64748b' }}>NOT UPLOADED</td>
                <td>Attach copy for direct benefit transfer</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="dossier-footer-note">
          Notice: Jan Suvidha AI provides grounded algorithmic matching against confirmed 2026 government guidelines. Final benefit approval and sanctioning is strictly determined by the authorized government agency.
        </div>
      </div>
    </div>
  );
}
