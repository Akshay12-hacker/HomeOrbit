import API from '../apiClient';

const MOCK_ADMIN_PHONE = '9999999999';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.title || error?.message || 'Incorrect OTP. Please try again.';
};

export const verifyOTP = async (phone, otp) => {
  if (String(phone).replace(/\D/g, '') === MOCK_ADMIN_PHONE) {
    if (otp === '000000') {
      throw new Error('Incorrect OTP. Please try again.');
    }

    return {
      success: true,
      role: 'admin',
      isMock: true,
    };
  }

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
