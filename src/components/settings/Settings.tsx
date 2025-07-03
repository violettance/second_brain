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
    setSubscription(newPlan);
    // In real app, this would trigger payment flow
    console.log('Subscription change requested:', newPlan);
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Customize your Second Brain experience
            </p>
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90 disabled:opacity-50"
            style={{ background: '#a7c7e7' }}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : showSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <li>• 100 notes limit</li>
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

            {/* Enterprise Plan */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              subscription === 'enterprise' 
                ? 'border-yellow-500 bg-yellow-500/10' 
                : 'border-slate-700 bg-slate-800/30 hover:border-yellow-500/50'
            }`} onClick={() => handleSubscriptionChange('enterprise')}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Enterprise</h3>
                {subscription === 'enterprise' && (
                  <div className="w-4 h-4 bg-yellow-500 rounded-full">
                    <Check className="h-3 w-3 text-slate-900 m-0.5" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-2">$29</div>
              <div className="text-slate-400 text-sm mb-4">per month</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Everything in Pro</li>
                <li>• Team collaboration</li>
                <li>• Custom integrations</li>
                <li>• Dedicated support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: '#f4c2a120' }}>
              <Bell className="h-6 w-6" style={{ color: '#f4c2a1' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications & Reminders</h2>
              <p className="text-slate-400 text-sm">Control when and how you get notified</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Reminder Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div>
                <h3 className="text-white font-medium">Due Date Reminders</h3>
                <p className="text-slate-400 text-sm">Get notified before tasks and notes are due</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reminderEnabled ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-slate-400 text-sm">
                  {reminderEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Reminder Time */}
            {reminderEnabled && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 pl-4 border-l-2 border-slate-700">
                <div>
                  <h3 className="text-white font-medium">Reminder Time</h3>
                  <p className="text-slate-400 text-sm">How early should we remind you?</p>
                </div>
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#f4c2a1' } as React.CSSProperties}
                >
                  <option value="1">1 day before</option>
                  <option value="2">2 days before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                </select>
              </div>
            )}

            {/* Other Notifications */}
            <div className="space-y-4">
              <h3 className="text-white font-medium">Other Notifications</h3>
              
              {Object.entries({
                dailyReminder: 'Daily note reminder',
                weeklyDigest: 'Weekly knowledge digest',
                newFeatures: 'New feature announcements',
                insights: 'AI-generated insights'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notifications[key as keyof typeof notifications] ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

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
              <h3 className="text-white font-medium mb-3">Theme</h3>
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
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border transition-all ${
                    theme === 'light' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="w-full h-8 bg-slate-100 rounded mb-2"></div>
                  <div className="text-white text-sm">Light Theme</div>
                  <div className="text-xs text-slate-400">(Coming Soon)</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: '#b8e6b820' }}>
              <Shield className="h-6 w-6" style={{ color: '#b8e6b8' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Data Management</h2>
              <p className="text-slate-400 text-sm">Import, export, and manage your data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center space-y-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/70 transition-colors">
              <Download className="h-6 w-6" style={{ color: '#b8e6b8' }} />
              <div className="text-center">
                <div className="text-white font-medium text-sm">Export Data</div>
                <div className="text-slate-400 text-xs">Download all your notes</div>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/70 transition-colors">
              <Upload className="h-6 w-6" style={{ color: '#a7c7e7' }} />
              <div className="text-center">
                <div className="text-white font-medium text-sm">Import Data</div>
                <div className="text-slate-400 text-xs">Upload from other apps</div>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors">
              <Trash2 className="h-6 w-6 text-red-400" />
              <div className="text-center">
                <div className="text-red-400 font-medium text-sm">Delete Account</div>
                <div className="text-slate-400 text-xs">Permanently remove data</div>
              </div>
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: '#f0d4a320' }}>
              <User className="h-6 w-6" style={{ color: '#f0d4a3' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Account Information</h2>
              <p className="text-slate-400 text-sm">Your account details and usage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value="demo@secondbrain.com"
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value="Knowledge Seeker"
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-medium mb-2">Usage Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Notes Created:</span>
                    <span className="text-white">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Storage Used:</span>
                    <span className="text-white">2.4 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member Since:</span>
                    <span className="text-white">Jan 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extra padding at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};