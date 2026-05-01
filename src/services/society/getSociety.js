import API from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.title || error?.message || 'Failed to fetch societies.';
};

export const getSociety = async (query) => {
  try {
    const res = await API.get('/Society/search', {
      params: {
        query: query, // match backend EXACTLY
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};