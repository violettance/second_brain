import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  Brain, 
  FolderOpen, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { id: 'daily-notes', icon: BookOpen, label: 'Daily Notes', path: '/daily-notes' },
  { id: 'short-term-memory', icon: Clock, label: 'Short Term Memory', path: '/short-term-memory' },
  { id: 'long-term-memory', icon: Brain, label: 'Long Term Memory', path: '/long-term-memory' },
  { id: 'projects', icon: FolderOpen, label: 'Projects', path: '/projects' },
  { id: 'knowledge-network', icon: BarChart3, label: 'Knowledge Network', path: '/knowledge-network' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUpgradeClick = () => {
    navigate('/pricing');
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <>
      {/* Mobile Menu Button - Updated positioning to avoid overlapping titles */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="Second Brain Logo" className="h-14 w-14 lg:h-16 lg:w-16 rounded-lg" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-white">Second Brain</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
            <ul className="space-y-1 lg:space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-left transition-all duration-200 ${
                        currentPage === item.id
                          ? 'border' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      style={currentPage === item.id ? {
                        backgroundColor: '#C2B5FC20',
                        color: '#C2B5FC',
                        borderColor: '#C2B5FC50'
                      } : {}}
                    >
                      <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                      <span className="font-medium text-sm lg:text-base">{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Upgrade Section & Logout - Fixed at bottom */}
          <div className="p-3 lg:p-4 border-t border-slate-800 space-y-3">
            <button
              onClick={handleUpgradeClick}
              className="w-full flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-semibold text-sm lg:text-base text-slate-900 hover:opacity-90 transition-colors"
              style={{ background: '#C2B5FC' }}
            >
              <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
              <span>Upgrade Now</span>
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-left text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 text-sm lg:text-base"
            >
              <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>


    </>
  );
};