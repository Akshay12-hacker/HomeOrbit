import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeContext';
import { radius, shadows, spacing } from '../../theme';
import { Button } from '../ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PaymentSuccessModal({ visible, onClose, amount, txnId }) {
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
          <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
            <Text style={styles.successIcon}>✅</Text>
          </View>
          
          <Text style={[styles.title, { color: colors.textPrimary }]}>Payment Successful!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your payment of <Text style={{ fontWeight: '800', color: colors.primary }}>₹{amount}</Text> has been received.
          </Text>

          <View style={[styles.detailsBox, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.detailRow}>
               <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Transaction ID</Text>
               <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{txnId || 'TXN123456789'}</Text>
            </View>
            <View style={[styles.detailRow, { marginTop: 12 }]}>
               <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Status</Text>
               <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.statusText, { color: colors.success }]}>COMPLETED</Text>
               </View>
            </View>
          </View>

          <Button
            title="Download Receipt"
            variant="outline"
            onPress={() => {}}
            style={styles.actionButton}
          />
          
          <Button
            title="Done"
            variant="primary"
            onPress={onClose}
            style={[styles.actionButton, { marginTop: 12 }]}
          />
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
    padding: scale(30),
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  successIcon: {
    fontSize: moderateScale(40),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '900',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(15),
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(24),
    paddingHorizontal: scale(20),
  },
  detailsBox: {
    width: '100%',
    padding: scale(16),
    borderRadius: radius.lg,
    marginBottom: verticalScale(24),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  detailValue: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: radius.xs,
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '900',
  },
  actionButton: {
    width: '100%',
    height: verticalScale(56),
    borderRadius: radius.md,
  },
});
