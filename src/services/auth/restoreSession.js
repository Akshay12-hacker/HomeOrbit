import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
} from '../../storage/authStorage';

import {
  authStore,
} from '../../stores/authStore';

import {
  setGlobalProfile,
  setGlobalProfiles,
  setGlobalTokens,
} from '../apiClient';

export const restoreSession =
  async () => {
    try {
      const accessToken =
        await getAccessToken();

      const refreshToken =
        await getRefreshToken();

      const storedUser =
        await getStoredUser();

      if (
        !accessToken ||
        !refreshToken ||
        !storedUser
      ) {
        authStore.hydrateComplete();

        return null;
      }

      const session = {
        accessToken,

        refreshToken,

        user: {
          userId:
            storedUser.userId,

          username:
            storedUser.username,

          name:
            storedUser.name ||
            storedUser.selectedProfile?.ownerName ||
            storedUser.selectedProfile?.OwnerName ||
            storedUser.username,

          phone:
            storedUser.phone ||
            storedUser.selectedProfile?.ownerPhone ||
            storedUser.selectedProfile?.OwnerPhone,

          email:
            storedUser.email,

          roles:
            storedUser.roles ||
            [],
        },

        selectedProfile:
          storedUser.selectedProfile,

        selectedUnit:
          storedUser.selectedUnit,

        ownerProfiles:
          storedUser.ownerProfiles ||
          [],
      };

      authStore.setSession(
        session
      );

      setGlobalTokens(
        accessToken,
        refreshToken
      );

      setGlobalProfiles(
        session.ownerProfiles
      );

      setGlobalProfile(
        session.selectedProfile
      );

      return session;
    } catch (error) {
      console.log(
        'RESTORE SESSION ERROR',
        error
      );

      authStore.clearSession();

      return null;
    }
  };
