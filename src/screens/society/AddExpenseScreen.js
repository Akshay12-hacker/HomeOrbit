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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { spacing, radius, shadows } from '../../theme';
import { Card, Button, Skeleton } from '../../components/ui';
import { createExpense, updateExpense, uploadImage } from '../../services';

const PAYMENT_MODES = [
  { label: 'Cash', value: 1, icon: '💵' },
  { label: 'UPI', value: 2, icon: '📱' },
  { label: 'Bank Transfer', value: 3, icon: '🏦' },
  { label: 'Cheque', value: 4, icon: '📝' },
];

export default function AddExpenseScreen({ navigation, route }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Check if we are in edit mode
  const editData = route.params?.expense;
  const isEdit = !!editData;

  // Form state
  const [amount, setAmount] = useState(isEdit ? String(editData.amount) : '');
  const [remark, setRemark] = useState(isEdit ? editData.remark : '');
  const [date, setDate] = useState(isEdit ? editData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState(isEdit ? (editData.mode || 1) : 1);
  const [billPhoto, setBillPhoto] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(isEdit ? editData.imageUrl : null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleImageAction = () => {
    navigation.navigate('ReceiptUpload', {
      initialImage: billPhoto || (existingImageUrl && existingImageUrl !== 'abc.png' ? { uri: existingImageUrl } : null),
      onSelect: (image) => {
        setBillPhoto(image);
        setExistingImageUrl(null);
      },
    });
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }
    if (!remark.trim()) {
      setFormError('Please enter a remark');
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      let finalImageUrl = existingImageUrl || 'abc.png';

      // Upload image if a NEW one was selected
      if (billPhoto) {
        try {
          finalImageUrl = await uploadImage(billPhoto);
        } catch (uploadErr) {
          console.error('Image upload failed, falling back to local/default', uploadErr);
        }
      }

      const payload = {
        paymentAmount: Number(amount),
        paymentDate: date,
        remark: remark.trim(),
        paymentMode: paymentMode,
        imageUrl: finalImageUrl,
      };

      if (isEdit) {
        await updateExpense({
          ...payload,
          expenseId: editData.id,
          societyId: editData.societyId, // Pass if available, or service will resolve
        });
      } else {
        await createExpense(payload);
      }

      // Show success state
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        navigation.goBack();
      });

    } catch (error) {
      Alert.alert('Submission Failed', error.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* SUCCESS TOAST */}
      <Animated.View style={[
        styles.successToast, 
        { 
          opacity: successAnim,
          backgroundColor: colors.success,
          transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, insets.top + 10] }) }]
        }
      ]}>
        <Text style={styles.successText}>✨ Expense {isEdit ? 'Updated' : 'Logged'} Successfully!</Text>
      </Animated.View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{isEdit ? 'Update' : 'Record'} Expense</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isEdit ? 'Modify the expenditure details below.' : 'Enter society expenditure details for transparency.'}
            </Text>
          </View>

          <Card style={styles.card}>
            {/* AMOUNT */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount (₹)</Text>
              <View style={[styles.amountInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.textPrimary }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* REMARK */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description / Remark</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border,
                  color: colors.textPrimary 
                }]}
                placeholder="What was this expense for?"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={remark}
                onChangeText={setRemark}
              />
            </View>

            {/* DATE */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Date of Payment</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border,
                  color: colors.textPrimary 
                }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={date}
                onChangeText={setDate}
              />
            </View>

            {/* PAYMENT MODE */}
            {!isEdit && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Mode</Text>
                <View style={styles.modeGrid}>
                  {PAYMENT_MODES.map((mode) => (
                    <TouchableOpacity
                      key={mode.value}
                      onPress={() => setPaymentMode(mode.value)}
                      style={[
                        styles.modeItem,
                        { borderColor: colors.border },
                        paymentMode === mode.value && { 
                          backgroundColor: colors.primary + '15',
                          borderColor: colors.primary,
                          borderWidth: 2
                        }
                      ]}
                    >
                      <Text style={styles.modeIcon}>{mode.icon}</Text>
                      <Text style={[
                        styles.modeLabel,
                        { color: colors.textPrimary },
                        paymentMode === mode.value && { color: colors.primary, fontWeight: '800' }
                      ]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* RECEIPT UPLOAD */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Receipt / Invoice (Optional)</Text>
              <TouchableOpacity 
                onPress={handleImageAction}
                style={[
                  styles.uploadBox, 
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  (billPhoto || (existingImageUrl && existingImageUrl !== 'abc.png')) && { borderStyle: 'solid' }
                ]}
              >
                {billPhoto ? (
                  <View style={{ width: '100%', height: '100%' }}>
                    <Image source={{ uri: billPhoto.uri }} style={styles.preview} />
                    <View style={styles.changeOverlay}>
                       <Text style={styles.changeText}>Change</Text>
                    </View>
                  </View>
                ) : existingImageUrl && existingImageUrl !== 'abc.png' ? (
                  <View style={{ width: '100%', height: '100%' }}>
                    <Image source={{ uri: existingImageUrl }} style={styles.preview} />
                    <View style={styles.changeOverlay}>
                       <Text style={styles.changeText}>Change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={[styles.uploadText, { color: colors.textMuted }]}>Tap to upload proof</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <Button
              title={submitting ? (isEdit ? "Updating..." : "Logging...") : (isEdit ? "Update Expense" : "Save Expense")}
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitBtn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(8),
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    height: verticalScale(60),
    paddingHorizontal: scale(15),
  },
  currencySymbol: {
    fontSize: moderateScale(22),
    fontWeight: '900',
    color: '#666',
    marginRight: scale(10),
  },
  amountInput: {
    flex: 1,
    fontSize: moderateScale(24),
    fontWeight: '900',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: scale(15),
    fontSize: moderateScale(16),
    minHeight: verticalScale(50),
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  modeItem: {
    width: '48%',
    height: verticalScale(60),
    borderWidth: 1.5,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    gap: scale(10),
  },
  modeIcon: {
    fontSize: moderateScale(20),
  },
  modeLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  uploadBox: {
    height: verticalScale(120),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadIcon: {
    fontSize: moderateScale(30),
    marginBottom: verticalScale(8),
  },
  uploadText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  submitBtn: {
    marginTop: verticalScale(10),
    height: verticalScale(56),
  },
  errorText: {
    color: '#EF4444',
    fontSize: moderateScale(13),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: verticalScale(15),
  },
  successToast: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadows.strong,
  },
  successText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: moderateScale(14),
  },
});
