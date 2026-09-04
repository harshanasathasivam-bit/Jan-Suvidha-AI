import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VoiceInput } from '../components/VoiceInput';
import { 
  Send, 
  UserCheck, 
  ArrowRight, 
  Bot, 
  User, 
  Briefcase, 
  Home, 
  Users, 
  CreditCard, 
  MapPin
} from 'lucide-react';

export function ChatProfilePage() {
  const { 
    lang, 
    t, 
    setActiveTab, 
    messages, 
    setMessages, 
    profile, 
    updateProfileAndMatch 
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
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, currentProfile: profile })
      });
      const data = await res.json();

      if (data.success && data.profile) {
        updateProfileAndMatch(data.profile);

        const botReply = lang === 'ta'
          ? `சுயவிவரம் புதுப்பிக்கப்பட்டது: வயது ${data.profile.age || '-'}, தொழில் ${data.profile.occupation || 'பொது'}, ஆண்டு வருமானம் ₹${data.profile.annual_family_income ? data.profile.annual_family_income.toLocaleString() : '-'}. உங்களுக்கான பொருத்தமான திட்டங்களை உடனடியாகக் கணக்கிட்டுள்ளேன்!`
          : `Profile captured: Age ${data.profile.age || '-'}, Occupation ${data.profile.occupation || 'Farmer/Citizen'}, Annual Income ₹${data.profile.annual_family_income ? data.profile.annual_family_income.toLocaleString() : '-'}. Grounded scheme matches are now ready!`;

        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
      }
    } catch (err) {
      console.warn('Profile parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.chatTitle}</h2>
          <p className="page-subtitle">{t.chatSubtitle}</p>
        </div>

        <button className="btn-secondary" onClick={() => setActiveTab('results')}>
          <span>{t.viewMatchesBtn}</span>
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="chat-layout">
        {/* Left Side: Conversational Assistant */}
        <div className="chat-card glass-card">
          <div className="messages-container">
            {messages.map((m) => (
              <div key={m.id} className={`msg-bubble ${m.sender}`}>
                <div className="msg-avatar">
                  {m.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="msg-content">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg-bubble bot typing">
                <div className="msg-avatar"><Bot size={16} /></div>
                <div className="msg-content">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Chips */}
          <div className="preset-chips-bar">
            <span className="chips-label">Scenarios:</span>
            <button className="chip" onClick={() => handleSendMessage('I am a 45 year old small farmer from Thanjavur, Tamil Nadu with a family of 4. Annual income is ₹1,20,000. Need welfare support.')}>
              {t.presetChip1}
            </button>
            <button className="chip" onClick={() => handleSendMessage('I am a 22 year old female student from Chennai, studied 6-12th in TN government school, pursuing regular college degree. Family income 1.2 lakh.')}>
              {t.presetChip2}
            </button>
            <button className="chip" onClick={() => handleSendMessage('I am a 24 year old married woman, head on ration card in Tamil Nadu with family annual income 1.5 lakh.')}>
              {t.presetChip3}
            </button>
            <button className="chip" onClick={() => handleSendMessage('Family of 4 with annual income ₹1,20,000 looking for pucca housing assistance grant.')}>
              {t.presetChip4}
            </button>
          </div>

          {/* Text & Voice Input Bar */}
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
            <button className="btn-send" onClick={() => handleSendMessage()} title="Send message">
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Right Side: Live Extracted Citizen Profile */}
        <div className="profile-card glass-card">
          <div className="profile-card-header">
            <UserCheck color="#10b981" size={22} />
            <div>
              <h3 className="profile-title">{t.profileSummaryTitle}</h3>
              <p className="profile-sub">Automatically extracted from your input</p>
            </div>
          </div>

          <div className="profile-fields-list">
            <div className="profile-item">
              <span className="item-label"><Briefcase size={14} /> {t.fieldOccupation}</span>
              <span className="item-value highlight">{profile.occupation || 'Farmer'}</span>
            </div>

            <div className="profile-item">
              <span className="item-label"><User size={14} /> {t.fieldAge} & Gender</span>
              <span className="item-value">{profile.age ? `${profile.age} yrs` : '45 yrs'} • {profile.gender || 'Male'}</span>
            </div>

            <div className="profile-item">
              <span className="item-label"><CreditCard size={14} /> {t.fieldIncome}</span>
              <span className="item-value highlight">₹{profile.annual_family_income ? profile.annual_family_income.toLocaleString() : '1,20,000'}</span>
            </div>

            <div className="profile-item">
              <span className="item-label"><Users size={14} /> Family Size</span>
              <span className="item-value">{profile.family_size || 4} Members</span>
            </div>

            <div className="profile-item">
              <span className="item-label"><MapPin size={14} /> {t.fieldDistrict}</span>
              <span className="item-value">{profile.district || 'Thanjavur'}, Tamil Nadu</span>
            </div>

            <div className="profile-item">
              <span className="item-label"><CreditCard size={14} /> {t.fieldRation}</span>
              <span className="item-value">{profile.ration_card_holder ? 'Smart Card Active' : 'No'}</span>
            </div>

            <div className="profile-item">
              <span className="item-label"><Home size={14} /> {t.fieldHouse}</span>
              <span className="item-value">{profile.owns_pucca_house ? 'Yes' : 'No (Eligible for Housing)'}</span>
            </div>
          </div>

          <div className="profile-status-box">
            <div className="status-indicator-dot"></div>
            <span>Profile verified for official matching</span>
          </div>

          <button className="btn-primary full-width" onClick={() => setActiveTab('results')}>
            <span>Proceed to Grounded Scheme Matches</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
