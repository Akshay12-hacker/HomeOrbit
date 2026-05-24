import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Badge,
  Button,
  Card,
} from '../ui';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import {
  formatCurrency,
} from '../../utils/currency';

export default function PlanCard({
  plan,
  isCurrent,
  processing,
  onPress,
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={styles.copy}>
          <Text style={styles.title}>
            {plan.title}
          </Text>

          <Text style={styles.days}>
            {plan.noOfDays} days access
          </Text>
        </View>

        {isCurrent ? (
          <Badge
            label="Active"
            type="paid"
          />
        ) : null}
      </View>

      <Text style={styles.amount}>
        {formatCurrency(plan.amount)}
      </Text>

      {plan.desc ? (
        <Text style={styles.desc}>
          {plan.desc}
        </Text>
      ) : null}

      <Button
        title={isCurrent ? 'Current Plan' : 'Choose Plan'}
        disabled={isCurrent}
        loading={processing}
        onPress={onPress}
        style={{ marginTop: spacing.lg }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    borderRadius: radius.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.h2,
  },
  days: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  amount: {
    ...typography.amount,
    color: colors.primary,
    marginTop: spacing.xl,
  },
  desc: {
    ...typography.body2,
    marginTop: spacing.sm,
  },
});
