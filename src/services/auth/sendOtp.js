import API from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  const validationErrors = data?.errors && Object.values(data.errors).flat().join(' ');
  const serverMessage = data?.message || data?.title;

  if (error?.response?.status === 429) {
    return 'Too many OTP requests. Please wait a minute and try again.';
  }

  if (error?.response?.status >= 500 || serverMessage === 'An unexpected error occurred.') {
    return 'OTP service is temporarily unavailable. Please try again shortly.';
  }

  return validationErrors || serverMessage || error?.message || 'Failed to send OTP. Try again.';
};

export const sendOTP = async (phone) => {
  try {
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
