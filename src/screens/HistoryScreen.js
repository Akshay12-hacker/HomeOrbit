import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Skeleton, ErrorRetry } from '../components/ui';
import { clearDashboardCache, getPaymentHistory, getPaymentHistoryForUnit, getUserPlots } from '../services';
import { useAsync, useResponsive } from '../hooks';

const FILTERS = ['All', 'Paid', 'Pending'];
const PAGE_SIZE = 10;

function getPaymentRowKey(payment, index) {
  return [
    payment?.id,
    payment?.orderId,
    payment?.txnId,
    payment?.receiptId,
    payment?.date,
    payment?.amount,
    index,
  ].filter((value) => value !== undefined && value !== null && value !== '').join('-');
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const HistorySkeleton = () => (
  <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
    <View style={{ height: 160, backgroundColor: COLORS.navyDark }} />
    <View style={{ padding: SPACING.lg }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: SPACING.lg }}>
        {FILTERS.map(f => <Skeleton key={f} width={60} height={32} borderRadius={20} />)}
      </View>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={sk.row}>
          <Skeleton width={36} height={36} borderRadius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width={160} height={13} />
            <Skeleton width={100} height={11} />
          </View>
          <Skeleton width={70} height={16} />
        </View>
      ))}
    </View>
  </View>
);

const sk = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.base, marginBottom: 10, ...SHADOW.card,
  },
});

// ─── Payment Row ───────────────────────────────────────────────────────────────
const PaymentRow = ({ item, isLast, onPress }) => {
  const isPaid = item.status === 'Paid';
  const accentColor = isPaid ? COLORS.green : COLORS.orange;
  const canPress = isPaid && item.receiptId;

  return (
    <TouchableOpacity
      onPress={canPress ? onPress : undefined}
      activeOpacity={canPress ? 0.72 : 1}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: isPaid ? COLORS.greenPale : COLORS.orangePale }]}>
        <Text style={{ fontSize: 16 }}>{isPaid ? '✅' : '⏳'}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={styles.desc} numberOfLines={1}>{item.desc}</Text>
        <Text style={styles.meta}>{item.date}{item.plotNo ? ` · Plot ${item.plotNo}` : ''}</Text>
        {item.receiptId && (
          <Text style={styles.receiptId}>🧾 {item.receiptId}</Text>
        )}
      </View>

      {/* Right */}
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={[styles.amount, { color: isPaid ? COLORS.green : COLORS.orange }]}>
          ₹{item.amount.toLocaleString('en-IN')}
        </Text>
        <View style={[styles.badge, { backgroundColor: isPaid ? COLORS.greenPale : COLORS.orangePale }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>{item.status}</Text>
        </View>
        {canPress && <Text style={styles.viewLink}>View Receipt ›</Text>}
      </View>
    </TouchableOpacity>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function HistoryScreen({ navigation, route }) {
  const plotId = route.params?.plotId;
  const loadPayments = React.useCallback(async () => {
    if (!plotId) return getPaymentHistory();

    const plots = await getUserPlots();
    const plot = plots.find((item) => String(item.id) === String(plotId));
    if (!plot) return [];

    return getPaymentHistoryForUnit(plot.societyId, plot.ownerId, plot.unitId, { forceRefresh: true });
  }, [plotId]);
  const { data: payments, loading, error, refresh } = useAsync(loadPayments, [loadPayments]);
  const [filter, setFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [refreshing, setRefreshing] = useState(false);
  const { contentMaxWidth, gutter } = useResponsive();

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, payments?.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    clearDashboardCache();
    await refresh();
    setRefreshing(false);
  };

  if (loading) return <HistorySkeleton />;
  if (error) return <ErrorRetry message={error} onRetry={refresh} />;

  const allPayments = Array.isArray(payments) ? payments : [];
  const filtered = filter === 'All' ? allPayments : allPayments.filter(p => p.status === filter);
  const totalPaid = allPayments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = allPayments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const paidCount = allPayments.filter(p => p.status === 'Paid').length;
  const pendingCount = allPayments.filter(p => p.status === 'Pending').length;
  const visiblePayments = filtered.slice(0, visibleCount);
  const hasMorePayments = visibleCount < filtered.length;

  const handleHistoryScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distanceFromBottom < 180 && hasMorePayments) {
      setVisibleCount((current) => Math.min(current + PAGE_SIZE, filtered.length));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <StatusBar barStyle="light-content" />

      {/* ── Gradient Header ── */}
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.header}>
        <View style={[styles.headerInner, { maxWidth: contentMaxWidth, paddingHorizontal: gutter }]}>
          <Text style={styles.headerTitle}>Payment History</Text>
          <Text style={styles.headerSub}>Track all your maintenance payments</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>₹{totalPaid.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>{paidCount} Paid</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#FFD080' }]}>₹{totalPending.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>{pendingCount} Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{allPayments.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
        contentContainerStyle={[styles.body, { paddingHorizontal: gutter, paddingBottom: 40 }]}
        onScroll={handleHistoryScroll}
        scrollEventThrottle={160}
      >
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }}>
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.base }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FILTERS.map(f => {
                const active = filter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    activeOpacity={0.75}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{f}</Text>
                    <View style={[styles.pillCount, active && styles.pillCountActive]}>
                      <Text style={[styles.pillCountText, active && { color: COLORS.blue }]}>
                        {f === 'All' ? allPayments.length : allPayments.filter(p => p.status === f).length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Payment list */}
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>📭</Text>
              <Text style={styles.emptyTitle}>No {filter} payments</Text>
              <Text style={styles.emptyText}>Your {filter.toLowerCase()} payments will appear here.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {visiblePayments.map((p, i) => (
                <PaymentRow
                  key={getPaymentRowKey(p, i)}
                  item={p}
                  isLast={i === visiblePayments.length - 1 && !hasMorePayments}
                  onPress={() => navigation.navigate('Receipt', { orderId: p.orderId, payment: p })}
                />
              ))}
            </View>
          )}

          {hasMorePayments && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, filtered.length))}
              style={styles.loadMoreBtn}
            >
              <Text style={styles.loadMoreText}>Load more transactions</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>Tap any paid payment to view its receipt</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: { paddingTop: 56, paddingBottom: 24 },
  headerInner: { alignSelf: 'center', width: '100%' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.lg, paddingVertical: 12, paddingHorizontal: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },

  // Body
  body: { paddingTop: SPACING.lg },

  // Filters
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  pillActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  pillText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: '#fff' },
  pillCount: { backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1 },
  pillCountActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  pillCountText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },

  // Card container
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.card, marginBottom: SPACING.base },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingRight: 14, paddingLeft: 0 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  accentBar: { width: 3, height: 38, borderRadius: 2, marginLeft: 0 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  meta: { fontSize: 11, color: COLORS.textMuted },
  receiptId: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '900' },
  badge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  viewLink: { fontSize: 10, color: COLORS.blue, fontWeight: '700' },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 48, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOW.card },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },

  hint: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.base },
  loadMoreBtn: { alignSelf: 'center', borderWidth: 1.5, borderColor: COLORS.blue, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 8, marginBottom: SPACING.base },
  loadMoreText: { fontSize: 12, color: COLORS.blue, fontWeight: '800' },
});
