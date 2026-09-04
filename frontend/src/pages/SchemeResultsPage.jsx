import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  ArrowRight, 
  Search, 
  ShieldAlert, 
  Building2, 
  Calendar, 
  FileText, 
  Sparkles,
  Home,
  GraduationCap,
  HeartHandshake,
  Sprout,
  UserCheck,
  X
} from 'lucide-react';

export function SchemeResultsPage() {
  const { 
    lang, 
    t, 
    schemeMatches, 
    loadingMatches, 
    setActiveTab, 
    setSelectedSchemeId,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    verifiedDocs
  } = useApp();

  const [expandedSchemeId, setExpandedSchemeId] = useState(null);

  const toggleExpand = (schemeId) => {
    setExpandedSchemeId(prev => (prev === schemeId ? null : schemeId));
  };

  const categories = [
    { key: 'All', label: t.catAll },
    { key: 'Agriculture', label: t.catAgriculture },
    { key: 'Education', label: t.catEducation },
    { key: 'Health', label: t.catHealth },
    { key: 'Housing', label: t.catHousing },
    { key: 'Women & Child', label: t.catWomenChild },
    { key: 'Social Security', label: t.catSocialSecurity }
  ];

  const filteredMatches = schemeMatches.filter((scheme) => {
    const matchesCat = selectedCategory === 'All' || scheme.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const name = (scheme.nameEn || scheme.name_en || '') + (scheme.nameTa || scheme.name_ta || '');
    const dept = (scheme.departmentEn || scheme.department_en || '') + (scheme.departmentTa || scheme.department_ta || '');
    const benefit = (scheme.benefitEn || scheme.benefit_en || '') + (scheme.benefitTa || scheme.benefit_ta || '');
    const cat = scheme.category || '';
    return matchesCat && (name.toLowerCase().includes(q) || dept.toLowerCase().includes(q) || benefit.toLowerCase().includes(q) || cat.toLowerCase().includes(q));
  });

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

  const handleCheckDocs = (schemeId) => {
    setSelectedSchemeId(schemeId);
    setActiveTab('docs');
  };

  const readyDocsCount = verifiedDocs.filter(d => d.status === 'READY').length;

  return (
    <div className="results-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.resultsTitle}</h2>
          <p className="page-subtitle">{t.resultsSubtitle}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ background: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(37, 99, 235, 0.3)', color: '#60a5fa' }} onClick={() => setActiveTab('profile-wizard')}>
            <UserCheck size={18} />
            <span>{t.btnEditProfile || 'Edit Profile'}</span>
          </button>

          <button className="btn-primary" onClick={() => setActiveTab('docs')}>
            <span>Verify Documents</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Mandatory Official Authority Disclaimer */}
      <div className="official-disclaimer-banner">
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>{t.disclaimerEligible}</strong> {t.disclaimerAuthority}
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="discovery-controls">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`cat-pill ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loadingMatches ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
            Evaluating citizen profile against official government eligibility rules...
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No schemes found matching your search and filter criteria.</p>
          <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        /* Schemes List with Explainable Breakdown Cards */
        <div className="schemes-list">
          {filteredMatches.map((scheme) => {
            const isExpanded = expandedSchemeId === scheme.schemeId;
            const isEligible = scheme.status === 'ELIGIBLE';
            const isPartial = scheme.status === 'PARTIALLY_ELIGIBLE';
            const totalDocs = scheme.requiredDocuments?.length || 3;
            const docsReady = Math.min(readyDocsCount, totalDocs);

            return (
              <div key={scheme.schemeId} className={`scheme-card glass-card ${isEligible ? 'card-eligible' : ''}`}>
                {/* Scheme Card Header */}
                <div className="scheme-card-header">
                  <div className="scheme-header-left">
                    <div className="scheme-cat-badge">
                      {getCategoryIcon(scheme.category)}
                      <span>{scheme.category}</span>
                    </div>

                    <h3 className="scheme-title">
                      {lang === 'ta' ? scheme.nameTa : scheme.nameEn}
                    </h3>

                    <div className="scheme-dept">
                      <span>{scheme.government}</span> • <span>{lang === 'ta' ? scheme.departmentTa : scheme.departmentEn}</span>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="match-score-pill">
                    <div className="score-number">{scheme.matchPercentage}%</div>
                    <div className="score-status">
                      {isEligible ? (
                        <span className="status-text pass" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> {t.statusEligible}
                        </span>
                      ) : isPartial ? (
                        <span className="status-text warn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={13} /> {t.statusPartial}
                        </span>
                      ) : (
                        <span className="status-text fail" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={13} /> {t.statusIneligible}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Monetary Benefit Highlight */}
                <div className="benefit-box">
                  <span className="benefit-label">BENEFIT ASSISTANCE:</span>
                  <div className="benefit-text">
                    {lang === 'ta' ? scheme.benefitTa : scheme.benefitEn}
                  </div>
                </div>

                {/* Quick Match Reason summary */}
                <div className="quick-match-reasons">
                  <div className="reasons-label">Why it matches:</div>
                  <div className="reasons-chips">
                    {scheme.passedRules?.slice(0, 3).map((r, i) => (
                      <span key={i} className="reason-tag pass" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> {lang === 'ta' ? r.ta : r.en}
                      </span>
                    ))}
                    {scheme.needsVerification?.slice(0, 1).map((r, i) => (
                      <span key={i} className="reason-tag warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> {lang === 'ta' ? r.ta : r.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Document Readiness Counter */}
                <div className="doc-readiness-indicator">
                  <FileText size={15} color="#60a5fa" />
                  <span>
                    <strong>{docsReady} of {totalDocs}</strong> {t.docsReadyBadge} for this scheme
                  </span>
                </div>

                {/* Expandable "Why this match?" Section */}
                {isExpanded && (
                  <div className="explainable-accordion">
                    {/* Why you may qualify */}
                    {scheme.whyQualify?.length > 0 && (
                      <div className="explain-section qualify">
                        <h5 className="explain-title">{t.whyQualifyHeader}</h5>
                        <ul className="explain-list">
                          {scheme.whyQualify.map((q, idx) => (
                            <li key={idx}>
                              <CheckCircle2 size={16} className="item-icon pass" />
                              <span>{lang === 'ta' ? q.ta : q.en}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Needs verification */}
                    {scheme.needsVerification?.length > 0 && (
                      <div className="explain-section verify">
                        <h5 className="explain-title">{t.needsVerificationHeader}</h5>
                        <ul className="explain-list">
                          {scheme.needsVerification.map((v, idx) => (
                            <li key={idx}>
                              <AlertTriangle size={16} className="item-icon warn" />
                              <span>{lang === 'ta' ? v.ta : v.en}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rule by Rule Audit Table */}
                    <div className="rule-audit-box">
                      <h5 className="explain-title">{t.ruleBreakdownHeader}</h5>
                      <div className="audit-items-list">
                        {scheme.breakdown?.map((rule, idx) => (
                          <div key={idx} className={`audit-row ${rule.status.toLowerCase()}`}>
                            <div className="audit-status-badge">
                              {rule.status === 'PASS' && <span className="badge pass">PASS</span>}
                              {rule.status === 'WARNING' && <span className="badge warn">WARNING</span>}
                              {rule.status === 'FAIL' && <span className="badge fail">FAIL</span>}
                              {rule.status === 'UNKNOWN' && <span className="badge unknown">UNKNOWN</span>}
                            </div>
                            <div className="audit-text">
                              <strong>{lang === 'ta' ? rule.descriptionTa : rule.descriptionEn}</strong>
                              <p>{lang === 'ta' ? (rule.detailTa || rule.detailEn) : rule.detailEn}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Application Process & Source Note */}
                    <div className="scheme-policy-box">
                      <div className="policy-item">
                        <strong>Official Application Process:</strong>{' '}
                        <span>{lang === 'ta' ? scheme.applicationProcessTa : scheme.applicationProcessEn}</span>
                      </div>
                      <div className="policy-item" style={{ marginTop: '0.5rem', color: '#94a3b8' }}>
                        <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        <span>Source: <strong>{scheme.officialSource}</strong> (Last verified: {scheme.lastVerified})</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="scheme-card-actions">
                  <button 
                    className="btn-text-toggle"
                    onClick={() => toggleExpand(scheme.schemeId)}
                  >
                    <span>{isExpanded ? 'Hide Details' : t.seeWhyBtn}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <div className="actions-right">
                    <button 
                      className="btn-secondary small"
                      onClick={() => handleCheckDocs(scheme.schemeId)}
                    >
                      <FileText size={15} />
                      <span>{t.checkDocsBtn}</span>
                    </button>

                    <a 
                      href={scheme.officialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-official-source small"
                      title="Open verified official government portal in a new tab"
                    >
                      <span>{t.viewOfficialSource}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
