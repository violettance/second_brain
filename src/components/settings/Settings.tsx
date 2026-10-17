import React, { useState } from 'react';
import { 
  Crown, 
  User, 
  Shield, 
  Palette, 
  Download,
  Check
} from 'lucide-react';
import { useMemoryNotes } from '../../hooks/useMemoryNotes';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '../../lib/logger';

export const Settings: React.FC = () => {
  const [subscription, setSubscription] = useState('free');
  const [theme, setTheme] = useState('dark');

  const { user } = useAuth();
  const { shortTermNotes, longTermNotes } = useMemoryNotes();
  const navigate = useNavigate();

  // Removed unused handleSave function

  const handleSubscriptionChange = (newPlan: string) => {
    if (newPlan === 'pro') {
      navigate('/pricing');
      return;
    }
    setSubscription(newPlan);
    // In real app, this would trigger payment flow
    logger.info('Subscription change requested', { newPlan });
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
    <div className="flex-1 bg-canvas overflow-y-auto h-screen">
      {/* Header */}
      <div className="bg-surface  border-b border-ink p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-2">Settings</h1>
            <p className="text-muted text-sm lg:text-base">
              Customize your Second Brain experience
            </p>
          </div>
          <div className="flex items-center justify-end w-full lg:w-auto">
            <span className="bg-surface-muted text-muted text-xs px-3 py-1 rounded-full font-medium">
              {user?.created_at ? `Member since: ${new Date(user.created_at).toLocaleDateString()}` : 'Member since: -'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-canvas min-h-full">
        
        {/* Subscription Section */}
        <div className="bg-surface  border border-ink rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-brand-secondary) 20%, transparent)' }}>
              <Crown className="h-6 w-6" style={{ color: 'var(--color-brand-secondary)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">Subscription</h2>
              <p className="text-muted text-sm">Manage your plan and billing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              subscription === 'free' 
                ? 'border-ink bg-surface-muted'
                : 'border-ink bg-surface hover:border-ink'
            }`} onClick={() => handleSubscriptionChange('free')}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-ink font-semibold">Free</h3>
                {subscription === 'free' && (
                  <div className="w-4 h-4 rounded-full" style={{ background: 'var(--color-brand-secondary)' }}>
                    <Check className="h-3 w-3 text-ink m-0.5" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-ink mb-2">$0</div>
              <div className="text-muted text-sm mb-4">per month</div>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Unlimited notes</li>
                <li>• Basic analytics</li>
                <li>• Standard support</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
              subscription === 'pro' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-ink bg-surface hover:border-purple-500/50'
            }`} onClick={() => handleSubscriptionChange('pro')}>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-ink text-xs px-2 py-1 rounded-full">Popular</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-ink font-semibold">Pro</h3>
                {subscription === 'pro' && (
                  <div className="w-4 h-4 bg-purple-500 rounded-full">
                    <Check className="h-3 w-3 text-ink m-0.5" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-ink mb-2">$9</div>
              <div className="text-muted text-sm mb-4">per month</div>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Unlimited notes</li>
                <li>• Advanced analytics</li>
                <li>• AI insights</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </div>


        {/* Appearance */}
        <div className="bg-surface  border border-ink rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-brand-purple) 20%, transparent)' }}>
              <Palette className="h-6 w-6" style={{ color: 'var(--color-brand-purple)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">Appearance</h2>
              <p className="text-muted text-sm">Customize the look and feel</p>
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
                      : 'border-ink bg-surface hover:border-ink'
                  }`}
                >
                  <div className="w-full h-8 bg-canvas rounded mb-2"></div>
                  <div className="text-ink text-sm">Dark Theme</div>
                </button>
                <button
                  onClick={() => {
                    if (subscription === 'pro') {
                      setTheme('light');
                    } else {
                      // setShowPaywall(true); // Removed unused function
                    }
                  }}
                  className={`relative p-4 rounded-lg border transition-all ${
                    theme === 'light' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-ink bg-surface hover:border-ink'
                  }`}
                >
                  {/* Pro badge */}
                  <span className="absolute top-2 right-2 bg-purple-500 text-ink text-xs px-2 py-0.5 rounded-full z-10">Pro</span>
                  <div className="w-full h-8 bg-slate-100 rounded mb-2" style={{ background: 'var(--color-neutral-mid)' }}></div>
                  <div className="text-ink text-sm">Light Theme</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management & Account Info yan yana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Management */}
          <div className="bg-surface  border border-ink rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-brand-secondary) 20%, transparent)' }}>
                <Shield className="h-6 w-6" style={{ color: 'var(--color-brand-secondary)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Data Management</h2>
                <p className="text-muted text-sm">Export your notes as CSV</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className="flex flex-col items-center space-y-3 p-4 bg-surface-muted rounded-lg border border-ink hover:bg-surface-muted transition-colors"
                onClick={() => exportNotesToCSV(shortTermNotes, 'short_term_notes.csv')}
              >
                <Download className="h-6 w-6" style={{ color: 'var(--color-brand-secondary)' }} />
                <div className="text-center">
                  <div className="text-ink font-medium text-sm">Export Short Term Notes</div>
                  <div className="text-muted text-xs">Download as CSV</div>
                </div>
              </button>
              <button
                className="flex flex-col items-center space-y-3 p-4 bg-surface-muted rounded-lg border border-ink hover:bg-surface-muted transition-colors"
                onClick={() => exportNotesToCSV(longTermNotes, 'long_term_notes.csv')}
              >
                <Download className="h-6 w-6" style={{ color: 'var(--color-brand-secondary)' }} />
                <div className="text-center">
                  <div className="text-ink font-medium text-sm">Export Long Term Notes</div>
                  <div className="text-muted text-xs">Download as CSV</div>
                </div>
              </button>
            </div>
          </div>
          {/* Account Information */}
          <div className="bg-surface  border border-ink rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-brand-yellow) 20%, transparent)' }}>
                <User className="h-6 w-6" style={{ color: 'var(--color-brand-yellow)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Account Information</h2>
                <p className="text-muted text-sm">Your account details</p>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-surface-muted border border-ink rounded-lg text-muted text-sm"
              />
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-2 bg-surface-muted border border-ink rounded-lg text-muted text-sm"
              />
            </div>
          </div>
        </div>

        {/* Extra padding at bottom */}
        <div className="h-8"></div>
      </div>
      <div className="w-full flex justify-center mt-8 mb-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link
            to="/terms-and-conditions"
            className="text-muted hover:text-brand-purple-deep underline transition-colors"
          >
            Terms & Conditions
          </Link>
          <Link
            to="/privacy-policy"
            className="text-muted hover:text-brand-purple-deep underline transition-colors"
          >
            Privacy Policy
          </Link>
          <a
            href="mailto:productora.analytics@gmail.com"
            className="text-muted hover:text-brand-purple-deep underline transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
};