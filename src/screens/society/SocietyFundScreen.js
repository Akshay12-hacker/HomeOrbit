import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { shadows, spacing, radius } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Card, Skeleton, ErrorRetry } from '../../components/ui';
import { getSocietyFund, getExpenseHistory } from '../../services';
import { useAsync, useAuth } from '../../hooks';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SKELETON LOADER FOR SUMMARY
const FundSummarySkeleton = ({ colors }) => (
  <View style={styles.summaryCardSkeleton}>
    <View style={styles.summaryTop}>
      <View>
        <Skeleton width={120} height={12} style={{ marginBottom: 8 }} />
        <Skeleton width={180} height={32} />
      </View>
      <Skeleton width={80} height={24} borderRadius={8} />
    </View>
    <Skeleton width="100%" height={6} style={{ marginTop: 24, marginBottom: 24 }} />
    <View style={styles.statsGrid}>
      <View>
        <Skeleton width={60} height={10} style={{ marginBottom: 4 }} />
        <Skeleton width={100} height={18} />
      </View>
      <View style={styles.statDiv} />
      <View>
        <Skeleton width={60} height={10} style={{ marginBottom: 4 }} />
        <Skeleton width={100} height={18} />
      </View>
    </View>
  </View>
);

// SKELETON LOADER FOR HISTORY ITEM
const HistorySkeleton = () => (
  <View style={styles.expItem}>
    <Skeleton width={44} height={44} borderRadius={14} />
    <View style={{ flex: 1, marginLeft: 16 }}>
      <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={10} />
    </View>
    <Skeleton width={80} height={20} />
  </View>
);

// UTILIZATION ITEM COMPONENT
const UtilizationItem = ({ item, isLast, colors, isDark, isAdmin, onEdit }) => (
  <View style={[styles.expItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
    <View style={[styles.expIcon, { backgroundColor: isDark ? 'rgba(245,166,35,0.1)' : 'rgba(245,166,35,0.05)' }]}>
      <Text style={{ fontSize: 18 }}>
        {item.mode === 1 ? '💵' : item.mode === 2 ? '📱' : item.mode === 3 ? '🏦' : item.mode === 4 ? '📝' : '📊'}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.expRemark, { color: colors.textPrimary }]}>{item.remark}</Text>
      <Text style={[styles.expDate, { color: colors.textMuted }]}>{formatDate(item.date)}</Text>
    </View>
    <View style={{ alignItems: 'flex-end', gap: 4 }}>
      <Text style={[styles.expAmount, { color: colors.error }]}>-₹{item.amount.toLocaleString('en-IN')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {item.imageUrl && item.imageUrl !== 'abc.png' && (
           <Text style={[styles.billAttached, { color: colors.primary }]}>📎</Text>
        )}
        {isAdmin && (
          <TouchableOpacity onPress={() => onEdit?.(item)} style={styles.editBtn}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary }}>EDIT</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

export default function SocietyFundScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { selectedProfile, user } = useAuth();
  const isAdmin = selectedProfile?.role === 'admin' || user?.roles?.includes('Admin');
  
  const { data: fund, loading: fundLoading, error: fundError, refresh: refreshFund } = useAsync(getSocietyFund, []);
  
  // PAGINATION STATE
  const [historyItems, setHistoryItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (pageNumber = 1, shouldAppend = false) => {
    setHistLoading(true);
    setHistError(null);
    
    // Clear items if we're not appending to show skeleton loaders for a full refresh
    if (!shouldAppend) {
      setHistoryItems([]);
    }

    try {
      // Use pageSize: 6 as requested
      const result = await getExpenseHistory(null, { pageNumber, pageSize: 6 });
      if (shouldAppend) {
        setHistoryItems(prev => [...prev, ...result.items]);
      } else {
        setHistoryItems(result.items);
      }
      setTotalCount(result.totalCount);
      setPage(result.pageNumber);
    } catch (err) {
      setHistError(err.message);
    } finally {
      setHistLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Add a small delay to ensure backend has processed recent updates
      await new Promise(resolve => setTimeout(resolve, 500));
      await Promise.all([refreshFund(), fetchHistory(1, false)]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFund, fetchHistory]);

  // REFRESH ON FOCUS
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const loadMore = () => {
    if (!histLoading && historyItems.length < totalCount) {
      fetchHistory(page + 1, true);
    }
  };

  const handleEdit = (expense) => {
    navigation.navigate('AddExpense', { expense });
  };

  if (fundError && !refreshing && historyItems.length === 0) return <ErrorRetry message={fundError} onRetry={onRefresh} />;

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

           {fundLoading && !refreshing && historyItems.length === 0 ? (
             <FundSummarySkeleton colors={colors} />
           ) : (
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
           )}
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing.lg }}>
          {/* ADMIN ACTION SECTION */}
          {isAdmin && (
            <View style={styles.adminSection}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.addTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <View style={[styles.addIcon, { backgroundColor: colors.primary }]}>
                   <Text style={{ color: '#fff', fontSize: 20 }}>+</Text>
                </View>
                <Text style={[styles.addText, { color: colors.textPrimary }]}>
                  Record Utilization
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* HISTORY SECTION */}
          <View style={styles.historyHeader}>
             <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Utilization History ({totalCount})</Text>
          </View>

          {historyItems.length > 0 ? (
            <View>
               <Card noPad style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {historyItems.map((item, index) => (
                    <UtilizationItem 
                      key={`${item.id}-${index}`} 
                      item={item} 
                      isLast={index === historyItems.length - 1} 
                      colors={colors}
                      isDark={isDark}
                      isAdmin={isAdmin}
                      onEdit={handleEdit}
                    />
                  ))}
                  {histLoading && <HistorySkeleton />}
               </Card>
               
               {historyItems.length < totalCount && (
                 <TouchableOpacity 
                  onPress={loadMore} 
                  disabled={histLoading}
                  style={[styles.loadMoreBtn, { borderColor: colors.border }]}
                 >
                   <Text style={{ color: colors.primary, fontWeight: '700' }}>
                     {histLoading ? 'Loading...' : 'Load More Utilization'}
                   </Text>
                 </TouchableOpacity>
               )}
            </View>
          ) : histLoading ? (
            <Card noPad style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
               {[1,2,3,4,5,6].map(i => <HistorySkeleton key={i} />)}
            </Card>
          ) : (
             <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>🍃</Text>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No utilization yet</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>The society fund utilization records will appear here.</Text>
             </View>
          )}
          
          {histError && <Text style={[styles.errorText, { color: colors.error }]}>{histError}</Text>}
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
  summaryCardSkeleton: { marginTop: 32, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
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
  historyHeader: { marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  historyCard: { overflow: 'hidden', borderRadius: 24, borderWidth: 1, ...shadows.sm },
  expItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  expIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  expRemark: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  expDate: { fontSize: 11, fontWeight: '600' },
  expAmount: { fontSize: 16, fontWeight: '900' },
  billAttached: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  editBtn: { padding: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  empty: { alignItems: 'center', paddingVertical: 64, borderRadius: 24, borderWidth: 1, ...shadows.sm },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptySub: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  loadMoreBtn: { marginTop: 16, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  errorText: { marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: '600' },
});
