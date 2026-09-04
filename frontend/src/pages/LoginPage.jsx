import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Phone, Lock, Sparkles, UserCheck, ArrowRight, KeyRound } from 'lucide-react';

export function LoginPage() {
  const { lang, t, loginUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('demo'); // 'mobile' or 'demo'
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    loginUser({
      name: 'Lakshmi Devi',
      aadhaar: 'XXXX-XXXX-4892',
      phone: phone || '9876543210',
      district: 'Chennai',
      income: 120000,
      profile: {
        age: 24,
        gender: 'female',
        annual_family_income: 120000,
        ration_card_head: true,
        school_type_6_to_12: 'tn_govt_school',
        district: 'Chennai'
      }
    });
  };

  const handleDemoLogin = (demoType) => {
    if (demoType === 'lakshmi') {
      loginUser({
        name: 'Lakshmi Devi',
        aadhaar: 'XXXX-XXXX-4892',
        phone: '9876543210',
        district: 'Chennai',
        income: 120000,
        profile: {
          age: 24,
          gender: 'female',
          annual_family_income: 120000,
          ration_card_head: true,
          school_type_6_to_12: 'tn_govt_school',
          education_course_type: 'regular_higher_education',
          marital_status: 'married',
          district: 'Chennai'
        }
      });
    } else if (demoType === 'priya') {
      loginUser({
        name: 'Priya S.',
        aadhaar: 'XXXX-XXXX-9102',
        phone: '9845123456',
        district: 'Madurai',
        income: 95000,
        profile: {
          age: 20,
          gender: 'female',
          annual_family_income: 95000,
          ration_card_head: false,
          school_type_6_to_12: 'tn_govt_school',
          education_course_type: 'regular_higher_education',
          marital_status: 'single',
          district: 'Madurai'
        }
      });
    } else {
      loginUser({
        name: 'Meenakshi M.',
        aadhaar: 'XXXX-XXXX-3341',
        phone: '9789012345',
        district: 'Coimbatore',
        income: 70000,
        profile: {
          age: 58,
          gender: 'female',
          annual_family_income: 70000,
          ration_card_head: true,
          school_type_6_to_12: 'tn_govt_school',
          marital_status: 'widowed',
          district: 'Coimbatore'
        }
      });
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '1rem auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}>
            <KeyRound size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem' }}>{t.loginTitle}</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{t.loginSubtitle}</p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', background: activeSubTab === 'demo' ? 'var(--accent-primary)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('demo')}
          >
            {t.loginTabDemo}
          </button>
          <button 
            type="button"
            style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', background: activeSubTab === 'mobile' ? 'var(--accent-primary)' : 'transparent', color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('mobile')}
          >
            {t.loginTabMobile}
          </button>
        </div>

        {activeSubTab === 'demo' ? (
          <div>
            <p style={{ fontSize: '0.82rem', color: '#60a5fa', marginBottom: '1rem', textAlign: 'center', fontWeight: '500' }}>
              💡 {t.demoLoginNotice}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button className="btn-secondary" style={{ justifyContent: 'space-between', padding: '1rem' }} onClick={() => handleDemoLogin('lakshmi')}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{t.demoUser1}</span>
                <ArrowRight size={16} color="#60a5fa" />
              </button>

              <button className="btn-secondary" style={{ justifyContent: 'space-between', padding: '1rem' }} onClick={() => handleDemoLogin('priya')}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{t.demoUser2}</span>
                <ArrowRight size={16} color="#60a5fa" />
              </button>

              <button className="btn-secondary" style={{ justifyContent: 'space-between', padding: '1rem' }} onClick={() => handleDemoLogin('meenakshi')}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{t.demoUser3}</span>
                <ArrowRight size={16} color="#60a5fa" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                {t.phoneLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  className="chat-input"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  required
                />
              </div>
            </div>

            {otpSent && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>
                  {t.otpLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text"
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '38px' }}
                    placeholder={t.otpPlaceholder}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <span>{otpSent ? t.verifyLoginBtn : t.sendOtpBtn}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
