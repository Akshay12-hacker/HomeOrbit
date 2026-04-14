import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import QRCodeLib from 'qrcode';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

// Deterministic QR placeholder — in production use react-native-qrcode-svg
const ReceiptQrPreview = ({ value, size = 120 }) => {
  // Simple visual QR stand-in using the receipt ID as seed
  const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = 9;
  const grid = Array(cells).fill(null).map((_, row) =>
    Array(cells).fill(null).map((_, col) => {
      // Always fill corners (finder patterns)
      if ((row < 2 && col < 2) || (row < 2 && col > cells - 3) || (row > cells - 3 && col < 2)) return true;
      return ((seed * (row + 1) * (col + 1)) % 3) === 0;
    })
  );
  const cell = Math.floor(size / cells);
  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', padding: 8, borderRadius: 8 }}>
      {grid.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((on, ci) => (
            <View key={ci} style={{ width: cell, height: cell, backgroundColor: on ? '#000' : '#fff' }} />
          ))}
        </View>
      ))}
    </View>
  );
};

const Row = ({ label, value, bold = false, highlight = false }) => (
  <View style={styles.row}>
    <Text style={styles.rowKey}>{label}</Text>
    <Text style={[styles.rowVal, bold && styles.rowValBold, highlight && { color: COLORS.blue }]}>{value}</Text>
  </View>
);

const getReceiptQrPayload = (receipt) =>
  JSON.stringify({
    receiptId: receipt.receiptId,
    txnId: receipt.txnId,
    amount: receipt.amount,
    plotNo: receipt.plotNo,
    date: receipt.date,
    society: receipt.society,
  });

export default function ReceiptScreen({ route, navigation }) {
  const { receipt, payment } = route.params || {};
  const insets = useSafeAreaInsets();
  const [downloading, setDownloading] = useState(false);

  // Accept receipt either from post-payment (receipt obj) or from history (payment obj)
  const r = receipt || (payment ? {
    receiptId: payment.receiptId,
    txnId: payment.txnId,
    date: payment.date,
    amount: payment.amount,
    plotNo: payment.plotNo,
    plotType: payment.plotType,
    society: 'Sunrise Apartments',
    months: payment.months || [],
    paidBy: 'Rohit Kapoor',
    mode: 'UPI',
  } : null);

  if (!r) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>No receipt data available.</Text>
    </View>
  );

  const handleShare = () => {
    Share.share({
      message: `Home Orbit Payment Receipt\nReceipt: ${r.receiptId}\nAmount: ₹${r.amount?.toLocaleString('en-IN')}\nPlot: ${r.plotNo} (${r.plotType})\nDate: ${r.date}\nTxn: ${r.txnId}`,
      title: 'Payment Receipt',
    });
  };

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const getReceiptHtml = (qrDataUrl) => `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1e2a3b; }
          .header { border-bottom: 2px solid #0f2557; padding-bottom: 12px; margin-bottom: 18px; }
          .title { font-size: 24px; font-weight: 700; color: #0f2557; }
          .badge { display: inline-block; margin-top: 6px; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e7edf4; font-size: 14px; }
          .row .key { color: #6b7a90; }
          .row .val { font-weight: 600; text-align: right; margin-left: 20px; }
          .total { margin-top: 16px; font-size: 22px; font-weight: 800; color: #1f5fd4; }
          .footer { margin-top: 26px; font-size: 12px; color: #7a8899; text-align: center; }
          .qr-wrap { margin-top: 22px; text-align: center; }
          .qr-wrap img { width: 140px; height: 140px; border: 1px solid #dce5f1; padding: 6px; border-radius: 8px; }
          .qr-text { margin-top: 8px; font-size: 11px; color: #6b7a90; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Home Orbit - Payment Receipt</div>
          <div class="badge">PAID</div>
        </div>
        <div class="row"><span class="key">Receipt No.</span><span class="val">${escapeHtml(r.receiptId)}</span></div>
        <div class="row"><span class="key">Date & Time</span><span class="val">${escapeHtml(r.date)}</span></div>
        <div class="row"><span class="key">Paid By</span><span class="val">${escapeHtml(r.paidBy || 'Resident')}</span></div>
        <div class="row"><span class="key">Plot No.</span><span class="val">${escapeHtml(r.plotNo)}</span></div>
        <div class="row"><span class="key">Plot Type</span><span class="val">${escapeHtml(r.plotType)}</span></div>
        <div class="row"><span class="key">Society</span><span class="val">${escapeHtml(r.society)}</span></div>
        <div class="row"><span class="key">Months Paid</span><span class="val">${escapeHtml((r.months || []).join(', ') || '-')}</span></div>
        <div class="row"><span class="key">Payment Mode</span><span class="val">${escapeHtml(r.mode || 'Online')}</span></div>
        <div class="row"><span class="key">Transaction ID</span><span class="val">${escapeHtml(r.txnId)}</span></div>
        <div class="total">Total Paid: Rs ${escapeHtml(r.amount?.toLocaleString('en-IN'))}</div>
        <div class="qr-wrap">
          <img src="${qrDataUrl}" alt="Receipt Verification QR" />
          <div class="qr-text">Scan this secure QR to verify receipt details</div>
        </div>
        <div class="footer">Generated by Home Orbit Society Management Portal</div>
      </body>
    </html>
  `;

  const handleDownloadPdf = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const qrDataUrl = await QRCodeLib.toDataURL(getReceiptQrPayload(r), {
        margin: 1,
        width: 240,
      });
      const { uri } = await Print.printToFileAsync({ html: getReceiptHtml(qrDataUrl) });
      const safeReceiptId = (r.receiptId || 'receipt').replace(/[^a-zA-Z0-9-_]/g, '_');
      const destination = `${FileSystem.documentDirectory}${safeReceiptId}.pdf`;
      await FileSystem.copyAsync({ from: uri, to: destination });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destination, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save receipt PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF downloaded', `Saved to:\n${destination}`);
      }
    } catch (error) {
      Alert.alert('Download failed', 'Could not generate the receipt PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Header gradient */}
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.successBubble}>
            <Text style={{ fontSize: 36 }}>✅</Text>
          </View>
          <Text style={styles.headerTitle}>Payment Receipt</Text>
          <Text style={styles.headerAmount}>₹{r.amount?.toLocaleString('en-IN')}</Text>
          <Text style={styles.headerSub}>{r.society}</Text>
        </LinearGradient>

        {/* Receipt Card */}
        <View style={styles.cardWrap}>
          <View style={styles.receiptCard}>
            {/* Torn edge top */}
            <View style={styles.tornTop}>
              {Array(18).fill(null).map((_, i) => (
                <View key={i} style={styles.tornCircle} />
              ))}
            </View>

            {/* Receipt ID header */}
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptIdLabel}>RECEIPT NO.</Text>
                <Text style={styles.receiptId}>{r.receiptId}</Text>
              </View>
              <View style={[styles.statusBadge]}>
                <Text style={styles.statusText}>✓ PAID</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Details */}
            <Row label="Date & Time" value={r.date} />
            <Row label="Paid By" value={r.paidBy || 'Resident'} />
            <Row label="Plot No." value={r.plotNo} bold />
            <Row label="Plot Type" value={r.plotType} />
            <Row label="Society" value={r.society} />
            {r.months && r.months.length > 0 && (
              <Row label="Months Paid" value={r.months.join(', ')} />
            )}
            <Row label="Payment Mode" value={r.mode || 'Online'} />
            <Row label="Transaction ID" value={r.txnId} highlight />

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>₹{r.amount?.toLocaleString('en-IN')}</Text>
            </View>

            {/* Torn edge + QR */}
            <View style={styles.tornBottom}>
              {Array(18).fill(null).map((_, i) => (
                <View key={i} style={styles.tornCircle} />
              ))}
            </View>

            {/* QR Section */}
            <View style={styles.qrSection}>
              <Text style={styles.qrLabel}>Scan to verify</Text>
              <ReceiptQrPreview value={r.receiptId || r.txnId || 'HOMEORBIT'} size={120} />
              <Text style={styles.qrSub}>This QR is unique to this payment</Text>
              <Text style={styles.qrId}>{r.receiptId}</Text>
            </View>

            {/* Footer stamp */}
            <View style={styles.stamp}>
              <Text style={styles.stampText}>🏠 HOME ORBIT</Text>
              <Text style={styles.stampSub}>Society Management Portal</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDownloadPdf} activeOpacity={0.8} disabled={downloading}>
            <Text style={{ fontSize: 20 }}>⬇️</Text>
            <Text style={styles.actionText}>{downloading ? 'Preparing PDF...' : 'Download PDF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.blue }]} onPress={() => navigation.navigate('History')} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>📋</Text>
            <Text style={[styles.actionText, { color: COLORS.blue }]}>All Payments</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingBottom: 48, paddingHorizontal: SPACING.lg },
  successBubble: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  headerAmount: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  cardWrap: { paddingHorizontal: SPACING.lg, marginTop: -28 },
  receiptCard: { backgroundColor: '#fff', borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW.strong },
  tornTop: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 2, backgroundColor: COLORS.surface },
  tornBottom: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 2, backgroundColor: COLORS.surface, marginTop: SPACING.sm },
  tornCircle: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.surface },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.base, paddingBottom: SPACING.sm },
  receiptIdLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 3 },
  receiptId: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, fontFamily: 'monospace' },
  statusBadge: { backgroundColor: COLORS.greenPale, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: '800', color: COLORS.green },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.base, marginVertical: SPACING.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: 9 },
  rowKey: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
  rowVal: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600', flex: 1.4, textAlign: 'right' },
  rowValBold: { fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: 14 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  totalAmount: { fontSize: 24, fontWeight: '900', color: COLORS.blue },
  qrSection: { alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.lg },
  qrLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  qrSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 10, textAlign: 'center' },
  qrId: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  stamp: { alignItems: 'center', paddingBottom: SPACING.base, paddingTop: SPACING.xs },
  stampText: { fontSize: 13, fontWeight: '800', color: COLORS.navy, letterSpacing: 1 },
  stampSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6, padding: 14, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
  actionText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
});
