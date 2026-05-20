import API, { getGlobalProfile } from './apiClient';
import { sendOTP } from './auth/sendOtp';
import { verifyOTP } from './auth/verifyOtp';
import {getSociety} from './society/getSociety'
import { getSocietyFund as getRawSocietyFund } from './society/getSocietyFund';
import { getMaintenanceDue } from './society/getMaintenanceDue';

export { sendOTP, verifyOTP, getSociety, getMaintenanceDue };

let dashboardCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;
const storagePrefix = 'homeorbit:v1:';
const memoryCache = new Map();

const getStorage = () => {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  } catch (_error) {
    return null;
  }
  return null;
};

const getCachedValue = (key, maxAge = CACHE_DURATION) => {
  const now = Date.now();
  const memory = memoryCache.get(key);
  if (memory && now - memory.timestamp < maxAge) return memory.value;

  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`${storagePrefix}${key}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (now - cached.timestamp >= maxAge) return null;
    memoryCache.set(key, cached);
    return cached.value;
  } catch (_error) {
    return null;
  }
};

const setCachedValue = (key, value) => {
  const cached = { timestamp: Date.now(), value };
  memoryCache.set(key, cached);

  const storage = getStorage();
  if (!storage) return value;

  try {
    storage.setItem(`${storagePrefix}${key}`, JSON.stringify(cached));
  } catch (_error) {
    // Cache writes should never block the app.
  }

  return value;
};

const getProfileCacheKey = (profile = getGlobalProfile()) => {
  const societyId = profile?.societyId ?? profile?.SocietyId ?? 'society';
  const ownerId = profile?.ownerId ?? profile?.OwnerId ?? 'owner';
  return `${societyId}:${ownerId}`;
};

export const clearDashboardCache = () => {
  dashboardCache = null;
  lastFetchTime = 0;
  memoryCache.clear();

  const storage = getStorage();
  if (!storage) return;

  try {
    Object.keys(storage)
      .filter((key) => key.startsWith(storagePrefix))
      .forEach((key) => storage.removeItem(key));
  } catch (_error) {
    // Clearing cache is best-effort only.
  }
};

const isMissingEndpoint = (error) => {
  const status = error?.response?.status ?? error?.status;
  return status === 404 || status === 405 || status === 501;
};

const messageFromError = (error, defaultMessage = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  return data?.message || data?.title || error?.message || defaultMessage;
};

const unwrap = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  if (payload?.result !== undefined) return payload.result;
  if (payload?.items !== undefined) return payload.items;
  return payload;
};

const requestOne = async (candidates) => {
  let lastError;

  for (const candidate of candidates) {
    try {
      const response = await API.request(candidate);
      return unwrap(response.data);
    } catch (error) {
      lastError = error;
      if (!isMissingEndpoint(error)) break;
    }
  }

  throw Object.assign(new Error(messageFromError(lastError)), {
    cause: lastError,
    response: lastError?.response,
  });
};

const readOptional = async (loader, fallback) => {
  try {
    const data = await loader();
    return data ?? fallback;
  } catch (error) {
    const status = error?.response?.status ?? error?.status;
    if (isMissingEndpoint(error) || status === 400 || status === 404 || status === 405) return fallback;
    throw error;
  }
};

const formatDate = (value) => {
  if (!value) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizePlot = (plot = {}, index = 0) => {
  const unitId = plot.id ?? plot.unitId ?? plot.UnitId ?? plot.plotId ?? plot.PlotId ?? plot.plotID ?? index + 1;
  const ownerId = plot.ownerId ?? plot.OwnerId;
  const societyId = plot.societyId ?? plot.SocietyId;
  const societyName = plot.societyName ?? plot.SocietyName ?? 'Home Orbit Society';
  const unitName =
    plot.unitName ??
    plot.UnitName ??
    plot.unitNumber ??
    plot.UnitNumber ??
    plot.plotNo ??
    plot.PlotNo ??
    plot.plotNumber ??
    plot.PlotNumber ??
    plot.number ??
    plot.name;

  return {
    id: String(unitId),
    unitId,
    ownerId,
    plotNo: String(unitName ?? index + 1),
    type: String(plot.type ?? plot.Type ?? plot.plotType ?? plot.PlotType ?? plot.category ?? plot.unitType ?? plot.UnitType ?? 'Plot'),
    area: String(plot.area ?? plot.Area ?? plot.size ?? plot.plotArea ?? plot.PlotArea ?? ''),
    societyId,
    societyName,
    pendingDue: Number(plot.pendingDue ?? plot.pendingAmount ?? 0),
    paymentId: plot.paymentId ?? plot.lastPaymentId ?? plot.maintenancePaymentId,
  };
};

const normalizePendingDue = (pending = {}) => {
  if (Array.isArray(pending)) {
    const rows = pending.map(normalizeMaintenance);
    return {
      rows,
      amount: rows.reduce((sum, row) => sum + row.amount + row.lateCharge + row.gst, 0),
      pendingAmount: rows.reduce((sum, row) => sum + row.amount + row.lateCharge + row.gst, 0),
      dueDate: rows[0]?.monthYear,
      paymentId: pending[0]?.paymentId ?? pending[0]?.id,
    };
  }

  return {
    ...pending,
    amount: Number(pending.amount ?? pending.pendingAmount ?? pending.totalAmount ?? pending.dueAmount ?? 0),
    pendingAmount: Number(pending.pendingAmount ?? pending.amount ?? pending.totalAmount ?? pending.dueAmount ?? 0),
    dueDate: pending.dueDate ?? pending.dueOn ?? pending.dueAt,
    dueDayOfMonth: pending.dueDayOfMonth,
    paymentId: pending.paymentId ?? pending.id ?? pending.maintenanceLedgerId ?? pending.ledgerId,
  };
};

const normalizeMaintenance = (row = {}, index = 0) => ({
  id: String(row.ledgerId ?? row.LedgerId ?? row.id ?? row.maintenanceId ?? row.monthYear ?? index + 1),
  ledgerId: row.ledgerId ?? row.LedgerId ?? row.id,
  monthYear: String(row.monthYear ?? (
    row.month && row.year
      ? new Date(Number(row.year), Number(row.month) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      : row.month ?? row.period ?? `Month ${index + 1}`
  )),
  amount: Number(row.amount ?? row.pendingAmount ?? row.baseAmount ?? row.maintenanceAmount ?? 0),
  lateCharge: Number(row.lateCharge ?? row.lateFee ?? row.penalty ?? 0),
  gst: Number(row.gst ?? row.gstAmount ?? row.tax ?? 0) + Number(row.cgst ?? 0) + Number(row.sgst ?? 0),
});

const normalizeExpense = (expense = {}, index = 0) => ({
  id: String(expense.id ?? expense.expenseId ?? index + 1),
  remark: String(expense.remark ?? expense.description ?? expense.title ?? 'Society expense'),
  amount: Number(expense.amount ?? 0),
  date: formatDate(expense.date ?? expense.expenseDate ?? expense.createdAt),
  billUrl: expense.billUrl ?? expense.billPhotoUrl ?? expense.attachmentUrl ?? null,
});

const normalizeFund = (fund = {}) => {
  if (typeof fund === 'number' || typeof fund === 'string') {
    const balance = Number(fund ?? 0);
    return {
      totalBalance: Number.isNaN(balance) ? 0 : balance,
      collected: 0,
      spent: 0,
      lastExpense: null,
      expenses: [],
    };
  }

  const expenses = (fund.expenses ?? fund.expenseHistory ?? []).map(normalizeExpense);
  const collected = Number(fund.collected ?? fund.totalCollected ?? 0);
  const spent = Number(fund.spent ?? fund.totalSpent ?? 0);
  return {
    totalBalance: Number(fund.totalBalance ?? fund.balance ?? collected - spent),
    collected,
    spent,
    lastExpense: fund.lastExpense ? normalizeExpense(fund.lastExpense, 0) : expenses[0],
    expenses,
  };
};

const normalizePaymentStatus = (payment = {}) => {
  const rawStatus = payment.status ?? payment.paymentStatus ?? payment.PaymentStatus ?? payment.orderStatus ?? payment.OrderStatus;
  const normalized = String(rawStatus ?? '').toLowerCase();

  if (payment.isPaid === true || payment.IsPaid === true) return 'Paid';
  if (
    payment.paymentDate ||
    payment.PaymentDate ||
    payment.paymentDateUtc ||
    payment.PaymentDateUtc ||
    payment.paidAt ||
    payment.PaidAt ||
    payment.transactionId ||
    payment.txnId ||
    payment.transactionReference ||
    payment.amountPaid
  ) return 'Paid';
  if (['paid', 'success', 'successful', 'completed', 'captured', 'active'].includes(normalized)) return 'Paid';
  if (['pending', 'due', 'unpaid', 'failed', 'cancelled', 'canceled'].includes(normalized)) return 'Pending';

  return 'Pending';
};

const normalizePayment = (payment = {}, index = 0) => ({
  id: String(payment.id ?? payment.paymentId ?? payment.PaymentId ?? payment.orderId ?? payment.OrderId ?? index + 1),
  unitId: payment.unitId ?? payment.UnitId,
  orderId: payment.orderId ?? payment.OrderId ?? payment.cfOrderId ?? payment.CfOrderId ?? payment.receiptId ?? payment.ReceiptId,
  desc: String(payment.desc ?? payment.description ?? payment.paymentPurpose ?? payment.monthYear ?? (payment.id ? `Maintenance payment #${payment.id}` : 'Maintenance payment')),
  date: formatDate(payment.date ?? payment.paymentDate ?? payment.PaymentDate ?? payment.paymentDateUtc ?? payment.PaymentDateUtc ?? payment.createdAt ?? payment.dueDate),
  amount: Number(payment.amount ?? payment.Amount ?? payment.amountPaid ?? payment.AmountPaid ?? payment.totalAmount ?? payment.orderAmount ?? 0),
  status: normalizePaymentStatus(payment),
  txnId: payment.txnId ?? payment.transactionId ?? payment.TransactionId ?? payment.transactionReference ?? payment.TransactionReference ?? payment.razorpayPaymentId ?? payment.orderId ?? payment.id,
  receiptId: payment.receiptId ?? payment.receiptNo ?? payment.receiptNumber ?? payment.orderId ?? payment.id,
  plotNo: payment.plotNo ?? payment.plotNumber ?? payment.unitNo ?? payment.unitNumber ?? payment.unitId,
  plotType: payment.plotType ?? payment.type ?? payment.unitType,
  society: payment.society ?? payment.societyName ?? 'Home Orbit Society',
  mode: payment.mode ?? payment.paymentMode ?? payment.PaymentMode ?? payment.paymentModeName ?? payment.PaymentModeName ?? 'Online',
});

const getPaymentIdentity = (payment = {}) => [
  payment.id,
  payment.orderId,
  payment.txnId,
  payment.receiptId,
  payment.date,
  payment.amount,
  payment.desc,
].filter((value) => value !== undefined && value !== null && value !== '').join('|');

const dedupePayments = (payments = []) => {
  const seen = new Set();

  return payments.filter((payment) => {
    const identity = getPaymentIdentity(payment);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

const normalizeSociety = (society = {}, index = 0) => ({
  id: String(society.id ?? society.societyId ?? index + 1),
  name: String(society.name ?? society.societyName ?? 'Society'),
  city: String(society.city ?? society.location ?? society.address ?? ''),
  plots: Number(society.plots ?? society.plotCount ?? society.totalPlots ?? 0),
});

const normalizeDashboard = (dashboard) => {
  const user = dashboard.user ?? dashboard.User ?? {};
  const plotInfo = dashboard.plotInfo ?? dashboard.PlotInfo ?? dashboard.plot ?? dashboard.Plot ?? {};
  const maintenanceDue = dashboard.maintenanceDue ?? dashboard.MaintenanceDue ?? {};
  const societyFund = dashboard.societyFund ?? dashboard.SocietyFund ?? {};
  const lastPayment = dashboard.lastPayment ?? dashboard.LastPayment ?? {};
  const announcements = dashboard.announcements ?? dashboard.Announcements ?? [];
  const recentPayments = dashboard.recentPayments ?? dashboard.RecentPayments ?? dashboard.payments ?? [];

  return {
    user: {
      ...user,
      name: user.name ?? user.fullName ?? user.Name ?? user.FullName ?? 'Resident',
    },
    plotInfo: normalizePlot(plotInfo, 0),
    maintenanceDue: {
      ...maintenanceDue,
      amount: Number(maintenanceDue.amount ?? maintenanceDue.Amount ?? maintenanceDue.totalAmount ?? 0),
      dueDate: formatDate(maintenanceDue.dueDate ?? maintenanceDue.DueDate),
    },
    lastPayment: normalizePayment(lastPayment, 0),
    societyFund: normalizeFund(societyFund),
    announcements: announcements.map((item, index) => ({
      id: String(item.id ?? item.announcementId ?? index + 1),
      type: String(item.type ?? item.category ?? 'info'),
      text: String(item.text ?? item.message ?? item.title ?? ''),
    })),
    recentPayments: dedupePayments(recentPayments.map(normalizePayment)),
  };
};

export const getUserPlots = async () => {
  const profile = getGlobalProfile();
  const units = profile?.unitOwner ?? profile?.UnitOwner ?? profile?.units ?? profile?.Units ?? profile?.plots ?? profile?.Plots ?? [];

  if (Array.isArray(units) && units.length > 0) {
    return units.map((unit, index) => normalizePlot({
      ...unit,
      ownerId: unit.ownerId ?? unit.OwnerId ?? profile?.ownerId ?? profile?.OwnerId,
      societyId: unit.societyId ?? unit.SocietyId ?? profile?.societyId ?? profile?.SocietyId,
      societyName: unit.societyName ?? unit.SocietyName ?? profile?.societyName ?? profile?.SocietyName,
    }, index));
  }

  return [];
};

export const addExpense = async ({ amount, remark, date, billPhoto }) => {
  const hasPhoto = Boolean(billPhoto?.uri);
  const payload = hasPhoto ? new FormData() : { amount, remark, date };

  if (hasPhoto) {
    payload.append('Amount', String(amount));
    payload.append('Remark', remark);
    payload.append('Date', date);
    payload.append('BillPhoto', {
      uri: billPhoto.uri,
      name: billPhoto.fileName || `bill-${Date.now()}.jpg`,
      type: billPhoto.mimeType || 'image/jpeg',
    });
  }

  const data = await requestOne(
    [
      {
        method: 'POST',
        url: '/SocietyFund/expense',
        data: payload,
        headers: hasPhoto ? { 'Content-Type': 'multipart/form-data' } : undefined,
      },
      {
        method: 'POST',
        url: '/Expense',
        data: payload,
        headers: hasPhoto ? { 'Content-Type': 'multipart/form-data' } : undefined,
      },
    ]
  );
  return normalizeExpense(data, 0);
};

export const getPaymentHistoryForUnit = async (societyId, ownerId, unitId, { forceRefresh = false } = {}) => {
  if (!societyId || !ownerId || !unitId) return [];

  const cacheKey = `payment-history:${societyId}:${ownerId}:${unitId}`;
  if (!forceRefresh) {
    const cached = getCachedValue(cacheKey);
    if (cached) return cached;
  }

  const data = await requestOne([
    { method: 'GET', url: `/payment/${societyId}/owner/${ownerId}/unit/${unitId}/history` },
  ]);

  const rows = Array.isArray(data)
    ? data
    : data?.payments ?? data?.paymentHistory ?? data?.items ?? data?.data ?? [];

  return setCachedValue(cacheKey, Array.isArray(rows)
    ? dedupePayments(rows.map((row, index) => normalizePayment({ ...row, unitId }, row?.id ?? index)))
    : []);
};

export const getPaymentHistory = async () => {
  const profile = getGlobalProfile();
  const societyId = profile?.societyId ?? profile?.SocietyId;
  const ownerId = profile?.ownerId ?? profile?.OwnerId;
  const unitOwner = profile?.unitOwner ?? profile?.UnitOwner ?? [];
  const units = Array.isArray(unitOwner) ? unitOwner : [];
  const unitId = units[0]?.unitId ?? units[0]?.UnitId ?? units[0]?.id;

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.payments)) return payload.payments;
    if (Array.isArray(payload?.paymentHistory)) return payload.paymentHistory;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const candidates = [];

  if (societyId && ownerId && unitId) {
    candidates.push(
      { method: 'GET', url: `/payment/${societyId}/owner/${ownerId}/unit/${unitId}/history` },
      { method: 'GET', url: `/payment/${societyId}/owner/${ownerId}/unit/${unitId}` }
    );
  } else {
    candidates.push(
      { method: 'GET', url: '/payment/history' },
      { method: 'GET', url: '/Payment/history' },
      { method: 'GET', url: '/PaymentHistory' }
    );
  }

  try {
    const data = await requestOne(candidates);
    const rows = toArray(data);
    if (!rows.length) return [];
    return dedupePayments(rows.map(normalizePayment));
  } catch (error) {
    if (isMissingEndpoint(error)) {
      const plots = await getUserPlots();
      const lastPayments = await Promise.all(
        plots.map(async (plot, index) => {
          const lastPayment = await readOptional(
            () => getLastPaymentForUnit(plot.societyId, plot.ownerId, plot.unitId),
            null
          );

          if (!lastPayment || Number(lastPayment.amount ?? 0) <= 0) return null;

          return normalizePayment(
            {
              ...lastPayment,
              id: lastPayment.id ?? `last-payment-${plot.unitId ?? index + 1}`,
              unitId: plot.unitId,
              desc:
                lastPayment.desc ??
                lastPayment.description ??
                `Last payment for Plot ${plot.plotNo}`,
              plotNo: plot.plotNo,
              plotType: plot.type,
              status: lastPayment.status ?? 'Paid',
            },
            index
          );
        })
      );

      return dedupePayments(lastPayments.filter(Boolean));
    }
    throw error;
  }
};

export const getSocietyFund = async (societyId = 1) => normalizeFund(await getRawSocietyFund(societyId));

export const getLastPaymentForUnit = async (societyId, ownerId, unitId) => {
  if (!ownerId || !unitId || !societyId) return {};

  const data = await requestOne([
    { method: 'GET', url: `/payment/${societyId}/owner/${ownerId}/unit/${unitId}/last` },
  ]);

  return data ?? {};
};

export const getDashboard = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();

  if (!forceRefresh && dashboardCache && (now - lastFetchTime < CACHE_DURATION)){
    return dashboardCache;
  }

  const cacheKey = `dashboard:${getProfileCacheKey()}`;
  if (!forceRefresh) {
    const cached = getCachedValue(cacheKey);
    if (cached) {
      dashboardCache = cached;
      lastFetchTime = now;
      return cached;
    }
  }

  const data = await actualDashboardFetch();

  dashboardCache = data;
  lastFetchTime = now;
  setCachedValue(cacheKey, data);

  return data;
};

export const actualDashboardFetch = async () => {
  const profile = getGlobalProfile();
  const societyId = profile?.societyId ?? profile?.SocietyId;
  const plots = await readOptional(getUserPlots, []);
  const userName = profile?.ownerName || profile?.OwnerName || profile?.name || profile?.Name || 'Resident';
  const normalizedPlots = plots.map((plot, index) => ({
    ...normalizePlot(plot, index),
    maintenanceDue: { amount: 0, dueDate: formatDate() },
    lastPayment: {},
  }));
  const plotInfo = normalizedPlots[0] ?? normalizePlot({}, 0);

  return {
    user: { name: userName },
    society: {
      id: societyId,
      name: profile?.societyName || profile?.SocietyName || 'Home Orbit Society',
    },
    plots: normalizedPlots,
    plotInfo,
    maintenanceDue: {
      amount: 0,
      dueDate: normalizedPlots[0]?.maintenanceDue?.dueDate ?? formatDate(),
    },
    lastPayment: {},
    societyFund: normalizeFund(0),
    announcements: [],
    recentPayments: [],
  };
};

export const getDashboardPlotDetails = async (plot, { forceRefresh = false } = {}) => {
  const normalizedPlot = normalizePlot(plot);
  const cacheKey = `plot-details:${normalizedPlot.societyId}:${normalizedPlot.ownerId}:${normalizedPlot.unitId}`;

  if (!forceRefresh) {
    const cached = getCachedValue(cacheKey);
    if (cached) return cached;
  }

  const [pending, lastPaymentData] = await Promise.all([
    readOptional(
      () => getMaintenanceDue(normalizedPlot.societyId, normalizedPlot.ownerId, normalizedPlot.unitId),
      { pendingAmount: 0 }
    ),
    readOptional(
      () => getLastPaymentForUnit(normalizedPlot.societyId, normalizedPlot.ownerId, normalizedPlot.unitId),
      {}
    ),
  ]);
  const normalizedPending = normalizePendingDue(pending);

  return setCachedValue(cacheKey, {
    pendingDue: normalizedPending.pendingAmount,
    paymentId: normalizedPending.paymentId ?? normalizedPlot.paymentId,
    maintenanceDue: {
      amount: normalizedPending.pendingAmount,
      dueDate: normalizedPending.dueDayOfMonth
        ? `${normalizedPending.dueDayOfMonth} ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
        : formatDate(normalizedPending.dueDate),
    },
    lastPayment: normalizePayment(lastPaymentData, 0),
  });
};

export const getDashboardSocietyFund = async (societyId, { forceRefresh = false } = {}) => {
  const cacheKey = `society-fund:${societyId ?? getProfileCacheKey()}`;

  if (!forceRefresh) {
    const cached = getCachedValue(cacheKey);
    if (cached) return cached;
  }

  return setCachedValue(cacheKey, await readOptional(() => getSocietyFund(societyId), normalizeFund(0)));
};

export const getDashboardRecentPayments = async (plot, { forceRefresh = false } = {}) => {
  const normalizedPlot = normalizePlot(plot);
  const cacheKey = `recent-payments:${normalizedPlot.societyId}:${normalizedPlot.ownerId}:${normalizedPlot.unitId}`;

  if (!forceRefresh) {
    const cached = getCachedValue(cacheKey);
    if (cached) return cached;
  }

  const payments = await readOptional(
    () => getPaymentHistoryForUnit(normalizedPlot.societyId, normalizedPlot.ownerId, normalizedPlot.unitId),
    []
  );

  return setCachedValue(cacheKey, payments.slice(0, 3));
};

export const searchSocieties = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed) return [];

  const data = await requestOne(
    [
      { method: 'GET', url: '/Society/search', params: { query: trimmed } },
      { method: 'GET', url: '/Societies/search', params: { query: trimmed } },
      { method: 'GET', url: '/Society', params: { search: trimmed } },
    ]
  );
  return (Array.isArray(data) ? data : data?.value ?? data?.societies ?? []).map(normalizeSociety);
};

export const joinSociety = async (societyId) => {
  try {
    return await requestOne(
      [
        { method: 'POST', url: '/Society/join', data: { societyId } },
        { method: 'POST', url: '/Societies/join', data: { societyId } },
        { method: 'POST', url: `/Society/${societyId}/join` },
      ]
    );
  } catch (error) {
    if (isMissingEndpoint(error)) {
      return { success: true, societyId, remoteJoinSkipped: true };
    }
    throw error;
  }
};
