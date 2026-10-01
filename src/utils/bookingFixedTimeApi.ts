import type {
  BookingFixedTimeApi,
  BookingFixedTimeInterval,
} from "@/src/store/redux/services/api-types";
import { formatMinutes, parseTime } from "@/src/utils/date/formatTime";
import type {
  BookingFixedTimeSettings,
  DayId,
} from "@/src/utils/bookingFixedTime";

export const FIXED_TIME_INTERVALS: {
  key: BookingFixedTimeInterval;
  minutes: number;
}[] = [
  { key: "five_minutes", minutes: 5 },
  { key: "ten_minutes", minutes: 10 },
  { key: "fifteen_minutes", minutes: 15 },
  { key: "thirty_minutes", minutes: 30 },
  { key: "one_hour", minutes: 60 },
];

const DEFAULT_INTERVAL_MINUTES = 30;

export const DEFAULT_BOOKING_FIXED_TIME: BookingFixedTimeSettings = {
  enabled: false,
  mode: "fixed",
  interval: DEFAULT_INTERVAL_MINUTES,
  fixedTimes: [],
  days: [],
  dayTimes: {},
};

const intervalToMinutes = (key: BookingFixedTimeInterval) =>
  FIXED_TIME_INTERVALS.find((i) => i.key === key)?.minutes ??
  DEFAULT_INTERVAL_MINUTES;

const intervalToKey = (minutes: number): BookingFixedTimeInterval =>
  FIXED_TIME_INTERVALS.find((i) => i.minutes === minutes)?.key ??
  "thirty_minutes";

const sortedTimes = (times: string[] | undefined) =>
  (times ?? []).map(parseTime).sort((a, b) => a - b);

export const bookingFixedTimeFromApi = (
  api: BookingFixedTimeApi | undefined,
): BookingFixedTimeSettings => {
  if (!api) return DEFAULT_BOOKING_FIXED_TIME;
  const dayTimes: BookingFixedTimeSettings["dayTimes"] = {};
  (Object.keys(api.day_times ?? {}) as DayId[]).forEach((day) => {
    dayTimes[day] = sortedTimes(api.day_times[day]);
  });
  return {
    enabled: api.enabled,
    mode: api.mode,
    interval: intervalToMinutes(api.interval),
    fixedTimes: sortedTimes(api.fixed_times),
    days: api.days ?? [],
    dayTimes,
  };
};

export const bookingFixedTimeToApi = (
  settings: BookingFixedTimeSettings,
): BookingFixedTimeApi => ({
  enabled: settings.enabled,
  mode: settings.mode,
  interval: intervalToKey(settings.interval),
  fixed_times: settings.fixedTimes.map(formatMinutes),
  days: settings.days,
  day_times: Object.fromEntries(
    (Object.keys(settings.dayTimes) as DayId[]).map((day) => [
      day,
      (settings.dayTimes[day] ?? []).map(formatMinutes),
    ]),
  ),
});
