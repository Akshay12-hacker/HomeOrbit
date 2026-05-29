import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeContext';
import { radius, shadows, spacing } from '../../theme';
import { Button } from '../ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SubscriptionModal({ visible, onClose, plan, onUpgrade }) {
  const { colors, isDark } = useTheme();
  const translateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const features = plan?.features || [
    'Digital Maintenance Receipts',
    'Society Fund Transparency',
    'Emergency SOS Alerts',
    'Admin Dashboard Access',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <Animated.View style={[
          styles.modalContainer, 
          { backgroundColor: colors.surface, transform: [{ translateY }] }
        ]}>
          <View style={styles.header}>
             <View style={[styles.planBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.planBadgeText, { color: colors.primary }]}>{plan?.name || 'PREMIUM'} PLAN</Text>
             </View>
             <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={{ fontSize: 20, color: colors.textMuted }}>✕</Text>
             </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Upgrade Your Society</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
             Unlock professional management tools and transparency for all residents.
          </Text>

          <View style={[styles.priceContainer, { backgroundColor: colors.surfaceAlt }]}>
             <Text style={[styles.price, { color: colors.textPrimary }]}>₹{plan?.price || '999'}</Text>
             <Text style={[styles.priceSub, { color: colors.textMuted }]}>/ year per society</Text>
          </View>

          <View style={styles.featuresList}>
             {features.map((f, i) => (
               <View key={i} style={styles.featureItem}>
                  <Text style={styles.checkIcon}>✨</Text>
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>{f}</Text>
               </View>
             ))}
          </View>

          <Button
            title="Upgrade Now"
            variant="primary"
            onPress={() => onUpgrade?.()}
            style={styles.upgradeBtn}
          />
          
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
             Cancel anytime. Terms and conditions apply.
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    padding: scale(24),
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  planBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.full,
  },
  planBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '900',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    padding: scale(20),
    borderRadius: radius.lg,
    marginBottom: verticalScale(24),
    gap: scale(8),
  },
  price: {
    fontSize: moderateScale(32),
    fontWeight: '900',
  },
  priceSub: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  featuresList: {
    marginBottom: verticalScale(32),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    gap: scale(12),
  },
  checkIcon: {
    fontSize: moderateScale(16),
  },
  featureText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  upgradeBtn: {
    height: verticalScale(60),
    borderRadius: radius.md,
    marginBottom: verticalScale(16),
  },
  footerText: {
    fontSize: moderateScale(11),
    textAlign: 'center',
    fontWeight: '500',
  },
});
