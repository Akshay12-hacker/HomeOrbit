import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, FlatList, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Skeleton, SkeletonCard, Badge, SectionHeader, ErrorRetry } from '../components/ui';
import {
  clearDashboardCache,
  getDashboard,
  getDashboardPlotDetails,
  getDashboardRecentPayments,
  getDashboardSocietyFund,
} from '../services';
import { useAsync, useResponsive } from '../hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const HomeSkeleton = () => (
  <View style={{ padding: SPACING.lg }}>
    <View style={{ height: 200, backgroundColor: COLORS.navyDark, borderRadius: RADIUS.lg, marginBottom: 20, padding: 20 }}>
      <Skeleton width={120} height={12} style={{ marginBottom: 8 }} />
      <Skeleton width={180} height={28} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={100} borderRadius={RADIUS.lg} />
    </View>
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
      {[1, 2].map(i => (
        <View key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 18, ...SHADOW.card }}>
          <Skeleton width={80} height={12} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={28} style={{ marginBottom: 12 }} />
          <Skeleton width={90} height={38} borderRadius={10} />
        </View>
      ))}
    </View>
    <Skeleton width={160} height={13} style={{ marginBottom: 12 }} />
    <View style={{ backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, ...SHADOW.card }}>
      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 8 }} />
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <Skeleton width={60} height={30} />
        <Skeleton width={60} height={30} />
        <Skeleton width={60} height={30} />
      </View>
    </View>
    <Skeleton width={140} height={12} style={{ marginBottom: 12 }} />
    <SkeletonCard /><SkeletonCard /><SkeletonCard />
  </View>
);

// ─── Plot Card (swipeable) ─────────────────────────────────────────────────────
const CARD_GRADIENTS = [
  ['#1A3A8F', '#2E5FC9'],   // navy blue
  ['#5B2D8E', '#8B4DBF'],   // purple
  ['#0E6B5E', '#1AA08A'],   // teal
  ['#8B3A1A', '#C75C2B'],   // rust
  ['#1A5C2E', '#2E8B4A'],   // forest green
];

const PlotCard = React.memo(({ plot, index, isActive, cardWidth }) => {
  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const hasDue = plot.maintenanceDue?.amount > 0;

  return (
    <View style={[pc.card, { width: cardWidth }]}>
      <LinearGradient colors={grad} style={pc.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Top row */}
        <View style={pc.topRow}>
          <View>
            <Text style={pc.societyName} numberOfLines={1}>{plot.societyName}</Text>
            <Text style={pc.plotNo}>Plot {plot.plotNo}</Text>
          </View>
          <View style={[pc.typePill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={pc.typeText}>{plot.type}</Text>
          </View>
        </View>

        {/* Area */}
        <Text style={pc.area}>{plot.area}</Text>

        {/* Bottom row */}
        <View style={pc.bottomRow}>
          <View>
            <Text style={pc.dueLabel}>MAINTENANCE DUE</Text>
            <Text style={[pc.dueAmount, hasDue && { color: '#FFD080' }]}>
              {hasDue ? `₹${plot.maintenanceDue.amount.toLocaleString('en-IN')}` : 'All Clear ✓'}
            </Text>
            {hasDue && <Text style={pc.dueDate}>Due {plot.maintenanceDue.dueDate}</Text>}
          </View>
          {isActive && (
            <View style={pc.activeIndicator}>
              <Text style={pc.activeIndicatorText}>●</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
});

const pc = StyleSheet.create({
  card: { paddingHorizontal: 8 },
  gradient: { borderRadius: RADIUS.xl, padding: 14, minHeight: 118 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  societyName: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.3, maxWidth: 180, marginBottom: 1 },
  plotNo: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  typePill: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  area: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  dueLabel: { fontSize: 8, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 2 },
  dueAmount: { fontSize: 16, fontWeight: '900', color: '#fff' },
  dueDate: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  activeIndicator: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFD080' },
  activeIndicatorText: { color: '#FFD080', fontSize: 8 },
});

// ─── Plot Switcher with dot pagination ────────────────────────────────────────
const PlotSwitcher = ({ plots, activePlot, onPlotChange, cardWidth }) => {
  const flatRef = React.useRef(null);

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (idx !== activePlot && idx >= 0 && idx < plots.length) {
      onPlotChange(idx);
    }
  };

  return (
    <View>
      <FlatList
  ref={flatRef}
  data={plots}
  horizontal
  showsHorizontalScrollIndicator={false}

  // 🔥 PERFORMANCE
  initialNumToRender={2}
  maxToRenderPerBatch={3}
  windowSize={5}
  removeClippedSubviews

  // 🔥 SCROLL OPTIMIZATION
  getItemLayout={(data, index) => ({
    length: cardWidth,
    offset: cardWidth * index,
    index,
  })}

  keyExtractor={(item) => String(item.id)}

  snapToInterval={cardWidth}
  snapToAlignment="center"
  decelerationRate="fast"

  onMomentumScrollEnd={handleScroll}

  contentContainerStyle={{
    paddingHorizontal: (SCREEN_WIDTH - cardWidth) / 2 - 8
  }}

  renderItem={({ item, index }) => (
    <PlotCard
      plot={item}
      index={index}
      isActive={index === activePlot}
      cardWidth={cardWidth}
    />
  )}
/>
      {/* Dot indicators */}
      {plots.length > 1 && (
        <View style={sw.dots}>
          {plots.map((_, i) => (
            <View
              key={i}
              style={[sw.dot, i === activePlot && sw.dotActive]}
            />
          ))}
        </View>
      )}
      {plots.length > 1 && (
        <Text style={sw.swipeHint}>swipe to switch plot</Text>
      )}
    </View>
  );
};

const sw = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 18, borderRadius: 3, backgroundColor: COLORS.accent },
  swipeHint: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 6 },
});

// ─── Payment Row ───────────────────────────────────────────────────────────────
const PaymentRow = React.memo(({ item, isLast, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={item.status === 'Paid' ? 0.75 : 1}
    style={[styles.payRow, !isLast && styles.payRowBorder]}
  >
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
    {item.status === 'Paid' && (
      <Text style={{ color: COLORS.textMuted, fontSize: 16, marginLeft: 4 }}>›</Text>
    )}
  </TouchableOpacity>
));

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const adminMenuItems = [
  { label: 'Subscription', route: 'Subscription' },
  { label: 'Collect Maintenance', route: 'CollectMaintenance' },
  { label: 'Create New Maintenance', route: 'CreateMaintenance' },
  { label: 'Approve/Reject Members', route: 'ApproveReject' },
  { label: 'Create Notice', route: 'CreateNotice' },
];

const userMenuItems = [
  { label: 'Select Societies', route: 'Society' },
];

const Sidebar = ({ visible, role, onClose, onSelect }) => {
  const items = role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.sidebarRoot}>
        <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sidebarPanel}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarLogo}>
              <Text style={styles.sidebarLogoText}>H</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sidebarTitle}>Home Orbit</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.sidebarClose} activeOpacity={0.75}>
              <Text style={styles.sidebarCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sidebarList}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={item.route ? 0.75 : 1}
                onPress={() => item.route && onSelect(item)}
                style={[
                  styles.sidebarItem,
                  index < items.length - 1 && styles.sidebarItemBorder,
                  !item.route && styles.sidebarItemDisabled,
                ]}
              >
                <Text style={[styles.sidebarItemText, !item.route && styles.sidebarItemTextDisabled]}>
                  {item.label}
                </Text>
                <Text style={[styles.sidebarChevron, !item.route && styles.sidebarItemTextDisabled]}>
                  {item.route ? '›' : 'Soon'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Society Fund Card ─────────────────────────────────────────────────────────
const FundCard = ({ fund, onPress }) => {
  const pct = fund.collected > 0 ? Math.round((fund.totalBalance / fund.collected) * 100) : 0;
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
        <View style={styles.fundBarBg}>
          <View style={[styles.fundBarFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.fundStats}>
          <View style={styles.fundStat}>
            <Text style={styles.fundStatLabel}>Collected</Text>
            <Text style={[styles.fundStatVal, { color: COLORS.green }]}>
              ₹{fund.collected.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.fundStat, { borderLeftWidth: 1, borderLeftColor: COLORS.border, borderRightWidth: 1, borderRightColor: COLORS.border }]}>
            <Text style={styles.fundStatLabel}>Spent</Text>
            <Text style={[styles.fundStatVal, { color: COLORS.red }]}>
              ₹{fund.spent.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.fundStat}>
            <Text style={styles.fundStatLabel}>Balance %</Text>
            <Text style={[styles.fundStatVal, { color: COLORS.blue }]}>{pct}%</Text>
          </View>
        </View>
        {fund.lastExpense && (
          <View style={styles.lastExpense}>
            <Text style={{ fontSize: 14 }}>📋</Text>
            <Text style={styles.lastExpenseText}>
              Last: {fund.lastExpense.remark} — ₹{fund.lastExpense.amount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

// ─── Per-Plot Stats Row ────────────────────────────────────────────────────────
// Shows due card + last payment card for whichever plot is currently active
const PlotStatsRow = ({ plot, onPayPress, onHistoryPress, isPhone, heroCardWideStyle }) => {
  const hasDue = plot?.maintenanceDue?.amount > 0;
  const hasLastPayment = plot?.lastPayment?.status === 'Paid' && plot?.lastPayment?.amount > 0;

  return (
    <View style={[styles.heroCardsRow, !isPhone && styles.heroCardsRowWide]}>
      {/* Due card */}
      <TouchableOpacity
        style={[styles.dueCard, !isPhone && heroCardWideStyle, SHADOW.strong]}
        onPress={onPayPress}
        activeOpacity={0.9}
      >
        <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.dueGrad}>
          <Text style={styles.dueLabel}>MAINTENANCE DUE</Text>
          <Text style={styles.dueAmount}>
            {hasDue 
            ? `₹${plot.maintenanceDue?.amount?.toLocaleString?.('en-IN') || 0}`:'₹0'}
          </Text>
          <Text style={styles.dueDueDate}>
            {hasDue ? `Due by ${plot.maintenanceDue.dueDate}` : 'All dues cleared 🎉'}
          </Text>
          <TouchableOpacity style={styles.payNowBtn} onPress={onPayPress} activeOpacity={0.85}>
            <Text style={styles.payNowText}>{hasDue ? 'Pay Now →' : 'View History →'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>

      {/* Last payment card */}
      <TouchableOpacity
        style={[styles.histCard, !isPhone && heroCardWideStyle, SHADOW.card]}
        onPress={onHistoryPress}
        activeOpacity={0.9}
      >
        <Text style={styles.histLabel}>LAST PAYMENT</Text>
        <Text style={styles.histAmount}>
          {hasLastPayment ? `₹${plot.lastPayment.amount.toLocaleString('en-IN')}` : 'No payments'}
        </Text>
        <Text style={styles.histDate}>
          {hasLastPayment ? plot.lastPayment.date : 'Payment history is empty'}
        </Text>
        {hasLastPayment && (
          <View style={styles.paidBadge}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.green }}>✓ Paid</Text>
          </View>
        )}
        <TouchableOpacity style={styles.viewAllBtn} onPress={onHistoryPress}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation, route }) {
  const role = route.params?.role || 'user';
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activePlotIdx, setActivePlotIdx] = React.useState(0);
  const { data, loading, error, refresh } = useAsync(getDashboard, []);
  const [refreshing, setRefreshing] = React.useState(false);
  const [plotDetailsById, setPlotDetailsById] = React.useState({});
  const [fundState, setFundState] = React.useState({ visible: true, data: null, loading: false });
  const [recentState, setRecentState] = React.useState({ visible: false, byPlotId: {}, loadingPlotId: null });
  const { contentMaxWidth, gutter, isPhone } = useResponsive();

  // Animate stats fade on plot switch
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handlePlotChange = React.useCallback((idx) => {

  if (idx === activePlotIdx) return;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActivePlotIdx(idx);
  },[activePlotIdx]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.75}
          style={styles.headerLogo}
        >
          <Text style={styles.headerLogoText}>H</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    clearDashboardCache();
    setPlotDetailsById({});
    setFundState((current) => ({ ...current, visible: true, data: null }));
    setRecentState((current) => ({ ...current, byPlotId: {} }));
    await refresh();
    setRefreshing(false);
  };

  const loadPlotDetails = React.useCallback(async (plot, forceRefresh = false) => {
    if (!plot?.id) return;
    if (!forceRefresh && plotDetailsById[plot.id]) return;

    try {
      const details = await getDashboardPlotDetails(plot, { forceRefresh });
      setPlotDetailsById((current) => ({
        ...current,
        [plot.id]: details,
      }));
    } catch (_error) {
      setPlotDetailsById((current) => ({
        ...current,
        [plot.id]: {},
      }));
    }
  }, [plotDetailsById]);

  const loadSocietyFund = React.useCallback(async (forceRefresh = false) => {
    if (!data?.society?.id || fundState.loading) return;
    if (!forceRefresh && fundState.data) return;

    setFundState((current) => ({ ...current, loading: true }));
    try {
      const fund = await getDashboardSocietyFund(data.society.id, { forceRefresh });
      setFundState((current) => ({ ...current, data: fund, loading: false }));
    } catch (_error) {
      setFundState((current) => ({ ...current, loading: false }));
    }
  }, [data?.society?.id, fundState.data, fundState.loading]);

  const loadRecentPayments = React.useCallback(async (plot, forceRefresh = false) => {
    if (!plot?.id) return;
    if (!forceRefresh && recentState.byPlotId[plot.id]) return;

    setRecentState((current) => ({ ...current, loadingPlotId: plot.id }));
    try {
      const payments = await getDashboardRecentPayments(plot, { forceRefresh });
      setRecentState((current) => ({
        ...current,
        byPlotId: {
          ...current.byPlotId,
          [plot.id]: payments,
        },
        loadingPlotId: null,
      }));
    } catch (_error) {
      setRecentState((current) => ({
        ...current,
        byPlotId: {
          ...current.byPlotId,
          [plot.id]: [],
        },
        loadingPlotId: null,
      }));
    }
  }, [recentState.byPlotId]);

  const handleDashboardScroll = React.useCallback((event) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 40) {
      setFundState((current) => current.visible ? current : { ...current, visible: true });
    }
    if (y > 360) {
      setRecentState((current) => current.visible ? current : { ...current, visible: true });
    }
  }, []);

  const navigateFromSidebar = (item) => {
    setSidebarOpen(false);
    if (item.route === 'Society') {
      const rootNavigation = navigation.getParent()?.getParent?.() || navigation.getParent?.();
      if (rootNavigation) {
        rootNavigation.navigate('Society', { role });
      } else {
        navigation.navigate('Society', { role });
      }
      return;
    }
    navigation.navigate(item.route);
  };

  const basePlots = React.useMemo(()=> data?.plots || [], [data]);
  const plots = React.useMemo(
    () => basePlots.map((plot) => ({
      ...plot,
      ...(plotDetailsById[plot.id] || {}),
    })),
    [basePlots, plotDetailsById]
  );

  const activePlot = React.useMemo(
    () => plots[Math.min(activePlotIdx, plots.length - 1)] || {},
    [plots, activePlotIdx]
  );
  const activeBasePlot = React.useMemo(
    () => basePlots[Math.min(activePlotIdx, basePlots.length - 1)] || {},
    [basePlots, activePlotIdx]
  );

  React.useEffect(() => {
    loadPlotDetails(activeBasePlot);
  }, [activeBasePlot?.id, loadPlotDetails]);

  React.useEffect(() => {
    if (fundState.visible) loadSocietyFund();
  }, [fundState.visible, loadSocietyFund]);

  React.useEffect(() => {
    if (recentState.visible) loadRecentPayments(activeBasePlot);
  }, [recentState.visible, activeBasePlot?.id, loadRecentPayments]);

  const userName = data?.user?.name || '-';

  // Society fund — shared across society, not per-plot
  const societyFund = fundState.data || data?.societyFund || { 
    totalBalance: 0, 
    collected: 0, 
    spent: 0, 
    expenses: [] 
  };
  const showFundSkeleton = fundState.loading && !fundState.data;
  const announcements = Array.isArray(data?.announcements) ? data.announcements : [];
  const recentPayments = Array.isArray(recentState.byPlotId[activePlot?.id])
    ? recentState.byPlotId[activePlot.id]
    : [];

  if (loading) return (
    <>
      <Sidebar visible={sidebarOpen} role={role} onClose={() => setSidebarOpen(false)} onSelect={navigateFromSidebar} />
      <HomeSkeleton />
    </>
  );

  if (error) return (
    <>
      <Sidebar visible={sidebarOpen} role={role} onClose={() => setSidebarOpen(false)} onSelect={navigateFromSidebar} />
      <ErrorRetry message={error} onRetry={refresh} />
    </>
  );

  if (!data) return (
    <>
      <Sidebar visible={sidebarOpen} role={role} onClose={() => setSidebarOpen(false)} onSelect={navigateFromSidebar} />
      <ErrorRetry message="Dashboard data is not available." onRetry={refresh} />
    </>
  );


  const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);

  return (
    <>
      <Sidebar
        visible={sidebarOpen}
        role={role}
        onClose={() => setSidebarOpen(false)}
        onSelect={navigateFromSidebar}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.surface }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleDashboardScroll}
        scrollEventThrottle={120}
      >
        {/* ── Hero gradient with plot cards ── */}
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.hero}>
          <View style={[styles.heroInner, { maxWidth: contentMaxWidth, paddingHorizontal: gutter }]}>
            {/* Greeting */}
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.greeting}>Good {getGreeting()}, 👋</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
          </View>

          {/* Plot card switcher — full bleed for swipe feel */}
          <View style={{ marginTop: 20, marginBottom: 4 }}>
          {plots.length > 0 && (
            <PlotSwitcher
              plots={plots}
              activePlot={activePlotIdx}
              onPlotChange={handlePlotChange}
              cardWidth={CARD_WIDTH}
            />
          )}
          </View>
        </LinearGradient>

        {/* ── Body ── */}
        <View style={{ paddingHorizontal: gutter, marginTop: -SPACING.lg }}>
          <View style={[styles.content, { maxWidth: contentMaxWidth }]}>

            {/* Per-plot due + last payment — animated fade on switch */}
          {activePlot && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <PlotStatsRow
                plot={activePlot}
                isPhone={isPhone}
                heroCardWideStyle={styles.heroCardWide}
                onPayPress={() => navigation.navigate('Maintenance', { plotId: activePlot?.id, plotNo: activePlot?.plotNo })}
                onHistoryPress={() => navigation.navigate('History', { plotId: activePlot?.id })}
              />
            </Animated.View>
          )}

            {/* Society Fund — shared, not per-plot */}
            <SectionHeader
              title="Society Fund"
              action={role === 'admin' ? 'Manage →' : 'View History →'}
              onAction={() => navigation.navigate(role === 'admin' ? 'AdminExpense' : 'SocietyFund')}
            />
            {showFundSkeleton ? (
              <Card style={styles.fundLoadingCard}>
                <Skeleton width={90} height={10} style={{ marginBottom: 8 }} />
                <Skeleton width={130} height={26} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={6} borderRadius={3} style={{ marginBottom: 12 }} />
                <View style={styles.fundLoadingStats}>
                  <Skeleton width={58} height={28} />
                  <Skeleton width={58} height={28} />
                  <Skeleton width={58} height={28} />
                </View>
              </Card>
            ) : (
              <FundCard fund={societyFund} onPress={() => navigation.navigate('SocietyFund')} />
            )}

            {/* Quick Actions */}
            <SectionHeader title="Quick Actions" />
            <View style={[styles.quickRow, !isPhone && styles.quickRowWide]}>
              {[
                { icon: '🚪', label: 'Gate Pass' },
                { icon: '📅', label: 'Book Facility' },
                { icon: '🆘', label: 'SOS', danger: true },
              ].map((a) => (
                <TouchableOpacity
                  key={a.label}
                  activeOpacity={0.8}
                  style={[styles.quickBtn, a.danger && styles.quickBtnDanger]}
                >
                  <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                  <Text style={[styles.quickLabel, a.danger && { color: '#fff' }]}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Announcements */}
            <SectionHeader title="Announcements" />
            {announcements.length === 0 ? (
              <Card style={[styles.emptyCard, { marginBottom: SPACING.base }]}>
                <Text style={styles.emptyTitle}>No announcements</Text>
                <Text style={styles.emptyText}>Society notices will appear here when published.</Text>
              </Card>
            ) : (
              <Card noPad style={{ marginBottom: SPACING.base, overflow: 'hidden' }}>
                {announcements.map((a, i) => (
                  <React.Fragment key={a.id}>
                    <View style={styles.announcement}>
                      <Text style={{ fontSize: 16 }}>
                        {a.type === 'event' ? '🎉' : a.type === 'alert' ? '⚠️' : 'ℹ️'}
                      </Text>
                      <Text style={styles.announcementText}>{a.text}</Text>
                    </View>
                    {i < announcements.length - 1 && <View style={styles.rowDivider} />}
                  </React.Fragment>
                ))}
              </Card>
            )}

            {/* Recent Payments — for active plot */}
            <SectionHeader
              title="Recent Payments"
              action="See All"
              onAction={() => navigation.navigate('History', { plotId: activePlot?.id })}
            />
            {recentPayments?.length > 0 && (
  <Card noPad style={{ overflow: 'hidden' }}>
    {recentPayments.map((p, i) => (
      <PaymentRow
        key={getPaymentRowKey(p, i)}
        item={p}
        isLast={i === recentPayments.length - 1}
        onPress={() =>
          p.status === 'Paid' &&
          p.txnId &&
          navigation.navigate('Receipt', { payment: p })
        }
      />
    ))}
  </Card>
)}
            <View style={{ height: 32 }} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginLeft: 14 },
  headerLogoText: { fontSize: 16, fontWeight: '900', color: COLORS.navy },

  // Sidebar
  sidebarRoot: { flex: 1, flexDirection: 'row' },
  sidebarBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,21,64,0.55)' },
  sidebarPanel: { width: 296, maxWidth: '84%', height: '100%', backgroundColor: COLORS.white, paddingTop: 52, paddingHorizontal: SPACING.base, ...SHADOW.strong },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  sidebarLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  sidebarLogoText: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  sidebarTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  sidebarClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  sidebarCloseText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  sidebarList: { marginTop: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  sidebarItem: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, backgroundColor: COLORS.white },
  sidebarItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  sidebarItemDisabled: { backgroundColor: COLORS.surface },
  sidebarItemText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  sidebarItemTextDisabled: { color: COLORS.textMuted },
  sidebarChevron: { fontSize: 16, fontWeight: '800', color: COLORS.blue },

  // Hero
  hero: { paddingTop: 50, paddingBottom: 16 },
  heroInner: { width: '100%', alignSelf: 'center' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },

  // Content
  content: { width: '100%', alignSelf: 'center' },
  heroCardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.lg },
  heroCardsRowWide: { gap: 16 },
  heroCardWide: { minWidth: 280 },

  // Due card
  dueCard: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  dueGrad: { padding: 14, minHeight: 130 },
  dueLabel: { fontSize: 9, fontWeight: '800', color: COLORS.orange, letterSpacing: 0.8, marginBottom: 3 },
  dueAmount: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  dueDueDate: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 10 },
  payNowBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  payNowText: { fontSize: 12, fontWeight: '800', color: COLORS.navy },

  // History card
  histCard: { flex: 1, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, padding: 14, borderWidth: 1, borderColor: COLORS.border, minHeight: 130 },
  histLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 3 },
  histAmount: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  histDate: { fontSize: 11, color: COLORS.textMuted, marginBottom: 5 },
  paidBadge: { backgroundColor: COLORS.greenPale, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  viewAllBtn: { borderWidth: 1.5, borderColor: COLORS.blue, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  viewAllText: { fontSize: 11, fontWeight: '700', color: COLORS.blue },

  // Fund card
  fundCard: { marginBottom: SPACING.base, padding: 0, overflow: 'hidden' },
  fundLoadingCard: { marginBottom: SPACING.base, padding: 14 },
  fundLoadingStats: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  fundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, paddingBottom: 8 },
  fundLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  fundBalance: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  fundSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  fundIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  fundBarBg: { height: 6, backgroundColor: COLORS.surface, marginHorizontal: 14, borderRadius: 3, marginBottom: 8 },
  fundBarFill: { height: 6, backgroundColor: COLORS.blue, borderRadius: 3 },
  fundStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, flexWrap: 'wrap' },
  fundStat: { flex: 1, padding: 10, alignItems: 'center' },
  fundStatLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  fundStatVal: { fontSize: 13, fontWeight: '800' },
  lastExpense: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  lastExpenseText: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },

  // Quick actions
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.base, flexWrap: 'wrap' },
  quickRowWide: { gap: 12 },
  quickBtn: { flex: 1, minWidth: 120, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
  quickBtnDanger: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  quickLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },

  // Announcements
  announcement: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.base, paddingVertical: 13 },
  announcementText: { fontSize: 14, color: COLORS.textPrimary, flex: 1, lineHeight: 20 },
  rowDivider: { height: 1, backgroundColor: COLORS.borderLight, marginHorizontal: SPACING.base },

  // Payments
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: SPACING.base },
  payRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  payIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  payDesc: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 1 },
  payDate: { fontSize: 11, color: COLORS.textMuted },
  payAmount: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },

  // Empty states
  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});
