import {
  clearAuthData,
} from '../../storage/authStorage';

import {
  authStore,
} from '../../stores/authStore';

import { resetOnboarding } from '../../storage/appStorage';

export const logout =
  async () => {
    await clearAuthData();
    await resetOnboarding();

    authStore.clearSession();
  };
