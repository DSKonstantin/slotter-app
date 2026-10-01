import { parseISO } from "date-fns";
import { DAY_ID_BY_INDEX, days } from "@/src/constants/days";

export type DayId = (typeof days)[number]["id"];

export type FixedTimeMode = "fixed" | "weekly";

export type BookingFixedTimeSettings = {
  enabled: boolean;
  mode: FixedTimeMode;
  interval: number;
  fixedTimes: number[];
  days: DayId[];
  dayTimes: Partial<Record<DayId, number[]>>;
};

export type TimeRange = {
  start: number;
  end: number;
};

export const MIN_UNAVAILABLE_MINUTES = 5;

const MINUTES_IN_HOUR = 60;

export const getFitMinutes = (interval: number) =>
  Math.min(interval, MINUTES_IN_HOUR);

export const isOnInterval = (time: number, interval: number) =>
  time % (interval > MINUTES_IN_HOUR ? MINUTES_IN_HOUR : interval) === 0;

export const getOnlineWindows = (
  settings: BookingFixedTimeSettings,
  date: string,
): TimeRange[] | null => {
  if (!settings.enabled) return null;

  let times = settings.fixedTimes;
  if (settings.mode === "weekly") {
    const dayId = DAY_ID_BY_INDEX[parseISO(date).getDay()];
    if (!settings.days.includes(dayId)) return [];
    times = settings.dayTimes[dayId] ?? [];
  }
  if (times.length === 0) return null;

  const sorted = [...times].sort((a, b) => a - b);
  return sorted.map((time, index) => ({
    start: time,
    end: Math.min(time + settings.interval, sorted[index + 1] ?? Infinity),
  }));
};

export const getTimesOutsideHours = (
  settings: BookingFixedTimeSettings,
  date: string,
  hours: TimeRange,
): number[] => {
  const windows = getOnlineWindows(settings, date);
  if (!windows) return [];
  return windows
    .filter(
      (w) =>
        w.start < hours.start ||
        w.start + getFitMinutes(settings.interval) > hours.end,
    )
    .map((w) => w.start);
};

export const subtractRanges = (
  ranges: TimeRange[],
  cuts: TimeRange[],
): TimeRange[] =>
  cuts.reduce<TimeRange[]>(
    (acc, cut) =>
      acc.flatMap((range) => {
        if (cut.end <= range.start || cut.start >= range.end) return [range];
        const parts: TimeRange[] = [];
        if (cut.start > range.start)
          parts.push({ start: range.start, end: cut.start });
        if (cut.end < range.end) parts.push({ start: cut.end, end: range.end });
        return parts;
      }),
    ranges,
  );

export const getUnavailableRanges = (
  freeRanges: TimeRange[],
  windows: TimeRange[],
  notBefore?: number,
): TimeRange[] => {
  const cuts =
    notBefore !== undefined
      ? [...windows, { start: 0, end: notBefore }]
      : windows;
  return subtractRanges(freeRanges, cuts).filter(
    (range) => range.end - range.start >= MIN_UNAVAILABLE_MINUTES,
  );
};
