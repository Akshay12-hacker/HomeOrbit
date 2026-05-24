import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Skeleton } from '../../components/ui';
import { useAsync, useResponsive } from '../../hooks';
import { usePaymentFlow } from '../../hooks/usePaymentFlow';
import { clearDashboardCache, getMaintenanceDue, getUserPlots } from '../../services';
import { shadows as themeShadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// PLOT CARD COMPONENT
const PlotCard = ({ plot, index, isActive, colors, isDark, onPress }) => {
  const type = plot.type || 'Plot';
  const hasDue = Number(plot.pendingDue) > 0;
  
  const lightGradients = [['#EEF2FF', '#E0E7FF'], ['#F0FDF4', '#DCFCE7'], ['#FFFBEB', '#FEF3C7']];
  const darkGradients = [['#1e1b4b', '#312e81'], ['#064e3b', '#065f46'], ['#451a03', '#78350f']];
  const gradient = isDark ? darkGradients[index % 3] : lightGradients[index % 3];

  const styles = StyleSheet.create({
    plotCard: { width: 280, borderRadius: 24, overflow: 'hidden', borderWidth: 1, marginRight: 16 },
    plotGradient: { padding: 20, height: 140, justifyContent: 'space-between' },
    plotTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    plotNo: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    plotTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    plotTypeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    plotSociety: { fontSize: 13, fontWeight: '700', marginTop: 2 },
    plotStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    plotStatusText: { fontSize: 16, fontWeight: '900' },
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[
        styles.plotCard, 
        { borderColor: isActive ? colors.primary : colors.border, backgroundColor: colors.surface },
        isActive && themeShadows.md
      ]}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.plotGradient}>
        <View style={styles.plotTop}>
          <Text style={[styles.plotNo, { color: colors.textPrimary }]}>{plot.plotNo}</Text>
          <View style={[styles.plotTypeBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.plotTypeText, { color: colors.textSecondary }]}>{type}</Text>
          </View>
        </View>
        <Text style={[styles.plotSociety, { color: colors.textSecondary }]} numberOfLines={1}>{plot.societyName}</Text>
        <View style={styles.plotStatus}>
          <Text style={{ fontSize: 14 }}>{hasDue ? "🚨" : "✅"}</Text>
          <Text style={[styles.plotStatusText, { color: hasDue ? colors.error : colors.success }]}>
            {hasDue ? formatCurrency(plot.pendingDue) : "CLEARED"}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// DUE ROW COMPONENT
const DueRow = ({ row, isSelected, onToggle, colors }) => {
  const total = row.amount + row.lateCharge + row.gst;
  
  const styles = StyleSheet.create({
    dueRow: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 14, ...themeShadows.sm },
    check: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    rowMonth: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
    rowMetaRow: { flexDirection: 'row', marginTop: 4 },
    rowBreakdown: { fontSize: 12, fontWeight: '600' },
    rowTotal: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[
        styles.dueRow, 
        { 
          backgroundColor: colors.surface, 
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1
        }
      ]}
    >
      <View style={[
        styles.check, 
        { 
          borderColor: isSelected ? colors.primary : colors.border, 
          backgroundColor: isSelected ? colors.primary : 'transparent' 
        }
      ]}>
        {isSelected && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>✓</Text>}
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={[styles.rowMonth, { color: colors.textPrimary }]}>{row.monthYear}</Text>
        <View style={styles.rowMetaRow}>
          <Text style={[styles.rowBreakdown, { color: colors.textMuted }]}>Base: {formatCurrency(row.amount)}</Text>
          {row.lateCharge > 0 && (
             <Text style={[styles.rowBreakdown, { color: '#F5A623', marginLeft: 8 }]}>+ Late: {formatCurrency(row.lateCharge)}</Text>
          )}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.rowTotal, { color: colors.textPrimary }]}>{formatCurrency(total)}</Text>
        <Text style={{ fontSize: 9, fontWeight: '800', color: colors.textMuted, marginTop: 2 }}>DUE</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function MaintenanceScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const initialIndex = route.params?.initialPlotIndex ?? 0;
  const [activePlotIdx, setActivePlotIdx] = useState(initialIndex);
  const [selected, setSelected] = useState(new Set());
  
  const totalBarAnim = useRef(new Animated.Value(0)).current;
  const listFadeAnim = useRef(new Animated.Value(1)).current;

  const styles = StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, marginBottom: 32 },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    subtitle: { fontSize: 15, marginTop: 6, lineHeight: 22 },
    sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 },
    sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    empty: { alignItems: 'center', paddingVertical: 48, borderRadius: 24, borderWidth: 1, ...themeShadows.sm },
    emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
    payBar: { 
      position: 'absolute', 
      bottom: Platform.OS === 'ios' ? 120 : 110, 
      left: 20, 
      right: 20, 
      borderRadius: 28, 
      overflow: 'hidden', 
      ...themeShadows.lg, 
      zIndex: 1000 
    },
    payGrad: { flexDirection: 'row', alignItems: 'center', padding: 22 },
    payLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    payTotal: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    payBtn: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 18 },
    payBtnText: { color: '#4F46E5', fontWeight: '900', fontSize: 15 },
  });

  // Data fetching
  const { data: rawPlots, loading: plotsLoading, error: plotsError, refresh: refreshPlots } = useAsync(getUserPlots, []);
  const plots = useMemo(() => rawPlots || [], [rawPlots]);
  const activePlot = plots[Math.min(activePlotIdx, plots.length - 1)];

  const fetchRows = React.useCallback(
    () => {
      if (!activePlot) return Promise.resolve([]);
      return getMaintenanceDue(activePlot.societyId, activePlot.ownerId, activePlot.unitId ?? activePlot.id);
    },
    [activePlot]
  );
  
  const { data: rawData, loading: rowsLoading, error: rowsError, refresh: refreshRows } = useAsync(fetchRows, [activePlot]);

  // Sync index from params
  useEffect(() => {
    if (route.params?.initialPlotIndex !== undefined && route.params.initialPlotIndex !== activePlotIdx) {
      setActivePlotIdx(route.params.initialPlotIndex);
    }
  }, [route.params?.initialPlotIndex]);

  // Transform rows based on API
  const rows = useMemo(() => {
    if (!rawData) return [];
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];
    return dataArray.map((row, idx) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthYear = row.month && row.year 
        ? `${monthNames[row.month - 1]} ${row.year}` 
        : row.monthYear || `Dues #${idx + 1}`;
        
      const actualLedgerId = row.ledgerId ?? row.LedgerId ?? row.maintenanceLedgerId ?? row.paymentId ?? row.id;

      return {
        id: String(actualLedgerId ?? idx),
        ledgerId: actualLedgerId,
        monthYear,
        amount: Number(row.pendingAmount ?? row.amount ?? 0),
        lateCharge: Number(row.lateFee ?? row.lateCharge ?? 0),
        gst: Number(row.cgst ?? 0) + Number(row.sgst ?? 0) + Number(row.gst ?? 0),
      };
    }).filter(r => r.amount > 0);
  }, [rawData]);

  const selectedRows = useMemo(() => rows.filter((row) => selected.has(row.id)), [rows, selected]);
  const totals = useMemo(() => {
    const total = selectedRows.reduce((sum, row) => sum + row.amount + row.lateCharge + row.gst, 0);
    return { total };
  }, [selectedRows]);
  
  const hasRows = rows.length > 0;
  const allSelected = hasRows && selected.size === rows.length;

  const { processingKey, startPayment } = usePaymentFlow({
    onSuccess: async (result, activePayment) => {
      setSelected(new Set());
      clearDashboardCache();
      await Promise.all([refreshRows(), refreshPlots()]);
      
      navigation.navigate('PaymentSuccess', {
        amount: activePayment?.amount,
        receipt: result,
        payment: activePayment
      });
    },
  });

  // Animations
  useEffect(() => {
    Animated.spring(totalBarAnim, {
      toValue: selected.size > 0 ? 1 : 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [selected.size]);

  const handlePlotChange = (index) => {
    if (index === activePlotIdx) return;
    
    Animated.sequence([
      Animated.timing(listFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.delay(50),
      Animated.timing(listFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    setActivePlotIdx(index);
    setSelected(new Set());
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
    if (!totals.total || !activePlot || selectedRows.length === 0) return;
    
    const ledgerIds = selectedRows
      .map(r => Number(r.ledgerId))
      .filter(id => !isNaN(id) && id > 0);

    if (ledgerIds.length === 0) {
      Alert.alert('Selection Error', 'Could not identify the selected maintenance items. Please try again.');
      return;
    }

    const ledgerId = ledgerIds[0];

    await startPayment({
      amount: totals.total,
      key: 'maintenance',
      metadata: {
        type: 2,
        paymentFor: 'maintenance',
        ledgerId,
        ledgerIds,
        plotId: activePlot.id,
        plotNo: activePlot.plotNo,
        societyName: activePlot.societyName,
        societyId: activePlot.societyId,
        ownerId: activePlot.ownerId,
      },
    });
  };

  if (plotsLoading) return <View style={{flex:1, backgroundColor: colors.background}}><Skeleton width="100%" height={200}/></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 64 : 48 }]}>
           <Text style={[styles.title, { color: colors.textPrimary }]}>Maintenance</Text>
           <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select dues to complete your secure payment.</Text>
        </View>

        {/* PLOT SWITCHER */}
        <FlatList
          data={plots}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <PlotCard 
              plot={item} 
              index={index} 
              isActive={index === activePlotIdx} 
              colors={colors} 
              isDark={isDark} 
              onPress={() => handlePlotChange(index)}
            />
          )}
        />

        {/* DUES LIST */}
        <Animated.View style={{ paddingHorizontal: spacing.lg, opacity: listFadeAnim }}>
          <View style={styles.sectionHdr}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pending Payments</Text>
            {hasRows && (
              <TouchableOpacity onPress={toggleAll}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {rowsLoading ? (
            <Skeleton width="100%" height={100} style={{ borderRadius: 20 }} />
          ) : hasRows ? (
            rows.map((row) => (
              <DueRow 
                key={row.id} 
                row={row} 
                isSelected={selected.has(row.id)} 
                onToggle={() => toggle(row.id)} 
                colors={colors} 
              />
            ))
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.emptyIconWrap}>
                 <Text style={{ fontSize: 32 }}>✨</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Property Cleared</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No pending maintenance for {activePlot?.plotNo}. You are all caught up!
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* FLOATING ACTION BAR */}
      <Animated.View style={[
        styles.payBar, 
        { 
          transform: [{ translateY: totalBarAnim.interpolate({ inputRange: [0, 1], outputRange: [220, 0] }) }],
          opacity: totalBarAnim 
        }
      ]}>
        <LinearGradient colors={colors.gradientHero} style={styles.payGrad}>
          <View style={{ flex: 1 }}>
            <Text style={styles.payLabel}>{selected.size} Item{selected.size > 1 ? 's' : ''} Selected</Text>
            <Text style={styles.payTotal}>{formatCurrency(totals.total)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.payBtn, themeShadows.md]} 
            onPress={goToPayment} 
            disabled={Boolean(processingKey)}
            activeOpacity={0.8}
          >
             <Text style={styles.payBtnText}>{processingKey ? '...' : 'Pay Dues'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
