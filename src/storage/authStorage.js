import AsyncStorage
  from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY =
  'homeorbit_access_token';

const REFRESH_TOKEN_KEY =
  'homeorbit_refresh_token';

const USER_KEY =
  'homeorbit_user';

export const saveAuthData =
  async ({
    accessToken,
    refreshToken,
    user,
  }) => {
    await AsyncStorage.multiSet([
      [
        ACCESS_TOKEN_KEY,
        accessToken,
      ],
      [
        REFRESH_TOKEN_KEY,
        refreshToken,
      ],
      [
        USER_KEY,
        JSON.stringify(user),
      ],
    ]);
  };

export const getAccessToken =
  async () => {
    return AsyncStorage.getItem(
      ACCESS_TOKEN_KEY
    );
  };

export const getRefreshToken =
  async () => {
    return AsyncStorage.getItem(
      REFRESH_TOKEN_KEY
    );
  };

export const getStoredUser =
  async () => {
    const value =
      await AsyncStorage.getItem(
        USER_KEY
      );

    return value
      ? JSON.parse(value)
      : null;
  };

export const saveSelectedProfile = async (profile) => {
  const user = await getStoredUser();
  if (!user) return;

  const updatedUser = {
    ...user,
    selectedProfile: profile,
    selectedUnit: profile?.unitOwner?.[0] || null,
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
};

export const clearAuthData = async () => {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_KEY,
    ]);
  };