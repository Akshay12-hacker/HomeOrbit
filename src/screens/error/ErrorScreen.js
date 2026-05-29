import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp 
} from 'react-native-reanimated';

import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export default function ErrorScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Custom message and title from route params
  const title = route?.params?.title || 'Oops! Something Went Wrong';
  const message = route?.params?.message || "The page you're looking for doesn't exist or an unexpected error occurred.";
  const showHome = route?.params?.showHome !== false;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={isDark ? ['#020617', '#1e1b4b'] : ['#4F46E5', '#1e1b4b']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + verticalScale(40) }]}>
        <Animated.View 
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.illustrationWrap}
        >
          <View style={styles.circleBig}>
            <View style={styles.circleMid}>
              <View style={styles.circleSmall}>
                <Text style={styles.errorIcon}>🚀</Text>
              </View>
            </View>
          </View>
          <View style={styles.glitchContainer}>
             <Text style={styles.errorCode}>404</Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.textWrap}
        >
          <Text style={[styles.title, { color: '#fff' }]}>{title}</Text>
          <Text style={[styles.message, { color: 'rgba(255,255,255,0.7)' }]}>
            {message}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.footer}
        >
          <Button
            title="Try Again"
            variant="primary"
            onPress={handleGoBack}
            style={styles.button}
          />
          
          {showHome && (
            <Button
              title="Return to Dashboard"
              variant="outline"
              onPress={() => navigation.navigate('MainTabs')}
              style={[styles.button, { marginTop: verticalScale(12) }]}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  circleBig: {
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleMid: {
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSmall: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  errorIcon: {
    fontSize: moderateScale(48),
  },
  glitchContainer: {
    position: 'absolute',
    bottom: -verticalScale(10),
    backgroundColor: '#EF4444',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(4),
    borderRadius: scale(8),
    transform: [{ rotate: '-4deg' }],
  },
  errorCode: {
    color: '#fff',
    fontSize: moderateScale(20),
    fontWeight: '900',
    letterSpacing: 2,
  },
  textWrap: {
    alignItems: 'center',
    marginBottom: verticalScale(48),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: verticalScale(16),
    letterSpacing: -0.5,
  },
  message: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(24),
    fontWeight: '500',
  },
  footer: {
    width: '100%',
  },
  button: {
    height: verticalScale(60),
    borderRadius: scale(20),
  },
});
