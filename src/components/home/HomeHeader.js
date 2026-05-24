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
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// 1. STICKY TOP BAR
export function HomeTopBar({ onMenuPress, onNotificationPress, userName }) {
  const { colors, isDark } = useTheme();
  const initial = userName?.charAt(0)?.toUpperCase() || 'H';

  const styles = StyleSheet.create({
    topBarWrapper: {
      position: 'absolute',
      top: 12,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 60 : 24,
      zIndex: 1000,
      backgroundColor: 'transparent',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 50,
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
      marginRight: 14,
    },
    menuIcon: {
      fontSize: 24,
      color: colors.primary,
    },
    brand: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notifBtn: {
      marginRight: 12,
      position: 'relative',
    },
    notifIcon: {
      fontSize: 20,
      color: colors.textPrimary,
    },
    notifDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 8,
      height: 8,
      backgroundColor: colors.accent,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: isDark ? colors.surface : '#fff',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    avatarText: {
      color: '#fff',
      fontSize: 12,
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
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
      paddingTop: Platform.OS === 'ios' ? 130 : 100, // Offset for sticky top bar
      paddingHorizontal: spacing.lg,
      paddingBottom: 48,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      ...shadows.md,
    },
    heroContent: {
      marginBottom: 24,
    },
    greeting: {
      fontSize: 16,
      color: '#fff',
      opacity: 0.8,
      marginBottom: 4,
    },
    userName: {
      fontSize: 24,
      fontWeight: '800',
      color: '#fff',
    },
    societyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    societyIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    societyIcon: {
      fontSize: 20,
    },
    societyName: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
    plotName: {
      fontSize: 12,
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
