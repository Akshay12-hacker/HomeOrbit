import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  interpolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const loaderWidth = useSharedValue(0);

  useEffect(() => {
    // Logo pop animation
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });
    
    // Ripple effect
    rippleScale.value = withRepeat(
      withTiming(2, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    rippleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );

    // Text content animation
    contentTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));

    // Loader line animation
    loaderWidth.value = withDelay(800, withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
    opacity: contentOpacity.value,
  }));

  const loaderAnimatedStyle = useAnimatedStyle(() => ({
    width: `${loaderWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e1b4b']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centerContent}>
        {/* LOGO SECTION */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.ripple, rippleAnimatedStyle]} />
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.logoGradient}
            >
              <Text style={styles.logoLetter}>H</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* TEXT SECTION */}
        <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
          <Text style={styles.brandName}>HomeOrbit</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PREMIUM SOCIETY MANAGEMENT</Text>
          </View>
        </Animated.View>
      </View>

      {/* FOOTER LOADER */}
      <View style={styles.footer}>
        <View style={styles.loaderBackground}>
          <Animated.View style={[styles.loaderFill, loaderAnimatedStyle]} />
        </View>
        <Text style={styles.loadingText}>Initializing secure environment...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  textContent: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  badge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  loaderBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loaderFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
});
