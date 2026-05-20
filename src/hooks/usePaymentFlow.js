import React from 'react';
import { Alert } from 'react-native';
import { createOrder } from '../services/payments/createOrder';
import { verifyPayment } from '../services/payments/verifyPayment';
import {
  removePaymentCallbacks,
  setPaymentCallbacks,
  startCashfreePayment,
} from '../services/payments/cashfreeService';
import { getApiErrorMessage } from '../services/apiError';

export const usePaymentFlow = ({ onSuccess, onFailure } = {}) => {
  const activePaymentRef = React.useRef(null);
  const [processingKey, setProcessingKey] = React.useState(null);

  const cleanup = React.useCallback((updateState = true) => {
    activePaymentRef.current = null;
    if (updateState) setProcessingKey(null);
    removePaymentCallbacks();
  }, []);

  React.useEffect(() => () => cleanup(false), [cleanup]);

  const handleVerify = React.useCallback(async (orderId) => {
    const activePayment = activePaymentRef.current;

    try {
      const result = await verifyPayment(orderId, {
        ...(activePayment?.metadata || {}),
        amount: activePayment?.amount,
        order: activePayment?.order,
      });

      await onSuccess?.(result, activePayment);
    } catch (error) {
      Alert.alert('Verification Failed', getApiErrorMessage(error));
      onFailure?.(error, activePayment);
    } finally {
      cleanup();
    }
  }, [cleanup, onFailure, onSuccess]);

  const handleFailure = React.useCallback((error) => {
    const activePayment = activePaymentRef.current;
    Alert.alert('Payment Failed', getApiErrorMessage(error));
    onFailure?.(error, activePayment);
    cleanup();
  }, [cleanup, onFailure]);

  const startPayment = React.useCallback(async ({ amount, metadata, context, key }) => {
    setProcessingKey(key ?? 'payment');

    try {
      const order = await createOrder(amount, metadata);
      activePaymentRef.current = { amount, metadata, context, order };
      setPaymentCallbacks(handleVerify, handleFailure);
      startCashfreePayment(order);
      return order;
    } catch (error) {
      Alert.alert('Unable to Start Payment', getApiErrorMessage(error));
      cleanup();
      return null;
    }
  }, [cleanup, handleFailure, handleVerify]);

  return {
    processingKey,
    startPayment,
    isProcessing: Boolean(processingKey),
  };
};
