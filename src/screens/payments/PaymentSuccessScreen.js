import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { shadows as themeShadows, spacing, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PaymentSuccessScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const { amount, receipt, payment } = route.params || {};

  // Minimal, sophisticated animations
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const checkProgress = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 500 });
    checkProgress.value = withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkProgress.value }],
    opacity: checkProgress.value,
  }));

  // Fix Navigation calls for nested screens
  const goHome = () => navigation.navigate('MainTabs', { screen: 'Home' });
  const goHistory = () => navigation.navigate('MainTabs', { screen: 'History' });
  const viewReceipt = () => navigation.navigate('Receipt', { receipt, payment });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#020617', '#0f172a'] : ['#F8F7F2', '#E2E8F0']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.card, cardStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Animated.View style={[styles.successCircle, checkStyle, { backgroundColor: colors.successLight }]}>
             <Text style={[styles.checkMark, { color: colors.success }]}>✓</Text>
          </Animated.View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Payment Successful</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transaction confirmed and verified.
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Amount Paid</Text>
            <Text style={[styles.amount, { color: colors.textPrimary }]}>{formatCurrency(amount || 0)}</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.success }]}>Verified</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={viewReceipt}
          >
            <Text style={styles.primaryBtnText}>Download Receipt</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.actionLink}
              onPress={goHistory}
            >
              <Text style={[styles.actionLinkText, { color: colors.textSecondary }]}>View History</Text>
            </TouchableOpacity>

            <View style={[styles.vertDivider, { backgroundColor: colors.divider }]} />

            <TouchableOpacity 
              style={styles.actionLink}
              onPress={goHome}
            >
              <Text style={[styles.actionLinkText, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <Text style={[styles.brandText, { color: colors.textMuted }]}>HomeOrbit Secure Payments</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    ...themeShadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 32,
    fontWeight: '900',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  details: {
    alignItems: 'center',
    marginBottom: 40,
  },
  detailRow: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amount: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.08)',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
  },
  primaryBtn: {
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...themeShadows.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 20,
  },
  actionLink: {
    paddingVertical: 8,
  },
  actionLinkText: {
    fontSize: 15,
    fontWeight: '700',
  },
  vertDivider: {
    width: 1,
    height: 16,
  },
  brandText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  }
});
