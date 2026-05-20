import API, { getGlobalProfile, getGlobalSocietyId } from '../apiClient';
import { withApiError } from '../apiError';

const pickFirst = (...values) => values.find((value) => (
  value !== undefined && value !== null && String(value).trim() !== ''
));

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDaysRemaining = (value) => {
  if (!value) return null;
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(23, 59, 59, 999);

  return Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const normalizeActivePlan = (payload) => {
  const root = payload?.data ?? payload?.result ?? payload?.subscription ?? payload?.plan ?? payload;
  const data = Array.isArray(root) ? root[0] : root;
  if (!data || typeof data !== 'object') return null;
  const config = data.subscriptionConfig ?? data.SubscriptionConfig ?? data.config ?? data.Config ?? {};

  const subscriptionId = pickFirst(
    data.subscriptionId,
    data.SubscriptionId,
    data.planId,
    data.PlanId,
    data.subscriptionConfigId,
    data.SubscriptionConfigId,
    config.subscriptionId,
    config.SubscriptionId,
    config.planId,
    config.PlanId,
    config.subscriptionConfigId,
    config.SubscriptionConfigId,
    data.id,
    data.Id,
    config.id,
    config.Id
  );
  const planTitle = pickFirst(
    data.subscriptionName,
    data.SubscriptionName,
    data.planName,
    data.PlanName,
    data.name,
    data.Name,
    data.title,
    data.Title,
    config.subscriptionName,
    config.SubscriptionName,
    config.planName,
    config.PlanName,
    config.name,
    config.Name,
    config.title,
    config.Title
  );
  const amount = Number(pickFirst(
    data.subscriptionAmount,
    data.SubscriptionAmount,
    data.amountPaid,
    data.AmountPaid,
    data.amount,
    data.Amount,
    data.price,
    data.Price,
    config.subscriptionAmount,
    config.SubscriptionAmount,
    config.amount,
    config.Amount,
    config.price,
    config.Price,
    0
  ));
  const status = pickFirst(data.status, data.Status, data.subscriptionStatus, data.SubscriptionStatus, config.status, config.Status);
  const noOfDays = pickFirst(data.noOfDays, data.NoOfDays, data.days, data.Days, config.noOfDays, config.NoOfDays);
  const startDate = pickFirst(
    data.startDate,
    data.StartDate,
    data.subscriptionStartDate,
    data.SubscriptionStartDate,
    config.startDate,
    config.StartDate,
    config.subscriptionStartDate,
    config.SubscriptionStartDate,
    data.createdAt,
    data.CreatedAt,
    config.createdAt,
    config.CreatedAt
  );
  const expiryDate = pickFirst(
    data.expiryDate,
    data.ExpiryDate,
    data.endDate,
    data.EndDate,
    data.validTill,
    data.ValidTill,
    data.subscriptionEndDate,
    data.SubscriptionEndDate,
    config.expiryDate,
    config.ExpiryDate,
    config.endDate,
    config.EndDate,
    config.validTill,
    config.ValidTill,
    config.subscriptionEndDate,
    config.SubscriptionEndDate
  );

  if (!subscriptionId && !planTitle) return null;
  const daysRemaining = getDaysRemaining(expiryDate);

  return {
    ...data,
    planId: subscriptionId === undefined || subscriptionId === null ? null : String(subscriptionId),
    subscriptionId,
    planTitle: planTitle ? String(planTitle) : 'Active Plan',
    amount: Number.isFinite(amount) ? amount : 0,
    status: status ? String(status) : 'Active',
    noOfDays,
    startDate,
    expiryDate,
    startDateText: normalizeDate(startDate),
    expiryDateText: normalizeDate(expiryDate),
    daysRemaining,
    isExpiringSoon: Number.isFinite(daysRemaining) && daysRemaining <= 7,
    isActive: true,
  };
};

const resolveSocietyId = (societyId) => {
  const profile = getGlobalProfile() || {};
  return pickFirst(
    societyId,
    profile.societyId,
    profile.SocietyId,
    profile.society?.id,
    profile.Society?.Id,
    getGlobalSocietyId()
  );
};

export const getCurrentActivePlan = async (societyId) => {
  const resolvedSocietyId = resolveSocietyId(societyId);
  if (!resolvedSocietyId) return null;

  try {
    const response = await API.get(`/SocietySubscription/current-active-plan/${resolvedSocietyId}`);
    return normalizeActivePlan(response.data);
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw withApiError(error, 'Unable to fetch current active subscription plan.');
  }
};
