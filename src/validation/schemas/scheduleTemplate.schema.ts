import * as Yup from "yup";

const dayTemplateSchema = Yup.object().shape({
  isEnabled: Yup.boolean().required().default(false),
  startAt: Yup.string().default(""),
  endAt: Yup.string().default(""),
  breaks: Yup.array()
    .of(
      Yup.object().shape({
        start: Yup.string().required(),
        end: Yup.string().required(),
      }),
    )
    .required()
    .default([]),
});

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
