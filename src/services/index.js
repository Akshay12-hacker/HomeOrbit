import API from './apiClient';
import { sendOTP } from './auth/sendOtp';
import { verifyOTP } from './auth/verifyOtp';
import {getSociety} from './society/getSociety'

export { sendOTP, verifyOTP, getSociety };

const isMissingEndpoint = (error) => {
  const status = error?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

const messageFromError = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.title || error?.message || fallback;
};

const unwrap = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  if (payload?.result !== undefined) return payload.result;
  if (payload?.items !== undefined) return payload.items;
  return payload;
};

const requestOne = async (candidates, fallback, fallbackOnMissing = true) => {
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

  if (fallbackOnMissing && isMissingEndpoint(lastError)) return fallback;
  throw new Error(messageFromError(lastError));
};

const formatDate = (value) => {
  if (!value) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MOCK_PLOTS = [
  { id: 'plot-101', plotNo: '101', type: 'MU', area: '1200 sq ft' },
  { id: 'plot-204', plotNo: '204', type: 'LIG', area: '900 sq ft' },
];

const MOCK_MAINTENANCE = [
  { id: 'may-2026', monthYear: 'May 2026', amount: 2500, lateCharge: 0, gst: 450 },
  { id: 'apr-2026', monthYear: 'Apr 2026', amount: 2500, lateCharge: 150, gst: 477 },
  { id: 'mar-2026', monthYear: 'Mar 2026', amount: 2500, lateCharge: 300, gst: 504 },
];

const MOCK_FUND = {
  totalBalance: 184500,
  collected: 325000,
  spent: 140500,
  lastExpense: { id: 'exp-1', remark: 'Security salary', amount: 45000, date: '25 Apr 2026', billUrl: null },
  expenses: [
    { id: 'exp-1', remark: 'Security salary', amount: 45000, date: '25 Apr 2026', billUrl: null },
    { id: 'exp-2', remark: 'Street light repair', amount: 12500, date: '18 Apr 2026', billUrl: null },
    { id: 'exp-3', remark: 'Garden maintenance', amount: 8500, date: '10 Apr 2026', billUrl: null },
  ],
};

const MOCK_PAYMENTS = [
  {
    id: 'pay-1',
    desc: 'Maintenance - Apr 2026',
    date: '20 Apr 2026',
    amount: 3127,
    status: 'Paid',
    txnId: 'pay_demo_001',
    receiptId: 'HO-2026-001',
    plotNo: '101',
    plotType: 'MU',
    society: 'Sunrise Apartments',
    mode: 'Online',
  },
  {
    id: 'pay-2',
    desc: 'Maintenance - May 2026',
    date: 'Due by 10 May 2026',
    amount: 2950,
    status: 'Pending',
    plotNo: '101',
    plotType: 'MU',
  },
];

const normalizePlot = (plot, index) => ({
  id: String(plot.id ?? plot.plotId ?? plot.plotID ?? index + 1),
  plotNo: String(plot.plotNo ?? plot.plotNumber ?? plot.number ?? plot.name ?? index + 1),
  type: String(plot.type ?? plot.plotType ?? plot.category ?? 'MU'),
  area: String(plot.area ?? plot.size ?? plot.plotArea ?? 'N/A'),
});

const normalizeMaintenance = (row, index) => ({
  id: String(row.id ?? row.maintenanceId ?? row.monthYear ?? index + 1),
  monthYear: String(row.monthYear ?? row.month ?? row.period ?? `Month ${index + 1}`),
  amount: Number(row.amount ?? row.baseAmount ?? row.maintenanceAmount ?? 0),
  lateCharge: Number(row.lateCharge ?? row.lateFee ?? row.penalty ?? 0),
  gst: Number(row.gst ?? row.gstAmount ?? row.tax ?? 0),
});

const normalizeExpense = (expense, index) => ({
  id: String(expense.id ?? expense.expenseId ?? index + 1),
  remark: String(expense.remark ?? expense.description ?? expense.title ?? 'Society expense'),
  amount: Number(expense.amount ?? 0),
  date: formatDate(expense.date ?? expense.expenseDate ?? expense.createdAt),
  billUrl: expense.billUrl ?? expense.billPhotoUrl ?? expense.attachmentUrl ?? null,
});

const normalizeFund = (fund) => {
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

const normalizePayment = (payment, index) => ({
  id: String(payment.id ?? payment.paymentId ?? index + 1),
  desc: String(payment.desc ?? payment.description ?? payment.monthYear ?? 'Maintenance payment'),
  date: formatDate(payment.date ?? payment.paymentDate ?? payment.createdAt ?? payment.dueDate),
  amount: Number(payment.amount ?? payment.totalAmount ?? 0),
  status: String(payment.status ?? (payment.isPaid ? 'Paid' : 'Pending')),
  txnId: payment.txnId ?? payment.transactionId ?? payment.razorpayPaymentId,
  receiptId: payment.receiptId ?? payment.receiptNo ?? payment.receiptNumber,
  plotNo: payment.plotNo ?? payment.plotNumber,
  plotType: payment.plotType ?? payment.type,
  society: payment.society ?? payment.societyName ?? 'Home Orbit Society',
  mode: payment.mode ?? payment.paymentMode ?? 'Online',
});

const normalizeSociety = (society, index) => ({
  id: String(society.id ?? society.societyId ?? index + 1),
  name: String(society.name ?? society.societyName ?? 'Society'),
  city: String(society.city ?? society.location ?? society.address ?? ''),
  plots: Number(society.plots ?? society.plotCount ?? society.totalPlots ?? 0),
});

const normalizeDashboard = (dashboard) => {
  const user = dashboard.user ?? dashboard.User ?? {};
  const plotInfo = dashboard.plotInfo ?? dashboard.PlotInfo ?? dashboard.plot ?? dashboard.Plot ?? {};
  const maintenanceDue = dashboard.maintenanceDue ?? dashboard.MaintenanceDue ?? {};
  const societyFund = dashboard.societyFund ?? dashboard.SocietyFund ?? MOCK_FUND;
  const lastPayment = dashboard.lastPayment ?? dashboard.LastPayment ?? MOCK_PAYMENTS[0];
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
    recentPayments: recentPayments.map(normalizePayment),
  };
};

export const getUserPlots = async () => {
  const data = await requestOne(
    [
      { method: 'GET', url: '/Plot/user-plots' },
      { method: 'GET', url: '/Plots/user' },
      { method: 'GET', url: '/User/plots' },
    ],
    MOCK_PLOTS
  );
  return (Array.isArray(data) ? data : data?.plots ?? []).map(normalizePlot);
};

export const getMaintenanceDue = async (plotId) => {
  const params = plotId ? { PlotId: plotId } : undefined;
  const data = await requestOne(
    [
      { method: 'GET', url: '/Maintenance/due', params },
      { method: 'GET', url: '/MaintenanceDue', params },
      { method: 'GET', url: '/Payment/due', params },
    ],
    MOCK_MAINTENANCE
  );
  return (Array.isArray(data) ? data : data?.dues ?? data?.maintenance ?? []).map(normalizeMaintenance);
};

export const createRazorpayOrder = async (amount, plotId, months = []) => {
  const payload = { amount, plotId, months };
  const data = await requestOne(
    [
      { method: 'POST', url: '/Payment/create-order', data: payload },
      { method: 'POST', url: '/Razorpay/create-order', data: payload },
      { method: 'POST', url: '/Payment/create-razorpay-order', data: payload },
    ],
    { orderId: `order_${Date.now()}`, amount },
  );
  return {
    ...data,
    orderId: data.orderId ?? data.id ?? data.razorpayOrderId,
  };
};

export const verifyPayment = async (paymentId, orderId, signature, plotId, months = []) => {
  const payload = { paymentId, orderId, signature, plotId, months };
  const data = await requestOne(
    [
      { method: 'POST', url: '/Payment/verify', data: payload },
      { method: 'POST', url: '/Razorpay/verify-payment', data: payload },
      { method: 'POST', url: '/Payment/verify-razorpay-payment', data: payload },
    ],
    {
      receipt: {
        receiptId: `HO-${Date.now()}`,
        txnId: paymentId,
        date: formatDate(),
        society: 'Home Orbit Society',
        mode: 'Online',
      },
    },
  );

  return {
    ...data,
    receipt: {
      receiptId: data.receipt?.receiptId ?? data.receiptId ?? `HO-${Date.now()}`,
      txnId: data.receipt?.txnId ?? data.txnId ?? paymentId,
      date: formatDate(data.receipt?.date ?? data.date),
      society: data.receipt?.society ?? data.society ?? 'Home Orbit Society',
      mode: data.receipt?.mode ?? data.mode ?? 'Online',
    },
  };
};

export const getSocietyFund = async () => {
  const data = await requestOne(
    [
      { method: 'GET', url: '/SocietyFund' },
      { method: 'GET', url: '/Society/fund' },
      { method: 'GET', url: '/Fund' },
    ],
    MOCK_FUND
  );
  return normalizeFund(data);
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
    ],
    { id: `exp-${Date.now()}`, amount, remark, date, billUrl: billPhoto?.uri ?? null }
  );
  return normalizeExpense(data, 0);
};

export const getPaymentHistory = async () => {
  const data = await requestOne(
    [
      { method: 'GET', url: '/Payment/history' },
      { method: 'GET', url: '/Payments/history' },
      { method: 'GET', url: '/Payment' },
    ],
    MOCK_PAYMENTS
  );
  return (Array.isArray(data) ? data : data?.payments ?? data?.history ?? []).map(normalizePayment);
};

export const getDashboard = async () => {
  const data = await requestOne(
    [
      { method: 'GET', url: '/Dashboard' },
      { method: 'GET', url: '/Home/dashboard' },
      { method: 'GET', url: '/User/dashboard' },
    ],
    null
  );

  if (data) return normalizeDashboard(data);

  const [maintenanceDue, paymentHistory, societyFund, plots] = await Promise.all([
    getMaintenanceDue(),
    getPaymentHistory(),
    getSocietyFund(),
    getUserPlots(),
  ]);
  const lastPayment = paymentHistory.find((payment) => payment.status === 'Paid') ?? MOCK_PAYMENTS[0];
  const dueAmount = maintenanceDue.reduce((sum, row) => sum + row.amount + row.lateCharge + row.gst, 0);

  return {
    user: { name: 'Resident' },
    plotInfo: plots[0] ?? MOCK_PLOTS[0],
    maintenanceDue: { amount: dueAmount, dueDate: '10 May 2026' },
    lastPayment,
    societyFund,
    announcements: [
      { id: 'ann-1', type: 'info', text: 'Water tank cleaning is scheduled this weekend.' },
      { id: 'ann-2', type: 'event', text: 'Society meeting on Sunday at 6 PM.' },
    ],
    recentPayments: paymentHistory.slice(0, 3),
  };
};

export const searchSocieties = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed) return [];

  const data = await requestOne(
    [
      { method: 'GET', url: '/Society/search', params: { query: trimmed } },
      { method: 'GET', url: '/Societies/search', params: { query: trimmed } },
      { method: 'GET', url: '/Society', params: { search: trimmed } },
    ],
    [
      { id: 'soc-1', name: 'Sunrise Apartments', city: 'Ahmedabad', plots: 248 },
      { id: 'soc-2', name: 'Green Valley Residency', city: 'Ahmedabad', plots: 176 },
    ].filter((society) => society.name.toLowerCase().includes(trimmed.toLowerCase()))
  );
  return (Array.isArray(data) ? data : data?.societies ?? []).map(normalizeSociety);
};

export const joinSociety = async (societyId) => requestOne(
  [
    { method: 'POST', url: '/Society/join', data: { societyId } },
    { method: 'POST', url: '/Societies/join', data: { societyId } },
    { method: 'POST', url: `/Society/${societyId}/join` },
  ],
  { success: true, societyId }
);
