import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  BackHandler,
  Dimensions,
} from 'react-native';
import RNOtpVerify from 'react-native-otp-verify';
import { Button } from '../../components/ui';
import { verifyOTP, sendOTP } from '../../services';
import { setGlobalTokens, setGlobalIds, setGlobalProfile, setGlobalProfiles } from '../../services/apiClient';
import { useCountdown } from '../../hooks';
import AnimatedLogo from '../../components/splash/AnimatedLogo';
import Cityscape from '../../components/splash/Cityscape';
import BottomWave from '../../components/splash/BottomWave';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function OTPScreen({ route, navigation }) {
  const { phone } = route.params;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);
  const { count, expired, reset } = useCountdown(30);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const focusTimer = setTimeout(() => inputRefs.current[0]?.focus(), 500);

    startListeningForOTP();

    const hardwareSub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      clearTimeout(focusTimer);
      hardwareSub.remove();

      RNOtpVerify.removeListener();
    };
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[idx] = digit; setOtp(next); setError('');
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (next.join('').length === OTP_LENGTH) handleVerify(next.join(''));
  };

  const handleKeyPress = ({ nativeEvent }, idx) => {
    if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const startListeningForOTP = async () => {
  try {
    await RNOtpVerify.getOtp();

    RNOtpVerify.addListener(message => {

      const otpMatch = message.match(/\d{6}/);

      if (!otpMatch) return;

      const code = otpMatch[0];

      // Fill boxes
      setOtp(code.split(''));

      // Verify automatically
      handleVerify(code);

      RNOtpVerify.removeListener();
    });

  } catch (e) {
    console.log(e);
  }
};

  const handleVerify = async (codeStr) => {
    const code = codeStr || otp.join('');
    if (code.length < OTP_LENGTH) { setError('Please enter 6 digits'); return; }

    setLoading(true); setError('');
    try {
      const res = await verifyOTP(phone, code);
      if (res.accessToken) setGlobalTokens(res.accessToken, res.refreshToken);
      const profiles = (res.ownerProfiles || []).map(p => ({ ...p, phone: p.phone ?? p.ownerPhone ?? phone }));
      if (profiles.length > 0) setGlobalProfiles(profiles);
      const def = profiles.find(p => p.isDefaultSociety) || profiles[0];
      if (def) { setGlobalIds(def.societyId, def.ownerId); setGlobalProfile(def); }

      // verifyOTP updates authStore, so RootNavigator automatically switches
      // from the Auth stack to the App stack. AppStackNavigator then resolves
      // the SuperAdmin path from the persisted user role.
      return;
    } catch (e) {
      setError(e.message || 'Incorrect code');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); reset(); setOtp(Array(OTP_LENGTH).fill(''));
    await sendOTP(phone).catch(() => {});
    setResending(false);
    inputRefs.current[0]?.focus();
  };

  const maskedPhone = `+91 ${phone.slice(0, 2)}XXXXX${phone.slice(-3)}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.circle, styles.circleOne]} />
      <View style={[styles.circle, styles.circleTwo]} />
      <View style={[styles.circle, styles.circleThree]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeIn }]}>
            <View style={styles.logoSection}>
              <AnimatedLogo />
            </View>

            <View style={styles.headingSection}>
              <Text style={styles.title}>Verification</Text>
              <Text style={styles.subtitle}>We've sent a 6-digit code to</Text>
              <Text style={styles.phoneText}>{maskedPhone}</Text>
            </View>

            <View style={styles.card}>
              <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={r => (inputRefs.current[idx] = r)}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null, error ? styles.otpBoxError : null]}
                    value={digit}
                    onChangeText={v => handleChange(v, idx)}
                    onKeyPress={e => handleKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                  />
                ))}
              </Animated.View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={loading ? 'Verifying...' : 'Continue'}
                onPress={() => handleVerify()}
                loading={loading}
                disabled={otp.join('').length < OTP_LENGTH}
                style={styles.continueButton}
              />

              <TouchableOpacity disabled={!expired || resending} onPress={handleResend} style={styles.resendBtn}>
                <Text style={[styles.resendText, !expired && !resending ? styles.resendTextDisabled : null]}>
                  {resending ? 'Sending...' : !expired ? `Resend in ${count}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
  onPress={() => navigation.replace('Login')}
  style={styles.backBtn}
>
  <Text style={styles.backText}>Change Mobile Number</Text>
</TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.spacer} />
          <View style={styles.illustrationFlowContainer}>
            <View style={styles.cityscapeWrapper}><Cityscape /></View>
            <View style={styles.waveWrapper}><BottomWave /></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  circle: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(37,117,252,0.06)', borderRadius: 999 },
  circleOne: { width: SCREEN_WIDTH * 1.05, height: SCREEN_WIDTH * 1.05, top: -SCREEN_WIDTH * 0.35, alignSelf: 'center' },
  circleTwo: { width: SCREEN_WIDTH * 0.82, height: SCREEN_WIDTH * 0.82, top: -SCREEN_WIDTH * 0.24, alignSelf: 'center' },
  circleThree: { width: SCREEN_WIDTH * 0.6, height: SCREEN_WIDTH * 0.6, top: -SCREEN_WIDTH * 0.12, alignSelf: 'center' },
  scroll: { flexGrow: 1, paddingTop: 30 },
  content: { width: '100%', alignItems: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginTop: 15, marginBottom: 10 },
  headingSection: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#12213E', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#62708A' },
  phoneText: { fontSize: 14, color: '#2575FC', fontWeight: '700', marginTop: 4 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  otpBox: { width: (SCREEN_WIDTH - 88) / 6, height: 54, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', color: '#1E293B', textAlign: 'center', fontSize: 22, fontWeight: '700' },
  otpBoxFilled: { borderColor: '#2575FC', borderWidth: 2 },
  otpBoxError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', textAlign: 'center', fontSize: 12, fontWeight: '500', marginBottom: 14 },
  continueButton: { width: '100%', height: 54, borderRadius: 12 },
  resendBtn: { alignSelf: 'center', padding: 12, marginTop: 8 },
  resendText: { color: '#2575FC', fontSize: 14, fontWeight: '700' },
  resendTextDisabled: { color: '#94A3B8' },
  backBtn: { alignSelf: 'center', padding: 10 },
  backText: { color: '#62708A', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  spacer: { flex: 1, minHeight: 30 },
  illustrationFlowContainer: { width: '100%', position: 'relative', marginTop: 40, height: SCREEN_WIDTH * 0.55 },
  cityscapeWrapper: { position: 'absolute', bottom: '35%', left: 0, right: 0, zIndex: 1 },
  waveWrapper: { position: 'absolute', bottom: '10%', left: 0, right: 0, zIndex: 2 },
});
