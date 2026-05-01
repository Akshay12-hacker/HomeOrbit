import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Skeleton, ErrorRetry } from '../components/ui';
import { getSocietyFund } from '../services';
import { useAsync, useResponsive } from '../hooks';

const FundSkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <View style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 18, marginBottom: 16, ...SHADOW.card }}>
      <Skeleton width={120} height={12} style={{ marginBottom: 8 }} />
      <Skeleton width={160} height={30} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={8} borderRadius={4} />
    </View>
    {Array(4).fill(null).map((_, i) => (
      <View key={i} style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, ...SHADOW.card }}>
        <Skeleton width="70%" height={13} style={{ marginBottom: 6 }} />
        <Skeleton width="45%" height={11} />
      </View>
    ))}
  </View>
);

const ExpenseItem = ({ item, isLast }) => (
  <View style={[styles.expenseItem, !isLast && styles.expenseBorder]}>
    <View style={styles.expenseIcon}>
      <Text style={{ fontSize: 18 }}>📋</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.expenseRemark}>{item.remark}</Text>
      <Text style={styles.expenseDate}>{item.date}</Text>
    </View>
    <Text style={styles.expenseAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
  </View>
);

export default function SocietyFundScreen() {
  const { data: fund, loading, error, refresh } = useAsync(getSocietyFund, []);
  const [refreshing, setRefreshing] = React.useState(false);
  const { contentMaxWidth, gutter, isPhone } = useResponsive();

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading) return <FundSkeleton />;
  if (error) return <ErrorRetry message={error} onRetry={refresh} />;

  const pct = Math.round((fund.totalBalance / fund.collected) * 100);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.surface }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 36 }}
    >
      <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center', paddingHorizontal: gutter - SPACING.lg }}>
      <View style={styles.summaryWrap}>
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.summaryGrad}>
          <Text style={styles.summaryLabel}>CURRENT BALANCE</Text>
          <Text style={styles.summaryBalance}>₹{fund.totalBalance.toLocaleString('en-IN')}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
          <View style={[styles.statsRow, !isPhone && styles.statsRowWide]}>
            <View>
              <Text style={styles.statLabel}>Collected</Text>
              <Text style={styles.statValue}>₹{fund.collected.toLocaleString('en-IN')}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: '#FF8A80' }]}>₹{fund.spent.toLocaleString('en-IN')}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Balance %</Text>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>{pct}%</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.title}>Society Fund Expense History</Text>
      <Card noPad style={{ overflow: 'hidden' }}>
        {fund.expenses.map((expense, index) => (
          <ExpenseItem key={expense.id} item={expense} isLast={index === fund.expenses.length - 1} />
        ))}
      </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryWrap: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.base, ...SHADOW.strong },
  summaryGrad: { padding: SPACING.lg },
  summaryLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8 },
  summaryBalance: { fontSize: 30, fontWeight: '900', color: '#fff', marginTop: 4, marginBottom: SPACING.sm },
  barBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, marginBottom: SPACING.sm },
  barFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  statsRowWide: { gap: 20 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  statValue: { fontSize: 14, fontWeight: '800', color: '#fff', marginTop: 2 },
  title: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  expenseItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACING.base, flexWrap: 'wrap' },
  expenseBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  expenseIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.orangePale, alignItems: 'center', justifyContent: 'center' },
  expenseRemark: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  expenseDate: { fontSize: 12, color: COLORS.textMuted },
  expenseAmount: { fontSize: 15, fontWeight: '800', color: COLORS.red },
});
