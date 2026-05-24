import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Share, 
  Alert, 
  ActivityIndicator, 
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { shadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { getOrderReceipt } from '../../services/payments/api/getOrderReceipt';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const InfoRow = ({ label, value, colors, bold = false, highlight = false }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
    <Text style={[
      styles.infoValue, 
      { color: colors.textPrimary },
      bold && { fontWeight: '800' },
      highlight && { color: colors.primary }
    ]}>{value}</Text>
  </View>
);

export default function ReceiptScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const { receipt, payment, orderId: routeOrderId } = route.params || {};
  const insets = useSafeAreaInsets();
  const [downloading, setDownloading] = useState(false);
  const [remoteData, setRemoteData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const orderId = routeOrderId || receipt?.orderId || payment?.orderId || payment?.OrderId;

  // Animation values
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getOrderReceipt(orderId)
      .then(setRemoteData)
      .catch(err => console.log('Receipt load failed', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Priority Data Mapping based on provided API response
  const details = useMemo(() => {
    if (remoteData?.orderDetails?.[0]) return remoteData.orderDetails[0];
    return payment || receipt || {};
  }, [remoteData, payment, receipt]);

  const qrImage = remoteData?.image; // The base64 image from API
  const totalAmount = details.amountPaid || details.amount || details.totalAmount || 0;
  const status = details.ledgerStatusName || 'Paid';
  const txnId = details.gatewayTransactionId || details.txnId || '-';
  const method = details.paymentMethod?.toUpperCase() || details.mode || 'ONLINE';
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const period = details.month && details.year 
    ? `${monthNames[details.month - 1]} ${details.year}` 
    : details.date || 'Today';

  const handleShare = () => {
    Share.share({
      message: `HomeOrbit Receipt\nPeriod: ${period}\nAmount: ${formatCurrency(totalAmount)}\nStatus: ${status}`,
      title: 'Payment Receipt',
    });
  };

  const getReceiptHtml = () => `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1a1f36; position: relative; }
          .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 900; color: rgba(79, 70, 229, 0.05); z-index: -1; white-space: nowrap; text-transform: uppercase; letter-spacing: 5px; }
          .container { border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
          .header { border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo-text { font-size: 28px; font-weight: 900; color: #4F46E5; letter-spacing: -1px; }
          .status-badge { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-block; margin-top: 10px; }
          .receipt-title { font-size: 20px; font-weight: 700; color: #1a1f36; margin-top: 5px; }
          .qr-code { width: 120px; height: 120px; border: 1px solid #e2e8f0; padding: 5px; border-radius: 8px; }
          .info-grid { display: flex; flex-wrap: wrap; margin-bottom: 40px; gap: 20px; }
          .info-item { flex: 1; min-width: 200px; }
          .label { font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 700; color: #1a1f36; }
          .amount-section { background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 40px; border: 1px solid #e2e8f0; }
          .amount-label { font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 2px; }
          .amount-value { font-size: 42px; font-weight: 900; color: #1a1f36; margin-top: 5px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .table th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; }
          .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; }
          .footer { text-align: center; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .footer-text { font-size: 11px; color: #94a3b8; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="watermark">HomeOrbit</div>
        <div class="container">
          <div class="header">
            <div>
              <div class="logo-text">HomeOrbit</div>
              <div class="receipt-title">Transaction Receipt</div>
              <div class="status-badge">SUCCESSFULLY PAID</div>
            </div>
            ${qrImage ? `<img src="${qrImage}" class="qr-code" />` : ''}
          </div>

          <div class="info-grid">
            <div class="info-item"><div class="label">Date</div><div class="value">${period}</div></div>
            <div class="info-item"><div class="label">Transaction ID</div><div class="value">${txnId}</div></div>
            <div class="info-item"><div class="label">Property</div><div class="value">${payment?.plotNo || '-'}</div></div>
            <div class="info-item"><div class="label">Method</div><div class="value">${method}</div></div>
          </div>

          <div class="amount-section">
            <div class="amount-label">TOTAL PAID</div>
            <div class="amount-value">Rs ${totalAmount.toLocaleString('en-IN')}</div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Period</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Society Maintenance Fee</td>
                <td>${period}</td>
                <td style="text-align: right;">Rs ${totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="footer-text">This is a computer-generated document. No signature required.</div>
            <div class="footer-text" style="margin-top: 5px;">Verified by HomeOrbit Digital Payment Gateway</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const html = getReceiptHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={isDark ? ['#020617', '#0f172a'] : ['#F8F7F2', '#E2E8F0']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingTop: insets.top + 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
           <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Transaction Summary</Text>
           <Text style={[styles.headerSub, { color: colors.textMuted }]}>Official Digital Confirmation</Text>
        </View>

        <Animated.View style={[styles.card, cardStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* DECORATIVE TOP */}
          <View style={styles.tornEdge}>
            {Array(15).fill(0).map((_, i) => (
              <View key={i} style={[styles.tornDot, { backgroundColor: isDark ? '#020617' : '#F8F7F2' }]} />
            ))}
          </View>

          <View style={styles.receiptTop}>
             <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>● {status.toUpperCase()}</Text>
             </View>
             <Text style={[styles.dateText, { color: colors.textMuted }]}>{period}</Text>
          </View>

          <View style={styles.amountSection}>
             <Text style={[styles.amountLabel, { color: colors.textMuted }]}>PAID AMOUNT</Text>
             <Text style={[styles.amountValue, { color: colors.textPrimary }]}>
               {formatCurrency(totalAmount)}
             </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoSection}>
             <InfoRow label="Society" value={payment?.societyName || 'HomeOrbit Society'} colors={colors} bold />
             <InfoRow label="Property" value={payment?.plotNo || '-'} colors={colors} />
             <InfoRow label="Payment Method" value={method} colors={colors} />
             <InfoRow label="Transaction ID" value={txnId} colors={colors} highlight />
             <InfoRow label="Order Reference" value={orderId || '-'} colors={colors} />
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={{ marginLeft: 8, color: colors.textMuted, fontSize: 12 }}>Syncing verified data...</Text>
            </View>
          ) : qrImage ? (
            <View style={styles.qrContainer}>
              <View style={[styles.qrWrapper, { borderColor: colors.divider }]}>
                <Image 
                  source={{ uri: qrImage }} 
                  style={styles.qrImage} 
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.qrText, { color: colors.textMuted }]}>Unique QR Verification</Text>
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.actions}>
           <TouchableOpacity 
             style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
             onPress={handleDownload}
             disabled={downloading}
           >
              <Text style={styles.primaryBtnText}>{downloading ? 'Preparing PDF...' : 'Save as PDF'}</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.secondaryBtn, { borderColor: colors.border }]}
             onPress={handleShare}
           >
              <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>Share via Message</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.closeBtn, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.goBack()}
      >
         <Text style={{ color: colors.primary, fontWeight: '800' }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderWidth: 1,
    ...shadows.lg,
  },
  tornEdge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -8,
    marginBottom: 24,
  },
  tornDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '800',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 28,
  },
  infoSection: {
    gap: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 36,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  qrWrapper: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actions: {
    marginTop: 36,
    gap: 14,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryBtn: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    position: 'absolute',
    alignSelf: 'center',
    padding: 12,
  }
});
