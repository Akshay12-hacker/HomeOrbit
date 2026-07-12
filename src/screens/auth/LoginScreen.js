import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { shadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui';
import { sendOTP, verifyOTP } from '../../services';
import { setGlobalTokens, setGlobalIds, setGlobalProfile, setGlobalProfiles } from '../../services/apiClient';
import { useCountdown } from '../../hooks';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OTP_LENGTH = 6;

// --- OTP BOTTOM SHEET ---
const OTPSheet = ({ visible, phone, onClose, onVerify, loading, error, countdown, resendLoading, onResend }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      const timer = setTimeout(() => inputRefs.current[0]?.focus(), 500);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (next.join('').length === OTP_LENGTH) onVerify(next.join(''));
  };

  const handleKeyPress = ({ nativeEvent }, idx) => {
    if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Animated.View style={[styles.sheetBackdrop, { backgroundColor: colors.overlay }, backdropStyle]}>
          <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
        </Animated.View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
          style={{ width: '100%' }}
        >
          <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.divider }]} />
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Verification</Text>
            <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>Enter the code sent to +91 {phone}</Text>

            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={r => (inputRefs.current[idx] = r)}
                  style={[
                    styles.otpBox, 
                    { borderColor: colors.border, backgroundColor: colors.surfaceAlt, color: colors.textPrimary },
                    digit ? { borderColor: colors.primary, borderWidth: 2 } : null,
                    error ? { borderColor: colors.error } : null
                  ]}
                  value={digit}
                  onChangeText={v => handleChange(v, idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                />
              ))}
            </View>

            {error ? <Text style={[styles.sheetError, { color: colors.error }]}>{error}</Text> : null}

            <View style={styles.sheetActions}>
              <TouchableOpacity disabled={countdown > 0 || resendLoading} onPress={onResend} style={styles.resendBtn}>
                <Text style={[styles.resendText, { color: countdown > 0 ? colors.textMuted : colors.primary }]}>
                  {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>

              <Button title={loading ? 'Verifying...' : 'Continue'} onPress={() => onVerify(otp.join(''))} loading={loading} style={{ height: 56 }} />
            </View>
            <View style={{ height: Math.max(insets.bottom, 24) }} />
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// --- LOGIN SCREEN ---
export default function LoginScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showOTP, setShowOTP] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const { count, reset } = useCountdown(30);

  // Layout Animations
  const keyboardHeight = useSharedValue(0);
  const logoScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, { duration: 250 });
      logoScale.value = withSpring(0.65);
      headerOpacity.value = withTiming(0.5, { duration: 200 });
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      keyboardHeight.value = withTiming(0, { duration: 250 });
      logoScale.value = withSpring(1);
      headerOpacity.value = withTiming(1, { duration: 200 });
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value }, 
      { translateY: interpolate(keyboardHeight.value, [0, 300], [0, -35], Extrapolate.CLAMP) }
    ],
    opacity: headerOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(keyboardHeight.value, [0, 300], [0, -90], Extrapolate.CLAMP) }
    ],
  }));

  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError('Please enter a 10-digit number'); return; }
    setLoading(true); setError('');
    try {
      await sendOTP(phone);
      setShowOTP(true);
    } catch (e) {
      setError(e.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code) => {
    setOtpLoading(true); setOtpError('');
    try {
      const res = await verifyOTP(phone, code);
      if (res.accessToken) setGlobalTokens(res.accessToken, res.refreshToken);
      const profiles = (res.ownerProfiles || []).map(p => ({ ...p, phone: p.phone ?? p.ownerPhone ?? phone }));
      if (profiles.length > 0) {
        setGlobalProfiles(profiles);
        const def = profiles.find(p => p.isDefaultSociety) || profiles[0];
        if (def) { setGlobalIds(def.societyId, def.ownerId); setGlobalProfile(def); }
      }
      setShowOTP(false);
      const roles = res.user?.roles || res.roles || [];
      setTimeout(() => {
        if (roles.includes('SuperAdmin')) {
          navigation.getParent()?.replace('App', { initialPath: '/super-admin' });
          return;
        }

        navigation.navigate('Society', { role: roles.includes('Admin') ? 'admin' : 'user' });
      }, 400);
    } catch (e) {
      setOtpError(e.message || 'Invalid code');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={isDark ? ['#020617', '#0f172a', '#1e1b4b'] : ['#1e1b4b', '#4F46E5']} style={StyleSheet.absoluteFill} />

      {/* Decorative Circles */}
      <View style={[styles.decorCircle, { top: -50, right: -50, backgroundColor: 'rgba(99,102,241,0.2)' }]} />
      <View style={[styles.decorCircle, { bottom: -100, left: -50, width: 300, height: 300, backgroundColor: 'rgba(79,70,229,0.1)' }]} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
      >
        <ScrollView 
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40 }]} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={[styles.logoBox, shadows.lg]}>
               <Text style={{ fontSize: 44 }}>🏠</Text>
            </View>
            <Text style={styles.brandName}>HomeOrbit</Text>
            <Text style={styles.tagline}>Excellence in Society Living</Text>
          </Animated.View>

          <Animated.View style={[styles.loginCard, cardAnimatedStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>MOBILE NUMBER</Text>
              <View style={[styles.phoneInputRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={[styles.countryCode, { borderRightColor: colors.divider }]}>
                  <Text style={[styles.countryText, { color: colors.textPrimary }]}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { color: colors.textPrimary }]}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={t => { setPhone(t.replace(/\D/g, '')); setError(''); }}
                />
                {phone.length === 10 && <Text style={styles.checkIcon}>✅</Text>}
              </View>
            </View>

            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

            <Button 
              title={loading ? 'Requesting...' : 'Continue'} 
              onPress={handleSendOTP}
              loading={loading}
              style={{ height: 60, borderRadius: 20, marginTop: 10 }}
            />

            <View style={styles.footerInfo}>
               <Text style={[styles.secureText, { color: colors.textMuted }]}>🔒 Secured by 256-bit AES Encryption</Text>
               <Text style={[styles.terms, { color: colors.textMuted }]}>
                 By logging in, you agree to our {'\n'}
                 <Text style={{ color: colors.primary, fontWeight: '800' }}>Terms</Text> & <Text style={{ color: colors.primary, fontWeight: '800' }}>Privacy Policy</Text>
               </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OTPSheet 
        visible={showOTP} phone={phone} loading={otpLoading} error={otpError}
        countdown={count} resendLoading={resendLoading}
        onClose={() => setShowOTP(false)} onVerify={handleVerify} onResend={() => { reset(); sendOTP(phone); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scroll: { paddingHorizontal: 24, paddingBottom: 120, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  logoBox: { width: 100, height: 100, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  brandName: { fontSize: 38, fontWeight: '900', color: '#fff', marginTop: 20, letterSpacing: -1.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 6, fontWeight: '600', letterSpacing: 0.5 },
  loginCard: { width: '100%', borderRadius: 36, padding: 28, borderWidth: 1, ...shadows.lg },
  cardTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  cardSub: { fontSize: 14, lineHeight: 22, marginTop: 10, marginBottom: 32 },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  phoneInputRow: { flexDirection: 'row', alignItems: 'center', height: 64, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  countryCode: { paddingHorizontal: 18, height: '100%', justifyContent: 'center', borderRightWidth: 1 },
  countryText: { fontSize: 16, fontWeight: '800' },
  phoneInput: { flex: 1, height: '100%', paddingHorizontal: 16, fontSize: 20, fontWeight: '700', letterSpacing: 1.5 },
  checkIcon: { marginRight: 15, fontSize: 18 },
  errorText: { fontSize: 13, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  footerInfo: { marginTop: 32, alignItems: 'center' },
  secureText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginBottom: 12 },
  terms: { fontSize: 11, textAlign: 'center', lineHeight: 18 },
  decorCircle: { position: 'absolute', borderRadius: 150, width: 250, height: 250 },
  // SHEET STYLES
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, ...shadows.lg },
  sheetHandle: { width: 45, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 32 },
  sheetTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  sheetSub: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22, marginBottom: 36 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpBox: { width: (SCREEN_WIDTH - 64 - 50) / 6, height: 68, borderRadius: 16, borderWidth: 1.5, textAlign: 'center', fontSize: 26, fontWeight: '900' },
  sheetError: { textAlign: 'center', fontSize: 14, fontWeight: '800', marginBottom: 20 },
  sheetActions: { gap: 12 },
  resendBtn: { padding: 12, alignSelf: 'center' },
  resendText: { fontSize: 14, fontWeight: '800' }
});
