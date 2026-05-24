import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  radius,
  spacing,
  typography,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

export default function ActionButton({
  icon,
  title,
  subtitle,
  danger,
  onPress,
  last,
}) {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    iconWrapDanger: {
      backgroundColor: isDark ? '#450a0a' : 'rgba(239,68,68,0.1)',
    },
    icon: {
      ...typography.button,
    },
    iconDanger: {
      color: colors.error,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      ...typography.body2Med,
    },
    titleDanger: {
      color: colors.error,
    },
    subtitle: {
      ...typography.caption,
      marginTop: spacing.xs,
    },
    arrow: {
      ...typography.h3,
      marginLeft: spacing.md,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        !last && { borderBottomWidth: 1, borderBottomColor: colors.divider },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isDark ? 'rgba(134,144,238,0.1)' : colors.primaryLight },
            danger && styles.iconWrapDanger,
          ]}
        >
          <Text
            style={[
              styles.icon,
              { color: colors.primary },
              danger && styles.iconDanger,
            ]}
          >
            {danger ? '🚨' : String(icon || title || 'A').charAt(0)}
          </Text>
        </View>

        <View style={styles.textBlock}>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
              danger && styles.titleDanger,
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={[styles.arrow, { color: colors.textMuted }]}>
        >
      </Text>
    </TouchableOpacity>
  );
}
