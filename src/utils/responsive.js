import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design dimensions (standard mobile width)
const baseWidth = 375;
const baseHeight = 812;

const scaleWidth = SCREEN_WIDTH / baseWidth;
const scaleHeight = SCREEN_HEIGHT / baseHeight;

/**
 * Scales a value based on screen width.
 * Best for: margins, paddings, widths, heights.
 */
export const scale = (size) => {
  const newSize = size * scaleWidth;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales a value based on screen height.
 * Best for: vertical spacing where aspect ratio is critical.
 */
export const verticalScale = (size) => {
  const newSize = size * scaleHeight;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales font size based on screen width with a factor to prevent extreme sizes.
 * Best for: text font size.
 */
export const moderateScale = (size, factor = 0.5) => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const device = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isTablet: SCREEN_WIDTH >= 768,
  isIos: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

export default {
  scale,
  verticalScale,
  moderateScale,
  device,
};
