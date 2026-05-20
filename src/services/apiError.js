export const getApiErrorMessage = (error, fallback = 'Please try again.') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;

  return (
    data?.message ||
    data?.title ||
    error?.message ||
    error?.getMessage?.() ||
    fallback
  );
};

export const withApiError = (error, fallback) => Object.assign(
  new Error(getApiErrorMessage(error, fallback)),
  {
    cause: error,
    response: error?.response,
    status: error?.response?.status,
  }
);
