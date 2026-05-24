import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { shadows, spacing, radius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LogoutModal({ visible, onClose, onConfirm }) {
  const { colors, isDark } = useTheme();
  
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView 
          intensity={isDark ? 30 : 50} 
          tint={isDark ? 'dark' : 'light'} 
          style={StyleSheet.absoluteFill}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose} 
            style={{ flex: 1 }} 
          />
        </BlurView>

        <Animated.View style={[styles.card, modalStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
             <Text style={{ fontSize: 32 }}>👋</Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>See you soon!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Are you sure you want to log out of your HomeOrbit account?
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Stay Logged In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.confirmBtn, { backgroundColor: colors.error }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>Yes, Logout</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  confirmBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
