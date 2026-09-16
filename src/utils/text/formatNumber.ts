export const formatNumber = (value: number, locale = "ru-RU"): string =>
  value.toLocaleString(locale);
