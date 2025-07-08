import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { DailyNotes } from './components/dailyNotes/DailyNotes';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { ShortTermMemory } from './components/memory/ShortTermMemory';
import { LongTermMemory } from './components/memory/LongTermMemory';
import { Analytics } from './components/analytics/Analytics';
import { Settings } from './components/settings/Settings';
import { KnowledgeNetworkPage } from './components/analytics/KnowledgeNetworkPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [showLanding, setShowLanding] = useState(true); // Start with landing page
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (showLanding && !user) {
    return <LandingPage onGoToApp={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'daily-notes':
        return <DailyNotes />;
      case 'short-term-memory':
        return <ShortTermMemory />;
      case 'long-term-memory':
        return <LongTermMemory />;
      case 'projects':
        return <ProjectsPage />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'knowledge-network':
        return <KnowledgeNetworkPage />;
      case 'dashboard':
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 lg:ml-0">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;