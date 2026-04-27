import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Skeleton, SkeletonCard, Badge, SectionHeader, ErrorRetry } from '../components/ui';
import { getDashboard } from '../services/api';
import { useAsync, useResponsive } from '../hooks';

const HomeSkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
      {[1,2].map(i => <View key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 18, ...SHADOW.card }}><Skeleton width={80} height={12} style={{ marginBottom: 8 }} /><Skeleton width={100} height={28} style={{ marginBottom: 12 }} /><Skeleton width={90} height={38} borderRadius={10} /></View>)}
    </View>
    <Skeleton width={160} height={13} style={{ marginBottom: 12 }} />
    <View style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, ...SHADOW.card }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}><Skeleton width={100} height={13} /><Skeleton width={80} height={13} /></View>
      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 8 }} />
      <View style={{ flexDirection: 'row', gap: 20 }}><Skeleton width={60} height={30} /><Skeleton width={60} height={30} /><Skeleton width={60} height={30} /></View>
    </View>
    <Skeleton width={140} height={12} style={{ marginBottom: 12 }} />
    <SkeletonCard /><SkeletonCard /><SkeletonCard />
  </View>
);

const PaymentRow = ({ item, isLast, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={item.status === 'Paid' ? 0.75 : 1} style={[styles.payRow, !isLast && styles.payRowBorder]}>
    <View style={[styles.payIcon, { backgroundColor: item.status === 'Paid' ? COLORS.greenPale : COLORS.orangePale }]}>
      <Text style={{ fontSize: 16 }}>{item.status === 'Paid' ? '✅' : '⏳'}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.payDesc}>{item.desc}</Text>
      <Text style={styles.payDate}>{item.date}</Text>
    </View>
    <View style={{ alignItems: 'flex-end', gap: 4 }}>
      <Text style={styles.payAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
      <Badge label={item.status} type={item.status === 'Paid' ? 'paid' : 'pending'} />
    </View>
    {item.status === 'Paid' && <Text style={{ color: COLORS.textMuted, fontSize: 16, marginLeft: 4 }}>›</Text>}
  </TouchableOpacity>
);

// Society Fund Card
const FundCard = ({ fund, onPress }) => {
  const pct = Math.round((fund.totalBalance / fund.collected) * 100);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Card style={styles.fundCard}>
      <View style={styles.fundHeader}>
        <View>
          <Text style={styles.fundLabel}>SOCIETY FUND</Text>
          <Text style={styles.fundBalance}>₹{fund.totalBalance.toLocaleString('en-IN')}</Text>
          <Text style={styles.fundSub}>Available balance</Text>
        </View>
        <View style={styles.fundIcon}>
          <Text style={{ fontSize: 26 }}>🏦</Text>
        </View>
      </View>
      {/* Progress bar */}
      <View style={styles.fundBarBg}>
        <View style={[styles.fundBarFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.fundStats}>
        <View style={styles.fundStat}>
          <Text style={styles.fundStatLabel}>Collected</Text>
          <Text style={[styles.fundStatVal, { color: COLORS.green }]}>₹{fund.collected.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.fundStat, { borderLeftWidth: 1, borderLeftColor: COLORS.border, borderRightWidth: 1, borderRightColor: COLORS.border }]}>
          <Text style={styles.fundStatLabel}>Spent</Text>
          <Text style={[styles.fundStatVal, { color: COLORS.red }]}>₹{fund.spent.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.fundStat}>
          <Text style={styles.fundStatLabel}>Balance %</Text>
          <Text style={[styles.fundStatVal, { color: COLORS.blue }]}>{pct}%</Text>
        </View>
      </View>
      {fund.lastExpense && (
        <View style={styles.lastExpense}>
          <Text style={{ fontSize: 14 }}>📋</Text>
          <Text style={styles.lastExpenseText}>Last: {fund.lastExpense.remark} — ₹{fund.lastExpense.amount.toLocaleString('en-IN')}</Text>
        </View>
      )}
      </Card>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation, route }) {
  const society = route.params?.society?.name || 'Sunrise Apartments';
  const role = route.params?.role || 'user';
  const { data, loading, error, refresh } = useAsync(getDashboard, []);
  const [refreshing, setRefreshing] = React.useState(false);
  const { contentMaxWidth, gutter, isPhone } = useResponsive();

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false); };

  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorRetry message={error} onRetry={refresh} />;
  const d = data;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.surface }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.hero}>
        <View style={[styles.heroInner, { maxWidth: contentMaxWidth, paddingHorizontal: gutter }]}>
        <View style={[styles.heroTop, !isPhone && styles.heroTopWide]}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()}, 👋</Text>
            <Text style={styles.userName}>{d.user.name}</Text>
            <Text style={styles.societyInfo}>{society} · {d.plotInfo.plotNo} ({d.plotInfo.type})</Text>
          </View>
          {role === 'admin' && (
            <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>👑 Admin</Text></View>
          )}
        </View>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: gutter, marginTop: -SPACING.lg }}>
      <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
        {/* Due + Last Payment */}
        <View style={[styles.heroCardsRow, !isPhone && styles.heroCardsRowWide]}>
          <TouchableOpacity style={[styles.dueCard, !isPhone && styles.heroCardWide, SHADOW.strong]} onPress={() => navigation.navigate('Maintenance')} activeOpacity={0.9}>
            <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.dueGrad}>
              <Text style={styles.dueLabel}>MAINTENANCE DUE</Text>
              <Text style={styles.dueAmount}>₹{d.maintenanceDue.amount.toLocaleString('en-IN')}</Text>
              <Text style={styles.dueDueDate}>Due by {d.maintenanceDue.dueDate}</Text>
              <TouchableOpacity style={styles.payNowBtn} onPress={() => navigation.navigate('Maintenance')} activeOpacity={0.85}>
                <Text style={styles.payNowText}>Pay Now →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.histCard, !isPhone && styles.heroCardWide, SHADOW.card]} onPress={() => navigation.navigate('History')} activeOpacity={0.9}>
            <Text style={styles.histLabel}>LAST PAYMENT</Text>
            <Text style={styles.histAmount}>₹{d.lastPayment.amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.histDate}>{d.lastPayment.date}</Text>
            <View style={styles.paidBadge}><Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.green }}>✓ Paid</Text></View>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Society Fund */}
        <SectionHeader
          title="Society Fund"
          action={role === 'admin' ? 'Manage →' : 'View History →'}
          onAction={() => navigation.navigate(role === 'admin' ? 'AdminExpense' : 'SocietyFund')}
        />
        <FundCard
          fund={d.societyFund}
          onPress={() => navigation.navigate('SocietyFund')}
        />

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={[styles.quickRow, !isPhone && styles.quickRowWide]}>
          {[
            { icon: '🚪', label: 'Gate Pass' },
            { icon: '📅', label: 'Book Facility' },
            { icon: '🆘', label: 'SOS', danger: true },
          ].map((a) => (
            <TouchableOpacity key={a.label} activeOpacity={0.8} style={[styles.quickBtn, a.danger && styles.quickBtnDanger]}>
              <Text style={{ fontSize: 22 }}>{a.icon}</Text>
              <Text style={[styles.quickLabel, a.danger && { color: '#fff' }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements */}
        <SectionHeader title="Announcements" />
        <Card noPad style={{ marginBottom: SPACING.base, overflow: 'hidden' }}>
          {d.announcements.map((a, i) => (
            <React.Fragment key={a.id}>
              <View style={styles.announcement}>
                <Text style={{ fontSize: 16 }}>{a.type === 'event' ? '🎉' : a.type === 'alert' ? '⚠️' : 'ℹ️'}</Text>
                <Text style={styles.announcementText}>{a.text}</Text>
              </View>
              {i < d.announcements.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </Card>

        {/* Recent Payments */}
        <SectionHeader title="Recent Payments" action="See All" onAction={() => navigation.navigate('History')} />
        <Card noPad style={{ overflow: 'hidden' }}>
          {d.recentPayments.map((p, i) => (
            <PaymentRow key={p.id} item={p} isLast={i === d.recentPayments.length - 1}
              onPress={() => p.status === 'Paid' && p.txnId && navigation.navigate('Receipt', { payment: p })} />
          ))}
        </Card>
        <View style={{ height: 32 }} />
      </View>
      </View>
    </ScrollView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning'; if (h < 17) return 'afternoon'; return 'evening';
}

const styles = StyleSheet.create({
  hero: { paddingTop: 60, paddingBottom: 48 },
  heroInner: { width: '100%', alignSelf: 'center' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTopWide: { alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  societyInfo: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  adminBadge: { backgroundColor: 'rgba(245,166,35,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(245,166,35,0.5)' },
  adminBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.accent },
  content: { width: '100%', alignSelf: 'center' },
  heroCardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.lg },
  heroCardsRowWide: { gap: 16 },
  heroCardWide: { minWidth: 280 },
  dueCard: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  dueGrad: { padding: SPACING.base, minHeight: 170 },
  dueLabel: { fontSize: 10, fontWeight: '800', color: COLORS.orange, letterSpacing: 0.8, marginBottom: 4 },
  dueAmount: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  dueDueDate: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 12 },
  payNowBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14, alignSelf: 'flex-start' },
  payNowText: { fontSize: 13, fontWeight: '800', color: COLORS.navy },
  histCard: { flex: 1, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, minHeight: 170 },
  histLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 4 },
  histAmount: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  histDate: { fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
  paidBadge: { backgroundColor: COLORS.greenPale, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  viewAllBtn: { borderWidth: 1.5, borderColor: COLORS.blue, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  viewAllText: { fontSize: 12, fontWeight: '700', color: COLORS.blue },
  // Fund card
  fundCard: { marginBottom: SPACING.base, padding: 0, overflow: 'hidden' },
  fundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.base, paddingBottom: SPACING.sm },
  fundLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  fundBalance: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
  fundSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  fundIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  fundBarBg: { height: 8, backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, borderRadius: 4, marginBottom: SPACING.sm },
  fundBarFill: { height: 8, backgroundColor: COLORS.blue, borderRadius: 4 },
  fundStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, flexWrap: 'wrap' },
  fundStat: { flex: 1, padding: 12, alignItems: 'center' },
  fundStatLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginBottom: 3 },
  fundStatVal: { fontSize: 14, fontWeight: '800' },
  lastExpense: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  lastExpenseText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.base, flexWrap: 'wrap' },
  quickRowWide: { gap: 12 },
  quickBtn: { flex: 1, minWidth: 120, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
  quickBtnDanger: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  quickLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  announcement: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.base, paddingVertical: 13 },
  announcementText: { fontSize: 14, color: COLORS.textPrimary, flex: 1, lineHeight: 20 },
  rowDivider: { height: 1, backgroundColor: COLORS.borderLight, marginHorizontal: SPACING.base },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACING.base, flexWrap: 'wrap' },
  payRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  payIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  payDesc: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  payDate: { fontSize: 12, color: COLORS.textMuted },
  payAmount: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
});
