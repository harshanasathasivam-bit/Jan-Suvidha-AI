import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { ChatProfilePage } from './pages/ChatProfilePage';
import { SchemeResultsPage } from './pages/SchemeResultsPage';
import { DocCheckPage } from './pages/DocCheckPage';
import { FinalChecklistPage } from './pages/FinalChecklistPage';

function MainLayout() {
  const { activeTab } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="main-content">
        <div className="container">
          {activeTab === 'landing' && <LandingPage />}
          {activeTab === 'chat' && <ChatProfilePage />}
          {activeTab === 'results' && <SchemeResultsPage />}
          {activeTab === 'docs' && <DocCheckPage />}
          {activeTab === 'checklist' && <FinalChecklistPage />}
        </div>
      </main>

      <footer style={{ background: '#090d16', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 0', marginTop: 'auto', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <div className="container">
          Jan Suvidha AI • Grounded Tamil Nadu Government Scheme Assistant • 2026 Edition
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
