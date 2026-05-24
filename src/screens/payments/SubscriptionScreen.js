import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Card,
  Button,
  Badge,
  Skeleton,
} from '../../components/ui';

import {
  spacing,
  radius,
  typography,
  shadows,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

import { usePaymentFlow } from '../../hooks/usePaymentFlow';
import { getCurrentActivePlan } from '../../services/payments/api/getCurrentActivePlan';
import { getSubscriptionConfig } from '../../services/payments/api/getSubscriptionConfig';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubscriptionScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [subscriptionState, setSubscriptionState] = React.useState({
    activePlan: null,
    scheduledPlan: null,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.screen,
    },
    heroCard: {
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 24,
      ...shadows.md,
    },
    heroGradient: {
      padding: 24,
    },
    heroTitle: {
      ...typography.h1,
      color: '#fff',
      fontWeight: '900',
    },
    heroSubtitle: {
      marginTop: 12,
      ...typography.body2,
      color: 'rgba(255,255,255,0.8)',
      lineHeight: 20,
    },
    featureWrap: {
      marginTop: 24,
      gap: 12,
    },
    feature: {
      ...typography.body2Med,
      color: '#fff',
      fontWeight: '700',
    },
    statusCard: {
      marginBottom: 16,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      ...shadows.md,
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statusTitle: {
      fontSize: 22,
      fontWeight: '900',
    },
    statusPrice: {
      marginTop: 20,
      fontSize: 34,
      fontWeight: '900',
    },
    statusMeta: {
      marginTop: 12,
      fontSize: 13,
      fontWeight: '600',
    },
    sectionHeader: {
      marginTop: 8,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    sectionSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textMuted,
    },
    planCard: {
      marginBottom: 16,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...shadows.sm,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    planTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    planDays: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '700',
      marginTop: 2,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.primary,
    },
    planDesc: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    errorCard: {
      backgroundColor: colors.errorLight,
      borderColor: colors.error,
      borderWidth: 1,
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
    },
  });

  const { processingKey, startPayment } = usePaymentFlow({
    onSuccess: (result, activePayment) => {
      navigation.navigate('PaymentSuccess', {
        amount: activePayment?.amount,
        receipt: result,
        payment: activePayment
      });
      loadData();
    },
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [subscriptionData, plansData] = await Promise.all([
        getCurrentActivePlan(),
        getSubscriptionConfig(),
      ]);

      const transformedPlans = (Array.isArray(plansData) ? plansData : []).map((plan) => ({
        id: String(plan.subscriptionId),
        subscriptionId: plan.subscriptionId,
        title: plan.subscriptionName,
        amount: Number(plan.subscriptionAmount) || 0,
        desc: plan.subscriptionDescription,
        noOfDays: plan.noOfDays,
        discount: Number(plan.subscriptionDiscount) || 0,
      }));

      let activePlan = null;
      let scheduledPlan = null;

      if (subscriptionData?.status === 'ACTIVE') activePlan = subscriptionData;
      if (subscriptionData?.status === 'SCHEDULED') scheduledPlan = subscriptionData;

      setSubscriptionState({ activePlan, scheduledPlan });
      setPlans(transformedPlans);
    } catch (err) {
      setError(err?.message || 'Unable to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onSelectPlan = async (plan) => {
    await startPayment({
      amount: plan.amount,
      key: plan.id,
      context: { plan },
      metadata: {
        type: 1,
        planId: plan.id,
        subscriptionId: plan.subscriptionId,
        planName: plan.title,
        paymentFor: 'subscription',
        paymentPurpose: `${plan.title} Subscription`,
        currency: 'INR',
      },
    });
  };

  const activePlanId = subscriptionState?.activePlan?.planId;
  const scheduledPlanId = subscriptionState?.scheduledPlan?.planId;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.heroCard}>
        <LinearGradient
          colors={colors.gradientHero}
          style={styles.heroGradient}
        >
          <Text style={styles.heroTitle}>Society Premium Experience</Text>
          <Text style={styles.heroSubtitle}>Manage your society smarter with premium HomeOrbit access.</Text>
          <View style={styles.featureWrap}>
            <Text style={styles.feature}>✨ Smart Society Tools</Text>
            <Text style={styles.feature}>⚡ Faster Management</Text>
            <Text style={styles.feature}>🛡️ Secure Payments</Text>
          </View>
        </LinearGradient>
      </View>

      {/* ERROR */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={{ fontWeight: '800', color: colors.error }}>Failed to load subscriptions</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{error}</Text>
          <Button title="Retry" onPress={loadData} style={{ marginTop: 14 }} />
        </View>
      ) : null}

      {/* LOADING */}
      {loading ? (
        <View style={{ gap: 16 }}>
          {[1, 2].map((item) => (
            <Card key={item} style={{ padding: 20 }}>
              <Skeleton width={140} height={18} style={{ marginBottom: 12 }} />
              <Skeleton width={90} height={30} />
            </Card>
          ))}
        </View>
      ) : (
        <>
          {/* CURRENT STATUS (ACTIVE OR SCHEDULED) */}
          {subscriptionState.activePlan || subscriptionState.scheduledPlan ? (
            <View style={[
              styles.statusCard, 
              subscriptionState.activePlan 
                ? { backgroundColor: colors.successLight, borderColor: colors.success }
                : { backgroundColor: colors.primaryLight, borderColor: colors.primary }
            ]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.statusLabel, { color: subscriptionState.activePlan ? colors.successDark : colors.primary }]}>
                    {subscriptionState.activePlan ? 'Current Plan' : 'Upcoming Plan'}
                  </Text>
                  <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                    {(subscriptionState.activePlan || subscriptionState.scheduledPlan).planTitle}
                  </Text>
                </View>
                <Badge 
                  label={subscriptionState.activePlan ? "ACTIVE" : "SCHEDULED"} 
                  type={subscriptionState.activePlan ? "paid" : "info"} 
                />
              </View>
              <Text style={[styles.statusPrice, { color: colors.primary }]}>
                {formatCurrency((subscriptionState.activePlan || subscriptionState.scheduledPlan).amount)}
              </Text>
              <Text style={[styles.statusMeta, { color: colors.textSecondary }]}>
                {subscriptionState.activePlan 
                  ? `Valid till ${formatDate(subscriptionState.activePlan.expiryDate)}`
                  : `Starts on ${formatDate(subscriptionState.scheduledPlan.startDate)}`
                }
              </Text>
            </View>
          ) : null}

          {/* PLANS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <Text style={styles.sectionSubtitle}>Choose the plan that fits your society needs.</Text>
          </View>

          {plans.map((plan) => {
            const planIdStr = String(plan.subscriptionId);
            const isActive = activePlanId === planIdStr;
            const isScheduled = scheduledPlanId === planIdStr;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  isActive && { borderColor: colors.success, borderWidth: 2 },
                  isScheduled && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                <View style={styles.planHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planDays}>{plan.noOfDays || '--'} Days Access</Text>
                  </View>
                  {isActive ? <Badge label="ACTIVE" type="paid" /> : isScheduled ? <Badge label="SCHEDULED" type="info" /> : null}
                </View>

                <Text style={styles.planPrice}>{formatCurrency(plan.amount)}</Text>
                {plan.desc ? <Text style={styles.planDesc}>{plan.desc}</Text> : null}

                <Button
                  title={isActive ? 'Current Plan' : isScheduled ? 'Already Scheduled' : 'Choose Plan'}
                  disabled={Boolean(processingKey) || isActive || isScheduled}
                  loading={processingKey === plan.id}
                  onPress={() => onSelectPlan(plan)}
                  style={{ marginTop: 20 }}
                />
              </View>
            );
          })}
        </>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
