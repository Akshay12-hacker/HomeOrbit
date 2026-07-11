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
  Animated, 
  StatusBar, 
  Keyboard, 
  BackHandler,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadows, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/ui';
import { verifyOTP, sendOTP } from '../../services';
import { setGlobalTokens, setGlobalIds, setGlobalProfile, setGlobalProfiles } from '../../services/apiClient';
import { useCountdown, useResponsive } from '../../hooks';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function OTPScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const { phone } = route.params;
  const insets = useSafeAreaInsets();
  
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
    
    const hardwareSub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      clearTimeout(focusTimer);
      hardwareSub.remove();
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

  const handleVerify = async (codeStr) => {
    const code = codeStr || otp.join('');
    if (code.length < OTP_LENGTH) { setError('Please enter 6 digits'); return; }
    
    setLoading(true); setError('');
    try {
      const res = await verifyOTP(phone, code);
      const roles = res.user?.roles || [];
      if (res.accessToken) setGlobalTokens(res.accessToken, res.refreshToken);
      const profiles = (res.ownerProfiles || []).map(p => ({ ...p, phone: p.phone ?? p.ownerPhone ?? phone }));
      if (profiles.length > 0) setGlobalProfiles(profiles);
      const def = profiles.find(p => p.isDefaultSociety) || profiles[0];
      if (def) { setGlobalIds(def.societyId, def.ownerId); setGlobalProfile(def); }
      
      if (roles.includes('SuperAdmin')) {
        navigation.getParent()?.replace('App', { initialPath: '/super-admin' });
        return;
      }

      navigation.navigate('Society', { role: roles.includes('Admin') ? 'admin' : 'user' });
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={isDark ? ['#020617', '#0f172a', '#1e1b4b'] : ['#1e1b4b', '#4F46E5']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeIn }]}>
            
            <View style={styles.header}>
               <View style={[styles.iconBox, shadows.lg]}>
                  <Text style={{ fontSize: 36 }}>🔐</Text>
               </View>
               <Text style={styles.title}>Verification</Text>
               <Text style={styles.subtitle}>We've sent a 6-digit code to</Text>
               <Text style={[styles.phoneText, { color: colors.primary }]}>{maskedPhone}</Text>
            </View>

            <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
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
            </Animated.View>

            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

            <View style={styles.footer}>
              <TouchableOpacity disabled={!expired || resending} onPress={handleResend} style={styles.resendBtn}>
                <Text style={[styles.resendText, { color: !expired ? colors.textMuted : colors.primary }]}>
                  {resending ? 'Sending...' : !expired ? `Resend in ${count}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>

              <Button 
                title={loading ? 'Verifying...' : 'Continue'} 
                onPress={() => handleVerify()}
                loading={loading}
                disabled={otp.join('').length < OTP_LENGTH}
                style={{ width: '100%', height: 60, borderRadius: 20 }}
              />
              
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                 <Text style={[styles.backText, { color: colors.textSecondary }]}>Change Mobile Number</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scroll: { paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  iconBox: { width: 88, height: 88, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.65)', marginTop: 8, fontWeight: '600' },
  phoneText: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 32 },
  otpBox: { width: (SCREEN_WIDTH - 48 - 60) / 6, height: 64, borderRadius: 16, borderWidth: 1.5, textAlign: 'center', fontSize: 26, fontWeight: '900' },
  errorText: { textAlign: 'center', fontSize: 13, fontWeight: '800', marginBottom: 24 },
  footer: { width: '100%', alignItems: 'center' },
  resendBtn: { padding: 12, marginBottom: 20 },
  resendText: { fontSize: 14, fontWeight: '800' },
  backBtn: { marginTop: 24, padding: 10 },
  backText: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }
});
