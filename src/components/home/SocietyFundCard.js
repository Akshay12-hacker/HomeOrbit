import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  shadows,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

import { LinearGradient } from 'expo-linear-gradient';

export default function SocietyFundCard({
  fund,
  onPress,
}) {
  const { colors, isDark } = useTheme();
  
  // Real data from fund prop
  const balance = fund?.totalBalance || 0;
  const collected = fund?.collected || 0;
  const spent = fund?.spent || 0;
  
  // Calculate health percentage based on balance vs collected
  const percent = collected > 0 ? Math.min(100, Math.round((balance / collected) * 100)) : 0;
  
  // Dynamic labels based on percent
  let healthLabel = "Active";
  let healthColor = colors.primary;
  
  if (percent > 70) {
    healthLabel = "Robust";
    healthColor = '#10B981';
  } else if (percent > 30) {
    healthLabel = "Stable";
    healthColor = '#F5A623';
  } else if (collected > 0) {
    healthLabel = "Critical";
    healthColor = '#EF4444';
  }

  const gradient = isDark 
    ? ['#0f172a', '#020617']
    : ['#F8FAFC', '#F1F5F9'];

  const styles = StyleSheet.create({
    fundCard: {
      marginVertical: 20,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      ...shadows.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    gaugeWrap: {
      width: 80,
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gaugeCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gaugeText: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    gaugePct: {
      fontSize: 18,
      fontWeight: '900',
    },
    gaugeLbl: {
      fontSize: 8,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fundContent: {
      flex: 1,
    },
    fundTitle: {
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    fundBal: {
      fontSize: 26,
      fontWeight: '900',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    fundTrend: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    trendText: {
      fontSize: 11,
      fontWeight: '800',
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{ marginBottom: 20 }}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.fundCard, { borderColor: colors.border }]}
      >
        <View style={styles.gaugeWrap}>
          <View style={[styles.gaugeCircle, { borderColor: colors.surfaceAlt, borderTopColor: healthColor, borderRightColor: healthColor }]}>
            <View style={styles.gaugeText}>
              <Text style={[styles.gaugePct, { color: colors.textPrimary }]}>{percent}%</Text>
              <Text style={[styles.gaugeLbl, { color: healthColor }]}>{healthLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.fundContent}>
          <Text style={[styles.fundTitle, { color: colors.textMuted }]}>Fund Reserve</Text>
          <Text style={[styles.fundBal, { color: colors.textPrimary }]}>₹{balance.toLocaleString('en-IN')}</Text>
          <View style={[styles.fundTrend, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.trendText, { color: colors.textSecondary }]}>
              {spent > 0 ? `📉 Spent ₹${spent.toLocaleString('en-IN')}` : '✨ No expenses yet'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
