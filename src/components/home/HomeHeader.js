import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import {
  spacing,
  shadows,
  radius,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// 1. STICKY TOP BAR
export function HomeTopBar({ onMenuPress, onNotificationPress, onProfilePress, userName }) {
  const { colors, isDark } = useTheme();
  const initial = userName?.charAt(0)?.toUpperCase() || 'H';

  const styles = StyleSheet.create({
    topBarWrapper: {
      position: 'absolute',
      top: verticalScale(12),
      left: 0,
      right: 0,
      paddingHorizontal: spacing.lg,
      paddingTop: Platform.OS === 'ios' ? verticalScale(60) : verticalScale(24),
      zIndex: 1000,
      backgroundColor: 'transparent',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(10),
      borderRadius: scale(50),
      backgroundColor: Platform.OS === 'android' ? (isDark ? 'rgba(30,34,51,0.95)' : 'rgba(255,255,255,0.9)') : (isDark ? 'rgba(30,34,51,0.7)' : 'rgba(255,255,255,0.7)'),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
      ...shadows.sm,
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuBtn: {
      marginRight: scale(14),
    },
    menuIcon: {
      fontSize: moderateScale(24),
      color: colors.primary,
    },
    brand: {
      fontSize: moderateScale(18),
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notifBtn: {
      marginRight: scale(12),
      position: 'relative',
    },
    notifIcon: {
      fontSize: moderateScale(20),
      color: colors.textPrimary,
    },
    notifDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: scale(8),
      height: scale(8),
      backgroundColor: colors.accent,
      borderRadius: scale(4),
      borderWidth: 2,
      borderColor: isDark ? colors.surface : '#fff',
    },
    avatar: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    avatarText: {
      color: '#fff',
      fontSize: moderateScale(12),
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.topBarWrapper}>
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={isDark ? 'dark' : 'light'} style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>HomeOrbit</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={onNotificationPress} style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onProfilePress} style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

// 2. SCROLLABLE HERO SECTION
export function HomeHero({ userName, societyName, plotName }) {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    heroContainer: {
      zIndex: 10,
    },
    hero: {
      paddingTop: Platform.OS === 'ios' ? verticalScale(130) : verticalScale(100), // Offset for sticky top bar
      paddingHorizontal: spacing.lg,
      paddingBottom: verticalScale(48),
      borderBottomLeftRadius: radius.xxl,
      borderBottomRightRadius: radius.xxl,
      ...shadows.md,
    },
    heroContent: {
      marginBottom: verticalScale(24),
    },
    greeting: {
      fontSize: moderateScale(16),
      color: '#fff',
      opacity: 0.8,
      marginBottom: verticalScale(4),
    },
    userName: {
      fontSize: moderateScale(24),
      fontWeight: '800',
      color: '#fff',
    },
    societyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: scale(12),
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    societyIconBox: {
      width: scale(40),
      height: scale(40),
      borderRadius: radius.sm,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: scale(12),
    },
    societyIcon: {
      fontSize: moderateScale(20),
    },
    societyName: {
      fontSize: moderateScale(14),
      fontWeight: '700',
      color: '#fff',
    },
    plotName: {
      fontSize: moderateScale(12),
      color: '#fff',
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={colors.gradientHero}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.greeting}>{getGreeting()}, 👋</Text>
          <Text style={styles.userName}>{userName || 'Resident'}</Text>
        </View>

        <View style={styles.societyCard}>
          <View style={styles.societyIconBox}>
            <Text style={styles.societyIcon}>🏠</Text>
          </View>
          <View>
            <Text style={styles.societyName}>{societyName || 'HomeOrbit Society'}</Text>
            <Text style={styles.plotName}>Plot {plotName || '...'}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Keep default export for compatibility if needed, but components should be used individually
export default function HomeHeader(props) {
  return (
    <>
      <HomeTopBar {...props} />
      <HomeHero {...props} />
    </>
  );
}
