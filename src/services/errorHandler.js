import logger from './logger';

let installed = false;

export const installGlobalErrorLogger = () => {
  if (installed) return;
  installed = true;

  const globalErrorUtils = global.ErrorUtils;
  const previousHandler = globalErrorUtils?.getGlobalHandler?.();

  globalErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    logger.error('app_unhandled_error', {
      isFatal,
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });

    previousHandler?.(error, isFatal);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener?.('unhandledrejection', (event) => {
      logger.error('app_unhandled_promise_rejection', {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });
  }
};
