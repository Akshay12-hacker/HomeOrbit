import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Skeleton, SkeletonCard, Badge, ErrorRetry } from '../components/ui';
import { getPaymentHistory } from '../services';
import { useAsync, useResponsive } from '../hooks';

const FILTERS = ['All', 'Paid', 'Pending'];
const PLOT_TYPE_COLORS = { MU: COLORS.blue, EWS: COLORS.green, LIG: '#7B1FA2', A: COLORS.accent, B: '#00838F', C: COLORS.red };

const HistorySkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
      {[1,2].map(i => <View key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, ...SHADOW.card }}><Skeleton width={70} height={11} style={{ marginBottom: 8 }} /><Skeleton width={100} height={26} /></View>)}
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
      {FILTERS.map(f => <Skeleton key={f} width={60} height={32} borderRadius={20} />)}
    </View>
    <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
  </View>
);

const PaymentItem = ({ item, isLast, onPress }) => {
  const tc = PLOT_TYPE_COLORS[item.plotType] || COLORS.blue;
  const canViewReceipt = item.status === 'Paid' && item.receiptId;
  return (
    <TouchableOpacity onPress={canViewReceipt ? onPress : undefined} activeOpacity={canViewReceipt ? 0.75 : 1} style={[styles.item, !isLast && styles.itemBorder]}>
      <View style={[styles.itemIcon, { backgroundColor: item.status === 'Paid' ? COLORS.greenPale : COLORS.orangePale }]}>
        <Text style={{ fontSize: 18 }}>{item.status === 'Paid' ? '✅' : '⏳'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemDesc}>{item.desc}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
        {item.plotNo && (
          <View style={styles.plotChip}>
            <View style={[styles.plotTypeDot, { backgroundColor: tc }]} />
            <Text style={styles.plotChipText}>Plot {item.plotNo} · {item.plotType}</Text>
          </View>
        )}
        {item.receiptId && <Text style={styles.receiptId}>🧾 {item.receiptId}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={styles.itemAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
        <Badge label={item.status} type={item.status === 'Paid' ? 'paid' : 'pending'} />
        {canViewReceipt && <Text style={styles.viewReceipt}>View Receipt ›</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default function HistoryScreen({ navigation }) {
  const { data: payments, loading, error, refresh } = useAsync(getPaymentHistory, []);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const { contentMaxWidth, gutter, isPhone } = useResponsive();

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false); };

  if (loading) return <HistorySkeleton />;
  if (error) return <ErrorRetry message={error} onRetry={refresh} />;

  const filtered = filter === 'All' ? payments : payments.filter(p => p.status === filter);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.surface }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 40 }}>
      <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center', paddingHorizontal: gutter - SPACING.lg }}>
      <Text style={styles.title}>Payment History</Text>

      {/* Summary */}
      <View style={[styles.summaryRow, !isPhone && styles.summaryRowWide]}>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.greenPale, borderColor: '#A5D6A7' }]}>
          <Text style={[styles.summaryLabel, { color: COLORS.green }]}>TOTAL PAID</Text>
          <Text style={styles.summaryAmount}>₹{totalPaid.toLocaleString('en-IN')}</Text>
          <Text style={{ fontSize: 11, color: COLORS.green, fontWeight: '600' }}>{payments.filter(p => p.status === 'Paid').length} payments</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.orangePale, borderColor: '#FFCC80' }]}>
          <Text style={[styles.summaryLabel, { color: COLORS.orange }]}>OUTSTANDING</Text>
          <Text style={styles.summaryAmount}>₹{pending.toLocaleString('en-IN')}</Text>
          <Text style={{ fontSize: 11, color: COLORS.orange, fontWeight: '600' }}>{payments.filter(p => p.status === 'Pending').length} pending</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.base }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.75} style={[styles.pill, filter === f && styles.pillActive]}>
              <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary }}>No {filter} payments</Text>
        </View>
      ) : (
        <Card noPad style={{ overflow: 'hidden' }}>
          {filtered.map((p, i) => (
            <PaymentItem key={p.id} item={p} isLast={i === filtered.length - 1}
              onPress={() => navigation.navigate('Receipt', { payment: p })} />
          ))}
        </Card>
      )}
      <Text style={styles.hint}>Tap any paid payment to view its receipt</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.base },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.base, flexWrap: 'wrap' },
  summaryRowWide: { gap: 16 },
  summaryCard: { flex: 1, minWidth: 220, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, ...SHADOW.card },
  summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  summaryAmount: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  pill: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  pillActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  pillText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: '#fff' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: SPACING.base, flexWrap: 'wrap' },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  itemIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemDesc: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  itemDate: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  plotChip: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  plotTypeDot: { width: 8, height: 8, borderRadius: 4 },
  plotChipText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  receiptId: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace' },
  itemAmount: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  viewReceipt: { fontSize: 11, color: COLORS.blue, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.lg },
});
