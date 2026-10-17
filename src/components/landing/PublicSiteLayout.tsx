import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const pages = [
  { label: 'Pricing', path: '/our-pricing' },
  { label: 'Privacy', path: '/privacy-policy' },
  { label: 'Terms', path: '/terms-and-conditions' },
];

interface PublicSiteLayoutProps {
  children: ReactNode;
  onGoToApp?: () => void;
}

export function PublicSiteLayout({ children, onGoToApp }: PublicSiteLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const openWorkspace = () => {
    setMenuOpen(false);
    if (onGoToApp) onGoToApp();
    else navigate('/auth');
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <a href="#public-content" className="sb-skip-link">Skip to content</a>
      <header className="relative z-menu border-b-2 border-ink bg-surface">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Second Brain by Productora, home">
            <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
            <span>
              <span className="block font-display text-lg font-bold tracking-tight">Second Brain</span>
              <span className="block text-xs text-muted">by Productora</span>
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {pages.map(({ label, path }) => (
              <Link key={path} to={path} aria-current={pathname === path ? 'page' : undefined}
                className={`border-b-2 py-1 text-sm font-medium transition-colors duration-fast hover:text-ink ${pathname === path ? 'border-ink text-ink' : 'border-transparent text-muted'}`}>
                {label}
              </Link>
            ))}
            <button type="button" onClick={openWorkspace} className="sb-action inline-flex items-center gap-2 px-4 py-2 text-sm">
              Open your workspace <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-controls="public-mobile-navigation" aria-expanded={menuOpen}
            className="sb-control p-2 md:hidden">
            {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </nav>
        {menuOpen && (
          <nav id="public-mobile-navigation" aria-label="Mobile navigation" className="border-t-2 border-ink px-4 pb-5 pt-3 md:hidden">
            <div className="flex flex-col gap-2">
              {pages.map(({ label, path }) => (
                <Link key={path} to={path} onClick={() => setMenuOpen(false)} aria-current={pathname === path ? 'page' : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${pathname === path ? 'bg-brand-yellow-soft' : 'hover:bg-surface-subtle'}`}>
                  {label}
                </Link>
              ))}
              <button type="button" onClick={openWorkspace} className="sb-action mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm">
                Open your workspace <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </nav>
        )}
      </header>

      <main id="public-content" className="flex-1">{children}</main>

      <footer className="border-t-2 border-ink bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <Link to="/" className="font-display text-base font-bold">Second Brain by Productora</Link>
            <p className="mt-1 text-xs text-muted">A home for the ideas worth keeping.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
            {pages.map(({ label, path }) => <Link key={path} to={path} className="hover:text-ink">{label}</Link>)}
            <a href="mailto:productora.analytics@gmail.com" className="hover:text-ink">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
