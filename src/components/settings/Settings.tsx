import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Crown, 
  User, 
  Shield, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Save,
  Check,
  X
} from 'lucide-react';
import { PaywallModal } from '../analytics/PaywallModal';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';
import { useAuth } from '../../contexts/AuthContext';

export const Settings: React.FC = () => {
  const [subscription, setSubscription] = useState('free');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('1');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyDigest: false,
    newFeatures: true,
    insights: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const { user } = useAuth();
  const { shortTermNotes, longTermNotes } = useMemoryNotes();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubscriptionChange = (newPlan: string) => {
    if (newPlan === 'pro') {
      setShowPaywall(true);
      return;
    }
    setSubscription(newPlan);
    // In real app, this would trigger payment flow
    console.log('Subscription change requested:', newPlan);
  };

  // CSV export helper
  function exportNotesToCSV(notes: any[], filename: string) {
    const headers = ['Title', 'Content', 'Note Date'];
    const rows = notes.map(n => [n.title, n.content, n.note_date]);
    let csvContent = '';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add a helper to set html class and localStorage
  function applyTheme(theme: string) {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  // On mount, set theme from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' && subscription === 'pro') {
      setTheme('light');
      applyTheme('light');
    } else {
      setTheme('dark');
      applyTheme('dark');
    }
    // eslint-disable-next-line
  }, []);

  // When theme changes, apply it
  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Customize your Second Brain experience
            </p>
          </div>
          <div className="flex items-center justify-end w-full lg:w-auto">
            <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
              {user?.created_at ? `Member since: ${new Date(user.created_at).toLocaleDateString()}` : 'Member since: -'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        
        {/* Subscription Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: '#a7c7e720' }}>
              <Crown className="h-6 w-6" style={{ color: '#a7c7e7' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Subscription</h2>
              <p className="text-slate-400 text-sm">Manage your plan and billing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              subscription === 'free' 
                ? 'border-slate-500 bg-slate-700/50' 
                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
            }`} onClick={() => handleSubscriptionChange('free')}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Free</h3>
                {subscription === 'free' && (
                  <div className="w-4 h-4 rounded-full" style={{ background: '#a7c7e7' }}>
                    <Check className="h-3 w-3 text-slate-900 m-0.5" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-2">$0</div>
              <div className="text-slate-400 text-sm mb-4">per month</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Unlimited notes</li>
                <li>• Basic analytics</li>
                <li>• Standard support</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              subscription === 'pro' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-slate-700 bg-slate-800/30 hover:border-purple-500/50'
            }`} onClick={() => handleSubscriptionChange('pro')}>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Popular</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Pro</h3>
                {subscription === 'pro' && (
                  <div className="w-4 h-4 bg-purple-500 rounded-full">
                    <Check className="h-3 w-3 text-white m-0.5" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-2">$9</div>
              <div className="text-slate-400 text-sm mb-4">per month</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Unlimited notes</li>
                <li>• Advanced analytics</li>
                <li>• AI insights</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </div>
        {showPaywall && (
          <PaywallModal 
            onClose={() => setShowPaywall(false)}
            onUpgrade={() => {
              setShowPaywall(false);
              setSubscription('pro');
              // In real app, this would trigger payment flow
              console.log('Starting payment flow...');
            }}
          />
        )}

        {/* Appearance */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: '#d4a5d420' }}>
              <Palette className="h-6 w-6" style={{ color: '#d4a5d4' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Appearance</h2>
              <p className="text-slate-400 text-sm">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border transition-all ${
                    theme === 'dark' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="w-full h-8 bg-slate-900 rounded mb-2"></div>
                  <div className="text-white text-sm">Dark Theme</div>
                </button>
                <button
                  onClick={() => {
                    if (subscription === 'pro') {
                      setTheme('light');
                    } else {
                      setShowPaywall(true);
                    }
                  }}
                  className={`relative p-4 rounded-lg border transition-all ${
                    theme === 'light' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  {/* Pro badge */}
                  <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full z-10">Pro</span>
                  <div className="w-full h-8 bg-slate-100 rounded mb-2" style={{ background: '#c1c1c1' }}></div>
                  <div className="text-white text-sm">Light Theme</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management & Account Info yan yana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Management */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: '#b8e6b820' }}>
                <Shield className="h-6 w-6" style={{ color: '#b8e6b8' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Data Management</h2>
                <p className="text-slate-400 text-sm">Export your notes as CSV</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className="flex flex-col items-center space-y-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/70 transition-colors"
                onClick={() => exportNotesToCSV(shortTermNotes, 'short_term_notes.csv')}
              >
                <Download className="h-6 w-6" style={{ color: '#b8e6b8' }} />
                <div className="text-center">
                  <div className="text-white font-medium text-sm">Export Short Term Notes</div>
                  <div className="text-slate-400 text-xs">Download as CSV</div>
                </div>
              </button>
              <button
                className="flex flex-col items-center space-y-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/70 transition-colors"
                onClick={() => exportNotesToCSV(longTermNotes, 'long_term_notes.csv')}
              >
                <Download className="h-6 w-6" style={{ color: '#b8e6b8' }} />
                <div className="text-center">
                  <div className="text-white font-medium text-sm">Export Long Term Notes</div>
                  <div className="text-slate-400 text-xs">Download as CSV</div>
                </div>
              </button>
            </div>
          </div>
          {/* Account Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: '#f0d4a320' }}>
                <User className="h-6 w-6" style={{ color: '#f0d4a3' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Account Information</h2>
                <p className="text-slate-400 text-sm">Your account details</p>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 text-sm"
              />
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Extra padding at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};