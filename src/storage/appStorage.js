import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'homeorbit_onboarding_seen';

export const getItem = async (key) => {
  return AsyncStorage.getItem(key);
};

export const setItem = async (key, value) => {
  return AsyncStorage.setItem(key, value);
};

export const markOnboardingSeen = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.log('ONBOARDING SAVE ERROR', error);
  }
};

export const hasSeenOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.log('ONBOARDING READ ERROR', error);
    return false;
  }
};

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.log('ONBOARDING RESET ERROR', error);
  }
};

const appStorage = {
  getItem,
  setItem,
  markOnboardingSeen,
  hasSeenOnboarding,
  resetOnboarding,
};

export default appStorage;
