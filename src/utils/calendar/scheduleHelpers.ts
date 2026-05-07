import { addDays, endOfMonth, getDate, startOfMonth } from "date-fns";

import { formatApiDate } from "@/src/utils/date/formatDate";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
import type { WorkingDay } from "@/src/store/redux/services/api-types";
import type {
  CalendarScheduleBreak,
  CalendarScheduleDayValues,
  CalendarScheduleDraftValues,
  CalendarScheduleFormValues,
} from "@/src/validation/schemas/calendarSchedule.schema";

const getDateKey = (date: Date) => formatApiDate(date);

export const createEmptyCalendarDay = (
  date: string,
): CalendarScheduleDayValues => ({
  date,
  workingDayId: undefined,
  isExisting: false,
  isSelected: false,
  startAt: "",
  endAt: "",
  breaks: [],
});

export const createExistingCalendarDay = (
  date: string,
  workingDay: WorkingDay,
): CalendarScheduleDayValues => ({
  date,
  workingDayId: workingDay.id,
  isExisting: true,
  isSelected: false,
  startAt: formatTimeFromISO(workingDay.start_at),
  endAt: formatTimeFromISO(workingDay.end_at),
  breaks: (workingDay.working_day_breaks ?? []).map((item) => ({
    start: formatTimeFromISO(item.start_at),
    end: formatTimeFromISO(item.end_at),
  })),
});

export const buildFormValues = (
  current: Date,
  workingDaysData?: Record<string, WorkingDay | null>,
): CalendarScheduleFormValues => {
  const start = startOfMonth(current);
  const end = endOfMonth(start);

  return {
    mode: "bulk",
    commonDraft: { startAt: "", endAt: "", breaks: [] },
    calendarDays: Array.from({ length: getDate(end) }, (_, index) => {
      const date = addDays(start, index);
      const key = getDateKey(date);
      const workingDay = workingDaysData?.[key] ?? null;
      return workingDay
        ? createExistingCalendarDay(key, workingDay)
        : createEmptyCalendarDay(key);
    }),
  };
};

export const cloneBreaks = (
  breaks: CalendarScheduleBreak[] = [],
): CalendarScheduleBreak[] =>
  breaks.map((item) => ({ start: item.start, end: item.end }));

export const createDraftFromDay = (
  day?: Pick<
    CalendarScheduleDayValues,
    "startAt" | "endAt" | "breaks"
  >,
): CalendarScheduleDraftValues => ({
  startAt: day?.startAt ?? "",
  endAt: day?.endAt ?? "",
  breaks: cloneBreaks(day?.breaks),
});

export const areSameBreaks = (
  left: CalendarScheduleBreak[] = [],
  right: CalendarScheduleBreak[] = [],
) =>
  left.length === right.length &&
  left.every(
    (item, index) =>
      item.start === right[index]?.start && item.end === right[index]?.end,
  );

export const areSameCalendarDays = (
  left: CalendarScheduleDayValues[],
  right: CalendarScheduleDayValues[],
) =>
  left.length === right.length &&
  left.every(
    (item, index) =>
      item.date === right[index]?.date &&
      item.workingDayId === right[index]?.workingDayId &&
      item.isExisting === right[index]?.isExisting &&
      item.isSelected === right[index]?.isSelected &&
      item.startAt === right[index]?.startAt &&
      item.endAt === right[index]?.endAt &&
      areSameBreaks(item.breaks, right[index]?.breaks),
  );

export const applyDraftToDay = (
  day: CalendarScheduleDayValues,
  draft: CalendarScheduleDraftValues,
): CalendarScheduleDayValues => ({
  ...day,
  isSelected: true,
  startAt: draft.startAt,
  endAt: draft.endAt,
  breaks: cloneBreaks(draft.breaks),
});

export const clearSelectedDay = (
  day: CalendarScheduleDayValues,
): CalendarScheduleDayValues =>
  day.isExisting
    ? { ...day, isSelected: false }
    : {
        ...day,
        isSelected: false,
        startAt: "",
        endAt: "",
        breaks: [],
      };

export const areUniformDays = (days: CalendarScheduleDayValues[]) =>
  days.length <= 1 ||
  days.every(
    (day) =>
      day.startAt === days[0]?.startAt &&
      day.endAt === days[0]?.endAt &&
      areSameBreaks(day.breaks, days[0]?.breaks),
  );

export const getScheduleTimeLabel = (day: CalendarScheduleDayValues) =>
  `${day.startAt} - ${day.endAt}`;
