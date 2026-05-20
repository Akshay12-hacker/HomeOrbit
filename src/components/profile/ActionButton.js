import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import { COLORS, SPACING, RADIUS } from '../../theme';

export default function ActionButton({
  icon,
  title,
  subtitle,
  danger,
  onPress,
  last,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.container,
        !last && styles.border,
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            danger && styles.iconWrapDanger,
          ]}
        >
          <Text style={styles.icon}>
            {icon}
          </Text>
        </View>

        <View>
          <Text
            style={[
              styles.title,
              danger && styles.titleDanger,
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.arrow}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

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
    flex: 1,
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

  iconWrapDanger: {
    backgroundColor: '#FFECEC',
  },

  icon: {
    fontSize: 18,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  titleDanger: {
    color: COLORS.red,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  arrow: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
});