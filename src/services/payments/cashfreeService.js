import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
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

const toCashfreeEnvironment = (environment) => {
  const normalized = String(environment || 'SANDBOX').toUpperCase();
  return normalized === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
};

export const startCashfreePayment = ({
  paymentSessionId,
  orderId,
  environment,
}) => {
  if (isCashfreeMockEnabled()) {
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
    CFPaymentGatewayService.doWebPayment(session);
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
  CFPaymentGatewayService.doPayment(dropPayment);
};

export const setPaymentCallbacks = (onSuccess, onFailure) => {
  if (isCashfreeMockEnabled()) {
    mockCallbacks = { onSuccess, onFailure };
    return;
  }

  CFPaymentGatewayService.setCallback({
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

  if (isCashfreeMockEnabled()) return;

  try {
    CFPaymentGatewayService.removeCallback();
  } catch {
    // Native module may be unavailable in Expo Go or web previews.
  }
};
