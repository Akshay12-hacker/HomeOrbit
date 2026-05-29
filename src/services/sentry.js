import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

/**
 * Sentry Service Configuration
 * 
 * To fully enable Sentry:
 * 1. Create a project at sentry.io
 * 2. Replace the DSN below with your project DSN
 */

const SENTRY_DSN = 'https://b6d7d465bb3dfa592b3aff9f1df09e01@o4511456048250880.ingest.us.sentry.io/4511456051855360';

export const initSentry = () => {
  if (__DEV__) {
    console.log('Sentry is disabled in development mode.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false, // Change to true to see debug logs
    environment: 'production',
    enableAutoSessionTracking: true,
    // Enable performance monitoring
    tracesSampleRate: 1.0, 
    // Capture unhandled rejections
    enableNativeCrashHandling: true,
  });
};

export const captureException = (error, context = {}) => {
  if (!__DEV__) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Sentry (Mock):', error, context);
  }
};

export const setUserContext = (user) => {
  if (!__DEV__) {
    Sentry.setUser({
      id: user.userId,
      username: user.username,
      email: user.email,
    });
  }
};

export default Sentry;
