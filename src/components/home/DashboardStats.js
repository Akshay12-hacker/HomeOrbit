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
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

import { LinearGradient } from 'expo-linear-gradient';

function FinCard({
  title,
  value,
  icon,
  badgeText,
  badgeType,
  style,
  onPress,
}) {
  const { colors, isDark } = useTheme();
  
  // Dynamic colors based on badgeType
  let badgeBg = 'rgba(79,70,229,0.1)';
  let badgeColor = colors.primary;
  let cardBorder = colors.border;
  let accentColor = colors.primary;

  if (badgeType === 'pending') {
    badgeBg = isDark ? 'rgba(245,166,35,0.2)' : 'rgba(245,166,35,0.15)';
    badgeColor = '#F5A623';
    cardBorder = isDark ? 'rgba(245,166,35,0.3)' : 'rgba(245,166,35,0.2)';
    accentColor = '#F5A623';
  } else if (badgeType === 'paid') {
    badgeBg = isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)';
    badgeColor = '#10B981';
    cardBorder = isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)';
    accentColor = '#10B981';
  }

  const gradient = isDark 
    ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
    : ['#F8FAFC', '#F1F5F9'];

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      height: verticalScale(120),
      borderRadius: scale(20),
      padding: scale(16),
      justifyContent: 'space-between',
    },
    finHdr: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    finIcon: {
      fontSize: moderateScale(20),
    },
    finBadge: {
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: scale(20),
    },
    badgeText: {
      fontSize: moderateScale(10),
      fontWeight: '700',
    },
    finLbl: {
      fontSize: moderateScale(11),
      marginBottom: verticalScale(2),
    },
    finVal: {
      fontSize: moderateScale(18),
      fontWeight: '800',
    },
    accentLine: {
      position: 'absolute',
      top: 0,
      left: scale(16),
      right: scale(16),
      height: verticalScale(3),
      borderBottomLeftRadius: scale(3),
      borderBottomRightRadius: scale(3),
    }
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.card, { borderColor: cardBorder, borderWidth: 1 }, style]}
      >
        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
        <View style={styles.finHdr}>
          <Text style={styles.finIcon}>{icon}</Text>
          <View style={[styles.finBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        </View>
        <View>
          <Text style={[styles.finLbl, { color: colors.textSecondary }]}>{title}</Text>
          <Text style={[styles.finVal, { color: colors.textPrimary }]}>{value}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function DashboardStats({
  plot,
  onPayPress,
  onHistoryPress,
}) {
  const { colors, isDark } = useTheme();
  const dueAmount = plot?.maintenanceDue?.amount || 0;
  const hasDue = dueAmount > 0;
  const lastPayment = plot?.lastPayment;

  const styles = StyleSheet.create({
    finGrid: {
      flexDirection: 'row',
      gap: scale(12),
      marginBottom: verticalScale(20),
    },
  });

  return (
    <View style={styles.finGrid}>
      <FinCard
        title="Maintenance Due"
        value={`₹${dueAmount.toLocaleString('en-IN')}`}
        icon={hasDue ? "🚨" : "🛡️"}
        badgeText={hasDue ? "Emergency" : "Cleared"}
        badgeType={hasDue ? "pending" : "paid"}
        onPress={onPayPress}
      />
      <FinCard
        title="Last Payment"
        value={lastPayment?.amount ? `₹${lastPayment.amount.toLocaleString('en-IN')}` : '₹0'}
        icon="✅"
        badgeText="Verified"
        badgeType="paid"
        onPress={onHistoryPress}
      />
    </View>
  );
}
