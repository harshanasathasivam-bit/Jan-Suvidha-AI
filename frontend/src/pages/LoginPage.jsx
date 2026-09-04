import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, MapPin, DollarSign, KeyRound, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export function LoginPage() {
  const { lang, t, loginUser, setActiveTab } = useApp();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState('credentials'); // 'credentials' or 'verify_email'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [income, setIncome] = useState('120000');

  // Verification state
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleStartAuth = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // Generate realistic 6-digit email verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep('verify_email');
  };

  const handleVerifyEmailCode = (e) => {
    e.preventDefault();
    if (inputCode.trim() !== generatedCode) {
      setCodeError(lang === 'ta' ? 'தவறான குறியீடு. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' : 'Invalid verification code. Please check and retry.');
      return;
    }

    // Auth Successful
    loginUser({
      name: name || email.split('@')[0] || 'Citizen',
      email: email,
      district: district,
      income: parseInt(income, 10) || 120000,
      aadhaar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
      isVerified: true,
      profile: {
        age: 24,
        gender: 'female',
        annual_family_income: parseInt(income, 10) || 120000,
        ration_card_head: true,
        school_type_6_to_12: 'tn_govt_school',
        district: district
      }
    });

    // Jump straight to Dashboard or Scheme Match
    setActiveTab('dashboard');
  };

  return (
    <div style={{ maxWidth: '520px', margin: '1.5rem auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}>
            <KeyRound size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            {step === 'verify_email' ? t.verifyTitle : t.loginTitle}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            {step === 'verify_email' ? `${t.verifySubtitle} ${email}` : t.loginSubtitle}
          </p>
        </div>

        {step === 'credentials' ? (
          <div>
            {/* Dual Mode Switch: Sign In vs Register */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', background: mode === 'login' ? 'var(--accent-primary)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                onClick={() => setMode('login')}
              >
                {t.tabLogin}
              </button>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', background: mode === 'register' ? 'var(--accent-primary)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                onClick={() => setMode('register')}
              >
                {t.tabRegister}
              </button>
            </div>

            <form onSubmit={handleStartAuth}>
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

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <span>{mode === 'login' ? t.submitLoginBtn : t.submitRegisterBtn}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Realistic Email Verification Code Screen */
          <div>
            <div style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', padding: '1rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{t.simulatedCodeBanner}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '4px', color: '#60a5fa' }}>{generatedCode}</div>
            </div>

            <form onSubmit={handleVerifyEmailCode}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                  {t.codeLabel}
                </label>
                <input 
                  type="text"
                  className="chat-input"
                  style={{ width: '100%', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '3px' }}
                  placeholder={t.codePlaceholder}
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setCodeError('');
                  }}
                  required
                />
                {codeError && <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem' }}>{codeError}</div>}
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                <ShieldCheck size={18} />
                <span>{t.verifyBtn}</span>
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={() => setStep('credentials')}
              >
                <span>Change Email / Back</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
