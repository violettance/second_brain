import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Brain } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) window.location.href = '/';
  }, [user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4 lg:p-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border-2 border-ink bg-surface shadow-lg md:grid-cols-auth">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r-2 border-ink bg-brand-secondary p-8 md:flex lg:p-10">
          <a href="/" className="inline-flex w-fit items-center gap-3 font-display text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
            Second Brain
          </a>
          <div className="relative z-10 py-12">
            <Brain aria-hidden="true" className="mb-6 h-12 w-12" />
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Good ideas grow when you can find them again.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed">
              Bring daily notes, lasting knowledge, projects, and tasks into one connected space.
            </p>
          </div>
          <div className="relative z-10 flex items-center justify-between border-t-2 border-ink pt-4 text-sm font-semibold">
            <span>Built for your next thought</span>
            <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
          </div>
          <div aria-hidden="true" className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full border-2 border-ink bg-brand-yellow shadow-lg" />
          <div aria-hidden="true" className="absolute right-10 top-1/3 h-8 w-8 rotate-12 border-2 border-ink bg-brand-primary shadow-sm" />
        </aside>

        <div className="p-6 sm:p-8 lg:p-12">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold">Second Brain</span>
          </div>
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </section>
    </main>
  );
};
