import * as Yup from "yup";
import {
  isEndAfterStart,
  areBreaksValid,
  breakSchema,
  breaksField,
  withEndAfterStart,
  EMPTY_WORKING_HOURS,
} from "@/src/validation/utils/timeRange";

export const calendarScheduleModes = ["bulk", "perDay"] as const;

export type CalendarScheduleMode = (typeof calendarScheduleModes)[number];

const scheduleDraftSchema = Yup.object().shape({
  startAt: Yup.string().when("$mode", {
    is: "bulk",
    then: (schema) => schema.required("Обязательное поле"),
    otherwise: (schema) => schema.default(""),
  }),
  endAt: withEndAfterStart(
    Yup.string().when("$mode", {
      is: "bulk",
      then: (schema) => schema.required("Обязательное поле"),
      otherwise: (schema) => schema.default(""),
    }),
  ),
  breaks: breaksField(),
});

const calendarDaySchema = Yup.object()
  .shape({
    date: Yup.string().required(),
    workingDayId: Yup.number().optional(),
    isExisting: Yup.boolean().required().default(false),
    isSelected: Yup.boolean().required().default(false),
    startAt: Yup.string().when(["isSelected", "isExisting"], {
      is: (isSelected: boolean, isExisting: boolean) =>
        isSelected && !isExisting,
      then: (schema) => schema.required("Обязательное поле"),
      otherwise: (schema) => schema.default(""),
    }),
    endAt: Yup.string().when(["isSelected", "isExisting"], {
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
    ...EMPTY_WORKING_HOURS,
  });

const getSelectedEditableDays = (
  days?: {
    isExisting?: boolean;
    isSelected?: boolean;
    startAt?: string;
    endAt?: string;
    breaks?: { start: string; end: string }[];
  }[],
) => (days ?? []).filter((day) => day.isSelected && !day.isExisting);

export const CalendarScheduleSchema = Yup.object()
  .shape({
    mode: Yup.mixed<CalendarScheduleMode>()
      .oneOf(calendarScheduleModes)
      .required()
      .default("bulk"),
    commonDraft: scheduleDraftSchema
      .required()
      .default({ ...EMPTY_WORKING_HOURS }),
    calendarDays: Yup.array().of(calendarDaySchema).required().default([]),
  })
  .test(
    "per-day-time-range",
    "Время окончания должно быть позже времени начала",
    (value) =>
      value?.mode !== "perDay" ||
      getSelectedEditableDays(value?.calendarDays).every((day) =>
        isEndAfterStart(day.startAt, day.endAt),
      ),
  )
  .test(
    "per-day-breaks",
    "Проверьте перерывы",
    (value) =>
      value?.mode !== "perDay" ||
      getSelectedEditableDays(value?.calendarDays).every((day) =>
        areBreaksValid(day.breaks, day.startAt, day.endAt),
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
