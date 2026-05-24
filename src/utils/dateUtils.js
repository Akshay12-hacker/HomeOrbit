export const formatDate = (
  value
) => {
  if (!value) return null;

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
};

export const getDaysRemaining = (
  value
) => {
  if (!value) return null;

  const expiry = new Date(value);

  if (
    Number.isNaN(expiry.getTime())
  ) {
    return null;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  expiry.setHours(
    23,
    59,
    59,
    999
  );

  return Math.ceil(
    (expiry.getTime() -
      today.getTime()) /
      (24 * 60 * 60 * 1000)
  );
};