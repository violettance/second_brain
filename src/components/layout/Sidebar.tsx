import React, { useState } from 'react';
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
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'daily-notes', icon: BookOpen, label: 'Daily Notes' },
  { id: 'short-term-memory', icon: Clock, label: 'Short Term Memory' },
  { id: 'long-term-memory', icon: Brain, label: 'Long Term Memory' },
  { id: 'projects', icon: FolderOpen, label: 'Projects' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const handleUpgradeClick = () => {
    setShowPaywall(true);
    // In real app, this would integrate with RevenueCat
    console.log('Upgrade Now clicked - integrate with RevenueCat');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
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
                  <button 
                    onClick={() => handlePageChange(item.id)}
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
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Upgrade Section & Logout - Fixed at bottom */}
          <div className="p-3 lg:p-4 border-t border-slate-800 flex-shrink-0 bg-slate-900">
            <div className="border rounded-xl p-3 lg:p-4 mb-3 lg:mb-4" style={{ backgroundColor: '#C2B5FC20', borderColor: '#C2B5FC50' }}>
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 lg:h-8 lg:w-8" style={{ color: '#C2B5FC' }} />
              </div>
              <h3 className="text-white font-semibold text-center mb-1 text-sm lg:text-base">Upgrade to Pro!</h3>
              <p className="text-slate-400 text-xs lg:text-sm text-center mb-2 lg:mb-3">
                Unlock unlimited notes and advanced AI features
              </p>
              <button 
                onClick={handleUpgradeClick}
                className="w-full text-slate-900 py-2 px-3 lg:px-4 rounded-lg font-semibold hover:opacity-90 transition-all text-sm lg:text-base" 
                style={{ background: '#C2B5FC' }}
              >
                Upgrade Now
              </button>
            </div>

            {/* Logout */}
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LogOut className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="font-medium text-sm lg:text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="relative p-6 lg:p-8 text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-b border-slate-700">
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
              
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full" style={{ background: '#C2B5FC' }}>
                  <Sparkles className="h-10 w-10 text-slate-900" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
              <p className="text-slate-300 text-lg">
                Unlock unlimited notes and advanced AI features
              </p>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
                  <div className="p-2 rounded-lg" style={{ background: '#C2B5FC20' }}>
                    <Brain className="h-5 w-5" style={{ color: '#C2B5FC' }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Unlimited Notes</h3>
                    <p className="text-slate-400 text-xs">Create as many notes as you need</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
                  <div className="p-2 rounded-lg" style={{ background: '#C2B5FC20' }}>
                    <Sparkles className="h-5 w-5" style={{ color: '#C2B5FC' }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">AI Insights</h3>
                    <p className="text-slate-400 text-xs">Advanced AI analysis and recommendations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
                  <div className="p-2 rounded-lg" style={{ background: '#C2B5FC20' }}>
                    <BarChart3 className="h-5 w-5" style={{ color: '#C2B5FC' }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Advanced Analytics</h3>
                    <p className="text-slate-400 text-xs">Deep insights into your knowledge patterns</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
                  <div className="p-2 rounded-lg" style={{ background: '#C2B5FC20' }}>
                    <Settings className="h-5 w-5" style={{ color: '#C2B5FC' }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Priority Support</h3>
                    <p className="text-slate-400 text-xs">Get help when you need it most</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border rounded-xl p-6 mb-6" style={{ backgroundColor: '#C2B5FC10', borderColor: '#C2B5FC30' }}>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Sparkles className="h-5 w-5" style={{ color: '#C2B5FC' }} />
                    <span className="font-semibold" style={{ color: '#C2B5FC' }}>Pro Plan</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">$9<span className="text-lg text-slate-400">/month</span></div>
                  <div className="text-slate-400 text-sm">Unlock your full potential</div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  setShowPaywall(false);
                  // In real app, this would trigger RevenueCat payment flow
                  console.log('Starting payment flow...');
                }}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 text-slate-900 rounded-xl font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                style={{ background: '#C2B5FC' }}
              >
                <Sparkles className="h-5 w-5" />
                <span>Upgrade to Pro</span>
              </button>

              <div className="text-center mt-4">
                <p className="text-slate-500 text-xs">
                  ✨ 7-day free trial • 🔒 Cancel anytime • 💳 Secure payment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};