let callbacks = null;
let paymentTimer = null;

export const startCashfreePayment = ({
  orderId,
}) => {
  clearTimeout(paymentTimer);

  paymentTimer = setTimeout(() => {
    callbacks?.onSuccess?.(orderId);
  }, 800);
};

export const setPaymentCallbacks = (onSuccess, onFailure) => {
  callbacks = {
    onSuccess,
    onFailure,
  };
};

export const removePaymentCallbacks = () => {
  clearTimeout(paymentTimer);
  paymentTimer = null;
  callbacks = null;
};
