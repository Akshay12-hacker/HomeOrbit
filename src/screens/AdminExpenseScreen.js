import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Skeleton, ErrorRetry, SectionHeader } from '../components/ui';
import { getSocietyFund, addExpense } from '../services/api';
import { useAsync } from '../hooks';

const FundSkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <Skeleton width={200} height={16} style={{ marginBottom: 16 }} />
    <View style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 18, marginBottom: 16, ...SHADOW.card }}>
      <Skeleton width={100} height={12} style={{ marginBottom: 8 }} />
      <Skeleton width={160} height={32} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={8} borderRadius={4} />
    </View>
    {Array(3).fill(null).map((_, i) => <View key={i} style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, ...SHADOW.card }}><Skeleton width="80%" height={13} style={{ marginBottom: 6 }} /><Skeleton width="50%" height={11} /></View>)}
  </View>
);

const ExpenseItem = ({ item, isLast }) => (
  <View style={[styles.expItem, !isLast && styles.expItemBorder]}>
    <View style={styles.expIcon}><Text style={{ fontSize: 18 }}>📋</Text></View>
    <View style={{ flex: 1 }}>
      <Text style={styles.expRemark}>{item.remark}</Text>
      <Text style={styles.expDate}>{item.date}</Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={styles.expAmount}>-₹{item.amount.toLocaleString('en-IN')}</Text>
      {item.billUrl
        ? <Text style={styles.billLink}>📎 Bill</Text>
        : <Text style={styles.noBill}>No bill</Text>}
    </View>
  </View>
);

export default function AdminExpenseScreen({ navigation }) {
  const { data: fund, loading, error, refresh } = useAsync(getSocietyFund, []);
  const insets = useSafeAreaInsets();

  // Form state
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [billPhoto, setBillPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const successAnim = useRef(new Animated.Value(0)).current;

  const requestCameraPermission = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to capture bill photos.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Gallery permission is required to select bill photos.');
      return false;
    }
    return true;
  };

  const pickFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setBillPhoto(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setBillPhoto(result.assets[0]);
    }
  };

  const openBillPicker = () => {
    Alert.alert(
      'Attach Bill',
      'Choose an option',
      [
        { text: 'Camera', onPress: pickFromCamera },
        { text: 'Gallery', onPress: pickFromGallery },
        ...(billPhoto ? [{ text: 'Remove Photo', style: 'destructive', onPress: () => setBillPhoto(null) }] : []),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setFormError('Enter a valid amount'); return; }
    if (!remark.trim()) { setFormError('Remark is required'); return; }
    if (!date.trim()) { setFormError('Date is required'); return; }
    setFormError(''); setSubmitting(true);
    try {
      await addExpense({ amount: Number(amount), remark: remark.trim(), date: date.trim(), billPhoto });
      setAmount(''); setRemark(''); setBillPhoto(null);
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      await refresh();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add expense.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FundSkeleton />;
  if (error) return <ErrorRetry message={error} onRetry={refresh} />;

  const pct = Math.round((fund.totalBalance / fund.collected) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Success Toast */}
      <Animated.View style={[styles.successToast, { opacity: successAnim, transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, insets.top + 16] }) }] }]}>
        <Text style={{ fontSize: 16 }}>✅</Text>
        <Text style={styles.successToastText}>Expense added successfully</Text>
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Fund Summary */}
          <View style={styles.fundSummary}>
            <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.fundGrad}>
              <View style={styles.fundTop}>
                <View>
                  <Text style={styles.fundLabel}>SOCIETY FUND BALANCE</Text>
                  <Text style={styles.fundBalance}>₹{fund.totalBalance.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.fundIconWrap}><Text style={{ fontSize: 28 }}>🏦</Text></View>
              </View>
              <View style={styles.fundBarBg}>
                <View style={[styles.fundBarFill, { width: `${pct}%` }]} />
              </View>
              <View style={styles.fundRow}>
                <View><Text style={styles.fundStatL}>Collected</Text><Text style={styles.fundStatV}>₹{fund.collected.toLocaleString('en-IN')}</Text></View>
                <View><Text style={styles.fundStatL}>Spent</Text><Text style={[styles.fundStatV, { color: '#FF8A80' }]}>₹{fund.spent.toLocaleString('en-IN')}</Text></View>
                <View><Text style={styles.fundStatL}>Balance %</Text><Text style={[styles.fundStatV, { color: COLORS.accent }]}>{pct}%</Text></View>
              </View>
            </LinearGradient>
          </View>

          {/* Add Expense Form */}
          <SectionHeader title="Add Expense" />
          <Card style={{ marginBottom: SPACING.base }}>
            {/* Amount */}
            <Text style={styles.fieldLabel}>Amount (₹) *</Text>
            <View style={[styles.inputWrap, formError && !amount && styles.inputError]}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput style={styles.input} value={amount} onChangeText={(t) => { setAmount(t.replace(/[^0-9]/g, '')); setFormError(''); }} placeholder="0" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" returnKeyType="next" />
            </View>

            {/* Remark */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Remark *</Text>
            <TextInput style={[styles.inputPlain, formError && !remark && styles.inputError]} value={remark} onChangeText={(t) => { setRemark(t); setFormError(''); }} placeholder="e.g. Street Light Repair, Security Salary…" placeholderTextColor={COLORS.textMuted} returnKeyType="next" maxLength={100} />
            <Text style={styles.charCount}>{remark.length}/100</Text>

            {/* Expense Date */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Expense Date *</Text>
            <TextInput style={styles.inputPlain} value={date} onChangeText={setDate} placeholder="e.g. 14 Apr 2026" placeholderTextColor={COLORS.textMuted} returnKeyType="done" />

            {/* Bill Photo */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Bill Photo (optional)</Text>
            <TouchableOpacity style={styles.billUpload} onPress={openBillPicker} activeOpacity={0.75}>
              {billPhoto ? (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Image source={{ uri: billPhoto.uri }} style={styles.billPreview} />
                  <Text style={{ fontSize: 12, color: COLORS.green, fontWeight: '700' }}>Bill attached ✓</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 32 }}>📷</Text>
                  <Text style={styles.billUploadText}>Tap to attach bill photo</Text>
                  <Text style={styles.billUploadSub}>JPG, PNG up to 5MB</Text>
                </View>
              )}
            </TouchableOpacity>

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.65 }]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.blue, COLORS.navyLight]} style={styles.submitBtnGrad}>
                <Text style={styles.submitBtnText}>{submitting ? 'Saving…' : '+ Add Expense'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>

          {/* Expense History */}
          <SectionHeader title="Expense History" />
          <Card noPad style={{ overflow: 'hidden' }}>
            {fund.expenses.map((e, i) => (
              <ExpenseItem key={e.id} item={e} isLast={i === fund.expenses.length - 1} />
            ))}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  successToast: { position: 'absolute', left: SPACING.lg, right: SPACING.lg, zIndex: 99, backgroundColor: COLORS.green, borderRadius: RADIUS.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, ...SHADOW.strong },
  successToastText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  fundSummary: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.base, ...SHADOW.strong },
  fundGrad: { padding: SPACING.lg },
  fundTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  fundLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  fundBalance: { fontSize: 30, fontWeight: '900', color: '#fff' },
  fundIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  fundBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, marginBottom: SPACING.sm },
  fundBarFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 },
  fundRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fundStatL: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  fundStatV: { fontSize: 14, fontWeight: '800', color: '#fff', marginTop: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, overflow: 'hidden' },
  inputPrefix: { paddingHorizontal: 14, fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, borderRightWidth: 1, borderRightColor: COLORS.border, paddingVertical: 13 },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 17, color: COLORS.textPrimary, fontWeight: '700' },
  inputPlain: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary },
  inputError: { borderColor: COLORS.red },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: 3 },
  billUpload: { borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: RADIUS.md, padding: 24, alignItems: 'center', backgroundColor: COLORS.surface, marginTop: 4 },
  billPreview: { width: 90, height: 90, borderRadius: 12, marginBottom: 2 },
  billUploadText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  billUploadSub: { fontSize: 11, color: COLORS.textMuted },
  formError: { fontSize: 13, color: COLORS.red, marginTop: SPACING.xs, fontWeight: '600' },
  submitBtn: { marginTop: SPACING.base, borderRadius: RADIUS.md, overflow: 'hidden' },
  submitBtnGrad: { paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  expItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACING.base },
  expItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  expIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.orangePale, alignItems: 'center', justifyContent: 'center' },
  expRemark: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  expDate: { fontSize: 12, color: COLORS.textMuted },
  expAmount: { fontSize: 15, fontWeight: '800', color: COLORS.red },
  billLink: { fontSize: 11, color: COLORS.blue, fontWeight: '600', marginTop: 2 },
  noBill: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
});
