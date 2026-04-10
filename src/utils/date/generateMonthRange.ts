/**
 * Returns an array of month strings ("YYYY-MM") for every month
 * between dateFrom and dateTo (inclusive), plus extraFutureMonths ahead.
 */
export const generateMonthRange = (
  dateFrom: string,
  dateTo: string,
  extraFutureMonths = 2,
): string[] => {
  const months: string[] = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  start.setDate(1);
  end.setDate(1);
  end.setMonth(end.getMonth() + extraFutureMonths);
  const cursor = new Date(start);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};
