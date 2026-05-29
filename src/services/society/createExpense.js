import API, { getGlobalSocietyId } from '../apiClient';
import { withApiError } from '../apiError';

/**
 * Creates a new society expense.
 * 
 * Request Body:
 * {
 *  "SocietyId": 1,
 *  "PaymentAmount": 100,
 *  "PaymentDate": "2026-05-26",
 *  "Remark": "OK",
 *  "ImageUrl": "abc.png",
 *  "PaymentMode": 1
 * }
 */
export const createExpense = async (payload) => {
  try {
    const body = {
      SocietyId: Number(payload.societyId || getGlobalSocietyId() || 1),
      PaymentAmount: Number(payload.paymentAmount),
      PaymentDate: payload.paymentDate,
      Remark: payload.remark,
      ImageUrl: payload.imageUrl || 'abc.png',
      PaymentMode: Number(payload.paymentMode),
    };

    const response = await API.post('/Expense', body);
    return response.data;
  } catch (error) {
    throw withApiError(error, 'Unable to log society expense.');
  }
};
