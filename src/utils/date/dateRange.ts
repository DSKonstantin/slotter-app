export type DateRange = { from: string; to: string };

export type RangeEndpoints = { start: string | null; end: string | null };

export const toRangeEndpoints = (range?: DateRange | null): RangeEndpoints => ({
  start: range?.from ?? null,
  end: range && range.to !== range.from ? range.to : null,
});

export const endpointsToRange = ({
  start,
  end,
}: RangeEndpoints): DateRange | undefined =>
  start == null ? undefined : { from: start, to: end ?? start };

export const rangeToDatePair = (
  range?: DateRange | null,
): [Date, Date] | null =>
  range?.from ? [new Date(range.from), new Date(range.to || range.from)] : null;

export const setRangeEndpoint = (
  range: DateRange | undefined,
  which: "from" | "to",
  date: string,
): DateRange => {
  const from = range?.from ?? null;
  const to = range?.to ?? null;

  if (which === "from") {
    return to && date > to
      ? { from: date, to: date }
      : { from: date, to: to ?? date };
  }
  return from && date < from
    ? { from: date, to: from }
    : { from: from ?? date, to: date };
};

export const toggleRangeDay = (
  { start, end }: RangeEndpoints,
  date: string,
): RangeEndpoints => {
  if (end && date === end) return { start, end: null };
  if (start && date === start) return { start: null, end: null };
  if (!start || end) return { start: date, end: null };
  return date < start ? { start: date, end: start } : { start, end: date };
};
