import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors as themeColors,
  shadows,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

function PaymentItem({
  item,
  onPress,
  isLast,
  colors,
}) {
  const icon = item?.desc?.toLowerCase().includes('electricity') ? '⚡' : '🏠';
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      style={[
        styles.payItem,
        { borderBottomColor: colors.divider },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={[styles.payIcon, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.payInfo}>
        <Text style={[styles.payTitle, { color: colors.textPrimary }]}>{item?.desc || 'Maintenance Fee'}</Text>
        <Text style={[styles.payDate, { color: colors.textMuted }]}>{item?.date || 'Today'}</Text>
      </View>
      <View style={styles.payRight}>
        <Text style={[styles.payAmt, { color: colors.textPrimary }]}>₹{item?.amount?.toLocaleString('en-IN') || 0}</Text>
        <Text style={[styles.payStatus, { color: colors.success }]}>Paid</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RecentPayments({
  payments = [],
  onPaymentPress,
  onSeeAll,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.secHdr}>
        <Text style={[styles.secTitle, { color: colors.textPrimary }]}>Recent Payments</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.secLink, { color: colors.primary }]}>History</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.payList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {payments.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent payments</Text>
          </View>
        ) : (
          payments.map((item, index) => (
            <PaymentItem
              key={item?.id || index}
              item={item}
              onPress={onPaymentPress}
              isLast={index === payments.length - 1}
              colors={colors}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  secHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  secTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  secLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  payList: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    ...shadows.sm,
  },
  payItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  payIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  payInfo: {
    flex: 1,
    marginLeft: 12,
  },
  payTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  payDate: {
    fontSize: 11,
  },
  payRight: {
    alignItems: 'flex-end',
  },
  payAmt: {
    fontSize: 15,
    fontWeight: '800',
  },
  payStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
