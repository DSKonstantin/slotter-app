export type MinuteRange = { startMinutes: number; endMinutes: number };

type BuildMinuteOptionsParams = {
  start: number;
  end: number;
  step?: number;
  exclude?: MinuteRange[];
};

export const buildMinuteOptions = ({
  start,
  end,
  step = 5,
  exclude = [],
}: BuildMinuteOptionsParams): number[] => {
  const options: number[] = [];
  const firstAligned = Math.ceil(start / step) * step;
  if (start % step !== 0) options.push(start);
  for (let t = firstAligned; t <= end; t += step) options.push(t);

  return options.filter(
    (t) => !exclude.some((r) => t >= r.startMinutes && t < r.endMinutes),
  );
};

/** Every minute of a full day, 5-minute step — shared by all unconstrained
 * (non-schedule) time/duration pickers. */
export const FULL_DAY_MINUTE_OPTIONS = buildMinuteOptions({
  start: 0,
  end: 1439,
  step: 5,
});
