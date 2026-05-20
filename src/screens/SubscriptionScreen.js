import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOW, SPACING } from '../theme';
import { Badge, Button, Card, Skeleton } from '../components/ui';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { getCurrentActivePlan } from '../services/payments/getCurrentActivePlan';
import { getSubscriptionConfig } from '../services/payments/getSubscriptionConfig';
import {
  clearStoredActiveSubscription,
  getStoredActiveSubscription,
  isSubscriptionActive,
  saveActiveSubscription,
} from '../services/payments/subscriptionStatusStore';

const plans = [
  {
    id: 'platform_fee',
    title: 'Platform Fee',
    amount: 999,
    originalAmount: 1299,
    savingsAmount: 300,
    savingsPercent: 23,
    billing: 'yr',
    badge: 'Save 23%',
    desc: 'Basic access to the HomeOrbit platform for society management.',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    amount: 149,
    originalAmount: 199,
    savingsAmount: 50,
    savingsPercent: 25,
    billing: 'mo',
    badge: 'Save 25%',
    desc: 'Premium monthly subscription for all features.',
  },
  {
    id: 'yearly',
    title: 'Yearly',
    amount: 1499,
    originalAmount: 1999,
    savingsAmount: 500,
    savingsPercent: 25,
    billing: 'yr',
    badge: 'Save 25%',
    desc: 'Premium yearly subscription for all features.',
  },
];

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN');

const getValidityText = (plan) => {
  const days = Number(plan.noOfDays);
  if (Number.isFinite(days) && days > 0) return `${days} days access`;
  if (plan.billing === 'mo') return '30 days access';
  if (plan.billing === 'yr') return 'Annual access';
  return `${plan.billing} access`;
};

const getBestPlanId = (items = []) => {
  if (!items.length) return null;
  return items.reduce((best, plan) => {
    if (!best) return plan;
    if ((plan.savingsAmount || 0) > (best.savingsAmount || 0)) return plan;
    if ((plan.savingsPercent || 0) > (best.savingsPercent || 0)) return plan;
    return plan.amount > best.amount ? plan : best;
  }, null)?.id;
};

export default function SubscriptionScreen({ route }) {
  const hasLoadedPlansRef = React.useRef(false);
  const renewMode = route?.params?.renew === true;
  const renewPlanId = route?.params?.renewPlanId === undefined || route?.params?.renewPlanId === null
    ? null
    : String(route.params.renewPlanId);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [expandedPlan, setExpandedPlan] = React.useState(null);
  const [remotePlans, setRemotePlans] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { processingKey, startPayment } = usePaymentFlow({
    onSuccess: async (result, activePayment) => {
      const plan = activePayment?.context?.plan;
      const isRenewal = activePayment?.context?.isRenewal;
      const activeSubscription = saveActiveSubscription({
        plan,
        orderId: result?.orderId ?? activePayment?.order?.orderId,
      });
      setSelectedPlan(activeSubscription?.planId ?? plan?.id ?? null);
      Alert.alert(
        isRenewal ? 'Subscription Renewed' : 'Subscription Activated',
        `${plan?.title ?? 'Your plan'} payment was verified successfully.`
      );
    },
  });
  const subscriptionPlans = remotePlans?.length ? remotePlans : plans;
  const bestPlanId = getBestPlanId(subscriptionPlans);

  React.useEffect(() => {
    const activeSubscription = getStoredActiveSubscription();
    if (isSubscriptionActive(activeSubscription)) {
      setSelectedPlan(activeSubscription.planId);
      setExpandedPlan((current) => current || activeSubscription.planId);
    }
  }, []);

  React.useEffect(() => {
    if (renewMode && renewPlanId) {
      setExpandedPlan(renewPlanId);
    }
  }, [renewMode, renewPlanId]);

  React.useEffect(() => {
    let isMounted = true;

    const loadActivePlan = async () => {
      try {
        const activePlan = await getCurrentActivePlan();
        if (!isMounted) return;

        if (!activePlan?.planId) {
          clearStoredActiveSubscription();
          setSelectedPlan(null);
          return;
        }

        setSelectedPlan(activePlan.planId);
        setExpandedPlan((current) => current || activePlan.planId);
      } catch (_error) {
        // The plans list can still be shown even if active-plan lookup fails.
      }
    };

    loadActivePlan();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadPlans = React.useCallback(async (force = false) => {
    if (loading || (!force && hasLoadedPlansRef.current)) return;
    hasLoadedPlansRef.current = true;
    setLoading(true);
    setError('');
    try {
      const data = await getSubscriptionConfig();
      setRemotePlans(data);
      const firstBest = getBestPlanId(data?.length ? data : plans);
      setExpandedPlan((current) => current || firstBest);
    } catch (err) {
      setError(err.message || 'Unable to fetch subscription configuration.');
      const firstBest = getBestPlanId(plans);
      setExpandedPlan((current) => current || firstBest);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  React.useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const onSelectPlan = async (plan, isRenewal = false) => {
    setExpandedPlan(plan.id);
    await startPayment({
      amount: plan.amount,
      key: plan.id,
      context: { plan, isRenewal },
      metadata: {
        type: 1,
        planId: plan.id,
        subscriptionId: plan.subscriptionId ?? plan.id,
        planName: plan.title,
        paymentFor: 'subscription',
        paymentPurpose: `${plan.title} ${isRenewal ? 'Renewal' : 'Subscription'}`,
        currency: 'INR',
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Society tools</Text>
        <Text style={styles.title}>Choose Subscription</Text>
        <Text style={styles.subtitle}>Keep billing, residents, dues, and records running in one place.</Text>
      </LinearGradient>

      {error ? (
        <Card style={styles.warningCard}>
          <Text style={styles.warningTitle}>Using default plans</Text>
          <Text style={styles.warningText}>{error}</Text>
          <Button
            title="Retry"
            onPress={() => loadPlans(true)}
            variant="outline"
            small
            style={{ marginTop: 10, alignSelf: 'flex-start' }}
          />
        </Card>
      ) : null}

      {loading ? (
        <>
          {[1, 2, 3].map((item) => (
            <Card key={item} style={styles.card}>
              <Skeleton width={150} height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="90%" height={12} style={{ marginBottom: 14 }} />
              <Skeleton width={120} height={34} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={48} borderRadius={RADIUS.md} />
            </Card>
          ))}
        </>
      ) : subscriptionPlans.map((plan) => {
        const isExpanded = expandedPlan === plan.id;
        const isBest = plan.id === bestPlanId;
        const isCurrentPlan = selectedPlan === plan.id;
        const canRenewCurrentPlan = renewMode && isCurrentPlan && (!renewPlanId || renewPlanId === plan.id);

        return (
        <TouchableOpacity
          key={plan.id}
          activeOpacity={0.88}
          onPress={() => setExpandedPlan((current) => current === plan.id ? null : plan.id)}
        >
        <Card
          style={[
            styles.card,
            isBest && styles.bestCard,
            isCurrentPlan && styles.selectedCard,
          ]}
        >
          {isBest && (
            <View style={styles.bestRibbon}>
              <Text style={styles.bestRibbonText}>Best option</Text>
            </View>
          )}
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.tapHint}>{isExpanded ? 'Plan details' : 'Tap to view plan details'}</Text>
            </View>
            <Badge
              label={isCurrentPlan ? 'Active' : isBest ? 'Recommended' : plan.badge || 'Available'}
              type={isCurrentPlan ? 'paid' : isBest || plan.badge ? 'new' : 'info'}
            />
          </View>
          <View style={styles.priceBlock}>
            <View style={styles.priceLine}>
              <Text style={styles.originalPrice}>Rs. {formatAmount(plan.originalAmount || plan.amount)}</Text>
              {plan.savingsPercent > 0 && (
                <View style={styles.offerPill}>
                  <Text style={styles.offerPillText}>You save {plan.savingsPercent}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>
              Rs. {formatAmount(plan.amount)}
            </Text>
            {plan.savingsAmount > 0 && (
              <Text style={styles.offerText}>
                Limited offer: get this plan for Rs. {formatAmount(plan.amount)} and save Rs. {formatAmount(plan.savingsAmount)}.
              </Text>
            )}
          </View>
          {isExpanded && (
            <View style={styles.descriptionBox}>
              <Text style={styles.planDesc}>{plan.desc}</Text>
            </View>
          )}
          <View style={styles.planMetaRow}>
            <Text style={styles.planMeta}>Secure checkout</Text>
            <Text style={styles.planMeta}>{getValidityText(plan)}</Text>
            <Text style={styles.planMeta}>Instant activation after confirmation</Text>
          </View>
            <Button
            title={canRenewCurrentPlan ? 'Renew Plan' : isCurrentPlan ? 'Current Plan' : isBest ? 'Choose Best Option' : 'Pay Now'}
            onPress={() => onSelectPlan(plan, canRenewCurrentPlan)}
            loading={processingKey === plan.id}
            disabled={Boolean(processingKey) || (isCurrentPlan && !canRenewCurrentPlan)}
            style={{ marginTop: 12 }}
          />
        </Card>
        </TouchableOpacity>
      );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: SPACING.base },
  hero: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: 12, marginBottom: 16, ...SHADOW.strong },
  heroEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginTop: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginTop: 6, lineHeight: 20 },
  card: { marginBottom: 16, padding: 18, borderRadius: RADIUS.lg, position: 'relative' },
  bestCard: { borderColor: COLORS.accent, borderWidth: 2, ...SHADOW.strong },
  selectedCard: { borderColor: COLORS.green, borderWidth: 1.5, backgroundColor: COLORS.greenPale },
  bestRibbon: { position: 'absolute', top: -1, right: -1, backgroundColor: COLORS.accent, borderTopRightRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 5 },
  bestRibbonText: { fontSize: 11, fontWeight: '900', color: COLORS.navy },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  planTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  tapHint: { fontSize: 12, color: COLORS.blue, fontWeight: '700', marginTop: 4 },
  priceBlock: { marginTop: 14, marginBottom: 8 },
  priceLine: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 2 },
  originalPrice: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, textDecorationLine: 'line-through' },
  offerPill: { backgroundColor: COLORS.greenPale, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  offerPillText: { fontSize: 11, fontWeight: '800', color: COLORS.green },
  planPrice: { fontSize: 30, fontWeight: '900', color: COLORS.blue },
  offerText: { fontSize: 12, fontWeight: '700', color: COLORS.green, marginTop: 4, lineHeight: 18 },
  planDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  descriptionBox: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 12, marginTop: 8, marginBottom: 8 },
  planMetaRow: { gap: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  planMeta: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  warningCard: { marginBottom: 16, padding: 14, borderColor: COLORS.orange, backgroundColor: COLORS.orangePale },
  warningTitle: { fontSize: 14, fontWeight: '800', color: COLORS.orange, marginBottom: 4 },
  warningText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
