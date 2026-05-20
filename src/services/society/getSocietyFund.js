import API, { getGlobalSocietyId } from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.title || error?.message || 'Failed to fetch society Fund.';
};

export const getSocietyFund = async (societyId) => {
  try {
    const res = await API.get('/society/fund', {
      params: {
        societyId: societyId || getGlobalSocietyId(), // match backend EXACTLY
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
