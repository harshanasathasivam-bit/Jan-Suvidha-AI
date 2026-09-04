import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export function DocCheckPage() {
  const { lang, t, verifiedDocs, setVerifiedDocs, setActiveTab } = useApp();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [checking, setChecking] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      runDocumentCheck(file);
    }
  };

  const runDocumentCheck = async (file) => {
    setChecking(true);
    setLatestResult(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch('/api/document-check', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.result) {
        setLatestResult(data.result);
        setVerifiedDocs(prev => [
          ...prev.filter(d => d.fileName !== file.name),
          {
            fileName: file.name,
            docType: data.result.docType,
            status: data.result.status,
            result: data.result,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.warn('Doc check error:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.35rem' }}>{t.docTitle}</h2>
        <p style={{ color: '#94a3b8' }}>{t.docSubtitle}</p>
      </div>

      <div className="doc-check-grid">
        {/* Upload Zone */}
        <div className="glass-card">
          <label className="upload-dropzone" htmlFor="doc-file-input">
            <UploadCloud size={48} color="#60a5fa" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.uploadPrompt}</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Supports Aadhaar, Ration Card, Income Certificate, Marksheet photos</p>
            <input 
              id="doc-file-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </label>

          {previewUrl && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <h5 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Document Preview</h5>
              <img src={previewUrl} alt="Document Preview" className="preview-img" />
              {checking && (
                <div style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <RefreshCw className="spin" size={16} />
                  <span>{t.verifyingText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* OCR Result Box */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="#34d399" size={22} />
            <span>Document Health & OCR Report</span>
          </h3>

          {!latestResult && !checking && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              Upload a document image on the left to analyze blur, readability, and key fields.
            </p>
          )}

          {latestResult && (
            <div>
              <div className="check-pill">
                <span>Document Classification:</span>
                <strong style={{ color: '#60a5fa' }}>{latestResult.docType}</strong>
              </div>

              <div className="check-pill">
                <span>Blur & Resolution Check:</span>
                {latestResult.blurCheckPassed ? (
                  <span style={{ color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Clear & Legible
                  </span>
                ) : (
                  <span style={{ color: '#f87171', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={16} /> Blurry / Low Res
                  </span>
                )}
              </div>

              <div className="check-pill">
                <span>Extracted Aadhaar / Field:</span>
                <strong>{latestResult.extractedFields.aadhaarNumber || latestResult.extractedFields.incomeAmount || 'Detected'}</strong>
              </div>

              {latestResult.issues.length > 0 && (
                <div style={{ background: 'rgba(220, 38, 38, 0.12)', border: '1px solid rgba(220, 38, 38, 0.25)', padding: '0.85rem', borderRadius: '8px', margin: '1rem 0' }}>
                  <strong style={{ color: '#f87171', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                    Action Items Required:
                  </strong>
                  {latestResult.issues.map((iss, idx) => (
                    <div key={idx} style={{ fontSize: '0.83rem', color: '#fca5a5', marginBottom: '0.25rem' }}>
                      • {lang === 'ta' ? iss.ta : iss.en}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{t.recHeader}</h5>
                {latestResult.recommendations.map((rec, idx) => (
                  <p key={idx} style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.25rem' }}>
                    ✔ {lang === 'ta' ? rec.ta : rec.en}
                  </p>
                ))}
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setActiveTab('checklist')}>
                <span>Generate Final Application Checklist</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
