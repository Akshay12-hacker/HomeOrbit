import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
  StatusBar, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Button } from '../components/ui';
import { sendOTP } from '../services/api';
import { useResponsive } from '../hooks';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { gutter, cardMaxWidth, isPhone } = useResponsive();
  const isWeb = Platform.OS === 'web';
  const DismissWrapper = isWeb ? View : TouchableWithoutFeedback;
  const dismissWrapperProps = isWeb ? {} : { onPress: Keyboard.dismiss };

  React.useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    if (isWeb) return undefined;

    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, [fadeIn, isWeb]);

  const handlePhoneChange = (value) => {
    setPhone((value || '').replace(/\D/g, '').slice(0, 10));
    setError('');
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = async () => {
    const sanitizedPhone = phone.replace(/\D/g, '');

    if (!sanitizedPhone) {
      setError('Enter your mobile number');
      shake();
      return;
    }

    if (sanitizedPhone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      shake();
      return;
    }
    Keyboard.dismiss();
    setError('');
    setLoading(true);
    try {
      await sendOTP(sanitizedPhone);
      navigation.navigate('OTP', { phone: sanitizedPhone });
    } catch (e) {
      setError(e.message || 'Failed to send OTP. Try again.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.navyDark, COLORS.navy, COLORS.navyLight]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* 
        KEY FIX:
        - behavior="padding" on BOTH iOS and Android
        - keyboardVerticalOffset accounts for status bar
        - ScrollView with bounces={false} ensures smooth scroll-up
        - contentContainerStyle uses paddingBottom so button is never hidden
      */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={isWeb ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <DismissWrapper {...dismissWrapperProps}>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              {
                paddingTop: insets.top + SPACING.lg,
                paddingBottom: insets.bottom + SPACING.xl,
                paddingHorizontal: gutter,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Logo — shrinks when keyboard is open */}
            <Animated.View style={[styles.heroSection, { opacity: fadeIn }, !isWeb && keyboardVisible && styles.heroCompact]}>
              <View style={[styles.logoWrap, !isWeb && keyboardVisible && styles.logoSmall]}>
                <Text style={{ fontSize: !isWeb && keyboardVisible ? 26 : 36 }}>🏠</Text>
              </View>
              {(!isWeb || !keyboardVisible) && (
                <>
                  <Text style={styles.appName}>Home Orbit</Text>
                  <Text style={styles.tagline}>Society Management Portal</Text>
                </>
              )}
              {!isWeb && keyboardVisible && (
                <Text style={styles.appNameSmall}>Home Orbit</Text>
              )}
            </Animated.View>

            {/* Card */}
            <Animated.View
              style={[
                styles.card,
                cardMaxWidth && styles.cardWide,
                cardMaxWidth && { width: '100%', maxWidth: cardMaxWidth, alignSelf: 'center' },
                { opacity: fadeIn, transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.heading}>Welcome back 👋</Text>
              <Text style={[styles.sub, !isPhone && styles.subWide]}>Enter your registered mobile number to continue</Text>

              {/* Phone Input */}
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputRow, error && styles.inputError]}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="98765 43210"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType={Platform.OS === 'web' ? 'numeric' : 'phone-pad'}
                  inputMode={Platform.OS === 'web' ? 'tel' : 'numeric'}
                  autoComplete="tel"
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="telephoneNumber"
                  blurOnSubmit={false}
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
                {phone.length === 10 && (
                  <Text style={{ fontSize: 18, marginRight: 12 }}>✅</Text>
                )}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Send OTP"
                onPress={handleSend}
                loading={loading}
                style={{ marginTop: SPACING.sm }}
              />

              <View style={styles.secureRow}>
                <Text style={styles.secureText}>🔒 Secured by 256-bit encryption</Text>
              </View>
              <Text style={styles.terms}>
                By continuing you agree to our{' '}
                <Text style={{ color: COLORS.blue }}>Terms</Text> &{' '}
                <Text style={{ color: COLORS.blue }}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </DismissWrapper>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroCompact: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoSmall: {
    width: 44, height: 44, borderRadius: 12,
    marginBottom: 0,
  },
  appName: {
    fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5,
  },
  appNameSmall: {
    fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3,
  },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOW.strong,
  },
  cardWide: {
    alignSelf: 'center',
  },
  heading: {
    fontSize: FONTS.sizes.xl, fontWeight: '800',
    color: COLORS.textPrimary, marginBottom: 4,
  },
  sub: {
    fontSize: FONTS.sizes.sm, color: COLORS.textSecondary,
    marginBottom: SPACING.lg, lineHeight: 20,
  },
  subWide: {
    maxWidth: 360,
  },
  label: {
    fontSize: FONTS.sizes.sm, fontWeight: '700',
    color: COLORS.textSecondary, marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm, overflow: 'hidden',
  },
  inputError: { borderColor: COLORS.red },
  countryCode: {
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: COLORS.surfaceAlt,
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  countryText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  input: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 17, color: COLORS.textPrimary, letterSpacing: 0.5,
  },
  errorText: {
    fontSize: FONTS.sizes.sm, color: COLORS.red,
    marginBottom: SPACING.xs, marginLeft: 2,
  },
  secureRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  secureText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  terms: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted,
    textAlign: 'center', marginTop: SPACING.xs, lineHeight: 18,
  },
});
