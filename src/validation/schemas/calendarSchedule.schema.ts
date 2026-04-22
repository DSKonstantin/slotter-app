import * as Yup from "yup";
import { parseTimeToMinutes } from "@/src/validation/utils/parseTimeToMinutes";

export const calendarScheduleModes = ["bulk", "perDay"] as const;

export type CalendarScheduleMode = (typeof calendarScheduleModes)[number];

const hasValidTimeRange = (scheduleStart?: string, scheduleEnd?: string) => {
  if (!scheduleStart || !scheduleEnd) return true;

  const start = parseTimeToMinutes(scheduleStart);
  const end = parseTimeToMinutes(scheduleEnd);

  if (start === null || end === null) return false;

  return end > start;
};

const hasValidBreaks = (
  breaks: { start: string; end: string }[] = [],
  scheduleStart?: string,
  scheduleEnd?: string,
) => {
  if (breaks.length === 0) return true;
  if (!scheduleStart || !scheduleEnd) return true;

  const dayStart = parseTimeToMinutes(scheduleStart);
  const dayEnd = parseTimeToMinutes(scheduleEnd);

  if (dayStart === null || dayEnd === null || dayEnd <= dayStart) return false;

  const normalizedBreaks = breaks
    .map((item) => ({
      start: parseTimeToMinutes(item.start),
      end: parseTimeToMinutes(item.end),
    }))
    .sort((left, right) => (left.start ?? 0) - (right.start ?? 0));

  return normalizedBreaks.every((item, index) => {
    if (item.start === null || item.end === null) return false;
    if (item.end <= item.start) return false;
    if (item.start < dayStart || item.end > dayEnd) return false;

    const previous = normalizedBreaks[index - 1];
    if (!previous || previous.end === null) return true;

    return item.start >= previous.end;
  });
};

const breakSchema = Yup.object().shape({
  start: Yup.string().required(),
  end: Yup.string().required(),
});

const scheduleDraftSchema = Yup.object()
  .shape({
    scheduleStart: Yup.string().when("$mode", {
      is: "bulk",
      then: (schema) => schema.required("Обязательное поле"),
      otherwise: (schema) => schema.default(""),
    }),
    scheduleEnd: Yup.string().when("$mode", {
      is: "bulk",
      then: (schema) => schema.required("Обязательное поле"),
      otherwise: (schema) => schema.default(""),
    }),
    breaks: Yup.array().of(breakSchema).required().default([]),
  })
  .test(
    "draft-time-range",
    "Время окончания должно быть позже времени начала",
    (value) => hasValidTimeRange(value?.scheduleStart, value?.scheduleEnd),
  )
  .test("draft-breaks", "Проверьте перерывы", (value) =>
    hasValidBreaks(value?.breaks, value?.scheduleStart, value?.scheduleEnd),
  );

const calendarDaySchema = Yup.object()
  .shape({
    date: Yup.string().required(),
    workingDayId: Yup.number().optional(),
    isExisting: Yup.boolean().required().default(false),
    isSelected: Yup.boolean().required().default(false),
    scheduleStart: Yup.string().when(["isSelected", "isExisting"], {
      is: (isSelected: boolean, isExisting: boolean) =>
        isSelected && !isExisting,
      then: (schema) => schema.required("Обязательное поле"),
      otherwise: (schema) => schema.default(""),
    }),
    scheduleEnd: Yup.string().when(["isSelected", "isExisting"], {
      is: (isSelected: boolean, isExisting: boolean) =>
        isSelected && !isExisting,
      then: (schema) => schema.required("Обязательное поле"),
      otherwise: (schema) => schema.default(""),
    }),
    breaks: Yup.array().of(breakSchema).required().default([]),
  })
  .default({
    date: "",
    workingDayId: undefined,
    isExisting: false,
    isSelected: false,
    scheduleStart: "",
    scheduleEnd: "",
    breaks: [],
  });

const getSelectedEditableDays = (
  days?: {
    isExisting?: boolean;
    isSelected?: boolean;
    scheduleStart?: string;
    scheduleEnd?: string;
    breaks?: { start: string; end: string }[];
  }[],
) => (days ?? []).filter((day) => day.isSelected && !day.isExisting);

export const CalendarScheduleSchema = Yup.object()
  .shape({
    mode: Yup.mixed<CalendarScheduleMode>()
      .oneOf(calendarScheduleModes)
      .required()
      .default("bulk"),
    commonDraft: scheduleDraftSchema.required().default({
      scheduleStart: "",
      scheduleEnd: "",
      breaks: [],
    }),
    calendarDays: Yup.array().of(calendarDaySchema).required().default([]),
  })
  .test(
    "per-day-time-range",
    "Время окончания должно быть позже времени начала",
    (value) =>
      value?.mode !== "perDay" ||
      getSelectedEditableDays(value?.calendarDays).every((day) =>
        hasValidTimeRange(day.scheduleStart, day.scheduleEnd),
      ),
  )
  .test(
    "per-day-breaks",
    "Проверьте перерывы",
    (value) =>
      value?.mode !== "perDay" ||
      getSelectedEditableDays(value?.calendarDays).every((day) =>
        hasValidBreaks(day.breaks, day.scheduleStart, day.scheduleEnd),
      ),
  )
  .test(
    "unique-days",
    "Даты не должны повторяться",
    (value) =>
      new Set((value?.calendarDays ?? []).map((day) => day.date)).size ===
      (value?.calendarDays ?? []).length,
  );

export type CalendarScheduleFormValues = Yup.InferType<
  typeof CalendarScheduleSchema
>;

export type CalendarScheduleBreak = Yup.InferType<typeof breakSchema>;
export type CalendarScheduleDraftValues = Yup.InferType<
  typeof scheduleDraftSchema
>;
export type CalendarScheduleDayValues = Yup.InferType<typeof calendarDaySchema>;
