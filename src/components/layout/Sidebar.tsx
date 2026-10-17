import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Brain,
  CheckSquare,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { id: 'daily-notes', icon: BookOpen, label: 'Daily notes', path: '/daily-notes' },
  { id: 'short-term-memory', icon: Clock3, label: 'Short term memory', path: '/short-term-memory' },
  { id: 'long-term-memory', icon: Brain, label: 'Long term memory', path: '/long-term-memory' },
  { id: 'projects', icon: FolderKanban, label: 'Projects', path: '/projects' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { id: 'knowledge-network', icon: Network, label: 'Knowledge network', path: '/knowledge-network' },
  { id: 'analytics', icon: Activity, label: 'Analytics', path: '/analytics' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUpgradeClick = () => {
    navigate('/pricing');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed left-4 top-4 z-50 rounded-md border-2 border-ink bg-surface p-2 text-ink shadow-sm lg:hidden"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-sidebar flex-col overflow-hidden border-r-2 border-ink bg-surface transition-transform duration-base ease-in-out lg:relative lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link
          to="/dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex shrink-0 items-center gap-3 border-b-2 border-ink px-5 py-5"
        >
          <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight text-ink">Second Brain</span>
        </Link>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 px-2 text-xs font-semibold text-muted">Your workspace</p>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex w-full items-center gap-3 rounded-md border-2 px-3 py-2.5 text-left transition-colors duration-fast ${
                        isActive
                          ? 'border-ink bg-brand-primary-soft font-semibold text-ink shadow-sm'
                          : 'border-transparent text-muted hover:border-ink hover:bg-surface-muted hover:text-ink'
                      }`}
                    >
                      <item.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-2 border-t-2 border-ink p-4">
            <button
              type="button"
              onClick={handleUpgradeClick}
              className="sb-action flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              <span>Explore Pro</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md border-2 border-transparent px-3 py-2.5 text-left text-sm text-muted transition-colors duration-fast hover:border-ink hover:bg-surface-muted hover:text-ink"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
