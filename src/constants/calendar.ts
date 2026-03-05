export const CALENDAR_VIEW_OPTIONS = [
  { label: "День", value: "day" },
  { label: "Месяц", value: "month" },
];

export type CalendarParams = {
  mode?: "day" | "month";
  date?: string;
  workingDayId?: string;
};
