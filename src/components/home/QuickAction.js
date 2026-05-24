import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  shadows,
  spacing,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

const actions = [
  { id: 'gate', icon: '🚪', title: 'Gate Pass' },
  { id: 'facility', icon: '📅', title: 'Facility' },
  { id: 'sos', icon: '🆘', title: 'SOS', danger: true },
  { id: 'help', icon: '💬', title: 'Help' },
];

export default function QuickActions({
  onActionPress,
}) {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    secHdr: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    secTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    secLink: {
      fontSize: 13,
      fontWeight: '700',
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    qaItem: {
      flex: 1,
      alignItems: 'center',
      gap: 10,
    },
    qaCircle: {
      width: 64,
      height: 64,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.md,
    },
    qaSos: {
      backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#FEF2F2',
      borderColor: isDark ? 'rgba(239,68,68,0.4)' : '#FEE2E2',
    },
    qaIcon: {
      fontSize: 28,
    },
    qaLbl: {
      fontSize: 12,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.secHdr}>
        <Text style={[styles.secTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
        <TouchableOpacity>
          <Text style={[styles.secLink, { color: colors.primary }]}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => onActionPress?.(item.id)}
            style={styles.qaItem}
          >
            <View style={[styles.qaCircle, { backgroundColor: colors.surface, borderColor: colors.border }, item.danger && styles.qaSos]}>
              <Text style={styles.qaIcon}>{item.icon}</Text>
            </View>
            <Text style={[styles.qaLbl, { color: colors.textSecondary }, item.danger && { color: colors.error }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
