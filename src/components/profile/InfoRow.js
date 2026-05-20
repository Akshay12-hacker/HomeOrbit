import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS, SPACING } from '../../theme';

export default function InfoRow({
  icon,
  label,
  value,
  last,
}) {
  return (
    <View
      style={[
        styles.container,
        !last && styles.border,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>
            {icon}
          </Text>
        </View>

        <View>
          <Text style={styles.label}>
            {label}
          </Text>

          <Text style={styles.value}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,

    justifyContent: 'center',

    paddingHorizontal: SPACING.base,

    backgroundColor: COLORS.white,
  },

  border: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.surface,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  icon: {
    fontSize: 18,
  },

  label: {
    fontSize: 12,

    color: COLORS.textMuted,

    marginBottom: 2,
  },

  value: {
    fontSize: 15,

    fontWeight: '700',

    color: COLORS.textPrimary,
  },
});