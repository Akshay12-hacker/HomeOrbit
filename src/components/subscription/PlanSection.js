import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  spacing,
  typography,
} from '../../theme';

import PlanCard from './PlanCard';

export default function PlansSection({
  plans,
  selectedPlanId,
  processingKey,
  onSelectPlan,
}) {
  return (
    <View>
      <Text style={styles.title}>
        Available Plans
      </Text>

      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrent={selectedPlanId === plan.id}
          processing={processingKey === plan.id}
          onPress={() => onSelectPlan(plan)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
});
