import React from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

import { Card } from '../ui';

import {
  colors,
  spacing,
  typography,
} from '../../theme';

export default function SupportCard() {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>
        Need help?
      </Text>

      <Text style={styles.text}>
        Contact HomeOrbit support for billing or subscription assistance.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.body2,
  },
});
