# Datadog Integration Guide

## Overview
This project includes comprehensive error handling and logging with Datadog RUM (Real User Monitoring) integration.

## Setup

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Datadog Configuration
VITE_DATADOG_ENABLED=true
VITE_DATADOG_APP_ID=your_application_id
VITE_DATADOG_CLIENT_TOKEN=your_client_token
VITE_DATADOG_SITE=datadoghq.com
VITE_APP_NAME=second-brain-web
VITE_APP_VERSION=0.0.0
```

### 2. Build with Source Maps
For production deployment with Datadog source map support:

```bash
# Standard build
bun run build

# Build with Datadog source map upload
bun run build:datadog
```

The `build:datadog` command will:
1. Build the application
2. Upload source maps to Datadog for better error tracking

## Features

### Error Handling
- **Centralized Logger**: PII-safe logging with `src/lib/logger.ts`
- **React Error Boundary**: Catches component errors gracefully
- **Global Error Listeners**: Captures unhandled errors and promise rejections
- **Datadog Integration**: All errors are sent to Datadog RUM

### Logging
- **Log Levels**: debug, info, warn, error
- **PII Scrubbing**: Automatically removes sensitive information
- **Console Management**: Production builds strip console.log statements
- **Datadog Logs**: Forward logs to Datadog for analysis

### Monitoring
- **Real User Monitoring (RUM)**: Track user interactions and performance
- **Session Replay**: Record user sessions for debugging
- **React Router Integration**: Track page navigation and route performance
- **Source Map Integration**: Better error stack traces in Datadog

## Usage

### Logger
```typescript
import { logger } from './lib/logger';

// Log messages
logger.info('User logged in', { userId: '123' });
logger.error('API call failed', { error: error.message, endpoint: '/api/users' });
logger.warn('Deprecated feature used', { feature: 'old-api' });
```

### Error Boundary
The `ErrorBoundary` component automatically catches React errors and sends them to Datadog.

### Datadog Actions
```typescript
import { datadogRum } from '@datadog/browser-rum';

// Track custom actions
datadogRum.addAction('user-action', { action: 'button-click', page: 'dashboard' });
```

## Security

### PII Protection
- All logs are automatically scrubbed for PII
- User input is masked in Datadog by default
- API keys are handled server-side only

### Console Management
- Production builds remove console.log statements
- Only error and warn logs are preserved
- ESLint warns about console usage in development

## Troubleshooting

### Source Maps
If you see "Source map not found" errors in Datadog:
1. Ensure you're using `bun run build:datadog` for production
2. Check that `VITE_APP_VERSION` matches your package.json version
3. Verify Datadog credentials are correct

### Datadog Not Loading
1. Check environment variables are set correctly
2. Verify `VITE_DATADOG_ENABLED=true`
3. Check browser console for initialization errors

## Files

- `src/lib/logger.ts` - Centralized logging system
- `src/monitoring.ts` - Datadog initialization
- `src/components/ErrorBoundary.tsx` - React error boundary
- `.datadog/sourcemap.json` - Source map configuration
- `vite.config.ts` - Build configuration with console stripping