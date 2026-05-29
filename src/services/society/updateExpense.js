import API, { getGlobalSocietyId } from '../apiClient';
import { withApiError } from '../apiError';

/**
 * Updates an existing society expense.
 * Endpoint: PUT /Expense/{societyId}/{expenseId}
 * 
 * Request Body:
 * {
 *  "ExpenseId": 1,
 *  "SocietyId": 1,
 *  "PaymentAmount": 50,
 *  "PaymentDate": "2026-05-21",
 *  "Remark": "Test",
 *  "ImageUrl": "bcd.png"
 * }
 */
export const updateExpense = async (payload) => {
  const societyId = Number(payload.societyId || getGlobalSocietyId() || 1);
  const expenseId = Number(payload.expenseId);

  if (!expenseId) {
    throw new Error('Expense ID is required for updating.');
  }

  try {
    const body = {
      ExpenseId: expenseId,
      SocietyId: societyId,
      PaymentAmount: Number(payload.paymentAmount),
      PaymentDate: payload.paymentDate,
      Remark: payload.remark,
      ImageUrl: payload.imageUrl,
      PaymentMode: Number(payload.paymentMode || 1),
    };

    // Use PUT for updates as per REST conventions and the comment above
    const response = await API.put(`/Expense/${societyId}/${expenseId}`, body);
    return response.data;
  } catch (error) {
    throw withApiError(error, 'Unable to update society expense.');
  }
};
