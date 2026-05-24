import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors,
  radius,
  shadows,
  typography,
} from '../../theme';

import { uiStyles } from './styles';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
  small = false,
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const pressTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  };

  const variants = {
    primary: {
      bg: colors.primary,
      text: colors.textOnDark,
      border: colors.primary,
      shadow: shadows.colored(colors.primary),
    },
    accent: {
      bg: colors.accent,
      text: colors.textOnAccent,
      border: colors.accent,
      shadow: shadows.colored(colors.accent),
    },
    outline: {
      bg: colors.surface,
      text: colors.primary,
      border: colors.border,
      shadow: shadows.xs,
    },
    ghost: {
      bg: colors.surfaceAlt,
      text: colors.textSecondary,
      border: colors.divider,
      shadow: shadows.none,
    },
    danger: {
      bg: colors.error,
      text: colors.textOnDark,
      border: colors.error,
      shadow: shadows.colored(colors.error),
    },
    success: {
      bg: colors.success,
      text: colors.textOnDark,
      border: colors.success,
      shadow: shadows.colored(colors.success),
    },
  };

  const current = variants[variant] || variants.primary;
  const inactive = disabled || loading;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.86}
        disabled={inactive}
        onPress={onPress}
        onPressIn={() => pressTo(0.97)}
        onPressOut={() => pressTo(1)}
        style={[
          uiStyles.btn,
          current.shadow,
          {
            backgroundColor: current.bg,
            borderColor: current.border,
            opacity: inactive ? 0.58 : 1,
          },
          small && uiStyles.btnSmall,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={current.text}
          />
        ) : (
          <>
            {icon ? (
              <View style={{ marginRight: 8 }}>
                {icon}
              </View>
            ) : null}

            <Text
              style={[
                uiStyles.btnText,
                { color: current.text },
                small && typography.buttonSm,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
