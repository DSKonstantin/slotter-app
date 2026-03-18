import * as Yup from "yup";

const parseTimeToMinutes = (value?: string) => {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
};

const dayTemplateSchema = Yup.object()
  .shape({
    isEnabled: Yup.boolean().required().default(false),
    startAt: Yup.string()
      .default("")
      .when("isEnabled", {
        is: true,
        then: (schema) => schema.required("Укажите время начала"),
      }),
    endAt: Yup.string()
      .default("")
      .when("isEnabled", {
        is: true,
        then: (schema) => schema.required("Укажите время окончания"),
      }),
    breaks: Yup.array()
      .of(
        Yup.object().shape({
          start: Yup.string().required(),
          end: Yup.string().required(),
        }),
      )
      .required()
      .default([]),
  })
  .test(
    "template-time-range",
    "Время окончания должно быть позже времени начала",
    (value) => {
      if (!value?.isEnabled || !value?.startAt || !value?.endAt) return true;
      const start = parseTimeToMinutes(value.startAt);
      const end = parseTimeToMinutes(value.endAt);
      if (start === null || end === null) return false;
      return end > start;
    },
  );

export const ScheduleTemplateSchema = Yup.object().shape({
  days: Yup.array()
    .of(dayTemplateSchema)
    .required()
    .default(
      Array.from({ length: 7 }, () => ({
        isEnabled: false,
        startAt: "",
        endAt: "",
        breaks: [],
      })),
    ),
});

export type DayTemplateFormValues = Yup.InferType<typeof dayTemplateSchema>;
export type ScheduleTemplateFormValues = Yup.InferType<
  typeof ScheduleTemplateSchema
>;
