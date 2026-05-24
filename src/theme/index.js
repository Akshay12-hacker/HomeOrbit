import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const lightColors = {
  primary: '#4F46E5',
  primaryDark: '#1a1f36',
  primaryLight: '#EEF2FF',
  primaryMid: '#6366F1',
  accent: '#F5A623',
  accentLight: '#FFFBEB',
  background: '#F8F7F2',
  surface: '#FFFFFF',
  surfaceAlt: '#EBE9E0',
  surfaceDeep: '#DCD9CD',
  textPrimary: '#1a1f36',
  textSecondary: '#4B5563',
  textMuted: '#71717A',
  textOnDark: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  success: '#10B981',
  successLight: '#DCFCE7',
  successDark: '#166534',
  warning: '#F5A623',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  paid: '#10B981',
  pending: '#F5A623',
  overdue: '#EF4444',
  border: '#EBE9E0',
  divider: '#F8F7F2',
  shadow: '#1a1f36',
  overlay: 'rgba(10,12,25,0.4)',
  skeleton: '#EBE9E0',
  skeletonShine: '#F8F7F2',
  gradientPrimary: ['#4F46E5', '#1a1f36'],
  gradientAccent: ['#F5A623', '#D97706'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientCard: ['#FFFFFF', '#FDFDFB'],
  gradientHero: ['#1e1b4b', '#4F46E5'],
};

export const darkColors = {
  primary: '#6366F1',
  primaryDark: '#000000',
  primaryLight: '#1e1b4b',
  primaryMid: '#4F46E5',
  accent: '#F5A623',
  accentLight: '#451a03',
  background: '#020617',
  surface: '#0f172a',
  surfaceAlt: '#1e293b',
  surfaceDeep: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textOnDark: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  success: '#10B981',
  successLight: '#022c22',
  successDark: '#059669',
  warning: '#F5A623',
  warningLight: '#451a03',
  error: '#EF4444',
  errorLight: '#450a0a',
  info: '#3B82F6',
  infoLight: '#172554',
  paid: '#10B981',
  pending: '#F5A623',
  overdue: '#EF4444',
  border: '#1e293b',
  divider: '#1e293b',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.85)',
  skeleton: '#1e293b',
  skeletonShine: '#334155',
  gradientPrimary: ['#4F46E5', '#020617'],
  gradientAccent: ['#F5A623', '#D97706'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientCard: ['#0f172a', '#020617'],
  gradientHero: ['#020617', '#1e1b4b'],
};

export const colors = lightColors; // Default to light

export const typography = {
  hero: { fontFamily: 'Poppins_700Bold', fontSize: 30, lineHeight: 38 },
  h1: { fontFamily: 'Poppins_700Bold', fontSize: 26, lineHeight: 34 },
  h2: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, lineHeight: 28 },
  h3: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, lineHeight: 25 },
  h4: { fontFamily: 'Poppins_500Medium', fontSize: 15, lineHeight: 22 },
  body1: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 23 },
  body2: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20 },
  body2Med: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 20 },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 16 },
  button: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, letterSpacing: 0.2 },
  buttonSm: { fontFamily: 'Poppins_500Medium', fontSize: 12, letterSpacing: 0.2 },
  amount: { fontFamily: 'Poppins_700Bold', fontSize: 28, lineHeight: 36 },
  amountSm: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, lineHeight: 26 },
  mono: { fontFamily: 'DMSans_400Regular', fontSize: 13, letterSpacing: 0.5 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 16,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  card: 20,
  full: 999,
};

export const shadows = {
  none: {},
  xs: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    android: { elevation: 3 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  }),
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
    android: { elevation: 5 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
    android: { elevation: 10 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.3, shadowRadius: 32 },
    android: { elevation: 18 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.3, shadowRadius: 32 },
  }),
  colored: (color) => Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 20 },
    android: { elevation: 12 },
    default: { shadowColor: color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 20 },
  }),
};

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  cardWidth: SCREEN_WIDTH - spacing.screen * 2,
  carouselCard: SCREEN_WIDTH * 0.72,
  tabBarHeight: 64,
  headerHeight: 60,
};

export const duration = {
  fast: 140,
  base: 220,
  slow: 360,
};

export const COLORS = {
  navy: colors.primaryDark,
  navyLight: colors.primary,
  navyDark: '#0C2A4A',
  blue: colors.primary,
  blueLight: colors.primaryMid,
  bluePale: colors.primaryLight,
  accent: colors.accent,
  accentDark: '#D4620F',
  red: colors.error,
  redPale: colors.errorLight,
  green: colors.success,
  greenLight: colors.success,
  greenPale: colors.successLight,
  orange: colors.warning,
  orangePale: colors.warningLight,
  surface: colors.background,
  surfaceAlt: colors.surfaceAlt,
  white: colors.surface,
  border: colors.border,
  borderLight: colors.divider,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  shimmer1: colors.skeleton,
  shimmer2: colors.skeletonShine,
};

export const FONTS = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'Poppins_700Bold',
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
};

export const SPACING = spacing;

export const RADIUS = radius;

export const SHADOW = {
  none: shadows.none,
  light: shadows.sm,
  card: shadows.md,
  strong: shadows.lg,
};

export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  duration,
};
