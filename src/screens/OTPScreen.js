import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, StatusBar, Keyboard, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { Button } from '../components/ui';
import { verifyOTP, sendOTP } from '../services';
import { useCountdown, useResponsive } from '../hooks';

const OTP_LENGTH = 6;

export default function OTPScreen({ route, navigation }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef([]);
  const scrollRef = useRef(null);
  const { count, expired, reset } = useCountdown(30);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { gutter, cardMaxWidth, isXs, isPhone } = useResponsive();

  useEffect(() => {
    const blockBackNavigation = (event) => {
      const actionType = event.data.action.type;
      if (actionType === 'GO_BACK' || actionType === 'POP' || actionType === 'POP_TO_TOP') {
        event.preventDefault();
      }
    };
    const navigationSub = navigation.addListener('beforeRemove', blockBackNavigation);
    const hardwareSub = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      navigationSub();
      hardwareSub.remove();
    };
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const focusTimer = setTimeout(() => inputRefs.current[0]?.focus(), 500);
    const showSub = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { clearTimeout(focusTimer); showSub.remove(); hideSub.remove(); };
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[idx] = digit; setOtp(next); setError('');
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (digit && idx === OTP_LENGTH - 1) handleVerify(next);
  };

  const handleKeyPress = ({ nativeEvent }, idx) => {
    if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async (otpArr) => {
    const code = (otpArr || otp).join('');
    if (code.length < OTP_LENGTH) { setError('Enter all 6 digits'); return; }
    Keyboard.dismiss(); setLoading(true); setError('');
    try {
      const res = await verifyOTP(phone, code);
      // Pass role to Society screen
      navigation.navigate('Society', { role: res.role });
    } catch (e) {
      setError(e.message || 'Incorrect OTP. Please try again.');
      shake(); setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); reset(); setOtp(Array(OTP_LENGTH).fill(''));
    await sendOTP(phone).catch(() => {});
    setResending(false); inputRefs.current[0]?.focus();
  };

  const maskedPhone = `+91 ${phone.slice(0, 2)}XXXXX${phone.slice(-3)}`;

  return (
    <LinearGradient colors={[COLORS.navyDark, COLORS.navy, COLORS.navyLight]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom + 40, paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <Animated.View style={[styles.content, cardMaxWidth && { maxWidth: cardMaxWidth + 80, width: '100%', alignSelf: 'center' }, !isPhone && styles.contentWide, { opacity: fadeIn }]}>
            <View style={[styles.header, keyboardVisible && styles.headerCompact]}>
              {!keyboardVisible && <View style={styles.iconWrap}><Text style={{ fontSize: 32 }}>📱</Text></View>}
              <Text style={[styles.title, keyboardVisible && styles.titleSmall]}>Verify OTP</Text>
              <Text style={styles.subtitle}>Sent to <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{maskedPhone}</Text></Text>
            </View>
            <Animated.View style={[styles.otpRow, !isPhone && styles.otpRowWide, isXs && styles.otpRowXs, { transform: [{ translateX: shakeAnim }] }]}>
              {otp.map((digit, idx) => (
                <TextInput key={idx} ref={(r) => (inputRefs.current[idx] = r)}
                  style={[styles.otpBox, !isPhone && styles.otpBoxWide, isXs && styles.otpBoxXs, digit ? styles.otpBoxFilled : null, error ? styles.otpBoxError : null]}
                  value={digit} onChangeText={(v) => handleChange(v, idx)} onKeyPress={(e) => handleKeyPress(e, idx)}
                  keyboardType="number-pad" maxLength={1} selectTextOnFocus textContentType="oneTimeCode" autoComplete="sms-otp" caretHidden />
              ))}
            </Animated.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.hintText}>{expired ? 'OTP expired — please resend' : 'Auto-verifying when all 6 digits entered'}</Text>}
            <View style={styles.buttonWrap}><Button title={loading ? 'Verifying…' : 'Verify OTP'} onPress={() => handleVerify()} loading={loading} disabled={otp.join('').length < OTP_LENGTH} /></View>
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive it? </Text>
              {expired ? (
                <TouchableOpacity onPress={handleResend} disabled={resending} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend OTP'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimer}>Resend in <Text style={{ fontWeight: '800', color: COLORS.accent }}>{count}s</Text></Text>
              )}
            </View>
            <View style={styles.progressRow}>
              {otp.map((d, i) => <View key={i} style={[styles.dot, d ? styles.dotFilled : null]} />)}
            </View>
            <Text style={styles.demoHint}>Demo: any 6 digits · 000000 = invalid · 9999999999 = admin</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', alignSelf: 'center' },
  contentWide: { maxWidth: 560 },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  headerCompact: { marginBottom: SPACING.md, flexDirection: 'row', gap: 10, justifyContent: 'center' },
  iconWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  titleSmall: { fontSize: FONTS.sizes.lg, marginBottom: 0 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  otpRowWide: { gap: 14 },
  otpRowXs: { gap: 8 },
  otpBox: { width: 48, height: 58, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', paddingVertical: 0, includeFontPadding: false, textAlignVertical: 'center' },
  otpBoxWide: { width: 56, height: 64 },
  otpBoxXs: { width: 42, height: 52, fontSize: 22 },
  otpBoxFilled: { borderColor: COLORS.accent, backgroundColor: 'rgba(245,166,35,0.18)' },
  otpBoxError: { borderColor: '#FF5252', backgroundColor: 'rgba(255,82,82,0.12)' },
  errorText: { textAlign: 'center', color: '#FF8A80', fontSize: 13, fontWeight: '600', marginVertical: SPACING.xs },
  hintText: { textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12, marginVertical: SPACING.xs },
  buttonWrap: { marginTop: SPACING.base },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg },
  resendLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  resendLink: { fontSize: 14, color: COLORS.accent, fontWeight: '700' },
  resendTimer: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: SPACING.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotFilled: { backgroundColor: COLORS.accent, width: 20 },
  demoHint: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: SPACING.lg },
});
