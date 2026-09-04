import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft, Save, Sparkles, BookOpen, Users, DollarSign } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export function ProfileWizardPage() {
  const { lang, t, token, currentUser, profileCompleted, setProfileCompleted, setSchemeMatches, updateProfileAndMatch, setActiveTab } = useApp();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [age, setAge] = useState('22');
  const [gender, setGender] = useState('female');
  const [mobileNumber, setMobileNumber] = useState('');
  const [district, setDistrict] = useState(currentUser?.district || 'Chennai');

  const [educationLevel, setEducationLevel] = useState('12th_pass');
  const [schoolType, setSchoolType] = useState('tn_govt_school');
  const [courseType, setCourseType] = useState('regular_higher_education');
  const [marksPct, setMarksPct] = useState('75');

  const [income, setIncome] = useState(currentUser?.annual_income?.toString() || '120000');
  const [rationHead, setRationHead] = useState(true);
  const [rationHolder, setRationHolder] = useState(true);
  const [category, setCategory] = useState('OBC');
  const [disability, setDisability] = useState(false);

  // Pre-fill existing profile if available
  useEffect(() => {
    if (token) {
      fetch(getApiUrl('/api/profile'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.profile) {
            const p = data.profile;
            if (p.full_name) setFullName(p.full_name);
            if (p.age) setAge(p.age.toString());
            if (p.gender) setGender(p.gender);
            if (p.mobile_number) setMobileNumber(p.mobile_number);
            if (p.district) setDistrict(p.district);
            if (p.education_level) setEducationLevel(p.education_level);
            if (p.school_type_6_to_12) setSchoolType(p.school_type_6_to_12);
            if (p.education_course_type) setCourseType(p.education_course_type);
            if (p.last_exam_marks_pct) setMarksPct(p.last_exam_marks_pct.toString());
            if (p.annual_family_income) setIncome(p.annual_family_income.toString());
            if (p.ration_card_head !== undefined) setRationHead(Boolean(p.ration_card_head));
            if (p.ration_card_holder !== undefined) setRationHolder(Boolean(p.ration_card_holder));
            if (p.category) setCategory(p.category);
            if (p.disability_status !== undefined) setDisability(Boolean(p.disability_status));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!fullName.trim() || !age || !gender || !district) {
        setErrorMsg(lang === 'ta' ? 'தயவுசெய்து அனைத்து விவரங்களையும் பூர்த்தி செய்யவும்.' : 'Please fill all required personal details.');
        return;
      }
    } else if (step === 2) {
      if (!educationLevel || !schoolType || !marksPct) {
        setErrorMsg(lang === 'ta' ? 'கல்வி விவரங்களைப் பூர்த்தி செய்யவும்.' : 'Please fill all education fields.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!income || Number(income) <= 0) {
      setErrorMsg(lang === 'ta' ? 'சரியான வருமானத் தொகையை உள்ளிடவும்.' : 'Please enter a valid family income amount.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const payload = {
      full_name: fullName,
      age: Number(age),
      gender,
      mobile_number: mobileNumber,
      district,
      education_level: educationLevel,
      school_type_6_to_12: schoolType,
      education_course_type: courseType,
      last_exam_marks_pct: Number(marksPct),
      annual_family_income: Number(income),
      ration_card_head: rationHead,
      ration_card_holder: rationHolder,
      category,
      disability_status: disability
    };

    try {
      const res = await fetch(getApiUrl('/api/profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || 'Failed to save profile');
        return;
      }

      // Profile Completed Successfully
      setProfileCompleted(true);
      if (data.schemes) {
        setSchemeMatches(data.schemes);
      }
      
      // Update global context profile
      updateProfileAndMatch({
        age: Number(age),
        gender,
        district,
        annual_family_income: Number(income),
        school_type_6_to_12: schoolType,
        education_course_type: courseType,
        education_level: educationLevel,
        ration_card_head: rationHead,
        ration_card_holder: rationHolder
      });

      // Navigate to Scheme Recommendations
      setActiveTab('results');
    } catch (err) {
      console.warn('Network error saving profile, updating client profile state:', err);
      setProfileCompleted(true);
      updateProfileAndMatch({
        age: Number(age),
        gender,
        district,
        annual_family_income: Number(income),
        school_type_6_to_12: schoolType,
        education_course_type: courseType,
        education_level: educationLevel,
        ration_card_head: rationHead,
        ration_card_holder: rationHolder
      });
      setActiveTab('results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Title & Forced Onboarding Notice */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            {t.profileWizardTitle}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{t.profileWizardSub}</p>
        </div>

        {!profileCompleted && (
          <div style={{ background: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(217, 119, 6, 0.35)', color: '#fcd34d', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '500', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <span>{t.profileForcedNotice}</span>
          </div>
        )}

        {/* Progress Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 1 ? '#60a5fa' : '#34d399', fontWeight: '700', fontSize: '0.88rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === 1 ? '#2563eb' : '#059669', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            <span>{t.step1Title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 2 ? '#60a5fa' : step > 2 ? '#34d399' : '#64748b', fontWeight: '700', fontSize: '0.88rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === 2 ? '#2563eb' : step > 2 ? '#059669' : 'rgba(255,255,255,0.1)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
            <span>{t.step2Title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 3 ? '#60a5fa' : '#64748b', fontWeight: '700', fontSize: '0.88rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === 3 ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
            <span>{t.step3Title}</span>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#f87171', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            ⚠ {errorMsg}
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.fullNameLabel}</label>
              <input type="text" className="chat-input" style={{ width: '100%' }} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Lakshmi Devi" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.ageLabel}</label>
                <input type="number" className="chat-input" style={{ width: '100%' }} value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.genderLabel}</label>
                <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="female">Female (பெண்)</option>
                  <option value="transgender">Transgender (திருநங்கை)</option>
                  <option value="male">Male (ஆண்)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.mobileLabel}</label>
                <input type="text" className="chat-input" style={{ width: '100%' }} placeholder="10-digit mobile" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.districtLabel}</label>
                <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={district} onChange={(e) => setDistrict(e.target.value)}>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Tiruchirappalli">Tiruchirappalli</option>
                  <option value="Salem">Salem</option>
                  <option value="Vellore">Vellore</option>
                  <option value="Thanjavur">Thanjavur</option>
                </select>
              </div>
            </div>

            <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={handleNextStep}>
              <span>{t.btnNext}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Education & Marks */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.eduLevelLabel}</label>
              <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="12th_pass">12th Standard Passed / Studying</option>
                <option value="degree">Undergraduate Degree (UG)</option>
                <option value="diploma">Diploma Course</option>
                <option value="iti">ITI Course</option>
                <option value="10th_pass">10th Standard Passed</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.schoolTypeLabel}</label>
              <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={schoolType} onChange={(e) => setSchoolType(e.target.value)}>
                <option value="tn_govt_school">Tamil Nadu Government School (அரசு பள்ளி)</option>
                <option value="tn_govt_aided_school">Tamil Nadu Government-Aided School (அரசு உதவிபெறும் பள்ளி)</option>
                <option value="private_school">Private / Matriculation School</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.courseTypeLabel}</label>
                <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={courseType} onChange={(e) => setCourseType(e.target.value)}>
                  <option value="regular_higher_education">Regular Full-Time Course</option>
                  <option value="distance">Distance / Correspondence</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.marksLabel}</label>
                <input type="number" className="chat-input" style={{ width: '100%' }} value={marksPct} onChange={(e) => setMarksPct(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                <ArrowLeft size={18} />
                <span>{t.btnBack}</span>
              </button>
              <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={handleNextStep}>
                <span>{t.btnNext}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Family & Income Details */}
        {step === 3 && (
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.incomeLabel}</label>
              <input type="number" className="chat-input" style={{ width: '100%' }} value={income} onChange={(e) => setIncome(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.categoryLabel}</label>
                <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="OBC">BC / OBC</option>
                  <option value="MBC">MBC / DNC</option>
                  <option value="SC">SC / SC(A)</option>
                  <option value="ST">ST</option>
                  <option value="General">General / FC</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' }}>{t.disabilityLabel}</label>
                <select className="chat-input" style={{ width: '100%', padding: '0.75rem' }} value={disability ? 'yes' : 'no'} onChange={(e) => setDisability(e.target.value === 'yes')}>
                  <option value="no">No</option>
                  <option value="yes">Yes (Differently Abled)</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', marginBottom: '0.6rem' }}>
                <input type="checkbox" checked={rationHead} onChange={(e) => setRationHead(e.target.checked)} />
                <span>{t.rationHeadLabel}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={rationHolder} onChange={(e) => setRationHolder(e.target.checked)} />
                <span>{t.rationHolderLabel}</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                <ArrowLeft size={18} />
                <span>{t.btnBack}</span>
              </button>

              <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                <Save size={18} />
                <span>{t.btnSaveProfile}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
