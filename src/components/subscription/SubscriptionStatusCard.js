import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Badge,
  Card,
} from '../ui';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import {
  formatDate,
} from '../../utils/dateUtils';

import {
  formatCurrency,
} from '../../utils/currency';

export default function SubscriptionStatusCard({
  subscription,
}) {
  if (!subscription) return null;

  const status = subscription?.status || 'ACTIVE';
  const isScheduled = status === 'SCHEDULED';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.label}>
            {isScheduled ? 'Upcoming Plan' : 'Current Plan'}
          </Text>

          <Text style={styles.title}>
            {subscription.planTitle}
          </Text>
        </View>

        <Badge
          label={status}
          type={isScheduled ? 'info' : 'paid'}
        />
      </View>

      <Text style={styles.amount}>
        {formatCurrency(subscription.amount)}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          Starts: {formatDate(subscription.startDate)}
        </Text>

        <Text style={styles.meta}>
          Ends: {formatDate(subscription.expiryDate)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
    borderRadius: radius.card,
    borderColor: colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  label: {
    ...typography.label,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.xs,
  },
  amount: {
    ...typography.amount,
    color: colors.primary,
    marginTop: spacing.xl,
  },
  metaRow: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  meta: {
    ...typography.caption,
  },
});
