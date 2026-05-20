import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { useResponsive } from '../hooks';
import { getGlobalProfile } from '../services/apiClient';
import { getOrderReceipt } from '../services/payments/getOrderReceipt';

// Deterministic QR placeholder — in production use react-native-qrcode-svg
const QRCode = ({ value, size = 120 }) => {
  // Simple visual QR stand-in using the receipt ID as seed
  const qrValue = String(value ?? 'HOMEORBIT');
  const seed = qrValue.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
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

const ReceiptQr = ({ imageUri, value, size = 120 }) => {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{ width: size, height: size, borderRadius: 8, backgroundColor: '#fff' }}
        resizeMode="contain"
      />
    );
  }

  return <QRCode value={value} size={size} />;
};

const Row = ({ label, value, bold = false, highlight = false }) => (
  <View style={styles.row}>
    <Text style={styles.rowKey}>{label}</Text>
    <Text style={[styles.rowVal, bold && styles.rowValBold, highlight && { color: COLORS.blue }]}>{value}</Text>
  </View>
);

const currency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const toMonths = (months) => {
  if (Array.isArray(months)) return months;
  if (!months) return [];
  return [String(months)];
};

const pickRealValue = (values, fallback, placeholders = []) => {
  const blocked = new Set(placeholders.map((item) => String(item).trim().toLowerCase()));

  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text && !blocked.has(text.toLowerCase())) return text;
  }

  return fallback;
};

const getProfileUnits = (profile = {}) => {
  const units = profile.unitOwner ?? profile.UnitOwner ?? profile.units ?? profile.Units ?? profile.plots ?? profile.Plots ?? [];
  return Array.isArray(units) ? units : [];
};

const getUnitId = (unit = {}) => unit.unitId ?? unit.UnitId ?? unit.id ?? unit.Id;

const getUnitPlotNo = (unit = {}) => (
  unit.unitName ??
  unit.UnitName ??
  unit.unitNumber ??
  unit.UnitNumber ??
  unit.plotNo ??
  unit.PlotNo ??
  unit.plotNumber ??
  unit.PlotNumber ??
  unit.name ??
  unit.Name
);

const findProfilePlotNo = (profile, unitId) => {
  if (!unitId) return undefined;
  const match = getProfileUnits(profile).find((unit) => String(getUnitId(unit)) === String(unitId));
  return getUnitPlotNo(match);
};

const getQrSvgHtml = (value) => {
  const qrValue = String(value ?? 'HOMEORBIT');
  const seed = qrValue.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = 9;
  const cellSize = 10;
  const rects = [];

  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const isFinder = (row < 2 && col < 2) || (row < 2 && col > cells - 3) || (row > cells - 3 && col < 2);
      const isOn = isFinder || ((seed * (row + 1) * (col + 1)) % 3) === 0;
      if (isOn) {
        rects.push(`<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000" />`);
      }
    }
  }

  return `<svg class="qr" viewBox="0 0 ${cells * cellSize} ${cells * cellSize}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff" />${rects.join('')}</svg>`;
};

export default function ReceiptScreen({ route, navigation }) {
  const { receipt, payment, orderId: routeOrderId } = route.params || {};
  const profile = getGlobalProfile() || {};
  const insets = useSafeAreaInsets();
  const [downloading, setDownloading] = useState(false);
  const [remoteReceipt, setRemoteReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const { contentMaxWidth, gutter, isPhone } = useResponsive();
  const orderId = routeOrderId || receipt?.orderId || payment?.orderId || payment?.OrderId;

  // Accept receipt either from post-payment (receipt obj) or from history (payment obj)
  const localReceipt = receipt || (payment ? {
    orderId,
    receiptId: payment.receiptId,
    txnId: payment.txnId,
    date: payment.date,
    amount: payment.amount,
    unitId: payment.unitId ?? payment.UnitId,
    plotNo: payment.plotNo,
    plotType: payment.plotType,
    society: payment.society || 'Home Orbit Society',
    months: payment.months || [],
    paidBy: payment.paidBy || payment.ownerName || 'Resident',
    mode: payment.mode || 'Online',
  } : null);
  const mergedReceipt = remoteReceipt ? {
    ...localReceipt,
    ...remoteReceipt,
    plotNo: remoteReceipt.plotNo ?? localReceipt?.plotNo,
    plotType: remoteReceipt.plotType ?? localReceipt?.plotType,
  } : localReceipt;
  const receiptUnitId = (
    mergedReceipt?.unitId ??
    mergedReceipt?.UnitId ??
    receipt?.unitId ??
    receipt?.UnitId ??
    payment?.unitId ??
    payment?.UnitId
  );
  const profilePlotNo = findProfilePlotNo(profile, receiptUnitId);
  const r = mergedReceipt ? {
    ...mergedReceipt,
    plotNo: pickRealValue(
      [
        profilePlotNo,
        localReceipt?.plotNo,
        receipt?.plotNo,
        receipt?.PlotNo,
        payment?.plotNo,
        payment?.PlotNo,
        mergedReceipt.plotNo,
        mergedReceipt.PlotNo,
        mergedReceipt.unitNo,
        mergedReceipt.UnitNo,
        mergedReceipt.unitNumber,
        mergedReceipt.UnitNumber,
      ],
      receiptUnitId || '-',
      ['-', 'undefined', 'null']
    ),
    paidBy: pickRealValue(
      [
        mergedReceipt.paidBy,
        mergedReceipt.ownerName,
        receipt?.paidBy,
        receipt?.ownerName,
        payment?.paidBy,
        payment?.ownerName,
        profile.ownerName,
        profile.OwnerName,
        profile.name,
        profile.Name,
      ],
      'Resident',
      ['Resident']
    ),
    society: pickRealValue(
      [
        mergedReceipt.society,
        mergedReceipt.societyName,
        receipt?.society,
        receipt?.societyName,
        payment?.society,
        payment?.societyName,
        profile.societyName,
        profile.SocietyName,
        profile.society,
        profile.Society,
      ],
      'Home Orbit Society',
      ['Home Orbit Society', 'Unknown Society', 'Society']
    ),
  } : null;

  React.useEffect(() => {
    let isMounted = true;

    if (!orderId) return undefined;

    setReceiptLoading(true);
    setReceiptError('');
    getOrderReceipt(orderId)
      .then((data) => {
        if (isMounted) setRemoteReceipt(data);
      })
      .catch((error) => {
        if (isMounted) setReceiptError(error.message || 'Unable to fetch receipt.');
      })
      .finally(() => {
        if (isMounted) setReceiptLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!r && receiptLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }}>
      <ActivityIndicator color={COLORS.blue} />
      <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 10 }}>Loading receipt...</Text>
    </View>
  );

  if (!r) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>
        {receiptError || 'No receipt data available.'}
      </Text>
    </View>
  );

  const months = toMonths(r.months);
  const orderDetails = Array.isArray(r.orderDetails) ? r.orderDetails : [];
  const qrValue = r.receiptId || r.txnId || r.orderId || 'HOMEORBIT';

  const handleShare = () => {
    Share.share({
      message: `Home Orbit Payment Receipt\nReceipt: ${r.receiptId}\nAmount: ₹${r.amount?.toLocaleString('en-IN')}\nPlot: ${r.plotNo}\nDate: ${r.date}\nTxn: ${r.txnId}`,
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

  const getDetailsHtml = () => orderDetails.length ? `
        <div class="section-title">Paid Details</div>
        <table class="details-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Status</th>
              <th>Method</th>
              <th>Txn ID</th>
              <th class="amount-cell">Paid</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.map((detail) => `
              <tr>
                <td>${escapeHtml(detail.monthYear)}</td>
                <td>${escapeHtml(detail.status)}</td>
                <td>${escapeHtml(detail.paymentMethod || r.mode || 'Online')}</td>
                <td>${escapeHtml(detail.txnId || r.txnId || '-')}</td>
                <td class="amount-cell">Rs ${escapeHtml(Number(detail.amountPaid || 0).toLocaleString('en-IN'))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
  ` : '';

  const getReceiptHtml = () => `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1e2a3b; position: relative; }
          .watermark { position: fixed; top: 38%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); font-size: 72px; font-weight: 800; color: rgba(15,37,87,0.06); letter-spacing: 4px; z-index: 0; white-space: nowrap; }
          .content { position: relative; z-index: 1; }
          .header { border-bottom: 2px solid #0f2557; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
          .title { font-size: 24px; font-weight: 700; color: #0f2557; }
          .badge { display: inline-block; margin-top: 6px; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
          .qr { width: 112px; height: 112px; object-fit: contain; border: 1px solid #e7edf4; border-radius: 8px; padding: 6px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e7edf4; font-size: 14px; }
          .row .key { color: #6b7a90; }
          .row .val { font-weight: 600; text-align: right; margin-left: 20px; }
          .section-title { margin-top: 18px; margin-bottom: 8px; color: #0f2557; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          .details-table th { background: #f3f6fb; color: #607087; text-align: left; padding: 8px; border: 1px solid #e2e8f0; }
          .details-table td { padding: 8px; border: 1px solid #e2e8f0; }
          .amount-cell { text-align: right; font-weight: 700; }
          .total { margin-top: 16px; font-size: 22px; font-weight: 800; color: #1f5fd4; }
          .footer { margin-top: 26px; font-size: 12px; color: #7a8899; text-align: center; }
        </style>
      </head>
      <body>
        <div class="watermark">HomeOrbit</div>
        <div class="content">
        <div class="header">
          <div>
            <div class="title">${escapeHtml(r.society || 'Home Orbit Society')} - Payment Receipt</div>
            <div class="badge">PAID</div>
          </div>
          ${r.qrImage ? `<img class="qr" src="${escapeHtml(r.qrImage)}" />` : getQrSvgHtml(qrValue)}
        </div>
        <div class="row"><span class="key">Receipt No.</span><span class="val">${escapeHtml(r.receiptId)}</span></div>
        <div class="row"><span class="key">Order ID</span><span class="val">${escapeHtml(r.orderId)}</span></div>
        <div class="row"><span class="key">Date & Time</span><span class="val">${escapeHtml(r.date)}</span></div>
        <div class="row"><span class="key">Paid By</span><span class="val">${escapeHtml(r.paidBy || 'Resident')}</span></div>
        <div class="row"><span class="key">Plot No.</span><span class="val">${escapeHtml(r.plotNo)}</span></div>
        <div class="row"><span class="key">Society</span><span class="val">${escapeHtml(r.society)}</span></div>
        <div class="row"><span class="key">Months Paid</span><span class="val">${escapeHtml(months.join(', ') || '-')}</span></div>
        <div class="row"><span class="key">Payment Mode</span><span class="val">${escapeHtml(r.mode || 'Online')}</span></div>
        <div class="row"><span class="key">Transaction ID</span><span class="val">${escapeHtml(r.txnId)}</span></div>
        ${getDetailsHtml()}
        <div class="total">Total Paid: Rs ${escapeHtml(r.amount?.toLocaleString('en-IN'))}</div>
        <div class="footer">Scan the QR code to verify this receipt.</div>
        <div class="footer">Generated by HomeOrbit Society Management Portal</div>
        </div>
      </body>
    </html>
  `;

  const handleDownloadPdf = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const { uri } = await Print.printToFileAsync({ html: getReceiptHtml() });
      const safeReceiptId = String(r.receiptId || r.txnId || 'receipt').replace(/[^a-zA-Z0-9-_]/g, '_');
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

        <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
        {/* Receipt Card */}
        <View style={[styles.cardWrap, { paddingHorizontal: gutter }]}>
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
            {receiptError ? <Text style={styles.receiptWarning}>{receiptError}</Text> : null}

            {/* Details */}
            <Row label="Date & Time" value={r.date} />
            <Row label="Order ID" value={r.orderId || '-'} />
            <Row label="Paid By" value={r.paidBy || 'Resident'} />
            <Row label="Plot No." value={r.plotNo} bold />
            <Row label="Society" value={r.society} />
            {months.length > 0 && (
              <Row label="Months Paid" value={months.join(', ')} />
            )}
            <Row label="Payment Mode" value={r.mode || 'Online'} />
            <Row label="Transaction ID" value={r.txnId} highlight />

            {orderDetails.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Paid Details</Text>
                  {orderDetails.map((detail, index) => (
                    <View
                      key={detail.id || `${detail.monthYear}-${index}`}
                      style={[styles.detailRow, index < orderDetails.length - 1 && styles.detailRowBorder]}
                    >
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.detailMonth}>{detail.monthYear}</Text>
                        <Text style={styles.detailMeta}>
                          {detail.status || 'Paid'} - {detail.paymentMethod || r.mode || 'Online'}
                        </Text>
                        <Text style={styles.detailTxn} numberOfLines={1}>
                          Txn {detail.txnId || r.txnId || '-'}
                        </Text>
                      </View>
                      <View style={styles.detailAmountWrap}>
                        <Text style={styles.detailAmount}>{currency(detail.amountPaid)}</Text>
                        {detail.totalAmount !== detail.amountPaid && (
                          <Text style={styles.detailTotal}>of {currency(detail.totalAmount)}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

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
              <ReceiptQr imageUri={r.qrImage} value={qrValue} size={132} />
              <Text style={styles.qrSub}>This QR is unique to this payment</Text>
              <Text style={styles.qrId}>{qrValue}</Text>
            </View>

            {/* Footer stamp */}
            <View style={styles.stamp}>
              <Text style={styles.watermarkText}>HomeOrbit</Text>
              <Text style={styles.stampText}>🏠 HOME ORBIT</Text>
              <Text style={styles.stampSub}>Society Management Portal</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { paddingHorizontal: gutter }, !isPhone && styles.actionsWide]}>
          <TouchableOpacity style={[styles.actionBtn, !isPhone && styles.actionBtnWide]} onPress={handleShare} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, !isPhone && styles.actionBtnWide]} onPress={handleDownloadPdf} activeOpacity={0.8} disabled={downloading}>
            <Text style={{ fontSize: 20 }}>⬇️</Text>
            <Text style={styles.actionText}>{downloading ? 'Preparing PDF...' : 'Download PDF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, !isPhone && styles.actionBtnWide, { borderColor: COLORS.blue }]} onPress={() => navigation.navigate('History')} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>📋</Text>
            <Text style={[styles.actionText, { color: COLORS.blue }]}>All Payments</Text>
          </TouchableOpacity>
        </View>
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
  cardWrap: { marginTop: -28 },
  receiptCard: { backgroundColor: '#fff', borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW.strong },
  tornTop: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 2, backgroundColor: COLORS.surface },
  tornBottom: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 2, backgroundColor: COLORS.surface, marginTop: SPACING.sm },
  tornCircle: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.surface },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.base, paddingBottom: SPACING.sm },
  receiptIdLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 3 },
  receiptId: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, fontFamily: 'monospace' },
  receiptWarning: { fontSize: 12, color: COLORS.orange, paddingHorizontal: SPACING.base, paddingBottom: SPACING.xs },
  statusBadge: { backgroundColor: COLORS.greenPale, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: '800', color: COLORS.green },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.base, marginVertical: SPACING.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: 9 },
  rowKey: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
  rowVal: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600', flex: 1.4, textAlign: 'right' },
  rowValBold: { fontWeight: '800' },
  detailSection: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs },
  detailTitle: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  detailMonth: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  detailMeta: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  detailTxn: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace' },
  detailAmountWrap: { alignItems: 'flex-end' },
  detailAmount: { fontSize: 14, fontWeight: '900', color: COLORS.green },
  detailTotal: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: 14 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  totalAmount: { fontSize: 24, fontWeight: '900', color: COLORS.blue },
  qrSection: { alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.lg },
  qrLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  qrSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 10, textAlign: 'center' },
  qrId: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  stamp: { alignItems: 'center', paddingBottom: SPACING.base, paddingTop: SPACING.xs },
  watermarkText: { fontSize: 28, fontWeight: '900', color: 'rgba(15,37,87,0.08)', letterSpacing: 2, marginBottom: -2 },
  stampText: { fontSize: 13, fontWeight: '800', color: COLORS.navy, letterSpacing: 1 },
  stampSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: SPACING.lg, flexWrap: 'wrap' },
  actionsWide: { gap: 12 },
  actionBtn: { flex: 1, minWidth: 160, alignItems: 'center', gap: 6, padding: 14, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
  actionBtnWide: { minWidth: 180 },
  actionText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
});
