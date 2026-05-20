import API from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  return (
    data?.message ||
    error?.message ||
    'Failed to fetch last payment.'
  );
};

export const getLastPayment = async ({
  societyId,
  ownerId,
  unitId,
}) => {
  try {

    const res = await API.get(
      `/payment/${societyId}/owner/${ownerId}/unit/${unitId}/last`
    );

    return res.data;

  } catch (error) {

    throw new Error(
      getErrorMessage(error)
    );
  }
};