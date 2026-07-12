import {
  clearAuthData,
} from '../../storage/authStorage';

import {
  authStore,
} from '../../stores/authStore';

import {
  setGlobalIds,
  setGlobalProfile,
  setGlobalProfiles,
  setGlobalTokens,
} from '../apiClient';

export const logout =
  async () => {
    await clearAuthData();

    setGlobalTokens(null, null);
    setGlobalIds(null, null);
    setGlobalProfile(null);
    setGlobalProfiles([]);

    authStore.clearSession();
  };
