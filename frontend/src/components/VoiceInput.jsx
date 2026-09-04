import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function VoiceInput({ onTranscript }) {
  const { lang, t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onTranscript) {
          onTranscript(transcript);
        }
      };

      setRecognition(rec);
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognition) {
      alert(lang === 'ta' ? 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை.' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.start();
    }
  };

  return (
    <button 
      type="button" 
      className={`voice-btn ${isListening ? 'recording' : ''}`} 
      onClick={toggleListening}
      title={isListening ? t.speakingActive : t.speakBtn}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}
