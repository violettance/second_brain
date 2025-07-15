import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { KnowledgeNetworkPage } from './components/knowledge-network/KnowledgeNetworkPage';
import { TasksPage } from './components/tasks/TasksPage';
import { TermsAndConditions } from './components/landing/TermsAndConditions';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(() => !user);
  const location = useLocation();

  // Eğer kullanıcı oturum açtıysa landing ekranını kapat
  useEffect(() => {
    if (user) setShowLanding(false);
  }, [user]);

  // Kullanıcının oturum durumu henüz belli değilse loading göster
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (showLanding && !user) {
    return <LandingPage onGoToApp={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const currentPage = location.pathname.substring(1);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar currentPage={currentPage} />
      <div className="flex-1 lg:ml-0 overflow-y-auto">
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/daily-notes" element={<DailyNotes />} />
            <Route path="/short-term-memory" element={<ShortTermMemory />} />
            <Route path="/long-term-memory" element={<LongTermMemory />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/knowledge-network" element={<KnowledgeNetworkPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
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