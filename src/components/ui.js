import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TouchableNativeFeedback,
  ActivityIndicator, Animated, StyleSheet, Platform,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING, FONTS } from '../theme';

// ─── Pressable Button ─────────────────────────────────────────────────────────
export const Button = ({
  title, onPress, variant = 'primary', loading = false,
  disabled = false, style, icon, small = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const variants = {
    primary: { bg: COLORS.blue, text: '#fff', border: 'transparent' },
    accent: { bg: COLORS.accent, text: COLORS.navy, border: 'transparent' },
    outline: { bg: 'transparent', text: COLORS.blue, border: COLORS.blue },
    ghost: { bg: COLORS.surface, text: COLORS.textSecondary, border: COLORS.border },
    danger: { bg: COLORS.red, text: '#fff', border: 'transparent' },
    success: { bg: COLORS.green, text: '#fff', border: 'transparent' },
  };
  const v = variants[variant];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={disabled || loading} activeOpacity={0.85}
        style={[
          styles.btn,
          { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border === 'transparent' ? 0 : 1.5 },
          small && styles.btnSmall,
          (disabled || loading) && { opacity: 0.55 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={v.text} />
        ) : (
          <>
            {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
            <Text style={[styles.btnText, { color: v.text }, small && { fontSize: 13 }]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress, noPad = false }) => {
  const content = (
    <View style={[styles.card, noPad && { padding: 0 }, style]}>
      {children}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.92}>{content}</TouchableOpacity>;
  return content;
};

// ─── Skeleton Shimmer ─────────────────────────────────────────────────────────
export const Skeleton = ({ width, height, borderRadius = 8, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: COLORS.shimmer1, opacity },
        style,
      ]}
    />
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <Card style={{ marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Skeleton width={44} height={44} borderRadius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="45%" height={12} />
      </View>
      <Skeleton width={60} height={18} />
    </View>
  </Card>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const Badge = ({ label, type = 'info' }) => {
  const types = {
    paid: { bg: COLORS.greenPale, text: COLORS.green },
    pending: { bg: COLORS.orangePale, text: COLORS.orange },
    failed: { bg: COLORS.redPale, text: COLORS.red },
    info: { bg: COLORS.bluePale, text: COLORS.blue },
    new: { bg: COLORS.accent + '20', text: COLORS.accentDark },
  };
  const t = types[type] || types.info;
  return (
    <View style={{ backgroundColor: t.bg, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ fontSize: FONTS.sizes.xs, fontWeight: '700', color: t.text }}>{label}</Text>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ emoji, title, subtitle }) => (
  <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
    <Text style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</Text>
    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, textAlign: 'center' }}>{title}</Text>
    <Text style={{ fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>
  </View>
);

// ─── Error Retry ──────────────────────────────────────────────────────────────
export const ErrorRetry = ({ message, onRetry }) => (
  <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 }}>
    <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
    <Text style={{ fontSize: 15, color: COLORS.textPrimary, marginBottom: 4, fontWeight: '600', textAlign: 'center' }}>Something went wrong</Text>
    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, textAlign: 'center' }}>{message}</Text>
    <Button title="Try Again" onPress={onRetry} variant="outline" small />
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider = ({ margin = 0 }) => (
  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: margin }} />
);

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm, marginTop: SPACING.base }}>
    <Text style={{ fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={{ fontSize: FONTS.sizes.sm, color: COLORS.blue, fontWeight: '600' }}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: RADIUS.md,
    minHeight: 50,
  },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 18, minHeight: 36 },
  btnText: { fontSize: FONTS.sizes.base, fontWeight: '700', letterSpacing: 0.2 },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.base, borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border, ...SHADOW.card,
  },
});
