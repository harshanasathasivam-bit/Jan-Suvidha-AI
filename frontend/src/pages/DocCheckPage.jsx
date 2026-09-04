import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  Circle,
  AlertCircle
} from 'lucide-react';
import { getApiUrl } from '../utils/api';

export function DocCheckPage() {
  const { 
    lang, 
    t, 
    verifiedDocs, 
    setVerifiedDocs, 
    setActiveTab, 
    selectedScheme 
  } = useApp();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [checking, setChecking] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  const targetScheme = selectedScheme || {
    nameEn: "Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)",
    nameTa: "பிரதான் மந்திரி ஆவாஸ் யோஜனா - நகர்ப்புறம் 2.0",
    requiredDocuments: [
      { key: 'aadhaar_card', nameEn: 'Aadhaar Card of Head and Family members', nameTa: 'ஆதார் அட்டை' },
      { key: 'income_certificate', nameEn: 'Revenue Department Income Certificate', nameTa: 'வருவாய்த்துறை வருமானச் சான்றிதழ்' },
      { key: 'ration_card', nameEn: 'Smart Family Ration Card', nameTa: 'ஸ்மார்ட் குடும்ப அட்டை' },
      { key: 'bank_passbook', nameEn: 'Bank Passbook / Cancelled Cheque', nameTa: 'வங்கி கணக்கு புத்தகம்' }
    ]
  };

  const schemeDocsList = targetScheme.requiredDocuments || [];
  const readyCount = verifiedDocs.filter(d => d.status === 'READY').length;
  const totalRequired = Math.max(schemeDocsList.length, 3);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      runDocumentCheck(file);
    }
  };

  const [demoModeNotice, setDemoModeNotice] = useState(false);

  const runDocumentCheck = async (file) => {
    setChecking(true);
    setLatestResult(null);
    setDemoModeNotice(false);

    const formData = new FormData();
    formData.append('document', file);

    let ocr = null;

    try {
      const res = await fetch(getApiUrl('/api/document-check'), {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.result) {
            ocr = data.result;
          }
        }
      }
    } catch (err) {
      console.warn('Backend document check notice (demo fallback active):', err);
    }

    // Deterministic demo mode fallback
    if (!ocr) {
      setDemoModeNotice(true);
      const lowerName = file.name.toLowerCase();
      let detectedType = 'AADHAAR_CARD';
      let fieldVal = '12-digit UID detected';
      let issueText = null;

      if (lowerName.includes('income') || lowerName.includes('வருமானம்')) {
        detectedType = 'INCOME_CERTIFICATE';
        fieldVal = 'Income ₹1,20,000 detected';
        issueText = { en: 'Certificate issue date is over 11 months old; renewal recommended', ta: 'சான்றிதழ் தேதியை உறுதிப்படுத்தவும்' };
      } else if (lowerName.includes('ration') || lowerName.includes('குடும்ப')) {
        detectedType = 'RATION_CARD';
        fieldVal = 'Smart Family Card detected';
      } else if (lowerName.includes('patta') || lowerName.includes('farmer') || lowerName.includes('uzhavar')) {
        detectedType = 'LAND_PATTA';
        fieldVal = 'Uzhavar / Agricultural Land record detected';
      }

      ocr = {
        docType: detectedType,
        status: issueText ? 'ACTION_REQUIRED' : 'VERIFIED',
        blurCheckPassed: true,
        extractedFields: {
          fieldInfo: fieldVal,
          documentDate: 'Valid'
        },
        issues: issueText ? [issueText] : [],
        isDemoMode: true
      };
    }

    const isPass = ocr.status === 'VERIFIED';
    const docStatus = isPass ? 'READY' : (ocr.issues?.length === 1 ? 'NEEDS_ATTENTION' : 'NOT_READY');

    const newDocItem = {
      docKey: ocr.docType.toLowerCase(),
      docNameEn: file.name,
      docNameTa: file.name,
      docType: ocr.docType,
      ocrStatus: isPass ? 'SUCCESS' : 'ACTION_REQUIRED',
      readability: ocr.blurCheckPassed ? 'CLEAR' : 'BLURRY',
      requiredFields: ocr.extractedFields?.aadhaarNumber ? `Aadhaar: ${ocr.extractedFields.aadhaarNumber}` : (ocr.extractedFields?.incomeAmount ? `Income: ₹${ocr.extractedFields.incomeAmount}` : (ocr.extractedFields?.fieldInfo || 'Detected')),
      expiryStatus: ocr.extractedFields?.documentDate ? 'VALID' : 'REQUIRES_CHECK',
      status: docStatus,
      notesEn: isPass ? 'Clean scan, text readable, required fields verified.' : (ocr.issues[0]?.en || 'Action required on document quality.'),
      notesTa: isPass ? 'ஆவணம் தெளிவாகவும் பயன்படுத்தக்கூடியதாகவும் உள்ளது.' : (ocr.issues[0]?.ta || 'ஆவணத்தை மீண்டும் தெளிவாக எடுக்கவும்.')
    };

    setLatestResult(ocr);
    setVerifiedDocs(prev => [
      ...prev.filter(d => d.docType !== ocr.docType),
      newDocItem
    ]);
    setChecking(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READY':
        return (
          <span className="doc-badge ready" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> {t.statusReady}
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="doc-badge attention" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} /> {t.statusNeedsAttention}
          </span>
        );
      case 'NOT_READY':
      default:
        return (
          <span className="doc-badge not-ready" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> {t.statusNotReady}
          </span>
        );
    }
  };

  return (
    <div className="doc-check-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.docTitle}</h2>
          <p className="page-subtitle">{t.docSubtitle}</p>
        </div>

        <button className="btn-primary" onClick={() => setActiveTab('checklist')}>
          <span>View Application Readiness</span>
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="official-disclaimer-banner">
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Pre-Submission Quality Check Only:</strong> {t.docDisclaimer}
        </div>
      </div>

      {demoModeNotice && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#93c5fd',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={16} />
          <span>Document quality check is currently running in demo mode.</span>
        </div>
      )}

      {/* Scheme Checklist Status Card */}
      <div className="scheme-checklist-card glass-card">
        <div className="checklist-summary-header">
          <div className="checklist-info">
            <span className="checklist-tag">SELECTED TARGET SCHEME</span>
            <h3 className="scheme-name">
              {lang === 'ta' ? targetScheme.nameTa : targetScheme.nameEn}
            </h3>
          </div>

          <div className="checklist-counter-badge">
            <span className="counter-val">{readyCount} of {totalRequired}</span>
            <span className="counter-label">{t.docsReadyBadge}</span>
          </div>
        </div>

        <div className="required-docs-grid">
          {schemeDocsList.map((doc, idx) => {
            const matchedDoc = verifiedDocs.find(d => 
              d.docKey.includes(doc.key) || doc.key.includes(d.docKey) ||
              (doc.key.includes('aadhaar') && d.docType === 'AADHAAR_CARD') ||
              (doc.key.includes('income') && d.docType === 'INCOME_CERTIFICATE') ||
              (doc.key.includes('ration') && d.docType === 'RATION_CARD') ||
              (doc.key.includes('passbook') && d.docType === 'BANK_PASSBOOK')
            );

            const isReady = matchedDoc && matchedDoc.status === 'READY';
            const isAttention = matchedDoc && matchedDoc.status === 'NEEDS_ATTENTION';

            return (
              <div key={idx} className={`req-doc-chip ${isReady ? 'ready' : isAttention ? 'attention' : 'missing'}`}>
                <div className="chip-icon-wrap">
                  {isReady ? (
                    <CheckCircle2 size={18} className="icon pass" />
                  ) : isAttention ? (
                    <AlertTriangle size={18} className="icon warn" />
                  ) : (
                    <Circle size={16} color="#64748b" />
                  )}
                </div>
                <div className="chip-details">
                  <strong>{lang === 'ta' ? doc.nameTa : doc.nameEn}</strong>
                  <span className="chip-status-text">
                    {isReady ? 'Verified & Legible' : isAttention ? 'Needs Renewal / Verification' : 'Not Uploaded Yet'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Zone and Document Health Inspector */}
      <div className="doc-inspect-grid">
        {/* Left: Upload Dropzone */}
        <div className="upload-box glass-card">
          <label className="upload-dropzone" htmlFor="doc-file-input">
            <UploadCloud size={44} color="#3b82f6" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem', color: '#f8fafc' }}>
              {t.uploadPrompt}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Instant blur check, Tamil/English OCR extraction, and tamper detection.
            </p>
            <input 
              id="doc-file-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </label>

          {previewUrl && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                Uploaded File: {selectedFile?.name}
              </div>
              <img src={previewUrl} alt="Uploaded document preview" className="preview-thumbnail" />
              {checking && (
                <div className="checking-indicator">
                  <RefreshCw className="spin" size={15} />
                  <span>{t.verifyingText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Document Multi-Attribute Inspection Table */}
        <div className="verified-docs-card glass-card">
          <h3 className="section-title-small" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10b981" />
            <span>Document Multi-Attribute Health Audit</span>
          </h3>

          <div className="docs-table-wrap">
            <table className="doc-audit-table">
              <thead>
                <tr>
                  <th>{t.docTypeHeader}</th>
                  <th>{t.ocrStatusHeader}</th>
                  <th>{t.readabilityHeader}</th>
                  <th>{t.requiredFieldsHeader}</th>
                  <th>{t.expiryStatusHeader}</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {verifiedDocs.map((doc, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{doc.docType}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{doc.docNameEn}</div>
                    </td>
                    <td>
                      <span className={`pill-mini ${doc.ocrStatus === 'SUCCESS' ? 'pass' : 'warn'}`}>
                        {doc.ocrStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`pill-mini ${doc.readability === 'CLEAR' ? 'pass' : 'warn'}`}>
                        {doc.readability}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {doc.requiredFields}
                    </td>
                    <td>
                      <span className={`pill-mini ${doc.expiryStatus === 'VALID' ? 'pass' : 'warn'}`}>
                        {doc.expiryStatus}
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(doc.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="doc-feedback-summary">
            {verifiedDocs.map((doc, i) => (
              <div key={i} className={`doc-note-item ${doc.status.toLowerCase()}`}>
                <strong>{doc.docType}:</strong> {lang === 'ta' ? doc.notesTa : doc.notesEn}
              </div>
            ))}
          </div>

          <button className="btn-primary full-width" style={{ marginTop: '1.25rem' }} onClick={() => setActiveTab('checklist')}>
            <span>Proceed to Application Readiness Score</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
