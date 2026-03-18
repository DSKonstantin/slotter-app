/**
 * Returns the correct Russian word form based on count.
 * @param count - the number
 * @param forms - [one, few, many] e.g. ["день", "дня", "дней"]
 */
export const pluralize = (
  count: number,
  forms: [string, string, string],
): string => {
  const abs = Math.abs(count) % 100;
  const mod10 = abs % 10;

  if (abs > 10 && abs < 20) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
};
