import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  radius,
  spacing,
  typography,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

export default function InfoRow({
  icon,
  label,
  value,
  last,
}) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      minHeight: 76,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    icon: {
      ...typography.button,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      ...typography.label,
      marginBottom: 2,
    },
    value: {
      ...typography.body2Med,
    },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        !last && { borderBottomWidth: 1, borderBottomColor: colors.divider },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.icon, { color: colors.primary }]}>
            {String(icon || label || 'I').charAt(0)}
          </Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {label}
          </Text>

          <Text
            style={[styles.value, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}
