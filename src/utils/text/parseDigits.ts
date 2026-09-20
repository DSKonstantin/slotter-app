export const parseDigits = (text: string): number | undefined => {
  const digits = text.replace(/\D/g, "");
  return digits ? Number(digits) : undefined;
};
