import API, {
  getGlobalProfile,
  getGlobalSocietyId,
} from '../../apiClient';

import { withApiError }
  from '../../apiError';

import { pickFirst }
  from '../../../utils/helpers';

import {
  normalizeActivePlan,
} from '../utils/normalizeActivePlan';

const resolveSocietyId = (
  societyId
) => {
  const profile =
    getGlobalProfile() || {};

  return pickFirst(
    societyId,
    profile.societyId,
    profile.SocietyId,
    profile.society?.id,
    profile.Society?.Id,
    getGlobalSocietyId()
  );
};

export const getCurrentActivePlan =
  async (societyId) => {
    const resolvedSocietyId =
      resolveSocietyId(societyId);

    if (!resolvedSocietyId)
      return null;

    try {
      const response =
        await API.get(
          `/SocietySubscription/current-active-plan/${resolvedSocietyId}`
        );

      return normalizeActivePlan(
        response.data
      );
    } catch (error) {
      if (
        error?.response?.status === 404
      ) {
        return null;
      }

      throw withApiError(
        error,
        'Unable to fetch current active subscription plan.'
      );
    }
  };