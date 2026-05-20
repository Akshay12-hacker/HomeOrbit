import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { COLORS, SPACING, RADIUS } from '../../theme';

export default function SubscriptionCard({
  navigation,
  plan,
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
  const detail = plan?.expiryDateText
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
        activeOpacity={0.85}
        onPress={goToSubscription}
        style={styles.left}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>
            *
          </Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.label}>
            Current Plan
          </Text>

          <Text style={styles.value}>
            {planName}
          </Text>

          <Text style={styles.detail}>
            {detail}
          </Text>

          {showRenew ? (
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
          {'>'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textBlock: {
    flex: 1,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.navy,
  },

  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },

  value: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  detail: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  warning: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.orange,
  },

  renewButton: {
    marginLeft: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  renewText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },

  arrow: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
});
