import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors,
  spacing,
  typography,
} from '../../theme';

export const Divider = ({
  margin = 0,
}) => (
  <View
    style={[
      styles.divider,
      { marginVertical: margin },
    ]}
  />
);

export const SectionHeader = ({
  title,
  action,
  onAction,
}) => (
  <View style={styles.header}>
    <View style={styles.titleWrap}>
      <View style={styles.rail} />
      <Text style={styles.title}>
        {title}
      </Text>
    </View>

    {action ? (
      <TouchableOpacity
        activeOpacity={0.78}
        onPress={onAction}
        hitSlop={{
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        }}
      >
        <Text style={styles.action}>
          {action}
        </Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rail: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
  },
  action: {
    ...typography.body2Med,
    color: colors.primary,
  },
});
