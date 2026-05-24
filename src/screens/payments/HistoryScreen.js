import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { shadows, spacing, radius, typography } from '../../theme';
import { Skeleton } from '../../components/ui';
import { useAsync } from '../../hooks';
import { clearDashboardCache, getPaymentHistory, getPaymentHistoryForUnit, getUserPlots } from '../../services';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_SIZE = 12;
const FILTERS = ['All', 'Paid', 'Pending'];

const PaymentRow = ({ item, isLast, onPress, colors }) => {
  const isPaid = String(item.status).toLowerCase() === 'paid' || String(item.status).toLowerCase() === 'success';
  const statusColor = isPaid ? colors.success : '#F5A623';
  const statusBg = isPaid ? colors.successLight : 'rgba(245,166,35,0.1)';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.payItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.divider },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={[styles.payIcon, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ fontSize: 20 }}>{item.desc?.toLowerCase().includes('electricity') ? '⚡' : '🏠'}</Text>
      </View>
      <View style={styles.payInfo}>
        <Text style={[styles.payTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.desc || 'Maintenance Fee'}
        </Text>
        <Text style={[styles.payDate, { color: colors.textMuted }]}>
          {item.date || 'Transaction Confirmed'}
        </Text>
      </View>
      <View style={styles.payRight}>
        <Text style={[styles.payAmt, { color: colors.textPrimary }]}>
          {formatCurrency(item.amount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isPaid ? 'PAID' : 'PENDING'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HistoryScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const plotId = route.params?.plotId;
  
  const [filter, setFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!plotId) return getPaymentHistory();
    const plots = await getUserPlots();
    const plot = plots.find((item) => String(item.id) === String(plotId));
    if (!plot) return [];
    return getPaymentHistoryForUnit(plot.societyId, plot.ownerId, plot.unitId, { forceRefresh: true });
  }, [plotId]);

  const { data: rawPayments, loading, error, refresh } = useAsync(loadPayments, [loadPayments]);

  const allPayments = useMemo(() => Array.isArray(rawPayments) ? rawPayments : [], [rawPayments]);
  
  const filteredPayments = useMemo(() => {
    if (filter === 'All') return allPayments;
    return allPayments.filter(p => {
      const status = String(p.status).toLowerCase();
      if (filter === 'Paid') return status === 'paid' || status === 'success';
      if (filter === 'Pending') return status === 'pending' || status === 'failed';
      return true;
    });
  }, [allPayments, filter]);

  const visiblePayments = useMemo(() => filteredPayments.slice(0, visibleCount), [filteredPayments, visibleCount]);
  const hasMore = visibleCount < filteredPayments.length;

  const onRefresh = async () => {
    setRefreshing(true);
    clearDashboardCache();
    await refresh();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredPayments.length));
    }
  };

  const totals = useMemo(() => {
    return allPayments.reduce((acc, p) => {
      if (String(p.status).toLowerCase() === 'paid' || String(p.status).toLowerCase() === 'success') {
        acc.paid += p.amount;
      }
      return acc;
    }, { total: 0, paid: 0 });
  }, [allPayments]);

  if (loading && allPayments.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Skeleton width="100%" height={240} />
        <View style={{ padding: 20 }}>
          <Skeleton width="100%" height={80} count={5} style={{ marginBottom: 12, borderRadius: 16 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={visiblePayments}
        keyExtractor={(item, index) => item.id || String(index)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={colors.gradientHero}
              style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 64 : 48 }]}
            >
              <Text style={styles.headerTitle}>Transaction History</Text>
              <Text style={styles.headerSub}>Overview of your society payments</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{formatCurrency(totals.paid)}</Text>
                  <Text style={styles.statLabel}>Total Paid</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{allPayments.length}</Text>
                  <Text style={styles.statLabel}>Total Txns</Text>
                </View>
              </View>
            </LinearGradient>
            
            <View style={styles.filterSection}>
               <View style={[styles.filterBar, { backgroundColor: colors.surfaceAlt }]}>
                  {FILTERS.map(f => {
                    const isActive = filter === f;
                    return (
                      <TouchableOpacity 
                        key={f} 
                        style={[styles.filterTab, isActive && { backgroundColor: colors.surface }]}
                        onPress={() => {
                          setFilter(f);
                          setVisibleCount(PAGE_SIZE);
                        }}
                      >
                        <Text style={[styles.filterText, { color: isActive ? colors.primary : colors.textMuted }]}>
                          {f}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
               </View>
            </View>

            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
                {filter === 'All' ? 'Recent Activity' : `${filter} Payments`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <PaymentRow
              item={item}
              isLast={index === visiblePayments.length - 1}
              colors={colors}
              onPress={() => navigation.navigate('Receipt', { orderId: item.orderId, payment: item })}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>📜</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No transactions found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>There are no {filter.toLowerCase()} payments to display.</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
               <Skeleton width={100} height={20} />
            </View>
          ) : visiblePayments.length > 0 ? (
            <Text style={[styles.endText, { color: colors.textMuted }]}>End of history</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -24,
    zIndex: 20,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    ...shadows.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    marginTop: 32,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  payItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  payIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payInfo: {
    flex: 1,
    marginLeft: 16,
  },
  payTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  payDate: {
    fontSize: 12,
    marginTop: 2,
  },
  payRight: {
    alignItems: 'flex-end',
  },
  payAmt: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  endText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 32,
  }
});
