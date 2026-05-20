import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, ErrorRetry, Skeleton } from '../components/ui';
import { useAsync, useResponsive } from '../hooks';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { clearDashboardCache, getMaintenanceDue, getUserPlots } from '../services';
import { COLORS, RADIUS, SHADOW, SPACING } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PLOT_TYPE_COLORS = {
  MU: COLORS.blue,
  EWS: COLORS.green,
  LIG: '#7B1FA2',
  A: COLORS.accent,
  B: '#00838F',
  C: COLORS.red,
};

const CARD_GRADIENTS = [
  [COLORS.navyDark, COLORS.blue],
  ['#154C45', '#1AA08A'],
  ['#4B2C70', '#8B4DBF'],
  ['#74310F', '#C75C2B'],
];

const currency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const formatMonthYear = (row, index) => {
  if (row.monthYear) return String(row.monthYear);
  if (row.month && row.year) {
    return new Date(Number(row.year), Number(row.month) - 1, 1)
      .toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  }
  return String(row.month ?? row.period ?? `Month ${index + 1}`);
};

const normalizeRows = (rawData) => {
  if (!rawData) return [];

  if (Array.isArray(rawData)) {
    return rawData.map((row, index) => ({
      id: String(row.ledgerId ?? row.LedgerId ?? row.id ?? row.maintenanceId ?? row.monthYear ?? index + 1),
      ledgerId: row.ledgerId ?? row.LedgerId ?? row.maintenanceLedgerId ?? row.id,
      monthYear: formatMonthYear(row, index),
      amount: Number(row.amount ?? row.pendingAmount ?? row.baseAmount ?? row.maintenanceAmount ?? 0),
      lateCharge: Number(row.lateCharge ?? row.lateFee ?? row.penalty ?? 0),
      gst: Number(row.gst ?? row.gstAmount ?? row.tax ?? 0) + Number(row.cgst ?? 0) + Number(row.sgst ?? 0),
    }));
  }

  const pendingAmount = Number(rawData.pendingAmount ?? rawData.amount ?? rawData.totalAmount ?? rawData.dueAmount ?? 0);
  if (pendingAmount <= 0) return [];

  const now = new Date();
  const monthYear = now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  const dueLabel = rawData.dueDayOfMonth ? `${rawData.dueDayOfMonth} ${monthYear}` : monthYear;

  return [{
    id: String(rawData.LedgerId ?? rawData.ledgerId ?? rawData.maintenanceLedgerId ?? rawData.paymentId ?? rawData.id ?? 'pending-due'),
    ledgerId: rawData.LedgerId ?? rawData.ledgerId ?? rawData.maintenanceLedgerId ?? rawData.paymentId ?? rawData.id,
    monthYear: `Due ${dueLabel}`,
    amount: pendingAmount,
    lateCharge: 0,
    gst: 0,
  }];
};

const getPaymentLedgerId = (selectedRows, activePlot) => {
  const row = selectedRows[0] || {};
  return (
    row.ledgerId ??
    row.LedgerId ??
    row.paymentId ??
    activePlot?.paymentId ??
    activePlot?.ledgerId ??
    activePlot?.unitId ??
    activePlot?.id
  );
};

const PlotCard = ({ plot, index, isActive, cardWidth }) => {
  const color = PLOT_TYPE_COLORS[plot.type] || COLORS.blue;

  return (
    <View style={[plotCard.card, { width: cardWidth }]}>
      <LinearGradient colors={CARD_GRADIENTS[index % CARD_GRADIENTS.length]} style={plotCard.gradient}>
        <View style={plotCard.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={plotCard.societyName} numberOfLines={1}>
              {plot.societyName || 'Home Orbit Society'}
            </Text>
            <Text style={plotCard.plotNo}>Plot {plot.plotNo}</Text>
          </View>
          <View style={[plotCard.typePill, { borderColor: color }]}>
            <Text style={plotCard.typeText}>{plot.type}</Text>
          </View>
        </View>
        <Text style={plotCard.area}>{plot.area || 'Linked from owner profile'}</Text>
        <View style={plotCard.bottomRow}>
          <View>
            <Text style={plotCard.bottomLabel}>PENDING DUE</Text>
            <Text style={plotCard.bottomValue}>
              {plot.pendingDue > 0 ? currency(plot.pendingDue) : 'All clear'}
            </Text>
          </View>
          {isActive ? <View style={plotCard.activeDot} /> : null}
        </View>
      </LinearGradient>
    </View>
  );
};

const PlotSwitcher = ({ plots, activePlot, onPlotChange, cardWidth }) => {
  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    if (index !== activePlot && index >= 0 && index < plots.length) onPlotChange(index);
  };

  return (
    <View style={styles.switcherWrap}>
      <FlatList
        data={plots}
        horizontal
        snapToInterval={cardWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => String(item.id ?? index)}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - cardWidth) / 2 - 8 }}
        renderItem={({ item, index }) => (
          <PlotCard plot={item} index={index} isActive={index === activePlot} cardWidth={cardWidth} />
        )}
      />
      {plots.length > 1 ? (
        <View style={styles.dots}>
          {plots.map((plot, index) => (
            <View key={plot.id ?? index} style={[styles.dot, index === activePlot && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const TableSkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <Skeleton width={200} height={14} style={{ marginBottom: 8 }} />
    <Skeleton width={260} height={12} style={{ marginBottom: 20 }} />
    <View style={styles.skeletonCard}>
      <Skeleton width={120} height={10} style={{ marginBottom: 8 }} />
      <Skeleton width={180} height={24} style={{ marginBottom: 6 }} />
      <Skeleton width={100} height={12} />
    </View>
    {Array(5).fill(null).map((_, index) => (
      <View key={index} style={styles.skeletonRow}>
        <Skeleton width={22} height={22} borderRadius={6} />
        <Skeleton width={90} height={14} />
        <View style={{ flex: 1 }} />
        <Skeleton width={70} height={14} />
      </View>
    ))}
  </View>
);

const MaintenanceRows = ({ rows, selected, toggle, isPhone }) => {
  if (isPhone) {
    return (
      <View>
        {rows.map((row, index) => {
          const rowTotal = row.amount + row.lateCharge + row.gst;
          const isSelected = selected.has(row.id);
          return (
            <TouchableOpacity
              key={row.id}
              onPress={() => toggle(row.id)}
              activeOpacity={0.75}
              style={[styles.mobileRow, index < rows.length - 1 && styles.tableRowBorder, isSelected && styles.tableRowSelected]}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                {isSelected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
              <View style={styles.mobileRowBody}>
                <View style={styles.mobileRowTop}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.mobileMonth} numberOfLines={2}>{row.monthYear}</Text>
                    {row.lateCharge > 0 ? <Text style={styles.lateBadge}>Late fee applied</Text> : null}
                  </View>
                  <Text style={styles.mobileTotal}>{currency(rowTotal)}</Text>
                </View>
                <View style={styles.mobileBreakdown}>
                  <Text style={styles.mobileMeta}>Base {currency(row.amount)}</Text>
                  <Text style={[styles.mobileMeta, row.lateCharge > 0 && { color: COLORS.red }]}>
                    Late {row.lateCharge > 0 ? currency(row.lateCharge) : '-'}
                  </Text>
                  <Text style={styles.mobileMeta}>GST {currency(row.gst)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContent}>
      <View style={styles.tableWrap}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.5 }]}>Month-Year</Text>
          <Text style={[styles.th, styles.rightCell]}>Amount</Text>
          <Text style={[styles.th, styles.rightCell]}>Late</Text>
          <Text style={[styles.th, styles.rightCell]}>GST</Text>
          <Text style={[styles.th, styles.rightCell]}>Total</Text>
        </View>
        {rows.map((row, index) => {
          const rowTotal = row.amount + row.lateCharge + row.gst;
          const isSelected = selected.has(row.id);
          return (
            <TouchableOpacity
              key={row.id}
              onPress={() => toggle(row.id)}
              activeOpacity={0.75}
              style={[styles.tableRow, index < rows.length - 1 && styles.tableRowBorder, isSelected && styles.tableRowSelected]}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxActive, { marginRight: 10 }]}>
                {isSelected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={[styles.td, { fontWeight: '700' }]}>{row.monthYear}</Text>
                {row.lateCharge > 0 ? <Text style={styles.lateBadge}>Late fee applied</Text> : null}
              </View>
              <Text style={[styles.td, styles.rightCell]}>{currency(row.amount)}</Text>
              <Text style={[styles.td, styles.rightCell, row.lateCharge > 0 && { color: COLORS.red }]}>
                {row.lateCharge > 0 ? currency(row.lateCharge) : '-'}
              </Text>
              <Text style={[styles.td, styles.rightCell]}>{currency(row.gst)}</Text>
              <Text style={[styles.td, styles.rightCell, styles.totalCell]}>{currency(rowTotal)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default function MaintenanceScreen({ navigation }) {
  const { contentMaxWidth, gutter, isPhone } = useResponsive();
  const [activePlotIdx, setActivePlotIdx] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const totalBarAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { data: rawPlots, loading: plotsLoading, error: plotsError, refresh: refreshPlots } = useAsync(getUserPlots, []);
  const plots = useMemo(() => rawPlots || [], [rawPlots]);
  const activePlot = plots[Math.min(activePlotIdx, plots.length - 1)];

  const fetchRows = React.useCallback(
    () => activePlot ? getMaintenanceDue(activePlot.societyId, activePlot.ownerId, activePlot.unitId ?? activePlot.id) : Promise.resolve([]),
    [activePlot?.societyId, activePlot?.ownerId, activePlot?.unitId, activePlot?.id]
  );
  const { data: rawData, loading: rowsLoading, error: rowsError, refresh: refreshRows } = useAsync(
    fetchRows,
    [activePlot?.societyId, activePlot?.ownerId, activePlot?.unitId, activePlot?.id]
  );

  const rows = useMemo(() => normalizeRows(rawData), [rawData]);
  const selectedRows = useMemo(() => rows.filter((row) => selected.has(row.id)), [rows, selected]);
  const totals = useMemo(() => {
    const base = selectedRows.reduce((sum, row) => sum + row.amount, 0);
    const late = selectedRows.reduce((sum, row) => sum + row.lateCharge, 0);
    const gst = selectedRows.reduce((sum, row) => sum + row.gst, 0);
    return { base, late, gst, total: base + late + gst };
  }, [selectedRows]);
  const selectedMonths = selectedRows.map((row) => row.monthYear);
  const hasRows = rows.length > 0;
  const allSelected = hasRows && selected.size === rows.length;

  const { processingKey, startPayment } = usePaymentFlow({
    onSuccess: async (result, activePayment) => {
      setSelected(new Set());
      clearDashboardCache();
      await Promise.all([
        refreshRows(),
        refreshPlots(),
      ]);
      Alert.alert('Maintenance Paid', 'Your payment was verified successfully.', [
        {
          text: 'View Receipt',
          onPress: () => navigation.navigate('Receipt', {
            orderId: result?.orderId || activePayment?.order?.orderId,
            receipt: {
              ...(result?.receipt || {}),
              orderId: result?.orderId || activePayment?.order?.orderId,
              amount: activePayment?.amount,
              months: activePayment?.metadata?.months || [],
              plotNo: activePayment?.metadata?.plotNo,
              plotType: activePayment?.metadata?.plotType,
              society: activePayment?.metadata?.societyName,
            },
          }),
        },
      ]);
    },
  });

  React.useEffect(() => {
    Animated.spring(totalBarAnim, {
      toValue: selected.size > 0 ? 1 : 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [selected.size, totalBarAnim]);

  const handlePlotChange = (index) => {
    setSelected(new Set());
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.25, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setActivePlotIdx(index);
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)));
  };

  const goToPayment = async () => {
    if (!totals.total || totals.total <= 0 || !activePlot) return;
    const ledgerId = getPaymentLedgerId(selectedRows, activePlot);
    const ledgerIds = selectedRows
      .map((row) => row.ledgerId ?? row.LedgerId ?? row.paymentId ?? row.id)
      .map(Number)
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!Number.isFinite(Number(ledgerId))) {
      Alert.alert('Unable to Start Payment', 'Payment id is missing. Please refresh and try again.');
      return;
    }

    await startPayment({
      amount: totals.total,
      key: 'maintenance',
      metadata: {
        type: 2,
        paymentFor: 'maintenance',
        paymentPurpose: 'Maintenance Payment',
        currency: 'INR',
        ledgerId,
        ledgerIds,
        plotId: activePlot.id,
        unitId: activePlot.unitId,
        ownerId: activePlot.ownerId,
        societyId: activePlot.societyId,
        plotNo: activePlot.plotNo,
        plotType: activePlot.type,
        societyName: activePlot.societyName,
        months: selectedMonths,
        rows: selectedRows,
      },
    });
  };

  if (plotsLoading) return <TableSkeleton />;
  if (plotsError) return <ErrorRetry message={plotsError} onRetry={refreshPlots} />;

  const cardWidth = Math.min(SCREEN_WIDTH - 48, 320);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.hero}>
          <View style={[styles.heroInner, { maxWidth: contentMaxWidth, paddingHorizontal: gutter }]}>
            <Text style={styles.heroTitle}>Maintenance Due</Text>
            <Text style={styles.heroSub}>Select pending rows and complete payment securely.</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            {plots.length > 0 ? (
              <PlotSwitcher plots={plots} activePlot={activePlotIdx} onPlotChange={handlePlotChange} cardWidth={cardWidth} />
            ) : (
              <View style={[styles.heroInner, { paddingHorizontal: gutter }]}>
                <View style={styles.noPlotCard}>
                  <Text style={styles.noPlotText}>No plots found. Please contact your society admin.</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: gutter, paddingTop: SPACING.lg }}>
          <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
            {activePlot ? (
              <View style={styles.activePlotChip}>
                <View style={[styles.chipDot, { backgroundColor: PLOT_TYPE_COLORS[activePlot.type] || COLORS.blue }]} />
                <Text style={styles.chipText}>
                  {activePlot.societyName || 'Home Orbit Society'} | Plot {activePlot.plotNo} ({activePlot.type})
                </Text>
              </View>
            ) : null}

            {rowsLoading ? (
              <TableSkeleton />
            ) : rowsError ? (
              <ErrorRetry message={rowsError} onRetry={refreshRows} />
            ) : (
              <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity
                  style={styles.selectAllRow}
                  onPress={toggleAll}
                  disabled={!hasRows}
                  activeOpacity={hasRows ? 0.75 : 1}
                >
                  <View style={[styles.checkbox, allSelected && styles.checkboxActive, !hasRows && styles.checkboxDisabled]}>
                    {allSelected ? <Text style={styles.checkText}>✓</Text> : null}
                  </View>
                  <Text style={[styles.selectAllText, !hasRows && styles.selectAllTextDisabled]}>
                    {hasRows ? `Select All (${rows.length} rows)` : 'No pending maintenance'}
                  </Text>
                  {selected.size > 0 && selected.size < rows.length ? (
                    <Text style={styles.partialText}>{selected.size} selected</Text>
                  ) : null}
                </TouchableOpacity>

                {hasRows ? (
                  <Card noPad style={{ overflow: 'hidden', marginBottom: SPACING.xs }}>
                    {isPhone ? (
                      <MaintenanceRows rows={rows} selected={selected} toggle={toggle} isPhone />
                    ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContent}>
                      <View style={styles.tableWrap}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.th, { flex: 1.5 }]}>Month-Year</Text>
                          <Text style={[styles.th, styles.rightCell]}>Amount</Text>
                          <Text style={[styles.th, styles.rightCell]}>Late</Text>
                          <Text style={[styles.th, styles.rightCell]}>GST</Text>
                          <Text style={[styles.th, styles.rightCell]}>Total</Text>
                        </View>
                        {rows.map((row, index) => {
                          const rowTotal = row.amount + row.lateCharge + row.gst;
                          const isSelected = selected.has(row.id);
                          return (
                            <TouchableOpacity
                              key={row.id}
                              onPress={() => toggle(row.id)}
                              activeOpacity={0.75}
                              style={[styles.tableRow, index < rows.length - 1 && styles.tableRowBorder, isSelected && styles.tableRowSelected]}
                            >
                              <View style={[styles.checkbox, isSelected && styles.checkboxActive, { marginRight: 10 }]}>
                                {isSelected ? <Text style={styles.checkText}>✓</Text> : null}
                              </View>
                              <View style={{ flex: 1.5 }}>
                                <Text style={[styles.td, { fontWeight: '700' }]}>{row.monthYear}</Text>
                                {row.lateCharge > 0 ? <Text style={styles.lateBadge}>Late fee applied</Text> : null}
                              </View>
                              <Text style={[styles.td, styles.rightCell]}>{currency(row.amount)}</Text>
                              <Text style={[styles.td, styles.rightCell, row.lateCharge > 0 && { color: COLORS.red }]}>
                                {row.lateCharge > 0 ? currency(row.lateCharge) : '-'}
                              </Text>
                              <Text style={[styles.td, styles.rightCell]}>{currency(row.gst)}</Text>
                              <Text style={[styles.td, styles.rightCell, styles.totalCell]}>{currency(rowTotal)}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                    )}
                  </Card>
                ) : (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>✓</Text>
                    <Text style={styles.emptyTitle}>All dues are clear</Text>
                    <Text style={styles.emptyText}>
                      No pending maintenance for Plot {activePlot?.plotNo}. You are up to date.
                    </Text>
                  </Card>
                )}
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>

      <Animated.View style={[
        styles.totalBar,
        {
          paddingHorizontal: gutter,
          transform: [{ translateY: totalBarAnim.interpolate({ inputRange: [0, 1], outputRange: [150, 0] }) }],
          opacity: totalBarAnim,
        },
      ]}>
        <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
          <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.totalBarGrad}>
            <View style={{ flex: 1 }}>
              <Text style={styles.monthsText}>
                {selected.size} row{selected.size !== 1 ? 's' : ''} selected
                {activePlot ? ` | Plot ${activePlot.plotNo}` : ''}
              </Text>
              <Text style={styles.totalAmount}>{currency(totals.total)}</Text>
              <View style={styles.breakdown}>
                {[['Base', totals.base], ['Late', totals.late], ['GST', totals.gst]].map(([label, value]) => (
                  <View key={label}>
                    <Text style={styles.breakLabel}>{label}</Text>
                    <Text style={styles.breakVal}>{currency(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.payBtn, processingKey && styles.payBtnDisabled]}
              onPress={goToPayment}
              disabled={Boolean(processingKey)}
              activeOpacity={0.88}
            >
              <Text style={styles.payBtnText}>{processingKey ? 'Opening' : 'Pay Now'}</Text>
              <Text style={styles.payBtnAmount}>{currency(totals.total)}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}

const plotCard = StyleSheet.create({
  card: { paddingHorizontal: 8 },
  gradient: { borderRadius: RADIUS.xl, padding: 14, minHeight: 112 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  societyName: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginBottom: 3 },
  plotNo: { fontSize: 18, fontWeight: '900', color: COLORS.white },
  typePill: { borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  area: { fontSize: 11, color: 'rgba(255,255,255,0.48)', marginBottom: 11 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bottomLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: 1, marginBottom: 3 },
  bottomValue: { fontSize: 15, fontWeight: '900', color: COLORS.accent },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
});

const styles = StyleSheet.create({
  hero: { paddingTop: 52, paddingBottom: 16 },
  heroInner: { width: '100%', alignSelf: 'center' },
  heroTitle: { fontSize: 21, fontWeight: '900', color: COLORS.white, marginBottom: 3 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.62)' },
  switcherWrap: { marginBottom: SPACING.base },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.28)' },
  dotActive: { width: 18, backgroundColor: COLORS.accent },
  noPlotCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  noPlotText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  activePlotChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: SPACING.base, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: SPACING.sm, marginBottom: SPACING.xs },
  selectAllText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, flex: 1 },
  selectAllTextDisabled: { color: COLORS.textMuted },
  partialText: { fontSize: 12, color: COLORS.blue, fontWeight: '800' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  checkboxDisabled: { backgroundColor: COLORS.surface },
  checkText: { color: COLORS.white, fontSize: 12, fontWeight: '900' },
  tableScrollContent: { flexGrow: 1 },
  tableWrap: { minWidth: 720, width: '100%' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navy, paddingVertical: 11, paddingHorizontal: SPACING.sm, paddingLeft: 52 },
  th: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.4, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.white },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  tableRowSelected: { backgroundColor: '#EEF4FF' },
  td: { fontSize: 13, color: COLORS.textPrimary },
  rightCell: { flex: 1, textAlign: 'right' },
  totalCell: { fontWeight: '900', color: COLORS.textPrimary },
  lateBadge: { fontSize: 9, fontWeight: '800', color: COLORS.red, backgroundColor: COLORS.redPale, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 3 },
  mobileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: SPACING.base, paddingVertical: 12, backgroundColor: COLORS.white },
  mobileRowBody: { flex: 1, minWidth: 0 },
  mobileRowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mobileMonth: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 18 },
  mobileTotal: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'right', flexShrink: 0, maxWidth: 116 },
  mobileBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 7 },
  mobileMeta: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl, marginBottom: SPACING.xs },
  emptyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.greenPale, color: COLORS.green, fontSize: 26, fontWeight: '900', textAlign: 'center', textAlignVertical: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  totalBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  totalBarGrad: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg },
  monthsText: { fontSize: 11, color: 'rgba(255,255,255,0.64)', marginBottom: 1 },
  totalAmount: { fontSize: 22, fontWeight: '900', color: COLORS.white, marginBottom: 4 },
  breakdown: { flexDirection: 'row', gap: 14 },
  breakLabel: { fontSize: 9, color: 'rgba(255,255,255,0.54)' },
  breakVal: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.86)' },
  payBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', minWidth: 92 },
  payBtnDisabled: { opacity: 0.65 },
  payBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.navy },
  payBtnAmount: { fontSize: 14, fontWeight: '900', color: COLORS.navy },
  skeletonCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, ...SHADOW.card },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
});
