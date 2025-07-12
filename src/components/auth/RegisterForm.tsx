import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isLoading, error, success } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      // The success alert is now in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6 lg:mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-xl" style={{ background: '#C2B5FC' }}>
            <UserPlus className="h-6 w-6 lg:h-8 lg:w-8 text-slate-900" />
          </div>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm lg:text-base">Join us and build your second brain</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm lg:text-base"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm lg:text-base"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-12 py-2.5 lg:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm lg:text-base"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              placeholder="Create a password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full text-slate-900 py-2.5 lg:py-3 px-6 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
          style={{ background: '#C2B5FC', '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
        >
          {(isLoading || isSubmitting) ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center mt-4 lg:mt-6">
        <p className="text-slate-400 text-sm lg:text-base">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="font-medium transition-colors hover:opacity-80"
            style={{ color: '#C2B5FC' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};