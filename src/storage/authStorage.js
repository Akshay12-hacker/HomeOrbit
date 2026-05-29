import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'homeorbit_access_token';
const REFRESH_TOKEN_KEY = 'homeorbit_refresh_token';
const USER_KEY = 'homeorbit_user';

export const saveAuthData = async ({ accessToken, refreshToken, user }) => {
  try {
    // Save sensitive tokens in Secure Store (Encrypted)
    if (accessToken) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    // Save non-sensitive user profile in AsyncStorage
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to save secure auth data', error);
  }
};

export const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve access token', error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token', error);
    return null;
  }
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
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear secure auth data', error);
  }
};

// Unified storage interface
export const authStorage = {
  getSession: async () => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    return { accessToken, refreshToken };
  },
  getUser: getStoredUser,
  getAccessToken,
  getRefreshToken,
  saveAuthData,
  clearAuthData,
  saveSelectedProfile,
};