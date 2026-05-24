import React, { useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  Animated, 
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Skeleton, ErrorRetry } from '../../components/ui';
import { getSocietyFund, addExpense } from '../../services';
import { useAsync, useResponsive, useAuth } from '../../hooks';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// UTILIZATION ITEM COMPONENT
const UtilizationItem = ({ item, isLast, colors, isDark }) => (
  <View style={[styles.expItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
    <View style={[styles.expIcon, { backgroundColor: isDark ? 'rgba(245,166,35,0.1)' : 'rgba(245,166,35,0.05)' }]}>
      <Text style={{ fontSize: 18 }}>📊</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.expRemark, { color: colors.textPrimary }]}>{item.remark}</Text>
      <Text style={[styles.expDate, { color: colors.textMuted }]}>{item.date}</Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={[styles.expAmount, { color: colors.error }]}>-₹{item.amount.toLocaleString('en-IN')}</Text>
      {item.billUrl ? (
         <Text style={[styles.billAttached, { color: colors.primary }]}>📎 Receipt</Text>
      ) : (
         <Text style={{ fontSize: 10, color: colors.textMuted }}>No bill</Text>
      )}
    </View>
  </View>
);

export default function SocietyFundScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { selectedProfile } = useAuth();
  const isAdmin = selectedProfile?.role === 'admin';
  
  const { data: fund, loading, error, refresh } = useAsync(getSocietyFund, []);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state for Admins
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [billPhoto, setBillPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const formHeightAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const toggleForm = () => {
    const toValue = showAddForm ? 0 : 1;
    Animated.spring(formHeightAnim, {
      toValue,
      useNativeDriver: false,
      friction: 10,
      tension: 60
    }).start();
    setShowAddForm(!showAddForm);
  };

  const openBillPicker = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Denied', 'Camera access is required to take photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.[0]) {
      setBillPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    if (!remark.trim()) {
      Alert.alert('Error', 'Please enter a remark.');
      return;
    }

    setSubmitting(true);
    try {
      await addExpense({
        amount: Number(amount),
        remark: remark.trim(),
        date: new Date().toISOString(),
        billPhoto
      });
      
      setAmount('');
      setRemark('');
      setBillPhoto(null);
      toggleForm();
      await refresh();
      Alert.alert('Success', 'Fund utilization recorded successfully.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.background }}><Skeleton width="100%" height={240} /></View>;
  if (error) return <ErrorRetry message={error} onRetry={refresh} />;

  const pct = fund?.collected > 0 ? Math.round((fund.totalBalance / fund.collected) * 100) : 0;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* HEADER */}
        <LinearGradient
          colors={colors.gradientHero}
          style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 64 : 48 }]}
        >
           <Text style={styles.headerTitle}>Society Fund</Text>
           <Text style={styles.headerSub}>Real-time utilization and reserve</Text>

           <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)' }]}>
              <View style={styles.summaryTop}>
                 <View>
                    <Text style={styles.summaryLabel}>AVAILABLE RESERVE</Text>
                    <Text style={styles.summaryBalance}>{formatCurrency(fund?.totalBalance || 0)}</Text>
                 </View>
                 <View style={[styles.healthBadge, { backgroundColor: pct > 50 ? 'rgba(16,185,129,0.2)' : 'rgba(245,166,35,0.2)' }]}>
                    <Text style={[styles.healthText, { color: pct > 50 ? '#10B981' : '#F5A623' }]}>
                       {pct}% Robust
                    </Text>
                 </View>
              </View>

              <View style={styles.progressContainer}>
                 <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                 </View>
              </View>

              <View style={styles.statsGrid}>
                 <View>
                    <Text style={styles.statL}>Collected</Text>
                    <Text style={styles.statV}>{formatCurrency(fund?.collected || 0)}</Text>
                 </View>
                 <View style={styles.statDiv} />
                 <View>
                    <Text style={styles.statL}>Total Spent</Text>
                    <Text style={[styles.statV, { color: '#FF8A80' }]}>{formatCurrency(fund?.spent || 0)}</Text>
                 </View>
              </View>
           </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing.lg }}>
          {/* ADMIN ACTION SECTION */}
          {isAdmin && (
            <View style={styles.adminSection}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.addTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={toggleForm}
              >
                <View style={[styles.addIcon, { backgroundColor: colors.primary }]}>
                   <Text style={{ color: '#fff', fontSize: 20 }}>{showAddForm ? '✕' : '+'}</Text>
                </View>
                <Text style={[styles.addText, { color: colors.textPrimary }]}>
                  {showAddForm ? 'Cancel Entry' : 'Record Utilization'}
                </Text>
              </TouchableOpacity>

              <Animated.View style={{ 
                height: formHeightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 480] }),
                opacity: formHeightAnim,
                overflow: 'hidden'
              }}>
                <Card style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                   <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Amount (₹)</Text>
                   <TextInput 
                     style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]} 
                     placeholder="0" 
                     placeholderTextColor={colors.textMuted}
                     keyboardType="numeric"
                     value={amount}
                     onChangeText={setAmount}
                   />

                   <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>Purpose / Remark</Text>
                   <TextInput 
                     style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, height: 80, textAlignVertical: 'top' }]} 
                     placeholder="e.g. Garden maintenance, pipe repair..." 
                     placeholderTextColor={colors.textMuted}
                     multiline
                     value={remark}
                     onChangeText={setRemark}
                   />

                   <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>Evidence (Optional)</Text>
                   <TouchableOpacity 
                     onPress={openBillPicker}
                     style={[styles.photoPicker, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                   >
                     {billPhoto ? (
                       <Image source={{ uri: billPhoto.uri }} style={styles.photoPreview} />
                     ) : (
                       <View style={{ alignItems: 'center' }}>
                         <Text style={{ fontSize: 24 }}>📷</Text>
                         <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Snap Receipt</Text>
                       </View>
                     )}
                   </TouchableOpacity>

                   <TouchableOpacity 
                     style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                     onPress={handleSubmit}
                     disabled={submitting}
                   >
                      <Text style={styles.submitBtnText}>{submitting ? 'RECORDING...' : 'SAVE RECORD'}</Text>
                   </TouchableOpacity>
                </Card>
              </Animated.View>
            </View>
          )}

          {/* HISTORY SECTION */}
          <View style={styles.historyHeader}>
             <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Utilization History</Text>
          </View>

          {fund?.expenses?.length > 0 ? (
             <Card noPad style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {fund.expenses.map((item, index) => (
                  <UtilizationItem 
                    key={item.id} 
                    item={item} 
                    isLast={index === fund.expenses.length - 1} 
                    colors={colors}
                    isDark={isDark}
                  />
                ))}
             </Card>
          ) : (
             <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>🍃</Text>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No utilization yet</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>The society fund utilization records will appear here.</Text>
             </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.md,
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '600' },
  summaryCard: { marginTop: 32, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  summaryBalance: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 4 },
  healthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  healthText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  progressContainer: { marginTop: 24, marginBottom: 24 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  statsGrid: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  statL: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase' },
  statV: { fontSize: 16, color: '#fff', fontWeight: '800', marginTop: 2 },
  statDiv: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  adminSection: { marginTop: 24, marginBottom: 8 },
  addTrigger: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, ...shadows.sm },
  addIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  addText: { fontSize: 15, fontWeight: '800' },
  formCard: { marginTop: 12, padding: 20, borderWidth: 1, borderStyle: 'solid' },
  fieldLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: '600' },
  photoPicker: { height: 100, width: 100, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  submitBtn: { marginTop: 24, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  historyHeader: { marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  historyCard: { overflow: 'hidden', borderRadius: 24, borderWidth: 1, ...shadows.sm },
  expItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  expIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  expRemark: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  expDate: { fontSize: 11, fontWeight: '600' },
  expAmount: { fontSize: 16, fontWeight: '900' },
  billAttached: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 64, borderRadius: 24, borderWidth: 1, ...shadows.sm },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptySub: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});
