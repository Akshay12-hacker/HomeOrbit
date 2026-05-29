import API, { getGlobalSocietyId } from '../apiClient';
import { withApiError } from '../apiError';

/**
 * Fetches expense history for a society.
 * Endpoint: GET /Expense/{societyId}/history
 * Params: pageNumber, pageSize, fromDate, toDate
 */
export const getExpenseHistory = async (societyId, options = {}) => {
  const resolvedSocietyId = societyId || getGlobalSocietyId() || 1;
  const {
    pageNumber = 1,
    pageSize = 10,
    fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Start of current month
    toDate = new Date().toISOString().split('T')[0], // Today
  } = options;

  try {
    const response = await API.get(`/Expense/${resolvedSocietyId}/history`, {
      params: {
        pageNumber,
        pageSize,
        fromDate,
        toDate,
      },
    });

    // The API returns an object containing an 'expenses' array
    const data = response.data;
    let items = data?.expenses || (Array.isArray(data) ? data : []);
    const totalCount = data?.totalCount || items.length;
    
    // Mapping helper for payment modes (String to Number)
    const mapPaymentMode = (mode) => {
      if (typeof mode === 'number') return mode;
      if (!mode) return 1;
      const m = String(mode).toLowerCase().replace(/\s/g, '');
      if (m === 'cash') return 1;
      if (m === 'upi') return 2;
      if (m === 'banktransfer') return 3;
      if (m === 'cheque') return 4;
      return 1;
    };

    const mappedItems = items.map((item) => ({
      id: String(item.expenseId || item.id),
      remark: item.remark || 'Expense',
      amount: Number(item.paymentAmount || item.amount || 0),
      date: item.paymentDate || item.date || '',
      mode: mapPaymentMode(item.paymentMode || item.mode),
      imageUrl: item.imageUrl,
      societyId: item.societyId,
    }));

    // Sort items by date descending (Newest first)
    mappedItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      items: mappedItems,
      totalCount,
      pageNumber: Number(data?.pageNumber || pageNumber),
      pageSize: Number(data?.pageSize || pageSize),
    };
  } catch (error) {
    throw withApiError(error, 'Unable to fetch expense history.');
  }
};
