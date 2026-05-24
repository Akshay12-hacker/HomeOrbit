import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import {
  radius,
  shadows,
  spacing,
  typography,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

const announcementIcons = {
  alert: '🔔',
  event: '📅',
  info: 'ℹ️',
  maintenance: '🛠️',
};

function AnnouncementCard({
  item,
  isLast,
  colors,
}) {
  const icon = announcementIcons[item?.type] || 'ℹ️';

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    },
    lastCard: {
      marginBottom: 0,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    icon: {
      fontSize: 20,
    },
    content: {
      flex: 1,
    },
    title: {
      ...typography.h4,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      fontWeight: '800',
    },
    message: {
      ...typography.body2,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    time: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.sm,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        isLast && styles.lastCard,
      ]}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>
          {icon}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {item?.title || 'Society Update'}
        </Text>

        <Text style={styles.message}>
          {item?.text}
        </Text>

        <Text style={styles.time}>
          {item?.time || 'Recently'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AnnouncementList({
  announcements = [],
}) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    heading: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '800',
    },
    subheading: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: 2,
    },
    empty: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    },
    emptyMark: {
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    emptyMarkText: {
      fontSize: 28,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      fontWeight: '800',
    },
    emptyText: {
      ...typography.body2,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            Society Updates
          </Text>
          <Text style={styles.subheading}>
            Stay informed with latest activity
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>See all</Text>
        </TouchableOpacity>
      </View>

      {announcements.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyMark}>
            <Text style={styles.emptyMarkText}>
              📢
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            All caught up!
          </Text>

          <Text style={styles.emptyText}>
            Society announcements and notices will appear here.
          </Text>
        </View>
      ) : (
        announcements.map((item, index) => (
          <AnnouncementCard
            key={item?.id || index}
            item={item}
            isLast={index === announcements.length - 1}
            colors={colors}
          />
        ))
      )}
    </View>
  );
}
