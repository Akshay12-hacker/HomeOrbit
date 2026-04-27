import React from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../theme';

const SPLASH_DURATION = 1800;

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.92)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation, scaleAnim]);

  return (
    <LinearGradient
      colors={[COLORS.navyDark, COLORS.navy, COLORS.navyLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoPanel,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../../assets/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + SPACING.xl,
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.welcome}>Welcome to HomeOrbit</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoPanel: {
    width: 160,
    height: 160,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 32,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  welcome: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
});
