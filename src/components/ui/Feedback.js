import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import Button from './Button';

export const EmptyState = ({
  emoji,
  title,
  subtitle,
}) => (
  <View style={styles.wrap}>
    <View style={styles.iconWrap}>
      <Text style={styles.emoji}>
        {emoji || 'i'}
      </Text>
    </View>

    <Text style={styles.title}>
      {title}
    </Text>

    <Text style={styles.subtitle}>
      {subtitle}
    </Text>
  </View>
);

export const ErrorRetry = ({
  message,
  onRetry,
}) => (
  <View style={styles.wrap}>
    <View style={[styles.iconWrap, styles.errorIcon]}>
      <Text style={[styles.emoji, styles.errorEmoji]}>
        !
      </Text>
    </View>

    <Text style={styles.title}>
      Something went wrong
    </Text>

    <Text style={styles.subtitle}>
      {message}
    </Text>

    <Button
      title="Try Again"
      onPress={onRetry}
      variant="outline"
      small
      style={{ marginTop: spacing.lg }}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  errorIcon: {
    backgroundColor: colors.errorLight,
  },
  emoji: {
    ...typography.h2,
    color: colors.primary,
  },
  errorEmoji: {
    color: colors.error,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    textAlign: 'center',
    maxWidth: 280,
  },
});
