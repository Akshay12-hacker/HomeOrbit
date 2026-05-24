import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../../theme';

export default function SubscriptionCard({
  navigation,
  plan,
  isScheduled,
  loading,
  error,
  showRenew,
  onRenew,
}) {
  const planName = loading
    ? 'Loading plan...'
    : error
      ? 'Unable to load plan'
      : plan?.planTitle || 'No Active Plan';

  const detail = isScheduled
    ? `Starts on ${plan?.startDateText || '-'}`
    : plan?.expiryDateText
      ? `Valid till ${plan.expiryDateText}`
      : plan?.status || 'Tap to view subscription plans';

  const warningText = Number.isFinite(plan?.daysRemaining)
    ? plan.daysRemaining < 0
      ? 'Plan expired'
      : plan.daysRemaining === 0
        ? 'Expires today'
        : `Expires in ${plan.daysRemaining} day${plan.daysRemaining === 1 ? '' : 's'}`
    : 'Renew your current plan';

  const goToSubscription = () => navigation.navigate('Subscription');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={goToSubscription}
        style={styles.left}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>
            P
          </Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.label}>
            {isScheduled ? 'Upcoming Plan' : 'Current Plan'}
          </Text>

          <Text style={styles.value}>
            {planName}
          </Text>

          <Text style={styles.detail}>
            {detail}
          </Text>

          {showRenew && isScheduled ? (
            <Text style={styles.warning}>
              {warningText}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {showRenew ? (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onRenew || goToSubscription}
          style={styles.renewButton}
        >
          <Text style={styles.renewText}>
            Renew
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.arrow}>
          →
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    ...typography.h3,
    color: colors.accent,
  },
  label: {
    ...typography.label,
  },
  value: {
    ...typography.h4,
    marginTop: 2,
  },
  detail: {
    ...typography.caption,
    marginTop: 2,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  renewButton: {
    marginLeft: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  renewText: {
    ...typography.buttonSm,
    color: colors.textOnDark,
  },
  arrow: {
    ...typography.h3,
    color: colors.textMuted,
    marginLeft: spacing.md,
  },
});
