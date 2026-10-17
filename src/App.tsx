import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/landing/LandingPage';

const AuthPage = React.lazy(() => import('./components/auth/AuthPage').then(({ AuthPage }) => ({ default: AuthPage })));
const Sidebar = React.lazy(() => import('./components/layout/Sidebar').then(({ Sidebar }) => ({ default: Sidebar })));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard').then(({ Dashboard }) => ({ default: Dashboard })));
const DailyNotes = React.lazy(() => import('./components/dailyNotes/DailyNotes').then(({ DailyNotes }) => ({ default: DailyNotes })));
const ProjectsPage = React.lazy(() => import('./components/projects/ProjectsPage').then(({ ProjectsPage }) => ({ default: ProjectsPage })));
const ShortTermMemory = React.lazy(() => import('./components/memory/ShortTermMemory').then(({ ShortTermMemory }) => ({ default: ShortTermMemory })));
const LongTermMemory = React.lazy(() => import('./components/memory/LongTermMemory').then(({ LongTermMemory }) => ({ default: LongTermMemory })));
const Analytics = React.lazy(() => import('./components/analytics/Analytics').then(({ Analytics }) => ({ default: Analytics })));
const Settings = React.lazy(() => import('./components/settings/Settings').then(({ Settings }) => ({ default: Settings })));
const KnowledgeNetworkPage = React.lazy(() => import('./components/knowledge-network/KnowledgeNetworkPage').then(({ KnowledgeNetworkPage }) => ({ default: KnowledgeNetworkPage })));
const TasksPage = React.lazy(() => import('./components/tasks/TasksPage').then(({ TasksPage }) => ({ default: TasksPage })));
const TermsAndConditions = React.lazy(() => import('./components/landing/TermsAndConditions').then(({ TermsAndConditions }) => ({ default: TermsAndConditions })));
const PrivacyPolicy = React.lazy(() => import('./components/landing/PrivacyPolicy').then(({ PrivacyPolicy }) => ({ default: PrivacyPolicy })));
const PricingModal = React.lazy(() => import('./components/landing/PricingModal').then(({ PricingModal }) => ({ default: PricingModal })));
const PricingPage = React.lazy(() => import('./components/landing/PricingPage'));

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
      <div className="flex h-screen items-center justify-center text-ink">
        Loading...
      </div>
    );
  }

  // Public pages that don't require authentication
  if (location.pathname === '/privacy-policy' || location.pathname === '/terms-and-conditions' || location.pathname === '/our-pricing') {
    return (
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/our-pricing" element={<PricingPage />} />
      </Routes>
    );
  }

  if (!user && location.pathname === '/auth') {
    return <AuthPage />;
  }

  if (showLanding && !user) {
    return <LandingPage onGoToApp={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const currentPage = location.pathname.substring(1);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar currentPage={currentPage} />
      <main className="min-w-0 flex-1 overflow-y-auto">
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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/pricing" element={<PricingModal />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Suspense fallback={(
          <div className="flex h-screen items-center justify-center bg-canvas text-ink">
            Loading...
          </div>
        )}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
