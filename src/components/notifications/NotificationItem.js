import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { scale, moderateScale, verticalScale } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeContext';
import { radius, shadows, spacing } from '../../theme';

const typeIcons = {
  payment: '💰',
  announcement: '📢',
  alert: '🚨',
  info: 'ℹ️',
};

export default function NotificationItem({ item, onPress }) {
  const { colors } = useTheme();
  const icon = typeIcons[item.type] || 'ℹ️';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      style={[
        styles.container,
        { 
          backgroundColor: item.read ? colors.surface : colors.primary + '08',
          borderColor: item.read ? colors.border : colors.primary + '30'
        }
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={styles.iconText}>{icon}</Text>
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(16),
    borderRadius: radius.lg,
    marginBottom: verticalScale(12),
    borderWidth: 1,
    ...shadows.sm,
  },
  iconWrap: {
    width: scale(48),
    height: scale(48),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  iconText: {
    fontSize: moderateScale(22),
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    flex: 1,
    marginRight: scale(8),
  },
  time: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  body: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
});
