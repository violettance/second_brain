import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, error: authError } = useAuth();
  const visibleError = error || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6 lg:mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-xl" style={{ background: 'var(--color-brand-primary)' }}>
            <LogIn className="h-6 w-6 lg:h-8 lg:w-8 text-ink" />
          </div>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-ink mb-2">Welcome Back</h2>
        <p className="text-muted text-sm lg:text-base">Sign in to access your second brain</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {visibleError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-brand-primary-deep text-sm">
            {visibleError}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-surface border border-ink rounded-xl text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm lg:text-base"
              style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-12 py-2.5 lg:py-3 bg-surface border border-ink rounded-xl text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm lg:text-base"
              style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-muted transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-ink py-2.5 lg:py-3 px-6 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
          style={{ background: 'var(--color-brand-primary)', '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-4 lg:mt-6">
        <p className="text-muted text-sm lg:text-base">
          Don't have an account?{' '}
          <button
            onClick={onToggleMode}
            className="font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};
