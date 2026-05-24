import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  shadows,
} from '../../theme';

import { useTheme } from '../../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlotCard({
  plot,
  index,
}) {
  const { colors, isDark } = useTheme();
  const type = plot?.type || 'Plot'; 
  
  // Logic for due status - very robust check
  const dueAmount = plot?.maintenanceDue?.amount ?? plot?.pendingDue ?? plot?.amount ?? 0;
  const hasDue = Number(dueAmount) > 0;
  
  const statusLabel = hasDue ? "ACTION REQUIRED" : "CLEARED";
  const statusIcon = hasDue ? "🚨" : "✅";
  const statusColor = hasDue ? '#F5A623' : '#10B981';

  // Optical gradients for a premium feel
  const lightGradients = [
    ['#EEF2FF', '#E0E7FF'], // Indigo
    ['#F0FDF4', '#DCFCE7'], // Green
    ['#FFFBEB', '#FEF3C7'], // Amber
  ];

  const darkGradients = [
    ['#1e1b4b', '#312e81'], // Indigo
    ['#064e3b', '#065f46'], // Green
    ['#451a03', '#78350f'], // Amber
  ];

  const gradientColors = isDark 
    ? darkGradients[index % darkGradients.length]
    : lightGradients[index % lightGradients.length];

  const styles = StyleSheet.create({
    card: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      ...shadows.md,
      minHeight: 140,
    },
    gradient: {
      flex: 1,
      padding: 18,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    typeText: {
      fontSize: 9,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    main: {
      flex: 1,
    },
    plotNo: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    society: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    amount: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
    }
  });

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <View style={styles.main}>
            <Text style={styles.plotNo}>{plot?.plotNo || `Plot ${index + 1}`}</Text>
            <Text style={styles.society} numberOfLines={1}>
              {plot?.societyName || 'Home Orbit Society'}
            </Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusBadge}>
            <Text style={{ fontSize: 12 }}>{statusIcon}</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          {hasDue && (
            <Text style={styles.amount}>₹{dueAmount.toLocaleString('en-IN')}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}
