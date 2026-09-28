import { days } from "@/src/constants/days";

export type FixedTimeMode = "fixed" | "weekly";

export type DayId = (typeof days)[number]["id"];

export type BookingFixedTimeFormValues = {
  mode: FixedTimeMode;
  interval: number;
  fixedTimes: number[];
  days: DayId[];
  dayTimes: Partial<Record<DayId, number[]>>;
};

export const MODE_OPTIONS: { label: string; value: FixedTimeMode }[] = [
  { label: "Фиксированное", value: "fixed" },
  { label: "По дням недели", value: "weekly" },
];

export const INTERVAL_OPTIONS = [5, 10, 15, 30, 60];

export const MOCK_WORKING_DAY = {
  start: "10:00",
  end: "20:00",
  breakStart: "13:30",
  breakEnd: "14:30",
};

export const MOCK_DEFAULT_VALUES: BookingFixedTimeFormValues = {
  mode: "fixed",
  interval: 30,
  fixedTimes: [690, 780, 900, 1080, 1170],
  days: ["mon", "tue", "wed", "thu", "fri"],
  dayTimes: {
    mon: [630, 750, 780, 870, 900],
  },
};
