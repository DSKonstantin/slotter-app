import { days } from "@/src/constants/days";
import {
  formatMinutes,
  parseEndOfDayMinutes,
  parseTime,
} from "@/src/utils/date/formatTime";
import type { TimeRange } from "@/src/utils/bookingFixedTime";
import type { WorkingDay } from "@/src/store/redux/services/api-types";
import type { ScheduleTemplateFormValues } from "@/src/validation/schemas/scheduleTemplate.schema";
import type { BookingFixedTimeFormValues, DayId } from "./constants";

export type GridItem = { value: number; label: string; muted?: boolean };

export type WorkingRanges = {
  all: TimeRange;
  byDay: Partial<Record<DayId, TimeRange>>;
};

export const FALLBACK_RANGE: TimeRange = { start: 480, end: 1320 };

export const EMPTY_TIMES: number[] = [];

export const buildGrid = (interval: number, range: TimeRange) => {
  const times: number[] = [];
  const first = Math.ceil(range.start / interval) * interval;
  for (let t = first; t + interval <= range.end; t += interval) times.push(t);
  return times;
};

export const buildGridItems = (
  interval: number,
  range: TimeRange,
  selected: number[],
): GridItem[] => {
  const grid = buildGrid(interval, range);
  const gridSet = new Set(grid);
  const outside = selected.filter((t) => !gridSet.has(t));
  return [
    ...grid.map((t) => ({ value: t, label: formatMinutes(t) })),
    ...outside.map((t) => ({ value: t, label: formatMinutes(t), muted: true })),
  ].sort((a, b) => a.value - b.value);
};

export const getTemplateRanges = (
  templateDays: ScheduleTemplateFormValues["days"],
): WorkingRanges["byDay"] => {
  const byDay: WorkingRanges["byDay"] = {};
  templateDays.forEach((day, index) => {
    if (!day.isEnabled || !day.startAt || !day.endAt) return;
    const range = {
      start: parseTime(day.startAt),
      end: parseEndOfDayMinutes(day.endAt),
    };
    if (range.end > range.start) byDay[days[index].id] = range;
  });
  return byDay;
};

const mergeRanges = (a: TimeRange | null, b: TimeRange): TimeRange =>
  a ? { start: Math.min(a.start, b.start), end: Math.max(a.end, b.end) } : b;

export const getWorkingRanges = (
  workingDays: WorkingDay[],
  templateByDay: WorkingRanges["byDay"] = {},
): WorkingRanges => {
  let all: TimeRange | null = null;

  workingDays.forEach((wd) => {
    all = mergeRanges(all, {
      start: parseTime(wd.start_at),
      end: parseEndOfDayMinutes(wd.end_at),
    });
  });

  if (!all) {
    Object.values(templateByDay).forEach((range) => {
      all = mergeRanges(all, range);
    });
  }

  return { all: all ?? FALLBACK_RANGE, byDay: templateByDay };
};

export const getDayRange = (ranges: WorkingRanges, day: DayId): TimeRange =>
  ranges.byDay[day] ?? ranges.all;

export const getDaySource = (
  ranges: WorkingRanges,
  day: DayId,
): "template" | "common" => (ranges.byDay[day] ? "template" : "common");

export const toggleItem = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

export const sortMinutes = (times: number[]) =>
  [...times].sort((a, b) => a - b);

export const isOnInterval = (time: number, interval: number) =>
  time % interval === 0;

type TimeLists = Pick<BookingFixedTimeFormValues, "fixedTimes" | "dayTimes">;

export const collectOffGridTimes = (values: TimeLists, interval: number) => {
  const all = [...values.fixedTimes, ...Object.values(values.dayTimes).flat()];
  return sortMinutes([
    ...new Set(all.filter((time) => !isOnInterval(time, interval))),
  ]);
};

export const dropOffGridTimes = (
  values: TimeLists,
  interval: number,
): TimeLists => ({
  fixedTimes: values.fixedTimes.filter((time) => isOnInterval(time, interval)),
  dayTimes: Object.fromEntries(
    (Object.keys(values.dayTimes) as DayId[]).map((day) => [
      day,
      (values.dayTimes[day] ?? EMPTY_TIMES).filter((time) =>
        isOnInterval(time, interval),
      ),
    ]),
  ),
});
