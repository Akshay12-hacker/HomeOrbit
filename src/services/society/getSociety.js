import API from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.title || error?.message || 'Failed to fetch societies.';
};

export const getSociety = async (query) => {
  try {
    const res = await API.get('/society/search', {
      params: {
        societyName: query, // match backend EXACTLY
      },
    });

    const data = res.data;
    return Array.isArray(data) ? data : data?.value ?? data?.data ?? data?.items ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
