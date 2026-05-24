import { Platform } from 'react-native';

import {
  CFDropCheckoutPayment,
  CFEnvironment,
  CFSession,
  CFThemeBuilder,
} from 'cashfree-pg-api-contract';

const CHECKOUT_MODE = 'DROP';
const isCashfreeMockEnabled = () => false;
let mockCallbacks = null;
let mockPaymentTimer = null;
let nativeGateway = null;

const getNativeGateway = () => {
  if (Platform.OS === 'web') return null;

  if (!nativeGateway) {
    nativeGateway = require('react-native-cashfree-pg-sdk').CFPaymentGatewayService;
  }

  return nativeGateway;
};

const toCashfreeEnvironment = (environment) => {
  const normalized = String(environment || 'SANDBOX').toUpperCase();
  return normalized === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
};

export const startCashfreePayment = ({
  paymentSessionId,
  orderId,
  environment,
}) => {
  const gateway = getNativeGateway();

  if (isCashfreeMockEnabled() || !gateway) {
    clearTimeout(mockPaymentTimer);
    mockPaymentTimer = setTimeout(() => {
      mockCallbacks?.onSuccess?.(orderId);
    }, 1200);
    return;
  }

  const session = new CFSession(
    paymentSessionId,
    orderId,
    toCashfreeEnvironment(environment)
  );

  const checkoutMode = CHECKOUT_MODE;

  if (checkoutMode === 'WEB') {
    gateway.doWebPayment(session);
    return;
  }

  const theme = new CFThemeBuilder()
    .setNavigationBarBackgroundColor('#0B1B3A')
    .setNavigationBarTextColor('#FFFFFF')
    .setButtonBackgroundColor('#2563EB')
    .setButtonTextColor('#FFFFFF')
    .setPrimaryTextColor('#111827')
    .setSecondaryTextColor('#6B7280')
    .setBackgroundColor('#FFFFFF')
    .build();

  const dropPayment = new CFDropCheckoutPayment(session, null, theme);
  gateway.doPayment(dropPayment);
};

export const setPaymentCallbacks = (onSuccess, onFailure) => {
  const gateway = getNativeGateway();

  if (isCashfreeMockEnabled() || !gateway) {
    mockCallbacks = { onSuccess, onFailure };
    return;
  }

  gateway.setCallback({
    onVerify: (orderId) => {
      onSuccess(orderId);
    },
    onError: (error, orderId) => {
      onFailure(error, orderId);
    }
  });
};

export const removePaymentCallbacks = () => {
  clearTimeout(mockPaymentTimer);
  mockPaymentTimer = null;
  mockCallbacks = null;

  const gateway = getNativeGateway();

  if (isCashfreeMockEnabled() || !gateway) return;

  try {
    gateway.removeCallback();
  } catch {
    // Native module may be unavailable in Expo Go or web previews.
  }
};
