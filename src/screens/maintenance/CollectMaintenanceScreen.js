import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  Animated, 
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, { 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

import { shadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Button, Skeleton } from '../../components/ui';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'cheque', label: 'Cheque', icon: '📝' },
  { id: 'upi', label: 'Manual UPI', icon: '📲' },
];

export default function CollectMaintenanceScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [query, setQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [mode, setMode] = useState('cash');
  const [billPhoto, setBillPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Animation
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    if (selectedUnit) {
      formOpacity.value = withSpring(1);
    } else {
      formOpacity.value = withTiming(0);
    }
  }, [selectedUnit]);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: interpolate(formOpacity.value, [0, 1], [20, 0], Extrapolate.CLAMP) }]
  }));

  const handleSearch = () => {
    if (query.trim().length < 2) return;
    // Mock selection for now
    setSelectedUnit({
      id: 'mock-1',
      unitNo: query.toUpperCase(),
      ownerName: 'Resident Name',
      due: 2500
    });
    setAmount('2500');
    Keyboard.dismiss();
  };

  const openCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.[0]) {
      setBillPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Success', 'Offline payment recorded successfully.', [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={isDark ? ['#020617', '#0f172a'] : ['#F8F7F2', '#E2E8F0']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingTop: insets.top + 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
             <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Collect Payment</Text>
             <Text style={[styles.headerSub, { color: colors.textMuted }]}>Record maintenance collection (Offline)</Text>
          </View>

          {/* UNIT SEARCH */}
          <Card style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]} noPad>
             <View style={styles.searchRow}>
                <Text style={{ fontSize: 18, marginLeft: 16 }}>🔍</Text>
                <TextInput 
                  style={[styles.searchInput, { color: colors.textPrimary }]} 
                  placeholder="Enter Unit No (e.g. A-102)" 
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch} style={[styles.searchBtn, { backgroundColor: colors.primary }]}>
                   <Text style={styles.searchBtnText}>FIND</Text>
                </TouchableOpacity>
             </View>
          </Card>

          {/* UNIT DETAILS (SELECTED) */}
          {selectedUnit && (
            <Animated.View entering={FadeInUp}>
              <Card style={[styles.unitCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.05)', borderColor: colors.primary }]}>
                 <View style={styles.unitInfo}>
                    <View>
                       <Text style={[styles.unitNo, { color: colors.textPrimary }]}>{selectedUnit.unitNo}</Text>
                       <Text style={[styles.ownerName, { color: colors.textSecondary }]}>{selectedUnit.ownerName}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                       <Text style={[styles.dueLabel, { color: colors.textMuted }]}>PENDING DUE</Text>
                       <Text style={[styles.dueAmount, { color: colors.error }]}>{formatCurrency(selectedUnit.due)}</Text>
                    </View>
                 </View>
              </Card>
            </Animated.View>
          )}

          {/* PAYMENT FORM */}
          {selectedUnit && (
            <Reanimated.View style={[styles.formContainer, formAnimatedStyle]}>
               <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Details</Text>
               
               <View style={styles.modeRow}>
                  {PAYMENT_MODES.map(m => (
                    <TouchableOpacity 
                      key={m.id} 
                      onPress={() => setMode(m.id)}
                      style={[
                        styles.modeBtn, 
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        mode === m.id && { borderColor: colors.primary, borderWidth: 2, backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.05)' }
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                      <Text style={[styles.modeLabel, { color: mode === m.id ? colors.primary : colors.textMuted }]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
               </View>

               <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount Collected (₹)</Text>
               <TextInput 
                 style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]} 
                 keyboardType="numeric"
                 value={amount}
                 onChangeText={setAmount}
                 placeholder="0.00"
                 placeholderTextColor={colors.textMuted}
               />

               <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Internal Remarks</Text>
               <TextInput 
                 style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface, height: 80, textAlignVertical: 'top' }]} 
                 multiline
                 value={remark}
                 onChangeText={setRemark}
                 placeholder="e.g. Collected cash during evening visit"
                 placeholderTextColor={colors.textMuted}
               />

               <View style={styles.photoSection}>
                  <View style={{ flex: 1 }}>
                     <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Evidence / Receipt</Text>
                     <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Optional proof of collection</Text>
                  </View>
                  <TouchableOpacity onPress={openCamera} style={[styles.cameraBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                     {billPhoto ? (
                       <Image source={{ uri: billPhoto.uri }} style={styles.photoPreview} />
                     ) : (
                       <Text style={{ fontSize: 24 }}>📸</Text>
                     )}
                  </TouchableOpacity>
               </View>

               <TouchableOpacity 
                 onPress={handleSubmit} 
                 disabled={submitting}
                 activeOpacity={0.8}
                 style={[styles.submitBtn, { backgroundColor: colors.primary }]}
               >
                 {submitting ? (
                    <ActivityIndicator color="#fff" />
                 ) : (
                    <Text style={styles.submitText}>RECORD COLLECTION</Text>
                 )}
               </TouchableOpacity>
            </Reanimated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity 
        style={[styles.backBtn, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.goBack()}
      >
         <Text style={{ color: colors.primary, fontWeight: '800' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSub: { fontSize: 15, marginTop: 6, fontWeight: '600' },
  searchCard: { borderRadius: 20, overflow: 'hidden', ...shadows.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', height: 64 },
  searchInput: { flex: 1, paddingHorizontal: 16, fontSize: 16, fontWeight: '700' },
  searchBtn: { height: '100%', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  unitCard: { marginTop: 20, padding: 20, borderWidth: 2 },
  unitInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unitNo: { fontSize: 22, fontWeight: '900' },
  ownerName: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  dueLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  dueAmount: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  formContainer: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeBtn: { flex: 1, height: 80, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 8, ...shadows.sm },
  modeLabel: { fontSize: 11, fontWeight: '800' },
  inputLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 16, fontWeight: '600' },
  photoSection: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 40 },
  cameraBtn: { width: 80, height: 80, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  submitBtn: { height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  backBtn: { position: 'absolute', alignSelf: 'center', padding: 12 }
});
