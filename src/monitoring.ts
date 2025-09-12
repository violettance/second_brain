import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';
import { reactPlugin } from '@datadog/browser-rum-react';
import { logger } from './lib/logger';

export function setupMonitoring() {
  const enableDatadog = import.meta.env.VITE_DATADOG_ENABLED === 'true';
  const applicationId = import.meta.env.VITE_DATADOG_APP_ID;
  const clientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
  const site = import.meta.env.VITE_DATADOG_SITE || 'datadoghq.com';
  const service = import.meta.env.VITE_APP_NAME || 'second-brain-web';
  const env = import.meta.env.MODE;

  if (enableDatadog && applicationId && clientToken) {
    try {
      datadogRum.init({
        applicationId,
        clientToken,
        site,
        service,
        env,
        version: import.meta.env.VITE_APP_VERSION,
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackResources: true,
        trackLongTasks: true,
        trackUserInteractions: true,
        defaultPrivacyLevel: 'mask-user-input',
        // React Router entegrasyonu
        plugins: [reactPlugin({ router: true })],
        // Enable source code integration
        beforeSend: (event) => {
          // Add source code context to errors
          if (event.type === 'error') {
            event.context = {
              ...event.context,
              sourceCode: {
                repository: 'second-brain',
                service: 'second-brain-web',
                version: import.meta.env.VITE_APP_VERSION || '0.1.0',
              },
            };
          }
          return event;
        },
      });
      datadogRum.startSessionReplayRecording();

      datadogLogs.init({
        clientToken,
        site,
        service,
        env,
        forwardErrorsToLogs: true,
        // forward only important console levels
        forwardConsoleLogs: ['info', 'warn', 'error'],
      });
      logger.info('Datadog initialized');
    } catch (e) {
      // Do not block app on monitoring failure
      // eslint-disable-next-line no-console
      console.warn('Datadog init failed');
    }
  }

  // Global error handlers
  window.addEventListener('error', (event) => {
    logger.error('GlobalError', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('UnhandledPromiseRejection', {
      reason: String((event as PromiseRejectionEvent).reason),
    });
  });
}


