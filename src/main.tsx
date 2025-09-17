import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { setupMonitoring } from './monitoring.ts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PostHogProvider } from 'posthog-js/react';

setupMonitoring();

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const posthogHost = (import.meta.env.MODE === 'development')
  ? '/ph'
  : ((import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com');
// Control PostHog verbose console logs via env; default off
const isPosthogDebugEnabled = import.meta.env.VITE_POSTHOG_DEBUG === 'true';

const appTree = (
  <BrowserRouter>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </BrowserRouter>
);

createRoot(document.getElementById('root')!).render(
  posthogKey ? (
    <PostHogProvider
      apiKey={posthogKey}
      options={{
        api_host: posthogHost,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: isPosthogDebugEnabled,
      }}
    >
      {appTree}
    </PostHogProvider>
  ) : (
    appTree
  )
);