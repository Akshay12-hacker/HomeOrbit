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

export default function ErrorModal({ visible, onClose, title, message, onRetry }) {
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
          <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
            <Text style={styles.errorIcon}>❌</Text>
          </View>
          
          <Text style={[styles.title, { color: colors.error }]}>{title || 'Operation Failed'}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {message || 'Something went wrong while processing your request. Please try again later.'}
          </Text>

          <View style={styles.buttonRow}>
            {onRetry && (
              <Button
                title="Retry"
                variant="primary"
                onPress={() => {
                  onRetry();
                  onClose();
                }}
                style={styles.actionButton}
              />
            )}
            
            <Button
              title="Close"
              variant={onRetry ? "ghost" : "primary"}
              onPress={onClose}
              style={[styles.actionButton, onRetry && { marginTop: 12 }]}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: scale(20),
  },
  modalContainer: {
    padding: scale(30),
    borderRadius: radius.xxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconCircle: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  errorIcon: {
    fontSize: moderateScale(32),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '900',
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(15),
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(32),
    paddingHorizontal: scale(10),
  },
  buttonRow: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
    height: verticalScale(56),
    borderRadius: radius.md,
  },
});
