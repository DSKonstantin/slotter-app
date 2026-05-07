export const DEFAULT_SCHEDULE_START = new Date(2000, 0, 1, 9, 0);
export const DEFAULT_SCHEDULE_END = new Date(2000, 0, 1, 18, 0);

export const CALENDAR_VIEW_OPTIONS = [
  { label: "День", value: "day" },
  { label: "Месяц", value: "month" },
];

export type CalendarParams = {
  mode?: "day" | "month";
  date?: string;
  workingDayId?: string;
};
