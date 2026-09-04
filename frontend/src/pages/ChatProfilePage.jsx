import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VoiceInput } from '../components/VoiceInput';
import { Send, UserCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export function ChatProfilePage() {
  const { 
    lang, t, setActiveTab, 
    messages, setMessages, 
    profile, updateProfileAndMatch 
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Call backend API /api/profile
      const res = await fetch(getApiUrl('/api/profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, currentProfile: profile })
      });
      const data = await res.json();

      if (data.success && data.profile) {
        updateProfileAndMatch(data.profile);

        const botReply = lang === 'ta'
          ? `உங்கள் விவரங்களைப் புதுப்பித்துள்ளேன்: வயது ${data.profile.age || '-'}, பாலினம் ${data.profile.gender || '-'}, ஆண்டு வருமானம் ₹${data.profile.annual_family_income || '-'}. வேறு ஏதேனும் விவரங்களை சேர்க்க விரும்புகிறீர்களா?`
          : `Updated profile: Age ${data.profile.age || '-'}, Gender ${data.profile.gender || '-'}, Annual Income ₹${data.profile.annual_family_income ? data.profile.annual_family_income.toLocaleString() : '-'}. You can now view your matched schemes below!`;

        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
      }
    } catch (err) {
      console.warn('Profile parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetText) => {
    handleSendMessage(presetText);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.35rem' }}>{t.chatTitle}</h2>
        <p style={{ color: '#94a3b8' }}>{t.chatSubtitle}</p>
      </div>

      <div className="chat-layout">
        {/* Chat Main Area */}
        <div className="glass-card chat-box" style={{ padding: 0 }}>
          <div className="messages-container">
            {messages.map((m) => (
              <div key={m.id} className={`msg-bubble ${m.sender}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="msg-bubble bot" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                {lang === 'ta' ? 'விவரங்களை ஆய்வு செய்கிறது...' : 'Analyzing profile fields...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick preset chips */}
          <div className="preset-chips">
            <button className="chip" onClick={() => handlePresetClick('I am a 22 year old female student studying in TN government school. My family income is 1.2 lakh.')}>
              {t.presetChip1}
            </button>
            <button className="chip" onClick={() => handlePresetClick('I am a 24 year old married woman, head of my family on ration card. Income is 1.5 lakh.')}>
              {t.presetChip2}
            </button>
            <button className="chip" onClick={() => handlePresetClick('Tell me about free bus travel scheme for women in Tamil Nadu.')}>
              {t.presetChip3}
            </button>
            <button className="chip" onClick={() => handlePresetClick('My family annual income is 1,10,000 and we have a smart ration card for health card.')}>
              {t.presetChip4}
            </button>
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              className="chat-input"
              placeholder={t.typePlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <VoiceInput onTranscript={(text) => handleSendMessage(text)} />
            <button className="btn-primary" style={{ padding: '0.75rem 1.1rem' }} onClick={() => handleSendMessage()}>
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Real-time Structured Profile Card */}
        <div className="glass-card profile-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck color="#34d399" size={20} />
            <span>{t.profileSummaryTitle}</span>
          </h3>

          <div className="profile-field">
            <span className="profile-label">{t.fieldAge}:</span>
            <span className="profile-val">{profile.age ? `${profile.age} yrs` : 'Not set'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">{t.fieldGender}:</span>
            <span className="profile-val" style={{ textTransform: 'capitalize' }}>{profile.gender || 'Not set'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">{t.fieldIncome}:</span>
            <span className="profile-val">{profile.annual_family_income ? `₹${profile.annual_family_income.toLocaleString()}` : 'Not set'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">{t.fieldSchool}:</span>
            <span className="profile-val">
              {profile.school_type_6_to_12 === 'tn_govt_school' ? 'TN Govt School' : profile.school_type_6_to_12 === 'tn_govt_aided_school' ? 'TN Govt-Aided' : 'Private/Other'}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-label">{t.fieldEducation}:</span>
            <span className="profile-val" style={{ textTransform: 'capitalize' }}>{profile.education_course_type || 'Regular Higher Ed'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">{t.fieldRation}:</span>
            <span className="profile-val">{profile.ration_card_head ? 'Yes (Head)' : 'Member'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">{t.fieldDistrict}:</span>
            <span className="profile-val">{profile.district || 'Chennai'}</span>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={() => setActiveTab('results')}
          >
            <span>{t.viewMatchesBtn}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
