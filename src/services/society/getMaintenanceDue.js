import API from '../apiClient';

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  return (
    data?.message ||
    error?.message ||
    'Failed to fetch maintenance due.'
  );
};

export const getMaintenanceDue = async (input, ownerIdArg, unitIdArg) => {
  const params = typeof input === 'object' && input !== null
    ? input
    : { societyId: input, ownerId: ownerIdArg, unitId: unitIdArg };

  const { societyId, ownerId, unitId } = params;

  if (!societyId || !ownerId || !unitId) {
    return { pendingAmount: 0 };
  }

  try {

    const res = await API.get(
      `/MaintenanceLedger/pendingledger/${societyId}/${ownerId}/${unitId}`
    );

    return res.data;

  } catch (error) {

    throw Object.assign(new Error(getErrorMessage(error)), {
      cause: error,
      response: error?.response,
      status: error?.response?.status,
    });
  }
};
