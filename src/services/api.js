// ─── Mock API Service ─────────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const simulateNetwork = (min = 600, max = 1400) =>
  delay(Math.floor(Math.random() * (max - min) + min));

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const sendOTP = async (phone) => {
  await simulateNetwork(800, 1200);
  return { success: true };
};

export const verifyOTP = async (phone, otp) => {
  await simulateNetwork(700, 1100);
  if (otp === '000000') throw new Error('Invalid OTP. Please try again.');
  // role: 'admin' | 'user'
  return {
    success: true,
    token: 'mock_jwt_token_xyz',
    role: phone === '9999999999' ? 'admin' : 'user',
    user: { id: 'u1', name: 'Rohit Kapoor', phone },
  };
};

// ─── Society ──────────────────────────────────────────────────────────────────
const SOCIETIES = [
  { id: 's1', name: 'Sunrise Apartments', city: 'Indore', plots: 120 },
  { id: 's2', name: 'Green Valley Society', city: 'Indore', plots: 80 },
  { id: 's3', name: 'Silver Oak Residency', city: 'Bhopal', plots: 200 },
  { id: 's4', name: 'Palm Grove CHS', city: 'Indore', plots: 60 },
  { id: 's5', name: 'Shanti Niwas', city: 'Ujjain', plots: 45 },
  { id: 's6', name: 'Skyline Towers', city: 'Indore', plots: 300 },
];

export const searchSocieties = async (query) => {
  await simulateNetwork(300, 700);
  const q = query.toLowerCase();
  return SOCIETIES.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
};

// Plot types
export const PLOT_TYPES = ['MU', 'EWS', 'LIG', 'A', 'B', 'C'];

// User's plots in a society (for dropdown)
export const getUserPlots = async (societyId) => {
  await simulateNetwork(400, 800);
  // Real: GET /api/user/plots?societyId=...
  return [
    { id: 'p1', plotNo: 'B-204', type: 'MU', area: '120 sqm' },
    { id: 'p2', plotNo: 'C-101', type: 'LIG', area: '60 sqm' },
  ];
};

export const joinSociety = async (societyId) => {
  await simulateNetwork(900, 1400);
  return { success: true, society: SOCIETIES.find((s) => s.id === societyId) };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = async (plotId) => {
  await simulateNetwork(600, 1000);
  return {
    user: { name: 'Rohit Kapoor', role: 'user' },
    society: 'Sunrise Apartments',
    plotInfo: { plotNo: 'B-204', type: 'MU' },
    maintenanceDue: { amount: 2400, dueDate: '10 May 2026', months: 1 },
    lastPayment: { amount: 2000, date: '05 Apr 2026', status: 'Paid' },
    societyFund: {
      totalBalance: 184500,
      collected: 250000,
      spent: 65500,
      lastExpense: { remark: 'Street Light Repair', amount: 8500, date: '10 Apr 2026' },
    },
    announcements: [
      { id: 1, text: 'Summer Fest on 20th May', type: 'event' },
      { id: 2, text: 'Water Supply Shutdown Tonight', type: 'alert' },
      { id: 3, text: 'Committee Meeting on 15th May', type: 'info' },
    ],
    recentPayments: [
      { id: 1, date: '02 May 2026', desc: 'Maintenance Fee', amount: 2400, status: 'Pending', txnId: null },
      { id: 2, date: '05 Apr 2026', desc: 'Maintenance Fee', amount: 2000, status: 'Paid', txnId: 'RZP8A2K9X' },
      { id: 3, date: '15 Mar 2026', desc: 'Electricity Charges', amount: 1500, status: 'Paid', txnId: 'RZP3M1L7Z' },
    ],
  };
};

// ─── Maintenance ──────────────────────────────────────────────────────────────
export const getMaintenanceDue = async (plotId) => {
  await simulateNetwork(500, 900);
  // Real: GET /api/maintenance/due?plotId=...
  return [
    { id: 1, monthYear: 'May 2026', amount: 2000, lateCharge: 200, gst: 200, isPending: true },
    { id: 2, monthYear: 'Apr 2026', amount: 2000, lateCharge: 0, gst: 180, isPending: false },
    { id: 3, monthYear: 'Mar 2026', amount: 2000, lateCharge: 0, gst: 180, isPending: false },
    { id: 4, monthYear: 'Feb 2026', amount: 2000, lateCharge: 100, gst: 189, isPending: false },
    { id: 5, monthYear: 'Jan 2026', amount: 2000, lateCharge: 0, gst: 180, isPending: false },
  ];
};

// ─── Payments & Receipt ───────────────────────────────────────────────────────
export const getPaymentHistory = async (plotId) => {
  await simulateNetwork(500, 900);
  return [
    {
      id: 1, date: '02 May 2026', desc: 'Maintenance Fee', amount: 2400,
      status: 'Pending', txnId: null, plotNo: 'B-204', plotType: 'MU',
      months: [], receiptId: null,
    },
    {
      id: 2, date: '05 Apr 2026', desc: 'Maintenance Fee', amount: 2000,
      status: 'Paid', txnId: 'RZP8A2K9X', plotNo: 'B-204', plotType: 'MU',
      months: ['Apr 2026'], receiptId: 'RCPT-2026-00142',
    },
    {
      id: 3, date: '15 Mar 2026', desc: 'Electricity Charges', amount: 1500,
      status: 'Paid', txnId: 'RZP3M1L7Z', plotNo: 'B-204', plotType: 'MU',
      months: [], receiptId: 'RCPT-2026-00131',
    },
    {
      id: 4, date: '05 Mar 2026', desc: 'Maintenance Fee', amount: 2000,
      status: 'Paid', txnId: 'RZPQ4R2T8', plotNo: 'C-101', plotType: 'LIG',
      months: ['Mar 2026'], receiptId: 'RCPT-2026-00128',
    },
    {
      id: 5, date: '12 Feb 2026', desc: 'Water Tax', amount: 800,
      status: 'Paid', txnId: 'RZP9N5W2A', plotNo: 'B-204', plotType: 'MU',
      months: [], receiptId: 'RCPT-2026-00119',
    },
  ];
};

// ─── Razorpay ─────────────────────────────────────────────────────────────────
export const createRazorpayOrder = async (amount, plotId, months) => {
  await simulateNetwork(700, 1200);
  return {
    orderId: `order_${Math.random().toString(36).substr(2, 14)}`,
    key: 'rzp_test_YOUR_KEY_HERE',
    amount: amount * 100,
    currency: 'INR',
  };
};

export const verifyPayment = async (paymentId, orderId, signature, plotId, months) => {
  await simulateNetwork(500, 900);
  const receiptId = `RCPT-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const txnId = paymentId || `RZP${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  return {
    success: true,
    txnId,
    receiptId,
    receipt: {
      receiptId,
      txnId,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: 0, // will be set by caller
      plotNo: '',
      plotType: '',
      society: 'Sunrise Apartments',
      months,
      paidBy: 'Rohit Kapoor',
      mode: 'UPI',
    },
  };
};

// ─── Society Fund (visible to all, editable by admin) ─────────────────────────
export const getSocietyFund = async () => {
  await simulateNetwork(400, 700);
  return {
    totalBalance: 184500,
    collected: 250000,
    spent: 65500,
    expenses: [
      { id: 'e1', amount: 8500, remark: 'Street Light Repair', date: '10 Apr 2026', billUrl: null },
      { id: 'e2', amount: 12000, remark: 'Garden Maintenance', date: '28 Mar 2026', billUrl: null },
      { id: 'e3', amount: 22000, remark: 'Security Guard Salary', date: '01 Mar 2026', billUrl: null },
      { id: 'e4', amount: 15000, remark: 'Water Tank Cleaning', date: '15 Feb 2026', billUrl: null },
      { id: 'e5', amount: 8000, remark: 'CCTV Camera Repair', date: '02 Feb 2026', billUrl: null },
    ],
  };
};

// ─── Admin: Add Expense ───────────────────────────────────────────────────────
export const addExpense = async ({ amount, remark, date, billPhoto }) => {
  await simulateNetwork(800, 1300);
  // Real: POST /api/admin/expense (multipart/form-data with billPhoto)
  return {
    success: true,
    expense: {
      id: `e${Date.now()}`,
      amount: Number(amount),
      remark,
      date,
      billUrl: billPhoto ? 'https://example.com/bill.jpg' : null,
    },
  };
};
