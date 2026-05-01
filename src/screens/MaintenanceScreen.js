import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Skeleton, ErrorRetry } from '../components/ui';
import { getMaintenanceDue, getUserPlots, createRazorpayOrder, verifyPayment } from '../services';
import { useAsync, useResponsive } from '../hooks';

const PLOT_TYPE_COLORS = { MU: COLORS.blue, EWS: COLORS.green, LIG: '#7B1FA2', A: COLORS.accent, B: '#00838F', C: COLORS.red };

// ─── Plot Dropdown ────────────────────────────────────────────────────────────
const PlotDropdown = ({ plots, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  if (!plots || plots.length === 0) return null;
  const current = plots.find(p => p.id === selected) || plots[0];
  const typeColor = PLOT_TYPE_COLORS[current.type] || COLORS.blue;

  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>Select Plot</Text>
      <TouchableOpacity style={dd.trigger} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <View style={dd.triggerLeft}>
          <View style={[dd.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[dd.typeText, { color: typeColor }]}>{current.type}</Text>
          </View>
          <View>
            <Text style={dd.plotNo}>Plot {current.plotNo}</Text>
            <Text style={dd.plotArea}>{current.area}</Text>
          </View>
        </View>
        <Text style={[dd.chevron, open && dd.chevronOpen]}>▼</Text>
      </TouchableOpacity>
      {open && (
        <View style={dd.dropdown}>
          {plots.map((p, i) => {
            const tc = PLOT_TYPE_COLORS[p.type] || COLORS.blue;
            const isSel = p.id === (selected || plots[0].id);
            return (
              <TouchableOpacity key={p.id} style={[dd.option, isSel && dd.optionSelected, i < plots.length - 1 && dd.optionBorder]}
                onPress={() => { onSelect(p.id); setOpen(false); }} activeOpacity={0.75}>
                <View style={[dd.typeBadge, { backgroundColor: tc + '20' }]}>
                  <Text style={[dd.typeText, { color: tc }]}>{p.type}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[dd.optionText, isSel && { color: COLORS.blue }]}>Plot {p.plotNo}</Text>
                  <Text style={dd.optionMeta}>{p.area}</Text>
                </View>
                {isSel && <Text style={{ color: COLORS.blue, fontSize: 16 }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const dd = StyleSheet.create({
  wrap: { marginBottom: SPACING.base },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOW.card },
  triggerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { fontSize: 13, fontWeight: '800' },
  plotNo: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  plotArea: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  chevron: { fontSize: 12, color: COLORS.textMuted, transform: [{ rotate: '0deg' }] },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 99, backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginTop: 4, ...SHADOW.strong, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionSelected: { backgroundColor: COLORS.bluePale },
  optionText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  optionMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
});

// ─── Razorpay Sheet ───────────────────────────────────────────────────────────
const RazorpaySheet = ({ visible, amount, months, selectedPlot, plots, onClose, onSuccess }) => {
  const [step, setStep] = useState('confirm');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [receipt, setReceipt] = useState(null);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const plot = plots?.find(p => p.id === selectedPlot) || plots?.[0];

  React.useEffect(() => {
    if (visible) {
      setStep('confirm'); setReceipt(null);
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 500, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handlePay = async () => {
    setStep('processing');
    try {
      const order = await createRazorpayOrder(amount, selectedPlot, months);
      await new Promise(r => setTimeout(r, 2000));
      const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 14)}`;
      const result = await verifyPayment(mockPaymentId, order.orderId, 'mock_sig', selectedPlot, months);
      setReceipt({ ...result.receipt, amount, plotNo: plot?.plotNo || '', plotType: plot?.type || '', months });
      setStep('success');
    } catch (e) {
      Alert.alert('Payment Failed', e.message || 'Please try again.'); setStep('confirm');
    }
  };

  const methods = [{ id: 'upi', icon: '📱', label: 'UPI' }, { id: 'card', icon: '💳', label: 'Card' }, { id: 'netbanking', icon: '🏦', label: 'Net Banking' }, { id: 'wallet', icon: '👛', label: 'Wallet' }];

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity style={rp.overlay} activeOpacity={1} onPress={step === 'confirm' ? onClose : undefined}>
        <Animated.View style={[rp.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={rp.handle} />
            {step === 'confirm' && (
              <>
                <View style={rp.header}>
                  <View style={rp.logo}><Text style={{ fontSize: 22 }}>💳</Text></View>
                  <View><Text style={rp.title}>Secure Checkout</Text><Text style={rp.sub}>Home Orbit · Maintenance</Text></View>
                </View>
                {plot && (
                  <View style={rp.plotInfo}>
                    <Text style={{ fontSize: 14 }}>🏠</Text>
                    <Text style={rp.plotInfoText}>Plot {plot.plotNo} ({plot.type}) · {months.length} month{months.length !== 1 ? 's' : ''}</Text>
                  </View>
                )}
                <View style={rp.summary}>
                  <View style={rp.summaryRow}><Text style={rp.summaryLabel}>Maintenance ({months.length} months)</Text><Text style={rp.summaryVal}>₹{amount.toLocaleString('en-IN')}</Text></View>
                  <View style={rp.summaryRow}><Text style={rp.summaryLabel}>Processing fee</Text><Text style={{ fontSize: 13, color: COLORS.green, fontWeight: '700' }}>FREE</Text></View>
                  <View style={[rp.summaryRow, rp.summaryTotal]}><Text style={{ fontWeight: '800', fontSize: 16, color: COLORS.textPrimary }}>Total</Text><Text style={{ fontWeight: '900', fontSize: 20, color: COLORS.blue }}>₹{amount.toLocaleString('en-IN')}</Text></View>
                </View>
                <Text style={rp.methodLabel}>Pay with</Text>
                <View style={rp.methodGrid}>
                  {methods.map(m => (
                    <TouchableOpacity key={m.id} onPress={() => setSelectedMethod(m.id)} style={[rp.methodBtn, selectedMethod === m.id && rp.methodBtnActive]}>
                      <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                      <Text style={[rp.methodText, selectedMethod === m.id && { color: COLORS.blue }]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={rp.payBtn} onPress={handlePay} activeOpacity={0.88}>
                  <LinearGradient colors={[COLORS.blue, COLORS.navyLight]} style={rp.payBtnGrad}>
                    <Text style={rp.payBtnText}>🔒 Pay ₹{amount.toLocaleString('en-IN')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', paddingVertical: 14 }}><Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Cancel</Text></TouchableOpacity>
              </>
            )}
            {step === 'processing' && (
              <View style={rp.processingView}>
                <ActivityIndicator size="large" color={COLORS.blue} />
                <Text style={rp.processingTitle}>Processing Payment</Text>
                <Text style={rp.processingSub}>Please wait. Do not close the app.</Text>
                <View style={rp.processingAmount}><Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.textPrimary }}>₹{amount.toLocaleString('en-IN')}</Text></View>
              </View>
            )}
            {step === 'success' && receipt && (
              <View style={rp.successView}>
                <View style={rp.successIcon}><Text style={{ fontSize: 44 }}>✅</Text></View>
                <Text style={rp.successTitle}>Payment Successful!</Text>
                <Text style={rp.successAmount}>₹{amount.toLocaleString('en-IN')}</Text>
                <View style={rp.receiptBox}>
                  <View style={rp.receiptRow}><Text style={rp.receiptKey}>Receipt No.</Text><Text style={rp.receiptVal}>{receipt.receiptId}</Text></View>
                  <View style={rp.receiptRow}><Text style={rp.receiptKey}>Txn ID</Text><Text style={rp.receiptVal}>{receipt.txnId}</Text></View>
                  <View style={rp.receiptRow}><Text style={rp.receiptKey}>Plot</Text><Text style={rp.receiptVal}>{receipt.plotNo} ({receipt.plotType})</Text></View>
                  <View style={rp.receiptRow}><Text style={rp.receiptKey}>Date</Text><Text style={rp.receiptVal}>{receipt.date}</Text></View>
                </View>
                <Text style={rp.successSub}>Receipt saved · View in Payment History</Text>
                <TouchableOpacity style={rp.doneBtn} onPress={() => onSuccess(receipt)} activeOpacity={0.88}>
                  <Text style={rp.doneBtnText}>View Receipt →</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const rp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderRadius: RADIUS.xl, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: SPACING.lg, paddingBottom: 40, ...SHADOW.strong },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: SPACING.sm },
  logo: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  plotInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bluePale, borderRadius: RADIUS.sm, padding: 10, marginBottom: SPACING.sm },
  plotInfoText: { fontSize: 13, fontWeight: '600', color: COLORS.blue },
  summary: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.base, marginBottom: SPACING.base },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryVal: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  summaryTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4, marginBottom: 0 },
  methodLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  methodGrid: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  methodBtn: { flex: 1, alignItems: 'center', gap: 4, padding: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  methodBtnActive: { borderColor: COLORS.blue, backgroundColor: COLORS.bluePale },
  methodText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  payBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 4 },
  payBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  payBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  processingView: { alignItems: 'center', paddingVertical: 32 },
  processingTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginTop: 16, marginBottom: 6 },
  processingSub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },
  processingAmount: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 16 },
  successView: { alignItems: 'center', paddingVertical: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.greenPale, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  successTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  successAmount: { fontSize: 28, fontWeight: '900', color: COLORS.blue, marginBottom: 14 },
  receiptBox: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, width: '100%', marginBottom: 12 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  receiptKey: { fontSize: 12, color: COLORS.textMuted },
  receiptVal: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  successSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: 20 },
  doneBtn: { backgroundColor: COLORS.blue, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <Skeleton width={200} height={14} style={{ marginBottom: 16 }} />
    <View style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14, marginBottom: 8, ...SHADOW.card }}>
      <Skeleton width={120} height={13} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={48} borderRadius={10} />
    </View>
    <Card noPad style={{ marginTop: 8 }}>
      {Array(5).fill(null).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: COLORS.borderLight }}>
          <Skeleton width={22} height={22} borderRadius={6} />
          <Skeleton width={80} height={14} />
          <View style={{ flex: 1 }} /><Skeleton width={60} height={14} />
        </View>
      ))}
    </Card>
  </View>
);

export default function MaintenanceScreen({ navigation }) {
  const { data: rows, loading: rowsLoading, error: rowsError, refresh: refreshRows } = useAsync(getMaintenanceDue, []);
  const { data: plots, loading: plotsLoading } = useAsync(getUserPlots, []);
  const { contentMaxWidth, gutter } = useResponsive();
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showPayment, setShowPayment] = useState(false);
  const totalBarAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (plots && plots.length > 0 && !selectedPlot) setSelectedPlot(plots[0].id);
  }, [plots]);

  React.useEffect(() => {
    Animated.spring(totalBarAnim, { toValue: selected.size > 0 ? 1 : 0, tension: 80, friction: 10, useNativeDriver: true }).start();
  }, [selected.size]);

  const toggle = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (!rows) return;
    setSelected(selected.size === rows.length ? new Set() : new Set(rows.map(r => r.id)));
  };

  if (rowsLoading || plotsLoading) return <TableSkeleton />;
  if (rowsError) return <ErrorRetry message={rowsError} onRetry={refreshRows} />;

  const selectedRows = rows.filter(r => selected.has(r.id));
  const total = selectedRows.reduce((s, r) => s + r.amount + r.lateCharge + r.gst, 0);
  const baseTotal = selectedRows.reduce((s, r) => s + r.amount, 0);
  const lateTotal = selectedRows.reduce((s, r) => s + r.lateCharge, 0);
  const gstTotal = selectedRows.reduce((s, r) => s + r.gst, 0);
  const selectedMonths = selectedRows.map(r => r.monthYear);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: SPACING.lg, paddingBottom: 180 }}>
        <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
        <Text style={styles.pageTitle}>Maintenance Due</Text>
        <Text style={styles.pageSub}>Select plot, then choose months to pay.</Text>

        {/* Plot Dropdown */}
        {plots && plots.length > 0 && (
          <View style={{ zIndex: 10 }}>
            <PlotDropdown plots={plots} selected={selectedPlot} onSelect={(id) => { setSelectedPlot(id); setSelected(new Set()); }} />
          </View>
        )}

        {/* Select All */}
        <TouchableOpacity style={styles.selectAllRow} onPress={toggleAll}>
          <View style={[styles.checkbox, selected.size === rows.length && styles.checkboxActive]}>
            {selected.size === rows.length && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text>}
          </View>
          <Text style={styles.selectAllText}>Select All ({rows.length} months)</Text>
          {selected.size > 0 && selected.size < rows.length && <Text style={styles.partialText}>{selected.size} selected</Text>}
        </TouchableOpacity>

        {/* Table */}
        <Card noPad style={{ overflow: 'hidden', marginBottom: SPACING.xs }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContent}>
          <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.4 }]}>Month-Year</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Amount</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Late</Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: 'right' }]}>GST</Text>
            <Text style={[styles.th, { flex: 1.1, textAlign: 'right' }]}>Total</Text>
          </View>
          {rows.map((r, i) => {
            const rowTotal = r.amount + r.lateCharge + r.gst;
            const isSel = selected.has(r.id);
            return (
              <TouchableOpacity key={r.id} onPress={() => toggle(r.id)} activeOpacity={0.75}
                style={[styles.tableRow, i < rows.length - 1 && styles.tableRowBorder, isSel && styles.tableRowSelected]}>
                <View style={[styles.checkbox, isSel && styles.checkboxActive, { marginRight: 10 }]}>
                  {isSel && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text>}
                </View>
                <View style={{ flex: 1.4 }}>
                  <Text style={[styles.td, { fontWeight: '700' }]}>{r.monthYear}</Text>
                  {r.lateCharge > 0 && <Text style={styles.lateBadge}>Late</Text>}
                </View>
                <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>₹{r.amount.toLocaleString('en-IN')}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'right', color: r.lateCharge > 0 ? COLORS.red : COLORS.textMuted }]}>{r.lateCharge > 0 ? `₹${r.lateCharge}` : '—'}</Text>
                <Text style={[styles.td, { flex: 0.8, textAlign: 'right', color: COLORS.textSecondary }]}>₹{r.gst}</Text>
                <Text style={[styles.td, { flex: 1.1, textAlign: 'right', fontWeight: '800', color: COLORS.textPrimary }]}>₹{rowTotal.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            );
          })}
          </View>
          </ScrollView>
        </Card>
        <Text style={styles.tapHint}>Tap any row to select / deselect</Text>
        </View>
      </ScrollView>

      {/* Sticky Total Bar */}
      <Animated.View style={[styles.totalBar, { paddingHorizontal: gutter, transform: [{ translateY: totalBarAnim.interpolate({ inputRange: [0, 1], outputRange: [150, 0] }) }], opacity: totalBarAnim }]}>
        <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.totalBarGrad}>
          <View style={{ flex: 1 }}>
            <Text style={styles.monthsText}>{selected.size} month{selected.size !== 1 ? 's' : ''} selected</Text>
            <Text style={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>
            <View style={styles.breakdown}>
              {[['Base', baseTotal], ['Late', lateTotal], ['GST', gstTotal]].map(([label, val]) => (
                <View key={label}><Text style={styles.breakLabel}>{label}</Text><Text style={styles.breakVal}>₹{val.toLocaleString('en-IN')}</Text></View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.payBtn2} onPress={() => setShowPayment(true)} activeOpacity={0.88}>
            <Text style={styles.payBtn2Text}>Pay Now</Text>
            <Text style={styles.payBtn2Amount}>₹{total.toLocaleString('en-IN')}</Text>
          </TouchableOpacity>
        </LinearGradient>
        </View>
      </Animated.View>

      <RazorpaySheet
        visible={showPayment} amount={total} months={selectedMonths}
        selectedPlot={selectedPlot} plots={plots || []}
        onClose={() => setShowPayment(false)}
        onSuccess={(receipt) => {
          setShowPayment(false); setSelected(new Set());
          navigation.navigate('Receipt', { receipt });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  pageSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.base, lineHeight: 18 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: SPACING.sm, marginBottom: SPACING.xs },
  selectAllText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, flex: 1 },
  partialText: { fontSize: 12, color: COLORS.blue, fontWeight: '700' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  tableScrollContent: { flexGrow: 1 },
  tableWrap: { minWidth: 720, width: '100%' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navy, paddingVertical: 11, paddingHorizontal: SPACING.sm, paddingLeft: 52 },
  th: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.4, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.white },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  tableRowSelected: { backgroundColor: '#EEF4FF' },
  td: { fontSize: 13, color: COLORS.textPrimary },
  lateBadge: { fontSize: 9, fontWeight: '800', color: COLORS.red, backgroundColor: COLORS.redPale, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2 },
  tapHint: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 6 },
  totalBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  totalBarGrad: { padding: SPACING.base, paddingBottom: 32, flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  monthsText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  totalAmount: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6 },
  breakdown: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  breakLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  breakVal: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  payBtn2: { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', minWidth: 100 },
  payBtn2Text: { fontSize: 12, fontWeight: '700', color: COLORS.navy },
  payBtn2Amount: { fontSize: 16, fontWeight: '900', color: COLORS.navy },
});
