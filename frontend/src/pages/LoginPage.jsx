import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, MapPin, KeyRound, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { lang, t, loginWithToken } = useApp();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState('credentials'); // 'credentials', 'verify_email', 'verify_login'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [income, setIncome] = useState('120000');

  // Verification & Error States
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [devNotice, setDevNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Form Submission (Login or Register)
  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setDevNotice('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, district, income: Number(income) })
        });
        const data = await res.json();

        if (!data.success) {
          setErrorMsg(data.error || 'Registration failed');
          return;
        }

        setInfoMsg(data.message);
        if (data.devNotice) setDevNotice(data.devNotice);
        setStep('verify_email');
        setCooldown(60);
      } else {
        // Login Flow
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.success) {
          setErrorMsg(data.error || 'Login failed');
          return;
        }

        setInfoMsg(data.message);
        if (data.devNotice) setDevNotice(data.devNotice);
        setStep('verify_login');
        setCooldown(60);
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Code Verification (Register Email or Login Code)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = step === 'verify_email' ? '/api/auth/verify-email' : '/api/auth/verify-login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() })
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || 'Verification failed');
        return;
      }

      // Login Successful with JWT Token
      loginWithToken(data.token, data.user);
    } catch (err) {
      setErrorMsg('Network error during verification.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (cooldown > 0) return;
    setErrorMsg('');
    setInfoMsg('');
    setDevNotice('');

    try {
      const purpose = step === 'verify_email' ? 'register' : 'login';
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || 'Resend failed');
        return;
      }

      setInfoMsg(data.message);
      if (data.devNotice) setDevNotice(data.devNotice);
      setCooldown(60);
    } catch (err) {
      setErrorMsg('Failed to resend code.');
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '1.5rem auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}>
            <KeyRound size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            {step === 'credentials' ? t.loginTitle : t.verifyTitle}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            {step === 'credentials' ? t.loginSubtitle : `${t.verifySubtitle} ${email}`}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#f87171', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div style={{ background: 'rgba(5, 150, 105, 0.15)', border: '1px solid rgba(5, 150, 105, 0.3)', color: '#34d399', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {devNotice && (
          <div style={{ background: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(217, 119, 6, 0.3)', color: '#fcd34d', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            🔔 <strong>Notice:</strong> {devNotice}
          </div>
        )}

        {step === 'credentials' ? (
          <div>
            {/* Mode Selector */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', background: mode === 'login' ? 'var(--accent-primary)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                onClick={() => { setMode('login'); setErrorMsg(''); }}
              >
                {t.tabLogin}
              </button>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', background: mode === 'register' ? 'var(--accent-primary)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                onClick={() => { setMode('register'); setErrorMsg(''); }}
              >
                {t.tabRegister}
              </button>
            </div>

            <form onSubmit={handleSubmitCredentials}>
              {mode === 'register' && (
                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                    {t.nameLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text"
                      className="chat-input"
                      style={{ width: '100%', paddingLeft: '38px' }}
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                  {t.emailLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="email"
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '38px' }}
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                  {t.passwordLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="password"
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '38px' }}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                      {t.districtLabel}
                    </label>
                    <select 
                      className="chat-input" 
                      style={{ width: '100%', padding: '0.75rem' }}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Tiruchirappalli">Tiruchirappalli</option>
                      <option value="Salem">Salem</option>
                      <option value="Vellore">Vellore</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                      {t.incomeLabel}
                    </label>
                    <input 
                      type="number"
                      className="chat-input"
                      style={{ width: '100%' }}
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? <RefreshCw className="spin" size={18} /> : <ArrowRight size={18} />}
                <span>{mode === 'login' ? t.submitLoginBtn : t.submitRegisterBtn}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: 6-Digit Email Verification Screen */
          <div>
            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                  {t.codeLabel}
                </label>
                <input 
                  type="text"
                  className="chat-input"
                  style={{ width: '100%', textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: '700' }}
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <RefreshCw className="spin" size={18} /> : <ShieldCheck size={18} />}
                <span>{t.verifyBtn}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0 }}
                  onClick={() => setStep('credentials')}
                >
                  ← Back to Sign In
                </button>

                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', color: cooldown > 0 ? '#64748b' : '#34d399', cursor: cooldown > 0 ? 'default' : 'pointer', padding: 0, fontWeight: '600' }}
                  onClick={handleResendCode}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : t.resendCodeBtn}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
