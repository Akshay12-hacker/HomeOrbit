import API from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.title || error?.message || 'Incorrect OTP. Please try again.';
};

export const verifyOTP = async (phone, otp) => {
  try {
    const res = await API.post('/Auth/verify-otp', {
      MobileNumber: phone,
      OtpCode: otp,
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
