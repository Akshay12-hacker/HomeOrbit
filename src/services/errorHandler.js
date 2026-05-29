import logger from './logger';
import { captureException } from './sentry';

let installed = false;

export const installGlobalErrorLogger = () => {
  if (installed) return;
  installed = true;

  const globalErrorUtils = global.ErrorUtils;
  const previousHandler = globalErrorUtils?.getGlobalHandler?.();

  globalErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    // Log to local logger
    logger.error('app_unhandled_error', {
      isFatal,
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });

    // Report to Sentry
    captureException(error, { isFatal });

    previousHandler?.(error, isFatal);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener?.('unhandledrejection', (event) => {
      const error = event.reason;
      logger.error('app_unhandled_promise_rejection', {
        message: error?.message || String(error),
        stack: error?.stack,
      });

      // Report to Sentry
      captureException(error, { type: 'unhandled_promise_rejection' });
    });
  }
};
