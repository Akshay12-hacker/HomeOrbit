export const pickFirst = (
  ...values
) => {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
  );
};