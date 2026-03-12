const RUBLES_IN_RUBLE_CENTS = 100;
const DEFAULT_PRICE_LOCALE = "ru-RU";

export const centsToRubles = (cents: number) => {
  return cents / RUBLES_IN_RUBLE_CENTS;
};

export const rublesToCents = (rubles: number) => {
  return Math.round(rubles * RUBLES_IN_RUBLE_CENTS);
};

export const formatRubles = (
  rubles: number,
  locale: string = DEFAULT_PRICE_LOCALE,
) => {
  return rubles.toLocaleString(locale);
};

export const formatRublesWithSymbol = (
  rubles: number,
  locale: string = DEFAULT_PRICE_LOCALE,
) => {
  return `${formatRubles(rubles, locale)} ₽`;
};

export const formatRublesFromCents = (
  cents: number,
  locale: string = DEFAULT_PRICE_LOCALE,
) => {
  return formatRublesWithSymbol(centsToRubles(cents), locale);
};
