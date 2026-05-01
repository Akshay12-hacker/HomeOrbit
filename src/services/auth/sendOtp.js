import API from '../apiClient';
import logger from '../logger';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  const validationErrors = data?.errors && Object.values(data.errors).flat().join(' ');
  const serverMessage = data?.message || data?.title;

  if (error?.response?.status === 429) {
    return 'Too many OTP requests. Please wait a minute and try again.';
  }

  if (error?.response?.status >= 500 || serverMessage === 'An unexpected error occurred.') {
    return 'Please Enter Valid Number.';
  }

  return validationErrors || serverMessage || error?.message || 'Failed to send OTP. Try again.';
};

export const sendOTP = async (phone) => {
  try {
    logger.info('send_otp_started', {
      url: '/Auth/send-otp',
      params: { MobileNumber: phone },
      body: { MobileNumber: phone },
    });

    const res = await API.post('/Auth/send-otp', {
      MobileNumber: phone,
    }, {
      params: {
        MobileNumber: phone,
      },
    });

    return res.data;
  } catch (error) {
    const otpError = new Error(getErrorMessage(error));
    otpError.status = error?.response?.status;
    otpError.traceId = error?.response?.data?.traceId;
    otpError.responseData = error?.response?.data;
    throw otpError;
  }
};
