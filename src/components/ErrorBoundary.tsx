import React from 'react';
import { datadogRum } from '@datadog/browser-rum';
import { logger } from '../lib/logger';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to our custom logger
    logger.error('ReactErrorBoundary', { message: error.message, stack: error.stack, info });
    
    // Send to Datadog RUM
    datadogRum.addError(error, {
      source: 'react-error-boundary',
      componentStack: info.componentStack,
      errorBoundary: this.constructor.name
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center text-slate-100">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-slate-300 mb-6">Try refreshing the page. If the problem persists, please contact support.</p>
            <button className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600" onClick={() => location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}



