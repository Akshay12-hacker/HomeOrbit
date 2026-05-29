import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import Constants from 'expo-constants';

/**
 * Native methods exposed to the WebView
 */
export const handleNativeAction = async (action, payload, context = {}) => {
  const { navigation } = context;

  switch (action) {
    case 'NAVIGATE_TO_NATIVE':
      if (!navigation) throw new Error('Navigation context not found');
      navigation.navigate(payload.screen, payload.params);
      return { success: true };

    case 'GET_PUSH_TOKEN':
      return await handleGetPushToken();
    case 'GET_LOCATION':
      return await handleGetLocation(payload);
    
    case 'GET_SECURE_VALUE':
      return await SecureStore.getItemAsync(payload.key);
    
    case 'SET_SECURE_VALUE':
      await SecureStore.setItemAsync(payload.key, payload.value);
      return { success: true };

    case 'PICK_IMAGE':
      return await handlePickImage(payload);

    case 'TAKE_PHOTO':
      return await handleTakePhoto(payload);

    case 'HAPTIC_FEEDBACK':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return { success: true };

    case 'VIBRATE':
      Vibration.vibrate(payload?.duration || 400);
      return { success: true };

    case 'GET_DEVICE_INFO':
      return {
        platform: Platform.OS,
        version: Platform.Version,
        isNative: true,
      };

    case 'GET_APP_VERSION':
      return {
        version: '1.0.0', // This should be synced with app.json
        buildNumber: '1'
      };

    default:
      throw new Error(`Native action "${action}" not implemented.`);
  }
};

async function handleGetLocation(payload) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  const location = await Location.getCurrentPositionAsync(payload || {});
  return location;
}

async function handlePickImage(payload) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera roll permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
    ...payload,
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return result.assets[0];
}

async function handleTakePhoto(payload) {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission denied');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 1,
    ...payload,
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return result.assets[0];
}

async function handleGetPushToken() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    throw new Error('Push notification permission denied');
  }

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;
  
  return { token };
}
