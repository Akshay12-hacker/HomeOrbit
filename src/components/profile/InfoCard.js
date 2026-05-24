import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../../theme';

export default function InfoCard({
  title,
  children,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <Text style={styles.title}>
          {title}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  title: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
